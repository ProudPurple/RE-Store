import sys
import io
sys.stderr = io.StringIO()

from fastapi import FastAPI, File, UploadFile
from diffusers import DPMSolverMultistepScheduler, AutoPipelineForInpainting
from PIL import Image
from dotenv import load_dotenv
import cv2
import torch
import os
from basicsr.archs.ddcolor_arch import DDColor
from PIL import Image
import torchvision.transforms as transforms
import numpy as np
from gfpgan import GFPGANer
from realesrgan import RealESRGANer
from basicsr.archs.rrdbnet_arch import RRDBNet
import tempfile
import cloudinary
import cloudinary.uploader
import json

sys.stderr = sys.__stderr__

load_dotenv()

app = FastAPI()
groups = []
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

GROUPS_FILE = '../frontend/RE-Store/assets/photos/groups.json'

def load_groups():
    if os.path.exists(GROUPS_FILE):
        with open(GROUPS_FILE, "r") as f:
            content = f.read()
            return json.loads(content) if content.strip() else []
    return []

def save_groups(groups):
    with open(GROUPS_FILE, "w") as f:
        json.dump(groups, f, indent=2)

def save_and_upload(img):
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, img)
        url = upload_to_cloudinary(tmp.name)
    os.unlink(tmp.name)
    return url

def store_photo(url: str):
    groups = load_groups()
    current = groups[-1] if groups else None
    if not current or len(current["photos"]) >= 8:
        current = { "photos": []}
        groups.append(current)
    current["photos"].append(url)
    save_groups(groups)

def upload_to_cloudinary(image_path: str, folder: str = "restorations") -> str:
    result = cloudinary.uploader.upload(image_path, folder=folder)
    return result["secure_url"]

def load_sharpener():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
    upsampler = RealESRGANer(
        scale=4,
        model_path="weights/RealESRGAN_x4plus.pth",
        model=model,
        tile=256,
        tile_pad=10,
        pre_pad=0,
        half=False,
        device=device,
    )

    sharpener = GFPGANer(
        model_path="weights/GFPGANv1.4.pth",
        upscale=2,
        arch="clean",
        channel_multiplier=2,
        bg_upsampler=upsampler,
        device=device
    )
    return sharpener

def load_colorizer():
    model = DDColor(
        encoder_name='convnext-l',
        decoder_name='MultiScaleColorDecoder',
        input_size=[512,512],
        num_output_channels=2,
        last_norm='Spectral',
        do_normalize=False,
        num_queries=100,
        num_scales=3,
        dec_layers=9
    )
    ckpt = torch.load('weights/ddcolor.pth', map_location='cpu', weights_only=True)
    # DDColor checkpoints are often nested under a key:
    state_dict = ckpt.get('params', ckpt.get('state_dict', ckpt))
    model.load_state_dict(state_dict, strict=False)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.eval().to(device)
    return model, device

def load_fixer():
    pipe = AutoPipelineForInpainting.from_pretrained(
        "runwayml/stable-diffusion-inpainting",
        torch_dtype=torch.float32,
        use_safetensors=True,
        variant="fp16",
    )
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe.safety_checker = None
    pipe = pipe.to("cuda")
    pipe.enable_attention_slicing()
    pipe.vae.enable_slicing()
    return pipe

def silent_load(fn):
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    sys.stdout = io.StringIO()
    sys.stderr = io.StringIO()
    try:
        result = fn()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr
    return result

pipe = silent_load(load_fixer)
colorizer, device = silent_load(load_colorizer)
sharpener = silent_load(load_sharpener)

@app.put("/run")
async def run(file: UploadFile = File(...), mask: UploadFile = File(...)):
    contents = await file.read()
    mask_contents = await mask.read()
    img = cv2.imdecode(np.frombuffer(contents, np.uint8), cv2.IMREAD_COLOR)
    mask_img = cv2.imdecode(np.frombuffer(mask_contents, np.uint8), cv2.IMREAD_GRAYSCALE)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, img)
        store_photo(upload_to_cloudinary(tmp.name))
    os.unlink(tmp.name)

    await fix_image(img, mask_img)

async def fix_image(img, mask_img):
    await colorize_image(img)
    await sharpen_image(img)
    img_resized = cv2.resize(img, (512, 512))
    mask_resized = cv2.resize(mask_img, (512, 512), interpolation=cv2.INTER_NEAREST)
    _, mask_binary = cv2.threshold(mask_resized, 127, 255, cv2.THRESH_BINARY)

    image_pil = Image.fromarray(cv2.cvtColor(img_resized, cv2.COLOR_BGR2RGB))
    mask_pil = Image.fromarray(mask_binary).convert("L")

    prompt = "high quality restored photograph, seamless reconstruction of damaged areas, realistic textures, consistent lighting, detailed face and potraits"
    negative_prompt = "blurry, distorted, artifacts, oversaturated, low quality, unrealistic, bad anatomy"

    torch.cuda.empty_cache()
    inpainted = pipe(
        prompt=prompt, negative_prompt=negative_prompt,
        image=image_pil, mask_image=mask_pil,
        num_inference_steps=10, guidance_scale=7.5
    ).images[0]

    inpainted_bgr = cv2.cvtColor(np.array(inpainted), cv2.COLOR_RGB2BGR)
    inpainted_resized = cv2.resize(inpainted_bgr, (img.shape[1], img.shape[0]))
    mask_full = cv2.resize(mask_binary, (img.shape[1], img.shape[0]), interpolation=cv2.INTER_NEAREST)
    mask_3ch = cv2.cvtColor(mask_full, cv2.COLOR_GRAY2BGR) / 255.0
    composite = (inpainted_resized.astype(np.float32) * mask_3ch + img.astype(np.float32) * (1 - mask_3ch)).astype(np.uint8)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, composite)
        store_photo(upload_to_cloudinary(tmp.name))
    
    await colorize_image(composite)
    await sharpen_image(composite)


    

async def colorize_image(img):
    orig_h, orig_w = img.shape[:2]
    input_size = 512

    # --- Preprocessing: extract L channel only ---
    img_resized = cv2.resize(img, (input_size, input_size))
    img_lab = cv2.cvtColor(img_resized, cv2.COLOR_BGR2LAB)
    l_channel = img_lab[:, :, 0]
    l_norm = l_channel.astype(np.float32) / 255.0
    l_tensor = np.stack([l_norm, l_norm, l_norm], axis=2)
    tensor = transforms.ToTensor()(l_tensor).unsqueeze(0).to(device)

    # --- Inference ---
    with torch.no_grad():
        output = colorizer(tensor)

    # --- Postprocessing: decode AB channels ---
    ab = output.squeeze(0).permute(1, 2, 0).cpu().numpy()

    # Normalize raw model output to [-1, 1] (output is unnormalized, ~[-25, 40])
    abs_max = np.abs(ab).max()
    if abs_max > 0:
        ab = ab / abs_max

    SATURATION = 0.7  # tune between 0.6–1.0 to taste
    ab = (ab * 128 * SATURATION).clip(-128, 127)
    ab_shifted = (ab + 128).clip(0, 255).astype(np.uint8)

    # Resize ab to original size
    ab_resized = cv2.resize(ab_shifted, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)

    # Rebuild LAB with original L + predicted AB
    orig_lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    orig_lab[:, :, 1] = ab_resized[:, :, 0]
    orig_lab[:, :, 2] = ab_resized[:, :, 1]

    result = cv2.cvtColor(orig_lab, cv2.COLOR_LAB2BGR)

    # --- Save & upload ---
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, result)
        store_photo(upload_to_cloudinary(tmp.name))

    os.unlink(tmp.name)


async def sharpen_image(img):
    h, w, _ = img.shape
    max_dim = 512
    original_h, original_w = h, w
    
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
    
    # Run GFPGAN enhancement
    _, _, sharpened_img = sharpener.enhance(
        img,
        has_aligned=False,
        only_center_face=False,
        paste_back=True,
        weight=0.8
    )
    
    if sharpened_img is None:
        sharpened_img = img

    # Apply unsharp mask for extra crispness
    gaussian = cv2.GaussianBlur(sharpened_img, (0, 0), 3)
    sharpened_img = cv2.addWeighted(sharpened_img, 1.3, gaussian, -0.3, 0)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, sharpened_img)
        store_photo(upload_to_cloudinary(tmp.name))
    await colorize_image(sharpened_img)
    os.unlink(tmp.name)
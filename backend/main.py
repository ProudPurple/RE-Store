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
        json.dump(groups, f)

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
        current = {"id": f"group-{len(groups) + 1}", "photos": []}
        groups.append(current)
    current["photos"].append(url)
    save_groups(groups)

def upload_to_cloudinary(image_path: str, folder: str = "restorations") -> str:
    result = cloudinary.uploader.upload(image_path, folder=folder)
    return result["secure_url"]

def load_sharpener():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(device)
    model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
    upsampler = RealESRGANer(
        scale=4,
        model_path="weights/RealESRGAN_x4plus.pth",
        model=model,
        tile=512,
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

    prompt = "high quality restored photograph, seamless reconstruction of damaged areas, realistic textures, consistent lighting, detailed"
    negative_prompt = "blurry, distorted, artifacts, oversaturated, low quality, unrealistic"

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
    # Prepare tensor for DDColor
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_pil = Image.fromarray(img_rgb).resize([1024, 1024])
    transform = transforms.Compose([transforms.ToTensor()])
    tensor = transform(img_pil).unsqueeze(0).to(device)

    # Run colorization
    with torch.no_grad():
        output = colorizer(tensor)

    # Extract UV channels
    uv = output.squeeze(0).permute(1, 2, 0).cpu().numpy()
    uv = (uv * 128).clip(-128, 127)

    # Build LAB image and replace AB channels
    img_resized = cv2.resize(img, (1024, 1024))
    img_lab = cv2.cvtColor(img_resized, cv2.COLOR_BGR2LAB)
    ab = uv.copy()
    ab[:, :, 0] = (ab[:, :, 0] + 128).clip(0, 255)
    ab[:, :, 1] = (ab[:, :, 1] + 128).clip(0, 255)
    img_lab[:, :, 1] = ab[:, :, 0].astype(np.uint8)
    img_lab[:, :, 2] = ab[:, :, 1].astype(np.uint8)

    # Convert back to BGR and blend with original
    result = cv2.cvtColor(img_lab, cv2.COLOR_LAB2BGR)
    result = cv2.addWeighted(result, 0.6, img_resized, 0.4, 0)

    # Resize back to original dimensions
    result = cv2.resize(result, (img.shape[1], img.shape[0]))

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, result)
        store_photo(upload_to_cloudinary(tmp.name))

    os.unlink(tmp.name)


async def sharpen_image(img):
    h, w, _ = img.shape

    max_dim = 1024
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
    sharpened_img = cv2.addWeighted(sharpened_img, 1.8, gaussian, -0.8, 0)

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        cv2.imwrite(tmp.name, sharpened_img)
        store_photo(upload_to_cloudinary(tmp.name))
    await colorize_image(sharpened_img)
    os.unlink(tmp.name)
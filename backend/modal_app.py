"""Free showcase deployment on Modal: `modal deploy modal_app.py` (run `npm run build:web` in the frontend first).

Serves the web app from a small CPU container that sleeps when unused, with the gallery read live
from Cloudinary. There is no GPU here, so Restore is disabled; run main.py locally to restore new photos.
"""
from pathlib import Path
import modal

HERE = Path(__file__).parent
WEB_DIR = HERE.parent / "frontend" / "RE-Store" / "dist"

app = modal.App("re-store")

web_image = (
    modal.Image.debian_slim(python_version="3.13")
    .pip_install("fastapi[standard]==0.141.1", "python-multipart==0.0.32", "cloudinary==1.46.2")
    .add_local_dir(WEB_DIR, "/root/dist")
    .add_local_python_source("web", "gallery")
)


@app.function(image=web_image, secrets=[modal.Secret.from_dotenv(HERE)], max_containers=1)
@modal.concurrent(max_inputs=50)
@modal.asgi_app()
def web():
    import gallery
    from web import create_app
    gallery.configure()
    return create_app(None, lambda: gallery.load_groups(max_age=60), "/root/dist")

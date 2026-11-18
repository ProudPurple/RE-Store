import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse

def create_app(start_run, load_groups, web_dir: str) -> FastAPI:
    """API + exported web app. `start_run(image_bytes, mask_bytes)` kicks off a restoration;
    pass None for a showcase-only deployment with no GPU."""
    app = FastAPI()
    web_dir = os.path.abspath(web_dir)

    # Sync handlers run in a threadpool, so /groups polling keeps answering during a local run
    @app.put("/run")
    def run(file: UploadFile = File(...), mask: UploadFile = File(...)):
        if start_run is None:
            raise HTTPException(status_code=503, detail="Restoring is disabled in this demo")
        start_run(file.file.read(), mask.file.read())

    @app.get("/config")
    def config():
        return {"restoreEnabled": start_run is not None}

    @app.get("/groups")
    def get_groups():
        return load_groups()

    # Serve the exported web app (npm run build:web) so the same URL works as a browser demo
    # Bundles under _expo/ and assets/ have content hashes in their names, so they can be cached forever.
    # Everything else must revalidate, or browsers keep serving an old index.html that loads an old bundle.
    @app.get("/{path:path}")
    def web_app(path: str):
        file_path = os.path.abspath(os.path.join(web_dir, path))
        if not (file_path.startswith(web_dir) and os.path.isfile(file_path)):
            file_path = os.path.join(web_dir, "index.html")
        hashed = path.startswith(("_expo/", "assets/"))
        cache = "public, max-age=31536000, immutable" if hashed else "no-cache"
        return FileResponse(file_path, headers={"Cache-Control": cache})

    return app

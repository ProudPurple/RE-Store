"""Cloudinary is the gallery: each upload is labeled with its restoration run and step,
so groups can be rebuilt from Cloudinary alone."""
import os
import time
import cloudinary
import cloudinary.api
import cloudinary.uploader

FOLDER = "restorations"
_cache = {"at": 0.0, "groups": []}

def configure():
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET")
    )

def upload(image_path: str, run_id: str, step: int) -> str:
    result = cloudinary.uploader.upload(image_path, folder=FOLDER, context={"run": run_id, "step": step})
    return result["secure_url"]

def fetch_groups():
    resources, cursor = [], None
    while True:
        page = cloudinary.api.resources(type="upload", prefix=FOLDER + "/", context=True, max_results=500, next_cursor=cursor)
        resources += page["resources"]
        cursor = page.get("next_cursor")
        if not cursor:
            break

    # Unlabeled uploads (old test runs) are skipped
    runs = {}
    for res in resources:
        ctx = res.get("context", {}).get("custom", {})
        if "run" in ctx and "step" in ctx:
            runs.setdefault(ctx["run"], []).append(res)

    groups = []
    for photos in sorted(runs.values(), key=lambda ps: min(p["created_at"] for p in ps)):
        photos.sort(key=lambda p: int(p["context"]["custom"]["step"]))
        groups.append({"photos": [p["secure_url"] for p in photos]})
    return groups

def load_groups(max_age: float = 10):
    # The viewer polls every few seconds; caching keeps us under Cloudinary's Admin API rate limit
    if time.time() - _cache["at"] > max_age:
        _cache["groups"] = fetch_groups()
        _cache["at"] = time.time()
    return _cache["groups"]

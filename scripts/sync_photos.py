#!/usr/bin/env python3
"""Add stub entries to photos.json for any images in photos/ not already listed."""

import json
import os
import sys

PHOTOS_DIR = "photos"
PHOTOS_JSON = "photos.json"
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def main():
    with open(PHOTOS_JSON) as f:
        photos = json.load(f)

    known = {p["file"] for p in photos}

    added = []
    for fname in sorted(os.listdir(PHOTOS_DIR)):
        _, ext = os.path.splitext(fname)
        if ext.lower() not in IMAGE_EXTS:
            continue
        file_path = f"{PHOTOS_DIR}/{fname}"
        if file_path in known:
            continue
        stub_id = os.path.splitext(fname)[0]
        photos.append({"id": stub_id, "file": file_path, "tags": []})
        added.append(file_path)

    if not added:
        print("photos.json already up to date")
        return

    with open(PHOTOS_JSON, "w") as f:
        json.dump(photos, f, indent=2)
        f.write("\n")

    for path in added:
        print(f"added: {path}")
    print(f"{len(added)} stub(s) added — fill in tags in photos.json")


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[0]))))
    main()

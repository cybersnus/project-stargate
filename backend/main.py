from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import random
import json
from pathlib import Path

app = FastAPI(title="Remote Viewing Training API")

# CORS for frontend - allow all origins for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Shapes for Zener card mode
SHAPES = ["circle", "square", "star", "waves", "cross"]

def generate_random_coordinate():
    """Generate a completely random coordinate anywhere on Earth."""
    lat = round(random.uniform(-90, 90), 4)
    lng = round(random.uniform(-180, 180), 4)
    return lat, lng


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/api/targets/shape")
def get_shape_target():
    """Get a random shape for Zener card mode."""
    target = random.choice(SHAPES)
    session_id = f"SHP-{random.randint(10000, 99999)}"
    return {
        "session_id": session_id,
        "target": target,
        "options": SHAPES
    }


@app.get("/api/targets/images")
def get_image_targets():
    """Get 4 random images from Lorem Picsum."""
    session_id = f"IMG-{random.randint(10000, 99999)}"
    # Generate 4 unique random seeds for Lorem Picsum
    seeds = random.sample(range(1, 1000), 4)
    target_index = random.randint(0, 3)

    images = [
        {
            "id": i,
            "url": f"https://picsum.photos/seed/{seed}/400/300",
            "seed": seed
        }
        for i, seed in enumerate(seeds)
    ]

    return {
        "session_id": session_id,
        "images": images,
        "target_index": target_index,
        "target_seed": seeds[target_index]
    }


@app.get("/api/targets/location")
def get_location_target():
    """Get a random location for coordinate viewing mode."""
    lat, lng = generate_random_coordinate()
    session_id = f"LOC-{random.randint(10000, 99999)}"

    zoom = 12
    return {
        "session_id": session_id,
        "coords": {"lat": lat, "lng": lng},
        "coords_display": f"{abs(lat):.4f}°{'N' if lat >= 0 else 'S'}, {abs(lng):.4f}°{'E' if lng >= 0 else 'W'}",
        "reveal": {
            "map_url": f"https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map={zoom}/{lat}/{lng}"
        }
    }


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

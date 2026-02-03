import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data"

# Database
DATABASE_PATH = DATA_DIR / "valentine.db"

# Rate limiting
RATE_LIMIT_PAGES_PER_HOUR = int(os.getenv("RATE_LIMIT_PAGES_PER_HOUR", "10"))
RATE_LIMIT_SLUG_CHECKS_PER_MINUTE = int(os.getenv("RATE_LIMIT_SLUG_CHECKS_PER_MINUTE", "60"))

# Slug validation
MIN_SLUG_LENGTH = 3
MAX_SLUG_LENGTH = 50
SLUG_PATTERN = r"^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$"

# Reserved slugs
RESERVED_SLUGS = {
    "admin", "api", "static", "assets", "create", "edit", "delete",
    "login", "logout", "signup", "settings", "profile", "dashboard",
    "help", "about", "contact", "terms", "privacy", "404", "500",
}

# Templates
TEMPLATES = {
    "classic": {
        "id": "classic",
        "name": "Classic Love",
        "description": "Timeless romantic design with elegant typography",
        "primary_color": "#e91e63",
        "secondary_color": "#fce4ec",
        "font": "Pacifico",
    },
    "modern": {
        "id": "modern",
        "name": "Modern Romance",
        "description": "Clean and contemporary with subtle gradients",
        "primary_color": "#9c27b0",
        "secondary_color": "#f3e5f5",
        "font": "Nunito",
    },
    "playful": {
        "id": "playful",
        "name": "Playful Hearts",
        "description": "Fun and vibrant with animated elements",
        "primary_color": "#f44336",
        "secondary_color": "#ffebee",
        "font": "Caveat",
    },
    "elegant": {
        "id": "elegant",
        "name": "Elegant Script",
        "description": "Sophisticated design with script typography",
        "primary_color": "#880e4f",
        "secondary_color": "#fce4ec",
        "font": "Pacifico",
    },
}

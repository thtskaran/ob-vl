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
        "interactive": False,
    },
    "modern": {
        "id": "modern",
        "name": "Modern Romance",
        "description": "Clean and contemporary with subtle gradients",
        "primary_color": "#9c27b0",
        "secondary_color": "#f3e5f5",
        "font": "Nunito",
        "interactive": False,
    },
    "playful": {
        "id": "playful",
        "name": "Playful Hearts",
        "description": "Fun and vibrant with animated elements",
        "primary_color": "#f44336",
        "secondary_color": "#ffebee",
        "font": "Caveat",
        "interactive": False,
    },
    "elegant": {
        "id": "elegant",
        "name": "Elegant Script",
        "description": "Sophisticated design with script typography",
        "primary_color": "#880e4f",
        "secondary_color": "#fce4ec",
        "font": "Pacifico",
        "interactive": False,
    },
    "proposal": {
        "id": "proposal",
        "name": "Will You Be Mine?",
        "description": "Interactive proposal with playful Yes/No buttons - No runs away!",
        "primary_color": "#ec4899",
        "secondary_color": "#fdf2f8",
        "font": "Pacifico",
        "interactive": True,
    },
    "envelope": {
        "id": "envelope",
        "name": "Love Letter",
        "description": "Beautiful 3D envelope that opens to reveal your message",
        "primary_color": "#be185d",
        "secondary_color": "#fff1f2",
        "font": "Caveat",
        "interactive": True,
    },
    "scratch": {
        "id": "scratch",
        "name": "Scratch Card",
        "description": "Scratch away hearts to reveal a hidden surprise message",
        "primary_color": "#db2777",
        "secondary_color": "#fce7f3",
        "font": "Nunito",
        "interactive": True,
    },
    "countdown": {
        "id": "countdown",
        "name": "Countdown Reveal",
        "description": "Animated countdown timer that reveals your message dramatically",
        "primary_color": "#e11d48",
        "secondary_color": "#ffe4e6",
        "font": "Pacifico",
        "interactive": True,
    },
}

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

try:
    import certifi
except ImportError:
    certifi = None


def load_env(root: Path) -> None:
    load_dotenv(root / ".env")


def supabase_url() -> str:
    return (os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or "").strip()


def service_role_key() -> str:
    return (os.getenv("SUPABASE_SERVICE_ROLE_KEY") or "").strip()


def create_service_client() -> Client:
    url = supabase_url()
    key = service_role_key()
    if not url:
        raise RuntimeError(
            "Missing Supabase URL. Set SUPABASE_URL or VITE_SUPABASE_URL in .env "
            "(no spaces around =)."
        )
    if not key:
        raise RuntimeError(
            "Missing SUPABASE_SERVICE_ROLE_KEY in .env.\n"
            "VITE_SUPABASE_ANON_KEY is the public browser key and cannot write courses.\n"
            "In the Supabase dashboard: Project Settings → API → service_role (secret).\n"
            "Add this line to .env (never prefix it with VITE_):\n"
            "  SUPABASE_SERVICE_ROLE_KEY=your_service_role_secret\n"
            "Use that key only for sync.py. Never put it in frontend code."
        )
    if certifi is not None:
        os.environ.setdefault("SSL_CERT_FILE", certifi.where())
        os.environ.setdefault("REQUESTS_CA_BUNDLE", certifi.where())
    return create_client(url, key)

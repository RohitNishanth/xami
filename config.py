# app/core/config.py
import os
import logging
from dotenv import load_dotenv
from tortoise import Tortoise
from pathlib import Path

from app.core.aws_secrets import get_aws_secret

logger = logging.getLogger(__name__)

"""
Configuration module.

- Local (ENVIRONMENT=local): DB and JWT values are read from the .env file.
- Non-local: DB and JWT values are read from AWS Secrets Manager, with .env
  as fallback. Set AWS_REGION and AWS_SECRETS_DB_AND_JWT; the secret must be
  a JSON object with keys: DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT,
  JWT_SECRET_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SENDER_MAIL_ID.
"""

# Load environment variables from .env file
load_dotenv()

# Local: use .env only. Non-local: use AWS Secrets Manager, with .env as fallback.
_is_local = os.getenv("ENVIRONMENT", "").strip().lower() == "local"
logger.info("[CONFIG] ENVIRONMENT=%s => _is_local=%s", os.getenv("ENVIRONMENT"), _is_local)

aws_secrets = None if _is_local else get_aws_secret()
if not _is_local:
    logger.info("[CONFIG] aws_secrets loaded: %s", aws_secrets is not None)
    if aws_secrets:
        logger.info("[CONFIG] aws_secrets keys: %s", list(aws_secrets.keys()))
    else:
        logger.warning("[CONFIG] aws_secrets is None — all SMTP/DB config will be None!")

# SECRET_KEY: from .env when local, else from AWS secret with .env fallback.
SECRET_KEY = (
    os.getenv("SECRET_KEY")
    if _is_local
    else ((aws_secrets.get("SECRET_KEY") if aws_secrets else None))
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 1 day
REFRESH_TOKEN_EXPIRE_MINUTES = 7200  # 5 days

# Define the upload directory path
# UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "frontend", "public", "uploads")
UPLOAD_DIR = "uploads"
# Optional: You can define other configurations here, like allowed file types, etc.
ALLOWED_FILE_TYPES = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"]

# DB credentials: from .env when local, else from AWS secret with .env fallback.
db_name = os.getenv("DB_NAME") if _is_local else ((aws_secrets.get("DB_NAME") if aws_secrets else None))
db_user = os.getenv("DB_USER") if _is_local else ((aws_secrets.get("DB_USER") if aws_secrets else None))
db_pass = os.getenv("DB_PASS") if _is_local else ((aws_secrets.get("DB_PASS") if aws_secrets else None))
db_port = os.getenv("DB_PORT") if _is_local else ((aws_secrets.get("DB_PORT") if aws_secrets else None))
db_host = os.getenv("DB_HOST") if _is_local else ((aws_secrets.get("DB_HOST") if aws_secrets else None))
# Fetch table prefix
TABLE_PREFIX = os.getenv("TABLE_PREFIX", "")

# SMTP: from .env when local, else from AWS secret with .env fallback.
smtp_host = os.getenv("SMTP_HOST") if _is_local else ((aws_secrets.get("SMTP_HOST") if aws_secrets else None))
smtp_port = os.getenv("SMTP_PORT") if _is_local else ((aws_secrets.get("SMTP_PORT") if aws_secrets else None))
smtp_user = os.getenv("SMTP_USER") if _is_local else ((aws_secrets.get("SMTP_USER") if aws_secrets else None))
smtp_password = os.getenv("SMTP_PASS") if _is_local else ((aws_secrets.get("SMTP_PASS") if aws_secrets else None))
sender_mail_id = os.getenv("SENDER_MAIL_ID") if _is_local else ((aws_secrets.get("SENDER_MAIL_ID") if aws_secrets else None))

logger.info("[CONFIG] SMTP config resolved — smtp_host=%s, smtp_port=%s, smtp_user=%s, smtp_password=%s, sender_mail_id=%s",
            smtp_host, smtp_port, smtp_user,
            '****' if smtp_password else None, sender_mail_id)


# Generate models dynamically from the 'app/models' directory
models_path = (Path(__file__).resolve().parent.parent / "models").resolve()
model_files = [f.stem for f in models_path.glob('*.py') if f.stem != '__init__']
models_list = [f"app.models.{model}" for model in model_files]

TORTOISE_ORM = {
    'connections': {
        'default': {
            'engine': 'tortoise.backends.mysql',
            'credentials': {
                'host': db_host,
                'port': 3306,
                'user': "root",
                'password': db_pass,
                'database': db_name,
                'charset': 'utf8mb4',
            }
        }
    },
    'apps': {
        'models': {
            'models': models_list,
            'default_connection': 'default',
        },
    }
}


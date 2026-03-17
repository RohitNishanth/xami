import json
import logging
import os
from typing import Any, Dict, Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger(__name__)


def get_aws_secret() -> Optional[Dict[str, Any]]:
    """
    Fetch and parse a JSON secret from AWS Secrets Manager.

    The following environment variables are used:
    - AWS_REGION: AWS region where the secret is stored.
    - AWS_SECRETS_DB_AND_JWT: Secret name or ARN.

    Returns:
        A dictionary with the parsed secret values, or None if
        the secret cannot be loaded for any reason.
    """
    region_name = os.getenv("AWS_REGION")
    secret_name = os.getenv("AWS_SECRETS_DB_AND_JWT")

    logger.info("[AWS_SECRETS] Attempting to load secrets — AWS_REGION=%s, AWS_SECRETS_DB_AND_JWT=%s",
                region_name, secret_name)

    if not region_name or not secret_name:
        logger.warning("[AWS_SECRETS] Missing env vars — AWS_REGION=%s, AWS_SECRETS_DB_AND_JWT=%s. Returning None.",
                       region_name, secret_name)
        return None

    try:
        client = boto3.client("secretsmanager", region_name=region_name)
        response = client.get_secret_value(SecretId=secret_name)
        logger.info("[AWS_SECRETS] Successfully fetched secret from AWS Secrets Manager.")
    except (BotoCoreError, ClientError) as e:
        logger.warning(
            "[AWS_SECRETS] AWS Secrets Manager could not be read: %s. Using env/fallback credentials.",
            e,
        )
        return None

    secret_string = response.get("SecretString")
    if not secret_string:
        logger.warning("[AWS_SECRETS] AWS secret has no SecretString (e.g. binary secret). Using env fallback.")
        return None

    try:
        parsed: Dict[str, Any] = json.loads(secret_string)
    except json.JSONDecodeError as e:
        logger.warning("[AWS_SECRETS] AWS secret value is not valid JSON: %s. Using env fallback.", e)
        return None

    if not isinstance(parsed, dict):
        logger.warning("[AWS_SECRETS] Parsed secret is not a dict. Returning None.")
        return None

    logger.info("[AWS_SECRETS] Secret parsed successfully. Keys present: %s", list(parsed.keys()))
    return parsed

from datetime import datetime
from decimal import Decimal, InvalidOperation, ROUND_UP
from fastapi import HTTPException, status
import logging
import math
import os
import asyncio
from aiosmtplib import send
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from pytz import timezone
from app.models.deal import Deal
from app.core.config import smtp_host, smtp_port, smtp_user, smtp_password, sender_mail_id
import copy
from fastapi.encoders import jsonable_encoder

logger = logging.getLogger(__name__)

import boto3
from botocore.exceptions import ClientError

# Optional SES configuration
AWS_SES_REGION = os.getenv("AWS_REGION", "us-east-1")
# Resolve SES sender here (local from .env, non-local from AWS Secrets Manager via config)
from app.core.config import _is_local, aws_secrets
SENDER_SES_EMAIL = os.getenv("SENDER_MAIL_ID") if _is_local else ((aws_secrets.get("SENDER_SES_EMAIL") if aws_secrets else None))

USE_SES_EMAIL = bool(SENDER_SES_EMAIL)  # Use SES only when value is present/non-empty

logger.info("[EMAIL] Module init — _is_local=%s, AWS_SES_REGION=%s, SENDER_SES_EMAIL=%s, USE_SES_EMAIL=%s",
            _is_local, AWS_SES_REGION, SENDER_SES_EMAIL, USE_SES_EMAIL)

def format_datetime_field(datetime_str: str, format: str = "%m/%d/%Y %H:%M:%S", target_timezone: str = "America/Los_Angeles") -> str:
    """
    Converts an ISO 8601 datetime string to the specified format in the target timezone.

    :param datetime_str: The datetime string in ISO 8601 format.
    :param format: The desired output format (default is '%m/%d/%Y %H:%M:%S').
    :param target_timezone: The target timezone for conversion (default is 'America/Los_Angeles' for PST/PDT).
    :return: Formatted datetime string.
    """
    try:
        # Parse the input ISO 8601 datetime string
        dt = datetime.fromisoformat(datetime_str)

        # Convert to the target timezone
        target_tz = timezone(target_timezone)
        dt_pst = dt.astimezone(target_tz)

        # Format the datetime in the target timezone
        return dt_pst.strftime(format)
    except ValueError as e:
        raise ValueError(f"Invalid datetime string: {datetime_str}. Error: {e}")

    
async def send_email(to_email: str, subject: str, body: str, image_paths: dict):
    """
    Send an email with the given subject and body to the specified email.
    By default uses SMTP settings from config (.env / AWS Secrets), but can
    optionally use Amazon SES (raw email) when USE_SES_EMAIL=1 is set.
    """
    logger.info("[EMAIL] send_email called — to=%s, subject=%s", to_email, subject)
    logger.info("[EMAIL] Email path: %s", "SES" if USE_SES_EMAIL else "SMTP")
    logger.info("[EMAIL] SENDER_SES_EMAIL=%s, sender_mail_id=%s", SENDER_SES_EMAIL, sender_mail_id)
    logger.info("[EMAIL] SMTP config — host=%s, port=%s, user=%s, password=%s",
                smtp_host, smtp_port, smtp_user, '****' if smtp_password else None)

    msg = MIMEMultipart("related")
    from_address = SENDER_SES_EMAIL if USE_SES_EMAIL else (sender_mail_id or "")
    msg["From"] = from_address
    msg["To"] = to_email
    msg["Subject"] = subject
    logger.info("[EMAIL] From=%s, To=%s", from_address, to_email)

    # Attach the HTML body content
    msg.attach(MIMEText(body, "html"))  # Specify "html" to send HTML content

    # Attach each image and set a unique Content-ID for each
    for image_name, image_path in (image_paths or {}).items():
        logger.info("[EMAIL] Attaching image: %s -> %s", image_name, image_path)
        with open(image_path, "rb") as image_file:
            image = MIMEImage(image_file.read(), name=os.path.basename(image_path))
            image_cid = f"{image_name}"  # Unique CID for each image
            image.add_header("Content-ID", f"<{image_cid}>")
            msg.attach(image)

    # If configured, send via Amazon SES using raw email (keeps current MIME structure)
    if USE_SES_EMAIL:
        logger.info("[EMAIL] Sending via SES — region=%s, source=%s", AWS_SES_REGION, SENDER_SES_EMAIL)
        try:
            ses_client = boto3.client("ses", region_name=AWS_SES_REGION)
            # boto3 is synchronous, run it in a thread to avoid blocking the event loop
            await asyncio.to_thread(
                ses_client.send_raw_email,
                Source=SENDER_SES_EMAIL,
                Destinations=[to_email],
                RawMessage={"Data": msg.as_string()},
            )
            logger.info("[EMAIL] SES send SUCCESS — to=%s", to_email)
        except ClientError as e:
            logger.error("[EMAIL] SES ClientError — %s", e.response['Error'].get('Message', str(e)))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email via SES: {e.response['Error'].get('Message', str(e))}",
            )
        except Exception as e:
            logger.error("[EMAIL] SES unexpected error — %s", str(e), exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send email via SES: {str(e)}",
            )
        return

    # Fallback / default: existing SMTP behavior (unchanged workflow)
    logger.info("[EMAIL] Sending via SMTP — host=%s, port=%s, user=%s", smtp_host, smtp_port, smtp_user)
    if not smtp_host:
        logger.error("[EMAIL] SMTP host is None/empty — email will fail!")
    if not smtp_user:
        logger.error("[EMAIL] SMTP user is None/empty — email will fail!")
    if not smtp_password:
        logger.error("[EMAIL] SMTP password is None/empty — email will fail!")
    try:
        port = int(smtp_port) if smtp_port else 587
        logger.info("[EMAIL] SMTP connecting to %s:%d with TLS...", smtp_host, port)
        await send(
            msg,
            hostname=smtp_host,
            port=port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True,  # Use TLS for security; ensure your server supports it
        )
        logger.info("[EMAIL] SMTP send SUCCESS — to=%s", to_email)
    except Exception as e:
        logger.error("[EMAIL] SMTP send FAILED — error: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )

def format_date_field(datetime_str: str, format: str = "%m/%d/%Y") -> str:
    """
    Converts an ISO 8601 datetime string to the specified format in the target timezone.

    :param datetime_str: The datetime string in ISO 8601 format.
    :param format: The desired output format (default is '%m/%d/%Y').
    """
    try:
        # Parse the input ISO 8601 datetime string
        dt = datetime.fromisoformat(datetime_str)

        # Format the datetime in the target timezone
        return dt.strftime(format)
    except ValueError as e:
        raise ValueError(f"Invalid datetime string: {datetime_str}. Error: {e}")
    
def get_float_values(value):
    try:
        if value:
            return float(value)
        else:
            return 0
    except (ValueError, TypeError):
        return 0


def us_number_format(value, min_dec: int = 0, max_dec: int = 0) -> str:
    """
    Backend equivalent of frontend USNumberFormat.
    
    - Treats "-" or "." as 0
    - Uses US thousands separator
    - Shows negatives in parentheses, e.g. (45,000)
    - If min_dec == -1, allows up to 16 decimals (full precision)
    """
    if value in ("-", "."):
        return "0"
    
    try:
        num = float(value) if value is not None else 0.0
    except (ValueError, TypeError):
        num = 0.0
    
    if min_dec == -1:
        min_dec = 0
        max_dec = 16
    
    abs_val = abs(num)
    # Format with max_dec decimals, then trim trailing zeros down to min_dec
    fmt = f"{{:,.{max_dec}f}}"
    txt = fmt.format(abs_val)
    if max_dec > min_dec:
        # Trim trailing zeros while keeping at least min_dec decimal places
        int_part, dot, frac = txt.partition(".")
        if dot:
            frac = frac.rstrip("0")
            if len(frac) < min_dec:
                frac = frac.ljust(min_dec, "0")
            if frac:
                txt = f"{int_part}.{frac}"
            else:
                txt = int_part
    
    if num < 0:
        return f"({txt})"
    return txt


def format_usd(amount, min_dec: int = 2, max_dec: int = 2) -> str:
    """
    Backend equivalent of frontend formatUSD.
    
    - Handles B / M suffixes for billions / millions
    - Uses US thousands separators
    - Shows negatives in parentheses, e.g. ($ 1,234.56)
    """
    try:
        amt = float(amount) if amount is not None else 0.0
    except (ValueError, TypeError):
        amt = 0.0
    
    abs_amt = abs(amt)
    
    # Billions
    if abs_amt >= 1_000_000_000:
        billion_value = abs_amt / 1_000_000_000
        formatted = f"{billion_value:.0f}" if billion_value.is_integer() else f"{billion_value:.2f}"
        if amt < 0:
            return f"($ {formatted}B)"
        return f"$ {formatted}B"
    
    # Millions
    if abs_amt >= 1_000_000:
        million_value = abs_amt / 1_000_000
        formatted = f"{million_value:.0f}" if million_value.is_integer() else f"{million_value:.2f}"
        if amt < 0:
            return f"($ {formatted}M)"
        return f"$ {formatted}M"
    
    # Standard dollars
    fmt = f"{{:,.{max_dec}f}}"
    txt = fmt.format(abs_amt)
    if max_dec > min_dec:
        int_part, dot, frac = txt.partition(".")
        if dot:
            frac = frac.rstrip("0")
            if len(frac) < min_dec:
                frac = frac.ljust(min_dec, "0")
            if frac:
                txt = f"{int_part}.{frac}"
            else:
                txt = int_part
    if amt < 0:
        return f"($ {txt})"
    return f"$ {txt}"


def parse_contract_duration(value, default: Decimal | None = None) -> Decimal:
    """
    Safely parse contract duration values (which may be strings, numbers, or None)
    into a Decimal representation.
    """
    if value in (None, "", "null"):
        return default if default is not None else Decimal("0")
    if isinstance(value, Decimal):
        return value
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        if default is not None:
            return default
        raise


def normalize_contract_duration(value) -> str:
    """
    Normalize contract duration to a canonical string representation while preserving decimals.
    """
    duration = parse_contract_duration(value)
    d = Decimal(duration)
    
    if duration == duration.to_integral():
        return str(duration.to_integral())
    
    return format(d, "f")


def contract_duration_to_int(value, max_duration: int = 30) -> int:
    """
    Convert a contract duration value to an integer number of years (ceiling).
    Used for loops or range calculations that require whole numbers.
    Examples: 4.01 -> 5, 4.0 -> 4, 3.99 -> 4
    
    Args:
        value: Contract duration value (string, int, float, Decimal, or None)
        max_duration: Maximum allowed contract duration (default: 30 years)
    
    Returns:
        int: Contract duration rounded up and clamped between 1 and max_duration
    """
    try:
        duration = parse_contract_duration(value, default=Decimal("1"))
        # Use math.ceil to ensure proper upper bound rounding (e.g., 4.01 -> 5)
        duration_int = math.ceil(float(duration))
        # Clamp duration between 1 and max_duration
        return max(1, min(duration_int, max_duration))
    except (ValueError, TypeError, InvalidOperation):
        return 1
    
async def get_contract_years(deal_id):
    dealDetail = await Deal.get_or_none(id= deal_id)
    contract_begins = datetime.strptime(str(dealDetail.contract_begins), "%Y-%m-%d")
    contract_expire = datetime.strptime(str(dealDetail.contract_expires), "%Y-%m-%d")

    contract_years = list(range(contract_begins.year, int(contract_expire.year)))
    duration_years = contract_duration_to_int(dealDetail.contract_duration)
    contract_years = [contract_begins.year + i for i in range(duration_years)]
    return contract_begins, contract_years

async def get_year_range(start_date, duration):
    contract_begins = datetime.strptime(str(start_date), "%Y-%m-%d")
    duration_years = contract_duration_to_int(duration)
    contract_years = [contract_begins.year + i for i in range(duration_years)]
    return contract_years


def transform_dict_keys_to_year_ranges(data: dict, year_mapping: dict) -> dict:
    """
    Transform dictionary keys from calendar years to contract year ranges.
    
    Args:
        data: Dictionary with calendar year keys (e.g., {'2025': 100, '2026': 200})
        year_mapping: Mapping from calendar years to year ranges
    
    Returns:
        Dictionary with year range keys (e.g., {'2025-2026': 100, '2026-2027': 200})
    """
    if not isinstance(data, dict):
        return data
    
    transformed = {}
    for key, value in data.items():
        # Check if key is a year that should be transformed
        if key in year_mapping:
            new_key = year_mapping[key]
            transformed[new_key] = value
        else:
            # Keep non-year keys as-is (e.g., 'base', 'row_total', '8oz', etc.)
            transformed[key] = value
    
    return transformed


def transform_nested_year_data(data, year_mapping: dict, year_keys: list = None):
    """
    Recursively transform year data in nested structures (dicts, lists, etc.).
    
    Args:
        data: Data structure to transform (can be dict, list, or primitive)
        year_mapping: Mapping from calendar years to year ranges
        year_keys: List of keys that contain year data (e.g., ['year_data', 'year_wise'])
    
    Returns:
        Transformed data structure with year ranges
    """
    if year_keys is None:
        year_keys = ['year_data', 'year_wise']
    
    if isinstance(data, dict):
        transformed = {}
        for key, value in data.items():
            # If this key contains year data, transform its keys
            if key in year_keys and isinstance(value, dict):
                transformed[key] = transform_dict_keys_to_year_ranges(value, year_mapping)
            # If the key itself is a year, transform it
            elif key in year_mapping:
                transformed[year_mapping[key]] = transform_nested_year_data(value, year_mapping, year_keys)
            else:
                transformed[key] = transform_nested_year_data(value, year_mapping, year_keys)
        return transformed
    
    elif isinstance(data, list):
        return [transform_nested_year_data(item, year_mapping, year_keys) for item in data]
    
    else:
        # Primitive types (str, int, float, bool, None) - return as-is
        return data


def transform_response_to_year_ranges(response_data: dict, contract_begins_year: int, contract_duration: int) -> dict:
    """
    Transform entire response data structure to use contract year ranges.
    
    This is the main function to call when preparing PCNA API responses.
    Converts all calendar year keys (e.g., '2025') to contract year ranges (e.g., '2025-2026').
    
    Args:
        response_data: Complete response dictionary
        contract_begins_year: The year the contract begins (e.g., 2025)
        contract_duration: Number of years in the contract (e.g., 3)
    
    Returns:
        Response data with all year references converted to year ranges
    
    Example:
        >>> response = {"gross_revenue": {"2025": 1000, "2026": 1500}, "year_cols": ["2025", "2026"]}
        >>> transform_response_to_year_ranges(response, 2025, 2)
        {"gross_revenue": {"2025-2026": 1000, "2026-2027": 1500}, "year_cols": ["2025-2026", "2026-2027"]}
    """
    # Create year mapping: {'2025': '2025-2026', '2026': '2026-2027', ...}
    duration_years = contract_duration_to_int(contract_duration)
    year_ranges = [f"{contract_begins_year + i}-{contract_begins_year + i + 1}" for i in range(duration_years)]
    calendar_years = [str(contract_begins_year + i) for i in range(duration_years)]
    year_mapping = dict(zip(calendar_years, year_ranges))
    
    # Transform the response data
    transformed = transform_nested_year_data(response_data, year_mapping)
    
    # Update year_cols if it exists
    if 'year_cols' in transformed:
        transformed['year_cols'] = year_ranges
    
    return transformed


async def save_deal_log(deal_id: int, page: str, field_name: str, old_value, new_value, updated_by: int = None, json_paths: list = None):
    """Persist a deal change log entry, only if the value changed.
    
    This function now delegates to the deal_log_controller for better organization.
    See deal_log_controller.save_deal_log for detailed documentation.
    """
    try:
        from app.controllers.deal_log_controller import save_deal_log as controller_save_deal_log
        await controller_save_deal_log(
            deal_id=deal_id,
            page=page,
            field_name=field_name,
            old_value=old_value,
            new_value=new_value,
            updated_by=updated_by,
            json_paths=json_paths
        )
    except Exception:
        # Best-effort logging; avoid raising to not break primary flow
        pass

def merge_permissions(default_perms: dict, db_perms: dict = None) -> dict:
    """
    Deep merge of permissions:
    - DB permissions override default ones
    - Missing permissions are pulled from default_permissions
    """

    if not db_perms:
        db_perms = {}

    # Avoid changing original dict
    default_copy = copy.deepcopy(default_perms)

    for module, module_data in db_perms.items():

        # If module itself not in default config, keep it
        if module not in default_copy:
            default_copy[module] = module_data
            continue

        for feature, feature_data in module_data.items():

            # If feature not in default, add it
            if feature not in default_copy[module]:
                default_copy[module][feature] = feature_data
                continue

            for action, value in feature_data.items():
                # Override default with DB value
                default_copy[module][feature][action] = value

    return default_copy


def apply_full_permissions(default_perm: dict) -> dict:
    """
    Return a deep-copied permission dict
    with every access value set to True
    (edit/view/enable/etc.)
    """

    result = copy.deepcopy(default_perm)

    for module, module_data in result.items():
        if isinstance(module_data, dict):
            for feature, feature_data in module_data.items():
                if isinstance(feature_data, dict):
                    for action in feature_data:
                        # Convert every boolean action to True
                        if isinstance(feature_data[action], bool):
                            feature_data[action] = True
                        # If nested dict exists (rare case)
                        elif isinstance(feature_data[action], dict):
                            for inner_action in feature_data[action]:
                                feature_data[action][inner_action] = True

    return result

def pnl_summary_1000_conversion(value):
    return value
    try:
        return float(value) * 1000
    except (ValueError, TypeError):
        return 0

def index_by_keys(data, keys, single_val: str = None, return_type: str = "string"):
    """
    Indexes a list of items by a composite key composed of specified attributes.
    
    :param data: List of dictionaries or objects
    :param keys: List of attribute names to use as keys
    :return: A dictionary mapping the composite key tuple to the item
    """
    result = {}
    
    for item in data:
        # Create a tuple of values based on the provided keys
        key_tuple = generate_composite_key(item, keys)

        if single_val:
            val = item.get(single_val, None) if isinstance(item, dict) else getattr(item, single_val, None)
            if return_type == "number":
                val = float(val) if val else 0
            elif return_type == "string":
                val = "" if not val else val
            result[key_tuple] = val
        else:
            result[key_tuple] = jsonable_encoder(item) if isinstance(item, object) else item
        
    return result

def generate_composite_key(item, keys):
    """
    Generates a composite key from a dictionary or object based on the provided keys.
    
    :param item: Dictionary or object to generate a key from
    :param keys: List of attribute names to use as keys
    :return: A tuple of values based on the provided keys
    """
    if isinstance(item, dict):
        vals = [ item.get(k) for k in keys ]
        vals = [ str(v) if isinstance(v, int) else v for v in vals ]
        vals = [ str(v) if isinstance(v, float) else v for v in vals ]
        return ",".join(vals)
    else:
        vals = [ getattr(item, k, None) for k in keys ]
        vals = [ str(v) if isinstance(v, int) else v for v in vals ]
        vals = [ str(v) if isinstance(v, float) else v for v in vals ]
        return ",".join(vals)

def group_data_by_keys(data, keys):
    grouped_dict = {}
    
    for item in data:
        # Create a unique key based on the requested attributes
        composite_key = generate_composite_key(item, keys)
        
        # If the key doesn't exist yet, initialize an empty array
        if composite_key not in grouped_dict:
            grouped_dict[composite_key] = []
            
        # Append the current object to that group
        grouped_dict[composite_key].append(item)
            
    return grouped_dict
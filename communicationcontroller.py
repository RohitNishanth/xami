from pprint import pprint
import asyncio
import json
import re
from this import d
from app.models.user_model import User
from tortoise.exceptions import IntegrityError, DoesNotExist
from fastapi import HTTPException, status, Query
from tortoise import connections
from app.core.config import TABLE_PREFIX
from app.core.constants import DEPARTMENTS
from app.models.communication import CommunicationNote
from datetime import datetime
from app.core.utils import format_datetime_field, send_email, format_date_field
from app.models.deal import Deal, DealBncDetails
from typing import Optional
from app.core.constants import COMMUNICATION_ACTION_NAME, COMMUNICATION_DEAL_STATUS_BY_ACTION_NAME

from app.helper.deal_freez_helper import clone_all_deal_tables, clone_all_lookup_tables

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

DEAL_STATUS_LABELS = {
    1: "NASM",
    2: "Equipment",
    3: "Sales / Segment",
    4: "Center of Excellence",
    5: "Finance",
    6: "Bottling Partners",
    7: "Customer Approval",
    8: "Legal",
    9: "Activated",
}

def get_move_to_id(move_to, current_deal_status):
    if move_to == -1:
        if current_deal_status == 2: # moved to equipment
            return 1
        if current_deal_status == 3: # moved to sales
            return 11
    return move_to


## -----------------------------------------  email functions -------------------------------------------
async def get_deal_information(deal_id: int, user: User):
  deal_data = {}
  try:
    deal_query = f"""
      SELECT d.*, concat(u.first_name,' ',u.last_name) AS nasm_name, c.concept_name AS customer_name
      FROM {TABLE_PREFIX}deals AS d
      JOIN {TABLE_PREFIX}customers AS c ON c.id = d.customer_id
      LEFT JOIN {TABLE_PREFIX}users AS u ON u.id = d.created_by
      WHERE d.id = {deal_id} AND d.status != 2
    """
    conn = connections.get("default")
    deal_result = await conn.execute_query_dict(deal_query)
    if not deal_result:
      return {}
    deal = deal_result[0]

    if deal:
      deal_data["deal_id"] = deal["id"]
      deal_data["deal_name"] = deal["deal_name"]
      deal_data["nasm_name"] = deal.get("nasm_name") or ""
      deal_data["deal_status"] = deal["deal_status"]
      deal_data["customer_name"] = deal["customer_name"]
      deal_data["deal_dates"] = "(" + format_datetime_field(str(deal["contract_begins"])) + " - " + format_datetime_field(str(deal["contract_expires"])) + ")"
      deal_data['deal_begins'] = format_datetime_field(str(deal["contract_begins"]))
      deal_data['deal_expires'] = format_datetime_field(str(deal["contract_expires"]))
      deal_data['deal_created_by'] = deal["created_by"]
      deal_data['deal_status'] = deal["deal_status"]
      deal_data['customer_id'] = deal["customer_id"]
      deal_data['active_user'] = get_user_name(user)
      deal_data['active_user_role'] = get_user_role(user)

      return deal_data
  except Exception as e:
    # Handle any exceptions that occur during processing
    pprint(str(e))
    return {}
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"An error occurred while fetching the deal information: {str(e)}"
    )
#default action id is 1
async def get_email_template(action_id: int = 1):
  try:

    query = f"""
      SELECT * FROM {TABLE_PREFIX}email_templates AS t
      WHERE
      t.template_action = {action_id}
      AND t.status = 0
    """
    conn = connections.get("default")
    templates = await conn.execute_query_dict(query)
    if templates:
      return templates[0]
    else: 
      raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"An error occurred while fetching the email templates: {str(e)}"
      )
  except Exception as e:
    # Handle any exceptions that occur during processing
    pprint(str(e))
    return None
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"An error occurred while fetching the email templates: {str(e)}"
    )

def str_ireplace(search, replace, subject):
    """Case-insensitive string replacement similar to PHP's str_ireplace"""
    if isinstance(search, list) and isinstance(replace, list):
        for s, r in zip(search, replace):
            subject = re.compile(re.escape(s), re.IGNORECASE).sub(r, subject)
    elif isinstance(search, str) and isinstance(replace, str):
        subject = re.compile(re.escape(search), re.IGNORECASE).sub(replace, subject)
    return subject
async def add_communication_controller(data, user):
  move_to_status = None
  try:
    deal_id = data.get("deal_id")
    action_type = data.get("action_type")
    note = data.get("note", "")
    move_to = data.get("move_to", "-1")

    # if select customer (6) will change to Legal (7)
    if move_to == "6":
       move_to = "7"

    from app.models.deal import Deal
    deal_data = await Deal.filter(id=deal_id).first()
    deal_old_status = deal_data.deal_status or 1
    visited_users =  deal_data.visited_users  if deal_data.visited_users else []
    if not deal_data:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Deal not found"
      )
    
    MOVE_TO_LABELS = {
        "1": "NASM",
        "2": "Equipment",
        "3": "Sales/ Segment",
        "4": "Center of Excellence",
        "5": "Finance",
        "6": "Bottling Partners",
        "7": "Customer Approval",
        "8": "Legal",
        "9": "Activated"
    }

    new_deal_status = get_deal_next_status(int(move_to))
    if  deal_old_status not in visited_users and (new_deal_status != 1 or deal_old_status == 1):
        visited_users.append(deal_old_status)
        deal_data.visited_users = visited_users
    if  deal_old_status not in visited_users and (new_deal_status == 1 and deal_old_status == 8):
        visited_users.append(deal_old_status)
        deal_data.visited_users = visited_users

    # Update deal status if needed
    # if move_to == "-1":
    #   if int(deal_data.deal_status) <= int(user.user_type):
    #     if deal_old_status == 6:
    #        deal_data.deal_status = int(deal_old_status) + 2
    #     else:
    #        deal_data.deal_status = int(deal_old_status) + 1
    #     deal_new_status = deal_data.deal_status
    #     await deal_data.save()
    # elif move_to in ['1','2']:
    #     if move_to == '1':
    #         deal_new_status = 2
    #     if move_to == '2':
    #         deal_new_status = 3
    # else:
    #   if move_to == "6": # customer approval
    #      move_to = "7" # skipping customer approval for now
    #      deal_new_status = int(move_to)
    # deal_data.deal_status = deal_new_status

    deal_data.deal_status = new_deal_status
    await deal_data.save()

    newNote = await CommunicationNote.create(
            deal_id= deal_id,
            sender_id= user.id,
            sender_role_type= user.user_type,
            message= note if note else "",
        )

    if (str(move_to) == "8"):
        try:
            # Verify deal exists
            deal = await Deal.filter(id=deal_id).first()
            if not deal:
                raise HTTPException(status_code=404, detail=f"Deal {deal_id} not found")

            async def run_activation():
                try:
                    await clone_all_lookup_tables(deal_id, user.id)
                    await clone_all_deal_tables(deal_id, user.id)

                    current_lable = MOVE_TO_LABELS.get(str(new_deal_status))
                    sender_id = 1
                    sender_lable = MOVE_TO_LABELS.get(str(sender_id))
                    email_sent_to_all = await trigger_email(data, user, int(move_to), current_lable, sender_lable, new_deal_status, deal_old_status)

                except Exception as e:
                    # Swallow exceptions in background task; consider logging if a logger is available
                    pprint(str(e))

            # Fire-and-forget: run cloning in background without blocking response
            asyncio.create_task(run_activation())

            return {
                "message": "Deal activated successfully.",
                "redirect_url": "/deal-list"
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to schedule activation: {str(e)}")
    try:
       current_lable = MOVE_TO_LABELS.get(str(new_deal_status))
       sender_id = data.get("move_to", "1")
       sender_lable = MOVE_TO_LABELS.get(str(sender_id))
       email_sent = await trigger_email(data, user, int(move_to), current_lable, sender_lable, new_deal_status, deal_old_status)

       if not email_sent:
        return {"error": "Deal not moved to the next step, since the user doesn't have the email template. Please contact admin"}
    except Exception as e:
      pprint(str(e))
      raise HTTPException(status_code=500, detail=f"Email not sent: {str(e)}")
      pass
    # Handle note - check if note column exists first
    # if note:
    #   try:
    #     # Try to access the note field, handle if it doesn't exist
    #     old_note = getattr(deal_data, 'note', None)
    #     if not old_note:
    #       pprint("old_note is None")
    #       # Create new note structure
    #       new_note = {str(user.user_type): [note]}
    #       # Only set if the column exists
    #       if hasattr(deal_data, 'note'):
    #         deal_data.note = new_note
    #     else:
    #       if str(user.user_type) in old_note and old_note[str(user.user_type)]:
    #         # Append the note to the end of the user_type
    #         pprint("old_note[user.user_type] is not None")
    #         old_note[str(user.user_type)].append(note)
    #       else:
    #         old_note[str(user.user_type)] = [note]
    #       # Only set if the column exists
    #       if hasattr(deal_data, 'note'):
    #         deal_data.note = old_note
    #     await deal_data.save()
    #   except AttributeError:
    #     # Note column doesn't exist, skip note handling
    #     pprint("Note column doesn't exist in deals table")
    
    if (str(new_deal_status) == "9"):
       return {
            "message": "Deal activated successfully",
            "redirect_url": "/deal-list"
        }
    else:
       label_name = MOVE_TO_LABELS.get(str(new_deal_status))
       return {"message": f"Deal successfully moved to the {label_name} team"}
    
  except HTTPException:
    # Re-raise HTTP exceptions
    raise
  except Exception as e:
    pprint(str(e))
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"An error occurred while adding the communication: {str(e)}"
    )

def get_user_name(user: User):
    if user.first_name and user.last_name:
        return f"{user.first_name} {user.last_name}"
    elif user.first_name:
        return user.first_name
    elif user.last_name:
        return user.last_name
    else:
        return "Anonymous"

def get_user_role(user: User):
    if user.user_type:
        return DEPARTMENTS[user.user_type]
    else:
        return "Anonymous"

async def trigger_email(data, user, move_to = None, current_lable = None, sender_lable = None, deal_status = 1, deal_old_status = 1):
  try:
    #get segment, subsegment id
    user_seg_id = getattr(user, "segment_id", None)
    user_sub_seg_id = getattr(user, "sub_segment_id", None)

    #get form data
    deal_id = data.get("deal_id")
    action_type = data.get("action_type")
    note = data.get("note","")

    deal = await Deal.filter(id=deal_id).first()
    deal_data = await get_deal_information(deal_id, user)

    deal_status = deal_data.get("deal_status",1)
    move_to = get_move_to_id(move_to, deal_status)
    
    #get email template
    mail_template = await get_email_template(move_to)

    if mail_template:

        # get emails of selected roles
        user_type_ids = mail_template["user_roles"].split(",")
        # email_ids = await get_email_from_roles(user_type_ids, user_seg_id, user_sub_seg_id)

        if move_to == 8:
            field_name = ['nasm','sales_lead','coe','finance', 'report_to', 'director']
            field_str = ", ".join(field_name)

            user_id_query = f"""
                SELECT {field_str}
                FROM {TABLE_PREFIX}customers
                WHERE id = {int(deal_data["customer_id"])} AND status = 0
            """
            conn = connections.get("default")
            user_result = await conn.execute_query_dict(user_id_query)

            user_ids = [
                user_result[0][field]
                for field in field_name
                if user_result[0].get(field)
            ]
            user_id_conditions = ""
            if user_ids:
                user_ids_str = ",".join(str(uid) for uid in user_ids)
                user_id_conditions = f" OR id IN ({user_ids_str})"
            
            user_roles_str = ",".join(str(uid) for uid in user_type_ids)

            email_query = f"""
                SELECT email
                FROM {TABLE_PREFIX}users
                WHERE status = 0 
                AND ((user_type IN ({user_roles_str}) AND segment_id = {user_seg_id} AND sub_segment_id = {user_sub_seg_id}) {user_id_conditions})
            """

            emails = await conn.execute_query_dict(email_query)
            email_ids = [email["email"] for email in emails]
        
        elif deal_status in [2,7,8,6]:
            email_ids = await get_email_from_roles(user_type_ids, user_seg_id, user_sub_seg_id)
        else:
            email_ids = await get_email_from_customers(user_type_ids, deal_data["customer_id"], deal_status,  user_seg_id, user_sub_seg_id)
        # get additional emails and merge with selected emails
        additional_emails = mail_template["additional_emails"].split(",") if mail_template.get("additional_emails", "").strip() else []
        email_ids += additional_emails
        email_ids_str = ""
        if len(email_ids) > 0:
            email_ids_str = ",".join(email_ids)

        #get keys and values
        data_keys = [f"[[{key}]]" for key in deal_data.keys()]
        data_values = [ str(value) for value in deal_data.values()]

        #get subject, content from template and replacing keys and values
        mail_content_raw = mail_template["content"]
        mail_subject_raw = mail_template["subject"]
        #replace Equipment in mail_subject_raw with EQ
        mail_subject = str_ireplace(data_keys, data_values, mail_subject_raw)
        mail_content = str_ireplace(data_keys, data_values, mail_content_raw)
        if current_lable:
          mail_subject = mail_subject.replace("Equipment", current_lable)
          mail_content = mail_content.replace("Equipment Team", current_lable)

        #get email body if email ids are present
        if email_ids not in ["",None]:
            email_body = get_email_content(
                main_content=mail_content,
                note=note,
                # header="Deal Completed - Ready for Processing",
                # button_text="View Full Details",
                # button_link="http://localhost:3000/deal/27/1",
                # footer_note="This is an automated notification. No reply needed."
            )


            image_paths = {
                "logo": "images/logo_pepsi.png",
                "email": "images/email.png"
            }
            if email_ids_str != "":
                await send_email(to_email=email_ids_str, subject=mail_subject, body=email_body,image_paths=image_paths)


            # update deal status
            # deal_status = int(deal_data["deal_status"]) + 1 if action_type == 1 else 1
            # update_query = f"""
            # UPDATE {TABLE_PREFIX}deals
            # SET deal_status = {deal_status},
            #     last_status = {deal_data["deal_status"]}
            # WHERE id = {deal_id}
            # """
            # conn = connections.get("default")
            # await conn.execute_query_dict(update_query)

            # add notes
            # note_data = {
            #     "deal_id": deal_id,
            #     "message": note
            # }
            #await insert_notes(note_data, user)

            return {"message": "Email sent successfully"}
    else:
        deal.deal_status = deal_old_status
        await deal.save()
        return False

  except Exception as e:
    # Handle any exceptions that occur during processing

    deal.deal_status = deal_old_status
    await deal.save()
    pprint(str(e))
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"An error occurred while fetching the deal information: {str(e)}"
    )
  return {"message": "Email sent successfully"}


async def get_manual_deal_snapshot(deal_id: int):
  query = f"""
    SELECT
      d.id,
      d.deal_name,
      d.segment,
      d.contract_begins,
      d.contract_expires,
      d.contract_duration,
      d.volume_annually,
      d.deal_status,
      c.concept_name AS customer_name,
      CONCAT(
        COALESCE(u.first_name, ''),
        CASE WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL THEN ' ' ELSE '' END,
        COALESCE(u.last_name, '')
      ) AS nasm_name
    FROM {TABLE_PREFIX}deals AS d
    LEFT JOIN {TABLE_PREFIX}customers AS c ON c.id = d.customer_id
    LEFT JOIN {TABLE_PREFIX}users AS u ON u.id = d.created_by
    WHERE d.id = {deal_id} AND d.status != 2
    LIMIT 1
  """
  conn = connections.get("default")
  result = await conn.execute_query_dict(query)
  if not result:
    return None
  return result[0]


async def get_bnc_raw_cases(deal_id: int):
  details = await DealBncDetails.filter(deal_id=deal_id).first()
  if details and details.y1_cases:
    try:
      payload = json.loads(details.y1_cases)
      return payload.get("total_bnc_raw_cases") or payload.get("bnc_raw_cases")
    except (TypeError, ValueError, json.JSONDecodeError):
      return None
  return None


def format_number(value):
  if value in (None, "", "null"):
    return "N/A"
  try:
    value_float = float(value)
    if value_float.is_integer():
      return f"{int(value_float):,}"
    return f"{value_float:,.2f}"
  except (ValueError, TypeError):
    return str(value)


def build_manual_email_body(info: dict):
  contract_start = format_date_field(str(info.get("contract_begins"))) if info.get("contract_begins") else "N/A"
  contract_end = format_date_field(str(info.get("contract_expires"))) if info.get("contract_expires") else "N/A"
  contract_duration = info.get("contract_duration") or "N/A"
  ftn_gallons = format_number(info.get("volume_annually"))
  bnc_raw_cases = format_number(info.get("bnc_raw_cases"))
  customer_name = info.get("customer_name") or "N/A"
  segment = info.get("segment") or "N/A"
  nasm_name = (info.get("nasm_name") or "").strip() or "N/A"
  deal_status_label = DEAL_STATUS_LABELS.get(int(info.get("deal_status", 0)), info.get("deal_status", "N/A"))
  deal_link = f"https://app.pepsi.com/deal/{info.get('id')}"

  return f"""
    <p>Hello,</p>
    <p>Here are the latest details for the selected deal:</p>
    <table cellpadding="6" cellspacing="0" style="border-collapse: collapse;">
      <tr><td><strong>Customer</strong></td><td>{customer_name}</td></tr>
      <tr><td><strong>Deal Name</strong></td><td>{info.get("deal_name") or "N/A"}</td></tr>
      <tr><td><strong>Segment</strong></td><td>{segment}</td></tr>
      <tr><td><strong>Deal Status</strong></td><td>{deal_status_label}</td></tr>
      <tr><td><strong>NASM</strong></td><td>{nasm_name}</td></tr>
      <tr><td><strong>Contract Start</strong></td><td>{contract_start}</td></tr>
      <tr><td><strong>Contract End</strong></td><td>{contract_end}</td></tr>
      <tr><td><strong>Contract Duration</strong></td><td>{contract_duration}</td></tr>
      <tr><td><strong>FTN Gallons</strong></td><td>{ftn_gallons}</td></tr>
      <tr><td><strong>BNC Raw Cases</strong></td><td>{bnc_raw_cases}</td></tr>
    </table>
    <p style="margin-top:16px;">
      <a href="{deal_link}" style="color:#0E0E96; text-decoration:none;">Open Deal</a>
    </p>
    <p>Thanks,<br/>PepsiCo SAGE Team</p>
  """


async def send_deal_email_to_custom_list(data, user):
  try:
    deal_id = data.get("deal_id")
    if not deal_id:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Deal ID is required."
      )

    raw_emails = data.get("emails") or data.get("email_list") or data.get("email_addresses")

    if not raw_emails:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="At least one email address is required."
      )

    if isinstance(raw_emails, str):
      parsed_emails = re.split(r"[,\s;]+", raw_emails)
    elif isinstance(raw_emails, list):
      parsed_emails = raw_emails
    else:
      parsed_emails = []

    cleaned_emails = []
    invalid_emails = []
    seen = set()

    for email in parsed_emails:
      if not email:
        continue
      email_clean = email.strip()
      if not email_clean:
        continue
      lower_email = email_clean.lower()
      if lower_email in seen:
        continue
      if not EMAIL_REGEX.match(email_clean):
        invalid_emails.append(email_clean)
        continue
      seen.add(lower_email)
      cleaned_emails.append(email_clean)

    if invalid_emails:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Invalid email address(es): {', '.join(invalid_emails)}"
      )

    if not cleaned_emails:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Enter at least one valid email address."
      )

    deal_info = await get_manual_deal_snapshot(deal_id)
    if not deal_info:
      raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Deal not found."
      )

    deal_info["bnc_raw_cases"] = await get_bnc_raw_cases(deal_id)

    subject = f"Deal Information: {deal_info.get('deal_name') or deal_id}"
    email_body = build_manual_email_body(deal_info)

    for recipient in cleaned_emails:
      await send_email(
        to_email=recipient,
        subject=subject,
        body=email_body,
        image_paths={}
      )

    return {"message": "Email sent successfully."}

  except HTTPException:
    raise
  except Exception as e:
    pprint(str(e))
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail=f"An error occurred while sending the email: {str(e)}"
    )

async def get_email_from_customers(
    user_type_ids: list[int],
    customer_id: int,
    current_status: int,
    seg_id: int = None,
    sub_seg_id: int = None,
) -> list[str]:
    field_name = ""

    # Map department to field name
    if current_status == 1:
        field_name = "nasm"
    elif current_status == 2:
        field_name = "equipment"
    elif current_status == 3:
        field_name = "sales_lead"
    elif current_status == 4:
        field_name = "coe"
    elif current_status == 5:
        field_name = "finance"
    elif current_status == 6:
        field_name = "partners"
    elif current_status == 7:
        field_name = "customer"
    elif current_status == 8:
        field_name = "legal"

    user_type_filter = int(current_status) if current_status is not None else None

    conn = connections.get("default")

    # --- Step 1: Get user_id (e.g., c.coe)
    user_id_query = f"""
        SELECT {field_name} AS user_id
        FROM {TABLE_PREFIX}customers
        WHERE id = {int(customer_id)} AND status = 0
    """
    user_result = await conn.execute_query_dict(user_id_query)

    if not user_result or not user_result[0].get("user_id"):
        print("No user ID found for this customer.")
        return []

    user_id = user_result[0]["user_id"]

    # --- Step 2: Get email of that user
    email_query = f"""
        SELECT email
        FROM {TABLE_PREFIX}users
        WHERE id = {int(user_id)}
          AND user_type = {user_type_filter}
          AND status = 0
    """
    emails = await conn.execute_query_dict(email_query)

    return [email["email"] for email in emails]

async def get_email_from_roles(user_type_ids: list[int], seg_id: int = None, sub_seg_id: int = None) -> list[str]:
    """
    Get email addresses of active users based on their roles and segments.
    
    Args:
        user_type_ids: List of user type IDs to filter by
        seg_id: Optional segment ID filter
        sub_seg_id: Optional sub-segment ID filter
    
    Returns:
        List of email addresses
    """
    query = User.filter(
        user_type__in=user_type_ids,
        status=0
    )
    
    if seg_id:
        query = query.filter(segment_id=seg_id)
    if sub_seg_id:
        query = query.filter(sub_segment_id=sub_seg_id)
    # Get only email addresses
    emails = await query.values_list("email", flat=True)
    return list(emails)  # Convert QuerySet to list

def get_email_content(
    main_content: str,
    note: str,
    header: str = None,
    button_text: str = None,
    button_link: str = None,
    footer_note: str = None,
    help_email: str = "support@pepsico.com"
) -> str:
    """
    Returns a styled HTML email template with dynamic content.
    
    Args:
        header: Main heading/title of the email
        main_content: Primary message content (HTML supported)
        button_text: Text for CTA button (optional)
        button_link: URL for CTA button (optional)
        footer_note: Additional note at the bottom (optional)
        help_email: Support contact email
    """
    header_section = ""
    if header:
        header_section = f"""
          <h4 style="text-transform: uppercase; color: #333; font-size: 20px; font-weight: 700; margin: 10px 0;">
              {header}
          </h4>
        """
    button_section = ""
    if button_text and button_link:
        button_section = f"""
        <table cellpadding="0" cellspacing="0" style="padding: 0 20px 10px" width="100%">
            <tr style="border-radius: 10px; background: rgba(0, 37, 255, 0.1);">
                <td align="center" style="padding: 20px; border-radius: 20px;">
                    <a href="{button_link}" style="font-family: Arial, sans-serif; display: inline-block; text-decoration: none; border-radius: 10px; background-color: #0E0E96; text-align: center; padding: 12px 40px; color: #fff; font-size: 18px; font-weight: 500;">
                        {button_text}
                    </a>
                </td>
            </tr>
        </table>
        """

    footer_note_section = ""
    if footer_note:
        footer_note_section = f"""
        <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px">
            <tr>
                <td align="center" style="padding: 30px 20px 0;">
                    <p style="color: #fff; font-family: Arial, sans-serif; font-size: 16px; font-weight: 400;">
                        {footer_note}
                    </p>
                </td>
            </tr>
        </table>
        """

    return f"""
    <div style="margin: 0; padding: 0; color: #333; background-color: #0E0E96;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
                <td>
                    <div style="max-width: 620px; margin: 0 auto; padding: 10px">
                        <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px">
                            <tr>
                                <td bgcolor="#FFFFFF" style="border-radius: 24px; padding: 20px">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tr>
                                          <td align="center" style="font-family: Arial, sans-serif; padding-top: 10px; font-size: 13px;">
                                              <img src="cid:logo" alt="Pepsi SAGE Logo" />
                                              {header_section}
                                          </td>
                                      </tr>
                                        <tr>
                                            <td bgcolor="#FFFFFF">
                                                <table cellpadding="0" cellspacing="0" style="padding: 30px 20px 10px" width="100%">
                                                    <tr>
                                                        <td>
                                                            {main_content}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td>
                                                            <span style="color: #000; font-size: 16px; font-weight: 700; margin-top: 30px;">
                                                                Note: 
                                                            </span>{note}
                                                        </td>
                                                    </tr>
                                                </table>
                                                {button_section}
                                                <table cellpadding="0" cellspacing="0" style="padding: 0 20px 10px" width="100%">
                                                    <tr>
                                                        <td>
                                                            <p style="color: #000; font-size: 16px; font-weight: 700; margin-top: 30px;">
                                                                Best regards,
                                                            </p>
                                                            <p style="color: #000; font-size: 16px; font-weight: 400;">
                                                                PepsiCo SAGE Team
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        {footer_note_section}
                        <table width="100%" align="center" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px">
                            <tr>
                                <td align="center" style="padding: 20px 20px 30px;">
                                    <a href="mailto:{help_email}" style="text-decoration: none; display: flex; justify-content: center; align-items: center;">
                                        <table align="center">
                                            <tr>
                                                <td style="margin-right: 10px;">
                                                    <img src="cid:email" />
                                                </td>
                                                <td>
                                                    <p style="color: #fff; font-size: 20px; font-weight: 400;">
                                                        {help_email}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>
    </div>
    """

# -----------------------------------------------------------   end of email functions ------------------------------------------------------------








## ------------------------------------------------------ communication notes -------------------------------------------

async def insert_notes(data, user):
    """
    Function for save the communication notes
    """
    try:
        deal_id = data.get("deal_id", None)
        sender_id = user.id
        sender_role_type = user.user_type

        newNote = await CommunicationNote.create(
            deal_id= deal_id,
            sender_id= sender_id,
            sender_role_type= sender_role_type,
            message= data.get("message",""),
        )

        return {
            "message": "Communication Notes details updated successfully.",
            "notes_data": await get_notes(deal_id),
        }

    except Exception as e:
        # Handle exceptions that occur during processing
        pprint(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while saving the communication notes details: {str(e)}"
        )
    
async def get_notes(deal_id: int):
    """
    Function for fetch and return the communication notes
    """
    try:
        # fetch deal notes record
        records = await CommunicationNote.filter(deal_id= deal_id, status= 0).order_by("created_at")
        return records

    except Exception as e:
        # Handle exceptions that occur during processing
        pprint(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching the communication notes details: {str(e)}"
        )
## -------------------------------------------------   end of communication notes   -------------------------------------

def get_deal_next_status(action_id):
    # ex: if action_id is 1, then deal status is 2
    action_name = COMMUNICATION_ACTION_NAME[action_id]
    deal_status = COMMUNICATION_DEAL_STATUS_BY_ACTION_NAME[action_name]

    return deal_status


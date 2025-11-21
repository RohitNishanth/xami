from app.controllers.communication_controller import (
    insert_notes,
    get_notes,
    add_communication_controller,
    trigger_email,
    send_deal_email_to_custom_list,
)
from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, Request, Header, status
from app.controllers.auth_controller import super_admin_required, is_auth_user
from pprint import pprint
import json

router = APIRouter()


@router.get("/communication/get_notes/{deal_id}")
async def get_page_data(deal_id: int,user: dict = Depends(is_auth_user)):
    """
    API endpoint to get notes
    """    
    result = await get_notes(deal_id=deal_id)
    return result

@router.post("/communication/send_note")
async def send_note_fn( request: Request, user: dict = Depends(is_auth_user)):
    """
    API endpoint to send notes
    """    
    data = await request.json()
    result = await insert_notes(data,user)
    return result

@router.post("/trigger_email/")
async def clone_templates(data: dict, user: dict = Depends(is_auth_user)):
    """
    API endpoint to clone the email templates
    """
    return await trigger_email(data, user)

@router.post("/communication/send_deal_email")
async def send_deal_email(data: dict, user: dict = Depends(is_auth_user)):
    """
    API endpoint to send a manual deal email to selected recipients
    """
    return await send_deal_email_to_custom_list(data, user)

@router.post("/add-communication/")
async def add_communication(data: dict, user: dict = Depends(is_auth_user)):
    """
    API endpoint to add communication
    """
    return await add_communication_controller(data, user)
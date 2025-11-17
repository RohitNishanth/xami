from fastapi import APIRouter, HTTPException, Depends
from app.schemas.nap import NapCreate, NapResponse, NapEdit
from app.controllers.nap_controller import create_nap, edit_nap, soft_delete_nap, list_naps, fetch_nap, list_nap_schedules
from app.controllers.auth_controller import permission_required, is_auth_user
from app.core.constants import LOOKUP_PERMISSIONS

router = APIRouter()


@router.post("/nap", dependencies=[Depends(permission_required(LOOKUP_PERMISSIONS["nap"]))])
async def create_nap_endpoint(data: NapCreate, user: dict = Depends(is_auth_user)):
    """
    API endpoint to create a new nap.
    """
    nap = await create_nap(data, user)
    return nap

@router.put("/nap/{nap_id}", dependencies=[Depends(permission_required(LOOKUP_PERMISSIONS["nap"]))])
async def update_nap(nap_id: int, nap_data: NapEdit, user: dict = Depends(is_auth_user)):
    # Call the controller function to handle the business logic
    return await edit_nap(nap_id, nap_data, user)

@router.delete("/nap/{nap_id}", dependencies=[Depends(permission_required(LOOKUP_PERMISSIONS["nap"]))])
async def delete_nap(nap_id: int):
    # Call the controller function to handle soft delete
    return await soft_delete_nap(nap_id)

@router.get("/nap", response_model=list[NapResponse], dependencies=[Depends(permission_required(LOOKUP_PERMISSIONS["nap"]))])
async def list_nap_endpoint():
    """
    API endpoint to list all nap records.
    """
    records = await list_naps()
    return records

@router.get("/nap/active", response_model=list[NapResponse], dependencies=[Depends(permission_required(LOOKUP_PERMISSIONS["nap"]))])
async def list_active_nap():
    """
    API endpoint to list all active nap records.
    """
    records = await list_naps(status=0, sort="name")
    return records

@router.get("/nap/schedules", dependencies=[Depends(permission_required(LOOKUP_PERMISSIONS["nap"]))])
async def list_schedule_options():
    """
    API endpoint to list schedule dropdown options.
    """
    return await list_nap_schedules()

@router.get("/get_nap/{id}", dependencies=[Depends(permission_required(LOOKUP_PERMISSIONS["nap"]))])
async def get_nap(id: int):
    """
    API endpoint to retrieve a single nap.
    """
    record = await fetch_nap(id)
    if not record:
        raise HTTPException(status_code=404, detail="NAP not found")
    return record
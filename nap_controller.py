from tortoise.exceptions import IntegrityError, DoesNotExist
from fastapi import HTTPException
from app.models.nap import Nap
from app.schemas.nap import NapEdit
from app.core.utils import format_datetime_field
from typing import Optional
from app.models.sub_category import Sub_category
from tortoise.functions import Lower

NAP_SCHEDULE_OPTIONS = ["Annually", "Half Yearly", "Quarterly"]


def _validate_schedule(schedule: Optional[str]) -> str:
    value = (schedule or "Annually").strip()
    if value not in NAP_SCHEDULE_OPTIONS:
        raise HTTPException(status_code=400, detail="Invalid schedule option.")
    return value


async def create_nap(data, user):
    """
    Business logic to create a new nap.
    """
    # Check if the nap name already exists
    if await Nap.filter(name=data.name, status__not=2).exists():
        raise HTTPException(status_code=400, detail="NAP name already exists")

    schedule = _validate_schedule(getattr(data, "schedule", None))

    # Save nap
    try:
        nap = await Nap.create(name=data.name, schedule=schedule, created_by=user.id)
        return {"message": "NAP details added successfully", "data": nap}
    except IntegrityError:
        raise HTTPException(status_code=500, detail="Database error")
    

async def edit_nap(nap_id: int, nap_data: NapEdit, user):
    try:
        # Fetch the nap by its ID
        nap = await Nap.get(id=nap_id)
        
        # Check if the name exists (if provided)
        if nap_data.name:
            existing_nap = await Nap.filter(name=nap_data.name, status__not=2).exclude(id=nap_id).first()
            if existing_nap:
                raise HTTPException(status_code=400, detail="NAP name already exists.")

        # Update the fields that are provided
        if nap_data.name:
            nap.name = nap_data.name
            nap.updated_by = user.id

        if nap_data.schedule:
            nap.schedule = _validate_schedule(nap_data.schedule)
            nap.updated_by = user.id
        
        if 'status' in nap_data.dict() and nap_data.status is not None:
            nap.status = nap_data.status
            
            if nap_data.status != 0:
                if await Sub_category.filter(mix_details__icontains=f"{nap_id}", mix_type=1, status__not=2).exists():
                    raise HTTPException(status_code=400, detail="NAP cannot be deactivated if it associates with a sub-category.")
        
        # Save the updated nap
        await nap.save()

        if nap_data.status is not None:
            return {"message": f"NAP details {'activated' if nap.status == 0 else 'deactivated'} successfully", "data": nap}
        
        # Return the updated nap
        return {"message": "NAP details updated successfully.", "data": nap}
    
    except DoesNotExist:
        # If the nap does not exist, raise a 404 error
        raise HTTPException(status_code=404, detail="NAP not found")
    
# Soft delete nap
async def soft_delete_nap(nap_id: int):
    # Remove the nap ID from any `mix_details` fields in related records
    try:
        nap = await Nap.get(id=nap_id)

        if await Sub_category.filter(mix_details__icontains=f"{nap_id}", mix_type=1, status__not=2).exists():
            raise HTTPException(status_code=400, detail="NAP cannot be deleted if it associates with a sub-category.")
        
        await Nap.soft_delete(nap_id)  # Soft delete the record
        return {"message": "NAP deleted successfully"}
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="NAP not found")
    

async def list_naps(status: Optional[int] = None, sort: Optional[str] = 'created_at'):
    """
    Retrieve all nap records.
    """
    filters = {}

    if status is None:
        filters['status__not'] = 2
    else:
        filters['status'] = status

    if sort == "name":
        records = await Nap.filter(**filters).annotate(lower_name=Lower("name")).order_by("lower_name")
    else:
        records = await Nap.filter(**filters).order_by('-created_at')

    return [
        {
            "id": nap.id,
            "name": nap.name,
            "schedule": nap.schedule,
            "status": nap.status,
            "created_at": format_datetime_field(str(nap.created_at)),
            "updated_at": format_datetime_field(str(nap.updated_at))
        }
        for nap in records
    ]

async def fetch_nap(id: int):
    """
    Retrieve single nap.
    """
    record = await Nap.filter(id=id).first() 
    if not record:
        return None
    data = {
        "id": record.id,
        "name": record.name,
        "schedule": record.schedule,
        "status": record.status,
        "created_at": format_datetime_field(str(record.created_at)),
        "updated_at": format_datetime_field(str(record.updated_at))
    }   
    return data


async def list_nap_schedules():
    """
    Return schedule dropdown options.
    """
    return [{"label": option, "value": option} for option in NAP_SCHEDULE_OPTIONS]


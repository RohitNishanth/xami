from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.controllers.nap_controller import NAP_SCHEDULE_REVERSE

class NapCreate(BaseModel):
    name: str
    schedule: str = "Annually"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "NAP name",
                "schedule": "Annually",
            }
        }

class NapEdit(BaseModel):
    name: Optional[str] = None      
    status: Optional[int] = None
    schedule: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Updated NAP Name",
                "schedule": "Quarterly"
            }
        }


class NapResponse(BaseModel):
    id: int
    name: str
    schedule: str
    status: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    @staticmethod
    def format_datetime(dt: Optional[datetime]) -> Optional[str]:
        """Format a datetime object into 'm/d/Y H:i:s' format."""
        if isinstance(dt, datetime):  # Ensure it's a datetime object
            return dt.strftime("%m/%d/%Y %H:%M:%S")
        return None
    
    @classmethod
    def from_orm(cls, obj):
        created_at = cls.format_datetime(getattr(obj, "created_at", None))
        updated_at = cls.format_datetime(getattr(obj, "updated_at", None))
        
        # Convert schedule number to label
        schedule_value = getattr(obj, "schedule", 1)
        schedule_label = NAP_SCHEDULE_REVERSE.get(schedule_value, "Annually")

        return cls(
            id=obj.id,
            name=obj.name,
            schedule=schedule_label,
            status=getattr(obj, "status", None),
            created_at=created_at,
            updated_at=updated_at
        )

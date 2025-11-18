from tortoise.models import Model
from tortoise import fields
from datetime import datetime
from app.core.config import TABLE_PREFIX


class Nap(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    schedule = fields.IntField(default=1)  # 1 = Annually, 2 = Half Yearly, 3 = Quarterly
    status = fields.IntField(default=0)  # 0 = active, 1 = inactive 2 = delete
    created_by = fields.IntField(default=None, null=True) # user who created it
    updated_by = fields.IntField(default=None, null=True) # user who updated it
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)  # Auto update on change

    class Meta:
        table = f"{TABLE_PREFIX}nap"
    
    @classmethod
    async def soft_delete(cls, nap_id: int):
        nap = await cls.get(id=nap_id)
        nap.status = 2  # Soft delete by changing status
        await nap.save()

    @classmethod
    async def get_active(cls, nap_id: int):
        return await cls.get(id=nap_id, status=0)  # Fetch only active roles        
  

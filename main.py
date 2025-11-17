# app/main.py
import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from tortoise.contrib.fastapi import register_tortoise
from app.views.auth_routes import router as auth_router
from app.views.role_routes import router as role_router
from app.views.segment_routes import router as segment_router
from app.views.mix_routes import router as mix_router
from app.views.nap_routes import router as nap_router
from app.views.unit_routes import router as unit_router
from app.views.inflation_routes import router as inflation_router
from app.views.equipment_service_routes import router as equipment_service_router
from app.views.category_routes import router as category_router
from app.views.sub_category_routes import router as sub_category_router
from app.views.user_routes import router as user_router
from app.views.product_routes import router as product_router
from app.views.customer_routes import router as customer_router
from app.views.deal_routes import router as deal_router
from app.views.national_routes import router as national_router
from app.views.division_routes import router as division_router
from app.views.national_average_routes import router as national_average_router
from app.views.deal_outlet_question_routes import router as deal_outlet_question_router
from app.views.FTN_equipment_type_routes import router as ftn_equipment_type_router
from app.views.bottling_routes import router as bottling_routes
from app.views.equipment_lookup_routes import router as equipment_lookup_routes
from app.views.inv_equip_routes import router as inv_equip_routes
from app.views.inv_equip_product_routes import router as inv_equip_product_routes
from app.views.inv_equip_field_routes import router as inv_equip_field_routes
from app.views.email_templates_lookup_router import router as email_templates_lookup_router
from app.views.dashboard_routes import router as dashboard_router
from app.views.deal_equipments.fountain_routes import router as fountain_deal_router
from app.views.service_and_pm_calls import router as service_and_pm_calls_router
from app.views.addon_routes import router as addon_router
from app.views.communication_routes import router as communication_router
from app.views.deal_reports_routes import router as deal_report_router
from app.views.deal_log_routes import router as deal_log_router
from app.views.funding_routes import router as funding_routes
from app.views.deal_funding_terms_routes import router as deal_funding_terms_routes
from app.views.pbc_equipments_routes import router as pbc_equipment_routes
# from app.views.deal_category_routes import router as deal_category_router
from app.views.amendment_questions_routes import router as amendment_questions_router
from app.views.deal_amendment_routs import router as deal_amendment_router
from app.views.pcna_volume_gallons_routes import router as pcna_volume_gallons_routes
from app.tasks.pcna_volume_gallons_tasks import calculate_pcna_volume_gallons
from app.views.ftn_product_pricing_routes import router as ftn_product_pricing_routes
from app.views.bc_product_pricing_routes import router as bc_product_pricing_routes
from app.views.pcna_fountain_economics_routes import router as pcna_fountain_economics_routes
from app.tasks.pcna_volume_gallons_tasks import calculate_pcna_volume_gallons
from app.views.equipment_version_routes import router as equipment_version_router

from app.core.config import TORTOISE_ORM
from app.core.constants import *
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import secrets

# app = FastAPI()

app = FastAPI(
    root_path="/api",
    version="1.0.0",
    docs_url="/docs",            # Swagger UI path
    redoc_url="/redoc",          # ReDoc UI path (optional)
    openapi_url="/openapi.json"  # OpenAPI schema path)
)

# Mount the 'uploads' folder at the '/uploads' URL path
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS
origins = [
    "http://localhost:3000",  # Frontend development server
    "http://127.0.0.1:3000",  # Alternative localhost address
    "https://pepsisage.spmsvc.com/",
]
   
class CSPMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        nonce = secrets.token_urlsafe(16)
        request.state.nonce = nonce  # Store it for later use in templates

        response = await call_next(request)
        response.headers["Content-Security-Policy"] = (
            f"default-src 'self';"
            f"script-src 'self' 'nonce-{nonce}';"
            f"style-src 'self' 'nonce-{nonce}';"
            f"img-src 'self' data:;"
            f"font-src 'self';"
            f"connect-src 'self';"
            f"object-src 'none';"
            f"frame-ancestors 'none';"
            f"base-uri 'self';"
            f"form-action 'self'"
        )
        return response

app.add_middleware(CSPMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,  # Allow cookies and authentication headers
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all request headers
)

# Include authentication routes
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

# Register routes
#app.include_router(role_router, prefix="/api", tags=["roles"])

# Register segments
app.include_router(segment_router, prefix="", tags=["segments"])

# Register Mix
app.include_router(mix_router, prefix="", tags=["mix"])

# Register Nap
app.include_router(nap_router, prefix="", tags=["nap"])

# Register CaseAndUnit
app.include_router(unit_router, prefix="", tags=["unit"])

# Register Infaltion
app.include_router(inflation_router, prefix="", tags=["inflation"])

# Register Equipment Service Router
app.include_router(equipment_service_router, prefix="", tags=["equipment_service"])

# Register category
app.include_router(category_router, prefix="", tags=["category"])

# Register sub category
app.include_router(sub_category_router, prefix="", tags=["sub_category"])

# Register user
app.include_router(user_router, prefix="", tags=["user"])

# Register product
app.include_router(product_router, prefix="", tags=["product"])

# Register customer
app.include_router(customer_router, prefix="", tags=["Customer"])

# Register deal
app.include_router(deal_router, prefix="", tags=["Deal"])

# Register national
app.include_router(national_router, prefix="", tags=["National"])

# Register division
app.include_router(division_router, prefix="", tags=["Division"])

# Register nationa average
app.include_router(national_average_router, prefix="", tags=["National Average"])

# Register FTN equipment type router
app.include_router(ftn_equipment_type_router, prefix="", tags=["FTN Equipment types"])

# Register deal-outler-questions
app.include_router(deal_outlet_question_router, prefix="", tags=["Deal Outlet Questions"])

# Register bottling
app.include_router(bottling_routes, prefix="", tags=["Bottling Territory"])

# Register equipment version router
app.include_router(equipment_version_router, prefix="", tags=["Equipment Version"])

# Register equipment lookup router
app.include_router(equipment_lookup_routes, prefix="", tags=["Equipment Lookups"])

# Register Innovation Equipment
app.include_router(inv_equip_routes, prefix="", tags=["Innovation Equipment"])

# Register Innovation Equipment Product
app.include_router(inv_equip_product_routes, prefix="", tags=["Innovation Equipment Product"])

# Register Innovation Equipment Field
app.include_router(inv_equip_field_routes, prefix="", tags=["Innovation Equipment Field"])

# Register email templates lookup router
app.include_router(email_templates_lookup_router, prefix="", tags=["Email Template Field"])

# Register Dashboard
app.include_router(dashboard_router, prefix="", tags=["Dashboard"])


# Register Fountain Equipment Router
app.include_router(fountain_deal_router, prefix="", tags=["Deal Fountain Equipments"])

# Register addon
app.include_router(addon_router, prefix="", tags=["addon"])

app.include_router(service_and_pm_calls_router, prefix="", tags=["Service And Pm Calls"])

# Register communication
app.include_router(communication_router, prefix="", tags=["communication"])

# Register Deal Reports
app.include_router(deal_report_router, prefix="", tags=["Deal Report"])

# Register Deal Logs
app.include_router(deal_log_router, prefix="", tags=["Deal Log"])

# Register funding
app.include_router(funding_routes, prefix="", tags=["Funding"])

app.include_router(deal_funding_terms_routes, prefix = "", tags=["Funding Terms"])

# pbc equipment
app.include_router(pbc_equipment_routes, prefix="", tags=["PBC Equipment"])
# Register deal category
# app.include_router(deal_category_router, prefix="", tags=["Deal Category"])

# Register amendment questions
app.include_router(amendment_questions_router, prefix="", tags=["Amendment Questions"])

# Register deal amendment routes
app.include_router(deal_amendment_router, prefix="", tags=["Deal Amendment"])

# PCNA Volume Gallons
app.include_router(pcna_volume_gallons_routes, prefix="", tags=["PCNA Volume Gallons"])

# PCNA Volume Gallons
app.include_router(pcna_volume_gallons_routes, prefix="", tags=["PCNA Volume Gallons"])
app.include_router(ftn_product_pricing_routes, prefix="/ftn-pricing", tags=["FTN Product Pricing"])
app.include_router(bc_product_pricing_routes, prefix="/bc-pricing", tags=["B&C Product Pricing"])
app.include_router(pcna_fountain_economics_routes, prefix="/api/pcna-economics", tags=["PCNA Fountain Economics"])


DEBUG_MODE = False

if DEBUG_MODE:
    logging.basicConfig(level=logging.DEBUG)  # or INFO
    logger = logging.getLogger("tortoise.db.client")
    logger.setLevel(logging.DEBUG)

# Register Tortoise ORM
register_tortoise(
    app,
    config=TORTOISE_ORM,
    generate_schemas=False,
    add_exception_handlers=True,
)


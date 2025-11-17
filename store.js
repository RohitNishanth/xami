import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import layoutReducer from "../features/layout/layoutSlice";
import segmentReducer from "../features/segment/segmentSlice";
import userReducer from "../features/user/userslice";
import customerReducer from "../features/customer/customerSlice";
import dealReducer from "../features/deal/dealSlice";
import dealsListReducer from "../features/deal-list/dealsListSlice";
import categoryReducer from "../features/category/categorySlice";
import fountainDealReducer from "../features/fountain_deal/fountainDealSlice";
import bottlingSlice from "../features/bottling/bottlingSlice";
import NationalAvgSlice from "../features/products/natAvgSlice";
import SubcategorySlice from "../features/sub_category/SubCategorySlice";
import bncDealSlice from "../features/bnc_deal/bncDealSlice";
import inflationSlice from "../features/inflation/inflationSlice";
import equipmentLookupSlice from "../features/equipments/equipmentlookupSlice";
import innovationEquipmentSlice from "../features/innovation_equipment/innovationEquipmentSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import addonReducer from "../features/addon/addonSlice";
import typeOptionsReducer from "../features/equipments/typeOptionsSlice";
import equipmentVersionReducer from "../features/equipments/equipmentVersionSlice";
import napReducer from "../features/nap/napSlice";

import EquipmentServiceSlice from "../features/equipmentservice/equipmentServiceSlice";

import EmailTemplateSlice from "../features/email_templates/emailtemplateSlice";
import FountainEquipments from "../features/equipments/fountainSlice";

import serviceAndPmCallsReducer from "../features/service_and_pm_calls/serviceAndPmCallsSlice"; // Adjust this path if needed

import DealReport from "../features/report/reportSlice";

import fundingReducer from "../features/funding/fundingSlice";
import fundingTermsReducer from "../features/funding_deal/fundingTermsSlice";
import fundingdataReducer from "../features/fundingdata/fundingdataSlice";
import pbcEquipment from "../features/pbcEquipmentSlice";


const store = configureStore({
  reducer: {
    typeOptions: typeOptionsReducer,
    auth: authReducer,
    layout: layoutReducer,
    segment: segmentReducer,
    user: userReducer,
    customer: customerReducer,
    deal: dealReducer,
    deals: dealsListReducer,
    category: categoryReducer,
    fountainDeal: fountainDealReducer,
    bottling: bottlingSlice,
    national_avg: NationalAvgSlice,
    sub_category: SubcategorySlice,
    bnc_deal: bncDealSlice,
    inflation: inflationSlice,
    equipmentService: EquipmentServiceSlice,
    equipmentLookup: equipmentLookupSlice,
    innovationEquipment: innovationEquipmentSlice,
    Email_Templates: EmailTemplateSlice,
    FountainEquipments: FountainEquipments,
    dashboard: dashboardReducer,
    serviceAndPmCalls: serviceAndPmCallsReducer,
    addon: addonReducer,
    DealReport: DealReport,
    funding: fundingReducer,
    fundingTerms: fundingTermsReducer,
    fundingdata: fundingdataReducer,
    pbcEquipment: pbcEquipment,
    equipmentVersion: equipmentVersionReducer,
    nap: napReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

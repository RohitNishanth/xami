# Departments
DEPARTMENTS = {
  1: "NASM",
  2: "Equipment",
  3: "Sales",
  4: "COE",
  5: "Finance",
  6: "Partners",
  8: "Legal",
  9: "Director",
}

#innovation equipment types
INNOVATION_EQUIPMENT_FUND_TYPES = {1: 'Fixed Asset', 2: 'Earned Funding'}

BC_CTS = {
  1: "FSV",
  2: "Access",
  3: "Hotel",
  4: "Transport & Travel",
  5: "Other Rec & Retail",
  6: "Restaurant",
  7: "Education",
  8: "Institution",
  9: "Vending",
  10: "Third Party Serv. Op.",
  11: "Other Workplace",
  12: "FS Distr.",
  13: "Cash & Carry",
}

USER_ACCESS_DEFAULT = {
  "1": {  
    "Customer": {
      "Listing": { "edit": True },
      "Create": { "edit": True },
      "View": { "edit": True },
      "Edit": { "edit": True },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": {  "edit": True },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": True },
      "Archive": { "edit": True },
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": True },
      "Outlet_and_volume_growth": { "view": True, "edit": True },
      "FTN_Equipment": { "view": True, "edit": True },
      "Bottling_Territories": { "view": True, "edit": True },
      "Funding_Terms": { "view": True, "edit": True },
      "Other_product_funding": { "view": True, "edit": True }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": True },
      "Bottling_Territory": { "view": True, "edit": True },
      "Outlet_Growth": { "view": True, "edit": True },
      "PBC_Equipment": { "view": True, "edit": True },
      "Funding_terms": { "view": True, "edit": True },
      "Product_Funding": { "view": True, "edit": True },
      "Mix_Management": { "view": True, "edit": True }
    },
    "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": True },
      "Legal_Summary": { "edit": True },
    },
    "Legal":{
      "Summary": { "view": True, "edit": False },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "FTN_Gallons_by_Year": { "edit": True },
      "Cumulative_Gallons": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "PCNA_Economics": {
      "Reports": { "edit": False },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":False, "edit": False},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":False, "edit": False},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":False, "edit": False},
      "Innovation Equipment": { "view":False, "edit": False},
      "Add-ons": { "view":False, "edit": False},
      "Equipment & Service Parameters - Inflation Rate": { "view":False, "edit": False},
      "EQ - Pricing Management": { "view":False, "edit": False},
      "Pricing Upload": { "view":False, "edit": False},
    }
  },
  "2": {  
    "Customer": {
      "Listing": { "edit": False },
      "Create": { "edit": False },
      "View": { "edit": False },
      "Edit": { "edit": False },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": {  "edit": False },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": False },
      "Archive": { "edit": True },
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": False },
      "Outlet_and_volume_growth": { "view": True, "edit": False },
      "FTN_Equipment": { "view": True, "edit": True },
      "Bottling_Territories": { "view": True, "edit": False },
      "Funding_Terms": { "view": False, "edit": False },
      "Other_product_funding": { "view": False, "edit": False }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": False },
      "Bottling_Territory": { "view": True, "edit": False },
      "Outlet_Growth": { "view": True, "edit": False },
      "PBC_Equipment": { "view": True, "edit": True },
      "Funding_terms": { "view": False, "edit": False },
      "Product_Funding": { "view": False, "edit": False },
      "Mix_Management": { "view": True, "edit": False }
    },
    "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": False },
      "Legal_Summary": { "edit": False },
    },
    "Legal":{
      "Summary": { "view": False, "edit": False },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "FTN_Gallons_by_Year": { "edit": True },
      "Cumulative_Gallons": { "edit": True },
      "Funding_Summary": { "edit": False }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": False }
    },
    "PCNA_Economics": {
      "Reports": { "edit": False },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":False, "edit": False},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":False, "edit": False},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":True, "edit": True},
      "Innovation Equipment": { "view":True, "edit": True},
      "Add-ons": { "view":True, "edit": True},
      "Equipment & Service Parameters - Inflation Rate": { "view":True, "edit": True},
      "EQ - Pricing Management": { "view":True, "edit": True},
      "Pricing Upload": { "view":True, "edit": False},
    }
  },
  "3": {  
    "Customer": {
      "Listing": { "edit": True },
      "Create": { "edit": False },
      "View": { "edit": True },
      "Edit": { "edit": False },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": { "edit": False },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": False },
      "Archive": { "edit": True }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": False },
      "Outlet_and_volume_growth": { "view": True, "edit": False },
      "FTN_Equipment": { "view": True, "edit": False },
      "Bottling_Territories": { "view": True, "edit": False },
      "Funding_Terms": { "view": True, "edit": True },
      "Other_product_funding": { "view": True, "edit": True }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": False },
      "Bottling_Territory": { "view": True, "edit": False },
      "Outlet_Growth": { "view": True, "edit": False },
      "PBC_Equipment": { "view": True, "edit": False },
      "Funding_terms": { "view": True, "edit": True },
      "Product_Funding": { "view": True, "edit": True },
      "Mix_Management": { "view": True, "edit": False }
    },
     "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": True },
      "Legal_Summary": { "edit": True },
    },
    "Legal":{
      "Summary": { "view": True, "edit": False },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "FTN_Gallons_by_Year": { "edit": True },
      "Cumulative_Gallons": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "PCNA_Economics": {
      "Reports": { "edit": False },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":False, "edit": False},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":False, "edit": False},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":False, "edit": False},
      "Innovation Equipment": { "view":False, "edit": False},
      "Add-ons": { "view":False, "edit": False},
      "Equipment & Service Parameters - Inflation Rate": { "view":False, "edit": False},
      "EQ - Pricing Management": { "view":False, "edit": False},
      "Pricing Upload": { "view":False, "edit": False},
    }
  },
  "4": {  
    "Customer": {
      "Listing": { "edit": True },
      "Create": { "edit": False },
      "View": { "edit": True },
      "Edit": { "edit": False },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": { "edit": False },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": False },
      "Archive": { "edit": True }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": False },
      "Outlet_and_volume_growth": { "view": True, "edit": False },
      "FTN_Equipment": { "view": True, "edit": False },
      "Bottling_Territories": { "view": True, "edit": False },
      "Funding_Terms": { "view": True, "edit": True },
      "Other_product_funding": { "view": True, "edit": True }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": False },
      "Bottling_Territory": { "view": True, "edit": False },
      "Outlet_Growth": { "view": True, "edit": False },
      "PBC_Equipment": { "view": True, "edit": False },
      "Funding_terms": { "view": True, "edit": True },
      "Product_Funding": { "view": True, "edit": True },
      "Mix_Management": { "view": True, "edit": False }
    },
     "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": True },
      "Legal_Summary": { "edit": True },
    },
    "Legal":{
      "Summary": { "view": True, "edit": False },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "FTN_Gallons_by_Year": { "edit": True },
      "Cumulative_Gallons": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "PCNA_Economics": {
      "Reports": { "edit": True },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":True, "edit": True},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":True, "edit": True},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":True, "edit": False},
      "Innovation Equipment": { "view":True, "edit": False},
      "Add-ons": { "view":True, "edit": False},
      "Equipment & Service Parameters - Inflation Rate": { "view":True, "edit": True},
      "EQ - Pricing Management": { "view":True, "edit": True},
      "Pricing Upload": { "view":True, "edit": False},
    }
  },
  "5": {  
    "Customer": {
      "Listing": { "edit": False },
      "Create": { "edit": False },
      "View": { "edit": False },
      "Edit": { "edit": False },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": {  "edit": False },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": False },
      "Archive": { "edit": True }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": False },
      "Outlet_and_volume_growth": { "view": True, "edit": False },
      "FTN_Equipment": { "view": False, "edit": False },
      "Bottling_Territories": { "view": False, "edit": False },
      "Funding_Terms": { "view": True, "edit": True },
      "Other_product_funding": { "view": True, "edit": True }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": False },
      "Bottling_Territory": { "view": False, "edit": False },
      "Outlet_Growth": { "view": True, "edit": False },
      "PBC_Equipment": { "view": False, "edit": False },
      "Funding_terms": { "view": True, "edit": True },
      "Product_Funding": { "view": True, "edit": True },
      "Mix_Management": { "view": True, "edit": False }
    },
     "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": True },
      "Legal_Summary": { "edit": True },
    },
    "Legal":{
      "Summary": { "view": True, "edit": False },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "FTN_Gallons_by_Year": { "edit": True },
      "Cumulative_Gallons": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "PCNA_Economics": {
      "Reports": { "edit": True },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":True, "edit": True},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":True, "edit": True},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":True, "edit": False},
      "Innovation Equipment": { "view":True, "edit": False},
      "Add-ons": { "view":True, "edit": False},
      "Equipment & Service Parameters - Inflation Rate": { "view":True, "edit": True},
      "EQ - Pricing Management": { "view":True, "edit": True},
      "Pricing Upload": { "view":True, "edit": False},
    }
  },
  "6": {  
    "Customer": {
      "Listing": { "edit": False },
      "Create": { "edit": False },
      "View": { "edit": False },
      "Edit": { "edit": False },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": {  "edit": False },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": False },
      "Archive": { "edit": True }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": False },
      "Outlet_and_volume_growth": { "view": False, "edit": False },
      "FTN_Equipment": { "view": True, "edit": False },
      "Bottling_Territories": { "view": True, "edit": False },
      "Funding_Terms": { "view": True, "edit": False },
      "Other_product_funding": { "view": True, "edit": False }
    },  
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": False },
      "Bottling_Territory": { "view": True, "edit": False },
      "Outlet_Growth": { "view": False, "edit": False },
      "PBC_Equipment": { "view": True, "edit": False },
      "Funding_terms": { "view": True, "edit": False },
      "Product_Funding": { "view": True, "edit": False },
      "Mix_Management": { "view": False, "edit": False }
    },  
     "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": False },
      "Legal_Summary": { "edit": False },
    },
    "Legal":{
      "Summary": { "view": False, "edit": False },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": False },
      "Outlet_Summary": { "edit": False },
      "FTN_Gallons_by_Year": { "edit": False },
      "Cumulative_Gallons": { "edit": False },
      "Funding_Summary": { "edit": False }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "PCNA_Economics": {
      "Reports": { "edit": True },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":False, "edit": False},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":False, "edit": False},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":False, "edit": False},
      "Innovation Equipment": { "view":False, "edit": False},
      "Add-ons": { "view":False, "edit": False},
      "Equipment & Service Parameters - Inflation Rate": { "view":False, "edit": False},
      "EQ - Pricing Management": { "view":False, "edit": False},
      "Pricing Upload": { "view":False, "edit": False},
    }
  },
  "8": {  
    "Customer": {
      "Listing": { "edit": True },
      "Create": { "edit": False },
      "View": { "edit": True },
      "Edit": { "edit": False },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": { "edit": False },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": False },
      "Archive": { "edit": True }
    },
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": False },
      "Outlet_and_volume_growth": { "view": True, "edit": False },
      "FTN_Equipment": { "view": True, "edit": False },
      "Bottling_Territories": { "view": True, "edit": False },
      "Funding_Terms": { "view": True, "edit": False },
      "Other_product_funding": { "view": True, "edit": False }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": False },
      "Bottling_Territory": { "view": True, "edit": False },
      "Outlet_Growth": { "view": True, "edit": False },
      "PBC_Equipment": { "view": True, "edit": False },
      "Funding_terms": { "view": True, "edit": False },
      "Product_Funding": { "view": True, "edit": False },
      "Mix_Management": { "view": True, "edit": False }
    },
     "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": True },
      "Legal_Summary": { "edit": True },
    },
    "Legal":{
      "Summary": { "view": True, "edit": True },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "FTN_Gallons_by_Year": { "edit": True },
      "Cumulative_Gallons": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "PCNA_Economics": {
      "Reports": { "edit": False },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":False, "edit": False},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":False, "edit": False},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":False, "edit": False},
      "Innovation Equipment": { "view":False, "edit": False},
      "Add-ons": { "view":False, "edit": False},
      "Equipment & Service Parameters - Inflation Rate": { "view":False, "edit": False},
      "EQ - Pricing Management": { "view":False, "edit": False},
      "Pricing Upload": { "view":False, "edit": False},
    }
  },
  "9": {  
    "Customer": {
      "Listing": { "edit": False },
      "Create": { "edit": False },
      "View": { "edit": False },
      "Edit": { "edit": False },
      "Archive": { "edit": False },
    },
    "Deal": {
      "Listing": { "edit": True },
      "Create": { "edit": False },
      "View": { "edit": True },
      "Modify": { "edit": True },
      "Clone": { "edit": False },
      "Archive": { "edit": True }
    },
    "FTN_Deal_Structure": {
      "Products": { "view": True, "edit": False },
      "Outlet_and_volume_growth": { "view": True, "edit": False },
      "FTN_Equipment": { "view": True, "edit": False },
      "Bottling_Territories": { "view": True, "edit": False },
      "Funding_Terms": { "view": True, "edit": False },
      "Other_product_funding": { "view": True, "edit": False }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": True, "edit": False },
      "Bottling_Territory": { "view": True, "edit": False },
      "Outlet_Growth": { "view": True, "edit": False },
      "PBC_Equipment": { "view": True, "edit": False },
      "Funding_terms": { "view": True, "edit": False },
      "Product_Funding": { "view": True, "edit": False },
      "Mix_Management": { "view": True, "edit": False }
    },
     "Reports": {
      "Executive_Summary": { "edit": True },
      "Deal_Financials": { "edit": True },
      "Legal_Summary": { "edit": True },
    },
    "Legal":{
      "Summary": { "view": True, "edit": False },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "FTN_Gallons_by_Year": { "edit": True },
      "Cumulative_Gallons": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": True },
      "8oz_Cases": { "edit": True },
      "Outlet_Summary": { "edit": True },
      "Equipment_Summary": { "edit": True },
      "Funding_Summary": { "edit": True }
    },
    "PCNA_Economics": {
      "Reports": { "edit": False },
    },
    "Lookups" : {
      "Category / Sub Category": { "view":False, "edit": False},
      "Volume" : {"view":False, "edit": False},
      "NAP" : {"view":False, "edit": False},
      "Unit/Case": {"view":False, "edit": False},
      "Bottling Territory": { "view":False, "edit": False},
      "Inflation Rates": { "view":False, "edit": False},
      "Funding Summary": { "view":False, "edit": False},
      "Segment / Sub segment": { "view":False, "edit": False},
      "National / Division": { "view":False, "edit": False},
      "Product Pricing": { "view":False, "edit": False},
      "National Average": { "view":False, "edit": False},
      "Equipment Type": { "view":False, "edit": False},
      "Innovation Equipment": { "view":False, "edit": False},
      "Add-ons": { "view":False, "edit": False},
      "Equipment & Service Parameters - Inflation Rate": { "view":False, "edit": False},
      "EQ - Pricing Management": { "view":False, "edit": False},
      "Pricing Upload": { "view":False, "edit": False},
    }
  },
}


COMMUNICATION_ACTION_ROLE = {
  "NASM": 1,
  "EQUIPMENT": 2,
  "SALES": 3,
  "COE": 4,
  "FINANCE": 5,
  "PARTNERS": 6,
  "CUSTOMER": 7,
  "LEGAL": 8,
}

COMMUNICATION_ACTION_NAME = {
    1: "NASM_TO_EQUIPMENT",
    2: "NASM_TO_SALES",
    3: "NASM_TO_COE",
    4: "NASM_TO_FINANCE",
    5: "NASM_TO_PARTNERS",
    6: "NASM_TO_CUSTOMER",
    7: "NASM_TO_LEGAL",

    11: "EQUIPMENT_TO_SALES",
    12: "SALES_TO_COE",
    13: "COE_TO_FINANCE",
    14: "FINANCE_TO_PARTNERS",
    15: "PARTNERS_TO_CUSTOMER",
    16: "CUSTOMER_TO_LEGAL",

    21: "EQUIPMENT_TO_NASM",
    22: "SALES_TO_NASM",
    23: "COE_TO_NASM",
    24: "FINANCE_TO_NASM",
    25: "PARTNERS_TO_NASM",
    26: "CUSTOMER_TO_NASM",
    27: "LEGAL_TO_NASM",

    8: "NASM_DEAL_ACTIVATE",
}

COMMUNICATION_DEAL_STATUS_BY_ACTION_NAME = {
  "NASM_TO_EQUIPMENT": 2,
  "NASM_TO_SALES": 3,
  "NASM_TO_COE": 4,
  "NASM_TO_FINANCE": 5,
  "NASM_TO_PARTNERS": 6, 
  "NASM_TO_CUSTOMER": 7, 
  "NASM_TO_LEGAL": 8, 
  "EQUIPMENT_TO_SALES": 3, 
  "SALES_TO_COE": 4, 
  "COE_TO_FINANCE": 5, 
  "FINANCE_TO_PARTNERS": 6, 
  # "PARTNERS_TO_CUSTOMER": 7, skipping
  "PARTNERS_TO_CUSTOMER": 8, 
  "CUSTOMER_TO_LEGAL": 8, 
  "EQUIPMENT_TO_NASM": 1, 
  "SALES_TO_NASM": 1, 
  "COE_TO_NASM": 1, 
  "FINANCE_TO_NASM": 1, 
  "PARTNERS_TO_NASM": 1, 
  "CUSTOMER_TO_NASM": 1, 
  "LEGAL_TO_NASM": 1, 
  "NASM_DEAL_ACTIVATE": 9
}


COMMUNICATION_ACTION_NEXT = {
  "NASM": 1,
  "EQUIPMENT": 11,
  "SALES": 12,
  "COE": 13,
  "FINANCE": 14,
  "PARTNERS": 15,
  # "CUSTOMER": 16,
  "LEGAL": 27,
}

COMMUNICATION_ACTION_NEXT_DEAL_STATUS = {
  "NASM": 2,
  "EQUIPMENT": 3,
  "SALES": 4,
  "COE": 5,
  "FINANCE": 6,
  "PARTNERS": 7,
  # "CUSTOMER": 8,
  "LEGAL": 1,
}

LOOKUP_PERMISSIONS = {
  "equipments":"Equipment Type",
  "category":"Category / Sub Category",
  "volume":"Volume",
  "nap":"NAP",
  "unit":"Unit/Case",
  "bottling":"Bottling Territory",
  "rates":"Inflation Rates",
  "funding":"Funding Summary",
  "segment":"Segment / Sub segment",
  "national":"National / Division",
  "product":"Product Pricing",
  "average":"National Average",
  "innovation":"Innovation Equipment",
  "addon":"Add-ons",
  "service":"Equipment & Service Parameters - Inflation Rate",
  "eq":"EQ - Pricing Management",
  "pricing":"Pricing Upload"
}

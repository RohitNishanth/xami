export const DEPARTMENTS = {
  1: "NASM",
  2: "Equipment",
  3: "Sales",
  4: "COE",
  5: "Finance",
  6: "Partners",
  8: "Legal",
  9: "Director",
};
export const USER_ROLE = {
  1: "Sales Lead",
  2: "Sales Manager",
  3: "Sales Person",
};

export const LAUNCH_USER = {
  1: "Products",
  2: "Growth",
  3: "Equipment",
  4: "Funding",
};

export const LIMITED_ACCESS = [
  { cat: "Group 1", key: "Equipment" },
  { cat: "Group 1", key: "Growth" },
  { cat: "Group 1", key: "Product" },
];

export const BC_CTS = {
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
};

export const NATIONAL = {
  1: "Sector",
  2: "Division",
};

export const DIVISION = {
  1: "North",
  2: "South",
  3: "East",
  4: "West",
  5: "Central",
};

export const PRODUCT_TYPES = {
  1: "Standard",
  2: "Standalone",
};

export const DEAL_TYPES = {
  1: "New Business",
  2: "Renewal",
  3: "Early Renewal",
  4: "Amendment",
  5: "Promotion",
  6: "Extension",
  7: "Contingency",
};

export const DEAL_TERMS = {
  1: "Time Commitment",
  2: "Volume Commitment Gallons",
  3: "Volume Commitment Cases",
  4: "Volume Commitment Gallons",
  5: "Volume Commitment Gallons",
  6: "Volume Commitment Cases",
};

export const BC_SIGNERS = {
  y: "Yes",
  n: "No",
  m: "Mixed",
  na: "N/A",
};

export const EQUIPMENT_FIELD_TYPES = {
  char: "Character",
  number: "Number",
  percentage: "%",
  price: "$",
};

export const TYPE_OF_FUNDING = [
  {id: 1, name: "Fixed Asset"}, 
  {id: 2, name: "Earned Funding"}
]

export const RESTRICTED_USER_TYPES = [2];

export const RESTRICTED_BNC_FSV_FIELDS = [
  "refurb mix %", "base cost", "# per outlet", "# current equip"
]

export const SWEETENER_TYPE = [
  {id: 'hfcs', name: "HFCS"},
  {id: 'sucrose', name: "Sucrose"},
  {id: 'other', name: "Other"}
]

export const USER_ACCESS_DEFAULT = {
  "1": {  
    "Customer": {
      "Listing": { "edit": true },
      "Create": { "edit": true },
      "View": { "edit": true },
      "Edit": { "edit": true },
      "Archive": { "edit": true },
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create": {  "edit": true },
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "edit": true },
      "Archive": { "edit": true },
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": true },
      "Outlet_and_volume_growth": { "view": true, "edit": true },
      "FTN_Equipment": { "view": true, "edit": true },
      "Bottling_Territories": { "view": true, "edit": true },
      "Funding_Terms": { "view": true, "edit": true },
      "Other_product_funding": { "view": true, "edit": true }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": true },
      "Bottling_Territory": { "view": true, "edit": true },
      "Outlet_Growth": { "view": true, "edit": true },
      "PBC_Equipment": { "view": true, "edit": true },
      "Funding_terms": { "view": true, "edit": true },
      "Product_Funding": { "view": true, "edit": true },
      "Mix_Management": { "view": true, "edit": true }
    },
    "Reports": {
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "edit": true },
      "Legal_Summary": { "edit": true },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "FTN_Gallons_by_Year": { "edit": true },
      "Cumulative_Gallons": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "PCNA_Economics": {
      "Reports":  { "enable":false, "edit": false},
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "enable":false, "view":false, "edit": false},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "enable":false, "view":false, "edit": false},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "enable":false, "view":false, "edit": false},
      "Innovation Equipment": { "enable":false, "view":false, "edit": false},
      "Add-ons": { "enable":false, "view":false, "edit": false},
      "Equipment & Service Parameters - Inflation Rate": { "enable":false, "view":false, "edit": false},
      "EQ - Pricing Management": { "enable":false, "view":false, "edit": false},
      "Pricing Upload": { "enable":false, "view":false, "edit": false},
    }
  }, 
  "2": {  
    "Customer": {
      "Listing": { "enable":false, "edit": false},
      "Create": { "enable":false, "edit": false},
      "View": { "enable":false, "edit": false},
      "Edit": { "enable":false, "edit": false},
      "Archive": { "enable":false, "edit": false},
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create":  { "enable":false, "edit": false},
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "edit": false },
      "Archive": { "edit": true },
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": false },
      "Outlet_and_volume_growth": { "view": true, "edit": false },
      "FTN_Equipment": { "view": true, "edit": true },
      "Bottling_Territories": { "view": true, "edit": false },
      "Funding_Terms": { "enable":false, "view": false, "edit": false },
      "Other_product_funding": { "enable":false, "view": false, "edit": false }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": false },
      "Bottling_Territory": { "view": true, "edit": false },
      "Outlet_Growth": { "view": true, "edit": false },
      "PBC_Equipment": { "view": true, "edit": true },
      "Funding_terms": { "enable":false, "view": false, "edit": false },
      "Product_Funding": { "enable":false, "view": false, "edit": false },
      "Mix_Management": { "view": true, "edit": false }
    },
    "Reports": {
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "enable":false,"edit": false },
      "Legal_Summary": { "enable":false,"edit": false },

    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "FTN_Gallons_by_Year": { "edit": true },
      "Cumulative_Gallons": { "edit": true },
      "Funding_Summary": { "enable":false, "edit": false }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "enable":false, "edit": false }
    },
    "PCNA_Economics": {
      "Reports": { "enable":false, "edit": false },
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "enable":false, "view":false, "edit": false},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "enable":false, "view":false, "edit": false},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "view":true, "edit": true},
      "Innovation Equipment": { "view":true, "edit": true},
      "Add-ons": { "view":true, "edit": true},
      "Equipment & Service Parameters - Inflation Rate": { "view":true, "edit": true},
      "EQ - Pricing Management": { "view":true, "edit": true},
      "Pricing Upload": { "view":true, "edit": false}
    }
  },
  "3": {  
    "Customer": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Edit": { "enable":false, "edit": false },
      "Archive": { "enable":false, "edit": false },
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "enable":false, "edit": false },
      "Archive": { "edit": true }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": false },
      "Outlet_and_volume_growth": { "view": true, "edit": false },
      "FTN_Equipment": { "view": true, "edit": false },
      "Bottling_Territories": { "view": true, "edit": false },
      "Funding_Terms": { "view": true, "edit": true },
      "Other_product_funding": { "view": true, "edit": true }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": false },
      "Bottling_Territory": { "view": true, "edit": false },
      "Outlet_Growth": { "view": true, "edit": false },
      "PBC_Equipment": { "view": true, "edit": false },
      "Funding_terms": { "view": true, "edit": true },
      "Product_Funding": { "view": true, "edit": true },
      "Mix_Management": { "view": true, "edit": false }
    },
     "Reports": {
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "edit": true },
      "Legal_Summary": { "edit": true },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "FTN_Gallons_by_Year": { "edit": true },
      "Cumulative_Gallons": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "PCNA_Economics": {
      "Reports": { "enable":false, "edit": false },
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "enable":false, "view":false, "edit": false},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "enable":false, "view":false, "edit": false},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "enable":false, "view":false, "edit": false},
      "Innovation Equipment": { "enable":false, "view":false, "edit": false},
      "Add-ons": { "enable":false, "view":false, "edit": false},
      "Equipment & Service Parameters - Inflation Rate": { "enable":false, "view":false, "edit": false},
      "EQ - Pricing Management": { "enable":false, "view":false, "edit": false},
      "Pricing Upload": { "enable":false, "view":false, "edit": false},
    }

  },
  "4": {  
    "Customer": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Edit": { "enable":false, "edit": false },
      "Archive": { "enable":false, "edit": false },
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "edit": false },
      "Archive": { "edit": true }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": false },
      "Outlet_and_volume_growth": { "view": true, "edit": false },
      "FTN_Equipment": { "view": true, "edit": false },
      "Bottling_Territories": { "view": true, "edit": false },
      "Funding_Terms": { "view": true, "edit": true },
      "Other_product_funding": { "view": true, "edit": true }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": false },
      "Bottling_Territory": { "view": true, "edit": false },
      "Outlet_Growth": { "view": true, "edit": false },
      "PBC_Equipment": { "view": true, "edit": false },
      "Funding_terms": { "view": true, "edit": true },
      "Product_Funding": { "view": true, "edit": true },
      "Mix_Management": { "view": true, "edit": false }
    },
     "Reports": {
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "edit": true },
      "Legal_Summary": { "edit": true },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "FTN_Gallons_by_Year": { "edit": true },
      "Cumulative_Gallons": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "PCNA_Economics": {
      "Reports": { "edit": true },
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "view":true, "edit": true},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "view":true, "edit": true},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "view":true, "edit": false},
      "Innovation Equipment": { "view":true, "edit": false},
      "Add-ons": { "view":true, "edit": false},
      "Equipment & Service Parameters - Inflation Rate": { "view":true, "edit": true},
      "EQ - Pricing Management": { "view":true, "edit": true},
      "Pricing Upload": { "view":true, "edit": false}
    }
  },
  "5": {  
    "Customer": {
      "Listing": { "enable":false, "edit": false },
      "Create": { "enable":false, "edit": false },
      "View": { "enable":false, "edit": false },
      "Edit": { "enable":false, "edit": false },
      "Archive": { "enable":false, "edit": false },
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "enable":false, "edit": false },
      "Archive": { "edit": true }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": false },
      "Outlet_and_volume_growth": { "view": true, "edit": false },
      "FTN_Equipment": { "enable":false, "view": false, "edit": false },
      "Bottling_Territories": { "enable":false, "view": false, "edit": false },
      "Funding_Terms": { "view": true, "edit": true },
      "Other_product_funding": { "view": true, "edit": true }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": false },
      "Bottling_Territory": { "enable":false, "view": false, "edit": false },
      "Outlet_Growth": { "view": true, "edit": false },
      "PBC_Equipment": { "enable":false, "view": false, "edit": false },
      "Funding_terms": { "view": true, "edit": true },
      "Product_Funding": { "view": true, "edit": true },
      "Mix_Management": { "view": true, "edit": false }
    },
     "Reports": {
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "edit": true },
      "Legal_Summary": { "edit": true },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "FTN_Gallons_by_Year": { "edit": true },
      "Cumulative_Gallons": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "PCNA_Economics": {
      "Reports": { "edit": true },
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "view":true, "edit": true},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "view":true, "edit": true},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "view":true, "edit": false},
      "Innovation Equipment": { "view":true, "edit": false},
      "Add-ons": { "view":true, "edit": false},
      "Equipment & Service Parameters - Inflation Rate": { "view":true, "edit": true},
      "EQ - Pricing Management": { "view":true, "edit": true},
      "Pricing Upload": { "view":true, "edit": false}
    }
  },
  "6": {  
    "Customer": {
      "Listing": { "enable":false, "edit": false },
      "Create": { "enable":false, "edit": false },
      "View": { "enable":false, "edit": false },
      "Edit": { "enable":false, "edit": false },
      "Archive": { "enable":false, "edit": false },
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create": {  "enable":false, "edit": false },
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "enable":false, "edit": false },
      "Archive": { "edit": true }
    },
    "Deal - Wizard": {},
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": false },
      "Outlet_and_volume_growth": { "enable":false, "view": false, "edit": false },
      "FTN_Equipment": { "view": true, "edit": false },
      "Bottling_Territories": { "view": true, "edit": false },
      "Funding_Terms": { "enable":false, "view": false, "edit": false },
      "Other_product_funding": { "enable":false, "view": false, "edit": false }
    },  
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": false },
      "Bottling_Territory": { "view": true, "edit": false },
      "Outlet_Growth": { "enable":false, "view": false, "edit": false },
      "PBC_Equipment": { "view": true, "edit": false },
      "Funding_terms": { "view": true, "edit": false },
      "Product_Funding": { "view": true, "edit": false },
      "Mix_Management": { "enable":false,"view": false, "edit": false }
    },  
     "Reports": { 
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "enable":false,"edit": false },
      "Legal_Summary": {  "enable":false, "edit": false },
    },
    "Fountain_Report": {
      "Volume_Summary": { "enable":false, "edit": false },
      "Outlet_Summary": { "enable":false, "edit": false },
      "FTN_Gallons_by_Year": { "enable":false, "edit": false },
      "Cumulative_Gallons": { "enable":false, "edit": false },
      "Funding_Summary": { "enable":false, "edit": false }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "PCNA_Economics": {
      "Reports": { "enable":false, "edit": false },
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "enable":false, "view":false, "edit": false},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "enable":false, "view":false, "edit": false},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "enable":false, "view":false, "edit": false},
      "Innovation Equipment": { "enable":false, "view":false, "edit": false},
      "Add-ons": { "enable":false, "view":false, "edit": false},
      "Equipment & Service Parameters - Inflation Rate": { "enable":false, "view":false, "edit": false},
      "EQ - Pricing Management": { "enable":false, "view":false, "edit": false},
      "Pricing Upload": { "enable":false, "view":false, "edit": false},
    }
  },
  "8": {  
    "Customer": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Edit": { "enable":false, "edit": false },
      "Archive": { "enable":false, "edit": false },
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "enable":false, "edit": false },
      "Archive": { "edit": true }
    },
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": false },
      "Outlet_and_volume_growth": { "view": true, "edit": false },
      "FTN_Equipment": { "view": true, "edit": false },
      "Bottling_Territories": { "view": true, "edit": false },
      "Funding_Terms": { "view": true, "edit": false },
      "Other_product_funding": { "view": true, "edit": false }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": false },
      "Bottling_Territory": { "view": true, "edit": false },
      "Outlet_Growth": { "view": true, "edit": false },
      "PBC_Equipment": { "view": true, "edit": false },
      "Funding_terms": { "view": true, "edit": false },
      "Product_Funding": { "view": true, "edit": false },
      "Mix_Management": { "view": true, "edit": false }
    },
     "Reports": {
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "edit": true },
      "Legal_Summary": { "edit": true },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "FTN_Gallons_by_Year": { "edit": true },
      "Cumulative_Gallons": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "PCNA_Economics": {
      "Reports": { "enable":false, "edit": false },
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "enable":false, "view":false, "edit": false},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "enable":false, "view":false, "edit": false},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "enable":false, "view":false, "edit": false},
      "Innovation Equipment": { "enable":false, "view":false, "edit": false},
      "Add-ons": { "enable":false, "view":false, "edit": false},
      "Equipment & Service Parameters - Inflation Rate": { "enable":false, "view":false, "edit": false},
      "EQ - Pricing Management": { "enable":false, "view":false, "edit": false},
      "Pricing Upload": { "enable":false, "view":false, "edit": false},
    }
  },
  "9": {  
    "Customer": {
      "Listing": { "enable":false, "edit": false },
      "Create": { "enable":false, "edit": false },
      "View": { "enable":false, "edit": false },
      "Edit": { "enable":false, "edit": false },
      "Archive": { "enable":false, "edit": false },
    },
    "Deal": {
      "Listing": { "edit": true },
      "Create": { "enable":false, "edit": false },
      "View": { "edit": true },
      "Modify": { "edit": true },
      "Clone": { "enable":false, "edit": false },
      "Archive": { "edit": true }
    },
    "FTN_Deal_Structure": {
      "Products": { "view": true, "edit": false },
      "Outlet_and_volume_growth": { "view": true, "edit": false },
      "FTN_Equipment": { "view": true, "edit": false },
      "Bottling_Territories": { "view": true, "edit": false },
      "Funding_Terms": { "view": true, "edit": false },
      "Other_product_funding": { "view": true, "edit": false }
    },
    "B&C_Deal_Stucture": {
      "Products": { "view": true, "edit": false },
      "Bottling_Territory": { "view": true, "edit": false },
      "Outlet_Growth": { "view": true, "edit": false },
      "PBC_Equipment": { "view": true, "edit": false },
      "Funding_terms": { "view": true, "edit": false },
      "Product_Funding": { "view": true, "edit": false },
      "Mix_Management": { "view": true, "edit": false }
    },
     "Reports": {
      "Executive_Summary": { "edit": true },
      "Deal_Financials": { "edit": true },
      "Legal_Summary": { "edit": true },
    },
    "Fountain_Report": {
      "Volume_Summary": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "FTN_Gallons_by_Year": { "edit": true },
      "Cumulative_Gallons": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "Bottle_and_Cans_Report": {
      "Raw_cases": { "edit": true },
      "8oz_Cases": { "edit": true },
      "Outlet_Summary": { "edit": true },
      "Equipment_Summary": { "edit": true },
      "Funding_Summary": { "edit": true }
    },
    "PCNA_Economics": {
      "Reports": { "edit": false },
    },
    "Lookups" : {
      "Category / Sub Category": { "enable":false, "view":false, "edit": false},
      "Volume" : { "enable":false, "view":false, "edit": false},
      "NAP" : { "enable":false, "view":false, "edit": false},
      "Unit/Case": { "enable":false, "view":false, "edit": false},
      "Bottling Territory": { "enable":false, "view":false, "edit": false},
      "Inflation Rates": { "enable":false, "view":false, "edit": false},
      "Funding Summary": { "enable":false, "view":false, "edit": false},
      "Segment / Sub segment": { "enable":false, "view":false, "edit": false},
      "National / Division": { "enable":false, "view":false, "edit": false},
      "Product Pricing": { "enable":false, "view":false, "edit": false},
      "National Average": { "enable":false, "view":false, "edit": false},
      "Equipment Type": { "enable":false, "view":false, "edit": false},
      "Innovation Equipment": { "enable":false, "view":false, "edit": false},
      "Add-ons": { "enable":false, "view":false, "edit": false},
      "Equipment & Service Parameters - Inflation Rate": { "enable":false, "view":false, "edit": false},
      "EQ - Pricing Management": { "enable":false, "view":false, "edit": false},
      "Pricing Upload": { "enable":false, "view":false, "edit": false},
    }
  },
}

export const FTN_RATE_TYPE = [
  { value: 1, label: "Annual" },
  { value: 2, label: "$/Gallon" },
  { value: 3, label: "Tiered - $/Gallon" },
  { value: 4, label: "$/Outlet" },
  { value: 5, label: "$/New Outlet" },
  { value: 6, label: "$/Growth Gallon" },
  { value: 7, label: "No Funding" },
];


export const BNC_RATE_TYPE = [
  { value: 1, label: "Annual" },
  { value: 2, label: "$/Raw Case" },
  { value: 8, label: "$/Eqlzd Case" },
  { value: 3, label: "Tiered - $/Raw Case" },
  { value: 9, label: "Tiered - $/Eqlzd. Case" },
  { value: 6, label: "$/Raw Growth Case" },
  { value: 10, label: "$/Eqlzd Growth Case" },
  { value: 7, label: "No Funding" },
  { value: 4, label: "$/Outlet" },
  { value: 5, label: "$/New Outlet" },
  { value: 6, label: "$/Growth Case" },
  { value: 7, label: "No Funding" },
];

export const LOOKUP_PERMISSION_GROUPS = {
  "Lookups": [
    "Category / Sub Category",
    "Volume",
    "NAP",
    "Unit/Case",
    "Bottling Territory",
    "Inflation Rates",
    "Funding Summary",
  ],
  "Accounts": ["National / Division", "Segment / Sub Segment"],
  "National Average": ["National Average"],
  "Equipment": [
    "Equipment Type",
    "Innovation Equipment",
    "Add-Ons",
    "Equipment & Service Parameters - Inflation Rate",
  ],
};

import React from "react";

import Dashboard from "../pages/dashboard/Dashboard";
// Authentication Pages
import Login from "../pages/login/Login";
import ResetPassword from "../pages/login/ResetPassword";
import ForgotPassword from "../pages/login/ForgotPassword";
import EmailSent from "../pages/login/EmailSent";
import ChangePassword from "../pages/change_password/ChangePassword";
import Adduser from "../pages/user/AddUser";
import UserTable from "../pages/user/userList";
import EditUser from "../pages/user/EditUser";
import ResetPasswordInvalid from "../pages/login/ResetPasswordInvalid";

// customer pages
import CustomerTable from "../pages/customer/CustomerList";
import AddCustomer from "../pages/customer/AddCustomer";
import EditCustomer from "../pages/customer/EditCustomer";
import CustomerAccount from "../pages/customer/CustomerAccount";

// Deal pages
// import DealTable from "../pages/deal/DealList";

import Lookups from "../pages/lookup/lookup";
import DealLayout from "../pages/deal/DealLayout";
import DealsList from "../pages/deals/deals_list";
import MainDealLayout from "../pages/deal/MainDealLayout";
import ReportLayout from "../pages/reports/ReportLayouts";
import { components } from "react-select";

export const authProtectedRoutes = [
  { path: "/dashboard", component: Dashboard },
  { path: "/lookup", component: Lookups },
  { path: "/lookup/category", component: Lookups },
  { path: "/lookup/sub-category", component: Lookups },
  { path: "/lookup/segment", component: Lookups },
  { path: "/lookup/sub-segments", component: Lookups },
  { path: "/lookup/volume", component: Lookups },
  { path: "/lookup/nap", component: Lookups },
  { path: "/lookup/products", component: Lookups },
  { path: "/lookup/national", component: Lookups },
  { path: "/lookup/division", component: Lookups },
  { path: "/lookup/accounts", component: Lookups },
  { path: "/lookup/bottling-territory/ftn", component: Lookups },
  { path: "/lookup/bottling-territory/bc-bottlers", component: Lookups },
  { path: "/changepassword", component: ChangePassword },
  { path: "/adduser", component: Adduser },
  { path: "/userlist", component: UserTable },
  { path: "/edituser/:id", component: EditUser },
  { path: "/lookup/unit", component: Lookups },
  { path: "/lookup/inflation/version", component: Lookups },
  { path: "/lookup/inflation/rate/:version_id", component: Lookups },
  { path: "/lookup/fundingdata/version", component: Lookups },
  { path: "/lookup/fundingdata/rate/:version_id", component: Lookups },
  { path: "/lookup/equipments", component: Lookups },
  { path: "/lookup/equipments/version", component: Lookups },
  { path: "/lookup/equipments-versions/:version_id", component: Lookups },
  { path: "/lookup/equipments-versions/innovation/:version_id", component: Lookups },
  { path: "/lookup/equipments/equipment-type/add/:version_id/:type_id?", component: Lookups },
  { path: "/lookup/equipments/equipment-type/edit/:version_id/:type_id", component: Lookups },
  { path: "/lookup/innovation-equipments", component: Lookups },
  { path: "/lookup/innovation-equipments/add/:version_id/:equip_id?", component: Lookups },
  { path: "/lookup/innovation-equipments/edit/:version_id/:equip_id", component: Lookups },
  { path: "/lookup/equipments/equipment-service-parameters/version", component: Lookups },
  { path: "/lookup/equipments/equipment-service-parameters/rate/:version_id", component: Lookups },
  { path: "/lookup/equipments/equipment-service-parameters/pbcib/:version_id", component: Lookups },
  { path: "/lookup/addons", component: Lookups },
  { path: "/lookup/email-templates", component: Lookups },
  { path: "/lookup/email-templates/add", component: Lookups },
  { path: "/lookup/email-templates/edit/:template_id", component: Lookups },
  { path: "/lookup/email-templates/clone/:template_id", component: Lookups },

  //customer pages
  { path: "/customer/addcustomer", component: AddCustomer },
  { path: "/customer", component: CustomerTable },
  { path: "/customer/editcustomer/:id", component: EditCustomer },
  { path: "/customer-account/:id", component: CustomerAccount },
  { path: "/lookup/national-average", component: Lookups },
  { path: "/deal-list", component: DealsList },

  //Funding
  { path: "/lookup/funding", component: Lookups },
  { path: "/lookup/funding/funding-data/:version_id", component: Lookups },

  //Deal
  { path: "/deal/newDeal/:id", component: DealLayout },
  { path: "/deal/:id/:deal_id", component: DealLayout },
  { path: "/deal/:id/:deal_id/:current_tab", component: DealLayout },
  { path: "/deal/:id/:deal_id/:category_id/:current_tab", component: DealLayout },

  //Deal View
  { path: "/view-deal/:id/:deal_id", component: DealLayout },
  { path: "/view-deal/:id/:deal_id/:current_tab", component: DealLayout },
  { path: "/view-deal/:id/:deal_id/:category_id/:current_tab", component: DealLayout },

  // Fountain deal structure
  { path: "/fountain-deal-strucure/products/:deal_id", component: MainDealLayout },
  { path: "/fountain-deal-strucure/outlet-vol-growth/:deal_id", component: MainDealLayout },
  { path: "/fountain-deal-strucure/equipments/:deal_id", component: MainDealLayout },
  { path: "/fountain-deal-strucure/equipments/:deal_id/:segment?/:sub_segment?", component: MainDealLayout },
  { path: "/fountain-deal-strucure/bottling-territory/:deal_id", component: MainDealLayout },
  { path: "/fountain-deal-strucure/funding-terms/:deal_id", component: MainDealLayout },
  { path: "/fountain-deal-strucure/other-product-funding/:deal_id", component: MainDealLayout },
  { path: "/fountain-deal-strucure/ftn-product-pricing/:deal_id", component: MainDealLayout },

  // View Fountain deal structure
  { path: "/view-fountain-deal-strucure/products/:deal_id", component: MainDealLayout },
  { path: "/view-fountain-deal-strucure/outlet-vol-growth/:deal_id", component: MainDealLayout },
  { path: "/view-fountain-deal-strucure/equipments/:deal_id", component: MainDealLayout },
  { path: "/view-fountain-deal-strucure/equipments/:deal_id/:segment?/:sub_segment?", component: MainDealLayout },
  { path: "/view-fountain-deal-strucure/bottling-territory/:deal_id", component: MainDealLayout },
  { path: "/view-fountain-deal-strucure/funding-terms/:deal_id", component: MainDealLayout },
  { path: "/view-fountain-deal-strucure/other-product-funding/:deal_id", component: MainDealLayout },
  { path: "/view-fountain-deal-strucure/ftn-product-pricing/:deal_id", component: MainDealLayout },

  // BnC deal structure
  { path: "/bottle-and-can/:segment/:deal_id", component: MainDealLayout },
  { path: "/bottle-and-can/products/:deal_id", component: MainDealLayout },
  { path: "/bottle-and-can/bottling-territory/:deal_id", component: MainDealLayout },
  { path: "/bottle-and-can/outlet-growth/:deal_id", component: MainDealLayout },
  { path: "/bottle-and-can/pbc-equipment/:deal_id", component: MainDealLayout },
  { path: "/bottle-and-can/pbc-equipment/:deal_id/:segment?/", component: MainDealLayout },

  // BnC deal structure
  { path: "/view-bottle-and-can/:segment/:deal_id", component: MainDealLayout },
  { path: "/view-bottle-and-can/products/:deal_id", component: MainDealLayout },
  { path: "/view-bottle-and-can/bottling-territory/:deal_id", component: MainDealLayout },
  { path: "/view-bottle-and-can/outlet-growth/:deal_id", component: MainDealLayout },
  { path: "/view-bottle-and-can/pbc-equipment/:deal_id", component: MainDealLayout },
  { path: "/view-bottle-and-can/pbc-equipment/:deal_id/:segment?/", component: MainDealLayout },

  // Deal report screens
  { path: "/deal-reports/:deal_id/:segment?/:sub_segment?", component: ReportLayout },

  // view Deal report screens
  { path: "/view-deal-reports/:deal_id/:segment?/:sub_segment?", component: ReportLayout },
];

export const publicRoutes = [
  { path: "/login", component: Login },
  { path: "/", component: Login },
  { path: "/forgot-password", component: ForgotPassword },
  { path: "/reset-password/:token", component: ResetPassword },
  { path: "/email-sent", component: EmailSent },
  { path: "/linkexpired", component: ResetPasswordInvalid },
  //   { path: "/logout", component: Logout },
  //   { path: "/register", component: Register },
  //   { path: "/forgot-password", component: ForgetPassword },
];

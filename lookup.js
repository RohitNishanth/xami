import React, { useEffect, useState } from "react";
import LookupSideMenu from "../../layout/lookup/sidemenu";
import Breadcrumb from "../../layout/lookup/breadcrumb";
import { useLocation, useNavigate } from "react-router-dom";

import tabContents from "./../../layout/lookup/tabList.json";
import MixTabView from "./mix/MixTabView";
import NapTabView from "./nap/NapTabView";
import SegmentTabView from "./segment/SegementTabView";
import CategoryTabView from "./category/CategoryTabView";
import ProductTabView from "./products/productTabView";
import NationalTabView from "./national/NationalTabView";
import DivisionTabView from "./division/DivisionTabView";
import Loading from "../../components/Loading/Loading";
import NationalAvg from "./products/national_avg/NationalAvg";
import BottlingTabView from "./bottling-territory/BottlingTabView";
import UnitTabView from "./unit/UnitTabView";
import InflationTabView from "./inflation/InflationTabView";
import Equipments from "./equipments/Equipments";
import ManageEquipmentTypes from "./equipments/ManageEquipmentTypes";
import InnovationEquipmentTabView from "./innovation_equipment/InnovationEquipmentTabView";
import InnovationEquipmentForm from "./innovation_equipment/InnovationEquipmentForm";
import EquipmentServiceTabView from "./equipment_and_service/equipmentAndServiceView";
import EmailTemplates from "./email-templates/templatesList";
import ManageEmailTemplates from "./email-templates/manageTemplates";
import AddonTabView from "./addon/AddonTabView";
import FundingTabView from "./funding/FundingTabView";
import EquipmentVersions from "./equipments/EquipmentVersions";
import EquipmentVersionTypes from "./equipments/EquipmentVersionTypes";
import NoAccess from "../../components/NoAccess";
import { checkLookupAccess } from "../../helpers/accessHelper";

const Lookups = (props) => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(null);
  const [tabList, setTabList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const userFromSession = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = userFromSession?.user_data?.is_super_admin;
  const lookupPermissions = userFromSession?.user_data?.custom_permissions?.["Lookups"] || {};
  const canViewUserAccessLookupList = Object.values(userFromSession?.user_data?.custom_permissions?.["Lookups"] || {}).some(
    (item) => item?.edit === true || item?.view === true
  );
  const pathParts = location.pathname.split('/').filter(Boolean); // split and remove empty strings
  const threeSections = '/' + pathParts.slice(0, 3).join('/');
  useEffect(() => {
    let checkAccess = checkLookupAccess(tabContents, threeSections, userFromSession);
    if(!checkAccess && pathParts.length >=4){
      const fourSeg = '/'+pathParts.slice(0,4).join('/');
      checkAccess = checkLookupAccess(tabContents, fourSeg, userFromSession);
    }
    setHasAccess(checkAccess);

    setLoading(false);
  }, [userFromSession, location.pathname]);


  useEffect(() => {
    const currentUrl = location.pathname;

    // Dynamically determine the tabList based on the URL
    const getTabs = (type) => {
      return tabContents?.[0]?.[type] || [];
    };

    const currentPath = location.pathname.replace("/lookup", "").replace(/^\//, "");
    const typeMapping = {
      products: "product",
      national: "accounts",
      division: "accounts",
      segment: "accounts",
      "sub-segments": "accounts",
      accounts: "accounts",
      category: "category",
      "sub-category": "category",
      "national-average": "national-average",
      "bottling-territory": "category",
      "bc-bottlers": "category",
      unit: "category",
      "email-templates": "email-templates",
      addons: "equipments",
      //"equipments-version": "equipments",
      nap: "category",
    };
    let type = "category";
    // Exact match from map
    if (typeMapping[currentPath]) {
      type = typeMapping[currentPath];
    }
    // Fallback if path includes "equipments"
    else if (currentPath.includes("equipments")) {
      type = "equipments";
    } else if (currentPath.includes("email-templates")) {
      type = "email-templates";
    }
    const tabs = getTabs(type);

    // Set the current tab based on the URL
    const matchedTab = tabs.find((tab) => {
      let url = currentUrl.replace(/\/\d+$/, "");
      url = url.replace(/\/\d+$/, "");
      return url === tab.url;
    });
    setCurrentTab(matchedTab || tabs[0]);
    let filteredTabs;

    if (isSuperAdmin) {
      // Super Admins can see all tabs
      filteredTabs = tabs;
    } else {
      // Show only tabs the user has permission for
      filteredTabs = tabs.filter((tab) => {
        const lookupKey = tab.index_name?.toLowerCase();
        const permission = Object.entries(lookupPermissions).find(
          ([key]) => key.toLowerCase() === lookupKey
        )?.[1];
    
        // Show tab only if user has edit or view permission
        return permission?.edit === true || permission?.view === true;
      });
    }
    
    setTabList(filteredTabs);
    

    
    setLoading(false);
  }, [location]);

  const navigate = useNavigate();
  const changeTab = (tab) => {
    setCurrentTab(tab);
    setResetSearch(true);
    setTimeout(() => {
      setResetSearch(false); // After a short delay, set it back to true
    }, 0);
    navigate(tab.url, { replace: true });
  };
  const [showSearch, setShowSearch] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [isOpenPopup, setOpenPopup] = useState(false);

  useEffect(() => {
    if (currentTab?.name) {
      setShowSearch(!currentTab?.hideSearch);
      setShowFilter(["sub-category", "bc-bottler", "product"].includes(currentTab?.name));
      if (["innovation-equipments-add", "innovation-equipments-edit"].includes(currentTab?.name)) {
        setShowFilter(false);
        setShowSearch(false);
      }
    } else {
      setShowSearch(false);
      setShowFilter(false);
    }
  }, [currentTab?.name, currentTab?.hideSearch]);

  const resetSearchValue = () => {
    setSearch("");
    setResetSearch(true);
    setTimeout(() => {
      setResetSearch(false); // After a short delay, set it back to true
    }, 1000);
  };

  const renderComponent = () => {
    switch (currentTab?.name) {
      case "category":
        return <CategoryTabView subcategory={0} openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "sub-category":
        return <CategoryTabView subcategory={1} openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} filter={filter} />;
      case "volume":
        return <MixTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "nap":
        return <NapTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "unit":
        return <UnitTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "inflation":
        return <InflationTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "funding":
        return <FundingTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "EquipmentService":
        return <EquipmentServiceTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "segment":
        return <SegmentTabView subsegment={0} openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "sub-segment":
        return <SegmentTabView subsegment={1} openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "product":
        return <ProductTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} filter={filter} />;
      case "national":
        return <NationalTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "division":
        return <DivisionTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "national-average":
        return <NationalAvg openModal={isOpenPopup} setClosePopup={isClosePopup} />;
      case "bottling-territory":
        return <BottlingTabView openModal={isOpenPopup} setClosePopup={isClosePopup} />;
      case "bc-bottler":
        return <BottlingTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} filter={filter} />;
      case "equipments":
        return <Equipments openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "equipments-version":
        return <EquipmentVersions openModal={isOpenPopup} closeModalPopup={isClosePopup} search={search} />;
      case "equipments-version_types":
      case "equipments-version_types_innovation":
        return <EquipmentVersionTypes openModal={isOpenPopup} closeModalPopup={isClosePopup} search={search} resetSearchValue={resetSearchValue} />;
      case "add-equipment-type":
      case "edit-equipment-type":
        return <ManageEquipmentTypes />;
      case "innovation-equipments":
        return <InnovationEquipmentTabView openModal={isOpenPopup} setClosePopup={isClosePopup} search={search} />;
      case "innovation-equipments-add":
        return <InnovationEquipmentForm />;
      case "innovation-equipments-edit":
        return <InnovationEquipmentForm />;
      case "addons":
        return <AddonTabView openModal={isOpenPopup} closeModalPopup={isClosePopup} search={search} filter={filter} />;
      case "email-templates":
        return <EmailTemplates search={search} />;
      case "email-templates-add":
      case "email-templates-edit":
        return <ManageEmailTemplates />;
      case "email-templates-clone":
        return <ManageEmailTemplates cloneMode={true} />;
      default:
        return null;
    }
  };

  const openAddForm = () => {
    // open add form
    setOpenPopup(true);
  };

  const [resetSearch, setResetSearch] = useState(false);
  const [resetFilter, setResetFilter] = useState(false);
  const isClosePopup = (reset = false) => {
    // close add form
    setOpenPopup(false);
    setResetSearch(reset);
    setResetFilter(reset);
    setTimeout(() => {
      setResetSearch(false); // After a short delay, set it back to true
    }, 1000);
  };

  const [search, setSearch] = useState("");
  const onSearch = (query) => {
    setSearch(query);
  };

  const [filter, setFilter] = useState({});
  const onFilter = (data) => {
    setFilter(data);
  };

  const [menuShowed, triggerMenuStatus] = useState(0);

  if (loading) return <Loading />;

  return (
    <>
      <Breadcrumb
        showFilter={showFilter}
        onFilter={onFilter}
        resetFilter={resetFilter}
        tab={currentTab}
        breadcrumbs={currentTab?.breadcrumbs}
        openAddForm={openAddForm}
        onSearch={onSearch}
        search={showSearch}
        resetSearch={resetSearch}
        page="Lookups"
      />
      <div className="custom_tabs_content fountain_deal_page mb_100 pb_50">
        <div className="custom_tabs mb_20 mt_10">
          <div className="container-fluid">
            <div className="row d-flex flex-md-nowrap custom_grid custom_grid">
            {(isSuperAdmin || canViewUserAccessLookupList) ? (
            <LookupSideMenu
              menuOpened={triggerMenuStatus}
              onClick={() => {
                setResetSearch(true);
                setTimeout(() => setResetSearch(false), 0);
              }}
            />
            ) : (
                ""
                 )}
              <div className={`col-md-12 position-relative ms-auto ${menuShowed ? "panel-opened" : ""}`}>
                <div className="tab-content" id="myTabContent">
                  <div className={`tab-pane fade active show lookupscreen`} role="tabpanel">
                    {!currentTab?.hideTabs ? (
                      <ul className="nav nav-tabs" id="myTab" role="tablist">
                        {tabList
                          .filter((tab) => !tab?.hide)
                          .map((tab, index) => (
                            <li key={index} className="nav-item nav-item pe-3" role="presentation">
                              <span className={"nav-link d-inline-flex " + (currentTab.id === tab.id ? "active" : "") +
                                (tab.disabled ? " disabled text-muted" : "")} id={tab.id + `-tab`} onClick={() => !tab.disabled && changeTab(tab)} type="button" style={{ cursor: tab.disabled ? "not-allowed" : "pointer" }}>
                                <p>{tab.title}</p>
                              </span>
                            </li>
                          ))}
                      </ul>
                    ) : null}
                    {hasAccess ?renderComponent():<NoAccess />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lookups;

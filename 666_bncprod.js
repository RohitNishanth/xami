import React, { useEffect, useState, useRef } from "react";
import { Spinner } from "reactstrap";
import right_badge_table from "../../../assets/images/right_badge_table.svg";
import delete_icon from "../../../assets/scss/images/delete.svg";
import three_dots from "../../../assets/images/three_dots.svg";
import QAIcon from "../../../assets/images/qa_icon.svg";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, generatePath } from "react-router-dom";
import { updateBnCMixData, updateBnCData, updateBnCProductMixValue, setNewUnit, setCDA, setCurrentCases, updateY1Cases, updateCasePricePercentageData, RemoveSelectedProductUnit } from "../../../features/bnc_deal/bncDealSlice";
import CategoryDropdown from "../../../components/categoryDropdown/categoryDropdown";
import Modal from "../../../components/modalPopup/Modal";
import ProductUnitForm from "./AddBnCProductFrom";
import Swal from "sweetalert2";
import BncMixManagement from "./BncMixManagement";
import { toast } from "react-toastify";
import { handlePercentageField, handleKeyDownPercentage, handleKeyDownPossitiveInt, hideOriginalField, onFocusEmptyValue, showOriginalField, getNumberFormat, formatUSD, starndardNumberFormat, handleKeyDownLimit, USNumberFormat } from "../../../helpers/inputHelpers";
import { setDealDefault } from "../../../features/deal/dealSlice";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import BnCEditableNote from "./BnCEditableNote";
import ReactDOMServer from 'react-dom/server';
import SelectCustom from "../../../components/Select";
//import UnitCaseDropdown from "../../../components/bnc_product_tab/UnitCaseDropdown";
import PopoverWithForm from "../../../components/bnc_product_tab/CasePriceCell";
import PopoverMixForm from "../../../components/bnc_product_tab/MixValueCell"
import { handlePasteLimit } from "../../../helpers/inputHelpers";
import { USER_ACCESS_DEFAULT } from "../../../constants/constants";
import NotesPanel from "../../deals/NotesPanel";
import CommunicationForm from "../../deal/communication/CommunicationForm";
import NoAccess from "../../../components/NoAccess";


const BnCProducts = (props) => {
  const [currentYear, setCurrentYear] = useState(1);
  const [loading, setLoading] = useState(true);
  const casePriceRefs = useRef({});
  const navigate = useNavigate();
  let { deal_id } = useParams();
  const { dealCustomer } = useSelector(state => state.customer);
  const { amendment_years_from_contract_start } = useSelector((state) => state.fountainDeal);
  const [contractDuration, setContractDuration] = useState(0);
  const [startYear, setStartYear] = useState(null);
  const [allSubCategory, setAllSubCategory] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const { pageStatus } = useSelector((state) => state.bnc_deal);
  const [communicationModal, setCommunicationModal] = useState(false);
  const [isMoveToFlag, setIsMoveToFlag] = useState(false);
  const { allProductJson, currentCategory, allProductName } = useSelector((state) => state.bnc_deal);
  const [showYears, setShowYears] = useState(false);
  const [dealType, setDealType] = useState(null);
  const dispatch = useDispatch();
  const [casePriceData, setCasePriceData] = useState(null);
  const [isSaving, setIsSaving] = useState(false)
  const allowNavigate = useRef(false)
  let isEditable = props.isEditable;
  const {amendment_questions} = useSelector((state) => state.fountainDeal);
  const mainKey = "B&C_Deal_Stucture";
  const subKey = "Products";
  // get session user type
  const location = useLocation();
  const isView = location.pathname.startsWith("/view-");
  const userFromSession = JSON.parse(localStorage.getItem("user"));
  const userType = userFromSession?.user_data?.user_type;
  const customPermissions = userFromSession?.user_data?.custom_permissions;
  const userAccessEdit = customPermissions?.[mainKey]?.[subKey]?.edit || false;
  const userAccessView = customPermissions?.[mainKey]?.[subKey]?.view || false;
  if(!userAccessEdit){
    isEditable = false;
  }
  // Check if amendment question 2 (products) is answered as "No" (0 or "0")
  if(userAccessEdit && (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")){
    isEditable = false;
  }
  let isViewPage = true;

  if(!userAccessView){
    isViewPage = false;
  }
  // Add state for notes modal and ref
  const [notesModal, setNotesModal] = useState(false);
  const notesPanelRef = useRef(null);

  useEffect(() => {
    const processData = () => {
      try {
        if (allProductJson) {
          const year = new Date(allProductJson?.contract_begins).getFullYear();

          const subCategoryMap = allProductJson?.sub_categories.reduce((acc, item) => {
            acc[item.sub_category_id] = item.sub_category_name;
            return acc;
          }, {});

          if (Object.keys(subCategoryMap).length !== 0) {
            setAllSubCategory(subCategoryMap);
          }

          if (year) {
            setStartYear(year);
          }

          if (allProductJson?.contract_duration) {
            if(allProductJson?.deal_type){
              setDealType(allProductJson?.deal_type);
            }
            // if(allProductJson?.deal_type != 1){
            //   setContractDuration(Math.min(parseInt(allProductJson?.contract_duration) + 1, 30));
            // }else{
            //   setContractDuration(allProductJson?.contract_duration);
            // }
            setContractDuration(Math.min(Math.ceil((parseFloat(allProductJson?.contract_duration) || 0) + 1), 30));
          }
        }
      } catch (error) {
        console.error("Error processing allProductJson:", error);
      } finally {
        if (allProductJson) {
          setLoading(false);
        }
      }
    };

    processData();

  }, [allProductJson]);

  const getMixValue = (product_data, unit_id) => {
    const mix = product_data.bib_mixes.find(item => item.mix_id === unit_id);
    return mix?.value ? mix.value : "";
  }

  const getProdutData = (product_data, unit_id) => {
    const mix = product_data.bib_mixes.find(item => item.mix_id === unit_id);
    return mix ? mix.product_data : null;
  }

  // Helper function to check if inputs should be disabled based on amendment years
  const shouldDisableInputs = () => {
    // Disable if in base mode
    if (currentYear === "base" || ((dealType == 2 || dealType == 4) && currentYear === 1 && allProductJson?.current_cases === 1)) {
      return true;
    }
    return currentYear <= amendment_years_from_contract_start;
  }
  const updateUnitCasesData = async (mixId, currentYear, key, value, product_id) => {
    // Prevent mix value updates if amendment question 2 (products) is answered as "No" or not editable
    if (!isEditable || (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
      return;
    }

    await dispatch(updateBnCMixData({
      product_id,
      mixId,
      currentYear,
      key,
      value,
      dealType: dealType,
    }));

    if (key === "mix_value") {
      const product = allProductJson?.selected_products?.find((item) => item.product_id === product_id);
      let caseValues = getProdutData(product, mixId)
      const promises = [];

      for (let index = currentYear; index < contractDuration; index++) {
        const oneBasedIndex = index + 1;
        if (caseValues?.[oneBasedIndex]?.mix_override_flag == 1)
          return;
        if (!caseValues?.[oneBasedIndex] || !caseValues?.[oneBasedIndex]?.mix_value || caseValues?.[oneBasedIndex]?.mix_override_flag != 1) {
          promises.push(
            dispatch(updateBnCMixData({ product_id, mixId, currentYear: oneBasedIndex, key, value }))
          );
        }
      }
      if (promises.length > 0)
        await Promise.all(promises);
    }
  }

  function validate_input_length() {
    let selected_products = allProductJson?.selected_products
    let final_products = []
    selected_products.forEach(product => {
      let all_units = product.bib_mixes.filter(mix => product.selected_unit.includes(mix.mix_id))
      all_units = all_units.map(unit => {
        let tempUnit = { ...unit }
        tempUnit.mix_name = allProductJson.mix_data[`${unit.mix_id}`]
        return tempUnit
      })
      all_units.forEach(unit => {
        let tempItem = {
          "product_name": product.product_name,
          "unit_name": unit.mix_name,
          "unit_id": unit.mix_id,
          "product_id": product.product_id,
          "year_data": unit.product_data[0]
        }
        final_products.push(tempItem)
      })
    })

    let errorMsg = ""

    final_products.forEach(product => {
      if (errorMsg) return

      let case_price = product.year_data.case_price
      let sector_cda = product.year_data.sector_cda
      let bottler_cda = product.year_data.bottler_cda
      let pcna_cda = product.year_data.pcna_cda
      let cogs = product.year_data.cogs

      if (case_price && case_price > 999) {
        errorMsg = `${product.product_name} - ${product.unit_name} - Case Price should not be greather than $999.00`
        return false
      }
    })

    if (errorMsg != "") {
      setIsSaving(false)
      toast.error(errorMsg)
      return false
    }

    return true
  }

  const [onProgress, setonProgress] = useState(false);
  const updateAllBnCMixData = async ({allowNavigation = false}) => {

    if (!validate_input_length()) {
      return
    }

    let validateFields = [
      { key: 'total_bnc_raw_cases', value: "Total B&C Raw Cases (excl Allied Brands)" },
      // { key: 'pbc_allied_brand_volume', value: "PBC Allied Brand Volume" },
      { key: 'bnc_raw_cases', value: "PBC B&C Raw Cases (incl Allied Brands)" },
    ]
    let errorFlag = false;
    let errorMsg = "";
    let element = null;

    validateFields.forEach(field => {
      if (!Number(allProductJson.y1_cases[field.key])) {
        errorFlag = true;
        element = document.getElementsByName(field.key)[0];
        errorMsg = <div>{field.value + " should be greater than 0"}</div>;
      }
    })

    if (errorFlag) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      toast.error(errorMsg);
      return;
    }
    if (Number(allProductJson.total_bib?.toFixed(1)) != 100) {
      //element focus, element scroll in to view
      toast.error(<div>{"Total Mix should be 100%"}</div>);
      return;
    }
    let total_mix_error = false;
    for (let oneBasedIndex = 2; oneBasedIndex < contractDuration; oneBasedIndex++) {
      const mix_total = total_mix_year(oneBasedIndex);
      const v_mix_total = mix_total?.toFixed(1);
      if (v_mix_total != 100) {
        setCurrentYear(oneBasedIndex);
        toast.error(<div>{"Total Mix should be 100%"}</div>);
        total_mix_error = true;
        return;
      }
    }

    const selected_units_product = allProductJson.selected_products.reduce((acc, product) => {
      acc[product.product_id] = product.selected_unit;
      return acc;
    }, {});

    setIsSaving(true)

    const response = await dispatch(updateBnCData({ allProductJson, selected_units_product }));
    setIsSaving(false)

    if (allowNavigation) {
      props?.handleNext();
    }

    toast.success("Products Saved Successfully")
  }
  const updateUnitCasesMix = (product_id, sub_category_id, bib_id, value, objectKey, current_year) => {
    // Prevent mix value updates if amendment question 2 (products) is answered as "No" or not editable
    if (!isEditable || (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
      return;
    }

    if(dealType != 1){
      updateUnitCasesData(bib_id, current_year, "mix_value", value, product_id);
    }else{
      dispatch(updateBnCProductMixValue({
        product_id: product_id,
        sub_category_id: sub_category_id,
        mix_id: bib_id,
        value: value,
        objectKey: objectKey,
        current_year: current_year,
        dealType: dealType,
      }))
    }
  }
  const yearDropdownRef = useRef(null);

  function handleInputEnter(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      updateAllBnCMixData({})
    }

  }


  // Handle clicks outside the dropdown
  let allInputFields = []
  useEffect(() => {
    function handleClickOutside(event) {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYears(false); // Close only if clicked outside
      }
    }
    document.addEventListener("mousedown", handleClickOutside);


    allInputFields = document.querySelectorAll(".originalCustomMix");
    allInputFields.forEach(field => {
      field.addEventListener("keydown", handleInputEnter)
    })

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      allInputFields.forEach(field => {
        field.removeEventListener("keydown", handleInputEnter)
      })
    };
  }, []);

  const handleUnitChange = (product_id, sub_category_id, bib_id, value, objectKey, index) => {

    dispatch(
      setNewUnit({
        product_id: product_id,
        sub_category_id: sub_category_id,
        mix_id: bib_id,
        value: value,
        objectKey: objectKey,
        index: index
      })
    );
    dispatch(
      updateBnCProductMixValue({
        product_id: product_id,
        sub_category_id: sub_category_id,
        mix_id: bib_id,
        value: 0,
        objectKey: objectKey,
        current_year: currentYear
      })
    );
  }
  const handleDelete = async (product, temp_unit) => {
    let { product_sub_cat_id: id, product_name: name } = product
    let { mix_id: unit, mix_name: unit_name } = temp_unit
    let objectKey = "sub_categories"


    Swal.fire({
      title: `Are you sure you want to delete ${name} ${unit_name}?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm Deletion",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "btn btn-danger",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let product_id = product?.product_id;
          let sub_category_id = product?.product_sub_category_id
          dispatch(
            updateBnCProductMixValue({
              product_id: product_id,
              sub_category_id: sub_category_id,
              mix_id: unit,
              value: "",
              objectKey: objectKey,
              current_year: currentYear
            })
          );
          dispatch(RemoveSelectedProductUnit({ id, product_id, objectKey, unit }));

          Swal.fire("Success!", "Product deleted successfully", "success");
        } catch (err) {
          console.error("Failed to delete the record", err);
          Swal.fire("Error!", "Failed to delete the record.", "error");
        }
      }
    });
  };

  const updateCDA = (index) => {
    dispatch(setCDA({ value: index }))
  }

  const updateCurrentCases = (value) => {
    if(dealType == 2){
      dispatch(setCurrentCases({ value: value }))
    }
  }

  const closePopupWindow = () => {
    setShowPopup(false);
  };
  const updateCasePricePercentage = (index, value) => {
    dispatch(updateCasePricePercentageData({ index, value }))
  }

  const getSumOfProductByKey = (data, key, year, fixed = 2) => {
    let value = data?.sumOfProductData[year - 1]?.[key] || 0
    value = value ? value : 0
    if (fixed == -1) {
      return Number(value)
    }
    else {
      return Number(value).toFixed(fixed)
    }
  }
  const getSumOfFilteredProductByKey = (data, key, year, fixed = 2) => {
    let currentSubCategory = currentCategory
    let value = 0
    if (data?.sumOfFilteredProductData[currentSubCategory]) {
      value = data?.sumOfFilteredProductData[currentSubCategory][year - 1]?.[key] || 0
    }
    if (fixed == -1) {
      return Number(value)
    }
    else {
      return Number(value).toFixed(fixed)
    }
  }
  // function formatUSD(value, min = 2, max = 2) {
  //   const numericValue = Number(value);
  //   if (isNaN(numericValue)) return '$0.00';
  //   if (numericValue === 0) return '$0';
  //   if (Math.abs(numericValue) >= 1_000_000_000) {
  //     const billionValue = numericValue / 1_000_000_000;
  //     const formatted = billionValue % 1 === 0
  //       ? billionValue.toFixed(0)
  //       : billionValue.toFixed(1);
  //     return `$${formatted}B`;
  //   }
  //   if (Math.abs(numericValue) >= 1_000_000) {
  //     const millionValue = numericValue / 1_000_000;
  //     const formatted = millionValue % 1 === 0
  //       ? millionValue.toFixed(0)
  //       : millionValue.toFixed(1);
  //     return `$${formatted}M`;
  //   }
  //   // Ensure min and max are valid non-negative integers
  //   min = typeof min === 'number' && min >= 0 ? min : 2;
  //   max = typeof max === 'number' && max >= 0 ? max : 2;
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: 'USD',
  //     minimumFractionDigits: min,
  //     maximumFractionDigits: max,
  //   }).format(numericValue);
  // }

  // const total_mix_year = (year) => {
  //   if (year === 1) {
  //     return allProductJson.total_bib;
  //   } else {
  //     let total_mix = 0;
  //     allProductJson.selected_products.map((product, index) => {
  //       if (product.selected_unit && (product.product_sub_category_id == currentCategory || currentCategory == -1)) {
  //         return product.selected_unit.map((unit, unit_index) => {
  //           let caseValues = getProdutData(product, unit);
  //           const orgMix = getMixValue(product, unit) || 0;
  //           total_mix += parseFloat(caseValues?.[year - 1]?.mix_value || orgMix);
  //         })
  //       }
  //     })
  //     return (Math.round(total_mix*100)/100);
  //   }
  // }

  const total_mix_year = (year, isFiltered = false) => {
    if (year === 1 && !isFiltered) {
      // For Mix (always unfiltered in Year 1)
      return allProductJson.total_bib;
    } else {
      let total_mix = 0;
      allProductJson.selected_products.map((product) => {
        if (
          (!isFiltered || product.product_sub_category_id == currentCategory || currentCategory == -1) &&
          product.selected_unit
        ) {
          product.selected_unit.map((unit) => {
            let caseValues = getProdutData(product, unit);
            const orgMix = getMixValue(product, unit) || 0;
            if( dealType != 1 && currentYear == 2){
              let caseValue = caseValues?.[year - 1]?.mix_value == "" ? 0 : caseValues?.[year - 1]?.mix_value;
              total_mix += parseFloat(caseValue ?? orgMix);
            }else{
              total_mix += parseFloat(caseValues?.[year - 1]?.mix_value || orgMix);
            }
          });
        }
      });
      return total_mix
      return Math.round(total_mix * 100) / 100;
    }
  };


  if (loading || onProgress)
    return (
      <>
        <section className="custom_tabs_content fountain_deal_page mb_100 pb_50">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <div className="tab-content" id="myTabContent">
                  <div className="tab-pane fade show active" id="one-tab-pane" role="tabpanel" aria-labelledby="one-tab" tabIndex="0">
                    <div className="w-100 pt-1">
                      <div className="row align-items-center border-bottom pb-1">
                        <div className="col-md-6 col-lg-1">
                          <p className="fs_16 fw_300 black-40">Y1 Cases</p>
                        </div>
                        <div className="col-md-12 col-lg-7 border-end border-md-0 mt-lg-0 mt-md-4">
                          <SkeletonTheme >
                            <Skeleton height={50} />
                          </SkeletonTheme>
                        </div>
                        <div className="col-md-6 col-lg-3 mt-lg-0 mt-md-4">
                          <SkeletonTheme >
                            <Skeleton height={50} />
                          </SkeletonTheme>
                        </div>
                      </div>
                      <div className="row mt_40 align-items-center">
                        <div className="col-md-12 col-lg-7">
                          <div className="d-flex flex-wrap justify-content-xl-center align-items-md-center mb-3">
                            <Skeleton height={70} containerClassName="w-100" />
                          </div>
                        </div>
                        <div className="col-md-12 col-lg-5">
                          <div className="sub_table_tabs d-flex  align-items-center col-md-10 col-lg-12 ms-auto">
                            <SkeletonTheme baseColor="#0E0E96" highlightColor="#FFF">
                              <Skeleton height={30} containerClassName="w-100" />
                            </SkeletonTheme>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-md-12">
                          <div className="tab-content sub_table_tabs p-0 m-0 bg-white" id="myTabcustom">
                            <div className="tab-pane fade show active" id="year1-tab-pane" role="tabpanel" aria-labelledby="year1-tab" tabIndex="0">
                              <div className="table-responsive custom_table_1">
                                <table className="table" >
                                  <thead>
                                    <tr>
                                      <th scope="col" width="">Brand Mix</th>
                                      <th scope="col">Category</th>
                                      <th scope="col">Unit/Case</th>
                                      <th scope="col" className="text-end">Mix</th>
                                      <th scope="col" className="text-center" width="">Case Price</th>
                                      <th scope="col" className="text-center" >Net Price</th>
                                      <th scope="col" className="text-center">COGS</th>
                                      <th scope="col" className="text-center" >MC</th>
                                      <th scope="col" className="text-center" >MC $</th>
                                      <th scope="col" className="text-center" >Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="w-100">
                                    <tr>
                                      <td colSpan={10}>
                                        <div className="d-flex justify-content-center align-items-center col-12">
                                          <Skeleton containerClassName="w-100" height={40} />
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan={10}>
                                        <div className="d-flex justify-content-center align-items-center col-12">
                                          <Skeleton containerClassName="w-100" height={40} />
                                        </div>
                                      </td>
                                    </tr>
                                    <tr>
                                      <td colSpan={10}>
                                        <div className="d-flex justify-content-center align-items-center col-12">
                                          <Skeleton containerClassName="w-100" height={40} />
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td>Weighted Average</td>
                                      <td></td>
                                      <td colSpan={7}>
                                        <Skeleton height={40} />
                                      </td>
                                      <td> </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                            <div className="tab-pane fade" id="year2-tab-pane" role="tabpanel" aria-labelledby="year2-tab" tabIndex="0">.2.</div>
                            <div className="tab-pane fade" id="year3-tab-pane" role="tabpanel" aria-labelledby="year3-tab" tabIndex="0">.3.</div>
                            <div className="tab-pane fade" id="year4-tab-pane" role="tabpanel" aria-labelledby="year4-tab" tabIndex="0">.4.</div>
                            <div className="tab-pane fade" id="year5-tab-pane" role="tabpanel" aria-labelledby="year5-tab" tabIndex="0">.5.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );


  if(!isEditable){
    [".virtualCustomMix", ".originalCustomMix", ".form-check-input", ".form-select"].forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) =>{
        if (!el.closest(".ignore-disable-condition")) {
          el.disabled = true
        }
      })
    });
  }

  if (!isViewPage) {
    return <NoAccess />
  }
  return (<>
    {allProductJson && (
      <section className="custom_tabs_content fountain_deal_page mb_100 pb_50 product-tab">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="tab-content" id="myTabContent">
                <div className="tab-pane fade show active" id="one-tab-pane" role="tabpanel" aria-labelledby="one-tab" tabIndex="0">
                  <div className="w-100 prdct-tab pt-1">
                    <div className="row align-items-center border-bottom pb-1">
                      <div className="col-md-6 col-lg-1">
                        <p className="fs_16 fw_300 black-40">Y1 Cases</p>
                      </div>
                      <div className="col-md-12 col-lg-7 border-end border-md-0 mt-lg-0 mt-md-4">
                        <div className="d-md-flex row inputs_bottle_deals flex-wrap">
                          <div className="form-floating  col-lg-4 col-12 custommixvalues_td">

                            <input
                              type="text"
                              name="bnc_raw_cases"
                              className="form-control virtualCustomMix showVirtualMix h-auto"
                              value={starndardNumberFormat(allProductJson.y1_cases["bnc_raw_cases"], 0, 0)}
                              readOnly
                              onFocus={(e) => {
                                showOriginalField(e);
                              }}
                              data-tooltip-id="inp-tooltip"
                              data-tooltip-content={allProductJson.y1_cases["bnc_raw_cases"] ? USNumberFormat(allProductJson.y1_cases["bnc_raw_cases"], -1) : "0"}
                              disabled={!isEditable}
                            />
                            <input
                              type="text"
                              className="form-control originalCustomMix hideOriginalMix"
                              value={allProductJson.y1_cases["bnc_raw_cases"]}
                              onBlur={(e) => {
                                hideOriginalField(e);
                              }}
                              onFocus={(e) => {
                                onFocusEmptyValue(e);
                              }}
                              onChange={(e) => {
                                dispatch(updateY1Cases({ key: "bnc_raw_cases", value: e.target.value }))
                              }}
                              onPaste={(e) => {
                                handlePasteLimit({e})
                              }}
                              onKeyDown={(e) => {
                                handleKeyDownPossitiveInt(e)
                                handleInputEnter(e)
                              }}
                              disabled={!isEditable}
                            />
                            <label htmlFor="floatingInput">PBC B&C Raw Cases (incl Allied Brands)*</label>
                          </div>
                          <div className="form-floating  col-lg-4 col-12 custommixvalues_td">
                            <input
                              type="text"
                              name="pbc_allied_brand_volume"
                              className="form-control virtualCustomMix showVirtualMix h-auto"
                              value={starndardNumberFormat(allProductJson.y1_cases["pbc_allied_brand_volume"], 0, 0)}
                              readOnly
                              onFocus={(e) => {
                                showOriginalField(e);
                              }}
                              data-tooltip-id="inp-tooltip"
                              data-tooltip-content={allProductJson.y1_cases["pbc_allied_brand_volume"] ? USNumberFormat(allProductJson.y1_cases["pbc_allied_brand_volume"], -1) : "0"}
                              disabled={!isEditable}
                            />
                            <input
                              type="text"
                              className="form-control originalCustomMix hideOriginalMix"
                              value={allProductJson.y1_cases["pbc_allied_brand_volume"]}
                              onBlur={(e) => {
                                hideOriginalField(e);
                              }}
                              onFocus={(e) => {
                                onFocusEmptyValue(e);
                              }}
                              onChange={(e) => {
                                dispatch(updateY1Cases({ key: "pbc_allied_brand_volume", value: e.target.value }))
                              }}
                              onPaste={(e) => {
                                handlePasteLimit({e})
                              }}
                              onKeyDown={(e) => {
                                handleKeyDownPossitiveInt(e)
                                handleInputEnter(e)
                              }}
                              disabled={!isEditable}
                            />
                            <label htmlFor="floatingInput">PBC Allied Brand Volume</label>
                          </div>
                          <div className="form-floating col-lg-4 col-12 custommixvalues_td">
                            <input
                              type="text"
                              name="total_bnc_raw_cases"
                              className="form-control virtualCustomMix showVirtualMix h-auto"
                              value={starndardNumberFormat(allProductJson.y1_cases["total_bnc_raw_cases"], 0, 0)}
                              readOnly
                              onFocus={(e) => {
                                showOriginalField(e);
                              }}
                              data-tooltip-id="inp-tooltip"
                              data-tooltip-content={allProductJson.y1_cases["total_bnc_raw_cases"] ? USNumberFormat(allProductJson.y1_cases["total_bnc_raw_cases"], -1) : "0"}
                              disabled={!isEditable}
                            />
                            <input
                              type="text"
                              className="form-control originalCustomMix hideOriginalMix"
                              value={allProductJson.y1_cases["total_bnc_raw_cases"]}
                              onBlur={(e) => {
                                hideOriginalField(e);
                              }}
                              onFocus={(e) => {
                                onFocusEmptyValue(e);
                              }}
                              onChange={(e) => {
                                dispatch(updateY1Cases({ key: "total_bnc_raw_cases", value: e.target.value }))
                              }}
                              onPaste={(e) => {
                                handlePasteLimit({e})
                              }}
                              onKeyDown={(e) => {
                                handleKeyDownPossitiveInt(e)
                                handleInputEnter(e)
                              }}
                              disabled={!isEditable}
                            />
                            <label htmlFor="floatingInput">Total B&C Raw Cases (excl Allied Brands)*</label>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6 col-lg-3 mt-lg-0 mt-md-4">
                        <div className="d-flex justify-content-between align-items-center pl_20">
                          <div className="content">
                            <p className="fs_16 black-40 fw_400 mb_10">PBC VPO</p>
                            <p className="fs_15 black-40 fw_700 mb-0"
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content={USNumberFormat(allProductJson?.y1_cases.pbc_vpo, -1)}
                            >{USNumberFormat(Math.round(allProductJson?.y1_cases.pbc_vpo) || 0)}</p>
                          </div>
                          <div className="content">
                            <p className="fs_16 black-40 fw_400 mb_10">Total VPO</p>
                            <p className="fs_15 black-40 fw_700 mb-0"
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content={USNumberFormat(allProductJson?.y1_cases.total_vpo, -1)}
                            >{USNumberFormat(Math.round(allProductJson.y1_cases.total_vpo) || 0)}</p>
                          </div>
                          <div className="content">
                            <p className="fs_16 black-40 fw_400 mb_10">MC Avg</p>
                            <p className="fs_15 black-40 fw_700 mb-0"
                              data-tooltip-id="my-tooltip"
                              data-tooltip-content={USNumberFormat(allProductJson?.sumOfProductData[currentYear - 1]?.["mc"], -1)}
                            >{formatUSD(allProductJson?.sumOfProductData[currentYear - 1]?.["mc"] || 0)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row mt_0 align-items-end cda-section">
                      <div className="col-md-12 col-lg-7">
                        <div className="d-flex flex-wrap justify-content-between align-items-md-end mb-0">
                          <div className="d-flex" id="radio_tabs" role="tablist">
                            <div role="presentation">
                              <div className="form-check radio_2 active" id="current_cases_1-tab" data-bs-toggle="tab" data-bs-target="#current_cases_1-tab-pane" type="button" role="tab" aria-controls="current_cases_1-tab-pane" aria-selected="true">
                            <input className="form-check-input" type="radio" name="current_cases" id="current_cases_1" value="1" checked={allProductJson.current_cases === 1} onClick={() => updateCurrentCases(1)} disabled={dealType != 2}/>
                                <label className="form-check-label" htmlFor="current_cases_1">Base Cases</label>
                              </div>
                            </div>
                            <div role="presentation">
                              <div className="form-check radio_2 ml_20" id="current_cases_2-tab" data-bs-toggle="tab" data-bs-target="#current_cases_2-tab-pane" type="button" role="tab" aria-controls="current_cases_2-tab-pane" aria-selected="false">
                            <input className="form-check-input" type="radio" name="current_cases" id="current_cases_2" value="2" checked={allProductJson.current_cases === 2} onClick={() => updateCurrentCases(2)} disabled={dealType != 2}/>
                                <label className="form-check-label" htmlFor="current_cases_2">Y1 Cases</label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex flex-wrap justify-content-between align-items-md-end mb-2">
                          <div className="d-flex mt-2">
                            <p className="fs_16 fw_700 black-40 mr_20">CDAs</p>
                            <div className="form-check checkboxes mr_16">
                              <input
                                className="form-check-input" type="checkbox" value="" id="flexCheckDefault"
                                style={{ cursor: "pointer" }}
                                checked={allProductJson.cda_status[0]} onClick={() => updateCDA(0)} />
                              <label className="form-check-label" htmlFor="flexCheckDefault">
                                Sector
                              </label>
                            </div>
                            <div className="form-check checkboxes mr_16">
                              <input
                                style={{ cursor: "pointer" }}
                                className="form-check-input" type="checkbox" value="" id="flexCheckDefault2" checked={allProductJson.cda_status[1]} onClick={() => updateCDA(1)} />
                              <label className="form-check-label" htmlFor="flexCheckDefault2">
                                Bottler
                              </label>
                            </div>
                            <div className="form-check checkboxes mr_16">
                              <input className="form-check-input"
                                style={{ cursor: "pointer" }}
                                type="checkbox" value="" id="flexCheckDefault3" checked={allProductJson.cda_status[2]} onClick={() => updateCDA(2)} />
                              <label className="form-check-label" htmlFor="flexCheckDefault3">
                                PCNA
                              </label>
                            </div>
                          </div>
                          <div className="top_buttons d-flex justify-content-xl-center align-items-md-center mb-xl-0 mt-2">
                            <span className="fw_600 fs_16 me-1 mt-xl-0">Mix: </span>
                            {(() => {
                              // const total_mix_value = total_mix_year(currentYear)
                              const total_mix_value = currentYear === 1 ? total_mix_year(1, false) : total_mix_year(currentYear, false);
                              const v_total_mix_value = USNumberFormat(total_mix_value, 1, 1);
                              const tooltip_total_mix_value = USNumberFormat(total_mix_value, -1);
                              return <p
                                className={`fs_16 fw_600 black-40 mt-xl-0 ${v_total_mix_value != 100 ? "text-danger" : ""}`}
                                data-tooltip-id="my-tooltip"
                                data-tooltip-content={`${tooltip_total_mix_value}`}
                              > {v_total_mix_value} %</p>
                            })()}
                            {isEditable && (
                              <>
                                <CategoryDropdown categories={allSubCategory} disabled={!isEditable} />
                                <a
                                  style={{ cursor: "pointer" }}
                                  className="mt-xl-0 fs_14 fw_400 electric_blue-40 px_10 py_6 bg-white electric_blue-40 outline_black-40 border text-decoration-none border_radius_8" onClick={() => { setShowPopup(true); }}>
                                  + Add New Product
                                </a></>
                            )}
                            {currentYear != "base" && (((dealType == 1) && currentYear >= 2 ) || (dealType == 2 || dealType == 4) && currentYear >= 3) ? (
                              <div className="form-case-price ms-3 custommixvalues_td">
                                <label htmlFor="floatingCaseprice"
                                  data-tooltip-id="inp-tooltip"
                                  data-tooltip-content="Case Price Increase %"
                                  data-tooltip-place="top"
                                >Case Price Inc %:</label>
                                {(() => {
                                  const casePriceInc = allProductJson?.case_price_percentage?.[currentYear - 1];
                                  const isCasePriceValid = casePriceInc !== null && casePriceInc !== undefined && casePriceInc !== "";
                                  const displayCasePrice = isCasePriceValid ? Number(casePriceInc) : 0;

                                  return (
                                    <>
                                      <input
                                        type="text"
                                        value={displayCasePrice}
                                        className="virtualCustomMix showVirtualMix"
                                        onFocus={(e) => {
                                          showOriginalField(e);
                                        }}
                                        data-tooltip-id="inp-tooltip"
                                        data-tooltip-content={displayCasePrice}
                                        data-tooltip-place="top"
                                        id="floatingCaseprice"
                                        disabled={!isEditable}

                                      />
                                      <input
                                        type="text"
                                        value={displayCasePrice}
                                        className="originalCustomMix hideOriginalMix"
                                        onFocus={(e) => {
                                          onFocusEmptyValue(e);
                                        }}
                                        onChange={(e) => {
                                          updateCasePricePercentage(currentYear, e.target.value);
                                        }}
                                        onBlur={(e) => {
                                          hideOriginalField(e);
                                        }}
                                        onKeyDown={(e) => {
                                          handleKeyDownPercentage(e)
                                          handleInputEnter(e)
                                        }}
                                        onPaste={(e) => {
                                          handlePasteLimit({ e, allowDecimal: true })
                                        }}
                                        id="floatingCaseprice"
                                        disabled={!isEditable}
                                      />
                                    </>
                                  )

                                })()}
                                
                              </div>) : ""}
                          </div>

                        </div>
                      </div>
                      <div className="col-md-12 col-lg-5">
                        <BnCEditableNote deal_id={deal_id} disabled={!isEditable} />
                        <div className="sub_table_tabs d-flex  align-items-center col-md-7 col-lg-12 ms-auto">
                          <p className="mb-0 white-8 fs_14 fw_700 pr_10 border-end">Year</p>
                          <ul className="nav nav-tabs border-0" id="myTabcustom" role="tablist">
                            {Array.from({ length: contractDuration}).map((_, index) => {
                              const yearStart = startYear + index;
                              const yearEnd = yearStart + 1;
                              const tabId = `year${index + 1}`;
                              const isActive = index == 0 && dealType == 2 && currentYear == "base" ? "active" : index === currentYear - 1 ? "active" : "";
                              const isSelected = index === currentYear - 1;
                              return (index <= 4) && (
                                <li className="nav-item" role="presentation" key={tabId}>
                                  <button
                                    className={`nav-link ${isActive}`}
                                    id={`${tabId}-tab`}
                                    data-bs-toggle="tab"
                                    data-bs-target={`#${tabId}-tab-pane`}
                                    type="button"
                                    role="tab"
                                    aria-controls={`${tabId}-tab-pane`}
                                    aria-selected={isSelected}
                                    onClick={() => {
                                      setCurrentYear((dealType == 2 || dealType == 4) && index == 0 ? 1 : index + 1)
                                    }}
                                  >
                                    {(dealType == 2 || dealType == 4) && index == 0 ? "Base" : ((dealType == 2 || dealType == 4) ? `${yearStart - 1}-${yearEnd - 1}` : `${yearStart}-${yearEnd}`)}
                                  </button>
                                </li>
                              );

                            })}
                          </ul>

                          <div className={`dropdown ms-auto years-dropdown ${Array.from({ length: contractDuration  }).length > 5 ? "" : "d-none"}`}>
                            <a className="fs_16"
                              role="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                              onClick={() => setShowYears(!showYears)}
                              ref={yearDropdownRef}
                            >
                              <img src={three_dots} />
                            </a>
                            <ul
                              className={`dropdown-menu ${showYears ? "show" : ""}`}
                              style={{ position: "absolute", top: "0px", right: "0px" }}
                              ref={yearDropdownRef}
                            >
                              {Array.from({ length: contractDuration }).map((_, index) => {
                                const baseReducer = dealType != 1 ? 1 : 0;
                                const yearStart = startYear + index - baseReducer;
                                const yearEnd = yearStart + 1;
                                const tabId = `year${index + 1}`;
                                const isActive = index === currentYear - 1 ? "active" : "";
                                const isSelected = index === currentYear - 1;
                                return (index > 4) && (
                                  <li key={tabId} className="w-50">
                                    <button
                                      className={`dropdown-item text-center ${isActive}`}
                                      id={`${tabId}-tab`}
                                      data-bs-toggle="tab"
                                      data-bs-target={`#${tabId}-tab-pane`}
                                      type="button"
                                      role="tab"
                                      aria-controls={`${tabId}-tab-pane`}
                                      aria-selected={isSelected}
                                      onClick={() => {
                                        setShowYears(false)
                                        return setCurrentYear(index + 1)
                                      }
                                      }
                                    >
                                      {yearStart}-{yearEnd}
                                    </button>
                                  </li>
                                );

                              })}
                            </ul>
                          </div>
                        </div>

                      </div>
                    </div>
                    <div className="row" >
                      <div className="col-md-12">
                        <div className="tab-content sub_table_tabs p-0 m-0 bg-white" id="myTabcustom">
                          <div className="tab-pane fade show active" id="year1-tab-pane" role="tabpanel" aria-labelledby="year1-tab">
                            <div className="table-responsive custom_table_1">
                              <table className="table">
                                <thead>
                                  <tr>
                                    <th scope="col" width="">Brand Mix</th>
                                    <th scope="col">Category</th>
                                    <th scope="col">Unit/Case</th>
                                    <th scope="col" className="text-center altered-width">Mix</th>
                                    <th scope="col" className="text-end" width="100px">Case Price</th>
                                    {allProductJson.cda_status[0] && (
                                      <th scope="col" className="text-end altered-width" width="">
                                        Sector CDA
                                      </th>
                                    )}
                                    {allProductJson.cda_status[1] && (
                                      <th scope="col" className="text-end altered-width" width="">
                                        Bottler CDA
                                      </th>
                                    )}
                                    {allProductJson.cda_status[2] && (
                                      <th scope="col" className="text-end altered-width" width="">
                                        PCNA CDA
                                      </th>
                                    )}
                                    <th scope="col" className="text-end" >Net Price</th>
                                    <th scope="col" className="text-end altered-width">COGS</th>
                                    <th scope="col" className="text-end" >MC</th>
                                    <th scope="col" className="text-end" >MC $</th>

                                    {currentYear == 1 && isEditable ? (
                                      <th scope="col" className="text-center" >Action</th>
                                    ) : ""}
                                  </tr>
                                </thead>
                                <tbody>
                                  {allProductJson.selected_products.map((product, index) => {
                                    const mix_names = allProductJson.mix_data;
                                    let allUnits = []
                                    let remainingArray = []
                                    if (Array.isArray(product.selected_unit)) {
                                      allUnits = product.bib_mixes.map(item => item.mix_id);
                                      remainingArray = allUnits?.filter(item =>
                                        !product.selected_unit.includes(parseInt(item.mix_id))
                                      );
                                    }
                                    if (product.selected_unit && (product.product_sub_category_id == currentCategory || currentCategory == -1))
                                      return product.selected_unit.map((unit, unit_index) => {
                                        let unit_data = { ...product?.bib_mixes.find(item => item.mix_id === unit) }
                                        unit_data.mix_name = mix_names[unit]
                                        let caseValues = getProdutData(product, unit)
                                        const rowKey = `${product.product_id}${unit}${currentYear}`;
                                        const orgMix = getMixValue(product, unit);
                                        let orgMixValue = 0;
                                        if( dealType != 1 && currentYear == 2){
                                          orgMixValue = caseValues?.[currentYear - 1]?.mix_value ?? orgMix;
                                        }else{
                                          orgMixValue = caseValues?.[currentYear - 1]?.mix_value || orgMix;
                                        }
                                        const orgCasePrice = caseValues?.[currentYear - 1]?.case_price_value
                                        const orgSectorCDA = caseValues?.[currentYear - 1]?.sector_cda
                                        const orgBottlerCDA = caseValues?.[currentYear - 1]?.bottler_cda
                                        const orgPcnaCDA = caseValues?.[currentYear - 1]?.pcna_cda
                                        const orgNetPrice = caseValues?.[currentYear - 1]?.net_price ? caseValues?.[currentYear - 1]?.net_price : 0
                                        const orgCogs = caseValues?.[currentYear - 1]?.cogs
                                        const orgMC = caseValues?.[currentYear - 1]?.mc ? caseValues?.[currentYear - 1]?.mc : 0
                                        const orgMCDollar = caseValues?.[currentYear - 1]?.mcdollar ? caseValues?.[currentYear - 1]?.mcdollar : 0


                                        let jsx = orgCasePrice ? orgCasePrice : 0
                                        if (caseValues?.[currentYear - 1]?.case_price_override_notes) {
                                          jsx = caseValues?.[currentYear - 1]?.case_price_override_flag ? (
                                            <div className="d-inline-block text-start text-white">
                                              <span>
                                                Price : <span className="fw_500">{orgCasePrice ? orgCasePrice : 0}</span>
                                              </span>
                                              <p className="caseprice-override-tooltip">
                                                Notes : <span className="fw_500">{caseValues?.[currentYear - 1]?.case_price_override_notes}</span>
                                              </p>
                                            </div>
                                          ) : orgCasePrice;
                                        }

                                        let casePriceOverrideTooltip = typeof jsx === 'string' ? jsx : ReactDOMServer.renderToStaticMarkup(jsx);

                                        let jsx_mix = orgMixValue ? orgMixValue : orgMix
                                        if (caseValues?.[currentYear - 1]?.mix_override_notes) {
                                          jsx_mix = caseValues?.[currentYear - 1]?.mix_override_flag ? (
                                            <div className="d-inline-block text-start text-white">
                                              <span>
                                                Mix Percentage : <span className="fw_500">{orgMixValue ? orgMixValue : 0}</span>
                                              </span>
                                              <p className="caseprice-override-tooltip">
                                                Notes : <span className="fw_500">{caseValues?.[currentYear - 1]?.mix_override_notes}</span>
                                              </p>
                                            </div>
                                          ) : orgMixValue;
                                        }

                                        let mixOverrideTooltip = typeof jsx_mix === 'string' ? jsx_mix : ReactDOMServer.renderToStaticMarkup(jsx_mix);
                                        const showinput = currentYear != "base" && (((dealType != 2 || dealType != 4) && (currentYear == 1)) || (dealType != 1 && currentYear == 2))
                                        return (
                                          <tr key={`${index}-${unit_index}`}>
                                            <td>
                                              <div className="dropdown">
                                                <strong className="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                                  {product["product_name"]}
                                                </strong>
                                              </div>
                                            </td>
                                            <td className="text-truncate" data-tooltip-id="inp-tooltip" data-tooltip-content={product["product_sub_category"]}>{product["product_sub_category"]}</td>
                                            <td className="fixed-col select-react-container > div" style={{ left: 0 }}>
                                              {(() => {
                                                // Filter and prepare dropdown options
                                                const productOptions = product.bib_mixes
                                                  ?.filter(
                                                    (mix) =>
                                                      !product.selected_unit.includes(parseInt(mix.mix_id)) ||
                                                      mix.mix_id === parseInt(unit)
                                                  )
                                                  ?.map((mix) => ({
                                                    value: mix.mix_id,
                                                    label: mix_names[mix.mix_id] || `Mix ${mix.mix_id}`,
                                                  })) || [];

                                                // Determine currently selected product
                                                const selectedProduct = {
                                                  value: unit,
                                                  label: allProductJson?.mix_data?.[unit] || "Select",
                                                };

                                                return (
                                                  <SelectCustom
                                                    options={productOptions}
                                                    value={selectedProduct}
                                                    onChange={(e) => {
                                                      if (e) {
                                                        handleUnitChange(
                                                          product.product_id,
                                                          product.product_sub_category_id,
                                                          unit,
                                                          e.value,
                                                          "sub_categories"
                                                        );
                                                      }
                                                    }}
                                                    isDisabled={!isEditable || shouldDisableInputs()}
                                                  />
                                                );
                                              })()}
                                            </td>

                                            <td className="text-center altered-width">
                                              {currentYear != "base" && (((dealType != 2 || dealType != 4) && (currentYear == 1)) || (dealType != 1 && currentYear == 2)) ? (
                                                (currentYear != 1 && dealType != 1 ? (
                                                  <div className="table_form input_div_style custommixvalues_td ">
                                                    <input
                                                      type="text"
                                                      className={`virtualCustomMix showVirtualMix form-control ${showinput == 1 && !shouldDisableInputs() ? "" : "border-0"}`}
                                                      value={USNumberFormat(orgMixValue, 1, 1)}
                                                      readOnly
                                                      tabIndex={showinput == 1 ? 0 : -1}
                                                      onFocus={(e) => {
                                                        if (showinput == 1) {
                                                          showOriginalField(e);
                                                        }
                                                      }}
                                                      step={0.1}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={orgMixValue ? USNumberFormat(orgMixValue, -1) : "0.0"}
                                                      title=""
                                                      disabled={!isEditable || shouldDisableInputs()}
                                                    />

                                                    <input
                                                      type="text"
                                                      className={`originalCustomMix hideOriginalMix form-control ${shouldDisableInputs() ? "border-0" : ""}`}
                                                      value={orgMixValue}
                                                      onKeyDown={(e) => {
                                                        handleKeyDownLimit(
                                                          {
                                                            e,
                                                            fieldType: 'custom',
                                                            allowNegative: false,
                                                            allowDecimal: true,
                                                            custom_int: 4,
                                                            custom_decimal: 15
                                                          }
                                                        )
                                                        handleInputEnter(e)
                                                      }}
                                                      onBlur={(e) => {
                                                        hideOriginalField(e);
                                                      }}
                                                      onChange={(e) => {
                                                        let newValue = e.target.value;
                                                        if (newValue.startsWith('.')) {
                                                          newValue = '0' + newValue;
                                                        }
                                                        let [value, isValid] = handlePercentageField(newValue);
                                                        if (isValid) {
                                                          updateUnitCasesMix(product.product_id, product.product_sub_category_id, unit, value, "sub_categories", currentYear);
                                                          //updateUnitCasesData(unit, currentYear, "mix_value", value, product.product_id)
                                                        } else {
                                                          e.target.value = value;
                                                        }
                                                      }}
                                                      onFocus={(e) => {
                                                        if (orgMixValue == 0) {
                                                          updateUnitCasesMix(product.product_id, product.product_sub_category_id, unit, "", "sub_categories", currentYear);
                                                        }
                                                      }}
                                                      step={0.1}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={orgMixValue ? USNumberFormat(orgMixValue, -1) : "0.0"}
                                                      title=""
                                                      disabled={shouldDisableInputs()}
                                                    />
                                                    <span className="percent_style">%</span>
                                                  </div>
                                                ) : (
                                                  <div className="table_form input_div_style custommixvalues_td ">
                                                    <input
                                                      type="text"
                                                      className={`virtualCustomMix showVirtualMix form-control ${showinput == 1 && !shouldDisableInputs() ? "" : "border-0"}`}
                                                      value={USNumberFormat(orgMixValue, 1, 1)}
                                                      readOnly
                                                      tabIndex={showinput == 1 ? 0 : -1}
                                                      onFocus={(e) => {
                                                        if (showinput == 1) {
                                                          showOriginalField(e);
                                                        }
                                                      }}
                                                      step={0.1}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={orgMixValue ? USNumberFormat(orgMixValue, -1) : "0.0"}
                                                      title=""
                                                      disabled={!isEditable || shouldDisableInputs()}
                                                    />

                                                    <input
                                                      type="text"
                                                      className={`originalCustomMix hideOriginalMix form-control ${shouldDisableInputs() ? "border-0" : ""}`}
                                                      value={orgMix}
                                                      onKeyDown={(e) => {
                                                        handleKeyDownLimit(
                                                          {
                                                            e,
                                                            fieldType: 'custom',
                                                            allowNegative: false,
                                                            allowDecimal: true,
                                                            custom_int: 4,
                                                            custom_decimal: 15
                                                          }
                                                        )
                                                        handleInputEnter(e)
                                                      }}
                                                      onBlur={(e) => {
                                                        hideOriginalField(e);
                                                      }}
                                                      onChange={(e) => {
                                                        let newValue = e.target.value;
                                                        if (newValue.startsWith('.')) {
                                                          newValue = '0' + newValue;
                                                        }
                                                        let [value, isValid] = handlePercentageField(newValue);
                                                        if (isValid) {
                                                          updateUnitCasesMix(product.product_id, product.product_sub_category_id, unit, value, "sub_categories", currentYear);
                                                          //updateUnitCasesData(unit, currentYear, "mix_value", value, product.product_id)
                                                        } else {
                                                          e.target.value = value;
                                                        }
                                                      }}
                                                      onFocus={(e) => {
                                                        if (orgMixValue == 0) {
                                                          updateUnitCasesMix(product.product_id, product.product_sub_category_id, unit, "", "sub_categories", currentYear);
                                                        }
                                                      }}
                                                      step={0.1}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={orgMixValue ? USNumberFormat(orgMixValue, -1) : "0.0"}
                                                      title=""
                                                      disabled={shouldDisableInputs()}
                                                    />
                                                    <span className="percent_style">%</span>
                                                  </div>)
                                                )
                                              ) : (
                                                <div className={`${caseValues?.[currentYear - 1]?.mix_override_flag ? "bg_light_grey" : ""}`}>
                                                  <PopoverMixForm
                                                    orgMixValue={orgMixValue}
                                                    baseMixValue={orgMix}
                                                    unit={unit}
                                                    product={product}
                                                    currentYear={currentYear}
                                                    casePriceData={casePriceData}
                                                    setCasePriceData={setCasePriceData}
                                                    casePriceOverrideTooltip={USNumberFormat(mixOverrideTooltip, -1)}
                                                    updateUnitCasesData={updateUnitCasesData}
                                                    onClick={(e) => {
                                                      setCasePriceData({
                                                        [`mix_value`]: caseValues?.[currentYear - 1]?.mix_value || orgMix,
                                                        [`mix_override_notes`]: caseValues?.[currentYear - 1]?.mix_override_notes,
                                                        [`mix_override_flag`]: caseValues?.[currentYear - 1]?.mix_override_flag,
                                                      })
                                                    }}
                                                    isEditable={isEditable}
                                                  />
                                                </div>
                                              )
                                              }
                                            </td>
                                            <td className="text-center altered-width pe-0">
                                              <div
                                                id={rowKey}
                                                className={`flex justify-content-center table_form input_div_style custommixvalues_td ${caseValues?.[currentYear - 1]?.case_price_override_flag ? "bg_light_grey" : ""
                                                  }`}
                                                ref={(el) => {
                                                  if (el) casePriceRefs.current[rowKey] = el;
                                                }}
                                                key={rowKey}
                                              >
                                                {currentYear != "base" && (((dealType != 2 || dealType != 4) && (currentYear == 1)) || (dealType != 1 && currentYear == 2)) ? (
                                                  <>
                                                    <input
                                                      key={`case_price_virtual_${rowKey}`}
                                                      type="text"
                                                      className={`virtualCustomMix showVirtualMix form-control ${!isEditable || shouldDisableInputs() ? "border-0" : ""}`}
                                                      value={USNumberFormat(orgCasePrice, 2, 2)}
                                                      readOnly
                                                      onFocus={(e) => {
                                                        showOriginalField(e);
                                                      }}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={USNumberFormat(orgCasePrice, -1)}
                                                      title=""
                                                      disabled={!isEditable || shouldDisableInputs()}
                                                    />

                                                    <input
                                                      key={`case_price_${rowKey}`}
                                                      type="text"
                                                      className={`originalCustomMix hideOriginalMix form-control ${shouldDisableInputs() ? "border-0" : ""}`}
                                                      value={orgCasePrice}
                                                      onChange={(e) => {
                                                        const original = caseValues?.[currentYear - 1]?.case_price_value;
                                                        const newValue = e.target.value;
                                                        if (newValue !== original) {
                                                          updateUnitCasesData(unit, currentYear, "case_price", newValue, product.product_id);
                                                        }
                                                      }}
                                                      onKeyDown={(e) => {
                                                        handleKeyDownLimit(
                                                          {
                                                            e, allowDecimal: false,
                                                            fieldType: 'custom',
                                                            allowNegative: true,
                                                            allowDecimal: true,
                                                            custom_int: 4,
                                                            custom_decimal: 15
                                                          }
                                                        )
                                                        handleInputEnter(e)
                                                      }}
                                                      onBlur={(e) => {
                                                        hideOriginalField(e);
                                                      }}
                                                      onFocus={(e) => {
                                                        onFocusEmptyValue(e);
                                                      }}
                                                      onPaste={(e) => {
                                                        handlePasteLimit({ e, fieldType: "custom", custom_int: 4, allowDecimal: true, allowNegative: true })
                                                      }}
                                                      step={0.1}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={USNumberFormat(orgCasePrice, -1)}
                                                      title=""
                                                      disabled={shouldDisableInputs()}
                                                    />
                                                    <span className="dollar_style">$</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <PopoverWithForm
                                                      orgCasePrice={orgCasePrice}
                                                      unit={unit}
                                                      product={product}
                                                      currentYear={currentYear}
                                                      casePriceData={casePriceData}
                                                      setCasePriceData={setCasePriceData}
                                                      casePriceOverrideTooltip={casePriceOverrideTooltip}
                                                      updateUnitCasesData={updateUnitCasesData}
                                                      onClick={(e) => {
                                                        setCasePriceData({
                                                          [`case_price_value`]: caseValues?.[currentYear - 1]?.case_price_value,
                                                          [`case_price_override`]: caseValues?.[currentYear - 1]?.case_price_override,
                                                          [`case_price_override_notes`]: caseValues?.[currentYear - 1]?.case_price_override_notes,
                                                          [`case_price_override_flag`]: caseValues?.[currentYear - 1]?.case_price_override_flag,
                                                        })
                                                      }}
                                                      isEditable={isEditable}
                                                    />
                                                  </>
                                                )}

                                                {caseValues?.[currentYear - 1]?.case_price_override_flag ? (
                                                  <a className="right_badge">
                                                    <img src={right_badge_table} />
                                                  </a>
                                                ) : ""}
                                              </div>
                                            </td>

                                            {allProductJson?.cda_status?.[0] && (
                                              <td className="text-center altered-width pe-0">
                                                <div className="table_form input_div_style custommixvalues_td">
                                                  <input
                                                    className={`form-control virtualCustomMix showVirtualMix h-auto me-0 ${shouldDisableInputs() ? "border-0" : ""}`}
                                                    value={USNumberFormat(orgSectorCDA, 2, 2)}
                                                    readOnly
                                                    onFocus={(e) => {
                                                      showOriginalField(e);
                                                    }}
                                                    data-tooltip-id="inp-tooltip"
                                                    data-tooltip-content={USNumberFormat(orgSectorCDA, -1)}
                                                    disabled={shouldDisableInputs()}
                                                  />
                                                  <input
                                                    type="text"
                                                    key={`${product.product_id}-${unit}`}
                                                    className={`form-control originalCustomMix hideOriginalMix ${shouldDisableInputs() ? "border-0" : ""}`}
                                                    value={orgSectorCDA}
                                                    onBlur={(e) => {
                                                      hideOriginalField(e);
                                                    }}
                                                    onFocus={(e) => {
                                                      onFocusEmptyValue(e);
                                                    }}
                                                    onChange={(e) => {
                                                      let value = e.target.value;
                                                      updateUnitCasesData(unit, currentYear, "sector_cda", value, product.product_id)
                                                    }}
                                                    onKeyDown={(e) => {

                                                      handleKeyDownLimit(
                                                        {
                                                          e, allowDecimal: false,
                                                          fieldType: 'custom',
                                                          allowNegative: true,
                                                          allowDecimal: true,
                                                          custom_int: 2,
                                                          custom_decimal: 15
                                                        }
                                                      )
                                                      handleInputEnter(e)
                                                    }}
                                                    onPaste={(e) => {
                                                      handlePasteLimit({ e, fieldType: "custom",custom_int: 2, allowDecimal: true, allowNegative: true })
                                                    }}
                                                    data-tooltip-id="inp-tooltip"
                                                    data-tooltip-content={USNumberFormat(orgSectorCDA, -1)}
                                                    disabled={shouldDisableInputs()}
                                                  />
                                                  <span className="dollar_style">$</span>
                                                </div>
                                              </td>
                                            )}

                                            {allProductJson?.cda_status?.[1] && (
                                              <td className="text-center altered-width pe-0">
                                                <div className="table_form input_div_style custommixvalues_td">

                                                  <input
                                                    className={`form-control virtualCustomMix showVirtualMix h-auto me-0 ${shouldDisableInputs() ? "border-0" : ""}`}
                                                    value={USNumberFormat(orgBottlerCDA, 2, 2)}
                                                    readOnly
                                                    onFocus={(e) => {
                                                      showOriginalField(e);
                                                    }}
                                                    data-tooltip-id="inp-tooltip"
                                                    data-tooltip-content={USNumberFormat(orgBottlerCDA, -1)}
                                                    disabled={shouldDisableInputs()}
                                                  />
                                                  <input
                                                    type="text"
                                                    key={`${product.product_id}-${unit}`}
                                                    className={`form-control originalCustomMix hideOriginalMix ${shouldDisableInputs() ? "border-0" : ""}`}
                                                    value={orgBottlerCDA}
                                                    onBlur={(e) => {
                                                      hideOriginalField(e);
                                                    }}
                                                    onFocus={(e) => {
                                                      onFocusEmptyValue(e);
                                                    }}
                                                    onChange={(e) => {
                                                      let value = e.target.value;
                                                      updateUnitCasesData(unit, currentYear, "bottler_cda", value, product.product_id)
                                                    }}
                                                    onKeyDown={(e) => {
                                                      handleKeyDownLimit(
                                                        {
                                                          e, allowDecimal: false,
                                                          fieldType: 'custom',
                                                          allowNegative: true,
                                                          allowDecimal: true,
                                                          custom_int: 2,
                                                          custom_decimal: 15
                                                        }
                                                      )
                                                      handleInputEnter(e)
                                                    }}
                                                    onPaste={(e) => {
                                                      handlePasteLimit({ e, fieldType: "custom",custom_int: 2, allowDecimal: true, allowNegative: true })
                                                    }}
                                                    data-tooltip-id="inp-tooltip"
                                                    data-tooltip-content={USNumberFormat(orgBottlerCDA, -1)}
                                                    disabled={shouldDisableInputs()}
                                                  />
                                                  <span className="dollar_style">$</span>
                                                </div>
                                              </td>
                                            )}

                                            {allProductJson?.cda_status?.[2] && (
                                              <td className="text-center altered-width pe-0">
                                                <div className="table_form input_div_style custommixvalues_td">
                                                  <input
                                                    className={`form-control virtualCustomMix showVirtualMix h-auto me-0 ${shouldDisableInputs() ? "border-0" : ""}`}
                                                    value={USNumberFormat(orgPcnaCDA, 2, 2)}
                                                    readOnly
                                                    onFocus={(e) => {
                                                      showOriginalField(e);
                                                    }}
                                                    data-tooltip-id="inp-tooltip"
                                                    data-tooltip-content={USNumberFormat(orgPcnaCDA, -1)}
                                                    disabled={shouldDisableInputs()}
                                                  />
                                                  <input
                                                    className={`form-control originalCustomMix hideOriginalMix ${shouldDisableInputs() ? "border-0" : ""}`}
                                                    value={orgPcnaCDA}
                                                    onBlur={(e) => {
                                                      hideOriginalField(e);
                                                    }}
                                                    onFocus={(e) => {
                                                      onFocusEmptyValue(e);
                                                    }}
                                                    onChange={(e) => {
                                                      let value = e.target.value;
                                                      updateUnitCasesData(unit, currentYear, "pcna_cda", value, product.product_id)
                                                    }}
                                                    onKeyDown={(e) => {
                                                      handleKeyDownLimit(
                                                        {
                                                          e, allowDecimal: false,
                                                          fieldType: 'custom',
                                                          allowNegative: true,
                                                          allowDecimal: true,
                                                          custom_int: 2,
                                                          custom_decimal: 15
                                                        }
                                                      )
                                                      handleInputEnter(e)
                                                    }}
                                                    onPaste={(e) => {
                                                      handlePasteLimit({ e, fieldType: "custom",custom_int: 2, allowDecimal: true, allowNegative: true })
                                                    }}
                                                    data-tooltip-id="inp-tooltip"
                                                    data-tooltip-content={USNumberFormat(orgPcnaCDA, -1)}
                                                    disabled={shouldDisableInputs()}
                                                  />
                                                  <span className="dollar_style">$</span>
                                                </div>
                                              </td>
                                            )}

                                            <td
                                              className="text-end"
                                            >
                                              <span
                                                data-tooltip-id="inp-tooltip"
                                                data-tooltip-content={USNumberFormat(orgNetPrice, -1)}
                                              >{`${formatUSD(orgNetPrice)}`}</span>
                                            </td>


                                            <td
                                              className="text-end altered-width pe-0"
                                            >
                                              {dealType == 1 && currentYear == 1 || (dealType != 1 && currentYear == 2) ? (
                                                <>
                                                  <div className="table_form input_div_style custommixvalues_td border-0">
                                                    <input
                                                      className={`form-control virtualCustomMix showVirtualMix h-auto me-0  border-0`}
                                                      value={USNumberFormat(orgCogs, 2, 2)}
                                                      readOnly
                                                      onFocus={(e) => {
                                                        showOriginalField(e);
                                                      }}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={USNumberFormat(orgCogs, -1)}
                                                      disabled={true}
                                                    />
                                                    <input
                                                      className={`form-control originalCustomMix hideOriginalMix ${shouldDisableInputs() ? "border-0" : ""}`}
                                                      value={orgCogs}
                                                      onBlur={(e) => {
                                                        hideOriginalField(e);
                                                      }}
                                                      onFocus={(e) => {
                                                        onFocusEmptyValue(e);
                                                      }}
                                                      onChange={(e) => {
                                                        let value = e.target.value;
                                                        if ((dealType == 1 && currentYear == 1) || (dealType != 1 && currentYear == 2)) {
                                                          updateUnitCasesData(unit, currentYear, "cogs", value, product.product_id);
                                                        }
                                                      }}
                                                      onKeyDown={(e) => {
                                                        handleKeyDownLimit(
                                                          {
                                                            e, allowDecimal: false,
                                                            fieldType: 'custom',
                                                            allowNegative: true,
                                                            allowDecimal: true,
                                                            custom_int: 3,
                                                            custom_decimal: 15
                                                          }
                                                        )
                                                        handleInputEnter(e)
                                                      }}
                                                      onPaste={(e) => {
                                                        handlePasteLimit({ e, fieldType: "custom",custom_int: 3, allowDecimal: true , allowNegative: true})
                                                      }}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={USNumberFormat(orgCogs, -1)}
                                                      disabled={false}
                                                    />
                                                    <span className="dollar_style">$</span>
                                                  </div>
                                                </>
                                              ) : (
                                                <span
                                                  className="text-end"
                                                  data-tooltip-id="inp-tooltip"
                                                  data-tooltip-content={USNumberFormat(orgCogs, -1)}
                                                >{`${formatUSD(orgCogs)}`}</span>

                                              )}
                                            </td>

                                            <td className="text-end" >
                                              <span
                                                data-tooltip-id="inp-tooltip"
                                                data-tooltip-content={USNumberFormat(orgMC, -1)}
                                              >{`${formatUSD(orgMC)}`}</span>
                                            </td>

                                            <td className="text-end">

                                              <span
                                                data-tooltip-id="inp-tooltip"
                                                data-tooltip-content={USNumberFormat(orgMCDollar, -1)}
                                              >{`${formatUSD(orgMCDollar)}`}</span>
                                            </td>

                                            {currentYear == 1 && isEditable ? (
                                              <td><div className="d-flex justify-content-center align-items-center">
                                                <a
                                                  style={{ cursor: "pointer" }}
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDelete(product, unit_data);
                                                  }}
                                                >
                                                  <img
                                                    style={{ width: "18px", height: "18px" }}
                                                    src={delete_icon} alt="delete" />
                                                </a>
                                              </div></td>

                                            ) : ""}
                                          </tr>
                                        );
                                      });
                                  })}

                                </tbody>
                                {currentCategory === -1 ? <tfoot>
                                  <tr>
                                    <td className="fs_26">Weighted Average</td>
                                    <td></td>
                                    <td></td>
                                    {(() => {
                                      const total_mix_value = total_mix_year(currentYear)
                                      const v_total_mix_value = USNumberFormat(total_mix_value, 1, 1);
                                      const tooltip_total_mix_value = USNumberFormat(total_mix_value, -1);
                                      return <>
                                        <td className={`text-end ${v_total_mix_value != 100 ? 'text-danger' : ''}`} data-tooltip-id="inp-tooltip" data-tooltip-content={tooltip_total_mix_value}>
                                          {v_total_mix_value}
                                        </td>
                                      </>
                                    })()}
                                    <td className="text-end" data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfProductByKey(allProductJson, "case_price", currentYear, -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "case_price", currentYear, 2))}</td>
                                    {allProductJson.cda_status[0] && (<td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfProductByKey(allProductJson, "sector_cda", currentYear, -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "sector_cda", currentYear, 2))}</td>)}
                                    {allProductJson.cda_status[1] && (<td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfProductByKey(allProductJson, "bottler_cda", currentYear, -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "bottler_cda", currentYear, 2))}</td>)}
                                    {allProductJson.cda_status[2] && (<td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfProductByKey(allProductJson, "pcna_cda", currentYear, -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "pcna_cda", currentYear, 2))}</td>)}

                                    <td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={USNumberFormat(getSumOfProductByKey(allProductJson, "net_price", currentYear, -1), -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "net_price", currentYear, 2))}</td>
                                    <td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={USNumberFormat(getSumOfProductByKey(allProductJson, "cogs", currentYear, -1), -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "cogs", currentYear, 2))}</td>
                                    <td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={USNumberFormat(getSumOfProductByKey(allProductJson, "mc", currentYear, -1), -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "mc", currentYear, 2))}</td>
                                    <td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={USNumberFormat(getSumOfProductByKey(allProductJson, "mcdollar", currentYear, -1), -1)}>{formatUSD(getSumOfProductByKey(allProductJson, "mcdollar", currentYear, 2))}</td>

                                    { currentYear == 1 && isEditable ? <td> </td> : ""}
                                  </tr>
                                </tfoot> :
                                  <tfoot>
                                    <tr>
                                      <td>Weighted Average sub</td>
                                      <td></td>
                                      <td></td>
                                      {(() => {
                                        const weighted_value = total_mix_year(currentYear, true);
                                        const v_weight_value = USNumberFormat(weighted_value, 1, 1);
                                        const tooltip_weight_value = USNumberFormat(weighted_value, 1, 1);
                                        return (
                                          <td
                                            className={`text-end`}
                                            data-tooltip-id="inp-tooltip"
                                            data-tooltip-content={tooltip_weight_value}
                                          >
                                            {v_weight_value}
                                          </td>
                                        );
                                      })()}
                                      <td className="text-end" data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfFilteredProductByKey(allProductJson, "case_price", currentYear, -1)}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "case_price", currentYear, 2))}</td>
                                      {allProductJson.cda_status[0] && (<td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfFilteredProductByKey(allProductJson, "sector_cda", currentYear, -1)}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "sector_cda", currentYear, 2))}</td>)}
                                      {allProductJson.cda_status[1] && (<td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfFilteredProductByKey(allProductJson, "bottler_cda", currentYear, -1)}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "bottler_cda", currentYear, 2))}</td>)}
                                      {allProductJson.cda_status[2] && (<td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfFilteredProductByKey(allProductJson, "pcna_cda", currentYear, -1)}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "pcna_cda", currentYear, 2))}</td>)}

                                      <td className="text-end" data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfFilteredProductByKey(allProductJson, "net_price", currentYear, -1)}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "net_price", currentYear, 2))}</td>
                                      <td className="text-end" data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfFilteredProductByKey(allProductJson, "cogs", currentYear, -1)}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "cogs", currentYear, 2))}</td>
                                      <td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={getSumOfFilteredProductByKey(allProductJson, "mc", currentYear, -1)}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "mc", currentYear, 2))}</td>
                                      <td className="text-end " data-tooltip-id="inp-tooltip" data-tooltip-content={formatUSD(getSumOfFilteredProductByKey(allProductJson, "mcdollar", currentYear, -1))}>{formatUSD(getSumOfFilteredProductByKey(allProductJson, "mcdollar", currentYear, 2))}</td>
                                    { currentYear == 1 && isEditable ? <td> </td> : ""}
                                    </tr>
                                  </tfoot>
                                }
                              </table>
                            </div>
                          </div>
                          <div className="tab-pane fade" id="year2-tab-pane" role="tabpanel" aria-labelledby="year2-tab" tabIndex="0">.2.</div>
                          <div className="tab-pane fade" id="year3-tab-pane" role="tabpanel" aria-labelledby="year3-tab" tabIndex="0">.3.</div>
                          <div className="tab-pane fade" id="year4-tab-pane" role="tabpanel" aria-labelledby="year4-tab" tabIndex="0">.4.</div>
                          <div className="tab-pane fade" id="year5-tab-pane" role="tabpanel" aria-labelledby="year5-tab" tabIndex="0">.5.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )}

    {/* Add Notes button */}
    <button
      className="chat_button text-center cursor_pointer"
      onClick={() => {
        setNotesModal(true);
      }}
    >
      <img src={QAIcon} />
      <p className="fs_14 fw_700 text-white"></p>
    </button>

    {/* Add NotesPanel component */}
    {notesModal && (
      <NotesPanel
        customRef={notesPanelRef}
        deal={{deal_id: deal_id, deal_created_by: -1}}
        handleBack={() => setNotesModal(false)}
      />
    )}

    <section className="fixed_buttons_bottom w-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-12">
            <div className="d-flex w-100 justify-content-between align-items-center">
              {!amendment_years_from_contract_start ? (
                <button className={`btn btn_outline_primary text-decoration-none back-product`} id="back" onClick={() => {
                  dispatch(setDealDefault());
                  props?.handleBack()
                }}>
                  Back
                </button>
              ) : <div></div>}
              {isEditable ? (
                <div>
                  {/* {pageStatus?.[0]?.deal_status == userFromSession?.user_data?.user_type && (<button className="btn btn_primary text-decoration-none next-product w-auto me-4" tabIndex="0" id="next" onClick={() => {
                      setCommunicationModal(true);
                      setIsMoveToFlag(false);
                  }}>
                  Complete Review
                </button>)} */}
                  {
                    (pageStatus?.[0]?.last_status == 8 && pageStatus?.[0]?.visited_users?.includes(8) && userFromSession?.user_data?.user_type == 1 && !isView) && (
                      <button
                        className="btn btn_primary text-decoration-none next-product w-auto me-4"
                      onClick={() => {props.handleActivate()}}
                      >
                        Activate
                      </button>
                    )
                  }
                  {(pageStatus?.[0]?.deal_status == userFromSession?.user_data?.user_type && !isView) && (<button className="btn btn_primary text-decoration-none next-product w-auto me-4" tabIndex="0" id="next" onClick={() => {
                    setCommunicationModal(true);
                    setIsMoveToFlag(true);
                  }}>
                    Move to
                  </button>)}
                  <button className="btn btn_primary text-decoration-none next-product w-auto" tabIndex="0" id="next" onClick={() => {
                    updateAllBnCMixData({ allowNavigation: true })
                  }}>
                    {onProgress || isSaving ? <Spinner size="sm" className="me-2" /> : "Save & Next"}
                  </button></div>)
                :
                (
                  <div>
                    {(pageStatus?.[0]?.deal_status == userFromSession?.user_data?.user_type && !isView) && (<button className="btn btn_primary text-decoration-none next-product w-auto me-4" tabIndex="0" id="next" onClick={() => {
                      setCommunicationModal(true);
                      setIsMoveToFlag(true);
                    }}>
                      Move to
                    </button>)}
                    <button className="btn btn_primary text-decoration-none next-product w-auto" tabIndex="0" id="next"
                      onClick={() => {
                        props?.handleNext();
                      }}
                    >
                      {props.nextButtonLabel}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
    <Modal show={showPopup} onClose={closePopupWindow} title={"Add Product"}>
      <ProductUnitForm products={allProductName}
        data={allProductJson} closeForm={closePopupWindow} initial={{}} />
    </Modal>
    {communicationModal && (
      <CommunicationForm
        closeModal={() => {
          setCommunicationModal(false);
        }}
        deal_id={deal_id}
        isMoveTo={isMoveToFlag}
      />
    )}
    <BncMixManagement></BncMixManagement>
  </>
  )
}

export default BnCProducts

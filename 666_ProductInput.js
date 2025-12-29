import React, { useState, useRef, useEffect } from "react";
import minus_icon from "../../assets/images/minus_icon.svg";
import plus_icon from "../../assets/images/plus_icon.svg";
import {
  toggleNationalAverage,
  updateMixValue,
  postDealProductMixes,
  updateProductCustomMix,
  postDealProducts,
  sumCustomMix,
  totalOutletsChange,
  sumAllCustomMix,
  updateProductGallons,
  emptyBibMixVal,
} from "../../features/deal/dealSlice";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "react-toastify";
import {
  tooltipCleaner,
  evalMathematicalExpression,
  handleKeyDownPercentage,
  handleKeyDownPossitiveInt,
  hideOriginalField,
  onFocusEmptyValue,
  showOriginalField,
  USNumberFormat,
} from "../../helpers/inputHelpers";
import { setDealFtnDefault } from "../../features/fountain_deal/fountainDealSlice";
import { Spinner } from "react-bootstrap";
import { getFirstAvailableRoute } from "../../helpers/accessHelper";
import SpecialtyProductsTable from "./SpecialtyProductsTable";

const ProductInput = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, deal_id } = useParams();
  const [firstSubCategoryID, setFirstSubCategoryID] = useState(null);
  const { allProductJson, subCategoryIds, selectedProduct, selectedProductAPI, customMixSum, BibMixSum, fountainId, skeletonLoader, selectedCategory } = useSelector((state) => state.deal);
  const { amendment_questions } = useSelector((state) => state.fountainDeal);
  const category_id = fountainId;
  const [progressing, setProgressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false)
  const userFromSession = JSON.parse(localStorage.getItem("user"));
  const customPermissions = userFromSession?.user_data?.custom_permissions;
  const subkeyArr = ["Products", "Outlet_and_volume_growth", "FTN_Equipment", "Bottling_Territories", "Funding_Terms", "Other_product_funding"];
  
  // Use the helper function
  const lastSubkey = getFirstAvailableRoute(customPermissions, subkeyArr, "FTN_Deal_Structure");

  const location = useLocation();
  let isView = location.pathname.startsWith("/view-");
  // check whether the user can permission to modify the deal
  const deal_permission = customPermissions?.["FTN_Deal_Structure"]?.["Products"]?.["edit"] || false;
  if (!deal_permission) isView = true;
  // Separate flag for disabling controls (includes amendment logic)
  let isDisabled = isView;
  // Check if amendment question 2 (products) is answered as "No" (0 or "0")
  if (deal_permission && (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
    isDisabled = true;
  }
  if(isDisabled){
    [".virtualCustomMix", ".originalCustomMix", ".form-check-input", ".form-select"].forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) =>{
        if (!el.closest(".ignore-disable-condition")) {
          el.disabled = true
        }
      })
    });
  }
  
  useEffect(() => {
    if (allProductJson && subCategoryIds) {
      dispatch(sumAllCustomMix());
      const allSubCategories = [...allProductJson?.sub_categories];
      const filteredSubCategories = allSubCategories.filter((sub) => subCategoryIds.includes(sub.sub_category_id) && sub.display_order !== null);
      let firstSubCategory = null;
      firstSubCategory = filteredSubCategories.reduce((min, sub) => {
        const products = selectedProduct[sub.sub_category_id];
        const isNotEmpty = Array.isArray(products) && products.length > 0;
        if (!isNotEmpty) return min; // skip this sub if no products
        if (min === null || sub.display_order < min.display_order) {
          return sub;
        }
        return min;
      }, null);
      setFirstSubCategoryID(firstSubCategory || allSubCategories[0]);
    }
  }, [allProductJson, subCategoryIds]);

  const [accordionState, setAccordionState] = useState({});
  const [gallonFocused, setGallonFocused] = useState();
  const dropdownRefs = useRef({});

  const toggleAccordion = (key) => {
    const wasOpen = accordionState[key];
    setAccordionState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    
    // If opening the accordion, scroll to it after a short delay
    if (!wasOpen) {
      setTimeout(() => {
        const accordionElement = document.querySelector(`#accordion-body-${key}`);
        if (accordionElement) {
          accordionElement.scrollIntoView({ 
            behavior: "smooth", 
            block: "center" 
          });
        }
      }, 100);
    }
  };
  const [dropdownOpenedCategories, setDropdownCategories] = useState({});
  const toggleDropdown = (id) => {
    //let remove_flag = 0;
    // Object.keys(dropdownRefs.current).forEach((key) => {
    //   if (key !== id && dropdownRefs.current[key]) {
    //     dropdownRefs.current[key].classList.remove("show");
    //     const classArray = Array.from(dropdownRefs.current[key].classList);
    //     remove_flag = 1
    //     setDropdownCategories((prev) => {
    //       const newState = { ...prev, [key]: classArray.includes("show") ? true : false };
    //       return newState;
    //     });
    //   }
    // });

    if (dropdownRefs.current[id]) {
      dropdownRefs.current[id].classList.toggle("show");
    }
    const classArray = Array.from(dropdownRefs.current[id].classList);
    setDropdownCategories((prev) => {
      const newState = { ...prev, [id]: classArray.includes("show") ? true : false };
      return newState;
    });
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((id) => {
        if (dropdownRefs.current[id] && dropdownRefs.current[id].classList.contains("show") && !dropdownRefs.current[id].contains(event.target)) {
          dropdownRefs.current[id]?.classList.remove("show");

          const classArray = Array.from(dropdownRefs.current[id].classList);
          setDropdownCategories((prev) => {
            const newState = { ...prev, [id]: classArray.includes("show") ? true : false };
            return newState;
          });
        }
      });
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const updateNationalAverage = (category_id, sub_category_id, value) => {
    dispatch(
      toggleNationalAverage({
        category_id: 1,
        sub_category_id: sub_category_id,
        value: value,
      })
    );
  };
  const handleUpdateMixValue = (product_id, sub_category_id, bib_id, value, objectKey) => {
    // Prevent mix value updates if amendment question 2 (products) is answered as "No"
    if (isDisabled || (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
      return;
    }

    if (value != "" && !String(value)?.includes(".")){
      value = Number(value)
    }

    if (value > 100) return;

    if (allProductJson) {
      // Get the current mix value before dispatching
      const subCategory = allProductJson?.[objectKey]?.find((sub) => sub.sub_category_id === sub_category_id);
      if (!subCategory) return;
      
      // For standalone products (sub_category_id === -1), skip mix_details check
      if (sub_category_id !== -1) {
        if(!Array.isArray(subCategory.mix_details)) return;
        const mix = subCategory?.mix_details?.find((mix) => mix.mix_id === bib_id);
        if (!mix) return;
      }
      
      // Get the current BIB mix value from the product to compare
      const product = subCategory.products?.find((p) => p.product_id === product_id);
      const currentBibMix = product?.bib_mixes?.find((bib) => bib.mix_id === bib_id);
      const currentValue = currentBibMix?.value;
      
      // Only avoid updates if the value is actually the same
      if (currentValue === value) return;
      
      dispatch(
        updateMixValue({
          product_id: product_id,
          sub_category_id: sub_category_id,
          mix_id: bib_id,
          value: value,
          objectKey: objectKey,
        })
      );
    }
  };
  const handleCustomMixChange = (product_id, sub_category_id, value, objectKey) => {
    // Prevent custom mix updates if amendment question 2 (products) is answered as "No"
    if (isDisabled || (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
      return;
    }

    try {

      if (value > 100) return;

      if (value != "" && !`${value}`?.includes(".")) {
        value = Number(value)
      }

      if (allProductJson) {
        const subCategory = allProductJson?.[objectKey]?.find((sub) => sub.sub_category_id == sub_category_id);
        if (!subCategory) return;
        const Product = subCategory?.products?.find((product) => product.product_id == product_id);
        if (Product) {
          dispatch(
            updateProductCustomMix({
              product_id,
              sub_category_id,
              value,
              objectKey,
            })
          );
        }
      }
    } catch (error) {
      console.error("Error updating custom mix:", error);
    }
  };

  const handleProductGallons = (product_id, sub_category_id, value, objectKey, actionKey) => {
    // Remove leading zeros
    if (/^0+\d/.test(value)) {
      value = value.replace(/^0+/, "");
    }

    if (value === "" || isNaN(value)) {
      value = 0;
    }
    if (allProductJson) {
      const subCategory = allProductJson?.[objectKey]?.find((sub) => sub.sub_category_id == sub_category_id);
      if (!subCategory) return;
      const Product = subCategory?.products?.find((product) => product.product_id == product_id);
      if (Product) {
        dispatch(
          updateProductGallons({
            product_id,
            sub_category_id,
            value,
            objectKey,
            actionKey,
          })
        );
      }
    }
  };

  const hasRun = useRef(false); // Prevents infinite loops
  useEffect(() => {
    if (hasRun.current || selectedProductAPI == 0) return; // Ensure this effect runs only once
    hasRun.current = true;

    allProductJson?.sub_categories?.forEach((sub) => {

      if (sub.active_mix !== 1) {
        sub.products.forEach((product) => {
          handleCustomMixChange(product.product_id, sub.sub_category_id, product?.custom_mix, "sub_categories");
        });
      }
      sub?.products?.forEach((product) => {
        product?.bib_mixes?.map((mix) => {
          handleUpdateMixValue(product.product_id, sub.sub_category_id, mix.mix_id, mix?.value, "sub_categories");
        });
      });
    });
  }, [allProductJson?.sub_categories, selectedProductAPI]); // Dependency array

  const handleNext = async () => {
    setIsSaving(true)
    if (isView) {
      setIsSaving(false)
      navigate(`/${isView ? 'view-' : ''}fountain-deal-strucure/${lastSubkey}/${deal_id}`);
      return
    }
    const data = {
      deal_id: deal_id,
      category_id: category_id,
      items: selectedProduct,
    };
    try {
      setProgressing(true);
      // check product meets all cases
      var errorFlag = false;
      var errorMessages = [];
      var errorCategory = [];

      // check atleast one product is selected
      let obj = data?.items;
      const isValid = Object.keys(obj).length > 0 && Object.values(obj).some((arr) => Array.isArray(arr) && arr.length > 0);
      if (!isValid) {
        errorFlag = true;
        errorMessages.push(`You must select at least one product.`);
      }

      if (errorFlag == false) {
        allProductJson?.sub_categories?.map((sub, index) => {
          // check the sub category selected custom mix
          if (sub.sub_category_id === -1) {
            sortedProducts(sub.products).map((product) => {
              if (selectedProduct?.[sub.sub_category_id]?.includes(product.product_id)) {
                if (product?.gallon === undefined || Number(product?.gallon) === 0 || product?.gallon === null) {
                  errorFlag = true;
                  errorCategory.push(sub.sub_category_id);
                  errorMessages.push(`${product.product_name} Gallon value is required`);
                }

                if (product?.total_outlets === undefined || Number(product?.total_outlets) === 0 || product?.total_outlets === null) {
                  errorFlag = true;
                  errorCategory.push(sub.sub_category_id);
                  errorMessages.push(`${product.product_name} Outlet value is required`);
                }

                // Validate BIB sum equals 100 for standalone products
                if (product?.bib_mixes !== undefined && product?.bib_mixes.length > 0) {
                  const totalBib = product.bib_mixes.reduce((sum, mix) => sum + (mix.value ? Number(mix.value) : 0), 0);
                  const total_Bib_value = Number(!isNaN(totalBib) ? totalBib.toFixed(1) : 0);
                  if (total_Bib_value != 100) {
                    errorFlag = true;
                    errorCategory.push(sub.sub_category_id);
                    errorMessages.push(`${product.product_name} BIB should have a total value of 100%.`);
                  }
                }
              }
            });
          } else {
            if ((sub.total_outlets == 0 || sub.total_outlets == null) && selectedProduct?.[sub.sub_category_id]?.length) {
              errorFlag = true;
              errorCategory.push(sub.sub_category_id);
              errorMessages.push(`${sub.sub_category_name}: Total Outlets should be greater than 0.`);
            }
            if ((sub.volumes == 0 || sub.volumes == null) && selectedProduct?.[sub.sub_category_id]?.length) {
              errorFlag = true;
              errorCategory.push(sub.sub_category_id);
              const volumnType_options = volTypeOptions(sub);
              let selected_volumntype = volumnType_options?.find((item) => item.id == sub.vol_type)
              if (!selected_volumntype) {
                selected_volumntype = volumnType_options?.[0];
              }
              const VolumnType = selected_volumntype?.label;
              errorMessages.push(`${sub.sub_category_name}: ${VolumnType} should be greater than 0.`);
            }
            const total_mix_value = !isNaN(customMixSum?.[sub.sub_category_id] || 0) ? (customMixSum?.[sub.sub_category_id] || 0)?.toFixed(1) : 0;
            if (
              ((sub.national_mix === 1 && sub.active_mix === 2) || sub.national_mix === 0) &&
              sub.active_mix !== 1 &&
              selectedProduct?.[sub.sub_category_id]?.length &&
              total_mix_value != 100
            ) {
              errorFlag = true;
              errorCategory.push(sub.sub_category_id);
              errorMessages.push(`${sub.sub_category_name}: The Custom Mix should have a total value of 100%.`);
            } else if (sub.national_mix === 1 && (sub.active_mix === 1 || sub.active_mix === null)) {
              let nationalMixSum = 0;

              sub.products.map((product) => {
                let tempNationalMix = product.national_mix;
                if (tempNationalMix == "None") {
                  tempNationalMix = 0;
                }
                nationalMixSum += tempNationalMix;
              });

              if (nationalMixSum < 100) {
                errorFlag = true;
                errorCategory.push(sub.sub_category_id);
                errorMessages.push(`${sub.sub_category_name} The National Average Mix should have a total value of 100%.`);
              }
            }

            sortedProducts(sub.products).map((product) => {
              const totalBib = product.bib_mixes.reduce((sum, mix) => sum + (mix.value ? Number(mix.value) : 0), 0);
              const total_Bib_value = Number(!isNaN(totalBib) ? totalBib?.toFixed(1) : 0);
              if (
                product?.bib_mixes !== undefined &&
                product?.bib_mixes.length > 0 &&
                selectedProduct?.[sub.sub_category_id]?.includes(product.product_id) &&
                total_Bib_value != 100
              ) {
                if ((sub.national_mix === 1 && sub.active_mix !== 2 && product.national_mix > 0) || ((sub.active_mix === 2 || sub.national_mix === 0) && product.custom_mix > 0)) {
                  errorFlag = true;
                  errorCategory.push(sub.sub_category_id);
                  errorMessages.push(`${product.product_name} BIB should have a total value of 100%.`);
                }
              }
            });
          }
        });
      }
      if (errorFlag) {
        setAccordionState({});
        setAccordionState({
          [errorCategory[0]]: true,
        });
        toast.error(<div>{errorMessages[0]}</div>);
        setProgressing(false);
        setIsSaving(false)
        return;
      }
      const resultdata = await dispatch(postDealProducts(data)).unwrap(); // Ensure it's fulfilled
      const post_data = {...allProductJson, page: "widget"}
      const result = await dispatch(postDealProductMixes(post_data)).unwrap(); // Ensure it's fulfilled
      dispatch(setDealFtnDefault());
      setIsSaving(false)
      navigate(`/fountain-deal-strucure/${lastSubkey}/${deal_id}`);
    } catch (error) {
      setIsSaving(false)
      console.error("Error creating deal:", error);
    } finally {
      setProgressing(false);
    }
  };
  const handleBack = () => {
    navigate(`/${isView ? 'view-' : ''}deal/${id}/${deal_id}/1/${4}`);
  };

  const sortedProducts = (products) => [...products].sort((a, b) => parseFloat(b.national_mix) - parseFloat(a.national_mix));

  if (firstSubCategoryID && Object.keys(accordionState).length == 0) {
    setAccordionState({
      [firstSubCategoryID.sub_category_id]: true,
    });
  }

  useEffect(() => {
    if (firstSubCategoryID) {
      dispatch(
        sumCustomMix({
          sub_category_id: firstSubCategoryID.sub_category_id,
        })
      );
    }
  }, [firstSubCategoryID]);

  const checkBiBDisable = (sub, product) => {
    if (sub.national_mix === 1) {
      if (sub.active_mix !== 2) {
        if (isNaN(product.national_mix) || parseFloat(product.national_mix) == 0 || product.national_mix == "") {
          return true;
        }
      } else {
        if (isNaN(product.custom_mix) || parseFloat(product.custom_mix) == 0 || product.custom_mix == "") {
          return true;
        }
      }
    } else {
      if (isNaN(product.custom_mix) || parseFloat(product.custom_mix) == 0 || product.custom_mix == "") {
        return true;
      }
    }
    return false;
  };

  const volTypeOptions = (sub_category) => {
    let options;
    let keyToExclude;
    if (sub_category?.is_gallons) {
      options = [
        {
          "id": 1,
          "name": "Base Gallons (Includes Allied)",
          "tooltip": "Base Gallons (Includes Allied)",
          "label": "Base Gallons"
        },
        {
          "id": 2,
          "name": "Y1 Gallons (Includes Allied)",
          "tooltip": "Y1 Gallons (Includes Allied)",
          "label": "Y1 Gallons"
        }
      ]
      keyToExclude = 1;
    } else {
      options = [
        {
          "id": 3,
          "name": "Base Cases",
          "tooltip": "Base Cases",
          "label": "Base Cases"
        },
        {
          "id": 4,
          "name": "Y1 Cases",
          "tooltip": "Y1 Cases",
          "label": "Y1 Cases"
        }
      ]
      keyToExclude = 3;
    }
    if (allProductJson?.deal_type != 1) {
      return options;
    } else {
      return options?.filter((item) => item.id != keyToExclude);
    }
  };

  const customMixTotalClass = (sub) => {
    if ((sub.national_mix === 1 && sub.active_mix === 2) || sub.national_mix !== 1) {
      const total_value = (customMixSum[sub.sub_category_id] || 0)?.toFixed(1);
      const total_int = Number(total_value);

      return total_int != 100 ? "text-danger" : "";
    }
    return "";
  };

  const originalCustomMixTotal = (sub) => {
    if ((sub.national_mix === 1 && sub.active_mix === 2) || sub.national_mix !== 1) {
      return customMixSum[sub.sub_category_id];
    }
    return 0;
  };

  const NationaMixTotal = (sub, isTooltip = false) => {
    if (sub.national_mix === 1) {
      const totalNationalMix = sub.products.reduce((sum, product) => {
        return evalMathematicalExpression(sum, product.national_mix != "None" ? parseFloat(product.national_mix) : 0, "+");
      }, 0);
      if (isTooltip) {
        return totalNationalMix;
      }
      return totalNationalMix;
    }
    return Number(0).toFixed(1);
  };

  const customMixTotal = (sub) => {
    return customMixSum[sub.sub_category_id] || 0
    if (!isNaN(parseFloat(customMixSum[sub.sub_category_id]))) {
      return customMixSum[sub.sub_category_id].toFixed(1);
    }
    return Number(0).toFixed(1);
  };

  const handleInputChange = (sub_category_id, objectKey, value, updateKey) => {
    if (["total_outlets", "vol_type", "volumes", "total_pbc_allied_volumes", "vpo"].includes(updateKey)) {
      dispatch(
        totalOutletsChange({
          sub_category_id: sub_category_id,
          objectKey: objectKey,
          value: value,
          updateKey: updateKey,
        })
      );
    }
  };

  const SpecialityTotalOutlets = () => {
    let outlets =
      allProductJson?.sub_categories
        ?.filter((sub) => sub.sub_category_id === -1)
        ?.reduce(
          (total, sub) => total + sub?.products?.filter((prod) => selectedProduct?.[-1]?.includes(prod.product_id))?.reduce((sum, product) => sum + Number(product?.total_outlets || 0), 0),
          0
        ) || 0;
    return outlets;
  };

  const SpecialityTotalGallons = () => {
    let gallons =
      allProductJson?.sub_categories
        ?.filter((sub) => sub.sub_category_id === -1)
        ?.reduce((total, sub) => total + sub?.products?.filter((prod) => selectedProduct?.[-1]?.includes(prod.product_id))?.reduce((sum, product) => sum + Number(product?.gallon || 0), 0), 0) || 0;
    return gallons;
  };

  if (skeletonLoader || progressing)
    return (
      <>
        <div className="col-md-12 col-lg-6 right_section d-flex justify-content-center align-items-center position-relative step_accordian">
          <div className="form_content m-auto position-relative zindex_0">
            <div className="custom_accordian">
              <div className="forms_sections mt_50">
                <div className="w-100 position-relative mb_100 mb-xl-5 pb-xl-5">
                  <div className="accordion" id="DealsProductInput">
                    <div>
                      <Skeleton height={100} width={"100%"} />
                      <Skeleton height={20} width={"50%"} className="mt-2" />
                      <Skeleton height={40} width={"100%"} />
                      <Skeleton height={40} width={"100%"} />
                      <Skeleton height={40} width={"100%"} />
                      <Skeleton height={30} width={"100%"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  return (
    allProductJson && (
      <>
        <div className="col-md-12 col-lg-6 right_section d-flex justify-content-center align-items-center position-relative step_accordian">
          <div className="form_content m-auto position-relative zindex_0">
            <div className="custom_accordian">
              <div className="forms_sections mt_10">
                <div className="w-100 position-relative mb_100 mb-xl-5 pb-xl-5">
                  <div className="accordion" id="DealsProductInput">
                    <>
                      {allProductJson?.sub_categories.map((sub, index) => {
                        const volumnType_options = volTypeOptions(sub);
                        let selected_volumntype = volumnType_options?.find((item) => item.id == sub.vol_type)
                        if (!selected_volumntype) {
                          selected_volumntype = volumnType_options?.[0];
                          handleInputChange(sub.sub_category_id, "sub_categories", volumnType_options?.[0].id, "vol_type");
                        }
                        const VolumnType = selected_volumntype?.label;
                        // sub.vol_type == 1 && allProductJson?.deal_type !== 1 ? "Base Gallons" : "Y1 Gallons";
                        const volumntype_tooltip = selected_volumntype?.tooltip;
                        if (subCategoryIds.includes(sub.sub_category_id) && selectedProduct?.[sub.sub_category_id]?.length) {
                          const total_outlet_val = sub.sub_category_id === -1 ? SpecialityTotalOutlets() : parseInt(sub.total_outlets) || 0;
                          const virtual_total_outlet_val = !isNaN(total_outlet_val) ? total_outlet_val : Number(0);
                          const total_outlet = !isNaN(total_outlet_val) ? total_outlet_val : "";

                          const gallon_val = sub.sub_category_id === -1 ? SpecialityTotalGallons() : parseInt(sub.volumes) || 0;
                          const virtual_gallon_val = !isNaN(gallon_val) ? gallon_val : Number(0);
                          const total_gallons = !isNaN(gallon_val) ? gallon_val : "";

                          const allied_gallon_val = parseInt(sub.total_pbc_allied_volumes) || 0;
                          const virtual_allied_gallon_val = !isNaN(allied_gallon_val) ? allied_gallon_val : Number(0);
                          const total_allied_gallons = !isNaN(allied_gallon_val) ? allied_gallon_val : "";

                          let innovation_mix_tool_tip = {};
                          if (sub?.innovation_mix) {
                            innovation_mix_tool_tip = { "data-tooltip-id": "my-tooltip", "data-tooltip-content": "Innovation Mix", "data-tooltip-place": "top" };
                          }

                          let is_single_product = false
                          let product_id = null
                          if(sub.national_mix != 1 && Object.keys(selectedProduct).map(id => String(id)).includes(String(sub.sub_category_id)) && selectedProduct[sub.sub_category_id].length == 1){
                            is_single_product = true
                            product_id = selectedProduct[sub.sub_category_id][0]
                          }

                          if(is_single_product && sub.sub_category_id in customMixSum && customMixSum[sub.sub_category_id] != 100){
                            dispatch(updateProductCustomMix({
                              product_id: product_id,
                              sub_category_id: sub.sub_category_id,
                              value: 100,
                              objectKey: "sub_categories",
                            }))
                          }

                          return (
                            <React.Fragment key={`accordion-${index}`}>
                              <div className="accordion-item" key={sub.sub_category_id}>
                                <div className="accordion-header cursor_pointer"
                                  onClick={(e) => {
                                    if (
                                      !["input", "label"].includes(e.target.tagName.toLowerCase()) &&
                                      !e.target.classList.contains("form-floating") &&
                                      !e.target.classList.contains("custom_inputs") &&
                                      e.target.closest(`.gallons-dropdown`) == null
                                    ) {
                                      toggleAccordion(sub.sub_category_id);
                                    }
                                  }}
                                >
                                  <div className={`accordion-button ${dropdownOpenedCategories?.[sub.sub_category_id] === true ? "dropdown-opened" : ""}`}>
                                    <div className="d-flex flex-wrap flex-md-prwrap justify-content-center align-items-center w-100">
                                      <p className="deal_product-sub-category-name" {...innovation_mix_tool_tip}>
                                        {sub.sub_category_name}
                                      </p>
                                      <div className="form-floating ms-md-auto custommixvalues_td">
                                        <input
                                          type="number"
                                          className="form-control bg_white-8 virtualCustomMix showVirtualMix"
                                          value={virtual_total_outlet_val}
                                          onKeyDown={handleKeyDownPossitiveInt}
                                          onFocus={(e) => {
                                            showOriginalField(e);
                                            if (!accordionState[sub.sub_category_id]) {
                                              toggleAccordion(sub.sub_category_id);
                                            }
                                          }}
                                          id={`vir_total_outlet_${sub.sub_category_id}`}
                                          readOnly={true}
                                          disabled={sub.sub_category_id === -1}
                                          data-tooltip-id="inp-tooltip"
                                          data-tooltip-content={USNumberFormat(total_outlet || 0, -1)}
                                          title=""
                                        />
                                        <input
                                          type="number"
                                          className="form-control bg_white-8 originalCustomMix hideOriginalMix"
                                          defaultValue={total_outlet}
                                          onKeyDown={handleKeyDownPossitiveInt}
                                          onFocus={(e) => {
                                            onFocusEmptyValue(e);
                                          }}
                                          onBlur={(e) => {
                                            hideOriginalField(e);
                                            // Trim leading zeros
                                            let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                            e.target.value = newValue; // Update input field
                                            handleInputChange(sub.sub_category_id, "sub_categories", newValue, "total_outlets");
                                          }}
                                          name={`total_outlets_${sub.sub_category_id}`}
                                          onChange={(e) => {
                                            // Trim leading zeros
                                            let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                            e.target.value = newValue; // Update input field
                                            handleInputChange(sub.sub_category_id, "sub_categories", newValue, "total_outlets");
                                          }}
                                          disabled={sub.sub_category_id === -1}
                                          data-tooltip-id="inp-tooltip"
                                          data-tooltip-content={USNumberFormat(total_outlet || 0, -1)}
                                          title=""
                                        />
                                        <label
                                          htmlFor={`total-outlets-${sub.sub_category_id}`}
                                          style={sub.sub_category_id == -1 ? { opacity: "0.7" } : {}}
                                        >
                                          Total Outlets *
                                        </label>
                                      </div>

                                      <div className={`custommixvalues_td ${volumnType_options?.length > 1 ? 'custom_inputs' : 'form-floating'} ${gallonFocused === sub.sub_category_id ? "focused" : ""}`}>
                                          {(() => {
                                            return volumnType_options?.length > 1 ? 
                                            (
                                              <>
                                        <div className="dropdown">
                                          <button
                                                  className={`bg-transparent border-0 p-0 ${volumnType_options?.length > 1 ? "dropdown-toggle" : ""}`}
                                            type="button"
                                            disabled={sub.sub_category_id === -1}
                                            onFocus={(e) => {
                                              if (!accordionState[sub.sub_category_id]) {
                                                toggleAccordion(sub.sub_category_id);
                                              }
                                            }}
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevents immediate closing
                                                    if (volumnType_options?.length > 1) toggleDropdown(sub.sub_category_id);
                                            }}
                                            data-tooltip-id="my-tooltip"
                                            data-tooltip-content={`${volumntype_tooltip}`}
                                                  style={{ fontSize: "13px" }}
                                          >
                                            {VolumnType}
                                          </button>
                                                {volumnType_options?.length > 1 && (
                                          <ul className="dropdown-menu gallons-dropdown" ref={(el) => (dropdownRefs.current[sub.sub_category_id] = el)}>
                                            {volumnType_options?.map((item) => {
                                              return <li key={`gallon-dropdown-${sub.sub_category_id}-${item.id}`}>
                                                      <button className={`dropdown-item ${selected_volumntype?.id == item.id ? "active-item" : ""}`} onClick={() => {
                                                        const dropdown = dropdownRefs.current[sub.sub_category_id];
                                                        if (dropdown && dropdown.classList) {
                                                          dropdown.classList.remove("show");
                                                        }
                                                  handleInputChange(sub.sub_category_id, "sub_categories", item?.id, "vol_type");
                                                }}>{item?.label}</button>
                                              </li>
                                            })}
                                          </ul>
                                                )}
                                        </div>
                                              </>
                                            ) : ""
                                          })()}
                                        <input
                                          type="number"
                                          className={`virtualCustomMix showVirtualMix ${volumnType_options?.length > 1 ? 'border-0 bg-transparent' : 'form-control bg_white-8'}`}
                                          value={virtual_gallon_val}
                                          onKeyDown={handleKeyDownPossitiveInt}
                                          onFocus={(e) => {
                                            showOriginalField(e);
                                            setGallonFocused(sub.sub_category_id);
                                          }}
                                          onBlur={() => {
                                            setGallonFocused(undefined);
                                          }}
                                          id={`vir_total_gallon_${sub.sub_category_id}`}
                                          readOnly={true}
                                          disabled={sub.sub_category_id === -1}
                                          title=""
                                          data-tooltip-id="inp-tooltip"
                                          data-tooltip-content={USNumberFormat(total_gallons || 0, -1)}
                                        />
                                        <input
                                          type="number"
                                          className={`originalCustomMix hideOriginalMix ${volumnType_options?.length > 1 ? 'border-0 bg-transparent' : 'form-control bg_white-8'}`}
                                          defaultValue={total_gallons}
                                          onKeyDown={handleKeyDownPossitiveInt}
                                          onFocus={(e) => {
                                            setGallonFocused(sub.sub_category_id);
                                            onFocusEmptyValue(e);
                                          }}
                                          onBlur={(e) => {
                                            hideOriginalField(e);
                                            setGallonFocused(undefined);
                                            // Trim leading zeros
                                            let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                            e.target.value = newValue; // Update input field
                                            handleInputChange(sub.sub_category_id, "sub_categories", newValue, "volumes");
                                          }}
                                          name={`total_gallons_${sub.sub_category_id}`}
                                          onChange={(e) => {
                                            // Trim leading zeros
                                            let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                            e.target.value = newValue; // Update input field
                                            handleInputChange(sub.sub_category_id, "sub_categories", newValue, "volumes");
                                          }}
                                          disabled={sub.sub_category_id === -1}
                                          data-tooltip-id="inp-tooltip"
                                          data-tooltip-content={USNumberFormat(total_gallons || 0, -1)}
                                          title=""
                                        />
                                        {(() => {
                                          return volumnType_options?.length <= 1 ? 
                                          <label htmlFor={`vir_total_gallon_${sub.sub_category_id}`}>
                                            {VolumnType} *
                                          </label> : ''
                                        })()}
                                        
                                      </div>

                                      {sub.allied_gallons ? (
                                        <div className="form-floating custommixvalues_td">
                                          <input
                                            type="number"
                                            className="form-control bg_white-8 virtualCustomMix showVirtualMix"
                                            value={virtual_allied_gallon_val}
                                            onKeyDown={handleKeyDownPossitiveInt}
                                            onFocus={(e) => {
                                              showOriginalField(e);
                                            }}
                                            id={`vir_allied_gallon_${sub.sub_category_id}`}
                                            readOnly={true}
                                            disabled={sub.sub_category_id === -1}
                                            data-tooltip-id="inp-tooltip"
                                            data-tooltip-content={USNumberFormat(total_allied_gallons || 0, -1)}
                                            title=""
                                          />
                                          <input
                                            type="number"
                                            className="form-control bg_white-8 originalCustomMix hideOriginalMix"
                                            defaultValue={total_allied_gallons}
                                            onKeyDown={handleKeyDownPossitiveInt}
                                            onFocus={(e) => {
                                              onFocusEmptyValue(e);
                                            }}
                                            onBlur={(e) => {
                                              hideOriginalField(e);
                                              // Trim leading zeros
                                              let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                              e.target.value = newValue; // Update input field
                                              handleInputChange(sub.sub_category_id, "sub_categories", newValue, "total_pbc_allied_volumes");
                                            }}
                                            name={`total_allied_gallons_${sub.sub_category_id}`}
                                            onChange={(e) => {
                                              // Trim leading zeros
                                              let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                              e.target.value = newValue; // Update input field
                                              handleInputChange(sub.sub_category_id, "sub_categories", newValue, "total_pbc_allied_volumes");
                                            }}
                                            disabled={sub.sub_category_id === -1}
                                            data-tooltip-id="inp-tooltip"
                                            data-tooltip-content={USNumberFormat(total_allied_gallons || 0, -1)}
                                            title=""
                                          />
                                          <label
                                            htmlFor={`allied-gallon-${sub.sub_category_id}`}
                                            className="allied-brand-label tooltip-form-label"
                                            data-tooltip-id="my-tooltip"
                                            data-tooltip-content="Total PBC Allied Brand Gallons"
                                          >
                                            Total PBC Gallons *
                                          </label>
                                        </div>
                                      ) : (
                                        <div className="form-floating opacity_0"></div>
                                      )}
                                      {sub.allied_gallons ? (
                                        <div className="form-floating vpo_input">
                                          <input
                                            type="number"
                                            value={sub.vpo ? Math.round(sub.vpo) : 0}
                                            disabled
                                            className="form-control bg_grey disabled"
                                            name={`total-vpo-${sub.sub_category_id}`}
                                            id={`total-vpo-${sub.sub_category_id}`}
                                            onChange={(e) => {
                                              // Trim leading zeros
                                              let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                              e.target.value = newValue; // Update input field
                                              handleInputChange(sub.sub_category_id, "sub_categories", newValue, "vpo");
                                            }}
                                            title=""
                                            data-tooltip-id="inp-tooltip"
                                            data-tooltip-content={sub.vpo || 0}
                                          />
                                          <label htmlFor={`total-vpo-${sub.sub_category_id}`}>VPO</label>
                                        </div>
                                      ) : (
                                        <div className="form-floating vpo_input opacity_0"></div>
                                      )}
                                      <span
                                        role="button"
                                        tabIndex={0}
                                        onFocus={() => {
                                          if (!accordionState[sub.sub_category_id]) {
                                            toggleAccordion(sub.sub_category_id);
                                          }
                                        }}
                                        style={{
                                          width: 0,
                                          height: 0,
                                          opacity: 0,
                                          position: "absolute",
                                          pointerEvents: "none",
                                          outline: "none",
                                          boxShadow: "none"
                                        }}
                                      />
                                      <p className="ml_10 cursor_pointer">
                                        <img
                                          src={accordionState[sub.sub_category_id] ? minus_icon : plus_icon}
                                          alt="Toggle"
                                          onClick={() => {
                                            // toggleAccordion(sub.sub_category_id);
                                            dispatch(
                                              sumCustomMix({
                                                sub_category_id: sub.sub_category_id,
                                              })
                                            );
                                          }}
                                        />
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div id={`accordion-body-${sub.sub_category_id}`} className={`accordion-collapse collapse ${accordionState[sub.sub_category_id] ? "show" : ""}`}>
                                  <div className="accordion-body px-0 py-0">
                                    {sub.national_mix ? (
                                      <nav>
                                        <div className="d-flex w-100">
                                          <div className="active mr_30">
                                            <div className="form-check radio_2">
                                              <input
                                                className="form-check-input"
                                                type="radio"
                                                name={"national_Avg_" + sub.sub_category_id}
                                                id={"national_Avg_" + sub.sub_category_id}
                                                value="0"
                                                checked={sub?.active_mix ? sub?.active_mix == 1 : true}
                                                onChange={(e) => updateNationalAverage(1, sub.sub_category_id, e.target.value)}
                                              />
                                              <label className="form-check-label" htmlFor={`national_Avg_${sub.sub_category_id}`}>
                                                National Average
                                              </label>
                                            </div>
                                          </div>
                                          <div className="">
                                            <div className="form-check radio_2">
                                              <input
                                                className="form-check-input"
                                                type="radio"
                                                name={"custom_mix_" + sub.sub_category_id}
                                                id={"custom_mix_" + sub.sub_category_id}
                                                value="1"
                                                checked={sub.active_mix == 2}
                                                onChange={(e) => updateNationalAverage(1, sub.sub_category_id, e.target.value)}
                                              />
                                              <label className="form-check-label" htmlFor={`custom_mix_${sub.sub_category_id}`}>
                                                Custom
                                              </label>
                                            </div>
                                          </div>
                                        </div>
                                      </nav>
                                    ) : (
                                      ""
                                    )}
                                    <div className="tab-content mt_10">
                                      <div className={`tab-pane fade show active ${sub?.national_mix && sub?.active_mix === 2 ? "custom_tab" : "custom_tab2"}`}>
                                        <div
                                          className={`${!sub?.national_mix && sub?.mix_details?.length > 1 ? "accordian_body table_2 mt_10" : ""} ${
                                            sub?.mix_details?.length <= 1 ? "accordion-body pt-0 px-0 pb_10" : ""
                                          }`}
                                        >
                                          {sub.sub_category_id === -1 ? (
                                            <SpecialtyProductsTable
                                              sub={sub}
                                              selectedProduct={selectedProduct}
                                              allProductJson={allProductJson}
                                              sortedProducts={sortedProducts}
                                              handleProductGallons={handleProductGallons}
                                              handleUpdateMixValue={handleUpdateMixValue}
                                              isView={isView}
                                            />
                                          ) : (
                                            <div
                                              className={`table-responsive product-table-container ${!sub?.national_mix && sub?.mix_details?.length ? "pr_10" : ""} ${
                                                !sub?.mix_details?.length ? "new_table" : ""
                                              }`}
                                            >
                                              <table className={`table deal-product-table new-table-s ${sub?.national_mix ? "national-mix-table" : ""}`}>
                                                <thead className="pb-2">
                                                  <tr>
                                                    <th scope="col" className="text-start">
                                                      Product
                                                    </th>
                                                    {sub.national_mix ? (
                                                      <th scope="col" width="90" className="text-center">
                                                        Nat'l Avg.
                                                        {" %"}
                                                      </th>
                                                    ) : (
                                                      ""
                                                    )}
                                                    <th scope="col" width="90" className="text-center">
                                                      Custom Mix
                                                      {" %"}
                                                    </th>
                                                    {sub.mix_details?.length ? (
                                                      sub.mix_details.map((mix) => (
                                                        <th scope="col" width="90" style={{fontSize: "13px"}} className="text-center" key={`subcategory_bib_title${sub.sub_category_id}_${mix.mix_id}`}>
                                                          {mix.mix_name}
                                                          {" %"}
                                                        </th>
                                                      ))
                                                    ) : (
                                                      <th></th>
                                                    )}
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  <tr>
                                                    <td scope="row"></td>
                                                  </tr>
                                                  {sub?.products &&
                                                    sortedProducts(sub.products).map((product) => {
                                                      const customMixField = `productinput_${product.product_id}`;
                                                      const virtualcustomMixField = `virtual_productinput_${product.product_id}`;
                                                      const CustomVal = !isNaN(product?.custom_mix) ? product?.custom_mix : 0;
                                                      const customMixValue = CustomVal ? Number(CustomVal).toFixed(1) : Number(0).toFixed(1);
                                                      const national_value = !isNaN(parseFloat(product?.national_mix || 0)) ? Number(product.national_mix).toFixed(1) : Number(0).toFixed(1);
                                                      let nationalToolValue = tooltipCleaner(product?.national_mix);
                                                      let customValToolValue = tooltipCleaner(CustomVal);
                                                      return (
                                                        <tr
                                                          key={`subcategory_product_${sub.sub_category_id}_${product.product_id}`}
                                                          className={selectedProduct?.[sub.sub_category_id]?.includes(product.product_id) ? "" : "d-none"}
                                                        >
                                                          <td>{product.product_name}</td>
                                                          {sub.national_mix === 1 ? (
                                                            <td>
                                                              <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                                <input
                                                                  type="text"
                                                                  className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end`}
                                                                  value={Number(national_value).toFixed(1)}
                                                                  disabled={true}
                                                                  name={`national-avg-${sub.sub_category_id}-${product.product_id}`}
                                                                  data-tooltip-id="inp-tooltip"
                                                                  data-tooltip-content={nationalToolValue}
                                                                  title=""
                                                                />
                                                              </div>
                                                            </td>
                                                          ) : (
                                                            ""
                                                          )}
                                                          <td className="custommixvalues_td">
                                                            {sub.national_mix === 1 && sub.active_mix !== 2 ? (
                                                              <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                                <input
                                                                  type="text"
                                                                  className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end`}
                                                                  value={Number(customMixValue).toFixed(1)}
                                                                  disabled={true}
                                                                  name={`custom-mix-avg-${sub.sub_category_id}-${product.product_id}`}
                                                                />
                                                              </div>
                                                            ) : (
                                                              <>
                                                                <div className="position-relative d-flex justify-content-center align-items-center">
                                                                  <input
                                                                    type="text"
                                                                    className={`virtualCustomMix showVirtualMix form-control fw_600 text-end ${sub.active_mix !== 2 ? "" : "bg-white"}`}
                                                                    name={virtualcustomMixField}
                                                                    id={virtualcustomMixField}
                                                                    value={customMixValue}
                                                                    readOnly={true}
                                                                    onFocus={(e) => {
                                                                      showOriginalField(e);
                                                                    }}
                                                                    data-tooltip-id="inp-tooltip"
                                                                    data-tooltip-content={customValToolValue}
                                                                    title=""
                                                                  />
                                                                  <input
                                                                    value={CustomVal}
                                                                    type="text"
                                                                    className={`originalCustomMix hideOriginalMix form-control fw_600 text-end ${sub.active_mix !== 2 ? "" : "bg-white"}`}
                                                                    name={customMixField}
                                                                    id={customMixField}
                                                                    readOnly={sub.national_mix === 1 && sub.active_mix !== 2}
                                                                    onKeyDown={(e) => handleKeyDownPercentage(e)}
                                                                    onBlur={(e) => {
                                                                      hideOriginalField(e);
                                                                      let value = e.target.value;
                                                                      if (value == 0 || value == "") {
                                                                        dispatch(
                                                                          emptyBibMixVal({
                                                                            product_id: product?.product_id,
                                                                            sub_id: sub?.sub_category_id,
                                                                          })
                                                                        );
                                                                      }
                                                                      }}
                                                                      onChange={(e) => {
                                                                        let newValue = e.target.value;
                                                                        handleCustomMixChange(product.product_id, sub.sub_category_id, newValue, "sub_categories");
                                                                      }}
                                                                      onFocus={(e) => {
                                                                        onFocusEmptyValue(e);
                                                                      }}
                                                                    data-tooltip-id="inp-tooltip"
                                                                    data-tooltip-content={customValToolValue}
                                                                    title=""
                                                                  />
                                                                </div>
                                                              </>
                                                            )}
                                                          </td>

                                                          {sub?.mix_details?.length ? (
                                                            sub?.mix_details.map((mix) => {
                                                              const mixValues = product?.bib_mixes?.filter((m) => m.mix_id === mix.mix_id);
                                                              const mixField = `mixinput_${product.product_id}_${mix.mix_id}`;
                                                              const virutal_mixField = `virutal_mixinput_${product.product_id}_${mix.mix_id}`;
                                                              const MixVal = mixValues?.[0]?.value || 0;
                                                              let bibToolVal = tooltipCleaner(mixValues?.[0]?.value);
                                                              const mixVirutalVal = MixVal ? Number(MixVal).toFixed(1) : Number(0).toFixed(1);

                                                              const BIB_disabled = checkBiBDisable(sub, product);

                                                              return (
                                                                <td key={`bib_value_${sub.sub_category_id}_${mix.mix_id}`} className="custommixvalues_td text-start">
                                                                  <div className="position-relative d-flex justify-content-center align-items-center">
                                                                  <input
                                                                    type="text"
                                                                    className={`form-control bg-white text-end virtualCustomMix fw_600 showVirtualMix ${BIB_disabled ? "bg_grey" : ""}`}
                                                                    name={virutal_mixField}
                                                                    id={virutal_mixField}
                                                                    value={mixVirutalVal}
                                                                    readOnly={true}
                                                                    disabled={BIB_disabled}
                                                                    onFocus={(e) => {
                                                                      showOriginalField(e);
                                                                    }}
                                                                    step={0.1}
                                                                    data-tooltip-id="inp-tooltip"
                                                                    data-tooltip-content={bibToolVal}
                                                                    title=""
                                                                  />
                                                                  <input
                                                                    key={`bib_mix_${product.product_id}_${mix.mix_id}_${CustomVal}`}
                                                                    type="text"
                                                                    className={`form-control bg-white text-end fw_600 originalCustomMix hideOriginalMix ${BIB_disabled ? "bg_grey" : ""}`}
                                                                    name={mixField}
                                                                    id={mixField}
                                                                    value={MixVal}
                                                                    step={0.1}
                                                                    disabled={BIB_disabled}
                                                                    onFocus={(e) => {
                                                                      onFocusEmptyValue(e);
                                                                    }}
                                                                    onBlur={(e) => {
                                                                      hideOriginalField(e);
                                                                    }}
                                                                    onChange={(e) => {
                                                                      let newValue = e.target.value;
                                                                      handleUpdateMixValue(product.product_id, sub.sub_category_id, mix.mix_id, newValue, "sub_categories");
                                                                    }}
                                                                    onKeyDown={(e) => handleKeyDownPercentage(e)}
                                                                    data-tooltip-id="inp-tooltip"
                                                                    data-tooltip-content={bibToolVal}
                                                                    title=""
                                                                  />
                                                                  </div>
                                                                </td>
                                                              );
                                                            })
                                                          ) : (
                                                            <td></td>
                                                          )}
                                                        </tr>
                                                      );
                                                    })}
                                                </tbody>
                                                <tbody className="product-tfoot-row">
                                                  <tr>
                                                    <td scope="row" className="bg-transparent">
                                                      {" "}
                                                    </td>
                                                  </tr>
                                                  <tr>
                                                    <td className="text-center font-16">Total</td>
                                                    {sub.national_mix ? (
                                                      <td className="px-0 totalVales">
                                                        <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                          {(() => {
                                                            const national_mix_percentage = NationaMixTotal(sub) || 0;
                                                            const national_mix_total = USNumberFormat(national_mix_percentage, 1, 1);
                                                            return (
                                                              <input
                                                                type="number"
                                                                className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end fw_800 ${
                                                                  national_mix_total != 100 ? "text-danger" : ""
                                                                }`}
                                                                value={national_mix_total}
                                                                disabled={true}
                                                                name={`national-avg-total-${sub.sub_category_id}`}
                                                                title=""
                                                                data-tooltip-id="inp-tooltip"
                                                                data-tooltip-content={NationaMixTotal(sub, true)}
                                                              />
                                                            );
                                                          })()}
                                                        </div>
                                                      </td>
                                                    ) : (
                                                      ""
                                                    )}
                                                    <td className="px-0 totalVales">
                                                      <div className="position-relative d-flex justify-content-center align-items-center">
                                                      {(() => {
                                                        const total_mix_percentage = customMixTotal(sub) || 0;
                                                        const tooltip_total = USNumberFormat(total_mix_percentage, 1, 1);
                                                        const v_total = USNumberFormat(total_mix_percentage, 1, 1);
                                                        return <input
                                                          type="number"
                                                          className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end fw_800 ${customMixTotalClass(sub)}`}
                                                          value={v_total}
                                                          disabled={true}
                                                          name={`custom-mix-total-${sub.sub_category_id}`}
                                                          title=""
                                                          data-tooltip-id="inp-tooltip"
                                                          data-tooltip-content={total_mix_percentage}
                                                        />
                                                      })()}
                                                      </div>
                                                    </td>
                                                    <td className="totalVales" colSpan={sub?.products?.[0]?.bib_mixes?.length}>
                                                      &nbsp;
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        }
                      })}
                    </>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="button_fixed w-50">
          <button onClick={handleBack} className={`btn btn_outline_primary text-decoration-none `} id="back">
            Back
          </button>
          <button
            onClick={() => {
              handleNext();
            }}
            className={`btn btn_primary text-decoration-none step_4_button `}
            id="next"
          >
          <span>{ isSaving || progressing ? <Spinner size="sm" className="me-2" /> : "Next"}</span>
          </button>
        </div>
      </>
    )
  );
};

export default ProductInput;

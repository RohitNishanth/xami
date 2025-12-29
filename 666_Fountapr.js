import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import processing_time_tabs_icons from "../../../assets/scss/images/processing_time_tabs_icons.svg";
import delete_icon from "../../../assets/scss/images/delete.svg";
import close_icon from "../../../assets/scss/images/close_icon.svg";
import completed_check from "../../../assets/scss/images/completed_check.svg";
import QAIcon from "../../../assets/images/qa_icon.svg";
import {
  subCategoryDataChange,
  updateProductMixValue,
  toggleFountainNationalAverage,
  updateProductCustomMix,
  sumCustomMix,
  postFountainDealProductMixes,
  setAllProductJson,
  updateSelectedProduct,
  setActiveSubCategories,
  createDealSubCategory,
  subCategoryDataUpdate,
  removeSelectedProduct,
  updateProductGallons,
  getDealStatusDetails,
  updateNewSubcategories
} from "../../../features/fountain_deal/fountainDealSlice";
import { postDealProducts, totalOutletsChange } from "../../../features/deal/dealSlice";
import { toast } from "react-toastify";
import { forwardRef, useImperativeHandle } from "react";
import RightPanel from "./RightPanel";
import Swal from "sweetalert2";
import { handlePercentageField, tooltipCleaner, evalMathematicalExpression, handleKeyDownPercentage, handleKeyDownPossitiveInt, hideOriginalField, onFocusEmptyValue, showOriginalField, USNumberFormat, handleKeyDownLimit} from "../../../helpers/inputHelpers";
import { Link, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import AddMoreCategories from "../addMoreCategories";
import { handlePasteRemoveSpecialChar } from "../../../helpers/inputHelpers";
import { USER_ACCESS_DEFAULT } from "../../../constants/constants";
import NotesPanel from "../../deals/NotesPanel";
import NoAccess from "../../../components/NoAccess";
import FountainSpecialtyProductRow from "./FountainSpecialtyProductRow";

const FountainProducts = forwardRef((props, ref) => {
  const { setSubmitProgress } = props;
  const dispatch = useDispatch();
  const mainKey = "FTN_Deal_Structure";
  const subKey = "Products";
  // get session user type
  const userFromSession = JSON.parse(localStorage.getItem("user"));
  const userType = userFromSession?.user_data?.user_type;
  const customPermissions = userFromSession?.user_data?.custom_permissions;

  const userAccessEdit = customPermissions?.[mainKey]?.[subKey]?.edit || false;
  const userAccessView = customPermissions?.[mainKey]?.[subKey]?.view || false;

  const [loading, setLoading] = useState(true);
  const [notesModal, setNotesModal] = useState(false);
  const notesPanelRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const { step } = props;
  const { user } = useSelector((state) => state.auth);
  const { allProductJson, subCategoryIds, selectedProduct, customMixSum, BibMixSum, amendment_years_from_contract_start, amendment_questions } = useSelector((state) => state.fountainDeal);
  const { dealCustomer } = useSelector((state) => state.customer);
  const deal_type = dealCustomer?.deal_type;
  const [accordionState, setAccordionState] = useState({});
  const [showModel, setShowModel] = useState(false);
  const [modelData, setModelData] = useState(null);
  const [currentSubCat, setCurrentSubCat] = useState(null);
  const [tempSelectedProduct, setTempSelectedProduct] = useState([]);
  const [showRightPanel, setRightPanel] = useState(false);
  const [prevValue, setPrevValue] = useState("");
  const { outletQuestions } = useSelector((state) => state.deal);
  const inputRefs = useRef([]);
  const location = useLocation();
  const isView = location.pathname.startsWith("/view-");
  let isEditable = true;

  if (isView) {
    isEditable = false;
  }
  if(!userAccessEdit){
    isEditable = false;
  }
  let isViewPage = true;
  if(!userAccessView){
    isViewPage = false;
  }
  // Check if amendment question 2 (products) is answered as "No" (0 or "0")
  if(userAccessEdit && (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")){
    isEditable = false;
  }

  const showPanel = async () => {
    setRightPanel(true);
  };
  const closePanel = () => {
    setRightPanel(false);
  };
  const navigateNext = () => {
    props?.navigateNext();
  };
  useImperativeHandle(ref, () => ({
    showPanel,
    isSaving,
  }));

  if (allProductJson != null && loading) {
    setLoading(false)

    allProductJson?.sub_categories?.map(sc => sc.sub_category_id).filter(sc => !(sc == -1)).forEach((id) => {
      dispatch(
        sumCustomMix({
          sub_category_id: id,
        })
      );
    })
  }

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

  const volTypeLable = (sub) => {
    const volumnType_options = volTypeOptions(sub);
    let selected_volumntype = volumnType_options?.find((item) => item.id == sub.vol_type)
    if (!selected_volumntype) {
      selected_volumntype = volumnType_options?.[0];
    }
    return selected_volumntype?.label;
  }

  useEffect(() => {

    if (!isEditable) {
      return
    }

    const fetchData = async () => {
      setIsSaving(true);
      if (setSubmitProgress) setSubmitProgress(true);
      try {
        var errorFlag = false;
        var errorMessages = [];
        var errorCategory = [];

        if (subCategoryIds?.length == 0) {
          errorFlag = true;
          errorMessages.push(`Please ensure that at least one product is selected before continuing.`);
        }

        allProductJson?.sub_categories?.forEach((sub, index) => {
          if(errorFlag) return
          if (sub.sub_category_id !== -1) {
            let ColVolumeName = volTypeLable(sub);
            if ((sub.total_outlets == 0 || sub.total_outlets == null)) {
              errorFlag = true;
              errorMessages.push(`${sub.sub_category_name}: Total Outlets should be greater than 0.`);
            }
            if ((sub.volumes == 0 || sub.volumes == null)) {
              errorFlag = true;
              errorMessages.push(`${sub.sub_category_name}: ${ColVolumeName} should be greater than 0.`);
            }
            const total_custom_mix_percentage = customMixSum?.[sub.sub_category_id] || 0;
            const v_custom_mix_total = USNumberFormat(total_custom_mix_percentage, 1, 1);
            if (
              ((sub.national_mix === 1 && sub.active_mix === 2) || sub.national_mix === 0) &&
              sub.active_mix !== 1 &&
              v_custom_mix_total != 100
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

            sortedProducts(sub.products).forEach((product) => {
              const totalBib = product.bib_mixes.reduce((sum, mix) => sum + parseFloat(mix.value), 0);
              const total_Bib_value = Number(!isNaN(totalBib) ? totalBib?.toFixed(1) : 0);
              if (
                product?.bib_mixes !== undefined &&
                product?.bib_mixes?.length > 0 &&
                selectedProduct?.[sub.sub_category_id]?.includes(product.product_id) &&
                (total_Bib_value != 100)
              ) {
                if ((sub.national_mix === 1 && sub.active_mix !== 2 && product.national_mix > 0) || ((sub.active_mix === 2 || sub.national_mix === 0) && product.custom_mix > 0)) {
                  errorFlag = true;
                  errorCategory.push(sub.sub_category_id);
                  errorMessages.push(`${product.product_name} BIB should have a total value of 100%.`);
                }
              }
            });
          } else {
            sortedProducts(sub.products).forEach((product) => {
              let ColVolumeName = volTypeLable(sub);
              if (selectedProduct?.[sub.sub_category_id]?.includes(product.product_id)) {
                if(errorFlag) return
                if (product?.gallon === undefined || Number(product?.gallon) === 0 || product?.gallon === null) {
                  errorFlag = true;
                  errorMessages.push(`${product.product_name} ${ColVolumeName} value is required`);
                }

                if (product?.total_outlets === undefined || Number(product?.total_outlets) === 0 || product?.total_outlets === null) {
                  errorFlag = true;
                  errorMessages.push(`${product.product_name} Outlet value is required`);
                }

                // Validate BIB sum equals 100 for specialty products in Save & Next
                if (product?.bib_mixes !== undefined && product?.bib_mixes.length > 0) {
                  const totalBib = product.bib_mixes.reduce((sum, mix) => sum + (mix.value ? Number(mix.value) : 0), 0);
                  const total_Bib_value = Number(!isNaN(totalBib) ? totalBib.toFixed(1) : 0);
                  if (total_Bib_value != 100) {
                    errorFlag = true;
                    // Use accordion key format for specialty products: sub_category_id_product_id
                    errorCategory.push(`${sub.sub_category_id}_${product.product_id}`);
                    errorMessages.push(`${product.product_name} BIB should have a total value of 100%.`);
                  }
                }
              }
            });
          }
        });

        if (errorFlag) {
          setAccordionState({});
          setAccordionState({
            [errorCategory[0]]: true,
          });
          toast.error(<div>{errorMessages[0]}</div>);
          // Scroll to the error row if it's a specialty product accordion
          if (errorCategory[0]?.includes('_') && errorCategory[0]?.startsWith('-1_')) {
            setTimeout(() => {
              const element = document.querySelector(`tr[class*="table_mix_open"]`);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
          setIsSaving(false);
          if (setSubmitProgress) setSubmitProgress(false);
          return;
        } else {
          const result = await dispatch(postFountainDealProductMixes(allProductJson)).unwrap(); // Ensure it's fulfilled
          setIsSaving(false);
          if (setSubmitProgress) setSubmitProgress(false);
          if (outletQuestions) {
            navigateNext();
          } else {
            props.showSidePanel();
          }
        }
      } catch (error) {
        console.error("Error creating deal:", error);
        setIsSaving(false);
        if (setSubmitProgress) setSubmitProgress(false);
      }
    };

    if (step != 1) {
      if (!isEditable) {
        return
      }

      fetchData();
    }
  }, [step]);

  const handleUpdateMixValue = (product_id, sub_category_id, bib_id, value, objectKey) => {
    // Prevent mix value updates if amendment question 2 (products) is answered as "No" or not editable
    if (!isEditable || (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
      return;
    }

    // Remove leading zeros
    if (/^0+\d/.test(value)) {
      value = value.replace(/^0+/, "0");
    }

    if (isNaN(value)) {
      value = 0;
    }

    if (Number(value) > 100) return;

    if (allProductJson) {
      // Get the current mix value before dispatching
      const subCategory = allProductJson?.[objectKey]?.find((sub) => sub.sub_category_id === sub_category_id);
      if (!subCategory) return;
      if(!subCategory) return;
      const mix = subCategory?.mix_details?.find((mix) => mix.mix_id === bib_id);
      if (!mix || mix.value === value) return; // Avoid unnecessary updates
      dispatch(
        updateProductMixValue({
          product_id: product_id,
          sub_category_id: sub_category_id,
          mix_id: bib_id,
          value: value,
          objectKey: objectKey,
        })
      );
    }
  };
  const checkBiBDisable = (sub, product) => {
    if (sub.national_mix === 1) {
      if (sub.active_mix !== 2) {
        if (isNaN(product.national_mix) || (parseFloat(product.national_mix) == 0 || product.national_mix == "")) {
          return true;
        }
      } else {
        if (isNaN(product.custom_mix) || (parseFloat(product.custom_mix) == 0 || product.custom_mix == "")) {
          return true;
        }
      }
    } else {
      if (isNaN(product.custom_mix) || (parseFloat(product.custom_mix) == 0 || product.custom_mix == "")) {
        return true;
      }
    }
    return false;
  };

  const toggleAccordion = (key) => {
    setAccordionState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateNationalAverage = (category_id, sub_category_id, value) => {
    dispatch(
      toggleFountainNationalAverage({
        category_id: category_id,
        sub_category_id: sub_category_id,
        value: value,
      })
    );
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

  const handleCustomMixChange = (product_id, sub_category_id, value, objectKey) => {
    // Prevent custom mix updates if amendment question 2 (products) is answered as "No" or not editable
    if (!isEditable || (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
      return;
    }

    // Remove leading zeros
    if (/^0+\d/.test(value)) {
      value = value.replace(/^0+/, "0");
    }

    if (isNaN(value)) {
      value = 0;
    }

    if (Number(value) > 100) return;

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
  };
  const sortedProducts = (products) => [...products].sort((a, b) => parseFloat(b.national_mix) - parseFloat(a.national_mix));

  const handleSubcategorySave = async (subCategoryId, product_id = 0) => {
    let filteredSubCategories = JSON.parse(JSON.stringify(allProductJson.sub_categories.filter((sub) => sub.sub_category_id === subCategoryId)));
    if (filteredSubCategories?.length === 0) {
      return {}; // Return empty if no matching sub-category is found
    }

    let data = {
      subCategoryId: subCategoryId,
      deal_id: allProductJson.deal_id,
      category_id: allProductJson.category_id,
      sub_categories: filteredSubCategories,
    };

    //filtering single given specialty product
    let product_name = "";
    if (subCategoryId == -1) {
      filteredSubCategories.forEach(sub => {
        if (Array.isArray(sub.products)) {
          sub.products = sub.products.filter(product => {
            if(product.product_id == product_id){
              product_name = product.product_name;
              return true;
            }
          });
        }
      });
    }

    var errorFlag = false;
    var errorMessages = [];
    var errorCategory = [];
    let ColVolumeName = volTypeLable(filteredSubCategories[0]);
    if (subCategoryId !== -1) {
      let total_outlets = filteredSubCategories[0]?.total_outlets;
      let volumes = filteredSubCategories[0]?.volumes;

      if(total_outlets == "" || total_outlets <= 0){
        errorFlag = true;
        errorCategory.push(filteredSubCategories[0].sub_category_id);
        errorMessages.push(`${filteredSubCategories[0].sub_category_name}: Total Outlets should be greater than 0.`);
      }

      if(volumes == "" || volumes <= 0){
        errorFlag = true;
        errorCategory.push(filteredSubCategories[0].sub_category_id);
        errorMessages.push(`${filteredSubCategories[0].sub_category_name}: ${ColVolumeName}  should be greater than 0.`);
      }

      const total_mix_value = !isNaN(customMixSum?.[filteredSubCategories[0].sub_category_id] || 0) ? (customMixSum?.[filteredSubCategories[0].sub_category_id] || 0)?.toFixed(1) : 0;
      if (
        ((filteredSubCategories[0].national_mix === 1 && filteredSubCategories[0].active_mix === 2) || filteredSubCategories[0].national_mix === 0) &&
        filteredSubCategories[0].active_mix !== 1 &&
        // selectedProduct?.[filteredSubCategories[0].sub_category_id]?.length &&
        total_mix_value != 100
      ) {
        errorFlag = true;
        errorCategory.push(filteredSubCategories[0].sub_category_id);
        errorMessages.push(`${filteredSubCategories[0].sub_category_name}: The Custom Mix should have a total value of 100%.`);
      }
      const totalMixesPerProduct = filteredSubCategories[0].products.map((product) => {
        const totalValue = product.bib_mixes.reduce((sum, mix) => sum + Number(mix.value), 0);
        return {
          product_name: product.product_name,
          product_id: product.product_id,
          total_value: totalValue,
          bib_mixes: product.bib_mixes,
          custom_mix: product.custom_mix,
          national_mix: product.national_mix,
        };
      });
      sortedProducts(totalMixesPerProduct).map((product, index) => {
        const totalBib = product?.bib_mixes?.reduce((sum, mix) => sum + (mix.value ? Number(mix.value) : 0), 0);
        const total_Bib_value = Number(!isNaN(totalBib) ? totalBib?.toFixed(1) : 0);
        if (product?.bib_mixes?.length > 0 && total_Bib_value != 100) {
          if (
            (filteredSubCategories[0].national_mix === 1 && filteredSubCategories[0].active_mix !== 2 && product.national_mix > 0) ||
            ((filteredSubCategories[0].active_mix === 2 || filteredSubCategories[0].national_mix === 0) && product.custom_mix > 0)
          ) {
            errorFlag = true;
            errorCategory.push(filteredSubCategories[0].sub_category_id);
            errorMessages.push(`${product.product_name} BIB should have a total value of 100%.`);
          }
        }
      });
    } else {
      sortedProducts(filteredSubCategories[0].products).map((product) => {
        if (selectedProduct?.[filteredSubCategories[0].sub_category_id]?.includes(product.product_id) && product.product_id == product_id) {
          if (product?.gallon === undefined || Number(product?.gallon) === 0 || product?.gallon === null) {
            errorFlag = true;
            errorMessages.push(`${product.product_name} ${ColVolumeName} value is required`);
          }

          if (product?.total_outlets === undefined || Number(product?.total_outlets) === 0 || product?.total_outlets === null) {
            errorFlag = true;
            errorMessages.push(`${product.product_name} Outlet value is required`);
          }

          // Validate BIB sum equals 100 for specialty products
          if (product?.bib_mixes !== undefined && product?.bib_mixes.length > 0) {
            const totalBib = product.bib_mixes.reduce((sum, mix) => sum + (mix.value ? Number(mix.value) : 0), 0);
            const total_Bib_value = Number(!isNaN(totalBib) ? totalBib.toFixed(1) : 0);
            if (total_Bib_value != 100) {
              errorFlag = true;
              // Use accordion key format for specialty products: sub_category_id_product_id
              errorCategory.push(`${filteredSubCategories[0].sub_category_id}_${product_id}`);
              errorMessages.push(`${product.product_name} BIB should have a total value of 100%.`);
            }
          }
        }
      });
    }

    if (errorFlag) {
      setAccordionState({});
      setAccordionState({
        [errorCategory[0]]: true,
      });
      toast.error(<div>{errorMessages[0]}</div>);
      // Scroll to the error row if it's a specialty product accordion
      if (subCategoryId == -1 && errorCategory[0]?.includes('_')) {
        setTimeout(() => {
          const accordionKey = errorCategory[0];
          const element = document.querySelector(`tr[class*="table_mix_open"]`);
          if (element) {
            scrollRowIntoView(element, 100);
          }
        }, 100);
      }
      return;
    }

    const result = await dispatch(postFountainDealProductMixes(data)).unwrap();
    dispatch(setAllProductJson({ data: result, product_id: product_id }));
    if(subCategoryId == -1){
      toast.success(`${product_name}: Total Outlets and ${ColVolumeName} updated successfully`);
    }else{
      toast.success(`${filteredSubCategories[0].sub_category_name}: Mix updated successfully`);
      toggleAccordion(subCategoryId);
    }
  };

  const handleDelete = async (id, name, item = "sub_category", product = null, objectKey = "sub_categories") => {
    Swal.fire({
      title: `Are you sure you want to delete ${name}?`,
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
          if (item == "product") {
            let sub_id = id;
            RemoveSelectedProduct(sub_id, product, objectKey);
          } else if (item == "sub_category") {
            RemoveSelectedSubcategory(id, name);
          }
        } catch (err) {
          console.error("Failed to delete the record", err);
          Swal.fire("Error!", "Failed to delete the record.", "error");
        }
      }
    });
  };

  const RemoveSelectedProduct = async (sub_category_id, product, objectKey) => {
    let tempProducts = JSON.parse(JSON.stringify(selectedProduct));
    tempProducts[sub_category_id] = tempProducts[sub_category_id].filter((p) => p !== product.product_id);
    const data = {
      deal_id: allProductJson?.deal_id,
      category_id: allProductJson?.category_id,
      items: tempProducts,
    };
    try {
      const product_result = await dispatch(postDealProducts(data)).unwrap(); // Ensure it's fulfilled
      if (product_result) {
        setTempSelectedProduct((prevSelected) => {
          prevSelected[sub_category_id] = prevSelected[sub_category_id]?.filter((p) => p !== product.product_id);
          return prevSelected;
        });
        let value = 0;
        dispatch(
          updateProductCustomMix({
            product_id: product.product_id,
            sub_category_id,
            value,
            objectKey,
          })
        );
        dispatch(removeSelectedProduct({ sub_category_id: sub_category_id, product: product, objectKey: objectKey }));
        Swal.fire("Deleted!", `${product.product_name} has been deleted successfully`, "success");
      }
    } catch (error) {
      console.error("Error deleteing product:", error);
    }
  };

  const RemoveSelectedSubcategory = async (sub_category_id, name) => {
    let allSubIds = allProductJson?.sub_categories.map(sc => String(sc.sub_category_id))
    sub_category_id = [String(sub_category_id)];
    let filteredArray = allSubIds.filter((item) => !sub_category_id.includes(item));

    const filtered_sub_category_ids = filteredArray.join(",");

    const data = {
      category_id: allProductJson.category_id,
      created_by: user?.user_data?.user_id,
      deal_id: allProductJson.deal_id,
      sub_category_id: filtered_sub_category_ids,
    };
    let tempData = filteredArray?.map(id => parseInt(id))
    dispatch(setActiveSubCategories({ data: tempData }));
    try {
      let response = await dispatch(createDealSubCategory(data)).unwrap();
      if (response !== undefined) {
        Swal.fire("Deleted!", `${name} has been deleted successfully`, "success");
      }
      //dispatch(setCheckedSubCat(filteredArray))
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };

  const addSelectedSubcategory = async (sub_category_ids = []) => {
    let allSubIds = allProductJson?.sub_categories.map(sc => String(sc.sub_category_id))
    const combinedArray = [...allSubIds, ...sub_category_ids];
    const filtered_sub_category_ids = combinedArray.join(",");

    const data = {
      category_id: allProductJson.category_id,
      created_by: user?.user_data?.user_id,
      deal_id: allProductJson.deal_id,
      sub_category_id: filtered_sub_category_ids,
      newcategory: true
    };

    try {
      let response = await dispatch(createDealSubCategory(data)).unwrap();
      if (response !== undefined) {
        toast.success("Sub categories added successfully.");
        await dispatch(updateNewSubcategories({deal_id: allProductJson.deal_id, sub_category: sub_category_ids.join(", "), category: 1}));
        //props?.reloadComponent()
        //window.location.reload();
      }
      //dispatch(setCheckedSubCat(filteredArray))
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };

  const modelRef = useRef(null);
  const resetTempSelectionForCurrentSubCat = () => {
    setTempSelectedProduct((prev) => {
      const updated = { ...prev };
      if (currentSubCat && updated[currentSubCat]) {
        delete updated[currentSubCat];
      }
      return updated;
    });
  };

  const handleCloseAddProductModal = () => {
    setShowModel(false);
    resetTempSelectionForCurrentSubCat();
    setCurrentSubCat(null);
  };

  const handleClickOutsideModel = (e) => {
    if (modelRef.current && !modelRef.current.contains(e.target)) handleCloseAddProductModal();
  };
  const handleAddProduct = (subCatId) => {
    // start with a clean selection for this subcategory
    setTempSelectedProduct((prev) => ({ ...prev, [subCatId]: [] }));
    setShowModel(true);
    const subCategory = [...allProductJson.sub_categories].find((sub) => sub.sub_category_id === subCatId);

    if (subCatId != -1) {
      if (!subCategory || !subCategory.products) {
        return [];
      }
    }
    let modelProductList = [];
    modelProductList = subCategory.products.map((product) => ({
      product_id: product.product_id,
      product_name: product.product_name,
      subCatId: subCatId,
    }));
    let result = [];
    setModelData(modelProductList);
    setCurrentSubCat(subCatId);
  };
  const handleCheckboxChange = (sub_category_id, product, objectKey) => {
    setTempSelectedProduct((prevSelected) => {
      const newSelected = { ...prevSelected }; // Copy previous state

      // Check if the sub_category_id exists in the object
      if (!newSelected[sub_category_id]) {
        newSelected[sub_category_id] = []; // Initialize if not present
      }

      const isProductSelected = newSelected[sub_category_id].includes(product.product_id);

      if (isProductSelected) {
        // Remove product_id if it's already selected
        newSelected[sub_category_id] = newSelected[sub_category_id].filter((id) => id !== product.product_id);

        // Remove the key if array becomes empty (optional)
        if (newSelected[sub_category_id]?.length === 0) {
          delete newSelected[sub_category_id];
        }
      } else {
        // Add product_id if not already selected
        newSelected[sub_category_id] = [...newSelected[sub_category_id], product.product_id];
      }

      return newSelected;
    });
  };

  const updateNewProducts = async () => {
    try {
      if (!tempSelectedProduct[currentSubCat]?.length) {
        return; // Don't close modal, just return
      }
      setShowModel(false);

      // Wait for updateSelectedProduct to complete
      await dispatch(updateSelectedProduct({ sub_category_id: currentSubCat, product: tempSelectedProduct }));

      // Wait for state update before using selectedProduct
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for state update

      // Create a deep copy of selectedProduct to avoid modifying Redux state directly
      let tempSelectedProductAll = JSON.parse(JSON.stringify(selectedProduct));

      let selected_sub_cat = Number(currentSubCat);
      Object.keys(tempSelectedProduct).forEach((sub_category_id) => {
        const subCategoryKey = String(sub_category_id); // Convert to string for consistency
        selected_sub_cat = Number(sub_category_id);

        if (!tempSelectedProductAll[subCategoryKey]) {
          tempSelectedProductAll[subCategoryKey] = []; // Initialize if key doesn't exist
        }

        // Loop through product array and add only if not already present
        tempSelectedProduct[subCategoryKey].forEach((prod) => {
          if (!tempSelectedProductAll[subCategoryKey].includes(prod)) {
            tempSelectedProductAll[subCategoryKey].push(prod);
          }
        });
      });
      // Push the new products safely
      // tempSelectedProductAll[Number(selected_sub_cat)] = [...tempSelectedProductAll[Number(selected_sub_cat)], ...tempSelectedProduct[Number(selected_sub_cat)]];

      const postdata = {
        deal_id: allProductJson?.deal_id,
        category_id: allProductJson?.category_id,
        items: tempSelectedProductAll,
      };

      // Dispatch the API call with updated data
      const result = await dispatch(postDealProducts(postdata)).unwrap();
      dispatch(getDealStatusDetails({deal_id: allProductJson?.deal_id, cat_id: allProductJson?.category_id || 1}));
    } catch (error) {
      console.error("Error creating deal:", error);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideModel);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideModel);
    };
  }, []);

  const ColVolumeName = `${allProductJson?.deal_type !== 1 ? "Base" : "Y1"} Gallons/Cases`;


  // separate unselected products
  let addProductsData = modelData?.filter((item) => !selectedProduct?.[item.subCatId]?.includes(item.product_id)) || [];

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

  const SpecialityVPO = () => {
    let total_outlets = SpecialityTotalOutlets();
    let gallons = SpecialityTotalGallons();

    return total_outlets > 0 ? gallons / total_outlets : 0;
  };

  const NationaMixTotal = (sub, isTooltip = false) => {
    if (sub.national_mix === 1) {
      const totalNationalMix = sub.products.reduce((sum, product) => {
        return evalMathematicalExpression(sum, (product.national_mix != "None" ? parseFloat(product.national_mix) : 0), "+")
      }, 0);
      if(isTooltip){
        return totalNationalMix
      }
      return totalNationalMix.toFixed(1);
    }
    return Number(0).toFixed(1);
  };

  function scrollRowIntoView(rowElement, offset = 50) {
    if (!rowElement) return;

    const rect = rowElement.getBoundingClientRect();

    // scroll the page so that row is visible + some offset from top
    window.scrollBy({
      top: rect.top - offset,
      behavior: "smooth"
    });
  }


  if (loading) {
    return <div className="w-100">
      <Skeleton count={6} height={40} className="mt-2" />
    </div>
  }

  // Add access denied overlay if user doesn't have view permission
  if (!isViewPage) {
    return <NoAccess />
  }

  if(!isEditable){
    [".virtualCustomMix", ".originalCustomMix", ".form-check-input", ".form-select"].forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) =>{
        if (!el.closest(".ignore-disable-condition")) {
          el.disabled = true
        }
      })
    });
  }

  let hasSpeciality = allProductJson?.sub_categories?.some(sc => sc.sub_category_id === -1 || sc.sub_category_id == "-1");
  let specialityProducts = []
  if(hasSpeciality){
    specialityProducts = allProductJson?.sub_categories?.find(sc => sc.sub_category_id === -1 || sc.sub_category_id == "-1")?.products
  }

  return (
    <>
      <div className="d-flex justify-content-end mb-3 right-align-category">
        <AddMoreCategories
          deal_id={allProductJson?.deal_id}
          category_id={1}
          isEditable={isEditable}
          addSelectedSubcategory={addSelectedSubcategory}
          // subCategoryIds={allProductJson?.sub_categories.map(sc => sc.sub_category_id).filter(id => !(id == -1))}
          subCategoryIds={allProductJson?.sub_categories.map(sc => sc.sub_category_id)}
        />
      </div>
      <section className="custom_tabs_content fountain_deal_page mb_100 pb_50 fountain-product-tab new-custom-tab">
        <div className="table-responsive custom_table_1 tab_table_1 pt-2">
          <table className="table">
            <thead>
              <tr>
                <th scope="col" width="350px">
                  Products
                </th>
                <th scope="col" width="34px" className="text-center">
                  Total Outlets
                </th>
                <th scope="col" width="150px" className="text-center">
                  {ColVolumeName}
                </th>
                <th scope="col" width="150px" className="text-center">
                  Allied Gallons
                </th>
                <th scope="col" width="150px" className="text-center">
                  VPO
                </th>
                <th scope="col" width="400px">
                  <div className="table_radio_headding d-none">Mix Method</div>
                </th>
                <th scope="col" className="text-start">Actions</th>
                <th scope="col" width="250px" className="text-center pad-r-2">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {allProductJson?.sub_categories?.map((sub, index) => {
                if (sub.sub_category_id.toString() != "-1") {
                  const VolumnType = volTypeLable(sub);
                  const total_outlet_val = parseInt(sub.total_outlets) || 0;
                  const virtual_total_outlet_val = !isNaN(total_outlet_val) ? total_outlet_val : Number(0);
                  const total_outlet = !isNaN(total_outlet_val) ? total_outlet_val : "";

                  const gallon_val = parseInt(sub.volumes) || 0;
                  const virtual_gallon_val = !isNaN(gallon_val) ? gallon_val : Number(0);
                  const total_gallons = !isNaN(gallon_val) ? gallon_val : "";

                  const allied_gallon_val = parseInt(sub.total_pbc_allied_volumes) || 0;
                  const virtual_allied_gallon_val = !isNaN(allied_gallon_val) ? allied_gallon_val : Number(0);
                  const total_allied_gallons = !isNaN(allied_gallon_val) ? allied_gallon_val : "";

                  let vpo = Number(sub.vpo || 0);
                  vpo = USNumberFormat(Math.round(vpo));
                  let vpo_tooltip = USNumberFormat(Number(sub.vpo || 0), 1, 1);

                  let innovation_mix_tool_tip = {}
                  if (sub?.innovation_mix) {
                    innovation_mix_tool_tip = { "data-tooltip-id": "my-tooltip", "data-tooltip-content": "Innovation Mix", "data-tooltip-place": "top" }
                  }
                  let modelProductList = [];
                  modelProductList = sub.products.map((product) => ({
                    product_id: product.product_id,
                    product_name: product.product_name,
                    subCatId: sub.sub_category_id,
                  }));
                  let checkaddProductsData = modelProductList?.filter((item) => !selectedProduct?.[item.subCatId]?.includes(item.product_id)) || [];
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td colSpan={"1"} >
                          <div className="d-flex"
                            {...innovation_mix_tool_tip}
                          >
                            <span>{sub.sub_category_name} {sub?.innovation_mix ? ' (IM)' : ''}</span>
                          </div>
                        </td>
                        <td className="text-center custommixvalues_td pad-r-2" >
                          <input
                            type="text"
                            className="form-control bg-transparent inline-edit-field virtualCustomMix showVirtualMix text-end"
                            value={USNumberFormat(virtual_total_outlet_val)}
                            onKeyDown={handleKeyDownPossitiveInt}
                            onFocus={(e) => {
                              showOriginalField(e);
                            }}
                            id={`vir_total_outlet_${sub.sub_category_id}`}
                            readOnly={true}
                            data-tooltip-id="inp-tooltip"
                            data-tooltip-content={USNumberFormat(total_outlet_val)}
                            onPaste={(e) => {
                                handlePasteRemoveSpecialChar({e})
                            }}
                          />
                          <input
                            type="number"
                            className="form-control bg-transparent inline-edit-field originalCustomMix hideOriginalMix text-end"
                            defaultValue={total_outlet}
                            onKeyDown={handleKeyDownPossitiveInt}
                            onFocus={(e) => {
                              setPrevValue(e.target.value);
                              onFocusEmptyValue(e);
                            }}
                            onBlur={async (e) => {
                              hideOriginalField(e);
                              // Trim leading zeros
                              let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                              e.target.value = newValue;
                              if (prevValue !== newValue) {
                                if (newValue == 0) {
                                  toast.error(<div>{`${sub.sub_category_name}: Total Outlets should be greater than 0`}</div>);
                                }
                                else {
                                  if (gallon_val == 0) {
                                    toast.error(<div>{`${sub.sub_category_name}: ${VolumnType} should be greater than 0`}</div>);
                                  } else {
                                    await dispatch(subCategoryDataUpdate({ subCatId: sub.sub_category_id, data: allProductJson }));
                                    toast.success(<div>{`Updated Total Outlet and ${VolumnType} for ${sub.sub_category_name}`}</div>);
                                  }
                                }
                              }
                              setPrevValue(newValue); // Update the stored previous value
                            }}
                            name={`total_outlets_${sub.sub_category_id}`}
                            onChange={(e) => {
                              // Trim leading zeros
                              let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                              e.target.value = newValue;
                              dispatch(
                                subCategoryDataChange({
                                  sub_category_id: sub.sub_category_id,
                                  objectKey: "sub_categories",
                                  value: e.target.value,
                                  updateKey: "total_outlets",
                                })
                              );
                            }}
                            data-tooltip-id="inp-tooltip"
                            data-tooltip-content={USNumberFormat(total_outlet_val)}
                            onPaste={(e) => {
                                handlePasteRemoveSpecialChar({e})
                            }}
                          />
                        </td>

                        <td className="text-center custommixvalues_td pad-r-2" >
                          <input
                            type="text"
                            className="form-control bg-transparent inline-edit-field virtualCustomMix showVirtualMix text-end"
                            value={USNumberFormat(virtual_gallon_val)}
                            onKeyDown={handleKeyDownPossitiveInt}
                            onFocus={(e) => {
                              showOriginalField(e);
                            }}
                            id={`vir_total_gallon_${sub.sub_category_id}`}
                            readOnly={true}
                            data-tooltip-id="inp-tooltip"
                            data-tooltip-content={USNumberFormat(total_gallons)}
                            onPaste={(e) => {
                                handlePasteRemoveSpecialChar({e})
                            }}
                          />
                          <input
                            type="number"
                            className="form-control bg-transparent inline-edit-field originalCustomMix hideOriginalMix text-end"
                            defaultValue={total_gallons}
                            onKeyDown={handleKeyDownPossitiveInt}
                            onFocus={(e) => {
                              setPrevValue(e.target.value);
                              onFocusEmptyValue(e);
                            }}
                            onBlur={async (e) => {
                              hideOriginalField(e);
                              // Trim leading zeros
                              let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                              e.target.value = newValue;
                              if (prevValue !== newValue) {
                                if (newValue == 0) {
                                  toast.error(<div>{`${sub.sub_category_name}: ${VolumnType}  should be greater than 0`}</div>);
                                }
                                else {
                                  if (total_outlet_val == 0) {
                                    toast.error(<div>{`${sub.sub_category_name}: Total Outlets should be greater than 0`}</div>);
                                  } else {
                                    await dispatch(subCategoryDataUpdate({ subCatId: sub.sub_category_id, data: allProductJson }));
                                    toast.success(<div>{`Updated Total Outlet and ${VolumnType} for ${sub.sub_category_name}`}</div>);
                                  }
                                }
                              }
                              setPrevValue(newValue); // Update the stored previous value
                            }}
                            name={`total_gallons_${sub.sub_category_id}`}
                            onChange={(e) => {
                              // Trim leading zeros
                              let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                              e.target.value = newValue;
                              dispatch(
                                subCategoryDataChange({
                                  sub_category_id: sub.sub_category_id,
                                  objectKey: "sub_categories",
                                  value: e.target.value,
                                  updateKey: "volumes",
                                })
                              );
                            }}
                            data-tooltip-id="inp-tooltip"
                            data-tooltip-content={USNumberFormat(total_gallons)}
                            onPaste={(e) => {
                                handlePasteRemoveSpecialChar({e})
                            }}
                          />
                        </td>
                        <td className="text-center custommixvalues_td pad-r-2" >
                          {sub.allied_gallons ? (
                            <>
                              <input
                                type="text"
                                className="form-control bg-transparent inline-edit-field virtualCustomMix showVirtualMix text-end"
                                value={USNumberFormat(virtual_allied_gallon_val)}
                                onKeyDown={handleKeyDownPossitiveInt}
                                onFocus={(e) => {
                                  showOriginalField(e);
                                }}
                                id={`vir_allied_gallon_${sub.sub_category_id}`}
                                readOnly={true}
                                data-tooltip-id="inp-tooltip"
                                data-tooltip-content={USNumberFormat(total_allied_gallons)}
                                onPaste={(e) => {
                                    handlePasteRemoveSpecialChar({e})
                                }}
                              />
                              <input
                                type="number"
                                className="form-control bg-transparent inline-edit-field originalCustomMix hideOriginalMix text-end"
                                defaultValue={total_allied_gallons}
                                onKeyDown={handleKeyDownPossitiveInt}
                                onFocus={(e) => {
                                  setPrevValue(e.target.value);
                                  onFocusEmptyValue(e);
                                }}
                                onBlur={async (e) => {
                                  hideOriginalField(e);
                                  // Trim leading zeros
                                  let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                  e.target.value = newValue;
                                  if (prevValue !== newValue) {

                                    if (gallon_val == 0) {
                                      toast.error(<div>{`${sub.sub_category_name}: ${VolumnType} should be greater than 0`}</div>);
                                    } else if (total_outlet_val == 0) {
                                      toast.error(<div>{`${sub.sub_category_name}: Total Outlets should be greater than 0`}</div>);
                                    }
                                    else {
                                      await dispatch(subCategoryDataUpdate({ subCatId: sub.sub_category_id, data: allProductJson }));
                                      toast.success(<div>{`Updated Allied Gallons for ${sub.sub_category_name}`}</div>);
                                    }
                                  }

                                  setPrevValue(newValue);
                                }}
                                name={`total_allied_gallons_${sub.sub_category_id}`}
                                onChange={(e) => {
                                  // Trim leading zeros
                                  let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                  e.target.value = newValue;
                                  dispatch(
                                    subCategoryDataChange({
                                      sub_category_id: sub.sub_category_id,
                                      objectKey: "sub_categories",
                                      value: e.target.value,
                                      updateKey: "total_pbc_allied_volumes",
                                    })
                                  );
                                }}
                                data-tooltip-id="inp-tooltip"
                                data-tooltip-content={USNumberFormat(total_allied_gallons)}
                                onPaste={(e) => {
                                    handlePasteRemoveSpecialChar({e})
                                }}
                              />
                            </>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="text-center pad-r-2" >
                          <input
                            className="form-control vpo_highlighter bg-transparent inline-edit-field border-bottom-0 text-end"
                            value={vpo}
                            id={`vpo-${sub.sub_category_id}`}
                            data-tooltip-id="inp-tooltip"
                            data-tooltip-content={USNumberFormat(vpo_tooltip)}
                          />
                        </td>
                        <td>
                          {sub.national_mix && accordionState[sub.sub_category_id] ? (
                            <div className="table_radio">
                              <div className="d-flex" id="radio_tabs" role="tablist">
                                <div role="presentation">
                                  <div
                                    className="form-check radio_2 active"
                                    id="nhome1-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#nhome1-tab-pane"
                                    type="button"
                                    role="tab"
                                    aria-controls="nhome1-tab-pane"
                                    aria-selected="true"
                                  >
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
                                <div role="presentation">
                                  <div
                                    className="form-check radio_2 ml_20"
                                    id="nprofile2-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#nprofile2-tab-pane"
                                    type="button"
                                    role="tab"
                                    aria-controls="nprofile2-tab-pane"
                                    aria-selected="false"
                                  >
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
                            </div>
                          ) : (
                            ""
                          )}
                        </td>
                        <td>
                          <Link
                            className="custom_badge_button mixButton d-inline-block mix-btn py-0 fs_11"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleAccordion(sub.sub_category_id);
                              dispatch(
                                sumCustomMix({
                                  sub_category_id: sub.sub_category_id,
                                })
                              );

                                if(!accordionState[sub.sub_category_id]){
                                let element = e.target.closest('tr');
                                setTimeout(() => {
                                  scrollRowIntoView(element, 100); // 100px from top
                                }, 100);
                              }
                            }}
                          >
                            MIX
                          </Link>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center process_icon w-100">
                            {sub.sub_category_deal_status ? (
                              <p className="fw_600 mb-0 electric_blue-40 text-center w-100">
                                <img src={completed_check} className="mr_10" />
                                Completed
                              </p>
                            ) : (
                              <p className="fw_600 mb-0 text-center w-100">
                                <img src={processing_time_tabs_icons} className="mr_10" alt="icon" />
                                In Process
                              </p>
                            )}
                            {
                              isEditable &&
                              <>
                                {sub?.national_mix != 1 ?
                                  <Link
                                    className={`ms-auto`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDelete(sub.sub_category_id, sub.sub_category_name);
                                    }}
                                  >
                                    <img src={delete_icon} alt="delete" />
                                  </Link>
                                  : (
                                    <Link
                                      className={`ms-auto zero_opacity`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete(sub.sub_category_id, sub.sub_category_name);
                                      }}
                                    >
                                      <img src={delete_icon} alt="delete" />
                                    </Link>
                                  )
                                }
                              </>
                            }
                          </div>
                        </td>
                      </tr>
                      <tr className={` ${accordionState[sub.sub_category_id] ? "table_mix_open" : "d-none"}`}>
                        <td colSpan="2" className="bg-white border-bottom-0"></td>
                        <td colSpan="6" className="bg-white border-bottom-0">
                          <div className="tab-content" id="radio_tabs">
                            <div className="w-100 mt_10 tab-pane fade show active" id="nhome1-tab-pane" role="tabpanel" aria-labelledby="nhome1-tab" tabIndex="0">
                              <div className="d-flex">
                                <div className="col-md-11">
                                  <div className="table-responsive custom_table_1 tfoot_add ftn_prod_table">
                                    {sub.sub_category_id === -1 ? (
                                      <table className="table">
                                        <thead>
                                          <tr>
                                            <th scope="col" className="bg_globe_blue-10" width="240px"></th>
                                            <th scope="col" width="150px" className="text-center">
                                              Gallons
                                            </th>
                                            <th scope="col" width="150px" className="text-center">
                                              Outlets
                                            </th>
                                            <th scope="col" width="200px" className="text-center"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {sortedProducts(sub.products)?.map((products, productIndex) => (
                                            <tr key={productIndex} className={selectedProduct?.[sub.sub_category_id]?.includes(products.product_id) ? "" : "d-none"}>
                                              <td className="bg_globe_blue-10">
                                                <div className="d-flex text-white">{products.product_name}</div>
                                              </td>
                                              <td className="text-center">
                                                <input
                                                  type="number"
                                                  className="form-control bg-transparent border-start-0 border-end-0 border-top-0 text-end"
                                                  defaultValue={products.gallon || 0}
                                                  name={`product-gallon-${products.product_id}`}
                                                  min={0}
                                                  onKeyDown={handleKeyDownPossitiveInt}
                                                  onFocus={(e) => {
                                                    setPrevValue(e.target.value);
                                                    onFocusEmptyValue(e);
                                                  }}
                                                  onBlur={(e) => {
                                                    // Trim leading zeros
                                                    let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                                    e.target.value = newValue || 0;
                                                    handleProductGallons(products.product_id, sub.sub_category_id, newValue, "sub_categories", "gallons");
                                                  }}
                                                  onChange={(e) => {
                                                    // Trim leading zeros
                                                    let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                                    e.target.value = newValue;
                                                    handleProductGallons(products.product_id, sub.sub_category_id, newValue, "sub_categories", "gallons");
                                                  }}
                                                  data-tooltip-id="inp-tooltip"
                                                  data-tooltip-content={USNumberFormat(products?.gallon || 0, -1)}
                                                  title=""
                                                />
                                              </td>
                                              <td className="text-center">
                                                <input
                                                  type="number"
                                                  className="form-control bg-transparent border-start-0 border-end-0 border-top-0 text-end"
                                                  defaultValue={products.total_outlets || 0}
                                                  name={`product-outlets-${products.product_id}`}
                                                  min={0}
                                                  onKeyDown={handleKeyDownPossitiveInt}
                                                  onFocus={(e) => {
                                                    setPrevValue(e.target.value);
                                                    onFocusEmptyValue(e);
                                                  }}
                                                  onBlur={(e) => {
                                                    // Trim leading zeros
                                                    let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                                    e.target.value = newValue || 0;
                                                    handleProductGallons(products.product_id, sub.sub_category_id, newValue, "sub_categories", "outlets");
                                                  }}
                                                  onChange={(e) => {
                                                    // Trim leading zeros
                                                    let newValue = e.target.value.replace(/^0+(\d)/, "$1");
                                                    e.target.value = newValue;
                                                    handleProductGallons(products.product_id, sub.sub_category_id, newValue, "sub_categories", "outlets");
                                                  }}
                                                  data-tooltip-id="inp-tooltip"
                                                  data-tooltip-content={USNumberFormat(products.total_outlets || 0, -1)}
                                                  title=""
                                                />
                                              </td>
                                              <td>
                                                <div className="d-flex justify-content-start align-items-center process_icon">
                                                  {isEditable && (
                                                    <Link
                                                      className={`ms-auto`}
                                                      onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(sub.sub_category_id, products.product_name, "product", products, "sub_categories");
                                                      }}
                                                    >
                                                      <img src={delete_icon} alt="delete" />
                                                    </Link>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    ) : (
                                      <table className="table">
                                        <thead>
                                          <tr>
                                            <th scope="col" className="bg_globe_blue-10" width="240px"></th>
                                            {sub.national_mix ? (
                                              <th scope="col" width="150px" className="text-center">
                                                <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                  <span>Nat'l Avg.</span>
                                                  <span className="bottling_territory_th_perc">{" %"}</span>
                                                </div>
                                              </th>
                                            ) : (
                                              ""
                                            )}
                                            <th scope="col" width="150px" className="text-center">
                                              <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                <span>Custom Mix</span>
                                                <span className="bottling_territory_th_perc">{" %"}</span>
                                              </div>
                                            </th>
                                            {sub.mix_details.map((mix) => (
                                              <th width="150px" className="text-center" scope="col" key={`subcategory_bib_title${sub.sub_category_id}_${mix.mix_id}`}>
                                                <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                  <span>{mix.mix_name}</span>
                                                  <span className="bottling_territory_th_perc">{" %"}</span>
                                                </div>
                                              </th>
                                            ))}
                                            <th scope="col" width="200px" className="text-center"></th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {sortedProducts(sub?.products)?.map((products, productIndex) => {
                                            const field = `custom_mix_${products.product_id}`;
                                            const virutal_field = `virutal_custom_mix_${products.product_id}`;
                                            const CustomVal = parseFloat(products?.custom_mix);
                                            const virtual_value = !isNaN(CustomVal) ? CustomVal.toFixed(1) : Number(0).toFixed(1);
                                            const value = !isNaN(CustomVal) ? CustomVal : "";
                                            const national_value = !isNaN(parseFloat(products?.national_mix || 0)) ? Number(products.national_mix).toFixed(1) : Number(0).toFixed(1);
                                            let nationalToolValue = tooltipCleaner(products?.national_mix)
                                            let customValToolValue = tooltipCleaner(products?.custom_mix);
                                            return (
                                              <tr
                                                key={`product-row-${sub.sub_category_id}-${products.product_id}`}
                                                className={selectedProduct?.[sub.sub_category_id]?.includes(products.product_id) ? "" : "d-none"}
                                              >
                                                <td className="bg_globe_blue-10">
                                                  <div className="d-flex text-white">{products.product_name}</div>
                                                </td>
                                                {sub.national_mix ? (
                                                  <td className={`text-center ${sub.active_mix !=2? 'bg_light_grey': "" }`}>
                                                    <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                      <input
                                                        type="text"
                                                        className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end`}
                                                        value={Number(national_value).toFixed(1)}
                                                        name={`national-avg-${sub.sub_category_id}-${products.product_id}`}
                                                        data-tooltip-id="inp-tooltip"
                                                        data-tooltip-content={USNumberFormat(nationalToolValue, -1)}
                                                        title=""
                                                        onPaste={(e) => {
                                                          handlePasteRemoveSpecialChar({e, allowDecimal: true})
                                                        }}
                                                      />
                                                    </div>
                                                  </td>
                                                ) : (
                                                  ""
                                                )}
                                                {sub.national_mix === 1 && sub.active_mix !== 2 ? (
                                                  <td className="text-center custommixvalues_td">
                                                    <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                      <input
                                                        type="number"
                                                        className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end`}
                                                        value={virtual_value}
                                                        name={`custom-val--${sub.sub_category_id}-${products.product_id}`}
                                                        title=""
                                                        onPaste={(e) => {
                                                          handlePasteRemoveSpecialChar({e, allowDecimal: true})
                                                        }}
                                                      />
                                                    </div>
                                                  </td>
                                                ) : (
                                                  <td className="text-center custommixvalues_td bg_light_grey">
                                                    <input
                                                      type="number"
                                                      className={`form-control inline-edit-field virtualCustomMix showVirtualMix text-end`}
                                                      id={virutal_field}
                                                      name={virutal_field}
                                                      value={virtual_value}
                                                      onKeyDown={handleKeyDownPercentage}
                                                      onFocus={(e) => {
                                                        showOriginalField(e);
                                                      }}
                                                      min={0}
                                                      max={100}
                                                      step={0.1}
                                                      readOnly={true}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={USNumberFormat(customValToolValue, -1)}
                                                      title=""
                                                      onPaste={(e) => {
                                                        handlePasteRemoveSpecialChar({e, allowDecimal: true})
                                                      }}
                                                    />
                                                    <input
                                                      type="number"
                                                      className={`form-control inline-edit-field originalCustomMix hideOriginalMix text-end`}
                                                      id={field}
                                                      name={field}
                                                      value={value != 0 ? value : ""}
                                                      defaultValue={value != 0 ? value : ""}
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
                                                      }}
                                                      onFocus={(e) => {
                                                        setPrevValue(e.target.value);
                                                        onFocusEmptyValue(e);
                                                      }}
                                                      onBlur={(e) => {
                                                        hideOriginalField(e);
                                                      }}
                                                      onChange={(e) => {
                                                        let newValue = e.target.value
                                                        if (newValue.startsWith('.')) {
                                                          newValue = '0' + newValue;
                                                        }
                                                        let [value, isValid] = handlePercentageField(newValue)
                                                        if (isValid) {
                                                          handleCustomMixChange(products.product_id, sub.sub_category_id, newValue, "sub_categories");
                                                        } else {
                                                          e.target.value = value
                                                        }
                                                      }}
                                                      min={0}
                                                      max={100}
                                                      step={0.1}
                                                      data-tooltip-id="inp-tooltip"
                                                      data-tooltip-content={USNumberFormat(customValToolValue, -1)}
                                                      title=""
                                                      onPaste={(e) => {
                                                        handlePasteRemoveSpecialChar({e, allowDecimal: true})
                                                      }}
                                                    />
                                                  </td>
                                                )}
                                                {sub?.mix_details?.map((mix) => {
                                                  const mixValues = products?.bib_mixes?.filter((m) => m.mix_id === mix.mix_id);
                                                  const BIB_disabled = checkBiBDisable(sub, products);
                                                  const field = `product-bib-mix-${products.product_id}-${mix.mix_id}`;
                                                  const virutal_field = `virutal_product-bib-mix-${products.product_id}-${mix.mix_id}`;
                                                  const CustomVal = parseFloat(mixValues?.[0]?.value);
                                                  let bibToolVal = tooltipCleaner(mixValues?.[0]?.value);
                                                  const virtual_value = !isNaN(CustomVal) ? CustomVal.toFixed(1) : Number(0).toFixed(1);
                                                  const value = !isNaN(CustomVal) ? CustomVal : "";
                                                  return (
                                                    <td className="text-center custommixvalues_td" key={`product-bib-${sub.sub_category_id}-${products.product_id}-${mix.mix_id}`}>
                                                      <input
                                                        type="number"
                                                        className={`form-control inline-edit-field virtualCustomMix showVirtualMix text-end`}
                                                        id={virutal_field}
                                                        name={virutal_field}
                                                        value={virtual_value}
                                                        onKeyDown={handleKeyDownPercentage}
                                                        onFocus={(e) => {
                                                          showOriginalField(e);
                                                        }}
                                                        min={0}
                                                        max={100}
                                                        step={0.1}
                                                        readOnly={true}
                                                        data-tooltip-id="inp-tooltip"
                                                        data-tooltip-content={USNumberFormat(bibToolVal, -1)}
                                                        title=""
                                                        onPaste={(e) => {
                                                          handlePasteRemoveSpecialChar({e, allowDecimal: true})
                                                        }}
                                                      />
                                                      <input
                                                        type="number"
                                                        className={`form-control inline-edit-field originalCustomMix hideOriginalMix text-end`}
                                                        id={field}
                                                        name={field}
                                                        value={value != 0 ? value : ""}
                                                        defaultValue={value != 0 ? value : ""}
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
                                                        }}
                                                        onFocus={(e) => {
                                                          setPrevValue(e.target.value);
                                                          onFocusEmptyValue(e);
                                                        }}
                                                        onBlur={(e) => {
                                                          hideOriginalField(e);
                                                        }}
                                                        onChange={(e) => {
                                                          let newValue = e.target.value;
                                                          if (newValue.startsWith('.')) {
                                                            newValue = '0' + newValue;
                                                          }
                                                          let [value, isValid] = handlePercentageField(newValue)
                                                          if (isValid) {
                                                            handleUpdateMixValue(products.product_id, sub.sub_category_id, mix.mix_id, newValue, "sub_categories");
                                                          } else {
                                                            e.target.value = value
                                                          }
                                                        }}
                                                        min={0}
                                                        max={100}
                                                        step={0.1}
                                                        data-tooltip-id="inp-tooltip"
                                                        data-tooltip-content={USNumberFormat(bibToolVal, -1)}
                                                        title=""
                                                        onPaste={(e) => {
                                                          handlePasteRemoveSpecialChar({e, allowDecimal: true})
                                                        }}
                                                      />
                                                    </td>
                                                  );
                                                })}
                                                <td>
                                                  {sub.national_mix != null && sub.national_mix != 1 ? (
                                                    <div className="d-flex justify-content-center align-items-center process_icon">
                                                      {isEditable ? (
                                                        <Link
                                                          className={`ms-auto${!isEditable ? ' disabled-link' : ''}`}
                                                          style={!isEditable ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                                                          onClick={(e) => {
                                                            e.preventDefault();
                                                            handleDelete(sub.sub_category_id, products.product_name, "product", products, "sub_categories");
                                                          }}
                                                          disabled={!isEditable || isView}
                                                        >
                                                          <img src={delete_icon} alt="delete" />
                                                        </Link>
                                                      ) : (
                                                        ""
                                                      )}
                                                    </div>
                                                  ) : null}
                                                </td>
                                              </tr>
                                            );
                                          })}
                                          {!selectedProduct?.[sub.sub_category_id] && (
                                            <tr
                                            >
                                              <td className="bg_globe_blue-10">
                                              </td>
                                              <td colSpan={sub.mix_details.length + 2} className="text-center">
                                                No products available
                                              </td>
                                            </tr>
                                          )}
                                          <tr className="bottling_footter">
                                            <td className="bg_globe_blue-10 text-white pb_10">
                                              <b className="fs_16">Total</b>
                                            </td>
                                            {sub.national_mix ? (
                                              <td className={`bg-white text-center`}>
                                                <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                  {(() => {
                                                    const national_mix_percentage = NationaMixTotal(sub) || 0;
                                                    const national_mix_total = USNumberFormat(national_mix_percentage, 1, 1);
                                                    return (
                                                      <input
                                                        type="text"
                                                        className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end ${national_mix_total != 100 ? "text-danger" : ""}`}
                                                        value={national_mix_total}
                                                        name={`national-avg-total-${sub.sub_category_id}`}
                                                        data-tooltip-id="inp-tooltip"
                                                        data-tooltip-content={NationaMixTotal(sub, true)}
                                                        title=""
                                                        disabled={true}
                                                      />
                                                    );
                                                  })()}
                                                </div>
                                              </td>
                                            ) : (
                                              ""
                                            )}
                                            <td className="bg-white text-center pb_10 text-end">
                                              <div className="position-relative d-flex justify-content-center align-items-center custommixvalues_td">
                                                {(() => {
                                                  const total_mix_percentage = customMixSum?.[sub.sub_category_id] || 0;
                                                  const tooltip_total = USNumberFormat(total_mix_percentage, -1);
                                                  const v_total = USNumberFormat(total_mix_percentage, 1, 1);

                                                  return <input
                                                    type="text"
                                                  className={`form-control inline-edit-field virtualCustomMix showVirtualMix border-bottom-0 text-end ${
                                                      ((sub.national_mix === 1 && sub.active_mix === 2) || sub.national_mix !== 1) && v_total != 100 ? "text-danger" : ""
                                                      }`}
                                                    value={v_total}
                                                    name={`custom-mix-avg-total-${sub.sub_category_id}`}
                                                    title=""
                                                    data-tooltip-id="inp-tooltip"
                                                    data-tooltip-content={USNumberFormat(tooltip_total, -1)}
                                                    disabled={true}
                                                  />
                                                })()}
                                              </div>
                                            </td>
                                            <td className="bg-white pb_10" colSpan={sub?.mix_details?.length + 1}></td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                  {isEditable && (
                                    <div className="text-end mt_10 mb_10">
                                      <Link
                                        className={` btn_outline_primary text-decoration-none py_8 fs_12 px_40 me-2 ${checkaddProductsData.length> 0? '' : 'd-none'} 
                                        ${!isEditable ? 'disabled-link' : ''}`}
                                        onClick={e => {
                                          e.preventDefault();
                                          if (!isEditable) {
                                            return;
                                          }
                                          handleAddProduct(sub.sub_category_id);
                                        }}
                                      >+ Add</Link>
                                      <Link
                                        className=" btn_outline_primary text-decoration-none py_8 fs_12 px_40 me-2"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          toggleAccordion(sub.sub_category_id);
                                          dispatch(
                                            sumCustomMix({
                                              sub_category_id: sub.sub_category_id,
                                            })
                                          );
                                        }}
                                      >
                                        Cancel
                                      </Link>
                                      {isEditable && (
                                        <button
                                          className={`btn_primary text-decoration-none text-white py_8 fs_12 px_40 ${sub.sub_category_deal_status ? "disabled" : "disabled"}`}
                                          onClick={() => {
                                            handleSubcategorySave(sub.sub_category_id)
                                          }}
                                        >
                                          Save
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="col-md-1 text-end">
                                  <Link
                                    className="close_link ms-auto"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleAccordion(sub.sub_category_id);
                                      dispatch(
                                        sumCustomMix({
                                          sub_category_id: sub.sub_category_id,
                                        })
                                      );
                                    }}
                                  >
                                    Close <img src={close_icon} className="ml_6" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                }
              })}

              {hasSpeciality && (
                <tr>
                  <td colSpan={"6" } style={{backgroundColor: "#0e0e96", color: "#fff"}}>
                    <div className="d-flex"
                    >
                      <span className={`text-white`}>Speciality/Partner</span>
                    </div>
                  </td>
                  <td colSpan={"2"} height={45} style={{backgroundColor: "#0e0e96", color: "#fff"}} >
                    {isEditable && (
                      <a
                        className={`custom_badge_button mixButton d-inline-block mix-btn cursor_pointer py-0 ${selectedProduct[-1]?.length != specialityProducts.length ? '' : 'd-none'} ${!isEditable ? 'disabled-link' : ''}`}
                        onClick={(e) => { handleAddProduct(-1); }}
                      >
                        + ADD
                      </a>
                    )}
                  </td>
                </tr>

              )}

              {allProductJson?.sub_categories?.map((sub, index) => {
                if (sub.sub_category_id == -1 && subCategoryIds.includes(sub.sub_category_id)) {
                  return (
                    <React.Fragment key={`key${sub.sub_category_id}_${index}`}>
                      {sub.products?.map((product, product_index) => (
                        <FountainSpecialtyProductRow
                          key={`key${sub.sub_category_id}_${index}_${product_index}`}
                          product={product}
                          sub={sub}
                          selectedProduct={selectedProduct}
                          allProductJson={allProductJson}
                          accordionState={accordionState}
                          toggleAccordion={toggleAccordion}
                          handleSubcategorySave={handleSubcategorySave}
                          handleDelete={handleDelete}
                          isEditable={isEditable}
                          isView={isView}
                          inputRefs={inputRefs}
                          setPrevValue={setPrevValue}
                          showOriginalField={showOriginalField}
                          hideOriginalField={hideOriginalField}
                          onFocusEmptyValue={onFocusEmptyValue}
                          handleKeyDownPossitiveInt={handleKeyDownPossitiveInt}
                          handleKeyDownPercentage={handleKeyDownPercentage}
                          handleKeyDownLimit={handleKeyDownLimit}
                          handlePercentageField={handlePercentageField}
                          handlePasteRemoveSpecialChar={handlePasteRemoveSpecialChar}
                          tooltipCleaner={tooltipCleaner}
                          USNumberFormat={USNumberFormat}
                          evalMathematicalExpression={evalMathematicalExpression}
                          scrollRowIntoView={scrollRowIntoView}
                        />
                      ))}
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </section>
      <div className={`${showModel ? "" : "d-none"} modal fade show add-product-modal`} style={{ display: "block" }} tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg add_product_modal">
          <div className="modal-content" ref={modelRef}>
            <div className="modal-body px_30 py_30">
              <div className="headding_modal d-flex">
                <h1 className="fs_18 pepsi_fonts fw_700 mb_12">Add Product</h1>
                <button type="button" className="btn-close ms-auto" data-bs-dismiss="modal" aria-label="Close" onClick={() => setShowModel(false)}></button>
              </div>
              <div className="row flex-wrap p-3">
                {Array.isArray(addProductsData) && addProductsData?.length > 0 ? (
                  addProductsData.map((product, product_index) => {
                    return (
                      <div key={product_index} className="col-sm-6 form-check checkboxes mb_8">
                        <input
                          className="form-check-input float-none me-2"
                          type="checkbox"
                          value={product.product_id}
                          id={`checkbox-${product.product_id}`}
                          onChange={() => {
                            handleCheckboxChange(product.subCatId, product, "sub_categories");
                          }}
                          checked={tempSelectedProduct?.[product.subCatId]?.includes(product.product_id)} // Keep checkbox checked if product is selected
                        />
                        <label className="form-check-label" htmlFor={`checkbox-${product.product_id}`}>
                          {product.product_name}
                        </label>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted">No products available</p>
                )}
              </div>

              <div className="footer_modal d-flex justify-content-center align-items-center mt_34">
                <div className="col-3 pr_10">
                  <button className="btn btn_outline_primary d-block w-100" onClick={() => setShowModel(false)}>
                    Cancel
                  </button>
                </div>
                <div className="col-3 pl_10">
                  {isEditable && (
                    <span
                      className={`btn btn_outline_primary text-decoration-none py_12 px_40 me-2`}
                      onClick={e => { updateNewProducts(); }}
                    >+ Add</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {props?.deal_id ? <RightPanel show={showRightPanel} closePanel={closePanel} deal_id={props?.deal_id} currentStep={props?.currentStep} navigateNext={navigateNext} category={1} /> : null}

      <Link
        className="chat_button text-center cursor_pointer"
        onClick={() => {
          setNotesModal(true);
        }}
      >
        <img src={QAIcon} />
        <p className="fs_14 fw_700 text-white"></p>
      </Link>
      {notesModal && (
        <NotesPanel
          customRef={notesPanelRef}
          deal={{deal_id: props?.deal_id, deal_created_by: -1}}
          handleBack={() => setNotesModal(false)}
        />
      )}
    </>
  );
});

export default FountainProducts;

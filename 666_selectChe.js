import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  updateSelectedProduct,
  removeSelectedProduct,
  fetchProductDataAPI,
  postDealProducts,
  postDealProductMixes,
  fetchSelectedDealProduct,
  updateProductCustomMix,
  fetchSubCategoriesAPI,
  FetchBnCDealData,
} from "../../features/deal/dealSlice";
import { useLocation, useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useNavigate } from "react-router-dom";
import CategoryToggle from "./CategoryToggle";
import starIcon from "../../assets/images/star_heighlited.png";
import IMhg from "../../assets/images/innovation_mix_hg.svg";
import { Tooltip } from "react-tooltip";
import SearchFilterBox from './SearchFilterBox';
import { Spinner } from "react-bootstrap";

function extractSubcategoriesWithProducts(data) {
  if (data) {
    return data.map((subCategory) => ({
      sub_category_id: subCategory.sub_category_id,
      sub_category_name: subCategory.sub_category_name,
      national_mix: subCategory.national_mix,
      innovation_mix: subCategory?.innovation_mix,
      products: subCategory.products.map((product) => ({
        product_id: product.product_id,
        product_name: product.product_name,
      })),
    }));
  }
}

const ProductSection = ({ category, national_mix, items, is_view }) => {
  const dispatch = useDispatch();
  const { category_id } = useParams();
  const { selectedProduct, currentStep } = useSelector((state) => state.deal);
  const checkboxesRef = useRef({}); // Store references to checkboxes
  const selectAllRef = useRef({});

  const handleCheckboxChange = (sub_category_id, product, objectKey, selectAll = false, selectallOption = null) => {
    // Prevent changes if view mode or amendment products disabled
    if (is_view) {
      return;
    }

    let flag = true
    if(!isNaN(currentStep) && currentStep == 4 && category_id == 1){
      flag = false
    }

    if (selectAll === "selectAll") {
      if (selectallOption) {
        flag = false
        dispatch(updateSelectedProduct({ sub_category_id, product, changeMixFlag: flag }));
      } else {
        dispatch(removeSelectedProduct({ sub_category_id, product, objectKey: objectKey, changeMixFlag: flag }));
        dispatch(updateProductCustomMix({ product_id: product.product_id, sub_category_id, value: "", objectKey, changeMixFlag: flag }));
      }
    } else {
      const isProductSelected = selectedProduct?.[sub_category_id] ? selectedProduct[sub_category_id].some((data) => data == product.product_id) : false;
      if (isProductSelected) {
        dispatch(removeSelectedProduct({ sub_category_id, product, objectKey: objectKey, changeMixFlag: flag }));
        dispatch(updateProductCustomMix({ product_id: product.product_id, sub_category_id, value: "", objectKey, changeMixFlag: flag }));
      } else {
        dispatch(updateSelectedProduct({ sub_category_id, product, changeMixFlag: flag }));
      }
    }
  };

  // Automatically select checkboxes when national_mix === 1
  useEffect(() => {
    if (national_mix === 1) {
      items.forEach((item) => {
        if (!selectedProduct?.[category?.sub_category_id]?.includes(item.product_id)) {
          dispatch(updateSelectedProduct({ sub_category_id: category?.sub_category_id, product: item }));
        }
      });
    }
  }, [national_mix, items, category?.sub_category_id, dispatch, selectedProduct]);

  let innovation_mix_tool_tip = {}
  if(category?.innovation_mix){
    innovation_mix_tool_tip = {"data-tooltip-id": "inp-tooltip", "data-tooltip-content": "Innovation Mix"}
  }

  const selectAllProducts = (e) => {
    // Prevent changes if view mode or amendment products disabled
    if (is_view) {
      e.preventDefault();
      return;
    }
    const products = category?.products;
    if (!products?.length) return true;
    products.map((item) => {
      if (!checkboxesRef.current[item.product_id].checked || (checkboxesRef.current[item.product_id].checked && !e.target.checked)) {
        checkboxesRef.current[item.product_id].checked = e.target.checked;
        if (national_mix !== 1) {
          handleCheckboxChange(category?.sub_category_id, item, "sub_categories", "selectAll", e.target.checked);
        }
      }
    })
  }

  useEffect(() => {
    if (selectedProduct?.[category?.sub_category_id] === undefined) {
      return;
    }
    selectAllRef.current[category?.sub_category_id].checked = (selectedProduct?.[category?.sub_category_id]?.length >= category?.products?.length);
  }, [selectedProduct?.[category?.sub_category_id]])


  return (

    <div className="col-md-4 px-1"
    {...innovation_mix_tool_tip}
    >
      <div className="broder_box mt-2 highlighted">
        <div className="d-flex align-items-center position-relative zindex_1">
          <h5 className="fs_20 fw_400 black-40 pl_10">{category?.sub_category_name}</h5>
          {category?.innovation_mix ? (
            <div className="star ml_14 position-relative">
              <img src={starIcon} className="zindex_1 position-relative" />
              <div className="hover_badge">
                <img src={IMhg} />
                <p className="innovation_product_text">Innovation Product</p>
              </div>
            </div>
          ) : null}
        </div>
        <div className="pl_10 mb_10 position-relative zindex_1">
          {items?.length ? (
            <div className="form-check checkboxes w-100 mb_4" key={`all-product-${category?.sub_category_id}`}>
              <input
                ref={(el) => (selectAllRef.current[category?.sub_category_id] = el)}
                className="form-check-input"
                type="checkbox"
                value="1"
                id={`checkbox-${category?.sub_category_id}-all`}
                onChange={(e) => selectAllProducts(e)}
                disabled={national_mix === 1 || is_view}
              />
              <label className="form-check-label" htmlFor={`checkbox-${category?.sub_category_id}-all`}>
                <b>Select All</b>
              </label>
            </div>
          ) : null}
        </div>

        <div className="scrool_box position-relative zindex_1">
          {items.map((item, index) => (
            <div className="form-check checkboxes w-100 mb_4" key={`product-${index}`}>
              <input
                ref={(el) => (checkboxesRef.current[item.product_id] = el)} // Store reference
                className="form-check-input"
                type="checkbox"
                value={item}
                id={`checkbox-${category?.sub_category_id}-${item.product_id}`}
                onChange={(e) => {
                  if (is_view) {
                    e.preventDefault(); // Prevent changes if view mode or amendment products disabled
                    return;
                  }
                  if (national_mix !== 1) {
                    handleCheckboxChange(category?.sub_category_id, item, "sub_categories");
                  } else {
                    e.preventDefault(); // Prevents the checkbox from changing state
                  }
                }}
                checked={selectedProduct?.[category?.sub_category_id]?.includes(item.product_id) || national_mix === 1}
                disabled={national_mix === 1 || is_view}
              />
              <label className="form-check-label" htmlFor={`checkbox-${category?.sub_category_id}-${item.product_id}`}>
                {item.product_name}
              </label>
            </div>
          ))}
        </div>
        {category?.innovation_mix ? <div className="bg_patern"></div> : null}
      </div>
    </div>
  );
};

const SelectProductCheckbox = (props) => {
  const dispatch = useDispatch();
  const { id, deal_id, category_id } = useParams();
  const [isSaving, setIsSaving] = useState(false)

  // const [equipmentProvided, setEquipmentProvided] = useState("Yes");
  const navigate = useNavigate();
  const [sub_category_data, setSubCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [allSelected, setAllSelected] = useState(null);
  const { allProductJson, subCategoryIds, selectedProduct, selectedProductAPI } = useSelector((state) => state.deal);
  const { amendment_questions } = useSelector((state) => state.fountainDeal);

  const [showNext, setShowNext] = useState(true);
  useEffect(() => {
    setShowNext(props?.currentStep !== 5);
  }, [props?.currentStep]);

  useEffect(() => {
    if (subCategoryIds.length == 0) {
      dispatch(fetchSubCategoriesAPI({ dealId: deal_id, categoryId: category_id }));
    } 
  }, [subCategoryIds]);

  const location = useLocation();
  let isView = location.pathname.startsWith("/view-");
  const userFromSession = JSON.parse(localStorage.getItem("user"));
  const customPermissions = userFromSession?.user_data?.custom_permissions;
  // check whether the user can permission to modify the deal
  const deal_permission = customPermissions?.[category_id == 1 ? "FTN_Deal_Structure" : "B&C_Deal_Stucture"]?.["Products"]?.["edit"] || false;
  if (!deal_permission) isView = true;
  // Separate flag for disabling controls (includes amendment logic)
  let isDisabled = isView;
  // Check if amendment question 2 (products) is answered as "No" (0 or "0")
  if (deal_permission && (amendment_questions?.[2] == 0 || amendment_questions?.[2] == "0")) {
    isDisabled = true;
  }

  useEffect(() => {
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        let fetch_deal_detail = false
        if(allProductJson != null && allProductJson.sub_categories != null && subCategoryIds?.length != 0){
          let jsonSubIds = allProductJson.sub_categories.map(sub => parseInt(sub.sub_category_id))
          let selectedSubIds = subCategoryIds.map(id => parseInt(id))
          for(let i = 0; i < selectedSubIds.length; i++){
            if(!jsonSubIds.includes(selectedSubIds[i])){
              fetch_deal_detail = true
              break
            }
          }
        }
        if (allProductJson == null || fetch_deal_detail) {
          if(category_id == 1){
            await dispatch(fetchProductDataAPI({ dealId: deal_id, categoryId: category_id }));
          }
          if(category_id == 2){
            await dispatch(FetchBnCDealData({dealId: deal_id, categoryId: category_id}));
          }
          setIsLoading(false); // Stop loading after data is set
        } else {
          const result = {};
          [...allProductJson.sub_categories].forEach((sub) => {
            let { mix_details, products } = sub
          
            if(!Array.isArray(mix_details)) return
            mix_details?.forEach(({ mix_id }) => {
              if (!result[mix_id]) {
                result[mix_id] = [];
              }

              products.forEach(({ product_id, bib_mixes }) => {
                if (bib_mixes.some((bib) => bib.mix_id === mix_id)) {
                  result[mix_id].push(product_id);
                }
              });
            });
          });
          setAllSelected();
          setIsLoading(false); // Stop loading after data is set
        }
      } catch (error) {
        console.error("Failed to fetch sub categories:", error);
        setIsLoading(false); // Stop loading even if there's an error
      }
    };

    fetchProductData();
  }, []);

  useEffect(() => {
    if (allProductJson?.sub_categories?.length != 0) {
      const result = extractSubcategoriesWithProducts(allProductJson?.sub_categories);
      setSubCategoryData(result);
    }
    if (allProductJson && deal_id && Object.keys(selectedProduct).length === 0 && !selectedProductAPI) {
      dispatch(fetchSelectedDealProduct({ dealId: deal_id, categoryId: category_id }));
    }
  }, [allProductJson,selectedProduct]);

  const [progressing, setProgressing] = useState(false);
  const handleNext = async () => {
    setIsSaving(true);
    if (isView) {
      navigate(`/view-deal/${id}/${deal_id}/${category_id}/${5}`);
      return
    }
    const data = {
      deal_id: deal_id,
      category_id: category_id,
      items: selectedProduct,
    };
    if (progressing) return;
    setProgressing(true);
    setIsLoading(true);

    try {
      let obj = data?.items;
      const isValid = Object.keys(obj).length > 0 &&
        Object.values(obj).some(arr => Array.isArray(arr) && arr.length > 0);
      if (!isValid) {
        toast.error("You must select at least one product.");
        setProgressing(false);
        setIsLoading(false);
        throw new Error("Produdt ID is required.");
      }
      const result = await dispatch(postDealProducts(data)).unwrap(); // Ensure it's fulfilled
      //const resultData = await dispatch(postDealProductMixes(allProductJson)).unwrap(); // Ensure it's fulfilled
      let ProductData = [];
      if(category_id == 1){
        ProductData = await dispatch(fetchProductDataAPI({ dealId: deal_id, categoryId: category_id }));
      }
      if(category_id == 2){
        ProductData = await dispatch(FetchBnCDealData({dealId: deal_id, categoryId: category_id}));
      }
      setIsSaving(false)
      navigate(`/deal/${id}/${deal_id}/${category_id}/${5}`);
      setProgressing(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Error creating deal:", error);
      // Handle errors (e.g., show a message)
      setIsSaving(false)
      setProgressing(false);
    }
  };
  const handleBack = () => {
    navigate(`/${isView ? 'view-' : ''}deal/${id}/${deal_id}/${category_id}/${3}`)
    return
  };

  if (isLoading)
    return (
      <>
        <div
          className={`col-md-12 col-lg-6 right_section d-flex justify-contnt-center align-items-center position-relative step_all wow fadeIn ${props?.currentStep === 5 ? "allwizard_completed" : ""}`}
        >
          <div className="form_content m-auto position-relative zindex_0">
            <div className="selectproduct_checkbox step_4 steps active_step" id="step_4">
              <div className="forms_sections mt_50">
                <div className="row">
                  <div className="col-6">
                    <Skeleton height={30} width={"100%"} className="mt-2" />
                  </div>
                  <div className="col-6">
                    <Skeleton height={30} width={"100%"} className="mt-2" />
                  </div>
                </div>
                <div className="w-100">
                  <div className="row mt-0">
                    {[...Array(8)].map((_, index) => (
                      <div key={index} className="col-md-6">
                        <div className="mt-4">
                          <Skeleton height={240} width={"100%"} className="mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );

  return (
    <>
      <Tooltip id="my-tooltip2" place="top" />
      <div
        className={`col-md-12 col-lg-6 right_section d-flex justify-contnt-center align-items-center position-relative step_all wow fadeIn ${props?.currentStep === 5 ? "allwizard_completed" : ""}`}
      >
        <div className="form_content m-auto position-relative zindex_0">
          <div className="selectproduct_checkbox step_4 steps active_step box-bottom-space" id="step_4">
            <div className="forms_sections mt_20 deal-bottom-spaces">
              <div className="w-100 position-relative d-lg-flex justify-content-start align-items-center">
                <CategoryToggle category_id={category_id} dealId={deal_id} id={id} />
              </div>

              <div className="w-100 mt_10 pb_50">
                <div className="row">
                  <div className="col-md-7">
                    <p className="fs_18 fw_600 black-40">Select Products *</p>
                  </div>

                  <SearchFilterBox data={allProductJson?.sub_categories || {}} disabled={isDisabled} />
                </div>
                <div className="row mt-0">
                  {allProductJson && sub_category_data
                    ? sub_category_data.map((sub, index) =>{
                        return subCategoryIds?.length && subCategoryIds.map(id => parseInt(id)).includes(parseInt(sub.sub_category_id)) ? (
                          <React.Fragment key={index}>
                            <ProductSection category={sub} national_mix={sub.national_mix} items={sub.products} is_view={isDisabled} />
                          </React.Fragment>
                        ) : null
                    }
                      )
                    : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showNext && (
        <div className="button_fixed w-50">
          <button onClick={handleBack} className={`btn btn_outline_primary text-decoration-none `} id="back">
            Back
          </button>
          <button onClick={(e) => {
            e.preventDefault();
            handleNext();
          }} className={`btn btn_primary text-decoration-none step_4_button `} id="next">
          <span>{ isSaving || progressing ? <Spinner size="sm" className="me-2" /> : "Next"}</span>
          </button>
        </div>
      )}
    </>
  );
};

export default SelectProductCheckbox;

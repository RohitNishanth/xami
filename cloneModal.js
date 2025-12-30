import React, { useRef, useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { cloneDeal, checkCloneEligibility } from "../../features/deal-list/dealsListSlice";
import Modal from "../../components/modalPopup/Modal";
import { Spinner } from "react-bootstrap";
import SelectCustom from "../../components/Select";

const CloneDealForm = ({ closeForm, initial, isClone, isCloning, nasmMatch, nasmCustomers, selectedCustomer, setSelectedCustomer }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      clone_id: initial?.clone_id || null,
      id: initial?.id || null,
      name: initial?.name || "",
      targetCustomer: selectedCustomer ? String(selectedCustomer) : "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().trim().required("Deal name is required").min(3, "Deal name must be at least 3 characters").max(50, "Deal name must be 50 characters at most"),
      targetCustomer: Yup.string().trim().required("Please select a customer to clone the deal to."),
    }),
    onSubmit: async (values, { resetForm, setErrors }) => {
      let name = values.name;
      let customer = values.targetCustomer;

      try {
        let action = cloneDeal({
          dealId: initial?.clone_id,
          newDealName: name,
          targetCustomerId: customer,
        });
        const result = await dispatch(action);

        if (result?.error) {
          setErrors({ name: result?.payload?.detail || "" });
          return;
        }

        toast.success(`Deal cloned successfully! New deal: ${result?.payload?.deal_name}`);
        resetForm();
        closePopup("completed");
        navigate(`/deal/${result?.payload?.customer_id}/${result?.payload?.deal_id}`, { state: { backurl: "/deal-list" } });
      } catch (err) {
        console.error(err);
        if (err?.detail?.includes("already exists")) {
          formik.setFieldError("name", "Deal name already exists");
        } else {
          toast.error(err?.detail || "Failed to clone deal");
        }
      }

      return false;
    },
  });

  const closePopup = (action = "") => {
    // Only allow closing if not in loading state
    if (!isCloning && !formik.isSubmitting) {
      closeForm(action);
    }
  };

  let createButton = isClone ? "Clone Deal" : "Create";
  createButton = formik.isSubmitting || isCloning ? <Spinner size="sm" className="me-2" /> : createButton;

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="body_modal mt_36">
          {/* NASM Mismatch Warning */}
          {!nasmMatch && nasmCustomers?.length > 0 && (
            <div className="alert alert-warning mb_20" role="alert">
              <strong>Note:</strong> This deal belongs to a different NASM user. Please select one of your customers to clone this deal to.
            </div>
          )}

          {/* Customer Dropdown - Show only if NASM mismatch */}
          {nasmCustomers?.length > 0 && (
            <div className="row mb_20">
              <div className="col-12">
                <div className="form-floating">
                  <SelectCustom
                    options={(nasmCustomers || []).map((customer) => ({
                      value: String(customer.id),
                      label: customer.concept_name,
                    }))}
                    value={
                      (() => {
                        const value = formik.values.targetCustomer;
                        if (!value) {
                          return { value: "", label: "Select Customer" };
                        }
                        const match = (nasmCustomers || []).find((c) => String(c.id) === String(value));
                        return match ? { value: String(match.id), label: match.concept_name } : { value: "", label: "Select Customer" };
                      })()
                    }
                    onChange={(option) => {
                      const value = option ? option.value : "";
                      formik.setFieldValue("targetCustomer", value);
                      if (setSelectedCustomer) {
                        setSelectedCustomer(value);
                      }
                    }}
                    isDisabled={isCloning}
                    placeholder="Select Customer"
                    tabIndex={1}
                  />
                  <label htmlFor="targetCustomer">Select Target Customer *</label>
                </div>
                {formik.touched.targetCustomer && formik.errors.targetCustomer ? <div className="text-danger mt_6">{formik.errors.targetCustomer}</div> : null}
              </div>
            </div>
          )}

          {/* No customers available warning */}
          {!nasmMatch && nasmCustomers?.length === 0 && (
            <div className="alert alert-danger mb_20" role="alert">
              <strong>Error:</strong> No customers are assigned to your NASM account. Please contact your administrator.
            </div>
          )}

          <div className="row">
            <div className="col-12">
              <div className="form-floating">
                <input
                  type="text"
                  className={`form-control ${formik.touched.name && formik.errors.name ? "is-invalid" : ""}`}
                  id="name"
                  placeholder="Enter new deal name"
                  {...formik.getFieldProps("name")}
                  disabled={isCloning}
                />
                <label htmlFor="name">New Deal Name *</label>
              </div>

              {formik.touched.name && formik.errors.name ? <div className="text-danger mt_6">{formik.errors.name}</div> : null}
            </div>
          </div>
        </div>

        <div className="footer_modal d-flex justify-content-between mt_34">
          <div className="col-6 pr_10">
            <button type="button" className="btn btn_outline_primary text-decoration-none w-100" onClick={closePopup} disabled={isCloning || formik.isSubmitting}>
              Cancel
            </button>
          </div>
          <div className="col-6 pl_10">
            <button type="submit" className="btn btn_primary text-decoration-none w-100" disabled={formik.isSubmitting || isCloning || (!nasmMatch && nasmCustomers?.length === 0)}>
              {createButton}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

const CloneDealModal = ({ show, onClose, originalDealId, originalDealName }) => {
  const dispatch = useDispatch();
  const [modalTitle, setModalTitle] = useState("Clone Deal");
  const [initialValues, setInitialValues] = useState({});
  const [nasmMatch, setNasmMatch] = useState(true);
  const [nasmCustomers, setNasmCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const dealsListState = useSelector((state) => state.deals);
  const isCloning = dealsListState?.cloning || false;

  useEffect(() => {
    const checkEligibility = async () => {
      if (show && originalDealId && originalDealName) {
        setLoadingEligibility(true);
        setInitialValues({
          clone_id: originalDealId,
          parent_name: originalDealName,
          name: `${originalDealName} (Copy)`,
        });

        try {
          const result = await dispatch(checkCloneEligibility(originalDealId));
          if (result?.payload) {
            const { nasm_match, nasm_customers, original_customer_id } = result.payload;
            setNasmMatch(nasm_match);
            setNasmCustomers(nasm_customers || []);

            const selected_customer = nasm_customers.some((c) => c.id === original_customer_id);

            setSelectedCustomer(selected_customer ? original_customer_id : "");

            // If NASM mismatch, update modal title
            if (!nasm_match) {
              setModalTitle("Clone Deal - Select Customer");
            } else {
              setModalTitle("Clone Deal");
            }
          }
        } catch (err) {
          console.error("Failed to check clone eligibility:", err);
          // Default to allowing clone if eligibility check fails
          setNasmMatch(true);
          setNasmCustomers([]);
        } finally {
          setLoadingEligibility(false);
        }
      }
    };

    checkEligibility();
  }, [show, originalDealId, originalDealName, dispatch]);

  const closePopupWindow = (action = "") => {
    // Only allow closing if not in loading state
    if (!isCloning && !loadingEligibility) {
      onClose();
      setInitialValues({});
      setNasmMatch(true);
      setNasmCustomers([]);
      setSelectedCustomer(null);
      setModalTitle("Clone Deal");
    }
  };

  return (
    <Modal show={show} onClose={closePopupWindow} title={modalTitle} disableClose={isCloning || loadingEligibility}>
      {loadingEligibility ? (
        <div className="text-center py_40">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Checking eligibility...</span>
          </Spinner>
          <p className="mt_10">Checking clone eligibility...</p>
        </div>
      ) : (
        <CloneDealForm
          closeForm={closePopupWindow}
          initial={initialValues}
          isClone={true}
          isCloning={isCloning}
          nasmMatch={nasmMatch}
          nasmCustomers={nasmCustomers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
        />
      )}
    </Modal>
  );
};

export default CloneDealModal;

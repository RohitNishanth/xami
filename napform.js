import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useDispatch, useSelector } from "react-redux";
import { createNap, updateNap, fetchNapSchedules } from "../../../features/nap/napSlice";
import useSubmitOnEnter from "../../../hooks/useSubmitOnEnter";
import { toast } from "react-toastify";

const NapForm = ({ closeForm, initial }) => {
  const dispatch = useDispatch();
  const { scheduleOptions } = useSelector((state) => state.nap);

  useEffect(() => {
    if (!scheduleOptions?.length) {
      dispatch(fetchNapSchedules());
    }
  }, [dispatch, scheduleOptions?.length]);

  const formik = useFormik({
    initialValues: {
      nap_name: initial?.nap_name || "",
      schedule: initial?.schedule || "Annually",
      id: initial?.id || null,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      nap_name: Yup.string()
        .trim()
        .max(50, "NAP name must be 50 characters at most.")
        .required("NAP name is required"),
      schedule: Yup.string().required("Schedule is required"),
    }),
    onSubmit: async (values, { resetForm, setErrors }) => {
      try {
        const action =
          values.id === null
            ? createNap({ name: values.nap_name.trim(), schedule: values.schedule })
            : updateNap({ name: values.nap_name.trim(), schedule: values.schedule, id: initial?.id });

        const result = await dispatch(action);
        // Check if the unsuccessful
        if (result?.error) {
          setErrors({ nap_name: result?.payload?.detail || "" });
          return; // Prevent form submission and redirection
        }

        toast.success(result?.payload?.message);
        resetForm();
        closePopup("completed");
      } catch (err) {
        toast.error(
          "There was an error submitting the form. Please try again."
        );
        console.error(err);
      }
      return false;
    },
  });
  useSubmitOnEnter(formik);

  const closePopup = (action = "") => {
    closeForm(action);
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className="body_modal mt_36">
          <div className="form-floating">
            <input
              type="text"
              className={`form-control ${
                formik.touched.nap_name && formik.errors.nap_name
                  ? "is-invalid"
                  : ""
              }`}
              id="nap_name"
              placeholder="NAP Name"
              {...formik.getFieldProps("nap_name")}
            />
            <label htmlFor="nap_name">NAP Name *</label>
          </div>
          {formik.touched.nap_name && formik.errors.nap_name ? (
            <div className="text-danger mt_6">{formik.errors.nap_name}</div>
          ) : null}
          <div className="form-floating mt_20">
            <select
              className={`form-select ${
                formik.touched.schedule && formik.errors.schedule ? "is-invalid" : ""
              }`}
              id="schedule"
              {...formik.getFieldProps("schedule")}
            >
              {scheduleOptions?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label htmlFor="schedule">Schedule *</label>
          </div>
          {formik.touched.schedule && formik.errors.schedule ? (
            <div className="text-danger mt_6">{formik.errors.schedule}</div>
          ) : null}
        </div>
        <div className="footer_modal d-flex justify-contnt-between mt_34">
          <div className="col-6 pr_10">
            <button
              className="btn btn_outline_primary text-decoration-none w-100"
              onClick={closePopup}
            >
              Cancel
            </button>
          </div>
          <div className="col-6 pl_10">
            <button
              type="submit"
              className="btn btn_primary text-decoration-none w-100"
            >
              {formik.isSubmitting
                ? "Saving ..."
                : initial?.id != null
                ? "Update"
                : "Create"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export default NapForm;

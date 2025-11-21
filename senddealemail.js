import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { Spinner } from "react-bootstrap";

import Modal from "../../components/modalPopup/Modal";
import { sendDealEmail } from "../../features/deal-list/dealsListSlice";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const parseEmails = (value = "") =>
  value
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);

const uniqueEmails = (emails = []) => {
  const seen = new Set();
  return emails.filter((email) => {
    const key = email.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const SendDealEmailModal = ({ show, onClose, dealId, dealName }) => {
  const dispatch = useDispatch();
  const sendingEmail = useSelector((state) => state.deals.sendingEmail);

  const formik = useFormik({
    initialValues: {
      emailInput: "",
      emails: [],
    },
    validationSchema: Yup.object({
      emails: Yup.array()
        .of(Yup.string().email("Enter a valid email address"))
        .min(1, "Enter at least one email address")
        .required("Enter at least one email address"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!dealId) {
        toast.error("Deal information missing. Please try again.");
        return;
      }

      try {
        const response = await dispatch(
          sendDealEmail({
            dealId,
            emails: values.emails,
          })
        ).unwrap();

        toast.success(response?.message || "Email sent successfully.");
        resetForm();
        onClose();
      } catch (error) {
        const errorMessage =
          error?.detail ||
          error?.message ||
          "Unable to send email. Please try again.";
        toast.error(errorMessage);
      }
    },
  });

  useEffect(() => {
    if (show) {
      formik.resetForm();
    }
  }, [show, dealId]);

  const invalidEmails = useMemo(
    () => formik.values.emails.filter((email) => !emailPattern.test(email)),
    [formik.values.emails]
  );

  const handleEmailChange = (event) => {
    const rawValue = event.target.value;
    const parsed = uniqueEmails(parseEmails(rawValue));
    formik.setFieldValue("emailInput", rawValue);
    formik.setFieldValue("emails", parsed);
  };

  const handleChipRemove = (index) => {
    const updated = formik.values.emails.filter((_, idx) => idx !== index);
    formik.setFieldValue("emails", updated);
    formik.setFieldValue("emailInput", updated.join(", "));
  };

  const disableSubmit =
    sendingEmail || invalidEmails.length > 0 || formik.values.emails.length === 0;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Send Deal Email"
      disableClose={sendingEmail}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="body_modal mt_24">
          <div className="row mb-3">
            <div className="col-12">
              <p className="text-muted mb-0">
                Deal:&nbsp;
                <span className="fw-semibold">{dealName || "-"}</span>
              </p>
              <p className="text-muted">Deal ID: {dealId ?? "-"}</p>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="form-floating">
                <textarea
                  id="emailInput"
                  name="emailInput"
                  className={`form-control ${
                    formik.touched.emails && (invalidEmails.length > 0 || formik.errors.emails)
                      ? "is-invalid"
                      : ""
                  }`}
                  placeholder="Enter email addresses"
                  value={formik.values.emailInput}
                  onChange={handleEmailChange}
                  onBlur={() => formik.setFieldTouched("emails", true, true)}
                  rows={4}
                  disabled={sendingEmail}
                />
                <label htmlFor="emailInput">Email Addresses *</label>
              </div>
              <div className="form-text">
                Type or paste multiple email addresses. Separate them using commas,
                semicolons, or new lines.
              </div>

              {formik.touched.emails && formik.errors.emails && (
                <div className="text-danger mt_6">{formik.errors.emails}</div>
              )}

              {invalidEmails.length > 0 && (
                <div className="text-danger mt_6">
                  {invalidEmails.join(", ")} {invalidEmails.length === 1 ? "is" : "are"} not valid.
                </div>
              )}

              {formik.values.emails.length > 0 && (
                <div className="mt_12">
                  {formik.values.emails.map((email, index) => (
                    <span
                      key={`${email}_${index}`}
                      className={`email-tag d-inline-flex align-items-center mb-2 ${
                        emailPattern.test(email) ? "" : "email-tag-invalid"
                      }`}
                    >
                      {email}
                      <button
                        type="button"
                        className="btn btn-link btn-sm p-0 ms-2 text-decoration-none"
                        onClick={() => handleChipRemove(index)}
                        disabled={sendingEmail}
                        aria-label={`Remove ${email}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer_modal d-flex justify-content-between mt_34">
          <div className="col-6 pr_10">
            <button
              type="button"
              className="btn btn_outline_primary text-decoration-none w-100"
              onClick={() => {
                if (!sendingEmail) {
                  onClose();
                }
              }}
              disabled={sendingEmail}
            >
              Cancel
            </button>
          </div>
          <div className="col-6 pl_10">
            <button
              type="submit"
              className="btn btn_primary text-decoration-none w-100"
              disabled={disableSubmit}
            >
              {sendingEmail ? <Spinner size="sm" className="me-2" /> : null}
              Send
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default SendDealEmailModal;


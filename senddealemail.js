import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { TagsInput } from "react-tag-input-component";

import Modal from "../../components/modalPopup/Modal";
import { sendDealEmail } from "../../features/deal-list/dealsListSlice";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SendDealEmailModal = ({ show, onClose, dealId, dealName }) => {
  const dispatch = useDispatch();
  const sendingEmail = useSelector((state) => state.deals.sendingEmail);

  const formik = useFormik({
    initialValues: {
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
        toast.error("Deal information unavailable. Please try again.");
        return;
      }

      try {
        await dispatch(
          sendDealEmail({
            dealId,
            emails: values.emails,
          })
        ).unwrap();

        toast.success("Email sent successfully");
        resetForm();
        onClose();
      } catch (error) {
        const errorMessage =
          error?.detail || error?.message || "Unable to send email. Please try again.";
        toast.error(errorMessage);
      }
    },
  });

  useEffect(() => {
    if (show) {
      formik.resetForm();
    }
  }, [show, dealId]);

  const handleEmailsChange = (emails) => {
    const filtered = emails
      .filter((email) => email && email.trim() !== "")
      .map((email) => email.trim());
    formik.setFieldValue("emails", filtered);
  };

  const invalidEmails = formik.values.emails.filter((email) => !emailPattern.test(email));
  const disableSubmit =
    sendingEmail || invalidEmails.length > 0 || formik.values.emails.length === 0;

  return (
    <Modal
      show={show}
      onClose={onClose}
      title="Send Mail"
      disableClose={sendingEmail}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="body_modal mt_24">
          <div className="row mb-3">
            <div className="col-12">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  value={dealName || "-"}
                  readOnly
                />
                <label>Deal Name</label>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <p className="fs_16 fw_400 black-40 mb-2">Email Addresses *</p>
              <div className="broder_box newborder_box mt-3 highlighted">
                <div className="scrool_box position-relative zindex_1">
                  <TagsInput
                    value={formik.values.emails}
                    onChange={handleEmailsChange}
                    name="emails"
                    placeHolder="Enter email address and press Enter"
                    classNames={{ tag: "email-tag", input: "email-tag-input" }}
                    disabled={sendingEmail}
                    onBlur={() => formik.setFieldTouched("emails", true, true)}
                    renderTag={(tag, index) => {
                      const isInvalid = !emailPattern.test(tag);
                      return (
                        <span
                          key={`${tag}_${index}`}
                          className={`email-tag${isInvalid ? " email-tag-invalid" : ""}`}
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formik.values.emails];
                              updated.splice(index, 1);
                              handleEmailsChange(updated);
                            }}
                            aria-label={`remove ${tag}`}
                            disabled={sendingEmail}
                          >
                            ×
                          </button>
                        </span>
                      );
                    }}
                  />
                </div>
              </div>
              <div className="form-text" style={{ color: "#6c757d", fontSize: "0.95em", marginTop: "2px" }}>
                Type or paste multiple email addresses. Press Enter after each email.
              </div>

              {formik.touched.emails && invalidEmails.length > 0 ? (
                <div className="text-danger mt_6">
                  {invalidEmails.map((email, idx) => (
                    <div key={`${email}_${idx}`}>{email} is not a valid email address</div>
                  ))}
                </div>
              ) : formik.touched.emails && formik.errors.emails ? (
                <div className="text-danger mt_6">{formik.errors.emails}</div>
              ) : null}
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


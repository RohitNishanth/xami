import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { DropdownMenu } from "reactstrap";
import threedots from "../../assets/scss/images/three_dots_dropdown.svg";
import { toast } from "react-toastify";
import { toggleDealFlags, craeteRenewalDeal } from "../../features/deal-list/dealsListSlice";
import { getDealAccessLinks } from "../../helpers/accessHelper"

const DealListAction = ({ rowIndex, row, isOpen, onToggle, onSend, onClone, onShowAmendmentQuestions, onSendEmail }) => {
  const dispatch = useDispatch();
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [dropdownHeight, setDropdownHeight] = useState(0);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();
  const listRef = useRef(null);
  const fountain_point = row.original.fountain_point;
  const bc_point = row.original.bc_point;
  const userFromSession = JSON.parse(localStorage.getItem("user"));
  const customPermissions = userFromSession?.user_data?.custom_permissions;
  //const canViewDeal = customPermissions?.["Deal"]?.["View"]?.edit || customPermissions?.["Deal"]?.["View"]?.view;
  const editPermission =
    userFromSession?.user_data?.user_id === row?.original?.deal_created_by ||
    (userFromSession?.user_data?.segment === row?.original?.segment &&
      userFromSession?.user_data?.subsegment === row?.original?.subsegment);

  const viewPermission = !editPermission;

  const canViewDeal = (customPermissions?.["Deal"]?.["View"]?.edit ||
    customPermissions?.["Deal"]?.["View"]?.view);



  const canModifyDeal = editPermission && (customPermissions?.["Deal"]?.["Modify"]?.edit);
  const canCloneDeal = customPermissions?.["Deal"]?.["Clone"]?.edit;
  const canArchiveDeal = customPermissions?.["Deal"]?.["Archive"]?.edit;
  const [openDropdown, setOpenDropdown] = useState(false);
  const isNasmUser = userFromSession?.user_data?.user_type === 1 && !userFromSession?.user_data?.is_super_admin;

  let launchUserTo = userFromSession?.user_data?.launch_user_to;

  const toggleDropdown = async (event) => {
    event.stopPropagation();
    onToggle(isOpen ? null : rowIndex);
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      let dropHeight = 60;
      if (canChange) dropHeight += 90;
      setDropdownHeight(dropHeight);

      // Check if there's enough space below; if not, place it above
      const shouldOpenAbove = buttonRect.bottom + dropdownHeight > viewportHeight;
      setDropdownPosition({
        top: shouldOpenAbove ? buttonRect.top - dropdownHeight + window.scrollY : buttonRect.bottom + window.scrollY,
        left: buttonRect.left + window.scrollX,
      });
    }
    setOpenDropdown(isOpen);
  }, [isOpen, dropdownHeight]);

  const handleClickOutside = (event) => {
    if (listRef.current && typeof listRef.current.contains === "function") {
      if (!listRef.current.contains(event.target)) {
        onToggle(null);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  let { deal_status, customer_status, deal_created_by } = row.original;
  let { user_id, user_type } = userFromSession?.user_data
  // deal_status 2 -> equipment
  // user_type 2 -> equipment
  let canChange = false
  if (customer_status == 0 && canModifyDeal) {
    // canChange =  (row.original.segment  == userFromSession?.user_data?.segment && row.original.subsegment == userFromSession?.user_data?.subsegment)
    // if(deal_created_by == user_id) {
    canChange = true;
    //}
  }

  const handleCloneDeal = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Call the parent's clone handler
    onClone(row.original.deal_id, row.original.deal_name);

    // Close the dropdown
    onToggle(null);
    setOpenDropdown(false);
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onSendEmail === "function") {
      onSendEmail({
        deal_id: row?.original?.deal_id,
        deal_name: row?.original?.deal_name,
      });
    }
    onToggle(null);
    setOpenDropdown(false);
  };

  const handleRenewal = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await dispatch(craeteRenewalDeal({ deal_id: row.original.deal_id })).unwrap();
    if (result?.error) {
      toast.error(result?.payload?.detail);
    } else {
      toast.success(result?.payload?.message);
      navigate(`/deal/${row.original.customer_id}/${result?.deal_id}`);
    }

    // Close the dropdown
    onToggle(null);
    setOpenDropdown(false);
  };

  const handleAmendment = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Call the parent's amendment handler to show the questions panel
    if (onShowAmendmentQuestions) {
      onShowAmendmentQuestions(row.original.deal_id);
    }

    // Close the dropdown
    onToggle(null);
    setOpenDropdown(false);
  };
  const getAction = (deal, userFromSession) => {
    let deal_status = deal.deal_status
    let user = userFromSession?.user_data
    if (user.user_type == 1) {
      if (deal_status == 1) {
        return <li>
          <Link
            className="dropdown-item"
            onClick={(e) => {
              onSend(e, row.original.deal_id)
            }} // Prevent dropdown from closing
          >
            Move to Equipment
          </Link>
        </li>
      } else {
        return ""
      }
    }

    if (user.user_type == 2) {
      if (deal_status == 2) {
        return <>
          <li>
            <Link
              className="dropdown-item"
              onClick={(e) => {
                onSend(e, row.original.deal_id)
              }} // Prevent dropdown from closing
            >
              Move to Sales
            </Link>
          </li>
          <li>
            <Link
              className="dropdown-item"
              onClick={(e) => {
                onSend(e, row.original.deal_id)
              }} // Prevent dropdown from closing
            >
              Move to NASM
            </Link>
          </li>
        </>
      } else {
        return ""
      }
    }
  }

  const { deal_category } = row.original;
  const customer_id = row.original.customer_id;
  const deal_id = row.original.deal_id;

  // to deal check access pages links
  const { deal_link, viewLink } = getDealAccessLinks({ deal_category, customer_id, deal_id, launchUserTo, fountain_point, bc_point });

  let AmendmentLink = `/deal-list`
  if (Array.isArray(deal_category) && deal_category.length > 0) {
    if (deal_category.includes(1)) {
      AmendmentLink = `/fountain-deal-strucure/products/${row.original.deal_id}`
    }
    else if (deal_category.includes(2)) {
      AmendmentLink = `/bottle-and-can/products/${row.original.deal_id}`
    }
  }


  return (
    <>
      <div className="dropdown" ref={dropdownRef} style={{ position: "relative" }}>
        <button className="btn btn-link py-0" onClick={toggleDropdown} ref={buttonRef}>
          <img src={threedots} alt="menu" className="max-auto" />
        </button>
      </div>

      {openDropdown && (
        <DropdownMenu
          ref={listRef}
          className="dropdown-menu show"
          style={{
            position: "absolute",
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            zIndex: 1050,
            width: `100px`,
          }}
          container="body"
          tag="ul"
        >


          {(canViewDeal && !canChange) && (
            <li>
              <Link to={viewLink} state={{ backurl: "/deal-list" }} className="dropdown-item">
                View
              </Link>
            </li>
          )}
          {isNasmUser && (
            <li>
              <button
                type="button"
                className="dropdown-item text-start"
                onClick={handleSendEmail}
              >
                Send Email
              </button>
            </li>
          )}
          {canChange && row.original.deal_type === 1 && row.original.deal_status != 9 ? (
            <li>
              {/* {(deal_link != `/deal/${row.original.customer_id}/${row.original.deal_id}`) ? (
                <Link to={deal_link} state={{ backurl: "/deal-list" }} className="dropdown-item">
                  View / Modify
                </Link>
              ) : (
                <Link to={`/deal/${row.original.customer_id}/${row.original.deal_id}`} state={{ backurl: "/deal-list" }} className="dropdown-item">
                   View / Modify
                </Link>
              )} */}
              {deal_link ? (
                <Link to={deal_link} state={{ backurl: "/deal-list" }} className="dropdown-item">
                  View / Modify
                </Link>
              ) : ""
              }

            </li>
          ) : null}
          {canChange && row.original.deal_type === 2 && row.original.deal_status != 9 ? (
            <li>
              {(deal_link != `/deal/${row.original.customer_id}/${row.original.deal_id}`) ? (
                <Link to={deal_link} state={{ backurl: "/deal-list" }} className="dropdown-item">
                  Modify Renewal
                </Link>
              ) : (
                <Link to={`/deal/${row.original.customer_id}/${row.original.deal_id}`} state={{ backurl: "/deal-list" }} className="dropdown-item">
                  Modify Renewal
                </Link>
              )}
            </li>
          ) : null}
          {canChange && row.original.deal_type === 4 ? (
            <li>
              <Link to={AmendmentLink} state={{ backurl: "/deal-list" }} className="dropdown-item">
                Modify Amendment
              </Link>
            </li>
          ) : null}
          {canCloneDeal ?
            <li>
              <Link
                className="dropdown-item"
                onClick={handleCloneDeal}
              >
                Clone
              </Link>
            </li>
            : ""}
          {canChange && row.original.deal_type != 4 && row.original.deal_status == 9 ? (
            <li>
              <Link
                className="dropdown-item"
                onClick={(e) => handleRenewal(e)}
              >
                Renewal
              </Link>
            </li>
          ) : null}
          {canChange && row.original.deal_type != 4 && row.original.deal_status == 9 ? (
            <li>
              <Link
                className="dropdown-item"
                onClick={handleAmendment}
              >
                Amendment
              </Link>
            </li>
          ) : null}
          {canArchiveDeal ? (
            <>
              {
                (row.original.production_flag === 0) && (
                  <li>
                    <Link
                      className="dropdown-item"
                      onClick={async (e) => {
                        try {
                          let data = {
                            deal_id: row.original.deal_id,
                            toggle_key: "archive",
                            archive_flag: row.original.status === 1 ? false : true
                          }
                          let result = await dispatch(toggleDealFlags(data));
                          if (result?.error) {
                            toast.error(result?.payload?.detail);
                          } else {
                            toast.success(result?.payload?.message);
                            onToggle(null)
                          }
                        } catch (err) {
                          toast.error("There was an error. Please try again.");
                        }
                      }} // Prevent dropdown from closing
                    >
                      {row.original.status === 1 ? "Unarchive" : "Archive"}
                    </Link>
                  </li>)
              }
              {/* getAction(row.original, userFromSession) */}
            </>
          ) : null}
        </DropdownMenu>
      )}

      {/* Amendment Questions Panel */}
      {/* The AmendmentQuestions component is now rendered by the parent based on the onShowAmendmentQuestions prop */}
    </>
  );
};

export default DealListAction;

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeals, toggleDealFlags } from "../../features/deal-list/dealsListSlice";
import { BC_CTS, DEAL_TERMS, DEAL_TYPES } from "../../constants/constants";
import DealsTableView from "../../components/Table/DealsTableView";
import ContractArrow from "../../assets/images/table_arrow_guide.svg";
import DealListAction from "./deals_list_action";
import { toast } from "react-toastify";
import CommunicationForm from "../deal/communication/CommunicationForm";
import NotesIcon from "../../pages/deals/NotesIcon";
import DealStatus from "../../pages/deals/DealStatus";
import NotesPanel from "./NotesPanel";
import Swal from "sweetalert2";
import ToggleSwitch from "../../components/toggleSwitch/toggleSwitch";
import CloneDealModal from "./CloneModel";
import SendDealEmailModal from "../deal-list/SendDealEmailModal";


const DealsTable = (props) => {
  const dispatch = useDispatch();
  const { deals, loading } = useSelector((state) => state.deals);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const actionRefs = useRef({});
  const userFromSession = useMemo(() => JSON.parse(localStorage.getItem("user")), []);
  const loggedUser = useSelector((state) => state.auth.user);
  const [initialData, setInitialData] = useState({});
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [notesModal, setNotesModal] = useState(false);
  const [dealStatusModal, setDealStatusModal] = useState(false);
  const currentNoteDealId = useRef(null);
  const expandedRowRef = useRef(null);
  const notesPanelRef = useRef(null);
  const [communicationModal, setCommunicationModal] = useState(false);
  const [filter, setFilter] = useState({ deal_created_by_user: true, archive_only: false });
  const [rerender, setRerender] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneDealData, setCloneDealData] = useState({});
  const [showSendEmailModal, setShowSendEmailModal] = useState(false);
  const [sendEmailDeal, setSendEmailDeal] = useState({ id: null, name: "" });
  const customPermissions = userFromSession?.user_data?.custom_permissions;
  const dealPermissions = customPermissions?.["Deal"] || {};
  const userAccessSingle = customPermissions?.["Deals"]?.["View"]?.edit || false;
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Modal toggle
  const toggleModal = () => {
    setCommunicationModal((prev) => !prev);
    if (communicationModal) setInitialData({});
  };


  // Send deal handler
  const handleSendDeal = async (event, deal_id) => {
    event.stopPropagation();
    Swal.fire({
      title: `Are you sure you want to move this deal to Equipment process?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-secondary",
      },
      buttonsStyling: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        setCommunicationModal(true)
        currentNoteDealId.current = deal_id
        setOpenDropdownIndex(null);
      }
    });
  };

  useEffect(() => {

    if (showRightPanel) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`; // prevents layout jump
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [showRightPanel]);

  // Clone deal handler
  const handleCloneDeal = (dealId, dealName) => {
    setCloneDealData({ dealId, dealName });
    setShowCloneModal(true);
    setOpenDropdownIndex(null);
  };

  const handleSendEmailOption = useCallback(
    (deal) => {
      if (!deal) return;
      setSendEmailDeal({
        id: deal?.deal_id || null,
        name: deal?.deal_name || "",
      });
      setShowSendEmailModal(true);
      setOpenDropdownIndex(null);
    },
    []
  );

  const closeSendEmailModal = () => {
    setShowSendEmailModal(false);
    setSendEmailDeal({ id: null, name: "" });
  };

  // Fetch deals on mount or customer change
  useEffect(() => {
    const customer_id = props?.customer?.id || null;
    dispatch(fetchDeals({ id: customer_id }));
  }, [props?.customer, rerender, dispatch]);

  useEffect(() => {
    setFilter(props?.filter);
  }, [props?.filter]);

  // Filtering logic
  useEffect(() => {
    const is_admin = loggedUser?.user_data?.is_super_admin || false;
    const searchValue = props?.search?.toLowerCase() || "";
    let filtered = deals;
    if (searchValue) {
      filtered = deals.map((deal) => {
        const matchingDeals = deal.deals.filter((d) => {
          let check_created_by_user = true;
          let check_archive_only = true;
          if (!is_admin && filter?.deal_created_by_user && loggedUser?.user_data?.user_id !== d.deal_created_by) {
            check_created_by_user = false;
          }

          if (filter?.archive_only && d.status == 0) {
            check_archive_only = false;
          }

          return (
            check_created_by_user && check_archive_only && (
              deal?.customer_name?.toLowerCase().includes(searchValue) ||
              d?.deal_name?.toLowerCase().includes(searchValue) ||
              d?.nasm?.toLowerCase().includes(searchValue) ||
              d?.director?.toLowerCase().includes(searchValue) ||
              d?.segment?.toLowerCase().includes(searchValue) ||
              d?.subsegment?.toLowerCase().includes(searchValue) ||
              (DEAL_TYPES?.[d?.deal_type] ?? DEAL_TYPES?.[1])?.toLowerCase().includes(searchValue) ||
              BC_CTS?.[d?.bc_cts]?.toLowerCase().includes(searchValue) ||
              d?.division?.toLowerCase().includes(searchValue)
            )
          );
        });
        if (!filter?.deal_created_by_user && deal.customer_name.toLowerCase().includes(searchValue)) {
          return { ...deal };
        } else if (deal.customer_name.toLowerCase().includes(searchValue) || matchingDeals?.length > 0) {
          return { ...deal, deals: matchingDeals };
        }
        return null;
      }).filter(Boolean);
    } else if ((!is_admin && filter?.deal_created_by_user) || filter?.archive_only) {
      filtered = deals.map((deal) => {
        let matchingDeals = deal.deals;
        if (filter?.deal_created_by_user) {
          matchingDeals = deal.deals.filter((d) => loggedUser?.user_data?.user_id === d.deal_created_by);
        }
        if (filter?.archive_only) {
          matchingDeals = matchingDeals.filter((d) => d.status == 1); // 1 -> archeived // show only archived
        } else {
          matchingDeals = matchingDeals.filter((d) => d.status != 1); // show only unarchived
        }
        return { ...deal, deals: matchingDeals };
      }).filter(Boolean);
    }
    setFilteredDeals(filtered || deals);
  }, [props?.search, deals, filter, loggedUser]);

  // useEffect(() => {
  //   let filtered = deals;
  //   if (userFromSession?.user_data?.user_type === 2) {
  //     filtered = deals.filter(customer =>
  //       customer.deals.some(deal => deal.deal_created_by === userFromSession.user_data.user_id)
  //     ).map(customer => ({
  //       ...customer,
  //       deals: customer.deals.filter(deal => deal.deal_created_by === userFromSession.user_data.user_id)
  //     })).filter(customer => customer.deals.length > 0);
  //   }
  //   setFilteredDeals(filtered);
  // }, [deals, userFromSession]);

  // Dropdown click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      let isInsideDropdown = Object.values(actionRefs.current).some((ref) => ref && ref.contains(event.target));
      if (!isInsideDropdown) setOpenDropdownIndex(null);
      // NotesPanel click outside
      if (notesModal && notesPanelRef.current && !notesPanelRef.current.contains(event.target)) {
        setNotesModal(false);
        setShowRightPanel(false);
      }
      // DealStatus click outside
      if (expandedRowRef.current && !expandedRowRef.current.contains(event.target)) {
        setExpandedRowId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notesModal, dealStatusModal]);

  // Flatten data for table
  const flattenedData = useMemo(() => {
    return filteredDeals?.flatMap((customer) =>
      customer.deals.map((deal) => ({
        ...deal,
        customer_name: customer.customer_name,
        customer_id: customer.customer_id,
        deals: customer.deals,
      }))
    );
  }, [filteredDeals]);

  // Table columns
  const columns = useMemo(() => {
    if (!props?.customerPage) {
      const baseColumns = [
        {
          Header: "Customer Name",
          accessor: "customer_name",
        },
        {
          Header: "Deal(s)",
          accessor: "deal_name",
          Cell: ({ value }) => {
            return (
              <>
                {value !== null && value !== "" ? (
                  <div className="d-flex align-items-center customer-list-deal-names">
                    <p>{value || "-"}</p>
                  </div>
                ) : (
                  "-"
                )}
              </>
            );
          },
        },
        {
          Header: "Deal Type",
          accessor: "deal_type",
          Cell: ({ value }) => {
            return <>{value !== null && value !== "" ? DEAL_TYPES?.[value] : DEAL_TYPES?.[1]}</>;
          },
          sortDescFirst: false,
          sortType: (rowA, rowB, columnId) => {
            const a = DEAL_TYPES?.[rowA.values[columnId]] || "";
            const b = DEAL_TYPES?.[rowB.values[columnId]] || "";
            return a.localeCompare(b); // Ensures proper string sorting
          },
        },
        {
          Header: "NASM",
          accessor: "nasm",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "Director",
          accessor: "director",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "Segment",
          accessor: "segment",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "Sub-Segment",
          accessor: "subsegment",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "CTS",
          accessor: "bc_cts",
          Cell: ({ value }) => <div>{value ? BC_CTS?.[value] : "-"}</div>,
          sortDescFirst: false,
          sortType: (rowA, rowB, columnId) => {
            const a = BC_CTS?.[rowA.values[columnId]] || "";
            const b = BC_CTS?.[rowB.values[columnId]] || "";
            return a.localeCompare(b); // Ensures proper string sorting
          },
        },
        {
          Header: "Division",
          accessor: "division",
          Cell: ({ value }) => <div>{value ? value : "-"}</div>,
        },
        {
          Header: () => (
            <span>
              Contract
              <div className="nospace">Start & End</div>
            </span>
          ),
          accessor: "contract_dates",
          Cell: ({ row }) => {
            const { deals } = row.original;
            return (
              <>
                <div className="contract_dates">
                  <p className="contract_start">{row.original.contract_start}</p>
                  <div className="d-flex justify-contnt-end">
                    <img src={ContractArrow} />
                    <p className="contract_end">{row.original.contract_end}</p>
                  </div>
                </div>
              </>
            );
          },
          sortDescFirst: false,
          sortType: (rowA, rowB, columnId) => {
            const a = rowA.original.contract_start;
            const b = rowB.original.contract_start;
            return a.localeCompare(b); // Ensures proper string sorting
          },
        },
        {
          Header: "Volume Annually",
          accessor: "volume_annually",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "Price CAP",
          accessor: "price_cap",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "Deal Status",
          accessor: "deal_status",
          Cell: ({ row, value }) => {
            const deal_status = parseInt(value);
            return (
              <>
                <span onClick={() => { setExpandedRowId(row.id === expandedRowId ? null : row.id) }}>
                  <DealStatus deal_status={deal_status} visited_users={row?.original?.visited_users ? row?.original?.visited_users : []} />
                </span>
              </>
            );
          },
        },
        {
          Header: "Notes",
          Cell: ({ row }) => (
            <NotesIcon
              handleClick={() => {
                setShowRightPanel(true);

                setNotesModal(true)
                currentNoteDealId.current = row.original.deal_id
              }}
              count={row.original.notes_count}
            />
          ),
        },
      ];

      if (!userFromSession?.user_data?.is_super_admin) {

        const canSeeActions = dealPermissions?.Archive?.edit || dealPermissions?.Clone?.edit || dealPermissions?.Modify?.edit || dealPermissions?.View?.edit;

        if (canSeeActions) {
          const additionalColumn = {
            Header: "Actions",
            Cell: ({ row }) => {
              const rowIndex = row.index; // Get the index of the current row
              return (
                <div
                  className="d-flex justify-content-center align-items-center col-gap-5"
                  key={rowIndex}
                  ref={(el) => (actionRefs.current[rowIndex] = el)} // Store ref for each row
                >
                  <div className="col">
                    <DealListAction
                      rowIndex={rowIndex}
                      row={row}
                      isOpen={openDropdownIndex === rowIndex}
                      onToggle={handleDropdownToggle}
                      onSend={handleSendDeal}
                      onClone={handleCloneDeal}
                      onShowAmendmentQuestions={props?.onShowAmendmentQuestions}
                      onSendEmail={handleSendEmailOption}
                    />
                  </div>
                </div>
              );
            },
          };
          baseColumns.push(additionalColumn);
        }

        const productionColumn = {
          Header: "Production",
          accessor: "production_flag",
          Cell: ({ row }) => {
            const canChange = row.original.deal_status !== 2 && row.original.customer_status === 0 && row.original.deal_created_by === userFromSession?.user_data?.user_id;
            const isProduction = row.original.production_flag == 1 ? true : false;
            return (
              <span className="d-flex justify-content-center align-items-center" data-tooltip-id="my-tooltip">
                <ToggleSwitch disabled={!canChange || isProduction} isOn={row.original.production_flag == 1 ? true : false} handleToggle={() => handleProductionToggle(row.original.deal_id, !row.original.production_flag)} />
              </span>
            )
          },
        };

        baseColumns.splice(baseColumns.length - 1, 0, productionColumn);
      }
      return baseColumns;
    } else {
      return [
        {
          Header: "Deal Version",
          accessor: "deal_name",
          Cell: ({ value }) => {
            return (
              <>
                {value !== null && value !== "" ? (
                  <div className="d-flex align-items-center customer-list-deal-names">
                    <p>{value || "-"}</p>
                  </div>
                ) : (
                  "-"
                )}
              </>
            );
          },
        },
        {
          Header: "Contract Start",
          accessor: "contract_start",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "Contract Expiration",
          accessor: "contract_end",
          Cell: ({ value }) => (value ? value : "-"),
        },
        {
          Header: "Term",
          accessor: "term",
          Cell: ({ value }) => <div>{value ? DEAL_TERMS?.[value] : "-"}</div>,
        },
        {
          Header: "Deal Status",
          accessor: "deal_status",
          Cell: ({ row, value }) => {
            const deal_status = parseInt(value);
            return (
              <>
                <span onClick={() => { setExpandedRowId(row.id === expandedRowId ? null : row.id) }}>
                  <DealStatus deal_status={deal_status} visited_users={row?.original?.visited_users ? row?.original?.visited_users : []} />
                </span>
              </>
            );
          },
        },
        // {
        //   Header: "Status",
        //   accessor: "deal_status",
        //   Cell: ({ value }) => {
        //     const deal_status = parseInt(value);
        //     return (
        //       <>
        //         <span className="nospace" data-tooltip-id="my-tooltip" data-tooltip-content={`${deal_status === 2 ? "Completed" : "Pending"}`}>
        //           {deal_status === 2 ? (
        //             <>
        //               <img src={completedStatus} className="mr_4" />
        //               Completed
        //             </>
        //           ) : (
        //             <>
        //               <img src={pendingStatus} className="mr_4" />
        //               Pending
        //             </>
        //           )}
        //         </span>
        //       </>
        //     );
        //   },
        // },
      ];
    }
  }, [openDropdownIndex, handleSendDeal, handleSendEmailOption]);

  // Add handleDropdownToggle function
  const handleDropdownToggle = (index) => {
    setOpenDropdownIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  async function handleProductionToggle(id, flag) {
    // Swal.fire({
    //   title: `Are you sure you want to set this deal as production?`,
    //   icon: "primary",
    //   showCancelButton: true,
    //   confirmButtonText: "Yes",
    //   cancelButtonText: "No",
    //   customClass: {
    //     confirmButton: "btn btn-info",
    //     cancelButton: "btn btn-secondary",
    //   },
    //   buttonsStyling: true,
    // }).then(async (result) => {
    //   if (result.isConfirmed) {
    //     try {
    //       const response = await dispatch(toggleDealFlags({ id, flag }));
    //       if (response?.error) {
    //         toast.error(response?.payload?.detail);
    //       } else {
    //         toast.success(response?.payload?.message);
    //         setRerender(prev => !prev);
    //       }
    //     } catch (err) {
    //       toast.error("There was an error submitting the form. Please try again.");
    //     }
    //   }
    // });

    let data = {
      deal_id: id,
      toggle_key: "production",
      production_flag: flag
    }
    let result = await dispatch(toggleDealFlags(data));
    return
    if (result?.error) {
      toast.error(result?.payload?.detail);
    } else {
      toast.success(result?.payload?.message);
      setRerender(prev => !prev);
    }
  }

  return (
    <>
      <DealsTableView
        customerScreen={!!props?.customerPage}
        customerId={props?.customer?.id || null}
        allowNewDeal={!userFromSession?.user_data?.is_super_admin && props?.customer?.status === 0}
        deal_status_detail={{ expandedRowId: expandedRowId, customRef: expandedRowRef }}
        data={flattenedData}
        user={userFromSession}
        columns={columns}
        loading={loading}
      />
      {notesModal && (
        <NotesPanel
          customRef={notesPanelRef}
          deal={(() => { return flattenedData.find(deal => deal.deal_id === currentNoteDealId.current) })()}
          handleBack={() => {
            setNotesModal(false);
            setShowRightPanel(false);
          }}
        />
      )}
      {communicationModal &&
        <CommunicationForm
          closeModal={() => setCommunicationModal(false)}
          deal_id={currentNoteDealId.current}
          triggerRerender={() => setRerender(prev => !prev)}
        />}

      {/* Clone Deal Modal */}
      <CloneDealModal
        show={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        originalDealId={cloneDealData.dealId}
        originalDealName={cloneDealData.dealName}
      />
      <SendDealEmailModal
        show={showSendEmailModal}
        onClose={closeSendEmailModal}
        dealId={sendEmailDeal.id}
        dealName={sendEmailDeal.name}
      />
    </>
  );
};

export default DealsTable;

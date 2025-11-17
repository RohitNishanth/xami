import React, { useMemo, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import editIcon from "../../../assets/images/edit_icon.svg";
import deleteIcon from "../../../assets/images/delete_icon.svg";
import ToggleSwitch from "../../../components/toggleSwitch/toggleSwitch";
import moment from "moment";
import {
  deleteNap,
  fetchNap,
  fetchNapById,
  updateNap,
} from "../../../features/nap/napSlice";
import { useDispatch } from "react-redux";
import TableView from "../../../components/Table/TableView";
import Modal from "../../../components/modalPopup/Modal";
import NapForm from "./NapForm";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Loading from "../../../components/Loading/Loading";

const NapTable = (props) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const dispatch = useDispatch();
  const functionRef = useRef();

  const userFromSession = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = userFromSession?.user_data?.is_super_admin;
  const lookupPermissions = userFromSession?.user_data?.custom_permissions?.["Lookups"] || {};
  const napPermission = lookupPermissions?.["NAP"] || lookupPermissions?.["Volume"];
  const hasEditAccess = napPermission?.edit === true;
  const canEditOrDelete = isSuperAdmin || hasEditAccess;

  useEffect(() => {
    const searchData = (searchValue) => {
      const normalized = (searchValue || "").toLowerCase();
      const result =
        data.length &&
        data.filter(
          (item) =>
            item.name.toLowerCase().includes(normalized) ||
            item.schedule?.toLowerCase().includes(normalized)
        );
      setFilteredData(result || []);
    };

    functionRef.current = {
      ...functionRef.current,
      searchData,
    };
    searchData(search);
  }, [search, data]);

  useEffect(() => {
    setSearch(props?.search);
  }, [props?.search]);

  useEffect(() => {
    const fetchNapConfigs = async () => {
      try {
        const response = await dispatch(fetchNap());
        setData(response?.payload || []);
        setFilteredData(response?.payload || []);
        functionRef.current?.searchData(search);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    functionRef.current = {
      ...functionRef.current,
      fetchNapConfigs,
    };
    fetchNapConfigs();
  }, [dispatch]);

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) =>
          canEditOrDelete ? (
            <div>
              <Link onClick={() => handleEdit(row.original.id)}>
                {row.original.name}
              </Link>
            </div>
          ) : (
            <div>{row.original.name}</div>
          ),
      },
      {
        Header: "Schedule",
        accessor: "schedule",
        Cell: ({ row }) => <div>{row.original.schedule}</div>,
      },
      {
        Header: "Created On",
        accessor: "created_at",
        Cell: ({ row }) => (
          <div>
            {moment(row.original.created_at, "MM/DD/YYYY hh:mm A").format("MM/DD/YYYY hh:mm A")}
          </div>
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row }) => (
          <>
            <span
              data-tooltip-id="my-tooltip"
              data-tooltip-content={`Click to ${
                row.original.status === 1 ? "Activate" : "Deactivate"
              }`}
            >
              <ToggleSwitch
                isOn={row.original.status === 0}
                handleToggle={() => handleToggle(row.original.id, row.original.status)}
                disabled={!canEditOrDelete}
              />
            </span>
          </>
        ),
      },
      ...(canEditOrDelete
        ? [
            {
              Header: "Actions",
              Cell: ({ row }) => (
                <div className="actionCell">
                  <button
                    className="btn btn-link p-0"
                    onClick={() => handleEdit(row.original.id)}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Edit"
                  >
                    <img src={editIcon} />
                  </button>
                  <button
                    className="btn btn-link p-0"
                    onClick={() => handleDelete(row.original.id)}
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="Delete"
                  >
                    <img src={deleteIcon} />
                  </button>
                </div>
              ),
            },
          ]
        : []),
    ],
    [canEditOrDelete]
  );

  const [initialValues, setInitialValues] = useState({});
  const handleEdit = async (napId) => {
    try {
      const response = await dispatch(fetchNapById({ id: napId }));
      if (response?.error) {
        toast.error(response?.payload?.detail);
        return;
      }
      setInitialValues({
        nap_name: response?.payload?.name,
        schedule: response?.payload?.schedule,
        id: response?.payload?.id,
      });
      setModalTitle("Edit NAP");
      setShowPopup(true);
    } catch (err) {
      setError("Failed to load NAP details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure you want to delete this NAP?",
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
          const response = await dispatch(deleteNap({ id }));
          if (response?.error) {
            toast.error(response?.payload?.detail);
          } else {
            setData((prevData) => prevData.filter((item) => item.id !== id));
            setFilteredData((prevData) => prevData.filter((item) => item.id !== id));
            Swal.fire("Deleted!", `${response?.payload?.message}`, "success");
          }
        } catch (err) {
          console.error("Error:", err.message);
          Swal.fire("Error!", "An unexpected error occurred.", "error");
        }
      }
    });
  };

  const handleToggle = async (id, status) => {
    try {
      const newStatus = status === 1 ? 0 : 1;
      const response = await dispatch(updateNap({ id, status: newStatus }));
      if (response?.error) {
        toast.error(response?.payload?.detail);
        return false;
      }

      toast.success(response?.payload?.message);

      setData((prevData) =>
        prevData.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      setFilteredData((prevData) =>
        prevData.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } catch (err) {
      console.error("Failed to toggle the NAP", err);
    }
  };

  const [modalTitle, setModalTitle] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    setShowPopup(props?.openModal);
    setModalTitle("Add NAP");
  }, [props?.openModal]);

  const closePopupWindow = (action = "") => {
    setShowPopup(false);
    props.closeModalPopup(action === "completed");
    setInitialValues({});

    if (action === "completed" && functionRef.current?.fetchNapConfigs) {
      functionRef.current.fetchNapConfigs();
    }
  };

  if (loading) return <Loading />;

  return (
    <>
      <div className="row mt_30 wow fadeIn">
        <div className="col-md-12">
          <TableView data={filteredData} columns={columns} loading={loading} />
        </div>
      </div>
      <Modal show={showPopup} onClose={closePopupWindow} title={modalTitle}>
        <NapForm closeForm={closePopupWindow} initial={initialValues} />
      </Modal>
    </>
  );
};

export default NapTable;

import React, { useEffect, useState } from "react";
import NapTable from "./NapTable";

const NapTabView = (props) => {
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    setShowPopup(props?.openModal);
  }, [props?.openModal]);

  const closePopupWindow = (resetSearch = false) => {
    props.setClosePopup(resetSearch);
  };

  return (
    <>
      <NapTable
        search={props?.search}
        openModal={showPopup}
        closeModalPopup={closePopupWindow}
      />
    </>
  );
};

export default NapTabView;

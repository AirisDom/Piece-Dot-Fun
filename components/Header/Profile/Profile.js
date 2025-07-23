import React, { useState } from "react";
import { truncate } from "../../../utils/truncate";
import { ToastContainer, toast } from "react-toastify";
import { useProgramState } from "@/hooks/useProgram";

//styles
import "react-toastify/dist/ReactToastify.css";
import styles from "./Profile.module.scss";

//functions
import { truncateWallet } from "@/utils/truncate";

//Toast
import Toast from "@/components/Toast";

export default function Profile(props) {
  const { avatar, userAddress } = props;
  const { userAccount, hasUserAccount } = useProgramState();
  //console.log("userAccount.firstName", userAccount.firstName + " " + userAccount.secondName);
  //const notify = () => Toast.showNotification("Wallet copied to clipboard");
  const valueText = `Wallet copied to clipboard`;
  const [showToast, setShowToast] = useState(false);

  return (
    //Clipboard COPY
    <div
      className={styles.header_profile_click}
      onClick={() => {
        if (userAddress) {
          navigator.clipboard.writeText(userAddress);
          setShowToast(true);
        }
      }}
    >
      {/* Imagen de perfil */}
      <div className={styles.header_profile}>
        <img src={avatar} alt="post" />
      </div>
      {/* Address de perfil */}

      <div className={styles.header_profile_wallet}>
        {hasUserAccount ? (
          <>
            <p>{userAccount.firstName}</p>
          </>
        ) : (
          <></>
        )}
      </div>

      <Toast
        showToast={showToast}
        setShowToast={setShowToast}
        text={valueText}
      />
    </div>
  );
}

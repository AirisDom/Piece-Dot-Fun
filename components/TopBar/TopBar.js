import React from "react";

//Hoocks
import { useProfile } from "@/hooks/useProfile";
import { useProgramState } from "@/hooks/useProgram";

//styles
import styles from "./TopBar.module.scss";

//functions
import { truncateWallet } from "@/utils/truncate";

export default function TopBar() {
  const { connected, publicKey, avatar, setAvatar, userAddress } = useProfile();
  const { userAccount, hasUserAccount } = useProgramState();

  return (
    <>
      <div className={styles.topBar_wrapper}>
        {hasUserAccount ? (
          <>
            <h3>Hola, {userAccount.firstName + " " + userAccount.secondName + " " + userAccount.firstLastName + " " + userAccount.secondLastName}</h3>
          </>
        ) : (
          <></>
        )}
        <h2>WELCOME !</h2>
      </div>
    </>
  );
}

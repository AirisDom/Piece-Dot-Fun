import React from "react";

import styles from "./TokensDeposit.module.scss";

export default function TokensDeposit() {
  return (
    <div className={styles.tokeDepositWrapper}>
      <div className={styles.tokeDeposit_title}>
        <h3>Tokens Deposits</h3>
      </div>
      <div className={styles.tokeDeposit_logs}>
        <h3>Logs</h3>
      </div>
    </div>
  );
}

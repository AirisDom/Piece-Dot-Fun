import { useProfile } from "@/hooks/useProfile";
import { useProgramState } from "@/hooks/useProgram";
import { serverRuntimeConfig } from "@/next.config";
import UtilsUser from "@/utils/web3/User/UtilsUser";
import { map } from "lodash";
import React, { useEffect, useState } from "react";
import styles from "./MyTxs.module.scss";

export default function MyTxs() {
  const { connected, publicKey, avatar, setAvatar, userAddress } = useProfile();
  const {
    transactions,
    updateTransaction,
    marketTransactions,
    updateMarketTransaction,
    balances,
  } = useProgramState();

  const [userTransactions, setUserTransactions] = useState([]);
  const [userBalances, setUserBalances] = useState([]);
  const [userMarketTransactions, setUserMarketTransactions] = useState([]);
  const [userSumBalances, setUserSumBalances] = useState([]);
  const [userSumTransactions, setUserSumTransactions] = useState([]);
  const [userSumMarketTransactions, setUserSumMarketTransactions] = useState(
    []
  );
  const [userRealAccountBalance, setUserRealAccountBalance] = useState([]);

  const [userFilteredTransactions, setUserFilteredTransactions] =
    useState(null);
  const [userFilteredMarketTransactions, setUserFilteredMarketTransactions] =
    useState(null);
  const [userFilteredBalances, setUserFilteredBalances] = useState(null);

  const TRANSACTION_TYPES = ["Fondeo", "Compras", "Ventas"];
  const TRANSACTION_STATUS = {
    Fondeo: ["Todas", "Ingresos", "Retiros"],
    Compras: ["Todas", "Solicitadas", "Entregadas"],
    Ventas: ["Todas", "Aceptadas", "Entregadas"],
  };
  const TRANSACTION_PERIODS = ["todas", "últimos 7 días", "últimos 30 días"];

  const [selectedType, setSelectedType] = useState(TRANSACTION_TYPES[0]);
  const [selectedStatus, setSelectedStatus] = useState(
    TRANSACTION_STATUS.Fondeo[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState(TRANSACTION_PERIODS[0]);

  useEffect(() => {}, [userAddress]);

  useEffect(() => {
    const {
      userBalances,
      sumBalancesAmount,
      userTransactions,
      sumTransactionsAmount,
      userMarketTransactions,
      sumUserMarketTransactions,
      accountRealBalance,
    } = UtilsUser.getAccountTxsByWallet(
      transactions,
      marketTransactions,
      balances,
      userAddress
    );

    if (userBalances) setUserBalances(userBalances);
    if (sumBalancesAmount) setUserSumBalances(sumBalancesAmount);
    if (userTransactions) setUserTransactions(userTransactions);
    if (sumTransactionsAmount) setUserSumTransactions(sumTransactionsAmount);
    if (userMarketTransactions)
      setUserMarketTransactions(userMarketTransactions);
    if (sumUserMarketTransactions)
      setUserSumMarketTransactions(sumUserMarketTransactions);
    if (setUserRealAccountBalance)
      setUserRealAccountBalance(accountRealBalance);

    setUserFilteredBalances(null);
    setUserFilteredTransactions(null);
    setUserFilteredMarketTransactions(null);

    if (selectedType.toString() === "Fondeo") {
      const data = UtilsUser.filterBalanceByParams(
        userBalances,
        selectedStatus,
        selectedPeriod
      );
      console.log(`para ${selectedStatus} se tiene ${JSON.stringify(data)}`);
      setUserFilteredBalances(data);
    } else if (selectedType.toString() === "Compras") {
      const data = UtilsUser.filterTransactionsByParams(
        transactions,
        userTransactions,
        selectedStatus,
        selectedPeriod
      );
      console.log(`para ${selectedStatus} se tiene ${JSON.stringify(data)}`);
      setUserFilteredTransactions(data);
    } else if (selectedType.toString() === "Ventas") {
      const data = UtilsUser.filterMarketTransactionsByParams(
        transactions,
        userMarketTransactions,
        selectedStatus,
        selectedPeriod
      );

      console.log(`para ${selectedStatus} se tiene ${JSON.stringify(data)}`);
      setUserFilteredMarketTransactions(data);
    }
  }, [userAddress, selectedType, selectedStatus, selectedPeriod]);

  return (
    <>
      <div className={styles.myTxs_wrapper}>
        <div className={styles.myTxs_selector}>
          <select onChange={(e) => setSelectedType(e.target.value)}>
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select onChange={(e) => setSelectedStatus(e.target.value)}>
            {TRANSACTION_STATUS[selectedType].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select onChange={(e) => setSelectedPeriod(e.target.value)}>
            {TRANSACTION_PERIODS.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.myTxs_info_wrapper}>
          {userFilteredBalances &&
            map(userFilteredBalances, (transaction) => (
              <div key={transaction.id} className={styles.myTxs_info}>
                <p>-Date: {transaction.timestamp}</p>
                <p>
                  {transaction.tp == "1"
                    ? "Funded Amount:"
                    : "Withdrawal Amount: "}{" "}
                  ${transaction.amount}
                </p>
                <p>- Funded Account: {transaction.owner.toString()}</p>
              </div>
            ))}

          {userFilteredTransactions &&
            map(userFilteredTransactions, (transaction) => (
              <div key={transaction.id} className={styles.myTxs_info}>
                <p>- Seller: {transaction.rx}</p>
                <p>- Buyer: {transaction.tx}</p>
                <p>- Amount: ${transaction.amount}</p>
                {/* <p>- Productos: {JSON.stringify(transaction.items.substring(0, transaction.items.indexOf("#") + 2))}</p> */}
                <p>- Products: {transaction.items}</p>
              </div>
            ))}

          {userFilteredMarketTransactions &&
            map(userFilteredMarketTransactions, (transaction) => (
              <div key={transaction.id} className={styles.myTxs_info}>
                <p>- Client: {transaction.client}</p>
                <p>- Amount: ${transaction.tamountx}</p>
                <p>- Products: {transaction.items}</p>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

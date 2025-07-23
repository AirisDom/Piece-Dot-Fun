import Header from "../../components/Header/";

//Hoocks
import { useProfile } from "@/hooks/useProfile";

//styles
import styles from "./MainLayout.module.scss";
import TopBar from "@/components/TopBar/TopBar";
import { useUserContext } from "@/hooks/useUserProgram";
import { useProgramState } from "@/hooks/useProgram";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UtilsUser from "@/utils/web3/User/UtilsUser";

export default function MainLayout(props) {
  const { children } = props;
  const router = useRouter();
  const { userAddress } = useProfile();
  const { isConnected, hasUserAccount } = useUserContext();
  const { transactions, marketTransactions, balances } = useProgramState();

  const [userTransactions, setUserTransactions] = useState([]);
  const [userBalances, setUserBalances] = useState([]);
  const [userMarketTransactions, setUserMarketTransactions] = useState([]);
  const [userSumBalances, setUserSumBalances] = useState([]);
  const [userSumTransactions, setUserSumTransactions] = useState([]);
  const [userSumMarketTransactions, setUserSumMarketTransactions] = useState(
    []
  );
  const [userRealAccountBalance, setUserRealAccountBalance] = useState([]);

  // useEffect(() => {
  //   if (!hasUserAccount) {
  //     const timer = setTimeout(() => {
  //       router.replace("/myAccount");
  //     }, 2000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [hasUserAccount, userAddress]);

  useEffect(() => {
    if (transactions && marketTransactions && balances) {
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

      console.log(`userBalances: `, userBalances);
      console.log(`sumBalancesAmount: `, sumBalancesAmount);
      console.log(`userTransactions: `, userTransactions);
      console.log(`sumTransactionsAmount: `, sumTransactionsAmount);
      console.log(`userMarketTransactions: `, userMarketTransactions);
      console.log(`sumUserMarketTransactions: `, sumUserMarketTransactions);
      console.log(`accountRealBalance: `, accountRealBalance);

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

      console.log(accountRealBalance);
    }
  }, [userAddress, router, isConnected, userRealAccountBalance]);

  return (
    <div className={styles.main_layout}>
      <Header userRealAccountBalance={userRealAccountBalance} />

      <div className={styles.main}>
        {userAddress && (
          <>
            <TopBar />
            <div className={styles.main_content}>{children}</div>
          </>
        )}

        {!userAddress && <>Sin conectarse</>}
      </div>
    </div>
  );
}

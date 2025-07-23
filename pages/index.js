//Layout
import MainLayout from "../layouts/MainLayout/";
import CreateUserModal from "@/components/modals/CreateUserModal";
import CreatePostModal from "@/components/modals/CreatePostModal";
//components
//hooks
import { useProfile } from "@/hooks/useProfile";
import { useProgramState } from "@/hooks/useProgram";
import { useEffect, useState } from "react";
import styles from "./index.module.scss";
import { useUserContext } from "@/hooks/useUserProgram";
import { useRouter } from "next/router";
import UtilsUser from "@/utils/web3/User/UtilsUser";
const image =
  "https://scontent-qro1-2.xx.fbcdn.net/v/t39.30808-6/339736635_1417065962458765_7019775077283824177_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=0debeb&_nc_eui2=AeH7RL2bHtgS4KFh-IDWo18KhmHk2uTfvpeGYeTa5N--l1ar8-HuYbh0T11yPgwXg2KQiiQQivzJ7g_Ewv0djQu_&_nc_ohc=E47koFW36aMAX-mglJ0&_nc_ht=scontent-qro1-2.xx&oh=00_AfCiKfnUo1Ra90pSkqIVSJl02y9EQfOrgkgVgp9xk9hAqw&oe=643F0E85";

export default function Home() {
  //La imagen vendra del SmartContract
  const { userAddress } = useProfile();
  //const { posts } = useProgramState();
  //console.log(posts);

  const staticCreateUser = () => {
    console.log(`Creating User!!`);
  };

  const staticCreatePost = () => {
    console.log(`Creating Post!!`);
  };
  //To define
  const wallet = "111111111111111111";

  const { isConnected, hasUserAccount } = useUserContext();
  const router = useRouter();
  const { transactions, marketTransactions, balances } = useProgramState();
  const [userRealAccountBalance, setUserRealAccountBalance] = useState([]);

  useEffect(() => {
    if (transactions && marketTransactions && balances) {
      const { accountRealBalance } = UtilsUser.getAccountTxsByWallet(
        transactions,
        marketTransactions,
        balances,
        userAddress
      );

      if (setUserRealAccountBalance)
        setUserRealAccountBalance(accountRealBalance);

      console.log(accountRealBalance);
    }
  }, [
    userAddress,
    router,
    isConnected,
    userRealAccountBalance,
    transactions,
    balances,
    marketTransactions,
  ]);

  return (
    <>
      <MainLayout userRealAccountBalance={userRealAccountBalance}>
        <div className={styles.principal_wrapper}>
          <a>Considerations for testing the MVP</a>
          <p>- Reload the page when registerings </p>
          <p>- Requests to anchor or withdraw take a while </p>
          <p>
          - If the funding/payment in cart and withdrawal requests take more than 2 minutes, it is because the backend went into hibernation and takes that long to reactivate, this is due to the free version of the host
          </p>
          <p>
          - The TDC at anchor is dummy, use 4242 4242 4242 42... Until your finger gets tired


          </p>

          <a>In case you like to see the token at: </a>
          <p>
            https://translator.shyft.to/address/HJXP1SjT3w1NzmAjq7z5hUMicf4qYPcdiZvFmpECpv92?cluster=devnet
          </p>
        </div>
      </MainLayout>
    </>
  );
}

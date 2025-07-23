//To use our Context
import { createContext, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getUserAccountPk } from "@/utils/getUserAccount";
import { useProgramState } from "./useProgramState";

//Context
export const SmartProgramUserContext = createContext({
  isConnected: null,
  wallet: null,
  hasUserAccount: null,
});

export const UserContext = ({ children }) => {
  const [isConnected, setIsConnected] = useState(); //To check connection
  const [userAccount, setUserAccount] = useState(); //Save user account to fetch
  const wallet = useAnchorWallet();
  const program = useProgramState();

  //1- Check wallet connection
  useEffect(() => {
    setIsConnected(!!wallet?.publicKey); //True or false
  }, [wallet]);

  //2- Check for a user account by fetching the user
  const fetchUserAccount = useCallback(async () => {
    //console.log("Here the program can be read : ", program);
    //UseCallback is like useEffect but not going to re-render unless the dependency is changed, not re-render all our props
    if (!program) {
      //console.log("Program not got it");
      return;
    }
    try {
      //Passing the seeds
      const userAccountPk = await getUserAccountPk(wallet?.publicKey);
      //console.log(userAccountPk);
      const userAccount = await program.account.user.fetch(userAccountPk);
      //console.log("User found!");
      setUserAccount(userAccount);
    } catch (e) {
      setUserAccount(null);
      console.log("No user found!");
    }
  });
  //3- Check for user account
  useEffect(() => {
    fetchUserAccount();
  }, [isConnected]);

  return (
    <SmartProgramUserContext.Provider
      value={{
        isConnected,
        wallet,
        hasUserAccount: userAccount ? true : false, //If there is a user account it shoul be true
      }}
    >
      {children}
    </SmartProgramUserContext.Provider>
  );
};

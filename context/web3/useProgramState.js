// useProgramState.js
import { useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { getProgram } from "@/utils/getProgramIdl";

export const useProgramState = () => {
  const [program, setProgram] = useState(); //Get the program and set it in our state to use anywhere
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  //console.log("THIS IS MY PROGRAM temp: ", program);

  // Set SmartContract
  useEffect(() => {
    // Run when on create, on upload, or on delete of a component
    if (connection) {
      setProgram(getProgram(connection, wallet ?? {})); // Access to the program, if no wallet, ?? {} return empty
    } else {
      setProgram(null);
    }
  }, [connection, wallet]); // if [] will run when the page first loads, [connection] when connection

  return program;
};

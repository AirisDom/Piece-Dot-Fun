import { useContext } from "react";

import { SmartProgramContext } from "../context/SmartContractContext";

export const useProgramState = () => {
  return useContext(SmartProgramContext);
};

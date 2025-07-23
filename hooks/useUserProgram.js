import { useContext } from "react";

import { SmartProgramUserContext } from "@/context/web3/SmartProgramUserContext";

export const useUserContext = () => {
  return useContext(SmartProgramUserContext);
};

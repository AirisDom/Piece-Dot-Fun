import { useContext } from "react";

import { SmartProgramPostContext } from "@/context/web3/SmartProgramPostContext";

export const usePostContext = () => {
  return useContext(SmartProgramPostContext);
};

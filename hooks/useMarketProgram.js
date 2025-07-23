import { useContext } from "react";

import { SmartProgramMarketContext } from "@/context/web3/SmartProgramMarketContext";

export const useMarketContext = () => {
  return useContext(SmartProgramMarketContext);
};

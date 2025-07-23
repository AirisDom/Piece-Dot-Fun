import { useProgramState } from "./useProgramState";
import { createContext, useCallback, useEffect, useState } from "react";

export const SmartProgramMarketContext = createContext({
  markets: null,
  fetchMarkets: null,
});

export const MarketContext = ({ children }) => {
  const [markets, setMarket] = useState();
  const program = useProgramState();

  const fetchMarket = useCallback(async () => {
    if (!program) return;
    const fetchedMarket = await program.account.market.all();
    setMarket(fetchedMarket.map((market) => market.account));
  }, [program]);

  useEffect(() => {
    if (!markets) {
      fetchMarket();
    }
  }, [markets, fetchMarket]);

  return (
    <SmartProgramMarketContext.Provider
      value={{
        markets,
        fetchMarket,
      }}
    >
      {children}
    </SmartProgramMarketContext.Provider>
  );
};

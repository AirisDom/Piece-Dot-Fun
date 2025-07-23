import { useProgramState } from "./useProgramState";
import { createContext, useCallback, useEffect, useState } from "react";
import { getMarketAccountPk } from "@/utils/getMarketAccount";

export const MarketContext = createContext({
  markets: null,
  loading: false,
  error: null,
  fetchMarkets: null,
  fetchMarketByOwner: null,
  selectedMarket: null,
  createMarket: null,
  updateMarket: null,
  deleteMarket: null,
});

export const MarketProvider = ({ children }) => {
  const [markets, setMarkets] = useState();
  const [selectedMarket, setSelectedMarket] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const program = useProgramState();

  const fetchMarkets = useCallback(async () => {
    if (!program) return;
    setLoading(true);
    setError(null);
    try {
      const fetchedMarkets = await program.account.market.all();
      setMarkets(fetchedMarkets.map((market) => market.account));
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [program]);

  const fetchMarketByOwner = useCallback(
    async (owner, id) => {
      if (!program || !owner || id === undefined) return;
      setLoading(true);
      setError(null);
      try {
        const pk = await getMarketAccountPk(owner, id);
        const market = await program.account.market.fetch(pk);
        setSelectedMarket(market);
        return market;
      } catch (e) {
        setError(e);
        setSelectedMarket(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [program]
  );

  const createMarket = async (marketData) => {};
  const updateMarket = async (owner, id, updateData) => {};
  const deleteMarket = async (owner, id) => {};

  useEffect(() => {
    if (!markets) {
      fetchMarkets();
    }
  }, [markets, fetchMarkets]);

  return (
    <MarketContext.Provider
      value={{
        markets,
        loading,
        error,
        fetchMarkets,
        fetchMarketByOwner,
        selectedMarket,
        createMarket,
        updateMarket,
        deleteMarket,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

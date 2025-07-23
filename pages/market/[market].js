import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { map, size } from "lodash";

import { useProgramState } from "@/hooks/useProgram";
import { usePostContext } from "@/hooks/usePostProgram";
import { useUserContext } from "@/hooks/useUserProgram";

import MainLayout from "@/layouts/MainLayout/";
import UtilsMarket from "@/utils/web3/Market/UtilsMarket";

import styles from "./market.module.scss";

import MapsMarker from "@/components/Maps/MapsMarker/MapsMarker";
import MarketView from "@/components/Market/MarketView/MarketView";
import MarketProductsView from "@/components/Market/MarketProductsView/MarketProductsView";

import Toast from "@/components/Toast/Toast";

const center = { lat: 19.511567494105133, lng: -99.12669760284929 };

export default function Market() {
  const router = useRouter();
  const [market, setMarket] = useState(undefined);
  const [products, setProducts] = useState(undefined);
  const [viewProducts, setViewProducts] = useState(true);
  const { markets } = useProgramState();
  const { posts } = usePostContext();
  const { isConnected, hasUserAccount } = useUserContext();
  const [showToast, setShowToast] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!hasUserAccount) {
      const timer = setTimeout(() => {
        router.replace("/myAccount");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasUserAccount, router]);

  useEffect(() => {
    async function fetchData() {
      if (markets) {
        const marketData = UtilsMarket.getMarketInfoByHash(
          router.query.market?.toString(),
          markets
        );

        const productsByMarketData = UtilsMarket.getAllProductsByMarketHash(
          router.query.market?.toString(),
          posts
        );

        if (marketData.marketAvailable != "1") {
          const timer = setTimeout(() => {
            console.log("Mercado no disponible");
            router.replace("/markets");
          }, 2000);

          return () => clearTimeout(timer);
        }
        setMarket(marketData);
        setProducts(productsByMarketData);
      }
    }

    if (router.query.market) {
      fetchData();
    }
  }, [router.query.market, markets]);

  if (!market) return null;

  return (
    <>
      <MainLayout>
        <Toast showToast={showToast} setShowToast={setShowToast} text={text} />
        <div>
          <MarketView
            setViewProducts={setViewProducts}
            viewProducts={viewProducts}
          />

          {!viewProducts && (
            <div className={styles.mapsMaker_wrapper}>
              <h3>Ubicacion del mercado</h3>
              <MapsMarker
                lat={parseFloat(market.lat)}
                lng={parseFloat(market.long)}
              />
            </div>
          )}

          {viewProducts && products && size(products) === 0 && (
            <div>
              <h3>
                {`No hay productos en el market de ${router.query.market?.toString()}`}
              </h3>
            </div>
          )}

          {viewProducts && size(products) > 0 && (
            <>
              <MarketProductsView
                products={products}
                market={router.query.market}
              />
            </>
          )}
        </div>
      </MainLayout>
    </>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/dist/client/router";
import MainLayout from "../layouts/MainLayout/";

import FeedMarket from "@/components/Market/Items/FeedMarket/FeedMarket";
import { useProfile } from "@/hooks/useProfile";
import { useProgramState } from "@/hooks/useProgram";
import { usePostContext } from "@/hooks/usePostProgram";
import { useUserContext } from "@/hooks/useUserProgram";
import styles from "./markets.module.scss";
import Toast from "@/components/Toast/Toast";
import MarketsMapView from "@/components/Maps/MarketsMapView";
import { map, size } from "lodash";
import MapsMarker from "@/components/Maps/MapsMarker/MapsMarker";
import UtilsUser from "@/utils/web3/User/UtilsUser";
import UtilsMaps from "@/utils/web3/Maps/UtilsMaps";

export default function markets() {
  const router = useRouter();
  //To define
  const wallet = "111111111111111111";

  const { isConnected, userAddress } = useProfile();
  const { markets, shippings } = useProgramState();
  const { hasUserAccount } = useUserContext();
  const [showToast, setShowToast] = useState(false);
  const [viewMarkets, setViewMarkets] = useState(true);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [filteredMarkets, setFilteredMarkets] = useState(markets);
  const [markerData, setMarkerData] = useState([]);
  const [nullOption, setNullOption] = useState("0");
  const valueText = `Primero debes crear tu cuenta`;

  useEffect(() => {
    if (!hasUserAccount) {
      const timer = setTimeout(() => {
        router.replace("/myAccount");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasUserAccount, router]);

  useEffect(() => {
    if (shippings) {
      const addresses = UtilsUser.getUserAddressesByWallet(
        shippings,
        userAddress
      );
      setUserAddresses(addresses);
      console.log(addresses);
    }
  }, [shippings, userAddress]);

  useEffect(() => {
    if (selectedAddress && markets) {
      const result = UtilsMaps.filtrarPorDistancia(
        markets,
        selectedAddress.lat,
        selectedAddress.long,
        parseInt(selectedDistance)
      );
      if (result) setFilteredMarkets(result);
    }
  }, [selectedAddress, selectedDistance, markets]);

  useEffect(() => {
    if (filteredMarkets) {
      const transformedData = filteredMarkets.map((fmarket) => {
        return {
          title: fmarket.marketName,
          info: `${fmarket.street || ""} ${fmarket.numExt || ""} ${
            fmarket.numInt || ""
          } ${fmarket.colonia || ""} ${fmarket.municipio || ""} ${
            fmarket.state || ""
          } ${fmarket.zip || ""}`,
          lat: parseFloat(fmarket.lat),
          lng: parseFloat(fmarket.long),
          publicKey: fmarket.owner.toString(),
        };
      });

      setMarkerData(transformedData);
    }
  }, [filteredMarkets]);

  const handleAddressChange = (e) => {
    if (!e.target.value) setSelectedAddress(null);

    const selectedId = e.target.value;
    const selected = userAddresses.find(
      (address) => address.id.toString() === selectedId
    );
    setSelectedAddress(selected);
  };

  const handleDistanceChange = (event) => {
    setSelectedDistance(event.target.value);
  };

  return (
    <>
      <MainLayout>
        <MarketsMapView
          setViewMarkets={setViewMarkets}
          viewMarkets={viewMarkets}
        />
        <div className={styles.marketsPage_wrapper}>
          {userAddress ? (
            <>
              {hasUserAccount ? (
                <>
                  {!viewMarkets && (
                    <>
                      {!markets && (
                        <>
                          <h3>Cargando mercados . . .</h3>
                        </>
                      )}

                      {markets && size(markets) === 0 && (
                        <div>
                          <h3>{`No hay markets`}</h3>
                        </div>
                      )}

                      {markets && size(markets) > 0 && (
                        <>
                          {map(markets, (market) => (
                            <FeedMarket
                              data={market}
                              walletKey={wallet?.publicKey}
                              userAddress={userAddress}
                            />
                          ))}
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <></>
              )}
            </>
          ) : (
            <></>
          )}
        </div>

        <div>
          {viewMarkets && (
            <>
              {userAddresses && (
                <>
                  <div className={styles.viewMarkets_wrapper}>
                    <h2>Near Markets view</h2>
                    <div className={styles.viewMarkets_selector_wrapper}>
                      <select type="text" onChange={handleAddressChange}>
                        <option value={null}>Choose an address</option>
                        {map(userAddresses, (address) => (
                          <option
                            key={address.id.toString()}
                            value={address.id.toString()}
                          >
                            {address.label}
                          </option>
                        ))}
                      </select>
                      <select onChange={handleDistanceChange}>
                        <option value={null}>Choose the distance</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                    <div>
                      <UserAddressMenu
                        selectedAddress={selectedAddress}
                        markets={markerData}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <Toast
          showToast={showToast}
          setShowToast={setShowToast}
          text={valueText}
        />
      </MainLayout>
    </>
  );
}

function UserAddressMenu(props) {
  const { selectedAddress, markets } = props;

  if (!selectedAddress) return null;

  return (
    <>
      <div className={styles.viewMarkets_maps_wrapper}>
        <h3>To enter the market just select it on the map</h3>
        <MapsMarker selectedAddress={selectedAddress} markets={markets} />
      </div>
    </>
  );
}

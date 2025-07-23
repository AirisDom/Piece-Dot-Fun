import React, { useState } from "react";
import styles from "./MarketsMapView.module.scss";
import { BiMapPin } from "react-icons/bi";
import { TbMapSearch } from "react-icons/tb";

export default function MarketsMapView(props) {
  const { setViewMarkets } = props;
  const [mapButtonDisabled, setMapButtonDisabled] = useState(true);

  const handleMapButtonClick = () => {
    setViewMarkets(true);
    setMapButtonDisabled(true);
  };

  const handleAllMarketsButtonClick = () => {
    setViewMarkets(false);
    setMapButtonDisabled(false);
  };

  return (
    <div>
      <div className={styles.buttonContainer}>
        <button
          className={styles.button}
          onClick={handleMapButtonClick}
          disabled={mapButtonDisabled}
        >
          <BiMapPin size={50} />
          <a>Near Markets</a>
        </button>
        <button
          className={styles.button}
          onClick={handleAllMarketsButtonClick}
          disabled={!mapButtonDisabled}
        >
          <TbMapSearch size={50} />
          <a>All Markets</a>
        </button>
      </div>
    </div>
  );
}

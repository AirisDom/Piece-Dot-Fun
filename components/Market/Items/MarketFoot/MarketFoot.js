import React, { useEffect, useState } from "react";
import styles from "../../ItemFoot.module.scss";

export default function MarketFoot(props) {
  const {
    marketName,
    marketFocusesOn,
    marketAvailable,
    email,
    state,
    municipio,
    colonia,
    zip,
    numExt,
    numInt,
    numberPhone,
    lat,
    long,
  } = props;
  const [randomItemNumber, setRandomItemNumber] = useState(0);
  useEffect(() => {
    setRandomItemNumber(Math.floor(Math.random() * 100));
  }, []);

  return (
    <div className={styles.item_foot_wrapper}>
      <p className={styles.item_foot_product_available}>
        {" "}
        {marketAvailable == 1 ? "AVAILABLE" : ""}
      </p>
      <p className={styles.item_foot_product_not_available}>
        {" "}
        {marketAvailable != 1 ? "UNAVAILABLE" : ""}
      </p>
      <p className={styles.item_foot_market_p}>
        Giro: <a className={styles.item_foot_market_a}>{marketFocusesOn}</a>
      </p>
      <p className={styles.item_foot_market_p}>
        State: <a className={styles.item_foot_market_a}>{state}</a>
      </p>
      {/* <p>Municipio: {municipio}</p>
      <p>Colonia: {colonia}</p>
      <p>zip: {zip}</p>
      <p>numExt: {numExt}</p>
      <p>numInt: {numInt}</p> */}
      <p className={styles.item_foot_market_p}>
        Telephone number:{" "}
        <a className={styles.item_foot_market_a}>{numberPhone}</a>
      </p>
      <p className={styles.item_foot_market_p}>
        Email: <a className={styles.item_foot_market_a}>{email}</a>
      </p>
      {/* <p>lat: {lat}</p>
      <p>long: {long}</p> */}
      {/* <p className={styles.available_units}>
        Unidades disponibles: {randomItemNumber}
      </p> */}
    </div>
  );
}

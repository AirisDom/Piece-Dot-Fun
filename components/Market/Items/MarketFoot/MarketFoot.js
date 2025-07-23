import React, { useEffect, useState } from "react";
import styles from "../../ItemFoot.module.scss";

export default function MarketFoot({ market }) {
  const [randomItemNumber, setRandomItemNumber] = useState(0);
  useEffect(() => {
    setRandomItemNumber(Math.floor(Math.random() * 100));
  }, []);

  return (
    <div className={styles.item_foot_wrapper}>
      <p className={styles.item_foot_product_available}>
        {market.marketAvailable == 1 ? "AVAILABLE" : ""}
      </p>
      <p className={styles.item_foot_product_not_available}>
        {market.marketAvailable != 1 ? "UNAVAILABLE" : ""}
      </p>
      <p className={styles.item_foot_market_p}>
        Giro:{" "}
        <a className={styles.item_foot_market_a}>{market.marketFocusesOn}</a>
      </p>
      <p className={styles.item_foot_market_p}>
        State: <a className={styles.item_foot_market_a}>{market.state}</a>
      </p>
      <p className={styles.item_foot_market_p}>
        Telephone number:{" "}
        <a className={styles.item_foot_market_a}>{market.numberPhone}</a>
      </p>
      <p className={styles.item_foot_market_p}>
        Email: <a className={styles.item_foot_market_a}>{market.email}</a>
      </p>
      {/* New fields */}
      <p className={styles.item_foot_market_p}>
        Created At:{" "}
        <a className={styles.item_foot_market_a}>{market.createdAt}</a>
      </p>
      <p className={styles.item_foot_market_p}>
        Rating: <a className={styles.item_foot_market_a}>{market.rating} / 5</a>
      </p>
      {/* <p>Municipio: {market.municipio}</p>
      <p>Colonia: {market.colonia}</p>
      <p>zip: {market.zip}</p>
      <p>numExt: {market.numExt}</p>
      <p>numInt: {market.numInt}</p> */}
      {/* <p>lat: {market.lat}</p>
      <p>long: {market.long}</p> */}
      {/* <p className={styles.available_units}>
        Unidades disponibles: {randomItemNumber}
      </p> */}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import styles from "../../ItemFoot.module.scss";

export default function ItemFoot(props) {
  const { title, description, price, priceOffer, available } = props;
  const [randomItemNumber, setRandomItemNumber] = useState(0);
  useEffect(() => {
    setRandomItemNumber(Math.floor(Math.random() * 100));
  }, []);

  return (
    <div className={styles.item_foot_wrapper}>
      <p>{description}</p>
      <p className={styles.item_foot_product_price}>${price}</p>
      <p>${priceOffer} </p>

      <p className={styles.item_foot_product_available}>
        {" "}
        {available == 1 ? "AVAILABLE" : ""}
      </p>
      <p className={styles.item_foot_product_not_available}>
        {" "}
        {available != 1 ? "UNAVAILABLE" : ""}
      </p>
      {/* <p className={styles.available_units}>
        Unidades disponibles: {randomItemNumber}
      </p> */}
    </div>
  );
}

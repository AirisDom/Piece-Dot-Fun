import React, { useState } from "react";
import styles from "./MarketView.module.scss";
import { RiMapPinUserFill,RiGift2Line } from "react-icons/ri";

export default function MarketView(props) {
  const { setViewProducts } = props;
  const [productButtonDisabled, setProductButtonDisabled] = useState(true);

  const handleProductButtonClick = () => {
    setViewProducts(true);
    setProductButtonDisabled(true);
  };

  const handleContactButtonClick = () => {
    setViewProducts(false);
    setProductButtonDisabled(false);
  };

  return (
    <div>
      <div className={styles.buttonContainer}>
        <button
          className={styles.button}
          onClick={handleProductButtonClick}
          disabled={productButtonDisabled}
        >
          <RiGift2Line size={40} />
          <a>Productos</a>
        </button>
        <button
          className={styles.button}
          onClick={handleContactButtonClick}
          disabled={!productButtonDisabled}
        >
          <RiMapPinUserFill size={45} />
          <a>Contacto</a>
        </button>
      </div>
    </div>
  );
}

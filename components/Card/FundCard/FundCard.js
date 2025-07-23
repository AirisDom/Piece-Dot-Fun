import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Payment from "./Payment/";
import {
  FaArrowLeft,
  FaCheck,
  FaMinusSquare,
  FaPlusSquare,
} from "react-icons/fa";
import Image from "next/image";

import styles from "./FundCard.module.scss";

const stripeInit = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

console.log(stripeInit);

export default function FundCard(props) {
  const { setPage, page, tokensAmount, setTokensAmount, wallet } = props;
  const stripe = useStripe();
  const elements = useElements();
  const handleInputChange = () => {
    const currentValue = parseInt(document.getElementById("tokensInput").value);
    setTokensAmount(!isNaN(currentValue) ? currentValue : 0);
  };

  const handleDecrease = () => {
    if (tokensAmount > 1) {
      setTokensAmount(tokensAmount - 1);
    }
  };

  const handleIncrease = () => {
    setTokensAmount(tokensAmount + 1);
  };

  return (
    <>
      <div className={styles.fundPage_fundCard_label}>
        <div>
          <h2>Buy Nana Tokens!</h2>
        </div>
        <div className={styles.content_container}>
          {page === 1 && (
            <div className={styles.prepayment}>
              <h3>Indicate the number of tokens</h3>
              <div className={styles.inputWithIcons}>
                <button
                  type="button"
                  onClick={handleDecrease}
                  disabled={tokensAmount === 0}
                >
                  <FaMinusSquare />
                </button>
                <input
                  id="tokensInput"
                  type="number"
                  className={styles.input}
                  placeholder="Cantidad de nana tokens"
                  value={tokensAmount}
                  onChange={handleInputChange}
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    fontWeight: "bold",
                  }}
                  step="1"
                />

                <button type="button" onClick={handleIncrease}>
                  <FaPlusSquare />
                </button>
              </div>
              {tokensAmount !== 0 ? (
                <div className={styles.checkout}>
                  <button onClick={() => setPage(2)}>Pay</button>
                </div>
              ) : null}
            </div>
          )}

          {page != 1 && (
            <div>
              <Elements stripe={stripeInit}>
                <Payment
                  tokensAmount={tokensAmount}
                  setPage={setPage}
                  wallet={wallet}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
      <div className={styles.fundPage_fundCard_img}>
        <Image
          className={styles.item_image_img}
          src="/Solana_logo.png"
          alt="Solana Logo"
          width={200}
          height={200}
        />
      </div>
    </>
  );
}

import React from "react";
import styles from "./CartProductsView.module.scss";
import { size, map } from "lodash";
export default function CartProductsView(props) {
  const { products, market } = props;

  return (
    <>
      <div className={styles.cartProductsView_wrapper}>
        {map(products, (product) => (
          <div className={styles.cartProductsView_main}>
            <div className={styles.cartProductsView_img}>
              <div className={styles.cartProductsView_img_containter}>
                <Image
                  className={styles.item_image_img}
                  src={product.account.image}
                  layout="fill"
                />
              </div>
            </div>
            <div className={styles.cartProductsView_title_and_info}>
              <div className={styles.cartProductsView_title}>
                <p className={styles.product_title}>{product.account.title}</p>
              </div>
              <div className={styles.cartProductsView_info}>
                <p className={styles.product_info}>
                  {product.account.description}
                </p>
              </div>
            </div>
            <div className={styles.cartProductsView_price_and_actions}>
              <div className={styles.cartProductsView_prices}>
                <div className={styles.cartProductsView_price}>
                  <p className={styles.product_price}>
                    {product.account.price}
                  </p>
                </div>
                <div className={styles.cartProductsView_price_off}>
                  <p className={styles.product_price_off}>
                    {product.account.priceOffer}
                  </p>
                </div>
              </div>
              <div className={styles.cartProductsView_actions}>
                <button
                  onClick={() => {
                    addProductCart(
                      `${product.publicKey}#${product.account.owner}`
                    );
                  }}
                ></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

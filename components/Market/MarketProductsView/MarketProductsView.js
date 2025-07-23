import React from "react";
import Image from "next/image";
import { AiOutlineShoppingCart } from "react-icons/ai";
import styles from "./MarketProductsView.module.scss";
import { map } from "lodash";
import useCart from "@/hooks/useCart";
import { useProgramState } from "@/hooks/useProgram";

export default function MarketProductsView(props) {
  const { products, market } = props;

  return <ProductsCards products={products} market={market} />;
}

function ProductsCards(props) {
  const { products, market } = props;
  const { markets } = useProgramState();
  const { account } = products;
  const { addProductCart } = useCart();
  return (
    <>
      {markets && (
        <>
          {map(markets, (myMarket) => (
            <>
              {myMarket.owner.toString() == market && (
                <>
                  <p className={styles.title_p}> {myMarket.marketName}</p>
                </>
              )}
            </>
          ))}
        </>
      )}

      <div className={styles.productsView_wrapper}>
        {map(products, (product) => (
          <div className={styles.productsView_main}>
            <div className={styles.productsView_img}>
              <div className={styles.productsView_img_containter}>
                <img
                  className={styles.item_image_img}
                  src={product.account.image}
                  layout="fill"
                />
              </div>
            </div>
            <div className={styles.productsView_title_and_info}>
              <div className={styles.productsView_title}>
                <p className={styles.product_title}>{product.account.title}</p>
              </div>
              <div className={styles.productsView_info}>
                <p className={styles.product_info}>
                  {product.account.description}
                </p>
              </div>
            </div>
            <div className={styles.productsView_price_and_actions}>
              <div className={styles.productsView_prices}>
                <div className={styles.productsView_price}>
                  <p className={styles.product_price}>
                    {product.account.price}
                  </p>
                </div>
                <div className={styles.productsView_price_off}>
                  <p className={styles.product_price_off}>
                    {product.account.priceOffer}
                  </p>
                </div>
              </div>
              <div className={styles.productsView_actions}>
                <div
                  onClick={() => {
                    addProductCart(
                      `${product.publicKey}#${product.account.owner}`
                    );
                  }}
                >
                  <AiOutlineShoppingCart
                    size={35}
                    className={styles.productsView_actions}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

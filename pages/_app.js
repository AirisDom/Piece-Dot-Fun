import React, { useMemo, useState, useEffect } from "react";
import "@/styles/globals.css";
import dynamic from "next/dynamic";
import "../scss/global.scss";
import {
  getProductsCart,
  addProductCart,
  countProductsCart,
  removeProductCart,
  removeAllProductsCart,
} from "./api/cartApi";
import CartContext from "@/context/CartContext";

import { ProgramState } from "../context/SmartContractContext";
import { PostContext } from "@/context/web3/SmartProgramPostContext";
import { UserContext } from "@/context/web3/SmartProgramUserContext";
import { MarketContext } from "@/context/web3/SmartProgramMarketContext";
import { useProgramState } from "@/hooks/useProgram";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/router";
import { useUserContext } from "@/hooks/useUserProgram";

const WalletConnectionProvider = dynamic(
  () => import("../context/WalletConnectionProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }) {
  const [totalProductsCart, setTotalProductsCart] = useState(0);
  const [reloadCart, setReloadCart] = useState(false);

  //recargar la información del carrito cada que se solicite
  useEffect(() => {
    setTotalProductsCart(countProductsCart);
    setReloadCart(false);
  }, [reloadCart]);

  //función de agregar producto del carrito
  const addProduct = (product) => {
    //se valida conexión de wallet

    addProductCart(product);
    setReloadCart(true);
  };

  //función de eliminar producto del carrito
  const removeProduct = (product) => {
    removeProductCart(product);
    setReloadCart(true);
  };

  //useMemo para almacenar en caché el resultado de las funciones
  const CartData = useMemo(
    () => ({
      productsCart: totalProductsCart,
      addProductCart: (product) => addProduct(product),
      getProductsCart: getProductsCart,
      removeProductCart: (product) => removeProduct(product),
      removeAllProductsCart: removeAllProductsCart,
    }),
    [totalProductsCart] //se recalcula solo si cambia totalProductsCart
  );

  return (
    <WalletConnectionProvider>
      <CartContext.Provider value={CartData}>
        <ProgramState>
          <UserContext>
            <MarketContext>
              <PostContext>
                <Component {...pageProps} />
              </PostContext>
            </MarketContext>
          </UserContext>
        </ProgramState>
      </CartContext.Provider>
    </WalletConnectionProvider>
  );
}

export default MyApp;

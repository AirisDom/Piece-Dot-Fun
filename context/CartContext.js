import { createContext } from "react";

//valores y funciones que se definen en _app
const CartContext = createContext({
  productsCart: 0,
  addProductCart: () => null,
  getProductsCart: () => null,
  removeProductCart: () => null,
  removeAllProductsCart: () => null,
});

export default CartContext;

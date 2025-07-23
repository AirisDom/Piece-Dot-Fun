import { Wallet } from "@project-serum/anchor";
import { BASE_PATH, CART, URL } from "../../utils/constants";
import { size, remove, includes } from "lodash";
import { useState } from "react";
import { toast } from "react-toastify";

export function getProductsCart() {
  const cart = localStorage.getItem(CART);

  if (!cart) {
    return null;
  } else {
    const products = cart.split(",");
    return products;
  }
}

export function addProductCart(product) {
  const cart = getProductsCart() ?? [];
  console.log(cart);
  const productArray = product.split("#");

  if (!cart) {
    localStorage.setItem(CART, product);
    toast.success("Agregado al carrito");
  } else {
    if (cart.length === 0) {
      localStorage.setItem(CART, product);
      toast.success("Agregado al carrito");
    } else {
      const marketId = productArray[1];
      if (cart.every((cartItem) => cartItem.includes(marketId))) {
        cart.push(product);
        localStorage.setItem(CART, cart);
        toast.success("Agregado al carrito");
      } else {
        toast.warning(
          "No se puede agregar al carrito. El producto pertenece a un mercado diferente."
        );
      }
    }
  }
}

export function countProductsCart() {
  const cart = getProductsCart();
  if (!cart) {
    return 0;
  } else {
    return size(cart);
  }
}

export function removeProductCart(product) {
  let cart = getProductsCart();

  const indexToRemove = cart.findIndex((item) => item === product);

  if (indexToRemove > -1) {
    cart.splice(indexToRemove, 1);

    if (cart.length > 0) {
      localStorage.setItem(CART, cart);
    } else {
      localStorage.removeItem(CART);
    }
  }
}

export function removeAllProductsCart() {
  localStorage.removeItem(CART);
}

export async function payUserTokens(formData) {
  console.log(formData);

  try {
    const url = `${URL}/token/payTokens`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);

    const data = {
      status: response.status,
      result: await response.json(),
    };

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function transferTokens(formData) {
  try {
    const url = `${URL}/token/transferTokens`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);

    const data = {
      status: response.status,
      result: await response.json(),
    };

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function burnTokens(formData) {
  console.log(formData);
  try {
    const url = `${URL}/token/burnTokens`;
    const params = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);

    const data = {
      status: response.status,
      result: await response.json(),
    };

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

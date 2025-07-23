import { Wallet } from "@project-serum/anchor";
import { BASE_PATH, CART, URL } from "../../utils/constants";
import { size, remove, includes } from "lodash";
import { useState } from "react";
import { toast } from "react-toastify";

export async function verifyWallet(formData) {
  try {
    const url = `${URL}/auth/checkDevice`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const response = await fetch(url, params);

    if (!response) return null;

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

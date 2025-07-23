import { Wallet } from "@project-serum/anchor";
import { BASE_PATH, CART, URL } from "../../utils/constants";
import { size, remove, includes } from "lodash";
import { useState } from "react";
import { toast } from "react-toastify";

export async function addNotificationApi(formData) {
  try {
    const url = `${URL}/not/addNotification`;
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

export async function getNotificationStatus(token) {

  try {
    const url = `${URL}/not/getNotificationStatus`;
    const params = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `${token}`,
      },
      body: JSON.stringify({ token }),
    };

    const response = await fetch(url, params);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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

import { URL } from "../utils/constants";

export async function createRegisterRequestApi(formData) {
  try {
    const url = `${URL}/auth/create`;
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

export async function checkStatusApi(formData) {
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

    if (!response) return true;

    const result = await response.json();

    const data = result.result["verified"];

    console.log(data);

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

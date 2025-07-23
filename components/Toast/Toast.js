import React, { useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";

export default function Toast(props) {
  const { text, showToast, setShowToast } = props;

  const notify = () => toast(`${text}`);

  useEffect(() => {
    (() => {
      if (showToast) {
        notify();
        setShowToast(false);
      }
    })();
  }, [showToast]);

  return (
    <ToastContainer
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      theme="dark"
      pauseOnHover={false}
    />
  );
}

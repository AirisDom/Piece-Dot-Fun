import React, { useState, useEffect } from "react";
import { size, map } from "lodash";
import { useRouter } from "next/router";
import useCart from "../hooks/useCart";
import { useProgramState } from "@/hooks/useProgram";
import { usePostContext } from "@/hooks/usePostProgram";
import { useUserContext } from "@/hooks/useUserProgram";

import { HiOutlineDeviceMobile } from "react-icons/hi";

import MainLayout from "@/layouts/MainLayout/MainLayout";
import CartProductsView from "@/components/Cart/CartProductsView/CartProductsView";

import UtilsProducts from "@/utils/web3/Products/UtilsProducts";
import SummaryCart from "@/components/Cart/SummaryCart/SummaryCart";
import styles from "./myAccount.module.scss";
import { useProfile } from "@/hooks/useProfile";
import { verifyWallet } from "./api/deviceApi";
import Toast from "@/components/Toast/Toast";

import QRCode from "qrcode.react";
import { checkStatusApi, createRegisterRequestApi } from "@/api/device";
import MainModal from "@/components/Modal/MainModal/MainModal";

export default function Cart() {
  const router = useRouter();
  const { getProductsCart } = useCart();
  const products = getProductsCart();
  const { markets } = useProgramState();
  const { posts } = usePostContext();
  const { isConnected, hasUserAccount } = useUserContext();
  const { userAddress } = useProfile();

  const [text, setText] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [verified, setVerified] = useState(undefined);

  useEffect(() => {
    if (!hasUserAccount) {
      const timer = setTimeout(() => {
        router.replace("/myAccount");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasUserAccount, router]);

  useEffect(() => {
    async function verifyUserAddress() {
      const response = await verifyWallet({ wallet: userAddress });

      if (!response) {
        setText(
          "No fue posible verificar si tienes dispositivo, intenta más tarde"
        );
        setShowToast(true);

        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        if (response.result.result.found && response.result.result.verified) {
          router.push("/");
        } else {
          setText("Wallet sin dispositivo asociado");
          setShowToast(true);
          setVerified(true);
        }
      }
    }

    if (hasUserAccount && router && userAddress) {
      verifyUserAddress();
    }
  }, [hasUserAccount, router, userAddress]);

  if (!verified)
    return (
      <>
        <VerifyCart />
        <Toast showToast={showToast} setShowToast={setShowToast} text={text} />
      </>
    );

  if (verified) {
    return <EmptyCart />;
  }
}

function VerifyCart() {
  return (
    <MainLayout className="empty-cart">
      <h2>Verificando dispositivo...</h2>
    </MainLayout>
  );
}

function EmptyCart() {
  return (
    <MainLayout className="empty-cart">
      <RegisterDeviceModal />
    </MainLayout>
  );
}

function RegisterDeviceModal(props) {
  const [showModal, setShowModal] = useState(false);

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [text, setText] = useState("");
  const [showToast, setShowToast] = useState(false);
  const titleModal = `Create User`;

  const { userAddress } = useProfile();

  const [executeEffect, setExecuteEffect] = useState(false);
  const [stopLoop, setStopLoop] = useState(false);
  const [countdown, setCountdown] = useState(120);
  const [token, setToken] = useState(undefined);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const router = useRouter();
  useEffect(() => {
    if (!executeEffect) return;

    const timer =
      countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);

    const loop = setInterval(async () => {
      if (stopLoop) {
        clearInterval(loop);
      } else {
        const response = await checkStatusApi({ wallet: userAddress });

        if (response) {
          setText("Dispositivo asociado");
          setShowToast(true);
          setShowQRModal(false);
          setStopLoop(true);
          router.replace("/");
        }
      }
    }, 1000);

    setTimeout(() => {
      clearInterval(timer);
      clearInterval(loop);

      setStopLoop(true);
      setQrCodeValue(false);
      setShowQRModal(false);
      setExecuteEffect(false);
    }, 120 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(loop);
    };
  }, [countdown, stopLoop, checkStatusApi, executeEffect]);

  const onShowQRModal = () => setShowQRModal(true);

  const onCloseModal = () => setShowModal(false);

  const onCreate = async (e) => {
    setShowModal(true);
    if (executeEffect) {
      setText(
        `Debes esperar ${minutes} minutos y ${seconds} segundos para volver a ejecutar esta acción`
      );
      setShowToast(true);
      return null;
    }
    const response = await createRegisterRequestApi({ wallet: userAddress });

    if (!response) {
      setText("Error al conectarse con el servidor");
      setShowToast(true);
      return null;
    }

    console.log(response);

    switch (response.status) {
      case 200:
        setText(
          `Asocia tu dispositivo para finalizar el registro de la wallet ${userAddress}`
        );
        setQrCodeValue();
        onShowQRModal();
        const data = {
          accion: "registrar",
          jwt: response.result["token"],
        };
        setToken(response.result["token"]);
        setQrCodeValue(JSON.stringify(data));
        setExecuteEffect(true);

        break;
      case 401:
        setShowModal(false);
        setText(
          "No fue posible solicitar el registro del dispositivo. Espera 5min e intenta de nuevo"
        );
        break;

      case 404:
        setText("No fue posible localizar información");
        break;
    }

    setShowToast(true);
  };

  return (
    <>
      {!showModal && (
        <>
          <div className={styles.newUser_Wrapper}>
            <div className={styles.new} onClick={onCreate}>
              <HiOutlineDeviceMobile className={styles.HiUserAdd} size={30} />

              <a>Register your device</a>
            </div>
          </div>
        </>
      )}
      <MainModal
        show={showModal}
        setShow={setShowModal}
        title={
          showQRModal
            ? `Tiempo restante para autenticar: ${minutes}:${
                seconds < 10 ? "0" : ""
              }${seconds}`
            : titleModal
        }
      >
        {showQRModal && (
          <>
            <QRForm qrCodeValue={qrCodeValue} countdown={countdown} />
          </>
        )}

        <Toast showToast={showToast} setShowToast={setShowToast} text={text} />
      </MainModal>
    </>
  );
}

function QRForm(props) {
  const { qrCodeValue, countdown } = props;

  return (
    <>
      {qrCodeValue && (
        <QRCode
          value={qrCodeValue}
          size={400}
          style={{ border: "10px solid white" }}
        />
      )}
    </>
  );
}

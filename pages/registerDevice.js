import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useProgramState } from "@/hooks/useProgram";
import { usePostContext } from "@/hooks/usePostProgram";
import { useUserContext } from "@/hooks/useUserProgram";
import { HiOutlineDeviceMobile } from "react-icons/hi";
import MainLayout from "@/layouts/MainLayout/MainLayout";
import styles from "./myAccount.module.scss";
import { useProfile } from "@/hooks/useProfile";
import { verifyWallet } from "./api/deviceApi";
import Toast from "@/components/Toast/Toast";
import QRCode from "qrcode.react";
import { checkStatusApi, createRegisterRequestApi } from "@/api/device";
import MainModal from "@/components/Modal/MainModal/MainModal";

export default function RegisterDevice() {
  const router = useRouter();
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
          "Could not verify if you have a device, please try again later."
        );
        setShowToast(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        if (response.result.result.found && response.result.result.verified) {
          router.push("/");
        } else {
          setText("Wallet has no associated device");
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
        <VerifyDevice />
        <Toast showToast={showToast} setShowToast={setShowToast} text={text} />
      </>
    );
  if (verified) {
    return <RegisterDeviceContainer />;
  }
}

function VerifyDevice() {
  return (
    <MainLayout className="empty-cart">
      <h2>Verifying device...</h2>
    </MainLayout>
  );
}

function RegisterDeviceContainer() {
  return (
    <MainLayout className="empty-cart">
      <RegisterDeviceModal />
    </MainLayout>
  );
}

function RegisterDeviceModal() {
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
          setText("Device associated");
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
  }, [countdown, stopLoop, executeEffect, userAddress, router]);

  const onShowQRModal = () => setShowQRModal(true);
  const onCloseModal = () => setShowModal(false);
  const onCreate = async (e) => {
    setShowModal(true);
    if (executeEffect) {
      setText(
        `You must wait ${minutes} minutes and ${seconds} seconds before trying again.`
      );
      setShowToast(true);
      return null;
    }
    const response = await createRegisterRequestApi({ wallet: userAddress });
    if (!response) {
      setText("Error connecting to the server");
      setShowToast(true);
      return null;
    }
    switch (response.status) {
      case 200:
        setText(
          `Associate your device to finish registering the wallet ${userAddress}`
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
          "Could not request device registration. Wait 5min and try again."
        );
        break;
      case 404:
        setText("Could not find information");
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
            ? `Time left to authenticate: ${minutes}:$${
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
  const { qrCodeValue } = props;
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

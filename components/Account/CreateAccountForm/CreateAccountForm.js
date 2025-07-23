import { useState, useEffect } from "react";
import QRCode from "qrcode.react";

import { useProgramState } from "@/hooks/useProgram";
import { useProfile } from "@/hooks/useProfile";
import MainModal from "../../Modal/MainModal/MainModal";
import styles from "./CreateAccountForm.module.scss";
import { createRegisterRequestApi, checkStatusApi } from "../../../api/device";

//Toast
import Toast from "@/components/Toast";
import { useRouter } from "next/router";

export default function CreateUserModal(props) {
  const router = useRouter();
  const { showModal, setShowModal } = props;

  const [first_name, setFirst_name] = useState("");
  const [second_name, setSecond_name] = useState("");
  const [first_last_name, setFirst_last_name] = useState("");
  const [second_last_name, setSecond_last_name] = useState("");
  const [device_id, setDevice_id] = useState("");

  const titleModal = `Create User`;
  const [regex, setRegex] = useState(/^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]+$/);

  const { userAddress } = useProfile();

  const { createUser } = useProgramState();

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [text, setText] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [executeEffect, setExecuteEffect] = useState(false);
  const [stopLoop, setStopLoop] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [token, setToken] = useState(undefined);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const onShowQRModal = () => setShowQRModal(true);

  const onCloseModal = () => setShowModal(false);
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
          setText("Dispositivo asociado, autoriza la transacción");
          setShowToast(true);
          await onRegisterDevice();
          setShowQRModal(false);
          setStopLoop(true);
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
      setCountdown(300);
      router.reload();
    }, 300 * 1000);

    return () => {
      clearInterval(timer);
      clearInterval(loop);
    };
  }, [countdown, stopLoop, checkStatusApi, executeEffect]);

  const onRegisterDevice = async () => {
    onCloseModal();
    await createUser(
      first_name,
      second_name,
      first_last_name,
      second_last_name,
      device_id
    );
  };

  const onCreate = async (e) => {
    if (executeEffect) {
      setText(
        `Debes esperar ${minutes} minutos y ${seconds} segundos para volver a ejecutar esta acción`
      );
      setShowToast(true);
      return null;
    }

    if (first_name.length == 0) {
      setText("First name can't be empty");
      setShowToast(true);
      return null;
    } else if (first_last_name.length == 0) {
      setText("Second name can't be empty");
      setShowToast(true);
      return null;
    } else if (second_last_name.length == 0) {
      setText("segundo apellido  can't be empty");
      setShowToast(true);
      return null;
    } else if (
      !regex.test(first_name) ||
      !regex.test(first_last_name) ||
      !regex.test(second_last_name)
    ) {
      setText(
        "Por favor, ingrese nombres y apellidos válidos. Sólo deben contener letras y espacios."
      );
      setShowToast(true);
      return null;
    } else if (second_name.length > 0) {
      if (!regex.test(second_name)) {
        setText(
          "Por favor, ingresa segundo nombre válido. Sólo debe contener letras y espacios."
        );
        setShowToast(true);
        return null;
      }
    } else {
      setSecond_name("");
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
        setText("No fue posible solicitar el registro del dispositivo");
        break;

      case 404:
        setText("No fue posible localizar información");
        break;
    }

    setShowToast(true);
  };

  return (
    <>
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
        {!showQRModal && (
          <>
            <UserForm
              first_name={first_name}
              setFirst_name={setFirst_name}
              second_name={second_name}
              setSecond_name={setSecond_name}
              first_last_name={first_last_name}
              setFirst_last_name={setFirst_last_name}
              second_last_name={second_last_name}
              setSecond_last_name={setSecond_last_name}
              setDevice_id={setDevice_id}
              onCreate={onCreate}
            />
          </>
        )}

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

function UserForm(props) {
  const {
    setFirst_name,
    first_name,
    setSecond_name,
    second_name,
    setFirst_last_name,
    first_last_name,
    setSecond_last_name,
    second_last_name,
    setDevice_id,
    onCreate,
  } = props;

  return (
    <div className={styles.createAccount_wrapper} id="form">
      <div className={styles.createAccount_wrapper_form}>
        <div className={styles.createAccount_form}>
          <label htmlFor="first_name">
            <span>First name</span>
            <input
              onChange={(e) => setFirst_name(e.target.value)}
              type="text"
              id="first_name"
              name="first_name"
              placeholder="Miguel"
              value={first_name ? first_name : null}
            />
          </label>
          <label htmlFor="second_name">
            <span>Second name</span>
            <input
              onChange={(e) => setSecond_name(e.target.value)}
              type="text"
              id="second_name"
              name="second_name"
              placeholder="Salomon"
              value={second_name ? second_name : null}
            />
          </label>
        </div>
        <div className={styles.createAccount_form2}>
          <label htmlFor="first_last_name">
            <span>Last name</span>
            <input
              onChange={(e) => setFirst_last_name(e.target.value)}
              type="text"
              id="first_last_name"
              name="first_last_name"
              placeholder="Lazcano"
              value={first_last_name ? first_last_name : null}
            />
          </label>

          <label htmlFor="second_last_name">
            <span>Second last name</span>
            <input
              onChange={(e) => setSecond_last_name(e.target.value)}
              type="text"
              id="second_last_name"
              name="second_last_name"
              placeholder="Saavedra"
              value={second_last_name ? second_last_name : null}
            />
          </label>

          {/* <label htmlFor="device_id">
          <span>device_id</span>
          <input
            onChange={(e) => setDevice_id(e.target.value)}
            type="text"
            id="device_id"
            name="device_id"
          />
        </label> */}
        </div>
      </div>
      <div className={styles.createMarket_button}>
        <button onClick={onCreate} type="submit">
          Create
        </button>
      </div>
    </div>
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

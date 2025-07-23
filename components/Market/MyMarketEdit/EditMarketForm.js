import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useProgramState } from "@/hooks/useProgram";
import styles from "./EditMyMarketForm.module.scss";
import Toast from "@/components/Toast";
import MainLayout from "@/layouts/MainLayout/MainLayout";

export default function EditPostModal({
  currentEditListing,
  showModal,
  setShowModal,
  currentEditMarketID,
  data,
  nameOwner,
  focusOwner,
  availableOwner,
  emailOwner,
  streetOwner,
  stateOwner,
  coloniaOwner,
  municipioOwner,
  zipOwner,
  num_extOwner,
  num_intOwner,
  number_phoneOwner,
  latOwner,
  longOwner,
}) {
  //To get staticGetPost updatePost,
  const [text, setText] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [market_name, setMarket_name] = useState("");
  const [market_focuses_on, setMarket_focuses_on] = useState("");
  const [market_available, setMarket_available] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [state, setState] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [zip, setZip] = useState("");
  const [num_ext, setNum_ext] = useState("");
  const [num_int, setNum_int] = useState("");
  const [yes, setYes] = useState(["0", "1"]);
  const [number_phone, setNumber_phone] = useState("");
  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");

  const [emailRegex, setEmailRegex] = useState(
    /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  );
  const [zipRegex, setZipRegex] = useState(/^\d{5}$/);
  const [numberRegex, setNumberRegex] = useState(/^\d+$/);
  const [phoneRegex, setPhoneRegex] = useState(/^\d{10}$/);
  const [nameRegex, setNameRegex] = useState(/^[\w\d\s]{1,20}$/);
  //SOLANA STUFF
  const { updateMarket, wallet } = useProgramState();
  // const { account } = data;
  console.log("ID to send", currentEditMarketID);
  const closeModal = () => {
    setShowModal(false);
  };

  const staticUpdateMarket = (wallet = "1111111111", currentEditMarketID) => {
    console.log(
      `Editing post... userKey: ${wallet} with Id: ${currentEditMarketID} `
    );
  };

  const onEdit = async (e) => {
    alert(market_name + "-longitud:" + market_name.length);
    alert("Valor de market name owner-" + nameOwner + "-");
    if (market_name.length == 0 || !market_name) {
      alert(nameOwner);
      await setMarket_name(nameOwner);
      alert(market_name);
      
    }
  
    // else if (market_focuses_on.length == 0) {
    //   setText("El nombre del giro no debe estar vacio");
    //   setShowToast(true);
    //   return null;
    // } else if (market_available != 0 && market_available != 1) {
    //   setText(
    //     "Por favor selecciona si el negocio se encuentra abierto o cerrado"
    //   );
    //   setShowToast(true);
    //   return null;
    // } else if (email.length == 0 || !emailRegex.test(email)) {
    //   setText(
    //     "El correo electronico no debe estar vacio y debe cumplir con el formato requerido"
    //   );
    //   setShowToast(true);
    //   return null;
    // } else if (street.length == 0) {
    //   setText("La calle no debe estar vacia");
    //   setShowToast(true);
    //   return null;
    // } else if (state.length == 0) {
    //   setText("El estado no debe estar vacio");
    //   setShowToast(true);
    //   return null;
    // } else if (colonia.length == 0) {
    //   setText("La colonia no debe estar vacia");
    //   setShowToast(true);
    //   return null;
    // } else if (municipio.length == 0) {
    //   setText("El municipio no debe estar vacio");
    //   setShowToast(true);
    //   return null;
    // } else if (zip.length == 0 || !zipRegex.test(zip)) {
    //   setText(
    //     "El codigo postal no debe estar vacio y unicamente debe tener 5 numeros"
    //   );
    //   setShowToast(true);
    //   return null;
    // } else if (num_ext.length == 0 || !numberRegex.test(num_ext)) {
    //   setText(
    //     "El numero exterior no debe estar vacio y debe incluir unicamente numeros. "
    //   );
    //   setShowToast(true);
    //   return null;
    // } else if (number_phone.length == 0 || !phoneRegex.test(number_phone)) {
    //   setText(
    //     "El numero telefonico no debe estar vacio y unicamente deben ser 10 digitos"
    //   );
    //   setShowToast(true);
    //   return null;
    // }

    //if (market_name.toString().length == 0) setMarket_name(nameOwner);
    updateMarket(
      wallet?.publicKey,
      currentEditMarketID,
      market_name,
      market_focuses_on,
      market_available,
      email,
      street,
      state,
      colonia,
      municipio,
      zip,
      num_ext,
      num_int,
      number_phone,
      lat,
      long
    );

    closeModal();
  };

  return (
    <>
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className={styles.editPost_wrapper1}>
            <div className={styles.editPost_transition}>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className={styles.editPost_panel}>
                  <Dialog.Title as="h3" className={styles.editPost_title}>
                    Edit Market
                  </Dialog.Title>
                  <div className={styles.editPost_wrapper}>
                    <div className={styles.editPost_wrapper_form}>
                      <div className={styles.editPost_form}>
                        <label htmlFor="location">
                          <span>Market name</span>
                          <input
                            onChange={(e) => {
                              setMarket_name(e.target.value);
                            }}
                            type="text"
                            id="location"
                            name="location"
                            placeholder={nameOwner}
                            value=""
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>Giro</span>
                          <input
                            onChange={(e) =>
                              setMarket_focuses_on(e.target.value)
                            }
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={focusOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>Availaability</span>

                          <select
                            type="text"
                            onChange={(e) =>
                              setMarket_available(e.target.value)
                            }
                          >
                            <option value={yes[1]}>Abierto</option>

                            <option value={yes[0]}>Cerrado</option>
                          </select>

                          {/* <input
            onChange={(e) => setMarket_available(e.target.value)}
            type="text"
            id="imageURL"
            name="imageURL"
            placeholder="Abierto,cerrado"
          />  */}
                        </label>

                        <label htmlFor="imageURL">
                          <span>Email </span>
                          <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={emailOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>Street </span>
                          <input
                            onChange={(e) => setStreet(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={streetOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>State</span>
                          <input
                            onChange={(e) => setState(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={stateOwner}
                          />
                        </label>
                      </div>
                      <div className={styles.editPost_form2}>
                        <label htmlFor="imageURL">
                          <span>Colonia</span>
                          <input
                            onChange={(e) => setColonia(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={coloniaOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span className="text-xs font-light">Municipio</span>
                          <input
                            onChange={(e) => setMunicipio(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={municipioOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>Postal code</span>
                          <input
                            onChange={(e) => setZip(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={zipOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>Exterior number</span>
                          <input
                            onChange={(e) => setNum_ext(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={num_extOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>Interior number</span>
                          <input
                            onChange={(e) => setNum_int(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={num_intOwner}
                          />
                        </label>

                        <label htmlFor="imageURL">
                          <span>Telephone number</span>
                          <input
                            onChange={(e) => setNumber_phone(e.target.value)}
                            type="text"
                            id="imageURL"
                            name="imageURL"
                            placeholder={number_phoneOwner}
                          />
                        </label>

                        {/* <label htmlFor="imageURL">
          <span>Latitud</span>
          <input
            onChange={(e) => setLat(e.target.value)}
            type="text"
            id="imageURL"
            name="imageURL"
            placeholder=""
          />
        </label>

        <label htmlFor="imageURL">
          <span>Longuitud</span>
          <input
            onChange={(e) => setLong(e.target.value)}
            type="text"
            id="imageURL"
            name="imageURL"
            placeholder=""
          />
        </label> */}
                      </div>
                    </div>

                    <div className={styles.editPost_button}>
                      <button onClick={onEdit} type="button">
                        Crear
                      </button>
                    </div>
                  </div>
                  {/* <div className={styles.editPost_wrapper}>
                  <div className={styles.editPost_wrapper_form}>
                    <div className={styles.editPost_form}>
                      <label htmlFor="location">
                        <span>Disponibilidad</span>

                        <select
                          type="text"
                          onChange={(e) => setAvailable(e.target.value)}
                        >
                          <option>Selecciona una opcion</option>
                          <option value={yes[1].toString()}>Disponible</option>
                          <option value={yes[0].toString()}>
                            No Disponible
                          </option>
                        </select>
                      </label>

                      <label htmlFor="location">
                        <span>Nombre</span>
                        <input
                          //placeholder={currentEditListing?.account.location}
                          onChange={(e) => setTitle(e.target.value)}
                          type="text"
                          id="location"
                          name="location"
                          placeholder={nameOwner}
                        />
                      </label>

                      <label htmlFor="location">
                        <span>Imagen</span>
                        <input
                          //placeholder={currentEditListing?.account.location}
                          onChange={(e) => setImage(e.target.value)}
                          type="text"
                          id="location"
                          name="location"
                        />
                      </label>
                    </div>
                    <div className={styles.editPost_form2}>
                      <label htmlFor="location">
                        <span>Descripción</span>
                        <input
                          //placeholder={currentEditListing?.account.location}
                          onChange={(e) => setDescription(e.target.value)}
                          type="text"
                          id="location"
                          name="location"
                        />
                      </label>

                      <label htmlFor="location">
                        <span>Precio</span>
                        <input
                          //placeholder={currentEditListing?.account.location}
                          onChange={(e) => setPrice(e.target.value)}
                          type="text"
                          id="location"
                          name="location"
                        />
                      </label>

                      <label htmlFor="location">
                        <span>Precio descuento</span>
                        <input
                          //placeholder={currentEditListing?.account.location}
                          onChange={(e) => setPriceOffer(e.target.value)}
                          type="text"
                          id="location"
                          name="location"
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.editPost_button}>
                    <button onClick={onEdit} type="button">
                      Confirmar
                    </button>
                  </div>
                </div> */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Toast showToast={showToast} setShowToast={setShowToast} text={text} />
    </>
  );
}

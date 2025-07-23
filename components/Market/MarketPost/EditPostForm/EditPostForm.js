import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useProgramState } from "@/hooks/useProgram";
import Toast from "@/components/Toast/Toast";
import styles from "./EditPostFrom.module.scss";
import { IoClose } from "react-icons/io5";
import { useRouter } from "next/router";

export default function EditPostModal({
  currentEditListing,
  editPostModalOpen,
  setEditPostModalOpen,
  currentEditPostID,
  data,
  titleOwner,
  imageOwner,
  descriptionOwner,
  priceOwner,
  priceOfferOwner,
}) {
  //To get staticGetPost updatePost,
  const [available, setAvailable] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceOffer, setPriceOffer] = useState("");
  const [yes, setYes] = useState(["0", "1"]);
  const [text, setText] = useState();
  const [showToast, setShowToast] = useState(false);
  //Form validation
  const [titleRegex, setTitleRegex] = useState(/^[a-zA-Z\s]*$/);
  const [priceRegex, setPriceRegex] = useState(/^[0-9]+$/);
  const [availableStates, setAvailableStates] = useState(["0", "1"]);
  const router = useRouter();
  //SOLANA STUFF
  const { updatePost, wallet } = useProgramState();
  const { account } = data;
  console.log("ID to send", currentEditPostID);
  const closeModal = () => {
    setEditPostModalOpen(false);
  };

  const staticUpdatePost = (
    wallet = "1111111111",
    currentEditPostID,
    available
  ) => {
    console.log(
      `Editing post... userKey: ${wallet} with Id: ${currentEditPostID} and new available of ${available} `
    );
  };

  const onEdit = async (e) => {
    e.preventDefault();

    // if (title.toString().length == 0) setTitle(titleOwner);
    // alert(title.toString().length);
    // if (image.toString().length == 0) setImage(imageOwner);
    // if (description.toString().length == 0) setDescription(descriptionOwner);
    // if (price.toString().length == 0) setPrice(priceOwner);
    // if (priceOffer.toString().length == 0) setPriceOffer(priceOfferOwner);

    if (title.length == 0 || !titleRegex.test(title)) {
      setText("El titulo sera el mismo ");
      setTitle(titleOwner);
      setShowToast(true);
      return null;
    } 
    if (image.length == 0) {
      setText("La imagen sera la misma");
      setImage(imageOwner);
      setShowToast(true);
      return null;
    } 
     if (description.length == 0) {
      setText("La descripcion sera la misma");
      setDescription(descriptionOwner);
      setShowToast(true);
      return null;
    } 
     if (price == 0 ) {
      setText(
        "El precio sera el mismo"
      );
      setShowToast(true);
      setPrice(priceOwner);
      return null;
    } 
    if (!priceRegex.test(price)) {
      setText(
        "El precio unicamente puede contener numeros "
      );
      setShowToast(true);
      setPrice(priceOwner);
      return null;
    } 
     if (priceOffer == 0) {
      setText(
        "El precio de oferta sera el mismo"
      );
      setShowToast(true);
      setPriceOffer(priceOfferOwner);
      return null;
    } 
    if (!priceRegex.test(priceOffer)) {
      setText(
        "El precio de oferta unicamente puede contener numeros"
      );
      setShowToast(true);
      setPriceOffer(priceOfferOwner);
      return null;
    } 
     if (!availableStates.includes(available)) {
      setText(
        "Por favor elije si el producto esta disponible o no disponible. "
      );
      setShowToast(true);
      return null;
    }
    if (parseFloat(priceOffer.toString()) > parseFloat(price).toString()) {
      setText("El precio en descuento debe ser menor al precio original");
      setShowToast(true);
      return null;
    }

    await updatePost(
      wallet?.publicKey,
      currentEditPostID,
      available,
      title,
      image,
      description,
      price,
      priceOffer
    );
    closeModal();
    router.reload();
  };

  return (
    <Transition appear show={editPostModalOpen} as={Fragment}>
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
                  Edit Post
                </Dialog.Title>

                <div className={styles.editPost_wrapper}>
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
                          placeholder={titleOwner}
                          value={title || titleOwner}
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
                          placeholder={titleOwner}
                          value={image || imageOwner}
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
                          placeholder={descriptionOwner}
                          value={description || descriptionOwner}
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
                          placeholder={priceOwner}
                          value={price || priceOwner}
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
                          placeholder={priceOfferOwner}
                          value={priceOffer || priceOfferOwner }
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.editPost_button}>
                    <button onClick={onEdit} type="button">
                      Confirmar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        <>
          <Toast
            showToast={showToast}
            setShowToast={setShowToast}
            text={text}
          />
        </>
      </Dialog>
    </Transition>
  );
}

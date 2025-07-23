import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useProgramState } from "@/hooks/useProgram";
import MainModal from "@/components/Modal/MainModal/";
import styles from "./CreatePostForm.module.scss";
import Toast from "@/components/Toast";
import { useRouter } from "next/router";

export default function CreateUserModal(props) {
  const { showModal, setShowModal } = props;
  const [text, setText] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceOffer, setPriceOffer] = useState("");
  const [available, setAvailable] = useState("");
  const [yes, setYes] = useState(["0", "1"]);

  const [titleRegex, setTitleRegex] = useState(/^[a-zA-Z\s]*$/);
  const [priceRegex, setPriceRegex] = useState(/^[0-9]+$/);
  const [availableStates, setAvailableStates] = useState(["0", "1"]);

  const router = useRouter();
  const titleModal = `Create Post`;
  const { createPost } = useProgramState();
  const onShowModal = () => setShowModal(true);
  const onCloseModal = () => setShowModal(false);

  const onCreate = async (e) => {
    console.log(available);
    if (title.length == 0 || !titleRegex.test(title)) {
      setText("El titulo no puede estar vacio, ni puede tener numeros ");
      setShowToast(true);
      return null;
    } else if (image.length == 0) {
      setText("La imagen no puede estar vacia");
      setShowToast(true);
      return null;
    } else if (description.length == 0) {
      setText("La descripcion no puede estar vacia ");
      setShowToast(true);
      return null;
    } else if (price == 0 || !priceRegex.test(price)) {
      setText(
        "El precio no puede estar vacio y unicamente puede contener numeros "
      );
      setShowToast(true);
      return null;
    } else if (priceOffer == 0 || !priceRegex.test(priceOffer)) {
      setText(
        "El precio de oferta no puede estar vacio y unicamente puede contener numeros"
      );
      setShowToast(true);
      return null;
    } else if (!availableStates.includes(available)) {
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
    e.preventDefault();

    await createPost(
      title,
      image,
      description,
      price,
      priceOffer,
      available.toString()
    );
    //router.reload();
    onCloseModal();
    router.reload();
  };

  return (
    <>
      <MainModal
        show={showModal}
        setShow={setShowModal}
        title={titleModal}
        size="small"
      >
        <PostForm
          setTitle={setTitle}
          setImage={setImage}
          setDescription={setDescription}
          setPrice={setPrice}
          setPriceOffer={setPriceOffer}
          setAvailable={setAvailable}
          onCreate={onCreate}
          yes={yes}
        />
        <Toast showToast={showToast} setShowToast={setShowToast} text={text} />
      </MainModal>
    </>
  );
}

function PostForm(props) {
  const {
    setTitle,
    setImage,
    setDescription,
    setPrice,
    setPriceOffer,
    setAvailable,
    onCreate,
    yes,
  } = props;

  return (
    <div className={styles.createPost_wrapper}>
      <div className={styles.createPost_wrapper_form}>
        <div className={styles.createPost_form}>
          <label htmlFor="location">
            <span>Name</span>
            <input
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              id="location"
              name="location"
              placeholder="Mojito"
            />
          </label>

          <label htmlFor="imageURL">
            <span>URL image</span>
            <input
              onChange={(e) => setImage(e.target.value)}
              type="text"
              id="imageURL"
              name="imageURL"
              placeholder="https://images.unsplash.com/"
            />
          </label>

          <label htmlFor="imageURL">
            <span>Description</span>
            <input
              onChange={(e) => setDescription(e.target.value)}
              type="text"
              id="imageURL"
              name="imageURL"
              placeholder="Bebida con vodka y un toque de hiervabuena"
            />
          </label>
        </div>
        <div className={styles.createPost_form2}>
          <label htmlFor="imageURL">
            <span>Price $</span>
            <input
              onChange={(e) => setPrice(e.target.value)}
              type="text"
              id="imageURL"
              name="imageURL"
              placeholder="En pesos mexicanos"
            />
          </label>

          <label htmlFor="imageURL">
            <span>Discount price</span>
            <input
              onChange={(e) => setPriceOffer(e.target.value)}
              type="text"
              id="imageURL"
              name="imageURL"
              placeholder="Precio mas bajo en descuento"
            />
          </label>

          <label htmlFor="imageURL">
            <span>Availability </span>
            <select
              type="text"
              onChange={(e) => {
                setAvailable(e.target.value);
              }}
            >
              <option>Selecciona una opción</option>

              <option value={yes[1]}>Disponible</option>

              <option value={yes[0]}>No Disponible</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.createPost_button}>
        <button onClick={onCreate} type="button">
          Create
        </button>
      </div>
    </div>
  );
}

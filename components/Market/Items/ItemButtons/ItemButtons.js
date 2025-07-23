import React, { useState } from "react";
import styles from "../../ItemButtons.module.scss";
import { FaEdit } from "react-icons/fa";
import useCart from "@/hooks/useCart";

export default function ItemButtons(props) {
  const {
    owner,
    postId,
    productID,
    user,
    toggleEditPostModal,
    title,
    image,
    description,
    price,
    priceOffer,
  } = props;
  const { addProductCart } = useCart();
  const [showToast, setShowToast] = useState(false);
  const valueText = `${productID} agregado al carrito`;
  // console.log("Le envio el postId",postId)
  // console.log("Le envio el owner",owner)
  return (
    <div className={styles.item_buttons_wrapper}>
      <FaEdit
        className={styles.item_buttons_icon}
        size={22}
        onClick={() =>
          toggleEditPostModal(
            true,
            postId,
            owner,
            title,
            image,
            description,
            price,
            priceOffer
          )
        }
      />
    </div>
  );
}

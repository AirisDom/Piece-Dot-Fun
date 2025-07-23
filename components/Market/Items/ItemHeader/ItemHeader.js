import React from "react";
import Image from "next/image";
import styles from "../../ItemHeader.module.scss";

import { getAvatarUrl } from "@/utils/getAvatarUrl";

export default function ItemHeader(props) {
  const { avatar, userAddress, title } = props;

  return (
    <div className={styles.item_header_wrapper}>
      <div className={styles.item_header_imgContainer}>
        <Image
          src={getAvatarUrl(userAddress.toString())}
          layout="fill"
          alt={userAddress}
          className={styles.item_header_img}
        />
      </div>
      <div className={styles.item_header_userContainer}>
        {/* <p className={styles.item_header_user}>{truncateWallet(userAddress)}</p> */}
        <p className={styles.item_header_user}>{title}</p>
      </div>
      {/* <div className={styles.item_header_button}>
        <AiOutlineClose size={20} className={styles.item_buttons_icon} />
      </div> */}
    </div>
  );
}

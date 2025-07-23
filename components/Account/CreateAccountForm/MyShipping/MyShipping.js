import React from "react";
import styles from "./MyShipping.module.scss";
import { FaEdit } from "react-icons/fa";

export default function MyShipping(props) {
  const { data } = props;

  return (
    <div className={styles.myShipping_wrapper}>
      <div className={styles.myShipping_header}>
        <div>
          <p>{data.label}</p>
        </div>
        <div className={styles.myShipping_header_gostDiv} />
        <div className={styles.myShipping_header_gostDiv} />
        <FaEdit size={25} className={styles.myShipping_header_edit} />
      </div>
      <div className={styles.myShipping_info}>
        <div className={styles.myShipping_Addres}>
          <div>
            <p>Street: {data.street}</p>
          </div>
          <div>
            <p>Colonia: {data.colonia}</p>
          </div>
          <div>
            <p>Municipality: {data.municipio}</p>
          </div>
          <div>
            <p>State: {data.state}</p>
          </div>
        </div>

        <div className={styles.myShipping_Addres_Number}>
          <div>
            <p>CP: {data.zip}</p>
          </div>
          <div>
            <p>Exterior number: {data.numExt}</p>
          </div>
          <div>
            <p>Interior number: {data.numInt}</p>
          </div>
        </div>

        <div className={styles.myShipping_Addres_Contact}>
          <div>
            <p>Email: {data.email}</p>
          </div>
          <div>
            <p>Telephone number: {data.numberPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

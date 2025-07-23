import { useRouter } from "next/router";

import styles from "./MyMarketView.module.scss";

export default function FeedMarket(props) {
  const { avatar, data, key } = props;
  console.log("dataaa owner", data.owner.toString());
  const user = data.owner.toString();
  const router = useRouter();

  return (
    <div className={styles.myMarket_wrapper}>
      <div className={styles.myMarket_mainInfo}>
        <div>
          <p>Market: {data.marketName}</p>
        </div>
        <div>
          <p>Giro: {data.marketFocusesOn}</p>
        </div>
        <div>
          <p className={styles.item_foot_product_available}>
            {" "}
            {data.marketAvailable == 1 ? "AVAILABLE" : ""}
          </p>
          <p className={styles.item_foot_product_not_available}>
            {" "}
            {data.marketAvailable != 1 ? "UNAVAILABLE" : ""}
          </p>
        </div>
      </div>

      <div className={styles.myMarket_Addres}>
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

      <div className={styles.myMarket_Addres_Number}>
        <div>
          <p>CP: {data.zip}</p>
        </div>
        <div>
          <p>Exterior number: {data.numExt}</p>
        </div>
        <div>
          <p>Interior number:: {data.numInt}</p>
        </div>
      </div>

      <div className={styles.myMarket_Addres_Contact}>
        <div>
          <p>Email: {data.email}</p>
        </div>
        <div>
          <p>Telephone number: {data.numberPhone}</p>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from "next/router";
import MarketFoot from "../MarketFoot/MarketFoot";
import ItemHeader from "../ItemHeader";

import styles from "../../FeedItem.module.scss";

export default function FeedMarket(props) {
  const { avatar, data, key } = props;
  console.log("dataaa owner", data.owner.toString());
  const user = data.owner.toString();
  const router = useRouter();
  console.log("key", key);
  if (data.id.toString() == "1") {
    console.log("key unique", data.id.toString());
  } else console.log("key multi", data.id.toString());
  const handleRedirect = () => {
    const marketUrl = `/market/${data.owner.toString()}`;
    router.push(marketUrl);
  };

  return (
    <div
      className={styles.feedItem_wrapper}
      onClick={
        data.marketAvailable == "1"
          ? handleRedirect
          : console.log("Mercado no disponibe")
      }
    >
      <ItemHeader avatar={avatar} userAddress={user} title={data.marketName} />

      <MarketFoot
        marketName={data.marketName}
        marketFocusesOn={data.marketFocusesOn}
        email={data.email}
        state={data.state}
        marketAvailable={data.marketAvailable}
        municipio={data.municipio}
        colonia={data.colonia}
        zip={data.zip}
        numExt={data.numExt}
        numInt={data.numInt}
        numberPhone={data.numberPhone}
        lat={data.lat}
        long={data.long}
        market_id
      />
    </div>
  );
}

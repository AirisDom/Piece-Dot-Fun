import { useRouter } from "next/router";
import MarketFoot from "../MarketFoot/MarketFoot";
import ItemHeader from "../ItemHeader";
import styles from "../../FeedItem.module.scss";

export default function FeedMarket({ avatar, data }) {
  const router = useRouter();
  // Add new fields to the market data (for demo, fallback if not present)
  const market = {
    ...data,
    createdAt: data.createdAt || new Date().toISOString(),
    rating: data.rating || Math.round(Math.random() * 5 * 10) / 10, // 0-5, 1 decimal
  };
  const handleRedirect = () => {
    const marketUrl = `/market/${market.owner.toString()}`;
    router.push(marketUrl);
  };
  return (
    <div
      className={styles.feedItem_wrapper}
      onClick={
        market.marketAvailable == "1"
          ? handleRedirect
          : () => console.log("Market not available")
      }
    >
      <ItemHeader
        avatar={avatar}
        userAddress={market.owner}
        title={market.marketName}
      />
      <MarketFoot market={market} />
    </div>
  );
}

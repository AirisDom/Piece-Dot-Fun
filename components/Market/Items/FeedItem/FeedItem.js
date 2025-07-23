import ItemButtons from "../ItemButtons";
import ItemFoot from "../ItemFoot";
import ItemHeader from "../ItemHeader";
import ItemImage from "../ItemImage";
import styles from "../../FeedItem.module.scss";

export default function FeedItem(props) {
  const { avatar, data, setEditPostModalOpen, toggleEditPostModal, walletKey } =
    props;
  const { account } = data;
  const postId = account.id;
  const owner = account.owner.toString();
  const productID = data.publicKey.toString();

  // console.log("Este es mi productID", postId);
  // console.log("Este es mi owner", owner);
  // console.log("Este soy io", walletKey);

  return (
    <div className={styles.feedItem_wrapper}>
      <ItemHeader avatar={avatar} userAddress={owner} title={account.title} />
      <ItemImage image={account.image} alt="post" />
      <ItemButtons
        postId={postId}
        owner={owner}
        title={account.title}
        image={account.image}
        description={account.description}
        price={account.price}
        priceOffer={account.priceOffer}
        setEditPostModalOpen={setEditPostModalOpen}
        toggleEditPostModal={toggleEditPostModal}
      />
      <ItemFoot
        title={account.title}
        description={account.description}
        price={account.price}
        priceOffer={account.priceOffer}
        available={account.available}
      />
    </div>
  );
}

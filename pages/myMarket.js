import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";
import { AiOutlineEdit } from "react-icons/ai";
//Components
import MainLayout from "@/layouts/MainLayout/MainLayout";
import FeedItem from "@/components/Market/Items/FeedItem";
//import FeedMarket from "@/components/Market/FeedMarket";
import FeedMarket from "@/components/Market/MyMarketView/MyMarketView";
import EditPostModal from "@/components/Market/MarketPost/EditPostForm/EditPostForm";
import CreatePostForm from "@/components/Market/MarketPost/CreatePostForm";
import CreateMarketModal from "@/components/Market/MarketAccount/CreateMarketForm";
import EditMarketForm from "@/components/Market/MyMarketEdit/EditMarketForm";
//hooks
import { useProgramState } from "@/hooks/useProgram";
import { usePostContext } from "@/hooks/usePostProgram";
import { useProfile } from "@/hooks/useProfile";
import { useUserContext } from "@/hooks/useUserProgram";

import styles from "./myMarket.module.scss";
import { useRouter } from "next/router";

export default function myMarket() {
  const router = useRouter();
  const { publicKey } = useProfile();
  const { posts } = usePostContext();
  const { hasNewMarket, markets, userAddress } = useProgramState();
  const { isConnected, hasUserAccount } = useUserContext();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreatMarketModal, setShowCreateMarketModal] = useState(false);
  const [editMarketModalOpen, setEditMarketModalOpen] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [currentEditPostID, setCurrentEditPostID] = useState(null);
  const [currentEditMarketID, setCurrentEditMarketID] = useState(null);
  const [titleOwner, setTitleOwner] = useState(null);
  const [imageOwner, setImageOwner] = useState(null);
  const [descriptionOwner, setDescriptionOwner] = useState(null);
  const [priceOwner, setPriceOwner] = useState(null);
  const [priceOfferOwner, setPriceOfferOwner] = useState(null);
  const wallet = "111111111111111111";

  const [nameOwner, setNameOwner] = useState("");
  const [focusOwner, setFocusOwner] = useState("");
  const [availableOwner, setAvailableOwner] = useState("");
  const [emailOwner, setEmailOwner] = useState("");
  const [streetOwner, setStreetOwner] = useState("");
  const [stateOwner, setStateOwner] = useState("");
  const [coloniaOwner, setColoniaOwner] = useState("");
  const [municipioOwner, setMunicipioOwner] = useState("");
  const [zipOwner, setZipOwner] = useState("");
  const [num_extOwner, setNum_extOwner] = useState("");
  const [num_intOwner, setNum_intOwner] = useState("");
  const [yes, setYes] = useState(["0", "1"]);
  const [number_phoneOwner, setNumber_phoneOwner] = useState("");
  const [latOwner, setLatOwner] = useState("");
  const [longOwner, setLongOwner] = useState("");

  useEffect(() => {
    console.log(hasNewMarket);
    if (!hasUserAccount) {
      const timer = setTimeout(() => {
        router.replace("/myAccount");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasUserAccount, hasNewMarket, router, userAddress]);

  const toggleEditPostModal = (
    value,
    postId,
    owner,
    title,
    image,
    description,
    price,
    priceOffer
  ) => {
    setCurrentEditPostID(postId);
    //Open modal
    setEditPostModalOpen(value);
    setTitleOwner(title);
    setImageOwner(image);
    setDescriptionOwner(description);
    setPriceOwner(price), setPriceOfferOwner(priceOffer);
  };

  const toggleEditMarketModal = (
    MarketId,
    value,

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
  ) => {
    setCurrentEditMarketID(MarketId);
    //Open modal
    setEditMarketModalOpen(value);
    setNameOwner(market_name);
    setFocusOwner(market_focuses_on);
    setAvailableOwner(market_available);
    setEmailOwner(email), setStreetOwner(street);
    setStateOwner(state),
      setColoniaOwner(colonia),
      setMunicipioOwner(municipio),
      setZipOwner(zip),
      setNum_extOwner(num_ext),
      setNum_intOwner(num_int),
      setNumber_phoneOwner(number_phone),
      setLatOwner(lat),
      setLongOwner(long);
  };
  return (
    <MainLayout>
      <>
        {isConnected && !hasNewMarket && (
          <>
            <div
              className={styles.myMarket_CreatePost_Button}
              onClick={() => setShowCreateMarketModal(!showCreatMarketModal)}
            >
              <HiPlus className={styles.HiPlus} size={50} />

              <a>Add Market</a>
            </div>

            <CreateMarketModal
              showModal={showCreatMarketModal}
              setShowModal={setShowCreateMarketModal}
            />
          </>
        )}

        {isConnected && hasUserAccount && hasNewMarket && (
          <>
            <div className={styles.myMarket_CreatePost_Wrapper}>
              <div
                className={styles.myMarket_CreatePost_Button}
                onClick={() => setShowCreatePostModal(true)}
              >
                <HiPlus className={styles.HiPlus} size={50} />
                <CreatePostForm
                  showModal={showCreatePostModal}
                  setShowModal={setShowCreatePostModal}
                />
                <a>Add product</a>
              </div>
              <div
                className={styles.myMarket_CreatePost_Button}
                onClick={() => setEditMarketModalOpen(true)}
              >
                <AiOutlineEdit className={styles.HiPlus} size={50} />

                <a>Edit Market</a>
              </div>
            </div>
          </>
        )}

        <>
          <div className={styles.myMarket_Market}>
            {markets
              ? markets.map((market, i) => (
                  <>
                    {market.owner.toString() == publicKey?.toString() && (
                      <>
                        {!editMarketModalOpen && (
                          <FeedMarket
                            data={market}
                            key={i}
                            walletKey={wallet?.publicKey}
                          />
                        )}
                        {editMarketModalOpen && (
                          <CreateMarketModal
                            showModal={editMarketModalOpen}
                            setShowModal={setEditMarketModalOpen}
                            editMarket={true}
                            marketOwner={market}
                          />
                        )}
                      </>
                    )}
                  </>
                ))
              : "L O A D I N G   M A R K E T. . . "}
          </div>
          {!editMarketModalOpen && (
            <div className={styles.myMarket_Posts}>
              {posts
                ? posts.map((post, i) => (
                    <>
                      {/* {console.log("POOOOOOOOST",post.account.owner.toString(),"MY WALLEEEEEEEEET",publicKey.toString())} */}
                      {post.account.owner.toString() ==
                      publicKey?.toString() ? (
                        <>
                          <FeedItem
                            data={post}
                            key={i}
                            walletKey={wallet?.publicKey}
                            setEditPostModalOpen={setEditPostModalOpen}
                            toggleEditPostModal={toggleEditPostModal}
                          />
                          <EditPostModal
                            data={post}
                            titleOwner={titleOwner}
                            imageOwner={imageOwner}
                            descriptionOwner={descriptionOwner}
                            priceOwner={priceOwner}
                            priceOfferOwner={priceOfferOwner}
                            editPostModalOpen={editPostModalOpen}
                            setEditPostModalOpen={setEditPostModalOpen}
                            currentEditPostID={currentEditPostID}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                    </>
                  ))
                : "L o a d i n g ..."}
            </div>
          )}
        </>
      </>
    </MainLayout>
  );
}

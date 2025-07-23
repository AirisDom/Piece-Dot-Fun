import React, { useState, useEffect, useRef } from "react";
import { TbNotes } from "react-icons/tb";
import {
  HiPlus,
  HiUserAdd,
  HiOutlineBriefcase,
  HiCurrencyDollar,
  HiOutlineCurrencyYen,
  HiOutlineCubeTransparent,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { AiOutlineEdit } from "react-icons/ai";
import { MdOutlineAddHomeWork } from "react-icons/md";
//componentes
import CreateAccountForm from "@/components/Account/CreateAccountForm";
import CreatePostForm from "@/components/Market/MarketPost/CreatePostForm";
import CreateMarketForm from "@/components/Market/MarketAccount/CreateMarketForm";
import CreateShippingModal from "@/components/Account/CreateAccountForm/ShippingAccount/CreateShippingForm";
import CreateSolanaForm from "@/components/Payment/SolanaPayForm";
import FeedItem from "@/components/Market/Items/FeedItem/FeedItem";
import EditPostForm from "../components/Market/MarketPost/EditPostForm/EditPostForm";
import MyShipping from "@/components/Account/CreateAccountForm/MyShipping/MyShipping";
//hooks
import { useProfile } from "@/hooks/useProfile";
import { useProgramState } from "@/hooks/useProgram";
import { useUserContext } from "@/hooks/useUserProgram";
import { usePostContext } from "@/hooks/usePostProgram";
import MainLayout from "@/layouts/MainLayout";
import { useCustomToken } from "@/hooks/useCustomToken";
import styles from "./myAccount.module.scss";
import { useRouter } from "next/router";
import UtilsUser from "@/utils/web3/User/UtilsUser";
import MyTxs from "@/components/Account/MyTxs/MyTxs";

export default function myAccount(props) {
  const router = useRouter();
  const { connected, publicKey, avatar, setAvatar, userAddress } = useProfile();
  const {
    marketId,
    hasNewMarket,
    shippings,
    balances,
    transactions,
    createBalance,
  } = useProgramState();
  const { posts } = usePostContext();
  const { isConnected, hasUserAccount } = useUserContext();
  const [showToast, setShowToast] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateMarketModal, setShowMarketPostModal] = useState(false);
  const [showCreateShippingModal, setShowCreateShippingModal] = useState(false);
  const [showShippingListModal, setShowShippingListModal] = useState(true);
  const [showTxsModal, setShowTxsModal] = useState(false);
  const [editPostModalOpen, setEditPostModalOpen] = useState(false);
  const [currentEditPostID, setCurrentEditPostID] = useState(null);
  const [titleOwner, setTitleOwner] = useState(null);
  const [imageOwner, setImageOwner] = useState(null);
  const [descriptionOwner, setDescriptionOwner] = useState(null);
  const [priceOwner, setPriceOwner] = useState(null);
  const [priceOfferOwner, setPriceOfferOwner] = useState(null);

  const [text, setText] = useState("");

  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [state, setState] = useState("");
  const [colonia, setColonia] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [zip, setZip] = useState("");
  const [num_ext, setNum_ext] = useState("");
  const [num_int, setNum_int] = useState("");
  const [number_phone, setNumber_phone] = useState("");
  const [address, setAddress] = useState({});
  const [markerPosition, setMarkerPosition] = useState(undefined);
  const [userAddresses, setUserAddresses] = useState([]);
  const [label, setLabel] = useState("");

  const [lat, setLat] = useState("");
  const [long, setLong] = useState("");

  const titleModal = `Create Market`;
  const { createMarket } = useProgramState();

  console.log("balances ", balances);
  console.log("transactions ", transactions);

  // Function to target which post is being edited
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

  const wallet = "111111111111111111";
  const {
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    getTokenBalance,
  } = useCustomToken();

  const onPay = async () => {
    const balance = await getTokenBalance();
    console.log(balance);
  };

  const handleClick = async (modal) => {
    setShowCreateAccountModal(false);
    setShowCreatePostModal(false);
    setShowCreateShippingModal(false);
    setShowMarketPostModal(false);
    setShowTxsModal(false);
    setShowShippingListModal(false);
    // await createBalance("1", "100", "Date.now()");
    // return null;
    switch (modal) {
      case "Account":
        setShowCreateAccountModal(true);
        break;
      case "Post":
        setShowCreatePostModal(true);
        break;
      case "Shipping":
        setShowCreateShippingModal(true);
        break;
      case "Market":
        setShowMarketPostModal(true);
        break;
      case "List":
        setShowShippingListModal(true);
        break;
      case "txs":
        setShowTxsModal(true);

        break;
    }
  };

  const onCreate = (e) => {};

  useEffect(() => {
    if (publicKey) console.log(publicKey);
    if (shippings) {
      const addresses = UtilsUser.getUserAddressesByWallet(
        shippings,
        userAddress
      );
      setUserAddresses(addresses);
      console.log(addresses);
    }
  }, [shippings, userAddress]);

  return (
    <>
      <MainLayout>
        <>
          {/* Vista usuario conectado sin registrarse */}
          {isConnected && !hasUserAccount && (
            <>
              <div className={styles.newUser_Wrapper}>
                <div
                  className={styles.new}
                  onClick={() => setShowCreateAccountModal(true)}
                >
                  <HiUserAdd className={styles.HiUserAdd} size={50} />
                  <CreateAccountForm
                    showModal={showCreateAccountModal}
                    setShowModal={setShowCreateAccountModal}
                  />
                  <a>Create a User</a>
                </div>
              </div>
            </>
          )}
          {/* Vista usuario conectado y registrado */}
          {isConnected && hasUserAccount && (
            <>
              <div className={styles.newWrapper}>
                <div
                  className={styles.new}
                  onClick={() => {
                    handleClick("Shipping");
                  }}
                >
                  <AiOutlineEdit className={styles.HiPlus} size={50} />

                  <a>Add Address</a>
                </div>
                <div
                  className={styles.new}
                  onClick={() => {
                    handleClick("List");
                  }}
                >
                  <MdOutlineAddHomeWork className={styles.HiPlus} size={50} />

                  <a>Adresses</a>
                </div>

                <div
                  className={styles.new}
                  onClick={() => {
                    handleClick("txs");
                  }}
                >
                  <TbNotes className={styles.HiPlus} size={50} />

                  <a>Movements</a>
                </div>

                <div
                  className={styles.new}
                  onClick={() => setShowCreateAccountModal(true)}
                >
                  <HiCurrencyDollar
                    className={styles.HiCurrencyDollar}
                    size={50}
                  />
                  <CreateSolanaForm
                    showModal={showCreateAccountModal}
                    setShowModal={setShowCreateAccountModal}
                  />
                  <a>Solana Transfer</a>
                </div>
              </div>
            </>
          )}

          {/* Vista de direcciones */}
          {showShippingListModal && (
            <>
              <div className={styles.myPosts}>
                {userAddresses
                  ? userAddresses.map((shipping, i) => (
                      <>
                        <>
                          <MyShipping
                            data={shipping}
                            key={i}
                            //walletKey={wallet?.publicKey}
                          />
                        </>
                      </>
                    ))
                  : "L o a d i n g ..."}
              </div>
            </>
          )}

          {/* Vista de mapa para agregar direccion */}
          {showCreateShippingModal && (
            <>
              <CreateShippingModal
                label={label}
                setLabel={setLabel}
                email={email}
                setEmail={setEmail}
                street={street}
                setStreet={setStreet}
                state={state}
                setState={setState}
                colonia={colonia}
                setColonia={setColonia}
                municipio={municipio}
                setMunicipio={setMunicipio}
                zip={zip}
                setZip={setZip}
                num_ext={num_ext}
                setNum_ext={setNum_ext}
                num_int={num_int}
                setNum_int={setNum_int}
                number_phone={number_phone}
                setNumber_phone={setNumber_phone}
                lat={lat}
                setLat={setLat}
                long={long}
                setLong={setLong}
                onCreate={onCreate}
                address={address}
                markerPosition={markerPosition}
                showToast={showToast}
                setShowToast={setShowToast}
                setAddress={setAddress}
                setMarkerPosition={setMarkerPosition}
                setText={setText}
                text={text}
              />
            </>
          )}

          {showTxsModal && (
            <>
              <MyTxs />
            </>
          )}
        </>
      </MainLayout>
    </>
  );
}

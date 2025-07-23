import { useState, useEffect } from "react";
import { getAvatarUrl } from "../utils/getAvatarUrl";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";

export const useProfile = () => {
  const [avatar, setAvatar] = useState("");
  const [userAddress, setUserAddress] = useState(undefined);
  const { connected, publicKey, sendTransaction } = useWallet();

  // Get Avatar based on the userAddress
  useEffect(() => {
    if (connected) {
      //console.log("User connected!");
      setAvatar(getAvatarUrl(publicKey.toString()));
      setUserAddress(publicKey.toBase58());
    } else {
      setAvatar(getAvatarUrl("default"));
      setUserAddress();
    }
  }, [connected]);

  return {
    connected,
    publicKey,
    avatar,
    setAvatar,
    userAddress,
  };
};

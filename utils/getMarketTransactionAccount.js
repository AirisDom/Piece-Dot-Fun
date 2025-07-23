import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

//Get PostAccount intormation by Pubkey
export const getMarketTransactionAccountPk = async (owner, id) => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("post"),
        owner.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 8), //Read ID
      ],
      PROGRAM_ID
    )
  )[0];
};

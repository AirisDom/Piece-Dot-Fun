import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

//Get BalanceAccount intormation by Pubkey
export const getBalanceAccountPk = async (owner, id) => {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('balance'),
        owner.toBuffer(),
        new BN(id).toArrayLike(Buffer, "le", 8), //Read ID
      ],
      PROGRAM_ID
    )
  )[0];
};

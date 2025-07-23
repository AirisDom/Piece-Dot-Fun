import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

//Get UserAccount intormation by Pubkey
export const getUserAccountPk = async (owner) => {
  //Communicating with the blockchain
  //Putting the seeds
  return (
    await PublicKey.findProgramAddress(
      [Buffer.from("user"), owner.toBuffer()], //Passing the user,owner seeds
      PROGRAM_ID
    )
  )[0];
};

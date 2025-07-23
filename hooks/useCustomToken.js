import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

import * as splToken from "@solana/spl-token";
import { web3, Wallet } from "@project-serum/anchor";

export const useCustomToken = () => {
  const { TOKEN_PROGRAM_ID, TOKEN_TRANSFER_AMOUNT_OFFSET } = splToken;
  const wallet = useWallet();

  const connection = new Connection("https://api.devnet.solana.com");

  const tokenPublicKey = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );

  const tokenAddress = "33cSvzJ3YNQHauRNWLtZ2fSkaNpzP9nnVbTzrs51rgRm";

  const [amount, setAmount] = useState(0);
  const [receiver, setReceiver] = useState("");
  const [transactionPurpose, setTransactionPurpose] = useState("");
  const [tokenBalance, setTokenBalance] = useState("");

  const getTokenAccount = async () => {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    const specificTokenAccount = tokenAccounts.value.find(
      (account) =>
        account.account.data.parsed.info.mint === tokenAddress.toString()
    );
    return specificTokenAccount;
  };

  const getTokenBalance = async () => {
    if (!wallet.connected) {
      return "0";
    }

    const tokenAccount = await getTokenAccount();

    if (tokenAccount === null) {
      return "0";
    }

    return tokenAccount.account.data.parsed.info.tokenAmount.uiAmountString;
  };

  // ...
  return {
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    tokenBalance,
    getTokenBalance,
  };
};

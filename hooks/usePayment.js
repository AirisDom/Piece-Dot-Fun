import { useState, useEffect } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";

export const usePayment = () => {
  const [avatar, setAvatar] = useState("");
  const [userAddress, setUserAddress] = useState("404");
  const { connected, publicKey, sendTransaction } = useWallet();

  // const [amount, setAmount] = useState(0)
  const [receiver, setReceiver] = useState("");
  const [transactionPurpose, setTransactionPurpose] = useState("");

  const [newTransactionModalOpen, setNewTransactionModalOpen] = useState(false);
  const [newDepositModalOpen, setNewDepositModalOpen] = useState(false);

  const [amount, setAmount] = useState(0);
  const { connection } = useConnection();

  //Local Storage
  const useLocalStorage = (storageKey, fallbackState) => {
    const [value, setValue] = useState(
      JSON.parse(localStorage.getItem(storageKey)) ?? fallbackState
    );
    useEffect(() => {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }, [value, setValue]);
    return [value, setValue];
  };

  const [transactions, setTransactions] = useLocalStorage("transactions", []);

  //Transaccion
  const makeTrasaction = async (fromWallet, toWallet, amount, reference) => {
    const network = WalletAdapterNetwork.Devnet;
    //endpoint = El RPC (Puede ser el de QuickNode)
    const endpoint = clusterApiUrl(network); //Default para la DevNet
    //Pluggin de conexion para nuestro endpoint
    const connection = new Connection(endpoint);
    //Obtencion del blockhash para introducir la transaccion
    const { blockhash } = await connection.getLatestBlockhash(
      "Get Latest Blockhask"
    );
    //#Objeto para la transaccion
    const transaccion = new Transaction({
      //Propiedades de la transaccion
      recentBlockhash: blockhash,
      feePayer: fromWallet, //La comision se cobra para quien transfiere/paga
    });
    //#Objeto para la instruccion
    //SytemProgram hace el handle de la transaccion
    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromWallet,
      lamports: amount.multipliedBy(LAMPORTS_PER_SOL).toNumber(), //Fragmenta Solana en unidades mas pequeñas
      toPubkey: toWallet,
    });
    //Query para la ref de la transaccion
    transferInstruction.keys.push({
      pubkey: reference,
      isSigner: false,
      isWritable: false,
    });
    transaccion.add(transferInstruction);

    return transaccion;
  };

  //Funcion para ejecutar la transaccion (Boton)
  const doTransaction = async ({ amount, receiver, transactionPurpose }) => {
    const fromWallet = publicKey;
    const toWallet = new PublicKey(receiver); //Toma el string y lo pasa como publicKey
    console.log(receiver);
    const bnAmount = new BigNumber(amount); //Details
    const reference = Keypair.generate().publicKey; //Random PublicKey para la ref
    const transaccion = await makeTrasaction(
      fromWallet,
      toWallet,
      bnAmount,
      reference
    );

    const txnHash = await sendTransaction(transaccion, connection);
    console.log(txnHash); //Visualizamos el hask para consultarlo en SolScan

    //Historial de transacciones
    const newID = (transactions.length + 1).toString(); //Comienza en 0, por eso + 1
    //Objeto (Se almacenara en el Array del LocalStorage)
    const newTransaction = {
      id: newID,
      from: {
        name: publicKey,
        handle: publicKey,
        avatar: avatar,
        verified: true,
      },
      to: {
        name: receiver,
        handle: "-",
        avatar: getAvatarUrl(receiver.toString()), //Se debe obtener en String ya que requerimos la PublicKey
        verified: false,
        txnHash: txnHash,
      },
      //Al seleccionar arrojara la descripcion
      description: transactionPurpose,
      transactionDate: new Date(),
      status: "Completed",
      amount: amount,
      source: "-",
      identifier: "-",
      //txnHash: txnHash
    };

    console.log(txnHash);
    setNewTransactionModalOpen(false); //Close modal
    setTransactions([newTransaction, ...transactions]); //... obtiene todo el array de transacciones de manera ordenada
  };

  return {
    connected,
    publicKey,
    avatar,
    userAddress,
    doTransaction,
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    transactions,
    setTransactions,
    setNewTransactionModalOpen,
    newTransactionModalOpen,
  };
};

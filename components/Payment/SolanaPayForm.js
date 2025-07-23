import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useProgramState } from "@/hooks/useProgram";
import { usePayment } from "@/hooks/usePayment";
import MainModal from "../Modal/MainModal/MainModal";
import styles from "./SolanaPayForm.module.scss";

export default function CreateSolanaForm(props) {
  const { showModal, setShowModal } = props;

  const {
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    doTransaction,
  } = usePayment();

  //Modal para mostrar y quitar el form
  const titleModal = `Solana Pay`;

  // const { createUser } = useProgramState();

  // const onShowModal = () => setShowModal(true);
  // const onCloseModal = () => setShowModal(false);

  // const onCreate = async (e) => {
  //   e.preventDefault();

  //   await createUser(amount, Receiver, TransactionPurpose);

  //   onCloseModal();
  // };

  const onAmountInput = (e) => {
    e.preventDefault();
    const newAmount = e.target.value;

    setAmount(newAmount);

    const input = document.querySelector("input#amount");
  };

  const onPay = async () => {
    // Pay and add transaction funcationallity goes here!
    await doTransaction({ amount, receiver, transactionPurpose });
    // Clear states
    setAmount(0);
    setReceiver("");
    setTransactionPurpose("");
  };

  return (
    <>
      <MainModal show={showModal} setShow={setShowModal} title={titleModal}>
        {/* children*/}
        <UserForm
          //setamount={setamount}
          amount={amount}
          setAmount={setAmount}
          receiver={receiver}
          setReceiver={setReceiver}
          transactionPurpose={transactionPurpose}
          setTransactionPurpose={setTransactionPurpose}
          doTransaction={doTransaction}
          onAmountInput={onAmountInput}
          onPay={onPay}
        />
      </MainModal>
    </>
  );
}

function UserForm(props) {
  const {
    amount,
    setAmount,
    receiver,
    setReceiver,
    transactionPurpose,
    setTransactionPurpose,
    doTransaction,
    onAmountInput,
    onPay,
  } = props;

  return (
    <div className={styles.createSolanaPay_wrapper}>
      <div className={styles.createSolanaPay_form}>
        <label htmlFor="amount">
          <span>Amount</span>
          <input
            value={amount}
            onChange={onAmountInput}
            min={0}
            type="number"
            id="Amount"
            name="Amount"
          />
        </label>

        <label htmlFor="Receiver">
          <span>Receiver</span>
          <input
            onChange={(e) => setReceiver(e.target.value)}
            value={receiver}
            type="text"
            id="Receiver"
            name="Receiver"
            placeholder="Wallet (PublicKey)"
          />
        </label>

        <label htmlFor="TransactionPurpose">
          <span>TransactionPurpose</span>
          <input
            onChange={(e) => setTransactionPurpose(e.target.value)}
            value={transactionPurpose}
            type="text"
            id="TransactionPurpose"
            name="TransactionPurpose"
            placeholder="Lambo, Holidays, etc."
          />
        </label>
      </div>

      <div className={styles.createSolanaPay_button}>
        <button onClick={onPay} type="button">
          PAY
        </button>
      </div>
    </div>
  );
}

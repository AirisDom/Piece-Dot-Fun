import dayjs from "dayjs";

const UtilsUser = {};

UtilsUser.getUserAddressesByWallet = (shippings, wallet) => {
  const data = shippings
    .filter((shipping) => shipping.account?.owner.toString() === wallet)
    .map((shipping) => {
      let newAccount = { ...shipping.account };

      newAccount.shippingID = shipping.publicKey;
      return newAccount;
    });

  return data;
};

UtilsUser.getAccountTxsByWallet = (
  transactions,
  marketTransactions,
  balances,
  wallet
) => {

  
  let userBalances = balances.filter(
    (balance) => balance.owner.toString() === wallet
  );

  let sumBalancesAmount = userBalances.reduce((acc, balance) => {
    if (balance.tp == 1) {
      return acc + parseFloat(balance.amount);
    }
    if (balance.tp == 0) {
      return acc - parseFloat(balance.amount);
    }
    return acc;
  }, 0);

  let userTransactions = transactions
    .filter((transaction) => transaction.account.owner.toString() === wallet)
    .map((transaction) => {
      let newAccount = { ...transaction.account };

      newAccount.transactionID = transaction.publicKey;
      return newAccount;
    });

  let sumTransactionsAmount = userTransactions.reduce((acc, transaction) => {
    //transaccion firmada
    if (transaction.verify == 1) {
      if (transaction.tx == wallet) return acc - parseFloat(transaction.amount);
    }

    return acc;
  }, 0);

  let userMarketTransactions = marketTransactions.filter(
    (marketTransaction) => marketTransaction.owner.toString() === wallet
  );

  let sumUserMarketTransactions = userMarketTransactions.reduce(
    (acc, marketTransaction) => {
      if (marketTransaction.verify == 1) {
        if (marketTransaction.delivered === 1) {
          const correspondingTransaction = transactions.find(
            (transaction) =>
              transaction.publicKey.toString() === marketTransaction.order_id
          );

          if (
            correspondingTransaction &&
            correspondingTransaction.account.delivered === 1
          ) {
            return acc + parseFloat(marketTransaction.amount);
          } else {
            if (marketTransaction.timestamp_delivered) {
              const oneDay = 24 * 60 * 60 * 1000;
              const transactionTime = new Date(
                marketTransaction.timestamp_delivered
              );
              const currentTime = new Date();

              if (currentTime - transactionTime > oneDay) {
                return acc + parseFloat(marketTransaction.amount);
              }
            }
          }
        }
      }
      return acc;
    },
    0
  );

  const accountRealBalance =
    parseFloat(sumBalancesAmount) +
    parseFloat(sumTransactionsAmount) +
    parseFloat(sumUserMarketTransactions);

  return {
    userBalances,
    sumBalancesAmount,
    userTransactions,
    sumTransactionsAmount,
    userMarketTransactions,
    sumUserMarketTransactions,
    accountRealBalance,
  };
};

UtilsUser.filterBalanceByParams = (balanceTxs, txStatus, txTimestamp) => {
  return balanceTxs.filter((tx) => {
    if (
      (txStatus === "Ingresos" && tx.tp !== "1") ||
      (txStatus === "Retiros" && tx.tp !== "0")
    ) {
      return false;
    }
    if (txTimestamp !== "todas") {
      let daysDiff;
      const days = txTimestamp === "últimos 7 días" ? 7 : 30;

      if (/^\d+$/.test(tx.timestamp)) {
        const txDate = new Date(Number(tx.timestamp));
        daysDiff = dayjs().diff(dayjs(txDate), "day");
      } else {
        const txDate = dayjs(tx.timestamp, "D-M-YYYY H:m:s");
        daysDiff = dayjs().diff(txDate, "day");
      }

      if (daysDiff > days) {
        return false;
      }
    }

    return true;
  });
};

UtilsUser.filterTransactionsByParams = (
  transactions,
  transactionsTxs,
  txStatus,
  txTimestamp
) => {
  return transactionsTxs.filter((tx) => {
    if (
      (txStatus === "Solicitadas" && tx.verify !== "1") ||
      (txStatus === "Entregadas" && tx.delivered !== "1")
    ) {
      return false;
    }

    if (txTimestamp !== "todas") {
      let daysDiff;
      const days = txTimestamp === "últimos 7 días" ? 7 : 30;

      if (/^\d+$/.test(tx.timestampVerify)) {
        const txDate = new Date(Number(tx.timestampVerify));
        daysDiff = dayjs().diff(dayjs(txDate), "day");
      } else {
        const txDate = dayjs(tx.timestampVerify, "D-M-YYYY H:m:s");
        daysDiff = dayjs().diff(txDate, "day");
      }

      if (daysDiff > days) {
        return false;
      }
    }

    return true;
  });
};

UtilsUser.filterMarketTransactionsByParams = (
  transactions,
  marketTransactionsTxs,
  txStatus,
  txTimestamp
) => {
  return marketTransactionsTxs.filter((tx) => {
    if (
      (txStatus === "Aceptadas" && tx.verify !== "1") ||
      (txStatus === "Entregadas" &&
        (tx.delivered !== "1" ||
          dayjs(tx.timestamp_delivered).isBefore(
            dayjs(tx.timestamp_verify).add(1, "day")
          )))
    ) {
      return false;
    }

    if (txTimestamp !== "todas") {
      let daysDiff;
      const days = txTimestamp === "últimos 7 días" ? 7 : 30;

      if (/^\d+$/.test(tx.timestamp_verify)) {
        const txDate = new Date(Number(tx.timestamp_verify));
        daysDiff = dayjs().diff(dayjs(txDate), "day");
      } else {
        const txDate = dayjs(tx.timestamp_verify, "D-M-YYYY H:m:s");
        daysDiff = dayjs().diff(txDate, "day");
      }

      if (daysDiff > days) {
        return false;
      }
    }

    return true;
  });
};

export default UtilsUser;

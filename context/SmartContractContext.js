//To use our Context
import { createContext, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Toast, toast } from "react-hot-toast"; //notify
//Functions from SmartContract (Program)
import { getProgram } from "../utils/getProgramIdl";
import { getUserAccountPk } from "@/utils/getUserAccount";
import { getPostAccountPk } from "@/utils/getPostAccount";
import { getMarketAccountPk } from "@/utils/getMarketAccount";
import { getShippingAccountPk } from "@/utils/getShippinngAccount";
import { getBalanceAccountPk } from "@/utils/getBalanceAccount";
import { getTransactionAccountPk } from "@/utils/getTransactionAccount";
import { getMarketTransactionAccountPk } from "@/utils/getMarketTransactionAccount";
//Context
export const SmartProgramContext = createContext({
  isConnected: null,
  wallet: null,
  createUser: null,
  hasUserAccount: null,
  hasNewMarket: null,
  post: null,
  fetchPosts: null,
  updatePost: null,
  market: null,
  fetchMarkets: null,
  marketId: null,
  fetchShippings: null,
  shippingId: null,
  fetchTransactions: null,
  transactionId: null,
  fetchMarketTransactions: null,
  marketTransactionId: null,
  fetchBalances: null,
  balanceId: null,
});

export const ProgramState = ({ children }) => {
  const [program, setProgram] = useState(); //Get the program and set it in our state to use anywhere
  const [isConnected, setIsConnected] = useState(); //To check connection
  const [userAccount, setUserAccount] = useState(); //Save user account to fetch
  const [anyMarket, setAnyMarket] = useState();
  const [posts, setPosts] = useState(); //To the xample this is ([])
  const [markets, setMarkets] = useState();
  const [shippings, setShippings] = useState();
  const [transactions, setTransactions] = useState();
  const [marketTransactions, setMarketTransactions] = useState();
  const [balances, setBalances] = useState();

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  //Set SmartContract
  useEffect(() => {
    //Run when on create on upload on delete an component
    if (connection) {
      setProgram(getProgram(connection, wallet ?? {})); //Acces to the program, if not wallet,  ?? {} return empty
      // console.log("THIS IS MY PROGRAM: ", program);
    } else {
      setProgram(null);
    }
  }, [connection, wallet]); //if [] will run when the page fist loads, [connection] when connection

  //1- Check wallet connection
  useEffect(() => {
    setIsConnected(!!wallet?.publicKey); //True or false
  }, [wallet]);

  //2- Check for a user account by fetching the user
  const fetchUserAccount = useCallback(async () => {
    //console.log("Here the program can be read : ", program);
    //UseCallback is like useEffect but not going to re-render unless the dependency is changed, not re-render all our props
    if (!program) {
      return;
    }
    try {
      //Passing the seeds
      const userAccountPk = await getUserAccountPk(wallet?.publicKey);
      //console.log(userAccountPk);
      const userAccount = await program.account.user.fetch(userAccountPk);
      //Get lastMarketID to know user hasMarket
      const anyMarket = userAccount.lastMarketId.toNumber();
      console.log("market ID", anyMarket);
      setAnyMarket(anyMarket);
      //console.log("User found!");
      setUserAccount(userAccount);
    } catch (e) {
      setUserAccount(null);
      //      console.log("No user found!");
    }
  });

  //3- Check for user account
  useEffect(() => {
    fetchUserAccount();
  }, [isConnected]);

  //4- Create User
  //call the paramet we nedee
  const createUser = useCallback(
    async (
      first_name,
      second_name,
      first_last_name,
      second_last_name,
      device_id
    ) => {
      if (program && wallet.publicKey) {
        //Validation
        try {
          //Calling function from SmartContract
          const txHash = await program.methods
            .createUser(
              first_name,
              second_name,
              first_last_name,
              second_last_name,
              device_id
            )
            //Passing in the accounts it needs right
            .accounts({
              user: await getUserAccountPk(wallet.publicKey),
              owner: wallet.publicKey,
            })
            .rpc();
          await connection.confirmTransaction(txHash); //Confirm transaction
          toast.success("Created user!");
          await fetchUserAccount();
        } catch (e) {
          console.log("Couldn't create user", e.message);
          //toast.error("Creating user failed!");
        }
      }
    }
  );

  // POST
  // Check for a post account by fetching
  const fetchPosts = useCallback(async () => {
    if (!program) return;
    //Feching all the post that exist from the program
    const posts = await program.account.post.all();
    setPosts(posts.map((post) => post.account)); //((post)) map for every post
  }, [program]);
  //Ensure that it's always fetching the posts as it comes or if anything changes
  useEffect(() => {
    if (!posts) {
      fetchPosts();
    }
  }, [posts, fetchPosts]);

  // -Program Events
  useEffect(() => {
    if (!program) return;

    //New Post Event
    const newPostEventListener = program.addEventListener(
      "NewPostEvent", //From SmartContract
      async (postEvent) => {
        try {
          const postAccountPk = await getPostAccountPk(
            postEvent.owner,
            postEvent.id
          );
          //Here the post now is created
          const newPost = await program.account.post.fetch(postAccountPk);
          //The new post gets added to that list post
          setPosts((posts) => [newPost, ...posts]);
        } catch (e) {
          console.log("Couldn't fetch new post account", postEvent, e);
        }
      }
    );

    //Update Post Event
    const updatePostEventListener = program.addEventListener(
      //event we listening for
      "UpdatePostEvent", //From SmartContract
      async (updateEvent) => {
        try {
          const postAccountPk = await getPostAccountPk(
            updateEvent.owner,
            updateEvent.id
          );
          //Here the post now is created
          const updatedPost = await program.account.post.fetch(postAccountPk);
          //The new post gets added to that list post
          setPosts(
            (posts) =>
              posts.map((post) => {
                //for every post
                if (
                  post.owner.equals(updatedPost.owner) &&
                  post.id.eq(updatedPost.id)
                ) {
                  return updatedPost;
                }
                return post;
              }) //mapping through to create
          ); //Seting the post to an array
        } catch (e) {
          console.log("Couldn't fetch update post account", updateEvent, e);
        }
      }
    );

    return () => {
      //remove the event listeners
      program.removeEventListener(newPostEventListener);
    };
  }, [program]); //run once if the program ever changes

  //Create Post
  const createPost = useCallback(
    async (title, image, description, price, priceOffer, available) => {
      if (!userAccount) return;
      try {
        //console.log("In try...");
        const postId = userAccount.lastPostId.addn(1); //Get last post id
        //console.log(postId.toNumber());
        const txHash = await program.methods
          .createPost(
            title,
            image,
            description,
            price,
            priceOffer,
            available,
            postId
          )
          .accounts({
            post: await getPostAccountPk(wallet.publicKey, postId.toNumber()),
            user: await getUserAccountPk(wallet.publicKey),
            owner: wallet.publicKey,
          })
          .rpc();
        await connection.confirmTransaction(txHash); //Confirm transaction
        toast.success("Post created!");
        //Update user account
        await fetchUserAccount();
      } catch (e) {
        toast.error("Creating post failed!");
        console.log(e.message);
      }
    }
  );

  const updatePost = useCallback(
    async (
      owner,
      id,
      available,
      title,
      image,
      description,
      price,
      priceOffer
    ) => {
      if (!userAccount) return;
      try {
        console.log("update i...", id);
        console.log("by owner...", owner);
        console.log("available...", available);
        const txHash = await program.methods
          .updatePost(title, image, description, price, priceOffer, available)
          .accounts({
            post: await getPostAccountPk(owner, id),
            owner,
          })
          .rpc();
        toast.success("Caption updated!");
      } catch (e) {
        toast.error("failed to update post!");
        console.log(e.message);
      }
    }
  );

  //-----------------MARKET--------------------

  // Check for a market account by fetching
  const fetchMarket = useCallback(async () => {
    if (!program) return;
    const fetchedMarket = await program.account.market.all();
    setMarkets(fetchedMarket.map((market) => market.account));
  }, [program]);

  useEffect(() => {
    if (!markets) {
      fetchMarket();
    }
  }, [markets, fetchMarket]);
  //console.log("markets", markets);
  // -Program Events
  useEffect(() => {
    if (!program) return;

    //New Market Event
    const newMarketEventListener = program.addEventListener(
      "NewMarketEvent", //From SmartContract
      async (marketEvent) => {
        try {
          const marketAccountPk = await getMarketAccountPk(
            marketEvent.owner,
            marketEvent.id
          );
          //Here the market now is created
          const newMarket = await program.account.market.fetch(marketAccountPk);
          //The new market gets added to that list market
          setMarkets((markets) => [newMarket, ...markets]);
        } catch (e) {
          console.log("Couldn't fetch new market account", marketEvent, e);
        }
      }
    );

    //Update Market Event
    const updateMarketEventListener = program.addEventListener(
      //event we listening for
      "UpdateMarketEvent", //From SmartContract
      async (updateEvent) => {
        try {
          const marketAccountPk = await getMarketAccountPk(
            updateEvent.owner,
            updateEvent.id
          );
          //Here the market now is created
          const updatedMarket = await program.account.market.fetch(
            marketAccountPk
          );
          //The new market gets added to that list market
          setMarkets(
            (markets) =>
              markets.map((market) => {
                //for every market
                if (
                  market.owner.equals(updatedMarket.owner) &&
                  market.id.eq(updatedMarket.id)
                ) {
                  return updatedMarket;
                }
                return market;
              }) //mapping through to create
          ); //Seting the market to an array
        } catch (e) {
          console.log("Couldn't fetch update market account", updateEvent, e);
        }
      }
    );

    return () => {
      //remove the event listeners
      program.removeEventListener(newMarketEventListener);
    };
  }, [program]); //run once if the program ever changes

  //Create market
  const createMarket = useCallback(
    async (
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
      if (!userAccount) return;
      try {
        console.log("In try...");
        const marketId = userAccount.lastMarketId.addn(1); //Get last market id
        const txHash = await program.methods
          .createMarket(
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
            long,
            marketId
          )
          .accounts({
            market: await getMarketAccountPk(
              wallet.publicKey,
              marketId.toNumber()
            ),
            user: await getUserAccountPk(wallet.publicKey),
            owner: wallet.publicKey,
          })
          .rpc();
        await connection.confirmTransaction(txHash); //Confirm transaction
        toast.success("market created!");
        //Update market account
        await fetchUserAccount();
      } catch (e) {
        toast.error("Creating market failed!");
        console.log(e.message);
      }
    }
  );

  const updateMarket = useCallback(
    async (
      owner,
      id,
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
      if (!userAccount) return;
      try {
        console.log("update i...", id);
        console.log("by owner...", owner);
        console.log("available...", market_available);
        const txHash = await program.methods
          .updateMarket(
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
          )
          .accounts({
            market: await getMarketAccountPk(owner, id),
            owner,
          })
          .rpc();
        toast.success("Caption updated!");
      } catch (e) {
        toast.error("failed to update market!");
        console.log(e.message);
      }
    }
  );

  //-----------------SHIPPING--------------------

  // Check for a shipping account by fetching
  const fetchShipping = useCallback(async () => {
    if (!program) return;
    const fetchedShipping = await program.account.shipping.all();
    setShippings(fetchedShipping.map((shipping) => shipping));
  }, [program]);

  useEffect(() => {
    if (!shippings) {
      fetchShipping();
    }
  }, [shippings, fetchShipping]);
  console.log("shippings", shippings);
  // -Program Events
  useEffect(() => {
    if (!program) return;

    //New Shipping Event
    const newShippingEventListener = program.addEventListener(
      "NewShippingEvent", //From SmartContract
      async (shippingEvent) => {
        try {
          const shippingAccountPk = await getShippingAccountPk(
            shippingEvent.owner,
            shippingEvent.id
          );
          //Here the shipping now is created
          const newShipping = await program.account.shipping.fetch(
            shippingAccountPk
          );
          //The new shipping gets added to that list shipping
          setShippings((shippings) => [newShipping, ...shippings]);
        } catch (e) {
          console.log("Couldn't fetch new shipping account", shippingEvent, e);
        }
      }
    );

    //Update Shipping Event
    const updateShippingEventListener = program.addEventListener(
      //event we listening for
      "UpdateShippingEvent", //From SmartContract
      async (updateEvent) => {
        try {
          const shippingAccountPk = await getShippingAccountPk(
            updateEvent.owner,
            updateEvent.id
          );
          //Here the shipping now is created
          const updatedShipping = await program.account.shipping.fetch(
            shippingAccountPk
          );
          //The new shipping gets added to that list shipping
          setShippings(
            (shippings) =>
              shippings.map((shipping) => {
                //for every shipping
                if (
                  shipping.owner.equals(updatedShipping.owner) &&
                  shipping.id.eq(updatedShipping.id)
                ) {
                  return updatedShipping;
                }
                return shipping;
              }) //mapping through to create
          ); //Seting the shipping to an array
        } catch (e) {
          console.log("Couldn't fetch update shipping account", updateEvent, e);
        }
      }
    );

    return () => {
      //remove the event listeners
      program.removeEventListener(newShippingEventListener);
    };
  }, [program]); //run once if the program ever changes

  //Create shipping
  const createShipping = useCallback(
    async (
      label,
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
      if (!userAccount) return;
      try {
        console.log("In try...");
        const shippingId = userAccount.lastShippingId.addn(1); //Get last shipping id
        const txHash = await program.methods
          .createShipping(
            label,
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
            long,
            shippingId
          )
          .accounts({
            shipping: await getShippingAccountPk(
              wallet.publicKey,
              shippingId.toNumber()
            ),
            user: await getUserAccountPk(wallet.publicKey),
            owner: wallet.publicKey,
          })
          .rpc();
        await connection.confirmTransaction(txHash); //Confirm transaction
        toast.success("shipping created!");
        //Update shipping account
        await fetchUserAccount();
      } catch (e) {
        toast.error("Creating shipping failed!");
        console.log(e.message);
      }
    }
  );

  const updateShipping = useCallback(
    async (
      owner,
      id,
      label,
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
      if (!userAccount) return;
      try {
        console.log("update i...", id);
        console.log("by owner...", owner);
        console.log("available...", label);
        const txHash = await program.methods
          .updateShipping(
            label,
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
          )
          .accounts({
            shipping: await getShippingAccountPk(owner, id),
            owner,
          })
          .rpc();
        toast.success("Caption updated!");
      } catch (e) {
        toast.error("failed to update shipping!");
        console.log(e.message);
      }
    }
  );

  //------------------- T R A N S A C T I O N S -------------------

  // Check for a transaction account by fetching
  const fetchTransactions = useCallback(async () => {
    if (!program) return;
    //Feching all the transaction that exist from the program
    const transactions = await program.account.transaction.all();
    setTransactions(transactions.map((transaction) => transaction)); //((transaction)) map for every transaction
  }, [program]);
  //Ensure that it's always fetching the transactions as it comes or if anything changes
  useEffect(() => {
    if (!transactions) {
      fetchTransactions();
    }
  }, [transactions, fetchTransactions]);

  // -Program Events
  useEffect(() => {
    if (!program) return;

    //New Transaction Event
    const newTransactionEventListener = program.addEventListener(
      "NewTransactionEvent", //From SmartContract
      async (transactionEvent) => {
        try {
          const transactionAccountPk = await getTransactionAccountPk(
            transactionEvent.owner,
            transactionEvent.id
          );
          //Here the transaction now is created
          const newTransaction = await program.account.transaction.fetch(
            transactionAccountPk
          );
          //The new transaction gets added to that list transaction
          setTransactions((transactions) => [newTransaction, ...transactions]);
        } catch (e) {
          console.log(
            "Couldn't fetch new transaction account",
            transactionEvent,
            e
          );
        }
      }
    );

    //Update Transaction Event
    const updateTransactionEventListener = program.addEventListener(
      //event we listening for
      "UpdateTransactionEvent", //From SmartContract
      async (updateEvent) => {
        try {
          const transactionAccountPk = await getTransactionAccountPk(
            updateEvent.owner,
            updateEvent.id
          );
          //Here the transaction now is created
          const updatedTransaction = await program.account.transaction.fetch(
            transactionAccountPk
          );
          //The new transaction gets added to that list transaction
          setTransactions(
            (transactions) =>
              transactions.map((transaction) => {
                //for every transaction
                if (
                  transaction.owner.equals(updatedTransaction.owner) &&
                  transaction.id.eq(updatedTransaction.id)
                ) {
                  return updatedTransaction;
                }
                return transaction;
              }) //mapping through to create
          ); //Seting the transaction to an array
        } catch (e) {
          console.log(
            "Couldn't fetch update transaction account",
            updateEvent,
            e
          );
        }
      }
    );

    return () => {
      //remove the event listeners
      program.removeEventListener(newTransactionEventListener);
    };
  }, [program]); //run once if the program ever changes

  //Create Transaction
  const createTransaction = useCallback(
    async (
      tx,
      rx,
      amount,
      shipping_pubk,
      timestamp_verify,
      verify,
      timestamp_delivered,
      delivered,
      items
    ) => {
      if (!userAccount) return;

      console.log(`${tx}`);
      console.log(`${rx}`);
      console.log(`${amount}`);
      console.log(`${shipping_pubk}`);
      console.log(`${timestamp_verify}`);
      console.log(`${verify}`);
      console.log(`${timestamp_delivered}`);
      console.log(`${delivered}`);
      console.log(`${items}`);

      try {
        //console.log("In try...");
        const transactionId = userAccount.lastTransactionId.addn(1); //Get last transaction id
        console.log("transactionId", transactionId.toNumber());
        const txHash = await program.methods
          .createTransaction(
            tx,
            rx,
            amount,
            shipping_pubk,
            timestamp_verify,
            verify,
            timestamp_delivered,
            "0",
            items,
            transactionId
          )
          .accounts({
            transaction: await getTransactionAccountPk(
              wallet.publicKey,
              transactionId.toNumber()
            ),
            user: await getUserAccountPk(wallet.publicKey),
            owner: wallet.publicKey,
          })
          .rpc();
        await connection.confirmTransaction(txHash); //Confirm transaction
        toast.success("Transaction created!");
        //Update user account
        await fetchUserAccount();
      } catch (e) {
        toast.error("Creating transaction failed!");
        console.log(e.message);
      }
    }
  );

  const updateTransaction = useCallback(
    async (owner, id, timestamp_delivered, delivered) => {
      if (!userAccount) return;
      try {
        console.log("update i...", id);
        console.log("by owner...", owner);
        const txHash = await program.methods
          .updateTransaction(timestamp_delivered, delivered)
          .accounts({
            transaction: await getTransactionAccountPk(owner, id),
            owner,
          })
          .rpc();
        toast.success("Caption updated!");
      } catch (e) {
        toast.error("failed to update transaction!");
        console.log(e.message);
      }
    }
  );

  //---------------- M A R K E T   T R A N S A C T I O N S ----------------

  // Check for a marketTransaction account by fetching
  const fetchMarketTransactions = useCallback(async () => {
    if (!program) return;
    //Feching all the marketTransaction that exist from the program
    const marketTransactions = await program.account.marketTransaction.all();
    setMarketTransactions(
      marketTransactions.map((marketTransaction) => marketTransaction.account)
    ); //((marketTransaction)) map for every marketTransaction
  }, [program]);
  //Ensure that it's always fetching the marketTransactions as it comes or if anything changes
  useEffect(() => {
    if (!marketTransactions) {
      fetchMarketTransactions();
    }
  }, [marketTransactions, fetchMarketTransactions]);

  // -Program Events
  useEffect(() => {
    if (!program) return;

    //New MArket Transaction Event
    const newMarketTransactionEventListener = program.addEventListener(
      "NewMarketTransactionEvent", //From SmartContract
      async (marketTransactionEvent) => {
        try {
          const marketTransactionAccountPk =
            await getMarketTransactionAccountPk(
              marketTransactionEvent.owner,
              marketTransactionEvent.id
            );
          //Here the marketTransaction now is created
          const newMarketTransaction =
            await program.account.marketTransaction.fetch(
              marketTransactionAccountPk
            );
          //The new transaction gets added to that list marketTransaction
          setTransactions((marketTransactions) => [
            newMarketTransaction,
            ...marketTransactions,
          ]);
        } catch (e) {
          console.log(
            "Couldn't fetch new transaction account",
            marketTransactionEvent,
            e
          );
        }
      }
    );

    //Update Market Transaction Event
    const updateMarketTransactionEventListener = program.addEventListener(
      //event we listening for
      "UpdateMarketTransactionEvent", //From SmartContract
      async (updateEvent) => {
        try {
          const marketTransactionAccountPk =
            await getMarketTransactionAccountPk(
              updateEvent.owner,
              updateEvent.id
            );
          //Here the marketTransaction now is created
          const updatedMarketTransaction =
            await program.account.marketTransaction.fetch(
              marketTransactionAccountPk
            );
          //The new marketTransaction gets added to that list marketTransaction
          setMarketTransactions(
            (marketTransactions) =>
              marketTransactions.map((marketTransaction) => {
                //for every transaction
                if (
                  marketTransaction.owner.equals(
                    updatedMarketTransaction.owner
                  ) &&
                  marketTransaction.id.eq(updatedMarketTransaction.id)
                ) {
                  return updatedMarketTransaction;
                }
                return marketTransaction;
              }) //mapping through to create
          ); //Seting the marketTransaction to an array
        } catch (e) {
          console.log(
            "Couldn't fetch update marketTransaction account",
            updateEvent,
            e
          );
        }
      }
    );

    return () => {
      //remove the event listeners
      program.removeEventListener(newMarketTransactionEventListener);
    };
  }, [program]); //run once if the program ever changes

  //Create Transaction
  const createMarketTransaction = useCallback(
    async (
      client,
      order_id,
      amount,
      shipping_pubk,
      timestamp_verify,
      verify,
      timestamp_delivered,
      delivered,
      items
    ) => {
      if (!userAccount) return;
      try {
        //console.log("In try...");
        const marketTransactionId = userAccount.lastMarketTransactionId.addn(1); //Get last transaction id
        //console.log(transactionId.toNumber());
        const txHash = await program.methods
          .createMarketTransaction(
            client,
            order_id,
            amount,
            shipping_pubk,
            timestamp_verify,
            verify,
            timestamp_delivered,
            delivered,
            items,
            marketTransactionId
          )
          .accounts({
            marketTransaction: await getMarketTransactionAccountPk(
              wallet.publicKey,
              marketTransactionId.toNumber()
            ),
            user: await getUserAccountPk(wallet.publicKey),
            owner: wallet.publicKey,
          })
          .rpc();
        await connection.confirmTransaction(txHash); //Confirm transaction
        toast.success("marketTransaction created!");
        //Update user account
        await fetchUserAccount();
      } catch (e) {
        toast.error("Creating marketTransaction failed!");
        console.log(e.message);
      }
    }
  );

  const updateMarketTransaction = useCallback(
    async (owner, id, timestamp_delivered, delivered) => {
      if (!userAccount) return;
      try {
        console.log("update i...", id);
        console.log("by owner...", owner);
        const txHash = await program.methods
          .updateMarketTransaction(timestamp_delivered, delivered)
          .accounts({
            marketTransaction: await getMarketTransactionAccountPk(owner, id),
            owner,
          })
          .rpc();
        toast.success("Caption updated!");
      } catch (e) {
        toast.error("failed to update marketTransaction!");
        console.log(e.message);
      }
    }
  );

  //------------------- B A L A N C E -------------------

  // Check for a balance account by fetching
  const fetchBalances = useCallback(async () => {
    if (!program) return;
    //Feching all the balance that exist from the program
    const balances = await program.account.balance.all();
    setBalances(balances.map((balance) => balance.account)); //((balance)) map for every balance
  }, [program]);
  //Ensure that it's always fetching the balances as it comes or if anything changes
  useEffect(() => {
    if (!balances) {
      fetchBalances();
    }
  }, [balances, fetchBalances]);

  // -Program Events
  useEffect(() => {
    if (!program) return;

    //New Balance Event
    const newBalanceEventListener = program.addEventListener(
      "NewBalanceEvent", //From SmartContract
      async (balanceEvent) => {
        try {
          const balanceAccountPk = await getBalanceAccountPk(
            balanceEvent.owner,
            balanceEvent.id
          );
          //Here the balance now is created
          const newBalance = await program.account.balance.fetch(
            balanceAccountPk
          );
          //The new balance gets added to that list balance
          setBalances((balances) => [newBalance, ...balances]);
        } catch (e) {
          console.log("Couldn't fetch new balance account", balanceEvent, e);
        }
      }
    );

    return () => {
      //remove the event listeners
      program.removeEventListener(newBalanceEventListener);
    };
  }, [program]); //run once if the program ever changes

  //Create Balance
  const createBalance = useCallback(async (tp, amount, timestamp) => {
    if (!userAccount) return;
    try {
      console.log("Recibiendo tp...", tp);
      console.log("Recibiendo amount...", amount);
      console.log("Recibiendo timestamp...", timestamp);
      const balanceId = userAccount.lastBalanceId.addn(1); //Get last balance id
      console.log(balanceId.toNumber());
      const txHash = await program.methods
        .createBalance(tp, amount, timestamp, balanceId)
        .accounts({
          balance: await getBalanceAccountPk(
            wallet.publicKey,
            balanceId.toNumber()
          ),
          user: await getUserAccountPk(wallet.publicKey),
          owner: wallet.publicKey,
        })
        .rpc();
      await connection.confirmTransaction(txHash); //Confirm balance
      toast.success("Balance created!");
      //Update user account
      //await fetchUserAccount();
    } catch (e) {
      toast.error("Creating balance failed!");
      console.log(e.message);
    }
  });

  return (
    <SmartProgramContext.Provider
      value={{
        isConnected,
        wallet,
        userAccount,
        hasUserAccount: userAccount ? true : false, //If there is a user account it shoul be true
        hasNewMarket: anyMarket ? true : false,
        createUser,
        createMarket,
        createPost,
        createShipping,
        createTransaction,
        createMarketTransaction,
        createBalance,
        updateMarket,
        updatePost,
        updateShipping,
        updateTransaction,
        updateMarketTransaction,
        markets,
        posts,
        shippings,
        transactions,
        marketTransactions,
        balances,
      }} //will be able to be passed on anywhere
    >
      {children};
    </SmartProgramContext.Provider>
  );
};

//To use our Context
import { createContext, useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Toast, toast } from "react-hot-toast"; //notify
//Functions from SmartContract (Program)
import { getProgram } from "../utils/getProgramIdl";
import { getUserAccountPk } from "@/utils/getUserAccount";
import { getPostAccountPk } from "@/utils/getPostAccount";
//Context
export const SmartProgramContext = createContext({
  isConnected: null,
  wallet: null,
  hasUserAccount: null,
  post: null,
  fetchPosts: null,
});

export const ProgramState = ({ children }) => {
  const [program, setProgram] = useState(); //Get the program and set it in our state to use anywhere
  const [isConnected, setIsConnected] = useState(); //To check connection
  const [userAccount, setUserAccount] = useState(); //Save user account to fetch
  const [posts, setPosts] = useState(); //To the xample this is ([])

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

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

    return () => {
      //remove the event listeners
      program.removeEventListener(newPostEventListener);
    };
  }, [program]); //run once if the program ever changes

  //Create Post
  const createPost = useCallback(
    async (title, image, description, price, available) => {
      if (!userAccount) return;
      try {
        console.log("In try...");
        const postId = userAccount.lastPostId.addn(1); //Get last post id
        console.log(postId.toNumber());
        const txHash = await program.methods
          .createPost(title, image, description, price, available, postId)
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

  return (
    <SmartProgramContext.Provider
      value={{
        isConnected,
        wallet,
        hasUserAccount: userAccount ? true : false, //If there is a user account it shoul be true
        posts,
        createPost,
      }} //will be able to be passed on anywhere
    >
      {children};
    </SmartProgramContext.Provider>
  );
};

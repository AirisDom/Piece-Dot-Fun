import { useProgramState } from "./useProgramState";
import { createContext, useCallback, useEffect, useState } from "react";

export const SmartProgramPostContext = createContext({
  posts: null,
  fetchPosts: null,
});

export const PostContext = ({ children }) => {
  const [posts, setPosts] = useState();
  const program = useProgramState();

  const fetchPosts = useCallback(async () => {
    if (!program) return;
    const fetchedPosts = await program.account.post.all();
    setPosts(fetchedPosts);
  }, [program]);

  useEffect(() => {
    if (!posts) {
      fetchPosts();
    }
  }, [posts, fetchPosts]);

  return (
    <SmartProgramPostContext.Provider
      value={{
        posts,
        fetchPosts,
      }}
    >
      {children}
    </SmartProgramPostContext.Provider>
  );
};

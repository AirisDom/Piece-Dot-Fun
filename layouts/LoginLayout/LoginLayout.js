import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

//components
import Header from "../../components/Header";

//Hoocks
import { useProfile } from "@/hooks/useProfile";

//styles
import styles from "./LoginLayout.module.scss";
import TopBar from "@/components/TopBar/TopBar";

const SESSIONS_FILE = path.join(process.cwd(), "sessions.json");

function isValidSession(wallet) {
  const sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE));
  const session = sessions.find((s) => s.wallet === wallet);

  if (!session) return false;

  const now = Math.floor(Date.now() / 1000);

  if (now - session.timestamp <= 3600)
    alert("tu sesión expiró, por seguridad debes loguearte nuevamente");

  return session.confirmed && now - session.timestamp <= 3600;
}

export default function MainLayout({ children }) {
  const { userAddress } = useProfile();
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    if (userAddress) {
      setIsSessionValid(isValidSession(userAddress));
    }
  }, [userAddress]);

  return (
    <div className={styles.main_layout}>
      <Header />

      <div className={styles.main}>
        {isSessionValid && (
          <>
            <TopBar />
            <div className={styles.main_content}>{children}</div>
          </>
        )}

        {!isSessionValid && <>Sin conectarse</>}
      </div>
    </div>
  );
}

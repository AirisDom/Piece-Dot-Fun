import React from "react";

import { useRouter } from "next/router";
import { map, size } from "lodash";
import { useProfile } from "@/hooks/useProfile";
import { useProgramState } from "@/hooks/useProgram";

import styles from "./NavMenu.module.scss";

import { routeComplete, routeNoAccount } from "@/utils/constants";

import { FaMoneyBillWave } from "react-icons/fa";

export default function NavMenu(props) {
  const { userRealAccountBalance } = props;
  const { connected, publicKey, avatar, setAvatar, userAddress } = useProfile();
  const { isConnected, hasUserAccount, createUser } = useProgramState();
  const router = useRouter();

  return (
    <>
      {isConnected && !hasUserAccount ? (
        //Ruta sin cuenta
        <>
          <nav>
            <div className={styles.header_menu}>
              <ul>
                {map(routeNoAccount, (item) => (
                  <NavItem item={item} />
                ))}
              </ul>
            </div>
          </nav>
        </>
      ) : (
        <></>
      )}

      {isConnected && hasUserAccount ? (
        //Ruta completa
        <>
          <nav>
            <div className={styles.header_menu}>
              <ul>
                <SaldoItem
                  userRealAccountBalance={userRealAccountBalance}
                  icon={FaMoneyBillWave}
                />
                {map(routeComplete, (item) => (
                  <NavItem item={item} />
                ))}
              </ul>
            </div>
          </nav>
        </>
      ) : (
        <></>
      )}
    </>
  );

  function NavItem(props) {
    const { item } = props;
    return (
      <div
        className={styles.header_menu_item}
        onClick={() => router.push(item.route)}
      >
        <li key={item.text}>
          <div className={styles.header_menu_item_icon}>
            <item.iconName />
          </div>
          <div className={styles.header_menu_item_label}>
            <span>{item.text}</span>
          </div>
        </li>
      </div>
    );
  }

  function SaldoItem(props) {
    const { userRealAccountBalance, icon } = props;
    return (
      <div className={styles.header_menu_item}>
        <li key="balanceAccount">
          <div className={styles.header_menu_item_icon}></div>
          <div className={styles.header_menu_item_label}>
            <span>{`Balance: ${userRealAccountBalance}`}</span>
          </div>
        </li>
      </div>
    );
  }
}

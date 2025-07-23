import { PublicKey } from "@solana/web3.js";
import {
  FaHome,
  FaUser,
  FaCaretUp,
  FaCaretDown,
  FaShoppingCart,
  FaCashRegister,
  FaStore,
  FaMoneyBillWave,
} from "react-icons/fa";

export const RPC_ENDPOINT =
  "https://cosmopolitan-greatest-spree.solana-devnet.discover.quiknode.pro/25d435dd5973454c5b9c044f298b0f3a1132c2a4/";

export const PROGRAM_ID = new PublicKey(
  "GwdWPiDbRcenRcQrq3BeQ7f17TthPAWFrNYXmwX2ikyH"
);

export const routeComplete = [
  { text: "Main", iconName: FaHome, route: "/" },
  { text: "My account", iconName: FaUser, route: "/myAccount" },
  { text: "Markets", iconName: FaStore, route: "/markets" },
  { text: "My Market", iconName: FaCashRegister, route: "/myMarket" },
  { text: "Cart", iconName: FaShoppingCart, route: "/cart" },
  { text: "Funding", iconName: FaCaretUp, route: "/funding" },
  { text: "Withdrawn", iconName: FaCaretDown, route: "/withdrawn" },
];

export const balance = [
  { text: "Balance", iconName: FaMoneyBillWave, route: "/" },
];

export const routeNoAccount = [
  { text: "Home", iconName: FaHome, route: "/" },
  { text: "Create Account", iconName: FaUser, route: "/myAccount" },
];

export const routeNoMarket = [
  { text: "Home", iconName: FaHome, route: "/" },
  { text: "Deposit Tokens", iconName: FaCaretUp, route: "/funding" },
  { text: "Withdraw Tokens", iconName: FaCaretDown, route: "/withdrawn" },
  { text: "Markets", iconName: FaStore, route: "/markets" },
  { text: "Create Market", iconName: FaCashRegister, route: "/myMarket" },
  { text: "My Cart", iconName: FaShoppingCart, route: "/cart" },
  { text: "My Account", iconName: FaUser, route: "/myAccount" },
];

export const TRANSACTION_TYPES = ["Fondeo", "Compras", "Ventas"];
export const TRANSACTION_STATUS = {
  fondeo: ["Todos", "ingresos", "retiros"],
  compras: ["Todas", "Solicitadas", "Entregadas"],
  ventas: ["Todas", "Aceptadas", "Entregadas"],
};
export const TRANSACTION_PERIODS = [
  "todas",
  "últimos 7 días",
  "últimos 3 días",
];

export const BASE_PATH = "https://push-notifications-webapis.onrender.com";
//export const BASE_PATH = "localhost:3030";

export const CART = "cart";

export const URL = "https://push-notifications-webapis.onrender.com";
//export const URL = "http://localhost:3030";

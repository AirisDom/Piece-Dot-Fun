// Main hooks exports
export { useProfile } from './useProfile';
export { useAuth, AuthProvider, useAuthContext } from './useAuth';
export { useCart } from './useCart';
export { usePayment } from './usePayment';

// Market and Product hooks
export { useMarkets } from './useMarkets';
export { useProducts } from './useProducts';
export { useOrders } from './useOrders';

// Transaction and Financial hooks
export { useTransactions } from './useTransactions';
export { useCustomToken } from './useCustomToken';

// Utility hooks
export { useSearch } from './useSearch';
export { useNotifications } from './useNotifications';

// Program context hooks (existing)
export { useMarketContext } from './useMarketProgram';
export { useProgram } from './useProgram';
export { useUserProgram } from './useUserProgram';
export { usePostProgram } from './usePostProgram';

// Default exports for backward compatibility
export { default as useCart } from './useCart';
export { default as useMarkets } from './useMarkets';
export { default as useProducts } from './useProducts';
export { default as useOrders } from './useOrders';
export { default as useTransactions } from './useTransactions';
export { default as useSearch } from './useSearch';
export { default as useNotifications } from './useNotifications';
export { default as useAuth } from './useAuth';

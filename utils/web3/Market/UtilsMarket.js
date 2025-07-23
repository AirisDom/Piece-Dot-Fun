const UtilsMarket = {};

UtilsMarket.getMarketInfoByHash = (walletAddress, markets) => {
  const marketInfo = markets.find(
    (market) => market.owner.toString() === walletAddress
  );

  return marketInfo ? marketInfo : [];
};

UtilsMarket.getAllProductsByMarketHash = (walletAddress, posts) => {
  const products = [];

  products.filter;

  if (!posts) {
    return null;
  }

  const filtered = posts.filter(
    (post) => post.account.owner.toString() === walletAddress
  );

  products.push(...filtered);

  return products;
};

export default UtilsMarket;

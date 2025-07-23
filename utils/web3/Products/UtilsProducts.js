const UtilsProducts = {};

UtilsProducts.getMarketInfoByHash = (walletAddress, markets) => {
  const marketInfo = markets.find(
    (market) => market.owner.toString() === walletAddress
  );
  console.log(marketInfo);
  return marketInfo ? marketInfo : [];
};

UtilsProducts.getAllProductsByMarketHash = (walletAddress, posts) => {
  const products = [];
  let filtered = [];
  products.filter;
  if (posts) {
    filtered = posts.filter(
      (post) => post.account.owner.toString() === walletAddress
    );
  }

  products.push(...filtered);

  return products;
};

UtilsProducts.getAllProductsInCartByMarketHash = (
  walletAddress,
  productsTemp,
  posts
) => {
  const productsInCart = [];
  const filtered = UtilsProducts.getAllProductsByMarketHash(
    walletAddress,
    posts
  );

  for (const post of filtered) {
    const postKey = post.publicKey.toString();
    const count = productsTemp.filter((x) => x === postKey).length;
    productsInCart.push({ post, cantidad: count });
  }

  return productsInCart;
};

export default UtilsProducts;

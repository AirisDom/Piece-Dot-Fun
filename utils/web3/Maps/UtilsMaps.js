const UtilsMaps = {};

UtilsMaps.deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

UtilsMaps.calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = UtilsMaps.deg2rad(parseFloat(lat2) - parseFloat(lat1));
  const dLon = UtilsMaps.deg2rad(parseFloat(lon2) - parseFloat(lon1));
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(UtilsMaps.deg2rad(parseFloat(lat1))) *
      Math.cos(UtilsMaps.deg2rad(parseFloat(lat2))) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;

  return distancia;
};

UtilsMaps.filtrarPorDistancia = (markets, lat, long, distance) => {
  console.log(distance);
  if (distance == null || isNaN(distance)) {
    distance = 1000000;
  }

  const resultado = markets.filter(
    (market) =>
      UtilsMaps.calcularDistancia(
        parseFloat(lat),
        parseFloat(long),
        parseFloat(market.lat),
        parseFloat(market.long),
        market.marketName
      ) <= parseInt(distance)
  );

  return resultado;
};

export default UtilsMaps;

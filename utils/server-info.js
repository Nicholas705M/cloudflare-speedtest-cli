const { get } = require('./network');

/**
 * Fetches server location data from Cloudflare.
 * @returns {Promise<object>} A promise that resolves with an object mapping IATA codes to city names.
 */
async function fetchServerLocationData() {
  const res = JSON.parse(await get("speed.cloudflare.com", "/locations"));
  return res.reduce((data, { iata, city }) => {
    data[iata] = city;
    return data;
  }, {});
}

/**
 * Fetches Cloudflare CDN trace information (IP, location, colo).
 * @returns {Promise<object>} A promise that resolves with an object containing trace details.
 */
function fetchCfCdnCgiTrace() {
  const parseCfCdnCgiTrace = (text) =>
    text
      .split("\n")
      .map((i) => {
        const j = i.split("=");
        return [j[0], j[1]];
      })
      .reduce((data, [k, v]) => {
        if (v === undefined) return data;
        data[k] = v;
        return data;
      }, {});

  return get("speed.cloudflare.com", "/cdn-cgi/trace").then(parseCfCdnCgiTrace);
}

module.exports = {
  fetchServerLocationData,
  fetchCfCdnCgiTrace,
};

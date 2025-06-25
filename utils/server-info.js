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
 * Fetches Cloudflare CDN trace information (IP, colo).
 * @returns {Promise<object>} A promise that resolves with an object containing trace details.
 */
function fetchCfCdnCgiTrace() {
  const parseCfCdnCgiTrace = (text) => {
    return text
      .split("\n")
      .map((i) => {
        const j = i.split("=");
        return [j[0], j[1]];
      })
      .reduce((data, [k, v]) => {
        if (v === undefined) {
          return data;
        }
        data[k] = v;
        return data;
      }, {});
  };

  // The trace output contains fields like:
  // ip=... (client IP)
  // colo=... (Cloudflare colo IATA code)
  return get("speed.cloudflare.com", "/cdn-cgi/trace").then(parseCfCdnCgiTrace);
}

module.exports = {
  fetchServerLocationData,
  fetchCfCdnCgiTrace,
};

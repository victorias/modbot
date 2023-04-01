// Fetch runs in both client and server contexts
// process only runs in server contexts, so we add env vars to window on root.tsx and extract it that way
// @ts-ignore
const modbotUrl = (typeof document === "undefined" ? process : window).env
  .MODBOT_URL;

export async function post(url: String, data: Record<string, any> = {}) {
  // @TODO: @PROD: fix these URLs when we go to prod
  const fetchUrl = `${modbotUrl}/${
    url.startsWith("/") ? url.substring(1) : url
  }`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const returnedData = await (await fetch(fetchUrl, options)).json();
  return returnedData;
}

export async function get(url: string, data: Record<string, any> = {}) {
  const query = Object.entries(data)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  const response = await fetch(
    `${modbotUrl}/${url.startsWith("/") ? url.substring(1) : url}${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch data from ${url}`);
  }

  return response.json();
}

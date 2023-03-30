export async function post(url: String, data: any) {
  // @TODO: @PROD: fix these URLs when we go to prod
  const fetchUrl = `http://localhost:3000/${
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
  // @TODO: @PROD: only console.log if we're in local
  console.log(returnedData);
  return returnedData;
}

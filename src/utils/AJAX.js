import Timeout from "./Timeout";

export default async function AJAX(
  url,
  uploadData = undefined,
  KeyName = undefined,
  authKey = undefined,
  contentType = "application/json"
) {
  try {
    const headers = { "Content-Type": contentType };

    if (authKey) {
      headers["Authorization"] = `${KeyName} ${authKey}`;
    }

    let body;
    if (uploadData) {
      if (contentType === "application/json") {
        body = JSON.stringify(uploadData);
      } else if (contentType === "application/x-www-form-urlencoded") {
        body = new URLSearchParams(uploadData).toString();
      }
    }

    const fetchPro = fetch(url, {
      method: uploadData ? "POST" : "GET",
      headers: headers,
      body: body,
    });

    const res = await Promise.race([fetchPro, Timeout(10)]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} ${res.status}`);
    return data;
  } catch (err) {
    console.error("Error in AJAX function:", err);
    throw err;
  }
}

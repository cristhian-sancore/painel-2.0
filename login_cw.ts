async function fetchInboxes() {
  const url = "https://chatwoot2.cristhiansancore.com.br";
  const token = "i9Ch9WjTicBEyfBtiqqNukZS";
  
  const res = await fetch(`${url}/api/v1/accounts/1/inboxes`, {
    headers: {
      "Content-Type": "application/json",
      "api_access_token": token
    }
  });

  const data = await res.json();
  console.log("Inboxes:", JSON.stringify(data.payload[0], null, 2));
}

fetchInboxes();

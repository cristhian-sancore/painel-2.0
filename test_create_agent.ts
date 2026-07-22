async function main() {
  const token = 'i9Ch9WjTicBEyfBtiqqNukZS';
  const url = 'https://chatwoot2.cristhiansancore.com.br';
  const accountId = 1;
  
  console.log("Testing Create Agent API...");
  try {
    const res = await fetch(`${url}/api/v1/accounts/${accountId}/agents`, {
      method: 'POST',
      headers: {
        'api_access_token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Test Agent",
        email: "test.agent" + Math.floor(Math.random()*1000) + "@sancore.com.br",
        role: "agent"
      })
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  } catch(e) {
    console.error("Error:", e);
  }
}

main();

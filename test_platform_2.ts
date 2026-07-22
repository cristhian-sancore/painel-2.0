async function main() {
  const platformToken = 'WGMzdQwPraor579LG7o9NRcm';
  const url = 'https://chatwoot2.cristhiansancore.com.br';
  
  console.log("Testing Platform API Token...");
  try {
    const res = await fetch(`${url}/platform/v1/users`, {
      method: "POST",
      headers: {
        'api_access_token': platformToken,
        'access_token': platformToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Test Platform",
        email: "platform" + Math.floor(Math.random()*1000) + "@example.com",
        password: "PassWord123"
      })
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text);
  } catch(e) {
    console.error("Error:", e);
  }
}

main();

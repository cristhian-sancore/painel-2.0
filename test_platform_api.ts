async function main() {
  const platformToken = 'WGMzdQwPraor579LG7o9NRcm';
  const url = 'https://chatwoot2.cristhiansancore.com.br';
  
  console.log("Testing Platform API Token...");
  try {
    const res = await fetch(`${url}/platform/api/v1/users`, {
      headers: {
        'api_access_token': platformToken,
        'access_token': platformToken
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response:", data);
  } catch(e) {
    console.error("Error:", e);
  }
}

main();

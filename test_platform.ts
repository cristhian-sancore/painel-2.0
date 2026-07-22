async function main() {
  const platformToken = 'WGMzdQwPraor579LG7o9NRcm';
  const url = 'https://chatwoot2.cristhiansancore.com.br';
  
  const endpointsToTest = [
    '/platform/api/v1/users',
    '/api/v1/platform/users',
    '/api/v2/users',
  ];

  for (const ep of endpointsToTest) {
    console.log(`\nTesting ${ep}...`);
    try {
      const res = await fetch(`${url}${ep}`, {
        headers: { 'access_token': platformToken }
      });
      console.log(`Status: ${res.status}`);
      const text = await res.text();
      console.log(`Body (first 100 chars): ${text.substring(0, 100).replace(/\n/g, ' ')}`);
    } catch(e: any) {
      console.log(`Error: ${e.message}`);
    }
  }
}
main();

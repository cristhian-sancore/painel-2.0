import fetch from 'node-fetch';
const PORTAINER_URL = 'http://18.188.108.154:9000/api';
const TOKEN = 'ptr_8T9EOBR8NmhUXN8mk3/ithKJuZ56dVz/Dv+ompsPgm8=';
const ENDPOINT_ID = 3;

async function main() {
  // Find container
  const res = await fetch(\\/endpoints/\/docker/containers/json?all=true\, {
    headers: { 'X-API-Key': TOKEN }
  });
  const containers = await res.json();
  const container = containers.find((c: any) => c.Names[0].includes('painellll') && c.Names[0].includes('next-app'));
  if (!container) { console.log('Container not found'); return; }
  
  // Get logs
  const logsRes = await fetch(\\/endpoints/\/docker/containers/\/logs?stdout=true&stderr=true&tail=50\, {
    headers: { 'X-API-Key': TOKEN }
  });
  const logs = await logsRes.text();
  console.log(logs.replace(/[\x00-\x1F]/g, ''));
}
main();

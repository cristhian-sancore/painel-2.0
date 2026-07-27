const PORTAINER_URL = 'http://18.188.108.154:9000/api';
const TOKEN = 'ptr_8T9EOBR8NmhUXN8mk3/ithKJuZ56dVz/Dv+ompsPgm8=';
const ENDPOINT_ID = 3;

async function main() {
  const res = await fetch(PORTAINER_URL + '/endpoints/' + ENDPOINT_ID + '/docker/containers/json?all=true', {
    headers: { 'X-API-Key': TOKEN }
  });
  const containers = await res.json();
  const panel = containers.find((c: any) => c.Image.includes('painel-2.0') || c.Image.includes('datacenter-panel'));
  if (panel) {
    const logsRes = await fetch(PORTAINER_URL + '/endpoints/' + ENDPOINT_ID + '/docker/containers/' + panel.Id + '/logs?stdout=true&stderr=true&tail=200', {
      headers: { 'X-API-Key': TOKEN }
    });
    const logs = await logsRes.text();
    console.log('Logs for', panel.Names[0], ':');
    console.log(logs.replace(/[^\x20-\x7E\n]/g, ''));
  } else {
    console.log('Panel container not found. Available images:', containers.map((c:any) => c.Image).join(', '));
  }
}
main();

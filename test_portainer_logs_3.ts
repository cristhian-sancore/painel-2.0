import fetch from 'node-fetch';
const PORTAINER_URL = 'http://18.188.108.154:9000/api';
const TOKEN = 'ptr_8T9EOBR8NmhUXN8mk3/ithKJuZ56dVz/Dv+ompsPgm8=';
const ENDPOINT_ID = 3;

async function main() {
  const res = await fetch(PORTAINER_URL + '/endpoints/' + ENDPOINT_ID + '/docker/containers/json', {
    headers: { 'X-API-Key': TOKEN }
  });
  const containers = await res.json();
  const nextContainer = containers.find((c: any) => c.Image.includes('datacenter-panel'));
  if (nextContainer) {
    const logsRes = await fetch(PORTAINER_URL + '/endpoints/' + ENDPOINT_ID + '/docker/containers/' + nextContainer.Id + '/logs?stdout=true&stderr=true&tail=100', {
      headers: { 'X-API-Key': TOKEN }
    });
    const logs = await logsRes.text();
    console.log(logs.replace(/[^\x20-\x7E\n]/g, ''));
  }
}
main();

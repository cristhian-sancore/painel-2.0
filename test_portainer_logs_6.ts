const PORTAINER_URL = 'http://18.188.108.154:9000/api';
const TOKEN = 'ptr_8T9EOBR8NmhUXN8mk3/ithKJuZ56dVz/Dv+ompsPgm8=';
const ENDPOINT_ID = 3;

async function main() {
  const res = await fetch(PORTAINER_URL + '/endpoints/' + ENDPOINT_ID + '/docker/containers/json?all=true', {
    headers: { 'X-API-Key': TOKEN }
  });
  const containers = await res.json();
  console.log(containers.map((c: any) => c.Names[0]));
}
main();

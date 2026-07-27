const PORTAINER_URL = 'https://portainer.cristhiansancore.com.br/api';
const TOKEN = 'ptr_rZVePGsejhdi3lxxhIglzk2LCzzWuVqZyKvvZtSTvl8=';
const ENDPOINT_ID = 3;

async function main() {
  const res = await fetch(PORTAINER_URL + '/endpoints/' + ENDPOINT_ID + '/docker/containers/json?all=true', {
    headers: { 'X-API-Key': TOKEN }
  });
  const containers = await res.json();
  const panel = containers.find((c: any) => c.Names[0].includes('datacenter-panel') || c.Image.includes('datacenter-panel'));
  if (panel) {
    console.log('Found panel container:', panel.Names[0]);
    const logsRes = await fetch(PORTAINER_URL + '/endpoints/' + ENDPOINT_ID + '/docker/containers/' + panel.Id + '/logs?stdout=true&stderr=true&tail=50', {
      headers: { 'X-API-Key': TOKEN }
    });
    const logs = await logsRes.text();
    console.log('Logs:');
    console.log(logs.replace(/[^\x20-\x7E\n]/g, ''));
  } else {
    console.log('Panel not found in this portainer.');
  }
}
main();

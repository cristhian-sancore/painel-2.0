const url = 'https://portainer.cristhiansancore.com.br/api';
const token = 'ptr_rZVePGsejhdi3lxxhIglzk2LCzzWuVqZyKvvZtSTvl8=';
async function t() {
    const res = await fetch(url + '/endpoints/3/docker/containers/json?all=1', { headers: { 'X-API-Key': token } });
    const data = await res.json();
    const glpi = data.find(c => c.Names[0] === '/glpi');
    const exec = await fetch(url + '/endpoints/3/docker/containers/' + glpi.Id + '/exec', {
        method: 'POST',
        headers: { 'X-API-Key': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            AttachStdout: true,
            AttachStderr: true,
            Cmd: ['curl', '-s', '-X', 'POST', 'http://datacenter-panel:3000/api/glpi/webhook', '-H', 'Content-Type: application/json', '-d', '{"test":true}']
        })
    });
    const execData = await exec.json();
    const start = await fetch(url + '/endpoints/3/docker/exec/' + execData.Id + '/start', {
        method: 'POST',
        headers: { 'X-API-Key': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ Detach: false, Tty: false })
    });
    const out = await start.text();
    console.log(out.replace(/[^\x20-\x7E\n]/g, ''));
}
t();

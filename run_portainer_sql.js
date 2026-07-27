const url = 'https://portainer.cristhiansancore.com.br/api'; 
const token = 'ptr_rZVePGsejhdi3lxxhIglzk2LCzzWuVqZyKvvZtSTvl8='; 
const id = '08e5b385d927af4df585d193533ae3d0f514d4c384c9ea08147b2165f0c0cab8'; 
async function t() { 
    const script = Buffer.from("const { createClient } = require('@libsql/client'); const client = createClient({ url: 'file:./dev.db' }); async function run() { await client.execute(\"INSERT OR REPLACE INTO Setting (key, value, updatedAt) VALUES ('glpi_url', 'https://glpi.cristhiansancore.com.br/apirest.php', CURRENT_TIMESTAMP);\"); await client.execute(\"INSERT OR REPLACE INTO Setting (key, value, updatedAt) VALUES ('glpi_app_token', 'Sancore@2404', CURRENT_TIMESTAMP);\"); await client.execute(\"INSERT OR REPLACE INTO Setting (key, value, updatedAt) VALUES ('glpi_user_token', 'X2YDSYheWgkqTK5qiUpcksoFTuJ3q3ynmKwwMYnf', CURRENT_TIMESTAMP);\"); await client.execute(\"UPDATE User SET glpiUserId = 41, chatwootAccessToken = 'WGMzdQwPraor579LG7o9NRcm' WHERE email = 'admin@admin.com';\"); console.log('Done'); } run().catch(console.error);").toString('base64');
    const res = await fetch(url + '/endpoints/3/docker/containers/76235abf045a47a78e168cdfad04bec4abcd3537e1ae659f66ee1e4bcb7a66d5/exec', { 
        method: 'POST', 
        headers: { 'X-API-Key': token, 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            AttachStdout: true, 
            AttachStderr: true, 
            Cmd: ['sh', '-c', 'cd /app && echo ' + script + ' | base64 -d > run4.js && node run4.js']
        }) 
    }); 
    const exec = await res.json(); 
    const start = await fetch(url + '/endpoints/3/docker/exec/' + exec.Id + '/start', { 
        method: 'POST', 
        headers: { 'X-API-Key': token, 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ Detach: false, Tty: false }) 
    }); 
    const out = await start.text(); 
    console.log(out.replace(/[^\x20-\x7E\n]/g, ''));  
} 
t();

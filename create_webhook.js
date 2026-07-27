const fs = require('fs');

async function main() {
    const url = 'https://glpi.cristhiansancore.com.br/apirest.php';
    const appToken = 'X2YDSYheWgkqTK5qiUpcksoFTuJ3q3ynmKwwMYnf';
    const userToken = 'zzD1DpVj4Xm0XmmrWNENN6PIJQI3k3y7cdg7QFK5';

    console.log("Iniciando...");
    
    // 1. Init Session
    let res = await fetch(`${url}/initSession`, {
        headers: {
            'App-Token': appToken,
            'Authorization': `user_token ${userToken}`
        }
    });

    if (!res.ok) {
        console.error("InitSession falhou:", await res.text());
        return;
    }
    const data = await res.json();
    const sessionToken = data.session_token;
    console.log("Session Token:", sessionToken);

    // 2. Tenta listar os webhooks
    res = await fetch(`${url}/PluginWebhookWebhook`, {
        headers: {
            'App-Token': appToken,
            'Session-Token': sessionToken
        }
    });

    if (!res.ok) {
        console.error("Falha ao buscar webhooks:", await res.text());
    } else {
        console.log("Webhooks atuais:", await res.json());
    }
}

main();

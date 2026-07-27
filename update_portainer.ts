async function updateStack() {
  const url = "https://portainer.cristhiansancore.com.br/api/stacks/15?endpointId=3";
  const token = "ptr_rZVePGsejhdi3lxxhIglzk2LCzzWuVqZyKvvZtSTvl8=";

  const compose = `version: '3.8'

services:
  datacenter-panel:
    image: ghcr.io/cristhian-sancore/painel-2.0/datacenter-panel:latest
    container_name: datacenter-panel
    restart: unless-stopped
    ports:
      - "3001:3000"
    volumes:
      - ./data:/app/data
    networks:
      - default
      - evo_chat_net

    environment:
      - NODE_ENV=production
      - EVOLUTION_API_URL=https://api.cristhiansancore.com.br
      - EVOLUTION_API_KEY=sancore_evolution_master_key_123
      - CHATWOOT_API_URL=https://chatwoot2.cristhiansancore.com.br
      - CHATWOOT_ACCESS_TOKEN=i9Ch9WjTicBEyfBtiqqNukZS
      - INSTALLATION_KEY=sancore_setup_key_2026
      - DATABASE_URL=file:./data/dev.db
      - NEXTAUTH_SECRET=supersecret12345
      - NEXTAUTH_URL=https://painell.cristhiansancore.com.br
      - GLPI_API_URL=https://glpi.cristhiansancore.com.br/apirest.php
      - GLPI_APP_TOKEN=X2YDSYheWgkqTK5qiUpcksoFTuJ3q3ynmKwwMYnf
      - GLPI_USER_TOKEN=zzD1DpVj4Xm0XmmrWNENN6PIJQI3k3y7cdg7QFK5

networks:
  evo_chat_net:
    external: true
    name: chatwoot-evolution_evo_chat_net
`;

  const payload = {
    StackFileContent: compose,
    Env: [],
    Prune: true,
    PullImage: true
  };

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-API-Key': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log("Stack updated successfully:", data);
    } else {
      const text = await res.text();
      console.error("Failed to update stack:", res.status, text);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

updateStack();

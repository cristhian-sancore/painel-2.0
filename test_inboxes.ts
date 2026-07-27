
async function main() {
  const chatwootUrl = "https://chatwoot2.cristhiansancore.com.br";
  const accessToken = "i9Ch9WjTicBEyfBtiqqNukZS";
  const accountId = 1;

  const headers = {
    "Content-Type": "application/json",
    "api_access_token": accessToken
  };

  console.log("Fetching inboxes...");
  const res = await fetch(`${chatwootUrl}/api/v1/accounts/${accountId}/inboxes`, { headers });
  const data: any = await res.json();
  
  const inboxes = data.payload || data;
  console.log("Inboxes:", inboxes.map((i: any) => ({ id: i.id, name: i.name })));

  if (inboxes.length > 0) {
    const inboxId = inboxes[0].id;
    console.log(`Fetching members for inbox ${inboxId}...`);
    const membersRes = await fetch(`${chatwootUrl}/api/v1/accounts/${accountId}/inbox_members/${inboxId}`, { headers });
    const membersData = await membersRes.json();
    const members = membersData.payload || membersData;
    console.log("Current Members:", members.map((m: any) => m.id || m.user_id));
    

  }
}

main();

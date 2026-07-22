import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tokenSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_platform_token" } });
  const urlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
  
  const token = tokenSetting?.value;
  const url = urlSetting?.value || "https://chatwoot2.cristhiansancore.com.br";
  
  if (!token) {
    console.log("No token");
    return;
  }
  
  const res = await fetch(`${url}/platform/api/v1/users`, {
    headers: { "api_access_token": token }
  });
  const data = await res.json();
  console.log(JSON.stringify(data[0], null, 2));
}
main();

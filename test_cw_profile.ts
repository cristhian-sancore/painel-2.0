

async function test() {
  const url = "https://chatwoot2.cristhiansancore.com.br";
  const token = "YbswfR8ZdxBDYmHAtbKsFDea";
  const platformToken = "WGMzdQwPraor579LG7o9NRcm";

  const res = await fetch(`${url}/api/v1/profile`, {
    headers: {
      "Content-Type": "application/json",
      "api_access_token": token
    }
  });

  console.log("Profile Endpoint Status:", res.status);
  console.log("Profile Endpoint Response:", await res.text());
  
  const resPlatform = await fetch(`${url}/platform/api/v1/users`, {
    headers: {
      "Content-Type": "application/json",
      "api_access_token": platformToken
    }
  });
  console.log("Platform Endpoint Status:", resPlatform.status);
}

test();

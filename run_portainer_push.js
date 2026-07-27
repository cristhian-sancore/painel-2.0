const url = 'https://portainer.cristhiansancore.com.br/api'; 
const token = 'ptr_rZVePGsejhdi3lxxhIglzk2LCzzWuVqZyKvvZtSTvl8='; 
const id = '08e5b385d927af4df585d193533ae3d0f514d4c384c9ea08147b2165f0c0cab8'; 
const schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
}

model AccessGroup {
  id          String   @id @default(cuid())
  name        String   @unique
  permissions String   @default("[]")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  users       User[]
  glpiGroupId Int?
}

model User {
  id            String       @id @default(cuid())
  name          String?
  cpf           String?      @unique
  birthDate     DateTime?
  email         String       @unique
  password      String
  role          String       @default("USER")
  chatwootId    Int?
  chatwootAccessToken String?
  accessGroupId String?
  accessGroup   AccessGroup? @relation(fields: [accessGroupId], references: [id], onDelete: SetNull)
  glpiUserId    Int?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

model Setting {
  key       String   @id
  value     String
  updatedAt DateTime @updatedAt
}

model TicketConversation {
  id                     String   @id @default(cuid())
  glpiTicketId           Int      @unique
  chatwootConversationId Int      @unique
  chatwootAccountId      Int
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
`; 
const configTs = `import { defineConfig } from "prisma/config";\nexport default defineConfig({\n  schema: "prisma/schema.prisma",\n  migrations: { path: "prisma/migrations" },\n  datasource: { url: process.env["DATABASE_URL"] || "file:./dev.db" }\n});`;

async function t() { 
    const res = await fetch(url + '/endpoints/3/docker/containers/' + id + '/exec', { 
        method: 'POST', 
        headers: { 'X-API-Key': token, 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
            AttachStdout: true, 
            AttachStderr: true, 
            Cmd: ['sh', '-c', `cd /app && mkdir -p prisma && echo '${schema}' > prisma/schema.prisma && echo '${configTs}' > prisma.config.ts && npx prisma db push --accept-data-loss`] 
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

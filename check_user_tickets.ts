import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import prisma from './src/lib/prisma';
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const users = await prisma.user.findMany({ include: { accessGroup: true } });
  const glpi = await GlpiClient.init();
  
  for (const user of users) {
    if (user.role === 'ADMIN') continue;
    
    console.log('Testing user: ' + user.email);
    const searchUrl = new URL(glpi.url + '/search/Ticket');
    searchUrl.searchParams.append('expand_dropdowns', 'true');
    searchUrl.searchParams.append('range', '0-50');
    let criteriaIndex = 0;

    if (user.glpiUserId) {
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][field]', '5');
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][searchtype]', 'equals');
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][value]', user.glpiUserId.toString());
      
      criteriaIndex++;
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][link]', 'OR');
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][field]', '4');
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][searchtype]', 'equals');
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][value]', user.glpiUserId.toString());
    }
    
    if (user.accessGroup?.glpiGroupId) {
      if (criteriaIndex > 0) {
        criteriaIndex++;
        searchUrl.searchParams.append('criteria[' + criteriaIndex + '][link]', 'OR');
      }
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][field]', '8');
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][searchtype]', 'equals');
      searchUrl.searchParams.append('criteria[' + criteriaIndex + '][value]', user.accessGroup.glpiGroupId.toString());
    }

    console.log('Search URL: ' + searchUrl.toString());
    const res = await fetch(searchUrl.toString(), { method: 'GET', headers: glpi.headers });
    if (res.ok) {
      const result = await res.json();
      console.log('Tickets found: ' + (result.data ? result.data.length : 0));
    } else {
      console.log('Request failed: ' + res.status);
    }
  }
}
main();

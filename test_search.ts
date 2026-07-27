import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const glpi = await GlpiClient.init();
  await glpi.initSession();
  
  const searchUrl = new URL(glpi.url + '/search/Ticket');
  searchUrl.searchParams.append('expand_dropdowns', 'true');
  searchUrl.searchParams.append('range', '0-50');
  
  let criteriaIndex = 0;
  const dummyId = '999999';
  
  searchUrl.searchParams.append('criteria[' + criteriaIndex + '][field]', '5');
  searchUrl.searchParams.append('criteria[' + criteriaIndex + '][searchtype]', 'equals');
  searchUrl.searchParams.append('criteria[' + criteriaIndex + '][value]', dummyId);
  
  criteriaIndex++;
  searchUrl.searchParams.append('criteria[' + criteriaIndex + '][link]', 'OR');
  searchUrl.searchParams.append('criteria[' + criteriaIndex + '][field]', '4');
  searchUrl.searchParams.append('criteria[' + criteriaIndex + '][searchtype]', 'equals');
  searchUrl.searchParams.append('criteria[' + criteriaIndex + '][value]', dummyId);

  console.log('Fetching:', searchUrl.toString());
  const res = await fetch(searchUrl.toString(), { headers: glpi.headers });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Tickets returned:', data.data ? data.data.length : (Array.isArray(data) ? data.length : data));
}
main();

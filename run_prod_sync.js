const url = 'https://portainer.cristhiansancore.com.br/api';
const token = 'ptr_u1U9VC6iS9m0gLl2DJ4jMWvOCqt2KYNNaQ0NNs/+OFk=';
const glpiUrl = 'https://glpi.cristhiansancore.com.br/apirest.php';
const glpiAppToken = 'X2YDSYheWgkqTK5qiUpcksoFTuJ3q3ynmKwwMYnf';
const glpiUserToken = 'zzD1DpVj4Xm0XmmrWNENN6PIJQI3k3y7cdg7QFK5';

const users = [
  { id: 'cmrw6fnjd000001qyr6vzhzms', email: 'cristhiansancore@gmail.com', name: 'Administrador' },
  { id: 'cmrw6tg1l000101qu318cqq1t', email: 'faspel@gmail.com', name: 'asdasd' }
];

const groups = [
  { id: 'cmrw6g3x1000101qyyiqef98q', name: 'scpi' }
];

async function syncGlpi() {
  const initRes = await fetch(glpiUrl + '/initSession', { headers: { 'App-Token': glpiAppToken, 'Authorization': 'user_token ' + glpiUserToken } });
  const session = (await initRes.json()).session_token;
  const headers = { 'App-Token': glpiAppToken, 'Session-Token': session, 'Content-Type': 'application/json' };

  const queries = [];

  // Groups
  for (const group of groups) {
    let searchUrl = new URL(`${glpiUrl}/search/Group`);
    searchUrl.searchParams.append("criteria[0][field]", "14");
    searchUrl.searchParams.append("criteria[0][searchtype]", "equals");
    searchUrl.searchParams.append("criteria[0][value]", group.name);
    let res = await fetch(searchUrl.toString(), { headers });
    let data = await res.json();
    let glpiId = null;
    if (data.data && data.data.length > 0) glpiId = data.data[0].id;
    else {
      let createRes = await fetch(`${glpiUrl}/Group`, { method: 'POST', headers, body: JSON.stringify({ input: { name: group.name } }) });
      let createData = await createRes.json();
      glpiId = createData.id;
    }
    queries.push(`UPDATE AccessGroup SET glpiGroupId = ${glpiId} WHERE id = '${group.id}';`);
  }

  // Users
  for (const user of users) {
    let searchUrl = new URL(`${glpiUrl}/search/User`);
    searchUrl.searchParams.append("criteria[0][field]", "5");
    searchUrl.searchParams.append("criteria[0][searchtype]", "contains");
    searchUrl.searchParams.append("criteria[0][value]", user.email);
    let res = await fetch(searchUrl.toString(), { headers });
    let data = await res.json();
    let glpiId = null;
    if (data.data && data.data.length > 0) glpiId = data.data[0].id;
    else {
      let createRes = await fetch(`${glpiUrl}/User`, { method: 'POST', headers, body: JSON.stringify({ input: { name: user.email, realname: user.name, _useremails: [user.email], is_active: 1 } }) });
      let createData = await createRes.json();
      glpiId = createData.id;
    }
    queries.push(`UPDATE User SET glpiUserId = ${glpiId} WHERE id = '${user.id}';`);
  }

  const queryStr = queries.join(' ');
  console.log('Queries to run:', queryStr);

  const listRes = await fetch(url + '/endpoints/3/docker/containers/json', { headers: { 'X-API-Key': token } });
  const list = await listRes.json();
  const cId = list.find(c => c.Names.includes('/datacenter-panel')).Id;

  const execRes = await fetch(url + '/endpoints/3/docker/containers/' + cId + '/exec', {
    method: 'POST',
    headers: { 'X-API-Key': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      AttachStdin: false, AttachStdout: true, AttachStderr: true,
      Cmd: ['sqlite3', '/app/data/dev.db', queryStr]
    })
  });
  const execObj = await execRes.json();
  
  const startRes = await fetch(url + '/endpoints/3/docker/exec/' + execObj.Id + '/start', {
    method: 'POST',
    headers: { 'X-API-Key': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ Detach: false, Tty: false })
  });
  console.log('Output:', await startRes.text());
}

syncGlpi().catch(console.error);

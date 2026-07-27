async function main() {
  const url = 'https://api.github.com/repos/cristhian-sancore/painel-2.0/actions/runs?branch=main&per_page=1';
  const res = await fetch(url);
  if (!res.ok) {
     console.error('Failed to fetch:', res.statusText);
     return;
  }
  const data = await res.json();
  const run = data.workflow_runs[0];
  console.log('Latest Run Status:', run.status, 'Conclusion:', run.conclusion, 'Updated At:', run.updated_at);
}
main();

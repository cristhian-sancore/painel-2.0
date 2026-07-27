async function main() {
  const url = 'https://api.github.com/repos/cristhian-sancore/painel-2.0/actions/runs?branch=main&per_page=1';
  let isDone = false;
  let attempt = 0;
  while (!isDone && attempt < 30) {
    const res = await fetch(url);
    if (res.ok) {
       const data = await res.json();
       const run = data.workflow_runs[0];
       console.log('Run Status:', run.status, 'Conclusion:', run.conclusion);
       if (run.status === 'completed') {
          isDone = true;
          if (run.conclusion === 'success') {
             console.log('Build finished successfully!');
          } else {
             console.log('Build failed!');
          }
       } else {
          console.log('Waiting for build to finish...');
       }
    }
    if (!isDone) {
      await new Promise(r => setTimeout(r, 10000));
      attempt++;
    }
  }
}
main();

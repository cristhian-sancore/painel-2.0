const { URL } = require('url');

console.log(new URL('file:/app/data/dev.db').pathname);
console.log(new URL('file:///app/data/dev.db').pathname);

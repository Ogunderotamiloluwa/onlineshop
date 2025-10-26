// Assuming data.json is hosted at http://127.0.0.1:5500/data.json
const xhr = new XMLHttpRequest();
xhr.open('GET', '/data.json'); // Same-origin request
xhr.send();
// StudyWarz frontend config — decides where the backend API lives.
// 1) Opened from the Node server (http://localhost:3000 or your deployed URL) -> same origin, nothing to set.
// 2) Opened any other way (double-click index.html, VS Code Live Server :5500, etc.) -> talks to http://localhost:3000.
// To point at a deployed backend, set DEPLOYED_API below (e.g. 'https://studywarz.onrender.com').
(function () {
  var DEPLOYED_API = '';                       // optional: full URL of your hosted backend, no trailing slash
  var LOCAL_API = 'http://localhost:3000';
  var loc = window.location, base;
  if (DEPLOYED_API) base = DEPLOYED_API;
  else if (loc.protocol === 'file:') base = LOCAL_API;
  else if (/^(localhost|127\.0\.0\.1)$/.test(loc.hostname) && loc.port !== '3000') base = LOCAL_API;   // Live Server etc.
  else base = '';                              // same origin as the server that served this page
  window.SW_API_BASE = base;
})();

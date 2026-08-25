const fs = require('fs');
const path = require('path');

console.log("[Keylix] Setup...");

// Create .env if missing
if (!fs.existsSync(path.join(__dirname, '../.env'))) {
  fs.copyFileSync(path.join(__dirname, '../.env.example'), path.join(__dirname, '../.env'));
  console.log(" -> Created .env from .env.example");
}

console.log("[Keylix] Done. Next steps:");
console.log("  1. npm install");
console.log("  2. npm start  (backend on 3551)");
console.log("  3. In another terminal: node Matchmaker/matchmaker.js");
console.log("  4. Point your SSL bypass (Starfall/Tellurium) Backend= http://127.0.0.1:3551");

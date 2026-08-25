#!/bin/bash
# Project Keylix - Oracle Cloud Free Setup (Ubuntu 22.04)
# Run on fresh VM via SSH:  bash oracle-setup.sh
set -e
echo "[Keylix] Updating..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx certbot python3-certbot-nginx

# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v; npm -v

# PM2
sudo npm install -g pm2

# Firewall - open Keylix ports
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3551/tcp
sudo ufw allow 3552/tcp
sudo ufw --force enable

# Clone / copy Project Keylix (if you SCP'd it, skip)
# git clone https://github.com/YOUR_REPO/Project-Keylix.git ~/Keylix
# For now assume ~/Project-Keylix exists via SCP
if [ ! -d ~/Keylix ]; then
  echo "Copying local project..."
  # user should scp the folder: scp -r ./Project\ Keylix ubuntu@IP:~/Keylix
  mkdir -p ~/Keylix
fi

cd ~/Keylix
if [ -f package.json ]; then
  npm install --production
fi
# Matchmaker deps (same)
cd ~/Keylix  # backend already installed includes ws

# PM2 start
pm2 stop keylix 2>/dev/null || true
pm2 start src/index.js --name keylix -- --port 3551
pm2 start Matchmaker/matchmaker.js --name matchmaker
pm2 save
pm2 startup | tail -n1 | bash || true

# Nginx reverse (optional - for domain + SSL)
# sudo certbot --nginx -d yourdomain.com (after pointing DNS)

echo ""
echo "[Keylix] Done!"
echo "Backend: http://$(curl -s ifconfig.me):3551"
echo "Check: curl http://localhost:3551/"
echo "Logs: pm2 logs"
echo "Update launcher Backend URL to your public IP:3551"
echo ""
echo "Oracle Security List: Also open 3551/3552 in OCI Console -> VCN -> Security List -> Ingress Rules"

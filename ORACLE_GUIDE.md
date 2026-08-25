# Oracle Free - Host Keylix (Biggest Servers)

## 1. Create Account (2 min)
1. Go https://oracle.com/cloud/free -> Start for free
2. Requires card (not charged, $0.01 verify) + phone
3. Choose Home Region closest to you (e.g. UK South, Frankfurt)

## 2. Create VM (Always Free)
OCI Console -> Compute -> Instances -> Create Instance
- Name: keylix
- Image: **Ubuntu 22.04** (or Canonical Ubuntu)
- Shape: **VM.Standard.A1.Flex** (Ampere) -> 4 OCPU, 24GB RAM (Always Free)  <-- biggest free
  - If A1 out of capacity, use **VM.Standard.E2.1.Micro** (1 OCPU 1GB) then later migrate
- VCN: Create new (default)
- Add SSH key: Generate or paste your `ssh-keygen` public key
- Boot volume: 100GB (free limit 200GB)

Create -> wait Running -> copy **Public IP** e.g. `130.61.XX.XX`

## 3. Open Ports (IMPORTANT)
VCN -> Virtual Cloud Network -> your VCN -> Security List -> Default Security List -> Add Ingress Rules:
- 0.0.0.0/0 TCP 22
- 0.0.0.0/0 TCP 80
- 0.0.0.0/0 TCP 443
- 0.0.0.0/0 TCP 3551  (Keylix backend)
- 0.0.0.0/0 TCP 3552  (Matchmaker)

Also on VM:
```
sudo iptables -I INPUT -p tcp --dport 3551 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 3552 -j ACCEPT
sudo netfilter-persistent save
```

## 4. Upload Keylix
On your PC (PowerShell):
```powershell
scp -r "C:\Users\Kdot\Downloads\Project Keylix" ubuntu@130.61.XX.XX:~/Keylix
```
Or `git clone` your GitHub repo on VM.

## 5. Run Setup Script
SSH in:
```bash
ssh ubuntu@130.61.XX.XX
bash ~/Keylix/scripts/oracle-setup.sh
```

It installs Node 20, PM2, opens UFW 3551/3552, starts backend + matchmaker.

Verify:
```bash
curl http://localhost:3551/
pm2 logs
pm2 status
```

## 6. Point Launcher
In `Launcher > Settings > Backend URL` set:
```
http://130.61.XX.XX:3551
```
Rebuild launcher portable zip, or users just change it in Settings.

For domain + SSL (keylix.yourdomain.com):
- Point DNS A record to IP
- On VM: `sudo certbot --nginx -d keylix.yourdomain.com`
- Set Launcher Backend to `https://keylix.yourdomain.com`

## 7. Keep Alive
```
pm2 save
pm2 startup
```
VM never sleeps (Oracle Always Free).

Need 100-player dedicated server too? Install LawinServer/FortniteServer next to backend (needs ~8GB RAM - fits on 24GB A1).

# Render Deploy - Keep Awake (Free, No Card)

### 1. Push to GitHub
```bash
cd "C:\Users\Kdot\Downloads\Project Keylix"
git init
git add .
git commit -m "Keylix C2S2"
git branch -M main
gh repo create keylix-backend --public --source=. --push
# or manually create repo on github.com and:
git remote add origin https://github.com/YOURNAME/keylix-backend.git
git push -u origin main
```

### 2. Deploy on Render (2 clicks)
1. Go https://dashboard.render.com -> New -> Web Service -> Connect your `keylix-backend` repo
2. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free
3. Advanced -> Add Env Var: `JWT_SECRET` = any random string
4. Create -> wait 2 min -> you get `https://keylix-backend-xxxx.onrender.com`

Test: open `https://xxx.onrender.com/` -> should show `{"name":"Project Keylix","status":"online"}`

### 3. Make it NOT SLEEP (UptimeRobot)
Render free sleeps after 15min.
1. Go https://uptimerobot.com (free, no card) -> Sign up
2. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://keylix-backend-xxxx.onrender.com/`
   - Interval: 5 minutes
3. Save -> it will ping every 5min, keeping it awake 24/7.

### 4. Point Launcher
In `Launcher > Settings > Backend URL` set to `https://keylix-backend-xxxx.onrender.com`
Rebuild launcher zip: `Keylix-Launcher-Portable.zip` and give to players.

No card, not on your PC, stays awake.

# My Wellness Tracker

A private, personal wellness web app: calorie target, Filipino meal plans, food log, water reminders, weekday workouts, menstrual cycle tracking and monthly reports. It's built with plain HTML, CSS and JavaScript, so there's nothing to install or build, and it runs on GitHub Pages.

> **Privacy first:** the code is public on GitHub, but **your data is not**. Everything you log is saved only inside the browser on your device. Nothing is uploaded.

---

## 1. Project structure

```
wellness-tracker/
├── index.html            ← the page that loads everything
├── manifest.json         ← makes it installable on your phone (PWA)
├── sw.js                 ← service worker: offline support
├── .gitignore            ← keeps backup files out of GitHub
├── README.md
├── css/
│   └── styles.css        ← sage & cream design, phone/tablet/desktop layout
├── icons/
│   ├── icon.svg
│   ├── icon-192.png
│   └── icon-512.png
└── js/
    ├── db.js             ← saves data in the browser (IndexedDB)
    ├── data.js           ← food list, Filipino meal ideas, exercises, weekly plan
    ├── calc.js           ← calorie math, meal planner, workouts, cycle, reports
    ├── charts.js         ← simple charts (work offline)
    ├── ui.js             ← icons, pop-ups, messages
    ├── reminders.js      ← water / workout / period reminders
    ├── app.js            ← starts the app, navigation, monthly check-in
    └── views/            ← one file per page
        ├── shared.js
        ├── onboarding.js
        ├── dashboard.js
        ├── nutrition.js  (Food log · Meal plan · Water)
        ├── workouts.js
        ├── cycle.js
        ├── progress.js
        └── settings.js
```

## 2. Run it on your Windows computer

The app needs a small local web server (opening `index.html` by double-clicking won't enable offline mode or notifications).

**Option A: VS Code (easiest)**
1. Open the `wellness-tracker` folder in VS Code (*File → Open Folder*).
2. Install the **Live Server** extension (Extensions panel → search "Live Server" → Install).
3. Right-click `index.html` → **Open with Live Server**. Your browser opens the app.

**Option B: Python (already installed on this PC)**
1. Open PowerShell and run:
   ```powershell
   cd C:\Users\Acer\wellness-tracker
   python -m http.server 8000
   ```
2. Visit **http://localhost:8000** in Chrome or Edge.
3. Press `Ctrl + C` in PowerShell to stop it.

**Testing checklist**
- Finish the 3-step setup.
- Log a food (search "adobo"), edit it, delete it.
- Tap +250 mL on the Water tab; turn on reminders and allow notifications.
- Tick off a workout exercise; try the light version.
- Mark a period start on the Cycle calendar; log symptoms.
- Log a weight on Progress, then download a backup.
- Phone layout test: press `F12` → click the phone icon (device toolbar).

## 3. Put it on GitHub Pages

1. Create a free account at **https://github.com** (if you don't have one).
2. Install **Git for Windows**: https://git-scm.com/download/win (keep the default options).
3. On GitHub, click **+ → New repository**:
   - Name: `wellness-tracker`
   - Visibility: **Public** (free GitHub Pages needs public. That's fine, because only the code is public, never your data.)
   - Don't add a README (you already have one) → **Create repository**.
4. In PowerShell:
   ```powershell
   cd C:\Users\Acer\wellness-tracker
   git init
   git add .
   git commit -m "First version of my wellness tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/wellness-tracker.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME`. A browser window may ask you to sign in to GitHub.)
5. On GitHub, open the repository → **Settings → Pages**.
   - Source: **Deploy from a branch** → Branch: **main**, folder **/ (root)** → **Save**.
6. Wait 1–2 minutes. Your app is live at
   **https://YOUR-USERNAME.github.io/wellness-tracker/**

**Updating later**
```powershell
git add .
git commit -m "Describe your change"
git push
```
After changing files, also open `sw.js` and bump `CACHE = 'my-wellness-v1'` to `v2`, `v3`, … so installed phones get the new version (it appears after you reopen the app once or twice).

⚠️ Never put backup files (`wellness-backup-*.json`) in this folder's Git history. The `.gitignore` blocks the default names, but keep backups elsewhere (for example in Documents) to be safe.

## 4. Install it on your phone

Open your GitHub Pages link on the phone first.

- **Android (Chrome):** tap ⋮ → **Add to Home screen** / **Install app**.
- **iPhone (Safari):** tap the **Share** button → **Add to Home Screen**. (Notifications on iPhone need iOS 16.4+ *and* the app opened from the Home Screen icon.)

It then opens full-screen like a normal app and works offline.

**Important:** your phone and computer each keep **separate** data. Pick one main device (your phone is best). To move data, use *Settings → Download backup* on one device and *Restore backup* on the other.

## 5. How it works

### Data storage
- Saved in your browser's **IndexedDB** (falls back to localStorage), on that device only.
- No accounts, no server, no API keys, and nothing is uploaded. GitHub only hosts the code.
- Clearing your browser's site data, or uninstalling the browser, **deletes your records**. Download a backup each month (Progress or Settings → *Backup (JSON)*). There's also a CSV export for spreadsheets.
- Settings → *Delete all my data* erases everything.

### Calorie calculation
1. **BMR** (resting calories) with the Mifflin–St Jeor formula:
   women: `10 × kg + 6.25 × cm − 5 × age − 161` (men: `+5`).
2. **Maintenance (TDEE)** = BMR × activity factor (1.2 / 1.375 / 1.55 / 1.725).
3. **Suggested target** = maintenance − a modest deficit (the smaller of 500 kcal or 20%), rounded to 50, and **never below 1,200 kcal**.
4. No deficit is suggested if you're under 18, your BMI is under 18.5, or your target weight isn't lower than your current weight.
5. Your earlier **1,600 kcal** goal is shown as an option with a comparison against your estimate. It's not applied automatically.
6. Food calories are estimates (marked "estimated"), especially for homemade Filipino dishes. Workout calories use MET values and are rough guesses. They're never added back as "extra food".

### Meal plan
- Generated per day from ~45 affordable Filipino meal ideas, sized to ~25% breakfast, 35% lunch, 10% snack, 30% dinner of your target.
- Dislikes and allergies are excluded; liked foods and ingredients you have at home are preferred; a tight budget favors the cheapest dishes.
- Tap **Swap** for a different idea or **Log it** to add it to your food diary.
- Food search uses the built-in list plus your saved foods; **Search online** uses the free Open Food Facts database (no key needed, values per 100 g). Manual entry always works.

### Reminders
- Water reminders run every *N* minutes within your active hours (default hourly, 7 AM–9 PM), skip if you drank recently, and can be paused for class, sleep, etc.
- Workout reminder at your set afternoon time (Mon–Fri); period reminder 2 days before the estimate.
- **Limitation:** GitHub Pages is static hosting with no server or scheduled jobs. Reminders only fire **while the app is open** (in a tab or as a running installed app). They can't wake a closed app. Each reminder also shows as an in-app message.

### Monthly check-in
- The first time you open the app each month, a check-in appears: enter your weight, see last month's summary, and update food preferences/ingredients.
- If your calorie target is on "Suggested", it's recalculated from the new weight.
- Future meal plans refresh to match your new preferences. Tap **Later** to skip until next time you open the app.

### Workouts
- Mon: upper body & arms · Tue: lower body & core · Wed: full body + arms · Thu: recovery & mobility · Fri: arms & core · Sat: optional walk/stretch · Sun: rest.
- Levels: *Beginner* (2 sets) or *Building up* (3 sets, more reps). Every set and rep count can be edited.
- **Light version** (busy school days, tired, or cramps): fewer exercises, 1 set each.

### Cycle tracking
- Averages your last 6 cycle lengths (uses your typical length until 2+ periods are logged) to estimate the next 3 periods.
- Predictions are **estimates, not guarantees**, and not birth control.
- Patterns appear after a couple of cycles (for example, "headaches often show up in the 5 days before your period").

## 6. Safety

This is a wellness tool, not medical advice. It avoids extreme diets and over-exercise, and won't set targets under 1,200 kcal. Talk to a doctor if you have a health condition, are under 18 and want to change your weight, or have very painful, heavy or irregular periods.

## 7. Ideas for later versions
- More Filipino dishes and your own recipes with ingredient-based calorie totals
- Weekly grocery list from the meal plan
- Exercise demo pictures/GIFs
- Optional cloud sync (would need a secure backend such as Supabase or Firebase with login)

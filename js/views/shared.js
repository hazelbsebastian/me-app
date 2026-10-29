/* =========================================================
   shared.js — pieces used on more than one page.
   ========================================================= */
const Shared = {
  dateNav(date, { max = Dates.today() } = {}) {
    const t = Dates.today();
    const label = date === t ? 'Today' : date === Dates.add(t, -1) ? 'Yesterday' : date === Dates.add(t, 1) ? 'Tomorrow' : Dates.nice(date);
    return `<div class="date-nav">
      <button class="icon-btn" data-act="prev-day" aria-label="Previous day">${UI.icon('left')}</button>
      <strong>${label} <span class="muted">· ${Dates.nice(date, { month: 'short', day: 'numeric' })}</span></strong>
      <button class="icon-btn" data-act="next-day" aria-label="Next day" ${date >= max ? 'disabled' : ''}>${UI.icon('right')}</button>
      ${date !== t ? '<button class="btn small ghost" data-act="today">Back to today</button>' : ''}
    </div>`;
  },

  /* ---------- Calorie target picker ---------- */
  calorieChooser(est, current, source) {
    const ref = Calc.compareTarget(Calc.REFERENCE_KCAL, est);
    const isRef = source === 'custom' && current === Calc.REFERENCE_KCAL;
    const isCustom = source === 'custom' && !isRef;
    return `
      <div class="kpis">
        <div class="kpi"><span>Resting burn (BMR)</span><strong>${fmt(est.bmr)}</strong><em>kcal/day</em></div>
        <div class="kpi"><span>Maintenance</span><strong>${fmt(est.tdee)}</strong><em>kcal/day, estimated</em></div>
        <div class="kpi"><span>Suggested</span><strong>${fmt(est.target)}</strong><em>kcal/day</em></div>
      </div>
      ${est.notes.length ? `<div class="note soft"><ul>${est.notes.map(n => `<li>${UI.esc(n)}</li>`).join('')}</ul></div><br>` : ''}
      <label class="option"><input type="radio" name="kcalChoice" value="auto" ${source !== 'custom' ? 'checked' : ''}>
        <div><strong>Suggested: ${fmt(est.target)} kcal</strong><span>${est.deficit > 0 ? `A modest deficit of about ${fmt(est.deficit)} kcal/day, roughly ${est.weeklyKg.toFixed(2)} kg per week.` : 'Estimated maintenance (no deficit).'} Updates automatically at each monthly check-in.</span></div></label>
      <label class="option"><input type="radio" name="kcalChoice" value="ref" ${isRef ? 'checked' : ''} ${ref.ok ? '' : 'disabled'}>
        <div><strong>Your earlier goal: ${fmt(Calc.REFERENCE_KCAL)} kcal</strong><span>${UI.esc(ref.msg)}</span></div></label>
      <label class="option"><input type="radio" name="kcalChoice" value="custom" ${isCustom ? 'checked' : ''}>
        <div><strong>Custom</strong>
        <input type="number" name="kcalCustom" min="1200" max="4500" step="50" placeholder="e.g. 1700" value="${isCustom ? current : ''}" aria-label="Custom calories">
        <span data-custom-msg></span></div></label>
      <p class="hint">These are estimates from the Mifflin–St Jeor formula and your activity level. Your real needs can differ. This is wellness guidance, not medical advice.</p>`;
  },
  bindCalorieChooser(form, est) {
    const input = form.querySelector('[name=kcalCustom]');
    const msg = form.querySelector('[data-custom-msg]');
    const update = () => {
      if (!input.value) { msg.textContent = ''; return; }
      msg.textContent = Calc.compareTarget(Number(input.value), est).msg;
    };
    input.addEventListener('input', () => { form.querySelector('[name=kcalChoice][value=custom]').checked = true; update(); });
    update();
  },
  readCalorieChoice(d, est) {
    if (d.kcalChoice === 'ref') return { kcal: Calc.REFERENCE_KCAL, source: 'custom' };
    if (d.kcalChoice === 'custom') {
      const k = Math.round(d.kcalCustom || 0);
      const c = Calc.compareTarget(k, est);
      if (!c.ok) { UI.toast(c.msg, 'error', 6000); return null; }
      return { kcal: k, source: 'custom' };
    }
    return { kcal: est.target, source: 'auto' };
  },
  openTargetModal(onDone) {
    const s = S(), p = s.profile;
    const est = Calc.estimate(p, Calc.currentWeight(s));
    UI.modal({
      title: 'Daily calorie target',
      body: this.calorieChooser(est, p.calorieTarget, p.calorieSource),
      onOpen: form => this.bindCalorieChooser(form, est),
      onSubmit: d => {
        const r = this.readCalorieChoice(d, est);
        if (!r) return false;
        p.calorieTarget = r.kcal; p.calorieSource = r.source;
        Planner.clearFuture();
        DB.save();
        UI.toast(`Daily target set to ${fmt(r.kcal)} kcal.`);
        onDone ? onDone() : App.render();
      }
    });
  },

  /* ---------- Food preferences ---------- */
  prefsFields(pr) {
    return `
      <div class="field"><label for="pf-likes">Foods you enjoy</label><input id="pf-likes" name="likes" value="${UI.esc(pr.likes)}" placeholder="e.g. chicken, monggo, banana"></div>
      <div class="field"><label for="pf-dis">Foods you dislike</label><input id="pf-dis" name="dislikes" value="${UI.esc(pr.dislikes)}" placeholder="e.g. ampalaya, liver"></div>
      <div class="field"><label for="pf-all">Allergies or foods to avoid</label><input id="pf-all" name="allergies" value="${UI.esc(pr.allergies)}" placeholder="e.g. shrimp, peanut, milk"></div>
      <div class="field-row">
        <div class="field"><label for="pf-bud">Budget</label><select id="pf-bud" name="budget">
          <option value="low" ${pr.budget === 'low' ? 'selected' : ''}>Tight (cheapest options)</option>
          <option value="mid" ${pr.budget === 'mid' ? 'selected' : ''}>Flexible</option></select></div>
      </div>
      <div class="field"><label for="pf-pan">Ingredients you have at home</label><input id="pf-pan" name="pantry" value="${UI.esc(pr.pantry)}" placeholder="e.g. eggs, rice, tuna, sayote"></div>
      <p class="hint">Separate items with commas. Allergies and dislikes are left out of your plan. Always double-check labels if you have a serious allergy.</p>`;
  },
  savePrefs(d) {
    const pr = S().mealPrefs;
    Object.assign(pr, { likes: d.likes, dislikes: d.dislikes, allergies: d.allergies, budget: d.budget, pantry: d.pantry, month: Dates.month(Dates.today()) });
    Planner.clearFuture();
    DB.save();
  },
  openPrefsModal(onDone) {
    UI.modal({
      title: 'Food preferences this month',
      body: this.prefsFields(S().mealPrefs),
      onSubmit: d => { this.savePrefs(d); UI.toast('Preferences saved. Your meal plan has been refreshed.'); onDone ? onDone() : App.render(); }
    });
  },

  /* ---------- Weight ---------- */
  saveWeight(date, kg) {
    const s = S();
    s.weights = s.weights.filter(w => w.date !== date);
    s.weights.push({ date, kg: Math.round(kg * 10) / 10 });
    s.weights.sort((a, b) => (a.date < b.date ? -1 : 1));
    DB.save();
  },
  openWeightModal(onDone) {
    const s = S();
    UI.modal({
      title: 'Log weight',
      body: `<div class="field-row">
          <div class="field"><label for="w-date">Date</label><input id="w-date" type="date" name="date" value="${Dates.today()}" max="${Dates.today()}" required></div>
          <div class="field"><label for="w-kg">Weight (kg)</label><input id="w-kg" type="number" name="kg" step="0.1" min="25" max="300" value="${Calc.currentWeight(s) || ''}" required></div>
        </div>
        <p class="hint">Tip: weigh yourself in the morning, after the bathroom, before eating. Your weight can shift 0.5–2 kg from day to day (water, salt, your cycle), so watch the trend.</p>`,
      onSubmit: d => {
        if (!d.kg || d.kg < 25 || d.kg > 300) { UI.toast('Please enter a weight between 25 and 300 kg.', 'error'); return false; }
        this.saveWeight(d.date || Dates.today(), d.kg);
        UI.toast('Weight saved.');
        onDone ? onDone() : App.render();
      }
    });
  },

  /* ---------- Notifications info ---------- */
  notifBlock() {
    const perm = Reminders.permission();
    const status = {
      granted: '<span class="chip">Notifications on</span>',
      denied: '<span class="chip rose">Blocked in browser settings</span>',
      default: '<button class="btn small" data-act="notif-perm">Turn on notifications</button>',
      unsupported: '<span class="chip plain">Not supported in this browser</span>'
    }[perm];
    return `<div class="note water" style="margin-top:12px"><div class="btn-row" style="margin-top:0">${UI.icon('bell', 18)} ${status}</div>
      <p style="margin:0">Reminders work while this app is open (in a browser tab or as an installed app). Because the site is hosted on GitHub Pages without a server, it can't send reminders when it's fully closed. You'll always see reminders inside the app too. On iPhone, notifications only work after you install the app to your Home Screen (iOS 16.4+).</p></div>`;
  },

  /* ---------- Backups ---------- */
  download(name, text, type = 'application/json') {
    const blob = new Blob([text], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  },
  exportJSON() {
    this.download(`wellness-backup-${Dates.today()}.json`, JSON.stringify(S(), null, 2));
    UI.toast('Backup downloaded. Keep it somewhere private, and never upload it to GitHub.', 'info', 6000);
  },
  exportCSV() {
    const s = S();
    const dates = new Set([...Object.keys(s.foodLog), ...Object.keys(s.water.log), ...Object.keys(s.workouts.log), ...s.weights.map(w => w.date), ...Object.keys(s.cycle.days)]);
    const st = Cycle.stats(s.cycle);
    const rows = [['date', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'water_ml', 'workout_done', 'weight_kg', 'period_day', 'flow', 'cramps', 'symptoms', 'mood', 'energy']];
    for (const d of [...dates].sort()) {
      const t = Food.totals(d), log = s.cycle.days[d] || {};
      rows.push([d, Math.round(t.kcal), Math.round(t.p), Math.round(t.c), Math.round(t.f), Water.total(d),
        Workout.isDone(d, s) ? 'yes' : 'no', s.weights.find(w => w.date === d)?.kg ?? '',
        Cycle.isRecorded(d, st.periods) ? 'yes' : 'no', log.flow || '', log.cramps != null ? DATA.CRAMPS[log.cramps] : '',
        (log.symptoms || []).join('; '), log.mood || '', log.energy || '']);
    }
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    this.download(`wellness-daily-${Dates.today()}.csv`, csv, 'text/csv');
  },
  importJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (!data || typeof data !== 'object' || !('profile' in data) || !('foodLog' in data)) throw new Error('bad');
        const ok = await UI.confirm('This replaces ALL data in this browser with the backup file. Continue?', { title: 'Restore backup', ok: 'Restore' });
        if (!ok) return;
        await DB.replace(data);
        UI.toast('Backup restored.');
        App.render();
      } catch (e) {
        UI.toast("That file doesn't look like a backup from this app.", 'error');
      }
    };
    input.click();
  },
  deleteAll() {
    UI.modal({
      title: 'Delete all data',
      body: '<p>This permanently erases your profile, food logs, water, workouts, weight and cycle records from this browser. Download a backup first if you want to keep them.</p><div class="field"><label for="del-confirm">Type DELETE to confirm</label><input id="del-confirm" name="confirm" autocomplete="off"></div>',
      submitLabel: 'Delete everything', danger: true,
      onSubmit: async d => {
        if (d.confirm !== 'DELETE') { UI.toast('Type DELETE in capital letters to confirm.', 'error'); return false; }
        await DB.reset();
        UI.toast('All data deleted.');
        location.hash = '#/dashboard';
        App.render();
      }
    });
  }
};

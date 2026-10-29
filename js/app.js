/* =========================================================
   app.js — starts the app, page navigation and the
   monthly check-in.
   ========================================================= */
const App = {
  NAV: [
    { r: 'dashboard', label: 'Home', icon: 'home' },
    { r: 'nutrition', label: 'Nutrition', icon: 'food' },
    { r: 'workouts', label: 'Workouts', icon: 'dumbbell' },
    { r: 'cycle', label: 'Cycle', icon: 'cycle' },
    { r: 'progress', label: 'Progress', icon: 'chart' }
  ],
  ROUTES: ['dashboard', 'nutrition', 'workouts', 'cycle', 'progress', 'settings'],
  checkinSkipped: false,

  parse() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    return { route: this.ROUTES.includes(parts[0]) ? parts[0] : 'dashboard', sub: parts[1] || null };
  },

  buildNav() {
    const links = this.NAV.map(n => `<a href="#/${n.r}" data-route="${n.r}">${UI.icon(n.icon, 22)}<span>${n.label}</span></a>`).join('');
    document.getElementById('side-nav').innerHTML = links + `<a href="#/settings" data-route="settings">${UI.icon('gear', 22)}<span>Settings</span></a>`;
    document.getElementById('bottom-nav').innerHTML = links;
    document.getElementById('settings-link').innerHTML = UI.icon('gear', 22);
  },

  render() {
    const main = document.getElementById('main');
    main.onclick = main.onchange = main.oninput = null;
    if (!S().profile) {
      document.body.classList.add('onboarding');
      Views.onboarding.render(main);
      return;
    }
    document.body.classList.remove('onboarding');
    const { route, sub } = this.parse();
    const view = Views[route];
    const title = typeof view.title === 'function' ? view.title() : view.title;
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-sub').textContent = view.sub ? view.sub() : '';
    document.title = `${route === 'dashboard' ? 'Home' : title} · My Wellness`;
    try {
      view.render(main, sub);
    } catch (err) {
      console.error(err);
      main.innerHTML = `<div class="card"><h2>Something went wrong</h2><p class="muted">${UI.esc(err.message)}</p><p>Your data is safe. Try reloading the page.</p></div>`;
    }
    document.querySelectorAll('[data-route]').forEach(a => a.classList.toggle('active', a.dataset.route === route));
  },

  /* At the start of each month: update weight, review progress and food preferences. */
  checkMonthly() {
    const s = S();
    if (!s.profile || this.checkinSkipped || document.querySelector('.modal-backdrop')) return;
    const today = Dates.today(), m = Dates.month(today);
    if (s.checkins[m]) return;
    const last = Report.month(Dates.addMonths(m, -1));
    UI.modal({
      title: `Hello, ${Dates.monthName(m)}!`,
      body: `<p>Time for your monthly check-in: update your weight, look back at last month, and refresh your food preferences.</p>
        <div class="note"><strong>Last month:</strong> food logged on ${last.daysLogged} day(s), ${last.workoutsDone} workout(s) done, water goal met ${last.waterGoalDays} day(s)${last.change != null ? `, weight change ${last.change > 0 ? '+' : ''}${last.change.toFixed(1)} kg` : ''}.</div>
        <br>
        <div class="field"><label for="ci-kg">Today's weight (kg)</label><input id="ci-kg" type="number" name="kg" step="0.1" min="25" max="300" value="${Calc.currentWeight(s)}" required></div>
        <hr><h3>Food for this month</h3>
        ${Shared.prefsFields(s.mealPrefs)}
        <p class="hint">Tip: download a backup from the Progress page after your check-in.</p>`,
      submitLabel: 'Save check-in',
      cancelLabel: 'Later',
      onClose: () => { if (!s.checkins[m]) this.checkinSkipped = true; },
      onSubmit: d => {
        if (!d.kg || d.kg < 25 || d.kg > 300) { UI.toast('Please enter your weight.', 'error'); return false; }
        Shared.saveWeight(today, d.kg);
        Shared.savePrefs(d);
        s.checkins[m] = { date: today, kg: d.kg };
        let msg = 'Check-in saved.';
        if (s.profile.calorieSource === 'auto') {
          const est = Calc.estimate(s.profile, d.kg);
          if (est.target !== s.profile.calorieTarget) msg += ` Your suggested target is now ${fmt(est.target)} kcal.`;
          s.profile.calorieTarget = est.target;
        }
        DB.save();
        UI.toast(msg, 'info', 6000);
        this.render();
      }
    });
  }
};

window.addEventListener('hashchange', () => { App.render(); window.scrollTo(0, 0); });

(async function start() {
  await DB.load();
  App.buildNav();
  App.render();
  App.checkMonthly();
  Reminders.start();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('Offline mode unavailable', err));
  }
  // Ask the browser not to clear your data when space is low.
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
})();

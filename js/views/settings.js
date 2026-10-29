/* =========================================================
   settings.js — profile, targets, reminders and your data.
   ========================================================= */
Views.settings = {
  title: 'Settings',
  sub: () => 'Profile, reminders & privacy',

  render(el) {
    const s = S(), p = s.profile;
    const est = Calc.estimate(p, Calc.currentWeight(s));

    el.innerHTML = `<div class="grid two">
      <section class="card">
        <h2>Profile</h2>
        <form id="profile-form">
          <div class="field"><label for="st-name">Name</label><input id="st-name" name="name" value="${UI.esc(p.name)}"></div>
          <div class="field-row">
            <div class="field"><label for="st-dob">Date of birth</label><input id="st-dob" type="date" name="dob" value="${p.dob}" max="${Dates.today()}" required></div>
            <div class="field"><label for="st-sex">Sex for calorie formula</label><select id="st-sex" name="sex"><option value="female" ${p.sex === 'female' ? 'selected' : ''}>Female</option><option value="male" ${p.sex === 'male' ? 'selected' : ''}>Male</option></select></div>
          </div>
          <div class="field-row">
            <div class="field"><label for="st-cm">Height (cm)</label><input id="st-cm" type="number" name="heightCm" min="120" max="220" step="0.5" value="${p.heightCm}" required></div>
            <div class="field"><label for="st-tkg">Target weight (kg)</label><input id="st-tkg" type="number" name="targetKg" min="25" max="300" step="0.1" value="${p.targetKg}" required></div>
          </div>
          <div class="field"><label for="st-act">Activity level</label><select id="st-act" name="activity">${Object.entries(Calc.ACTIVITY).map(([k, v]) => `<option value="${k}" ${p.activity === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></div>
          <fieldset class="field"><legend>Goals</legend><div class="chips">${DATA.GOALS.map(g => `<label class="chip-check"><input type="checkbox" name="goals[]" value="${UI.esc(g)}" ${(p.goals || []).includes(g) ? 'checked' : ''}><span>${UI.esc(g)}</span></label>`).join('')}</div></fieldset>
          <p class="hint">To update your current weight, use “Log weight” on the Progress page.</p>
          <button class="btn primary" type="submit">Save profile</button>
        </form>
      </section>

      <div class="stack">
        <section class="card">
          <div class="card-head"><h2>Calorie target</h2><button class="btn small" data-act="target">Change</button></div>
          <div class="kpis">
            <div class="kpi"><span>Your target</span><strong>${fmt(p.calorieTarget)}</strong><em>${p.calorieSource === 'auto' ? 'suggested (auto-updates monthly)' : 'set by you'}</em></div>
            <div class="kpi"><span>Maintenance</span><strong>${fmt(est.tdee)}</strong><em>estimated</em></div>
            <div class="kpi"><span>Suggested</span><strong>${fmt(est.target)}</strong></div>
          </div>
          <p class="hint">${UI.esc(Calc.compareTarget(p.calorieTarget, est).msg)}</p>
        </section>

        <section class="card">
          <div class="card-head"><h2>Food preferences</h2><button class="btn small" data-act="prefs">Edit</button></div>
          <p class="muted">Used to build your daily Filipino meal plan. You'll be asked to review them each month.</p>
        </section>

        <section class="card">
          <h2>Workouts & reminders</h2>
          <div class="field-row">
            <div class="field"><label for="st-wt">Workout time</label><input id="st-wt" type="time" min="12:00" max="18:30" value="${s.workouts.time}" data-change="wtime"></div>
            <div class="field"><label for="st-dt">Dinner time</label><input id="st-dt" type="time" value="${s.workouts.dinnerTime}" data-change="dtime"></div>
          </div>
          <label class="switch"><input type="checkbox" data-change="period-remind" ${s.cycle.remind ? 'checked' : ''}> Remind me 2 days before an expected period</label>
          <p class="hint">Water reminders are set up on the <a href="#/nutrition/water">Water</a> tab.</p>
          ${Shared.notifBlock()}
          <div class="btn-row"><button class="btn small ghost" data-act="test-notif">Send a test reminder</button></div>
        </section>
      </div>
    </div>

    <div class="grid two">
      <section class="card">
        <h2>Your data</h2>
        <p class="muted">Everything is stored in this browser on this device only (IndexedDB). It is not uploaded to GitHub or anywhere else, and it doesn't sync between your phone and computer.</p>
        <div class="btn-row">
          <button class="btn" data-act="export">${UI.icon('download', 18)} Download backup</button>
          <button class="btn ghost" data-act="csv">Export CSV</button>
          <button class="btn ghost" data-act="import">${UI.icon('upload', 18)} Restore backup</button>
        </div>
        <p class="hint">To move your data to another device: download a backup here, send the file to yourself privately, then use “Restore backup” on the other device.</p>
        <hr>
        <button class="btn danger" data-act="delete">Delete all my data</button>
      </section>

      <section class="card prose">
        <h2>About & safety</h2>
        <ul>
          <li>This app gives general wellness suggestions. It is not a medical device and does not diagnose or treat anything.</li>
          <li>Calories for food and exercise are estimates. Treat them as a guide.</li>
          <li>It never suggests eating under 1,200 kcal/day or exercising to "make up" for food.</li>
          <li>Cycle predictions are estimates, not guarantees, and should not be used as birth control.</li>
          <li>If you feel unwell, have a health condition, are pregnant, or are under 18 and want to change your weight, please talk to a doctor.</li>
        </ul>
      </section>
    </div>`;

    el.querySelector('#profile-form').onsubmit = e => {
      e.preventDefault();
      const d = UI.formData(e.target);
      const age = Calc.age(d.dob);
      if (!d.dob || age < 10 || age > 100) return UI.toast('Please enter a valid date of birth.', 'error');
      if (!d.heightCm || d.heightCm < 120 || d.heightCm > 220) return UI.toast('Height should be 120–220 cm.', 'error');
      if (!d.targetKg) return UI.toast('Please enter a target weight.', 'error');
      Object.assign(p, { name: d.name, dob: d.dob, sex: d.sex, heightCm: d.heightCm, targetKg: d.targetKg, activity: d.activity, goals: d.goals });
      if (p.calorieSource === 'auto') {
        p.calorieTarget = Calc.estimate(p, Calc.currentWeight(s)).target;
        Planner.clearFuture();
      }
      DB.save();
      UI.toast(p.calorieSource === 'auto' ? `Profile saved. Daily target is now ${fmt(p.calorieTarget)} kcal.` : 'Profile saved.');
      App.render();
    };

    el.onclick = async e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const a = b.dataset.act;
      if (a === 'target') Shared.openTargetModal();
      if (a === 'prefs') Shared.openPrefsModal();
      if (a === 'notif-perm') { await Reminders.requestPermission(); App.render(); }
      if (a === 'test-notif') Reminders.notify('Test reminder', 'Reminders are working.');
      if (a === 'export') Shared.exportJSON();
      if (a === 'csv') Shared.exportCSV();
      if (a === 'import') Shared.importJSON();
      if (a === 'delete') Shared.deleteAll();
    };

    el.onchange = e => {
      const t = e.target, k = t.dataset.change;
      if (!k) return;
      if (k === 'wtime') {
        if (t.value < '12:00' || t.value >= s.workouts.dinnerTime) { UI.toast('Pick an afternoon time before your dinner time.', 'error'); return App.render(); }
        s.workouts.time = t.value; s.workouts.notified = null;
      }
      if (k === 'dtime') {
        if (t.value <= s.workouts.time) { UI.toast('Dinner time should be after your workout time.', 'error'); return App.render(); }
        s.workouts.dinnerTime = t.value;
      }
      if (k === 'period-remind') s.cycle.remind = t.checked;
      DB.save();
      UI.toast('Saved.');
    };
  }
};

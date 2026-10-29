/* =========================================================
   onboarding.js — first-time setup (3 short steps).
   ========================================================= */
Views.onboarding = (() => {
  let step = 1;
  const draft = {
    name: '', dob: '', sex: 'female', heightCm: null, weightKg: null, targetKg: null, activity: 'light',
    goals: [], likes: '', dislikes: '', allergies: '', budget: 'low', pantry: '',
    lastPeriod: '', cycleLen: 28, periodLen: 5
  };

  function steps() { return `<div class="steps">${[1, 2, 3].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`; }

  function step1() {
    return `<section class="card">
      ${steps()}
      <h1>Welcome! Let's set things up</h1>
      <p class="muted">Everything you enter stays private on this device. You can change it any time in Settings.</p>
      <form id="ob">
        <div class="field"><label for="ob-name">Your name (optional)</label><input id="ob-name" name="name" value="${UI.esc(draft.name)}" autocomplete="given-name"></div>
        <div class="field-row">
          <div class="field"><label for="ob-dob">Date of birth</label><input id="ob-dob" type="date" name="dob" value="${draft.dob}" max="${Dates.today()}" required></div>
          <div class="field"><label for="ob-sex">Sex for calorie formula</label><select id="ob-sex" name="sex">
            <option value="female" ${draft.sex === 'female' ? 'selected' : ''}>Female</option>
            <option value="male" ${draft.sex === 'male' ? 'selected' : ''}>Male</option></select></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="ob-cm">Height (cm)</label><input id="ob-cm" type="number" name="heightCm" min="120" max="220" step="0.5" value="${draft.heightCm ?? ''}" required></div>
          <div class="field"><label for="ob-ft">or feet</label><input id="ob-ft" type="number" min="3" max="7" step="1" data-ft></div>
          <div class="field"><label for="ob-in">inches</label><input id="ob-in" type="number" min="0" max="11.5" step="0.5" data-in></div>
        </div>
        <div class="field-row">
          <div class="field"><label for="ob-kg">Current weight (kg)</label><input id="ob-kg" type="number" name="weightKg" min="25" max="300" step="0.1" value="${draft.weightKg ?? ''}" required></div>
          <div class="field"><label for="ob-tkg">Target weight (kg)</label><input id="ob-tkg" type="number" name="targetKg" min="25" max="300" step="0.1" value="${draft.targetKg ?? ''}" required></div>
        </div>
        <div class="field"><label for="ob-act">Activity level</label><select id="ob-act" name="activity">
          ${Object.entries(Calc.ACTIVITY).map(([k, v]) => `<option value="${k}" ${draft.activity === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>
          <p class="hint">Not sure? A student who sits in class most of the day and does these workouts is usually "Lightly active".</p></div>
        <div class="btn-row"><button class="btn primary" type="submit">Next</button></div>
      </form></section>`;
  }

  function step2() {
    return `<section class="card">
      ${steps()}
      <h1>Your goals, food and cycle</h1>
      <form id="ob">
        <fieldset class="field"><legend>What would you like to focus on?</legend><div class="chips">
          ${DATA.GOALS.map(g => `<label class="chip-check"><input type="checkbox" name="goals[]" value="${UI.esc(g)}" ${draft.goals.includes(g) ? 'checked' : ''}><span>${UI.esc(g)}</span></label>`).join('')}
        </div></fieldset>
        <hr><h3>Food preferences for this month</h3>
        ${Shared.prefsFields(draft)}
        <hr><h3>Cycle (optional)</h3>
        <div class="field-row">
          <div class="field"><label for="ob-lp">First day of your last period</label><input id="ob-lp" type="date" name="lastPeriod" value="${draft.lastPeriod}" max="${Dates.today()}"></div>
          <div class="field"><label for="ob-pl">Period usually lasts (days)</label><input id="ob-pl" type="number" name="periodLen" min="2" max="10" value="${draft.periodLen}"></div>
          <div class="field"><label for="ob-cl">Cycle usually lasts (days)</label><input id="ob-cl" type="number" name="cycleLen" min="20" max="45" value="${draft.cycleLen}"></div>
        </div>
        <p class="hint">Not sure? Leave the defaults. The app learns your averages as you log periods.</p>
        <div class="btn-row"><button class="btn ghost" type="button" data-act="back">Back</button><button class="btn primary" type="submit">Next</button></div>
      </form></section>`;
  }

  function profileFromDraft() {
    return { name: draft.name, dob: draft.dob, sex: draft.sex, heightCm: draft.heightCm, weightKg: draft.weightKg, targetKg: draft.targetKg, activity: draft.activity, goals: draft.goals };
  }

  function step3() {
    const est = Calc.estimate(profileFromDraft());
    return `<section class="card">
      ${steps()}
      <h1>Your daily calorie target</h1>
      <p class="muted">Based on your age (${est.age}), height, weight and activity. BMI: ${est.bmi.toFixed(1)}.</p>
      <form id="ob">
        ${Shared.calorieChooser(est, est.target, 'auto')}
        <div class="note">This app avoids extreme diets. It never goes below 1,200 kcal and never asks you to "burn off" food with extra exercise. Slow, steady change is healthier and easier to keep.</div>
        <div class="btn-row"><button class="btn ghost" type="button" data-act="back">Back</button><button class="btn primary" type="submit">Start tracking</button></div>
      </form></section>`;
  }

  function finish(choice) {
    const s = S(), today = Dates.today();
    s.profile = { ...profileFromDraft(), calorieTarget: choice.kcal, calorieSource: choice.source, createdAt: today };
    s.weights = [{ date: today, kg: draft.weightKg }];
    Object.assign(s.mealPrefs, { likes: draft.likes, dislikes: draft.dislikes, allergies: draft.allergies, budget: draft.budget, pantry: draft.pantry, month: Dates.month(today) });
    s.cycle.defaultCycle = draft.cycleLen || 28;
    s.cycle.defaultPeriod = draft.periodLen || 5;
    if (draft.lastPeriod) {
      const end = Dates.add(draft.lastPeriod, (draft.periodLen || 5) - 1);
      s.cycle.periods = [{ id: uid(), start: draft.lastPeriod, end: end < today ? end : null }];
    }
    s.checkins[Dates.month(today)] = { date: today, kg: draft.weightKg };
    s.mealPlans = {};
    DB.flush();
    step = 1;
    location.hash = '#/dashboard';
    App.render();
    UI.toast('All set! Welcome to your wellness tracker.');
  }

  function render(el) {
    el.innerHTML = step === 1 ? step1() : step === 2 ? step2() : step3();
    const form = el.querySelector('#ob');
    if (step === 1) {
      const cm = form.querySelector('[name=heightCm]'), ft = form.querySelector('[data-ft]'), inch = form.querySelector('[data-in]');
      const fromFt = () => { const f = Number(ft.value) || 0, i = Number(inch.value) || 0; if (f) cm.value = Math.round((f * 30.48 + i * 2.54) * 2) / 2; };
      ft.oninput = fromFt; inch.oninput = fromFt;
    }
    if (step === 3) Shared.bindCalorieChooser(form, Calc.estimate(profileFromDraft()));
    el.onclick = e => {
      if (e.target.closest('[data-act=back]')) { saveDraft(form); step--; render(el); window.scrollTo(0, 0); }
    };
    form.onsubmit = e => {
      e.preventDefault();
      const d = UI.formData(form);
      if (step === 1) {
        const age = Calc.age(d.dob);
        if (!d.dob || age < 10 || age > 100) return UI.toast('Please enter a valid date of birth.', 'error');
        if (!d.heightCm || d.heightCm < 120 || d.heightCm > 220) return UI.toast('Please enter your height in cm (120–220).', 'error');
        if (!d.weightKg || !d.targetKg) return UI.toast('Please enter your current and target weight.', 'error');
        if (age < 18) UI.toast("Since you're under 18, the app will focus on healthy habits instead of a calorie deficit.", 'info', 7000);
      }
      saveDraft(form);
      if (step < 3) { step++; render(el); window.scrollTo(0, 0); return; }
      const choice = Shared.readCalorieChoice(d, Calc.estimate(profileFromDraft()));
      if (choice) finish(choice);
    };
  }

  function saveDraft(form) {
    const d = UI.formData(form);
    for (const k of Object.keys(d)) if (k in draft) draft[k] = d[k];
  }

  return { title: 'Welcome', render };
})();

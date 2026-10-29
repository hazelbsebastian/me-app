/* =========================================================
   dashboard.js — today at a glance.
   ========================================================= */
Views.dashboard = {
  title() {
    const h = new Date().getHours(), n = S().profile?.name;
    return `${h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'}${n ? ', ' + n : ''}`;
  },
  sub() { return new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }); },

  render(el) {
    const s = S(), p = s.profile, today = Dates.today();
    const tot = Food.totals(today), target = p.calorieTarget, remain = target - tot.kcal;
    const water = Water.total(today), wg = s.water.goalMl;
    const kg = Calc.currentWeight(s);
    const wk = Workout.planFor(today, s), doneN = wk.items.filter(i => i.done).length;
    const st = Cycle.stats(s.cycle, today);
    const plan = Planner.getDay(today);
    const ws = s.weights.slice(-12);
    const month = Report.month(Dates.month(today));
    const checklist = Checklist.items(today);
    const toGo = Math.abs(kg - p.targetKg);

    let cycleLine;
    if (!st.last) cycleLine = '<p class="muted">No periods logged yet.</p>';
    else if (st.open) cycleLine = `<p><strong>Period day ${Dates.diff(st.open.start, today) + 1}</strong></p><p class="muted">Remember to tap “Period ended” when it stops.</p>`;
    else {
      const d = Dates.diff(today, st.next[0]);
      cycleLine = `<p><strong>Cycle day ${st.dayOfCycle}</strong></p><p class="muted">${st.late ? `Estimated start was ${Dates.nice(st.next[0])}. Cycles vary, and this is only an estimate.` : `Next period estimated ${d === 0 ? 'today' : d === 1 ? 'tomorrow' : `in ${d} days (${Dates.nice(st.next[0])})`}.`}</p>`;
    }

    el.innerHTML = `<div class="grid">
      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic">${UI.icon('food', 18)}</span>Calories</h2><a class="btn small" href="#/nutrition/food">Log food</a></div>
        <div class="summary-row">
          ${Charts.ring(tot.kcal / target, { size: 112, label: fmt(tot.kcal), sub: `of ${fmt(target)}` })}
          <div class="stack-sm">
            <div class="stat"><span>${remain >= 0 ? 'Remaining (est.)' : 'Over estimate'}</span><strong>${fmt(Math.abs(remain))} kcal</strong></div>
            <div class="stat"><span>Daily target</span><strong>${fmt(target)} kcal</strong></div>
          </div>
        </div>
        <p class="hint">Calories are estimates. Aim for balance, not perfection.</p>
      </section>

      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic water">${UI.icon('water', 18)}</span>Water</h2><a class="btn small ghost" href="#/nutrition/water">Details</a></div>
        <div class="summary-row">
          ${Charts.ring(water / wg, { size: 112, color: 'var(--water)', label: `${fmt(water)}`, sub: `of ${fmt(wg)} mL` })}
          <div class="stack-sm">
            <button class="btn water-btn small" data-act="water" data-ml="250">+250 mL</button>
            <button class="btn water-btn small" data-act="water" data-ml="500">+500 mL</button>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic amber">${UI.icon('dumbbell', 18)}</span>Today's workout</h2><a class="btn small" href="#/workouts">${wk.plan.rest ? 'View week' : 'Open'}</a></div>
        <h3>${UI.esc(wk.plan.title)}${wk.light ? ' <span class="chip">Light</span>' : ''}</h3>
        <p class="muted">${UI.esc(wk.plan.focus)}</p>
        ${wk.items.length ? `${Charts.progress(doneN / wk.items.length)}<p class="hint">${doneN} of ${wk.items.length} exercises done · scheduled ${Dates.hmStr(s.workouts.time)}, before dinner</p>` : '<p class="hint">Enjoy your rest. Recovery is part of getting stronger.</p>'}
      </section>

      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic">${UI.icon('scale', 18)}</span>Weight</h2><button class="btn small" data-act="weight">Log weight</button></div>
        <div class="kpis">
          <div class="kpi"><span>Current</span><strong>${kg} kg</strong></div>
          <div class="kpi"><span>Target</span><strong>${p.targetKg} kg</strong></div>
          <div class="kpi"><span>To go</span><strong>${toGo.toFixed(1)} kg</strong></div>
        </div>
        ${ws.length > 1 ? Charts.line(ws.map(w => ({ label: Dates.nice(w.date, { month: 'short', day: 'numeric' }), y: w.kg })), { goal: p.targetKg, unit: 'kg', height: 150 }) : '<p class="hint">Log your weight about once a week to see your trend here.</p>'}
      </section>

      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic">${UI.icon('list', 18)}</span>Today's meals</h2><a class="btn small ghost" href="#/nutrition/plan">Meal plan</a></div>
        <ul class="list">${Planner.SLOTS.map(sl => {
          const items = Food.entries(today).filter(e => e.slot === sl);
          const m = DATA.mealById(plan[sl]);
          return `<li class="list-item"><div><strong>${Planner.LABEL[sl]}</strong><span class="muted">${items.length ? UI.esc(items.map(e => e.name).join(', ')) : m ? 'Planned: ' + UI.esc(m.name) : 'Nothing planned'}</span></div>
            <div class="right">${items.length ? `<span class="chip">${fmt(items.reduce((a, e) => a + Food.entryKcal(e), 0))} kcal</span>` : m ? `<button class="btn small" data-act="log-plan" data-slot="${sl}">Log</button>` : ''}</div></li>`;
        }).join('')}</ul>
      </section>

      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic rose">${UI.icon('cycle', 18)}</span>Cycle</h2><a class="btn small ghost" href="#/cycle">Open</a></div>
        ${cycleLine}
        <div class="btn-row">${st.open ? '<button class="btn small rose" data-act="period-end">Period ended today</button>' : '<button class="btn small rose" data-act="period-start">Period started today</button>'}</div>
      </section>

      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic">${UI.icon('check', 18)}</span>Daily checklist</h2><span class="chip">${checklist.filter(i => i.done).length}/${checklist.length}</span></div>
        <ul class="checklist">${checklist.map(i => `<li class="${i.done ? 'done' : ''}">
          <input type="checkbox" id="ck-${i.key}" data-act="check" data-key="${i.key}" ${i.done ? 'checked' : ''} ${i.auto ? 'disabled' : ''}>
          <label for="ck-${i.key}"><span>${UI.esc(i.label)}</span></label>
          ${i.href && !i.done ? `<a href="${i.href}">Go</a>` : ''}</li>`).join('')}</ul>
        <p class="hint">Most items tick themselves when you log. Tap the rest yourself.</p>
      </section>

      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic">${UI.icon('chart', 18)}</span>${Dates.monthName(month.m)}</h2><a class="btn small ghost" href="#/progress">Report</a></div>
        <div class="kpis">
          <div class="kpi"><span>Days with food logged</span><strong>${month.daysLogged}/${month.dates.length}</strong></div>
          <div class="kpi"><span>Workouts done</span><strong>${month.workoutsDone}/${month.plannedWorkouts}</strong></div>
          <div class="kpi"><span>Water goal days</span><strong>${month.waterGoalDays}</strong></div>
          <div class="kpi"><span>Weight change</span><strong>${month.change == null ? 'n/a' : (month.change > 0 ? '+' : '') + month.change.toFixed(1) + ' kg'}</strong></div>
        </div>
        <p class="hint">Habit consistency this month: ${Math.round(month.habit * 100)}%</p>
      </section>
    </div>`;

    el.onclick = e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const act = b.dataset.act;
      if (act === 'water') { Water.add(Number(b.dataset.ml)); UI.toast(`+${b.dataset.ml} mL logged`); App.render(); }
      if (act === 'weight') Shared.openWeightModal();
      if (act === 'log-plan') {
        const m = DATA.mealById(plan[b.dataset.slot]);
        Food.add(today, { id: uid(), slot: b.dataset.slot, name: m.name, serving: '1 plate (as planned)', servings: 1, kcalPer: m.kcal, pPer: m.p, cPer: m.c, fPer: m.f, estimated: true, source: 'plan', t: Date.now() });
        UI.toast(`${m.name} logged (≈${m.kcal} kcal).`);
        App.render();
      }
      if (act === 'check') { Checklist.toggle(today, b.dataset.key); App.render(); }
      if (act === 'period-start') { const r = Cycle.markStart(today); UI.toast(r === 'ok' ? 'Period start saved.' : 'Today is already part of a logged period.'); App.render(); }
      if (act === 'period-end') { Cycle.markEnd(today); UI.toast('Period end saved.'); App.render(); }
    };
  }
};

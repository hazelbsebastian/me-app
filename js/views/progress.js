/* =========================================================
   progress.js — weight trend and monthly reports.
   ========================================================= */
Views.progress = (() => {
  let month = null;
  const signed = n => (n > 0 ? '+' : '') + n.toFixed(1);

  function render(el) {
    const s = S(), p = s.profile, today = Dates.today();
    if (!month) month = Dates.month(today);
    const r = Report.month(month);
    const ws = [...s.weights].sort((a, b) => (a.date < b.date ? -1 : 1));
    const cur = Calc.currentWeight(s), start = ws[0]?.kg ?? p.weightKg;
    const st = Cycle.stats(s.cycle);
    const dayLabel = d => String(Number(d.slice(8)));

    const workoutDots = r.dates.map(d => {
      const plan = DATA.WEEK_PLAN[Dates.weekday(d)];
      const cls = r.doneDates.includes(d) ? 'done' : (plan.rest || plan.optional) ? 'rest' : 'miss';
      return `<i class="${cls}" title="${Dates.nice(d)}: ${cls === 'done' ? 'done' : cls === 'rest' ? 'rest / optional' : 'not done'}"></i>`;
    }).join('');

    el.innerHTML = `
      <section class="card">
        <div class="card-head"><h2><span class="card-title-ic">${UI.icon('scale', 18)}</span>Weight progress</h2><button class="btn small primary" data-act="weight">Log weight</button></div>
        <div class="kpis">
          <div class="kpi"><span>Current</span><strong>${cur} kg</strong></div>
          <div class="kpi"><span>Target</span><strong>${p.targetKg} kg</strong></div>
          <div class="kpi"><span>Since you started</span><strong>${signed(cur - start)} kg</strong></div>
          <div class="kpi"><span>To go</span><strong>${Math.abs(cur - p.targetKg).toFixed(1)} kg</strong></div>
        </div>
        ${Charts.line(ws.slice(-60).map(w => ({ label: Dates.nice(w.date, { month: 'short', day: 'numeric' }), y: w.kg })), { goal: p.targetKg, unit: 'kg', empty: 'Log your weight to see a chart.' })}
        <p class="hint">Weight naturally goes up and down 0.5–2 kg from day to day (water, salt, your cycle). Look at the trend over several weeks. A healthy pace is about 0.25–0.5 kg per week.</p>
        ${ws.length ? `<details><summary class="muted">All entries (${ws.length})</summary><ul class="list">${[...ws].reverse().map(w => `<li class="list-item"><span>${Dates.nice(w.date, { month: 'short', day: 'numeric', year: 'numeric' })}</span><div class="right"><strong>${w.kg} kg</strong><button class="icon-btn" data-act="del-weight" data-date="${w.date}" aria-label="Delete">${UI.icon('trash', 16)}</button></div></li>`).join('')}</ul></details>` : ''}
      </section>

      <div class="month-nav">
        <button class="icon-btn" data-act="month" data-n="-1" aria-label="Previous month">${UI.icon('left')}</button>
        <strong>${Dates.monthName(month)}</strong>
        <button class="icon-btn" data-act="month" data-n="1" aria-label="Next month" ${month >= Dates.month(today) ? 'disabled' : ''}>${UI.icon('right')}</button>
      </div>

      <section class="card">
        <h2>Monthly report</h2>
        ${!r.dates.length ? '<p class="empty-line">This month hasn\'t started yet.</p>' : `
        <div class="kpis">
          <div class="kpi"><span>Weight change</span><strong>${r.change == null ? 'n/a' : signed(r.change) + ' kg'}</strong><em>${r.endKg != null ? `${r.startKg} → ${r.endKg} kg` : 'no weigh-in this month'}</em></div>
          <div class="kpi"><span>Days with food logged</span><strong>${r.daysLogged}/${r.dates.length}</strong></div>
          <div class="kpi"><span>Average calories</span><strong>${r.daysLogged ? fmt(r.avgKcal) : 'n/a'}</strong><em>on logged days · target ${fmt(p.calorieTarget)}</em></div>
          <div class="kpi"><span>Average water</span><strong>${r.avgWater ? fmt(r.avgWater) + ' mL' : 'n/a'}</strong><em>goal met ${r.waterGoalDays} day(s)</em></div>
          <div class="kpi"><span>Workouts</span><strong>${r.workoutsDone}/${r.plannedWorkouts}</strong><em>planned weekdays so far</em></div>
          <div class="kpi"><span>Habit consistency</span><strong>${Math.round(r.habit * 100)}%</strong><em>daily checklist average</em></div>
        </div>
        <p class="hint">Progress, not perfection. Logging most days and moving regularly matters more than any single number.</p>`}
      </section>

      <div class="grid two">
        <section class="card"><h3>Calories per day (estimated)</h3>
          ${Charts.bar(r.kcalDays.map(x => ({ label: dayLabel(x.date), y: Math.round(x.kcal) })), { goal: p.calorieTarget, unit: 'kcal', empty: 'No food logged this month.' })}</section>
        <section class="card"><h3>Water per day</h3>
          ${Charts.bar(r.water.map(x => ({ label: dayLabel(x.date), y: x.ml })), { goal: s.water.goalMl, unit: 'mL', color: 'var(--water)', empty: 'No water logged this month.' })}</section>
      </div>
      <div class="grid two">
        <section class="card"><h3>Workout consistency</h3>
          ${r.dates.length ? `<div class="dot-row">${workoutDots}</div><div class="legend"><span><i style="background:var(--sage)"></i>Done</span><span><i style="background:var(--line)"></i>Not done</span><span><i style="border:1px dashed var(--line)"></i>Rest / optional</span></div>` : Charts.empty()}</section>
        <section class="card"><h3>Cycle this month</h3>
          ${r.periods.length ? `<ul class="list">${r.periods.map(x => `<li class="list-item"><span>${Dates.nice(x.start)}${x.end ? ' – ' + Dates.nice(x.end) : ' (ongoing)'}</span></li>`).join('')}</ul>` : '<p class="empty-line">No period recorded this month.</p>'}
          <p class="hint">Symptoms logged on ${r.symptomDays.length} day(s). Average cycle: ${st.avgCycle} days. <a href="#/cycle">See details</a></p></section>
      </div>

      <section class="card">
        <h3>Backup & export</h3>
        <p class="muted">Your records live only in this browser. Download a backup now and then (for example, at each monthly check-in) so you don't lose them if the browser data is cleared.</p>
        <div class="btn-row">
          <button class="btn" data-act="export">${UI.icon('download', 18)} Backup (JSON)</button>
          <button class="btn ghost" data-act="csv">${UI.icon('download', 18)} Daily summary (CSV)</button>
          <button class="btn ghost" data-act="import">${UI.icon('upload', 18)} Restore backup</button>
        </div>
      </section>`;

    el.onclick = async e => {
      const b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      const a = b.dataset.act;
      if (a === 'weight') return Shared.openWeightModal();
      if (a === 'del-weight') {
        if (await UI.confirm(`Delete the weight entry for ${Dates.nice(b.dataset.date)}?`, { ok: 'Delete' })) {
          s.weights = s.weights.filter(w => w.date !== b.dataset.date);
          DB.save();
        }
      }
      if (a === 'month') month = Dates.addMonths(month, Number(b.dataset.n));
      if (a === 'export') return Shared.exportJSON();
      if (a === 'csv') return Shared.exportCSV();
      if (a === 'import') return Shared.importJSON();
      App.render();
    };
  }

  return { title: 'Progress', sub: () => 'Weight trend & monthly reports', render };
})();

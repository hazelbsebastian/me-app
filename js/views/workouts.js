/* =========================================================
   workouts.js — weekly, equipment-free workout planner.
   ========================================================= */
Views.workouts = (() => {
  let date = null;
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const PHASE = { warmup: 'Warm-up', main: 'Main workout', cooldown: 'Cool-down' };

  function weekStrip(today) {
    const mon = Dates.mondayOf(date);
    return `<div class="week-strip">${[0, 1, 2, 3, 4, 5, 6].map(i => {
      const d = Dates.add(mon, i), plan = DATA.WEEK_PLAN[Dates.weekday(d)];
      const done = Workout.isDone(d);
      const status = plan.rest ? 'Rest' : done ? 'Done' : plan.optional ? 'Optional' : d < today ? 'Missed' : d === today ? 'Today' : '';
      return `<button class="wday ${d === date ? 'active' : ''} ${done ? 'done' : ''}" data-act="day" data-date="${d}" aria-label="${Dates.nice(d)}"><b>${DAY[Dates.weekday(d)]}</b><span>${status || Dates.parse(d).getDate()}</span></button>`;
    }).join('')}</div>`;
  }

  function exRow(it, editable) {
    const ex = it.ex;
    const unit = ex.type === 'reps' ? 'reps' : ex.unit === 'min' ? 'min' : 'sec';
    return `<div class="ex ${it.done ? 'done' : ''}">
      <input type="checkbox" aria-label="Done: ${UI.esc(ex.name)}" data-act="toggle" data-id="${it.id}" ${it.done ? 'checked' : ''} ${editable ? '' : 'disabled'}>
      <div>
        <div class="ex-name">${UI.esc(ex.name)} <span class="chip plain">${UI.esc(ex.area)}</span></div>
        <p class="ex-cue">${UI.esc(ex.cue)}</p>
        <div class="ex-inputs">
          <input type="number" min="1" max="6" value="${it.sets}" data-change="sets" data-id="${it.id}" aria-label="Sets" ${editable ? '' : 'disabled'}> sets ×
          <input type="number" min="1" max="${unit === 'sec' ? 180 : 60}" value="${it.amount}" data-change="amount" data-id="${it.id}" aria-label="${unit}" ${editable ? '' : 'disabled'}> ${unit}${ex.perSide ? ' each side' : ''}
        </div>
      </div></div>`;
  }

  function render(el) {
    const s = S(), today = Dates.today();
    if (!date) date = today;
    const { plan, items, light } = Workout.planFor(date, s);
    const kg = Calc.currentWeight(s);
    const est = Workout.estimate(items, kg);
    const editable = date <= today;
    const doneN = items.filter(i => i.done).length;
    const cyc = s.cycle.days[date];
    const st = Cycle.stats(s.cycle, date);
    const onPeriod = Cycle.isRecorded(date, st.periods);

    let body;
    if (plan.rest) {
      body = `<section class="card"><h2>Rest day</h2>
        <p>Rest is when your muscles repair and get stronger. If you'd like to move, try a relaxed walk or a few gentle stretches.</p>
        <p class="muted">Get good sleep, drink water and enjoy your day.</p></section>`;
    } else {
      const phases = ['warmup', 'main', 'cooldown'].map(ph => {
        const list = items.filter(i => i.phase === ph);
        return list.length ? `<p class="phase">${PHASE[ph]}</p>${list.map(it => exRow(it, editable)).join('')}` : '';
      }).join('');
      body = `<section class="card">
        ${phases}
        <hr>
        <div class="btn-row">
          ${editable ? `<button class="btn small" data-act="all">Mark all done</button>` : '<span class="muted">You can tick these off on the day.</span>'}
          <button class="btn small ghost" data-act="reset">Reset to suggested</button>
        </div>
        ${doneN === items.length ? '<p class="note">Workout complete, nice work! Remember to eat your normal dinner. No need to change it because you exercised.</p>' : ''}
      </section>`;
    }

    el.innerHTML = `${weekStrip(today)}
      <section class="card">
        <div class="card-head">
          <h2>${DAY[Dates.weekday(date)]}: ${UI.esc(plan.title)}</h2>
          ${light ? '<span class="chip">Light version</span>' : ''}
        </div>
        <p class="muted">${UI.esc(plan.focus)}</p>
        ${items.length ? `
          <div class="kpis">
            <div class="kpi"><span>Time</span><strong>≈ ${est.minutes} min</strong></div>
            <div class="kpi"><span>Calories burned</span><strong>≈ ${est.kcal} kcal</strong><em>rough estimate</em></div>
            <div class="kpi"><span>Done</span><strong>${doneN}/${items.length}</strong></div>
            <div class="kpi"><span>When</span><strong>${Dates.hmStr(s.workouts.time)}</strong><em>before dinner (${Dates.hmStr(s.workouts.dinnerTime)})</em></div>
          </div>
          ${Charts.progress(doneN / items.length)}
          <div class="btn-row">
            <button class="btn small ${light ? 'primary' : ''}" data-act="light">${light ? 'Using light version' : 'Busy or tired? Use light version'}</button>
            <label class="muted" for="lvl">Level</label>
            <select id="lvl" data-change="level" style="width:auto">
              <option value="beginner" ${s.workouts.level === 'beginner' ? 'selected' : ''}>Beginner</option>
              <option value="building" ${s.workouts.level === 'building' ? 'selected' : ''}>Building up</option>
            </select>
            <label class="muted" for="wtime">Time</label>
            <input id="wtime" type="time" min="12:00" max="18:30" value="${s.workouts.time}" data-change="time" style="width:auto">
          </div>` : ''}
        ${(onPeriod && cyc && cyc.cramps >= 2) || (cyc && cyc.energy && Number(cyc.energy) <= 2)
          ? '<p class="note rose">You logged cramps or low energy today. The light version, gentle stretching, or full rest are all good choices. Listen to your body.</p>' : ''}
      </section>
      ${body}
      <p class="hint">Stop if you feel sharp pain, dizziness or chest pain. Calorie burn numbers are rough estimates and aren't meant for "earning" food. Move up to “Building up” when the current reps feel easy for a couple of weeks.</p>`;

    el.onclick = e => {
      const b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      const a = b.dataset.act;
      const log = (s.workouts.log[date] ||= {});
      if (a === 'day') date = b.dataset.date;
      if (a === 'toggle') Workout.setItem(date, b.dataset.id, { done: b.checked });
      if (a === 'all') { items.forEach(it => Workout.setItem(date, it.id, { done: true })); UI.toast('Workout complete!'); }
      if (a === 'light') { log.light = !log.light; DB.save(); }
      if (a === 'reset') { delete s.workouts.log[date]; DB.save(); }
      App.render();
    };
    el.onchange = e => {
      const t = e.target, k = t.dataset.change;
      if (!k) return;
      if (k === 'level') s.workouts.level = t.value;
      if (k === 'time') {
        if (t.value < '12:00' || t.value >= s.workouts.dinnerTime) { UI.toast('Pick an afternoon time before your dinner time.', 'error'); App.render(); return; }
        s.workouts.time = t.value; s.workouts.notified = null;
      }
      if (k === 'sets' || k === 'amount') {
        const v = Math.max(1, Math.round(Number(t.value) || 1));
        Workout.setItem(date, t.dataset.id, { [k]: v });
      }
      DB.save();
      App.render();
    };
  }

  return { title: 'Workouts', sub: () => 'No equipment needed · afternoons before dinner', render };
})();

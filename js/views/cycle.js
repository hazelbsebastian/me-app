/* =========================================================
   cycle.js — period calendar, symptom log and summaries.
   This data never leaves your device.
   ========================================================= */
Views.cycle = (() => {
  let month = null;

  function statusCard(st, today) {
    let head, sub;
    if (!st.last) {
      head = 'No periods logged yet';
      sub = 'Add your most recent period to start seeing estimates.';
    } else if (st.open) {
      head = `Period day ${Dates.diff(st.open.start, today) + 1}`;
      sub = `Started ${Dates.nice(st.open.start)}. Tap “Period ended” when it stops.`;
    } else {
      const n = st.next[0], d = Dates.diff(today, n);
      head = `Cycle day ${st.dayOfCycle}`;
      sub = st.late
        ? `Your period was estimated to start around ${Dates.nice(n)}. It's common for cycles to vary by several days.`
        : `Next period estimated around <strong>${Dates.nice(n)}</strong> (${d === 0 ? 'today' : d === 1 ? 'tomorrow' : 'in ' + d + ' days'}).`;
    }
    return `<section class="card">
      <div class="card-head"><h2><span class="card-title-ic rose">${UI.icon('cycle', 18)}</span>${head}</h2></div>
      <p>${sub}</p>
      <div class="btn-row">
        ${st.open ? '<button class="btn rose" data-act="end-today">Period ended today</button>' : '<button class="btn rose" data-act="start-today">Period started today</button>'}
        <button class="btn" data-act="day" data-date="${today}">Log today's symptoms</button>
        <button class="btn ghost" data-act="add-period">Add a past period</button>
      </div>
      <p class="hint">Estimates use your average cycle (${st.avgCycle} days) and period length (${st.avgPeriod} days)${st.usingDefaults ? ', using your typical lengths until you log 2+ periods' : ''}.</p>
    </section>`;
  }

  function calendarCard(st, today) {
    const c = S().cycle;
    const first = Dates.parse(`${month}-01`).getDay();
    const days = Dates.daysInMonth(month);
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span class="cal-day blank"></span>';
    for (let d = 1; d <= days; d++) {
      const ds = `${month}-${Dates.pad(d)}`;
      const cls = [
        Cycle.isRecorded(ds, st.periods) ? 'period' : Cycle.isPredicted(ds, st) ? 'predicted' : '',
        ds === today ? 'today' : '', ds > today ? 'future' : ''
      ].join(' ');
      cells += `<button class="cal-day ${cls}" data-act="day" data-date="${ds}" aria-label="${Dates.nice(ds)}">${d}<i class="dot ${c.days[ds] ? '' : 'hide'}"></i></button>`;
    }
    return `<section class="card">
      <div class="cal-head">
        <button class="icon-btn" data-act="month" data-n="-1" aria-label="Previous month">${UI.icon('left')}</button>
        <strong>${Dates.monthName(month)}</strong>
        <button class="icon-btn" data-act="month" data-n="1" aria-label="Next month">${UI.icon('right')}</button>
      </div>
      <div class="cal">${['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(w => `<span class="cal-wd">${w}</span>`).join('')}${cells}</div>
      <div class="legend"><span><i style="background:var(--rose)"></i>Period</span><span><i style="background:var(--rose-l);border:2px dashed var(--rose)"></i>Estimated</span><span>• Symptoms logged</span></div>
      <p class="hint">Tap a day to log symptoms or mark a period start or end.</p>
    </section>`;
  }

  function statsCard(st) {
    const list = [...st.periods].reverse();
    return `<section class="card">
      <h3>Your cycle history</h3>
      <div class="kpis">
        <div class="kpi"><span>Average cycle</span><strong>${st.avgCycle} days</strong>${st.usingDefaults ? '<em>typical, not yet measured</em>' : `<em>from ${Math.min(6, st.lengths.length)} cycle(s)</em>`}</div>
        <div class="kpi"><span>Average period</span><strong>${st.avgPeriod} days</strong></div>
        <div class="kpi"><span>Periods logged</span><strong>${st.periods.length}</strong></div>
        ${st.variability != null ? `<div class="kpi"><span>Variation</span><strong>${st.variability} days</strong><em>shortest to longest</em></div>` : ''}
      </div>
      ${st.variability != null && st.variability > 8 ? '<p class="note soft">Your cycle lengths vary by more than a week. That can be normal, especially in teens or during stress, but if it continues it may be worth mentioning to a doctor.</p>' : ''}
      ${list.length ? `<ul class="list">${list.map(p => `<li class="list-item">
        <div><strong>${Dates.nice(p.start, { month: 'short', day: 'numeric', year: 'numeric' })}</strong><span class="muted">${p.end ? `to ${Dates.nice(p.end, { month: 'short', day: 'numeric' })} · ${Dates.diff(p.start, p.end) + 1} days` : 'ongoing'}</span></div>
        <div class="right"><button class="icon-btn" data-act="edit-period" data-id="${p.id}" aria-label="Edit">${UI.icon('edit', 16)}</button><button class="icon-btn" data-act="del-period" data-id="${p.id}" aria-label="Delete">${UI.icon('trash', 16)}</button></div></li>`).join('')}</ul>` : '<p class="empty-line">No periods yet.</p>'}
    </section>`;
  }

  function patterns(st) {
    const days = Object.entries(S().cycle.days);
    if (st.periods.length < 2 || days.length < 5) return ['Keep logging for a couple of cycles and patterns will appear here.'];
    const counts = {};
    for (const [d, log] of days) {
      const cat = Cycle.isRecorded(d, st.periods) ? 'period'
        : st.periods.some(p => { const k = Dates.diff(d, p.start); return k >= 1 && k <= 5; }) ? 'pre' : 'other';
      const syms = [...(log.symptoms || [])];
      if (Number(log.cramps) >= 2) syms.push('Moderate or severe cramps');
      if (log.cravings) syms.push('Cravings');
      if (log.mood && ['Irritable', 'Anxious', 'Low', 'Sensitive'].includes(log.mood)) syms.push(`Feeling ${log.mood.toLowerCase()}`);
      for (const sy of syms) {
        const c = counts[sy] ||= { period: 0, pre: 0, other: 0, total: 0 };
        c[cat]++; c.total++;
      }
    }
    const out = [];
    for (const [sy, c] of Object.entries(counts).sort((a, b) => b[1].total - a[1].total)) {
      if (c.total < 3) continue;
      if (c.pre / c.total >= 0.5) out.push(`${sy} often shows up in the 5 days before your period (${c.pre} of ${c.total} times).`);
      else if (c.period / c.total >= 0.5) out.push(`${sy} mostly happens during your period (${c.period} of ${c.total} times).`);
      else out.push(`${sy} appears at different points in your cycle (${c.total} times).`);
    }
    return out.length ? out.slice(0, 6) : ['No clear patterns yet. Keep logging!'];
  }

  function summaryCard(st) {
    const c = S().cycle;
    const logs = Object.entries(c.days).filter(([d]) => d.startsWith(month)).map(([, l]) => l);
    const symCount = {}, moodCount = {};
    logs.forEach(l => { (l.symptoms || []).forEach(x => symCount[x] = (symCount[x] || 0) + 1); if (l.mood) moodCount[l.mood] = (moodCount[l.mood] || 0) + 1; });
    const energy = logs.filter(l => l.energy).map(l => Number(l.energy));
    const cramps = logs.filter(l => l.cramps != null).map(l => Number(l.cramps));
    const periodsThisMonth = st.periods.filter(p => p.start.startsWith(month));
    const chips = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span class="chip rose">${UI.esc(k)} × ${v}</span>`).join(' ') || '<span class="muted">None logged</span>';
    return `<section class="card">
      <h3>${Dates.monthName(month)} summary</h3>
      <div class="kpis">
        <div class="kpi"><span>Days logged</span><strong>${logs.length}</strong></div>
        <div class="kpi"><span>Period started</span><strong>${periodsThisMonth.length ? Dates.nice(periodsThisMonth[0].start, { month: 'short', day: 'numeric' }) : 'n/a'}</strong></div>
        <div class="kpi"><span>Average energy</span><strong>${energy.length ? avg(energy).toFixed(1) + '/5' : 'n/a'}</strong></div>
        <div class="kpi"><span>Average cramps</span><strong>${cramps.length ? DATA.CRAMPS[Math.round(avg(cramps))] : 'n/a'}</strong></div>
      </div>
      <p><strong>Symptoms:</strong></p><div class="chips">${chips(symCount)}</div>
      <p style="margin-top:10px"><strong>Moods:</strong></p><div class="chips">${chips(moodCount)}</div>
      <hr><h3>Patterns</h3>
      <ul>${patterns(st).map(p => `<li>${UI.esc(p)}</li>`).join('')}</ul>
    </section>`;
  }

  function openDay(date) {
    if (date > Dates.today()) return UI.toast("You can log symptoms once the day arrives.");
    const c = S().cycle, log = c.days[date] || {};
    const st = Cycle.stats(c);
    const isP = Cycle.isRecorded(date, st.periods);
    UI.modal({
      title: Dates.nice(date, { weekday: 'long', month: 'long', day: 'numeric' }),
      body: `
        ${isP ? '<p><span class="chip rose">Period day</span></p>' : ''}
        <div class="btn-row">
          <button type="button" class="btn small rose" data-pa="start">Period started this day</button>
          <button type="button" class="btn small ghost" data-pa="end">Period ended this day</button>
        </div>
        <div class="field"><label for="cy-flow">Flow</label><select id="cy-flow" name="flow">${DATA.FLOWS.map(f => `<option value="${f}" ${log.flow === f ? 'selected' : ''}>${f || 'None'}</option>`).join('')}</select></div>
        <fieldset class="field"><legend>Cramps</legend><div class="seg">${DATA.CRAMPS.map((l, i) => `<label><input type="radio" name="cramps" value="${i}" ${Number(log.cramps || 0) === i ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend>Symptoms</legend><div class="chips">${DATA.SYMPTOMS.map(sy => `<label class="chip-check"><input type="checkbox" name="symptoms[]" value="${sy}" ${(log.symptoms || []).includes(sy) ? 'checked' : ''}><span>${sy}</span></label>`).join('')}</div></fieldset>
        <fieldset class="field"><legend>Mood</legend><div class="chips">${DATA.MOODS.map(m => `<label class="chip-check"><input type="radio" name="mood" value="${m}" ${log.mood === m ? 'checked' : ''}><span>${m}</span></label>`).join('')}</div></fieldset>
        <div class="field"><label for="cy-en">Energy: <output data-en>${log.energy || 3}</output> / 5</label><input id="cy-en" type="range" name="energy" min="1" max="5" value="${log.energy || 3}"></div>
        <div class="field"><label for="cy-cr">Cravings</label><input id="cy-cr" name="cravings" value="${UI.esc(log.cravings || '')}" placeholder="e.g. sweets, salty food, chocolate"></div>
        <div class="field"><label for="cy-no">Notes</label><textarea id="cy-no" name="note" rows="2">${UI.esc(log.note || '')}</textarea></div>`,
      extraButtons: c.days[date] ? '<button type="button" class="btn ghost" data-clear>Clear log</button>' : '',
      onOpen(form, close) {
        form.querySelector('[name=energy]').addEventListener('input', e => { form.querySelector('[data-en]').textContent = e.target.value; });
        form.querySelectorAll('[data-pa]').forEach(b => b.addEventListener('click', () => {
          const r = b.dataset.pa === 'start' ? Cycle.markStart(date) : Cycle.markEnd(date);
          const msg = { ok: b.dataset.pa === 'start' ? 'Period start saved.' : 'Period end saved.', exists: 'A period already starts on this day.', inside: 'This day is already inside a logged period.', none: 'Log a period start first.', toolong: "That's more than 14 days after the start. Please check the dates." }[r];
          UI.toast(msg, r === 'ok' ? 'info' : 'error');
          if (r === 'ok') { close(); App.render(); }
        }));
        form.querySelector('[data-clear]')?.addEventListener('click', () => { delete c.days[date]; DB.save(); close(); App.render(); });
      },
      onSubmit(d) {
        const entry = { flow: d.flow, cramps: Number(d.cramps || 0), symptoms: d.symptoms || [], mood: d.mood || '', energy: Number(d.energy || 3), cravings: d.cravings, note: d.note };
        c.days[date] = entry;
        DB.save();
        if (entry.cramps === 3) UI.toast('Severe cramps that stop you from doing daily activities are worth talking to a doctor about.', 'info', 7000);
        else if (['Light', 'Medium', 'Heavy'].includes(entry.flow) && !Cycle.isRecorded(date, Cycle.stats(c).periods)) UI.toast('Tip: tap “Period started this day” to add this to your cycle.', 'info', 6000);
        else UI.toast('Saved.');
        App.render();
      }
    });
  }

  function openPeriod(p = null) {
    UI.modal({
      title: p ? 'Edit period' : 'Add a past period',
      body: `<div class="field-row">
          <div class="field"><label for="pp-s">First day</label><input id="pp-s" type="date" name="start" value="${p?.start || ''}" max="${Dates.today()}" required></div>
          <div class="field"><label for="pp-e">Last day (optional)</label><input id="pp-e" type="date" name="end" value="${p?.end || ''}" max="${Dates.today()}"></div>
        </div>`,
      onSubmit(d) {
        if (!d.start) return false;
        if (d.end && (d.end < d.start || Dates.diff(d.start, d.end) > 14)) { UI.toast('The last day must be 0–14 days after the first day.', 'error'); return false; }
        const c = S().cycle;
        const end = d.end || null;
        const clash = c.periods.some(x => x !== p && (x.start === d.start || (d.start >= x.start && d.start <= Cycle.periodEnd(x)) || (x.start >= d.start && x.start <= (end || d.start))));
        if (clash) { UI.toast('These dates overlap another logged period.', 'error'); return false; }
        if (p) { p.start = d.start; p.end = end; } else c.periods.push({ id: uid(), start: d.start, end });
        DB.save();
        UI.toast('Period saved.');
        App.render();
      }
    });
  }

  function render(el) {
    const s = S(), today = Dates.today();
    if (!month) month = Dates.month(today);
    const st = Cycle.stats(s.cycle, today);
    el.innerHTML = `<div class="grid two">${statusCard(st, today)}${calendarCard(st, today)}</div>
      <div class="grid two">${statsCard(st)}${summaryCard(st)}</div>
      <p class="note">Cycle predictions are estimates based on your past records, not guarantees, and cycles naturally vary. This tracker is not birth control and can't diagnose anything. If your periods are very painful, very heavy, or often irregular, please talk to a doctor. Your cycle data stays private on this device.</p>`;

    el.onclick = async e => {
      const b = e.target.closest('[data-act]');
      if (!b) return;
      const a = b.dataset.act, c = s.cycle;
      if (a === 'month') { month = Dates.addMonths(month, Number(b.dataset.n)); return App.render(); }
      if (a === 'day') return openDay(b.dataset.date);
      if (a === 'start-today') { const r = Cycle.markStart(today); UI.toast(r === 'ok' ? 'Period start saved.' : 'Today is already part of a logged period.'); return App.render(); }
      if (a === 'end-today') { Cycle.markEnd(today); UI.toast('Period end saved.'); return App.render(); }
      if (a === 'add-period') return openPeriod();
      if (a === 'edit-period') return openPeriod(c.periods.find(p => p.id === b.dataset.id));
      if (a === 'del-period') {
        if (await UI.confirm('Delete this period record?', { ok: 'Delete' })) { c.periods = c.periods.filter(p => p.id !== b.dataset.id); DB.save(); App.render(); }
      }
    };
  }

  return { title: 'Cycle', sub: () => 'Private period & symptom tracker', render };
})();

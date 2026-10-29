/* =========================================================
   nutrition.js — food log, meal plan and water tracker.
   ========================================================= */
Views.nutrition = (() => {
  let tab = 'food';
  let date = null;
  const TABS = { food: 'Food log', plan: 'Meal plan', water: 'Water' };

  /* ---------- Food log tab ---------- */
  function macroBars(t, goal) {
    const row = (label, val, g, cls) => `<div class="macro"><span>${label}</span>${Charts.progress(val / g, cls)}<span class="muted">${Math.round(val)} / ${g} g</span></div>`;
    return `<div>${row('Protein', t.p, goal.p, '')}${row('Carbs', t.c, goal.c, 'water')}${row('Fat', t.f, goal.f, 'rose')}</div>
      <p class="hint">Macro targets are a simple, balanced guide, not strict rules.</p>`;
  }

  function slotCard(slot, plan) {
    const list = Food.entries(date).filter(e => e.slot === slot);
    const kcal = list.reduce((a, e) => a + Food.entryKcal(e), 0);
    const pm = DATA.mealById(plan[slot]);
    return `<section class="card">
      <div class="card-head"><h3>${Planner.LABEL[slot]} ${list.length ? `<span class="chip">${fmt(kcal)} kcal</span>` : ''}</h3>
        <button class="btn small" data-act="add-food" data-slot="${slot}">${UI.icon('plus', 16)} Add</button></div>
      ${list.length ? `<ul class="list">${list.map(e => `<li class="list-item">
          <div><strong>${UI.esc(e.name)}</strong><span class="muted">${e.servings !== 1 ? e.servings + ' × ' : ''}${UI.esc(e.serving || '1 serving')}</span></div>
          <div class="right"><span class="kcal">${fmt(Food.entryKcal(e))} kcal${e.estimated ? '<small>estimated</small>' : ''}</span>
            <button class="icon-btn" data-act="edit-food" data-id="${e.id}" aria-label="Edit ${UI.esc(e.name)}">${UI.icon('edit', 16)}</button>
            <button class="icon-btn" data-act="del-food" data-id="${e.id}" aria-label="Delete ${UI.esc(e.name)}">${UI.icon('trash', 16)}</button></div></li>`).join('')}</ul>`
        : `<p class="empty-line">Nothing logged yet.${pm ? ` Planned: <em>${UI.esc(pm.name)}</em> (≈${pm.kcal} kcal). <button class="link" data-act="log-plan" data-slot="${slot}">Log it</button>` : ''}</p>`}
    </section>`;
  }

  function foodTab() {
    const s = S(), t = Food.totals(date), target = s.profile.calorieTarget, rem = target - t.kcal;
    const goal = Calc.macros(target, Calc.currentWeight(s));
    const plan = Planner.getDay(date);
    return `${Shared.dateNav(date)}
      <div class="grid two">
        <section class="card">
          <div class="summary-row">
            ${Charts.ring(t.kcal / target, { label: fmt(t.kcal), sub: `of ${fmt(target)} kcal` })}
            <div class="stats">
              <div class="stat"><span>Target</span><strong>${fmt(target)}</strong></div>
              <div class="stat"><span>Eaten</span><strong>${fmt(t.kcal)}</strong></div>
              <div class="stat"><span>${rem >= 0 ? 'Left' : 'Over'}</span><strong>${fmt(Math.abs(rem))}</strong></div>
            </div>
          </div>
          ${macroBars(t, goal)}
          ${rem < -150 ? `<p class="note soft">You're a bit over today's estimate. That's okay, one day doesn't undo your progress. There's no need to skip meals or exercise it off; just carry on as usual tomorrow.</p>` : ''}
          <p class="hint">All calories are estimates, especially for homemade Filipino dishes where oil and portions vary. <button class="link" data-act="target">Change target</button></p>
        </section>
        <div class="stack">${Planner.SLOTS.map(sl => slotCard(sl, plan)).join('')}</div>
      </div>
      ${savedFoodsCard()}`;
  }

  function savedFoodsCard() {
    const list = S().savedFoods;
    if (!list.length) return '';
    return `<section class="card"><h3>My saved foods</h3><ul class="list">${list.map(f => `<li class="list-item">
      <div><strong>${UI.esc(f.name)}</strong><span class="muted">${UI.esc(f.serving)} · ${fmt(f.kcal)} kcal</span></div>
      <div class="right"><button class="icon-btn" data-act="del-saved" data-id="${f.id}" aria-label="Remove ${UI.esc(f.name)}">${UI.icon('trash', 16)}</button></div></li>`).join('')}</ul></section>`;
  }

  /* Add or edit a food entry. */
  function openFoodModal(slot, entry = null) {
    const e = entry || { slot, servings: 1, name: '', serving: '', kcalPer: '', pPer: '', cPer: '', fPer: '' };
    const body = `
      <div class="field"><label for="fs">Search foods</label>
        <input id="fs" type="search" placeholder="e.g. rice, adobo, banana" autocomplete="off">
        <div class="results" data-results></div>
        <div class="btn-row"><button type="button" class="btn small ghost" data-online>Search online (Open Food Facts)</button></div>
      </div>
      <hr>
      <div class="field-row">
        <div class="field"><label for="f-slot">Meal</label><select id="f-slot" name="slot">${Planner.SLOTS.map(sl => `<option value="${sl}" ${e.slot === sl ? 'selected' : ''}>${Planner.LABEL[sl]}</option>`).join('')}</select></div>
        <div class="field"><label for="f-serv">Servings</label><input id="f-serv" type="number" name="servings" min="0.1" max="20" step="0.1" value="${e.servings}" required></div>
      </div>
      <div class="field"><label for="f-name">Food or drink</label><input id="f-name" name="name" value="${UI.esc(e.name)}" required></div>
      <div class="field"><label for="f-size">Serving size</label><input id="f-size" name="serving" value="${UI.esc(e.serving)}" placeholder="e.g. 1 cup, 1 piece, 100 g"></div>
      <div class="field-row">
        <div class="field"><label for="f-kcal">kcal / serving</label><input id="f-kcal" type="number" name="kcalPer" min="0" max="5000" step="1" value="${e.kcalPer}" required></div>
        <div class="field"><label for="f-p">Protein g</label><input id="f-p" type="number" name="pPer" min="0" step="0.1" value="${e.pPer ?? ''}"></div>
        <div class="field"><label for="f-c">Carbs g</label><input id="f-c" type="number" name="cPer" min="0" step="0.1" value="${e.cPer ?? ''}"></div>
        <div class="field"><label for="f-f">Fat g</label><input id="f-f" type="number" name="fPer" min="0" step="0.1" value="${e.fPer ?? ''}"></div>
      </div>
      <p class="hint" data-total></p>
      <label class="check"><input type="checkbox" name="saveFood"> Save to “My foods” for next time</label>`;

    UI.modal({
      title: entry ? 'Edit food' : 'Add food',
      body,
      onOpen(form) {
        const F = n => form.elements.namedItem(n);
        const input = form.querySelector('#fs'), box = form.querySelector('[data-results]');
        let results = [];
        const fill = f => {
          F('name').value = f.name; F('serving').value = f.serving;
          F('kcalPer').value = Math.round(f.kcal); F('pPer').value = f.p ?? ''; F('cPer').value = f.c ?? ''; F('fPer').value = f.f ?? '';
          form.dataset.estimated = f.estimated === false ? '0' : '1';
          box.innerHTML = ''; input.value = '';
          total();
          F('servings').focus();
        };
        const show = list => {
          results = list;
          box.innerHTML = list.length ? list.map((f, i) => `<button type="button" class="result" data-i="${i}"><span>${UI.esc(f.name)} <small>${UI.esc(f.serving)}${f.mine ? ' · my food' : ''}</small></span><strong>${fmt(f.kcal)}</strong></button>`).join('') : '<p class="empty-line">No matches. Enter the food manually below, or try the online search.</p>';
        };
        const search = () => {
          const q = input.value.trim().toLowerCase();
          if (!q) { box.innerHTML = ''; return; }
          const words = q.split(/\s+/);
          const mine = S().savedFoods.map(f => ({ ...f, mine: true }));
          show([...mine, ...DATA.FOODS].filter(f => words.every(w => (f.name + ' ' + f.serving).toLowerCase().includes(w))).slice(0, 15));
        };
        input.addEventListener('input', search);
        input.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); search(); } });
        box.addEventListener('click', ev => { const b = ev.target.closest('[data-i]'); if (b) fill(results[Number(b.dataset.i)]); });
        form.querySelector('[data-online]').addEventListener('click', async ev => {
          const q = input.value.trim() || F('name').value.trim();
          if (!q) return UI.toast('Type a food name first.');
          ev.target.disabled = true; ev.target.textContent = 'Searching…';
          try {
            const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15&fields=product_name,brands,nutriments`;
            const res = await fetch(url);
            const json = await res.json();
            const list = (json.products || []).map(p => {
              const n = p.nutriments || {};
              const kcal = n['energy-kcal_100g'] ?? (n.energy_100g ? n.energy_100g / 4.184 : null);
              return kcal ? { name: [p.product_name, p.brands].filter(Boolean).join(' – '), serving: '100 g', kcal, p: round1(n.proteins_100g), c: round1(n.carbohydrates_100g), f: round1(n.fat_100g), estimated: true } : null;
            }).filter(x => x && x.name);
            show(list);
            if (list.length) UI.toast('Online values are per 100 g. Use servings 0.5 for 50 g, 2 for 200 g, etc.', 'info', 6000);
          } catch (err) {
            box.innerHTML = '<p class="empty-line">Online search is unavailable (are you offline?). You can still enter the food manually.</p>';
          }
          ev.target.disabled = false; ev.target.textContent = 'Search online (Open Food Facts)';
        });
        const totalEl = form.querySelector('[data-total]');
        const total = () => {
          const k = (Number(F('kcalPer').value) || 0) * (Number(F('servings').value) || 0);
          totalEl.textContent = k ? `Total: ${fmt(k)} kcal (estimated)` : '';
        };
        F('kcalPer').addEventListener('input', total);
        F('servings').addEventListener('input', total);
        total();
      },
      onSubmit(d, form) {
        if (!d.name || d.kcalPer == null) { UI.toast('Please enter a name and calories.', 'error'); return false; }
        const item = {
          id: entry?.id || uid(), slot: d.slot, name: d.name, serving: d.serving || '1 serving', servings: d.servings || 1,
          kcalPer: d.kcalPer, pPer: d.pPer || 0, cPer: d.cPer || 0, fPer: d.fPer || 0,
          estimated: form.dataset.estimated !== '0', source: entry?.source || 'manual', t: entry?.t || Date.now()
        };
        if (entry) Food.update(date, item); else Food.add(date, item);
        if (d.saveFood) {
          const s = S();
          s.savedFoods = s.savedFoods.filter(f => f.name.toLowerCase() !== d.name.toLowerCase());
          s.savedFoods.push({ id: 'my_' + uid(), name: d.name, serving: item.serving, kcal: d.kcalPer, p: d.pPer || 0, c: d.cPer || 0, f: d.fPer || 0 });
          DB.save();
        }
        UI.toast(`${d.name} ${entry ? 'updated' : 'added'}.`);
        App.render();
      }
    });
  }
  const round1 = v => (v == null || isNaN(v) ? '' : Math.round(v * 10) / 10);

  /* ---------- Meal plan tab ---------- */
  function planTab() {
    const s = S(), pr = s.mealPrefs, target = s.profile.calorieTarget;
    const plan = Planner.getDay(date);
    const thisMonth = Dates.month(Dates.today());
    let total = 0;
    const cards = Planner.SLOTS.map(sl => {
      const m = DATA.mealById(plan[sl]);
      const aim = Math.round(target * Planner.SHARES[sl]);
      if (!m) return `<section class="card"><h3>${Planner.LABEL[sl]}</h3><p class="empty-line">No meal idea matches your preferences. Update them, or log food manually.</p></section>`;
      total += m.kcal;
      const logged = Food.entries(date).some(e => e.source === 'plan' && e.slot === sl && e.name === m.name);
      return `<section class="card meal">
        <div class="card-head"><h3>${Planner.LABEL[sl]}</h3><span class="chip">≈ ${m.kcal} kcal · estimated</span></div>
        <h4>${UI.esc(m.name)}</h4>
        <p class="muted">${UI.esc(m.desc)}</p>
        <p class="macros">P ${m.p} g · C ${m.c} g · F ${m.f} g <span class="muted">· aim for this meal ≈ ${aim} kcal</span></p>
        <div class="actions">
          ${date <= Dates.today() ? `<button class="btn small primary" data-act="log-plan" data-slot="${sl}" ${logged ? 'disabled' : ''}>${logged ? 'Logged' : 'Log it'}</button>` : ''}
          <button class="btn small ghost" data-act="swap" data-slot="${sl}">Swap</button>
        </div></section>`;
    }).join('');

    const prefsText = [pr.likes && `Likes: ${pr.likes}`, pr.dislikes && `Avoids: ${pr.dislikes}`, pr.allergies && `Allergies: ${pr.allergies}`, `Budget: ${pr.budget === 'low' ? 'tight' : 'flexible'}`].filter(Boolean).join(' · ');
    return `${Shared.dateNav(date, { max: Dates.add(Dates.today(), 7) })}
      <section class="card">
        <div class="card-head"><h3>Food preferences</h3><button class="btn small" data-act="prefs">Update</button></div>
        ${pr.month !== thisMonth ? '<p class="note soft">New month! Update your preferences and ingredients so your plan fits what you have.</p>' : ''}
        <p class="muted">${UI.esc(prefsText)}</p>
      </section>
      <div class="grid">${cards}</div>
      <section class="card">
        <p><strong>Plan total ≈ ${fmt(total)} kcal</strong> <span class="muted">of your ${fmt(target)} kcal target (estimated).</span></p>
        <p class="hint">Easy adjustments: ½ cup rice ≈ 100 kcal, 1 boiled egg ≈ 75 kcal, 1 banana ≈ 100 kcal. Use less oil when frying to save calories. Add more vegetables any time.</p>
        <button class="btn small ghost" data-act="regen">New plan for this day</button>
      </section>`;
  }

  /* ---------- Water tab ---------- */
  function waterTab() {
    const s = S(), w = s.water, r = w.reminder, today = Dates.today();
    const tot = Water.total(today), list = Water.entries(today).slice().reverse();
    const paused = r.pausedUntil && Date.now() < r.pausedUntil;
    return `<div class="grid two">
      <section class="card">
        <div class="summary-row">
          ${Charts.ring(tot / w.goalMl, { color: 'var(--water)', label: fmt(tot) + ' mL', sub: `of ${fmt(w.goalMl)} mL` })}
          <div class="stack-sm">
            ${[250, 350, 500].map(ml => `<button class="btn water-btn" data-act="water-add" data-ml="${ml}">+${ml} mL</button>`).join('')}
            <button class="btn ghost small" data-act="water-custom">Other amount</button>
          </div>
        </div>
        <h3>Today</h3>
        ${list.length ? `<ul class="list">${list.map(e => `<li class="list-item"><span>${Dates.hm(e.t)}</span><div class="right"><strong>${e.ml} mL</strong><button class="icon-btn" data-act="water-del" data-t="${e.t}" aria-label="Remove">${UI.icon('trash', 16)}</button></div></li>`).join('')}</ul>`
          : '<p class="empty-line">No water logged yet today. Tap a button above after each glass.</p>'}
        <p class="hint">The water log starts fresh every day automatically.</p>
      </section>
      <section class="card">
        <h3>Daily goal</h3>
        <div class="inline-form"><input type="number" min="500" max="5000" step="50" value="${w.goalMl}" data-change="water-goal" aria-label="Daily water goal in mL"><span>mL per day</span></div>
        <p class="hint">A common starting point is about 1.5–2.5 L a day. You may need more on hot days or after workouts.</p>
        <hr>
        <h3>Reminders</h3>
        <label class="switch"><input type="checkbox" data-change="rem-enabled" ${r.enabled ? 'checked' : ''}> Remind me to drink water</label>
        <div class="field-row">
          <div class="field"><label for="rem-int">Every</label><select id="rem-int" data-change="rem-interval">${[30, 45, 60, 90, 120].map(m => `<option value="${m}" ${r.intervalMin === m ? 'selected' : ''}>${m < 60 ? m + ' min' : m / 60 + ' hr'}</option>`).join('')}</select></div>
          <div class="field"><label for="rem-s">From</label><input id="rem-s" type="time" value="${r.start}" data-change="rem-start"></div>
          <div class="field"><label for="rem-e">Until</label><input id="rem-e" type="time" value="${r.end}" data-change="rem-end"></div>
        </div>
        <div class="btn-row">${paused
          ? `<span class="chip amber">Paused until ${Dates.hm(r.pausedUntil)}</span><button class="btn small" data-act="resume">Resume now</button>`
          : `<button class="btn small ghost" data-act="pause" data-min="60">Pause 1 hr</button><button class="btn small ghost" data-act="pause" data-min="120">Pause 2 hrs (class)</button><button class="btn small ghost" data-act="pause" data-min="tomorrow">Pause until tomorrow</button>`}</div>
        <p class="hint">No reminders outside your “From–Until” hours, so they stay quiet while you sleep.</p>
        ${Shared.notifBlock()}
      </section>
    </div>`;
  }

  /* ---------- Render & events ---------- */
  function render(el, sub) {
    if (sub && TABS[sub]) tab = sub;
    const today = Dates.today();
    if (!date) date = today;
    if (tab === 'food' && date > today) date = today;
    el.innerHTML = `<div class="tabs" role="tablist">${Object.entries(TABS).map(([k, v]) => `<button class="tab ${tab === k ? 'active' : ''}" role="tab" aria-selected="${tab === k}" data-act="tab" data-tab="${k}">${v}</button>`).join('')}</div>`
      + (tab === 'food' ? foodTab() : tab === 'plan' ? planTab() : waterTab());

    el.onclick = async e => {
      const b = e.target.closest('[data-act]');
      if (!b || b.disabled) return;
      const a = b.dataset.act, s = S();
      switch (a) {
        case 'tab': location.hash = '#/nutrition/' + b.dataset.tab; return;
        case 'prev-day': date = Dates.add(date, -1); break;
        case 'next-day': date = Dates.add(date, 1); break;
        case 'today': date = today; break;
        case 'target': return Shared.openTargetModal();
        case 'add-food': return openFoodModal(b.dataset.slot);
        case 'edit-food': return openFoodModal(null, Food.entries(date).find(x => x.id === b.dataset.id));
        case 'del-food': {
          const item = Food.entries(date).find(x => x.id === b.dataset.id);
          if (item && await UI.confirm(`Delete “${item.name}”?`, { ok: 'Delete' })) { Food.remove(date, item.id); UI.toast('Deleted.'); }
          break;
        }
        case 'del-saved': s.savedFoods = s.savedFoods.filter(f => f.id !== b.dataset.id); DB.save(); break;
        case 'log-plan': {
          const m = DATA.mealById(Planner.getDay(date)[b.dataset.slot]);
          if (!m) return;
          Food.add(date, { id: uid(), slot: b.dataset.slot, name: m.name, serving: '1 plate (as planned)', servings: 1, kcalPer: m.kcal, pPer: m.p, cPer: m.c, fPer: m.f, estimated: true, source: 'plan', t: Date.now() });
          UI.toast(`${m.name} logged (≈${m.kcal} kcal). Edit it if your portion was different.`);
          break;
        }
        case 'swap': if (!Planner.swap(date, b.dataset.slot)) UI.toast('No other options match your preferences.'); break;
        case 'regen': Planner.regenerate(date); break;
        case 'prefs': return Shared.openPrefsModal();
        case 'water-add': Water.add(Number(b.dataset.ml)); UI.toast(`+${b.dataset.ml} mL`); break;
        case 'water-custom':
          return UI.modal({
            title: 'Add water', body: '<div class="field"><label for="wc">Amount (mL)</label><input id="wc" type="number" name="ml" min="10" max="2000" step="10" value="200" required></div>',
            submitLabel: 'Add', onSubmit: d => { if (!d.ml) return false; Water.add(Math.round(d.ml)); App.render(); }
          });
        case 'water-del': Water.remove(today, Number(b.dataset.t)); break;
        case 'pause': {
          const r = s.water.reminder;
          if (b.dataset.min === 'tomorrow') { const t = Dates.parse(Dates.add(today, 1)); t.setHours(...r.start.split(':').map(Number)); r.pausedUntil = t.getTime(); }
          else r.pausedUntil = Date.now() + Number(b.dataset.min) * 60000;
          DB.save();
          break;
        }
        case 'resume': s.water.reminder.pausedUntil = null; s.water.reminder.lastAt = Date.now(); DB.save(); break;
        case 'notif-perm': await Reminders.requestPermission(); break;
        default: return;
      }
      App.render();
    };

    el.onchange = e => {
      const t = e.target, k = t.dataset.change;
      if (!k) return;
      const s = S(), r = s.water.reminder;
      if (k === 'water-goal') { const v = Math.round(Number(t.value)); if (v >= 500 && v <= 5000) s.water.goalMl = v; else UI.toast('Choose a goal between 500 and 5,000 mL.', 'error'); }
      if (k === 'rem-enabled') {
        r.enabled = t.checked; r.lastAt = Date.now();
        if (t.checked && Reminders.permission() === 'default') Reminders.requestPermission();
      }
      if (k === 'rem-interval') r.intervalMin = Number(t.value);
      if (k === 'rem-start' && t.value) r.start = t.value;
      if (k === 'rem-end' && t.value) r.end = t.value;
      DB.save();
      App.render();
    };
  }

  return { title: 'Nutrition', sub: () => 'Food, meal plan & water', render };
})();

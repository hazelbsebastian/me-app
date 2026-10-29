/* =========================================================
   calc.js — dates, calorie math, meal planner, workouts,
   cycle estimates, daily checklist and monthly reports.
   ========================================================= */
const fmt = n => Math.round(n || 0).toLocaleString();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

/* ---------- Dates (all as 'YYYY-MM-DD' in your local time) ---------- */
const Dates = {
  pad: n => String(n).padStart(2, '0'),
  fmt(d) { return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())}`; },
  today() { return this.fmt(new Date()); },
  parse(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); },
  add(s, n) { const d = this.parse(s); d.setDate(d.getDate() + n); return this.fmt(d); },
  // number of days from a to b
  diff(a, b) {
    const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
    return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  },
  month(s) { return s.slice(0, 7); },
  weekday(s) { return this.parse(s).getDay(); },
  nice(s, opts = { weekday: 'short', month: 'short', day: 'numeric' }) { return this.parse(s).toLocaleDateString(undefined, opts); },
  monthName(m) { const [y, mo] = m.split('-').map(Number); return new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); },
  daysInMonth(m) { const [y, mo] = m.split('-').map(Number); return new Date(y, mo, 0).getDate(); },
  addMonths(m, n) { const [y, mo] = m.split('-').map(Number); return this.fmt(new Date(y, mo - 1 + n, 1)).slice(0, 7); },
  mondayOf(s) { const wd = this.weekday(s); return this.add(s, wd === 0 ? -6 : 1 - wd); },
  toMin(t) { const [h, m] = (t || '0:0').split(':').map(Number); return h * 60 + m; },
  hm(ts) { return new Date(ts).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); },
  hmStr(t) { const d = new Date(); d.setHours(...t.split(':').map(Number), 0, 0); return this.hm(d); }
};

/* ---------- Calorie estimates ---------- */
const Calc = {
  MIN_KCAL: 1200,
  REFERENCE_KCAL: 1600, // your earlier goal — used only as a comparison
  ACTIVITY: {
    sedentary: { f: 1.2, label: 'Mostly sitting (little or no exercise)' },
    light: { f: 1.375, label: 'Lightly active (light exercise 1–3 days/week)' },
    moderate: { f: 1.55, label: 'Moderately active (exercise 3–5 days/week)' },
    active: { f: 1.725, label: 'Very active (hard exercise 6–7 days/week)' }
  },

  age(dob) {
    if (!dob) return null;
    const b = Dates.parse(dob), n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
    return a;
  },
  bmi(kg, cm) { return kg / ((cm / 100) ** 2); },
  currentWeight(s) {
    const w = [...s.weights].sort((a, b) => (a.date < b.date ? -1 : 1));
    return w.length ? w[w.length - 1].kg : s.profile?.weightKg;
  },

  // Mifflin–St Jeor equation: a common, evidence-based estimate of resting energy.
  bmr(sex, kg, cm, age) {
    const base = 10 * kg + 6.25 * cm - 5 * age;
    return sex === 'male' ? base + 5 : base - 161;
  },

  estimate(profile, kg) {
    kg = kg ?? profile.weightKg;
    const cm = profile.heightCm;
    const age = this.age(profile.dob);
    const bmr = Math.round(this.bmr(profile.sex, kg, cm, age));
    const tdee = Math.round(bmr * (this.ACTIVITY[profile.activity]?.f || 1.2));
    const bmi = this.bmi(kg, cm);
    const bmiTarget = profile.targetKg ? this.bmi(profile.targetKg, cm) : null;
    const notes = [];
    let mode = 'deficit';

    if (age < 18) {
      mode = 'maintain';
      notes.push("You're under 18 and still growing, so this app won't suggest a calorie deficit. Your target is set to estimated maintenance. Please talk to a doctor or school nurse before trying to lose weight.");
    }
    if (bmi < 18.5) {
      mode = 'maintain';
      notes.push('Your BMI is below 18.5 (the underweight range), so a deficit is not suggested. Consider talking to a health professional.');
    }
    if (profile.targetKg && profile.targetKg >= kg - 0.2) {
      mode = 'maintain';
      notes.push('Your target weight is at or above your current weight, so no deficit is needed.');
    }
    if (bmiTarget && bmiTarget < 18.5) {
      notes.push('Your target weight is below the healthy BMI range for your height (BMI under 18.5). You may want to choose a higher target.');
    }

    let target = Math.round(tdee / 50) * 50;
    if (mode === 'deficit') {
      const deficit = Math.min(500, Math.round(tdee * 0.2)); // modest: at most 500 kcal or 20%
      target = Math.max(this.MIN_KCAL, Math.round((tdee - deficit) / 50) * 50);
      if (target >= tdee) {
        target = Math.round(tdee / 50) * 50;
        notes.push('Your estimated maintenance is already low, so focus on activity, sleep and food quality rather than eating less.');
      }
    }
    const deficit = Math.max(0, tdee - target);
    return { age, bmr, tdee, target, deficit, weeklyKg: deficit * 7 / 7700, mode, notes, bmi, bmiTarget };
  },

  // Describe any calorie number compared with your estimate.
  compareTarget(kcal, est) {
    if (!kcal || kcal < this.MIN_KCAL) {
      return { ok: false, msg: 'Below 1,200 kcal a day is too low to set here. Very low targets should only be followed with a doctor or dietitian.' };
    }
    const def = est.tdee - kcal;
    if (def <= 0) return { ok: true, msg: `At or above your estimated maintenance (${fmt(est.tdee)} kcal), so this won't create a deficit.` };
    const msg = `About ${fmt(def)} kcal/day below maintenance, roughly ${(def * 7 / 7700).toFixed(2)} kg per week (estimate).`;
    if (def > est.tdee * 0.25) return { ok: true, warn: true, msg: msg + " That's a bigger deficit than this app suggests (over 25%). A smaller one is usually easier to keep up." };
    if (est.mode === 'maintain') return { ok: true, warn: true, msg: msg + " Based on your profile, a deficit isn't suggested right now. Please check with a health professional." };
    return { ok: true, msg };
  },

  // A simple balanced guide for protein, carbs and fat (not a strict rule).
  macros(kcal, kg) {
    const p = Math.round(Math.min(kg * 1.2, kcal * 0.3 / 4));
    const f = Math.round(kcal * 0.28 / 9);
    const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4));
    return { p, c, f };
  },

  // Repeatable random numbers from a text "seed" (so the plan for a day stays the same).
  seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    let a = h >>> 0;
    return () => {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
};

/* ---------- Food log ---------- */
const Food = {
  entries(date) { return S().foodLog[date] || []; },
  entryKcal(e) { return (e.kcalPer || 0) * (e.servings || 1); },
  totals(date) {
    return this.entries(date).reduce((t, e) => {
      const n = e.servings || 1;
      return { kcal: t.kcal + (e.kcalPer || 0) * n, p: t.p + (e.pPer || 0) * n, c: t.c + (e.cPer || 0) * n, f: t.f + (e.fPer || 0) * n };
    }, { kcal: 0, p: 0, c: 0, f: 0 });
  },
  add(date, entry) { (S().foodLog[date] ||= []).push(entry); DB.save(); },
  update(date, entry) {
    const list = S().foodLog[date] || [];
    const i = list.findIndex(e => e.id === entry.id);
    if (i >= 0) list[i] = entry; else list.push(entry);
    DB.save();
  },
  remove(date, id) {
    const s = S();
    s.foodLog[date] = (s.foodLog[date] || []).filter(e => e.id !== id);
    if (!s.foodLog[date].length) delete s.foodLog[date];
    DB.save();
  }
};

/* ---------- Water ---------- */
const Water = {
  entries(date) { return S().water.log[date] || []; },
  total(date) { return this.entries(date).reduce((a, e) => a + e.ml, 0); },
  add(ml) { (S().water.log[Dates.today()] ||= []).push({ t: Date.now(), ml }); DB.save(); },
  remove(date, t) {
    const log = S().water.log;
    log[date] = (log[date] || []).filter(e => e.t !== t);
    if (!log[date].length) delete log[date];
    DB.save();
  }
};

/* ---------- Meal planner ---------- */
const Planner = {
  SLOTS: ['breakfast', 'lunch', 'snack', 'dinner'],
  SHARES: { breakfast: 0.25, lunch: 0.35, snack: 0.10, dinner: 0.30 },
  LABEL: { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snacks', dinner: 'Dinner' },

  words(str) { return (str || '').toLowerCase().split(/[,;\n]+/).map(w => w.trim()).filter(Boolean); },
  matches(meal, word) {
    const hay = (meal.name + ' ' + meal.tags.join(' ')).toLowerCase();
    const safe = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('\\b' + safe + '(s|es)?\\b').test(hay);
  },
  candidates(slot) {
    const pr = S().mealPrefs;
    const blocked = [...this.words(pr.dislikes), ...this.words(pr.allergies)];
    return DATA.MEALS.filter(m => m.slot === slot && !blocked.some(w => this.matches(m, w)));
  },
  pick(date, slot, { exclude = [], avoidMain = null, salt = 0 } = {}) {
    const s = S(), pr = s.mealPrefs;
    const target = s.profile.calorieTarget * this.SHARES[slot];
    const rnd = Calc.seeded(date + slot + salt);
    const likes = this.words(pr.likes), pantry = this.words(pr.pantry);
    const scored = this.candidates(slot)
      .filter(m => !exclude.includes(m.id))
      .map(m => {
        let sc = Math.abs(m.kcal - target) / target;
        if (likes.some(w => this.matches(m, w))) sc -= 0.25;
        if (pantry.some(w => this.matches(m, w))) sc -= 0.15;
        if (pr.budget === 'low' && m.budget !== 'low') sc += 0.3;
        if (avoidMain && m.main === avoidMain) sc += 0.4;
        sc += rnd() * 0.35; // variety from day to day
        return { m, sc };
      })
      .sort((a, b) => a.sc - b.sc);
    return scored.length ? scored[0].m.id : null;
  },
  getDay(date, salt = 0) {
    const s = S();
    if (!s.mealPlans[date]) {
      const plan = { _n: salt };
      plan.breakfast = this.pick(date, 'breakfast', { salt });
      plan.lunch = this.pick(date, 'lunch', { salt });
      plan.snack = this.pick(date, 'snack', { salt });
      plan.dinner = this.pick(date, 'dinner', { salt, avoidMain: DATA.mealById(plan.lunch)?.main });
      s.mealPlans[date] = plan;
      DB.save();
    }
    return s.mealPlans[date];
  },
  swap(date, slot) {
    const plan = this.getDay(date);
    plan._seen ||= {};
    const seen = plan._seen[slot] ||= [];
    if (plan[slot] && !seen.includes(plan[slot])) seen.push(plan[slot]);
    plan._n = (plan._n || 0) + 1;
    const avoidMain = slot === 'dinner' ? DATA.mealById(plan.lunch)?.main : null;
    let id = this.pick(date, slot, { exclude: seen, avoidMain, salt: plan._n });
    if (!id) { plan._seen[slot] = [plan[slot]]; id = this.pick(date, slot, { exclude: [plan[slot]], avoidMain, salt: plan._n }); }
    if (id) plan[slot] = id;
    DB.save();
    return id;
  },
  regenerate(date) {
    const salt = (S().mealPlans[date]?._n || 0) + 1;
    delete S().mealPlans[date];
    return this.getDay(date, salt);
  },
  clearFuture() {
    const t = Dates.today(), plans = S().mealPlans;
    for (const d of Object.keys(plans)) if (d >= t) delete plans[d];
    DB.save();
  }
};

/* ---------- Workouts ---------- */
const Workout = {
  planFor(date, s = S()) {
    const plan = DATA.WEEK_PLAN[Dates.weekday(date)];
    const log = s.workouts.log[date] || {};
    const li = s.workouts.level === 'building' ? 1 : 0;
    const light = !!log.light;
    let items = plan.items.map(it => ({ ...it }));
    if (light && items.length) {
      items = [
        ...items.filter(i => i.phase === 'warmup').slice(0, 1),
        ...items.filter(i => i.phase === 'main').slice(0, 3),
        ...items.filter(i => i.phase === 'cooldown').slice(0, 1)
      ];
    }
    items = items.map(it => {
      const ex = DATA.EXERCISES[it.id];
      const sets = (it.phase !== 'main' || light || plan.recovery) ? 1 : (li ? 3 : 2);
      const saved = (log.items || {})[it.id] || {};
      return { ...it, ex, sets: saved.sets ?? sets, amount: saved.amount ?? ex.amount[li], done: !!saved.done };
    });
    return { plan, items, light, log };
  },
  // Rough time & calorie estimate using MET values (never exact).
  estimate(items, kg) {
    let sec = 0, kcal = 0;
    for (const it of items) {
      const sides = it.ex.perSide ? 2 : 1;
      const amt = it.ex.unit === 'min' ? it.amount * 60 : it.amount;
      const s = it.ex.type === 'reps' ? it.sets * (it.amount * 3 * sides + 30) : it.sets * (amt * sides + 15);
      sec += s;
      kcal += it.ex.met * kg * s / 3600;
    }
    return { minutes: Math.max(1, Math.round(sec / 60)), kcal: Math.round(kcal) };
  },
  isDone(date, s = S()) {
    const { items } = this.planFor(date, s);
    return items.length > 0 && items.every(i => i.done);
  },
  setItem(date, id, patch) {
    const log = (S().workouts.log[date] ||= {});
    log.items ||= {};
    log.items[id] = { ...(log.items[id] || {}), ...patch };
    if (this.isDone(date)) log.completedAt ||= Date.now(); else delete log.completedAt;
    DB.save();
  }
};

/* ---------- Menstrual cycle ---------- */
const Cycle = {
  sorted(c = S().cycle) { return [...c.periods].sort((a, b) => (a.start < b.start ? -1 : 1)); },
  stats(c = S().cycle, today = Dates.today()) {
    const periods = this.sorted(c);
    const lengths = [];
    for (let i = 1; i < periods.length; i++) {
      const L = Dates.diff(periods[i - 1].start, periods[i].start);
      if (L >= 15 && L <= 60) lengths.push(L);
    }
    const recent = lengths.slice(-6);
    const avgCycle = recent.length ? Math.round(avg(recent)) : (c.defaultCycle || 28);
    const durs = periods.filter(p => p.end).map(p => Dates.diff(p.start, p.end) + 1).filter(d => d > 0 && d <= 14).slice(-6);
    const avgPeriod = durs.length ? Math.round(avg(durs)) : (c.defaultPeriod || 5);
    const last = periods[periods.length - 1] || null;
    const open = last && !last.end ? last : null;
    let next = [], late = false;
    if (last) {
      const n = Dates.add(last.start, avgCycle);
      if (!open && Dates.diff(n, today) > 0) late = true;
      next = [n, Dates.add(n, avgCycle), Dates.add(n, avgCycle * 2)];
    }
    return {
      periods, lengths, avgCycle, avgPeriod, last, open, next, late,
      usingDefaults: !recent.length,
      dayOfCycle: last ? Dates.diff(last.start, today) + 1 : null,
      variability: recent.length > 1 ? Math.max(...recent) - Math.min(...recent) : null
    };
  },
  periodEnd(p) {
    if (p.end) return p.end;
    // An unfinished period counts up to today (max 10 days).
    const t = Dates.today(), cap = Dates.add(p.start, 9);
    return t < cap ? t : cap;
  },
  isRecorded(date, periods) { return periods.some(p => date >= p.start && date <= this.periodEnd(p)); },
  isPredicted(date, st) {
    if (date < Dates.today() || this.isRecorded(date, st.periods) || st.open) return false;
    return st.next.some(n => date >= n && date <= Dates.add(n, st.avgPeriod - 1));
  },
  isNear(date, st) {
    if (this.isRecorded(date, st.periods)) return true;
    return st.next.some(n => date >= Dates.add(n, -2) && date <= Dates.add(n, st.avgPeriod - 1));
  },
  markStart(date) {
    const c = S().cycle;
    if (c.periods.some(p => p.start === date)) return 'exists';
    if (c.periods.some(p => p.end && date > p.start && date <= p.end)) return 'inside';
    const before = this.sorted(c).filter(p => p.start < date).pop();
    if (before && !before.end) {
      const st = this.stats(c);
      before.end = Dates.add(before.start, Math.max(1, Math.min(st.avgPeriod, Dates.diff(before.start, date))) - 1);
    }
    c.periods.push({ id: uid(), start: date, end: null });
    DB.save();
    return 'ok';
  },
  markEnd(date) {
    const p = this.sorted().filter(x => x.start <= date).pop();
    if (!p) return 'none';
    if (Dates.diff(p.start, date) > 14) return 'toolong';
    p.end = date;
    DB.save();
    return 'ok';
  }
};

/* ---------- Daily checklist ---------- */
const Checklist = {
  items(date) {
    const s = S(), manual = s.checklist[date] || {};
    const slots = new Set(Food.entries(date).map(e => e.slot));
    const plan = DATA.WEEK_PLAN[Dates.weekday(date)];
    const items = [];
    items.push({ key: 'meals', label: 'Log breakfast, lunch & dinner', auto: ['breakfast', 'lunch', 'dinner'].every(x => slots.has(x)), href: '#/nutrition/food' });
    items.push({ key: 'water', label: `Drink ${fmt(s.water.goalMl)} mL of water`, auto: Water.total(date) >= s.water.goalMl, href: '#/nutrition/water' });
    if (plan.rest) items.push({ key: 'workout', label: 'Rest day: relax, maybe a gentle stretch', auto: true });
    else items.push({ key: 'workout', label: plan.optional ? 'Optional: light walk or stretch' : `Workout: ${plan.title}`, auto: Workout.isDone(date, s), href: '#/workouts' });
    const before = s.weights.filter(w => w.date < date).map(w => w.date).sort().pop();
    if (date.endsWith('-01') || !before || Dates.diff(before, date) >= 7) {
      items.push({ key: 'weight', label: date.endsWith('-01') ? 'Monthly weigh-in' : 'Record your weight (once a week is enough)', auto: s.weights.some(w => w.date === date), href: '#/progress' });
    }
    const st = Cycle.stats(s.cycle, date);
    if (st.last && Cycle.isNear(date, st)) items.push({ key: 'cycle', label: 'Track cycle symptoms', auto: !!s.cycle.days[date], href: '#/cycle' });
    items.push({ key: 'review', label: "Review today's progress", auto: false });
    return items.map(i => ({ ...i, done: i.auto || !!manual[i.key] }));
  },
  toggle(date, key) {
    const c = (S().checklist[date] ||= {});
    c[key] = !c[key];
    DB.save();
  },
  score(date) {
    const it = this.items(date);
    return it.filter(i => i.done).length / it.length;
  }
};

/* ---------- Monthly report ---------- */
const Report = {
  month(m) {
    const s = S(), today = Dates.today();
    const since = s.profile?.createdAt || '0000-00-00'; // don't count days before setup
    const dates = [];
    for (let d = 1; d <= Dates.daysInMonth(m); d++) {
      const ds = `${m}-${Dates.pad(d)}`;
      if (ds > today) break;
      if (ds >= since) dates.push(ds);
    }
    const kcalDays = dates.map(d => ({ date: d, kcal: Food.totals(d).kcal }));
    const logged = kcalDays.filter(x => x.kcal > 0);
    const water = dates.map(d => ({ date: d, ml: Water.total(d) }));
    const waterLogged = water.filter(x => x.ml > 0);
    const planned = dates.filter(d => { const p = DATA.WEEK_PLAN[Dates.weekday(d)]; return !p.rest && !p.optional; });
    const done = dates.filter(d => Workout.isDone(d, s));
    const ws = [...s.weights].sort((a, b) => (a.date < b.date ? -1 : 1));
    const inMonth = ws.filter(w => w.date.startsWith(m));
    const prev = ws.filter(w => w.date < `${m}-01`).pop();
    const startKg = prev?.kg ?? inMonth[0]?.kg ?? null;
    const endKg = inMonth.length ? inMonth[inMonth.length - 1].kg : null;
    const st = Cycle.stats(s.cycle);
    return {
      m, dates, kcalDays,
      daysLogged: logged.length,
      avgKcal: avg(logged.map(x => x.kcal)),
      water, avgWater: avg(waterLogged.map(x => x.ml)),
      waterGoalDays: water.filter(x => x.ml >= s.water.goalMl).length,
      plannedWorkouts: planned.length, workoutsDone: done.length, doneDates: done,
      startKg, endKg, change: startKg != null && endKg != null ? endKg - startKg : null,
      habit: dates.length ? avg(dates.map(d => Checklist.score(d))) : 0,
      periods: st.periods.filter(p => p.start.startsWith(m) || (p.end && p.end.startsWith(m))),
      symptomDays: Object.keys(s.cycle.days).filter(d => d.startsWith(m))
    };
  }
};

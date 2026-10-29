/* =========================================================
   reminders.js — water, workout and period reminders.

   IMPORTANT: GitHub Pages is static hosting with no server,
   so reminders only work while the app is OPEN (in a tab or
   as an installed app that is running). Browsers do not let
   a closed website wake itself up on a timer.
   ========================================================= */
const Reminders = (() => {
  let timer = null;
  let lastDate = null;

  const supported = () => 'Notification' in window;
  const permission = () => (supported() ? Notification.permission : 'unsupported');

  async function requestPermission() {
    if (!supported()) {
      UI.toast('This browser does not support notifications. You will still see in-app reminders.', 'error');
      return 'unsupported';
    }
    const result = await Notification.requestPermission();
    S().settings.notifications = result === 'granted';
    DB.save();
    if (result === 'granted') notify('Notifications are on', 'You will get reminders while the app is open.');
    else UI.toast('Notifications were not allowed. You can change this in your browser settings.');
    return result;
  }

  async function notify(title, body, tag = 'wellness') {
    UI.toast(`${title}: ${body}`);
    if (permission() !== 'granted') return;
    try {
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg) await reg.showNotification(title, { body, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' });
      else new Notification(title, { body, tag, icon: 'icons/icon-192.png' });
    } catch (e) { /* in-app toast already shown */ }
  }

  function inWindow(nowMin, start, end) {
    const a = Dates.toMin(start), b = Dates.toMin(end);
    return a <= b ? nowMin >= a && nowMin <= b : nowMin >= a || nowMin <= b;
  }

  function checkWater(s, now, today) {
    const r = s.water.reminder;
    if (!r.enabled) return;
    if (r.pausedUntil && now.getTime() < r.pausedUntil) return;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (!inWindow(nowMin, r.start, r.end)) return;
    if (Water.total(today) >= s.water.goalMl) return;
    const lastLog = Math.max(0, ...Water.entries(today).map(e => e.t));
    const startToday = new Date(now); startToday.setHours(...r.start.split(':').map(Number), 0, 0);
    const ref = Math.max(r.lastAt || 0, lastLog, startToday.getTime());
    if (now.getTime() - ref >= r.intervalMin * 60000) {
      r.lastAt = now.getTime();
      DB.save();
      const left = s.water.goalMl - Water.total(today);
      notify('Time for water', `About ${fmt(left)} mL to go today.`, 'water');
    }
  }

  function checkWorkout(s, now, today) {
    const plan = DATA.WEEK_PLAN[Dates.weekday(today)];
    if (plan.rest || plan.optional || s.workouts.notified === today) return;
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const at = Dates.toMin(s.workouts.time);
    if (nowMin >= at && nowMin <= at + 90 && !Workout.isDone(today, s)) {
      s.workouts.notified = today;
      DB.save();
      notify('Workout time', `${plan.title}, before dinner. Short on time? Try the light version.`, 'workout');
    }
  }

  function checkPeriod(s, today) {
    if (!s.cycle.remind || s.cycle.notified === today) return;
    const st = Cycle.stats(s.cycle, today);
    if (!st.last || st.open) return;
    const days = Dates.diff(today, st.next[0]);
    if (days >= 0 && days <= 2) {
      s.cycle.notified = today;
      DB.save();
      notify('Period may be coming', `Estimated around ${Dates.nice(st.next[0])}. This is only an estimate.`, 'period');
    }
  }

  function tick() {
    const s = S();
    if (!s || !s.profile) return;
    const now = new Date(), today = Dates.today();
    // New day while the app was open: refresh the screen and check the month.
    if (lastDate && lastDate !== today) { App.render(); App.checkMonthly(); }
    lastDate = today;
    checkWater(s, now, today);
    checkWorkout(s, now, today);
    checkPeriod(s, today);
  }

  function start() {
    clearInterval(timer);
    lastDate = Dates.today();
    setTimeout(tick, 4000);
    timer = setInterval(tick, 30000);
  }

  return { start, tick, notify, requestPermission, permission, supported };
})();

/* =========================================================
   db.js — saves all your data privately in THIS browser.
   Uses IndexedDB (falls back to localStorage).
   Nothing is ever sent to GitHub or any server.
   ========================================================= */
const DB = (() => {
  const DB_NAME = 'my-wellness';
  const STORE = 'kv';
  const KEY = 'state';
  const LS_KEY = 'my-wellness-state';
  let dbPromise = null;
  let state = null;
  let timer = null;

  function defaults() {
    return {
      version: 1,
      profile: null,               // filled in during setup
      weights: [],                 // [{date:'YYYY-MM-DD', kg}]
      foodLog: {},                 // { 'YYYY-MM-DD': [entry, ...] }
      savedFoods: [],              // your own foods
      mealPrefs: { month: null, likes: '', dislikes: '', allergies: '', budget: 'low', pantry: '' },
      mealPlans: {},               // { 'YYYY-MM-DD': {breakfast, lunch, snack, dinner} }
      water: {
        goalMl: 2000,
        log: {},                   // { 'YYYY-MM-DD': [{t, ml}] }
        reminder: { enabled: false, intervalMin: 60, start: '07:00', end: '21:00', pausedUntil: null, lastAt: 0 }
      },
      workouts: { level: 'beginner', time: '16:30', dinnerTime: '18:30', log: {}, notified: null },
      cycle: { periods: [], days: {}, remind: true, defaultCycle: 28, defaultPeriod: 5, notified: null },
      checklist: {},               // manual ticks per day
      checkins: {},                // monthly check-ins { 'YYYY-MM': {date, kg} }
      settings: { notifications: false }
    };
  }

  // Merge saved data into defaults so new settings always exist.
  function merge(base, saved) {
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return base;
    for (const k of Object.keys(saved)) {
      const b = base[k], s = saved[k];
      if (b && typeof b === 'object' && !Array.isArray(b) && s && typeof s === 'object' && !Array.isArray(s)) {
        base[k] = merge(b, s);
      } else {
        base[k] = s;
      }
    }
    return base;
  }

  function open() {
    if (!('indexedDB' in window)) return Promise.reject(new Error('IndexedDB not available'));
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  async function idbGet() {
    const db = await open();
    return new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbSet(value) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function load() {
    let saved = null;
    try { saved = await idbGet(); } catch (e) {
      try { saved = JSON.parse(localStorage.getItem(LS_KEY)); } catch (e2) { saved = null; }
    }
    state = merge(defaults(), saved || {});
    return state;
  }

  async function flush() {
    clearTimeout(timer);
    const copy = JSON.parse(JSON.stringify(state));
    try { await idbSet(copy); } catch (e) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(copy)); } catch (e2) {
        console.error('Could not save data', e2);
      }
    }
  }

  // Save shortly after a change (groups quick changes together).
  function save() {
    clearTimeout(timer);
    timer = setTimeout(flush, 150);
  }

  async function replace(newState) {
    state = merge(defaults(), newState);
    await flush();
  }

  async function reset() {
    state = defaults();
    await flush();
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
  }

  // Save right away when the app is hidden or closed.
  document.addEventListener('visibilitychange', () => { if (document.hidden && state) flush(); });

  return { load, save, flush, replace, reset, defaults, get state() { return state; } };
})();

const S = () => DB.state;

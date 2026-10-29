/* =========================================================
   ui.js — icons, pop-up windows (modals), toasts and forms.
   ========================================================= */
const Views = {}; // each page registers itself here

const UI = (() => {
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    food: '<path d="M7 2v20M4 2v6a3 3 0 0 0 6 0V2M17 22V2c-2.5 1.5-3.5 4.5-3.5 8.5H17"/>',
    dumbbell: '<path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12"/>',
    cycle: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17" fill="currentColor" opacity=".25"/><circle cx="12" cy="12" r="2.5"/>',
    chart: '<path d="M3 20h18M6 16v-5M11 16V6M16 16v-8M21 16v-3"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
    water: '<path d="M12 3c3.2 4.2 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 2.8-6.8 6-11z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
    left: '<path d="m15 5-7 7 7 7"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    scale: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M9 9a3 3 0 0 1 6 0M12 9l1.5-2"/>',
    sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    leaf: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7"/>'
  };

  function icon(name, size = 20) {
    return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  // Makes text safe to put inside HTML.
  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function toast(msg, type = 'info', ms = 3800) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, ms);
  }

  function formData(form) {
    const o = {};
    for (const el of form.elements) {
      if (!el.name) continue;
      if (el.type === 'checkbox') {
        if (el.name.endsWith('[]')) {
          const k = el.name.slice(0, -2);
          o[k] ||= [];
          if (el.checked) o[k].push(el.value);
        } else o[el.name] = el.checked;
      } else if (el.type === 'radio') {
        if (el.checked) o[el.name] = el.value;
      } else if (el.type === 'number') {
        o[el.name] = el.value === '' ? null : parseFloat(el.value);
      } else {
        o[el.name] = el.value.trim();
      }
    }
    return o;
  }

  /* A pop-up form. onSubmit(data, form) — return false to keep it open. */
  function modal({ title, body, submitLabel = 'Save', cancelLabel = 'Cancel', danger = false, onSubmit, onOpen, onClose, extraButtons = '' }) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<form class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>
      <div class="modal-body">${body}</div>
      <div class="modal-foot">${extraButtons}${cancelLabel ? `<button type="button" class="btn ghost" data-close>${cancelLabel}</button>` : ''}${submitLabel ? `<button type="submit" class="btn ${danger ? 'danger' : 'primary'}">${submitLabel}</button>` : ''}</div>
    </form>`;
    document.body.appendChild(wrap);
    document.body.classList.add('no-scroll');
    const form = wrap.querySelector('form');
    let closed = false;
    const onKey = e => { if (e.key === 'Escape') close(); };
    function close() {
      if (closed) return;
      closed = true;
      wrap.remove();
      document.removeEventListener('keydown', onKey);
      if (!document.querySelector('.modal-backdrop')) document.body.classList.remove('no-scroll');
      onClose && onClose();
    }
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!onSubmit) return close();
      const result = await onSubmit(formData(form), form);
      if (result !== false) close();
    });
    onOpen && onOpen(form, close);
    return close;
  }

  function confirm(message, { title = 'Are you sure?', ok = 'Yes', danger = true } = {}) {
    return new Promise(resolve => {
      modal({
        title, body: `<p>${esc(message)}</p>`, submitLabel: ok, danger,
        onSubmit: () => { resolve(true); },
        onClose: () => resolve(false)
      });
    });
  }

  return { icon, esc, toast, modal, confirm, formData };
})();

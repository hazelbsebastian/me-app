/* =========================================================
   charts.js — small SVG charts (no internet needed).
   ========================================================= */
const Charts = {
  empty(msg = 'No data yet') { return `<div class="empty small">${msg}</div>`; },

  // points: [{label, y}]
  line(points, { goal = null, unit = '', height = 190, color = 'var(--sage-d)', empty } = {}) {
    if (!points.length) return this.empty(empty);
    const W = 600, H = height, pl = 44, pr = 14, pt = 14, pb = 28;
    const ys = points.map(p => p.y).concat(goal != null ? [goal] : []);
    let min = Math.min(...ys), max = Math.max(...ys);
    if (max - min < 1) { min -= 1; max += 1; }
    const pad = (max - min) * 0.15; min -= pad; max += pad;
    const x = i => points.length === 1 ? pl + (W - pl - pr) / 2 : pl + i * (W - pl - pr) / (points.length - 1);
    const y = v => pt + (max - v) * (H - pt - pb) / (max - min);
    const ticks = [max - pad, (min + max) / 2, min + pad];
    const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join('');
    const labelIdx = [...new Set([0, Math.floor((points.length - 1) / 2), points.length - 1])];
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart">
      ${ticks.map(t => `<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl - 6}" y="${y(t) + 4}" text-anchor="end">${t.toFixed(1)}</text>`).join('')}
      ${goal != null ? `<line class="goal-line" x1="${pl}" x2="${W - pr}" y1="${y(goal)}" y2="${y(goal)}"/>` : ''}
      <path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      ${points.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.y)}" r="4.5" fill="${color}"><title>${p.label}: ${p.y} ${unit}</title></circle>`).join('')}
      ${labelIdx.map(i => `<text x="${x(i)}" y="${H - 8}" text-anchor="${points.length === 1 ? 'middle' : i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}">${points[i].label}</text>`).join('')}
    </svg>${goal != null ? `<div class="legend"><span><i style="background:${color}"></i>Recorded</span><span><i style="background:var(--amber)"></i>Goal</span></div>` : ''}`;
  },

  // values: [{label, y}]
  bar(values, { goal = null, unit = '', height = 170, color = 'var(--sage)', empty } = {}) {
    if (!values.length || values.every(v => !v.y)) return this.empty(empty);
    const W = 600, H = height, pl = 44, pr = 10, pt = 12, pb = 26;
    const max = Math.max(...values.map(v => v.y), goal || 0) * 1.12 || 1;
    const n = values.length, slot = (W - pl - pr) / n, bw = Math.max(3, slot * 0.66);
    const y = v => pt + (max - v) * (H - pt - pb) / max;
    const every = Math.ceil(n / 8);
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart">
      ${[max / 1.12, max / 2.24].map(t => `<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}"/><text x="${pl - 6}" y="${y(t) + 4}" text-anchor="end">${fmt(t)}</text>`).join('')}
      ${values.map((v, i) => `<rect x="${(pl + i * slot + (slot - bw) / 2).toFixed(1)}" y="${y(v.y).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0, H - pb - y(v.y)).toFixed(1)}" rx="3" fill="${color}"><title>${v.label}: ${fmt(v.y)} ${unit}</title></rect>`).join('')}
      ${goal ? `<line class="goal-line" x1="${pl}" x2="${W - pr}" y1="${y(goal)}" y2="${y(goal)}"/>` : ''}
      ${values.map((v, i) => (i % every === 0 ? `<text x="${pl + i * slot + slot / 2}" y="${H - 8}" text-anchor="middle">${v.label}</text>` : '')).join('')}
    </svg>${goal ? `<div class="legend"><span><i style="background:${color}"></i>Daily total</span><span><i style="background:var(--amber)"></i>Goal (${fmt(goal)} ${unit})</span></div>` : ''}`;
  },

  ring(pct, { size = 128, stroke = 11, color = 'var(--sage-d)', label = '', sub = '' } = {}) {
    const r = (100 - stroke) / 2, c = 2 * Math.PI * r;
    const p = Math.max(0, Math.min(1, pct || 0));
    return `<div class="ring" style="--size:${size}px">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="var(--bg)" stroke-width="${stroke}"/>
        <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(2)} ${c.toFixed(2)}"/>
      </svg>
      <div class="ring-label"><strong>${label}</strong><span>${sub}</span></div>
    </div>`;
  },

  progress(pct, cls = '') {
    return `<div class="bar ${cls}"><i style="width:${Math.round(Math.max(0, Math.min(1, pct || 0)) * 100)}%"></i></div>`;
  }
};

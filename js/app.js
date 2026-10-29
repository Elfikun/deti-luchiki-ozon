/**
 * Main Application Logic for Ozon & Дети-лучики Campaign
 * Enhanced for Core Web Vitals (CWV), BEM architecture, and Enterprise Security.
 */

// Campaign Target
const CAMPAIGN_TARGET_RUB = 650000;

// Departments Configuration
const OZON_DEPARTMENTS = [
  'Ozon Tech',
  'Ozon Rocket (Логистика)',
  'Ozon Marketplace',
  'Ozon Fintech',
  'Ozon Fresh',
  'HR & Коммуникации',
  'Коммерция & Маркетинг'
];

/**
 * Universal HTML Sanitizer to prevent DOM & Stored XSS (CWE-79).
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  initSnowEffect();
  initPostcardCanvas();
  updateCampaignProgress();
  renderLeaderboard();
  setupDonationForm();
  setupStatsModal();
  setupFooterLinks();
  checkUrlParams();
});

/* =========================================================
   1. SNOWFALL CANVAS EFFECT (PASSIVE LISTENERS, NO CLS)
   ========================================================= */
let isSnowActive = true;
function initSnowEffect() {
  const canvas = document.getElementById('snow-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }, { passive: true });

  const flakesCount = 60;
  const flakes = [];

  for (let i = 0; i < flakesCount; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.5 + 1,
      speedY: Math.random() * 1.1 + 0.5,
      speedX: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.6 + 0.3
    });
  }

  function renderSnow() {
    if (!isSnowActive) {
      ctx.clearRect(0, 0, width, height);
      return;
    }
    ctx.clearRect(0, 0, width, height);

    flakes.forEach(flake => {
      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.fill();

      flake.y += flake.speedY;
      flake.x += flake.speedX;

      if (flake.y > height) {
        flake.y = -5;
        flake.x = Math.random() * width;
      }
      if (flake.x > width) flake.x = 0;
      if (flake.x < 0) flake.x = width;
    });

    requestAnimationFrame(renderSnow);
  }

  renderSnow();

  const toggleBtn = document.getElementById('toggle-snow-btn');
  if (toggleBtn) {
    const snowSvg = '<svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07"/></svg>';
    toggleBtn.addEventListener('click', () => {
      isSnowActive = !isSnowActive;
      toggleBtn.innerHTML = isSnowActive ? `${snowSvg} <span>Снег: Вкл</span>` : `${snowSvg} <span>Снег: Выкл</span>`;
      if (isSnowActive) renderSnow();
    });
  }
}

/* =========================================================
   2. PROGRESS BAR & METRICS
   ========================================================= */
function updateCampaignProgress() {
  const metrics = window.charityAnalytics.getMetrics();
  const total = metrics.totalDonated;
  const pct = Math.min(100, Math.round((total / CAMPAIGN_TARGET_RUB) * 100));

  const fillEl = document.getElementById('progress-bar-fill');
  const raisedEl = document.getElementById('stat-total-raised');
  const pctEl = document.getElementById('stat-percent');
  const donorsEl = document.getElementById('stat-donors-count');
  const remainingEl = document.getElementById('stat-remaining-rub');

  if (fillEl) fillEl.style.width = pct + '%';
  if (raisedEl) raisedEl.textContent = formatRubles(total);
  if (pctEl) pctEl.textContent = pct + '% собрано';
  if (donorsEl) donorsEl.textContent = metrics.donationsCount + ' коллег';
  if (remainingEl) remainingEl.textContent = formatRubles(Math.max(0, CAMPAIGN_TARGET_RUB - total));
}

function formatRubles(val) {
  return new Intl.NumberFormat('ru-RU').format(val) + ' ₽';
}

/* =========================================================
   3. LEADERBOARD & DEPARTMENT CONTEST (XSS HARDENED, BEM)
   ========================================================= */
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-grid');
  if (!container) return;

  const donations = window.charityAnalytics.getDonations();
  const deptStats = {};

  OZON_DEPARTMENTS.forEach(dept => {
    deptStats[dept] = { count: 0, total: 0 };
  });

  donations.forEach(d => {
    const dept = (d && d.dept && deptStats[d.dept]) ? d.dept : 'Ozon Tech';
    deptStats[dept].count += 1;
    deptStats[dept].total += Number(d.amount) || 0;
  });

  const sorted = Object.keys(deptStats).map(name => ({
    name,
    total: deptStats[name].total,
    count: deptStats[name].count
  })).sort((a, b) => b.total - a.total);

  const maxTotal = sorted[0]?.total || 1;

  container.innerHTML = sorted.map((dept, index) => {
    const rank = index + 1;
    let rankBadge = `${rank}`;
    let rankModifier = '';
    if (rank === 1) {
      rankBadge = '<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';
      rankModifier = 'leaderboard__rank--gold';
    } else if (rank === 2) {
      rankBadge = '<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="#94a3b8"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';
      rankModifier = 'leaderboard__rank--silver';
    } else if (rank === 3) {
      rankBadge = '<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="#c2410c"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';
      rankModifier = 'leaderboard__rank--bronze';
    }

    const fillPct = Math.min(100, Math.round((dept.total / maxTotal) * 100));
    const safeDeptName = escapeHtml(dept.name);

    return `
      <div class="leaderboard__row">
        <div class="leaderboard__left">
          <div class="leaderboard__rank ${rankModifier}">${rankBadge}</div>
          <div class="leaderboard__name-wrap">
            <div class="leaderboard__name">${safeDeptName} <span class="leaderboard__count">(${escapeHtml(dept.count)} чел.)</span></div>
            <div class="leaderboard__bar-track">
              <div class="leaderboard__bar-fill" style="width: ${fillPct}%"></div>
            </div>
          </div>
        </div>
        <div class="leaderboard__right">
          <div class="leaderboard__amount">${formatRubles(dept.total)}</div>
          <button type="button" class="leaderboard__support-btn" data-dept="${safeDeptName}">
            Поддержать
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Event delegation to replace inline onclick handlers
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.leaderboard__support-btn');
    if (btn) {
      const deptName = btn.getAttribute('data-dept');
      if (deptName) selectDepartment(deptName);
    }
  });
}

window.selectDepartment = function(deptName) {
  const select = document.getElementById('donor-dept-select');
  if (select) {
    select.value = deptName;
    const target = document.getElementById('donate-box');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    select.focus();
  }
};

/* =========================================================
   4. LIVE POSTCARD GENERATOR (THROTTLED WITH RAF FOR INP)
   ========================================================= */
let postcardRafId = null;

function initPostcardCanvas() {
  const canvas = document.getElementById('postcard-canvas');
  if (!canvas) return;
  drawPostcard('Сотрудник Ozon');

  const nameInput = document.getElementById('donor-name-input');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const rawName = e.target.value.trim().substring(0, 35) || 'Сотрудник Ozon';
      if (postcardRafId) cancelAnimationFrame(postcardRafId);
      postcardRafId = requestAnimationFrame(() => {
        drawPostcard(rawName);
      });
    });
  }

  const downloadBtn = document.getElementById('btn-download-postcard');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = `Ozon_Luchiki_Postcard_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  }
}

function drawPostcard(recipientName) {
  const canvas = document.getElementById('postcard-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  // Background gradient: festive twilight with warm light
  const bgGrad = ctx.createLinearGradient(0, 0, w, h);
  bgGrad.addColorStop(0, '#0a194f');
  bgGrad.addColorStop(0.5, '#1e3a8a');
  bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Gold festive border
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  // Holiday Snow & stars in background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  for (let i = 0; i < 35; i++) {
    const sx = 25 + (Math.sin(i * 99) * 0.5 + 0.5) * (w - 50);
    const sy = 25 + (Math.cos(i * 47) * 0.5 + 0.5) * (h - 50);
    const sr = (i % 3 === 0) ? 2 : 1.2;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Children's Sunshine Icon (Дети-лучики authentic #FF7A00 & #95C227)
  const sunX = w / 2;
  const sunY = 75;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#ff7a00';
  ctx.fill();

  // Sun rays in deti-luchiki brand colors
  const rayColors = ['#95c227', '#ff7a00'];
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  let rayIdx = 0;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
    ctx.strokeStyle = rayColors[rayIdx % 2];
    rayIdx++;
    const rx1 = sunX + Math.cos(a) * 32;
    const ry1 = sunY + Math.sin(a) * 32;
    const rx2 = sunX + Math.cos(a) * 42;
    const ry2 = sunY + Math.sin(a) * 42;
    ctx.beginPath();
    ctx.moveTo(rx1, ry1);
    ctx.lineTo(rx2, ry2);
    ctx.stroke();
  }

  // Friendly face on the sun (drawn by children)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(sunX - 8, sunY - 4, 3, 0, Math.PI * 2);
  ctx.arc(sunX + 8, sunY - 4, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sunX, sunY + 4, 11, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Title in Comfortaa rounded style
  ctx.fillStyle = '#ffffff';
  ctx.font = "bold 20px 'Comfortaa', -apple-system, sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('С НОВЫМ ГОДОМ!', w / 2, 145);

  // Recipient Greeting (truncated to 30 chars for canvas bounds)
  const safeName = String(recipientName).replace(/[^\p{L}\p{N}\s.\-_]/gu, '').substring(0, 30);
  ctx.fillStyle = '#95c227';
  ctx.font = "bold 15px 'Comfortaa', -apple-system, sans-serif";
  ctx.fillText(`Дорогой коллега: ${safeName}!`, w / 2, 175);

  // Heartfelt Message from Kids
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('Спасибо, что даришь нам лучики тепла!', w / 2, 205);
  ctx.fillText('Пусть в Новом Году твои мечты сбываются так же,', w / 2, 225);
  ctx.fillText('как сбылась наша мечта о новогодней ёлке!', w / 2, 245);

  // Child drawing: Christmas tree at the bottom
  drawMiniTree(ctx, w / 2, 310);

  // Co-branding footer
  ctx.fillStyle = '#ffd000';
  ctx.font = "bold 11px 'Comfortaa', sans-serif";
  ctx.fillText('OZON ЗАБОТА  ×  КРОО «ДЕТИ-ЛУЧИКИ»', w / 2, 360);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px system-ui, -apple-system, sans-serif';
  ctx.fillText('Специальный новогодний благотворительный сбор', w / 2, 375);
}

function drawMiniTree(ctx, x, y) {
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.moveTo(x, y - 35);
  ctx.lineTo(x + 30, y);
  ctx.lineTo(x - 30, y);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.lineTo(x + 40, y + 25);
  ctx.lineTo(x - 40, y + 25);
  ctx.closePath();
  ctx.fill();

  // Trunk
  ctx.fillStyle = '#78350f';
  ctx.fillRect(x - 6, y + 25, 12, 14);

  // Star on top
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(x, y - 37, 6, 0, Math.PI * 2);
  ctx.fill();

  // Colorful ornaments
  const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#e879f9'];
  const ornamentCoords = [
    [x - 12, y - 5], [x + 10, y - 12], [x - 22, y + 16], [x + 18, y + 14], [x, y + 8]
  ];
  ornamentCoords.forEach((pt, idx) => {
    ctx.fillStyle = colors[idx % colors.length];
    ctx.beginPath();
    ctx.arc(pt[0], pt[1], 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* =========================================================
   5. SBP QR & DONATION FORM HANDLER
   ========================================================= */
const SBP_OFFICIAL_URL = 'https://qr.nspk.ru/AS1A004188F9QISE87DONIOS3GADGKH3?type=01&bank=100000000013&crc=1115';

function updateSbpQr(amountRubles) {
  const container = document.getElementById('sbp-qrcode-container');
  const directBtn = document.getElementById('sbp-direct-pay-btn');
  const amountDisplay = document.getElementById('sbp-amount-display');
  const copySumVal = document.getElementById('sbp-copy-sum-val');
  const noticeSumText = document.getElementById('sbp-notice-sum-text');
  const btnConfirmText = document.getElementById('btn-confirm-text');

  const formatted = formatRubles(amountRubles);

  if (amountDisplay) amountDisplay.textContent = formatted;
  if (copySumVal) copySumVal.textContent = formatted;
  if (noticeSumText) noticeSumText.textContent = formatted;
  if (btnConfirmText) btnConfirmText.textContent = `Я перевёл ${formatted} — добавить в рейтинг команды!`;

  if (directBtn) directBtn.href = SBP_OFFICIAL_URL;

  if (container && typeof QRCode !== 'undefined') {
    container.innerHTML = '';
    new QRCode(container, {
      text: SBP_OFFICIAL_URL,
      width: 130,
      height: 130,
      colorDark: '#1f2937',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

function setupDonationForm() {
  const presetBtns = document.querySelectorAll('.presets__btn');
  const customInput = document.getElementById('custom-amount-input');
  let selectedAmount = 1000;

  function updateAllAmounts() {
    updateSbpQr(selectedAmount);
  }

  // Initial render of SBP QR code
  updateAllAmounts();

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('presets__btn--active'));
      btn.classList.add('presets__btn--active');
      const amt = parseInt(btn.dataset.amount, 10);
      if (!isNaN(amt) && amt > 0) {
        selectedAmount = amt;
      }
      if (customInput) customInput.value = '';
      updateAllAmounts();
    });
  });

  if (customInput) {
    customInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 10 && val <= 1000000) {
        presetBtns.forEach(b => b.classList.remove('presets__btn--active'));
        selectedAmount = val;
        updateAllAmounts();
      }
    });
  }

  // Copy sum button
  const copySumBtn = document.getElementById('btn-copy-sum');
  if (copySumBtn) {
    copySumBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(selectedAmount.toString()).then(() => {
        const textSpan = document.getElementById('btn-copy-sum-text');
        if (textSpan) {
          const original = textSpan.textContent;
          textSpan.textContent = 'Скопировано!';
          setTimeout(() => { textSpan.textContent = original; }, 2000);
        }
      }).catch(() => {
        prompt('Сумма для ввода в банке:', selectedAmount.toString());
      });
    });
  }

  // Record donation action
  const recordBtn = document.getElementById('btn-record-donation');
  if (recordBtn) {
    recordBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('donor-name-input');
      const deptSelect = document.getElementById('donor-dept-select');
      
      const name = nameInput ? (nameInput.value.trim() || 'Сотрудник Ozon') : 'Сотрудник Ozon';
      const dept = deptSelect ? deptSelect.value : 'Ozon Tech';

      window.charityAnalytics.addDonation({
        name,
        dept,
        amount: selectedAmount,
        wish: 'Тепла и добра солнечным деткам!'
      });

      // Update UI
      updateCampaignProgress();
      renderLeaderboard();
      drawPostcard(name);
      triggerFestiveConfetti();

      // Button feedback
      const originalHtml = recordBtn.innerHTML;
      const checkSvg = '<svg class="icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
      recordBtn.innerHTML = `${checkSvg} <span>Зачтено в рейтинг ${escapeHtml(dept)}! Спасибо!</span>`;
      recordBtn.style.background = '#dcfce7';
      recordBtn.style.borderColor = '#86efac';

      setTimeout(() => {
        recordBtn.innerHTML = originalHtml;
        recordBtn.style.background = '';
        recordBtn.style.borderColor = '';
      }, 3500);
    });
  }
}

/* =========================================================
   6. FESTIVE CONFETTI EFFECT
   ========================================================= */
function triggerFestiveConfetti() {
  const count = 80;
  const container = document.body;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.width = Math.random() * 8 + 6 + 'px';
    el.style.height = Math.random() * 8 + 6 + 'px';
    el.style.backgroundColor = ['#005bff', '#f91155', '#ffb703', '#95c227', '#ffffff'][Math.floor(Math.random() * 5)];
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.pointerEvents = 'none';

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 280 + 140;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    el.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: Math.random() * 900 + 700,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    });

    container.appendChild(el);
    setTimeout(() => el.remove(), 1600);
  }
}

/* =========================================================
   7. COORDINATOR STATS DASHBOARD MODAL (XSS SANITIZED)
   ========================================================= */
function setupStatsModal() {
  const openBtn = document.getElementById('btn-open-stats-modal');
  const closeBtn = document.getElementById('btn-close-stats-modal');
  const modal = document.getElementById('stats-modal');
  const exportBtn = document.getElementById('btn-export-csv');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      refreshStatsDashboard();
      modal.classList.add('modal--active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('modal--active');
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('modal--active');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      window.charityAnalytics.exportCSV();
    });
  }
}

function refreshStatsDashboard() {
  const metrics = window.charityAnalytics.getMetrics();

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('dash-total-amount', formatRubles(metrics.totalDonated));
  setTxt('dash-donors-count', metrics.donationsCount);
  setTxt('dash-unique-visitors', metrics.uniqueVisitors);
  setTxt('dash-total-visits', metrics.totalVisits);

  const tbody = document.getElementById('dash-donations-tbody');
  if (tbody) {
    // 100% XSS Sanitized via escapeHtml
    tbody.innerHTML = metrics.donations.map(d => `
      <tr>
        <td><strong>${escapeHtml(d.id)}</strong></td>
        <td>${escapeHtml(d.date)}</td>
        <td>${escapeHtml(d.name)}</td>
        <td><span style="color: #005bff; font-weight: 600;">${escapeHtml(d.dept)}</span></td>
        <td style="font-weight: bold; color: #0f172a;">${formatRubles(d.amount)}</td>
      </tr>
    `).join('');
  }
}

/* =========================================================
   8. FOOTER HANDLERS (REMOVES INLINE JAVASCRIPT)
   ========================================================= */
function setupFooterLinks() {
  const statsLink = document.getElementById('footer-stats-link');
  if (statsLink) {
    statsLink.addEventListener('click', (e) => {
      e.preventDefault();
      refreshStatsDashboard();
      const modal = document.getElementById('stats-modal');
      if (modal) modal.classList.add('modal--active');
    });
  }
}

/* =========================================================
   9. URL PARAMS DETECTION
   ========================================================= */
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const team = urlParams.get('team');
  const view = urlParams.get('view');

  if (team) {
    const matched = OZON_DEPARTMENTS.find(d => d.toLowerCase().includes(team.toLowerCase()));
    if (matched) {
      selectDepartment(matched);
    }
  }

  if (view === 'stats') {
    const modal = document.getElementById('stats-modal');
    if (modal) {
      refreshStatsDashboard();
      modal.classList.add('modal--active');
    }
  }
}

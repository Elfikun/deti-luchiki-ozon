/**
 * Main Application Logic for Ozon & Дети-лучики Campaign
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

document.addEventListener('DOMContentLoaded', () => {
  initSnowEffect();
  initPostcardCanvas();
  updateCampaignProgress();
  renderLeaderboard();
  setupDonationForm();
  setupStatsModal();
  checkUrlParams();
});

/* =========================================================
   1. SNOWFALL CANVAS EFFECT
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
  });

  const flakesCount = 65;
  const flakes = [];

  for (let i = 0; i < flakesCount; i++) {
    flakes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.8 + 1,
      speedY: Math.random() * 1.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.6,
      opacity: Math.random() * 0.7 + 0.3
    });
  }

  function renderSnow() {
    if (!isSnowActive) {
      ctx.clearRect(0, 0, width, height);
      return;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';

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
  if (pctEl) pctEl.textContent = pct + '%';
  if (donorsEl) donorsEl.textContent = metrics.donationsCount + ' коллег';
  if (remainingEl) remainingEl.textContent = formatRubles(Math.max(0, CAMPAIGN_TARGET_RUB - total));
}

function formatRubles(val) {
  return new Intl.NumberFormat('ru-RU').format(val) + ' ₽';
}

/* =========================================================
   3. LEADERBOARD & DEPARTMENT CONTEST
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
    const dept = d.dept || 'Ozon Tech';
    if (!deptStats[dept]) {
      deptStats[dept] = { count: 0, total: 0 };
    }
    deptStats[dept].count += 1;
    deptStats[dept].total += d.amount;
  });

  // Sort descending by total amount
  const sorted = Object.keys(deptStats).map(name => ({
    name,
    total: deptStats[name].total,
    count: deptStats[name].count
  })).sort((a, b) => b.total - a.total);

  const maxTotal = sorted[0]?.total || 1;

  container.innerHTML = sorted.map((dept, index) => {
    const rank = index + 1;
    let rankBadge = `${rank}`;
    let rankClass = '';
    if (rank === 1) {
      rankBadge = '<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="#f59e0b"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';
      rankClass = 'gold';
    } else if (rank === 2) {
      rankBadge = '<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="#94a3b8"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';
      rankClass = 'silver';
    } else if (rank === 3) {
      rankBadge = '<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="#c2410c"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>';
      rankClass = 'bronze';
    }

    const fillPct = Math.round((dept.total / maxTotal) * 100);

    return `
      <div class="leader-row">
        <div class="leader-left">
          <div class="leader-rank ${rankClass}">${rankBadge}</div>
          <div class="leader-name-wrap">
            <div class="leader-name">${dept.name} <span style="font-size: 11px; color: #64748b; font-weight: normal;">(${dept.count} чел.)</span></div>
            <div class="leader-bar-track">
              <div class="leader-bar-fill" style="width: ${fillPct}%"></div>
            </div>
          </div>
        </div>
        <div class="leader-right">
          <div class="leader-amount">${formatRubles(dept.total)}</div>
          <button type="button" class="btn-support-team-clean" onclick="selectDepartment('${dept.name}')">
            Поддержать
          </button>
        </div>
      </div>
    `;
  }).join('');
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
   4. LIVE POSTCARD GENERATOR (HTML5 CANVAS)
   ========================================================= */
function initPostcardCanvas() {
  const canvas = document.getElementById('postcard-canvas');
  if (!canvas) return;
  drawPostcard('Сотрудник Ozon');

  const nameInput = document.getElementById('donor-name-input');
  if (nameInput) {
    nameInput.addEventListener('input', (e) => {
      const name = e.target.value.trim() || 'Сотрудник Ozon';
      drawPostcard(name);
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
  ctx.arc(sunX - 8, sunY - 4, 3, 0, Math.PI * 2); // left eye
  ctx.arc(sunX + 8, sunY - 4, 3, 0, Math.PI * 2); // right eye
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sunX, sunY + 4, 11, 0.1 * Math.PI, 0.9 * Math.PI); // smile
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Title in Comfortaa rounded style
  ctx.fillStyle = '#ffffff';
  ctx.font = "bold 20px 'Comfortaa', -apple-system, sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('С НОВЫМ ГОДОМ!', w / 2, 145);

  // Recipient Greeting
  ctx.fillStyle = '#95c227';
  ctx.font = "bold 15px 'Comfortaa', -apple-system, sans-serif";
  ctx.fillText(`Дорогой коллега: ${recipientName}!`, w / 2, 175);

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
  ctx.fillText('OZON ЗАБОТА  ×  ДЕТИ-ЛУЧИКИ', w / 2, 360);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px system-ui, sans-serif';
  ctx.fillText('Новогодний благотворительный сбор для сотрудников Ozon', w / 2, 375);
  ctx.fillText('OZON ЗАБОТА  ×  КРОО «ДЕТИ-ЛУЧИКИ»', w / 2, 360);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px system-ui, -apple-system, sans-serif';
  ctx.fillText('Специальный новогодний благотворительный сбор', w / 2, 375);
}

function drawMiniTree(ctx, x, y) {
  // Tree tiers (stylized hand-drawn children's style)
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
   5. INTERACTIVE TREE ORNAMENTS
   ========================================================= */
function renderTreeOrnaments() {
  const container = document.getElementById('tree-ornaments-layer');
  if (!container) return;

  const donations = window.charityAnalytics.getDonations();
  const colors = ['#f43f5e', '#005bff', '#facc15', '#10b981', '#a855f7', '#fb923c'];

  // Calculate coordinates roughly matching the pine tree shape
  const coords = [
    { top: 28, left: 49 },
    { top: 40, left: 38 },
    { top: 44, left: 58 },
    { top: 56, left: 32 },
    { top: 52, left: 47 },
    { top: 58, left: 66 },
    { top: 72, left: 24 },
    { top: 70, left: 41 },
    { top: 68, left: 56 },
    { top: 74, left: 74 },
    { top: 82, left: 33 },
    { top: 80, left: 50 },
    { top: 83, left: 65 }
  ];

  container.innerHTML = donations.slice(0, coords.length).map((d, i) => {
    const pos = coords[i];
    const color = colors[i % colors.length];
    return `
      <div class="tree-ornament" style="top: ${pos.top}%; left: ${pos.left}%; background: ${color};">
        <svg class="icon-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><polygon points="12 2 15 7 13 7 17 13 14 13 18 19 6 19 10 13 7 13 11 7 9 7 12 2"/><rect x="11" y="19" width="2" height="4" fill="#ffffff"/></svg>
        <div class="ornament-tooltip">
          <strong>${d.name}</strong> (${d.dept})<br>
          «${d.wish}»<br>
          <span style="color: #facc15; font-weight: bold;">+${formatRubles(d.amount)}</span>
        </div>
      </div>
    `;
  }).join('');
}

/* =========================================================
   6. SBP DYNAMIC QR & DONATION FORM HANDLER
   ========================================================= */

// Base QrId and bank assigned to КРОО «Дети-лучики»
const SBP_BASE_URL = 'https://qr.nspk.ru/AS1A004188F9QISE87DONIOS3GADGKH3?type=01&bank=100000000013';

/**
 * Standard CRC-16/CCITT-FALSE calculation required by NSPK for SBP URLs
 * Poly: 0x1021, Init: 0xFFFF
 */
function crc16Ccitt(str) {
  let crc = 0xFFFF;
  const poly = 0x1021;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    crc ^= (code << 8);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ poly) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc;
}

/**
 * Generates an official SBP URL with pre-filled amount in kopecks and valid CRC
 */
function generateSbpUrl(amountRubles) {
  const kopecks = Math.round(amountRubles * 100);
  const base = `${SBP_BASE_URL}&sum=${kopecks}`;
  const crcHex = crc16Ccitt(base).toString(16).toUpperCase().padStart(4, '0');
  return `${base}&crc=${crcHex}`;
}

let qrcodeInstance = null;
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

  // Always use the guaranteed, official SBP URL of the fund
  if (directBtn) directBtn.href = SBP_OFFICIAL_URL;

  if (container && typeof QRCode !== 'undefined') {
    container.innerHTML = '';
    qrcodeInstance = new QRCode(container, {
      text: SBP_OFFICIAL_URL,
      width: 140,
      height: 140,
      colorDark: '#1f2937',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

function setupDonationForm() {
  const presetBtns = document.querySelectorAll('.preset-btn');
  const customInput = document.getElementById('custom-amount-input');
  let selectedAmount = 1000;

  function updateAllAmounts() {
    updateSbpQr(selectedAmount);
  }

  // Initial render of SBP QR code
  updateAllAmounts();

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedAmount = parseInt(btn.dataset.amount, 10);
      if (customInput) customInput.value = '';
      updateAllAmounts();
    });
  });

  if (customInput) {
    customInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (val > 0) {
        presetBtns.forEach(b => b.classList.remove('active'));
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

      const newRecord = window.charityAnalytics.addDonation({
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
      recordBtn.innerHTML = `${checkSvg} <span>Зачтено в рейтинг ${dept}! Спасибо!</span>`;
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

function showSuccessModal(record) {
  const modal = document.getElementById('success-modal');
  if (!modal) return;
  const msgEl = document.getElementById('success-modal-msg');
  if (msgEl) {
    msgEl.innerHTML = `
      Спасибо, <strong>${record.name}</strong>!<br>
      Ваше пожертвование <strong>${formatRubles(record.amount)}</strong> добавлено в копилку 
      команды <strong>${record.dept}</strong>.<br>
      Ваш именной шар уже украшает виртуальную ёлку Ozon!
    `;
  }
  modal.classList.add('active');
}

function triggerFestiveConfetti() {
  // Simple CSS/Canvas confetti particle burst
  const count = 100;
  const container = document.body;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.zIndex = '9999';
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.width = Math.random() * 8 + 6 + 'px';
    el.style.height = Math.random() * 8 + 6 + 'px';
    el.style.backgroundColor = ['#005bff', '#f91155', '#ffb703', '#10b981', '#ffffff'][Math.floor(Math.random() * 5)];
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.pointerEvents = 'none';

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 300 + 150;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    el.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: Math.random() * 1000 + 800,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
    });

    container.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }
}

/* =========================================================
   7. COORDINATOR STATS DASHBOARD MODAL
   ========================================================= */
function setupStatsModal() {
  const openBtn = document.getElementById('btn-open-stats-modal');
  const closeBtn = document.getElementById('btn-close-stats-modal');
  const modal = document.getElementById('stats-modal');
  const exportBtn = document.getElementById('btn-export-csv');

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      refreshStatsDashboard();
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  // Close when clicking overlay
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });
  }

  const successModal = document.getElementById('success-modal');
  const successCloseBtn = document.getElementById('btn-close-success-modal');
  if (successModal && successCloseBtn) {
    successCloseBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
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
  setTxt('dash-avg-donation', formatRubles(metrics.avgDonation));
  setTxt('dash-conversion', metrics.conversionRate + '%');

  const tbody = document.getElementById('dash-donations-tbody');
  if (tbody) {
    tbody.innerHTML = metrics.donations.map(d => `
      <tr>
        <td><strong>${d.id}</strong></td>
        <td>${d.date}</td>
        <td>${d.name}</td>
        <td><span style="color: #005bff; font-weight: 600;">${d.dept}</span></td>
        <td style="font-weight: bold; color: #0f172a;">${formatRubles(d.amount)}</td>
      </tr>
    `).join('');
  }
}

/* =========================================================
   8. URL PARAMS DETECTION (E.G. UNIQUE LINK FOR OZON)
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
      modal.classList.add('active');
    }
  }
}

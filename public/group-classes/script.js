/* =============================================================
   INSIYT — group-classes/script.js

   BACKEND INTEGRATION GUIDE
   ─────────────────────────
   Search for these tags to find every hook:
     [BACKEND]  — replace stub with real API fetch
     [SQUARE]   — Square Web Payments SDK integration points
     [CONFIG]   — values you need to fill in

   API ENDPOINTS expected (all JSON):
     GET  /api/classes
          → [{ id, name, type, description, duration, price, spotsTotal, badge, color }]

     GET  /api/availability?classId=:id&month=:YYYY-MM
          → { available: ["YYYY-MM-DD", ...], unavailable: ["YYYY-MM-DD", ...] }

     GET  /api/slots?classId=:id&date=:YYYY-MM-DD
          → [{ time: "HH:MM", label: "10:00 AM", spotsLeft: 4, full: false }]

     POST /api/booking/hold
          body: { classId, date, time, firstName, lastName, email, phone }
          → { holdId, expiresAt }   (hold slot while payment processes)

     POST /api/payment/complete
          body: { holdId, paymentToken, promoCode? }
          → { success, bookingRef, amountCharged }

     POST /api/webhook/square
          Square sends payment confirmation here server-side.
          → confirm booking in DB, send confirmation email.

     POST /api/promo/validate
          body: { code, classId }
          → { valid, discount, type: "percent"|"fixed", finalPrice }

   DATABASE TABLES (SQL schema at bottom of this file)

   ============================================================= */

(function () {
'use strict';

/* ─────────────────────────────────────────
   [CONFIG] — FILL THESE IN
   ───────────────────────────────────────── */
var CONFIG = {
  SQUARE_APP_ID:       'YOUR_SQUARE_APP_ID',           // [SQUARE] sandbox: 'sandbox-sq0idb-...'
  SQUARE_LOCATION_ID:  'YOUR_SQUARE_LOCATION_ID',      // [SQUARE] from Square Dashboard
  SQUARE_ENV:          'sandbox',                      // [SQUARE] change to 'production' when live
  API_BASE:            '/api',                         // [BACKEND] your API base URL
  CURRENCY:            'USD',                          // payment currency
};

/* ─────────────────────────────────────────
   NAV
   ───────────────────────────────────────── */
var nav = document.getElementById('sitenav');
var ham = document.getElementById('ham');

window.addEventListener('scroll', function () {
  nav.classList.toggle('scrolled', window.scrollY > 55);
}, { passive: true });

ham.addEventListener('click', function (e) {
  e.stopPropagation();
  document.body.classList.toggle('nav-open');
});

document.addEventListener('click', function (e) {
  if (document.body.classList.contains('nav-open') &&
      !e.target.closest('#mobmenu') && !e.target.closest('#ham'))
    document.body.classList.remove('nav-open');
});

document.querySelectorAll('.mob-tog').forEach(function (t) {
  t.addEventListener('click', function (e) {
    e.preventDefault();
    var item = t.closest('.mob-item'), sub = item.querySelector('.mob-sub');
    var open = item.classList.contains('open');
    document.querySelectorAll('.mob-item.open').forEach(function (i) {
      i.classList.remove('open'); i.querySelector('.mob-sub').classList.remove('open');
      i.querySelector('.mob-tog-icon').textContent = '+';
    });
    if (!open) { item.classList.add('open'); sub.classList.add('open'); t.querySelector('.mob-tog-icon').textContent = '−'; }
  });
});

/* ─────────────────────────────────────────
   SMOOTH SCROLL
   ───────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var id = a.getAttribute('href');
    if (id === '#') return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - navH - 10, behavior: 'smooth' });
    history.pushState(null, '', id);
    document.body.classList.remove('nav-open');
  });
});

/* ─────────────────────────────────────────
   PROGRESS BAR
   ───────────────────────────────────────── */
var pgbar = document.getElementById('pgbar');
window.addEventListener('scroll', function () {
  var s = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
  pgbar.style.width = (h > 0 ? (s / h) * 100 : 0) + '%';
}, { passive: true });

/* ─────────────────────────────────────────
   SCROLL REVEAL
   ───────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  var ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        var d = parseInt(e.target.dataset.delay) || 0;
        setTimeout(function () { e.target.classList.add('in'); }, d);
        ro.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(function (el) { ro.observe(el); });
} else {
  document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(function (el) { el.classList.add('in'); });
}

/* ─────────────────────────────────────────
   PILL ACTIVE TRACKING
   ───────────────────────────────────────── */
var pills = document.querySelectorAll('.pill');
document.querySelectorAll('section[id]').forEach(function (sec) {
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting)
        pills.forEach(function (p) { p.classList.toggle('active', p.getAttribute('href') === '#' + e.target.id); });
    });
  }, { threshold: 0.2, rootMargin: '-64px 0px -35% 0px' }).observe(sec);
});

/* ─────────────────────────────────────────
   FAQ ACCORDION
   ───────────────────────────────────────── */
document.querySelectorAll('.faq-item').forEach(function (item) {
  item.querySelector('.faq-q').addEventListener('click', function () {
    var open = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(function (i) { i.classList.remove('open'); });
    if (!open) item.classList.add('open');
  });
});

/* ─────────────────────────────────────────
   FLOATING PARTICLES (hero)
   ───────────────────────────────────────── */
var particleEl = document.getElementById('particles');
if (particleEl) {
  for (var i = 0; i < 14; i++) {
    var p = document.createElement('span');
    var useSage = Math.random() > 0.65;
    var col = useSage
      ? 'rgba(107,128,96,' + (0.07 + Math.random() * 0.1).toFixed(3) + ')'
      : 'rgba(212,169,154,' + (0.1 + Math.random() * 0.13).toFixed(3) + ')';
    p.setAttribute('aria-hidden', 'true');
    p.style.cssText = [
      'position:absolute','bottom:-16px','border-radius:50%','pointer-events:none',
      'will-change:transform,opacity','animation:float-up linear infinite',
      'width:' + (4 + Math.random() * 9).toFixed(1) + 'px',
      'height:' + (4 + Math.random() * 9).toFixed(1) + 'px',
      'left:' + (2 + Math.random() * 96).toFixed(1) + '%',
      'animation-delay:' + (Math.random() * 18).toFixed(2) + 's',
      'animation-duration:' + (18 + Math.random() * 16).toFixed(2) + 's',
      'background:' + col
    ].join(';');
    particleEl.appendChild(p);
  }
}

/* ─────────────────────────────────────────
   CLASS CARDS — stagger in + selection
   ───────────────────────────────────────── */
var classCards = document.querySelectorAll('.class-card');
var classGrid  = document.querySelector('.classes-grid');

if (classGrid && 'IntersectionObserver' in window) {
  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting)
      classCards.forEach(function (c, i) { setTimeout(function () { c.classList.add('in'); }, i * 100); });
  }, { threshold: 0.05 }).observe(classGrid);
} else { classCards.forEach(function (c) { c.classList.add('in'); }); }

classCards.forEach(function (card) {
  card.querySelector('.class-book-btn') && card.querySelector('.class-book-btn').addEventListener('click', function (e) {
    e.preventDefault();
    var id   = card.dataset.classId;
    var name = card.dataset.className;
    var price = card.dataset.price;
    selectClassAndScroll(id, name, price);
  });
});

/* ─────────────────────────────────────────
   PRICING CARDS — stagger in
   ───────────────────────────────────────── */
var pricingCards = document.querySelectorAll('.pricing-card');
var pricingGrid  = document.querySelector('.pricing-grid');
if (pricingGrid && 'IntersectionObserver' in window) {
  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting)
      pricingCards.forEach(function (c, i) { setTimeout(function () { c.classList.add('in'); }, i * 110); });
  }, { threshold: 0.05 }).observe(pricingGrid);
} else { pricingCards.forEach(function (c) { c.classList.add('in'); }); }

/* ═══════════════════════════════════════════
   BOOKING FLOW ENGINE
   State machine: steps 1 → 6
   ═══════════════════════════════════════════ */
var state = {
  step:       1,
  classId:    null,
  className:  null,
  classPrice: null,
  classType:  null,
  date:       null,        // YYYY-MM-DD
  dateLabel:  null,        // "Monday, March 24"
  time:       null,        // "10:00"
  timeLabel:  null,        // "10:00 AM"
  spotsLeft:  null,
  firstName:  null,
  lastName:   null,
  email:      null,
  phone:      null,
  notes:      null,
  promoCode:  null,
  discount:   0,
  finalPrice: null,
  holdId:     null,        // [BACKEND] slot hold ID before payment
  bookingRef: null,        // [BACKEND] confirmed booking reference
};

/* Calendar state */
var calState = {
  year:       new Date().getFullYear(),
  month:      new Date().getMonth(),   // 0-indexed
  available:  [],
  unavailable: [],
};

var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/* DOM refs */
var stepIndicators = document.querySelectorAll('.booking-step');
var stepPanels     = document.querySelectorAll('.step-panel');

/* ── Go to step ── */
function goToStep(n) {
  state.step = n;
  stepIndicators.forEach(function (s, i) {
    var stepN = i + 1;
    s.classList.toggle('active',   stepN === n);
    s.classList.toggle('done',     stepN < n);
    s.classList.toggle('disabled', stepN > n);
  });
  stepPanels.forEach(function (p) {
    p.classList.toggle('active', p.dataset.step == n);
  });
  /* Scroll booking section into view */
  var bookSec = document.getElementById('book-a-class');
  if (bookSec) {
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    window.scrollTo({ top: bookSec.getBoundingClientRect().top + window.scrollY - navH - 10, behavior: 'smooth' });
  }
}

/* ── Select class and pre-fill step 1 ── */
function selectClassAndScroll(id, name, price) {
  state.classId    = id;
  state.className  = name;
  state.classPrice = parseFloat(price);
  state.finalPrice = parseFloat(price);
  /* Highlight selected card */
  classCards.forEach(function (c) { c.classList.toggle('selected', c.dataset.classId === id); });
  /* Pre-select in step 1 radio list */
  document.querySelectorAll('.class-radio-item').forEach(function (item) {
    item.classList.toggle('checked', item.dataset.classId === id);
  });
  updateSidebar();
  goToStep(2);
}

/* ── Update sidebar summary ── */
function updateSidebar() {
  var s = document.getElementById('sidebar-class-name');
  var d = document.getElementById('sidebar-date');
  var t = document.getElementById('sidebar-time');
  var pr = document.getElementById('sidebar-price');
  if (s) s.textContent = state.className || '—';
  if (d) d.textContent = state.dateLabel || '—';
  if (t) t.textContent = state.timeLabel || '—';
  if (pr) {
    var fp = state.finalPrice !== null ? state.finalPrice : state.classPrice;
    pr.textContent = fp !== null ? '$' + fp.toFixed(2) : '—';
  }
}

/* ═══════════════════
   STEP 1 — Class selection
   ═══════════════════ */
document.querySelectorAll('.class-radio-item').forEach(function (item) {
  item.addEventListener('click', function () {
    document.querySelectorAll('.class-radio-item').forEach(function (i) { i.classList.remove('checked'); });
    item.classList.add('checked');
    state.classId    = item.dataset.classId;
    state.className  = item.dataset.className;
    state.classPrice = parseFloat(item.dataset.price);
    state.finalPrice = state.classPrice;
    /* Sync class card highlights */
    classCards.forEach(function (c) { c.classList.toggle('selected', c.dataset.classId === state.classId); });
    updateSidebar();
  });
});

document.getElementById('step1-next') && document.getElementById('step1-next').addEventListener('click', function () {
  if (!state.classId) { alert('Please select a class to continue.'); return; }
  goToStep(2);
  loadAvailability();
});

/* ═══════════════════
   STEP 2 — Calendar
   ═══════════════════ */
function loadAvailability() {
  /* [BACKEND] — Replace this stub with real fetch:
     fetch(CONFIG.API_BASE + '/availability?classId=' + state.classId + '&month=' + calState.year + '-' + pad(calState.month+1))
       .then(function(r){ return r.json(); })
       .then(function(data){
         calState.available   = data.available;    // ["2025-04-05", "2025-04-07", ...]
         calState.unavailable = data.unavailable;  // ["2025-04-01", ...]
         renderCalendar();
       });
  */
  /* STUB — hardcode some available dates for UI preview */
  var today = new Date();
  calState.available = [];
  for (var d = 1; d <= 28; d++) {
    if (d % 3 !== 0) {  /* every 3rd day unavailable — replace with real data */
      var dd = new Date(calState.year, calState.month, d);
      if (dd >= today) calState.available.push(fmtDate(dd));
    }
  }
  calState.unavailable = [];
  renderCalendar();
}

function renderCalendar() {
  var grid = document.getElementById('cal-grid');
  var monthLabel = document.getElementById('cal-month-label');
  if (!grid) return;
  monthLabel.textContent = MONTHS[calState.month] + ' ' + calState.year;
  grid.innerHTML = '';

  /* Day-of-week headers */
  DAYS.forEach(function (d) {
    var el = document.createElement('div');
    el.className = 'cal-dow'; el.textContent = d;
    grid.appendChild(el);
  });

  var firstDay = new Date(calState.year, calState.month, 1).getDay();
  var daysInMonth = new Date(calState.year, calState.month + 1, 0).getDate();
  var today = new Date(); today.setHours(0,0,0,0);

  /* Empty cells */
  for (var e = 0; e < firstDay; e++) {
    var empty = document.createElement('div');
    empty.className = 'cal-day empty';
    grid.appendChild(empty);
  }

  /* Day cells */
  for (var dd = 1; dd <= daysInMonth; dd++) {
    var date = new Date(calState.year, calState.month, dd);
    var dateStr = fmtDate(date);
    var el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = dd;

    var isPast = date < today;
    var isToday = date.toDateString() === today.toDateString();
    var isAvail = calState.available.indexOf(dateStr) > -1;
    var isUnavail = calState.unavailable.indexOf(dateStr) > -1;
    var isSelected = dateStr === state.date;

    if (isPast)       el.classList.add('past');
    else if (isUnavail) el.classList.add('unavailable');
    else if (isAvail) el.classList.add('has-slots');
    if (isToday)      el.classList.add('today');
    if (isSelected)   el.classList.add('selected');

    if (!isPast && !isUnavail && isAvail) {
      el.addEventListener('click', function (d, ds) {
        return function () {
          state.date = ds;
          state.dateLabel = formatDateLabel(new Date(calState.year, calState.month, d));
          renderCalendar();
          updateSidebar();
        };
      }(dd, dateStr));
    }

    grid.appendChild(el);
  }
}

/* Calendar prev/next month */
document.getElementById('cal-prev') && document.getElementById('cal-prev').addEventListener('click', function () {
  calState.month--;
  if (calState.month < 0) { calState.month = 11; calState.year--; }
  loadAvailability();
});
document.getElementById('cal-next') && document.getElementById('cal-next').addEventListener('click', function () {
  calState.month++;
  if (calState.month > 11) { calState.month = 0; calState.year++; }
  loadAvailability();
});

document.getElementById('step2-next') && document.getElementById('step2-next').addEventListener('click', function () {
  if (!state.date) { alert('Please select a date.'); return; }
  goToStep(3);
  loadSlots();
});
document.getElementById('step2-back') && document.getElementById('step2-back').addEventListener('click', function () { goToStep(1); });

/* ═══════════════════
   STEP 3 — Time slots
   ═══════════════════ */
function loadSlots() {
  var container = document.getElementById('slots-grid');
  var dateLabel = document.getElementById('slots-date-label');
  if (!container) return;
  if (dateLabel) dateLabel.textContent = state.dateLabel;
  container.innerHTML = '<div class="slots-loading"><span class="spinner"></span> Loading times…</div>';

  /* [BACKEND] — Replace this stub:
     fetch(CONFIG.API_BASE + '/slots?classId=' + state.classId + '&date=' + state.date)
       .then(function(r){ return r.json(); })
       .then(function(slots){ renderSlots(slots); });
  */
  /* STUB — simulate async load */
  setTimeout(function () {
    var stubSlots = [
      { time: '09:00', label: '9:00 AM',  spotsLeft: 6, full: false },
      { time: '10:30', label: '10:30 AM', spotsLeft: 2, full: false },
      { time: '12:00', label: '12:00 PM', spotsLeft: 0, full: true  },
      { time: '14:00', label: '2:00 PM',  spotsLeft: 8, full: false },
      { time: '16:00', label: '4:00 PM',  spotsLeft: 4, full: false },
      { time: '18:00', label: '6:00 PM',  spotsLeft: 1, full: false },
    ];
    renderSlots(stubSlots);
  }, 800);
}

function renderSlots(slots) {
  var container = document.getElementById('slots-grid');
  container.innerHTML = '';
  container.className = 'slots-grid';
  if (!slots.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:.9rem;">No times available for this date.</p>';
    return;
  }
  slots.forEach(function (slot) {
    var btn = document.createElement('button');
    btn.className = 'slot-btn' + (slot.full ? ' full' : '') + (slot.time === state.time ? ' selected' : '');
    btn.disabled = slot.full;
    btn.innerHTML = '<span class="slot-btn-time">' + slot.label + '</span>' +
      '<span class="slot-btn-avail">' + (slot.full ? 'Full' : slot.spotsLeft + ' left') + '</span>';
    if (!slot.full) {
      btn.addEventListener('click', function () {
        state.time      = slot.time;
        state.timeLabel = slot.label;
        state.spotsLeft = slot.spotsLeft;
        document.querySelectorAll('.slot-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        updateSidebar();
      });
    }
    container.appendChild(btn);
  });
}

document.getElementById('step3-next') && document.getElementById('step3-next').addEventListener('click', function () {
  if (!state.time) { alert('Please select a time slot.'); return; }
  goToStep(4);
});
document.getElementById('step3-back') && document.getElementById('step3-back').addEventListener('click', function () { goToStep(2); });

/* ═══════════════════
   STEP 4 — Details form + promo
   ═══════════════════ */
document.getElementById('step4-next') && document.getElementById('step4-next').addEventListener('click', function () {
  if (!validateForm()) return;
  /* Collect values */
  state.firstName = document.getElementById('f-fname').value.trim();
  state.lastName  = document.getElementById('f-lname').value.trim();
  state.email     = document.getElementById('f-email').value.trim();
  state.phone     = document.getElementById('f-phone').value.trim();
  state.notes     = document.getElementById('f-notes').value.trim();

  /* [BACKEND] — Hold the slot before taking payment:
     fetch(CONFIG.API_BASE + '/booking/hold', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         classId: state.classId, date: state.date, time: state.time,
         firstName: state.firstName, lastName: state.lastName,
         email: state.email, phone: state.phone
       })
     })
     .then(function(r){ return r.json(); })
     .then(function(data){
       state.holdId = data.holdId;
       goToStep(5);
       initSquarePayment();
     });
  */
  /* STUB — skip hold, go straight to payment */
  state.holdId = 'STUB_HOLD_' + Date.now();
  goToStep(5);
  initSquarePayment();
});
document.getElementById('step4-back') && document.getElementById('step4-back').addEventListener('click', function () { goToStep(3); });

/* Promo code */
document.getElementById('promo-apply') && document.getElementById('promo-apply').addEventListener('click', function () {
  var code = document.getElementById('promo-input').value.trim().toUpperCase();
  if (!code) return;
  var okEl  = document.getElementById('promo-ok');
  var errEl = document.getElementById('promo-err');
  okEl.style.display = errEl.style.display = 'none';

  /* [BACKEND] — Validate promo:
     fetch(CONFIG.API_BASE + '/promo/validate', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ code: code, classId: state.classId })
     })
     .then(function(r){ return r.json(); })
     .then(function(data){
       if (data.valid) {
         state.promoCode  = code;
         state.discount   = data.discount;
         state.finalPrice = data.finalPrice;
         okEl.textContent = '✓ ' + (data.type === 'percent' ? data.discount + '% off' : '$' + data.discount + ' off') + ' applied';
         okEl.style.display = 'block';
         updateSidebar();
       } else {
         errEl.textContent = 'Invalid promo code.';
         errEl.style.display = 'block';
       }
     });
  */
  /* STUB — accept "INSIYT10" for 10% off */
  if (code === 'INSIYT10') {
    state.promoCode  = code;
    state.discount   = 10;
    state.finalPrice = parseFloat((state.classPrice * 0.9).toFixed(2));
    okEl.textContent = '✓ 10% off applied'; okEl.style.display = 'block';
    updateSidebar();
  } else {
    errEl.textContent = 'Invalid promo code.'; errEl.style.display = 'block';
  }
});

function validateForm() {
  var valid = true;
  var fields = [
    { id: 'f-fname', msg: 'First name is required.' },
    { id: 'f-lname', msg: 'Last name is required.' },
    { id: 'f-email', msg: 'A valid email is required.', type: 'email' },
    { id: 'f-phone', msg: 'Phone number is required.' },
  ];
  fields.forEach(function (f) {
    var el = document.getElementById(f.id);
    var wrap = el.closest('.form-field');
    var val = el.value.trim();
    var ok = val.length > 0;
    if (f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    wrap.classList.toggle('has-error', !ok);
    if (!ok) valid = false;
  });
  var terms = document.getElementById('f-terms');
  if (terms && !terms.checked) {
    alert('Please agree to the terms and conditions.');
    valid = false;
  }
  return valid;
}

/* ═══════════════════
   STEP 5 — Square Payment
   ═══════════════════ */
var squarePayments = null;
var squareCard     = null;

function initSquarePayment() {
  /* Update amount shown */
  var amountEl = document.getElementById('payment-amount');
  if (amountEl) {
    var fp = state.finalPrice !== null ? state.finalPrice : state.classPrice;
    amountEl.textContent = '$' + (fp || 0).toFixed(2);
  }

  /* [SQUARE] — Load Square Web Payments SDK
     1. Add this script to index.html <head> for sandbox:
        <script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
        For production:
        <script src="https://web.squarecdn.com/v1/square.js"></script>

     2. Then this init code works:

     if (!window.Square) { console.error('Square.js not loaded'); return; }
     Square.payments(CONFIG.SQUARE_APP_ID, CONFIG.SQUARE_LOCATION_ID)
       .then(function(payments) {
         squarePayments = payments;
         return payments.card();
       })
       .then(function(card) {
         squareCard = card;
         return card.attach('#square-card-container');
       })
       .catch(function(err) {
         console.error('Square init error:', err);
         document.getElementById('payment-error').textContent = 'Payment form could not be loaded. Please try again.';
         document.getElementById('payment-error').classList.add('visible');
       });
  */

  /* STUB — show placeholder until SDK is wired in */
  var container = document.getElementById('square-card-container');
  if (container && !container.hasChildNodes()) {
    container.innerHTML = '<div style="padding:1.25rem;font-size:.82rem;color:var(--muted);text-align:center;line-height:1.6;">' +
      '[ Square card form loads here ]<br>' +
      '<small>Add Square.js SDK to &lt;head&gt; and fill in APP_ID + LOCATION_ID in script.js CONFIG</small>' +
      '</div>';
  }
}

document.getElementById('step5-pay') && document.getElementById('step5-pay').addEventListener('click', function () {
  var errEl = document.getElementById('payment-error');
  errEl.classList.remove('visible');
  var btn = document.getElementById('step5-pay');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Processing…';

  /* [SQUARE] — Tokenize card and charge:
     squareCard.tokenize()
       .then(function(result) {
         if (result.status === 'OK') {
           return fetch(CONFIG.API_BASE + '/payment/complete', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               holdId:     state.holdId,
               paymentToken: result.token,
               promoCode:  state.promoCode,
             })
           });
         } else {
           throw new Error(result.errors.map(function(e){ return e.message; }).join(', '));
         }
       })
       .then(function(r){ return r.json(); })
       .then(function(data) {
         if (data.success) {
           state.bookingRef = data.bookingRef;
           showConfirmation();
         } else {
           throw new Error(data.message || 'Payment failed.');
         }
       })
       .catch(function(err) {
         errEl.textContent = err.message || 'Payment failed. Please try again.';
         errEl.classList.add('visible');
         btn.disabled = false;
         btn.textContent = 'Complete Payment';
       });
  */

  /* STUB — simulate success */
  setTimeout(function () {
    state.bookingRef = 'INSIYT-' + Math.random().toString(36).substr(2,8).toUpperCase();
    showConfirmation();
  }, 1800);
});

document.getElementById('step5-back') && document.getElementById('step5-back').addEventListener('click', function () {
  goToStep(4);
  document.getElementById('step5-pay').disabled = false;
  document.getElementById('step5-pay').textContent = 'Complete Payment';
});

/* ═══════════════════
   STEP 6 — Confirmation
   ═══════════════════ */
function showConfirmation() {
  /* Fill confirmation details */
  var map = {
    'conf-class':    state.className,
    'conf-date':     state.dateLabel,
    'conf-time':     state.timeLabel,
    'conf-name':     state.firstName + ' ' + state.lastName,
    'conf-email':    state.email,
    'conf-amount':   '$' + (state.finalPrice || state.classPrice || 0).toFixed(2),
    'conf-ref':      state.bookingRef,
  };
  Object.keys(map).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = map[id] || '—';
  });
  goToStep(6);
}

document.getElementById('conf-book-another') && document.getElementById('conf-book-another').addEventListener('click', function () {
  /* Reset state */
  state.step = 1; state.classId = null; state.className = null; state.classPrice = null;
  state.date = null; state.dateLabel = null; state.time = null; state.timeLabel = null;
  state.firstName = state.lastName = state.email = state.phone = state.notes = null;
  state.promoCode = null; state.discount = 0; state.finalPrice = null;
  state.holdId = null; state.bookingRef = null;
  classCards.forEach(function (c) { c.classList.remove('selected'); });
  document.querySelectorAll('.class-radio-item').forEach(function (i) { i.classList.remove('checked'); });
  goToStep(1);
  updateSidebar();
});

/* ── Helpers ── */
function fmtDate(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function formatDateLabel(d) {
  var days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate();
}

/* ── Init ── */
goToStep(1);
updateSidebar();

})();


/* ═══════════════════════════════════════════════════════════
   SQL SCHEMA — copy into your database migration
   Works with PostgreSQL / MySQL / SQLite (minor syntax diffs)

   CREATE TABLE classes (
     id            SERIAL PRIMARY KEY,
     name          VARCHAR(120) NOT NULL,
     type          VARCHAR(60),          -- 'group' | 'private' | 'workshop'
     description   TEXT,
     duration_min  INT,
     price_cents   INT NOT NULL,         -- store in cents, divide by 100 to display
     spots_total   INT DEFAULT 10,
     badge         VARCHAR(40),          -- 'Popular' | 'New' | null
     active        BOOLEAN DEFAULT TRUE,
     created_at    TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE schedules (
     id            SERIAL PRIMARY KEY,
     class_id      INT REFERENCES classes(id),
     date          DATE NOT NULL,
     start_time    TIME NOT NULL,
     end_time      TIME NOT NULL,
     spots_booked  INT DEFAULT 0,
     available     BOOLEAN DEFAULT TRUE,
     created_at    TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE bookings (
     id            SERIAL PRIMARY KEY,
     booking_ref   VARCHAR(20) UNIQUE NOT NULL,  -- e.g. INSIYT-A3F7K2
     schedule_id   INT REFERENCES schedules(id),
     first_name    VARCHAR(60) NOT NULL,
     last_name     VARCHAR(60) NOT NULL,
     email         VARCHAR(120) NOT NULL,
     phone         VARCHAR(30),
     notes         TEXT,
     promo_code    VARCHAR(30),
     price_cents   INT,                           -- final charged amount
     status        VARCHAR(20) DEFAULT 'pending', -- pending | confirmed | cancelled
     square_payment_id VARCHAR(80),               -- Square payment ID
     hold_id       VARCHAR(80),                   -- slot hold ID (short-lived)
     hold_expires  TIMESTAMP,
     created_at    TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE promo_codes (
     id            SERIAL PRIMARY KEY,
     code          VARCHAR(30) UNIQUE NOT NULL,
     discount_type VARCHAR(10) NOT NULL,   -- 'percent' | 'fixed'
     discount_val  NUMERIC(6,2) NOT NULL,  -- e.g. 10.00 = 10% or $10
     max_uses      INT,                    -- NULL = unlimited
     uses_count    INT DEFAULT 0,
     expires_at    TIMESTAMP,
     active        BOOLEAN DEFAULT TRUE
   );

   -- Index for fast availability queries
   CREATE INDEX idx_schedules_class_date ON schedules(class_id, date);
   CREATE INDEX idx_bookings_email       ON bookings(email);
   CREATE INDEX idx_bookings_ref         ON bookings(booking_ref);

   ═══════════════════════════════════════════════════════════ */
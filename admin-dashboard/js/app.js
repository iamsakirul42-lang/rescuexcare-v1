/* ============================================
   rescueX Admin Dashboard — JavaScript
   ============================================ */
(function() {
  'use strict';

  const state = {
    isLoggedIn: false,
    currentPage: 'dashboard'
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ---- Login ----
  function initLogin() {
    const loginForm = $('#login-form');
    const loginPage = $('#login-page');
    const layout = $('#admin-layout');

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loginPage.classList.remove('active');
      layout.classList.remove('hidden');
      state.isLoggedIn = true;
      showToast('Successfully logged in as Admin');
      initCharts();
    });

    $('#admin-logout').addEventListener('click', () => {
      layout.classList.add('hidden');
      loginPage.classList.add('active');
      state.isLoggedIn = false;
      showToast('Logged out');
    });
  }

  // ---- Sidebar Navigation ----
  function initNavigation() {
    const sidebarItems = $$('.sidebar-item[data-page]');
    const breadcrumb = $('#breadcrumb');

    sidebarItems.forEach(item => {
      item.addEventListener('click', () => {
        const pageId = item.dataset.page;
        
        // Update active states
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        $$('.page').forEach(p => p.classList.remove('active'));
        $(`#page-${pageId}`).classList.add('active');

        // Update breadcrumb
        const title = item.querySelector('span').textContent;
        breadcrumb.innerHTML = `<span>${title}</span>`;
        state.currentPage = pageId;
      });
    });

    // Sidebar Toggle
    $('#sidebar-toggle').addEventListener('click', () => {
      $('#sidebar').classList.toggle('collapsed');
    });
  }

  // ---- Charts (Chart.js) ----
  function initCharts() {
    // Colors from design tokens
    const cAccent = '#F97316';
    const cAccentLight = 'rgba(249, 115, 22, 0.1)';
    const cBlue = '#3B82F6';
    const cGreen = '#22C55E';
    const cPurple = '#8B5CF6';

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#F3F4F6' }, border: { display: false } },
        x: { grid: { display: false }, border: { display: false } }
      }
    };

    // Dashboard Revenue Chart
    const revCtx = $('#revenue-chart');
    if (revCtx) {
      new Chart(revCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Revenue',
            data: [42000, 51000, 48000, 62000, 75000, 89000, 84000],
            borderColor: cAccent,
            backgroundColor: cAccentLight,
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }]
        },
        options: commonOptions
      });
    }

    // Dashboard Bookings Chart
    const bookCtx = $('#bookings-chart');
    if (bookCtx) {
      new Chart(bookCtx, {
        type: 'bar',
        data: {
          labels: ['Bike', 'Car', 'Auto', 'Truck'],
          datasets: [{
            data: [145, 289, 87, 42],
            backgroundColor: [cBlue, cAccent, cGreen, cPurple],
            borderRadius: 6
          }]
        },
        options: {
          ...commonOptions,
          plugins: { legend: { display: false } },
          scales: {
            y: { display: false },
            x: { grid: { display: false }, border: { display: false } }
          }
        }
      });
    }

    // Revenue Trend Chart (Revenue Page)
    const revTrendCtx = $('#revenue-trend-chart');
    if (revTrendCtx) {
      new Chart(revTrendCtx, {
        type: 'line',
        data: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [{
            data: [250000, 310000, 280000, 420000],
            borderColor: cGreen,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true
          }]
        },
        options: commonOptions
      });
    }

    // Analytics Signups
    const signupCtx = $('#signups-chart');
    if (signupCtx) {
      new Chart(signupCtx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            data: [500, 800, 1200, 1900, 2500, 3100],
            borderColor: cBlue, borderWidth: 3, tension: 0.4
          }]
        },
        options: commonOptions
      });
    }
  }

  // ---- Date formatting ----
  function setDate() {
    const el = $('#dashboard-date');
    if (el) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      el.textContent = new Date().toLocaleDateString('en-US', options);
    }
  }

  // ---- Toast Notification ----
  function showToast(message) {
    const toast = $('#admin-toast');
    $('#admin-toast-msg').textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
  }

  // ---- Modal Handling ----
  function initModals() {
    const overlay = $('#modal-overlay');
    const closeBtn = $('#modal-close');

    $$('.action-btn.view').forEach(btn => {
      btn.addEventListener('click', () => {
        $('#modal-title').textContent = 'User Details';
        $('#modal-body').innerHTML = '<p style="color: #6B7280;">Detailed view would appear here showing full profile, history, and analytics for this specific record.</p>';
        overlay.classList.remove('hidden');
        overlay.classList.add('active');
      });
    });

    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.classList.add('hidden'), 300);
    });
  }

  // ---- Mock Actions ----
  function initMockActions() {
    $$('.action-btn.block').forEach(btn => btn.addEventListener('click', () => showToast('User blocked')));
    $$('.action-btn.unblock').forEach(btn => btn.addEventListener('click', () => showToast('User unblocked')));
    $$('.btn-admin-danger').forEach(btn => btn.addEventListener('click', () => showToast('Action Rejected')));
    $$('.btn-admin-success').forEach(btn => btn.addEventListener('click', () => showToast('Action Approved')));
    $$('.btn-admin-primary, .btn-admin-outline').forEach(btn => {
      if (btn.type !== 'submit') {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          showToast('Action executed');
        });
      }
    });
  }

  // ---- Init ----
  function init() {
    initLogin();
    initNavigation();
    setDate();
    initModals();
    initMockActions();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

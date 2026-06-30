/* ============================================
   rescueX User App — JavaScript
   ============================================ */

(function() {
  'use strict';

  // ---- State ----
  const state = {
    currentScreen: 'splash-screen',
    selectedVehicle: null,
    selectedIssue: null,
    onboardingIndex: 0,
    phone: '',
    otp: ['', '', '', ''],
    rating: 0,
  };

  // ---- DOM Helpers ----
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ---- Screen Navigation ----
  function navigateTo(screenId, reverse = false) {
    const current = $(`#${state.currentScreen}`);
    const next = $(`#${screenId}`);
    if (!current || !next || screenId === state.currentScreen) return;

    current.classList.remove('active');
    current.classList.add(reverse ? 'slide-out-right' : 'slide-out-left');

    next.style.transform = reverse ? 'translateX(-30px)' : 'translateX(30px)';
    next.classList.add('active');

    setTimeout(() => {
      current.classList.remove('slide-out-left', 'slide-out-right');
      current.style.transform = '';
    }, 350);

    state.currentScreen = screenId;
  }

  // ---- Update Clock ----
  function updateClock() {
    const timeEl = $('#status-time');
    if (timeEl) {
      const now = new Date();
      timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
  }

  // ---- Splash Screen ----
  function initSplash() {
    setTimeout(() => navigateTo('onboarding-screen'), 2800);
  }

  // ---- Onboarding ----
  function initOnboarding() {
    const nextBtn = $('#onboarding-next-btn');
    const skipBtn = $('#onboarding-skip-btn');
    const slides = $$('.onboarding-slide');
    const dots = $$('.dot', $('#onboarding-dots'));

    nextBtn.addEventListener('click', () => {
      if (state.onboardingIndex < slides.length - 1) {
        slides[state.onboardingIndex].classList.remove('active');
        slides[state.onboardingIndex].classList.add('exit-left');
        state.onboardingIndex++;
        slides[state.onboardingIndex].classList.add('active');
        dots.forEach((d, i) => d.classList.toggle('active', i === state.onboardingIndex));
        if (state.onboardingIndex === slides.length - 1) {
          nextBtn.textContent = 'Continue';
        }
        setTimeout(() => {
          slides.forEach(s => s.classList.remove('exit-left'));
        }, 400);
      } else {
        navigateTo('auth-screen');
      }
    });

    skipBtn.addEventListener('click', () => navigateTo('auth-screen'));
  }

  // ---- Auth ----
  function initAuth() {
    const phoneInput = $('#phone-input');
    const sendOtpBtn = $('#send-otp-btn');
    const phoneForm = $('#auth-phone-form');
    const otpForm = $('#auth-otp-form');
    const otpBoxes = $$('.otp-box');
    const verifyBtn = $('#verify-otp-btn');
    const otpDisplay = $('#otp-phone-display');
    const resendTimer = $('#resend-timer');
    const resendBtn = $('#resend-btn');
    const authBackBtn = $('#auth-back-btn');

    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
      state.phone = e.target.value;
      sendOtpBtn.disabled = state.phone.length !== 10;
    });

    sendOtpBtn.addEventListener('click', () => {
      phoneForm.classList.add('hidden');
      otpForm.classList.remove('hidden');
      otpDisplay.textContent = `+91 ${state.phone}`;
      otpBoxes[0].focus();
      startResendTimer();
    });

    otpBoxes.forEach((box, i) => {
      box.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        state.otp[i] = e.target.value;
        if (e.target.value && i < otpBoxes.length - 1) {
          otpBoxes[i + 1].focus();
        }
        verifyBtn.disabled = state.otp.some(v => !v);
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && i > 0) {
          otpBoxes[i - 1].focus();
        }
      });
    });

    verifyBtn.addEventListener('click', () => {
      showToast('✓ Logged in successfully');
      navigateTo('home-screen');
    });

    authBackBtn.addEventListener('click', () => {
      if (!otpForm.classList.contains('hidden')) {
        otpForm.classList.add('hidden');
        phoneForm.classList.remove('hidden');
        otpBoxes.forEach(b => b.value = '');
        state.otp = ['', '', '', ''];
      } else {
        navigateTo('onboarding-screen', true);
      }
    });

    function startResendTimer() {
      let seconds = 30;
      resendTimer.classList.remove('hidden');
      resendBtn.classList.add('hidden');
      const interval = setInterval(() => {
        seconds--;
        resendTimer.textContent = `Resend OTP in ${seconds}s`;
        if (seconds <= 0) {
          clearInterval(interval);
          resendTimer.classList.add('hidden');
          resendBtn.classList.remove('hidden');
        }
      }, 1000);
    }

    resendBtn.addEventListener('click', () => {
      showToast('OTP resent');
      startResendTimer();
    });
  }

  // ---- Home Dashboard ----
  function initHome() {
    const vehicleCards = $$('.vehicle-card', $('#vehicle-grid'));
    vehicleCards.forEach(card => {
      card.addEventListener('click', () => {
        state.selectedVehicle = card.dataset.vehicle;
        navigateTo('vehicle-select-screen');
      });
    });

    $('#home-notif-btn').addEventListener('click', () => navigateTo('notifications-screen'));
    $('#view-all-bookings').addEventListener('click', () => {
      navigateTo('bookings-screen');
      activateBottomNav('bookings');
    });
  }

  // ---- Vehicle Selection ----
  function initVehicleSelect() {
    const cards = $$('.vehicle-select-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.selectedVehicle = card.dataset.vehicle;
        updateVehicleChip();
        setTimeout(() => navigateTo('book-screen'), 300);
      });
    });
  }

  function updateVehicleChip() {
    const chipIcon = $('.chip-icon');
    const chipLabel = $('.chip-label');
    const icons = { bike: '🏍️', car: '🚗', auto: '🛺', truck: '🚛' };
    const labels = { bike: 'Bike', car: 'Car', auto: 'Auto', truck: 'Truck' };
    if (chipIcon && chipLabel && state.selectedVehicle) {
      chipIcon.textContent = icons[state.selectedVehicle] || '🚗';
      chipLabel.textContent = labels[state.selectedVehicle] || 'Car';
    }
  }

  // ---- Book Assistance ----
  function initBooking() {
    const issueChips = $$('.issue-chip');
    issueChips.forEach(chip => {
      chip.addEventListener('click', () => {
        issueChips.forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        state.selectedIssue = chip.dataset.issue;
      });
    });

    $('#change-vehicle-btn').addEventListener('click', () => navigateTo('vehicle-select-screen', true));

    $('#confirm-booking-btn').addEventListener('click', () => {
      if (!state.selectedIssue) {
        showToast('⚠️ Please select an issue');
        return;
      }
      navigateTo('booking-status-screen');
      // Simulate mechanic found after 3 seconds
      setTimeout(() => {
        showToast('✓ Mechanic found!');
        setTimeout(() => navigateTo('tracking-screen'), 800);
      }, 3000);
    });
  }

  // ---- Tracking ----
  function initTracking() {
    $('#tracking-back-btn').addEventListener('click', () => navigateTo('home-screen', true));
  }

  // ---- Booking Status ----
  function initBookingStatus() {
    $('#cancel-booking-btn').addEventListener('click', () => {
      showToast('Booking cancelled');
      navigateTo('home-screen', true);
    });
  }

  // ---- Payment ----
  function initPayment() {
    const payBtn = $('#pay-now-btn');
    const rateCard = $('#rate-mechanic-card');

    payBtn.addEventListener('click', () => {
      payBtn.textContent = 'Processing...';
      payBtn.disabled = true;
      setTimeout(() => {
        payBtn.textContent = '✓ Payment Successful';
        payBtn.style.background = '#22C55E';
        showToast('✓ Payment successful!');
        rateCard.classList.remove('hidden');
      }, 1500);
    });

    // Star rating
    const stars = $$('.star');
    stars.forEach(star => {
      star.addEventListener('click', () => {
        state.rating = parseInt(star.dataset.star);
        stars.forEach((s, i) => {
          s.classList.toggle('active', i < state.rating);
        });
      });
    });

    $('#submit-rating-btn').addEventListener('click', () => {
      showToast(`Thanks! You rated ${state.rating} stars`);
      setTimeout(() => navigateTo('home-screen'), 800);
    });
  }

  // ---- Bookings History ----
  function initBookingsHistory() {
    const tabs = $$('.tab', $('#bookings-tabs'));
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        $$('.tab-content').forEach(tc => tc.classList.remove('active'));
        $(`#tab-${tab.dataset.tab}`).classList.add('active');
      });
    });

    $('#track-booking-btn').addEventListener('click', () => navigateTo('tracking-screen'));
  }

  // ---- Bottom Nav ----
  function initBottomNavs() {
    const allNavItems = $$('.nav-item');
    allNavItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        activateBottomNav(tab);
        const screenMap = {
          home: 'home-screen',
          bookings: 'bookings-screen',
          notifications: 'notifications-screen',
          profile: 'profile-screen',
        };
        if (screenMap[tab]) navigateTo(screenMap[tab]);
      });
    });
  }

  function activateBottomNav(tab) {
    $$('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tab);
    });
  }

  // ---- Back Buttons ----
  function initBackButtons() {
    $$('.back-btn[data-back]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.back, true));
    });
  }

  // ---- Profile ----
  function initProfile() {
    $('#logout-btn').addEventListener('click', () => {
      showToast('Logged out');
      navigateTo('auth-screen');
    });
  }

  // ---- Toast ----
  function showToast(message) {
    const toast = $('#toast');
    const toastMsg = $('.toast-message', toast);
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 250);
    }, 2500);
  }

  // ---- Init ----
  function init() {
    updateClock();
    setInterval(updateClock, 30000);
    initSplash();
    initOnboarding();
    initAuth();
    initHome();
    initVehicleSelect();
    initBooking();
    initTracking();
    initBookingStatus();
    initPayment();
    initBookingsHistory();
    initBottomNavs();
    initBackButtons();
    initProfile();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

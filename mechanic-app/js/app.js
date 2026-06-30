/* ============================================
   rescueX Expert App — JavaScript
   Onboarding + Dashboard Logic
   ============================================ */

(function() {
  'use strict';

  // ---- Storage Key ----
  const STORAGE_KEY = 'rescuex_expert_onboarding';
  const APP_STATE_KEY = 'rescuex_expert_state';

  // ---- Onboarding Steps ----
  const STEPS = [
    'ob-welcome',      // 0
    'ob-personal',     // 1
    'ob-address',      // 2
    'ob-vehicle',      // 3
    'ob-services',     // 4
    'ob-experience',   // 5
    'ob-documents',    // 6
    'ob-bank',         // 7
    'ob-emergency',    // 8
    'ob-review',       // 9
    'ob-success'       // 10
  ];

  // ---- Service Labels ----
  const SERVICE_LABELS = {
    flat_tyre: 'Flat Tyre',
    battery_jump: 'Battery Jump Start',
    fuel_delivery: 'Fuel Delivery',
    engine_repair: 'Engine Repair',
    brake_service: 'Brake Service',
    oil_change: 'Oil Change',
    electrical_repair: 'Electrical Repair',
    ac_service: 'AC Service',
    car_wash: 'Car Wash',
    bike_wash: 'Bike Wash',
    general_service: 'General Service',
    towing: 'Towing'
  };

  // ---- Default Onboarding Data ----
  function getDefaultData() {
    return {
      currentStep: 0,
      personal: { fullName: '', mobile: '', email: '', dob: '' },
      address: { city: 'Kolkata', fullAddress: '', landmark: '', pinCode: '' },
      vehicles: [],
      services: [],
      experience: { years: '', workshopName: '', previousWork: '' },
      documents: { aadhaar: null, pan: null, dl: null, certificate: null },
      bank: { holderName: '', bankName: '', accountNumber: '', ifsc: '', upiId: '' },
      emergency: { name: '', relationship: '', mobile: '' }
    };
  }

  // ---- App State ----
  let onboardingData = getDefaultData();
  let editingFromReview = false;
  let editReturnStep = 9; // review step

  const state = {
    currentScreen: 'm-splash-screen',
    appPhase: 'onboarding', // 'onboarding', 'pending', 'active'
    isOnline: false,
    jobTimerInterval: null,
    jobTimerSeconds: 30,
  };

  // ---- DOM Helpers ----
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ==============================
  // LOCALSTORAGE PERSISTENCE
  // ==============================
  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(onboardingData));
    } catch (e) { /* silent fail */ }
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        onboardingData = { ...getDefaultData(), ...parsed };
        return true;
      }
    } catch (e) { /* silent fail */ }
    return false;
  }

  function clearProgress() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* silent fail */ }
  }

  function saveAppState() {
    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify({ phase: state.appPhase }));
    } catch (e) { /* silent fail */ }
  }

  function loadAppState() {
    try {
      const saved = localStorage.getItem(APP_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state.appPhase = parsed.phase || 'onboarding';
        return true;
      }
    } catch (e) { /* silent fail */ }
    return false;
  }

  // ==============================
  // SCREEN NAVIGATION
  // ==============================
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

  function goToOnboardingStep(stepIndex, reverse) {
    if (stepIndex < 0 || stepIndex >= STEPS.length) return;
    const wasReverse = reverse !== undefined ? reverse : stepIndex < onboardingData.currentStep;
    onboardingData.currentStep = stepIndex;
    saveProgress();
    restoreStepData(stepIndex);
    navigateTo(STEPS[stepIndex], wasReverse);
  }

  // ==============================
  // FORM VALIDATION
  // ==============================
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    return /^\d{10}$/.test(phone);
  }

  function validatePinCode(pin) {
    return /^\d{6}$/.test(pin);
  }

  function validateIFSC(ifsc) {
    return /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc);
  }

  function setFieldError(inputId, message) {
    const input = $(`#${inputId}`);
    if (input) {
      input.classList.add('error');
      const errorEl = input.closest('.form-field')?.querySelector('.form-error');
      if (errorEl) errorEl.textContent = message;
    }
  }

  function clearFieldError(inputId) {
    const input = $(`#${inputId}`);
    if (input) {
      input.classList.remove('error');
      const errorEl = input.closest('.form-field')?.querySelector('.form-error');
      if (errorEl) errorEl.textContent = '';
    }
  }

  // ==============================
  // STEP VALIDATION & DATA COLLECTION
  // ==============================
  function validateAndCollectPersonal() {
    const fullName = $('#ob-fullname').value.trim();
    const mobile = $('#ob-mobile').value.trim();
    const email = $('#ob-email').value.trim();
    const dob = $('#ob-dob').value;

    if (!fullName || !mobile || !email || !dob) return false;
    if (!validatePhone(mobile)) return false;
    if (!validateEmail(email)) return false;

    onboardingData.personal = { fullName, mobile, email, dob };
    return true;
  }

  function validateAndCollectAddress() {
    const city = $('#ob-city').value.trim();
    const fullAddress = $('#ob-address').value.trim();
    const landmark = $('#ob-landmark').value.trim();
    const pinCode = $('#ob-pincode').value.trim();

    if (!city || !fullAddress || !pinCode) return false;
    if (!validatePinCode(pinCode)) return false;

    onboardingData.address = { city, fullAddress, landmark, pinCode };
    return true;
  }

  function validateVehicles() {
    return onboardingData.vehicles.length > 0;
  }

  function validateServices() {
    return onboardingData.services.length > 0;
  }

  function validateAndCollectExperience() {
    const years = $('#ob-years').value.trim();
    const workshopName = $('#ob-workshop').value.trim();
    const previousWork = $('#ob-previous').value.trim();

    if (!years) return false;

    onboardingData.experience = { years, workshopName, previousWork };
    return true;
  }

  function validateDocuments() {
    return onboardingData.documents.aadhaar !== null;
  }

  function validateAndCollectBank() {
    const holderName = $('#ob-holder').value.trim();
    const bankName = $('#ob-bankname').value.trim();
    const accountNumber = $('#ob-accnum').value.trim();
    const ifsc = $('#ob-ifsc').value.trim().toUpperCase();
    const upiId = $('#ob-upi').value.trim();

    if (!holderName || !bankName || !accountNumber || !ifsc || !upiId) return false;
    if (!validateIFSC(ifsc)) return false;

    onboardingData.bank = { holderName, bankName, accountNumber, ifsc, upiId };
    return true;
  }

  function validateAndCollectEmergency() {
    const name = $('#ob-ec-name').value.trim();
    const relationship = $('#ob-ec-relation').value.trim();
    const mobile = $('#ob-ec-mobile').value.trim();

    if (!name || !relationship || !mobile) return false;
    if (!validatePhone(mobile)) return false;

    onboardingData.emergency = { name, relationship, mobile };
    return true;
  }

  // ==============================
  // RESTORE DATA TO FORM FIELDS
  // ==============================
  function restoreStepData(step) {
    switch(step) {
      case 1: // personal
        $('#ob-fullname').value = onboardingData.personal.fullName;
        $('#ob-mobile').value = onboardingData.personal.mobile;
        $('#ob-email').value = onboardingData.personal.email;
        $('#ob-dob').value = onboardingData.personal.dob;
        updatePersonalButton();
        break;
      case 2: // address
        $('#ob-city').value = onboardingData.address.city || 'Kolkata';
        $('#ob-address').value = onboardingData.address.fullAddress;
        $('#ob-landmark').value = onboardingData.address.landmark;
        $('#ob-pincode').value = onboardingData.address.pinCode;
        updateAddressButton();
        break;
      case 3: // vehicles
        $$('#vehicle-chips .select-chip').forEach(chip => {
          const val = chip.dataset.value;
          chip.classList.toggle('selected', onboardingData.vehicles.includes(val));
        });
        updateVehicleButton();
        break;
      case 4: // services
        $$('#services-chips .service-chip').forEach(chip => {
          const val = chip.dataset.value;
          chip.classList.toggle('selected', onboardingData.services.includes(val));
        });
        updateServicesButton();
        break;
      case 5: // experience
        $('#ob-years').value = onboardingData.experience.years;
        $('#ob-workshop').value = onboardingData.experience.workshopName;
        $('#ob-previous').value = onboardingData.experience.previousWork;
        updateExperienceButton();
        break;
      case 6: // documents
        restoreDocumentStates();
        updateDocumentsButton();
        break;
      case 7: // bank
        $('#ob-holder').value = onboardingData.bank.holderName;
        $('#ob-bankname').value = onboardingData.bank.bankName;
        $('#ob-accnum').value = onboardingData.bank.accountNumber;
        $('#ob-ifsc').value = onboardingData.bank.ifsc;
        $('#ob-upi').value = onboardingData.bank.upiId;
        updateBankButton();
        break;
      case 8: // emergency
        $('#ob-ec-name').value = onboardingData.emergency.name;
        $('#ob-ec-relation').value = onboardingData.emergency.relationship;
        $('#ob-ec-mobile').value = onboardingData.emergency.mobile;
        updateEmergencyButton();
        break;
      case 9: // review
        populateReview();
        break;
    }
  }

  function restoreDocumentStates() {
    ['aadhaar', 'pan', 'dl', 'certificate'].forEach(docType => {
      const card = $(`[data-doc="${docType}"]`);
      if (!card) return;
      if (onboardingData.documents[docType]) {
        card.classList.add('uploaded');
        card.querySelector('.upload-card-status').textContent = onboardingData.documents[docType];
        card.querySelector('.upload-card-btn').innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Uploaded`;
      }
    });
  }

  // ==============================
  // BUTTON STATE UPDATERS
  // ==============================
  function updatePersonalButton() {
    const fullName = $('#ob-fullname').value.trim();
    const mobile = $('#ob-mobile').value.trim();
    const email = $('#ob-email').value.trim();
    const dob = $('#ob-dob').value;
    $('#ob-personal-next').disabled = !(fullName && validatePhone(mobile) && validateEmail(email) && dob);
  }

  function updateAddressButton() {
    const city = $('#ob-city').value.trim();
    const fullAddress = $('#ob-address').value.trim();
    const pinCode = $('#ob-pincode').value.trim();
    $('#ob-address-next').disabled = !(city && fullAddress && validatePinCode(pinCode));
  }

  function updateVehicleButton() {
    $('#ob-vehicle-next').disabled = onboardingData.vehicles.length === 0;
  }

  function updateServicesButton() {
    $('#ob-services-next').disabled = onboardingData.services.length === 0;
  }

  function updateExperienceButton() {
    const years = $('#ob-years').value.trim();
    $('#ob-experience-next').disabled = !years;
  }

  function updateDocumentsButton() {
    $('#ob-documents-next').disabled = !onboardingData.documents.aadhaar;
  }

  function updateBankButton() {
    const holderName = $('#ob-holder').value.trim();
    const bankName = $('#ob-bankname').value.trim();
    const accountNumber = $('#ob-accnum').value.trim();
    const ifsc = $('#ob-ifsc').value.trim();
    const upiId = $('#ob-upi').value.trim();
    $('#ob-bank-next').disabled = !(holderName && bankName && accountNumber && validateIFSC(ifsc) && upiId);
  }

  function updateEmergencyButton() {
    const name = $('#ob-ec-name').value.trim();
    const relationship = $('#ob-ec-relation').value.trim();
    const mobile = $('#ob-ec-mobile').value.trim();
    $('#ob-emergency-next').disabled = !(name && relationship && validatePhone(mobile));
  }

  // ==============================
  // REVIEW SCREEN
  // ==============================
  function populateReview() {
    const d = onboardingData;
    const container = $('#review-content');
    if (!container) return;

    const vehicleLabels = d.vehicles.map(v => v.charAt(0).toUpperCase() + v.slice(1));
    const serviceLabels = d.services.map(s => SERVICE_LABELS[s] || s);

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    container.innerHTML = `
      <!-- Personal Information -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Personal Information</span>
          <button class="review-edit-btn" data-edit-step="1">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row"><span class="review-row-label">Full Name</span><span class="review-row-value">${d.personal.fullName}</span></div>
          <div class="review-row"><span class="review-row-label">Mobile</span><span class="review-row-value">+91 ${d.personal.mobile}</span></div>
          <div class="review-row"><span class="review-row-label">Email</span><span class="review-row-value">${d.personal.email}</span></div>
          <div class="review-row"><span class="review-row-label">Date of Birth</span><span class="review-row-value">${formatDate(d.personal.dob)}</span></div>
        </div>
      </div>

      <!-- Address -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Address</span>
          <button class="review-edit-btn" data-edit-step="2">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row"><span class="review-row-label">City</span><span class="review-row-value">${d.address.city}</span></div>
          <div class="review-row"><span class="review-row-label">Address</span><span class="review-row-value">${d.address.fullAddress}</span></div>
          ${d.address.landmark ? `<div class="review-row"><span class="review-row-label">Landmark</span><span class="review-row-value">${d.address.landmark}</span></div>` : ''}
          <div class="review-row"><span class="review-row-label">PIN Code</span><span class="review-row-value">${d.address.pinCode}</span></div>
        </div>
      </div>

      <!-- Vehicle Expertise -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Vehicle Expertise</span>
          <button class="review-edit-btn" data-edit-step="3">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row">
            <span class="review-row-label">Vehicles</span>
            <div class="review-tags">${vehicleLabels.map(v => `<span class="review-tag">${v}</span>`).join('')}</div>
          </div>
        </div>
      </div>

      <!-- Services -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Services</span>
          <button class="review-edit-btn" data-edit-step="4">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row">
            <span class="review-row-label">Services</span>
            <div class="review-tags">${serviceLabels.map(s => `<span class="review-tag">${s}</span>`).join('')}</div>
          </div>
        </div>
      </div>

      <!-- Experience -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Experience</span>
          <button class="review-edit-btn" data-edit-step="5">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row"><span class="review-row-label">Years</span><span class="review-row-value">${d.experience.years} years</span></div>
          ${d.experience.workshopName ? `<div class="review-row"><span class="review-row-label">Workshop</span><span class="review-row-value">${d.experience.workshopName}</span></div>` : ''}
          ${d.experience.previousWork ? `<div class="review-row"><span class="review-row-label">Previous Work</span><span class="review-row-value">${d.experience.previousWork}</span></div>` : ''}
        </div>
      </div>

      <!-- Documents -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Documents</span>
          <button class="review-edit-btn" data-edit-step="6">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row"><span class="review-row-label">Aadhaar</span><span class="review-row-value" style="color:${d.documents.aadhaar ? '#22C55E' : '#EF4444'}">${d.documents.aadhaar || 'Not uploaded'}</span></div>
          <div class="review-row"><span class="review-row-label">PAN</span><span class="review-row-value">${d.documents.pan || 'Not uploaded'}</span></div>
          <div class="review-row"><span class="review-row-label">Driving Licence</span><span class="review-row-value">${d.documents.dl || 'Not uploaded'}</span></div>
          <div class="review-row"><span class="review-row-label">Certificate</span><span class="review-row-value">${d.documents.certificate || 'Not uploaded'}</span></div>
        </div>
      </div>

      <!-- Bank Details -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Bank Details</span>
          <button class="review-edit-btn" data-edit-step="7">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row"><span class="review-row-label">Account Holder</span><span class="review-row-value">${d.bank.holderName}</span></div>
          <div class="review-row"><span class="review-row-label">Bank</span><span class="review-row-value">${d.bank.bankName}</span></div>
          <div class="review-row"><span class="review-row-label">Account No.</span><span class="review-row-value">****${d.bank.accountNumber.slice(-4)}</span></div>
          <div class="review-row"><span class="review-row-label">IFSC</span><span class="review-row-value">${d.bank.ifsc}</span></div>
          <div class="review-row"><span class="review-row-label">UPI ID</span><span class="review-row-value">${d.bank.upiId}</span></div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="review-card">
        <div class="review-card-header">
          <span class="review-card-title">Emergency Contact</span>
          <button class="review-edit-btn" data-edit-step="8">Edit</button>
        </div>
        <div class="review-card-body">
          <div class="review-row"><span class="review-row-label">Name</span><span class="review-row-value">${d.emergency.name}</span></div>
          <div class="review-row"><span class="review-row-label">Relationship</span><span class="review-row-value">${d.emergency.relationship}</span></div>
          <div class="review-row"><span class="review-row-label">Mobile</span><span class="review-row-value">+91 ${d.emergency.mobile}</span></div>
        </div>
      </div>
    `;

    // Attach edit button handlers
    $$('.review-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.dataset.editStep);
        editingFromReview = true;
        editReturnStep = 9;
        goToOnboardingStep(targetStep, true);
      });
    });
  }

  // ==============================
  // INITIALIZATION
  // ==============================

  // ---- Splash ----
  function initSplash() {
    // Check if there's saved app state
    loadAppState();

    if (state.appPhase === 'pending') {
      setTimeout(() => navigateTo('m-pending-screen'), 2800);
      return;
    }

    if (state.appPhase === 'active') {
      setTimeout(() => navigateTo('m-home-screen'), 2800);
      return;
    }

    // Check for saved onboarding progress
    const hasProgress = loadProgress();
    if (hasProgress && onboardingData.currentStep > 0) {
      setTimeout(() => {
        const targetStep = onboardingData.currentStep;
        navigateTo(STEPS[targetStep]);
        state.currentScreen = STEPS[targetStep];
        restoreStepData(targetStep);
      }, 2800);
    } else {
      setTimeout(() => navigateTo('ob-welcome'), 2800);
    }
  }

  // ---- Welcome ----
  function initWelcome() {
    $('#ob-get-started').addEventListener('click', () => {
      goToOnboardingStep(1, false);
    });
  }

  // ---- Personal Info ----
  function initPersonal() {
    const fields = ['ob-fullname', 'ob-mobile', 'ob-email', 'ob-dob'];
    fields.forEach(id => {
      const el = $(`#${id}`);
      el.addEventListener('input', () => {
        if (id === 'ob-mobile') el.value = el.value.replace(/\D/g, '');
        updatePersonalButton();
      });
    });

    $('#ob-personal-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        validateAndCollectPersonal();
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(0, true);
      }
    });

    $('#ob-personal-next').addEventListener('click', () => {
      if (validateAndCollectPersonal()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(2, false);
        }
      }
    });
  }

  // ---- Address ----
  function initAddress() {
    const fields = ['ob-city', 'ob-address', 'ob-landmark', 'ob-pincode'];
    fields.forEach(id => {
      const el = $(`#${id}`);
      el.addEventListener('input', () => {
        if (id === 'ob-pincode') el.value = el.value.replace(/\D/g, '');
        updateAddressButton();
      });
    });

    $('#ob-address-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        validateAndCollectAddress();
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(1, true);
      }
    });

    $('#ob-address-next').addEventListener('click', () => {
      if (validateAndCollectAddress()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(3, false);
        }
      }
    });
  }

  // ---- Vehicle Expertise ----
  function initVehicle() {
    $$('#vehicle-chips .select-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.value;
        chip.classList.toggle('selected');
        if (onboardingData.vehicles.includes(val)) {
          onboardingData.vehicles = onboardingData.vehicles.filter(v => v !== val);
        } else {
          onboardingData.vehicles.push(val);
        }
        saveProgress();
        updateVehicleButton();
      });
    });

    $('#ob-vehicle-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(2, true);
      }
    });

    $('#ob-vehicle-next').addEventListener('click', () => {
      if (validateVehicles()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(4, false);
        }
      }
    });
  }

  // ---- Services ----
  function initServices() {
    $$('#services-chips .service-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.value;
        chip.classList.toggle('selected');
        if (onboardingData.services.includes(val)) {
          onboardingData.services = onboardingData.services.filter(s => s !== val);
        } else {
          onboardingData.services.push(val);
        }
        saveProgress();
        updateServicesButton();
      });
    });

    $('#ob-services-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(3, true);
      }
    });

    $('#ob-services-next').addEventListener('click', () => {
      if (validateServices()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(5, false);
        }
      }
    });
  }

  // ---- Experience ----
  function initExperience() {
    ['ob-years', 'ob-workshop', 'ob-previous'].forEach(id => {
      $(`#${id}`).addEventListener('input', updateExperienceButton);
    });

    $('#ob-experience-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        validateAndCollectExperience();
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(4, true);
      }
    });

    $('#ob-experience-next').addEventListener('click', () => {
      if (validateAndCollectExperience()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(6, false);
        }
      }
    });
  }

  // ---- Documents ----
  function initDocuments() {
    $$('.upload-card').forEach(card => {
      const btn = card.querySelector('.upload-card-btn');
      const fileInput = card.querySelector('.upload-file-input');
      const docType = card.dataset.doc;

      btn.addEventListener('click', () => {
        if (onboardingData.documents[docType]) return; // already uploaded
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const fileName = e.target.files[0].name;
          onboardingData.documents[docType] = fileName;
          saveProgress();

          // Update UI
          card.classList.add('uploaded');
          card.querySelector('.upload-card-status').textContent = fileName;
          btn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Uploaded`;

          updateDocumentsButton();
          showToast('✓ Document uploaded');
        }
      });
    });

    $('#ob-documents-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(5, true);
      }
    });

    $('#ob-documents-next').addEventListener('click', () => {
      if (validateDocuments()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(7, false);
        }
      }
    });
  }

  // ---- Bank Details ----
  function initBank() {
    ['ob-holder', 'ob-bankname', 'ob-accnum', 'ob-ifsc', 'ob-upi'].forEach(id => {
      const el = $(`#${id}`);
      el.addEventListener('input', () => {
        if (id === 'ob-ifsc') el.value = el.value.toUpperCase();
        if (id === 'ob-accnum') el.value = el.value.replace(/\D/g, '');
        updateBankButton();
      });
    });

    $('#ob-bank-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        validateAndCollectBank();
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(6, true);
      }
    });

    $('#ob-bank-next').addEventListener('click', () => {
      if (validateAndCollectBank()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(8, false);
        }
      }
    });
  }

  // ---- Emergency Contact ----
  function initEmergency() {
    ['ob-ec-name', 'ob-ec-relation', 'ob-ec-mobile'].forEach(id => {
      const el = $(`#${id}`);
      el.addEventListener('input', () => {
        if (id === 'ob-ec-mobile') el.value = el.value.replace(/\D/g, '');
        updateEmergencyButton();
      });
    });

    $('#ob-emergency-back').addEventListener('click', () => {
      if (editingFromReview) {
        editingFromReview = false;
        validateAndCollectEmergency();
        saveProgress();
        goToOnboardingStep(editReturnStep, false);
      } else {
        goToOnboardingStep(7, true);
      }
    });

    $('#ob-emergency-next').addEventListener('click', () => {
      if (validateAndCollectEmergency()) {
        saveProgress();
        if (editingFromReview) {
          editingFromReview = false;
          goToOnboardingStep(editReturnStep, false);
        } else {
          goToOnboardingStep(9, false);
        }
      }
    });
  }

  // ---- Review ----
  function initReview() {
    $('#ob-review-back').addEventListener('click', () => {
      goToOnboardingStep(8, true);
    });

    $('#ob-submit-btn').addEventListener('click', () => {
      // Collect any remaining data
      showToast('✓ Submitting your application...');
      setTimeout(() => {
        goToOnboardingStep(10, false);
      }, 500);
    });
  }

  // ---- Success ----
  function initSuccess() {
    $('#ob-go-dashboard').addEventListener('click', () => {
      // Clear onboarding data, set app phase to pending
      clearProgress();
      state.appPhase = 'pending';
      saveAppState();
      navigateTo('m-pending-screen');
    });
  }

  // ---- Pending Dashboard ----
  function initPending() {
    $('#pending-edit-btn').addEventListener('click', () => {
      // Reset to onboarding review
      onboardingData = getDefaultData();
      state.appPhase = 'onboarding';
      saveAppState();
      showToast('Returning to edit profile...');
      setTimeout(() => navigateTo('ob-welcome'), 500);
    });

    $('#pending-support-btn').addEventListener('click', () => {
      showToast('📞 Support: +91 98765 00000');
    });

    $('#pending-logout-btn').addEventListener('click', () => {
      clearProgress();
      state.appPhase = 'onboarding';
      saveAppState();
      showToast('Logged out');
      onboardingData = getDefaultData();
      setTimeout(() => navigateTo('ob-welcome'), 500);
    });
  }

  // ==============================
  // POST-APPROVAL DASHBOARD
  // ==============================
  function initHome() {
    const checkbox = $('#online-checkbox');
    const card = $('#online-toggle-card');
    const statusText = $('#toggle-status-text');
    const subText = $('#toggle-sub');

    checkbox.addEventListener('change', () => {
      state.isOnline = checkbox.checked;
      if (state.isOnline) {
        card.classList.add('online');
        statusText.textContent = "You're Online";
        subText.textContent = 'Waiting for job requests...';
        showToast('🟢 You are now online');
        setTimeout(() => {
          navigateTo('m-job-request-screen');
          startJobTimer();
        }, 3000);
      } else {
        card.classList.remove('online');
        statusText.textContent = "You're Offline";
        subText.textContent = 'Go online to receive job requests';
        showToast('You are now offline');
      }
    });

    $('#m-go-profile').addEventListener('click', () => {
      navigateTo('m-profile-screen');
      activateNav('profile');
    });

    $('#m-view-history').addEventListener('click', () => {
      navigateTo('m-history-screen');
      activateNav('history');
    });
  }

  function initJobRequest() {
    $('#accept-job-btn').addEventListener('click', () => {
      clearInterval(state.jobTimerInterval);
      showToast('✓ Job accepted!');
      navigateTo('m-navigation-screen');
    });

    $('#reject-job-btn').addEventListener('click', () => {
      clearInterval(state.jobTimerInterval);
      showToast('Job rejected');
      navigateTo('m-home-screen');
    });
  }

  function startJobTimer() {
    state.jobTimerSeconds = 30;
    const timerText = $('#jr-timer-text');
    const timerCircle = $('#timer-circle');
    const circumference = 2 * Math.PI * 26;

    state.jobTimerInterval = setInterval(() => {
      state.jobTimerSeconds--;
      timerText.textContent = state.jobTimerSeconds;
      const offset = ((30 - state.jobTimerSeconds) / 30) * circumference;
      timerCircle.setAttribute('stroke-dashoffset', offset);

      if (state.jobTimerSeconds <= 0) {
        clearInterval(state.jobTimerInterval);
        showToast('Request timed out');
        navigateTo('m-home-screen');
      }
    }, 1000);
  }

  function initNavigation() {
    $('#nav-back-btn').addEventListener('click', () => navigateTo('m-home-screen', true));
    $('#m-arrived-btn').addEventListener('click', () => {
      showToast('✓ Marked as arrived');
      navigateTo('m-job-details-screen');
    });
  }

  function initJobDetails() {
    $('#m-complete-job-btn').addEventListener('click', () => {
      showToast('✓ Job completed! ₹349 earned');
      setTimeout(() => navigateTo('m-home-screen'), 800);
    });
  }

  function initEarnings() {
    const tabs = $$('.e-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    const withdrawBtn = $('#m-withdraw-btn');
    if (withdrawBtn) {
      withdrawBtn.addEventListener('click', () => showToast('Withdrawal initiated'));
    }
  }

  function initHistory() {
    const chips = $$('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
      });
    });
  }

  function initProfile() {
    $('#m-logout-btn').addEventListener('click', () => {
      clearProgress();
      state.appPhase = 'onboarding';
      saveAppState();
      onboardingData = getDefaultData();
      showToast('Logged out');
      setTimeout(() => navigateTo('ob-welcome'), 500);
    });

    $('#m-go-ratings').addEventListener('click', () => navigateTo('m-ratings-screen'));
  }

  // ---- Bottom Navs ----
  function initBottomNavs() {
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        activateNav(tab);
        const map = {
          home: 'm-home-screen',
          earnings: 'm-earnings-screen',
          history: 'm-history-screen',
          profile: 'm-profile-screen',
        };
        if (map[tab]) navigateTo(map[tab]);
      });
    });
  }

  function activateNav(tab) {
    $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.tab === tab));
  }

  // ---- Back Buttons (data-back) ----
  function initBackButtons() {
    $$('.back-btn[data-back]').forEach(btn => {
      btn.addEventListener('click', () => navigateTo(btn.dataset.back, true));
    });
  }

  // ---- Clock ----
  function updateClock() {
    const els = $$('[id$="-status-time"]');
    const now = new Date();
    const t = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    els.forEach(el => el.textContent = t);
  }

  // ---- Toast ----
  function showToast(message) {
    const toast = $('#m-toast');
    const msg = $('.toast-message', toast);
    msg.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 250);
    }, 2500);
  }

  // ==============================
  // MASTER INIT
  // ==============================
  function init() {
    updateClock();
    setInterval(updateClock, 30000);

    initSplash();
    initWelcome();
    initPersonal();
    initAddress();
    initVehicle();
    initServices();
    initExperience();
    initDocuments();
    initBank();
    initEmergency();
    initReview();
    initSuccess();
    initPending();
    initHome();
    initJobRequest();
    initNavigation();
    initJobDetails();
    initEarnings();
    initHistory();
    initProfile();
    initBottomNavs();
    initBackButtons();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

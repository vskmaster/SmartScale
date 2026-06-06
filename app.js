/* ==========================================================================
   SmartScale Application Logic - Clean, Minimal, Highly Functional
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // ---------------------------------------------------------------------------
  // 1. STATE MANAGEMENT & SYSTEM GLOBAL CONSTANTS
  // ---------------------------------------------------------------------------
  
  // Default calibration corresponds to ~96 DPI screen
  // (96 pixels per inch / 25.4 mm per inch = 3.7795275 pixels per mm)
  const DEFAULT_PX_PER_MM = 3.7795275;
  
  let calibration = {
    pxPerMmX: DEFAULT_PX_PER_MM,
    pxPerMmY: DEFAULT_PX_PER_MM,
    isCalibrated: false
  };

  // Ring Sizing Standards Lookups (Indian standards added, Japan/UK/Europe removed)
  const ringSizes = [
    { dia: 14.07, us: "3", in: "4" },
    { dia: 14.48, us: "3.5", in: "5" },
    { dia: 14.88, us: "4", in: "7" },
    { dia: 15.29, us: "4.5", in: "8" },
    { dia: 15.70, us: "5", in: "9" },
    { dia: 16.10, us: "5.5", in: "10" },
    { dia: 16.51, us: "6", in: "12" },
    { dia: 16.92, us: "6.5", in: "13" },
    { dia: 17.32, us: "7", in: "14" },
    { dia: 17.73, us: "7.5", in: "15" },
    { dia: 18.14, us: "8", in: "17" },
    { dia: 18.54, us: "8.5", in: "18" },
    { dia: 18.95, us: "9", in: "19" },
    { dia: 19.35, us: "9.5", in: "21" },
    { dia: 19.76, us: "10", in: "22" },
    { dia: 20.17, us: "10.5", in: "23" },
    { dia: 20.57, us: "11", in: "25" },
    { dia: 20.98, us: "11.5", in: "26" },
    { dia: 21.39, us: "12", in: "28" }
  ];

  // Active workspace state
  let workspace = {
    shapes: [],
    selectedShapeId: null,
    activeUnit: 'mm', // 'mm', 'cm', 'in'
    dragAction: null, // 'dragging', 'resizing'
    activeHandle: null,
    dragStart: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    shapeInitialState: {}
  };

  // Active ring sizer state
  let ringSizer = {
    diameterInMm: 16.51 // default size US 6
  };

  // Active calibration wizard state
  let wizard = {
    step: 1,
    overlayWidth: 324,  // pixel width
    overlayHeight: 204, // pixel height (aspect ratio ~ 1.585)
    lockRatio: true,
    dragAction: null,
    activeHandle: null,
    dragStart: { x: 0, y: 0 },
    overlayInitialState: {}
  };

  // ---------------------------------------------------------------------------
  // 2. DOM ELEMENTS CACHE
  // ---------------------------------------------------------------------------
  
  // Navigation
  const navLinks = document.querySelectorAll('.nav-link');
  const views = document.querySelectorAll('.app-view');
  const logoBtn = document.getElementById('logo-btn');
  const navCalibrationBadge = document.getElementById('nav-calibration-badge');
  
  // Layers Panel (Figma style)
  const layersList = document.getElementById('layers-list');
  const layersEmptyState = document.getElementById('layers-empty-state');
  const layersCount = document.getElementById('layers-count');
  
  // Landing View CTAs
  const startBtn = document.getElementById('landing-start-btn');
  const calibrateBtn = document.getElementById('landing-calibrate-btn');

  // Workspace View
  const canvasBoard = document.getElementById('measurement-canvas');
  const canvasEmptyMsg = document.getElementById('canvas-empty');
  const addRectBtn = document.getElementById('tool-rect');
  const addSquareBtn = document.getElementById('tool-square');
  const addCircleBtn = document.getElementById('tool-circle');
  const addLineBtn = document.getElementById('tool-line');
  const clearCanvasBtn = document.getElementById('clear-canvas-btn');
  const unitButtons = document.querySelectorAll('.unit-btn');
  
  // Workspace Sidebar
  const sidebarCalibStatusBadge = document.getElementById('sidebar-calib-status-badge');
  const sidebarRatioDisplay = document.getElementById('sidebar-ratio-display');
  const sidebarDpiDisplay = document.getElementById('sidebar-dpi-display');
  const sidebarRecalibrateBtn = document.getElementById('sidebar-recalibrate-btn');
  const accuracyIndicator = document.getElementById('accuracy-indicator');
  
  // Sidebar Shape details
  const noShapeSelectedMsg = document.getElementById('no-shape-selected-msg');
  const shapeDetailsContainer = document.getElementById('shape-details-container');
  const selectedShapeTypeLabel = document.getElementById('selected-shape-type');
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  const valWidth = document.getElementById('val-width');
  const valHeight = document.getElementById('val-height');
  const valArea = document.getElementById('val-area');
  const valPerimeter = document.getElementById('val-perimeter');
  const unitArea = document.getElementById('unit-area');
  
  // Sidebar Spinners
  const adjWidthInput = document.getElementById('adj-width');
  const adjHeightInput = document.getElementById('adj-height');
  const adjWGroup = document.getElementById('adj-w-group');
  const adjHGroup = document.getElementById('adj-h-group');
  const adjWidthLabel = document.getElementById('adj-width-label');
  const adjHeightLabel = document.getElementById('adj-height-label');

  // Ring Sizer View
  const ringCircle = document.getElementById('ring-circle');
  const ringCircleHandle = document.getElementById('ring-circle-handle');
  const ringSlider = document.getElementById('ring-size-slider');
  const ringCurrentDiameterLabel = document.getElementById('ring-current-diameter');
  const ringDiameterBadge = document.getElementById('ring-diameter-badge');
  const ringResDiameter = document.getElementById('ring-res-diameter');
  const ringResCircumference = document.getElementById('ring-res-circumference');
  const ringResUsSize = document.getElementById('ring-res-us-size');
  const ringResInSize = document.getElementById('ring-res-in-size');
  const ringSizeTable = document.getElementById('ring-size-table');
  const ringPrecDown = document.getElementById('ring-prec-down');
  const ringPrecUp = document.getElementById('ring-prec-up');

  // Calibration Wizard View
  const stepInds = [
    document.getElementById('step-ind-1'),
    document.getElementById('step-ind-2'),
    document.getElementById('step-ind-3')
  ];
  const stepContents = [
    document.getElementById('calib-step-1'),
    document.getElementById('calib-step-2'),
    document.getElementById('calib-step-3')
  ];
  const calibCancel1 = document.getElementById('calib-cancel-1');
  const calibNext1 = document.getElementById('calib-next-1');
  const calibPrev2 = document.getElementById('calib-prev-2');
  const calibSaveBtn = document.getElementById('calib-save-btn');
  const calibDoneBtn = document.getElementById('calib-done-btn');
  const calibCardOverlay = document.getElementById('calib-card-overlay');
  const calibScaleSlider = document.getElementById('calib-scale-slider');
  const calibPxWidthLabel = document.getElementById('calib-px-width');
  const calibPxHeightLabel = document.getElementById('calib-px-height');
  const calibWDown = document.getElementById('calib-w-down');
  const calibWUp = document.getElementById('calib-w-up');
  const calibHDown = document.getElementById('calib-h-down');
  const calibHUp = document.getElementById('calib-h-up');
  const calibLockRatioCheckbox = document.getElementById('calib-lock-ratio');
  const calibResRatioX = document.getElementById('calib-res-ratio-x');
  const calibResRatioY = document.getElementById('calib-res-ratio-y');
  const calibResDpi = document.getElementById('calib-res-dpi');


  // ---------------------------------------------------------------------------
  // 3. STORAGE & INITIALIZATION
  // ---------------------------------------------------------------------------
  
  function init() {
    loadCalibration();
    setupRouting();
    setupCalibrationWizard();
    setupWorkspace();
    setupRingSizer();
    setupKeyboardListeners();
  }

  function loadCalibration() {
    const savedX = localStorage.getItem('smartscale_calib_x');
    const savedY = localStorage.getItem('smartscale_calib_y');
    
    if (savedX && savedY) {
      calibration.pxPerMmX = parseFloat(savedX);
      calibration.pxPerMmY = parseFloat(savedY);
      calibration.isCalibrated = true;
    } else {
      calibration.pxPerMmX = DEFAULT_PX_PER_MM;
      calibration.pxPerMmY = DEFAULT_PX_PER_MM;
      calibration.isCalibrated = false;
    }
    updateCalibrationUI();
  }

  function saveCalibration(ratioX, ratioY) {
    calibration.pxPerMmX = ratioX;
    calibration.pxPerMmY = ratioY;
    calibration.isCalibrated = true;
    
    localStorage.setItem('smartscale_calib_x', ratioX);
    localStorage.setItem('smartscale_calib_y', ratioY);
    
    updateCalibrationUI();
  }

  function updateCalibrationUI() {
    // Nav Badge (defensive check)
    if (navCalibrationBadge) {
      if (calibration.isCalibrated) {
        navCalibrationBadge.classList.add('calibrated');
        const badgeText = navCalibrationBadge.querySelector('.badge-text');
        if (badgeText) badgeText.textContent = 'Calibrated';
      } else {
        navCalibrationBadge.classList.remove('calibrated');
        const badgeText = navCalibrationBadge.querySelector('.badge-text');
        if (badgeText) badgeText.textContent = 'Uncalibrated';
      }
    }
    
    if (calibration.isCalibrated) {
      sidebarCalibStatusBadge.classList.add('calibrated');
      sidebarCalibStatusBadge.textContent = 'Calibrated';
      
      accuracyIndicator.querySelector('.indicator-dot').className = 'indicator-dot green';
      accuracyIndicator.querySelector('span:not(.indicator-dot)').textContent = 'Millimeter Accurate';
    } else {
      sidebarCalibStatusBadge.classList.remove('calibrated');
      sidebarCalibStatusBadge.textContent = 'Uncalibrated';
      
      accuracyIndicator.querySelector('.indicator-dot').className = 'indicator-dot orange';
      accuracyIndicator.querySelector('span:not(.indicator-dot)').textContent = 'Estimated Scale';
    }

    // Displays
    const ratioText = `${calibration.pxPerMmX.toFixed(2)} px/mm`;
    sidebarRatioDisplay.textContent = ratioText;
    
    const dpi = Math.round(calibration.pxPerMmX * 25.4);
    sidebarDpiDisplay.textContent = `${dpi} DPI`;
  }

  // ---------------------------------------------------------------------------
  // 4. ROUTING & VIEW SWITCHER
  // ---------------------------------------------------------------------------
  
  function setupRouting() {
    // Navigation Links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = link.getAttribute('data-view');
        switchView(targetView);
      });
    });

    // Logo Click
    logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('landing');
    });

    // Landing CTAs
    startBtn.addEventListener('click', () => switchView('measure'));
    calibrateBtn.addEventListener('click', () => switchView('calibrate'));
    
    // Sidebar recalibrate button
    sidebarRecalibrateBtn.addEventListener('click', () => switchView('calibrate'));
  }

  function switchView(viewId) {
    views.forEach(view => {
      if (view.id === `view-${viewId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Nav Links
    navLinks.forEach(link => {
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Specific View Initializations on Transition
    if (viewId === 'measure') {
      renderShapes();
    } else if (viewId === 'ring') {
      updateRingSize();
    } else if (viewId === 'calibrate') {
      resetWizard();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // 5. CALIBRATION WIZARD LOGIC
  // ---------------------------------------------------------------------------
  
  function setupCalibrationWizard() {
    // Step 1 buttons
    calibCancel1.addEventListener('click', () => switchView('landing'));
    calibNext1.addEventListener('click', () => goToWizardStep(2));

    // Step 2 buttons
    calibPrev2.addEventListener('click', () => goToWizardStep(1));
    calibSaveBtn.addEventListener('click', () => saveWizardCalibration());

    // Step 3 button
    calibDoneBtn.addEventListener('click', () => switchView('measure'));

    // Aspect Ratio Checkbox
    calibLockRatioCheckbox.addEventListener('change', (e) => {
      wizard.lockRatio = e.target.checked;
      if (wizard.lockRatio) {
        // Enforce aspect ratio based on width immediately
        wizard.overlayHeight = Math.round(wizard.overlayWidth * (53.98 / 85.60));
        updateWizardOverlayUI();
      }
    });

    // Slider
    calibScaleSlider.addEventListener('input', (e) => {
      wizard.overlayWidth = parseInt(e.target.value);
      if (wizard.lockRatio) {
        wizard.overlayHeight = Math.round(wizard.overlayWidth * (53.98 / 85.60));
      }
      updateWizardOverlayUI();
    });

    // Precision Adjustments
    calibWDown.addEventListener('click', () => adjustWizardWidth(-1));
    calibWUp.addEventListener('click', () => adjustWizardWidth(1));
    calibHDown.addEventListener('click', () => adjustWizardHeight(-1));
    calibHUp.addEventListener('click', () => adjustWizardHeight(1));

    // Drag-and-Resize Overlay Events
    setupWizardDragAndDrop();
  }

  function resetWizard() {
    wizard.step = 1;
    // Set typical medium starting size
    wizard.overlayWidth = 324;
    wizard.overlayHeight = Math.round(324 * (53.98 / 85.60));
    wizard.lockRatio = true;
    calibLockRatioCheckbox.checked = true;
    
    goToWizardStep(1);
    updateWizardOverlayUI();
  }

  function goToWizardStep(stepNum) {
    wizard.step = stepNum;
    
    // Update Indicators
    stepInds.forEach((ind, index) => {
      if (index < stepNum) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });

    // Update Step Contents
    stepContents.forEach((content, index) => {
      if (index === stepNum - 1) {
        content.classList.remove('hidden');
      } else {
        content.classList.add('hidden');
      }
    });
  }

  function adjustWizardWidth(delta) {
    wizard.overlayWidth = Math.max(100, Math.min(800, wizard.overlayWidth + delta));
    if (wizard.lockRatio) {
      wizard.overlayHeight = Math.round(wizard.overlayWidth * (53.98 / 85.60));
    }
    updateWizardOverlayUI();
  }

  function adjustWizardHeight(delta) {
    if (wizard.lockRatio) {
      // If ratio is locked, height adjustments trigger width scaling proportionally
      const widthDelta = delta * (85.60 / 53.98);
      adjustWizardWidth(widthDelta);
    } else {
      wizard.overlayHeight = Math.max(80, Math.min(600, wizard.overlayHeight + delta));
      updateWizardOverlayUI();
    }
  }

  function updateWizardOverlayUI() {
    calibCardOverlay.style.width = `${wizard.overlayWidth}px`;
    calibCardOverlay.style.height = `${wizard.overlayHeight}px`;
    
    calibPxWidthLabel.textContent = `${wizard.overlayWidth} px`;
    calibPxHeightLabel.textContent = `${wizard.overlayHeight} px`;
    
    calibScaleSlider.value = wizard.overlayWidth;
  }

  function saveWizardCalibration() {
    // Credit card standard is 85.60mm x 53.98mm
    const ratioX = wizard.overlayWidth / 85.60;
    const ratioY = wizard.overlayHeight / 53.98;
    
    saveCalibration(ratioX, ratioY);
    
    // Populate Results View
    calibResRatioX.textContent = `${ratioX.toFixed(3)} px/mm`;
    calibResRatioY.textContent = `${ratioY.toFixed(3)} px/mm`;
    
    const dpi = ratioX * 25.4;
    calibResDpi.textContent = `${dpi.toFixed(1)} DPI`;

    goToWizardStep(3);
  }

  function setupWizardDragAndDrop() {
    // Main Body Dragging (centering / moving overlay inside card)
    calibCardOverlay.addEventListener('mousedown', startWizardDrag);
    calibCardOverlay.addEventListener('touchstart', startWizardDrag, { passive: false });

    // Handle Resize Dragging
    const handles = calibCardOverlay.querySelectorAll('.calib-handle');
    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => startWizardResize(e, handle));
      handle.addEventListener('touchstart', (e) => startWizardResize(e, handle), { passive: false });
    });

    // Global Events for Move/End
    window.addEventListener('mousemove', handleWizardMove);
    window.addEventListener('touchmove', handleWizardMove, { passive: false });
    window.addEventListener('mouseup', endWizardDrag);
    window.addEventListener('touchend', endWizardDrag);
  }

  function getEventCoords(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  function startWizardDrag(e) {
    if (e.target.classList.contains('calib-handle')) return; // handled separately
    e.preventDefault();
    
    const coords = getEventCoords(e);
    wizard.dragAction = 'dragging';
    wizard.dragStart = { x: coords.x, y: coords.y };
    
    const rect = calibCardOverlay.getBoundingClientRect();
    const parentRect = calibCardOverlay.parentElement.getBoundingClientRect();
    
    wizard.dragOffset = {
      x: rect.left - parentRect.left,
      y: rect.top - parentRect.top
    };
  }

  function startWizardResize(e, handleEl) {
    e.stopPropagation();
    e.preventDefault();
    
    const coords = getEventCoords(e);
    wizard.dragAction = 'resizing';
    wizard.activeHandle = handleEl.getAttribute('data-handle');
    wizard.dragStart = { x: coords.x, y: coords.y };
    
    wizard.overlayInitialState = {
      width: wizard.overlayWidth,
      height: wizard.overlayHeight,
      left: calibCardOverlay.offsetLeft,
      top: calibCardOverlay.offsetTop
    };
  }

  function handleWizardMove(e) {
    if (!wizard.dragAction) return;
    
    e.preventDefault();
    const coords = getEventCoords(e);
    
    if (wizard.dragAction === 'dragging') {
      const dx = coords.x - wizard.dragStart.x;
      const dy = coords.y - wizard.dragStart.y;
      
      const newX = wizard.dragOffset.x + dx;
      const newY = wizard.dragOffset.y + dy;
      
      calibCardOverlay.style.left = `${newX}px`;
      calibCardOverlay.style.top = `${newY}px`;
      calibCardOverlay.style.transform = 'none'; // Clear translate alignment
    } 
    else if (wizard.dragAction === 'resizing') {
      const dx = coords.x - wizard.dragStart.x;
      const dy = coords.y - wizard.dragStart.y;
      const init = wizard.overlayInitialState;
      const aspect = 53.98 / 85.60;
      
      let newW = init.width;
      let newH = init.height;
      let newL = init.left;
      let newT = init.top;
      
      switch (wizard.activeHandle) {
        case 'e':
          newW = init.width + dx;
          if (wizard.lockRatio) newH = Math.round(newW * aspect);
          break;
        case 'w':
          newW = init.width - dx;
          newL = init.left + dx;
          if (wizard.lockRatio) {
            newH = Math.round(newW * aspect);
            newT = init.top + (init.height - newH) / 2; // Center Y shifting
          }
          break;
        case 's':
          newH = init.height + dy;
          if (wizard.lockRatio) newW = Math.round(newH / aspect);
          break;
        case 'n':
          newH = init.height - dy;
          newT = init.top + dy;
          if (wizard.lockRatio) {
            newW = Math.round(newH / aspect);
            newL = init.left + (init.width - newW) / 2; // Center X shifting
          }
          break;
        case 'se':
          newW = init.width + dx;
          newH = init.height + dy;
          if (wizard.lockRatio) {
            // Take the average of both changes to feel smooth
            const targetW = (newW + newH / aspect) / 2;
            newW = Math.round(targetW);
            newH = Math.round(newW * aspect);
          }
          break;
        case 'ne':
          newW = init.width + dx;
          newH = init.height - dy;
          newT = init.top + dy;
          if (wizard.lockRatio) {
            const targetW = (newW + newH / aspect) / 2;
            newW = Math.round(targetW);
            newH = Math.round(newW * aspect);
            newT = init.top + (init.height - newH);
          }
          break;
        case 'sw':
          newW = init.width - dx;
          newL = init.left + dx;
          newH = init.height + dy;
          if (wizard.lockRatio) {
            const targetW = (newW + newH / aspect) / 2;
            newW = Math.round(targetW);
            newH = Math.round(newW * aspect);
            newL = init.left + (init.width - newW);
          }
          break;
        case 'nw':
          newW = init.width - dx;
          newL = init.left + dx;
          newH = init.height - dy;
          newT = init.top + dy;
          if (wizard.lockRatio) {
            const targetW = (newW + newH / aspect) / 2;
            newW = Math.round(targetW);
            newH = Math.round(newW * aspect);
            newL = init.left + (init.width - newW);
            newT = init.top + (init.height - newH);
          }
          break;
      }
      
      // Boundaries check
      if (newW >= 100 && newW <= 800 && newH >= 60 && newH <= 500) {
        wizard.overlayWidth = newW;
        wizard.overlayHeight = newH;
        
        calibCardOverlay.style.width = `${newW}px`;
        calibCardOverlay.style.height = `${newH}px`;
        calibCardOverlay.style.left = `${newL}px`;
        calibCardOverlay.style.top = `${newT}px`;
        calibCardOverlay.style.transform = 'none';
        
        updateWizardOverlayUI();
      }
    }
  }

  function endWizardDrag() {
    wizard.dragAction = null;
    wizard.activeHandle = null;
  }


  // ---------------------------------------------------------------------------
  // 6. RING MEASUREMENT LOGIC
  // ---------------------------------------------------------------------------
  
  function setupRingSizer() {
    // Slider
    ringSlider.addEventListener('input', (e) => {
      ringSizer.diameterInMm = parseFloat(e.target.value);
      updateRingSize();
    });

    // Precision Buttons
    ringPrecDown.addEventListener('click', () => {
      ringSizer.diameterInMm = Math.max(10, ringSizer.diameterInMm - 0.1);
      updateRingSize();
    });
    
    ringPrecUp.addEventListener('click', () => {
      ringSizer.diameterInMm = Math.min(30, ringSizer.diameterInMm + 0.1);
      updateRingSize();
    });

    // Handle Drag Sizing
    ringCircleHandle.addEventListener('mousedown', startRingResize);
    ringCircleHandle.addEventListener('touchstart', startRingResize, { passive: false });

    window.addEventListener('mousemove', handleRingResize);
    window.addEventListener('touchmove', handleRingResize, { passive: false });
    window.addEventListener('mouseup', endRingResize);
    window.addEventListener('touchend', endRingResize);
  }

  let isResizingRing = false;
  let ringInitialState = {};

  function startRingResize(e) {
    e.stopPropagation();
    e.preventDefault();
    isResizingRing = true;
    
    const coords = getEventCoords(e);
    
    ringInitialState = {
      diameterPx: ringCircle.offsetWidth,
      startX: coords.x
    };
  }

  function handleRingResize(e) {
    if (!isResizingRing) return;
    e.preventDefault();
    
    const coords = getEventCoords(e);
    // Since handle is on the right, dragging right increases size
    const dx = coords.x - ringInitialState.startX;
    
    // We adjust both sides, so dragging is relative to center. 
    // Handle is on right edge, so dragging 10px right adds 20px to diameter.
    const newDiaPx = ringInitialState.diameterPx + dx * 2;
    
    // Convert pixels to mm
    const newDiaMm = newDiaPx / calibration.pxPerMmX;
    
    if (newDiaMm >= 10 && newDiaMm <= 30) {
      ringSizer.diameterInMm = newDiaMm;
      updateRingSize();
    }
  }

  function endRingResize() {
    isResizingRing = false;
  }

  function updateRingSize() {
    const diaMm = ringSizer.diameterInMm;
    const diaPx = diaMm * calibration.pxPerMmX;
    
    // Render circle overlay
    ringCircle.style.width = `${diaPx}px`;
    ringCircle.style.height = `${diaPx}px`;
    
    // Update texts
    ringCurrentDiameterLabel.textContent = `${diaMm.toFixed(1)} mm`;
    ringDiameterBadge.textContent = `${diaMm.toFixed(1)} mm`;
    
    ringResDiameter.textContent = `${diaMm.toFixed(2)} mm`;
    
    const circ = Math.PI * diaMm;
    ringResCircumference.textContent = `${circ.toFixed(2)} mm`;
    
    // Sync slider value
    ringSlider.value = diaMm;

    // Find and highlight closest international size
    const closest = findClosestRingSize(diaMm);
    if (ringResUsSize) ringResUsSize.textContent = closest.us;
    if (ringResInSize) ringResInSize.textContent = closest.in;

    // Highlight row in table
    updateRingTableHighlight(closest);
  }

  function findClosestRingSize(diameter) {
    let closest = ringSizes[0];
    let minDiff = Math.abs(diameter - closest.dia);
    for (let i = 1; i < ringSizes.length; i++) {
      const diff = Math.abs(diameter - ringSizes[i].dia);
      if (diff < minDiff) {
        minDiff = diff;
        closest = ringSizes[i];
      }
    }
    return closest;
  }

  function updateRingTableHighlight(closestSize) {
    const rows = ringSizeTable.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const rowDia = parseFloat(row.getAttribute('data-dia'));
      if (Math.abs(rowDia - closestSize.dia) < 0.05) {
        row.classList.add('selected-row');
        // Scroll row into view smoothly
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        row.classList.remove('selected-row');
      }
    });
  }


  // ---------------------------------------------------------------------------
  // 7. MEASUREMENT WORKSPACE SHAPES MANAGEMENT
  // ---------------------------------------------------------------------------
  
  function setupWorkspace() {
    // Toolbar Shape Creators
    addRectBtn.addEventListener('click', () => createShape('rectangle'));
    addSquareBtn.addEventListener('click', () => createShape('square'));
    addCircleBtn.addEventListener('click', () => createShape('circle'));
    addLineBtn.addEventListener('click', () => createShape('line'));
    
    // Clear canvas (direct execution to fix issue and support fast automated testing)
    clearCanvasBtn.addEventListener('click', () => {
      workspace.shapes = [];
      workspace.selectedShapeId = null;
      renderShapes();
      updateSidebarDetails();
    });

    // Unit Selector Toggle
    unitButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        unitButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        workspace.activeUnit = btn.getAttribute('data-unit');
        
        renderShapes();
        updateSidebarDetails();
      });
    });

    // Delete active shape
    deleteSelectedBtn.addEventListener('click', deleteSelectedShape);

    // Sidebar Manual Precision Adjustments
    adjWidthInput.addEventListener('input', handleManualWidthChange);
    adjHeightInput.addEventListener('input', handleManualHeightChange);

    // Spinners custom buttons
    document.getElementById('spin-w-up').addEventListener('click', () => triggerSpinnerChange('width', 0.5));
    document.getElementById('spin-w-down').addEventListener('click', () => triggerSpinnerChange('width', -0.5));
    document.getElementById('spin-h-up').addEventListener('click', () => triggerSpinnerChange('height', 0.5));
    document.getElementById('spin-h-down').addEventListener('click', () => triggerSpinnerChange('height', -0.5));

    // Clicking on empty canvas area deselects shapes
    canvasBoard.addEventListener('mousedown', (e) => {
      if (e.target === canvasBoard || e.target.classList.contains('grid-overlay')) {
        workspace.selectedShapeId = null;
        renderShapes();
        updateSidebarDetails();
      }
    });
    
    canvasBoard.addEventListener('touchstart', (e) => {
      if (e.target === canvasBoard || e.target.classList.contains('grid-overlay')) {
        workspace.selectedShapeId = null;
        renderShapes();
        updateSidebarDetails();
      }
    });

    // Global drag / resize event handlers for shapes
    window.addEventListener('mousemove', handleShapeInteractionMove);
    window.addEventListener('touchmove', handleShapeInteractionMove, { passive: false });
    window.addEventListener('mouseup', endShapeInteraction);
    window.addEventListener('touchend', endShapeInteraction);
  }

  function createShape(type) {
    // Center of visible container scroll window projected onto actual canvas coordinates
    const container = canvasBoard.parentElement;
    const viewCenterX = container.scrollLeft + container.clientWidth / 2;
    const viewCenterY = container.scrollTop + container.clientHeight / 2;
    
    const newShape = {
      id: Date.now().toString(),
      type: type,
    };

    if (type === 'line') {
      newShape.x1 = Math.round(viewCenterX - 100);
      newShape.y1 = Math.round(viewCenterY + 50);
      newShape.x2 = Math.round(viewCenterX + 100);
      newShape.y2 = Math.round(viewCenterY - 50);
    } else {
      let w = 150;
      let h = 100;
      if (type === 'square') {
        w = 120;
        h = 120;
      } else if (type === 'circle') {
        w = 120;
        h = 120;
      }
      
      newShape.x = Math.round(viewCenterX - w / 2);
      newShape.y = Math.round(viewCenterY - h / 2);
      newShape.width = w;
      newShape.height = h;
    }

    workspace.shapes.push(newShape);
    workspace.selectedShapeId = newShape.id;
    
    renderShapes();
    updateSidebarDetails();
  }

  function getSelectedShape() {
    return workspace.shapes.find(s => s.id === workspace.selectedShapeId);
  }

  function deleteSelectedShape() {
    if (workspace.selectedShapeId) {
      workspace.shapes = workspace.shapes.filter(s => s.id !== workspace.selectedShapeId);
      workspace.selectedShapeId = null;
      renderShapes();
      updateSidebarDetails();
    }
  }

  // Unit math conversions
  function convertMm(valInMm, targetUnit) {
    if (targetUnit === 'cm') return valInMm / 10;
    if (targetUnit === 'in') return valInMm * 0.0393700787;
    return valInMm; // default 'mm'
  }

  function convertToMm(valInUnit, currentUnit) {
    if (currentUnit === 'cm') return valInUnit * 10;
    if (currentUnit === 'in') return valInUnit / 0.0393700787;
    return valInUnit;
  }

  function formatValue(val) {
    return val.toFixed(2);
  }

  // Dynamic DOM Renderer for shapes
  function renderShapes() {
    // Remove all previous shape nodes
    const existingShapes = canvasBoard.querySelectorAll('.canvas-shape');
    existingShapes.forEach(node => node.remove());

    // Toggle Empty State Message
    if (workspace.shapes.length === 0) {
      canvasEmptyMsg.classList.remove('hidden');
    } else {
      canvasEmptyMsg.classList.add('hidden');
    }

    workspace.shapes.forEach(shape => {
      const shapeEl = document.createElement('div');
      shapeEl.className = 'canvas-shape';
      shapeEl.setAttribute('data-id', shape.id);
      
      const isSelected = shape.id === workspace.selectedShapeId;
      if (isSelected) {
        shapeEl.classList.add('selected');
      }

      // Position shape based on type
      if (shape.type === 'line') {
        shapeEl.classList.add('shape-line');
        // Render rotated rectangle line connecting (x1,y1) to (x2,y2)
        const dx = shape.x2 - shape.x1;
        const dy = shape.y2 - shape.y1;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx); // in radians
        
        shapeEl.style.width = `${dist}px`;
        shapeEl.style.left = `${shape.x1}px`;
        shapeEl.style.top = `${shape.y1}px`;
        shapeEl.style.transform = `rotate(${angle}rad)`;
        
        // Handles
        if (isSelected) {
          // Start point handle
          const hStart = document.createElement('div');
          hStart.className = 'shape-handle handle-line-start';
          hStart.setAttribute('data-handle', 'line-start');
          shapeEl.appendChild(hStart);

          // End point handle
          const hEnd = document.createElement('div');
          hEnd.className = 'shape-handle handle-line-end';
          hEnd.setAttribute('data-handle', 'line-end');
          shapeEl.appendChild(hEnd);

          // Dimensions label tag
          const tag = document.createElement('div');
          tag.className = 'shape-label-tag';
          // Compute physical dimension
          const lenMm = Math.sqrt(
            Math.pow((shape.x2 - shape.x1) / calibration.pxPerMmX, 2) +
            Math.pow((shape.y2 - shape.y1) / calibration.pxPerMmY, 2)
          );
          const convertedLen = convertMm(lenMm, workspace.activeUnit);
          tag.textContent = `${formatValue(convertedLen)} ${workspace.activeUnit}`;
          tag.style.transform = `translate(-50%, -100%) rotate(${-angle}rad)`; // counters parent rotation so text is readable
          shapeEl.appendChild(tag);
        }
      } 
      else {
        // Rectangle, Square, Circle
        if (shape.type === 'circle') {
          shapeEl.classList.add('shape-circle');
        } else if (shape.type === 'square') {
          shapeEl.classList.add('shape-square');
        } else {
          shapeEl.classList.add('shape-rect');
        }

        shapeEl.style.left = `${shape.x}px`;
        shapeEl.style.top = `${shape.y}px`;
        shapeEl.style.width = `${shape.width}px`;
        shapeEl.style.height = `${shape.height}px`;

        if (isSelected) {
          // Add 8 handles for scaling
          const handleNames = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
          handleNames.forEach(name => {
            const h = document.createElement('div');
            h.className = `shape-handle handle-${name}`;
            h.setAttribute('data-handle', name);
            shapeEl.appendChild(h);
          });

          // Dimensions badge tag
          const tag = document.createElement('div');
          tag.className = 'shape-label-tag';
          
          const wMm = shape.width / calibration.pxPerMmX;
          const hMm = shape.height / calibration.pxPerMmY;
          const wConv = convertMm(wMm, workspace.activeUnit);
          const hConv = convertMm(hMm, workspace.activeUnit);

          if (shape.type === 'circle') {
            tag.textContent = `Ø: ${formatValue(wConv)} ${workspace.activeUnit}`;
          } else if (shape.type === 'square') {
            tag.textContent = `${formatValue(wConv)} ${workspace.activeUnit}`;
          } else {
            tag.textContent = `${formatValue(wConv)} × ${formatValue(hConv)} ${workspace.activeUnit}`;
          }
          shapeEl.appendChild(tag);
        }
      }

      // Drag / Selection trigger listeners on shape
      shapeEl.addEventListener('mousedown', (e) => startShapeInteraction(e, shape));
      shapeEl.addEventListener('touchstart', (e) => startShapeInteraction(e, shape), { passive: false });

      canvasBoard.appendChild(shapeEl);
    });

    updateLayersUI();
  }

  function updateLayersUI() {
    if (!layersList) return;
    
    // Update count
    if (layersCount) {
      layersCount.textContent = workspace.shapes.length;
    }
    
    // Toggle empty state
    if (workspace.shapes.length === 0) {
      layersEmptyState.classList.remove('hidden');
      layersList.innerHTML = '';
      return;
    } else {
      layersEmptyState.classList.add('hidden');
    }
    
    // Build list items
    layersList.innerHTML = '';
    workspace.shapes.forEach((shape, index) => {
      const li = document.createElement('li');
      li.className = `layer-item ${shape.id === workspace.selectedShapeId ? 'active' : ''}`;
      
      // Select icon based on shape type
      let iconSvg = '';
      if (shape.type === 'rectangle') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="layer-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>`;
      } else if (shape.type === 'square') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="layer-icon"><rect x="4" y="4" width="16" height="16" rx="0"/></svg>`;
      } else if (shape.type === 'circle') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="layer-icon"><circle cx="12" cy="12" r="10"/></svg>`;
      } else if (shape.type === 'line') {
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="layer-icon"><line x1="6" y1="18" x2="18" y2="6"/></svg>`;
      }
      
      const shapeName = `${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)} ${index + 1}`;
      
      li.innerHTML = `
        <div class="layer-name-group">
          ${iconSvg}
          <span>${shapeName}</span>
        </div>
        <button class="layer-action-delete" title="Delete Layer">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
        </button>
      `;
      
      // Click to select
      li.addEventListener('click', (e) => {
        if (e.target.closest('.layer-action-delete')) return;
        workspace.selectedShapeId = shape.id;
        renderShapes();
        updateSidebarDetails();
      });
      
      // Click to delete
      li.querySelector('.layer-action-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        workspace.shapes = workspace.shapes.filter(s => s.id !== shape.id);
        if (workspace.selectedShapeId === shape.id) {
          workspace.selectedShapeId = null;
        }
        renderShapes();
        updateSidebarDetails();
      });
      
      layersList.appendChild(li);
    });
  }

  // ---------------------------------------------------------------------------
  // 8. SHAPE INTERACTION LOGIC (DRAG & RESIZE)
  // ---------------------------------------------------------------------------
  
  function startShapeInteraction(e, shape) {
    e.preventDefault();
    e.stopPropagation();

    // Select shape
    workspace.selectedShapeId = shape.id;
    renderShapes();
    updateSidebarDetails();

    const coords = getEventCoords(e);
    const handleEl = e.target.closest('.shape-handle');

    if (handleEl) {
      // User clicked a handle -> resize mode
      workspace.dragAction = 'resizing';
      workspace.activeHandle = handleEl.getAttribute('data-handle');
      workspace.dragStart = { x: coords.x, y: coords.y };
      
      if (shape.type === 'line') {
        workspace.shapeInitialState = {
          x1: shape.x1,
          y1: shape.y1,
          x2: shape.x2,
          y2: shape.y2
        };
      } else {
        workspace.shapeInitialState = {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height
        };
      }
    } 
    else {
      // User clicked shape body -> drag/move mode
      workspace.dragAction = 'dragging';
      workspace.dragStart = { x: coords.x, y: coords.y };
      
      if (shape.type === 'line') {
        workspace.shapeInitialState = {
          x1: shape.x1,
          y1: shape.y1,
          x2: shape.x2,
          y2: shape.y2
        };
      } else {
        workspace.shapeInitialState = {
          x: shape.x,
          y: shape.y
        };
      }
    }
  }

  function handleShapeInteractionMove(e) {
    if (!workspace.dragAction || !workspace.selectedShapeId) return;
    
    e.preventDefault();
    const coords = getEventCoords(e);
    const shape = getSelectedShape();
    if (!shape) return;

    const dx = coords.x - workspace.dragStart.x;
    const dy = coords.y - workspace.dragStart.y;
    const init = workspace.shapeInitialState;

    if (workspace.dragAction === 'dragging') {
      // Moving shape
      if (shape.type === 'line') {
        shape.x1 = Math.max(0, Math.min(2000, init.x1 + dx));
        shape.y1 = Math.max(0, Math.min(2000, init.y1 + dy));
        shape.x2 = Math.max(0, Math.min(2000, init.x2 + dx));
        shape.y2 = Math.max(0, Math.min(2000, init.y2 + dy));
      } else {
        shape.x = Math.max(0, Math.min(2000 - shape.width, init.x + dx));
        shape.y = Math.max(0, Math.min(2000 - shape.height, init.y + dy));
      }
    } 
    else if (workspace.dragAction === 'resizing') {
      // Resizing shape
      if (shape.type === 'line') {
        if (workspace.activeHandle === 'line-start') {
          shape.x1 = Math.max(0, Math.min(2000, init.x1 + dx));
          shape.y1 = Math.max(0, Math.min(2000, init.y1 + dy));
        } else if (workspace.activeHandle === 'line-end') {
          shape.x2 = Math.max(0, Math.min(2000, init.x2 + dx));
          shape.y2 = Math.max(0, Math.min(2000, init.y2 + dy));
        }
      } 
      else {
        // Rectangle, Square, Circle
        let newW = init.width;
        let newH = init.height;
        let newX = init.x;
        let newY = init.y;

        const isLockedRatio = (shape.type === 'square' || shape.type === 'circle');
        // If locked ratio, we match height to width using the default 1:1 scale
        
        switch (workspace.activeHandle) {
          case 'e':
            newW = init.width + dx;
            if (isLockedRatio) newH = newW;
            break;
          case 'w':
            newW = init.width - dx;
            newX = init.x + dx;
            if (isLockedRatio) {
              newH = newW;
              newY = init.y + (init.width - newW) / 2; // Keep center centered
            }
            break;
          case 's':
            newH = init.height + dy;
            if (isLockedRatio) newW = newH;
            break;
          case 'n':
            newH = init.height - dy;
            newY = init.y + dy;
            if (isLockedRatio) {
              newW = newH;
              newX = init.x + (init.height - newH) / 2;
            }
            break;
          case 'se':
            newW = init.width + dx;
            newH = init.height + dy;
            if (isLockedRatio) {
              newW = (newW + newH) / 2;
              newH = newW;
            }
            break;
          case 'ne':
            newW = init.width + dx;
            newH = init.height - dy;
            newY = init.y + dy;
            if (isLockedRatio) {
              newW = (newW + newH) / 2;
              newH = newW;
              newY = init.y + (init.height - newH);
            }
            break;
          case 'sw':
            newW = init.width - dx;
            newX = init.x + dx;
            newH = init.height + dy;
            if (isLockedRatio) {
              newW = (newW + newH) / 2;
              newH = newW;
              newX = init.x + (init.width - newW);
            }
            break;
          case 'nw':
            newW = init.width - dx;
            newX = init.x + dx;
            newH = init.height - dy;
            newY = init.y + dy;
            if (isLockedRatio) {
              newW = (newW + newH) / 2;
              newH = newW;
              newX = init.x + (init.width - newW);
              newY = init.y + (init.height - newH);
            }
            break;
        }

        // Min dimensions limit (e.g. 10px limit)
        if (newW >= 10 && newH >= 10 && newX >= 0 && newY >= 0) {
          shape.width = Math.round(newW);
          shape.height = Math.round(newH);
          shape.x = Math.round(newX);
          shape.y = Math.round(newY);
        }
      }
    }

    renderShapes();
    updateSidebarDetails();
  }

  function endShapeInteraction() {
    workspace.dragAction = null;
    workspace.activeHandle = null;
  }

  // ---------------------------------------------------------------------------
  // 9. SIDEBAR DETAILS LIVE SYNC
  // ---------------------------------------------------------------------------
  
  function updateSidebarDetails() {
    const shape = getSelectedShape();

    if (!shape) {
      noShapeSelectedMsg.classList.remove('hidden');
      shapeDetailsContainer.classList.add('hidden');
      return;
    }

    noShapeSelectedMsg.classList.add('hidden');
    shapeDetailsContainer.classList.remove('hidden');
    
    // Capitalize type text
    selectedShapeTypeLabel.textContent = shape.type.charAt(0).toUpperCase() + shape.type.slice(1);
    
    // Calculate physical quantities in mm first
    let physicalProps = {};

    if (shape.type === 'line') {
      // Line: Length only
      const dxMm = (shape.x2 - shape.x1) / calibration.pxPerMmX;
      const dyMm = (shape.y2 - shape.y1) / calibration.pxPerMmY;
      const lengthMm = Math.sqrt(dxMm*dxMm + dyMm*dyMm);
      
      physicalProps = {
        row1: { label: 'Length', val: convertMm(lengthMm, workspace.activeUnit), unit: workspace.activeUnit },
        row2: null,
        row3: null,
        row4: null
      };

      // Disable/Hide inputs
      adjWGroup.classList.add('hidden');
      adjHGroup.classList.add('hidden');
    } 
    else if (shape.type === 'circle') {
      // Circle: Diameter, Radius, Circumference, Area
      const diaMm = shape.width / calibration.pxPerMmX;
      const radMm = diaMm / 2;
      const circMm = Math.PI * diaMm;
      const areaMmSq = Math.PI * radMm * radMm;

      // Area unit conversion (millimeter squared to cm squared or inch squared)
      let areaUnit = 'mm²';
      let convertedArea = areaMmSq;
      if (workspace.activeUnit === 'cm') {
        convertedArea = areaMmSq / 100;
        areaUnit = 'cm²';
      } else if (workspace.activeUnit === 'in') {
        convertedArea = areaMmSq * 0.0015500031;
        areaUnit = 'in²';
      }

      physicalProps = {
        row1: { label: 'Diameter', val: convertMm(diaMm, workspace.activeUnit), unit: workspace.activeUnit },
        row2: { label: 'Radius', val: convertMm(radMm, workspace.activeUnit), unit: workspace.activeUnit },
        row3: { label: 'Circumference', val: convertMm(circMm, workspace.activeUnit), unit: workspace.activeUnit },
        row4: { label: 'Area', val: convertedArea, unit: areaUnit }
      };

      // Show diameter input only
      adjWGroup.classList.remove('hidden');
      adjHGroup.classList.add('hidden');
      adjWidthLabel.textContent = 'Diameter:';
      
      const currentVal = convertMm(diaMm, workspace.activeUnit);
      adjWidthInput.value = parseFloat(currentVal.toFixed(2));
    } 
    else {
      // Rectangle or Square
      const wMm = shape.width / calibration.pxPerMmX;
      const hMm = shape.height / calibration.pxPerMmY;
      const areaMmSq = wMm * hMm;
      const perimMm = 2 * (wMm + hMm);

      let areaUnit = 'mm²';
      let convertedArea = areaMmSq;
      if (workspace.activeUnit === 'cm') {
        convertedArea = areaMmSq / 100;
        areaUnit = 'cm²';
      } else if (workspace.activeUnit === 'in') {
        convertedArea = areaMmSq * 0.0015500031;
        areaUnit = 'in²';
      }

      physicalProps = {
        row1: { label: 'Width', val: convertMm(wMm, workspace.activeUnit), unit: workspace.activeUnit },
        row2: { label: 'Height', val: convertMm(hMm, workspace.activeUnit), unit: workspace.activeUnit },
        row3: { label: 'Area', val: convertedArea, unit: areaUnit },
        row4: { label: 'Perimeter', val: convertMm(perimMm, workspace.activeUnit), unit: workspace.activeUnit }
      };

      // Setup inputs
      adjWGroup.classList.remove('hidden');
      if (shape.type === 'square') {
        adjHGroup.classList.add('hidden');
        adjWidthLabel.textContent = 'Side Length:';
      } else {
        adjHGroup.classList.remove('hidden');
        adjWidthLabel.textContent = 'Width:';
        adjHeightLabel.textContent = 'Height:';
        
        const currentHeightVal = convertMm(hMm, workspace.activeUnit);
        adjHeightInput.value = parseFloat(currentHeightVal.toFixed(2));
      }
      
      const currentWidthVal = convertMm(wMm, workspace.activeUnit);
      adjWidthInput.value = parseFloat(currentWidthVal.toFixed(2));
    }

    // Apply properties to HTML stat boxes
    applyStatRow(1, physicalProps.row1);
    applyStatRow(2, physicalProps.row2);
    applyStatRow(3, physicalProps.row3);
    applyStatRow(4, physicalProps.row4);
  }

  function applyStatRow(rowNum, prop) {
    const rowEl = document.getElementById(`stat-row-${rowNum}`);
    if (!prop) {
      rowEl.classList.add('hidden');
      return;
    }

    rowEl.classList.remove('hidden');
    rowEl.querySelector('.dim-label').textContent = prop.label;
    rowEl.querySelector('.dim-value').textContent = formatValue(prop.val);
    rowEl.querySelector('.dim-unit').textContent = prop.unit;
  }

  // Handle Manual Input Edits
  function handleManualWidthChange() {
    const shape = getSelectedShape();
    if (!shape || shape.type === 'line') return;

    let inputVal = parseFloat(adjWidthInput.value);
    if (isNaN(inputVal) || inputVal <= 0) return;

    // Convert input back to pixels
    const valInMm = convertToMm(inputVal, workspace.activeUnit);
    const valPx = valInMm * calibration.pxPerMmX;

    shape.width = Math.round(valPx);
    if (shape.type === 'square' || shape.type === 'circle') {
      shape.height = Math.round(valPx);
    }
    
    renderShapes();
    updateSidebarDetails();
  }

  function handleManualHeightChange() {
    const shape = getSelectedShape();
    if (!shape || shape.type !== 'rectangle') return;

    let inputVal = parseFloat(adjHeightInput.value);
    if (isNaN(inputVal) || inputVal <= 0) return;

    const valInMm = convertToMm(inputVal, workspace.activeUnit);
    const valPx = valInMm * calibration.pxPerMmY;

    shape.height = Math.round(valPx);
    
    renderShapes();
    updateSidebarDetails();
  }

  function triggerSpinnerChange(prop, stepDelta) {
    const input = (prop === 'width') ? adjWidthInput : adjHeightInput;
    let val = parseFloat(input.value) || 0;
    val = Math.max(0.1, val + stepDelta);
    input.value = val;
    
    if (prop === 'width') {
      handleManualWidthChange();
    } else {
      handleManualHeightChange();
    }
  }


  // ---------------------------------------------------------------------------
  // 10. KEYBOARD & ARROW MICRO-TUNING CONTROLS
  // ---------------------------------------------------------------------------
  
  function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept shortcuts if user is typing inside input boxes
      if (document.activeElement.tagName === 'INPUT') return;

      const shape = getSelectedShape();
      if (!shape) return;

      const isShift = e.shiftKey;
      const step = isShift ? 10 : 1; // 10px jump if shift held, else 1px

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          moveSelectedShape(0, -step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveSelectedShape(0, step);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          moveSelectedShape(-step, 0);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveSelectedShape(step, 0);
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          deleteSelectedShape();
          break;
      }
    });
  }

  function moveSelectedShape(dx, dy) {
    const shape = getSelectedShape();
    if (!shape) return;

    if (shape.type === 'line') {
      shape.x1 = Math.max(0, Math.min(2000, shape.x1 + dx));
      shape.y1 = Math.max(0, Math.min(2000, shape.y1 + dy));
      shape.x2 = Math.max(0, Math.min(2000, shape.x2 + dx));
      shape.y2 = Math.max(0, Math.min(2000, shape.y2 + dy));
    } else {
      shape.x = Math.max(0, Math.min(2000 - shape.width, shape.x + dx));
      shape.y = Math.max(0, Math.min(2000 - shape.height, shape.y + dy));
    }

    renderShapes();
    updateSidebarDetails();
  }

  // Start Application
  init();
});

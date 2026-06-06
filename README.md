<<<<<<< HEAD
# SmartScale
SmartScale is a browser-based measurement tool that turns your screen into a digital ruler. Calibrate your display once, then measure real-world objects like rings, paper, cards, and other items using interactive overlays. Get accurate dimensions, diameter, area, and perimeter instantly with a simple and intuitive interface.
=======
# 📏 SmartScale

<div align="center">

### Measure Real-World Objects Directly From Your Screen

Turn your display into a precision measurement tool. SmartScale is a fast, responsive, browser-based utility that lets you calibrate your screen and measure physical objects by matching digital overlays to real-world items placed directly on your display.

</div>

---

## ✨ Features

* **⚙️ Interactive Calibration Wizard**
  * Calibrate your screen using any standard plastic card (ATM card, credit card, driver's license).
  * Smooth drag-and-resize card overlay to calculate a precise horizontal and vertical pixel-to-millimeter ratio.
  * Calibration data is saved in local browser storage so it persists between sessions.
* **📐 Figma-Inspired Measurement Workspace**
  * **Landscape Layout**: Professional 3-column architecture (Layers Panel on the left, Central Canvas Viewport in the middle, Properties Panel on the right).
  * **Dynamic Layers Sidebar**: Lists all active shapes with icons; supports selection highlighting and quick delete.
  * **Artboard Canvas Viewport**: A centered workspace container with a clean 20px grid alignment, dynamic dimensions tag, and top floating helper banner.
  * **Right Properties Panel**: Shows precise real-time properties (width, height, area, perimeter, diameter, radius) with arrow keys micro-tuning and manual spinner controls.
* **✏️ Shape Measurement Tools**
  * 📏 **Line Tool** (length measurement)
  * ▭ **Rectangle Tool** (independent width & height scaling)
  * ⬜ **Square Tool** (locked 1:1 aspect ratio sizing)
  * ⭕ **Circle Tool** (diameter and radius calculation)
* **💍 Precision Ring Sizing Tool**
  * Interactive ring circle overlay with handles for quick sizing.
  * Integrated **Indian** and **US / Canada** international ring sizing chart standards.
  * Real-time circumference and diameter indicators with matching highlighted rows in the interactive reference table.
* **🛡️ No Dependencies & No Login**
  * Zero server dependencies—runs entirely offline in the browser.
  * No databases, tracking scripts, or accounts needed.

---

## 🚀 How SmartScale Works

### 1️⃣ Calibrate Your Screen
1. Click **Calibrate** in the header or sidebar.
2. Place a physical ATM card or ID card on the screen.
3. Use the slider or drag handles to align the digital blue card with your physical card.
4. Click **Save Calibration** to set the pixel-to-millimeter ratio.

### 2️⃣ Place Your Object
1. Go to the **Workspace** tab.
2. Select one of the shape overlay tools (Rectangle, Square, Circle, or Line) from the top toolbar.
3. Place your real object (e.g., a coin, stamp, or credit card) flat on the display.

### 3️⃣ Align and Read Results
1. Drag and scale the shape using its blue corner handles until it perfectly covers your physical object.
2. Read the calculated metrics (Width, Height, Area, Perimeter, etc.) in the right-hand **Properties Panel**.
3. Use your keyboard **arrow keys** (or hold **Shift + arrows**) to micro-tune the shape size/position for high accuracy.

---

## 🛠️ Tech Stack

| Component     | Technology            | Purpose                             |
| ------------- | --------------------- | ----------------------------------- |
| **HTML5**     | Semantic Elements     | Application structure and modal UI  |
| **CSS3**      | Grid & Flexbox layout | Figma landscape aesthetics & theme  |
| **JavaScript**| Pure ES6+ Vanilla JS  | Event handling, state & calculations|
| **Storage**   | Web LocalStorage API  | Persisting screen calibration ratio |

---

## 📂 Project Structure

```bash
SmartScale/
├── index.html   # Main Single-Page HTML file containing routing views
├── style.css    # Figma-themed core stylesheet & layouts
└── app.js       # Core application state, interactions, and calculations
```

---

## 🔒 Privacy & Security

* **100% Client-Side**: All calculations and drawings take place directly in your web browser.
* **No Telemetry**: No analytics tracking, external API calls, or cookies are stored.
* **Offline Ready**: The application operates perfectly without an active internet connection.

---

<div align="center">

### 📏 SmartScale

Measure Smarter. Measure Faster.

</div>
>>>>>>> 2ca2cc1 (https://github.com/vskmaster/SmartScale.git)

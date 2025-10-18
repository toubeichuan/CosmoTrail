# CosmoTrail: Interactive Astronomical Visualization System
*A Web-based 3D Simulation for Exploring Planetary Systems*

> An educational, browser-based 3D visualization project for exploring orbital mechanics across multiple planetary systems.  
> Built with **Three.js** + **WebGL**, powered by real ephemerides and analytical models.

---

## Table of Contents
- [CosmoTrail: Interactive Astronomical Visualization System](#cosmotrail-interactive-astronomical-visualization-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Data Sources](#data-sources)
  - [Quick Start](#quick-start)
  - [Usage](#usage)
  - [Acknowledgments](#acknowledgments)
  - [License](#license)

---

## Overview
**CosmoTrail** is an in-browser 3D astronomical visualization system. It combines **GPU-accelerated rendering** with planetary data from **NASA/JPL** and classic analytical models (e.g., **VSOP87** and **ELP2000-82B**). In a single page you can switch among **Solar System**, **Earth–Moon**, and **Jupiter** scenarios, adjust simulation time and speed, and interactively grasp celestial mechanics.

---

## Features
- **Seamless multi-system switching**: Solar System, Earth–Moon, and Jupiter.
- **Data-driven**: **JPL DE430** ephemerides, **VSOP87** (planets), **ELP2000-82B** (Moon).
- **GPU-optimized rendering**: extensive use of `BufferGeometry`, single draw calls for starfields, and additive blending for luminous skies.
- **Real-time control panel**: adjust simulation time, timestep, speed, camera, and scene switching.
- **Dynamic scaling & physically-motivated lighting**: balances visibility with plausibility across vastly different scales.
- **Education-first**: visualize Keplerian motion, hierarchical orbits (moons about planets), and frame transformations.

---

## Data Sources
- **NASA JPL DE430** ephemerides (planetary positions & orbital parameters)
- **VSOP87** analytical planetary model
- **ELP2000-82B** lunar motion model
- **NASA HEASARC / AstroNexus** star catalogs (starfield)

> Tip: Preprocess coefficients/splines/tables into the `data/` folder to accelerate runtime. Heavy computations can also be performed at build time.

---

## Quick Start
> Requires **Node.js 18+** and a modern browser with **WebGL2** support.

```bash
# 1) Get the code
git clone https://github.com/toubeichuan/CosmoTrail.git
cd CosmoTrail

# 2) Install dependencies
npm install

# 3) Run in development
npm run dev

# 4) Build for production
npm run build
```

---

## Usage
- **Camera**: drag to rotate, mouse wheel to zoom; `OrbitControls` recommended.
- **Time**:
  - `Play/Pause` toggles the simulation;
  - Adjust **Δt** (time step) and **speed multiplier** in the GUI;
  - Jump to a specific epoch (UTC/TT).
- **Scenarios**: switch among Solar / Earth–Moon / Jupiter instantly.
- **Visual Layers**: toggle orbit lines, labels, lighting, starfield, etc.
- **Units**: Astronomical Unit (AU), kilometers (km), degrees (deg).

---

## Acknowledgments

---

## License
Unspecified. If you don’t have a preference, consider **MIT** or **Apache-2.0** and include a `LICENSE` file.
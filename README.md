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
  - [Project Structure](#project-structure)
  - [Acknowledgments](#acknowledgments)
  - [License](#license)

---

## Overview
**CosmoTrail** is an in-browser 3D astronomical visualization system. It combines **GPU-accelerated rendering** with planetary data from **NASA/JPL** and classic analytical models (e.g., **VSOP87** and **ELP2000-82B**). In a single page you can switch among **Solar System**, **Earth–Moon**, and **Jupiter** scenarios, adjust simulation time and speed, and interactively grasp celestial mechanics.

Unlike conventional planetarium software that requires installation and local resources, this simulator runs entirely in a web browser. Its lightweight design enables students, educators, and astronomy enthusiasts to access complex celestial visualizations instantly—anytime and anywhere.

---

## Features
- **Seamless multi-system switching**: Solar System, Earth–Moon, and Jupiter.
- **Data-driven**: **JPL DE430** ephemerides, **VSOP87** (planets), **ELP2000-82B** (Moon).
- **GPU-optimized rendering**: extensive use of `BufferGeometry`, single draw calls for starfields, and additive blending for luminous skies.
- **Real-time control panel**: adjust simulation time, timestep, speed, camera, and scene switching.
- **Dynamic scaling & physically-motivated lighting**: balances visibility with plausibility across vastly different scales.
- **Education-first**: visualize Keplerian motion, hierarchical orbits (moons about planets), and frame transformations.
- **Web-based**: runs on any modern browser without setup.
- **Scenario-driven**: switch seamlessly among the Solar System, Earth–Moon System, and Jupiter System.
- **Parameter-controlled**: provides intuitive tools to adjust time, animation speed, and camera view.

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
npm start

# 4) Build for production
npm run build
```

> Note: The development server will start on port 2000. Access the application at http://localhost:2000

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

### System Parameters
- Scenario selection: Solar System / Earth–Moon System / Jupiter System
- Ephemeris date control via interactive time slider
- Adjustable simulation speed

### Viewport Telemetry
- Switch origin or point of view
- Lock camera to a specific celestial body
- Adjust planet scale for visibility and comparison

### Planet Information Panel
- Displays real-time orbital and physical data of the currently locked target

---

## Acknowledgments
We would like to thank Ian Bond for his guidance throughout this project. We also acknowledge the developers of Three.js, contributors to WebGL standards, and NASA for providing the ephemeris data that powers the accuracy of this visualization. Additionally, we are grateful for the open-source community and educational resources that supported this work.

---

## License
This project is licensed under the MIT License.
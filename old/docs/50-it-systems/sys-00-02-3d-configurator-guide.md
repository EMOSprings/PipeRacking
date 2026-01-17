# 3D Configurator Development Guide

| | |
|---|---|
| **ID** | SYS-00-02 |
| **Status** | DRAFT |
| **Owner** | Gemini |
| **Approver** | |

## 1. Vision & Goals

This document outlines the development plan for the 3D product configurator, a core component of the Pipe Racking Digital OS.

The primary goal is to create a user-friendly, web-based tool that allows customers to design and visualize their own **custom, cuboid-shaped racking units built from key-clamp fittings and pipe.**

The tool will serve two main purposes:
1.  **Customer-Facing:** To provide an intuitive interface for customers to create a racking unit to their exact specifications, see it in 3D, and receive an instant, estimated price.
2.  **Internal Business:** To automatically generate a Bill of Materials (BOM) and a set of build instructions, streamlining the internal quoting and manufacturing process.

## 2. Feature Breakdown

To manage complexity, the project will be broken down into two phases: the initial Minimum Viable Product (MVP) and a list of future enhancements.

### 2.1. Minimum Viable Product (MVP)

*   **Parametric Inputs:** Users can define the core dimensions of their racking unit: Overall Height, Width, Depth; Number of Shelves; Pipe Outer Diameter.
*   **Real-Time 3D Visualization:** A clean, interactive 3D view that updates instantly as parameters are changed.
*   **Real-Time Outputs:** An estimated cost and a Bill of Materials (BOM).

### 2.2. Future Enhancements (Post-MVP)

*   **Material/Finish Options:** Metal Finish (Raw, Galvanised, Powder Coat), Shelf Surface (MDF, Plywood, etc.).
*   **Accessory & Add-On Options:** Castors, Strengthening Collars, Hooks, Mounting Flanges.
*   **Advanced Structural Options:** Intermediate vertical supports or horizontal bracing.
*   **Fulfilment Options:** DIY Kit vs. Fully Assembled.
*   **Data Export:** Customer-facing 3D file download (STEP, STL).
*   **Internal Tools:** Generated PDF build instructions.

## 3. User Interface (UI) & User Experience (UX) Flow

### 3.1. Screen Layout

*   **Left Panel (70% width):** The main 3D viewport.
*   **Right Panel (30% width):** The configuration panel with all user controls.

### 3.2. User Journey

The user changes parameters in the right panel, and the 3D view and data outputs update in real-time.

## 4. Asset Pipeline & Data Structure

This section defines the technical specifications for our assets and the data that represents a configuration.

### 4.1. 3D Model Asset Pipeline (for Key-Clamp Fittings)

This outlines the workflow for bringing 3D models from the CAD software (Autodesk Fusion 360) into the web application.

*   **CAD Export Format:** `Wavefront OBJ (*.obj)`. This is a native export option in Fusion 360 and is universally supported.
*   **Purpose:** The `.obj` file will be treated as a **shape container** that defines the geometry of a fitting. The associated material file (`.mtl`) that is exported alongside it can be **disregarded**.
*   **Coordinate System:** Y-up, to match the Three.js default.
*   **Scale:** **1 world unit = 1 millimeter.** All models must be exported from Fusion 360 at this scale.
*   **Origin Point:** The origin of each model should be placed at a logical pivot/connection point (e.g., the center of a pipe bore).
*   **Naming Convention:** `fitting-[part_number].obj` (e.g., `fitting-101.obj`).

### 4.2. Programmatic Material Definition

Instead of relying on materials defined in the CAD software, we will define and apply them programmatically within the Three.js application. This provides maximum flexibility and performance.

*   **Material Library:** A library of `THREE.Material` objects will be created in the code to represent our available finishes (e.g., `rawSteelMaterial`, `galvanisedMaterial`).
*   **Dynamic Application:** When a user selects a new finish from the UI, the application will simply swap the `.material` property on the corresponding 3D objects. This is an extremely efficient operation.

### 4.3. Asset Storage

All `.obj` 3D models will be stored in a dedicated directory:
`apps/3d-configurator/assets/models/`

### 4.4. Configuration Data Model

The entire state of the user's design will be held in a single JavaScript object. This object is the "single source of truth" that drives the 3D scene, the BOM, and the cost estimate.

**Example MVP Data Object:**
```json
{
  "dimensions": {
    "height": 2000,
    "width": 1500,
    "depth": 500
  },
  "pipe": {
    "diameter": 48.3,
    "finish": "galvanised"
  },
  "shelves": {
    "count": 3
  }
}
```

## 5. Technology Research & "Gold Standard" Benchmark

(This section confirms Three.js as the library of choice due to its suitability for procedural geometry.)

## 6. Development Milestones

(The first milestone is to create a parametric pipe and a basic scene.)

# Project Context: Pipe Racking Digital OS

**To the AI Assistant:** This document outlines the vision, goals, and architectural principles for the "Pipe Racking" project. Use this context when helping generate new content or code.

## 1. Core Vision & Goals

This project is broken down into a hierarchy of goals, from the core business concept to the specific learning objectives.

### Goal 0: The Business Concept
To create a small, web-based business that sells customized, semi-modular racking based on "pipe clamp" fittings. The key feature will be a customer-facing website that allows users to visualize what they are buying using modern 3D web tools.

### Primary Goal: The Digital Operating System
To build a fully digital work area that supports the entire business. This "Digital OS" will encompass:
*   **Customer-Facing Platform:** The main website, including the 3D product configurator and e-commerce functionality.
*   **Internal Business Platform:** Staff-facing tools for managing core business functions, including:
    *   **Quality Management:** A system built to be compliant with ISO 9001:2015, covering documentation, traceability, version control, and approval workflows.
    *   **Commercial:** Sales processes, quoting, and customer relationship management.
    *   **Operations:** SOPs and manufacturing instructions.
    *   **Finance:** Invoicing and purchasing.
    *   **HR:** An employee knowledge base.

### Secondary Goal: Learning Objectives
The ultimate purpose of this project is to serve as a practical learning environment. The key learning objectives are:
*   To learn and apply the skills necessary to implement a similar Digital OS for an established Ltd. company.
*   To master the development of a 3D product configurator for the web.
*   To build a comprehensive and ISO 9001-compliant Quality and HR knowledge base.
*   To explore and integrate other business tools and technologies as they become relevant during the project's journey.

## 2. Architecture & Tech Stack

*   **Approach:** A "Docs-as-Code" methodology will be used, where all documentation, procedures, and system configurations are managed as version-controlled text files.
*   **Repository:** The project's source code is hosted on GitHub at [https://github.com/EMOSprings/PipeRacking](https://github.com/EMOSprings/PipeRacking).
*   **Environment:** The project is developed within Project IDX, using a Nix-based configuration (`.idx/dev.nix`) for a reproducible environment.
*   **Documentation & Frontend:** MkDocs with the Material theme will serve as the framework for the documentation and potentially the initial frontend.
*   **3D Configurator:** A custom application built with HTML/JS/Canvas (or other web 3D libraries).

## 2.5. Localisation

*   **Jurisdiction:** The business operates under the laws and regulations of the United Kingdom.
*   **Language and Spelling:** All content should use British English spelling and grammar (e.g., "colour" not "color", "organise" not "organize").
*   **Financials:** All financial transactions, reporting, and planning will be conducted in Pound Sterling (GBP, £) and must comply with UK financial regulations.

## 2.6. Tone of Voice

*   **Core Principle:** All communication, both internal and external, must be **honest, clear, and straightforward.**
*   **Guideline:** We value authenticity and clarity over jargon. The language should be simple, direct, and easy to understand.
*   **To Avoid:** Avoid overly corporate, "buzzword-heavy" language. For example, instead of phrases like "empowering creators" or "leveraging synergies," we should use concrete and direct descriptions of what we do and the value we provide.

## 3. Directory Structure

The project simulates a startup environment with the following departmental structure. All documentation lives in `docs/`.

*   `00-governance/`: The "Constitution" (ISO Manual, Policy Statements, Startup Artifacts).
*   `10-commercial/`: Sales processes, Quoting, CRM logic.
*   `20-operations/`: Shop floor SOPs, Manufacturing instructions.
*   `30-finance/`: Invoicing, Purchasing.
*   `40-hr/`: Human Resources documentation and knowledge base.
*   `50-it-systems/`: Meta-documentation, system guides.
*   `apps/3d-configurator/`: The source code for the 3D tool.
*   `assets/`: Shared images, PDFs, and diagrams.

## 4. Content Standards (The "Gold Standard")

To maintain ISO 9001 compliance, all Standard Operating Procedures (SOPs) must adhere to a strict template.

*   **Key Elements:**
    *   **Frontmatter:** `title`, `id`, `status`, `owner`, `approver`.
    *   **Admonitions:** Use `!!! warning` for safety/inventory risks and `!!! failure` for common errors.
    *   **Tables:** Use Markdown tables for validation checkpoints.

## 5. Future Considerations: ERP Integration

While the initial focus is on building a self-contained Digital OS, future integration with a full-fledged ERP system like **Odoo** remains a possibility. Potential use cases include:
*   Advanced inventory and stock control.
*   Comprehensive financial accounting packages.
*   Automated data synchronization between the Digital OS and the ERP.

This integration will be explored once the core platform is mature.

## 6. App: 3D Racking Configurator

This section details the context for the 3D product configurator, a key component of the customer-facing platform.

### 6.1. Goal

The goal is to create a web-based tool that allows users to parametrically design a racking unit, view it in 3D, and eventually generate a bill of materials.

### 6.2. Tech Stack

- **3D Rendering:** Three.js
- **Application Logic:** JavaScript (ES6 Modules)
- **Development Server:** Caddy (configured in `.idx/dev.nix`)

### 6.3. Development Milestones

1.  **Basic Structure:**
    - [x] Create a parametric `createPipe` function.
    - [x] Create a `createRacking` function to assemble the frame from pipes.
    - [x] Add horizontal shelf supports.
2.  **Fittings:**
    - [x] Implement a `createFitting` function.
    - [x] Implement dynamic loading for `.obj` models based on pipe diameter.
    - [x] Use placeholder geometry (red spheres) as a fallback for missing models. **(Current State)**
    - [ ] Source and add `.obj` models for all remaining pipe diameters.
3.  **User Interface:**
    - [x] Add UI controls for `height`, `width`, and `depth`.
    - [x] Implement a function to regenerate the model when the configuration changes.
4.  **Bill of Materials (BOM):**
    - [ ] Create a data structure to track all parts.
    - [ ] Display the BOM on the UI panel.

### 6.4. Current Status

The project's 3D viewer is in its initial development phase. The core 3D structure, including vertical posts, horizontal shelf pipes, and **placeholder fittings (red spheres)**, is procedurally generated based on a static configuration object in `main.js`. The application is served from the `apps/3d-configurator` directory using the Caddy web server, as defined in `.idx/dev.nix`. An attempt to add a `three-viewport-gizmo` was made and has been reverted.

### 6.5. Development Log

**Recent Activity**
*   **Attempted Gizmo Integration:** An attempt was made to integrate the `three-viewport-gizmo` library to add a viewport orientation gizmo to the 3D scene.
*   **Problem:** The integration resulted in a blank white screen, preventing the main racking model from rendering. Several attempts to fix the rendering loop and library integration were unsuccessful.
*   **Resolution:** All changes related to the `three-viewport-gizmo` have been reverted from `index.html` and `main.js`. The application is back to a stable state where the racking model renders correctly.
*   **Next Steps:** Future attempts to add a gizmo should proceed with caution. It is recommended to inspect the `three-viewport-gizmo` library's source code or documentation thoroughly before attempting integration again to understand its specific requirements for the renderer and scene setup.

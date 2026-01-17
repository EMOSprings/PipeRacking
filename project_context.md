# Project Context: Pipe Racking Digital OS

**To the AI Assistant:** This document outlines the vision, goals, and architectural principles for the "Pipe Racking" project. Use this context when helping generate new content or code.

## 1. Core Vision & Goals

This project is broken down into a hierarchy of goals, from the core business concept to the specific learning objectives.

### 1.1. The Business Concept
To create a small, web-based business that sells customized, semi-modular racking based on "pipe clamp" fittings. The key feature will be a customer-facing website that allows users to visualize what they are buying using modern 3D web tools.

### 1.2. The Digital Operating System
To build a fully digital work area that supports the entire business. This "Digital OS" will encompass:

*   **Customer-Facing Platform:** The main website, including the 3D product configurator and e-commerce functionality.
*   **Internal Business Platform:** Staff-facing tools for managing core business functions, including:
    *   **Quality Management:** A system built to be compliant with ISO 9001:2015, covering documentation, traceability, version control, and approval workflows.
    *   **Commercial:** Sales processes, quoting, and customer relationship management.
    *   **Operations:** SOPs and manufacturing instructions.
    *   **Finance:** Invoicing and purchasing.
    *   **HR:** An employee knowledge base.

### 1.3. Learning Objectives
The ultimate purpose of this project is to serve as a practical learning environment. The key learning objectives are:

*   To learn and apply the skills necessary to implement a similar Digital OS for an established Ltd. company.
*   To master the development of a 3D product configurator for the web.
*   To build a comprehensive and ISO 9001-compliant Quality and HR knowledge base.
*   To explore and integrate other business tools and technologies as they become relevant during the project's journey.

### 1.4. Guiding Principles
*   **Focus on the Customer:** We build our business around what our customers need. The 3D design tool and clear pricing are just the start.
*   **Just-in-Time (JIT) Stock:** We keep costs low by ordering parts from our suppliers only when a customer places an order. This reduces waste and storage needs.
*   **Always Improving (Kaizen):** We are always looking for ways to make our products, processes, and services better. Everyone is encouraged to suggest improvements.
*   **Make Smart Decisions:** We use real data from sales, operations, and customer feedback to make choices. This keeps us sharp and effective.

## 2. AI Persona & Interaction

### 2.1. Personas
When assisting with this project, you will adopt different personas based on the task at hand.

*   **QMS & Documentation Expert:**
    *   **Expertise:** You are an expert in creating and managing a **Quality Management System (QMS)** based on **ISO 9001**.
    *   **Tools:** You are proficient in using **MkDocs with the Material theme**.
    *   **Tone:** Professional, clear, and focused on creating a "single source of truth."

*   **3D Application Expert:**
    *   **Expertise:** You are an expert in **Three.js** and modern JavaScript (ES6+), with a deep understanding of 3D graphics principles and parametric, data-driven applications.

*   **Development Environment Expert:**
    *   **Expertise:** You are an expert in using the `.idx/dev.nix` file to define reproducible development environments for Firebase Studio.

### 2.2. Interaction Guidelines
*   Assume the user is familiar with general software development concepts but may be new to Nix and Firebase Studio.
*   When generating Nix code, provide comments to explain the purpose of different sections.
*   Explain the benefits of using `dev.nix` for reproducibility and dependency management.
*   If a request is ambiguous, ask for clarification on the desired tools, libraries, and versions.

## 3. Directory Structure

The project simulates a startup environment with the following departmental structure. All documentation will live in `docs/`.

*   `00-governance/`: The "Constitution" (ISO Manual, Policy Statements, Startup Artifacts).
*   `10-commercial/`: Sales processes, Quoting, CRM logic.
*   `20-operations/`: Shop floor SOPs, Manufacturing instructions.
*   `30-finance/`: Invoicing, Purchasing.
*   `40-hr/`: Human Resources documentation and knowledge base.
*   `50-it-systems/`: Meta-documentation, system guides.
*   `apps/3d-configurator/`: The source code for the 3D tool.
*   `assets/`: Shared images, PDFs, and diagrams.

## 4. Development Guidelines

*   **British English:** Use British English spelling in all documentation and user-facing text (e.g., "customise" instead of "customize", "colour" instead of "color").
*   **Documentation as Code:** All documentation will be written in Markdown.
*   **Single Source of Truth:** The `main` branch in the Git repository is the single source of truth.
*   **Third-Party Libraries:** When integrating a new third-party library, especially for the 3D viewer, first inspect its source code or documentation to understand its specific requirements. Do not assume its integration will be straightforward. If problems occur, revert to a known good state and analyze the library's code before trying again.

## 5. System Architecture

### 5.1. The "Digital OS" Metaphor
Our architecture is based on a simple metaphor that defines how the different components interact:

*   **The Website (Skeleton):** The foundational structure. It provides the main layout and navigation. The other, more complex applications are embedded within this skeleton, creating a unified experience without being tightly coupled.
*   **The 3D Configurator (Heart):** A standalone, data-driven JavaScript application. It will be the core of the customer-facing experience, embedded directly into the website "skeleton".
*   **The Documentation (Brain):** The internal knowledge base and QMS. It is a static site generated by MkDocs, also embedded into the website skeleton for staff.
*   **The Skin (CSS):** A shared, global stylesheet will be developed to ensure all components, whether standalone or embedded, have a consistent and professional appearance.

### 5.2. Technology Stack
*   **Website (Skeleton):** Simple, static **HTML**, **CSS**, and vanilla **JavaScript**. Served by **Caddy**.
*   **3D Configurator (Heart):** **Three.js** running in an HTML `<canvas>` element.
*   **Documentation (Brain):** **MkDocs** with the **Material for MkDocs** theme.
*   **Development Environment:** Managed via a **`.idx/dev.nix`** file to ensure consistency.
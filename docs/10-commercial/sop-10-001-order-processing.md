---
title: Processing 3D Configurator Orders
id: SOP-10-001
status: Draft
owner: Sales Manager
approver: Operations Director
created: 2024-05-21
tags:
  - commercial
  - odoo
  - 3d-app
---

# SOP-10-001: Processing 3D Configurator Orders

!!! warning "Compliance Notice"
    This procedure affects **inventory levels**. Ensure Odoo is running before proceeding.

## 1. Purpose
To define the method for converting a customer's visual design from the [3D Configurator](../apps/3d-configurator/index.md) into a manufacturing Bill of Materials (BOM) within Odoo.

## 2. Scope
This procedure applies to all "Standard" and "Custom" Pipe Racking orders generated via the website.

## 3. Responsibilities
* **Sales Team:** Reviewing the visual design for structural feasibility.
* **System (Automated):** Exporting the JSON/CSV data.
* **Production Manager:** Final approval of the BOM.

## 4. Procedure

### 4.1 Retrieval of Design Data
1.  Navigate to the admin panel of the 3D Web App.
2.  Locate the order by **Order ID** (e.g., `ORD-2024-XXXX`).
3.  Click **Export BOM**.
    * *Note: This will download a `.csv` file.*

### 4.2 Data Validation (The "Human Check")
Before importing to Odoo, verify the following:

| Checkpoint | Criteria |
| :--- | :--- |
| **Dimensions** | Height does not exceed 3000mm (requires special shipping). |
| **Joints** | Ensure joint count matches the tube connections shown in the visualizer. |
| **Load Rating** | If total load > 500kg, flag for Engineering Review. |

### 4.3 Odoo Import
1.  Open Odoo and navigate to **Manufacturing > Master Data > Bills of Materials**.
2.  Select **Import** and upload the validated CSV.
3.  Confirm the "Component Availability" status is green.

## 5. Troubleshooting

!!! failure "Common Error: 'Unknown Component ID'"
    If the 3D app exports a Part ID that Odoo does not recognize, do not force the import.
    **Action:** Create the missing product in Odoo first (Refer to [SOP-20-005: Creating New Parts](../20-operations/index.md)).

## 6. Version History

| Version | Date | Author | Change Description |
| :--- | :--- | :--- | :--- |
| 1.0 | 2024-05-21 | [Your Name] | Initial Draft |
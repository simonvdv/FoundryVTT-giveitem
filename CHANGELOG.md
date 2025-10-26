### Changelog

#### **1.0.2 Release**

* **Added current balance display:** Shows “(have: X)” next to each currency type label.
* **Added increment/decrement buttons:** `[-]` and `[+]` buttons allow adjusting values by 1.
* **Added Max button:** Instantly sets the value to your maximum available amount.
* **Added min/max validation:** Input fields now include `min="0"` and `max="[your amount]"` attributes.
* **Improved layout:** Introduced a two-column grid (Platinum/Gold/Copper on the left, Electrum/Silver on the right) to reduce dialog height.
* **Horizontal button layout:** All controls (`-`, `+`, Max, input) are aligned in a single row for each currency type.

---

#### **1.0.1 Release**

* Fixed an issue that prevented money transfers from working correctly.
* Cleaned up and streamlined the code (currently supports **D&D 5e** only).

---

#### **1.0.0 Initial Release**

* Introduced the **Give Item to Another Player** module for FoundryVTT.
* Added functionality for **trading items** and **sharing currency** directly between player characters.
* Implemented **recipient confirmation dialogs** to ensure safe and intentional trades.
* Included **automatic inventory updates** — items and coins transfer seamlessly without GM intervention.
* Added **GM transparency** — successful trades are whispered to the GM for oversight.
* Built-in **compatibility with D&D 5e (v4.0.0+)** and **FoundryVTT v13+**, using modern ApplicationV2 character sheets.

---

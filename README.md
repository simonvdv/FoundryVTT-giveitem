### Acknowledgment

I’d like to extend a huge thank you to [**Sepichat**](https://github.com/Sepichat) for creating the original **FoundryVTT-GiveItem** module.
Their foundational work was incredibly helpful, and I’m grateful for the time they’ve spent on this project, making it available to the community.

---

### Module Overview

**System:** D&D 5e (v4.0.0+)
**FoundryVTT Compatibility:** v13+
**Module:** Give Item to Another Player

This module enables seamless item and currency trading between player characters in FoundryVTT.

---

### Features

#### Item Trading

Transfer items easily between characters:

* Click the *hand* icon beside any inventory item.
* Choose the quantity and recipient.
* The recipient receives a confirmation dialog to accept or decline the trade.

#### Currency Sharing

Offer any combination of platinum, gold, electrum, silver, or copper coins to other players using the same “give” interface.

#### Smart Filtering

* Spells and feats are automatically excluded (since they’re not tradeable).
* Only other active player characters appear in the recipient list.

#### Safe Trading Flow

* Every transfer requires the recipient’s acceptance.
* Items and coins are automatically removed from the sender and added to the receiver.
* Items reaching zero quantity are automatically deleted.

#### GM Transparency

The GM receives whispered chat messages for all completed trades, maintaining visibility over player transactions.

---

### Why Use It

This module simplifies common gameplay moments such as:

> “Here, take this potion.”
> “I’ll give you 50 gold.”

No more manual inventory edits or GM intervention — just a smooth, reliable trade system.

---

### Installation

You can install the module in several ways:

#### 1. Install via FoundryVTT Add-on Modules Tab (Recommended)

1. Go to the **Add-on Modules** tab.
2. Click **Install Module**.
3. Search for `Give item to another player` and click **Install**.

#### 2. Direct URL Install

1. Go to the **Add-on Modules** tab.
2. Paste the following URL into the **Manifest URL** field:

   ```
   https://github.com/simonvdv/FoundryVTT-giveitem/releases/latest/download/module.json
   ```
3. Click **Install**.

#### 3. Manual Install

1. Clone or download the repository.
2. Extract it into your `Data/modules/give-item-to-player` folder.

---

### Support

This is a personal project developed in my free time.
Updates and fixes may take a while your patience and understanding are appreciated.

If you’d like to support my work, you can donate via PayPal:
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.com/donate/?hosted_button_id=WQ9KSEJTKGFHN)

---

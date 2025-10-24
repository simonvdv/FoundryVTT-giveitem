import { addGiveItemButton, addGiveItemButton5E, addGiveItemButton5E_V2, addGiveItemButtonPF2E, addGiveCurrency5E, addGiveCurrency5E2, addGiveCurrency5E_V2, addGiveCurrencyPF1E, addGiveCurrencyPF2E, addGiveCurrencyWFRP4E } from './actorOverride.js';
import { completeTrade, denyTrade, receiveTrade } from './trading.js';

console.log("Give Item Module | Initializing");

// ========================================
// DND5E V2 SHEET SUPPORT (v4.0.0+)
// ========================================
Hooks.on('renderApplicationV2', (app, context, options) => {
  console.log("Give Item Module | renderApplicationV2 hook fired");
  console.log("Give Item Module | App class:", app.constructor.name);
  
  // Check if this is a DnD5e character sheet
  if (game.system.id !== 'dnd5e') return;
  if (!app.document || app.document.documentName !== 'Actor') return;
  if (app.document.type !== 'character') return;
  
  console.log("Give Item Module | This is a DnD5e character sheet!");
  console.log("Give Item Module | Actor:", app.document.name);
  
  try {
    // For V2 apps, we need to get the element from the app itself
    const element = app.element;
    console.log("Give Item Module | App element:", element);
    
    if (!element) {
      console.warn("Give Item Module | No element found on app");
      return;
    }
    
    // Wrap the entire app element in jQuery
    const $html = $(element);
    console.log("Give Item Module | jQuery element:", $html.length);
    
    // Debug: Check what we can find
    console.log("Give Item Module | Items found:", $html.find('.item').length);
    console.log("Give Item Module | Inventory found:", $html.find('.inventory').length);
    
    addGiveItemButton5E($html, app.document);
    addGiveCurrency5E2($html, app.document);
    console.log("Give Item Module | V2 Buttons added successfully");
  } catch (error) {
    console.error("Give Item Module | Error adding V2 buttons:", error);
  }
});

// ========================================
// LEGACY V1 SHEET SUPPORT
// ========================================

// Universal hook that catches ALL actor sheets for dnd5e V1
Hooks.on('renderActorSheet', (sheet, html, data) => {
  // Only process for dnd5e system
  if (game.system.id !== 'dnd5e') return;
  
  // Only process character sheets
  if (sheet.actor.type !== 'character') return;
  
  console.log("Give Item Module | renderActorSheet hook fired for dnd5e character (V1)");
  console.log("Give Item Module | Sheet class:", sheet.constructor.name);
  console.log("Give Item Module | Actor:", sheet.actor.name);
  
  try {
    addGiveItemButton5E(html, sheet.actor);
    addGiveCurrency5E2(html, sheet.actor);
    console.log("Give Item Module | V1 Buttons added successfully");
  } catch (error) {
    console.error("Give Item Module | Error adding V1 buttons:", error);
  }
});

// Specific hooks for different versions (as fallback)
Hooks.on('renderActorSheet5eCharacter', (sheet, html, character) => {
  console.log("Give Item Module | renderActorSheet5eCharacter hook fired");
  try {
    addGiveItemButton5E(html, sheet.actor);
    addGiveCurrency5E2(html, sheet.actor);
    console.log("Give Item Module | Buttons added via specific hook");
  } catch (error) {
    console.error("Give Item Module | Error:", error);
  }
});

Hooks.on('renderActorSheet5eCharacter2', (sheet, html, character) => {
  console.log("Give Item Module | renderActorSheet5eCharacter2 hook fired (legacy)");
  try {
    addGiveItemButton5E(html, sheet.actor);
    addGiveCurrency5E(html, sheet.actor);
  } catch (error) {
    console.error("Give Item Module | Error:", error);
  }
});

// ========================================
// OTHER SYSTEMS
// ========================================

// PF2e character sheet
Hooks.on('renderActorSheetPF2e', (sheet, html, character) => {
  addGiveItemButtonPF2E(html, sheet.actor);
  addGiveCurrencyPF2E(html, sheet.actor);
});

// PF1e character sheet
Hooks.on('renderActorSheetPFCharacter', (sheet, html, character) => {
  addGiveItemButton(html, sheet.actor);
  addGiveCurrencyPF1E(html, sheet.actor);
});

// WFRP4e character sheet
Hooks.on('renderActorSheetWfrp4eCharacter', (sheet, html, character) => {
  addGiveItemButton(html, sheet.actor);
  addGiveCurrencyWFRP4E(html, sheet.actor);
});

// ========================================
// SETUP & INITIALIZATION
// ========================================

Hooks.on('init', function () {
  console.log("Give Item Module | Init hook fired");
  game.settings.register('give-item-to-player', 'give-item', {
    name: 'Activate giving item',
    hint: 'Allows an actor to give an item to a different actor',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
});

Hooks.once('setup', async function () {
  console.log("Give Item Module | Setup hook fired");
  console.log("Give Item Module | System ID:", game.system.id);
  console.log("Give Item Module | System Version:", game.system.version);
  
  // Socket name must match module ID
  game.socket.on('module.give-item-to-player', packet => {
      let data = packet.data;
      let type = packet.type;
      const actorId = packet.actorId;
      const currentActorId = packet.currentActorId;
      data.actor = game.actors.get(actorId);
      data.currentActor = game.actors.get(currentActorId);
      if (data.actor.isOwner) {
          if (type === 'request') {
              receiveTrade(data);
          }
          if (type === 'accepted') {
              completeTrade(data);
          }
          if (type === 'denied') {
              denyTrade(data);
          }
      }
  });
});

Hooks.once('ready', function() {
  console.log("Give Item Module | Ready hook fired");
  console.log("Give Item Module | Module active:", game.modules.get('give-item-to-player')?.active);
  
  // Detect if using V2 sheets
  if (game.system.id === 'dnd5e') {
    const version = game.system.version;
    console.log(`Give Item Module | DnD5e version ${version} detected`);
    if (version.startsWith('4.') || version.startsWith('5.')) {
      console.log("Give Item Module | V2 sheets detected - using renderApplicationV2 hook");
    } else {
      console.log("Give Item Module | V1 sheets detected - using legacy hooks");
    }
  }
});
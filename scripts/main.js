import { addGiveItemButton, addGiveCurrencyButton } from './actorOverride.js';
import { completeTrade, denyTrade, receiveTrade } from './trading.js';

console.log("Give Item Module | Initializing");

// DND5E V2 SHEET SUPPORT (v5.0.0+)
Hooks.on('renderApplicationV2', (app, context, options) => {
  // Only process DnD5e character sheets
  if (game.system.id !== 'dnd5e') return;
  if (!app.document || app.document.documentName !== 'Actor') return;
  if (app.document.type !== 'character') return;
  
  const element = app.element;
  if (!element) return;
  
  const $html = $(element);
  
  addGiveItemButton($html, app.document);
  addGiveCurrencyButton($html, app.document);
});

// SETUP & INITIALIZATION
Hooks.on('init', function () {
  game.settings.register('give-item', 'give-item', {
    name: 'Activate giving item',
    hint: 'Allows an actor to give an item to a different actor',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });
});

Hooks.once('ready', async function () {
  console.log("Give Item Module | System:", game.system.id, game.system.version);
  console.log("Give Item Module | Current user:", game.user.name, "Character:", game.user.character?.name);
  
  game.socket.on('module.give-item-to-player', packet => {
    console.log("=== SOCKET MESSAGE RECEIVED ===");
    console.log("Give Item Module | Socket received:", packet.type, packet);
    console.log("Give Item Module | Current user:", game.user.name, "ID:", game.user.id);
    
    let data = packet.data;
    let type = packet.type;
    const actorId = packet.actorId;
    const currentActorId = packet.currentActorId;
    
    data.actor = game.actors.get(actorId);
    data.currentActor = game.actors.get(currentActorId);
    
    console.log("Give Item Module | Target Actor:", data.actor?.name, "ID:", actorId, "Owner:", data.actor?.isOwner);
    console.log("Give Item Module | Sender Actor:", data.currentActor?.name, "ID:", currentActorId);
    
    // For 'request' type: check if current user owns the TARGET actor
    // For 'accepted'/'denied' type: check if current user owns the SENDER actor
    let shouldProcess = false;
    
    if (type === 'request') {
      shouldProcess = data.actor && data.actor.isOwner;
      console.log("Give Item Module | Request - should process?", shouldProcess);
    } else if (type === 'accepted' || type === 'denied') {
      shouldProcess = data.currentActor && data.currentActor.isOwner;
      console.log("Give Item Module | Response - should process?", shouldProcess);
    }
    
    if (shouldProcess) {
      console.log("Give Item Module | Processing", type, "for", game.user.name);
      
      if (type === 'request') {
        receiveTrade(data);
      }
      if (type === 'accepted') {
        completeTrade(data);
      }
      if (type === 'denied') {
        denyTrade(data);
      }
    } else {
      console.log("Give Item Module | Ignoring socket - not the intended recipient");
    }
  });
});
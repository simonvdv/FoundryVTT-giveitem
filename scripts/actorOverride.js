import { PlayerDialog } from "./dialog.js";

export function addGiveItemButton(html, actor) {
  // Only target the inventory tab to avoid features/spells
  const inventoryTab = html.find(".tab[data-tab='inventory'], .inventory");
  
  if (inventoryTab.length === 0) {
    console.warn("Give Item Module | No inventory tab found");
    return;
  }
  
  const itemRows = inventoryTab.find(".item-row");
  
  if (itemRows.length === 0) {
    console.warn("Give Item Module | No item rows found");
    return;
  }
  
  itemRows.each(function() {
    const itemRow = $(this);
    const itemControls = itemRow.find(".item-controls");
    
    if (itemControls.length === 0) return;
    if (itemControls.find(".item-give-module").length > 0) return;
    
    const itemLi = itemRow.closest("li.item");
    const itemId = itemLi.attr("data-item-id");
    
    if (!itemId) return;
    
    // Filter to only inventory items
    const item = actor.items.get(itemId);
    if (!item) return;
    
    const inventoryTypes = ["weapon", "equipment", "consumable", "tool", "loot", "container", "backpack"];
    if (!inventoryTypes.includes(item.type)) {
      return; // Skip features, spells, etc.
    }
    
    const contextButton = itemControls.find("button[data-context-menu]");
    
    const giveButton = $(`
      <button type="button" class="unbutton config-button item-control item-give-module give-item always-interactive" 
              data-action="give-item" data-tooltip="Give Item" aria-label="Give Item">
        <i class="fa-solid fa-hands-helping" inert=""></i>
      </button>
    `);
    
    if (contextButton.length > 0) {
      giveButton.insertBefore(contextButton);
    } else {
      itemControls.append(giveButton);
    }
    
    giveButton.on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      giveItem.bind(actor)(itemId);
    });
  });
}

export function addGiveCurrencyButton(html, actor) {
  const currencySection = html.find("section.currency, .currency");
  
  if (currencySection.length === 0) {
    console.warn("Give Item Module | Currency section not found");
    return;
  }
  
  if (currencySection.find(".item-give-module.give-currency").length > 0) {
    return;
  }
  
  const currencyButton = currencySection.find("button.item-action[data-action='currency']");
  
  if (currencyButton.length > 0) {
    const giveCurrencyButton = $(`
      <button type="button" class="item-action unbutton always-interactive item-give-module give-currency" 
              data-action="give-currency" data-tooltip="Give Currency" aria-label="Give Currency">
        <i class="fa-solid fa-hands-helping" inert=""></i>
      </button>
    `);
    
    giveCurrencyButton.insertAfter(currencyButton);
    
    giveCurrencyButton.on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      giveCurrency.bind(actor)();
    });
  }
}

function fetchPCList() {
  const filteredPCList = [];
  game.users.players.forEach(player => {
    if (player.character && game.user.character?.id !== player.character.id) {
      filteredPCList.push(player.character);
    }
  });
  return filteredPCList;
}

function giveItem(currentItemId) {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  
  if (filteredPCList.length === 0) {
    ui.notifications.warn("No other player characters available to trade with.");
    return;
  }
  
  const d = new PlayerDialog(({playerId, quantity}) => {
    const actor = game.actors.get(playerId);
    const currentItem = currentActor.items.find(item => item.id === currentItemId);
    
    if (!currentItem) {
      return ui.notifications.error(`Item not found`);
    }
    
    const currentItemQuantity = isNaN(currentItem.system.quantity) 
      ? currentItem.system.quantity.value 
      : currentItem.system.quantity;
    
    if (quantity > currentItemQuantity) {
      return ui.notifications.error(`You cannot offer more items than you have`);
    }
    
    console.log("Give Item Module | Emitting trade request to", actor.name);
    
    game.socket.emit('module.give-item-to-player', {
      data: {
        currentItemId: currentItem.id,
        currentItemData: currentItem.toObject(),
        quantity
      },
      actorId: actor.id,
      currentActorId: currentActor.id,
      type: "request"
    });
    
    ui.notifications.info(`Trade request sent to ${actor.name}`);
  }, {acceptLabel: "Offer Item", filteredPCList});
  
  d.render(true);
}

function giveCurrency() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  
  if (filteredPCList.length === 0) {
    ui.notifications.warn("No other player characters available to trade with.");
    return;
  }
  
  const d = new PlayerDialog(({playerId, pp, gp, ep, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.system.currency;
    
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || 
        ep > currentCurrency.ep || sp > currentCurrency.sp || 
        cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    }
    
    console.log("Give Item Module | Emitting currency trade request to", actor.name);
    
    game.socket.emit('module.give-item-to-player', {
      data: {quantity: {pp, gp, ep, sp, cp}},
      actorId: actor.id,
      currentActorId: currentActor.id,
      type: "request"
    });
    
    ui.notifications.info(`Trade request sent to ${actor.name}`);
  }, {acceptLabel: "Offer Currency", filteredPCList, currency: true});
  
  d.render(true);
}
import { PlayerDialog } from "./dialog.js";

// ========================================
// DND5E V2 SHEET FUNCTIONS (v4.0+)
// ========================================

export function addGiveItemButton5E_V2(html, actor) {
  console.log("Give Item Module | addGiveItemButton5E_V2 called");
  
  // Find all item rows in the inventory
  const itemRows = html.find(".item-row");
  console.log("Give Item Module | Found item rows:", itemRows.length);
  
  if (itemRows.length === 0) {
    console.warn("Give Item Module | No item rows found");
    return;
  }
  
  let buttonsAdded = 0;
  
  itemRows.each(function() {
    const itemRow = $(this);
    const itemControls = itemRow.find(".item-controls");
    
    // Skip if no controls found
    if (itemControls.length === 0) return;
    
    // Check if give button already exists
    if (itemControls.find(".item-give-module").length > 0) {
      return;
    }
    
    // Get the item ID from the parent li element
    const itemLi = itemRow.closest("li.item");
    const itemId = itemLi.attr("data-item-id");
    
    if (!itemId) {
      console.warn("Give Item Module | No item ID found for row");
      return;
    }
    
    // Find the context menu button to insert before it
    const contextButton = itemControls.find("button[data-context-menu]");
    
    // Create the give button matching V2 style
    const giveButton = $(`
      <button type="button" class="unbutton config-button item-control item-give-module give-item always-interactive" data-action="give-item" data-tooltip="Give Item" aria-label="Give Item">
        <i class="fa-solid fa-hands-helping" inert=""></i>
      </button>
    `);
    
    // Insert before context menu button
    if (contextButton.length > 0) {
      giveButton.insertBefore(contextButton);
    } else {
      itemControls.append(giveButton);
    }
    
    // Bind click handler
    giveButton.on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      giveItem.bind(actor)(itemId);
    });
    
    buttonsAdded++;
  });
  
  console.log("Give Item Module | Give buttons added:", buttonsAdded);
}

export function addGiveCurrency5E_V2(html, actor) {
  console.log("Give Item Module | addGiveCurrency5E_V2 called");
  
  // Find the currency section
  const currencySection = html.find("section.currency, .currency");
  console.log("Give Item Module | Currency section found:", currencySection.length);
  
  if (currencySection.length === 0) {
    console.warn("Give Item Module | Could not find currency section");
    return;
  }
  
  // Check if button already exists
  if (currencySection.find(".item-give-module.give-currency").length > 0) {
    console.log("Give Item Module | Currency button already exists");
    return;
  }
  
  // Find the existing currency button
  const currencyButton = currencySection.find("button.item-action[data-action='currency']");
  console.log("Give Item Module | Currency button found:", currencyButton.length);
  
  if (currencyButton.length > 0) {
    // Create give currency button matching V2 style
    const giveCurrencyButton = $(`
      <button type="button" class="item-action unbutton always-interactive item-give-module give-currency" data-action="give-currency" data-tooltip="Give Currency" aria-label="Give Currency">
        <i class="fa-solid fa-hands-helping" inert=""></i>
      </button>
    `);
    
    giveCurrencyButton.insertAfter(currencyButton);
    console.log("Give Item Module | Currency button inserted");
    
    giveCurrencyButton.on("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      giveCurrency5E.bind(actor)();
    });
  } else {
    console.warn("Give Item Module | Could not find currency action button");
  }
}

// ========================================
// LEGACY V1 SHEET FUNCTIONS
// ========================================

export function addGiveItemButton(html, actor) {
  $(`
    <a class="item-control item-give-module" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory ol:not(.currency-list) .item-control[data-action='equip']"));
  html.find(".item-control.item-give-module").on("click", giveItemHandler.bind(actor));
}

export function addGiveItemButton5E(html, actor) {
  console.log("Give Item Module | addGiveItemButton5E called (V1 legacy)");
  console.log("Give Item Module | Looking for inventory items...");
  
  // Find all item rows in the inventory
  const itemRows = html.find(".inventory-list .item-row, .items-list .item");
  console.log("Give Item Module | Found item rows:", itemRows.length);
  
  if (itemRows.length === 0) {
    console.warn("Give Item Module | No item rows found. Trying V2 function...");
    // Try V2 version
    addGiveItemButton5E_V2(html, actor);
    return;
  }
  
  itemRows.each(function(index) {
    const itemRow = $(this);
    const itemControls = itemRow.find(".item-controls");
    
    console.log(`Give Item Module | Processing item ${index}, controls found:`, itemControls.length);
    
    // Check if give button already exists
    if (itemControls.find(".item-give-module").length > 0) {
      console.log(`Give Item Module | Button already exists for item ${index}`);
      return;
    }
    
    // Try to find the equip button
    let equipButton = itemControls.find("button[data-action='equip'], a.item-control[data-action='equip']");
    console.log(`Give Item Module | Equip button found for item ${index}:`, equipButton.length);
    
    if (equipButton.length > 0) {
      const giveButton = $(`
        <button type="button" class="unbutton config-button item-control item-give-module give-item" data-action="give-item" aria-label="Give Item" data-tooltip="Give Item">
          <i class="fa-solid fa-hands-helping" inert=""></i>
        </button>
      `);
      giveButton.insertAfter(equipButton);
      console.log(`Give Item Module | Give button inserted for item ${index}`);
    } else {
      console.warn(`Give Item Module | No equip button found for item ${index}, trying to append to controls`);
      // If no equip button, just append to controls
      if (itemControls.length > 0) {
        itemControls.append(`
          <button type="button" class="unbutton config-button item-control item-give-module give-item" data-action="give-item" aria-label="Give Item" data-tooltip="Give Item">
            <i class="fa-solid fa-hands-helping" inert=""></i>
          </button>
        `);
      }
    }
  });
  
  const giveButtons = html.find(".item-control.item-give-module.give-item");
  console.log("Give Item Module | Total give buttons added:", giveButtons.length);
  giveButtons.on("click", giveItemHandler.bind(actor));
}

export function addGiveItemButtonPF2E(html, actor) {
  $(`
    <a class="item-control item-give-module give-item" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory .items .item-controls .item-carry-type"));
  html.find(".item-control.item-give-module.give-item").on("click", giveItemHandlerPF2E.bind(actor));
}

function giveItemHandler(e) {
  e.preventDefault();
  const currentItemId = e.currentTarget.closest(".item").dataset.itemId;
  giveItem.bind(this)(currentItemId);
}

function giveItemHandlerPF2E(e) {
  e.preventDefault();
  const currentItemId = e.currentTarget.closest(".data").parentNode.dataset.itemId;
  giveItem.bind(this)(currentItemId);
}

export function addGiveCurrency(html, actor) {
  $(`
    <a class="currency-control currency-give" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".currency-convert.rollable"));
  html.find(".currency-control.currency-give").on("click", (e) => {
    e.preventDefault();
    giveCurrency.bind(actor)();
  });
}

export function addGiveCurrency5E(html, actor) {
  $(`
    <a class="item-control item-give-module give-currency" title="Give item">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find(".inventory .currency .item-action"));
  html.find(".item-control.item-give-module.give-currency").on("click", giveCurrency5E.bind(actor));
}

export function addGiveCurrency5E2(html, actor) {
  console.log("Give Item Module | addGiveCurrency5E2 called (V1 legacy)");
  
  const currencySection = html.find(".inventory .currency, .currency");
  console.log("Give Item Module | Currency section found:", currencySection.length);
  
  if (currencySection.length === 0) {
    console.warn("Give Item Module | No currency section found. Trying V2 function...");
    addGiveCurrency5E_V2(html, actor);
    return;
  }
  
  const itemAction = html.find(".inventory .currency .item-action, .currency .item-action");
  console.log("Give Item Module | Item action found:", itemAction.length);
  
  if (itemAction.length > 0) {
    const currencyButton = $(`
      <button type="button" title="Give Currency" class="item-action unbutton item-give-module give-currency" data-action="give-currency" aria-label="Give Currency">
        <i class="fas fa-hands-helping"></i>
      </button>
    `);
    currencyButton.insertAfter(itemAction.first());
    console.log("Give Item Module | Currency button inserted");
    currencyButton.on("click", giveCurrency5E.bind(actor));
  } else {
    console.warn("Give Item Module | Could not find currency section to insert button. Trying V2...");
    addGiveCurrency5E_V2(html, actor);
  }
}

export function addGiveCurrencyPF1E(html, actor) {
  $(`
    <a class="currency-control currency-give main" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find("ol.currency:nth-of-type(1) h3"));
  html.find(".currency-control.currency-give.main").on("click", (e) => {
    e.preventDefault();
    giveMainCurrencyPF1E.bind(actor)();
  });
  $(`
    <a class="currency-control currency-give alt" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find("ol.currency:nth-of-type(2) h3"));
  html.find(".currency-control.currency-give.alt").on("click", (e) => {
    e.preventDefault();
    giveAltCurrencyPF1E.bind(actor)();
  });
}

export function addGiveCurrencyPF2E(html, actor) {
  $(`
    <li>
      <button type="button" class="item-control item-give-module give-currency" title="Give item">
        <i class="fas fa-hands-helping"></i>
      </button>
    </li>
  `).insertAfter(html.find(".denomination.cp"));
  html.find(".item-control.item-give-module.give-currency").on("click", giveMainCurrencyPF2E.bind(actor));
}

export function addGiveCurrencyWFRP4E(html, actor) {
  $(`
    <a class="currency-control combat-icon currency-give" title="Give currency">
      <i class="fas fa-hands-helping"></i>
    </a>
  `).insertAfter(html.find("#currency-header .dollar-icon.combat-icon"));
  html.find(".currency-control.combat-icon.currency-give").on("click", (e) => {
    e.preventDefault();
    giveCurrencyWFRP4E.bind(actor)();
  });
}

// ========================================
// CORE FUNCTIONS
// ========================================

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
  const d = new PlayerDialog(({playerId, quantity}) => {
    const actor = game.actors.get(playerId);
    const currentItem = currentActor.items.find(item => item.id === currentItemId);
    let currentItemQuantity;
    if (isNaN(currentItem.system.quantity)) {
      currentItemQuantity = currentItem.system.quantity.value
    } else {
      currentItemQuantity = currentItem.system.quantity
    }
    if (quantity > currentItemQuantity) {
      return ui.notifications.error(`You cannot offer more items than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {
          currentItemId: currentItem.id,
          currentItemData: currentItem.toObject(),
          quantity
        },
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
      });
    }
  },
    {acceptLabel: "Offer Item", filteredPCList}
  );
  d.render(true);
}

function giveCurrency5E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, ep, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.system.currency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || ep > currentCurrency.ep || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {pp, gp, ep, sp, cp}},
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
      });
    }
  },
    {acceptLabel: "Offer Currency", filteredPCList, currency: true}
  );
  d.render(true);
}

function giveMainCurrencyPF1E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.system.currency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {pp, gp, sp, cp}},
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
      });
    }
  },
    {acceptLabel: "Offer Currency", filteredPCList, currency: true}
  );
  d.render(true);
}

function giveMainCurrencyPF2E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.inventory.coins;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {pp, gp, sp, cp}},
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
      });
    }
  },
    {acceptLabel: "Offer Currency", filteredPCList, currency: true}
  );
  d.render(true);
}


function giveAltCurrencyPF1E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, pp, gp, sp, cp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.system.altCurrency;
    if (pp > currentCurrency.pp || gp > currentCurrency.gp || sp > currentCurrency.sp || cp > currentCurrency.cp) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {pp, gp, sp, cp}, alt: true},
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
      });
    }
  },
    {acceptLabel: "Offer Currency", filteredPCList, currency: true}
  );
  d.render(true);
}


function giveCurrencyWFRP4E() {
  const currentActor = this;
  const filteredPCList = fetchPCList();
  const d = new PlayerDialog(({playerId, gc, ss, bp}) => {
    const actor = game.actors.get(playerId);
    const currentCurrency = currentActor.items.filter(item => item.type === "money");
    const currentGC = currentCurrency.find(currency => currency.name === "Gold Crown");
    const currentSS = currentCurrency.find(currency => currency.name === "Silver Shilling");
    const currentBP = currentCurrency.find(currency => currency.name === "Brass Penny");
    if (gc > currentGC.system.quantity.value || ss > currentSS.system.quantity.value || bp > currentBP.system.quantity.value) {
      return ui.notifications.error(`You cannot offer more currency than you have`);
    } else {
      game.socket.emit('module.give-item', {
        data: {quantity: {gc, ss, bp}},
        actorId: actor.id,
        currentActorId: currentActor.id,
        type: "request"
      });
    }
  },
    {acceptLabel: "Offer Currency", filteredPCList, currency: true}
  );
  d.render(true);
}
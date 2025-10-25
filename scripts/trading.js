export function receiveTrade(tradeData) {
  console.log("Give Item Module | receiveTrade called", tradeData);
  console.log("Give Item Module | Current user:", game.user.name, "Is GM:", game.user.isGM);
  
  // Only show dialog for non-GM users who own the target actor
  if (!game.user.isGM && tradeData.actor && tradeData.actor.isOwner) {
    new foundry.applications.api.DialogV2({
      window: {
        title: "Incoming Trade Request"
      },
      content: `<p>${tradeData.currentActor.name} is sending you ${offer(tradeData)}. Do you accept?</p>`,
      buttons: [
        {
          action: "confirm",
          label: "Accept",
          icon: "fas fa-check",
          default: true,
          callback: () => {
            tradeConfirmed(tradeData);
          }
        },
        {
          action: "deny",
          label: "Decline",
          icon: "fas fa-times",
          callback: () => {
            tradeDenied(tradeData);
          }
        }
      ],
      rejectClose: false,
      modal: true
    }).render(true);
  } else {
    console.log("Give Item Module | Not showing dialog - either GM or not owner");
  }
}

export function completeTrade(tradeData) {
  console.log("Give Item Module | completeTrade called", tradeData);
  console.log("Give Item Module | currentActor (sender):", tradeData.currentActor?.name);
  console.log("Give Item Module | actor (receiver):", tradeData.actor?.name);
  
  // Process items
  if (tradeData.currentItemId || tradeData.currentItemData) {
    removeItemFromSender(tradeData);
  }
  
  // Process currency
  if (tradeData.quantity && typeof tradeData.quantity === 'object' && 'pp' in tradeData.quantity) {
    removeCurrencyFromSender(tradeData);
  }
  
  ui.notifications.notify(`${tradeData.actor.name} accepted your trade request.`);
}

export function denyTrade(tradeData) {
  console.log("Give Item Module | denyTrade called", tradeData);
  ui.notifications.notify(`${tradeData.actor.name} rejected your trade request.`);
}

function removeItemFromSender({currentItemId, quantity, currentActor}) {
  console.log("Give Item Module | removeItemFromSender", {currentItemId, quantity, actorName: currentActor?.name});
  
  const currentItem = currentActor.items.get(currentItemId);
  
  if (!currentItem) {
    console.error(`Item ${currentItemId} not found on actor ${currentActor.id}`);
    return;
  }
  
  let updatedQuantity, updateItem;
  
  if (isNaN(currentItem.system.quantity)) {
    updatedQuantity = currentItem.system.quantity.value - quantity;
    updateItem = {"system.quantity.value": updatedQuantity};
  } else {
    updatedQuantity = currentItem.system.quantity - quantity;
    updateItem = {"system.quantity": updatedQuantity};
  }
  
  console.log(`Removing ${quantity} from ${currentItem.name}, new quantity: ${updatedQuantity}`);
  
  currentItem.update(updateItem).then(res => {
    if (updatedQuantity <= 0) {
      console.log(`Deleting ${currentItem.name} - quantity is 0 or less`);
      currentItem.delete();
    }
  });
}

function removeCurrencyFromSender({quantity, currentActor}) {
  console.log("Give Item Module | removeCurrencyFromSender", {quantity, actorName: currentActor?.name});
  
  const currentCurrency = currentActor.system.currency;
  const updatedCurrency = {
    pp: currentCurrency.pp - quantity.pp,
    gp: currentCurrency.gp - quantity.gp,
    ep: currentCurrency.ep - quantity.ep,
    sp: currentCurrency.sp - quantity.sp,
    cp: currentCurrency.cp - quantity.cp
  };
  
  console.log(`Removing currency from ${currentActor.name}:`, quantity);
  console.log(`New currency totals:`, updatedCurrency);
  
  currentActor.update({"system.currency": updatedCurrency});
}

function receiveItem({currentItemData, quantity, actor}) {
  console.log("Give Item Module | receiveItem", {itemName: currentItemData.name, quantity, actorName: actor?.name});
  
  const duplicatedItem = foundry.utils.duplicate(currentItemData);
  
  if (isNaN(duplicatedItem.system.quantity)) {
    duplicatedItem.system.quantity.value = quantity;
  } else {
    duplicatedItem.system.quantity = quantity;
  }
  
  const existingItem = actor.items.find(t => t.name === duplicatedItem.name);
  
  if (existingItem) {
    let updatedQuantity, updateItem;
    
    if (isNaN(duplicatedItem.system.quantity)) {
      updatedQuantity = existingItem.system.quantity.value + quantity;
      updateItem = {"system.quantity.value": updatedQuantity};
    } else {
      updatedQuantity = existingItem.system.quantity + quantity;
      updateItem = {"system.quantity": updatedQuantity};
    }
    
    console.log(`Adding ${quantity} to existing ${existingItem.name}, new quantity: ${updatedQuantity}`);
    existingItem.update(updateItem);
  } else {
    console.log(`Creating new item ${duplicatedItem.name} with quantity ${quantity}`);
    Item.create(duplicatedItem, {parent: actor});
  }
  
  console.log(`Received item: ${duplicatedItem.name} (qty: ${quantity}) on actor ${actor.name}`);
}

function receiveCurrency({quantity, actor}) {
  console.log("Give Item Module | receiveCurrency", {quantity, actorName: actor?.name});
  
  const currentCurrency = actor.system.currency;
  const updatedCurrency = {
    pp: currentCurrency.pp + quantity.pp,
    gp: currentCurrency.gp + quantity.gp,
    ep: currentCurrency.ep + quantity.ep,
    sp: currentCurrency.sp + quantity.sp,
    cp: currentCurrency.cp + quantity.cp
  };
  
  console.log(`Adding currency to ${actor.name}:`, quantity);
  console.log(`New currency totals:`, updatedCurrency);
  
  actor.update({"system.currency": updatedCurrency});
}

function offer(data) {
  if (data.currentItemData) {
    return `${data.quantity} ${data.currentItemData.name}`;
  }
  return `${data.quantity.pp} pp, ${data.quantity.gp} gp, ${data.quantity.ep} ep, ${data.quantity.sp} sp, ${data.quantity.cp} cp`;
}

function tradeConfirmed(tradeData) {
  console.log("Give Item Module | tradeConfirmed called", tradeData);
  console.log("Give Item Module | Receiver (actor):", tradeData.actor?.name);
  console.log("Give Item Module | Sender (currentActor):", tradeData.currentActor?.name);
  
  // Process items
  if (tradeData.currentItemData) { 
    receiveItem(tradeData);
  }
  
  // Process currency
  if (tradeData.quantity && typeof tradeData.quantity === 'object' && 'pp' in tradeData.quantity) {
    receiveCurrency(tradeData);
  }
  
  sendMessageToGM(tradeData);
  
  console.log("Give Item Module | Emitting accepted socket", {
    actorId: tradeData.currentActor.id,
    currentActorId: tradeData.actor.id
  });
  
  // Send acceptance back to sender - DON'T swap, keep original structure
  game.socket.emit('module.give-item-to-player', {
    data: tradeData,
    actorId: tradeData.actor.id,  // Keep receiver as actor
    currentActorId: tradeData.currentActor.id,  // Keep sender as currentActor
    type: "accepted"
  });
}

function tradeDenied(tradeData) {
  console.log("Give Item Module | tradeDenied called", tradeData);
  
  game.socket.emit('module.give-item-to-player', {
    data: tradeData,
    actorId: tradeData.currentActor.id,  // Sender will receive the denial
    currentActorId: tradeData.actor.id,
    type: "denied"
  });
}

function sendMessageToGM(tradeData) {
  let chatMessage = {
    user: game.userId,
    speaker: ChatMessage.getSpeaker(),
    content: `${tradeData.currentActor.name} has sent ${tradeData.actor.name} ${offer(tradeData)}`,
    whisper: game.users.filter(u => u.isGM).map(u => u.id)
  };

  ChatMessage.create(chatMessage);
}

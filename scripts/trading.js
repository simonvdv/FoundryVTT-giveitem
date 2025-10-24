export function receiveTrade(tradeData) {
  console.log("Give Item Module | receiveTrade called", tradeData);
  console.log("Give Item Module | Current user:", game.user.name, "Is GM:", game.user.isGM);
  
  // Only show dialog for non-GM users who own the target actor
  if (!game.user.isGM && tradeData.actor && tradeData.actor.isOwner) {
    foundry.applications.api.DialogV2.prompt({
      window: {
        title: "Incoming Trade Request"
      },
      content: `<p>${tradeData.currentActor.name} is sending you ${offer(tradeData)}. Do you accept?</p>`,
      buttons: [
        {
          action: "confirm",
          label: "Confirm",
          icon: "fas fa-check",
          callback: () => {
            tradeConfirmed(tradeData);
            return true;
          }
        },
        {
          action: "deny",
          label: "Deny",
          icon: "fas fa-times",
          default: true,
          callback: () => {
            tradeDenied(tradeData);
            return false;
          }
        }
      ],
      rejectClose: false,
      modal: true
    });
  } else {
    console.log("Give Item Module | Not showing dialog - either GM or not owner");
  }
}

export function completeTrade(tradeData) {
  console.log("Give Item Module | completeTrade called", tradeData);
  console.log("Give Item Module | currentActor (sender):", tradeData.currentActor?.name);
  console.log("Give Item Module | actor (receiver):", tradeData.actor?.name);
  
  // Only process items (not currency)
  if (tradeData.currentItemId || tradeData.currentItemData) {
    // Remove item from sender (currentActor)
    removeItemFromSender(tradeData);
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
  
  // Only process items
  if (tradeData.currentItemData) { 
    receiveItem(tradeData);
  }
  
  sendMessageToGM(tradeData);
  
  console.log("Give Item Module | Emitting accepted socket", {
    actorId: tradeData.currentActor.id,
    currentActorId: tradeData.actor.id
  });
  
  // Send acceptance back to sender - swap the actor IDs
  game.socket.emit('module.give-item-to-player', {
    data: tradeData,
    actorId: tradeData.currentActor.id,  // This is the sender (who will receive the "accepted" message)
    currentActorId: tradeData.actor.id,  // This is the receiver
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
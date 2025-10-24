export function receiveTrade(tradeData) {
    let d = new Dialog({
        title: "Incoming Trade Request",
        content: `<p>${tradeData.currentActor.name} is sending you ${offer(tradeData)}. Do you accept?</p>`,
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "Confirm",
                callback: () => tradeConfirmed(tradeData)
            },
            two: {
                icon: '<i class="fas fa-times"></i>',
                label: "Deny",
                callback: () => tradeDenied(tradeData)
            }
        },
        default: "two",
    });
    if (game.user.isGM === false) {
        d.render(true);
    }
}

export function completeTrade(tradeData) {
    if (tradeData.currentItemId || tradeData.currentItemData) {
        giveItem(tradeData);
    } else {
        giveCurrency(tradeData);
    }
    ui.notifications.notify(`${tradeData.actor.name} accepted your trade request.`);
}

export function denyTrade(tradeData) {
    ui.notifications.notify(`${tradeData.actor.name} rejected your trade request.`);
}

function giveItem({currentItemId, currentItemData, quantity, currentActor}) {
    const currentItem = currentActor.items.get(currentItemId);
    
    if (!currentItem) {
        console.error(`Item ${currentItemId} not found on actor ${currentActor.id}`);
        return;
    }
    
    let updatedQuantity, updateItem;
    if (isNaN(currentItem.system.quantity)) {
        updatedQuantity = currentItem.system.quantity.value - quantity;
        updateItem = {
            "system.quantity.value": updatedQuantity
        }
    } else {
        updatedQuantity = currentItem.system.quantity - quantity;
        updateItem = {
            "system.quantity": updatedQuantity
        }
    }
    
    currentItem.update(updateItem).then(res => {
        if (updatedQuantity <= 0) {
            currentItem.delete();
        }
    });
}

function giveCurrency({quantity, currentActor, alt}) {
    if (game.system.id === "wfrp4e") {
        const currentCurrency = currentActor.items.filter(item => item.type === "money");
        const currentGC = currentCurrency.find(currency => currency.name === "Gold Crown");
        const currentSS = currentCurrency.find(currency => currency.name === "Silver Shilling");
        const currentBP = currentCurrency.find(currency => currency.name === "Brass Penny");
        const updateGC = {
            "system.quantity.value": currentGC.system.quantity.value - quantity.gc
        };
        currentGC.update(updateGC);
        const updateSS = {
            "system.quantity.value": currentSS.system.quantity.value - quantity.ss
        };
        currentSS.update(updateSS);
        const updateBP = {
            "system.quantity.value": currentBP.system.quantity.value - quantity.bp
        };
        currentBP.update(updateBP);
    } else if (game.system.id === "pf2e") {
        currentActor.inventory.removeCoins(quantity);
    } else {
        let currentCurrency = currentActor.system.currency;
        let updateTargetGold = {};
        if (alt) {
            currentCurrency = currentActor.system.altCurrency;
            updateTargetGold = {
                "system.altCurrency.pp": currentCurrency.pp - quantity.pp,
                "system.altCurrency.gp": currentCurrency.gp - quantity.gp,
                "system.altCurrency.sp": currentCurrency.sp - quantity.sp,
                "system.altCurrency.cp": currentCurrency.cp - quantity.cp,
            };
        } else {
            updateTargetGold = {
                "system.currency.pp": currentCurrency.pp - quantity.pp,
                "system.currency.gp": currentCurrency.gp - quantity.gp,
                "system.currency.sp": currentCurrency.sp - quantity.sp,
                "system.currency.cp": currentCurrency.cp - quantity.cp,
            };
        }

        if (quantity.ep !== undefined) {
            if (alt) {
                updateTargetGold["system.altCurrency.ep"] = currentCurrency.ep - quantity.ep;
            } else {
                updateTargetGold["system.currency.ep"] = currentCurrency.ep - quantity.ep;
            }
        }
        currentActor.update(updateTargetGold);
    }
}

function receiveItem({currentItemData, quantity, actor}) {
    const duplicatedItem = foundry.utils.duplicate(currentItemData);
    
    if (isNaN(duplicatedItem.system.quantity)) {
        duplicatedItem.system.quantity.value = quantity;
    } else {
        duplicatedItem.system.quantity = quantity;
    }
    
    const existingItem = getItemFromInvoByName(actor, duplicatedItem.name);
    if (existingItem) {
        let updatedQuantity, updateItem;
        if (isNaN(duplicatedItem.system.quantity)) {
            updatedQuantity = existingItem.system.quantity.value + quantity;
            updateItem = {
                "system.quantity.value": updatedQuantity
            };
        } else {
            updatedQuantity = existingItem.system.quantity + quantity;
            updateItem = {
                "system.quantity": updatedQuantity
            };
        }
        existingItem.update(updateItem);
    } else {
        Item.create(duplicatedItem, {parent: actor});
    }
    console.log(`Received item: ${duplicatedItem.name} (qty: ${quantity}) on actor ${actor.name}`);
}

function receiveCurrency({actor, quantity, alt}) {
    if (game.system.id === "wfrp4e") {
        const currentCurrency = actor.items.filter(item => item.type === "money");
        const currentGC = currentCurrency.find(currency => currency.name === "Gold Crown");
        const currentSS = currentCurrency.find(currency => currency.name === "Silver Shilling");
        const currentBP = currentCurrency.find(currency => currency.name === "Brass Penny");
        const updateGC = {
            "system.quantity.value": currentGC.system.quantity.value + quantity.gc
        };
        currentGC.update(updateGC);
        const updateSS = {
            "system.quantity.value": currentSS.system.quantity.value + quantity.ss
        };
        currentSS.update(updateSS);
        const updateBP = {
            "system.quantity.value": currentBP.system.quantity.value + quantity.bp
        };
        currentBP.update(updateBP);
        console.log(`Giving currency: GC:${quantity.gc}, SS:${quantity.ss}, BP:${quantity.bp}, to actor ${actor.id}`);
    } else if (game.system.id === "pf2e") {
        console.log(`Giving currency: pp:${quantity.pp}, gp:${quantity.gp}, sp:${quantity.sp}, cp:${quantity.cp}, to actor ${actor.id}`);
        actor.inventory.addCoins(quantity);
    } else {
        let currentCurrency = actor.system.currency;
        let updateGold = {};
        if (alt) {
            currentCurrency = actor.system.altCurrency;
            updateGold = {
                "system.altCurrency.pp": currentCurrency.pp + quantity.pp,
                "system.altCurrency.gp": currentCurrency.gp + quantity.gp,
                "system.altCurrency.sp": currentCurrency.sp + quantity.sp,
                "system.altCurrency.cp": currentCurrency.cp + quantity.cp,
            };
        } else {
            updateGold = {
                "system.currency.pp": currentCurrency.pp + quantity.pp,
                "system.currency.gp": currentCurrency.gp + quantity.gp,
                "system.currency.sp": currentCurrency.sp + quantity.sp,
                "system.currency.cp": currentCurrency.cp + quantity.cp,
            };
        }
        if (quantity.ep !== undefined) {
            if (alt) {
                updateGold["system.altCurrency.ep"] = currentCurrency.ep + quantity.ep;
            } else {
                updateGold["system.currency.ep"] = currentCurrency.ep + quantity.ep;
            }
        }
        console.log(`Giving ${alt ? "Weightless currency: " : ""} currency: pp:${quantity.pp}, gp:${quantity.gp}, ep:${quantity.ep || 0}, sp:${quantity.sp}, cp:${quantity.cp}, to actor ${actor.id}`);
        actor.update(updateGold);
    }
}

function offer(data) {
    if (data.currentItemData) {
        return `${data.quantity} ${data.currentItemData.name}`;
    }
    if (game.system.id === "wfrp4e") {
        return `${data.quantity.gc} GC, ${data.quantity.ss} SS, ${data.quantity.bp} BP`;
    }
    return `${data.alt ? "Weightless currency: ": ""} ${data.quantity.pp} pp, ${data.quantity.gp} gp, ${data.quantity.ep ? `${data.quantity.ep} ep, ` : ""}${data.quantity.sp} sp, ${data.quantity.cp} cp`;
}

function tradeConfirmed(tradeData) {
    if (tradeData.currentItemData) { 
        receiveItem(tradeData);
    } else {
        receiveCurrency(tradeData)
    }
    sendMessageToGM(tradeData);
    game.socket.emit('module.give-item-to-player', {
        data: tradeData,
        actorId: tradeData.currentActor.id,
        currentActorId: tradeData.actor.id,
        type: "accepted"
    });
}

function tradeDenied(tradeData) {
    game.socket.emit('module.give-item-to-player', {
        data: tradeData,
        actorId: tradeData.currentActor.id,
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

    chatMessage.whisper.push(tradeData.currentActor.id);

    ChatMessage.create(chatMessage);
}

function getItemFromInvoByName(actor, name) {
  return actor.items.find(t => t.name === name);
}
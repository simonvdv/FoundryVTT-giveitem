export class PlayerDialog extends foundry.applications.api.DialogV2 {
  constructor(callback, options = {}) {
    // Prepare the dialog configuration
    const buttons = [
      {
        action: "cancel",
        label: "Cancel",
        icon: "fas fa-times",
        default: true
      },
      {
        action: "accept",
        label: options.acceptLabel || "Accept",
        icon: "fas fa-check",
        callback: (event, button, dialog) => {
          return PlayerDialog._processForm(dialog, options.currency);
        }
      }
    ];

    const content = options.currency 
      ? PlayerDialog._buildCurrencyTemplate(options.filteredPCList)
      : PlayerDialog._buildItemTemplate(options.filteredPCList);

    super({
      window: {
        title: !options.currency ? "Offer item to someone" : "Offer currency to someone"
      },
      content,
      buttons,
      submit: (result) => {
        if (result && callback) {
          callback(result);
        }
      }
    });

    this.callback = callback;
    this.isCurrency = options.currency;
  }

  static _buildItemTemplate(filteredPCList) {
    return `
      <form>
        <div class="form-group">
          <label>Quantity:</label>
          <input type="number" min="1" id="quantity" name="quantity" value="1">
          <label>Players:</label>
          <select name="type" id="player">
            ${filteredPCList.reduce((acc, currentActor) => {
              return acc + `<option value="${currentActor.id}">${currentActor.name}</option>`;
            }, '')}
          </select>
        </div>
      </form>
    `;
  }

  static _buildCurrencyTemplate(filteredPCList) {
    const currencyFields = PlayerDialog._getCurrencyFieldsForSystem();
    
    return `
      <form>
        <div class="form-group">
          <div class="give-item-dialog player">
            <label>Players:</label>
            <select name="type" id="player">
              ${filteredPCList.reduce((acc, currentActor) => {
                return acc + `<option value="${currentActor.id}">${currentActor.name}</option>`;
              }, '')}
            </select>
          </div>
          ${currencyFields}
        </div>
      </form>
    `;
  }

  static _getCurrencyFieldsForSystem() {
    switch (game.system.id) {
      case "dnd5e":
        return `
          <div class="give-item-dialog currency">
            <label>Platinum:</label>
            <input type="number" id="pp" name="pp" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Gold:</label>
            <input type="number" id="gp" name="gp" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Electrum:</label>
            <input type="number" id="ep" name="ep" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Silver:</label>
            <input type="number" id="sp" name="sp" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Copper:</label>
            <input type="number" id="cp" name="cp" value="0">
          </div>
        `;
      
      case "pf1":
      case "pf2e":
        return `
          <div class="give-item-dialog currency">
            <label>Platinum:</label>
            <input type="number" id="pp" name="pp" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Gold:</label>
            <input type="number" id="gp" name="gp" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Silver:</label>
            <input type="number" id="sp" name="sp" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Copper:</label>
            <input type="number" id="cp" name="cp" value="0">
          </div>
        `;
      
      case "wfrp4e":
        return `
          <div class="give-item-dialog currency">
            <label>Gold Crown:</label>
            <input type="number" id="gc" name="gc" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Silver Shilling:</label>
            <input type="number" id="ss" name="ss" value="0">
          </div>
          <div class="give-item-dialog currency">
            <label>Brass Penny:</label>
            <input type="number" id="bp" name="bp" value="0">
          </div>
        `;
      
      default:
        return PlayerDialog._getCurrencyFieldsForSystem.call({system: {id: "dnd5e"}});
    }
  }

  static _processForm(dialog, isCurrency) {
    const form = dialog.element.querySelector('form');
    if (!form) {
      console.error("Give Item Module | Form not found in dialog");
      return null;
    }

    const playerId = form.querySelector('#player')?.value;
    
    if (!playerId) {
      ui.notifications.error("Please select a player.");
      return null;
    }

    if (isCurrency) {
      if (game.system.id === "wfrp4e") {
        const gc = Number(form.querySelector('#gc')?.value || 0);
        const ss = Number(form.querySelector('#ss')?.value || 0);
        const bp = Number(form.querySelector('#bp')?.value || 0);
        
        if (isNaN(gc) || isNaN(ss) || isNaN(bp)) {
          ui.notifications.error("Currency quantity invalid.");
          return null;
        }
        
        return { playerId, gc, ss, bp };
      } else {
        const pp = Number(form.querySelector('#pp')?.value || 0);
        const gp = Number(form.querySelector('#gp')?.value || 0);
        const ep = Number(form.querySelector('#ep')?.value || 0);
        const sp = Number(form.querySelector('#sp')?.value || 0);
        const cp = Number(form.querySelector('#cp')?.value || 0);
        
        if (isNaN(pp) || isNaN(gp) || isNaN(ep) || isNaN(sp) || isNaN(cp)) {
          ui.notifications.error("Currency quantity invalid.");
          return null;
        }
        
        return { playerId, pp, gp, ep, sp, cp };
      }
    } else {
      const quantity = Number(form.querySelector('#quantity')?.value || 1);
      
      if (isNaN(quantity) || quantity < 1) {
        ui.notifications.error("Item quantity invalid.");
        return null;
      }
      
      return { playerId, quantity };
    }
  }
}

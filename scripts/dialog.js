export class PlayerDialog extends foundry.applications.api.DialogV2 {
  constructor(callback, options) {
    if (typeof (options) !== "object") {
      options = {};
    }
    
    const giveItemTemplate = `
    <fieldset>
      <div class="form-group">
        <label>Quantity:</label>
        <input type="number" min="1" name="quantity" value="1">
      </div>
      <div class="form-group">
        <label>Players:</label>
        <select name="player">
          ${options.filteredPCList.reduce((acc, currentActor) => {
            return acc + `<option value="${currentActor.id}">${currentActor.name}</option>`
          }, '')}
        </select>
      </div>
    </fieldset>`;

    const currencyTemplate = `
    <div class="give-item-dialog currency">
      <label>Platinum:</label>
      <input type="number" name="pp" value="0">
    </div>
    <div class="give-item-dialog currency">
      <label>Gold:</label>
      <input type="number" name="gp" value="0">
    </div>
    <div class="give-item-dialog currency">
      <label>Electrum:</label>
      <input type="number" name="ep" value="0">
    </div>
    <div class="give-item-dialog currency">
      <label>Silver:</label>
      <input type="number" name="sp" value="0">
    </div>
    <div class="give-item-dialog currency">
      <label>Copper:</label>
      <input type="number" name="cp" value="0">
    </div>`;

    const giveCurrencyTemplate = `
    <fieldset>
      <div class="form-group">
        <div class="give-item-dialog player">
          <label>Players:</label>
          <select name="player">
            ${options.filteredPCList.reduce((acc, currentActor) => {
              return acc + `<option value="${currentActor.id}">${currentActor.name}</option>`
            }, '')}
          </select>
        </div>
        ${currencyTemplate}
      </div>
    </fieldset>`;
    
    super({
      window: {
        title: !options.currency ? "Offer item to someone" : "Offer currency to someone"
      },
      content: options.currency ? giveCurrencyTemplate : giveItemTemplate,
      buttons: [
        {
          action: "accept",
          label: options.acceptLabel ? options.acceptLabel : "Accept",
          icon: "fas fa-check",
          default: true,
          callback: (event, button, dialog) => {
            // Extract form data from the dialog element
            const form = dialog.element.querySelector('form');
            const formData = new FormData(form);
            
            if (options.currency) {
              const playerId = formData.get('player');
              let pp = formData.get('pp');
              let gp = formData.get('gp');
              let ep = formData.get('ep');
              let sp = formData.get('sp');
              let cp = formData.get('cp');
              
              if (isNaN(pp) || isNaN(gp) || isNaN(ep) || isNaN(sp) || isNaN(cp)) {
                console.log("Currency quantity invalid");
                ui.notifications.error(`Currency quantity invalid.`);
                return;
              }
              
              pp = Number(pp);
              gp = Number(gp);
              ep = Number(ep);
              sp = Number(sp);
              cp = Number(cp);
              
              callback({playerId, pp, gp, ep, sp, cp});
            } else {
              const playerId = formData.get('player');
              let quantity = formData.get('quantity');
              
              if (isNaN(quantity)) {
                console.log("Item quantity invalid");
                ui.notifications.error(`Item quantity invalid.`);
                return;
              }
              
              quantity = Number(quantity);
              callback({playerId, quantity});
            }
          }
        },
        {
          action: "cancel",
          label: "Cancel",
          icon: "fas fa-times"
        }
      ],
      rejectClose: false,
      modal: true
    });
  }
}
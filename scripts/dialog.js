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

    const currencyTemplate = options.currentCurrency ? `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
      <div class="currency-row">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Platinum (have: ${options.currentCurrency.pp})</label>
        <div class="currency-controls" style="display: flex; flex-direction: row; gap: 4px; align-items: center;">
          <button type="button" class="currency-btn currency-decrement" data-target="pp" style="padding: 4px 10px;">-</button>
          <button type="button" class="currency-btn currency-increment" data-target="pp" style="padding: 4px 10px;">+</button>
          <button type="button" class="currency-btn currency-max-btn" data-target="pp" data-max="${options.currentCurrency.pp}" style="padding: 4px 12px;">Max</button>
          <input type="number" name="pp" value="0" min="0" max="${options.currentCurrency.pp}" step="1" style="width: 80px; text-align: center;">
        </div>
      </div>
      <div class="currency-row">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Electrum (have: ${options.currentCurrency.ep})</label>
        <div class="currency-controls" style="display: flex; flex-direction: row; gap: 4px; align-items: center;">
          <button type="button" class="currency-btn currency-decrement" data-target="ep" style="padding: 4px 10px;">-</button>
          <button type="button" class="currency-btn currency-increment" data-target="ep" style="padding: 4px 10px;">+</button>
          <button type="button" class="currency-btn currency-max-btn" data-target="ep" data-max="${options.currentCurrency.ep}" style="padding: 4px 12px;">Max</button>
          <input type="number" name="ep" value="0" min="0" max="${options.currentCurrency.ep}" step="1" style="width: 80px; text-align: center;">
        </div>
      </div>
      <div class="currency-row">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Gold (have: ${options.currentCurrency.gp})</label>
        <div class="currency-controls" style="display: flex; flex-direction: row; gap: 4px; align-items: center;">
          <button type="button" class="currency-btn currency-decrement" data-target="gp" style="padding: 4px 10px;">-</button>
          <button type="button" class="currency-btn currency-increment" data-target="gp" style="padding: 4px 10px;">+</button>
          <button type="button" class="currency-btn currency-max-btn" data-target="gp" data-max="${options.currentCurrency.gp}" style="padding: 4px 12px;">Max</button>
          <input type="number" name="gp" value="0" min="0" max="${options.currentCurrency.gp}" step="1" style="width: 80px; text-align: center;">
        </div>
      </div>
      <div class="currency-row">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Silver (have: ${options.currentCurrency.sp})</label>
        <div class="currency-controls" style="display: flex; flex-direction: row; gap: 4px; align-items: center;">
          <button type="button" class="currency-btn currency-decrement" data-target="sp" style="padding: 4px 10px;">-</button>
          <button type="button" class="currency-btn currency-increment" data-target="sp" style="padding: 4px 10px;">+</button>
          <button type="button" class="currency-btn currency-max-btn" data-target="sp" data-max="${options.currentCurrency.sp}" style="padding: 4px 12px;">Max</button>
          <input type="number" name="sp" value="0" min="0" max="${options.currentCurrency.sp}" step="1" style="width: 80px; text-align: center;">
        </div>
      </div>
      <div class="currency-row">
        <label style="font-weight: bold; display: block; margin-bottom: 4px;">Copper (have: ${options.currentCurrency.cp})</label>
        <div class="currency-controls" style="display: flex; flex-direction: row; gap: 4px; align-items: center;">
          <button type="button" class="currency-btn currency-decrement" data-target="cp" style="padding: 4px 10px;">-</button>
          <button type="button" class="currency-btn currency-increment" data-target="cp" style="padding: 4px 10px;">+</button>
          <button type="button" class="currency-btn currency-max-btn" data-target="cp" data-max="${options.currentCurrency.cp}" style="padding: 4px 12px;">Max</button>
          <input type="number" name="cp" value="0" min="0" max="${options.currentCurrency.cp}" step="1" style="width: 80px; text-align: center;">
        </div>
      </div>
    </div>` : `
    <div class="give-item-dialog currency">
      <label>Platinum:</label>
      <input type="number" name="pp" value="0" min="0" step="1">
    </div>
    <div class="give-item-dialog currency">
      <label>Gold:</label>
      <input type="number" name="gp" value="0" min="0" step="1">
    </div>
    <div class="give-item-dialog currency">
      <label>Electrum:</label>
      <input type="number" name="ep" value="0" min="0" step="1">
    </div>
    <div class="give-item-dialog currency">
      <label>Silver:</label>
      <input type="number" name="sp" value="0" min="0" step="1">
    </div>
    <div class="give-item-dialog currency">
      <label>Copper:</label>
      <input type="number" name="cp" value="0" min="0" step="1">
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
  
  _onRender(context, options) {
  super._onRender(context, options);
  
  // Add event listeners for increment/decrement/max buttons
  const incrementButtons = this.element.querySelectorAll('.currency-increment');
  const decrementButtons = this.element.querySelectorAll('.currency-decrement');
  const maxButtons = this.element.querySelectorAll('.currency-max-btn');
  
  incrementButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget.dataset.target;
      const input = this.element.querySelector(`input[name="${target}"]`);
      const max = parseInt(input.getAttribute('max'));
      const current = parseInt(input.value) || 0;
      
      if (current < max) {
        input.value = current + 1;
      }
    });
  });
  
  decrementButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget.dataset.target;
      const input = this.element.querySelector(`input[name="${target}"]`);
      const min = parseInt(input.getAttribute('min')) || 0;
      const current = parseInt(input.value) || 0;
      
      if (current > min) {
        input.value = current - 1;
      }
    });
  });
  
  maxButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.currentTarget.dataset.target;
      const max = parseInt(e.currentTarget.dataset.max);
      const input = this.element.querySelector(`input[name="${target}"]`);
      input.value = max;
    });
  });
}
}

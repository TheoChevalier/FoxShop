'use strict';

/*******************************************************************************
 * ItemView
 ******************************************************************************/
SL.ItemView = {
  elm: SL.id("itemView"),
  name: "ItemView",
  item: {},
  init: function(aItem) {
    SL.hide("items");
    SL.show("itemView");
    SL.view = this.name;
    this.item = aItem;
    this.elm.getElementsByClassName("title")[0].textContent = this.item.name;
    SL.id("newItemName").value = this.item.name;
    SL.id("newItemQty").value = this.item.nb;
    SL.id("newPrice").setAttribute("hidden", "");

    if (typeof SL.Settings.obj["prices-enable"] !== "undefined") {
      console.log("defined");
      if (SL.Settings.obj["prices-enable"].value) {
        console.log("vraie");
        SL.id("newPrice").removeAttribute("hidden");
        if (typeof this.item.price != "undefined") {
          SL.id("newItemPrice").value = this.item.price;
        } else {
          SL.id("newItemPrice").value = "";
        }
      }
    }
  },
  plusOne: function() {
    SL.id("newItemQty").value = parseInt(SL.id("newItemQty").value) + 1;
  },
  lessOne: function() {
    var current = parseInt(SL.id("newItemQty").value);
    if (current > 1) {
      SL.id("newItemQty").value = current - 1;
    }
  },

  //Save current item into DB
  save: function() {
    var name = SL.id("newItemName").value;
    var qty  = parseFloat(SL.id("newItemQty").value);
    var price = SL.id("newItemPrice").value;
    price = price.replace(/,/gm,".");
    price = parseFloat(price).toFixed(2);

    // Check values, display error
    if (!name || !qty) {
      var l10n = "";
      if (!name) {
        l10n = "msg-name";
        if (!qty) {
          l10n = "msg-name-qty";
        }
      } else {
        if (!qty) {
          l10n = "msg-qty";
        }
      }

      SL.displayStatus(l10n);
      return;
    }
    if (isNaN(price) && price != "") {
      SL.displayStatus("msg-NaN");
      return;
    }

    // Update obj & DB
    var item = SL.Items.obj[this.item.guid];
    item.name = name;
    item.nb = qty;
    item.price = price;
    SL.Items.obj[item.guid].price = price;
    DB.deleteFromDB(item.guid, SL.Items, false);
    DB.store(item, SL.Items, false);

    // Update UI
    SL.Items.updateUI();
    SL.Lists.updateUI();
  },
  updateUI: function() {}
}

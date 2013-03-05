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
    this.elm.getElementsByClassName("title")[0].innerHTML = this.item.name;
    SL.id("newItemName").value = this.item.name;
    SL.id("newItemQty").value = this.item.nb;

    if (typeof SL.Settings.obj["prices-enable"] !== "undefined") {
      if (SL.Settings.obj["prices-enable"].value) {
        SL.id("newPrice").removeAttribute("hidden");
        if (typeof this.item.price != "undefined") {
          SL.id("newItemPrice").value = this.item.price;
        } else {
          SL.id("newItemPrice").value = "";
        }
      }
    } else {
      SL.id("newPrice").setAttribute("hidden", "");
    }
  },
  plusOne: function() {
    SL.id("newItemQty").value = eval(SL.id("newItemQty").value) + 1;
  },
  lessOne: function() {
    var current = eval(SL.id("newItemQty").value);
    if (current > 1) {
      SL.id("newItemQty").value = current - 1;
    }
  },

  //Save current item into DB
  save: function() {
    var name = SL.id("newItemName").value;
    var qty  = parseFloat(SL.id("newItemQty").value);
    var price  = parseFloat(SL.id("newItemQty").value);

    // Handle empty form
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

      displayStatus(l10n);
      return;
    }

    var item = this.item;
    item.name = name;
    item.nb = qty;
    item.price = parseFloat(SL.id("newItemPrice").value);
    DB.deleteFromDB(item.guid, SL.Items);
    DB.store(item, SL.Items);

    // Update items and lists UI
    SL.Items.updateUI();
    SL.Lists.updateUI();
  },
  updateUI: function() {}
}

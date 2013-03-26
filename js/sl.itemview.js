'use strict';

/*******************************************************************************
 * ItemView
 ******************************************************************************/
SL.ItemView = {
  elm: $id("itemView"),
  name: "ItemView",
  item: {},
  init: function(aItem) {
    location.hash = this.elm.id;
    SL.view = this.name;
    this.item = aItem;
    this.elm.getElementsByClassName("title")[0].textContent = this.item.name;
    $id("newItemName").value = this.item.name;
    $id("newItemQty").value = this.item.nb;
    $id("newPrice").setAttribute("hidden", "");

    if (typeof SL.Settings.obj["prices-enable"] !== "undefined") {
      if (SL.Settings.obj["prices-enable"].value) {
        $id("newPrice").removeAttribute("hidden");
        $id("newItemPrice").value = (typeof this.item.price != "undefined") ? this.item.price : "";
      }
    }
  },
  plusOne: function() {
    $id("newItemQty").value = parseInt($id("newItemQty").value) + 1;
  },
  lessOne: function() {
    var current = parseInt($id("newItemQty").value);
    if (current > 1) {
      $id("newItemQty").value = current - 1;
    }
  },

  //Save current item into DB
  save: function() {
    var l10n = "";
    var item;
    var price = "";
    var name = $id("newItemName").value;
    var qty  = parseFloat($id("newItemQty").value);

    // Check values, display error
    if (!name || !qty) {
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

    // Update obj & DB
    item = SL.Items.obj[this.item.guid];
    item.name = name;
    item.nb = qty;

    if (typeof SL.Settings.obj["prices-enable"] !== "undefined") {
      if (SL.Settings.obj["prices-enable"]) {
        if ($id("newItemPrice").value !== "") {
          price = $id("newItemPrice").value;
          price = price.replace(/,/gm,".");
          price = parseFloat(price).toFixed(2);
          if (isNaN(price)) {
            SL.displayStatus("msg-NaN");
            return;
          }
        }
        item.price = price;
        SL.Items.obj[item.guid].price = price;
      }
    }

    DB.deleteFromDB(item.guid, SL.Items, false);
    DB.store(item, SL.Items, false);

    // Update UI
    SL.Lists.updateUI();
    SL.Items.updateUI();
  },
  updateUI: function() {},
  remove: function() {
    var guid = this.item.guid;
    SL.removeElement(SL.Items.elm.querySelector('li[data-listkey="'+guid+'"]'));
    location.hash = "#items";
    DB.deleteFromDB(guid, SL.Items);
  }
}

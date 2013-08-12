'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*******************************************************************************
 * ItemView
 ******************************************************************************/
SL.newItemForm = {
  elm: $id("newItemForm"),
  name: "newItemForm",
  item: {},
  init: function(aItem) {
    location.hash = this.elm.id;
    SL.view = this.name;
    this.item = aItem;

    // Reset view
    this.elm.getElementsByClassName("title")[0].textContent = this.item.name;
    $id('NIF-container').reset();
    SL.show("NIF-delete");

    $id("NIF-name").value = this.item.name;
    $id("NIF-qty").value = (typeof this.item.nb != "undefined") ? this.item.nb : 1;
    $id("NIF-price").parentNode.setAttribute("hidden", "");
    $id("NIF-note").value = (typeof this.item.note != "undefined") ? this.item.note : "";

    // Set category if any
    if (typeof this.item.category != "undefined") {
      var select = $id("NIF-category").querySelector('option[value="'+this.item.category+'"]');
      select.setAttribute("selected","");
      $id("NIF-category-button").textContent = select.textContent;
    } else {
      select = $id("NIF-category").querySelector('option[value="other"]');
      select.setAttribute("selected","");
      $id("NIF-category-button").textContent = _("NIF-category-button");
    }

    // Set unit if any
    if (typeof this.item.unit != "undefined") {
      select = $id("NIF-unit").querySelector('option[value="'+this.item.unit+'"]');
      select.setAttribute("selected","");
      $id("NIF-unit-button").textContent = select.textContent;
    } else {
      select = $id("NIF-unit").querySelector('option[value="piece"]');
      select.setAttribute("selected","");
      $id("NIF-unit-button").textContent = _("NIF-unit-button");
    }

    if (SL.Settings.obj["prices"].value) {
      $id("NIF-price").parentNode.removeAttribute("hidden");
      $id("NIF-price").value = (typeof this.item.price != "undefined") ? this.item.price : "";
    }
  },

  //Save current item into DB
  doneNIF: function() {
    var l10n = "";
    var item;
    var price = "";
    var name = $id("NIF-name").value;
    var qty  = parseFloat($id("NIF-qty").value);
    var note  = $id("NIF-note").value;
    var category  = $id("NIF-category").options[$id("NIF-category").selectedIndex].value;
    var unit  = $id("NIF-unit").options[$id("NIF-unit").selectedIndex].value;

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
    item.note = note;
    item.category = category;
    item.unit = unit;

    if (SL.Settings.obj["prices"].value) {
      if ($id("NIF-price").value !== "") {
        price = $id("NIF-price").value;
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

    DB.deleteFromDB(item.guid, SL.Items, false);
    DB.store(item, SL.Items, false);

    // Update UI
    SL.Lists.updateUI();
    SL.Items.updateUI();

    // Reset form
    $id('NIF-container').reset();
    location.hash = "#items";
  },
  remove: function() {
    var guid = this.item.guid;
    SL.removeElement(SL.Items.elm.querySelector('li[data-listkey="'+guid+'"]'));
    location.hash = "#items";
    DB.deleteFromDB(guid, SL.Items);
    // Update UI
    SL.Lists.updateUI();
    SL.Items.updateUI();
  },
  updateUI: function() {},
}

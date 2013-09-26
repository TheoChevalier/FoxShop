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
    SL.show("thumbnail-action");
    $id("NIF-photo").src ="";

    $id("NIF-name").value = this.item.name;
    $id("NIF-qty").value = (typeof this.item.nb != "undefined") ? this.item.nb : 1;
    $id("NIF-note").value = (typeof this.item.note != "undefined") ? this.item.note : "";
    //$id("NIF-photo").src = aItem.image ? aItem.image : "";
    DB.setBlob(this.item.guid, $id("NIF-photo"));

    // Set category if any
    var category = this.item.category;
    if (typeof category == "undefined") {
      category = "other";
    }
    var select = $id("NIF-category").querySelector('option[value="'+category+'"]');
    SL.updateSelectedOption("NIF-category", category);
    $id("NIF-category-button").textContent = select.textContent;

    // Set unit if any
    if (typeof this.item.unit != "undefined") {
      var unit = this.item.unit;
    } else {
      var unit = "piece";
    }
    select = $id("NIF-unit").querySelector('option[value="'+unit+'"]');
    SL.updateSelectedOption("NIF-unit", unit);
    $id("NIF-unit-button").textContent = select.textContent;

    $id("NIF-price").parentNode.setAttribute("hidden", "");
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

    // If the user selected a picture, save it
    if ($id("NIF-photo").src != "")
      var image = $id("NIF-photo").src;
    else
      var image = false;


    // Update obj & DB
    item = SL.Items.obj[this.item.guid];
    item.name = name;
    item.nb = qty;
    item.note = note;
    item.category = category;
    item.unit = unit;
    item.image = image;

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
    }

    DB.deleteFromDB(item.guid, SL.Items, false);
    DB.store(item, SL.Items, false);
    DB.storeBlob(item.guid, item.image);

    // Update UI
    SL.Lists.updateUI();
    SL.Items.updateUI();

    // Reset forms
    $id('NIF-container').reset();
    $id("itemName").value = "";
    location.hash = "#items";
  },
  remove: function() {
    var guid = this.item.guid;
    // Check if empty category
    var cat = SL.Items.elm.querySelectorAll('li[data-listkey="'+guid+'"]')[0].parentNode.className;
    SL.removeElement(SL.Items.elm.querySelector('li[data-listkey="'+guid+'"]'));
    cat = SL.Items.elm.getElementsByClassName(cat);
    [].forEach.call(cat, function(v, i) {
      if (v.getElementsByTagName("li").length == 0) {
        SL.removeElement(v);
      }
    });
    location.hash = "#items";
    DB.deleteFromDB(guid, SL.Items);
    // Update UI
    SL.Lists.updateUI();
    SL.Items.updateUI();
  },
  pickImage: function() {
    if (!MOZACTIVITY) {
      $id('input-photo').click();
      $id('input-photo').addEventListener('change', this.handleFileSelect, false);
    } else {
    var pick = new MozActivity({
        name: "pick",
        data: {
          type: ["image/png", "image/jpg", "image/jpeg"]
        }
      });

      pick.onsuccess = function () {
        var url = window.URL.createObjectURL(this.result.blob);
        $id("NIF-photo").src = url;

        SL.redimImage(url, "NIF-photo", 100, 100);
      };
    }
  },
  handleFileSelect: function(evt) {
    var files = evt.target.files; // FileList object

    // render image file as thumbnail.
    var f = files[0];
    var reader = new FileReader();

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        SL.redimImage(e.target.result, "NIF-photo", 100, 100);
      };
    })(f);

    // Read in the image file as a data URL.
    reader.readAsDataURL(f);
  },
  updateUI: function() {},
}

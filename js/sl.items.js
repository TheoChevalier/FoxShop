/*******************************************************************************
 * Items
 ******************************************************************************/
SL.Items = {
  elm: $id("items"),
  name: "Items",
  nextView: "ItemView",
  store: DB_STORE_ITEMS,
  obj: {},
  list: {},
  loaded: false,
  init: function(aList) {
    SL.view = this.name;
    this.list = aList;
    this.guid = aList.guid;
    SL.clear(this.name);
    location.hash = "#items";
    SL.Lists.updateUI();
    this.updateUI();

    // Set title of the displayed Items list
    this.elm.getElementsByClassName("title")[0].textContent=aList.name;

    // Display each item
    for (aGuid in this.obj) {
      if (this.obj[aGuid].list == aList.guid) {
        SL.display(this.obj[aGuid], this);
      }
    }
  },

  // Add an item to the current list
  new: function() {
    var name = $id('itemName').value;
    var qty = $id('itemQty').value;
    $id('itemName').value = "";
    $id('itemQty').value = "";
    var date = new Date();

    // Remove line-endings
    name = name.replace(/(\r\n|\n|\r)/gm,"");

    // Handle empty form
    if (!name) {
      SL.displayStatus("msg-name");
      return;
    }

    if (!qty) {
      qty = 1;
    }

    aItem = { guid: SL.guid(),
              name: name,
              list: this.guid,
              nb: qty,
              date: date.getTime(),
              done: false
    };

    DB.store(aItem, this);
    SL.display(aItem, this);
    this.updateUI();
    SL.Lists.updateUI();
  },

  // Use SL.display function to populate the list
  display: function(aList) {
    SL.display(aList, this);
  },
  updateUI: function() {
    this.loaded = true;
    this.updateListStatus();

    // Check scanner
    if (SL.Settings.obj.scanEnable.value && SCANNER) {
      SL.show("scan");
      $id("itemName").className = "";
    } else {
      SL.hide("scan");
      $id("itemName").className = "noScan";
    }

    // For each list, count items and calculate total
    for(var item in this.obj) {
      item = this.obj[item];
      if (this.elm.querySelector('li[data-listkey="'+item.guid+'"]') !== null) {
        var node = this.elm.querySelector('li[data-listkey="'+item.guid+'"]');

        // Name (first p)
        node = node.getElementsByTagName("p");
        node[0].textContent = item.name;

        // Set prices w/ currency at the right position (second p, first a)
        if (SL.Settings.obj.prices.value) {
          node = node[1].getElementsByTagName("a");
          if(item.price != "") {
            SL.setPrice(node[0], "item-price", item.price);
          } else {
            node[0].textContent = "";
          }
        }

        if (item.nb > 1) {
          // Quantity (second p, second a)
          node[1].setAttribute("data-l10n-args", "{quantity: "+item.nb+"}");
          node[1].textContent = _("item-quantity", {"quantity": item.nb});
        }
      }
    }
  },
  updateListStatus: function() {
    // Update total/remaining
    if (this.list.total > 0 && SL.Settings.obj.prices.value) {
      if (typeof this.list.remaining == "undefined" || this.list.remaining == "") {
        this.list.remaining  = 0;
      }
      SL.show("list-status");
      SL.setPrice($id("list-total"), "total-list", this.list.total);
      SL.setPrice($id("list-remaining"), "remaining-list", this.list.remaining);
    } else {
      SL.hide("list-status");
    }
  },
  openEditListName: function() {
    var input = $id("newListName").getElementsByTagName("input")[0];
    input.value = this.list.name;
    this.elm.getElementsByClassName("title")[0].style.display = "none";
    $id("editList").style.display = "none";
    $id("newListName").style.display = "block";
    $id("saveList").style.display = "block";
  },
  closeEditListName: function() {
    var title = this.elm.getElementsByClassName("title")[0];
    title.textContent = this.list.name;
    title.style.display = "block";
    $id("editList").style.display = "block";
    $id("newListName").style.display = "none";
    $id("saveList").style.display = "none";
  },
  saveListName: function() {
    var newName = $id("newListName").getElementsByTagName("input")[0].value;
    if (newName !== "") {
      this.closeEditListName();
      this.list.name = newName;
      this.elm.getElementsByClassName("title")[0].textContent = newName;
      SL.Lists.updateUI();
      DB.deleteFromDB(this.list.guid, SL.Lists, false);
      DB.store(this.list, SL.Lists, false);
    } else {
      SL.displayStatus("msg-name");
    }
  },
  openNIF: function() {
    location.hash = "#newItemForm";
  },
  saveNIF: function() {
    var name = $id('NIF-name').value;
    var qty = $id('NIF-qty').value;
    var price = $id('NIF-price').value;
    var category = $id('NIF-category').value;
    var unit = $id('NIF-unit').value;
    var note = $id('NIF-note').value;
    var date = new Date();

    // Remove line-endings
    name = name.replace(/(\r\n|\n|\r)/gm,"");

    var categoryForm = document.querySelector('select[name="NIF-category"]');
    var category = categoryForm.options[categoryForm.selectedIndex].value;

    var unitForm = document.querySelector('select[name="NIF-unit"]');
    var unit = unitForm.options[unitForm.selectedIndex].value;

    // Handle empty form
    if (!name) {
      SL.displayStatus("msg-name");
      return;
    }

    if (!qty) {
      qty = 1;
    }

    aItem = { guid: SL.guid(),
              name: name,
              list: this.guid,
              nb: qty,
              price: price,
              category: category,
              note: note,
              date: date.getTime(),
              done: false
    };

    DB.store(aItem, this);
    SL.display(aItem, this);
    this.updateUI();
    SL.Lists.updateUI();

    // Reset form
    $id('NIF-container').reset();
    location.hash = "#items";
  },
  plusOne: function(id) {
    var current = parseInt($id(id).value);
    if(!current > 0) {
      current = 0;
    }
    $id(id).value = current + 1;
  },
  lessOne: function(id) {
    var current = parseInt($id(id).value);
    if (current > 1) {
      $id(id).value = current - 1;
    }
  },
  clone: function() {
    var current = this.list;
    var guid = SL.guid();
    var date = new Date();

    // Clone list obj
    SL.Lists.obj[guid] = {};
    SL.Lists.obj[guid].guid = guid;
    SL.Lists.obj[guid].name = current.name + " ("+_("copy")+")";
    SL.Lists.obj[guid].done = current.done;
    SL.Lists.obj[guid].date = date.getTime();

    // Clone items obj
    for (aGuid in SL.Items.obj) {
      var aItem = SL.Items.obj[aGuid];
      if (aItem.list === current.guid) {
        var guidItem = SL.guid();
        var target = {};
        target.name = aItem.name;
        target.nb   = aItem.nb;
        target.done = aItem.done;
        target.date = date.getTime();
        target.list = guid;
        target.guid = guidItem;
        if (typeof aItem.price !== "undefined") {
          target.price = aItem.price;
        }

        SL.display(target, SL.Items);
        DB.store(target, SL.Items);
      }
    }

    // Display & save list then updateUI
    SL.display(SL.Lists.obj[guid], SL.Lists);
    DB.store(SL.Lists.obj[guid], SL.Lists, false);
    SL.Lists.updateUI();
    SL.Items.updateUI();
  },
  mozActivity: function() {
    var title = _("email-title-begin") + this.list.name + " " +_("email-title-end");
    var prices = SL.Settings.obj.prices.value;
    var position = SL.Settings.obj.currencyPosition.value;
    var currency = SL.Settings.obj.userCurrency.value;
    var signature = SL.Settings.obj.signature.value;
    var content;
    var Email;
    var SMS;

    if (!SHARE) {
      location.hash = "#enterEmail";
      return;
    }

    if (currency === "")
      currency = _("currency");

    if (signature) {
      Email = title + " " + _("email-intro-end-sms") + "%0A%0A";
      SMS = title + " " + _("email-intro-end-sms") + "\n\n";
    }

    for(var item in this.obj) {
      content = "";
      item = this.obj[item];
      if (item.done) {
        content += "- ["+_("bought")+"] ";
      } else {
        content += "- ";
      }
      content += item.name;
      if (item.qty > 1) {
        content += " x" + item.qty;
      }
      if (prices && item.price > 0) {
        if (position === "right")
          content += " (" + item.price + " " + currency + ")";
        else
          content += " (" + currency + " " + item.price + ")";
      }
      Email += content + "%0A";
      SMS += content + "\n";
    }

    var a = new MozActivity({
      name: 'new',
      data: {
        url: "mailto:?subject=" + title +"&body=" + Email, // for emails,
        body: SMS // for SMS
      }
    });
  },
  pickImage: function() {
    if (!SCANNER) {
      return;
    }
    var pick = new MozActivity({
      name: "pick",
      data: {
        type: ["image/png", "image/jpg", "image/jpeg"]
      }
    });

    pick.onsuccess = function () {
      $id("image").src = window.URL.createObjectURL(this.result.blob);
      alert("We are analysing the picture…");
      var barcode = SL.getBarcodeFromImage("image");
      barcode = barcode.toString();
      var url = 'http://theochevalier.fr/app/php/barcode/index.php?barcode=' + barcode;
      SL.callOtherDomain(url);
    };
  }
}


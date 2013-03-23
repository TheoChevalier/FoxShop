
/*******************************************************************************
 * Items
 ******************************************************************************/
SL.Items = {
  elm: $id("items"),
  name: "Items",
  nextView: "ItemView",
  store: DB_STORE_ITEMS,
  obj: {},
  loaded: false,
  init: function(aList) {
    SL.Lists.close();
    SL.view = this.name;
    this.list = aList;
    this.guid = aList.guid;
    SL.clear(this);
    SL.hide("lists");
    SL.show("items");

    // Set title of the displayed Items list
    this.elm.getElementsByClassName("title")[0].textContent=aList.name;

    // Display each item
    for (aGuid in this.obj) {
      if (this.obj[aGuid].list == aList.guid) {
        SL.display(this.obj[aGuid], this);
      }
    }
  },

  // Go back to Lists view
  back: function() {
    // Hide Items list
    SL.hide("items");
    // Display Lists list
    SL.Lists.init();
  },

  // Add an item to the current list
  new: function() {
    var name = $id('itemName').value;
    var qty = $id('itemQty').value;
    $id('itemName').value = "";
    $id('itemQty').value = "1";
    var date = new Date();

    // Remove line-endings
    name = name.replace(/(\r\n|\n|\r)/gm,"");

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

      SL.displayStatus(l10n);
      return;
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
  },

  // Use SL.display function to populate the list
  display: function(aList) {
    SL.display(aList, this);
  },
  updateUI: function() {
    this.loaded = true;

    // For each list, count items and calculate total
    for(var item in this.obj) {
      item = this.obj[item];
      if (this.elm.querySelector('li[data-listkey="'+item.guid+'"]') !== null) {
        var node = this.elm.querySelector('li[data-listkey="'+item.guid+'"]');

        // Name (first p)
        node = node.getElementsByTagName("p");
        node[0].textContent = item.name;

        // Set prices w/ currency at the right position (second p, first a)
        node = node[1].getElementsByTagName("a");
        SL.setPrice(node[0], "item-price", item.price);

        // Quantity (second p, second a)
        node[1].setAttribute("data-l10n-args", "{quantity: "+item.nb+"}");
        node[1].textContent = _("item-quantity", {"quantity": item.nb});
      }
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
  }
}


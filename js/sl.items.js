
/*******************************************************************************
 * Items
 ******************************************************************************/
SL.Items = {
  elm: SL.id("items"),
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
    var name = SL.id('itemName').value;
    var qty = SL.id('itemQty').value;
    SL.id('itemName').value = "";
    SL.id('itemQty').value = "1";
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

      displayStatus(l10n);
      return;
    }

    aItem = { guid: guid(),
              name: name,
              list: this.guid,
              nb: qty,
              date: date.getTime(),
              done: false
    };

    DB.store(aItem, this);
    SL.display(aItem, this);
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
  }
}


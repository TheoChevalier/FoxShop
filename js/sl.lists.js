
/*******************************************************************************
 * Lists
 ******************************************************************************/
SL.Lists = {
  elm : SL.id("lists"),
  name: "Lists",
  nextView: "Items",
  arrayList : {},
  store: DB_STORE_LISTS,
  obj: {},
  loaded: false,
  init: function() {
    SL.view = this.name;
    SL.show("lists");

    //Check install button
    if (typeof navigator.mozApps != "undefined") {
      var request = navigator.mozApps.getSelf();
      request.onsuccess = function() {
        if (!request.result) {
          SL.id("install").style.display = "block";
        }
      }
    }
  },
  close: function() {
    SL.view = "";
    SL.hide("lists");
  },
  add: function(aList) {
    DB.store(aList, this);
    SL.display(aList, this);
  },
  new: function() {
    var name = SL.id('listName').value;
    SL.id('listName').value = "";
    var date = new Date();

    // Remove line-endings
    name = name.replace(/(\r\n|\n|\r)/gm,"");
    if (!name || name === undefined) {
      displayStatus("msg-name");
      return;
    }
    SL.Lists.add({ guid: guid(),
                   name: name,
                   date: date.getTime(),
                   items:{}
    });
  },
  edit: function (aList, elm) {
    aList.done = elm.getElementsByTagName("input")[0].checked;
    aList.name = elm.getElementsByTagName("a")[0].innerHTML;

    // Delete the list, add the updated one
    DB.deleteFromDB(aList.guid, this);
    DB.store(aList, this);
  },
  display: function(aList) {
    SL.display(aList, this);
  },

  // Update displayed list after all view.obj were populated
  updateUI: function() {
    this.loaded = true;
    // FIXME: find something else, we can be in another view
    SL.view = this.name;
    SL.clear();

    // For each list, count items and calculate total
    for(var aList in this.obj) {
      var total = 0;
      var i = 0;

      // Display it
      SL.display(this.obj[aList], this);
      for(var aItem in SL.Items.obj) {
        if (SL.Items.obj[aItem].list == aList) {
          i++;
          if (typeof SL.Items.obj[aItem].price != "undefined") {
            total += SL.Items.obj[aItem].price
          }
        }
      }
      // Get nodes
      var elm = this.elm.querySelector('li[data-listkey="'+aList+'"]');
      elm = elm.getElementsByTagName("p")[1];
      var elmCount = elm.getElementsByTagName("a")[0];
      var elmTotal = elm.getElementsByTagName("a")[1];

      // Set items count
      elmCount.setAttribute("data-l10n-id", "nb-items");
      elmCount.setAttribute("data-l10n-args", '{"n":'+i+'}');
      elmCount.innerHTML = _("nb-items", {"n":i});

      // Prepare settings
      var pricesEnabled = false;
      if (typeof SL.Settings.obj["prices-enable"] != "undefined") {
        pricesEnabled = SL.Settings.obj["prices-enable"].value;
      }

      // Continue only if we handle prices
      if (pricesEnabled) {
        var position = "right";
        if (typeof SL.Settings.obj.position != "undefined") {
          position = SL.Settings.obj.position.value;
        }

        var currency = _("default-currency");
        if (typeof SL.Settings.obj.currency != "undefined") {
          currency = SL.Settings.obj.currency.value;
        }

        elmTotal.setAttribute("data-l10n-id", "total");
        if (position == "right") {
          elmTotal.setAttribute("data-l10n-args", "{'a':"+total+", 'b':"+currency+"}");
          elmTotal.innerHTML = _("total", {"a":total, "b":currency});
        } else {
          elmTotal.setAttribute("data-l10n-args", "{'a':"+currency+", 'b':"+total+"}");
          elmTotal.innerHTML = _("total", {"a":currency, "b":total});
        }
      }
    }
  }
};

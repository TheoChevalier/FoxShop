
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
      var request = navigator.mozApps.checkInstalled(MANIFEST);
      request.onsuccess = function() {
        // If the App is not installed
        if (request.result == null) {
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
    this.updateUI();
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
    aList.name = elm.getElementsByTagName("a")[0].textContent;

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
            total += SL.Items.obj[aItem].price * SL.Items.obj[aItem].nb;
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
      elmCount.textContent = _("nb-items", {"n":i});

      // Display total with the right currency at the right position
      SL.setPrice(elmTotal, "total-list", total);
    }
  }
};

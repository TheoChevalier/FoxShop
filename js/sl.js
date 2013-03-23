//  'use strict';
  // DB init
  var DB_NAME = 'ShoppingList';
  var DB_VERSION = 3; // Use a long long for this value (don't use a float)
  var DB_STORE_LISTS = 'lists2';
  var DB_STORE_ITEMS = 'items1';
  var DB_STORE_SETTINGS = 'settings1';
  var db;

  // Alias for getElementById
  var $id = document.getElementById.bind(document);

  // Define manifest URL
  if (location.host === "localhost") {
    var MANIFEST = "http://localhost/FoxShop/manifest.webapp";
  } else {
    var MANIFEST = location.protocol + "//" + location.host + "/FoxShop/manifest.webapp";
  }

  /*****************************************************************************
  * App event listeners
  ****************************************************************************/
  // Init App after l10n init
  window.addEventListener("localized", function() {
    SL.hide("loader");
    if(typeof db == "undefined") {
      DB.openDb();
    }
  });

  // Manage App Cache updates
  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      // Swap it in and reload the page to get the new hotness.
      console.log("update cache");
      window.applicationCache.swapCache();
      window.location.reload();
    }
  }, false);


var SL = {
  // Actions that needs the DB to be ready
  finishInit: function() {
    // Load all the data in <view>.obj
    DB.updateObj("Settings");
    DB.updateObj("Items");
  },

  /*****************************************************************************
  * functions shared between views
  ****************************************************************************/
  // Display an element of a list in a view
  display: function(aList, aView) {
    var newLi = document.createElement('li');
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    var mySpan = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    if (aList.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
    }

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    mySpan.addEventListener("click", function(e) {

      if (!aList.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }
      aList.done = !aList.done;

      // Delete the item, add the updated one
      DB.deleteFromDB(aList.guid, aView, true);
      DB.store(aList, aView, true);
    });


    // Part 2 pack-end
    var packEnd  = document.createElement('aside');
    packEnd.className = "pack-end";

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    var total = document.createElement('a');
    var count = document.createElement('a');
    p1.textContent = aList.name;

    p2.appendChild(total);
    p2.appendChild(count);

    newTitle.className = "liTitle";
    newTitle.addEventListener("click", function(e) {
      SL[aView.nextView].init(SL[aView.name].obj[newLi.dataset.listkey]);
      SL[aView.nextView].updateUI();
    });
    newTitle.appendChild(p1);
    newTitle.appendChild(p2);

    newLi.appendChild(newToggle);
    newLi.appendChild(packEnd);
    newLi.appendChild(newTitle);

    aView.elm.getElementsByClassName("list")[0].appendChild(newLi);
  },

  // Cross out all item
  completeall: function() {
    // Update UI
    var nodes = SL[this.view].elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
        nodes[i].getElementsByTagName('input')[0].setAttribute("checked", true);
        nodes[i].className.replace ( /(?:^|\s)done(?!\S)/g , '' );
        nodes[i].className += " done";
    }
    // Update obj & DB
    for (aGuid in SL[this.view].obj) {
      var aItem = SL[this.view].obj[aGuid];
      aItem.done = true;
      DB.deleteFromDB(aItem.guid, SL[this.view], true);
      DB.store(aItem, SL[this.view], true);
    }
  },

  // Remove done items/lists
  removeDone: function(aView) {
    var nodes = SL[aView].elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      var guid = nodes[i].dataset["listkey"];
      if (nodes[i].getElementsByTagName("input")[0].checked) {
        DB.deleteFromDB(guid, SL[this.view]);
        // FIXME: use removeElement()
        nodes[i].style.display = "none";
      }
    }
  },
  // Used everywhere where prices are needed
  setPrice: function(elm, string, value) {
    // Return if no price
    if (typeof value === "undefined" || typeof value === "NaN" || value == 0) {
      return;
    }
    // Limit numbers after decimal place
    value = parseFloat(value).toFixed(2);

    // Default values
    var pricesEnabled = false;
    var position = "right";
    var currency = _("user-currency");

    // Prepare settings
    if (typeof SL.Settings.obj["prices-enable"] != "undefined") {
      pricesEnabled = SL.Settings.obj["prices-enable"].value;
    }

    // Continue only if we handle prices
    if (!pricesEnabled) {
      return;
    }

    if (typeof SL.Settings.obj.currencyPosition != "undefined") {
      position = SL.Settings.obj.currencyPosition.value;
    }

    if (typeof SL.Settings.obj.userCurrency != "undefined") {
      currency = SL.Settings.obj.userCurrency.value;
    }

    var a = currency;
    var b = value;
    if (position == "right") {
      a = value;
      b = currency;
    }
    elm.setAttribute("data-l10n-id", string);
    elm.setAttribute("data-l10n-args", '{"a":"'+a+'", "b":"'+b+'"}');
    elm.textContent = _(string, {"a":a, "b":b});
  },
  displayStatus: function(id) {
    var status = $id("status");
    SL.show("status");
    status.innerHTML = "<p>"+_(id)+"</p>";
    $id("status").className ="slideIn";
    setTimeout(function() {
      $id("status").className = "slideOut";
    }, 3000);
  },
  hideStatus: function() {
    if ($id("status").className == "slideOut") {
      SL.hide("status");
    }
  },
  // Init the deleteItem section with a custom message
  initConfirm: function(n) {
    var span = $id("deleteItem").getElementsByTagName("span")[0];
    span.textContent = _("delete-item-desc", {'n':n});
  },

  /*****************************************************************************
  * Generic functions, used everywhere
  ****************************************************************************/ 
  // Generate four random hex digits.
  S4: function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  },
  // Generate a pseudo-GUID by concatenating random hexadecimal.
  guid: function() {
     return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
  },
  hide: function(target) {
    target = $id(target).style;
    target.display = "none";
  },
  show: function(target) {
    target = $id(target).style;
    target.display = "block";
  },
  removeElement: function(node) {
    if(node !== null) {
      node.parentNode.removeChild(node);
    }
  },
  clear: function() {
    var node = SL[this.view].elm.getElementsByClassName("list")[0];
    while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
    }
  },

  //Unused for now
  class: function(target, n) {
    if (typeof n === "undefined") {
      n = 0;
    }

    return document.getElementByClassName(target)[n];
  },
  getCheckedRadioId: function(name) {
    var elements = document.getElementsByName(name);

    for (var i=0, len=elements.length; i<len; ++i)
        if (elements[i].checked) return elements[i].value;
  },
};


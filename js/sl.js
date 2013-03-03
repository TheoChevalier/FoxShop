//  'use strict';
        // DB init
  var DB_NAME = 'ShoppingList';
  var DB_VERSION = 3; // Use a long long for this value (don't use a float)
  var DB_STORE_LISTS = 'lists2';
  var DB_STORE_ITEMS = 'items1';
  var DB_STORE_SETTINGS = 'settings1';

  // Define manifest URL
  if (location.host === "localhost") {
    var MANIFEST = "http://localhost/ShoppingList/manifest.webapp";
  } else {
    var MANIFEST = location.protocol + "//" + location.host + "/manifest.webapp";
  }

var SL = {
  hide: function(target) {
    target = SL.id(target).style;
    target.display = "none";
  },
  show: function(target) {
    target = SL.id(target).style;
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
  id: function(target) {
    return document.getElementById(target);
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
    var count = document.createElement('a');
    var total = document.createElement('a');
    p1.innerHTML = aList.name;

    // Special cases
    switch (aView.name) {
      case "Items":
        var nb = aList.nb;
        if (nb > 1) {
          count.setAttribute("data-l10n-id", "item-quantity");
          count.setAttribute("data-l10n-args", {"quantity": nb});
          count.innerHTML = _("item-quantity", {"quantity": nb});
        }
      break;
    }
    p2.appendChild(count);
    p2.appendChild(total);

    newTitle.className = "liTitle";
    newTitle.addEventListener("click", function(e) {
      SL[aView.nextView].init(SL[aView.name].obj[newLi.dataset.listkey]);
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
  }
};


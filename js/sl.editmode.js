'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*******************************************************************************
 * editMode
 ******************************************************************************/
SL.editMode = {
  elm: $id("editMode"),
  name: "editMode",
  openedFrom: "",
  init: function(aView) {
    this.store = aView.store;
    this.openedFrom = location.hash;
    location.hash = "#editMode";
    SL.view = this.name;
    var node = this.elm.getElementsByClassName("list")[0];
    var aGuid;
    while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
    }
    if (aView.guid != null) {
      this.guid = aView.guid;
      // Display each item
      for (aGuid in SL.Items.obj) {
        if (SL.Items.obj[aGuid].list == this.guid) {
          this.display(SL.Items.obj[aGuid]);
        }
      }
    } else {
      for (aGuid in SL.Lists.obj) {
        this.display(SL.Lists.obj[aGuid]);
      }
    }
  },
  display: function(aList) {
    var newLi = document.createElement('li');
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    newToggle.className +="danger";

    var mySpan = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');

    p1.textContent = aList.name;
    newTitle.className = "liTitle";
    newTitle.appendChild(p1);
    newTitle.addEventListener("click", function(e) {
      if(checkbox.checked) {
        checkbox.removeAttribute("checked");
      } else {
        checkbox.setAttribute("checked", "true");
      }
    });

    newLi.appendChild(newToggle);
    newLi.appendChild(newTitle);
    var from = SL.capitalise(SL.removeSharp(this.openedFrom));
    if (from !== "Items") {
      this.elm.getElementsByClassName("list")[0].appendChild(newLi);
    } else {
      var cat = aList.category;
      if (typeof cat === "undefined") {
        cat = "other";
      }
      var catElm = this.elm.getElementsByClassName(cat)[0];
      if (typeof catElm === "undefined" || catElm == null) {
        var category = document.createElement('ul');
        category.className = cat;

        /* create category header */
        var header = document.createElement("header");
        var h2 = document.createElement("h2");
        h2.setAttribute('data-l10n-id', "NIF-"+cat);
        h2.textContent = _("NIF-"+cat);
        header.appendChild(h2);

        category.appendChild(header);
        category.appendChild(newLi);
        this.elm.getElementsByClassName("list")[0].appendChild(category);
      } else {
        catElm.appendChild(newLi);
      }
    }
  },
  remove: function() {
    var from = SL.capitalise(SL.removeSharp(this.openedFrom));
    var nodes = this.elm.getElementsByClassName("list")[0].getElementsByTagName("li");

    for(var i=0; i<nodes.length; i++) {
      if(nodes[i].getElementsByTagName("input")[0].checked) {
        var guid = nodes[i].dataset.listkey;
        // If the element being removed is a list, first remove its items
        if (from == SL.Lists.name) {
          for(var aItem in SL.Items.obj) {
            if (SL.Items.obj[aItem].list == guid) {
              // Remove list items
              DB.deleteFromDB(SL.Items.obj[aItem].guid, SL.Items, false);
              delete SL.Items.obj[aItem];
            }
          }
        }

        // Remove element from DB
        DB.deleteFromDB(guid, SL[from], false);
        delete SL[from].obj[guid];

        // Remove all nodes (view + editMode)
        var elm = SL[from].elm.querySelectorAll('li[data-listkey="'+guid+'"]');
        var cat = SL[from].elm.querySelectorAll('li[data-listkey="'+guid+'"]')[0].parentNode.className;
        [].forEach.call(elm, function(v, i) {
          SL.removeElement(v);
        });

        if (from == "Items") {
          // Check if empty category
          cat = SL[from].elm.getElementsByClassName(cat);
          [].forEach.call(cat, function(v, i) {
            if (v.getElementsByTagName("li").length == 0) {
              SL.removeElement(v);
            }
          });
        }


        // Update UI (count, total…)
        SL.Lists.updateUI();
        SL.Items.updateUI();
        location.hash = this.openedFrom;
      }
    }
  },
  selectAll: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].getElementsByTagName("li");
    for(var i=0; i<nodes.length; i++) {
      nodes[i].getElementsByTagName("input")[0].setAttribute("checked", "true");
    }
  },
  deselectAll: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].getElementsByTagName("li");
    for(var i=0; i<nodes.length; i++) {
      nodes[i].getElementsByTagName("input")[0].removeAttribute("checked");
    }
  },
  count: function() {
    var n = 0;
    var nodes = this.elm.getElementsByClassName("list")[0].getElementsByTagName("li");
    for(var i=0; i<nodes.length; i++) {
      if(nodes[i].getElementsByTagName("input")[0].checked) {
        n += 1;
      }
    }
    return n;
  }
}
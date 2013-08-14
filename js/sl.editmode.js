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

    this.elm.getElementsByClassName("list")[0].appendChild(newLi);
  },
  remove: function() {
    var from = SL.capitalise(SL.removeSharp(this.openedFrom));
    var nodes = this.elm.getElementsByClassName("list")[0].getElementsByTagName("li");
    location.hash = SL.oldHash;

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

        var elm = document.querySelectorAll('li[data-listkey="'+guid+'"]');
        var cat = elm[0].parentNode;
        SL.removeElement(nodes[i]);

        // Check if empty category
        if (cat.getElementsByTagName("li").length == 0 && aView == "Items") {
          SL.removeElement(cat);
        }
        // Remove nodes
        SL.removeElement(elm[0]);

        // Update UI (count, total…)
        SL.Lists.updateUI();
        SL.Items.updateUI();
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
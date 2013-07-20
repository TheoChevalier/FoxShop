
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
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
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

        // Remove nodes
        var els = document.querySelectorAll('li[data-listkey="'+guid+'"]');
        [].forEach.call(els, function(v, i) {
          v.style.display = "none";
        });

        // Update UI (count, total…)
        SL.Lists.updateUI();
        SL.Items.updateUI();
      }
    }
  },
  selectAll: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      nodes[i].getElementsByTagName("input")[0].setAttribute("checked", "true");
    }
  },
  deselectAll: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      nodes[i].getElementsByTagName("input")[0].removeAttribute("checked");
    }
  },
  count: function() {
    var n = 0;
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      if(nodes[i].getElementsByTagName("input")[0].checked) {
        n += 1;
      }
    }
    return n;
  }
}

/*******************************************************************************
 * editMode
 ******************************************************************************/
SL.editMode = {
  elm: SL.id("editMode"),
  name: "editMode",
  openedFrom: "Lists",
  init: function(aView) {
    SL.view = this.name;
    this.openedFrom = aView.name;
    SL.show("editMode");
    this.store = aView.store;

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
  deleteSelected: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      if(nodes[i].getElementsByTagName("input")[0].checked) {
        var guid = nodes[i].dataset.listkey;
        console.log(guid);
        // Remove from DB
        DB.deleteFromDB(guid, SL[this.openedFrom]);

        // Remove nodes FIXME: broken, need to investigate
        //SL.removeElement(nodes[i]);
        //SL.removeElement(document.querySelector('li[data-listkey="'+guid+'"]'));
        nodes[i].style.display = "none";
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
  }
}
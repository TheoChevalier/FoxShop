
SL.Lists = {
  elm : document.getElementById("lists"),
  store: DB_STORE_LISTS,
  init: function() {
    document.getElementById("title").innerHTML = "Shopping List";
    SL.action("lists", "show");
    SL.action("back", "hide");
    SL.action(null, "edit", this, "click");
    //SL.action("settings", "settings", SL, "click");
    //FIXME: don’t hardcode this:
    SL.settings(SL.Lists);
    
  },
  close: function() {
    SL.action("lists", "hide");
    SL.action("edit", "hide");
    SL.action("settings", "hide");
  },
  edit: function() {
    var nodes = SL.Lists.elm.getElementsByClassName("list").childNodes;
    console.log(nodes);
    for(var i=0; i<nodes.length; i+=3) {
        alert(nodes[i]);
    }
  },
  add: function(aList) {
    DB.store(aList, SL.Lists);
    SL.Lists.display(aList, SL.Lists);
    SL.Lists.lists[aList.guid] = aList;
    console.log("add: "+aList);

  },
  edit: function (aItem, elm) {
    aList.done = elm.getElementsByTagName("input")[0].checked;
    aList.name = elm.getElementsByTagName("a")[0].innerHTML;

    // Delete the list, add the updated one
    DB.deleteFromDB(aList.guid, SL.Lists);
    DB.store(aList, SL.Lists);
  },
  display: function(aList) {
    var newLi = document.createElement('li');
    var newToggle = document.createElement('input');
    newToggle.setAttribute('type', 'checkbox');
    if (aList.done) {
      newLi.className += " done";
      newToggle.setAttribute('checked', true);
    } 
    newToggle.addEventListener("click", function(e) {
      if (!aList.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }

      aList.done = newLi.getElementsByTagName("input")[0].checked;

      // Delete the item, add the updated one
      DB.deleteFromDB(aList.guid, SL.Lists);
      DB.store(aList, SL.Lists);
    });

    var newTitle = document.createElement('a');
    newTitle.innerHTML = aList.name;
    newTitle.addEventListener("click", function(e) {
      SL.Items.init(aList);
    });

    var newDelete = document.createElement('a');
    newDelete.innerHTML = "[x]";
    newDelete.addEventListener("click", function(e) {
      DB.deleteFromDB(aList.guid, SL.Lists);
    });

    
    newLi.dataset.listkey = aList.guid;

    newLi.appendChild(newToggle);
    newLi.appendChild(newTitle);
    newLi.appendChild(newDelete);

    SL.Lists.elm.getElementsByClassName("list")[0].appendChild(newLi);
    console.log("added!");
  },
  clear: function() {
    var list = document.getElementById("list");
    var main = document.getElementById("main");
    main.removeChild(list);
    var ul = document.createElement('ul');
    ul.setAttribute('id', 'list');
    main.appendChild(ul);
  }
};
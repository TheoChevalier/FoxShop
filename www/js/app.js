//'use strict';
        // DB init
  const DB_NAME = 'ShoppingList';
  const DB_VERSION = 2; // Use a long long for this value (don't use a float)
  const DB_STORE_LISTS = 'lists2';
  const DB_STORE_ITEMS = 'items1';

SL = {
  action: function(target, func, view, listener) {
    var elm = document.getElementById(target);
    if(typeof elm != "undefined" && elm != null) {

      if(typeof listener != "undefined" &&
       typeof view != "undefined" && typeof func != "undefined") {
        elm.style.display = "block";
        elm.addEventListener(listener, function(e) {
          view[func]();
        });  
      } else {
        if(typeof target != "undefined") {

          if(typeof view != "undefined" && typeof func != "undefined") {
            view[func](target);
          } else {
            if(typeof func != "undefined") {
              SL[func](target)
            }
          }
        } else {
          if(typeof view != "undefined" && typeof func != "undefined") {
            view[func]();
          } else {
            if(typeof func != "undefined") {
              SL[func]()
            }
          }
        }
      }
    }
  },
  hide: function(target) {
    document.getElementById(target).style.display = "none";
  },
  show: function(target) {
    document.getElementById(target).style.display = "block";
  },
  settings: function(aView) {
    this.show("settings");

    var button = document.getElementById("settings");
    button.addEventListener("click", function(e) {
      aView.close();
      SL.Settings.init(aView);
    });
  }
};

SL.Settings = {
  init: function(aView) {
    document.getElementById("title").innerHTML = "Settings";
    SL.action("settingsPanel", "show");
    SL.action("back", "show");
    document.getElementById("back").addEventListener("click", function(e) {
      SL.Settings.close();
      aView.init();
    });
    document.getElementById("archiveAll").addEventListener("click", function() {
      SL.Settings.archiveAll();
    });
  },
  close: function() {
    SL.action("settingsPanel", "hide");
    SL.action("back", "hide");
  },
  archiveAll: function () {
    
  }
};

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
    for(var i=0; i<nodes.length; i+=3) {
        //FIXME:Add css classes to be in edit mode, change some layout parts
        alert(nodes[i]);
    }
  },
  add: function(aList) {
    DB.store(aList, SL.Lists);
    SL.Lists.display(aList, SL.Lists);
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
    var newToggle = document.createElement('div');
    var label = document.createElement('label');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('id', aList.guid);
    label.setAttribute('for', aList.guid);
    newToggle.className += " checkboxSquared";
    if (aList.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
    } 

    label.addEventListener("click", function(e) {
      if (!aList.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }
      console.log(newLi.getElementsByTagName("input")[0].checked);
      aList.done = !aList.done;

      // Delete the item, add the updated one
      DB.deleteFromDB(aList.guid, SL.Lists);
      DB.store(aList, SL.Lists);
    });
    newToggle.appendChild(checkbox);
    newToggle.appendChild(label);

    var newTitle = document.createElement('a');
    newTitle.innerHTML = aList.name;
    newTitle.addEventListener("click", function(e) {
      SL.Items.init(aList);
    });

    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    newDelete.addEventListener("click", function(e) {
      newLi.style.display = "none";
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

SL.Items = {
  elm: document.getElementById("items"),
  store: DB_STORE_ITEMS,
  init: function(aList) {
    // Set title of the displayed Items list
    document.getElementById("title").innerHTML=aList.name;

    SL.Lists.elm.style.display = "none";
    var items = document.getElementById('items');
    items.style.display = "block";
    this.list = aList;

    // Display buttons
    SL.action("back", "back", this, "click");
    SL.action("add-item", "add", this, "click");
    document.getElementById('add-item').style.display = "inline-block";
    DB.displayItems(aList);
  },

  // Go back to Lists view
  back: function() {
    // Hide Items list
    SL.action("items", "hide");
    // Display Lists list
    SL.Lists.init();
  },

  // Add an item to the current list
  add: function() {
    var name = document.getElementById('itemName').value;
    var qty = document.getElementById('itemQty').value;
    var date = new Date();

    // Handle empty form
    if (!name || !qty) {
      var msg = "";
      if (!name) {
        msg += "You must enter a name";
        if (!qty)
          msg += "and a quantity"
      }
      if (!qty)
        msg += "You must enter a quantity"

      displayActionFailure(msg);
      return;
    }

    aItem = { guid: guid(),
                   name: name,
                   list: SL.Items.list.guid,
                   nb: qty,
                   date: date.getTime(),
                   done: false
    };
    name = "";
    qty = "1";

    DB.store(aItem, SL.Items);
    SL.Items.display(aItem);
  },

  display: function(aItem) {
    var newLi = document.createElement('li');
    var newToggle = document.createElement('input');
    newToggle.setAttribute('type', 'checkbox');
    if (aItem.done) {
      newLi.className += " done";
      newToggle.setAttribute('checked', true);
    } 
    newToggle.addEventListener("click", function(e) {
      if (!aItem.done) {
        newLi.className += " done";
      } else {
        newLi.className = newLi.className.replace ( /(?:^|\s)done(?!\S)/g , '' );
      }

      aItem.done = newLi.getElementsByTagName("input")[0].checked;

      // Delete the item, add the updated one
      DB.deleteFromDB(aItem.guid, SL.Items);
      DB.store(aItem, SL.Items);
    });

    var newTitle = document.createElement('a');
    newTitle.className = 'listElmTitle';
    newTitle.innerHTML = aItem.name;
    if (aItem.nb > 1) {
      var container = document.createElement('a');
      container.innerHTML = " x";
      var input = document.createElement('input');
      input.setAttribute('type', 'number');
      input.value = aItem.nb;
      container.appendChild(input);
      //container.insertAdjacentHTML('beforeend',
      //  '<input type="number" value="'+aItem.nb+'"/>');
      newTitle.appendChild(container);
    }

    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    newDelete.addEventListener("click", function(e) {
      newLi.style.display = "none";
      DB.deleteFromDB(aItem.guid, SL.Items);
    });

    
    newLi.dataset.listkey = aItem.guid;

    newLi.appendChild(newToggle);
    newLi.appendChild(newTitle);
    newLi.appendChild(newDelete);

    SL.Items.elm.getElementsByClassName("list")[0].appendChild(newLi);
    console.log("added!");
  },
  clear: function() {
    SL.Items.elm.removeChild(SL.Items.elm.getElementsByClassName("list")[0]);
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'list');
    SL.Items.elm.appendChild(ul);
  }
};

  // Messages handlers
  function displayActionSuccess(msg) {
    msg = typeof msg != 'undefined' ? "Success: " + msg : "Success";
    document.getElementById('msg').innerHTML = '<span class="action-success">' + msg + '</span>';
  }
  function displayActionFailure(msg) {
    msg = typeof msg != 'undefined' ? "Failure: " + msg : "Failure";
    document.getElementById('msg').innerHTML = '<span class="action-failure">' + msg + '</span>';
  }
  function resetActionStatus() {
    document.getElementById('msg').innerHTML = '';
  }

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Add the eventListeners to buttons, etc.
function addEventListeners() {

  console.log("addEventListeners");
  var add = document.getElementById('add-list');
  add.style.display = "block";
  add.addEventListener("click", function(evt) {
    var name = document.getElementById('listName').value;
    var date = new Date();

    if (!name || name === undefined) {
      displayActionFailure("You must enter a name");
      return;
    }
    SL.Lists.add({ guid: guid(),
                   name: name,
                   date: date.getTime(),
                   items:{}
    });
  });

  document.getElementById('edit').addEventListener("click", function(evt) {
     console.log("edit");
  });
}
 
// Actions that needs the DB to be ready
function finishInit() {
  // Populate the list
  SL.Lists.init();
  DB.displayList(null, SL.Lists);
    var height = document.body.clientHeight;
  console.log(height);
  document.getElementById("content").style.height = height;
}
var db;
window.addEventListener("load", function() {
  
  DB.openDb();
  addEventListeners();
});

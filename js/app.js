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
      //aView.close();
      SL.Settings.init(aView);
    });
  },
  removeElement: function(node) {
    node.parentNode.removeChild(node);
  }
};

SL.Settings = {
  elm: document.getElementById("settingsPanel"),
  init: function(aView) {
    SL.action("settingsPanel", "show");
    this.elm.getElementsByTagName("button")[3].addEventListener("click", function(e) {
      SL.hide("settingsPanel");
      alert("coucou");
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
  arrayList : {},
  store: DB_STORE_LISTS,
  init: function() {
    SL.view = "Lists";
    document.getElementById("title").innerHTML = "Shopping List";
    SL.action("lists", "show");

    /*var request = navigator.mozApps.getSelf();
    request.onsuccess = function() {
      if (!request.result) {
        SL.action("install", "show");
        SL.action(null, "install", this, "click");
      }
    };*/

    SL.action("form-list", "show");
    SL.action("completeall", "show");
    //SL.action(null, "completeall", this, "click");  -> marche pas!
    document.getElementById("completeall").addEventListener("click", function() {
      SL.Lists.completeall();
    });
    
    // Init event for edit view
    this.elm.getElementsByClassName('edit')[0].addEventListener("click", function(evt) {
      SL.editLists.init();
    });
    //SL.action("settings", "settings", SL, "click");
    //FIXME: don’t hardcode this:
    SL.settings(SL.Lists);
    var install = document.getElementById('install');
    install.addEventListener('click', function(e){
      navigator.mozApps.install("http://theochevalier.fr/app/manifest.webapp");
    });


  },
  close: function() {
    SL.view = "";
    SL.hide("lists");
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
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    //newToggle.className +="danger";
    //newToggle.setAttribute('for', aList.guid);
    var mySpan = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    //checkbox.setAttribute('id', aList.guid);
    if (aList.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
    } 

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    mySpan.addEventListener("click", function(e) {
      console.log("span ok");

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


    // Part 2 pack-end
    var packEnd  = document.createElement('aside');
    packEnd.className = "pack-end";

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');

    p1.innerHTML = aList.name;
    p2.innerHTML = "x  items";
    newTitle.className = "liTitle";
    newTitle.addEventListener("click", function(e) {
      SL.Items.init(aList);
    });
    newTitle.appendChild(p1);
    newTitle.appendChild(p2);


/*
    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    newDelete.addEventListener("click", function(e) {
      newLi.style.display = "none";
      DB.deleteFromDB(aList.guid, SL.Lists);
    });
    */
    
    newLi.appendChild(newToggle);
    newLi.appendChild(packEnd);
    newLi.appendChild(newTitle);
    //newLi.appendChild(newDelete);

    SL.Lists.elm.getElementsByClassName("list")[0].appendChild(newLi);
    this.arrayList[aList.guid] = aList;
  },
  clear: function() {
    var lists = document.getElementById("lists");
    var list = document.getElementsByClassName("list")[0];
    lists.removeChild(list);
    var ul = document.createElement('ul');
    ul.className =  'list';
    lists.appendChild(ul);
  },
  completeall: function() {
    
    var nodes = SL.Lists.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=1; i<nodes.length; i++) {
        console.log(nodes[i].getElementsByTagName('label')[0].checked);
        nodes[i].getElementsByTagName('input')[0].setAttribute("checked", true);
        nodes[i].className.replace ( /(?:^|\s)done(?!\S)/g , '' );
        nodes[i].className += " done";
    }
  }
};

SL.editLists = {
  elm: document.getElementById("editLists"),
  store: DB_STORE_LISTS,
  init: function() {
    SL.Lists.close();
    SL.view = "editLists";

    SL.show("editLists");

    var node = this.elm.getElementsByClassName("list")[0];
    while (node.hasChildNodes()) {
        node.removeChild(node.lastChild);
        console.log("mon node:"+node);
    }

    DB.displayList(null, SL.editLists);

    //Add events to buttons
    var header = this.elm.getElementsByTagName("header")[0];
    console.log(header);

    // Close
    header.getElementsByTagName("button")[0].addEventListener("click", function() {
      SL.hide("editLists");
      SL.show("lists");
    });

    // Delete Selected
    header.getElementsByTagName("button")[1].addEventListener("click", function() {
      SL.editLists.deleteSelected();
    });

    var menu = this.elm.getElementsByTagName("menu")[1];

    // Select All
    menu.getElementsByTagName("button")[0].addEventListener("click", function() {
      SL.editLists.selectAll();
    });
    // Deselect All
    menu.getElementsByTagName("button")[1].addEventListener("click", function() {
      SL.editLists.deselectAll();
    });
  },
  display: function(aList) {
    var newLi = document.createElement('li');
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    newToggle.className +="danger";
    //newToggle.setAttribute('for', aList.guid);
    var mySpan = document.createElement('span');
    mySpan.addEventListener("click", function(e) {
      newLi.dataset.select = "true";
    });
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    //checkbox.setAttribute('id', aList.guid);

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');

    p1.innerHTML = aList.name;
    newTitle.className = "liTitle";
    newTitle.appendChild(p1);

    newLi.appendChild(newToggle);
    newLi.appendChild(newTitle);

    this.elm.getElementsByClassName("list")[0].appendChild(newLi);
  },
  deleteSelected: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
      if(nodes[i].getElementsByTagName("input")[0].checked) {
        DB.deleteFromDB(nodes[i].dataset.listkey, SL.editLists);
        nodes[i].style.display = "none";
      }
    }
  },
  selectAll: function() {
    var nodes = this.elm.getElementsByClassName("list")[0].childNodes;
    console.log(nodes);
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

SL.Items = {
  elm: document.getElementById("items"),
  store: DB_STORE_ITEMS,
  init: function(aList) {
    SL.Lists.close();
    this.elm.style.display = "block";
    SL.Lists.elm.style.display = "none";
    console.log(this.elm.style.display + SL.Lists.elm.style.display);
    this.list = aList;
    // Set title of the displayed Items list
    this.elm.getElementsByClassName("title")[0].innerHTML=aList.name;

    // Display buttons
    this.elm.getElementsByClassName("back")[0].addEventListener("click", SL.Items.back());
    SL.action("add-item", "add", this, "click");
    document.getElementById('add-item').style.display = "inline-block";
    SL.Items.clear();
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
        //l10n += "You must enter a name";
        l10n += "msg-name";
        if (!qty)
          l10n += "msg-name-qty"
      }
      if (!qty)
        l10n += "msg-qty"

      displayActionFailure(l10n);
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
    var newToggle = document.createElement('label');
    newToggle.className = "labelItem";
    var span = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    if (aItem.done) {
      newLi.className += " done";
      checkbox.setAttribute('checked', true);
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

    newToggle.appendChild(checkbox);
    newToggle.appendChild(span);


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
  },
  clear: function() {
    SL.Items.elm.removeChild(SL.Items.elm.getElementsByClassName("list")[0]);
    var ul = document.createElement('ul');
    ul.setAttribute('class', 'list');
    SL.Items.elm.appendChild(ul);
  }
}

  // Messages handlers
  function displayActionSuccess(id) {
    document.getElementById('msg').innerHTML = '<span class="action-success" data-l10n-id="' + id + '"></span>';
  }
  function displayActionFailure(id) {
    document.getElementById('msg').innerHTML = '<span class="action-failure" data-l10n-id="' + id + '"></span>';
  }
  function resetActionStatus() {
    document.getElementById('msg').innerHTML = '';
  }

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// Add the eventListeners to buttons, etc.
function addEventListeners() {

  console.log("addEventListeners");
  var add = document.getElementById('add-list');
  add.style.display = "block";
  add.addEventListener("click", function(evt) {
    var name = document.getElementById('listName').value;
    var date = new Date();

    if (!name || name === undefined) {
      displayActionFailure("msg-name");
      return;
    }
    SL.Lists.add({ guid: guid(),
                   name: name,
                   date: date.getTime(),
                   items:{}
    });
    document.getElementById('listName').value ="";
  });

}


    function update() {
        var btn = document.getElementById('install');
        if(install.state == 'uninstalled') {
            btn.style.display = 'block';
        }
        else if(install.state == 'installed' || install.state == 'unsupported') {
            btn.style.display = 'none';
        }
    }

    function init() {
        var btn = document.getElementById('install');
        btn.addEventListener('click', function() {
            install();
        });

        install.on('change', update);

        install.on('error', function(e, err) {
            // Feel free to customize this
            alert('There was an error during installation.');
        });

        install.on('showiOSInstall', function() {
            // Feel free to customize this
            alert('To install, press the forward arrow in Safari ' +
                  'and touch "Add to Home Screen"');
        });
    }


       

 
// Actions that needs the DB to be ready
function finishInit() {
  // Populate the list
  SL.Lists.init();
  DB.displayList(null, SL.Lists);
  var height = document.body.clientHeight;
  document.getElementById("content").style.height = height;
  document.getElementById("header").style.display = "block";
  //init();
}
var db;
window.addEventListener("load", function() {
  DB.openDb();
  addEventListeners();
});
window.addEventListener("localized", function() {
  SL.hide("loader");
});

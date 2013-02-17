  //'use strict';
        // DB init
  const DB_NAME = 'ShoppingList';
  const DB_VERSION = 3; // Use a long long for this value (don't use a float)
  const DB_STORE_LISTS = 'lists2';
  const DB_STORE_ITEMS = 'items1';
  const DB_STORE_SETTINGS = 'settings1';

SL = {
  hide: function(target) {
    target = SL.id(target).style;
    target.zIndex = "1";
    target.opacity = "0";
  },
  show: function(target) {
    target = SL.id(target).style;
    target.zIndex = "6";
    target.opacity = "1";
  },
  removeElement: function(node) {
    node.parentNode.removeChild(node);
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
    if (typeof n === "undefined")
      n = 0;

    return document.getElementByClassName(target)[n];
  },
  display: function(aList, aView) {
    console.log(aView.nextView);
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
      DB.deleteFromDB(aList.guid, aView);
      DB.store(aList, aView);
    });


    // Part 2 pack-end
    var packEnd  = document.createElement('aside');
    packEnd.className = "pack-end";

    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    var nb = 0;
    p1.innerHTML = aList.name;
    DB.getItems(aList.guid);
    p2.innerHTML = nb + " items";
    newTitle.className = "liTitle";
    newTitle.addEventListener("click", function(e) {
      SL[aView.nextView].init(aList);
    });
    newTitle.appendChild(p1);
    newTitle.appendChild(p2);

    newLi.appendChild(newToggle);
    newLi.appendChild(packEnd);
    newLi.appendChild(newTitle);

    aView.elm.getElementsByClassName("list")[0].appendChild(newLi);
  }
};


/*******************************************************************************
 * Settings
 ******************************************************************************/
SL.Settings = {
  elm: SL.id("settingsPanel"),
  name: "Settings",
  store: DB_STORE_SETTINGS,
  loaded: false,
  obj: {},

  // Function called after populating this.names in DB.getSetting()
  updateUI: function() {
    this.loaded = true;
    if (typeof this.obj["prices-enable"] != "undefined") {
      if (this.obj["prices-enable"].value) {
        SL.id("prices-enable").setAttribute("checked", "");
        SL.id("currency").removeAttribute("disabled");
        SL.id("taxes").removeAttribute("disabled");
      }
    }

    if (typeof this.obj["userCurrency"] != "undefined") {
      if (this.obj["userCurrency"].value) {
        SL.id("userCurrency").value = this.obj["userCurrency"].value;
      }
    }
  },
  close: function() {
    SL.hide("settingsPanel");
  }
};


/*******************************************************************************
 * Lists
 ******************************************************************************/
SL.Lists = {
  elm : SL.id("lists"),
  name: "Lists",
    nextView: "Items",
  arrayList : {},
  store: DB_STORE_LISTS,
  init: function() {
    SL.view = this.name;
    SL.show("lists");
  },
  close: function() {
    SL.view = "";
    SL.hide("lists");
  },
  add: function(aList) {
    DB.store(aList, SL.Lists);
    SL.Lists.display(aList, SL.Lists);
  },
  new: function() {
    var name = SL.id('listName').value;
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
    SL.id('listName').value ="";
  },
  edit: function (aList, elm) {
    aList.done = elm.getElementsByTagName("input")[0].checked;
    aList.name = elm.getElementsByTagName("a")[0].innerHTML;

    // Delete the list, add the updated one
    DB.deleteFromDB(aList.guid, SL.Lists);
    DB.store(aList, SL.Lists);
  },
  display: function(aList) {
    SL.display(aList, this);
  },
  completeall: function() {
    var nodes = SL.Lists.elm.getElementsByClassName("list")[0].childNodes;
    for(var i=0; i<nodes.length; i++) {
        nodes[i].getElementsByTagName('input')[0].setAttribute("checked", true);
        nodes[i].className.replace ( /(?:^|\s)done(?!\S)/g , '' );
        nodes[i].className += " done";
    }
  }
};

/*******************************************************************************
 * editMode
 ******************************************************************************/
SL.editMode = {
  elm: SL.id("editMode"),
  name: "editMode",
  init: function(aView) {
    SL.view = this.name;
    SL.show("editMode");
    this.store = aView.store;

    var node = this.elm.getElementsByClassName("list")[0];
    while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
    }
    if (aView.guid != null) {
      this.guid = aView.guid;
      DB.displayItems(this);
    } else {
      DB.displayList(null, this);
    }
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
        var guid = nodes[i].dataset.listkey;

        // Remove from DB
        DB.deleteFromDB(guid, SL.editMode);

        // Hide nodes
        var li = this.elm.querySelector('li[data-listkey="'+guid+'"]');
        li.style.display = "none";
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

/*******************************************************************************
 * Items
 ******************************************************************************/
SL.Items = {
  elm: SL.id("items"),
  name: "Items",
  nextView: "ItemView",
  store: DB_STORE_ITEMS,
  init: function(aList) {
    SL.Lists.close();
    SL.view = this.name;

    this.list = aList;
    this.guid = aList.guid;
    // Set title of the displayed Items list
    this.elm.getElementsByClassName("title")[0].innerHTML=aList.name;

    SL.clear(this);
    DB.displayItems(this);
    SL.hide("lists");
    SL.show("items");
  },

  // Go back to Lists view
  back: function() {
    // Hide Items list
    SL.hide("items");
    // Display Lists list
    SL.Lists.init();
  },

  // Add an item to the current list
  new: function() {
    var name = SL.id('itemName').value;
    var qty = SL.id('itemQty').value;
    var date = new Date();

    // Handle empty form
    if (!name || !qty) {
      var l10n = "";
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

  // Use SL.display function to populate the list
  display: function(aList) {
    SL.display(aList, this);
  }
}


/*******************************************************************************
 * ItemView
 ******************************************************************************/
SL.ItemView = {
  elm: SL.id("itemView"),
  name: "ItemView",
  init: function(aGuid) {
    SL.hide("items");
    SL.show("itemView");
    SL.view = this.name;
    this.guid = aGuid;
  },
}
/*******************************************************************************
 * enterEmail
 ******************************************************************************/
SL.enterEmail = {
  elm: SL.id("enterEmail"),
}

  // Messages handlers
  function displayActionSuccess(id) {
    SL.id('msg').innerHTML = '<span class="action-success" data-l10n-id="' + id + '"></span>';
  }
  function displayActionFailure(id) {
    SL.id('msg').innerHTML = '<span class="action-failure" data-l10n-id="' + id + '"></span>';
  }
  function resetActionStatus() {
    SL.id('msg').innerHTML = '';
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

  /*****************************************************************************
   * Shared
   ****************************************************************************/
    // Add event listener on every Settings button
  var els = document.getElementsByClassName("icon-settings");
  var elsArray = Array.prototype.slice.call(els, 0);
  elsArray.forEach(function(el) {
    el.addEventListener("click", function() {
      SL.show("settingsPanel");
    });
  });

  /*****************************************************************************
   * Lists
   ****************************************************************************/
  // Add list when the user click the button…
  SL.id("add-list").addEventListener("click", function() {
    SL.Lists.new();
  });
  // …or if he hit enter key
  SL.id("listName").onkeyup = function (e) {
    if (e.keyCode == 13) {
      SL.Lists.new();
    }
  }

  SL.id("completeall").addEventListener("click",  function() {
    SL.Lists.completeall()
  });
  
  // Init event for edit view
  SL.Lists.elm.getElementsByClassName('edit')[0].addEventListener("click",
  function() {
    SL.editMode.init(SL.Lists);
  });

  var install = SL.id('install');
  install.addEventListener('click', function(e){
    navigator.mozApps.install("http://theochevalier.fr/app/manifest.webapp");
  });

  /*****************************************************************************
   * editMode
   ****************************************************************************/
  var header = SL.editMode.elm.getElementsByTagName("header")[0];

  // Close
  header.getElementsByTagName("button")[0].addEventListener("click", function() {
    SL.hide("editMode");
    SL.show("lists");
  });

  // Delete Selected
  header.getElementsByTagName("button")[1].addEventListener("click", function() {
    SL.editMode.deleteSelected();
  });

  var menu = SL.editMode.elm.getElementsByTagName("menu")[1];

  // Select All
  menu.getElementsByTagName("button")[0].addEventListener("click", function() {
    SL.editMode.selectAll();
  });
  // Deselect All
  menu.getElementsByTagName("button")[1].addEventListener("click", function() {
    SL.editMode.deselectAll();
  });

  /*****************************************************************************
   * Items
   ****************************************************************************/
  // Add item when the user click the button…
  SL.id("add-item").addEventListener("click", SL.Items.new());
  // …or if he hit enter key
  SL.id("itemName").onkeyup = function (e) {
    if (e.keyCode == 13) {
      SL.Items.new();
    }
  }

  function addItem() {
    var name = SL.id('listName').value;
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
    SL.id('listName').value ="";
  }

  // Display buttons
  SL.Items.elm.getElementsByClassName("back")[0].addEventListener("click",
  function() {
    SL.hide("items");
    SL.show("lists");
  });

  var send = SL.Items.elm.getElementsByClassName("send")[0];
  send.addEventListener("click", function() {
    SL.show("enterEmail");
  });

    // Init event for edit view
  SL.Items.elm.getElementsByClassName('edit')[0].addEventListener("click",
  function() {
    SL.hide("items");
    SL.editMode.init(SL.Items);
  });

  /*****************************************************************************
   * itemView
   ****************************************************************************/
  SL.ItemView.elm.getElementsByClassName("icon-back")[0].parentNode.addEventListener("click",
    function() {
      SL.hide("itemView");
      SL.show("items");
    });

  /*****************************************************************************
   * send e-mail views
   ****************************************************************************/
  // Add event listeners to buttons

  //Cancel
  SL.enterEmail.elm.getElementsByClassName("cancel")[0].addEventListener("click",
    function() {
      SL.hide("enterEmail");
    });

  // Send
  SL.enterEmail.elm.getElementsByClassName("send")[0].addEventListener("click",
    function() {
      sendAddress();
    });
  // …or if he hit enter key
  SL.id("email").onkeyup = function (e) {
    if (e.keyCode == 13) {
      sendAddress();
    }
  }

  function sendAddress() {
    if (SL.id("email").value != "") {
      SL.hide("enterEmail");
      SL.show("sendEmail");
      createXHR();
      var url = "http://app.theochevalier.fr/php/email.php";
      request.open('POST', url, true);
      request.onreadystatechange = function() {
        if (request.readyState == 4) {
          console.log(request.responseText);
          SL.hide("sendEmail");
        }
      };
      request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      var email = SL.id("email").value;
      var data = "email=" + email + "&data=" + encodeURIComponent(SL.Items.list);
      request.send(data);
    }
  }

  function createXHR() {
    try {
      request = new XMLHttpRequest();
    } catch (microsoft) {
      try {
        request = new ActiveXObject('Msxml2.XMLHTTP');
      } catch(autremicrosoft) {
        try {
          request = new ActiveXObject('Microsoft.XMLHTTP');
        } catch(echec) {
          request = null;
        }
      }
    }
    if(request == null) {
    console.error("Can't create XHR");
    }
  }

  /*****************************************************************************
   * Settings
   ****************************************************************************/
  SL.Settings.elm.getElementsByClassName("icon-back")[0].parentNode.addEventListener("click",
    function() {
      SL.hide("settingsPanel");
    });

  /*
   * Currency settings
   */
  // Show position & currency panels
  SL.id("currency").addEventListener("click",
    function() {
      SL.show("editCurrency");
    });

  // Hide currency panel
  SL.id("cEditCurrency").addEventListener("click",
    function() {
      SL.hide("editCurrency");
    });
  SL.id("setEditCurrency").addEventListener("click",
    function() {
      SL.hide("editCurrency");
      var save = {guid:"userCurrency",value:SL.id("userCurrency").value};
      DB.deleteFromDB("userCurrency", SL.Settings);
      DB.store(save, SL.Settings);
      DB.getSetting();
    });

  // Switches
  SL.id("prices-enable").addEventListener("click",
    function() {
      if(this.checked) {
        SL.id("currency").removeAttribute("disabled");
        SL.id("taxes").removeAttribute("disabled");
      } else {
        SL.id("currency").setAttribute("disabled", "");
        SL.id("taxes").setAttribute("disabled", "");
      }

      if(SL.Settings.obj["prices-enable"].value != this.checked) {
        var save = {guid:"prices-enable",value:this.checked};
        DB.deleteFromDB("prices-enable", SL.Settings);
        DB.store(save, SL.Settings);
        DB.getSetting();
      }
      
    });

  /*
   * About panel
   */
  SL.id("about").addEventListener("click",
    function() {
      SL.show("aboutPanel");
    });
  SL.id("aboutBack").addEventListener("click",
    function() {
      SL.hide("aboutPanel");
    });
  SL.id("aboutClose").addEventListener("click",
    function() {
      SL.hide("aboutPanel");
    });
}


    function update() {
        var btn = SL.id('install');
        if(install.state == 'uninstalled') {
            btn.style.display = 'block';
        }
        else if(install.state == 'installed' || install.state == 'unsupported') {
            btn.style.display = 'none';
        }
    }

    function init() {
        var btn = SL.id('install');
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

  // Dynamically calculate height of content
  var height = document.body.clientHeight;
  SL.id("content").style.height = height+"px";
  var els = document.getElementsByClassName("scroll");
  var elsArray = Array.prototype.slice.call(els, 0);
  elsArray.forEach(function(el) {
    el.style.maxHeight = height-120+"px";
  });
  //init();

  // Put user’s values in settings
  DB.getSetting();
}

var db;
window.addEventListener("load", function() {
  DB.openDb();
  addEventListeners();
});
window.addEventListener("localized", function() {
  SL.hide("loader");
});

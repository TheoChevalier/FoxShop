//'use strict';
        // DB init
  const DB_NAME = 'ShoppingList';
  const DB_VERSION = 2; // Use a long long for this value (don't use a float)
  const DB_STORE_LISTS = 'lists2';
  const DB_STORE_ITEMS = 'items1';

var SL = {
  createLists: function() {
    var slLists = Object.create(SL.Lists);
    return slLists;
  },
  createItem: function() {
    var slItem = Object.create(SL.Item);
    return slItem;
  },
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
  }
};

SL.Lists = {
  lists: {},
  elm : document.getElementById("lists"),
  store: DB_STORE_LISTS,
  init: function() {
    document.getElementById("title").innerHTML = "Shopping List";
    SL.action("lists", "show");
    SL.action("back", "hide");
    SL.action(null, "edit", this, "click");
    //SL.action("settings", "open", SL.Settings, "click");
    console.log("init Lists view");
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

    SL.Lists.elm.getElementsByTagName("li")[0].appendChild(newLi);
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
      //var nb = document.createElement('input');
      //nb.setAttribute('type', 'number');
      //nb.value = aItem.nb;
      newTitle.insertAdjacentHTML('beforeend',
        '<a class="number">x <input type="number" value="'+aItem.nb+'"/></a>');
    }

    var newDelete = document.createElement('a');
    newDelete.className = 'delete';
    //newDelete.innerHTML = "[x]";
    newDelete.addEventListener("click", function(e) {
      DB.deleteFromDB(aItem.guid, SL.Items);
      newLi.style.display = "none";
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

  var DB = {

  openDb: function() {
    console.log("openDb ...");
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
      // Better use "this" than "req" to get the result to avoid problems with
      // garbage collection.
      // db = req.result;
      db = this.result;
      console.log("openDb DONE");
      finishInit();
    };
    req.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };

    req.onupgradeneeded = function (evt) {
      console.log("openDb.onupgradeneeded");
      var store = evt.currentTarget.result.createObjectStore(
        DB_STORE_LISTS, { keyPath: 'id', autoIncrement: true });

      store.createIndex('guid', 'guid', { unique: true });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('date', 'date', { unique: false });
      store.createIndex('done', 'done', { unique: false });
      store.createIndex('position', 'position', { unique: false });

      // Store items
      var storeItems = evt.currentTarget.result.createObjectStore(
        DB_STORE_ITEMS, { keyPath: 'id', autoIncrement: true });

      storeItems.createIndex('guid', 'guid', { unique: true });
      storeItems.createIndex('list', 'list', { unique: false });
      storeItems.createIndex('name', 'name', { unique: false });
      storeItems.createIndex('date', 'date', { unique: false });
      storeItems.createIndex('done', 'done', { unique: false });
      storeItems.createIndex('position', 'position', { unique: false });
      storeItems.createIndex('nb', 'nb', { unique: false });
    };
  },

  /**
   * @param {string} name
   * @param {string} date
   * Insert a new object in the view's DB
   */
  store: function(aList, view) {

    var store = this.getObjectStore(view.store, 'readwrite');
    var req;
    try {
      req = store.add(aList);
    } catch (e) {
      throw e;
    }
    req.onsuccess = function (evt) {
      displayActionSuccess("Inserted");
    };
    req.onerror = function() {
      displayActionFailure(this.error);
    };
  },

  /**
   * @param {IDBObjectStore=} store
   */
   displayList: function(store, view) {
    if (store == null || typeof store == 'undefined' ){
      store = DB.getObjectStore(view.store, 'readonly');
    }
      
    var req = store.count();
    // Requests are executed in the order in which they were made against the
    // transaction, and their results are returned in the same order.
    // Thus the count text below will be displayed before the actual list
    // (not that it is algorithmically important in this case).
    req.onsuccess = function(evt) {

    };
    req.onerror = function(evt) {
      console.error("add error", this.error);
      displayActionFailure(this.error);
    };

    var i = 0;
    req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = evt.target.result;
      // If the cursor is pointing at something, ask for the data
      if (cursor) {
        console.log("displayPubList cursor:", cursor);
        req = store.get(cursor.key);
        console.log("key: "+cursor.key);
        req.onsuccess = function (evt) {
          var aList = evt.target.result;
          console.log("liste:"+aList);
          view.display(aList);
        };

        // Move on to the next object in store
        cursor.continue();

      } else {
        console.log("No more entries");
      }
    };
  },


  /**
   * @param {string} biblioid
   */
  deleteFromDB: function(guid, view) {
    var store = DB.getObjectStore(view.store, 'readwrite');
    var req = store.index('guid');
    req.get(guid).onsuccess = function(evt) {
      if (typeof evt.target.result == 'undefined') {
        displayActionFailure("No matching record found");
        return;
      }
      DB.deleteList(evt.target.result.id, store, view);
    };
    req.onerror = function (evt) {
      console.error("deletePublicationFromBib:", evt.target.errorCode);
    };
  },

  /**
   * @param {number} key
   * @param {IDBObjectStore=} store
   */
  deleteList: function(key, store, view) {

    if (typeof store == 'undefined')
      store = DB.getObjectStore(view.store, 'readwrite');

    // As per spec http://www.w3.org/TR/IndexedDB/#object-store-deletion-operation
    // the result of the Object Store Deletion Operation algorithm is
    // undefined, so it's not possible to know if some records were actually
    // deleted by looking at the request result.
    var req = store.get(key);
    req.onsuccess = function(evt) {
      var record = evt.target.result;
      console.log("record:", record);
      if (typeof record == 'undefined') {
        displayActionFailure("No matching record found");
        return;
      }
      // Warning: The exact same key used for creation needs to be passed for
      // the deletion. If the key was a Number for creation, then it needs to
      // be a Number for deletion.
      req = store.delete(key);
      req.onsuccess = function(evt) {
        displayActionSuccess("Item succesfully deleted");
      };
      req.onerror = function (evt) {
        console.error("deletePublication:", evt.target.errorCode);
      };
    };
    req.onerror = function (evt) {
      console.error("deletePublication:", evt.target.errorCode);
      };
  },

  displayItems: function(aList) {
    var store = DB.getObjectStore(DB_STORE_ITEMS, 'readonly');
    var req = store.index('list');
    req.get(aList.guid).onsuccess = function(evt) {
      if (typeof evt.target.result == 'undefined') {
        displayActionFailure("No matching record found");
        return;
      }
      var key = evt.target.result.id;  
      var req = store.get(key);

      req.onsuccess = function(evt) {
        var record = evt.target.result;
        console.log("record:", record);
        if (typeof record == 'undefined') {
          displayActionFailure("No matching record found");
          return;
        }
          SL.Items.clear();
          DB.displayList(store, SL.Items);
        };
      req.onerror = function (evt) {
        console.error("deletePublication:", evt.target.errorCode);
      };

    };
    req.onerror = function (evt) {
      console.error("deletePublicationFromBib:", evt.target.errorCode);
    };
  },

  /**
   * @param {string} store_name
   * @param {string} mode either "readonly" or "readwrite"
   */
  getObjectStore: function(storename, mode) {
    var tx = db.transaction(storename, mode);
    return tx.objectStore(storename);
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
      console.log("add..."+name);
      name = "";
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
  }
var db;
window.addEventListener("load", function() {
  
  DB.openDb();
  addEventListeners();
});

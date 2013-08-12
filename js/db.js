'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var DB = {
  openDb: function() {
    var req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
      // Better use "this" than "req" to get the result to avoid problems with
      // garbage collection.
      // db = req.result;
      db = this.result;
      SL.finishInit();
    };
    req.onerror = function (evt) {
      DB.resetApp();
      console.error("openDb:", this.errorCode);
    };

    req.onupgradeneeded = function (evt) {
      var store = this.result.createObjectStore(
        DB_STORE_LISTS, { keyPath: 'id', autoIncrement: true });

      store.createIndex('guid', 'guid', { unique: true });

      // Store items
      var storeItems = this.result.createObjectStore(
        DB_STORE_ITEMS, { keyPath: 'id', autoIncrement: true });

      storeItems.createIndex('guid', 'guid', { unique: true });

      // Store items
      var storeSettings = this.result.createObjectStore(
        DB_STORE_SETTINGS, { keyPath: 'id', autoIncrement: true });

      storeSettings.createIndex('guid', 'guid', { unique: true });
    };
  },

  /**
   * @param {string} name
   * @param {string} date
   * Insert a new object in the view's DB
   */
  store: function(aList, view, bool) {
    var store = this.getObjectStore(view.store, 'readwrite');
    var req;
    try {
      req = store.add(aList);
    } catch (e) {
      throw e;
    }
    if (typeof bool === "undefined") {
      view.obj[aList.guid] = aList;
    }
    req.onsuccess = function (evt) {
      console.log("Inserted");
    };
    req.onerror = function() {
      console.error(this.error);
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
    };

    var i = 0;
    req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = this.result;
      // If the cursor is pointing at something, ask for the data
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (evt) {
          var aList = this.result;
          view.display(aList);
          if (typeof SL[view.name].obj != "undefined") {
            SL[view.name].obj[aList.guid] = aList;
          }
          i++;
        };
        view.count = i;
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
  deleteFromDB: function(guid, view, bool) {
    if (typeof bool === "undefined") {
      // Delete from obj
      delete view.obj[guid];
    }
    var store = DB.getObjectStore(view.store, 'readwrite');
    var req = store.index('guid');
    req.get(guid).onsuccess = function(evt) {
      if (typeof this.result == 'undefined') {
        console.error("No matching record found");
        return;
      }
      DB.deleteList(this.result.id, store, view);
    };
    req.onerror = function (evt) {
      console.error("deletePublicationFromBib:", this.errorCode);
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
      var record = this.result;
      if (typeof record == 'undefined') {
        console.error("No matching record found");
        return;
      }
      // Warning: The exact same key used for creation needs to be passed for
      // the deletion. If the key was a Number for creation, then it needs to
      // be a Number for deletion.
      req = store.delete(key);
      req.onsuccess = function(evt) {
        console.log("Item succesfully deleted");
      };
      req.onerror = function (evt) {
        console.error("deletePublication:", this.errorCode);
      };
    };
    req.onerror = function (evt) {
      console.error("deletePublication:", this.errorCode);
      };
  },

  updateObj: function(aView) {
    var store = DB.getObjectStore(SL[aView].store, 'readonly');
    var req = store.count();
    req = store.openCursor();
    req.onsuccess = function(evt) {
      var cursor = this.result;
      // If the cursor is pointing at something, ask for the data
      if (cursor) {
        req = store.get(cursor.key);
        req.onsuccess = function (evt) {
          var result = this.result;
          SL[aView].obj[result.guid] = result;
        };
        // Move on to the next object in store
        cursor.continue();
      } else {
        if (typeof SL[aView].loaded != "undefined") {
          if(!SL[aView].loaded) {
            SL[aView].updateUI();
          }
        }
        if (!SL.Lists.loaded) {
          DB.updateObj("Lists");
        }
      }
    }
  },

  /**
   * @param {string} store_name
   * @param {string} mode either "readonly" or "readwrite"
   */
  getObjectStore: function(storename, mode) {
    var tx = db.transaction(storename, mode);
    return tx.objectStore(storename);
  },

  /**
   * Resert the App when DB is corrupted or when user wants to erase its data
   */
  resetApp: function() {
    db.close();

    var request = window.indexedDB.deleteDatabase(DB_NAME);

    request.onerror = function(event) {
      alert("clear-error");
    };

    request.onsuccess = function(event) {
      // Erase data in obj
      SL.Settings.obj = DEFAULT_CONF;
      SL.Lists.obj = {};
      SL.Items.obj = {};

      // Refresh list view
      SL.Lists.updateUI();

      // Warn user
      SL.displayStatus("clear-ok");

      // Create new DB
      DB.openDb();

      // Go to list view
      location.hash = "#lists";
      SL.Lists.init();
    };
  },

};

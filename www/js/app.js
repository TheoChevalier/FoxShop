
// This uses require.js to structure javascript:
// http://requirejs.org/docs/api.html#define

define(function(require) {
  // Receipt verification (https://github.com/mozilla/receiptverifier)
  require('receiptverifier');

  // Installation button
  require('./install-button');

  // Install the x-view and x-listview tags
  require('layouts/view');
  require('layouts/list');

        // DB init
  const DB_NAME = 'ShoppingList';
  const DB_VERSION = 1; // Use a long long for this value (don't use a float)
  const DB_STORE_NAME = 'lists';

  var db;
  // Returns a form to create a new list
  function addNewListForm() {
    
    // Textbox
    var listName = document.createElement('input');
    listName.setAttribute('type','text');
    listName.setAttribute('id','listName');
    listName.setAttribute('placeholder','Name');

    // Button
    var addButton = document.createElement('button');
    //addButton.addEventListener("click", newList, false);
    addButton.setAttribute('id', 'add-button');
    addButton.innerHTML = '+';

    var newLi = document.createElement('li');
    newLi.appendChild(listName);
    newLi.appendChild(addButton);

    return newLi;
  }

  function openDb() {
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
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

      store.createIndex('name', 'name', { unique: false });
      store.createIndex('date', 'date', { unique: false });
    };
  }

  /**
   * @param {string} name
   * @param {string} date
   * Insert the new list in the DB
   */
  function storeList(name, date) {
    console.log("addPublication arguments:", arguments);
    var obj = { name: name, date: date };

    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var req;
    try {
      req = store.add(obj);
    } catch (e) {
      throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Insertion in DB successful");
      displayActionSuccess("Inserted");
      displayList(store);
    };
    req.onerror = function() {
      console.error("addPublication error", this.error);
      displayActionFailure(this.error);
    };
  }

  /**
   * @param {IDBObjectStore=} store
   */
  function displayList(store) {
    console.log("displayPubList");

    if (typeof store == 'undefined')
      store = getObjectStore(DB_STORE_NAME, 'readonly');

    var list = $('.list').get(0);

    // Reseting the collection so that it doesn't display previous content
    list.reset();

    var req;
    req = store.count();
    // Requests are executed in the order in which they were made against the
    // transaction, and their results are returned in the same order.
    // Thus the count text below will be displayed before the actual pub list
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
        req.onsuccess = function (evt) {
          var value = evt.target.result;
          list.add({ title: value.name,
            date: value.date });
        };

        // Move on to the next object in store
        cursor.continue();

        // This counter serves only to create distinct ids
        i++;
      } else {
        console.log("No more entries");
      }
    };
  }

  /**
   * @param {string} store_name
   * @param {string} mode either "readonly" or "readwrite"
   */
  function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  }

  // Messages handlers
  function displayActionSuccess(msg) {
    msg = typeof msg != 'undefined' ? "Success: " + msg : "Success";
    $('#msg').html('<span class="action-success">' + msg + '</span>');
  }
  function displayActionFailure(msg) {
    msg = typeof msg != 'undefined' ? "Failure: " + msg : "Failure";
    $('#msg').html('<span class="action-failure">' + msg + '</span>');
  }
  function resetActionStatus() {
    console.log("resetActionStatus ...");
    $('#msg').empty();
    console.log("resetActionStatus DONE");
  }

  // Add the eventListeners to buttons, etc.
  function addEventListeners() {
    
    console.log("addEventListeners");
    $('#add-button').click(function(evt) {
      var name = $('#listName').val();
      var date = new Date();

      if (!name || name === undefined) {
        displayActionFailure("You must enter a name");
        return;
      }
     storeList(name, date);
      console.log("add..."+name);
    });

    $('#edit-button').click(function(evt) {
       console.log("edit");
    });
  }
 
  function finishInit() {
    // Populate the list
    displayList();
    //list.nextView = 'x-view.details';

    // Insert the form to create a new list
    var listUl = document.getElementsByClassName('list')[0];
    listUl = listUl.getElementsByClassName('contents')[0];

    listUl.appendChild(addNewListForm());
    addEventListeners();
  }

  // Passing a function into $ delays the execution until the
  // document is ready
  $(function() {
    openDb();
    
    // Detail view
    var details = $('.details').get(0);
    details.render = function(item) {
        $('.title', this).text(item.get('title'));
    };

      
  });
});
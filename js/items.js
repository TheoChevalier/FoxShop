
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
      var container = document.createElement('a');
      container.innerHTML = "X ";
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
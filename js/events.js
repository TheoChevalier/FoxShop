

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
      SL.hide("lists");
      SL.hide("items");
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
  };

  // Button to clear the form
  SL.Lists.elm.querySelector('button[type="reset"]').addEventListener("click",
  function() {
      SL.id("listName").innerHTML = "";
  });

  // Button to cross out all the lists
  SL.Lists.elm.getElementsByClassName("icon-complete")[0].addEventListener("click",  function() {
    SL.completeall();
  });
   
  // Init event for edit view
  SL.Lists.elm.getElementsByClassName('edit')[0].addEventListener("click",
  function() {
    SL.editMode.init(SL.Lists);
    SL.hide("lists");
  });

  SL.id('install').addEventListener('click', function(e){
    navigator.mozApps.install(MANIFEST).onsuccess = function () {
      SL.id("install").style.display = "none";
    };
  });

  // MoreItems
  SL.Lists.elm.getElementsByClassName("icon-more")[0].addEventListener("click",
  function() {
    SL.hide("lists");
    SL.show("moreLists");
  });

  /*****************************************************************************
   * editMode
   ****************************************************************************/
  var header = SL.editMode.elm.getElementsByTagName("header")[0];

  // Close
  header.getElementsByTagName("button")[0].addEventListener("click", function() {
    SL.hide("editMode");
    SL.show(SL[SL.editMode.openedFrom].elm.id);
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
  SL.id("add-item").addEventListener("click", function() {
    SL.Items.new();
  });
  // …or if he hit enter key
  SL.id("itemName").onkeyup = function (e) {
    if (e.keyCode == 13) {
      SL.Items.new();
    }
  }
  SL.id("itemQty").onkeyup = function (e) {
    if (e.keyCode == 13) {
      SL.Items.new();
    }
  }

  // Button to clear the form
  SL.Items.elm.querySelector('button[type="reset"]').addEventListener("click",
  function() {
      SL.id("itemName").innerHTML = "";
      SL.id("itemQty").innerHTML = "1";
  });

  // Button to cross out all the items
  SL.Items.elm.getElementsByClassName("icon-complete")[0].addEventListener("click",  function() {
    SL.completeall();
  });

  // Display buttons
  SL.Items.elm.getElementsByClassName("back")[0].addEventListener("click",
  function() {
    SL.hide("items");
    SL.show("lists");
  });

  var send = SL.Items.elm.getElementsByClassName("send")[0];
  send.addEventListener("click", function() {
    SL.hide("items");
    SL.show("enterEmail");
  });

    // Init event for edit view
  SL.Items.elm.getElementsByClassName('edit')[0].addEventListener("click",
  function() {
    SL.hide("items");
    SL.editMode.init(SL.Items);
  });

  // MoreItems
  SL.Items.elm.getElementsByClassName("icon-more")[0].addEventListener("click",
  function() {
    SL.hide("items");
    SL.show("moreItems");
  });


  /*****************************************************************************
   * itemView
   ****************************************************************************/
  SL.ItemView.elm.getElementsByClassName("icon-back")[0].parentNode.addEventListener("click",
    function() {
      SL.hide("itemView");
      SL.show("items");
    });

  SL.id("saveItem").addEventListener("click", function() {
      //Switch views
      SL.hide("itemView");
      SL.show("items");
      SL.ItemView.save();
  });

  SL.id("alarm-delete").addEventListener("click",
    function() {
      SL.hide("itemView");
      SL.show("deleteItem");
    });

  SL.id("plusOne").addEventListener("click", function() {
    SL.ItemView.plusOne();
  });
  SL.id("lessOne").addEventListener("click", function() {
    SL.ItemView.lessOne();
  });


  /*****************************************************************************
   * deleteItem
   ****************************************************************************/

    SL.id("deleteItem").getElementsByTagName("button")[1].addEventListener("click",
    function() {
      var guid = SL.ItemView.item.guid;
      SL.hide("deleteItem");
      SL.removeElement(SL.Items.elm.querySelector('li[data-listkey="'+guid+'"]'));
      SL.show("items");
      DB.deleteFromDB(guid, SL.Items);
    });

    SL.id("deleteItem").getElementsByTagName("button")[0].addEventListener("click",
    function() {
      SL.hide("deleteItem");
      SL.show("itemView");
    });


  /*****************************************************************************
   * send e-mail views
   ****************************************************************************/
  // Add event listeners to buttons

  //Cancel
  SL.enterEmail.elm.getElementsByClassName("cancel")[0].addEventListener("click",
    function() {
      SL.hide("enterEmail");
      SL.show("items");
    });

  // Button to clear the form
  SL.enterEmail.elm.querySelector('button[type="reset"]').addEventListener("click",
  function() {
      SL.id("email").innerHTML = "";
  });

  // Send
  SL.enterEmail.elm.getElementsByClassName("send")[0].addEventListener("click",
    function() {
      SL.enterEmail.sendAddress();
    });
  // …or if he hit enter key
  SL.id("email").onkeyup = function (e) {
    if (e.keyCode == 13) {
      SL.enterEmail.sendAddress();
    }
  }



  /*****************************************************************************
   * More List
   ****************************************************************************/
  SL.id("moreLists").getElementsByClassName("cancel")[0].addEventListener("click",
    function() {
      SL.hide("moreLists");
      SL.show("lists");
    });

    SL.id("removeDoneLists").addEventListener("click",
    function() {
      SL.removeDone("Lists");
      SL.hide("moreLists");
      SL.show("lists");
    });

  /*****************************************************************************
   * More Items
   ****************************************************************************/
  SL.id("moreItems").getElementsByClassName("cancel")[0].addEventListener("click",
    function() {
      SL.hide("moreItems");
      SL.show("items");
    });

    SL.id("removeDoneItems").addEventListener("click",
    function() {
      SL.removeDone("Items");
      SL.hide("moreItems");
      SL.show("items");
    });

  /*****************************************************************************
   * Settings
   ****************************************************************************/
  SL.Settings.elm.getElementsByClassName("icon-back")[0].parentNode.addEventListener("click", function() {
    SL.hide("settingsPanel");
    // FIXME: determine the previous view
    SL.show("lists");
  });

  /*
   * Language
   */
  document.querySelector('select[name="language"]').addEventListener("change", function() {
    var selected = this.options[this.selectedIndex];
    // Save setting
    SL.Settings.save("language", selected.value);
    SL.id("language").innerHTML = selected.innerHTML;

    // Change language
    document.webL10n.setLanguage(selected.value);
  });

  /*
   * Currency settings
   */
  // Show position & currency panel
  SL.id("currency").addEventListener("click", function() {
    SL.hide("settingsPanel");
    SL.show("editCurrency");
  });

  // Hide currency panel
  SL.id("cEditCurrency").addEventListener("click", function() {
    SL.hide("editCurrency");
    SL.show("settingsPanel");
  });
  SL.id("setEditCurrency").addEventListener("click", function() {
    SL.hide("editCurrency");
    SL.show("settingsPanel");

    // Save settings
    SL.Settings.save("userCurrency", SL.id("userCurrency").value);

    var selected = SL.getCheckedRadioId("position");
    SL.Settings.save("currencyPosition", selected);
  });

  // Switches
  SL.id("prices-enable").addEventListener("click", function() {
    if(this.checked) {
      SL.id("currency").removeAttribute("disabled");
    } else {
      SL.id("currency").setAttribute("disabled", "");
    }
    // Update the obj before refreshing Lists view
    if (typeof SL.Settings.obj["prices-enable"] == "undefined") {
      SL.Settings.obj["prices-enable"] = {value:""};
    }
    SL.Settings.obj["prices-enable"].value = this.checked;
    SL.Lists.updateUI();

    SL.Settings.save("prices-enable", this.checked);
  });

  /*
   * About panel
   */
  SL.id("about").addEventListener("click", function() {
    SL.hide("settingsPanel");
    SL.show("aboutPanel");
  });
  SL.id("aboutBack").addEventListener("click", function() {
    SL.hide("aboutPanel");
    SL.show("settingsPanel");
  });
}
 
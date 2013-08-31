'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Add the eventListeners to buttons, etc.

/*****************************************************************************
 * Status
 ****************************************************************************/
// Display a notification to the user during 3s
$id("status").addEventListener("animationend", SL.hideStatus, false);


/*****************************************************************************
 * Lists
 ****************************************************************************/
// Add list when the user click the button…
$id("add-list").addEventListener("click", function() {
  SL.Lists.new();
});
// …or if he hit enter key
$id("listName").addEventListener("keyup", function (e) {
  if (e.keyCode == 13) {
    SL.Lists.new();
  }
});

// Button to clear the form
SL.Lists.elm.querySelector('button[type="reset"]').addEventListener("click",
function() {
    $id("listName").textContent = "";
});
 
// Init event for edit view
SL.Lists.elm.getElementsByClassName('edit')[0].addEventListener("click",
function() {
  SL.editMode.init(SL.Lists);
});

// Install the Web App
$id('install').addEventListener('click', function(e){
  navigator.mozApps.install(MANIFEST).onsuccess = function () {
    $id("install").style.display = "none";
  };
});

// MoreItems
SL.Lists.elm.getElementsByClassName("icon-more")[0].addEventListener("click",
function() {
  location.hash = "#moreLists";
});

// Settings
SL.Lists.elm.getElementsByClassName("icon-settings")[0].addEventListener("click",
function() {
  SL.Settings.init();
});


/*****************************************************************************
 * editMode
 ****************************************************************************/
var header = SL.editMode.elm.getElementsByTagName("header")[0];

// Close
header.getElementsByTagName("button")[0].addEventListener("click", function() {
  location.hash = SL.editMode.openedFrom;
  SL.view = SL.capitalise(SL.removeSharp(SL.editMode.openedFrom));
});

// Delete Selected
header.getElementsByTagName("button")[1].addEventListener("click", function() {
  var n = SL.editMode.count();
  if(n>0) {
    SL.initConfirm(SL.editMode.count());
    location.hash = "#deleteItem";
  }

});

var menu = SL.editMode.elm.getElementsByTagName("menu")[1];

// Deselect All
menu.getElementsByTagName("button")[0].addEventListener("click", function() {
  SL.editMode.deselectAll();
});

// Select All
menu.getElementsByTagName("button")[1].addEventListener("click", function() {
  SL.editMode.selectAll();
});


/*****************************************************************************
 * Items
 ****************************************************************************/
// Add item when the user click the button…
$id("add-item").addEventListener("click", function() {
  SL.Items.new();
});
// …or if he hit enter key
$id("itemName").addEventListener("keyup", function (e) {
  if (e.keyCode == 13) {
    SL.Items.new();
  }
});

// Button to clear the form
SL.Items.elm.querySelector('button[type="reset"]').addEventListener("click",
function() {
    $id("itemName").textContent = "";
});


// Display buttons
SL.Items.elm.getElementsByClassName("back")[0].addEventListener("click",
function() {
  location.hash = "#lists";
  SL.view = "Lists";
});

var send = SL.Items.elm.getElementsByClassName("send")[0];
send.addEventListener("click", function() {
  SL.Items.mozActivity();
});

// Init event for edit view
SL.Items.elm.getElementsByClassName('edit')[0].addEventListener("click",
function() {
  SL.editMode.init(SL.Items);
});

// MoreItems
SL.Items.elm.getElementsByClassName("icon-more")[0].addEventListener("click",
function() {
  location.hash = "#moreItems";
});

// Settings
SL.Items.elm.getElementsByClassName("icon-settings")[0].addEventListener("click",
function() {
  SL.Settings.init();
});

// Edit List name
$id("editList").addEventListener("click", function() {
  SL.Items.openEditListName();
});

$id("saveList").addEventListener("click", function() {
  SL.Items.saveListName();
});

// Pick barcode image
$id("scan").addEventListener("click", function() {
  SL.Items.pickImage();
});


/*****************************************************************************
 * New Item Form
 ****************************************************************************/
$id("NIF-open").addEventListener("click", function() {
  SL.Items.openNIF();
});

$id("NIF-close").addEventListener("click", function() {
  location.hash = "#items";
});

$id("NIF-done").addEventListener("click", function() {
  SL[SL.view].doneNIF();
});

$id("thumbnail-action").addEventListener("click", function() {
  SL.newItemForm.pickImage();
});
/*
$id("input-photo").addEventListener("change", function() {
  var url = $id("input-photo").value;
  console.log(url);
  SL.redimImage(url, "NIF-photo", 100, 100);
});*/

$id("NIF-plus").addEventListener("click", function() {
  SL.Items.plusOne("NIF-qty");
});
$id("NIF-less").addEventListener("click", function() {
  SL.Items.lessOne("NIF-qty");
});

// Update fake select value
$id("NIF-category").addEventListener("change", function() {
  var selected = this.options[this.selectedIndex];
  $id("NIF-category-button").textContent = selected.textContent;
});
$id("NIF-unit").addEventListener("change", function() {
  var selected = this.options[this.selectedIndex];
  $id("NIF-unit-button").textContent = selected.textContent;
});

$id("NIF-delete").addEventListener("click",
function() {
  location.hash = "#deleteItem";
  SL.initConfirm(1);
});

/*****************************************************************************
 * deleteItem
 ****************************************************************************/

  $id("deleteItem").getElementsByTagName("button")[1].addEventListener("click",
  function() {
    SL[SL.view].remove();
  });

  $id("deleteItem").getElementsByTagName("button")[0].addEventListener("click",
  function() {
    location.hash = SL.oldHash;
  });


/*****************************************************************************
 * send e-mail views
 ****************************************************************************/
// Add event listeners to buttons

//Cancel
SL.enterEmail.elm.getElementsByClassName("cancel")[0].addEventListener("click",
  function() {
  location.hash = "#items";
  });
$id("sendEmail").getElementsByClassName("cancel")[0].addEventListener("click",
  function() {
  location.hash = "#enterEmail";
  });


// Button to clear the form
SL.enterEmail.elm.querySelector('button[type="reset"]').addEventListener("click",
function() {
    $id("email").textContent = "";
});

// Send
SL.enterEmail.elm.getElementsByClassName("send")[0].addEventListener("click",
  function() {
    SL.enterEmail.sendAddress();
  });
// …or if he hit enter key
$id("email").addEventListener("keyup", function (e) {
  if (e.keyCode == 13) {
    SL.enterEmail.sendAddress();
  }
});



/*****************************************************************************
 * More List
 ****************************************************************************/
$id("moreLists").getElementsByClassName("cancel")[0].addEventListener("click",
  function() {
    location.hash = "#lists";
  });

$id("removeDoneLists").addEventListener("click",
  function() {
    SL.removeDone("Lists");
    location.hash = "#lists";
  });

$id("checkLists").addEventListener("click",
  function() {
    SL.setAll(true);
    location.hash = "#lists";
  });

$id("uncheckLists").addEventListener("click",
  function() {
    SL.setAll(false);
    location.hash = "#lists";
  });

/*****************************************************************************
 * More Items
 ****************************************************************************/
$id("moreItems").getElementsByClassName("cancel")[0].addEventListener("click",
  function() {
    location.hash = "#items";
  });

$id("removeDoneItems").addEventListener("click",
  function() {
    SL.removeDone("Items");
    location.hash = "#items";
  });

$id("cloneList").addEventListener("click",
  function() {
    SL.Items.clone();
    location.hash = "#lists";
  });

$id("checkItems").addEventListener("click",
  function() {
    SL.setAll(true);
    location.hash = "#items";
  });

$id("uncheckItems").addEventListener("click",
  function() {
    SL.setAll(false);
    location.hash = "#items";
  });


/*****************************************************************************
 * Settings
 ****************************************************************************/
SL.Settings.elm.getElementsByClassName("icon-back")[0].parentNode.addEventListener("click", function() {
  location.hash = SL.Settings.openedFrom;
});

/*
 * Language
 */
document.querySelector('select[name="language"]').addEventListener("change", function() {
  var selected = this.options[this.selectedIndex];
  // Save setting
  SL.Settings.save("language", selected.value);
  $id("language").textContent = selected.textContent;

  // Change language
  document.webL10n.setLanguage(selected.value);
});

/*
 * Currency settings
 */
// Show position & currency panel
$id("currency").addEventListener("click", function() {
  SL.Settings.updateUI();
  location.hash = "#editCurrency";
});

// Hide currency panel
$id("cEditCurrency").addEventListener("click", function() {
  location.hash = "#settingsPanel";
});
$id("setEditCurrency").addEventListener("click", function() {
  location.hash = "#settingsPanel";

  // Save settings
  if ($id("userCurrency").value != "") {
    SL.Settings.save("userCurrency", $id("userCurrency").value);
  }

  var selected = SL.getCheckedRadioId("position");
  SL.Settings.save("currencyPosition", selected);
});

// Switches
$id("scanEnable").addEventListener("click", function() {
  // Update the obj before refreshing Lists view
  SL.Settings.save("scanEnable", this.checked);
});

$id("prices").addEventListener("click", function() {
  if(this.checked) {
    $id("currency").removeAttribute("disabled");
  } else {
    $id("currency").setAttribute("disabled", "");
  }
  SL.Settings.save("prices", this.checked);
});

$id("clear-data").addEventListener("click", function() {
  location.hash = "#clearPrompt";
});

$id("signature").addEventListener("click", function() {
  SL.Settings.save("signature", this.checked);
});

// Clear prompt buttons
$id("clearPromptCancel").addEventListener("click", function() {
  location.hash = "#settingsPanel";
});
$id("clearPromptReset").addEventListener("click", function() {
  DB.resetApp();
});

/*
 * About panel
 */
$id("about").addEventListener("click", function() {
  location.hash = "#aboutPanel";
});

$id("contact-button").addEventListener("click", function() {
  SL.Settings.contact();
});

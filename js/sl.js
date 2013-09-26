'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// DB init
var DB_NAME = 'ShoppingList';
var DB_VERSION = 4; // Use a long long for this value (don't use a float)
var DB_STORE_LISTS = 'lists2';
var DB_STORE_ITEMS = 'items1';
var DB_STORE_IMAGES = 'images1';
var DB_STORE_SETTINGS = 'settings1';
var db;
var MOZACTIVITY = false;
var SCANNER = true;
var SHARE = false;
var DEFAULT_CONF = {language:{value:""},
                    scanEnable:{value:true},
                    prices:{value:true},
                    signature:{value:true},
                    userCurrency:{value:""},
                    currencyPosition:{value:""}
                   };
var EMAIL = "foxshop@theochevalier.fr";

 // IndexedDB
var indexedDB = window.indexedDB || window.webkitIndexedDB
                || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;

var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction
                     || window.OIDBTransaction || window.msIDBTransaction;

// Alias for getElementById
var $id = document.getElementById.bind(document);

// Define manifest URL
if (location.host === "localhost") {
  var MANIFEST = "http://localhost/FoxShop/manifest.webapp";
} else {
  var MANIFEST = location.protocol + "//" + location.host + "/FoxShop/manifest.webapp";
}

/*****************************************************************************
* App event listeners
****************************************************************************/
// Init App after l10n init
window.addEventListener("localized", function() {
  if(typeof db == "undefined") {
    DB.openDb();
  }
});

// Manage App Cache updates
window.applicationCache.addEventListener('updateready', function(e) {
var appCache = window.applicationCache;
  if (appCache) {
    appCache.onupdateready = function () {
      if (window.confirm(_("update-ready"))) {
        location.reload(true);
      }
    };
  }
}, false);

window.onhashchange = function() {
  var oldHash = SL.oldHash;
  if (oldHash != "" && oldHash != location.hash) {
    SL.hide(SL.removeSharp(oldHash));
  }
  SL.oldHash = SL.currentHash;
  SL.currentHash = location.hash;
  if (SL.currentHash == "#" || SL.currentHash == "") location.hash = "#lists";
};

  /*****************************************************************************
  * feature detection
  ****************************************************************************/
  if (typeof MozActivity !== "undefined") {
    MOZACTIVITY = true;
    SCANNER     = true;
    SHARE       = true;
  } else {
    SCANNER     = false;
    SHARE       = false;
  }


var SL = {
  currentHash: "#lists",
  oldHash: "#lists",
  view: "Lists",
  // Actions that needs the DB to be ready
  finishInit: function() {

    // Load all the data in <view>.obj
    DB.updateObj("Settings");
    DB.updateObj("Items");
  },

  /*****************************************************************************
  * functions shared between views
  ****************************************************************************/
  // Display an element of a list in a view
  display: function(aList, aView) {
    var newLi = document.createElement('li');
    newLi.dataset.listkey = aList.guid;

    // Part 1 toggle
    var newToggle = document.createElement('label');
    var mySpan = document.createElement('span');
    var checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    if (aList.done) {
      newLi.className = "done";
      checkbox.setAttribute('checked', true);
    }

    newToggle.appendChild(checkbox);
    newToggle.appendChild(mySpan);

    newToggle.addEventListener("click", function(e) {
      aList.done = !aList.done;

      if (aList.done) {
        newLi.className = "done";
        checkbox.setAttribute('checked', true);
      } else {
        newLi.className = "";
        checkbox.removeAttribute('checked');
      }
      // Update local objet to get the value when refreshing the UI
      aView.obj[aList.guid].done = aList.done;
      SL.Lists.updateUI();
      SL.Items.updateUI();

      // Delete the item, add the updated one
      DB.deleteFromDB(aList.guid, aView, false);
      DB.store(aList, aView, false);

      e.preventDefault();
    });


    // Part 2 pack-end
    var packEnd  = document.createElement('aside');
    var packEndImg  = document.createElement('img');
    packEnd.className = "pack-end";
    packEndImg.src="";
    packEnd.appendChild(packEndImg);


    // part 3 title
    var newTitle = document.createElement('a');
    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    var total = document.createElement('a');
    var count = document.createElement('a');
    var note = document.createElement('a');
    p1.textContent = aList.name;

    p2.appendChild(total);
    p2.appendChild(count);
    p2.appendChild(note);

    newTitle.className = "liTitle";
    newTitle.addEventListener("click", function(e) {
      SL[aView.nextView].init(SL[aView.name].obj[newLi.dataset.listkey]);
      SL[aView.nextView].updateUI();
    });
    newTitle.appendChild(p1);
    newTitle.appendChild(p2);

    newLi.appendChild(newToggle);
    newLi.appendChild(packEnd);
    newLi.appendChild(newTitle);

    if (aView.name !== "Items") {
      aView.elm.getElementsByClassName("list")[0].appendChild(newLi);
    } else {
      var cat = aList.category;
      if (typeof cat === "undefined") {
        cat = "other";
      }
      var catElm = aView.elm.getElementsByClassName(cat)[0];
      if (typeof catElm === "undefined" || catElm == null) {
        var listElm = aView.elm.getElementsByClassName("list")[0];
        SL.newCatHeader(cat, newLi, listElm);
      } else {
        catElm.appendChild(newLi);
      }
    }
  },

  newCatHeader: function(cat, item, list) {
    var category = document.createElement('ul');
    category.className = cat;

    /* create category header */
    var header = document.createElement("header");
    var h2 = document.createElement("h2");
    h2.setAttribute('data-l10n-id', "NIF-"+cat);
    h2.textContent = _("NIF-"+cat);
    header.appendChild(h2);

    category.appendChild(header);
    category.appendChild(item);
    list.appendChild(category);
  },

  // Cross out all item
  setAll: function(bool) {
    // Update UI
    var nodes = SL[this.view].elm.getElementsByClassName("list")[0].getElementsByTagName("li");
    for(var i=0; i<nodes.length; i++) {
      if (bool) {
        nodes[i].getElementsByTagName('input')[0].setAttribute("checked", true);
        nodes[i].className = 'done';
      } else {
        nodes[i].getElementsByTagName('input')[0].removeAttribute("checked", true);
        nodes[i].className = '';
      }
    }
    // Update local obj, then UI, then DB
    for (var aGuid in SL[this.view].obj) {
      var aItem = SL[this.view].obj[aGuid];
      aItem.done = bool;

      SL.Lists.updateUI();
      SL.Items.updateUI();

      DB.deleteFromDB(aItem.guid, SL[this.view], false);
      DB.store(aItem, SL[this.view], false);
    }
  },

  // Remove done items/lists
  removeDone: function(aView) {
    var nodes = SL[aView].elm.getElementsByClassName("list")[0].getElementsByTagName("li");
    for(var i=0; i<nodes.length; i++) {
      if (nodes[i].getElementsByTagName("input")[0].checked) {
        var guid = nodes[i].dataset["listkey"];
        var cat = nodes[i].parentNode;
        DB.deleteFromDB(guid, SL[aView], false);
        delete SL[aView].obj[guid];

        // Check if empty category
        if (cat.getElementsByTagName("li").length == 0 && aView == "Items") {
          SL.removeElement(cat);
        }
      }
    }
    SL.Items.updateUI();
    SL.Lists.updateUI();
  },
  // Used everywhere where prices are needed
  setPrice: function(elm, string, value) {
    // Return if no price
    if (typeof value === "undefined" || typeof value === "NaN") {
      return;
    }
    // Limit numbers after decimal place
    if(value > 0) {
      value = parseFloat(value).toFixed(2);
    } else {
      value = 0;
    }

    // Default values
    var pricesEnabled = SL.Settings.obj["prices"].value;
    var position = SL.Settings.obj.currencyPosition.value;
    var currency = SL.Settings.obj.userCurrency.value;
    if (currency === "")
      currency = _("user-currency");

    // Continue only if we handle prices
    if (!pricesEnabled) {
      return;
    }

    var a = currency;
    var b = value;
    if (position == "right") {
      a = value;
      b = currency;
    }
    elm.setAttribute("data-l10n-id", string);
    elm.setAttribute("data-l10n-args", '{"a":"'+a+'", "b":"'+b+'"}');
    elm.textContent = _(string, {"a":a, "b":b});
  },
  displayStatus: function(id) {
    var status = $id("status");
    SL.show("status");
    status.innerHTML = "<p>"+_(id)+"</p>";
    $id("status").className ="slideIn";
    setTimeout(function() {
      $id("status").className = "slideOut";
    }, 3000);
  },
  hideStatus: function() {
    if ($id("status").className == "slideOut") {
      SL.hide("status");
    }
  },
  // Init the deleteItem section with a custom message
  initConfirm: function(n) {
    var span = $id("deleteItem").getElementsByTagName("span")[0];
    span.textContent = _("delete-item-desc", {'n':n});
  },

  /*****************************************************************************
  * Generic functions, used everywhere
  ****************************************************************************/ 
  // Generate four random hex digits.
  S4: function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  },
  // Generate a pseudo-GUID by concatenating random hexadecimal.
  guid: function() {
     return (this.S4()+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+"-"+this.S4()+this.S4()+this.S4());
  },
  hide: function(target) {
    target = $id(target).style;
    target.display = "none";
  },
  show: function(target) {
    target = $id(target).style;
    target.display = "block";
  },
  removeSharp: function(hash) {
    hash = hash.replace(/(#)/gm,"");
    return hash;
  },
  capitalise: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  removeElement: function(node) {
    if(node.parentNode !== null) {
      node.parentNode.removeChild(node);
    }
  },
  clear: function(aView) {
    var node = SL[aView].elm.getElementsByClassName("list")[0];
    while (node.hasChildNodes()) {
      node.removeChild(node.lastChild);
    }
  },
  callOtherDomain: function(url){
    var invocation = new XMLHttpRequest();
    var invocationHistoryText;
    if(invocation)
    {
      invocation.open('GET', url, true);
      invocation.onreadystatechange = function(evtXHR) {
        if (invocation.readyState == 4) {
          if (invocation.status == 200) {
            var response = invocation.responseXML;
            var product = response.getElementsByTagName('code').item(0).firstChild.data;
            $id("itemName").value = product;
            return product;
          } else {
            SL.displayStatus("ajax-error");
          }
        }
        else {
          console.log("currently the request is at " + invocation.readyState);
        }
      };
      invocation.send();
    }
    else
    {
      SL.displayStatus("ajax-error");
    }
  },
  getBarcodeFromImage: function(imgOrId){
    var UPC_SET = {
      "3211": '0',
      "2221": '1',
      "2122": '2',
      "1411": '3',
      "1132": '4',
      "1231": '5',
      "1114": '6',
      "1312": '7',
      "1213": '8',
      "3112": '9'
    };
    var doc = document,
        img = "object" == typeof imgOrId ? imgOrId : doc.getElementById(imgOrId),
        canvas = doc.createElement("canvas"),
        width = img.width,
        height = img.height,
        ctx = canvas.getContext("2d"),
        spoints = [1, 9, 2, 8, 3, 7, 4, 6, 5],
        numLines = spoints.length,
        slineStep = height / (numLines + 1),
        round = Math.round;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0);
    while(numLines--){
        console.log(spoints[numLines]);
        var pxLine = ctx.getImageData(0, slineStep * spoints[numLines], width, 2).data,
            sum = [],
            min = 0,
            max = 0;
        for(var row = 0; row < 2; row++){
            for(var col = 0; col < width; col++){
                var i = ((row * width) + col) * 4,
                    g = ((pxLine[i] * 3) + (pxLine[i + 1] * 4) + (pxLine[i + 2] * 2)) / 9,
                    s = sum[col];
                pxLine[i] = pxLine[i + 1] = pxLine[i + 2] = g;
                sum[col] = g + (undefined == s ? 0 : s);
            }
        }
        for(var i = 0; i < width; i++){
            var s = sum[i] = sum[i] / 2;
            if(s < min){ min = s; }
            if(s > max){ max = s; }
        }
        var pivot = min + ((max - min) / 2),
            bmp = [];
        for(var col = 0; col < width; col++){
            var matches = 0;
            for(var row = 0; row < 2; row++){
                if(pxLine[((row * width) + col) * 4] > pivot){ matches++; }
            }
            bmp.push(matches > 1);
        }
        var curr = bmp[0],
            count = 1,
            lines = [];
        for(var col = 0; col < width; col++){
            if(bmp[col] == curr){ count++; }
            else{
                lines.push(count);
                count = 1;
                curr = bmp[col];
            }
        }
        var code = '',
            bar = ~~((lines[1] + lines[2] + lines[3]) / 3),
            u = UPC_SET;
        for(var i = 1, l = lines.length; i < l; i++){
            if(code.length < 6){ var group = lines.slice(i * 4, (i * 4) + 4); }
            else{ var group = lines.slice((i * 4 ) + 5, (i * 4) + 9); }
            var digits = [
                round(group[0] / bar),
                round(group[1] / bar),
                round(group[2] / bar),
                round(group[3] / bar)
            ];
            code += u[digits.join('')] || u[digits.reverse().join('')] || 'X';
            if(12 == code.length){ return code; break; }
        }
        if(-1 == code.indexOf('X')){ return code || false; }
    }
    return false;
  },

  redimImage: function(url, inId, inMW, inMH) {
    // Cette function recoit 3 parametres
    // inImg : Chemin relatif de l'image
    // inMW  : Largeur maximale
    // inMH   : Hauteur maximale
    var maxWidth = inMW;
    var maxHeight = inMH;
    // Declarations des variables "Nouvelle Taille"
    var dW = 0;
    var dH = 0;
    // Create context
    var canvas = $id("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = 100;
    canvas.height = 100;

    // Declaration d'un objet Image
    var oImg = new Image();
    // Affectation du chemin de l'image a l'objet
    oImg.src = url;
    oImg.onload = function () {
        var oImg = this;
        // On recupere les tailles reelles
        var h = dH = oImg.height;
        var w = dW = oImg.width;
        // Si la largeur ou la hauteur depasse la taille maximale
        if ((h >= maxHeight) || (w >= maxWidth)) {
            // Si la largeur et la hauteur depasse la taille maximale
            if ((h >= maxHeight) && (w >= maxWidth)) {
                // On cherche la plus grande valeur
                if (h > w) {
                    dH = maxHeight;
                    // On recalcule la taille proportionnellement
                    dW = parseInt((w * dH) / h, 10);
                } else {
                    dW = maxWidth;
                    // On recalcule la taille proportionnellement
                    dH = parseInt((h * dW) / w, 10);
                }
            } else if ((h > maxHeight) && (w < maxWidth)) {
                // Si la hauteur depasse la taille maximale
                dH = maxHeight;
                // On recalcule la taille proportionnellement
                dW = parseInt((w * dH) / h, 10);
            } else if ((h < maxHeight) && (w > maxWidth)) {
                // Si la largeur depasse la taille maximale
                dW = maxWidth;
                // On recalcule la taille proportionnellement
                dH = parseInt((h * dW) / w, 10);
            }
        }
        ctx.drawImage(oImg, 0, 0, dW, dH);
        // On ecrit l'image dans le document
        var img = document.getElementById(inId);
        img.src = $id("canvas").toDataURL("image/png");
    };
  },

  getBase64Image: function(img) {
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
  },

  dataURLToBlob: function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = parts[1];

      return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
  },

  //Unused for now
  class: function(target, n) {
    if (typeof n === "undefined") {
      n = 0;
    }

    return document.getElementByClassName(target)[n];
  },
  getCheckedRadioId: function(name) {
    var elements = document.getElementsByName(name);

    for (var i=0, len=elements.length; i<len; ++i)
        if (elements[i].checked) return elements[i].value;
  },
  updateSelectedOption: function(elm, option) {
    var sel = $id(elm);
    for(var i, j = 0; i = sel.options[j]; j++) {
      if(i.value == option) {
          sel.selectedIndex = j;
          break;
      }
    }
  },
};


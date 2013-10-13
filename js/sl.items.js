'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*******************************************************************************
 * Items
 ******************************************************************************/
SL.Items = {
  elm: $id('items'),
  name: 'Items',
  nextView: 'newItemForm',
  store: DB_STORE_ITEMS,
  obj: {},
  list: {},
  loaded: false,
  init: function(aList) {
    var aGuid;

    SL.view = this.name;
    this.list = aList;
    this.guid = aList.guid;
    location.hash = '#items';
    SL.Lists.updateUI();

    // Set title of the displayed Items list
    this.closeEditListName();

    // Display items info
    this.updateUI();
  },

  // Add an item to the current list
  new: function() {
    var name = $id('itemName').value;
    $id('itemName').value = '';
    var date = new Date();

    // Remove line-endings
    name = name.replace(/(\r\n|\n|\r)/gm, '');

    // Handle empty form
    if (!name) {
      SL.displayStatus('msg-name');
      return;
    }

    var aItem = { guid: SL.guid(),
                  name: name,
                  list: this.guid,
                  nb: 1,
                  date: date.getTime(),
                  done: false
    };

    DB.store(aItem, this);
    SL.display(aItem, this);
    this.updateUI();
    SL.Lists.updateUI();
  },

  // Use SL.display function to populate the list
  display: function(aList) {
    SL.display(aList, this);
  },
  updateUI: function() {
    this.loaded = true;
    this.updateListStatus();
    SL.clear(this.name);

    // Check scanner
    if (SL.Settings.obj.scanEnable.value && SCANNER) {
      SL.show('scan');
      $id('itemName').className = '';
    } else {
      SL.hide('scan');
      $id('itemName').className = 'noScan';
    }

    // For each item: display it and insert data
    for (var item in this.obj) {
      item = this.obj[item];

      if (item.list == this.list.guid) {
        SL.display(item, this);
        if (this.elm.querySelector('li[data-listkey="' + item.guid + '"]') !== null) {
          var node = this.elm.querySelector('li[data-listkey="' + item.guid + '"]');
          var img = node.getElementsByTagName('img')[0];

          // Name (first p)
          node = node.getElementsByTagName('p');
          node[0].textContent = item.name;
          // Second p
          node = node[1].getElementsByTagName('a');

          // p2 > a1: qty
          if (item.nb > 0) {
            var unit = item.unit;
            if (typeof unit === 'undefined') {
              unit = 'piece';
            }
            node[0].setAttribute('data-l10n-id', 'NIF-'+ unit + '2');
            node[0].setAttribute('data-l10n-args', '{"n":' + item.nb + '}');
            node[0].textContent = _('NIF-'+ unit + '2', {'n': item.nb});
          }

          // p2 > a2: price
          if (SL.Settings.obj.prices.value) {
            if (item.price != '') {
              SL.setPrice(node[1], 'item-price2', item.price);
            } else {
              node[1].textContent = '';
            }
          }

          // p2 > a3: note
          if (typeof item.note !== 'undefined') {
            node[2].textContent = item.note;
          }


          // Picture
          img.src = '';
          if (item.image !== '' && typeof item.image !== 'undefined' && item.image !== APP_PATH) {
            img.src = item.image;
          } else {
            DB.setBlob(item.guid, img);
          }
        }
      }
    }

    // Reorder categories
    var permute = false;
    var permutePrice = false;
    var posPrice;
    var done = false;
    var listNode = this.elm.getElementsByClassName('list')[0];
    var nodes = this.elm.getElementsByClassName('list')[0].childNodes;
    var nbNodes = nodes.length;
    var sort = this.list.sort;
    var prev;
    var i;
    var dataCurrent;
    var dataPrevious;
    var other;
    var previousPrice = 0;

    if (SL.Settings.obj.defaultSort.value === '' || sort === '' || sort === 'category') {
      if (nbNodes > 1) {
        while (!done) {
          done = true;
          for (i = nbNodes - 1; i > 0; i--) {
            prev = i - 1;
            if (_('NIF-'+ nodes[prev].className).localeCompare(_('NIF-'+ nodes[i].className)) > 0) {
              done = false;
              listNode.appendChild(nodes[prev]);
              nodes = this.elm.getElementsByClassName('list')[0].childNodes;
            }
          }
        }
        //Always put "other" cat at the bottom
        other = this.elm.getElementsByClassName('other')[0];
        if (other != null && typeof other !== 'undefined') {
          listNode.appendChild(other);
        }
      }
    } else {
      // If we have a different sort setting recorded
      nodes = this.elm.getElementsByClassName('list')[0].getElementsByTagName('li');
      nbNodes = nodes.length;
      if (nbNodes > 1) {
        // Remove all nodes from categories <ul>
        for (i = nbNodes - 1; i >= 0; i--) {
          listNode.appendChild(nodes[i]);
        }

        if (sort == 'price') {
          for (i = nbNodes - 1; i >= 0; i--) {
            var guid = nodes[i].dataset['listkey'];
            if (this.obj[guid].price != '') {
              listNode.appendChild(nodes[i]);
            }
          }
        }
        // Regen nodes list
        nodes = this.elm.getElementsByClassName('list')[0].getElementsByTagName('li');
        previousPrice = this.obj[nodes[nbNodes - 1].dataset['listkey']].price;
        while (!done) {
          done = true;
          permutePrice = false;
          for (i = nbNodes - 1; i > 0; i--) {
            prev = i - 1;
            dataCurrent = nodes[i].dataset['listkey'];
            dataPrevious = nodes[prev].dataset['listkey'];

            // Sort by name
            if (sort == 'alpha') {
              dataCurrent = this.obj[dataCurrent].name;
              dataPrevious = this.obj[dataPrevious].name;
              permute = (dataPrevious.localeCompare(dataCurrent) > 0);
            }

            // Sort by price
            if (sort == 'price') {
              dataCurrent = this.obj[dataPrevious].price;
              if (typeof dataCurrent != 'undefined' && dataCurrent != '' && dataCurrent < previousPrice) {
                posPrice = i;
                permutePrice = true;
                previousPrice = dataCurrent;
              }
            }

            if (permute) {
              done = false;
              if (prev == 0) done = true;
              this.elm.getElementsByClassName('list')[0].appendChild(nodes[prev]);
            }

            nodes = this.elm.getElementsByClassName('list')[0].getElementsByTagName('li');
          }
          // Add lowest to top
          if (permutePrice) {
              done = false;
              this.elm.getElementsByClassName('list')[0].appendChild(nodes[posPrice]);
            }
        }
        // Remove category nodes
        nodes = this.elm.getElementsByClassName('list')[0].getElementsByTagName('ul');
        nbNodes = nodes.length;
        if (nbNodes > 0) {
          for (i = 0; i < nbNodes; i++) {
            nodes[i].style.display = 'none';
            //document.getElementsByTagName("html")[0].appendChild(nodes[i]);
            //SL.removeElement(SL.Items.elm.querySelector('ul[class="'+nodes[i].className+'"]'));
          }
        }
      }
    }
  },
  updateListStatus: function() {
    // Update total/remaining
    if (this.list.total > 0 && SL.Settings.obj.prices.value) {
      if (typeof this.list.remaining == 'undefined' || this.list.remaining == '') {
        this.list.remaining = 0;
      }
      SL.show('list-status');
      SL.setPrice($id('list-total'), 'total-list', this.list.total);
      SL.setPrice($id('list-remaining'), 'remaining-list', this.list.remaining);
    } else {
      SL.hide('list-status');
    }
  },
  openEditListName: function() {
    var input = $id('newListName').getElementsByTagName('input')[0];
    input.value = this.list.name;
    this.elm.getElementsByClassName('title')[0].style.display = 'none';
    $id('editList').style.display = 'none';
    $id('newListName').style.display = 'block';
    $id('saveList').style.display = 'block';
  },
  closeEditListName: function() {
    var title = this.elm.getElementsByClassName('title')[0];
    title.textContent = this.list.name;
    title.style.display = 'block';
    $id('editList').style.display = 'block';
    $id('newListName').style.display = 'none';
    $id('saveList').style.display = 'none';
  },
  saveListName: function() {
    var newName = $id('newListName').getElementsByTagName('input')[0].value;
    if (newName !== '') {
      this.closeEditListName();
      this.list.name = newName;
      this.elm.getElementsByClassName('title')[0].textContent = newName;
      SL.Lists.updateUI();
      DB.deleteFromDB(this.list.guid, SL.Lists, false);
      DB.store(this.list, SL.Lists, false);
    } else {
      SL.displayStatus('msg-name');
    }
  },
  openNIF: function() {
    location.hash = '#newItemForm';

    // Reset view
    SL.newItemForm.elm.getElementsByClassName('title')[0].textContent = _('NIF-title');
    SL.hide('NIF-delete');
    SL.show('thumbnail-action');
    $id('NIF-photo').src = '';

    // Reset form
    $id('NIF-category-button').textContent = _('NIF-category-button');
    $id('NIF-unit-button').textContent = _('NIF-piece2[zero]');
    $id('NIF-container').reset();

    // Set name already typed on #items
    $id('NIF-name').value = $id('itemName').value;

    // Check price feature
    $id('NIF-price').parentNode.setAttribute('hidden', '');
    if (SL.Settings.obj['prices'].value) {
      $id('NIF-price').parentNode.removeAttribute('hidden');
    }

  },
  doneNIF: function() {
    var price = '';
    var name = $id('NIF-name').value;
    var qty = parseFloat($id('NIF-qty').value);
    var note = $id('NIF-note').value;
    var category = $id('NIF-category').options[$id('NIF-category').selectedIndex].value;
    var unit = $id('NIF-unit').options[$id('NIF-unit').selectedIndex].value;
    var date = new Date();

    // Remove line-endings
    name = name.replace(/(\r\n|\n|\r)/gm, '');

    if (SL.Settings.obj['prices'].value && $id('NIF-price').value !== '') {
      price = $id('NIF-price').value;
      price = price.replace(/,/gm, '.');
      price = parseFloat(price).toFixed(2);
      if (isNaN(price)) {
        SL.displayStatus('msg-NaN');
        return;
      }
    }

    // Handle empty form
    if (!name) {
      SL.displayStatus('msg-name');
      return;
    }

    if (!qty) {
      qty = 1;
    }

    // If the user selected a picture, save it
    if ($id('NIF-photo').src != '')
      var image = $id('NIF-photo').src;
    else
      var image = false;

    var aItem = { guid: SL.guid(),
                  name: name,
                  list: this.guid,
                  nb: qty,
                  price: price,
                  category: category,
                  unit: unit,
                  note: note,
                  date: date.getTime(),
                  image: image,
                  done: false
    };

    // Update local obj, then UI, then DB
    SL.Items.obj[aItem.guid] = aItem;

    SL.display(aItem, this);
    SL.Lists.updateUI();
    this.updateUI();

    DB.store(aItem, this);
    DB.storeBlob(aItem.guid, aItem.image);

    // Reset forms
    $id('NIF-container').reset();
    $id('itemName').value = '';
    location.hash = '#items';
  },
  plusOne: function(id) {
    var current = parseInt($id(id).value);
    if (!current > 0) {
      current = 0;
    }
    $id(id).value = current + 1;
  },
  lessOne: function(id) {
    var current = parseInt($id(id).value);
    if (current > 1) {
      $id(id).value = current - 1;
    }
  },
  clone: function() {
    var current = this.list;
    var guid = SL.guid();
    var date = new Date();

    // Clone list obj
    SL.Lists.obj[guid] = {};
    SL.Lists.obj[guid].guid = guid;
    SL.Lists.obj[guid].name = current.name + ' ('+ _('copy') + ')';
    SL.Lists.obj[guid].done = current.done;
    SL.Lists.obj[guid].date = date.getTime();

    // Clone items obj
    for (var aGuid in SL.Items.obj) {
      var aItem = SL.Items.obj[aGuid];
      if (aItem.list === current.guid) {
        var guidItem = SL.guid();
        var target = {};
        target.name = aItem.name;
        target.nb = aItem.nb;
        target.done = aItem.done;
        target.date = date.getTime();
        target.image = aItem.image;
        target.category = aItem.category;
        target.unit = aItem.unit;
        target.note = aItem.note;
        target.list = guid;
        target.guid = guidItem;
        if (typeof aItem.price !== 'undefined') {
          target.price = aItem.price;
        }

        SL.display(target, SL.Items);
        DB.store(target, SL.Items);
        DB.storeBlob(target.guid, target.image);
      }
    }

    // Display & save list then updateUI
    SL.display(SL.Lists.obj[guid], SL.Lists);
    DB.store(SL.Lists.obj[guid], SL.Lists, false);
    SL.Lists.updateUI();
    SL.Items.updateUI();
  },
  getSort: function() {
    var list = this.list;
    var option = SL.Settings.obj.defaultSort.value;
    if (list.sort !== '' && typeof list.sort !== 'undefined') {
      option = list.sort;
    }
    SL.updateSelectedOption('sort-options', option);
    var selected = $id('sort-options').options[$id('sort-options').selectedIndex];
    $id('sort-button').textContent = selected.textContent;
    location.hash = '#sortSetting';
  },
  setSort: function() {
    var list = this.list;
    var selected = $id('sort-options').options[$id('sort-options').selectedIndex];
    $id('sort-button').textContent = selected.textContent;
    this.list.sort = selected.value;
    SL.Lists.obj[list.guid].sort = selected.value;
    SL.Items.updateUI();

    DB.deleteFromDB(list.guid, SL.Lists, false);
    DB.store(list, SL.Lists, false);
    location.hash = '#items';

  },
  mozActivity: function() {
    var title = _('email-title-begin') + this.list.name + ' ' + _('email-title-end');
    var prices = SL.Settings.obj.prices.value;
    var position = SL.Settings.obj.currencyPosition.value;
    var currency = SL.Settings.obj.userCurrency.value;
    var signature = SL.Settings.obj.signature.value;
    var content;
    var Email = '';
    var SMS = '';

    if (!SHARE) {
      location.hash = '#enterEmail';
      return;
    }

    if (currency === '')
      currency = _('user-currency');

    if (signature) {
      Email = title + ' ' + _('email-intro-end-sms') + '%0A';
      SMS = title + ' ' + _('email-intro-end-sms');
    }

    for (var item in this.obj) {
      item = this.obj[item];
      content = '';
      if (item.list == this.list.guid) {

        // Done
        if (item.done) {
          content += '- ['+ _('bought') + '] ';
        } else {
          content += '- ';
        }

        // Name
        content += item.name;

        // Qty
        if (item.qty > 0) {
          content += ' [' + toString(item.qty);
        } else {
          content += ' [1';
        }

        // Price
        if (prices && item.price > 0) {
          if (position === 'right')
            content += ' x ' + item.price + ' ' + currency;
          else
            content += ' x ' + currency + ' ' + item.price;
        }
        content += ']';

        // Note
        if (typeof item.note !== "undefined" && item.note !== "") {
          content += ' [' + item.note + ']';
        }

        Email += content + '%0A';
        SMS += content;
      }
    }
    // Total & Remaining
    if (prices) {
      var aTotal = currency;
      var bTotal = this.list.total;
      var aRem = currency;
      var bRem = this.list.remaining;
      if (position == 'right') {
        aTotal = this.list.total;
        bTotal = currency;
        aRem = this.list.remaining;
        bRem = currency;
      }
      Email += '%0A%0A' + _('total-list', {'a':aTotal, 'b':bTotal});
      Email += '%0A' + _('remaining-list', {'a':aRem, 'b':bRem});
    }

    var a = new MozActivity({
      name: 'new',
      data: {
        url: 'mailto:?subject=' + title + '&body=' + Email, // for emails,
        body: Email // for SMS
      }
    });
  },
  pickImage: function() {
    if (!SCANNER) {
      return;
    }
    var pick = new MozActivity({
      name: 'pick',
      data: {
        type: ['image/png', 'image/jpg', 'image/jpeg']
      }
    });

    pick.onsuccess = function() {
      $id('image').src = window.URL.createObjectURL(this.result.blob);
      alert('We are analysing the picture…');
      var barcode = SL.getBarcodeFromImage('image');
      barcode = barcode.toString();
      var url = 'http://theochevalier.fr/app/php/barcode/index.php?barcode=' + barcode;
      SL.callOtherDomain(url);
    };
  }
};


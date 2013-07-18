
/*******************************************************************************
 * Settings
 ******************************************************************************/
SL.Settings = {
  elm: $id("settingsPanel"),
  name: "Settings",
  openedFrom: "Lists",
  store: DB_STORE_SETTINGS,
  obj: DEFAULT_CONF,
  loaded: false,
  // Init the view
  init: function() {
    this.openedFrom = location.hash;
    location.hash = "#settingsPanel";
  },
  // Save (or update) a setting, then updateUI
  save: function(guid, value) {
    var setting = {
      guid:  guid,
      value: value
    };

    DB.deleteFromDB(guid, this);
    DB.store(setting, this);
    DB.updateObj("Settings");
    SL.Lists.updateUI();
    SL.Items.updateUI();
  },

  // Function called after populating this.names in DB.updateObj()
  updateUI: function() {
    var pref = this.obj.language.value;
    var lang = document.webL10n.getLanguage();
    var position = true;
    this.loaded = true;

    // Lang pref

    if (pref !== lang && pref !== "") {
      document.webL10n.setLanguage(pref);
    } else {
      pref = lang;
    }

    var select = document.querySelector('select[name="language"]');
    select = select.querySelector('option[value="'+pref+'"]');

    select.setAttribute("selected","");
    $id("language").textContent = select.textContent;

    // Prices bool
    if (this.obj.prices.value) {
      $id("prices").setAttribute("checked", "");
      $id("currency").removeAttribute("disabled");
    }

    // Signature bool
    if (this.obj.signature.value) {
      $id("signature").setAttribute("checked", "");
    }

    // Currency
    if (this.obj.userCurrency.value) {
      $id("userCurrency").value = this.obj.userCurrency.value;
    } else {
      $id("userCurrency").value = _("user-currency");
    }

    // Currency’s position
    if(this.obj.currencyPosition.value) {
      if (this.obj.currencyPosition.value == "right") {
        position = false;
        console.log("pref right");
      } else {
        position = true;
        console.log("pref left");
      }
    } else {
      if( _("user-currency-position") == "right") {
        position = false;
        console.log("l10n right");
      } else {
        position = true;
        console.log("l10n left");
      }
    }

    if(position) {
      $id("positionLeft").setAttribute("checked", "");
    } else {
      $id("positionRight").setAttribute("checked", "");
    }
  },
};

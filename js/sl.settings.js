
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

    // Check MozActivity support for scanner
    if (!SCANNER) {
      $id("scanEnable").parentNode.parentNode.style.display = "none";
    }

    // Display current version number
    if (typeof window.navigator.mozApps !== "undefined") {
      var request = window.navigator.mozApps.getSelf();
      request.onsuccess = function(e) {
        if (request.result) {
          $id("version").textContent = "FoxShop v" + request.result.manifest.version;
        }
      }
    }
  },
  // Save (or update) a setting, then updateUI
  save: function(guid, value) {
    var setting = {
      guid:  guid,
      value: value
    };

    DB.deleteFromDB(guid, this);
    DB.store(setting, this);
    SL.Settings.obj[guid].value = value;
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

    // Check Scan
    if (this.obj.scanEnable.value) {
      $id("scanEnable").setAttribute("checked", "");
    }

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
      } else {
        position = true;
      }
    } else {
      if( _("user-currency-position") == "right") {
        position = false;
      } else {
        position = true;
      }
    }

    if(position) {
      $id("positionLeft").setAttribute("checked", "");
      if (!SL.Settings.obj.currencyPosition.value) {
        SL.Settings.obj.currencyPosition.value = "left";
        SL.Settings.save("currencyPosition", "left");
      }
    } else {
      $id("positionRight").setAttribute("checked", "");
      if (!SL.Settings.obj.currencyPosition.value) {
        SL.Settings.obj.currencyPosition.value = "right";
        SL.Settings.save("currencyPosition", "right");
      }
    }
  },
};

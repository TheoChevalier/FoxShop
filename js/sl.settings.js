
/*******************************************************************************
 * Settings
 ******************************************************************************/
SL.Settings = {
  elm: $id("settingsPanel"),
  name: "Settings",
  openedFrom: "Lists",
  store: DB_STORE_SETTINGS,
  obj: {
    language:{value:"en-US"},
    prices:{value:false},
    signature:{value:true},
    userCurrency:{value:""},
    currencyPosition:{value:"right"}
  },
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
    this.loaded = true;

    // Lang pref
    var pref = this.obj.language.value;
    var lang = document.webL10n.getLanguage();
    if (pref !== lang) {
      document.webL10n.setLanguage(pref);
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
    }

    // Currency’s position
    if(this.obj.currencyPosition.value == "left") {
      $id("positionLeft").setAttribute("checked", "");
    } else {
      $id("positionRight").setAttribute("checked", "");
    }
  },
};

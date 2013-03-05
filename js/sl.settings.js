
/*******************************************************************************
 * Settings
 ******************************************************************************/
SL.Settings = {
  elm: SL.id("settingsPanel"),
  name: "Settings",
  store: DB_STORE_SETTINGS,
  loaded: false,
  obj: {},

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
    var pref = this.obj.language;
    var lang = document.webL10n.getLanguage();
    if (typeof pref !== "undefined") {
      if (pref.value !== lang) {
        document.webL10n.setLanguage(pref.value);
      }
    }

    var select = document.querySelector('select[name="language"]');
    select = select.querySelector('option[value="'+lang+'"]');
    select.setAttribute("selected","");
    SL.id("language").textContent = select.textContent;

    // Prices bool
    if (typeof this.obj["prices-enable"] !== "undefined") {
      if (this.obj["prices-enable"].value) {
        SL.id("prices-enable").setAttribute("checked", "");
        SL.id("currency").removeAttribute("disabled");
      }
    }

    // Currency
    if (typeof this.obj.userCurrency !== "undefined") {
      if (this.obj.userCurrency.value) {
        SL.id("userCurrency").value = this.obj.userCurrency.value;
      }
    }

    // Currency’s position
    if (typeof this.obj.currencyPosition !== "undefined") {
      if(this.obj.currencyPosition.value == "left") {
        SL.id("positionLeft").setAttribute("checked", "");
      } else {
        SL.id("positionRight").setAttribute("checked", "");
      }
    } else {
      SL.id("positionRight").setAttribute("checked", "");
    }
  },
  close: function() {
    SL.hide("settingsPanel");
  }
};

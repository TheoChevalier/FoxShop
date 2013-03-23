
/*******************************************************************************
 * enterEmail
 ******************************************************************************/
SL.enterEmail = {
  elm: $id("enterEmail"),

  sendAddress: function() {
    if ($id("email").value != "") {
      SL.hide("enterEmail");
      SL.show("sendEmail");
      var xdr = this.getXDR();
      xdr.onload = function() {
        $id("email").value = "";
        SL.hide("sendEmail");
        SL.show("items");
      }
      var email = $id("email").value;

      // Adding items of the opened list to SL.Items.list
      for(aGuid in SL.Items.obj) {
        if (SL.Items.obj[aGuid].list == SL.Items.list.guid) {
          SL.Items.list.items[aGuid] = SL.Items.obj[aGuid];
        }
      }

      // Get localized strings
      var s = {};
      s["app-name"]            = _("app-name");
      s["email-title-begin"]   = _("email-title-begin");
      s["email-title-end"]     = _("email-title-end");
      s["email-intro-end"]     = _("email-intro-end");

      var data = "email=" + email + "&data=" + JSON.stringify(SL.Items.list);
      data += "&strings=" + JSON.stringify(s);
      xdr.open("POST", "http://theochevalier.fr/app/php/email.php");
      xdr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xdr.send(data);
    }
  },

  getXDR: function() {
    var xdr = null;

    if (window.XDomainRequest) {
      xdr = new XDomainRequest();
    } else if (window.XMLHttpRequest) {
      xdr = new XMLHttpRequest();
    } else {
      console.error("Can't create cross-domain AJAX");
    }
    return xdr;
  }
}

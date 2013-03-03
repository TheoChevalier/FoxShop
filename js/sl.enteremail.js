
/*******************************************************************************
 * enterEmail
 ******************************************************************************/
SL.enterEmail = {
  elm: SL.id("enterEmail"),

  sendAddress: function() {
    if (SL.id("email").value != "") {
      SL.hide("enterEmail");
      SL.show("sendEmail");
      var xdr = this.getXDR();
      xdr.onload = function() {
        console.log(xdr.responseText);
        SL.id("email").value = "";
        SL.hide("sendEmail");
        SL.show("items");
      }
      var email = SL.id("email").value;

      // Adding items of the opened list to SL.Items.list
      for(aGuid in SL.Items.obj) {
        if (SL.Items.obj[aGuid].list == SL.Items.list.guid) {
          SL.Items.list.items[aGuid] = SL.Items.obj[aGuid];
        }
      }
      var data = "email=" + email + "&data=" + JSON.stringify(SL.Items.list);
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

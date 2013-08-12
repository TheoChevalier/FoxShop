'use strict';

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*******************************************************************************
 * enterEmail
 ******************************************************************************/
SL.enterEmail = {
  elm: $id("enterEmail"),

  sendAddress: function() {
    if ($id("email").value != "") {
      location.hash = "#sendEmail";
      var xdr = SL.getXHR();
      xdr.onload = function() {
        $id("email").value = "";
        location.hash= "#items";
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
      xdr.open("POST", "http://www.theochevalier.fr/app/php/email.php");
      xdr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xdr.send(data);
    }
  }
}

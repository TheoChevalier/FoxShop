
/*******************************************************************************
 * enterEmail
 ******************************************************************************/
SL.enterEmail = {
  elm: SL.id("enterEmail"),
}

// Display a notification to the user during 3s
function displayStatus(id) {
  var status = SL.id("status");
  SL.show("status");
  status.innerHTML = "<p>"+_(id)+"</p>";
  status.style.zIndex = 100;
  setTimeout(function() {SL.hide("status")}, 3000);
}

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

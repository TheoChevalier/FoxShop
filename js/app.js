
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

// Actions that needs the DB to be ready
function finishInit() {
  // Load all the DB in obj
  DB.updateObj("Settings");
  DB.updateObj("Items");
  // Display the view
  SL.Lists.init();
}

var db;

window.addEventListener("localized", function() {
  SL.hide("loader");
  if(typeof db == "undefined") {
    DB.openDb();
    addEventListeners();
  }
});

// Manage App Cache updates
window.applicationCache.addEventListener('updateready', function(e) {
  if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
    // Browser downloaded a new app cache.
    // Swap it in and reload the page to get the new hotness.
    console.log("update cache");
    window.applicationCache.swapCache();
    window.location.reload();
  }
}, false);


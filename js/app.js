
// Actions that needs the DB to be ready
function finishInit() {
  // Display the view
  SL.Lists.init();

  // Load all the DB in obj
  DB.updateObj("Settings");
  DB.updateObj("Items");
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


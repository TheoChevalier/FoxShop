
// Display a notification to the user during 3s
SL.id("status").addEventListener("animationend", hideStatus, false);

function displayStatus(id) {
  var status = SL.id("status");
  SL.show("status");
  status.innerHTML = "<p>"+_(id)+"</p>";
  SL.id("status").className ="slideIn";
  setTimeout(function() {
    SL.id("status").className = "slideOut";
  }, 3000);
}

function hideStatus() {
  if (SL.id("status").className == "slideOut") {
    SL.hide("status");
  }
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


SL.Settings = {
  init: function(aView) {
    document.getElementById("title").innerHTML = "Settings";
    SL.action("settingsPanel", "show");
    SL.action("back", "show");
    document.getElementById("back").addEventListener("click", function(e) {
      SL.Settings.close();
      aView.init();
    });
  },
  close: function() {
    SL.action("settingsPanel", "hide");
    SL.action("back", "hide");
  }

}


/*******************************************************************************
 * ItemView
 ******************************************************************************/
SL.ItemView = {
  elm: SL.id("itemView"),
  name: "ItemView",
  init: function(aItem) {
    SL.hide("items");
    SL.show("itemView");
    SL.view = this.name;
    this.item = aItem;
    this.elm.getElementsByClassName("title")[0].innerHTML = this.item.name;
    SL.id("newItemName").value = this.item.name;
    SL.id("newItemQty").value = this.item.nb;

    if (typeof SL.Settings.obj["prices-enable"] !== "undefined") {
      if (SL.Settings.obj["prices-enable"].value) {
        SL.id("newPrice").removeAttribute("hidden");
        if (typeof this.item.price != "undefined") {
          SL.id("newItemPrice").value = this.item.price;
        } else {
          SL.id("newItemPrice").value = "";
        }
      }
    } else {
      SL.id("newPrice").setAttribute("hidden", "");
    }
  },
  plusOne: function() {
    SL.id("newItemQty").value = eval(SL.id("newItemQty").value) + 1;
  },
  lessOne: function() {
    var current = eval(SL.id("newItemQty").value);
    if (current > 0) {
      SL.id("newItemQty").value = current - 1;
    }
  },

  //Save current item into DB
  save: function() {
    var item = this.item;
    item.name = SL.id("newItemName").value;
    item.nb = eval(SL.id("newItemQty").value);
    item.price = eval(SL.id("newItemPrice").value);
    DB.deleteFromDB(item.guid, SL.Items);
    DB.store(item, SL.Items);
    this.refreshItem();
  },
  refreshItem: function() {
    var node = SL.Items.elm.querySelector('li[data-listkey="'+this.item.guid+'"]');
    node.getElementsByTagName("p")[0].innerHTML = this.item.name;
    node.getElementsByTagName("p")[1].innerHTML = _("item-quantity", { "quantity" : this.item.nb});
  }
}
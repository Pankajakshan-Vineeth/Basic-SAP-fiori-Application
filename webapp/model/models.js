sap.ui.define(["sap/ui/model/json/JSONModel"], function (JSONModel) {
  "use strict";

  return {
    creatingUserModel: function () {
      var oUserModel = new JSONModel({
        users: [],
      });
      return oUserModel;
    },
  };
});

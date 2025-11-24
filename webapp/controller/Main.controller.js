sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "userdetails/model/models",
  ],
  function (
    Controller,
    MessageToast,
    MessageBox,
    Fragment,
    Filter,
    FilterOperator,
    models
  ) {
    "use strict";

    return Controller.extend("userdetails.controller.Main", {
      onInit: function () {
        var oUserModel = models.creatingUserModel();
        this.getView().setModel(oUserModel, "userModel");
      },

      //  SEARCH  function

      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue") || "";
        var oTable = this.byId("userTable");
        var oBinding = oTable.getBinding("items");

        var aFilters = [];

        if (sQuery) {
          var oFilter = new Filter({
            filters: [
              new Filter("name", FilterOperator.Contains, sQuery),
              new Filter("email", FilterOperator.Contains, sQuery),
            ],
            and: false,
          });

          aFilters.push(oFilter);
        }

        oBinding.filter(aFilters);
      },

      // Open Add User Dialog
      onOpenAddUserDialog: function () {
        var oView = this.getView();

        if (!this._pDialog) {
          this._pDialog = Fragment.load({
            id: oView.getId(),
            name: "userdetails.view.fragments.AddUser",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }

        this._pDialog.then(function (oDialog) {
          oDialog.open();
        });
      },

      // Validate Name
      onNameChange: function (oEvent) {
        var oInput = oEvent.getSource();
        var sValue = oInput.getValue().trim();
        var nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
        if (!sValue) return;

        if (!nameRegex.test(sValue)) {
          MessageToast.show("Name should contain only alphabets");
          oInput.setValue("");
          setTimeout(function () {
            oInput.focus();
          }, 150);
        }
      },

      // Validate Mobile Number
      onMobileChange: function (oEvent) {
        var sValue = oEvent.getParameter("value").trim();
        if (!sValue) return;

        if (sValue.startsWith("0")) {
          MessageToast.show("Mobile number should not start with 0");
          oEvent.getSource().setValue("");
          return;
        }

        if (!/^[0-9]+$/.test(sValue)) {
          MessageToast.show("Only digits are allowed");
          oEvent.getSource().setValue("");
          return;
        }

        if (sValue.length !== 10) {
          MessageToast.show("Mobile number must be exactly 10 digits");
          oEvent.getSource().setValue("");
        }
      },

      onSubmit: function () {
        const oView = this.getView();
        const oDialog = oView.byId("addUserDialog");

        var oModel = oView.getModel("userModel");
        var aUsers = oModel.getProperty("/users");

        var sName = oView.byId("nameInput").getValue().trim();
        var sMobile = oView.byId("mobileInput").getValue().trim();
        var sEmail = oView.byId("emailInput").getValue().trim();

        if (!sName || !sMobile || !sEmail) {
          return MessageToast.show("Please fill all fields");
        }

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sEmail)) {
          return MessageToast.show("Enter a valid email");
        }

        aUsers.push({ name: sName, mobile: sMobile, email: sEmail });
        oModel.setProperty("/users", aUsers);

        MessageToast.show("User added successfully!");
        this._resetForm();
        oDialog.close();
      },

      onCancel: function () {
        this._resetForm();
        this.getView().byId("addUserDialog").close();
      },

      _resetForm: function () {
        const oView = this.getView();
        oView.byId("nameInput").setValue("");
        oView.byId("mobileInput").setValue("");
        oView.byId("emailInput").setValue("");
      },

      // Delete user
      onDelete: function (oEvent) {
        const oView = this.getView();
        var oModel = oView.getModel("userModel");
        var sPath = oEvent.getSource().getBindingContext("userModel").getPath();
        var aUsers = oModel.getProperty("/users");
        var iIndex = parseInt(sPath.split("/").pop(), 10);

        MessageBox.confirm("Delete this user?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.YES) {
              aUsers.splice(iIndex, 1);
              oModel.setProperty("/users", aUsers);
              MessageToast.show("User deleted");
            }
          },
        });
      },
    });
  }
);

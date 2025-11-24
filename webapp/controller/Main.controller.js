sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "userdetails/model/models",
  ],
  function (Controller, MessageToast, MessageBox, Fragment, models) {
    "use strict";

    return Controller.extend("userdetails.controller.Main", {
      onInit: function () {
        var oUserModel = models.creatingUserModel();
        this.getView().setModel(oUserModel, "userModel");
      },

      // Open Add User Fragment Dialog
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

      // Validate Name on change
      onNameChange: function (oEvent) {
        var oInput = oEvent.getSource();
        var sValue = oInput.getValue().trim();
        var nameRegex = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/;
        if (!sValue) return;

        // If invalid input detected
        if (!nameRegex.test(sValue)) {
          MessageToast.show("Name should contain only alphabets");
          oInput.setValue("");
          setTimeout(function () {
            oInput.focus();
          }, 150);

          oEvent.preventDefault();
          oEvent.cancelBubble = true;
        }
      },

      // Validate Mobile on change
      onMobileChange: function (oEvent) {
        var sValue = oEvent.getParameter("value").trim();

        if (!sValue) return; // allow empty

        // Should not start with 0
        if (sValue.startsWith("0")) {
          MessageToast.show("Mobile number should not start with 0");
          oEvent.getSource().setValue("");
          setTimeout(function () {
            oEvent.getSource().focus();
          }, 100);
          return;
        }

        // Must contain only digits
        if (!/^[0-9]+$/.test(sValue)) {
          MessageToast.show("Only digits are allowed in Mobile Number");
          oEvent.getSource().setValue("");
          setTimeout(function () {
            oEvent.getSource().focus();
          }, 100);
          return;
        }

        // Must be 10 digits
        if (sValue.length !== 10) {
          MessageToast.show("Mobile number must be exactly 10 digits");
          oEvent.getSource().setValue("");
          setTimeout(function () {
            oEvent.getSource().focus();
          }, 100);
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

        // Validate all required fields

        if (!sName && !sMobile && !sEmail) {
          return MessageToast.show("Please fill all the fields");
        } else if (!sName) {
          return MessageToast.show("Please fill the Name field");
        } else if (!sMobile) {
          return MessageToast.show("Please fill the Mobile Number");
        } else if (!sEmail) {
          return MessageToast.show("Please fill the Email field");
        }

        // Email validation

        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(sEmail)) {
          return MessageToast.show("Please enter a valid Email address");
        }

        // Add new user
        aUsers.push({ name: sName, mobile: sMobile, email: sEmail });
        oModel.setProperty("/users", aUsers);
        MessageToast.show("User added successfully!");

        // Reset form
        this._resetForm();

        // Close dialog
        oDialog.close();
      },

      // Cancel Button
      onCancel: function () {
        this._resetForm();
        this.getView().byId("addUserDialog").close();
      },

      // Reset input fields
      _resetForm: function () {
        const oView = this.getView();
        oView.byId("nameInput").setValue("");
        oView.byId("mobileInput").setValue("");
        oView.byId("emailInput").setValue("");
      },

      // Delete functionality
      onDelete: function (oEvent) {
        const oView = this.getView();
        var oModel = oView.getModel("userModel");
        var sPath = oEvent.getSource().getBindingContext("userModel").getPath();
        var aUsers = oModel.getProperty("/users");
        var iIndex = parseInt(sPath.split("/").pop(), 10);

        MessageBox.confirm("Are you sure you want to delete this user?", {
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          emphasizedAction: MessageBox.Action.YES,
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.YES) {
              aUsers.splice(iIndex, 1);
              oModel.setProperty("/users", aUsers);
              MessageToast.show("User deleted successfully!");
            }
          },
        });
      },
    });
  }
);

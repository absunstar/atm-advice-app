app.controller("contactUs", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.contactUs = {};

  $scope.displayAddContactUs = function () {
    $scope.error = '';
    $scope.contactUs = {
      image_url: '/images/contactUs.png',
      active: true
    };

    site.showModal('#contactUsAddModal');

  };

  $scope.addContactUs = function () {
    $scope.error = '';
    const v = site.validated('#contactUsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/contactUs/add",
      data: $scope.contactUs
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#contactUsAddModal');
          $scope.getContactUsList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateContactUs = function (contactUs) {
    $scope.error = '';
    $scope.viewContactUs(contactUs);
    $scope.contactUs = {};
    site.showModal('#contactUsUpdateModal');
  };

  $scope.updateContactUs = function () {
    $scope.error = '';
    const v = site.validated('#contactUsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/contactUs/update1",
      data: $scope.contactUs
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#contactUsUpdateModal');
          $scope.getContactUsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsContactUs = function (contactUs) {
    $scope.error = '';
    $scope.viewContactUs(contactUs);
    $scope.contactUs = {};
    site.showModal('#contactUsViewModal');
  };

  $scope.viewContactUs = function (contactUs) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/contactUs/view",
      data: {
        id: contactUs.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.contactUs = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteContactUs = function (contactUs) {
    $scope.error = '';
    $scope.viewContactUs(contactUs);
    $scope.contactUs = {};
    site.showModal('#contactUsDeleteModal');
  };

  $scope.deleteContactUs = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/contactUs/delete1",
      data: {
        id: $scope.contactUs.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#contactUsDeleteModal');
          $scope.getContactUsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getContactUsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/contactUs/search",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#contactUsSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "contactUs"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#contactUsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getContactUsList($scope.search);
    site.hideModal('#contactUsSearchModal');
    $scope.search = {};
  };

  $scope.getContactUsList();
});
app.controller("settings", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.settings = {};

  $scope.displayAddSettings = function () {
    $scope.error = '';
    $scope.settings = {
      image_url: '/images/settings.png',
      active: true
    };

    site.showModal('#settingsAddModal');

  };

  $scope.addSettings = function () {
    $scope.error = '';
    const v = site.validated('#settingsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/settings/add",
      data: $scope.settings
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#settingsAddModal');
          $scope.getSettingsList();
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

  $scope.displayUpdateSettings = function (settings) {
    $scope.error = '';
    $scope.viewSettings(settings);
    $scope.settings = {};
    site.showModal('#settingsUpdateModal');
  };

  $scope.updateSettings = function () {
    $scope.error = '';
    const v = site.validated('#settingsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/settings/update1",
      data: $scope.settings
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#settingsUpdateModal');
          $scope.getSettingsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsSettings = function (settings) {
    $scope.error = '';
    $scope.viewSettings(settings);
    $scope.settings = {};
    site.showModal('#settingsViewModal');
  };

  $scope.viewSettings = function (settings) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/settings/view",
      data: {
        id: settings.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.settings = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSettings = function (settings) {
    $scope.error = '';
    $scope.viewSettings(settings);
    $scope.settings = {};
    site.showModal('#settingsDeleteModal');
  };

  $scope.deleteSettings = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/settings/delete1",
      data: {
        id: $scope.settings.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#settingsDeleteModal');
          $scope.getSettingsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getSettingsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/settings/search",
      data:where 
    }).then(
      function (response) {
        $scope.busy = false;
        if ( response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#settingsSearchModal');
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
        screen: "settings"
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
    site.showModal('#settingsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getSettingsList($scope.search);
    site.hideModal('#settingsSearchModal');
    $scope.search = {};
  };

  $scope.getSettingsList();
});
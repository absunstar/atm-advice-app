app.controller("address", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.address = {};

  $scope.displayAddAddress = function () {
    $scope.error = '';
    $scope.address = {
      image_url: '/images/address.png',
      active: true
    };

    site.showModal('#addressAddModal');

  };

  $scope.addAddress = function () {
    $scope.error = '';
    const v = site.validated('#addressAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/address/add",
      data: $scope.address
    }).then(
      function (response) {
        $scope.busy = false;
        console.log(response.data);
        if (response.data.done) {
          site.hideModal('#addressAddModal');
          $scope.getAddressList();
        } else {
          $scope.error = response.data.error;
          
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAddress = function (address) {
    $scope.error = '';
    $scope.viewAddress(address);
    $scope.address = {};
    site.showModal('#addressUpdateModal');
  };

  $scope.updateAddress = function () {
    $scope.error = '';
    const v = site.validated('#addressUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/address/update1",
      data: $scope.address
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addressUpdateModal');
          $scope.getAddressList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAddress = function (address) {
    $scope.error = '';
    $scope.viewAddress(address);
    $scope.address = {};
    site.showModal('#addressViewModal');
  };

  $scope.viewAddress = function (address) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/address/view",
      data: {
        id: address.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.address = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAddress = function (address) {
    $scope.error = '';
    $scope.viewAddress(address);
    $scope.address = {};
    site.showModal('#addressDeleteModal');
  };

  $scope.deleteAddress = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/address/delete1",
      data: {
        id: $scope.address.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addressDeleteModal');
          $scope.getAddressList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAddressList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/address/search",
      data:where 
    }).then(
      function (response) {
        $scope.busy = false;
        console.log(response.data);
       
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#addressSearchModal');
          $scope.search = {};

        
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
        screen: "address"
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
    site.showModal('#addressSearchModal');

  };

  $scope.getGovesList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/gov",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1, name_ar: 1, name_en: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.govesList = response.data.docs;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCitiesList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/city",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1, name_ar: 1, name_en: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.citiesList = response.data.docs;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {

    $scope.getAddressList($scope.search);
    site.hideModal('#addressSearchModal');
    $scope.search = {};
  };
  $scope.getAddressList();
  $scope.getGovesList();
  $scope.getCitiesList()
});
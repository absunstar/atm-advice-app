app.controller("pharmacy", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.pharmacy = {};

  $scope.displayAddPharmacy = function () {
    $scope.error = '';
    $scope.pharmacy = {
      image_url: '/images/pharmacy.png',
      active: true
    };

    site.showModal('#pharmacyAddModal');

  };

  $scope.addPharmacy = function () {
    $scope.error = '';
    const v = site.validated('#pharmacyAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/pharmacy/add",
      data: $scope.pharmacy
    }).then(
      function (response) {
        $scope.busy = false;
       
          site.hideModal('#pharmacyAddModal');
          $scope.getPharmacyList();
      
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdatePharmacy = function (pharmacy) {
    $scope.error = '';
    $scope.viewPharmacy(pharmacy);
    $scope.pharmacy = {};
    site.showModal('#pharmacyUpdateModal');
  };

  $scope.updatePharmacy = function () {
    $scope.error = '';
    const v = site.validated('#pharmacyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/pharmacy/update1",
      data: $scope.pharmacy
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#pharmacyUpdateModal');
          $scope.getPharmacyList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsPharmacy = function (pharmacy) {
    $scope.error = '';
    $scope.viewPharmacy(pharmacy);
    $scope.pharmacy = {};
    site.showModal('#pharmacyViewModal');
  };

  $scope.viewPharmacy = function (pharmacy) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/pharmacy/view",
      data: {
        id: pharmacy.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.pharmacy = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletePharmacy = function (pharmacy) {
    $scope.error = '';
    $scope.viewPharmacy(pharmacy);
    $scope.pharmacy = {};
    site.showModal('#pharmacyDeleteModal');
  };

  $scope.deletePharmacy = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/pharmacy/delete1",
      data: {
        id: $scope.pharmacy.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#pharmacyDeleteModal');
          $scope.getPharmacyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getPharmacyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/pharmacy/search",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#pharmacySearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )
  };

  $scope.getNotActivePharmacy = function (where) {
    $scope.busy = true;
    $scope.ph_not_active_list = [];
    $http({
      method: "POST",
      url: "/api/pharmacy/getNotActivePharmacy",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.ph_not_active_list = response.data.docs;
          $scope.count = response.data.totalDocs;
          $scope.search = {};

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
    site.showModal('#pharmacySearchModal');

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

    $scope.getPharmacyList($scope.search);
    site.hideModal('#pharmacySearchModal');
    $scope.search = {};
  };

  $scope.getNotActivePharmacy();
  $scope.getPharmacyList();
  $scope.getGovesList();
  $scope.getCitiesList()
});
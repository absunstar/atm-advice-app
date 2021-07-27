app.controller("insuranceCompany", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.insuranceCompany = {};

  $scope.displayAddInsuranceCompany = function () {
    $scope.error = '';
    $scope.insuranceCompany = {
      image_url: '/images/insuranceCompany.png',
      active: true
    };

    site.showModal('#insuranceCompanyAddModal');

  };

  $scope.addInsuranceCompany = function () {
    $scope.error = '';
    const v = site.validated('#insuranceCompanyAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insuranceCompany/add",
      data: $scope.insuranceCompany
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#insuranceCompanyAddModal');
          $scope.getInsuranceCompanyList();
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

  $scope.displayUpdateInsuranceCompany = function (insuranceCompany) {
    $scope.error = '';
    $scope.viewInsuranceCompany(insuranceCompany);
    $scope.insuranceCompany = {};
    site.showModal('#insuranceCompanyUpdateModal');
  };

  $scope.updateInsuranceCompany = function () {
    $scope.error = '';
    const v = site.validated('#insuranceCompanyUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/insuranceCompany/update1",
      data: $scope.insuranceCompany
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#insuranceCompanyUpdateModal');
          $scope.getInsuranceCompanyList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsInsuranceCompany = function (insuranceCompany) {
    $scope.error = '';
    $scope.viewInsuranceCompany(insuranceCompany);
    $scope.insuranceCompany = {};
    site.showModal('#insuranceCompanyViewModal');
  };

  $scope.viewInsuranceCompany = function (insuranceCompany) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/insuranceCompany/view",
      data: {
        id: insuranceCompany.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.insuranceCompany = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteInsuranceCompany = function (insuranceCompany) {
    $scope.error = '';
    $scope.viewInsuranceCompany(insuranceCompany);
    $scope.insuranceCompany = {};
    site.showModal('#insuranceCompanyDeleteModal');
  };

  $scope.deleteInsuranceCompany = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/insuranceCompany/delete1",
      data: {
        id: $scope.insuranceCompany.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#insuranceCompanyDeleteModal');
          $scope.getInsuranceCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getInsuranceCompanyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/insuranceCompany/search",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#insuranceCompanySearchModal');
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
    site.showModal('#insuranceCompanySearchModal');

  };

  $scope.searchAll = function () {

    $scope.getInsuranceCompanyList($scope.search);
    site.hideModal('#insuranceCompanySearchModal');
    $scope.search = {};
  };

  $scope.getInsuranceCompanyList();

});
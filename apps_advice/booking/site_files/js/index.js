app.controller("booking", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.booking = {};

  $scope.getspecialtyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/departments/search",
      data: where,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.specialtyList = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal("#govSearchModal");
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGovesList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/gov",
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
        },
      },
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
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/search",
      data: {
        "gov.id": gov.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.cityList = response.data.docs;
        }
        console.log($scope.cityList);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getspecialtyList();
  $scope.getGovesList();
});

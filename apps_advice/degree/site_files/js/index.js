app.controller("degree", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.degree = {};

  $scope.displayAddDegree = function () {
    $scope.error = '';
    $scope.degree = {
      image_url: '/images/degree.png',
      active: true
    };

    site.showModal('#degreeAddModal');

  };

  $scope.addDegree = function () {
    $scope.error = '';
    const v = site.validated('#degreeAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/degree/add",
      data: $scope.degree
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#degreeAddModal');
          $scope.getDegreeList();
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

  $scope.displayUpdateDegree = function (degree) {
    $scope.error = '';
    $scope.viewDegree(degree);
    $scope.degree = {};
    site.showModal('#degreeUpdateModal');
  };

  $scope.updateDegree = function () {
    $scope.error = '';
    const v = site.validated('#degreeUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/degree/update1",
      data: $scope.degree
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#degreeUpdateModal');
          $scope.getDegreeList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDegree = function (degree) {
    $scope.error = '';
    $scope.viewDegree(degree);
    $scope.degree = {};
    site.showModal('#degreeViewModal');
  };

  $scope.viewDegree = function (degree) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/degree/view",
      data: {
        id: degree.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.degree = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteDegree = function (degree) {
    $scope.error = '';
    $scope.viewDegree(degree);
    $scope.degree = {};
    site.showModal('#degreeDeleteModal');
  };

  $scope.deleteDegree = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/degree/delete1",
      data: {
        id: $scope.degree.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#degreeDeleteModal');
          $scope.getDegreeList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDegreeList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/degree/search",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#degreeSearchModal');
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
        screen: "degree"
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
    site.showModal('#degreeSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getDegreeList($scope.search);
    site.hideModal('#degreeSearchModal');
    $scope.search = {};
  };

  $scope.getDegreeList();
});
app.controller("departments", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.department = {};

  $scope.displayAddDepartment = function () {
    $scope.error = '';
    $scope.department = {
      image_url: '/images/department.png',
      active: true
    };

    site.showModal('#departmentAddModal');

  };

  $scope.addDepartment = function () {
    $scope.error = '';
    const v = site.validated('#departmentAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/departments/add",
      data: $scope.department
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#departmentAddModal');
          $scope.getDepartmentList();
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

  $scope.displayUpdateDepartment = function (department) {
    $scope.error = '';
    $scope.viewDepartment(department);
    $scope.department = {};
    site.showModal('#departmentUpdateModal');
  };

  $scope.updateDepartment = function () {
    $scope.error = '';
    const v = site.validated('#departmentUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/departments/update1",
      data: $scope.department
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#departmentUpdateModal');
          $scope.getDepartmentList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDepartment = function (department) {
    $scope.error = '';
    $scope.viewDepartment(department);
    $scope.department = {};
    site.showModal('#departmentViewModal');
  };

  $scope.viewDepartment = function (department) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/departments/view",
      data: {
        id: department.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.department = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteDepartment = function (department) {
    $scope.error = '';
    $scope.viewDepartment(department);
    $scope.department = {};
    site.showModal('#departmentDeleteModal');
  };

  $scope.deleteDepartment = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/departments/delete1",
      data: {
        id: $scope.department.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#departmentDeleteModal');
          $scope.getDepartmentList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDepartmentList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/departments/search",
      data: where 
    }).then(
      function (response) {
        $scope.busy = false;
        console.log(response.data);
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs||0;
          site.hideModal('#departmentSearchModal');
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
    site.showModal('#departmentSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getDepartmentList($scope.search);
    site.hideModal('#departmentSearchModal');
    $scope.search = {};
  };

  $scope.getDepartmentList();
});
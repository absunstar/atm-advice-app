app.controller("consultationDoctors", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.consultationDoctors = {};

  $scope.displayAddConsultationDoctors = function () {
    $scope.error = '';
    $scope.consultationDoctors = {
      image_url: '/images/consultationDoctors.png',
      active: true
    };

    site.showModal('#consultationDoctorsAddModal');

  };

  $scope.addConsultationDoctors = function () {
    $scope.error = '';
    const v = site.validated('#consultationDoctorsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/consultationDoctors/add",
      data: $scope.consultationDoctors
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#consultationDoctorsAddModal');
          $scope.getConsultationDoctorsList();
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

  $scope.displayUpdateConsultationDoctors = function (consultationDoctors) {
    $scope.error = '';
    $scope.viewConsultationDoctors(consultationDoctors);
    $scope.consultationDoctors = {};
    site.showModal('#consultationDoctorsUpdateModal');
  };

  $scope.updateConsultationDoctors = function () {
    $scope.error = '';
    const v = site.validated('#consultationDoctorsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/consultationDoctors/update1",
      data: $scope.consultationDoctors
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#consultationDoctorsUpdateModal');
          $scope.getConsultationDoctorsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsConsultationDoctors = function (consultationDoctors) {
    $scope.error = '';
    $scope.viewConsultationDoctors(consultationDoctors);
    $scope.consultationDoctors = {};
    site.showModal('#consultationDoctorsViewModal');
  };

  $scope.viewConsultationDoctors = function (consultationDoctors) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/consultationDoctors/view",
      data: {
        id: consultationDoctors.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.consultationDoctors = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteConsultationDoctors = function (consultationDoctors) {
    $scope.error = '';
    $scope.viewConsultationDoctors(consultationDoctors);
    $scope.consultationDoctors = {};
    site.showModal('#consultationDoctorsDeleteModal');
  };

  $scope.deleteConsultationDoctors = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/consultationDoctors/delete1",
      data: {
        id: $scope.consultationDoctors.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#consultationDoctorsDeleteModal');
          $scope.getConsultationDoctorsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getConsultationDoctorsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/consultationDoctors/search",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#consultationDoctorsSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )
  };

  $scope.getGenderList = function () {
    $scope.genderList = [{name_ar:"ذكر", name_en:"male"},{name_ar:"انثى", name_en:"female"}];
    
  };
  $scope.getDepartmentsList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/departments",
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
          $scope.departmentList = response.data.docs;

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
    site.showModal('#consultationDoctorsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getConsultationDoctorsList($scope.search);
    site.hideModal('#consultationDoctorsSearchModal');
    $scope.search = {};
  };

  $scope.getConsultationDoctorsList();
  $scope.getGenderList();
  $scope.getDepartmentsList();
});
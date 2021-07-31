app.controller("doctors", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.doctors = {};

  $scope.displayAddDoctors = function () {
    $scope.error = '';
    $scope.doctors = {
      image_url: '/images/doctors.png',
      active: true
    };

    site.showModal('#doctorsAddModal');

  };

  $scope.addDoctors = function () {
    $scope.error = '';
    const v = site.validated('#doctorsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors/add",
      data: $scope.doctors
    }).then(
      function (response) {
        $scope.busy = false;
       
          site.hideModal('#doctorsAddModal');
          $scope.getDoctorsList();
        
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateDoctors = function (doctors) {
    $scope.error = '';
    $scope.viewDoctors(doctors);
    $scope.doctors = {};
    site.showModal('#doctorsUpdateModal');
  };

  $scope.updateDoctors = function () {
    $scope.error = '';
    const v = site.validated('#doctorsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors/update1",
      data: $scope.doctors
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#doctorsUpdateModal');
          $scope.getDoctorsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsDoctors = function (doctors) {
    $scope.error = '';
    $scope.viewDoctors(doctors);
    $scope.doctors = {};
    site.showModal('#doctorsViewModal');
  };

  $scope.viewDoctors = function (doctors) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/doctors/view",
      data: {
        id: doctors.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.doctors = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteDoctors = function (doctors) {
    $scope.error = '';
    $scope.viewDoctors(doctors);
    $scope.doctors = {};
    site.showModal('#doctorsDeleteModal');
  };

  $scope.deleteDoctors = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/doctors/delete1",
      data: {
        id: $scope.doctors.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#doctorsDeleteModal');
          $scope.getDoctorsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDoctorsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/doctors/search",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#doctorsSearchModal');
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


  $scope.getDegreeList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/degree",
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
          $scope.degreesList = response.data.docs;

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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#doctorsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getDoctorsList($scope.search);
    site.hideModal('#doctorsSearchModal');
    $scope.search = {};
  };

  $scope.getDoctorsList();
  $scope.getGenderList();
  $scope.getDepartmentsList();
  $scope.getDegreeList();
  $scope.getCitiesList()
});
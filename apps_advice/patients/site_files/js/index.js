app.controller("patients", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.patients = {};

  $scope.displayAddPatients = function () {
    $scope.error = '';
    $scope.patients = {
      image_url: '/images/patients.png',
      card_url:"/images/cardImage.png",
      active: true,
      hasInsurance : false
    };

    site.showModal('#patientsAddModal');

  };
  


  $scope.getInsuranceCompanyList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/insuranceCompany",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1, name_ar: 1, name_en: 1 , balance : 1 , image : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.insuranceCompanyList = response.data.docs;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.addPatients = function () {
    $scope.error = '';
    const v = site.validated('#patientsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/patients/add",
      data: $scope.patients
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#patientsAddModal');
          $scope.getPatientsList();
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

  $scope.displayUpdatePatients = function (patients) {
    $scope.error = '';
    $scope.viewPatients(patients);
    $scope.patients = {};
    site.showModal('#patientsUpdateModal');
  };

  $scope.updatePatients = function () {
    $scope.error = '';
    const v = site.validated('#patientsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/patients/update1",
      data: $scope.patients
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#patientsUpdateModal');
          $scope.getPatientsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsPatients = function (patients) {
    $scope.error = '';
    $scope.viewPatients(patients);
    $scope.patients = {};
    site.showModal('#patientsViewModal');
  };

  $scope.viewPatients = function (patients) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/patients/view",
      data: {
        id: patients.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.patients = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeletePatients = function (patients) {
    $scope.error = '';
    $scope.viewPatients(patients);
    $scope.patients = {};
    site.showModal('#patientsDeleteModal');
  };

  $scope.deletePatients = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/patients/delete1",
      data: {
        id: $scope.patients.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#patientsDeleteModal');
          $scope.getPatientsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getPatientsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/patients/search",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#patientsSearchModal');
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
    site.showModal('#patientsSearchModal');
  };

  $scope.getGenderList = function () {
    $scope.genderList = [{name_ar:"ذكر", name_en:"male"},{name_ar:"انثى", name_en:"female"}];
    
  };

  $scope.searchAll = function () {

    $scope.getPatientsList($scope.search);
    site.hideModal('#patientsSearchModal');
    $scope.search = {};
  };

  $scope.getGenderList ();
  $scope.getPatientsList();
  $scope.getInsuranceCompanyList();
});
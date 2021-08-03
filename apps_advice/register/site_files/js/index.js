app.controller("register", function ($scope, $http, $timeout) {

  $scope.register = {};

  $scope.getregisterList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/register/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#registerearchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.displayAddregister = function () {
    $scope.error = '';
    $scope.register = {
      image_url: '/images/register.png',
      active: true

    };
    site.showModal('#registerAddModal');

  };
 
  $scope.displayAddpatient = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.patient = {
      image_url: '/images/Patients.png',
    };
    site.showModal('#registerAddPatient');
  };

  $scope.displayAddPatients = function () {
    $scope.error = '';
    $scope.patients = {
      image_url: '/images/patients.png',
      card_url: "/images/cardImage.png",
      active: true,
      hasInsurance: false
    };

    site.showModal('#patientsAddModal');

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


  $scope.addPatient = function () {
    $scope.error = '';
    const v = site.validated('#registerAddPatient');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    if ($scope.patient.patient_password != $scope.patient.patient_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };
    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.patient
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddPatient');
          $scope.patient = [];

          $scope.getregisterList();
          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddHospital = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.hospital = {
      image_url: '/images/hospital.png',
    };
    site.showModal('#registerAddHospital');

  };

  $scope.addHospital = function () {
    $scope.error = '';

    if ($scope.busy) {
      return;
    };
    $scope.busy = true;

    const v = site.validated('#registerAddHospital');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.hospital.hospital_password != $scope.hospital.hospital_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.hospital
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddHospital');
          $scope.hospital = [];
          $scope.getregisterList();

          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddPharmacy = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.pharmacy = {
      image_url: '/images/pharmacy.png',
    };
    site.showModal('#registerAddPharmacy');

  };

  $scope.addPharmacy = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    $scope.busy = true;

    const v = site.validated('#registerAddPharmacy');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.pharmacy.pharmacy_password != $scope.pharmacy.pharmacy_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.pharmacy
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddPharmacy');
          $scope.pharmacy = [];

          $scope.getregisterList();
          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddClinic = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.clinic = {
      image_url: '/images/clinic.png'
    };
    site.showModal('#registerAddClinic');

  };

  $scope.addClinic = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#registerAddClinic');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.clinic.clinic_password != $scope.clinic.clinic_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.clinic,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddClinic');
          $scope.clinic = [];
          $scope.getregisterList();
          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddScanCenters = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.scan_center = {
      image_url: '/images/scan_center.png',
    };
    site.showModal('#registerAddScanCenter');

  };

  $scope.addScanCenters = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#registerAddScanCenter');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.scan_center.scan_center_password != $scope.scan_center.scan_center_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.scan_center
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddScanCenter');
          $scope.scan_center = [];
          
          $scope.getregisterList();
          document.location.href = '/';
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddAnalysesCenters = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.analyses_center = {
      image_url: '/images/analyses_center.png',
    };
    site.showModal('#registerAddAnalysesCenter');

  };

  $scope.addAnalysesCenters = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#registerAddAnalysesCenter');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.analyses_center.analyses_center_password != $scope.analyses_center.analyses_center_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.analyses_center
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddAnalysesCenter');
          $scope.analyses_center = [];

          $scope.getregisterList();
          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddInsuranceCompany = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.insurance_company = {
      image_url: '/images/medical_insurance_company.png',
    };
    site.showModal('#registerAddInsuranceCompany');

  };

  $scope.addInsuranceCompany = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#registerAddInsuranceCompany');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.insurance_company.insurance_company_password != $scope.insurance_company.insurance_company_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.insurance_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddInsuranceCompany');
          $scope.insurance_company = [];

          $scope.getregisterList();
          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddDoctors = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.doctor = {
      image_url: '/images/doctor.png',
    };
    site.showModal('#registerAddDoctor');

  };

  $scope.addDoctors = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#registerAddDoctor');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.doctor.doctor_password != $scope.doctor.doctor_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.doctor
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddDoctor');
          $scope.doctor = [];
          $scope.getregisterList();
          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayAddNursing = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.nursing = {
      image_url: '/images/nurse.png',
    };
    site.showModal('#registerAddNursing');

  };

  $scope.addNursing = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#registerAddNursing');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.nursing.nursing_password != $scope.nursing.nursing_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.nursing
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#registerAddNursing');
          $scope.nursing = [];
          $scope.getregisterList();
          document.location.href = '/';

        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getregisterList();

});
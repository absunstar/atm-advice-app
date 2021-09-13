app.controller("booking", function ($scope, $http, $timeout) {
 
  $scope._search = {};

  $scope.booking = {
    filter:{},
    patient:{},
    cardImage:[
      {
        name: "/images/id-card.svg ",
      }
    ]
  };

  $scope.confirmBooking = function () {
    $scope.error = "";
    /* const v = site.validated("#ordersAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }*/
    let str = '##user.ref_info._id##';
      str = str.substr(1);
      str = str.substr(0, str.length - 1);
    $scope.booking.user = {
      _id: str,
    };
   
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/booking/add",
      data: $scope.booking,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.must_enter_code##";
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };





  $scope.doctorFilter = function (data) {
  
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/doctors/search",
      data: data,
    }).then(
      function (response) {
       
        if (response.data.data && response.data.data.docs && response.data.data.docs.length > 0) {
          
          $scope.DoctorsList =  [];
          for (const iterator of response.data.data.docs) {
           let xx =  parseInt(iterator.rating, 10);
           iterator.rating = xx;
            $scope.DoctorsList.push(iterator);
          }

        }
        if (response.data.data && response.data.data.docs && response.data.data.docs.length == 0) {
          
          $scope.DoctorsList =  [];
        }
       
      },
      function (err) {
        console.log(err);
      }
    );
  };





  $scope.getInsuranceCompanyList = function (where) {
    $scope.busy = true;
    $http({
      method: 'GET',
      url: '/api/insuranceCompany',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          balance: 1,
          image: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.insuranceCompanyList = response.data.docs;
          $scope.insuranceCompanyList.forEach((g) => {
            if (g.id == $scope.booking.patient.insuranceCompany.id) {
              $scope.booking.patient.insuranceCompany = g;
            }
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getspecialtyList = function (where) {
    $scope.busy = true;
    $scope.specialtyList = [];
    $http({
      method: "POST",
      url: "/api/departments/search",
      data: where,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.specialtyList = [
            ...$scope.specialtyList,
            ...response.data.docs,
          ];
          $scope.count = response.data.totalDocs;
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
    $scope.govesList = [];
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
    let where = {};
    if (gov) {
      where["gov"] = gov;
    }
    $scope.busy = true;
    $scope.cityList = [];
    $http({
      method: "POST",
      url: "/api/city/search",
      data: where,
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

  $scope.getDoctorsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "GET",
      url: "api/doctors",
      data: where,
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.data && response.data.data.docs && response.data.data.docs.length > 0) {
          
          $scope.DoctorsList =  [];
          for (const iterator of response.data.data.docs) {
           let xx =  parseInt(iterator.rating, 10);
           iterator.rating = xx;
            $scope.DoctorsList.push(iterator);
          }

        }
        if (response.data.data && response.data.data.docs && response.data.data.docs.length == 0) {
          
          $scope.DoctorsList =  [];
        }
        
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.bookTime = function (t) {
    $scope.booking.time = t.startSession;
    console.log("55555555555" , t);
    t.status = "unAvailable";
    document.querySelector("#step4").click();
  };

  $scope.getAppointmentsByDate = function () {
    let d = new Date($scope.booking.date2);
    d.setDate(d.getDate() + 1);
    $scope.booking.date = d.toISOString().split("T")[0];
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "api/doctors/getAppointmentsByDate",
      data: {
        doctor: { _id: $scope.booking.doctor._id },
        date: $scope.booking.date,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.booking.times = response.data.data;
        }
        console.log(response);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };



  $scope.getCurrentPatient = function () {
    let where = {};
  
    $scope.busy = true;
    
    $http({
      method: "POST",
      url: "api/patients/getProfile",
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         $scope.booking.patient = response.data.data;

        }
        
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  
  $scope.getspecialtyList();
  $scope.getGovesList();
  $scope.getCurrentPatient();
$scope.getInsuranceCompanyList();
$scope.getCityList();

document.querySelector(".searchDoctorBtn").click();
});

window.addEventListener('load' , ()=>{
  document.querySelector(".searchDoctorBtn").click();
})

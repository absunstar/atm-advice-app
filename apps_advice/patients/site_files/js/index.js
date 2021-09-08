app.controller("main", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.patients = {

    profile:{}
  };
  $scope.CurrentOrderList = {};
  $scope.canceledOrderList = {};
  $scope.previousOrderList = {};
  $scope.currentBookingList = {};
  $scope.doneBookingList = {};
  $scope.addresses = {};
  $scope.govesList = {};
  $scope.citiesList ={};

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

  $scope.getCitiesList = function (where) {
    if (!$scope.addresses.gov) {
      return false;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/getCityByGov/" + $scope.addresses.gov._id,
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.citiesList = response.data.data;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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
 



  $scope.myCurrentOrders = function (order) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/orders/getActiveOrders",
      data: {
        where: { 'user._id': '##user.ref_info._id##'  }

      }
    }).then(
      function (response) {
        console.log(response.data.data);
        $scope.busy = false;
        if (response.data.data && response.data.data.docs.length > 0) {
          $scope.currentOrderList =response.data.data.docs;
         
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
  $scope.myCanceledOrders = function (order) {
    $scope.busy = true;
    $scope.list = [];
    
    let str = '##user.ref_info._id##';
    let xx = {};
    xx.user = {_id : str};
    
    $http({
      method: "POST",
      url: "/api/orders/getCanceledOrdersByUser",
      data:xx
    }).then(
      function (response) {
        console.log(response.data);
        $scope.busy = false;
        if (response.data.data && response.data.data.docs.length > 0) {
          $scope.canceledOrderList =response.data.data.docs;
         
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
  $scope.myPreviousOrders = function (order) {
    $scope.busy = true;
    $scope.list = [];
    
    let str = '##user.ref_info._id##';
    let xx = {};
    xx.user = {_id : str};
    $http({
      method: "POST",
      url: "/api/orders/getShippedOrdersByUser",
      data:xx
    }).then(
      function (response) {
        console.log(response.data);
        $scope.busy = false;
        if (response.data.data && response.data.data.docs.length > 0) {
          $scope.previousOrderList =response.data.data.docs;
         
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

  $scope.cancelOrder = function (order) {
    console.log(order);
     $scope.busy = true;
     $scope.list = [];
     $http({
       method: "POST",
       url: "/api/orders/updateToStatusCanceled",
       data:order
     }).then(
       function (response) {
         $scope.busy = false;
         location.reload();
 
         if (response.data.data && response.data.data.docs.length > 0) {
           
           
         }
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
 
     )
   };


   $scope.reOrder = function (order) {
    console.log(order);
     $scope.busy = true;
     $scope.list = [];
     $http({
       method: "POST",
       url: "/api/orders/reOrderPreviousOrder",
       data:order
     }).then(
       function (response) {
         $scope.busy = false;
         location.reload();
 
         if (response.data.data && response.data.data.docs.length > 0) {
           
           
         }
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
 
     )
   };



   

   $scope.myCurrentBooking = function (order) {
    $scope.busy = true;
    $scope.list = [];
    let str = '##user.ref_info._id##';
    str = str.substr(1);
    str = str.substr(0, str.length - 1);
    let patient={};
    patient._id = str;
    console.log(patient._id);
    $http({
      method: "POST",
      url: "/api/booking/getPatientsCurrentBooking",
      data: {
        patient:{
          _id : patient._id
        },
        status : "accepted"
        

      }
    }).then(
      function (response) {
        console.log(response.data.data);
        $scope.busy = false;
        if (response.data.data && response.data.docs.length > 0) {
          $scope.currentBookingList =response.data.docs;
         
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

  $scope.myDoneBooking = function (order) {
    $scope.busy = true;
    $scope.list = [];
    let str = '##user.ref_info._id##';
    str = str.substr(1);
    str = str.substr(0, str.length - 1);
    let patient={};
    patient._id = str;
    $http({
      method: "POST",
      url: "/api/booking/getPatientsDoneBooking",
      data: {
        patient:{
          _id : patient._id
        },
        status : "done"
        

      }
    }).then(
      function (response) {
        console.log(response.data.data);
        $scope.busy = false;
        if (response.data.data && response.data.docs.length > 0) {
          $scope.currentBookingList =response.data.docs;
         
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

 

  $scope.myLocation = function () {
     $scope.busy = true;
     $scope.list = [];
     let str = '##user.ref_info._id##';
    str = str.substr(1);
    str = str.substr(0, str.length - 1);
     $http({
       method: "POST",
       url: "api/patients/getAddressesByPatient",
       data: {
         user:{
           _id :str 
         }
        
      }
     }).then(
       function (response) {
         $scope.busy = false;
         console.log("my location" , response.data.docs);
 $scope.locationsList = response.data.docs
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
 
     )
   };

   $scope.addLocation = function () {
    $scope.busy = true;
    let str = '##user.ref_info._id##';
    str = str.substr(1);
    str = str.substr(0, str.length - 1);
    let user = {
      _id: str
    };
    let xx = $scope.addresses;
    $scope.addresses = {
      location: xx.location,
      addressLocation: xx.addressLocation,
      district: xx.district,
      streetName: xx.streetName,
      buildingNumber: xx.buildingNumber,
      role: xx.role,
      apartmentNumber: xx.apartmentNumber,
      specialMark: xx.specialMark,
      gov: xx.gov,
      city: xx.city,
      user: {
        _id: str
      }
    };


    
    $http({
      method: "POST",
      url: "/api/address/add",
      data: $scope.addresses
    }).then(
      function (response) {
        $scope.busy = false;
location.reload();
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )
  };
   
  $scope.rechargeBalance = function (balance) {
    let where = {};
    let str = '##user.ref_info._id##';
    str = str.substr(1);
    str = str.substr(0, str.length - 1);
    _id = str;
    
    $scope.busy = true;
    $scope.cityList = [];
    $http({
      method: "POST",
      url: "/api/patients/chargeBalance",
      data : {
        _id : str,
        balance : Number(balance)
      }
    }).then(
      function (response) {
location.reload();
        $scope.busy = false;
        
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
    $scope.cityList = [];
    $http({
      method: "POST",
      url: "api/patients/getProfile",
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         $scope.patients.profile = response.data.data;

        }
        console.log($scope.cityList);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };


  $scope.sendPhone = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/patients/forgetPassword",
      data:
      {
        phone: where
      }


    }).then(
      function (response) {

        $scope.busy = false;
        const person = {
          phone: where,
          code: response.data.code,
        };

        window.localStorage.setItem('user', JSON.stringify(person));


      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.reSendPhone = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "api/patients/resendCode",
      data:
      {
        phone: where
      }


    }).then(
      function (response) {

        $scope.busy = false;
        const person = {
          phone: where,
          code: response.data.varifyMessage,
        };

        window.localStorage.setItem('user', JSON.stringify(person));


      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };




  
  $scope.checkVarificationCode = function (where) {

    let code = JSON.parse(localStorage.user).code;

    if (where == code) {
$scope.success = "varification code success"
    }


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
          id: 1, name_ar: 1, name_en: 1, balance: 1, image: 1
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


  


  



 

  

  $scope.displayGetCurrentOrders = function () {
    $scope.myCurrentOrders();
    $scope.now = new Date();
    site.showModal('#myCurrentOrders');
  };

  $scope.displayGetCanceledOrders = function () {
    $scope.myCanceledOrders();
    site.showModal('#myCanceledOrders');
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#patientsSearchModal');
  };

  $scope.getGenderList = function () {
    $scope.genderList = [{ name_ar: "ذكر", name_en: "male" }, { name_ar: "انثى", name_en: "female" }];

  };

  $scope.searchAll = function () {

    $scope.getPatientsList($scope.search);
    site.hideModal('#patientsSearchModal');
    $scope.search = {};
  };

  $scope.getPatientsList();
  $scope.getGenderList();
  $scope.getInsuranceCompanyList();
  $scope.myCurrentOrders();
  $scope.getCurrentPatient();
  $scope.myCanceledOrders();
  $scope.getGovesList();
  $scope.myDoneBooking();
  $scope.myPreviousOrders();
  $scope.myCurrentBooking();
  $scope.myLocation();
  $scope.addLocation();
  

});
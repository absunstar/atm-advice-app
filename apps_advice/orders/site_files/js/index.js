app.controller("orders", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.orders = {};

  $scope.displayAddOrders = function () {
    $scope.error = '';
    $scope.orders = {
      image_url: '/images/orders.png',
      card_url: "/images/cardImage.png",
      active: true,
      hasInsurance: false
    };

    site.showModal('#ordersAddModal');

  };

  $scope.addOrders = function () {
    $scope.error = '';
    const v = site.validated('#ordersAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
   console.log('##user.ref_info._id##');
   $scope.orders.user = {
     _id : '##user.ref_info._id##' 
   };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/orders/add",
      data: $scope.orders
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ordersAddModal');
          $scope.getOrdersList();
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

  $scope.displayUpdateOrders = function (orders) {
    $scope.error = '';
    $scope.viewOrders(orders);
    $scope.orders = {};
    site.showModal('#ordersUpdateModal');
  };

  $scope.updateOrders = function () {
    $scope.error = '';
    const v = site.validated('#ordersUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/orders/update1",
      data: $scope.orders
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ordersUpdateModal');
          $scope.getOrdersList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsOrders = function (orders) {
    $scope.error = '';
    $scope.viewOrders(orders);
    $scope.orders = {};
    site.showModal('#ordersViewModal');
  };

  $scope.viewOrders = function (orders) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/orders/view",
      data: {
        id: orders.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.orders = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteOrders = function (orders) {
    $scope.error = '';
    $scope.viewOrders(orders);
    $scope.orders = {};
    site.showModal('#ordersDeleteModal');
  };

  $scope.deleteOrders = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/orders/delete1",
      data: {
        id: $scope.orders.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ordersDeleteModal');
          $scope.getOrdersList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getOrdersList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/orders/search",
      data: where
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#ordersSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )
  };

  $scope.getGovesList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/gov",
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
          $scope.govesList = response.data.docs;

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getUsersList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/patients",
      data: {
        where: {
          active: true
        },
       
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.userList = response.data.docs;

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
  $scope.addImgArr = function (name , img) {
   
    let obj = {
      name : img , 
      description : name
    };
    $scope.orders.image= [];

    $scope.orders.image.push(obj);
    site.showModal('#personalData');
  
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#ordersSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getOrdersList($scope.search);
    site.hideModal('#ordersSearchModal');
    $scope.search = {};
  };
  

  $scope.getOrdersList();
  $scope.getGovesList();
  $scope.getCitiesList();
  $scope.getUsersList();
  
  
  $scope.getInsuranceCompanyList();
});
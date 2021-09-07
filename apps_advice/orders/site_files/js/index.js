app.controller("main", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.order = {
    address: {},
    image: [
      {
        name: "/images/file.svg ",
      },
    ],
    cardImage: [
      {
        name: "/images/id-card.svg ",
      },
    ],
  };
  $scope.prescription = {};

  $scope.displayAddOrders = function () {
    $scope.error = "";
    $scope.orders = {
      image_url: "/images/orders.png",
      card_url: "/images/cardImage.png",
      active: true,
      hasInsurance: false,
    };

    site.showModal("#ordersAddModal");
  };

  $scope.confirmOrder = function () {
    $scope.error = "";
    /* const v = site.validated("#ordersAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }*/
    $scope.order.user = {
      _id: '##user.ref_info._id##',
    };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/orders/add",
      data: $scope.order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          alert("done");
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

  $scope.displayUpdateOrders = function (orders) {
    $scope.error = "";
    $scope.viewOrders(orders);
    $scope.orders = {};
    site.showModal("#ordersUpdateModal");
  };

  $scope.updateOrders = function () {
    $scope.error = "";
    const v = site.validated("#ordersUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/orders/update1",
      data: $scope.orders,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#ordersUpdateModal");
          $scope.getOrdersList();
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsOrders = function (orders) {
    $scope.error = "";
    $scope.viewOrders(orders);
    $scope.orders = {};
    site.showModal("#ordersViewModal");
  };

  $scope.viewOrders = function (orders) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/orders/view",
      data: {
        id: orders.id,
      },
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
    );
  };

  $scope.displayDeleteOrders = function (orders) {
    $scope.error = "";
    $scope.viewOrders(orders);
    $scope.orders = {};
    site.showModal("#ordersDeleteModal");
  };

  $scope.deleteOrders = function () {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: "/api/orders/delete1",
      data: {
        id: $scope.orders.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#ordersDeleteModal");
          $scope.getOrdersList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getOrdersList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/orders/search",
      data: where,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal("#ordersSearchModal");
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

  $scope.getUsersList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/patients",
      data: {
        where: {
          active: true,
        },
      },
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
    );
  };

  $scope.getCitiesList = function (where) {
    if (!$scope.order.address.gov) {
      return false;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/getCityByGov/" + $scope.order.address.gov._id,
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
  $scope.getInsuranceCompanyList = function (where) {
    $scope.busy = true;
    $http({
      method: "GET",
      url: "/api/insuranceCompany",
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
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getOrdersList();
  $scope.getGovesList();
  $scope.getCitiesList();
  $scope.getUsersList();

  $scope.getInsuranceCompanyList();
});

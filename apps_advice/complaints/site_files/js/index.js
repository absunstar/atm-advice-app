app.controller("complaints", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.complaints = {};

  $scope.displayAddComplaints = function () {
    $scope.error = '';
    $scope.complaints = {
      image_url: '/images/complaints.png',
      active: true
    };

    site.showModal('#complaintsAddModal');

  };

  $scope.addComplaints = function () {
    $scope.error = '';
    const v = site.validated('#complaintsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/complaints/add",
      data: $scope.complaints
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#complaintsAddModal');
          $scope.getComplaintsList();
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

  $scope.displayUpdateComplaints = function (complaints) {
    $scope.error = '';
    $scope.viewComplaints(complaints);
    $scope.complaints = {};
    site.showModal('#complaintsUpdateModal');
  };

  $scope.updateComplaints = function () {
    $scope.error = '';
    const v = site.validated('#complaintsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/complaints/update1",
      data: $scope.complaints
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#complaintsUpdateModal');
          $scope.getComplaintsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsComplaints = function (complaints) {
    $scope.error = '';
    $scope.viewComplaints(complaints);
    $scope.complaints = {};
    site.showModal('#complaintsViewModal');
  };

  $scope.viewComplaints = function (complaints) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/complaints/view",
      data: {
        id: complaints.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.complaints = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteComplaints = function (complaints) {
    $scope.error = '';
    $scope.viewComplaints(complaints);
    $scope.complaints = {};
    site.showModal('#complaintsDeleteModal');
  };

  $scope.deleteComplaints = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/complaints/delete1",
      data: {
        id: $scope.complaints.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#complaintsDeleteModal');
          $scope.getComplaintsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getComplaintsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/complaints/search",
      data: where 
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.list = response.data.docs;
          $scope.count = response.data.totalDocs;
          site.hideModal('#complaintsSearchModal');
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
    site.showModal('#complaintsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getComplaintsList($scope.search);
    site.hideModal('#complaintsSearchModal');
    $scope.search = {};
  };

  $scope.getComplaintsList();
});
app.controller('login', function ($scope, $http) {
  $scope.busy = false;
  $scope.user = {};

  $scope.tryLogin = function (ev) {
    if (ev.which == 13) {
      $scope.login();
    }
  };

  $scope.login = function (b) {
    $scope.error = '';
    const v = site.validated('#loginModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/user/login',
      data: {
        $encript: '123',
        email: site.to123($scope.user.email),
        password: site.to123($scope.user.password),
      },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
        if (response.data.done) {
          window.location.reload(true);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      },
    );
  };

  $scope.loadUserBranches = function () {
    $scope.company_list = [];

    $http({
      method: 'POST',
      url: '/api/user/branches/all',
      data: {
        where: { email: $scope.user.email },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.branch_list = response.data.list;
          $scope.company_list = [];
          $scope.branch_list.forEach((b) => {
            let exist = false;
            $scope.company_list.forEach((company) => {
              if (company.id === b.company.id) {
                exist = true;
                company.branch_list.push(b.branch);
              }
            });

            if (!exist) {
              b.company.branch_list = [b.branch];
              $scope.company_list.push(b.company);
            }
          });

          $scope.$applyAsync();
        }
      },
      function (err) {
        $scope.error = err;
      },
    );
  };
});

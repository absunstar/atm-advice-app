app.controller('booking', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.booking = {};

  $scope.getspecialtyList = function (where) {
    $scope.busy = true;
    $scope.specialtyList = [];
    $http({
      method: 'POST',
      url: '/api/departments/search',
      data: where,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.docs.length > 0) {
          $scope.specialtyList = [...$scope.specialtyList, ...response.data.docs];
          $scope.count = response.data.totalDocs;
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      },
    );
  };

  $scope.getGovesList = function (where) {
    $scope.busy = true;
    $scope.govesList = [];
    $http({
      method: 'GET',
      url: '/api/gov',
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
      },
    );
  };

  $scope.getCityList = function (gov) {
    let where = {};
    if (gov) {
      where['gov'] = gov;
    }
    $scope.busy = true;
    $scope.cityList = [];
    $http({
      method: 'POST',
      url: '/api/city/search',
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
      },
    );
  };

  $scope.getDoctorsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'GET',
      url: 'api/doctors',
      data: where,
    }).then(
      function (response) {
        $scope.busy = false;

        $scope.DoctorsList = response.data.data.docs || [];
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      },
    );
  };

  $scope.getspecialtyList();
  $scope.getGovesList();
});



                                  const one = document.querySelector("#step1");
                                  const two = document.querySelector("#step2");
                                  const three = document.querySelector("#step3");
                                  const four = document.querySelector("#step4");
                                  const five = document.querySelector("#step5");
                                  const six = document.querySelector("#step6");
                                
                                one.addEventListener('click',() => {
                                
                                document.querySelector('.first-step').style.display="block";
                                document.querySelector('.second-step').style.display="none";
                                document.querySelector('.third-step').style.display="none";
                                document.querySelector('.final-step').style.display="none";
                                
                                one.classList.add('active');
                                two.classList.remove('active');
                                three.classList.remove('active');
                                
                                
                                });
                                four.addEventListener('click',() => {
                                
                                document.querySelector('.first-step').style.display="none";
                                document.querySelector('.second-step').style.display="block";
                                document.querySelector('.third-step').style.display="none";
                                document.querySelector('.final-step').style.display="none";
                                
                                one.classList.add('active');
                                two.classList.add('active');
                                three.classList.remove('active');
                                
                                
                                });
                                two.addEventListener('click',() => {
                                
                                document.querySelector('.first-step').style.display="none";
                                document.querySelector('.second-step').style.display="block";
                                document.querySelector('.third-step').style.display="none";
                                document.querySelector('.final-step').style.display="none";
                                
                                one.classList.add('active');
                                two.classList.add('active');
                                three.classList.remove('active');
                                
                                
                                });
                                five.addEventListener('click',() => {
                                
                                document.querySelector('.first-step').style.display="none";
                                document.querySelector('.second-step').style.display="none";
                                document.querySelector('.third-step').style.display="block";
                                document.querySelector('.final-step').style.display="none";
                                
                                one.classList.add('active');
                                two.classList.add('active');
                                three.classList.add('active');
                                
                                
                                });
                                three.addEventListener('click',() => {
                                
                                document.querySelector('.first-step').style.display="none";
                                document.querySelector('.second-step').style.display="none";
                                document.querySelector('.third-step').style.display="block";
                                document.querySelector('.final-step').style.display="none";
                                
                                one.classList.add('active');
                                two.classList.add('active');
                                three.classList.add('active');
                                
                                
                                });
                                six.addEventListener('click',() => {
                                
                                document.querySelector('.first-step').style.display="none";
                                document.querySelector('.second-step').style.display="none";
                                document.querySelector('.third-step').style.display="none";
                                document.querySelector('.final-step').style.display="block";
                                one.classList.add('active');
                                two.classList.add('active');
                                three.classList.add('active');
                                
                                
                                });
                                

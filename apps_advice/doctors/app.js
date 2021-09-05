module.exports = function init(site) {
  const $doctors = site.connectCollection('doctors');
  const $rating = site.connectCollection('rating');
  const $users_info = site.connectCollection('users_info');
  let ObjectID = require('mongodb').ObjectID;
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
    require: {
      permissions: [],
    },
  });

  site.get({
    name: 'doctors',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: [],
    },
  });

  site.get({
    name: 'doctors/active_doctor',
    path: __dirname + '/site_files/html/doctor_active.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: [],
    },
  });

  // Add New Doctors With Not Duplicate Name Validation

  site.post(
    {
      name: '/api/doctors/add',
      require: {
        permissions: [],
      },
    },
    (req, res) => {
      req.headers.language = req.headers.language || 'en';
      let response = {
        done: false,
      };

      // if (!req.session.user) {
      //   response.error = 'Please Login First';
      //   res.json(response);
      //   return;
      // }

      let doctors_doc = req.body;
      doctors_doc.$req = req;
      doctors_doc.$res = res;
      if (typeof doctors_doc.lat == 'string') {
        doctors_doc.lat = Number(doctors_doc.lat);
      }
      if (typeof doctors_doc.long == 'string') {
        doctors_doc.long = Number(doctors_doc.long);
      }
      if (doctors_doc.image_url) {
        doctors_doc.image = new Array({
          name: doctors_doc.image_url,
        });
      }
      (doctors_doc.isActive = false), (doctors_doc.isAvailable = false), (doctors_doc.createdAt = new Date());
      doctors_doc.updatedAt = new Date();
      (doctors_doc.rating = 0),
        (doctors_doc.status = {
          statusId: site.var('activeId'),
          name: site.var('active'),
        });

      let location = new Array(doctors_doc.lat, doctors_doc.long);
      doctors_doc.location = {
        type: 'Point',
        coordinates: location,
      };
      $doctors.createIndex({
        location: '2dsphere',
      });
      $doctors.add(doctors_doc, (err, doc) => {
        if (!err) {
          let user = {
            name: doctors_doc.name,
            mobile: doctors_doc.phone,
            email: doctors_doc.email,
            password: doctors_doc.password,
            image_url: doctors_doc.image,
            type: 'doctor',
          };
          user.profile = {
            name: user.name,
            mobile: user.mobile,
            image_url: user.image_url,
          };
          user.ref_info = {
            _id: doc._id,
          };
          site.security.addUser(user, (err, userDoc) => {
            if (!err) {
              delete user._id;
              delete user.id;
              doc.user_info = {
                _id: userDoc._id,
              };
              $doctors.updateOne(doc);
            }
          });
          let { password, ...rest } = doc;
          response.data = rest;
          response.errorCode = site.var('succeed');
          response.message = site.word('doctorsCreated')[req.headers.language];
          response.done = true;
        } else {
          response.errorCode = site.var('failed');
          response.message = site.word('errorHappened')[req.headers.language];
          response.done = false;
        }

        res.json(response);
      });
    },
  );

  // doctor login

  site.post({ name: '/api/doctor/login', require: { permissions: [] } }, function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };

    // if (req.body.$encript) {
    //   if (req.body.$encript === '64') {
    //     req.body.email = site.fromBase64(req.body.email);
    //     req.body.password = site.fromBase64(req.body.password);
    //     req.body.company = site.fromJson(site.fromBase64(req.body.company));
    //     req.body.branch = site.fromJson(site.fromBase64(req.body.branch));
    //   } else if (req.body.$encript === '123') {
    //     req.body.email = site.from123(req.body.email);
    //     req.body.password = site.from123(req.body.password);
    //     req.body.company = site.fromJson(site.from123(req.body.company));
    //     req.body.branch = site.fromJson(site.from123(req.body.branch));
    //   }
    // }

    // if (site.security.isUserLogin(req, res)) {
    //   response.error = "Login Error , You Are Loged "
    //   response.done = true
    //   res.json(response)
    //   return
    // }

    site.security.login(
      {
        email: req.body.email,
        password: req.body.password,
        company: req.body.company,
        branch: req.body.branch,
        $req: req,
        $res: res,
      },
      function (err, user) {
        if (!err) {
          site.call('[session][update]', {
            company: req.body.company,
            branch: req.body.branch,
          });
          if (user) {
            $doctors.findOne(
              {
                where: {
                  _id: user.ref_info._id,
                },
              },
              (err, doc) => {
                if (doc && doc.isActive == false) {
                  delete response.accessToken;
                  (response.done = false), (response.errorCode = site.var('failed'));
                  response.message = site.word('activateDoctorFirst')[req.headers.language];
                  res.json(response);
                  return;
                } else {
                  (response.accessToken = req.session.accessToken),
                    (response.user = {
                      id: user.id,
                      _id: user._id,
                      email: user.email,
                      permissions: user.permissions,
                      company: req.body.company,
                      branch: req.body.branch,
                      ref: user.ref_info,
                      targetUserId: user.ref_info._id,
                    });
                  response.done = true;
                  res.json(response);
                  return;
                }
              },
            );
          } else {
            delete response.accessToken;
            (response.done = false), (response.errorCode = site.var('failed'));
            response.message = site.word('emailOrPasswordInCorrect')[req.headers.language];
            res.json(response);
            return;
          }
        } else {
          delete response.accessToken;
          (response.done = false), (response.errorCode = site.var('failed'));
          response.error = err.message;
          res.json(response);
        }
      },
    );
  });

  // change status active
  site.post('/api/doctors/changeStatusActive', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctors_doc = req.body;

    $doctors.edit(
      {
        where: {
          _id: doctors_doc._id,
          isActive: false,
        },
        set: {
          isActive: true,
          isAvailable: true,
        },
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (result.count > 0) {
          response.done = true;
          response.message = site.word('acountActivated')[req.headers.language];
          response.errorCode = site.var('succeed');
        }
        if (result.count == 0) {
          response.done = false;
          response.message = site.word('acountNotActivated')[req.headers.language];
          response.errorCode = site.var('failed');
        }
        res.json(response);
      },
    );
  });

  // add image to doctor
  site.post('/api/doctors/upload/image/doctors', (req, res) => {
    site.createDir(site.dir + '/../../uploads/' + 'doctors', () => {
      site.createDir(site.dir + '/../../uploads/' + 'doctors' + '/images', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
          let newpath = site.dir + '/../../uploads/' + 'doctors' + '/images/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            response.image_url = '/api/image/' + 'doctors' + '/' + newName;
            res.json(response);
          });
        } else {
          response.error = 'no file';
          response.done = !1;
          res.json(response);
        }
      });
    });
  });

  // get Doctor By Departments

  site.post('/api/doctors/getDoctorByDepartments', (req, res) => {
    let response = {};
    let doctor_doc = req.body;
    req.headers.language = req.headers.language || 'en';
    $doctors.findMany(
      {
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'department._id': String(doctor_doc.department._id),
          isAvailable: true,
          isActive: true,
        },
        limit: req.body.limit || 10,
      },
      (err, docs, count) => {
        if (!err && docs) {
          response.data = {
            docs: docs,
            totalDocs: count,
            limit: 10,
            totalPages: Math.ceil(count / 10),
          };
          response.errorCode = site.var('succeed');
          response.message = site.word('findSuccessfully')[req.headers.language];
          response.done = true;
        } else {
          response.data = {
            docs,
          };
          response.errorCode = site.var('failed');
          response.message = site.word('findFailed')[req.headers.language];
          response.done = false;
        }

        res.json(response);
      },
    );
  });

  // get doctor During Distance

  site.post('/api/doctors/getDoctorDuringDistance', (req, res) => {
    let response = {};
    let where = {
      ...req.body,
    };
    let doctor_doc = req.body;
    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10;
    }
    let distance = 30 * 1000;
    req.headers.language = req.headers.language || 'en';
    if (where['department'] && where['department']._id != '') {
      where['department._id'] = where['department']._id;
      delete where['department'];
    }
    if (where['department'] && where['department']._id == '') {
      delete where['department'];
    }

    $doctors.aggregate(
      [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [doctor_doc.lat, doctor_doc.long],
            },
            distanceField: 'distance',
            maxDistance: distance,
            spherical: true,
          },
        },
        {
          $sort: {
            distance: 1.0,
          },
        },
        {
          $match: where,
        },
        {
          $match: {
            isActive: true,
            isAvailable: true,
          },
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.data = {
            docs: docs,
            totalDocs: docs.length,
            limit: 10,
            totalPages: Math.ceil(docs.length / 10),
          };
          response.errorCode = site.var('succeed');
          response.message = site.word('findSuccessfully')[req.headers.language];
          res.json(response);
        } else {
          $doctors.findMany(
            {
              select: req.body.select || {},
              sort: req.body.sort || {
                id: -1,
              },
              where: {
                isActive: false,
              },
            },
            (err, docs, count) => {
              if (!err) {
                response.docs = docs;
                response.totalDocs = count;
                response.limit = 10;
                response.totalPages = Math.ceil(response.totalDocs / response.limit);
              } else {
                response.error = err.message;
              }
              res.json(response);
            },
          );
        }
      },
    );
  });

  // get doctor By Rating

  site.post('/api/doctors/getDoctorByRating', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    let where = {
      ...req.body,
    };
    if (where['department'] && where['department']._id != '') {
      where['department._id'] = where['department']._id;
      delete where['department'];
    }
    if (where['department'] && where['department']._id == '') {
      delete where['department'];
    }
    $doctors.aggregate(
      [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [doctor_doc.lat, doctor_doc.long],
            },
            distanceField: 'distance',
            spherical: true,
          },
        },
        {
          $match: where,
        },
        {
          $sort: {
            rating: -1.0,
          },
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.data = {
            docs: docs,
            totalDocs: docs.length,
            limit: 10,
            totalPages: Math.ceil(docs.length / 10),
          };
          response.errorCode = site.var('succeed');
          response.message = site.word('findSuccessfully')[req.headers.language];
          res.json(response);
        } else {
          response.data = {
            docs,
          };
          response.errorCode = site.var('failed');
          response.message = site.word('findFailed')[req.headers.language];
          res.json(response);
        }
      },
    );
  });

  // get not active
  site.post('/api/doctors/getNotActiveDoctors', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctors_doc = req.body;

    $doctors.findMany(
      {
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          isActive: false,
        },
      },
      (err, docs, count) => {
        if (!err) {
          response.docs = docs;
          response.totalDocs = count;
          response.limit = 10;
          response.totalPages = Math.ceil(response.totalDocs / response.limit);
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );
  });

  // add doctor appointment

  site.post('/api/doctors/addDoctorAppointment', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    $doctors.findOne(
      {
        where: {
          _id: doctor_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc) {
          let OBJ = {
            startSession: doctor_doc.startSession,
            status: 'available',
          };
          doc.days.forEach((_d) => {
            let date = _d.date;

            let bodyDate = doctor_doc.date;

            if (String(date) == String(bodyDate)) {
              let xx = _d.times.some(li=>li.startSession == doctor_doc.startSession)
              if (xx == true) {
                response.done = false
                response.errorCode = site.var('failed');
                response.message = site.word('appointmentAlreadyExist')[req.headers.language];
                res.json(response);
              }
              else{

                _d.times.push(OBJ);
              }
            }
          });
          $doctors.update(doc, (err, result) => {
            response.done = true, response.data = doc;
            response.errorCode = site.var('succeed');
            response.message = site.word('updatedSuccessfully')[req.headers.language];
            res.json(response);
          });
        } else {
          (response.done = false), (response.errorCode = site.var('failed'));
          response.message = site.word('failedUpdated')[req.headers.language];
          res.json(response);
        }
      },
    );
  });

  // Repeat Doctor Day

  site.post('/api/doctors/repeatDoctorDay', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    $doctors.findOne(
      {
        where: {
          _id: doctor_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc) {
          doc.days.forEach((_d) => {
            let date = _d.date;

            let bodyDate = doctor_doc.oldDate;

            if (String(date) == String(bodyDate)) {
              doc.days.push({
                date: doctor_doc.newDate,
                times: _d.times,
              });
            }
          });
          $doctors.update(doc, (err, result) => {
            (response.done = true), (response.data = doc);
            response.errorCode = site.var('succeed');
            response.message = site.word('updatedSuccessfully')[req.headers.language];
            res.json(response);
          });
        } else {
          (response.done = false), (response.errorCode = site.var('failed'));
          response.message = site.word('failedUpdated')[req.headers.language];
          res.json(response);
        }
      },
    );
  });

  // get Appointments By Date

  site.post('/api/doctors/getAppointmentsByDate', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    $doctors.findOne(
      {
        where: {
          _id: doctor_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc) {
          let arr = [];
          if (doc.days.length > 0) {
            doc.days.forEach((_d) => {
              let date = _d.date;

              let bodyDate = doctor_doc.date;
              if (String(date) == String(bodyDate)) {
                arr = _d.times;
              }
            });
          }

          (response.done = true), (response.data = arr);
          response.errorCode = site.var('succeed');
          response.message = site.word('updatedSuccessfully')[req.headers.language];
          res.json(response);
        } else {
          (response.done = false), (response.errorCode = site.var('failed'));
          response.message = site.word('failedUpdated')[req.headers.language];
          res.json(response);
        }
      },
    );
  });

  // change Password

  site.post('/api/doctors/changePassword', (req, res) => {
    let response = {};
    req.headers.language = req.headers.language || 'en';
    let doctors_doc = req.body;

    $doctors.findOne(
      {
        where: {
          _id: doctors_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc && doc.password == doctors_doc.password) {
          $doctors.edit(
            {
              where: {
                _id: doctors_doc.doctor._id,
              },
              set: {
                password: doctors_doc.newPassword,
              },
              $req: req,
              $res: res,
            },
            (err, result) => {
              response.done = true;
              response.message = site.word('updatePassword')[req.headers.language];
              response.errorCode = site.var('succeed');

              res.json(response);
            },
          );
        }
        if (!doc || doc.password != doctors_doc.password) {
          response.done = false;
          response.message = site.word('passwordNotCorrect')[req.headers.language];
          response.errorCode = site.var('failed');
          res.json(response);
        }
      },
    );
  });

  // get All Days By Doctor

  site.post('/api/doctors/getAllDays', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    $doctors.findOne(
      {
        where: {
          _id: doctor_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc) {
          let arr = [];

          (response.done = true), (response.data = doc.days);
          response.errorCode = site.var('succeed');
          response.message = site.word('findSuccessfully')[req.headers.language];
          res.json(response);
        } else {
          (response.done = false), (response.data = []);
          response.errorCode = site.var('failed');
          response.message = site.word('failedUpdated')[req.headers.language];
          res.json(response);
        }
      },
    );
  });

  // add Doctor day

  site.post('/api/doctors/addDoctorDate', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    $doctors.findOne(
      {
        where: {
          _id: doctor_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc) {
          let arr = [];
          if (doc.days) {
            var a = new Date(req.body.date);
            var weekdays = new Array(7);
            weekdays[0] = 'Sunday';
            weekdays[1] = 'Monday';
            weekdays[2] = 'Tuesday';
            weekdays[3] = 'Wednesday';
            weekdays[4] = 'Thursday';
            weekdays[5] = 'Friday';
            weekdays[6] = 'Saturday';
            var r = weekdays[a.getDay()];

            doc.days.push({
              dayName: r,
              date: doctor_doc.date,
              times: [],
            });
          } else {
            var a = new Date(req.body.date);
            var weekdays = new Array(7);
            weekdays[0] = 'Sunday';
            weekdays[1] = 'Monday';
            weekdays[2] = 'Tuesday';
            weekdays[3] = 'Wednesday';
            weekdays[4] = 'Thursday';
            weekdays[5] = 'Friday';
            weekdays[6] = 'Saturday';
            var r = weekdays[a.getDay()];
            doc.days = [
              {
                dayName: r,
                date: doctor_doc.date,
                times: [],
              },
            ];
          }
          $doctors.update(doc, (err, result) => {
            (response.done = true), (response.data = doc.days);
            response.errorCode = site.var('succeed');
            response.message = site.word('findSuccessfully')[req.headers.language];
            res.json(response);
          });
        } else {
          (response.done = false), (response.errorCode = site.var('failed'));
          response.message = site.word('failedUpdated')[req.headers.language];
          res.json(response);
        }
      },
    );
  });

  // close appointment

  site.post('/api/doctors/closeAppointment', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    $doctors.findOne(
      {
        where: {
          _id: doctor_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc) {
          let arr = [];
          doc.days.forEach((_d) => {
            let date = _d.date;

            let bodyDate = doctor_doc.date;

            if (String(date) == String(bodyDate)) {
              _d.times.forEach((_t) => {
                if (_t.status == 'available' && _t.startSession == doctor_doc.startSession) {
                  _t.status = 'unAvailable';
                }
              });
            }
          });
          $doctors.update(doc, (err, result) => {
            (response.done = true),
              // response.data = doc,
              (response.errorCode = site.var('succeed'));
            response.message = site.word('appointmentClosed')[req.headers.language];

            res.json(response);
          });
        }
      },
    );
  });

  // remove date and appointments

  site.post('/api/doctors/removeDayByDate', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctor_doc = req.body;
    $doctors.findOne(
      {
        where: {
          _id: doctor_doc.doctor._id,
        },
      },
      (err, doc) => {
        if (doc) {
          let arr = [];
          doc.days.forEach((_d) => {
            let date = _d.date;

            let bodyDate = doctor_doc.date;

            if (String(date) == String(bodyDate)) {
              // console.log(_d);
              doc.days.splice(doc.days.indexOf(_d), 1);
            }
          });
          $doctors.update(doc, (err, result) => {
            (response.done = true),
              // response.data = doc,
              (response.errorCode = site.var('succeed'));
            response.message = site.word('dateRemoved')[req.headers.language];

            res.json(response);
          });
        }
      },
    );
  });

  // rating Doctors
  site.post('/api/doctors/ratingDoctors', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctors_doc = req.body;
    Number.prototype.between = function (a, b) {
      var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
      return this > min && this < max;
    };

    if (!doctors_doc.rating.between(0, 5.1)) {
      (response.message = site.word('doctorRatingError')[req.headers.language]), res.json(response);
    }

    let createdObj = {
      user: doctors_doc.user,
      date: new Date().toISOString().split('T')[0],
      target: doctors_doc.doctor,
      rating: doctors_doc.rating,
      type: 'doctor',
      description: doctors_doc.description,
    };

    $rating.add(createdObj, (err1, doc1) => {
      if (!err1) {
        response.data = doc1;
        response.errorCode = site.var('succeed');
        (response.message = site.word('ratingCreated')[req.headers.language]), res.json(response);

        $rating.aggregate(
          [
            {
              $match: {
                type: 'doctor',
                'target._id': doctors_doc.doctor._id,
              },
            },
            {
              $group: {
                _id: null,
                avgRating: {
                  $avg: '$rating',
                },
                docs: {
                  $push: '$$ROOT',
                },
              },
            },
          ],
          (err, docs) => {
            console.log(docs);
            if (docs && docs.length > 0) {
              let avg = docs[0];

              $doctors.edit({
                where: {
                  _id: doctors_doc.doctor._id,
                },
                set: {
                  rating: avg ? avg.avgRating : 0,
                  ratingArr: avg ? avg.docs : [],
                },
                $req: req,
                $res: res,
              });
            }
          },
        );
      } else {
        (response.done = false), (response.errorCode = site.var('failed'));
        (response.message = site.word('ratingFailed')[req.headers.language]), res.json(response);
      }
    });
  });

  // Update Doctors

  site.post('/api/doctors/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    let doctors_doc = req.body;
    (doctors_doc.updatedAt = new Date()),
      $doctors.edit(
        {
          where: {
            _id: req.params.id,
          },
          set: doctors_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            $doctors.findOne(
              {
                where: {
                  _id: req.params.id,
                },
              },
              (err, doc) => {
                if (doc) {
                  console.log(doc.user_info._id);
                  $users_info.edit({
                    where: {
                     '_id': doc.user_info._id
                    },
                    set: {
                      password: doc.password,
                      email: doc.email
                    },
                    $req: req,
                    $res: res
                  })
                  response.done = true, response.data = doc;
                  response.errorCode = site.var('succeed');
                  response.message = site.word('updatedSuccessfully')[req.headers.language];
                  res.json(response);
                } else {
                  (response.done = false), (response.errorCode = site.var('failed'));
                  response.message = site.word('failedUpdated')[req.headers.language];
                  res.json(response);
                }
              },
            );
          } else {
            (response.done = false), (response.data = doc);
            response.errorCode = site.var('failed');
            response.message = site.word('failedUpdate')[req.headers.language];
            res.json(response);
          }
        },
      );
  });

  // get All doctors

  site.get('/api/doctors', (req, res) => {
    let limit = 10;
    let skip;
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10;
    }
    let response = {
      done: false,
    };
    $doctors.findMany(
      {
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          isActive: true,
        },
        limit: limit,
        skip: skip,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.data = {
            docs: docs,
            totalDocs: docs.length,
            limit: 10,
            totalPages: Math.ceil(docs.length / 10),
          };
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );
  });

  // get Doctors By Id

  site.get('/api/doctors/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {};
    $doctors.findOne(
      {
        where: {
          _id: req.params.id,
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.data = doc;
          response.errorCode = site.var('succeed');
          response.message = site.word('findSuccessfully')[req.headers.language];
          response.done = true;
        }
        if (!doc) {
          response.errorCode = site.var('failed');
          response.message = site.word('findFailed')[req.headers.language];
          response.done = false;
        }
        res.json(response);
      },
    );
  });

  // Hard Delete Doctors
  site.post('/api/doctors/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $doctors.delete(
        {
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            (response.done = true), (response.errorCode = site.var('succeed'));
            response.message = site.word('doctorsDeleted')[req.headers.language];
          } else {
            (response.done = false), (response.errorCode = site.var('failed'));
            response.message = site.word('failedDelete')[req.headers.language];
          }
          res.json(response);
        },
      );
    }
  });

  // Search doctors By Name
  site.post('/api/doctors/search', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {
      done: false,
    };

    let where = {
      ...req.body,
    };

    if (where['gender'] == undefined) {
      delete where['gender'];
    }
    if (where['gender'] != undefined && where['gender'] != '') {
      where['gender'] = String(where['gender']);
    }
    if (where['gender'] != undefined && where['gender'] == '') {
      delete where['gender'];
    }

    if (where['rating'] && where['rating'] != -1) {
      where['rating'] = Number(where['rating']);
    }
    if (where['rating'] && where['rating'] == -1) {
      delete where['rating'];
    }

    if (where.fromPrice && where.fromPrice != -1 && where.toPrice && where.toPrice != -1) {
      let d1 = Number(where.fromPrice);
      let d2 = Number(where.toPrice);

      where.price = {
        $gte: d1,
        $lte: d2,
      };
      delete where.toPrice;
      delete where.fromPrice;
    }
    if (where.fromPrice && where.fromPrice == -1) {
      delete where.fromPrice;
    }
    if (where.fromPrice && where.fromPrice != -1) {
      let d1 = Number(where.fromPrice);
      where.price = {
        $gte: d1,
      };
      delete where.fromPrice;
    }
    if (where.toPrice && where.toPrice != -1) {
      let d1 = Number(where.toPrice);
      where.price = {
        $lte: d1,
      };
      delete where.toPrice;
    }
    if (where.toPrice && where.toPrice == -1) {
      delete where.toPrice;
    }
    if (where['name'] == undefined) {
      delete where['name'];
    }
    if (where['name'] != undefined && where['name'] != '') {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }
    if (where['name'] != undefined && where['name'] == '') {
      delete where['name'];
    }

    if (where['degree'] && where['degree']._id != '') {
      where['degree._id'] = where['degree']._id;
      delete where['degree'];
    }

    if (where['degree'] && where['degree']._id == '') {
      delete where['degree'];
    }

    if (where['department'] && where['department']._id != '') {
      where['department._id'] = where['department']._id;
      delete where['department'];
    }
    if (where['department'] && where['department']._id == '') {
      delete where['department'];
    }

    if (where['city'] && where['city']._id != '') {
      where['city._id'] = where['city']._id;
      delete where['city'];
    }

    if (where['city'] && where['city']._id == '') {
      delete where['city'];
    }
    where.isActive = true;

    if (where['dayName']) {
      where['days.dayName'] = where['dayName'];
      delete where['dayName'];
    }

    let doctor_doc = req.body;
    let lat = doctor_doc.lat;
    let long = doctor_doc.long;

    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10;
    }
    $doctors.aggregate(
      [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [lat, long],
            },
            distanceField: 'distance',
            spherical: true,
          },
        },

        {
          $match: where,
        },
        {
          $sort: {
            rating: -1.0,
          },
        },
        {
          $skip: skip || 0,
        },
        {
          $limit: limit,
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.data = {
            docs: docs,
            totalDocs: docs.length,
            limit: 10,
            totalPages: Math.ceil(docs.length / 10),
          };
          res.json(response);
        } else {
          response.data = {
            docs,
          };
          response.errorCode = site.var('failed');
          response.message = site.word('findFailed')[req.headers.language];
          response.done = false;
          res.json(response);
        }
      },
    );

    // $doctors.findMany({
    //   select: req.body.select || {},
    //   where: where,
    //   sort: req.body.sort || {
    //     id: -1,
    //   },
    //   limit: req.body.limit || 10,
    // },
    //   (err, docs, count) => {
    //     if (docs.length > 0) {
    //       response.done = true
    //       response.docs = docs
    //       response.totalDocs = count
    //       response.limit = 10
    //       response.totalPages = Math.ceil(response.totalDocs / response.limit)
    //     } else {
    //       response.docs = docs
    //       response.errorCode = site.var('failed')
    //       response.message = site.word('findFailed')[req.headers.language]
    //       response.done = false;
    //     }
    //     res.json(response);
    //   },
    // );
  });

  // Search doctors By Available Days
  site.post('/api/doctors/searchByDays', (req, res) => {
    req.headers.language = req.headers.language || 'en';
    let response = {
      done: false,
    };

    let doctor_doc = req.body;
    let lat = doctor_doc.lat;
    let long = doctor_doc.long;
    let daysArr = doctor_doc.selectedDay.map((li) => li.day);
    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10;
    }
    $doctors.aggregate(
      [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [lat, long],
            },
            distanceField: 'distance',
            spherical: true,
          },
        },
        {
          $unwind: {
            path: '$days',
          },
        },
        {
          $project: {
            _id: 1.0,
            days: 1.0,
          },
        },
        {
          $addFields: {
            day: {
              $dayOfWeek: '$days.date',
            },
          },
        },
        {
          $match: {
            day: {
              $in: daysArr,
            },
          },
        },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctor',
          },
        },
        {
          $unwind: {
            path: '$doctor',
          },
        },
        {
          $skip: skip || 0,
        },
        {
          $limit: limit,
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.data = {
            docs: docs,
            totalDocs: docs.length,
            limit: 10,
            totalPages: Math.ceil(docs.length / 10),
          };

          res.json(response);
        } else {
          response.data = {
            docs,
          };
          response.errorCode = site.var('failed');
          response.message = site.word('findFailed')[req.headers.language];
          response.done = false;
          res.json(response);
        }
      },
    );

    // $doctors.findMany({
    //   select: req.body.select || {},
    //   where: where,
    //   sort: req.body.sort || {
    //     id: -1,
    //   },
    //   limit: req.body.limit || 10,
    // },
    //   (err, docs, count) => {
    //     if (docs.length > 0) {
    //       response.done = true
    //       response.docs = docs
    //       response.totalDocs = count
    //       response.limit = 10
    //       response.totalPages = Math.ceil(response.totalDocs / response.limit)
    //     } else {
    //       response.docs = docs
    //       response.errorCode = site.var('failed')
    //       response.message = site.word('findFailed')[req.headers.language]
    //       response.done = false;
    //     }
    //     res.json(response);
    //   },
    // );
  });

  site.post('/api/doctors/update1', (req, res) => {
    let response = {
      done: false,
    };
    let doctors_doc = req.body;
    if (doctors_doc.id) {
      $doctors.edit(
        {
          where: {
            id: doctors_doc.id,
          },
          set: doctors_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        },
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/doctors/view', (req, res) => {
    let response = {
      done: false,
    };

    $doctors.findOne(
      {
        where: {
          id: req.body.id,
        },
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );
  });
  site.post('/api/doctors/delete1', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.body.id;

    if (id) {
      $doctors.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = err.message;
          }
          res.json(response);
        },
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });
};

module.exports = function init(site) {
  const $doctors = site.connectCollection('doctors');
  const $rating = site.connectCollection('rating');
  const $appointments = site.connectCollection('appointments');

  // site.get({
  //   name: 'images',
  //   path: __dirname + '/site_files/images/',
  // });

  // site.get({
  //   name: 'doctors',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: true,
  // });

  // site.on('[company][created]', (doc) => {
  //   $doctors.add(
  //     {
  //       code: "1-Test",
  //       name_ar: 'محافظة إفتراضية',
  //       name_en: "Default Doctors",
  //       image_url: '/images/doctors.png',
  //       company: {
  //         id: doc.id,
  //         name_ar: doc.name_ar,
  //         name_en: doc.name_en
  //       },
  //       branch: {
  //         code: doc.branch_list[0].code,
  //         name_ar: doc.branch_list[0].name_ar,
  //         name_en: doc.branch_list[0].name_en
  //       },
  //       active: true,
  //     },
  //     (err, doc1) => {
  //       site.call('[register][city][add]', doc1);
  //     },
  //   );
  // });




  site.on('[test][city][+]', (obj, callback, next) => {
    console.log("from doctors", obj);
    // $safes.find({
    //   id: obj.safe.id,
    // }, (err, doc) => {
    //   if (!err && doc) {
    //     doc.pre_balance = doc.balance
    //     if (obj.transition_type == 'in')
    //       doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
    //     if (obj.transition_type == 'out')
    //       doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
    //     doc.description = obj.description
    //     $safes.update(doc, (err, result) => {

    //       if (!err) {
    //         $safes.find({
    //           id: result.doc.id
    //         }, (err, doc) => {
    //           obj.pre_balance = doc.pre_balance
    //           obj.image_url = doc.image_url
    //           obj.company = doc.company
    //           obj.branch = doc.branch
    //           obj.balance = doc.balance

    //           site.quee('[safes][safes_payments][+]', Object.assign({}, obj))
    //         })
    //       }
    //       next()
    //     })
    //   } else {
    //     next()
    //   }
    // })
  })





  // Add New Doctors With Not Duplicate Name Validation

  site.post({
    name: '/api/doctors/add',
    require: {
      permissions: []
    }
  }, (req, res) => {
    req.headers.language = req.headers.language || 'en'
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

    doctors_doc.isActive = false,
      doctors_doc.isAvailable = false,
      doctors_doc.createdAt = new Date()
    doctors_doc.updatedAt = new Date()
    doctors_doc.rating = 0,
      doctors_doc.status = {
        statusId: site.var('activeId'),
        name: site.var('active')
      }


    let location = new Array(doctors_doc.lat, doctors_doc.long)
    doctors_doc.location = {
      type: "Point",
      coordinates: location
    }
    $doctors.createIndex({
      location: "2dsphere"
    })

    $doctors.add(doctors_doc, (err, doc) => {
      if (!err) {
        let user = {
          name: doctors_doc.name,
          mobile: doctors_doc.phone,
          email: doctors_doc.email,
          password: doctors_doc.password,
          image_url: doctors_doc.image,
          type: 'doctor'
        }
        user.profile = {
          name: user.name,
          mobile: user.mobile,
          image_url: user.image_url
        }
        user.ref_info = {
          _id: doc._id
        }
        site.security.addUser(user, (err, userDoc) => {
          if (!err) {
            delete user._id
            delete user.id
            doc.user_info = {
              _id: userDoc._id
            }
            $doctors.updateOne(doc);
          }
        })
        let {
          password,
          ...rest
        } = doc
        response.data = rest;
        response.errorCode = site.var('succeed')
        response.message = site.word('doctorsCreated')[req.headers.language]
        response.done = true;


      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });


  });

  // change status active
  site.post('/api/doctors/changeStatusActive', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctors_doc = req.body;

    $doctors.edit({
      where: {
        _id: doctors_doc._id,
        isActive: false,
      },
      set: {
        isActive: true,
        isAvailable: true
      },
      $req: req,
      $res: res
    }, (err, result) => {

      if (result.count > 0) {
        response.done = true
        response.message = site.word('acountActivated')[req.headers.language]
        response.errorCode = site.var('succeed')
      }
      if (result.count == 0) {
        response.done = false
        response.message = site.word('acountNotActivated')[req.headers.language]
        response.errorCode = site.var('failed')
      }
      res.json(response)
    })
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

  site.post("/api/doctors/getDoctorByDepartments", (req, res) => {
    let response = {}
    let doctor_doc = req.body
    req.headers.language = req.headers.language || "en"
    $doctors.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'department._id': String(doctor_doc.department._id),
          isAvailable: true,
          isActive: true
        },
        limit: req.body.limit || 10,
      },
      (err, docs, count) => {
        if (!err && docs) {
          response.docs = docs
          response.totalDocs = count
          response.limit = 10
          response.totalPages = Math.ceil(response.totalDocs / response.limit)
        } else {
          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
        }

        res.json(response);
      },
    );
  })






  // get doctor During Distance

  site.post("/api/doctors/getDoctorDuringDistance", (req, res) => {

    let response = {}
    let doctor_doc = req.body
    let distance = 30 * 1000
    req.headers.language = req.headers.language || 'en'
    $doctors.aggregate([{
        "$geoNear": {
          "near": {
            "type": "Point",
            "coordinates": [
              doctor_doc.lat,
              doctor_doc.long
            ]
          },
          "distanceField": "distance",
          "maxDistance": distance,
          "spherical": true
        }
      },
      {
        "$sort": {
          "distance": 1.0
        }
      },
      {
        "$match": {
          "department._id": doctor_doc.departmentId,
          isAvailable: true,
          isActive: true
        }
      }

    ], (err, docs) => {
      if (docs && docs.length > 0) {
        response.docs = docs
        response.errorCode = site.var('succeed')
        response.message = site.word('findSuccessfully')[req.headers.language]
        res.json(response)
      } else {

        response.errorCode = site.var('failed')
        response.message = site.word('findFailed')[req.headers.language]
        res.json(response)
      }

    })
  })


  // get doctor By Rating

  site.post("/api/doctors/getDoctorByRating", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctor_doc = req.body
    $doctors.aggregate([{
        "$geoNear": {
          "near": {
            "type": "Point",
            "coordinates": [
              doctor_doc.lat,
              doctor_doc.long
            ]
          },
          "distanceField": "distance",
          "spherical": true
        }
      },
      {
        "$match": {
          "department._id": doctor_doc.department._id
        }
      },
      {
        "$sort": {
          "rating": -1.0
        }
      }


    ], (err, docs) => {

      if (docs && docs.length > 0) {
        response.docs = docs
        response.errorCode = site.var('succeed')
        response.message = site.word('findSuccessfully')[req.headers.language]
        res.json(response)
      } else {

        response.errorCode = site.var('failed')
        response.message = site.word('findFailed')[req.headers.language]
        res.json(response)
      }

    })
  })


  // add doctor appointment

  site.post("/api/doctors/addDoctorAppointment", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctor_doc = req.body
    $doctors.findOne({
      where: {
        _id: doctor_doc.doctor._id
      }
    }, (err, doc) => {
      if (doc) {
        doc.days.forEach(_d => {
          let date = new Date(_d.date)
          date.setHours(0, 0, 0, 0)
          let bodyDate = new Date(doctor_doc.date)
          bodyDate.setHours(0, 0, 0, 0)
          console.log("date", date);
          console.log("bodyDate", bodyDate);
          if (String(date) == String(bodyDate)) {
            _d.times.push({
              "startSession": doctor_doc.startSession,
              "sessionPeriod": doctor_doc.sessionPeriod,
              "endSession": doctor_doc.endSession,
              status: "available"
            })

          }

        });
        response.done = true,
          response.data = doc
        response.errorCode = site.var('succeed')
        response.message = site.word('updatedSuccessfully')[req.headers.language]
        res.json(response)
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('failedUpdated')[req.headers.language]
        res.json(response)
      }

    })
  })



  // Repeat Doctor Day

  site.post("/api/doctors/repeatDoctorDay", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctor_doc = req.body
    $doctors.findOne({
      where: {
        _id: doctor_doc.doctor._id
      }
    }, (err, doc) => {
      if (doc) {
        doc.days.forEach(_d => {
          let date = new Date(_d.date)
          date.setHours(0, 0, 0, 0)
          let bodyDate = new Date(doctor_doc.oldDate)
          bodyDate.setHours(0, 0, 0, 0)
          if (String(date) == String(bodyDate)) {
            doc.days.push({
              date: doctor_doc.newDate,
              times: _d.times
            })

          }

        });
        response.done = true,
          response.data = doc
        response.errorCode = site.var('succeed')
        response.message = site.word('updatedSuccessfully')[req.headers.language]
        res.json(response)
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('failedUpdated')[req.headers.language]
        res.json(response)
      }

    })
  })

  // get Appointments By Date

  site.post("/api/doctors/getAppointmentsByDate", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctor_doc = req.body
    $doctors.findOne({
      where: {
        _id: doctor_doc.doctor._id
      }
    }, (err, doc) => {
      if (doc) {
        let arr = []
        doc.days.forEach(_d => {
          let date = new Date(_d.date)
          date.setHours(0, 0, 0, 0)
          let bodyDate = new Date(doctor_doc.date)
          bodyDate.setHours(0, 0, 0, 0)
          if (String(date) == String(bodyDate)) {
            arr = _d.times
          }

        });
        response.done = true,
          response.data = arr
        response.errorCode = site.var('succeed')
        response.message = site.word('updatedSuccessfully')[req.headers.language]
        res.json(response)
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('failedUpdated')[req.headers.language]
        res.json(response)
      }

    })
  })



  // close appointment

  site.post("/api/doctors/closeAppointment", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctor_doc = req.body
    $doctors.findOne({
      where: {
        _id: doctor_doc.doctor._id
      }
    }, (err, doc) => {
      if (doc) {
        let arr = []
        doc.days.forEach(_d => {
          let date = new Date(_d.date)
          date.setHours(0, 0, 0, 0)
          let bodyDate = new Date(doctor_doc.date)
          bodyDate.setHours(0, 0, 0, 0)
          if (String(date) == String(bodyDate)) {
            _d.times.forEach(_t => {
              if (_t.status = 'available' && new Date(_t.startSession).getTime() == new Date(doctor_doc.startSession).getTime()) {

                _t.status = 'unAvailable'
              }
            });
          }

        });
        $doctors.update(doc, (err, result) => {

          response.done = true,
            response.data = doc,
            response.errorCode = site.var('succeed')
          response.message = site.word('appointmentClosed')[req.headers.language]

          res.json(response)
        })
      }

    })
  })

  // remove date and appointments

  site.post("/api/doctors/removeDayByDate", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctor_doc = req.body
    $doctors.findOne({
      where: {
        _id: doctor_doc.doctor._id
      }
    }, (err, doc) => {
      if (doc) {
        let arr = []
        doc.days.forEach(_d => {
          let date = new Date(_d.date)
          date.setHours(0, 0, 0, 0)
          let bodyDate = new Date(doctor_doc.date)
          bodyDate.setHours(0, 0, 0, 0)
          if (String(date) == String(bodyDate)) {
            // console.log(_d);
            doc.days.splice(doc.days.indexOf(_d), 1)
          }

        });
        $doctors.update(doc, (err, result) => {

          response.done = true,
            response.data = doc,
            response.errorCode = site.var('succeed')
          response.message = site.word('dateRemoved')[req.headers.language]


          res.json(response)
        })

      }

    })
  })


  // rating Doctors
  site.post('/api/doctors/ratingDoctors', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctors_doc = req.body;
    Number.prototype.between = function (a, b) {
      var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
      return this > min && this < max;
    };

    if (!doctors_doc.rating.between(0, 5.1)) {
      response.message = site.word('pharmacyRatingError')[req.headers.language],
        res.json(response)
    }

    let createdObj = {
      user: {
        _id: doctors_doc.user._id
      },

      target: {
        _id: doctors_doc.doctor._id
      },
      rating: doctors_doc.rating,
      type: "doctor",
      description: doctors_doc.description,
    }

    $rating.add(createdObj, (err1, doc1) => {

      if (!err1) {
        response.data = doc1;
        response.errorCode = site.var('succeed')
        response.message = site.word('ratingCreated')[req.headers.language],
          res.json(response)

        $rating.aggregate([{
            "$match": {
              "type": "doctor",
              "target._id": doctors_doc.doctor._id
            }
          },
          {
            "$group": {
              "_id": null,
              "avgRating": {
                "$avg": "$rating"
              }
            }
          }
        ], (err, docs) => {
          console.log(docs);
          if (docs && docs.length > 0) {
            let avg = docs[0]

            $doctors.edit({
              where: {
                _id: doctors_doc.doctor._id,
              },
              set: {
                rating: avg ? avg.avgRating : 0
              },
              $req: req,
              $res: res
            })
          }

        })

      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('ratingFailed')[req.headers.language],
          res.json(response)
      }

    });

  });

  // Update Doctors 

  site.post('/api/doctors/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let doctors_doc = req.body
    doctors_doc.updatedAt = new Date(),
      $doctors.edit({
        where: {
          _id: (req.params.id)
        },
        set: doctors_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $doctors.findOne({
            where: {
              _id: (req.params.id)
            }
          }, (err, doc) => {
            if (doc) {
              response.done = true,
                response.data = doc
              response.errorCode = site.var('succeed')
              response.message = site.word('updatedSuccessfully')[req.headers.language]
              res.json(response)
            } else {
              response.done = false,
                response.errorCode = site.var('failed')
              response.message = site.word('failedUpdated')[req.headers.language]
              res.json(response)
            }

          })

        } else {
          response.done = false,
            response.data = doc
          response.errorCode = site.var('failed')
          response.message = site.word('failedUpdate')[req.headers.language]
          res.json(response)
        }

      })
  })


  // get All doctors

  site.get("/api/doctors", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $doctors.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        if (!err) {


          response.docs = docs
          response.totalDocs = count
          response.limit = 10
          response.totalPages = Math.ceil(response.totalDocs / response.limit)
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );


  })

  // get Doctors By Id

  site.get("/api/doctors/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $doctors.findOne({
        where: {
          _id: req.params.id,
        },

      },
      (err, doc) => {
        if (!err && doc) {
          response.data = doc
          response.errorCode = site.var('succeed')
          response.message = site.word('findSuccessfully')[req.headers.language]
          response.done = true;
        }
        if (!doc) {
          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
        }
        res.json(response);
      },
    );

  })

  // Hard Delete Doctors
  site.post('/api/doctors/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $doctors.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('doctorsDeleted')[req.headers.language]
          } else {
            response.done = false,
              response.errorCode = site.var('failed')
            response.message = site.word('failedDelete')[req.headers.language]
          }
          res.json(response);
        },
      );
    }
  });

  // Search doctors By Name 
  site.post('/api/doctors/search', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let where = {
      ...req.body
    };



    if (where['gender']) {
      where['gender'] = String(where['gender']);
    }

    if (where['rating']) {
      where['rating'] = Number(where['rating']);
    }

    if (where.fromPrice && where.toPrice) {
      let d1 = Number(where.fromPrice)
      let d2 = Number(where.toPrice)

      where.price = {
        '$gte': d1,
        '$lte': d2
      }
      delete where.toPrice
      delete where.fromPrice
    }
    if (where.fromPrice) {
      let d1 = Number(where.fromPrice)


      where.price = {
        '$gte': d1
      }
      delete where.fromPrice
    }
    if (where.toPrice) {
      let d1 = Number(where.toPrice)


      where.price = {
        '$lte': d1
      }
      delete where.toPrice
    }

    if (where['degree']) {
      where['degree._id'] = where['degree']._id;
      delete where['degree']
    }
    if (where['department']) {
      where['department._id'] = where['department']._id;
      delete where['department']
    }
    if (where['city']) {
      where['city._id'] = where['city']._id;
      delete where['city']
    }
    if (where['lat']) {
      delete where['lat']
    }
    if (where['long']) {
      delete where['long']
    }

    // var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // var d = new Date(where['date']);
    // var dayName = days[d.getDay()];
    // console.log(dayName);
    let doctor_doc = req.body
    let lat = doctor_doc.lat
    let long = doctor_doc.long

    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $doctors.aggregate([{
        "$geoNear": {
          "near": {
            "type": "Point",
            "coordinates": [
              lat,
              long
            ]
          },
          "distanceField": "distance",
          "spherical": true
        }
      },
      {
        "$match": where
      },
      {
        "$sort": {
          "rating": -1.0
        }
      },
      {
        $skip: skip || 0
      },
      {
        $limit: limit
      }

    ], (err, docs) => {
      if (docs && docs.length > 0) {
        response.done = true
        response.docs = docs
        response.totalDocs = docs.length
        response.limit = 10
        response.totalPages = Math.ceil(response.totalDocs / response.limit)
        res.json(response)
      } else {

        response.docs = docs
        response.errorCode = site.var('failed')
        response.message = site.word('findFailed')[req.headers.language]
        response.done = false;
        res.json(response)
      }

    })


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
};
module.exports = function init(site) {
  const $consultationDoctors = site.connectCollection('consultationDoctors');
  const $consultation = site.connectCollection('consultation');
  const $users_info = site.connectCollection('users_info');

  let ObjectID = require('mongodb').ObjectID

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
    require: {
      permissions: []
    }
  });

  site.get({
    name: 'consultationDoctors',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });

  // Add New consultationDoctors With Not Duplicate Name Validation

  site.post({
    name: '/api/consultationDoctors/add',
    require: {
      permissions: []
    }
  }, (req, res) => {
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
    req.headers.language = req.headers.language || 'en'
    doctors_doc.isActive = true,
      doctors_doc.isAvailable = true,
      doctors_doc.createdAt = new Date()
    doctors_doc.updatedAt = new Date()

    let user = {
      name: doctors_doc.fullName,
      mobile: doctors_doc.phone,
      email: doctors_doc.email,
      password: doctors_doc.password,
      image_url: doctors_doc.image,
      type: 'consultationDoctor'
    }
    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }
    $consultationDoctors.add(doctors_doc, (err, doc) => {
      if (!err) {
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
            $consultationDoctors.updateOne(doc);
          }
        })
        response.data = doc;
        response.errorCode = 200
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

  // Update consultationDoctors 

  site.post('/api/consultationDoctors/update/:id', (req, res) => {
    let response = {}
    let doctors_doc = req.body
    doctors_doc.updatedAt = new Date(),
      req.headers.language = req.headers.language || 'en'
    $consultationDoctors.edit({
      where: {
        _id: (req.params.id)
      },
      set: doctors_doc,
      $req: req,
      $res: res
    }, err => {

      if (!err) {
        $consultationDoctors.findOne({
          where: {
            _id: (req.params.id)
          }
        }, (err, doc) => {
          if (doc) {
            response.done = true,
              response.data = doc
            response.errorCode = 200
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


  // get All doctorses

  site.get("/api/consultationDoctors", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    req.headers.language = req.headers.language || 'en'
    $consultationDoctors.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip,
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

  // get consultationDoctors By Id

  site.get("/api/consultationDoctors/:id", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    $consultationDoctors.findOne({
        where: {
          _id: req.params.id,
        },

      },
      (err, doc) => {
        if (!err && doc) {
          response.data = doc
          response.errorCode = 200
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



  // get finished consultations during day

  site.post("/api/consultationDoctors/getFinishedConsultations", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'doctor._id': String(req.session.user.ref_info._id),
          'status.statusId': site.var('finishedId'),
          startConsultation: {
            $lt: new Date(),
            $gte: new Date(new Date().setDate(new Date().getDate() - 1))
          },

        },
        limit: req.body.limit || 10,
      },
      (err, docs, count) => {
        if (!err && docs.length>0) {
          response.data = {
            docs: docs,
            totalDocs: count,
            limit: 10,
            totalPages: Math.ceil(count / 10)
          }
          response.errorCode = 200
          response.message = site.word('findSuccessfully')[req.headers.language]
          response.done = true;
        } else {
          response.data = {
            docs: [],
          
          }
          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
        }
        res.json(response);
      },
    );
  })


  // get Active consultations 

  site.post("/api/consultationDoctors/getActiveConsultations", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'

    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultationDoctors.findOne({
        where: {
          _id: req.session.user.ref_info._id,
        },

      },
      (err, doc) => {

        if (!err && doc) {

          $consultation.findMany({
              select: req.body.select || {},
              sort: req.body.sort || {
                id: -1,
              },
              where: {
                'department._id': String(doc.department._id),
                'status.statusId': site.var('activeId'),
              },
              limit: req.body.limit || 10,
            },
            (err, docs, count) => {
              if (!err && docs.length > 0) {

                response.data = {
                  docs: docs,
                  totalDocs: count,
                  limit: 10,
                  totalPages: Math.ceil(count / 10)
                }
                response.errorCode = 200
                response.message = site.word('findSuccessfully')[req.headers.language]
                response.done = true;
              } else {
                response.data = {
                  docs: [],
                 
                }
                response.errorCode = site.var('failed')
                response.message = site.word('findFailed')[req.headers.language]
                response.done = false;
              }

              res.json(response);
            },
          );

        }
        if (!doc) {
          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
          res.json(response);
        }
      },

    );




  })



  // update consultation doctor un available

  site.post("/api/consultationDoctors/updateStatusUnAvailable", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultationDoctors.edit({
      where: {
        _id: req.session.user.ref_info._id,
        isAvailable: true
      },
      set: {
        isAvailable: false
      },
      $req: req,
      $res: res
    }, (err, result) => {
      if (result.count > 0) {
        response.done = true
        response.message = site.word('doctorUnAvailable')[req.headers.language]
        response.errorCode = site.var('succeed')
      }
      if (result.count == 0) {
        response.done = false
        response.message = site.word('failedDoctorUnAvailable')[req.headers.language]
        response.errorCode = site.var('failed')
      }
      res.json(response)

    })


  })






  // update consultation doctor available

  site.post("/api/consultationDoctors/updateStatusAvailable", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultationDoctors.edit({
      where: {
        _id: req.session.user.ref_info._id,
        isAvailable: false
      },
      set: {
        isAvailable: true
      },
      $req: req,
      $res: res
    }, (err, result) => {
      if (result.count > 0) {
        response.done = true
        response.message = site.word('doctorAvailable')[req.headers.language]
        response.errorCode = site.var('succeed')
      }
      if (result.count == 0) {
        response.done = false
        response.message = site.word('failedDoctorAvailable')[req.headers.language]
        response.errorCode = site.var('failed')
      }
      res.json(response)

    })


  })



  // get Doctor profile






  // get finished details consultation

  site.post("/api/consultationDoctors/getFinishedConsultationDetails", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    let consultation_doc = req.body
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findOne({
      where: {
        _id: consultation_doc._id
      },
    }, (err, doc) => {
      if (doc) {
        let obj = {
          date: (doc.startConsultation).toDateString(),
          period: doc.consultationPeriod,
          name: doc.user.name,
          gender: doc.user.gender,
        }
        response.data = obj
        response.done = true
        response.message = site.word('findConsultation')[req.headers.language]
        response.errorCode = site.var('succeed')
      }
      if (!doc) {
        response.done = false
        response.message = site.word('failedFindConsultation')[req.headers.language]
        response.errorCode = site.var('failed')
      }
      res.json(response)
    })
  })


  // Update Password

  site.post("/api/consultationDoctors/updatePassword", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    let consultation_doc = req.body
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultationDoctors.findOne({
      where: {
        _id: req.session.user.ref_info._id
      },
    }, (err, doc) => {


      if (doc && doc.password == consultation_doc.password) {
        $consultationDoctors.edit({
          where: {
            _id: req.session.user.ref_info._id
          },
          set: {
            password: consultation_doc.newPassword
          },
          $req: req,
          $res: res
        })
        $users_info.edit({
          where: {
            _id: doc.user_info._id
          },
          set: {
            password: consultation_doc.newPassword
          },
          $req: req,
          $res: res
        }, (err, result) => {
  
          response.done = true
          response.message = site.word('resetPassword')[req.headers.language]
          response.errorCode = site.var('succeed')
  
          res.json(response)
        })

      }
      if (!doc || doc.password != consultation_doc.password) {
        response.done = false
        response.message = site.word('passwordNotCorrect')[req.headers.language]
        response.errorCode = site.var('failed')
        res.json(response)
      }
    })
  })

  // Hard Delete consultationDoctors
  site.post('/api/consultationDoctors/delete/:id', (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    let id = req.params.id;

    if (id) {
      $consultationDoctors.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = 200
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

  // Search doctorses By Name 
  site.post('/api/consultationDoctors/search', (req, res) => {



    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    let where = req.body || {};

    if (where['userName']) {
      where['userName'] = site.get_RegExp(where['userName'], 'i');
    }
    if (where['department']) {
      where['department._id'] = where['department']._id;
      delete where['department']
    }
    if (where['fullName']) {
      where['fullName'] = site.get_RegExp(where['fullName'], 'i');
    }
    if (where['idNumber']) {
      where['idNumber'] = site.get_RegExp(where['idNumber'], 'i');
    }
    if (where['email']) {
      where['email'] = String(where['email']);
    }
    if (where['phone']) {
      where['phone'] = String(where['phone']);
    }
    let limit = 10;
    let skip
    // if (!req.query.page ||( parseInt(req.query.page)&&parseInt(req.query.page)==1)) {
    //   limit=10
    // }
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $consultationDoctors.findMany({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip,
      },
      (err, docs, count) => {
        if (docs.length > 0) {
          response.done = true
          response.docs = docs
          response.totalDocs = count
          response.limit = 10
          response.totalPages = Math.ceil(response.totalDocs / response.limit)
        } else {
          response.docs = docs
          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
        }
        res.json(response);
      },
    );
  });
  site.post('/api/consultationDoctors/update1', (req, res) => {
    let response = {
      done: false,
    };
    let consultationDoctors_doc = req.body;
    if (consultationDoctors_doc.id) {
      $consultationDoctors.edit({
          where: {
            id: consultationDoctors_doc.id,
          },
          set: consultationDoctors_doc,
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

  site.post('/api/consultationDoctors/view', (req, res) => {
    let response = {
      done: false,
    };



    $consultationDoctors.findOne({
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
  site.post('/api/consultationDoctors/delete1', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.body.id;

    if (id) {
      $consultationDoctors.delete({
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
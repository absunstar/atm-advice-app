module.exports = function init(site) {
  const $patients = site.connectCollection('patients');
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
    name: 'patients',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });


  site.get({
    name: 'patients/forgetPassword',
    path: __dirname + '/site_files/html/forgetPassword.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });

  site.get({
    name: 'patients/resendCode',
    path: __dirname + '/site_files/html/resendCode.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });

  site.get({
    name: 'patients/checkCorrectPassword',
    path: __dirname + '/site_files/html/checkCorrectPassword.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });
  site.get({
    name: 'patients/myOrders',
    path: __dirname + '/site_files/html/myOrders.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });


  site.on('[register][patient][add]', (doc, callback) => {
    doc.active = true,
    
    $patients.add(doc, (err, doc) => {
      callback(err, doc)
    })
  })



  // Add New patients 

  site.post({
    name: '/api/patients/add',
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
    let patients_doc = req.body;
    if (patients_doc.image_url) {
      patients_doc.image = new Array({
        name: patients_doc.image_url
      })
    }
    if (patients_doc.card_url) {
      patients_doc.cardImage = new Array({
        name: patients_doc.card_url
      })
    }
    patients_doc.$req = req;
    patients_doc.$res = res;
    patients_doc.isActive = false,
      patients_doc.varifyMessage = randomNumber(4)
    patients_doc.createdAt = new Date()
    patients_doc.updatedAt = new Date()
    patients_doc.balance = 0
    $patients.findOne({
        where: {
          $or: [{
              $and: [{
                'phone': patients_doc.phone
              }, {
                isActive: true
              }]
            },
            {
              'email': patients_doc.email
            },

          ]
        },
      },


      (err, doc) => {

        if (!err && doc) {

          if (doc.phone === patients_doc.phone && doc.isActive == true) {
            response.errorCode = site.var('failed')
            response.message = site.word('phoneExist')[req.headers.language]
            response.done = false;
            res.json(response);
            return
          }

          if (doc.phone === patients_doc.phone && doc.isActive == false) {
            response.errorCode = site.var('succeed')
            response.message = site.word('findUser')[req.headers.language]
            response.done = true;
            let {
              password,
              ...rest1
            } = doc
            response.data = rest1
            res.json(response);
            return
          }
          if (patients_doc.hasInsurance && !patients_doc.insuranceNumber) {
            response.errorCode = site.var('failed')
            response.message = site.word('insuranceNumbermissing')[req.headers.language]
            response.done = false;
            res.json(response);
            return
          }
          if (doc.email === patients_doc.email) {
            response.errorCode = site.var('failed')
            response.message = site.word('emailExist')[req.headers.language]
            response.done = false;
            res.json(response);
          }
        } else {
          let user = {
            name: patients_doc.fullName,
            mobile: patients_doc.phone,
            email: patients_doc.email,
            password: patients_doc.password,
            image_url: patients_doc.image,
            type: 'patient'
          }
          user.profile = {
            name: user.name,
            mobile: user.mobile,
            image_url: user.image_url
          }
          $patients.add(patients_doc, (err, doc) => {
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
                  $patients.updateOne(doc);
                }
              })
              let {
                password,
                ...rest
              } = doc
              response.data = rest;
              response.errorCode = site.var('succeed')
              response.message = site.word('userCreated')[req.headers.language]
              response.done = true;
            } else {
              response.errorCode = site.var('failed')
              response.message = site.word('errorHappened')[req.headers.language]
              response.done = false;
            }
            res.json(response);
          });
        }
      })

  });

  // random number for varifacation code

  const randomNumber = (length) => {
    let text = "";
    let possible = "123456789";
    for (let i = 0; i < length; i++) {
      let sup = Math.floor(Math.random() * possible.length);
      text += i > 0 && sup == i ? "0" : possible.charAt(sup);
    }
    return (text);
  }

  // add image to patient
  site.post('/api/patients/upload/image/patients', (req, res) => {
    site.createDir(site.dir + '/../../uploads/' + 'patients', () => {
      site.createDir(site.dir + '/../../uploads/' + 'patients' + '/images', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
          let newpath = site.dir + '/../../uploads/' + 'patients' + '/images/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            response.image_url = '/api/image/' + 'patients' + '/' + newName;
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


  // // get image from user

  //   site.get('/api/image/:category/:name', (req, res) => {
  //     res.set('Cache-Control', 'public, max-age=2592000');
  //     res.download(site.dir + '/../../uploads/' + req.params.category + '/images/' + req.params.name);
  //   });

  // Reset patients Password
  site.post('/api/patients/resetPassword', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let patients_doc = req.body
    $patients.findOne({
      where: {
        phone: (patients_doc.phone)
      }
    }, (err, doc) => {
      if (doc) {
        $patients.edit({
          where: {
            phone: (patients_doc.phone)
          },
          set: {
            password: patients_doc.password
          },
          $req: req,
          $res: res
        })
        $users_info.edit({
          where: {
            mobile: (patients_doc.phone)
          },
          set: {
            password: patients_doc.password
          },
          $req: req,
          $res: res
        }, (err, result) => {

          response.done = true
          response.message = site.word('resetPassword')[req.headers.language]
          response.errorCode = site.var('succeed')

          res.json(response)
        })

      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('phoneNotFound')[req.headers.language]
        res.json(response)
      }

    })

  });



  // charge balance
  site.post('/api/patients/chargeBalance', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let patients_doc = req.body
    $patients.findOne({
      where: {
        _id: (patients_doc._id)
      }
    }, (err, doc) => {
      if (doc) {
        $patients.edit({
          where: {
            _id: (patients_doc._id)
          },
          set: {
            balance: doc.balance + patients_doc.balance
          },
          $req: req,
          $res: res
        }, (err, result) => {

          if (result.count > 0) {
            response.done = true
            response.message = site.word('balanceRecharge')[req.headers.language]
            response.errorCode = site.var('succeed')
          }
          if (result.count == 0) {
            response.done = false
            response.message = site.word('wrongHappened')[req.headers.language]
            response.errorCode = site.var('failed')
          }
          res.json(response)
        })
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('phoneNotFound')[req.headers.language]
        res.json(response)
      }

    })

  });



  // check Activity

  site.post('/api/patients/checkActivity', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let patients_doc = req.body

    $patients.findOne({
      where: {
        phone: (patients_doc.phone)
      }
    }, (err, doc) => {
      if (doc) {
        if (doc.isActive == false) {
          $patients.edit({
            where: {
              isActive: false,
              phone: (patients_doc.phone)
            },
            set: {
              isActive: true
            },
            $req: req,
            $res: res
          }, (err, result) => {

            if (result.count > 0) {
              response.done = true
              // response.token = req.session ? req.session.accessToken : null
              response.message = site.word('accountActivated')[req.headers.language]
              response.errorCode = site.var('succeed')
            }
            res.json(response)
          })
          return
        }

        if (doc.isActive == true) {
          response.done = false
          response.message = site.word('accountAlreadyActivated')[req.headers.language]
          response.errorCode = site.var('failed')
          res.json(response)
          return
        }

      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('phoneNotFound')[req.headers.language]
        res.json(response)
      }

    })
  })




  // resend code

  site.post('/api/patients/resendCode', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let patients_doc = req.body
    $patients.findOne({
      where: {
        phone: (patients_doc.phone)
      }
    }, (err, doc) => {
      if (doc) {
        response.varifyMessage = randomNumber(4)
        // response.token = req.session ? req.session.accessToken : null
        response.done = true,
          response.errorCode = site.var('succeed')
        response.message = site.word('codeResend')[req.headers.language]
        res.json(response)
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('phoneNotFound')[req.headers.language]
        res.json(response)
      }
    })
  })


  // forget password

  site.post('/api/patients/forgetPassword', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let patients_doc = req.body
    $patients.findOne({
      where: {
        phone: (patients_doc.phone)
      }
    }, (err, doc) => {
      if (doc) {
        response.code = randomNumber(4)
        response.done = true,
          response.errorCode = site.var('succeed')
        response.message = site.word('codeResend')[req.headers.language]
        res.json(response)
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('phoneNotFound')[req.headers.language]
        res.json(response)
      }
    })
  })

  // get profile

  site.post('/api/patients/getProfile', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
   
      $patients.findOne({
        where: {
          _id: req.session.user.ref_info._id
        }
      }, (err, doc) => {
        if (doc) {
          response.data = doc
          response.done = true,
            response.errorCode = site.var('succeed')
          response.message = site.word('findProfile')[req.headers.language]
          res.json(response)
        } else {
          response.done = false,
            response.errorCode = site.var('failed')
          response.message = site.word('noProfileFound')[req.headers.language]
          res.json(response)
        }
      })
  })


  // Update patients 

  site.post('/api/patients/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let gov_doc = req.body
    gov_doc.updatedAt = new Date(),
      $patients.edit({
        where: {
          _id: (req.params.id)
        },
        set: gov_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $patients.findOne({
            where: {
              _id: (req.params.id)
            }
          }, (err, doc) => {
            if (doc) {
              let {
                password,
                ...rest
              } = doc
              response.done = true,
                response.data = rest
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


  // get All patients

  site.get("/api/patients", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $patients.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        if (!err) {
          let noPassList = []
          for (const iterator of docs) {
            let {
              password,
              ...rest
            } = iterator
            noPassList.push(rest)
          }
          response.docs = noPassList
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


  // change Password

  site.post("/api/patients/changePassword", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    let consultation_doc = req.body

    $patients.findOne({
      where: {
        _id: req.session.user.ref_info._id
      },
    }, (err, doc) => {


      if (doc && doc.password == consultation_doc.password) {
        $patients.edit({
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
            _id: req.session.user._id
          },
          set: {
            password: consultation_doc.newPassword
          },
          $req: req,
          $res: res
        }, (err, result) => {

          response.done = true
          response.message = site.word('updatePassword')[req.headers.language]
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


  // get patients By Id

  site.get("/api/patients/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $patients.findOne({
        where: {
          _id: req.params.id,
        },

      },
      (err, doc) => {
        if (!err && doc) {
          let {
            password,
            ...rest
          } = doc
          response.data = rest
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

  // Hard Delete patients
  site.post('/api/patients/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $patients.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('userDeleted')[req.headers.language]
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

  // Search patients By Name 
  site.post('/api/patients/search', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['fullName']) {
      where['fullName'] = site.get_RegExp(where['fullName'], 'i');
    }

    if (where['idNumber']) {
      where['idNumber'] = String(where['idNumber']);
    }

    if (where['email']) {
      where['email'] = String(where['email']);
    }
    if (where['phone']) {
      where['phone'] = String(where['phone']);
    }

    if (where['contractingCompany']) {
      where['contractingCompany'] = site.get_RegExp(where['contractingCompany'], 'i');
    }

    if (where['insuranceCompany']) {
      where['insuranceCompany._id'] = String(where['insuranceCompany']._id);
      delete where['insuranceCompany']
    }

    if (where['insuranceNumber']) {
      where['insuranceNumber'] = String(where['insuranceNumber']);
    }
    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $patients.findMany({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip
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
  site.post('/api/patients/update1', (req, res) => {
    let response = {
      done: false,
    };
    let patients_doc = req.body;
    if (patients_doc.id) {
      $patients.edit({
          where: {
            id: patients_doc.id,
          },
          set: patients_doc,
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

  site.post('/api/patients/view', (req, res) => {
    let response = {
      done: false,
    };



    $patients.findOne({
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
  site.post('/api/patients/delete1', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.body.id;

    if (id) {
      $patients.delete({
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
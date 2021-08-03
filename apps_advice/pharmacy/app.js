module.exports = function init(site) {
  const $pharmacy = site.connectCollection('pharmacy');
  const $orders = site.connectCollection('orders');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
    require: {
      permissions: []
    }
  });

  site.get({
    name: 'pharmacy',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });

  site.on('[orders][pharmacy][show]', (obj, callback) => {
    let response = {}
    console.log("from pharmacy", obj);
    $pharmacy.findMany({

      where: {
        isActive: true,
        isAvailable: true
      },
    }, (err, docs, count) => {
      if (!err && docs && docs.length > 0) {
        // fcm.send(obj.message, function (err, response) {
        //   if (err) {
        //     console.log("Something has gone wrong!", err);
        //   } else {
        //     console.log("Successfully sent with response: ", response);
        //   }
        // })
      } else {
        console.log("not found pharmacies");
      }
    })


  })


  // Add New pharmacy With Not Duplicate Name Validation

  site.post({
    name: '/api/pharmacy/add',
    require: {
      permissions: []
    }
  }, (req, res) => {

    let response = {};

    let pharmacy_doc = req.body
    pharmacy_doc.$req = req;
    pharmacy_doc.$res = res;
    if (typeof pharmacy_doc.lat == 'string') {
      pharmacy_doc.lat = Number(pharmacy_doc.lat)
    }
    if (typeof pharmacy_doc.long == 'string') {
      pharmacy_doc.long = Number(pharmacy_doc.long)
    }
    if (pharmacy_doc.image_url) {
      pharmacy_doc.image = new Array({
        name: pharmacy_doc.image_url
      })
    }
    pharmacy_doc.isActive = false
    pharmacy_doc.isAvailable = false
    pharmacy_doc.createdAt = new Date()
    pharmacy_doc.updatedAt = new Date()


    req.headers.language = req.headers.language || 'en'
    $pharmacy.find({
        where: {
          $or: [{
              'userName': pharmacy_doc.userName
            },
            {
              'email': pharmacy_doc.email
            },
            {
              'phone': pharmacy_doc.phone
            },
          ]
        },
      },
      (err, findDoc) => {
        if (!err && findDoc) {
          response.done = false
          response.errorCode = site.var('failed')
          if (findDoc.userName === pharmacy_doc.userName) {
            response.message = site.word('userNameIsExist')[req.headers.language]

          }
          if (findDoc.email === pharmacy_doc.email) {
            response.message = site.word('emailIsExist')[req.headers.language] //[req.headers.language];
          }
          if (findDoc.phone === pharmacy_doc.phone) {
            response.message = site.word('phoneIsExist')[req.headers.language] //[req.headers.language];\
          }
          res.json(response);


        } else {
          let user = {
            name: pharmacy_doc.pharmacyName,
            mobile: pharmacy_doc.phone,
            email: pharmacy_doc.email,
            password: pharmacy_doc.password,
            username: pharmacy_doc.userName,
            image_url: pharmacy_doc.image,
            type: 'pharmacy'
          }
          user.profile = {
            name: user.name,
            mobile: user.mobile,
            image_url: user.image_url
          }

          if (!pharmacy_doc.password) {
            response.errorCode = site.var('failed')
            response.message = site.word('passwordMissing')[req.headers.language]
            response.done = false;
            res.json(response);
            return
          }
          if (pharmacy_doc.lat && pharmacy_doc.long) {
            let location = new Array(pharmacy_doc.lat, pharmacy_doc.long)
            pharmacy_doc.location = {
              type: "Point",
              coordinates: location
            }
            $pharmacy.createIndex({
              location: "2dsphere"
            })
          }


          $pharmacy.add(pharmacy_doc, (err, doc) => {
            console.log(err);
            if (!err) {
              let {
                password,
                ...rest
              } = doc

              user.ref_info = {
                _id: doc._id
              }

              console.log("111111111111111111111111111111111111111");
              site.security.addUser(user, (err, userDoc) => {
                if (!err) {
                  delete user._id
                  delete user.id
                  doc.user_info = {
                    _id: userDoc._id
                  }
                  $pharmacy.updateOne(doc);
                }
              })
              response.data = rest;
              response.errorCode = site.var('succeed')
              // response.message = site.words['pharmacyCreated'][req.headers.language]
              response.message = site.word('pharmacyCreated')[req.headers.language]
              response.done = true;

            } else {
              response.errorCode = site.var('failed')
              response.message = site.word('errorHappened')[req.headers.language]
              response.done = false;
            }

            res.json(response);
          });
        }
      },
    );
  });



  // add image to pharmacy
  site.post('/api/pharmacy/upload/image/pharmacy', (req, res) => {
    site.createDir(site.dir + '/../../uploads/' + 'pharmacy', () => {
      site.createDir(site.dir + '/../../uploads/' + 'pharmacy' + '/images', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
          let newpath = site.dir + '/../../uploads/' + 'pharmacy' + '/images/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            response.image_url = '/api/image/' + 'pharmacy' + '/' + newName;
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


  // get not active
  site.post('/api/pharmacy/getNotActivePharmacy', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let pharmacy_doc = req.body;

    $pharmacy.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          isActive: false
        },

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
  });


  // change status active
  site.post('/api/pharmacy/changeStatusActive', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let pharmacy_doc = req.body;

    $pharmacy.edit({
      where: {
        _id: pharmacy_doc._id,
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



  // change status UnAvailable
  // need request session user
  site.post('/api/pharmacy/updatePharmacyAvailable', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    $pharmacy.findOne({
      where: {
        _id: req.session.user.ref_info._id
      }
    }, (err, doc) => {
      if (doc) {
        if (doc.isAvailable == true) {

          $pharmacy.edit({
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
            response.done = false
            response.message = site.word('acountAvailable')[req.headers.language]
            response.errorCode = site.var('succeed')
            res.json(response)
          })
        }
        if (doc.isAvailable == false) {

          $pharmacy.edit({
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
            response.done = true
            response.message = site.word('acountNotAvailable')[req.headers.language]
            response.errorCode = site.var('succeed')
            res.json(response)
          })
        }


      }

    })

  });


  // change status Available
  // need request session user
  site.post('/api/pharmacy/updatePharmacyAvailable', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    $pharmacy.edit({
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
      response.done = true
      response.message = site.word('acountAvailable')[req.headers.language]
      response.errorCode = site.var('succeed')
      res.json(response)
    })
  });


  // change Password

  site.post("/api/pharmacy/changePassword", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    let pharmacy_doc = req.body

    $pharmacy.findOne({
      where: {
        _id: req.session.user.ref_info._id
      },
    }, (err, doc) => {


      if (doc && doc.password == pharmacy_doc.password) {
        $pharmacy.edit({
          where: {
            _id: req.session.user.ref_info._id
          },
          set: {
            password: pharmacy_doc.newPassword
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
      if (!doc || doc.password != pharmacy_doc.password) {
        response.done = false
        response.message = site.word('passwordNotCorrect')[req.headers.language]
        response.errorCode = site.var('failed')
        res.json(response)
      }
    })
  })

  // get Available Pharmacy

  site.post("/api/pharmacy/getAvailablePharmacy", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $pharmacy.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          isAvailable: true
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true
          response.message = site.word('findSuccessfully')[req.headers.language]
          response.errorCode = site.var('succeed')

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


  // get Active Orders
  // need request session user
  site.post("/api/pharmacy/getActiveOrders", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    console.log(req.session.user.ref_info._id);
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    let pharmacy_doc = req.body
    $orders.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'pharmacy._id': String(req.session.user.ref_info._id),
          'status.statusId': {
            $in: [site.var('inProgressId'), site.var('onWayId')]
          }
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true
          response.message = site.word('findSuccessfully')[req.headers.language]
          response.errorCode = site.var('succeed')
          response.data = {docs : docs , totalDocs : count , limit : 10 , totalPages : Math.ceil(count / 10) }
        } else {
          response.done = false
          response.message = site.word('findFailed')[req.headers.language]
          response.errorCode = site.var('failed')

        }
        res.json(response);
      },
    );


  })


  // get Active Orders
  // need request session user
  site.post("/api/pharmacy/getCurrentOrdersCount", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    console.log(req.session.user.ref_info._id);
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    let pharmacy_doc = req.body
    $orders.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'pharmacy._id': String(req.session.user.ref_info._id),
          'status.statusId': {
            $in: [site.var('inProgressId'), site.var('onWayId')]
          }
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        if (!err) {
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


  // get Previous Orders
  // need request session user
  site.post("/api/pharmacy/getPreviousOrders", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    let pharmacy_doc = req.body
    $orders.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'pharmacy._id': String(req.session.user.ref_info._id),
          'status.statusId': {
            $in: [site.var('shippedId'), site.var('canceledId')]
          }
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        if (!err && docs) {
          response.done = true
          response.message = site.word('findSuccessfully')[req.headers.language]
          response.errorCode = site.var('succeed')

          response.data = {docs : docs , totalDocs : count , limit : 10 , totalPages : Math.ceil(count / 10) }
        
        } else {
          response.done = false
          response.message = site.word('findFailed')[req.headers.language]
          response.errorCode = site.var('failed')

        }
        res.json(response);
      },
    );


  })


  // get Order Details

  site.post("/api/pharmacy/getOrderDetails", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let pharmacy_doc = req.body
    $orders.findOne({
      where: {
        _id: (pharmacy_doc.orderId)
      }
    }, (err, doc) => {
      if (doc) {
        response.done = true,
          response.data = doc
        response.errorCode = site.var('succeed')
        response.message = site.word('findOrder')[req.headers.language]
        res.json(response)
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('orderNotFound')[req.headers.language]
        res.json(response)
      }

    })

  })

  // get Pharmacy During Distance

  site.post("/api/pharmacy/getPharmacyDuringDistance", (req, res) => {


    let response = {}
    let pharmacy_doc = req.body
    let distance = 20 * 1000

    $pharmacy.aggregate([{
        "$geoNear": {
          "near": {
            "type": "Point",
            "coordinates": [
              pharmacy_doc.lat,
              pharmacy_doc.long
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
      }
    ], (err, docs) => {
      console.log(docs);
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


  // get Recent Orders
  site.post("/api/pharmacy/getRecentOrders", (req, res) => {

    let response = {}
    let limit = 10
    let skip
    req.headers.language = req.headers.language || 'en'
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }

    let distance = 20 / 6378.1
    //  $orders.findMany({
    //       select: req.body.select || {},
    //       sort: req.body.sort || {
    //         id: -1,
    //       },
    //       where: {
    //         'status.statusId': site.var('activeId')
    //       },
    //       limit: limit,
    //       skip: skip
    //     },
    //     (err, docs, count) => {
    //       if (!err && docs && docs.length > 0) {
    //         for (const iterator of object) {

    //         }
    //         response.docs = docs
    //         response.totalDocs = count
    //         response.limit = 10
    //         response.totalPages = Math.ceil(response.totalDocs / response.limit)
    //       } else {
    //         response.error = err.message;
    //       }
    //       res.json(response);
    //     },
    //   );


    $pharmacy.findOne({
      where: {
        _id: req.session.user.ref_info._id
      }
    }, (err, doc) => {
      let cityId = doc.city._id
      $orders.aggregate([

        {
          "$match": {
            "$or": [{
                "$and": [{
                    "status.statusId": 1.0
                  },
                  {
                    "address.lat": {
                      "$ne": 0.0
                    }
                  },
                  {
                    "location": {
                      "$geoWithin": {
                        "$centerSphere": [
                          [
                            doc.lat,
                            doc.long
                          ],
                          distance
                        ]
                      }
                    }
                  }
                ]
              },
              {
                "$and": [{
                    "status.statusId": 1.0
                  },
                  {
                    "address.lat": {
                      "$eq": 0.0
                    }
                  },
                  {
                    "address.city._id": cityId
                  }
                ]
              }
            ]
          }
        },

      ], (err, docs) => {
        if (docs && docs.length > 0) {

          response.data = {
            docs,
            totalDocs: docs.length,
            totalPages : Math.ceil(docs.length / 10)
          }
          response.errorCode = site.var('succeed')
          response.done = true
          response.message = site.word('findSuccessfully')[req.headers.language]
          res.json(response)
        } else {
          response.done = false
          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          res.json(response)
        }

      })



    })

  })


  // get Recent Orders Count

  site.post("/api/pharmacy/getRecentOrdersCount", (req, res) => {

    let response = {}

    $orders.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'status.statusId': site.var('activeId')
        },
        limit: req.body.limit || 10,
      },
      (err, docs, count) => {
        if (!err) {
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

  // get Recent Orders Count
  // need change to only count not find all
  site.post("/api/pharmacy/getRecentOrdersCount", (req, res) => {

    let response = {}

    $orders.findMany({
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        where: {
          'status.statusId': site.var('activeId')
        },
        limit: req.body.limit || 10,
      },
      (err, docs, count) => {
        if (!err) {
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


  // Update pharmacy 

  site.post('/api/pharmacy/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let pharmacy_doc = req.body
    pharmacy_doc.updatedAt = new Date(),
      $pharmacy.edit({
        where: {
          _id: (req.params.id)
        },
        set: pharmacy_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $pharmacy.findOne({
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


  // get All pharmacies

  site.get("/api/pharmacy", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $pharmacy.findMany({
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

  // get pharmacy By Id

  site.post("/api/pharmacy/getProfile", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let pharmacy_doc = req.body
    $pharmacy.findOne({
        where: {
          _id: pharmacy_doc._id,
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


  // get pharmacy By Id

  site.get("/api/pharmacy/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $pharmacy.findOne({
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

  // Hard Delete pharmacy
  site.post('/api/pharmacy/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $pharmacy.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('pharmacyDeleted')[req.headers.language]
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

  // Search pharmacies By Name 
  site.post('/api/pharmacy/search', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['pharmacyName']) {
      where['pharmacyName'] = site.get_RegExp(where['pharmacyName'], 'i');
    }
    if (where['userName']) {
      where['userName'] = site.get_RegExp(where['userName'], 'i');
    }
    if (where['branch']) {
      where['branch'] = site.get_RegExp(where['branch'], 'i');
    }
    if (where['email']) {
      where['email'] = String(where['email']);
    }
    if (where['phone']) {
      where['phone'] = String(where['phone']);
    }
    if (where['gov']) {
      where['gov._id'] = where['gov']._id;
      delete where['gov']
    }
    if (where['city']) {
      where['city._id'] = where['city']._id;
      delete where['city']
    }
    if (where['address']) {
      where['address._id'] = where['address']._id;
      delete where['address']
    }
    where.isActive = true
    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }


    $pharmacy.findMany({
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
  site.post('/api/pharmacy/update1', (req, res) => {
    let response = {
      done: false,
    };
    let pharmacy_doc = req.body;
    if (pharmacy_doc.id) {
      $pharmacy.edit({
          where: {
            id: pharmacy_doc.id,
          },
          set: pharmacy_doc,
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

  site.post('/api/pharmacy/view', (req, res) => {
    let response = {
      done: false,
    };



    $pharmacy.findOne({
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
  site.post('/api/pharmacy/delete1', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.body.id;

    if (id) {
      $pharmacy.delete({
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
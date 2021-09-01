module.exports = function init(site) {
  const $orders = site.connectCollection('orders');
  const $notificationData = site.connectCollection('notificationData');
  const $rating = site.connectCollection('rating');
const $patients = site.connectCollection('patients');
let ObjectID = require('mongodb').ObjectID
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    ,require : {permissions : []}
  });

  site.get({
    name: 'orders',
    path: __dirname + '/site_files/html/orders.html',
    parser: 'html',
    compress: true,
    require : {permissions : []}
  });

  // site.get({
  //   name: 'orders',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: true,
  //   require : {permissions : []}
  // });
  // Add New Gov With Not Duplicate Name Validation

  site.post('/api/orders/add', (req, res) => {

    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    // if (!req.session.user) {
    //   response.errorCode = site.var('failed')
    //   response.message = site.word('loginFirst')[req.headers.language]
    //   response.done = false;
    //   res.json(response);
    //   return;
    // }

    let orders_doc = req.body;
    if (orders_doc.user._id.length > 24) {
      let str = orders_doc.user._id;
      str = str.substr(1);
      str = str.substr(0,str.length-1);
      orders_doc.user={
        _id : str
      }
    }
   
      if (orders_doc.address.lat == 0) {
        orders_doc.address.lat = 0.0
      }
      if (orders_doc.address.long == 0) {
        orders_doc.address.long = 0.0
      }
    
    // orders_doc.$req = req;
    // orders_doc.$res = res;
    if (orders_doc.card_url) {
      orders_doc.cardImage = new Array({
        name : orders_doc.card_url
      })
    }
    orders_doc.isActive = true,
      orders_doc.createdAt = new Date()
    orders_doc.updatedAt = new Date()
    orders_doc.isPublished = true
    orders_doc.status = {
      statusId: site.var('activeId'), // status id from vars
      name: site.var('active')
    }
    if (orders_doc.discountPercentage > 100) {
      response.errorCode = site.var('failed')
      response.message = site.word('percentageInCorrect')[req.headers.language]
      response.done = false;
      return
    }
    if (orders_doc.hasInsurance == true) {
      if (!orders_doc.insuranceCompany) {
        response.errorCode = site.var('failed')
        response.message = site.word('insuranceCompanyMissing')[req.headers.language]
        response.done = false;
        return
      }
      if (!orders_doc.insuranceNumber) {
        response.errorCode = site.var('failed')
        response.message = site.word('insuranceNumberMissing')[req.headers.language]
        response.done = false;
        return
      }
    }
    let descList = orders_doc.image.map(li => li.description)
    let arr2 = descList;
    let combined = []
    if (arr2.length > 0) {
      const result = arr2.reduce(function (a, e, i) {

        if (e === '-1')
          a.push(i);
        return a;
      }, [])

      for (const iterator of result) {
        arr2[iterator] = "";
      }
      combined = orders_doc.image.map(function (item, index) {
        return { name: item.name, description: arr2[index] };
      });
      orders_doc.image = combined
    }
if (orders_doc.address && orders_doc.address.lat && orders_doc.address.long) {
  orders_doc.location =  new Array(orders_doc.address.lat, orders_doc.address.long)
}
    $orders.add(orders_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        response.message = site.word('orderCreated')[req.headers.language]
        response.done = true;
      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }
      res.json(response);
      let notificationObj = {
        title: site.word('orderAdded')[req.headers.language],
        order: doc,
        type: "order",
        user: orders_doc.user,
        createdAt: new Date().toLocaleString('en-US'),
      }
      $notificationData.add(notificationObj);
      
    });


  });


  // add image to orders
  site.post('/api/orders/upload/image/orders', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'

    site.createDir(site.dir + '/../../uploads/' + 'orders', () => {
      site.createDir(site.dir + '/../../uploads/' + 'orders' + '/images', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
          let newpath = site.dir + '/../../uploads/' + 'orders' + '/images/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            response.image_url = '/api/image/' + 'orders' + '/' + newName;
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

  // add card image to orders
  
  site.post({name:'/api/orders/upload/cardImage/orders' ,require : {permissions : []}}, (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'

    site.createDir(site.dir + '/../../uploads/' + 'orders', () => {
      site.createDir(site.dir + '/../../uploads/' + 'orders' + '/images', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
          let newpath = site.dir + '/../../uploads/' + 'orders' + '/images/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            response.image_url = '/api/image/' + 'orders' + '/' + newName;
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

  site.get('/api/orders/image/upload/:name', (req, res) => {
    res.set('Cache-Control', 'public, max-age=2592000');
    res.download(site.dir + '/../../uploads/' + req.params.category + '/images/' + req.params.name);
  });


  // Update Order 

  site.post('/api/orders/update/:id', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }

    let gov_doc = req.body
    gov_doc.updatedAt = new Date(),
      $orders.edit({
        where: {
          _id: (req.params.id)
        },
        set: gov_doc,
        $req: req,
        $res: res
      }, (err, result) => {

        if (result.count > 0) {
          $orders.findOne({
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


  // get All Orders

  site.get("/api/orders", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }

    $orders.findMany({
      select: req.body.select || {},
      sort: req.body.sort || {
        id: -1,
      },
      limit: limit,
      skip: skip
    },
      (err, docs, count) => {
        if (!err && docs.length > 0) {


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

  // get Order By Id

  site.get("/api/orders/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }

    $orders.findOne({
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

  // Hard Delete Order
  site.post('/api/orders/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }

    let id = req.params.id;

    if (id) {
      $orders.delete({
        _id: id,
        $req: req,
        $res: res,
      },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('orderDeleted')[req.headers.language]
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

//test
  // get Active Orders
  site.post('/api/orders/getActiveOrders', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $orders.findMany({
      where: {
        $and: [{
          "user._id": String(req.session.user.ref_info._id)
        }, {
          'status.statusId': {
            $in: [site.var('inProgressId'), site.var('onWayId'), site.var('activeId')]
          },
        }]
      },
      sort: {
        id: -1,
      },
      skip : skip,
      limit : limit
    }, (err, docs, count) => {
      if (docs.length == 0) {
        let obj = {}
        obj.data = {
          docs : docs,
          totalDocs:count
        }
        obj.errorCode = site.var('failed')
        obj.message = site.word('noActiveOrders')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      } else {
        let response = {}
        response.data = {
          docs: docs,
          totalDocs: count,
          limit: 10,
          totalPages: Math.ceil(count / 10)
        }
        response.message = site.word('findSuccessfully')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)
      }

    })
   
  });



  // update To Status In Progress
  site.post('/api/orders/updateToStatusInProgress', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }

    let orders_doc = req.body;
    let valDiscount
    if (orders_doc.discountPercentage < 0 || orders_doc.discountPercentage > 100) {
      valDiscount = {
        message: site.word('percentageInCorrect')[req.headers.language],
        done: false,
        "errorCode": site.var('failed')
      }
      return res.json(valDiscount)
    } else {
      valDiscount = orders_doc.discountPercentage
    }

    $orders.edit({
      where: {
        'status.statusId': site.var('activeId'),
        _id: orders_doc.orderId._id,
        'user._id': orders_doc.user._id
      },
      set: {
        'pharmacy': orders_doc.pharmacy,
        price: orders_doc.price,
        discountPercentage: valDiscount,
        totalPrice: orders_doc.totalPrice,
        deliveryTime: orders_doc.deliveryTime,
        isPublished: false,
        'status.statusId': site.var('inProgressId'),
        'status.name': site.var('inProgress')
      },
      $req: req,
      $res: res
    }, (err, result) => {

      if (result.count > 0) {
        response.done = true
        response.message = site.word('ordersUpdated')[req.headers.language],
          response.errorCode = site.var('succeed')
        let notificationObj = {
          title: site.word('orderAccepted')[req.headers.language],
          order: orders_doc.orderId,
          user: orders_doc.user,
          type : "order",
          pharmacy: orders_doc.pharmacy,
          createdAt: new Date().toLocaleString('en-US'),
          price: orders_doc.totalPrice,
          deliveryTime: orders_doc.deliveryTime
        }
        $notificationData.add(notificationObj);
      }
      if (result.count == 0) {
        response.done = false
        response.message = site.word('ordersNotUpdated')[req.headers.language]
        response.errorCode = site.var('failed')
      }
      res.json(response)
    })
  });


  // update To Status On Way
  site.post('/api/orders/updateToStatusOnWay', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }

    let orders_doc = req.body;
    $orders.edit({
      where: {
        _id: (orders_doc._id),
        'user._id': orders_doc.user._id,
        'status.statusId': site.var('inProgressId'),
        'pharmacy._id': orders_doc.pharmacy._id,
      },
      set: {
        'status.statusId': site.var('onWayId'),
        'status.name': site.var('onWay')
      },
      $req: req,
      $res: res
    }, (err, result) => {
      if (result.count > 0) {
        response.done = true
        response.message = site.word('ordersUpdated')[req.headers.language]
        response.errorCode = site.var('succeed')
      }
      if (result.count == 0) {
        response.done = false
        response.message = site.word('ordersNotUpdated')[req.headers.language]
        response.errorCode = site.var('failed')
      }
      res.json(response)
    })
  });


  // update To Status Shipped
  site.post('/api/orders/updateToStatusShipped', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }

    let orders_doc = req.body;
    $orders.edit({
      where: {
        _id: (orders_doc._id),
        'user._id': (orders_doc.user._id),
        'status.statusId': site.var('onWayId'),
        'pharmacy._id': (orders_doc.pharmacy._id),
      },
      set: {
        'status.statusId': site.var('shippedId'),
        'status.name': site.var('shipped')
      },
      $req: req,
      $res: res
    }, (err, result) => {
      if (result.count > 0) {
        response.done = true
        response.message = site.word('ordersUpdated')[req.headers.language]
        response.errorCode = site.var('succeed')
      }
      if (result.count == 0) {
        response.done = false
        response.message = site.word('ordersNotUpdated')[req.headers.language]
        response.errorCode = site.var('failed')
      }
      res.json(response)
    })
  });



  site.post('/api/orders/updateToStatusCanceled', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let orders_doc = req.body;
    let now = new Date();
    $orders.findOne({
      where: {
        _id:(orders_doc._id)
      }
    }, (err, doc) => {
      if (doc) {
        if (doc.status && doc.status.statusId == site.var('inProgressId')) {
          let end = new Date(doc['updatedAt']);
          let time = 5
          let diff = (now.getTime() - end.getTime()) / 1000;
          diff /= 60;
          let xDiff = Math.abs(Math.round(diff))
          if (time > xDiff == true) {
            $orders.edit({
              where: {
                _id:(orders_doc._id),
                'user._id': orders_doc.user._id,
                'status.statusId': site.var('inProgressId'),
              },
              set: {
                'status.statusId': site.var('canceledId'),
                'status.name': site.var('canceled')
              },

            }, (err, result) => {
              if (result.count > 0) {
                response.done = true
                response.message = site.word('ordersCanceled')[req.headers.language]
                response.errorCode = site.var('succeed')
              }
              if (result.count == 0) {
                response.done = false
                response.message = site.word('errorHappened')[req.headers.language]
                response.errorCode = site.var('failed')
              }
            })
          } else {
            response.done = false
            response.message = site.word('orderscannotCanceled')[req.headers.language]
            response.errorCode = site.var('failed')
          }

        }
        if (doc.status && doc.status.statusId == site.var('activeId')) {
          $orders.edit({
            where: {
              _id:  (orders_doc._id),
              'user._id': orders_doc.user._id,
              'status.statusId': site.var('activeId'),
            },
            set: {
              'status.statusId': site.var('canceledId'),
              'status.name': site.var('canceled')
            },

          }, (err, result) => {
            if (result.count > 0) {
              response.done = true
              response.message = site.word('ordersCanceled')[req.headers.language]
              response.errorCode = site.var('succeed')
              res.json(response)
            }
            if (result.count == 0) {
              response.done = false
              response.message = site.word('errorHappened')[req.headers.language]
              response.errorCode = site.var('failed')
              res.json(response)
            }
          })
        }
        if (doc.status && doc.status.statusId == site.var('onWayId') || doc.status.statusId == site.var('shippedId')) {
          response.done = false,
            response.errorCode = site.var('failed')
          response.message = site.word('failedUpdated')[req.headers.language]
          res.json(response)
        }
      } else {
        response.done = false,
          response.errorCode = site.var('failed')
        response.message = site.word('failedUpdated')[req.headers.language]
        res.json(response)
      }

    })

  });


  // get Canceled Orders By User
  site.post('/api/orders/getCanceledOrdersByUser', (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let orders_doc = req.body;
    console.log(orders_doc);
    $orders.findMany({
      where: {
        'user._id': orders_doc.user._id,
        'status.statusId': site.var('canceledId'),
      },
      limit: limit,
      skip: skip
    },
      (err, docs, count) => {

        if (!err && docs.length > 0) {
          response.data = {
            docs: docs,
            totalDocs: count,
            limit: 10,
            totalPages: Math.ceil(count / 10)
          }
          response.message = site.word('findSuccessfully')[req.headers.language],
            response.errorCode = site.var('succeed')
          response.done = true;
        }
        if (!docs || docs.length == 0) {
          response.data = {
            docs: docs
          }
          response.message = site.word('findSuccessfully')[req.headers.language],
            response.errorCode = site.var('succeed')
          response.done = true;
        }
        res.json(response);
      },
    );
  });


  // get Shipped Orders By User
  site.post('/api/orders/getShippedOrdersByUser', (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let orders_doc = req.body;
    $orders.findMany({
      where: {
        'user._id': orders_doc.user._id,
        'status.statusId': site.var('shippedId'),
      },
limit : limit,
skip : skip
    },
      (err, docs, count) => {

        if (!err && docs.length > 0) {
          response.data = {
            docs: docs,
            totalDocs: count,
            limit: 10,
            totalPages: Math.ceil(count / 10)
          }
          response.message = site.word('findSuccessfully')[req.headers.language],
            response.errorCode = site.var('succeed')
          response.done = true;
        }
        if (!docs || docs.length == 0) {
          response.data = {
            docs: docs

          }
          response.message = site.word('findSuccessfully')[req.headers.language],
            response.errorCode = site.var('succeed')
          response.done = true;
        }

        res.json(response);
      },
    );
  });


  // rating pharmacy
  site.post('/api/orders/ratingPharmacy', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let orders_doc = req.body;
    Number.prototype.between = function (a, b) {
      var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
      return this > min && this < max;
    };

    if (!orders_doc.rating.between(0, 5.1)) {
      response.message = site.word('pharmacyRatingError')[req.headers.language],
        res.json(response)
    }
    $orders.findOne({
      where: {
        _id:  (orders_doc._id),
        'user._id': orders_doc.user._id,
        'status.statusId': site.var('shippedId')
      }
    }, (err, doc) => {
      if (doc) {
        let createdObj = {
          user: orders_doc.user,
          date : new Date().toISOString().split('T')[0],
          target: doc.pharmacy,
          rating: orders_doc.rating,
          type: "pharmacy",
          description: orders_doc.description,
        }

        $rating.add(createdObj, (err1, doc1) => {

          if (!err1) {
            response.data = doc1;
            response.errorCode = site.var('succeed')
            response.message = site.word('ratingCreated')[req.headers.language],
              res.json(response)
          } else {
            response.done = false,
              response.errorCode = site.var('failed')
            response.message = site.word('ratingFailed')[req.headers.language],
              res.json(response)
          }

        });

      }

    })

  });

  // re order previous order shipped or canceled or not available

  site.post('/api/orders/reOrderPreviousOrder', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let orders_doc = req.body;
    if (orders_doc.status == site.var('shippedId')) {
      $orders.findOne({
        where: {
          _id:  (orders_doc._id),
          'user._id': orders_doc.user._id,
          'status.statusId': site.var('shippedId')
        }
      }, (err, doc) => {
        if (doc) {
          let obj = {
            fullName: doc.fullName,
            phone: doc.phone,
            hasInsurance: doc.hasInsurance,
            contractingCompany: doc.contractingCompany,
            insuranceCompany: doc.insuranceCompany,
            address: doc.address,
            insuranceNumber: doc.insuranceNumber,
            user: doc.user,
image : doc.image,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublished: true,
            status: {
              name: site.var('active'),
              statusId: site.var('activeId')
            },
          }
          $orders.add(obj, (err, doc) => {
            if (!err && doc) {
              response.data = obj
              response.message = site.word('reOrderSuccessfully')[req.headers.language],
                response.done = true
              response.errorCode = site.var('succeed')
              res.json(response);
            }
          });

        } else {

          response.message = site.word('reOrderFailed')[req.headers.language],
            response.done = false
          response.errorCode = site.var('failed')
          res.json(response);
        }

      })
    }

    if (orders_doc.status == site.var('canceledId')) {
      $orders.findOne({
        where: {
          _id:  (orders_doc._id),
          'user._id': orders_doc.user._id,
          'status.statusId': site.var('canceledId')
        }
      }, (err, doc) => {
        if (doc) {

          let obj = {
            fullName: doc.fullName,
            phone: doc.phone,
            hasInsurance: doc.hasInsurance,
            contractingCompany: doc.contractingCompany,
            insuranceCompany: doc.insuranceCompany,
            address: doc.address,
            insuranceNumber: doc.insuranceNumber,
            user: doc.user,
            image : doc.image,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublished: true,
            status: {
              name: site.var('active'),
              statusId: site.var('activeId')
            },
          }
          $orders.add(obj, (err, doc) => {
            if (!err && doc) {
              response.data = obj
              response.message = site.word('reOrderSuccessfully')[req.headers.language],
                response.done = true
              response.errorCode = site.var('succeed')
              res.json(response);
            }
          });

        } else {

          response.message = site.word('reOrderFailed')[req.headers.language],
            response.done = false
          response.errorCode = site.var('failed')
          res.json(response);
        }
      })
    }

    if (orders_doc.status == site.var('notActiveId')) {
      $orders.findOne({
        where: {
          _id:  (orders_doc._id),
          'user._id': orders_doc.user._id,
          'status.statusId': site.var('notActiveId')
        }
      }, (err, doc) => {
        if (doc) {

          let obj = {
            fullName: doc.fullName,
            phone: doc.phone,
            hasInsurance: doc.hasInsurance,
            contractingCompany: doc.contractingCompany,
            insuranceCompany: doc.insuranceCompany,
            address: doc.address,
            insuranceNumber: doc.insuranceNumber,
            user: doc.user,
            image : doc.image,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            isPublished: true,
            status: {
              name: site.var('active'),
              statusId: site.var('activeId')
            },
          }
          $orders.add(obj, (err, doc) => {
            if (!err && doc) {
              response.data = obj
              response.message = site.word('reOrderSuccessfully')[req.headers.language],
                response.done = true
              response.errorCode = site.var('succeed')
              res.json(response);
            }
          });

        } else {

          response.message = site.word('reOrderFailed')[req.headers.language],
            response.done = false
          response.errorCode = site.var('failed')
          res.json(response);
        }
      })
    }

  });



  // internet connectivity
  site.post("/api/orders/internetConnectivity", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    require('dns').resolve('www.google.com', function (err) {
      if (err) {
        response.message = site.word('internetDisConnected')[req.headers.language],
          response.done = false
        response.errorCode = site.var('failed')
        res.json(response);
      } else {
        response.message = site.word('internetConnected')[req.headers.language],
          response.done = true
        response.errorCode = site.var('succeed')
        res.json(response);
      }
    });
  })


  // Search Orders
  site.post(`/api/orders/search`, (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let where = req.body || {};

    if (where['fullName']) {
      where['fullName'] = site.get_RegExp(where['fullName'], 'i');
    }

    if (where['phone']) {
      where['phone'] = String(where['phone']);
    }

    if (where['contractingCompany']) {
      where['contractingCompany'] = site.get_RegExp(where['contractingCompany'], 'i');
    }

    if (where['insuranceNumber']) {
      where['insuranceNumber'] = String(where['insuranceNumber']);
    }

    if (where['insuranceCompany']) {
      where['insuranceCompany._id'] = where['insuranceCompany']._id;
      delete where['insuranceCompany']
    }
    if (where['address']) {
      where['address._id'] = where['address']._id;
      delete where['address']
    }
    if (where['user']) {
      where['user._id'] = where['user']._id;
      delete where['user']
    }
    if (where['status']) {
      where['status.statusId'] = where['status'].statusId;
      delete where['status']
    }
    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $orders.findMany({
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
          response.message = site.word('findFailed')[req.headers.language],
            response.done = false;
        }
        res.json(response);
      },
    );
  });
 setInterval(() => {
  $orders.findMany({
    where: {
      'status.statusId': site.var('activeId'),
    },
  }, (err, docs, count) => {
    if (docs.length > 0) {
      let now = new Date();
      for (const iterator of docs) {
        let end = new Date(iterator['createdAt']);
        let xDiff = Math.abs(now - end) / 36e5
        let time = 3
        if (xDiff > time == true) {
          $orders.edit({
            where: {
              'status.statusId': site.var('activeId'),
            },
            set: {
              'status.statusId': site.var('notActiveId'),
              'status.name': site.var('notActive')
            },
          })
        } 

      }

    }
    if (docs.length == 0) {
      return
    }
  })
 }, 20*60*1000);


 site.post('/api/orders/update1', (req, res) => {
  let response = {
    done: false,
  };
  let orders_doc = req.body;
  if (orders_doc.id) {
    $orders.edit(
      {
        where: {
          id: orders_doc.id,
        },
        set: orders_doc,
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

site.post('/api/orders/view', (req, res) => {
  let response = {
    done: false,
  };



  $orders.findOne(
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
site.post('/api/orders/delete1', (req, res) => {
  let response = {
    done: false,
  };
  let id = req.body.id;

  if (id) {
    $orders.delete(
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
module.exports = function init(site) {
  const $notificationData = site.connectCollection('notificationData');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
    require: {
      permissions: []
    }
  });

  site.get({
    name: 'notificationData',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });

  // Add notificationData

  site.post('/api/notificationData/add', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let notificationData_doc = req.body;
    notificationData_doc.$req = req;
    notificationData_doc.$res = res;

    notificationData_doc.isActive = true,
      notificationData_doc.createdAt = new Date()
    notificationData_doc.updatedAt = new Date()

    // notificationData_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof notificationData_doc.active === 'undefined') {
    //   notificationData_doc.active = true;
    // }

    // notificationData_doc.company = site.get_company(req);
    // notificationData_doc.branch = site.get_branch(req);


    $notificationData.add(notificationData_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = 200
        // response.message = site.words['govCreated'][req.headers.language]
        response.message = 'notificationCreated'
        response.done = true;

      } else {
        response.errorCode = 406
        response.message = 'errorHappened'
        response.done = false;
      }

      res.json(response);
    });

  });

  // Update notificationData 

  site.post('/api/notificationData/update/:id', (req, res) => {
    let response = {}
    let notification_doc = req.body
    notification_doc.updatedAt = new Date(),
      $notificationData.edit({
        where: {
          _id: (req.params.id)
        },
        set: notification_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $notificationData.findOne({
            where: {
              _id: (req.params.id)
            }
          }, (err, doc) => {
            if (doc) {
              response.done = true,
                response.data = doc
              response.errorCode = 200
              response.message = 'updatedSuccessfully'
              res.json(response)
            } else {
              response.done = false,
                response.errorCode = 406
              response.message = 'failedUpdated'
              res.json(response)
            }

          })

        } else {
          response.done = false,
            response.data = doc
          response.errorCode = 406
          response.message = 'failedUpdate'
          res.json(response)
        }

      })
  })


  // get All notificationData

  site.get("/api/notificationData", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $notificationData.findMany({
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




 // get All Booking Done For Today
 site.post('/api/notificationData/getAllOrderPatientsNotifications', (req, res) => {
  req.headers.language = req.headers.language || 'en'
  let response = {}
  let limit = 10
  let skip
  if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
    skip = (parseInt(req.query.page) - 1) * 10
  }

  let notification_doc = req.body;

  $notificationData.findMany({
    where: {
      'type': "order",
      'user._id': notification_doc.user._id,
    },
    limit: limit,
    skip: skip,
    $req: req,
    $res: res
  }, (err, docs, count) => {
    if (docs && docs.length > 0) {
      response.data = {
        docs: docs,
        totalDocs: count,
        limit: 10,
        totalPages: Math.ceil(count / 10)
      }

      response.done = true

      response.message = site.word('findNotification')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    } else {

      response.done = false
      response.message = site.word('notFindNotification')[req.headers.language],
        response.errorCode = site.var('failed')
      res.json(response)
    }
  })
});




 // get All Booking Done For Today
 site.post('/api/notificationData/getAllBookingPatientsNotifications', (req, res) => {
  req.headers.language = req.headers.language || 'en'
  let response = {}
  let limit = 10
  let skip
  if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
    skip = (parseInt(req.query.page) - 1) * 10
  }

  let notification_doc = req.body;

  $notificationData.findMany({
    where: {
      'type': "booking",
      'user._id': notification_doc.user._id,
    },
    limit: limit,
    skip: skip,
    $req: req,
    $res: res
  }, (err, docs, count) => {
    if (docs && docs.length > 0) {
      response.data = {
        docs: docs,
        totalDocs: count,
        limit: 10,
        totalPages: Math.ceil(count / 10)
      }

      response.done = true

      response.message = site.word('findNotification')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    } else {

      response.done = false
      response.message = site.word('notFindNotification')[req.headers.language],
        response.errorCode = site.var('failed')
      res.json(response)
    }
  })
});





 





// get All Booking Done For Today
site.post('/api/notificationData/getAllNotificationsConsultationDoctors', (req, res) => {
  req.headers.language = req.headers.language || 'en'
  let response = {}
  let limit = 10
  let skip
  if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
    skip = (parseInt(req.query.page) - 1) * 10
  }

  let notification_doc = req.body;

  $notificationData.findMany({
    where: {
      'type': "consultation",
      'doctor._id': notification_doc.doctor._id,
    },
    limit: limit,
    skip: skip,
    $req: req,
    $res: res
  }, (err, docs, count) => {
    if (docs && docs.length > 0) {
      response.data = {
        docs: docs,
        totalDocs: count,
        limit: 10,
        totalPages: Math.ceil(count / 10)
      }

      response.done = true

      response.message = site.word('findNotification')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    } else {

      response.done = false
      response.message = site.word('notFindNotification')[req.headers.language],
        response.errorCode = site.var('failed')
      res.json(response)
    }
  })
});







  // get All Booking Done For Today
  site.post('/api/notificationData/getAllDoctorNotifications', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }

    let notification_doc = req.body;

    $notificationData.findMany({
      where: {
        'type': "booking",
        'doctor._id': notification_doc.doctor._id,
      },
      limit: limit,
      skip: skip,
      $req: req,
      $res: res
    }, (err, docs, count) => {
      if (docs && docs.length > 0) {
        response.data = {
          docs: docs,
          totalDocs: count,
          limit: 10,
          totalPages: Math.ceil(count / 10)
        }

        response.done = true

        response.message = site.word('findNotification')[req.headers.language],
          response.errorCode = site.var('succeed')
        res.json(response)
      } else {

        response.done = false
        response.message = site.word('notFindNotification')[req.headers.language],
          response.errorCode = site.var('failed')
        res.json(response)
      }
    })
  });
















  // get Notification By Id

  site.get("/api/notificationData/:id", (req, res) => {
    let response = {}
    $notificationData.findOne({
        where: {
          _id: req.params.id,
        },

      },
      (err, doc) => {
        if (!err && doc) {
          response.data = doc
          response.errorCode = 200
          response.message = 'findSuccessfully'
          response.done = true;
        }
        if (!doc) {
          response.errorCode = 406
          response.message = 'findFailed'
          response.done = false;
        }
        res.json(response);
      },
    );

  })

  // Hard Delete Notification
  site.post('/api/notificationData/delete/deleteOne', (req, res) => {
    let response = {
      done: false,
    };
    let notification_doc = req.body
    req.headers.language = req.headers.language || 'en'

    $notificationData.delete({
        "user._id": notification_doc.user._id,
        "_id": notification_doc.notificationId,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.errorCode = site.var('succeed')
        response.message = site.word('notificationDeleted')[req.headers.language]
        response.done = true;
        
        } else {
          response.errorCode = site.var('failed')
        response.message = site.word('failedDelete')[req.headers.language]
        response.done = false;
        }
        res.json(response);
      },
    );

  });

  // Hard Delete All notifications
  site.post('/api/notificationData/delete/deleteAll', (req, res) => {
    let response = {
      done: false,
    };
    let notification_doc = req.body


    $notificationData.deleteAll({
        where: {
          "user._id": notification_doc.user._id,
        },
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.errorCode = site.var('succeed')
          response.message = site.word('notificationsDeleted')[req.headers.language]
          response.done = true;
        } else {
          response.done = false,
            response.errorCode = 406
          response.message = 'failedDelete'
        }
        res.json(response);
      },
    );

  });




   // Hard Delete Notification
   site.post('/api/notificationData/deleteByDoctor/deleteOne', (req, res) => {
    let response = {
      done: false,
    };
    let notification_doc = req.body
    req.headers.language = req.headers.language || 'en'

    $notificationData.delete({
        "doctor._id": notification_doc.doctor._id,
        "_id": notification_doc.notificationId,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.errorCode = site.var('succeed')
        response.message = site.word('notificationDeleted')[req.headers.language]
        response.done = true;
        
        } else {
          response.errorCode = site.var('failed')
        response.message = site.word('failedDelete')[req.headers.language]
        response.done = false;
        }
        res.json(response);
      },
    );

  });

  // Hard Delete All notifications
  site.post('/api/notificationData/deleteByDoctor/deleteAll', (req, res) => {
    let response = {
      done: false,
    };
    let notification_doc = req.body


    $notificationData.deleteAll({
        where: {
          "doctor._id": notification_doc.doctor._id,
        },
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.errorCode = site.var('succeed')
          response.message = site.word('notificationsDeleted')[req.headers.language]
          response.done = true;
        } else {
          response.done = false,
            response.errorCode = 406
          response.message = 'failedDelete'
        }
        res.json(response);
      },
    );

  });





     // Hard Delete Notification pharmacy
     site.post('/api/notificationData/deleteByPharmacy/deleteOne', (req, res) => {
      let response = {
        done: false,
      };
      let notification_doc = req.body
      req.headers.language = req.headers.language || 'en'
  
      $notificationData.delete({
          "pharmacy._id": notification_doc.pharmacy._id,
          "_id": notification_doc.notificationId,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.errorCode = site.var('succeed')
          response.message = site.word('notificationDeleted')[req.headers.language]
          response.done = true;
          
          } else {
            response.errorCode = site.var('failed')
          response.message = site.word('failedDelete')[req.headers.language]
          response.done = false;
          }
          res.json(response);
        },
      );
  
    });
  
    // Hard Delete All notifications pharmacy
    site.post('/api/notificationData/deleteByPharmacy/deleteAll', (req, res) => {
      let response = {
        done: false,
      };
      let notification_doc = req.body
  
  
      $notificationData.deleteAll({
          where: {
            "pharmacy._id": notification_doc.pharmacy._id,
          },
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.errorCode = site.var('succeed')
            response.message = site.word('notificationsDeleted')[req.headers.language]
            response.done = true;
          } else {
            response.done = false,
              response.errorCode = 406
            response.message = 'failedDelete'
          }
          res.json(response);
        },
      );
  
    });
  

      // get All Booking Done For Today
  site.post('/api/notificationData/getAllPharmacyNotifications', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }

    let notification_doc = req.body;

    $notificationData.findMany({
      where: {
        'type': "order",
        'pharmacy._id': notification_doc.pharmacy._id,
      },
      limit: limit,
      skip: skip,
      $req: req,
      $res: res
    }, (err, docs, count) => {
      if (docs && docs.length > 0) {
        response.data = {
          docs: docs,
          totalDocs: count,
          limit: 10,
          totalPages: Math.ceil(count / 10)
        }

        response.done = true

        response.message = site.word('findNotification')[req.headers.language],
          response.errorCode = site.var('succeed')
        res.json(response)
      } else {

        response.done = false
        response.message = site.word('notFindNotification')[req.headers.language],
          response.errorCode = site.var('failed')
        res.json(response)
      }
    })
  });
  

















     // Hard Delete Notification pharmacy
     site.post('/api/notificationData/deleteByConsultationDoctor/deleteOne', (req, res) => {
      let response = {
        done: false,
      };
      let notification_doc = req.body
      req.headers.language = req.headers.language || 'en'
  
      $notificationData.delete({
          "doctor._id": notification_doc.doctor._id,
          "_id": notification_doc.notificationId,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.errorCode = site.var('succeed')
          response.message = site.word('notificationDeleted')[req.headers.language]
          response.done = true;
          
          } else {
            response.errorCode = site.var('failed')
          response.message = site.word('failedDelete')[req.headers.language]
          response.done = false;
          }
          res.json(response);
        },
      );
  
    });
  
    // Hard Delete All notifications pharmacy
    site.post('/api/notificationData/deleteByConsultationDoctor/deleteAll', (req, res) => {
      let response = {
        done: false,
      };
      let notification_doc = req.body
  
  
      $notificationData.deleteAll({
          where: {
            "doctor._id": notification_doc.doctor._id,
          },
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.errorCode = site.var('succeed')
            response.message = site.word('notificationsDeleted')[req.headers.language]
            response.done = true;
          } else {
            response.done = false,
              response.errorCode = 406
            response.message = 'failedDelete'
          }
          res.json(response);
        },
      );
  
    });

















  // Search notificationData
  site.post('/api/notificationData/search', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $notificationData.findMany({
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
          response.errorCode = 406
          response.message = 'findFailed'
          response.done = false;
        }
        res.json(response);
      },
    );
  });
};
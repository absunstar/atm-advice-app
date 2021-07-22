module.exports = function init(site) {
  const $notifications = site.connectCollection('notifications');

  // site.get({
  //   name: 'images',
  //   path: __dirname + '/site_files/images/',
  // });

  // site.get({
  //   name: 'notifications',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: true,
  // });

  // site.on('[company][created]', (doc) => {
  //   $notifications.add(
  //     {
  //       code: "1-Test",
  //       name_ar: 'محافظة إفتراضية',
  //       name_en: "Default Gov",
  //       image_url: '/images/notifications.png',
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


  // Add Notifications

  site.post('/api/notifications/add', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let notifications_doc = req.body;
    notifications_doc.$req = req;
    notifications_doc.$res = res;
    
      notifications_doc.isActive = true,
      notifications_doc.createdAt = new Date()
    notifications_doc.updatedAt = new Date()

    // notifications_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof notifications_doc.active === 'undefined') {
    //   notifications_doc.active = true;
    // }

    // notifications_doc.company = site.get_company(req);
    // notifications_doc.branch = site.get_branch(req);


    $notifications.add(notifications_doc, (err, doc) => {
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

  // Update Notifications 

  site.post('/api/notifications/update/:id', (req, res) => {
    let response = {}
    let notification_doc = req.body
    notification_doc.updatedAt = new Date(),
      $notifications.edit({
        where: {
          _id: (req.params.id)
        },
        set: notification_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $notifications.findOne({
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


// get All Notifications

  site.get("/api/notifications", (req, res) => {
    let page = 1
    let offset = 0
    let response = {}
    $notifications.findMany(
      {
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit || 10,
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

// get Notification By Id

  site.get("/api/notifications/:id", (req, res) => {
    let response = {}
    $notifications.findOne(
      {
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
  site.post('/api/notifications/delete/:id', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $notifications.delete(
        {
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = 200
            response.message = 'govDeleted'
          } else {
            response.done = false,
              response.errorCode = 406
            response.message = 'failedDelete'
          }
          res.json(response);
        },
      );
    }
  });

  // Search Notifications
  site.post('/api/notifications/search', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }


    $notifications.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit || 10,
      },
      (err, docs, count) => {
        if (docs.length > 0) {
          response.done = true
          response.docs = docs
          response.totalDocs = count
          response.limit = 10
          response.totalPages = Math.ceil(response.totalDocs / response.limit)
        } else {
          response.errorCode = 406
          response.message = 'findFailed'
          response.done = false;
        }
        res.json(response);
      },
    );
  });
};

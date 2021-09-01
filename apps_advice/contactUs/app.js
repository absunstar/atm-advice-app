module.exports = function init(site) {
  const $contactUs = site.connectCollection('contactUs');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    ,require : {permissions : []}
  });

  // site.get({
  //   name: 'contactUs',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: true,
  //   require : {permissions : []}
  // });
  site.get({
    name: 'contact-us',
    path: __dirname + '/site_files/html/contactus.html',
    parser: 'html',
    compress: true,
    require : {permissions : []}
  });

  // Add New Degree With Not Duplicate Name Validation

  site.post('/api/contactUs/add', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let contactUs_doc = req.body;
    contactUs_doc.$req = req;
    contactUs_doc.$res = res;
   
      contactUs_doc.isActive = true,
      contactUs_doc.createdAt = new Date()
    contactUs_doc.updatedAt = new Date()

    // contactUs_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof contactUs_doc.active === 'undefined') {
    //   contactUs_doc.active = true;
    // }

    // contactUs_doc.company = site.get_company(req);
    // contactUs_doc.branch = site.get_branch(req);

    $contactUs.add(contactUs_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        response.message = site.word('contactUsCreated')[req.headers.language]
        response.done = true;

      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });
  });

  // Update Degree 

  site.post('/api/contactUs/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let contactUs_doc = req.body
    contactUs_doc.updatedAt = new Date(),
      $contactUs.edit({
        where: {
          _id: (req.params.id)
        },
        set: contactUs_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $contactUs.findOne({
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


// get All Degree

  site.get("/api/contactUs", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $contactUs.findMany(
      {
        select: req.body.select || {},
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip : skip
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

// get Degree By Id

  site.get("/api/contactUs/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $contactUs.findOne(
      {
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

// Hard Delete Degree
  site.post('/api/contactUs/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $contactUs.delete(
        {
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('contactUsDeleted')[req.headers.language]
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

  // Search Degree By Name 
  site.post('/api/contactUs/search', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');
    }
    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i');
    }
    let limit = 10;
    let skip 
    if (req.query.page ||( parseInt(req.query.page)&&parseInt(req.query.page)>1)) {
      skip=(parseInt(req.query.page)-1) * 10
    }
    $contactUs.findMany(
      {
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

  site.post("/api/contactUs/update1", (req, res) => {
    let response = {
      done: false
    }



    let contactUs_doc = req.body


    if (contactUs_doc.id) {

      $contactUs.edit({
        where: {
          id: contactUs_doc.id
        },
        set: contactUs_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/contactUs/view", (req, res) => {
    let response = {
      done: false
    }



    $contactUs.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/contactUs/delete1", (req, res) => {
    let response = {
      done: false
    }
    let id = req.body.id

    if (id) {
      $contactUs.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true,
            response.errorCode = site.var('succeed')
          response.message = site.word('cityDeleted')[req.headers.language]
        } else {
          response.done = false,
            response.errorCode = site.var('failed')
          response.message = 'failedDelete'
        }
        res.json(response)
      })
    }
  })
};

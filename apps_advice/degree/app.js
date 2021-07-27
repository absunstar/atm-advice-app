module.exports = function init(site) {
  const $degree = site.connectCollection('degree');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    ,require : {permissions : []}
  });

  site.get({
    name: 'degree',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require : {permissions : []}
  });

  // Add New Degree With Not Duplicate Name Validation

  site.post('/api/degree/add', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let degree_doc = req.body;
    degree_doc.$req = req;
    degree_doc.$res = res;
   
      degree_doc.isActive = true,
      degree_doc.createdAt = new Date()
    degree_doc.updatedAt = new Date()

    // degree_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof degree_doc.active === 'undefined') {
    //   degree_doc.active = true;
    // }

    // degree_doc.company = site.get_company(req);
    // degree_doc.branch = site.get_branch(req);

    $degree.find(
      {
        where: {
          'name': degree_doc.name,
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = site.word('nameExist')[req.headers.language]
          res.json(response);
        } else {

          $degree.add(degree_doc, (err, doc) => {
            if (!err) {
              response.data = doc;
              response.errorCode = site.var('succeed')
              response.message = site.word('degreeCreated')[req.headers.language]
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

  // Update Degree 

  site.post('/api/degree/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let degree_doc = req.body
    degree_doc.updatedAt = new Date(),
      $degree.edit({
        where: {
          _id: (req.params.id)
        },
        set: degree_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $degree.findOne({
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

  site.get("/api/degree", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $degree.findMany(
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

  site.get("/api/degree/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $degree.findOne(
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
  site.post('/api/degree/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $degree.delete(
        {
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('degreeDeleted')[req.headers.language]
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
  site.post('/api/degree/search', (req, res) => {
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
    $degree.findMany(
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

  site.post("/api/degree/update1", (req, res) => {
    let response = {
      done: false
    }



    let degree_doc = req.body


    if (degree_doc.id) {

      $degree.edit({
        where: {
          id: degree_doc.id
        },
        set: degree_doc,
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

  site.post("/api/degree/view", (req, res) => {
    let response = {
      done: false
    }



    $degree.findOne({
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

  site.post("/api/degree/delete1", (req, res) => {
    let response = {
      done: false
    }
    let id = req.body.id

    if (id) {
      $degree.delete({
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

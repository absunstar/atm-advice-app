module.exports = function init(site) {
  const $departments = site.connectCollection('departments');
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    ,require : {permissions : []}
  });

  site.get({
    name: 'departments',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require : {permissions : []}
  });

  // Add New departments With Not Duplicate Name Validation

  site.post('/api/departments/add', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let departments_doc = req.body;
    departments_doc.$req = req;
    departments_doc.$res = res;
   
      departments_doc.isActive = true,
      departments_doc.createdAt = new Date()
    departments_doc.updatedAt = new Date()

    // departments_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof departments_doc.active === 'undefined') {
    //   departments_doc.active = true;
    // }

    // departments_doc.company = site.get_company(req);
    // departments_doc.branch = site.get_branch(req);
    $departments.add(departments_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        // response.message = site.words['departmentsCreated'][req.headers.language]
        response.message = site.word('departmentsCreated')[req.headers.language],
        response.done = true;

      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });
   
  });

   // add image to departments
   site.post('/api/departments/upload/image/departments', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'

    site.createDir(site.dir + '/../../uploads/' + 'departments', () => {
      site.createDir(site.dir + '/../../uploads/' + 'departments' + '/images', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
          let newpath = site.dir + '/../../uploads/' + 'departments' + '/images/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            response.image_url = '/api/image/' + 'departments' + '/' + newName;
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

  // Update departments 

  site.post('/api/departments/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let departments_doc = req.body
    departments_doc.updatedAt = new Date(),
      $departments.edit({
        where: {
          _id: (req.params.id)
        },
        set: departments_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $departments.findOne({
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
          response.message = site.word('failedUpdated')[req.headers.language]
          res.json(response)
        }

      })
  })


// get All departmentses

  site.get("/api/departments", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $departments.findMany(
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

// get departments By Id

  site.get("/api/departments/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $departments.findOne(
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

// Hard Delete departments
  site.post('/api/departments/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $departments.delete(
        {
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('departmentsDeleted')[req.headers.language]
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

  // Search departmentses By Name 
  site.post('/api/departments/search', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }
    let limit = 10;
    let skip 
    if (req.query.page ||( parseInt(req.query.page)&&parseInt(req.query.page)>1)) {
      skip=(parseInt(req.query.page)-1) * 10
    }

    $departments.findMany(
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
};

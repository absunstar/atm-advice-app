module.exports = function init(site) {
  const $insuranceCompany = site.connectCollection('insuranceCompany');


  // Add New InsuranceCompany With Not Duplicate Name Validation

  site.post('/api/insuranceCompany/add', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let insuranceCompany_doc = req.body;
    insuranceCompany_doc.$req = req;
    insuranceCompany_doc.$res = res;
   
      insuranceCompany_doc.isActive = true,
      insuranceCompany_doc.createdAt = new Date()
    insuranceCompany_doc.updatedAt = new Date()

    
    $insuranceCompany.add(insuranceCompany_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        // response.message = site.words['govCreated'][req.headers.language]
        response.message = site.word('insuranceCompanyCreated')[req.headers.language]
        response.done = true;

      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });
   
  });


    // add image to insurance Company
    site.post('/api/insuranceCompany/upload/image/insuranceCompany', (req, res) => {
      site.createDir(site.dir + '/../../uploads/' + 'insuranceCompany', () => {
        site.createDir(site.dir + '/../../uploads/' + 'insuranceCompany' + '/images', () => {
          let response = {
            done: !0,
          };
          let file = req.files.fileToUpload;
          if (file) {
            let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
            let newpath = site.dir + '/../../uploads/' + 'insuranceCompany' + '/images/' + newName;
            site.mv(file.path, newpath, function (err) {
              if (err) {
                response.error = err;
                response.done = !1;
              }
              response.image_url = '/api/image/' + 'insuranceCompany' + '/' + newName;
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

  // Update InsuranceCompany 

  site.post('/api/insuranceCompany/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let insuranceCompany_doc = req.body
    insuranceCompany_doc.updatedAt = new Date(),
      $insuranceCompany.edit({
        where: {
          _id: (req.params.id)
        },
        set: insuranceCompany_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $insuranceCompany.findOne({
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


// get All insurance company

  site.get("/api/insuranceCompany", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $insuranceCompany.findMany(
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

// get InsuranceCompany By Id

  site.get("/api/insuranceCompany/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $insuranceCompany.findOne(
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

// Hard Delete InsuranceCompany
  site.post('/api/insuranceCompany/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $insuranceCompany.delete(
        {
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('insuranceCompanyDeleted')[req.headers.language]
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

  // Search Goves By Name 
  site.post('/api/insuranceCompany/search', (req, res) => {
    req.headers.language = req.headers.language || 'en'
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

    $insuranceCompany.findMany(
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

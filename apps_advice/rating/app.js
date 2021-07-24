module.exports = function init(site) {
  const $rating = site.connectCollection('rating');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    ,require : {permissions : []}
  });

  site.get({
    name: 'rating',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require : {permissions : []}
  });


  // Add New Rating With Not Duplicate Name Validation

  site.post('/api/rating/add', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let rating_doc = req.body;
    rating_doc.$req = req;
    rating_doc.$res = res;
    
      rating_doc.isActive = true,
      rating_doc.createdAt = new Date()
    rating_doc.updatedAt = new Date()

    // rating_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof rating_doc.active === 'undefined') {
    //   rating_doc.active = true;
    // }

    // rating_doc.company = site.get_company(req);
    // rating_doc.branch = site.get_branch(req);

    $rating.find(
      {
        where: {
          'name': rating_doc.name,
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = 'nameExist'//[req.headers.language];
          res.json(response);
        } else {

          $rating.add(rating_doc, (err, doc) => {
            if (!err) {
              response.data = doc;
              response.errorCode = 200
              // response.message = site.words['govCreated'][req.headers.language]
              response.message = 'govCreated'
              response.done = true;

            } else {
              response.errorCode = 406
              response.message = 'errorHappened'
              response.done = false;
            }

            res.json(response);
          });
        }
      },
    );
  });

  // Update Rating 

  site.post('/api/rating/update/:id', (req, res) => {
    let response = {}
    let rating_doc = req.body
    rating_doc.updatedAt = new Date(),
      $rating.edit({
        where: {
          _id: (req.params.id)
        },
        set: rating_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $rating.findOne({
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


// get All Rating

  site.get("/api/rating", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $rating.findMany(
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

// get Rating By Id

  site.get("/api/rating/:id", (req, res) => {
    let response = {}
    $rating.findOne(
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

// Hard Delete Rating
  site.post('/api/rating/delete/:id', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $rating.delete(
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

  // Search Rating By Name 
  site.post('/api/rating/search', (req, res) => {
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
    $rating.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip : skip
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

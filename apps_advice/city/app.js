module.exports = function init(site) {
  const $city = site.connectCollection("city")
  const $gov = site.connectCollection("gov")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    , require: { permissions: [] }
  });

  site.get({
    name: 'city',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: { permissions: [] }
  });


  site.post("/api/city/add", async (req, res) => {
    let response = {
      done: false
    }
    let city_doc = req.body

    req.headers.language = req.headers.language || 'en'

    if (!city_doc.gov) {
      response.message = site.word('govNotFound')[req.headers.language]
      response.done = false
      response.errorCode = site.var('failed')
      res.json(response)
      return
    }
    $city.add(city_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.data = doc
        response.errorCode = site.var('succeed')
        response.message = site.word('cityCreated')[req.headers.language]
      } else {
        response.message = site.word('cityNotCreated')[req.headers.language]
        response.done = false
        response.errorCode = site.var('failed')
      }
      res.json(response)
      // site.call('[test][city][+]', doc)
    })


  })
  site.post("/api/city/update/:id", (req, res) => {
    let response = {
      done: false
    }

    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let city_doc = req.body
    let id = req.params.id

    // city_doc.edit_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res
    // })
    if (id) {

      $city.edit({
        where: {
          _id: id
        },
        set: city_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          $city.findOne({
            where: {
              _id: id
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
            response.errorCode = site.var('failed')
          response.message = site.word('failedUpdated')[req.headers.language]
          res.json(response)
        }

      })
    }
  })

  site.post("/api/city/getCityByGov/:govId", (req, res) => {
    let response = {
      done: false
    }
    $city.findMany({
      where: {
        'gov._id': String(req.params.govId),
      },

    },
      (err, doc) => {

        if (!err && doc.length > 0) {
          response.data = doc
          response.message = site.word('findSuccessfully')[req.headers.language],
            response.errorCode = site.var('succeed')
          response.done = true;
        }
        if (!doc || doc.length == 0) {
          response.message = site.word('findNotHappened')[req.headers.language],
            response.done = false;

          response.errorCode = site.var('failed')
        }
        res.json(response);
      },
    );

  })


  //  get All Cities

  site.get("/api/city", (req, res) => {

    let response = {
      done: false
    }
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $city.findMany({
      select: req.body.select || {},
      sort: req.body.sort || {
        id: -1,
      },
      limit: limit,
      skip: skip,
    },
      (err, docs, count) => {
        if (!err) {
          response.docs = docs
          response.done=true
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

  // get City By Id

  site.get("/api/city/:id", (req, res) => {
    let response = {
      done: false
    }
    $city.findOne({
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

  site.post("/api/city/delete/:id", (req, res) => {
    let response = {
      done: false
    }

    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let id = req.params.id

    if (id) {
      $city.delete({
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

  site.post("/api/city/search", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body || {}

    if (where['gov']) {
      where['gov._id'] = where['gov']._id;
      delete where['gov']
    }

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], "i");
    }
    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], "i");
    }
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }

    $city.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1,
      },
      limit: limit,
      skip: skip

    }, (err, docs, count) => {
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
    })
  })
  site.post("/api/city/update1", (req, res) => {
    let response = {
      done: false
    }



    let city_doc = req.body


    if (city_doc.id) {

      $city.edit({
        where: {
          id: city_doc.id
        },
        set: city_doc,
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

  site.post("/api/city/view", (req, res) => {
    let response = {
      done: false
    }



    $city.findOne({
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

  site.post("/api/city/delete1", (req, res) => {
    let response = {
      done: false
    }
    let id = req.body.id

    if (id) {
      $city.delete({
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


}
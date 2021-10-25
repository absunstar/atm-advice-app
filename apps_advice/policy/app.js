module.exports = function init(site) {
  const $policy = site.connectCollection('policy');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    , require: { permissions: [] }
  });

  site.get({
    name: 'policy',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: { permissions: [] }
  });












  // Add New Gov With Not Duplicate Name Validation

  // site.onALL('/api/policy' , (req , res)=>{
  //   if(req.method == 'post'){

  //   }
  // })

  // site.onPOST( '/api/policy/count', (req, res) => {
  //   let x = (id , callback)=>{
  //     site.mongodb.lib.find({id : id},(data)=>{
  //       callback(data)
  //     })
  //   }


  //   x(5 , (data)=>{
  //   })
  // });



  site.onPOST('/api/policy/add', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let policy_doc = req.body;
    policy_doc.$req = req;
    policy_doc.$res = res;

    policy_doc.isActive = true
    policy_doc.createdAt = new Date()
    policy_doc.updatedAt = new Date()
    if (!policy_doc.policyNumber || policy_doc.policyNumber == "") {
      response.errorCode = site.var('failed')
      response.message = site.word('policyNumberMissing')[req.headers.language]
      response.done = false;
      return
    }
    if (policy_doc.validFrom && typeof policy_doc.validFrom == 'string') {
      policy_doc.validFrom = new Date(policy_doc.validFrom)
    }
    if (policy_doc.validTo && typeof policy_doc.validTo == 'string') {
      policy_doc.validTo = new Date(policy_doc.validTo)
    }
    if (!policy_doc.email || policy_doc.email == "") {
      response.errorCode = site.var('failed')
      response.message = site.word('emailMissing')[req.headers.language]
      response.done = false;
      return
    }

    // policy_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof policy_doc.active === 'undefined') {
    //   policy_doc.active = true;
    // }

    // policy_doc.company = site.get_company(req);
    // policy_doc.branch = site.get_branch(req);
    $policy.add(policy_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        // response.message = site.words['policyCreated'][req.headers.language]
        response.message = site.word('policyCreated')[req.headers.language]
        response.done = true;

      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });

  });







  site.onPOST('/api/policy/validatePolicy', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['email']) {
      where['email'] = where['email'];
    }
    if (where['policyNumber']) {
      where['policyNumber'] = where['policyNumber'];
    }
    let date = new Date()


    where['validFrom'] = {
      '$lt': date
    }

    where['validTo'] = {
      '$gte': date
    }

    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }

    $policy.findMany({
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
          response.errorCode = site.var('succeed')
          response.message = site.word('findSuccessfully')[req.headers.language]
          site.sendEmail({
            from: 'amr@egytag.com',
            to: 'a.yousry2122@gmail.com',
            subject: 'successfull message',
            message: 'successfull message'
          })
        } else {

          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
        }
        res.json(response);
      },
    );


    function newFunction() {
      return 'name_ar';
    }
  });





  // Update Gov 

  site.post('/api/policy/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let policy_doc = req.body
    policy_doc.updatedAt = new Date(),
      $policy.edit({
        where: {
          _id: (req.params.id)
        },
        set: policy_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $policy.findOne({
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


  // get All Goves

  site.get("/api/policy", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $policy.findMany({
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



  // get Gov By Id

  site.get("/api/policy/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $policy.findOne({
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

  // Hard Delete Gov
  site.post('/api/policy/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $policy.delete({
        _id: id,
        $req: req,
        $res: res,
      },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('policyDeleted')[req.headers.language]
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
  site.post('/api/policy/search', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }
    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');
    }
    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i');
    }
    let limit = 10;
    let skip;

    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }

    $policy.findMany({
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
  site.post('/api/policy/update1', (req, res) => {
    let response = {
      done: false,
    };
    let policy_doc = req.body;
    if (policy_doc.id) {
      $policy.edit(
        {
          where: {
            id: policy_doc.id,
          },
          set: policy_doc,
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

  site.post('/api/policy/view', (req, res) => {
    let response = {
      done: false,
    };



    $policy.findOne(
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
  site.post('/api/policy/delete1', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.body.id;

    if (id) {
      $policy.delete(
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
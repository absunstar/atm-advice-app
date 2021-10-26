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

    let {
      sufferingDiseases,diagnosis,attachments,
      ...rest1
    } = req.body;
let where = rest1
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
let obj = {... req.body}
   let  obj1 = {
     
      policyNumber :obj.policyNumber,
      email :obj.email,
      sufferingDiseases :obj.sufferingDiseases,
      diagnosis :obj.diagnosis,
      attachments:obj.attachments

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

          $policy.edit({
            where: {
              id: (docs[0].id)
            },
            set: obj1,
            $req: req,
            $res: res
          })


          site.sendEmail({
            from: docs[0].email,
            to: 'Ahmed.elbastawesyy@gmail.com',
            subject: 'successfull message',
            message: `
            referance Number : <b>${docs[0].id}<b> <br>
          policy Number : <b>${docs[0].policyNumber}<b> <br>
            email : <b>${docs[0].email}<b> <br>
            diagnosis : <b>${docs[0].diagnosis}<b> <br>
            sufferingDiseases : <b>${docs[0].sufferingDiseases}<b> <br>
           

            
            `
          })
        } else {

          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
        }
        res.json(response);
      },
    );


    
  });



    // add image to Policy
    site.post('/api/policy/upload/image/policy', (req, res) => {
      site.createDir(site.dir + '/../../uploads/' + 'policy', () => {
        site.createDir(site.dir + '/../../uploads/' + 'policy' + '/images', () => {
          let response = {
            done: !0,
          };
          let file = req.files.fileToUpload;
          if (file) {
            let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
            let newpath = site.dir + '/../../uploads/' + 'policy' + '/images/' + newName;
            site.mv(file.path, newpath, function (err) {
              if (err) {
                response.error = err;
                response.done = !1;
              }
              response.image_url = '/api/image/' + 'policy' + '/' + newName;
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


    // add file to Policy
    site.post('/api/policy/upload/file/policy', (req, res) => {
      site.createDir(site.dir + '/../../uploads/' + 'policy', () => {
        site.createDir(site.dir + '/../../uploads/' + 'policy' + '/files', () => {
          let response = {
            done: !0,
          };
          let file = req.files.fileToUpload;
          if (!file) {
            response.done = !1;
            response.error = 'no file uploaded';
            res.json(response);
            return;
          }
          let newName = 'file_' + new Date().getTime() + site.path.extname(file.name);
          let newpath = site.dir + '/../../uploads/' + 'policy' + '/files/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            // response.file = {};
            response.image_url = '/api/file/' + 'policy' + '/' + newName;
            // response.file.name = file.name;
            res.json(response);
          });
        });
      });
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
module.exports = function init(site) {
  const $gov = site.connectCollection('gov');

  // site.get({
  //   name: 'images',
  //   path: __dirname + '/site_files/images/',
  // });

  // site.get({
  //   name: 'gov',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: true,
  // });

  // site.on('[company][created]', (doc) => {
  //   $gov.add(
  //     {
  //       code: "1-Test",
  //       name_ar: 'محافظة إفتراضية',
  //       name_en: "Default Gov",
  //       image_url: '/images/gov.png',
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




  site.on('[test][city][+]', (obj, callback, next) => {
    console.log("from gov", obj);
    // $safes.find({
    //   id: obj.safe.id,
    // }, (err, doc) => {
    //   if (!err && doc) {
    //     doc.pre_balance = doc.balance
    //     if (obj.transition_type == 'in')
    //       doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value)
    //     if (obj.transition_type == 'out')
    //       doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value)
    //     doc.description = obj.description
    //     $safes.update(doc, (err, result) => {

    //       if (!err) {
    //         $safes.find({
    //           id: result.doc.id
    //         }, (err, doc) => {
    //           obj.pre_balance = doc.pre_balance
    //           obj.image_url = doc.image_url
    //           obj.company = doc.company
    //           obj.branch = doc.branch
    //           obj.balance = doc.balance

    //           site.quee('[safes][safes_payments][+]', Object.assign({}, obj))
    //         })
    //       }
    //       next()
    //     })
    //   } else {
    //     next()
    //   }
    // })
  })



















  // Add New Gov With Not Duplicate Name Validation

  // site.onALL('/api/gov' , (req , res)=>{
  //   if(req.method == 'post'){

  //   }
  // })

  // site.onPOST( '/api/gov/count', (req, res) => {
  //   let x = (id , callback)=>{
  //     site.mongodb.lib.find({id : id},(data)=>{
  //       callback(data)
  //     })
  //   }
  
  
  //   x(5 , (data)=>{
  //     console.log(data);
  //   })
  // });

  

  site.onPOST( '/api/gov/add', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let goves_doc = req.body;
    goves_doc.$req = req;
    goves_doc.$res = res;

    goves_doc.isActive = true
    goves_doc.createdAt = new Date()
    goves_doc.updatedAt = new Date()

    // goves_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof goves_doc.active === 'undefined') {
    //   goves_doc.active = true;
    // }

    // goves_doc.company = site.get_company(req);
    // goves_doc.branch = site.get_branch(req);

    $gov.find({
        where: {
          'name': goves_doc.name,
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = site.word('nameExist')[req.headers.language]
          res.json(response);
        } else {

          $gov.add(goves_doc, (err, doc) => {
            if (!err) {
              response.data = doc;
              response.errorCode = site.var('succeed')
              // response.message = site.words['govCreated'][req.headers.language]
              response.message = site.word('govCreated')[req.headers.language]
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

  // Update Gov 

  site.post('/api/gov/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let gov_doc = req.body
    gov_doc.updatedAt = new Date(),
      $gov.edit({
        where: {
          _id: (req.params.id)
        },
        set: gov_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $gov.findOne({
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

  site.get("/api/gov", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $gov.findMany({
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

  // get Gov By Id

  site.get("/api/gov/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $gov.findOne({
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
  site.post('/api/gov/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $gov.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('govDeleted')[req.headers.language]
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
  site.post('/api/gov/search', (req, res) => {
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

    $gov.findMany({
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
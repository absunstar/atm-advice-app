module.exports = function init(site) {
  const $address = site.connectCollection('address');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    ,require : {permissions : []}
  });

  site.get({
    name: 'address',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require : {permissions : []}
  });

  // Add New Address

  site.post('/api/address/add', (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    // if (!req.session.user) {
    //   response.errorCode = site.var('failed')
    //   response.message = site.word('loginFirst')[req.headers.language]
    //   response.done = false;
    //   res.json(response);
    //   return;
    // }
    
    let address_doc = req.body;
    console.log(address_doc);
    address_doc.$req = req;
    address_doc.$res = res;
    address_doc.isActive = true,
      address_doc.createdAt = new Date()
    address_doc.updatedAt = new Date()
    if (!address_doc.gov._id) {
      delete address_doc.gov
    }
    if (!address_doc.city._id) {
      delete address_doc.city
    }
    // address_doc.add_user_info = site.security.getUserFinger({
    //   $req: req,
    //   $res: res,
    // });

    // if (typeof address_doc.active === 'undefined') {
    //   address_doc.active = true;
    // }

    // address_doc.company = site.get_company(req);
    // address_doc.branch = site.get_branch(req);



    $address.add(address_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        // response.message = site.words.get('govCreated').word[req.headers.language]
        response.message = site.word('addressCreated')[req.headers.language]
        
        // ['govCreated'][req.headers.language]
        // response.message = 'addressCreated'
        response.done = true;

      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });



  });

  // Update Address 

  site.post('/api/address/update/:id', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    let gov_doc = req.body
    gov_doc.updatedAt = new Date(),
      $address.edit({
        where: {
          _id: (req.params.id)
        },
        set: gov_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $address.findOne({
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


  // get All Addresses

  site.get("/api/address", (req, res) => {
    let page = 1
    let offset = 0
    let response = {}
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    let limit =10
    let skip 
    if (req.query.page ||( parseInt(req.query.page)&&parseInt(req.query.page)>1)) {
      skip=(parseInt(req.query.page)-1)*10
    }
    $address.findMany({
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

  // get Address By Id

  site.get("/api/address/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    
    $address.findOne({
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

  // Hard Delete Address
  site.post('/api/address/delete/:id', (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
   
    let id = req.params.id;

    if (id) {
      $address.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('addressDeleted')[req.headers.language]
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

  // Search Address
  site.post('/api/address/search', (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    // if (!req.session.user) {
    //   response.errorCode = site.var('failed')
    //   response.message = site.word('loginFirst')[req.headers.language]
    //   response.done = false;
    //   res.json(response);
    //   return;
    // }
    

    let where = req.body || {};

    if (where['city']) {
      where['city._id'] = where['city']._id
      delete where['city']
    }
    if (where['gov']) {
      where['gov._id'] = where['gov']._id;
      delete where['gov']
    }
    if (where['lat']) {
      where['lat'] = String(where['lat'])
    }
    if (where['long']) {
      where['long'] = String(where['long'])
    }
    if (where['district']) {
      where['district'] = site.get_RegExp(where['district'], 'i');
    }
    if (where['streetName']) {
      where['streetName'] = site.get_RegExp(where['streetName'], 'i');
    }
    if (where['buildingNumber']) {
      where['buildingNumber'] = String(where['buildingNumber']);
    }
    if (where['role']) {
      where['role'] = String(where['role']);
    }
    if (where['apartmentNumber']) {
      where['apartmentNumber'] = String(where['apartmentNumber']);
    }
    if (where['specialMark']) {
      where['specialMark'] = site.get_RegExp(where['specialMark'], 'i');
    }
    if (where['title']) {
      where['title'] = site.get_RegExp(where['title'], 'i');
    }
    if (where['city']) {
      where['city'] = String(where['city']);
    }
    if (where['gov']) {
      where['gov'] = String(where['gov']);
    }
    if (where['addressLocation']) {
      where['addressLocation'] = String(where['addressLocation']);
    }
    let limit 
    let skip 
    if (!req.query.page ||( parseInt(req.query.page)&&parseInt(req.query.page)==1)) {
      limit=10
    }
    if (req.query.page ||( parseInt(req.query.page)&&parseInt(req.query.page)>1)) {
      skip=(parseInt(req.query.page)-1)*10
    }

    $address.findMany({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        console.log(docs);
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
  site.post("/api/address/update1", (req, res) => {
    let response = {
      done: false
    }



    let address_doc = req.body


    if (address_doc.id) {

      $address.edit({
        where: {
          id: address_doc.id
        },
        set: address_doc,
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

  site.post("/api/address/view", (req, res) => {
    let response = {
      done: false
    }



    $address.findOne({
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

  site.post("/api/address/delete1", (req, res) => {
    let response = {
      done: false
    }
    let id = req.body.id

    if (id) {
      $address.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true,
            response.errorCode = site.var('succeed')
          response.message = site.word('addressDeleted')[req.headers.language]
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
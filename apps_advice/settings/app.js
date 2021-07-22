module.exports = function init(site) {
  const $settings = site.connectCollection('settings');

  // site.get({
  //   name: 'images',
  //   path: __dirname + '/site_files/images/',
  // });

  // site.get({
  //   name: 'settings',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: true,
  // });

  // site.on('[company][created]', (doc) => {
  //   $settings.add(
  //     {
  //       code: "1-Test",
  //       name_ar: 'محافظة إفتراضية',
  //       name_en: "Default Settings",
  //       image_url: '/images/settings.png',
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


  // Add New Settings With Not Duplicate Name Validation

  site.post('/api/settings/add', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let settings_doc = req.body;
    settings_doc.$req = req;
    settings_doc.$res = res;
    

    $settings.findMany(
      {
        
        limit: 1
        
      },
      (err, docs) => {
        if (docs.length == 0) {

          $settings.add(settings_doc, (err, doc) => {
            if (!err) {
             
              response.data = doc;
              response.errorCode = site.var('succeed')
              response.message = site.word('userCreated')[req.headers.language]
              response.done = true;
            } else {
              response.errorCode = site.var('failed')
              response.message = site.word('errorHappened')[req.headers.language]
              response.done = false;
            }
            res.json(response);
          });

            

        }
        else{
          response.errorCode = site.var('failed')
              response.message = site.word('settingExist')[req.headers.language]
              response.done = false;
              res.json(response);
          console.log(666666);
        }
      },
    );
  });

  // Update Settings 

  site.post('/api/settings/update/:id', (req, res) => {
    let response = {}
    let settings_doc = req.body
      $settings.edit({
        where: {
          _id: (req.params.id)
        },
        set: settings_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $settings.findOne({
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


// get All Settings

  site.get("/api/settings", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $settings.findMany(
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

// get Settings By Id

  site.get("/api/settings/:id", (req, res) => {
    let response = {}
    $settings.findOne(
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

// Hard Delete Settings
  site.post('/api/settings/delete/:id', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $settings.delete(
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

  // Search Settings By Name 
  site.post('/api/settings/search', (req, res) => {
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
    $settings.findMany(
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

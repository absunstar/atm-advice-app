module.exports = function init(site) {
  const $complaints = site.connectCollection('complaints');

  // site.get({
  //   name: 'images',
  //   path: __dirname + '/site_files/images/',
  // });

  // site.get({
  //   name: 'complaints',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: true,
  // });

  // site.on('[company][created]', (doc) => {
  //   $complaints.add(
  //     {
  //       code: "1-Test",
  //       name_ar: 'محافظة إفتراضية',
  //       name_en: "Default complaints",
  //       image_url: '/images/complaints.png',
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


  // Add New complaints With Not Duplicate Name Validation

  site.post('/api/complaints/add', (req, res) => {
    let response = {
      done: false,
    };

    let complaints_doc = req.body;
    complaints_doc.$req = req;
    complaints_doc.$res = res;
    
      
      complaints_doc.createdAt = new Date()
    

 $complaints.add(complaints_doc, (err, doc) => {
            if (!err) {
              response.data = doc;
              response.errorCode = 200
              // response.message = site.words['govCreated'][req.headers.language]
              response.message = 'complaintsCreated'
              response.done = true;

            } else {
              response.errorCode = 406
              response.message = 'errorHappened'
              response.done = false;
            }

            res.json(response);
          });
    
  });

  // Update complaints 

  site.post('/api/complaints/update/:id', (req, res) => {
    let response = {}
    let complaints_doc = req.body
    complaints_doc.updatedAt = new Date(),
      $complaints.edit({
        where: {
          _id: (req.params.id)
        },
        set: complaints_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $complaints.findOne({
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


// get All complaints

  site.get("/api/complaints", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $complaints.findMany(
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

// get complaints By Id

  site.get("/api/complaints/:id", (req, res) => {
    let response = {}
    $complaints.findOne(
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

// Hard Delete complaints
  site.post('/api/complaints/delete/:id', (req, res) => {
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $complaints.delete(
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

  // Search complaints By Name 
  site.post('/api/complaints/search', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body || {};

    if (where['title']) {
      where['title'] = String(where['title']);
    }
    if (where['description']) {
      where['description'] = String(where['description']);
    }

    let limit = 10;
    let skip;
   
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    $complaints.findMany(
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
          response.errorCode = 406
          response.docs = docs
          response.message = 'findFailed'
          response.done = false;
        }
        res.json(response);
      },
    );
  });
};

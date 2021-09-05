
module.exports = function init(site) {
    const $rating = site.connectCollection('rating');
    const arLang = require('../../common/json/ar')
    const enLang = require('../../common/json/en')
    let ObjectID = require('mongodb').ObjectID  

    const langObject = { arLang, enLang }
    const getTransByKey = (key, lang) => {
        if (lang == 'arLang' || lang == 'enLang') {
            if (langObject[lang][key])
                return langObject[lang][key]

        }

        return key
    }
    const getTrans = (key, req) => {
        req.headers.language
        return getTransByKey(key, req.headers.language)
    }



    site.post('/api/rating', (req, res) => {
        let response = {};
        let goves_doc = req.body;
        goves_doc.$req = req;
        goves_doc.$res = res;
        goves_doc.isDeleted = false,
            goves_doc.isActive = true,
            goves_doc.createdAt = new Date()
        goves_doc.updatedAt = new Date()
        $rating.add(goves_doc, (err, doc) => {
            if (!err) {
                response.data = doc;
                response.statusCode = 200
                response.message = getTrans('govCreated', req)

            } else {
                response.error = err.message;
            }
            res.json(response);
        });



    });




    site.put("/api/rating/:id", (req, res) => {
        let response = {}
        let gov_doc = req.body
        gov_doc.updatedAt = new Date(),
        $rating.edit({
            where: {
              _id: new ObjectID(req.params.id)
            },
            set: gov_doc,
            $req: req,
            $res: res
          }, err => {
      
            if (!err) {
              $rating.findOne({
                where: {
                  _id: new ObjectID(req.params.id)
                }
              }, (err, doc) => {
                if (!err) {
      
                    
                      response.data = doc
                    response.statusCode = 200
                    response.message = getTrans('updatedSuccessfully', req)
                    res.json(response)
                 
      
                } else {
                  response.error = err.message
                }
      
              })
      
            } else {
              response.error = 'Code Already Exist'
            }
      
          })
        // $rating.edit({
        //     where: {
        //         _id: objectId(req.params.id)
        //     },
        //     set: gov_doc,
        //     $req: req,
        //     $res: res
        // }, err => {

        //     if (!err) {
        //         doc.updatedAt = new Date(),
        //             response.data = doc
        //         response.statusCode = 200
        //         response.message = getTrans('updatedSuccessfully', req)
        //         res.json(response)
        //     } else {
        //         response.message = getTrans('updateNotHappened', req),
        //             response.returnStatus = false,
        //             response.statusCode = 406
        //         res.json(response)

        //     }

        // })

    })

    site.post("/api/rating/view", (req, res) => {
        let response = {
            done: false
        }

        if (!req.session.user) {
            response.error = 'Please Login First'
            res.json(response)
            return
        }

        $rating.findOne({
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

    site.delete("/api/rating/:id", (req, res) => {
        let response = {}

        $rating.edit(
            {
                where: {
                    _id: new ObjectID(req.params.id),
                },
                set: { isDeleted: true },
                $req: req,
                $res: res,
            },
            (err) => {
                if (!err) {
                    response.message = getTrans('govDeleted', req),
                        response.returnStatus = true,
                        response.statusCode = 200
                } else {
                    response.message = getTrans('deleteNotHappened', req),
                    response.returnStatus = false,
                    response.statusCode = 406
                
                }
                res.json(response);
            },
        );

    })

    site.get("/api/rating", (req, res) => {
        let page = 1
        let offset = 0
        let response = {}
     
    
        
        $rating.findMany(
            {
              select: req.body.select || {},
              where: {isDeleted : false},
              sort: req.body.sort || {
                id: -1,
              },
              limit: req.body.limit||10,
            },
            (err, docs, count) => {
              if (!err) {
                response.docs = docs
            response.totalDocs = docs.length
            response.limit = 10
            response.offset = (page - 1) * response.limit;
            response.page = 1 + Math.floor(response.offset / response.limit);
            response.totalPages = Math.ceil(response.totalDocs / response.limit)
              } else {
                response.error = err.message;
              }
              res.json(response);
            },
          );
            

    })


    

    site.get("/api/rating/:id", (req, res) => {
        let response = {}

        $rating.findOne(
            {
                where: {
                    _id: new ObjectID(req.params.id),
                    isDeleted : false
                },

            },
            (err, doc) => {
                if (!err && doc) {
                    response.data = doc
                    response.message = getTrans('findSuccessfully', req),
                        response.returnStatus = true,
                        response.statusCode = 200
                }
                if (doc == null) {
                    response.message = getTrans('findNotHappened', req),
                        response.returnStatus = false,
                        response.statusCode = 406
                }
                res.json(response);
            },
        );

    })

    site.post("/api/rating/search", (req, res) => {

        let response = {}
        let where = req.body;


        let page = 1
        let offset = 0
       
        if (where['name']) {
            where['name'] = site.get_RegExp(where['name'], 'i');
        }

        $rating.aggregate(
            [
                {
                    "$match": where
                },
                { 
                    "$match" : {
                        "isDeleted" : false
                    }
                },
                {
                    "$project": {
                        "_id": 1.0,
                        "name": 1.0,
                        "isDeleted": 1.0,
                        "isActive": 1.0,
                        "id": 1.0,
                        "createdAt": 1.0,
                        "updatedAt": 1.0
                    }
                },

            ], (err, docs) => {
                if (!err) {

                    response.docs = docs
                    response.totalDocs = docs.length
                    response.limit = 10
                    response.offset = (page - 1) * response.limit;
                    response.page = 1 + Math.floor(response.offset / response.limit);
                    response.totalPages = Math.ceil(response.totalDocs / response.limit)
                } else {
                    response.error = err.message
                }
                res.json(response)
            })



    })

}
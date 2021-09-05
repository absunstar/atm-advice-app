
module.exports = function init(site) {
    const $city = site.connectCollection("city")
    const $gov = site.connectCollection('gov');
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
    site.on('[gov][city][test]', (obj, callback, next) => {
      console.log("from city app create gets govs" ,obj );
    })
  
    site.post("/api/city", async (req, res) => {
      let response = {}
      let city_doc = req.body
      $gov.findOne({
        where: {
          _id: req.body.govId
        }
      }, (err, doc1) => {
        let govData
        if (!err) {
          city_doc.$req = req
          city_doc.$res = res
          if (doc1 == null) {
            res.send({
              message: getTrans('govNotFound', req),
            })
            return
          }
          if (doc1 != null) {
            govData = {
              _id: doc1._id,
              name: doc1.name
            }
          }
          city_doc.govId = doc1._id
          city_doc.isDeleted = false,
            city_doc.isActive = true,
            city_doc.createdAt = new Date()
          city_doc.updatedAt = new Date()
          $city.add(city_doc, (err, doc) => {
            if (!err) {
              // response.done = true
              doc.govId = govData
              response.data = doc
              response.statusCode = 200
              response.message = getTrans('cityCreated', req)
            } else {
              response.error = err.message
            }
            res.json(response)
          })
        } else {
          response.error = err.message
        }
  
      })
  
  
    })
  
    site.put("/api/city/:id", (req, res) => {
      let response = {}
  
      let city_doc = req.body
      if (typeof req.body.govId == 'string') {
        city_doc.govId = new ObjectID(req.body.govId)
      }
      city_doc.updatedAt = new Date()
      $city.edit({
        where: {
          _id: new ObjectID(req.params.id)
        },
        set: city_doc,
        $req: req,
        $res: res
      }, err => {
  
        if (!err) {
          $city.findOne({
            where: {
              _id: new ObjectID(req.params.id)
            }
          }, (err, doc) => {
            let govData
            if (!err) {
              $gov.findOne({
                where: {
                  _id: (doc.govId)
                }
              }, (err, doc1) => {
                govData = {
                  _id: doc1._id,
                  name: doc1.name
                }
  
                doc.govId = govData
  
                  response.data = doc
                response.statusCode = 200
                response.message = getTrans('updatedSuccessfully', req)
                res.json(response)
              })
  
            } else {
              response.error = err.message
            }
  
          })
  
        } else {
          response.error = 'Code Already Exist'
        }
  
      })
  
    })
  
    site.post("/api/city/view", (req, res) => {
      let response = {
        done: false
      }
  
      if (!req.session.user) {
        response.error = 'Please Login First'
        res.json(response)
        return
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
  
    site.delete("/api/city/:id", (req, res) => {
      let response = {}
  
      $city.edit(
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
            response.message = getTrans('cityDeleted', req),
              response.returnStatus = true,
              response.statusCode = 200
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        },
      );
  
    })
  
    site.get("/api/city", (req, res) => {
      let page = 1
      let offset = 0
      let response = {}
  
      $city.aggregate(
        [
          { 
            "$match" : {
                "isDeleted" : false
            }
        },
          { 
            "$lookup" : {
                "from" : "gov", 
                "localField" : "govId", 
                "foreignField" : "_id", 
                "as" : "govId1"
            }
        }, 
        { 
            "$unwind" : {
                "path" : "$govId1", 
                "includeArrayIndex" : "arrayIndex", 
                "preserveNullAndEmptyArrays" : false
            }
        }, 
        { 
            "$addFields" : {
                "govId" : {
                    "_id" : "$govId1._id", 
                    "name" : "$govId1.name"
                }
            }
        }, 
        { 
            "$project" : {
                "_id" : 1.0, 
                "name" : 1.0, 
                "govId" : 1.0, 
                "isDeleted" : 1.0, 
                "isActive" : 1.0, 
                "id" : 1.0, 
                "createdAt" : 1.0, 
                "updatedAt" : 1.0
            }
        }
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
  


    site.get("/api/city/:id", (req, res) => {
      let response = {}
  
      $city.findOne(
        {
          where: {
            _id: new ObjectID(req.params.id),
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
  
    site.post("/api/city/search", (req, res) => {
  
   let response = {}
      let where = req.body;
  
  
      let page = 1
      let offset = 0
      if (where['govId']) {
        where['govId'] = new ObjectID(where['govId'])
      }
      if (where['name']) {
        where['name'] = site.get_RegExp(where['name'], 'i');
      }
  
      $city.aggregate(
        [
          { 
            "$match" : where
        },
        { 
          "$match" : {
              "isDeleted" : false
          }
      },
          { 
            "$lookup" : {
                "from" : "gov", 
                "localField" : "govId", 
                "foreignField" : "_id", 
                "as" : "govId1"
            }
        }, 
        { 
            "$unwind" : {
                "path" : "$govId1", 
                "includeArrayIndex" : "arrayIndex", 
                "preserveNullAndEmptyArrays" : false
            }
        }, 
        { 
            "$addFields" : {
                "govId" : {
                    "_id" : "$govId1._id", 
                    "name" : "$govId1.name"
                }
            }
        }, 
        { 
          "$project" : {
              "_id" : 1.0, 
              "name" : 1.0, 
              "govId" : 1.0, 
              "isDeleted" : 1.0, 
              "isActive" : 1.0, 
              "id" : 1.0, 
              "createdAt" : 1.0, 
              "updatedAt" : 1.0
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
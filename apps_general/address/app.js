module.exports = function init(site) {
  const $address = site.connectCollection("address")
  const $city = site.connectCollection("city")
  const $gov = site.connectCollection('gov');
  const arLang = require('../../common/json/ar')
  const enLang = require('../../common/json/en')
  let ObjectID = require('mongodb').ObjectID
  const pipeline = require('./pipeline')
  const langObject = {
    arLang,
    enLang
  }
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


  site.addressAggregate = function (types, where, res, req) {
    let page = 1
    let response = {}
  

    // $gov.countDocuments(obj.where, function (err, count) {
    //   if (err) {
    //     callback(err, [], 0);

    //     response.docs = docs
    //     response.totalDocs = docs.length
    //     // slelct top 10
    //     $gov.findMany
    //     return;
    //   }
        // site.var('sss' , 'vvvv')


    $address.aggregate(
      [{
          "$match": where
        },
        {
          "$lookup": {
            "from": "gov",
            "let": {
              "govId": "$govId"
            },
            "pipeline": [{
                "$match": {
                  "$expr": {
                    "$eq": [
                      "$_id",
                      "$$govId"
                    ]
                  }
                }
              },
              {
                "$project": {
                  "_id": 1.0,
                  "name": 1.0
                }
              }
            ],
            "as": "govId"
          }
        },
        {
          "$unwind": {
            "path": "$govId",
            "preserveNullAndEmptyArrays": true
          }
        },

        {
          "$lookup": {
            "from": "city",
            "let": {
              "cityId": "$cityId"
            },
            "pipeline": [{
                "$match": {
                  "$expr": {
                    "$eq": [
                      "$_id",
                      "$$cityId"
                    ]
                  }
                }
              },
              {
                "$project": {
                  "_id": 1.0,
                  "name": 1.0
                }
              }
            ],
            "as": "cityId"
          }
        },
        {
          "$unwind": {
            "path": "$cityId",
            "preserveNullAndEmptyArrays": true
          }
        },

      ], (err, docs) => {
        if (!err) {
          if (types.type == 'single' && types.message == 'created') {
            response.data = docs[0]
            response.statusCode = 200,
              response.message = getTrans('addressCreated', req)
          }
          if (types.type == 'single' && types.message == 'find') {
            response.data = docs[0]
            response.statusCode = 200,
              response.message = getTrans('findSuccessfully', req)
          }

          if (types.type == 'single' && types.message == 'updated') {
            response.data = docs[0]
            response.statusCode = 200,
              response.message = getTrans('updatedSuccessfully', req)
          }
          if (types.type == 'array') {
            response.docs = docs
            response.totalDocs = docs.length
            response.limit = 10
            response.offset = (page - 1) * response.limit;
            response.page = 1 + Math.floor(response.offset / response.limit);
            response.totalPages = Math.ceil(response.totalDocs / response.limit)

          }


        } else {
          response.error = err.message
        }
        res.json(response);
      })
  }



  site.post("/api/address", async (req, res) => {
    let response = {}
    let address_doc = req.body
    address_doc.isDeleted = false,
      address_doc.isActive = true,
      address_doc.createdAt = new Date()


    if (!address_doc.govId) {
      delete address_doc.govId
    }
    if (address_doc.cityId == "") {
      delete address_doc.cityId
    }


    if (address_doc.govId) {
      $gov.findOne({
        where: {
          _id: req.body.govId
        },
        limit : 10,
        skip : 10 * 2
      }, (err, doc1) => {
        if (doc1 == null) {
          res.send({
            message: getTrans('govNotFound', req),
          })
          return
        }
      })
    }


    if (address_doc.cityId) {
      $city.findOne({
        where: {
          _id: req.body.cityId
        }
      }, (err, doc1) => {
        if (doc1 == null) {
          res.send({
            message: getTrans('cityNotFound', req),
          })
          return
        }
      })
    }
    address_doc.gov._id
    if (address_doc.govId != undefined) {
      address_doc.govId = address_doc.govId ? new ObjectID(address_doc.govId) : address_doc.govId
    }
    if (address_doc.cityId != undefined) {
      address_doc.cityId = address_doc.cityId ? new ObjectID(address_doc.cityId) : address_doc.cityId
    }
    $address.add(address_doc, (err, doc) => {
      if (!err) {

        response.data = doc
        response.statusCode = 200
       response.message =  getTrans('addressCreated', req)
        // response.message = site.words['addressCreated'][req.headers.language] // getTrans('addressCreated', req)
      } else {
        response.error = err.message
      }

      let types = {
        type: 'single',
        message: 'created'
      }

      site.addressAggregate(types, {_id :doc._id}, res, req)

    })


  })

  site.put("/api/address/:id", (req, res) => {
    let response = {}

    let address_doc = req.body
    if (typeof req.body.govId == 'string') {
      address_doc.govId = new ObjectID(req.body.govId)
    }
    if (typeof req.body.cityId == 'string') {
      address_doc.cityId = new ObjectID(req.body.cityId)
    }
    address_doc.updatedAt = new Date(),
      $address.edit({
        where: {
          _id: new ObjectID(req.params.id)
        },
        set: address_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          let types = {
            type: 'single',
            message: 'updated'
          }

          site.addressAggregate(types, {}, res, req)
        } else {
          response.error = 'Code Already Exist'
        }

      })

  })

  site.post("/api/address/delete/:id", (req, res) => {

  })

  site.delete("/api/address/:id", (req, res) => {
    let response = {}

   

    $address.edit({
        where: {
          _id: req.params.id, // amr
        },
        set: {
          isDeleted: true
        },
        $req: req,
        $res: res,
      },
      (err, doc) => {
        if (!err) {
          response.message = getTrans('addressDeleted', req),
            response.done = false,
            response.error = "";
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      },
    );

  })

  site.get("/api/address", (req, res) => {
    let page = 1
    let offset = 0
    let response = {}

    let types = {
      type: 'array',
      message: ''
    }

    site.addressAggregate(types,{}, res, req)
   
  })





  site.get("/api/address/:id", (req, res) => {
    let response = {}

    $address.findOne({
        where: {
          _id: new ObjectID(req.params.id),
        },

      },
      (err, doc) => {
        if (!err && doc) {





          let types = {
            type: 'single',
            message: 'find'
          }

          site.addressAggregate(types, {}, res, req)



        }
        if (doc == null) {
          response.message = getTrans('findNotHappened', req),
            response.returnStatus = false,
            response.statusCode = 406
        }

      },
    );

  })

  site.post("/api/address/search", (req, res) => {

    let response = {}
    let where = req.body;


    let page = 1
    let offset = 0

    if (where['cityId']) {
      where['cityId'] = new ObjectID(where['cityId'])
    }
    if (where['govId']) {
      where['govId'] = new ObjectID(where['govId'])
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

    let types = {
      type: 'array',
      message: ''
    }

    site.addressAggregate(types, where, res, req)

  })

}
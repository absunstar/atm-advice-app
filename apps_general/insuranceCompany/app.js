
module.exports = function init(site) {
    const $insuranceCompany = site.connectCollection('insuranceCompany');
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
    site.post('/api/insuranceCompany', (req, res) => {
        let response = {};
        let insuranceCompany_doc = req.body;

        insuranceCompany_doc.$req = req;
        insuranceCompany_doc.$res = res;
        insuranceCompany_doc.isDeleted = false,
            insuranceCompany_doc.isActive = true,
            insuranceCompany_doc.createdAt = new Date()
        insuranceCompany_doc.updatedAt = new Date()
        $insuranceCompany.add(insuranceCompany_doc, (err, doc) => {
            if (!err) {
                response.data = doc;
                response.statusCode = 200
                response.message = getTrans('insuranceCompanyCreated', req)

            } else {
                response.error = err.message;
            }
            res.json(response);
        });



    });




    site.put("/api/insuranceCompany/:id", (req, res) => {
        let response = {}
        let insuranceCompany_doc = req.body
        insuranceCompany_doc.updatedAt = new Date(),
        $insuranceCompany.edit({
            where: {
                _id: new ObjectID(req.params.id)
            },
            set: insuranceCompany_doc,
            $req: req,
            $res: res
        }, err => {

            if (!err) {
                $insuranceCompany.findOne({
                    where: {
                        _id: new ObjectID(req.params.id)
                    }
                }, (err, doc) => {
                    if (!err) {

                        doc.updatedAt = new Date(),
                            response.data = doc
                        response.statusCode = 200
                        response.message = getTrans('updatedSuccessfully', req)
                        res.json(response)


                    } else {
                        response.message = getTrans('updateNotHappened', req),
                            response.returnStatus = false,
                            response.statusCode = 406
                        res.json(response)
                    }

                })

            }

        })

    })

    site.post("/api/insuranceCompany/view", (req, res) => {
        let response = {
            done: false
        }

        if (!req.session.user) {
            response.error = 'Please Login First'
            res.json(response)
            return
        }

        $insuranceCompany.findOne({
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

    site.delete("/api/insuranceCompany/:id", (req, res) => {
        let response = {}

        $insuranceCompany.edit(
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
                    response.message = getTrans('insuranceCompanyDeleted', req),
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

    site.get("/api/insuranceCompany", (req, res) => {
        let page = 1
        let offset = 0
        let response = {}



        $insuranceCompany.findMany(
            {

                where: { isDeleted: false },
                limit: req.body.limit || 10,
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




    site.get("/api/insuranceCompany/:id", (req, res) => {
        let response = {}

        $insuranceCompany.findOne(
            {
                where: {
                    _id: new ObjectID(req.params.id),
                    isDeleted: false
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

    site.post("/api/insuranceCompany/search", (req, res) => {

        let response = {}
        let where = req.body;


        let page = 1
        let offset = 0

        if (where['name']) {
            where['name'] = site.get_RegExp(where['name'], 'i');
        }

        $insuranceCompany.aggregate(
            [
                {
                    "$match": where
                },
                {
                    "$match": {
                        "isDeleted": false
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

module.exports = function init(site) {
    const $orders = site.connectCollection('orders');
    const $rating = site.connectCollection('rating');
    const arLang = require('../../common/json/ar')
    const enLang = require('../../common/json/en')
    const Enums = require('../../common/json/enums')

    let ObjectID = require('mongodb').ObjectID

    // const objectId = mongoose.Types.ObjectId;
    let getDocs
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

    site.ordersAggregate = function (types, where, res, req, message) {
        let page = 1
        let response = {}

        $orders.aggregate(
            [{
                "$match": where
            },
            {
                "$lookup": {
                    "from": "insuranceCompany",
                    "let": {
                        "insuranceCompany": "$insuranceCompany"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        "$_id",
                                        "$$insuranceCompany"
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
                    "as": "insuranceCompany"
                }
            },
            {
                "$unwind": {
                    "path": "$insuranceCompany",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$lookup": {
                    "from": "address",
                    "let": {
                        "addressId": "$addressId"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        "$_id",
                                        "$$addressId"
                                    ]
                                }
                            }
                        }
                    ],
                    "as": "addressId"
                }
            },
            {
                "$unwind": {
                    "path": "$addressId",
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$lookup": {
                    "from": "users_info",
                    "let": {
                        "userId": "$userId"
                    },
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$eq": [
                                        "$_id",
                                        "$$userId"
                                    ]
                                }
                            }
                        },
                        {
                            "$project": {
                                "_id": 1.0,
                                "email": 1.0
                            }
                        }
                    ],
                    "as": "userId"
                }
            },
            {
                "$unwind": {
                    "path": "$userId",
                    "preserveNullAndEmptyArrays": true
                }
            }

            ], (err, docs) => {
                if (!err) {
                    if (types.type == 'single') {
                        response.data = docs[0]
                        response.statusCode = 200,
                            response.message = message
                    }

                   

                    if (types.type == 'array' && types.message == '') {
                        response.docs = docs
                        response.totalDocs = docs.length
                        response.limit = 10
                        response.offset = (1 - 1) * response.limit;
                        response.page = 1 + Math.floor(response.offset / response.limit);
                        response.totalPages = Math.ceil(response.totalDocs / response.limit)
                        response.message = message
                    }
                    if (types.type == 'array' && types.message == 'array') {
                        let limit = 10
                        response.data = {
                            docs: docs,
                            totalDocs: docs.length,
                            limit: limit,
                            totalPages: Math.ceil(docs.length / limit)
                        }
                        response.message = message
                        response.statusCode = 200
                    }
                    if (types.type == 'message') {

                        response.message = message
                        response.returnStatus = true
                        response.statusCode = 200

                    }


                } else {
                    response.error = err.message
                }
                getDocs(docs)

                res.json(response);

            })
    }

    site.post('/api/orders', (req, res) => {
        let response = {};
        let orders_doc = req.body;
        if (typeof orders_doc.userId == 'string') {
            orders_doc.userId = new ObjectID(orders_doc.userId)
        }
        if (typeof orders_doc.addressId == 'string') {
            orders_doc.addressId = new ObjectID(orders_doc.addressId)
        }
        if (typeof orders_doc.insuranceCompany == 'string') {
            orders_doc.insuranceCompany = new ObjectID(orders_doc.insuranceCompany)
        }
        orders_doc.$req = req;
        orders_doc.$res = res;
        orders_doc.status = {
            statusId: Enums.activeId,
            name: Enums.active,
        }
        orders_doc.isDeleted = false,
            orders_doc.isActive = true,
            orders_doc.createdAt = new Date()
        orders_doc.isPublished = true
        orders_doc.updatedAt = new Date()
        $orders.add(orders_doc, (err, doc) => {
            if (!err) {
                response.data = doc;
                response.statusCode = 200
                response.message = getTrans('orderCreated', req)

            } else {
                response.error = err.message;
            }

            let types = {
                type: 'single',
                message: 'created'
            }
            let message = getTrans('orderCreated', req)
            site.ordersAggregate(types, { _id: doc._id }, res, req, message)
            getDocs = (val) => { }
        });
    });

    site.post('/api/orders/getActiveOrders', async (req, res) => {

        let types = {
            type: 'array',
            message: 'array'
        }
        $orders.findMany({
            where: { isDeleted: false, 'status.statusId': Enums.activeId },
        }, (err, docs, count) => {
            if (docs.length > 0) {
                let now = new Date();
                for (const iterator of docs) {
                    let end = new Date(iterator['createdAt']);
                    let diff = now.getHours() - end.getHours()
                    let time = 3
                    if (diff > time == true) {
                        $orders.edit({
                            where: {
                                isDeleted: false, 'status.statusId': Enums.activeId, _id: iterator._id,
                                userId: iterator.userId._id,
                            },
                            set: { 'status.statusId': Enums.notActiveId, 'status.name': Enums.notActive },

                        } , ()=>{
                            $orders.findMany({
                                where: { isDeleted: false, 'status.statusId': Enums.activeId },
            
                            }, (err, docs, count) => {
                                site.ordersAggregate(types, { isDeleted: false, 'status.statusId': Enums.activeId }, res, req)
                                getDocs = (val) => { }
                            }
                            )
                        })
                    }

                }
               
            }
            if (docs.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noActiveOrders', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        )
    });



    site.post('/api/orders/updateToStatusInProgress', (req, res) => {
        let types = {
            type: 'message'
        }
        let message = getTrans('ordersUpdated', req)
        let orders_doc = req.body;
        let valDiscount
        if (orders_doc.discountPercentage < 0 || orders_doc.discountPercentage > 100) {
            valDiscount = { message: getTrans('percentageInCorrect', req), returnStatus: false, "statusCode": 406 }
            return res.json(valDiscount)
        }
        else {
            valDiscount = orders_doc.discountPercentage
        }
        getDocs = (val) => {
            if (val.length > 0) {
                for (const iterator of val) {
                    $orders.edit({
                        where: {
                            isDeleted: false, 'status.statusId': Enums.activeId, _id: new ObjectID(iterator._id),
                            userId: new ObjectID(iterator.userId._id)
                        },
                        set: {
                            pharmacyId: new ObjectID(orders_doc.pharmacyId),
                            price: orders_doc.price,
                            discountPercentage: valDiscount,
                            totalPrice: orders_doc.totalPrice,
                            deliveryTime: orders_doc.deliveryTime,
                            isPublished: false, 'status.statusId': Enums.inProgressId, 'status.name': Enums.inProgress
                        },
                        $req: req,
                        $res: res
                    })
                }
            }
            if (val.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noActiveOrders', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        site.ordersAggregate(types, {
            isDeleted: false,
            _id: new ObjectID(orders_doc.orderId),
            userId: new ObjectID(orders_doc.userId),
            'status.statusId': Enums.activeId
        }, res, req, message)

    });


    site.post('/api/orders/updateToStatusOnWay', (req, res) => {
        let types = {
            type: 'message'
        }
        let message = getTrans('ordersUpdated', req)
        let orders_doc = req.body;

        getDocs = (val) => {
            if (val.length > 0) {
                for (const iterator of val) {
                    $orders.edit({
                        where: {
                            isDeleted: false,
                            _id: new ObjectID(orders_doc._id),
                            userId: new ObjectID(orders_doc.userId),
                            'status.statusId': Enums.inProgressId,
                            pharmacyId: new ObjectID(orders_doc.pharmacyId),
                        },
                        set: { 'status.statusId': Enums.onWayId, 'status.name': Enums.onWay },
                        $req: req,
                        $res: res
                    })
                }
            }
            if (val.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noOrderFound', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        site.ordersAggregate(types, {
            isDeleted: false,
            _id: new ObjectID(orders_doc._id),
            userId: new ObjectID(orders_doc.userId),
            'status.statusId': Enums.inProgressId,
            pharmacyId: new ObjectID(orders_doc.pharmacyId),
        }, res, req, message)

    });

    site.post('/api/orders/updateToStatusShipped', (req, res) => {
        let types = {
            type: 'message'
        }
        let message = getTrans('ordersUpdated', req)
        let orders_doc = req.body;
        getDocs = (val) => {
            if (val.length > 0) {

                for (const iterator of val) {
                    $orders.edit({
                        where: {
                            isDeleted: false,
                            _id: new ObjectID(iterator._id),
                            userId: new ObjectID(iterator.userId._id),
                            'status.statusId': Enums.onWayId,
                            pharmacyId: new ObjectID(iterator.pharmacyId),
                        },
                        set: { 'status.statusId': Enums.shippedId, 'status.name': Enums.shipped },
                        $req: req,
                        $res: res
                    })
                }
            }
            if (val.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noOrderFound', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        site.ordersAggregate(types, {

            isDeleted: false,
            _id: new ObjectID(orders_doc._id),
            userId: new ObjectID(orders_doc.userId),
            'status.statusId': Enums.onWayId,
            pharmacyId: new ObjectID(orders_doc.pharmacyId),

        }, res, req, message)

    });


    site.post('/api/orders/updateToStatusCanceled', (req, res) => {
        let types = {
            type: 'message'
        }
        let message = getTrans('ordersUpdated', req)
        let orders_doc = req.body;

        getDocs = (val) => {
            if (val.length > 0) {
                let now = new Date();
                for (const iterator of val) {
                    let end = new Date(iterator['updatedAt']);
                    let time = 5
                    let diff = (now.getTime() - end.getTime()) / 1000;
                    diff /= 60;
                    let xDiff = Math.abs(Math.round(diff))
                    if (time > xDiff == true) {
                        $orders.edit({
                            where: {
                                isDeleted: false,
                                _id: new ObjectID(orders_doc._id),
                                userId: new ObjectID(orders_doc.userId),
                                'status.statusId': Enums.inProgressId,
                            },
                            set: { 'status.statusId': Enums.canceledId, 'status.name': Enums.canceled },

                        })
                    }
                    else {
                        let obj = {}
                        obj.statusCode = 406
                        obj.message = getTrans('cantCancelTime', req)
                        obj.returnStatus = false
                        res.json(obj)
                        return
                    }

                    $orders.edit({
                        where: {
                            isDeleted: false,
                            _id: new ObjectID(orders_doc._id),
                            userId: new ObjectID(orders_doc.userId),
                            'status.statusId': Enums.activeId,

                        },
                        set: { 'status.statusId': Enums.canceledId, 'status.name': Enums.canceled },

                    })
                }
            }
            if (val.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noOrderFound', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        site.ordersAggregate(types, {
            isDeleted: false,
            _id: new ObjectID(orders_doc._id),
            userId: new ObjectID(orders_doc.userId),
        }, res, req, message)

    });


    site.post('/api/orders/getCanceledOrdersByUser', (req, res) => {
        let types = {
            type: 'array',
            message: 'array'
        }
        let message = getTrans('canceledOrdersFound', req)
        let orders_doc = req.body;
        getDocs = (val) => {

            if (val.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noOrderFound', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        site.ordersAggregate(types, {
            isDeleted: false,
            userId: new ObjectID(orders_doc.userId),
            'status.statusId': Enums.canceledId

        }, res, req, message)

    });

    site.post('/api/orders/getShippedOrdersByUser', (req, res) => {
        let types = {
            type: 'array',
            message: 'array'
        }
        let message = getTrans('shippedOrdersFound', req)
        let orders_doc = req.body;
        getDocs = (val) => {

            if (val.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noOrderFound', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        site.ordersAggregate(types, {
            isDeleted: false,
            userId: new ObjectID(orders_doc.userId),
            'status.statusId': Enums.shippedId

        }, res, req, message)

    });

    site.post('/api/orders/ratingPharmacy', (req, res) => {
        let types = {
            type: 'single'
        }
        let message = getTrans('shippedOrdersFound', req)

        let orders_doc = req.body;

        getDocs = (val) => {
            if (val.length > 0) {
                let createdObj = {
                    userId: val[0].userId._id,
                    orderId: val[0]._id,
                    pharmacyId: val[0].pharmacyId,
                    pharmacyRating: orders_doc.pharmacyRating,
                    description: orders_doc.description,
                }
                console.log(val);
                $rating.add(createdObj, (err, doc) => {
                    if (!err) {
                        response.data = doc;
                        response.statusCode = 200
                        response.message = getTrans('govCreated', req)

                    } else {
                        response.error = err.message;
                    }
                    res.json(response);
                });
            }
            if (val.length == 0) {
                let obj = {}
                obj.statusCode = 406
                obj.message = getTrans('noOrderFound', req)
                obj.returnStatus = false
                res.json(obj)
                return
            }
        }
        site.ordersAggregate(types, {
            isDeleted: false,
            _id: new ObjectID(orders_doc._id),
            userId: new ObjectID(orders_doc.userId),
            'status.statusId': Enums.shippedId

        }, res, req, message)

    });



    site.post('/api/orders/reOrderPreviousOrder', (req, res) => {
        let orders_doc = req.body;
        let types = {
            type: 'single'
        }
        let message = getTrans('orderCreated', req)
        if (orders_doc.status == String(Enums.shippedId)) {
            getDocs = (val) => {
                if (val.length > 0) {
                    let obj = {

                        fullName: val[0].fullName,
                        phone: val[0].phone,
                        hasInsurance: val[0].hasInsurance,
                        contractingCompany: val[0].contractingCompany,
                        insuranceCompany: val[0].insuranceCompany._id,
                        insuranceNumber: val[0].insuranceNumber,
                        addressId: val[0].addressId._id,
                        userId: val[0].userId._id,
                        status: { statusId: 1, name: 'active' },
                        isDeleted: false,
                        isActive: true,
                        createdAt: new Date(),
                        isPublished: true,
                        updatedAt: new Date(),

                    }
                    $orders.add(obj, (err, doc) => {

                    });
                }
                if (val.length == 0) {
                    let obj = {}
                    obj.statusCode = 406
                    obj.message = getTrans('noShippedOrders', req)
                    obj.returnStatus = false
                    res.json(obj)
                    return
                }
            }
            site.ordersAggregate(types, {
                isDeleted: false,
                _id: new ObjectID(orders_doc._id),
                userId: new ObjectID(orders_doc.userId),
                'status.statusId': (Enums.shippedId)
            }, res, req, message)
        }
        if (orders_doc.status == String(Enums.canceledId)) {

            getDocs = (val) => {
                if (val.length > 0) {
                    let obj = {

                        fullName: val[0].fullName,
                        phone: val[0].phone,
                        hasInsurance: val[0].hasInsurance,
                        contractingCompany: val[0].contractingCompany,
                        insuranceCompany: val[0].insuranceCompany._id,
                        insuranceNumber: val[0].insuranceNumber,
                        addressId: val[0].addressId._id,
                        userId: val[0].userId._id,
                        status: { statusId: 1, name: 'active' },
                        isDeleted: false,
                        isActive: true,
                        createdAt: new Date(),
                        isPublished: true,
                        updatedAt: new Date(),

                    }
                    $orders.add(obj, (err, doc) => {

                    });
                }
                if (val.length == 0) {
                    let obj = {}
                    obj.statusCode = 406
                    obj.message = getTrans('noCanceledOrders', req)
                    obj.returnStatus = false
                    res.json(obj)
                    return
                }
            }
            site.ordersAggregate(types, {
                isDeleted: false,
                _id: new ObjectID(orders_doc._id),
                userId: new ObjectID(orders_doc.userId),
                'status.statusId': (Enums.canceledId)
            }, res, req, message)

        }
        if (orders_doc.status == String(Enums.notActiveId)) {
            getDocs = (val) => {
                if (val.length > 0) {
                    let obj = {

                        fullName: val[0].fullName,
                        phone: val[0].phone,
                        hasInsurance: val[0].hasInsurance,
                        contractingCompany: val[0].contractingCompany,
                        insuranceCompany: val[0].insuranceCompany._id,
                        insuranceNumber: val[0].insuranceNumber,
                        addressId: val[0].addressId._id,
                        userId: val[0].userId._id,
                        status: { statusId: 1, name: 'active' },
                        isDeleted: false,
                        isActive: true,
                        createdAt: new Date(),
                        isPublished: true,
                        updatedAt: new Date(),

                    }
                    $orders.add(obj, (err, doc) => {

                    });
                }
                if (val.length == 0) {
                    let obj = {}
                    obj.statusCode = 406
                    obj.message = getTrans('noNotActiveOrders', req)
                    obj.returnStatus = false
                    res.json(obj)
                    return
                }
            }
            site.ordersAggregate(types, {
                isDeleted: false,
                _id: new ObjectID(orders_doc._id),
                userId: new ObjectID(orders_doc.userId),
                'status.statusId': (Enums.notActiveId)
            }, res, req, message)
        }







    });



    site.post("/api/orders/internetConnectivity", (req, res) => {
        let response = {}
        require('dns').resolve('www.google.com', function (err) {
            if (err) {
                response.message = getTrans('internetDisConnected', req)
                response.returnStatus = false
                response.statusCode = 406
                res.json(response);
            } else {
                response.message = getTrans('internetConnected', req)
                response.returnStatus = true
                response.statusCode = 200
                res.json(response);
            }
        });
    })



    site.put("/api/orders/:id", (req, res) => {
        let response = {}
        let orders_doc = req.body
        orders_doc.updatedAt = new Date(),
            $orders.edit({
                where: {
                    _id: new ObjectID(req.params.id)
                },
                set: orders_doc,
                $req: req,
                $res: res
            }, err => {

                if (!err) {
                    $orders.findOne({
                        where: {
                            _id: new ObjectID(req.params.id)
                        }
                    }, (err, doc) => {
                        if (!err) {

                            let types = {
                                type: 'single',
                                message: 'updated'
                            }
                            let message = getTrans('ordersUpdated', req)
                            site.ordersAggregate(types, { _id: doc._id }, res, req, message)


                        } else {
                            response.error = err.message
                        }

                    })

                } else {
                    response.error = 'Code Already Exist'
                }

            })


    })


    site.delete("/api/orders/:id", (req, res) => {
        let response = {}

        $orders.edit(
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
                    response.message = getTrans('orderDeleted', req),
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

    site.get("/api/orders", (req, res) => {
        let page = 1
        let offset = 0
        let response = {}

        let types = {
            type: 'array',
            message: ''
        }

        site.ordersAggregate(types, {}, res, req)


    })




    site.get("/api/orders/:id", (req, res) => {
        let response = {}

        $orders.findOne(
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
                let types = {
                    type: 'single',
                    message: 'find'
                }

                site.ordersAggregate(types, {}, res, req)
            },
        );

    })

    site.post("/api/orders/search", (req, res) => {

        let response = {}
        let where = req.body;


        let page = 1
        let offset = 0

        if (where['fullName']) {
            where['fullName'] = site.get_RegExp(where['fullName'], 'i');
        }
        if (where['phone']) {
            where['phone'] = String(where['phone']);
        }

        if (where['contractingCompany']) {
            where['contractingCompany'] = String(where['contractingCompany']);
        }
        if (where['insuranceCompany']) {
            where['insuranceCompany'] = String(where['insuranceCompany']);
        }
        if (where['insuranceNumber']) {
            where['insuranceNumber'] = String(where['insuranceNumber']);
        }
        if (where['addressId']) {
            where['addressId'] = String(where['addressId']);
        }
        if (where['userId']) {
            where['userId'] = String(where['userId']);
        }
        let types = {
            type: 'array',
            message: ''
        }

        site.ordersAggregate(types, where, res, req)

    })

}
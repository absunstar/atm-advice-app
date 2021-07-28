module.exports = function init(site) {
  const $booking = site.connectCollection('booking');
  const $doctors = site.connectCollection('doctors');
  const $notificationData = site.connectCollection('notificationData');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
    ,require : {permissions : []}
  });

  site.get({
    name: 'booking',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require : {permissions : []}
  });

  let ObjectID = require('mongodb').ObjectID

  // Add New booking With Not Duplicate Name Validation

  site.post('/api/booking/add', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };

    let booking_doc = req.body;
    booking_doc.$req = req;
    booking_doc.$res = res;


    booking_doc.isActive = true,
      booking_doc.status = site.var('active'),
      booking_doc.createdAt = new Date()
    booking_doc.updatedAt = new Date()

    $booking.add(booking_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        response.message = site.word('bookingCreated')[req.headers.language]
        response.done = true;
        let notificationObj = {
          title: site.word('bookingAdded')[req.headers.language],
          type: 'doctor',
          user: booking_doc.patient,
          doctor: booking_doc.doctor,
          createdAt: new Date(),
        }
        $notificationData.add(notificationObj);
      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });


  });



  // confirm Booking

  site.post('/api/booking/confirmBooking', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };


    let booking_doc = req.body;
    booking_doc.$req = req;
    booking_doc.$res = res;

    $booking.findOne({
      where: {
        _id: new ObjectID(booking_doc.bookingId)
      }
    }, (err, bookingDoc) => {
      $doctors.findOne({
        where: {
          "_id": new ObjectID(bookingDoc.doctor._id)
        }
      }, (err1, doctorsDoc) => {
        doctorsDoc.days.forEach(_d => {
          let date = new Date(_d.date)
          date.setHours(0, 0, 0, 0)
          let bodyDate = new Date(bookingDoc.date)
          bodyDate.setHours(0, 0, 0, 0)
          if (String(date) == String(bodyDate)) {
            _d.times.forEach(_t => {
              if (_t.status = 'available' && (_t.startSession) ==(bookingDoc.time) ) {
                _t.status = 'unAvailable'
              }
            });
          }
        });

        $doctors.update(doctorsDoc, (err, result) => {
          if (result.count > 0) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('appointmentConfirmed')[req.headers.language]
          } else {
            response.done = false,
              response.errorCode = site.var('failed')
            response.message = site.word('appointmentAlreadyConfirmed')[req.headers.language]
          }

          res.json(response)
        })
        $booking.edit({
          where: {
            _id: new ObjectID(booking_doc.bookingId)
          },
          set: {
            status: site.var('accepted')
          },
          $req: req,
          $res: res
        })

      })
    })
  });

  // Update booking 

  site.post('/api/booking/update/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let booking_doc = req.body
    booking_doc.updatedAt = new Date(),
      $booking.edit({
        where: {
          _id: (req.params.id)
        },
        set: booking_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $booking.findOne({
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

  // update Booking To Status Done
  site.post('/api/booking/updateToStatusDone', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    let booking_doc = req.body;


    $booking.edit({
      where: {
        'status': site.var('accepted'),
        _id: new ObjectID(booking_doc.bookingId),
        'doctor._id': booking_doc.doctor._id
      },
      set: {
        'status': site.var('done'),
      },
      $req: req,
      $res: res
    }, (err, result) => {


      response.done = true
      response.message = site.word('bookingDone')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    })
  });


  // update Booking To Status canceled
  site.post('/api/booking/updateToStatusCanceled', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    let booking_doc = req.body;


    $booking.edit({
      where: {
        'status': {
          $in: [site.var('active')]
        },
        _id: new ObjectID(booking_doc.bookingId),
        'doctor._id': booking_doc.doctor._id
      },
      set: {
        'status': site.var('canceled'),
      },
      $req: req,
      $res: res
    }, (err, result) => {
      if (result.count > 0) {
        $booking.findOne({
            where: {
              _id: new ObjectID(booking_doc.bookingId)
            },

          },
          (err, doc) => {
            if (!err && doc) {
              let notificationObj = {
                title: site.word('bookingCanceled')[req.headers.language],
                type: 'doctor',

                user: doc.patient,
                doctor: doc.doctor || null,
                createdAt: new Date(),
              }
              $notificationData.add(notificationObj);
            }

          },
        );
        response.done = true
        response.message = site.word('bookingCanceled')[req.headers.language],
          response.errorCode = site.var('succeed')

      } else {

        response.done = true
        response.message = site.word('bookingCanceled')[req.headers.language],
          response.errorCode = site.var('succeed')
      }
      res.json(response)
    })
  });


  // get All Booking Done For Today
  site.post('/api/booking/getAllDoneBookingToday', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    let booking_doc = req.body;
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    $booking.findMany({
      where: {
        'status': site.var('done'),
        'doctor._id': booking_doc.doctor._id,
        date: {
          $gte: start,
          $lt: end
        }
      },
      set: {
        'status': site.var('done'),
      },
      $req: req,
      $res: res
    }, (err, docs, count) => {
      if (docs && docs.length > 0) {
        response.done = true
        response.totalDocs = count

        response.message = site.word('findBooking')[req.headers.language],
          response.errorCode = site.var('succeed')
      }

      response.done = true
      response.message = site.word('bookingDone')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    })
  });



  // get All Booking Done For Today
  site.post('/api/booking/getAllDoneBookingToday', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    let booking_doc = req.body;
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    $booking.findMany({
      where: {
        'status': site.var('done'),
        'doctor._id': booking_doc.doctor._id,
        date: {
          $gte: start,
          $lt: end
        }
      },
      set: {
        'status': site.var('done'),
      },
      $req: req,
      $res: res
    }, (err, docs, count) => {
      if (docs && docs.length > 0) {
        response.done = true
        response.totalDocs = count

        response.message = site.word('findBooking')[req.headers.language],
          response.errorCode = site.var('succeed')
      }

      response.done = true
      response.message = site.word('bookingDone')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    })
  });


  // get All Booking For Today
  site.post('/api/booking/getAllBookingToday', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    let booking_doc = req.body;
    let start = new Date();
    start.setHours(0, 0, 0, 0);

    let end = new Date();
    end.setHours(23, 59, 59, 999);

    $booking.findMany({
      where: {
        'status': {
          $in: [site.var('done'), site.var('accepted'), ]
        },
        'doctor._id': booking_doc.doctor._id,
        date: {
          $gte: start,
          $lt: end
        }
      },
      set: {
        'status': site.var('done'),
      },
      $req: req,
      $res: res
    }, (err, docs, count) => {
      if (docs && docs.length > 0) {
        response.done = true
        response.totalDocs = count

        response.message = site.word('findBooking')[req.headers.language],
          response.errorCode = site.var('succeed')
      }

      response.done = true
      response.message = site.word('bookingDone')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    })
  });



  // get All Booking For date
  site.post('/api/booking/getAllBookingForDate', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}

    let booking_doc = req.body;
    let start = new Date(booking_doc.date);
    start.setHours(0, 0, 0, 0);

    let end = new Date(booking_doc.date);
    end.setHours(23, 59, 59, 999);

    $booking.findMany({
      where: {
        'status': {
          $in: [site.var('accepted'), ]
        },
        'doctor._id': booking_doc.doctor._id,
        date: {
          $gte: start,
          $lt: end
        }
      },

      $req: req,
      $res: res
    }, (err, docs, count) => {
      if (docs && docs.length > 0) {
        response.done = true
        response.totalDocs = count
        response.data = {
          docs: docs
        }
        response.message = site.word('findBooking')[req.headers.language],
          response.errorCode = site.var('succeed')
      }

      response.done = true
      response.message = site.word('bookingDone')[req.headers.language],
        response.errorCode = site.var('succeed')
      res.json(response)
    })
  });





  // get All packageses

  site.get("/api/booking", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $booking.findMany({
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

  // get booking By Id

  site.get("/api/booking/:id", (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    $booking.findOne({
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

  // Hard Delete booking
  site.post('/api/booking/delete/:id', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {
      done: false,
    };
    let id = req.params.id;

    if (id) {
      $booking.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('bookingDeleted')[req.headers.language]
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

  // Search packageses By Name 
  site.post('/api/booking/search', (req, res) => {
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
    $booking.findMany({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {
        if (docs.length > 0) {
          response.done = true
          response.docs = docs
          response.totalDocs = count
          response.limit = 10
          response.totalPages = Math.ceil(response.totalDocs / response.limit)
        } else {
          response.errorCode = site.var('failed')
          response.message = site.word('findFailed')[req.headers.language]
          response.done = false;
        }
        res.json(response);
      },
    );
  });
};
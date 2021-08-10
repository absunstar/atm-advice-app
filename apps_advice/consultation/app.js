module.exports = function init(site) {
  const $consultation = site.connectCollection('consultation');
  const $consultationDoctors = site.connectCollection('consultationDoctors');
  const $patients = site.connectCollection('patients');
  const $insuranceCompany = site.connectCollection('insuranceCompany');
  const $notificationData = site.connectCollection('notificationData');
  const $rating = site.connectCollection('rating');


  let ObjectID = require('mongodb').ObjectID
  const Agora = require('agora-access-token')

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
    require: {
      permissions: []
    }
  });

  site.get({
    name: 'consultation',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
    require: {
      permissions: []
    }
  });
  // Add New consultation With Not Duplicate Name Validation

  site.post('/api/consultation/add', (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let consultation_doc = req.body;
    consultation_doc.$req = req;
    consultation_doc.$res = res;
    consultation_doc.isActive = true,
      consultation_doc.isContinue = false,
      consultation_doc.consultationPeriod = null
    consultation_doc.startConsultation = null
    consultation_doc.time = 0,
      consultation_doc.status = {
        statusId: site.var('activeId'),
        name: site.var('active')
      },

      consultation_doc.createdAt = new Date()
    consultation_doc.updatedAt = new Date()
    $consultation.add(consultation_doc, (err, doc) => {
      if (!err) {
        response.data = doc;
        response.errorCode = site.var('succeed')
        response.message = site.word('consultationCreated')[req.headers.language]
        response.done = true;

      } else {
        response.errorCode = site.var('failed')
        response.message = site.word('errorHappened')[req.headers.language]
        response.done = false;
      }

      res.json(response);
    });


  });

  // Update consultation 

  site.post('/api/consultation/update/:id', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    let consultation_doc = req.body
    consultation_doc.updatedAt = new Date(),
      $consultation.edit({
        where: {
          _id: (req.params.id)
        },
        set: consultation_doc,
        $req: req,
        $res: res
      }, err => {

        if (!err) {
          $consultation.findOne({
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


    // Update consultation 

    site.post('/api/consultation/getCurrentPatientBalance', (req, res) => {
      let response = {}
      req.headers.language = req.headers.language || 'en'
      let consultation_doc = req.body
      $patients.findOne({
        where: {
          _id: consultation_doc.user._id
        }
      }, (err, doc) => {
        if (doc) {
          response.done = true,
            response.data = {
              docs : [{balance : doc.balance}]
            }
          response.errorCode = site.var('succeed')
          response.message = site.word('findSuccessfully')[req.headers.language]
          res.json(response)
        } else {
          response.done = false,
            response.errorCode = site.var('failed')
          response.message = site.word('failedUpdated')[req.headers.language]
          res.json(response)
        }

      })
    })


  // get All consultationes

  site.get("/api/consultation", (req, res) => {
    let limit = 10
    let skip
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }
    let response = {}
    $consultation.findMany({
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

  // RTC Token

  site.post("/api/consultation/rtctoken", (req, res) => {
    let response = {}
    let consultation_doc = req.body
   
    const appID = "210ed2de0c3e46fbb02596beb3699813";
    const appCertificate = "b0f362d6373e4d22955db3a608b6b2c1";
    const expirationTimeInSeconds = 3600;
    const uid = Math.floor(Math.random() * 100000);
    req.headers.language = req.headers.language || 'en'
    const role = consultation_doc.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;
    const channel = consultation_doc.user._id+new Date().getTime()+consultation_doc.doctor._id;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

    const token = Agora.RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channel, uid, role, expirationTimestamp);

    let obj = {
      done: true,
      errorCode: site.var('succeed'),
      data: {
        token: token,
        uid: uid,
        channel : channel
      },
      message: site.word('tokenAvailable')[req.headers.language]

    }
   
    $consultation.edit({
      where: {
       
        _id: req.body.consultationId
      },
      set: {
        token: obj.data.token,
        channel: obj.data.channel,
      },
    })
    res.json(obj)
   
  
  })


   // generate Access Token

   site.post("/api/consultation/generateAccessToken", (req, res) => {
    let consultation_doc = req.body
    const appID = "210ed2de0c3e46fbb02596beb3699813";
    const appCertificate = "b0f362d6373e4d22955db3a608b6b2c1";
    const channelName = consultation_doc.channelName || "testChannel";

    // get uid 
    let uid = Math.floor(Math.random() * 100000);

    // get role
    let role = consultation_doc.isPublisher ? Agora.RtcRole.PUBLISHER : Agora.RtcRole.SUBSCRIBER;

    // get the expire time
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
      expireTime = 3600;
    } else {
      expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    const token = Agora.RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, privilegeExpireTime);
    // return the token
    let obj = {
      done: true,
      errorCode: site.var('succeed'),
      data: {
        token: token,
        uid: uid
      },
      message: site.word('tokenAvailable')[req.headers.language]

    }
    res.json(obj)
  })



  //  // RTM Token

  //  site.post("/api/consultation/rtmtoken", (req, res) => {
  //   let response = {}
  //   let consultation_doc = req.body
  //   const appID = "210ed2de0c3e46fbb02596beb3699813";
  //   const appCertificate = "b0f362d6373e4d22955db3a608b6b2c1";
  //   const userName = consultation_doc.userName || "user1";
  //   const role = Agora.RtmRole.Rtm_User;

  //   const expirationTimeInSeconds = 3600;
  //   const currentTimestamp = Math.floor(Date.now() / 1000);
  //   const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

  //   const token = Agora.RtmTokenBuilder.buildToken(appID, appCertificate, userName, role, expirationTimestamp);
  //   let obj = {
  //     done: true,
  //     errorCode: site.var('succeed'),
  //     data: {
  //       token: token,

  //     },
  //     message: site.word('tokenAvailable')[req.headers.language]

  //   }
  //   res.json(obj)
  // })

  // get previous consultation
  site.post('/api/consultation/getPreviousConsultation', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findMany({
      where: {
        'status.statusId': site.var('finishedId'),
        'user._id': String(req.session.user.ref_info._id)
      },
    }, (err, docs, count) => {
      if (docs.length > 0) {

        response.data = {
          docs: docs,
          totalDocs: count,
          limit: 10,
          totalPages: Math.ceil(count / 10)
        }
        response.message = site.word('consultationFound')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)
      }
      if (docs.length == 0) {
        response.data = {
          docs: docs,
          totalDocs: count,
          limit: 10,
          totalPages: Math.ceil(count / 10)
        }

        response.errorCode = site.var('failed')
        response.message = site.word('noPreviousconsultation')[req.headers.language]
        response.done = false
        res.json(response)
        return
      }
    })
  });


  // get active consultation
  site.post('/api/consultation/getActiveConsultation', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findOne({
      where: {
        'status.statusId': site.var('activeId'),
        'user._id': String(req.session.user.ref_info._id)
      },
    }, (err, doc, count) => {
      if (doc) {
        response.data = {
          docs: [doc],
          totalDocs: 1,
          limit: 10,
          totalPages: 1
        }
        response.message = site.word('consultationFound')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)
      }
      if (!doc) {
        response.data = {
          docs: [],
        }
        response.errorCode = site.var('failed')
        response.message = site.word('noActiveconsultation')[req.headers.language]
        response.done = false
        res.json(response)
        return
      }
    })
  });


  // update attachments to consultation
  site.post('/api/consultation/updateAttachments', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let consultation_doc = req.body
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findOne({
      where: {
        'status.statusId': site.var('finishedId'),
        'user._id': String(req.session.user.ref_info._id),
        _id: consultation_doc.consultationId
      },
    }, (err, doc, count) => {
      console.log(doc);
      if (doc) {
        $consultation.edit({
          where: {
            'status.statusId': site.var('finishedId'),
            'user._id': String(req.session.user.ref_info._id),
            _id: consultation_doc.consultationId
          },
          set: {
            attachments: consultation_doc.attachments
          },
        })

        response.message = site.word('attachmentsSaved')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)
      }
      if (!doc) {
        let obj = {}
        obj.errorCode = site.var('failed')
        obj.message = site.word('attachmentsNotSaved')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })
  });



  site.post('/api/consultation/upload/image/consultation', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'

    site.createDir(site.dir + '/../../uploads/' + 'consultation', () => {
      site.createDir(site.dir + '/../../uploads/' + 'consultation' + '/images', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (file) {
          let newName = 'image_' + new Date().getTime().toString().replace('.', '_') + '.png';
          let newpath = site.dir + '/../../uploads/' + 'consultation' + '/images/' + newName;
          site.mv(file.path, newpath, function (err) {
            if (err) {
              response.error = err;
              response.done = !1;
            }
            response.image_url = '/api/image/' + 'consultation' + '/' + newName;
            res.json(response);
          });
        } else {
          response.error = 'no file';
          response.done = !1;
          res.json(response);
        }
      });
    });
  });

  site.post('/api/consultation/upload/file/consultation', (req, res) => {
    site.createDir(site.dir + '/../../uploads/' + 'consultation', () => {
      site.createDir(site.dir + '/../../uploads/' + 'consultation' + '/files', () => {
        let response = {
          done: !0,
        };
        let file = req.files.fileToUpload;
        if (!file) {
          response.done = !1;
          response.error = 'no file uploaded';
          res.json(response);
          return;
        }
        let newName = 'file_' + new Date().getTime() + '.' + site.path.extname(file.name);
        let newpath = site.dir + '/../../uploads/' + 'consultation' + '/files/' + newName;
        site.mv(file.path, newpath, function (err) {
          if (err) {
            response.error = err;
            response.done = !1;
          }
          // response.file = {};
          response.image_url = '/api/file/' + 'consultation' + '/' + newName;
          // response.file.name = file.name;
          res.json(response);
        });
      });
    });
  });


  // get accepted consultation
  site.post('/api/consultation/getAcceptedConsultation', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findOne({
      where: {
        'status.statusId': site.var('activeId'),
        'user._id': String(req.session.user.ref_info._id)
      },
    }, (err, doc, count) => {
      if (doc) {

        response.data = doc
        response.message = site.word('consultationFound')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)
      }
      if (!doc) {
        let obj = {}
        obj.errorCode = site.var('failed')
        obj.message = site.word('noAcceptedconsultation')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })
  });



  // get Doctors By Department
  site.post('/api/consultation/getDoctorsByDepartment', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    let consultation_doc = req.body
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultationDoctors.findMany({
      where: {
        'department._id': consultation_doc.departments._id,
        isAvailable: true
      },
    }, (err, docs, count) => {
      if (docs.length > 0) {

        response.data = {
          docs: docs,
          totalDocs: count,
          limit: 10,
          totalPages: Math.ceil(count / 10)
        }
        response.message = site.word('doctorsFound')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)
      }
      if (docs.length == 0) {
        let obj = {}
        obj.data = {docs:[]}
        obj.errorCode = site.var('failed')
        obj.message = site.word('noAcceptedconsultation')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })
  });


  // update to status Accepted
  site.post('/api/consultation/updateToStatusAccepted', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findOne({
      where: {
        'status.statusId': site.var('activeId'),
        '_id': req.body.consultationId
      },
    }, (err, doc, count) => {
      if (doc) {
        $consultation.edit({
          where: {
            'status.statusId': site.var('activeId'),
            "_id": req.body.consultationId,
          },
          set: {
            doctor: req.body.doctor,
            'status.statusId': site.var('acceptedId'),
            'status.name': site.var('accepted'),
            time: doc.period,
            startConsultation: new Date()
          },
        }, err => {
          if (!err) {
            $consultation.findOne({
              where: {
                '_id': req.body.consultationId
              },
            }, (err, doc2, count) => {
              if (doc2) {

                if (doc2 && doc2.status && doc2.status.statusId ==  site.var('acceptedId')) {
                  console.log(doc2);
                  if (req.body.patientType == 'hasInsurance') {
                   $insuranceCompany.findOne({
                      where: {
                        _id: doc2.user.insuranceCompany._id
                      }
                    }, (err, insuranceDoc) => {
                      $insuranceCompany.edit({
                        where: {
                          
                          "_id": doc2.user.insuranceCompany._id
                        },
                        set: {
                          balance : insuranceDoc.balance - doc2.period
                        },
                      })

                    })
                    
                  }

                  if (req.body.patientType == 'normalPatient') {
                    $patients.findOne({
                       where: {
                         _id: doc2.user._id
                       }
                     }, (err, patientsDoc) => {
                       $patients.edit({
                         where: {
                           "_id": patientsDoc._id
                         },
                         set: {
                           balance : patientsDoc.balance - doc2.price
                         },
                       })
 
                     })
                     
                   }

                }
              
                response.message = site.word('consultationUpdated')[req.headers.language]
                response.data = {
                  docs : [
                    {
                      date : doc2.startConsultation.toLocaleDateString("en"),
                      time : doc2.startConsultation.toLocaleTimeString("en")
                    }
                  ]
                }
                response.done = true,
                  response.errorCode = site.var('succeed')
                res.json(response)
                
              }
              if (!doc2) {
                let obj = {}
                obj.data = {docs : []}
                obj.errorCode = site.var('failed')
                obj.message = site.word('noAcceptedconsultation')[req.headers.language]
                obj.done = false
                res.json(obj)
                return
              }
            })
          }
        })
        
      }
      if (!doc) {
        let obj = {}
        obj.data = {docs : []}
        obj.errorCode = site.var('failed')
        obj.message = site.word('noAcceptedconsultation')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })


    $consultation.findOne({
      where: {
        '_id': req.body.consultationId
      },
    }, (err, doc, count) => {
      if (doc) {
      
        console.log(doc);
        
      }
      if (!doc) {
        let obj = {}
        obj.errorCode = site.var('failed')
        obj.message = site.word('noAcceptedconsultation')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })



  });





  site.post('/api/consultation/checkBeforeAccept', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $patients.findOne({
      where: {
        _id: req.body.user._id
      }
    }, (err, userDoc) => {
      if (req.body.patientType == 'hasInsurance') {
        if (userDoc.hasInsurance && userDoc.hasInsurance == true) {
         
          $insuranceCompany.findOne({
            where: {
              _id: userDoc.insuranceCompany._id
            }
          }, (err, insuranceDoc) => {
            let insuranceNumbersList = insuranceDoc.insuranceNumbers.map(li => li.number)
            if (insuranceNumbersList.includes(req.body.insuranceNumber) == true) {
              if (insuranceDoc.balance < 15) {
                response.errorCode = site.var('failed')
                response.message = site.word('insuranceCompanyRecharge')[req.headers.language]
                response.done = false
                res.json(response)
                return
              } else {
                response.errorCode = site.var('success')
                response.message = site.word('balanceEnough')[req.headers.language]
                response.done = true
                res.json(response)
                return
              }

            }

            if (insuranceNumbersList.includes(userDoc.insuranceNumber) == false) {
              response.errorCode = site.var('failed')
              response.message = site.word('insuranceNumberNotExist')[req.headers.language]
              response.done = false
              res.json(response)
              return
            }
          })
        }
      }
      else{
        response.errorCode = site.var('success')
        response.message = site.word('normalUser')[req.headers.language]
        response.done = true
        res.json(response)
        return
      }

    })
  });



  // increase consultation time
  site.post('/api/consultation/increaseConsultationTime', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    let consTime = 5
    $consultation.findOne({
      where: {
        'status.statusId': site.var('acceptedId'),
        'user._id': String(req.session.user.ref_info._id)
      },
    }, (err, doc, count) => {
      if (doc) {
        $patients.findOne({
          where: {
            '_id': String(req.session.user.ref_info._id)
          },
        }, (err1, doc1, count1) => {



          if (doc1.hasInsurance == true) {

            $insuranceCompany.findOne({
              where: {
                _id: (doc1.insuranceCompany._id)
              }
            }, (err, insuranceDoc) => {

              if (insuranceDoc.balance < consTime) {
                response.errorCode = site.var('failed')
                response.message = site.word('insuranceCompanyRecharge')[req.headers.language]
                response.done = false
                res.json(response)
                return
              } else {
                $insuranceCompany.edit({
                  where: {
                    "_id": insuranceDoc._id,
                  },
                  set: {
                    'balance': insuranceDoc.balance - consTime,
                  },
                })
              }
            })
          } else {
            $patients.edit({
              where: {
                "_id": doc1._id
              },
              set: {
                balance: doc1.balance - Number(pricePerMinute)
              },
            })

          }

          if (doc1 && doc1.balance > 0 && doc1.balance > doc.price) {
            let increasedTime = 5

            let pricePerMinute = (Number(doc.price) / Number(doc.period)).toFixed(2)
            $consultation.edit({
              where: {
                'status.statusId': site.var('acceptedId'),
                "user._id": String(req.session.user.ref_info._id),
              },
              set: {
                'time': (increasedTime + consTime),
                startConsultation: new Date()
              },
            })



            response.message = site.word('consultationTimeIncreased')[req.headers.language]
            response.done = true,
              response.errorCode = site.var('succeed')
            res.json(response)
          } else {
            response.message = site.word('balanceNotEnough')[req.headers.language]
            response.done = false,
              response.errorCode = site.var('failed')
            res.json(response)
          }

        })

      }
      if (!doc) {
        let obj = {}
        obj.errorCode = site.var('failed')
        obj.message = site.word('cantIncreaseTime')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })
  });



  // terminate Consultation Session
  site.post('/api/consultation/terminateConsultation', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findOne({
      where: {
        'status.statusId': site.var('acceptedId'),
        'user._id': String(req.session.user.ref_info._id)
      },
    }, (err, doc, count) => {
      if (doc) {
        let now = new Date()
        let end = new Date(doc['startConsultation']);
        let time = 5
        let diff = (now.getTime() - end.getTime()) / 1000;
        diff /= 60;
        let xDiff = Math.abs(Math.round(diff))

        $consultation.edit({
          where: {
            'status.statusId': site.var('acceptedId'),
            "user._id": String(req.session.user.ref_info._id),
          },
          set: {
            'status.statusId': site.var('finishedId'),
            'status.name': site.var('finished'),
            time: 0,
            consultationPeriod: xDiff
          },
        })
        response.message = site.word('consultationTerminated')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)


        $patients.findOne({
          where: {
            _id: (doc.user._id)
          }
        }, (err, userDoc) => {
          console.log("userDoc", userDoc);
          if (userDoc.hasInsurance == true) {

            $insuranceCompany.edit({
              where: {
                "_id": userDoc.insuranceCompany._id,
              },
              set: {
                'balance': userDoc.balance - doc.consultationPeriod,
              },
            })

          } else {
            $patients.edit({
              where: {
                "_id": userDoc._id,
              },
              set: {
                'balance': userDoc.balance - doc.price,
              },
            })
            console.log("have no insurance company");
          }
        })
      }
      if (!doc) {
        let obj = {}
        obj.errorCode = site.var('failed')
        obj.message = site.word('noAcceptedconsultation')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })
  });



  // rate consultation
  site.post('/api/consultation/rateConsultation', (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    let consultation_doc = req.body
    if (!req.session.user) {
      response.errorCode = site.var('failed')
      response.message = site.word('loginFirst')[req.headers.language]
      response.done = false;
      res.json(response);
      return;
    }
    $consultation.findOne({
      where: {
        _id : req.body.consultationId,
        'status.statusId': site.var('finishedId'),
        'user._id': String(req.session.user.ref_info._id)
      },
    }, (err, doc, count) => {
      if (doc) {
        Number.prototype.between = function (a, b) {
          var min = Math.min.apply(Math, [a, b]),
            max = Math.max.apply(Math, [a, b]);
          return this > min && this < max;
        };

        let valDiscount
        if (!consultation_doc.rate.value.between(1, 5.1)) {
          valDiscount = {
            message: site.word('valueInCorrect')[req.headers.language],
            done: false,
            "errorCode": site.var('failed')
          }
          return res.json(valDiscount)
        }

        $consultation.edit({
          where: {
            _id : req.body.consultationId,
            'status.statusId': site.var('finishedId'),
            "user._id": String(req.session.user.ref_info._id),
          },
          set: {
            'rate.value': consultation_doc.rate.value,
            'rate.comment': consultation_doc.rate.comment
          },
        })

        let createdObj = {
          user: doc.user,
          date : new Date().toISOString().split('T')[0],
          target: doc.doctor,
          rating: consultation_doc.rate.value,
          type: "consultation",
          description: consultation_doc.rate.comment,
        }
        $rating.add(createdObj)

        response.message = site.word('rateUpdated')[req.headers.language]
        response.done = true,
          response.errorCode = site.var('succeed')
        res.json(response)
      }
      if (!doc) {
        let obj = {}
        obj.errorCode = site.var('failed')
        obj.message = site.word('noAcceptedconsultation')[req.headers.language]
        obj.done = false
        res.json(obj)
        return
      }
    })
  });



    // send Notification To Doctor
    site.post('/api/consultation/sendNotificationToDoctor', (req, res) => {
      let response = {}
      req.headers.language = req.headers.language || 'en'
      let consultation_doc = req.body
      if (!req.session.user) {
        response.errorCode = site.var('failed')
        response.message = site.word('loginFirst')[req.headers.language]
        response.done = false;
        res.json(response);
        return;
      }


      $consultation.findOne({
        where: {
          _id : req.body.consultationId,
          'status.statusId': site.var('finishedId'),
          'user._id': String(req.session.user.ref_info._id)
        },
      }, (err, doc, count) => {
        if (doc) {
        console.log(doc);
          let notificationObj = {
            title:  doc.user.fullName + ': ' + site.word('thisPatientSendNotificationToSendHimDiagnosisFile')[req.headers.language],
            doctor:doc.doctor,
            type: "consultation",
            user: doc.user,
            createdAt: new Date().toLocaleString('en-US'),
          }
          $notificationData.add(notificationObj);
          let obj = {}
          obj.errorCode = site.var('succeed')
          obj.message = site.word('notificationSent')[req.headers.language]
          obj.done = true
          res.json(obj)
          return
        }
        if (!doc) {
          let obj = {}
          obj.errorCode = site.var('failed')
          obj.message = site.word('noConsultation')[req.headers.language]
          obj.done = false
          res.json(obj)
          return
        }
      })



     




    
    });



  // get consultation By Id

  site.get("/api/consultation/:id", (req, res) => {
    let response = {}
    req.headers.language = req.headers.language || 'en'
    $consultation.findOne({
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

  // Hard Delete consultation
  site.post('/api/consultation/delete/:id', (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    let id = req.params.id;

    if (id) {
      $consultation.delete({
          _id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true,
              response.errorCode = site.var('succeed')
            response.message = site.word('consultationDeleted')[req.headers.language]
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

  // Search consultationes By Name 
  site.post('/api/consultation/search', (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    let where = req.body || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }
    let limit
    let skip
    if (!req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) == 1)) {
      limit = 10
    }
    if (req.query.page || (parseInt(req.query.page) && parseInt(req.query.page) > 1)) {
      skip = (parseInt(req.query.page) - 1) * 10
    }

    $consultation.findMany({
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
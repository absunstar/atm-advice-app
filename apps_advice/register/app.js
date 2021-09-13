module.exports = function init(site) {
  const $register = site.connectCollection("register")
 
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "register",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })
 
  site.post("/api/register/add", (req, res) => {

    let response = {
      done: false
    }

    let register_doc = req.body
    register_doc.$req = req
    register_doc.$res = res

    register_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    let user = {}

   if (register_doc.patient_name) {
      user = {
        name: register_doc.patient_name,
        mobile: register_doc.patient_mobile,
        username: register_doc.patient_user_name,
        email: register_doc.patient_user_name,
        password: register_doc.patient_password,
        image_url: register_doc.image_url,
        role: 'patients_admin',
        type: 'patient'
      }
    } else if (register_doc.pharmacy_name) {
      user = {
        name: register_doc.pharmacy_name,
        mobile: register_doc.pharmacy_mobile,
        username: register_doc.pharmacy_user_name,
        email: register_doc.pharmacy_user_name,
        password: register_doc.pharmacy_password,
        image_url: register_doc.image_url,
        role: 'pharmacies_admin',
        type: 'pharmacy'
      }
    } else if (register_doc.doctor_name) {
      user = {
        name: register_doc.doctor_name,
        mobile: register_doc.doctor_mobile,
        username: register_doc.doctor_user_name,
        email: register_doc.doctor_user_name,
        password: register_doc.doctor_password,
        image_url: register_doc.image_url,
        role: 'doctors_admin',
        type: 'doctor'
      }
    } 

    user.roles = [{
      name: user.role
    }]

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url
    }

    site.security.addUser( user, (err, doc) => {
      if (!err) {

        delete user._id
        delete user.id
        user.user_info = {
          id: doc.id
        }

        site.call('[register][' + user.type + '][add]', Object.assign( user , register_doc ), (err, new_user) => {

          if (!err) {
            doc.ref_info = {
              id: new_user.id
            }

            site.security.updateUser(doc, () => {

              site.security.login({
                email: new_user.email,
                password: new_user.password,
                $req: req,
                $res: res
              },
                function (err, user_login) {
                  if (!err) {
                    response.user = user_login
                    response.done = true
                  } else {
                    response.error = err.message
                  }

                  res.json(response)
                }
              )
            })

          } else {
            response.error = err.message
            res.json(response)
          }
        })
      } else {
        response.error = err.message
        res.json(response)
      }
    })

  })

  site.post("/api/register/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let register_doc = req.body

    register_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (register_doc.id) {
      $register.edit({
        where: {
          id: register_doc.id
        },
        set: register_doc,
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

  site.post("/api/register/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $register.findOne({
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

  site.post("/api/register/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    if (where['customer_service']) {
      where['customer_service'] = new RegExp(where['customer_service'], "i");
    }

    if (where['online_chat']) {
      where['online_chat'] = new RegExp(where['online_chat'], "i");
    }



    $register.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/register/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    if (id) {
      $register.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

}
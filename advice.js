const site = require('isite')({
  port: 9090,
  lang: 'ar',
  version: '1.0.7',
  name: 'advice',
  theme: 'theme_dark',
  mongodb: {
    db: 'advice',
    limit: 100000,
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c' , '9705a3a85c1b21118532fefcee840f99'],
  },
  requires:{
    permissions : ['login']
  }
});


// site.get({
//   name: '/',
//   path: site.dir + '/',
// });

// site.get({
//   name: '/',
//   path: site.dir + '/html/index.html',
//   parser: 'html css js',
// });

site.get({
  name : '/',
  path : __dirname + '/site_files'
})
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.loadLocalApp('client-side');
site.importApps(__dirname + '/apps_advice');
site.importApps(__dirname + '/apps_private');
// site.importApps(__dirname + '/common');
site.run();


// site.on('zk attend', attend=>{
//     console.log(attend)
// })

// let x= site.to123('xxxxxxxxxxxxxxxxxx')
// console.log(x)
// console.log(site.from123(x))
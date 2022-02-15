const site = require('isite')({
    port: [80, 9090],
    lang: 'ar',
    version: '1.0.0',
    name: 'advice',
    theme: 'theme_paper',
    mongodb: {
        db: 'advice',
        limit: 100000,
    },
    security: {
        keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99'],
    },
    requires: {
        permissions: [],
    },
});

site.get({
    name: '/',
    path: site.dir + '/',
    require: {
        permissions: [],
    },
});

site.get({
    name: '/',
    path: site.dir + '/html/home.html',
    parser: 'html css js',
    require: {
        permissions: [],
    },
});

site.get({
    name: 'about-us',
    path: site.dir + '/html/about-us.html',
    parser: 'html css js',
    require: {
        permissions: [],
    },
});
site.get({
    name: '/',
    path: __dirname + '/site_files',
});
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.loadLocalApp('client-side');
site.importApps(__dirname + '/apps_advice');
site.importApps(__dirname + '/apps_private');
// site.importApps(__dirname + '/common');
const $degree = site.connectCollection('degree');
obj = [
    { name_ar: 'استشاري', name_en: 'advisor' },
    { name_ar: 'أستاذ', name_en: 'professor' },
    { name_ar: 'مدرس', name_en: 'master' },
    { name_ar: 'أخصائي', name_en: 'specialist' },
];
for (const iterator of obj) {
    $degree.find({}, (err, doc) => {
        if (!err && doc) {
            return false;
        } else {
            $degree.add(iterator);
        }
    });
}

site.run();



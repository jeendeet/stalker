const defaultRouter = require('./defaultRouters');

function route(app) {
    app.use('/', defaultRouter);
    app.use((req, res, next) => {
        res.render('default/404', { title: '404 Error', path: 'index'});
    });
}

module.exports  = route;

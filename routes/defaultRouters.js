const express = require('express');
const router = express.Router();
const defaultController = require('../controllers/defaultController');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'default';
    next();
})


router.get('/', defaultController.index);
router.post('/config', defaultController.config);
router.post('/stalker', defaultController.stalker);
router.get('/index.html', defaultController.index);


module.exports = router;


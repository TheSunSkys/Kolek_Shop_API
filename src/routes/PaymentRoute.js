const router = require('express').Router();
const img = require('../lib/ImageUpload');
const auth = require('../lib/Auth');
const payment = require('../services/payment');

router.get('/', (req, res, next)=>{res.json('PAYMENT ROUTER')});
router.get('/lists',auth.userVerifyToken ,payment.getPay);

router.post('/add',img.upload, payment.payment);
router.post('/order', payment.getOrderPayment);
module.exports = router;
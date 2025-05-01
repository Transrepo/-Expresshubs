

const express = require('express');

const router = express.Router();

const adminController = require('../controllers/adminController');

//************************************* */  Admin Dashboard  routes**********************//

router.get('/adminRoutes', adminController.homepage);
router.get('/add', adminController.addCustomer);
router.post('/add', adminController.postCustomer);
router.get('/view/:id', adminController.view);
router.get('/edit/:id', adminController.edit);
router.put('/edit/:id', adminController.editPost);
router.delete('/edit/:id',adminController.deleteCustomer );

router.post('/search',adminController.searchCustomers);


module.exports = router;

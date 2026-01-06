const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.post('/', userController.createUser.bind(userController));
router.get('/students', userController.getActiveStudents.bind(userController));
router.post('/students/:studentId/kick', userController.kickOutStudent.bind(userController));

module.exports = router;



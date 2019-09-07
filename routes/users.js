
var express = require('express');
var router = express.Router();

const Student=require('../model/studentDetails');
const Book=require('../model/booksDetails') 

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

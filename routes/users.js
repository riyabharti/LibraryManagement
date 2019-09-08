const jwt=require('jsonwebtoken');
const md5=require('md5');
const secret='ANY_SECRET_KEY';
var decodedToken;

const Student=require('../model/studentDetails');
const Book=require('../model/booksDetails')
var express = require('express');
var router = express.Router();
 

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Verify Token
function verifyToken(req,res,next){
  try {
    var token = (req.headers['authorization']).split(" ")[1];
    var data = jwt.verify(token,secret,{expiresIn: "1800000"});
    decodedToken=jwt.decode(token);
  	next();
  } catch(err) {
      console.log(err);
      res.status(401).json({
        'success' : false,
        'data' : err
      })
  }
}
//Register User
router.post('/reg',function(req,res){
  var user={
    'regid':req.body.regid,
    'name':req.body.name,
    'password':md5(req.body.regid),
  }
  console.log("ABCDXCDSCDC");
  
  var data = new Student(user);

  data.save().then(item=>
    {
      console.log(item);
      res.status(200).json({
        'success': true,
        'data': item
      });
    }).catch(err=>{
      console.log(error);
      res.status(200).json({
        'success' : false,
        'data' : err
      })
    })
})


module.exports = router;

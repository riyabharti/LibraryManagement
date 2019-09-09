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
  Student.find({'branch':req.body.branch}).then(stud=>{
    var len=stud.length;
    var code=req.body.branch+'/'+(len+1);
    console.log(code)
    var user={
      'regid':req.body.regid,
      'libid':code,
      'name':req.body.name,
      'password':md5(req.body.regid),
      'branch':req.body.branch
    }
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
  }).catch(err=>{
    console.log(error);
    res.status(200).json({
      'success' : false,
      'data' : err
    })
  })
  
  
  
})

//Login
router.post('/login',function(req,res){
  Student.findOne({'regid':req.body.regid}).then(item=>{
    if (item==null) {
      res.status(200).json({
        'success':false,
        'msg' : "User not found"
      })
    }
    else{
      if (item.password===md5(req.body.password)) {
        var newItem=JSON.stringify(item)
        console.log(newItem);
        var token = jwt.sign(item.toJSON(),secret,{expiresIn: "1800000"});
        console.log(token);
        console.log(req.header);
        console.log(req.headers);
        res.status(200).json({
          'success':true,
          'msg' : item,
          'token':token
        })
      }
      else{
        res.status(200).json({
          'success':false,
          'msg' : "Password did not match!"
        })
      }
    }
  }).catch(err=>{
    res.status(200).json({
      'success':false,
      'msg' : err
    })
  })
})

//Add Book Data
router.post('/addBook',verifyToken,function(req,res){
  Book.findOne({'isbn':req.body.isbn}).then(bookItem=>{
    if(bookItem==null){
      var book={
        'name':req.body.name,
        'author':req.body.author,
        'isbn':req.body.isbn,
        'total':req.body.total
      }
      var data=new Book(book);
      data.save().then(item=>{
        res.status(200).json({
          'success': true,
          'data': item,
          'msg':"Book added in library."
        });
      }).catch(err=>{
        res.status(200).json({
          'success': false,
          'data': err,
          'msg':"Error in api from new Book creation"
        });
      })
    }
    else{
      bookItem.total+=parseInt(req.body.total,10);
      bookItem.save().then(item=>{
        res.status(200).json({
          'success':true,
          'data':item,
          'msg' : "Book updated"
        })
      }).catch(err=>{
        res.status(200).json({
          'success': false,
          'data':err,
          'msg': "Error in api while updating book"
        });
      })
    }
  })
})

//Issue Book
router.post('/issue',verifyToken,function(req,res){
  Book.findOne({'name':req.body.name}).then(item=>{
    if(item==null)
    {
      res.status(200).json({
        'success':false,
        'msg':"This book is not issued in this library"
      })
    }
    else{
      if(item.total-item.issued==0)
      {
        res.status(200).json({
          'success':false,
          'msg':"This book is currently not available!!"
        })
      }
      else
      {
        item.issued++;
        item.save().then(data=>{
          res.status(200).json({
            'success':true,
            'data':data
          })
        }).catch(err=>{
          res.status(200).json({
            'success':false,
            'data':err,
            'msg':"Error occured while searching!!"
          })
        })
      }
    }
  }).catch(err=>{
    res.status(200).json({
      'success':false,
      'data':err,
      'msg':"Error occured while issuing!!"
    })
  })
})

//Return Book i.e decreased issued no
router.post('/decreaseIssued',verifyToken,function(req,res){
  Book.findOne({'name':req.body.name}).then(item=>{
    if(item==null)
    {
      res.status(200).json({
        'success':false,
        'msg':"This book is not of this library"
      })
    }
    else{
      item.issued--;
      item.save().then(data=>{
        res.status(200).json({
          'success':true,
          'data':data
        })
      }).catch(err=>{
        res.status(200).json({
          'success':false,
          'data':err,
          'msg':"Error occured while saving after decreasing!!"
        })
      })
    }
  }).catch(err=>{
    res.status(200).json({
      'success':false,
      'data':err,
      'msg':"Error occured while searching to return!!"
    })
  })
})

//Update Book in Student
router.post('/updateBook',verifyToken,function(req,res){
  Student.findById(decodedToken._id).then(user=>{
    if(user==null){
      res.status(200).json({
        'success': false,
        'msg': "Wrong User Details"
      });
    }
    else{
      if(user.book.length>=5)
      {
        res.status(200).json({
          'success': false,
          'msg': "Issued book reached the limit!!"
        });
      }
      else if(user.book.includes(req.body.name)){
        res.status(200).json({
          'success': false,
          'msg': "You cannot issue 2 same books!!"
        });
      }
      else
      {
        user.book.push(req.body.name);
        user.save().then(item=>{
          res.status(200).json({
            'success':true,
            'msg' : item
          })
        }).catch(err=>{
          res.status(200).json({
            'success': false,
            'msg': err+"2nd"
          });
        })
      }
    }
  }).catch(err=>{
    console.log(err);
    res.status(200).json({
      'success': false,
      'msg': err+"3rd"
    });
  })
})

//Details
router.get('/detail',verifyToken,function(req,res){
  Student.findOne({'libid':decodedToken.libid}).then(item=>{
    if(item==null)
    {
      res.status(200).json({
        'success': false,
        'msg': "Wrong User Details"
      });
    }
    else{
      res.status(200).json({
        'success': true,
        'data': item
      });
    }
  }).catch(err=>{
    console.log(err);
    res.status(200).json({
      'success': false,
      'msg': err+"Error in finding!"
    });
  })
})

//Return and Update for student
router.post('/returnBook',verifyToken,function(req,res){
  Student.findOne({'libid':decodedToken.libid}).then(item=>{
    if(item==null)
    {
      res.status(200).json({
        'success': false,
        'msg': "Wrong User Details"
      });
    }
    else
    {
      var bn=item.book.indexOf(req.body.name)
      console.log(req.body.name)
      if(bn>-1){
        item.book.splice(bn,1);
        item.save().then(item=>{
          res.status(200).json({
            'success':true,
            'msg' : item
          })
        }).catch(err=>{
          res.status(200).json({
            'success': false,
            'msg': err+"Error after removing returned book!!"
          });
        })
      }
      else{
        res.status(200).json({
          'success': false,
          'msg': "Wrong Book Details"
        });
      }
    }
  }).catch(err=>{
    res.status(200).json({
      'success': false,
      'msg': err+"Error while finding student!!"
    });
  })
})

//Get Book
router.get('/getBook',verifyToken,function(req,res){
  Book.find().then(item=>{
    res.status(200).json({
      'success' : true,
      'data' : item,
      'libId': decodedToken.libid
    })
  }).catch(err=>{
    res.status(200).json({
      'success' : false,
      'data' : err,
      'msg':"Error while loading Books"
    })
  })
})

module.exports = router;

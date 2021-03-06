const jwt=require('jsonwebtoken');
const md5=require('md5');
const multer=require('multer');
const path = require('path');
var decodedToken;

const Student=require('../model/studentDetails');
const Book=require('../model/booksDetails')
const StuBook=require('../model/studentbook')
var express = require('express');
var fs = require('fs');

var router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './profile_photos');
  },
  filename: (req, file, cb) => {
      newFile=file.originalname.split('.');
      cb(null, Date.now() + '.' + newFile[newFile.length-1]);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg' || file.mimetype == 'image/png')
      cb(null, false);
  else
      cb(null, true)
}

// var upload = multer({ dest: 'uploads/' },fileFilter);

const upload = multer({ storage, limits: { fileSize: 1024 * 1024 } }, fileFilter).single('photo');
 

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//Verify Token
function verifyToken(req,res,next){
  try {
    var token = (req.headers['authorization']).split(" ")[1];
    var data = jwt.verify(token,process.env.secretKey,{expiresIn: "1800000"});
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
        res.status(200).json({
          'success': true,
          'data': item
        });
      }).catch(err=>{
        res.status(200).json({
          'success' : false,
          'data' : "Registration id already exists"
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
        var token = jwt.sign(item.toJSON(),process.env.secretKey,{expiresIn: "1800000"});
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

//Change Password
router.post('/changePass',verifyToken,function(req,res){
  Student.findById(decodedToken._id).then(user=>{
    if(user==null){
      res.status(200).json({
        'success': false,
        'msg': "Wrong User Details"
      });
    }
    else
    {
      if(user.password===md5(req.body.currentpassword))
      {
        user.password=md5(req.body.newpassword);
        user.save().then(data=>{
          res.status(200).json({
            'success':true,
            'data':data
          })
        }).catch(err=>{
          res.status(200).json({
            'success':false,
            'data':err,
            'msg':"Error occured while saving new password!!"
          })
        })
      }
      else
      {
        res.status(200).json({
          'success': false,
          'msg': "Entered Password is incorrect"
        });
      }
    }
  }).catch(err=>{
    res.status(200).json({
      'success':false,
      'data':err,
      'msg':"Error occured while searching user!!"
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
        'total':req.body.total,
        'branch':req.body.branch
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


//Get Book
router.get('/getBook',verifyToken,function(req,res){
  Book.find({'branch':decodedToken.branch}).sort({isbn:1}).then(item=>{
    res.status(200).json({
      'success' : true,
      'data' : item,
      'libid': decodedToken.libid,
      'name':decodedToken.name,
    })
  }).catch(err=>{
    res.status(200).json({
      'success' : false,
      'data' : err,
      'msg':"Error while loading Books"
    })
  })
})

//issue change in Common table
router.post('/stubookIssue',verifyToken,function(req,res){
  var date=Date.now();
  var sbCommon={
    'isbn':req.body.isbn,
    'libid':decodedToken.libid,
    'issueDate':date 
  }
  // console.log(sbCommon);
  var data = new StuBook(sbCommon);
  data.save().then(item=>{
    res.status(200).json({
      'success': true,
      'data': item
    });
  }).catch(err=>{
    res.status(200).json({
      'success': false,
      'data': err,
      'msg':"Error in Api"
    });
  })
  
})

//Return in Common table
router.post('/stubookReturn',verifyToken,function(req,res){
  StuBook.findOneAndDelete({'isbn':req.body.isbn,'libid':decodedToken.libid}).then(item=>{
    if(item==null)
    {
      res.status(200).json({
        'success': false,
        'data': 'Wrong Details!!'
      });
    }
    else
    {
      res.status(200).json({
        'success': true,
        'data': item
      });
    }
  }).catch(err=>{
    res.status(200).json({
      'success': false,
      'data': err,
      'msg':"Error in API Return"
    });
  })
})

//Find no of issued books of user
router.get('/stubookFind',verifyToken,function(req,res){
  StuBook.find({'libid':decodedToken.libid}).sort({isbn:1}).then(item=>{
    res.status(200).json({
      'success': true,
      'data': item
    });
  }).catch(err=>{
    res.status(200).json({
      'success': false,
      'data': err,
      'msg':"Error in DB call"
    });
  })
}) 

//Upload profile picture
router.post('/uploadProfile',verifyToken,function(req,res){
  upload(req, res, err => {  
    if (err)
      {
        console.log(err)
        res.status(501).json({ 
          'success': false,
          'msg': err 
        });
      }
    else
    {
      Student.findById(decodedToken._id).then(item=>{
        if(item.profilePath!='')
        {
          fs.unlinkSync(path.join(__dirname,'..','profile_photos',item.profilePath));
          // console.log("Unlinking!!")
        }
        item.profilePath=req.file.filename;
        console.log(item.profilePath);
        item.save().then(data=>{
          console.log("Updated Profile successfully!");
          res.status(200).json({
            'success':true,
            'msg':"Updated profile successfully!",
            'data':data
          })
        }).catch(err=>{
          res.status(200).json({
            'success':false,
            'msg':"Updated profile error",
            'data':err
          })
        })
      })
      // fs.unlinkSync(path.join(__dirname,'..','profile_photos',item.photoUrl));
      //path.resolve
      
    }
  })
});



module.exports = router;


//Update Book in Student
// router.post('/updateBook',verifyToken,function(req,res){
//   Student.findById(decodedToken._id).then(user=>{
//     if(user==null){
//       res.status(200).json({
//         'success': false,
//         'msg': "Wrong User Details"
//       });
//     }
//     else{
//       if(user.book.length>=5)
//       {
//         res.status(200).json({
//           'success': false,
//           'msg': "Issued book reached the limit!!"
//         });
//       }
//       else if(user.book.includes(req.body.name)){
//         res.status(200).json({
//           'success': false,
//           'msg': "You cannot issue 2 same books!!"
//         });
//       }
//       else
//       {
//         user.book.push(req.body.name);
//         user.save().then(item=>{
//           res.status(200).json({
//             'success':true,
//             'msg' : item
//           })
//         }).catch(err=>{
//           res.status(200).json({
//             'success': false,
//             'msg': err+"2nd"
//           });
//         })
//       }
//     }
//   }).catch(err=>{
//     console.log(err);
//     res.status(200).json({
//       'success': false,
//       'msg': err+"3rd"
//     });
//   })
// })

//Details of a student NOT REQUIRED
// router.get('/detail',verifyToken,function(req,res){
//   Student.findOne({'libid':decodedToken.libid}).then(item=>{
//     if(item==null)
//     {
//       res.status(200).json({
//         'success': false,
//         'msg': "Wrong User Details"
//       });
//     }
//     else{
//       res.status(200).json({
//         'success': true,
//         'data': item
//       });
//     }
//   }).catch(err=>{
//     console.log(err);
//     res.status(200).json({
//       'success': false,
//       'msg': err+"Error in finding!"
//     });
//   })
// })

//Return and Update for student
// router.post('/returnBook',verifyToken,function(req,res){
//   Student.findOne({'libid':decodedToken.libid}).then(item=>{
//     if(item==null)
//     {
//       res.status(200).json({
//         'success': false,
//         'msg': "Wrong User Details"
//       });
//     }
//     else
//     {
//       var bn=item.book.indexOf(req.body.name)
//       console.log(req.body.name)
//       if(bn>-1){
//         item.book.splice(bn,1);
//         item.save().then(item=>{
//           res.status(200).json({
//             'success':true,
//             'msg' : item
//           })
//         }).catch(err=>{
//           res.status(200).json({
//             'success': false,
//             'msg': err+"Error after removing returned book!!"
//           });
//         })
//       }
//       else{
//         res.status(200).json({
//           'success': false,
//           'msg': "Wrong Book Details"
//         });
//       }
//     }
//   }).catch(err=>{
//     res.status(200).json({
//       'success': false,
//       'msg': err+"Error while finding student!!"
//     });
//   })
// })

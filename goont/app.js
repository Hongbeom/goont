var express = require('express');
var app = express();
var multer = require('multer');
var session = require('express-session');
var bodyParser = require('body-parser');
var MySQLStore = require('express-mysql-session')(session);
var bkfd2Password = require("pbkdf2-password");
var LocalStrategy = require('passport-local').Strategy;
var hasher = bkfd2Password();
var passport = require('passport');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/Users/samsung/goont/public/images/uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
var upload = multer({ storage: storage })
var bodyParser = require('body-parser');
var fs = require('fs');
var mysql = require('mysql');
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'ghdghd3295',
  database : 'o2'
});
conn.connect();
app.use(bodyParser.urlencoded({ extended: false}));
app.use(express.static('public'));
app.use(session({
  secret: 'RANDOM=###@$!',
  resave: false,
  saveUninitialized: true,
  store:new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'ghdghd3295',
    database: 'o2'
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', './views');
app.set('view engine', 'pug');
app.locals.pretty = true;

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}
function getTimeStamp() {
  var d = new Date();

  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}



//처음 홈페이지
app.get('/', function(req, res){
   if(req.user && req.user.nickName){
    var sql = 'SELECT * FROM timeline ORDER BY likey DESC;';
    conn.query(sql, function(err, results){
      if(err){
        console.log(err);
        res.status(500).send('Internal Sever Error');
      }
      else{
        res.render('mainpage', {nickName:req.user.nickName, timelines:results});
      }
    })
    
  }
  else{
    var sql = 'SELECT * FROM timeline ORDER BY likey DESC;';
    conn.query(sql, function(err, results){
      if(err){
        console.log(err);
        res.status(500).send('Internal Sever Error');
      }
      else{
        res.render('mainpage', {timelines:results});
      }
    })
  }
});
//커뮤니티
app.get('/Community', function(req, res){
  if(req.user && req.user.nickName){
    res.render('Community', {nickName:req.user.nickName});
  }
  else{
    res.render('Community');
  }
})

//타임라인
app.get('/Timeline', function(req, res){
  if(req.user && req.user.nickName){
    var sql = "SELECT * FROM timeline ORDER BY id DESC;";
  conn.query(sql, function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }else{
      var sql = "SELECT * FROM timelinecomment";
      conn.query(sql, function(err, comments, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Sever Error');
        }
        else{
          req.session.save(function(){
          res.render('Timeline', {nickName:req.user.nickName, timelines:rows, comments:comments});
          })
        }
      })
          
        
    }
  })
    
  }
  else{
    var sql = "SELECT * FROM timeline ORDER BY id DESC;";
    conn.query(sql, function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }else{
      var sql = "SELECT * FROM timelinecomment";
      conn.query(sql, function(err, comments, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Sever Error');
        }
        else{
          req.session.save(function(){
          res.render('Timeline', {timelines:rows, comments:comments});
          })
        }
      })
    }
  });
  }
})

//타임라인 DELETE
app.get('/Timelinedelete/:id', function(req, res){
  var sql="DELETE FROM timeline WHERE id=?";
  conn.query(sql, [req.params.id], function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    else{
      var sql = "DELETE FROM timelinecomment WHERE timelineid=?";{
        conn.query(sql, [req.params.id], function(err, rows, fields){
          if(err){
            console.log(err);
            res.status(500).send('Internal Server Error')
          }
          else{
            res.redirect('/Timeline');
          }
        })
      }
    }
  })
})

//타임라인코멘트 delete
app.get('/Timelinecommentdelete/:id', function(req, res){
  var sql = "DELETE FROM timelinecomment WHERE id=?";
  conn.query(sql, [req.params.id], function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
    else{
      res.redirect('/Timeline');
    }
  })
})

//likey
app.get('/timelinelikey/:id', function(req, res){
  var timelineid = req.params.id;
  var sql = "SELECT * FROM timeline WHERE id=?";
  conn.query(sql, [timelineid], function(err, results, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }else{
     var sql = "UPDATE timeline SET likey=? WHERE id=?";
      var newlikey = results[0].likey+1;
      conn.query(sql, [newlikey, timelineid], function(err, rows, fields){
        if(err){
          console.log(err);
        res.status(500).send('Internal Sever Error');
        }
        else{
          res.redirect('/Timeline');
        }
      })  
    }
  })
  
})
//Tips
app.get('/Tips', function(req, res){
  if(req.user && req.user.nickName){
    res.render('Tips', {nickName:req.user.nickName});
  }
  else{
    res.render('Tips');
  }
})

//타임라인 업로드
app.get('/Uploadtimeline', function(req, res){
  if(req.user && req.user.nickName){
    res.render('Uploadtimeline', {nickName:req.user.nickName});
  }
  else{
    res.rendirect('/Noauth');
  }
})

//권한이 없습니다 페이지
app.get('/Noauth', function(req, res){
  res.render('Noauth');
})
//타임라인 업로드 post
var Timelineimg=null;
app.post('/Uploadtimelineimg',  upload.single('timelineimg'), function(req, res){
    Timelineimg=req.file.originalname;
})
app.post('/Uploadtimeline', function(req, res){
   var sql ="SELECT * FROM users WHERE nickName=?";
   conn.query(sql, req.user.nickName, function(err, rows, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    else{
      var timeline = {
        timelinetitle:req.body.timelinetitle,
        timelinecontent:req.body.timelinecontent,
        nickName:req.user.nickName,
        likey:0,
        userimg:rows[0].userimg,
        timelinetimeat:getTimeStamp(),
        timelineimg:Timelineimg
      }
      var sql = "INSERT INTO timeline SET ?";
      conn.query(sql, [timeline], function(err, reuslts){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }else{
          Timelineimg=null
          req.session.save(function(){
            res.redirect('/Timeline');
          })
        
    }
  })

    }
    
   })
})

//timeline comment
app.post('/Timelinecomment/:id', function(req, res){
  if(req.user && req.user.nickName){
    var sql = "INSERT INTO timelinecomment SET ?";
    var timelinecomment = {
      timelineid:req.params.id,
      commentcontent:req.body.timelinecomment,
      nickName:req.user.nickName,
      userimg:req.user.userimg,
      commenttimeat:getTimeStamp()
    }
    conn.query(sql, [timelinecomment], function(err, results){
      if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }else{
          Timelineimg=null
          req.session.save(function(){
            res.redirect('/Timeline');
          })
        
    }
    })
  }
  else{
    res.redirect('/Noauth');
  }
})

//introduction 페이지
app.get('/Introduction', function(req, res){
   if(req.user && req.user.nickName){
    res.render('Introduction', {nickName:req.user.nickName});
  }
  else{
    res.render('Introduction');
  }
});

//Q&A 페이지
app.get('/QandA', function(req, res){
  if(req.user && req.user.nickName){
    var sql = 'SELECT * FROM qanda';
    conn.query(sql, function(err, results, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    } 
    else{
      var sql = 'SELECT * FROM qandacomment';
      conn.query(sql, function(err, rows, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Sever Error');
        }
        else{
          res.render('QandA', {nickName:req.user.nickName, qandas:results, comments:rows});
        }
        
      })
      
    } 
    })
    
  }



  else{
    var sql = 'SELECT * FROM qanda';
    conn.query(sql, function(err, results, fields){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    } 
    else{
      var sql = 'SELECT * FROM qandacomment';
      conn.query(sql, function(err, rows, fields){
        if(err){
          console.log(err);
          res.status(500).send('Internal Sever Error');
        }
        else{
          res.render('QandA', {qandas:results, comments:rows});
        }
        
      })
      
    } 
    })
  }
});

//Q&A 업로드
app.get('/UploadQandA', function(req, res){
  if(req.user && req.user.nickName){
    res.render('UploadQandA', {nickName:req.user.nickName});
  }
  else{
    res.rendirect('/QandA');
  }
})

//Upload Q&A post
app.post('/UploadQandA', function(req, res){
  var sql = "INSERT INTO qanda SET ?";
  var qanda = {
    qandatitle:req.body.qandatitle,
    qandacontent:req.body.qandacontent,
    nickName:req.user.nickName,
    userimg:req.user.userimg,
    qandatimeat:getTimeStamp()
  }
  conn.query(sql, [qanda], function(err, reuslts){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    else{
      req.session.save(function(){
            res.redirect('/QandA');
          })
    }
  })
})

//Q&A comment
app.post('/QandAcomment/:id', function(req, res){
  if(req.user && req.user.nickName==='관리자'){
    var sql = "INSERT INTO qandacomment SET ?";
  var qandacomment = {
    qandaid:req.params.id,
    answercontent:req.body.answercontent,
    nickName:req.user.nickName,
    userimg:req.user.userimg,
    qandacommenttimeat:getTimeStamp()
  }
  conn.query(sql, [qandacomment], function(err, reuslts){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    else{
      req.session.save(function(){
        res.redirect('/QandA');
          })
    }
  })
  }
  else{
    res.redirect('/Noauth');
  }
  
})

//Q&A DELETE
app.get('/QandAdelete/:id', function(req, res){
  var sql = 'DELETE FROM qanda WHERE id=?';
  conn.query(sql, [req.params.id], function(err, results){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    else{
      var sql = 'DELETE FROM qandacomment WHERE qandaid=?';
      conn.query(sql, [req.params.id], function(err, results){
        if(err){
          console.log(err);
          res.status(500).send('Internal Sever Error');
        }
        else{
          res.redirect('/QandA');
        }
      })
      
    }
  })
})

//Q&A comment DELETE
app.get('/QandAcomment/:id', function(req, res){
  var sql = 'DELETE FROM qandacomment WHERE id=?';
  conn.query(sql, [req.params.id], function(err, results){
    if(err){
      console.log(err);
      res.status(500).send('Internal Sever Error');
    }
    else{
      res.redirect('/QandA');
    }
  })
})
//로그인 페이지
app.get('/login', function(req, res){
   res.render('login');
});

//register 페이지
app.get('/register', function(req, res){
   res.render('register');
});

//about goont 페이지
app.get('/Explain', function(req, res){
  if(req.user && req.user.nickName){
    res.render('Explain', {nickName:req.user.nickName});
  }
  else{
    res.render('Explain');
  }
})

//Vision 페이지
app.get('/Vision', function(req, res){
  if(req.user && req.user.nickName){
    res.render('Vision', {nickName:req.user.nickName});
  }
  else{
    res.render('Vision');
  }
})


//이미지 파일 전송 
var userfilename = null;
app.post('/registerimg', upload.single('userimg'), function(req, res){
  userfilename=req.file.originalname;
})
//register post
app.post('/register', function(req, res){


    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
        authId:'local:'+req.body.username,
        username:req.body.username,
        password:hash,
        salt:salt,
        nickName:req.body.nickName, 
        email:req.body.email,
        userimg:userfilename
      }
    var sql = "INSERT INTO users SET ?";
    conn.query(sql, [user], function(err, reuslts){
    if(err){

      console.log(err);
      res.status(500).send('Internal Sever Error');
    }else{
      userfilename=null;
        req.login(user, function(err){
          req.session.save(function(){
            
            res.redirect('/');
          })
        })
    }
  })
  })
})

//passport
passport.serializeUser(function(user, done) {
    done(null, user.authId);
});

passport.deserializeUser(function(id, done) {
  var sql = 'SELECT * FROM users WHERE authId=?';
  conn.query(sql, [id], function(err, results){
    if(err){
      console.log(err);
      done('There is no user.');
    }
    else{
      done(null, results[0]);
    }
  })
  
});
passport.use(new LocalStrategy(
  function(username, password, done){
    var uname = username;
    var pwd = password;
    var sql = 'SELECT * FROM users WHERE authId=?';
    conn.query(sql, ['local:'+uname], function(err, results){
      if(err){
        return done('There is no user.');
      }
      console.log(results);
      var user = results[0];
      return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
        if(hash === user.password){
          return done(null, user);
        }
        else{
          done(null, false);
        }
        })
    })

  }
));

//login post
app.post('/login', passport.authenticate(
  'local',
  {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: false }));

//logout
app.get('/logout', function(req, res){
  req.logout();
  req.session.save(function(){
    res.redirect('/');
  })
  
  
})

//서버 열기
app.listen(3000, function(){
   console.log('connected 3000 port')
});
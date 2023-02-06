const express = require("express"); 
const router = express.Router(); 

const senha = '123';
const usuario = 'admin';

router.post("/", (req, res) => {
  if ((req.body.senha == senha) && (req.body.usuario == usuario)) {
    console.log('user', req.user);
    res.render('index');
  } else {
    res.render('login');
  }
});

router.get("/", (req, res) => {

  if (req.user) {
    res.render('index');
  } else {
    res.render('login');
  }

});

module.exports = router;

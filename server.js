const express = require('express')
const ejs = require('ejs')
const db = require('./src/db.js')
const rotas = require('./src/routers.js')
const session = require('express-session');
const flash = require('connect-flash');



const app = express()

app.use(
    session({
        secret: 'segredo',
        resave: true,
        saveUninitialized: true,
    })
);

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views/images'));
app.use(rotas);

db.sync()


app.listen(3333, (erros) => {
    console.log("funcionou")
})
const express = require('express');
const usuario = require('./models/usuario_model.js');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.use((req, res, next) => {
    res.locals.error_msg = req.flash('error_msg');
    next();
});

function checkAuthenticated(req, res, next) {
    if (req.session.usuario) {
        return next();
    }
    req.flash('error_msg', 'Por favor, faça login para ver este recurso');
    res.redirect('/login');
}

router.get('/', (req, res) => {
    res.render('home.ejs');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    let errors = [];

    if (!email || !senha) {
        errors.push({ msg: 'Por favor, preencha todos os campos' });
        return res.render('login', { error_msg: errors });
    }

    try {
        const user = await usuario.findOne({ where: { email } });

        if (!user) {
            errors.push({ msg: 'Email não encontrado.' });
            return res.render('login', { error_msg: errors });
        }

        const isMatch = await bcrypt.compare(senha, user.senha);
        if (isMatch) {
            req.session.usuario = user;
            res.redirect('/forms');
        } else {
            errors.push({ msg: 'Senha incorreta.' });
            return res.render('login', { error_msg: errors });
        }
    } catch (err) {
        console.error(err);
        errors.push({ msg: 'Erro ao fazer login. Tente novamente.' });
        return res.render('login', { error_msg: errors });
    }
});

router.get('/forms', checkAuthenticated, (req, res) => {
    usuario.findAll({
        attributes: ['id', 'nome', 'email']
    }).then(usuarios => {
        res.render('index.ejs', { usuario: req.session.usuario, usuarios });
    });
});

router.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

router.post('/cadastro', async (req, res) => {
    const { nome, email, senha, senhaConfirm } = req.body;
    let errors = [];

    if (!nome || !email || !senha) {
        errors.push({ msg: 'Por favor, preencha todos os campos' });
    }

    if (senha.length < 6) {
        errors.push({ msg: 'A senha deve ter pelo menos 6 caracteres' });
    }

    if (senha !== senhaConfirm) {
        errors.push({ msg: 'As senhas devem ser compatíveis' });
    }

    if (errors.length > 0) {
        return res.render('cadastro', { error_msg: errors });
    }

    try {
        const user = await usuario.findOne({ where: { email } });
        if (user) {
            errors.push({ msg: 'Email já está registrado' });
            return res.render('cadastro', { error_msg: errors });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(senha, salt);

            await usuario.create({
                nome,
                email,
                senha: hash,
            });

            res.render('login');
        }
    } catch (err) {
        console.error(err);
        errors.push({ msg: 'Erro ao registrar usuário' });
        return res.render('cadastro', { error_msg: errors });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

router.get('/excluir/:id', (req, res) => {
    usuario.destroy({
        where: {
            id: req.params.id
        }
    }).then(() => {
        res.redirect('/forms');
    }).catch((err) => {
        console.error(err);
        res.redirect('/forms');
    });
});

module.exports = router;

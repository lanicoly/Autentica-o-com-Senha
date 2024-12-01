const sequelize = require('sequelize')
const db = require('../db.js')

const Usuario = db.define('usuarios', {
    nome:{
        type: sequelize.STRING,
        allowNull: false
    },
    email:{
        type: sequelize.STRING,
        allowNull: false
    },
    senha: {
        type: sequelize.STRING,
        allowNull: false,
      },
      eAdmin: {
        type: sequelize.INTEGER,
        defaultValue: 0,
      },
})

module.exports = Usuario 
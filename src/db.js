const sequelize = require('sequelize')

const conexao = new sequelize('ativ_3', 'postgres', '1234', {
    host: 'localhost',
    dialect: 'postgres'
})

module.exports = conexao
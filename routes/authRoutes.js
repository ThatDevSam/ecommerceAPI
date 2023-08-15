const express = require('express')
const router = express.Router()

const { regitser, login, logout} = require('../controllers/authcontroller')

router.post('/login', login)
router.post('/register', regitser)
router.get('/logout', logout)

module.exports = router

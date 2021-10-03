const express = require('express')
const validateEmail = require('../common_functions/validateEmail')
const validatePassword = require('../common_functions/validatePassword')

const router = express.Router()

router.post('/register-sort', function (req, res) {
    // バリデーションチェック
    const email = req.body.email
    const password = req.body.password

    let errorMessage = validateEmail(email)

    if (errorMessage.length === 0) {
        errorMessage = validatePassword(password)
    }

    if (errorMessage.length !== 0) {
        res.send({
            code: 1,
            data: {},
            message: errorMessage,
        })
    } else {
        // ユーザー登録の処理
        res.send({
            code: 0,
            data: {},
            message: 'ユーザー登録に成功しました',
        })
    }
})

module.exports = router

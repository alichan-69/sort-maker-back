const express = require('express')
// const firebase = require('firebase')
// const initializeApp = require('../common_functions/initializeApp')
const authenticateUser = require('../common_functions/authenticateUser')

const router = express.Router()

router.post('/', function (req, res) {
    const a = authenticateUser()
    res.send(a)
    // // firebaseの設定
    // initializeApp(firebase)

    // // バリデーションチェック
    // const email = req.body.email
    // const password = req.body.password

    // let errorMessage = validateEmail(email)

    // if (errorMessage.length === 0) {
    //     errorMessage = validatePassword(password)
    // }

    // if (errorMessage.length !== 0) {
    //     res.send({
    //         code: 1,
    //         data: {},
    //         message: errorMessage,
    //     })
    // } else {
    //     // ユーザー登録の処理
    //     firebase
    //         .auth()
    //         .createUserWithEmailAndPassword(email, password)
    //         .then(() => {
    //             res.send({
    //                 code: 0,
    //                 data: {},
    //                 message: 'ユーザー登録に成功しました',
    //             })
    //         })
    //         .catch((e) => {
    //             // firebaseでユーザー登録した際に出るエラーにより返すエラーメッセージを変える
    //             if (e.code === 'auth/email-already-in-use') {
    //                 errorMessage = 'メールアドレスはすでに登録されています'
    //             } else {
    //                 errorMessage = 'ユーザー登録に失敗しました'
    //             }
    //             res.send({
    //                 code: 1,
    //                 data: {},
    //                 message: errorMessage,
    //             })
    //         })
    // }
})

module.exports = router

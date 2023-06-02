const express = require('express')
const crypto = require('crypto-js')
const func = require('../functions')

const router = express.Router()

router.post('/', async function (req, res) {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['user_id', 'text']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']
    const text = postData['text']

    // その他使用する値を宣言
    let accessToken
    let secret

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
        return
    }
    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 140)) {
        res.send(func.apiResponse(1, 0, '投稿するテキストの文字数が範囲外です'))
        return
    }

    // ユーザー認証を実行
    if (!(await func.authenticateUser(userId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // acces_tokenとsecretを検索する
    try {
        const sql = `SELECT access_token,secret FROM users WHERE id = ?`
        const [rows] = await connection.execute(sql, [userId])

        accessToken = rows[0]['access_token']
        secret = rows[0]['secret']
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ユーザー検索できませんでした'))
        return
    } finally {
        connection.end()
    }

    // access_tokenとsecretの複合化
    const key = process.env.TWITTER_COMPOSITE_KEY

    const decryptedAccessToken = crypto.AES.decrypt(accessToken, key).toString(
        crypto.enc.Utf8
    )
    const decryptedSecret = crypto.AES.decrypt(secret, key).toString(
        crypto.enc.Utf8
    )

    // ツイッターの初期設定
    const client = func.initializeTwitter(decryptedAccessToken, decryptedSecret)

    // 初期設定に失敗したらエラーレスポンスを返す
    if (!client) {
        res.send(func.apiResponse(1, 0, 'ツイッターの投稿に失敗しました'))
        return
    }

    const params = { status: text }

    // ツイッターに投稿
    client.post('statuses/update', params, (e) => {
        if (e) {
            res.send(func.apiResponse(1, 0, 'ツイッターの投稿に失敗しました'))
            return
        } else {
            res.send(func.apiResponse(0, 0, 'ツイッターの投稿に成功しました'))
            return
        }
    })
})

module.exports = router

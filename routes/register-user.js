const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['id', 'name', 'access_token', 'secret']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const id = postData['id']
    const name = postData['name']
    const accessToken = postData['access_token']
    const secret = postData['secret']

    // その他データベースに登録する値を変数に格納
    const deleteFlg = false
    const createDate = func.formatDate(new Date())
    const updateDate = func.formatDate(new Date())

    // バリデーション
    if (!func.isStrOutOfRange(id, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
        return
    }
    if (!func.isStrOutOfRange(name, 1, 255)) {
        res.send(func.apiResponse(1, 0, '名前の文字数が範囲外です'))
        return
    }
    if (!func.isStrOutOfRange(accessToken, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'accessTokenの文字数が範囲外です'))
        return
    }
    if (!func.isStrOutOfRange(secret, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'secretの文字数が範囲外です'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // ユーザーを登録する
    try {
        // すでにユーザーが登録されているかどうか確かめる
        let sql = `SELECT COUNT(*) AS count FROM users WHERE id = ? AND delete_flg = false`
        const [rows] = await connection.execute(sql, [id])
        if (rows[0]['count']) {
            // すでに登録されていたら正常なレスポンスをを返す
            res.send(func.apiResponse(0, 0, '成功'))
            return
        }

        // ユーザーの登録
        sql = `INSERT INTO users (id,name,access_token,secret,delete_flg,create_date,update_date) values (?, ?, ?, ?, ?, ?, ?)`
        await connection.execute(sql, [id, name, accessToken, secret, deleteFlg, createDate, updateDate])

        // 登録できたら正常なレスポンスをを返す
        res.send(func.apiResponse(0, 0, '成功'))
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ユーザー登録できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router

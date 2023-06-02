const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['user_id', 'sort_id']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']
    const sortId = postData['sort_id']

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'ユーザーidの文字数が範囲外です'))
        return
    }
    if (!func.isStrOutOfRange(String(sortId), 1, 11)) {
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))
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

    // お気に入りを検索する
    try {
        // お気に入りの検索
        let sql = `SELECT id, sort_id, user_id, delete_flg, create_date, update_date FROM likes WHERE user_id = ? AND sort_id = ? AND delete_flg = false`
        const [rows] = await connection.execute(sql,[userId,sortId])

        // お気に入りが存在しなかったらdataにdelete_flgのみを記載した正常なレスポンスをを返す
        if (!rows.length) {
            res.send(
                func.apiResponse(
                    0,
                    {
                        delete_flg: true,
                    },
                    '成功'
                )
            )
            return
        }

        // ユーザー名を取ってくる
        sql = `SELECT name FROM users WHERE id = ? AND delete_flg = false`
        const [rowsOfUsers] = await connection.execute(sql, [rows[0]['user_id']])

        // 検索できたらdataに検索したデータを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                {
                    id: rows[0]['id'],
                    sort_id: rows[0]['sort_id'],
                    user_name: rowsOfUsers[0]['name'],
                    delete_flg: rows[0]['delete_flg'],
                    create_date: rows[0]['create_date'],
                    update_date: rows[0]['update_date'],
                },
                '成功'
            )
        )
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'お気に入りを検索できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router

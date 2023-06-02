const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['id']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const id = postData['id']
    const userId = 'user_id' in postData ? postData['user_id'] : null

    // バリデーション
    if (!func.isStrOutOfRange(String(id), 1, 11)) {
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))
        return
    }
    
    if (
        userId !== null &&
        !func.isStrOutOfRange(userId, 1, 255)
    ) {
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
        return
    }

    // ユーザー認証を実行
    if (userId !== null && !(await func.authenticateUser(userId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // ソートを検索する
    try {
        // ソートの検索
        let sql = `SELECT id, name, description, image, play_count, user_id, create_date, update_date FROM sorts WHERE id = ${id} AND delete_flg = false`

        if(userId !== null) sql += ` AND user_id = ?`

        const [rows] = await connection.execute(sql, [userId])

        // ユーザー名を取ってくる
        sql = `SELECT name FROM users WHERE id = ? AND delete_flg = false`

        const [rowsOfUsers] = await connection.execute(sql, [rows[0]['user_id']])

        // 検索できたらdataに検索したデータを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                {
                    id: rows[0]['id'],
                    name: rows[0]['name'],
                    description: rows[0]['description'],
                    image: rows[0]['image'],
                    play_count: rows[0]['play_count'],
                    user_name: rowsOfUsers[0]['name'],
                    create_date: rows[0]['create_date'],
                    update_date: rows[0]['update_date'],
                },
                '成功'
            )
        )
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソートを検索できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router

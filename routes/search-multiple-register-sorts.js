const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['user_id']
    if (!func.isExistKey(requiredKeys, postData)) {
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))
        return
    }

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255)) {
        res.send(func.apiResponse(1, 0, 'ユーザーIDの文字数が範囲外です'))
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
        let sql = `SELECT id, name, description, image, play_count ,user_id, create_date, update_date FROM sorts WHERE user_id = ? AND delete_flg = false`
        const [rows] = await connection.execute(sql, [userId])

        // ユーザー名を取ってくる
        for (let i in rows) {
            sql = `SELECT name FROM users WHERE id = ? AND delete_flg = false`

            const [rowsOfUsers] = await connection.execute(sql, [rows[i]['user_id']])

            delete rows[i]['user_id']
            rows[i]['user_name'] = rowsOfUsers[0]['name']
        }

        // 検索できたらdataに検索したデータを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                {
                    sorts: rows,
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

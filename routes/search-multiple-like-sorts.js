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
    if (!func.isStrOutOfRange(userId, 1, 255)){
        res.send(func.apiResponse(1, 0, 'ユーザーidの文字数が範囲外です'))
        return
    }

    // ユーザー認証を実行
    if (!(await func.authenticateUser(userId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection){
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // お気に入りを検索する
    try {
        // お気に入りの検索
        let sql = `SELECT id, sort_id, user_id, delete_flg, create_date, update_date FROM likes WHERE user_id = ? AND delete_flg = false`
        const [rows] = await connection.execute(sql, [userId])

        // お気に入りのsort_idをわたしてソートのデータを取ってくる
        let rowsOfSorts = []

        if (rows.length !== 0) {
            sql = `SELECT id, name, description, image, play_count ,user_id, create_date, update_date FROM sorts WHERE delete_flg = false`
            let params = []

            for (let i in rows) {
                if (i === '0') {
                    sql += ` AND id = ?`
                    params.push(rows[i]['sort_id'])
                    continue
                }

                sql += ` OR id = ?`
                params.push(rows[i]['sort_id'])
            }

            ;[rowsOfSorts] = await connection.execute(sql, params)

            // ユーザー名を取ってくる
            for (let i in rowsOfSorts) {
                sql = `SELECT name FROM users WHERE id = ? AND delete_flg = false`

                const [rowsOfUsers] = await connection.execute(sql, [rowsOfSorts[i]['user_id']])

                delete rowsOfSorts[i]['user_id']
                rowsOfSorts[i]['user_name'] = rowsOfUsers[0]['name']
            }
        }

        // 検索できたらdataに検索したデータを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                {
                    like_sorts: rowsOfSorts,
                },
                '成功'
            )
        )
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(
            func.apiResponse(1, 0, 'お気に入りのソートを検索できませんでした')
        )
        return
    } finally {
        connection.end()
    }
})

module.exports = router

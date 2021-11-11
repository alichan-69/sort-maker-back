const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['user_id']
    if (!func.isExistKey(requiredKeys, postData))
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))

    // ポストされたデータをそれぞれ変数に格納
    const userId = postData['user_id']

    // バリデーション
    if (!func.isStrOutOfRange(userId, 1, 255))
        res.send(func.apiResponse(1, 0, 'ユーザーidの文字数が範囲外です'))

    // ユーザー認証を実行
    if (!(await func.authenticateUser(userId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection)
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))

    // お気に入りを検索する
    try {
        // お気に入りの検索
        let sql = `SELECT id, sort_id, user_id, delete_flg, create_date, update_date FROM likes WHERE user_id = '${userId}' AND delete_flg = false`
        const [rows] = await connection.query(sql)

        // お気に入りのsort_idをわたしてソートのデータを取ってくる
        let rowsOfSorts = []

        if (rows) {
            sql = `SELECT id, name, description, image, play_count ,user_id, create_date, update_date FROM sorts WHERE delete_flg = false`

            for (let i in rows) {
                if (i === '0') {
                    sql += ` AND id = ${rows[i]['sort_id']}`
                    continue
                }

                sql += ` OR id = ${rows[i]['sort_id']}`
            }

            ;[rowsOfSorts] = await connection.query(sql)
        }

        // ユーザー名を取ってくる
        for (let i in rowsOfSorts) {
            sql = `SELECT name FROM users WHERE id = '${rowsOfSorts[i]['user_id']}' AND delete_flg = false`

            const [rowsOfUsers] = await connection.query(sql)

            delete rowsOfSorts[i]['user_id']
            rowsOfSorts[i]['user_name'] = rowsOfUsers[0]['name']
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
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(
            func.apiResponse(1, 0, 'お気に入りのソートを検索できませんでした')
        )
    } finally {
        connection.end()
    }
})

module.exports = router

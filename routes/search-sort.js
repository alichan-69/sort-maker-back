const express = require('express')
const func = require('../functions')

const router = express.Router()

router.post('/', async (req, res) => {
    const postData = req.body

    // ポストされたデータの必須キーの存在チェック
    const requiredKeys = ['id']
    if (!func.isExistKey(requiredKeys, postData))
        res.send(func.apiResponse(1, 0, 'ポストデータのキーが不足しています'))

    // ポストされたデータをそれぞれ変数に格納
    const id = postData['id']

    // バリデーション
    if (!func.isStrOutOfRange(String(id), 1, 11))
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection)
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))

    // ソートを検索する
    try {
        // ソートの検索
        const sql = `SELECT id, name, description, image, user_id, create_date, update_date FROM sorts WHERE id = ${id} AND delete_flg = false`
        const [rows] = await connection.query(sql)

        // 検索できたらdataに検索したデータを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                {
                    id: rows[0]['id'],
                    name: rows[0]['name'],
                    description: rows[0]['description'],
                    image: rows[0]['image'],
                    create_date: rows[0]['create_date'],
                    update_date: rows[0]['update_date'],
                },
                '成功'
            )
        )
    } catch (e) {
        console.log(e.message)
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソートを検索できませんでした'))
    } finally {
        connection.end()
    }
})

module.exports = router

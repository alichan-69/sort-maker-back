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

    // バリデーション
    if (!func.isStrOutOfRange(String(id), 1, 11)) {
        res.send(func.apiResponse(1, 0, 'ソートidの桁数が範囲外です'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // ソートアイテムを検索する
    try {
        // ソートアイテムの検索
        let sql = `SELECT id, name, image, sort_id, create_date, update_date FROM sort_items WHERE sort_id = ? AND delete_flg = false`
        const [rows] = await connection.execute(sql, [id])

        // 検索できたらdataに検索したデータを記載した正常なレスポンスをを返す
        res.send(
            func.apiResponse(
                0,
                {
                    sort_items: rows,
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

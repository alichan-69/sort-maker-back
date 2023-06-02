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

    // その他データベースに登録する値を変数に格納
    const deleteFlg = true
    const updateDate = func.formatDate(new Date())

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
    if (!(await func.authenticateRegisterUser(userId, sortId))) {
        res.send(func.apiResponse(1, 0, 'ユーザー認証に失敗しました'))
        return
    }

    // データベースに接続
    const connection = await func.configureMysql()

    if (!connection) {
        res.send(func.apiResponse(1, 0, 'データベースに接続できませんでした'))
        return
    }

    // ソート、ソートアイテム、お気に入りを削除する
    try {
        // ソートを削除する
        let sql = `UPDATE sorts SET delete_flg = ?, update_date = ? WHERE id = ? AND delete_flg = false`
        await connection.execute(sql, [deleteFlg, updateDate, sortId])

        // ソートアイテムを削除する
        sql = `UPDATE sort_items SET delete_flg = ?, update_date = ? WHERE sort_id = ? AND delete_flg = false`
        await connection.execute(sql, [deleteFlg, updateDate, sortId])

        // お気に入りを削除する
        sql = `UPDATE likes SET delete_flg = ?, update_date = ? WHERE sort_id = ? AND delete_flg = false`
        await connection.execute(sql, [deleteFlg, updateDate, sortId])

        // 削除できたら正常なレスポンスをを返す
        res.send(func.apiResponse(0, 0, '成功'))
        return
    } catch (e) {
        // エラーがひっかかったらエラーレスポンスを返す
        res.send(func.apiResponse(1, 0, 'ソートを削除できませんでした'))
        return
    } finally {
        connection.end()
    }
})

module.exports = router

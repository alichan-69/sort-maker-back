const mysql = require('mysql')

// ======================
// データベースの初期設定
// ======================
exports.configureMysql = () => {
    const con = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sort_maker',
    })

    return con
}

// ======================
// ユーザー認証
// ======================
exports.authenticateUser = function (uid) {
    const con = this.configureMysql()

    // データベースに接続してユーザーidを取得し、そのユーザーidが受け取ったidと同値だったらtrueを返し、それ以外はエラーレスポンスを返す
    con.connect((e) => {
        if (e) {
            // return new Error('データベースの接続に失敗しました')
            return 'データベースの接続に失敗しました'
        } else {
            const sql = `SELECT * FROM users WHERE user_id = ${uid}`
            con.query(sql, (e, result) => {
                if (e) {
                    // return new Error(
                    //     'データベースからデータを取得できませんでした'
                    // )
                    return 'データベースからデータを取得できませんでした'
                } else {
                    if (result.user_id === uid) {
                        return true
                    } else {
                        // return new Error('ユーザー認証に失敗しました')
                        return 'ユーザー認証に失敗しました'
                    }
                }
            })
        }
    })
}

const mysql = require('mysql2/promise')

// ======================
// データベースの初期設定
// ======================
exports.configureMysql = async () => {
    try {
        const con = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'sort_maker',
        })
        return con
    } catch (e) {
        return false
    }
}

// ======================
// ユーザー認証
// ======================
exports.authenticateUser = async (uid) => {
    // データベースに接続してユーザーidを取得し、そのユーザーidが受け取ったidと同値だったらtrueを返し、それ以外はfalseを返す
    const connection = await this.configureMysql()

    if (!connection) return false

    try {
        const sql = `SELECT * FROM users WHERE user_id = ${uid}`
        const [rows] = await connection.query(sql)

        if (uid === rows[0]['user_id']) {
            return true
        } else {
            return false
        }
    } catch (e) {
        return false
    } finally {
        connection.end()
    }
}

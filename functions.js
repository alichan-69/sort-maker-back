const mysql = require('mysql2/promise')

// ======================
// データベースの初期設定
// ======================
exports.configureMysql = async () => {
    const con = await mysql.createConnection({
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
exports.authenticateUser = async (uid) => {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sort_maker',
    })
    try {
        const sql = `SELECT * FROM users WHERE user_id = 1`
        const [rows, fields] = await connection.query(sql)
        return rows
    } catch (e) {
        console.log(e)
    } finally {
        connection.end()
    }
}
// exports.authenticateUser = async (uid) => {
//     // const con = await this.configureMysql()
//     // return con

//     const con = await mysql.createConnection({
//         host: 'localhost',
//         user: 'root',
//         password: '',
//         database: 'sort_maker',
//     })

//     con.connect((e) => {
//         if (e) console.error(e)
//         console.log('connected')
//     })

//     // データベースに接続してユーザーidを取得し、そのユーザーidが受け取ったidと同値だったらtrueを返し、それ以外はエラーレスポンスを返す
//     const sql = `SELECT * FROM users WHERE user_id = ${uid}`
//     const [result, fields] = await con.query(sql)
//     return result
// , (e, result) => {
// if (e) {
// return new Error(
//     'データベースからデータを取得できませんでした'
// )
//     console.log('失敗')
//     return 'データベースからデータを取得できませんでした'
// } else {
//     console.log('成功')
//     return result[0]['user_id']
// if (result.user_id === uid) {
//     return true
// } else {
//     // return new Error('ユーザー認証に失敗しました')
//     return 'ユーザー認証に失敗しました'
// }
// }
// })
// }

const express = require('express')
const twitter = require('twitter')

const router = express.Router()

router.post('/', function (req, res) {
    const client = new twitter({
        consumer_key: 'RVG2XXhNAMMjtfiZFup0NKtjY',
        consumer_secret: 'wNu836aH7W7icKwImyp0u3NwY2OkiqimNvLnOqr2RcidGFSI3F',
        access_token_key: '1447400056676515840-uahGvjy8NiBSY23YzRbbAz0NuNH8Rh',
        access_token_secret: '4ieyE07xiNuDpJrinsoHpS7WzMDtFKTUzIJbrRwc38sxc',
    })

    const params = { status: 'こんにちは' }
    client.post('statuses/update', params, function (error) {
        if (error) {
            res.send(error)
        } else {
            res.send('hello')
        }
    })
})

module.exports = router

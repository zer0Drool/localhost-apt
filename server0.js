// website designed and developed by yuk - www.yuk.digital - yukenquiries@gmail.com

const express = require('express');
const app = express();
const device = require('express-device');
const db = require('./utils/db.js');
const bodyParser = require('body-parser');

const compression = require('compression');
app.use(compression());

app.use(express.static('./public'));
app.use(device.capture());

app.use(bodyParser.json());

if (process.env.NODE_ENV != 'production') {
    app.use('/bundle.js', require('http-proxy-middleware')({
        target: 'http://localhost:8081/'
    }));
}

app.post('/fetchBookInfo', (req, res) => {
    db.fetchBookInfo(req.body.id).then(result => {
        res.json(result);
    })
});

app.get('/', (req, res) => {
    if (req.device.type == 'phone') {
        res.sendFile(__dirname + '/phone.html');
    } else if (req.device.type == 'tablet') {
        res.sendFile(__dirname + '/phone.html');
    } else {
        res.sendFile(__dirname + '/index.html');
    }
})

app.get('*', (req, res) => {
    if (req.device.type == 'phone') {
        res.sendFile(__dirname + '/phone.html');
    } else if (req.device.type == 'tablet') {
        res.sendFile(__dirname + '/phone.html');
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});

app.listen(process.env.PORT || 8080, () => console.log(`listening on 8080...`));

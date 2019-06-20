const express = require('express');
const app = express();
const path = require('path');

const router = express.Router();
const upload = require('./uploadMiddleware');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'ChatRoom-With-SocketIO'
    });
});

router.post('/post', upload.single('image'), async function(req, res) {
    if (!req.file) {
        res.status(401).json({ error: 'Please provide an image' });
    }
    const filename = req.file.originalname;
    return res.status(200).send('You have sucsessfully upload your profile: ' + filename + ' .\nPlease return to the last page.');
});

// router.get('/ws', function (req, res, next) {
//   res.render('index', {
//     title: 'ws'
//   });
// });

module.exports = router;
const multer = require('multer');
const path = require('path');
/*
const upload = multer({
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  dest: path.join(__dirname, '/uploads')
});
*/
var storage = multer.diskStorage(
  {
      destination: path.join(__dirname, '/../public/images'),
      filename: function ( req, file, cb ) {
          cb( null, file.originalname);
      }
  }
);

var upload = multer( { storage: storage } );

module.exports = upload
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    const str = file.originalname.split('.')
    cb(null, str[0] + '-' + Date.now() + '.' + str[1])
  }
})

const fileFilter = (req, file, cb) => {
  //accept image files only
  if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
}
 
const upload = multer({
  storage,
  limits: {
    fieldSize: 1024 * 1024 * 5,
  },
  fileFilter
});

module.exports = {
  upload
}
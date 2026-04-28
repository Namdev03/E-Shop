const multer = require('multer');
const fs = require('fs')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let dir;

        if (file.fieldname === 'productImage') {
            dir = 'uploads/products';
        } else if (file.fieldname === 'userImage') {
            dir = 'uploads/users';
        } else {
            dir = 'uploads/others';
        }
       fs.mkdirSync(dir,{recursive:true})
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + file.originalname
         cb(null, filename);
    }
});

const upload = multer({ storage });

module.exports = upload;
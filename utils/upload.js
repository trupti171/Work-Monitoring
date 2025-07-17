const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the directory where files will be stored
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Define the file name
    }
});
const upload = multer({ storage });
module.exports = upload;
const multer = require("multer");
const path = require("path");
const {
  UPLOAD_USER_IMAGE_FILE,
  ALLOWED_FILE_TYPE,
  MAX_FILE_SIZE,
} = require("../config");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_USER_IMAGE_FILE);
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(
      null,
      Date.now() + "-" + file.originalname.replace(extname, "") + extname
    );
  },
});

const fileFilter = (req, file, cb) => {
  const extname = path.extname(file.originalname);
  if (!ALLOWED_FILE_TYPE.includes(extname.substring(1))) {
    return cb(new Error("Image extension not allowed"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = upload;

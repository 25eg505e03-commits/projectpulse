const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  // Forbidden extensions for security
  const forbiddenExts = /\.(exe|bat|sh|vbs|msi|cmd|com|scr|php|pl|cgi)$/i;
  if (forbiddenExts.test(file.originalname)) {
    return cb(new Error('Executable and script files are not allowed for upload!'));
  }

  const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv|zip/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype.includes('document') || file.mimetype.includes('sheet') || file.mimetype.includes('zip');

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('File type not supported. Allowed formats: images, pdf, docx, txt, csv, zip'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;

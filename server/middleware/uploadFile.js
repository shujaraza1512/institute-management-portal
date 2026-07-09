const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Builds a multer instance scoped to one upload category (assignment
// attachments, lecture materials), each with its own destination folder and
// allowed file types. Creates the destination folder on first use if it
// doesn't exist yet, so a fresh clone of this repo doesn't need the folder
// pre-created by hand -- git doesn't track empty directories.
const buildUploader = (subfolder, allowedExtensions) => {
  const destination = path.join(__dirname, '..', 'uploads', subfolder);
  fs.mkdirSync(destination, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, destination),
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        const err = new Error(`Unsupported file type. Allowed: ${allowedExtensions.join(', ')}`);
        err.statusCode = 400;
        return cb(err);
      }
      cb(null, true);
    },
  });
};

const uploadAssignmentFile = buildUploader('assignments', ['.pdf', '.doc', '.docx', '.zip']);
const uploadLectureMaterialFile = buildUploader('lecture-materials', ['.pdf', '.ppt', '.pptx', '.doc', '.docx']);

module.exports = { uploadAssignmentFile, uploadLectureMaterialFile };

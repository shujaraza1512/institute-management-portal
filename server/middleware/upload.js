// Multer configuration for file uploads (lecture notes, PPTs, assignments,
// monthly papers, result sheets). Storage destination and file-type/size
// validation are filled in when Upload Lecture Units / Upload Results
// are built (Phases 6-7) — kept as a stub here so the folder structure
// and import paths are already in place.
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

module.exports = upload;

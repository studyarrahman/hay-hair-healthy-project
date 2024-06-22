const multer = require('multer');

// Konfigurasi storage
const storage = multer.memoryStorage();

// Konfigurasi upload dengan batasan ukuran dan jumlah file
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1 // Maksimal 1 file
  },
  fileFilter: (req, file, cb) => {
    // Optional: tambahkan filter untuk jenis file yang diperbolehkan
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware untuk menangani error dari multer dan memastikan file tidak null
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({ error: 'File size should not exceed 2MB' });
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({ error: 'Only one file is allowed' });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({ error: 'Unexpected field' });
        default:
          return res.status(400).json({ error: err.message });
      }
    } else if (err) {
      // Handle other errors
      return res.status(500).json({ error: err.message });
    }

    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    // If no errors, proceed to next middleware
    next();
  });
};

module.exports = uploadMiddleware;

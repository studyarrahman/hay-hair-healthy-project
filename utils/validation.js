// Fungsi untuk validasi email
exports.validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  // Fungsi untuk validasi nomor telepon
  exports.validatePhone = (phone) => {
    const re = /^\+?[1-9]\d{1,14}$/; // Contoh regex untuk validasi nomor telepon internasional
    return re.test(String(phone));
  };
  
  // Fungsi untuk validasi password
  exports.validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return re.test(password);
  };
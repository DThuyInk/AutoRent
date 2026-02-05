const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token không được cung cấp'
    });
  }

  jwt.verify(token, JWT_SECRET, (error, user) => {
    if (error) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    req.user = user;
    next();
  });
}

function authorizeRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng chưa xác thực'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Bạn không có quyền. Yêu cầu role: ${roles.join(' hoặc ')}`
      });
    }

    next();
  };
}

function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  return token;
}

function checkOwnershipOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Người dùng chưa xác thực'
    });
  }

  const paramId = req.params.id;

  if (req.user.role === 'Admin') {
    return next();
  }

  if (req.user.id !== paramId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem thông tin này'
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  authorizeRole,
  generateToken,
  checkOwnershipOrAdmin
};

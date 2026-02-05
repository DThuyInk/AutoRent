const {
  registerUser,
  loginUser
} = require('../services/authService');

async function register(req, res) {
  try {
    const { username, password, name, email, phone, address, role } = req.body;

    const { user, token } = await registerUser(username, password, name, email, phone, address, role);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    if (error.message.includes('không được rỗng')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('đã tồn tại')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('không hợp lệ')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng ký',
      error: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    const { user, token } = await loginUser(username, password);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    if (error.message.includes('không được rỗng')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('không đúng')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi khi đăng nhập',
      error: error.message
    });
  }
}

module.exports = {
  register,
  login
};

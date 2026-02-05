const User = require('../models/User');
const { generateToken } = require('../middlewares/authMiddleware');

async function getLoginForm(req, res) {
  try {
    res.render('auth/login', {
      pageTitle: 'Đăng Nhập',
      layout: false,
      error: null
    });
  } catch (error) {
    res.status(500).render('shared/404', {
      pageTitle: 'Lỗi',
      message: 'Có lỗi khi tải trang đăng nhập'
    });
  }
}

async function submitLogin(req, res) {
  try {
    const { username, password } = req.body;

    if (!username?.trim()) {
      return res.render('auth/login', {
        pageTitle: 'Đăng Nhập',
        layout: false,
        error: 'Vui lòng nhập username'
      });
    }

    if (!password?.trim()) {
      return res.render('auth/login', {
        pageTitle: 'Đăng Nhập',
        layout: false,
        error: 'Vui lòng nhập password'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.render('auth/login', {
        pageTitle: 'Đăng Nhập',
        layout: false,
        error: 'Username hoặc password không đúng'
      });
    }

    if (user.password !== password) {
      return res.render('auth/login', {
        pageTitle: 'Đăng Nhập',
        layout: false,
        error: 'Username hoặc password không đúng'
      });
    }

    const token = generateToken(user);
    
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    res.cookie('user', JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }), {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).render('auth/login', {
      pageTitle: 'Đăng Nhập',
      layout: false,
      error: 'Lỗi khi đăng nhập: ' + error.message
    });
  }
}

async function getRegisterForm(req, res) {
  try {
    res.render('auth/register', {
      pageTitle: 'Đăng Ký',
      layout: false,
      error: null,
      formData: {}
    });
  } catch (error) {
    res.status(500).render('shared/404', {
      pageTitle: 'Lỗi',
      message: 'Có lỗi khi tải trang đăng ký'
    });
  }
}

async function submitRegister(req, res) {
  try {
    const { username, password, confirmPassword, name, email, phone, address, role } = req.body;

    if (!username?.trim()) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Vui lòng nhập username',
        formData: { username, name, email, phone, address, role }
      });
    }

    if (!password?.trim()) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Vui lòng nhập password',
        formData: { username, name, email, phone, address, role }
      });
    }

    if (!confirmPassword?.trim()) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Vui lòng xác nhận password',
        formData: { username, name, email, phone, address, role }
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Mật khẩu xác nhận không khớp',
        formData: { username, name, email, phone, address, role }
      });
    }

    if (!name?.trim()) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Vui lòng nhập họ tên',
        formData: { username, name, email, phone, address, role }
      });
    }

    if (!email?.trim()) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Vui lòng nhập email',
        formData: { username, name, email, phone, address, role }
      });
    }

    if (!phone?.trim()) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Vui lòng nhập số điện thoại',
        formData: { username, name, email, phone, address, role }
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Username này đã được sử dụng',
        formData: { username, name, email, phone, address, role }
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Email này đã được đăng ký',
        formData: { username, name, email, phone, address, role }
      });
    }

    const userRole = role || 'User';
    const validRoles = ['User', 'Owner', 'Admin'];
    if (!validRoles.includes(userRole)) {
      return res.render('auth/register', {
        pageTitle: 'Đăng Ký',
        layout: false,
        error: 'Role không hợp lệ',
        formData: { username, name, email, phone, address, role }
      });
    }

    const totalUsers = await User.countDocuments();
    const userId = 'U' + String(totalUsers + 1).padStart(3, '0');

    const newUser = new User({
      id: userId,
      username,
      password, 
      name,
      email,
      phone,
      address: address || '',
      role: userRole
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    res.cookie('user', JSON.stringify({
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role
    }), {
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).render('auth/register', {
      pageTitle: 'Đăng Ký',
      layout: false,
      error: 'Lỗi khi đăng ký: ' + error.message
    });
  }
}

async function logout(req, res) {
  res.clearCookie('token');
  res.clearCookie('user');
  res.redirect('/login');
}

module.exports = {
  getLoginForm,
  submitLogin,
  getRegisterForm,
  submitRegister,
  logout
};

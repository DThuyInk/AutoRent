function checkAuthSession(req, res, next) {
  if (req.cookies.user) {
    try {
      res.locals.user = JSON.parse(req.cookies.user);
      res.locals.isAuthenticated = true;
    } catch (e) {
      res.locals.isAuthenticated = false;
    }
  } else {
    res.locals.isAuthenticated = false;
  }
  
  res.locals.currentPage = res.locals.currentPage || '';
  res.locals.pageTitle = res.locals.pageTitle || 'Car Rental System';
  
  next();
}

function requireAuth(req, res, next) {
  if (!req.cookies.token || !req.cookies.user) {
    return res.redirect('/login');
  }
  
  try {
    res.locals.user = JSON.parse(req.cookies.user);
    res.locals.isAuthenticated = true;
    next();
  } catch (e) {
    res.clearCookie('token');
    res.clearCookie('user');
    return res.redirect('/login');
  }
}

module.exports = {
  checkAuthSession,
  requireAuth
};

function authorizeRole(...allowedRoles) {
  return (req, res, next) => {
    if (!res.locals.user) {
      return res.status(401).render('shared/404', {
        pageTitle: 'Không Có Quyền',
        message: 'Bạn cần đăng nhập để thực hiện hành động này'
      });
    }

    if (!allowedRoles.includes(res.locals.user.role)) {
      return res.status(403).render('shared/404', {
        pageTitle: 'Không Có Quyền',
        message: `Chỉ ${allowedRoles.join(' hoặc ')} mới có thể thực hiện hành động này`
      });
    }

    next();
  };
}

module.exports = { authorizeRole };

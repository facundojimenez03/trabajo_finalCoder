export const authorizeRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.redirect('/?error=Debes estar autenticado para acceder a este recurso')
        }

        if (!roles.includes(req.user.role)) {
            return res.redirect('/?error=No tienes permiso para acceder a este recurso')
        }
        next()
    }
}
export const checkUser = (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user
  }
    next()
}
// Middleware pour vérifier le rôle (ex: authorize('admin', 'agent'))
export function authorize(...roles) {
  return (req, res, next) => {
    // req.user a été injecté par le middleware 'auth' avant
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}` 
      });
    }
    next();
  };
}
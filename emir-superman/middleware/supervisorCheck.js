
/**
 * Middleware to check if the supervisor is initialized.
 */
const supervisorCheck = (req, res, next) => {
  if (!req.app.get('supervisor')) {
    return res.status(503).json({ error: 'Supervisor nicht initialisiert' });
  }
  next();
};

module.exports = supervisorCheck;

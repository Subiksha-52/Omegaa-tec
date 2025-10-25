const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    console.log(`🔐 Authentication failed: No token provided for ${req.method} ${req.path}`);
    return res.status(401).json({ 
      success: false,
      msg: 'No token provided, authorization denied',
      error: 'AUTH_TOKEN_MISSING'
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log(`🔐 Authentication successful: User ${decoded.id} accessed ${req.method} ${req.path}`);
    next();
  } catch (err) {
    console.log(`🔐 Authentication failed: Invalid token for ${req.method} ${req.path}`, err.message);
    
    let errorMsg = 'Token is not valid';
    let errorCode = 'AUTH_TOKEN_INVALID';
    
    if (err.name === 'TokenExpiredError') {
      errorMsg = 'Token has expired';
      errorCode = 'AUTH_TOKEN_EXPIRED';
    } else if (err.name === 'JsonWebTokenError') {
      errorMsg = 'Invalid token format';
      errorCode = 'AUTH_TOKEN_MALFORMED';
    }
    
    res.status(401).json({ 
      success: false,
      msg: errorMsg,
      error: errorCode
    });
  }
};

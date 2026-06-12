import { v4 as uuidv4 } from 'uuid';

export const trackingMiddleware = (req, res, next) => {
  // Ingress request ID
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  // Time logging
  const start = performance.now();
  
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    const duration = (performance.now() - start).toFixed(2);
    res.setHeader('X-Response-Time', `${duration}ms`);
    return originalWriteHead.apply(this, args);
  };

  next();
};

export default trackingMiddleware;

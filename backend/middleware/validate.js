/**
 * Simple input validation helpers for route handlers.
 */

// Validate that req.params.id is a positive integer
export function validateId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  req.params.id = id;
  next();
}

// Validate string length limits (single field)
export function maxLength(field, max) {
  return (req, res, next) => {
    const value = req.body[field];
    if (typeof value === 'string' && value.length > max) {
      return res.status(400).json({ error: `${field} exceeds maximum length of ${max}` });
    }
    next();
  };
}

/**
 * Validate multiple fields at once.
 * Usage: validateFields({ title: 300, content: 100000, email: 254 })
 * Returns 400 if any field exceeds its limit.
 */
export function validateFields(limits) {
  return (req, res, next) => {
    for (const [field, max] of Object.entries(limits)) {
      const value = req.body?.[field];
      if (typeof value === 'string' && value.length > max) {
        return res.status(400).json({ error: `${field} exceeds maximum length of ${max}` });
      }
    }
    next();
  };
}

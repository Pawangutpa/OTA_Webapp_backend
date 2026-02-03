exports.requireFields = (body, fields) => {
  for (const field of fields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
};

/**
 * Compare semantic versions
 * return true if v2 > v1
 */
exports.isNewerVersion = (current, latest) => {
  const a = current.split(".").map(Number);
  const b = latest.split(".").map(Number);

  for (let i = 0; i < 3; i++) {
    if (b[i] > a[i]) return true;
    if (b[i] < a[i]) return false;
  }
  return false;
};

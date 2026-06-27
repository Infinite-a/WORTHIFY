
// Small helper: sanitize category for use in CSS class names
function safeCategoryClass(cat) {
  if (typeof cat !== 'string') return 'default';
  const allowed = ['smartphone','laptop','tablet','audio','wearable','camera','tv','gaming','appliance'];
  const s = cat.toLowerCase().trim();
  return allowed.includes(s) ? s : 'default';
}

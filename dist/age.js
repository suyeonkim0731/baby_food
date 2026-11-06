// Classify literal age labels in reported product names, never ingredient-based suitability.
window.FoodAge = (() => {
  function fromName(name) {
    const match = String(name || '').match(/(?:^|[^\d])(\d{1,2})\s*개월\s*(이상)?/);
    if (!match) return null;
    const months = Number(match[1]);
    if (months < 1 || months > 36) return null;
    return { months, minimum: !!match[2], label: `${months}개월${match[2] ? ' 이상' : ' 표시'}`, evidence: match[0].trim().replace(/^[^\d]+/, '') };
  }
  function of(product) {
    const labels = (product.candidates || []).map(c => fromName(c.name));
    if (!labels.length || labels.some(label => !label)) return null;
    const first = labels[0];
    return labels.every(label => label.months === first.months && label.minimum === first.minimum) ? first : null;
  }
  function matches(product, filter) {
    if (filter === 'all') return true;
    const label = of(product);
    if (filter === 'unknown') return !label;
    return !!label && String(label.months) === String(filter);
  }
  return { fromName, of, matches };
})();

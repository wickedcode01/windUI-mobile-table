

/* eslint-disable */


const contains = (context, node) => {
  if (context.contains) {
    return context.contains(node);
  } else if (context.compareDocumentPosition) {
    return context === node || !!(context.compareDocumentPosition(node) & 16);
  }

  return fallback(context, node);
};

export default contains;

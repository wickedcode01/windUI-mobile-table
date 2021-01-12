function removeStyle(node, key) {
  if ('removeProperty' in node.style) {
    node.style.removeProperty(key);
  } else if (typeof node.style.removeAttribute === 'function') {
    node.style.removeAttribute(key);
  }
}


export default (node, keys) => {
  if (typeof keys === 'string') {
    removeStyle(node, keys);
  } else if (Object.prototype.toString.call(keys) === '[object Array]') {
    keys.forEach(key => removeStyle(node, key));
  }
};

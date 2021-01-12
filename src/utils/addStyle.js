import hyphenateStyleName from './hyphenateStyleName';
import removeStyle from './removeStyle';

export default (node, property, value) => {
  let css = '';
  let props = property;

  if (typeof property === 'string') {
    if (value === undefined) {
      throw new Error('value is undefined');
    }
    (props = {})[property] = value;
  }

  if (typeof props === 'object') {
    for (let key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        if (!props[key] && props[key] !== 0) {
          removeStyle(node, hyphenateStyleName(key));
        } else {
          css += `${hyphenateStyleName(key)}:${props[key]};`;
        }
      }
    }
  }

  node.style.cssText += `;${css}`;
};

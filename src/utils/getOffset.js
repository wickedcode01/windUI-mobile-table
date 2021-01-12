import contains from './contains';
import getWindow from './getWindow';
export default (node)=> {
  const doc = document;
  const win = getWindow(node);
  const docElem = doc && doc.documentElement;

  let box = {
    top: 0,
    left: 0,
    height: 0,
    width: 0
  };

  if (!doc) {
    return null;
  }

  if (!contains(docElem, node)) {
    return box;
  }

  if (node.getBoundingClientRect !== undefined) {
    box = node.getBoundingClientRect();
  }

  if ((box.width || box.height) && docElem && win) {
    box = {
      top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
      left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0),
      width: (box.width === null ? node.offsetWidth : box.width) || 0,
      height: (box.height === null ? node.offsetHeight : box.height) || 0
    };
  }

  return box;
};


import getOffset from './getOffset';
import getWindow from './getWindow';
export default (node, client) => {
  const win =getWindow(node);

  if (win) {
    return win.innerWidth;
  }

  if (client) {
    return node.clientWidth;
  }

  const offset = getOffset(node);

  return offset ? offset.width : 0;
};

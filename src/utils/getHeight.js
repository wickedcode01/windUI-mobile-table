import getOffset from './getOffset';
import getWindow from './getWindow';
export default (node, client) => {
  const win = getWindow(node);

  if (win) {
    return win.innerHeight;
  }

  return client ? node.clientHeight : getOffset(node).height;
};

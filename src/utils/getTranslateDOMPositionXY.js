import BrowserSupportCore from './BrowserSupportCore';
import getVendorPrefixedName from './getVendorPrefixedName';
const TRANSFORM = getVendorPrefixedName('transform');
const BACKFACE_VISIBILITY = getVendorPrefixedName('backfaceVisibility');

export const getTranslateDOMPositionXY = (conf= { enable3DTransform: true }) => {
  if (BrowserSupportCore.hasCSSTransforms()) {
    let ua = window ? window.navigator.userAgent : 'UNKNOWN';
    let isSafari = /Safari\//.test(ua) && !/Chrome\//.test(ua);

    if (!isSafari && BrowserSupportCore.hasCSS3DTransforms() && conf.enable3DTransform) {
      return (style, x = 0, y = 0) => {
        style[TRANSFORM] = `translate3d(${x}px,${y}px,0)`;
        style[BACKFACE_VISIBILITY] = 'hidden';
        return style;
      };
    }

    return (style, x = 0, y = 0) => {
      style[TRANSFORM] = `translate(${x}px,${y}px)`;
      return style;
    };
  }

  return (style, x = 0, y = 0) => {
    style.left = `${x}px`;
    style.top = `${y}px`;
    return style;
  };
};

export default getTranslateDOMPositionXY;

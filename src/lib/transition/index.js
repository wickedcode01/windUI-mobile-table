"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var _query = require("../query");

function getTransitionProperties() {
  if (!_query.canUseDOM) {
    return {};
  }

  var vendorMap = {
    O: function O(e) {
      return "o" + e.toLowerCase();
    },
    Moz: function Moz(e) {
      return e.toLowerCase();
    },
    Webkit: function Webkit(e) {
      return "webkit" + e;
    },
    ms: function ms(e) {
      return "MS" + e;
    }
  };
  var vendors = Object.keys(vendorMap);
  var style = document.createElement('div').style;
  var tempTransitionEnd;
  var tempPrefix = '';

  for (var i = 0; i < vendors.length; i += 1) {
    var vendor = vendors[i];

    if (vendor + "TransitionProperty" in style) {
      tempPrefix = "-" + vendor.toLowerCase();
      tempTransitionEnd = vendorMap[vendor]('TransitionEnd');
      break;
    }
  }

  if (!tempTransitionEnd && 'transitionProperty' in style) {
    tempTransitionEnd = 'transitionend';
  }

  style = null;
  return {
    transitionEnd: tempTransitionEnd,
    prefix: tempPrefix
  };
}

var _default = function _default() {
  var _getTransitionPropert = getTransitionProperties(),
      prefix = _getTransitionPropert.prefix,
      transitionEnd = _getTransitionPropert.transitionEnd;

  var addPrefix = function addPrefix(name) {
    return prefix + "-" + name;
  };

  return {
    end: transitionEnd,
    backfaceVisibility: addPrefix('backface-visibility'),
    transform: addPrefix('transform'),
    property: addPrefix('transition-property'),
    timing: addPrefix('transition-timing-function'),
    delay: addPrefix('transition-delay'),
    duration: addPrefix('transition-duration')
  };
};

exports["default"] = _default;
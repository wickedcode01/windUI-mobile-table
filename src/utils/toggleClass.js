import addClass from './addClass'
import removeClass from './removeClass'
const toggleClass1 = (node, className, condition) => {
  if (condition) {
    addClass(node, className);
  } else {
    removeClass(node, className);
  }
};
const toggleClass=(node, className, condition) => {
  if (!node) {
    return;
  }

  if (Object.getPrototypeOf(node).hasOwnProperty('length')) {
    Array.from(node).forEach(item => {
      toggleClass1(item, className, condition);
    });
    return;
  }
  toggleClass1(node, className, condition);
};

export {toggleClass}
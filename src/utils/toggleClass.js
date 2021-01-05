import { addClass, removeClass } from 'dom-lib';

const toggleClass1 = (node: HTMLElement, className: string, condition: boolean) => {
  if (condition) {
    addClass(node, className);
  } else {
    removeClass(node, className);
  }
};
const toggleClass=(node: HTMLElement | Array<HTMLElement>, className: string, condition: boolean) => {
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
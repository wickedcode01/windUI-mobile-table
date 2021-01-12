export default (target, className) => {
  if (className) {
    if (target.classList) {
      target.classList.remove(className);
    } else {
      target.className = target.className
        .replace(new RegExp(`(^|\\s)${className}(?:\\s|$)`, 'g'), '$1')
        .replace(/\s+/g, ' ')
        .replace(/^\s*|\s*$/g, ''); 
    }
  }
  return target;
};

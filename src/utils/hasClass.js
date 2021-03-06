
export default (target, className) => {
  if (target.classList) {
    return !!className && target.classList.contains(className);
  }
  return ` ${target.className} `.indexOf(` ${className} `) !== -1;
};

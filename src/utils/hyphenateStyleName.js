function hyphenate(string) {
    return string.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

const msPattern = /^ms-/;

export default string => hyphenate(string).replace(msPattern, '-ms-');

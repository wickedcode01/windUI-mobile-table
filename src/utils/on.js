export default (
  target,
  eventName,
  listener,
  capture = false
) => {
  target.addEventListener(eventName, listener, capture);
  return {
    off() {
      target.removeEventListener(eventName, listener, capture);
    }
  };
};

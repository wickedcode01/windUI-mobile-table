
export default (
  target,
  eventName,
  listener,
  capture = false
)=> {
  target.removeEventListener(eventName, listener, capture);
};

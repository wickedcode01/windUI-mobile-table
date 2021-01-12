function segmentation(str, isLeft, sign, digit) {
    var tmp = "" + str;
    var x,
      x1,
      x2,
      rgx,
      s = sign || ",",
      d = digit || 4;
    x = tmp.split(".");
    x1 = x[0];
    x2 = x.length > 1 ? "." + x[1] : "";
    if (isLeft) {
      rgx = new RegExp("(\\d{" + d + "})(\\d+)");
    } else {
      rgx = new RegExp("(\\d+)(\\d{" + d + "})")
    }
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, "$1" + s + "$2");
    }
    return x1 + x2;
  };

  const separator = function (strNumber) {
    return segmentation(strNumber, false, ",", 3);
  };

  export default separator
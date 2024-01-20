import Cookies from "js-cookie";

// https://hitchhikers.yext.com/guides/analyze-trends-with-visitor-analytics/07-cookies-visitors/
function create_UUID() {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    },
  );
  return uuid;
}

export function generateCookie(name: string) {
  if (!Cookies.get(name)) {
    Cookies.set(name, create_UUID(), {
      expires: 365 * 100,
      secure: true,
    });
  }
  return Cookies.get(name);
}

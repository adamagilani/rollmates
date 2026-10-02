// Shared by the RollMates link pages: opens the app if it's installed, otherwise offers to get it.
(function () {
  var TESTFLIGHT = "https://testflight.apple.com/join/esFUVYCp";
  var params = new URLSearchParams(location.search);
  var clean = function (v, re) { return v && re.test(v) ? v : null; };
  var kind = document.body.dataset.kind;
  var uuid = /^[0-9a-fA-F-]{36}$/, handle = /^[A-Za-z0-9_.]{3,20}$/;
  var id = clean(params.get("id"), uuid), user = clean(params.get("u"), handle);
  var app = null, title = "RollMates", line = "Develop your photos like film, then share the roll with your mates.";
  if (kind === "add" && user) {
    app = "rollmates://add/" + user;
    title = "@" + user + " wants to be mates";
    line = "Open RollMates to add them as a mate and see the rolls they share.";
  } else if (kind === "film" && id) {
    app = "rollmates://film/" + id.toLowerCase();
    title = "A film on RollMates";
    line = "Open RollMates to see this film, try it on your photos and save it.";
  } else if (kind === "roll" && id) {
    app = "rollmates://roll/" + id.toLowerCase() + (user ? "?u=" + user : "");
    title = user ? "A roll from @" + user : "A roll on RollMates";
    line = "Open RollMates to see the roll. Only " + (user ? "@" + user + "'s" : "their") + " mates can see it, so you may need to add them first.";
  }
  document.getElementById("title").textContent = title;
  document.getElementById("line").textContent = line;
  var open = document.getElementById("open");
  // With RollMates installed, these links open the app directly (universal links), so no automatic jump here:
  // without the app, Safari would show an error.
  if (app) { open.href = app; } else { open.style.display = "none"; }
  var get = document.getElementById("get");
  get.href = TESTFLIGHT;
  // Installing loses the link, so "Get RollMates" copies it first; the app offers to paste it after install.
  if (user && (kind === "add" || kind === "roll")) {
    var note = document.querySelector("small");
    if (note) note.textContent = "Get RollMates copies this invite. After installing, open RollMates and tap Paste Invite to add @" + user + ".";
    get.addEventListener("click", function (event) {
      if (!navigator.clipboard) return;
      event.preventDefault();
      navigator.clipboard.writeText(location.href).catch(function () {}).then(function () { location.href = TESTFLIGHT; });
    });
  }
})();

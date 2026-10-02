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

  // A roll whose owner turned on the link preview: its cover and a blurred peek, plus who shared it.
  if (kind === "roll" && id && window.fetch) {
    var SUPABASE = "https://tbmfloomiobgilafksly.supabase.co";
    var KEY = "sb_publishable_Ak9_i1AEe511JlgyhdfpKg_koEEd5Ya";
    fetch(SUPABASE + "/rest/v1/rpc/roll_preview", {
      method: "POST",
      headers: { "apikey": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ roll: id.toLowerCase() })
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      var roll = rows && rows[0];
      if (!roll || !roll.preview_path) return;
      var img = document.getElementById("preview");
      img.alt = roll.title;
      img.onload = function () { document.body.classList.add("has-preview"); };
      img.src = SUPABASE + "/storage/v1/object/public/previews/" + roll.preview_path;
      var name = roll.display_name || ("@" + roll.username);
      document.getElementById("owner").textContent = name + " shared a roll";
      var avatar = document.getElementById("avatar");
      if (roll.avatar_path) { avatar.src = SUPABASE + "/storage/v1/object/public/avatars/" + roll.avatar_path; }
      else { avatar.style.display = "none"; }
      document.getElementById("title").textContent = roll.title;
      var count = roll.photo_count + (roll.photo_count === 1 ? " photo" : " photos");
      document.getElementById("line").textContent = count + " on " + roll.film + ". Only " + name
        + "'s mates can see them, so add them in RollMates.";
    }).catch(function () {});
  }
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

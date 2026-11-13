// breevo.si videos: one video plays at a time, a choice of voice, and a Share button for each video.
(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll("video[data-id]"));

  // Starting one video pauses the others.
  videos.forEach(function (v) {
    v.addEventListener("play", function () {
      videos.forEach(function (o) { if (o !== v && !o.paused) o.pause(); });
    });
  });

  // Voice: every video comes in two voices (heart, the first, and george). One quiet link switches all of them.
  var voiceLink = document.querySelector(".other-voice");
  var current = "heart";
  function setVoice(voice) {
    current = voice;
    if (voiceLink) voiceLink.textContent = voice === "heart" ? "Hear it in another voice" : "Hear the first voice";
    videos.forEach(function (v) {
      var src = "video/" + v.dataset.id + "-" + voice + ".mp4";
      if (v.getAttribute("src") === src) return;
      var at = v.currentTime, playing = !v.paused;
      v.setAttribute("src", src);
      if (at > 0) {
        v.addEventListener("loadedmetadata", function once() {
          v.removeEventListener("loadedmetadata", once);
          v.currentTime = at;
          if (playing) v.play();
        });
        v.load();
      }
    });
    try { localStorage.setItem("breevo-voice", voice); } catch (e) {}
  }
  if (voiceLink) voiceLink.addEventListener("click", function () { setVoice(current === "heart" ? "george" : "heart"); });
  var saved = null;
  try { saved = localStorage.getItem("breevo-voice"); } catch (e) {}
  if (saved === "george") setVoice("george");

  // Share: the phone's own share sheet where there is one, otherwise copy the link.
  document.querySelectorAll("button.share").forEach(function (b) {
    var label = b.textContent;
    b.addEventListener("click", function () {
      var url = location.origin + "/videos.html" + (b.dataset.id === "breevo" ? "" : "#" + b.dataset.id);
      var title = b.dataset.title + " | Breevo";
      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () {});
        return;
      }
      function done(text) { b.textContent = text; setTimeout(function () { b.textContent = label; }, 2200); }
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { done("Link copied"); },
                                                function () { prompt("Copy this link:", url); });
      } else {
        prompt("Copy this link:", url);
      }
    });
  });

  // A shared link to one video (videos.html#04-ways) shows that video highlighted.
  function mark() {
    document.querySelectorAll(".clip.picked").forEach(function (c) { c.classList.remove("picked"); });
    var id = decodeURIComponent(location.hash.slice(1));
    var c = id && document.getElementById(id);
    if (c && c.classList.contains("clip")) c.classList.add("picked");
  }
  window.addEventListener("hashchange", mark);
  mark();
})();

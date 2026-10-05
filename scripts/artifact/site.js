/*
 * Runtime for the claude.ai artifact preview of the site (no React/Next).
 * Mirrors src/components/story/StoryHero.tsx, FrameSequence.ts, SiteHeader.tsx
 * and QuoteForm.tsx closely enough to review the design. Generated config
 * (__CONFIG__) is injected by scripts/build_artifact.py.
 */
(function () {
  "use strict";
  var CONFIG = __CONFIG__;
  var root = document.documentElement;
  var lang = root.lang === "ar" ? "ar" : "en";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp01 = function (v) { return Math.min(1, Math.max(0, v)); };
  var easeOut = function (v) { return 1 - Math.pow(1 - v, 3); };

  // ——— Smooth scroll ———
  var lenis = null;
  if (!reduce && window.Lenis) {
    try {
      lenis = new window.Lenis({ lerp: 0.12, smoothWheel: true, anchors: { offset: -80 } });
      var tick = function (t) { lenis.raf(t); requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    } catch (e) { lenis = null; }
  }
  function scrollToY(y) {
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }

  // ——— Story timeline maths (same as src/components/story/route.ts) ———
  var STOP_AT_BEAT = [1, 3, 4, 5, 7];
  var STOP_POSITIONS = [0, 0.25, 0.5, 0.75, 1];
  function routeProgress(t) {
    if (t <= STOP_AT_BEAT[0]) return 0;
    for (var i = 1; i < STOP_AT_BEAT.length; i++) {
      var a = STOP_AT_BEAT[i - 1], b = STOP_AT_BEAT[i];
      if (t <= b) return STOP_POSITIONS[i - 1] + ((t - a) / (b - a)) * (STOP_POSITIONS[i] - STOP_POSITIONS[i - 1]);
    }
    return 1;
  }
  function activeStop(f) {
    return STOP_POSITIONS.filter(function (p) { return f >= p - 0.001; }).length - 1;
  }

  // ——— Frame sequences (same as FrameSequence.ts) ———
  function decodeBlob(blob) {
    if (window.createImageBitmap) {
      return createImageBitmap(blob).then(function (img) { return { img: img, close: function () { img.close(); } }; }, fallback);
    }
    return fallback();
    function fallback() {
      return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function () { resolve({ img: img, close: function () { URL.revokeObjectURL(url); } }); };
        img.onerror = reject;
        img.src = url;
      });
    }
  }
  function Sequence(base) {
    this.base = base; this.blobs = []; this.frames = new Map(); this.decoding = new Set();
    this.count = 0; this.loading = null; this.onFrame = null;
  }
  Sequence.prototype.load = function () {
    var self = this;
    if (this.loading) return this.loading;
    this.loading = fetch(this.base + "manifest.json").then(function (r) { return r.json(); }).then(function (m) {
      self.count = m.count;
      self.blobs = new Array(m.count).fill(null);
      var url = function (i) { return self.base + String(m.pattern).replace("%03d", String(i + 1).padStart(3, "0")); };
      var fetchOne = function (i) {
        return fetch(url(i)).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) { self.blobs[i] = b; }, function () {});
      };
      return fetchOne(0).then(function () {
        self.decode(0);
        var next = 1;
        var worker = function () {
          if (next >= self.count) return Promise.resolve();
          var i = next++;
          return fetchOne(i).then(worker);
        };
        return Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
      });
    }).catch(function () {});
    return this.loading;
  };
  Sequence.prototype.decode = function (i) {
    var self = this;
    if (this.frames.has(i) || this.decoding.has(i) || !this.blobs[i]) return;
    this.decoding.add(i);
    decodeBlob(this.blobs[i]).then(function (f) {
      self.frames.set(i, f);
      if (self.onFrame) self.onFrame();
    }, function () {}).then(function () { self.decoding.delete(i); });
  };
  Sequence.prototype.draw = function (canvas, progress) {
    if (!this.count) return false;
    var i = Math.round(clamp01(progress) * (this.count - 1));
    for (var d = 0; d <= 10; d++) {
      if (i + d < this.count) this.decode(i + d);
      if (i - d >= 0) this.decode(i - d);
    }
    if (this.frames.size > 48) {
      var self = this;
      this.frames.forEach(function (f, k) { if (Math.abs(k - i) > 24) { f.close(); self.frames.delete(k); } });
    }
    var frame = this.frames.get(i);
    for (var e = 1; !frame && e < this.count; e++) frame = this.frames.get(i - e) || this.frames.get(i + e);
    if (!frame) return false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var cw = Math.round(canvas.clientWidth * dpr), ch = Math.round(canvas.clientHeight * dpr);
    if (!cw || !ch) return false;
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    var ctx = canvas.getContext("2d");
    var src = frame.img;
    var s = Math.max(cw / src.width, ch / src.height);
    var w = src.width * s, h = src.height * s;
    ctx.drawImage(src, (cw - w) / 2, (ch - h) / 2, w, h);
    return true;
  };

  // ——— The shipment story ———
  var section = document.getElementById("journey");
  if (section && !reduce) {
    var BEATS = CONFIG.beats.length;
    var SPAN = BEATS - 1 + CONFIG.tail;
    section.dataset.mode = "film";
    var beats = Array.prototype.slice.call(section.querySelectorAll("[data-beat]"));
    var media = beats.map(function (b) { return b.querySelector(".story-media"); });
    var images = beats.map(function (b) { return b.querySelector("img"); });
    var canvases = beats.map(function (b) { return b.querySelector("canvas"); });
    var captions = beats.map(function (b) { return b.querySelector(".story-caption"); });
    var stamp = section.querySelector("[data-stamp]");
    var film = section.querySelector(".film-route");
    var fill = film.querySelector("[data-fill]");
    var stops = Array.prototype.slice.call(film.querySelectorAll("[data-stop]"));
    var current = film.querySelector("[data-route-current]");
    var labels = stops.map(function (s) { return s.textContent.trim(); });

    var saveData = navigator.connection && navigator.connection.saveData;
    var sequences = {};
    if (!saveData) {
      CONFIG.beats.forEach(function (b) {
        if (b.clip && !sequences[b.clip.id]) sequences[b.clip.id] = new Sequence("frames/" + b.clip.id + "/wide/");
      });
    }

    var progress = function () {
      var range = section.offsetHeight - window.innerHeight;
      return range > 0 ? clamp01((window.scrollY - section.offsetTop) / range) : 0;
    };

    var render = function () {
      var time = progress() * SPAN;
      var stampCaption = 0;
      var shown = [];
      beats.forEach(function (_, b) {
        var d = time - b;
        var o = b === 0 ? 1 : clamp01((time - (b - 0.6)) / 0.45);
        shown[b] = o;
        if (b > 0) media[b].style.opacity = String(o);
        var clip = CONFIG.beats[b].clip;
        if (!(clip && sequences[clip.id])) images[b].style.transform = "scale(" + (1 + 0.07 * clamp01((d + 0.6) / 1.6)) + ")";
        var fadeIn = b === 0 ? 1 : clamp01((d + 0.45) / 0.3);
        var fadeOut = b === BEATS - 1 ? 1 : clamp01((0.45 - d) / 0.3);
        var c = Math.min(fadeIn, fadeOut);
        var cap = captions[b];
        cap.style.opacity = String(c);
        cap.style.transform = "translate3d(0," + (-Math.max(-0.6, Math.min(0.6, d)) * 28) + "px,0)";
        cap.style.visibility = c < 0.01 ? "hidden" : "visible";
        cap.inert = c < 0.5;
        if (b === CONFIG.stampBeat) stampCaption = c;
      });
      beats.forEach(function (_, b) {
        var clip = CONFIG.beats[b].clip;
        var seq = clip && sequences[clip.id];
        var canvas = canvases[b];
        if (!seq || !canvas) return;
        if (Math.abs(time - b) < 1.6) seq.load();
        var visible = shown[b] > 0 && (b === BEATS - 1 || shown[b + 1] < 1);
        if (visible && seq.draw(canvas, clamp01((time - clip.from) / (clip.to - clip.from)))) canvas.setAttribute("data-ready", "");
      });
      if (stamp) {
        var k = easeOut(clamp01((time - (CONFIG.stampBeat - 0.12)) / 0.22));
        stamp.style.opacity = String(stampCaption > 0 ? k : 0);
        stamp.style.transform = "rotate(-9deg) scale(" + (1.45 - 0.45 * k) + ")";
      }
      var along = routeProgress(time);
      var active = activeStop(along);
      fill.style.transform = "scaleX(" + along + ")";
      stops.forEach(function (s, i) { s.dataset.state = i < active ? "passed" : i === active ? "current" : "ahead"; });
      current.textContent = labels[active];
    };

    var queued = false;
    var schedule = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; render(); });
    };
    Object.keys(sequences).forEach(function (id) { sequences[id].onFrame = schedule; });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    if (lenis) lenis.on("scroll", schedule);
    var first = CONFIG.beats.filter(function (b) { return b.clip; })[0];
    if (first && sequences[first.clip.id]) sequences[first.clip.id].load();
    render();

    var follow = section.querySelector('[data-beat="0"] button');
    if (follow) follow.addEventListener("click", function () {
      scrollToY(section.offsetTop + (section.offsetHeight - window.innerHeight) / SPAN);
    });
  } else if (section) {
    var followStacked = section.querySelector('[data-beat="0"] button');
    var next = section.querySelector('[data-beat="1"]');
    if (followStacked && next) followStacked.addEventListener("click", function () { scrollToY(section.offsetTop + next.offsetTop); });
  }

  // ——— Header: clear over the story, solid after it; mobile menu ———
  var header = document.querySelector("header");
  if (header) {
    var solidify = function () {
      if (!section) return header.setAttribute("data-solid", "true");
      var end = section.offsetTop + section.offsetHeight - 72;
      header.setAttribute("data-solid", String(window.scrollY > end || header.hasAttribute("data-open")));
    };
    solidify();
    window.addEventListener("scroll", solidify, { passive: true });
    window.addEventListener("resize", solidify);

    var button = header.querySelector('button[aria-controls="mobile-menu"]');
    var desktopNav = header.querySelector("nav");
    if (button && desktopNav) {
      var panel = document.createElement("div");
      panel.id = "mobile-menu";
      panel.hidden = true;
      panel.className = "border-t border-hull bg-night px-5 pb-8 pt-4 sm:px-8 lg:hidden";
      var list = document.createElement("ul");
      list.className = "divide-y divide-hull";
      Array.prototype.forEach.call(desktopNav.querySelectorAll("a"), function (a) {
        var li = document.createElement("li");
        var link = document.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent;
        link.className = "block py-4 font-display text-xl font-semibold";
        link.addEventListener("click", function () { toggle(false); });
        li.appendChild(link);
        list.appendChild(li);
      });
      panel.appendChild(list);
      var quote = header.querySelector("a.btn-solid");
      if (quote) {
        var q = quote.cloneNode(true);
        q.className = "btn btn-solid mt-6 w-full justify-center";
        q.addEventListener("click", function () { toggle(false); });
        panel.appendChild(q);
      }
      header.appendChild(panel);
      var toggle = function (open) {
        panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        if (open) header.setAttribute("data-open", ""); else header.removeAttribute("data-open");
        solidify();
        if (open) { var f = panel.querySelector("a"); if (f) f.focus(); }
      };
      button.addEventListener("click", function () { toggle(panel.hidden); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { toggle(false); button.focus(); } });
    }
  }

  // ——— Quote form: validates like the real one; the preview has nowhere to send it ———
  var form = document.querySelector("#quote form");
  if (form) {
    var copy = CONFIG.form[lang];
    var required = ["name", "company", "email", "phone", "service", "from", "to"];
    var labelText = function (id) {
      var l = form.querySelector('label[for="q-' + id + '"]');
      return l ? l.textContent.trim() : id;
    };
    var setError = function (id, message) {
      var input = form.querySelector("#q-" + id);
      if (!input) return;
      var holder = id === "consent" ? input.closest("label").parentElement : input.closest("div.bg-deep") || input.parentElement;
      var old = holder.querySelector('[data-error="' + id + '"]');
      if (old) old.remove();
      if (message) {
        var p = document.createElement("p");
        p.setAttribute("data-error", id);
        p.id = "q-" + id + "-error";
        p.className = "mt-1 text-[0.8125rem] text-alert";
        p.textContent = message;
        holder.appendChild(p);
        input.setAttribute("aria-invalid", "true");
        input.setAttribute("aria-describedby", p.id);
      } else {
        input.removeAttribute("aria-invalid");
        input.removeAttribute("aria-describedby");
      }
    };
    var check = function (id) {
      var input = form.querySelector("#q-" + id);
      if (!input) return null;
      if (id === "consent") return input.checked ? null : copy.consent;
      var v = String(input.value || "").trim();
      if (!v) return copy.required.replace("{field}", labelText(id));
      if (id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return copy.email;
      if (id === "phone" && (v.replace(/\D/g, "").length < 7 || !/^[+()\d\s.-]+$/.test(v))) return copy.phone;
      return null;
    };
    required.concat(["consent"]).forEach(function (id) {
      var input = form.querySelector("#q-" + id);
      if (input) input.addEventListener("blur", function () { setError(id, check(id)); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      required.concat(["consent"]).forEach(function (id) {
        var msg = check(id);
        setError(id, msg);
        if (msg && !firstBad) firstBad = form.querySelector("#q-" + id);
      });
      if (firstBad) { firstBad.focus(); return; }
      var done = document.createElement("div");
      done.setAttribute("role", "status");
      done.tabIndex = -1;
      done.className = "border border-hull bg-deep p-8 outline-none sm:p-10";
      done.innerHTML = '<p class="font-display text-2xl font-semibold"></p><p class="mt-3 text-mist"></p>';
      done.children[0].textContent = copy.previewTitle;
      done.children[1].textContent = copy.previewBody;
      form.replaceWith(done);
      done.focus();
    });
  }
})();

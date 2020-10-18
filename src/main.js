/**
 * Copyright (c) 2020 Google Inc
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const exposed = {};
if (location.search) {
  var a = document.createElement("a");
  a.href = location.href;
  a.search = "";
  history.replaceState(null, null, a.href);
}

function tweet_(url) {
  open(
    "https://twitter.com/intent/tweet?url=" + encodeURIComponent(url),
    "_blank"
  );
}
function tweet(anchor) {
  tweet_(anchor.getAttribute("href"));
}
expose("tweet", tweet);

function share(anchor) {
  var url = anchor.getAttribute("href");
  event.preventDefault();
  if (navigator.share) {
    navigator.share({
      url: url,
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(url);
    message("Article URL copied to clipboard.");
  } else {
    tweet_(url);
  }
}
expose("share", share);

function message(msg) {
  var dialog = document.getElementById("message");
  dialog.textContent = msg;
  dialog.setAttribute("open", "");
  setTimeout(function () {
    dialog.removeAttribute("open");
  }, 3000);
}

function prefetch(e) {
  if (e.target.tagName != "A") {
    return;
  }
  if (e.target.origin != location.origin) {
    return;
  }
  var l = document.createElement("link");
  l.rel = "prefetch";
  l.href = e.target.href;
  document.head.appendChild(l);
}
document.documentElement.addEventListener("mouseover", prefetch, {
  capture: true,
  passive: true,
});
document.documentElement.addEventListener("touchstart", prefetch, {
  capture: true,
  passive: true,
});

const GA_ID = document.documentElement.getAttribute("ga-id");
window.ga =
  window.ga ||
  function () {
    if (!GA_ID) {
      return;
    }
    (ga.q = ga.q || []).push(arguments);
  };
ga.l = +new Date();
ga("create", GA_ID, "auto");
ga("set", "transport", "beacon");
var timeout = setTimeout(
  (onload = function () {
    clearTimeout(timeout);
    ga("send", "pageview");
  }),
  1000
);

var ref = +new Date();
function ping(event) {
  var now = +new Date();
  if (now - ref < 1000) {
    return;
  }
  ga("send", {
    hitType: "event",
    eventCategory: "page",
    eventAction: event.type,
    eventLabel: Math.round((now - ref) / 1000),
  });
  ref = now;
}
addEventListener("pagehide", ping);
addEventListener("visibilitychange", ping);
addEventListener(
  "click",
  function (e) {
    var button = e.target.closest("button");
    if (!button) {
      return;
    }
    ga("send", {
      hitType: "event",
      eventCategory: "button",
      eventAction: button.getAttribute("aria-label") || button.textContent,
    });
  },
  true
);
var selectionTimeout;
addEventListener(
  "selectionchange",
  function () {
    clearTimeout(selectionTimeout);
    var text = String(document.getSelection()).trim();
    if (text.split(/[\s\n\r]+/).length < 3) {
      return;
    }
    selectionTimeout = setTimeout(function () {
      ga("send", {
        hitType: "event",
        eventCategory: "selection",
        eventAction: text,
      });
    }, 2000);
  },
  true
);

if (window.ResizeObserver && document.querySelector("header nav #nav")) {
  var progress = document.getElementById("reading-progress");

  var timeOfLastScroll = 0;
  var requestedAniFrame = false;
  function scroll() {
    if (!requestedAniFrame) {
      requestAnimationFrame(updateProgress);
      requestedAniFrame = true;
    }
    timeOfLastScroll = Date.now();
  }
  addEventListener("scroll", scroll);

  var winHeight = 1000;
  var bottom = 10000;
  function updateProgress() {
    requestedAniFrame = false;
    var percent = Math.min(
      (document.scrollingElement.scrollTop / (bottom - winHeight)) * 100,
      100
    );
    progress.style.transform = `translate(-${100 - percent}vw, 0)`;
    if (Date.now() - timeOfLastScroll < 3000) {
      requestAnimationFrame(updateProgress);
      requestedAniFrame = true;
    }
  }

  new ResizeObserver(() => {
    bottom =
      document.scrollingElement.scrollTop +
      document.querySelector("#comments,footer").getBoundingClientRect().top;
    winHeight = window.innerHeight;
    scroll();
  }).observe(document.body);
}

function expose(name, fn) {
  exposed[name] = fn;
}

function dialog() {
  const button = document.querySelector('button');
  const dialog = document.querySelector('dialog');

  if (button.value === 'initial') {
    button.value = 'clickeddy';
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 30"><g fill="none" fill-rule="evenodd"><path d="M0 0h38v30H0z"/><path fill="#FFF" fill-rule="nonzero" d="M19 0a15 15 0 110 30 15 15 0 010-30zm0 1.77C11.54 1.77 5.49 7.7 5.49 15c0 7.3 6.05 13.23 13.51 13.23S32.51 22.3 32.51 15c0-7.3-6.05-13.23-13.51-13.23zm6.36 6.68c.4.4.43 1.03.09 1.47l-.09.1-4.89 4.88 4.9 4.9a1.1 1.1 0 01-1.48 1.65l-.1-.09-4.88-4.89-4.9 4.9a1.1 1.1 0 01-1.65-1.48l.09-.1 4.9-4.88-4.9-4.9a1.1 1.1 0 011.47-1.65l.1.09 4.89 4.9 4.89-4.9a1.1 1.1 0 011.56 0z"/></g></svg>';
  } else {
    button.value = "initial"
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 30"><path fill="#FFF" fill-rule="nonzero" d="M2.92 29.1l6.43-10.14a1.25 1.25 0 012.23.26l1.2 3.48 7.86-11.94c.24-.36.62-.58 1.07-.56.43 0 .82.23 1.04.6l11.51 19.03.05-.05a18.65 18.65 0 003.07-10.3A18.63 18.63 0 0018.82.84 18.63 18.63 0 00.26 19.5c0 3.34.89 6.61 2.57 9.47.02.05.06.1.1.14z"/></svg>';
  }

  dialog.toggleAttribute('open');
}
expose("dialog", dialog);

addEventListener("click", (e) => {
  const handler = e.target.closest("[on-click]");
  if (!handler) {
    return;
  }
  e.preventDefault();
  const name = handler.getAttribute("on-click");
  const fn = exposed[name];
  if (!fn) {
    throw new Error("Unknown handler" + name);
  }
  fn(handler);
});


// There is a race condition here if an image loads faster than this JS file. But
// - that is unlikely
// - it only means potentially more costly layouts for that image.
// - And so it isn't worth the querySelectorAll it would cost to synchronously check
//   load state.
document.body.addEventListener(
  "load",
  (e) => {
    if (e.target.tagName != "IMG") {
      return;
    }
    // Ensure the browser doesn't try to draw the placeholder when the real image is present.
    e.target.style.backgroundImage = "none";
  },
  /* capture */ "true"
);

const lists = document.querySelectorAll('.post-list');

lists.forEach(el => {
  const listItems = el.querySelectorAll('.post-list__item');
  const n = el.children.length;
  el.style.setProperty('--post-total', n);
});

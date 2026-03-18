// If you want some action to be taken before clicking on a cached image,
// you can set this variable to a function that takes three values:
// 1: The default action to show the cached image.
// 2: The <a> element we're working with.
// 3: The URL of the cached image.
var linkShotPreAction = false;

function linkShotHoverLink(e, elem, image) {
  // Already exists.
  if (document.getElementById(image))
    return;

  elem.style.position = "relative";
  var wrap = document.createElement("div");
  wrap.classList.add("link-shot-hover-wrap");
  var img = document.createElement("img");
  wrap.appendChild(img);

  // Just about any character is allowed in IDs in HTML5, so just use
  // the URL as the ID.
  wrap.id = image;
  var thumb = image.replace(/(-scaled)?([.][^.]+)$/, "-150x150$2");
  img.onload = function() {
    wrap.classList.add("link-shot-hover-fade-in");
  };
  img.src = thumb;

  function linkShotGetOffsetPos(elem) {
    var offsetLeft = 0;
    var offsetTop = 0;
    while (elem) {
      offsetLeft += elem.offsetLeft;
      offsetTop += elem.offsetTop;
      elem = elem.offsetParent;
    }
    return [offsetLeft, offsetTop];
  }

  // Put a thumbnail of the cached image over the link.
  var pos = linkShotGetOffsetPos(elem);
  var left = pos[0];
  wrap.style.top = "-180px";
  wrap.style.left = e.pageX - left - 90 + "px";
 
  // Format the cached time in a pretty way.
  var time = elem.getAttribute("data-cached-time");
  if (!time)
    time = elem.getAttribute("time");
  var timeParsed = new Date(time);
  var options = {  
    year: "numeric", month: "long",  
    day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
  };  
  var fTime = timeParsed.toLocaleTimeString("en-us", options);   

  wrap.title = "Click to view static version of the web page" +
    (time? " (cached time: " + fTime + ")": "");

  var go = function() {
    var takeover = document.createElement("div");
    takeover.id = "takeover";
    takeover.className = "link-shot-takeover";
    takeover.innerHTML = "<button class='link-shot-takeover__close'><img data-close src='/wp-content/plugins/link-shot/close-circle.svg'></button>";
    var inner = document.createElement("div");
    inner.className = "link-shot-takeover__inner";
    takeover.appendChild(inner);

    inner.innerHTML =
      "Original Link: <a href='" + elem.href + "'>" + elem.href +
      "</a>; <a href='" + image + "'>page cached " + fTime + "</a>.<p>" +
      "<img class='link-shot-cached' src='" + image + "'>";

    var previouslyFocused = null;

    document.body.appendChild(takeover);
    openTakeover();
    
    function onKeyDown(event) {
      if (!takeover.classList.contains("link-shot-is-open"))
	return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeTakeover();
        return;
      }
    }

    function openTakeover() {
      previouslyFocused = document.activeElement;
      takeover.classList.add("link-shot-is-open");
      document.body.classList.add("link-shot-no-scroll");

      // Focus the takeover so keyboard input goes there.
      takeover.querySelector("button").focus();
    }

    function closeTakeover() {
      document.body.classList.remove("link-shot-no-scroll");
      var elem = document.getElementById("takeover");
      elem.parentNode.removeChild(elem);

      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    }

    takeover.addEventListener("click", (event) => {
      if (event.target.matches("[data-close]")) {
        closeTakeover();
      }
    });

    document.addEventListener("keydown", onKeyDown, true);
  };

  wrap.onclick = function(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    if (linkShotPreAction)
      linkShotPreAction(go, elem, image);
    else
      go();

    return false;
  };

  elem.appendChild(wrap);
  elem.onmouseleave = function() {
    wrap.classList.add("link-shot-hover-fade-out");
    // Allow a new hovering to happen before this one is removed.
    wrap.id = "";
    setTimeout(function() {
      if (wrap.parentNode)
	wrap.parentNode.removeChild(wrap);
    }, 500);
  };
}

document.addEventListener(
  "DOMContentLoaded",
  function() {
    // Find all links that have cached images.
    document.querySelectorAll("a").forEach(function(a) {
      var link = a.getAttribute("href");
      if (!link)
	return;

      var image = a.getAttribute("data-cached-image");
      // The Wordpress plugin that checks for broken links rewrites
      // the element and removes the "data-cached-" prefix from the
      // elements!  Like, what...
      if (!image)
	image = a.getAttribute("image");

      // This isn't a link with a cached image, so just bail.      
      if (!image)
	return;

      // We have an <a> with a cached image, so display a thumbnail
      // when we're hovering over the link.
      a.addEventListener('mouseenter', function(e) {
	linkShotHoverLink(e, a, image);
      });
    });
  }
);

// Legacy function from earlier versions of this package.
function hoverLink(e) {
}

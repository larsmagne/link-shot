// If you want some action to be taken before clicking on a cached image,
// you can set this variable to a function that takes three values:
// 1: The default action to show the cached image.
// 2: The <a> element we're working with.
// 3: The URL of the cached image.
var linkShotPreAction = false;

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

// Legacy function.
function hoverLink(e) {
}

function linkShotHoverLink(elem, image) {
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

  // Put a thumbnail of the cached image over the link.
  var pos = linkShotGetOffsetPos(elem);
  var left = pos[0];
  wrap.style.top = "-180px";
  wrap.style.left = (elem.offsetWidth / 2) - 90 + "px";

  // Format the cached time in a pretty way.
  var time = elem.getAttribute("data-cached-time");
  if (! time)
    time = elem.getAttribute("time");
  var timeParsed = new Date(time);
  let options = {  
    year: "numeric", month: "long",  
    day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
  };  
  let fTime = timeParsed.toLocaleTimeString("en-us", options);   

  wrap.title = "Click to view static version of the web page" +
    (time? " (cached time: " + fTime + ")": "");

  var go = function() {
    var takeover = document.createElement("div");
    takeover.id = "takeover";
    takeover.className = "takeover";
    takeover.innerHTML = "<button class='takeover__close'><img data-close src='/wp-content/plugins/link-shot/close-circle.svg'></button>";
    var inner = document.createElement("div");
    inner.className = "takeover__inner";
    takeover.appendChild(inner);

    inner.innerHTML =
      "Original Link: <a href='" + elem.href + "'>" + elem.href +
      "</a>; <a href='" + image + "'>page cached " + fTime + "</a>.<p>" +
      "<img class='cached' src='" + image + "'>";

    let previouslyFocused = null;

    document.body.appendChild(takeover);
    openTakeover();
    
    function onKeyDown(event) {
      if (!takeover.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeTakeover();
        return;
      }
    }

    function openTakeover() {
      previouslyFocused = document.activeElement;

      takeover.hidden = false;
      takeover.classList.add("is-open");
      document.body.classList.add("no-scroll");

      // Focus the takeover so keyboard input goes there
      requestAnimationFrame(() => {
        const autoFocusTarget =
              takeover.querySelector("[autofocus], button, input, select, textarea, [tabindex]:not([tabindex='-1'])");
        (autoFocusTarget || takeover).focus();
      });
    }

    function closeTakeover() {
      takeover.classList.remove("is-open");
      takeover.hidden = true;
      document.body.classList.remove("no-scroll");

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
      if (! image)
	image = a.getAttribute("image");

      // This isn't a link with a cached image, so just bail.      
      if (! image)
	return;

      // We have an <a> with a cached image, so display a thumbnail
      // when we're hovering over the link.
      a.addEventListener('mouseenter', function() {
	linkShotHoverLink(a, image);
      });
    });
  }
);


linkShotPreAction = function(go, elem, image) {
  jQuery(elem).off("click");
  jQuery.ajax({
    url: "/wp-content/plugins/wse/visit.php",
    type: "POST",
    data: {
      "click": image,
      "page": window.location.href
    },
    dataType: "json",
    success: go,
    error: go
  });
};

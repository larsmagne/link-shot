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
    window.history.pushState("link-shot", "", image);
    for (var i = 0; i < document.styleSheets.length; i++)
      document.styleSheets[i].disabled = true;
    document.getElementsByTagName("body")[0].innerHTML =
      "<style> body { background: #d0d0d0; font-family: sans-serif; margin: 20px; text-align: center; } img { box-shadow: 0 30px 40px rgba(0,0,0,1); } </style>" +
      "Original Link: <a href='" + elem.href + "'>" + elem.href +
      "</a>; <a href='" + image + "'>page cached " + fTime + "</a>.<p>" +
      "<img src='" + image + "'>";
    window.scrollTo(0, 0);
    window.addEventListener("popstate", function() {
      window.location.reload();
    });
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

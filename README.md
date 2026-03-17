Link Shot is a tiny Wordpress plugin to display screenshots of linked
web pages.

It works by looking at data in the links.  It would typically look
like this:

```
<a href="https://github.com/larsmagne/ewp" data-cached-time="2026-03-17T21:21:05" data-cached-image="https://lars.ingebrigtsen.no/wp-content/uploads/2026/03/cache-2026-03-17-web.webp">Emacs-based Wordpress interface</a>
```

That is, there's two extra attributes to the element:
data-cached-image, which should be an URL that points to an image, and
data-cached-time, which says when that image was created.

The idea here is that whenever you link to an external site, you take
a screenshot of that site, or have your Wordpress software do that
automatically.  For an example of such software [see
ewp](https://github.com/larsmagne/ewp).

If you then use this plugin, Wordpress will display this to the user
when hovering over the link, and you can then click on the thumbnail
to view the screenshot.

This helps with avoiding link rot -- people who read your blog will
always be able to understand what you're talking about, even if the
site you're linking to has died in the meantime.

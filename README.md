# jquery-svgpan

This is an an adaptation of Andrea Leofreddi's [SVGPan library][],
version 1.2.2, for use as a [jQuery][] plugin.

 [SVGPan library]: http://code.google.com/p/svgpan/
 [jQuery]: http://jquery.org/

When called upon SVG element(s), this will add all the capabilities of
Andrea Leofreddi's SVGPan library to those elements.  Non-SVG elements
will be silently ignored.

This is useful if you have SVG content sitting in the DOM.  For
example, if you are generating graphics via the [d3 visualization][]
library.  It will not work if you are embedding the SVG through some
other means.

 [d3 visualization]: http://mbostock.github.com/d3/

[See it in action!](http://talos.github.com/jquery-svgpan/demo.html)

### Usage

You can configure the behaviour of the pan/zoom/drag by passing
arguments.

* `viewportId`: String ID of the root SVG element.
* `enablePan`: Boolean enable or disable panning (default enabled)
* `enableZoom`: Boolean enable or disable zooming (default enabled)
* `enableDrag`: Boolean enable or disable dragging (default disabled)
* `zoomScale`: Float zoom sensitivity, defaults to .2

```javascript
    $(selector).svgPan(viewportId, enablePan, enableZoom, enableDrag, zoomScale);
```

### Examples

This would enable SVGPan for all SVGs currently on the page.  The
element `#viewport` would be used as the viewport for each.

```javascript
    $('svg').svgPan('viewport');
```

This would enable SVGPan for a single element (provided it is an SVG).

```javascript
   $('#id').svgPan('viewport');
```

### Links

Andrea Leofreddi's original SVGPan library on Google code

* <http://code.google.com/p/svgpan/>

Fork jquery-svgpan at

* <http://www.github.com/talos/jquery-svgpan>

CDN jquery-svgpan from

* <http://talos.github.com/jquery-svgpan/jquery-svgpan.js>

* <http://talos.github.com/jquery-svgpan/jquery-svgpan.min.js>

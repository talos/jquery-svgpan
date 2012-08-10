/**
   THIS LICENSE IS FOR JQUERY-SVGPAN.  The original SVGPan library,
   from which it derived, is governed by the second license below.

   Copyright 2012 John Krauss. All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

   1. Redistributions of source code must retain the above copyright
   notice, this list of conditions and the following disclaimer.

   2. Redistributions in binary form must reproduce the above
   copyright notice, this list of conditions and the following
   disclaimer in the documentation and/or other materials provided
   with the distribution.

   THIS SOFTWARE IS PROVIDED BY JOHN KRAUSS ''AS IS'' AND ANY EXPRESS
   OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
   ARE DISCLAIMED. IN NO EVENT SHALL JOHN KRAUSS OR CONTRIBUTORS BE
   LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
   CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
   OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
   BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
   USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
   DAMAGE.

   The views and conclusions contained in the software and
   documentation are those of the authors and should not be
   interpreted as representing official policies, either expressed or
   implied, of John Krauss.
**/

// SVGPan library 1.2.2 license and documentation:

/** 
 *  SVGPan library 1.2.2
 * ======================
 *
 * Given an unique existing element with id "viewport" (or when missing, the 
 * first g-element), including the the library into any SVG adds the following 
 * capabilities:
 *
 *  - Mouse panning
 *  - Mouse zooming (using the wheel)
 *  - Object dragging
 *
 * You can configure the behaviour of the pan/zoom/drag with the variables
 * listed in the CONFIGURATION section of this file.
 *
 * Known issues:
 *
 *  - Zooming (while panning) on Safari has still some issues
 *
 * Releases:
 *
 * 1.2.2, Tue Aug 30 17:21:56 CEST 2011, Andrea Leofreddi
 *    - Fixed viewBox on root tag (#7)
 *    - Improved zoom speed (#2)
 *
 * 1.2.1, Mon Jul  4 00:33:18 CEST 2011, Andrea Leofreddi
 *    - Fixed a regression with mouse wheel (now working on Firefox 5)
 *    - Working with viewBox attribute (#4)
 *    - Added "use strict;" and fixed resulting warnings (#5)
 *    - Added configuration variables, dragging is disabled by default (#3)
 *
 * 1.2, Sat Mar 20 08:42:50 GMT 2010, Zeng Xiaohui
 *    Fixed a bug with browser mouse handler interaction
 *
 * 1.1, Wed Feb  3 17:39:33 GMT 2010, Zeng Xiaohui
 *    Updated the zoom code to support the mouse wheel on Safari/Chrome
 *
 * 1.0, Andrea Leofreddi
 *    First release
 *
 * This code is licensed under the following BSD license:
 *
 * Copyright 2009-2010 Andrea Leofreddi <a.leofreddi@itcharm.com>. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY Andrea Leofreddi ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Andrea Leofreddi OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Andrea Leofreddi.
 */

/*global define, jQuery, window*/

(function (factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    "use strict";
    var init = function (root, gViewport, gReset, gZoomIn, gZoomOut, enablePan, enableZoom, enableDrag, zoomScale) {

        var state = 'none',
            stateTarget,
            stateOrigin,
            stateTf,
            $root = $(root),
            isMouseOverElem = false,

            /**
             * Instance an SVGPoint object with given event coordinates.
             */
            getEventPoint = function (event) {
                var p = root.createSVGPoint();
                p.x = event.offsetX;
                p.y = event.offsetY;
                return p;
            },

            /**
             * Sets the current transform matrix of an element.
             */
            setCTM = function (element, matrix) {
                var s = "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + matrix.e + "," + matrix.f + ")";
                element.setAttribute("transform", s);
            },

            /**
             * Handle mouseenter event.  This has been added to stop ignoring
             * inputs when the mouse is over the element.
             **/
            handleMouseEnter = function (event) {
                isMouseOverElem = true;
            },

            /**
             * Handle mouseleave event.  This has been added to ignore
             * inputs when the mouse is not over the element.
             **/
            handleMouseLeave = function (event) {
                isMouseOverElem = false;
            },

            /**
             * Handle mouse wheel event.
             */
            handleMouseWheel = function (event, delta, deltaX, deltaY) {

                if (!enableZoom || !isMouseOverElem) {
                    return;
                }

                delta = delta / 3;  // Scale this down from what jQuery sends us...

                var z = Math.pow(1 + zoomScale, delta),
                    p = getEventPoint(event),
                    k, m;

                if (event.originalEvent.target.nodeType === 3) {

                    p.x = $(event.target).position().left - $root.position().left;
                    p.y = $(event.target).position().top - $root.position().top;
                    p = p.matrixTransform(gViewport.getCTM().inverse());
                    p.x += event.offsetX;
                    p.y += event.offsetY;
                }

                p = p.matrixTransform(gViewport.getCTM().inverse());
                k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);
                m = gViewport.getCTM().multiply(k);
                setCTM(gViewport, m);

                event.stopPropagation();
                event.preventDefault();
            },

            /**
             * Handle mouse move event.
             */
            handleMouseMove = function (event) {
                var p;

                if (state === 'pan' && enablePan) {
                    p = getEventPoint(event).matrixTransform(stateTf);
                    setCTM(gViewport, stateTf.inverse().translate(p.x - stateOrigin.x, p.y - stateOrigin.y));
                } else if (state === 'drag' && enableDrag) {
                    p = getEventPoint(event).matrixTransform(gViewport.getCTM().inverse());
                    setCTM(stateTarget, root.createSVGMatrix().translate(p.x - stateOrigin.x, p.y - stateOrigin.y).multiply(gViewport.getCTM().inverse()).multiply(stateTarget.getCTM()));
                    stateOrigin = p;
                }

                event.stopPropagation();
                event.preventDefault();
            },

            /**
             * Handle click event.
             */
            handleMouseDown = function (event) {
                // Pan anyway when drag is disabled and the user clicked on an element
                if (event.target.tagName === "svg" || !enableDrag) {
                    state = 'pan';
                    stateTf = gViewport.getCTM().inverse();
                    stateOrigin = getEventPoint(event).matrixTransform(stateTf);
                } else {
                    state = 'drag';
                    stateTarget = event.target;
                    stateTf = gViewport.getCTM().inverse();
                    stateOrigin = getEventPoint(event).matrixTransform(stateTf);
                }

                event.stopPropagation();
                event.preventDefault();
            },

            /**
             * Handle mouse button release event.
             */
            handleMouseUp = function (event) {
                state = 'none';

                event.stopPropagation();
                event.preventDefault();
            },

            /**
             * Handle clicking events.
             */
            handleResetClick = function (event) {
                setCTM(gViewport, root.createSVGMatrix());

                event.stopPropagation();
                event.preventDefault();
            },

            handleZoomInClick = function (event) {
                if (!enableZoom) {
                    return;
                }

                var z = Math.pow(1 + zoomScale, 1),
                    p = root.createSVGPoint(),
                    k, m;

                p.x = $root.width() / 2;
                p.y = $root.height() / 2;

                p = p.matrixTransform(gViewport.getCTM().inverse());
                k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);
                m = gViewport.getCTM().multiply(k);
                setCTM(gViewport, m);

                event.stopPropagation();
                event.preventDefault();
            },

            handleZoomOutClick = function (event) {
                if (!enableZoom) {
                    return;
                }

                var z = Math.pow(1 + zoomScale, -1),
                    p = root.createSVGPoint(),
                    k, m;

                p.x = $root.width() / 2;
                p.y = $root.height() / 2;

                p = p.matrixTransform(gViewport.getCTM().inverse());
                k = root.createSVGMatrix().translate(p.x, p.y).scale(z).translate(-p.x, -p.y);
                m = gViewport.getCTM().multiply(k);
                setCTM(gViewport, m);

                event.stopPropagation();
                event.preventDefault();
            };

        /**
         * Register handlers
         */
        $root.mouseup(handleMouseUp);
        $root.mousedown(handleMouseDown);
        $root.mousemove(handleMouseMove);
        $root.mouseenter(handleMouseEnter);
        $root.mouseleave(handleMouseLeave);
        $root.mousewheel(handleMouseWheel);

        if (gReset) {
            $(gReset).click(handleResetClick);
        }

        if (gZoomIn) {
            $(gZoomIn).click(handleZoomInClick);
        }

        if (gZoomOut) {
            $(gZoomOut).click(handleZoomOutClick);
        }
    };

    $.fn.svgPan = function (viewportId, resetId, zoomInId, zoomOutId, enablePan, enableZoom, enableDrag, zoomScale) {
        enablePan = typeof enablePan !== 'undefined' ? enablePan : true;
        enableZoom = typeof enableZoom !== 'undefined' ? enableZoom : true;
        enableDrag = typeof enableDrag !== 'undefined' ? enableDrag : false;
        zoomScale = typeof zoomScale !== 'undefined' ? zoomScale : 0.2;

        return $.each(this, function (i, el) {

            var svg, viewport, reset, zoomIn, zoomOut,
                $el = $(el);

            //
            // BUG? I don't see the data having SVGPan set anywhere...
            //
            if ($el.is('svg') && $el.data('SVGPan') !== true) {

                viewport = $el.find('#' + viewportId)[0];
                reset = $el.find('#' + resetId)[0];
                zoomIn = $el.find('#' + zoomInId)[0];
                zoomOut = $el.find('#' + zoomOutId)[0];

                if (viewport) {
                    init($el[0], viewport, reset, zoomIn, zoomOut, enablePan, enableZoom, enableDrag, zoomScale);
                } else {
                    throw "Could not find viewport with id #" + viewport;
                }
            }
        });
    };
}));

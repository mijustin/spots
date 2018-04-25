/* Carrd Core JS | carrd.co | License: MIT */

var	on = addEventListener,
	$ = function(q) { return document.querySelector(q) },
	$$ = function(q) { return document.querySelectorAll(q) },
	$body = document.body,
	$inner = $('.inner'),
	client = (function() {

		var o = {
				browser: 'other',
				browserVersion: 0,
				os: 'other',
				osVersion: 0,
				canUse: null
			},
			ua = navigator.userAgent,
			a, i;

		// browser, browserVersion.
			a = [
				['firefox',		/Firefox\/([0-9\.]+)/],
				['edge',		/Edge\/([0-9\.]+)/],
				['safari',		/Version\/([0-9\.]+).+Safari/],
				['chrome',		/Chrome\/([0-9\.]+)/],
				['ie',			/Trident\/.+rv:([0-9]+)/]
			];

			for (i=0; i < a.length; i++) {

				if (ua.match(a[i][1])) {

					o.browser = a[i][0];
					o.browserVersion = parseFloat(RegExp.$1);

					break;

				}

			}

		// os, osVersion.
			a = [
				['ios',			/([0-9_]+) like Mac OS X/,			function(v) { return v.replace('_', '.').replace('_', ''); }],
				['ios',			/CPU like Mac OS X/,				function(v) { return 0 }],
				['android',		/Android ([0-9\.]+)/,				null],
				['mac',			/Macintosh.+Mac OS X ([0-9_]+)/,	function(v) { return v.replace('_', '.').replace('_', ''); }],
				['windows',		/Windows NT ([0-9\.]+)/,			null]
			];

			for (i=0; i < a.length; i++) {

				if (ua.match(a[i][1])) {

					o.os = a[i][0];
					o.osVersion = parseFloat( a[i][2] ? (a[i][2])(RegExp.$1) : RegExp.$1 );

					break;

				}

			}

		// canUse.
			var _canUse = document.createElement('div');

			o.canUse = function(p) {

				var e = _canUse.style,
					up = p.charAt(0).toUpperCase() + p.slice(1);

				return	(
							p in e
						||	('Moz' + up) in e
						||	('Webkit' + up) in e
						||	('O' + up) in e
						||	('ms' + up) in e
				);

			};

		return o;

	}()),
	trigger = function(t) {

		if (client.browser == 'ie') {

			var e = document.createEvent('Event');
			e.initEvent(t, false, true);
			dispatchEvent(e);

		}
		else
			dispatchEvent(new Event(t));

	};

// Animation.
	on('load', function() {
		setTimeout(function() {
			$body.className = $body.className.replace(/\bis-loading\b/, 'is-playing');

			setTimeout(function() {
				$body.className = $body.className.replace(/\bis-playing\b/, 'is-ready');
			}, 1500);
		}, 100);
	});

// Sections.
	(function() {

		var initialSection, initialScrollPoint, initialId,
			h, e, ee, k,
			locked = false,
			initialized = false,
			doScrollTop = function() {
				scrollTo(0, 0);
			},
			doScroll = function(e, instant) {

				var pos;

				// Determine position.
					switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : 'default') {

						case 'default':
						default:

							pos = e.offsetTop;

							break;

						case 'center':

							if (e.offsetHeight < window.innerHeight)
								pos = e.offsetTop - ((window.innerHeight - e.offsetHeight) / 2);
							else
								pos = e.offsetTop;

							break;

						case 'previous':

							if (e.previousElementSibling)
								pos = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight;
							else
								pos = e.offsetTop;

							break;

					}

				// Scroll.
					if ('scrollBehavior' in $body.style
					&&	initialized
					&&	!instant)
						scrollTo({
							behavior: 'smooth',
							left: 0,
							top: pos
						});
					else
						scrollTo(0, pos);

			};

		// Initialize.

			// Set scroll restoration to manual.
				if ('scrollRestoration' in history)
					history.scrollRestoration = 'manual';

			// Show initial section.

				// Determine target.
					h = location.hash ? location.hash.substring(1) : null;

					if (h && !h.match(/^[a-zA-Z]/))
						h = 'x' + h;

					// Scroll point.
						if (e = $('[data-scroll-id="' + h + '"]')) {

							initialScrollPoint = e;
							initialSection = initialScrollPoint.parentElement;
							initialId = initialSection.id;

						}

					// Section.
						else if (e = $('#' + (h ? h : 'home') + '-section')) {

							initialScrollPoint = null;
							initialSection = e;
							initialId = initialSection.id;

						}

				// Deactivate all sections (except initial).
					ee = $$('section:not([id="' + initialId + '"])');

					for (k = 0; k < ee.length; k++) {

						ee[k].className = 'inactive';
						ee[k].style.display = 'none';

					}

				// Activate initial section.
					initialSection.classList.add('active');

			 	// Scroll to top.
			 		doScrollTop();

			// Load event.
				on('load', function() {

					// Scroll to initial scroll point (if applicable).
				 		if (initialScrollPoint)
							doScroll(initialScrollPoint);

					// Mark as initialized.
						initialized = true;

				});

		// Hashchange event.
			on('hashchange', function(event) {

				var section, scrollPoint, id, sectionHeight, currentSection, currentSectionHeight,
					h, e, ee, k;

				// Lock.
					if (locked)
						return false;

				// Determine target.
					h = location.hash ? location.hash.substring(1) : null;

					// Scroll point.
						if (e = $('[data-scroll-id="' + h + '"]')) {

							scrollPoint = e;
							section = scrollPoint.parentElement;
							id = section.id;

						}

					// Section.
						else if (e = $('#' + (h ? h : 'home') + '-section')) {

							scrollPoint = null;
							section = e;
							id = section.id;

						}

					// Bail.
						else
							return false;

				// No section? Bail.
					if (!section)
						return false;

				// Section already active?
					if (!section.classList.contains('inactive')) {

					 	// Scroll to scroll point (if applicable).
					 		if (scrollPoint)
								doScroll(scrollPoint);

						// Otherwise, just scroll to top.
							else
							 	doScrollTop();

						// Bail.
							return false;

					}

				// Otherwise, activate it.
					else {

						// Lock.
							locked = true;

						// Clear "home" URL hash.
							if (location.hash == '#home')
								history.replaceState(null, null, '#');

						// Deactivate current section.
							currentSection = $('section:not(.inactive)');

							if (currentSection) {

								// Deactivate.
									currentSection.classList.add('inactive');

								// Hide.
									setTimeout(function() {
										currentSection.style.display = 'none';
										currentSection.classList.remove('active');
									}, 125);

							}

						// Activate target section.
							setTimeout(function() {

								// Show.
									section.style.display = '';

								// Trigger 'resize' event.
									trigger('resize');

								// Scroll to top.
									doScrollTop();

								// Delay.
									setTimeout(function() {

										// Activate.
											section.classList.remove('inactive');
											section.classList.add('active');

										// Delay.
											setTimeout(function() {

											 	// Scroll to scroll point (if applicable).
											 		if (scrollPoint)
														doScroll(scrollPoint, true);

												// Unlock.
													locked = false;

											}, 250);

									}, 75);

							}, 125);

					}

				return false;

			});

			// Hack: Allow hashchange to trigger on click even if the target's href matches the current hash.
				on('click', function(event) {

					var t = event.target;

					// Target is an image and its parent is a link? Switch target to parent.
						if (t.tagName == 'IMG'
						&&	t.parentElement
						&&	t.parentElement.tagName == 'A')
							t = t.parentElement;

					// Target is an anchor *and* its href is a hash that matches the current hash?
						if (t.tagName == 'A'
						&&	t.getAttribute('href').substr(0, 1) == '#'
						&&	t.hash == window.location.hash) {

							// Prevent default.
								event.preventDefault();

							// Replace state with '#'.
								history.replaceState(undefined, undefined, '#');

							// Replace location with target hash.
								location.replace(t.hash);

						}

				});

	})();

// Browser hacks.

	// Init.
		var style, sheet, rule;

		// Create <style> element.
			style = document.createElement('style');
			style.appendChild(document.createTextNode(''));
			document.head.appendChild(style);

		// Get sheet.
			sheet = style.sheet;

	// Android.
		if (client.os == 'android') {

			// Prevent background "jump" when address bar shrinks.
			// Specifically, this fix forces the background pseudoelement to a fixed height based on the physical
			// screen size instead of relying on "vh" (which is subject to change when the scrollbar shrinks/grows).
				(function() {

					// Insert and get rule.
						sheet.insertRule('body::after { }', 0);
						rule = sheet.cssRules[0];

					// Event.
						var f = function() {
							rule.style.cssText = 'height: ' + (Math.max(screen.width, screen.height)) + 'px';
						};

						on('load', f);
						on('orientationchange', f);
						on('touchmove', f);

				})();

		}

	// iOS.
		else if (client.os == 'ios') {

			// Prevent white bar below background when address bar shrinks.
			// For some reason, simply forcing GPU acceleration on the background pseudoelement fixes this.
				(function() {

					// Insert and get rule.
						sheet.insertRule('body::after { }', 0);
						rule = sheet.cssRules[0];

					// Set rule.
						rule.style.cssText = '-webkit-transform: scale(1.0)';

				})();

			// Prevent white bar below background when form inputs are focused.
			// Fixed-position elements seem to lose their fixed-ness when this happens, which is a problem
			// because our backgrounds fall into this category.
				(function() {

					// Insert and get rule.
						sheet.insertRule('body.ios-focus-fix::before { }', 0);
						rule = sheet.cssRules[0];

					// Set rule.
						rule.style.cssText = 'height: calc(100% + 60px)';

					// Add event listeners.
						on('focus', function(event) {
							$body.classList.add('ios-focus-fix');
						}, true);

						on('blur', function(event) {
							$body.classList.remove('ios-focus-fix');
						}, true);

				})();

		}

	// IE.
		else if (client.browser == 'ie') {

			// Flexbox workaround.
			// IE's flexbox implementation doesn't work when 'min-height' is used, so we can work around this
			// by switching to 'height' but simulating the behavior of 'min-height' via JS.
				(function() {
					var t, f;

					// Handler function.
						f = function() {

							var mh, h, s, xx, x, i;

							// Wrapper.
								x = $('#wrapper');

								x.style.height = 'auto';

								if (x.scrollHeight <= innerHeight)
									x.style.height = '100vh';

							// Containers with full modifier.
								xx = $$('.container.full');

								for (i=0; i < xx.length; i++) {

									x = xx[i];
									s = getComputedStyle(x);

									// Get min-height.
										x.style.minHeight = '';
										x.style.height = '';

										mh = s.minHeight;

									// Get height.
										x.style.minHeight = 0;
										x.style.height = '';

										h = s.height;

									// Zero min-height? Do nothing.
										if (mh == 0)
											continue;

									// Set height.
										x.style.height = (h > mh ? 'auto' : mh);

								}

						};

					// Do an initial call of the handler.
						(f)();

					// Add event listeners.
						on('resize', function() {

							clearTimeout(t);

							t = setTimeout(f, 250);

						});

						on('load', f);

				})();

		}

	// Object-fit polyfill for Image elements.
		if (!client.canUse('object-fit')) {

			var xx = $$('.image[data-position]'),
				x, c, i, src;

			for (i=0; i < xx.length; i++) {

				// Element, img.
					x = xx[i];
					c = x.firstChild;

					if (c.tagName != 'IMG')
						c = c.firstChild;

				// Get src.
					if (c.parentNode.classList.contains('deferred')) {

						c.parentNode.classList.remove('deferred');
						src = c.getAttribute('data-src');
						c.removeAttribute('data-src');

					}
					else
						src = c.getAttribute('src');

				// Set src as background.
					c.style['backgroundImage'] = 'url(\'' + src + '\')';
					c.style['backgroundSize'] = 'cover';
					c.style['backgroundPosition'] = x.dataset.position;
					c.style['backgroundRepeat'] = 'no-repeat';

				// Clear src.
					c.src = 'data:image/svg+xml;charset=utf8,' + escape('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"></svg>');

			}

		}

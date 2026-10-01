//console.log('The frontend script loaded!', window.location.href)

// flag that the window has loaded
function mt_flag_load_event_fired(){
	window.MTWindowLoadFired = true;
}
window.addEventListener
	? window.addEventListener("load", mt_flag_load_event_fired, false)
	: window.attachEvent && window.attachEvent("onload", mt_flag_load_event_fired);


// Check for MT parent window
function getMTWindow(){

	function valid_mt_opener(currentWin, opener){
		try {
			//console.error('valid_mt_opener', currentWin);
			return opener && opener.TvrMT && !opener.closed
				&& opener.document.domain.indexOf(currentWin.document.domain) > -1;
		}
		catch(error) {
			//console.log('frotnend error', error);
			return false;
		}
	}

	// cypress will be top frame if testing. Elementor/Brizy will be direct parent if active
	var MTWindow = false;

	if (window.top && window.top.TvrMT){
		MTWindow = window.top;
		//console.log('window.top.TvrMT')
	} else if (window.parent && window.parent.TvrMT){
		MTWindow = window.parent;
		//console.log('window.parent.TvrMT')
	} else if (window.parent && window.parent.parent && window.parent.parent.TvrMT){
		MTWindow = window.parent.parent
		//console.log('window.parent.parent && window.parent.parent.TvrMT')
	}

	//console.log('MTWindow after conditions', MTWindow);

	// correct for detached window
	if (MTWindow && MTWindow.opener){

		//console.log('we have an opener of some sort', MTWindow.opener)
		if (valid_mt_opener(window, MTWindow.opener)){
			MTWindow = MTWindow.opener;
			//console.log('we have a valid opener', MTWindow)
		} else {
			//console.log('we have a invalid opener', MTWindow)
			//MTWindow = MTWindow;
		}

		/*if (MTWindow.opener.TvrMT){
			if (MTWindow.opener.closed){
				MTWindow = false;
				console.log('we have a valid opener that is now closed', MTWindow)
			} else {
				MTWindow = MTWindow.opener;
				console.log('we have a valid opener', MTWindow)
			}
		}*/

	}

	return MTWindow;
}

// get the Microthemer window
var MTWindow = getMTWindow();

//console.log('the MTWindow is here', MTWindow, window.location.href)

// only run code if in iframe of Microthemer UI
try {

	if (!window.MTFrontScriptLoaded && !window.MTiframeShouldBail){

		// if iframe has loaded inside Microthemer
		if (MTWindow) {

			//console.log('Running MT frontend script');

			var TvrMT = MTWindow.TvrMT;

			// detect and log frontend errors (this has to be at the very top)
			window.onerror = function(error, url, line, colno, errorObj) {

				if (window.top.Cypress || !parseInt(TvrMT.data.dyn.pref.monitor_js_errors)){
					//console.log('do not catch the error', TvrMT.data.dyn.pref.monitor_js_errors)
					return false;
				}

				TvrMT.TvrUi.process_error('front', error, url, line, colno, errorObj);


				/*TvrMT.TvrUi.JSerrors.push({
					error: error,
					URL: url,
					line: line,
					col: colno,
					errorObj: errorObj,
					source: window.top.TvrLang.frontend,
					stack: errorObj !== undefined ? errorObj.stack : null //TvrCom.callStack(false, true)
				});

				// show JS error immediately
				TvrMT.TvrUi.instant_show_js_error('front');
*/
				//console.log('Error logging has been set up', TvrMT);


				// trialling immediate error in main UI (good for debugging while developing too)
				//if (front && TvrUi.js_in_focus()){
				//MTsave.prog_error('', '', front);
			};

			//TvrMT.TvrUi.catch_js_errors(window, true);

			// Minified tvrLazyLoad script for checking when the stylesheet has been refreshed
			// https://github.com/rgrove/lazyload/
			// see 'updated lazyload code with onload' folder in R&D (for FF+Chrome without polling, modern versions support this)
			window.tvrLazyLoad = function(e){function u(t,n){var r=e.createElement(t),i;for(i in n){if(n.hasOwnProperty(i)){r.setAttribute(i,n[i])}}return r}function a(e){var t=r[e],n,o;if(t){n=t.callback;o=t.urls;o.shift();i=0;if(!o.length){n&&n.call(t.context,t.obj);r[e]=null;s[e].length&&l(e)}}}function f(){var n=navigator.userAgent;t={async:e.createElement("script").async===true};(t.webkit=/AppleWebKit\//.test(n))||(t.ie=/MSIE|Trident/.test(n))||(t.opera=/Opera/.test(n))||(t.gecko=/Gecko\//.test(n))||(t.unknown=true)}function l(i,o,l,p,d){var v=function(){a(i)},m=i==="css",g=[],y,b,w,E,S,x;t||f();if(o){o=typeof o==="string"?[o]:o.concat();if(m||t.async||t.gecko||t.opera){s[i].push({urls:o,callback:l,obj:p,context:d})}else{for(y=0,b=o.length;y<b;++y){s[i].push({urls:[o[y]],callback:y===b-1?l:null,obj:p,context:d})}}}if(r[i]||!(E=r[i]=s[i].shift())){return}n||(n=e.head||e.getElementsByTagName("head")[0]);S=E.urls.concat();for(y=0,b=S.length;y<b;++y){x=S[y];if(m){w=t.gecko?u("style"):u("link",{href:x,rel:"stylesheet"})}else{w=u("script",{src:x});w.async=false}w.className="lazyload";w.setAttribute("charset","utf-8");if(t.ie&&!m&&"onreadystatechange"in w&&!("draggable"in w)){w.onreadystatechange=function(){if(/loaded|complete/.test(w.readyState)){w.onreadystatechange=null;v()}}}else if(m&&(t.gecko||t.webkit)){if(t.webkit){E.urls[y]=w.href;h()}else{w.innerHTML='@import "'+x+'";';c(w)}}else{w.onload=w.onerror=v}g.push(w)}for(y=0,b=g.length;y<b;++y){n.insertBefore(g[y], document.getElementById("mtdynSeperatorcss-1"))}}function c(e){var t;try{t=!!e.sheet.cssRules}catch(n){i+=1;if(i<200){setTimeout(function(){c(e)},50)}else{t&&a("css")}return}a("css")}function h(){var e=r.css,t;if(e){t=o.length;while(--t>=0){if(o[t].href===e.urls[0]){a("css");break}}i+=1;if(e){if(i<200){setTimeout(h,50)}else{a("css")}}}}var t,n,r={},i=0,s={css:[],js:[]},o=e.styleSheets;return{css:function(e,t,n,r){l("css",e,t,n,r)},js:function(e,t,n,r){l("js",e,t,n,r)}}}(this.document);

			//console.log('Has the dom already loaded?', document.readyState === 'complete')

			// frontend code
			function microthemerFrontend($){

				//console.log('doc is ready', isInsideGutenbergPreview());

				if (isInsideGutenbergPreview()){
					return;
				}

				// copy object reference so we can use same syntax on front/ui
				var TvrUi = TvrMT.TvrUi,
					TvrCom = TvrMT.TvrCom,
					MTint = TvrMT.mod.MTint,
					MTloop = TvrMT.mod.MTloop,
					MTdd = TvrMT.mod.MTdd,
					MTsave = TvrMT.mod.MTsave,
					MTsass = TvrMT.mod.MTsass,
					MTace = TvrMT.mod.MTace,
					MTgrid = TvrMT.mod.MTgrid,
					MTfolder = TvrMT.mod.MTfolder,
					MThtml = TvrMT.mod.MThtml,
					MTai = TvrMT.mod.MTai,
					MTlayout = TvrMT.mod.MTlayout,
					//MTdetached = TvrMT.MTdetached, // don't cache as becomes out of date (use TvrMT.MTdetached)
					tvrsprintf =  TvrMT.tvrsprintf,
					TvrLang = MTWindow.TvrLang;

				// check the block window context
				function getMTBlockContext(){
					let isGutenbergEditor = window.MTblock && window.MTblock.isEditor,
						isGutenbergIframe = window.MTblock && window.MTblock.isIframe,
						isSkinningAdmin = parseInt(TvrUi.pref.admin_asset_editing),
						excludeGutenbergEditor = isGutenbergEditor && !isSkinningAdmin,
						excludeGutenbergIframe = isGutenbergIframe && isSkinningAdmin;

					return {
						isGutenbergEditor,
						isGutenbergIframe,
						isSkinningAdmin,
						excludeGutenbergEditor,
						excludeGutenbergIframe,
						runFrontend: !excludeGutenbergEditor && !excludeGutenbergIframe
					}
				}

				// Main Frontend UI Object
				var MTF = {
					triggerElOverlay: {},
					triggerEl: {},
					triggerElCache: [],
					triggerElNext: {}, // for allowing targeting of a new element when hovering elements, when an element is already selected.
					triggerEls: {}, // for storing multiple el selection with shift shortcut
					triggerElIndex: '',
					styleSheetObj: {},
					styleEls: false,
					//stylesheetUrl: '',

					// temp store of pseudo placeholder overlay data
					hasPseudo: {},
					placeholderLayer: {
						highlight: 'direct',
						forEl: null,
						coordinates: {}
					},
					isGutenbergIFrame: null,
					//$cssUnitTest: $('<div>'), // maybe later
					stat: {
						html: $('html'),
						head: $('head'),
						body: $('body'),
						win: window,
						doc: document,
						MTFrontEls: false
					},

					// set/reset the vars - needed when main window loads after frontend (detached preview)
					set_vars: function(){

						MTWindow = getMTWindow();
						TvrMT = MTWindow.TvrMT;

						if (!TvrMT){
							return false; // not sure how this happens...
						}

						TvrUi = TvrMT.TvrUi;
						TvrCom = TvrMT.TvrCom;
						MTint = TvrMT.mod.MTint;
						MTloop = TvrMT.mod.MTloop;
						MTdd = TvrMT.mod.MTdd;
						MTsave = TvrMT.mod.MTsave;
						MTsass = TvrMT.mod.MTsass;
						MTace = TvrMT.mod.MTace;
						MTgrid = TvrMT.mod.MTgrid;
						MTlayout = TvrMT.mod.MTlayout;
						//MTdetached = TvrMT.MTdetached; // don't cache as becomes out of date
						tvrsprintf =  TvrMT.tvrsprintf;
						TvrLang = MTWindow.TvrLang;

						// update other module references to MTF
						update_module_mtf_references();

					},

					getMTBlockContext: getMTBlockContext,

					// Some actions should be performed in the admin area even if it isn't editable
					// Such as returning a response that the page has loaded or for conditional folders
					init_response: function(){

						// autoScroll to previous position if set
						if (TvrUi.resumeIframeScroll){
							MTF.stat.win.scroll(TvrUi.resumeIframeScroll);
							//console.log('Resumed scroll');
							TvrUi.resumeIframeScroll = false;
						}

						// establish the version of jQuery
						this.jQueryVersion = TvrCom.getJQueryVersion(jQuery.fn.jquery);

						// setup integrations
						MTint.frontend_preview_loaded(window);

						// dark mode so scrollbars are dark
						if (TvrUi.pref.mt_dark_mode){
							MTF.stat.html.addClass('mt_dark_mode');
						}

						// set keyboard shortcuts
						TvrUi.setup_keyboard_shortcuts( document );

						// clear the logic test url so the latest url is used on the next test
						TvrUi.clear_test_page_input();

						// Turn off loading WordPress action
						//console.log('check turn off wp load', $.extend(true, [], TvrUi.progStatus))
						if (TvrCom.in_array(TvrLang.load_wp, TvrUi.progStatus)) {

							MTsave.update_prog_indicator('minus', false, TvrLang.load_wp);

							//console.log('log array', TvrUi.doNotShowSubtleNotice, MTsave.logArr.length, $.extend(true, [], MTsave.logArr))

							// present general status notification (e.g. ready to publish) if there isn't anymore more relevant to report
							if (TvrUi.doNotShowSubtleNotice){
								TvrUi.doNotShowSubtleNotice = 0; // reset for to show next time
							} else {
								if (!MTsave.logArr.length){
									MTsave.subtle_notification();
								}
							}

							// regardless of notification, the Publish button should not be disabled if there are unpublished changes
							// so ensure the button has the correct state
							if (TvrUi.pref.num_unpublished_saves > 0){
								MTsave.signal_settings_ready_to_publish();
							}

						}

						// Turn off page refreshing for JavaScript notice
						if (TvrCom.in_array(TvrLang.refresh_js, TvrUi.progStatus)) {
							MTsave.update_prog_indicator('minus', false, TvrLang.refresh_js);
						}

						// slight chance they could switch page when styles are reloading too.
						if (TvrCom.in_array(TvrLang.refresh_styles, TvrUi.progStatus)) {
							MTsave.update_prog_indicator('minus', false, TvrLang.refresh_styles);
						}

						// signal that the iframe is fully ready, and pass in html reference
						MTlayout.trigger_iframe_loaded();

						// warn about an Oxygen post edit lock
						MTint.maybe_warn_builder_blocked_edit(window);

						// save the previewed page
						TvrUi.remember_page_viewed();

						// the color picker does an annoying thing when dragging out of it's bounds onto the preview.
						MTF.stat.html.on('mouseup', function() {
							if (TvrUi.colorPickerDragging){
								// this detaches the mouse from the dragger
								TvrUi.picker_method('clickpick');
							}
						});

						// update the folder loading class for conditional folders
						MTfolder.updateMenuLoadingClasses();

					},

					/*evaluateXPath:(xpath, contextNode) => {

						const results = [];

						// strip out trailing ':' which can happen when model gets confused about
						// the yaml keys in the example
						xpath = xpath.replace(/:$/, '');

						try {
							const query = document.evaluate(
								xpath,
								contextNode,
								null,
								XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
								null
							);

							//console.log('evaluateXPath query', query.snapshotLength, xpath, query, contextNode)

							for (let i = 0; i < query.snapshotLength; i++) {
								results.push(query.snapshotItem(i));
								//console.log('We pushed it', query.snapshotItem(i))
							}
						} catch (e) {
							//console.error('XPath evaluation error:', e);
						}

						return results;
					},*/

					evaluateXPath: function (xpath, contextNode) {
						const results = [];

						// Clean up trailing ':' if accidentally included
						xpath = xpath.replace(/:$/, '');

						try {
							const query = document.evaluate(
								xpath,
								contextNode,
								null,
								XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
								null
							);

							for (let i = 0; i < query.snapshotLength; i++) {
								const element = query.snapshotItem(i);
								const relation = MTF.getSimpleXPathRelation(contextNode, element);
								results.push({ element, relation });
							}
						} catch (e) {
							// console.error('XPath evaluation error:', e);
						}

						return results;
					},

					getSimpleXPathRelation: function (fromNode, toNode) {
						if (fromNode === toNode) return ".";

						// Check for ancestor
						let current = fromNode;
						let depth = 0;
						while (current) {
							if (current === toNode) {
								return `ancestor::*[${depth}]`;
							}
							current = current.parentNode;
							depth++;
						}

						// Check for siblings
						if (fromNode.parentNode === toNode.parentNode) {
							const siblings = Array.from(fromNode.parentNode.children);
							const fromIndex = siblings.indexOf(fromNode);
							const toIndex = siblings.indexOf(toNode);

							if (toIndex > fromIndex) {
								return `following-sibling::${toNode.nodeName.toLowerCase()}[${toIndex - fromIndex}]`;
							} else if (toIndex < fromIndex) {
								return `preceding-sibling::${toNode.nodeName.toLowerCase()}[${fromIndex - toIndex}]`;
							}
						}

						// Check for descendant
						let path = [];
						current = toNode;
						while (current && current !== fromNode) {
							const parent = current.parentNode;
							if (!parent) break;
							const siblings = Array.from(parent.children).filter(n => n.nodeName === current.nodeName);
							const index = siblings.indexOf(current) + 1;
							path.unshift(`${current.nodeName.toLowerCase()}[${index}]`);
							current = parent;
						}
						if (current === fromNode) {
							return `./${path.join('/')}`;
						}

						// fallback
						return MTF.getAbsoluteXPath(toNode);
					},

					getAbsoluteXPath: function (node) {
						let path = [];
						while (node && node.nodeType === Node.ELEMENT_NODE) {
							let index = 1;
							let sibling = node.previousSibling;
							while (sibling) {
								if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
									index++;
								}
								sibling = sibling.previousSibling;
							}
							path.unshift(`${node.nodeName.toLowerCase()}[${index}]`);
							node = node.parentNode;
						}
						return '/' + path.join('/');
					},

					// this function is called after $(window).load() event
					init_front: function(){ TvrCom.startT(arguments);

						//console.log('init_front', window.location.href, TvrMT.integrate.gutenberg, TvrUi.gutenbergIsActive());

						//MTF.isGutenbergIFrame = MTF.stat.body.hasClass('block-editor-iframe__body');

						var MTDynFrontData = MTF.getMTDynFrontData() || {};

						//console.log('init_front', MTDynFrontData, TvrMT.integrate.gutenberg)

						// bail if the brick builder is running on the frontend (it replaces regular frontend)
						if (MTDynFrontData.bricksBuilderActive){
							return false;
						}

						MTF.interactions = MTDynFrontData.interactions;
						MTF.isAdminArea = MTDynFrontData.isAdminArea;

						// Enable interactions if Gutenberg integration is active
						if (TvrMT.integrate.gutenberg){
							//console.log('Enable interactions for Gutenberg', MTblock)

							// sometimes the iframe-url will just be site-editor.php when using FSE
							// Even though the address bar has changed dynamically, so use the value stored in
							// parent editor window
							if (MTblock){

								if (MTblock.shared.cache.view.data){

									window.MTDynFrontData = MTblock.shared.cache.view.data;

									MTblock.log('We fetch MTDynFrontData from view cache on frontend', MTblock.MTDynFrontData)

									//delete MTblock.shared.cache.view.data;
								}

								let iframeUrl = TvrCom.checkObject(MTblock, [
									'shared', 'editor', 'win', 'MTblock', 'MTDynFrontData', 'iframe-url'
								]);
								//console.log('Use the iframe url from the editor', iframeUrl);
								if (iframeUrl){
									MTDynFrontData['iframe-url'] = iframeUrl;
								}
							}


							// allow interactions on the admin side, for selecting block content
							MTF.enableInteractions(true);
						}

						// cache this value before it is set to false for subsequent functions
						let resumeIframeScroll = TvrUi.resumeIframeScroll;

						//consol.log(); //trigger an error
						//TvrCom.checkObject(window, ['MTDynFrontData', 'interactions']);
						//  TvrCom.checkObject(window, ['MTDynFrontData', 'isAdminArea']);

						// respond to the main MT interface (the admin area does this when loaded inside MT)
						MTF.init_response();

						// Bail after response is returned if the user does not want to edit admin assets
						// including block editor content
						if (MTF.isAdminArea && !TvrUi.adminAssetsEnabled()){
							//console.log('We bail', MTF.isAdminArea, !TvrUi.adminAssetsEnabled())
							return;
						} else {
							//console.log('We DO NOT bail', MTF.isAdminArea, !TvrUi.adminAssetsEnabled())
						}

						/*// bail if this script hasn't been loaded for asset editing
						if (TvrCom.checkObject(window, ['MTDynFrontData', 'responseOnly'])){
							return;
						}*/

						// get base font-size for the page
						MTF.getBaseFontSize();

						// Frontend only
						if (!MTF.isAdminArea){

							// save the page id so Elementor / Gutenberg can be triggered
							MTF.save_page_id_from_mt_body_class();

							// hide the WordPress admin bar
							if (!parseInt(MTDynFrontData['mt-show-admin-bar'])){
								MTF.stat.html.addClass('no-admin-bar-please');
							}
						}

						// Apply MT style nodes
						let $firstSep = MTF.applyMTStyleNodes(true);

						// set min if not dev mode
						var min = window.TVR_DEV_MODE ? '/page' : '-min';

						// load animate.min.css (for instant preview in MT)
						var minAntimateURL = TvrUi.pluginUrl + 'css/animate.min.css?v=2';
						$firstSep
							.before(
								'<link rel="stylesheet" type="text/css" href="'+minAntimateURL+'">'
							);

						// load MT icon font (could use inline svg, but might look better as font as icons are small)
						//var iconFont = TvrUi.pluginUrl + 'images/icon-font/css/microthemer.css?v=2';
						$firstSep.before(TvrMT.data.dyn.icon_font_face_style.css);

						// animation-events.js loads conditionally (if JS event used), but always when using MT
						if (TvrCom.isDefined(window.MT_Events_Data)){
							MTF.JSEventsLoaded = true;
						} else {
							var animEvsURL = TvrUi.pluginUrl + 'js'+min+'/animation-events.js';
							$.ajax({
								url: animEvsURL,
								dataType: "script",
								success: function(data){
									//console.log('it loaded afterwards', animEvsURL);
								}
							});
						}

						// check if active events has changed and rebind if so
						MTloop.run_global_scans({}, ['active_events']);

						// add frontend markup (all MT HTML contained within an mt-stuff-ignore
						// e.g. grid highlight, overlays, triggerEl context menu


						// Allow for an alternative scrollable area - gutenberg without an iframed editor
						// has this. May need to update to support other systems too.
						let B = TvrMT.integrate.gutenberg,
							$altContainer = B && B.editorHasBlocks
								? $('.interface-interface-skeleton__content')
								: $('#a923ied290j-nothing');
						
						MTF.stat.$overlayParentEl = $altContainer.length ? $altContainer :  MTF.stat.body;
						MTF.overlayParentIsAlt = $altContainer.length;

						// append MT overlays to the main content container
						MTF.stat.$overlayParentEl.append(TvrMT.data.templates.frontend_markup);

						// cache references
						MTF.stat.MTFrontEls = $('#mt-stuff-ignore');
						MTF.stat.overlaysContainer = $('#mt-el-overlays');
						MTF.stat.hoverOverlay = $('#over-cont-hover'); //
						MTF.stat.frontendControls = $('#over-cont-primary');
						MTF.stat.elementMeta = $('#primary-element-meta');
						MTF.stat.nestedEls = $('#mt-nested-els');
						MTF.stat.posLayer = $('#mt-pos-layer');
						MTF.stat.placeholderLayer = $('#mt-placeholder-layer');

						// set any classes that relate to MT interface config e.g.
						if (TvrUi.pref.selname_code_synced){
							MTF.stat.html.addClass('selname_code_synced');
						}

						// for Bricks, just set if we are editing the frontend
						var bricksFrontClass = 'bricks-is-frontend';
						MTF.bricksIsFront = MTF.stat.body.hasClass(bricksFrontClass) ? bricksFrontClass : false;

						// ensure page builder syncs with current responsive view when first loading
						// unless gutenberg, which defaults to desktop
						if (!TvrMT.integrate.gutenberg){
							//console.log('Frontend loaded, check builder sync')
							MTint.check_synced_page_builder_responsive_views( TvrUi.get_mq_focus() );
						}

						// update curSelEls cache
						if (TvrUi.curSelCSS){
							TvrUi.curSelEls = MTF.jquery_compat_sel_elements(TvrUi.curSelCSS);
						}

						// it's possible the user might save settings before iframe has loaded - so reload stylesheet
						if (TvrUi.awaitingIframeReloadAfterSave){
							//console.log('awating reload aftr save')
							MTF.refresh_stylesheet({
								mt: false,
								gf: TvrUi.update_gf_url
							});
							TvrUi.update_gf_url = false;
							TvrUi.awaitingIframeReloadAfterSave = false;
						}

						else {
							// just refresh comp styles for selector in focus
							MTF.getAndUpdateCompStyles();
						}

						/*// save the previewed page
						TvrUi.remember_page_viewed();*/


						/*** INTERACTION EVENTS ***/

						// enable targeting by default (unless user disabled it before going to a new page)
						if (MTF.interactions && parseInt(TvrUi.pref.hover_inspect)){
							TvrUi.ensure_targeting_is_on(MTF);
							//console.log('We have ensure on during load');
						}

						// ToDo - support the shadow DOM - keep $click as using target but e.composePath to select func
						// TvrUi.EventHandler.addEventListener('click', function(e) {
						// e.composedPath()[0]
						// , MTF.stat.html[0])

						// Bind single click event
						MTF.stat.html.on('click', function(e) {



							// we don't want to trigger this if a theme like Astra triggers click()
							// it triggers on an off-canvas toggle #menu-toggle-close on the window resize event
							/*if (!MTF.isRealMouseClick(e)){
								return;
							}*/

							var $clicked = $(e.target), // $(e.composedPath()[0]), // $(e.target),
								ctrlOrCmd = e.ctrlKey || e.metaKey,
								isMTElement = $clicked.hasClass('mt-ui-element');

							//console.log('It was clicked', $clicked);

							// shut any expanded menus when user clicks the iframe too
							TvrUi.close_all_expanded($clicked, '');

							// latest BB exits without refreshing page, so manually set toggle
							MTint.builderUnq.FLBuilder.maybe_correct_ui_toggle($clicked);

							// Respond to MT UI element click
							if (isMTElement){
								let cClasses = $clicked.attr('class') || '';

								if (cClasses.indexOf('ui-toggle') >= 0) {
									TvrUi.toggle_feature($clicked, $clicked.data('aspect'));
								} else if (cClasses.indexOf('mt-bc-item') >= 0) {
									TvrUi.breadcrumb_clicked($clicked, e);
								} else if (cClasses.indexOf('edit-modification') >= 0) {
									MThtml.go_to_amendment($clicked, e);
								}
							}

							//console.log('is ctrl', e.ctrlKey, e.metaKey, e);

							// MT targeting is enabled
							// todo - if builder is active, create draft selector / resume even if targeting mode is off
							//if (MTF.interactions && parseInt(TvrUi.pref.hover_inspect) && !ctrlOrCmd){
							if (!MTF.skipClickAction($clicked, e, ctrlOrCmd, isMTElement)){

								//console.log('MT click select on', $clicked);

								// links should never be followed during hover or wizard inspection
								e.preventDefault();
								e.stopPropagation(); // why this?

								// it's a regular frontend element, select it
								MTF.select_clicked_or_alt_hovered($clicked, e);

							}

							// MT targeting is disabled
							else {

								//console.log('MT click select disallowed', $clicked);

								// if the user clicked a link
								var $special = $clicked.closest('a:not([href^="#"])');
								if (TvrCom.isDomEl($special)){

									// there are a few cases when we block the default behaviour, but we try to allow in general
									var url = $special.attr("href");
									if (url){

										// ensure that when switching between demos or loading Divi
										// The whole MT interface switches
										var openMTWindow = url.indexOf('setting-up-demo-site/?create_demo') > -1
												|| url.indexOf('et_fb=1') > -1,
											windowToOpen = openMTWindow ? MTWindow : window;

										// MT gets stuck if an image loads inside it
										if (url.match(/\.(gif|jpe?g|a?png|svg|webp|avif)$/i) || TvrCom.isExternalUrl(url)
										) {
											//console.log('open link in new tab', url, TvrUi.siteUrl, TvrUi.siteUrl.replace(/https?:\/\//, ''))
											e.preventDefault();
											window.open(url, "");
											return false;
										}

										// prevent links to Microthemer (MT inside MT)
										// note, currently allowing access to admin area, which will be skninable in future.
										if (url.indexOf(TvrUi.uiUrl) > -1){
											MTsave.update_full_logs({
												'short': TvrLang.navigate_mt+' '+TvrUi.appName,
												'long': '<p>'+ TvrLang.navigate_mt_long +'</p>',
												'type' : 'info'
											});
											e.preventDefault();
											return false;
										}

										// set correct loading message if starting Oxygen
										// todo check with other builders too
										if (TvrCom.isDomEl(
											$clicked.closest('#wp-admin-bar-oxygen_admin_bar_menu-default')
										)) {
											//console.log('Signal builder is loading');
											TvrUi.loading_builder = true;
										}

										//console.log('We need to load in MT', openMTWindow, windowToOpen)

										// quick fix for Divi which break out of iframe to send parent window to Divi from MT
										if (openMTWindow) {
											e.preventDefault();
											//MTF.previewContentChanging();
											windowToOpen.location = url;
										}


										// if they are using Ctrl with targeting mode, don't open link in another tab
										if (parseInt(TvrUi.pref.hover_inspect) && ctrlOrCmd){
											e.preventDefault();
											//MTF.previewContentChanging();

											TvrUi.maybeFilterNewPreviewUrl(url);

											//windowToOpen.location = url;
										}

									}

								}

							}

						});

						// more functionality, just for editing
						if (MTF.interactions){

							// config for CSSUtilities
							if (TvrUi.sRules.setup_mt_vars){
								TvrUi.sRules.setup_mt_vars(); // make MT vars available to sRules
							}

							TvrUi.sRules.define('mode', 'browser');
							TvrUi.sRules.define('async', true);
							TvrUi.sRules.define('page', document);

							// signal that stylesheet rules cache needs to be repopulated - this is a new page.
							TvrUi.reinitRules = true;

							// if the site hasn't been scanned for CSS properties used by the theme and plugins, do so now
							// But only get color, they can sample font-family, size, line-height if they need them
							if (!parseInt(TvrUi.pref.default_sug_values_set)){ // || 1 for testing
								MTdd.refresh_sug_values({specific:'color', getVars: 1});
							} else if (!parseInt(TvrUi.pref.default_sug_variables_set)){
								MTdd.refresh_sug_values({getVars: 1});
							}

							// signal new content loaded
							//TvrUi.domChanged = true;
							//console.log('We singal frontend HTML has loaded');
							MTF.setDomChangedSignals(true);

							// allow mutationObserver to start again by clearing any observer from a previous page
							TvrUi.mutationObserver = false;

							// start observing
							MTF.maybe_start_mutation_observer();

							// ensure MTF.N is set for the purpose of organising equiv selectors
							// It will be updated again when the HTML pane updates
							MTF.maybe_refresh_front_N_index(true);

							// select the current element (after a short delay to help elements settle)
							if (window.location.hash !== '#amender-data'){

							}

							TvrCom.action_after_timeout('selectInitially', 200, {
								item: function(){

									MTF.select_current_selector_elements({
										scroll: !resumeIframeScroll && window.location.hash !== '#amender-data'
									});

									// populate existing DOM content for HTML replace options if required
									/*if (MThtml.pendingPrepopulateDOMContent){
										MThtml.pendingPrepopulateDOMContent = false;

										let M = TvrUi.get_pg_meta();

										if (M && M.groupSlug === 'html'){

											let { action, aspect } = MThtml.getFieldValues(
												M.groupTab, M, true
											);

											/!*MThtml.maybeAdjustContentOptions(
												M, action, aspect
											);*!/
										}
									}*/
								}
							});

							// enable tooltips - do this last as we don't want any error to blck other actions
							try {
								MTF.stat.MTFrontEls.tooltip( TvrUi.tt_config(MTF) )
							} catch(error) {
								//console.log('The tooltip failed for some reason', error);
							}

						}

						//cot.log('testing');

						TvrCom.endT(arguments)
					},

					applyMTStyleNodes: function(addSeparators){

						let $firstSep

						// get the stylesheet URL // MTF.styleEls
						MTF.get_mt_stylesheets();

						// insert dynamic CSS separator node: new stylesheet loads before, dynamic css after
						if (addSeparators){

							MTF.add_styleNode('dynSeperator', $('#mt-placeholder-inline-css')); // #mtdynSeperatorcss-0

							$firstSep = $('#mtdynSeperatorcss-0');

							// and another one for stuff that comes before main stylesheet
							// e.g. minified animate.css which only loads dynamically for purpose of instant preview in MT
							MTF.add_styleNode('dynSeperator', $firstSep); // #mtdynSeperatorcss-1

						}

						// setup initial style nodes (maybe it would be faster to do this with PHP)
						document.getElementById('mtdynSeperatorcss-1').insertAdjacentHTML('beforebegin',
							MTloop.generate_initial_style_node_html(MTF.getMTDynFrontData().folderLoading)
						);

						// remove all MT style assets that were loaded initially
						if (MTF.styleEls){
							MTF.styleEls.each(function(){
								//console.log('remove the stylesheet or style', $(this).attr('id'));
								$(this).remove();
							});
						}

						return $firstSep;
					},

					enableInteractions: function(justVars){

						let MTDynFrontData = MTF.getMTDynFrontData();

						MTF.interactions = 1;
						MTDynFrontData.interactions = 1;

						if (!justVars){
							//console.log('enableInteractions and turn on', MTF.isGutenbergIFrame, MTDynFrontData, MTF);
							TvrUi.ensure_targeting_is_on(MTF);
						}
					},

					disableInteractions: function(justVars){

						let MTDynFrontData = MTF.getMTDynFrontData();

						MTF.interactions = 0;
						MTDynFrontData.interactions = 0;

						if (!justVars){
							MTF.unbind_wizard_hover();
						}

					},

					// there was a bug with Astra where it used menu_offcanvas_close.click() on window resize
					// this caused MT to always select that element. So no MT does a check for a real mouse click
					// on the frontend click event
					isRealMouseClick: function(e){
						//console.log('isRealMouseClick', e.originalEvent.clientX, e.originalEvent.clientY,  e.originalEvent);
						let event = e.originalEvent || e;
						return event && (event.clientX !== 0 || event.clientY !== 0);
					},

					// note this is a copy and paste of function on TvrUi object literal
					get_tt_trigger: function(e, thisCon){
						TvrUi.tt_trigger = $(e.originalEvent.target || e.originalEvent.srcElement)
							.closest($(thisCon).tooltip('option', 'items'));
						return TvrUi.tt_trigger;
					},

					jQueryVersion: false,

					getBaseFontSize: function(){

						// update global cache
						TvrUi.baseFontSize = parseInt(MTF.stat.html.css('font-size'));

						//console.log('we got the base fontsize', TvrUi.baseFontSize )

						return TvrUi.baseFontSize;
					},

					getAndUpdateCompStyles: function(wizard, intelli, data, con){ TvrCom.startT(arguments);

						data = TvrCom.isDefined(data) ? data : TvrUi.curSelCSS;
						con = TvrCom.isDefined(con) ? con : 'str';
						//intelli = TvrCom.isDefined(intelli) ? intelli : TvrUi.intelli;

						// get comp styles
						/* MTF.get_computed_styles({
							data: data,
							con: con,
							intelli: intelli
						});*/

						// update UI
						if (wizard){
							//console.log('refresh wizard css', $.extend(true, {}, MTF.compProps))

							MTF.get_computed_styles({
								data: data,
								con: con,
								intelli: 1 //intelli
							});
							TvrUi.refresh_wizard_comp_css()
						}


						// get comp again as UI might be on a different property group
						//console.log('The current CSS', TvrUi.curSelCSS)
						MTF.get_computed_styles({
							data: data,
							con: con,
							intelli: false
						});
						TvrUi.refresh_comp_css();

						TvrCom.endT(arguments);

						//console.log('refreshing UI comp styles', !!intelli);
					},

					setDomChangedSignals: function(skipCompFresh){

						//console.log('setDomChangedSignals, updateHTMLPane')

						TvrUi.domChanged = {

							// deferred actions
							updateHTMLPane: true,
							updateFrontIndexes: true
						};

						// run refresh comp CSS after a delay
						if (!skipCompFresh){

							TvrCom.action_after_timeout('refreshCompAfterDomChange', 500, {
								item: function(){

									// update the comp CSS
									MTF.getAndUpdateCompStyles(TvrUi.intelli);

									//console.log('updated comp after dom change')

									// still deciding as might be triggering worker resources too much
									// right now, the HTML pane updates when a dom node is added or removed, when the pane is next
									// interacted with. This does miss class changes though, so a manual refresh option is handy
									//TvrUi.refresh_html_pane();

								}
							});

						}

					},

					frontend_jquery_select: function(selector_string){
						return $(selector_string);
					},

					// keep track of browser support for features (got this from jQuery 3.2)
					support: {},

					// get the post or page ID which can be found in MTs body class
					save_page_id_from_mt_body_class: function(){

						let MTDynFrontData = MTF.getMTDynFrontData();

						TvrUi.pageOrPostID = (
							MTDynFrontData && (MTDynFrontData.type === 'page' || MTDynFrontData.type === 'single')
						)
							?  MTDynFrontData.post_id
							: false;

						//console.log('We got the TvrUi.pageOrPostID', TvrUi.pageOrPostID);
					},

					// get page title or fall back to URL

					get_current_page_title: function(fallbackPath){

						fallbackPath = fallbackPath || TvrCom.extract_url_path(this.get_current_url());

						let MTDynFrontData = MTF.getMTDynFrontData();

						var title = TvrCom.checkObject(MTDynFrontData, ['post_title']) || fallbackPath;

						// obtain heading from FSE screen if available
						let B = TvrMT.integrate.gutenberg,
							fseHeading;

						if (B && B.isFSE){

							fseHeading = B.getFSEScreenHeading(B.mainWindow);

							if (fseHeading){

								if (fseHeading === 'Design'){
									title = 'Site Editor';
								} else {
									title = 'Site Editor - '+fseHeading;
								}
							}
						}

						return title;

					},

					getMTDynFrontData: function(){
						return window.MTDynFrontData;

						/*return window.MTDynFrontData || (
							MTF.isGutenbergIFrame
								? window.parent ? window.parent.MTDynFrontData : undefined
								: undefined
						);*/
					},

					// For compatibility with Gutenberg we need to count the iframes that are loaded
					// to preview block preview frames from causing issues with targeting and resetting references
					// This state clearer must be used when user: navigates links, uses page search, or detach preview
					// Not in use, a better system for setting MTiframeShouldBail was found
					/*previewContentChanging: function(){

						window.MTiframeShouldBail = null;

						let parent = window.parent;

						if (parent){
							parent.MTiframeLoadCount = 0;
							if (parent.parent){
								parent.parent.MTiframeLoadCount = 0;
							}
						}

						console.log('previewContentChanging state reset', window, window.parent);

					},*/

					setMTDynFrontData: function(key, value){
						let data = MTF.getMTDynFrontData();
						return data[key] = value;
					},
					get_current_url: function(){

						//console.log('the current URL', MTF.getMTDynFrontData()['iframe-url'], decodeURIComponent(MTF.getMTDynFrontData()['iframe-url']), MTF.getMTDynFrontData())

						let MTDynFrontData = MTF.getMTDynFrontData(),
							iframeURL = TvrCom.checkObject(MTDynFrontData, ['iframe-url']);

						return iframeURL ? decodeURIComponent(iframeURL): '';
						//return decodeURIComponent(MTF.stat.html.find('#iframe-url').attr('content'));
					},

					// return newDocument if browser supports, or default to passed document (got this from jQuery 3.2)
					/*new_or_default_document: function(defaultDoc){

						var doc = defaultDoc;

						// Stop scripts or inline event handlers from being executed immediately
						// by using document.implementation
						if ( MTF.support.createHTMLDocument ) {
							doc = document.implementation.createHTMLDocument( "" );

							// Set the base href for the created document
							// so any parsed elements with URLs
							// are based on the document's URL (gh-2965)
							var base = doc.createElement( "base" );
							base.href = document.location.href;
							doc.head.appendChild( base );
						}
						return doc;
					},*/

					overlayCount: 0,

					// Get MT stylesheet [min.]draft/active-styles
					/*get_mt_stylesheet: function(){ TvrCom.startT(arguments);

				// try fastest selector to get stylesheet
				// #microthemer-css refers to draft/active/min - whatever is chosen
				MTF.stylesheet = $('#microthemer-css');

				// try slower but thorough stylesheet search if nothing found
				if (!TvrCom.isDomEl(MTF.stylesheet)) {
					MTF.stylesheet = $('link[href*="\\/micro-themes\\/draft-styles.css"]');
				}

				// if we still can't find it, concatenation is probably at play
				if (!TvrCom.isDomEl(MTF.stylesheet)) {
					MTF.stylesheet = false;
					// MTF.stylesheetUrl = false;
				} else {
					// we have an obj, get the href
					// MTF.stylesheetUrl = MTF.stylesheet.attr('href');
				}

				TvrCom.endT(arguments)
			},*/

					// MTStyleTagsAndLinks
					get_mt_stylesheets: function(){ TvrCom.startT(arguments);

						// get all styles using an attribute all are most likely to share
						// (id could be used for link too but some plugins strip ids)
						var $styleEls = $('link[href*="\\/micro-themes\\/"], style[id^="microthemer"], style[id^="mtprv-"]'); // note with Gutenberg on WP 6.7 MT dyn style nodes were there already

						if ($styleEls.length){
							MTF.styleEls = $styleEls;
						}

						TvrCom.endT(arguments)
					},

					// set up the overlay plugin
					/*setup_overlay_plugin: function(){

				// overlay script
				(function($){
					$.fn.extend({


					});
				})(jQuery);

			},*/


					// add overlays on elements
					add_mt_overlay: function($sel_elements, $triggerEl, config){ TvrCom.startT(arguments);

						//console.trace();

						var all_containers = '',  // html string
							numElements = this.length,
							breakNum = (numElements && numElements < 80) ? numElements : 79,
							nonStaticBodyAdjust = MTF.nonStaticBodyAdjust();

						//console.log('$sel_elements, $triggerEl, config', $sel_elements, $triggerEl, config);

						// loop through all HTML elements
						$sel_elements.each(function(index) {

							// bail if too many
							if (index > breakNum) {
								return false;
							}

							var $this = $(this),
								overlay = MTF.create_overlay_container(
									$this,
									config,
									$triggerEl,
									nonStaticBodyAdjust,
									true
								);

							//console.log('The overlay', overlay);

							// we add container for all (even triggerEL, which is not hidden apart from when e.g. spotlight hover happens to
							// also target the current trigger el)
							all_containers+= overlay.container;

							// store the first item in selection for checking below fold offset
							if (index === 0){
								MTF.firstElOverlay = overlay;
							}

							// store the triggerEl overlay properties globally for frontend controls
							if ($this.is($triggerEl)){
								MTF.triggerElOverlay = overlay;
								//contextMenu = '<div id="primary-trigger-alignment-helper"></div>'
							}

							MTF.overlayCount++;

						});

						// insert into dom mt-el-overlays
						// MTF.stat.overlaysContainer should always be defined, but a customer had a bug
						// relating to this being undefined, which I could not troubleshoot properly
						if (MTF.stat.overlaysContainer){
							MTF.stat.overlaysContainer.append(all_containers);
						}

						//console.log('container added', all_containers, MTF.stat.overlaysContainer)

						TvrCom.endT(arguments);

						return true;

					},

					get_positioning_context_element: function($this){

						if (MTF.getCSS($this[0], 'position') !== 'static'){
							return $this;
						}

						var $par = $this.parent(),
							par = TvrCom.isDomEl($par) && $par.length;

						if (par){
							return MTF.get_positioning_context_element($par);
						} else {
							return MTF.stat.html; // default to document
						}
					},

					// get offset and width/height adjusting for non-static body positioning
					get_adjusted_rect: function(el, nonStaticBodyAdjust){

						var rect = el.getBoundingClientRect(),
							scrollEl = MTF.overlayParentIsAlt && MTF.stat.$overlayParentEl.length
								? MTF.stat.$overlayParentEl[0]
								: false,
							offset = {
								top: rect.y + (scrollEl ? scrollEl.scrollTop : window.scrollY),
								left: rect.x + (scrollEl ? scrollEl.scrollLeft : window.scrollX)
							};

						offset.top = offset.top + nonStaticBodyAdjust.top;
						offset.left = offset.left + nonStaticBodyAdjust.left;

						return {
							offset: offset,
							outerWidth: rect.width,
							outerHeight: rect.height,
							nonStaticBodyAdjust: nonStaticBodyAdjust,
							boundingClientRect: rect
						}
					},

					inFrontOrOutOfBounds: function(pseudoIsInFrontOfEl, pseudoRectWithTransform, $el, e){

						return (pseudoIsInFrontOfEl

							// or only the pseudo is being hovered
							|| (
								!TvrCom.mouseIsOverElement($el, e) &&
								TvrCom.mouseIsOverElement(false, e, pseudoRectWithTransform)
							)
						)
					},

					// use elementFromPoint() on all four corners of the test pseudo el, if we get the el, it is behind
					// todo - why is after pseudo element not being registered as in front of the main element? - because we need to introduce a paint event before running this
					pseudoIsInFrontOfEl: function(testPseudoEl, rect, el){ TvrCom.startT(arguments);

						var topLeft = [rect.x, rect.y],
							topRight = [rect.x + rect.width-1, rect.y],
							bottomRight = [rect.x + rect.width-1, rect.y + rect.height-1],
							bottomLeft = [rect.x, rect.y + rect.height-1],
							points = [topLeft, topRight, bottomRight, bottomLeft],
							debugHTML = '',
							debug = false;

						//console.log('The points', rect, points);

						for (var i = 0; i < points.length; i++) {

							var point = points[i],
								topmost = document.elementFromPoint(point[0], point[1]),
								offset = {
									left: point[0] + window.scrollX,
									top: point[1] + window.scrollY
								},
								nth = i+1;

							if (debug){
								debugHTML += '<div class="mt-point-debug mt-point-debug-'+nth+'" style="top:'+offset.top+'px; left:'+offset.left+'px;">'+nth+'</div>'
							}

							//console.log('topmost is this', i, point, topmost);

							if (topmost){
								//console.log('topmost exists', i, point, topmost, topmost.isSameNode(el));
								if (topmost.isSameNode(el)){
									//console.log('topmost was the el');
									TvrCom.endT(arguments);
									return false;
								}
							}

						}

						if (debug){
							MTF.stat.MTFrontEls.append('<div class="debug-container">'+debugHTML+'</div>');
						}

						TvrCom.endT(arguments);

						return true;


					},

					get_positioning_rectangle: function($this, nonStaticBodyAdjust, pseudoEl, itemCSS, props, cssSelector, withTransformToo) {

						if (!pseudoEl){
							return MTF.get_adjusted_rect($this[0], nonStaticBodyAdjust);
						}

						//console.log('We check for pseudo', pseudoEl, cssSelector, $this)

						// it's pretty instant if just returning bounding box so start timer only for pseudo (later)
						TvrCom.startT(arguments);

						// for hover, we also need to get the coordinates of the el post transform so cache this value
						var transform = itemCSS.transform;

						delete itemCSS.transform;

						// temporarily replace the pseudo element with a real element we can query the bounding box of
						var $styleNode = $('#mtdynSeperatorcss-1'),

							// inline CSS to hide the pseudo element
							hidePseudoCSS = cssSelector+' { display: none !important; }',

							// build a real tag that has the styles of the pseudo element so we can query it's position and outer dimensions
							newPseudoTag = MTF.test_pseudo_tag(pseudoEl, itemCSS, false, true);

						// add the CSS on it's own layer so that !important overrides any MT !important styles for display/content
						hidePseudoCSS+= "\n@layer MTTempOverride { "+hidePseudoCSS+" }";

						// hide the pseudo element with CSS
						$styleNode.text(hidePseudoCSS);

						//console.log('hidePseudoCSS', hidePseudoCSS);
						//console.log('New pseudo tag', newPseudoTag, $this, pseudoEl)

						// add real element in its place
						if (pseudoEl === '::before'){
							$this.prepend(newPseudoTag);
						} else {
							$this.append(newPseudoTag);
						}

						// query the real element's bounding box
						var testPseudoEl = document.getElementById("mt-test-pseudo-el"),

							// query the bounding rect of the pseudo el
							rect = MTF.get_adjusted_rect(testPseudoEl, nonStaticBodyAdjust);


						var infrontTestRect = rect.boundingClientRect;

						if (withTransformToo){
							//console.log('It is with transform')
							testPseudoEl.style.transform = transform;
							rect.boundingClientRect.withTransform = MTF.get_adjusted_rect(testPseudoEl, nonStaticBodyAdjust).boundingClientRect;
							infrontTestRect = rect.boundingClientRect.withTransform;
						}

						// log if the pseudo is in front of the element
						// todo - this incorrectly returns false because testPseudoEl has only just been added
						// we need to fix this with repaint event, but that will take some refactoring up the chain of function
						// calls
						rect.boundingClientRect.pseudoIsInFrontOfEl = MTF.pseudoIsInFrontOfEl(
							testPseudoEl, infrontTestRect, $this[0]
						);
						infrontTestRect.pseudoIsInFrontOfEl = rect.boundingClientRect.pseudoIsInFrontOfEl;

						//console.log('pseudoIsInFrontOfEl', testPseudoEl, rect.boundingClientRect.pseudoIsInFrontOfEl, pseudoEl, $this)

						// remove the temp element and the CSS that hid the pseudo
						testPseudoEl.remove();
						$styleNode.text('');


						TvrCom.endT(arguments);

						//console.log('Get pos rect', pseudoEl, rect.offset, $this);
						//console.trace();

						return rect;
					},

					// This was my first attempt - more complicated and less reliable in the end.
					// I thought the above solution might make things too jumpy, but it seems fine,
					// and is much more reliable (and probably more performant
					/*get_positioning_rectangle_first_try: function($this, nonStaticBodyAdjust, pseudoEl, itemCSS, props, cssSelector){ TvrCom.startT(arguments);

				var $posEl = $this;

				// if it's a regular element, simply return the offset and outer dimensions
				if (pseudoEl){
					// it's a pseudo element, an ancestor maye provide the positioning context
					// get the element to
					switch(itemCSS.position){
						case 'absolute':
							TvrCom.startT('get_positioning_el');
							$posEl = MTF.get_positioning_context_element($this, MTF.stat.html); // MTF.stat.body
							TvrCom.endT('get_positioning_el', 1);
							break;
						case 'fixed':
							//case 'sticky': // just treat sticky as static
							$posEl = MTF.stat.html;
							break;
					}
				}

				var posRect = MTF.get_adjusted_rect($posEl[0], nonStaticBodyAdjust),
					offset = posRect.offset;

				if (!pseudoEl){
					TvrCom.endT(arguments, 1);
					return posRect;
				}

				// insert a test el, with an non-pseudo element inserted before or after

				// check if the flow of content influences the pseudo element's position
				var posEl = $posEl[0],

					// when an element is positioned relative to the document, any margin on the HTML element is ignored
					isDocRelative = $posEl.is(MTF.stat.html),
					docMargin = isDocRelative ? parseFloat(MTF.getCSS(posEl, 'margin-top')) : 0,

					// ensure we insert a valid tag for the container (html/body not allowed)
					tagName = posEl.tagName.toLowerCase(),
					isBodyOrHTMLPosEl = (tagName === 'html' || tagName === 'body'),
					posElTagName = isBodyOrHTMLPosEl ? 'div' : tagName,

					// we don't want to add the whole page HTML to our test positioning div (even though it would be more accurate)
					contentFlowMatters = !isBodyOrHTMLPosEl &&
						(
						// and content flow only matters for non absolute/fixed elements
						itemCSS.position === 'static'
						|| itemCSS.position === 'relative'
						|| itemCSS.position === 'sticky'
					), // && $posEl.is($this),

					// get the HTML content if flow matters
					outerHTML = contentFlowMatters ? posEl.outerHTML: '<'+posElTagName+'></'+posElTagName+'>',

					// get the computed props for direct element
					// (even if contentFlow doesn't matter, so that styles are inherited)
					directElCSS = MTF.getCSS($this[0], props.boxModel.concat(props.content));

					delete itemCSS.transform;

					// for some reason margin throws things off - check.
					var directElCSSString = TvrCom.config_obj_to_string(
							directElCSS, false, '; ', {
								// we exclude margin values as this will throw off the posRect offset coordinates
								'margin-top': 1,
								'margin-right': 1,
								'margin-bottom': 1,
								'margin-left': 1,
							}
						)
						.replace(/"/g, "'"), // so font-family with quotes don't break CSS string

						//directElCSSString = '';

					// but use the CSS for the positioning el to set the bounding box
					posElBoundingCSS = '; position: absolute; top:'+(offset.top-docMargin)+'px;' +'left:'+offset.left+'px;'
						+'; width:'+posRect.outerWidth+'px;' +'height:'+(posRect.outerHeight+docMargin)+'px;'
						+'box-sizing: border-box; border-style: solid; margin:0 !important; opacity:.4; background: coral;',

					ast = MTace.HTMLparser.parse(outerHTML, {}, {
							tagIndex: -1,
							data: {}
						}),
					astItem = ast[0];

				astItem.attrs = MTF.merge_html_atts(astItem.attrs, {
					id: 'mt-pseudo-container-el',
					class: 'mt-pseudo-container-el',
					style: directElCSSString+posElBoundingCSS // merge with any styles too
				}, {id: 1});

				if (!astItem.children){
					astItem.children = [];
				}

				// we want to query the untransformed bounding box, any transform will be added to the overlay/placeholder
				delete itemCSS.transform;

				// build a real tag that has the styles of the pseudo element so we can query it's position and outer dimensions
				var newPseudoTag = MTF.test_pseudo_tag(pseudoEl, itemCSS);

				MTF.add_pseudo_arr_item(pseudoEl, newPseudoTag, astItem);

				// we also need to create a test div for the other before/after if content flow matters
				if (contentFlowMatters){

					var	otherPseudo = pseudoEl === '::before' ? '::after' : '::before',
						otherPseudoCSS = MTF.getCSS($this[0], props.boxModel.concat(props.content, props.pseudoOnly), otherPseudo);

					delete otherPseudoCSS.transform;

					if (otherPseudoCSS.content !== 'none'){
						var otherPseudoTag = MTF.test_pseudo_tag(otherPseudo, otherPseudoCSS, true);
						MTF.add_pseudo_arr_item(otherPseudo, otherPseudoTag, astItem);
					}

				}

				// convert as to an HTML string for inserting
				var updatedOuterHTML = MTace.HTMLparser.stringify(ast);

				// insert the container and pseudo el imposter into the dom
				console.log('Adding HTML', ast); // , updatedOuterHTML

				MTF.stat.posLayer.html(updatedOuterHTML);

				var testPosEl = document.getElementById("mt-pseudo-container-el"),
					testPseudoEl = document.getElementById("mt-test-pseudo-el"),

					// query the bounding rect of the pseudo el
					rect = MTF.get_adjusted_rect(testPseudoEl, nonStaticBodyAdjust);

				rect.zIndexBehindDirectEl = parseInt(directElCSS['z-index']) > parseInt(itemCSS['z-index']);

				//console.log('updatedOuterHTML', ast, posRect, rect);

				//console.log('The test stuff', ast, posRect, rect, $posEl, $this);
				//console.trace();

				// remove the temp elements
				//testPosEl.remove();

				TvrCom.endT(arguments, 1);

				// return the coordinates
				return rect;

			},*/

					merge_html_atts: function(origAtts, newAtts, exclude){

						origAtts = origAtts || {};

						var keys = Object.keys(newAtts);

						for (var i = 0; i < keys.length; i++) {

							var key = keys[i];

							if (origAtts[key] && !exclude[key]){
								origAtts[key]+= ' '+newAtts[key];
							} else {
								origAtts[key] = newAtts[key];
							}

						}

						return origAtts;

					},

					add_pseudo_arr_item: function(pseudoEl, tag, item){
						if (pseudoEl === '::before'){
							item.children.unshift(tag);
						} else {
							item.children.push(tag);
						}
					},

					test_pseudo_tag: function(pseudoEl, itemCSS, otherPseudo, returnString){

						var suffix = otherPseudo ? '-other' : '',
							baseClass = 'mt-test-pseudo-el',
							typeClass = baseClass+'-'+pseudoEl.replace('::', ''),
							debugColor = pseudoEl === '::before' ? 'purple' : 'pink',
							ast = {
								name: 'span',
								type: 'tag',
								attrs: {
									id: baseClass+suffix,
									class: baseClass+suffix+' '+typeClass,
									style: TvrCom.config_obj_to_string(itemCSS, false, '; ')
											// so font-family with quotes don't break CSS string
											.replace(/"/g, "'")
										+'; box-sizing: border-box; border-style: solid; background-color: '+debugColor+'; opacity: .4'
								},
								children: [
									{
										type: 'text',
										content: itemCSS.content === 'none'
											? ''
											: itemCSS.content.replace(/"/g, '')
									}
								]
							};

						if (returnString){
							return '<span id="'+ast.attrs.id+'" class="'+ast.attrs['class']+'" ' +
								'style="'+ast.attrs.style+'">'+ast.children[0].content+'</span>';
						} else {
							return ast;
						}

					},

					overlayCSSProps: {
						boxModel: [
							'border-top-width',
							'border-right-width',
							'border-bottom-width',
							'border-left-width',
							'margin-top',
							'margin-right',
							'margin-bottom',
							'margin-left',
							'padding-top',
							'padding-right',
							'padding-bottom',
							'padding-left',
							'transform'
						],
						content: [
							'display',
							'z-index',

							// for inline elements, width and height will be auto so we need to include
							// properties that affect content dimensions
							'font-family', 'font-size', 'line-height', 'font-weight',  'font-style', 'font-variant',
							'text-indent', 'word-spacing', 'letter-spacing','word-wrap', 'white-space', 'direction', 'vertical-align',


							'flex-direction', 'flex-wrap', 'column-gap','row-gap',
							'grid-auto-flow', 'grid-template-columns', 'grid-template-rows', 'grid-auto-rows', 'grid-auto-columns',
							'align-items', 'justify-items', 'justify-content',  'align-content', 'grid-template-areas',
							'grid-row-start', 'grid-row-end', 'grid-column-start', 'grid-column-end',

							// by applying the computed width and height of the pseudo element,
							// we can omit the above properties (I think)
						],
						pseudoOnly: [
							'position', 'top', 'right', 'bottom', 'left', 'width', 'height',  'content', //'z-index',
							'clip-path',
							'flex-grow', 'flex-shrink', 'flex-basis', 'align-self', 'order',
							'float', 'clear'
							// 'transform', no we need to untransformed bounding box, we apply the transform to
							// clickable overlays that are added when hovering over the main el
							//'box-sizing' - no, this has to be set to border-box, the width and height include this
						]
					},

					// get the computed props necessary for positioning and highlighting the box-model
					get_overlay_css_props: function(pseudoEl){

						var props = MTF.overlayCSSProps,
							pseudoProps = pseudoEl
								? props.content.concat(props.pseudoOnly)
								: [];

						return props.boxModel.concat(pseudoProps);
					},

					get_container_style: function(posRect, pseudoEl, transform, display){

						var containerStyle =
							'width:'+posRect.outerWidth+'px;' +
							'height:'+posRect.outerHeight+'px;' +
							'top:'+posRect.offset.top+'px;' +
							'left:'+posRect.offset.left+'px;';

						// transform has no effect if display is inline,
						// so do not add to keep dync with overlay which us always display: block (due to abs positioning)
						if (pseudoEl && display !== 'inline'){
							containerStyle+= 'transform:'+transform+';';
						}

						return containerStyle;
					},

					create_overlay_container: function($this, config, $triggerEl, nonStaticBodyAdjust, forSelected){

						TvrCom.startT('overlay_prep');

						if (nonStaticBodyAdjust === undefined){
							nonStaticBodyAdjust = MTF.nonStaticBodyAdjust();
						}

						//console.log('The config', $.extend(true, {}, config))

						var i = 0,
							s,
							length,
							j = MTF.overlayCount,
							sides = [ 'left', 'top', 'right', 'bottom' ],
							options = { padding: true, margin: true, border: true, content: true },
							container = '',
							containerInner = '',
							containerStyle = '',
							marginStyle = '',
							paddingStyle = '',
							borderStyle = '',
							contentStyle = '',
							offset,
							boundingClientRect,
							pseudoEl = config.css
								? TvrCom.get_pseudo_el(config.css)
								: null; // hover targeting does not have css
						pseudoEl = pseudoEl ? pseudoEl[0] : null;

						// don't apply more than one overlay to an element or invisible elements, or already selected (unless highlight is off)
						if (
							(!$this.hasClass('tvr-element-overlay') || !TvrUi.stat.tvr.hasClass('mt_highlight'))
							&& $this.is(':visible')
						){

							if (forSelected){
								//console.log('adding class tvr-element-overlay');
								$this.addClass('tvr-element-overlay');
							}

							// get the computed props necessary for positioning and highlighting the box-model
							var props = MTF.overlayCSSProps,
								propsList = MTF.get_overlay_css_props(pseudoEl);

							//console.log('The overlay container', config.css, $.extend(true, {}, config))

							// todo - we don't actually need the css when it's a hover action - just the rect

							var itemCSS = MTF.getCSS($this[0], propsList, pseudoEl);

							// the width and height of a pseudo element that doesn't exist will be auto,
							// which can give the highlight overlay dimensions when there are none, so fix
							if (pseudoEl && itemCSS.content === 'none'){
								itemCSS.width = 0;
								itemCSS.height = 0;
								//console.log('we overrode the dimensions', pseudoEl, itemCSS.content)
							}

							// save the transform value as it will be deleted before applying inline CSS to the pseudo element
							var	transform = itemCSS['transform'],

								// cache border numeric values as they will be used in various calculations
								border = {
									top: parseFloat(itemCSS['border-top-width']),
									right: parseFloat(itemCSS['border-right-width']),
									bottom: parseFloat(itemCSS['border-bottom-width']),
									left: parseFloat(itemCSS['border-left-width'])
								},
								posRect = MTF.get_positioning_rectangle(
									$this, nonStaticBodyAdjust, pseudoEl, itemCSS, props, config.css
								);

							offset = posRect.offset;
							boundingClientRect = posRect.boundingClientRect;

							//console.log('posRect', posRect, itemCSS);

							// main container
							containerStyle = MTF.get_container_style(posRect, pseudoEl, transform, itemCSS.display);

							var selsTargetClass = (MTF.isUsingExistingSel() || config.con === "sel-preview")
									? ' mt-sels-target'
									: '',
								contextMenu = '';

							//console.log('The dom', $.extend(true, {}, MTF.dom));

							// for trigger el, we include the container,
							// which is hidden unless the user is using mouseenter highlight (e.g. spotlight)
							// that hides the trigger el div, but allows for highlighting the
							// trigger el with this container, if it's included in the other set
							if ($this.is($triggerEl)){
								selsTargetClass+= ' for-mt-trigger-el';
							}

							// style grid highlight a bit differently, inline with the purple grid lines
							if (config.con === 'grid-nth-item'){
								selsTargetClass+= ' for-mt-grid-nth';
							}

							container = '<div id="over-cont-'+j+'" ' +
								'class="tvr-overlay tvr-container-overlay'+selsTargetClass+'" ' +
								'style="'+containerStyle+'">';

							// Margin overlay should have negative margins identical to the element's margins
							if (options.margin){

								marginStyle = '';
								for (i = 0; i < sides.length; i++) {
									s = sides[i];
									var sideMargin = parseFloat(itemCSS['margin-'+s]);

									// negative offset
									length = 0 - sideMargin; // - parseInt(itemCSS['border-'+s+'-width'])
									marginStyle+= s+':'+(length) + 'px;';

									// add padding for margin thickness
									marginStyle+= 'padding-'+s+':'+sideMargin+ 'px;';

								}
								containerInner+= '' +
									'<div class="tvr-overlay tvr-margin-overlay" style="'+marginStyle+'">' +
									'<div class="tvr-mask"></div>' +
									'</div>';
							}

							// Border overlay
							if (options.border){
								borderStyle = '';
								for (i = 0; i < sides.length; i++) {
									s = sides[i];
									// add padding for border thickness
									borderStyle+= 'padding-'+s+':'+border[s]+ 'px;';
								}
								containerInner+= '' +
									'<div class="tvr-overlay tvr-border-overlay" style="'+borderStyle+'">' +
									'<div class="tvr-mask"></div>' +
									'</div>';
							}

							// Padding overlay is easy - it just sits inside the element
							if (options.padding){

								paddingStyle = '';

								for (i = 0; i < sides.length; i++) {
									s = sides[i];
									var sidePadding = parseFloat(itemCSS['padding-'+s]);
									paddingStyle+= 'padding-'+s+':'+sidePadding+ 'px; '+s+':'+border[s]+ 'px;';
								}

								containerInner+= '' +
									'<div class="tvr-overlay tvr-padding-overlay" style="'+paddingStyle+'">' +
									'<div class="tvr-mask"></div>' +
									'</div>';
							}

							// finish container and add to containers string
							container+= containerInner+contextMenu+'</div>';

						}

						TvrCom.endT('overlay_prep');

						//console.log('The container stuff', $this, $this.attr('class'))


						return {
							container: container,
							containerInner: containerInner,
							containerStyle: containerStyle,
							containerOffset: offset,
							boundingClientRect: boundingClientRect,
							marginStyle: marginStyle,
							paddingStyle: paddingStyle,
							borderStyle: borderStyle,
							contentStyle: contentStyle,

							// signal to position the breadcrumbs below if there is not enough room above
							posMetaBottom: offset && offset.top <= 23
						};

					},

					// refreash JS if js changed
					refreshJS: function(){ TvrCom.startT(arguments);

						// JS must be cleared from memory with full page refresh
						location.reload();
						TvrCom.endT(arguments)
					},

					// remove stylesheets from the head
					remove_stylesheets_and_post_css_refresh: function(removeStylesheets){

						if (removeStylesheets.length){

							var stylesheetsRemoved = false;

							// remove stylesheets if they exist
							for (var i = 0; i < removeStylesheets.length; ++i) {

								var el = removeStylesheets[i];

								// Zdenek was getting a bug 'cannot read property removeChild of null', I wasn't able to replicate
								if (el.parentNode){
									el.parentNode.removeChild(el);
									stylesheetsRemoved = true;
								}
							}

						}

						// post CSS refresh actions if stylesheets changed
						MTF.post_css_refresh();

					},

					refresh_stylesheet: function(updateConfig){

						// <style> with FF, <link> with webkit/ie
						var redundantLazyStylesheets = [],
							removeStylesheets = [],
							loadStylesheets = [],
							timeParam = '?reload=' + new Date().getTime(),
							allLazy = document.head.getElementsByClassName('lazyload');


						// allLazy will change with dom (as it's a live reference) which we don't want.
						// So build redundantLazyStylesheets array from individual elements
						for (var i = 0; i < allLazy.length; ++i) {

							var el = allLazy[i],
								url = (el.tagName.toLowerCase() === 'link') ? el.href : el.textContent,
								isMTstylesheet = url.indexOf('micro-themes') > -1;

							// existing lazyload stylesheets are only redundant if we are loading new
							if (updateConfig.mt && isMTstylesheet || updateConfig.gf && !isMTstylesheet){
								redundantLazyStylesheets.push(allLazy[i]);
							}

						}

						// if we're updating Microthemer's stylesheet
						if (updateConfig.mt){

							// orig stylesheet to be removed
							var origMT = $('#microthemer-css')[0];
							if (origMT){
								removeStylesheets.push(origMT);
							}

							// new stylesheet to load
							var MTstylesheet = TvrUi.microUrl+'-styles.css'+timeParam;

							loadStylesheets.push(MTstylesheet);
						}

						// if we're updating the Google fonts stylesheet
						if (updateConfig.gf){

							// orig stylesheet to be removed
							var origGF = $('#microthemer_g_font-css')[0];
							if (origGF){
								removeStylesheets.push(origGF);
							}

							// new stylesheet to load
							var g_url = TvrCom.checkObject(TvrUi.uiData, ['non_section', 'meta', 'g_fonts', 'g_url']);
							if (g_url){
								loadStylesheets.push(g_url+timeParam.replace('?', '&'));
							}
						}

						// consolidate all stylesheets to be removed
						removeStylesheets = removeStylesheets.concat(redundantLazyStylesheets);

						//console.log('remove stylesheets', removeStylesheets)
						//console.log('load stylesheets', loadStylesheets)

						// if we have stylesheets to load
						if (loadStylesheets.length){

							//console.log('loadStylesheets', loadStylesheets)

							// lazyload new stylesheet, and run code in callback after stylesheet has loaded
							window.tvrLazyLoad.css(loadStylesheets, function (arg) {

								// remove redundant stylesheets
								MTF.remove_stylesheets_and_post_css_refresh(removeStylesheets);

							}, 'done');
						}

						else {

							// remove redundant stylesheets (if there are any)
							MTF.remove_stylesheets_and_post_css_refresh(removeStylesheets);

						}

					},

					// actions to perform after CSS has finished updating
					post_css_refresh: function(){

						MTF.getAndUpdateCompStyles(false, false);

						// redo the highlighting as this may need changing if the dimensions changed
						MTF.reposition_overlays({con:'reg'});

						// reinstate highlighting that may have been switched off
						// when typing in input or editor(input/editor)
						/*TvrCom.action_after_timeout('highlight_resume_delay', 800, {
					item: function(){
						TvrUi.get_local_window_function('maybe_reinstate_mt_highlight')();
					}
				});*/


						// turn the loading wheel off
						if (TvrCom.in_array(TvrLang.refresh_styles, TvrUi.progStatus)) {

							MTsave.update_prog_indicator(
								'minus',
								false,
								TvrLang.refresh_styles
							);

						}

						//console.log('post CSS refresh happened');

						// signal that stylesheet rules cache needs to be repopulated
						TvrUi.reinitRules = true;

						// the new page might not have as much CSS - not sure about this
						//TvrUi.tooMuchCSS = false;

						// and refresh now if computed CSS/Inspector are showing
						TvrUi.maybeUpdateInspectorPanels({
							updateComputed: 1,
							updateStyles: 1
						});

					},

					// system for writing CSS to head for instant live preview
					styleNodes: {
						'dynSeperator':[], // add a node simply as a marker for inserting stylesheet before it
						'preview': [],
						'animation': [], // special case for running animation on demand
						'pause_animation': []
					},

					// get a collection of style node references from an array of ids
					get_style_nodes: function(M, meta, asObjects){

						meta = meta ? meta : MTloop.get_style_node_meta(M);

						var styleNodes = [];

						for (var i = 0; i < meta.length; i++) {

							var id = meta[i].id,
								node = document.getElementById(id);

							// include dom reference in meta object
							meta[i].node = node;

							// if style node exists add to array
							if (node){

								var item = asObjects
									? meta[i]
									: node;

								styleNodes.push(item);
							}

						}

						return styleNodes;
					},

					// get a collection of style node references from an array of ids
					edit_style_nodes: function(M, action, styleNodes){

						styleNodes = styleNodes ? styleNodes : MTF.get_style_nodes(M, false, true);

						//console.log('styleNodes', styleNodes);

						for (var i = 0; i < styleNodes.length; i++) {

							var style = styleNodes[i],
								node = style.node;

							switch(action) {

								case 'delete':
									node.parentNode.removeChild(node);
									break;

								case 'reorder':
									var $prevNode = this.getPreviousSectionNode(style.mq_key, style.section_key);
									//var $prevNode = this.getPreviousSelectorNode(style.mq_key, style.section_key, style.selector_key);
									$(node).detach().insertAfter($prevNode);
									break;
							}

						}

					},

					update_preview_style_node: function(parts, css, mediaQuery, doNotRepositionOverlays){

						// don't update the styles when re-targeting as that can be jarring sometimes
						// the style node will get updated for the section (across all MQs in the section)
						if (TvrUi.retargetSelector){
							//console.log('Do not update node due to retargeting')
							return false;
						}

						var nodeID = MTloop.format_css_node_id(parts),
							$node = $('#'+nodeID);

						// manually add media query code if passed in
						if (mediaQuery){
							css = mediaQuery+" {\n"+css+' } ';
						}

						/*console.log('parts', parts, nodeID, $node);
						console.log('the css', css);*/


						if (!TvrCom.isDomEl($node)){
							//console.log('It was not a node', $node);
							$node = MTF.add_preview_style_node(parts, nodeID);
							//console.log('Gathered a new node', $node);
						}

						$node.text(css);

						// update the highlighting (still requires a timer to work annoyingly)
						//console.log('checking doNotRepositionOverlays', doNotRepositionOverlays)
						if (!doNotRepositionOverlays){
							TvrCom.action_after_repaint({
								item: MTF.reposition_overlays,
								args: [{
									con: (MTF.isUsingExistingSel() ? 'intelli' : 'reg') // is this the wrong way around?
								}]
							}, 150);
						}

					},

					add_preview_style_node: function(parts, nodeID){

						var mq_key = parts[1],
							sectionSlug = parts[2],
							mediaHack = MTfolder.folderNotLoading(sectionSlug) ? ' media="not all"' : '',
							//selectorSlug = parts[3],
							styleHTML = '<style id="'+nodeID+'"'+mediaHack+'></style>',
							$prevNode = this.getPreviousSectionNode(mq_key, sectionSlug);
						//$prevNode = this.getPreviousSelectorNode(mq_key, sectionSlug, selectorSlug);

						//console.log('add_preview_style_node', sectionSlug, mediaHack, $prevNode)

						if (TvrCom.isDomEl($prevNode)){
							this.insertAfter($prevNode, styleHTML);
							//console.log('added after $prevNode', $prevNode)
						}

						// Insert after the media query node if no previous section node
						else {

							let mqParts = parts.slice(0, -1),
								mqId = MTloop.format_css_node_id(mqParts),
								$lastNode = $('#mtprv-mt-end'),
								$mqNode = $('#'+mqId);

							// Ensure we have an MQ id placeholder appended to the end of not present
							if (!TvrCom.isDomEl($mqNode) && TvrCom.isDomEl($lastNode)){
								this.insertAfter($lastNode, '<style id="'+mqId+'"></style>');
								$mqNode = $('#'+mqId);
								//console.log('We added the MQ node', mqId);
							}

							// Add the section after the mq placeholder if added successfully
							if (TvrCom.isDomEl($mqNode)){
								this.insertAfter($mqNode, styleHTML);
								//console.log('We added after the MQ node', $mqNode);
							} else {
								//console.log('We STILL need to add the node for the section', mqId)
							}

						}

						return $('#'+nodeID);

					},

					// insert
					insertCopiedStyleNodes: function(origStyleNodes, $combObjs){

						var newStyleNodes = $combObjs.slice(2);

						for (var i = 0; i < origStyleNodes.length; i++) {

							var $orig = $(origStyleNodes[i]),
								$new = $(newStyleNodes[i]);

							this.insertAfter($orig, $new);
						}
					},

					// JS insertAfter utility function
					insertAfter: function($prevNode, newNode){
						$prevNode.after(newNode);
						//referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
					},

					/*insertAfter: function(referenceNode, newNode){
				//referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
			},*/

					// get item prev keys
					getPreviousSectionNode: function(mq_key, curSectionSlug) {

						return TvrUi.itemScan('section', 'prev', 'getPreviousNode', curSectionSlug, false, {
							incCurrentSection: false,
							mq_key: mq_key
						});
					},

					// get item prev keys
					/* getPreviousSelectorNode: function(mq_key, curSectionSlug, curSelectorSlug){

				return TvrUi.itemScan('selector', 'prev', 'getPreviousNode', curSectionSlug, curSelectorSlug, {
					incCurrentSection: true,
					mq_key: mq_key
				});

			},*/

					// add a new style node for animation etc
					add_styleNode: function(context, $afterThisNode){

						// create style node and come up with unique reference
						var styleNodes = MTF.styleNodes[context],
							styleNode = document.createElement('style'),
							nodeName = 'mt' + context + 'css-' + styleNodes.length,
							forceAppendMTStyleNodes = MTint.forceAppendMTStyleNodes();

						// add unique id and append to <head>
						styleNode.setAttribute("id", nodeName);

						// replace stylesheet with MT style nodes, where ever it may be
						// If could be somewhere in the body
						if (!forceAppendMTStyleNodes && TvrCom.isDomEl($afterThisNode)){
							var parentNode = $afterThisNode.parent()[0];
							parentNode.insertBefore(styleNode, $afterThisNode[0].nextSibling);
							//console.log('add the styles in the right place');
						} else {
							document.head.appendChild(styleNode);
						}

						// store id of style node in array (I'm guessing an array or object-based system will be useful later)
						styleNodes.push(nodeName);
					},

					// remove a style node
					remove_styleNode: function(context){

						var styleNodes = MTF.styleNodes[context];

						// get id of last added node
						var nodeID = styleNodes[ styleNodes.length-1 ];

						// remove style node from the head
						$('#'+nodeID).remove();

						// remove last array item
						styleNodes.pop();
					},

					// update dynamic CSS in the <head>
					update_dynamic_css: function(css, context, config){

						var styleNodes = MTF.styleNodes[context];

						// add style node if none have been added yet
						if (!styleNodes.length){
							MTF.add_styleNode(context);
						}

						// get id of last added node
						var nodeID = styleNodes[ styleNodes.length-1 ];

						// write the css to the head
						//console.log(document.getElementById(nodeID));
						document.getElementById(nodeID).innerHTML = css;
					},

					// run JS function after CSS3 animation or transition finishes
					after_animation: function($el, config){

						var events = config.type == 'transition'
							? 'transitionend.tvr webkitTransitionEnd.tvr oTransitionEnd.tvr otransitionend.tvr MSTransitionEnd.tvr'
							: 'oanimationend.tvr animationend.tvr webkitAnimationEnd.tvr';

						$el.on(events, function() {
							config.cb.apply(this, config.args);
							// unbind
							$el.off(events);

						});
					},

					/* come back to this later
			// pause animation
			pause_animation: function(config){
				//console.log('pause animation')
				var pause = config.ast_selector_string + ' { -webkit-animation-play-state: paused !important; animation-play-state: paused !important; }';
				MTF.update_dynamic_css(pause, 'pause_animation');
			},

			// resume paused animation by removing style node for pause
			resume_animation: function(){
				//console.log('resume animation');
				MTF.remove_styleNode('pause_animation');
			},
			*/

					// trigger animation
					trigger_animation: function(config, isInline){

						//if (!animationName) return;
						var selCode = config.ast_selector_string,
							unsetAnim = selCode + ' { -webkit-animation-name: none !important; animation-name: none !important;  }',
							applyAnim = config.flashCSSRules,
							$target_els = MTF.jquery_compat_sel_elements(config.ast_eventless_selector_string),
							$first_el = $target_els.first();

						// only run if els are targeted
						if (TvrCom.isDomEl($target_els)){

							MTWindow.MTlocal.maybe_hide_mt_highlight();
							//console.log('highlight off');

							// if JS event triggers animation
							if (config.isJSEvent){

								// if els don't yet have event class, add it.
								if (!$first_el.hasClass(config.JSEventClass)){
									$target_els.addClass(config.JSEventClass);
								}

								// if els already have event class, temp remove
								else {
									$target_els.removeClass(config.JSEventClass);
								}
							}

							// if root selector or pseudo, temp unset the animation by overriding animation-name
							else {
								MTF.update_dynamic_css(unsetAnim, 'animation');
							}

							// reapply animation
							window.requestAnimationFrame(function(time) {
								window.requestAnimationFrame(function(time) {

									// re-add event class if it was removed
									if (config.isJSEvent){
										$target_els.addClass(config.JSEventClass);
									}

									// write to head node
									MTF.update_dynamic_css(applyAnim, 'animation');

									// come back to this later
									//TvrUi.update_play_progress('start', config);

								});
							});

							// remove code from head after animation runs
							MTF.after_animation($first_el, {
								cb: function(){

									MTF.remove_styleNode('animation');

									MTF.reposition_overlays({con:'reg'});

									MTWindow.MTlocal.maybe_reinstate_mt_highlight();

									//console.log('highlight back on');

									// come back to this later
									//TvrUi.update_play_progress('end', config);
								}
							});

							// warn about animations not working on elements with display inline
							if (isInline || $first_el.css('display') === 'inline'){
								TvrUi.animation_inline_warning = {
									'short': TvrLang.inline_animation_short,
									'long': '<p>'+ TvrLang.inline_animation_long +'</p>',
									'type' : 'info'
								};
							}

						}


					},

					handle_shiftKey_selection: function(config){

						var e = config.e;

						//console.log('shift selection', e, e.shiftKey, TvrUi.previous_selector);
						//console.trace();

						// if shift key is being used
						if (e && e.shiftKey && TvrUi.previous_selector){
							TvrUi.joined_selectors = TvrUi.previous_selector.split(/\s*,\s*/);
							config.shiftKey = true;
						}

						else {
							TvrUi.joined_selectors = [];
						}

						return '';
					},

					// the user has selected an element they were hovering over by clicking once (or holding alt key)
					// or we are selecting first element the current selector targets
					select_element: function($el, config){ TvrCom.startT(arguments);

						TvrUi.elementIsBeingSelected = true;

						// with gutenberg, we only add MT classes when selecting an element
						// unless the option to always add classes has been enabled.
						if (TvrMT.integrate.gutenberg){

							let B = TvrMT.integrate.gutenberg;

							if ($el){

								// don't adjust targeting when doing the first click to bring up Gutenberg
								if ($el[0].tagName.toLowerCase() === 'body' || MTF.isOutsideGutenbergContent($el)){

									//console.log('Is outside content', MTF.isOutsideGutenbergContent($el))

									// body is only clickable before Gutenberg edit mode is active
									return false;
								}

								B.maybeAdjustMTUniqueClasses($el);
							}
						}

						//console.log('select_element', $.extend(true, {}, config));

						// Ensure that accumulating AI context is discarded now we're on a new element
						// (if the user manually selects another element - re-selection happens on each update)
						if (config.manualSelect){
							MTai.resetContext();
						}

						// update default selection config with passed values
						config = $.extend({
							wrapjQuery: false,
							scroll: true,
							updateComputed: 1,
							updateStyles: 1,
							updateHTML: !config.doNotUpdateDomSearch
						}, (config || {}));

						// cache if pseudo is selected in case we need to query this outside of selection functions
						TvrUi.pseudoSelected = config.pseudoSelected;

						//console.log('pseudoSelected', config.pseudoSelected);


						// SETUP VARS
						TvrCom.startT('select_element: set up vars');

						// ensure $el has correct (frontend) jQuery wrapper
						$el = config.wrapjQuery ? $($el) : $el;

						//console.log('select the $el', $el);
						//TvrCom.callStack();

						// update trigger el
						MTF.triggerEl = $el;


						// debug
						/*MTF.evaluateXPath(
							'./..',
							MTF.triggerEl[0]
						);*/
						// MTai.getNodeMeta(MTF.triggerEl, 'Currently selected element');

						// log if currently no elements being selected by the current selector
						if (!TvrCom.isDomEl(MTF.triggerEl)){
							config.zeroElements = 1;
						} else {
							config.isValidElement = 1;
							// so focus styling doesn't show - no, this creates bugs e.g. with builders that work on frontend
							// like Beaver Builder
							//$el.trigger('blur');
						}

						// ensure clicking elements doesn't create a text selection
						if (!TvrMT.integrate.gutenberg){
							TvrCom.clearSelection(MTF.stat.win, MTF.stat.doc);
						}

						// support shift multi-select, and abort if they are deselecting
						if (MTF.handle_shiftKey_selection(config) === 'deselect'){
							return false;
						}

						// hide hover target by setting style to nothing - it will return when hovering over a non-selected element
						MTF.hide_hover_targeting();

						// reset class for previous trigger el
						MTF.remove_trigger_previous_el_class();

						// add class to trigger el, so it can be distinguished from other els with .tvr-element-overlay
						if (config.isValidElement){
							$el.addClass('tvr-trigger-el');
						}

						// new dom object for storing data about the currently selected element
						MTF.setup_dom_object($el, config);

						// ensure overlay highlighting is on, but don't position els yet
						if (config.forceHighlight){
							//console.log('forceHighlight', config.forceHighlight)
							TvrUi.feature_on(0, 'mt_highlight', {fHTML:1, noSave:1});
						}

						TvrCom.endT('select_element: set up vars');

						// ANALYSIS & GENERATE

						TvrCom.startT('select_element: analyse and generate');

						// search the dom unless excluded
						if (!config.doNotUpdateDomSearch){
							MTF.search_parents_and_descendents(MTF.triggerEl, config);
						}

						// update the selector suggestions unless excluded
						if (!config.doNotUpdateSelectorSuggestions){
							//console.log('We do update the suggestions', $.extend(true, {}, config));
							MTF.build_selector_suggestions($el, config);
						} /*else {
					console.log('We do NOT update');
				}*/

						TvrCom.endT('select_element: analyse and generate');


						// INSTANT VISUAL UPDATES
						TvrCom.startT('select_element: instant visual updates');

						// update the existing selectors panel unless excluded
						// this action is forced when a user is customising the code and moved onto a new el
						// must come before reposition_overlays as sets TvrUi.existingSelSelected and only takes 1-2ms
						if (!config.doNotUpdateSelectorSuggestions || config.suggestionCustomisedForNewEl){
							//console.log('build existing sel options');
							MTF.existing_selector_options(MTF.triggerEl, config);
						}

						// update the full breadcrumbs and tightly nested element tabs so no jerky update after 5ms timer
						//TvrUi.update_breadcrumbs_and_nested_tabs(config);

						config.active_css = config.selectCurrentSelector ? TvrUi.curSelCSS : TvrUi.intelli_css;

						//console.log('config.active_css', config.active_css, config, TvrUi.curSelCSS, TvrUi.intelli_css)

						// update the overlays (must come after selectors have been generated)
						if (!config.doNotRepositionOverlays){
							MTF.reposition_overlays({

								// when selecting the current selector, pass reg otherwise flag different context
								con: config.selectCurrentSelector ? 'reg' : 'target-new',
								scroll: config.scroll,
								css: config.active_css
							});
						}


						TvrCom.endT('select_element: instant visual updates');

						// we defer actions after visual selection so browser doesn't wait before doing a repaint
						// this makes selection feel nice and snappy
						TvrCom.action_after_timeout('post_select_element', 5, {
							item: function(){
								TvrCom.startT('select_element: timer save opportunity');

								if (!MTF.dom.sels.final || !MTF.dom.search){
									return;
								}

								//console.log('post select runs', $.extend(true, {MTF: MTF}, config));

								// update the new selector suggestions HTML
								if (!config.doNotUpdateSelectorSuggestions){
									TvrCom.startT('build_selector_suggestions final bits');
									TvrUi.update_selector_suggestions(config);
									TvrCom.endT('build_selector_suggestions final bits');
								}

								//console.log('We should update breadcrumbs')
								TvrUi.update_breadcrumbs_and_nested_tabs(config);

								// update the parent/sibling/child dom nav arrows
								TvrUi.update_dom_arrows(config);

								// resume existing selector or create draft selector (unless the selection was triggered by selector navigation)
								if (!config.selectCurrentSelector){
									config.scroll = false;
									config.elementAlreadySelected = 1;
									TvrUi.resume_existing_or_set_draft_selector(MTF.triggerEl, MTF.dom, config);
								}

								// update the advanced inspection panels if showing
								//console.log('updating the panels', config)
								TvrUi.maybeUpdateInspectorPanels(config);

								// maybe update the recent custom prefixes menu if current (valid) prefix isn't already in it
								TvrUi.maybeUpdateRecentCustomPrefixes(MTF.dom);

								TvrUi.elementIsBeingSelected = false;

								TvrCom.endT('select_element: timer save opportunity');
							},
							args: []
						});



						TvrCom.endT(arguments, 0)
					},



					getElIndex: function($el, el, noDomCheck){

						//console.log('getElIndex', TvrCom.isDomEl($el, true), String( Array.prototype.indexOf.call( MTF.N, $el[0]) ), $el[0], MTF.N);

						el = el || $el[0];

						return noDomCheck || TvrCom.isDomEl($el)
							? String( Array.prototype.indexOf.call( MTF.N, el) )
							: 0;
					},

					// the user has clicked off the selected element
					/*element_unselected: function($clicked, e){ TvrCom.startT(arguments);

				//console.log('The element was unselected');

				//TvrUi.el_selected = 0;
				//MTF.stat.html.add(TvrUi.stat.tvr).removeClass('mt-element-selected');

				// fresh suggestions list
				TvrUi.redo_sug_sels('');

				if ($clicked){

					$clicked
						.trigger('blur')// so we can go back to normal hover (for update_stylesheet_rules())
						.trigger('mouseover');
				}

				TvrCom.endT(arguments)
			},*/

					// remove any artificial microthemer classes and extra spaces
					clean_classes: function(classString){ TvrCom.startT(arguments);

						var mtClasses = [

							// <html> tag classes
							'no-admin-bar-please',
							'mt_highlight',
							'grid_highlight',
							'mt-sels-target',
							'tvr-hh-mode',
							'mt-hover-bound',
							'targeting-or-retargeting',
							'showGridControls',
							'grid_highlight',
							'retarget_selector',
							'mt_dark_mode',
							'mt-zero-elements',


							// <body> classes
							//'logged-in',
							'wp-embed-responsive',
							'admin-bar',
							'no-customize-support',
							'customize-support',


							// el classes
							'tvr-trigger-el',
							'tvr-element-overlay',
							'tvr-static-overlay',
							'tvr-hover-element',

							// animation event classes
							'mt-click',
							'mt-mouseenter',
							'mt-focus',
							'mt-inview_once', // must come before mt-inview else _once is incorrect class
							'mt-inview'

						];

						// ignore non-permanent classes added by builders
						var ignoreClasses = MTint.filter_mt_ignore_atts('classes', mtClasses, classString);

						TvrCom.endT(arguments);

						return this.strip_ignore_classes(classString, ignoreClasses);

					},

					// remove any artificial microthemer classes and extra spaces
					clean_ids: function(idString){

						// ignore non-permanent ids added by builders
						var ignoreIDs = MTint.filter_mt_ignore_atts('ids', [
							'wp--skip-link--target', //2023 theme adds this to <main>
							'^mec_.+?', // Elementor modern events calendar addon uses dynamic ids
							'^yui_.+?', // Beaver Builder adds dynamic ids with Yahoo UI library
							'^block-[a-z0-9-]{36}$',
							'^\\d+.*$', // ignore ids that start with a number - they are invalid
						], idString);

						//console.log('ignoreIDs', idString, ignoreIDs, '=', this.strip_ignore_ids(idString, ignoreIDs))

						return this.strip_ignore_ids(idString, ignoreIDs);
					},

					strip_ignore_classes: function(str, attsArr){

						let splitAtts = str.split(/\s+/);

						for (let i = splitAtts.length -1; i >= 0; i--) {
							for (let j = attsArr.length -1; j >= 0; j--) {
								if (splitAtts[i] === attsArr[j]){
									splitAtts.splice(i, 1);
								}
							}
						}

						return splitAtts.join(' ');
					},

					strip_ignore_ids: function(str, attsArr){

						var pcPattern = new RegExp('\\b(?:'+attsArr.join('|')+')\\b', 'g'),
							cleanedStr = str
								.replace(pcPattern, '')
								.replace(/\s\s+/g, ' ') // remove any doube-spaces in between classes
								.replace(/^\s+|\s+$/g, ''); // removes trailing white space

						/*console.log('the orig string', str);
						console.log('the ignore atts', attsArr);
						console.log('the cleanedStr', cleanedStr);*/

						return cleanedStr;

					},

					isUsingExistingSel: function(){
						return MTF.dom.mSelsCount && TvrUi.existingSelSelected;
					},

					// set the max-width on the element meta for the hover and primary overlays
					// so no horizontal overlap
					prevent_overlay_creating_scrollbars: function($container, overlay, type){

						// not sure why, but sometimes containerOffset was not defined when hovering
						if (overlay.containerOffset){

							var leftOffset = overlay.containerOffset.left,
								scrollbarWidth = TvrUi.pref.mt_dark_mode ? 19 : 18,
								metaEl = $container.find('.mt-element-metas')[0];

							metaEl.style.cssText = "max-width: calc(100vw - "+(leftOffset+scrollbarWidth)+"px);"
						}

					},


					update_frontend_controls: function($triggerEl, config){

						var $frontendControls = MTF.stat.frontendControls,
							overlay = MTF.triggerElOverlay;

						//console.log('the overlay stuff', overlay, $triggerEl, config);

						// set the positioning style for the container
						$frontendControls[0].style.cssText = overlay.containerStyle;

						// prevent horizontal overlay if meta bleeds out of document
						MTF.prevent_overlay_creating_scrollbars($frontendControls, overlay);

						$frontendControls.find('#mt-bm-shading').html(overlay.containerInner);

						// update the sels target class
						var $els = $frontendControls.add(TvrUi.stat.tvr),
							isUsingExistingSel = MTF.isUsingExistingSel(),
							existingSelID = MTF.dom.existingSelID,
							addClasses = '',
							removeClasses = '';

						if (MTlayout.detached_window_available(true)){
							$els = $els.add(TvrMT.MTdetached.stat.tvr);
						}

						// existing selector targets the element
						if (isUsingExistingSel){
							addClasses+= ' mt-sels-target';
							let section_slug = TvrUi.section_slug(existingSelID);

							if (TvrUi.is_dis(TvrUi.stat.body.find('#strk-'+section_slug)) || MTfolder.folderNotLoading(section_slug)){
								addClasses+= ' mt-disabled-folder';
							} else {
								removeClasses+= ' mt-disabled-folder';
							}
						} else {
							removeClasses+= ' mt-sels-target mt-disabled-folder';
						}

						// we need different styling if sels exist (so the radios show)
						// even if the user has opted to create an additional selector
						//console.log('MTF.dom.mSelsCount', MTF.dom.mSelsCount, config, MTF.dom)
						if (MTF.dom.mSelsCount){
							addClasses+= ' mt-sels-target-at-all';
						} else {
							removeClasses+= ' mt-sels-target-at-all';
						}

						// update classes all in one go
						if (addClasses){
							$els.addClass(addClasses);
						} if (removeClasses){
							$els.removeClass(removeClasses);
						}

						// signal if meta should display below
						MTF.toggle_meta_below_class($frontendControls, overlay.posMetaBottom);

						//$frontendControls.removeClass('mt-paint-hide');

					},

					// position the iframe window context menu trigger
					align_frontend_controls: function(offset, $frontendControls){
						$frontendControls.offset({
							top: offset.top, // $menuTrigger.outerHeight()
							left: offset.left
						});
					},

					// ensure the quick go menu doesn't display out of view // todo apply to new system, and shift menu
					align_targeting_dropdown_menu: function(){

						// todo - permutations of up/down, left/right

						/*TvrCom.startT(arguments);

				var $obj = MTF.stat.contextMenu;
				var $inner = $('#mt-code-suggestions');
				var off = MTF.off_screen($inner);

				/!* position the inner div absolutely if required *!/
				$inner.css({
					position: off.on ? 'static' : 'absolute',
					right: off.right ? '-'+$obj.outerWidth()+'px' : 'auto',
					bottom: off.bottom ? '-'+$obj.outerHeight()+'px' : 'auto'
				});

				TvrCom.endT(arguments)*/
					},

					get_existing_sel_focus_index: function(config, mSels){

						var	radioIndex = 0,
							searchKey = config.selID ? 'id' : 'code',
							searchValue = config.selID
								? config.selID
								: (config.existingSelCSS);

						// we should select the radio for the existing sel if selecting current
						if (config.selectCurrentSelector){

							var matchedKey = TvrCom.in_array(searchValue, mSels, false, searchKey);

							if (matchedKey !== false){
								radioIndex = matchedKey;
							}

							//console.log('the match for the search', matchedKey, searchKey, searchValue, mSels )

						}

						//console.log('existing_selector_options', config, mSels);

						return parseInt(radioIndex);
					},

					// existing selectors, and new selectors
					existing_selector_options: function($el, config){ TvrCom.startT(arguments);

						// get a list of current selectors that match the element
						var html = '',
							selAlreadyExists = {},
							mSels = MTF.dom.mSels,
							radioIndex = MTF.get_existing_sel_focus_index(config, mSels);

						//console.log('existing_selector_options', config, MTF.dom);

						// if there are sels, add to suggestion options
						if (MTF.dom.mSelsCount){

							// we default to existing if there are any
							TvrUi.existingSelSelected = true;

							//MTF.stat.html.add(TvrUi.stat.tvr).addClass('mt-sels-target');

							// generate menu HTML
							for (var i in mSels){
								if ( ! mSels.hasOwnProperty(i) ) continue; // for compat

								var item = mSels[i],
									code = TvrCom.regular_escape_quotes(item['code']),
									title = !TvrUi.pref['selname_code_synced'] ? 'title="'+code+'"' : '',
									inFocusClass = (parseInt(i) === radioIndex && (!TvrUi.retargetSelector && !config.customCSSVal))
										? ' in-focus'
										: '';

								//console.log('radioIndex', radioIndex, item.n,  item)

								if (inFocusClass){

									config.intelli_css = code;

									TvrUi.intelli_css = code;
									//console.log('Updated TvrUi.intelli_css because we have an existing selector');

									// store the id so we can check if the current folder is disabled or not loading
									MTF.dom.existingSelID = config.selectCurrentSelector
										? TvrUi.selInFocusID
										: item.id;

									//console.log('What do we have', item, config);
								}

								html+=
									'<div class="mt-matching-item mt-matching mt-el-quick-item mt-selector-suggestion '
									+inFocusClass+'" data-code="'+code+'" data-type="'+item.type+'" data-line="'+item.line+'" '+title+
									'data-id="'+item.id+'" >'+
									TvrMT.data.templates.existing_sel_radio +
									'<span class="mt-item-name">'+item.sName+'</span>'+
									'<span class="num-els-icon-wrap">'+
									TvrUi.num_els_icon(item['n'])+
									'</span>'+
									'</div>';

								// log existing selectors so we don't suggest again in Create new
								selAlreadyExists[mSels[i]['code']] = true;
							}

							// if user has customised a selector that now targets a new element that already already targeting
							// the existing selectors will show, and the heading will change from Create a new selector to create additional
							// ensure those additional options are still visible
							if (config.suggestionCustomisedForNewEl){
								TvrUi.feature_on(false,'create_additional_selector');
							}

						}

						// currently untargeted, show [+] button
						else {
							TvrUi.existingSelSelected = false;
							//MTF.stat.html.add(TvrUi.stat.tvr).removeClass('mt-sels-target');
						}

						TvrUi.bothSuggestionAreas('.mt-existing-selectors').html(html)

						//TvrUi.stat.existingSelectors.html(html);

						TvrCom.endT(arguments, 0);

					},


					// object for storing the elements HTML, including surrounding parents, children, adn siblings
					dom: {
						// define anything needed to avoid undefined error
						'sels': {
							nothing:[]
						}
					},

					// For storing DOM analysis of the wider page
					domAI: {},

					// array for logging index of all HTML nodes on the page (refreshes when selected wizard is opened)
					N: [],

					// object for logging index of selected element, and an array for its child HTML nodes
					Nsub: {
						index: '',
						N: []
					},

					// cross browser element.matches to test if el is targeted by a given selector
					selectorMatches: function(el, selector, pseudo, returnObj){ //TvrCom.startT(arguments);
						var p = Element.prototype;
						var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector ||
							p.msMatchesSelector || function(s) {
								return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
							}
						var doesMatch = false;

						// remove pseudos so we can check for element match more precisely
						var baseSelector = TvrCom.strip_state_pseudo(selector),
							beforeAfterPattern =  TvrCom.regex(MTdd.reg.trailing_before_after(), { flags: 'i'}),
							beforeAfterEl = selector.match(beforeAfterPattern);

						if (beforeAfterEl){
							baseSelector = selector.replace(beforeAfterPattern, '');
							//console.log('The selector changed', baseSelector, selector);
						}

						try {
							doesMatch = f.call(el, baseSelector);

							// if we have a match, make sure the selected HTML line pairs up with the pseudo element
							if (doesMatch){
								if (
									// if the selector has a pseudo, but the HTML line does not match ::before or ::after
									beforeAfterEl && pseudo !== beforeAfterEl[1] ||

									// or there was no pseudo in the selector, but the HTML line is selecting one
									!beforeAfterEl && pseudo
								){
									doesMatch = false; // the MT selector does not actually match the selection
									//console.log('In fact, no match', beforeAfterEl, MTace.HTMLLine, selector)
								}
							}

						} catch(exception){
							if (TvrUi.TVR_DEV_MODE){
								//console.log('Invalid selector present', exception, el, baseSelector);
							}
						}

						/*console.log('the sel matches', {
							baseSelector: baseSelector,
							selector: selector,
							doesMatch: doesMatch,
							pseudo: beforeAfterEl ? beforeAfterEl[1] : false
						});*/

						//TvrCom.endT(arguments)
						return returnObj
							? {
								baseSelector: baseSelector,
								selector: selector,
								doesMatch: doesMatch,
								pseudo: beforeAfterEl ? beforeAfterEl[1] : false
							}
							: doesMatch;
					},

					// check if a media query applies to the page
					mediaMatches: function(query){
						return window.matchMedia(query).matches;
					},

					// the parent level sometimes needs to be obtained from the selector code
					get_parent_level_from_selector: function(code, fallBackLevel){

						var nodes = TvrCom.checkObject(MTF, ['dom', 'search', 'nodes']),
							level = fallBackLevel;

						if (nodes){

							var firstSel = code ? code.split(',')[0] : '', // use first if multiple comma sep selectors
								parentPart = TvrUi.sel_trail(TvrCom.regular_escaped_to_non_escaped(firstSel)).pieces[0];

							/*console.log('We check the node for match with el',
						parentPart
						//TvrCom.regular_escaped_to_non_escaped(code), parentPart, el, nodes
					);*/

							var	el = false;

							try {
								el = document.querySelector(parentPart); // 	$el =  $(parentPart).first();
							} catch (error){
								// no biggy
							}

							//console.log('El from get_parent_level_from_selector', parentPart, el)

							if (el){

								// loop nodes and compare $el.is()
								for (var i = 0; i < nodes.length; i++) {
									if (el.isSameNode(nodes[i].$el[0])){
										level = i;
										//console.log('We found the right level', level);
										break;
									} else {
										//console.log('They are not the same', el, nodes[i].$el[0], nodes[i]);
									}
								}
							}



						}

						return level;
					},

					// adjust selectors to make them jQuery compatible and return filtered dom els
					jquery_compat_sel_elements: function(code, returnCode){ TvrCom.startT(arguments);

						// convert cus-quot; to "
						code = TvrCom.custom_to_non_escaped(code);

						// ensure the user hasn't entered CSS {} styles with the selector
						var tmp = TvrUi.analyse_sel_code(code);
						code = tmp['code'];

						// get any pseudo classes and elements in an array for processing
						var $sel_elements,
							pseudo = TvrCom.pseudo_str_to_arr(code);

						// if the selector contains a pseudo class/element
						if (pseudo){

							// get the css filter config
							var pseudoObj = TvrUi.get_pseudo_config(pseudo);

							// loop through pseudos applying string adjustments
							for (var pCE in pseudoObj){

								if ( ! pseudoObj.hasOwnProperty(pCE) ) continue; // for compat

								var config = pseudoObj[pCE];

								// sometimes the pseduo just needs adjusting for jquery
								var repl = config['replace'] ? config['replace'] : '';

								// remove or replace the pseudo selector
								if (config['strip']){
									code = code.replace(pCE, repl);
								}
							}

							// we just want the modified selector code when saving selectors for JS events
							if (returnCode){
								return code;
							}

							// get the full set of dom elements (minus $admin_bar), with possible filtering to come
							$sel_elements = MTF.validate_and_filter_excluded_els(code);

							// run any filters
							for (pCE in pseudoObj){

								if ( ! pseudoObj.hasOwnProperty(pCE) ) continue; // for compat

								config = pseudoObj[pCE];

								if (config['filter']){

									// f.call in selectorMatches() was triggering illegal invocation, maybe if no $els
									if ($sel_elements.length){

										$sel_elements = $sel_elements.filter(function(){

											var $this = $(this),
												el = $this[0],
												tagName = TvrCom.get_tagName($this),
												isInputForm = (tagName == 'input' || tagName == 'form'),
												val = $this.val(),
												min = $this.attr('min'),
												max = $this.attr('max');

											// return filter boolean
											switch(pCE) {
												case ':in-range':
													return (min && val >= min && max && val <= max);
													break;
												case ':out-of-range':
													return (min && val < min && max && val > max);
													break;
												case ':invalid':
													return MTF.selectorMatches(el, ':invalid');
													break;
												case ':valid':
													return MTF.selectorMatches(el, ':valid');
													break;
											}
										});
									}


								}
							}
						}

						// no pseudo, don't target WP admin bar etc
						else {

							// we just want the modified selector code when saving selectors for JS events
							if (returnCode){
								return code;
							}

							$sel_elements = MTF.validate_and_filter_excluded_els(code);
						}

						TvrCom.endT(arguments)
						return $sel_elements;

					},

					format_att_selector: function(tagName, found, att, markup){
						var detail;
						switch(att) {
							case 'id':
								detail = '#'+found;
								break;
							case 'class':
								detail = '.'+found.split(' ')[0]; // first class
								break;
							case 'type':
								detail = tagName+'[type="'+found+'"]';
						}
						return  markup ? '<span class="mt-ui-element mt-bc-item">'+detail+'</span>' : detail;
					},

					// unstylable / hidden element MT should ignore for hover inspect
					excludeFromSelection: [

						// hover inspect could find
						'path',
						'.mt-ui-element',

						// Gutenberg UI elements - elements that should not be moused over
						// but have children that should. See ".tvr-hh-mode.gutenberg-html" for pointer-events blocked
						'.components-resizable-box__container',
						'.wp-block-file__content-wrapper',
						'.wp-block-file__button-richtext-wrapper',
						'div.wp-block-archives',
						'div.wp-block-file__button-richtext-wrapper',
						'div.block-library-html__edit',
						'textarea.block-editor-plain-text',
						'.editor-visual-editor__post-title-wrapper'

					],

					// we don't select with MT if element is inside something
					excludeFromSelectionIfClosest: [

						// Amender
						'#amender-data',
						'#amender-errors',

						// Generate Blocks
						'.components-placeholder',

						// Kadence
						'.kt-select-layout',
						'.block-editor-inserter',
						'.block-list-appender',
						'.block-editor-inserter__toggle',
						'.wp-block-kadence-spacer',
						'.kt-select-starter-style-tabs',

					],

					search_parents_and_descendents: function($el, config){ TvrCom.startT(arguments);

						var dom = config.forAI ? MTF.domAI : MTF.dom; //$el = MTF.triggerEl;

						// reset default search config
						dom.search = MTF.default_search_config();

						// abort if no trigger el to anchor search from
						if (!TvrCom.isDomEl($el)){
							TvrCom.endT(arguments);
							return false;
						}

						// parents search
						TvrCom.startT('search_dom up');
						dom = MTF.search_dom($el, dom, 'up', config);
						TvrCom.endT('search_dom up');

						// search down if the element has children
						// so we can provide an easy way to navigate between nested els
						if (dom.search.$elChild && !config.forAI){
							TvrCom.startT('search_dom down');
							dom.search.level = -1;
							dom = MTF.search_dom(dom.search.$elChild, dom, 'down', config);
							TvrCom.endT('search_dom down');
						}

						//console.log('the dom after search', $.extend(true, {}, dom))

						TvrCom.endT(arguments, 0);
					},

					// search up dom tree analysing ids, classes, children, siblings, parents etc
					search_dom: function($el, dom, direction, config){

						//console.log('we search the dom', $.extend(true, {}, dom))

						var $par = $el.parent(),
							par = TvrCom.isDomEl($par) && $par.length, // is there a parent to move up to after?
							$child = $el.children().not('script, style').first(),
							hasChild = $child.length,

							tagName = TvrCom.get_tagName($el),

							// element tag name needs to be first item in selType object
							SelType = {
								'tagName': [tagName]
							},
							isTriggerEl = dom.search.level === 0,

							// For Gutenberg, we can ignore higher level elements outside of block editor
							B = TvrMT.integrate.gutenberg,
							blocksContainerClass = MTF.blocksContainerClass(),
							stopSearching = B && (
								(blocksContainerClass === 'is-root-container' && par && $par.hasClass(blocksContainerClass)) ||
								(blocksContainerClass === 'editor-styles-wrapper' && $el.hasClass(blocksContainerClass))
							),
							relevantAtts = MTF.relevantAtts();

						//console.log('blocksContainerClass', $el, $el.attr('class'), blocksContainerClass, stopSearching)

						// check for attributes (id, class, type, for inputs)
						for (var i = 0; i < relevantAtts.length; i++) {

							var att = relevantAtts[i],
								elAtt = $el.attr(att);

							if (elAtt){

								// we do have an attribute, register any ids on el (so parents don't double ids)
								if (att === 'id'){
									elAtt = MTF.clean_ids(elAtt);
								}

								// clean any artificial microthemer classes
								if (att === 'class'){
									elAtt = MTF.clean_classes(elAtt);
								}
							}

							// continue if no att (possibly after cleaning)
							if (!elAtt){
								SelType[att] = 0;
								continue;
							}

							// convert attribute string an to array (for space separated atts like class)
							SelType[att] = [];
							var all = elAtt.split(/\s+/);

							for (var j = 0; j < all.length; j++) {

								// flag if we are on a bricks container element
								if (isTriggerEl && att === 'class' && all[j] === 'bricks-container'){
									dom.bricksIsContainer = 1;
								}

								var formattedAtt = MTF.format_att_selector(tagName, all[j], att);

								SelType[att].push(
									formattedAtt
								);

								// check if the prefix is on the trigger el or an ancestor
								var customPrefix = dom.search.customPrefix;
								if (direction === 'up'
									&& TvrUi.pref['custom-prefix-extraValue']
									&& formattedAtt === TvrUi.pref['custom-prefix-extraValue']
								){
									customPrefix.$el = $el;
									customPrefix.level = dom.search.level;
									customPrefix.relationship = dom.search.level === 0 ? 'this' : 'ancestor';
								}

								++dom.search[att+'Count']; // just for debugging

							}

						}

						// get index, adjust for tvr-overlay if parent is body
						// todo: :last-child with body as parent will need adjusting (MT artifical divs)
						var $prevSibs = $el.prevAll(),
							$nextSibs = $el.nextAll(),
							$siblingsIncSelf = $prevSibs.add($el).add($nextSibs),
							siblingsOverview = null,
							childrenOverview = null;
							//siblingsIncSelf = [];

						/*$siblingsIncSelf.each(function(){
							siblingsIncSelf.push(
								MTF.get_breadcrumb_data($(this), MTF.relevantAtts, true, '', dom.selectorsString)
							)
						});*/

						//console.log('tagName', tagName, $el);

						var isValidTagName = TvrCom.isValidTagName(tagName),
							nthChild = $prevSibs.length+1,
							nthOfType = isValidTagName ? $prevSibs.filter(tagName).length+1 : 1,
							nthLastChild = $nextSibs.length+1,
							nthLastOfType = isValidTagName ? $nextSibs.filter(tagName).length+1 : 1;

						// populate an object showing the sibling tags
						if (config.forAI && isTriggerEl){

							// get children
							let $children = $el.children();
							if ($children.length){
								childrenOverview = [];
								$el.children().each(function(index){
									let tag = TvrCom.get_tagName($(this));
									childrenOverview.push(tag+'['+(index + 1)+']');
								})
							}


							// get siblings
							if ($prevSibs.length || $nextSibs.length){

								siblingsOverview = [];

								let types = [$prevSibs, $nextSibs];

								types.forEach(($siblings, k) => {

									if ($siblings){

										let isPrev = k === 0,
											index = isPrev
												? $prevSibs.length * -1
												: 1;

										$siblings.each(function(){

											let tag = TvrCom.get_tagName($(this)),
												type = index < 0 ? 'preceding' : 'following',
												absIndex = Math.abs(index),
												key = type+'-sibling::'+tag+'['+absIndex+']';

											siblingsOverview.push(key);
											index++;
										});
									}

								})
							}

						}

						var pseudo = {
							':first-child': nthChild === 1 ? 1 : 0,
							':first-of-type': nthOfType === 1 ? 1 : 0,
							':nth-child(n)': nthChild,
							':nth-of-type': nthOfType,

							':last-child': nthLastChild === 1 ? 1 : 0,
							':last-of-type': nthLastOfType === 1 ? 1 : 0,
							':nth-last-child(n)': nthLastChild,
							':nth-last-of-type(n)': nthLastOfType,

							':only-child': (nthChild === 1 && nthLastChild === 1) ? 1 : 0,
							':only-of-type': (nthOfType === 1 && nthLastOfType === 1) ? 1 : 0
						};

						// add ':nth-of-type' to the formatted SelType (most useful for single targeting)
						var nthofT = ':nth-of-type('+nthOfType+')',
							nthC = ':nth-child('+nthChild+')';

						SelType['pseudo'] = {};
						SelType['pseudo'][':nth-of-type'] = []; // [nthofT]; // have standalone
						//SelType['pseudo'][':nth-child'] = [];

						// combine with type, class, selectors (no need for id, as that's already singular)
						for (var a in SelType){

							if ( ! SelType.hasOwnProperty(a) ) continue; // for compat

							if (a !== 'id' && a !== 'pseudo' && SelType[a]){
								for (var k in SelType[a]){

									if ( ! SelType[a].hasOwnProperty(k) ) continue; // for compat

									var sug = SelType[a][k];
									SelType['pseudo'][':nth-of-type'].push(sug+nthofT);
									//SelType['pseudo'][':nth-child'].push(sug+nthC);
								}
							}
						}

						// store data about nearby HTML elements (for dom tree breadcrumbs and arrows)
						var family = {
							el: {
								type:'el',
								count:1
							},
							par: {
								type:'par',
								count: (par && !stopSearching ? 1 : 0)
							},
							child: {
								type:'child',
								count: hasChild
							},
							prev: {
								type:'prev',
								count:nthChild-1
							},
							next: {
								type:'next',
								count:nthLastChild-1
							}
						};

						// for the current element only
						// there may be multiple siblings, so store tagName and obj in arr (same structure for par/child [0])
						//var elBcLabel;

						var elOffset = $el.offset(),
							elDim = {
								outerWidth: $el.outerWidth(),
								outerHeight: $el.outerHeight()
							};

						if (isTriggerEl){

							dom.triggerElOffset = elOffset;
							dom.triggerElDimensions = elDim;

							// log that element has a child
							if (hasChild){
								dom.search.$elChild = $child;
							}
						}

						// update global dom object
						var nodesKey = direction === 'up' ? 'nodes' : 'descendentNodes',
							//breadcrumbData = MTF.get_breadcrumb_data($el, MTF.relevantAtts, true, '', dom.selectorsString),
							elIndex = MTF.getElIndex($el);

						dom.search[nodesKey].push({
							level: dom.search.level,
							SelType: SelType,
							tagName: tagName,
							pseudo: pseudo,
							totalSiblings: (nthChild + $nextSibs.length),
							$el:$el,
							family: family,
							offset: elOffset,
							dim: elDim,
							hasPseudo: MTF.hasPseudo[elIndex],
							$siblingsIncSelf: $siblingsIncSelf,
							siblingsOverview: siblingsOverview,
							childrenOverview: childrenOverview

							// this is calculated AFTER we know the current selector
							// so the breadcrumb can match the user's selector more closely
							//bcLabel: breadcrumbData.bcLabel,
							//formattedBCLabel: breadcrumbData.formattedBCLabel,
							//siblingsIncSelf: siblingsIncSelf,
						});

						// populate body/html classes in dom object if we're on either tag
						if (tagName === 'html' || tagName === 'body'){

							// save full set of SelTypes for html/body
							dom.search.sigAtts[tagName+'SelType'] = SelType;

							// store the level of the body and html elements, relative to the selected element
							// this should make logic easier to combine with custom el
							dom.search[tagName+'Level'] = dom.search.level;

							if (tagName === 'body'){
								// get the mt-id and mt-name classes too
								for (i in SelType['class']){

									if ( ! SelType['class'].hasOwnProperty(i) ) continue; // for compat

									var pfx = TvrUi.pref.page_class_prefix;
									var c = SelType['class'][i];
									var idClass = c.match(new RegExp("^\\."+pfx+"-\\d+$")); // c.match(/^\.mt-\d+$/);
									var nameClass = c.match(new RegExp("^\\."+pfx+"-.+$")); // c.match(/^\.mt-.+$/);
									if ( idClass ){
										dom.search.sigAtts['pageIdClass'] = idClass[0];
									} else if ( nameClass ){
										dom.search.sigAtts['pageNameClass'] = nameClass[0];
									} else {
										dom.search.sigAtts['pageOtherClass'].push(c);
									}
								}
							}
						}

						// search recursively up the dom tree to find more parents
						if (direction === 'up'){
							if (par && !stopSearching){
								++dom.search.level;
								return MTF.search_dom($par, dom, direction, config);
							}
						}

						// search recursively down the dom tree to find more children
						else if (direction === 'down'){
							if (hasChild){
								--dom.search.level;
								return MTF.search_dom($child, dom, direction, config);
							}
						}


						return dom;
					},

					// check if a class or id HTML attribute has been used to target the element
					// If so, we'll use it in the breadcrumbs
					matchAttInSels: function($el, att, foundArray, priorityAtts, selectorsString){

						foundArray.forEach((attValue) => {

							// Validate the format of the class or id
							const validPattern = /^[A-Za-z_-][A-Za-z0-9_-]*$/;
							if (!validPattern.test(attValue)) {
								//console.warn(`Skipping invalid ${att} value:`, attValue);
								return; // Skip this value
							}

							let cssValue = att === 'id'
									? '#'+attValue
									: '.'+attValue,
								escapedCSSValue = att === 'class'
									? "\\"+cssValue
									: cssValue,
								pattern = new RegExp("\\|([^|]*("+escapedCSSValue+"))(?:\\||$)", 'g'),
								match

							/*console.log('matchAttInSels', {
								att: att,
								pattern: pattern,
								selectorsString: selectorsString,
								curSelCSS: TvrUi.curSelCSS,
								intelli_css: TvrUi.intelli_css

							})*/

							//console.trace();

							// Note: if regex doesn't have /g this will cause an infinite loop
							while (match = pattern.exec(selectorsString)) {

								let fullSelector = match[1];

								// check for CSS selector match
								var	analysis = MTF.selectorMatches($el[0], fullSelector, false, true);


								//console.log('analysis', match, analysis);


								if (analysis.doesMatch){

									//console.log('successful match', match, fullSelector, analysis, TvrUi.intelli_css)

									let entry = {
										value: attValue,
										att: att,
										cssValue: cssValue
									};

									// if a selector is the current one, use that //  || fullSelector === TvrUi.curSelCSS / TvrUi.intelli_css
									if (fullSelector === TvrUi.intelli_css){
										priorityAtts.unshift(entry);
									} else {
										priorityAtts.push(entry);
									}
								}
							}

						});
					},

					getSelectorStats: function(selector, $el){

						let n = 0,
							index = null;

						if (CSS.supports('selector(' + selector + ')')){
							let $elements = $(selector);
							n = $elements.length;
							index = $elements.index($el);
						}

						return {
							numElsSelected: n,
							indexInSelection: index
						}
					},

					get_breadcrumb_data: function($this, atts, markup, pseudoEl, selectorsString, config){ TvrCom.startT(arguments);

						// if we don't have a valid selector srting, get it afresh
						if (!selectorsString){
							selectorsString = TvrUi.get_all_selector_code(false, true, true, true);
							//console.log('get_breadcrumb_data was retrieved again', selectorsString)
						}

						// ensure the draft selector is part of the string for text matching
						selectorsString+='|'+TvrUi.intelli_css; // +'|'+TvrUi.curSelCSS / TvrUi.intelli_css;

						//console.log('get_breadcrumb_data selectorsString passed', selectorsString, TvrUi.intelli_css, config, TvrUi.curSelCSS)

						var tagName = TvrCom.get_tagName($this);

						// resolve the name for the breadcrumb trail (type, id, first class)
						var bcLabel = tagName,
							formattedBCLabel = markup
								? '<span class="mt-ui-element mt-bc-item">'+tagName+'</span>'
								: bcLabel;

						if (TvrCom.isDomEl($this)){

							var foundAtts = [];
							var priorityAtts = []; // var foundAt

							for (var n in atts){

								if ( ! atts.hasOwnProperty(n) ) continue; // for compat

								var att = atts[n];
								var foundAt = $this.attr(att);

								// clean any artificial microthemer classes
								if (foundAt){
									if (att === 'class'){
										foundAt = MTF.clean_classes(foundAt);
									} else if (att === 'id'){
										foundAt = MTF.clean_ids(foundAt);
									}
								}

								// format breadcrumb label
								if (foundAt){

									let foundArray = foundAt.split(/\s+/);

									foundAtts.push({
										value: foundArray[0],
										att: att
									});

									//console.log('the atts we retrieved', $this, foundArray)

									// check for a class/id that matches an MT selector
									if (att !== 'type'){
										MTF.matchAttInSels($this, att, foundArray, priorityAtts, selectorsString);
									}

									/*bcLabel+= MTF.format_att_selector('', foundAt, att);
									//formattedBCLabel = bcLabel;
									if (markup){
										formattedBCLabel+= MTF.format_att_selector('', foundAt, att, markup);
									}

									break;*/
								}
							}

							// get the priority att if available or fallback to any found att
							//console.log('priorityAtts, foundAtts', priorityAtts, foundAtts);
							let entry = priorityAtts.length ? priorityAtts[0] : foundAtts[0];

							if (entry){
								bcLabel+= MTF.format_att_selector('', entry.value, entry.att);
								if (markup){
									formattedBCLabel+= MTF.format_att_selector('', entry.value, entry.att, markup);
								}
							}


						}

						if (pseudoEl){
							bcLabel+= pseudoEl;
							formattedBCLabel+= '<span class="mt-ui-element mt-bc-item mt-pseudo-crumb">'+pseudoEl+'</span>';
						}

						TvrCom.endT(arguments);

						/*console.log('Breadcrumb returned', {
							tagName: tagName,
							$el: $this,
							bcLabel: bcLabel,
							formattedBCLabel: formattedBCLabel,
							hasPseudo: '',
							priorityAtts: priorityAtts,
							foundAtts: foundAtts,
						})*/

						//console.trace();

						return {
							tagName: tagName,
							$el: $this,
							bcLabel: bcLabel,
							formattedBCLabel: formattedBCLabel,
							hasPseudo: ''
						};

					},

					relevantAtts: function(){

						let atts = TvrUi.isHighSpecificity()
							? ['id', 'class']
							: ['class', 'id'];

						atts.push('type');

						return atts;
					},

					default_search_config: function(){

						var customPrefix = {};

						// store details about any custom prefix
						if (TvrUi.pref['custom-prefix-extraValue']){

							customPrefix = {
								code: TvrUi.pref['custom-prefix-extraValue'].trim(),

								// update these values during upward dom search
								level: null,
								$el: null
							}

							//console.log('customPrefix', customPrefix);
						}

						return {
							level: 0,
							nodes: [], // parents
							descendentNodes: [], // descendents
							customPrefix: customPrefix,

							//elHasId: 0,
							sigAtts: {
								'htmlSelType': [],
								'bodySelType': [],
								'pageIdClass': '',
								'pageNameClass': '',
								'pageOtherClass': []
							},

							// just for debugging now that we're not limiting atts
							idCount: 0,
							classCount: 0,
							typeCount: 0
						}
					},

					default_sels_config: function(){
						return {
							//foundSingle: false,
							singleCount: 0,
							max_levels: 18, // high amount needed for page builder - should there be any limit?
							allRefKeys: {},
							refKeysDone: {},
							alreadyGot: {},
							curLevel: 0,
							prevLevel: 0,
							directEl: [],
							//passes: [ [], [], [] ],
							final: [],
							nothing: [],
							combo: {}
						}
					},

					// an object for storing data about the current focus of targeting
					setup_dom_object: function($el, config){

						//console.log('The config for setup_dom_object', config);

						var mSels = !config.shiftKey // don't show existing / resume of user is creating custom selection with shift key
								? MTF.get_matching_selectors($el, TvrUi.get_all_selector_code(
									!config.forAI,
									!config.selectCurrentSelector //- this produced inconsistencies
								), TvrUi.pseudoSelected, config.forAI)
								: [],
							mSelsCount = mSels.length,

							// get a simple selector string for efficient matches with breadcrumbs lineage and siblings
							// this means we can use classes and ids used to target an element in the breadcrumbs
							selectorsString = TvrUi.get_all_selector_code(true, true, true, true),

							breadcrumbData = MTF.get_breadcrumb_data($el, MTF.relevantAtts(), true, '', selectorsString, config);


						var dom = {

							// previous selectors stored due to user holding shift key (as string)
							joined_selectors_string: (TvrUi.joined_selectors.length
								? (TvrUi.joined_selectors.join(', ')+', ')
								: ''),

							// current target el info
							$el: $el,
							triggerElOffset: {},
							triggerElDimensions: {},
							breadCrumbLabel: breadcrumbData.bcLabel,
							formattedBCLabel: breadcrumbData.formattedBCLabel,
							mSels: mSels,
							mSelsCount: mSelsCount,
							selectorsString: selectorsString,

							// dom search info
							search: config.doNotUpdateDomSearch ? MTF.dom.search : {},

							// set fresh sels or recycle if re-targeting without updating selectors
							sels: config.doNotUpdateSelectorSuggestions ? MTF.dom.sels : {}
						};

						//console.log('Dom object was reset', config, dom, mSels);
						//console.trace();

						if (config.forAI){
							MTF.domAI = dom;
						} else {
							MTF.dom = dom;
						}

					},

					// build selector suggestion list
					build_selector_suggestions: function($el, targetingConfig){ TvrCom.startT(arguments);

						TvrCom.startT('build_selector_suggestions initial bits');

						targetingConfig = targetingConfig || {};

						var dom = MTF.dom;

						// reset the sels object
						dom.sels = MTF.default_sels_config();

						// if no valid element
						if (!TvrCom.isDomEl($el)){

							// add a separate class from (mt-zero-elements),
							// as we don't want to hide the suggestions if the user is customising them
							TvrUi.stat.tvr.addClass('hide-mt-suggestions');

							// bail if the selector doesn't target anything on the page
							TvrCom.endT('build_selector_suggestions initial bits');
							TvrCom.endT(arguments);
							return false;
						}

						// we have an element, ensure the suggestions are showing
						TvrUi.stat.tvr.removeClass('hide-mt-suggestions');

						//console.log('dom data before build_selector_suggestions', $.extend(true, {}, dom));

						//console.log('dom after search_dom', $.extend(true, {}, dom));
						var config = {
							//incPseudoOnDirectEl: 6, // levels of parents that should combine with nth value on el
							//incJustSpanDiv: 0, // selectors that just use span, div without class/id/type
							//fullTrail: 1,
							//max_single: 30
						};

						// build selector suggestions
						TvrCom.endT('build_selector_suggestions initial bits');


						TvrCom.startT('build_selector_suggestions: first pass');
						dom = MTF.generate_selectors(dom, config, targetingConfig);
						TvrCom.endT('build_selector_suggestions: first pass');

						//console.log('dom after 1st pass', $.extend(true, {}, dom));



						TvrCom.startT('build_selector_suggestions post processing');


						//console.log('dom after build final', $.extend(true, {}, dom));

						// sort the selectors

						TvrCom.startT('build_selector_suggestions: specificity sort');

						// higher specificity, favour ids with ancestor context (updated in April 2020)
						MTF.sort_selector_suggestions(dom.sels.final, TvrUi.isHighSpecificity());

						//console.log('dom after sort', $.extend(true, {}, dom));

						TvrCom.endT('build_selector_suggestions: specificity sort');

						TvrCom.startT('build_selector_suggestions organise equiv');

						// organise selectors that target the exact same HTML elements into comboboxes / categories for single combo
						dom = MTF.organise_equiv_selectors(dom, targetingConfig);

						TvrCom.endT('build_selector_suggestions organise equiv');

						//console.log('dom after organise equiv', $.extend(true, {}, dom));

						TvrCom.endT('build_selector_suggestions post processing');

						//console.log('The final dom after selector building', $.extend(true, {}, targetingConfig), $.extend(true, {}, dom))

						// set code for highlighting
						TvrUi.intelli_css = TvrUi.default_code_suggestion(dom.sels.final[0], targetingConfig, '#mt-no-element');
						//console.log('Updated TvrUi.intelli_css via build suggestions to ', TvrUi.intelli_css);
						//console.trace();

						TvrCom.endT(arguments, 0);

						//console.log('dom at end', $.extend(true, {}, dom), targetingConfig);
					},

					sort_selector_suggestions: function(arr, highSpecificity){

						// higher specificity, favour ids with ancestor context (updated in April 2020)
						if (highSpecificity){

							// favour high specificity
							arr.sort(
								TvrCom
									.firstBy('n') // tagNames comes before level and n, because even if on el, it's broad
									.thenBy('justTagName') // default single selection, widening the net as we go
									.thenBy('idealTrailLength')
									.thenBy('useOfNth') // p li:nth-of-type(7) is used over p:nth-of-type(1) li:nth-of-type(7)
									.thenBy('DCJ') // doc class join e.g. .mtp-1.logged-in (which we don't want)
									.thenBy('specificity', -1) // we may want to prioritize #id sels for easier overriding
									.thenBy('level') // prioritise selectors with near parent context over just element or far away parents
									.thenBy('firstAtt', -1)
									.thenBy('charLength', -1) // use longer, more precise ids/classes
									// trying to prioritise the first att, so breadcrumbs match hover better

							);
						}

						// lower specificity, favour class on direct element
						else {

							// we favour MT automatic and user-entered classes when editing Gutenberg
							if (TvrMT.integrate.gutenberg){
								arr.sort(
									TvrCom
										.firstBy('n') // tagNames comes before level and n, because even if on el, it's broad

										.thenBy('isUserClass', -1)
										.thenBy('idealClassSpecificity', -1)
										.thenBy('justTagName') // default single selection, widening the net as we go

										.thenBy('useOfNth') // p li:nth-of-type(7) is used over p:nth-of-type(1) li:nth-of-type(7)

										.thenBy('level') // prioritise selectors on the element only after  isUserClass
										// trying to prioritise the first att, so breadcrumbs match hover better

										.thenBy('trailLength') // so we don't have unnecessary > blah > blah > blah
										.thenBy('firstAtt', -1)

								);
							}

							else {
								arr.sort(
									TvrCom
										.firstBy('n') // tagNames comes before level and n, because even if on el, it's broad
										.thenBy('justTagName') // default single selection, widening the net as we go
										.thenBy('level') // prioritise selectors on the element or a near parent
										.thenBy('trailLength') // so we don't have unnecessary > blah > blah > blah
										.thenBy('useOfNth') // p li:nth-of-type(7) is used over p:nth-of-type(1) li:nth-of-type(7)
										.thenBy('idealClassSpecificity', -1) //
										.thenBy('isUserClass', -1)

										// trying to prioritise the first att, so breadcrumbs match hover better
										.thenBy('firstAtt', -1)
										.thenBy('charLength', -1) // use longer, more precise ids/classes
								);
							}

						}

						//console.log('sorted array', arr)
					},


					// organise selectors that target the exact same HTML elements into comboboxes
					organise_equiv_selectors: function(dom, targetingConfig){ TvrCom.startT(arguments);

						// filter out +limit, and analyse refKeys on < N limit
						var usedCategoryLabels = {};

						// we need to loop the items in normal ascending order to retain the sorting applied to the final array
						for (var i = 0; i < dom.sels.final.length; i++) {

							var node = dom.sels.final[i];

							// if it is unique, save refKey in array with same index as node
							if (!dom.sels.allRefKeys[node.refKey]){

								// Set the category label
								var langKey = node.n !== 1 ? 'targets_x_els_plural' : 'targets_x_els',
									categoryLabel = tvrsprintf(TvrLang[langKey], node.n);

								if (usedCategoryLabels[categoryLabel]){
									++usedCategoryLabels[categoryLabel];
									categoryLabel+= ' ('+tvrsprintf(TvrLang.set, usedCategoryLabels[categoryLabel])+')';
								} else {
									usedCategoryLabels[categoryLabel] = 1;
								}

								node.categoryLabel = categoryLabel;

								// save the refKey and node data
								dom.sels.allRefKeys[node.refKey] = node;
							}

							// if it is not unique,
							else {
								// prepare combo array if not already made
								if (!Array.isArray(dom.sels.combo[node.refKey])){
									dom.sels.combo[node.refKey] = [];

									// create an entry for the default combo value too
									dom.sels.combo[node.refKey].push(
										MTF.formattedSelSugItem(dom.sels.allRefKeys[node.refKey], dom)
									); // dom.sels.allRefKeys[node.refKey]['code']
								}
								node.removeMe = 1; // flag for removal rather tha modifying array during for loop
								dom.sels.combo[node.refKey].push(
									MTF.formattedSelSugItem(node, dom)
								); //node['code']
								dom.sels.allRefKeys[node.refKey].isCombo = 1;
							}
						}

						// now that iteration has finished, it's safe to remove items that have been flagged
						// traverse backwards to preserve validity of j index
						for (var j = dom.sels.final.length -1; j >= 0; j--) {
							var node = dom.sels.final[j];
							if (node.removeMe){
								dom.sels.final.splice(j, 1);
							}
						}

						// prepend any user entered selector
						if (targetingConfig.notInSugList){

							// register category label
							dom.sels.allRefKeys['custom'] = {
								categoryLabel: TvrLang.custom
							}

							// Add entry
							dom.sels.final.unshift({
								code: targetingConfig.notInSugList,
								n: TvrUi.customCSSN,
								refKey: 'custom'
							});
						}

						TvrCom.endT(arguments);

						return dom;
					},

					formattedSelSugItem: function(node, dom){
						//console.log('formattedSelSugItem', $.extend(true, {}, node), dom, node.refKey, dom.sels.allRefKeys)

						// we want to preserve the orig node attributes so combo data can be sorted again by specificity paramters
						return $.extend(true, {}, node, {
							label: node.code,
							value: node.code,
							category: dom.sels.allRefKeys[node.refKey].categoryLabel
						});

						/*return {
					label: node.code,
					value: node.code,
					category: dom.sels.allRefKeys[node.refKey].categoryLabel,
					refKey: node.refKey
				}*/
					},

					// generate selectors from dom analysis object
					generate_selectors: function(dom, config, targetingConfig){ TvrCom.startT(arguments);

						config = config ? config : {};

						var nodes = dom.search.nodes;

						// loop through each node building selectors as we go
						for (var i in nodes){

							if ( ! nodes.hasOwnProperty(i) ) continue; // for compat

							var node = nodes[i];

							// update which level we are on, and previous level for building ' ' or ' > ' selectors
							if (node.level !== dom.curLevel){
								dom.prevLevel = dom.curLevel;
								dom.curLevel = node.level;
							}

							// loop through the available sel types
							for (var att in node.SelType){

								if ( ! node.SelType.hasOwnProperty(att) ) continue; // for compat

								// if we only need a certain amount of single selectors, which we found, return
								/*if (dom.sels.foundSingle && dom.sels.singleCount >= config.max_single) {
							TvrCom.endT(arguments);
							return dom;
						}*/

								// if we have an array of attributes
								if (node.SelType[att]){

									var arr = (node.SelType[att]);

									// regular class/id etc selectors (these will be formatted first)
									if (att !== 'pseudo'){

										for (var j in arr){

											//console.log('about to format arr', att, arr, j, parseInt(j))

											if ( ! arr.hasOwnProperty(j) ) continue; // for compat

											// format the selector item, in firstPass arr (and directEl)
											MTF.format_sel_item(arr[j], att, node, dom, config, j);
										}
									}

									// pseudo - can check refKey of selectors and skip if already targeted with regular class/id
									else {

										for (var pseudo in arr){

											if ( ! arr.hasOwnProperty(pseudo) ) continue; // for compat

											for (var j in arr[pseudo]){

												if ( ! arr[pseudo].hasOwnProperty(j) ) continue; // for compat

												// format the selector item, in firstPass arr (and directEl)
												MTF.format_sel_item(arr[pseudo][j], att, node, dom, config, j);
											}
										}
									}

								}
							}

							// stop generating selectors if we have reached the max level up the dom tree
							//var stillSearchingSingle = config.incPseudo && !dom.sels.foundSingle;
							if ( i >= (dom.sels.max_levels-1) ){
								// we could include a check that ensure we have minimum ids/classes (e.g. 1 of each)
								break;
							}

							// if a custom-prefix is active, break once we've reached that level
							if (dom.search.customPrefix.$el && dom.search.customPrefix.level === node.level){
								//console.log('Break on prefix node', node);
								break;
							}

						}

						TvrCom.endT(arguments);
						return dom;
					},

					getCodeResult: function(code){

						var $targetEls = MTF.jquery_compat_sel_elements(code),
							n = $targetEls.length,
							refKey = '';

						if (n){
							if (n <= 30){
								$targetEls.each(function(i){
									refKey+= String( Array.prototype.indexOf.call( MTF.N, $(this)[0]) );
								});
							} else {
								refKey = 'x_plus';
							}
						}

						/*console.log('the result', code,  {
					$targetEls: $targetEls,
					n: n,
					refKey: refKey
				})*/

						return {
							$targetEls: $targetEls,
							n: n,
							refKey: refKey
						}
					},

					// format a selector item object which can be sorted by
					format_sel_item: function(code, att, node, dom, config, attIndex){ TvrCom.startT(arguments);

						config = config ? config : {};

						var justTagName = (att === 'tagName' || att === 'pseudo') ? 1 : 0,
							isPseudo = (att === 'pseudo'),
							justSpanDiv = (att === 'tagName' && (code === 'span' || code === 'div')) ? 1 : 0,
							justSpanDivPseudo = code.match(/(div|span):nth-of-type\(\d\)/) ? 1 : 0,
							n,
							refKey,
							codes = [],
							refKeysDone = dom.sels.refKeysDone;

						//console.log('format the code', code, justSpanDiv, justSpanDivPseudo, att, node, dom, config )

						// direct element
						if (node.level === 0){

							var idAtt = TvrCom.checkObject(node, ['SelType', 'id']),
								codeResult = MTF.getCodeResult(code);

							n = codeResult.n;
							refKey = codeResult.refKey;

							//console.log('the direct el', att === 'class' && parseInt(attIndex) === 0, parseInt(attIndex), att, code, idAtt, config, $.extend(true, {}, node))
							codes.push({
								code: code,
								directElCode: code,
								isDirectEl: 1,
								hasID: (idAtt && idAtt.length),
								n: n,
								refKey: refKey,
								firstAtt: att === 'class' && parseInt(attIndex) === 0 ? 1 : 0,

								pseudo: isPseudo,
								justTagName: justTagName,
								justSpanDivPseudo: justSpanDivPseudo
							});

							// mark that element single/set has been targeted without the need for pseudo
							if (!isPseudo && !justTagName){
								refKeysDone[refKey] = 1; // 1 = simple, P = pseudo, T = full trail
							}

						}

						// parent targeting - combine with every combination of direct el
						else {

							// bail if parent is just a span or a div, or a pseudo e.g. div:nth-of-type(1)
							if (justSpanDiv || isPseudo || justSpanDivPseudo){
								TvrCom.endT(arguments);
								return false;
							}

							for (var i in dom.sels.directEl){

								if ( ! dom.sels.directEl.hasOwnProperty(i) ) continue; // for compat

								var directEl = dom.sels.directEl[i],

									// signal if both parent and child are just tagnames (as this is more significant than level)
									// e.g. ul:nth-of-type(1) should be counted as justTagName too as it's very broad
									bothJustTagName = (justTagName && directEl['justTagName']) ? 1 : 0,
									ancesterCode = code + ' ' + directEl['code'],
									ancesterCodeResult = MTF.getCodeResult(ancesterCode),
									ancesterN = ancesterCodeResult.n,
									ancesterRefKey = ancesterCodeResult.refKey,
									trailCode = code+MTF.full_trail(dom.search.nodes, node, true)+' > '+directEl['code'],
									trailCodeResult = MTF.getCodeResult(trailCode),
									trailRefKey = trailCodeResult.refKey,
									trailN = trailCodeResult.n;

								// push simple parent-descendent selector to array of combinations (if desc isn't span or div)
								if (ancesterN > 0 && !directEl.justSpanDiv && !directEl.justSpanDivPseudo){

									var noBetterAncesterSel = !refKeysDone[ancesterRefKey] || refKeysDone[ancesterRefKey] === 'T';

									//console.log('We combine with some space', $.extend(true, {}, directEl), noBetterAncesterSel)

									// if not pseudo (so class or id)
									// Or it is a pseudo, but no better selector targets it
									if (!directEl.pseudo || noBetterAncesterSel){

										//console.log('we should add the ancesterCode', ancesterCode, refKeysDone[ancesterRefKey])

										codes.push({
											code: ancesterCode,
											justTagName: justTagName,
											bothJustTagName: bothJustTagName,
											firstAtt: directEl.firstAtt ? 1 : 0,
											n: ancesterN,
											refKey: ancesterRefKey,
											directElCode: directEl['code'],
											parentCode: code
										});

										refKeysDone[ancesterRefKey] = (directEl.pseudo ? 'P' : 1);

									}

								}

								// if we haven't managed to target the elements already without a long trail selector, add that
								if (trailN > 0 && !dom.sels.refKeysDone[trailRefKey]){

									// do full trail
									codes.push({
										code: trailCode,
										justTagName: justTagName,
										n: trailN,
										refKey: trailRefKey,
										directElCode: directEl['code'],
										parentCode: code
									});

									refKeysDone[trailRefKey] = 'T';
								}
							}
						}


						//console.log('all the codes before making selItem', $.extend(true, [], codes));

						// create sel items for each selector permutation
						for (var i in codes){

							if ( ! codes.hasOwnProperty(i) ) continue; // for compat

							var item = codes[i];

							code = item.code;
							n = item.n;
							justTagName = item.justTagName;

							// check if this is a duplicate (from 2nd pass incReg again)
							/*if (dom.sels.alreadyGot[code]){
						continue;
					}

					// log for next check
					dom.sels.alreadyGot[code] = 1;
	*/
							// update code with potential filters
							var filter = MTF.apply_css_filters(code, node, dom);
							code = filter['code'];

							// save the code before it is joined with any shift-stored selectors
							var unjoined_code = code;

							code = dom.joined_selectors_string+code;

							//console.log('code adjusted', item.code, code, filter);

							// log use of nth so equiv selectors using less nth-of-types can gain priority
							var useOfNth = unjoined_code.match(/nth\-/g);
							useOfNth = useOfNth ? useOfNth.length : 0;

							// experiment:
							var trailLength = TvrUi.sel_trail(unjoined_code).pieces.length,
								specificity = TvrCom.get_specifcity(unjoined_code),
								idealClassSpecificity = (specificity > 1 && specificity < 100)
									? 300
									: specificity,

								// favour single parent context over just element, unless target element has an id
								idealTrailLength = trailLength === 2 || (codes[i].hasID && unjoined_code.indexOf('#') > -1)
									? trailLength - 2
									: trailLength;

							var selItem = {
								code: code,
								unjoined_code: unjoined_code,
								charLength: unjoined_code.length,
								firstAtt:  codes[i].firstAtt ? 1 : 0,
								trailLength: trailLength,
								idealTrailLength: idealTrailLength,
								useOfNth: useOfNth,
								n: n,
								refKey: item.refKey,
								level: node.level, // direct el or parent level
								hasID: codes[i].hasID,
								specificity: specificity,
								idealClassSpecificity: idealClassSpecificity,
								justTagName: justTagName,
								justSpanDiv: justSpanDiv,
								justSpanDivPseudo: justSpanDivPseudo,
								pseudo: (att === 'pseudo') ? 1 : 0,

								// doc classes joined e.g. .logged-in.mtp-5 (which we don't want to be the default)
								DCJ: code.match(/^\.[^\s]+\./) ? 1 : 0
							};

							// if a page builder like Oxygen is active, maybe flag user defined classes
							MTint.maybeFlagUserClasses(selItem, [codes[i].directElCode, codes[i].parentCode], codes[i], dom);

							// if direct el, store for parent combining (which includes span/div)
							if (node.level === 0){

								// we need a copy to modify without modifying dom.sels.passes[config.passNum]
								var selItemCopy = $.extend(true, {}, selItem),
									unPrefixedCode = (filter && filter.prefix) ? filter.nonPrefixCode : false,
									unAdjustedCode = unPrefixedCode || unjoined_code;

								if (dom.joined_selectors_string || unPrefixedCode){
									selItemCopy['code'] = unAdjustedCode;
								}

								dom.sels.directEl.push(selItemCopy);
							}

							// if not too broad (span/div)
							if (n > 0 && !justSpanDiv && !justSpanDivPseudo){
								//dom.sels.passes[config.passNum].push(selItem);
								dom.sels.final.push(selItem);
							}

						}

						TvrCom.endT(arguments);
						return dom;

					},

					// apply css filter to a selector
					apply_css_filters: function(code, node, dom, conf){

						conf = conf ? conf : {};

						// add pseudo suffix if required (only needed on direct el)
						var suffix = '',
							pseudoCE,
							config,
							regPattern = false,
							type,
							bodyLevel = dom.search.bodyLevel,
							prefixLevel,
							prefixEnabled = false,
							//htmlLevel = dom.search.htmlLevel,
							nodeLevel = node ? node.level : 0;

						if (!conf.manual && nodeLevel !== undefined){

							var pseudoArr = ['pseudo_classes', 'pseudo_elements'];

							// add ::before or ::after if they have clicked on that line of HTML
							if (TvrUi.pseudoSelected &&
								!TvrUi.pref['pseudo_elements']['::'+TvrUi.pseudoSelected]
								&& !code.match(new RegExp(TvrUi.pseudoSelected+"$"))
							){
								code = code+'::'+TvrUi.pseudoSelected;
								//console.log('Add the pseudo for HTML line', TvrUi.pseudoSelected)
							}

							// for each type of pseudo
							for (var i in pseudoArr){

								if ( ! pseudoArr.hasOwnProperty(i) ) continue; // for compat

								type = pseudoArr[i];

								//console.log('The pseudo pref', TvrUi.pref[type])

								// for each pseudo
								for (pseudoCE in TvrUi.pref[type]){

									if ( ! TvrUi.pref[type].hasOwnProperty(pseudoCE) ) continue; // for compat

									// get the css filter config (function takes an array)
									config = TvrUi.get_pseudo_config( [pseudoCE] )[pseudoCE];

									// get any value from user input
									pseudoCE = MTF.maybe_adjust_for_editable_pseudo(config, pseudoCE);

									// include if the user has it enabled
									if (TvrUi.pref[type][config.pCE]){

										// if we're adding (e.g. nth-of-type) we should strip MT auto-added (only on direct el)
										if (config.pCE === ':nth-of-type(n)'){
											code = MTF.apply_filter_at_level({
												level:'suffix',
												code: code,
												regPattern: new RegExp(':nth-of-type\\(.+\\)', 'g'),
												strMatch: false,
												repl: ''
											});
										}

										// append the filter if not added already
										if (!code.match(new RegExp(pseudoCE+"$"))){
											code = code+pseudoCE;
											//console.log('Add the pseudo for reg pseudoCE', pseudoCE, code)
										}



									}
								}
							}

						}

						// cache code before any prefix/suffix
						var codeWithoutPrefix = code;

						// prefix with page id if required
						var prefix = '',
							bricksSuffix = '',
							strMatch,
							customPrefix = dom.search.customPrefix,
							applicableCustomPrefix = TvrUi.pref['page_specific']['custom-prefix'] && customPrefix.level !== null;

						if (TvrUi.pref['page_specific']['page-id']
							&& dom.search.sigAtts.pageIdClass){
							prefix+= dom.search.sigAtts.pageIdClass;
							prefixEnabled = true;
						} if (TvrUi.pref['page_specific']['page-name']
							&& dom.search.sigAtts.pageNameClass){
							prefix+= dom.search.sigAtts.pageNameClass;
							prefixEnabled = true;
						}

						if (applicableCustomPrefix){
							prefixEnabled = true;
						}

						var bodyPrefixesAreActive = prefix;

						if (parseInt(TvrUi.pref.bricks_container_hack) && MTF.bricksIsFront && dom.bricksIsContainer){

							var origCode = code,
								standardPrefixes = prefix,
								frontendPrefix ='.bricks-is-frontend'+standardPrefixes,
								backendPrefix = ':not(.bricks-is-frontend)'+standardPrefixes;

							bricksSuffix = MTF.integrate_class_prefix(code, node, dom, backendPrefix, nodeLevel, bodyLevel);
							prefix = frontendPrefix;

							//console.log('Bricks is front orig code', origCode);
						}

						// we need to infuse prefix correctly with: a) body el/other classes b) html
						if (!conf.manual){

							// run the custom prefix integrate function
							if (applicableCustomPrefix){ //  && dom.search.bodyLevel !== customPrefix.level

								// we must set the prefix so it isn't applied to the direct el
								prefix = TvrUi.pref['custom-prefix-extraValue'];

								code =  MTF.integrate_class_prefix(
									code, node, dom, prefix, nodeLevel, customPrefix.level, true, bodyPrefixesAreActive
								);

								//console.log('custom-prefix integrate', node.level, customPrefix.level, prefix, code, replLevel, repl, strMatch, customPrefix, dom);
							}

							// or regular body class prefixes (we don't allow both at the same time)
							else if (prefix){
								code =  MTF.integrate_class_prefix(code, node, dom, prefix, nodeLevel, bodyLevel);
							}




						}

						if (bricksSuffix){
							code+= ', '+bricksSuffix+' > .bricks-container-inner';
							//console.log('bricks modified code', code)
						}


						// if we're modifying a manual-edit suggestion, code text needs to be manipulated
						if (conf.manual){

							// e.g. nth-of-type(123) has a variable input so use regex
							pseudoCE = conf.$li.data('filter');
							type = conf.$li.data('type');

							// get the css filter config (function takes an array)
							config = TvrUi.get_pseudo_config( [pseudoCE] )[pseudoCE];

							// get any value from user input
							pseudoCE = MTF.maybe_adjust_for_editable_pseudo(config, pseudoCE);

							var replLevel,
								repl,
								skip = false,
								forceSkip = false;

							if (type === 'pseudo_elements' || type === 'pseudo_classes'){

								// construct flexible pattern match for an existing filter
								regPattern = (config.editable)
									? new RegExp( config.pCE.replace(config.editable.str, '\\(.+\\)') )
									: config.pCE;

								strMatch = false;
								replLevel = 'suffix';
								repl = pseudoCE;

							}

							else if (type === 'page_specific'){

								if (config.pCE === 'custom-prefix' && customPrefix.level === null){
									forceSkip = true;
									//console.log('forceSkip', code, customPrefix);
								}

								else {

									prefixLevel = bodyLevel;

									// we are only toggling individual prefixes here
									switch (config.pCE){
										case 'page-id':
											prefix = dom.search.sigAtts.pageIdClass;
											break;
										case 'page-name':
											prefix = dom.search.sigAtts.pageNameClass;
											break;
										case 'custom-prefix':
											prefix = TvrUi.pref['custom-prefix-extraValue'];
											prefixLevel = customPrefix.level;
											break;
									}

									// replace the existing portion, or strip the page-id if disabling
									var prefixOn = MTF.prefix_on(
											code, node, dom, prefix, nodeLevel, prefixLevel, (config.pCE === 'custom-prefix')
										),
										strMatch = TvrUi.pref[type][config.pCE] ? prefixOn.strMatch : prefix;

									replLevel = prefixOn.level;
									repl = prefixOn.repl;
									skip = prefixOn.skip;

									//console.log('get prefixOn', code, prefix, prefixLevel, prefixOn, customPrefix);
								}


								//console.log('manual adjust for page_specific', code, prefixOn);




							}

							// a few parameters are different if we're disabling
							var addIfNotPresent = 1;
							if (!TvrUi.pref[type][config.pCE]){
								repl = '';
								skip = false; // skip is just for adding
								addIfNotPresent = 0;
							}

							if (!skip && !forceSkip){

								// do any replacements
								code = MTF.apply_filter_at_level({
									level:replLevel,
									code: code,
									regPattern: regPattern,
									strMatch: strMatch,
									repl: repl,
									addIfNotPresent: addIfNotPresent
								});



							}
						}

						/*console.log('apply_css_filters return data', {
					'code': code,
					'nonPrefixCode': codeWithoutPrefix,
					'prefix': prefix,
					node: node
				})*/

						// return code with potential filters, and filter config
						return {
							'code': code,
							'nonPrefixCode': codeWithoutPrefix,
							'prefix': prefix,
							prefixLevel: prefixLevel,
							prefixEnabled: prefixEnabled,
							prefixDisabled: !prefixEnabled

							// DCJ = Doc Class Join
							//DCJ: prefixOn.DCJ
						};

					},

					// either simply prepend, or insert class on body or after HTML bit
					integrate_class_prefix: function(code, node, dom, prefix, nodeLevel, prefixLevel, isCustomPrefix, bodyPrefixesAreActive){

						var prefixOn = MTF.prefix_on(code, node, dom, prefix, nodeLevel, prefixLevel, isCustomPrefix, bodyPrefixesAreActive);

						if (!prefixOn.skip){
							if (prefixOn.justPrepend){
								code = prefix+' '+code;
							} else {
								code = MTF.apply_filter_at_level({
									level:prefixOn.level,
									code: code,
									strMatch: prefixOn.strMatch,
									repl: prefixOn.repl,
									addIfNotPresent: 1
								});
							}
						}

						//console.log('integrate_class_prefix', code);

						return code;
					},

					// get user entered input value
					maybe_adjust_for_editable_pseudo: function(config, pseudoCE){
						if (config.editable){
							var userVal = TvrUi.get_pseudo('val', {pseudoCE:pseudoCE});
							pseudoCE = userVal ? pseudoCE.replace(config.editable.str, '('+userVal+')') : pseudoCE;
						}
						return pseudoCE;
					},

					// replace/add a pseudo selector, but only on the lowest child part (direct el)
					apply_filter_at_level: function(config){

						//level, code, regPattern, repl, addIfNotPresent
						var sel_trail = TvrUi.sel_trail(config.code),
							portions = sel_trail.pieces,
							splitMatches = sel_trail.splitMatches; // config.code.split(' '); M

						var i = config.level === 'suffix' ? portions.length-1 : config.level;
						var elPor = portions[i];
						// this function accepts plain string match or regex
						var find = config.strMatch ? config.strMatch : config.regPattern;
						var matches = config.strMatch ? (elPor.indexOf(find) > -1) : elPor.match(find);


						//console.log('apply_filter_at_level initial', config.code, find, $.extend(true, [], portions), matches, config);

						if (matches){
							portions[i] = elPor.replace(find, config.repl);
						}

						else {
							if (config.addIfNotPresent){
								portions[i]+= config.repl;
							}
						}

						// if the portion is empty now, remove from array
						if (!TvrCom.isDefined(portions[i])){
							portions.splice(i, 1);
							splitMatches.splice(i, 1);
						}

						//console.log('replace pseudo results', TvrCom.print_r(config), TvrCom.print_r(portions), i, elPor, find, matches, portions.join(' '));

						//config.code = portions.join(' ');
						config.code = MTF.rejoin_pieces_and_splitMatches(portions, splitMatches);

						//console.log('pieces joined again', config.code, $.extend(true, [], portions), splitMatches);

						//console.log('the rejoined code', config.code)

						return config.code;
					},

					rejoin_pieces_and_splitMatches: function(pieces, splitMatches){

						var str = '';

						for (var i = 0; i < pieces.length; i++) {

							var piece = pieces[i],
								splitMatch = splitMatches[i] !== undefined ? splitMatches[i] : '';

							str+= piece+splitMatch;
						}

						//console.log('the rejoin', pieces, splitMatches, str)

						return str;

					},

					// check if 2nd chunk is prefix level att
					secondChunkTargetsPrefixEl: function(scc, SelType){

						//console.log('We have the html tag', scc, SelType)

						for (var st in SelType){

							if ( ! SelType.hasOwnProperty(st) ) continue; // for compat

							for (var index in SelType[st]){

								if ( ! SelType[st].hasOwnProperty(index) ) continue; // for compat

								var att = SelType[st][index];

								//console.log('Compare prefix att', att, 'inbetween', scc.pseudoAndPrefixStripped)

								if (scc.pseudoAndPrefixStripped === att){
									//console.log('Found  match', att, scc.pseudoStripped)
									return true;
								}
							}
						}

						return false;

					},


					// we need to infuse prefix correctly with: a) body el/other classes b) html
					prefix_on: function(code, node, dom, prefix, nodeLevel, prefixLevel, isCustomPrefix, bodyPrefixesAreActive){

						var prefixOn = {},
							sel_trail = TvrUi.sel_trail(code),
							codeChunks = sel_trail.pieces,
							chunkIndex = 0,
							alreadyPrefixed = codeChunks[0].indexOf(dom.search.sigAtts.pageIdClass) > -1
								|| codeChunks[0].indexOf(dom.search.sigAtts.pageNameClass) > -1
								|| codeChunks[0].indexOf(prefix) > -1,
							scc,

							isPrefixLevel = nodeLevel === prefixLevel,
							isPrefixLevelOrAncestor = nodeLevel >= prefixLevel,
							isAncestorOfPrefixLevel = nodeLevel > prefixLevel;


						//console.log('The code to adjust prefix on', code, node, dom, prefix, nodeLevel, prefixLevel)

						// node can be undefined if we're on a manually customised input field
						//if (node && (node['tagName'] === 'html' || node['tagName'] === 'body' || alreadyPrefixed)){
						if (node && (isPrefixLevelOrAncestor || alreadyPrefixed)){

							var secondChunkTargetsPrefixEl = false;

							// if html chunkIndex
							//if (node['tagName'] === 'html'){
							if (isAncestorOfPrefixLevel){

								//console.log('isAncestorOfPrefixLevel', prefixLevel, dom.search.nodes[prefixLevel].SelType, dom.search.nodes);

								// tease apart pseudo - e.g. body.mt-2:hover works, body:hover.mt-2 doesn't
								chunkIndex = codeChunks.length - 1; // 1;
								scc = MTF.sel_chunk_components(codeChunks[chunkIndex], prefix); // codeChunks[(codeChunks.length-1)],
								secondChunkTargetsPrefixEl = MTF.secondChunkTargetsPrefixEl(
									scc,
									dom.search.nodes[prefixLevel].SelType
									//node.SelType
								);

								// if it's not a body level, it must be a child of the body, so page-id should be squeezed between
								if (!secondChunkTargetsPrefixEl){

									prefixOn = {
										level: chunkIndex,
										strMatch:codeChunks[chunkIndex],
										repl: prefix+' '+codeChunks[chunkIndex]
									};

									//console.log('Squeezing in between', prefixOn, prefix, codeChunks);
								}

							}

								// prefix level (e.g. body)
							// possibly on non-body selector that already has page-id/name prefix
							else {
								scc = MTF.sel_chunk_components(codeChunks[chunkIndex], prefix);
							}

							// common code for body/html node, just level is different
							//if (node['tagName'] === 'body' || secondChunkTargetsPrefixEl || alreadyPrefixed){
							if (isPrefixLevel || secondChunkTargetsPrefixEl || alreadyPrefixed){

								prefixOn = {
									level: chunkIndex,
									strMatch: scc.rawChunk,
									repl: scc.pseudoStripped+prefix+scc.pseudoStr,
									skip: scc.pseudoStripped.indexOf(prefix) > -1
								};

								//console.log('prefix_on: ', isPrefixLevel, secondChunkTargetsPrefixEl, alreadyPrefixed, prefixOn);
							}

							//prefixOn.DCJ = 1;
						}

						// no special requirement just prepend
						else {

							prefixOn = {
								// for generate selectors
								justPrepend: 1,

								// for conf.manual
								level: chunkIndex,
								strMatch:codeChunks[0],
								repl: prefix+' '+codeChunks[0]
							};
						}

						/*if (node && (node['tagName'] === 'html')){

				}*/

						//console.log('prefixOn', prefixOn, code, node, dom, prefix)

						return prefixOn;
					},

					/*prefix_on_orig: function(code, node, dom, prefix, nodeLevel, prefixLevel){

				var prefixOn = {},
					sel_trail = TvrUi.sel_trail(code),
					codeChunks = sel_trail.pieces,
					level,
					alreadyPrefixed = codeChunks[0].indexOf(dom.search.sigAtts.pageIdClass) > -1
						|| codeChunks[0].indexOf(dom.search.sigAtts.pageNameClass) > -1;

				//console.log('The code to adjust prefix on', code, node, dom, prefix)

				// node can be undefined if we're on a manually customised input field
				if (node && (node['tagName'] === 'html' || node['tagName'] === 'body' || alreadyPrefixed)){

					var foundBodyLevel = false;

					// if html level
					if (node['tagName'] === 'html'){

						// tease apart pseudo - e.g. body.mt-2:hover works, body:hover.mt-2 doesn't

						var endChunk = codeChunks[1], // || codeChunks[(codeChunks.length-1)],
							bl = MTF.sel_chunk_components(endChunk, prefix);

						// validate if 2nd item is body level att

						var bodySelType = dom.search.sigAtts.bodySelType;
						//console.log('We have the html tag', code, node, codeChunks, codeChunks[1], bl, bodySelType)
						for (var st in bodySelType){

							if ( ! bodySelType.hasOwnProperty(st) ) continue; // for compat

							for (var index in bodySelType[st]){

								if ( ! bodySelType[st].hasOwnProperty(index) ) continue; // for compat

								var bodyAtt = bodySelType[st][index];

								//console.log('Compare body att', bodyAtt, 'inbete', bl.pseudoAndPrefixStripped, prefix)

								if (bl.pseudoAndPrefixStripped === bodyAtt){
									//console.log('Found body match', bodyAtt, bl.pseudoStripped)
									level = 1;
									foundBodyLevel = true;
									break;
								}
							}
						}

						// if it's not a body level, it must be a child of the body, so page-id should be squeezed between
						if (!foundBodyLevel){

							prefixOn = {
								level:1,
								strMatch:codeChunks[1],
								repl: prefix+' '+codeChunks[1]
							};

							//console.log('Squeezing in between', prefixOn)
						}

					}

						// body level
					// possibly on non-body selector that already has page-id/name prefix
					else {

						var bl = MTF.sel_chunk_components(codeChunks[0], prefix);
						level = 0;
					}

					// common code for body/html node, just level is different
					if (node['tagName'] === 'body' || foundBodyLevel || alreadyPrefixed){
						prefixOn = {
							level:level,
							strMatch:bl.rawChunk,
							repl: bl.pseudoStripped+prefix+bl.pseudoStr,
							skip: bl.pseudoStripped.indexOf(prefix) > -1
						};
						//console.log('prefix_on: ', prefixOn);
					}

					//prefixOn.DCJ = 1;
				}

				// no special requirement just prepend
				else {

					prefixOn = {
						// for generate selectors
						justPrepend: 1,

						// for conf.manual
						level:0,
						strMatch:codeChunks[0],
						repl: prefix+' '+codeChunks[0]
					};
				}

				/!*if (node && (node['tagName'] === 'html')){

				}*!/

				console.log('prefixOn', prefixOn, code, node, dom, prefix)

				return prefixOn;
			},*/

					// e.g. body.mt-2:hover works, body:hover.mt-2 doesn't so we need to tease apart pseudo
					sel_chunk_components: function(chunk, prefix){

						var pseudoStripped = TvrCom.strip_pseudo(chunk),
							pseudoAndPrefixStripped = pseudoStripped.replace(prefix, '');

						// we don't want to strip the prefix if that is the only attribute being used
						if (pseudoAndPrefixStripped === ''){
							pseudoAndPrefixStripped = pseudoStripped;
						}

						var scc = {
							rawChunk: chunk,
							pseudoStripped: pseudoStripped,
							pseudoAndPrefixStripped: pseudoAndPrefixStripped,
							pseudoArr:TvrCom.pseudo_str_to_arr(chunk),
							pseudoStr: ''
						};

						if (scc.pseudoArr){
							scc.pseudoStr = scc.pseudoArr.join('');
						}

						return scc;
					},

					// get a full trail selector to the element
					full_trail: function(nodes, parentNode, preciseSingular){
						var trail = '',
							count = 0;
						// full trail from parent down to el (just the nodes in between)
						for (var i = (parentNode.level-1); i > 0; i--) {

							if (preciseSingular || (++count) > 1){
								trail+= ' > '+nodes[i]['SelType']['pseudo'][':nth-of-type'][0];
							} else {
								trail+= ' > '+nodes[i]['tagName'];
							}

						}
						return trail;
					},



					// finish tag string // todo new ACE system will replace this
					finish_tag_string: function(el, htmlString){ TvrCom.startT(arguments);
						if (
							el != 'area' &&
							el != 'base' &&
							el != 'br' &&
							el != 'col' &&
							el != 'command' &&
							el != 'embed' &&
							el != 'hr' &&
							el != 'img' &&
							el != 'input' &&
							el != 'meta' &&
							el != 'param' &&
							el != 'source'
						) {
							// beta - get innerHTML markup for title
							// alert($el.html());
							htmlString+= '&#62;...&#60;/'+el+'&#62;';
						} else {
							htmlString+= ' /&#62;';
						}
						TvrCom.endT(arguments)
						return htmlString;

					},

					// find parent width class recursively
					find_parent_attributes: function($par, type){

						// check if the attribute still has a value after removing artificial tvr classes
						if ($par.attr(type) && MTF.clean_classes($par.attr(type)) ) {
							return $par;
						} else {
							$par = $par.parent().not('html');
							// alert($par.prop('tagName').toLowerCase());
							if ($par.prop('tagName')) {
								return MTF.find_parent_attributes($par, type);
							} else {
								return false;
							}
						}

					},

					// provide reporting on the mixed values for later display in a hover table
					format_mixed_array: function(allVals, elProps){ TvrCom.startT(arguments);
						var elMap = [];
						for (var i = 0; i < allVals.length; i++) {
							var atts = elProps[i]['atts'];
							var htmlString = '&#60;'+atts['type'];

							if (atts['id']) {
								htmlString+= ' id="'+atts['id']+'"';
							}
							if (atts['class']) {
								// remove tvr-element-overlay tvr-static-overlay classes todo use clean_classes here
								atts['class'] = atts['class']
									.replace('tvr-element-overlay', '')
									.replace('tvr-static-overlay', '')
									.replace('  ', ' '); // double spaces
								if (/\S/.test(atts['class'])) {
									htmlString+= ' class="'+atts['class']+'"';
								}
							}
							htmlString = MTF.finish_tag_string(atts['type'], htmlString);
							elMap[i] = {
								val: allVals[i],
								htmlString: htmlString
							};
							/*elMap[i]['val'] = allVals[i];
					elMap[i]['htmlString'] = htmlString;*/
						}
						TvrCom.endT(arguments)
						return elMap;

					},

					// start with empty compProps
					compProps: {},

					// flatten a multi-dimenional object/array
					flatten: function(arr, subKey){ TvrCom.startT(arguments);
						var flatArr = [];
						var i = -1;
						for (var k in arr){

							if ( ! arr.hasOwnProperty(k) ) continue; // for compat

							if (Object.prototype.toString.call(arr[k]) === '[object Array]'){
								for (var j in arr[k]){

									if ( ! arr[k].hasOwnProperty(j) ) continue; // for compat

									if (subKey){
										flatArr[++i] = arr[k][j][subKey];
									} else {
										flatArr[++i] = arr[k][j];
									}

								}
							}
						}
						TvrCom.endT(arguments)
						return flatArr;
					},
					/* todo remove this, I think I updated orig flatten() function after testing this
			 flatten_better: function(arr){ TvrCom.startT(arguments);
			 var flatArr = [];
			 var i = -1;
			 for (var k in arr){
			 if (Array.isArray(arr[k])){
			 for (var j in arr[k]){
			 flatArr[++i] = arr[k][j];
			 }
			 }
			 }
			 return flatArr;
			 },*/

					// for caching sel elements highlighted when mixed val is hovered over
					sel_elements: {},

					// validate and exclude els
					validate_and_filter_excluded_els: function(code){

						// the user could enter a selector that jQuery can't handle. E.g. invalid nth-of-type(mn), or syntax error
						try {

							// we don't currently let them customize the admin bar
							// this is OK now that we've address some perfomance issues
							//var $wp_admin = $('#wpadminbar');
							//var $sel_elements = $(code).filter(function(){
							//return !TvrCom.isDomEl($(this).closest($wp_admin));
							//});

							var $sel_elements = $(code);

							// selector was successful
							return $sel_elements;

						} catch(err) {

							// we have a jQuery error, return a selector that will target nothing
							return $('#mt-no-element');
						}

					},

					// get the computed props for a given element
					el_comp_styles: function($el, propsList, config){

						var compCSSObj = {},
							tempClass = false;

						// do we need to temp add an mt-event class?
						if (config.eventClass && !$el.hasClass(config.eventClass)){
							$el.addClass(config.eventClass);
							tempClass = true;
						}

						// get the computed CSS properties
						compCSSObj = MTF.getCSS($el[0], propsList, config.pseudoEl);

						/*// do we need to pass in pseudo
				if (config.pseudoEl){
					for (var i = 0; i < propsList.length; i++) {
						var cssf = propsList[i];
						compCSSObj[cssf] = window.getComputedStyle(
							$el[0], config.pseudoEl
						).getPropertyValue(cssf);
					}
					//compCSSObj = $el.css(propsList);
					//console.log('we did the other one', propsList, $.extend(true, {}, compCSSObj));
				} else {
					compCSSObj = $el.css(propsList);

				}*/

						// restore element's class state
						if (tempClass){
							$el.removeClass(config.eventClass);
						}

						//console.log('objects', propsList, config.pseudoEl, $el[0], compCSSObj, MTF.getCSS($el[0], propsList, config.pseudoEl));

						return compCSSObj;
					},

					// MT alternatvie to jQuery .css() that supports pseudo elements
					getCSS: function(el, propsList, pseudo){

						pseudo = pseudo || null;

						var data = {},
							computedStyles = window.getComputedStyle(
								el, pseudo
							);

						// return whole live object if no single property or list of properties was passed in
						if (!propsList){
							return computedStyles;
						}

						// if we just want a single value for one property, return that
						if (!Array.isArray(propsList)){
							return computedStyles[propsList];
						}

						// an array of values was passed, return an object of values
						for (var i = 0; i < propsList.length; i++) {
							var cssf = propsList[i];
							data[cssf] = computedStyles[cssf];
						}

						return data;
					},

					// get computed styles of first x elements in selection
					get_computed_styles: function(config){ TvrCom.startT(arguments);

						// check for use of pseudo ELEMENT (::before, ::after etc)
						//console.log('check fot ::before/::after config', config.data, config)
						config.pseudoEl = null;
						var pseudoEl = TvrCom.get_pseudo_el(config.data);
						if (pseudoEl){
							config.pseudoEl = pseudoEl[0];
						}

						// event adjustments for GUI fields
						if(!config.intelli){

							// check for use of (last) pseudo class that is eligable for pairing with reg class
							config.eventClass = TvrUi.maybe_pair_class(config.data, 'class');
							//console.log('config.eventClass', config.eventClass);

							// get meta for current group / group row
							//console.log('The config we pass for get_pg_meta', $.extend(true, {}, config));
							var M = config.M = TvrUi.get_pg_meta(config.row);
							if (M){

								// get animation event class, js or css, will override selector pseudo class (bad?)
								if (MTdd.event_type(M.eventKey)){
									config.eventClass = 'mt-'+M.eventKey;
								}
							}
						}

						// parent window can only pass function a css selector string to use for creating an object
						M = config.M || TvrUi.get_selector_in_focus();

						var	sectionSlug = M ? M.sectionSlug : false,
							$sel_elements = MTfolder.folderNotLoading(sectionSlug)
								? $('#no-element')
								: (config.con == 'str'
									? MTF.jquery_compat_sel_elements(config.data)
									: MTF.triggerEl);

						//console.log('The $sel_elements / config', sectionSlug, MTfolder.folderNotLoading(sectionSlug), $.extend(true, {}, config), $sel_elements);
						//console.trace();

						// cache sel elements for highlighting when mixed val is hovered over
						MTF.sel_elements = $sel_elements;

						// reset compProps to empty obj and bail if no elements
						if (!$sel_elements.length) {
							TvrUi.compProps = {};
							TvrCom.endT(arguments);
							return false;
						}

						// just get the css styles for the current property group in focus
						var propsList,
							pg_focus;
						if (config.intelli){
							pg_focus = TvrUi.pgInFocusWiz;
							propsList = MTF.flatten([ TvrUi.cssProps[pg_focus] ], 'cssf');
						} else {
							pg_focus = TvrUi.pref.pg_focus;
							propsList = (pg_focus)
								? MTF.flatten([ TvrUi.cssProps[pg_focus] ], 'cssf')
								: MTF.flatten(TvrUi.cssProps, 'cssf'); // this shouldn't happen
						}

						// props list needs to be adjusted for css functions (transform and filters)
						MTdd.maybe_filter_comp_css_props_list(pg_focus, propsList, config);

						//console.log('propsList', propsList, TvrUi.cssProps);

						// exceptions for aliases
						var aliasKeys = Object.keys(TvrUi.propAliases);

						for (var x = 0; x < aliasKeys.length; x++) {

							var aliasKey = aliasKeys[x],
								aliasValue = TvrUi.propAliases[aliasKey],
								propsListKey = propsList.indexOf(aliasKey);

							if (propsListKey !== -1) {
								propsList[propsListKey] = aliasValue;
							}

							//console.log('In the loop', x, aliasKey, aliasValue, propsListKey);
						}


						/*// exception for display flex (display isn't in same prop group so we must explicitly call)
				var flexDisplayIndex = propsList.indexOf('display-flex');
				if (flexDisplayIndex !== -1) {
					propsList[flexDisplayIndex] = 'display';
				}

				// exception for display grid (display isn't in same prop group so we must explicitly call)
				var gridDisplayIndex = propsList.indexOf('display-grid');
				if (gridDisplayIndex !== -1) {
					propsList[gridDisplayIndex] = 'display';
				}*/

						// limit analyses to stop browser potentially crashing
						// can increase this if computed css only gathers info on pg group in focus
						var breakNum = $sel_elements.length;
						if (breakNum > 19) {
							breakNum = 19;
						}

						// compute start/end into left/right depending on ltr/rtl
						var dir = {
							ltr: {
								start: "left",
								end: "right",
								webkitauto : "left"
							},
							rtl: {
								start: "right",
								end: "left",
								webkitauto : "right"
							}
						};

						var elProps = [],
							nodeCSS = [];

						MTF.compProps = {}; // reset comProps to blank obj

						// iterate through the first 20 elements to check for mixed style property values across elements
						var elCount = 0;

						//console.log(TvrUi.cssProps);
						//console.log('flattened'+propsList);
						//console.log($sel_elements);

						// loop through the elements the selector targets
						$sel_elements.each(function(index) {

							++elCount;

							// break if limit reached
							if (index > breakNum) {
								return false;
							}

							elProps[index] = [];

							var $this = $(this);

							// todo there must be some reason why this is inside the loop, check later
							if (MTF.jQueryVersion >= '01.09.00'){
								//var compCSSObj = $this.css(propsList);
								var compCSSObj = MTF.el_comp_styles($this, propsList, config);
							} else {
								var compCSSObj = {'font-family': ''};
								var status = {
									'short': TvrLang.update_jquery,
									'long': '<p>'+ TvrLang.update_jquery_long +'</p>',
									'type' : 'error'
								};
								MTsave.log(status);
								MTsave.update_full_logs();
								return false;
							}

							//console.log('compCSSObj unadjusted', $.extend(true, {}, compCSSObj));

							// get computed props for grid items if grid pg
							if (index === 0 && TvrUi.pref.pg_focus === 'grid'){

								// we always recalculate the grid when comp styles are updated
								// (we don't always reflow the canvas though) - why not?
								TvrUi.grid = MTgrid.update_grid_settings($this, compCSSObj.display);
								//console.log('the TvrUi.grid determined', TvrUi.grid)
								/*if (TvrUi.skipGridReflow){
									TvrUi.skipGridReflow = false;
								} else {

								}*/
							}

							// apply adjustments and handle exceptions
							for (var i in compCSSObj) {

								if ( ! compCSSObj.hasOwnProperty(i) ) continue; // for compat

								// bail if null value
								if (!TvrCom.hasValue(compCSSObj[i])) {
									continue;
								}

								// we have a value
								else {

									// todo this text-align stuff seems chaotic and incomplete.
									// see http://help.dottoro.com/lcnebmiu.php
									if (i == 'text-align' && (compCSSObj[i] == 'start' || compCSSObj[i] == 'end')) {
										//compCSSObj[i] = dir[compCSSObj['direction']][compCSSObj[i]];
									}
									else if (i == 'text-align' && (compCSSObj[i] == '-webkit-auto')) {
										compCSSObj[i] = dir[compCSSObj['direction']][compCSSObj[i].replace(/-/g, '')];
									}
									// webkit includes rgb with text-decoration oddly - remove
									else if (i == 'text-decoration') {
										var tmp = compCSSObj[i].split(' ');
										compCSSObj[i] = tmp[0];
									}

									// transform always returns a matrix, convert to css functions
									else if (i === 'transform') {
										//console.log('we need transform comp', compCSSObj, i)
										MTdd.transform_matrix_to_functions(compCSSObj, compCSSObj[i], $this)
										//MTdd.extract_css_functions(compCSSObj, compCSSObj[i]);
									}

									// filters need extracting
									else if (i === 'filter') {
										//console.log('we need filter comp', compCSSObj, i)
										MTdd.extract_css_functions(compCSSObj, compCSSObj[i]);
									}

									// prevent too many decimals
									compCSSObj[i] = TvrCom.sane_decimal(compCSSObj[i]);

									// todo have complete system for handling comma sep values
									// if gradients have been used the value of interest with:
									// bg image, position, repeat, attachment is before ",".
									if ( i == 'background-position' ||
										i == 'background-repeat' ||
										i == 'background-size' ||
										i == 'background-clip' ||
										i == 'background-attachment') {
										var tmp = compCSSObj[i].split(',');
										compCSSObj[i] = tmp[0];
									}

									// backup background image full string for later comparison
									if (i == 'background-image') {
										compCSSObj['background-img-full'] = compCSSObj[i];
										compCSSObj['extracted-gradient'] = TvrCom.extract_str('gradient', compCSSObj[i]);
										compCSSObj[i] = TvrCom.extract_str('bg-image', compCSSObj[i]);

										//console.log('compCSSObj', compCSSObj, compCSSObj[i])

									}

									// store the parent width and font-size context (for auto converts)
									var $parent = $this.parent();
									nodeCSS[index] = [];
									nodeCSS[index]['element'] = {};
									nodeCSS[index]['element'] = $this.css(['font-size', 'width', 'height']);
									if (TvrCom.isDomEl($parent)) {

										nodeCSS[index]['parent'] = $parent.css(['font-size', 'width', 'height']);

										// don't use inline element for w/h as CSS uses first block parent to calc percentages
										if ($parent.css('display') === 'inline'){
											var $blockParent;
											if ($blockParent = MTF.get_first_block_parent($parent)){
												var blockCSS = $blockParent.css(['width', 'height']);
												nodeCSS[index]['parent']['width'] = blockCSS.width;
												nodeCSS[index]['parent']['height'] = blockCSS.height;
											}
										}

										//console.log('get_first_block_parent', MTF.get_first_block_parent($parent));
									}
								}
							}

							// todo this would be clearer using {} syntax
							// store compCSS for each element in selection in one big array
							elProps[index]['propsList'] = compCSSObj;
							elProps[index]['atts'] = [];
							elProps[index]['atts']['type'] = $this.prop('tagName').toLowerCase();
							elProps[index]['atts']['id'] = $this.attr('id');
							elProps[index]['atts']['class'] = $this.attr('class');

						});

						// check if some values are mixed, if so add list array. Otherwise just single value.
						for (var i in propsList) {

							if ( ! propsList.hasOwnProperty(i) ) continue; // for compat

							var cssProp = propsList[i];
							var firstVal = elProps[0]['propsList'][cssProp];
							var allVals = [];
							var mixed = false;
							for (var j in elProps) {

								if ( ! elProps.hasOwnProperty(j) ) continue; // for compat

								// todo I think this relates to hasOwnProperty issue I learned about - add check later
								if (!elProps[j]['propsList']){
									continue;
								}

								allVals[j] = elProps[j]['propsList'][cssProp];
								if (allVals[j] != firstVal) {
									mixed = true;
								}
							}
							if (!mixed) {
								MTF.compProps[cssProp] = firstVal;
							} else {
								MTF.compProps[cssProp] = MTF.format_mixed_array(allVals, elProps);
							}
						}

						// update wizard or standard comp css var
						if (config.intelli){
							TvrUi.intelliCompProps = MTF.compProps;
							TvrUi.intellinodeCSS = nodeCSS;
						} else {
							TvrUi.compProps = MTF.compProps;
							TvrUi.nodeCSS = nodeCSS;
						}

						/*console.log('the elProps', TvrUi.nodeCSS, elProps);
				console.log('the compProps', $.extend(true, {}, MTF.compProps));*/

						TvrCom.endT(arguments)
					},

					// run grid control update if sel exists
					maybe_run_grid_control_update: function(realClick){

						var $selEl = $(MTF.sel_elements[0]),
							elExists = TvrCom.isDomEl($selEl),
							display = elExists ? $selEl.css('display') : 'none';

						TvrUi.grid = MTgrid.update_grid_settings((elExists ? $selEl : false), display);

						MTgrid.update_grid_canvas();
					},

					// get first block level parent e.g. so autConvert works
					get_first_block_parent: function($el){

						var $blockParent = false;

						$el.parents().each(function(){
							var $parent = $(this);
							if ($parent.css('display') !== 'inline') {
								$blockParent = $parent;
								return false; // bail out
							}
						});

						return $blockParent;
					},

					/* default config for positioning overlays
			 reposition_defaults: {
			 con: 'reg',
			 scroll: true,
			 css: '#mt-no-element'
			 },
			 */

					// switch highlight function
					// todo this function can cause performance issues if the selector matches lots of elements on the page
					reposition_overlays: function(config, els){ TvrCom.startT(arguments);

						//console.trace();

						// remove existing overlays
						if (MTF.stat.overlaysContainer){
							MTF.stat.overlaysContainer.empty(); // was .html('')
							// todo MTF.stat.placeholderLayer may need to be cleared too
						}

						// reset highlight classes
						if (MTF.$highligted_els && MTF.$highligted_els.length){
							MTF.$highligted_els.removeClass('tvr-element-overlay tvr-static-overlay tvr-hover-element');
						}

						// try to select elements
						els = (els !== undefined) ? els :  MTF.get_sel_elements(config);
						config.els = els;
						config.css = els.css;

						//console.log('the repos config', $.extend(true, {}, config));

						// hide container if no elements
						if (!els.n){
							MTF.hide_overlays();
							//MTF.stat.overlaysContainer.hide();
						}

						// we have elements
						else {

							MTF.show_overlays();

							//config = els.config;

							var $sel_elements = els.$sel_elements,
								$toEls = els.$toEls;

							// cache the currently highlighted elements for efficient removal later
							MTF.$highligted_els = $sel_elements;

							// add the overlays
							// use global counter to ensure unqiue ids when add_mt_overlay() is called multiple times
							MTF.overlayCount = 0;
							MTF.add_mt_overlay($sel_elements, MTF.triggerEl, config);

							// if the triggerEl (single element that was selected) changed
							if (TvrCom.isDomEl(MTF.triggerEl)){
								MTF.update_frontend_controls(MTF.triggerEl, config);
							}

							// scroll to element if required
							if (config.scroll && parseInt(TvrUi.pref.scroll_to_elements)) {

								//console.log('We scroll', config.scroll, TvrUi.pref.scroll_to_elements);

								// but on if it isn't already visible isPartiallyInViewport
								//var off = MTF.off_screen($toEls, true);
								var boundingClientRect = config.con !== "sel-preview"
									&& MTF.triggerElOverlay
									&& MTF.triggerElOverlay.boundingClientRect
										? MTF.triggerElOverlay.boundingClientRect
										: (TvrCom.isDomEl($toEls) ? $toEls[0].getBoundingClientRect() : false),
									isOnScreen = MTF.isOnScreen($toEls, boundingClientRect);

								//console.log('We should try to scroll', config, $toEls, boundingClientRect, MTF.triggerElOverlay)

								if (!isOnScreen){

									// stop 36px early to allow for wordpress top bar
									var scrollPos = (boundingClientRect.top + window.scrollY - 36); // ($toEls.offset().top - 36);

									//console.log('The scrollPos', scrollPos, ($toEls.offset().top - 36))

									if (TvrUi.browser === 'MSIE' || TvrUi.browser === 'Safari'){
										//console.log('JS animation frame smooth scroll', TvrUi.browser, $.extend(true, {}, config))
										TvrCom.scrollToSmoothly(scrollPos, 500, window);
									}

									// just set the scroll position and let browsers that support scroll-behavior: smooth; animate
									else {
										//console.log('Browser smooth scroll', TvrUi.browser, $.extend(true, {}, config))
										TvrCom.scroll_to({
											scrollDiv: MTF.stat.html,
											offset: scrollPos
										});
									}

									/*$('body').animate({
								scrollTop: ($toEls.offset().top - 36) // stop 36px early to allow for wordpress top bar
							}, 250);*/
								}
							}

						}

						TvrCom.endT(arguments)
					},

					hide_overlays: function(){
						MTF.stat.html.add(TvrUi.stat.tvr).addClass('mt-zero-elements');
					},

					show_overlays: function(){
						MTF.stat.html.add(TvrUi.stat.tvr).removeClass('mt-zero-elements');
					},

					get_sel_elements: function(c){

						var config = $.extend({}, {
								con: 'reg'
							}, c),
							css,
							$sel_elements,
							$toEls;

						//console.log('The config', config);

						// if we're highlighting individual elements when the mixed val is hovered over,
						// get object from cached selection of objects
						if (config.con === 'mixed-hover') {
							$sel_elements = MTF.sel_elements.eq(TvrUi.mixedElKey);
							$toEls = $sel_elements;
						}

						else if (config.con === 'grid-nth-item') {
							$sel_elements = TvrUi.grid.items[TvrUi.nthItemIndex].$item;
							$toEls = $sel_elements;
							//console.log('grid nth highlight added', TvrUi.nthItemIndex, TvrUi.grid.items, $sel_elements)
						}

						// otherwise get selection from CSS selector
						else {

							// get css selector for overlays
							if (config.con === 'reg'){

								if (TvrUi.pref.show_code_editor){
									//css = TvrUi.intelli_css; // todo get selector from current line

									css = MTace.get_code_editor_selector();

								} else {
									css = TvrUi.curSelCSS;
									//console.log('We get the cur CSS', css)
								}


							} else if (config.con === 'intelli'){
								css = TvrUi.intelli_css;
							} else {
								css = config.css;
							}

							//console.log('the selection css', css)

							// get sel elements if they weren't passed into the function (quick hover preview)
							if (!config.$sel_elements){
								// remove pseudo, escape quotes, remove styles entered after {}
								$sel_elements = MTF.jquery_compat_sel_elements(css);
								//console.log('Get new sel elemetns', css, $sel_elements, $sel_elements.innerWidth())
							} else {
								$sel_elements = config.$sel_elements;
								//console.log('Get passed sel elemetns', config, $sel_elements)
							}


							var triggerElInNewSelection = TvrCom.isDomEl( $sel_elements.filter(MTF.triggerEl) );

							// if trigger el is in the selection
							$toEls = triggerElInNewSelection
								? MTF.triggerEl
								: $sel_elements.first();

							//console.log('the el is in the selection', css,  $sel_elements.filter(MTF.triggerEl), $sel_elements, MTF.triggerEl)
						}

						return {
							$sel_elements: $sel_elements,
							$toEls: $toEls,
							n: $sel_elements ? $sel_elements.length : 0,
							triggerElInNewSelection: triggerElInNewSelection,
							css: css
							//config: config
						}
					},

					select_current_selector_elements: function(config){

						var selectorEls = MTF.get_sel_elements(config),
							$newTarget = selectorEls.n ? selectorEls.$toEls : false;

						//config.selectCurrentSelector = config.selectCurrentSelector;
						config.selectCurrentSelector = 1;

						//config.scroll = !config.resumeExistingSel;
						config.e = config.e || {};

						// fall back to CSS use in get_sel_elements if not provided
						if (!config.existingSelCSS){
							config.existingSelCSS = selectorEls.css;
						}

						// mark that the pseudo was selected
						config.pseudoSelected = TvrCom.get_before_after(config.existingSelCSS, 1);

						//console.log('select_current_selector_elements', $newTarget, config)
						//console.trace();

						MTF.select_element($newTarget, config);
					},

					// maintain the current scroll position after toolbar_adjusted has triggered a change.
					/*maintain_cur_scroll: function(topControlsChange, maintainElView, preTargeting){ TvrCom.startT(arguments);

				var curPos = MTF.stat.body.scrollTop();
				var newPos = curPos+topControlsChange;
				MTF.stat.body.scrollTop(newPos);

				if (!TvrCom.isDomEl(MTF.triggerEl)){
					TvrCom.endT(arguments);
					return false;
				}

				var off = MTF.off_screen(MTF.triggerEl);
				// scroll to element if auto adjusting the screen failed to display it (footer els need this sometimes)
				if (maintainElView && !off.half.on){
					MTF.stat.body.scrollTop(MTF.triggerEl.offset().top - 100); // 100 just to give it some room
				}
				TvrCom.endT(arguments)
			},*/

					// get the user's mouse position from a JS event
					mouse_coordinate: function(e, $obj){ TvrCom.startT(arguments);
						var x = e.clientX+MTF.stat.body.scrollLeft();
						var y = e.clientY+MTF.stat.body.scrollTop();
						var co = {
							x:x,
							y:y
						};
						if ($obj){
							var offset = $obj.offset();
							co.elX = x - offset.left;
							co.elY = y - offset.top;
						}
						//console.log(co);
						TvrCom.endT(arguments)
						return co;

					},

					/*
			 isPartiallyInViewport: function(element){ TvrCom.startT(arguments);
			 element = element[0];
			 if(element.offsetTop<window.innerHeight &&
			 element.offsetTop>-element.offsetHeight
			 && element.offsetLeft>-element.offsetWidth
			 && element.offsetLeft<window.innerWidth){
			 return true;
			 } else {
			 return false;
			 }
			 },

			 // check if a given element is visible on the page
			 isElementInViewport: function($el){ TvrCom.startT(arguments);
			 var el = $el[0];
			 var rect = el.getBoundingClientRect(); // this isn't supported in IE10
			 return (
			 rect.top >= 0 &&
			 rect.left >= 0 &&
			 rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			 rect.right <= (window.innerWidth || document.documentElement.clientWidth)
			 );
			 },
			 */

					// if any part of the element is on screen
					// a better version of off_screen function which had some issues
					isOnScreen: function($el, boundingClientRect){

						if (!TvrCom.isDomEl($el)){
							return false;
						}

						var rect = boundingClientRect || $el[0].getBoundingClientRect(),
							viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight),
							viewWidth = Math.max(document.documentElement.clientWidth, window.innerWidth);

						//TvrCom.callStack();
						/*console.log('Debug', {
					rect: rect,
					viewHeight: viewHeight,
					viewWidth: viewWidth,
					logic: {
						one: rect.bottom < 0,
						two: rect.top - viewHeight >= 0,
						three: rect.left < 0,
						four: rect.left - viewWidth >= 0
					},
					isOnScreen: !(rect.bottom < 0 || rect.top - viewHeight >= 0 || rect.right < 0 || rect.left - viewWidth >= 0)
				})*/

						return !(rect.bottom < 0 || rect.top - viewHeight >= 0 || rect.right < 0 || rect.left - viewWidth >= 0);
					},

					// determine if an element is off the screen, in which direction,
					// and if multiple, so MT doesn't auto move to top if a lower el is in view
					/*off_screen: function($el, multiple){ TvrCom.startT(arguments);

				// and body / html should be excluded

				if (!TvrCom.isDomEl($el)){
					TvrCom.endT(arguments)
					return false;
				}

				TvrCom.startT('off_screen get offset');
				var offset =  TvrCom.offset($el); //
				TvrCom.endT('off_screen get offset');

				// store key vars in obj for debugging
				TvrCom.startT('off_screen setup c');
				var off = {
					c: {
						scrT: $(window).scrollTop(),
						scrL: $(window).scrollLeft(),
						top: offset.top,
						height: $el.height(),
						windowHeight: $(window).height(),
						left: offset.left,
						width: $el.width(),
						windowWidth: $(window).width()
					}
				};
				TvrCom.endT('off_screen setup c');

				TvrCom.startT('off_screen calc');

				// check if el goes off screen, on all sides
				off.bottom = (off.c.top + off.c.height <= (off.c.windowHeight+off.c.scrT)) ? 0 : 1;
				off.right = (off.c.left + off.c.width <= (off.c.windowWidth+off.c.scrL)) ? 0: 1;
				off.top = (off.c.top >= off.c.scrT) ? 0 : 1;
				off.left = (off.c.left >= off.c.scrL) ? 0: 1;

				// overall checks
				off.on = (!off.bottom && !off.right && !off.top && !off.left);

				// check if el if 50% or 30% on
				var partial = ['half', 'third'];
				for (var i in partial){

					if ( ! partial.hasOwnProperty(i) ) continue; // for compat

					var divide = i+2;
					var p = partial[i];
					off[p] = {
						bottom: (off.c.top + (off.c.height/divide) <= (off.c.windowHeight+off.c.scrT)) ? 0 : 1,
						right:  (off.c.left + (off.c.width/divide) <= (off.c.windowWidth+off.c.scrL)) ? 0: 1,
						top: (off.c.top + (off.c.height/divide) >= off.c.scrT) ? 0 : 1,
						left:  (off.c.left+ (off.c.width/divide) >= off.c.scrL) ? 0: 1
					};
					off[p].on = (!off[p].bottom && !off[p].right && !off[p].top && !off[p].left);
				}
				TvrCom.endT('off_screen calc');

				TvrCom.endT(arguments)
				return off;

			},*/

					// get a sub array of selectors match a given element
					get_matching_selectors: function($el, obj, pseudo, forAI){ TvrCom.startT(arguments);

						if (!TvrCom.isDomEl($el)){
							TvrCom.endT(arguments);
							return [];
						}

						// m is an array of object that can be sorted
						var m = [],
							el = $el[0],
							i = 0;

						//console.log('get_matching_selectors', el, obj)

						// loop through full list of potential selectors
						for (var id in obj){
							if (obj.hasOwnProperty(id)){

								var item = obj[id],
									selCode = item.code;

								// We don't want to include everything selectors, otherwise all elements are blue
								// and MT keeps re-selecting the * selector
								if (selCode === '*'){
									continue;
								}

								var	analysis = MTF.selectorMatches(el, selCode, pseudo, true);

								// does it match the element?
								if (analysis.doesMatch){
									m[i] = {
										'id':id,
										'fName':item.fName,
										'sName':item.sName,
										'code':selCode,
										'type': item.type,
										'line': item.line,
										//'n':  $(selCode).length,
										'n': document.querySelectorAll(analysis.baseSelector).length,
										'ui_order':i
									};
									++i;
								}
							}
						}

						// sort the selectors by how many els they target, then by reverse ui order
						if (!forAI){
							// for AI debugging, we want to maintain the natural ui_order
							m.sort(TvrCom.firstBy('n').thenBy('ui_order', -1));
						}


						//console.log('selector matches', m);

						TvrCom.endT(arguments);
						return m;

					},

					maybe_start_mutation_observer: function(){ TvrCom.startT(arguments)

						//return false;

						if (!TvrUi.mutationObserver){

							// Select the node that will be observed for mutations
							var targetNode = MTF.stat.html[0];

							// Options for the observer (which mutations to observe)
							var config = {
								childList: true,
								subtree: true
							};

							// Callback function to execute when mutations are observed
							var callback = function(mutationsList, observer) {

								//console.log('mutationsList, obs', mutationsList, observer)

								var i;
								for (i = 0; i < mutationsList.length; i++) {

									var mutation = mutationsList[i];

									//console.log('mutation.target', mutation);

									if (!MTF.ignoreMutation(mutation)){

										//console.log('We set HTML update mutation signal', mutation);

										MTF.setDomChangedSignals();
									}
								}

							};

							// Create an observer instance linked to the callback function
							var observer = new MutationObserver(callback);

							// Start observing the target node for configured mutations
							observer.observe(targetNode, config);

							//

							TvrUi.mutationObserver = observer;

							//console.log('Mutation observer started');
						}
						TvrCom.endT(arguments)
					},

					// we don't want to update the HTML pane simply due to MT DOM activity
					isMTIgnoreStuff: function(el){
						return TvrCom.isDomEl( $(el).closest('#mt-stuff-ignore') );
					},

					ignoreMutation: function(mutation) {

						var nodeTypes = [
								'addedNodes',
								'removedNodes'
							],
							ignoreIDs = [
								'mt-stuff-ignore',
								'mt-code-suggestions',
								'mtprv-',
								'sizzle',
								'mt-test-pseudo-el',
								'mtdynSeperatorcss-1',
								'__bs_notify__'
							],
							ignoreClasses = [

							];

						var target = mutation.target;

						if (MTF.isMTIgnoreStuff(target)){
							return true;
						}

						// excluded target
						//console.log('ignoring target mutation', mutation, mutation.target);
						if ( target.tagName === 'HEAD' ||
							(target.id && TvrCom.isString(target.id) && TvrCom.in_array(target.id, ignoreIDs, true)) ){
							//console.log('ignoring target mutation', mutation.target.id, ignoreIDs);
							return true;
						}

						// Sometimes target will be HTML, so check child nodes
						for (var i = 0; i < nodeTypes.length; i++) {

							var nodeType = nodeTypes[i],
								nodeList = mutation[nodeType],
								node = nodeList.item(0);

							if (node){

								if (MTF.isMTIgnoreStuff(node)){
									return true;
								}

								var firstElementChild = node.firstElementChild,
									nodeID = node.id;

								//console.log('checking mutation', firstElementChild, nodeID, nodeType, mutation[nodeType], node, ignoreIDs);

								if ( (nodeID && TvrCom.isString(nodeID) && TvrCom.in_array(nodeID, ignoreIDs, true)) ||
									(firstElementChild && TvrCom.isString(firstElementChild.id) && firstElementChild.id &&
										TvrCom.in_array(firstElementChild.id, ignoreIDs, true)) ){
									//console.log('ignoring mutation', mutation[nodeType], node.id, ignoreIDs);
									return true;
								}
							}
						}

						return false;

					},
					maybe_stop_mutation_observer: function() {
						if (TvrUi.mutationObserver){
							TvrUi.mutationObserver.disconnect();
							TvrUi.mutationObserver = false;
							//console.log('Mutation observer stopped');
						}
					},

					setup_initial_grid_lines: function(){

						var html = '<div class="mt-oncanvas-grid-wrap"><div class="mt-oncanvas-grid">',
							totalItems = 24;

						for (var j = 0; j <= totalItems; j++) {
							html+= MTF.on_canvas_grid_line('');
						}

						html+= '</div></div>';

						return html;

					},

					on_canvas_grid_line: function(style, nthItemExists){

						var nthClass = nthItemExists ? ' nth-item-exists' : '';

						return '<div class="mtoc-line'+nthClass+'" style="'+style+'"></div>';
					},

					overlayParentIsStatic: function(){
						let $overlayParentEl = MTF.stat.$overlayParentEl || MTF.stat.body;
						return $overlayParentEl.css('position') === 'static';
					},

					// when body has position relative, absolute position will be relative to that
					// rather than the html element - so .offset() getter values must be adjusted when setting CSS
					nonStaticBodyAdjust: function(){

						var $overlayParentEl = MTF.stat.$overlayParentEl || MTF.stat.body,
							overlayParentIsStatic = MTF.overlayParentIsStatic(),
							bodyOffset = $overlayParentEl.offset();

						return {
							top: (overlayParentIsStatic ? 0 : (bodyOffset.top*-1)),
							left: (overlayParentIsStatic ? 0 : (bodyOffset.left*-1))
						};
					},

					// convert grid tracks to a stepped linear gradient for showing the column and row gaps
					grid_tracks_to_gap_gradient: function(containerCSS){

						let axis = [];

						['column', 'row'].forEach(function(lineType){

							let gap = containerCSS[lineType+'-gap'],
								items = containerCSS['grid-template-'+lineType+'s']
									.replace(/\[.*?]\s+?/g, '') // remove line names
									.split(/\s+/),
								to = lineType === 'column' ? 'right' : 'bottom',
								parts = ['to '+to],
								pink = 'rgba(170, 97, 223, .15)',
								trans = 'transparent',
								trackStart = 0,
								correction = 0,
								gapSize = gap === 'normal' ? 0 : parseFloat(gap);

							// ensure gap is a number, of at least 1, so lines are visible
							if (gapSize === 0){
								gapSize = 1;
								correction = 1; // ensure maths fits with actual gap size
							}

							// build the css
							items.forEach(function(trackSize, index){

								// convert to number
								trackSize = parseFloat(trackSize);

								let trackEnd = trackStart+trackSize,
									gapStart = trackEnd,
									gapEnd = gapStart+gapSize;

								// column is transparent
								parts.push(trans+' '+trackStart+'px '+trackEnd+'px');

								// if it's not the last column, add a gap after
								if (index !== items.length-1){
									parts.push(pink+' '+gapStart+'px '+gapEnd+'px');
								}

								// update anchor point to new gap end
								trackStart = gapEnd - correction;

							});

							//console.log('debug grid highlight', lineType, parts);

							axis.push('linear-gradient('+parts.join(', ')+')');

						});

						containerCSS['background-image'] = axis.join(', ');

						// save the lines separately in cas
						/*containerCSS['background-image-column'] = axis.join(', ');
						containerCSS['background-image'] = axis.join(', ');*/

					},

					// update grid highlight
					update_grid_highlight: function(grid){

						//console.log('we are loading builder', grid.$container, TvrUi.loading_builder, TvrCom.isDomEl(grid.$container, true))

						if (TvrUi.loading_builder || !grid.$container || !TvrCom.isDomEl(grid.$container, true, MTF.stat.doc)){
							return false;
						}

						//console.log('the thing', MTF.stat.doc, grid.$container, TvrCom.isDomEl(grid.$container, true, MTF.stat.doc));

						var $mtHighlight = $('#mt-grid-highlight'),
							$gridHighlightWrap = $mtHighlight.find('.mt-oncanvas-grid-wrap'),
							$gridHighlight = $mtHighlight.find('.mt-oncanvas-grid'),
							container = grid.container,
							pos = container.pos,
							items = grid.items,
							containerOffset = grid.$container.offset(), // get fresh position of container
							comp = container.comp,
							newLines = '',
							nonStaticBodyAdjust = MTF.nonStaticBodyAdjust();

						// calculate vertical and horizontal offset adjustment for padding and border
						var topAdjust = parseInt(comp['border-top-width']) + parseInt(comp['padding-top']),
							bottomAdjust = parseInt(comp['border-bottom-width']) + parseInt(comp['padding-bottom']),
							vAdjust = topAdjust + bottomAdjust,
							leftAdjust = parseInt(comp['border-left-width']) + parseInt(comp['padding-left']),
							rightAdjust = parseInt(comp['border-right-width']) + parseInt(comp['padding-right']),
							hAdjust = leftAdjust + rightAdjust,
							numCompRows = container.lines.rows.total-1,
							numCompCols = container.lines.columns.total-1,
							containerCSS = {
								top: (containerOffset.top + topAdjust + nonStaticBodyAdjust.top),
								left: (containerOffset.left + leftAdjust + nonStaticBodyAdjust.left),
								width: (pos.width - hAdjust),
								height: (pos.height - vAdjust),
								'grid-template-rows': comp['grid-template-rows'],
								'grid-template-columns': comp['grid-template-columns'],
								'row-gap': comp['row-gap'],
								'column-gap': comp['column-gap'],
								'justify-content': comp['justify-content']
							},

							// using subgrid might be best, but it's complicated with intermediary
							// grids and master grid with padding/border/gap - so deferring this task for now
							masterGridStyles = {
								top: (containerOffset.top + topAdjust + nonStaticBodyAdjust.top)+'px',
								left: (containerOffset.left + leftAdjust + nonStaticBodyAdjust.left)+'px',
							},
							mainGridStyles = $.extend(true, {
								//top: (containerOffset.top + nonStaticBodyAdjust.top),
								//left: (containerOffset.left + nonStaticBodyAdjust.left),
								width: (pos.width - hAdjust),
								height: (pos.height - vAdjust),
								'grid-template-rows': comp['grid-template-rows'],
								'grid-template-columns': comp['grid-template-columns'],
								'row-gap': comp['row-gap'],
								'column-gap': comp['column-gap'],
								'justify-content': comp['justify-content'],
								'border-color': 'transparent',
							}, {});

						//MTF.grid_tracks_to_gap_gradient(containerCSS);
						MTF.grid_tracks_to_gap_gradient(mainGridStyles);

						// position the grid container
						//$gridHighlight.css(containerCSS);

						MTgrid.applyGridStyles(
							true, container, masterGridStyles, mainGridStyles,
							container.hasSubGrid, $gridHighlightWrap, $gridHighlight,
							numCompRows, numCompCols,
							mainGridStyles['grid-template-rows'], mainGridStyles['grid-template-columns']
						);

						//console.log('the $gridHighlight', container, grid);

						// calculate longest items or doms els
						var $existingNodes = $gridHighlight.children('.mtoc-line'),
							existingNodesLength = $existingNodes.length,
							rows = TvrCom.checkObject(grid, ['container', 'lines', 'rows', 'offsets']),
							columns = TvrCom.checkObject(grid, ['container', 'lines', 'columns', 'offsets']);

						rows = rows ? Object.keys(rows) : [];
						columns = columns ? Object.keys(columns) : [];

						// num tracks is num lines minus 1
						var numRows = rows.length ? rows.length-1 : 0,
							numColumns = columns.length ? columns.length-1 : 0,
							itemsLength = numRows * numColumns;

						// adjust num items need for items that span multiple rows or columns
						var totalExcess = 0;
						for (var i = 0; i < items.length; i++) {
							var co = items[i].coordinates;
							//console.log('i, co', i, co);
							if (co){
								totalExcess+= (co.width * co.height) -1;
							}

						}
						itemsLength = itemsLength - totalExcess;

						// determine longest set
						var longestSet = existingNodesLength > itemsLength
							? existingNodesLength
							: itemsLength

						//console.log('items length', itemsLength, totalExcess, numRows, numColumns);

						// generate HTML with inline style to replace
						for (var j = 0; j < longestSet; j++) {

							var style = (j >= itemsLength) ? 'display:none;' : '',
								nthItemExists = false;

							// hide unused grid tracks
							if (j >= itemsLength) {
								style = 'display:none;';
							}

							// we have data for the grid item
							else {

								var item = items[j];

								if (item){
									style = TvrCom.config_obj_to_string({
										"grid-column-end": item.comp['grid-column-end'],
										"grid-column-start": item.comp['grid-column-start'],
										"grid-row-end": item.comp['grid-row-end'],
										"grid-row-start": item.comp['grid-row-start'],
										'grid-area':item.comp['grid-area'],
										'order':item.comp['order']
									}, false, '; ');

									nthItemExists = true;
								}
							}

							//console.log('line and style', offset, style)

							// if dom el for line already exists
							if (j < existingNodesLength){

								var $existingNode = $existingNodes.eq(j);

								// update style attribute
								$existingNode[0].style = style;

								if (nthItemExists){
									$existingNode.addClass('nth-item-exists');
								} else {
									$existingNode.removeClass('nth-item-exists');
								}
							}

							// dom el doesn't exist
							else {

								// add new node for line
								newLines+= MTF.on_canvas_grid_line(style, nthItemExists);
							}
						}

						// add any new lines in one go
						if (newLines){
							$gridHighlight.append(newLines);
						}

					},


					// todo
					// support shadow DOM styling of elements with exposed part="x" and nested shadows that use exportparts="x, y, z"
					shadow: {
						isRoot: function($el){
							let el = $el[0];
							return el.shadowRoot ? el : false;
						},
						isInside: function(el){
							return el.getRootNode() instanceof ShadowRoot;
						},
						prevMouseMoveEl: null,
						mouseMoveBound: false,
						maybeBindMouseMove: function($el){

							let shadowRoot = MTF.shadow.isRoot($el);
							//console.log('Is shadow root', !!shadowRoot, $el);

							if (shadowRoot){

								TvrUi.EventHandler.addEventListener('mousemove.tvr-shadow', function(e){

									e.stopPropagation();

									let parentTrailArr = e.composedPath(),
										el = parentTrailArr[0];

									// if mouseover to new el
									if (!el.isEqualNode(MTF.shadow.prevMouseMoveEl)){
										// console.log('Mousemove new el - mouseover', el.tagName, $el.offset());
									}

									MTF.shadow.prevMouseMoveEl = el;

								}, $el[0]);

								//console.log('shadowEls', shadowRoot.innerHTML, window, customElements.get(el.tagName));
							}
						},
						maybeUnbindMouseMove: function($el){

							let shadowRoot = MTF.shadow.isRoot($el);

							if (shadowRoot){
								TvrUi.EventHandler.removeEventListener('mousemove.tvr-shadow', $el[0]);
								MTF.shadow.mouseMoveBound = false;
								//console.log('mousemove unbound', shadowRoot.tagName);
							}
						},
					},

					// bind hover events, and single click to focus on element
					bind_wizard_hover: function(){ TvrCom.startT(arguments);

						//console.log('the bind hover fired', MTF.stat.html.hasClass('tvr-hh-mode'))

						// ensure no double-binding
						if( MTF.stat.html.hasClass('tvr-hh-mode') ) {

							//console.log('bail on double bind');

							return true;
						}

						// signal el is being hovered
						MTF.stat.html.addClass('tvr-hh-mode mt_highlight');

						// ensure highlight is on
						//console.log('tmp highlight', TvrUi.tmp['mt_highlight'], TvrUi.highlightManuallyDisabled);
						TvrUi.feature_on(0, 'mt_highlight', {fHTML:1, noSave:1});

						// Ensure no stale disabled message lingers
						//MTsave.update_prog_indicator('minus', false, TvrLang.mt_targeting_disabled);

						// Trigger any builder integration responses
						MTint.targetingAdjusted('Enabled');

						// temp disable BB if it is currently in use
						MTint.builderUnq.FLBuilder.maybe_disable_beaver_builder();

						// maybe remove Oxygen mouseover and mouseout events - if not done already
						// MT will run that oxygen functionality instead, when not in targeting mode
						//console.log('MTF now', MTF);
						MTF.integrate.oxygen.maybeRemoveComponentMouseEvents();

						// show wizard
						//TvrUi.show_wizard(true);

						//console.log('TvrUi.domChanged', TvrUi.domChanged, TvrUi.pref.wizard_expanded); // todo update

						if (TvrUi.pref.wizard_expanded){

							// default to the correct tab
							TvrUi.default_to_tab('wizard');

							// Update html at this wizard launch stage (and use background editor for line number scrolling)
							//console.log('the dom check', $.extend(true, {}, TvrUi.domChanged))
							if (TvrUi.domChanged.updateHTMLPane){

								TvrUi.maybeUpdateInspectorPanels({
									updateHTML: 1,
									initialHoverBind: 1
								});

								//console.log('it did change', TvrUi.domChanged)
								//TvrUi.update_wizard_html({updateVisEditor:1}); //
								//TvrUi.domChanged.updateHTMLPane = false;
							}

						}

						// a supported page builder has made style changes and Styles tab should update CSS rules.
						if (MTint.reinitRules()){
							TvrUi.reinitRules = true;
						}

						// binding hover events to all els on a big page will take time, so do once (no unbind)
						if (!MTF.stat.html.hasClass('mt-hover-bound')){

							MTF.stat.html.addClass('mt-hover-bound');

							// apply hover event
							// note this was changed from MTF.stat.body so that body element could be selected
							MTF.stat.html.on('mouseover.wiz-hover', '*', function(e){

									let $el = $(this),
										skipMTMouseAction = MTF.skipMouseAction($el, true);

									if (!skipMTMouseAction){
										e.stopPropagation();
										//console.log('MT mouseover on', $el);
									} else {
										//console.log('MT mouseover disallowed', $el);
									}

									MTF.mouseoverAction(e, $el, skipMTMouseAction)

								})

								// signal item is no longer hovered
								.on('mouseout.wiz-hover', '*', function(e){

									let $el = $(this),
										skipMTMouseAction = MTF.skipMouseAction($el);

									if (!skipMTMouseAction){
										e.stopPropagation();
										//console.log('MT mouseout on', $el);
									} else {
										//console.log('MT mouseout disallowed', $el);
									}

									MTF.mouseoutAction(e, $el, skipMTMouseAction);


									/*e.stopPropagation();
									if (MTF.mouseoutAction(e, $(this))){

									}*/
								});

							// if an element is double-clicked, trigger mouse
						}

						TvrCom.endT(arguments)
					},

					// unbind iframe mouse events
					unbind_wizard_hover: function(){ TvrCom.startT(arguments);

						//console.log('we unbind the wiz hover')

						// no unbind so next targeting is quicker
						//$(document).off('mouseover.wiz-hover mouseout.wiz-hover', '*');

						MTF.stat.html.removeClass('tvr-hh-mode mt_highlight');

						// turn highlight off (maybe disable this
						TvrUi.feature_on(0, 'mt_highlight', {fHTML:1, noSave:1});

						// Ensure no stale disabled message lingers
						//MTsave.update_prog_indicator('minus', false, TvrLang.exiting_builder);

						// Trigger any builder integration responses
						MTint.targetingAdjusted('Disabled');

						// allow drag disabled elements to be draggable again
						MTF.integrate.oxygen.maybeEnableDraggabbleElements();

						// renenable BB if it is currently in use
						MTint.builderUnq.FLBuilder.maybe_reenable_beaver_builder();


						TvrCom.endT(arguments)
					},

					// page builder tracker selectors
					skipMouseAction: function($el, over){

						//return false;

						return (
							// not in hover mode
							!MTF.stat.html.hasClass('tvr-hh-mode') ||

							// (already moused over)
							(over ? ($el.hasClass('tvr-hover-element') ? 'movingOverHoveredEl' : false) : false) ||

							// The content editor is embedded without an iframe and we're
							// clicking outside the blocks
							MTF.isOutsideGutenbergContent($el)	||

							// excluded element
							MTF.isExcludedEl($el)
						);
					},

					isExcludedEl: function($el){
						return MTF.selectorMatches($el[0], MTF.excludeFromSelection.join(','))
							 || (TvrMT.integrate.gutenberg || 1 &&
								$el.closest(MTF.excludeFromSelectionIfClosest.join(',')).length
							)
					},

					// scenario's when we want to allow a normal click as if MT targeting wasn't enabled
					skipClickAction: function($el, e, ctrlOrCmd, isMTElement){

						//return false;

						return (

							isMTElement ||
							ctrlOrCmd ||
							!MTF.interactions ||
							!parseInt(TvrUi.pref.hover_inspect) ||

							// we don't want to trigger this if a theme like Astra triggers click()
							// it triggers on an off-canvas toggle #menu-toggle-close on the window resize event
							!MTF.isRealMouseClick(e) ||

							// The content editor is embedded without an iframe and we're
							// clicking outside the blocks
							MTF.isOutsideGutenbergContent($el)	||

							// an element we should not select with MT
							MTF.isExcludedEl($el)

						);
					},

					hoveredElement: false,
					dragDisabledEls: [],
					mouseoverAction: function(e, $el, skipMTMouseAction){

						//console.log('MT mouseover event fired', $el);

						//var skipMTMouseAction = MTF.skipMouseAction($el, true);

						//console.log('skipMTMouseAction', skipMTMouseAction)

						// run Oxygen mouseover actions if active, and MT isn't in hover mode
						MTF.integrate.oxygen.maybeRunMouseoverAction(e, $el, skipMTMouseAction);

						// bail if element selected, currently highlighted, or quick options, or not in targeting mode
						if ( skipMTMouseAction ){
							//console.log('bail skipMTMouseAction', $this);
							return false;
						}

						// MT hover is active

						// maybe bind shadow DOM element hover - todo
						// MTF.shadow.maybeBindMouseMove($el);

						// disable Oxygen draggable elements if it's disabled
						MTF.integrate.oxygen.maybeDisableDraggableElements($el);

						// signal item is being hovered
						$el.addClass('tvr-hover-element');
						MTF.hoveredElement = $el;


						// if user is holding the alt Key instantly select
						// Good for unclickable elements and quick HTML/CSS inspection
						if (e.altKey && !TvrUi.mouseWheelAltAction){
							//console.log('Instant select', e);

							MTF.select_clicked_or_alt_hovered($el, e);

							/*MTF.select_element($el, {
								e: e,
								scroll: false,
								forceHighlight: 1
							});*/
						}

						// do hover targeting actions
						else {
							//console.log('Hover targeting');
							MTF.hover_targeting_actions($el, e, MTF.placeholderLayer.highlight);
						}

					},

					mouseoutAction: function(e, $this, skipMTMouseAction){

						//console.log('mouseoutAction happened', $this);

						// run Oxygen mouseout actions if active
						MTF.integrate.oxygen.maybeRunMouseoutAction(e, $this);

						if (skipMTMouseAction){
							//console.log('bail mouseoutAction', $this);
							return false;
						}

						/* console.log('checking dragabble', $this.data('add-back-draggable'), $this);

						if ($this.data('add-back-draggable')){
							$this.attr('draggable', 'true');
							console.log('dragabble added back', $this);
						}*/

						// hide hover target by setting style to nothing - it will return when hovering over a non-selected element
						MTF.hide_hover_targeting();

						// remove mousemove event and reset placeholderLayer object
						if (MTF.placeholderLayer.forEl){

							$this.off('mousemove.tvr');

							MTF.placeholderLayer = {
								highlight: 'direct',
								forEl: null,
								coordinates: {}
							}

							MTF.stat.placeholderLayer.empty(); // was .html('')
						}

						// remove any shadow DOM element binding - todo
						//MTF.shadow.maybeUnbindMouseMove($this);

						$this.removeClass('tvr-hover-element');

						MTF.hoveredElement = false;

					},

					select_clicked_or_alt_hovered: function($el, e){

						var $MTPseudo, pseudoSelected

						if ($el){

							var highlight = MTF.check_highlight_pseudo_or_direct($el, e);

							if (highlight !== 'direct'){
								pseudoSelected = highlight;
								$MTPseudo = MTF.placeholderLayer.$MTPseudo;
							}

							/*var elData = $el.data();
					if (elData.ismtpseudo){
						$MTPseudo = $el;
						$el = MTF.placeholderLayer.forEl;
						pseudoSelected = elData.pseudotype.replace('::', '');
					}*/

						}

						MTF.select_element($el, {
							e: e,
							scroll: false,
							forceHighlight: 1,
							$MTPseudo: $MTPseudo,
							pseudoSelected: pseudoSelected,
							manualSelect: 1
						});

					},

					// when coming up with a CSS selector for temporarily hiding pseudo elements,
					// we just need a quick selector - anything that is unique, which we can generated on hover performantly
					fastUniqueCSSSelector: function(el){

						var path = [],
							parent;

						while (parent = el.parentNode) {
							path.unshift(el.tagName + ':nth-child(' + ([].indexOf.call(parent.children, el) + 1) + ')');
							el = parent;
						}

						return ('' + path.join(' > ')).toLowerCase();
					},

					// todo we may have to set pointer events to none and use clientX and clientY mouse coordinates
					// to display hover overlay and select the pseudo element on click
					add_clickable_pseudo_placeholders: function($el, e, nonStaticBodyAdjust, cssSelector){

						var el = $el[0],
							highlight = 'direct',
							pseudos = ['before', 'after'],
							placeHolderEls = '',
							coordinates = {},
							allZindexes = {},
							directELCSS = MTF.getCSS(el, ['z-index']);

						cssSelector = cssSelector || MTF.fastUniqueCSSSelector(el);

						for (var j = 0; j < pseudos.length; j++) {

							var pseudo = pseudos[j],
								pseudoEl = '::'+pseudo,
								propsList = MTF.get_overlay_css_props(pseudoEl),
								itemCSS = MTF.getCSS(el, propsList, pseudoEl),
								transform = itemCSS.transform,
								pseudoCssSelector = cssSelector+pseudoEl,
								elHasPseudo = itemCSS.content !== 'none',
								posRect = elHasPseudo
									? MTF.get_positioning_rectangle(
										$el, nonStaticBodyAdjust, pseudoEl, itemCSS,
										MTF.overlayCSSProps, pseudoCssSelector, true
									)
									: false,

								pseudoZIndex = itemCSS['z-index'],
								zItems = { direct: directELCSS['z-index'] };
							zItems[pseudo] = itemCSS['z-index'];

							var	zIndexes = MTF.resolve_numeric_pseudo_zIndexes(zItems),
								elHasVisiblePseudo = elHasPseudo

									// the element has both width and height
									&& (itemCSS.width === 'auto' || parseInt(itemCSS.width) > 0)
									&& (itemCSS.height === 'auto' || parseInt(itemCSS.height) > 0);

							// the pseudo displays over the element,
							/*&& MTF.inFrontOrOutOfBounds(
								posRect.boundingClientRect.pseudoIsInFrontOfEl,
								posRect.boundingClientRect.withTransform,
								$el,
								e
							)*/

							/*(posRect.boundingClientRect.pseudoIsInFrontOfEl

								// or only the pseudo is being hovered
								|| (
									!TvrCom.mouseIsOverElement($el, e) &&
									TvrCom.mouseIsOverElement(false, e, posRect.boundingClientRect.withTransform)
								)
							)*/



							//console.log('zIndexes as numbers', zIndexes);

							// we only need to do positioning analysis on visible pseudo elements,
							// so this should ignore clear fixes
							if (elHasVisiblePseudo) {

								//console.log('elHasPseudo that is visible', pseudoEl, itemCSS, el);

								var containerStyle = MTF.get_container_style(posRect, pseudoEl, transform, itemCSS.display);

								//console.log('hover debug', pseudoCssSelector, posRect, transform, containerStyle);

								placeHolderEls+= '<div class="mt-pseudo-placeholder mt-'+pseudo+'-placeholder" style="'+containerStyle+'" ' +
									'data-ismtpseudo="1" data-pseudotype="'+pseudoEl+'"></div>';

								coordinates[pseudo] = posRect.boundingClientRect.withTransform;
								allZindexes[pseudo] = pseudoZIndex;

							}

							else {
								//console.log('elHasPseudo that is hidden', directELCSS, pseudoZIndex, pseudoZIndex === 'auto', itemCSS, el);
							}
						}

						// store forEl and coordinates on global object
						MTF.placeholderLayer = {
							forEl: (placeHolderEls ? $el : null),
							coordinates: coordinates,
							zIndexes: allZindexes,
							directELCSS: directELCSS
						}

						// extra functionality if there are pseudos
						if (placeHolderEls){

							// clear / replace any existing placeholders
							//console.log('Pseudo placeholders to add', placeHolderEls)
							MTF.stat.placeholderLayer.html(placeHolderEls);
							//MTF.stat.placeholderLayer.data('forEl', (placeHolderEls ? $el : null));

							highlight = MTF.check_highlight_pseudo_or_direct($el, e);

							// temporarily add mousemove event so we can display the pseudo overlays when the coordinates match up
							$el.on('mousemove.tvr', function(e){

								var newElToHighlight = MTF.check_highlight_pseudo_or_direct($el, e);

								//console.log('newElToHighlight', newElToHighlight, MTF.placeholderLayer.highlight)

								if (newElToHighlight !== MTF.placeholderLayer.highlight){
									MTF.placeholderLayer.highlight = newElToHighlight;
									MTF.update_highlight_pseudo_or_direct(newElToHighlight, e);
								}

							});
						}

						// cache highlight element for later comparison
						MTF.placeholderLayer.highlight = highlight;

						return highlight;


					},

					// switch highlighting to or from a pseudo element
					update_highlight_pseudo_or_direct: function(highlight, e){

						var $el = MTF.placeholderLayer.forEl;

						MTF.placeholderLayer.$MTPseudo = undefined;

						if (highlight !== 'direct'){
							$el = MTF.stat.placeholderLayer.find('.mt-'+highlight+'-placeholder');
							MTF.placeholderLayer.$MTPseudo = $el;
						}

						//console.log('we need to switch highlight', highlight, $el);

						MTF.hover_targeting_actions($el, e, highlight);
					},

					resolve_numeric_pseudo_zIndexes: function(items){

						var keys = Object.keys(items),
							result = {};

						for (var i = 0; i < keys.length; i++){

							var key = keys[i],
								zIndex = items[key];

							result[key] = zIndex && zIndex !== 'auto'
								? parseInt(zIndex)
								: 0;
						}

						return result;

					},

					check_highlight_pseudo_or_direct: function($el, e){

						var highlight = 'direct',
							p = MTF.placeholderLayer,
							isOver = {
								before: false,
								after: false,
								any: 0
							},
							pseudos = Object.keys(isOver);

						// we don't need 'any'
						pseudos.pop();

						//console.log('the p', p)

						for (var j = 0; j < pseudos.length; j++) {

							var pseudo = pseudos[j],
								otherPseudo = pseudo === 'before' ? 'after' : 'before',
								co = p.coordinates[pseudo],
								otherPseudoIsInfrontOfEl = TvrCom.checkObject(p.coordinates, [otherPseudo, 'pseudoIsInFrontOfEl']);

							//console.log('otherPseudo', co, otherPseudo, otherPseudoIsInfrontOfEl,  p.coordinates[otherPseudo])

							if (co){
								/*console.log('logic', {
									"TvrCom.mouseIsOverElement(false, e, co)": TvrCom.mouseIsOverElement(false, e, co),
									"co.pseudoIsInFrontOfEl": co.pseudoIsInFrontOfEl,
									"!TvrCom.mouseIsOverElement($el, e)": !TvrCom.mouseIsOverElement($el, e),
									"otherPseudoIsInfrontOfEl": otherPseudoIsInfrontOfEl
								})*/

								TvrCom.mouseIsOverElement(false, e, co)
							}

							if (co
								&& TvrCom.mouseIsOverElement(false, e, co)
								&& (
									// the pseudo has a higher stacking order then the direct el or the other pseudo
									co.pseudoIsInFrontOfEl

									// or we are out of the direct el bounds (due to positioning or translate)
									|| !TvrCom.mouseIsOverElement($el, e)

									// or there is ANOTHER pseudo that is in front of the el and this pseudo,
									// and overlaps this pseudo at some point, causing pseudoIsFrontOfEl to be false
									// but we are not hovering over the other pseudo
									|| (
										otherPseudoIsInfrontOfEl
										//&& !TvrCom.mouseIsOverElement(false, e, p.coordinates[otherPseudo])
									)

								)
							){
								isOver[pseudo] = pseudo
								isOver.any++;
								//console.log('the mouse moved over pseudo coordinates', pseudo, MTF.placeholderLayer.coordinates);
							}
						}

						// it's over a pseudo
						if (isOver.any){

							var zIndexes = MTF.resolve_numeric_pseudo_zIndexes({
									direct: p.directELCSS['z-index'],
									before: p.zIndexes.before,
									after: p.zIndexes.after
								}),
								visiblePseudo;

							// if the user moused over just one pseudo element, set that
							if (isOver.any === 1){
								visiblePseudo = isOver.after || isOver.before;
							}

							// if there is overlap, compare z-indexes
							else if (isOver.any === 2){
								visiblePseudo = zIndexes.after >= zIndexes.before
									? 'after'
									: 'before';
							}

							highlight = visiblePseudo;

							// check if the highest zIndex/visible pseudo is in front of the direct el
							/*if (zIndexes[visiblePseudo] >= zIndexes.direct){
						highlight = visiblePseudo;
					}*/

						}

						//MTF.stat.placeholderLayer.attr('data-highlight', highlight);

						//console.log('isOver', highlight, isOver, p.coordinates);

						return highlight;

					},

					blocksContainerClass: function(){
						let B = TvrMT.integrate.gutenberg;
						return B && B.editorHasBlocks
							? 'editor-styles-wrapper'
							: 'is-root-container';
					},
					isOutsideGutenbergContent: function($el){
						//return false;
						let B = TvrMT.integrate.gutenberg;
						return (B && B.editorHasBlocks && !$el.closest('.'+MTF.blocksContainerClass()).length);
					},

					// minimal functionality that doesn't change the triggerEl
					// Just highlight in correct color and show formatted breadcrumb
					hover_targeting_actions: function($el, e, highlight){ TvrCom.startT(arguments);

						// bail if invalid or editing Gutenberg block and we're outside the editor
						if (!$el || MTF.isOutsideGutenbergContent($el)){
							return;
						}

						var $hoverOverlay = MTF.stat.hoverOverlay,
							hoverOverlay = $hoverOverlay[0],
							nonStaticBodyAdjust = MTF.nonStaticBodyAdjust(),
							elData = $el.data(),
							$positioningEl = $el,
							pseudoEl = null,
							pseudo = undefined,
							isMTPseudo = elData.ismtpseudo;

						//console.log('hover_targeting_actions', elData, isMTPseudo)


						// if we are hovering over a pseudo placeholder, no further action is necessary
						if (isMTPseudo){
							pseudoEl = elData.pseudotype;
							pseudo = pseudoEl.replace('::', '');
							$positioningEl = $el;
							$el = MTF.placeholderLayer.forEl;
							//console.log('we have a placeholder el', pseudoEl, $el, $positioningEl);
						}

						var mSels = MTF.get_matching_selectors($el, TvrUi.get_all_selector_code(true, true), pseudo),
							cssSelector = false,
							addClasses = '',
							removeClasses = '';

						// signal if we are targeting the element already
						if (mSels.length){

							cssSelector = mSels[0].code;
							addClasses+= 'mt-sels-target';

							let section_slug = TvrUi.section_slug(mSels[0].id);

							if (TvrUi.is_dis(TvrUi.stat.body.find('#strk-'+section_slug)) || MTfolder.folderNotLoading(section_slug)){
								addClasses+= ' mt-disabled-folder';
							} else {
								removeClasses+= ' mt-disabled-folder';
							}

							//console.log('MTF.dom.existingSelID', mSels[0], section_slug, MTfolder.folderNotLoading(section_slug));
						} else {
							removeClasses+= ' mt-sels-target mt-disabled-folder';
						}

						// update all classes in one go
						if (addClasses){
							$hoverOverlay.addClass(addClasses);
						} else {
							$hoverOverlay.removeClass(removeClasses);
						}

						// we are hovering over a normal element
						if (!isMTPseudo){

							// pseudo elements are used by builders a lot for overlays, which we don't want MT to select
							// E.g. Gutenberg / FSE. An alternative might be to only exclude if in builder and
							// pointer-events are set to none
							if (!MTint.active_builders.length){

								// add hoverable and clickable pseudo element placeholder divs
								var newElToHighlight = MTF.add_clickable_pseudo_placeholders($el, e, nonStaticBodyAdjust, cssSelector);

								//console.log('We update highlight and bail', newElToHighlight)

								// re-run this function on the pseudo placeholder if relevant
								if (newElToHighlight !== highlight) {

									//console.log('We update highlight and bail')

									MTF.update_highlight_pseudo_or_direct(newElToHighlight, e);

									// exit to prevent direct el highlighting from overwriting pseudo
									return false;
								}
							} else {
								//console.log('Bail on cickable pseudo as we are inside a builder');
							}

						}

						// getting the pos rectangle for a regular element is
						var	posRect = MTF.get_adjusted_rect($positioningEl[0], nonStaticBodyAdjust),
							containerStyle = MTF.get_container_style(posRect),
							overlay = {
								containerOffset: posRect.offset,
								containerStyle: containerStyle,
								posRect: posRect
							};

						//console.log('hover overlay', $.extend(true, {}, overlay));

						// align the overlay container over the hovered element
						hoverOverlay.style.cssText = containerStyle;

						// prevent horizontal scrollbars from name bleeding out of document area
						MTF.prevent_overlay_creating_scrollbars($hoverOverlay, overlay, 'hover');

						// signal if meta should display below
						MTF.toggle_meta_below_class($hoverOverlay, overlay.posMetaBottom);

						// update the breadcrumb label

						// get the base label for the element
						var label = MTF.get_breadcrumb_data(
							$el, MTF.relevantAtts(), true, pseudoEl, (MTF.dom ? MTF.dom.selectorsString : null), {}
						).formattedBCLabel;

						// update the label
						$hoverOverlay.find('.mt-breadcrumb-label').html(label);

						//console.log('setting the hover overlay', label, $el)


						TvrCom.endT(arguments);
					},

					toggle_meta_below_class: function($el, below){
						if (below){
							$el.addClass('mt-meta-below');
						} else {
							$el.removeClass('mt-meta-below');
						}
					},

					hide_hover_targeting: function(){
						let hoverOverlay = MTF.stat.hoverOverlay;
						if (hoverOverlay){
							hoverOverlay[0].style.cssText = '';
						}
					},

					// remove the trigger el class from previous trigger el
					remove_trigger_previous_el_class: function(){

						for (var i = MTF.triggerElCache.length - 1; i >= 0; i--) {

							var $el = MTF.triggerElCache[i];

							$el.removeClass('tvr-trigger-el');

							MTF.triggerElCache.splice(i, 1);

						}
					},

					maybe_refresh_front_N_index: function(forceIt){ TvrCom.startT(arguments);

						// Update html at this wizard launch stage (and use background editor for line number scrolling)
						if (TvrUi.domChanged.updateFrontIndexes || forceIt){

							MTF.N = document.querySelectorAll("*"); // non-live, which we want

							//MTF.N = document.getElementsByTagName('*');
							//console.log('refresh MTF.N index', MTF.N); // , MTF.N
							TvrUi.domChanged.updateFrontIndexes = false;

							MTF.hasPseudo = MTF.generate_has_pseudo_map(MTF.N);

						}

						TvrCom.endT(arguments, 0);
					},

					async supportsES6DynamicImport(url) {
						try {
							// Attempt to import the module dynamically
							await import(url);
							return { success: 1 }; // If successful, it's an ES6 module
						} catch (error) {
							console.warn("Not an ES6 module:", error, url);
							return { error };
						}
					},

					getRelevantComputedCSS: function(el, pseudo = null) {

						const computed = window.getComputedStyle(el, pseudo);

						// Define CSS properties with default values to filter out, or null to always include
						const properties = {
							"display": null,
							"width": null,
							"height": null,
							"font-size": null,
							"font-family": null,
							"text-align": null,
							"color": null,
							"background": null,
							"position": null,
							"z-index": null,
							"box-sizing": null,

							"border": ":has(none)",
							"margin": "0px",
							"padding": "0px",
							"transform": "none",
							"transition": "all",
							"animation": "none 0s ease 0s 1 normal none running",
							"clip-path": "none"
						};

						// We should request the content property for pseudo elements
						if (pseudo){
							properties.content = null;
						}

						const result = {};

						// Determine layout context
						const display = computed.getPropertyValue("display");
						const isGrid = display.includes("grid");
						const isFlex = display.includes("flex");
						const isPositioned = computed.getPropertyValue("position") !== "static";

						// Add conditional layout props
						if (isGrid) {
							Object.assign(properties, {
								"grid": null, "place-items": null, "place-content": null, "gap": null
							});
						}
						if (isFlex) {
							Object.assign(properties, {
								"flex-flow": null, "gap": null,
								"align-items": null, "align-content": null, "justify-content": null
							});
						}
						if (isPositioned) {
							Object.assign(properties, {
								"top": null, "right": null, "bottom": null, "left": null, "transform": null
							});
						}

						// If not positioned/flex/grid, z-index is irrelevant
						if (!isFlex && !isGrid && !isPositioned) {
							delete properties["z-index"];
						}

						// Add parent context styles (but only for actual elements, not pseudo-elements)
						if (!pseudo) {
							const parent = el.parentElement;
							if (parent) {
								const parentDisplay = window.getComputedStyle(parent).getPropertyValue("display");
								if (parentDisplay.includes("grid")) {
									Object.assign(properties, {
										"order": null, "grid-area": null, "place-self": null
									});
								}
								if (parentDisplay.includes("flex")) {
									Object.assign(properties, {
										"flex": null, "order": null, "align-self": null
									});
								}
							}
						}

						// Collect and filter computed styles
						for (const [prop, defaultVal] of Object.entries(properties)) {
							const val = computed.getPropertyValue(prop);
							const hasMatch = typeof defaultVal === "string" && defaultVal.match(/:has\((.+?)\)/);

							const keep = defaultVal === null || // Always include if explicitly set to null
								(hasMatch && !val.includes(hasMatch[1])) || // Custom rule
								(!hasMatch && val !== defaultVal); // Standard match

							if (keep) {
								result[prop] = val;
							}
						}

						return result;
					},


					generate_has_pseudo_map: function(N){  TvrCom.startT(arguments);

						var len = N.length,
							hasPseudo = {},
							elsChecked = 0,
							pseudos = ['after', 'before'],
							maybeInsideAdminBar = false,
							voidElements = {
								area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1,
								link: 1, meta: 1, source: 1, track: 1, wbr: 1
							},
							noPseudo = {
								html: 1,
								head: 1,
								title: 1,
								meta: 1,
								link: 1,
								script: 1,
								style: 1,
								path: 1,
								select: 1,
								option: 1,

								// svg inner (still quicker than using isInside I believe)
								defs: 1,
								filter: 1,
								fecolormatrix: 1,
								fecomponenttransfer: 1,
								fefuncr: 1,
								fefuncg: 1,
								fefuncb: 1,
								fefunca: 1,
								fecomposite: 1
							},
							breakOnId = {
								'query-monitor-main' : 1,
								'mt-stuff-ignore': 1
							}

						//console.log('N', N, N.length);

						for (var i = 0; i < len; i++) {

							var el = N[i],
								tagName = el.tagName.toLowerCase(),
								elID = el.id;

							// if we arrive at the adminbar, cache element and continue,
							// and skip all els until no longer inside
							if (elID === 'wpadminbar'){
								maybeInsideAdminBar = el;
								continue;
							} if (maybeInsideAdminBar){

								TvrCom.startT('checkElIsInside');
								var isInside = maybeInsideAdminBar.contains(el);
								TvrCom.endT('checkElIsInside');

								if (maybeInsideAdminBar.contains(el)){
									//console.log('we skip el inside admin bar', el)
									continue;
								} else {
									maybeInsideAdminBar = false;
									//console.log('We have el outside admin bar, so stop checking', el);
								}
							}


							if (breakOnId[elID]){
								//console.log('We break on footer meta elements', el.id);
								break;
							}

							if (!voidElements[tagName] && !noPseudo[tagName]){

								for (var j = 0; j < pseudos.length; j++) {

									//TvrCom.startT('getAndupdatePseudoValue');

									//TvrCom.startT('getPseudoValue', tagName);

									var pseudoEl = pseudos[j],
										elHasPseudo = window
											.getComputedStyle(el, '::' + pseudoEl)
											.getPropertyValue('content') !== 'none';

									//TvrCom.endT('getPseudoValue');

									if (elHasPseudo) {
										//TvrCom.startT('updatePseudoValue');
										TvrCom.updateObject(hasPseudo, [i, pseudoEl], 1);
										//TvrCom.endT('updatePseudoValue');
									}



									//TvrCom.endT('getAndupdatePseudoValue');
								}

								elsChecked++;
								//console.log('We check this el for pseudo', tagName)
							}
						}

						TvrCom.endT(arguments);

						//console.log('Els checked for pseudo element', elsChecked);

						return hasPseudo;
					},



					// when the user hovers over an element, run these actions after 50ms pause
					/*quick_targeting_actions: function(config){ TvrCom.startT(arguments);

				// bail if they moused away from the frontend without selecting something
				/!*if (!TvrCom.isDomEl(MTF.triggerEl)){
					console.log('bailing quick_targeting_actions before updating highlight');
					return false;
				}*!/

				// get computed css into global var and refresh the wizard computed css
				config.onlyQuick = true;

				//TvrUi.maybeUpdateInspectorPanels(config);

				// refresh N index of every dom element (if dom change was logged) so MT wizard works well with dynamic page builders
				// note we're just showing the body now so MT remains performant even with 5000+ selectors
				MTF.maybe_refresh_front_N_index();

				// update the index of the trigger element (for use with ACE HTML inspector)
				MTF.triggerElIndex = TvrCom.isDomEl(MTF.triggerEl)
					? String( Array.prototype.indexOf.call( MTF.N, MTF.triggerEl[0]) )
					: 0;

				console.log('config for running', MTF.triggerElIndex, config);

				// we check existing even we're not updating code suggestions, if the user is customising the code and moved onto a new el
				if (!config.doNotUpdateSelectorSuggestions || config.suggestionCustomisedForNewEl){
					console.log('update existing_selector_options', config);
					MTF.existing_selector_options(MTF.triggerEl, config);
				}

				// search the dom
				if (!config.doNotUpdateDomSearch){
					console.log('update dom search', config);
					MTF.search_parents_and_descendents(MTF.triggerEl);
				}

				if (!config.doNotUpdateSelectorSuggestions){

					console.log('update build_selector_suggestions', config);

					// build the selector suggestions, also uses N index when updating MTF.dom
					MTF.build_selector_suggestions(config);

					// update the sels target classes
					/!*var $els = MTF.stat.frontendControls.add(TvrUi.stat.tvr);
					if (MTF.isUsingExistingSel()){
						$els.addClass('mt-sels-target');
					} else {
						$els.removeClass('mt-sels-target');
					}

					// we need different styling if sels exist (so the radios show)
					// even if the user has opted to create an additional selector
					//console.log('MTF.dom.mSelsCount', MTF.dom.mSelsCount, config, MTF.dom)
					if (MTF.dom.mSelsCount){
						$els.addClass('mt-sels-target-at-all');
					} else {
						$els.removeClass('mt-sels-target-at-all');
					}*!/
				}


				console.log('instant_targeting_actions', config, MTF.triggerEl, TvrUi.curSelCSS, TvrUi.intelli_css)

				// add the overlays
				MTF.reposition_overlays({

					// when selecting the current selector, pass reg otherwise flag different context
					con: config.selectCurrentSelector ? 'reg' : 'target-new',
					scroll: config.scroll,

					// only pass trigger el if single item is clicked without shift for joining selectors
					/!*$sel_elements: (config.selectCurrentSelector || config.shiftKey)
						? undefined
						: MTF.triggerEl,
	*!/
					// for shift joined selectors, we need to use the CSS
					css: TvrUi.intelli_css // config.shiftKey ? TvrUi.intelli_css : undefined
				});




				// update the breadcrumbs
				// todo don't update when using actual breadcrumbs
				//  - update active manually when sibling changes
				// - switch which is active when using parent and child
				//if (!config.dontReloadBreadcrumbs){
					//console.log('go ahead and update', config)
					TvrUi.update_breadcrumbs_and_nested_tabs(config);
				//}

				// update the parent/sibling/child dom nav arrows
				TvrUi.update_dom_arrows(config);

				// resume existing selector or create draft selector (unless the selection was triggered by selector navigation)
				if (!config.selectCurrentSelector){
					TvrUi.resume_existing_or_set_draft_selector(MTF.triggerEl, MTF.dom, config);
				}

				TvrCom.endT(arguments)
			},*/

					// run these actions when an el is clicked, or after a longer delay
					/*deferred_targeting_actions: function(config){ TvrCom.startT(arguments);

				// bail if they moused away from the frontend without selecting something
				if (!TvrCom.isDomEl(MTF.triggerEl)){
					return false;
				}

				//console.log('running deferred targeting actions', config)

				// update ACE HTML inspector and actual CSS (if panel is in view)
				config.onlyQuick = false;
				config.onlyDeferred = true;
				config.forceHTMLUpdate = true;
				config.exclActual = true;

				TvrUi.maybeUpdateInspectorPanels(config);

				TvrCom.endT(arguments)

			},*/



					/* prevent default single-click behaviour unless a 2nd click doesn't happen within 700ms */
					singleClick: function($clicked, e, special){ TvrCom.startT(arguments);

						// page builders prevent link follow, so don't trigger links via JS
						if (MTint.anyBuilderIsActive()){
							return false;
						}

						if (special){
							e.preventDefault();
						}

						// never follow:
						if (special && special.tagName == 'a') {

							var url = special.el.attr("href");

							//console.log('the url clicked and site url', url, TvrUi.siteUrl.replace(/https?:\/\//, ''));

							// open links to images, and other sites in new window
							if (url && (url.match(/\.(gif|jpe?g|png|svg)$/i) || TvrCom.isExternalUrl(url))) {
								//console.log('open link in new tab', url, TvrUi.siteUrl, TvrUi.siteUrl.replace(/https?:\/\//, ''))
								window.open(url, "");
								return false;
							}

							// prevent links to Microthemer (MT inside MT)
							// note, currently allowing access to admin area, which will be skninable in future.
							if (url && url.indexOf(TvrUi.uiUrl) > -1){
								MTsave.update_full_logs({
									'short': TvrLang.navigate_mt,
									'long': '<p>'+ TvrLang.navigate_mt_long +'</p>',
									'type' : 'info'
								});
								TvrCom.endT(arguments)
								return false;
							}
						}

						// if link/submit
						if (special){

							// do follow link (unless it's a page anchor, or href with no value)
							if (special.tagName == 'a' && url && url.charAt(0) != '#') {

								var isOxygenLoadLink = TvrCom.isDomEl(
									$clicked.closest('#wp-admin-bar-oxygen_admin_bar_menu-default')
								);

								// todo check with other builders too
								if (isOxygenLoadLink){
									//console.log('Signal builder is loading');
									TvrUi.loading_builder = true;
								}

								// quick fix for Divi which break out of iframe to send parent window to Divi from MT
								if (url.indexOf('et_fb=1') > -1){
									MTWindow.location = url;
								}

								else {
									TvrUi.maybeFilterNewPreviewUrl(url);
									//window.location = url;
								}

							}

							// do form submit
							else {
								var $form = $clicked.closest('form');
								if (TvrCom.isDomEl($form)) {
									$form.trigger('submit');
								}
							}


						}

						TvrCom.endT(arguments)
					},
					integrate: {
						common: {
							// we observe the body and child elements by default, but not the head as otherwise MT styles would
							maybeWatchBuilderHeadNodes: function(){



							}
						},
						oxygen: {
							// Oxygen mouseover and mouseout events stop propagation, and so for now we are removing Oxygen events
							// and cloning the functionality inside MT code. This solution was partly chosen because Oxygen cannot
							// include MT specific code quickly, and because previous integration attempt didn't work because
							// oxygen mouseover/out is not attached to all elements, just .ct-component
							/*
					* In future, get oxygen to namespace their mouseover/out events and include the action code in a function
					* MT can reference
					* */
							componentMouseEventsRemoved: false,
							maybeRemoveComponentMouseEvents: function(){

								//return false;

								//console.log('We get here', TvrMT)

								if (TvrMT.integrate.oxygen && !this.componentMouseEventsRemoved){

									//.log('removeComponentMouseEvents before', $("#ct-builder").data('events'))

									$("#ct-builder")
										.off("mouseover", ".ct-component:not(.ct-contains-oxy)")
										.off("mouseout", ".ct-component");

									//console.log('removeComponentMouseEvents after', $("#ct-builder").data('events'))

									this.componentMouseEventsRemoved = true;
								}


							},

							maybeDisableDraggableElements: function($el){
								if (TvrMT.integrate.oxygen){

									if ($el.attr('draggable')){

										var draggables = [$el],
											$draggableParent = $el.closest('[draggable="true"]');

										if (TvrCom.isDomEl($draggableParent)){
											draggables.push($draggableParent);
										}

										for (var i = 0; i < draggables.length; i++) {
											draggables[i].attr('draggable', 'false');
											MTF.dragDisabledEls.push(draggables[i]);
											//console.log('draggable removed', draggables[i]);
										}

									}
								}
							},

							maybeEnableDraggabbleElements: function($el){
								if (MTF.dragDisabledEls.length){
									//console.log('draggable elements made OK again', MTF.dragDisabledEls);
									$(MTF.dragDisabledEls).each(function(i){
										$(this).attr('draggable', 'true');
									})
									MTF.dragDisabledEls = [];
								}
							},

							maybeRunMouseoverAction: function(e, $this){

								//return false;

								if (TvrMT.integrate.oxygen
									&& !MTF.stat.html.hasClass('tvr-hh-mode')
									&& $this.hasClass('ct-component')
									&& !$this.hasClass('ct-contains-oxy')){

									//console.log('running oxygen mouseover')

									$('.ct-highlight').removeClass('ct-highlight');

									// in case we are editing the ct_inner content, then no need to hilight the outer template elements
									if( $('body').hasClass('ct_inner')
										&& ( $this.hasClass('ct-inner-content')
											|| $this.closest('.ct-component.ct-inner-content').length < 1 ) ) {
										return;
									}

									if ($this.parent().is('.oxy-header-container')) {
										// highlight header row when hover  left/right/center sections
										$this.parents('.oxy-header-row').addClass('ct-highlight');
									}
									else {
										$this.addClass('ct-highlight');
									}

								}

							},

							maybeRunMouseoutAction: function(e, $this){

								if (TvrMT.integrate.oxygen
									&& !MTF.stat.html.hasClass('tvr-hh-mode')
									&& $this.hasClass('ct-component')){

									//console.log('running oxygen mouseout')

									if ($this.parent().is('.oxy-header-container')) {
										// highlight header row when hover  left/right/center sections
										$this.parents('.oxy-header-row').removeClass('ct-highlight');
									}

									$this.removeClass('ct-highlight');

								}

							}
						}
					}
				};

				// ensure module scripts have good MTF reference
				function update_module_mtf_references(){

					TvrMT.MTF = MTF;
					TvrMT.init.set_vars();
					TvrMT.TvrUi.set_vars();
					TvrMT.TvrCom.set_vars();
					TvrMT.mod.MTace.set_vars();
					TvrMT.mod.MTint.set_vars();
					TvrMT.mod.MTloop.set_vars();
					TvrMT.mod.MTdd.set_vars();
					TvrMT.mod.MTsave.set_vars();
					TvrMT.mod.MTsass.set_vars();
					TvrMT.mod.MTgrid.set_vars();
					TvrMT.mod.MTfolder.set_vars();
					TvrMT.mod.MThtml.set_vars();
					TvrMT.mod.MTai.set_vars();
					TvrMT.mod.MTlayout.set_vars();
					TvrMT.mod.MTwidget.set_vars();

				}

				function isInsideGutenbergPreview(){

					// use cached values in MTblock if it has loaded
					if (window.MTblock && window.MTblock.isPreviewIframe){
						return true;
					}

					// otherwise check the classes
					let doc = document.documentElement,
						body = document.body,
						previewClass = 'block-editor-block-preview__content-iframe';

					if (doc.classList.contains(previewClass) || body.classList.contains(previewClass)){
						return true;
					}

					return false;
				}

				//console.log('after obj literal setup')

				// setup mt vars (wrapped in function so code can be run conditionally)
				function mt_frontend_setup_vars_and_init(){

					//console.log('the frontend loaded')
					//console.trace();
					TvrUi.get_local_window_function('mark_iframe_loaded')();

					// Everything has loaded now, so ensure main objects have good reference to MTF
					update_module_mtf_references();

					// bail if we are on an FSE preview iframe
					if (isInsideGutenbergPreview()){
						return;
					}

					// initialise
					//console.log('Is it a preview?', window.MTblock && window.MTblock.isPreviewIframe, window.MTblock)
					MTF.init_front();

				}

				// check for builder integrations
				MTint.check_integrations(window, MTF);

				// If Gutenberg, ensure that the editor doesn't run init_front
				// otherwise the targeting can sometimes be set to the editor instead of the iframe
				let blockContext = getMTBlockContext();

				//console.log('check if elementor or MTWindowLoadFired')

				// check elementor (which means frontend is nested in an iframe, and load event won't fire)
				if (TvrMT.integrate.elementor || window.MTWindowLoadFired) {

					//console.log('is elementor or load event already fired', window.MTWindowLoadFired)

					// load event will not fire,
					// so accept overlays on images *may* not be quite right for Elementor compat
					if (blockContext.runFrontend){
						mt_frontend_setup_vars_and_init();
					}

				}

				else {

					//console.log('blockContext', blockContext, window.MTblock, window)

					if (blockContext.runFrontend){

						//console.log('run mt_frontend_setup_vars_and_init')

						// make sure images are loaded before calling add_mt_overlay()
						// window.onload = function() not recommended
						// see: https://ckon.wordpress.com/2008/07/25/stop-using-windowonload-in-javascript/
						window.addEventListener
							? window.addEventListener("load", mt_frontend_setup_vars_and_init, false)
							: window.attachEvent && window.attachEvent("onload", mt_frontend_setup_vars_and_init);
					}

					else {
						//console.log('adding function to gutenberg', window)
						MTint.builderUnq.gutenberg.mt_frontend_setup_vars_and_init = mt_frontend_setup_vars_and_init;
					}

				}

			}

			// WP 7.1+ can fire DOM ready in the block editor canvas iframe before its body is added
			function runWhenBodyExists(){
				if (document.body){
					microthemerFrontend(jQuery);
					return;
				}
				const bodyObserver = new MutationObserver(function(){
					if (document.body){
						bodyObserver.disconnect();
						microthemerFrontend(jQuery);
					}
				});
				bodyObserver.observe(document.documentElement, { childList: true });
			}

			// FSE requires loading this functionality dynamically, after the DOM / block editor has loaded
			if (document.readyState === 'complete'){
				//console.log('Run function straight away', window.location.href);
				runWhenBodyExists();
			}

			// Otherwise, we attach the functionality in the usual jQuery way
			else {

				//console.log('Load in the usual way');
				jQuery(document).ready(runWhenBodyExists);
			}

		}


		// load the broadcast channel script when the frontend preferences have been registered in the footer
		jQuery(document).ready(function($){

			if (window.MTDebugServerPerformance) {

				function formatBytes(bytes) {
					if (!bytes) return '0 <span class="amender-unit">B</span>';
					const units = ['B','KB','MB','GB'];
					let i = 0;
					while (bytes >= 1024 && i < units.length - 1) {
						bytes /= 1024;
						i++;
					}
					return bytes.toFixed(2) + ' <span class="amender-unit">' + units[i] + '</span>';
				}

				async function getServerSideTime() {
					const htmlTimingEl    = document.getElementById('server-html-timing');
					const totalTimingEl   = document.getElementById('server-total-timing');
					const htmlMemDeltaEl  = document.getElementById('server-html-mem');
					const htmlMemPeakEl   = document.getElementById('server-html-peak');
					const totalMemDeltaEl = document.getElementById('server-total-mem');
					const totalMemPeakEl  = document.getElementById('server-total-peak');

					if (!htmlTimingEl || parseInt(htmlTimingEl.dataset.zeroMods) || !totalTimingEl) {
						return;
					}

					const url = new URL(window.location.href);
					['no_amends','dyn_amends','debug_amends'].forEach(param => url.searchParams.delete(param));
					url.searchParams.set('time_amends', 1);

					const response = await fetch(url);
					const json = response.ok
						? await response.json()
						: { error: 1 };

					if (json.error) return;

					//console.log('It is JSON', json, {htmlTimingEl, totalTimingEl})

					// --- Time ---
					htmlTimingEl.innerHTML = `${json.server_html_timing.toFixed(2)} <span class="amender-unit">ms</span>`;
					htmlTimingEl.dataset.time = json.server_html_timing;

					const assetTiming = parseFloat(document.getElementById('server-asset-timing').dataset.time);
					const totalTiming = assetTiming + parseFloat(json.server_html_timing);
					totalTimingEl.innerHTML = `<strong>${totalTiming.toFixed(2)} <span class="amender-unit">ms</span></strong>`;

					// --- Memory ---
					/*if (json.server_html_memory) {
						const htmlAvgDelta = json.server_html_memory.avg_delta;
						const htmlMaxPeak  = json.server_html_memory.max_peak;

						htmlMemDeltaEl.innerHTML = formatBytes(htmlAvgDelta);
						htmlMemPeakEl.innerHTML  = formatBytes(htmlMaxPeak);

						const assetMemDelta = parseInt(document.getElementById('server-asset-mem').dataset.bytes || 0, 10);
						const assetMemPeak  = parseInt(document.getElementById('server-asset-peak').dataset.bytes || 0, 10);

						const totalMemDelta = assetMemDelta + htmlAvgDelta;
						const totalMemPeak  = Math.max(assetMemPeak, htmlMaxPeak);

						totalMemDeltaEl.innerHTML = `<strong>${formatBytes(totalMemDelta)}</strong>`;
						totalMemPeakEl.innerHTML  = `<strong>${formatBytes(totalMemPeak)}</strong>`;
					}*/
				}

				getServerSideTime();
			}

			// the frontend is not inside Microthemer, or it is but editing is not enabled as it's the admin area
			if (!MTWindow) { // || (MTF.getMTDynFrontData().responseOnly)

				// helper for dynamically loading a script
				var MTLoadJSFile = function(url, cb){

					var script = document.createElement("script");
					script.src = url;

					if (cb){
						script.onload = function () {
							cb.item.apply(this, (cb.args || []));
						};
					}

					// append and execute script
					document.head.appendChild(script);
				}

				// load broadcast script if that preference has been enabled
				let data = window.MTDynFrontData || (
					window.parent
						? window.parent.MTDynFrontData
						: undefined
				);
				if (data && data.broadcast){
					MTLoadJSFile(data.broadcast, {
						item: function(){
							if (window.MTBroadCast){
								window.MTBroadCast.init(data);
							}
						},
					});
				}

			}

		});

	}



} catch (e) { }

// The Oxygen WooCommerce plugin had a bug where it loaded this script multiple times.
window.MTFrontScriptLoaded = true;










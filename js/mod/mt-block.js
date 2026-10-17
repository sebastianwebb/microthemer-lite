// Gutenberg block editor functions

/*
* Note - this script loads in both the editor UI (main admin page) and the iframe holding the editor content.
* Use conditional logic within this script to assign functionality. There isn't a PHP way to assign files to
* one but not both contexts at the time of writing (Dec 2023). Check back on the docs:
* https://developer.wordpress.org/block-editor/how-to-guides/enqueueing-assets-in-the-editor/
 */


// Gutenberg block preview iframes cause problems by triggering check_integrations and overriding "MTF" reference
// We fix this by flagging previews, which have no name and will be a sibling of the editor-canvas iframe
if (!window.name && window.parent){

	let par = window.parent;

	for (let i = 0; i < par.frames.length; i++) {

		if (par.frames[i].name === 'editor-canvas'){
			window.MTiframeShouldBail = true;
			break;
		}
	}

	/*console.log('mt-block.js file loaded', window.name, par.name, window, par);
	console.log('We should bail', window.MTiframeShouldBail);*/
}

// run code unless exclusions apply
if (!window.MTiframeShouldBail){

	window.MTblock = (function(){

		// some Url params change without any need to re-adjust MT assets
		function filterIgnoreParams(url){
			return url.replace('&canvas=edit', '');
		}

		// references to this object in other window
		let wp,
			MTFblock,
			MTEblock;

		let	MTblock = {

			context: null, // Admin page editor container vs Editor iframe content
			isEditor: null,
			hasBlocks: null,
			blocksContainer: null,
			editorHasBlocks: null, // legacy, when Gutenberg was loaded in the same editor window
			isIframe: null,
			isPreviewIframe: null,
			containerClass: 'is-root-container',
			MTDynFrontData: null,
			DOMContentLoaded: 0, // count when the DOM loads, it's loading twice somehow
			shared: {
				//
				editorPanelsReady: null,
				editor: null,
				// for caching assets or front-data when iframe loading comes after an MT ajax call
				// to get new frontend data or stylesheets
				cache: {
					view: {}
				},
				//MTObservingBlocks: null,
				// warning on the FSE page, it can load 12 iframes, so each one will update this shared value
				// store window and doc for iframe in MTblock.iframe.win/doc instead
				//iframe: null,
			},

			// reference to active observers
			observer: {},

			// There are two ways to approach this - only add class to user-added block
			// or ensure every block loaded on the page gets a unique class.
			// User added means lighter weight, everything means more reliable MT styling
			//classEverything: true,

			uniqueClassPattern: /\bmctr-[0-9a-z]{6}\b/,

			// An event handle class that supports namespacing - not needed right now
			/*EventHandlerClass: class {
				constructor() {
					this.functionMap = {};
				}
				addEventListener(event, func, scope) {
					scope = scope || document;
					this.functionMap[event] = func;
					scope.addEventListener(event.split('.')[0], this.functionMap[event]);
				}
				removeEventListener(event, scope) {
					scope = scope || document;
					scope.removeEventListener(event.split('.')[0], this.functionMap[event]);
					delete this.functionMap[event];
				}
			},*/

			// Set variables to make talking between iframe and editor convenient
			setVars: function(){

				MTblock.MTDynFrontData = window.MTDynFrontData;

				if (MTblock.isIframe){

					// Get parent editor variables
					let editorWindow = window.parent;
					wp = editorWindow.wp;
					MTEblock = editorWindow.MTblock;
					MTblock.shared = MTEblock.shared;

					// iframe vars
					MTFblock = MTblock;
					MTblock.iframe.win = window;
					MTblock.iframe.doc = document;

					// Pass up iframe version of this Object
					MTEblock.signalIframeReady(MTblock);

				}

				// It is the editor container
				else {

					// set what we can, the iframe will set other vars when it's ready
					wp = window.wp;
					MTEblock = MTblock;

					let editorContext = document.getElementById('site-editor')
							? 'fse'
							: 'regular';

					// Set shared data
					MTblock.shared.TvrMT = window.TvrMT;
					MTblock.shared.editor = {
						win: window,
						doc: document,
						userInteraction: false, // not sure if this will work with FSE well

						// todo - there are 4 contexts, see class WP_Block_Editor_Context
						context: editorContext,

					}

					//console.log('Editor shared variables', MTblock.shared.editor)
				}
			},

			ensureTrailingSlash: function (url) {
				return url.endsWith('/') ? url : url + '/';
			},

			// simple get request that returns json and optionally runs a callback - can be adapted if we need post etc
			fetch: function(url, config){

				//console.log('fetch requestOptions', config.requestOptions)

				fetch(url, config.requestOptions)
					.then((response) => response.json())
					.then((data) => {

						MTblock.log('We fetched some data', data, config);

						if (config.cb){
							let args = config.cb.args || [];
							args.unshift(data);

							MTblock.log('Running fetch callback');

							config.cb.item.apply(this, args);
						}
					})
					.catch((error) => {
						console.error('Error:', error);
					});
			},

			// Used by both windows
			/*setEvents: function(){

				MTblock.EventHandler = new MTblock.EventHandlerClass();

				MTblock.EventHandler.addEventListener('click.tvr-gutenberg', function(e){

					MTblock[MTblock.context].userInteractionHappened();

					MTblock.EventHandler.removeEventListener('click.tvr-gutenberg', document);

				}, document);
			},*/

			checkFrontData: function(key, MTDynFrontData){

				MTDynFrontData = MTDynFrontData || MTblock.MTDynFrontData;

				//console.log('checkFrontData', MTDynFrontData, MTblock.MTDynFrontData)

				return MTDynFrontData
					? MTDynFrontData[key]
					: null;
			},

			add_block_classes_all: function(){

				//let TvrMT = MTblock.shared.TvrMT;

				return MTblock.checkFrontData('add_block_classes_all'); // || (TvrMT && TvrMT.integrate.gutenberg);
			},

			/*signalEditorPanelsReady: function(){
				MTblock.shared.editorPanelsReady = true;
				MTblock.log('Editor panels are ready', MTblock);
			},*/

			signalIframeReady: function(iframeObject){
				MTFblock = iframeObject;
				MTblock.log('iframe is ready', MTblock);
			},

			isInsideMT: function(){

				let TvrMT = MTblock.shared.TvrMT;

				if (TvrMT && TvrMT.mod.MTint){
					return TvrMT.mod.MTint.builderUnq.gutenberg
				}

				return false;
			},

			signalBlocksReady: function(win, doc){

				if (!win){
					return;
				}

				MTblock.blocksReady = true;
				MTblock.prevBlocksList = MTblock.getBlockList(true);
				MTblock.log('Blocks are ready', win, doc, MTblock.prevBlocksList);

				let B = MTblock.isInsideMT();

				// enable the styles we disabled on the editor before they were copied over to the iframe
				if (MTblock.shared.editor.selectorForBlockOnlyCSS){
					MTblock.adjustBlockOnlyStyles(
						MTblock.shared.editor.selectorForBlockOnlyCSS , 'enable', doc
					);
				}

				// On FSE, no scripts are loaded inside the content iframe
				// So if we want Gutenberg integration we need to load the dyn data and frontend.js dynamically
				// I think it's OK not to load mt-block.js as the parent window can handle observations
				if (B){

					//let MTDynFrontData = MTblock.MTDynFrontData;

					let MTF = TvrMT.mod.MTF,
						MTint = TvrMT.mod.MTint;
					// ensure element highlighting is set, it won't be if we're on the editor and the block content
					// has been embedded directly, without an iframe
					//console.log('Embedded directly?', B.integrationSkippedOnEditor, MTint.builderUnq.gutenberg.mt_frontend_setup_vars_and_init);


					if (B.integrationSkippedOnEditor){

						// run if the integration was skipped, but we're not on the iframe which will run the integration by itself
						if (MTint.builderUnq.gutenberg.mt_frontend_setup_vars_and_init && !MTblock.isIframe){

							//console.log('We run setup', MTblock.isEditor, MTblock)

							B.editorHasBlocks = true;

							MTint.check_integrations(win, MTF, (win.MTblock && win.MTblock.isEditor));

							MTint.builderUnq.gutenberg.mt_frontend_setup_vars_and_init();

							//console.log('Run mt_frontend_setup_vars_and_init and check_integrations', win, B);

							B.adjustLogicForBlockContent(
								B.mainWindow.MTDynFrontData,
								B.mainWindow,
								B.mainWindow
							);

						} else {
							//console.log('We cannot run mt_frontend_setup_vars_and_init and check_integrations');
						}
					}


					if (MTblock.shared.cache.view.data){

						MTblock.MTDynFrontData = MTblock.shared.cache.view.data;

						MTblock.log('We fetch MTDynFrontData from view cache', MTblock.MTDynFrontData)

						//delete MTblock.shared.cache.view.data;
					}

					if (MTblock.shared.cache.view.pendingMTUpdate){

						let currentBrowserUrl = MTblock.shared.cache.view.pendingMTUpdate;

						MTblock.log('Apply pending MT UI update', MTblock.MTDynFrontData)

						B.updateMTForPageOrContentChange(B, MTblock.MTDynFrontData, currentBrowserUrl, doc, win, true, MTEblock);

						// ensure blocks are still being monitored if the container changes
						MTEblock.editor.maybeResumeObservations(doc);

						delete MTblock.shared.cache.view.pendingMTUpdate;
					}

					if (!win.TvrMT){

						MTblock.log('We need to load MT on frontend dynamically', B)

						B.manualFrontInit(win, doc, MTblock.MTDynFrontData, MTblock);
					}

					else {
						MTblock.log('MT loaded initially, before blocks were initiated', MTblock.MTDynFrontData);
						MTblock.log('MTblock.shared.cache.view.data', MTblock.shared.cache.view.data);

						MTblock.signalBlocksReadyAndMTLoaded(doc);
					}
				}

				else {
					MTblock.log('We are not inside MT');

					if (MTEblock.shared.cache.view.pendingStylesheetReplace){
						MTblock.log('Apply pending stylesheet replace');
						MTblock.replaceStylesheets(doc, MTblock.shared.cache.view.stylesheets);
						MTblock.log('Replace pending stylesheets:');
						MTblock.log(MTblock.shared.cache.view.stylesheets);

						MTblock.editor.maybeResumeObservations(doc);
					}
				}

			},

			signalBlocksReadyAndMTLoaded: function(doc){

				let styles = doc.querySelectorAll('link[href*="\\/micro-themes\\/"], style[id^="microthemer"]');

				MTblock.log('signal Blocks Ready And MT Loaded - remove static MT assets', styles, doc);

				MTblock.log('blocks ready, get template', MTblock.getCurrentTemplate());

				styles.forEach(element => {
					element.remove();
				});

			},

			log: function(){
				let debug = false;
				if (debug){
					console.log.apply(null, arguments);
				}
			},

			uniqueClass: function(){
				return 'mctr-' + MTblock.randomAlphaNumString(6);
			},

			alreadyHasUniqueClass: function(current){

				if (current){
					let match = current.match(MTblock.uniqueClassPattern);
					if (match){
						return match[0];
					}
				}

				return false;
			},

			// adapted from Stackoverflow:
			// https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
			randomAlphaNumString: function(len, numTries){

				numTries = numTries === undefined ? 0 : numTries;

				let randomString = Math.random().toString(36), // e.g. 0.5orlcxuy3ud
					start = 3,
					maxTries = 10,
					truncated = randomString.slice(start, start+len);

				// on rare occasion when string is too short, run function again
				if (truncated.length !== len && numTries <= maxTries){
					return MTblock.randomAlphaNumString(len, (++numTries));
				}

				return truncated;
			},

			// a supported page builder has made style changes and Styles tab should update CSS rules.
			observeTarget: function(el, config){

				config.observerConfig = config.observerConfig || {};

				// set up observer and callback
				var observer = new MutationObserver(function(mutations) {
					mutations.forEach(function(mutationRecord) {
						config.item.apply(this, [el, mutationRecord].concat(config.args || []));
					});
				});

				// watch for change
				observer.observe(el, config.observerConfig);

				// cache for later
				MTblock.observer[config.name] = observer;

			},

			disconnect: function(name){
				if (MTblock.observer[name]){
					MTblock.observer[name].disconnect();
					MTblock.log('Disconnected the observer', name);
				}
			},

			checkNodes: function(config, nodes){

				let targetNode;

				if (nodes.length){

					//MTblock.log('The mutation', nodes);

					for (let i = 0; i < nodes.length; i++) {

						let node = nodes[0],
							classList = node.classList;

						//MTblock.log('The node', node);

						if (
							node.nodeType !== 3 && // node isn't text
							(

								// iFrame added
								(
									config.context === 'iframeAdded' &&
									node.tagName &&
									node.tagName.toLowerCase() === 'iframe'
								) ||

								// FSE loaderEnded
								(
									config.context === 'loaderEnded' &&
									classList &&
									(
										classList.contains('edit-site-canvas-loader')
									)
								) ||

								// <head> assets copied over to the iframe
								(
									config.context === 'stylesAdded' &&
									node.id === 'mt-placeholder-inline-css'
								) ||


								// Blocks container added
								(
									config.context === 'blockRootAdded' &&
									classList &&
									(
										classList.contains(MTblock.containerClass) ||
										classList.contains('edit-post-layout')
									)
								) ||

								// Block added or removed
								(
									(config.context === 'blockAdded' || config.context === 'blockRemoved') &&
									classList &&
									classList.contains('wp-block')
								)
							)
						){
							targetNode = node;
							break;
						}
					}
				}

				return targetNode;

			},

			observeDomChange: function(selector, doc, config){

				doc = doc || document;
				config = config || {};

				let el = config.el || doc.querySelector(selector),
					observerConfig = {};

				if (config.subtree){
					observerConfig.subtree = config.subtree;
				} if (config.childList){
					observerConfig.childList = config.childList;
				} if (config.attributes){
					observerConfig.attributes = config.attributes;
				} if (config.attributeFilter){
					observerConfig.attributeFilter = config.attributeFilter;
				} if (config.attributeOldValue){
					observerConfig.attributeOldValue = config.attributeOldValue;
				}

				if (el){

					if (el.dataset.mtblockobserver !== config.name){

						el.dataset.mtblockobserver = config.name;

						MTblock.log('We set up observeDomChange on', el, config.name)

						MTblock.observeTarget(el, {
							name: config.name,
							observerConfig: observerConfig,
							item: function(el, mutationRecord){

								let checkNodeType = config.checkNodeType || 'addedNodes',
									targetNode = MTblock.checkNodes(config, mutationRecord[checkNodeType]);

								//console.log('mutationRecord', mutationRecord)

								if (targetNode){

									//MTblock.log('Target node found', targetNode, config)

									// run any callbacks
									if (config.cb){

										let args = (config.cb.args || []);

										// sometimes we want to run a function without prepending parameters
										// e.g. when running blocksReadyMaybeObserve()
										if (!config.doNotPrependMutation){
											args.unshift(targetNode, mutationRecord);
										}

										config.cb.item.apply(this, args);
									}

								}
							}
						})


					} else {
						MTblock.log('We are already observing for the change on this el', config, el);
					}

				}

				else {
					MTblock.log('We have no el to observe', config)
				}

			},

			// WordPress doesn't have a filter for adding a Gutenberg block, all filters run too much and might cause
			// performance issues, so I'm opting to watch the block container for new elements with wp-block class
			// and then auto-set the 'Additional classes' field programmatically
			blocksReadyMaybeObserve: function(doc){

				//console.log('The doc received', doc)

				doc = doc || document;

				let win = doc.defaultView;

				MTblock.log('blocksReadyMaybeObserve objects', win, doc);

				MTblock.doBlockChecks(doc);

				// if the block editor has loaded in the current document
				if (MTblock.blocksContainer){

					MTblock.signalBlocksReady(win, doc);

					// Disconnect any observer checking for the iframe or container to load
					//MTblock.disconnect('iframeAdded'); // no, this can happen again when switching view
					MTblock.disconnect('blocksContainer');

					// Update existing and new blocks with classes if enabled
					MTblock.startObservingBlocks(win, doc);

				}

				// the block editor may be about to load in an iframe, watch for this to load
				else {
					MTblock.log('the block editor is NOT ready');
				}

			},

			doBlockChecks: function(doc){
				let containerSelection = doc.getElementsByClassName(MTblock.containerClass)
				MTblock.blocksContainer = containerSelection ? containerSelection[0] : null;
				MTblock.hasBlocks = !!MTblock.blocksContainer;
				MTblock.editorHasBlocks = MTblock.hasBlocks && MTblock.isEditor;
				MTblock.iframeHasBlocks = MTblock.hasBlocks && MTblock.isIframe;
				MTblock.log('doBlockChecks', containerSelection, MTblock)
			},

			// Check for when the FSE loading element is removed from the DOM
			checkForLoaderEnd: function(){

				let loaderParent = document.querySelector('.edit-site-resizable-frame__inner-content');

				MTblock.log('check For LoaderEnd');

				MTblock.observeDomChange(
					null,
					document,
					{
						el: loaderParent,
						name: 'loaderEnded',
						context: 'loaderEnded',
						checkNodeType: 'removedNodes',
						subtree: true,
						childList: true,
						cb: {
							item: function(loader){

								MTblock.log('loader removed', loader);

								MTblock.disconnect('loaderEnded');

								if (!MTFblock){
									MTblock.blocksReadyMaybeObserve(MTblock.editor.getIframeRefs().doc)
								}
							},
						}
					}
				);

			},

			// Gutenberg may load inside an iframe, so check for that
			checkForIframe: function(){

				let editorContext = MTblock.shared.editor.context;

				MTblock.log('Observe for iframe loading', editorContext)

				MTblock.observeDomChange(
					'#editor, #site-editor', // #editor is for main Gutenberg editor, #site-editor is for FSE
					document, //document.getElementById('editor-canvas').contentWindow.document,
					{
						name: 'iframeAdded',
						context: 'iframeAdded',
						subtree: true,
						childList: true,
						cb: {
							item: function(iframe, mutationRecord){

								MTblock.log('iframe added', editorContext);

								//MTblock.disconnect('iframeAdded'); // no, page changes update this
								MTblock.disconnect('blocksContainer');

								// FSE system takes a while to load, and has an initial blockContainer element
								// that gets replaced, so need to wait for loader to finish
								if (editorContext === 'fse'){
									MTblock.checkForLoaderEnd();
								}

								else {

									iframe.onload = function() {

										MTblock.log('iframe loaded')

										let doc = iframe.contentWindow.document;

										if (!MTFblock){
											MTblock.blocksReadyMaybeObserve(doc)
										} else {
											MTblock.log('Abort parent blocksReadyMaybeObserve as we have MTFblock', MTFblock)

											if (window.TvrMT){
												MTblock.signalBlocksReadyAndMTLoaded(doc);
											}

										}

									};
								}

							},
							args: []
						}
					}
				);

			},

			// observe the root container for new blocks
			checkForBlocksContainer: function(doc){

				MTblock.log('Observe for blocks container')

				MTblock.observeDomChange(
					'#wpbody-content',
					doc,
					{
						name: 'blocksContainer',
						context: 'blockRootAdded',
						subtree: true,
						childList: true,
						doNotPrependMutation: true,
						cb: {
							item: MTblock.blocksReadyMaybeObserve
						}
					}
				);

			},

			startObservingBlocks: function(win, doc){

				//console.trace();

				if (MTblock.blocksContainer){

					// ensure no double binding of block observers
					if (!MTblock.blocksContainer.dataset.mtblockobserver){

						MTblock.blocksContainer.dataset.mtblockobserver = 1;

						MTblock.log('startObservingBlocks', win);

						// If all blocks on the page should have unique ID
						if (MTblock.add_block_classes_all()){

							// Add to any existing blocks that need it
							MTblock.addClassesToExistingBlocks();

						}

						// watch for new blocks
						MTblock.checkForNewBlocks(doc);

						// watch for removed blocks
						MTblock.checkForRemovedBlocks(doc);

					} else {
						MTblock.log('Block checks have already been set up');
					}
				}

			},

			// observe the root container for new blocks
			checkForNewBlocks: function(doc){

				MTblock.observeDomChange(
					'div.'+MTblock.containerClass,
					doc,
					{
						name: 'newBlocks',
						context: 'blockAdded',
						subtree: true,
						childList: true,
						cb: {
							item: MTblock.blockAdded,
							args: []
						}
					}
				);

			},

			checkForRemovedBlocks: function(doc){

				MTblock.observeDomChange(
					'div.'+MTblock.containerClass,
					doc,
					{
						checkNodeType: 'removedNodes',
						name: 'removedBlocks',
						context: 'blockRemoved',
						subtree: true,
						childList: true,
						cb: {
							item: MTblock.blockRemoved,
							args: []
						}
					}
				);

			},

			blockAdded: function(el, mutationRecord){

				// Add unique classes if we are adding them to all blocks
				if (MTblock.add_block_classes_all()){
					MTblock.maybeAddClassToBlock(el, mutationRecord, 'new', true)
				}

				// Check if a synced pattern or navigation has been referenced and maybe
				// live toggle MT folder loading
				MTblock.maybeAdjustMTLoadingForBlockChange('added');

				//console.log('The el block was added', el, mutationRecord)


			},

			blockRemoved: function(el, mutationRecord){
				MTblock.maybeAdjustMTLoadingForBlockChange('removed');
			},

			// get the parameters
			getLiveData: function(blockList, withTemplate){

				if (blockList){

					let data = {
						live_post_content: blockList.refsHtml,
						live_nonce: (window.MTBlockData || {}).liveNonce || '',
					}

					if (withTemplate){
						data.live_template = MTEblock.getCurrentTemplate();
					}

					return data;
				}

				return null;


				/*return blockList
					? {
						//live_post_content: MTblock.getPostContent(blockList.list)
						live_post_content: blockList.refsHtml,
						live_template: MTEblock.getCurrentTemplate()
					} : null*/
			},

			// maybe add or remove CSS that loads for a resuable blocks
			maybeAdjustMTLoadingForBlockChange: function(trigger){

				MTblock.actionAfterTimeout('blocksAddedOrRemoved', 250, {
					item: function(){

						// bail if prevBlocksList has not been initiated, as it means the blocks aren't ready yet
						if (!MTblock.prevBlocksList){
							return;
						}

						let currentBlockList = MTblock.getBlockList(true),
							change = MTblock.checkBlockListChange(MTblock.prevBlocksList, currentBlockList);

						MTblock.log('The change', change)

						// something changed
						if (change.removed.length || change.added.length){

							// update the previous block list for comparison
							MTblock.prevBlocksList = currentBlockList;

							// send live data and do server-side asset loading check
							MTblock.editor.remoteQueryAssetLoading(
								MTblock.shared.editor.doc.location.href, MTblock.getLiveData(currentBlockList, true)
							);
						}

					},
					args: []
				});

			},

			timer: {},
			prevReusableBlocks: null,

			getSourceFromBlockName: function(name){

				let source = name;

				switch(name) {
					case 'core/block':
					case 'core/pattern':
						source = 'wp_pattern';
						break;
					case 'core/navigation':
						source = 'wp_navigation';
						break;
					case 'core/template-part':
						source = 'wp_template_part';
				}

				return source;
			},

			// loop over blocks recursively, extracting pattern refs and template parts
			iterateBlockList: function(list, config, cb){

				if (list){

					let keys = Object.keys(list);

					for (let i = 0; i < keys.length; i++) {

						let item = list[keys[i]],
							result;

						// run any callbacks
						if (cb){
							let args = (cb.args || []);
							args.push(item, keys[i], list, config);
							result = cb.item.apply(this, args);
						}

						// respond to any callback result to skip recursion or break out of the loop
						if (result === 'continue'){
							continue;
						} else if (result === 'break'){
							break;
						}

						// recurse
						if (item.innerBlocks){
							MTblock.iterateBlockList(item.innerBlocks, config, cb);
						}
					}
				}
			},
			checkBlockListChange: function(oldList, newList){

				let config = {
						older: {
							list: oldList.list,
							refs: oldList.refs
						},
						newer: {
							list: newList.list,
							refs: newList.refs
						},
						added: [],
						removed:[],
					},
					keys = ['older', 'newer']

				// compare added or removed
				keys.forEach((key) => {

					let refs = Object.keys(config[key].refs);

					refs.forEach((ref) => {

						let entry = {
							ref: ref,
							name: config[key].refs[ref]
						};

						if (key === 'older'){
							if (!config.newer.refs[ref]){
								config.removed.push(entry);
							}
						} else if (key === 'newer'){
							if (!config.older.refs[ref]){
								config.added.push(entry);
							}
						}
					})
				});

				return config;

			},

			// general function for applying actions after a timeout
			actionAfterTimeout: function(timerName, timeOut, functionObj){

				// if a timer has already been set
				if (MTblock.timer[timerName]) {

					// clear the timer
					clearTimeout(MTblock.timer[timerName]);

					// delete the timerID to prevent lots of build up.
					delete MTblock.timer[timerName];
				}

				// save timer ID and run
				MTblock.timer[timerName] = setTimeout(function(){

					// run function
					functionObj.item.apply(this, functionObj.args);

				}, timeOut);

			},


			// Add MT class to all existing blocks
			addClassesToExistingBlocks: function(){

				let existingBlocks = MTblock.blocksContainer.getElementsByClassName('wp-block'),
					all = MTblock.add_block_classes_all();

				for (let i = 0; i < existingBlocks.length; i++) {
					MTblock.maybeAddClassToBlock(existingBlocks[i], null, 'existing', all);
				}
			},

			// respond to a new Gutenberg block being added to the editor
			maybeAddClassToBlock: function(el, mutationRecord, type, all, unsavedMTClasses){

				if (el){

					const clientId = el.dataset.block;

					if (type !== 'existing'){
						MTblock.log('maybeAddClassToBlock', type, clientId, el)
					}

					if (clientId) {
						return MTblock.addUniqueClass(el, clientId, type, all, unsavedMTClasses);
					}
				}

				return false;

			},

			// handle exceptions where we don't add a class
			handleClassExceptions: function(el, clientId, className){

				let exceptionResult = {},
					classList = el.classList;

				if (classList){

					// Kadence buttons - it adds the class in two places, causes invalid selectors
					// We want the class to be added only to the wp-block-kadence-advancedbtn el
					// .mctr-123 .mctr-123 - which can be handled
					if (classList.contains('wp-block-kadence-singlebtn')){
						MTblock.log('Kadence button exception, skip class', clientId, el);
						exceptionResult.skip = true;
					}

					// Don't add a class to the Classic editor block as the container isn't rendered
					if (classList.contains('wp-block-freeform')
						|| classList.contains('block-library-html__edit')
					){
						MTblock.log('Gutenberg exception', clientId, el);
						exceptionResult.skip = true;
					}
				}

				return exceptionResult;

			},

			// todo - MTF.prevBlockEl = el;
			addUniqueClass: function(el, clientId, type, all, unsavedMTClasses){

				let individualClass,
					uniqueClassName,
					skip = false;

				// Bail if the content cannot receive a custom class - todo this is triggered by mistake on non-standard blocks
				if (!MTblock.blocksSupportsCustomClass(clientId)){
					MTblock.log('Block cannot receive a custom class', clientId, el);
					return false;
				} else {
					MTblock.log('Block is eligible for a custom class', clientId, el);
				}

				if (clientId) {

					const { select, dispatch } = wp.data;
					const currentAttributes = MTblock.getBlockAttributes(clientId);

					uniqueClassName = MTblock.uniqueClass();
					individualClass = uniqueClassName;

					MTblock.log('Current attributes', currentAttributes, clientId, el.classList)

					// Handle exceptions
					let exceptionResult = MTblock.handleClassExceptions(
						el, clientId, currentAttributes.className
					);

					if (exceptionResult.skip){
						skip = true;
					}

					if (!skip){
						// Check for existing class and combine or skip if already an MT class
						if (currentAttributes && currentAttributes.className){

							let existingMTClass = MTblock.alreadyHasUniqueClass(currentAttributes.className);

							if (existingMTClass){
								skip = true;
								MTblock.log('Unique class has already been added', currentAttributes.className, clientId)
							} else {
								uniqueClassName+= ' '+currentAttributes.className;
								MTblock.log('Combine MT class with existing', uniqueClassName, clientId)
							}
						}
					}

					// Dispatch the update if a change is being made
					if (!skip){

						// log classes that haven't been saved yet, for auto-save
						if (unsavedMTClasses){
							unsavedMTClasses[individualClass] = 1;
						}

						// insert the class directly into the block editor (possibly a dangerous move for React)
						// because it seems that the dispatch happens async (but we need it immediately if selecting)
						if (type === 'selection'){
							el.classList.add(individualClass);
						}

						dispatch('core/block-editor').updateBlockAttributes(clientId, {
							className: uniqueClassName
						});

						//console.log('the class for the el', el.className)

						if (type !== 'existing'){
							MTblock.log('Unique class added to the editor', uniqueClassName, clientId);
						}

					}

					// add classes to inner blocks too
					if (all){
						const descendentClientIds = select('core/block-editor').getClientIdsOfDescendants(clientId);

						for (let i = 0; i < descendentClientIds.length; i++) {
							MTblock.addUniqueClass(el, descendentClientIds[i], type, all, unsavedMTClasses);
						}
					}

				}

				return skip ? false : uniqueClassName;
			},

			removeUniqueClass: function(el, type){
				const { select, dispatch } = wp.data;
				const clientId = el.dataset.block;
				const currentAttributes = MTblock.getBlockAttributes(clientId);

				MTblock.log('maybe removeUniqueClass', currentAttributes, ' on ', el);

				if (currentAttributes){
					const className = currentAttributes.className;
					const existingUniqueClass = MTblock.alreadyHasUniqueClass(className);

					//MTblock.log('existingUniqueClass', existingUniqueClass, className);

					if (className && existingUniqueClass){

						let cleanedClass = className
							.split(/\s+/)
							.filter(e => e !== existingUniqueClass)
							.join(' ');

						// insert the class directly into the block editor (possibly a dangerous move for React)
						// because it seems that the dispatch happens async (but we need it immediately if selecting)
						if (type === 'selection'){
							el.classList.remove(existingUniqueClass);
						}

						dispatch('core/block-editor').updateBlockAttributes(clientId, {
							className: cleanedClass
						});

						MTblock.log('className was cleaned from', className, 'to', cleanedClass, ' on ', el);

					}
				}
			},

			// This doesn't work for non-Gutenberg blocks
			blocksSupportsCustomClass: function(clientId){

				return true; // this needs work, we're getting a false positive on e.g. blockquotes - need a new method.

				let opts = MTblock.getBlockOptions(clientId).blockOptions;

				//console.log('blocksSupportsCustomClass?', opts);

				return opts &&

					// allow for all non Gutenberg core blocks (e.g. for all block builders)
					opts.name.indexOf('core') !== 0

					// allow if Gutenberg has set supports.className to anything at all (inc false)
					|| (opts.supports && opts.supports.className !== undefined);
			},

			getBlockOptions: function(clientId){

				const { select } = wp.data;

				let	block = select( 'core/block-editor' ).getBlock(clientId),
					blockOptions = block ? select('core/blocks').getBlockType(block.name) : null;

				return {
					block: block,
					blockOptions: blockOptions
				}
			},

			// Subscribe to changes in Gutenberg
			subscribe: function(config){

				const { select, subscribe, dispatch } = wp.data;

				MTblock.log('Setup subscribe for ', config.name, config);

				return subscribe(() => {

					//MTblock.log('Run subscribe callback for ', config.name, config);

					let cb = config.cb;
					let args = cb.args || [];
					args.push(select, dispatch, config);
					cb.args = args;

					if (cb){
						if (config.timeout){
							MTblock.actionAfterTimeout(config.name, config.timeout, cb);
						} else {
							//console.log('args to send', args)

							cb.item.apply(this, cb.args);
						}
					}
				});
			},

			setDeviceType: function(deviceMode){
				const { select, dispatch } = wp.data;
				//console.log('setDeviceType core/editor', select('core/editor'), dispatch('core/editor'))
				dispatch('core/editor').setDeviceType(deviceMode); // passed deviceMode param must be capitalized
			},

			getCurrentTemplate: function(){
				const { select } = wp.data;

				//console.log('getCurrentTemplate', select('core/editor'), select('core/editor').getTemplate())

				return select('core/editor').getEditedPostAttribute('template');
			},

			getCurrentScreenTitle: function(){

				const { select } = wp.data;

				// Access the 'core/editor' store
				const store = select('core/editor');

				//console.log('Current screen debug', store.getEditedPostAttribute('title'));

				return store.getEditedPostAttribute('title') || '';


				/*const siteStore = select('core/edit-site');

				// Get the type of the currently edited entity
				const editedPostType = siteStore.getEditedPostType();

				// Get the title based on the edited post type
				let currentScreenTitle = '';



				switch (editedPostType) {
					case 'wp_template':
					case 'wp_block':
					case 'wp_template_part':
					case 'wp_navigation':
					case 'page':
						currentScreenTitle = store.getEditedPostAttribute('title');
						break;
				}

				//console.log('getCurrentTemplate', select('core/editor'), select('core/editor').getTemplate())

				console.log('Current screen', editedPostType, currentScreenTitle);

				return currentScreenTitle;*/
			},


			selectorForBlockOnlyCSS: '',
			adjustBlockOnlyStyles: function(cssSelector, action, doc){

				let styles,
					MTblock = window.MTblock,
					isEditor = MTblock && MTblock.isEditor;

				MTblock.log('adjustBlockOnlyStyles', action, window.TvrMT);

				if (cssSelector && doc && doc.head){

					styles = doc.head.querySelectorAll(cssSelector);

					MTblock.log('adjustBlockOnlyStyles styles', action, styles);

					styles.forEach(element => {
						if (action === 'disable'){
							element.setAttribute("media", "not all");
						}

						// we only enable the stylesheet if it's loaded in an iframe
						// Or it's a conditional stylesheet that is most likely only going to affect elements
						// inside the block editor. We basically just exclude global styles, which are likely
						// to bleed into the toolbars. Note - the FSE always uses an iframe.
						// This just applies to the Edit Post / Page block editor which doesn't use an iframe
						// under some circumstances. Hopefully that will become fully deprecated in future.
						else {

							//MTblock.log('enable element', !isEditor, element.id !== 'microthemer-css', element, element.id);

							if (!isEditor || element.id !== 'microthemer-css'){
								element.setAttribute("media", "all");
							}

						}
					});
				}

				return styles;

			},
			disableBlockOnlyStyles: function(){

				let folderLoading = MTblock.MTDynFrontData.folderLoading,
					keys = Object.keys(folderLoading),
					placeholder = 'style#microthemer-sectionSlug-inline-css, ' +
						'link#microthemer-sectionSlug-css',

					// frontend global styles load on the block editor admin pages as an exception
					// If they didn't line-heights and font-sizes etc would not be consistent in the FSE vs frontend
					selectors = ['#microthemer-css'];

				for (let i = 0; i < keys.length; i++) {
					let sectionSlug = keys[i];
					if (folderLoading[sectionSlug] === 'blocksOnly'){
						selectors.push(placeholder.replace(/sectionSlug/g, sectionSlug))
					}
				}

				if (selectors.length){

					// cache the selector for use in the content iframe
					MTblock.shared.editor.selectorForBlockOnlyCSS  = selectors.join(', ');

					// disable the styles in the editor (can't remove them until the iframe loads)
					MTblock.shared.editor.disabledEditorStyles = MTblock.adjustBlockOnlyStyles(
						MTblock.shared.editor.selectorForBlockOnlyCSS , 'disable', document
					);
				}

				MTblock.log('disableBlockOnlyStyles', selectors, MTblock.shared.editor.selectorForBlockOnlyCSS)
			},

			// FSE used outside of MT:
			// we need to replace MT assets when the page changes content without actually reloading
			replaceMTAssets: function(currentBrowserUrl, effectiveTestUrl, MTblock, liveData){

				let testUrl = effectiveTestUrl+(effectiveTestUrl.indexOf('?') > -1 ? '&': '?')
						+'test_logic=1&test_all&get_simple_stylesheets=1';

				MTblock.log('replaceMTAssets origStyles', testUrl, liveData)

				let formData = new FormData();

				if (liveData){
					formData.append('live_post_content', liveData.live_post_content);
					formData.append('live_template', liveData.live_template);
				}

				// todo - get plain text and then extractJsonFromText
				MTblock.fetch(testUrl, {
					requestOptions: !liveData ? null : {
						method: "POST",
						body: formData
					},
					cb: {
						item: function(data){

							//console.log('Data received from cb', data)

							let doc =  MTEblock.editor.getIframeRefs().doc,
								permaDoc = doc && doc.head && doc.head.childElementCount;

							MTblock.shared.cache.view.stylesheets = data.stylesheets;

							if (permaDoc){
								MTblock.replaceStylesheets(doc, data.stylesheets);
								MTblock.log('Replace stylesheets:');
								MTblock.log(data.stylesheets);

								MTblock.editor.maybeResumeObservations(doc);
							}

							else {
								MTblock.log('No blocks document available in the current view, cache', data.stylesheets);

								MTEblock.shared.cache.view.pendingStylesheetReplace = true;
								//MTblock.shared.cache.view.stylesheets = data.stylesheets;
								// maybe cache for next upcoming load (which will be purged if browser url changes)
							}



						},
					}
				})
			},

			replaceStylesheets: function(doc, stylesheets){

				let placeholderTag = doc.getElementById('mt-placeholder-inline-css'),
					origStyles = doc.querySelectorAll('link[href*="\\/micro-themes\\/"], style[id^="microthemer"]');

				//console.log('replaceStylesheets', stylesheets)

				if (stylesheets){
					placeholderTag.insertAdjacentHTML('afterend', stylesheets);
				}

				// remove the previous stylesheets
				origStyles.forEach(element => {
					//console.log('remove style', element)
					element.remove();
				});
			},

			/*
			* Gutenberg React integration functions
			* https://developer.wordpress.org/block-editor/reference-guides/data/data-core-editor/
			*/

			extractBlockRefs: function(config, item){

				let attributes = item.attributes;

				if (attributes){

					let ref = attributes.ref,
						slug = attributes.slug,
						theme = attributes.theme,
						refKey = ref
							? ref // pattern or navigation
							: (
								theme && slug
									? theme+'//'+slug // template-part
									: (
										item.name === 'core/pattern' && slug
											? slug
											: false
									)
							);

					if (refKey){
						let source = MTblock.getSourceFromBlockName(item.name);
						config.refs[refKey] = source;

						// format a HTML string that can be passed to the server when checking logic live
						let html = '',
							maybeQuotedRef = isNaN(refKey) ? '"'+refKey+'"' : refKey;

						switch(source) {
							case 'wp_template_part':
								html = '<!-- wp:template-part {"slug":"'+slug+'","theme":"'+theme+'","tagName":"'+attributes.tagName+'"} /-->';
								break;
							case 'wp_pattern':
								if (item.name === 'core/pattern'){
									html = '<!-- wp:pattern {"slug":"'+slug+'"} /-->';
								} else {
									html = '<!-- wp:block {"ref":'+maybeQuotedRef+'} /-->';
								}
								break;
							case 'wp_navigation':
								html = '<!-- wp:navigation {"ref":'+maybeQuotedRef+'} /-->';
								break;

						}
						config.refsHtml+= html+"\n";
					}

					//console.log('Check it', item.clientId, ref, item, refKey)
				}
			},

			getBlockList: function(clone, justTopLevel){

				let list = wp.data.select( 'core/block-editor' ).getBlocks(),
					config = {
						updated: {},
						refs: {},
						refsHtml: '',
						refsHtmlParts: {
							root: ''
						}
					};

				if (clone){
					list = structuredClone(list);
				}

				// we often want all descendent blocks of core/post and template parts etc
				if (!justTopLevel){

					MTblock.iterateBlockList(list, config,  {

						item: function(item, key, list){

							if (config.updated[item.clientId]){
								return;
							}

							switch(item.name) {
								case 'core/post-content':
								case 'core/template-part':
								case 'core/block':
								case 'core/navigation':

									// for patterns, check they are re-usable
									if (item.name === 'core/block' || item.name === 'core/navigation'){
										if (!item.attributes || !item.attributes.ref){
											return;
										}
									}

									MTblock.extractBlockRefs(config, item);

									//console.log('We have a item', item.name, item);

									let { select } = wp.data,
										descendentIds = select( 'core/block-editor' )
											.getClientIdsOfDescendants(item.clientId);

									// if we need to append the blocks
									if (descendentIds.length && !item.innerBlocks.length){

										item.innerBlocks = [];

										descendentIds.forEach((id) => {

											let childBlock = select( 'core/block-editor' ).getBlock(id),
												parents = select( 'core/block-editor' )
												.getBlockParents(childBlock.clientId, true);

											// append direct children, which will be iterated recursively
											// for any inner items
											if (parents[0] === item.clientId){
												item.innerBlocks.push(childBlock);
											}

										});

										config.updated[item.clientId] = 1;
									}

									//console.log('descendentIds', descendentIds)

							}
						}
					});
				}

				MTblock.log('getBlockList', list, config)

				return {
					refs: config.refs,
					refsHtml: config.refsHtml,
					list: list
				};

			},

			// get the editor rendered block code - note this creates duplicate content when
			// applied to lists with injected Blocks that weren't originally included with getBlocks()
			getPostContent: function(blockList){

				const { select } = wp.data;

				if (MTblock.shared.editor.context === 'fse'){

					let htmlContent = '',
						getSaveContent = wp.blocks.getSaveContent,
						config = {};

					// Iterate through each block
					MTblock.iterateBlockList(blockList, config,  {
						item: function(block, key, list){

							let content = getSaveContent(
								block.name, block.attributes, block.innerBlocks
							);

							//console.log('append html', block.name, block, content)

							htmlContent+= content;
						}
					});

					return htmlContent;
				}

				else {
					return select( "core/editor" ).getEditedPostContent();
				}
			},

			getPostTitle: function(){
				const { select } = wp.data;

				//console.log('getPostTitle', wp.data, select);

				return select('core/editor').getEditedPostAttribute( 'title' );
			},

			/* this just says if code editing is allowed, not if code editing is active
			isCodeEditingEnabled: function(){
				const { select } = wp.data;
				let enabled = select( 'core/editor' ).getEditorSettings().codeEditingEnabled;
				console.log('isCodeEditingEnabled', enabled);
				return enabled;
			},*/

			getSelectedBlockClientId: function(clientId){
				const { select } = wp.data;
				return select('core/block-editor').getSelectedBlockClientId();
			},

			selectBlock: function(clientId){
				const { select, dispatch } = wp.data;
				dispatch('core/block-editor').selectBlock(clientId);
			},

			getBlockAttributes: function(clientId){
				const { select } = wp.data;
				return select('core/block-editor').getBlockAttributes(clientId);
			},


			// Get the atts of the nearest ancestor block to the element provided
			getClientId: function(el){
				return el.dataset.block;
			},

			// Get the nearest block
			getClosestBlock: function(el){
				return el.closest('.wp-block');
			},

			getUserDefinedClass: function(el, arrayFormat){

				let clientId = MTblock.getClientId(el);

				if (clientId){
					let attributes = MTblock.getBlockAttributes(clientId);
					if (attributes && attributes.className){
						return arrayFormat
							? attributes.className.split(/\s+/)
							: attributes.className;
					}
				}

				return false;

			},

			getUserDefinedId: function(el){

				let clientId = MTblock.getClientId(el);

				if (clientId){
					let attributes = MTblock.getBlockAttributes(clientId);
					//console.log('id attributes', attributes)
					if (attributes && attributes.anchor){
						return attributes.anchor;
					}
				}

				return false;

			},

			// Save the post or FSE - maybe only if new MT classes have been added and referenced todo
			// at the very least, we should check if the post is a saveable state - i.e. there have been new changes.
			savePost: function(B){
				wp.data.dispatch( 'core/editor' ).savePost();
				B.unsavedMTClasses = {};
				//console.log('Saving it', wp, wp.data.dispatch( 'core/editor' ));
			},

			// update an MTDynFrontData property on all available data stores
			updateAllDataStores: function(key, value, MTDynFrontData){

				if (MTDynFrontData){
					MTDynFrontData[key] = value;
				}

				[MTblock, MTEblock, MTFblock].forEach(item => {

					//console.log('updateAllDataStores', item, value);

					if (item){
						item.MTDynFrontData[key] = value;
					}
				});
			},

			/*
			* Common & context equivalent functions
			*/

			editor: {
				init: function () {
					MTblock.log('We run editor init', MTblock);

					// remove any MT styles that should only display in the iframe
					MTblock.disableBlockOnlyStyles();

					//console.log('MTblock.shared.TvrMT', !parseInt(MTblock.shared.TvrMT.TvrUi.pref.admin_asset_editing))
					/*if (!MTblock.shared.TvrMT || !parseInt(MTblock.shared.TvrMT.TvrUi.pref.admin_asset_editing)){
						console.log('We disable the styles');
					}*/


					// FSE changes the iframe src content when navigating, so watch for changes
					// this allows us to replace MT assets when the screen view changes
					MTblock.editor.handleAddressBarChange();

					// listed for user clicks
					MTblock.editor.handleClicks();

					if (MTblock.editorHasBlocks) {
						MTblock.blocksReadyMaybeObserve();
					} else {
						// the block container may still be added to this doc or an iframe
						MTblock.checkForIframe()
						MTblock.checkForBlocksContainer();
					}
				},
				userInteractionHappened: function () {
					MTblock.shared.editor.userInteraction = true;
					MTblock.log('userInteractionHappened', MTblock.context);
				},
				getIframeRefs: function() {

					let win = window.frames['editor-canvas'];
					return {
						win: win,
						doc: win ? win.document : undefined
					}
				},
				prevBrowserUrl: filterIgnoreParams(document.location.href),
				// https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript
				// This custom event is a polyfill for addEventListener("navigate") - not supported in Firefox/Safari
				setupCustomLocationChangeEvent: function(){

					let oldPushState = history.pushState;

					history.pushState = function pushState() {
						let ret = oldPushState.apply(this, arguments);
						window.dispatchEvent(new Event('pushstate'));
						window.dispatchEvent(new Event('locationchange'));
						return ret;
					};

					let oldReplaceState = history.replaceState;

					history.replaceState = function replaceState() {
						let ret = oldReplaceState.apply(this, arguments);
						window.dispatchEvent(new Event('replacestate'));
						window.dispatchEvent(new Event('locationchange'));
						return ret;
					};

					window.addEventListener('popstate', () => {
						window.dispatchEvent(new Event('locationchange'));
					});
				},
				handleAddressBarChange: function(){

					MTblock.log('set up handleAddressBarChange', window);

					MTblock.editor.setupCustomLocationChangeEvent();

					window.addEventListener('locationchange', function () {


						let currentBrowserUrl = filterIgnoreParams(document.location.href);

						//console.log('locationchange new Url', currentBrowserUrl, 'previous: ', MTblock.editor.prevBrowserUrl);

						MTblock.log('currentBrowserUrl, MTblock.editor.prevBrowserUrl', currentBrowserUrl, MTblock.editor.prevBrowserUrl);

						if (currentBrowserUrl !== MTblock.editor.prevBrowserUrl){
							MTblock.editor.handleViewChange(currentBrowserUrl);
						}

					});




					/*window.navigation.addEventListener("navigate", (event) => {
						console.log('navigate', filterIgnoreParams(document.location.href), event);
					})*/

					/*addEventListener("popstate", (event) => {
						console.log('popstate', filterIgnoreParams(document.location.href), event);
					});*/
				},
				handleClicks: function(){

					document.addEventListener("click", (event) => {

						let el = event.target,
							tagName = el.tagName.toLowerCase(),
							className = el.getAttribute("class"),
							classList = className ? className.split(/\s+/) : [];

						/*
						,
							currentBrowserUrl = filterIgnoreParams(document.location.href);



						if (currentBrowserUrl !== MTblock.editor.prevBrowserUrl){
							MTblock.editor.handleViewChange(currentBrowserUrl);
						}
						 */

					});
				},

				remoteQueryAssetLoading: function(currentBrowserUrl, liveData){

					// clear any cached assets for the previous view
					MTblock.shared.cache.view = {};

					// lots of FSE pages fall back to the front page when a single item isn't being viewed
					// So we need to test assets against "/" instead
					let params = new URL(currentBrowserUrl).searchParams,
						effectiveTestUrl = currentBrowserUrl;

					if (MTblock.shared.editor.context === 'fse' && !params.get('postId')){
						effectiveTestUrl = MTblock.ensureTrailingSlash(MTblock.MTDynFrontData.home_url);
					}

					//console.log('location.href', location.href, MTblock.shared.editor.win.location.href);
					//console.log('effectiveTestUrl', params.get('postId'), params, effectiveTestUrl, currentBrowserUrl, liveData);

					MTblock.log('effectiveTestUrl', effectiveTestUrl, currentBrowserUrl);

					// if we're inside MT, simulate the site preview being updated
					// with different folders being enabled / disabled
					if (MTblock.shared.TvrMT){
						let B = MTblock.shared.TvrMT.mod.MTint.builderUnq.gutenberg;
						B.simulatePageOrContentChange(B, currentBrowserUrl, effectiveTestUrl, MTEblock, liveData);
					}

					// we are not inside MT, but we still need to replace MT assets
					else {
						MTblock.replaceMTAssets(currentBrowserUrl, effectiveTestUrl, MTEblock, liveData);
					}
				},

				// setup observations again after a page change
				maybeResumeObservations: function(doc){

					MTblock.log('Is the container still connected', (MTblock.blocksContainer && MTblock.blocksContainer.isConnected));

					if (!MTblock.blocksContainer || !MTblock.blocksContainer.isConnected){

						MTblock.log('No, we need to resume observations');

						MTblock.blocksReadyMaybeObserve(doc);
					}
				},

				handleViewChange: function(currentBrowserUrl){

					MTblock.log('handleViewChange from ', MTblock.editor.prevBrowserUrl, ' to ', currentBrowserUrl);

					// update prev view variable
					MTblock.editor.prevBrowserUrl = currentBrowserUrl;

					MTblock.updateAllDataStores('iframe-url', currentBrowserUrl);

					MTblock.editor.remoteQueryAssetLoading(currentBrowserUrl);

				},
			},

			iframe: {
				win: null,
				doc: null,
				userInteraction: null,
				init: function(){

					MTblock.log('We run iframe init');

					// signal that the window has blocks on data store
					MTblock.MTDynFrontData.hasBlocks = true;

					// adjust the default logic that targets the admin page
					let B = MTblock.isInsideMT();
					if (B){
						B.adjustLogicForBlockContent(MTblock.MTDynFrontData, window, window.parent);
					}

					// maybe observe blocks
					if (MTblock.iframeHasBlocks){
						MTblock.blocksReadyMaybeObserve();
					}
				},

				userInteractionHappened: function(){
					MTblock.iframe.userInteraction = true;
					MTblock.log('userInteractionHappened', MTblock.context);
				},

				isPreviewThumb: function(){

				},
			},

		};

		// Assign functionality depending on window context
		const initForContext = () => {

			// Check the current context - Main editor admin page vs Editor content iframe
			let bodyClasses = document.body.classList,
				htmlClasses = document.documentElement.classList,
				previewClass = 'block-editor-block-preview__content-iframe';

			// Orientation
			MTblock.isEditor = bodyClasses.contains('block-editor-page');
			MTblock.isIframe = bodyClasses.contains('block-editor-iframe__body');
			MTblock.isPreviewIframe = bodyClasses.contains(previewClass) || htmlClasses.contains(previewClass);
			MTblock.doBlockChecks(document);

			if (MTblock.isPreviewIframe){
				MTblock.log('Do not run any code when iframe is loaded as a thumbnail preview', '/wp-admin/site-editor.php?path=%2Fpatterns');
				return;
			}

			MTblock.context = MTblock.isIframe
				? 'iframe'
				: 'editor';

			// set variables references
			MTblock.setVars();

			// set up mutual events
			//MTblock.setEvents();

			//console.log('DOMContentLoaded', MTblock.DOMContentLoaded)

			// Init script
			MTblock[MTblock.context].init();
		};

		document.addEventListener("DOMContentLoaded", (event) => {

			MTblock.DOMContentLoaded++;

			// WP 7.1+ can fire DOMContentLoaded in the editor canvas iframe before its body is added
			if (document.body){
				initForContext();
				return;
			}

			const bodyObserver = new MutationObserver(() => {
				if (document.body){
					bodyObserver.disconnect();
					initForContext();
				}
			});
			bodyObserver.observe(document.documentElement, { childList: true });

		}, { once: true });

		return MTblock;

	})();

} else {
	//console.log('DO not run MT block functionality', window)
}
// Main Microthemer UI functions
// initiate when ready (among other things to ensure TvrMT.dyn/ver are populated)
// ensure preview doesn't replace MT interface (overwrites detachedPreview)
//window.name = 'MTroot';
jQuery(document).ready(function($){

	// make shorthand object references available to this function
	var TvrCom = TvrMT.TvrCom,
		MTF = TvrMT.MTF,
		MTdetached = TvrMT.MTdetached,
		detachedWin = TvrMT.detachedWin,
		MTace = TvrMT.mod.MTace,
    	MTint = TvrMT.mod.MTint,
    	MTloop = TvrMT.mod.MTloop,
        MTdd = TvrMT.mod.MTdd,
        MTsave = TvrMT.mod.MTsave,
        MTsass = TvrMT.mod.MTsass,
        MTgrid = TvrMT.mod.MTgrid,
        MTgridValues = TvrMT.mod.MTgridValues,
		MTfolder = TvrMT.mod.MTfolder,
		MThtml = TvrMT.mod.MThtml,
		MTai = TvrMT.mod.MTai,
		MTtransform = TvrMT.mod.MTtransform,
		MTlayout = TvrMT.mod.MTlayout,
		MTwidget = TvrMT.mod.MTwidget;

	var pref = TvrMT.data.dyn.pref,
		scss_enabled = parseInt(pref.allow_scss),
		client_scss = TvrMT.data.dyn.client_scss,
		fullWidth = $('body').width();

	/*
	console.log('TvrMT.data.dyn.client_scss', client_scss)
	console.log('server_scss', server_scss)
	*/

	//console.log('selInFocusId from start', TvrCom.checkObject(TvrMT.data.dyn.ui, ['non_section', 'meta', 'last_viewed_selector']), TvrMT.data.dyn.ui)

	TvrMT.TvrUi = {

		// assign program data for easy reference
		appName: TvrMT.data.dyn.ui_config.appName,
		cssFilters: TvrMT.data.prog.CSSFilters,
		cssProps:  TvrMT.data.prog.CSSProps,
        gatheredCSS: TvrMT.data.prog.gatheredCSS,
        templates: TvrMT.data.templates,
		blog_details: TvrMT.data.dyn.blog_details,
		TVR_DEV_MODE: TVR_DEV_MODE, // so frontend scrip has access to this

		// sass
		scss_enabled: scss_enabled,
		client_scss: client_scss,

		// assign dynamic JS for easy reference
		pref:  TvrMT.data.dyn.pref,
		uiData:  TvrMT.data.dyn.ui,
		sass: false, // SASS.js will be instantiated on this property if active
		
		// measure the total time a function spends running JS object update code
		// this is useful for performance optimsing 
		jsDataFunc: false,
		revisionStack: {
			undo: [],
			redo: [],
			current: null
		},

        // js update version, if we make a change that requires update to all selectors,
        // increase the version and add conversion functions to compile_non_compiled_selectors
		jsuVersion: 7,
		jsuEvents: {
			js_css_compilation: 3,
			synced_code_gui: 4,
			imp_only_sh_and_grad_fix: 5,
            property_value_structure: 6,
			separate_css_units: 7
		},
		// asign library vars for easy reference
		aiRetryShouldAwaitSave: 0,

		// This default tab
		/*lastMultiTab: {
			index: 0,
			action: 'replace',
			aspect: 'text'
		},*/
		selInFocusID: TvrCom.checkObject(TvrMT.data.dyn.ui, ['non_section', 'meta', 'last_viewed_selector']),
		sRules: CSSUtilities,
		reinitRules: true,
		tooMuchCSS: false,
		tmp: {}, // if a setting is turned on/off temporarily
		uiUrl: $('#ui-url').attr('rel'),
		pluginUrl: $('#plugin-url').attr('rel'),
		animateCssUrl: $('#animate-css-url').attr('rel'), // empty in builds without the stock animations
		codeEditors: parseInt($('#code-editors').attr('rel')) === 1, // full and per-selector code editors (not in every build)
		innoFireall: parseInt($('#inno-firewall-issue').attr('rel')),
		//wpAjaxUrl: $('#wp_ajax_url').attr('rel'), // includes ?page=microthemeruipage
		adminUrl: $('#admin-url').attr('rel'),
		microUrl: $('#micro-url').attr('rel'),
		totalSecs: parseInt($('#total-sec-count').text()),
		TvrSugCSS: {},
		breadcrumbNodesCache: {},
		highlightEnabled: false, // try starting with this being off to begin with
		colorPickerDragging: false,
		progStatus: [],
		intelli: false,
		awaitingIFrame: true,
		placeholderFrame: true,
		errorBeingProcessed: 0,
		compProps: {},
        grid: {
			container: false,
			items: []
		},
		intelliCompProps: {},
		nodeCSS: {},
		intellinodeCSS: {},
		mixedElKey: 0,
		update_gf_url: false,
		g_url: '', // this is g_url_with_subset
        comboScrollTopPos: 0,
		pageOrPostID: TvrCom.checkObject(TvrMT.data.dyn, ['ui_config', 'preview_item_id']),
		numSug: 100, // this is set manually anyway
        numRecent: 6,
        numSampled: 15,
		numMiniTiles: 12,
		numSavedTiles: 56, // could reduce this to make room for variable field in picker
		numSiteTiles: 56, // ditto
		maxSelsPerFolder: 40,
		//notifyFolderChanged: [],
        // just have site styles picker with a handful of properties
        samplingProps: [
            'font_family',
            'font_size',
            'line_height',
            'color', // in picker not dropdown
            'padding_top',
            'padding_right',
            'padding_bottom',
            'padding_left',
            'margin_top',
            'margin_right',
            'margin_bottom',
            'margin_left',
            'row_gap',
            'column_gap',
            'border_width',
            'border_radius'
        ],
        // variable line array props
        gridTrackProps: [
            'grid-template-rows',
            'grid-template-columns',
            'grid-auto-rows',
            'grid-auto-columns'
        ],
		propAliases: TvrMT.data.prog.propAliases,
		cssFuncAliases: TvrMT.data.prog.cssFuncAliases,

		// mutation observer stuff
		domChanged: {
			updateHTMLPane: false,
			updateFrontIndexes: false
		},
		mutationObserver: false,
		selectorLabelEditing: false,
		retargetSelector: false,
		draftSelector: {
			atts: {},
			ace: {} // for code snippets (previously full code editor)
		},
		draftFolders: [],
		draft_user_action: {
			new: {},
			retarget: {}
		},


		// Use event delegation sparingly with these static elements (use closest to target).
		// Compare this with dynamic binding performance later.
		stat: {
			win: window,
			doc: document,
            head: document.head,
			$doc: $(document),
			body: $('body'),
			tvr: $('#tvr'),
			vis: $('#visual-view'),
			styleComponents: $('#style-components'),
			logicAnalysis: $('#logicAnalysis'),
			phpSyntax: $('#phpSyntax'),
			nav: $('#tvr-nav'),
            mainMenu: $('#mt-folders'),
			searchFoldersInput: $('#search-folders-input'),
			mainMenuInner: $('#tvr-menu'),
			top: $('#mt-top-controls'),
			code: $('#hand-css-area'),
			codeInner: $('#tvr-inner-code'),
			grid: $('#grid-control-wrap'),
			inlineEditor: $('#inline-editor'), // wrapper
			adaptableEditor: $('#adaptable-editor'),
			aiPanel: $('#ai-assistant-panel'),
			aiEditor: $('#ai-editor'),
			view: $('#display-css-code-dialog'),
			res: $('#responsive-bar'),
			css_icons: $('#css-group-icons'),
			slider: $('#v-mq-slider'),
			opts: $('#tvr-options'),
			front: $('#v-frontend-wrap'),
            frontInner: $('#v-frontend'),
			wiz: $('#advanced-wizard'),
			inspectionPanes: $('#wizard-panes'),
			//wizFolder: $('#sec-hierarchy-input'),
			//selNaming: $('#advanced-wizard'),
			currentFolderItem: $('#current-folder-item'),
			refineTarget: $('#refine-target-controls'),
			cssModifiers: $('#cm-css-filters'),

			contextMenu: $('#mt-context-menu'),
			addSelectorForm: $('#cm-edit-folder-options').find('.add-selector-form'),
			editSelectorForm: $('#cm-selector-options').find('.edit-selector-form'),

			suggestionsMenu: $('#mt-suggestions-menu'),
			suggestionsAdvanced: $('#mt-suggestions-panel'),

			/*codeSuggestions: $('#code-suggestions'),
			codeSuggestionsMenu: $('#mt-code-suggestions'), //*/
			//existingSelectors: $('#mt-existing-selectors'),

			//nestedEls: $('#mt-nested-els'),
			// current folder item hierarchy text
			curSecTrailText: $('#sec-in-focus'),
			curSelTrailText: $('#cur-sel-trail-text'),
			curStateTrailText: $('#cur-state-trail-text'),

			// current folder item inputs
			curSecInput: $('#sec-hierarchy-input'),
			curSelInput: $('#sel-hierarchy-input'),
			curCodeInput: $('#code-hierarchy-input'),
			publishButton: $('#mt-publish-action'),
			//curCodeInputWrap: $('#code-in-focus'),
			breadcrumbs: $('#full-breadcrumbs'),
			sliderDragbar: $('#mtss-dragbar'),
			actStyles: $('#actual-styles'),
			settingsMenu: $('#program-settings-menu'),
			aiAssistant: $('#ai-assistant-panel'),
			notifications: $('#mt-notifications'),
			iframe: $('#viframe'),
			iframeDoc: false,
			dialogs: $('#dialogs'),
			cssUnitGrid: $('#css-units-grid'),
			scss_compile_notes: $('#scss-error-notes'),
			//scss_import_compile_notes: $('#scss-import-error-notes'),
			scss_error_file: $('#scss-error-file'),
            widthTest: $('#tvr-width-input'),
            changeUrlInputWrap: $('#previewPath').parent(),
			inputWidthCalc: $('#inputWidthCalc'),
			codeInputWidthCalc: $('#codeInputWidthCalc'),
		},
		tOut: 60000, // timeout 60 seconds
		// map of history icon level
		hi: {
			'section': 'folder-icon tvr-icon',
			'selector': 'selector-icon tvr-icon',
			'tab': 'edit-media-queries lg-icon'
		},
		baseFontSize: 16, // gets update when frontend loads
		browser: $('#user-browser').attr('rel'), // PHP func used to get this (jQuery is fazing b sniffing out)
		meta: {},
		inputWaitingObj: {},
		timer: {
			/*typing:0,
			quickTarget:0,
			deferredTarget:0,*/
		},
		// allow user to hold shift to create comma separated selectors
		previous_selector: '',
		joined_selectors: [],
		jumpTo: false, // jump to line in ace editor
		something_wrong: false,
		debugCount: 0,
		wasOpen: false,
		//leftMenu: ($('#program-settings-menu').hasClass('show')) ? true : false,
		dataLoading: false,
		intelliAfterLoad: false,
		ajaxUrl: $('#wpAjaxUrl').attr('rel'),

		toolbarHeight: 0,
		frameHeight: 0,
		frameWidth: 0,
        previewWidth: 0, // set on load
		rulerVal: 0,
		prev: false, // for storing previous pg vars
		fullWidth: fullWidth,
		resSliderWidth: 0,
		tabsWidth: 0,
		sortableMenuDims: {},
		mqs: [],
		totalSels: parseInt($('#total-sel-count').text()),
		gFontTarget: Object(),
		selsToLoad:0,
		totalToLoad:0,
		pgInFocusWiz: 'font',
        aceTypingInterval: 50, // 500 with sass, wait a bit longer to ensure typing has finished to avoid excess requests
        inputTypingInterval:50,
        beforeSaveInterval: 1200, // delay before save - so history isn't bonkers. Sass needs to be less as no instant styles in head
        beforeAutoConvertInterval: 2000,
		saveInProgress: false,
        pendingAutoSave: function(){
			return TvrCom.obj_length(TvrUi.pendingAutoSaveConfig);
		},
        pendingAutoSaveConfig: {},
		reSave: false,
		siteUrl: $('#site-url').attr('rel'), // if wp in subdir = http://example.com/sub
		homeUrl: $('#home-url').attr('rel'), // if wp in subdir = http://example.com/
		itemAlreadyExpanded: false,
		tooltipDelay: 300, // $('#tooltip_delay').attr('rel').toLowerCase(),
		// edge mode
		edge_mode: parseInt($('#edge-mode').attr('rel')),
		// temporary edge mode settings
		//slidlessWizard: TvrCom.isDomEl($('#slideless_wizard')) && $('#slideless_wizard').attr('rel') ? true : false,


		/*** initialise event listeners etc ***/
		init: function(){

			// if user had navigating to MT from inside MT, default to home page
			//console.log('window.parent.TvrMT', (window !== window.top && window.parent.TvrMT));
			if (window != window.top && window.parent.TvrMT) {
                window.location = TvrUi.homeUrl;
			}

			// apply event listeners
			TvrMT.init.add_listeners();
		},

		// set default dark theme if the user has this preference set
		set_default_theme_mode: function(){

			// if dark mode
			if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

				// toggle the switch on
				TvrUi.toggle_feature(
					$('#mymtonoffswitch-mt_dark_mode').closest('.mt-ui-toggle')
				);

				//console.log('The dark mode was switched on', TvrUi.pref.mt_dark_mode)
			}

			TvrUi.pref.theme_mode_set = 1;

			MTsave.save_multiple_preferences({
				mt_dark_mode: TvrUi.pref.mt_dark_mode,
				theme_mode_set: 1
			}, 1);

		},

        // Status is frozen when an action takes too long. We need to release the status board upon user action.
        // This is triggered by any click, Ctrl+S. This may have other applications.
        ua_detected: function(){
            TvrUi.something_wrong = false;
        },

        // array for storing JS errors
        JSerrors: [],
        prevJSerrors: [],
		reportedJSErrors: [], // catch all errors within a action_after_timeout sequence

		process_error: function(source, error, url, line, colno, errorObj, fullError){

			//console.log('Process the error');

			// protect against recursive loop when error processing code generates an error
			if (TvrUi.errorBeingProcessed > 3){
				TvrUi.errorBeingProcessed = 0;
				//console.log('Error in progress, bail');
				return false;
			}

			TvrUi.errorBeingProcessed++;

			errorObj = errorObj || {};

			if (errorObj.stack){
				let match = errorObj.stack.match(/\((https?:[^:]+):(\d+):(\d+)/);
				//console.log('The match', match);
				if (match){
					url = match[1];
					line = match[2];
					colno = match[3];
				}
			}

			let file = url.substring(url.lastIndexOf('/')+1).split('?')[0];

			let err = {
				error: error,
				file: file,
				URL: url ,
				line: line,
				col: colno,
				error_key: file+'|'+line+'|'+colno+'|'+error, // .replace(/\s+/g, '-')
				// errorObj: errorObj,
				source: source === 'ui' ? TvrLang.interface : TvrLang.frontend,
				stack:  TvrUi.strip_domain_names(errorObj.stack)
			}

			TvrUi.JSerrors.push(err);


			//console.log('The error with stack', source, error, url, line, colno, errorObj, TvrUi.JSerrors);

			TvrUi.instant_show_js_error(source, err);


		},

        // Catch any JS errors. This runs on iframe too.
        catch_js_errors: function(){ //TvrCom.startT(arguments);

            // cypress will not fail if we catch errors in application
            // todo there may be a way to have both, research
            if (window.top.Cypress || !parseInt(TvrUi.pref.monitor_js_errors)){
            	//console.log('do not catch the error', TvrUi.pref.monitor_js_errors)
                return false;
            }

            window.onerror = function(error, url, line, colno, errorObj) {
				TvrUi.process_error('ui', error, url, line, colno, errorObj);
            };

            //TvrCom.endT(arguments)
        },



		// is instant editing supported? With SCSS we must do stylesheet reload. May add optin for user to disable.
		instantPreviewNotSass: function(){
			return !parseInt(TvrUi.pref.allow_scss);
		},

		adminAssetsEnabled: function(){
			return parseInt(TvrUi.pref.admin_asset_loading) || parseInt(TvrUi.pref.admin_asset_editing);
		},

		isMTerror: function(stack, inUserJs, force){
			return force || stack && (stack.indexOf('microthemer/js') > -1 || stack.indexOf('micro-themes/mt/js') > -1 || inUserJs && stack.indexOf('micro-themes/draft-scripts.js') > -1);
		},

        instant_show_js_error: function(source, err){

			//console.log('We got here 1', err.stack, TvrUi.pref.reporting);

			/*TvrCom.action_after_timeout('maybe_send_error_report', 500, {
				item: TvrUi.maybe_send_error_report,
			});*/

			// ensure unique_errors is an object, not an array
			let unique_errors = TvrUi.pref.reporting.file.unique_errors;
			if (unique_errors !== Object(unique_errors)){
				TvrUi.pref.reporting.file.unique_errors = {};
				unique_errors = TvrUi.pref.reporting.file.unique_errors;
			}

			if (TVR_DEV_MODE || !unique_errors[err.error_key]){
				unique_errors[err.error_key] = 1;
				// console.log('We can send it', err.error_key, unique_errors)
				TvrCom.action_after_timeout('maybe_send_error_report', 500, {
					item: TvrUi.maybe_send_error_report,
					args: [false, false, err]
				});
			} else {
				// console.log('We got here with err', err, unique_errors);
				unique_errors[err.error_key]++; // increment but don't bother with ajax request to save
			}

			// We should show the user any errors on the site as a result of their changes.
			let isUsingAmender = TvrUi.pref.pg_focus === 'html';
			//console.log('Is MT error / amender', TvrUi.isMTerror(err.URL, true, isUsingAmender), isUsingAmender);

			if (TvrUi.isMTerror(err.URL, true, isUsingAmender)){

				var short = err['error'];
				//short+= ' (line '+err['line']+')';
				var status = {
					'short': short,
					'long': '<p>'+TvrUi.appName+' '+TvrLang.js_error_site+':</p>'+
						TvrUi.js_error_deets(),
					'type' : 'warning'
				};

				// show error immediately if internal JS error on main ui
				if (source === 'ui' || err.URL.indexOf('micro-themes/mt/js') > -1){
					MTsave.update_full_logs(status);
					//console.log('we show the status immediately', source, status);
				} else {

					// Show immediately in case there is no save to follow
					MTsave.update_full_logs(status);

					// log error if frontend, so it isn't lost during setting saved update message.
					MTsave.log(status);
					//console.log('we log the status', source, status);
				}
			} else {
				//console.log('not an MT error', err);
			}

        },

		/**
		 * Extracts the most reliable error details possible from a caught error.
		 * Focuses on providing the function name and error message, as calculating
		 * a precise line number in a dynamic, inline, potentially-minified script
		 * is fundamentally unreliable without source maps.
		 *
		 * @param {any} caughtValue - The error object from a catch block.
		 * @param {string} functionNameFromContext - The name of the function we know was running.
		 * @returns {{...}} A structured object with the most useful error details.
		 */
		extractErrorDetails: function(caughtValue, functionNameFromContext) {
			let details = {
				url: '',
				message: 'An unknown error occurred',
				functionName: functionNameFromContext, // Use the reliable name we passed in.
				col: 'unknown',
				line: 'unknown', // Acknowledge that we cannot reliably get this.
				originalError: caughtValue
			};

			if (!caughtValue) {
				return details;
			}

			details.message = caughtValue.message || String(caughtValue);
			details.url = caughtValue.url || '';;

			// We can still attempt a "best-effort" parse of the stack for a column number,
			// which can sometimes be helpful, but we don't rely on the line number.
			if (typeof caughtValue.stack === 'string') {
				const stackLines = caughtValue.stack.split('\n');
				const patterns = [ /at\s.*\(.*:(\d+):(\d+)\)?/, /@.*:(\d+):(\d+)/ ];
				for (const line of stackLines) {
					if (line.includes('dyn_amends')) {
						for (const pattern of patterns) {
							const match = line.match(pattern);
							if (match) {
								details.url = MTF ? MTF.get_current_url() : '';
								details.line = parseInt(match[1], 10); // Absolute line (for our own debug)
								details.col = parseInt(match[2], 10);  // Column can be useful
								break;
							}
						}
						if (details.col !== null) break;
					}
				}
			}

			return details;
		},

        // show caught JS error
        js_error_deets: function(prev){ TvrCom.startT(arguments);

            var jsDetails = '';

            // get previous error if there has been a timeout (error will have been cleared in main array)
            var errorArr = !prev ? TvrUi.JSerrors : TvrUi.prevJSerrors;

            if (errorArr.length > 0){
                jsDetails+= '<ol>';
                for (var i in errorArr){
                    if ( ! errorArr.hasOwnProperty(i) ) continue; // for compat
                    var err = errorArr[i];
                    jsDetails+= '<li>';
                    for (var label in err){

                    	if ( ! err.hasOwnProperty(label)  ) continue; // for compat

						var val = err[label];

                        // error details can contain page-derived strings (e.g. selector syntax errors), so escape
                        if (label === 'URL' && val){
                            val = '<a target="_blank" href="'+TvrCom.escapeHTML(val)+'">'+TvrCom.escapeHTML(TvrCom.root_rel(val).split('?')[0])+'</a>';
                           // val+= ' (line '+err['line']+')';
                        }

                        else if (label === 'stack' || label === 'file' || label === 'error_key'){
                            continue;
                        }

                        // if a custom error object has been provided
                        else if (label === 'error' && typeof val === 'object'){
							val = val.detail && typeof val.detail === 'object' && val.detail.message
								? val.detail.message
								: 'Error details unknown';

							val = TvrCom.escapeHTML(val);
						}

						else {
							val = TvrCom.escapeHTML(val);
						}

                        jsDetails+= '<b>'+TvrCom.ucwords(label)+':</b> '+val+'<br />';

						/*if (label == 'fullError'){
							jsDetails+= '<br />' + val;
						}*/
                    }
                    jsDetails+='</li>';
                }
                jsDetails+= '</ol>';

                // reset JS error array otherwise they reappear in next message
                // after storing in prevJSerrors array, for use with timeouts
                TvrUi.prevJSerrors = $.extend(true, [], TvrUi.JSerrors);
				TvrUi.reportedJSErrors = [].concat(TvrUi.prevJSerrors);
                TvrUi.JSerrors = [];
            }
            TvrCom.endT(arguments)
            return jsDetails;
        },

		// whether an extension component disallows editing this property (none do by default)
		isForbiddenProperty: function($obj){
			return TvrMT.hooks.applyFilters('forbiddenProperty', false, $obj);
		},

		/*** convert em/rem media query values to pixels ***/
		adjust_mqs_for_unit: function(mqs){ TvrCom.startT(arguments);
			var m_conditions = ['min', 'max'];
			for (var key in mqs){

				if ( ! mqs.hasOwnProperty(key) ) continue; // for compat

				for (var i = 0; i < m_conditions.length; ++i) {
					var condition = m_conditions[i];
					// ensure all numbers are really numbers
					mqs[key][condition] = parseFloat(mqs[key][condition]);
					// convert ems/rems to pixels
					if (mqs[key][condition+'_unit'] && mqs[key][condition+'_unit'] != 'px'){
						mqs[key][condition] = parseFloat(mqs[key][condition]) * TvrUi.baseFontSize;
					}
				}
			}
			TvrCom.endT(arguments)
			return mqs;
		},

		// check for use of (last) pseudo class that is eligable for pairing (a state that will be stripped)
		// return variable string
		maybe_pair_class:function(code, context){

			var pseudoClass = TvrCom.get_pseudo_class(code);

			if (!pseudoClass) return false;

			var pseudo = pseudoClass[0],
				pseudoObj = TvrUi.get_pseudo_config(pseudoClass);

			if (!pseudoObj[pseudo].strip) return false;

			// it is a state class that will be stripped
			var stateClass = 'mt-'+TvrCom.convert_to_param(pseudo, '');
			if (context == 'class'){
				return stateClass;
			} else if (context == 'selector' || context == 'full'){
				var regex = new RegExp(pseudo+'(?!.*'+pseudo+')');
				var stateSel = code.replace(regex, '.'+stateClass);
				if (context == 'selector'){
					return stateSel;
				} else {
					return code+ ', '+stateSel;
				}
			}

		},

		// get the jQuery adjustment config for an array of pseudo classes/els
		get_pseudo_config: function(pseudo){

			// put into an object for simplicity
			var pseudoObj = {};
			for (var k in pseudo){
				if ( ! pseudo.hasOwnProperty(k) ) continue; // for compat
				pseudoObj[pseudo[k]] = {};
			}

			// get the config for the pseudo, we need to search both classes and elements
			// page_specific for uniform functionality
			var pseudoArr = ['page_specific', 'pseudo_elements', 'pseudo_classes'];
			for (var i in pseudoArr){
				if ( ! pseudoArr.hasOwnProperty(i) ) continue; // for compat
				var type = pseudoArr[i];
				for (var pseudoCE in TvrUi.cssFilters[type]['items']){
					if ( ! TvrUi.cssFilters[type]['items'].hasOwnProperty(pseudoCE) ) continue; // for compat
					// ::before and :before are both valid so we must check both
					var legacyPseudoCE = pseudoCE.replace('::', ':');
					if (pseudoObj[pseudoCE] || pseudoObj[legacyPseudoCE]){
						var key = pseudoObj[legacyPseudoCE] ? legacyPseudoCE : pseudoCE;

						// copy css filer config to custom object
						pseudoObj[key] = $.extend(true, {}, TvrUi.cssFilters[type]['items'][pseudoCE]);
						// include the non-legacy pseudo too for logical comparisons
						pseudoObj[key]['pCE'] = pseudoCE;
					}
				}
			}

			return pseudoObj;
		},

		// check if any pseudo selector has been set
		psuedo_is_set: function(){

			var clazz = TvrUi.stat.tvr.attr('class'),
				classes = [ 'pseudo_classes', 'page_specific', 'pseudo_elements' ];

			for (var i in classes){
				if ( ! classes.hasOwnProperty(i) ) continue; // for compat
				if (clazz.indexOf(classes[i]) > -1){
					return true;
				}
			}

			return false;
		},

        support_sampling: function(prop, $input){
			let name = $input.attr('name') || '';
		    return name.indexOf('[styles][html]') < 0;
            //return TvrCom.in_array(prop, TvrUi.samplingProps);
        },

        get_property_tab_control: function(prop){

            var cssf = prop.replace(/_/g, '-');
            return TvrCom.checkObject(TvrMT.data.prog.lh, [cssf, 'tab_control']);
        },

		// pseudo_class_format
		pseudo_class_format: function(str){
			return 'filter-'+ str.replace(/[:\(\)]+/g, '');
		},

		// get user pseudo value
		get_pseudo: function(con, c){

			if (con == 'val'){
				var clsFormat = TvrUi.pseudo_class_format(c.pseudoCE);
				var $list = TvrUi.stat.cssModifiers
					.find('ul.css-filter-list');
				var userVal = $list
					.find('li.'+clsFormat)
					.find('input').val();
				return userVal;
			}

			/*else if (con == 'warnFocus'){
			 var $focus = $(document.activeElement);
			 }*/

		},



		// return relevant function depending on site preview being attached or detached
		get_local_window_function: function(fName, forceMain){

			// update global references
			detachedWin = TvrMT.detachedWin;
			MTdetached = window.TvrMT.MTdetached;

			var runOnDetached = (!forceMain && MTlayout.detached_window_available(true)
				&& !!detachedWin.MTlocal && detachedWin.MTLocalFunctionsReady);

			// use forceMain when the behaviour should run on both windows (requires 2 function calls)
			return runOnDetached
				? detachedWin.MTlocal[fName]
				: window.MTlocal[fName];
		},

		// actions to run if Ctrl+Alt+S/P (save and recompiel all SCSS)
		keyboard_save_action: function(e, action){

			TvrUi.ua_detected();

			TvrUi.draftSelector.ace.deferSave = false;

			var $editor,
				editorType = parseInt(TvrUi.pref.show_code_editor) ? 'full' : 'inline',
				fullSCSSCompile = (action === 'fullSCSSCompile'),
				manualSave = (action === 'manual'),
				editor = MTace.get_focus_editor();

			// exception if gui has editor in focus, feed in textarea to save history correctly
			if (editorType === 'inline'){

				//console.log('we clicked save')

				// look for ace in focus
				if (TvrUi.selInFocusID){

					var $property = $('#'+TvrUi.selInFocusID+'-code-code-css-'+TvrUi.get_mq_focus());

					if (TvrCom.isDomEl($property)){
						MTsave.ajax_save_settings({
							$editor: TvrUi.stat.adaptableEditor,
							noSaveDelay: !fullSCSSCompile,
							manualSave: 1,
							$property: $property.find('textarea.property-input'),
							settings: fullSCSSCompile ? { fullSCSSCompile: 1 } : {},
							//mode: mode
						});

						if (e){
							e.preventDefault();
						}

						return false;
					}


					// general save / full compile
					else {

						var settings = {},
							historyMsg = 'All settings saved (Ctrl + S)';

						if (fullSCSSCompile){
							settings.fullSCSSCompile = 1;
							historyMsg = 'Full Sass compile (Ctrl + Alt + P)';
						} if (manualSave){
							historyMsg = 'All settings saved';
						}

						settings = MTsave.user_action(settings, {
							'items': [historyMsg],
							'icon': 'mtif-save'
						});

						let saveConfig = {
							noSaveDelay: !fullSCSSCompile,
							manualSave: 1,
							settings: settings,
							//mode: mode
						}

						// Refresh the page if the user is editing JS
						let M = TvrUi.get_selector_in_focus(),
							$button = M ? M.selector.find('span.html-content-refresh') : null;
						if ($button && $button.hasClass('tvr-pulse')){
							saveConfig.cbFunction = MThtml.refreshPreview;
							//console.log('Attach callback to refresh page on save', $button);
						} else {
							//console.log('No button', $button, M);
						}

						MTsave.ajax_save_settings(saveConfig);
					}

				}
			}

			// full code editor
			else {
				MTace.ace_instant_save(
					editorType, MTace.ace_sync_details.$textarea, TvrUi.stat.adaptableEditor,
					!fullSCSSCompile, fullSCSSCompile, manualSave
				);
			}

			//e.returnValue = false; // for firefox / internet explorer
			if (e){
				e.preventDefault();
			}

		},

		// ensure keyboard shortcuts don't multi-fire when user presses and holds (even very briefly)
		keyPressDone: {},

		// apply an action triggered by keypress if the first keypress hasn't already triggered it
		shortcutOnce: function(cb){
			if (!TvrUi.keyPressDone[cb.action]){
				//console.log('running keyboard shortcut function once', cb.action, cb);
				cb.item.apply(this, cb.args);
				TvrUi.keyPressDone[cb.action] = 1;
			}
		},

		// child iframe trigger this on load
		setup_keyboard_shortcuts: function( doc ){ TvrCom.startT(arguments);

			// mouse trap (keyboard shortcuts)
			/* mousetrap v1.6.0 craig.is/killing/mice */(function(r,t,g){function u(a,b,h){a.addEventListener?a.addEventListener(b,h,!1):a.attachEvent("on"+b,h)}function y(a){if("keypress"==a.type){var b=String.fromCharCode(a.which);a.shiftKey||(b=b.toLowerCase());return b}return k[a.which]?k[a.which]:p[a.which]?p[a.which]:String.fromCharCode(a.which).toLowerCase()}function D(a){var b=[];a.shiftKey&&b.push("shift");a.altKey&&b.push("alt");a.ctrlKey&&b.push("ctrl");a.metaKey&&b.push("meta");return b}function v(a){return"shift"==a||"ctrl"==a||"alt"==a||"meta"==a}function z(a,b){var h,c,e,g=[];h=a;"+"===h?h=["+"]:(h=h.replace(/\+{2}/g,"+plus"),h=h.split("+"));for(e=0;e<h.length;++e)c=h[e],A[c]&&(c=A[c]),b&&"keypress"!=b&&B[c]&&(c=B[c],g.push("shift")),v(c)&&g.push(c);h=c;e=b;if(!e){if(!n){n={};for(var l in k)95<l&&112>l||k.hasOwnProperty(l)&&(n[k[l]]=l)}e=n[h]?"keydown":"keypress"}"keypress"==e&&g.length&&(e="keydown");return{key:c,modifiers:g,action:e}}function C(a,b){return null===a||a===t?!1:a===b?!0:C(a.parentNode,b)}function c(a){function b(a){a=a||{};var b=!1,m;for(m in n)a[m]?b=!0:n[m]=0;b||(w=!1)}function h(a,b,m,f,c,h){var g,e,k=[],l=m.type;if(!d._callbacks[a])return[];"keyup"==l&&v(a)&&(b=[a]);for(g=0;g<d._callbacks[a].length;++g)if(e=d._callbacks[a][g],(f||!e.seq||n[e.seq]==e.level)&&l==e.action){var q;(q="keypress"==l&&!m.metaKey&&!m.ctrlKey)||(q=e.modifiers,q=b.sort().join(",")===q.sort().join(","));q&&(q=f&&e.seq==f&&e.level==h,(!f&&e.combo==c||q)&&d._callbacks[a].splice(g,1),k.push(e))}return k}function g(a,b,m,f){d.stopCallback(b,b.target||b.srcElement,m,f)||!1!==a(b,m)||(b.preventDefault?b.preventDefault():b.returnValue=!1,b.stopPropagation?b.stopPropagation():b.cancelBubble=!0)}function e(a){"number"!==typeof a.which&&(a.which=a.keyCode);var b=y(a);b&&("keyup"==a.type&&x===b?x=!1:d.handleKey(b,D(a),a))}function k(a,c,m,f){function e(c){return function(){w=c;++n[a];clearTimeout(r);r=setTimeout(b,1E3)}}function h(c){g(m,c,a);"keyup"!==f&&(x=y(c));setTimeout(b,10)}for(var d=n[a]=0;d<c.length;++d){var p=d+1===c.length?h:e(f||z(c[d+1]).action);l(c[d],p,f,a,d)}}function l(a,b,c,f,e){d._directMap[a+":"+c]=b;a=a.replace(/\s+/g," ");var g=a.split(" ");1<g.length?k(a,g,b,c):(c=z(a,c),d._callbacks[c.key]=d._callbacks[c.key]||[],h(c.key,c.modifiers,{type:c.action},f,a,e),d._callbacks[c.key][f?"unshift":"push"]({callback:b,modifiers:c.modifiers,action:c.action,seq:f,level:e,combo:a}))}var d=this;a=a||t;if(!(d instanceof c))return new c(a);d.target=a;d._callbacks={};d._directMap={};var n={},r,x=!1,p=!1,w=!1;d._handleKey=function(a,c,e){var f=h(a,c,e),d;c={};var k=0,l=!1;for(d=0;d<f.length;++d)f[d].seq&&(k=Math.max(k,f[d].level));for(d=0;d<f.length;++d)f[d].seq?f[d].level==k&&(l=!0,c[f[d].seq]=1,g(f[d].callback,e,f[d].combo,f[d].seq)):l||g(f[d].callback,e,f[d].combo);f="keypress"==e.type&&p;e.type!=w||v(a)||f||b(c);p=l&&"keydown"==e.type};d._bindMultiple=function(a,b,c){for(var d=0;d<a.length;++d)l(a[d],b,c)};u(a,"keypress",e);u(a,"keydown",e);u(a,"keyup",e)}if(r){var k={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",224:"meta"},p={106:"*",107:"+",109:"-",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"},B={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"},A={option:"alt",command:"meta","return":"enter",escape:"esc",plus:"+",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"},n;for(g=1;20>g;++g)k[111+g]="f"+g;for(g=0;9>=g;++g)k[g+96]=g;c.prototype.bind=function(a,b,c){a=a instanceof Array?a:[a];this._bindMultiple.call(this,a,b,c);return this};c.prototype.unbind=function(a,b){return this.bind.call(this,a,function(){},b)};c.prototype.trigger=function(a,b){if(this._directMap[a+":"+b])this._directMap[a+":"+b]({},a);return this};c.prototype.reset=function(){this._callbacks={};this._directMap={};return this};c.prototype.stopCallback=function(a,b){return-1<(" "+b.className+" ").indexOf(" tvr-mousetrap ")||C(b,this.target)?!1:"INPUT"==b.tagName||"SELECT"==b.tagName||"TEXTAREA"==b.tagName||b.isContentEditable};c.prototype.handleKey=function(){return this._handleKey.apply(this,arguments)};c.addKeycodes=function(a){for(var b in a)a.hasOwnProperty(b)&&(k[b]=a[b]);n=null};c.init=function(){var a=c(t),b;for(b in a)"_"!==b.charAt(0)&&(c[b]=function(b){return function(){return a[b].apply(a,arguments)}}(b))};c.init();r.TvrMousetrap=c;"undefined"!==typeof module&&module.exports&&(module.exports=c);"function"===typeof define&&define.amd&&define(function(){return c})}})("undefined"!==typeof window?window:null,"undefined"!==typeof window?doc:null); // sebcus use doc var for document

// support for bindGlobal mousetrap command
			(function(a){var c={},d=a.prototype.stopCallback;a.prototype.stopCallback=function(e,b,a,f){return this.paused?!0:c[a]||c[f]?!1:d.call(this,e,b,a)};a.prototype.bindGlobal=function(a,b,d){this.bind(a,b,d);if(a instanceof Array)for(b=0;b<a.length;b++)c[a[b]]=!0;else c[a]=!0};a.init()})(TvrMousetrap);

			// Select an element being hovered using alt keypress (once) instead of clicking
			TvrMousetrap.bindGlobal(['alt'], function(e) {

				if (!TvrUi.mouseWheelAltAction && TvrUi.iframeEditing() && MTF.hoveredElement){

					TvrUi.shortcutOnce({
						action: 'select_hovered_element',
						item: MTF.select_element,
						args: [MTF.hoveredElement, {
							e: e,
							scroll: false
						}]
					});
				}

				return false;
			}, 'keypress');


			// signal that mousewheel has finished so alt can be used for selecting elements again
			TvrMousetrap.bindGlobal(['alt'], function(e) {

				if (TvrUi.mouseWheelAltAction){
					TvrUi.mouseWheelAltAction = false;
				}

				return false;

			}, 'keyup');

            // toggle active page builder
            TvrMousetrap.bindGlobal(['command+alt+b', 'ctrl+alt+b'], function(e) {

				TvrUi.shortcutOnce({
					action: 'toggle_builder',
					item: MTint.keyboard_toggle_builder
				});

                return false;
            }, 'keypress');


            // toggle code view mode
            TvrMousetrap.bindGlobal(['command+alt+c', 'ctrl+alt+c'], function(e) {

            	TvrUi.shortcutOnce({
					action: 'show_code_editor',
					item: TvrUi.toggle_feature,
					args: [false, 'show_code_editor']
				});

                return false;
            }, 'keypress');

            // detach preview
            TvrMousetrap.bindGlobal(['command+alt+d', 'ctrl+alt+d'], function(e) {

				TvrUi.shortcutOnce({
					action: 'detach_preview',
					item: TvrUi.toggle_feature,
					args: [false, 'detach_preview']
				});

                return false;
            }, 'keypress');

            // View the generated CSS
            TvrMousetrap.bindGlobal(['command+alt+g', 'ctrl+alt+g'], function(e) {

				TvrUi.shortcutOnce({
					action: 'view_generated_code',
					item: TvrUi.show_dialog,
					args: [TvrUi.stat.settingsMenu.find('li.item-display-css-code')]
				});

                return false;
            }, 'keypress');

            // Toggle current selector highlighting
            TvrMousetrap.bindGlobal(['command+alt+h', 'ctrl+alt+h'], function(e) {

				TvrUi.shortcutOnce({
					action: 'toggle_highlighting',
					item: function(){

						// if already on, turn off
						if (parseInt(TvrUi.pref.mt_highlight)){
							TvrUi.feature_off(0, 'mt_highlight', {
								fHTML:1,
								noSave:1
							});
						}

						// else turn on
						else {
							TvrUi.feature_on(0, 'mt_highlight', {
								// turn off any wizard highlighting first
								offFirst: {fHTML:1, noSave:1},
								fHTML:1,
								noSave:1,
								con: 'reg'
							});
						}
					}
				});

                return false;

            }, 'keydown');
            // keyup not handled with mousetrap (h problem, alt would work) - see manual method below.

            // toggle inline editor GUI
            TvrMousetrap.bindGlobal(['command+alt+j', 'ctrl+alt+j'], function(e) {

				TvrUi.shortcutOnce({
					action: 'toggle_inline_gui',
					item: TvrUi.toggle_inline_gui
				});

                return false;

            }, 'keypress');

            // toggle property text labels
            /*TvrMousetrap.bindGlobal(['command+alt+l', 'ctrl+alt+l'], function(e) {
                TvrUi.toggle_feature(false, 'show_text_labels');
                return false;
            }, 'keypress');*/

            // toggle site search menu
            TvrMousetrap.bindGlobal(['command+alt+n', 'ctrl+alt+n'], function(e) {

				TvrUi.shortcutOnce({
					action: 'toggle_preview_page_menu',
					item: TvrUi.toggle_preview_page_menu,
					args: [TvrUi.stat.settingsMenu.find('.program-settings-tab-preview_page')]
				});

                return false;

            }, 'keypress');

			// Beautify editor code
			TvrMousetrap.bindGlobal(['command+alt+o', 'ctrl+alt+o'], function(e) {
				TvrUi.shortcutOnce({
					action: 'beautifyCode',
					item: function(){
						var editor = MTace.eds['adaptable-editor'];
						if (editor){
							MTace.beautify_editor_content(editor);
						}

					}
				});
				return false;
			}, 'keypress');

            // process all SCSS
            TvrMousetrap.bindGlobal(['command+alt+p', 'ctrl+alt+p'], function(e) {

				//console.log('The fullSCSSCompile shortcut');

				TvrUi.shortcutOnce({
					action: 'fullSCSSCompile',
					item: function(){
						TvrUi.close_dialog();
						TvrUi.keyboard_save_action(e, 'fullSCSSCompile');
					}
				});

                return false;

            }, 'keypress');

			// Give editor focus
			TvrMousetrap.bindGlobal(['command+alt+r', 'ctrl+alt+r'], function(e) {

				TvrUi.shortcutOnce({
					action: 'editor_focus',
					item: function(){
						var editor = MTace.eds['adaptable-editor'];
						if (editor){
							editor.focus();
						}
					},
					args: []
				});

				return false;
			}, 'keypress');


			// allow ctrl+s save
			TvrMousetrap.bindGlobal(['command+s', 'ctrl+s'], function(e) {

				TvrUi.shortcutOnce({
					action: 'keyboard_save_action',
					item: TvrUi.keyboard_save_action,
					args: [e, 'save']
				});

				return false;

			});

			// toggle hover targeting mode
			TvrMousetrap.bindGlobal(['command+alt+t', 'ctrl+alt+t'], function(e) {

				TvrUi.shortcutOnce({
					action: 'hover_inspect',
					item: TvrUi.toggle_feature,
					args: [false, 'hover_inspect', {noSave:1}]
				});

				return false;

			}, 'keypress');

            // nav prev selector
            TvrMousetrap.bindGlobal(['command+alt+,', 'ctrl+alt+,'], function(e) {

				TvrUi.shortcutOnce({
					action: 'nav_prev_item',
					item: TvrUi.quick_nav,
					args: [$('#vb-focus-prev')]
				});

                return false;

            }, 'keypress');

            // nav next selector
            TvrMousetrap.bindGlobal(['command+alt+.', 'ctrl+alt+.'], function(e) {

            	TvrUi.shortcutOnce({
					action: 'nav_next_item',
					item: TvrUi.quick_nav,
					args: [$('#vb-focus-next')]
				});

                return false;
            }, 'keypress');

            // keydown event
			$(doc).on('keydown', function (e) {

				// up/down arrow - use with keydown so hold keeps triggering
				if (e.which === 38 || e.which === 40){

					var $el = $(e.target);

					if (TvrCom.isDomEl($el)){

						// MT slider input, without the autocomplete showing (as up/down iterates over options)
						if ($el.hasClass('mt-slider') && !$el.next('.combo-arrow').hasClass('on')){
							MTwidget.increment_change(e, (e.which === 40));
						}
					}
				}

			});


			// key up event (e.g. ALT release)
			$(doc).on('keyup', function (e) {

				// reset keyPress logging (must come before returning false)
				TvrUi.keyPressDone = {};

				//console.log('e.which', e.which, e);

				// alt key - prevent Firefox from toggling browser menu
				if (e.which === 18){
					//console.log('We bail on alt key');

					e.preventDefault()
					return false;
				}


				// enter or esc key pressed
				if (e.which === 13 || e.which === 27){

					var elementClass = e.target && e.target.className
						? e.target.className
						: false;

					// MT interface only

					// if we have a focus element that can be checked against a class
					if (elementClass){

						var elementID = e.target.id,
							$focusEl= $(e.target),
							confirm = e.which === 13,
							actionClass;

						// Only run on MT parent interface
						if ($focusEl.closest('body').hasClass('tvr-visual')){

							// confirm or cancel selector add/edit
							if (elementClass.indexOf('selector-css-textarea') >= 0 ||
								elementClass.indexOf('selector-name-input') >= 0) {

								actionClass = confirm ? '.tvr-button' : '.cancel';

								$focusEl
									.closest('.mt-folder-form').find(actionClass)
									.trigger('click');
							}

							// confirm or cancel folder add / edit
							else if (elementClass.indexOf('add-section-label-input') >= 0
								|| elementClass.indexOf('edit-section-label-input') >= 0) {

								if (confirm){
									$focusEl
										.closest('.mt-folder-form').find('.tvr-button')
										.trigger('click');
								} else {
									TvrUi.close_context_menu();
								}

							}

							// confirm preview url
							else if (elementID === 'previewPath' && confirm) {

								$focusEl
									.closest('.tvr-input-wrap').find('.change-preview-url')
									.trigger('click');
							}

							// media query / js add
							else if (elementClass.indexOf('new-item-input') >= 0 && confirm) {
								$focusEl
									.closest('.tvr-new-item').find('.new-item-add')
									.trigger('click');
							}

							// create selector
							else if (elementID === 'sel-hierarchy-input' || elementID === 'sec-hierarchy-input') {

								// editing the current selector label
								if (TvrUi.selectorLabelEditing){

									if (confirm){
										TvrUi.save_selector_label_edit();
									} else {
										TvrUi.cancel_selector_label_edit();
									}
								}

								// new or retarget selector action
								else {

									if (confirm){
										TvrUi.save_draft_selector(TvrUi.retargetSelector, true);
									} else {
										TvrUi.cancel_selector_label_edit(TvrUi.retargetSelector);
									}
								}

							}

							// import / export
							else if (elementID === 'import_from_pack_name' || elementID === 'export_pack_name') {

								actionClass = confirm ? '.dialog-button' : '.close-dialog';

								$focusEl
									.closest('.tvr-dialog').find(actionClass)
									.trigger('click');
							}

							// Send AI prompt
							else if (elementID === 'tvr-ai-prompt' && !e.shiftKey) {
								$focusEl
									.closest('.ai-prompt-form').find('.ai-send-prompt')
									.trigger('click');

								$focusEl.val($focusEl.val().replace(/\n+$/, ''));

								//e.preventDefault()
								//return false;
							}


						}

					}
				}


			});

			TvrCom.endT(arguments)
		},

		// function for checking the state of expaneded menus, more manageable than maintaining global vars
		/*xpanded: function(con){
			var $exp
			if (con == "main_menu"){
				$exp = $('#mt-folders')
			} /!*else if (con == "show_css_filters"){
				$exp = $('#show_css_filters-toggle');
			} *!/else if (con == "mq"){
				var $sel = $('#'+TvrUi.selInFocusID);
				if (TvrCom.isDomEl($sel)){
					$exp = $sel.find('span.add-mq');
				} else {
					return false;
				}
			}

			// test target el for on signal
			return $exp.hasClass('on');

		},*/


		/***
		 MAIN UI CLICK FUNCTIONS
		 ***/

		// toggle the folders menu by clicking the main icon or the current folder link
		toggle_main_menu: function($clicked){

			//console.log('The main menu HTML', TvrUi.stat.mainMenu[0].outerHTML);

			var show = !TvrUi.stat.mainMenu.hasClass('expanded'),
				trigger = $clicked.data('trigger'),
				sameTrigger = (trigger === TvrUi.stat.mainMenu.data('trigger')),
				hideMenu = (!show && sameTrigger);

			//console.log('triggers', trigger, TvrUi.stat.mainMenu.data('trigger'), hideMenu)

			// hide and bail if toggled by opening trigger
			if (hideMenu){
				//TvrUi.hide_main_menu();
				TvrUi.hide_folders_or_settings('folders', 'left');

				// scroll the menu item into view, as the menu isn't hidden if panel always displays
				if (TvrUi.selInFocusID && !TvrUi.search_filter){
					let M = TvrUi.get_selector_in_focus();
					TvrUi.scrollIntoView(TvrUi.folders_scrollable_area(), M.selectorM)
				}

				return false;
			}

			// show menu if not showing already
			if (show){
				TvrUi.show_folders_or_settings('folders', 'left');
			}

			// unless user has created a search filter
			// scroll to top (for all) or current folder
			if (!TvrUi.search_filter){

				if (trigger === 'all'){
					TvrCom.scroll_to({
						scrollDiv: TvrUi.folders_scrollable_area(),
						top: true
					});
				}

				else {
					TvrUi.maybe_show_current_folder_item_view();
				}
			}

			// log which trigger opened the menu
			TvrUi.stat.mainMenu.data('trigger', trigger);

		},

		expand_interface_if_collapsed: function(){

			//console.log('expand_interface_if_collapsed', parseInt(TvrUi.pref.hide_interface))

			if (parseInt(TvrUi.pref.hide_interface)){
				TvrUi.feature_off(false, 'hide_interface');
			}
		},

		// the behaviour is very similar for toggling folders and settings as
		// both can display as docked or overlay and both affect the columns layout
		show_folders_or_settings: function(type, side){

			TvrUi.expand_interface_if_collapsed();

			// for settings and AI, close the other if neither is docked
			if (type === 'settings' || type === 'ai'){

				var $settingsToggle = $('#program-settings-icon'),
					$aiToggle = $('#mt-ai-assistant');

				if (type === 'ai' && $settingsToggle.hasClass('on') ){ // && !TvrUi.pref.dock_settings_right
					TvrUi.hide_folders_or_settings('settings', 'right');
				} if (type === 'settings' && $aiToggle.hasClass('on') ){ // && !TvrUi.pref.dock_ai_right
					TvrUi.hide_folders_or_settings('ai', 'right');
				}
			}

			var container = MTlayout.get_sidebar_container(type, false, side);

			container.$el.addClass('expanded on');
			container.$toggle.addClass('on');

			TvrUi.stat.tvr.addClass('mt-'+type+'-showing');

			// bring folders to front - unless they are not docked, as that changes z-indexes unnecessarily
			//console.log('type', type, side, TvrUi.pref.dock_folders_left);
			var noZIndexUpdate = type === 'folders' && !parseInt(TvrUi.pref.dock_folders_left);
			if (!noZIndexUpdate){
				//console.log('show and update type', type, side);
				MTlayout.update_sidebar_z_indexes(type, side);
			}


		},

		hide_folders_or_settings: function(type, side, zindexDone){

			// close any tooltip that might linger after a surprise close
			MTlocal.clean_tooltips();

			var container = MTlayout.get_sidebar_container(type, false, side),
				$toggle = container.$toggle;

			// with folders, we also reset the current sec in focus class
			if (container.$otherToggle){
				$toggle = $toggle.add(container.$otherToggle);
			}

			//console.log('Toggle to turn off', $toggle, container)

			// reset classes
			container.$el.removeClass('expanded on')
			$toggle.removeClass('on');
			TvrUi.stat.tvr.removeClass('mt-'+type+'-showing');

			// restore z-index of previously top panel
			if (!zindexDone){

				var previousPanel =  MTlayout.return_another_panel_to_top(type, side);

				if (previousPanel && previousPanel !== type){
					MTlayout.update_sidebar_z_indexes(
						previousPanel,
						side
					);
				}

				else {
					container.$el.removeClass('mt-top-panel');
				}
			}
		},

		// close any expanded elements that should close when clicking elsewhere in the UI
		close_all_expanded: function($clicked){ TvrCom.startT(arguments);

			var toggleForPopup = $clicked.data('forpopup'),
				detachedAvailable = MTlayout.detached_window_available(true),
				popups = {
					contextMenu: {
						name: 'contextMenu',
						$el: TvrUi.stat.contextMenu,
						run: TvrUi.close_context_menu
					},
					contextMenuDetached: {
						name: 'contextMenu',
						$el:  detachedAvailable ? MTdetached.getLocalContextMenuEl() : false,
						run: detachedAvailable ? MTdetached.close_context_menu : false
					},
					folders: {
						name: 'folders',
						$el: TvrUi.stat.mainMenu,
						run: TvrUi.hide_folders_or_settings,
						args: ['folders', 'left'],
						// don't hide folder is user is toggling folders left docking,
						// or a folder related context menu is showing
						closeException: function($clicked){
							return ($clicked.attr('id') === 'mymtonoffswitch-dock_folders_left') ||
								TvrUi.stat.contextMenu.data('relatedto') === 'folders';
						}
					},
					settingsMenu: {
						name: 'settingsMenu',
						$el: TvrUi.stat.settingsMenu,
						run: TvrUi.hide_folders_or_settings,
						args: ['settings', 'right'],
						closeException: function($clicked){

							if (TvrUi.doNotCloseSettingsMenu){
								TvrUi.doNotCloseSettingsMenu = false;
								//console.log('We abort the close');
								return true;
							}

							return false;
						}
					},
					aiAssistant: {
						name: 'aiAssistant',
						$el: TvrUi.stat.aiAssistant,
						run: TvrUi.hide_folders_or_settings,
						args: ['ai', 'right'],
						closeException: function($clicked){

							if (TvrUi.doNotCloseSettingsMenu){
								TvrUi.doNotCloseSettingsMenu = false;
								//console.log('We abort the close');
								return true;
							}

							return false;
						}
					},
					picker: {
						name: 'picker',
						$el: TvrUi.stat.styleComponents.find('.sp-container'),
						run: TvrUi.picker_method,
						args: ['hide']
					},
					units: {
						name: 'units',
						$el: MTwidget.stat.cssUnitMenu,
						run: MTwidget.hide_unit_menu,
						args: []
					},
					phpSyntax: {
						name: 'phpSyntax',
						$el: TvrUi.stat.phpSyntax,
						run: MTfolder.hide_popdown_content,
						args: [TvrUi.stat.phpSyntax]
					},
					logicAnalysis: {
						name: 'logicAnalysis',
						$el: TvrUi.stat.logicAnalysis,
						run: MTfolder.hide_popdown_content,
						args: [TvrUi.stat.logicAnalysis]
					},


				},
				popupKeys = Object.keys(popups);

			// check all elements that can be expanded
			for (var i = 0; i < popupKeys.length; i++) {

				var popupKey = popupKeys[i],
					item = popups[popupKey],
					popupName = item.name,
					$popup = item.$el,
					popupShowing = TvrCom.isDomEl($popup) && $popup.hasClass('expanded');

				//console.log('we check popup', popupName, popups, item, $clicked);

				if (popupShowing && // if the popup is showing
					(!item.closeException || !item.closeException($clicked)) && // there is no reason to make an exception
					toggleForPopup !== popupName &&  // popup toggle wasn't clicked
					!$.contains($popup[0], $clicked[0]) && // content inside the popup wasn't clicked
					!$popup[0].isSameNode($clicked[0]) // popup container wasn't clicked
				){

					//console.log($popup[0], 'does not contain', $clicked[0])

					//console.log('we run close function for', toggleForPopup, popupName, item, $clicked.attr('id'));

					// we don't close any panel if an auto-complete option has been used as that
					// only shows when something else is clicked, possibly content within the popup
					if (!TvrCom.isDomEl($clicked.closest('.ui-autocomplete'))){
						item.run.apply(this, (item.args || []));
					}
				}
			}

			// fix bug where combo closed but slider didn't when clicking on a draggable item
			if ($clicked.hasClass('grid-control') || $clicked.hasClass('pg-icon-grid')){
				MTwidget.hide_slider_set();
			}

			TvrCom.endT(arguments)
		},

		// manually close an open tooltip, returning it's title to normal
		close_tooltip: function($trigEl, $tt){

			$trigEl
				.attr('title', $tt.text()) // return title to normal
				.removeAttr('aria-describedby'); // remove tooltip attribute

			// remove tooltip from dom
			$tt.remove();
		},


		/*** reset certain global vars to defaults when no selectors exist ***/
		reset_global_vars: function(){ TvrCom.startT(arguments);

			TvrUi.selInFocusID = '';
			TvrUi.menuSelInFocusID = '';

			TvrUi.curSelCSS = '#mt-no-element';
			//console.log('reset curSelCSS via reset global vars to ', TvrUi.curSelCSS);

			TvrUi.intelli_css = '#mt-no-element';



			//console.log('reset intelli_css via reset global vars to ', TvrUi.intelli_css);
			//TvrUi.pref.pg_focus = ''; // why was this here?
			TvrCom.endT(arguments)
		},

		// update global vars
		update_global_vars: function(M, config){ TvrCom.startT(arguments);


			TvrUi.prevSelInFocusID = TvrUi.selInFocusID;
			TvrUi.selInFocusID = M.selectorID;

			// Log if the selection changed so that we can save the current selection as a revision
			// which ensures that AI "retry" applies to the same element
			if (TvrUi.prevSelInFocusID && TvrUi.prevSelInFocusID !== TvrUi.selInFocusID){
				TvrUi.selInFocusIDChanged = 1;
				//console.log('element selection changed from', TvrUi.prevSelInFocusID, ' to ->', TvrUi.selInFocusID);
			}

            TvrUi.menuSelInFocusID = TvrUi.selInFocusID.replace('opts', 'strk');

			TvrUi.curSelCSS = TvrCom.custom_escape_quotes(M.selectorCode);
			//console.log('Updated curSelCSS via update_global_vars to ', TvrUi.curSelCSS);

			//TvrUi.intelli_css = TvrUi.curSelCSS; // ensure intelli is either ahead or at least as up to date as curSelCSS
			//console.log('Updated TvrUi.intelli_css to match curSelCSS via update_global_vars to ', TvrUi.intelli_css);

			// update the prev folder for
			TvrUi.curSec = M.sectionSlug;
			MTfolder.updatePrevFolder(M.sectionSlug);

			// if user holds shift to target multiple elements, anchor from current selector
			TvrUi.previous_selector = M.selectorCode; // TvrUi.curSelCSS;

			// cache elements the current selector targets
			TvrUi.curSelEls = TvrUi.iframeEditing() ? MTF.jquery_compat_sel_elements(TvrUi.curSelCSS) : {};

			// don't record temporary selectors - this means we can return to last_viewed_selector on draft cancel
			if (!TvrUi.retargetSelector && !TvrUi.draftSelector.atts.id){
				TvrUi.save_last_viewed_selector(TvrUi.selInFocusID);
			}

			// update the folder > selector trail
			//console.log('updating the global vars')
			TvrUi.update_current_selector_controls(M, false, config);

			// add or remove item-disabled classes from folder and selector
			TvrUi.update_cur_item_apply_state(M, 'both');

			TvrCom.endT(arguments)
		},

		prepareDisabledOrNotLoadingWarning: function(M){

			var  isCurrentFolder = TvrUi.is_cur('section', M.sectionSlug);

			// warn if current selector or folder is not loading
			//console.log('notify', isCurrentFolder, MTfolder.folderNotLoading(M.sectionSlug), M.sectionSlug)
			if (!TvrUi.folderLoadingWarningDone && isCurrentFolder && MTfolder.folderNotLoading(M.sectionSlug)){
				MTsave.log({
					'short': TvrLang.folder_not_loading,
					'long': '<p>'+TvrLang.folder_not_loading_long+'. <span class="link view-current-folder-options">View folder options</span></p>' +
						'<p><b>Help videos:</b></p>' +
						'<ul><li><a target="_blank" href="https://themeover.com/automatic-page-speed-optimisation/">Automatic page speed</a></li>' +
						'<li><a target="_blank" href="https://themeover.com/load-wordpress-css-on-specific-pages/">Customing folder conditions</a></li></ul>',
					'type' : 'warning'
				});
				TvrUi.folderLoadingWarningDone = true;
			}

			// warn if current selector or folder is disabled
			else {

				var disWarn = [],
					i = -1;

				if (isCurrentFolder && TvrUi.is_dis(M.sectionM)){
					disWarn[++i] = TvrLang.folder_disabled;
				} if (TvrUi.is_cur('selector', M.selectorID) && TvrUi.is_dis(M.selectorM)){
					disWarn[++i] = TvrLang.selector_disabled;
				}

				for (var i in disWarn){
					if ( ! disWarn.hasOwnProperty(i) ) continue; // for compat
					var status = {
						'short': disWarn[i],
						'long': '<p>'+TvrLang.enable_with_icon+'</p>',
						'type' : 'warning'
					}
					MTsave.log(status);
					TvrUi.folderDisabledWarningDone = true;
				}
			}
		},


		update_cur_item_apply_state: function(M, level){

			if (!M){
				return false;
			}

			//console.log('check for disabled', TvrUi.is_dis(M.selectorM), TvrUi.stat.curSelInput.hasClass('item-disabled'))

			// is the folder disabled?
			if ((level === 'section' || level === 'both') && TvrUi.is_cur('section',  M.sectionSlug)){

				var secDisabled = TvrUi.is_dis(M.sectionM),
					secNotLoading = MTfolder.folderNotLoading(M.sectionSlug),
					secIsConditional = !MTfolder.folderIsEffectivelyGlobal(M.sectionSlug),
					secHasDisabledClass = TvrUi.stat.curSecTrailText.hasClass('item-disabled'),
					add = '',
					remove = '';

				// check if disabled
				if (secDisabled){
					add+= ' item-disabled';
				} else {
					remove+= ' item-disabled';
				}

				// check if conditional
				if (secIsConditional){
					add+= ' item-conditional';
				} else {
					remove+= ' item-conditional';
				}

				// check if not loading
				if (secNotLoading){
					add+= ' item-not-loading';
				} else {
					remove+= ' item-not-loading';
				}

				// add or remove classes
				if (add){
					TvrUi.stat.curSecTrailText.addClass(add);
				} if (remove){
					TvrUi.stat.curSecTrailText.removeClass(remove);
				}

				//console.log('Is conditional', M.sectionSlug, secIsConditional, add, remove);


				/*if (secDisabled && !secHasDisabledClass){
					TvrUi.stat.curSecTrailText.addClass('item-disabled');
				} else if (!secDisabled && secHasDisabledClass){
					TvrUi.stat.curSecTrailText.removeClass('item-disabled');
				}*/
			}

			// is the selector disabled? (won't be defined when toggling a section disabled icon)
			if (M.selectorM && (level === 'selector' || level === 'both') && TvrUi.is_cur('selector',  M.selectorID)){
				if (M.selectorM){
					var selDisabled = TvrUi.is_dis(M.selectorM),
						selHasDisabledClass = TvrUi.stat.curSelInput.hasClass('item-disabled');

					if (selDisabled && !selHasDisabledClass){
						TvrUi.stat.curSelInput.addClass('item-disabled');
					} else if (!selDisabled && selHasDisabledClass){
						TvrUi.stat.curSelInput.removeClass('item-disabled');
					}
				}
			}

		},

		save_last_viewed_selector: function(selInFocusID){

			//console.log('recording last_viewed_selector', TvrUi.selInFocusID, $.extend(true, {}, TvrUi.retargetSelector),  $.extend(true, {}, TvrUi.draftSelector.atts))

			// save last viewed selector
			TvrCom.updateObject(TvrUi.uiData, ['non_section', 'meta', 'last_viewed_selector'], selInFocusID);

			// remember last viewed selector without having to do full save
			if (!TvrUi.dontLogSelectorChange){
				MTsave.silent_save('', [{
					trail:['non_section', 'meta', 'last_viewed_selector'],
					action: 'replace',
					data: selInFocusID
				}]);
			}
		},

		// get menu object from selInFocusID
		menu_object: function(selInFocusID){
			return $('#' +selInFocusID.replace('opts', 'strk'));
		},
		// get section slug from selInFocusID - note this updates global meta var
		section_slug: function(selInFocusID){

			if (!selInFocusID){
				return false;
			}

			let match = selInFocusID.match(/(?:strk|opts)-([^-]+)-/);

			//console.log('section_slug selInFocusID', selInFocusID, match);

			return match ? match[1] : false;


			/*var $sel = $('#'+selInFocusID);
			if (!TvrCom.isDomEl($sel)){
				return false;
			}
			var	M = TvrUi.get_meta( $('#'+selInFocusID), 'selector');
			return M.sectionSlug;*/
		},
		// check if current folder, selector...
		is_cur: function(check, item){
		    if (!TvrCom.hasValue(TvrUi.selInFocusID)){
		        return;
            }
			if (check == 'section'){
				if (item == TvrUi.section_slug(TvrUi.selInFocusID)) return true;
			} else if (check == 'selector'){
				if (item == TvrUi.selInFocusID) return true;
			}
			return false;

		},

		viewCurrentFolderLoading: function(){
			// view-current-folder-options
			var $currentFolder = TvrUi.stat.mainMenuInner.find('li.section-tag.in-focus');
			if ($currentFolder.length){
				TvrUi.toggle_folder_more_options($currentFolder.find('.toggle-folder-more-options'));
			}
		},

		// check if item is disabled
		is_dis: function($obj){
			return $obj.hasClass('item-disabled');
		},

		// get the selector trail as an array, accounting for ' > ' and ' '
		sel_trail: function(code){

			//console.log('The code we split', code);

			//code = TvrCom.regular_escape_quotes(code);

			// the complicated stuff with the + section ensures there is no match on + chars inside brackets
			// this is necessary to ensure no split on e.g. :nth-child(-n+1)
			var splitPattern = /\s?>\s?|\s?\+(?![^(]*\))\s?|\s?~\s?|\s/g,

				// we need an array of the strings we split on for proper joining
				// otherwise > dividers were getting stripped out
				splitMatches =  TvrCom.get_all_matches(code, splitPattern, 0);

			return {
				pieces: code.split(splitPattern),
				splitMatches: splitMatches
			};
		},

		/*** show in-program docs ***/
		load_css_ref: function($clicked){ TvrCom.startT(arguments);
			// load preview
			TvrUi.show_dialog($clicked);
			TvrCom.endT(arguments)
		},

		/*** launch google fonts ***/
		show_google_fonts_field: function($cusFontField){

			if (!$cusFontField.is(':visible')){
                /*$cusFontField.show('fast', function(){

                });*/
				$cusFontField.removeClass('hidden');
				TvrUi.adjust_scroll_buttons( TvrUi.get_pg_meta(), 'style');
			} else {
			    // the google field is already showing, the user expects menu selection to launch browser as it did before
                // so load browser, hopefully they will adjust to new system over time...
                TvrUi.show_dialog($cusFontField.find('.g-font'));
			}
		},

		hide_google_fonts_field: function($fontSelect, $cusFontField){
			TvrUi.gFontTarget.val('').prop('val', '');
			$cusFontField.addClass('hidden');
			TvrUi.adjust_scroll_buttons( TvrUi.get_pg_meta(), 'style');

			/*$cusFontField.hide('fast', function(){
                TvrUi.adjust_scroll_buttons( TvrUi.get_pg_meta(), 'style');
            });*/
		},

		/*** insert google font ***/
		insert_google_font: function(fontName){
            TvrUi.close_dialog();
			TvrUi.gFontTarget.val(fontName).focus(); // returning focus fixes an odd bug with Ctrl+S shortcut
			TvrUi.post_edit(TvrUi.gFontTarget);
			MTsave.ajax_save_settings({ $property: TvrUi.gFontTarget });
			//TvrUi.font_changed(TvrUi.gFontTarget);
		},

		/*** launch img uploader ***/
		/*launch_img_uploader: function($clicked){ //TvrCom.startT(arguments);
			wp.media.editor.send.attachment = function(props, attachment){
				var url = props.size ? attachment.sizes[ props.size ].url : attachment.url;
				TvrUi.update_bg_image($clicked, url);
			}
			//wp.media.editor.open($clicked);
			wp.media.editor.open('wpMediaFakePostID'); // so WP doesn't throw undefined error
		},*/

		mediaFrame: null,
		mediaFrameCustomised: false,
		launch_img_uploader: function ($clicked) {

			// Create the media frame if not already created
			if (!TvrUi.mediaFrame){

				TvrUi.mediaFrame = wp.media({
					title: 'Select or Upload Media',
					button: {
						text: 'Insert Image'
					},
					multiple: false // Set to true if you need to select multiple images
				});

				// Extend the media frame with a custom size menu
				TvrUi.mediaFrame.on('open', function () {

					if (!TvrUi.mediaFrameCustomised){

						//console.log('It opened', wp, TvrUi.mediaFrame)

						let sizes = ['thumbnail', 'medium', 'large', 'full']; // Add more sizes if needed
						let customSizeMenu = $('<div>', {
							class: 'custom-size-menu',
							css: {
								transform: "translateY(-2px)"
							}
						});

						//customSizeMenu.append('<p>Select Image Size:</p>');
						let sizeSelect = $('<select>', { id: 'tvr-image-size-select' });
						sizes.forEach(function (size) {
							let text = size.charAt(0).toUpperCase() + size.slice(1);
							if (text === 'Full'){
								text+= ' size';
							}
							sizeSelect.append(
								$('<option>', {
									selected: size === 'full',
									value: size,
									text: text
								})
							);
						});
						customSizeMenu.append(sizeSelect);

						// Insert the menu into the media frame
						$('.media-toolbar-primary').last()
							.css({
								display: "grid",
								gridAutoFlow: "column",
								placeItems: "baseline",
							})
							.prepend(customSizeMenu);

						TvrUi.mediaFrameCustomised = true;
					}


				});

				// Handle the selection event
				TvrUi.mediaFrame.on('select', function () {
					const selection = TvrUi.mediaFrame.state().get('selection').first().toJSON();
					const selectedSize = $('#tvr-image-size-select').val(); // Get the selected size

					//console.log('selectedSize', selectedSize, selection.sizes)
					const url =
						selectedSize && selection.sizes && selection.sizes[selectedSize]
							? selection.sizes[selectedSize].url
							: (selection.sizes.full ? selection.sizes.full.url : selection.url);

					TvrUi.update_bg_image($clicked, url);
				});

			}

			// Open the media frame
			TvrUi.mediaFrame.open();
		},


		/*** update bg image ***/
		update_bg_image: function($obj, val){

		    var M = TvrUi.get_meta($obj, 'property'),
                $input = M.property.find('.property-input');

		    //console.log('the image', val, val.indexOf(TvrUi.siteUrl) > -1, TvrUi.siteUrl, val, TvrCom.root_rel(val, TvrUi.siteUrl));

		    // make root rel if URL is current site
		    val = TvrCom.root_rel_if_local(val, true);

			//console.log('val after adjust', val);

			val = 'url("'+val+'")';

			// set input field
			$input.val(val);

			// adjust the comp span
			TvrUi.adjust_comp_span($input, 'after');

			// scroll to right of input
			TvrCom.scroll_input_end($input);

			// save settings
			MTsave.ajax_save_settings({ $property: $input });

		},

		/*** clear bg image ***/
		clear_bg_image: function($clicked){ TvrCom.startT(arguments);
			TvrUi.update_bg_image($clicked, '');
			TvrCom.endT(arguments)
		},

        /*
        ANIMATION FUNCTIONS
         */

        // get the current field value for animation name
        get_animation_name: function(M){
            return M.groupTab.find('input.property-input').val();
        },

        // refresh JS animation event binding on frontend
        refresh_event_binding: function(){

            if (TvrUi.iframeEditing() && MTF.stat.win.MT_Events_Manager){
                MTF.stat.win.MT_Events_Manager.refresh_event_binding();
            }
        },

        // user clicks play animation / transition button
        user_play: function(settings, $play, userAction, isInline){

            var animationConfig = settings.animationConfig;

            if (TvrUi.iframeEditing() && animationConfig.flashCSSRules && animationConfig.animationName){
                // note: we pass in root selector wth no event qualifier (eventlessCSS) so play button always works
                MTF.trigger_animation(animationConfig, isInline);
            }

            // console.log( 'the AST/CSS', settings, animationConfig.flashCSSRules, animationConfig.animationName );

            /*// resume if paused (remove pause style node)
			if ($play.hasClass('paused')){

                if (userAction == 'buttonClick'){
                    $play.removeClass('paused');
                    MTF.resume_animation();
                }
            }

            // pause if already running (add pause style node)
            else if ($play.hasClass('active')){

                if (userAction == 'buttonClick'){
                    $play.addClass('paused');
                    MTF.pause_animation(settings);
                }
            }

            // else play (add animation style node)
			else {

                if (group == 'animation' && settings.css && TvrUi.get_animation_name(M)){
                    // note: we pass in root selector wth no event qualifier (eventlessCSS) so play button always works
                    MTF.trigger_animation(settings);
                }
			}
			*/

        },

        // show play progress
        // todo come back to this later when adding GUI keyframe management and timeline as pausing might clash
        // first try was a bit buggy, suggesting it would be complex to handle all the edge cases
        /*update_play_progress: function(action, config){

            console.log('play progress', action, config);

            var M = config.M,
                $playWrap = M.groupTab.find('.anim-play-wrap'),
                $play = $playWrap.find('.play-icon'),
                durationProp = M.groupSlug+'-duration',
                durationValue = M.groupTab.find('input.'+durationProp).val();

            if (action === 'start'){
                $play.addClass('active').css(durationProp, durationValue);
            } else {
                $play.removeClass('active paused');
            }
        },
        */

        // scroll snap points (neatly before a child element)
        mt_scroll: {
            style: {
                offsets:[],
                rightPositions:[],
                rightPosIndex:-1
            },
            responsive: {
                offsets:[],
                rightPositions:[],
                rightPosIndex:-1
            },
            gridcolumns: {
                offsets:[],
                rightPositions:[],
                rightPosIndex:-1
            },
            gridrows: {
                offsets:[],
                rightPositions:[],
                rightPosIndex:-1
            }
        },

        // scroll row horizontally (e.g. style options, responsive tabs)
        scroll_row: function($clicked){

            // border has fixed flex container, so use fluid parent width for assessing screen width
            var $fluidContainer,
                $flexContainer,
                type = $clicked.data('type');

            // style options scroller
            if (type === 'style' || type === 'gridcolumns' || type === 'gridrows') {

                var M = TvrUi.get_pg_meta();
                if (!M){
                    return false;
                }

                if (type === 'style' ){
                    $fluidContainer = M.groupTab;
                    $flexContainer = M.groupTab.find('.pg-inner');
                } else {
                    $fluidContainer = M.group.find('.tab-control-'+TvrUi.pref.grid_focus+'.'+type).find('.mt-variable-line');
                    $flexContainer = $fluidContainer.find('.mt-vl-inner');
                }

            }

            // responsive tabs
            else if (type === 'responsive'){
                $fluidContainer = TvrUi.stat.res.find('.query-tabs-wrap');
                $flexContainer = TvrUi.stat.res.find('.query-tabs');
            }

            if ($flexContainer){

                // calc how much the content overflows
                var excess = TvrUi.get_row_excess($fluidContainer, $flexContainer, type);

                // no need to scroll if there is room for full content
                if (!excess){
                    return false;
                }

                // correction for buttons
                excess = excess;

                var viewWidth = $fluidContainer.width(),

                    // convert margin to positive integer for calculations (margin will always be 0 or neg)
                    curMarginLeft = Math.abs(parseInt($flexContainer.css('marginLeft'))),
                    marginLeft;


                /* SCROLL LEFT */
                if ($clicked.hasClass('mt-scroll-left')){

                    marginLeft = TvrUi.mt_scroll[type].rightPositions[TvrUi.mt_scroll[type].rightPosIndex-1];

                    if (TvrCom.isDefined(marginLeft)){
                        TvrUi.mt_scroll[type].rightPositions.splice(TvrUi.mt_scroll[type].rightPosIndex, 1);
                        TvrUi.mt_scroll[type].rightPosIndex--;
                    } else {

                        // reset
                        marginLeft = 0;
                        TvrUi.mt_scroll[type].rightPositions = [];
                        TvrUi.mt_scroll[type].rightPosIndex = -1;
                    }

                    //console.log('scroll left', marginLeft, $.extend(true, {}, TvrUi.mt_scroll[type]))
                }

                /* SCROLL RIGHT */
                else {

                    var maxOffset = curMarginLeft + (viewWidth),
                        scrollRight = (excess < maxOffset) ? excess : maxOffset;

                    //console.log('maxOffset, excess, scrollRight', maxOffset, excess, scrollRight)

                    // snap to an offset
                    var offsets = TvrUi.mt_scroll[type].offsets;
                    for (var i = 0; i < offsets.length; i++) {
                        var offset = offsets[i];

                        // we snap to content just before our scroll position
                        if (offset > scrollRight){

                            var prevkey = i-1,
                                prevOffset = offsets[prevkey],
                                nextOffset = offsets[i];

                            // use prev snap point if next point exceeds maxOffset (and prev still moves us forward)
                            scrollRight = (prevOffset > curMarginLeft && nextOffset > maxOffset)
                                ? prevOffset
                                : nextOffset;

                            break;
                        }

                    }

                    // bail if no further right scroll necessary
                    if (curMarginLeft === scrollRight){
                        return false;
                    }

                    // save right scroll positions for left scroll revert
                    TvrUi.mt_scroll[type].rightPositions.push(scrollRight);
                    TvrUi.mt_scroll[type].rightPosIndex++;

                    marginLeft = scrollRight;

                    //console.log('scroll right', marginLeft, curMarginLeft, $.extend(true, {}, TvrUi.mt_scroll[type]))
                }

                // make negative
                marginLeft = marginLeft*-1;

                //console.log('excess', excess, marginLeft)
                //console.log('TvrUi.mt_scroll', TvrUi.mt_scroll)
                $flexContainer.css('marginLeft', marginLeft+'px');
            }

        },

        // should row scroll buttons show or be hidden?
        adjust_scroll_buttons: function(M, type){ TvrCom.startT(arguments);

        	if (!M && type !== 'responsive'){
        		return false;
			}

            var $fluidContainer,
                $flexContainer,
                $scrollButtons,
                exclude = false,
                excess,
                hasGridLines = false;

            switch(type) {
                case 'style':
                    $fluidContainer = TvrUi.get_group(M);
					//console.log('$fluidContainer', type, $fluidContainer, M, TvrUi.pref.m_queries, window.TvrMQsCombined);
                    $flexContainer = $fluidContainer.find('.pg-inner');
                    $scrollButtons = M.selector.find('li.scroll-lr-buttons-'+type);
                    exclude = (M.groupSlug === 'code' || M.groupSlug === 'grid'); //|| M.groupSlug === 'grid'
                    hasGridLines = M.groupSlug === 'grid';
                    break;
                case 'responsive':
                    $fluidContainer = TvrUi.stat.res.find('.query-tabs-wrap');
                    $flexContainer = TvrUi.stat.res.find('.query-tabs');
                    $scrollButtons = TvrUi.stat.res.find('div.scroll-lr-buttons');
                    break;
                case 'gridcolumns':
                case 'gridrows':
					// todo the calc of the container size is wrong - we need pg-inner and the columns label bounding info to calc
                    $fluidContainer = M.group.find('.tab-control-'+TvrUi.pref.grid_focus+'.'+type).find('.mt-variable-line');
                    $flexContainer = $fluidContainer.find('.mt-vl-inner');
                    $scrollButtons = M.selector.find('li.scroll-lr-buttons-'+type);
                    break;
                default:
                // code block
            }

            //console.log('we run the scroll things', type, $fluidContainer, $flexContainer, $scrollButtons)

            if (!$flexContainer){
                return false;
            }

            excess = TvrUi.get_row_excess($fluidContainer, $flexContainer, type, 'checkShow');

           //console.log('excess', excess)

			$fluidContainer.removeClass('pending-overflow-check');

            if (excess && !exclude){
                $scrollButtons.addClass('buttons-showing');
                $fluidContainer.addClass('hor-scroll-needed');
                TvrUi.mt_scroll[type].rightPositions = [];
            } else {
                // reset left margin so full content displays in available space
                TvrUi.mt_scroll[type].rightPositions = [];
                TvrUi.mt_scroll[type].rightPosIndex = -1;
                $flexContainer.css('marginLeft', '0px');
                $scrollButtons.removeClass('buttons-showing');
                $fluidContainer.removeClass('hor-scroll-needed');
            }

            // for CSS grid, check row and column scroll buttons
            if (hasGridLines){
                TvrUi.adjust_grid_line_scroll_buttons(M);
            }

			TvrCom.endT(arguments);
        },

        adjust_grid_line_scroll_buttons: function(M){
            TvrUi.adjust_scroll_buttons(M, 'gridcolumns');
            TvrUi.adjust_scroll_buttons(M, 'gridrows');
        },

        // total width must be calc from flex items and compared with container width
        get_row_excess: function($fluidContainer, $flexContainer, type, context){ TvrCom.startT(arguments);

        	//TvrCom.callStack();

            var containerWidth = $fluidContainer.width(), // correction for buttons (this has continuous scroll side effect)
                totalItemsWidth = 0,
                excess,
                scrollOffsets = [],
                longestRow = 0,
				isAmender = $fluidContainer.hasClass('property-html'),
                isGridGroup = $fluidContainer.hasClass('property-grid'),
                $items = !isGridGroup
                    ? $flexContainer.children()
                    : $flexContainer.children().filter('.tab-control-'+TvrUi.pref.grid_focus);

            // todo scroll offsets need to be adjusted for border and CSS grid
            // and margin left needs to be applied to grid control too
            // button need to be checked when switching pg tab
            // custom properties on nth-child need sorting

            $items.each(function(i){


				if (!isAmender || i < 3){

					var $this = $(this);

					//console.log('is it really visible', $this.attr('class'), $this.css('opacity'))

					if ($this.is(':visible') && parseInt($this.css('opacity'))){
						//console.log('we should add to total', $this.outerWidth(true), $this.attr('class'), $this.css('opacity'))
						totalItemsWidth+= $this.outerWidth(true); // include L/R margin
						scrollOffsets.push(totalItemsWidth);
					}
				}


            });

            // border flex container holds two rows, not one, so divide total width of items by 2
            if ($fluidContainer.hasClass('property-border') || isGridGroup){

                //console.log('we got the border scroll buttons', totalItemsWidth, (totalItemsWidth / 2))

                totalItemsWidth = totalItemsWidth / 2;

                /*if (isGridGroup){
                    totalItemsWidth+= 178 + 142 + 347;
                }*/
                // 178 + 142 + 347
            }

            //totalItemsWidth = 1390;

            // account for buttons too (if they are actually needed - so button width doesn't require buttons unnecessarily)
			//console.log('totalItemsWidth, containerWidth', totalItemsWidth, containerWidth, 'diff', (totalItemsWidth - containerWidth))
			if ( (totalItemsWidth - containerWidth) > 1 ){
				totalItemsWidth+= 10+40;
			}

            excess = totalItemsWidth - containerWidth;

            TvrUi.mt_scroll[type].offsets = scrollOffsets;
			TvrCom.endT(arguments);

           //console.log('calc', totalItemsWidth, containerWidth, excess, TvrUi.mt_scroll[type], $flexContainer, $fluidContainer, $items);

            return (excess > 1) ? excess : false;


        },
		
		// generic function for level (e.g. sec, sel, group, subgroup, property) specific toggle
		input_icon_toggle: function($clicked, autoSync, noSaveOrHistory){ TvrCom.startT(arguments);

		    var $inputMarker = $clicked, // el for placing hidden input next to, will be different for tab.
                $inputTracker,
				type = $clicked.attr('data-input-type'),
				level = $clicked.attr('data-input-level'),
                metaLevel = level === 'pgtab' ? 'group' : level,
				action = TvrUi.title($clicked),
				turnOn = !$clicked.hasClass('active') ? 1 : '',
                nthIndex = false,
				trackerClass = type+'-tracker',
				trackerValue = 1, // most are 1 but css grid nth item needs a meaningful index
				M,
				maybeUpdateEditor = false,
                settings = {
                    domDepth:level,
                    maxDepth: 'selector',
                    clean:{},
                    cleanMaxDepth: 'selector'
                },
				historyIsNull = false,
				nameAtt,
                isMQ;

			// set MQ stub for various inputs. Tabkey may not be one in focus when disabling, but will be for all other
			var tabKey = (type === 'disabled' && level === 'tab')
				    ? TvrUi.context_menu_data.mq_key //$clicked.closest('.mq-tab').attr('rel')
                    : TvrUi.get_mq_focus(),
                inputStems = TvrUi.get_input_stems(tabKey),
                mq_stem = inputStems.mq,
                imp_key = inputStems.imp;

			//console.log('the context menu data and key', tabKey, TvrUi.context_menu_data);

			// important toggle
			if (type === 'important'){
				M = TvrUi.get_meta($clicked, 'property');
				nameAtt = 'tvr_mcth[non_section][important]'+imp_key
				+'['+M.sectionSlug+']['+M.selectorSlug+']['+M.groupSlug+']['+M.propertySlug+']';
				var propIndex = TvrCom.get_name_attr_index(
                    M.property.find('input.property-input').attr('name')
				);

				// support !important with array values
                if (propIndex !== false){
                    nameAtt+= '['+propIndex+']';
                    //console.log('index', index, settings.clear.selector)
                }

                //settings.onlyRecurse = true;
                settings.mq_key = tabKey;
                settings.recurse_key = ['important'];
                settings.clean.selector = [];
                maybeUpdateEditor = true;
			}

			// pie toggle
			/*else if (type === 'pie'){
				M = TvrUi.get_meta($clicked, 'selector');
				nameAtt = M.selectorM.find('input.register-selector').attr('name')+'['+type+']';
                settings.incRecurse = false;
                settings.clean.selector = [[type]];
			}*/

			// disabled toggle
			else if ( type === 'disabled' ){

				maybeUpdateEditor = true;

				// we want to do full client SASS compile with sec/sel/tab disable
				settings.itemWasDisabled = level;

			    var $obj;

				M = TvrUi.get_meta_for_context($clicked, metaLevel);

				// M may be undefined when using the responsive tab icons when no sels are present
				if (!M){
					return;
				}

				// tab is a bit different because the tabs are outside of the options
				/*if (level === 'tab'){
					M = TvrUi.get_meta($('#'+TvrUi.selInFocusID), 'selector');
				} else {

				}*/

				if (level === 'section'){
                    $obj = TvrUi.disabled_quick_edit(M.sectionM, level, M);
                    nameAtt = $obj.find('input.section-data-label').attr('name').replace('[label]', '['+type+']');
				}

				else if (level === 'selector'){
					$obj = TvrUi.disabled_quick_edit(M.selectorM, level, M);
					nameAtt = $obj.find('input.selector-label').attr('name').replace(/\[label\]$/, '['+type+']');
                    settings.clean.selector = [[type]];

					TvrUi.maybe_save_draft_selector_before_action(M, 'selector', 'disable');
				}

				else if (level === 'tab'){
					$obj = TvrUi.stat.res.find('.mq-tab-'+tabKey); // $clicked.closest('.mq-tab');
					trackerClass+= '-'+tabKey; // class needs tab identifier
					nameAtt = mq_stem + '['+ M.sectionSlug+']['+ M.selectorSlug+'][tab]['+type+']';
					// place disabled input in selector menu as options for tab may not have loaded
					$inputMarker = M.selectorM.find('span.disabled-responsive-tabs');
                    settings.domDepth = 'selector';

                    settings.mq_key = tabKey;
                    settings.onlyRecurse = (tabKey !== 'all-devices');
                    settings.incRecurse = settings.onlyRecurse;
                    settings.recurse_key = ['m_query'];

                    settings.clean.selector = [['tab'],[type]];
				}

				else if (level === 'subgroup' || level === 'pgtab'){

				    $obj = $clicked.closest('span.quick-opts-wrap');

					var isPgTab = level === 'pgtab',
                        tabGroup = isPgTab ? $clicked.data('tab-group') : false,
                        disable_type = isPgTab ? 'pgtab_'+type: 'pg_'+type,
                        disable_key = isPgTab ? $clicked.data('tab-group') : M.subgroupSlug;

					nameAtt = mq_stem + '['+ M.sectionSlug+']['+ M.selectorSlug+']['+disable_type+']['+disable_key+']';
                    settings.domDepth = 'group';

                    settings.mq_key = tabKey;
                    settings.onlyRecurse = (tabKey !== 'all-devices');
                    settings.incRecurse = settings.onlyRecurse;
                    settings.recurse_key = ['m_query'];

                    settings.clean.selector = [[disable_type], [disable_key]];

                    // limit clear to values[index] if fields are in array format
                    nthIndex = TvrUi.maybe_add_nth_index_filter(isPgTab, tabGroup, M, $clicked, settings.clean.selector);

                    // the index will be used for only disabling the relevant nth item with css grid
                    if (nthIndex !== false){
                        //trackerValue = nthIndex;
                        nameAtt+= '['+nthIndex+']';
					}

					// for history
					if (isPgTab){
						level = 'group';
					}

					//console.log('Disable the thing', settings, nameAtt, $clicked, $obj, nthIndex)

				}

				else if (level === 'script'){
					$obj = $clicked.closest('div.item-row');
					nameAtt = 'tvr_preferences[enq_js]['+
					TvrCom.convert_to_param($obj.find('.script-name').text(), '')+'][disabled]';
				}

			}

			// chain toggle
			else if (type === 'chained'){

				maybeUpdateEditor = true;

				M = TvrUi.get_meta($clicked, 'subgroup');

				// sync existing fields - use last edited property or first defined input
				if (turnOn){

					var $subgroupInputs = TvrUi.get_subgroup_or_tabgroup(M, 'inputs'),
						$anyDefinedInput,
						$lastEditedInput = TvrCom.isDomEl(TvrUi.inputWaitingObj) ? TvrUi.inputWaitingObj : false,
						lastEditedVal = $lastEditedInput ? $lastEditedInput.val() : '',
						lastEditedValDefined = TvrCom.isDefined(lastEditedVal),
						$inputToSync;

					// loop them in reverse to first defined val is used
					$.fn.MTreverse = [].reverse;
					$subgroupInputs.MTreverse().each(function(index){

						var $subInp = $(this),
							subInpVal = $subInp.val();

						// try to use last edited value if retrievable
						if (lastEditedValDefined && $subInp.attr('name') === $lastEditedInput.attr('name')){
							$inputToSync = $lastEditedInput;
						}

						// if another value is defined use that - the loop is in reverse so if first input has a value
						// that will be used
						if (TvrCom.isDefined(subInpVal)){
							$anyDefinedInput = $subInp;
						}

						//console.log('$subInp, subInpVal, $anyDefinedInput', $subInp, subInpVal, $anyDefinedInput);

					});

					// use last edited if part of subgroup, or default to the first defined element in the subgroup
					if ($anyDefinedInput){
						$inputToSync = $inputToSync ? $inputToSync : $anyDefinedInput;

						// get CSS unit if relevant
						var cssUnit = undefined,
							$unitInput = $inputToSync.closest('.property-tag').find('.css_unit-tracker');

						if (TvrCom.isDomEl($unitInput)){
							cssUnit = $inputToSync.closest('.property-tag').find('.css_unit-tracker').val();
						}

						TvrUi.sync_fields($inputToSync, M, cssUnit);
					}

				}

				nameAtt = mq_stem + '['+ M.sectionSlug+']['+ M.selectorSlug+'][pg_'+type+']['+M.subgroupSlug+']';
                settings.domDepth = 'group';
                settings.mq_key = tabKey;
                settings.recurse_key = ['m_query'];
                settings.clean.selector = [['pg_'+type], [M.subgroupSlug]];

                /* no chainable field have indexes yet
                // limit clear to values[index] if fields are in array format
                nthIndex = TvrUi.maybe_add_nth_index_filter(false, false, M, $clicked, settings.clean.selector);

                // the index will be used for only disabling the relevant nth item with css grid
                if (nthIndex){
                    trackerValue = nthIndex;
                }*/

			}

			else if (type === 'flexitem' || type === 'griditem'){

				var $obj = $clicked.closest('div.property-fields');

				historyIsNull = true;

				// get M reference as subgroup label for history table formatting
				M = TvrUi.get_meta( $obj.find('div.sub-label'), 'group' );

                // we store on root sel always, hence just 'tvr_mcth'
				var nameAttCommon = 'tvr_mcth['+M.sectionSlug+']['+M.selectorSlug+']';
				nameAtt = nameAttCommon+'[pg_'+type+']';

                settings.domDepth = 'group';
                settings.mq_key = tabKey;
                settings.recurse_key = ['m_query'];
                settings.clean.selector = [['pg_'+type]];

                // grid container/item is a bit different - fields are fully reloaded,
                // so just update nth_item and pg_griditem and then reload and bail
                if (type === 'griditem'){

                    var quickSave = {};

                    // log pg_griditem
                    MTdd.fill_object_from_name(quickSave, nameAtt, turnOn);

                    // also log nth_item focus as 0 or 1 (item = 0, container default to 1)
                    var nth_item = turnOn ? 0 : 1;
                    MTdd.fill_object_from_name(quickSave, nameAttCommon+'[nth_item]', nth_item);

                    // quick save
                    MTsave.quick_save_data(false, quickSave);

                    // ensure items tab is selected
                    if (TvrUi.get_grid_focus() !== 'griditems'){
                        TvrUi.pref.grid_focus = 'griditems';
                    }

                    // reload group fields
                    TvrUi.trigger_pg_icon_click('grid');

                    // bail
                    return false;
                }
			}

			// if inactive add hidden input to dom
			if (turnOn) {

				// add the new hidden input to the dom and update span
				var inputTracker = '<input class="input-toggle-tracker '+trackerClass+'" type="hidden" name="'+nameAtt+'" value="'+trackerValue+'" />';
				$clicked.addClass('active');
				var classAction = 'add';
				var newTip = $clicked.attr('data-neg');

				// the disabled tab inputs are a set for all devices and MQs, so we don't have one marker for each
				if (type === 'disabled' && level === 'tab'){
					$inputMarker.append(inputTracker);
				}

				// add before
				else {
					$inputMarker.before(inputTracker);
				}

				// apply class to parent if disabling
				if (type === 'disabled'){
					$obj.addClass('item-disabled');
					TvrUi.update_cur_item_apply_state(M, level);
				}

				// apply class to property-fields wrapper if flexitem
				if (type === 'flexitem' || type === 'griditem'){
                    $obj.add(TvrUi.stat.grid).addClass('show-single-'+type);
				}

			}

			// if active remove hidden input and update toggle
			else {
				$clicked.removeClass('active');
				var classAction = 'remove';
				var newTip = $clicked.attr('data-pos');
                $inputTracker = $inputMarker.siblings('.' + trackerClass);

                // clear input before removing so dom to data can clear existing, then clean the empty key
                $inputTracker.val('');

				// apply class to parent if disabling
				if (type === 'disabled'){
					$obj.removeClass('item-disabled');
					TvrUi.update_cur_item_apply_state(M, level);
				} /*if (level === 'show_css_filters'){
					$clicked.removeClass('on expanded');
				}*/

				// apply class to property-fields wrapper if flexitem
				if (type === 'flexitem' || type === 'griditem'){
                    $obj.add(TvrUi.stat.grid).removeClass('show-single-'+type);
				}

			}

			// live update tooltip
			//TvrUi.refresh_tt($clicked, newTip); // maybe this isn't the right thing here

			// log history
			var iconL = MTsave.h_i_class(level, M),
				iconA = $clicked.attr('class'),
				valTT = false,
				sync = false,
				iconAC = false;

			// different icon for important
			if (type === 'important'){
				iconA+=' lg-icon';
				iconAC = '';

                // also, sync other fields with important if necessary
				sync = valTT = (TvrUi.chain_is_on(M)) ? M.subgroupH+' '+TvrLang.fields_sync : false;
				// only if we're not in an auto-sync already
				if (sync && !autoSync){
					TvrUi.sync_important(M, classAction);
				}
			}

			// sync flex container/item fields across responsive tabs
			/*else if ((type === 'flexitem' || type === 'griditem') && !autoSync){
				TvrUi.sync_responsive_flex_fields(type, M, $clicked, classAction);
			}*/

			/** Update JS Object - unless noSaveOrHistory, which handles JS object update **/
			if (!noSaveOrHistory){

				settings.M = M;

				// with chained, we want to pull in the dom els
				// for most we just convert nameAtt
				if (type !== 'chained'){
					settings.mtData = {};
					// convert input fieds to JS object format
					MTdd.fill_object_from_name(settings.mtData, nameAtt, turnOn);
				}

                // if script that needs to update preferences object
                if (level === 'script'){
                    $.extend(true, TvrUi.pref, settings.mtData);
                }

                // toggle that affects main js object
                else {

                    // we don't need to run ast stuff if auto-sync, this will happen after synced inputs have update js object
                    if (autoSync){
                        settings.return = 'mtData';
                    }

					//console.log('settings before ui toggle dom_to_data ', $.extend(true, {}, settings))

					settings = MTdd.dom_to_data(settings);

					//console.log('settings after ui toggle dom_to_data ', $.extend(true, {}, settings))

                }
			}

            // remove blank tracker input now that js data has had chance to update
            if (!turnOn){
                $inputTracker.remove();
            }

			// bulk e.g. !important toggle with clear/sync doesn't need to trigger save on each.
			if (!noSaveOrHistory && !autoSync){ // && level !== 'show_css_filters'

                if (!historyIsNull){
					settings = MTsave.user_action(settings, {
						'items': [level],
						'val': action,
						'valTT': valTT,
						'M': M,
						'pathTT': true, // level === 'section',
						'icon': iconA, // [{'icon': iconL}, {'icon': iconA, 'iconC': iconAC}]
					});
				}

				// if the editor is showing, update
                if (maybeUpdateEditor && MTlayout.editor_and_gui() && M && M.selector){ //
					MTace.gui_to_editor(false, M);
					//console.log('we update the editor', settings)
				}

				// the save config, which may get updated with the logic callback below
				var config = {
					settings: settings
				};

				// ensure that the folder loading is checked and media hack is applied if necessary
				// -- Now disabled / empty folders are flagged with logic so this is redundant I believe
				/*if (!turnOn && type === 'disabled' && level === 'section'){

					//console.log('Test folder logic', M);

					// add the logic test callback to the settings
					MTfolder.addSaveLogicCallback(
						M,
						true,
						config,
						true,
						$('#cm-edit-folder-options').find('.test-folder-logic')
					);

				}*/

				MTsave.ajax_save_settings(config);
			}



			TvrCom.endT(arguments)
		},

        get_input_stems: function(tabKey){

            var mq_stem = 'tvr_mcth',
                imp_key = '';

            if (tabKey !== 'all-devices'){
                mq_stem+= '[non_section][m_query]['+tabKey+']';
                imp_key = '[m_query]['+tabKey+']';
            }

            return {
                mq: mq_stem,
                imp: imp_key
            }
        },

		// when clearing or disabling css grid property, check if nth_item index needs to be added
		maybe_add_nth_index_filter: function(isPgTab, tabGroup, M, $clicked, arr){

			var $nextField = isPgTab
                    ? M.group.find('.property-tag.tab-control-'+tabGroup)
                        .first()
                    : $clicked
                        .closest('.subgroup-tag')
                        .next('.property-tag'),
                hasVariableLine = $nextField.hasClass('has-variable-line');

			// template columns/rows should all be cleared/disabled, not specific index
			if (hasVariableLine){
			    return false;
            }

            var $nextInput = $nextField.find('input.property-input'),
                index = TvrCom.isDomEl($nextInput)
                    ? TvrCom.get_name_attr_index($nextInput.attr('name'))
                    : false;

            if (index !== false){
                arr.push(['value'], [index]);
            }

			//console.log('maybe_add_nth_index_filter', index, $nextInput, $nextField, isPgTab, tabGroup, M, $clicked, arr)

            return index;
		},

		// return els in quick edit that should also show as disabled
		disabled_quick_edit: function($obj, level, M){

		    // is the current folder being disabled?
			if (level === 'section' && TvrUi.is_cur('section', M.sectionSlug)){
				$obj = $obj.add(TvrUi.stat.curSecTrailText);
			}

			// is the current selector being disabled?
			if (level === 'selector' && TvrUi.is_cur('selector', M.selectorID)) {
				$obj = $obj.add('#sel-in-focus');
			}

			return $obj;
		},



		/***
		 GENERIC MAIN UI FUNCTIONS
		 ***/

		// TOOLTIP FUNCTIONS

		tt_config: function(Component){
			return {
				position: {
					my: "center top",
					at: "center bottom+10",
					collision: "flipfit"
				},
				hide: false,
				show: {
					effect: "none",
					duration: 0,
					delay: TvrUi.tooltipDelay
				},
				create: function(e, ui){
					//console.log('tooltip created', ui, e)
				},
				open: function( e, ui ){ TvrCom.startT(arguments);

					// don't show tooltips when dragging a sortable menu item
					if (TvrUi.itemIsBeingDragged){
						MTlocal.clean_tooltips();
					}

					var $tooltip = TvrUi.get_tt(ui),
						$triggerEl = Component.get_tt_trigger(e, this),
						dynTTRoot = $triggerEl.data('dyn-tt-root'),
						$rootToggle = dynTTRoot ? $('#'+dynTTRoot) : false;

					// tag the tooltip to ensure we update the right one when dynamically changing
					$tooltip.data('mt-tt-trigger', (dynTTRoot ? $rootToggle : $triggerEl));

					// some tooltips need to display dynamic text not in the title
					// e.g. code_manual_resize and selname_code_synced - get from root element
					if (dynTTRoot) {
						//console.log('get title from root', $('#'+dynTTRoot).attr('title'), $('#'+dynTTRoot), $triggerEl)
						var title = $rootToggle.hasClass('on')
								? $rootToggle.data('neg')
								: $rootToggle.data('pos');

						if (!title){
							title = $rootToggle.attr('title');
						}

						$tooltip.html(title);
					}

					// formatting adjustments
					var content = $tooltip.find('.ui-tooltip-content').html();
					if (content){
						// fix issue with quotes in e.g. selectors being double escaped
						content = TvrCom.regular_escaped_to_non_escaped(
							content
								.replace(/&amp;/g, '&') // fix '&' escaping
								.replace(/\n/g, '<br />') // allow line breaks
						);

						$tooltip.html(content);
					}

					// tooltips get added to autocomplete, which causes glitches when triggered on last element
					// if scrollbars are needed. This fixes that by manually moving the tooltip to the body
					var $parent = $tooltip.parent();
					if (TvrCom.isDomEl($parent) && $parent[0].tagName.toLowerCase() !== 'body'){
						var triggerElOffset = $triggerEl.offset();
						$tooltip.appendTo('body');
						$tooltip.css({
							top: (triggerElOffset.top + 40)+'px',
							left: (triggerElOffset.left -40)+'px' // -40 to make it a bit more centered
						})
						//console.log('whe should move it', ui, $tooltip[0].outerHTML, $triggerEl.offset())
					}



					// tt pointer too often displays in wrong place - don't use for now
					/*
					 .append('<span class="tp-pointer"></span>');
					 var $pointer = $tooltip.find('.tp-pointer');
					 // pointer at top middle
					 if (TvrCom.isDomEl($triggerEl)){
					 $pointer.position({
					 my: "center center",
					 at: "center bottom+12",
					 of: $triggerEl
					 });
					 } else {
					 $pointer.hide();
					 }
					 */
					//console.log(ui);
					TvrCom.endT(arguments)
				},
				close: function( e, ui ){
					// reset cache references
					TvrUi.tt = false;
					TvrUi.tt_trigger = {};
				}
			}
		},

		// get the title from an element - trickier than normal because jquery tooltip removes title attr while showing tooltip
		title: function($obj){
			var title = $obj.data('ui-tooltip-title'); // get title from tooltip data store
			return title ? title : $obj.attr('title');
		},

		// get tooltip and save it
		get_tt: function(ui){
			return TvrUi.tt = ui.tooltip;
		},

		// update tooltip live or just title attr if tooltips are disabled
		// note I commented out two of these calls due to a bug with the wring tooltip updating,
		// and I thought change may be unnecessary anyway (just keeping for save revision feature)
		refresh_tt: function($trig, newTip, $aliasTrigEl){ TvrCom.startT(arguments);

			// accept multiple els
			$trig.each(function(i){

				var $this = $(this);

				if ( TvrUi.tooltipDelay == 'native' || !TvrUi.tt || ($aliasTrigEl && !$this.is($aliasTrigEl) ) ){

					$this.attr('title', newTip)

					// if dyn tt, we should update that now that root toggle has been updated
					if ($aliasTrigEl && $aliasTrigEl.data('dyn-tt-root')){
						TvrUi.update_tt(TvrUi.tt, newTip, $this)
					}

					//console.log('We refreshed the tooltip', $this, newTip, $aliasTrigEl, TvrUi.tt)

				} else {
					//console.log('Just update the live tooltip', newTip, TvrUi.tt)
					TvrUi.update_tt(TvrUi.tt, newTip, $this)
				}
			});

			TvrCom.endT(arguments)
		},

		// update tooltip content
		update_tt: function($tooltip, content, $trig){

			if (!TvrCom.isDomEl($tooltip) || !TvrCom.isDomEl($trig) || !$tooltip.data('mt-tt-trigger') || !$tooltip.data('mt-tt-trigger').is($trig) ){

				//console.log('we bail as not the same', $tooltip.data('mt-tt-trigger'), $trig);

				return false;
			}

			// get the correct content container, which seems to vary
			var $elToChange = $tooltip.find('.ui-tooltip-content');
			$elToChange = TvrCom.isDomEl($elToChange) ? $elToChange : $tooltip;

			// update html, replacing line breaks with br
			$elToChange.html(content.replace("\n", '<br />'));

			// used to restore el title
			TvrUi.tt_trigger.data( "ui-tooltip-title", content);

		},


		// parse selectors in full code editor, will also be applicable snippets
		parse_editor_selectors: function(codeSnippet){

			// get tree in same format regardless of Sass vs plain CSS
			var codes = {},
				count = 0,
				syntax = parseInt(TvrUi.pref.allow_scss) ? 'scss' : 'css';

			if (codeSnippet){

				var	parseTree =  TvrUi.parse_scss_or_css(codeSnippet, syntax);

				if (!parseTree){
					return false;
				}

				parseTree.forEach('ruleset', function(node) {

					var nodeContent = node.content,
						lastSelector = false,
						line;

					++count;

					// loop sub nodes
					for (var i = 0; i < nodeContent.length; i++) {

						var subNode = nodeContent[i];

						// remove any declarations
						if (subNode.type === 'block'){
							nodeContent.splice(i, 1);
						}

						// store last selector in possible comma joined set
						else if (subNode.type === 'selector'){
							lastSelector = subNode;
						}
					}

					// by default, start on the line above closing selector bracket
					line = node.end.line - 1;

					// Get line from typeSelector start row +1 but requires another loop of content
					// this means the selector code bit is still in view even it lots of declarations
					// is it better though? uncomment if we decide yes.
					/*if (lastSelector){
						for (i = 0; i < lastSelector.content.length; i++) {
							var newNode = lastSelector.content[i];
							if (newNode.type === 'typeSelector'){
								line = newNode.end.line + 1;
							}
						}
					}*/


					// get selector as string (supports comma separated)
					var selectorString = node.toString().trim();

					// remove any universal selectors
					if (selectorString.match(/\*/)){

						var parts = selectorString.split(',');

						for (var j = parts.length - 1; j >= 0; j--) {

							var part = parts[j].trim();

							if (part === '*'){
								parts.splice(j, 1);
							}
						}

						selectorString = parts.join(',');

						//console.log('We strip a plain *', selectorString);
					}

					// if we still have a selector after removing the * add to store

					if (selectorString){

						codes['hand_coded_css-'+count] = {
							type: 'hand_coded_css',
							sName: selectorString,
							code: selectorString,
							line: line
						}

						//console.log('We add the selector string', selectorString);
					}

					//console.log('the selector', count, lastSelector,  node, selectorString);
				});
			}


			return codes;

			//console.log('the parseTree', parseTree)

		},

		// get all CSS selector code from JS object for e.g. navigating back to selector/preventing duplicate
		get_all_selector_code: function(ignoreDraft, excludeNonLoading, justString, justChildClassId){ TvrCom.startT(arguments);

			let str = '',
				codes = {};

			if (justString){
				let handCSS = TvrUi.uiData.non_section['hand_coded_css'];
				if (handCSS){
					str+= handCSS;
				}
			}

			else {
				// get full code editor selectors from cache if available (or set up empty object)
				var	fullCodes = TvrCom.checkObject(TvrUi.uiData.non_section, ['meta', 'fullCodeSelectors']);

				codes = fullCodes
						? $.extend(true, {}, fullCodes) // must be copy otherwise GUI selectors get added to store
						: {};
			}

			//console.log('draft code', TvrUi.draftSelector.ace);

			// GUI selectors
			for (var f in TvrUi.uiData){
				if ( ! TvrUi.uiData.hasOwnProperty(f) ) continue; // for compat
				//console.log(TvrUi.uiData[f])

				let section = TvrUi.uiData[f];

				// we should exclude selectors added in folders not loading, as they don't apply and it is confusing to
				// show this here - this will product a performance boost too
				if (
					f === 'non_section' ||
					excludeNonLoading && ( MTfolder.folderNotLoading(f) || (section['this'] && section['this'].disabled) )
				){
					continue;
				}
				// PHP storm told me it's safer to add hasOwnProperty check
				if (TvrUi.uiData.hasOwnProperty(f)){
					for (var s in section){

						if ( ! TvrUi.uiData[f].hasOwnProperty(s) ) continue; // for compat

						let selector = TvrUi.uiData[f][s];

						if (
							s === 'this' ||
							!selector ||
							f+'_'+s === TvrUi.ignoreSelector ||
							(excludeNonLoading && selector.disabled)
						){
							continue;
						}

						if (selector &&
							selector.label &&
							// ignore draft selectors
							(!ignoreDraft || (!selector.isDraft && !selector.isDraftRetarget))
							){
							var sel = selector.label.split('|');

							//console.log('selector got from full code list', sel)

							if (justString){

								let selString = sel[1];

								// we may only be interested in cla
								if (justChildClassId){
									let childPart = selString.split(/\s+/).reverse()[0];
									let firstChar = childPart[0];
									if (childPart && firstChar !== '.' && firstChar !== '#'){
										//console.log('resetting invalid selString', firstChar, selString, childPart)
										selString = null; // ignore
									}
								}

								//console.log('Do we add selString', selString)
								if (selString){
									str+= '|'+selString;
								}
							}

							else {
								codes['strk-'+f+'-'+s] = {
									'fName': TvrUi.uiData[f]['this'].label,
									'sName': sel[0],
									'code': sel[1],
									//'isDraft': (TvrUi.uiData[f][s].isDraft || TvrUi.uiData[f][s].isDraftRetarget)
								}
							}



							//console.log('checking for dupe', $.extend(true, {}, TvrUi.uiData[f][s]), TvrUi.uiData[f][s])
						}
					}
				}
			}

			//console.log('all the codes', codes, str);

			TvrCom.endT(arguments);
			return justString ? str : codes;

		},


        // get dom item from c trail
        get_dom_item: function(c, depth, type, getM, override, $scope){

		    var config = override ? $.extend(true, {}, c, override) : c,
                prefix = (type === 'menu') ? 'strk' : 'opts',
                parts,
                id,
                $item;

            switch(depth) {

                case 'section':
                case 'selector':
                case 'group':

                    parts = config.trail.item;
                    break;

                // subgroup and property can be retrieved when c.item is a property
                case 'subgroup':
				case 'property':

                    // todo test this

                    var cssf = TvrCom.prop_to_cssf(c.property_key),
						subgroup = TvrCom.checkObject(TvrMT.data.prog.lh, [cssf, 'sub_slug']),
                        property = (depth === 'subgroup')
							? 'subgroup'
							: c.property_key;

                    // fix issue with event always returning transition as subgroup
                    if (c.group_key === 'animation'){
                        subgroup = 'animation';
                    }

                    //console.log('root_to_group', c.property_key, subgroup, TvrMT.data.prog.lh[cssf], config.trail.root_to_group);

                    if (!subgroup){
                        return false;
                    }

                    parts = config.trail.root_to_group.concat([subgroup, property, c.recurse.mq_key]);

                    break;
            }

            // format id string and return
            //console.log('parts', parts, config.trail.root_to_group);
            id = '#'+prefix+'-'+parts.join('-');

			//console.log('the update item', id, $scope, $item)

            $item = $scope ? $scope.find(id) : $(id);

            //console.log('the update item', id, $scope, $item);

            if (!TvrCom.isDomEl($item)){
                return false;
            }

		    return getM
                ? {
                    $item: $item,
                    id: id,
                    M: TvrUi.get_meta($item, depth)
                }
                : $item;

        },

		get_selector_in_focus: function(){

			if (TvrUi.selInFocusID){

				let $selector = $('#'+TvrUi.selInFocusID);

				if (TvrCom.isDomEl($selector, true)){
					return TvrUi.get_meta($selector, 'selector');
				}
			}

			return false;
		},

		get_context_from_container: function($clicked){
			return $clicked.parent().data('context');
		},

		// we want to get the relevant M values from:
		// a) menu or style element clicked b) context menus  or c) current item
		get_meta_for_context: function($clicked, level, context){

			context = context || TvrUi.get_context_from_container($clicked);

			/*if (!context && $clicked.closest('#mt-context-menu')){
				context = 'popup-form';
			}


*/
			//console.log('the context', context);

			switch(context) {

				// if no context is passed, can be retrieved from the parent, or if explicitly folders do standard
				case undefined:
				case 'folders-menu':
					return TvrUi.get_meta($clicked, level);

				// with popup context menus, M will always be stored on the popup data
				case 'popup-form':
				case 'folder-popup':
					return TvrUi.context_menu_data.M;

				// for current item actions, get M from the global value
				case 'current-item':
					return TvrUi.get_selector_in_focus();
			}

			return false;

		},

		/*** update the meta obj with target section, selector, group, property  ***/
		get_meta: function($obj, depth){ TvrCom.startT(arguments);
			// reset meta obj to clear any leftovers
			TvrUi.meta = {};
			// populate obj based on required depth
			var arr = ['stub', 'section', 'selector', 'group', 'subgroup', 'property'];
			for (var i in arr) {
				if ( ! arr.hasOwnProperty(i) ) continue; // for compat
				if (arr[i] == depth) {
					// need to check if element in question is actually a tag
					if ($obj.attr('class') && $obj.attr('class').indexOf(depth+'-tag') >= 0) {
						var $tag = $obj;
					} else {
						// otherwise search parents
						var $tag = $obj.closest('.'+depth+'-tag');
					}
					//console.log('get_meta', $tag, '.'+depth+'-tag', i, arr, $obj, TvrCom.isDomEl($obj, true))
					var id = $tag.attr('id');
					var tagArr = id.split('-');
				}
			}
			var idStr = '';
			for (var j in tagArr) {
				if ( ! tagArr.hasOwnProperty(j) ) continue; // for compat
				if (j == 0 || j == 6 || j == 7) { // 6 = mq key, 7 might = -devices
					continue;
				}
				depth = arr[(j)];
				idStr += '-'+tagArr[(j)];

				// property/subgroup depth need slightly different handling (mq key added to id string, newIDStr)
				if (depth == 'property' || depth == 'subgroup'){
					var comStub = idStr;
					var newIDStr = (depth == 'property') ? comStub +'-'+tagArr[6] : comStub +'-subgroup-'+tagArr[6];
					// all-devices has extra hyphen so add that too
					if (tagArr[6] == 'all') {
						tagArr[6] += '-devices';
						newIDStr += '-devices';
					}
					TvrUi.meta['tabSlug'] = tagArr[6];
					TvrUi.meta[depth] = $('#opts'+newIDStr);

					// save tab control group too
                    TvrUi.meta.pgTabControlSlug = TvrUi.meta[depth].data('pgtabcontol');

				} else {
					// section, selector, group depth
					TvrUi.meta[depth] = $('#opts'+idStr);
				}

				// save slug
				var slug = tagArr[(j)];
				TvrUi.meta[depth+'Slug'] = slug;

				// set level specific meta
				if (depth == 'section'){

					// sometimes we read values from HTML, need proper review before reading from data
					// var sectionData = TvrCom.get_js_object_data([TvrUi.meta.sectionSlug], 'all-devices').data;
					// sectionData['this'].label;

					TvrUi.meta[depth+'M'] = $('#strk'+idStr);
					TvrUi.meta[depth+'H'] = TvrUi.meta.sectionM.find('.section-data-label').val();
					TvrUi.meta[depth+'ID'] = 'opts-'+TvrUi.meta.sectionSlug;
					TvrUi.meta[depth+'MID'] = 'strk-'+TvrUi.meta.sectionSlug;
				} else if (depth == 'selector'){

					// sometimes we read values from HTML, need proper review before reading from data
					/*var selectorData = TvrCom.get_js_object_data([
							TvrUi.meta.sectionSlug, TvrUi.meta.selectorSlug
						], 'all-devices').data,
						label = selectorData.label.split('|');*/

					TvrUi.meta[depth+'M'] = $('#strk'+idStr);

					var label = TvrUi.meta.selectorM.find('.selector-label').val().split('|');

					TvrUi.meta[depth+'H'] = label[0];
					TvrUi.meta[depth+'Code'] = label[1];
					TvrUi.meta[depth+'ID'] = 'opts-'+TvrUi.meta.sectionSlug+'-'+TvrUi.meta.selectorSlug;
					TvrUi.meta[depth+'MID'] = 'strk-'+TvrUi.meta.sectionSlug+'-'+TvrUi.meta.selectorSlug;
				} else if (depth == 'group'){
					// note M.group refers to e.g. padding div that contains all tab fields.
					// So M.tabKey nearly always needs to be used in combination. See get_group() and get_subgroup_or_tabgroup()
					TvrUi.meta[depth+'ID'] = 'opts-'+TvrUi.meta.sectionSlug+'-'+TvrUi.meta.selectorSlug+'-'+TvrUi.meta.groupSlug;
					// todo can this replace get_group() now? Why didn't I do this before?
					var mqFocus = TvrUi.get_mq_focus();
					TvrUi.meta[depth+'Tab'] = TvrUi.meta[depth].find('div.property-fields-'+mqFocus);

					// get the index for the html mod options
					if (TvrUi.meta.groupSlug === 'html'){
						TvrUi.meta.groupIndex = TvrUi.getGroupIndex(
							TvrUi.meta.sectionSlug, TvrUi.meta.selectorSlug, TvrUi.meta.groupSlug
						);
						//console.log('get group index', TvrUi.meta.groupIndex);
 					}

					TvrUi.meta[depth+'H'] = TvrUi.stat.css_icons
						.find('ul.styling-option-icons')
						.find('.pg-icon-'+TvrUi.meta.groupSlug)
						.attr('title');

					// save event if animation or transition (default to first, group-row can be more precise)
					if (slug == 'animation' || slug == 'transition'){
						TvrUi.meta.event = TvrUi.meta[depth+'Tab'].find('input.mt-event-input').first().val();
						TvrUi.meta.eventKey = TvrUi.meta.event ? TvrCom.convert_to_param(TvrUi.meta.event, '') : '';
                        TvrUi.meta.eventValue = TvrUi.meta[depth+'Tab'].find('input.mt-event-value-input').first().val();
					} else {
						TvrUi.meta.event = TvrUi.meta.eventKey = TvrUi.meta.eventValue = '';
					}

				} else if (depth == 'subgroup'){
					// (see above) if (depth == 'property' || depth == 'subgroup'){

				} else if (depth == 'property'){
					TvrUi.meta['subgroupH'] = TvrUi.meta['subgroup'].find('span.subgroup-label').text();
					TvrUi.meta[depth+'H'] = TvrUi.meta[depth].find('span.option-label').text();

				}
			}
			// tabKey cannot currently be taken from section, selector or group depth (id). So default to current tab.
			if (!TvrUi.meta['tabSlug']){
				TvrUi.meta['tabSlug'] = TvrUi.get_mq_focus();
			}
			// tab slug will be set by now, so get human readable tab name for e.g. history
			TvrUi.meta['tabH'] = TvrUi.get_tab_name(TvrUi.meta['tabSlug']);
			/*if (depth == 'selector'){
				console.log('TvrUi.meta', TvrUi.meta);
			}*/

			TvrCom.endT(arguments)
			return TvrUi.meta;
		},

		// Get full data from lastMultiTab, not just index
		getLastMultiTab: function(groupSlug){
			return TvrUi.pref.lastMultiTab[groupSlug] || {
				index: 0,
				action: 'replace',
				aspect: 'text'
			};
		},

		// get the index from the input set at the selector level
		getGroupIndex: function(sectionSlug, selectorSlug, groupSlug, $selectorM){

			// Trial a simpler system where the change is maintained across element selection,
			// regardless of where settings have been applied
			let config = TvrUi.pref.lastMultiTab[groupSlug];

			//console.log('getGroupIndex', groupSlug, config, TvrUi.pref.lastMultiTab)

			return (config && config.index ? parseInt(config.index) : 0);

			/*$selectorM = $selectorM || $('#strk-'+sectionSlug+'-'+selectorSlug);

			//console.log('#strk-'+sectionSlug+'-'+selectorSlug, $selector)

			if (!TvrCom.isDomEl($selectorM)){
				return 0;
			}

			let index = $selectorM.find('.selector-multi-key-'+groupSlug).val();

			//console.log('getGroupIndex function', sectionSlug, selectorSlug, groupSlug, index);

			return index === ''
				? (parseInt(TvrUi.lastMultiTab[groupSlug]) || 0)
				: parseInt(index);*/

		},

		/*getGroupIndexOrig: function(sectionSlug, selectorSlug, groupSlug, $selectorM){

			$selectorM = $selectorM || $('#strk-'+sectionSlug+'-'+selectorSlug);

			//console.log('#strk-'+sectionSlug+'-'+selectorSlug, $selector)

			if (!TvrCom.isDomEl($selectorM)){
				return 0;
			}

			let index = $selectorM.find('.selector-multi-key-'+groupSlug).val();

			console.log('getGroupIndex function', sectionSlug, selectorSlug, groupSlug, index);

			return index === undefined
				? 0
				: parseInt(index);

		},*/

		// get M for current pg in focus from global TvrUi.selInFocusID and TvrUi.pref.pg_focus vars
		get_pg_meta: function(row){

			if (!TvrUi.selInFocusID || !TvrUi.pref.pg_focus) return false;

			// ensure valid selector
			var $sel = $('#'+TvrUi.selInFocusID);

			if (!TvrCom.isDomEl($sel, true)) {
				return false
			};

			// ensure valid property group (prepare for future row feature)
			var $pg = row
				? $sel.find('li.group-tag-'+TvrUi.pref.pg_focus).find('group-row-'+row)
				: $sel.find('li.group-tag-'+TvrUi.pref.pg_focus);

			if (!TvrCom.isDomEl($pg, true)) {
				return false
			};

			// return M
			return TvrUi.get_meta($pg, 'group');

			/*if (TvrCom.isDefined(row)){
				TvrUi.get_meta($pg, 'group-row');
			} else {
				return TvrUi.get_meta($pg, 'group');
			}*/

		},
		setColorOnHide: '',

		/*** bind Spectrum Color Picker to dynamically created inputs ***/
		colorpicker_bind: function($obj, open){ TvrCom.startT(arguments);

		    //return false;

			//console.log('colorpicker_bind $obj', $obj.length)

			var $appendTo = $('<div></div>'),
				bound = false,
				$color_inputs = open ? $obj : $obj.find('input.color:not(.bound)');

			//console.log('Run color picker bind');

			$color_inputs.each(function(){

				bound = true;

				var $colorInput = $(this),
					fieldID = $colorInput.closest('.property-tag').attr('id');

				//console.log('we bind it', 'picker-belongs-to-'+fieldID);

				$colorInput.mtspectrum({
					//appendTo: 'parent',
					appendTo: TvrUi.stat.styleComponents, //$appendTo, //$obj.closest('.selector-tag'), //,
					belongsTo: fieldID, // sebcus
					containerClassName: 'picker-belongs-to-'+fieldID,

					showAlpha: true,
					showInput: false,
					allowEmpty:true,
					showInitial: true,
					preferredFormat: "rgb",
					showButtons: false,
					showSelectionPalette: true,		// show used colors
					localStorageKey: 'shared_palette', // share used colors between pickers
					maxSelectionSize: 9,

					hide: function(colorObj){

						// Fix a strange bug where setting a hex/rgb by typing, it gets unset between
						// update_spectrum_inputs and here. I could not find where, so this is my patch
						if (TvrUi.setColorOnHide){
							//console.log('Set color on hide', TvrUi.setColorOnHide)
							$colorInput.val(TvrUi.setColorOnHide);
							TvrUi.setColorOnHide = '';
						}

						TvrUi.$pickerContainer.draggable('destroy');
						TvrUi.$pickerContainer.removeClass('expanded');

					},
					show: function(colorObj){ TvrCom.startT(arguments);

						// Append the new input fields and wrap them with a relatively positioned div
						var $input = TvrUi.inputWaitingObj = $(this);
						var M = TvrUi.get_meta($input, 'property');
						var containerClass = '.picker-belongs-to-'+M.property.attr('id');
						var $container = TvrUi.$pickerContainer = TvrUi.stat.styleComponents.find(containerClass);

						// make draggable
						if (!$container.hasClass('ui-draggable')){
							$container.draggable({
								//handle: '.drag-picker' // too easy to slip off
                                cancel: '.combo-arrow, input, .palette-tile, .sp-palette-row-initial, .ui-menu, .palette-button, .refresh-icon, .sp-alpha, .sp-alpha-inner, .sp-alpha-handle'
							});
						}

						// add custom fields and bind events to them
						if (!$container.hasClass('extra-fields-added')){

							//$container.addClass('extra-fields-added');

							/*var fields = '<div class="sp-mt-inputs">';
							fields+= '<input type="number" min="0" max="1" step="0.1" class="sp-input-opacity sp-input">';
							fields+= "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>";
							fields+= '<input type="text" class="sp-input-rgb sp-input">';
							fields+= '<input type="text" class="sp-input-hsl sp-input">';
							fields+= '<input type="text" class="sp-input-hex sp-input">';
							fields+= '<div class="tvr-input-wrap input-var-wrap"><span class="color-var-label" title="'+TvrLang.color_var_label+'">VAR</span><input type="text" class="sp-input sp-input-var combobox has-suggestions" rel="color_extra"><span class="combo-arrow combo-dots"></span><span class="mt-clear-field"></span></div>';
							fields+= '</div>';*/

							// add an icon for dragging the picker
							//fields+= '<span class="drag-picker" title="'+TvrLang.drag_picker+'"></span>';

							$container.addClass('extra-fields-added')
								.find('.sp-mt-inputs')

								// must add this custom input later and then have custom 'input' event update
								.prepend('<input type="number" min="0" max="1" step="0.1" class="sp-input-opacity sp-input">')
								//.wrapInner( "<div class='sp-wrap'>");


							// note, spectrum prevents bubbling up past the container, so add some custom events


							// note, spectrum prevents bubbling up past the container, so add some custom events

							// attach event to clear icon so our custom fields can be cleared
							$container.find('.sp-clear').on("click.mt", function (e) {

								// clear custom inputs along with the defaults
								TvrUi.clear_spectrum_inputs(M, true);
							});

						}

						// tag container with common classes for displaying popups
						$container
							.addClass('expanded')
							.data('popupName', 'picker');

						// add/redraw the color palette (to ensure saved/site colors are up to date)
						TvrUi.draw_palette($container);

						// set picker position
						var contCSS = $container.css(['top', 'left']),
							newCSS,
							top = parseInt(contCSS.top),
							left = parseInt(contCSS.left);

						//console.log('debug the picker', $container, contCSS, containerClass, $input, M);

						if (TvrUi.pref.dock_styles_left){
							newCSS  = {
								top: (top+10)+'px',
								left: '0px'
							}
						} else {
							newCSS  = {
								top: '-1px',
								left: (left+40)+'px'
							}
						}

						$container.css(newCSS);

						/*var defualtTop = parseInt($container.css('top').replace('px', ''));
						$container.css('top', defualtTop+27);*/

						// if there is a computed value but no manual value, default to the computed
						//console.log('the input value', $input.val())
						if (!$input.val()){
							//if (!M.property.hasClass('manual-val')){
							var compColorInline = M.property.find('span.comp-style').find('span').attr('style');
							if (compColorInline){
								var compRGB = compColorInline.split('background-color:');

								// the computed value will often be transparent by default.
								// Opacity starting from 0 is annoying, so override
								if (compRGB[1] == 'transparent' || compRGB[1] == 'rgba(0, 0, 0, 0)'){
									compRGB[1] = 'rgba(0, 0, 0, 1)';
								}

								// set picker values without setting input field
								TvrUi.update_spectrum(compRGB[1], $input, {}, true, true);

								// $input.mtspectrum('set') will auto-set input so unset
								$input.val('');
								M.property.find('.sp-preview-inner')
									.css('background-color', 'transparent')
									.addClass('sp-clear-display');

								//console.log('the spectrum input cleared', $input, $input.val())

							}
						}


						else {

                            // set variable or display regular color value
						    if (!TvrUi.maybe_set_variable_color($input.val(), $input, $container.find('.sp-input-var'))){
                                TvrUi.update_spectrum_inputs(colorObj, $input, {}, true);
                            }

						}

						TvrCom.endT(arguments)
					},

					move: function(colorObj){

						// deselect any saved or site selected tile
						if (TvrUi.color_tile_selected && TvrCom.isDomEl(TvrUi.color_tile_selected, true)){
							TvrUi.color_tile_selected.removeClass('tile-selected');
							TvrUi.color_tile_selected = false;
							TvrUi.$palette.find('.mt-save-color').addClass('show');
							TvrUi.$palette.find('.mt-remove-color').removeClass('show');
						}

						TvrUi.update_spectrum_inputs(colorObj, $(this), {}, true);

						/*if (TvrUi.timer['typing']) {
							clearTimeout(TvrUi.timer['typing']);
						}
						TvrUi.timer['typing'] = setTimeout(TvrUi.done_typing, 10);*/

						TvrUi.set_input_timer(10)
					}
				})

				// for some reason dragstart and dragstop didn't work when added like move: above
				.on("dragstart.spectrum", function(e, colorObj) {
					TvrUi.colorPickerDragging = true;
					TvrUi.get_local_window_function('maybe_hide_mt_highlight')();
				})
				.on("dragstop.spectrum", function(e, colorObj) {
					TvrUi.colorPickerDragging = false;
					TvrUi.get_local_window_function('maybe_reinstate_mt_highlight')();
				})
				// to ensure we only bind once
				.addClass('bound');

			});

			//TvrUi.stat.styleComponents.html($appendTo);

			// user may have clicked the input field
			if (bound && open){
				//console.log('go on show', $obj.find('input.color'))
				//$obj.find('div.sp-preview-inner').trigger('click');
				$color_inputs.mtspectrum('show');
			}

			TvrCom.endT(arguments)
		},

        format_autocomplete_id: function($input, type){

            var $property = $input.closest('.property-tag'),
                fieldID = $property.attr('id'),
                containerID = type+'-belongs-to-'+fieldID,
                isTemplate = $property.hasClass('tab-control-gridtemplate'),
                isAuto = $property.hasClass('tab-control-gridauto');

            // if grid-template/auto, need to narrow down $input
            if (isTemplate || isAuto){

                var filter = '',
                    $inputWrap = $input.closest('.tvr-input-wrap'),
                    nthIndex = $inputWrap.index() + 1;

                // store input wrap index and use to give autocomplete a unique id
                containerID+='-input-nth-index-'+nthIndex;

                // get filter for template which has line names too
                if (isTemplate){
                    filter = $input.closest('.vl-item').data('input-filter');
                    containerID+='-input-filter-'+filter;
                }
            }

            return {
                containerID: containerID,
                fieldID: fieldID
            };

        },


		get_related_meta: function(type, $obj, M){

			var fieldID,
				containerID,
				$container,
				$input,
                $colorVarInput,
                filter,
				belongs = type+'-belongs-to',
				containerClass = type === 'picker' ? 'sp-container' : 'ui-autocomplete';

			//console.log('get meta stuff', belongs, containerClass)

			// if we have container reference
			if (!M && $obj.hasClass(containerClass)){

			    fieldID = $obj.data(belongs);
				containerID = $obj.attr('id'); // belongs+'-'+fieldID;
				$container = $obj;

                //console.log('getting M', fieldID, containerID, $container)

                M = TvrUi.get_meta($('#'+fieldID), 'property');
                filter = '.tvr-input-wrap';

				// the container id contains input index/filter for variable fields - extact
                var inputParts = containerID.split(/(?:-input-nth-index-|-input-filter-)/g);

                // if index
                if (inputParts[1]){
                    filter+= ':nth-child('+inputParts[1]+')';
                }

                // if pre/post line name or track size
                if (inputParts[2]){
                    filter+= ' .'+inputParts[2];
                }

                //filter = $obj.data('input-filter') || '.tvr-input-wrap';
				$input = M.property.find(filter).find('input.property-input');

                // if combo is inside picker, it's the color variable combo
                if (type === 'combo' && $container.siblings('.sp-input-var').length){
                    $colorVarInput = $container.siblings('.sp-input-var');
                }

				//console.log('we got the container ref', filter, belongs, fieldID, containerID, filter, $input, $obj)
			}

			// if we have property reference
			else {
				M = M ? M : TvrUi.get_meta($obj, 'property');

				// picker may not pass object, other inputs need to cater for variable lines with multiple inputs per prop
                $input = type === 'picker'
                    ? M.property.find('input.property-input')
                    : $obj.parent().find('input.property-input');

                var data = TvrUi.format_autocomplete_id($input, type);

                fieldID = data.fieldID;
				containerID = data.containerID;
				$container = $('#'+containerID);

                //console.log('we got the property ref', data, belongs, fieldID, containerID, filter, $input, $obj);
			}

			return {
				$input: $input,
                $colorVarInput: $colorVarInput,
				$container: $container,
				containerID: containerID,
				fieldID: fieldID,
				M: M
			}
		},

		// redraw color palette (while picker is currently showing (TvrUi.meta will be valid cache)
		draw_palette: function($container){

			// get $container from M object if not passed in
			var M = TvrUi.get_meta(TvrUi.inputWaitingObj, 'property'),
				picker = this.get_related_meta('picker', false, M);

			$container = $container ? $container : picker.$container;

			// insert or replace palette
			var $palette = $container.find('ul.mt-picker-palette');
			if (TvrCom.isDomEl($palette)){
				$palette.replaceWith( TvrUi.color_palette() );
			} else {
				$container.prepend( TvrUi.color_palette() );
			}

			// cache palette, so it can be referenced from click event even after a redraw
			TvrUi.$palette = $container.find('ul.mt-picker-palette');

			// bind palette events, spectrum prevents bubbling up past the container
			// so attach a single event for catching clicks on the color palette
			$container.find('ul.mt-picker-palette').on("click.mt-spectrum",
				"span.full-palette-toggle, " +
				"span.palette-button, " +
				"span.refresh-icon, " +
				"span.tile-color", function (e) {

					var $clicked = $(e.target),
                        $input = picker.$input; //$clicked.closest('.tvr-input-wrap').find('input.color');

					// if launching the full palette
					if ($clicked.hasClass('full-palette-toggle')){
						TvrUi.toggle_feature($clicked);
					}

					// if they clicked a color tile
					else if ($clicked.hasClass('tile-color')){

						// clear any previously selected tiles
						TvrUi.$palette.find('span.tile-selected').removeClass('tile-selected');

						var color = $clicked.data('color');

                        // set variable or display regular color value
                        if (!TvrUi.maybe_set_variable_color(color, $input, $container.find('.sp-input-var'))){
                            TvrUi.update_spectrum(color, $input, {}, true);
                        }

						// save the tile number so it can be located after redraw
						// we lose dom reference to $clicked after redraw
						var tileID = $clicked.data('id');

						// save the settings, redraw will occur if they click a site_color tile (adds to recent)
						MTsave.ajax_save_settings({ context: 'redrawPalette', $property: $input});

						// restore valid dome reference to clicked tile
						$clicked = TvrUi.$palette.find('span.'+tileID);
						var $par = $clicked.parent();

						// highlight clicked tile
						$clicked.addClass('tile-selected');
						TvrUi.color_tile_selected = $clicked;

						// show save/remove button
						var $heading = TvrUi.$palette.find('div.saved-colors-wrap'),
							$save = $heading.find('span.mt-save-color'),
							$remove = $heading.find('span.mt-remove-color');
						if ( $par.hasClass('saved-tile') ) {
							$save.removeClass('show');
							$remove.addClass('show');
						} else {
							$save.addClass('show');
							$remove.removeClass('show');
						}

							//.find('.palette-button').removeClass('show');
						//var buttonClass = $par.hasClass('saved-tile') ? 'mt-remove-color' : 'mt-save-color';
						//TvrUi.$palette.find('span.'+buttonClass).addClass('show');

					}

					// save/remove color
					else if ($clicked.hasClass('palette-button')){

						// save the current spectrum color (set when clicking a non-saved tile too)
						var color = $container.find('.sp-input-var').val() || $input.mtspectrum('get').toRgbString(),
							add = color,
							remove = false;

						if ($clicked.hasClass('mt-remove-color')){
							color = TvrUi.$palette.find('span.tile-selected').data('color');
							add = false;
							remove = color;
						}

						// update array, and it's safe to save immediately because ajax_save_settings won't run
                        MTdd.splice_sug_val(add, remove, 'color', 'saved', {redrawPalette: 1, save:true})
					}

					// if they resample page colors
					else if ($clicked.hasClass('refresh-icon')){
                        MTdd.refresh_sug_values({specific:'color', $resample:$clicked});
					}

				});

		},

		// build color palette
		color_palette: function(){

			// build palette from html template (tiles built using JS strings for speed)
			var $palette = $('#mt-picker-palette').clone().removeAttr('id'),
				$moreli = $palette.find('li.view-full-palette'),
				sug_color = TvrUi.pref.my_props.sug_values.color,
				recentColors = sug_color['recent'],
				savedColors = sug_color['saved'],
				siteColors = sug_color['sampled'];

			// $moreli needs to have correct 'on' class for current view
			if (TvrUi.pref.full_color_palette){
				var $toggle = $moreli.find('span.full-palette-toggle');
				$toggle.addClass('on').attr('title', $toggle.data('neg'));
			}

			// prepend recent tiles to mini palette (-1 to make room for full palette icon
			$palette.find('ul.mt-picker-palette').html(

				// insert $moreli so palette can be fully redrawn on update (simple to code this way)
				$(TvrUi.color_palette_tiles('mini', 'recent', TvrUi.numMiniTiles-1, recentColors)).add($moreli)

			);

			// add recent tiles to full palette
			$palette.find('ul.recent-full-palette').html(
				TvrUi.color_palette_tiles('full', 'recent', TvrUi.numMiniTiles, recentColors)
			);

			// add saved tiles to full palette
			$palette.find('ul.saved-full-palette').html(
				TvrUi.color_palette_tiles('full', 'saved', TvrUi.numSavedTiles, savedColors)
			);

			// add site color tiles to full palette
			$palette.find('ul.site-full-palette').html(
				TvrUi.color_palette_tiles('full', 'site', TvrUi.numSiteTiles, siteColors)
			);

			return $palette;
		},

        // signal css var or Sass var -- vs $
        isVariableTile: function(color){

            var varSignal = '';

            if (color){
                if (color.indexOf('var(') > -1){
                    varSignal = 'var';
                } else if (color.indexOf('$') > -1){
                    varSignal = '$';
                }
            }

            return varSignal;
        },

		// build color palette tiles
		color_palette_tiles: function(size, type, num, colors){

			//console.log('what is going on', size, type, num, colors)

			var tiles = '';

			//if (colors.length){
			for (var i = 0; i < num; ++i) {

				var color = colors[i];

				var colorValue = color && color.indexOf('$') > -1
                    ? MTdd.get_variable_value(color, 'scss')
                    : color;

				var	tooltipColor = TvrUi.pref.color_as_hex ? TvrCom.maybe_to_hex(color) : color,
					// sampled site colors come from the previewed page's CSS, so escape attribute values
					title = color ? 'title="'+TvrCom.escapeHTML(tooltipColor)+'"' : '',
					style = color ? 'style="background-color:'+TvrCom.escapeHTML(colorValue)+'"' : '',
					liClass = color ? 'has-color' : 'no-color',
					id = size+'-'+type+'-'+ i;

				// signal css var or Sass var -- vs $
                var varSignal = TvrUi.isVariableTile(color);

				var	span = color ? '<span class="tile-color '+id+'" ' +
					'data-color="'+TvrCom.escapeHTML(color)+'" data-id="'+id+'" '+style+' '+title+'>'+varSignal+'</span>' : '';

				tiles+= '<li class="'+size+'-tile '+type+'-tile  palette-tile '+liClass+'">'+span+'</li>'
			}
			//}

			return tiles;
		},

		// apply methods to color picker (iframe has access to this too)
		picker_method: function(method){ TvrCom.startT(arguments);

			if (TvrCom.isDomEl(TvrUi.inputWaitingObj)){
				// simple hide
				if (method === 'hide'){
					TvrUi.inputWaitingObj.mtspectrum('hide');
				}
				// the iframe doesn't release the dragger on mouseup - simulate this on picker to fix
				else if (method === 'clickpick'){
					var M = TvrUi.get_meta(TvrUi.inputWaitingObj, 'property');
					M.property.find('.sp-container').trigger('mouseup');
				}
			}
			TvrCom.endT(arguments)
		},

		// update color picker and custom fields
		update_spectrum: function(colorStr, $input, $trig, maybeSync, skipInput){ TvrCom.startT(arguments);

			var colorObj = tinycolor(colorStr),
				rgbObj = colorObj.toRgb();

			//console.log('update_spectrum', rgbObj, colorObj)

			if (!tinycolor(rgbObj).isValid()) {
				//console.log('invalid color', tinycolor(rgbObj).isValid(), rgbObj, colorObj)
				return;
			}

            $input.mtspectrum('set', rgbObj);

			TvrUi.update_spectrum_inputs(colorObj, $input, $trig, maybeSync, skipInput);

			if (!skipInput){
				TvrUi.adjust_comp_span($input, 'after');
			}


			TvrCom.endT(arguments)
		},

		// Update Inputs from Colorpicker value

		update_spectrum_inputs: function(colorObj, $input, $trig, maybeSync, skipInput){ TvrCom.startT(arguments);

			//console.log('update_spectrum_inputs skip input', skipInput, colorObj, $input, $trig, maybeSync, skipInput)

			//var $input = $(input);
			if (!colorObj) {
				//console.log('No color object', skipInput, colorObj, $input, $trig, maybeSync, skipInput)
				$input.val('');
				return;
			}

			var rgb = colorObj.toRgbString();

			// update original input field
			if (!skipInput){
				$input
					.val(rgb)
					.css('background-color', rgb)
					.attr('value', rgb) // just enable for debugging

				TvrUi.setColorOnHide = rgb;

				//console.log('Set the input', rgb);
			}

			//debugger;

            //TvrUi.adjust_comp_span($input, 'after');

			var picker = this.get_related_meta('picker', $input),
				$container = picker.$container;

            //console.log('updating the spectrum inputs', $trig, $container.find('.sp-input-opacity').not($trig).length)

			// update input fields in the colorpicker (we leave current field alone ($trig) as it's jumpy otherwise)
			//var M = TvrUi.get_meta($input, 'property');
			$container.find('.sp-input-hex').not($trig).val(colorObj.toHexString());
			$container.find('.sp-input-rgb').not($trig).val(colorObj.toRgbString());
			$container.find('.sp-input-hsl').not($trig).val(colorObj.toHslString());
			$container.find('.sp-input-opacity').not($trig).val(colorObj.toRgb()['a']);

			// clear the variable field - this will be set via maybe_set_variable_color
            $container.find('.sp-input-var').not($trig).val('');

			//debugger;

			if (maybeSync && !skipInput){

				// sync if eligable
				TvrUi.maybe_sync_fields($input);
			}

			if (TvrCom.isDomEl($trig)){
				$trig.focus();
			}

			//debugger;

			TvrCom.endT(arguments)
		},

		// clear color picker: fully functionality that emulates picker's .sp-clear icon
		clear_spectrum_inputs: function(M, maybeSync){ TvrCom.startT(arguments);

			var $input = M.property.find('input.color');

			//console.log('We clear', $input);

			// the picker does some of this by default, but sync needs to emulate full functionality
			M.property.find('input.sp-input, input.color').val('').end()
				.find('div.sp-alpha-inner, div.sp-preview-inner').css('background-color', 'transparent').end()
				.find('div.sp-preview-inner').addClass('sp-clear-display');

			TvrUi.adjust_comp_span($input, 'after');

			// close the picker and sync if eligible
			if (maybeSync) {
				TvrUi.picker_method('hide'); // maybeSync is true if function not triggered by sync
				TvrUi.maybe_sync_fields($input);
			}

			TvrCom.endT(arguments)
		},



		/*** update state count ***/
		update_count: function($countTracker, action, num, context, numSels){ TvrCom.startT(arguments);
			if (!TvrCom.hasValue(numSels)){
				numSels = 0; // default to 0 if this isn't set
			}
			// get existing count
			var curValue = parseInt($countTracker.attr('rel'));
			if (action == 'add') {
				var newValue = curValue + parseInt(num);
			} else if (action == 'subtract') {
				var newValue = curValue - parseInt(num);
			}
			// update the count tracker rel
			$countTracker.attr('rel', newValue);
			if (context != 'section') {
				// if the original value was 0, the span and brackets need to be added
				if (curValue == 0) {
					$countTracker.after(' <span class="folder-count-wrap count-wrap">(<span class="folder-state-count state-count"></span>)</span>');
					var addBrackets = true;
				}
				if (newValue == 0) {
					$countTracker.next('span').remove();
					var removeBrackets = true;
				} else {
					// update the visisble count
					$countTracker.next('span').find('.state-count').text(parseInt(newValue));
				}
			}
			//if section
			if (context == 'section') {
				// update section total count
				var $secTotal = $('#total-sec-count');
				var secCount = parseInt($secTotal.text());
				if (newValue > curValue) {
					TvrUi.totalSecs = parseInt(secCount+num);
					$secTotal.text(TvrUi.totalSecs);
					// need to update selector count as may have been a copy action
					TvrUi.totalSels = TvrUi.totalSels + parseInt(numSels);
					$('#total-sel-count').text(parseInt(TvrUi.totalSels));
				} else {
					// subtract
					TvrUi.totalSecs = parseInt(secCount-num);
					$secTotal.text(TvrUi.totalSecs);
					// need to update selector count also
					TvrUi.totalSels = TvrUi.totalSels - parseInt(numSels);
					$('#total-sel-count').text(parseInt(TvrUi.totalSels));
				}
			} else if (context == 'selector') {
				// update selector total count
				var $selTotal = $('#total-sel-count');
				var selCount = parseInt($selTotal.text());
				if (newValue > curValue) {
					TvrUi.totalSels = parseInt(selCount+num);
					$selTotal.text(TvrUi.totalSels);
				} else {
					TvrUi.totalSels = parseInt(selCount-num);
					$selTotal.text(TvrUi.totalSels);
				}
			} else if (context == 'style') {
				//
			}

			// adjust the interface according to there being 0 or more selectors
			TvrUi.toggle_enabled_buttons();

			TvrCom.endT(arguments)
		},

		/*** ajax load styles ***/
		/*com_data_loading: function($objM, lev, con){ TvrCom.startT(arguments);
			// try using con instead of load_style_opt soon (may need globar var for com_data_finished_loading)
			$objM.find('.'+lev+'-row').append(
                $(TvrUi.templates.loaders[lev]).removeAttr('id')
			);
			MTsave.update_prog_indicator('plus', TvrLang.load_style_opt);
			TvrCom.endT(arguments)
		},*/
		com_data_finished_loading: function($objM, status){ TvrCom.startT(arguments);
			$objM.find('img.ajax-loader').remove();
			MTsave.update_prog_indicator('minus', status, TvrLang.load_style_opt); // status may be undefined if no error
			TvrCom.endT(arguments)
		},

		/*** ajax load revision table ***/
		ajax_load_revisions_table: function(){ TvrCom.startT(arguments);
			MTsave.update_prog_indicator('plus', TvrLang.load_revisions_table, false, true);
			//var url = $('#revisions-url').attr('rel');
			// ajax get data
			$.ajax({
				type: "GET",
				url: TvrUi.ajaxUrl,
				data: 'mt_action=get_revisions',
				async: true,
				timeout:TvrUi.tOut, // 20 seconds
				error: function(x,e){ TvrCom.startT(arguments);
					MTsave.update_prog_indicator('minus', {
							'short': TvrLang.load_revisions_table_failed,
							'long': '<p>'+TvrUi.handle_ajax_error(x,e)+'</p>'
						},
						TvrLang.load_revisions_table
					);
					TvrCom.endT(arguments)
				},
				success: function(data){ TvrCom.startT(arguments);
					var insertData = $(data).html();
					$('#revision-area').html(insertData);
					//TvrUi.show_dialog($('#view-revisions-trigger'));
					MTsave.update_prog_indicator('minus', false, TvrLang.load_revisions_table);
					TvrCom.endT(arguments)
				},
				complete: function(){ TvrCom.startT(arguments);

				}
			});
			TvrCom.endT(arguments)
		},


		// update the selector wizard's preview HTML
		update_wizard_html: function(config){

			$('#refresh-html-pane').addClass('active');

			TvrCom.action_after_timeout('wizard_html_expensive', 3, {

				item: function(config){ TvrCom.startT('update_wizard_html_inner');

					//console.trace();

					if (config.bindOnly){
						TvrUi.insert_formatted_html_content({ data: ''}, config);
					}

					else {

                        //console.log('we update the pane HTML', config);

						var dom = MTF.dom;

						// get the full html, mostly just used to update mirror editor
						var html = MTF.stat.html[0].outerHTML;

						// get a static snapshot of the Element indexes that will correspond to the
						// innerHTML at the exact point it is sampled
						MTF.maybe_refresh_front_N_index(true);


						/*TvrCom.startT('format_html_content');
						TvrCom.endT('format_html_content', 1);*/

						// for speed comparison
						var tryWorker = true;

						if (tryWorker){

							TvrCom.ww.assignTask({
								// we are passing a fairly large amount of data so move rather than copy
								//transferable: true, // no, this can only be used for certain types of data - not woth converting an object
								taskName: 'formatHTML',
								terminateCurrent: true,
								terminateOnCompletion: true,
								html: html,
								//delay: 2000, // just for testing
								hasPseudo: MTF.hasPseudo,
								overlayParentIsAlt: MTF.overlayParentIsAlt,
								// we may want to strip other things too like builder angular attributes with Oxygen
								// sometimes we want to store data ready for the callback that can't be sent
								// back and forth between the web worker - e.g. dom references $clicked
								mainThreadData: config,
								custom: TvrUi.custom_wizard_html_replace(),
								cb: {
									ref: 'TvrUi',
									funcName: 'insert_formatted_html_content'
								}
							});

						}

						else {

							// format the HTML
							html = TvrCom.formatHTMLString(
								html,
								TvrUi.custom_wizard_html_replace(),
								MTF.hasPseudo,
								html_beautify,
								MTF.overlayParentIsAlt
							);

							// insert
							TvrUi.insert_formatted_html_content({ html: html}, config);

						}

					}

					TvrCom.endT('update_wizard_html_inner');
				},
				args: [config]
			});

		},

		// update the ACE editor now that the worker has formatted the content
		insert_formatted_html_content: function(data, config){

			//console.log('Test callback func ran', data, config);

			MTace.update_arbitrary_editor({
				'context': 'wizardHTML',
				'editorID': 'wizard_inspector_html',
				'data': data.html,
				'mode': 'customhtml',
				'filterClass': 'wizard_inspector_html',
				//'editorHeight': 210,
				'containerClass': '.css-code-wrap',
				'dontSetHeight': true,
				'readOnly': true,
				'fontSize': '13px',
				'noValidation': true,
				'directContent': data.html,

				// we don't need to scroll when e.g. line is directly clicked
				'dontScrollHTML': config.dontScrollHTML,
				clicked: config.clicked,
				active_selector: config.css,
				select_config: config,
				existingSelCSS: config.existingSelCSS,
				intelli_css: config.intelli_css,
				active_css: config.active_css,

				'doNotFocusEditor': config.doNotFocusEditor,
				maintainCurrentLine: config.maintainCurrentLine,

				bindOnly: config.bindOnly

				//replaceDynMTClasses: 1 // we should always do this no?
			});


			$('#refresh-html-pane').removeClass('active');
		},

		builder_html_atts_regex: function(fullAtts, regxAtts, classes){

			var pattern = '' +
				'(?:' +
					'(?:'+fullAtts.join('|')+')'+
					'|' +
					'(?:'+
						'(?:'+regxAtts.join('|')+')-' +
						'(?:[a-zA-Z0-9-]+?)' +
					')' +
				')' +
				'="(?:[\\s\\S]*?)"';

			if (classes){
				var joinedClasses = classes.join('|');
				pattern+= '|(?:\\s?class="(?:'+joinedClasses+')?"|'+joinedClasses+')';
			}

			return new RegExp(
				pattern,
				'g'
			);
		},

        custom_wizard_html_replace: function(){

		    var custom = {
                    pattern: false,
                    repl:''
                },
                active_builder = MTint.get_active_builder();

		    if (active_builder){
                MTint.get(active_builder).runIfExists('wizardHtmlReplace', [custom]);
            }

            //console.log('the custom replace stuff', custom)

		    return custom;
        },


		// move editor to current dom el line
		update_wizard_html_scroll: function(config, $el){

			// get line number from mirror editor
			var editorID = 'wizard_inspector_html',
				editor = MTace.eds[editorID],
				line = MTace.getAceRowForTriggerElement(config, $el);

			// scroll visible editor
			//console.log('go to line from update_wizard_html_scroll', line, config, editorID, $.extend(true, {}, MTace.eds))
			return MTace.go_to_line_in_editor(line, editor, editorID, config, true);
		},

		refresh_html_pane: function(){

			// getting closer, but need a better way to reselect the element
			// TvrUi.curSelCSS isn't updated in select_element intelli thing
			// and Elementor changes the dom on every click - maybe we can add to ignore mutation...

			// reselect elements if dom change removed it
			/*if (!TvrCom.isDomEl(MTF.triggerEl, true) && MTF.triggerElIndex !== ''){
				MTF.get_sel_elements({
					con: 'reselect_after_dom_change',
					css: TvrUi.curSelCSS //todo need more reliable way to get the current selector
				})
				//console.log('reselected the trigger el as dom change removed it', TvrUi.curSelCSS)
			}*/

			// the current trigger el may be replaced during update,
			// so maintain the current HTML scroll position
			var active_css = TvrUi.pref.show_code_editor
				? MTace.get_code_editor_selector()
				: TvrUi.curSelCSS;

			var editor = MTace.eds['wizard_inspector_html'];

			if (editor){

				var	currentLine = editor.getCursorPosition().row + 1;

				TvrUi.maybeUpdateInspectorPanels({
					updateHTML: 1,
					//maintainCurrentLine: currentLine,
					active_css: active_css,
					dontScrollHTML: true,
					updateVisEditor: 1
					//updateStyles: 1 // don't do styles routinely unless we switch to a web worker
					// no need for comp as UI fields and inspector gets updated by getAndUpdateCompStyles()
				});
			}


		},

		// get dom element from breadcrumb level and sibling index
		get_breadcrumb_node: function(level, eq){

			// we don't update breadcrumbs when clicking the breadcrumbs,
			// so we compare level/index against a cache
			var $el,
				bcLabel = '',
				cached = TvrUi.breadcrumbNodesCache,
				isChild = level < 0,
				nodes = isChild ? cached.descendentNodes : cached.nodes,
				index = isChild ? ((level * -1) -1) : level;

			// if eq (sibling index) is passed in, we want to query the siblingsIncSelf array
			/*if (eq !== false){
				nodes = nodes[index].siblingsIncSelf;
				index = eq;
			}*/

			//console.log('get_breadcrumb_node', isChild, level, eq, index, nodes, nodes[index].siblingsIncSelf[eq]);

			return nodes[index].siblingsIncSelf[eq]; //nodes[index]


		},

		//
		breadcrumb_clicked: function($clicked, e){

			$clicked = $clicked.closest('.mt-breadcrumb');

			// do nothing on active crumb, or if the item is valid - in the case of using the up arrow when
			// we are on the root container element in Gutenberg (where MT doesn't show above)
			if ($clicked.hasClass('active-crumb')){
				return false;
			}

			var $prevActiveCrumb = TvrUi.stat.breadcrumbs.find('.active-crumb'),
				isFull = $clicked.hasClass('full-crumb-item'),
				isNested = !isFull,
				data = $clicked.data();

			var	level = parseInt(data.level),
				eq = parseInt(data.eq),
				node = TvrUi.get_breadcrumb_node(level, eq),
				$el = node.$el;

			// it's jarring to reload the breadcrumbs when clicking them,
			// so just switch active class or sibling text
			$prevActiveCrumb.removeClass('active-crumb');
			TvrUi.stat.breadcrumbs
				.find('.mt-breadcrumb[data-level="'+level+'"]')
				.addClass('active-crumb');

			// ensure nested els level syncs up with cached breadcrumbs
			var prevLevel = parseInt($prevActiveCrumb.data('level'));

			// set to incremental number if undefined
			if (TvrUi.breadcrumbNodesCache.nestedElLevelAdjust === undefined){
				TvrUi.breadcrumbNodesCache.nestedElLevelAdjust = 0;
			}

			// update the adjustment
			TvrUi.breadcrumbNodesCache.nestedElLevelAdjust+= (level - prevLevel);
			//console.log('breadcrumb results', level, '-', prevLevel, ' = '+TvrUi.breadcrumbNodesCache.nestedElLevelAdjust);

			// update the
			TvrUi.dom_nav_option_used($el, {
				e: e,
				node: node,
				isNested: isNested,
				dontReloadBreadcrumbs: isFull,
				level: level,
				$clicked: $clicked,
				$prevActiveCrumb: $prevActiveCrumb,
				pseudoSelected: data.pseudotype
			});

		},

		update_breadcrumbs_nested_html: function(config, html, i, node, pseudo, appendPseudo){

			// get the breadcrumb data at the last minute, now that we will have a current selector established
			let $el = node.$el,
				$siblingsIncSelf = node.$siblingsIncSelf,
				relevantAtts = MTF.relevantAtts(),
				breadcrumbData = MTF.get_breadcrumb_data($el, relevantAtts, true, '', MTF.dom.selectorsString, config);

			node.bcLabel = breadcrumbData.bcLabel;
			node.formattedBCLabel = breadcrumbData.formattedBCLabel;
			node.siblingsIncSelf = [];

			$siblingsIncSelf.each(function(){
				node.siblingsIncSelf.push(
					MTF.get_breadcrumb_data($(this), relevantAtts, true, '', MTF.dom.selectorsString, config)
				)
			});

			//console.log('node now with breadcrumbs');

			var level = node.level,
				isActiveElement = level === 0,
				family = node.family,
				triggerElOffset = MTF.dom.triggerElOffset,
				triggerElDimensions = MTF.dom.triggerElDimensions,
				tightlyNested = TvrCom.offsets_match(node.offset, triggerElOffset),
				dimensionsMatch = TvrCom.dimensions_match(node.dim, triggerElDimensions),
				directElParentOrChild = (level > -2 && level < 2),
				crumbClass = 'mt-breadcrumb mt-bc-item mt-ui-element',
				nth = node.pseudo[':nth-child(n)'],
				eq = (nth-1),
				totalSiblings = node.totalSiblings,
				dataNth = 'data-nth="'+nth+'" data-total="'+totalSiblings+'"',
				crumbIcon = '',
				crumbIconClass = 'mt-bc-item',
				breadcrumbLabel = node.bcLabel,
				formattedBCLabel = node.formattedBCLabel,
				sep = '<span class="bc-sep mt-ui-element"></span>',
				pseudoType = '';

			if (isActiveElement){
				crumbClass+= ' active-crumb';
				html.activeBreadcrumbLabel = breadcrumbLabel;
			}

			if (pseudo){
				var pseudoEl = '::'+pseudo;
				html.activeBreadcrumbLabel+=pseudoEl;
				formattedBCLabel = formattedBCLabel.replace(/<\/span>$/, pseudoEl+'</span>');
				pseudoType = 'data-pseudotype="'+pseudo+'"' ;
				//console.log('The formatted bc label', formattedBCLabel, TvrUi.pseudoSelected);
			}

			// if the element has siblings, add :nth-child to data attr for ::after content: '';
			//console.log('family stuff', level, eq, family)
			if (family.next.count > 0 || family.prev.count > 0){
				crumbClass+= ' node-has-siblings';
				//dataNth = 'data-nth="'+nth+'" data-total="'+totalSiblings+'" ';
			}

			// have icon to show element is tightly nested
			if (tightlyNested && !isActiveElement){

				if (dimensionsMatch){
					crumbIconClass+= ' fully-nested-crumb ' + TvrCom.iconClasses('square-regular');
				} else {
					crumbIconClass+= ' nested-crumb ' + TvrCom.iconClasses('border-style');
				}

				crumbIcon = '<span class="mt-crumb-icon mt-ui-element '+crumbIconClass+'"></span>';

			}

			// breadcrumb HTML
			html.breadcrumbs+= '<span class="'+crumbClass+' full-crumb-item" ' +
				'data-level="'+level+'" data-eq="'+eq+'" '+dataNth+' '+pseudoType+' >'+formattedBCLabel+sep+'</span>';

			// add to nestedTabsHTML if we are on the el, or direct parent or child
			// or it is tightly nested with the triggerEl
			if (tightlyNested || isActiveElement){ // directElParentOrChild

				// full label if active breadcrumb, else an icon
				var tabText = isActiveElement ? formattedBCLabel : '';

				// if a nested element has been targeted, signal with dot
				if (!isActiveElement
					&& MTF.get_matching_selectors(node.$el, TvrUi.get_all_selector_code(true, true), TvrUi.pseudoSelected).length
				){
					crumbClass+= ' mt-hasValues mtif';
					//console.log('we want the node', node.$el)
				}

				// we reload the nestedEls on every change apart from the nested els
				// being clicked themselves. But clicking a parent in the breadcrumb
				// means the level needs to be adjusted to anchor from the original [0] el
				if (TvrUi.breadcrumbNodesCache.nestedElLevelAdjust !== undefined){
					//console.log('pre-adjust level', level, TvrUi.breadcrumbNodesCache.nestedElLevelAdjust)
					level = level + TvrUi.breadcrumbNodesCache.nestedElLevelAdjust; // could be -ve
					//console.log('post-adjust level', level)
				}

				html.nestedTabs+= '<span class="'+crumbClass+' nested-el-item" ' +
					'data-level="'+level+'" data-eq="'+eq+'" ' +pseudoType+
					'title="'+TvrCom.escapeHTML(breadcrumbLabel)+'" '+dataNth+' >'+crumbIcon+tabText+sep+'</span>';
			}
		},

		// update the dom breadcrumb trail
		update_breadcrumbs_and_nested_tabs: function(config){ TvrCom.startT(arguments);

			// clear breadcrumbs if no current dom el
			if (MTF && MTF.stat.nestedEls && !TvrCom.isDomEl(MTF.triggerEl)){
				MTF.stat.nestedEls.add($('#dom-bread').find('.drag-content')).empty(); // was .html('')
				//MTF.stat.elementMeta.attr('style', '');
				return false;
			}

			// if we're reloading the breadcrumbs, reset the level adjust for the nested els
			if (!config.dontReloadBreadcrumbs){
				TvrUi.breadcrumbNodesCache = {};
			}

		    // if we have some nodes
			//console.log('MTF.dom.search', MTF.dom)
			if (TvrUi.iframeEditing() && MTF.dom.search && MTF.dom.search.nodes){

                // get the 3 elements used for draggable breadcrumbs
                var html = {
                		breadcrumbs: '',
						nestedTabs: '',
						activeBreadcrumbLabel: ''
					};

                // loop parents down to trigger el by iterating nodes array backwards
                var startIndex = MTF.dom.search.nodes.length-1,
					lastNode = false;

                for (var i = startIndex; i >= 0; i--) {
					TvrUi.update_breadcrumbs_nested_html(config, html, i, MTF.dom.search.nodes[i],
						(i === 0 ? TvrUi.pseudoSelected : false)
					);
					lastNode = MTF.dom.search.nodes[i];
                }

				// append children by iterating forwards over descendentNodes array
				for (i = 0; i <  MTF.dom.search.descendentNodes.length; i++) {
					TvrUi.update_breadcrumbs_nested_html(config, html, i, MTF.dom.search.descendentNodes[i]);
					lastNode = MTF.dom.search.descendentNodes[i];
				}

				// make it easy to nav down to pseudo - nah, this may need a more involved solution
				/*var pseudoElToAppend = lastNode.hasPseudo
						? (lastNode.hasPseudo.before ? 'before' : 'after')
						: false;

				console.log('Do we add to the last crumb', pseudoElToAppend, lastNode);

				if (pseudoElToAppend){
					TvrUi.update_breadcrumbs_nested_html(config, html, 0, lastNode, pseudoElToAppend, true);
				}*/

				// if we are reloading the nestedEls HTML
				//console.log('the config, do it', config, html, MTF.dom.search.nodes, MTF.dom);
				if (MTF.stat.nestedEls){
					MTF.stat.nestedEls.html(html.nestedTabs);
				}


				// if we are reloading the breadcrumbs
				if (!config.dontReloadBreadcrumbs){

					var $port = $('#dom-bread'),
						$containment = $port.find('.drag-containment'),
						$content = $port.find('.drag-content'),
						contentLeft = 0,
						resumeContentPosition = config.domArrowAdjustment === 'sibling';

					// if we need to keep the active breadcrumb in the same position so user can see 1/2 1/3 etc
					// check previous left values before updating HTML - fidly, abandoned for now
					// - maybe center the active crumb instead
					/*if (resumeContentPosition){
						var prevContentLeft = parseInt($content.css('left')),
							prevContainmentLeft = parseInt($containment.css('left'));
						contentLeft = prevContentLeft - prevContainmentLeft;
						console.log('the lefts', prevContentLeft,
							$content.css('left'), prevContainmentLeft, $containment.css('left'), contentLeft
						);
					}*/

					// add breadcrumb html
					// make width flexible so we can get from natural content width after inserting
					$content
						.css('width', 'auto')
						.html(html.breadcrumbs);

					// calc dimensions for dragging
					var portWidth = $port.width(),
						contentWidth = $content.width(),
						containmentWidth = contentWidth,
						containmentExcess = 0,
						containmentLeft = 0;

					// width can be explicitly set now
					$content
						.width(contentWidth)
						.css('left', contentLeft+'px');

					// if there is overflow, crumbs should be draggable
					if (contentWidth > portWidth){
						containmentExcess = (contentWidth - portWidth); // positive value
						containmentLeft = '-'+containmentExcess+'px'; // flip to negative
						containmentWidth = portWidth + ( containmentExcess * 2 );
						TvrUi.stat.breadcrumbs.draggable('enable');
						$containment.addClass('mt-is-draggable');
					}

					// else there is no overflow, no need for dragging
					else {
						TvrUi.stat.breadcrumbs.draggable('disable');
						$containment.removeClass('mt-is-draggable');
					}

					// set dimensions
					$containment.width(containmentWidth)

					$containment.css({
						left:containmentLeft,
						//cursor: cursorCSSVal
					});

					// cache the parent and descendent nodes as when don' update the breadcrumbs when they are clicked
					// so we need to keep a reference to the nodes relative to the original targetEl (MTF.dom does update)
					TvrUi.breadcrumbNodesCache = {
						nodes: MTF.dom.search.nodes,
						descendentNodes: MTF.dom.search.descendentNodes,

						// the nested els must update when using the breadcrumbs,
						// which work from a cache until a new element is clicked
						// so keep track of +/- index adjust from original zero indexed element,
						// use when adding nestedEL level
						//nestedElLevelAdjust: 0
					}

				}

                //console.log('dims', contentWidth, $content[0].scrollWidth, portWidth, containmentWidth, containmentLeft)

            }


			TvrCom.endT(arguments);
		},

		update_dom_arrows: function(config){ TvrCom.startT(arguments);

			if (!MTF.dom.search){
				return;
			}

			// update target refining controls
			var $nav = TvrUi.stat.refineTarget,
				$arrows = $nav.find('span');
			$arrows.addClass('disabled');

			if (MTF.dom.search.nodes && MTF.dom.search.nodes.length){

				var family = MTF.dom.search.nodes[0].family;
				if (family['par'].count) {
					$nav.find('span.tvr-parent').removeClass('disabled')
				} if (family['prev'].count) {
					$nav.find('span.tvr-prev-sibling').removeClass('disabled')
				} if (family['next'].count) {
					$nav.find('span.tvr-next-sibling').removeClass('disabled')
				} if (family['child'].count) {
					$nav.find('span.tvr-child').removeClass('disabled')
				}
			}

            TvrCom.endT(arguments);
		},

		// navigate to a parent/child/sibling
		dom_arrow_clicked: function($clicked, e){

			var buttonClass = $clicked.attr('class'),
				parentButton = buttonClass.indexOf('tvr-parent') >= 0,
				childButton = buttonClass.indexOf('tvr-child') >= 0,
				$prevActiveCrumb = TvrUi.stat.breadcrumbs.find('.active-crumb');

			// parent or child arrow is simply an alias for using the full breadcrumbs
			if (parentButton || childButton){
				var $nextActiveCrumb = parentButton
					? $prevActiveCrumb.prev()
					: $prevActiveCrumb.next();
				TvrUi.breadcrumb_clicked($nextActiveCrumb, e);
			}

			// when we move onto a sibling element, we don't have the children in cache,
			// so we must reload the breadcrumbs
			else {

				var	data = $prevActiveCrumb.data(),
					adjustment = 'sibling',
					curEq = parseInt(data.eq),
					curLevel = parseInt(data.level);

				if (buttonClass.indexOf('tvr-prev-sibling') >= 0) {
					curEq-=1;
				} else {
					curEq+=1;
				}

				// get the new sibling node
				var node = TvrUi.get_breadcrumb_node(curLevel, curEq);

				// select new el if valid
				if (node){
					TvrUi.dom_nav_option_used(node.$el, {
						e: e,
						node: node,
						level: curLevel,
						eq: curEq,
						domArrowAdjustment: adjustment,
						$prevActiveCrumb: $prevActiveCrumb
						// note we do full refresh of breadcrumbs
					});
				}
			}




			/*var	data = $clicked.data(),
				curLevel = parseInt(data.level),
				curEq = parseInt(data.eq),
				level = curLevel,
				eq,
				family = MTF.dom.search.nodes[0].family,
				buttonClass = $clicked.attr('class'),
				adjustment = '';

			if (buttonClass.indexOf('tvr-parent') >= 0) {
				//$newEl = family.par.m[0].obj;
				level = curLevel+1;
				adjustment = 'parent';
			} else if (buttonClass.indexOf('tvr-child') >= 0) {
				//$newEl = family.child.m[0].obj;
				level = curLevel-1;
				adjustment = 'child';
			} else if (buttonClass.indexOf('tvr-prev-sibling') >= 0) {
				//$newEl = family.prev.m[0].obj;
				eq = curEq-1;
				adjustment = 'sibling';
			} else if (buttonClass.indexOf('tvr-next-sibling') >= 0) {
				//$newEl = family.next.m[0].obj;
				adjustment = 'sibling';
				eq+= curEq+1;
			}

			var node = TvrUi.get_breadcrumb_node(level, eq);

			// navigate to new el
			if (node){
				TvrUi.dom_nav_option_used(node.$el, {
					node: node,
					level: level,
					dontReloadBreadcrumbs: 1,
					dontReloadNested: (adjustment === 'sibling'),
					domArrowAdjustment: adjustment,
					$prevActiveCrumb: $prevActiveCrumb
				});
			}

			else {
				console.log('no node', level, eq, TvrUi.breadcrumbNodesCache)
			}*/
		},

		// run common code for when a dom nav option is used: HTML, breadcrumbs, dom arrows
		dom_nav_option_used: function(newEl, config){

			config = $.extend({
				scroll: !config.isNested,
				forceHighlight: 1,
				manualSelect: 1
			}, config);

			MTF.select_element($(newEl), config);

		},

		// generate the HTML for the view code tabs on the fly before displaying the view code screen
		update_view_code_tabs: function(clearPreviousContent){

			var rootUrl = TvrUi.microUrl,
				asset_loading = TvrUi.pref.asset_loading,
				logic = asset_loading.logic,
				sassEnabled = parseInt(TvrUi.pref.allow_scss),
				count = -1,
				items = [],
				tabIndexMap = {}

			// All Sass & Last compile
			if (sassEnabled){

				items.push(
					{
						name: 'All Sass',
						tab_slug: 'all-sass',
						url: rootUrl+'draft-styles.scss',
						publish_url: rootUrl+'active-styles.scss',
						mode: 'scss'
					},
					{
						name: 'Previous Sass compile',
						tab_slug: 'previous-sass-compile',
						file: 'stdin',
						mode: 'scss',
						note: 'scss-error-notes'
					}
				)
				tabIndexMap['all-sass'] = ++count;
				tabIndexMap['previous-sass-compile'] = ++count;
			}

			// Global CSS
			if (asset_loading.global_css){
				items.push({
					name: 'Global CSS',
					tab_slug: 'global-css',
					url: rootUrl+'draft-styles.css',
					publish_url: rootUrl+'active-styles.css',
					mode: 'css'
				});
				tabIndexMap['global-css'] = ++count;
			}

			// Global JS
			if (asset_loading.global_js){
				items.push({
					name: 'Global JS',
					tab_slug: 'global-js',
					url: rootUrl+'draft-scripts.js',
					publish_url: rootUrl+'active-scripts.js',
					mode: 'js'
				});
				tabIndexMap['global-js'] = ++count;
			}

			// Conditional folders
			//console.log('asset_loading', asset_loading)

			for (let i = 0; i < logic.length; ++i) {

				var folder = logic[i],
					slug = folder.slug;

				//console.log('conditional folders', asset_loading.conditional[slug], asset_loading.conditional, asset_loading);

				// Skip empty conditional folders, which do not generate a CSS file
				if (asset_loading.conditional[slug] !== 'empty'){

					items.push($.extend(true, {
						name: TvrCom.checkObject(TvrUi.uiData, [slug, 'this', 'label']),
						type: 'conditional',
						tab_slug: 'conditional-'+slug,
						url: rootUrl+'mt/conditional/draft/'+slug+'.css',
						publish_url: rootUrl+'mt/conditional/active/'+slug+'.css',
						mode: 'css'
					}, folder));

					tabIndexMap['conditional-'+slug] = ++count;
				}

			}

			// Save tabs config for loading the relevant details when a tab is clicked
			TvrUi.generatedCodeTabs = {
				items: items,
				indexMap: tabIndexMap
			};

			//console.log('generatedCodeTabs', TvrUi.generatedCodeTabs, asset_loading);

			// Build the HTML for the tabs
			let activeTabIndex = TvrUi.get_initial_code_view_tab(),
				html = '<input class="dialog-focus" type="hidden" name="tvr_mcth[non_section][display_css_code]" value="'+activeTabIndex+'">';

			if (items.length){

				for (let i = 0; i < items.length; ++i) {

					let tab = items[i],
						activeClass = activeTabIndex === i ? 'active ' : '',
						typeClass = '';

					//console.log('Compare active tab', i, activeTabIndex, activeClass, items);

					if (tab.type === 'conditional'){
						typeClass+= 'conditional-tab ';
					}

					html+= '<span class="'+typeClass+activeClass+' mt-tab dialog-tab dialog-tab-'+i+' dialog-'+TvrCom.escapeHTML(tab.tab_slug)+'" rel="'+i+'">'+TvrCom.escapeHTML(tab.name)+'</span>';
				}

				if (clearPreviousContent){
					TvrUi.update_generated_code_editor('', activeTabIndex, items[activeTabIndex]);
				}
			}

			// Update the DOM
			TvrUi.stat.view.find('div.dialog-tabs').html(html);



			//console.log('Update tab HTML ran', tabs);

		},

		// Get initial code view tab
		get_initial_code_view_tab: function(){

			let tabs = TvrUi.generatedCodeTabs,
				tabKey = TvrUi.scss_error ? tabs.indexMap['previous-sass-compile'] : 0,
				M = TvrUi.get_selector_in_focus();

			// if we have a selector, check if we need to load a conditional folder CSS file
			if (M && !TvrUi.scss_error){

				let isConditional = MTfolder.folderIsConditional(M.sectionSlug); // TvrCom.checkObject(TvrUi.pref.asset_loading, ['conditional', M.sectionSlug]);

				if (isConditional
					&& TvrCom.checkObject(TvrUi.pref.asset_loading, ['conditional', M.sectionSlug]) !== 'empty'){
					tabKey = tabs.indexMap['conditional-'+M.sectionSlug];
				}
			}

			//console.log('get_initial_code_view_tab', TvrCom.checkObject(TvrUi.pref.asset_loading, ['conditional', M.sectionSlug]), tabKey, TvrUi.scss_error, tabs, M)

			return tabKey;
		},

		// ajust the URL display for a shorter display name, that may have some of the path
		url_short_display_name: function(url, rootUrl){
			return url.replace(RegExp(rootUrl+'(?:mt/conditional/)?'), '');
		},

		// new function for updating the generated code
		update_generated_code_editor: function(data, tabKey, tabDetails){

			//console.log('update_generated_code_editor', data, tabKey, tabDetails);

			var mode = tabDetails.mode,
				tab_slug = tabDetails.tab_slug,
				rootUrl = TvrUi.microUrl,
				beautified = '';

			// beautify the CSS output
			if (data && mode === 'css' || (mode === 'scss' && (parseInt(tabKey) !== 1 || !TvrUi.scss_error))){
				data = MTace.beautify_css_or_scss(data);
				beautified = ' ('+TvrLang.beautified+')';
			}

			MTace.update_arbitrary_editor({
				context: 'viewCSS',
				mode: mode,
				editorID: 'generated-code',
				//data: data,
				filterClass: 'generated-code',
				readOnly: true,
				directContent: data,
				tabKey: parseInt(tabKey)
			});

			// add a data attribute to the editor <pre> element so we can adjust styling with CSS
			$('#generated-code').attr('data-tab', tabDetails.tab_slug);

			// update the draft/published files or the Sass compile error infor
			if (tab_slug === 'previous-sass-compile'){
				TvrUi.toggle_scss_import_compile_note('show');
				TvrUi.toggle_view_draft_published_files('hide');
			}

			// update the view file info
			else {

				let $container = $('#view-file'),
					$draft = $container.find('.draft-file'),
					$published = $container.find('.published-file'),
					minified = parseInt(TvrUi.pref.minify_css) ? ' (minified)' : '',
					isUnpublished = !TvrCom.fileExists(tabDetails.publish_url);

				//console.log('tabDetails.publish_url', isUnpublished, tabDetails, TvrUi.pref.asset_loading_published)

				$draft.attr('href', tabDetails.url)
					.text(TvrUi.url_short_display_name(tabDetails.url, rootUrl)+beautified);

				if (isUnpublished){
					$published.removeAttr('href')
						.attr('data-unpublished', 1)
						.text(TvrUi.url_short_display_name(tabDetails.publish_url, rootUrl));
				} else {
					$published.attr('href', tabDetails.publish_url)
						.removeAttr('data-unpublished')
						.text(TvrUi.url_short_display_name(tabDetails.publish_url, rootUrl)+minified);
				}

				// show the content and ensure Sass error content is hidden
				TvrUi.toggle_scss_import_compile_note('hide');
				TvrUi.toggle_view_draft_published_files('show');
			}

		},


		// update all view CSS tabs in one go
		/*update_view_css: function(data, index, action, $message, url){ TvrCom.startT(arguments);

			// if we're yet to load the CSS file
			if (action === 'loadNew') {

				// reset object keeping track of auto-scroll to line
				MTace.generated_css_auto_line_done = {};

				//console.log(TvrUi.scss_error, TvrUi.scss_error, $scssErr);

				// load the CSS (for all tabs)
				TvrUi.stat.view.find('div.dialog-tab-field').each(function(index){

					var $content = $(this),
						url = $content.find('div.view-file').find('a').first().attr('href');

					// load stylesheet content
					if (url){

						MTsave.simple_ajax_request({
							'url': url,
							'plus': TvrLang.retrieve_css,
							'minus': TvrLang.retrieve_css_failed,
							'cbFunction': TvrUi.update_view_css,
							'cbfArgs': [index, 'aceContent', false, url] // data will be prepended by ajax function
						});
					}

					// client-side SCSS error editor
					else {

						var $tab = TvrUi.stat.view.find('.dialog-tab-'+index),
							lastErrorData = TvrUi.scss_error ? TvrUi.scss_error.fullString : false,
							aceContent = lastErrorData ? lastErrorData : TvrUi.previousSCSSCompile;

						TvrUi.update_view_css(aceContent, index, 'aceContent', false, url);
					}

				});
			}

			// this function is called again after successful ajax, finish by updating ACE editors
			else {

				//console.log('the data for the file', index, url, data)

				// beautify the CSS output (unless we're showing a minified file deliberately)
				if (!url || url.indexOf('micro-themes/min') < 0){
					data = MTace.beautify_css_or_scss(data);
				}

				MTace.update_arbitrary_editor({
					'context': 'viewCSS',
					//'editorID': 'generated-code-'+index,
					'editorID': 'generated-code',
					'data': data,
					'filterClass': 'generated-code',
					'readOnly': true,
					'directContent': data,
					'index': index
				});
			}

			TvrCom.endT(arguments)
		},
*/
		// update the inspect CSS stylesheet preview
		update_inspector_stylesheet: function(data, find, action){ TvrCom.startT(arguments);

			// if we're yet to load the CSS file
			if (action == 'loadNew') {

                MTsave.simple_ajax_request({
					skipQueue: 1,
					'url': find.url,
					'plus': TvrLang.retrieve_css,
					'minus': TvrLang.retrieve_css_failed,
					'cbFunction': TvrUi.update_inspector_stylesheet,
					'cbfArgs': [find] // data will be prepended by ajax function
				});
			}

			// this function is called again after successful ajax, finish by updating ACE editors
			else {
				MTace.update_arbitrary_editor({
					'context': 'inspectorStylesheet',
					'editorID': 'inspect_stylesheet_preview',
					'data': data,
					'filterClass': 'inspect_stylesheet_preview',
					'readOnly': true,
					'directContent': data,
					'containerClass': '.content-main',
					'find': find
				});
			}
			TvrCom.endT(arguments)
		},


		/***
		 LEFT SIDEBAR (FORMERLY FIXED MENU) FUNCTIONS
		 ***/

		/*** 'reset' button is clicked ***/
		ui_reset: function($clicked){ TvrCom.startT(arguments);
			// warn against resetting ui settings
			var r=confirm(TvrLang.reset_settings_confirm);
			if (!r) {
				return false;
			} else {

                // clear any pending saves so they don't happen after reset.
			    MTsave.pending_auto_saves('clear');

				// submit reset request via ajax
				var action = 'reset',
					url = TvrUi.ajaxUrl,
					inProg = TvrLang.reset_empty_folders,
					sendType = 'GET',
					sendData = 'mt_action=tvr_ui_reset';
				MTsave.general_ajax_submission(action, url, inProg, sendType, sendData);
			}
			TvrCom.endT(arguments)
		},

		// get css filter alias
		get_css_filter_alias_orig: function($clicked, aspect){ TvrCom.startT(arguments);
			var $filter_scope = $('#css-filters');
			var fClass = TvrUi.pseudo_class_format($clicked.closest('li').data('pref_sub_key')),
				$aliasScope = !TvrCom.isDomEl($clicked.closest('#fav-filters'))
					? $('#fav-filters') : $filter_scope.find('span.quick-opts-wrap'),
				$li = $aliasScope.find('li.'+fClass);
			TvrCom.endT(arguments)
			return (aspect != 'favourite_filter') ? $li : $li.find('.star-icon');

		},

		// get css filter aliases (these can be set in 3 places (hover and page-id)
		get_css_filter_alias: function($clicked, aspect){

			var $excludeThis = $clicked.closest('li'),
				filter = 'li.'+TvrUi.pseudo_class_format($clicked.closest('li').data('pref_sub_key'));

			return TvrUi.otherFilters(filter, $excludeThis);


			/*var $filter_scope = $('#cm-css-filters');
			var fClass = TvrUi.pseudo_class_format($clicked.closest('li').data('pref_sub_key')),
				$aliasScope = !TvrCom.isDomEl($clicked.closest('.fav-filters'))
					? $filter_scope
					: $filter_scope.find('span.quick-opts-wrap'),
				$li = $aliasScope.find('li.'+fClass);

			return $li; //(aspect !== 'favourite_filter') ? $li : $li.find('.fav-filter');*/

		},

		// clear all css filters
		clear_css_filters: function(exclLocked){ TvrCom.startT(arguments);

			TvrUi.stat.cssModifiers.find('li.css-filter-item').each(function(i){

			    var $this = $(this),
					data = $this.data(),
					type = data.type,
                    skip = exclLocked && type === 'page_specific';

			    if (!skip){

			    	if ($this.hasClass('on')){

						var $alias = TvrUi.get_css_filter_alias($this),
							$combined = $this;

						if ($alias.length){
							$combined = $combined.add($alias);
						}

						$combined.removeClass('on');

						delete TvrUi.pref[type][data.pref_sub_key];

						//console.log('resetting the pref', type, data.pref_sub_key, TvrUi.pref)

						//but don't trigger toggle_feature as that does things to the selector
						// suggestions that we don't want when saving or cancelling a draft selector
						// (as it runs psuedo updated, which is intended for updating suggestion lists)
						//TvrUi.toggle_feature($this);
					}
					// todo ensure all editable values get reset to

					if ($this.hasClass('filter-editable')){

						var $input = $this.find('.cssfilter-combo'),
							nameValue = $input.attr('name'),
							bracketValue = nameValue.match(/\((.+?)\)/),
							resetValue = bracketValue ? bracketValue[1] : '';

						//console.log('bracketValue', bracketValue)

						$this.find('.cssfilter-combo').val(resetValue);
					}
				}



			});

			TvrUi.stat.tvr.removeClass('pseudo_classes pseudo_elements');

			TvrCom.endT(arguments)
		},

		/*** 'clear styles' link is clicked ***/
		/*clear_styles: function($clicked, $menCon, e){ TvrCom.startT(arguments);
			// warn against clearing styles
			var r=confirm(TvrLang.clear_styles_confirm);
			if (!r) {
				return false;// submit reset request via ajax
			} else {
				var action = 'clear',
					url = TvrUi.ajaxUrl,
					inProg = TvrLang.clear_styles,
					sendType = 'GET',
					sendData = 'mt_action=tvr_clear_styles';
				MTsave.general_ajax_submission(action, url, inProg, sendType, sendData);
			}
			TvrCom.endT(arguments)
		},*/

		force_styles_analysis: function(){
			TvrUi.tooMuchCSS = false;
			TvrUi.forceStylesAnalysis = true;
			MTdd.update_stylesheet_rules();
		},

		get_custom_prefix_combo_data: function(request, response){

			var bodyClasses = TvrUi.format_combo_suggestions(false, 'body_classes',  (
					TvrCom.checkObject(MTF, ['dom', 'search', 'sigAtts', 'pageOtherClass']) || []
				)),
				recentPrefixes =  TvrUi.format_combo_suggestions(false, 'recent',  (
					TvrUi.pref.recent_custom_prefixes
				)),
				results = recentPrefixes.concat(bodyClasses);

			//console.log('get_custom_prefix_combo_data', TvrUi.pref.recent_custom_prefixes, results);

			response(results);
		},

		url_pages_cache: {},
		url_pages_cache_previous_result: [],
		logic_pages_cache: {},
		logic_pages_cache_previous_result: [],
		search_pages_latest_term: null,
        get_item_from_previous_results: function(path, results){

		    results = results || this.url_pages_cache_previous_result;

            for (var i = 0; i < results.length; i++) {

                var result = results[i];

                if (path === result.value){
                    return result;
                }
            }

            return false;

        },
		filter_code_suggestions: function(request, response){

			var term = request ? request.term.toLowerCase() : null,
				results = TvrUi.filter_matching_results(term, TvrMT.data.prog.combo.all_sel_suggestions);

			//console.log('we should filter the code sug', term, request, response);

			// return search results
			response(results);
		},

		filter_matching_results: function(term, results){

			var filteredResults = [];

            for (var i = 0; i < results.length; i++) {

            	var item = results[i],
					combinedStr = item ? item.value+item.label+item.category : '';

            	//console.log('the stuff to check', term, i, item, combinedStr);

            	// if search term is in either post title or path
            	if (
					(!item.logic_only || TvrUi.conditionLogicSiteSearch) &&
					(!term || combinedStr.match(new RegExp(TvrCom.escapeRegExp(term), 'i')))
				){

					// use the label for the value with conditional site search
					// by deleting the value property
					/*if (TvrUi.conditionLogicSiteSearch){
						item.url = item.value;
						delete item.value;

					}*/

					filteredResults.push(item);
                    //console.log('we matched it', i, item, combinedStr);
				}
            }

            return filteredResults;

		},

        prepend_recent_paths: function(term, results){

			if (!MTF){
				return results;
			}

		    var recent = [], //[''], // one empty for first [clear] option
                recentPaths = !TvrUi.conditionLogicSiteSearch
						? TvrMT.data.prog.combo.custom_paths
						: TvrMT.data.prog.combo.recent_logic,
				currentPageTitle = MTF.get_current_page_title(),
				recentTitles = {},
				i = 0,
				item;

			//console.log('The custom paths plain object', TvrMT.data.prog.combo.custom_paths)

			// remove any existing "Recent" results to prevent duplicates
			for (i = (results.length-1); i >= 0; i--) {

				item = results[i];

				// remove the target path
				if (item.category === TvrLang.recent){
					//console.log('remove the recent item', item.category, item.label, item.value);
					results.splice(i, 1);
				}
			}

		    // format paths
            for (i = 0; i < recentPaths.length; i++) {

				item = recentPaths[i];

                // accommodate old string value and new data with path and page title
                var isAlreadyObject = (item === Object(item)),
                    label = isAlreadyObject ? item.label : item,
                    value = isAlreadyObject ? item.value : item,
					item_id = isAlreadyObject ? item.item_id : null,
					logic = isAlreadyObject ? item.logic : null,
					exclude_logic = isAlreadyObject ? item.exclude_logic : null,
					logic_only = isAlreadyObject ? item.logic_only : null,
					unTaggedLabel = label;

				if (!TvrUi.conditionLogicSiteSearch){

					// maybe add (current page) to label
					if (currentPageTitle && label === currentPageTitle){
						label+= ' ('+TvrLang.current_page+')';
						//console.log('It is the current page', $.extend(true, {}, item), item_id)
					}

					// fix past issue with Oxygen ct_template not loading with (required) ct_builder param
					if (value.indexOf('ct_template') > -1){

						// actually ct_template can't be loaded without first loading admin screen (an O2 quirk)
						continue;

						//value = TvrCom.append_url_param(value, 'ct_builder', 'true'); // will only add if not already
					}
				}



                recent.push({
                    label: label ? label : value,
                    value:  value, // TvrCom.strip_page_builder_and_other_params(value), // value, //
                    category: TvrLang.recent,
					item_id: item_id,
					logic: logic,
					exclude_logic: exclude_logic,
					logic_only: logic_only,
                });
            }

            //console.log('the recent results', $.extend(true, [], recent));

            //results = recent.concat(results);

			// we should have a convenient option for adding the current page logic
			if (TvrUi.conditionLogicSiteSearch && MTF){

				let MTDynFrontData = MTF.getMTDynFrontData(),
					title = MTDynFrontData.title,
					logic = MTDynFrontData.logic;

				recent.unshift({
					label: title,
					value:  logic,
					category: TvrLang.current_page,
					item_id: MTDynFrontData.post_id,
					logic: logic,
					logic_only: 1,
				});

			}

            return recent.concat(results);

        },

		// clear a recently viewed page
		clear_recent_page_path: function($clicked, e){

			e.preventDefault();

			var $input = $('#previewPath'),
				$option = $clicked.closest('li'),
				targetPath = $option.attr('data-path'),
				recentPaths = TvrMT.data.prog.combo.custom_paths;

			//console.log('clear_recent_page_path', targetPath, $option);

			for (var i = recentPaths.length -1; i >= 0; i--) {

				var item = recentPaths[i],
					isAlreadyObject = (item === Object(item)),
					path = isAlreadyObject ? item.value : item;

				// remove the target path
				if (targetPath === path){
					recentPaths.splice(i, 1);
				}

			}

			// reload the autocomplete
			$input.MTautocomplete("search", $input.val());
			//TvrUi.resolve_combobox_source($('#previewPath'), true, true, '');

			// save the new custom_paths
			// ajax save the suggestions
			MTsave.simple_ajax_request({
				'type': 'POST',
				'url': TvrUi.ajaxUrl+'&update_custom_paths=1',
				'sendData': MTsave.serialized_data_with_single_key( JSON.stringify(recentPaths)  ),
				'plus': '',
				'minus': ''
			});

			//console.log('here we go after', $.extend(true, [], recentPaths))

		},

        // return site page results
        return_page_results: function(term, response, results, cacheKey){

            //console.log('the unmodified results', $.extend(true, [], results));

            // cache previous result so instant filtering can happen while more results are being fetched from server
			TvrUi[cacheKey+'_previous_result'] = results;

            // prepend recent pages to search results
            results = TvrUi.prepend_recent_paths(term, results);

            //console.log('the pre-filtered results', $.extend(true, [], results));

            // filter the results to match the search term
            results = TvrUi.filter_matching_results(term, results);

            //console.log('the final results returned', $.extend(true, [], results));

            // if remote results should be cached for instant update on typing
            if (cacheKey){

                TvrUi[cacheKey][term] = results;

                // prevent cache from growing over x terms
                var cacheKeys = Object.keys(TvrUi[cacheKey]);
                if (cacheKeys.length > 9){
                    delete TvrUi[cacheKey][cacheKeys[0]];
                }
            }

            // return search results
            response(results);

        },
        get_site_pages: function(request, response){

		    //console.log('request, response', request, response);
			var $changeUrlInputWrap = TvrUi.stat.changeUrlInputWrap,
				$searchInput = $('#previewPath'),
				existingValue = $searchInput.val(),
				term = request && request.term
					? request.term.toLowerCase()
					: (TvrCom.isDefined(existingValue) ? existingValue : null),
				cacheKey = TvrUi.conditionLogicSiteSearch
					? 'logic_pages_cache'
					: 'url_pages_cache';

		    // store latest search term so remote data filters by that, not the term used when request started
		    TvrUi.search_pages_latest_term = term;

		    // return the default set of site pages if no search term
		    if (!term){
                // console.log('No term, return static cache of pages with dyn recent', TvrMT.data.dyn.site_pages);
		        TvrUi.return_page_results(term, response, TvrMT.data.dyn.site_pages);
                return;
			}

			// we need to connect to sever, but that takes time,
			// show term cache or previous results while loading gif runs
			//console.log('We need to connect to server, but return term cache / previous results while fetching');

			// use cached previous response if we have a match
			if (TvrUi[cacheKey][term]){
                //console.log('Cache available, return cache while loading new results');
                TvrUi.return_page_results(term, response, TvrUi[cacheKey][term]);
               //   return;
			}

			// fallback to previous response which can be filtered while new data loads
			else {
				//console.log('Show previous results while fetching new results');
				TvrUi.return_page_results(term, response, TvrUi[cacheKey+'_previous_result']);
			}


            // signal we are connecting to server
            $changeUrlInputWrap.addClass('active');

            // new server request (after time for user to finish typing)
            TvrCom.action_after_timeout('site_page_search', 200, {

                item: function(config){

                    //console.log('Begin ajax fetch', term);

					// signal that we are doing a site search in order to generate the logic
					var logicParam = TvrUi.conditionLogicSiteSearch ? '&logic_format=1' : '';

                	MTsave.simple_ajax_request({
						skipQueue: 1,
                        type: 'GET',
                        url: TvrUi.ajaxUrl+'&get_site_pages=1&search_term='+term+logicParam,
                        cbFunction: function(data, termAtRequest){

                            //console.log('the returned data', termAtRequest, TvrUi.search_pages_latest_term, JSON.parse(data));

                            // filter remote data by most up-to-date search term
                            //var dataArr = TvrUi.filter_matching_results(TvrUi.search_pages_latest_term, JSON.parse(data));

                            var remoteResults = JSON.parse(data);
                            //console.log('the remote results data', $.extend(true, [], remoteResults));

                            // return results
                            TvrUi.return_page_results(TvrUi.search_pages_latest_term, response,  remoteResults, cacheKey);

                            // signal server connection complete
                            $changeUrlInputWrap.removeClass('active');

                        },
                        cbfArgs: [term]
                    });

                },
                args: [{

				}]
            });



        },

		/*** 'Restore' link is clicked ***/
		restore_rev: function($clicked){ TvrCom.startT(arguments);
			// warn against restoring
			var r=confirm(TvrLang.restore_settings_confirm);
			if (!r) {
				return false;
			} else {
				var action = 'restore',
					url = TvrUi.ajaxUrl,
					inProg = TvrLang.restore_settings,
					sendType = 'GET',
					sendData = $clicked.attr('rel');
				MTsave.general_ajax_submission(action, url, inProg, sendType, sendData);
			}
			TvrCom.endT(arguments)
		},

        toggle_revision_save_status: function($clicked){

		    var on,
                newTipKey,
				$elsToToggleClass = $clicked.add($clicked.closest('tr'));

		    // save revision
		    if (!$clicked.hasClass('revision-is-saved')){
                $elsToToggleClass.addClass('revision-is-saved');
                on = 1;
                newTipKey = 'neg';
            }

            // unsave revision
            else {
                $elsToToggleClass.removeClass('revision-is-saved');
                on = 0;
                newTipKey = 'pos';
            }

            // update tooltip
            //TvrUi.refresh_tt($clicked, $clicked.data(newTipKey));

            // update revision status
			MTsave.simple_ajax_request({
				type: 'GET',
				url: TvrUi.ajaxUrl+'&rev_save_status='+on+'&rev_id='+$clicked.attr('rel')
			});

		    /*$.get(TvrUi.ajaxUrl+'&rev_save_status='+on+'&rev_id='+$clicked.attr('rel'), function() {
                // some feedback here
            });*/

        },

		buildOptions: function(){

		},


		// set typing timer for inputs / color picker
		set_input_timer: function(interval){

			const timeOut = interval || TvrUi.inputTypingInterval;

			TvrCom.action_after_timeout('typing', timeOut, {
				item: TvrUi.done_typing,
				args: []
			});

			//TvrUi.get_local_window_function('maybe_hide_mt_highlight')();

           /* interval = interval ? interval : TvrUi.inputTypingInterval;

			if (TvrUi.timer['typing']) {
				//console.log('clear typing timer', TvrUi.timer['typing']);
				clearTimeout(TvrUi.timer['typing']);
			}

			// can't pass $obj to done_typing without triggering the func so cache
			TvrUi.timer['typing'] = setTimeout(TvrUi.done_typing, interval);*/
            //console.log('setup typing timer', TvrUi.timer['typing']);
		},

        // set timer for waiting before save - inputs / picker / ace (inline and full)
        set_defer_save_timer: function(config, name){

			// have unique timer for each field so only make additional edits to the same field clears a timer
			var timer = 'save'+name;

            if (TvrUi.timer[timer]) {
                //console.log('clear save timer', timer, TvrUi.timer[timer]);
                clearTimeout(TvrUi.timer[timer]);
            }

            // setup timer, if field isn't editing before e.g. 5 seconds, the save is actioned
            TvrUi.timer[timer] = setTimeout(MTsave.action_save, TvrUi.beforeSaveInterval, config);
            //console.log('setup save timer', timer, TvrUi.timer[timer]);
        },

		// extract the styles contained within the selector braces {}
		extract_inner_styles: function(code){

        	// remove last }
			code = TvrCom.remove_only_last_char(code, '}');

			// remove the opening sel code
			code = code.split('{');

			var codeStr = code[1] ? code[1] : '';

			// account for nested selectors in scss
			if (codeStr){
				code.shift()// remove first array item (sel code)
				codeStr = code.join('{');
			}

			// trim whitespace
			return codeStr.trim();
		},

		// actions to be performed instantly after an edit is made to a field
		post_edit: function($obj){ TvrCom.startT(arguments);
			$obj.each(function(i) {
				var $this = $(this);
				TvrUi.update_input_width_and_scroll($this);
                // todo auto-scroll right if edited field grows beyond viewport
				TvrUi.adjust_comp_span($this, 'after');
			});
			TvrCom.endT(arguments)
		},


        // adjust display of event target/value based on event field value
        adjust_event_fields: function($obj){

		    var $fields,
				eventKey = TvrCom.convert_to_param($obj.val(), ''),
                $field_wrap = $obj.closest('.field-wrap'),
                $event_target = $field_wrap.siblings('.event-target-field'),
                $event_value = $field_wrap.siblings('.event-value-field');

			//console.log('we should replace by striping', $obj.val(), eventKey)

            // if event
            if (TvrCom.hasValue(eventKey) ){

                $fields = $event_value;

                // if JS event, show event target field as well
                if (MTdd.event_type(eventKey) !== 'css'){
                    $fields = $fields.add($event_target);
                } else {
                    // if css event, ensure event target is hidden and cleared
                    TvrUi.hide_property_fields($event_target);
                }

                // show fields
                //$fields.show('fast');
				$fields.addClass('show-event-fields');
            }

            // no event - hide and clear event target / value
            else {
				$fields = $event_value.add($event_target);
                TvrUi.hide_property_fields($fields);
            }

			// adjust the buttons after allowing the fade animation to finish
			MTF.after_animation($fields.first(), {
				type: 'transition',
				cb: function(){
					TvrUi.adjust_scroll_buttons(TvrUi.get_pg_meta(), 'style');
				}
			});

        },

		// get the default CSS unit for a property
		get_default_unit: function(groupSlug, propertySlug){

            return TvrCom.checkObject(TvrUi.pref, [
                'my_props', groupSlug, 'pg_props', propertySlug, 'default_unit'
            ], true);
		},

		// get the default CSS unit for a property
		get_factory_default_unit: function(cssf, prop){

			if (!cssf){
				cssf = TvrCom.prop_to_cssf(prop);
			}

			return TvrCom.checkObject(TvrMT.data.prog.lh, [cssf, 'fdu'], true);

		},

		// update the the default CSS unit for a property
		update_default_unit: function(groupSlug, propertySlug, cssUnit){

			TvrCom.updateObject(TvrUi.pref, [
				'my_props', groupSlug, 'pg_props', propertySlug, 'default_unit'
			], cssUnit);

			//console.log('it was updated', TvrUi.pref.my_props[groupSlug])
		},

		// maybe auto-adjust value with CSS unit
		maybe_set_unit: function(propertyData, groupSlug, propertySlug, val, $input){

			//var val = $obj.val();
			if (!val){
				return false;
			}
			
			// use the unit set on the individual property (which gets explicitly set when applying any value)
			// the default unit should not be required, unless js upgrade process perhaps
			var cssUnit = propertyData.unit !== undefined
				? propertyData.unit
				: TvrUi.get_default_unit(groupSlug, propertySlug);

			//console.log('cssUnit', cssUnit, propertyData, groupSlug, propertySlug, val, $input);

			// is it a field that might have a numeric value?
			if (TvrCom.isDefined(cssUnit)){

			    // before analysing spaces, remove any trailing or inside excel formulas
				val = val.trim()
					.replace(/=(?:.+)(\(.*?\))/g, function(match){
						return match.replace(/ /g, '');
					});

				var origVal = val,
                    Result = {
					'val': val,
					'converted': false,
					'calc': ''
				};

				// if single value
				if (val.indexOf(' ') < 0){
					Result = TvrUi.do_conversion(val, cssUnit, propertySlug, 0, $input);
				}

                // else space separated values
				else {

					var arr = [],
                        bits = val.split(' ');

					for (var i in bits){
						if ( ! bits.hasOwnProperty(i) ) continue; // for compat
						var r = TvrUi.do_conversion(bits[i], cssUnit, propertySlug, i, $input);
						arr[i] = r.val;
						if (r.converted){
							Result.converted = true;
							Result.calc+= (i != 0) ? ', '+ r.calc : r.calc;
						}
					}
					Result.val = arr.join(' ');
				}

				// if conversion was successful, update
                /*if ($input){

				    if (Result.converted){

                        $input.val(Result.val);

                        //alert('it updated');

                        //console.log('The conv Result', Result, $input.val());

                        // globally save conversion, to prevent combo select overwriting and use original for recent
                        TvrUi.last_field_val_converted = Result;
                        TvrUi.last_field_val_converted.origVal = origVal;

                        TvrUi.update_input_width_and_scroll($input);
                        TvrUi.maybe_sync_fields($input);

                    } else {
                        TvrUi.last_field_val_converted = false;
                    }

                }*/

				return Result;
			}
		},

		// do conversion on single number/formula
		do_conversion: function(val, cssUnit, propertySlug, spacedIndex, $input){

		    var Result = {
				'val': val,
				'converted': false,
				'calc': ''
			};

			if ( MTwidget.unitCouldBeAdded(val, cssUnit) ){

			    // if plain unit appending
			    if (cssUnit){
					Result.val = val+cssUnit;
					Result.converted = true;
				}
			}

			// if excel formula
			else if (val.charAt(0) === '='){
				Result = TvrUi.process_excel_function(val, propertySlug, spacedIndex, $input);
			}

			return Result;
		},

		// extract function name and params e.g. =%(240) and then convert value
		process_excel_function: function(str, propertySlug, spacedIndex, $input){

		    var Result = {
				'val': str,
				'converted': false,
				'calc': ''
			};

			// get function name
			var tmp = str.split('(');
			if(!tmp[0] || !tmp[1] || tmp[1].indexOf(')') < 0){
				return Result;
			}

			var functionName = tmp[0].replace('=', '');

			// get params (and clean)
			var params = tmp[1].replace(')', '').split(',');
			for (var i in params){
				if ( ! params.hasOwnProperty(i) ) continue; // for compat
				params[i] = params[i].trim();
				// if a param is undefined, return
				if (!TvrCom.isDefined(params[i])){
					return Result;
				}
			}

			// do we default to the first el in selection?
			var elIndex = 0;
			var nodeCSS = TvrUi.nodeCSS[0];

            // bail if selector doesn't target an element
            if (!nodeCSS){

                // make translatable
                MTsave.log({
                    'short': 'Auto-conversion could not be calculated',
                    'long': '<p>The current selector may not target any elements on the current page.</p>',
                    'type' : 'warning'
                });

                return Result;
            }

			if (params[1]){
				nodeCSS = TvrUi.nodeCSS[params[1]-1]; // no zero index for user
			}

			return TvrUi.auto_convert(params[0], functionName, nodeCSS, propertySlug, str, spacedIndex, $input);

		},

		// convert a unit (e.g. px) into another (e.g. em)
		auto_convert: function(input, output, nodeCSS, propertySlug, origStr, spacedIndex, $input){ TvrCom.startT(arguments);

		    var Result = {
				'val': origStr,
				'converted': false,
				'calc': ''
			};

			//var M = TvrUi.get_meta($obj, 'property');

			var curProp = propertySlug;

			var tip = false;
			var node, prop, nodeVal, calc, short, long;
			var autoMap = TvrMT.data.prog.autoMap;

			// get values from map (if map is relevant)
			if (autoMap[curProp] && autoMap[curProp][output]){

			    // if the map is a valid array
				if ($.isPlainObject(autoMap[curProp][output]) || autoMap[curProp][output][0]){

				    node = autoMap[curProp][output]['node'];
					prop = autoMap[curProp][output]['prop'];

					// properties like bg pos and size need diff calc depending on first or second value (width vs height)
					if (Array.isArray(prop)){
						prop = prop[spacedIndex];
					}
					prop = prop.replace(/_/g, '-');
					nodeVal = parseInt(nodeCSS[node][prop].replace('px', ''));

					// if there a tip for the conversion? e.g. height
					if (TvrCom.hasValue(autoMap[curProp][output]['tip'])){
						tip = '<p>'+autoMap[curProp][output]['tip']+'</p>';
					}
				}

				// it can't be done, show message
				else {
				    if ($input){
                        var status = {
                            'short': 'Auto-conversion aborted',
                            'long': '<p>'+autoMap[curProp][output]+'</p>',
                            'type' : 'warning'
                        }
                        MTsave.log(status);
                    }
					TvrCom.endT(arguments)
					return Result;
				}
			}

			// convert pixel to percentage
			if (output === '%'){
				calc = (input/nodeVal)*100;
				// prepare message
				short = input+ 'px / '+nodeVal+ 'px * 100 = '+parseFloat(calc.toFixed(3).toString())+output;
				long = input+ 'px divided by '+nodeVal+ 'px ('+node+' '+prop+') multiplied by 100 = <b>'+calc+output+'</b>';
			}

			// convert pixel to em
			else if (output === 'em' || output === 'rem'){

			    prop = 'font-size';

				// em
				if (output == 'em'){
					node = 'element';
					// no need for map as almost always el font
					if (curProp == 'font_size'){
						node = 'parent';
					}
					nodeVal = parseInt(nodeCSS[node]['font-size'].replace('px', ''));
				}

				// rem
				else {
					node = 'HTML base';
					nodeVal = TvrUi.baseFontSize;
				}

				// calculate and prepare message
				calc = input/nodeVal;
				short = input+ 'px / '+nodeVal+ 'px = '+parseFloat(calc.toFixed(3).toString())+output;
				long = input+ 'px divided by '+nodeVal+ 'px ('+node+' '+prop+') = <b>'+calc+output+'</b>';
			}

			if (!calc){
				TvrCom.endT(arguments)
				return Result;
			}

            if ($input){

			    // log how conversion was calculated
                var status = {
                    'short': short,
                    'long': '<p>'+TvrLang.auto_conversion_performed+': <b>'+origStr+'</b><br />' +
                    long+'<br />'+TvrLang.auto_values_rounded+'</p>',
                    'type' : 'info'
                };

                // if there is a tip for the conversion? e.g. height
                if (tip){
                    status['long']+= tip;
                }

                MTsave.log(status);
            }

			// populate result
			Result = {
				'val': parseFloat(calc.toFixed(3).toString())+output,
				'converted': true,
				'calc': short
			};

			TvrCom.endT(arguments)
			return Result;
		},

		update_packs_obj: function(pack){

			//console.log('We have pack', pack)

			TvrMT.data.prog.combo.directories.push(pack);
			// sort alphabetically
			TvrMT.data.prog.combo.directories.sort();
		},

		// when impot icon in manage packs is clicked
		set_import_field: function(val){
			$('#import_from_pack_name').val(val);
		},
		handle_ajax_error: function(x,e){
			if(x.status==0){
				return TvrLang.error_connection;
			}
			else if(x.status==404){
				return TvrLang.error_404;
			}
			else if(x.status==500){
				return TvrLang.error_500;
			}
			else if(e=='parsererror'){
				return TvrLang.error_parser;
			}
			else if(e=='timeout'){
				return TvrLang.error_timeout;
			}
			else {
				return TvrLang.error_unknown +'\n';
			}
		},


		/***
		 SIDE MENU FUNCTIONS
		 ***/


		/***
		 DIALOG FUNCTIONS
		 ***/
		show_dialog: function($clicked){ TvrCom.startT(arguments);

			// close any previously open dialogs (sometimes users may navigate from one dialog to the next)
			TvrUi.close_dialog(true);

			// normalise e.g. for top right menu (find first parent with rel attr)
			$clicked = $clicked.attr('rel')
				? $clicked
				: $clicked.closest('*[rel]');

			var dialog = $clicked.attr('rel');

			if (dialog === 'not-yet'){
				return false;
			}

			// add show classes
			$('#'+dialog+'-dialog').addClass('show');
			TvrUi.stat.dialogs.addClass('show');


			// setup dialog
			if (dialog === 'mt-initial-setup'){

				TvrMT.hooks.doAction('setupDialogShown');
			}

			// if import
			else if (dialog === 'import-from-pack'){

				// if the quick import icon was clicked from the manage packs page - preselect
				if ( TvrCom.hasValue($clicked.attr('data-pack-name')) ){
					$('#import_from_pack_name').val($clicked.attr('data-pack-name'));
				}

				// if the css import editor hasn't been bound yet, bind
				if (!$('#preview-import-css-0').hasClass('ace_editor')){
                    MTdd.update_import_css_editor('');
				}

			}

			// if export
			else if (dialog === 'export-to-pack'){
				var folders = '';
				$('#tvr-menu').find('.section-tag').each(function() {
					var M = TvrUi.get_meta($(this), 'section');
					// only auto-check folders that have some selectors
					var numSels = parseInt(M.sectionM.find('.selector-count-state').attr('rel'));
					var checkedAttr = '';
					var onState = '';
					if (numSels > 0){
						checkedAttr = 'checked="checked"';
						onState = 'on';
					}
					folders+='<li><input type="checkbox" name="export_sections['+M.sectionSlug+']" ' +
					checkedAttr+' /> ' +
					'<span class="fake-checkbox '+onState+' mtif mtif-tick-box-unchecked"></span>' +
					'<span class="folder-icon tvr-icon"></span>' +
					'<span class="ef-label">'+TvrCom.escapeHTML(M.sectionH)+'</span></li>';

				});
				$('#available-folders').html(folders);
				// only check custom stylesheets by default if they contain code
				//TvrUi.update_code_editor_textareas();
				var $exportBoxes = $('#custom-css');
				TvrUi.stat.code.find('textarea.hand-css-textarea').each(function(i){
					var $this = $(this);
					var $fakeCheck = $exportBoxes.find('.'+'custom-'+$this.attr('id'));
					if (TvrCom.hasValue($this.val())){
						TvrCom.check_fake($fakeCheck);
					} else {
						TvrCom.uncheck_fake($fakeCheck);
					}
				});
				// set the export input to nothing
				$('#export_to_pack').val(1);
				$('#export_pack_name').val('');
				// set the check all to unchecked
				$('#toggle-checked-folders').find('input').prop('checked', false)
					.end().find('.fake-checkbox').removeClass('on');
			}

			// if display CSS
			else if (dialog === 'display-css-code'){

				// Generate the view code tabs on the fly
				TvrUi.update_view_code_tabs(true);

				// Ensure we are viewing the latest code by saving the settings first
				MTsave.ajax_save_settings({
					context: 'view-code',
					settings: {},
					noSaveDelay: true,
					essentialSave: 1
				});
			}

			// view inspector stylesheet
			else if (dialog === 'inspect-stylesheet'){

				var selector = TvrCom.escapeRegExp($clicked.data('selector')),
					selectorPattern = selector+'\\s*?{?',
					find = {
						url: $clicked.data('href'),
						media: $clicked.data('media'),
						selector: selector,
						findSelectorParts: true,
						selectorPattern: selectorPattern
					};

				TvrUi.update_inspector_stylesheet(false, find, 'loadNew');
			}

			// if display revision
			else if (dialog === 'display-revisions'){
				TvrUi.ajax_load_revisions_table();
			}

			// if manage packs
            else if (dialog === 'manage-design-packs'){
                TvrUi.reload_iframe($clicked, 'manage');
            }

            // if fonts
            if (dialog === 'google-fonts'){
                TvrUi.gFontTarget = $clicked.closest('.field-wrap').find('.property-input');
                TvrUi.reload_iframe($clicked, 'google_fonts');
            }

			// if docs
			else if (dialog === 'program-docs'){ // || dialog === 'get-started-tips'
				TvrUi.reload_iframe($clicked, 'docs', $('#docs-url').attr('rel'), true);
			}

			// If JS libraries
			//console.log('dialog', dialog, TvrUi.pref.npm_dependencies)
			if (dialog === 'mt-enqueue-js'){
				MThtml.npm.updateDependencyTableRows(
					$('#mt-enqueue-js-dialog').find('.dependency-table-wrap').find('.dependency-rows'),
					TvrUi.pref.npm_dependencies
				);
			}



			TvrCom.endT(arguments)
		},
		// close any dialog
		close_dialog: function(signalAlreadyActive, $clicked){ TvrCom.startT(arguments);

			var $dialogs = TvrUi.stat.tvr.find('div.tvr-dialog.show');
			// TvrUi.stat.dialogs.find('div.tvr-dialog.show');

			//console.log('close_dialog', signalAlreadyActive, $dialogs.length, $dialogs)

			if (signalAlreadyActive && $dialogs.length){
				TvrUi.stat.dialogs.addClass('dialog-already-showing');
			} else {
				TvrUi.stat.dialogs.removeClass('dialog-already-showing');
			}

			TvrUi.stat.dialogs.removeClass('show');

			// Closes any showing dialogs
			$dialogs.removeClass('show');

			// reset any dialogs values that might need resetting
			$('#export_to_pack, #new_pack').val(0);

			TvrCom.endT(arguments)
		},

		// reload css ref iframe
		reload_docs_iframe: function($clicked){ TvrCom.startT(arguments);

			var frame = 'docs_iframe',
				url = $('#docs-url').attr('rel');

			if (TvrCom.hasValue($clicked.attr('data-docs-index'))){
				url+= '&docs_index=1';
			}
			if (TvrCom.hasValue($clicked.attr('data-prop-group'))){
				url+= '&prop_group='+$clicked.attr('data-prop-group');
			}
			if (TvrCom.hasValue($clicked.attr('data-prop'))){
				url+= '&prop='+$clicked.attr('data-prop');
			}

			var $iframe = $('#'+frame);
			window.frames[frame].location = url;
			TvrCom.endT(arguments)
		},

		// reload an iframe, unless content has loaded
		reload_iframe: function($clicked, type, url, forceReload){

			var frame = type+'_iframe',
				$iframe = $('#'+frame);

				url = url ? url : $iframe.attr('rel');


			// docs URL changes depending on property
            if (type === 'docs'){
                if (TvrCom.hasValue($clicked.attr('data-docs-index'))){
                    url+= '&docs_index=1';
                }
                if (TvrCom.hasValue($clicked.attr('data-prop-group'))){
                    url+= '&prop_group='+$clicked.attr('data-prop-group');
                }
                if (TvrCom.hasValue($clicked.attr('data-prop'))){
                    url+= '&prop='+$clicked.attr('data-prop');
                }
            }

			//console.log('reload the iframe', $clicked, type, url, forceReload)


			if (forceReload || type === 'manage' || // so new exports show up (use a var to signal in future)
                $iframe.attr('data-frame-loaded') !== '1'
				//|| TvrCom.isDomEl($clicked.closest('.dialog-footer')) // what's the purpose of this?
			){

				// reset the loading
				//console.log('removing loaded flag', frame, window.frames, url);
				$iframe.attr('data-frame-loaded', 0);

				// this is needed for firefox, which doesn't support name as key for frames
				// even though it seems to work elsewhere - weird
				$iframe[0].src = url;

				window.frames[frame].location = url;

				$iframe.on('load', function(){
					$iframe.attr('data-frame-loaded', 1);
					//console.log('re-added loaded flag', frame, window.frames[frame], url);
				});


			}

		},

		// toggle all folders to export
		toggle_help_info: function($c){
			$c.next().slideToggle('fast', function(){

			});
		},

		// toggle all folders to export
		toggle_multi_checkboxes: function($c){ TvrCom.startT(arguments);
			var $list = $('#available-folders, #custom-css');
			if ($c.hasClass('on')){
				$list.find('input').prop('checked', false)
					.end().find('.fake-checkbox').add($c).removeClass('on');
			} else {
				$list.find('input').prop('checked', true)
					.end().find('.fake-checkbox').add($c).addClass('on');
			}
			TvrCom.endT(arguments)
		},
		/* get the selected text from a textarea
		 user_selected_text: function($t){ TvrCom.startT(arguments);
		 console.log($t.val())
		 //window.mySelection = $t.value.substring($t.selectionStart, $t.selectionEnd);
		 //console.log(window.mySelection);
		 //window.getSelection().toString();
		 return window.getSelection().toString();
		 },
		 */






        // helper: get main objects for current dyn menu
		get_dyn_meta: function($obj){ TvrCom.startT(arguments);
			var $wrap = $obj.closest('.dyn-wrap');
			TvrUi.dyn_meta = {
				'wrap' : $wrap,
				'slug' : $wrap.data('slug'),
				'add_input' : $wrap.find('.new-item-input'),
				'add_button' : $wrap.find('.new-item-add'),
				'menu' : $wrap.find('.tvr-dyn-menu')
			};
			// if item element is clicked
			var $li = $obj.closest('li.dyn-item');
			if (TvrCom.isDomEl($li)){
				TvrUi.dyn_meta['item'] = $li;
			}
			TvrCom.endT(arguments)
			return TvrUi.dyn_meta;
		},
		// add item to dyn menu
		dyn_add_item: function($clicked){ TvrCom.startT(arguments);
			var D = TvrUi.get_dyn_meta($clicked);
			// get selector CSS and label values submitted by user
			var userVal = D.add_input.val();
			var baseKey = D.wrap.data('base-key');
			// if base key (e.g. MQs) use that for name key
			if (baseKey){
				baseKey+= D.menu.find('li.dyn-item').length+1;
				var tmp = {
					'newName': baseKey,
					'newNameHuman': userVal
				}
			}
			// else convert user input to param for key
			else {
				var tmp = TvrCom.new_name_checks(userVal, TvrLang.item);
				if (!tmp){
					return false;
				}
			}
			var $combObjs = TvrUi.dom_replacements(
			    false,
				'dyn_item',
				//$('#'+D.slug+'-item').clone(),
                $(TvrUi.templates[D.slug+'_menu_item']),
				'item',
				tmp['newName'],
				tmp['newNameHuman'] // raw display name
			);
			// add to the dom
			D.menu.append($combObjs).find('li').filter(':last').hide().fadeIn('fast', function() {
				D.add_input.val('');
				// open edit fields if MQ
				if (D.slug == 'mqs'){
					TvrUi.toggle_edit_item($(this).find('.edit-item'));
				}
			});
			TvrCom.endT(arguments)
		},
		// dyn menu expand edit options
		toggle_edit_item: function($clicked){ TvrCom.startT(arguments);
			var D = TvrUi.get_dyn_meta($clicked);
			var $area = D.item.find('.edit-item-form');
			$area.hasClass('show') ? $area.removeClass('show') : $area.addClass('show');
			TvrCom.endT(arguments)
		},
		// dyn menu delete
		delete_item: function($clicked){ TvrCom.startT(arguments);
			$clicked.closest('li').fadeOut('slow', function(){
				$(this).remove();
			});
			TvrCom.endT(arguments)
		},
		reveal_form_opts: function($clicked){ TvrCom.startT(arguments);
			var relClass = $clicked.attr('rel');
			var $area = $clicked.closest('li').siblings('.hidden.'+relClass);
			$area.hasClass('show') ? $area.removeClass('show') : $area.addClass('show');
			//$clicked.closest('li').siblings('.hidden.'+relClass).addClass('show');
			TvrCom.endT(arguments)
		},
		toggle_system_menu_options: function($clicked){ TvrCom.startT(arguments);
			$clicked = $clicked.closest('li');
			var $custom_url = $clicked.find('.tvr-input-wrap');
			var $label = $clicked.find('.mt-menu-text');
			var $ul = $clicked.closest('ul');
			// already expanded - contract
			if ($custom_url.hasClass('show')){
				$label.text($label.data('ll')); // long label
				$ul.removeClass('expanded');
				$custom_url.removeClass('show');
			} else {
				// not yet expanded - expand
				$label.text($label.data('sl')); // short label
				$ul.addClass('expanded')
				$custom_url.addClass('show')
			}
			TvrCom.endT(arguments)
		},


		create_url_from_input_path: function($input){

			let inputValue = $input.val(),
				path = inputValue
					? TvrCom.extract_url_path(inputValue)
					: false,
				url = path
					? TvrCom.rtrim(TvrUi.homeUrl, '/')+path
					: '';

			if (!url && MTF){
				url = MTF.get_current_url();
			}

			return url;
		},

		format_nonlog_param: function(url){

			// append/remove mt_nonlog param
			if (parseInt(TvrUi.pref.mt_nonlog)){

				url = TvrCom.strip_page_builder_and_other_params(url);
				url = TvrCom.append_url_param(url, 'mt_nonlog');
				url = TvrCom.append_url_param(url, '_wpnonce', TvrMT.data.dyn.ui_config.mt_nonlog_nonce);

				if (TvrCom.checkObject(MTF, ['stat', 'win', 'MTDynFrontData', 'post_status']) === 'draft'){

					/*MTsave.update_full_logs({
						'short': 'Remember to publish',
						'long': '<p>You must publish the page, otherwise you will get "Page Not Found" when viewing it as a non-logged in user.</p>',
						'type': 'warning'
					});*/

					alert('You must publish the page, otherwise you will get "Page Not Found" when viewing it as a non-logged in user.');
				}

				// Oxygen redirect non-logged to logged in, so use redirect to mitigate
				// didn't work
				/*if (MTint.anyBuilderIsActive()){
					url = TvrCom.append_url_param(url, 'mt_nonlog_redirect');
				}*/

			} else {
				url = TvrCom.strip_url_param(url, 'mt_nonlog');
			}

			return url;
		},

		// clear the logic test url so the latest url is used on the next test
		clear_test_page_input: function(){
			$('#testPreviewPath').val('');
			//console.log('clear_test_page_input')
		},

		change_preview_url: function($clicked, ui, toggleNonLogged){ TvrCom.startT(arguments);

			// MTF.get_current_url()

			// construct final (same domain) url
			var $li = $clicked.closest('li'),
                $input = $li.find('input.combobox'),
				url = TvrUi.create_url_from_input_path($input);

            // Set loading page indicator
            if (url){ // && url.indexOf(TvrUi.adminUrl) < 0
                MTsave.update_prog_indicator('plus', TvrLang.load_wp);

				// clear the logic test url so the latest url is used on the next test
				TvrUi.clear_test_page_input();
            }

            // close the options
            /*TvrUi.toggle_preview_page_menu(
                $li.closest('.program-settings-tab-preview_page')
            );*/

            //console.log('initial Url', url)

            // Launch builder on specific page if checkbox is checked
            //var launchBuilder = !loadAsNonLogged && $li.find('input[name="launch_builder"]').is(':checked');
			var launchBuilder = MTint.check_builder_autoload();
            if (launchBuilder){

                // ui will only be set when selecting a combo suggestion
                // so get from last search results if user clicks go button
                var config
                if (!ui){
                    config = TvrUi.get_item_from_previous_results(TvrCom.extract_url_path(url)) || {};
                } else {
                    config = ui.item;
                }

                // add param based on active builder
                config.url = url;
                launchBuilder = MTint.launchBuilderOnNewPage(config, launchBuilder);
            }

            if (!launchBuilder) {

				url = TvrUi.format_nonlog_param(url);

                // all good, change iframe url
                //console.log('url to go to', url, path)

                MTint.maybeReleaseBuilderEditLockBeforeExit(url);
                //TvrUi.stat.iframe[0].src = url;
            }

            // clear the search value - no, i think combo sets value after select callback so do at remember_page
            //$input.val('').attr('value', '');



			TvrCom.endT(arguments)
		},

		toggle_ai_panel: function(){
			if (TvrUi.stat.aiAssistant.hasClass('expanded')){
				TvrUi.hide_folders_or_settings('ai', 'right');
			} else {
				TvrUi.show_folders_or_settings('ai', 'right');
			}
		},

		toggle_program_menu: function($clicked){
			if (TvrUi.stat.settingsMenu.hasClass('expanded')){
				TvrUi.hide_folders_or_settings('settings', 'right');
			} else {
				TvrUi.show_folders_or_settings('settings', 'right');
			}
		},

		/* MANAGE PACKS iFRAME FUNCTIONS */
		// removed as i think these funcs were here by mistake


		/***
		 MANAGE SECTION/SELECTOR FUNCTIONS
		 ***/

		// functions to run after the style options HTML has been removed
		after_style_options_deleted: function(con){

			// if deleting last selector, toolbar will be less tall
			if (TvrUi.totalSels < 1 ) {
				MTlayout.toolbar_adjusted();
			}

		},

        menuOrder: {},


        // refresh sortable
        // todo update to new sortable on media queries etc and dequeue jquery-ui
        // remove tooltip that lingers
        // remove action icons that linger
        // test on multiple browsers
        refresh_sortable: function(){ TvrCom.startT(arguments);

            // get sortable menu and sub-menus
            var menu = document.getElementById('tvr-menu'),
                subMenus = menu.getElementsByClassName("selector-sub"),

                // common sort config shared by both sortables
                commonConfig = {
					animation: 150,
					forceFallback: true,  // ignore the HTML5 DnD behaviour and force the fallback to kick in

					// end
                    onStart: function (event) {

                    	MTlocal.clean_tooltips();

						// Ensure any draft selectors are saved, otherwise it get lost after drag
						if (TvrUi.retargetSelector || TvrUi.draftSelector.atts.id){
							TvrUi.save_draft_selector(TvrUi.retargetSelector, true);
						}

                        var $item = $(event.item);

                        TvrCom.currentlySorting = $item.hasClass('section-tag')
							? 'section'
							: 'selector';

                        $(menu).addClass('sorting-in-progress');

                        // get pre-sort order of items
                        TvrUi.get_dom_order({}, $item, {
                            prevSec:'',
                            newSec:'',
                            orig_order:['this'],
                            new_order:['this'],
                            map:[]
                        }, false);

						TvrUi.itemIsBeingDragged = true;
                    },
                    onEnd: function (event) {

                        TvrCom.currentlySorting = false;

                        $(menu).removeClass('sorting-in-progress');

                        //console.log('end drag');

                        // get post sort order of items
                        TvrUi.get_dom_order({}, $(event.item), TvrUi.menuOrder, true);

						TvrUi.itemIsBeingDragged = false;

                    }

                },

                // folder-specific sort config
                foldersConfig = $.extend(true, {}, commonConfig, {
                    group: 'folders',
                    handle: '.folder-icon',
                    // item is moved
                    onUpdate: function (evt) {

                        // mirror order in style options
                        var M = TvrUi.get_meta( $(evt.item), 'section');
                        var prevID = M.sectionM.prev().attr('id');

                        if ( !TvrCom.hasValue(prevID) ) {
                            M.section.detach().prependTo('#tvr-options');
                        } else {
                            M.section.detach().insertAfter('#'+prevID.replace('strk', 'opts'));
                        }

                        // update the CSS order
                        //console.log('folder dom order update hapend')

                        // update visual controls
                        if (TvrCom.hasValue(TvrUi.selInFocusID)){
                            TvrUi.update_prev_next_sel_buttons(TvrUi.selInFocusID);
                        }

                    }
                }),

                // selector-specific sort config
                selectorsConfig = $.extend(true, {}, commonConfig, {
                    group: "selectors",
                    handle: '.selector-sortable-icon',

                    // use this to fix bug drag sel to folder list that only triggers on large screen
                    onMove: function (evt, originalEvent) {

                        // fix bug where sel can go to the folder menu
                        if (evt.related.className.indexOf('strk-sec') > -1 ){
                            //console.log('event, orig event', evt, originalEvent);
                            return false;
                        }

                    },

                    // when a selector is moved within a folder
                    onUpdate: function(evt){
                        //console.log('onUpdate', evt);
                        TvrUi.mirror_move_and_log({}, evt);
                    },

                    // Element is dropped into the list from another list
                    onAdd: function (evt) {
                        //console.log('onAdd');
                        TvrUi.selector_received({}, evt);
                    }
                });

            // apply sortable folders
            var sortableFolders = new Sortable(menu, foldersConfig);

            // loop through all sub-menus to apply sortable
            var sortableSelectors = [];
            for (var i = 0; i < subMenus.length; i++) {
                sortableSelectors[i] = new Sortable(subMenus[i], selectorsConfig);
            }

            TvrCom.endT(arguments)
        },

        // get order of dom items
        get_dom_order: function(settings, $item, menuOrder, postSort, afterCopy, onlyUpdateSavePackage){ TvrCom.startT(arguments);

            var $ul = $item.closest('ul'),
                depth = $item.hasClass('section-tag') ? 'section' : 'selector',
                callbackDepth = (depth === 'section') ? ['root'] : ['section'],
                itemM = TvrUi.get_meta($item, depth);

            // selector specific
            if (depth === 'selector'){
                var $newSec = $ul.closest('.section-tag');
                if (!postSort){
                    menuOrder.prevSec = itemM.sectionSlug;
                } else {
                    menuOrder.newSec = $newSec.attr('id').replace('strk-', '');
                }
                menuOrder.moved_item = itemM.selectorSlug;
            }

            // section specific
            else {
                menuOrder.moved_item = itemM.sectionSlug;
            }

            // if we're reordering after a copy to ensure copy is after original, dom is already in right order
            // so get orig order from JS object which will have copy appended to end
            if (afterCopy && !postSort){

                var jsObj = (depth === 'section')
                    ? TvrUi.uiData
                    : TvrUi.uiData[itemM.sectionSlug];

               menuOrder.orig_order = Object.keys(jsObj);
            }

            else {

                // get the order from the dom
                $ul.find('> li').not('.sortable-ghost').each(function(index){

                    var $li = $(this),
                        M = TvrUi.get_meta($li, depth),
                        key = M[depth+'Slug'],
                        item = key;

                    if (!postSort){
                        menuOrder.orig_order.push(item);
                    } else {
                        menuOrder.new_order.push(item);
                    }

                });
            }

            // mirror the new order in the main js object by rebuilding
            if (postSort){

				TvrCom.startT('get_dom_order post sort');

                // if moved selector needed to be renamed to prevent conflict, sync JS
                if (menuOrder.syncRenameConfig){
                    settings = MTloop.modify_main_js_object('rename', settings, TvrUi.menuOrder.syncRenameConfig);
                    menuOrder.syncRenameConfig = false; // just to be safe
                }

                // we need to ensure that if a selector is moved, the move update comes before the reorder update
				settings.moveUpdate = [];
                settings.orderUpdate = [];

                // reorder
                settings = MTloop.modify_main_js_object('reorder', settings, {
                    //rebuild: true,

                    callbackDepth: callbackDepth,
                    maxDepth: callbackDepth[0],
                    targetSection: itemM.sectionSlug,
                    targetSelector: itemM.selectorSlug,
                    menuOrder: menuOrder
                });

                // join move and order updates, with move first - moved to js modify function
               /* MTloop.updateObjectAndSavePackage(settings.savePackage,
                    settings.moveUpdate.concat(settings.orderUpdate)
                );*/

                // if a selector has moved between folders, update blue dots
                if (depth === 'selector'){

                    var newSecM = TvrUi.get_meta($newSec, 'section');

                    // update the feathers on gaining section
                    settings = TvrUi.js_check_values(settings, newSecM);

                    // update CSS on gaining section
                    settings = MTloop.modify_main_js_object('update_section_css', settings, {
                        M: newSecM,
                        maxDepth: 'section',
                        callbackDepth: ['section'],
                        recurse_key: ['m_query'] // tells maybe_recurse to not do important
                    });

                    if (menuOrder.prevSec !== menuOrder.newSec){

                        // if sel is moved to or from disabled folder - run compilation again
                        var prevSecDisabled = TvrCom.checkObject(TvrUi.uiData, [menuOrder.prevSec, 'this', 'disabled']),
                            newSecDisabled = TvrCom.checkObject(TvrUi.uiData, [menuOrder.newSec, 'this', 'disabled'])

                        //console.log('Disabled status', prevSecDisabled, newSecDisabled, itemM);

                        if (prevSecDisabled !== newSecDisabled){ // & not same disabled status
                            settings = MTloop.modify_main_js_object('group_to_css', settings, {
                                M: itemM,
                                maxDepth: 'group',
                                recurse_key: ['m_query'] // tells maybe_recurse to not do important
                            });
                        }

                        //console.log('the prev sec', menuOrder.prevSec, $('#strk-'+menuOrder.prevSec))

                        var prevSecM = TvrUi.get_meta($('#strk-'+menuOrder.prevSec), 'section');

                        // update feathers on losing section
                        settings = TvrUi.js_check_values(settings, prevSecM);

                        // update CSS on losing section
                        settings = MTloop.modify_main_js_object('update_section_css', settings, {
                            M: prevSecM,
                            maxDepth: 'section',
                            callbackDepth: ['section'],
                            recurse_key: ['m_query'] // tells maybe_recurse to not do important
                        });

						// if the current selector was moved, redo the highlighting in case moved between
						// a loading and non-loading folder
						if (MTF && TvrUi.is_cur('selector', itemM.selectorID)){
							MTF.select_current_selector_elements({
								doNotUpdateSelectorSuggestions: 1
							});
						}
                    }

                    // log for history
					if (!afterCopy){
						settings = MTsave.user_action(settings, {
							'items': ['selector'],
							'val': TvrUi.title(itemM.selectorM.find('span.selector-sortable-icon')),
							'M': itemM, //M,
							'pathTT': true,
							'icon': 'mtif-arrowsx4'
							//'valFirst': true
						});
					}


                }

				// section
                else {

                    // log for history
					if (!afterCopy){
						settings = MTsave.user_action(settings, {
							'items': ['section'],
							'val': TvrUi.title(itemM.sectionM.find('span.folder-icon')),
							'M': itemM, // M
							'icon': 'mtif-arrowsx4'
						});
					}

					// reorder the section style nodes
					MTF.edit_style_nodes(itemM, 'reorder');

					// reorder the folder loading object
					MTfolder.reorderFolderLoading(menuOrder.new_order);

					// Flag if conditional folder styles need to be checked
					MTfolder.maybeAddLogicAdjustedFlag(itemM.sectionSlug, settings);
                }

                // save (unless we're doing a reorder as part of a copy action)
				if(!afterCopy){

					MTsave.ajax_save_settings({
						settings: settings
					});

                    //console.log('Saving after moving something', settings, $.extend(true, {}, Object.keys(TvrUi.uiData))) // Object.keys(TvrUi.uiData)
				}

				TvrCom.endT('get_dom_order post sort');
            }

            //console.log('menuOrder', postSort, depth, TvrCom.print_r(menuOrder));

            TvrUi.menuOrder = menuOrder;

			TvrCom.endT(arguments);

            //console.log('the order settings', $.extend(true, {}, settings))

            return settings;
        },


        // mirror order in options and log history
        mirror_move_and_log: function(event, ui, noSave){ TvrCom.startT(arguments);

            var $item = $(ui.item),
                M = TvrUi.get_meta($item, 'selector');

            //console.log('M after selctor move to folder', M, M.selectorM, TvrCom.isDomEl(M.selectorM, true));

            // mirror order change in options - no point, only one sel loads at a time.
            /*var prevID = M.selectorM.prev().attr('id');

            if ( !TvrCom.hasValue(prevID) ) {
                M.selector.detach().prependTo(M.section.find('ul.selector-sub'));
            } else {
                M.selector.detach().insertAfter('#'+prevID.replace('strk', 'opts'));
            }*/

            // update the CSS order
            //console.log('selector dom order update hapend', TvrUi.selInFocusID, ui)

            // update visual controls
            if (TvrCom.hasValue(TvrUi.selInFocusID)){
                //TvrUi.update_prev_next_sel_buttons(TvrUi.selInFocusID);
                TvrUi.tvr_iterate_selectors_v(M.selectorM, TvrUi.selInFocusID, {
					doNotBringStylesTop: 1,
					draftSelectorFolderCreated: ui.draftSelectorFolderCreated,
					elementAlreadySelected: ui.elementAlreadySelected
				});
            }

            TvrCom.endT(arguments)
        },

        // do dom replacements and count updates
        selector_received: function(event, ui){ TvrCom.startT(arguments);

            var $item = $(ui.item),

                // the item still has the old markup so getting the meta info at this stage will return the orig values
                oM = TvrUi.get_meta($item, 'selector'),

                // check if current before update_count potentially resets global vars (if only one sel exists)
                isCurSel = TvrUi.is_cur('selector', oM.selectorID);

            // cache the old folder so mirror func can update feathers after moving opts.
            TvrUi.oM = oM;

            // get the new section meta
            var M = TvrUi.get_meta($item.closest('.section-tag'), 'section');

            // update the selector count for losing and receiving sections
            TvrUi.update_count(oM.sectionM.find('.selector-count-state'), 'subtract', 1, 'selector', '');
            TvrUi.update_count(M.sectionM.find('.selector-count-state'), 'add', 1, 'selector', '');

            // rename the selector if a duplicate is found
            var newSelectorHuman = TvrCom.resolve_unique_name(oM.selectorH, M.sectionM, '.selector-name',
                'Moved', oM.selectorMID),
                newSelectorSlug = TvrCom.convert_to_param(newSelectorHuman);

            // do section (always) and possibly new name dom replacements on selector
            TvrUi.dom_replacements(
                oM,
                'selector',
                oM.selector.add(oM.selectorM),
                //oM.selector.add(oM.selectorM).add(MTF.get_style_nodes(oM)),
                oM.sectionSlug,
                M.sectionSlug,
                M.sectionH,
                oM.selectorSlug,
                newSelectorSlug,
                newSelectorHuman,
                oM.selectorCode
            );

            // if the selector needed to be renamed
            if (newSelectorSlug !== oM.selectorSlug){

                // generate config for doing in same function as other JS updates (so settings accumulates savePackage)
                TvrUi.menuOrder.syncRenameConfig = {
                    rebuild: true,
                    callbackDepth: ['section', 'selector'], // section must also be copied
                    maxDepth: 'selector',
                    targetDepth: 'selector',
                    targetSection: oM.sectionSlug,
                    targetSelector: oM.selectorSlug,
                    new_key: newSelectorSlug,
                    new_label: newSelectorHuman,
                    new_code: oM.selectorCode
                };

                //console.log('selector needed to be renamed', TvrUi.menuOrder.syncRenameConfig);
            }

            //console.log('new old', newSelectorSlug, oM.selectorSlug);

            // reset M following dom replacements
            M = TvrUi.get_meta(oM.selectorM, 'selector');

            // update the global vars if selector is in focus
            if (isCurSel){

            	TvrUi.update_global_vars(M);

                // only need to move options if sel in focus
                oM.selector.detach().prependTo(M.section.find('ul.selector-sub'));

                //console.log('update_global_vars', M, oM);

            }

			//console.log('selector_received', 4);

            // only now that the selector has loaded should the options be mirrored and settings saved
            TvrUi.sortableLoading = false;
            TvrUi.mirror_move_and_log(event, ui);

            //}

            // signal that the selector must load, so mirror_move_and_log isn't triggered by stop: callback
           /* else {
                TvrUi.sortableLoading = true;
            }*/

            TvrCom.endT(arguments)

           return M;


        },

		// Search functions

		// cache search results for checking when expanding folders
		search_filter: false,
		colorCodeSearchDec: true,

		// search folders and items for matching text
		search_folders: function(searchText, typingDelay, searchRegex, justGetMatches, elementAttrSearch){

			function searchFolders(searchText){

				// reset state of expand all folders, if enabled
				if (!justGetMatches && parseInt(TvrUi.pref.expand_all_folders)){
					$('#toggle-all-folders').removeClass('on');
					TvrUi.pref.expand_all_folders = 0;
					//console.log('resetting expanded');
				}

				// trim the search text
				searchText = searchText.trim();

				// Escape special regex characters (add support for regex search in future)
				var escapedText = TvrCom.escapeRegExp(searchText),

					// and create whole line pattern match for pulling pieces of custom CSS
					wholeLinePattern = ".*("+escapedText+").*\\n";

				// only perform search if user has entered something
				if (TvrCom.isDefined(searchText) || searchRegex){

					TvrUi.stat.mainMenu.addClass('user-searching');

					var search_filter = {
						searchText: searchText,
						// case insensitive search
						justGetMatches,
						elementAttrSearch,
						searchRegex: searchRegex || new RegExp(escapedText, "i"),
						wholeLineRegex: new RegExp(wholeLinePattern, "i"),
						searchMatches: {}
					};

					// perform search
					var settings = MTloop.run_global_scans($.extend(true, {}, search_filter), ['search_folders']);

					//console.log('Do folder search', justGetMatches, settings);

					if (justGetMatches){
						//console.log('We return');
						return settings.searchMatches;
					}

					// update search object with results
					search_filter.searchMatches = settings.searchMatches;

					// cache search settings and matching results
					TvrUi.search_filter = search_filter;

					// reopen all folders which loads selectors afresh with search results data
					// and search-excluded class, and mark search excluded
					TvrUi.open_close_all_folders('close');
					TvrUi.open_close_all_folders('open', true);

					//console.log('search_folders', searchText, settings);
				}

				// close all folders
				else {

					TvrUi.clear_folder_search();
				}


			}

			// minor delay when typing to prevent unnecessary searches
			if (typingDelay){
				TvrCom.action_after_timeout('search_folders', TvrUi.inputTypingInterval, {
					item: searchFolders,
					args: [searchText]
				});
			}

			// or run immediately
			else {
				return searchFolders(searchText);
			}

		},

		clear_folder_search: function(){

			TvrUi.search_filter = false;

			TvrUi.stat.searchFoldersInput.val('');

			TvrUi.stat.mainMenu.removeClass('user-searching');

			TvrUi.open_close_all_folders('close');
		},

		flag_search_matches: function(c, selector, mq_key){
			
			// we may or may not color code the property: value bit
			var colorCodeSearchDec = TvrUi.colorCodeSearchDec;

			// get global search vars
			var searchText = c.settings.searchText,
				searchRegex = c.settings.searchRegex, // case insensitive search
				searchMatches = c.settings.searchMatches,
				justGetMatches = c.settings.justGetMatches,
				elementAttrSearch = c.settings.elementAttrSearch,

				// get selector vars
				selector = c.selector,
				rootSection = TvrUi.uiData[c.section_key],
				rootSelector = rootSection[c.selector_key],
				secName = TvrCom.checkObject(rootSection, ['this', 'label']),
				selLabelCode = rootSelector.label.split('|'),
				selName = selLabelCode[0] || '',
				selCode = selLabelCode[1] || '',
				mqName = TvrUi.get_tab_name(mq_key),
				isMQ = mq_key !== 'all-devices',
				snippet_content = '',
				snippets_used = {},

				snippet_ids = TvrCom.checkObject(selector, ['styles', 'html', 'snippet_id', 'value']),

				// do simple string match on combined selector output
				compiledCSS = TvrUi.scss_enabled
					? (selector.raw_scss  || '')
					: (selector.compiled_css || ''),
				special = null,
				itemMatch,
				isEmptySelector = (compiledCSS === '' || compiledCSS.match(
					new RegExp("^\\s*"+TvrCom.escapeRegExp(selCode)+"\\s*{\\s*}\\s*$")
				)),
				searchHTML = '',
				matchingProperties = [],
				entries = '';

			// support special search operations like all affecting selectors
			//console.log('searchText in flag op', searchText)


			if (searchText.charAt(0) === ':'){

				special = {};
				searchText.split(':').forEach(filter => {
					special[filter] = 1;
				});

				// affecting selector
				if (special.affecting_selectors && MTF){
					//console.log('special.affecting_selectors', special)
					if (special.including_inactive ||
						(!MTfolder.folderNotLoading(c.section_key)
						&& !TvrCom.checkObject(rootSection, ['this', 'disabled'])
						&& !TvrCom.checkObject(rootSelector, ['disabled'])
						)
					){
						itemMatch = MTF.jquery_compat_sel_elements(selCode).length;
						//console.log('itemMatch', itemMatch, selCode, MTF.jquery_compat_sel_elements(selCode))
					}
				}

			}

			// Regular string match
			else {

				// create array of snippet id content
				if (TvrMT.data.dyn.ui_config.supportContent && snippet_ids){
					snippet_ids.forEach((snippet_id, index) => {
						if (snippet_id && TvrMT.data.dyn.snippets.cache[snippet_id]){

							let snippet = TvrMT.data.dyn.snippets.cache[snippet_id]
							let meta = snippet.meta && TvrCom.obj_length(snippet.meta)
								? JSON.stringify(MThtml.getTotalScriptDeps(snippet))
								: '';
							let matchString = elementAttrSearch
								? snippet_id+snippet.value
								: snippet_id+','+snippet.aspect+','+snippet.name+','+meta+','+snippet.value;

							snippets_used[snippet_id] = {
								index: index,
								matchString,
								Type: snippet.aspect,
								ID: snippet_id,
								//Name: snippet.name, // do not show name becasue it repeats the content a lot
								Packages: meta,
								Snippet: snippet.value,
							}

							snippet_content+= matchString;
						}
					});

				}

				// Add folder, selector, and media query labels to compiled CSS/Sass string.
				// The user might want to filter based on a specific folder or media query
				// with the view full CSS feature, they can easily find all folder code Inc MQs
				// Or, find all MQ settings in the UI
				let fullDataString = elementAttrSearch
					? snippet_content // we just need to connect snippet html / js / class
					: compiledCSS+secName+selName+mqName+snippet_content;

				itemMatch = fullDataString.match(searchRegex);
			}

			// Bail early if we just need to determine a match
			if (justGetMatches){
				if (itemMatch){
					TvrCom.updateObject(searchMatches, [c.section_key, c.selector_key, mq_key], {
						match: itemMatch[0]
					});
				}
				return;
			}

			// if we have any kind of match with the item
			if (itemMatch){

				//console.log('search against data', searchText, itemMatch);

				if (special){
					if (special.affecting_selectors){
						matchingProperties.push({
							pg: 'code',
							property: 'css',
							label: selCode
						});
					}
				}

				// Regular string match
				else {
					// if selector code matches the search, and we're not on an empty media query selector
					// include the code in the search results
					if ( (!isMQ || !isEmptySelector) && selCode.match(searchRegex) ){

						matchingProperties.push({
							pg: 'code',
							property: 'css',
							label: colorCodeSearchDec
								? '<span class="mt-search-code">'
								+TvrCom.embolden_matched_text(selCode, searchText)
								+'</span>'
								: selCode
						});
					}

					// check all the style values for matches
					if (selector.styles){

						var PGs = Object.keys(selector.styles);

						for (var i = 0; i < PGs.length; i++) {

							var group_key = PGs[i],
								group = selector.styles[group_key];

							for (var propertyKey in group) {

								if (!group.hasOwnProperty(propertyKey) || propertyKey === 'css') continue; // for compat

								var propertyValue = TvrCom.checkObject(group, [propertyKey, 'value']) || '',
									propertyUnit = TvrCom.checkObject(group, [propertyKey, 'unit']) || '',
									cssf = TvrCom.prop_to_cssf(propertyKey),
									index = undefined;

								// join grid array values into a string
								if (Array.isArray(propertyValue)){
									if (group_key === 'html'){
										let nonNullIndexes = [];
										let nonNullValues = propertyValue
											.reduce((acc, value, index) => {
												if (value !== null) {
													nonNullIndexes.push(index);
													acc.push(value);
												}
												return acc;
											}, []);

										// Comma separated values
										propertyValue = nonNullValues.join(', ');

										// Use the first valid index
										index = nonNullIndexes[0];

									} else {
										propertyValue = propertyValue.join(' ');
									}

								}

								// don't show unit with non-numerical values
								if (!TvrCom.isNumeric(propertyValue)){
									propertyUnit = '';
								}

								// combine into valid CSS declaration for string matching and parsing
								// and embolden the search text BEFORE adding color coding spans to ensure
								// HTML atts are not encased
								var	declaration = cssf+': '+propertyValue+propertyUnit,
									label = TvrCom.embolden_matched_text(TvrCom.escapeHTML(declaration), TvrCom.escapeHTML(searchText));

								// color code the property and value if required
								if (colorCodeSearchDec){
									label = TvrUi.color_code_property_value(label);
								}

								// if the specific declaration matches, add to matchingProperties
								if (declaration.match(searchRegex)){

									matchingProperties.push({
										index: index,
										pg: group_key,
										property: propertyKey,
										cssf: cssf,
										label: label,
										declaration: declaration
									})
								}


								//console.log('checking the group', p, group, group[p])
							}
						}
					}

					// if we haven't found any entries for styles or selector code, check for a line of custom code
					if (!matchingProperties.length){

						var line = compiledCSS.match(c.settings.wholeLineRegex);

						if (line){

							var trimmedLine = line[0].trim();

							// remove auto added !important if that setting is enabled
							if (parseInt(TvrUi.pref.css_important)){
								trimmedLine = trimmedLine.replace(' !important;', '')
							}

							// add to properties list
							matchingProperties.push({
								pg: 'code',
								property: 'css',

								// color code the prop / value
								label: TvrUi.color_code_property_value(

									// highlight the matched text
									TvrCom.embolden_matched_text(TvrCom.escapeHTML(trimmedLine), TvrCom.escapeHTML(searchText))
								)
							});
						}
					}

					// Check the snippet content (includes dependencies, name, aspect)
					if (snippet_content){

						Object.entries(snippets_used).forEach(([snippet_id, snippetData]) => {

							if (snippetData.matchString.match(searchRegex)){

								let entryHTML = '';
								Object.entries(snippetData).forEach(([label, value]) => {
									if (label !== 'matchString' && label !== 'index' && value !== ''){
										entryHTML+= `<span class="mt-search-property">${label}</span><span class="mt-search-value">${TvrCom.escapeHTML(value)}</span>`;
									}
								})

								matchingProperties.push({
									pg: 'html',
									property: 'snippet',
									index: snippetData.index,
									label: '<span class="mt-search-code snippet-search-results">'
										+TvrCom.embolden_matched_text(entryHTML, searchText)
										+'</span>'
								});

							}
						});

					}
				}

				// show MQ tag heading (and possible entries) if we have any
				// or the MQ label matches the search and has some CSS settings
				if (matchingProperties.length || (!special && !isEmptySelector && mqName.match(searchRegex)) ){

					for (i = 0; i < matchingProperties.length; i++) {
						var item = matchingProperties[i];
						let indexAttr = item.index !== undefined ? ' data-index="'+item.index+'"' : '';

						// Fallback to code if the UI for the property is not supported
						let pgToEdit = (item.pg === 'html' && !TvrMT.data.dyn.ui_config.supportContent)
							|| (item.pg !== 'html' && !TvrMT.data.dyn.ui_config.supportGUICSS)
							? 'code'
							: item.pg;

						// nowhere to show selector code in builds without the code editors
						if (pgToEdit === 'code' && !TvrUi.codeEditors){
							continue;
						}

						entries+= '<div class="mt-search-entry" ' +
							'data-pg="'+pgToEdit+'" data-property="'+item.property+'" data-mq_key="'+mq_key+'"'+indexAttr+'>' +
							item.label
							+'</div>';
					}

					// format the search HTML
					searchHTML+=
						'<div class="mt-search-mq mt-search-entry" ' +
						'data-pg="code" data-property="css" data-mq_key="'+mq_key+'">'+
							TvrCom.embolden_matched_text(mqName, searchText)
						+'</div>'
						+ entries;
				}

				// we show the item in the search results if
				// the text matches selCode or declarations
				// we're on a root selector (and to get here some sort of label matched if nothing else)
				// or it's a media query selector with some CSS data
				if (matchingProperties.length || mq_key === 'all-devices' || !isEmptySelector){
					TvrCom.updateObject(searchMatches, [c.section_key, c.selector_key, mq_key], {
						data: matchingProperties,
						html: searchHTML
					});
				}

			}
		},

		color_code_property_value: function(str){
			var decParts = str.split(':');
			decParts[0] = '<span class="mt-search-property">'+decParts[0]+'</span>';
			decParts[1] = '<span class="mt-search-value">'+decParts[1]+'</span>';
			return decParts.join(':');
		},

		// add search results to folder item if user is searching
		maybe_apply_search_results_to_item: function(c, $template, selName){

			if (TvrUi.search_filter){

				var searchResults = TvrCom.checkObject(TvrUi.search_filter, [
					'searchMatches', c.section_key, c.selector_key
				]);

				// if we have valid search results, look the media query tabs in order
				// adding in any results
				if (searchResults){

					var mq_keys = Object.keys(TvrMQsCombined),
						searchHTML = '';

					for (var j = 0; j < mq_keys.length; j++) {

						var mq = mq_keys[j],
							areaHTML = TvrCom.checkObject(searchResults, [mq, 'html']);

						if (areaHTML){
							searchHTML+= areaHTML;
						}
					}

					// add the HTML to the menu item
					$template.find('> .item-row')
						.append('<div class="search-results-area">'+searchHTML+'</div>');

					// embolden the label if it matches the search text
					TvrUi.maybe_change_item_name_highlight($template, selName)
				}

				else {
					// we just hide excluded items so that the pre/post sort order analysis stays valid
					$template.addClass('search-excluded');
				}
			}
		},

		maybe_change_item_name_highlight: function($item, name, undoHighlight){

			var $name = $item.find('.name-text').first();

			if (undoHighlight){
				$name.text(name); // names are raw (e.g. folder named from a post title)
			}

			else {

				if (TvrUi.search_filter && name.match(TvrUi.search_filter.searchRegex)){
					$name.html(
						TvrCom.embolden_matched_text(TvrCom.escapeHTML(name), TvrCom.escapeHTML(TvrUi.search_filter.searchText))
					);
				}
			}
		},

		// search entry clicked
		search_entry_clicked: function($clicked, M){

			M = M || TvrUi.get_meta($clicked, 'selector');

			//console.log('search_entry_clicked', M);

			if (!M){
				return;
			}

			var	data = $clicked.data(),
				mq_key = data.mq_key,
				group = data.pg,
				prop = data.property,
				isCurSel = TvrUi.is_cur('selector', M.selectorID),
				switchPG = group !== TvrUi.pref.pg_focus,
				switchMultiTab = false,
				curMQKey = M.tabSlug;

			// Update group
			TvrUi.pref.pg_focus = group;

			//console.log('we should jump to property', prop, group, M, isCurSel, data);

			if (data.index !== undefined){

				let $multiTab = M.selectorM.find('input.selector-multi-key-'+group),
					currentMultiTab = TvrUi.pref.lastMultiTab[group]?.index,
					selector = MTloop.get_selector_data(M, 'all-devices').data;

				//console.log('Go to the right index', currentMultiTab, data)

				if (parseInt(currentMultiTab) !== parseInt(data.index)){
					TvrCom.updateObject(selector, ['multi_key', group, data.index]);
					$multiTab.val(data.index);
					TvrUi.pref.lastMultiTab[group].index = data.index;
					switchMultiTab = true;
					TvrUi.skipTabAdjustCheck = true;
					//console.log('Index updated', TvrUi.pref.lastMultiTab[group].index , 'current', currentMultiTab, data.index, data, group, structuredClone(TvrUi.pref.lastMultiTab.html));
				}


			}

			// load selector if not already loaded
			if (!isCurSel){
				TvrUi.tvr_iterate_selectors_v(M.selectorM);
			}

			// switch to the current MQ tab if not current
			if (curMQKey !== mq_key){
				TvrUi.mq_tab_pressed(
					TvrUi.stat.res.find( '.mq-tab-'+mq_key )
				)
			} else if (switchPG || switchMultiTab){
				TvrUi.trigger_pg_icon_click(group);

				// Store the new multi tab action/aspect in lastMultiTab
				if (switchMultiTab){

					let M = TvrUi.get_pg_meta();

					if (M){

						const { action, aspect } = MThtml.getFieldValues(M.groupTab, M, false)

						//console.log('Update the tab action / aspect', action, aspect, M)

						MThtml.updateTabData(M, {
							action, aspect
						});
					}

				}
			}

			// go to specific UI fields
			if (group !== 'html'){
				MTace.go_to_ui_property(group, prop, data.index);
			}

			// Ensure we hide the folder pane if it's overlaying
			TvrUi.hide_folders_or_settings('folders', 'left');


		},

		// expand or collaspe all folder, thus loading or unloading selectors within
		open_close_all_settings: function(action){
			TvrUi.stat.settingsMenu.find('.mt-expandable-heading').each(function(){
				let method = action === 'open' ? 'addClass' : 'removeClass';
				$(this)[method]('expanded');
			})
		},

		// expand or collaspe all folder, thus loading or unloading selectors within
		open_close_all_folders: function(action, checkSearchExcluded, excludeItem){

			TvrUi.stat.mainMenu.find('.folder-icon').each(function(){

				var $folderIcon = $(this),
					M = TvrUi.get_meta($folderIcon, 'section'),
					open = $folderIcon.hasClass('on');

				// toggle search excluded class if required
				if (checkSearchExcluded){

					if (TvrUi.search_filter
						&& !TvrUi.search_filter.searchMatches[M.sectionSlug]

						// even if no items match the folder, don't exclude if the name does
						&& !M.sectionH.match(TvrUi.search_filter.searchRegex)
					){
						M.sectionM.addClass('search-excluded');
					} else {
						M.sectionM.removeClass('search-excluded');
						TvrUi.maybe_change_item_name_highlight(M.sectionM, M.sectionH);
					}
				}

				else {
					// restore non-highlighted folder name
					TvrUi.maybe_change_item_name_highlight(M.sectionM, M.sectionH, true);
				}

				if (open && action === 'close' || !open && action === 'open'){

					if (M.sectionSlug !== excludeItem){
						TvrUi.toggle_folder($folderIcon);
					}
				}

			});
		},

		// folder view functions

		// when MT first loads, or when the user clicks the current folder link
		// we should expand the current folder and scroll to the current selector
		// unless the user has an active search filter in place
		maybe_show_current_folder_item_view: function(){

			if (TvrUi.selInFocusID && !TvrUi.search_filter){

				var M = TvrUi.get_selector_in_focus(),
					$folderIcon = M.sectionM.find('> .sec-row .folder-icon');

				// open folder if not open already
				if (!$folderIcon.hasClass('on')){

					TvrUi.toggle_folder($folderIcon);

					// reloading the folder replaces the current selector, so get M again
					M = TvrUi.get_selector_in_focus();
				}

				// scroll the menu item into view
				TvrUi.scrollIntoView(TvrUi.folders_scrollable_area(), M.selectorM)

			}
		},

		// custom scroll into view function as native browser API was not getting low enough
		scrollIntoView: function($container, $el, adjust = 0){
			TvrCom.scroll_to({
				scrollDiv: $container,
				offset: TvrCom.getElPosRelToContainer($el, $container) + adjust
			});
		},

		// clicked isn't necessarily the arrow icon
		toggle_folder: function($clicked, noLoad){ TvrCom.startT(arguments);
			var M = TvrUi.get_meta($clicked, 'section');
			if (M.sectionM.find('> .sec-row .folder-icon').hasClass('on')) {
				TvrUi.close_folder(M, noLoad);
			} else {
				TvrUi.open_folder(M, noLoad);
			}
			TvrCom.endT(arguments)
		},

		open_folder: function(M, noLoad){

		    // load folder sels just in time
            if (!noLoad){
                this.load_folder_menu_selectors(M);
            }

			M.sectionM.addClass('is-open').
				find('> .sec-row .folder-icon').addClass('on');
			M.sectionM.find('> ul.selector-sub').addClass('show');

			// there is a browser bug where the icons of the longest selector item can be misaligned if scrollbars are
			// needed for displaying the menu. This hack fixes by forcing a repaint after the scrollbars are added.
			// NOTE: this created issues for search, where display none isn't removed, bug seems OK with current design so commenting out for now
			/*var $icons = M.sectionM.find('.manage-selector-icons');
			$icons.css('display', 'none');
			TvrCom.action_after_timeout('icon_display_fix', 10, {
				item: function(){
					$icons.css('display', '');
				},
				args: []
			});*/

		},

		close_folder: function(M){

		    // remove folder sels (other than one in focus)
            this.unload_folder_menu_selectors(M);

		    M.sectionM.removeClass('is-open').
				find('> .sec-row .folder-icon').removeClass('on');
			M.sectionM.find('> ul.selector-sub').removeClass('show');

		},

        load_folder_menu_selectors: function(M){

            var $selector_sub = M.sectionM.find('.selector-sub'),
				allFolderItems = TvrUi.load_selector(M, {
					items:['selectorM'],
					loadingAllMenuSelectors: 1
				});

            // clear any pre-loaded selectors (inc sel in focus to maintain the order)
            $selector_sub.empty(); // was .html('')

            // load the selectors
            $selector_sub.append(allFolderItems);

            //console.log('appended items', $selector_sub[0].outerHTML, allFolderItems, $selector_sub)

            // update blue dots
            TvrUi.js_check_values({}, TvrUi.get_meta(M.sectionM, 'section'));

            return allFolderItems;
        },

        // remove selector from folder menu
        unload_folder_menu_selectors: function(M){

        	var $menuSelectors = M.sectionM.find('.selector-sub').children('li');

			// sel in focus should stay if it exists
			if (TvrUi.menuSelInFocusID){
				$menuSelectors = $menuSelectors.not('#'+TvrUi.menuSelInFocusID);
			}

			$menuSelectors.remove();

        },

        // remove option selectors (bar sel in focus)
        unload_all_option_selectors: function(){ TvrCom.startT(arguments);

            TvrUi.stat.opts
                .find('ul.selector-sub')
                .find('> li:not(#'+TvrUi.selInFocusID+')')
                .remove();

            TvrCom.endT(arguments)
        },

		// update TvrEditor references following dom update
		update_editor_refs: function(
			con,
			$combObjs,
			origSection,
			newSection,
			origSelector,
			newSelector){ TvrCom.startT(arguments);

			return false; // we are switching to new system

			// prepare string for replacement
			var oldStr = (con == 'section') ? origSection : origSection+'-'+origSelector,
				newStr = (con == 'section') ? newSection : newSection+'-'+newSelector;

			// get pre obj(s) could be section or sel, and various tabs
			$combObjs.find('pre.custom-css-pre').each(function(){
				var $this = $(this);
				var oldID = $this.attr('id');

				// if there is an old ref, replace
				if (MTace.eds[$this.attr('id')]){
					var newID = oldID.replace(oldStr, newStr);
					//console.log('oldStr: '+oldStr+', newStr: '+newStr+', oldID: '+oldID+', newID: '+newID);
					// only replace if it changed, otherwise probs when sel/sec not changed
					if (newID != oldID){
						MTace.eds[newID] = MTace.eds[oldID];
						delete MTace.eds[oldID];
						// todo opening/closing should be decendent of MTace.eds[id][], this is messy
						/*MTace.eds[newID+'OpeningRange'] = MTace.eds[oldID+'OpeningRange'];
						MTace.eds[newID+'ClosingRange'] = MTace.eds[oldID+'ClosingRange'];
						delete MTace.eds[oldID+'OpeningRange'];
						delete MTace.eds[oldID+'ClosingRange'];*/
					}
				}
			});
			TvrCom.endT(arguments)
		},
		// do dom replacements
		dom_replacements: function(
		    oM,
			con,
			$combObjs,
			origSection,
			newSection,
			newSectionHuman,
			origSelector,
			newSelector,
			newSelectorHuman,
			code,
			key,
			groupIndex,
			isModifySelector){ TvrCom.startT(arguments);

			// update TvrEditor references too
			/*if (con == 'section' || con == 'selector'){
				TvrUi.update_editor_refs(con,$combObjs,origSection,newSection,origSelector,newSelector);
			}*/

			// if a section
			if (con == 'section'){
				$combObjs.find('input, textarea.property-input').each(function(index) {
					var $this = $(this);
					// the new color picker has an input with no name attr
					if( TvrCom.hasValue($this.attr('name')) ) {
						$this.attr('name', $this
								.attr('name')
								// regular input fields
								.replace('tvr_mcth['+origSection+']', 'tvr_mcth['+newSection+']')
								// m_query fields
								.replace(/tvr_mcth\[non_section\]\[m_query\]\[([a-zA-Z0-9_]+)\]\[([a-zA-Z0-9_]+)\]/,
								"tvr_mcth[non_section][m_query][$1]["+newSection+"]")
								// [important], [view_state], [display_name]
								.replace(/tvr_mcth\[non_section\]\[(important|view_state|display_name)\]\[([a-zA-Z0-9_]+)\]/,
								"tvr_mcth[non_section][$1]["+newSection+"]")
						);
					}
				});
				// update the visible text for the section menu item
				$combObjs.find('.section-name .name-text').text(newSectionHuman);
				$combObjs.find('.section-data-label').val(newSectionHuman);

				// replace all the IDs
				//- could just the section id be updated here? As this replacement seems to happen at the bottom too
				$combObjs.find('.selector-tag, .group-tag, .subgroup-tag, .property-tag, pre.custom-css-pre')

                    // need to add the wrapper lis as they have ids
					.add($combObjs).each(function() {
						var $this = $(this);
						$this.attr('id', $this
							.attr('id')
							.replace(origSection, newSection));

					}
				);

			}

			// selector
			if (con == 'selector') {
				// other updates
				$combObjs.find('.selector-name').attr('title', TvrCom.regular_escape_quotes(code));
				$combObjs.find('.selector-name .name-text').text(newSelectorHuman);
				$combObjs.find('.selector-label').val(newSelectorHuman+'|'+code);

				// xpath (maybe make this conditional)
				//console.log('Do we', code);
				if (code !== '#mt-no-element'){

					// ensure that the xpath is set at the selector level
					let xpath = TvrCom.attemptXPathConversion(code);
					$combObjs.find('.selector-xpath').val(xpath);

					// And data so group_to_css saves xpath
					if (origSection !== 'selector_section'){
						TvrCom.updateObject(TvrUi.uiData, [
							origSection, origSelector, 'xpath'], xpath
						);
					}

					//console.log('We can update the selector mod', groupIndex, origSection, origSelector, xpath);

				}

			}

			// group
			if (con == 'group'){
				// remove the tmpl id
				$combObjs.removeAttr('id');
				$combObjs.attr(
					'class', $combObjs.attr('class')
						.replace('property-fields-all-devices', 'property-fields-'+key)
				);

				// update
				// update name attr if media query
				if (key != 'all-devices') {
					$combObjs.find('input.property-input, textarea.property-input, input.disabled-tracker, input.chained-tracker, input.post-sel-css, input.post-sel-data, input.hidden-input-tracker').each(function(index) {
						// input.nth-item-radio not included above deliberately (one control for all tabs)
						var $this = $(this);

						$this.attr('name',$this
							.attr('name')
							.replace('tvr_mcth', 'tvr_mcth[non_section][m_query]['+key+']'));

					}).end().find('div.property-tag, div.subgroup-tag, pre.custom-css-pre').each(function() {
							var $this = $(this);
							$this.attr(
								'id', $this.attr('id')
									.replace('-all-devices', '-'+key)
							);
						});
				}
			}

			// selector and group have common replacements
			if (con === 'selector' || con === 'group'){
				// update the selector code aliases for the code pg
				//$combObjs.find('div.sel-code-alias').text(code);
				// modify inputs
				$combObjs.find('input, textarea.property-input').each(function(index) {
					var $this = $(this);
					// the new color picker has an input with no name attr
					if( TvrCom.hasValue($this.attr('name')) ) {

						$this.attr('name', $this
								.attr('name')
								// regular input fields
								.replace('tvr_mcth['+origSection+']['+origSelector+']',
								'tvr_mcth['+newSection+']['+newSelector+']')
								// m_query fields
								.replace(/tvr_mcth\[non_section\]\[m_query\]\[([a-zA-Z0-9_]+)\]\[([a-zA-Z0-9_]+)\]\[([a-zA-Z0-9_]+)\]/,
								"tvr_mcth[non_section][m_query][$1]["+newSection+"]["+newSelector+"]")
								// [important], [view_state], [display_name]
								.replace(/tvr_mcth\[non_section\]\[(important|view_state|display_name)\]\[([a-zA-Z0-9_]+)\]\[([a-zA-Z0-9_]+)\]/,
								"tvr_mcth[non_section][$1]["+newSection+"]["+newSelector+"]")
						);

						// support group index for e.g. 'html'
						if (groupIndex){ // the default is 0 so no need for that one
							$this.attr('name', TvrCom.replace_variable_name_attr($this.attr('name'), groupIndex));
							//console.log('Updated the groupIndex', groupIndex, $this.attr('name'))
						}


					}

				});
				// replace all the selector/group IDs
				$combObjs.find('.selector-tag, .group-tag, .subgroup-tag, .property-tag, pre.custom-css-pre')
					// need to add the wrapper lis as they have ids
					.add($combObjs).each(function() {
						try {
							var $this = $(this),
								id = $this.attr('id');

							if (id){
								$this.attr(
									'id', id.replace(origSection+'-'+origSelector, newSection+'-'+newSelector)
								);
							}

						} catch (e) {}
					}
				);

				// We need an event point for running functionality just before updating the selector DOM
				// We will clear TinyMCE references and set things like toggles.
				// Note, we may have functionality in load_selector that should be moved to this function
				// to handle edge cases like copy correctly
				if (con === 'selector' && !isModifySelector){
					TvrUi.beforeInsertSelectorDomTemplate($combObjs);
				} else if (con === 'group'){
					TvrUi.beforeInsertGroupDomTemplate($combObjs);
				}
				
			}

			// dynamic menu items
			if (con == 'dyn_item'){
				// name vars properly to avoid confusion
				var origItem = origSection, newItem = newSection, newItemHuman = newSectionHuman;
				// update item id
				$combObjs.attr('id', $combObjs.attr('id').replace(origItem, newItem));
				// set proper keys in inputs/textareas
				$combObjs.find('input, textarea').each(function() {
					var $this = $(this);
					$this.attr('name', $this.attr('name').replace('['+origItem+']', '['+newItem+']'));
				});
				$combObjs.find('.script-display_name, .mquery-label').val(newItemHuman);
				// set item label
				$combObjs.find('.name-text').text(newItemHuman);
			}
			TvrCom.endT(arguments)
			return $combObjs;
		},
		
		beforeInsertSelectorDomTemplate($combObjs){

			// Clear any TinyMCE references
			TvrUi.beforeDOMViewChange();
			
			//console.log('beforeInsertSelectorDomTemplate', $combObjs)
			
		},

		beforeInsertGroupDomTemplate($combObjs){

			if (TvrUi.pref.pg_focus === 'html'){

				// Set correct state for rich text toggle
				if (parseInt(TvrUi.pref.mt_rich_text)){
					let $toggle = $combObjs.find('#rich-text-toggle');
					//console.log('check rich toggle', $toggle)
					if ($toggle.length){
						$toggle.addClass('on').attr('title', $toggle.data('neg'));
					}

				}

				// Set correct state for the advanced snippet options
				if (parseInt(TvrUi.pref.show_snippet_adv)){
					let $toggle = $combObjs.find('#toggle-snippet-adv');
					//console.log('check snippet toggle', $toggle)
					if ($toggle.length){
						$toggle.addClass('on').attr('title', $toggle.data('neg'));
						$combObjs.find('.mt-snippet-footer').css('max-height', 'none');
					}

				}
			}
		},


		/***
		 *
		 * SECTION FUNCTIONS
		 */

		/*** add the section ***/
		add_section: function(name, draft, skipSave){ TvrCom.startT(arguments);

			//console.log('add_section name passed in', name);

			// get selector CSS and label values submitted by user
			//var userVal = $clicked.siblings(".new-section-input").val();
			//var tmp = TvrCom.new_name_checks(userVal, 'folder');
			//if (!tmp){
				//return false;
			//}

			// get name passed in or default to 'New folder'
			var newFolderButtonClicked = false
			if (!name){
				name = TvrLang.untitled_folder;
				newFolderButtonClicked = true;
			}

			// ensure unique name e.g. New folder _2
			// use this once JS object updates instantly, not after ajax_save_settings callback
			//name = TvrUi.ensure_unique_name(name, false, 'folderName');
			//name = TvrCom.resolve_unique_name(name, $('#tvr-menu'), '.section-name', 'folder')
			name = TvrCom.resolve_unique_name(name, $('#tvr-menu'), '.section-name');

			//console.log('the HTML template', name, $(TvrUi.templates.sectionM).html())
            //console.log('the clone', name, $('#strk-selector_section').add($('#opts-selector_section')).clone().html())

			// clone folder menu and options from html template
			var $combObjs = TvrUi.dom_replacements(
				false,
				'section',
				//$('#strk-selector_section').add($('#opts-selector_section')).clone(),
                $(TvrUi.templates.sectionM).add(TvrUi.templates.section),
				'selector_section',
				TvrCom.convert_to_param(name),
				name
			);

			// add options to the dom
			$('#tvr-options').append($combObjs[1]);

			// add menu to the dom
			var $menu = $('#tvr-menu');

			$menu.append($combObjs[0]);

			var $newFolder = $menu.find('li.section-tag').filter(':last');

			var M = TvrUi.get_meta($newFolder, 'section');

			$newFolder.hide().fadeIn('fast', function() {
				//$('#add-new-section').find("input.new-section-input").val('');
				// update the hidden section count
				var $countTracker = $('#section-count-state');
				TvrUi.update_count($countTracker, 'add', 1, 'section');
			});

			// copy any logic from folder that was created with a similar name e.g. General _2
			var applyLogic = false;
			if (TvrUi.applyLogicToFolder){

				//console.log('We need to set the logic ', TvrUi.applyLogicToFolder, ' on ', M.sectionSlug);

				MTfolder.setFolderLogicHiddenInputs(
					M,
					TvrUi.applyLogicToFolder
				);

				// flag folder as conditional by adding the relevant classes
				if (!MTfolder.hasGlobalCondition(TvrUi.applyLogicToFolder.expr)){
					M.sectionM.addClass('item-conditional');
				}

				// Update asset_loading
				TvrCom.updateObject(TvrUi.pref.asset_loading, ['conditional', M.sectionSlug], 1);

				// Update cur item
				TvrUi.update_cur_item_apply_state(M,'section');

				applyLogic = TvrUi.applyLogicToFolder;
				TvrUi.applyLogicToFolder = null;
			}

			// update JS object
            var settings = MTdd.dom_to_data({
                M: M,
                domDepth: 'section',
                return: 'mtData' // no need to write CSS when adding a new folder
            });

			//console.log('The data after folder create ', $.extend(true, {}, TvrUi.uiData[M.sectionSlug]), MTF.stat.win.MTDynFrontData);

            // mark folder as draft folder so it can be deleted from JS object if no selector was added at point of publish
            if (draft){

				TvrUi.draftFolders.push(M.sectionSlug);

				// Ensure the folder logic is added to the JS data for the draft folder
				TvrUi.uiData[M.sectionSlug]['this'].logic = applyLogic;

				// let frontend know about draft folder with logic so folderLoading is correct
				if (applyLogic && applyLogic.expr){

					//console.log('updateDraftFolderInSession', M.sectionSlug, applyLogic)

					MTfolder.updateDraftFolderInSession({
						slug: M.sectionSlug,
						expr: applyLogic.expr
					});
				}

			}

			// update the sortable items
            TvrUi.refresh_sortable();

			// scroll to bottom of menu
			TvrCom.scroll_to({
				scrollDiv: TvrUi.folders_scrollable_area(),
				bottom: true
			});

			// log history
            settings = MTsave.user_action(settings, {
				'items': [name],
				'val': name,
				'icon': 'mtif-add'
			});

            // close the add folder popup
            TvrUi.close_context_menu({
				filter: '.cm-add-folder-options'
			});

			// maybe move the auto-folder in a sensible position - do this immediately even if draft
			// the JS data update comes at the point of saving the draft selector
			MTfolder.maybeAutoSortSection('dom', M, settings);

            if (!draft && !skipSave){

				// Flag if conditional folder styles need to be checked
				MTfolder.maybeAddLogicAdjustedFlag(M.sectionSlug, settings);

				// maybe move the auto-folder in a sensible position
				//MTfolder.maybeAutoSortSection(M, settings);

				MTsave.ajax_save_settings({
					settings: settings
				});
			}

			TvrCom.endT(arguments);
			return name;
		},

		folders_scrollable_area: function(){
			return TvrUi.stat.mainMenu.children('.menu-scrollable');
		},


		/*** fully load section selectors (pending rename, copy, or disable)
		 * todo - get all in one network connection and insert html nodes based on sel tracker var ***/
		/*load_section_selectors: function(M, con){ TvrCom.startT(arguments);
			var $emptySels = M.sectionM.find('input.selector-tracker[value="0"]');
			TvrUi.selsToLoad = $emptySels.length;
			TvrUi.totalToLoad = TvrUi.selsToLoad;
			if (TvrUi.selsToLoad > 0) {
				// start loading gif outside load function as it's a loop
				if (MTsave.action_in_prog(M.sectionM, 'all-sels-loading')){
					return true; // flip return value as it means sels are loading
				}
				// log action
				MTsave.log_action(M.sectionM, 'all-sels-loading');
				TvrUi.com_data_loading(M.sectionM, 'sec', con);
				$emptySels.each(function() {
					// get all necessary objects/vals and pass (need to do outside of func coz of async)
					M = TvrUi.get_meta($(this), 'selector');
					TvrUi.ajax_load_ui_data(M.selector, M.sectionM, M.selectorT, M.sectionSlug,
						M.selectorSlug, 'selector', 3, con);
				});
				TvrCom.endT(arguments)
				return true;
			} else {
				TvrCom.endT(arguments)
				return false;
			}
		},*/





		/*** rename the section ***/
		action_rename_section: function($clicked, M, userVal){ TvrCom.startT(arguments);

			M = M || TvrUi.get_meta_for_context($clicked, 'section', 'folder-popup');
			userVal = userVal || $clicked.closest('.edit-section-form').find('.edit-section-label-input').val();

			var tmp = {};

			// they may just be altering lower case to upper case, so if the value is the same essentially, allow
			// without doing duplicate check
			if (TvrCom.convert_to_param(userVal) === M.sectionSlug) {
				tmp['newName'] = M.sectionSlug;
				tmp['newNameHuman'] = userVal;
			} else {
				// get new section name
				tmp = TvrCom.new_name_checks(userVal, 'folder');
				if (!tmp){
					return false;
				}
			}

			// do the dom updates (also used by folder key fix script) and the JS data / history / save stuff
			return TvrUi.rename_section_updates(M, tmp, $clicked);

			TvrCom.endT(arguments)
		},

		rename_section_updates: function(M, tmp, $clicked, justKeyDomFix){

			// get the old name for history
			var oldName = M.sectionM.find('input.section-data-label').val();
			// get new stuff
			var newSection = tmp['newName'];
			var newSectionHuman = tmp['newNameHuman'];
			// update all inputs in this section
			var origSection = M.sectionSlug;
			var $combObjs = M.sectionM.add(M.section);

			// include frontend style tags if frontend has loaded
			if (TvrUi.iframeEditing()){
				$combObjs = $combObjs.add($(MTF.get_style_nodes(M)));
			}

			// check if section is in focus before dom replacements
			var isCurSec = TvrUi.is_cur('section', origSection);

			// update dom
			TvrUi.dom_replacements(
				M,
				'section',
				$combObjs,
				origSection,
				newSection,
				newSectionHuman
			);

			// redefine section context
			M = TvrUi.get_meta($('#strk-'+newSection), 'section');

			// update the global selInFocusID if section is in focus
			if (isCurSec){
				TvrUi.update_global_vars( TvrUi.get_meta(M.section.find('li.in-focus'), 'selector') );
			}

			// no need for data/history/save if we're just making the folder keys match the key format fix on the data
			if (justKeyDomFix){
				return false;
			}

			// hide the 'rename section' form
			//TvrUi.toggle_rename_section(M.sectionM);
			// close the context menu - unless the logic has been
			if (!TvrUi.logicTextareaChanged){
				//console.log('Safe to close edit folder', M);
				TvrUi.close_context_menu({
					filter: '.cm-edit-folder-options'
				});
			}

			// update the M reference if the folder context menu is showing
			if (TvrUi.context_menu_data && TvrUi.context_menu_data.filter === '.cm-edit-folder-options') {
				//console.log('Update M', M);
				TvrUi.context_menu_data.M = M;
			}

			// Maybe update Amender mods
			MThtml.maybeUpdateAmenderModKeys(origSection, newSection, 'section');

			// Data updates
			var settings = MTloop.modify_main_js_object('rename', {}, {
				rebuild: true,
				callbackDepth: ['section'], // section must also be copied
				maxDepth: 'section',
				targetDepth: 'section',
				targetSection: origSection,
				new_key: newSection,
				new_label: newSectionHuman
			});

			// log for history
			var valTT = '';
			// show info about what changed
			if (oldName !== newSectionHuman){
				valTT+= TvrLang.previous_name +': '+oldName+"\n";
				valTT+= TvrLang.new_name +': '+newSectionHuman;
			}

			// delete from folderLoading (asset_loading gets updated on save and returned)
			TvrUi.updateFolderLoading('rename', origSection, { slug: M.sectionSlug });

			if ($clicked){

				settings = MTsave.user_action(settings, {
					'items': ['section'],
					'val': TvrUi.title($clicked),
					'M': M,
					'valTT': valTT,
					'icon': 'edit-icon tvr-icon', // [{'icon': TvrUi.hi['section']}, {'icon': 'edit-icon tvr-icon'}]
				});

				MTsave.ajax_save_settings({
					settings: settings
				});

			} else {
				return {
					M: M,
					settings: settings
				};
			}

		},

		// copy the section
		copy_section: function($clicked){ TvrCom.startT(arguments);

			var M = TvrUi.get_meta_for_context($clicked, 'section');

			// if the folder contains a draft selector, save it
			TvrUi.maybe_save_draft_selector_before_action(M, 'section', 'copy');

            MTsave.log_action(M.sectionM, 'copy');
            var origSectionSlug = M.sectionSlug,
                origSectionHuman = M.sectionH,
                newSectionHuman = TvrCom.resolve_unique_name(M.sectionH, $('#tvr-menu'), '.section-name', 'Copy'),
                newSectionSlug = TvrCom.convert_to_param(newSectionHuman),
                origStyleNodes = false;

            // note special array syntax is needed to retain order of origStyleNodes - .add() reorders
            var orderedEls = [M.sectionM[0], M.section[0]]; // , M.section[0]
            if (TvrUi.iframeEditing()){
                origStyleNodes = MTF.get_style_nodes(M);
                orderedEls = orderedEls.concat(origStyleNodes);
            }

            //console.log('origStyleNodes', origStyleNodes);

            var $combObjs = TvrUi.dom_replacements(
                M,
                'section',

                // note special syntax is needed to retain order of origStyleNodes - .add() reorders
                TvrUi.proper_clone( $(orderedEls) ),

                //TvrUi.proper_clone( M.section.add(M.sectionM) ),
                origSectionSlug,
                newSectionSlug,
                newSectionHuman
            );

            // clean up
			$combObjs = TvrUi.reset_copied_active_classes($combObjs);

			// Delete selectors which may have stale editor references
			// They will load will user opens the folder (it gets closes below)
			$($combObjs[1]).find('ul.selector-sub').empty();

            // add to dom
            M.sectionM.after($combObjs[0]);
            M.section.after($combObjs[1]);

            // add copied style nodes after the original nodes
            if (TvrUi.iframeEditing()){
                MTF.insertCopiedStyleNodes(origStyleNodes, $combObjs);
            }

			// copy the JS object
			var settings = MTloop.modify_main_js_object('copy', {}, {
				M: M,
				targetDepth:'section',
				maxDepth:'section',
				origSlug: origSectionSlug,
				origHuman: origSectionHuman,
				newSlug: newSectionSlug,
				newHuman: newSectionHuman
			});

			// reorder the JS object so copy folder is after the original
			settings = MTloop.reorder_after_copy(settings, M.sectionM, true);

            // update section count and selecor count
            var $countTracker = $('#section-count-state');
            var selectorCount = M.sectionM.find('span.selector-count-state').attr('rel');
            TvrUi.update_count($countTracker, 'add', 1, 'section', selectorCount);

			// Close the folder so selectors can load afresh
			TvrUi.close_folder(TvrUi.get_meta($('#strk-'+newSectionSlug), 'section'));

            // make copyable again
            MTsave.unlog_action(M.sectionM, 'copy');

            // update visual controls
            if (TvrCom.hasValue(TvrUi.selInFocusID)) {
                TvrUi.update_prev_next_sel_buttons(TvrUi.selInFocusID);
            }

            // ensure selectors in copied section are sortable
            TvrUi.refresh_sortable();

            // log for history
            settings = MTsave.user_action(settings, {
                'items': ['section'],
                'val': TvrUi.title($clicked),
                'M': M,
                'valTT': newSectionHuman,
                'icon': $clicked.attr('class')
                //'valFirst': true
            });

			// Flag if conditional folder styles need to be checked
			MTfolder.maybeAddLogicAdjustedFlag(M.sectionSlug, settings);

            MTsave.ajax_save_settings({
                settings: settings
            });

			//}
			TvrCom.endT(arguments)
		},


		/*** delete the section ***/
		delete_section: function($clicked, draft){ TvrCom.startT(arguments);

		    var M = TvrUi.get_meta_for_context($clicked, 'section');

		    // there is scope for dbl-click during animation so bail if an action is already in progress
			if (MTsave.action_in_prog(M.sectionM, 'delete') || MTsave.action_in_prog(M.sectionM, 'all-sels-loading')){
				return false;
			}

			// warn against deleting a folder that contains selectors ('this' will be there even if empty)
            if (TvrCom.obj_length(TvrUi.uiData[M.sectionSlug], { exclKey: 'this'}) > 0) {
                var r = confirm(tvrsprintf(TvrLang.delete_folder_confirm, M.sectionH));
                if (!r) {
                    return false;
                }
            }

			// log action
			MTsave.log_action(M.sectionM, 'delete');

			// remove the section
			M.sectionM.fadeOut('fast', function() {
				TvrUi.action_delete_section(M, draft, $clicked);
			});

			TvrCom.endT(arguments)
		},

		// run code for deleting a section, sometimes after fadeOut or instant (with draft)
		action_delete_section: function(M, draft, $clicked){

			var selectorCount = M.sectionM.find('span.selector-count-state').attr('rel');

			// update the section count (also updates global vars if final section)
			TvrUi.update_count( $('#section-count-state'), 'subtract', 1, 'section', selectorCount);

			var isFocusFolder = TvrCom.hasValue(TvrUi.selInFocusID) && TvrUi.is_cur('section', M.sectionSlug);

			// remove the quick edit classes before removing the dom element
			if (isFocusFolder) {

				/*if (TvrUi.expanded('quick_section')){
					TvrUi.close_quick_edit();
				}*/

				// find a selector in another section before removing
				var newSelID = TvrUi.itemScan('selector', 'next', 'getID', M.sectionSlug);
				if (!newSelID){
					newSelID = TvrUi.itemScan('selector', 'prev', 'getID', M.sectionSlug);
				}
			}

			// remove the folder, before trying to find another selector
			M.section.remove();
			M.sectionM.remove();

			// remove the preview style node too (must be before JS delete below)
			!MTF || MTF.edit_style_nodes(M, 'delete');

			var settings = MTloop.modify_main_js_object('delete', {}, {
				rebuild: true,
				//callbackDepth: ['section', 'selector'], // section must also be copied
				maxDepth: 'section',
				targetDepth: 'section',
				targetSection: M.sectionSlug
			});

			// Toolbars may need adjusting
			TvrUi.after_style_options_deleted('section');

			// close the context menu if open
			TvrUi.close_context_menu({
				filter: '.cm-edit-folder-options'
			});

			// iterate to next or prev section if the secInFocus was deleted
			if (isFocusFolder && !draft) {

				if (newSelID){
					TvrUi.tvr_iterate_selectors_v(false, newSelID, {
						doNotBringStylesTop: 1
					});
				}

			}

			// update visual controls if no more selectors
			if (!newSelID){
				TvrUi.update_prev_next_sel_buttons(false);
			}

			if (!draft){

				// log for history
				settings = MTsave.user_action(settings, {
					'items': ['section'],
					'val': TvrUi.title($clicked),
					'M': M,
					'icon': $clicked.attr('class')
				});

				// Flag if conditional folder styles need to be checked
				MTfolder.maybeAddLogicAdjustedFlag(M.sectionSlug, settings);

				// delete from folderLoading (asset_loading gets updated on save and returned)
				TvrUi.updateFolderLoading('delete', M.sectionSlug);

				MTsave.ajax_save_settings({
					settings: settings
				});
			}


		},

		updateFolderLoading: function(action, slug, config){

			let folderLoading = MTF ? MTF.getMTDynFrontData().folderLoading : false;

			//console.log('folderLoading before', $.extend(true, {}, folderLoading));

			if (folderLoading && folderLoading[slug] !== undefined){
				switch (action){
					case 'delete':
						delete folderLoading[slug];
						break;
					case 'rename':
						folderLoading[config.slug] = folderLoading[slug];
						delete folderLoading[slug];
						break;
				}

			}

			//console.log('folderLoading after', $.extend(true, {}, folderLoading));

		},

		toggle_folder_add_options: function($clicked){
			TvrUi.toggle_context_menu({
				$clicked: $clicked,
				filter: '.cm-add-folder-options',
				relatedto: 'folders',
				offsetSpacingLeft: 0,
				noWidthOffset: true,

				// give input focus
				after_open: function(data){
					data.$content.find('input.add-section-label-input').focus();
				},

				// clear the add selector label and code fields
				after_close: function(data){
					data.$content.find('input.add-section-label-input').val('');
				}
			});
		},

		// show the options for the folder or a folder item
		toggle_folder_more_options: function($clicked){

			var level = $clicked.data('level'),
				isCurrentItem = $clicked.parent().hasClass('current-item-actions'),
				M = isCurrentItem
						? TvrUi.get_selector_in_focus()
						: TvrUi.get_meta($clicked, level),
				$item = M[level+'M'];

			// section
			if (level === 'section'){

				TvrUi.toggle_context_menu({
					M: M,
					$clicked: $clicked,
					filter: '.cm-edit-folder-options',
					relatedto: 'folders',
					isCurrentItem: isCurrentItem,
					offsetSpacingTop: 0,
					widthEstimate: 560,
					heightEstimate: 485, // with test results showing it's 485

					before_open: function(data){

						// cancel draft selector, which clears the selector label and code fields
						//TvrUi.cancel_draft_selector_edit();
						// NO - cancelling had an issue with deleting folders containing one draft sel
						// So this is safer
						if (TvrUi.retargetSelector || TvrUi.draftSelector.atts.id) {
							TvrUi.save_draft_selector(TvrUi.retargetSelector, true);
						}


						// update folder field with current folder name
						data.$content.find('input.edit-section-label-input').val(M.sectionH);

						// set disabled icon to on/off if state doesn't match
						TvrUi.ensure_correct_disabled_state(M, level, data);

						// update the folder logic options
						let logic =TvrUi.uiData[M.sectionSlug]
							? TvrUi.uiData[M.sectionSlug]['this'].logic
							: undefined;

						if (logic){
							MTfolder.updateLogicFields('loadSettings', data.$content, logic);
						} else {
							MTfolder.reset_logic_fields(data.$content);
						}

					},

					// clear the add selector label and code fields
					after_close: function(data){
						data.$content.find('input.selector-css-textarea, input.selector-name-input').val('');
						MTfolder.reset_logic_fields(data.$content);
					}
				});
			}

			// item (e.g. selector)
			else {
				TvrUi.toggle_context_menu({
					M: M,
					$clicked: $clicked,
					filter: '.cm-selector-options',
					relatedto: 'folders',
					widthEstimate: 400,
					heightEstimate: 351,

					// update folder field with current folder name
					before_open: function(data){
						TvrUi.update_edit_selector_fields(M, level, data);
					}
				});

			}

			// double-clicking options toggle can highlight text, which we don't want
			TvrCom.clearSelection(TvrUi.stat.win, TvrUi.stat.doc);
		},

		draftInProgress: function(){
			return TvrUi.draftSelector.atts.id || TvrUi.retargetSelector;
		},

		binary_button_clicked: function($clicked){

			var buttonAction = !!parseInt($clicked.attr('rel')),
				$container = $clicked.closest('.mt-binary-buttons'),
				$checkbox = $container.children('input[type="checkbox"]').first(),
				turnOn = !$container.hasClass('on'),
				changeState = buttonAction === turnOn,
				data = $container.data(),
				run = data.run;

			//console.log('binary_button_clicked', buttonAction, turnOn, changeState)

			if (changeState){

				// tap into toggle feature function if required
				if (data.toggleFeature){
					TvrUi.toggle_feature($container);
				}

				// this can still run after toggle as class change does nothing and we still want checkbox to be toggled
				if (!turnOn){
					$container.removeClass('on');
					$checkbox.prop("checked", false);

				} else {
					$container.addClass('on');
					$checkbox.prop("checked", true);

				}

			}

			if (run && (changeState || $container.data('always-run'))){

				let parts = run.split('.'),
					method = TvrCom.checkObject(TvrMT, parts);

				if (method){
					let methodName = parts[parts.length-1];
					if (methodName === 'autoFolderOptions'){
						method($clicked, ($container.hasClass('on') ? 'page' : 'global'), changeState);
					} else {
						//console.log('method', $clicked, changeState)
						method($clicked, turnOn);
					}
				}

			}


		},

		edit_selector_fields_showing: function(){
			return TvrUi.context_menu_data && TvrUi.context_menu_data.filter === '.cm-selector-options';
		},

		update_edit_selector_fields: function(M, level, data){

			// set the label / code values
			data.$content.find('input.selector-name-input').val(M.selectorH);
			data.$content.find('input.selector-css-textarea').val(M.selectorCode);

			// set disabled icon to on/off if state doesn't match
			TvrUi.ensure_correct_disabled_state(M, level, data);

			// hover etc variation
			TvrUi.generate_selector_variations(data);
		},

		ensure_correct_disabled_state: function(M, level, data){

			 var $iconsContainer = data.$content.find('.manage-'+level+'-icons'),
				 $disabledToggle = $iconsContainer.find('.disabled-toggle'),
			 	 $disabledInput = $disabledToggle.prev('.disabled-tracker'),
				 isDisabled = TvrUi.is_dis(M[level+'M']);

			 // reset the HTML to not-disabled
			 $disabledToggle.removeClass('active');
			 if (TvrCom.isDomEl($disabledInput)){
				 $disabledInput.remove();
			 }

			 // set the disabled state again, without history or save to JS data needed
			 if (isDisabled){
				 TvrUi.input_icon_toggle($disabledToggle, false, true);
			 }
		},

		toggle_editor_options: function($clicked){
			TvrUi.toggle_context_menu({
				$clicked: $clicked,
				filter: '.cm-editor-options',
				offsetSpacingLeft: 0,
				noWidthOffset: true
			});
		},

		toggle_responsive_tab_options: function($clicked){
			TvrUi.toggle_context_menu({
				$clicked: $clicked,
				filter: '.cm-responsive-tab-options',
				offsetSpacingLeft: (($clicked.parent().outerWidth() + 2 - $clicked.outerWidth()) / 2) * -1,
				offsetSpacingTop: 30,
				noWidthOffset: true,

				// update field with label / media query value
				before_open: function(data){

					var $tab = $clicked.closest('.mt-tab'),
						mq_key = $tab.attr('rel'),
						Tab = TvrMQsCombined[mq_key];

					data.$content.find('.edit-responsive-tab-label-input').val(Tab.label);
					data.$content.find('.edit-responsive-tab-query-input').val(Tab.query);

					// add special class for All Devices, which can't be edited
					if (mq_key === 'all-devices'){
						data.$content.addClass('all-devices-tab-actions');
					} else {
						data.$content.removeClass('all-devices-tab-actions');
					}

					// add/remove active class to disabled toggle
					var $disabledToggle = data.$content.find('.disabled-toggle');
					if ($tab.hasClass('item-disabled')){
						$disabledToggle.addClass('active');
					} else {
						$disabledToggle.removeClass('active');
					}

					// save vars for update function
					data.mq_key = mq_key;
					data.Tab = Tab;
					data.M = TvrUi.get_selector_in_focus();

				},

			});
		},

		update_single_responsive_tab: function($clicked){

			// get new values
			var data = TvrUi.context_menu_data,
				newLabel = data.$content.find('.edit-responsive-tab-label-input').val(),
				newQuery = data.$content.find('.edit-responsive-tab-query-input').val(),
				$preferencesItem = $('#mqs-'+data.mq_key);

			//console.log('update_single_responsive_tab', data.mq_key, newLabel, newQuery, $preferencesItem, data)

			// update preference fields
			$preferencesItem.find('.mquery-label').val(newLabel);
			$preferencesItem.find('.mquery-query').val(newQuery);

			// save (reloads page)
			MTsave.save_media_queries();

		},


		/***
		 *
		 * SELECTOR FUNCTIONS
		 */


		// execute common functonality for add/modify selector
		selector_checks_values: function(name, code, selectorSlug, sectionSlug){ TvrCom.startT(arguments);

			//console.log('the values to check', name, code, selectorSlug)

			//TvrCom.callStack();

			var userVal = TvrUi.strip_beyoned_brace( name, 'name' ),
				defaultName = TvrLang.untitled,
				tmp = {};

			// get selector CSS and label values submitted by user
			if (userVal === '') {
				userVal = defaultName;
				/*alert(TvrLang.enter_selector_name);
				return false;*/
			}

			// fix an issue where selectors are encoded as arrays rather than objects with dom_to_data
			if (TvrCom.isNumeric(userVal)){
                alert('Plain numbers are not permitted as names. Please use some letters too.');
                return false;
            }

			// they may just be altering lower case to upper case, so if the value is the same essentially, allow
			// without doing duplicate check
			if (TvrCom.convert_to_param(userVal) === selectorSlug) {
				tmp['newName'] = selectorSlug;
				tmp['newNameHuman'] = userVal;
			} else {
				// get new selector name
				/*var tmp = TvrCom.new_name_checks(userVal, 'selector');
				if (!tmp){
					return false;
				}*/
				tmp['newNameHuman'] = TvrUi.ensure_unique_name(userVal, false, 'create-new', false, sectionSlug)
				tmp['newName'] = TvrCom.convert_to_param(tmp['newNameHuman']);

				//console.log('name conflict resolved', sectionSlug, tmp);
			}
			if (!code) {
				alert(TvrLang.enter_css);
				return false;
			}
			tmp['code'] = code;
			TvrCom.endT(arguments)
			return tmp;
		},
		// show custom styles have been used by giving menu name an icon
		show_hide_sel_custom: function(code, $menu_name){ TvrCom.startT(arguments);
			var tmp2 = TvrUi.analyse_sel_code(code);
			if (tmp2['custom_styles']){
				$menu_name.addClass('custom-styles'); // update as {} may have been added or removed
			} else {
				$menu_name.removeClass('custom-styles');
			}
			TvrCom.endT(arguments)
		},
		// the user may enter custom CSS styles in the selector textarea, remove and adjust the name
		// note: both values are always used because we keep the full code until the last minute in the iframe
		analyse_sel_code: function(code){ TvrCom.startT(arguments);
			var tmp2 = [];
			// update selector name if curly braces have been used
			if (code.indexOf('{') >= 0) {
				tmp2['custom_styles'] = true;
				var arr = code.split('{');
				tmp2['code'] = arr[0];
			} else {
				tmp2['custom_styles'] = false;
				tmp2['code'] = code;
			}
			TvrCom.endT(arguments)
			return tmp2;
		},

		/*** add the selector ***/
		add_selector: function(M, $clicked, draft, config){ TvrCom.startT(arguments);

			config = config || {};

			// M will be passed for draft/retargeting, but needs to be obtained from content_menu_data with popup form buttons
			M = M || TvrUi.get_meta_for_context($clicked, 'section', 'folder-popup')

			var $form = $clicked.closest('.mt-folder-form');

			/*if (!TvrUi.allowed_action(M, 'Add Sel')){
				return false;
			}*/

			//console.log('we add selector', $form.find('.selector-css-textarea').val(), $form.find(".selector-name-input").val(), config)

			// get selector values and do checks
			var tmp = TvrUi.selector_checks_values(
				$form.find(".selector-name-input").val(), // $name_field
				TvrUi.strip_beyoned_brace( $form.find('.selector-css-textarea').val() ),
				false,
				M.sectionSlug
			);

			if (!tmp){
				return false;
			}

			// ensure the folder is open before adding the selector - otherwise not all items will load
			if (!M.sectionM.hasClass('is-open')){
				//console.log('Open folder as not already open', M.sectionM.hasClass('is-open'), M.sectionM[0].outerHTML)
				TvrUi.open_folder(M);
			}

			var selector_slug = tmp['newName'],
				absIndex = TvrUi.totalSels,
				$combObjs = TvrUi.dom_replacements(
			    M,
				'selector',
                $(TvrUi.templates.selectorM).add(TvrUi.templates.selector),
				//$('#strk-selector_section-selector_css').add( $('#opts-selector_section-selector_css') ).clone(),
				'selector_section',
				M.sectionSlug,
				M.sectionM.find('.name-text').text(),
				'selector_css',
				selector_slug,
				tmp['newNameHuman'],
				tmp['code']);

			var $selector = $($combObjs[1]),
				group = TvrUi.pref.pg_focus;

			// add pg group
			MTloop.maybe_add_group_template(
				$selector, M.sectionSlug, tmp['newName'], tmp['newNameHuman'], tmp['code'], M.tabSlug, group
			);

			// are we loading the editor alongside the GUI?
			var extraEditor = MTlayout.editor_and_gui() && group !== 'code';
			if (extraEditor){
				MTloop.maybe_add_group_template(
					$selector, M.sectionSlug, tmp['newName'], tmp['newNameHuman'], tmp['code'], M.tabSlug, 'code'
				);
			}

			// append to the dom
			M.sectionM.find('.selector-sub').append($combObjs[0]);
			M.section.find('.selector-sub').append($selector);

			// update selector count for the selector
			TvrUi.update_count( M.sectionM.find('.selector-count-state'), 'add', 1, 'selector', '');

			// redefine global meta with selector info (must come before quick edit close)
			M = TvrUi.get_meta(M.section.find('.selector-tag').last(), 'selector');

			// update JS object
			var settings = MTdd.dom_to_data({
				M: M,
				domDepth: 'selector',
				keepAsDraft: draft,
				clean:{
					selector:[['styles'], [group]]
				},
				cleanMaxDepth: 'selector',

				// there was an issue with selector index not being defined when preprocessor object is set in
				// group_to_css - and just skipping the Sass compile, which isn't needed, was a simple fix
				skipSassCompile: true,

				// experimental - i don't think we need to run group_to_css, which also triggers global scans and html mod cehck
				return: 'mtData'
			});

			// if quick folder edit, tmp close before iterate selectors (which changes the quick edit html)
			/*var quickSec = false;
			if (TvrUi.expanded('quick_section')) {
				quickSec = true;
				TvrUi.close_quick_edit();
			}*/

			// default object for storing the history on
			//var historyStoreObject = settings;

			// if draft selector
			if (draft){

				// ensure auto-name is set back to on for new draft selectors
				//TvrUi.enable_selector_auto_name();

				TvrUi.draftSelector.atts = TvrUi.selector_key_atts(M);

				// mark selector as draft
				MTloop.updateObjectAndSavePackage(settings.savePackage, [{
					action: 'append',
					trail: [M.sectionSlug, selector_slug],
					key: 'isDraft',
					data: 1
				}]);

				//console.log('the save package for isDraft', $.extend(true, {}, settings));

				// store history of selector draft change for using when publishing selector
				//historyStoreObject = TvrUi.draft_user_action.new;
			}

            //console.log('the data after dtd', settings, $.extend(true, {}, TvrUi.uiData))

			// update the indexes
			settings = MTloop.run_global_scans(settings, ['update_indexes']);

            // ensure new selector has current JS version flag and an abs_index
			MTloop.updateObjectAndSavePackage(settings.savePackage, {
				action: 'array_merge_recursive_distinct',
				trail: [M.sectionSlug, selector_slug],
				data: {
					jsu: TvrUi.jsuVersion,
					abs_index: absIndex
				}
			});

			//TvrCom.updateObject(TvrUi.uiData, [M.sectionSlug, tmp['newName'], 'jsu'], TvrUi.jsuVersion);

            //console.log('the ui after add seelctor', M.sectionSlug, selector_slug, $.extend(true, {}, TvrUi.uiData))
			
			//return false;

			// auto iterate onto newly created selector
			config.action = 'add_draft_selector';
			config.elementAlreadySelected = 1;
			TvrUi.tvr_iterate_selectors_v(M.selectorM, false, config);

			// default to last used pg
			//TvrUi.maybe_default_to_pg(); // iterate function does this

			// update the sortable items
			TvrUi.refresh_sortable();

			// hide the add selector options
			if (!config.switchSelVariation){
				TvrUi.close_context_menu({
					filter: '.cm-edit-folder-options'
				});
			}

			// ensure editor has focus
			MTace.maybe_resume_editor_focus(); // loc 1. not sure if this caused too many issues

			MTsave.user_action((draft ? TvrUi.draft_user_action.new : settings), {
				'items': ['selector'],
				'val': TvrUi.title($clicked),
				'M': M,
				'pathTT': true,
				'icon': 'mtif-add'
			});

			//console.log('the data after add', $.extend(true, {}, settings))

			// if auto-folders, order the selector to match the order of the dom elements
			MTfolder.maybeAutoSortSelector('dom', M, settings);

			// we only save if it's not a draft which gets saved in publish function
			// the publish function is triggered by save button or style being added
			if (!draft){

				//console.log('we do save');
				MTsave.ajax_save_settings({
					settings: settings
				});
			}

			else {
				// now scroll to the newly added selector
				TvrUi.scrollIntoView(TvrUi.folders_scrollable_area(), M.selectorM);
			}

			TvrCom.endT(arguments);
			return true;
		},

        // load a single selector by mapping JS object data to template
        load_selector: function(M, config){ TvrCom.startT(arguments);

            var items = [];

            //console.log('data for loading', $.extend(true, {}, M), $.extend(true, {}, config))
			// TvrCom.callStack();

            if (config.items){

            	// if we're reloading the selector, detach code editor so line number and history is preserved
				var $detachedCode = false,
					groupSlug = config.pg_focus ? config.pg_focus : TvrUi.pref.pg_focus,
					extraEditor = MTlayout.editor_and_gui() && groupSlug !== 'code';

				if (config.replaceExisting){

					var Code = this.get_code_meta(M);

					// if the editor already exists
					if (TvrCom.isDomEl(Code.$property_fields)){

						// if we're on the code editor, just remove non-code group and bail
						if (groupSlug === 'code'){
							M.selector.find('.group-tag').not(Code.$group).remove();
							//console.log('we already have it loaded, bail');
							return M.selector;
						}

						// we are on another group, so cache editor
						$detachedCode = Code.$property_fields.detach();

						//console.log('we already have the editor', $detachedCode, Code);
					}
				}

                for (var i = 0; i < config.items.length; i++) {

                    var templateKey = config.items[i],
                        prefix = (templateKey === 'selectorM') ? 'strk' : 'opts',
                        maxDepth = (templateKey === 'selectorM') ? 'selector' : 'property',
                        parentID = '#'+prefix+'-'+M.sectionSlug,
                        id = parentID+'-'+M.selectorSlug,
                        $item = $(id);

                    //console.log('the sel id', id, M, $item, config);

                    // if the item doesn't exist in the dom create from template
                    if (!$item.length || config.replaceExisting){

						/*// Ensure we clean any lingering editor instances
						if (templateKey === 'selector'){
							TvrUi.beforeDOMViewChange();
						}*/

                        // when we load a selector, we only load fields for the current pg and MQ tab
						// When switching pg or MQ tab we fully load the opts selector again
						// This keep the HTML minimal and means code editor changes will show in GUI when clicking pg
						M.groupSlug = groupSlug;

						var loopConfig = {
							M: M,
							load: 'selector',
							templateKey: templateKey,
							maxDepth: maxDepth,
							callbackDepth: ['selector', 'group', 'property']
						};

						//console.log('We do it', groupSlug, id, loopConfig);

						var mq_key = config.mq_key ? config.mq_key : TvrUi.get_mq_focus();

						// if we're loading property options, it's specific to the MQ tab
						if (templateKey === 'selector'){
							if (mq_key === 'all-devices'){
								loopConfig.recurse_key = ['important']; // we can skip mquery recursion
                                loopConfig.mq_key = mq_key;
							} else {
								loopConfig.onlyRecurse = true; // we can skip all devices styles
								loopConfig.mq_key = mq_key;
							}
						}

						// if we're loading the selector menu item, we can skip MQ data
						else if (templateKey === 'selectorM'){
							loopConfig.incRecurse = false;
						}

						// if menu, simply get the item
						if (templateKey === 'selectorM'){
							$item = MTdd.data_to_template(M, loopConfig);
						}

						// If we're loading selector property options
						else if (templateKey === 'selector'){

							// reset store of color pickers etc
							//console.log('Reset #style-components')
							TvrUi.stat.styleComponents.empty(); // was .html('')

							// quick check if data_to_template will be successful
							var absIndex = TvrUi.totalSels,
								selector = MTloop.get_selector_data(M, mq_key).data; //TvrCom.get_js_object_data([M.sectionSlug, M.selectorSlug], mq_key).data;

							if (selector){

                                //console.log('this runs', M.tabSlug, $.extend('loopConfig', {}, loopConfig), $.extend('M', {}, M))

								$item = MTdd.data_to_template(M, loopConfig);
								
								if (selector.abs_index !== undefined){
									absIndex = selector.abs_index;
								}

                                //console.log('the $item', mq_key, TvrUi.get_mq_focus(), $item, $.extend(true, {}, selector));
							}

							// if we try to reload the selector on a tab that has no settings we won't get anything
							else {

								// load from template
								$item = TvrUi.dom_replacements(
									false,
									'selector',
									$(TvrUi.templates['selector']),
									'selector_section',
									M.sectionSlug,
									false,
									'selector_css',
									M.selectorSlug,
									M.selectorH,
									M.selectorCode
								);

							}

							// if the property group had no settings, no fields will have been added
							var $groupObj = $item.find('.group-tag-'+groupSlug),
								$groupDeviceFields = $groupObj.find('div.property-fields-'+mq_key);

							if (!$groupDeviceFields.length){

								MTloop.maybe_add_group_template(
									$item, M.sectionSlug, M.selectorSlug, M.selectorH, M.selectorCode, mq_key, groupSlug
								);

								$groupDeviceFields = $groupObj.find('div.property-fields-'+mq_key);

								// check if 'All Devices' is grid / flex item, if so follow suit by triggering toggle
								if ((groupSlug === 'flexbox' || groupSlug === 'grid')){ //  && mq_key !== 'all-devices'

								    //console.log('we need to ajdust toggles', groupSlug);

									var rootSel = TvrCom.get_js_object_data(
                                            [M.sectionSlug, M.selectorSlug], 'all-devices'
                                        ),
                                        toggleKey = groupSlug === 'flexbox' ? 'flexitem' : 'griditem';

									if (TvrCom.checkObject(rootSel.data, ['pg_'+toggleKey])){
										//TvrUi.input_icon_toggle($groupDeviceFields.find('span.'+toggleKey+'-toggle'), true);

										//console.log('griditem might be set', toggleKey)

                                        var subgroup = (groupSlug === 'flexbox') ? 'flexcontainer' : 'generalgrid';
                                        MTloop.flip_flex_or_grid_item_switch(
                                            $groupDeviceFields,
                                            $groupDeviceFields.find('.subgroup-control-'+subgroup),
                                            rootSel.levels,
                                            toggleKey
                                        );

                                        $groupDeviceFields.add(TvrUi.stat.grid).addClass('show-single-griditem');

                                        // prepare default to pgTab after item has loaded
                                        if (groupSlug === 'grid'){
                                            TvrUi.pref.grid_focus = 'griditems';
                                        }

									}
								}
							}

							// if we're on a css grid, update items [n] values
                            if (groupSlug === 'grid') {

                                var rootSelector = TvrCom.get_js_object_data(
                                        [M.sectionSlug, M.selectorSlug], 'all-devices'
                                    ).data,
                                    nth_focus = TvrUi.get_nth_focus(rootSelector),
                                    $itemInputs = $groupObj
                                        .find('.tab-control-griditems:not(.nth-item-radios):not(.sub-label)')
                                        .find('input.property-input');


                                $itemInputs.each(function () {
                                    var $input = $(this);
                                    $input.attr('name', TvrCom.replace_variable_name_attr($input.attr('name'), nth_focus));
                                });

                                // set the Item: n if not 0 or undefined
                                if (nth_focus){
                                    $groupObj.find('span.grid-item-num').text(': '+nth_focus);
                                }

                                //console.log('we set grid highlight condition here');

                            }

							// if we're loading the editor alongside the GUI fields
							if (extraEditor){
								TvrUi.addOrAttachCodeTextarea($item, M, mq_key, $detachedCode);
							}

							// if the sidebar is layout is active, set dimensions
							if (MTlayout.sidebar_showing()){

								// ensure group has show class for get_sidebar_container() function
								// even though this will be added later
								$groupObj.addClass('show');

								//MTlayout.adjust_preview_margin_for_sidebar(MTlayout.editor_only_left(), false);
							}

							// ensure the selector has the right class to be visible
							$item.addClass('in-focus');

						}

                        //console.log('the item we needed to load', $item, parentID, $(parentID).find('.selector-sub'));

						if (config.replaceExisting){
							$('#'+config.replaceExisting).replaceWith($item);
						} else {
							$(parentID).find('.selector-sub').append($item);
						}

                    }

                    // add to array
                    items[i] = $item;

                }
            }

            //console.log('the load_selector items', items)

            TvrCom.endT(arguments);

            return items.length > 1 ? items : items[0];

        },

		loadOrReloadEditor: function(){

			if (
				TvrUi.codeEditors &&
				!TvrUi.pref.show_code_editor &&
				(TvrUi.pref.pg_focus === 'code' || MTlayout.editor_and_gui()) &&
				!TvrUi.editor_to_gui_running){

				//console.log('We need to load the editor')

				var M = TvrUi.get_selector_in_focus();

				if (M){

					var $item = M.selector,
						mq_key = M.tabSlug,
						$detachedCode = TvrUi.detachCodeTextareaIfLoaded(M);

					//console.log('loadOrReloadEditor', $detachedCode)

					TvrUi.addOrAttachCodeTextarea($item, M, mq_key, $detachedCode);

					MTace.update_adaptable_editor({
						M: M,
						directContent: MTdd.resolve_inline_editor_content(M),
						mode: parseInt(TvrUi.pref.allow_scss) ? 'scss' : 'css'
					});

					// resize the editor after browser has time to calc new CSS width/height
					TvrCom.action_after_timeout('mt_panel_change', 70, {
						item: MTlayout.modify_active_editors,
						args: [{
							resize: true,
							updateHeight: MTlayout.horizontal_only()
						}]
					});

				}
			}

			else {
				//console.log('No need to load the editor', TvrUi.pref.pg_focus, TvrUi.pref.pg_focus === 'code', MTlayout.editor_and_gui(), !TvrUi.editor_to_gui_running)
			}

		},

		detachCodeTextareaIfLoaded: function(M){

			var Code = this.get_code_meta(M);

			return TvrCom.isDomEl(Code.$property_fields)
					? Code.$property_fields.detach()
					: false;
		},

		addOrAttachCodeTextarea: function($item, M, mq_key, $detachedCode){

			// reattach
			if ($detachedCode){
				//console.log('we have the $detachedCode thing', $detachedCode)
				$item.find('.group-tag-code').append($detachedCode);
			}

			// load fresh editor
			else {
				//console.log('we need to add as new', $detachedCode)
				MTloop.maybe_add_group_template(
					$item, M.sectionSlug, M.selectorSlug, M.selectorH, M.selectorCode, mq_key, 'code'
				);
			}


		},

        get_nth_focus: function(rootSelector){

            if (!rootSelector){
                var M = TvrUi.getM();
                rootSelector = TvrUi.uiData[M.sectionSlug][M.selectorSlug];
            }

            var nth_focus = TvrCom.checkObject(rootSelector, ['nth_item']);

            return nth_focus === false ? 1 : parseInt(nth_focus);
        },

        // get meta for current seletcor
        getM: function(){
            return TvrUi.get_meta($('#' + TvrUi.selInFocusID), 'selector');
        },

		// coders may be tempted to add { as part of selector, only use stuff before {
		strip_beyoned_brace: function(userInput){
			if (userInput === undefined){
				return '';
			}
            userInput = userInput.split('{');
			if (userInput[0]){
                userInput = userInput[0];
				return userInput.trim();
			} else {
				return '';
			}
		},

		getOrCreateFolder: function(sectionH, draft){

			// if they are creating their first selector, default to the first folder (General)
			if (TvrUi.totalSels < 1 && sectionH === ''){
				sectionH = TvrUi.default_to_folder();
			}

			var sectionSlug = TvrCom.convert_to_param(sectionH);

			//console.log('getOrCreateFolder', sectionSlug, 'default to: ', TvrUi.default_to_folder(), TvrUi.totalSels, TvrUi.selInFocusID)

			// create folder if it doesn't already exist
			if (!TvrCom.isDomEl($('#strk-'+sectionSlug))){
				var newSectionH = TvrUi.add_section(sectionH, draft);
				if (!newSectionH){
					return false;
				}
				sectionSlug = TvrCom.convert_to_param(newSectionH);

				//console.log('added newSectionH', newSectionH)
			}

			return TvrUi.get_meta($('#strk-'+sectionSlug), 'section');
		},

		/*** modify the selector (CSS and label) ***/
		action_modify_selector: function(M, $clicked, settings, newSectionH, triggeredFromEditor, draft, skipSave){ TvrCom.startT(arguments);

			//console.log('action modify selector')

			// time the total time spent updating the JS data object for this function
			TvrUi.jsDataFunc = 'action_modify_selector';

			// M will be passed for draft/retargeting, but needs to be obtained from content_menu_data with popup form buttons
			M = M || TvrUi.get_meta_for_context($clicked, 'selector', 'folder-popup')

			var	$form = $clicked.closest('.mt-folder-form');

            settings = settings ? settings : {};

            // cache settings that get lost when redefining settings from new baseSettings below
			var switchSelVariation = settings.switchSelVariation;

			//console.log('we modify selector', $form.find('.selector-css-textarea').val(), $form.find(".selector-name-input").val(), $form, settings);

			// get selector values and do checks
			var tmp = TvrUi.selector_checks_values(
				$form.find('.selector-name-input').val(), // $name_field
				// coders may be tempted to add { as part of selector, only use stuff before {
				TvrUi.strip_beyoned_brace( $form.find('.selector-css-textarea').val() ), // code val
				M.selectorSlug,
				newSectionH ? TvrCom.convert_to_param(newSectionH) : M.sectionSlug
			);

			if (!tmp){
				TvrCom.endT(arguments);
				TvrUi.jsDataFunc = false;
				return false;
			}

			//console.log('the tmp', newSectionH, tmp, M.sectionH, $.extend(true, {}, M))

			// get the old name for history
			var orig = M.selectorM.find('.selector-label').val().split('|');
			var oldName = orig[0],
				oldCode = orig[1],
                oldSelSlug = M.selectorSlug,
				codeChanged = oldCode !== tmp['code'];

			// get new names
			var newSelector = tmp['newName'];
			var newSelectorHuman = tmp['newNameHuman'];

			// update all inputs in this selector
			var origSection = M.sectionSlug;
			var $combObjs = M.selectorM.add(M.selector);
			TvrUi.dom_replacements(
			    M,
				'selector',
				$combObjs,
                //$combObjs.add($(MTF.get_style_nodes(M))),
				origSection,
				origSection,
				M.sectionH,
                oldSelSlug,
				newSelector,
				newSelectorHuman,
				tmp['code'],
				undefined,
				undefined,
				true
			);


			// it's possible color picker bound classes could linger,
			// but we want the picker to bind afresh on new input name,
			// remove "bound" - any other state issues? Grid? todo
			$combObjs.find('input.color.bound')
				.removeClass('bound')
				.css('display', '')
					.next('.sp-replacer')
					.remove();

			TvrUi.stat.styleComponents.find('.sp-container').remove();

			// Clear any prepopulated values for the html group - then repopulate
			if (draft && TvrUi.pref.pg_focus === 'html'){
				/*let M = TvrUi.get_meta(TvrUi.get_pg_focus_obj(), 'group');
				let { $text, $snippet_id } = MThtml.getFieldValues(M.groupTab);
				//console.log('Clear any HTML values as we are switching draft', M, TvrUi.pref.pg_focus, draft);
				$text.val('');
				$snippet_id.val('');
				MThtml.maybePrepopulateHTMLFields(M);*/
			}

			// Maybe update Amender mods
			MThtml.maybeUpdateAmenderModKeys(origSection+'-'+oldSelSlug, origSection+'-'+newSelector, 'selector', tmp['code']);

			// ensure keepAsDraft flag is set
			var baseSettings = {
				keepAsDraft: draft,
				skipSave: skipSave, // so cancelling a draft selector or retarget doesn't trigger a save
				switchSelVariation: switchSelVariation
			};

			settings = MTloop.modify_main_js_object('rename', baseSettings, {
				rebuild: true,
				callbackDepth: ['section', 'selector'], // section must also be copied
				maxDepth: 'selector',
				targetDepth: 'selector',
				targetSection: origSection,
				targetSelector: oldSelSlug,
				new_key: newSelector,
				new_label: newSelectorHuman,
				new_code: tmp['code'],
				orig_code: oldCode
			});

			var closeQuickEdit = false;

			// update the global selInFocusID if selector is in focus
			if (TvrUi.is_cur('selector', M.selectorID)){
				TvrUi.update_global_vars( TvrUi.get_meta(M.section.find('li.in-focus'), 'selector'), settings );
			}

			// adjust menu name icon to show/hide custom css styles
			//TvrUi.show_hide_sel_custom(tmp['code'], M.selectorM.find('.selector-name'));

			// i think this updates when necessary (in focus) in update_global_vars() call above
			//TvrUi.curSelCSS = TvrCom.custom_escape_quotes(tmp['code']);

			// reposition overlay unless user has selected a new element
			if (TvrUi.iframeEditing() && !TvrUi.doNotReselectRevertedRetargetSel){
				//console.log('we run the modify re-highlight');
				MTF.reposition_overlays({
					con:'reg'
					//triggerElChanged: 1
				});
			}

            // redefine M with potential new name
            M = TvrUi.get_meta(M.selectorM, 'selector');

			// ensure all resolved selector/xpath values are set
			//console.log('Update all resolved selectors', M.selectorCode)
			/*settings = MTloop.modify_main_js_object('update_resolved_selectors', settings, {
				callbackDepth: ['selector'],
				maxDepth: 'selector',
				M: {
					sectionSlug: M.sectionSlug,
					selectorSlug: M.selectorSlug
				},
				new_code: M.selectorCode,
			});*/

            // run code to update post_sel (also updates selCode in active_events)
            settings = MTloop.modify_main_js_object('group_to_css', settings, {
                M: M,
                maxDepth: 'group',
                recurse_key: ['m_query'], // tells maybe_recurse to not do important
				//justUpdateAST: triggeredFromEditor,
				//no_style_node_update: triggeredFromEditor, // otherwise doing a responsive update doesn't affect other folder nodes
				triggeredFromEditor: triggeredFromEditor, //true,
				selCodeChanged: !codeChanged ? false : {
                	oldCode: oldCode,
					newCode: tmp['code']
				},
				skipSave: skipSave
            });

            //console.log('$clicked, settings, newSectionH', $clicked, settings, newSectionH);

            // update any active ace editors - there should only be one at most, but .each() just in case
			if (!triggeredFromEditor){

				MTace.update_adaptable_editor({
					M: M,
					directContent: MTdd.resolve_inline_editor_content(M),
                    contentShouldChange: true // otherwise it won't update as editor is the same
				});
			}

			// Update the Amender editor if we are on add: css
			let snippetEditor = MTace.eds['snippet-code'];
			if (snippetEditor){

				let currentCode = snippetEditor.getValue(),

					// Single selector old pattern
					pattern = new RegExp('^'+TvrCom.escapeRegExp(oldCode)+'\\s*{([^}]*)}\\s*$'),

					match = currentCode.match(pattern);

				if (match){

					let newSelectorCode = tmp['code']+ ' {'+match[1]+'}',
						$snippet_id = M.selector.find('.mt-snippet-id'),
						snippet_id = $snippet_id.val();

					// For some reason, we have to abort twice here otherwise the editor saves everything prematurely
					MThtml.skipEditorChangeSave = 'twice';

					MThtml.updateSnippetEditor({
						code: newSelectorCode,
						mode: 'css'
					});

					// Flag that snippet has changed
					MThtml.snippetChanged = snippet_id;
					TvrMT.data.dyn.snippets.cache[snippet_id].value = newSelectorCode;
				}

				//console.log('currentCode', {currentCode, pattern, match: currentCode.match(pattern), snippetEditor})

			}

			// Cache the package with the original selector atts, which are the atts in the DB when we commit
			if (TvrUi.retargetSelector && !TvrUi.retargetSelector.initialModifySavePackage){
				TvrUi.retargetSelector.initialModifySavePackage = $.extend(true, [], settings.savePackage);
				//console.log('Added initial modify save package', TvrUi.retargetSelector.initialModifySavePackage);
			} else {
				// use this for the order or the items in the new folder
				TvrUi.retargetSelector.lastModifySavePackage = $.extend(true, [], settings.savePackage);
			}

			// get the index of the possible folder change save package for slicing the array
			// when caching for TvrUi.retargetSelector.initialFolderMoveSavePackage
			var folderMovePackageIndex = settings.savePackage.length;

            // if selector needs to be moved to another folder
            if (newSectionH){

				TvrCom.startT('action_modify_selector new folder');

				// get the current folder M, create a new folder if it doesn't already exist
				var newM = TvrUi.getOrCreateFolder(newSectionH, draft);
				if (!newM){
					TvrCom.endT(arguments);
					return false;
				}

                //console.log('we try to move the selector', newSectionH);

                // ensure both folder's selectors are loaded
                if (!newM.sectionM.find('> .sec-row .folder-icon').hasClass('on')) {
                    TvrUi.open_folder(newM);
                } if (!M.sectionM.find('> .sec-row .folder-icon').hasClass('on')) {
                    TvrUi.open_folder(M);
                }

				TvrCom.startT('action_modify_selector new folder - dom order');

                // redefine M
                M = TvrUi.get_meta($('#'+M.selectorMID), 'selector');

                // get pre-sort order of items
                settings = TvrUi.get_dom_order(settings, M.selectorM, {
                    prevSec: '',
                    newSec:'',
                    orig_order:['this'],
                    new_order:['this'],
                    map:[]
                }, false, true);

				//console.log('the sel changed folder', M.sectionSlug, newM.sectionM);

                // manually move the selector menu item to the end of the new folder
                M.selectorM.detach().appendTo(newM.sectionM.find('ul.selector-sub'));

                // update counts and do dom replacements / mirror
                M = TvrUi.selector_received({}, {
                    item: M.selectorM,
					draftSelectorFolderCreated: 1,
					//elementAlreadySelected: 1,
					doNotUpdateSelectorSuggestions: 1 // maybe use this if elementAlreadySelected not in use
                });

                //console.log('M after sel received', $.extend(true, {}, M))

                // get post sort order of items
                settings = TvrUi.get_dom_order(settings, M.selectorM, TvrUi.menuOrder, true, true);

				TvrCom.endT('action_modify_selector new folder - dom order');

				// cache the package with the original folder location, which matches the DB when we commit
				if (TvrUi.retargetSelector){

					if (!TvrUi.retargetSelector.initialFolderMoveSavePackage){
						TvrUi.retargetSelector.initialFolderMoveSavePackage = settings.savePackage.slice(folderMovePackageIndex);

						//console.log('Added folder move save package', TvrUi.retargetSelector.initialFolderMoveSavePackage);
						//TvrUi.retargetSelector.initialFolderMoveSavePackage = $.extend(true, [], settings.savePackage);
					}

					else {
						// use this for the order or the items in the new folder
						TvrUi.retargetSelector.lastFolderMoveSavePackage = settings.savePackage.slice(folderMovePackageIndex);
					}

				}

				TvrCom.endT('action_modify_selector new folder');


                //console.log('New M', $.extend(true, {}, M));
            }

            if (!switchSelVariation){
            	//console.log('NOT switchSelVariation', $.extend(true, {}, settings));
				TvrUi.close_context_menu({
					filter: '.cm-selector-options'
				});
			} /*else {
				console.log('We are switchSelVariation');
			}*/


            /*if (M.selectorM.find('.edit-selector-form').hasClass('show')) {
				TvrUi.toggle_modify_selector(M.selectorM);
			}*/

            // log for history
            var valTT = '',
				historyAction = TvrLang.selector_modified,
				historyIcon = 'mtif-edit'; // todo

            // show info about what changed
			// use orig selector cached string values if visual re-targeting used with draft interim
			if (TvrUi.retargetSelector && draft){
				oldName = TvrUi.retargetSelector.selectorH;
				oldCode = TvrUi.retargetSelector.selectorCode;
				oldSelSlug = TvrUi.retargetSelector.selectorSlug;
			}

            if (oldName !== newSelectorHuman){
                valTT+= TvrLang.previous_name +': '+oldName+"\n";
                valTT+= TvrLang.new_name +': '+newSelectorHuman;
            }

            if (oldCode !== tmp['code']){
                valTT+= valTT ? "\n" : '';
                valTT+= TvrLang.previous_code +': '+oldCode+"\n";
                valTT+= TvrLang.new_code +': '+tmp['code'];
            }

            // default object for storing the history on
            var historyStoreObject = settings;

            // flag the selector as draft new targeting with original folder, label, code for restoring on UI load
			if (draft){

				if (TvrUi.retargetSelector){

					// add flag if not added already
					if (!TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, M.selectorSlug, 'isDraftRetarget'])){
						MTloop.updateObjectAndSavePackage(settings.savePackage, [{
							action: 'append',
							trail: [M.sectionSlug, M.selectorSlug],
							key: 'isDraftRetarget',
							data: TvrUi.retargetSelector
						}]);
					}

					//console.log('setting the draft flag')

					// store history of selector draft change for using when publishing selector
					historyStoreObject = TvrUi.draft_user_action.retarget;

				}

				// we're changing the atts of a new draft selector
				else {

					// update atts tracker object
					TvrUi.draftSelector.atts = TvrUi.selector_key_atts(M);

					valTT = TvrLang.selector_created+': '+newSelectorHuman;
					historyIcon = 'mtif-add';
					historyAction = TvrLang.selector_created;
					historyStoreObject = TvrUi.draft_user_action.new;

				}

			}

			if (!TvrUi.dontLogSelectorChange){
				MTsave.user_action((draft ? historyStoreObject : settings), {
					'items': ['selector'],
					'val': historyAction,
					'M': M,
					'valTT': valTT,
					'pathTT': true,
					'icon': historyIcon
				});

				//console.log('The selector change', $.extend(true, {}, historyStoreObject))
			}

			// if draft we only save when publishing
			if (!draft && !skipSave){

				//console.log('Saving selector modify')

				// if auto-folders, order the selector to match the order of the dom elements
				// Actually, this was a bit distracting - sels should stay in place once created, even if targeting is changed
				// also it was hopping around in between typing a valid sel in the single selector code editor
				//MTfolder.maybeAutoSortSelector('both', M, settings);

				MTsave.ajax_save_settings({
					settings: settings,

					// if this is changed rapidly, which can happen when code editor is used,
					// we don't want to create too many pending Save packets, by using the same slug we allow the
					// queued data packet to update, rather than add a fresh one to the queue
					timerName: 'modify_selector_'+origSection+'_'+oldSelSlug
				});
			}

			TvrCom.endT(arguments);
			TvrUi.jsDataFunc = false;
			
			return true;
		},
		// unfortunately clone doesn't copy the value of select dropdowns or apply events (e.g. color picker)
		proper_clone: function($origObjs){ TvrCom.startT(arguments);
			var $combObjs = $origObjs.clone(); // doesn't copy events and data (apart from inputs)
			// remove orphaned color picker HTML before binding to copy
			$combObjs.find('div.sp-replacer, div.sp-container').remove();
			$combObjs.find('input.color.bound').removeClass('bound');
			TvrUi.colorpicker_bind($combObjs);

			// remove orphaned ace elements, ready for binding again
			/*$combObjs.find('pre#snippet-code').each(function(){
				var $editor = $(this);
				//$editor.removeClass('ace_editor').empty(); //
				$editor.replaceWith('<pre id="snippet-code" class="snippet-code"></pre>');
			});*/

			TvrCom.endT(arguments)
			return $combObjs;
		},

		// the folder or selector may have the temporary classes/atts,
		// we don't want the copy to have them
		reset_copied_active_classes: function($combObjs){

			$combObjs.each(function(){

				var $item = $(this);
				$item.removeAttr('copy-in-prog')
						.removeClass('in-focus')
					.find('li.in-focus')
						.removeClass('in-focus');
				$item.find('.toggle-folder-more-options')
					.removeClass('on');
			});

			return $combObjs;
		},

		maybe_save_draft_selector_before_action: function(M, level, context){

			if (TvrUi.retargetSelector || TvrUi.draftSelector.atts.id){

				var draftData = TvrUi.retargetSelector || TvrUi.draftSelector.atts,
					save = (level === 'selector' && M.selectorID === draftData.id) ||
							(level === 'section' && M.sectionSlug === draftData.sectionSlug);

				if (save){
					//console.log('we do save the draft selector', M, level, context)
					TvrUi.save_draft_selector(TvrUi.retargetSelector, true);
				}

				/*console.log('the draft selector', save, M, $.extend(true, {}, {
					retarget: TvrUi.retargetSelector,
					draft: TvrUi.draftSelector
				}));*/
			}


		},

		// copy the selector
		copy_selector: function($clicked){

			var M = TvrUi.get_meta_for_context($clicked, 'selector');

			// ensure original selector has loaded
            var $item = TvrUi.load_selector(M, {
                items:['selector']
            });

            // redefine M now that sel has loaded
            M = TvrUi.get_meta($item, 'selector');

            // if it's a draft selector, save it
			TvrUi.maybe_save_draft_selector_before_action(M, 'selector', 'copy');

            var origSelectorSlug = M.selectorSlug,
                origSelectorHuman = M.selectorH,
                newSelectorHuman = TvrCom.resolve_unique_name(M.selectorH, M.sectionM, '.selector-name', 'Copy'),
                newSelectorSlug = TvrCom.convert_to_param(newSelectorHuman),
				$clone = TvrUi.proper_clone( $([M.selectorM[0]]) ); // , M.selector[0]


            var $combObjs = TvrUi.dom_replacements(
                M,
                'selector',
				$clone,
                M.sectionSlug,
                M.sectionSlug,
                origSelectorHuman,
                origSelectorSlug,
                newSelectorSlug,
                newSelectorHuman,
                M.selectorCode
            );

			// clean up
			$combObjs = TvrUi.reset_copied_active_classes($combObjs);

            // add to dom
            M.selectorM.after($combObjs[0]);
            //M.selector.after($combObjs[1]); // do not add this as we load fresh

			// copy the JS object
			var settings = MTloop.modify_main_js_object('copy', {}, {
				M: M,
				targetDepth:'selector',
				maxDepth:'selector',
				origSlug: origSelectorSlug,
				origHuman: origSelectorHuman,
				newSlug: newSelectorSlug,
				newHuman: newSelectorHuman
			});

			// reorder the JS object so copied selector is after the original
			settings = MTloop.reorder_after_copy(settings, M.selectorM, true);

			// update section CSS
			settings = MTloop.modify_main_js_object('update_section_css', settings, {
				M: M,
				maxDepth: 'section',
				callbackDepth: ['section'],
				recurse_key: ['m_query'] // tells maybe_recurse to not do important
			});

            // update count
            TvrUi.update_count( M.sectionM.find('.selector-count-state'), 'add', 1, 'selector', '');

            // update visual controls
            if (TvrCom.hasValue(TvrUi.selInFocusID)){
                TvrUi.update_prev_next_sel_buttons(TvrUi.selInFocusID);
            }

			// navigate to copied selector
			var copiedSelID = '#strk-'+M.sectionSlug+'-'+newSelectorSlug;
			TvrUi.tvr_iterate_selectors_v($(copiedSelID), copiedSelID, {
				action: 'copy',
				doNotBringStylesTop: 1
			});

            // log for history
            settings = MTsave.user_action(settings, {
                'items': ['selector'],
                'val': TvrUi.title($clicked),
                'M': M,
                'pathTT': true,
                'valTT': newSelectorHuman,
                'icon': $clicked.attr('class')
            });

            // save settings
            MTsave.ajax_save_settings({
                settings: settings
            });

		},

		/*** delete selector ***/
		delete_selector: function($clicked, draft){ TvrCom.startT(arguments);

			var M = TvrUi.get_meta_for_context($clicked, 'selector');

			// there is scope for dbl-click during animation so bail if an action is already in progress
			if (MTsave.action_in_prog(M.selectorM, 'delete')
				|| MTsave.action_in_prog(M.selectorM, 'data-load')){
				return false;
			}

			// log action
			MTsave.log_action(M.selectorM, 'delete');


			// close the context menu if open
			TvrUi.close_context_menu({
				filter: '.cm-selector-options'
			});

			M.selectorM.fadeOut('fast', function() {
				TvrUi.action_delete_selector(M, draft, $clicked);
			});

			TvrCom.endT(arguments)
		},

		action_delete_selector: function(M, draft, $clicked){

			var newSelID,
				isFocusSel = TvrCom.hasValue(TvrUi.selInFocusID) && TvrUi.is_cur('selector', M.selectorID);

			// update the selector count
			TvrUi.update_count(M.sectionM.find('.selector-count-state'), 'subtract', 1, 'selector', '');

			// remove the quick edit classes before removing the dom element
			if (isFocusSel) {

				/*if (quickSelectorExpanded){
					TvrUi.close_quick_edit();
				}*/

				// find a selector before removing (fallback to previous as draft selector should be added after current)
				newSelID = TvrUi.itemScan('selector', 'prev', 'getID', M.sectionSlug, M.selectorSlug, {
					incCurrentSection: true
				});

				if (!newSelID){
					newSelID = TvrUi.itemScan('selector', 'next', 'getID', M.sectionSlug, M.selectorSlug, {
						incCurrentSection: true
					});
				}
			}

			// find a selector in before removing
			/*var $newSel = TvrUi.selectorTrackerScan(M.sectionM, 'next', 'selector', M.selectorM);
			if (!TvrCom.isDomEl($newSel)){
				$newSel = TvrUi.selectorTrackerScan(M.sectionM, 'prev', 'selector', M.selectorM);
			}*/

			// remove selector before trying to find another (must come after TvrUi.selectorTrackerScan)
			M.selector.remove();
			M.selectorM.remove();

			// remove the preview style node too (must be before JS delete below)
			//!MTF || MTF.edit_style_nodes(M, 'delete');

			// delete from JS object
			var settings = MTloop.modify_main_js_object('delete', {}, {
				rebuild: true,
				callbackDepth: ['section', 'selector'], // section must also be copied
				maxDepth: 'selector',
				targetDepth: 'selector',
				targetSection: M.sectionSlug,
				targetSelector: M.selectorSlug
			});

			// update section CSS
			//console.log('we update section css')
			settings = MTloop.modify_main_js_object('update_section_css', settings, {
				M: M,
				maxDepth: 'section',
				callbackDepth: ['section'],
				recurse_key: ['m_query'] // tells maybe_recurse to not do important
			});

			// Toolbars may need adjusting
			TvrUi.after_style_options_deleted('selector');

			// update feathers
			settings = TvrUi.js_check_values(settings, M);

			// if it was focus sel, go to alt selector if found, unless it was a draft selector, which returns to last viewed
			if (isFocusSel && newSelID && !draft) {
				TvrUi.tvr_iterate_selectors_v(false, newSelID, {
					doNotBringStylesTop: 1
				});
			}

			// update visual controls if no more selectors
			if (!newSelID){
				TvrUi.update_prev_next_sel_buttons(false);
			}

			// ensure inline ace content doesn't reload if last selector is deleted and then re-targeted
			MTace.ace_sync_details = {};

			// the draft selector never gets saved in DB, so doesn't need to be deleted from DB
			if (!draft){

				// log for history
				settings = MTsave.user_action(settings, {
					'items': ['selector'],
					'val': TvrUi.title($clicked),
					'M': M,
					'pathTT': true,
					'icon': $clicked.attr('class')
				});

				MTsave.ajax_save_settings({
					settings: settings
				});
			}
		},




		// STYLE OPTIONS FUNCTIONS

		/*** remove property group from dom ***/
		remove_property_group: function(M, tabKey){ TvrCom.startT(arguments);

			var $obj = M.group.find('div.property-fields-'+tabKey);
			//var $obj = TvrUi.get_group(M); // get_group uses current key stored in M, not as flexible
			// this will be false sometimes when trying to remove a pg after navigating to a different selector
			if ($obj){
				$obj.remove();
				TvrCom.endT(arguments)
				return true;
			}

			// todo delete from the JS object.

			TvrCom.endT(arguments)
			return false;
		},

		// update accordion
		update_accordion: function($clicked){

			var $parent = $clicked.parent(),
				$acc_wrapper = $parent.closest('.accordion-wrapper'),
				$allOtherHeadings = $acc_wrapper.find('.accordion-heading').not($clicked),
				isCompCSSAcc = $parent.hasClass('property-menu');

			// close other panels
			$allOtherHeadings.removeClass('expanded');

			// if comp css accordion, refresh the CSS
			if (isCompCSSAcc){

				TvrUi.pgInFocusWiz = $parent.attr('id').replace('comp-', '');

				//console.log('we should now update', TvrUi.pgInFocusWiz, TvrCom.isDomEl(MTF.triggerEl))

				if (TvrCom.isDomEl(MTF.triggerEl)){
					MTF.getAndUpdateCompStyles(true, true, undefined, 'obj');
				}
			}


		},

		// expandable panels to replace accordion system, simpler, no auto-closing
		// use for comp CSS, settings panel, CSS reference
		// - use CSS selector .heading.expanded-panel + .expandable-panel
		toggle_expandable_panel: function($clicked){

			var action = 'open',
				panelName = $clicked.attr('rel'),
				arr = TvrUi.pref.layout.right.expanded_settings;

			// sometimes the panel might be an accordion
			if ($clicked.hasClass('accordion-heading')){
				TvrUi.update_accordion($clicked);
			}

			// open / close
			if ($clicked.hasClass('expanded')){
				$clicked.removeClass('expanded');
				action = 'close';
			} else {
				$clicked.addClass('expanded');
			}

			var existingItemIndex = TvrCom.in_array(panelName, arr);

			// add to array
			if (action === 'open'){
				if (existingItemIndex === false){
					arr.push(panelName);
				}
			}

			// or remove from array
			else {
				arr.splice(existingItemIndex, 1);
			}

			// save the new config for next page load
			MTlayout.save_layout_preferences();
		},

		trigger_pg_icon_click: function(pg_focus){

			//var selector = M ? M.selector : $('#'+TvrUi.selInFocusID);
			pg_focus = pg_focus ? pg_focus : TvrUi.pref.pg_focus;

			// prevent unnecessary data packets being added to ajax queue
			TvrUi.dontSavePgFocus = true;

			/*TvrUi.stat.css_icons.find('ul.styling-option-icons')
				.find('.pg-icon-'+pg_focus)
				.trigger('click');*/

			// the trigger('click') above was closing the program view menu when toggling sidebar options
			// not sure if there was a good reason for trigger() so may need to find another solution
			TvrUi.pg_icon_pressed(
				TvrUi.stat.css_icons.find('ul.styling-option-icons').find('.pg-icon-wrap-'+pg_focus)
			);

			// allow pg_focus to be saved again
			TvrUi.dontSavePgFocus = false;
		},

		// User has clicked a PG or MQ, or switched selector
		beforeDOMViewChange(){

			//console.log('beforeDOMViewChange cleaned up references')
			//console.trace();

			// ACE and tinyMCE cleanup
			MThtml.destroyStaleSnippetEditor();

			MThtml.tinymce.unbind();

			// Timer cleanup (high risk longer timers that may have invalid references when changing view)
			TvrUi.cleanTimers();
		},

		cleanTimers(){
			TvrCom.cancel_timers([
				'html_mod_updated',
				'refreshCompAfterDomChange',
				'load_snippet',
				'tinymce_timer_listen',
				'reset_slider_to_computed',
				'tab_switch_deferred',
				'screen_width_adjusted',
				'tinymce_timer_comp_refresh',
			]);
		},



		/*** property group icon is clicked ***/
		pg_icon_pressed: function($clicked, dontLoadSelector, config){ TvrCom.startT(arguments);

			//console.log('The pg_icon_pressed', dontLoadSelector, config);
			//console.trace();

			/*if (!dontLoadSelector){
				MThtml.destroyStaleSnippetEditor();
				MThtml.tinymce.unbind();
			}*/

			// bail if no selector
			var $selector = $('#'+TvrUi.selInFocusID);
			if (!TvrCom.isDomEl($selector)){
				return false;
			}

			// get tab context
			$clicked = $clicked.closest('.pg-icon-wrap');
			var tabFocus = TvrUi.get_mq_focus(),
				pgKey = $clicked.attr('rel'),
				M = TvrUi.get_meta($selector, 'selector');

			// Microthemer addon
			if (pgKey === 'microthemer-addon'){
				MThtml.showInstallPopup('.microthemer-addon-content', "Install Microthemer addon (free)");
				return false;
			}

			// If Amender addon, show install prompt if not installed yet
			if (pgKey === 'html'){
				if (!TvrMT.data.dyn.ui_config.supportContent){
					MThtml.showInstallPopup('.amender-addon', "Install Amender addon");
					return false;
				}
				//console.log('TvrMT.data.dyn.ui_config.supportContent', TvrMT.data.dyn.ui_config.supportContent)
			}


			// save the last viewed pg icon for next page load
			TvrUi.pref.pg_focus = pgKey;



			//console.log('the vars', M, dontLoadSelector, tabFocus, pgKey, $clicked)

			// ensure selector is loaded and add pg fields if loading selector doesn't do this
			M = TvrUi.ensure_selector_and_pg_loaded(M, dontLoadSelector, tabFocus, pgKey);

			// update pg icon
			var $fields = M.selector.find('.styling-options');
			var field = '.group-tag';
			var $tabs = TvrUi.stat.css_icons.find('.styling-option-icons');
			var tab = '.pg-icon-wrap';
			var input = '.pg-focus';
			var itemKey = pgKey;
			TvrUi.update_tab($fields, field, $tabs, itemKey, tab, input);

			// with CSS grid, we need to update pgTab blue dots
            if (pgKey === 'html' || pgKey === 'grid' || pgKey === 'transform'){
                TvrUi.js_check_values({}, M);
            }

			// update all pg field widths, comp css, and UI height
			// note must come after toolbar_adjusted for ACE editor height to be correct
			TvrUi.after_tab_switch(M, config);

            // there may be less room for the editor
            if (MTlayout.editor_and_gui()){
				MTlayout.maybe_adjust_side_options();
            }

			// delay expensive actions so browser switches tab instantly
			TvrCom.action_after_timeout('pg_expensive', 3, {
				item: function(M){

					// update the comp css for the group
					if (TvrUi.iframeEditing()){

						// iframe triggers this function on .load() so no mind if it isn't available
						MTF.get_computed_styles({
							data: TvrUi.curSelCSS,
							con:'str',
							M: M
						});
					}

					TvrUi.refresh_comp_css();

				},
				args: [M]
			});

			// store last viewed group
			//console.log('save the pg_focus', pgKey, TvrUi.dontSavePgFocus);
			if (!TvrUi.dontSavePgFocus){
				MTsave.simple_ajax_request({
					type: 'GET',
					url: TvrUi.ajaxUrl+'&pg_focus='+pgKey
				});
				//$.get(TvrUi.ajaxUrl+'&pg_focus='+pgKey, function() {});
			}


			TvrCom.endT(arguments)
		},

		// ensure selector is loaded and add pg fields if loading selector doesn't do this
		ensure_selector_and_pg_loaded: function(M, dontLoadSelector, tabFocus, pgFocus){

			//console.log('ensure_selector_and_pg_loaded', M, dontLoadSelector, tabFocus, pgFocus);
			//console.trace();


			// reload the selector - dontLoadSelector is only passed for performance when we know 100% it is already loaded
			if (!dontLoadSelector){

				/*// Clean up any lingering Snippet Editor references to free up memory
				TvrUi.beforeDOMViewChange();*/

				var $reloadedSel = TvrUi.load_selector(M, {
					items:['selector'],
					replaceExisting: M.selectorID,
					mq_key: tabFocus
				});

				//console.log('We reloaded the selector', $reloadedSel)

				// ensure the selector has the right class to be visible
				$reloadedSel.addClass('in-focus');
			}

			// set group level M (even though group field may not be present yet)
			//M = TvrUi.get_meta(TvrUi.get_pg_focus_obj(pgFocus), 'group');

			// add fields if they don't already exist (because they had no values)
			/*if ( !TvrUi.get_group(M) ) {
				TvrUi.add_property_group(M.group, tabFocus);
			}*/



			//console.log('the thing loaded', $reloadedSel, pgFocus, TvrUi.get_pg_focus_obj(pgFocus))

			return TvrUi.get_meta(TvrUi.get_pg_focus_obj(pgFocus), 'group');
		},

		// clear fields at a given level
		clear_data_level: function($clicked, M){ TvrCom.startT(arguments);

			var $fields,
				level = $clicked.attr('data-input-level'),
                isPgTab = level === 'pgtab',

                // just get group level if property group tab (e.g. for grid)
				metaLevel = isPgTab ? 'group' : level;

			// M will be passed in for css grid because grid is not part of style options
			if (!M){

				if (level === 'tab'){
					let $selector = $('#'+TvrUi.selInFocusID);
					if (TvrCom.isDomEl($selector, true)){
						M = TvrUi.get_meta($selector, 'selector')
					}
				} else {
					M = TvrUi.get_meta_for_context($clicked, metaLevel)
				}

				if (!M){
					return;
				}
			}

			//console.log('the M to clear', M);

            var settings = {
                    M: M,
                    clear: {},
                    clean: {}
                },

                // keys for clearing
                selKeys = [M.selectorSlug],
                selConfigKeys = ['styles', 'pie', 'pg_chained', 'pg_flexitem', 'pg_griditem', 'ast'],
                secClearKeys = [selKeys, selConfigKeys];

			// todo it's possible for blank section keys to be present for important/m_query
            /*
            Could try this:
            settings.clear.root = [false, false, selConfigKeys];
            But this fails to update the main object, parent[key] issue probably. Didn't fully investiage
            But rebuild_main_js system could be the solution.
            Or, clean all blank keys when MT first loads, to prevent empty keys building up.
            */

			// get fields and set clear js settings
            switch(level) {
                case 'section':
                    $fields = M.section.find('div.property-tag');
                    settings.clear.section = [false, selConfigKeys];

					// warn against clearing a folder that contains selectors ('this' will be there even if empty)
					if (TvrCom.obj_length(TvrUi.uiData[M.sectionSlug], { exclKey: 'this'}) > 0) {
						var r = confirm(tvrsprintf(TvrLang.clear_folder_confirm, M.sectionH));
						if (!r) {
							return false;
						}
					}

                    break;
                case 'selector':

                	TvrUi.maybe_save_draft_selector_before_action(M, 'selector', 'clear');

                    $fields = M.selector.find('div.property-tag');
                    /*var $pie_toggle = M.selectorM.find('.pie-toggle');
                    if ($pie_toggle.hasClass('active')){
                        TvrUi.input_icon_toggle($pie_toggle, true, true);
                    }*/
                    //settings.clear.section = secClearKeys;
                    settings.clear.selector = [selConfigKeys];
                    break;
                case 'tab':
                    var tabKey = M.tabSlug; //$clicked.closest('span.mq-tab').attr('rel');
                    $fields = M.selector.find('div.property-fields-'+tabKey).find('div.property-tag');
                    settings.mq_key = tabKey;
                    settings.onlyRecurse = (tabKey !== 'all-devices');
                    //settings.clear.section = secClearKeys;
                    settings.clear.selector = [selConfigKeys];
                    break;
                case 'group':
                case 'pgtab':
                case 'subgroup':

                    // common loop config stuff
                	settings.mq_key = M.tabSlug;

                    // if it's all devices, we only want to clear important
                    if (settings.mq_key === 'all-devices'){
                        settings.recurse_key = ['important'];
                    }

                    // if it's am MQ, we can skip non_recursive sections
                    else {
                        settings.onlyRecurse = true;
                    }

                    // base clear config
                    settings.clear.selector = [
                        ['styles'],
                        [M.groupSlug]
                    ];

                    // whole group clear action (just for flexbox and CSS grid)
					if (level === 'group' || M.groupSlug === 'flexbox'){
                        $fields = TvrUi.get_group(M).find('div.property-tag')
                        //console.log('clear everything', level, M.groupSlug)
					}

					// group tab or subgroup clear action
					else {

                        var isTabOrSub = level === 'pgtab' || level === 'subgroup',
                            tabGroup = isPgTab ? $clicked.data('tab-group') : false,
                            propsArray = isPgTab
                                ? Object.keys(TvrMT.data.prog.pg_tab_props[M.groupSlug][tabGroup])
                                : TvrMT.data.prog.subGroupKeys[M.subgroupSlug];

                        // get subset of fields
                        $fields = TvrUi.get_subgroup_or_tabgroup(M, false, tabGroup);

                        // define subset of clear keys
                        settings.clear.selector.push(propsArray);

                        // limit clear to values[index] if fields are in array format
						TvrUi.maybe_add_nth_index_filter(isPgTab, tabGroup, M, $clicked, settings.clear.selector);

                        /*var $nextInput = isPgTab
                            ? M.group.find('.property-tag.tab-control-'+tabGroup).first().find('input.property-input')
                            : $clicked
                                .closest('.subgroup-tag')
                                .next('.property-tag')
                                .find('input.property-input'),
                            index = TvrCom.isDomEl($nextInput)
                                ? TvrCom.get_name_attr_index($nextInput.attr('name'))
                                : false;

                        if (index !== false){
                            settings.clear.selector.push(['value'], [index]);
                            //console.log('index', index, settings.clear.selector)
                        }*/

                        //console.log('clear a subset', level, M.groupSlug)

					}

                    // normalise level (I think just for history)
					if (level === 'pgtab'){
						level = 'group';
					}

                    //console.log('the clear stuff', level, M, $fields, propsArray, settings.clear.selector)

                    break;
            }

            // clear the dom fields
            TvrUi.clear_fields($fields, $clicked, level, M, settings);

            // run clear on JS obj, which set keys to '' but doesn't remove them so group CSS can remove styles
            settings = MTloop.modify_main_js_object('clear', settings, {
                maxDepth: 'selector',

				// don't update save package because clean will send the same data, but without redundant keys
                // otherwise whole folder could be sent twice
                dontUpdateSavePackage: true

            }); // $.extend(true, {}, settings, modify_config)

			// convert data to ast/css -
            // could have optimisation for this above group level - manual style node remove/css update
			/*settings.maxDepth = 'group';
            settings.modify_config = {};*/
            settings = MTloop.modify_main_js_object('group_to_css', settings, {
                maxDepth: 'group',
                recurse_key: ['m_query'] // tells maybe_recurse to not do important
            });
            //settings = MTloop.js_data_to_css(settings);

			// now we can clean the empty keys
            settings = MTloop.modify_main_js_object('clean', settings, {
                maxDepth: 'selector',
                clean: settings.clear // clean same config that was cleared
            });

            /*modify_config.modify_action = 'clean';
            modify_config.clean = $.extend(true, {}, modify_config.clear);
            modify_config.clear = false;
            settings = MTloop.modify_main_js_object($.extend(true, {}, settings, modify_config));*/

			// update blue dots
            settings = TvrUi.js_check_values(settings, M);

			// if the editor is showing, update
			if (MTlayout.editor_and_gui()){
				MTace.gui_to_editor(false, M);
			}

            // log history
            settings = MTsave.user_action(settings, {
                'items': [level],
                'val': TvrUi.title($clicked),
                'M': M,
				'pathTT': true, // level === 'section',
                'icon': $clicked.attr('class') // [ {'icon': $clicked.attr('class')}]
            });

            // don't let post_edit save overwrite this action
            MTsave.ajax_save_settings({
				settings: settings
			});

            //console.log('the clear data', TvrUi.uiData);

			TvrCom.endT(arguments)
		},

		// clear the input fields and save
		clear_fields: function($fields, $clicked, level, M, config){ TvrCom.startT(arguments);

			let snippet_id = '';

			$fields.each(function(){

				var $this = $(this),
					$subGroup = $this.prev('.subgroup-tag'),
					$input = $this.find('input.property-input, input.mt-supplementary-picker, textarea.property-input'),
					$impToggle = $this.find('span.important-toggle'),
                    hasVariableLine = $this.hasClass('has-variable-line');

				//console.log('clear field', $input)

				// get the snippet id before clearing it
				if ($input.hasClass('mt-snippet-id')){
					snippet_id = $input.val();
				}

				// clear inputs
				$input.val('');

				// Clear the code editor
				if ($input.hasClass('snippet-textarea')){

					//console.log('Clear the snippet textarea')

					// Clear code editor if available
					MThtml.updateSnippetEditor({
						code: '',
						mode: MThtml.getModeFromAspect(MThtml.getAspect($input.next('pre')))
					});

					// Clear TinyMCE if available
					if (MThtml.tinymce.available()){
						MThtml.tinymce.update('', true, true);
					}

					MThtml.uiFieldAdjusted(TvrUi.get_meta($input, 'property'), $input);

					/*if (snippet_id){
						MThtml.deleteSnippet(snippet_id);
					}*/
					//console.log('the snippet was cleared', $input, TvrUi.get_meta($input, 'property'))
				}



				// remove variable inputs apart from the first
				if (hasVariableLine){
                    $this.find('.tvr-input-wrap:not(:first-child)').remove()
                }

				// exception for color fields
				if ($input.hasClass('color')){
					TvrUi.clear_spectrum_inputs(TvrUi.get_meta($this, 'property'), false);
				}

                // exception event target - hide dependant fields
                if ($input.hasClass('mt-event-input')){
                    TvrUi.adjust_event_fields($input);
                }

				// exception code editor
				if (TvrUi.pref.pg_focus !== 'html'
					&& $input.hasClass('tvr-editor-hidden')
					&& TvrUi.is_cur('selector', M.selectorID)
				){

                	var $editor = TvrUi.stat.adaptableEditor,
						editor = MTace.eds[$editor.attr('id')];

                	// if ace is bound to pre, clear ace too
					if ($editor.hasClass('ace_editor') && editor){
						// reset editor content
						MTace.set_editor_content($editor, editor, { M: M });
					}
				}

				TvrUi.post_edit($input);

				// remove important
				if ($impToggle.hasClass('active')){
					TvrUi.input_icon_toggle($impToggle, true, true);
				}

				// remove any chain icons
				if (TvrCom.isDomEl($subGroup) ){
					var $chainToggle = $subGroup.find('.chained-toggle');
					if ($chainToggle.hasClass('active')){
						TvrUi.input_icon_toggle($chainToggle, true, true); // just to prevent history log and save
					}
				}

			});

			if (M.groupTab){
				M.groupTab.find('.snippet-header-item').removeClass('show');
				M.groupTab.find('.snippet-name-input').val('');
			}

			TvrCom.endT(arguments)
		},

		getReportingStatus: function(manual){
			let max      		  = TvrMT.data.dyn.ui_config.reporting.max,
				reporting         = TvrUi.pref.reporting,
				permission        = reporting['permission'],
				filePermission    = permission['file'],
				dataPermission    = permission['data'],
				contactPermission    = permission['contact'],
				disallowed        = !manual && !filePermission && !dataPermission,
				fileQuotaReached = !manual && parseInt(reporting['file']['sends_today']) >= parseInt(max.fileSends),
				dataQuotaReached = !manual && parseInt(reporting['data']['sends_today']) >= parseInt(max.dataSends),
				allQuotaReached  = fileQuotaReached && dataQuotaReached;

			//console.log('The comparison', dataQuotaReached, parseInt(reporting['data']['sends_today']), parseInt(max.dataSends), max)

			return {
				max: max,
				filePermission: filePermission,
				dataPermission: dataPermission,
				contactPermission: contactPermission,
				disallowed: disallowed,
				fileQuotaReached: fileQuotaReached ? 1 : 0,
				dataQuotaReached: dataQuotaReached ? 1 : 0,
				allQuotaReached: allQuotaReached ? 1 : 0,
				reporting: reporting
			}
		},

		strip_domain_names: function(str){
			return !str ? '' : str.replace(/(https?:)?\/\/[^\/]+/g, '');
		},

		toggle_preview_error_report: function(){

			let $clicked = $('#toggle-preview-report-data'),
				$preview = $('#data-send-preview'),
				clazz = 'show-data-preview';

			// turn off
			if ($clicked.hasClass('on')){
				$preview.removeClass(clazz);
				$clicked.removeClass('on');
			}

			// turn on
			else {
				$preview.addClass(clazz);
				$clicked.addClass('on');
				TvrUi.update_error_report_preview();
			}

		},

		update_error_report_preview: function(){

			//let $toggle = $('#data-send-preview').find('.report-data-dump');


			if (TvrUi.stat.tvr.hasClass('error_reporting_disabled')){
				$('#data-send-preview').find('pre').text("No data will be sent.");
				return false;
			}


			TvrUi.maybe_send_error_report(true, $('#data-send-preview').find('.report-data-dump'), {
				URL: "http://localhost:8080/microthemer/wordpress/wp-content/plugins/microthemer/js/page/frontend.js?v=7.2.3.8&ver=6.2.2",
				line: 635,
				col: 7,
				file: "frontend.js",
				source: "Site frontend",
				error: "Uncaught ReferenceError: cons is not defined",
				error_key : "frontend.js|635|7|Uncaught ReferenceError: cons is not defined",
				stack: "ReferenceError: cons is not defined\n" +
					"    at Object.init_front (/microthemer/wordpress/wp-content/plugins/microthemer/js/page/frontend.js?v=7.2.3.8&ver=6.2.2:635:7)\n" +
					"    at mt_frontend_setup_vars_and_init (/microthemer/wordpress/wp-content/plugins/microthemer/js/page/frontend.js?v=7.2.3.8&ver=6.2.2:7123:10)"
			}, true);

		},

		// Paste error keys here if I can't replicate an error and need data

		maybe_send_error_report: function(manual, $clicked, autoErr, preview, aiFeedback){

			/*if (!manual && !preview){ // && !TvrUi.edge_mode
				//console.log('do not do auto report, as edge mode is inactive');
				return false;
			}*/

			// maybe warn about permissions if checkboxes are not ticked
			if (manual){

				if (TvrUi.stat.tvr.hasClass('error_reporting_disabled')){
					alert('Please enable one or more error reporting options to give us permission to send data');
					return false;
				}

				$clicked
					.removeClass('mt-error-response mt-success-response')
					.addClass('active');
			}

			// check error reporting status
			let status = TvrUi.getReportingStatus(manual);

			// bail if error reporting conditions not right
			if (status.disallowed || (!aiFeedback && status.allQuotaReached)){
				//console.log('Error reporting not allowed or quota reached', status);
				return false;
			}

			//console.log('autoErr', autoErr, arguments, new RegExp(TvrUi.browser+'\\/([\\d.]+)', 'i'));

			// minimum data
			let errorStore = preview || aiFeedback
					? [autoErr]
					: (TvrUi.reportedJSErrors.length
						? TvrUi.reportedJSErrors
						: (TvrUi.prevJSerrors.length
							? TvrUi.prevJSerrors
							: TvrUi.JSerrors)),
				vendor = null,
				vendorType = null,
				vendorMatch = autoErr
					? autoErr.URL.match(/wp-content\/(plugins|theme)\/([^/]+)/)
					: null;

			if (vendorMatch){
				vendorType = vendorMatch[1];
				vendor = vendorMatch[2];
			}

			// Get the error parts
			let firstError = errorStore.length ? errorStore[0] : null,
				error_message = firstError ? firstError.error : null,
				error_stack = firstError ? firstError.stack : null,
				error_key = firstError ? firstError.error_key : null;

			// If we get "Script error", there will be no file to report, so skip that
			if (!manual && !aiFeedback && firstError && !firstError.URL){
				return false;
			}

			let	userAgent = window.navigator.userAgent,
				opMatch = userAgent.match(/(Windows|Android|Linux|iPhone|iPad|iPod|Mac|UNIX|Googlebot|MSNBot)/),
				versionMatch = userAgent.match( new RegExp(TvrUi.browser+'\\/([\\d.]+)', 'i')),
				browserVersion = versionMatch ? versionMatch[1] : null,
				op = opMatch ? opMatch[1] : null,
				sendData = {
					manual: manual ? 1 : 0,
					domain: location.host,
					context: {
						browser: TvrUi.browser,
						browserVersion: browserVersion,
						op: op,
						userAgent: userAgent
					},
					error_message: error_message,
					error_stack: error_stack,
					error_key: error_key,
					vendor: vendor,
					vendor_type: vendorType,
					preview: preview ? 1 : 0
				}

			// increment file stat if not reached
			if (!aiFeedback && !preview && !status.fileQuotaReached){
				++status.reporting.file.sends_today;
			}

			// add data if permitted
			if (!aiFeedback &&
				status.dataPermission &&
				!status.dataQuotaReached &&
				// don't send data routinely even if permission is set
				(manual || TvrMT.data.dyn.ui_config.errorsRequiringData[error_key]) &&
				(!autoErr || TvrUi.isMTerror(autoErr.URL))){

				//console.log('We do add data');

				// this could be done in a loop like PHP script so SOME data is sent
				let dataTypes = ['options_live', 'preferences'],
					totalSize = 0,
					maxBytes = status.max[(manual ? 'manual' : 'auto')].bytes;

				for (let i = 0; i < dataTypes.length; i++) {

					let dataType = dataTypes[i],
						serialisedData = dataType === 'options_live'
							? MTsave.serialiseJsObject(TvrUi.uiData)
							: MTsave.serialiseJsObject(
								TvrUi.download_preferences(true, true)
							),
						dataSize = serialisedData.length;

					totalSize+= dataSize;

					// bail if data size is too big
					if (maxBytes && totalSize > maxBytes){
						//console.log('Data size is bigger than max', dataSize+ ' (max '+maxBytes+')');
						break;
					}

					//console.log('We send add the bigger data', dataType, serialisedData);

					sendData[dataType] = serialisedData;
				}

				// increment data stat if not reached
				if (!aiFeedback && !preview &&!status.dataQuotaReached){
					++status.reporting.data.sends_today;
				}
			}


			// Collect AI prompt, context, and response
			if (aiFeedback){
				
				/*let messages = MTai.chatMessages,
					prompt = messages[(messages.length-2)],
					promptText = prompt ? prompt.message : null;*/

				let M = TvrUi.get_selector_in_focus();
				
				sendData.isAIFeedback = 1;
				sendData.options_live =  MTsave.serialiseJsObject({
					vote: aiFeedback,
					//prompt: promptText,
					conversation: MTai.chatMessages,
					previousPayload: MTai.previousPayload,

					// sometimes the import might not work well, this should reveal the issue
					currentSelector: M ? MTloop.get_selector_data(M, M.tabSlug).data : null
				});
			}

			// General error reporting
			else {
				// send the status so quota can be checked
				sendData.status = status;

				// send the stats with the request, for me to check things are working
				sendData.reporting = status.reporting;
			}

			//console.log('We send the data', sendData);

			// Send data to the server
			MTsave.simple_ajax_request({
				url: TvrUi.ajaxUrl+'&send_error_report=1',
				type: 'POST',
				dataType: 'json',
				sendData: sendData,
				cbFunction: function(response, manual, $clicked){

					//console.log('the sent/response', sendData, response);

					if (manual){

						let status = response.success ? 'mt-success-response' : 'mt-error-response';

						$clicked
							.removeClass('active')
							.addClass(status);

						if (preview){
							$('#data-send-preview').find('pre').text(response.response);
						}

						/*if (!response.html){
							//MTsave.log(MTsave.extract_status($(response.html)));
							//TvrUi.close_dialog();
						}*/

					}
				},
				cbfArgs: [manual, $clicked]
			});

			// reset accumulated errors now they've been sent
			if (!preview && !aiFeedback){
				TvrUi.reportedJSErrors = [];
			}


		},

		external_video_clicked: function($clicked, e){

			let $container = $clicked.closest('.mt-video-thumbs'),
				$thumb = $clicked.closest('.external-video-thumb'),
				slug = $thumb.data('slug'),
				clazz,
				changeLastViewVideo = true;

			// ensure watched is defined - empty array can get stripped from preferences
			if (!TvrUi.pref.external_videos.last_viewed){
				TvrUi.pref.external_videos.last_viewed = {};
			} if (!TvrUi.pref.external_videos.watched){
				TvrUi.pref.external_videos.watched = {};
			}

			if ($clicked.hasClass('external-video-watched-toggle')){

				clazz = 'mt-watched-video';

				let turnOn = !$thumb.hasClass(clazz),
					newTip = turnOn ? $clicked.data('neg') : $clicked.data('pos');

				if (turnOn){
					$thumb.addClass(clazz);
					TvrUi.pref.external_videos.watched[slug] = 1;
				} else {
					e.preventDefault();
					$thumb.removeClass(clazz);
					delete TvrUi.pref.external_videos.watched[slug];
					changeLastViewVideo = false;
				}

				// Dynamically update the tooltip
				TvrUi.refresh_tt($clicked, newTip);
			}

			// just
			if (changeLastViewVideo){
				clazz = 'mt-last-viewed-video';
				$container.find('a').removeClass(clazz);
				$thumb.addClass(clazz);
				TvrUi.pref.external_videos.last_viewed = $thumb.data('slug');
			}

			// save new state
			MTsave.save_multiple_preferences({
				external_videos: TvrUi.pref.external_videos
			});

		},

		// when sending error reports, we can skip some large preference collections e.g. sug values
		largeExportable: {
			my_props: 1,
			layout: 1
		},
		download_preferences: function(returnDataOnly, ignoreLargeExportable) {

			let exportableKeys = TvrMT.data.prog.exportable_preferences,
				preferences = {};

			for (let i = 0; i < exportableKeys.length; i++) {
				let key = exportableKeys[i];

				if (!ignoreLargeExportable || !TvrUi.largeExportable[key]){
					preferences[key] = TvrUi.pref[key];
				}
			}

			if (returnDataOnly){
				return preferences;
			}

			//console.log('We download the preferences', preferences);

			TvrCom.downloadObjectAsJson('microthemer-preferences', preferences);
		},

		/*** css tab/mq tab/property group icon is clicked ***/
		update_tab: function($fields, field, $tabs, tabKey, tab, input, skipFields){ TvrCom.startT(arguments);

			var $tab = $tabs.find(tab+'-'+tabKey);

			//console.log('Running update_tab', tabKey, $tab, $fields, field, $tabs, tab+'-'+tabKey);
			//console.trace();

			// update tab classes and focus
			$tabs.find(tab).removeClass('active').end().find(input).val(tabKey);
			$tab.addClass('active');

			// update which fields should show
			if ( !skipFields ){

				// hide other fields
				$fields.find(field+'.show').removeClass('show');

				var $field = $fields.find(field+'-'+tabKey);
				$field.addClass('show');

				//console.log('$fields', $fields, field, $field, $tabs, tabKey, tab, input, skipFields)

				// if Media query tab, we need to turn off other MQ fields, leaving just the MQ in focus
				if (tab === '.mq-tab') {
					$fields.addClass('show');
				}

				// if pg_icon, we need to turn off other MQ fields, leaving just the MQ in focus
				if (tab === '.pg-icon-wrap') {
					var $all_fields = $fields.find(field+'-'+tabKey);
					$all_fields.find('.property-fields').removeClass('show')
						.end().find('.property-fields-'+TvrUi.get_mq_focus()).addClass('show');
				}


				//console.log('tab', tab)
			}



			TvrCom.endT(arguments)
		},

		/*** mq tab is clicked ***/
		mq_tab_pressed: function($clicked, dontLoadSelector, sliderVal, skipBuilderSync){ TvrCom.startT(arguments);

			TvrUi.rulerManuallyAdjusted = false;

			// only do fields if selector is being edited
			var skipFields = true,
				$fields,
				field = '',
				tabKey = $clicked.attr('rel'),
				$tabs = TvrUi.stat.res.find('.query-tabs'),
				tab = '.mq-tab',
				input = '.device-focus';
				//syncedBuilderDeviceAvailable = MTint.check_synced_page_builder_responsive_views(tabKey);

			// with Gutenberg, we should flag when it's a custom breakpoint so we can have the same vertical margin as synced
			// breakpoints. It would also be good to update the device icon, but that may not be 100% necessary
			/*if (TvrMT.integrate.gutenberg){
				let $body = TvrMT.integrate.gutenberg.stat.$body;
				console.log('syncedBuilderDeviceAvailable', syncedBuilderDeviceAvailable, $body);
				if (syncedBuilderDeviceAvailable){
					$body.removeClass('microthemer-custom-breakpoint');
				} else {
					$body.addClass('microthemer-custom-breakpoint');
				}
			}*/

			// check for page builder synced responsive views
			let prevTabNotSynced = MTint.get('gutenberg').prevTabNotSynced;
			//console.log('prevTabNotSynced', tabKey, MTint.get('gutenberg').prevTabNotSynced);
			if (!skipBuilderSync && MTint.check_synced_page_builder_responsive_views(tabKey) && !prevTabNotSynced){

				// the page builder function will trigger run this func when ready with skipBuilderSync=true
                //console.log('bailing as builder will trigger', tabKey);
				return false;
			}

            //console.log('Debug mq_tab_pressed', $clicked, dontLoadSelector, sliderVal, skipBuilderSync);

			//console.trace();

			// save the active MQ tab
			TvrUi.pref.mq_device_focus = tabKey;

			MTsave.simple_ajax_request({
				type: 'GET',
				// always default to the "All Devices" key if editing in Gutenberg
				// because Gutenberg defaults to the Desktop view, and it creates janky loading if we switch between them
				// Also not sure when Gutenberg forces the switch to desktop, even if we were OK with jankiness
				url: TvrUi.ajaxUrl+'&mq_device_focus='+(TvrMT.integrate.gutenberg ? 'all-devices' : tabKey)
			});
			//$.get(TvrUi.ajaxUrl+'&mq_device_focus='+tabKey, function() {});

			var selsExist = TvrCom.hasValue(TvrUi.selInFocusID);

			// if sel, do fields
			if (selsExist){

				// get meta after tab update so tabKey is correct
				var $group = TvrUi.get_pg_focus_obj(); // todo - this could be false when triggered by liveUpdateInterfaceMQs
				var M = TvrUi.get_meta($group, 'group');

				// ensure selector is loaded and add pg fields if loading selector doesn't do this
				M = TvrUi.ensure_selector_and_pg_loaded(M, dontLoadSelector, tabKey, TvrUi.pref.pg_focus);

				skipFields = false;
				field = '.property-fields';
				$fields = TvrUi.get_pg_focus_obj();
			}

			// update the tabs and show the fields
			TvrUi.update_tab($fields, field, $tabs, tabKey, tab, input, skipFields);

			// update selector fields if it exists
			if (selsExist){

				// update blue dots
                TvrUi.js_check_values({}, M);

				// update all pg field widths, comp css, and UI height
				// note must come after toolbar_adjusted for ACE editor height to be correct
				TvrUi.after_tab_switch(M);
			}

            // delay expensive actions so browser switches tab instantly
            TvrCom.action_after_timeout('mq_expensive', 3, {

                item: function(tabKey){

                    // update iframe slider and preview width
                    TvrUi.reset_preview_width_for_current_tab(tabKey, false, sliderVal);

                    // the device previews aren't being used so remove any 'clicked' classes
                    TvrUi.get_local_window_function('reset_mob_previews')();
                },

                args: [tabKey]
            });


			TvrCom.endT(arguments)
		},

		resume_cur_slider_value: function(){

		},

		reset_preview_width_for_current_tab: function(tabKey, redrawRulers, sliderVal){

			tabKey = tabKey ? tabKey : TvrUi.get_mq_focus();

			TvrUi.get_local_window_function('update_iframe_slider')(
                tabKey,
				TvrUi.mqs[tabKey]['min'],
				TvrUi.mqs[tabKey]['max'],
				redrawRulers,
				sliderVal
			);
		},



		// actions to be performed AFTER a tab or pg icon switches over
		after_tab_switch: function(M, config){ // M, $prevObj, prevTabKey, $curObj, curTabKey
			TvrCom.startT(arguments);

			config = config || {};

			// if pg/tab - don't update if code view as this will update adaptable editor
			if (M !== 'css' && !TvrUi.pref.show_code_editor) {

				// get html object for current fields
				//var $obj = TvrUi.get_group(M);

				// bind color pickers just in time
				//TvrUi.colorpicker_bind($obj);

				// add class for only code editor so that item can be full height.
				var topPanel = 'styles';
				if (M.groupSlug === 'code'){
					TvrUi.stat.tvr.addClass('onlyInlineEditor');
					TvrUi.onlyInlineEditor = 1;
					topPanel = 'editor';
				} else {
					TvrUi.stat.tvr.removeClass('onlyInlineEditor');
					TvrUi.onlyInlineEditor = 0;
				}

				// we might not always want to bring styles/editor to fore when navigating to sel
				// e.g. when arranging selectors into folders/deleting items which triggers tvr_iterate...
				var itemDockedTop = (topPanel === 'editor' && !TvrUi.pref.dock_editor_left)
					|| (topPanel === 'styles' && !TvrUi.pref.dock_styles_left);
				if (!itemDockedTop && !config.doNotBringStylesTop){
					MTlayout.update_sidebar_z_indexes(topPanel, 'left');
				}

				// changing the onlyInlineEditor class can affect the number of rows along the top
				MTlayout.adjust_preview_margin_and_save_config({
					skipPGPress: 1, // to prevent infinite loop
					side: 'left',
					skipSave: 1
				});

                var $stateCont = TvrUi.iframeEditing()
                    ? TvrUi.stat.tvr.add(TvrUi.stat.fHTML)
                    : TvrUi.stat.tvr;

				// if transform
				if (M.groupSlug === 'transform'){
					TvrUi.default_to_tab('transform');
				}

				// if CSS grid options showing
                if (M.groupSlug === 'grid'){

                    $stateCont.addClass('showGridControls');

                    TvrUi.default_to_tab('grid');

                    // toggle single item class for grid control
                    var singleItemClass = 'show-single-griditem';
                    if (M.group.find('.property-grid').hasClass(singleItemClass)){
                        TvrUi.stat.grid.addClass(singleItemClass);
                    } else {
                        TvrUi.stat.grid.removeClass(singleItemClass);
                    }

                } else {
                    $stateCont.removeClass('showGridControls');
                }

				// update ace editor
				if ((M.groupSlug === 'code' || MTlayout.editor_and_gui()) && !TvrUi.editor_to_gui_running){

					MTace.update_adaptable_editor({
						M: M,
						directContent: MTdd.resolve_inline_editor_content(M),
						mode: parseInt(TvrUi.pref.allow_scss) ? 'scss' : 'css'
					});

				}

				// Update any multi-tabs
				if (M.groupSlug === 'html'){
					TvrUi.updateMultiTabs(M);
				}

				// scroll and image adjustment can be deferred
				TvrCom.action_after_timeout('tab_switch_deferred', 3, {
					item: function(M){

						//TvrUi.colorpicker_bind(M.group);

						// scroll image field url to end so user can see the name
						TvrUi.maybe_scroll_image_fields(M);

						// show or hide horizontal scroll buttons
						TvrUi.adjust_scroll_buttons(M, 'style');

					},
					args: [M]
				});

			}

			// Full code editor tab switch
			if (M === 'css'){

				var codeMode = config.$curObj.data('code-type');
				MTace.update_adaptable_editor({
					M: M,
					directContent:  config.$curObj.find('textarea').val(),
					mode: (parseInt(TvrUi.pref.allow_scss) && codeMode === 'css') ? 'scss' : codeMode
				})

				var $js_save_button = TvrUi.stat.code.find('.save-javascript-button');

				// CSS
				if (codeMode === 'css'){

					// resume cursor position if possible
					if (!TvrUi.existingSelRadioUsed){
						MTace.resume_editor_cursor_pos_and_select();
					}

					$js_save_button.removeClass('show');
				}

				// JavaScript
				else {
					$js_save_button.addClass('show');
				}

			}
			TvrCom.endT(arguments)
		},

		calculateMaxTabLength(calc){

			// Default max-length
			calc.maxLength = calc.currentTab + 1;

			//console.log('initial currentTab', calc)

			// Ensure we have minimum tabs
			if (calc.maxLength < calc.minLength){
				calc.maxLength = calc.minLength;
			}

			// If we have existing settings
			if (calc.groupData){
				for (const [key, { value }] of Object.entries(calc.groupData)) {
					if (Array.isArray(value)){

						if (value[calc.currentTab]){
							calc.currentTabSet = true;
						}

						if (value.length > calc.maxLength) {
							calc.maxLength = value.length;
							calc.longestKey = key;
						}

					}
				}
			}
		},

		// adjust tab index is a different user-defined or default action-aspect is set on the index
		maybeAdjustTabIndex(calc, origCurrentTab, groupSlug) {

			for (let i = 0; i < calc.maxLength; ++i) {
				let attsData = TvrUi.getMultiTabInfo(i, groupSlug, calc.groupData, false).attsData;

				if (
					attsData.action === TvrUi.defaultTabValues.html.defaults.action &&
					attsData.aspect === TvrUi.defaultTabValues.html.defaults.aspect
				) {
					calc.empty.push(i);
				}

				//console.log('Compare current tab', TvrUi.pref.lastMultiTab.html, attsData);

				if (
					attsData.action === TvrUi.pref.lastMultiTab.html.action &&
					attsData.aspect === TvrUi.pref.lastMultiTab.html.aspect
				) {
					if (i === calc.currentTab && calc.currentTabSet) {
						calc.found.unshift(i);
					} else {
						calc.found.push(i);
					}
					//console.log('Found matching tab', i, attsData);
				}
			}

			//console.log('Maybe maintain', structuredClone(calc.found), structuredClone(calc.empty));

			if (calc.found.length) {
				calc.currentTab = calc.found[0];
				//console.log('We found a tab, which may be different', calc.currentTab, structuredClone(calc));
			} else {
				//console.log('Conflict between index, action, aspect', calc.currentTab, TvrUi.pref.lastMultiTab.html, structuredClone(calc));

				if (calc.empty.length) {
					calc.currentTab = calc.empty[0];
					//console.log('Filling an empty tab', calc.currentTab, structuredClone(calc));
				} else {
					calc.currentTab = calc.maxLength;
					//console.log('Appending a new tab', calc.currentTab, structuredClone(calc));
				}
			}

			TvrUi.pref.lastMultiTab.html.index = calc.currentTab;

			if (calc.currentTab !== origCurrentTab) {

				TvrUi.calculateMaxTabLength(calc);
				//console.log('Recalculate maxLength', calc.currentTab, structuredClone(calc));

				TvrUi.saveMultiTab();

			}
		},

		saveMultiTab(){
			MTsave.save_multiple_preferences({
				lastMultiTab: TvrUi.pref.lastMultiTab,
			}, false, 'revisions');
			//console.log('We saved it', TvrUi.pref.lastMultiTab);
		},

		resolveMultiTab(sectionSlug, selectorSlug, groupSlug, groupData, skipTabAdjustCheck){

			let origCurrentTab = TvrUi.getGroupIndex(sectionSlug, selectorSlug, groupSlug);

			//console.log('Original tab', origCurrentTab, structuredClone(TvrUi.pref.lastMultiTab.html));

			let calc = {
				currentTab: origCurrentTab,
				currentTabSet: false,
				groupData,
				longestKey: 0,
				minLength: TvrUi.pref.default_html_group_tabs.length,
				found: [],
				empty: []
			};

			TvrUi.calculateMaxTabLength(calc);

			//console.log('Initial tabs calc', structuredClone(calc));

			if (skipTabAdjustCheck || TvrUi.skipTabAdjustCheck) {
				TvrUi.skipTabAdjustCheck = false;
				//console.log('Reset flag');
			} else {
				TvrUi.maybeAdjustTabIndex(calc, origCurrentTab, groupSlug);
			}

			//console.log('Final tabs calc', structuredClone(calc), structuredClone(TvrUi.pref.lastMultiTab.html));

			return calc;
		},

		// Update the property set tabs
		updateMultiTabs: function(M) {

			let groupData = TvrCom.get_js_object_data(
				[M.sectionSlug, M.selectorSlug, 'styles', M.groupSlug], M.tabSlug
			).data;

			let calc = TvrUi.resolveMultiTab(
				M.sectionSlug,
				M.selectorSlug,
				M.groupSlug,
				groupData,
				true
			);

			M.groupTab.find('.multi-tab').remove();

			let moreTabs = '',
				$addTab = M.groupTab.find('.add-multi-tab');

			for (let i = 0; i < calc.maxLength; ++i) {
				moreTabs += TvrUi.getMultiTabInfo(i, M.groupSlug, groupData).html;
			}

			$addTab.before(moreTabs);

			TvrUi.update_tab(null, null, M.groupTab.find('.multi-tabs'), calc.currentTab, '.multi-tab', '.multi-focus', true);

			if (M.groupSlug === 'html') {
				let groupIndex = calc.currentTab;

				M.selector.attr('mt-group-index', groupIndex);

				MThtml.maybeAdjustFieldDisplay(M, MThtml.presetTabData(groupIndex), true);

				if (MThtml.inspectAmendsView) {
					M.groupTab.find('.amender-inspect-button')
						.removeClass('active');
					M.groupTab.find('.amender-inspect-button[data-view="' + MThtml.inspectAmendsView + '"]')
						.addClass('active');
				}
			}
		},

		defaultTabValues: {

			// HTML group (Amender)
			html: {
				keys: ['action', 'aspect'],
				defaults: {
					action: 'none',
					aspect: 'html'
				},
				/* User preference now
				values: [
					{
						action: 'replace',
						aspect: 'text'
					},
					{
						action: 'add',
						aspect: 'text'
					},
					{
						action: 'remove',
						aspect: 'html'
					},

					{
						action: 'add',
						aspect: 'class'
					},
					{
						action: 'add',
						aspect: 'css'
					},
					{
						action: 'run',
						aspect: 'jsFunction'
					},

				]*/
			}
		},
		getMultiTabInfo: function(i, groupSlug, groupData, checkLastMultiTab = true){

			let lastMultiTab = TvrUi.getLastMultiTab(groupSlug),
				defaultValues = TvrUi.pref.default_html_group_tabs[i],
				defaultKeys = TvrUi.defaultTabValues[groupSlug].keys,
				atts = '',
				attsData = {},
				hasValues = TvrUi.multi_tab_has_values(groupData, i) ? ' hasValues' : '';

			//console.log('getMultiTabInfo', i, groupSlug, groupData, TvrUi.defaultTabValues, 'last', lastMultiTab);

			defaultKeys.forEach((key) => {

				// First we check the user settings
				let value = TvrCom.checkObject(groupData, [
					key, 'value', i
				]);

				if (value === false || value === null){

					// We should default to the last action/aspect if on the current tab
					if (checkLastMultiTab && parseInt(lastMultiTab.index) === i){
						value = lastMultiTab[key];
					}

					else {
						// Then we check the default for the given index (0-5)
						value = TvrCom.checkObject(defaultValues, [key])

							// Finally, we resort to default action/aspect
							|| TvrUi.defaultTabValues[groupSlug].defaults[key];
					}

				}

				atts+= ` data-${key}="${value}"`;
				attsData[key] = value;
			})

			return {
				html: `<span class="multi-tab mt-tab multi-tab-${i}${hasValues}" rel="${i}"><span class="mt-tab-txt"${atts}></span></span>`,
				index: i,
				attsData: attsData
			};
		},

		toggleGroupMenu: function($clicked){

			let M = TvrUi.get_meta($clicked, 'group')

			TvrUi.toggle_context_menu({
				M: M,
				$clicked: $clicked,
				filter: '#cm-group-'+M.groupSlug,
				// Create sortable list of tabs
				before_open: function(data){

					//console.log('toggleGroupMenu', data)

					let currentTabs = '',
						defaultTabs = '',
						$groupTabs = M.selector.find('.multi-tabs-wrap'),
						commonConfig = {
							animation: 150,
							forceFallback: true,
							handle: '.sortable-icon',
							onStart: function (event) {
								//console.log('onStart', event);
								MTlocal.clean_tooltips();
								let $item = $(event.item),
									$menu = $item.closest('ul');
								$menu.addClass('sorting-in-progress');
							},
							onEnd: function (event) {
								//console.log('onEnd', event);
								let $item = $(event.item),
									$menu = $item.closest('ul');
								$menu.removeClass('sorting-in-progress');
							}
						},
						menus = {
							'default': {
								el: data.$content.find('.html-tabs-list-default'),
								innerHTML: '',
								sortable: null,
								sortableConfig: $.extend(true, {}, commonConfig, {
									onUpdate: function(event){

										// Remove the moved item from its old position
										const movedItem = TvrUi.pref.default_html_group_tabs.splice(event.oldIndex, 1)[0];

										//console.log('default onUpdate', event, event.oldIndex, event.newIndex, movedItem);

										// Insert it into its new position
										TvrUi.pref.default_html_group_tabs.splice(event.newIndex, 0, movedItem);

										TvrUi.saveDefaultHTMLTabs();

										// Update the tabs
										TvrUi.updateMultiTabs(M);

										// Save
										/*MTsave.save_multiple_preferences({
											default_html_group_tabs: TvrUi.pref.default_html_group_tabs
										});*/

										//console.log('Updated tabs:', TvrUi.pref.default_html_group_tabs);
									}
								})
							},
							'current': {
								el: data.$content.find('.html-tabs-list-current'),
								innerHTML: '',
								sortable: null,
								sortableConfig: $.extend(true, {}, commonConfig, {
									onUpdate: function(event){

										/*
										Todo
										With JS Sortable, it is possible to have a hybrid drag-drop/sortable functionality where the item will move out the way like sortable if a condition is met, and replace the item (like drag and drop) if another condition is met?
										 Apparently so: https://chatgpt.com/c/68d10596-8c04-8322-8117-2199fc5250c5
										 */

										let groupData = TvrCom.get_js_object_data(
											[M.sectionSlug, M.selectorSlug, 'styles', 'html'], M.tabSlug
										).data;

										//console.log('groupData orig', structuredClone(groupData));

										Object.keys(groupData).forEach(key => {
											if (groupData[key] && Array.isArray(groupData[key].value)) {
												let arr = groupData[key].value;

												// Remove the item at oldIndex
												let movedItem = arr.splice(event.oldIndex, 1)[0];

												//console.log('key array', key, arr, 'moved', event.oldIndex, '->', event.newIndex, movedItem);

												// Insert it at newIndex
												arr.splice(event.newIndex, 0, movedItem);
											}
										});

										//console.log('groupData after', event, structuredClone(groupData));

										TvrUi.updateMultiTabs(M);


									}
								})
							}
						}

					// Current tab edit options
					$groupTabs.find('.mt-tab-txt').each(function(index){
						let tab = $(this).data();
						menus.current.innerHTML += TvrUi.editGroupTabItem('current', tab, index);
					});

					// Default tab edit options
					//console.log('TvrUi.pref.default_html_group_tabs', TvrUi.pref.default_html_group_tabs)
					TvrUi.pref.default_html_group_tabs.forEach((item, index) => {
						menus.default.innerHTML += TvrUi.editGroupTabItem('default', item, index);
					});

					// Apply innerHTML to DOM and make list sortable
					Object.values(menus).forEach(menu => {
						menu.el.html(menu.innerHTML);
						menu.sortable = new Sortable(menu.el[0], menu.sortableConfig);
					});


					/*data.$content.find('.html-tabs-list-default').html(defaultTabs);
					data.$content.find('.html-tabs-list-current').html(currentTabs);

					let sortableMe = new Sortable(menus, {});*/
				}
			});
		},

		groupManagementAdjusted($el, value) {

			let M = TvrUi.get_pg_meta();
			if (!M) {
				return;
			}

			// Common references
			let $field   = $el.closest('.group-management-field'),
				$menu    = $field.find('ul'),
				type     = $menu.hasClass('html-tabs-list-current') ? 'current' : 'default',
				groupData = TvrCom.get_js_object_data(
					[M.sectionSlug, M.selectorSlug, 'styles', 'html'], M.tabSlug
				).data,
				isInput = $el.hasClass('combobox'),
				iconAction = $el.data('groupTabAction');

			// Route: Add Item
			if ($el.hasClass('group-management-add-tab')) {

				let tabIndex = $menu.children().length,
					attsData = TvrUi.getMultiTabInfo(tabIndex, 'html', null, false).attsData,
					itemHTML = TvrUi.editGroupTabItem(type, attsData, tabIndex);

				$menu.append(itemHTML);

				// Current
				if (type === 'current') {

				}

				// Default
				else {
					TvrUi.pref.default_html_group_tabs.push(attsData);
				}
			}

			// Route: Update Item
			else if (isInput || iconAction) {

				let $item    = $el.closest('li'),
					tabIndex = $item.data('index'),
					property = $el.attr('rel');

				if (isInput){

					// Current
					if (type === 'current') {

						// Add to data
						groupData[property].value[tabIndex] = value;

						// Save
						MTsave.ajax_save_settings({
							//noSaveDelay: 1,
							settings: MTsave.user_action({}, {
								displayItems: ['Tab updated (' + property + ': ' + value + ')'],
								'M': M,
								'pathTT': true,
								'icon': 'mtif-' + property
							})
						});

					}

					// Default route
					else {

						TvrUi.pref.default_html_group_tabs[tabIndex][property] = value;

						TvrUi.saveDefaultHTMLTabs();

						/*MTsave.save_multiple_preferences({
							default_html_group_tabs: TvrUi.pref.default_html_group_tabs
						});*/
					}

				}

				else if (iconAction){

					// Current
					if (type === 'current') {

					}

					// Default
					else {
						switch (iconAction){
							case 'reset':

								// Reset preference storage to the original definition
								TvrUi.pref.default_html_group_tabs = [
									{ action: 'replace', aspect: 'text' },
									{ action: 'add', aspect: 'text' },
									{ action: 'remove', aspect: 'html' },
									{ action: 'add', aspect: 'class' },
									{ action: 'add', aspect: 'css' },
									{ action: 'run', aspect: 'jsFunction' }
								];

								// Clear the current DOM list
								$menu.empty();

								// Build all items in one go
								let itemsHTML = '';
								TvrUi.pref.default_html_group_tabs.forEach((attsData, tabIndex) => {
									itemsHTML += TvrUi.editGroupTabItem(type, attsData, tabIndex);
								});

								// Append all items in one shot
								$menu.append(itemsHTML);

								break;
							case 'delete':
								TvrUi.pref.default_html_group_tabs.splice(tabIndex, 1);
								$item.fadeOut('fast', function(){
									$item.remove();
								})
								break;
							case 'duplicate':

								// Clone DOM
								let $clone = $item.clone(true, true);

								// Insert after
								$item.after($clone);

								// Duplicate data in array
								let cloneData = $.extend(true, {}, TvrUi.pref.default_html_group_tabs[tabIndex]); // deep copy
								TvrUi.pref.default_html_group_tabs.splice(tabIndex + 1, 0, cloneData);

								// Update indexes for all items after this one
								$item.closest('ul').children('li').each(function (i) {
									$(this).attr('data-index', i);
								});

								break;
						}

						// Save
						TvrUi.saveDefaultHTMLTabs();

						/*MTsave.save_multiple_preferences({
							default_html_group_tabs: TvrUi.pref.default_html_group_tabs
						});*/

					}

				}

				//console.log('groupData to update', property, value, groupData);

			}

			// Live update the tabs
			TvrUi.updateMultiTabs(M);

		},

		saveDefaultHTMLTabs(){

			let selected = TvrUi.pref.lastMultiTab.html,
				index = parseInt(selected.index),
				defaultForSelected = TvrUi.pref.default_html_group_tabs[index];

			//console.log('saveDefaultHTMLTabs', structuredClone(selected), structuredClone(defaultForSelected));

			// Ensure lastMultiTab updates if default was changed
			if (defaultForSelected){
				selected.action = defaultForSelected.action;
				selected.aspect = defaultForSelected.aspect;
				//console.log('We may update');
			}

			MTsave.save_multiple_preferences({
				default_html_group_tabs: TvrUi.pref.default_html_group_tabs,
				lastMultiTab: TvrUi.pref.lastMultiTab
			});
		},

		editGroupTabItem: function(type, tab, index){

			let actionAspect = '';

			actionAspect+= `
			<span class="html-control-wrap tvr-input-wrap edit-${type}-group-tab-action">
				<input type="text" autocomplete="off" rel="action" data-autofill="" data-appto="#combo-markup-do-not-clear" class="combobox edit-group-tab-input edit-${type}-group-tab-input has-arrows" value="${tab.action}">
				<span class="combo-arrow tvr-field-arrow"></span>
			</span>
			<span class="html-control-wrap tvr-input-wrap edit-${type}-group-tab-action">
				<input type="text" autocomplete="off" rel="aspect" data-autofill="" data-appto="#combo-markup-do-not-clear" class="combobox edit-group-tab-input edit-${type}-group-tab-input has-arrows" value="${tab.aspect}">
				<span class="combo-arrow tvr-field-arrow"></span>
			</span>
			`;

			return  `
			<li class="edit-group-tab-item edit-${type}-tab" data-index="${index}">
				<div class="manage-group-tab-icons mt-icon-line">
				
					<span class="mtif mtif-arrowsx4 group-tab-sortable-icon sortable-icon" title="Reorder tab"></span>
					
					${actionAspect}
					
					<span class="group-tab-spacer"></span>
					
					<span class="disabled-toggle input-icon-toggle mtif mtif-disable group-tab-action-icon group-tab-disabled" title="" data-pos="Disable tab" data-neg="Enable tab" data-input-type="disabled" data-input-level="group-tab" data-group-tab-action="disable"></span>
					<span class="mtif mtif-eraser group-tab-action-icon clear-icon" title="Clear tab" data-input-level="group-tab" data-group-tab-action="clear"></span>
					<span class="mtif mtif-bin group-tab-action-icon delete-group-tab mt-icon-divider" title="Delete tab" data-group-tab-action="delete"></span>
					
					<span class="mtif mtif-copy group-tab-action-icon copy-group-tab" title="Duplicate tab" data-group-tab-action="duplicate"></span>
					
				</div>
			</li>`;
		},

		addMultiTab: function($addTab){

			let $currentTabs = $addTab.siblings(),
				tabIndex = $currentTabs.length,
				M = TvrUi.get_meta($addTab, 'group')

			//console.log('addMultiTab', $addTab, tabIndex, TvrUi.getMultiTabInfo(tabIndex))

			$addTab.before(TvrUi.getMultiTabInfo(tabIndex, M.groupSlug, {}, false).html);

			// select the newly added tab
			TvrUi.skipTabAdjustCheck = true;
			TvrUi.multi_tab_pressed($addTab.siblings('.multi-tab-'+tabIndex));

			// Action and Aspect fields show by default on new tabs
			//MThtml.adjustActionAspectDisplay(M, true, M.groupTab.find('.toggle-action-aspect'));

		},

		multi_tab_pressed: function($clicked){

			let tabKey = parseInt($clicked.attr('rel')),
				M = TvrUi.get_meta($clicked, 'group'),
				data = $clicked.find('.mt-tab-txt').data(),
				selector = MTloop.get_selector_data(M, M.tabSlug).data;

			// Store the focus for the group type at the selector level
			M.selectorM.find('input.selector-multi-key-'+M.groupSlug).val(tabKey);

			// Update the data
			TvrCom.updateObject(selector, ['multi_key', M.groupSlug], tabKey);

			// Remember the last visited tab so that newly created selectors can follow suit
			TvrUi.pref.lastMultiTab[M.groupSlug] = {
				index: parseInt(tabKey),
				action: data.action,
				aspect: data.aspect,
			};

			// Save the curent action / aspect
			TvrUi.saveMultiTab();
			/*MTsave.save_multiple_preferences({
				lastMultiTab: TvrUi.pref.lastMultiTab,
			}, false, 'revisions');*/

			//console.log('Updated the sleector tab key', tabKey, selector, TvrUi.pref.lastMultiTab);

			// Reload the whole group
			TvrUi.maybe_default_to_pg({}, false);

			// Silently save the tab view
			let settings = MTdd.dom_to_data({
				M: M,
				domDepth: 'selector',
				return: 'mtData'
			}, M.selectorM);
			MTsave.silent_save(false, settings.savePackage);

		},

		open_property_dropdown: function(p, group, prop){

			// go to specific property
			var $selector = $('#'+TvrUi.selInFocusID);

			group = group || p.group;
			prop = prop || TvrCom.checkObject(p, ['fieldData', 0, 'prop']);

			if (!prop || !TvrCom.isDomEl($selector)){
				return false;
			}

			var $field = $selector.find('div.field-'+group+'-'+prop),
				filter = $field.hasClass('is-picker')
					? '.property-input, .sp-preview-inner'
					: '.combo-arrow';

			// open color picker or dropdown
			$field.find(filter).trigger('click');

		},

		// get code editor vars from M at selector level or another group
		get_code_meta: function(M){

			var $code_group = M.selector.find('.group-tag-code'),
				$property_fields = $code_group ? $code_group.find('div.property-fields-'+M.tabSlug) : false,
				$editor = TvrUi.stat.adaptableEditor; //$property_fields ? $property_fields.find('pre.pg-css-styles') : false;

			return {
				$group: $code_group,
				$property_fields: $property_fields,
				$editor: $editor,
				editor:  MTace.eds['adaptable-editor']
			}
		},

		// determine if JS tab is active and file needs reloading
		js_in_focus: function(){
			return TvrUi.stat.tvr.hasClass('show_code_editor') && TvrUi.get_css_focus() == 'js' ? true: false;
		},


		// default to last viewed tab, or all-devices (see get_mq_focus())
		default_to_tab: function(con){ TvrCom.startT(arguments);
			if (con === 'mq'){
				TvrUi.mq_tab_pressed(
					TvrUi.stat.res.find( '.mq-tab-'+TvrUi.get_mq_focus() )
				);
			} else if (con === 'css'){
				TvrUi.css_tab_pressed(
					TvrUi.stat.code.find('.css-tab-'+TvrUi.get_css_focus())
				);
			} else if (con === 'view-code'){
				var $tabs = TvrUi.stat.view.find('.dialog-tab');
				if ($tabs.length){
					var	$tab = $tabs.filter('.dialog-tab-'+TvrUi.get_initial_code_view_tab());
					if (!$tab.length){
						$tab = $tabs.first();
					}
					TvrUi.dialog_tab_pressed($tab);
				}
			} else if (con === 'wizard'){
				TvrUi.adv_tab_pressed(
					$('#adv-tabs').find('.adv-tab-'+TvrUi.get_wizard_focus())
				);
			} else if (con === 'grid' || con === 'transform'){
                TvrUi.pg_tab_pressed(
                	MTgrid.get_pg_fields(con).find('.'+con+'-tab-'+TvrUi['get_'+con+'_focus']()),
					con
                );
            }
			TvrCom.endT(arguments)
		},

		// get the key for the currently active MQ tab
		get_mq_focus: function(){
			var tabKey = TvrUi.pref.mq_device_focus; //$('#responsive-bar').find('input.device-focus').val();
			// default to all devices if the mq keys are updated and the saved value is out of date
			if (!TvrCom.hasValue(tabKey) || !TvrCom.hasValue(TvrUi.mqs[tabKey])){
				tabKey = 'all-devices';
			}
			return tabKey;
		},

		// get the wizard tab focus
		get_wizard_focus: function(CheckCollapsed){

		    //console.log('TvrUi.pref.adv_wizard_tab', TvrUi.pref.adv_wizard_tab)

			if (
				CheckCollapsed && !parseInt(TvrUi.pref['wizard_expanded']) && !TvrUi.pref.dock_wizard_right
			) {
				return false;
			}

			var tabKey = TvrUi.pref.adv_wizard_tab; //$('#adv-tabs').find('input.adv-wizard-focus').val();

			// default to computed shows if a legacy tab is still in place
			if (!tabKey || tabKey === 'html-inspector' || tabKey === 'refine-targeting'){
				tabKey = 'css-computed';
			}

			return tabKey;

			// docked to top
			/*if (!TvrUi.pref.dock_wizard_right){
				// when upgrading, saved tab could be targeting/html so reset these too
				if (!tabKey || tabKey === 'html-inspector' || tabKey === 'refine-targeting'){
					tabKey = 'css-computed';
				}
			} else {
				// right docked
				if (!tabKey){
					tabKey = 'refine-targeting';
				}
			}

			return tabKey;*/
		},

		// get the css tab focus
		get_css_focus: function(){
			var tabKey = TvrUi.pref.css_focus; //TvrUi.stat.code.find('input.css-focus').val();
			if (!tabKey){
				tabKey = 'all-browsers';
			}
			return tabKey;
		},

		// get the current grid focus
		get_grid_focus: function(){
			//return 'griditems'; // temp for dev purposes
            var tabKey = TvrUi.pref.grid_focus;
            return tabKey ? tabKey : 'gridtemplate';
		},

		// get the current grid focus
		get_transform_focus: function(){
			//return 'griditems'; // temp for dev purposes
			var tabKey = TvrUi.pref.transform_focus;
			return tabKey ? tabKey : 'transform';
		},

		// get dialog tab in focus
		get_dialog_tab_focus: function($dialog){
			$dialog = $dialog ? $dialog : TvrUi.get_dialog_focus();
			var tabKey = $dialog.find('input.dialog-focus').val();
			if (!tabKey){
				tabKey = 0;
			}
			return parseInt(tabKey);
		},

		// get dialog in focus
		get_dialog_focus: function(){
			return TvrUi.stat.dialogs.find('div.tvr-dialog.show')
		},

		// helper function for debugging
		get_tab_name: function(tabKey){
			return $('#responsive-bar').find('.mq-tab-'+tabKey).find('.mq-tab-txt').text();
		},

		// get pg group object (needed if current depth is above group)
		get_pg_focus_obj: function(pg_focus){

			// sometimes we might want to pass in pg focus as global var hasn't been updated yet
			pg_focus = pg_focus ? pg_focus : TvrUi.pref.pg_focus;

			var $obj = $('#'+TvrUi.selInFocusID+'-'+pg_focus);

			//console.log('$obj', $obj, '#'+TvrUi.selInFocusID+'-'+pg_focus)

			if (!TvrCom.isDomEl($obj)){
				return false;
			}

			return $obj;
		},

		// get the group container div
		get_group: function(M, inputs){
			//tabKey = !tabKey ? M.tabKey : tabKey;  // may need to pass in tabKey param one day - if we don't want tab in focus (M.tabKey)
			var $obj = M.group.find('div.property-fields-'+M.tabSlug);
			if (inputs){
				$obj = $obj.find('input.property-input');
			}
			if (!TvrCom.isDomEl($obj)){
				return false;
			}
			return $obj;
		},

		// get the pg group device-specific fields (checks if they exist)
		get_pg_fields_obj: function($pg_group, tab){ TvrCom.startT(arguments);
			var $pg_fields = $pg_group.find('div.property-fields-'+tab);
			TvrCom.endT(arguments)
			if ( !TvrCom.isDomEl($pg_fields) ){
				return false;
			}
			return $pg_fields;
		},

		// Get the subgroup field divs or inputs.
		get_subgroup_or_tabgroup: function(M, inputs, tabGroup){

		    var $group = TvrUi.get_group(M);

		    // bail if no group
		    if (!TvrCom.isDomEl($group)){
                return false;
            }

			var filter = tabGroup
					? 'div.tab-control-'+tabGroup
					: 'div.subgroup-'+M.subgroupSlug,
				$obj = $group.find(filter);

            if (!TvrCom.isDomEl($obj)){
                return false;
            }

			if (inputs){
				$obj = $obj.find('input.property-input');
			}

			return TvrCom.isDomEl($obj) ? $obj : false;
		},

		// maybe remove previous pg group
		maybe_remove_group: function($pg, tabKey){ TvrCom.startT(arguments);
			// need to use id to Query dom again, to ensure
			if ($pg){
				var M = TvrUi.get_meta($pg, 'group');
				if ( !TvrUi.pg_check_values(M.group, tabKey, false) &&
					 !TvrUi.input_toggles_enabled(M.group, 'group', tabKey) ){
					TvrCom.endT(arguments)
					return TvrUi.remove_property_group(M, tabKey);
				}
			}
			TvrCom.endT(arguments)
			return false;
		},

		// check property group toggles e.g. disbaled/important/flex item
		// so user config isn't wiped by remove_property_group
		input_toggles_enabled: function($obj, level, tabKey){

			// group level need tab key adjustment
			if (level == 'group'){
				//var $obj = TvrUi.get_group(M); // get_group uses current key stored in M, not as flexible
				$obj = $obj.find('div.property-fields-'+tabKey)
			}

			var returnValue = false;

			// if any toggle has a associated <input> field, something is enabled
			$obj.find('input.input-toggle-tracker').each(function(i){
				returnValue = true;
				return false; // break out of .each()
			});

			return returnValue;
		},

        // todo - use JS object, no great rush as single selector will always fully load in UI
        selector_check_disabled: function(M){
            var $sel_inputs = M.selectorM.find('.disabled-responsive-tabs');
            var $tabs = $('#responsive-bar').find('.query-tabs');
            for (var tab in TvrMQsCombined){
                if ( ! TvrMQsCombined.hasOwnProperty(tab) ) continue; // for compat
                var $tab = $tabs.find('span.mq-tab-'+tab);
                if (TvrCom.isDomEl($sel_inputs.find('input.disabled-tracker-'+tab))){
					$tab.addClass('item-disabled');
                } else {
					$tab.removeClass('item-disabled');
                }
            }
        },

		// does the pg for a given tab have values? - todo this could check JS object, but keeping for now as replacement not urgent
		pg_check_values: function($obj, tab, updatePgIconFeathers, exclude){
		    var args = arguments;
			var M = TvrUi.get_meta($obj, 'group');
			var pgHasValues = false;
			var tabFocus = TvrUi.get_mq_focus();
			exclude = exclude ? exclude : '#nothing';
			M.group.find('div.property-fields-'+tab)
				.find('input.property-input, textarea.property-input').not(exclude).each(function(i){
					if ( TvrCom.isDefined($(this).val()) ){
						pgHasValues = true;
						return false; // break
					}
				});

			//console.log('still in use')

			return pgHasValues;
		},

		// does the tab have any values?
		/*tab_check_values: function($sel, tab, updateTabFeather, updatePgIconFeathers){ TvrCom.startT(arguments);
			var tabHasValues = false;
			// check PGs
			for (var pg in TvrMT.data.prog.PGs){
				if ( ! TvrMT.data.prog.PGs.hasOwnProperty(pg) ) continue; // for compat
				var pgHasValues = TvrUi.pg_check_values($sel.find('li.group-tag-'+pg), tab, updatePgIconFeathers);
				// we can break out of the loop if the pg icons don't need updating
				if (pgHasValues){
					tabHasValues = true;
					if (!updatePgIconFeathers) break;
				}
			}
			if (updateTabFeather){
				TvrUi.update_style_signal($('#responsive-bar').find('.mq-tab-'+tab), tabHasValues, 'tab');
			}
			TvrCom.endT(arguments)
			return tabHasValues;
		},*/

		// does the selector have any values?
		/*selector_check_values: function($sel, updateSelector, updateTabFeather, updatePgIconFeathers){ TvrCom.startT(arguments);
			var selectorHasValues = false,
				tabHasValues = false;
			var M = TvrUi.get_meta($sel, 'selector');
			for (var tab in TvrMQsCombined){
				if ( ! TvrMQsCombined.hasOwnProperty(tab) ) continue; // for compat
				tabHasValues = TvrUi.tab_check_values($sel, tab, updateTabFeather, updatePgIconFeathers);
				// we can break out of the loop if the pg icons don't need updating
				if (tabHasValues){
					selectorHasValues = true;
					if (!updateTabFeather && !updatePgIconFeathers) break;
				}
			}
			if (updateSelector){
				TvrUi.update_style_signal(M.selectorM, selectorHasValues, 'selector', M);

			}
			TvrCom.endT(arguments)
			return selectorHasValues;
		},*/

		// does the folder have any values?
		/*section_check_values: function($sec, updateSection, updateSelector, updateTabFeather, updatePgIconFeathers){
		    var args = arguments; TvrCom.startT(args);
			var sectionHasValues = false,
				selHasValues = false;
			var M = TvrUi.get_meta($sec, 'section');
			$sec.find('li.selector-tag').each(function(){
				var sM = TvrUi.get_meta($(this), 'selector');
				var $selTrkr = sM.selectorM.find('input.selector-tracker');
				// if sel hasn't loaded, initial hasValues class is up to date.
				if ($selTrkr.val() == 0){
					if (sM.selectorM.hasClass('hasValues')){
						selHasValues = true;
					} else {
						TvrCom.endT(args);
						return true; // in .each(), this moves onto next selector
					}
				}
				// sel has loaded, check for values
				else {
					selHasValues = TvrUi.selector_check_values(
						sM.selector, updateSelector, updateTabFeather, updatePgIconFeathers);
				}
				if (selHasValues){
					sectionHasValues = true;

					if (!updateSelector && !updateTabFeather && !updatePgIconFeathers) {
						TvrCom.endT(args);
						return false;
					} // break
				}
			});
			if (updateSection){
				TvrUi.update_style_signal(M.sectionM, sectionHasValues, 'section', M);
			}
			TvrCom.endT(args);
			return sectionHasValues;
		},*/

        // does the folder have any values?
        js_check_values: function(settings, M, maxDepth, save, $sel){

			// bail if this update is being deferred
			if (MTloop.deferActions['check_values'] && MTloop.deferActions['update_dots']){
				return settings;
			}

			TvrCom.startT(arguments);

			// we always check at the section level as sel/group affect that dot
            var overrideSettings = {

                // we check all values for section
                incRecurse: true,
                onlyRecurse: false,
                mq_key: false,

                // we always check at the section level as sel/group affect that dot
                // (M might be a dom object in some cases)
                M: TvrUi.get_meta((M.section ? M.section : M), 'section'),

                // we normally need to get down to the group level
                // (note case: 'selector' condition in modify_item may not be active anyway
                maxDepth: 'group'
            };

            // has values we keep permenantly
            settings.has_values = {};

            // first pass - log values at every level
            settings = MTloop.modify_main_js_object('check_values', settings, overrideSettings);
            //console.log('settings after first', overrideSettings.M, $.extend(true, {}, settings));

		    // 2nd pass, update UI dots and cache has_values for section / selector (for dynamic menu)
            overrideSettings.incRecurse = false; // this just updates the root sec and sel
            settings = MTloop.modify_main_js_object('update_dots', settings, overrideSettings);
            //console.log('settings after second', $.extend(true, {}, settings));

            // update the tabs and pg group dots
            var has_values = settings.has_values;
			var pg_focus = TvrUi.pref.pg_focus;

            if (has_values.current_sel_checked){

                TvrUi.update_tab_dots(has_values);

                TvrUi.update_group_dots(has_values);

                //console.log('current_sel_checked', M, M.groupSlug, has_values)

				// update html multi-tab dots
				if (pg_focus === 'html'){
					TvrUi.update_multi_tab_dots(has_values, pg_focus);
				}


                // update coloring of grid items and radio buttons
                if (pg_focus === 'grid'){

                    var updateConfig = { itemsWithValues : has_values.itemsWithValues };

                    if (TvrUi.grid.isAllItems){
                        MTgrid.update_grid_and_radio_item_formatting('itemdots', updateConfig);
                        //console.log('the has_values settings', has_values, updateConfig)
                    }

                    //console.log('we should update the tab dots', has_values)

                    // update the blue dots for the pg tabs
                    TvrUi.update_pgtab_dots(has_values);

                }

				// update transform tab dots
				if (pg_focus === 'transform'){
					TvrUi.update_pgtab_dots(has_values);
				}

            }

            // update has_values if save required, normally this is called with other functions
            // and save happens after all run
            if (save){
                MTsave.silent_save(false, settings.savePackage);
            }

            TvrCom.endT(arguments);

            return settings;
        },

		// update tab dots in dom
		update_tab_dots: function(hv){
            for (var tab in TvrMQsCombined){
                if (!TvrMQsCombined.hasOwnProperty(tab)) continue; // for compat
                var tabHasValues = TvrUi.item_has_styles(hv, 'tab', tab);
                //console.log('the tab values', tab, tabHasValues, hv);
                TvrUi.update_style_signal(TvrUi.stat.res.find('.mq-tab-'+tab), tabHasValues);
            }
		},

        // update the property group tabs, currently just for CSS grid
        update_pgtab_dots: function(hv){

			//console.trace();

		    var M = TvrUi.get_pg_meta(),
                selector = MTloop.get_selector_data(M, M.tabSlug).data,
                nth = TvrCom.isDefined(selector.nth_item) ? selector.nth_item : 1;

		    //console.log('the hv', hv) // $.extend(true, {}, TvrUi.uiData)

		    if (M){

		        // get active tab keys from properties
                var group_key = M.groupSlug,
					activeTabs = {},
                    propsWithValues = TvrCom.checkObject(hv, ['propsWithValues', group_key]);

                if (propsWithValues){

                    var props = Object.keys(propsWithValues);

                    for (var i = 0; i < props.length; i++) {

                        var prop = props[i],
                            tab_control = TvrUi.get_property_tab_control(prop);

                        if (tab_control){

                            //console.log('the prop', prop, tab_control)

                            var hasValue = (tab_control === 'griditems')
                                    ? TvrCom.checkObject(propsWithValues, [prop, 'value', nth])
                                    : 1;

                            if (hasValue){
                                activeTabs[tab_control] = 1;
                            }

                        }
                    }
                }

               // console.log('active tabs', activeTabs)

                // update tab dots
		        M.group.find('span.mt-tab').each(function(){

		            var $tab = $(this),
                        key = $tab.attr('rel'),
                        tabHasValues = activeTabs[key];

		            // grid item needs to check nth in focus

                    TvrUi.update_style_signal($tab, tabHasValues);
                });
            }
        },

		multi_tab_has_values: function(groupData, index){

			if (!groupData){
				return false;
			}

			let tabHasValues = false;

			Object.entries(groupData).forEach(([propertyKey, obj]) => {
				let valuesArray = obj.value || [];
				if (valuesArray[index]) {
					tabHasValues = true;
				}
			});

			return tabHasValues;
		},

		// Update mult tab dots (e.g. html action / aspect tabs)
		update_multi_tab_dots: function(hv, pg_focus){

			//console.trace();

			var groupData = TvrCom.checkObject(hv, ['propsWithValues', pg_focus]),
				M = TvrUi.get_pg_meta();

			//console.log('update_multi_tab_dots hv', groupData) // $.extend(true, {}, TvrUi.uiData)

			if (M){

				// update tab dots
				M.groupTab.find('.multi-tabs').find('span.mt-tab').each(function(index){

					var $tab = $(this),
						tabHasValues = TvrUi.multi_tab_has_values(groupData, index);

					//console.log('Check HTML tab', index, tabHasValues, $tab)

					// grid item needs to check nth in focus
					TvrUi.update_style_signal($tab, tabHasValues);

				});
			}
		},

        // update property group dots in dom
		update_group_dots: function(hv, $sel){

			TvrUi.stat.css_icons.find('.pg-icon').each(function(){

				var $icon = $(this),
					pg = $icon.attr('rel'),
					pgHasValues = TvrUi.item_has_styles(hv, 'group', pg);

				TvrUi.update_style_signal($icon.parent(), pgHasValues);

			});
        },

		// check item key against has_values object
		item_has_styles: function(has_values, depth, key){
			return TvrCom.checkObject(has_values, [depth, key]) ? 1 : ''; // blank key will be cleaned on page reload
		},

        // update hasValues class on item
        update_style_signal: function($obj, hasValues){
		    if ($obj){
                hasValues ? $obj.addClass('hasValues') : $obj.removeClass('hasValues');
            }
        },

		/*** hand css tab update ***/
		css_tab_pressed: function($clicked){ TvrCom.startT(arguments);

			// cache previous tab for cleaning
			var prevTabKey = TvrUi.get_css_focus();
			var tabKey = $clicked.attr('rel');
			var $prevObj = (tabKey == prevTabKey)
				? false
				: TvrUi.stat.code.find('div.mt-full-code-'+prevTabKey);

			var $fields = TvrUi.stat.code;
			var field = '.mt-full-code';
			var $tabs = $fields.find('.css-code-tabs');

			var tab = '.css-tab';
			var input = '.css-focus';
			TvrUi.update_tab($fields, field, $tabs, tabKey, tab, input);

			// save via ajax
			TvrUi.pref.css_focus = tabKey;

			//console.log('the tab key updated', tabKey, TvrUi.pref.css_focus)

			// unbind/bind editor
			var $curObj = TvrUi.stat.code.find('div.mt-full-code-'+tabKey);
			TvrUi.after_tab_switch('css', { $curObj: $curObj }); //  $prevObj, prevTabKey, $curObj, tabKey

			MTsave.simple_ajax_request({
				type: 'GET',
				url: TvrUi.ajaxUrl+'&css_focus='+tabKey
			});
			//$.get(TvrUi.ajaxUrl+'&css_focus='+tabKey);

			// update toolbar (maybe ditch as bind handles this)
			MTlayout.toolbar_adjusted();
			TvrCom.endT(arguments)
		},

		// current used for grid and transform tab press
        pg_tab_pressed: function($clicked, pg_type, realClick){

            var $fields = $clicked.closest('.property-'+pg_type),
				field = '.tab-control',
				$tabs = $fields.find('.query-tabs'),
				tabKey = $clicked.attr('rel'),
				tab = '.'+pg_type+'-tab',
				input = '.'+pg_type+'-tab-focus';

            TvrUi.update_tab($fields, field, $tabs, tabKey, tab, input);

            // save focus
            TvrUi.pref[pg_type+'_focus'] = tabKey;

            // update data attribute on grid container (used for CSS - data as only one tab at a time)
            TvrUi.stat.tvr.attr('data-'+pg_type+'-pgtab', tabKey);

            //console.log('pg_type', pg_type)

            // actually, no need to save this between page loads
			MTsave.simple_ajax_request({
				type: 'GET',
				url: TvrUi.ajaxUrl+'&'+pg_type+'_focus='+tabKey
			});
            //$.get(TvrUi.ajaxUrl+'&'+pg_type+'_focus='+tabKey);

			// refresh the computed CSS as different tabs require different data
			TvrUi.refresh_comp_css();

            // grid only stuff
			if (pg_type === 'grid'){

				// adjust scroll buttons
				TvrUi.adjust_grid_line_scroll_buttons( TvrUi.get_meta($fields, 'group'));

				// update grid settings and canvas when switching tab
				if (TvrUi.iframeEditing()){
					MTF.maybe_run_grid_control_update(realClick);
				}
			}

		},

		// wizard tab
		adv_tab_pressed: function($clicked){ TvrCom.startT(arguments);

			var $fields = TvrUi.stat.inspectionPanes;
			var field = '.adv-area';
			var $tabs = $fields.find('.query-tabs');
			var tabKey = $clicked.attr('rel');
			var tab = '.adv-tab';
			var input = '.adv-wizard-focus';
			TvrUi.update_tab($fields, field, $tabs, tabKey, tab, input);
			TvrUi.pref.adv_wizard_tab = tabKey;

			// refresh the comp/actual CSS that may be newly in view now
			TvrUi.maybeUpdateInspectorPanels({
				updateComputed: 1,
				updateStyles: 1
			});

			// remember adv wizard tab
			MTsave.simple_ajax_request({
				type: 'GET',
				url: TvrUi.ajaxUrl+'&adv_wizard_tab='+tabKey
			});
			//$.get(TvrUi.ajaxUrl+'&adv_wizard_tab='+tabKey, function() {});

			TvrCom.endT(arguments)
		},

		managementTabPressed($clicked){
			var $fields = $('#cm-group-html');
			var field = '.group-management-field';
			var $tabs = $fields.find('.query-tabs');
			var tabKey = $clicked.attr('rel');
			var tab = '.group-management-tab';
			var input = '';
			TvrUi.update_tab($fields, field, $tabs, tabKey, tab, input);
		},

		// wizard tab
		settings_tab_pressed: function($clicked){

		},

		// may need to update content of certain wizard panels (e.g. after tab, save, screen slider)
		maybeUpdateInspectorPanels: function(config){ TvrCom.startT(arguments);

			// if the panels are not showing, abort, they will get updated when expanded
			// and same if the frontend hasn't loaded
			if (!parseInt(TvrUi.pref['wizard_expanded']) || !TvrUi.iframeEditing(true) ){

				//console.log('bail maybeUpdateInspectorPanels', !parseInt(TvrUi.pref['wizard_expanded']), !TvrUi.iframeEditing(true));

				// we still want to update the computed CSS for the editing options,
				// even if no inspection panels are expanded
				TvrUi.updateCompAsync(false, false, undefined, 'obj');

				TvrCom.endT(arguments);

				return false;
			}

			config = config ? config : {};

			//console.log('maybeUpdateInspectorPanels config', config);

			// get the tab panel showing (Computed / Styles)
			var tabPanelShowing = TvrUi.get_wizard_focus(true);

			// Computed tab - and the editing options, so run always (not just when comp tab is showing)
			if (config.updateComputed){

				//console.log('this should run')

				TvrUi.updateCompAsync(true, true, undefined, 'obj');

				/*// short timer to make sure it comes after visual el selection repaint
				TvrCom.action_after_timeout('update_styles_pane', 3, {
					item: function(){
						//console.log('update computed');
						if (MTF){
							MTF.getAndUpdateCompStyles(true, true, undefined, 'obj');
						}

					},
					args: []
				});*/

			}

			// HTML tab (instant if scroll, otherwise little delay)
			if (config.updateHTML){ //  && MTace.eds.wizard_inspector_html

				//console.log('update html', TvrUi.domChanged.updateHTMLPane);

				// update the HTML text of required
				if (TvrUi.domChanged.updateHTMLPane || config.updateVisEditor){
					//console.log('update HTML visually', $.extend('update config', config));
					config.updateVisEditor = 1;
					TvrUi.update_wizard_html(config); // timer runs in function
					TvrUi.domChanged.updateHTMLPane = false;
				}

				// otherwise just scroll to line
				else {
					//console.log('Scroll to HTML line');
					TvrUi.update_wizard_html_scroll(config);

				}

			}

			// Styles tab
			if (tabPanelShowing === 'css-inspector' && config.updateStyles){

				TvrCom.action_after_timeout('update_styles_pane', 70, {
					item: function(){
						//console.log('update styles');
						MTdd.update_stylesheet_rules();
					},
					args: []
				});
			}

			TvrCom.endT(arguments);
		},

		// update the computed styles after a small time delay to prevent holding up browser repaint
		updateCompAsync: function(wizard, intelli, data, con){

			// short timer to make sure it comes after visual el selection repaint
			TvrCom.action_after_timeout('update_comp_async', 3, {
				item: function(){
					//console.log('update computed');
					if (TvrUi.iframeEditing()){
						//console.log('the values', wizard, intelli, data, con);
						MTF.getAndUpdateCompStyles(wizard, intelli, data, con);

						// style changes will affect the [::before/after] flags in the HTML editor so update
						// if the panel is showing
						if (TvrUi.get_wizard_focus(true)){
							MTace.update_pseudo_els({
								action: 'comp-styles-update',
								goToLine: TvrUi.curSelCSS
							});
						}

					}

				},
				args: []
			});
		},

		// dialog tab pressed
		dialog_tab_pressed: function($clicked){

			var $fields = $clicked.closest('.dialog-main');
			var field = '.dialog-tab-field';
			var $tabs = $fields.find('.dialog-tabs');
			var tabKey = $clicked.attr('rel');
			var tab = '.dialog-tab';
			var input = '.dialog-focus';
			var $curDialog = TvrUi.get_dialog_focus($tabs);

			TvrUi.update_tab($fields, field, $tabs, tabKey, tab, input);

			// if generated code
			if ($curDialog.attr('id') === 'display-css-code-dialog'){

				// Get the tab details
				var tabDetails = TvrUi.generatedCodeTabs.items[tabKey],
					url = tabDetails.url;

				// load stylesheet content
				if (url){

					MTsave.simple_ajax_request({
						'url': url,
						'plus': TvrLang.retrieve_css,
						'minus': TvrLang.retrieve_css_failed,
						'cbFunction': TvrUi.update_generated_code_editor,
						'cbfArgs': [tabKey, tabDetails] // data will be prepended by ajax function
					});
				}

				// client-side SCSS error editor
				else {
					var lastErrorData = TvrUi.scss_error ? TvrUi.scss_error.fullString : false,
						aceContent = lastErrorData ? lastErrorData : TvrUi.previousSCSSCompile;

					TvrUi.update_generated_code_editor(aceContent, tabKey, tabDetails);
				}

				// save last tab viewed
				//TvrUi.pref.generated_css_focus = tabKey;

				// added to the global Stylesheet or a conditional one
				/* We don't need to save this across page loads as it largely depends on whether the current selector is
				MTsave.simple_ajax_request({
					type: 'GET',
					url: TvrUi.ajaxUrl+'&generated_css_focus='+tabKey
				});*/

				// store last viewed group
				//console.log('the tab key', tabKey, parseInt(tabKey), $tabs.find(tab).length-1);
				/*if (parseInt(tabKey) !== ($tabs.find(tab).length-1)){
					MTsave.simple_ajax_request({
						type: 'GET',
						url: TvrUi.ajaxUrl+'&generated_css_focus='+tabKey
					});
					//$.get(TvrUi.ajaxUrl+'&generated_css_focus='+tabKey, function() {});
					TvrUi.pref.generated_css_focus = tabKey;
				}*/

				// auto-scroll to line if hasn't been done already
				/*var $editor = $field.find('pre').first(),
					editorID = $editor.attr('id');

				if (!MTace.generated_css_auto_line_done[editorID]){
					var editor = MTace.get_editor($editor);
					MTace.find_selector_line(editor, editorID, {
						find: MTace.current_selector_find_config($tab.data('mode'))
					}, false);
				}*/




			}


		},

		dialog_section_tab_pressed: function($clicked) {
			var $fields = $clicked.closest('.mt-dialog-section');
			var field = '.dialog-section-tab-field';
			var $tabs = $fields.find('.dialog-section-tabs');
			var tabKey = $clicked.attr('rel');
			var tab = '.dialog-section-tab';
			var input = '.dummy-for-now';

			//console.log('tab clicked', $fields, field, $tabs, tabKey, tab, input);

			TvrUi.update_tab($fields, field, $tabs, tabKey, tab, input); // skip the fields
		},

		/*** the combobox input field was clicked ***/
		combobox_clicked: function($clicked, e){ TvrCom.startT(arguments);

			if ($clicked.hasClass('sug-sel')){

				//console.log('just change the radio selection')

				// just change focus without triggering menu, which is distracting
				if (!TvrCom.isDomEl($clicked.closest('.code-suggestion.in-focus'))){
					TvrUi.sug_css_clicked($clicked);
				}


			} else {

				//console.log('trigger the combo arrow')

			    // simulate arrow click (only if has-arrows)
                var prop = $clicked.attr('rel');
                if ($clicked.hasClass('has-arrows') || $clicked.hasClass('cssfilter-combo')
                    ){
                    TvrUi.combo_arrow_clicked(false, $clicked);
                }

				// if css filter, ensure it is on
				if ($clicked.hasClass('cssfilter-combo') && prop !== 'custom_prefix'){
					TvrUi.feature_on($clicked);
				}
			}
			TvrCom.endT(arguments)
		},
		combo_arrow_clicked: function($arrow, $obj){ TvrCom.startT(arguments);

		    $obj = $obj ||
				($arrow.hasClass('cur-item-dropdown')
					? $arrow.prev('input')
					: $arrow.siblings('input')
				);

			var $input = ($obj.prop('tagName').toLowerCase() === 'input')
				? $obj
				: $obj.find('input');

			//console.log('wasOpen', $input.data('wasOpen'), $input)

			// Close if already visible
			//if ( TvrUi.wasOpen ) {
			if ( $input.data('wasOpen') ) {

				//console.log('close the combo')
				TvrUi.close_combo_menu($input);

			} else {

				//console.log('open the combo before', $arrow.hasClass('on'))
				TvrUi.open_combo_menu($input);
			}

			// if on targeting suggestion, switch focus to new option
			if ($input.hasClass('sug-sel')){
				TvrUi.sug_css_clicked($input);
			}

			//console.log('open the combo end', $arrow.hasClass('on'))

			TvrCom.endT(arguments)
		},

		open_combo_menu: function($input){

			// if not open, pass empty string as value to search for, displaying all results
			$input.MTautocomplete(); // prevents initialisation error

			// trigger focus only if needed (to prevent double event trigger)
			if (!$input.is(':focus')){
				$input.trigger('focus');
			}

			$input.MTautocomplete( "search", "" );

			TvrUi.combobox_focused($input);
		},

		close_combo_menu: function($input){
			$input
				.MTautocomplete() // prevents initialisation error
				.MTautocomplete( "close" );
		},

		// the combobox input gained focus
		combobox_focused: function($input){
			// ensure the user doesn't loose their custom units after selecting 'set'.
			if ($input.hasClass('custom_css_unit')){
				$('#css_unit_set').val('');
			}
		},



		// new 'x' to clear system
		input_clear_icon_clicked: function($clicked, filter){

			filter = filter || '';

			var $input = $clicked.siblings('input'+filter),
				M = false;

			//console.log('input_clear_icon_clicked', $input)

			// clear value and give focus so user can enter new value
			$input.val('').focus();

			// if we cleared a folder search
			if ($input.hasClass('search-folders-input')){
				TvrUi.clear_folder_search();
			}

			// if property input, get M
			if ($input.hasClass('property-input')){
				M = TvrUi.get_meta($input, 'property');
			}

			// if color picker field, get M from container
			if ($input.hasClass('sp-input-var')){
				M = TvrUi.get_related_meta('picker', $clicked.closest('.sp-container')).M;
			}

			// if we're working with CSS property
			if (M){

				var $field = M.property;

				// delete the variable field if no values
				if ($field.hasClass('has-variable-line')){

					// if line name field 'x' clicked, just close
					if ($input.hasClass('vl-name-input')){
						TvrUi.toggle_optional_input( $clicked.siblings('.toggle-optional-input') );
					}

					// if main input 'x' clicked, delete the variable field if no values
					else {

						var anyValue = false;
						$input.closest('.tvr-input-wrap').find('.property-input').each(function(){
							if ($(this).val().trim() !== ''){
								anyValue = true;
								return false;
							}
						});

						if (!anyValue){
							TvrUi.delete_variable_field($field, $input, M, true);
						}
					}
				}

				// maybe hide Google fonts field
				TvrUi.maybe_toggle_google_fonts_field($input, '');

				TvrUi.run_input_updated($input);

				//console.log('input_clear_icon_clicked', $field.attr('class'), $field, M)

			}

				/*M = $input.hasClass('sp-input-var')
					? TvrUi.get_related_meta('picker', $clicked.closest('.sp-container')).M
					: TvrUi.get_meta($input, 'property');
				$field = M.property;*/






		},

        format_combo_cat_toggle_atts: function(key){
		    return ' class="mt-ui-toggle uit-par mt-combo-toggle toggle-sampled-items toggle-'+key+'" ' +
                'data-action="toggle-sampled" ' +
                'data-dyn-tt-root="'+key+'"' +
                'data-aspect="'+key+'"';

        },

		wheelDropdown: {
			cssf: '',
			source: [],
			index: -1
		},

		valueChangeDropdown: function($input, down, menuShowing){

			//console.log('Initial index', TvrUi.wheelDropdown.index, index)

			var finalIndex = (TvrUi.wheelDropdown.source.length -1),
				index = down
					? (TvrUi.wheelDropdown.index+1)
					: (TvrUi.wheelDropdown.index-1);

			if (index < 0){
				index = finalIndex; //0;
			} else if (index > finalIndex){
				index = 0; //finalIndex
			}

			var value = TvrUi.wheelDropdown.source[index];

			if (value === Object(value)){
				value = TvrCom.isDefined(value.value) ? value.value : value.label;
			}

			//console.log('the value to add', value, index, finalIndex)

			$input.val(value);

			// if the menu is showing, move focus onto the item
			// failed to get this working - but didn't try super hard as wanted to release
			/*if (menuShowing){

				var $menu = $input.data("customMTautocomplete").menu.element,
					$menuItem = $menu.find('.ui-menu-item').eq(index);

				//console.log('showing item', $menuItem.text())
				//$menu.focus(null, $menuItem);
				//$menuItem.focus().attr( "tabIndex", 0 );
				//event.preventDefault();
			}*/

			TvrUi.maybe_sync_fields($input);

			TvrUi.wheelDropdown.index = index;

		},

		cycleDrowndownValues: function($input, e, menuShowing){

			var cssf = TvrCom.prop_to_cssf($input.attr('rel')),
				value = $input.val(),
				newCSSF = TvrUi.wheelDropdown.cssf !== cssf || !TvrCom.isDefined(value);

			//console.log('newCSSF', newCSSF)

			// update the name/source if new dropdown
			if (newCSSF){

				var source = TvrUi.resolve_combobox_source($input),
					objKey = source[1] === Object(source[1]) ? 'value' : false;

				TvrUi.wheelDropdown.source = source;
				TvrUi.wheelDropdown.cssf = cssf;

				// try to anchor from defined value or computed if no value
				var compValue = TvrUi.single_comp_value(cssf),
					startingIndex = TvrCom.isDefined(value)
					? TvrCom.in_array(value, source, false, objKey)
					: (TvrCom.in_array(compValue, source, false, objKey) !== false
						? TvrCom.in_array(compValue, source, false, objKey)
						: TvrCom.in_array(compValue, source, false, 'label'))

				//console.log('the start stuff', value, source, TvrCom.in_array(value, source))

				TvrUi.wheelDropdown.index = startingIndex !== false ? parseInt(startingIndex) : -1;

			}

			// update the input
			TvrUi.valueChangeDropdown($input, (e.deltaY > 0), menuShowing);

			// apply formatting if new input
			if (newCSSF){
				TvrUi.adjust_comp_span($input, 'after');
			}

			// save
			MTsave.ajax_save_settings({ $property: $input });

			//console.log('it is not showing', TvrUi.wheelDropdown);
		},

		lastAutocompleteResponse: [],

        // make any adjustments to the default source data (e.g. add recent for property-input)
        resolve_combobox_source: function($input, update, reflow, search){ TvrCom.startT(arguments);

            var rel = $input.attr('rel'),
                sugSel = $input.hasClass('sug-sel'),
                source = sugSel ? MTF.dom.sels.combo[rel] : TvrMT.data.prog.combo[rel];

            // custom paths returns function to support remote searches
			if (rel === 'custom_paths' || rel === 'conditional_logic'){

				TvrUi.conditionLogicSiteSearch = rel === 'conditional_logic';

				//console.log('conditionLogicSiteSearch', TvrUi.conditionLogicSiteSearch)

				return TvrUi.get_site_pages;
			}

			// npm search
			if (rel === 'npm_dependencies'){
				return MThtml.npm.searchForCombo;
			} else if (rel === 'current_npm_dependencies'){
				return Object.keys(TvrUi.pref.npm_dependencies);
			}

			// custom selector prefix
			if (rel === 'custom_prefix'){
				return TvrUi.get_custom_prefix_combo_data;
			}

			// The function to run menu
			/*else if (rel === 'run_function'){
				return MThtml.getTemplateNameComboData({
					filter: {
						key: 'category',
						value: 'jsFunction'
					},
					newItem: {
						label: 'jsFunction',
						mode: 'javascript'
					}
				});
			}*/

			else if (rel === 'recent_prompts'){
				return MThtml.filterExamplePrompts(source);
				//return MThtml.getTemplateNameComboData();
			}

			// The load Snippet menu
			else if (rel === 'load_snippet'){
				return MThtml.getRelevantSnippets($input);
				//return MThtml.getTemplateNameComboData();
			}

			// background-image uses the same gradients as mask_image
			/*else if (rel === 'background_image'){
				source = [].concat(TvrMT.data.prog.combo['mask_image']); // , TvrMT.data.prog.combo['mask_image']
				console.log('the bg source', source);
			}*/

			// shape-outside can use the same data as clip-path
			else if (rel === 'shape_outside'){
				source = [].concat(TvrMT.data.prog.combo['clip_path']); // , TvrMT.data.prog.combo['mask_image']
			}

			else if (rel === 'all_sel_suggestions'){
				return TvrUi.filter_code_suggestions;
			}

			// with CSS units, only show the ones relevant to the property being set (in preferences or via slider)
			// not needed right now
			else if (rel === 'css_length_units'){
				return MTwidget.filter_css_units(source, $input.data('prop'));
			}

			// get folders from the dom on the fly
			else if (rel === 'cur_folders'){
				return TvrUi.get_folders();
			}

			// get alternative label (orig for retarget, suggested label when auto-name is disabled, shorter label?)
			else if (rel === 'alt_label_suggestions'){
				return TvrUi.get_label_suggestions();
			}

			// display attributes in aspect list for HTML modification
			else if (rel === 'aspect'){
				return source = TvrMT.data.prog.combo['aspect'].concat(TvrMT.data.prog.combo['attribute']);
			}

            if (!source){
                source = []; //  source = [''];
            }

			//console.log('resolve should launch', source, $input, update, reflow)

            // if property input
		    if ($input.hasClass('property-input') || $input.hasClass('sp-input-var')){

                //console.log('check the root cat', rel, TvrUi.gatheredCSS['root_cat_keys'], TvrUi.gatheredCSS['root_cat_keys'][rel])

                // prepare 'Recent' values if valid style property
                var root_cat = TvrUi.gatheredCSS['root_cat_keys'][rel],
                    cssf = TvrCom.prop_to_cssf(rel),
                    lh = TvrMT.data.prog.lh[cssf],
                    defUnit = lh ? TvrUi.get_default_unit(lh.group, lh.prop) : false,
                    supportSampling = TvrUi.support_sampling(rel, $input),
                    recent = [],
                    suggestions = [],
                    sampled = [],
                    sampled_variables = [];

                //console.log('getting the source', rel, root_cat)

                if (root_cat){

                    // exception for color extra - get color data and filter so just vars
                    var recSavedRootCat = root_cat === 'color_extra' ? 'color' : root_cat,
                        ignoreNonVars = (root_cat === 'color_extra'),
                        sug_values = TvrUi.pref.my_props.sug_values;

                    //console.log('Recent raw', sug_values[recSavedRootCat]['recent']);
					//console.log('Saved raw', sug_values[recSavedRootCat]['saved']);

                    // recent and saved
                    var recentAndSaved = MTdd.sort_number_unit_strings(
                            TvrCom.uniqueArray(
                                sug_values[recSavedRootCat]['recent']
                                    .concat(sug_values[recSavedRootCat]['saved'])
                            ),
                            false,
                            rel,
                            false,
                            root_cat,
                            false,
                            ignoreNonVars
                        ),

						// copied autocomplete source
						copiedSrc = sug_values[root_cat]['copiedSrc'];

                    //console.log('sug_values', sug_values)

					// grid-area and line name should also have dynamic values based on computed
					if ((root_cat === 'grid_positions' || root_cat === 'grid_area') &&
                        TvrCom.checkObject(TvrUi.grid, ['templateAreas'])){
					    var comboKey = root_cat === 'grid_positions' ? 'implicit_names' : 'grid_areas';
						recentAndSaved = recentAndSaved.concat(TvrUi.grid.templateAreas[comboKey]);
					}

                    // all suggestions
                    var recentSavedAndCopiedSrc = MTdd.sort_number_unit_strings(
                            TvrCom.uniqueArray(
                                recentAndSaved.concat(copiedSrc)
                            ),
                            false,
                            rel
                        );


                    // source already has custom headings (e.g. font-family, animation, transition-property)
                    // have recent separately

                    if (source.length && TvrCom.comboHasInitialCats(source)){
                        suggestions = TvrUi.format_combo_suggestions(root_cat, 'suggestions', recentAndSaved);
                    }

                    // source is flat array
                    else {

                        // populate with recent, saved and copied source
                        source = TvrUi.format_combo_suggestions(root_cat, 'suggestions', recentSavedAndCopiedSrc);
                    }

                    // get sampled if property supports it
                    if (supportSampling){

                        var scssVariables = MTdd.get_scss_variables('keys');

                    	// sampled values for the given property
                        if (parseInt(TvrUi.pref.show_sampled_values)){
                            sampled = TvrUi.format_combo_suggestions(root_cat, 'sampled');
                        }

                        // all sampled variables (and Sass variables thrown in)
                    	if ((TvrUi.pref.my_props.sug_variables) // || scssVariables
                            && parseInt(TvrUi.pref.show_sampled_variables)){

                            /*var sug_variables = TvrUi.pref.my_props.sug_variables
                                ? Object.keys(TvrUi.pref.my_props.sug_variables)
                                : [];*/

                            // todo - get scss and css variable objects to pass in
                            /*if (scssVariables){
                                sug_variables = sug_variables.concat(scssVariables);
                            }
                            console.log('all the vars', sug_variables)
                            */

                            var sv = MTdd.sort_number_unit_strings(
                                Object.keys(TvrUi.pref.my_props.sug_variables),
                                false,
                                rel,
                                true,
                                root_cat,
                                defUnit
                            );

                            // apply category labels
                            sampled_variables = TvrUi.format_combo_suggestions(
                                root_cat, 'sampled_variables', sv
                            );

                        }

                    }

                }

                // first value is blank, or nothing if no items
                var initial = [];  // ['']

                // if font-family, keep Google Font... option near top
                if (rel === 'font_family'){
                    initial.push(TvrLang.google_font);
                } else if (rel === 'list_style_image' || rel === 'background_image' || rel === 'url' || rel === 'mask_image'){ // url is filter function
                    initial.push('none');
                }

					/*console.log(' initial', $.extend(true, [], initial));
			console.log(' suggestions', $.extend(true, [], suggestions));
			console.log(' copiedSrc', $.extend(true, [], copiedSrc));
			console.log(' source', $.extend(true, [], source));
			console.log(' recentAndSaved', $.extend(true, [], recentAndSaved));
			console.log(' sampled', $.extend(true, [], sampled));
*/
                // create new array from initial, suggestions, orig source (so source doesn't update orig source)
                source = initial.concat(
                    suggestions, // separate if font-family, animation-name, transition property
                    source,
                    sampled_variables,
                    sampled
                );

                // have empty item if source has no length so the menu still shows
				if (!source.length){
					source.push('');
				}

            }

		/*	console.log(' initial', $.extend(true, [], initial));
			console.log(' suggestions', $.extend(true, [], suggestions));
			console.log(' copiedSrc', $.extend(true, [], copiedSrc));
			console.log(' source', $.extend(true, [], source));
			console.log(' recentAndSaved', $.extend(true, [], recentAndSaved));
			console.log(' sampled', $.extend(true, [], sampled));*/


			TvrUi.maybeReflowCombo($input, update, reflow, search);



            //console.log('The combo source', source)

			TvrCom.endT(arguments);

		    return source;
        },

		maybeReflowCombo($input, update, reflow, source, search = ''){

			if (TvrCom.isDefined(search)){
				search = (search === 'curVal') ? $input.val() : search;
			} else {
				search = "";
			}

			// do we need to update the source for the input (e.g. after save)
			// input is already in focus and will not update source until next focus event fires
			if (update){

				$input.MTautocomplete().
				MTautocomplete( "option", "source", source); // TvrUi.resolve_combobox_source($input)
				//console.log('Combo should update', source, $input, update, reflow, search)
			}

			// do we need to trigger menu reflow (e.g. after resample of suggestions)
			if (reflow){

				$input.MTautocomplete("search", search);

				TvrUi.maybe_combo_menu_width_change($input);

				//console.log('Menu reflow', $input, update, reflow, search)

				//$input.next().trigger('click');
			}
		},

		// function that runs when some action may affect the width of the combo menu
		maybe_combo_menu_width_change: function($input){

			if ($input.hasClass('mt-slider')){

				var combo = MTlocal.get_custom_autocomplete($input),
					$menu =  $(combo.menu.element);

				/*console.log('maybe_combo_menu_width_change')
				TvrCom.callStack();*/

				// ensure slider controls match menu width (after browser has time to repaint)
				TvrCom.action_after_timeout('new_menu_width', 100, {
					item: function($menu){

						// update the menu width
						//MTwidget.stat.set.width($menu[0].scrollWidth);

						// this updated the menu width and ensured numbers line up properly
						//console.log('show the slider set again')
						MTwidget.hide_slider_set();
						MTwidget.show_slider_set($input, true);

					},
					args: [$menu]
				});

			}

		},

		format_combo_cat_label: function(sugType, root_cat){

        	var category = TvrLang[sugType];

            /*if (root_cat){
                if (sugType === 'sampled'){
                    category+= ' ('+TvrCom.prop_to_cssf(root_cat)+')';
                }
            }*/

            return category;
		},

		format_combo_suggestions: function(root_cat, sugType, data){

        	var arr = [],
				sug_vals = data ? data : TvrUi.pref.my_props.sug_values[root_cat][sugType],
				category = TvrUi.format_combo_cat_label(sugType, root_cat);

            if (sug_vals && sug_vals.length){

                for (var i = 0; i < sug_vals.length; i++) {

                	if (sug_vals[i]){

                	    var val = sug_vals[i],
                            isAlreadyObject = (val === Object(val)),
                            label = isAlreadyObject ? val.val : val,
							sug = isAlreadyObject ? $.extend(true, {}, val) : {},
                            extraKeys = {
                                label: label,
                                category: category
                            };


                	    // add label / category
                	    $.extend(true, sug, extraKeys);

                        /*var sug = {
                            label: sug_vals[i],
                            category: category
                        };*/

						arr.push(sug);
					}

                }
            }

            return arr;
		},

        add_variable_field: function($clicked, e){

		    var $field = $clicked
                    .closest('.property-tag'),
                $inputWraps = $field
                    .find('.tvr-input-wrap'),
                $lastInputWrap = $inputWraps.last(),
                lastLineName = $lastInputWrap.find('.vl-post-line-name').find('.property-input').val(),
                //newIndex = ($inputWraps.length),
                $newInputWrap = $lastInputWrap.clone(),
                $newInput = $newInputWrap
                    .find('.property-input');

            // update name
            /*$newInput.attr('name', TvrCom.replace_variable_name_attr(
                $newInput.attr('name'), newIndex
            ));*/

            // last line will be hidden, so delete, we copy it over to next one anyway
            $lastInputWrap.find('.vl-post-line-name')
                .removeClass('show-optional-input')
                .find('.property-input').val('');

            // reset classes
            $newInputWrap.find('.vl-item').removeClass('show-optional-input');

		    // clear value (unless user wants to copy value
            if (!e.shiftKey){
                $newInput.val('');
                //$newInputWrap.find('.vl-item:not(.vl-post-line-name)').find('.property-input').val('');
            }

            // copy lastLine name to first line of new set
            if (lastLineName){
                $newInputWrap.find('.vl-pre-line-name').find('.property-input').val(lastLineName);
            }


            $newInputWrap.find('.comp-style').empty(); // was .html('')

            $lastInputWrap.after($newInputWrap);

            $newInputWrap.find('.vl-main-input').find('.property-input').focus();

            // adjust scroll buttons
            TvrUi.adjust_grid_line_scroll_buttons( TvrUi.get_meta($field, 'group') );

            // save settings if new field copies value
            if (e.shiftKey){
                MTsave.ajax_save_settings({ $property: $newInput });
            }
        },

        toggle_optional_input: function($clicked){

            var $parent = $clicked.parent();

            if ($parent.hasClass('show-optional-input')){
                $parent.removeClass('show-optional-input');
            } else {
                $parent.addClass('show-optional-input');
                $parent.find('.property-input').focus();
            }

        },

        delete_variable_field: function($field, $input, M, checkVariableScroll){

            if ($field.find('.tvr-input-wrap').length > 1){

                $input.closest('.tvr-input-wrap').animate({
                    opacity: 0,
                }, 200, function() {
                    $(this).remove();
                    if (checkVariableScroll){
                        TvrUi.adjust_grid_line_scroll_buttons(M);
                    }
                });
            }
        },

        /*update_variable_field_keys: function($field){

            $field.find('.property-input').each(function(index){

                var $input = $(this);

                $input.attr('name', TvrCom.replace_variable_name_attr($input.attr('name'), index));
            })
        },*/

		get_combo_menu_from_input: function($input){
			return $( MTlocal.get_custom_autocomplete($input).menu.element );
		},

		// todo this should prob be moved to input change event conditions
		// the combobox menu item was selected or gained focus via a keybaord interaction
		combobox_item_selected: function(event, ui, $this, action){ TvrCom.startT(arguments);

		    //console.log('the combo item was selected', ui.item.value, ui, action);

		    var $field = $this.closest('.property-tag'),
				prop = $this.attr('rel'),
                value = ui.item.value,
				diffValLabelProps = [
					'mask_image',
					'background_image',
					'clip_path',
					'shape_outside',
				];

			//console.log('the combo check', value, ui.item.value, ui, action, 'color val:', $this.closest('.group-tag').find('.mt-color-picker').val());

		    if ($this.hasClass('grid-area-add')){
		        return false;
            }

			else if ($this.hasClass('search-example-prompts')){
				//console.log('It is the once', $this, value);
				MTai.addExamplePrompt($this, ui);
				return false;
			}

			else if ($this.hasClass('search-folders-input')){
				TvrUi.search_folders(value);
			}

			else if ($this.hasClass('edit-group-tab-input')){
				TvrUi.groupManagementAdjusted($this, value)
			}

			else if ($this.hasClass('mt-load-snippet')){ //  || $this.hasClass('mt-function-to-run')
				MThtml.snippetTemplateSelected(event, ui, $this, action);
				return false;
			}

			else if ($this.hasClass('mod-aspect')){
				MThtml.switchEditorMode(value);
			}

			else if (prop === 'conditional_logic'){

				var $container = $('#addLogic'),
					$hiddenInput = $('#logic-to-add'),
					exclude = $container.find('input.mt_exclude:checked').length,
					logic = ui.item.logic,
					value = exclude
						? (ui.item.exclude_logic
							? ui.item.exclude_logic
							: '!'+logic)
						: logic;

				// update the combo value so the search label is used
				ui.item.value = ui.item.label;

				//console.log('Update the textarea', value, $textarea, exclude)

				$hiddenInput.val(value);

			}

			else if ( ui.item.label !== value && TvrCom.in_array(prop, diffValLabelProps) ){

				// with mask image, we need to add the domain-specific path to the micro-themes dir
				// and wrap with url, if we are dealing with a file value
				if (value.match(new RegExp(MTdd.reg.abs_or_rel_file()))){

					/*var imageLoc = window.TVR_DEV_MODE
						? TvrUi.pluginUrl+'images/stock-min/'
						: TvrUi.microUrl;*/

					value = 'url("'+ TvrCom.root_rel_if_local(TvrUi.microUrl+'stock/'+value, true)+'")';
				}

				// save the object for the recent list to have
				//console.log('We save the special value for the recent - the whole object', $.extend(true, {}, ui.item))
				TvrUi.last_field_val_converted = {
					origVal: $.extend(true, {}, ui.item),
					adjustedStringVal: value
				};

				// the combo data needs to be set too in order for the recent value to include the url() and full path
				ui.item.value = value;

				//console.log('we should set the value', value)
			}

			// set input value first, it hasn't been set yet (for saving correctly)
			$this.val(value);

			// Adjust snippet dependency
			if ($this.hasClass('snippet-dep-adjust')){
				MThtml.npm.updateSnippetDependency($this);
			}

		    // check if hierarchy code option was selected
		    TvrUi.maybe_run_code_or_synced_label_field_edited($this, ui);

			//console.log('the input was updated', ui.item.value);

            // color variable dropdown is an alias for typing a custom color
            if ($this.hasClass('sp-input-var')){
                //var picker = TvrUi.get_related_meta('picker', $this.closest('.sp-container'));
                //$this = picker.$input;
                TvrUi.run_input_updated($this);
                return false;
            }


            // this is a quick hack to do something AFTER the value has been set on the field. The select: event is before the val is set
            // Action: scroll right for image select fields todo have a proper afterSelected event
			if ($this.hasClass('bg-image-select')) {
				setTimeout(function($this){
					TvrCom.scroll_input_end($this);
				}, 30, $this);

			}

			// just change focus without triggering menu, which is distracting
			if ($this.hasClass('sug-sel')){
				//TvrUi.sug_css_clicked($this);
				$this.closest('.code-suggestion').find('.num-els-icon-wrap')
					.html( TvrUi.num_els_icon(MTF.jquery_compat_sel_elements(value).length));
			}

			if ($this.hasClass('sec-hierarchy-input')){
				TvrUi.folderNameCustomized = true;
				//console.log('Setting folderNameCustomized', TvrUi.folderNameCustomized)
			}

			if ($this.hasClass('property-input')){

                // variable line fields can be confusing if left blank as comp values will be out of wack
                // so simplest option is to delete the field
                if ($field.hasClass('has-variable-line')){

                    //console.log('variable line field adjusted', value);

                    // delete field
                    if (value === ''){


                    }

                    // set multiple grid tracks in one go
                    else {

                        var multipleGridTracks = MTgridValues.parseGridTracks(value).lines;

                        //console.log('the lines and temps', multipleGridTracks, TvrMT.data.templates)

                        if (multipleGridTracks && multipleGridTracks.length > 1){

                            var prop = $this.attr('rel'),
                                M = TvrUi.get_meta($this, 'property'),
                                $lineContainer = $this.closest('.mt-vl-inner');

                            // delete all tvr-input-wrap el
                            $lineContainer.find('.tvr-input-wrap').remove();

                            // add first input wrap (plain from template)
                            var $inputWrap =  TvrUi.dom_replacements(
                                false,
                                'group',
                                $(TvrMT.data.templates.input_wraps[prop]),
                                'selector_section',
                                M.sectionSlug,
                                false,
                                'selector_css',
                                M.selectorSlug,
                                M.selectorH,
                                M.selectorCode,
                                M.tabSlug
                            );

                            $lineContainer.prepend($inputWrap);

                            // run map_property_values_to_field
							/*console.log(
								'Get the data',
								TvrCom.get_js_object_data(
									[M.sectionSlug, M.selectorSlug, 'styles', 'grid'], TvrUi.get_mq_focus()
								).data
							)*/

                            MTloop.map_property_values_to_field(
								{},
								TvrCom.get_js_object_data(
									[M.sectionSlug, M.selectorSlug, 'styles', 'grid'], TvrUi.get_mq_focus()
								).data,
								prop,
								$field,
								value.split(' ')
                            );

                            // reset this reference to first wrap element (as previous was deleted)
                            var $firstWrap = $lineContainer.find('.tvr-input-wrap').first();
                            if (prop.indexOf('template') > -1){
                                $this = $firstWrap.find('.vl-main-input')
                                            .find('.property-input');
                            } else {
                                $this = $firstWrap.find('.property-input');
                            }

                        }
                    }

                }


                // option may be empty, and so comp value would be reinstated
				TvrUi.adjust_comp_span($this, 'after');

				var M = TvrUi.get_meta($this, 'property');

				// Font-family change
				if (TvrUi.maybe_toggle_google_fonts_field($this, value)){
					// nothing else
				}

				// any other field change
				else {

					TvrUi.maybe_sync_fields($this);
				}

				// for when suggested values might be longer than field width
				TvrUi.update_input_width_and_scroll($this);

				// save
				MTsave.ajax_save_settings({ $property: $this, comboAction: action });
			}




            // / css unit set switcher
			if ($this.attr('id') === 'css_unit_set'){
				var val = $this.val();
				$this.closest('ul')
					.find('input.custom_css_unit')
					.val(val);
			}

			// new preview url
			if (action === 'select' && $this.attr('rel') === 'custom_paths'){

				$this.MTautocomplete( "close" );

				if ($this.attr('id') === 'testPreviewPath'){

					// save if they changed the textarea
					if (TvrUi.logicTextareaChanged){
						MTfolder.save_folder_logic($this, true);
					}

					// otherwise just test the page with the current logic
					else {
						MTfolder.test_logic_on_page(TvrUi.context_menu_data.M);
					}
				}

				// load new frontend URL
				else {
					TvrUi.change_preview_url( $this.siblings('.change-preview-url'), ui );
				}


			}

			// switching css stylesheet import url
			if ($this.attr('rel') === 'viewed_import_stylesheets'){
				$this.MTautocomplete( "close" );
                MTdd.update_import_css_preview(false, {
					c: $this.closest('.stylesheet-to-import').find('.view-import-stylesheet')
				}, 'loadNew');
			}

			// ensure a selection changed the css MT wizard uses
			if ($this.hasClass('sug-sel')){
				TvrUi.sug_sel_updated({
					val: $this.val(),
					$editedField: $this,
					comboSelected: 1,
					ui: ui
				});
			}

			// pseudo suggestion chosen
			if ($this.hasClass('cssfilter-combo')){
				TvrUi.pseudo_updated($this, {input:1});
			}

			// set $this to blur so that tooltip shows on hover (if item selected)
			if (action == 'select'){
				//$this.blur();
				// this has downside as CSS styles field when focussed.
				// And enter shortcut on e.g. export
			}

			TvrCom.endT(arguments)
		},

		maybe_toggle_google_fonts_field: function($this, value){

			if ($this.hasClass('tvr-font-select')) {

				var $cusFontField = $this.closest('.field-wrap').siblings('.tvr-font-custom');

				TvrUi.gFontTarget = $cusFontField.find('.property-input');

				if (value == TvrLang.google_font) {
					TvrUi.show_google_fonts_field($cusFontField);
				} else {
					TvrUi.hide_google_fonts_field($this, $cusFontField);
				}

				return true;
			}

			return false;
		},

        // hide and clear property values
        hide_property_fields: function($fields){
            $fields.each(function(){
                var $this = $(this),
                    $input = $this.find('.property-input');

                // clear value before hiding with animate else dom_to_data runs before value is cleared
				//console.log('hide_property_fields', $input);
                $input.val('');
                TvrUi.adjust_comp_span($input, 'after');
                //$this.css('display', 'none');
				$this.removeClass('show-event-fields');

            });
        },

		// new or existing selector suggestion clicked
		sug_css_clicked: function($clicked){ TvrCom.startT(arguments);

			// get item
			var $item = $clicked.closest('.mt-selector-suggestion');

			//console.log('sug_css_clicked', $item)

			// if not already selected
			if (!$item.hasClass('in-focus')){

				var isExisting = $clicked.hasClass('existsel-radio'),
					data = $item.data(),
					isCodeViewSel = data.type === 'hand_coded_css',
					isNewSug = !isExisting,
					$editedField = isNewSug ? $item.find('input.sug-sel') : false,
					val = isNewSug ? $editedField.val() : data.code,
					selID = isExisting ? data.id: false,
					switchedNewExisting = TvrUi.existingSelSelected !== isExisting;

				// store the new choice
				TvrUi.existingSelSelected = isExisting;

				// update interface
				TvrUi.sug_sel_updated({
					switchedNewExisting: switchedNewExisting,
					isCodeViewSel: isCodeViewSel,
					isExisting: isExisting,
					isNewSug: isNewSug,
					$editedField: $editedField,
					$item: $item,
					radioSelection: 1,
					//radioNth: $item.index(),
					val: val,
					selID: selID,
					scroll: 1
				});

			}

			TvrCom.endT(arguments)
		},

        toggle_preview_page_menu: function($clicked){

			var $menu = TvrUi.stat.settingsMenu,
				$siteSearchInput = TvrUi.stat.changeUrlInputWrap.find('input'),
				$pageHeading = TvrUi.stat.settingsMenu.children('.mt-preview_page-heading');

			// open pages panel if not already open
			if (!$pageHeading.hasClass('expanded')){
				TvrUi.toggle_expandable_panel($pageHeading);
			}


			// close settings menu if already showing
			if ($menu.hasClass('on')){

		    	TvrUi.close_combo_menu($siteSearchInput);

				TvrUi.hide_folders_or_settings('settings', 'right');
				//$menu.removeClass('on')
            }

		    // show menu if not yet showing
			else {

		    	// display the settings menu
		    	TvrUi.show_folders_or_settings('settings', 'right');

				// give focus to the site search and show menu once menu has animated in
				TvrCom.action_after_repaint({
					item: function(){
						TvrUi.open_combo_menu($siteSearchInput);
					}
				}, 270, window); // transition is 150 right now

                // todo this is going to be replaced with auto-load builder toggle
				// precheck/uncheck the launch builder checkbox is they have the builder active
				/*var $fakeCheck = $clicked.parent().find('span.fake-checkbox'),
					isAlreadyChecked = $fakeCheck.hasClass('on');

				if (MTint.anyBuilderIsActive()){
					if (!isAlreadyChecked){
                        TvrCom.check_fake($fakeCheck);
					}
				} else {
                    if (isAlreadyChecked){
                        TvrCom.uncheck_fake($fakeCheck);
                    }
				}*/


                /*TvrUi.combo_arrow_clicked(
                    TvrUi.stat.changeUrlInputWrap.find('.combo-arrow')
                )*/
            }
        },

		

		// auto scroll on drag
		/*
		 autoScroll: function(value){ TvrCom.startT(arguments);
		 var $parentDiv = $("#advanced-wizard").find('.scrollable-refined');
		 var height = 136;
		 // go to the selector in focus if dom controls have reset sel targeting
		 if (value == 'focus'){
		 var $innerListItem = $('#code-suggestions').find('li').first();
		 } else {
		 var $innerListItem = $('#code-suggestion-'+value);
		 }
		 var contactTopPosition = $innerListItem.position().top;
		 if (contactTopPosition < 13 || contactTopPosition > height-13){
		 $parentDiv.animate({scrollTop:contactTopPosition}, '500');
		 }
		 },
		 */

		// normalise clicked toggle, get aspect and state
		get_toggle_data: function($clicked, aspect){ TvrCom.startT(arguments);

			// obj can't be passed from iframe
			if (!$clicked){
				if (aspect === 'hide_interface'){
					$clicked = $('#toggle-mt-interface');
				} else if (aspect === 'hover_inspect'){
					$clicked = $('#hover-inspect-toggle');
				} else if (aspect === 'show_code_editor'){
					$clicked = $('#toggle-full-code-editor');
				} else if (aspect === 'show_text_labels'){
					$clicked = $('#mymtonoffswitch-show_text_labels').closest('.mt-ui-toggle');
				} else if (aspect === 'dock_editor_left'){
					$clicked = $('#mymtonoffswitch-dock_editor_left').closest('.mt-ui-toggle');
				} else if (aspect === 'dock_styles_left'){
					$clicked = $('#mymtonoffswitch-dock_styles_left').closest('.mt-ui-toggle');
				} else if (aspect === 'detach_preview'){
					$clicked = $('#mymtonoffswitch-detach_preview').closest('.mt-ui-toggle');
				} else if (aspect === 'show_sampled_variables' || aspect === 'show_sampled_values'){
                    $clicked = $('#'+aspect);
                } else if (aspect === 'create_additional_selector'){
					$clicked = TvrUi.stat.suggestionsAdvanced.find('.additional-selector-toggle');
				}

			} else {
				// normalise toggle el
				$clicked = $clicked.closest('.uit-par');
			}

			// for when a there is more than one toggle for a feature e.g. code view switch
			var $alias = false,
				$aliasTrigEl = false,
				$filter_scope = false;

			aspect = aspect ? aspect : $clicked.data('aspect');

			// show full code editor
			if (aspect == 'show_code_editor'){
				$aliasTrigEl = $clicked; // keep record for the purpose of updateing live tt
				$clicked = $('#toggle-full-code-editor');
				$alias = $('#code-editor-alias');
			}

			// toggle row actions - use hidden root toggle for evals
			else if (aspect == 'show_extra_actions'){
				$aliasTrigEl = $clicked;
				$clicked = $('#show_extra_actions');
			}

            // toggle row actions - use hidden root toggle for evals
            else if (aspect === 'show_sampled_variables' || aspect === 'show_sampled_values'){
                $aliasTrigEl = $clicked;
                $clicked = $('#'+aspect);
            }

			// hover inspect toggle (there is one root and 2 aliases)
			else if (aspect == 'hover_inspect'){
				$aliasTrigEl = $clicked;
				//$alias = $clicked;
				$clicked = $('#hover-inspect-toggle');
                //undefFunc(); // deliberate error
			}

			// sync selector name (just use the wizard toggle for evals)
			else if (aspect == 'selname_code_synced'){
				$aliasTrigEl = $clicked;
				$clicked = $('#selname_code_synced');
			}

			else if (aspect === 'mt_highlight'){
				$aliasTrigEl = $clicked;
				$clicked = $('#toggle-highlighting');
			}

			// editor size manually adjustable (just use the root toggle for evals)
			else if (aspect == 'code_manual_resize'){
				$aliasTrigEl = $clicked;
				$clicked = $('#code_manual_resize');
			}

			// sync css filter with fave (2 actions, fav and on/off)
			else if (aspect == 'pseudo_classes' || aspect == 'pseudo_elements'
				|| aspect == 'page_specific'){
				$filter_scope = TvrUi.stat.cssModifiers;
				$aliasTrigEl = $clicked;
				$alias = TvrUi.get_css_filter_alias($clicked, aspect);
			}

			else if (aspect === 'create_additional_selector'){
				$aliasTrigEl = $clicked;
				$clicked = TvrUi.stat.suggestionsAdvanced.find('.additional-selector-toggle');
			}

			// return eval
			var turnOn = $clicked.hasClass('on') ? 0 : 1,
				extraValue;

			// for the custom-prefix we want to store the value in the field
			var toggleData = $clicked.data();
			if (toggleData && toggleData.pref_sub_key === 'custom-prefix'){
				extraValue = $clicked.closest('.css-filter-item').find('.cssfilter-combo').val();
			}


			TvrCom.endT(arguments)
			return {
				clicked: $clicked,
				aspect: aspect,
				turnOn: turnOn,
				extraValue: extraValue,
				alreadyOn: !turnOn, // just to make this clear for myself
				$alias: $alias,
				$aliasTrigEl: $aliasTrigEl,
				$filter_scope: $filter_scope

			};
		},
		// turn interface feature on
		feature_on: function($clicked, aspect, config){ TvrCom.startT(arguments);
			config = config ? config : {};
			var tog = TvrUi.get_toggle_data($clicked, aspect);
			//console.log('feature on')

			// with e.g. keyboard highlighting, it's useful to disable wiz highlighting first
			// including here, as this may be useful for other functions
			if (config.offFirst){
				TvrUi.feature_off($clicked, aspect, config.offFirst);
				tog = TvrUi.get_toggle_data($clicked, aspect);
			}

			// turn on if not already
			if (!tog.alreadyOn){
				TvrUi.toggle_feature($clicked, aspect, config);
			}
			TvrCom.endT(arguments)
		},
		// turn interface feature off
		feature_off: function($clicked, aspect, config){ TvrCom.startT(arguments);
			config = config ? config : {};
            //console.log('feature off')
			var tog = TvrUi.get_toggle_data($clicked, aspect);
			if (tog.alreadyOn){
				TvrUi.toggle_feature($clicked, aspect, config);
			}
			// including here, as this may be useful for other functions
			if (config.onAgain){
                //console.log('enable onAgain')
				TvrUi.feature_on($clicked, aspect, config.onAgain);
			}

			TvrCom.endT(arguments)
		},
		toggle_inline_gui: function(){

			var editor = MTace.eds['adaptable-editor'];

			// builds without the code editors have no editor to switch to
			if (!editor){
				return;
			}

			// go to gui fields if shortcut used from editor
			if (editor.isFocused()){ // TvrUi.stat.tvr.hasClass('onlyInlineEditor')
				editor.blur(); // because color picker open doesn't move focus
				MTace.go_to_ui_property();
			}

			// return to editor if not in focus
			else {
				if (MTlayout.editor_and_gui()){
					TvrUi.picker_method('hide'); // hide any open color picker
					editor.focus(); // just return focus
				} else {
					TvrUi.trigger_pg_icon_click('code'); // reload
				}
			}
		},
		// A funnction might return false after DOM classes have been added, so undo
		undo_toggle_state: function(newState, aspect, $togObj, classObj, config){

			if (!config.uiCorrection){
				if (newState === 'on'){
					$togObj.removeClass('on');
					classObj.removeClass(aspect);
				} else {
					$togObj.addClass('on');
					classObj.addClass(aspect);
				}
			}

		},
		// toggle an interface feature on or off
		// dock_wizard_right, hover_inspect, hide_interface, highlight
		// mtonoffswitch includes: rulers, fullScreen, code view, draft mode
		toggle_feature: function($clicked, aspect, config){ TvrCom.startT(arguments);

			// get aspect and turnOn state
			var tog = TvrUi.get_toggle_data($clicked, aspect);
			$clicked = tog.clicked;
			aspect = tog.aspect;
			config = config ? config : {};

			// no code editor to show or dock in builds without the code editors
			if (!TvrUi.codeEditors && (aspect === 'show_code_editor' || aspect === 'dock_editor_left')){
				return false;
			}
			var turnOn = tog.turnOn,
				$filter_scope = tog.$filter_scope ? tog.$filter_scope : false,
				extraParam = '',
				pref_sub_key = $clicked.data('pref_sub_key');

			//console.log('the feature tog', $clicked, aspect, config, tog)

			// don't let MT interface collapse UI if preview is detached
			if (aspect === 'hide_interface' && TvrUi.pref.detach_preview){
				return false;
			}

			// for css filter/fav css filter
			config.pref_sub_key = pref_sub_key ? pref_sub_key : false;

			// is it a temp action? e.g. temp hide highlighting while dragging ruler
			if (config.tmp){
				TvrUi.tmp[aspect] = turnOn ? 'turnedOn' : 'turnedOff';
			}

			// allow for setting frontend class via data attribute
			config.fHTML = TvrCom.isDefined(config.fHTML) ? config.fHTML : $clicked.data('fhtml');

			// allow for noSave via data attribute
			config.noSave = TvrCom.isDefined(config.noSave) ? config.noSave : parseInt($clicked.data('no-save'));

			// iframe may want classes added to html tag too
			var classObj = (config.fHTML && TvrUi.stat.fHTML)
				? TvrUi.stat.tvr.add(TvrUi.stat.fHTML)
				: TvrUi.stat.tvr,

				// allow extra class to be inserted
				clazz = config.extraClass ? aspect+' '+config.extraClass : aspect;

			var $togObj = tog.$alias ? $clicked.add(tog.$alias) : $clicked;

			// not all have dynamic tips yet, todo make this so
			var newTip = false;

			// set up event listener for css transition end if expanding/collapsing wizard as this involves a delay
			/*if (aspect == 'wizard_expanded'){
				TvrUi.after_animation(TvrUi.stat.wiz, {
					type:'transition',
					aspect: aspect,
					turnOn: turnOn
				});
			}*/

			/*** enable interface feature ***/
			if (turnOn) {

				classObj.addClass(aspect);

				if (MTlayout.detached_window_available()){
					MTdetached.add_html_class(aspect)
				}

				$togObj.addClass('on');

				// dev time log options
				if (aspect == 'show_time_concurrently'){
					config.noSave = 1;
					TvrCom.log_concurrent = 1;
				}

				// update the tooltip if not a css filter (which explains the pseudo etc)
				if (!$filter_scope){
					newTip = $clicked.data('neg');
				}

				//  rulers
				if (aspect == 'show_rulers'){
					TvrUi.get_local_window_function('show_rulers')();
				}

				// layout switch
				else if (
					aspect === 'dock_folders_left' ||
					aspect === 'dock_styles_left' ||
					aspect === 'dock_editor_left' ||
					aspect === 'detach_preview' ||
					aspect === 'dock_wizard_right' ||
					aspect === 'dock_settings_right' ||
					aspect === 'dock_ai_right'
				){

					var side = (aspect === 'dock_ai_right' || aspect === 'dock_settings_right') ? 'right' : 'left';
					MTlayout.toggle_layout_view(aspect, turnOn, side, config);
				}

				// dock to right - move HTML to after #v-frontend-wrap
				/*else if (aspect == 'dock_wizard_right'){
					MTlayout.move_wizard_right();
				}*/

				// show suggestions menu
				else if (aspect === 'show_suggestions_menu'){
					TvrUi.show_suggestions_menu(MTF.stat.frontendControls.find('.show-suggestions-icon'));
				}

				// enable beaver builder
				else if (aspect === 'enable_beaver_builder'){

                    if (TvrUi.iframeEditing() && !config.uiCorrection){
                        MTint.activate_builder('FLBuilder');
                    }

					// get url with bb param
					/*var bbURL = TvrCom.append_url_param(TvrUi.pref.preview_url, 'fl_builder');

					// reload page so long we're not already on a BB page and the toggle was out of whack
					if (bbURL != TvrUi.pref.preview_url){

						if (MTF && !config.uiCorrection){
							MTF.stat.win.location = bbURL;
						}

						// todo this gets reset back to nonBBUrl somehow, find out why...
						TvrUi.pref.preview_url = bbURL;
						//console.log('TvrUi.pref.preview_url', TvrUi.pref.preview_url);
					}*/

                    // signal BB is currently in use with class on main UI so MT logo can be neater when turned off
                    TvrUi.stat.tvr.addClass('FLBuilder_is_on');

				}

                // enable elementor
                else if (aspect == 'activate_elementor' && !config.uiCorrection){
					if (!MTint.activate_builder('elementor', false, TvrUi.pageOrPostID)){
						TvrUi.undo_toggle_state('on', aspect, $togObj, classObj, config);
						return false;
					}
                }

                // enable oxygen
                else if (aspect === 'activate_oxygen' && !config.uiCorrection){
					if (!MTint.activate_builder('oxygen', false, TvrUi.pageOrPostID)){
						TvrUi.undo_toggle_state('on', aspect, $togObj, classObj, config);
						return false;
					}
                }

				// enable Gutenberg
				else if (aspect === 'activate_gutenberg' && !config.uiCorrection){
					if (!MTint.activate_builder('gutenberg', false, TvrUi.pageOrPostID)){
						TvrUi.undo_toggle_state('on', aspect, $togObj, classObj, config);
						return false;
					}
				}

				// enable amender modification
				else if (aspect === 'enable_modification'){
					MThtml.enableToggleUsed($clicked, turnOn);
					return false;
				}

				// Rich text
				else if (aspect === 'mt_rich_text'){
					if (!MThtml.tinymce.available()){
						TvrUi.pref.mt_rich_text = 1;
						MThtml.tinymce.bind();
						MThtml.tinymce.maybeUpdateCompToolbarOffset();
						TvrUi.refresh_comp_css();
						//console.log('Toggled MCE on')
					} else {
						//console.log('Tiny MCE already available, no toggle on')
					}
				}

				else if (aspect === 'show_snippet_adv'){
					TvrUi.expandMaxHeight($togObj.prev()[0]);
				}

				else if (aspect == 'selname_code_synced'){
					TvrUi.selname_code_synced(tog.$aliasTrigEl, turnOn);
				}

				// we have to remove all explicit height settings so user can reduce height of editor to 160px
				else if (aspect == 'code_manual_resize'){

					if (MTlayout.horizontal_only()){
						var $scope = TvrUi.stat.inlineEditor;
						$scope.css('height', TvrUi.pref.layout.editor_height.size);
						MTace.get_focus_editor().resize();
						MTlayout.toolbar_adjusted();

						//console.log('we set the editor height based previous resize', (TvrUi.pref.layout.editor_height.size))
					}

					TvrUi.close_context_menu({
						filter: '.cm-editor-options'
					});
				}

				// GUI to code view
				else if (aspect == 'show_code_editor'){

					TvrUi.cancel_draft_selector_edit(true, {
						elementAlreadySelected: 1
					});

					TvrUi.pref[aspect] = turnOn;

					MTlayout.adjust_preview_margin_and_save_config({
						side: 'left',
						skipSave: 1
					});

					TvrUi.default_to_tab('css');

					// resume cursor position and select
					if (!config.doNotAutoSelect){
						MTace.resume_editor_cursor_pos_and_select();
					}

				}

				// turn on dark theme
				else if (aspect === 'mt_dark_mode'){
					MTace.updateAllEditorsTheme('dark');
				}

				// turn on browser tab syncing (shallow integration)
				else if (aspect === 'sync_browser_tabs'){
					window.MTBroadCast.toggleSyncBrowserTabs(turnOn);
					MTsave.update_full_logs({
						'short': 'Reload other tabs!',
						'long': '<p>Browser tab syncing has been enabled, but please reload any already open tabs to ensure this change propagates.</p>',
						'type': 'info'
					});
				}

				// turn on auto-sve (and do a save)
				else if (aspect === 'auto_save_mode'){
					TvrUi.keyboard_save_action(null, 'manual');
				}

				// turn on auto-publish
				else if (aspect === 'auto_publish_mode'){

					// publish changes if any are unpublished
					if (TvrUi.pref.num_unpublished_saves > 0){
						MTsave.publish_settings();
					}

				}

				// base styles added to variation
				else if (aspect === 'pseudo_base_styles'){
					TvrUi.adjust_pseudo_base_styles(turnOn, true);
				}

				// iframe hover inspect
				else if (aspect == 'hover_inspect'){

                    // enter targeting mode
					//console.log('hover_inspect turned on');
					//TvrCom.callStack();

                    if (TvrUi.iframeEditing()){

						//console.log('iframeEditing', MTF)

                        MTF.bind_wizard_hover();
                    }

				}

				// enable fullscreen
				else if (aspect == 'fullscreen'){
					TvrCom.enable_full_screen();
				}

				// see after_animation()
				else if (aspect == 'wizard_expanded'){
					TvrUi.pref[aspect] = turnOn;
					this.wizard_expanded();
				}

				// show/hide interface
				else if (aspect == 'hide_interface'){

					MTlayout.toolbar_adjusted();

					// turn off instant hover inspection too
					TvrUi.feature_off(false, 'hover_inspect', {tmp:1, noSave:1});
				}

				// frontend highlighting
				else if (aspect === 'mt_highlight'){

                    //console.log('enable reposition highlight', config, $clicked, tog)

					if (tog.$aliasTrigEl && tog.$aliasTrigEl.hasClass('current-item-spotlight')){
						config.con = 'reg';
						config.scroll = 1;
					}

					// do we need to reposition
					if (config.con && TvrUi.iframeEditing()){
						MTF.reposition_overlays(config);
					}

					TvrUi.highlightManuallyDisabled = false;

					//TvrUi.highlightEnabled = true;
				}

				// make it easy for user to adjust nth-of-type() setting
				else if ($filter_scope && $clicked.hasClass('filter-editable')){
					$clicked.find('input.combobox').select();
				}

				else if (aspect === 'expand_all_folders'){
					TvrUi.clear_folder_search();
					TvrUi.open_close_all_folders('open');
				} else if (aspect === 'expand_all_settings'){
					TvrUi.open_close_all_settings('open');
				}

				// when enabling selector auto-name
				else if (aspect === 'selector_auto_name'){

					//  use code to update label field (unless this feature has been auto re-enabled)
					if (!config.doNotUpdateField){
						TvrUi.update_nice_name(false, TvrUi.stat.curCodeInput.val(), TvrUi.pref['selname_code_synced']);
					}

				}

				else if (aspect === 'wireframe_mode'){

				}

				// favourite_filter
				/*else if (aspect == 'favourite_filter'){
					TvrUi.filter_favourited($clicked, config, aspect);
				}*/

			}

			/*** disable interface feature ***/
			else {

				// dev time log options
				if (aspect == 'show_time_concurrently'){
					config.noSave = 1;
					TvrCom.log_concurrent = 0;
				}

				$togObj.removeClass('on');

				// css filters are a bit more involved than removing one class
				if ($filter_scope){

					if (!$filter_scope
							.find('ul.flist-'+aspect)
							.find('li.css-filter-item.on').length){
						classObj.removeClass(aspect);
					}
				} else {
					classObj.removeClass(aspect);
				}

				if (MTlayout.detached_window_available()){
					MTdetached.remove_html_class(aspect)
				}

				// update the tooltip if not a css filter (which explains the pseudo etc)
				if (!$filter_scope){
					newTip = $clicked.data('pos');
				}

				// special cases - rulers
				if (aspect == 'show_rulers'){
					TvrUi.get_local_window_function('hide_rulers')();
				}

				// layout switch
				else if (
					aspect === 'dock_folders_left' ||
					aspect === 'dock_styles_left' ||
					aspect === 'dock_editor_left' ||
					aspect === 'detach_preview' ||

					aspect === 'dock_wizard_right' ||
					aspect === 'dock_settings_right' ||
					aspect === 'dock_ai_right'
				){
					var side = (aspect === 'dock_ai_right' || aspect === 'dock_settings_right') ? 'right' : 'left';
					MTlayout.toggle_layout_view(aspect, turnOn, side, config);
				}

				// dock to top - move HTML to after #z-control
				/*else if (aspect === 'dock_wizard_right'){
					MTlayout.move_wizard_top();
				}*/

				// disable beaver builder
				else if (aspect === 'enable_beaver_builder'){

					//console.log('Instruction to deactivate BB', config, MTF)

                    if (TvrUi.iframeEditing() && !config.uiCorrection){
                        MTint.get('FLBuilder').deactivate();
                    }
                    // signal BB is currently off to return to normal MT logo position
                    TvrUi.stat.tvr.removeClass('FLBuilder_is_on');

				}

                // deactivate elementor
                else if (aspect === 'activate_elementor' && !config.uiCorrection){
                    MTint.deactivate_builder('elementor');
                }

                // deactivate oxygen
                else if (aspect === 'activate_oxygen' && !config.uiCorrection){
                    MTint.deactivate_builder('oxygen');
                }

				// deactivate Gutenberg
				else if (aspect === 'activate_gutenberg' && !config.uiCorrection){
					MTint.deactivate_builder('gutenberg');
				}

				else if (aspect === 'enable_modification'){
					MThtml.enableToggleUsed($clicked, turnOn);
					return false;
				}

				// Unbind tinyMCE
				else if (aspect === 'mt_rich_text'){
					TvrUi.pref.mt_rich_text = 0; // set immediately for subsequent functions
					MThtml.tinymce.unbind();
					MThtml.tinymce.maybeUpdateCompToolbarOffset();
					//TvrUi.refresh_comp_css();
				}

				else if (aspect === 'show_snippet_adv'){
					TvrUi.collapseMaxHeight($togObj.prev()[0]);
				}

				else if (aspect == 'selname_code_synced'){
					TvrUi.selname_code_synced(tog.$aliasTrigEl, turnOn);
				}

				// we should auto-set the height of the current editor now
				// rather than let it happen when they first type something
				else if (aspect == 'code_manual_resize'){

					if (MTlayout.horizontal_only()){

						var $pre = TvrUi.stat.adaptableEditor,
							editorID = $pre.attr('id'),
							editor = MTace.eds[editorID];

						if (editor){
							var numLines = editor.session.getLength();
							MTace.editor_update_height(editor, $pre, numLines*16);

							//console.log('we set the editor height based on the size of the content', (numLines*16))
						}
					}

					MTlayout.toolbar_adjusted();

					TvrUi.close_context_menu({
						filter: '.cm-editor-options'
					});
				}

				// hover inspect
				else if (aspect == 'hover_inspect' ){

					//console.log('hover_inspect turned off')

				    if (TvrUi.iframeEditing()){
						MTF.unbind_wizard_hover();
					}
				}

				// Code to GUI view
				else if (aspect == 'show_code_editor'){

					// reset stored code selector so highlight updates if switching back
					MTace.prev_code_selector = false;

					TvrUi.cancel_draft_selector_edit(false);

					TvrUi.pref[aspect] = turnOn;

					MTlayout.adjust_preview_margin_and_save_config({
						side: 'left',
						skipSave: 1
					});

					TvrUi.default_to_tab('mq');

					// ensure space for notification
					TvrUi.adjust_scroll_buttons( false, 'responsive');

					// switch highlighting to current selector
					if (!config.doNotAutoSelect && TvrUi.iframeEditing()){
						//console.log('select element in code view')
						MTF.select_current_selector_elements({});
					}


					//MTlayout.toolbar_adjusted();
				}

				// turn on light theme
				else if (aspect === 'mt_dark_mode'){
					MTace.updateAllEditorsTheme('light');
				}

				// turn off browser tab syncing (shallow integration)
				else if (aspect === 'sync_browser_tabs'){
					window.MTBroadCast.toggleSyncBrowserTabs(turnOn);
				}

				// disable auto-publish
				else if (aspect === 'auto_publish_mode'){

				}

				// base styles added to variation
				else if (aspect === 'pseudo_base_styles'){
					TvrUi.adjust_pseudo_base_styles(turnOn, true);
				}

				// disable fullscreen
				else if (aspect == 'fullscreen'){
					TvrCom.disable_full_screen();
				}

				// after_animation()
				else if (aspect == 'wizard_expanded'){
					TvrUi.pref[aspect] = turnOn;
					this.wizard_collapsed();
				}

				// hide suggestions menu
				else if (aspect === 'show_suggestions_menu'){
					TvrUi.hide_suggestions_menu();
				}

				// show/hide interface
				else if (aspect == 'hide_interface'){

					MTlayout.toolbar_adjusted();

					// reinstate instant inspection if it was turned off temporarily
					if (TvrUi.tmp['hover_inspect'] === 'turnedOff'){
						TvrUi.tmp['hover_inspect'] = false;
						TvrUi.feature_on(false, 'hover_inspect', {noSave:1});
					}

				}

				// frontend highlighting
				else if (aspect === 'mt_highlight'){
					//TvrUi.highlightEnabled = false;
					TvrUi.highlightManuallyDisabled = true;
				}

				else if (aspect === 'expand_all_folders'){
					TvrUi.open_close_all_folders('close');
				}  else if (aspect === 'expand_all_settings'){
					TvrUi.open_close_all_settings('close');
				}

				// favourite_filter
				/*else if (aspect == 'favourite_filter'){
					TvrUi.filter_un_favourited($clicked, config, aspect);
				}*/
			}


			/*** general actions ***/

			// update global pref JS obj too
			if (config.pref_sub_key){

				var pref_sub_key = config.pref_sub_key;

				TvrUi.pref[aspect][pref_sub_key] = turnOn;

				extraParam+= '&pref_sub_key='+pref_sub_key;

				if (tog.extraValue){
					var trimmed = tog.extraValue.trim();
					extraParam+= '&extraValue='+trimmed;
					TvrUi.pref[pref_sub_key+'-extraValue'] = trimmed;
				}

			} else {
				TvrUi.pref[aspect] = turnOn;
			}

			// adjust title if pos/neg atts have been set
			if (newTip){
				TvrUi.refresh_tt($togObj, newTip, tog.$aliasTrigEl); // maybe this isn't the right thing here
			}

			// adjust the text if a text icon (e.g. show advanced wizard options)
			// note, $clicked might have to be $togObj for other events
			if ($clicked.data('text-pos')){

				var newText = turnOn
					? $clicked.data('text-neg')
					: $clicked.data('text-pos');
				$clicked.text(newText);

			}

			// build selectors again if css filter has been adjusted (after config is updated)
			if ($filter_scope){
				TvrUi.pseudo_updated($clicked, {
					toggle:1,
					turnOn:turnOn,
					doNotSelectEl: config.doNotSelectEl,

					// we might be turning this off because another page prefix has been enabled,
					// in which case flag so we don't create an infinite loop
					turningOffOtherPagePrefix: config.turningOffOtherPagePrefix
				});
			}

			// default to computed tab if switching from right dock to top (and html/targeting were before)
			if (aspect === 'dock_wizard_right' && !turnOn){
				// default to the correct tab
				TvrUi.default_to_tab('wizard');
			}

			// code view - default to css/js tab
			else if (aspect === 'show_text_labels'){
				MTlayout.toolbar_adjusted();
			}

			// expand full row of MQ tabs
			else if (aspect === 'expand_device_tabs'){
				TvrUi.adjust_scroll_buttons( false, 'responsive');
			}

			// non-logged in content
			else if (aspect === 'mt_nonlog'){
                TvrUi.change_preview_url(
                    TvrUi.stat.settingsMenu.find('.change-preview-url'),
                    undefined,
                    true
                );
            }

            // change specificity preference (high)
            else if (aspect === 'specificity_preference'){
                TvrUi.specificity_toggled();
            }

			// run screen adjustments function is full height left/right panels settings is enabled or disabled
			else if (aspect === 'full_height_left_sidebar' || aspect === 'full_height_right_sidebar'){
				MTlayout.adjust_preview_margin_and_save_config(
					{
						skipSave: 1,
						skipPGPress: 1,
						side: aspect === 'full_height_left_sidebar' ? 'left' : 'right'
					}
				);
			}

			else if (aspect === 'whitelisted_domains'){		
				MTai.toggleDomainWhitelist($togObj, turnOn);
			}

            // save ui config across sessions unless requested otherwise
			if (!config.noSave){
			    MTsave.save_ui_toggle_update(aspect, turnOn, extraParam);
			}

			TvrCom.endT(arguments)
		},

		expandMaxHeight(el){

			// Temporarily remove max-height to allow full layout
			const previousMaxHeight = el.style.maxHeight;

			el.style.maxHeight = 'none';

			// Measure
			const height = el.scrollHeight + 'px';

			// Reset so the transition works from 0
			el.style.maxHeight = previousMaxHeight;

			// Force reflow to apply the reset
			void el.offsetWidth;

			// Now apply the real target height
			el.style.maxHeight = height;

			// Remove the max-width constraint now that the animation has finished.
			let $el = $(el);
			TvrUi.after_animation($el, {
				type:'transition',
				cb: ($el) => {
					$el.css('max-height', 'none')
				},
				justOnce: 1
			});
		},

		collapseMaxHeight(el){

			el.style.maxHeight = el.scrollHeight + 'px'; // Set current height first

			// Force reflow
			void el.offsetWidth;

			el.style.maxHeight = 0;
		},

		// High if user has set high, but not editing Gutenberg blocks
		isHighSpecificity: function(){
			return parseInt(TvrUi.pref.specificity_preference) && !TvrMT.integrate.gutenberg;
		},

		// manually update the inputs and sort the combo data
		specificity_toggled: function(){

			TvrUi.stat.suggestionsAdvanced.find('input.sug-sel')
				.add(TvrUi.stat.curCodeInput)
				.each(function(){

				var $input = $(this),
					rel = $input.attr('rel');

				// if it has combo data (not the manually adjusted input)
				if (TvrCom.isDefined(rel)){

					var rootObject = (rel === 'all_sel_suggestions')
							? TvrMT.data.prog.combo
							: MTF.dom.sels.combo,
						comboData = TvrCom.checkObject(rootObject, [rel]);

					if (comboData){

						// sort the array
						MTF.sort_selector_suggestions(comboData, TvrUi.isHighSpecificity());

						var newInputValue = TvrCom.checkObject(comboData, ['0', 'value']);

						// update the input (the top input is synced with the current radio item, so skip that one)
						if (TvrCom.isDefined(newInputValue) && rel !== 'all_sel_suggestions'){

							var isSelectedSug = $input.closest('.code-suggestion').hasClass('in-focus');

							// update menu, advanced, and curCode if currently selected item
							TvrUi.suggestion_instances({
								action: ['setInputs'],
								incCurCode: isSelectedSug,
								val: newInputValue,
								itemFilter: '.code-suggestion.refKey-'+rel
							});


							// we need to update the label too if we're on the selected item
							// and auto-naming is enabled
							if (isSelectedSug && parseInt(TvrUi.pref.selector_auto_name)){

								TvrUi.update_nice_name(
									false,
									newInputValue,
									TvrUi.pref['selname_code_synced']
								);

							}

						}
					}
				}
			});

			/*if (MTF){

				// update the suggestions
				MTF.build_selector_suggestions();

				// update the DOM
				TvrUi.update_selector_suggestions({});

			}*/

		},

		// store information about the trigger el and any callback functions for showing/closing the context menu
		context_menu_data: false,

		// toggle the context enu based on the clicked items data attributes
		toggle_context_menu_using_atts: function($clicked){
			var data = $clicked.data();
			data.$clicked = $clicked;
			TvrUi.toggle_context_menu(data);
		},

		toggle_context_menu: function(data){
			if (data.$clicked.hasClass('on')){
				TvrUi.close_context_menu();
			} else {
				TvrUi.show_context_menu(data);
			}
		},

		show_context_menu: function(data){
			MTlocal.show_context_menu(data);
		},

		close_context_menu: function(config){
			MTlocal.close_context_menu(config);
		},

		/* Trialling local functions so the same code can run in the detached window
		toggle_context_menu: function(data){
			if (data.$clicked.hasClass('on')){
				TvrUi.close_context_menu();
			} else {
				TvrUi.show_context_menu(data);
			}
		},

		show_context_menu: function(data){

			//console.log('show_context_menu data', $.extend(true, {}, data))

			var contextMenu = data.contextMenu || TvrUi.stat.contextMenu;

			// run close callbacks if another context menu was open
			if (TvrUi.context_menu_data){
				TvrUi.close_context_menu();
			}

			// update data object with content values
			data.offset = data.offset || TvrUi.default_context_menu_offset(data.$clicked, data);
			data.$content = contextMenu.find(data.filter)
			data.title = data.title || data.$content.data('title');

			// cache initial data before running callback, and some may run functions that reference TvrUi.context_menu_data
			TvrUi.context_menu_data = data;

			if (!TvrUi.maybe_run_context_menu_callback('before_open', data)){
				return false;
			}

			//console.log('browser', TvrUi.browser, offset, $menu)

			/!*!// position the parent window context menu
			// fix alignment of (parent window) menu for certain browsers - haven't checked Safari yet
			var subPixelAdjust = 0;
			if (TvrUi.browser === 'Chrome' || TvrUi.browser === 'Edge'){
				subPixelAdjust = .5;
			}*!/

			TvrCom.apply_offset(
				data.offset,
				contextMenu
			);

			// hide the first header if required
			var $header = contextMenu.children('.mt-panel-header');
			if (data.hideHeader){
				$header.addClass('header-hidden');
			} else {
				$header.removeClass('header-hidden');
			}

			// set the content menu title
			contextMenu.find('.mt-panel-title').first().text(data.title);

			// switch the content and show
			contextMenu.children().not(data.$content).removeClass('show');
			data.$content.addClass('show');

			// finally reveal the context menu
			contextMenu.addClass('show expanded');

			console.log('Adding class to menu', contextMenu, contextMenu.attr('class'))

			// add relatedto attribute if set (removed when context menu closes
			if (data.relatedto){
				//TvrUi.stat.contextMenu.attr('data-relatedto', data.relatedto);
				contextMenu.data('relatedto', data.relatedto);
			}

			// signal that the toggle was clicked
			data.$clicked.addClass('on');

			// post show callbacks
			TvrUi.maybe_run_context_menu_callback('after_open', data);

			// cache data for close actions
			TvrUi.context_menu_data = data;

		},

		close_context_menu: function(config){

			config = config || {};

			var contextMenu = config.contextMenu || TvrUi.stat.contextMenu,
				data = TvrUi.context_menu_data;

			// bail if the specific context menu content isn't showing
			if (config.filter && config.filter !== data.filter){
				return false;
			}

			//console.log('close_context_menu initial data', $.extend(true, {}, data))

			// before close callback
			if (!TvrUi.maybe_run_context_menu_callback('before_close', data)){
				//console.log('bail on before close', $.extend(true, {}, data))
				return false;
			}

			// minimise the context menu
			contextMenu
				.removeClass('show expanded')
				.data('relatedto', '');
				//.removeAttr('data-relatedto');

			// remove the active class from the trigger el
			if (TvrCom.isDomEl(data.$clicked, true, data.clickedDoc)){
				data.$clicked.removeClass('on');
			}

			//console.log('data after_close', $.extend(true, {}, data))

			// after close callback
			TvrUi.maybe_run_context_menu_callback('after_close', data);

			// reset context menu data
			TvrUi.context_menu_data = false;
		},*/

		maybe_run_context_menu_callback: function(event, data){

			var cb = TvrCom.checkObject(data, [event]),
				result = true;

			if (cb){
				result = cb.apply(this, [data]);
			}

			// all good unless callback function explicitly returns false
			return (result !== false);
		},

		default_context_menu_offset: function($clicked, data){

			var triggerOffset = $clicked.offset(),
				offsetSpacing = !data.noOffsetSpacing ? 10 : 0,
				outerWidth = $clicked.outerWidth(),
				outerHeight = $clicked.outerHeight(),
				widthOffset = !data.noWidthOffset ? outerWidth : 0,
				heightOffset = !data.noHeightOffset ? outerHeight : 0,
				flipWidthOffset = !data.noFlipWidthOffset ? outerWidth : 0,
				flipHeightOffset = !data.noFlipHeightOffset ? outerHeight : 0,
				subPixelAdjust = 0,
				yAdjust = 0,
				xAdjust = 0;

			// position the parent window context menu
			// fix alignment of (parent window) menu for certain browsers - haven't checked Safari yet
			if (TvrUi.browser === 'Chrome' || TvrUi.browser === 'Edge'){
				subPixelAdjust = .5;
			}

			var offset = {
				top: (triggerOffset.top + heightOffset + TvrCom.definedOrDefault(
					data, 'offsetSpacingTop', offsetSpacing
				)),
				left: (triggerOffset.left+subPixelAdjust + widthOffset + TvrCom.definedOrDefault(
					data, 'offsetSpacingLeft', offsetSpacing
				)),
				bottom: 'auto',
				right: 'auto'
			};

			if (data.adjustForParentWindow){

				// the offset of the iframe el inside the main MT UI
				var iframe = MTlayout.detached_window_available(true)
						? MTdetached.stat.iframe
						: TvrUi.stat.iframe,
					iframeOffset = iframe.offset(),

					// the iframe window object so we can adjust for scroll position
					iframeWin = MTF.stat.win;

				yAdjust = iframeOffset.top - iframeWin.scrollY;
				xAdjust = iframeOffset.left - iframeWin.scrollX;

				//console.log('orig top/left', top, left, iframeOffset, iframeWin, MTF.stat.win.scrollY, MTF.stat.win.scrollX);

				offset.top = offset.top+yAdjust;
				offset.left = offset.left+xAdjust;

				// for flip
				//offset.bottom = offset.bottom+yAdjust;
				//offset.right = offset.right+xAdjust;

				//console.log('adjusted top/left', top, left);
			}


			// collision detection
			// element dimensions estimate (based on max for suggestions menu)
			// the element has zero width/height before it displays, so just always flip at this point
			var heightEstimate = TvrCom.definedOrDefault(data, 'heightEstimate', 285),
				widthEstimate = TvrCom.definedOrDefault(data, 'widthEstimate', 500),
				interfaceWin = MTlayout.detached_window_available(true)
					? MTdetached.stat.win
					: TvrUi.stat.win,
				winWidth = interfaceWin.innerWidth,
				winHeight = interfaceWin.innerHeight;

			//console.log('the orig', $.extend(true, {}, offset), interfaceWin);

			// flip if bottom cut off
			if (offset.top + heightEstimate > winHeight) {

				offset.bottom = winHeight - (triggerOffset.top+yAdjust) + TvrCom.definedOrDefault(
					data, 'offsetSpacingBottom', offsetSpacing
				);

				offset.top = 'auto';

				// if the item is not cut off at the top, simply substract the difference
				if (offset.bottom + heightEstimate > winHeight) {
					let overlap =  (offset.bottom + heightEstimate) - winHeight; // -1 to make positive

					//console.log('Adjust again as bottom too high', overlap, offset.bottom, heightEstimate, winHeight, 'final', (offset.bottom - overlap + 10));

					offset.bottom -= (overlap + 10);
				}

				//console.log('flip as bottom cut off', offsetSpacing, winHeight, $.extend(true, {}, offset));
			}

			// flip if right cut off
			if (offset.left + widthEstimate > winWidth) {
				offset.right =  winWidth - (triggerOffset.left + xAdjust + outerWidth) + TvrCom.definedOrDefault(
					data, 'offsetSpacingRight', offsetSpacing
				);
				offset.left = 'auto';

				//console.log('flip as right cut off', offset.left + widthEstimate, winWidth, $.extend(true, {}, offset));
			}

			//$.extend('the pos updated', true, {}, offset)

			return offset;
		},

		// if the detached preview is active, we should show the selector suggestions in that window
		/*getMainOrDetachedSuggestionsMenu: function(){
			var contextMenu = MTlayout.detached_window_available(true)
				? MTlocal.getContextMenuEl()
				: TvrUi.stat.contextMenu

			console.log('contextMenu returned', MTlayout.detached_window_available(true), contextMenu.closest('#mt-context-menu').attr('class'));

			return contextMenu;
		},*/

		// if the detached preview is active, we should show the selector suggestions in that window
		getMainOrDetachedObj: function(){

			var winObj = MTlayout.detached_window_available(true)
				? MTdetached
				: TvrUi

			//console.log('winObj returned', MTlayout.detached_window_available(true), winObj);

			return winObj;
		},

		show_suggestions_menu: function($clicked){

			var winObj = TvrUi.getMainOrDetachedObj();

			// align the menu (top left, above selected element by default)
			winObj.show_context_menu({
				filter: '.cm-suggestions',
				//contextMenu: TvrUi.getMainOrDetachedSuggestionsMenu(),
				$clicked: $clicked,
				clickedDoc: MTF.stat.doc,
				adjustForParentWindow: 1,
				noOffsetSpacing: 1,
				noWidthOffset: 1,
				hideHeader: true // we want headers to be part of the inner content, which also displays in advanced area
			});

			TvrUi.pref.show_suggestions_menu = 1;
		},

		hide_suggestions_menu: function(){

			var winObj = TvrUi.getMainOrDetachedObj();

			winObj.close_context_menu();

			var $icon = MTF.stat.frontendControls.find('.show-suggestions-icon');
			if (TvrCom.isDomEl($icon, true, MTF.stat.doc)){
				$icon.removeClass('on');
			}

			TvrUi.pref.show_suggestions_menu = 0;
		},

		get_toggle_switch_template: function(config){

			var html = TvrUi.templates.toggle_switch
				.replace(/toggle_aspect/g, config.aspect)
				.replace('toggle_id', config.id)
				.replace('title="enable_toggle_tooltip"',  'title="'+(config.on ? config.disableTT : config.enableTT)+'"')
				.replace('data-pos="enable_toggle_tooltip"',  'data-pos="'+config.enableTT+'"')
				.replace('disable_toggle_tooltip', config.disableTT);

			if (config.on){
				html = html.replace('uit-par', 'uit-par on');
			}

			return html;
		},

		generate_selector_variations: function(contextData){

			// get the current selector and classify which state it is in
			var variations = TvrMT.data.prog.selector_variations,
				keys = Object.keys(variations),
				M = contextData.M,
				curSelCSS = TvrCom.custom_to_non_escaped(TvrUi.curSelCSS),
				statePattern = /(?:(:hover|:focus|::?before|::?after))$/,
				stateMatch = curSelCSS.match(statePattern),
				currentState = 'normal',
				existingSels = TvrUi.get_all_selector_code(true, true),
				data = {},

				html = '<div class="selector-variation-items fake-radio-parent">',
				curVarRootLabel;

			if (stateMatch){
				currentState = stateMatch[1]; // || stateMatch[2];
			}

			// loop all states collecting data on initial pass (we want curVarRootLabel for 2nd pass)
			for (var i = 0; i < keys.length; i++) {

				var key = keys[i],
					varSlug = key.replace('::', ''),
					variationCode,
					isCurrentState = key === currentState;

				data[key] = {
					label: variations[key].label
				};

				// for the current, we know we have an existing selector
				if (isCurrentState){
					variationCode = M.selectorCode;

					if (!curVarRootLabel){
						curVarRootLabel = M.selectorH.replace(/ \(.+?\)$/, '');
					}

					data[key] = {
						code: variationCode,
						existing: {
							'id': TvrUi.selInFocusID.replace(/^opts-/, 'strk-'),
							'sName': M.selectorH
						}
					}
				}

				// if we're not on the current state, which already has a selector
				else {

					// format new variation
					switch (key){
						case 'normal':
							variationCode = curSelCSS.replace(statePattern, '');
							break;
						case ':hover':
						case ':focus':
						case '::before':
						case '::after':

							// append if non-state
							if (currentState === 'normal'){
								variationCode = curSelCSS + key;
							}

							// else replace other state
							else {
								variationCode = curSelCSS.replace(statePattern, key);
							}

						break;
					}

					// store new variation
					data[key].code = variationCode;

					// check for existing selectors for other states
					for (var id in existingSels) {
						if (existingSels.hasOwnProperty(id)) {

							var item = existingSels[id];

							//console.log('checking the existing', item.id, variationCode, item.code, item)

							// note, we exclude full code selectors
							// - just to make less complicated for beta MT7 release
							if (item.type !== 'hand_coded_css' && variationCode === item.code){
								item.id = id;
								data[key].existing = item;
							}
						}
					}
				}

				data[key].isCurrentState = isCurrentState;
				data[key].variationCode = variationCode;


			}

			for (i = 0; i < keys.length; i++) {

				key = keys[i];
				isCurrentState = data[key].isCurrentState;
				variationCode = data[key].variationCode;

				// build the HTML for the options
				var radio = TvrMT.data.templates.variation_radio,
					itemClass = isCurrentState ? ' in-focus' : '',
					title = variationCode,
					atts = 'data-code="'+TvrCom.regular_escape_quotes(variationCode)+'" data-key="'+key+'"',
					baseStyles = isCurrentState ? TvrUi.get_base_styles_switch(key) : '';

				if (curVarRootLabel){
					atts+='data-rootlabel="'+TvrCom.escapeHTML(curVarRootLabel)+'"';
				}

				if (data[key].existing){
					itemClass+= ' variation-exists';
					title += ' ('+data[key].existing.sName+')';
					//var selID = data[key].existing.id.replace(/^opts-/, 'strk-');
					atts+= 'data-id="'+data[key].existing.id+'"';
				}

				//atts+= ' title="'+title+'"';

				html+=
					'<div class="mt-variation-item mt-variation-item-'+varSlug+' mt-variation-option '+itemClass+'" '+atts+'>'+
					radio +
					'<span class="variation-label mt-variation-option" title="'+TvrCom.regular_escape_quotes(title)+'">'+variations[key].label+'</span>' +
					baseStyles +
					'</div>';

			}

			// finish wrapper
			html+= '</div>';

			// Add an option to save the selector - would need to display conditionaly (upon selection)
			//html+= '<span class="tvr-button save-draft-selector">Save selector</span>';

			// update the DOM HTML
			contextData.$content.find('#mt-selector-state-options').html(html);

			//console.log('variation data', data, M, variations);

		},

		// format the base styles switch (just displays on the current variation)
		get_base_styles_switch: function(key){

			var aspect = 'pseudo_base_styles';

			//console.log('get_base_styles_switch', aspect, TvrUi.pref[aspect], parseInt(TvrUi.pref[aspect]))

			return key === '::before' || key === '::after'
				? '<span class="mt-variation-styles">' +
				'	<span>'+TvrLang.base_styles+'</span>'+TvrUi.get_toggle_switch_template({
					on: TvrUi.pref[aspect],
					aspect: aspect,
					id: aspect,
					enableTT: TvrLang.add_base_styles,
					disableTT: TvrLang.remove_base_styles,
				})+
				'</span>'
				: '';
		},

		switch_selector_variation: function($clicked){ TvrCom.startT(arguments);

			var $item = $clicked.closest('.mt-variation-item');

			// bail if the item is already selected
			if ($item.hasClass('in-focus')){
				return false;
			}

			var	dataAtts = $item.data(),
				key = dataAtts.key,
				pseudoClass = TvrCom.convert_to_param(key, ''),
				baseStyles = TvrUi.get_base_styles_switch(key);

			// update radio selection
			$item.addClass('in-focus').siblings().removeClass('in-focus');

			// clear the filters
			TvrUi.clear_css_filters(true);

			// remove any baseStyles switch from other variations
			$item.siblings().find('.mt-variation-styles').remove();

			// add the baseStyles switch if before / after
			if (baseStyles){
				$item.append(baseStyles);
			}

			//console.log('switch_selector_variation', dataAtts, $clicked, $item)

			// if we already have a selector for the state, go to it
			if (dataAtts.id){

				//console.log('resuming existing selector', dataAtts.id)

				// tap into resume/set even though we know we are resuming as this will clear previous drafts
				TvrUi.resume_existing_or_set_draft_selector(false, {}, {
					existingSelector: {
						id: dataAtts.id,
					},
					forceResume: true,
					switchSelVariation: 1
				})
			}

			// create new/update draft selector
			else {

				// set the current pseudo state if :hover or :focus
				//TvrUi.toggle_feature( TvrUi.stat.cssModifiers.find('.filter-'+pseudoClass) );
				TvrUi.feature_on(
					TvrUi.stat.cssModifiers.find('.filter-'+pseudoClass),
					undefined,
					{
						doNotSelectEl: true
					}
				);

				// open the create additional selector fields in advanced targeting
				TvrUi.feature_on(false,'create_additional_selector');

				//console.log('Creating new draft selector', dataAtts.code)

				// set the root label plus the variation in brackets if we have a label set on normal
				if (dataAtts.rootlabel){
					TvrUi.disable_selector_auto_name();
					var varLabel = dataAtts.rootlabel+' ('+key+')';
					TvrUi.update_nice_name(varLabel, false); //, TvrUi.pref['selname_code_synced']
					//console.log('we set the var name from the label', varLabel)
				}

				TvrUi.sug_sel_updated({
					val: dataAtts.code,
					stateSelectorSet: 1,
					addPseudoBaseStyles: (key === '::before' || key === '::after') ? key : false,
					switchSelVariation: 1,
					// prevent reposition_overlays running more than necessary
					// it will run after base styles have been added
					doNotRepositionOverlays: 1
				});

			}

			TvrCom.endT(arguments);

		},

		adjust_pseudo_base_styles: function(add, incStarter){

			var M = TvrUi.get_selector_in_focus(),
				selector = MTloop.get_selector_data(M).data,
				widthUnit = TvrUi.get_default_unit('dimensions', 'width'),
				heightUnit = TvrUi.get_default_unit('dimensions', 'height'),

				coreStyles = {
					behaviour: {
						content: {
							value: '" "'
						}
					}
				},

				starterStyles = {
					background: {
						background_color: {
							value: 'rgb(255, 192, 203)' // pink
						}
					},
					dimensions: {
						width: {
							value: "20",
							unit: 'px'
						},
						height: {
							value: "20",
							unit: 'px'
						}
					},
					behaviour: {
						display: {
							value: "inline-block"
						}
					}
				},

				styles = incStarter
					? $.extend(true, coreStyles, starterStyles)
					: coreStyles;


			//console.log('adjust_pseudo_base_styles (selector before)', $.extend(true, {}, selector));


			// loop the styles - updating the selector data where appropriate
			var groups = Object.keys(styles);

			for (var i = 0; i < groups.length; i++) {

				var groupSlug = groups[i],
					group = styles[groupSlug],
					props = Object.keys(group);

				for (var j = 0; j < props.length; j++) {

					var propSlug = props[j],
						newData = group[propSlug],
						existing = TvrCom.checkObject(selector, ['styles', groupSlug, propSlug]),
						existingValue = existing ? existing.value : undefined,
						existingUnit = existing ? existing.unit : undefined;

					// if we are adding, only do so if a value hasn't already been set for the property
					if (add && !existing){
						TvrCom.updateObject(selector, ['styles', groupSlug, propSlug], $.extend(true, {}, newData))
					}

					// if we are removing the starter styles, only do so if the MT starter value hasn't been customised
					else if (!add
						&& newData.value === existingValue
						&& newData.unit === existingUnit
						&& propSlug !== 'content' // never strip content
					){
						delete selector['styles'][groupSlug][propSlug];
					}

				}

			}

			// run group to CSS
			var doRecurse = M.tabSlug !== 'all-devices',
				settings = {
					savePackage: [],
					keepAsDraft: true,
					doNotRepositionOverlays: 1
				};

			settings = MTloop.modify_main_js_object('group_to_css', settings, {
				M: M,
				domDepth: 'group',
				mq_key: M.tabSlug,
				incRecurse: doRecurse,
				onlyRecurse: doRecurse,
				recurse_key: ['m_query']
			});

			// with Sass, the style node does not update until a compile is run,
			// ajax_save_settings will trigger the compile (and do some logic for getting references beforehand)
			// keepSelectorAsUnsavedDraft means the data won't actually save
			if (TvrUi.client_scss){
				MTsave.ajax_save_settings({
					keepSelectorAsUnsavedDraft: 1,
					settings: settings,
					serialise: true // to overcome max input vars limitation
				});
			}

			// reload the current style options to show update
			TvrUi.trigger_pg_icon_click(M.groupSlug);

			// we also need to update the editor if that is showing
			// live update code editor if showing
			if (MTlayout.editor_and_gui()){
				//console.log('live update the editor', M);
				MTace.gui_to_editor(false, M, 'property');
			}

			// update the blue dots to show any styles that have been added
			settings = TvrUi.js_check_values(settings, M);

			//console.log('adjust_pseudo_base_styles - selector after', add, $.extend(true, {}, selector), settings);
		},


		// showing advanced wizard options
		wizard_expanded: function(){

			// adjust toolbars
			//MTlayout.toolbar_adjusted();

			// default to the correct tab
			TvrUi.default_to_tab('wizard');

			// ensure advanced panes are up to date
            //console.log('it was expanded')
			TvrUi.maybeUpdateInspectorPanels({
				updateComputed: 1,
				updateStyles: 1,
				updateHTML: 1,
				//forceHTMLUpdate:1,
				//updateVisEditor:1 // force a refresh of the HTML, classes don't live update currently
			});

			// ensure the editor fills the available height
			/*var editor = MTace.eds.wizard_inspector_html;
			if (editor){
				editor.resize();
			}*/

			//console.log('wizard was expanded', editor);



			// listen for changes in dom (when wizard is collapsed)
			//MTF.maybe_start_mutation_observer();

			// unbind
			//$el.off(events);
		},

		// the advanced wizad options were collapsed
		wizard_collapsed: function(){


		},

		// run JS function after CSS3 animation finishes
		after_animation: function($el, config){

			var events = config.type === 'transition'
				? 'transitionend.tvr webkitTransitionEnd.tvr oTransitionEnd.tvr otransitionend.tvr MSTransitionEnd.tvr'
				: 'oanimationend.tvr animationend.tvr webkitAnimationEnd.tvr';

			$el.on(events, function(event) {

				/*if (config.aspect == 'wizard_expanded'){

					this.wizard_expanded();

				}*/

				//console.log('after_animation', event);



				// elementor sidebar adjusted
				var elementorSizebarProperty = TvrMT.integrate.elementor.newResponsiveMode ? 'margin-left' : 'left';
				if (config.aspect === 'elementorLeftPanelAdjusted'
					&& (event.originalEvent.propertyName === elementorSizebarProperty
						|| event.originalEvent.propertyName === 'width')
				){
                    //console.log('left panel event', event);
					MTint.builderLeftPanelAdjusted('elementor', true);
                }

				// Elementor preview width adjusted
				else if (config.aspect === 'elementorRightPanelAdjusted'){
					if (event.originalEvent.propertyName === 'width'){
						//console.log('right panel event', event.originalEvent.propertyName, event);
						MTint.builderRightPanelAdjusted(
							'elementor',
							TvrMT.integrate.elementor.doUpdatePreviewForRightPanel()
						);
					}

				}

				else if (config.cb){
					let args = config.args || [];
					args.push($el, event, config);
					config.cb.apply(this, args);
				}

				if (config.justOnce){
					$el.off(events);
				}

			});
		},



		// selname synced with code, either via wizard or selector edit form
		selname_code_synced: function($clicked, turnOn){

			var con = $clicked.attr('id') == 'selname_code_synced' ? 'wizard' : 'existing-sel',
				disabled = turnOn ? true : false,
				code = (con == 'wizard')
					? TvrUi.stat.curCodeInput.val()
					: $clicked.closest('.mt-folder-form').find('.selector-css-textarea').val();

			// update wizard or selector field (if a value exists)
			if (code){

				var M = (con === 'wizard')
						? TvrUi.get_selector_in_focus()
						: TvrUi.context_menu_data.M

				TvrUi.doNotResizeInputs = true;
				// make the ensure unique function ignore the current selector label
				if (M){
					TvrUi.ignoreSelector = M.sectionSlug+'-'+M.selectorSlug;
				}

				//console.log('we have M for the selector being toggled', M);

				if (con === 'wizard'){
					TvrUi.update_nice_name(false, code, disabled);
					//TvrUi.get_nice_name(code, true, disabled);
					//$('#sel-hierarchy-input').prop('disabled', disabled)
				} else {
					// using return false on .selector-css-textarea, so no need to manage lots of .prop('disabled')
					$clicked.closest('.mt-folder-form')
						.find('input.selector-name-input')
						.val( TvrUi.format_nice_name(code, disabled) );
				}

				// reset the ignore selector flag
				TvrUi.ignoreSelector = false;
				TvrUi.doNotResizeInputs = false;
			}


		},

		// a filter has been favourited, copy to area
		filter_favourited: function($clicked, config, aspect){
			/*var $copy = $clicked.closest('li').clone(true, false);
			$copy.removeAttr('title');
			$('#fav-filters').append( $copy ).hide().fadeIn('fast');*/
		},

		// a filter has been unfavourited, remove
		filter_un_favourited: function($clicked, config, aspect){
			/*var fClass = TvrUi.pseudo_class_format($clicked.closest('li').data('pref_sub_key'));
			$('#fav-filters').find('li.'+fClass).fadeOut('fast', function(){
				$(this).remove();
			});*/
		},

		// programmatically set screen width based on device preview
		toggle_screen_preview: function($obj){ TvrCom.startT(arguments);
			// normalise object
			$obj = $obj.closest('li.mt-screen-preview');
			if ($obj.hasClass('clicked')){
				TvrUi.get_local_window_function('unset_screen_preview')($obj, 'clicked')
			} else {
				TvrUi.get_local_window_function('set_screen_preview')($obj, 'clicked')
			}
			TvrCom.endT(arguments)
		},

		/*** screen width was adjusted, highlighting needs to be redone  ***/
		screen_width_adjusted: function(con, wizPanelsConfig){ TvrCom.startT(arguments);

			if (TvrUi.iframeEditing()){

			    TvrUi.post_screen_width_adjusted(con, wizPanelsConfig);

                // maybe just needed for Chrome, but need to test others (FF doesn't need)
                // chrome doesn't finish repaint until 550ms, which seems a long time.
                // Check back if this is still necessary (Chrome may change that behaviour)
			    TvrCom.action_after_timeout('screen_width_adjusted', 550, {
                    item: TvrUi.post_screen_width_adjusted,
                    args: [con, wizPanelsConfig]
                });
			}

			TvrCom.endT(arguments)
		},

        // run tasks after the screen width has been adjusted, chrome needs a big delay for repaint
        // but other browsers (e.g. firefox) don't
        post_screen_width_adjusted: function(con, wizPanelsConfig){

            wizPanelsConfig = wizPanelsConfig ? wizPanelsConfig : {
				updateComputed: 1,
				updateStyles: 1
			};

            //console.log('the screen width was adjusted', con, wizPanelsConfig);

            // switches onto same element after adjusting for screen size
            MTF.reposition_overlays({con: con, scroll:0});

            // also need to refresh the comp CSS because dormant media query rules might be invoked
            MTF.getAndUpdateCompStyles(false, false);

            // update wizard panels that are in view
            if (!wizPanelsConfig.skip){
                TvrUi.maybeUpdateInspectorPanels(wizPanelsConfig);
            }

        },


		/*** map formatted values onto compProps  ***/
		map_formatted_comp: function(exc, con, mapCon, cp, a, curVal, htmlString, mapArray, intelli){ TvrCom.startT(arguments);
			// which comp css array should be cloned?
			if (intelli){
				var mappedArr = TvrUi.intelliCompProps;
			} else {
				var mappedArr = TvrUi.compProps;
			}
			// direct mapping (without array)
			if (mapCon == 'straight') {
				if (con == 'var') {
					mappedArr[exc[cp]] = curVal;
				} else {
					if (a == 0) {
						mappedArr[exc[cp]] = [];
					}
					mappedArr[exc[cp]][a] = [];
					mappedArr[exc[cp]][a]['val'] = curVal;
					mappedArr[exc[cp]][a]['htmlString'] = htmlString;
				}
			}
			// mapping with array
			if (mapCon == 'array') {
				var i = -1;
				var arr = exc[cp];
				for (var k in arr) {
					if ( ! arr.hasOwnProperty(k) ) continue; // for compat
					if (con == 'var') {
						mappedArr[arr[k]] = mapArray[++i];
					} else {
						// define css prop as new array if not already
						if (a == 0) {
							mappedArr[arr[k]] = [];
						}
						mappedArr[arr[k]][a] = [];
						mappedArr[arr[k]][a]['val'] = mapArray[++i];
						mappedArr[arr[k]][a]['htmlString'] = htmlString;
					}
				}
			}
			// return updates values to global array
			if (intelli){
				TvrUi.intelliCompProps = mappedArr;
			} else {
				TvrUi.compProps = mappedArr;
			}
			//console.log(TvrCom.print_r(TvrUi.compProps));
			//console.log(TvrUi.intelliCompProps);
			TvrCom.endT(arguments)
		},
		/*** update the compProps object with formatted exceptions  ***/
		format_exceptions: function(exc, cp, val, a, con, intelli){

			var curVal,
				htmlString;

			// get the value depending on the var/object context
			if (con == 'var') {
				curVal = val;
			} else {
				//console.log('debug', a, val[a], val)
				if (val[a]){
					curVal = val[a]['val'];
					htmlString = val[a]['htmlString'];
				}
			}
			// with ie9 curVal may be null or undefined - bail
			if (!TvrCom.hasValue(curVal)){
				return false;
			}

			// for some values it's a straight substitution
			if (cp == 'font-family'
				|| cp == 'display'
                || cp == 'grid-template-areas'
				|| cp == 'list-style-type'
				|| cp == 'border-top-left-radius'
				|| cp == 'border-top-right-radius'
				|| cp == 'border-bottom-right-radius'
				|| cp == 'border-bottom-left-radius') {
				TvrUi.map_formatted_comp(exc, con, 'straight', cp, a, curVal, htmlString, [], intelli);
			}
			// text/box-shadow need simple split om spaces
			else if (cp == 'text-shadow' || cp == 'box-shadow') {
				//console.log(exc, con, 'array', cp, a, curVal, htmlString, TvrCom.print_r(mapArray), intelli);
				var mapArray = curVal.match(/(-?\d+px)|(rgba?\(.+\))/g);
				// if there is no shadow (none or NaNpx), populate empty fields with defaults
				if (!mapArray){
					mapArray = [0, 0, 0, 'none'];
					if (cp == 'box-shadow'){
						mapArray[3] = 0;
						mapArray[4] = 'none';
						mapArray[5] = '';
					}
				}
				// else we got some values
				else {
					/*
					 IE: reports in order specified so if Microthemer: x y blur [spread] color [inset]
					 Chrome, Safari, FF, Opera: color x y blur
					 */
					if (TvrUi.browser != 'MSIE'){
						var x = mapArray[1],
							y = mapArray[2],
							color = TvrCom.replace_decimals(mapArray[0], 1), //for rgba opacity
							blur = mapArray[3];
						if (cp == 'text-shadow'){
							mapArray = [x, y, blur, color];
						} else if (cp == 'box-shadow'){
							var spread = mapArray[4],
								inset = mapArray[5];
							mapArray = [x, y, blur, spread, color, inset];
						}
					}
				}
				TvrUi.map_formatted_comp(exc, con, 'array', cp, a, curVal, htmlString, mapArray, intelli);
			}
			// list-style-image needs to be basenamed
			else if (cp == 'list-style-image') {
				TvrUi.map_formatted_comp(exc, con, 'straight', cp, a, TvrCom.basename(curVal), htmlString, [], intelli);
			}

			// bg image and gradient need teasing apart
			else if (cp == 'background-img-full') {

				var bgArr = [];
				// get bg image
				bgArr[0] = TvrCom.extract_str('bg-image', curVal);
				// get gradient
				var gStr = TvrCom.extract_str('gradient', curVal);
				if (gStr) {
					var gr = /gradient\((.+)\)/.exec(gStr);
					if (gr){
						// E.g.
						// Webkit rgb(59, 63, 45), rgb(163, 35, 35) 50%, rgba(169, 41, 41, 0)
						// Firefox 180deg, rgb(59, 63, 45), rgb(163, 35, 35) 50%, transparent

						//var grArr = gr[1].split(/\D, /g);
						// save the original gradient string
						var origGradient = gr[1];
						// define a regex that will extract these: rgb(169, 41, 41, 0)
						var regex = /rgba?\([^)]+\)/g;
						// save all the rgb/a values in an array
						var rgbs = TvrCom.get_all_matches(origGradient, regex, 0);
						// replace all the rgb values with xxx to make the following regex easier
						var tmpGradient = TvrCom.replace_all_matches(origGradient, rgbs, 'xxx');
						var grArr = tmpGradient.split(', ');
						// convert the angle to desc if possible, check for webkit conversion
						var webkit = '';
						if (curVal.indexOf('webkit') >= 0) {
							webkit = 'webkit-';
						}
						// webkit may not report gradient as first array item (if not set) - check
						var grDesc = 'top to bottom'; // the default gradient applies
						var gradGiven = false;
						var gradey = 0;
						var numKey = 0;
						if (grArr[0].indexOf('deg') > -1) {
							grDesc = exc['keys'][webkit+'gradient-angle'][grArr[0]];
							gradGiven = true;
							numKey = 1; // this will be auto-incremented to 0 when rendered
						}
						bgArr[1] = grDesc;

						// determine color values
						bgArr[2] = rgbs[gradey]; // gradient a

                        // if length is 4 and gradient given or length 3 and not, a stop was used
						if ( (gradGiven && grArr.length > 3) || (!gradGiven && grArr.length > 2) ) {
							var stop = grArr[++numKey].split(' ');
							bgArr[3] = rgbs[++gradey];
							bgArr[4] = stop[1];
							bgArr[5] = rgbs[++gradey];
						}

						// else just a regular 2-color gradient
						else {
							/*bgArr[3] = 'none';
							bgArr[4] = '0';
							bgArr[5] = rgbs[++gradey];*/
                            bgArr[3] = rgbs[++gradey];
                            bgArr[4] = '0';
                            bgArr[5] = 'none';
						}
					}
					// ie9 may be using pie/svg so report problem
					else if (gStr.indexOf('svg') > -1) {
						bgArr[1] = 'IE9 can\'t report';
						bgArr[2] = 'IE9 can\'t report';
						bgArr[3] = 'IE9 can\'t report';
						bgArr[4] = 'IE9 can\'t report';
						bgArr[5] = 'IE9 can\'t report';
					}

				}
				// else no gradient, just bg image value
				else {
					bgArr[1] = 'none';
					bgArr[2] = 'none';
					bgArr[3] = 'none';
					bgArr[4] = '0';
					bgArr[5] = 'none';
				}
				// map values onto comp CSS
				TvrUi.map_formatted_comp(exc, con, 'array', cp, a, curVal, htmlString, bgArr, intelli);
			}
			// do we still need this exception?
			else if (cp == 'background-position') {
				var tmp = curVal.split(', ');
				var cusPoss = tmp[0].split(' ');
				// convert the position from % to desc if possible
				var posDescX = exc['keys']['background-position-x'][cusPoss[0]];
				var posDescY = exc['keys']['background-position-y'][cusPoss[1]];
				var posX = posDescX ? posDescX : cusPoss[0];
				var posY = posDescY ? posDescY : cusPoss[1];
				// resolve newVal and reform x/y into an array
				var newVal = posX+' '+posY;
				var cusPosArray = [posX, posY];
				// do straight map for background-position value
				TvrUi.map_formatted_comp(exc, con, 'straight', cp, a, newVal, htmlString, [], intelli);
				// also do array map for custom values (can i scrap this now?)
				//TvrUi.map_formatted_comp(exc, con, 'array', 'background-position-custom', a, curVal, htmlString, cusPosArray, intelli);
			}
			// other bg values also need separating from possible gradient values
			else if (cp == 'background-repeat' || cp == 'background-attachment'
				|| cp == 'background-size' || cp == 'background-clip') {
				var tmp = curVal.split(', ');
				TvrUi.map_formatted_comp(exc, con, 'straight', cp, a, tmp[0], htmlString, [], intelli);
			}
		},
		/*** filter global css obj for excpetions  ***/
		filter_css_exceptions: function(intelli){ TvrCom.startT(arguments);
			//console.log(TvrCom.print_r(TvrUi.compProps));
			if (intelli){
				var rawComps = TvrUi.intelliCompProps;
			} else {
				var rawComps = TvrUi.compProps;
			}
			var exc = TvrMT.data.prog.propExc;
			var i = 0;
			for (var cp in rawComps) {
				if ( ! rawComps.hasOwnProperty(cp) ) continue; // for compat
				++i;
				var val = rawComps[cp];
				if ( val === Object(val) ) {
					for (var a in val) {
						if ( ! val.hasOwnProperty(a) ) continue; // for compat
						TvrUi.format_exceptions(exc, cp, val, a, 'obj', intelli);
					}
				} else {
					TvrUi.format_exceptions(exc, cp, val, '', 'var', intelli);
				}
			}
			TvrCom.endT(arguments)
			return i; // num elements
		},

		// comp props is sometimes an array of mixed values [{ htmlString: '', val: val }]
		single_comp_value: function(cssf){

			var value = TvrUi.compProps[cssf];

			if (Array.isArray(value)){
				//console.log('We have an array', $.extend(true, [], value));
				value = value[0].val;
				//console.log('The extracted value', value);
			}

			return value;
		},

		/*** show computed CSS over form fields  ***/
		/*refresh_comp_css_orig: function($sel){ TvrCom.startT(arguments);

			//console.log('refresh_comp_css');
			//TvrCom.callStack();

			if (!TvrUi.iframeEditing()){
				TvrCom.endT(arguments)
				return false;
			}

			var selPassedIn = !!$sel;

			$sel = $sel ? $sel : $('#'+TvrUi.selInFocusID);

			if (!selPassedIn && !TvrCom.isDomEl($sel)){
				TvrCom.endT(arguments)
				return false;
			}

			// mixed comp styles were analysed in frontend script. Now take care of exceptions (e.g. gradient)
			var i = TvrUi.filter_css_exceptions(false);

			//console.log('sel we got', i, $sel, TvrCom.isDomEl($sel), TvrCom.isDomEl($sel, true))

			// we have a sel in focus so anchor M to it
			//var M = TvrUi.get_meta($sel, 'selector');

			// if sel not targeting anything
			if (i < 1) {
				var nullAlert = TvrLang.null_selector;
				// reset the label tooltip
				$sel.find('.option-value').text(nullAlert);
				//$sel.find('input.property-input, select.property-input').attr('title', inpTitle);
				$sel.find('div.field-wrap').removeClass('mixed-cp').find('span.comp-style').text('');
				TvrCom.endT(arguments)
				//console.log('bail comp as i is under one');
				return;
			}


			// update computed style spans

			// just update pg in focus
			var validFields = 'div.field-wrap:not(.tvr-editor-area)',
				$scope = TvrUi.pref.pg_focus
					?  $sel.find('li.group-tag-'+TvrUi.pref.pg_focus).find(validFields)
					:  $sel.find(validFields),
				nth_focus = TvrUi.get_nth_focus();

			//console.log(TvrCom.print_r(TvrUi.compProps), $scope);

			$scope.each(function(index) {

				var $field = $(this);

				if ($field.hasClass('group-label') || $field.hasClass('sub-label')){
					return;
				}

				//console.log('vrUi.grid', TvrUi.grid );

				var $optionLabel = $field.find('.option-label');
				var $optionValue = $field.find('.option-value');
				var propKey = $optionLabel.text();
				var $cSty = $field.find('span.comp-style');
				var $input = $field.find('.property-input');
				var inputVal = $input.val();
				var arr = $cSty.attr('class').split(' ');
				var key = arr[1].replace('cprop-', ''),
					cssf_maybe_alias = key;
				var prop_slug = $optionLabel.data('prop'),
					isGridItemProp = TvrMT.data.prog.pg_tab_props.grid.griditems[prop_slug],
					isGridAllProp = TvrMT.data.prog.pg_tab_props.grid.allgriditems[prop_slug],
					gridItemsKey = isGridAllProp ? 1 : nth_focus-1;

				// handle aliases like display-flex, align-items-grid
				if (TvrUi.propAliases[key]){
					key = TvrUi.propAliases[key];
				}

				var propVal = (
					TvrUi.pref.pg_focus === 'grid' &&
					nth_focus > 0 &&
					TvrUi.grid.items &&
					TvrUi.grid.items.length &&
					TvrUi.grid.items[gridItemsKey] &&
					(isGridItemProp || isGridAllProp) &&
					($sel.find('.grid-tab-griditems').hasClass('active') ||
						$sel.find('.grid-tab-allgriditems').hasClass('active')) // we're on the item tab
				)
					? TvrUi.grid.items[gridItemsKey].comp[key] // get for nth_item if grid items
					: TvrUi.compProps[key];
				var isColor = false;
				var isVariableLine = $field.hasClass('has-variable-line');

				/!*console.log('the nth_focus',nth_focus, key, TvrUi.grid, TvrUi.compProps, TvrMT.data.prog.pg_tab_props.grid.griditems, prop_slug, TvrMT.data.prog.pg_tab_props.grid.griditems[prop_slug]);*!/

				// animation / transition MT events won't have computed value, so adjust
				if (key === 'event'){
					propVal = inputVal
						? inputVal
						: (TvrUi.pref.pg_focus === 'animation')
							? 'page load'
							: 'unknown';
				} else if (key === 'event-target'){
					propVal = inputVal ? inputVal : 'self'; // M.selectorCode
				} else if (key === 'event-value'){
					propVal = inputVal ? inputVal : 'not set';
				}

				// save evaluated prop val so it can be queried by slider functionality
				TvrUi.compProps[cssf_maybe_alias] = propVal;

				var j = 0;

				// if we have a computed value
				if (TvrCom.isDefined(propVal)) {

					// if mixed (object of diff values)
					if ( propVal === Object(propVal) ) {
						$field.addClass('mixed-cp');
						//$cSty.text('[mix]');
						TvrUi.update_comp_input_overlay($field, $cSty, '[mix]');
						var inpTitle = TvrLang.value_varies;
						var str = '', str2 = '';
						// old
						for (var i in propVal) {
							if ( ! propVal.hasOwnProperty(i) ) continue; // for compat
							if (!TvrCom.isDefined(propVal[i]['val'])) {
								continue;
							}
							var hovCode = TvrCom.escapeHTML(propVal[i]['htmlString']);

							/!*.replace('&#60;', '<')
							.replace('&#62;', '>');*!/
							str+= '<tr class="mixed-val" rel="'+j+'"><td>'+(++j)+'</td><td title=\''+hovCode+'\'>'
								+TvrUi.colored_box(propVal[i]['val'], true)+'</td></tr>';
						}
						$field.find('table.comp-mixed-table').find('tbody').html(str);
					}

					// if single value
					else {

						var inpTitle = propVal;
						$field.removeClass('mixed-cp');

						// returned comp css may be too long for input field - truncate if so
						var nonTruncVal = propVal;

						if (!isVariableLine){
							propVal = TvrUi.truncate_displayed_comp_css($input, propVal);
						}

						// treat color fields differently
						if ($field.hasClass('is-picker')){
							isColor = true;
							// spit the RGB and hex
							//var rgbHex = nonTruncVal.split(' / ');
							var inlineStyle = 'background-color:transparent';
							if (nonTruncVal != 'transparent' && nonTruncVal != 'none'){
								inlineStyle = 'background-color:'+nonTruncVal;
								// report hex as well as rgb
								inpTitle = TvrCom.maybe_to_hex(nonTruncVal);
							}
							$cSty.html('<span style="'+inlineStyle+'"></span>');

						} else {
							//$cSty.html(propVal);
							TvrUi.update_comp_input_overlay($field, $cSty, propVal);
						}
					}
				}


				// if undefined comp value
				else {
					var inpTitle = TvrLang.style_not_applicable;
					// exception for content
					if (propKey == 'Content'){
						inpTitle = TvrLang.not_knowable;
					}
					//alert(key);
					$cSty.text('');
				}

				// plain text value or color box and text value
				var optValue = !isColor
					? inpTitle
					: TvrUi.trans_gradient_box(nonTruncVal, 'computed-color-box')+ inpTitle;

				$optionValue.html(optValue);

			});

			// fade in computed values
			$sel.addClass('visible-computed');

			// maybe rotate flex icons and opacity out container/items based on input values
			TvrUi.flexbox_dynamic_gui($sel, {
				compProps: TvrUi.compProps
			});

			// update CSS grid controls if necessary
			if (TvrUi.pref.pg_focus === 'grid'){

				MTgrid.update_nth_radios();

				if (TvrUi.skipGridReflow){
					TvrUi.skipGridReflow = false;
					//console.log('Skipped grid reflow and allow next');
				} else {

					//console.log('MTgrid.itemResising', MTgrid.itemResising)
					if (!MTgrid.itemResising){
						//console.log('Update the canvas', TvrUi.grid)
						MTgrid.update_grid_canvas();

					}

				}

			}

			TvrCom.endT(arguments)
		},*/

		refresh_comp_css: function(forceTinyMCEUpdate){ TvrCom.startT(arguments);

			//console.log('refresh_comp_css');
			//TvrCom.callStack();

			if (MThtml.tinymce.initialising || MThtml.tinymce.pendingUpdate){
				TvrUi.pendingComp = true;
				//console.log('Abort comp while initialising or pending update', MThtml.tinymce.initialising, MThtml.tinymce.pendingUpdate);
				return;
			}

			if (!TvrUi.selInFocusID){
				return;
			}

			var $sel = $('#'+TvrUi.selInFocusID);
			if (!TvrUi.iframeEditing() || !TvrUi.selInFocusID || !TvrCom.isDomEl($sel)){
				TvrCom.endT(arguments)
				return false;
			}

			// mixed comp styles were analysed in frontend script. Now take care of exceptions (e.g. gradient)
			var i = TvrUi.filter_css_exceptions(false),
				isHTMLProp = TvrUi.pref.pg_focus === 'html';

			//console.log('sel we got', i, $sel, TvrCom.isDomEl($sel), TvrCom.isDomEl($sel, true))

			// we have a sel in focus so anchor M to it
			//var M = TvrUi.get_meta($sel, 'selector');

			// if sel not targeting anything
			if (i < 1 && !isHTMLProp) {
				var nullAlert = TvrLang.null_selector;
				// reset the label tooltip
				$sel.find('.option-value').text(nullAlert);
				//$sel.find('input.property-input, select.property-input').attr('title', inpTitle);
				$sel.find('div.field-wrap').removeClass('mixed-cp').find('span.comp-style').text('');
				TvrCom.endT(arguments)
				//console.log('bail comp as i is under one');
				return;
			}

			// just update pg in focus
			var validFields = 'div.field-wrap:not(.tvr-editor-area)',
				/*$scope = TvrUi.pref.pg_focus
					?  $sel.find('li.group-tag-'+TvrUi.pref.pg_focus).find(validFields).first()
					:  $sel.find(validFields).first(),*/
				$scope = TvrUi.pref.pg_focus
					?  $sel.find('li.group-tag-'+TvrUi.pref.pg_focus).find(validFields)
					:  $sel.find(validFields),
                nth_focus = TvrUi.get_nth_focus();

			//console.log('Scope debug', $sel, 'scope', $scope.first());

			var	M = TvrUi.get_meta($scope.first(), 'group'),

				// We need action / aspect with potential fallback for retrieving initialValue
				htmlValues = MThtml.getFieldValues(M.groupTab, M, true),
				action = htmlValues.action,
				aspect = htmlValues.aspect,

				// We need actual user set value for showing comp overlay on action / aspect
				// or not, it's a bit confusing to see, so maybe we live with slght confusion when just one it set (auto-set both?)
				htmlSetValues = MThtml.getFieldValues(M.groupTab, M);

			//console.log(TvrCom.print_r(TvrUi.compProps), $scope);

			$scope.each(function(index) {

				var $field = $(this);

				if ($field.hasClass('group-label') || $field.hasClass('sub-label')){
					return;
				}

                //console.log('vrUi.grid', TvrUi.grid );

				var $optionLabel = $field.find('.option-label');
				var $optionValue = $field.find('.option-value');
				var propKey = $optionLabel.text();
				var $cSty = $field.find('span.comp-style');
				var $input = $field.find('.property-input');
				var inputVal = $input.val();
				var arr = $cSty.attr('class').split(' ');
				var key = arr[1].replace('cprop-', ''),
					cssf_maybe_alias = key;
				var prop_slug = $optionLabel.data('prop'),
					isGridItemProp = TvrMT.data.prog.pg_tab_props.grid.griditems[prop_slug],
					isGridAllProp = TvrMT.data.prog.pg_tab_props.grid.allgriditems[prop_slug],
					gridItemsKey = isGridAllProp ? 1 : nth_focus-1;
				var isColor = false;
				var isVariableLine = $field.hasClass('has-variable-line');
				var propVal;
				var doTruncate = true;

				// handle aliases like display-flex, align-items-grid
				if (TvrUi.propAliases[key]){
				   key = TvrUi.propAliases[key];
                }

				if (isHTMLProp){

					//console.log('isHTMLProp', key, action, aspect,  M.selectorCode)

					// We show the actual fallback value over the fields, which is fixed [none], [html]
					if (key === 'action' || key === 'aspect'){
						propVal = htmlValues[key] || TvrUi.defaultTabValues.html.defaults[key];
					}

					// A real action must be set, as there is no fallback action
					/*if (key === 'action'){
						propVal = htmlSetValues[key] || TvrUi.defaultTabValues.html.defaults.action;
					}*/
					// A fallback aspect can be shown, or [html]
					/*if (key === 'aspect'){
						propVal = htmlSetValues[key] || TvrUi.defaultTabValues.html.defaults.aspect;
					} */

					else if (key === 'selector'){
						propVal = TvrCom.stripStateFromSelector(M.selectorCode);
					} else if (key === 'juncture'){
						propVal = aspect === 'jsFunction'
							? 'DOMContentLoaded'
							: (action === 'lazyLoad'
								? 'serverHTMLReady'
								:  TvrUi.pref.default_amender_event);
					} else{
						propVal = TvrMT.data.prog.lh[key].defVal;

						// sometimes use a dynamic value
						if (key === 'text' || key === 'snippet'){

							let initialValue = MThtml.getInitialFieldValue(
								key, action, aspect, '', M.selectorCode
							)

							if (initialValue){
								propVal = TvrCom.escapeHTML(initialValue);
								doTruncate = false;
							}

							// Update tinyMCE preview
							if (parseInt(TvrUi.pref.mt_rich_text)){

								/*console.log('Do we apply tinyMCE', {
									inputVal, key, action, aspect
								})*/

								if (!inputVal && !MThtml.tinymce.pendingUpdate && key === 'text' && action === 'replace' && aspect === 'text'){
									//console.log('comp refresh call')
									TvrCom.action_after_timeout('tinymce_timer_comp_refresh', 250, {
										item: function(){
											//console.log('delayed tinymce comp refresh', initialValue)
											//console.trace();

											// Re-check the input has not been set by user or loaded during delay
											if (!$input.val() && !MThtml.tinymce.pendingUpdate){
												//console.log('Still empty after delay', initialValue)
												MThtml.tinymce.update(
													initialValue, false, forceTinyMCEUpdate); // set existing value
											}
										},
										args: []
									});
									//
								}

								//console.log('initialValue in comp refresh', key, action, aspect, '', M.selectorCode, initialValue)

							}
							}

					}

				}

				else {
					propVal	= (
						TvrUi.pref.pg_focus === 'grid' &&
						nth_focus > 0 &&
						TvrUi.grid.items &&
						TvrUi.grid.items.length &&
						TvrUi.grid.items[gridItemsKey] &&
						(isGridItemProp || isGridAllProp) &&
						($sel.find('.grid-tab-griditems').hasClass('active') ||
							$sel.find('.grid-tab-allgriditems').hasClass('active')) // we're on the item tab
					)
						? TvrUi.grid.items[gridItemsKey].comp[key] // get for nth_item if grid items
						: TvrUi.compProps[key];

					/*console.log('the nth_focus',nth_focus, key, TvrUi.grid, TvrUi.compProps, TvrMT.data.prog.pg_tab_props.grid.griditems, prop_slug, TvrMT.data.prog.pg_tab_props.grid.griditems[prop_slug]);*/

					// animation / transition MT events won't have computed value, so adjust
					if (key === 'event'){
						propVal = inputVal
							? inputVal
							: (TvrUi.pref.pg_focus === 'animation')
								? 'page load'
								: 'unknown';
					} else if (key === 'event-target'){
						propVal = inputVal ? inputVal : 'self'; // M.selectorCode
					} else if (key === 'event-value'){
						propVal = inputVal ? inputVal : 'not set';
					}
				}


				// save evaluated prop val so it can be queried by slider functionality
				TvrUi.compProps[cssf_maybe_alias] = propVal;

				var j = 0;

				// if we have a computed value
				if (TvrCom.isDefined(propVal)) {

					// if mixed (object of diff values)
					if ( propVal === Object(propVal) ) {
						$field.addClass('mixed-cp');
						//$cSty.text('[mix]');
                        TvrUi.update_comp_input_overlay($field, $cSty, '[mix]');
						var inpTitle = TvrLang.value_varies;
						var str = '', str2 = '';
						// old
						for (var i in propVal) {
							if ( ! propVal.hasOwnProperty(i) ) continue; // for compat
							if (!TvrCom.isDefined(propVal[i]['val'])) {
								continue;
							}
							var hovCode = TvrCom.escapeHTML(propVal[i]['htmlString']);

								/*.replace('&#60;', '<')
								.replace('&#62;', '>');*/
							str+= '<tr class="mixed-val" rel="'+j+'"><td>'+(++j)+'</td><td title=\''+hovCode+'\'>'
							+TvrUi.colored_box(propVal[i]['val'], true)+'</td></tr>';
						}
						$field.find('table.comp-mixed-table').find('tbody').html(str);
					}

					// if single value
					else {

						var inpTitle = propVal;
						$field.removeClass('mixed-cp');

						// returned comp css may be too long for input field - truncate if so
						var nonTruncVal = propVal;

						if (doTruncate && !isVariableLine){
                            propVal = TvrUi.truncate_displayed_comp_css($input, propVal);
						}

						// treat color fields differently
						if ($field.hasClass('is-picker')){
							isColor = true;
							// spit the RGB and hex
							//var rgbHex = nonTruncVal.split(' / ');
							var inlineStyle = 'background-color:transparent';
							if (nonTruncVal != 'transparent' && nonTruncVal != 'none'){
								inlineStyle = 'background-color:'+nonTruncVal;
								// report hex as well as rgb
								inpTitle = TvrCom.maybe_to_hex(nonTruncVal);
							}
							$cSty.html('<span style="'+TvrCom.escapeHTML(inlineStyle)+'"></span>');

						} else {
							//$cSty.html(propVal);
                            TvrUi.update_comp_input_overlay($field, $cSty, propVal);
						}
					}
				}


				// if undefined comp value
				else {
					var inpTitle = TvrLang.style_not_applicable;
					// exception for content
					if (propKey == 'Content'){
						inpTitle = TvrLang.not_knowable;
					}
					//alert(key);
					$cSty.text('');
				}

				// plain text value or color box and text value
				// (inpTitle may be a computed value from the previewed page)
				var optValue = !isColor
					? TvrCom.escapeHTML(inpTitle)
					: TvrUi.trans_gradient_box(nonTruncVal, 'computed-color-box')+ TvrCom.escapeHTML(inpTitle);

				$optionValue.html(optValue);

			});

			// fade in computed values
			$sel.addClass('visible-computed');

			// maybe rotate flex icons and opacity out container/items based on input values
			TvrUi.flexbox_dynamic_gui($sel, {
				compProps: TvrUi.compProps
			});

			// update CSS grid controls if necessary
			if (TvrUi.pref.pg_focus === 'grid'){

			    MTgrid.update_nth_radios();

                if (TvrUi.skipGridReflow){
                    TvrUi.skipGridReflow = false;
					//console.log('Skipped grid reflow and allow next');
                } else {

					//console.log('MTgrid.itemResising', MTgrid.itemResising)
                    if (!MTgrid.itemResising){
						//console.log('Update the canvas', TvrUi.grid)
                        MTgrid.update_grid_canvas();

                    }

                }

			}

			TvrCom.endT(arguments)
		},

		// update the value that appears over the input fields
		update_comp_input_overlay: function($field, $cSty, value){

			// support computed values on varibale inputs
			if ($field.hasClass('has-variable-line')){

				var split = value.split(' '),
					values = split.length ? split : [value];

                $cSty.each(function(index){
                	$(this).html(TvrCom.escapeHTML(values[index]));
				});
			}

			else {
				//console.log('update_comp_input_overlay', $cSty, value)
				// computed values come from the previewed page (escapeHTML leaves existing entities, so pre-escaped values are fine)
                $cSty.html(TvrCom.escapeHTML(value));
			}

		},

		// maybe add/remove flex-direction-col class to flexbox fields so icons can rotate
		flexbox_dynamic_gui: function($sel, config){

			// if flexbox is in view
			if (config.compProps['flex-direction']){

				// add/remove flex-direction-col class so icons can rotate
				var $flexFieldsWrap = $sel.find('div.property-flexbox'),
					flexDirection = config.compProps['flex-direction'],
					specialFlexDir = ['column', 'column-reverse', 'row-reverse'];

				// reset direction classes
				$flexFieldsWrap
					.removeClass('flex-direction-column flex-direction-column-reverse flex-direction-row-reverse');

				// add if special
				if (TvrCom.in_array(flexDirection, specialFlexDir)){
					$flexFieldsWrap.addClass('flex-direction-'+flexDirection);
				}
			}
		},
		// returned comp css may be too long for input field - truncate if so
		truncate_displayed_comp_css: function($input, propVal){ TvrCom.startT(arguments);
			var inputWidth = $input.width();
			var stringLength = propVal.length;
			var maxChars = (inputWidth/6); // bit of a guess...
			if (stringLength > maxChars){
				propVal = propVal.substring(0, maxChars)+'...';
			}
			TvrCom.endT(arguments)
			return propVal;
		},
		/*** show computed CSS over form fields  ***/
		colored_box: function(val){
			if (!val ||
				val.indexOf('rgb') < 0 || // not a color
				val.indexOf(':')> -1 // gui custom code prop:val
			) {
				return TvrCom.escapeHTML(val); // computed value from the previewed page
			}
			var valF = TvrCom.maybe_to_hex(val);
			var str = TvrUi.trans_gradient_box(val);
			str+= '<span class="colored-val">'+TvrCom.escapeHTML(valF)+'</span>';
			return str;
		},
		// display color with trans squares behind using gradient trick
		trans_gradient_box: function(color, clazz){
			clazz = clazz ? clazz : 'colored-box';
			var bgImage = TvrUi.pref.mt_dark_mode ? "trans-big-dark" : "trans-big";
			// color may be a computed value from the previewed page, so escape for the attribute
			color = TvrCom.escapeHTML(color);
			var box = '<span class="'+clazz+'" style="background-image: '
				+'linear-gradient(0deg, '+color+', '+color+'), '+
				'url('+TvrUi.pluginUrl+'images/'+bgImage+'.png)"' +
				'></span>'

			// 'url('+TvrUi.pluginUrl+'images/trans-big.png)"' +
			// url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==)
			return box;
		},

        // get values from JS object using selector id
		slugs_from_id: function(id){

		    var parts = id.split('-'),
				sectionSlug = parts[1],
				selectorSlug = parts[2],
				labelCode = TvrCom.checkObject(TvrUi.uiData, [sectionSlug, selectorSlug, 'label']);

		    labelCode = labelCode ? labelCode.split('|') : [];

		    return parts.length
                ? {
                    sectionSlug: sectionSlug,
                    selectorSlug: selectorSlug,
					selectorH: labelCode[0],
					selectorCode: labelCode[1]
                }
                : false;
        },

		/*** default to the first selector (if last edited hasn't been saved) ***/
		default_to_sel: function(config){

		    // try to use last edited/viewed sel if stored
			var $startSel,
                lastViewedSelId = TvrCom.checkObject(TvrUi.uiData, ['non_section', 'meta', 'last_viewed_selector']),
                M = lastViewedSelId ? TvrUi.slugs_from_id(lastViewedSelId) : false,
                exists = M && TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, M.selectorSlug]);

			//console.log('default_to_sel', TvrUi.selInFocusID, lastViewedSelId, exists, M)

			// if no such selector in the JS object, default to the first selector
            if (!exists){

                M = MTloop.modify_main_js_object('get_first_sel', {
                    incRecurse: false,
                    callbackDepth: ['selector']
                }).slugs;
            }

            // if we couldn't find any selector at all, bail
            if (!M){
                return false;
            }

            // load the selector menu if not already loaded
           /* $startSel = TvrUi.load_selector(M, {
                items:['selectorM']
            });*/

			//console.log('the $startSel', 'strk-'+M.sectionSlug+'-'+M.selectorSlug, $startSel, M)

            //console.log('$startSel', $startSel, M);
            return TvrUi.tvr_iterate_selectors_v(false, 'strk-'+M.sectionSlug+'-'+M.selectorSlug, config); // only set pg if it's the first
		},

        get_manual_wrap_class: function($input){
		    return $input.hasClass('mt-vl-input')
                ? '.vl-item'
                : '.tvr-input-wrap';
        },

		/*** adjust display of comp css span - could this be done with CSS? ***/
		adjust_comp_span: function($input, con){ TvrCom.startT(arguments);

		    //console.log('$input.val()', $input.val())
            var wrapClass = this.get_manual_wrap_class($input);
			let $wrap = $input.closest(wrapClass);
			let $comp = $wrap.find('span.comp-style:not(.comp-for-picker)').first();
			let method = $input.val() ? 'addClass' : 'removeClass';

			if (con === 'after') {
				$wrap[method]('manual-val');
				$comp[method]('hidden');

				/*if ( !$input.val() ) {
					$wrap.removeClass('manual-val');

					this.add_comp_overlay($input, wrapClass);
				} else {
					this.remove_comp_overlay($input, wrapClass);
				}*/
			}
			else if (con === 'hover') {

				$comp.addClass('hidden');

				//console.log('hover it', $input)
				//$input.siblings('span.comp-style:not(.comp-for-picker)').addClass('hidden');
			}
			TvrCom.endT(arguments)
		},
		add_comp_overlay: function($input, wrapClass){
			$input.closest(wrapClass).removeClass('manual-val');
			$input.siblings('span.comp-style:not(.comp-for-picker)').removeClass('hidden');
		},
		remove_comp_overlay: function($input, wrapClass){
			$input.closest(wrapClass).addClass('manual-val');
			$input.siblings('span.comp-style:not(.comp-for-picker)').addClass('hidden');
		},
		chain_is_on: function(M){
            return TvrCom.isDomEl(M.subgroup.find('input.chained-tracker'));
		},
		/** tiny delay before sync may be smoother for fast typers and when fields are slidable. Or may be unneccessary...
		 sync_delay: function(){ TvrCom.startT(arguments);
				TvrUi.sync_fields(TvrUi.meta.property, TvrUi.meta);
				TvrUi.post_edit(TvrUi.get_subgroup_or_tabgroup(TvrUi.meta, 'inputs'));
			}, **/
		sync_fields: function($obj, M, cssUnit){ TvrCom.startT(arguments);
			var $inputs = TvrUi.get_subgroup_or_tabgroup(M, 'inputs');
			var val = $obj.val();
			var checkVariableScroll = false;

			$inputs.not($obj).not('.vl-name-input').each(function(i) {

				var $inp = $(this),
					$field = $inp.closest('.property-tag');

				// if color, set bg color
				if ($inp.hasClass('color')) {

					// bind picker if not yet bound
					if (!$inp.hasClass('bound')) {
						TvrUi.colorpicker_bind($inp.parent());
					}

					//console.log('color to sync', val)

					// if there is a value, update other pickers
					if (val){

						// apply variable or do straight color apply
						if (!TvrUi.maybe_set_variable_color(val, $inp, false, true, false)){
							TvrUi.update_spectrum(val, $inp, {}, false);
						}

					} else {
						TvrUi.clear_spectrum_inputs(TvrUi.get_meta($inp, 'property'));
					}
				}

				// else straight forward value update
				else {

					$inp.val(val);

					// update CSS unit label and hidden input
					if (TvrCom.isDefined(cssUnit)){

						var syncM = TvrUi.get_meta($inp, 'property');

						MTwidget.apply_property_unit(
							val, val, cssUnit, $field, syncM.groupSlug, syncM.propertySlug, {
								writeToLabel: 1,
								writeToInput: 1,
								writeToJS: 1,
								trail: MTloop.get_property_data(syncM).propLevels
							}
						);
					}
				}

				// delete variable fields
                if (i > 0 && val === '' && $field.hasClass('has-variable-line')){
                    TvrUi.delete_variable_field($field, $inp, M, false);
                    checkVariableScroll = true;
                }

				TvrUi.post_edit($inp);
			});

			if (checkVariableScroll){
                TvrUi.adjust_grid_line_scroll_buttons(M);
            }

			//$obj.focus(); // this caused performance issue with synced fields (double bind_input_events)
			TvrCom.endT(arguments)
		},
		maybe_sync_fields: function($obj, cssUnit){ TvrCom.startT(arguments);
			// is property syncable?
			if ($obj.hasClass('autofillable')){
				var M = TvrUi.get_meta($obj, 'property');
				if (TvrUi.chain_is_on(M)) {
					// maybe add a tiny delay before synching later, see sync_delay()
					TvrUi.sync_fields($obj, M, cssUnit);
				}
			}
			TvrCom.endT(arguments)
		},

		// sync flex container/item fields across responsive tabs
		/*sync_responsive_flex_fields: function(type, M, $clicked, action){ TvrCom.startT(arguments);

			var $toggles = M.group.find( 'span.'+type+'-toggle' ).not( $clicked );
			$toggles.each(function(i){
				var $toggle = $(this);
				if ( (action === 'add' && !$toggle.hasClass('active')) ||
					(action === 'remove' && $toggle.hasClass('active'))){
					TvrUi.input_icon_toggle($toggle, true)
				}
			});

			TvrCom.endT(arguments)
		},*/

		// sync related !important fields
		sync_important: function(M, action){ TvrCom.startT(arguments);
			if (TvrUi.chain_is_on(M)) {
				var $fields = TvrUi.get_subgroup_or_tabgroup(M).not(M.property);
				$fields.each(function(i){
					var $impToggle = $(this).find('span.important-toggle');
					if ( (action == 'add' && !$impToggle.hasClass('active')) ||
						(action == 'remove' && $impToggle.hasClass('active'))){
						TvrUi.input_icon_toggle($impToggle, true)
					}
				});
			}
			TvrCom.endT(arguments)
		},

		// bind keydown event to an element, this extra event is applied on focus
		/*bind_keydown_events: function($obj){
			$obj.on("keydown.tvr", function (e) {

				// prevent editing on name input if synced with code
				if ($obj.hasClass('selector-name-input')){
					if (TvrUi.pref['selname_code_synced']){
						return false;
					}
				}

			}).on("blur", function() {
				$obj.off("keydown.tvr");
			});
		},*/

		// add missing closing bracket if not defined
		fixVariableDefinitions: function(value) {

			if (typeof value !== 'string') {
				return value; // or return String(value), depending on your intention
			}

			// Define the regex pattern
			const pattern = /var\(([^()]+?)\b(?=\s|$)/g;

			return value.replace(pattern, 'var($1)');
		},

        run_input_updated: function($obj, e){

        	//TvrCom.callStack();

            var cClasses = $obj.attr('class'),
                EditSelTextarea = false,
				updateSnippetDep = false,
				updateManagementTab;

            if (!cClasses){
                return false;
            }

            //console.log('run_input_updated', cClasses, e, $obj);

            // if regular input
            if (cClasses.indexOf('property-input') >= 0){

                TvrUi.inputWaitingObj = $obj;

                var M = TvrUi.get_meta($obj, 'property'),
                    val = $obj.val(), // TvrUi.fixVariableDefinitions($obj.val(), $obj),
                    excelFormulaStarted = val && val.indexOf('=') === 0;

                // if they are typing an excel formula, bail unless valid formula
                if (excelFormulaStarted){
                    var Result = TvrUi.process_excel_function(val, M.propertySlug);
                    //console.log('Excel Result', Result)
                    if (!Result.converted){
                        TvrUi.post_edit($obj);
                        return true;
                    }
                }

                // else do regular actions immediately
                TvrUi.maybe_sync_fields($obj);
                TvrUi.post_edit($obj);

            }

            // selector-css-textarea
            else if (cClasses.indexOf('selector-name-input') >= 0 || cClasses.indexOf('selector-css-textarea') >= 0){

                EditSelTextarea = true;

                // sync input if required
                if (TvrUi.pref['selname_code_synced']){
                    $obj.closest('.mt-folder-form')
						.find('.selector-name-input, .selector-css-textarea')
						.not($obj)
                        .val( $obj.val() );
                }
            }

            // color picker field
            else if (cClasses.indexOf('sp-input') >= 0){

                var picker = TvrUi.get_related_meta('picker', $obj.closest('.sp-container')),
                    $input = TvrUi.inputWaitingObj = picker.$input;// $obj.closest('span.tvr-input-wrap').find('input.color');

                // opacity field
                if (cClasses.indexOf('sp-input-opacity') > -1){
                    // opacity field
                    var v = $obj.val();

                    //console.log('the v', v)


                    if ( isNaN(v) || v < 0 || v > 1 ) {
                        return;
                    }

                    /*console.log('the opacity was changed',
						$input.mtspectrum('get'), TvrCom.isDomEl($input, true),
						picker,
						$input,
						$input.mtspectrum('get')
					);*/

                    if (!$input.mtspectrum('get')){
						$input.mtspectrum( 'set', picker.$container.find('.sp-input-rgb').val() );
					}

                    var rgbObj = $input.mtspectrum('get').toRgb();
                    rgbObj['a'] = v;
                    $input.mtspectrum( 'set', rgbObj );
                    TvrUi.update_spectrum_inputs( tinycolor(rgbObj), $input, $obj, true);
                }

                // custom / var field
                else if (cClasses.indexOf('sp-input-var') > -1){
                    TvrUi.maybe_set_variable_color( $obj.val(), $input, $obj, true);
                }

                // hex/rgb/hsl field
                else {
                	//console.log('We update the spectrum hex/rgb input', $obj.val())

                    TvrUi.update_spectrum($obj.val(), $input, $obj, true);
                }
            }

			// update the snippet dependency
			else if (cClasses.indexOf('snippet-dep-adjust') >= 0){
				//console.log('We wait a bit')
				TvrCom.action_after_timeout('adjust_dep_snippet', 100, {
					item: MThtml.npm.updateSnippetDependency,
					args: [$obj, cClasses]
				});
				updateSnippetDep = true;
			}

			// update the snippet dependency
			else if (cClasses.indexOf('edit-group-tab-input') >= 0){
				TvrCom.action_after_timeout('adjust_dep_snippet', 100, {
					item: TvrUi.groupManagementAdjusted,
					args: [$obj, $obj.val()]
				});
				updateManagementTab = true;
			}

            // with regular or color picker we need to save settings after a short delay
            if (!EditSelTextarea && !updateSnippetDep && !updateManagementTab) {

                //MTsave.ajax_save_settings('', TvrUi.inputWaitingObj);
                TvrUi.set_input_timer();
            }

        },

        maybe_set_variable_color: function(colorFieldValue, $input, $variableInput, forceInputUpdate, maybeSync){

			// Fix missing closing brackets on variables
			//colorFieldValue = TvrUi.fixVariableDefinitions(colorFieldValue, $input);

            //console.log('the intial val', colorFieldValue)
			maybeSync = TvrCom.isDefined(maybeSync) ? maybeSync : true;

			// is it a plain color or something else (e.g. var(), $var, currentColor)
			var customVal = MTdd.isJustColor(colorFieldValue, true)
				? false
				: colorFieldValue;

            //console.log('the customVal', customVal, forceInputUpdate)

            // if it is a variable, set picker values to that color (without overwriting input)
            if (customVal){

                var varValue,
                    varName;

                // If CSS variable
				if (customVal.indexOf('var(') > -1){

					varName = MTdd.get_variable_name(customVal);

                    if (varName){
                        varValue = MTdd.get_variable_value(varName, 'css', true);
                    }
				}

				// try to get Sass variable value
                // (won't get value at point in compilation, but could retrieve somehow perhaps)
				else if (customVal.indexOf('$') > -1){

                    varValue = MTdd.get_variable_value(varName, 'scss');

                    /*varName = customVal.split('$')[1];
                    varValue = TvrCom.checkObject(
                        TvrUi.uiData.non_section,
                        ['scss_usage', 'variable', varName, 'finalDecVal']
                    );*/
                }

				// if we have determined the variable value,
				// briefly set spectrum to that before adding var value afterwards
                if (varValue){
					TvrUi.update_spectrum(varValue, $input, {}, maybeSync, true);
					//console.log('we briefly set normal color', customVal, 'to', varValue)
                }

                // when launching the picker we need to manually set the var field
                if ($variableInput){
                    $variableInput.val(customVal)
                }

                // mirror the value in the property-input - variable or custom e.g. currentColor
                $input.val(customVal);
                //console.log('we set variable in input', customVal)

				if (maybeSync){

					// sync if eligible
					TvrUi.maybe_sync_fields($input);
				}

                return true;

            }

            else {

                // we should clear the color value sometimes
                if (forceInputUpdate){
                    TvrUi.update_spectrum(colorFieldValue, $input, {}, maybeSync, true);
                    $input.val('');
					//console.log('forceInputUpdate clear', $input);

                }

            }

            return false;

        },

		// click event should bind input change events
		bind_input_events: function($obj){ TvrCom.startT(arguments);

			//console.log('We bind input events', $obj);

		    // ensure we're not binding twice which caused performance issues (introduce if need arises)
            // this fixed an issue with multiple binds of the color picker opacity when typing numbers manually
		    TvrUi.unbind_input_events($obj);

			// note 'change' event triggers on blur for inputs, so we don't need that
			$obj.on("input.tvr propertychange.tvr", function (e) {
			    //console.log('run_input_updated', $obj)
				TvrUi.run_input_updated($obj, e);
			});

			// we want to track the cursor pos in an input field for updating portions of a value
			/*$obj.on("mouseup.tvrcursor", function (e) {
				MTwidget.maybe_update_slidable_pieces($obj, e);
				//console.log('mouseup happened', e, $obj)
				//TvrUi.run_input_updated($obj, e);
			});*/

			const isAmenderTextarea = $obj[0].id === 'mt-text-editor';
			if (isAmenderTextarea){
				$obj.closest('.property-tag').addClass('mt-textarea-focus');
			}

			// set up blur event here too
			$obj.on( "blur", function() {
				// unbind all input events
                //console.log('unbinding the input events', $obj)
				TvrUi.unbind_input_events($obj);
				if (isAmenderTextarea){
					$obj.closest('.property-tag').removeClass('mt-textarea-focus');
				}
			});
			//$obj.css('background-color', 'green');
			TvrCom.endT(arguments)
		},

		// blur should unbind auto-grow event
		unbind_input_events: function($obj){
			$obj.off("input.tvr propertychange.tvr"); // mouseup.tvrcursor
		},

		// allow inputs to grow - see if this is really necessary
		// (maybe re-add and fix extra width when selecting ems) - grid cols/rows could maybe benefit from this
		update_input_width_and_scroll: function($obj, pad, notScroll, force, $testSpan, extra, clamp, onParent){ TvrCom.startT(arguments);


			if (force || MTlayout.flexible_field_widths()){

				$testSpan = $testSpan || TvrUi.stat.inputWidthCalc;
				extra = extra || 0;

				// a more efficient system of calculating width without a temp dom element
				var text = $obj.val(),
					textLength = text.length,
					// escape first: the value may be a selector built from the previewed page
					spacedText = 1 ? TvrCom.escapeHTML(text).replace(/\s/g, "&nbsp;") : text; // extra !== false ? extra : Math.ceil((textLength/2.3))+1;

				//console.log('The orig, replaced text', text, spacedText);


				$testSpan.html(spacedText); // .replace(/\s/g, "&nbps;")

				var newWidth = $testSpan.innerWidth()+extra,
					$thing = onParent ? $obj.parent() : $obj;

				if (clamp){

					var clampMin = TvrCom.isDefined(clamp[0]) && Array.isArray(clamp) ? clamp[0] : '0px',
						clampMax = TvrCom.isDefined(clamp[1]) && Array.isArray(clamp) ? clamp[1] : '100%';

					//$thing.css('width', 'clamp('+clampMin+', '+newWidth+'px, '+clampMax+')');


					$thing[0].style.cssText = 'width:'+ 'clamp('+clampMin+', '+newWidth+'px, '+clampMax+')';

					//console.log('we should add clamp', 'width', 'clamp('+clampMin+', '+newWidth+', '+clampMax+')')
				}

				else {
					$thing.width(newWidth);
				}


				/*console.log('Set the new width', newWidth, $testSpan.innerWidth(), extra, $obj, $obj.val())
				console.log('what', $testSpan[0].outerHTML)
				console.log('spacedText', spacedText, $testSpan.innerWidth(),
					$testSpan.css(['font-size', 'font-family', 'letter-spacing']), $thing.css(['font-size', 'font-family', 'letter-spacing']));*/

                if (!notScroll){
                    //console.log('update_input_width_and_scroll triggered')
                    TvrUi.adjust_scroll_buttons( TvrUi.get_pg_meta(), 'style');
                }

			}

			TvrCom.endT(arguments);
		},
		/*update_pg_input_widths: function(M){ TvrCom.startT(arguments);
			// only do if group exists
			if (TvrCom.isDomEl(M.group)){
				var $inputs = TvrUi.get_group(M, 'inputs');
				// false if editor
				if ($inputs){

					TvrUi.get_group(M, 'inputs').each(function(i){

					    var $input = $(this);

						if ($input.val()){

							//TvrUi.update_input_width_and_scroll($input, false, true);

                            // lisyt/BG image scroll right
                            if ($input.hasClass('bg-image-select')) {
                                TvrCom.scroll_input_end($input);
                            }

						}
					});

				}
			}
			TvrCom.endT(arguments)
		},*/

		maybe_scroll_image_fields: function(M){

			if (M.groupSlug === 'list' || M.groupSlug === 'background' || M.groupSlug === 'mask'){
				M.group.find('.bg-image-select').each(function(){
					TvrCom.scroll_input_end($(this));
				});
			}
		},

		// done typing
		done_typing: function(){
			if ( TvrUi.isForbiddenProperty( TvrUi.inputWaitingObj ) ){
				return false;
			}
			MTsave.ajax_save_settings({ $property: TvrUi.inputWaitingObj });
		},

		// get current ui folders
		get_folders: function(){

			let folders = [],
				pageSpecificFolder,
				alreadyGotPageSpecific;

			if (parseInt(TvrUi.pref.auto_folders_page)){

				let item = MTfolder.matchFolders({
					type: 'conditional',
					match: 'logic',
					logic: null,
					contains: true,
					checkLoading: true,
					returnList: true,
					addPageLogicIfMissing: true,
					returnNewFolder: true
				});

				// do we have a valid page specific new folder
				if (item && item.createNewFolder){
					item.value = item.label;
					item.itemConditional = true;
					pageSpecificFolder = item;
				}
			}

			$('#tvr-menu').find('.section-tag').each(function(index) {

				var M = TvrUi.get_meta($(this), 'section'),
					itemConditional = MTfolder.folderIsConditional(M.sectionSlug),
					effectivelyGlobal = !!MTfolder.folderIsEffectivelyGlobal(M.sectionSlug);

				folders[index] = {
					category: TvrLang.select_enter_folder,
					value: M.sectionH,
					itemConditional: itemConditional && !effectivelyGlobal,
					//effectivelyGlobal: itemConditional && !!MTfolder.folderIsEffectivelyGlobal(M.sectionSlug),
				};

				if (pageSpecificFolder && M.sectionSlug === pageSpecificFolder.slug){
					alreadyGotPageSpecific = true;
				}

			});

			// Add page specific folder to list if not already in there
			if (pageSpecificFolder && !alreadyGotPageSpecific){
				folders.push(pageSpecificFolder);
			}

			//console.log('get_folders', pageSpecificFolder, folders);

			return folders;
		},

		get_label_suggestions: function(){

			var labels = [],
				M = TvrUi.get_selector_in_focus(),
				originalLabel;

			// if they are re-targeting, display the original label
			if (TvrUi.retargetSelector){
				originalLabel = TvrUi.retargetSelector.selectorH
				labels.push({
					category: TvrLang.original_label,
					value: originalLabel
				});
			}

			// default / shorter suggestion
			var defaultLabel = TvrUi.format_nice_name(M.selectorCode, false),
				shortLabel = TvrUi.format_nice_name(M.selectorCode, false, true);

			// add default label if not the same as original label
			if (defaultLabel !== originalLabel){
				labels.push({
					category: TvrLang.label_suggestions,
					value: defaultLabel
				})
			}

			// add short label if not included already
			if (shortLabel !== originalLabel && shortLabel !== defaultLabel){
				labels.push({
					category: TvrLang.label_suggestions,
					value: shortLabel
				})
			}

			return labels;
		},

		// ensure MT targeting is on when e.g. new page loads - we don't use feature on as
		// preference will already be set and toggle may be on (so things are a bit different in this case)
		ensure_targeting_is_on: function(MTF){

			MTF.bind_wizard_hover();

			$('#hover-inspect-toggle').addClass('on');
		},

		/*show_wizard: function(preTargeting){ TvrCom.startT(arguments);

			TvrUi.intelli = true;
			TvrUi.stat.tvr.addClass('show-wizard');

			//var menuWidth = TvrUi.stat.settingsMenu.width()+5;

			//TvrUi.stat.notifications.css('right', menuWidth+'px');

			//TvrUi.showWiz = 1; // so iframe can adjust click behaviour
			// top toolbar won't move, but we want to maintain the view of the element
			//var topControlsChange = false; //TvrUi.pref.dock_wizard_right ? (TvrUi.toolbarHeight-250) : false;
			//MTlayout.toolbar_adjusted(topControlsChange, true, preTargeting); // here

			// stop listening for changes in dom
			MTF.maybe_stop_mutation_observer();

			//MTlayout.toolbar_adjusted(undefined, !preTargeting); // here
			TvrUi.screen_width_adjusted('intelli');

			// get the current or a fallback folder to set on the wizFolder field
			TvrUi.default_to_folder(TvrUi.stat.wizFolder);

			TvrCom.endT(arguments)
		},*/

		default_to_folder: function($setOn){

			// update the global meta with...
			var defaultFolder = '';

			// if the folder the retarget selector is in
			if (TvrUi.retargetSelector){
				var retargetM = TvrUi.retargetSelector;
				defaultFolder = retargetM.sectionH;
				//console.log('retargetM defaultFolder', defaultFolder);
			}

			// else use the current folder if there is one
			else {
				if (TvrCom.hasValue(TvrUi.selInFocusID)){
					var M = TvrUi.get_meta( $('#'+TvrUi.selInFocusID), 'selector');
					defaultFolder = M.sectionH;
					//console.log('current defaultFolder', defaultFolder);
				} else {
					var Section = TvrCom.obj_index(0, TvrUi.uiData, 'non_section'); // exclude non_section
					defaultFolder = Section ? Section['this']['label'] : '';
					//console.log('Section defaultFolder', defaultFolder, Section);
				}

			}

			if ($setOn){
				TvrUi.stat.curSecInput.val(defaultFolder);
			}

			return defaultFolder;

		},

		/*hide_wizard: function(){ TvrCom.startT(arguments);

		    TvrUi.stat.tvr.removeClass('show-wizard');

			//$('#mt-notifications').css('right', '');

			// no need to trigger potentially expensive maybeUpdateInspectorPanels() in screen_width_adjusted()
			TvrUi.screen_width_adjusted('reg', {skip:1});
			TvrUi.intelli = false;

			// clear the selector name field
			//$('#sel-hierarchy-input').val('');
			TvrUi.redo_sug_sels('');

			// we need to pass in the scroll adjustment when using bottom docked. Because bottom down up too.
			//var topControlsChange = TvrUi.pref.dock_wizard_right ? (250-TvrUi.stat.top.height()) : false;
			MTlayout.toolbar_adjusted(undefined, false);

			// reset potential wizard update selector mode
			TvrUi.stat.tvr.removeClass('retarget_selector targeting-or-retargeting');
			TvrUi.retargetSelector = false;

			// start listening for changes in dom
			MTF.maybe_start_mutation_observer();

            TvrCom.endT(arguments)
		},*/

		generalTargetingClassFlag: 'targeting-or-retargeting',
		retargetClassFlag: 'retarget_selector',
		selectorLabelEditingClassFlag: 'editing-selector-label',
		//newDraftClassFlag: 'create_new_selector', // may not need
		adjustClassesOnAdminAndFront: function(action, classes){

			if (action === 'add'){
				TvrUi.stat.tvr.addClass(classes);
				if (TvrUi.iframeEditing()){
					MTF.stat.html.addClass(classes);
				}
			}

			else if (action === 'remove'){
				TvrUi.stat.tvr.removeClass(classes);
				if (TvrUi.iframeEditing()){
					MTF.stat.html.removeClass(classes);
				}
			}
		},

		selector_key_atts: function(M){

			//console.log('transfer from M', $.extend(true, {}, M))

			return {
				sectionH: M.sectionH,
				sectionSlug: M.sectionSlug,
				selectorSlug: M.selectorSlug,
				selectorH: M.selectorH,
				selectorCode: M.selectorCode,
				id: M.selectorID,
				mid: M.selectorMID
			}
		},

		// clicking the folder name when not editing, opens menu (if not already) and scrolls to the current folder
		/*maybe_scroll_to_folder: function($clicked, e){

			console.log('folder select', !TvrUi.retargetSelector, !TvrUi.draftSelector.atts.id)

			if (!TvrUi.retargetSelector && !TvrUi.draftSelector.atts.id){

				e.preventDefault();

				$clicked.trigger('blur');

				console.log('bail on folder select')


			}

		},*/

		// show that selector label edit field and button (if not showing already)
		show_selector_label_edit: function(){

			// Quick edit label mode is only triggered if not already active, and we're not on a new draft or existing retarget
			if (!TvrUi.selectorLabelEditing && !TvrUi.stat.tvr.hasClass(TvrUi.generalTargetingClassFlag)){
				TvrUi.stat.tvr.addClass(TvrUi.selectorLabelEditingClassFlag);
				TvrUi.selectorLabelEditing = TvrUi.get_hierarchy_input_values();

					//TvrUi.stat.curSelInput.val(); // store orig val
			}
		},

		// show that selector label edit field and button (if not showing already)
		save_selector_label_edit: function(fromBlur){

			var M = TvrUi.get_meta( $('#'+TvrUi.selInFocusID), 'selector'),
				newSelectorH = TvrUi.stat.curSelInput.val(),
				origValues = TvrUi.selectorLabelEditing,
				newValues = $.extend(true, {}, origValues, {
					selectorH: newSelectorH
				});

			//console.log('from save_selector_label_edit')
			var outcome = TvrUi.modify_selector_if_values_changed(M, false, origValues, newValues);

			// outcome will be an empty object if all is fine, and false if there was a naming issue
			if (!outcome){
				return false;
			}

			//console.log('outcome', outcome, $.extend(true, {}, origValues), $.extend(true, {}, newValues))

			TvrUi.hide_selector_label_edit(fromBlur);
		},

		// restore the original value and hide
		cancel_selector_label_edit: function(fromBlur){

			var $input = TvrUi.stat.curSelInput;

			$input.val(TvrUi.selectorLabelEditing.selectorH);

			TvrUi.size_hierarchy_inputs($input);

			TvrUi.hide_selector_label_edit(fromBlur);
		},

		// show that selector label edit field and button (if not showing already)
		hide_selector_label_edit: function(fromBlur){

			// ensure auto-name is set back to on (it get temp disabled when editing the label field)
			TvrUi.enable_selector_auto_name(true);

			TvrUi.stat.tvr.removeClass(TvrUi.selectorLabelEditingClassFlag);
			TvrUi.selectorLabelEditing = false;

			if (!fromBlur){
				TvrUi.stat.curSelInput.trigger("blur");
			}
		},

		// launch selector wizard in retarget mode
		retarget_selector: function($clicked){ TvrCom.startT(arguments);

			// abort if we are already in re-target mode
			if (TvrUi.retargetSelector){
				return;
			}

			// prevent bug where targeting mode tooltip updates retarget selector icon title
			MTlocal.clean_tooltips();

			var $item = $clicked || $('#'+TvrUi.selInFocusID),
				M = TvrUi.get_meta_for_context($item, 'selector');

			// navigate to the selector, to ensure it is current and loaded
			if (!TvrUi.is_cur('selector', M.selectorID)){
				TvrUi.tvr_iterate_selectors_v(M.selectorM);
			}

			// ensure there are no left over values from previous new draft.
			TvrUi.update_current_selector_controls(M);

			// show fields
			TvrUi.show_hierarchy_inputs(true);

            // cache selector meta object string values
            TvrUi.retargetSelector = TvrUi.selector_key_atts(M);

            // store the save package for the initial modification, and any folder moves
			// when the update is being committed to the DB, the final code, label, and folder values
			// will be substituted in with a find and replace function
			TvrUi.retargetSelector.initialModifySavePackage = false;
			TvrUi.retargetSelector.initialFolderMoveSavePackage = false;

			// set the draft flag so _2 doesn't get added to alt labels
			TvrCom.updateObject(TvrUi.uiData, [M.sectionSlug, M.selectorSlug], TvrUi.retargetSelector, {
				action: 'append',
				key: 'isDraftRetarget',
				data: TvrUi.retargetSelector
			})

            // keep the current name when retargeting, user can turn on auto-name if they want
            //TvrUi.disable_selector_auto_name(); - no, let the user do this otherwise it's confusing.

			TvrUi.sync_selector_modifiers(TvrUi.curSelCSS);

            // Ensure targeting mode is enabled
            TvrUi.feature_on($('#hover-inspect-toggle'), 'hover_inspect');

            // give focus to code field
			//TvrUi.stat.curCodeInput.focus(); // not sure this is necessary and adding focus can cause bugs sometimes

			TvrCom.endT(arguments)
		},

		disable_selector_auto_name: function(){
			TvrUi.feature_off($('#selector_auto_name'), 'selector_auto_name', {
				noSave:1
			});
		},

		enable_selector_auto_name: function(doNotUpdateField){
			TvrUi.feature_on($('#selector_auto_name'), 'selector_auto_name', {
				noSave:1,
				doNotUpdateField: doNotUpdateField
			});

		},

		// save draft selector (from new or retarget)
		save_draft_selector: function(retargeting, save, M, settings, aiRetryShouldAwaitSave){

			M = M || TvrUi.get_meta( $('#'+TvrUi.selInFocusID), 'selector');
			settings = settings || {
				savePackage: []
			};

			var inputValues = TvrUi.get_hierarchy_input_values(false, true),
				draftFlag = retargeting
					? 'isDraftRetarget'
					: 'isDraft',
				saveNew = !retargeting,
				historyKey = retargeting
					? 'retarget'
					: 'new'

			//console.log('modify_selector_if_values_changed', inputValues)

			// need to check if user has manually changed the folder, label, or code via the fields
			// rather then leaving the automatically created code, label, and current folder when selecting elements
			//console.log('from save_draft_selector', inputValues, $.extend(true, {}, M))
			var outcome = TvrUi.modify_selector_if_values_changed(M, true, M, inputValues);

			//console.log('the outcome', outcome, inputValues)

			// outcome will be an empty object if all is fine, and false if there was a naming issue
			if (!outcome){
				return false;
			}

			//console.log('we save?', retargeting, save, M, settings)

			// hide the edit fields now we know there were no naming issues
			TvrUi.hide_hierarchy_inputs();

			// redefine M if hierarchy values have been modified
			if (outcome.changedRequired){
				M = TvrUi.get_meta( $('#'+TvrUi.selInFocusID), 'selector');

				//TvrUi.update_current_selector_controls(M);
				//console.log('update_current_selector_controls', $.extend(true, {}, M));
			}

			//console.log('outcome and M', inputValues, $.extend(true, {}, M), outcome, TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, M.selectorSlug]))



			// log new selector in history
			settings.user_action = TvrCom.checkObject(TvrUi.draft_user_action, [historyKey, 'user_action']);

			// if it's a new draft
			if (saveNew){

				// register the selector in the DB
				settings.savePackage.push({
					action: 'append',
					trail: [M.sectionSlug],
					key: M.selectorSlug,
					data: TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, M.selectorSlug])
				});

				/*console.log('saveNew', {
					action: 'append',
					trail: [M.sectionSlug],
					key: M.selectorSlug,
					data: TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, M.selectorSlug])
				})*/

			}

			// if we're updating the targeting, name, or folder (retargeting)
			else if (retargeting) {

				var origAtts = TvrUi.retargetSelector,
					newSectionH = origAtts.sectionSlug !== M.sectionSlug ? M.sectionH : false;

				TvrUi.retargetSelector.M = TvrUi.selector_key_atts(M);

				// We need to surgically update the savePackages that have been cached for the original atts change
				// And any folder moves
				Array.prototype.push.apply(
					settings.savePackage,
					TvrUi.surgically_adjust_retarget_save_packages(TvrUi.retargetSelector)
				);

				//console.log('retargeting', $.extend(true, [], settings.savePackage));

				//console.log('We need to surgically update save Packages', TvrUi.retargetSelector, M);

				// save this so we can test function on data on page load (to save me clicking around)
				/*MTsave.silent_save('', [{
					trail:['non_section', 'rawRetargetSelector'],
					action: 'replace',
					data: TvrUi.retargetSelector
				}]);*/

			}

			// remove the isDraft || isDraftRetarget flag from the JS object
			// todo maybe it would be safer to delete both draft flags (isDraft && isDraftRetarget)
			MTloop.updateObjectAndSavePackage(settings.savePackage, {
				action: 'delete',
				trail: [M.sectionSlug, M.selectorSlug],
				key: draftFlag
			});


			// ensure all resolved selector/xpath values are set
			/*settings = MTloop.modify_main_js_object('update_resolved_selectors', settings, {
				callbackDepth: ['selector'],
				maxDepth: 'selector',
				M: {
					sectionSlug: M.sectionSlug,
					selectorSlug: M.selectorSlug
				},
				new_code: M.selectorCode,
			});*/

			//console.log('removing the draft flag')

			// return false;


			// check if it's a draft folder before resetting
			let isDraftFolderWithLogic = TvrCom.in_array(M.sectionSlug, TvrUi.draftFolders) !== false
				&& TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, 'this', 'logic', 'expr']);

			/*console.log('isDraftFolderWithLogic', M.sectionSlug, TvrUi.draftFolders, isDraftFolderWithLogic, TvrCom.in_array(M.sectionSlug, TvrUi.draftFolders), TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, 'this', 'logic', 'expr']) )*/

			// reset the tracker objects
			TvrUi.resetDraftTrackers(retargeting, true, 'afterSave');

			// log selector as the last viewed
			TvrUi.save_last_viewed_selector(TvrUi.selInFocusID);

			// reselect the element so color changes to blue and existing sel appears in the suggestions menu
			if (!TvrUi.doNotReselectRevertedRetargetSel && TvrUi.iframeEditing()){
				MTF.select_current_selector_elements({
					scroll: false
				});
				//console.log('reselect the element');
			}

			// if gutenberg, clean any unused dynamic classes
			if (TvrMT.integrate.gutenberg){
				let B = TvrMT.integrate.gutenberg;
				B.cleanUnusedMTClasses(B.prevBlockEls);
			}

			//console.log('the save draft settings', TvrUi.draftSelector, save, $.extend(true, {}, settings))

			if (save){

				let autoFolders = parseInt(TvrUi.pref.auto_folders),
					config = {
					settings: settings
				}

				//console.log('We ajax save the settings',  $.extend(true, {}, settings));

				// additional actions for a new draft folder with logic
				if (isDraftFolderWithLogic){

					// remove draft folder from session
					MTfolder.updateDraftFolderInSession({}, true);

					// If we are creating a new draft folder, flag logic_adjusted
					MTfolder.maybeAddLogicAdjustedFlag(M.sectionSlug, config.settings);

					// ensure the label and logic gets saved
					MTloop.updateObjectAndSavePackage(config.settings.savePackage, {
						action: 'replace',
						trail: [M.sectionSlug, 'this'],
						data: TvrCom.checkObject(TvrUi.uiData, [M.sectionSlug, 'this'])
					});

					// if auto-folders have been enabled, update the JS to match the order of the draft folder
					if (autoFolders){
						config.settings = MTfolder.maybeAutoSortSection('js', M, settings);
					}

					// and run logic test to keep UI state up to date
					MTfolder.addSaveLogicCallback(M, true, config, true);
				}

				// if auto-folders, order the selector to match the order of the dom elements
				if (autoFolders){
					config.settings = MTfolder.maybeAutoSortSelector('js', M, config.settings);
				}

				//console.log('The save config', $.extend(true, {}, config));

				if (aiRetryShouldAwaitSave){
					config.aiRetryShouldAwaitSave = 1;
				}

				MTsave.ajax_save_settings(config);
			}

		},

		clean_duplicate_save_packages: function(savePackages, key){

			var updateDone = {};

			//console.log('savePackages before clean', $.extend(true, {}, savePackages))

			// we loop backwards so we can compare earlier packages with later packages and safely splice
			for (var i = savePackages.length - 1; i >= 0; i--) {

				var pack = savePackages[i],
					trailString = pack.trail.join('.');

				if (pack[key]){

					// remove earlier redundant update
					if (updateDone[trailString]){
						savePackages.splice(i, 1);
					}

					// log that update happens
					else {
						updateDone[trailString] = 1;
					}
				}
			}

			//console.log('savePackages after clean', $.extend(true, {}, savePackages))
		},

		surgically_adjust_retarget_save_packages: function(data){

			// bail if user did not change anything
			if (!data.initialModifySavePackage){
				return [];
			}

			//console.log('surgically_adjust_retarget_save_packages (before)', $.extend(true, {}, data))

			var origAtts = data,
				newAtts = data.M,
				initialModify = data.initialModifySavePackage,
				lastModify = data.lastModifySavePackage || initialModify,
				initialFolderMove = data.initialFolderMoveSavePackage,
				lastFolderMove = data.lastFolderMoveSavePackage || initialFolderMove,
				origSelectorOrder = TvrUi.findReplaceSavePackages(initialModify, {
					returnRenameOrder: 1
				}).order,
				updatedSavePackages = [];

			// if the user made any modifications before saving
			if (lastModify){

				// work on lastModify inserting orig values in places
				// we need to:
				// - update the code and label on the original selector
				// - use the original order of selectors in the folder
				// - apply rename on the original selector
				TvrUi.findReplaceSavePackages(lastModify, {
					origAtts: origAtts,
					origSelectorOrder: origSelectorOrder,
					replaceTrailOnLabelCodeUpdate: 1,
					applyOrigAttsToRename: 1,
					applyOrigSectionToSelectorReplace: 1
				});

				Array.prototype.push.apply(updatedSavePackages, lastModify);
			}

			// if the folder was changed
			if (lastFolderMove){

				// appending to new folder, and ordering correctly in new folder is still valid
				// so we just need to change the delete action to the original selector
				TvrUi.findReplaceSavePackages(lastFolderMove, {
					origAtts: origAtts,
					applyOrigAttsToDeleteSelector: 1,
				});

				Array.prototype.push.apply(updatedSavePackages, lastFolderMove);
			}

			//console.log('surgically_adjust_retarget_save_packages (after)', $.extend(true, {}, data))
			//console.log('updatedSavePackages', $.extend(true, [], updatedSavePackages))

			return updatedSavePackages;





		},

		findReplaceSavePackages: function(savePackages, config){

			var result = {},
				origAtts = config.origAtts || {};

			// work onlastModify and lastFolderMove, inserting orig values in places
			for (var i = 0; i < savePackages.length; i++) {

				var pack = savePackages[i];

				switch(pack.action) {

					// if we are on the label|code update
					case 'array_merge_recursive_distinct':

						if (config.replaceTrailOnLabelCodeUpdate){

							if (TvrCom.checkObject(pack, ['data', 'label'])){
								//console.log('Adjust the trail (before)', $.extend(true, [], pack.trail))
								TvrUi.replaceInTrail(pack.trail, origAtts.sectionSlug, origAtts.selectorSlug);
								//console.log('Adjust the trail (after)', $.extend(true, [], pack.trail))
							}
						}


						break;
					case 'rename':
						if (config.returnRenameOrder){
							result.order = pack.order;
						} else if (config.applyOrigAttsToRename){
							pack.key = origAtts.selectorSlug;
							pack.order = config.origSelectorOrder;
							TvrUi.replaceInTrail(pack.trail, origAtts.sectionSlug, false, -1);
						}
						break;
					case 'reorder':

						break;
					case 'replace':
						if (config.applyOrigSectionToSelectorReplace && pack.fullSelectorUpdate){
							TvrUi.replaceInTrail(pack.trail, origAtts.sectionSlug);
						}
						break;
					case 'delete':
						if (config.applyOrigAttsToDeleteSelector){
							//pack.key = origAtts.selectorSlug;
							TvrUi.replaceInTrail(pack.trail, origAtts.sectionSlug, false, -1);
						}
						break;
				}
			}

			return result;
		},

		// note this only works when the section and selector as the last items in the trail
		replaceInTrail: function(trail, sectionSlug, selectorSlug, sectionIndex, selectorIndex){

			if (sectionSlug){
				sectionIndex = sectionIndex !== undefined ? sectionIndex : -2;
				trail.splice(sectionIndex, 1, sectionSlug);
			} if (selectorSlug){
				selectorIndex = selectorIndex !== undefined ? selectorIndex : -1;
				trail.splice(-1, 1, selectorSlug);
			}
		},

		go_to_code_view_selector_line: function(existingSelector, updateHighlighting){

			var editor = MTace.eds['adaptable-editor'],
				code = existingSelector.code;

			// go to the relevant line for the selector
			editor.gotoLine(existingSelector.line, 0, false);
			editor.navigateLineEnd();

			if (updateHighlighting){
				MTF.reposition_overlays({
					scroll: 1,
					con: 'resume-existing-code-sel',
					css: code
				});
			}

			MTace.prev_code_selector = code;

			//console.log('Going to line', existingSelector.line, updateHighlighting);
		},

		// when clicking on a draft selector, we can resume it without deleting and recreating it
		should_resume_existing_draft: function(existingSelector, view){

			// GUI view
			if (view === 'GUI'){
				return TvrUi.draftSelector.atts.mid === existingSelector.id;
			}

			// code view
			else {
				return false
			}
		},

		resume_existing_or_set_draft_selector: function($el, dom, config){ TvrCom.startT(arguments);

			//console.log('MTF.dom', config.shiftKey, dom, $.extend(true, {}, config));

			// if possible, navigate to an existing selector (mSels excludes draft selectors)
			// note, when re-targeting, the right behaviour when clicking an existing selector may need some thought
			var existingSelector = config.existingSelector || ((MTF.isUsingExistingSel() && dom.mSels) ? dom.mSels[0] : false);

			// we force resume when they click on a radio button for resuming a selector,
			// but when clicking on elements during a re-target, or custom typing the CSS selector, we don't
			if (existingSelector && ( config.forceResume || (!TvrUi.retargetSelector && !config.customCSSVal)) ){

				// if the existing sel is in code view and we're in GUI view or vice versa
				// switch to the selector view, this also cancels the draft selector in the current view
				var currentView = TvrUi.pref.show_code_editor ? 'code' : 'GUI',
					newView = existingSelector.type === 'hand_coded_css' ? 'code' : 'GUI',
					returnToLastViewed = (newView === 'code'),
					resumeDraft = TvrUi.should_resume_existing_draft(existingSelector, newView);

				if (!resumeDraft){
					//console.log('cancel_draft_selector_edit');
					TvrUi.cancel_draft_selector_edit(returnToLastViewed, {
						elementAlreadySelected: (newView === 'code')
					});
				} else {
					//console.log('do not cancel_draft_selector_edit as we can reume the draft');
				}

				//console.log('Resuming...');

				// An issue with switching is that a universal selector will trigger the view it is in on evey click
				/*if (currentView !== newView){
					//console.log('switch view from/to', currentView, newView)
					TvrUi.toggle_feature(false, 'show_code_editor', {
						doNotAutoSelect: 1
					});
				}

				// maintaining the current view
				else {

					if (!resumeDraft){
						//console.log('cancel_draft_selector_edit');
						TvrUi.cancel_draft_selector_edit(returnToLastViewed, {
							elementAlreadySelected: (newView === 'code')
						});
					} else {
						//console.log('do not cancel_draft_selector_edit as we can reume the draft');
					}
				}*/

				if (newView === 'GUI'){

					//console.log('resume existing GUI selector', existingSelector.id, TvrUi.retargetSelector, config.suggestionCustomisedForNewEl, existingSelector)
					TvrUi.tvr_iterate_selectors_v(
						false,
						existingSelector.id,
						{
							scroll: config.scroll,
							elementAlreadySelected: config.elementAlreadySelected,
							doNotUpdateSelectorSuggestions: config.doNotUpdateSelectorSuggestions,
							switchSelVariation: config.switchSelVariation
						}
					);
				}

				else {
					//console.log('resume code selector');
					TvrUi.go_to_code_view_selector_line(existingSelector, config.updateHighlighting);
				}

				// notify user that selector was created in the other view
				if (currentView !== newView){

					//console.log('See other view', currentView, newView)

					var checkView = newView === 'GUI' ? newView : 'full code';
					MTsave.update_full_logs({
						'short': 'See '+checkView+' view',
						'long': '<p>An existing selector targets the element you selected, but it was created in the '+checkView+' view. To switch, go to <i>Settings > View > Full code editor</i> and adjust the toggle.</p>',
						'type' : 'info'
					})


					/*TvrUi.toggle_feature(false, 'show_code_editor', {
						doNotAutoSelect: 1
					});*/
				}

			}

			// else create/update a draft selector
			else {

				//console.log('Create or update draft', $.extend(true, {}, TvrUi.retargetSelector), $.extend(true, {}, TvrUi.draftSelector))

				// show edit fields
				TvrUi.show_hierarchy_inputs(TvrUi.retargetSelector);

				TvrUi.create_or_update_draft_selector(false, true, config);
			}


			TvrCom.endT(arguments);

		},

		/*create_or_update_draft_selector: function(M){

			// create new or update draft selector
			TvrUi.wizard_new_or_update_selector(false, true);

		},*/

		create_or_update_draft_selector: function(code, draft, config){ TvrCom.startT(arguments);

			var inputValues = TvrUi.get_hierarchy_input_values(code, draft);

			//console.log('the inputValues', inputValues)

			// if something was wrong with the input values, abort so user can correct
			if (!inputValues){
				return false;
			}

			// if the user is in code view, create a selector in the editor
			if (TvrUi.pref.show_code_editor){

				// add selector to focus tab (if JS, nothing happens)
				if (inputValues.selectorCode){
					MTace.insert_code_view_selector(inputValues.selectorCode);
				}

			}

			// else create regular GUI selector
			else {

				// get the current folder M, create a new folder if it doesn't already exist
				var sM = TvrUi.getOrCreateFolder(inputValues.sectionH, draft);
				if (!sM){
					return false;
				}



				// if new, copy values to folder's selector add fields
				if (!TvrUi.retargetSelector && !TvrUi.draftSelector.atts.id) {

					//console.log('Creating new selector (maybe draft)',inputValues.selectorH, inputValues.selectorCode)

					// Clear any editor references (for TinyMCE)
					//TvrUi.beforeDOMViewChange();

					TvrUi.get_set_selector_values({
						action: 'set',
						target: 'popup',
						context: 'add',
						label: inputValues.selectorH,
						code: inputValues.selectorCode,
						M: sM
					});

					if ( !TvrUi.add_selector(sM, TvrUi.stat.addSelectorForm, draft, config) ){
						return false;
					}
				}

				// if existing selector update, or draft needs atts changing
				else {

					var M = TvrUi.get_meta($('#'+TvrUi.selInFocusID), 'selector');
					//console.log('from wizard new or update', M)
					if (!TvrUi.modify_selector_if_values_changed(
						M,
						draft,
						M,
						{
							sectionSlug: inputValues.sectionSlug,
							sectionH: inputValues.sectionH,
							selectorSlug: TvrCom.convert_to_param(inputValues.selectorH),
							selectorH: inputValues.selectorH,
							selectorCode: inputValues.selectorCode
						},
						config
					)){
						return false;
					}
				}

				// addPseudoBaseStyles if required
				if (config.addPseudoBaseStyles){
					//console.log('draft created or updated, added core and maybe base styles', config.addPseudoBaseStyles, config)
					TvrUi.adjust_pseudo_base_styles(true, TvrUi.pref.pseudo_base_styles);
				}


			}

			TvrCom.endT(arguments)
		},

		get_hierarchy_input_values: function(code){

			// get values from wizard
			var rawSecName = TvrUi.stat.curSecInput.val();

			//console.log('rawSecName', rawSecName);

			// if they didn't select/set a folder, default to current or another folder
			if (!TvrCom.hasValue(rawSecName)){
				TvrUi.default_to_folder(TvrUi.stat.curSecInput);
				/*alert(TvrLang.wizard_folder_alert);
				return false;*/
			}

			var selName;

			// code will be passed in if the user clicks a quick create option
			if (code){
				selName = TvrUi.format_nice_name(code, TvrUi.pref['selname_code_synced']);
				//console.log('we got the name from the code param', code, selName)
			}

			// else get values from wizard fields
			else {
				selName = TvrUi.stat.curSelInput.val();
				code = TvrUi.stat.curCodeInput.val();

				//console.log('we got the name and code from the fields', selName)

				// ensure we have some value for code and value
				if (!code){
					code = TvrCom.checkObject(MTF, ['dom', 'sels', 'final', 0, 'code']);
				}

				if (!selName){
					if (code){
						selName = TvrUi.format_nice_name(code, TvrUi.pref['selname_code_synced']);
					}
				}

			}

			//console.log('Selname at early stage', selName);

			// check how many selectors a folder has, limit to x, add to _2 if it isn't full, or create new
			var sectionSlug = TvrCom.convert_to_param(rawSecName),
				maybeModified = MTfolder.maybeUseAutoOrAvailableFolder({
					sectionSlug: sectionSlug,
					sectionH: rawSecName
				});

			sectionSlug =  maybeModified.sectionSlug;
			rawSecName =  maybeModified.rawSecName;

			//console.log('rawSecName at end', sectionSlug, rawSecName);

			return {
				sectionSlug: sectionSlug,
				sectionH: rawSecName,
				selectorSlug: TvrCom.convert_to_param(selName),
				selectorH: selName,
				selectorCode: code
			}

		},


		checkMaxedFolder: function(sectionSlug, exclIfDraft){

			return TvrCom.obj_length(
				TvrUi.uiData[sectionSlug], {
					exclIfDraft: exclIfDraft,
					exclKey: 'this'}
			) >= TvrUi.maxSelsPerFolder

		},

		// helper to migrate away from edit/add selector label and code values on menu item
		// Values can be stored in:
		// a) the popup editor
		// b) a hidden input
		// c) M
		// d) the JS data
		get_set_selector_values: function(config){

			var $form, $labelField, $codeField, label, code;

			//console.log('get_set_selector_values', config);
			//console.trace();

			if (config.target === 'M'){

				if (config.action === 'get'){
					label = config.M.selectorH;
					code = config.M.selectorCode;
				}

				// M is always set in dedicated get_meta function
			}

			else if (config.target === 'popup'){

				$form = TvrUi.stat[config.context+'SelectorForm'];
				$labelField = $form.find(".selector-name-input");
				$codeField = $form.find(".selector-css-textarea")

				if (config.action === 'get'){
					label = $codeField.val();
					code = $codeField.val();
				}

				else if (config.action === 'set'){
					$labelField.val(config.label);
					$codeField.val(config.code);
				}
			}

			else if (config.target === 'hiddenInput'){

				var $hiddenInput = config.M.selectorM.find('.selector-label');

				if (config.action === 'get'){
					var mixed = $hiddenInput.val().split('|');
					label = mixed[0];
					code = mixed[1];
				}

				else if (config.action === 'set'){
					$hiddenInput.val(config.label+'|'+config.code);
				}
			}

			// get values
			if (config.action === 'get'){

				return {
					label: label,
					code: code
				}
			}

		},


		modify_selector_if_values_changed: function(M, draft, origValues, newValues, config){

			config = config || {};

			var newSectionH = TvrCom.convert_to_param(origValues.sectionH) !== TvrCom.convert_to_param(newValues.sectionH)
					? newValues.sectionH
					: false,
				newSelectorLabel = origValues.selectorH !== newValues.selectorH,
				newSelectorCode = origValues.selectorCode !== newValues.selectorCode,
				outcome = {};

			// if selector needs to be relocated, renamed, or code updated
			if (newSectionH || newSelectorLabel || newSelectorCode){

				outcome.changedRequired = true;

				//console.log('Modifying selector that changes (maybe draft)', origValues.sectionH, newValues.sectionH, newSelectorLabel, newSelectorCode, $.extend(true, {}, origValues), $.extend(true, {}, newValues), newValues.selectorSlug, newValues.selectorCode)

				// auto-update the selector menu fields
				/*M.selectorM.find('.selector-name-input').val(newValues.selectorH);
				M.selectorM.find('.selector-css-textarea').val(newValues.selectorCode);*/

				TvrUi.get_set_selector_values({
					action: 'set',
					target: 'popup',
					context: 'edit',
					label: newValues.selectorH,
					code: newValues.selectorCode,
					M: M
				});

				// manually instigate quick edit update (also updates global vars)
				//console.log('from modify if changed', $.extend(true, {}, config))
				if (!TvrUi.action_modify_selector(
					M,
					TvrUi.stat.editSelectorForm,
					{
						switchSelVariation: config.switchSelVariation
					},
					newSectionH,
					false,
					draft
				)){
					return false;
				}
			}

			return outcome;

		},

		delete_draft_selector: function(){

			//console.log('delete_draft_selector', $.extend(true, {}, TvrUi.draftSelector))

			if (TvrUi.draftSelector.atts.id){

				var $selector = $('#'+TvrUi.draftSelector.atts.id);

				if (TvrCom.isDomEl($selector)){

					//console.log('We have a valid draft $selector to delete', TvrCom.isDomEl($selector, true), $selector, TvrUi.draftSelector);

					var M = TvrUi.get_meta($selector, 'selector');



					// skip animation and straight to delete functionality
					TvrUi.action_delete_selector(M, true);

				}

				else {
					//console.log('$selector has already been deleted but atts exists', TvrUi.draftSelector.atts.id )
				}

			}

			// delete code view draft if present
			if (TvrUi.draftSelector.ace.range && TvrUi.pref.show_code_editor){

				var ace = TvrUi.draftSelector.ace;

				// remove the draft selector code
				ace.editor.session.replace(ace.range, '');

				TvrUi.draftSelector.ace = {};

				//console.log('we deleted the code view selector here', TvrUi.draftSelector.atts.ace);
			}

		},

		get_hierarchy_inputs: function(){
			return TvrUi.stat.curSecInput.add(TvrUi.stat.curSelInput).add(TvrUi.stat.curCodeInput);
		},

		// the folder and selector label fields always show, but are only editable if user instigates re-target
		show_hierarchy_inputs: function(retarget){

			var classFlag = TvrUi.generalTargetingClassFlag;

			if (retarget){
				classFlag+= ' '+TvrUi.retargetClassFlag;
			}

			TvrUi.adjustClassesOnAdminAndFront('add', classFlag);

			// size the code field only
			TvrUi.size_hierarchy_inputs(TvrUi.stat.curCodeInput, true);

		},

		size_hierarchy_inputs: function($hierarchyInputs, doScroll){

			// set fields to width of content
			$hierarchyInputs = $hierarchyInputs || TvrUi.get_hierarchy_inputs();

			//console.log('the hierarchy inputs', $hierarchyInputs)

			$hierarchyInputs.each(function(){

				var $this = $(this),
					$testSpan = false,
					extra = 2; // sometimes the text is slightly cropped otherwise especially on mobile

				if ($this.attr('id') === 'code-hierarchy-input'){
					$testSpan = TvrUi.stat.codeInputWidthCalc;
					//extra = 1;
				}

				//console.log('update hierarchy width', $this)

				// scroll here means for the total fields in docked top view
				TvrUi.update_input_width_and_scroll($this, 0, true, true, $testSpan, extra);

				if (doScroll){
					TvrCom.scroll_input_end($this);
				}

			});
		},

		hide_hierarchy_inputs: function(){

			var classFlag = TvrUi.generalTargetingClassFlag+' '+TvrUi.retargetClassFlag;

			TvrUi.adjustClassesOnAdminAndFront('remove', classFlag);
		},

		resetRetargetCSSModifiers: function(){

			var pref_sub_keys = Object.keys(TvrUi.preRetargetModifierConfig);

			//console.log('resetRetargetCSSModifiers', pref_sub_keys, TvrUi.preRetargetModifierConfig)

			for (var i = 0; i < pref_sub_keys.length; i++) {

				var pref_sub_key = pref_sub_keys[i],
					previousConfig = TvrUi.preRetargetModifierConfig[pref_sub_key];

				//console.log('previousConfig', previousConfig);

				if (previousConfig){

					if (previousConfig.wasOn){
						previousConfig.$combined.addClass('on');
						TvrUi.pref[previousConfig.type][pref_sub_key] = 1;
						//console.log('re-turn on', previousConfig.type, pref_sub_key)
					}

					// turn off
					else {
						previousConfig.$combined.removeClass('on');
						delete TvrUi.pref[previousConfig.type][pref_sub_key];
						//console.log('re-turn off', previousConfig.type, pref_sub_key)
					}

				}

			}

			TvrUi.preRetargetModifierConfig = {};
		},

		// when a targeting action has ended (cancelled or saved)
		resetDraftTrackers: function(retargeting, clearCSSModifers, context){

			if (retargeting){

				// cache the references before resetting
				var M = TvrUi.retargetSelector.M;

				TvrUi.retargetSelector = false;
				TvrUi.draft_user_action.retarget = {};

				// restore preRetarget css modifier config (items will be deleted from cache if user manually adjusts checkboxes)
				TvrUi.resetRetargetCSSModifiers();

				if (context === 'afterSave'){

					// only now do we update the CSS styles, doing it instantly before was a bit jarring
					var settings = MTloop.modify_main_js_object('update_section_css',
						{
							savePackage: []
						},
						{
							M: M,
							maxDepth: 'section',
							callbackDepth: ['section'],
							recurse_key: ['m_query'] // tells maybe_recurse to not do important
						}
					);
				}

				//console.log('Updated the style node on retareget save', settings)

			}

			else {
				TvrUi.draftSelector.atts = {};
				TvrUi.draft_user_action.new = {};
			}

			// clean any draft folders that were created (and remove from the tracker array)
			TvrUi.clean_draft_folders();
			TvrUi.folderNameCustomized = false; // reset tracker of user custom folder
			//console.log('UN-setting folderNameCustomized', TvrUi.folderNameCustomized);

			// clear manual add selector label/code form that gets populated when creating a draft selector
			TvrUi.get_set_selector_values({
				action: 'set',
				target: 'popup',
				context: 'add',
				label: '',
				code: '',
				//M: sM
			});

			// clear any filters the user set
			if (clearCSSModifers){
				TvrUi.clear_css_filters(true);
			}

			// ensure auto-name is set back to on for new draft selectors
			TvrUi.enable_selector_auto_name(true);

			// hide additional options
			//console.log('hide additional for reset trackers')
			TvrUi.feature_off(false, 'create_additional_selector');


		},

		// draft folders are not included in savePackage, but HTML will linger in DOM and JS Object, so delete
		clean_draft_folders: function(){

			//console.trace();

			for (var i = TvrUi.draftFolders.length - 1; i >= 0; i--) {

				var draftSectionSlug = TvrUi.draftFolders[i],
					draftSection = TvrCom.checkObject(TvrUi.uiData, [draftSectionSlug]),
					containsSelectors = TvrCom.obj_length(draftSection) > 1; // 1 = [this]

				if (!containsSelectors){

					var $section = $('#strk-'+draftSectionSlug);

					if (TvrCom.isDomEl($section)){

						var M = TvrUi.get_meta($section, 'section');

						TvrUi.action_delete_section(M, true);

						//console.log('Draft folder cleaned', draftSectionSlug)
					}

				}

				// remove from draftFolders array
				TvrUi.draftFolders.splice(i, 1);
			}

		},

		cancel_draft_selector_edit: function(returnToLastViewed, config){

			//console.log('cancel_draft_selector_edit', TvrUi.draftSelector)

			// ensure auto-name is set back to on for new draft selectors
			//TvrUi.enable_selector_auto_name();

			TvrUi.hide_hierarchy_inputs();

			// if retargeting,
			if (TvrUi.retargetSelector){

				//console.log('cancel_draft_selector_edit (retargeting)', $.extend(true, {}, TvrUi.retargetSelector))

				var origAtts = TvrUi.retargetSelector,
					M = TvrUi.get_meta($('#'+TvrUi.selInFocusID), 'selector'),
					newSectionH = M.sectionSlug !== origAtts.sectionSlug ? origAtts.sectionH : false;

				//console.log('Original attributes', origAtts, M)

				// return original selector details to the hierarchy edit fields
				TvrUi.update_current_selector_controls(false, origAtts);

				// remove the isDraftRetarget flag from the JS object
				TvrCom.updateObject(TvrUi.uiData, [M.sectionSlug, M.selectorSlug], false, {
					action: 'delete',
					key: 'isDraftRetarget'
				});

				// return original selector atts in HTML
				TvrUi.get_set_selector_values({
					action: 'set',
					target: 'popup',
					context: 'edit',
					label: origAtts.selectorH,
					code: origAtts.selectorCode,
					M: M
				});

				//console.log('from cancel draft')
				if (!TvrUi.action_modify_selector(
					M,
					TvrUi.stat.editSelectorForm,
					{},
					newSectionH,
					false,
					false,
					true // skip save as targeting changes were not made
				)){

					// reset the retarget state tracker and history objects
					TvrUi.resetDraftTrackers(TvrUi.retargetSelector, true, 'afterCancel');

					// not having the above line could have caused bugs!

					return false;
				}


				// reselect the element so color changes to blue and existing sel appears in the suggestions menu
				if (!TvrUi.doNotReselectRevertedRetargetSel && TvrUi.iframeEditing()){
					//console.log('reselect the element');
					MTF.select_current_selector_elements({scroll: false});

				}

				// reset the draft state tracker and history objects
				//TvrUi.resetDraftTrackers(true);


			}

			// if the user doesn't want to save the new selector
			else {

				//console.log('cancel_draft_selector_edit (new draft)', $.extend(true, {}, TvrUi.draftSelector))

				// delete the draft selector that is creating when selecting an element
				TvrUi.delete_draft_selector();

				// reset the draft state tracker and history objects
				//TvrUi.resetDraftTrackers();

				// return to last viewed selector (when user cancels a new draft with x icon)
				if (returnToLastViewed){
					TvrUi.default_to_sel(config); // has fallback if the selector is unavailable
				}

			}

			// reset the retarget state tracker and history objects
			TvrUi.resetDraftTrackers(TvrUi.retargetSelector, true, 'afterCancel');

			// if gutenberg, clean any unused dynamic classes
			/*if (TvrMT.integrate.gutenberg){
				let B = TvrMT.integrate.gutenberg;
				B.cleanUnusedMTClasses(B.prevBlockEls);
			}*/



		},

		// update the folder > selector trail
		update_current_selector_controls: function(M, stringValues, config){

			config = config || {};

			var folder = M ? M.sectionH : stringValues.sectionH,
				label = M ? M.selectorH : stringValues.selectorH,
				code =  M ? M.selectorCode : stringValues.selectorCode;

			// trail breadcrumbs
			TvrUi.stat.curSecTrailText.text(folder);

			// folder
			TvrUi.stat.curSecInput.val(folder);

			// label
			TvrUi.update_and_scroll_input(TvrUi.stat.curSelInput, label);

			// code
			if (!TvrUi.stat.curCodeInput.is(':focus')){
				TvrUi.update_cur_code(code);
			}

			// if the selector variations menu is showing, update the fields and M cached in context menu data
			if (config.switchSelVariation){

				if (TvrUi.edit_selector_fields_showing()){
					//console.log('We need to update the fields', $.extend(true, {}, TvrUi.context_menu_data));
					TvrUi.context_menu_data.M = M;
					TvrUi.update_edit_selector_fields(M, 'selector', TvrUi.context_menu_data);
				}

			}

			//console.log('update_current_selector_controls', folder, M, stringValues)

			// selector edit fields (unless user is actively editing them)
			// provide an 'x' for these fields for clearing manual val
			// style in same blue way as other fields
			/*if (!TvrUi.stat.curSecInput.hasClass('manual-val')){

			} if (!TvrUi.stat.curSelInput.hasClass('manual-val')){
				//TvrUi.stat.curSelInput.val(label);

			} if (!TvrUi.stat.curCodeInput.hasClass('manual-val') && !TvrUi.stat.curCodeInput.is(':focus')){
				//TvrUi.stat.curCodeInput.val(code);
				TvrUi.update_cur_code(code);
				//console.log('setting the code value again', code, TvrUi.stat.curCodeInput)
			}*/

			// maybe scroll to end of input field
			TvrUi.size_hierarchy_inputs();

			// update the value in the sel wizard tooltip
			/*var ttText = TvrLang.update_selector+':'+"\n"+folder+' >> '+label+"\n";
			//+TvrLang.update_selector_tt
			$('#wizard-update-cur').attr('title', ttText);*/

		},

		// convert common HTML tags to more readable human ones
		human_tagname: function(tag){
			var map = {
				'h1': 'heading 1',
				'h2': 'heading 2',
				'h3': 'heading 3',
				'h4': 'heading 4',
				'h5': 'heading 5',
				'h6': 'heading 6',
				'p': 'paragraph',
				'br': 'line break',
				'hr': 'horizontal rule',
				'abbr': 'abbreviation',
				'b': 'bold',
				'em': 'emphasis',
				'i': 'emphasis',
				'ins': 'insert',
				'pre': 'preformatted',
				'q': 'quote',
				'sub': 'subscript',
				'sup': 'superscript',
				'optgroup': 'option group',
				'img': 'image',
				'figcaption': 'figure caption',
				'a': 'link',
				'ul': 'unordered list',
				'ol': 'ordered list',
				'li': 'list item',
				'th': 'table heading',
				'tr': 'table row',
				'td': 'table data',
				'thead': 'table head',
				'tbody': 'table body',
				'tfoot': 'table foot',
				'col': 'column',
				'colgroup': 'column group'
			}
			// use conversion or fallback to plain tag name.
			return map[tag] ? map[tag] : tag;
		},
		// explain some trickier pseudo classes
		human_pseudo: function(str){
			var pseudoArr = TvrCom.pseudo_str_to_arr(str);
			var pseudo = '';
			for (var i in pseudoArr){
				if ( ! pseudoArr.hasOwnProperty(i) ) continue; // for compat
				// simplify nth pseudos
				pseudo+= pseudoArr[i]
					.replace(/^:nth\-(?:child|of\-type)\((.*)\)$/, '#$1')
					.replace(/^:nth\-last\-(?:child|of\-type)\((.*)\)$/, '#-$1')
					.replace('link', 'unvisited')
			}

			return pseudo ? ' ('+pseudo+')' : '';
		},
		// get id, class, or psuedo without the #.:
		humanize: function(pre, str, config){
			config = config ? config : {};
			config.keepPre = config.keepPre ? pre : '';
			var pattern = new RegExp('('+pre+')([_a-zA-Z0-9'+pre+'\\(\\)\\[\\]=\\^\\*\'"\\/\\$~-]+)', 'g'),
				replace = new RegExp(pre, 'g');
			str = str.match(pattern);
			//console.log(str);
			str = (str && str[0]) ? str[0].replace(replace, config.keepPre) : '';
			if (!config.keepDashes){
				str = str.replace(/[-_]+/g, ' ');
			}
			return str.trim();
		},
		/*ensure_no_unique_sel_name_alert: function(sectionSlug){

			var $input = TvrUi.stat.curSelInput,
				label = $input.val(),
				uniqueLabel = TvrUi.ensure_unique_name(label, false, 'create-new', false, sectionSlug);

			if (label !== uniqueLabel){
				$input.val(uniqueLabel);
			}

		},*/

		// ensure a selector/folder name is unique
		ensure_unique_name: function(name, code, con, obj, sectionSlug){ TvrCom.startT(arguments);
			var i = 1;
			//var mSels = (con == 'create-new') ? TvrUi.get_all_selector_code(true) : {}; // (TvrUi.retargetSelector)
			var folderSelKeys = (con === 'create-new')
				? MTfolder.getFolderSelectorKeys(sectionSlug)
				: {};

			//console.log('ensure_unique_name initial', name, code, con, obj, sectionSlug)

            var altName;
			do {

			    var clash = false,
                    suffixPattern = new RegExp(' _\\d+$');

                if (!name.match(suffixPattern)){
                    altName = (i > 1) ? name + ' _'+i : name;
                }

                else {

                    if (i === 1) {
                        i = 2;
                    }

                    altName = name.replace(suffixPattern, ' _'+i);
                }

				//var suffix = (i > 1) ? ' _'+i+'' : '';
				//var altName = name+suffix;
				var slug = TvrCom.convert_to_param(altName);

				//console.log('folder data', TvrUi.uiData[slug], TvrUi.draftFolders)

				// check for clash
				if (con == 'folderName'){
					clash = TvrUi.uiData[slug];
				} else if (con == 'folderWithSpace'){
					// this is a bit different, existing folders are ok if they have space for sels
					clash = (TvrUi.uiData[slug] && TvrCom.obj_length(TvrUi.uiData[slug], { exclKey: 'this'}) >= TvrUi.maxSelsPerFolder);
				} else if (con == 'import'){
					clash = (obj.unqSels[slug] && obj.unqSels[slug]['code'] != code);
				} else if (con === 'create-new') {

					// check JS map of all selectors for the folder
					for (let i = 0; i < folderSelKeys.length; i++) {
						//console.log('check id vs slug', (folderSelKeys[i] === slug), folderSelKeys[i], slug)
						if (folderSelKeys[i] === slug){
							clash = true;
							break;
						}
					}


					/*for (var id in folderSelKeys) {
						if (folderSelKeys.hasOwnProperty(id)) {

							console.log('check id vs slug', (id === slug), id, slug)

							if (id === slug){
								clash = true;
								break;
							}
						}
					}*/
				}
				i++;
			} while ( clash );
			TvrCom.endT(arguments)

			//console.log('ensure unique result', name, altName, code, con, obj)

			return altName;
		},
		// e.g. div#branding div#site-title = Site Title
		// div#branding img = Branding Image
		// div#site-title a = Site Title Link
		// div.page h1.entry-title = Heading 1 Entry Title
		// Also, do check on Create, with alert about using same selector.
		human_css_name: function(code, short, sectionSlug){ TvrCom.startT(arguments);

			var pieces = [],
				bricksHack = false;

			//console.log('passed in vars', code, short, sectionSlug);


			if (code){

				// Don't include Bricks hack code in name
				bricksHack = code.match(/.bricks-is-frontend\s+(.+?),/);
				if (bricksHack){
					code = bricksHack[1];
					//console.log('We have the Bricks hack', bricksHack);
				}

				// with Gutenberg, use the element tagName instead of the random class
				// as it's a bit more meaningful
				if (TvrMT.integrate.gutenberg && MTF.triggerEl && MTF.triggerEl[0] && code.match(/\bmctr-[0-9a-z]{6}\b/)){
					let tagName = MTF.triggerEl[0].tagName;
					if (tagName){
						code = tagName.toLowerCase();
					}
				}

			}

			// just use first in comma separated rules (with e.g. +5 with comma count)
			var rules = code.split(',');

			// create an array of selector bits, start with the child (reverse)
			// Note: reverse not currently needed as we're not bailing early if e.g. id is found on child (may change)
			var css = TvrUi.sel_trail(rules[0]).pieces.reverse();

			// look for tagName ids, classes, pseudo in each space separated segment of selector
			for (var i in css){

				if ( ! css.hasOwnProperty(i) ) continue; // for compat

				let matchType = css[i].match(/type="([^"]+)"/);

				pieces[i] = {
					'level': (i == 0) ? 'child' : 'parent',
					'tagName': css[i].split(/[#:.\[]/)[0],
					'id': TvrUi.humanize('#', css[i]),
					'class': TvrUi.humanize('\\.', css[i]),
					'pseudo': TvrUi.human_pseudo(css[i]),
					'type': matchType ? matchType[1] : ''
				};
			}

			// word order to match selector, so store in array that can be reversed later
			var desc = [];
			for (var i in pieces){

				if ( ! pieces.hasOwnProperty(i) ) continue; // for compat

				// create description from peices
				var curTagName = '',
					curState = '';

				var p = pieces[i];
				curTagName = TvrUi.human_tagname(p['tagName']);

				// pseudo state?
				if (p['pseudo']){
					curState = ''+p['pseudo']+'';
				}

				// prioritise desc based on what's available
				if (p['id']){
					desc[i] = p['id'];
					// break; // for now, we're going for longer but more descriptive
				} else if (p['class']){
					desc[i] = p['class'];
				} else if (p['type']){
					desc[i] = p['type']+' '+curTagName;
				} else {
					desc[i] = curTagName;
				}

				// always include possible pseudo
				desc[i]+= curState;
			}

		/*	console.log('pieces', pieces);
			console.log('desc', desc);*/

			// we split css on commas, explain if +1 more if found
			var extra = '';
			if (rules[1]){
				var num = rules.length-1;
				// if just one more, combine with & otherwise add + 2 more
				//var extra = (num == 1) ? '& '+TvrUi.human_css_name(rules[1].trim()) : '+'+(num)+' '+TvrLang['more'];
				var extra = '+'+(num)+' '+TvrLang['more']; // just keep it minimal (Bricks selector hack prompted this)
				desc.unshift(extra);
			}
			TvrCom.endT(arguments)
			var onlyEl = desc[0];
			onlyEl+= extra ? ' '+extra : '';
			//full = desc.reverse().join(' '); // modifies order of desc

			var trailLength = extra ? 2 : 1; // without parent, shorter and more readable,
			//var trailLength = extra ? 3 : 2; // 2 actually - try including parent too

			// we skip the parent bit for short labels
			/*if (short){
				--trailLength;
			}*/

			var finalDesc = [];
			for (var j in desc){
				if ( ! desc.hasOwnProperty(j) ) continue; // for compat
				if (j >= trailLength){
					break;
				}
				finalDesc.push(desc[j]);
			}

			//console.log('trail', trailLength, desc, finalDesc)

			var name = finalDesc.reverse().join(' ');

			// tag the auto-corrected Bricks selectors with [BGW] Bricks Grid Workaround
			if (bricksHack){
				name+= ' [BGW]';
			}

			// remove Wp block from description which is used a lot
			let nameBeforeReplacements = name;

			//console.log('nameBeforeReplacements', nameBeforeReplacements);

			name = name
				.replace(/wp block\s?/g, '')
				.replace(/wp\s/g, 'WP ') // uppercase WP

			if (!name){
				name = nameBeforeReplacements;
			}

			// if they have cleared the field, or they have only entered a char that is stripped e.g. #
			// default to Untitled
			if (name === ''){
				name = TvrLang.untitled;
			}


			//console.log('final name', name, finalDesc);

			// do a check to make sure the css selector is unique (add a number)
			//console.log('we should ensure unqique')
			//return TvrUi.ensure_unique_name(name, code, 'create-new'); // try doing this elsewhere

			return name;
		},

		code_or_fallback: function(code){
			return code ? code : TvrUi.intelli_css;
		},
		format_nice_name: function(code, codeSynced, short){
			code = this.code_or_fallback(code);
			return codeSynced ? code : TvrCom.capitalizeFL(TvrUi.human_css_name(code, short));
		},
		update_nice_name: function(niceName, code, codeSynced){

			niceName = niceName || this.format_nice_name(this.code_or_fallback(code), codeSynced);
			//console.log('updating the nice name', niceName);
			this.update_and_scroll_input(TvrUi.stat.curSelInput, niceName);
		},
		update_cur_code: function(code){
			this.update_and_scroll_input(TvrUi.stat.curCodeInput, code);
		},
		update_and_scroll_input: function($input, value){
			$input.val(value);

			if (!TvrUi.doNotResizeInputs){
				TvrUi.size_hierarchy_inputs($input);
			}

			TvrCom.scroll_input_end($input);
		},

		// auto add the name field. (if css not synced)
		/*get_nice_name: function(code, apply, codeOnly){ TvrCom.startT(arguments);

			code = code ? code : TvrUi.intelli_css;

			//console.log('get_nice_name', code, apply, codeOnly)

            TvrCom.startT('capitalizeFL');

            var niceName;

			// if code synced, just use that
			if (codeOnly){
				niceName = code;
			} else {
				// else construct a more human friendly name
				niceName = TvrCom.capitalizeFL(TvrUi.human_css_name(code));
                //niceName = TvrUi.human_css_name(code);
                //niceName = code;
			}

            TvrCom.endT('capitalizeFL');

			var $wizName = TvrUi.stat.curSelInput,
				$wizCode =  TvrUi.stat.curCodeInput;

			// just return name if no need to update field
			// e.g. skip if they are actively editing - focus without auto-selection of text
			if (!apply || ($wizName.is(':focus') && !TvrCom.isTextSelected( $wizName[0]) )
			){
				var ts = !TvrCom.isTextSelected( $wizName[0] ) ? true : false;
                TvrCom.endT(arguments);
				return niceName;
			}


			// update input values
			$wizName.val(niceName);
			TvrCom.scroll_input_end($wizName);

			//$wizCode.val(code);
			//TvrCom.scroll_input_end($wizCode);

			// auto-select text as long as we're not in hover mode, or editing a suggested sel, or psuedo :nth() input
			if (TvrUi.el_selected){
				//TvrUi.maybe_auto_select_label(); // temp
			}

            TvrCom.endT(arguments);

		},*/

		// auto select the targeting label for easy editing
		maybe_auto_select_label: function($wizName){

		    $wizName = $wizName ? $wizName : $('#sel-hierarchy-input');

			var $focus_input = TvrUi.stat.suggestionsAdvanced.find('.code-suggestion.in-focus').find('input.sug-sel'),
                $nthInputFocus = TvrUi.stat.cssModifiers.find('input.cssfilter-combo:focus'),
                $htmlInspectorFocus = $('#wizard_inspector_html').find('textarea:focus');

			if ( !TvrUi.pref['selname_code_synced']
				&& !$focus_input.is(':focus')
				&& !$nthInputFocus.length
                && !$htmlInspectorFocus.length

                // bug where elementor blur event isn't triggered by auto-selecting the label
                // this results in Elementor styles not working
                // this is a quick fix, a better solution may be out there
                && !TvrMT.integrate.elementor
			){
				$wizName.trigger('select');
			}
		},

		set_initial_size_of_nth_modifier_inputs: function(){

			$('#cm-css-filters').find('.cssfilter-combo').each(function(){
				TvrUi.update_input_width_and_scroll(
					$(this), 0, true, true, TvrUi.stat.codeInputWidthCalc
				);
			});

		},

		preRetargetModifierConfig: {},

		// the selector code has been changed - update the modifiers
		// todo - also need this to work when ace editor is updated. BTW re-target might need some work.
		sync_selector_modifiers: function(code, excludePageSpecific){ TvrCom.startT(arguments);

			var activeModifiers = TvrUi.get_active_modifiers_from_selector(code).active;

			TvrUi.stat.cssModifiers.find('li.css-filter-item').each(function(i){

				var $this = $(this),
					data = $this.data(),
					type = data.type,
					filterKey = data.filter,
					on = $this.hasClass('on'),
					shouldTurnOn = !on && activeModifiers[filterKey],
					shouldTurnOff = on && !activeModifiers[filterKey];


				// we don't sync page specific pseudos when typing as they should remain locked
				if (!excludePageSpecific || type !== 'page_specific'){

					if (shouldTurnOn || shouldTurnOff){

						var $alias = TvrUi.get_css_filter_alias($this),
							$combined = $this;

						if ($alias.length){
							$combined = $combined.add($alias);
						}

						// turn on
						if (shouldTurnOn){
							$combined.addClass('on');
							TvrUi.pref[type][data.pref_sub_key] = 1;
							//console.log('turn on', type, data.pref_sub_key, TvrUi.pref)
						}

						// turn off
						else {
							$combined.removeClass('on');
							delete TvrUi.pref[type][data.pref_sub_key];
							//console.log('turn off', type, data.pref_sub_key, TvrUi.pref)
						}

						// store the orig config, this will be returned when retarget finishes,
						// unless the user manually adjusts a checkbox, in which case their new setting will be locked
						if (type === 'page_specific'){
							TvrUi.preRetargetModifierConfig[data.pref_sub_key] = {
								wasOn: !shouldTurnOn,
								$combined: $combined,
								type: type
							}
						}


					}

				}




			});

			//console.log('sync happened', TvrUi.preRetargetModifierConfig);

			TvrCom.endT(arguments);

		},

		// read the pseudo selectors / elements from the code to sync the UI checkboxes
		get_active_modifiers_from_selector: function(code){ TvrCom.startT(arguments);

				// ((?:::?)|\.mtp?-)([a-zA-Z0-9-]+)(?:\((.+?)\))?

			var customPrefix = TvrUi.pref['custom-prefix-extraValue']
					? "|("+TvrCom.escapeRegExp(TvrUi.pref['custom-prefix-extraValue'])+")"
					: '',
				pattern = "(?:((?:::?)|\\.mtp?-)([a-zA-Z0-9-]+)(?:\\((.+?)\\))?)"+customPrefix,
				regPattern = new RegExp(pattern, 'g'),
				ignorePattern = /^:(nth|not|first|last)/;

			//console.log('the reg pattern', regPattern)

			var	matches = TvrCom.get_all_matches(code, regPattern, 0, {
					itemObj: 1
				}),
				len = matches.length,
				results = {
					matches: matches,
					active: {}
				};

			if (len){

				for (var i = len-1; i >= 0; i--) {

					var item = matches[i],
						fullMatch = item.match[0];

					if (fullMatch.match(ignorePattern)){
						matches.splice(i, 1);
					}

					else {

						var filterKey = fullMatch,
							firstCap = item.match[1];

						// if it's a page id or slug, adjust the key
						if (firstCap !== ':' && firstCap !== '::'){

							if (item.match[4]){
								filterKey = 'custom-prefix';
							}

							else {
								filterKey = TvrCom.isNumeric(item.match[2])
									? 'page-id'
									: 'page-name';
							}
						}

						results.active[filterKey] = item;
					}
				}

			}

			//console.log('the code check', code, results);

			TvrCom.endT(arguments);

			return results;

		},

		// maybe update the recent custom prefixes menu if current (valid) prefix isn't already in it
		maybeUpdateRecentCustomPrefixes: function(dom){

			var customPrefix =  TvrCom.checkObject(dom, ['search', 'customPrefix']),
				prefix = TvrUi.pref['custom-prefix-extraValue'],
				maxRecent = 10,
				recent = TvrUi.pref.recent_custom_prefixes;

			//console.log('maybeUpdateRecentCustomPrefixes', prefix, customPrefix, recent, dom);

			if (prefix && customPrefix.$el && !TvrCom.in_array(prefix, recent)){

				// insert prefix at the beginning
				recent.unshift(prefix);

				// remove last item if we reached max
				if (recent.length > maxRecent){
					recent.pop();
				}

				//console.log('Added new prefix and try to save', prefix, recent);

				// save array of recent prefixes
				MTsave.simple_ajax_request({
					'type': 'POST',
					'url': TvrUi.ajaxUrl+'&update_recent_custom_prefixes=1',
					'sendData': MTsave.serialized_data_with_single_key( JSON.stringify(recent)  ),
					'plus': '',
					'minus': ''
				});

			}

		},

		maybe_disable_other_page_prefixes: function($obj, data, config){

			var $pageSpecificItems = TvrUi.stat.cssModifiers
				.find('.flist-page_specific')
				.find('.mt-ui-toggle')
				.not('[data-filter="'+$obj.data('filter')+'"]');

			//console.log('maybe_disable_other_page_prefixes ', $pageSpecificItems, $obj);

			$pageSpecificItems.each(function(i){

				var $li = $(this),
					itemData = $li.data();

				if ( TvrUi.pref.page_specific[itemData.pref_sub_key] ){

					//console.log('we need to turn off ', itemData);

					TvrUi.feature_off($li, 'page_specific', {
						turningOffOtherPagePrefix: 1,
						toggle:1,
						doNotSelectEl: true
					});
				}

			});



		},

		// actions to trigger when a pseudo is updated
		pseudo_updated: function($obj, config){

			//TvrCom.callStack();

			var $li = $obj.closest('li'),
				data = $li.data(),
				aspect = data.aspect,
				pref_sub_key = data.pref_sub_key;

			// pseudo has been manually updated so remove modifier reset that may exist
			if (TvrUi.preRetargetModifierConfig[pref_sub_key]){
				//console.log('deleted the modifier revert', data.pref_sub_key);
				delete TvrUi.preRetargetModifierConfig[pref_sub_key];
			}

			// with page_specific, we only allow one to be turned on now
			// it's less bloat to enforce page-name/id are not both on
			// and for custom-prefix, the logic gets unworkable if the other prefixes are active
			if (aspect === 'page_specific'
				&& !config.turningOffOtherPagePrefix
				&& !config.skipOtherPagePrefixCheck){
				TvrUi.maybe_disable_other_page_prefixes($li, data, config);
			}

			// update input width if the form field was adjusted
			if (config.input){

				// sync alias
				/*var $alias = TvrUi.get_css_filter_alias($obj);

				if (TvrCom.isDomEl($alias)){
					$alias = $alias.find('input.combobox')
					$alias.val( $obj.val() );

					console.log('update the width', $alias)
					TvrUi.update_input_width_and_scroll($alias, 4, true);
				}*/

				// if the custom prefix was adjusted by typing or a combo select
				if (pref_sub_key === 'custom-prefix'){

					var prevValue = TvrUi.pref[pref_sub_key+'-extraValue'],
						isOn = TvrUi.pref[aspect][pref_sub_key];

					// and the prefix was enabled with a defined value
					if (parseInt(isOn) && TvrCom.isDefined(prevValue)){

						//console.log('running turn off pseudo temporarily for prev value', prevValue, aspect, pref_sub_key);

						// remove the previous prefix by running pseudo updated with the pref temp turned off
						delete TvrUi.pref[aspect][pref_sub_key];

						TvrUi.pseudo_updated($li, {
							toggle: 1,
							turnOn: 0,
							doNotSelectEl: true,
							skipOtherPagePrefixCheck: 1
						});

						// resume normal state
						TvrUi.pref[aspect][pref_sub_key] = isOn;

						//console.log('resume normal on state', aspect, pref_sub_key);

					}

					// set the new prefix value
					TvrUi.pref[pref_sub_key+'-extraValue'] = $obj.val().trim();

					// run another dom search to check if prefix is valid for the current selection
					MTF.search_parents_and_descendents(MTF.triggerEl, {});

					// prefix will not apply if there is no valid element, so clear value in memory
					// this will be set (and saved at the bottom of this function)
					// when the next valid prefix is entered
					if (!MTF.dom.search.customPrefix.$el){
						TvrUi.pref[pref_sub_key+'-extraValue'] = '';
					}



					//console.log('Updated the new custom prefix', TvrUi.pref[pref_sub_key+'-extraValue']);

				}

				// update input width for :nth formulas
				else {
					//console.log('the $obj', $obj)
					TvrUi.update_input_width_and_scroll($obj, 0, true, true, TvrUi.stat.codeInputWidthCalc);
				}


			}

			// we just need to loop the advanced suggestions, and update the context menu equiv as we go
			var $sugList = TvrUi.stat.suggestionsAdvanced.find('.code-suggestions');

			// it's possible an existing selector may be selected,
			// but the user has clicked a hover or page-id shortcut toggle
			// in which case switch to the first code option
			if (config.turnOn && TvrUi.existingSelSelected && !config.doNotSelectEl){

				TvrUi.sug_css_clicked(
					$sugList.find('.code-suggestion:first-child').find('.sugsel-radio')
				);

				//console.log('Switching to new suggestion', config);
			}

			// manually adjust all suggestions and their combobox data. Full rebuild had problems:
			// Editing e.g. 3rd sug, MT would rebuild and jump to first sug.
			$sugList.find('.code-suggestion').each(function(index){

                config.manual = 1;
                config.$li = $li; // filter li

				var $sug = $(this),
					$input = $sug.find('.sug-sel'),

					refKey = $input.attr('rel'),
					level = $sug.data('level');

				// the manual val does not have level set, default to 0 so pseudos get set
				if (!TvrCom.isDefined(level)){
					level = 0;
				}

				//console.log('debug', $input.val(), level, MTF.dom.search.nodes[level], MTF.dom.search, MTF.dom, config)

				var unmodified = $input.val();

				var filter = MTF.apply_css_filters( unmodified, MTF.dom.search.nodes[level], MTF.dom, config ),

					// get associated context menu input
					$contextMenuInput = TvrUi.stat.suggestionsMenu
						.find('.code-suggestion:nth-child('+(index+1)+')')
						.find('.sug-sel'),

					// combine for certain operations
					$bothInputs = $input.add($contextMenuInput);

				// update both input values
				$bothInputs.val( filter['code'] );

				// todo - when removing a body prefix, the level should adjust, but how to do that efficiently?
				// nonPrefixLevel stored on node? no, we would need to search up nodes looking for class/id

				//console.log('we have $bothInputs', $bothInputs, filter['code'], 'unmod', unmodified)

				// ensure data is there to be modified
				if (!MTF.dom.sels.final[index] || MTF.dom.sels.final[index].refKey !== refKey){
					return true; // continue
				}

				var updateLevel = false;

				if (aspect === 'page_specific'){ // && filter.prefixDisabled
					updateLevel = MTF.get_parent_level_from_selector(filter['code'], level);
					if (updateLevel === level){
						updateLevel = false;
					}
					//console.log('try to get updateLevel', filter['code'])
				}

                // update the dom sels object for set_quick_go_options which gets called again below
				MTF.dom.sels.final[index]['code'] = filter['code'];

				//console.log('Check sel data', filter['code'], level, updateLevel, aspect, filter.prefixDisabled, filter, unmodified);

				// ensure inputs are scrolled to the right, so element selector is visible
				$bothInputs.each(function(){

					var $this = $(this);

					$this.get(0).scrollLeft = $input.get(0).scrollWidth;

					if (updateLevel !== false){
						$this.closest('.code-suggestion')
							.attr('data-level', updateLevel)
							.data('level', updateLevel)
						//console.log('Updated the level for ', $input.val(), level, updateLevel);
					}
				})

				// update the combobox data too - todo combo data needs to maintain level info (array of objects)
				var comboRef = $input.attr('rel');

				if (comboRef && MTF.dom.sels.combo[comboRef]){

					TvrUi.apply_filter_to_combo_data(MTF.dom.sels.combo[comboRef], config); // , level

					/*for (var i = 0; i < MTF.dom.sels.combo[comboRef].length; i++) {
						var val = MTF.dom.sels.combo[comboRef][i],
							code = typeof val === 'object' ? val.value : val;

						filter = MTF.apply_css_filters( code, MTF.dom.search.nodes[level], MTF.dom, config );
						MTF.dom.sels.combo[comboRef][i] = filter['code'];
					}*/
				}

			});

			// we also need to update the CSS modifier in the full set of suggestions at the top
			TvrUi.apply_filter_to_combo_data(TvrMT.data.prog.combo.all_sel_suggestions, config);

			// when switching selector variation, we don't want unnecessary select_element calls,
			// so bail now that the selector suggestions have been updated
			if (config.doNotSelectEl){
				return;
			}

			// we want the current focus item, or the first if no option is in focus
			var $codeItems = $sugList.find('.code-suggestion:first-child, .code-suggestion.in-focus');

			if ($codeItems.length){

				var $focusItem = $codeItems.filter('.in-focus');
				if (!$focusItem){
					$focusItem = $focusItem[0];
				}

				var $editedField = $focusItem.find('input');

				// must come after suggestions have been built
				//MTF.existing_selector_options(MTF.triggerEl);

				TvrUi.sug_sel_updated({
					$editedField: $editedField,
					val: $editedField.val(),
					pseudoUpdated: 1,
				});


			}

			// if there are no suggestions it's because pseudo previously resulted in zero els targeted
			// and the suggestions were invalid from the point of starting targeting.
			// So reselect the target element to overcome
			else {

				if (TvrCom.isDomEl(MTF.triggerEl)){
					MTF.select_element(MTF.triggerEl, {
						forceHighlight: 1
					});
				}
			}


			// save the custom prefix
			if (config.input && pref_sub_key === 'custom-prefix'){

				TvrCom.action_after_timeout('after_pseudo_updated_by_input', 50, {
					item: function(){

						MTsave.save_ui_toggle_update(
							aspect,
							parseInt(TvrUi.pref[aspect][pref_sub_key]),
							'&pref_sub_key='+pref_sub_key+'&extraValue='+TvrUi.pref[pref_sub_key+'-extraValue']
						);

						//console.log('Saved the new custom prefix', pref_sub_key, TvrUi.pref[pref_sub_key+'-extraValue'], config);


					},
					args: []
				});


			}


		},

		apply_filter_to_combo_data: function(data, config, manualValCode){ // , level (we need to get level from the data

			for (var i = 0; i < data.length; i++) {

				var item = data[i],
					isObject = (typeof item === 'object'),
					code = isObject ? item.value : item,
					level = (isObject && item.level !== undefined)
						? item.level
						: 0;

				//console.log('The level from the data', level, $.extend(true, {}, item), item.level)

				/* No - we want the level to be extracted from the data as it changes
				if (level === undefined){
					level = (isObject && item.level !== undefined)
						? item.level
						: 0;
				}*/

				var filter = MTF.apply_css_filters( code, MTF.dom.search.nodes[level], MTF.dom, config ),
					newCode = filter['code'];

				//console.log('the filter change', code, newCode, filter, config);

				if (isObject){
					data[i].label = newCode;
					data[i].value = newCode;
				} else {
					data[i] = newCode;
				}

			}
		},

		maybe_run_code_or_synced_label_field_edited: function($this, ui){

			var codeFieldEdited = $this.hasClass('code-hierarchy-input'),
				syncedLabelFieldEdited = (
					TvrUi.pref.selname_code_synced && $this.hasClass('sel-hierarchy-input')
				);

			if (codeFieldEdited || syncedLabelFieldEdited){

				var inputValue = $this.val();

				// if code and label inputs are synced, update other one
				if (TvrUi.pref.selname_code_synced){
					var $otherHierarchyInput = codeFieldEdited
						? TvrUi.stat.curSelInput
						: TvrUi.stat.curCodeInput;
					$otherHierarchyInput.val(inputValue);
				}

				TvrUi.sug_sel_updated({
					$editedField: $this,
					val: inputValue,
					suggestionCustomised: !ui,
					syncedLabelFieldEdited: syncedLabelFieldEdited,
					codeFieldEdited: codeFieldEdited,
					topFieldEdited: 1,
					comboSelected: !!ui,
					topComboSelected: 1,
					ui: ui
				});
			}
		},

		// helper function for synchronising values between the hierarchy field, advanced, and frontend
		suggestion_instances: function(config){

			// function to apply one or more passed in actions
			function doAction(action, config, results){

				switch(action) {
					case 'getInputs':
					case 'setInputs':
						var $inputs = $items.find('input[type=text]')
							.addBack('input[type=text]') // curCode input may included in items set
							.not(exclInput);

						//console.log('the inputs to get/set', $inputs, 'excl', exclInput);
						if (action === 'setInputs'){

							$inputs.each(function(){
								var $this = $(this);
								$this.val(config.val);
								TvrCom.scroll_input_end($this);
								//console.log('input set', config.val, $this);
							});
						}
						results.$inputs = $inputs;
						break;
					case 'getN':
					case 'setN':
						var $nWrap = $items.find('.num-els-icon-wrap');
						if (action === 'setN'){
							//console.log('set the N', $nWrap, config)
							$nWrap.html( TvrUi.num_els_icon(config.n));
						}
						results.$nWrap = $nWrap;
						break
					case 'radioSelection':
						$items
							.closest('.radio-set-container')
							.find('.mt-selector-suggestion')
							.removeClass('hover-elsewhere in-focus');
						$items.addClass('in-focus');
						//console.log('radioSelection', $items);
						break;
				}
			}

			var exclItem = config.exclItem || '#invalid',
				exclInput = config.exclInput || '#invalid',
				itemFilter = config.itemFilter || '.mt-selector-suggestion.in-focus', // can adapt for updating all e.g. when setting pseudo
				$potentialItems = TvrUi.bothSuggestionAreas(itemFilter);

			//TvrUi.stat.suggestionsAdvanced.find(itemFilter).add(TvrUi.stat.suggestionsMenu.find(itemFilter));

			// we only occasionally want to sync the curCodeInput, so require explicit inclusion
			if (config.incCurCode){
				$potentialItems = $potentialItems.add(TvrUi.stat.curCodeInput);
			}

			//console.log('$potentialItems', $potentialItems)

			var $items = config.$items || $potentialItems.not(exclItem),
			results = {
				$items: $items
			};

			// normalise to array of actions if single passed
			if (!Array.isArray(config.action)){
				config.action = [config.action];
			}

			//console.log('$items', $items)

			// apply actions
			for (var i = 0; i < config.action.length; i++) {
				doAction(config.action[i], config, results);
				//console.log('running the action', config.action[i]);
			}

			//console.log('the item collection', $items, config);

			return results;
		},

		customCSSN: 0,
		show_suggestion_refresh_icon: function($input, n, val){

			TvrUi.customCSSN = n;

			if ($input){
				$input.siblings('.mt-clear-field')
					.addClass('refresh-code-suggestions')
					.attr('title', TvrLang.refresh_suggestions);
			}

		},
		hide_suggestion_refresh_icon: function($input){

			TvrUi.customCSSN = 0;

			if ($input){
				$input.siblings('.mt-clear-field')
					.removeClass('refresh-code-suggestions')
					.attr('title', '');
			}

		},
		refresh_code_suggestions: function($clicked){
			if (TvrUi.iframeEditing()){
				//console.log('TvrUi.customCSSN', TvrUi.customCSSN)
				var val = $clicked.siblings('input').val();

				MTF.select_element(MTF.triggerEl, {
					suggestionCustomisedForNewEl: 1,
					customCSSVal: val,
					forceHighlight: 1,
					// mark that the pseudo was selected
					pseudoSelected: TvrCom.get_before_after(val, 1)
				});

				// build new suggestions for the new DOM el
				/*MTF.build_selector_suggestions({
					customCSSN: TvrUi.customCSSN,
					customCSSVal: val,
					notInSugList:val
				});

				// update the DOM
				TvrUi.update_selector_suggestions({});*/
			}
		},

		/*reposition_and_hide_suggestion_refresh_icon: function(config, $editedField, val){

			TvrUi.intelli_css = val;

			// update the overlays
			MTF.reposition_overlays({
				scroll: config.scroll,
				con: 'intelli'
			});

			if ($editedField){
				TvrUi.hide_suggestion_refresh_icon($editedField);
			}
		},*/

		// actions to trigger when sug-sel is manually edited or combo selection is made
		sug_sel_updated: function(config){

			//console.log('sug_sel_updated', $.extend(true, {}, config));
			//console.trace();

			// validate the new selector
			var val = TvrUi.strip_beyoned_brace(config.val),
				$editedField = config.$editedField,
				els = MTF.get_sel_elements({
					con: 'sug_sel_updated',
					css: val
				}),
				n = els.n,
				$triggerEl = els.$toEls,

				// for determining if the refresh suggestions icon should display
				// (just need to know if it's a valid selector not in orig list)
				notInSugList = !TvrCom.in_array(val, MTF.dom.sels.final, false, 'code'),
				notInSugListValid = n && notInSugList,

				// if the custom CSS changed from the orig triggerEl to a new el,
				// we need to refresh the existing selectors, which might apply)
				suggestionCustomisedForNewEl = (n && !els.triggerElInNewSelection), // config.suggestionCustomised &&
				uiActions = [],

				// common targeting config shared by resume radio and and new suggestion
				reTargetingConfig = {
					e: {},
					doNotFocusEditor: 1,
					//onlyDoHTMLScroll: true,
					doNotUpdateDomSearch: !suggestionCustomisedForNewEl && !config.customPrefixChanged,
					doNotUpdateSelectorSuggestions: 1,
					customCSSVal: val,
					//radioNth: config.radioNth,
					scroll: suggestionCustomisedForNewEl,
					sugSelUpdatedConfig: config,
					notInSugList: (notInSugList ? val : undefined),
					suggestionCustomisedForNewEl: suggestionCustomisedForNewEl,
					forceHighlight: 1,
					pseudoSelected: TvrCom.get_before_after(val, 1),
					addPseudoBaseStyles: config.addPseudoBaseStyles,
					switchSelVariation: config.switchSelVariation,
					doNotRepositionOverlays: config.doNotRepositionOverlays
				};

			// Step 1 - do all of the UI state updated
			//console.log('sug updated els', val, els, $triggerEl, $.extend(true, {}, reTargetingConfig), $.extend(true, {}, config));

			// update intelli_css which normally get updated in rebuild suggestions, but we're not running that
			TvrUi.intelli_css = val;
			//console.log('Updated TvrUi.intelli_css via sug_sel_updated to ', TvrUi.intelli_css);

			// update the active breadcrumb, as they may not be updated by a reselect


			// switch focus if the user clicked an input or the radio button
			if (config.radioSelection){

				//console.log('we do radio selection', val, config)

				var filterClass = config.isExisting ? 'mt-matching-item' : 'code-suggestion',
					radioIndex = config.$item.index();

				TvrUi.suggestion_instances({
					action: 'radioSelection',
					itemFilter: '.'+filterClass+':nth-child('+(radioIndex+1)+')',
					val: val
				});

				// for existing selectors, simply navigate, this reselects element
				if (config.isExisting){

					var existingSelector = config.$item.data();

					TvrUi.doNotReselectRevertedRetargetSel = 1;
					TvrUi.existingSelRadioUsed = 1;
					TvrUi.resume_existing_or_set_draft_selector(MTF.triggerEl, MTF.dom, {
						existingSelector: existingSelector,
						forceResume: 1,
						updateHighlighting: 1,
						scroll: 1,
						doNotUpdateSelectorSuggestions: 1,
						elementAlreadySelected: 0
					});
					TvrUi.doNotReselectRevertedRetargetSel = false;
					TvrUi.existingSelRadioUsed = 0;


					// close additional selector options
					TvrUi.feature_off(false, 'create_additional_selector');

					return;

				}

			}



			// provide a tick/refresh icon to update the alternative suggestions if a valid new el is being targeted
			if (config.suggestionCustomised && notInSugListValid) {
				TvrUi.show_suggestion_refresh_icon($editedField, n, val);
			} else {
				TvrUi.hide_suggestion_refresh_icon($editedField);
			}

			if (config.suggestionCustomised){
				TvrUi.sync_selector_modifiers(val, true);
			}

			// update the N number for fields that show that
			uiActions.push('setN');

			// scroll combo that was selected (the synced inputs will scroll right when values are updated)
			if (config.comboSelected){
				TvrCom.scroll_input_end(config.$editedField);
			}

			// for top dropdown, ensure the relevant combo is radio selected for the value in the category
			if (config.topComboSelected){
				uiActions.push('radioSelection');
			}

			// update the inputs
			uiActions.push('setInputs');

			//console.log('run sug instances', uiActions, config)

			// ge the right filter for the item
			var itemFilter = false;
			if (config.comboSelected){
				itemFilter = '.code-suggestion.refKey-'+config.ui.item.refKey;
			} else if (config.topComboSelected || config.stateSelectorSet){
				itemFilter = '.code-suggestion:first-child';
			}

			// sync the inputs / radios (if applicable) / N number
			TvrUi.suggestion_instances({
				action: uiActions,
				val: val,
				n: n,
				incCurCode: 1,
				exclInput: $editedField,
				itemFilter: itemFilter
			});

			if (parseInt(TvrUi.pref.selector_auto_name)){
				TvrUi.update_nice_name(false, val, TvrUi.pref.selname_code_synced);
			} /*else {
				// we don't want any possibility of non-unique name the alert
				TvrUi.ensure_no_unique_sel_name_alert();
			}*/

			// Step 2 - select the element again so that the selector modify / custom code editor code update runs

			//console.log('select element after sug change', $triggerEl, reTargetingConfig)

			// reselect (run even if no triggerEl)
			MTF.select_element($triggerEl, reTargetingConfig);

			// save for combining if user holds shift when targeting
			TvrUi.previous_selector = val;

		},




		// hovering over a suggested seletor can be triggered from advanced targeting or frontend
		/*sug_sel_mouseenter: function($hov){
			TvrUi.intelli_css = $hov.hasClass('mt-el-quick-item') ? $hov.data('code'): $hov.val();
			TvrUi.stat.codeSuggestions.find('.code-suggestion.in-focus').addClass('hover-elsewhere');
            //console.log('enable sug sel highlight')
			TvrUi.feature_on(0, 'mt_highlight', {
				// turn off any wizard highlighting first
				offFirst: {fHTML:1, noSave:1},
				fHTML:1,
				noSave:1,
				con: 'intelli',
				css: TvrUi.intelli_css,
				scroll: 0
			});
		},*/
		/*sug_sel_mouseleave: function(){
			var $focusSug = TvrUi.stat.codeSuggestions.find('.code-suggestion.in-focus');

			// mouseleave can be triggered from quick create click
			// The menu dissappears and so do suggestions so no need to revert to focus targeting
			if (!TvrCom.isDomEl($focusSug)){
				return;
			}

			$focusSug.removeClass('hover-elsewhere');
			TvrUi.intelli_css = $focusSug.find('.sug-sel').val();
			if (TvrUi.iframeEditing()){
				MTF.reposition_overlays({con:'intelli', scroll:0});
			}
		},*/

		default_code_suggestion: function(item, config, fallBack){

			//console.log('default_code_suggestion', item, config, fallBack);

			if (config.intelli_css){
				return config.intelli_css;
			} else if (config.customCSSVal){
				return config.customCSSVal;
			} else if (item){
				return item['code']
			} else {
				return fallBack;
			}
		},



		/*** update selector wizard targeting suggestions ***/
		update_selector_suggestions: function(config){ TvrCom.startT(arguments);

			if (!MTF.dom.sels.final){
				return;
			}

			var opts = '',
				inFocusIndex = 0,

				// the selector code field at the top should provide a convenient way to search all selectors, without knowing num els
				totalSuggestionsComboData = [];


			//console.log('update_selector_suggestions', config);
			//console.trace();

			// format suggestions HTML
			for (var i = 0; i < MTF.dom.sels.final.length; i++) {

				var item = MTF.dom.sels.final[i],
					id = 'id="code-suggestion-'+i+'"', // i don't think this is needed
					level = item['level'],
					combo = (item['isCombo']) ? ' combobox has-arrows' : '',
					appTo = combo ? 'data-appto="#style-components"' : '',
					inpWrapClass = (item['isCombo']) ? ' combobox-has-arrows ' : '',
					arrow = combo ? '<span class="combo-arrow"></span>' : '',
					plus = combo && item['refKey'] === 'x_plus' ? '<sup>+</sup>' : '',
					plusInTitle = plus ? '+' : '',
					refKeyRel = combo ? 'rel="'+item['refKey']+'"' : '',
					code = TvrCom.regular_escape_quotes(item['code']),
					n = item['n'],
					inFocusClass = (i < 1 && (TvrUi.retargetSelector || !MTF.dom.mSelsCount || config.customCSSVal)) ? ' in-focus' : '',
					constructedCombo = false;

				// for the first item, maybe use a custom val
				if (i < 1){

					var origCode = code;

					code = TvrUi.default_code_suggestion(item, config, code);

					//console.log('We set the default selector', code !== origCode, item, config, code, origCode)

					// update n if different code
					if (code !== origCode){
						let origN = n;
						n = MTF.jquery_compat_sel_elements(code).length;
						level = MTF.get_parent_level_from_selector(code, level);

						// we need to make it a combo if not already, otherwise we wipe out the original
						// single element selector
						if (!combo){
							constructedCombo = true;
							let comboKey = 'existing_new_combined';
							combo =  ' combobox has-arrows';
							appTo ='data-appto="#style-components"';
							inpWrapClass = ' combobox-has-arrows ';
							arrow = '<span class="combo-arrow"></span>';
							refKeyRel = 'rel="'+comboKey+'"';
							MTF.dom.sels.combo[comboKey] = [code, origCode];
						}
					}
				}

				if (config.active_css === code){
					inFocusIndex = i;
				}

				var datLevel = 'data-level="'+level+'"';

				// update total suggestions combo data
				if (combo && !constructedCombo){
					Array.prototype.push.apply(totalSuggestionsComboData, MTF.dom.sels.combo[item['refKey']]);
					//console.log('merging combo array ', i, item['refKey'], MTF.dom.sels.combo[item['refKey']], code)
				} else {
					totalSuggestionsComboData.push(MTF.formattedSelSugItem(item, MTF.dom));
					//console.log('Adding single item ', i, item['refKey'], item, code)
				}

				opts+= '<div class="code-suggestion mt-selector-suggestion refKey-'+item['refKey']+inFocusClass+'" '+datLevel+'>'+
					TvrMT.data.templates.new_sel_radio +
					'<span class="tvr-input-wrap'+inpWrapClass+'">'+
					'<input type="text" spellcheck="false" class="sug-sel'+combo+'" value="'+TvrCom.regular_escape_quotes(code)+'" '+refKeyRel+' '+appTo+' />'+arrow+
					'<span class="mt-clear-field"></span>'+
					'</span>'+
					'<span class="num-els-icon-wrap">'+
					TvrUi.num_els_icon(n, plusInTitle)+
					'</span>'+
					'</div>';
			}

			//console.log('MTF.dom.sels.combo', MTF.dom.sels.combo);

			// update advanced suggestions list
			TvrUi.redo_sug_sels(opts, {
				advanced: 1,
				inFocusIndex
			});

			// update frontend suggestions list
			TvrUi.redo_sug_sels(opts, {
				frontend: 1,
				inFocusIndex
			});

			// do we update the label and code fields at the top
			if (!config.selectCurrentSelector){

				// update the top input fields (label and code
				var code = TvrUi.code_or_fallback(false);

				if (parseInt(TvrUi.pref.selector_auto_name)){
					TvrUi.update_nice_name(false, code, TvrUi.pref['selname_code_synced']);
				}

				TvrUi.update_cur_code(code);

				// save for combining if user holds shift when targeting
				TvrUi.previous_selector = code;

				//console.log('we do update hierarchy', $.extend(true, {}, config))

			}

			// update the combo data
			TvrMT.data.prog.combo.all_sel_suggestions = totalSuggestionsComboData;

			TvrCom.endT(arguments)
		},

		otherFilters: function(filter, $excludeThis){

			var $areas = TvrUi.bothSuggestionAreas('.fav-filters').add('#cm-css-filters'),
				$items = $areas.find(filter);

			if ($excludeThis){
				$items = $items.not($excludeThis);
			}

			return $items;
		},

		bothSuggestionAreas: function(filter){

			var $areas = TvrUi.stat.suggestionsAdvanced.add(TvrUi.stat.suggestionsMenu);

			return filter ? $areas.find(filter) : $areas;
		},

		// repopulate the suggested sels, without overwriting manually edited sel
		redo_sug_sels: function(opts, config){ TvrCom.startT(arguments)

			config = config || {};

			var $opts = $(opts),
				$sugList;

			// Set focus class
			/*let nth = config.inFocusIndex
				? config.inFocusIndex + 1
				: 1;*/

			//$opts.find('.code-suggestion:nth-child('+nth+')').addClass('in-focus');


			if (config.frontend){
				$sugList = TvrUi.stat.suggestionsMenu
			} else if (config.advanced){
				$sugList = TvrUi.stat.suggestionsAdvanced
			} else {
				$sugList = TvrUi.bothSuggestionAreas();
			}

			// add to dom
			//console.log('redo_sug_sels', config);
			//console.trace();

			$sugList.find('.code-suggestions').html($opts);

			/*$sugList.find('.code-suggestion:nth-child('+nth+')').addClass('in-focus');

			console.log('Go to nth item', nth, $sugList.find('.code-suggestion:nth-child('+nth+')'), '.code-suggestion:nth-child('+nth+')');*/

			TvrCom.endT(arguments)

			// apply focus class
			//$sugList.find('li').first().addClass('in-focus');

			// update num els on the selector too
			/*var $nameRow = TvrUi.stat.selectorNaming.find('.wiz-name');
			$nameRow.find('.num-els-icon-wrap')
				.html( TvrUi.num_els_icon($focus.find('.num-els-icon').text()) );*/

			// ensure inputs are scrolled to the right, so element selector is visible
			/*$sugList.find('input.sug-sel').add( $('#sel-hierarchy-input') ).each(function(){
				var $this = $(this);
				$this.get(0).scrollLeft = $this.get(0).scrollWidth;
			});*/

		},

		// show invalid sel messages
		/*update_invalid_selector_msg: function(invalidSel, failCode, n){

			var html = '',
				invalid = '',
				nothing = '';

			// get 0 element selectors that might arise from n/a pseudo filters
			for (var k in MTF.dom.sels.nothing){
				if ( ! MTF.dom.sels.nothing.hasOwnProperty(k) ) continue; // for compat
				var item = MTF.dom.sels.nothing[k];
				nothing+= '<li>'+item['code']+'</li>';
			}



			// get invalid selector
			if (invalidSel){
				failCode = failCode ? failCode : MTF.dom.sels.nothing[0]['code'];
				invalid+= '<li title="'+TvrLang.invalid_sel_long+'">'+failCode+'</li>';
			}

			// if invalid selector or sels that target nothing, show results
			$('#targets-nothing-sels').html(nothing);
			$('#targets-nothing-invalid').html(invalid);
			if ( (TvrCom.isDefined(n) && n < 1) || MTF.dom.sels.nothing.length || invalidSel){
				$('#targets-nothing').addClass('show')
				TvrUi.stat.tvr.addClass('targets_nothing');
			} else {
				$('#targets-nothing').removeClass('show')
				TvrUi.stat.tvr.removeClass('targets_nothing');
			}
			(invalidSel)
				? $('#nothing-invalid').addClass('show')
				: $('#nothing-invalid').removeClass('show');
			(MTF.dom.sels.nothing.length)
				? $('#nothing-valid').addClass('show')
				: $('#nothing-valid').removeClass('show');
		},*/

		// set the number of elements a selector targets, including title update
		num_els_icon: function(n, plusInTitle){
			plusInTitle = plusInTitle ? plusInTitle : '';
			var nString = TvrCom.isDefined(n) ? n.toString() : '0';
			var numElTitle = (n === 1)
				? tvrsprintf(TvrLang.n_els, nString) :
				tvrsprintf(TvrLang.n_els_plural, nString+plusInTitle);
			var warnClass = (n === 0) ? ' el-targets-nothing' :  '';
			return '<span class="num-els-icon'+warnClass+'" title="'+numElTitle+'">'+n+'</span>'
		},


		/*** show comp css in selector wizard  ***/
		refresh_wizard_comp_css: function(){ TvrCom.startT(arguments);

			// do nothing if no trigger el
			if (!TvrCom.isDomEl(MTF.triggerEl)){
				// .mt-zero-elements class is added to #tvr which hides
			}

			else {

				// filter the results
				TvrUi.filter_css_exceptions('intelli');

				// get comp css from global var (just for expanded accordion group)
				var compCSS = TvrUi.intelliCompProps = TvrUi.un_flatten_css(TvrUi.intelliCompProps),
					group = TvrUi.pgInFocusWiz;

				// remove the items for the group that will be refreshed
				//$('#comp-'+group).find('li.property-item').remove();

				var li = '',
					i = 1;

				// create new li items for the expanded pg group
				for (var prop in compCSS[group]) {
					if ( ! compCSS[group].hasOwnProperty(prop) ) continue; // for compat

					// resolve label and val
					var propLabel = prop; // prop.replace(/-/g, ' ');
					var val = compCSS[group][prop];

					// skip undefined values like event and event-target
					if (val === undefined){
						continue;
					}

					// computed values can contain page-controlled strings (e.g. font-family, url()), so escape
					if (val && val.toString().indexOf('rgb') > -1){ // toString, else webkit silently fails on indexOf
						val = TvrUi.trans_gradient_box(val) +' '+TvrCom.escapeHTML(TvrCom.maybe_to_hex(val));
					} else {
						val = TvrCom.escapeHTML(val);
					}

					li+= '<span class="info-label '+prop+'-info-label">'+propLabel+':</span>\n' +
						'<span class="info-value '+prop+'-info-value">'+val+'</span>';

					/*li+= '<li class="property-item accordion-item '+rowClass+'">';
					li+= '<span class="comp-prop-label">'+propLabel+':</span> ';
					li+= '<span class="comp-prop-value">'+val+'</span>';
					li+= '</li>';*/
					++i;
				}

				// li just for a gap
				//li+= '<li class="property-item accordion-item bottom-gap"></li>';

			}

			// append property rows
			//console.log('we update the group', group, $('#comp-'+group).find('.mt-expandable-panel'))
			$('#comp-'+group).find('.mt-expandable-panel').html(li);

			// update the key info pane

			// get a new HTML template for the box model display
			var boxModelTemplate = TvrUi.templates.key_computed_info;

			for (var x = 0; x < MTdd.keyInfoProps.length; x++) {

				var cssf = MTdd.keyInfoProps[x],
					value = MTF.compProps[cssf];

				// correct for mixed comp values - default to first
				// (this can happen with e.g. height of paragraphs)
				if (Array.isArray(value) || value === Object(value)) {
					value = value[0];
					if (value === Object(value)){
						value = value.val;
					}
				}

				if (!TvrCom.isDefined(value)){
					value = '-';
				} else if (cssf === 'color' || cssf === 'background-color'){
					value = TvrUi.trans_gradient_box(value) +' '+TvrCom.escapeHTML(TvrCom.maybe_to_hex(value));
					//console.log('we should', value, cssf);
				} else if (cssf !== 'font-size' && cssf !== 'line-height'){

					//console.log('The cssf/value', cssf, value)

					value = TvrCom.escapeHTML(value.replace(/px$/, '').replace(/^0$/, '-'));
				} else {
					value = TvrCom.escapeHTML(value);
				}

				//console.log('we do it', value, cssf);

				// only show first defined font-family here
				/*if (cssf === 'font-family'){
					value = value.split(',')[0];
				}*/

				// replace placeholder text with value
				boxModelTemplate = boxModelTemplate.replace(new RegExp('{'+cssf+'}'), value);
			}

			$('#key-computed').html(boxModelTemplate);

			//console.log('refresh wizard css', $.extend(true, {}, MTF.compProps), boxModelTemplate)
			//console.log(TvrCom.print_r(TvrUi.intelliCompProps));
			TvrCom.endT(arguments)
		},
		un_flatten_css: function(arr){ TvrCom.startT(arguments);
			var newArr = [];
			for (var group in TvrUi.cssProps){
				if ( ! TvrUi.cssProps.hasOwnProperty(group) ) continue; // for compat
				newArr[group] = [];
				for (var i in TvrUi.cssProps[group]) {
					if ( ! TvrUi.cssProps[group].hasOwnProperty(i) ) continue; // for compat
					var prop = TvrUi.cssProps[group][i].cssf;
					if (prop === 'background-img-full' ||
						prop === 'extracted-gradient' ||
						prop === 'google-font' ||
                        TvrUi.propAliases[prop] ||
                        prop === 'order-grid' ||
						prop === 'text-shadow' ||
						prop === 'box-shadow' ||
						(prop === 'background-image' && group === 'gradient')
					){
						continue;
					}
					newArr[group][prop] = arr[prop];
				}
			}
			TvrCom.endT(arguments)
			return newArr;
		},
		// create the selector by copying the data to the folder's manual add selector fields and tiggering func

        // functions that will ensure old MT data is ready for new JS system
        ensure_backwards_compat: function(){ TvrCom.startT(arguments);

        	// run auto-undo of Bricks Grid Workaround
        	if (parseInt(TvrUi.pref.remove_all_bricks_container_hacks)){
				TvrUi.pref.manual_recompile_all_css = 1;
			}

            // to maintain compat with legacy MT selectors that get imported at any time,
            // check all selectors for jsc flag (JS compiled). Run Compilation on any selectors missing this

			// fix undefined issue for lots of users by running data fix on each page load until I can find root cause
			//TvrUi.pref.manual_recompile_all_css = 0; // comment this out, just for testing!
			var dataFormattingFixesOnly = true,
				manual_recompile_all_css = parseInt(TvrUi.pref.manual_recompile_all_css);

			if (dataFormattingFixesOnly || manual_recompile_all_css){
				TvrUi.compile_non_compiled_selectors( (dataFormattingFixesOnly && !manual_recompile_all_css) );
			}

            TvrCom.endT(arguments);

        },

        // compile any selectors that haven't been done with JS before
        compile_non_compiled_selectors: function(dataFormattingFixesOnly){

            // e.g. !important changed, history restored etc. So first pass *may* not be necessary... But it may!

            //return false;

            //console.log('TvrUi.pref.manual_recompile_all_css', TvrUi.pref.manual_recompile_all_css);

            // clean empty keys than can arise, for pre-speed MT, but also good house keeping
			// this removed fullCodeSelectors and even non_section!
			// This system is a bit risky - adding exceptions may not work well, but seems the safest option for now.
			//console.log('Data before clean', $.extend(true, {}, TvrUi.uiData));
            TvrUi.uiData = MTloop.filter_object_keys('clean', TvrUi.uiData, 0, false, {
				fullCodeSelectors: 1,
				hand_coded_css: 1
			});
			//console.log('Data after clean', $.extend(true, {}, TvrUi.uiData));

			// test of comma section
			//TvrUi.uiData[','] = true;

            var debug = false;

            if (debug){
                //console.log('data before global compile', $.extend(true, {}, TvrUi.uiData), TvrUi.pref);
            }

            var c = {
                    M: {},
					settings: {
						keyFormatFixes: {
							// keep track of section key changes so selector update reference new one (section changes come before selector, but not during first scan loop)
							sectionKeyChanges: {},
							actions: []
						},
					},
                    template:'ui',
                    no_style_node_update: true,
                    compile_non_compiled: true,
					passNum: 1,
					dataFormattingFixesOnly: dataFormattingFixesOnly,
                    onlyRun: {
                        recurse_key: ['m_query']
                    },
                    onlyLoop: {
                        recurse_key: ['m_query']
                    }
                },

                firstPassCallbacks = {
                    section: [
                        {
                            item: MTloop.ensure_valid_folder_and_label,
                            args: [false]
                        },
                        {
                            item: MTloop.update_item_index,
                            args: [false]
                        },
						{
							item: MTloop.maybe_fix_key_format,
							args: [false]
						}
                    ],
                    selector: [
                        {
                            item: MTloop.update_item_index,
                            args: [false]
                        },
                        {
                            item: MTloop.check_jsu,
                            args: [false]
                        },
						{
							item: MTloop.check_values,
							args: [false]
						},
						{
							item: MTloop.maybe_fix_key_format,
							args: [false]
						}


					],

                    group: [
						{
							item: MTloop.check_values,
							args: [false]
						}
                    ],

                    property: [
                        {
                            item: MTloop.update_property_values_structure,
                            args: [false]
                        },
						{
							item: MTloop.update_legacy_unit_structure,
							args: [false]
						}
                    ]


                    // update_property_values_structure
                },

                secondPassCallbacks = {
                    section: [
                        {
                            item: MTloop.update_dots,
                            args: [false]
                        }
                    ],
                    selector: [
                        {
                            item: MTloop.check_jsu,
                            args: [ (!dataFormattingFixesOnly) ] // we save data on seconds pass unless we only want to save when formatting issue is fixed
                        },
						{
							item: MTloop.update_dots,
							args: [false]
						}
                    ],

                    // recompile all css now that data modifications have happened in first pass
                    group: [
                        {
                            item: MTloop.modify_item,
                            args: ['group_to_css', {
                                dontUpdateSavePackage: dataFormattingFixesOnly, // we want this one to be saved
								dontRemoveVendorPrefixes: 1
                            }]
                        },
                        {
                            item: MTloop.check_values,
                            args: [false]
                        }
                    ]
                };


			if (parseInt(TvrUi.pref.remove_all_bricks_container_hacks)){
				firstPassCallbacks.selector.push(
					{
						item: MTloop.remove_all_bricks_container_hacks,
						args: [false]
					}
				)
			}


            // first pass - update any selectors that need updating
            c.maxDepth = 'property';
            c.cb = firstPassCallbacks;

            //console.log('the c config', $.extend(true, {}, c));

            var settings = MTloop.run(TvrUi.uiData, c).settings;

            if (debug){
                //console.log('data after first pass compile', $.extend(true, {}, settings), $.extend(true, {}, TvrUi.uiData));
            }

            // second pass - save any selectors that needed updating
            // we do in 2 passes coz there is no before_next_item callback that can run after sel group cbs finish
            c.settings = settings;
            c.maxDepth = 'group';
            c.cb = secondPassCallbacks;
            c.passNum++;
            settings = MTloop.run(TvrUi.uiData, c).settings;

            if (debug){
                //console.log('data after 2nd pass compile', $.extend(true, {}, settings), $.extend(true, {}, TvrUi.uiData));
                //console.log('The keys in order', Object.keys(TvrUi.uiData.general));
            }

			// update the keys that need to be upgraded to the new format, if any
			var keyFixActions = settings.keyFormatFixes.actions;
			if (keyFixActions.length){
				//console.log('data before updating keys', $.extend(true, {}, settings), $.extend(true, {}, TvrUi.uiData));
				for ( var i = 0; i < keyFixActions.length; i++ ) {
					MTloop.modify_main_js_object('rename', {}, keyFixActions[i]);
				}
				//console.log('data after updating keys', $.extend(true, {}, TvrUi.uiData));
			}

            // we should update indexes
            var global_scans = [];

            // update scss_usage storage if client_scss
            if (TvrUi.client_scss){
                //global_scans.push('scss_types');
                settings = MTloop.run_global_scans(settings, ['scss_types']);
            }

            // reset scss_usage
            else {
                if (TvrCom.checkObject(TvrUi.uiData, ['non_section', 'scss_usage'])){
                    delete TvrUi.uiData.non_section.scss_usage;
                }
            }

            // if code selectors have not been parsed for checking existing, do so
			//TvrCom.updateObject(TvrUi.uiData, ['non_section', 'meta', 'fullCodeSelectors'], undefined);
			// this caused issues if non selector code only was added to the full code editor and it is not
			// critical to have full code sels blue
			/*console.log('The meta at fullCodeSelectors check', $.extend(true, {}, TvrUi.uiData.non_section.meta))
			if (TvrUi.uiData.non_section['hand_coded_css'] && !TvrCom.checkObject(TvrUi.uiData, ['non_section', 'meta', 'fullCodeSelectors'])){
				MTace.update_parsed_full_code_selectors(settings);
				console.log('The meta after added code view selectors, if they could be parsed',
					$.extend(true, {}, settings), $.extend(true, {}, TvrUi.uiData.non_section.meta));
			}*/

            // run global scans
            //settings = MTloop.run_global_scans(settings, global_scans);

            if (debug){
                //console.log('data after scss_usage update/reset', $.extend(true, {}, TvrUi.uiData));
                //console.log('The keys in order', Object.keys(TvrUi.uiData.general));
            }

            // log history - this fills up the history table too much, try without for a while
			//settings.user_action = null;
            /*settings = MTsave.user_action(settings, {
                'items': ['MT data structure updated'],
                'icon': 'mtif-save'
            });
*/
            // do partial save if necessary - maybe do one folder at a time....
            if ((settings.savePackage && settings.savePackage.length) || keyFixActions.length){
				//console.log('there is something to save', $.extend(true, {}, settings), $.extend(true, {}, TvrUi.uiData));
                if (settings.savePackage && settings.savePackage.length > 15){
					settings.savePackage = false; // do whole save as lots of packages might get really big
				}
				settings.fullSCSSCompile = TvrUi.client_scss;
                MTsave.ajax_save_settings({
                    settings: settings,
					essentialSave: 1,
                    serialise: true // to overcome max input vars limitation
                });

            } else {
            	// we still need to do a full SCSS compile as otherwise the vendor prefixes get removed
				// a full compile seems like a safe way to solve this
				if (TvrUi.client_scss){
					TvrUi.mt_compile_scss({
						isSassVendorPrefixPatch: 1,
						settings: {
							fullSCSSCompile: 1
						}
					});
				}

				//console.log('Nothing to save', $.extend(true, {}, settings));
			}

            // reset TvrUi.pref.manual_recompile_all_css if necessary
            if (parseInt(TvrUi.pref.manual_recompile_all_css)){
                //console.log('manual_recompile_all_css was enabled, but turning off');
                TvrUi.pref.manual_recompile_all_css = 0;

				MTsave.simple_ajax_request({
					type: 'GET',
					url: TvrUi.ajaxUrl+'&manual_recompile_all_css='+0
				});

                //$.get(TvrUi.ajaxUrl+'&manual_recompile_all_css='+0, function() {});
            }

			// reset TvrUi.pref.manual_recompile_all_css if necessary
			if (parseInt(TvrUi.pref.remove_all_bricks_container_hacks)){

				TvrUi.pref.remove_all_bricks_container_hacks = 0;

				MTsave.simple_ajax_request({
					type: 'GET',
					url: TvrUi.ajaxUrl+'&remove_all_bricks_container_hacks='+0
				});

				//$.get(TvrUi.ajaxUrl+'&manual_recompile_all_css='+0, function() {});
			}

            // set the initial view to small (S) if below a certain screen size (default is M)
            if (!parseInt(TvrUi.pref.initial_view_set)){

				if (TvrUi.stat.tvr.width() <= 796){

					TvrCom.toggle_radio_checkbox(
						$('#screen-layout-options').find('.switch-layout-preset[data-preset="S"]')
					);

					MTsave.simple_ajax_request({
						type: 'GET',
						url: TvrUi.ajaxUrl+'&initial_view_set=1'
					});

					//console.log('initial view width set');
				}
			}


			// ensure we have an object for storing cached snippets (doesn't need to be saved)
			/*if (!TvrCom.checkObject(TvrUi.uiData, ['non_section', 'meta', 'snippet_cache'])){
				TvrCom.updateObject(TvrUi.uiData, ['non_section', 'meta', 'snippet_cache'], {});
			}*/
        },

		isContainerQuery: function(tabKey){
			return TvrCom.checkObject(TvrUi.mqs, [tabKey, 'container']);
		},

		/*** load visual view ***/
		load_visual_view: function($clicked){ TvrCom.startT(arguments);

			//return false;
			//console.log('the snippets', $.extend(true, {}, TvrMT.data.dyn.snippets));
            //console.log('the main ui', $.extend(true, {}, TvrUi.uiData), $.extend(true, {}, TvrUi.pref)); // $.extend(true, {}, TvrUi.pref),

			//MThtml.testStripStateFromSelector();

			const ordered = Object.keys(TvrUi.pref.npm_dependencies).sort().reduce(
				(obj, key) => {
					obj[key] = TvrUi.pref.npm_dependencies[key];
					return obj;
				},
				{}
			);

			//console.log('ordered', ordered);
			//console.log('TvrUi.pref.npm_dependencies', TvrUi.pref.npm_dependencies);

			// unhide the color picker
			$('#mt-picker-palette').removeClass('hidden');

			// set the preview left margin before displaying so content doesn't jump about
			TvrUi.forceNoLayoutSave = true;
			MTlayout.update_num_items_docked('left');
			MTlayout.update_num_items_docked('right');
			MTlayout.adjust_preview_margin_and_save_config({ skipSave: 1, skipPGPress: 1, side: 'left'});
			MTlayout.adjust_preview_margin_and_save_config({ skipSave: 1, skipPGPress: 1, side: 'right'});

			// init ace dependencies (Range, Search) must come before ensure backwards compat
			MTace.init_editor_deps();

			// instantiate SASS.js object - must be done early so save can use scss compiler
			// (e.g. before ensure_backwards_compat)
			TvrUi.maybe_initiate_sass_js();

			// set theme to dark if the user has a preference for that
			if (!TvrUi.pref.theme_mode_set){
				TvrUi.set_default_theme_mode();
			}

			// functions that will ensure old MT data is ready for new JS system
			// - must do this before frontend loads and ideally before adding tvr-visual class
			TvrUi.ensure_backwards_compat(); // temp disable for user debug import

			//console.log('after ensure_backwards_compat',  $.extend(true, {}, TvrUi.pref), $.extend(true, {}, TvrUi.uiData));

			TvrUi.stat.body.addClass('tvr-visual');

			//return false;

			// check if place-holder.html needs replacing
			if (!TvrUi.pref.detach_preview){
				MTlocal.maybe_load_site_preview();
			}

			// log any cached messages
			if (TvrUi.pref.returned_ajax_msg && !TvrUi.pref.returned_ajax_msg_seen){
				for (var i in TvrUi.pref.returned_ajax_msg){
					if ( ! TvrUi.pref.returned_ajax_msg.hasOwnProperty(i) ) continue; // for compat
					MTsave.log(TvrUi.pref.returned_ajax_msg[parseInt(i)]);
				}
			}

			// clean browser url in case nonce and preview url params passed
			if (window.history.pushState && parseInt($('#clean-ui-url').attr('rel'))){
				window.history.pushState(TvrUi.uiUrl, null, TvrUi.uiUrl);
			}

			// bind the adaptable editor which has content updated rather than using bind/unbind each time

			if (TvrUi.codeEditors){
				MTace.bind_editor(TvrUi.stat.inlineEditor, {
					filterClass: 'custom-css-pre',
					mode: parseInt(TvrUi.pref.allow_scss) ? 'scss' : 'css',
					M: 'css',
					directContent: 'pending'
				});
			}

            // bind gridstack if we're loading CSS grid options
            MTgrid.bind_gridstack();

		 	// Create first revision if not yet done
			if (!parseInt(TvrUi.pref.current_revision)){

				//console.log('Support undo setup', TvrUi.pref.current_revision);

				let settings = MTsave.user_action({}, {
					'items': ['Setup undo system'],
					'icon': 'mtif-instant-undo'
				});
				MTsave.ajax_save_settings({
					settings: settings,
				});
			}

			// Get initial revision stack from indexedDB
			else {

				TvrCom.ww.assignTask({
					channel: 'revisions',
					taskName: 'initRevisionStackTask',
					ajaxUrl: TvrUi.ajaxUrl,
					current_revision: TvrUi.pref.current_revision,
					cb: {
						ref: 'TvrUi',
						funcName: 'updateRevisionStack',
					}
				});
			}

			// default to last viewed tab - todo, for efficiency we can skip loading the selector
			TvrUi.default_to_tab('mq');

			// default to last edited or first selector
			TvrUi.default_to_sel({

				// if we're loading the full code view, the last edited selector in that view
				// will be selected so don't select GUI selector
				elementAlreadySelected: TvrUi.pref.show_code_editor
			});

			// set frame height based on toolbar height
			//MTlayout.toolbar_adjusted(); // i think adjust_preview_margin_and_save_config takes care of this now

			// check if any buttons need disabling (e.g. if there are 0 secs/sels)
			TvrUi.toggle_enabled_buttons();

			// set the size of the CSS modifer inputs, which depend on user font size
			TvrUi.set_initial_size_of_nth_modifier_inputs();

			// site preview is detached, try to get reference to window
			if (TvrUi.pref.detach_preview){
				MTlayout.retrieve_or_load_detached();
			}

			// apply rulers
			MTlocal.apply_rulers();

			// if code view, default to tab
			if (TvrUi.pref.show_code_editor){
				TvrUi.default_to_tab('css');
			}

			TvrMT.hooks.doAction('uiReady');

            // maybe show responsive tabs scroll buttons
            TvrUi.adjust_scroll_buttons( false, 'responsive');

            // update available builder name if any available
			MTint.maybe_update_available_builder_name();

			TvrUi.forceNoLayoutSave = false;

			// show the setup dialog if requested, or if a firewall issue was detected
			if (TvrUi.pref.show_setup_screen || TvrUi.innoFireall){

				TvrUi.show_dialog( $('#program-settings-menu').find('.item-mt-initial-setup') );

				// prevent the setup screen from showing next time
				if (TvrUi.pref.show_setup_screen){
					MTsave.save_multiple_preferences({
						show_setup_screen: 0,
						show_setup_screen_first_time: 0
					});
				}
			}

			// Initiate firebase and restore chat / sketchpad if set
			MTai.init_ai();






			//alert(TvrLang.something_wrong_other);



			//TvrUi.page_load_debug();


			/*let label = MThtml.getOrCreateSnippetName('<div class="wp-block-group has-global-padding is-layout-constrained wp-block-group-is-layout-constrained tvr-trigger-el">\n' +
				'    <div style="height:var(--wp--preset--spacing--50)" aria-hidden="true" class="wp-block-spacer"></div>\n' +
				'    <img src="/some-path/flowers.jpg" />\n' +
				'    <h1 class="has-text-align-center wp-block-post-title">Sample Page</h1>\n' +
				'    <div style="margin-top:0;margin-bottom:0;height:var(--wp--preset--spacing--30)" aria-hidden="true" class="wp-block-spacer"></div>\n' +
				'</div>');*/

			//console.log('HTML label', label);

			// console logging after MT has loaded
			/*TvrCom.action_after_timeout('page_load_debug', 250, {
				item: function(){
					TvrUi.page_load_debug();
				},
				args: []
			});*/


			// load up the folder editing options
			//TvrUi.toggle_folder_more_options($('#strk-green').find('.toggle-folder-more-options'));

			/*console.log('got here');
			return false;*/

			TvrCom.endT(arguments)
		},


		/*
		Main thread revision functions
		 */
		restoringRevision: false,
		updateRevisionStack: function(data, config){
			//console.log('updateRevisionStack', data, config)
			let stack = data.stack;
			if (stack){
				TvrUi.revisionStack = stack;
				TvrUi.pref.current_revision = stack.current;
			}

			// Update the buttons
			TvrUi.updateRevisionButtons();

		},

		updateRevisionButtons: function(){

			let stack = TvrUi.revisionStack,
				buttons = {
					undo: $('#mt-instant-undo'),
					redo: $('#mt-instant-redo')
				};

			Object.keys(buttons).forEach((key) => {
				//console.log('updateRevisionButtons', key, stack[key], buttons[key])
				if (stack[key].length){
					buttons[key].removeClass('disabled');
				} else {
					buttons[key].addClass('disabled');
				}
			});

		},
		animationCount: 0,
		animationUndo: function($clicked, action, resetCount = false){

			if (resetCount){
				TvrUi.animationCount = 0;
			}

			let animationClass = 'animate-button-'+action;

			$clicked.addClass('disabled '+animationClass);

			// Allow animation to run once
			TvrUi.after_animation($clicked, {
				type:'animation',
				cb: ($el) => {
					$el.removeClass(animationClass);

					// Restart animation if still restoring
					if (TvrUi.restoringRevision && TvrUi.animationCount < 3){
						//console.log('Restore the revision');
						TvrCom.action_after_repaint({
							item: function(){
								TvrUi.animationUndo($clicked, action)
							},
							args: []
						}, 20, window);

					}
				}
			});

			TvrUi.animationCount++;
		},
		iterateRevisionStack: function($clicked, revision_id){

			// Do not run if no revisions of revision in progress
			if ($clicked.hasClass('disabled')){
				//console.log('revision action disabled')
				return;
			}

			// Prevent double-clicks while restore is in progress
			$clicked.addClass('disabled');

			let action = $clicked.data('action'),
				method = revision_id
					? 'restoreRevisionById'
					: action + 'Revision';

			TvrUi.restoringRevision = true;

			TvrUi.animationUndo($clicked, action);

			TvrCom.ww.assignTask({
				channel: 'revisions',
				taskName: method,
				ajaxUrl: TvrUi.ajaxUrl,
				revision_id: revision_id,
				/* We must keep it alive, as it has reference to the revision stack
				terminateCurrent: true,
				terminateOnCompletion: true,*/
				mainThreadData: {
					$clicked,
					revision_action: action
				},
				cb: {
					ref: 'TvrUi',
					funcName: 'restoreRevisionSuccess',
				},
				cb_failure: {
					ref: 'TvrUi',
					funcName: 'restoreRevisionError',
				},
				cb_complete: {
					ref: 'TvrUi',
					funcName: 'restoreRevisionComplete',
				}
			});

			//console.log('iterateRevisionStack', method, $clicked)
		},

		restoreRevisionError: function(data, config){
			MTsave.update_full_logs({
				'short': TvrLang.revision_restore_failed,
				'long': '<p>' + TvrLang.revision_restore_failed_long + '. </p>'
			});
		},

		restoreRevisionSuccess: function(data, config){

			let revision = data.revision,
				refreshPage = false;

			/*console.log('Data before restore', {
				uiData: $.extend(true, {}, TvrUi.uiData),
				pref: $.extend(true, {}, TvrUi.pref),
				snippets: $.extend(true, {}, TvrMT.data.dyn.snippets),
				revision_id: revision.id,
				revision
			})*/

			if (!revision){
				alert('Could not restore revision');
				return;
			}

			// Restore any preferences deeply connected to the data
			let merge_preferences = TvrCom.checkObject(
					revision, ['settings', 'non_section', 'meta', 'merge_preferences']
				);
			if (merge_preferences){
				MTai.getRelevantPreferences(TvrUi.pref, merge_preferences);
			}

			// Update media queries
			let	active_queries = TvrCom.checkObject(
					revision, ['settings', 'non_section', 'active_queries']
				),
				refreshMQs = false;


			if (active_queries && JSON.stringify(TvrUi.pref.m_queries) !== JSON.stringify(active_queries)){
				TvrUi.pref.m_queries = active_queries;
				TvrUi.updateTvrMQsCombinedData();
				refreshMQs = true;
			}

			// Update the main data
			TvrUi.uiData = revision.settings;

			//console.log('The restored main data', $.extend(true, {}, TvrUi.uiData))

			// The last save time will be out of wack, so disable the check on the next save
			delete TvrUi.uiData.non_section.last_save_time

			// Update AI data
			MTai.chatMessages = TvrUi.uiData.non_section?.meta?.aiChatMessages || [];
			MTai.sketchpad = TvrUi.uiData.non_section?.meta?.aiSketchpad || {
				css: '',
				js: '',
				html: ''
			};
			MTai.sketchpadFocus = TvrUi.uiData.non_section?.meta?.aiSketchpadFocus || 'css';

			/*console.log('Data AFTER restore', {
				uiData: $.extend(true, {}, TvrUi.uiData),
				pref: $.extend(true, {}, TvrUi.pref),
				snippets: $.extend(true, {}, TvrMT.data.dyn.snippets)
			});*/

			// Why do I need this?
			/*if (settings.MTDynFrontData && MTF){
				MTF.stat.win.MTDynFrontData = settings.MTDynFrontData;
			}*/

			let settings = {};
			let saveConfig = {
				noSaveDelay: 1,
				manualSave: 1,
				settings: settings,
				skip_revision: 1
			};

			// Update snippets
			if (revision.snippets) {

				// Send to server for snippet restoration there
				saveConfig.restoreSnippets = revision.snippets;

				let snippetCache = {};
				const currentCache = TvrMT.data.dyn.snippets.cache || {};

				revision.snippets.forEach(snippet => {
					const existing = currentCache[snippet.slug];
					const newAspect = snippet.aspect;
					const newValue = snippet.content;
					const oldAspect = existing?.aspect;
					const oldValue = existing?.value;

					const isJSorFunc = (type) => type === 'js' || type === 'jsFunction';

					if (
						isJSorFunc(newAspect) || isJSorFunc(oldAspect)
					) {
						if (newAspect !== oldAspect || newValue !== oldValue) {
							//console.log('Mismatch', {newAspect, oldAspect, newValue, oldValue});
							refreshPage = true;
						}
					}

					snippetCache[snippet.slug] = {
						name: snippet.name,
						value: newValue,
						mysql_data: snippet.modified_at,
						aspect: newAspect,
						meta: snippet.meta || null
					};
				});

				TvrMT.data.dyn.snippets.cache = snippetCache;

				//console.log('revision.snippets', revision.snippets);
				//console.log('Snippet cache formatted', TvrMT.data.dyn.snippets.cache);
			}

			// Live refresh main interface
			TvrUi.liveRefreshInterface(active_queries, refreshPage);

			// Save the new settings
			settings = MTsave.user_action(settings, {
				'items': ['Quick '+config.revision_action],
				'icon': 'mtif-instant-'+config.revision_action
			});

			// Save the preferences in the same channel so the save settings waits for the result
			MTsave.save_multiple_preferences({
				current_revision: revision.id,
				m_queries:  TvrUi.pref.m_queries,
				mq_device_focus:  TvrUi.pref.mq_device_focus,
				pg_focus:  TvrUi.pref.pg_focus,
			}, false, 'revisions');


			// Refresh the page - needed when JS updates made, so we must wait for save to finish
			if (refreshPage) {
				//console.log('refreshPage = true (detected JS/function snippet changes)');
				saveConfig.cbFunction = function(){

					MThtml.refreshPreview();

					TvrUi.maybeRetryAI();
				}
			}

			// Refresh element without page refresh
			else {

				// Run global scans (for mod undos - all others are up to date)
				MTloop.run_global_scans({}, ['html_mods']);

				// They may still need to refresh if DOM mods wipe out some JS state
				MThtml.animateRefreshButton();

				TvrUi.maybeRetryAI();
			}

			// We do a full settings save
			MTsave.ajax_save_settings(saveConfig);

		},

		// Maybe retry an AI update if undo was to retry
		maybeRetryAI: function(){

			if (MTai.retry){

				let prompt = MTai.retry.prompt;

				MTai.retry = false;

				//console.log('retryAIUpdate', prompt);

				// Clear previously requested context and ask for deeper analysis so the model can take a fresh look
				if (MTai.previousPayload){
					TvrCom.updateObject(MTai.previousPayload, ['context', 'cumulativeContextRequestedDuringChat'], {});
					TvrCom.updateObject(MTai.previousPayload, ['context', 'applyDeeperPageAnalysis'], 1);
					TvrCom.updateObject(MTai.previousPayload, ['allowMoreContext'], 1);
					TvrCom.updateObject(MTai.previousPayload, ['model'], $('#ai-model').val());
					TvrCom.updateObject(MTai.previousPayload, ['ai_priority'], TvrUi.pref.ai_priority);

					//TvrCom.updateObject(MTai.previousPayload, ['model'], 'gemini-2.5-flash-preview-04-17');
				}

				// Resend the prompt (we re-use the previous payload so the same element is selected)
				$('#tvr-ai-prompt').val(prompt);
				MTai.sendPrompt(null, {}, true);
			}

		},

		// Remove the animation class and update the buttons
		restoreRevisionComplete: function(data, config){

			TvrUi.updateRevisionStack(data, config);

			TvrUi.restoringRevision = false;

		},

		// Reload the interface after a revision or AI data restore without reloading the page
		liveRefreshInterface: function(refreshMQs, refreshPage){

			// # Update the menu / option folders

			let c = {
				totalSecs: 0,
				totalSels: 0,
				allSections: 1,
				allSelectors: 1,
				menuSectionHTML: '',
				optionsSectionHTML: '',
				cbs: {
					'section': [
						{
							// Ensure the containing folder exists
							item: function(c, section, sectionSlug, mq_key){

								let $combObjs = TvrUi.dom_replacements(
									false,
									'section',
									$(TvrUi.templates.sectionM).add(TvrUi.templates.section),
									'selector_section',
									sectionSlug,
									section['this'].label
								);

								// Add the selector numbers back
								let numSelectors = TvrCom.obj_length(section) -1;
								if (numSelectors > 0) {

									let countHTML = `<span class="folder-count-wrap count-wrap"> (<span
										class="folder-state-count state-count">${numSelectors}</span>)</span>`;

									let $name = $($combObjs[0]).find('.section-name');
									$name.find('.selector-count-state').attr('rel', numSelectors)
									$name.append(countHTML);

									//console.log('numSelectors', numSelectors, countHTML)
								}


								//console.log('We got the folder', numSelectors, sectionSlug, section, $combObjs)

								// Update the HTML strings
								c.menuSectionHTML+= $combObjs[0].outerHTML;
								c.optionsSectionHTML+= $combObjs[1].outerHTML;

								c.totalSecs++;

							}
						}
					],
					'selector': [{
						item: function(c, section, sectionSlug, mq_key, selectorSlug, selector){
							c.totalSels++;
						}
					}],
				}
			};

			// Collect HTML for folders
			TvrCom.loopUiData(c, TvrUi.uiData);

			// Ensure we don't overwrite the grid controls
			c.optionsSectionHTML+= $('#grid-control-wrap')[0].outerHTML;

			// Replace HTML for menu and options
			TvrUi.stat.mainMenuInner[0].innerHTML = c.menuSectionHTML;
			TvrUi.stat.opts[0].innerHTML = c.optionsSectionHTML;

			// Refresh MT style nodes
			MTF.applyMTStyleNodes(false);

			// Update AI chat
			MTai.resumeChatAndSketchPad();

			// Go back to the original selector
			let M = TvrUi.default_to_sel({ elementAlreadySelected: TvrUi.pref.show_code_editor });
			//console.log('selsExist', M);

			// No selectors, reset global trackers
			TvrUi.updateSelsExistState(M, c);

			// We do have selectors
			if (M) {

				// Update the MQ tabs and preferences
				if (refreshMQs) {
					TvrUi.liveUpdateInterfaceMQs();
				}
			}

			// update blue dots for each section
			TvrUi.stat.mainMenuInner.children().each(function(){
				let M = TvrUi.get_meta($(this), 'section');
				TvrUi.js_check_values({}, TvrUi.get_meta(M.sectionM, 'section'));
			});

		},

		// reset all the global trackers and UI display for zero selectors
		updateSelsExistState(M, c){
			//TvrUi.totalSecs = Object.keys(TvrUi.uiData).length - 1; // -1 for non_section

			//console.log('updateSelsExistState', {M, c})

			TvrUi.totalSecs = c.totalSecs;
			TvrUi.totalSels = c.totalSels;

			if (!M){
				TvrUi.update_prev_next_sel_buttons(false);
			}

			TvrUi.toggle_enabled_buttons();
		},

		updateTvrMQsCombinedData: () => {
			window.TvrMQsCombined = $.extend(true, {
				'all-devices': {
					'label': 'All Devices',
					'query': 'CSS that applies to all devices',
					'min': 0,
					'max': 0
				}
			}, TvrUi.pref.m_queries)
			TvrUi.mqs = TvrUi.adjust_mqs_for_unit(TvrMQsCombined);
		},
		liveUpdateInterfaceMQs: () => {

			let $mqSettings = $('#mqs-dyn-menu'),
				$mqTabs = TvrUi.stat.res,
				focusTab = TvrUi.get_mq_focus(),
				html = {
					tabs: [],
					settings: [],
					$tabTemplate: $mqTabs.find('.mt-tab').first().clone(),
					$settingsTemplate: $mqSettings.find('.mquery-tag').first().clone()
				}

			//console.log('The responsive menu stuff', html, focusTab, window.TvrMQsCombined);

			Object.entries(window.TvrMQsCombined).forEach(([mq_key, obj]) => {

				const site_preview_width = obj.site_preview_width || '';

				// ----- Tab HTML -----
				let $tab = html.$tabTemplate.clone()
					.removeClass('active hasValues mq-tab-all-devices')
					.addClass('mq-tab-'+mq_key)
					.attr('rel', mq_key)
					.attr('title', obj.query)

				$tab.find('.mq-tab-txt').text(obj.label);

				//console.log('The tab HTML', $tab[0].outerHTML)

				if (mq_key === 'all-devices'){
					html.tabs.push($tab);
				} else {
					// ----- Settings HTML -----
					if (mq_key !== 'all-devices') {

						let $settings = html.$settingsTemplate.clone(),
							$labelInput = $settings.find('.mquery-label'),
							$queryTextarea = $settings.find('.mquery-query'),
							$previewWidthInput = $settings.find('.mquery-site_preview_width'),
							placeholderId = $settings.attr('id').replace(/^mqs-/, '');


						$settings.attr('id', 'mqs-'+mq_key);
						$settings.find('.mquery-name').html(obj.label);

						// Update input names
						$settings.find('.mquery-label, .mquery-query, .mquery-site_preview_width, .mquery-hide').each(function(){
							let $input = $(this);
							$input.attr('name', $input.attr('name').replace(placeholderId, mq_key))
						});

						$labelInput
							//.attr('name', $labelInput.attr('name').replace(placeholderId, mq_key))
							.val(obj.label).attr('value', obj.label);
						$queryTextarea
							//.attr('name', $queryTextarea.attr('name').replace(placeholderId, mq_key))
							.val(obj.query).attr('value', obj.query);
						$previewWidthInput
							//.attr('name', $previewWidthInput.attr('name').replace(placeholderId, mq_key))
							.val(site_preview_width).attr('value', site_preview_width);

						html.tabs.push($tab);
						html.settings.push($settings);
					}
				}

			});

			// Update the HTML
			//console.log('We update the HTML for the MQs', html, TvrUi.stat.res.find( '.mq-tab-'+focusTab ));
			$mqSettings.html(html.settings);
			$mqTabs.find('.menu-style-tabs').html(html.tabs);

			// Update the state

			let $tab = TvrUi.stat.res.find( '.mq-tab-'+focusTab );
			//console.log('.mq-tab-'+focusTab, $tab);

			TvrUi.mq_tab_pressed(
				TvrUi.stat.res.find( '.mq-tab-'+focusTab )
			)
		},

		page_load_debug: function(){
			//console.log('sug_values', TvrUi.pref.my_props.sug_values);

			TvrUi.show_dialog(TvrUi.stat.settingsMenu.find('li.js_libraries'));

			// Test bundler
			//const bundler = new window.TvrMT.ai.npmBundler();
			//bundler.bundle("https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/loaders/GLTFLoader.js");

			/*(async () => {
				const result = await MThtml.npm.search('alpinejs anchor', 'latest', 50);
				console.log('NPM retrieval', result);
			})();*/



			// Auto-load CSS import stuff
			/*let $importDialog = $('#import-from-pack-dialog');
			$('#program-settings-menu').find('li.item-import-from-pack').trigger('click');
			$importDialog.find('.dialog-tab-css-stylesheet').click();

			//console.log('doms', $('#program-settings-menu').find('li.item-import-from-pack'), $importDialog.find('.dialog-tab-css-stylesheet'))

			MTdd.update_import_css_preview('/!*= Front page ================ *!/\n' +
				'\n' +
				'/!** Front page >> Text blue 600 **!/\n' +
				'.wp-block-group-is-layout-constrained .text-blue-600 {\n' +
				'    /!* MT [ action: basty5 | aspect: html ] *!/\n' +
				'    /!* MT [ google_font: 1 ] *!/\n' +
				'    font-family: \'Noto Sans JP\' !important;\n' +
				'    border-image-width: 10px !important;\n' +
				'}\n' +
				'\n' +
				'p.mt-inview {\n' +
				'    -webkit-animation-duration: 0.5s !important;\n' +
				'    animation-duration: 0.5s !important;\n' +
				'}\n' +
				'\n' +
				'div.mt-click {\n' +
				'    /!* MT [ sub: 1 | group: transition | event: 1 | event_value: 1 | event_target: 1 ] *!/\n' +
				'    font-size: rgb(238, 95, 95) !important;\n' +
				'}\n' +
				'\n' +
				'div {\n' +
				'    /!* MT [ sub: 1 | group: transition | event_target: 1 ] *!/\n' +
				'    -o-transition-property: font-size !important;\n' +
				'    -moz-transition-property: font-size !important;\n' +
				'    -webkit-transition-property: font-size !important;\n' +
				'    transition-property: font-size !important;\n' +
				'    -o-transition-duration: 0.6s !important;\n' +
				'    -moz-transition-duration: 0.6s !important;\n' +
				'    -webkit-transition-duration: 0.6s !important;\n' +
				'    transition-duration: 0.6s !important;\n' +
				'}\n' +
				'\n' +
				'\n' +
				'/!*= General 2 MT [ expr: \\Microthemer\\is_post_or_page("front") | css_async: 1 | css_external: 1 | ai_action: edited ] ================= *!/\n' +
				'\n' +
				'/!** General 2 >> Has text align center MT [ ai_action: delete ] **!/\n' +
				'.wp-block-group-is-layout-constrained .has-text-align-center {\n' +
				'    background-color: rgb(231, 241, 93) !important;\n' +
				'}\n' +
				'\n' +
				'/!** General 2 >> Decoy selector **!/\n' +
				'.wp-block-group-is-layout-constrained .text-blue-600 {\n' +
				'    color: red;\n' +
				'}\n' +
				'\n' +
				'\n' +
				'/!*( < 980  MT [ site_preview_width: 500 | hide: 1 | ai_action: edited ] )*!/\n' +
				'@media (max-width: 979.98px) {\n' +
				'\n' +
				'    /!** Brand new >> Text blue 600 MT [ ai_action: added ] **!/\n' +
				'    .wp-block-group-is-layout-constrained .text-blue-600 {\n' +
				'        /!* MT [ action: prepend | aspect: html | snippet: <span>this is html</span> ] *!/\n' +
				'        font-family: Charcoal !important;\n' +
				'        color: rgb(255, 188, 0) !important;\n' +
				'    }\n' +
				'\n' +
				'}', {
				c: $importDialog.find('.view-import-stylesheet')
			});

			TvrCom.action_after_timeout('run_import_code', 150, {
				item: function(){
					$importDialog.find('.view-import-stats').click()
				},
				args: []
			});*/


			//cons.log(); // to force ui error

			// testing only (autoload import screen)
			//TvrUi.show_dialog($('li.item-import-from-pack'));
			//TvrUi.dialog_tab_pressed($('#import-from-pack-dialog').find('span.dialog-tab-1'));
			//MTdd.update_import_css_preview(false, {c: $('#import-from-pack-dialog').find('.view-import-stylesheet')}, 'loadNew');

			//var testStr = 'small-caps bold italic 0.5em/1.1 serif, arial, "Times new roman"';
			//
			//var testStr = 'none url(hey) outside';
			//var testStr = 'initial';
			//var testStr = ' 0 2px   3px   / 5px 6px   7px    ';
			//var testStr = ' url("hi.jpg") 3px 1px 2px 5px inset'; // order matters with this one
			//var testStr = 'url("hi.jpg") repeat-x scroll 9px 2% / contain padding-box content-box #000, linear-gradient(90deg, rgba(255,0,0,0), rgba(255,0,0,1) 50%, black)';
			//var testStr = ' 0em 0em 0.375em 0em #999998'
			//var testStr = '2px'
			//var testStr = ' #eee url(images/comment-bubble.png) no-repeat'
			//var testStr = 'linear-gradient(right to left, rgba(255,0,0,0), rgba(255,0,0,1)) repeat-x scroll 10vmax 0 / contain content-box padding-box #000';
			//var testStr = 'url(images/wordpress.png) center left no-repeat';
			//console.log(MTdd.reg.url({'str': 1}));
			//var testStr = '0 3px';  //'0em 0em 0.375em 0em #999998';
			//console.log('box test', MTdd.sh['box-shadow'](TvrMT.data.prog.sh['box-shadow'], 'box-shadow', testStr));
			//console.log('text test', MTdd.sh['text-shadow'](TvrMT.data.prog.sh['text-shadow'], 'text-shadow', testStr));
			//console.log(TvrCom.print_r(MTdd.sh['box-shadow'](TvrMT.data.prog.sh['box-shadow'], 'box-shadow', testStr)));
			//console.log(MTdd.sh['list-style'](TvrMT.data.prog.sh['list-style'], 'list-style', testStr));
			//MTdd.test_this_thing('linear-gradient(0deg, rgba(220, 80, 80, .1), rgba(186, 190, 33, 0.35) 50%, rgb(25, 171, 85))');
			//MTdd.test_this_thing('linear-gradient(rgba(220, 80, 80, .1), rgba(186, 190, 33, 0.35))');

			/*var str = "linear-gradient(top left, red 30%, rgba(255,0,0,0)), url(a), image(url" +
				"(b.svg), 'b.png' 150dpi, 'b.gif', rgba(0,0,255,0.5)), none",
				result = MTdd.split_multiple_css_values(str);
			console.log(str);
			console.log(TvrCom.print_r(result));
*/
			// test animation
			// animation: pulse .25s steps(2, start) .25s infinite reverse forwards paused;

			//console.log(TvrCom.print_r(MTdd.sh['background'](TvrMT.data.prog.sh['background'], 'background', testStr)));
			//console.log(TvrCom.print_r(MTdd.sh['font'](TvrMT.data.prog.sh['font'], 'font', testStr)));
			//console.log(TvrCom.print_r(MTdd.sh['border-radius'](TvrMT.data.prog.sh['border-radius'], 'border-radius', testStr)));
			//testStr = '1px solid red';
			//testStr = 'red';
			//console.log(TvrCom.print_r(MTdd.sh['border'](TvrMT.data.prog.sh['border'], 'border', testStr)));
			//console.log(TvrCom.print_r(MTdd.sh['border-color'](TvrMT.data.prog.sh['border-color'], 'border-color', testStr)));
			//console.log(TvrUi.commas_ok('text-shadow', testStr, TvrMT.data.prog.sh, {}));
			//var opts = {css_imp_adjust_paths:1, source: 'http://www.computing.dcu.ie/~asmeaton/ca567/module.css'},
			//origStr = 'url(https://mdn.mozillademos.org/files/11305/firefox.png), url(https://mdn.mozillademos.org/files/11307/bubbles.png)',
			//origStr = 'url(../firefox.png), url(files/11307/bubbles.png)',
			//type = 'url'
			//console.log(TvrUi.check_auto_adjust_path(opts, origStr, type));
		},

		// BEGIN SCSS

		// separate CSS we're interested in from full code CSS and libraries
		scss_div: "/*MTSCSSPART*/",

		// keep track of sass files loaded in memory using Emscripten's file system
		sass_preloaded_files: [],

		sass_worker_to_mt_dir: '../../../../micro-themes/',

		// instantiate SASS.js object for client side sass rendering
		maybe_initiate_sass_js: function(){

			//console.log('maybe_initiate_sass_js', TvrUi.client_scss);

			if (TvrUi.client_scss){

				// initiate
				TvrUi.sass = new Sass();

				//console.log('TvrUi.sass', TvrUi.sass);

				var hand_coded_css = TvrUi.uiData.non_section.hand_coded_css;

				// Set options
				TvrUi.sass.options({
					style: Sass.style.expanded,
					indent: "\t"
				}, function callback() {
					// invoked without arguments when operation completed
				});

				// intercept file loading requests from libsass
				TvrUi.sass.importer(function(request, done) {

					// convert possible non-extension to extension.
					var pathGiven = request.resolved.replace('/sass/', ''),
						filePathWithExtension = TvrUi.check_file_exists(pathGiven, true);

					//console.log('filePathWithExtension', filePathWithExtension);

					// could not find file
					if (!filePathWithExtension){
						done({
							error: 'Import failed, no file found: '+pathGiven
							+'. Try refreshing '+TvrUi.appName+' if path is definitely correct.'
						})
					}

					// file exists
					else {

						// if we haven't pre-loaded the file yet
						if (!TvrCom.in_array(filePathWithExtension, TvrUi.sass_preloaded_files)){

							/*console.log('the file needs to preload', request, request.current,
								TvrUi.sass_preloaded_files, TvrCom.in_array(request.current, TvrUi.sass_preloaded_files));*/

							// get @import content via ajax (PHP recursively checks for child @import rules too)
							MTsave.simple_ajax_request({
								'url': TvrUi.ajaxUrl + '&load_sass_import='+encodeURI(filePathWithExtension),
								'dataType': 'json',
								'plus': TvrLang.loading_sass_import,
								'minus': TvrLang.loading_sass_import_failed,
								'cbFunction': function(data, done){

									// register a file to be available for @import
									TvrUi.sass.writeFile(filePathWithExtension, data.content, function callback(success) {

										TvrUi.sass_preloaded_files.push(filePathWithExtension);

										done({
											content: data.content
										})

									});

								},
								'cbfArgs': [done] // data will be prepended by ajax function
							});
						}

						// @import content has already been cached, we're good
						else {
							//console.log('the request is good', request);
							done({
								path: request.path
							})
						}
					}

				});

				// write PHP generated @import content to Emscripten
				TvrUi.sass.writeFile(TvrMT.data.dyn.preloaded_sass_imports, function callback(result) {

					// store import names in array
					TvrUi.sass_preloaded_files = Object.keys(TvrMT.data.dyn.preloaded_sass_imports);

					// reset object to save memory now that it's in Emscripten
					TvrMT.data.dyn.preloaded_sass_imports = null;

					// End message: preparing SASS...

					// compile the full code editor because first compile is slowest
					TvrUi.sass.compile(TvrUi.uiData.non_section.hand_coded_css, function(result) {
						//console.log('sass compiled');
					});

					//console.log('register files', result, TvrMT.data.dyn.preloaded_sass_imports, TvrUi.sass_preloaded_files);
				});

			}
		},

		// convert scss to AST
		parse_scss_or_css: function(code, syntax){

			syntax = syntax || 'scss';

			try {
				return window.TvrSCSS.parse(code, {
					syntax: syntax
				})
			} catch(error) {

				// silent fail
				//console.error('Parse scss error', error); // for my debug
			}

			return false;

		},

		// convert AST to SCSS string
		stringify_scss: function(parseTree){
			return parseTree.toString();
		},

		// scss treats $my-var and $my_var the same so normalise (same with funcs/mixins)
		normalise_scss_type_name: function(type, name){

			var flexibleTypes = ['variable', 'mixin', 'function'];

			if (!TvrCom.in_array(type, flexibleTypes)){
				return name
			}

			return name.replace(/-/g, '_');
		},

		// just normalising at the point of scaning scss types - seems simpler
		// variables, functions, mixins, can have hyphen or underscore (either or)
		/*check_flexible_type_names: function(obj, type, name){

			var combined = [],
				matchFound = false,
				flexibleTypes = ['variable', 'mixin', 'function'],
				perms = ['-', '_'],
				typeObj = TvrCom.checkObject(obj, [type]);

			if (!typeObj){
				return false;
			}

			if (!TvrCom.in_array(type, flexibleTypes)){
				return typeObj[name];
			}

			else {

			}

			for (var i = 0; i < perms.length; i++) {

			}
			return false;

		},*/

		// get as child node of a particular type
		get_ast_child_node: function(nodes, type, property){
			for (var i = 0; i < nodes.length; i++) {
				var child = nodes[i];
				if (child.type === type){
					return property ? child[property] : child;
				}
			}
			return false;
		},

		// get as child node of a particular type
		get_variable_node_data: function(value, node, parent, config){

			var name = node.content[0].content,
				valueNode,
				insideFM = (node.insideFM || config.insideFM),
				isRelatedType = config.isRelatedType;

			// get value if a declaration
			if (parent.type === 'property'){

				var valueString = '';
				valueNode = TvrUi.get_ast_child_node(parent.parent.content, 'value');
				if (valueNode){
					valueString = valueNode.toString();
					value = { value: valueString };
					//console.log('we got a variable value', node.content[0].content, value)
				}

				// we're not interested in local var declarartions when collecting related types
				if (isRelatedType && !TvrUi.is_scss_global_var(valueString)){
					config.localDecs[name] = 1;
					return false;
				}
			}

			// variable is used as a value
			else {

				// we're checking for related variables
				if (isRelatedType ){

					// ignore if it's a local variable declaration or a local param (that isn't referencing a global var)
					if (config.localDecs[name] || (node.insideArg && !node.insideDec)){
						config.localDecs[name] = 1;
						return false;
					}
				}
			}

			//console.log('we got it', node.insideFM, config.onlyGlobalVars, !TvrUi.is_scss_global_var(value))

			// we don't always want non-global/default vars in functions
			if (insideFM && config.onlyGlobalVars

				// note, !default doesn't set globally, but needs to know the state of global vars
				&& !TvrUi.is_scss_global_var(value.value) && !TvrUi.is_scss_default_var(value.value)){
				return false;
			}

			return {
				name: name,
				value: value
			};

		},

		is_scss_global_var: function(value){
			return (typeof value === 'string' && value.indexOf('!global') > -1);
		},

		is_scss_default_var: function(value){
			return (typeof value === 'string' && value.indexOf('!default') > -1);
		},

		// convert scss to AST
		get_scss_types: function(config){

			// get parse tree or bail
			var parseTree = config.parseTree ? config.parseTree : TvrUi.parse_scss_or_css(config.code, 'scss');
			if (!parseTree){
				return 'parseFail';
			}

			if (!TvrUi.parseTreeDone){
				//console.log('parseTree', parseTree)
				TvrUi.parseTreeDone = true;
			}

			var store = {},
				types = config.types ? config.types : TvrUi.scss_types,
				anythingFound = false;

			parseTree.traverse(function(node, index, parent) {

				var type = node.type,
					checkRelatedTypes = false,
					name,
					value = { value: 1 };

				// signal if we are inside function / mixin
				if (type === 'mixin' || (parent && parent.insideFM) ||
					(type === 'atrule' && TvrUi.get_ast_child_node(node.content, 'function')) ){
					node.insideFM = 1;
				}

				// signal if we are inside function / mixin arguments
				if (type === 'arguments' || (parent && parent.insideArg)){
					node.insideArg = 1;
				}

				// signal if we are inside a declaration
				if (type === 'declaration' || (parent && parent.insideDec)){
					node.insideDec = 1;
				}

				// when searching related types, we only want to store variables (which may be properties) and extends
				var relevantTypes = ['property', 'variable', 'extend'],
					irrelevantRelatedType = (config.isRelatedType && !TvrCom.in_array(type, relevantTypes));

                //console.log('irreleventRelatedType', irrelevantRelatedType, type);

				// skip most nodes
				if (!TvrCom.in_array(type, types) || irrelevantRelatedType){
					return false;
				}

				switch(type) {

					case 'atkeyword':

						// check if it is an @import
						type = TvrUi.get_ast_child_node(node.content, 'ident', 'content');
						if (type !== 'import'){
							return false;
						}

						// it is, so get path
						name = TvrUi.get_ast_child_node(parent.content, 'string', 'content');

						break;

					case 'property':

						node.parent = parent;
						//console.log('we have a property, set parent', parent)
						return false;
						break;

					case 'variable':

						var varData = TvrUi.get_variable_node_data(value, node, parent, config);
						if (!varData){
							return false;
						}

						name = varData.name;
						value = varData.value;

						//console.log('value at var', $.extend(true, {}, value));
						break;

					case 'function':

						name = node.content[0].content;

						// ignore CSS functions
						if (TvrCom.in_array(name, MTdd.css_functions)){
							return false;
						}

						// stringify function if declared
						if (parent.type === 'atrule'){
							value = { value : parent.toString() };
							checkRelatedTypes = {
								node: parent,
								parent: parent
							};
						}

						break;

					case 'mixin':

						name = TvrUi.get_ast_child_node(node.content, 'ident', 'content');
						value = { value : node.toString() };
						checkRelatedTypes = {
							node: node,
							parent: parent
						};

						break;

					case 'include':

						type = 'mixin'; // for MT consistency
						name = TvrUi.get_ast_child_node(node.content, 'ident', 'content');
						break;

					case 'extend':

						var selector = TvrUi.get_ast_child_node(node.content, 'selector'),
							selectorString = selector.toString();

						name = selectorString;
						value = { value : 'extender' };
						break;

				}

				// maybe normalise the name (vars, functions, mixins can have - or _ so just use _
				name = TvrUi.normalise_scss_type_name(type, name);

				// ensure object exists and store value in values array
				if (!TvrCom.checkObject(store, [type, name, 'values'])){
					TvrCom.updateObject(store, [type, name, 'values'], []);
				}

				// add value
				store[type][name].values.push(value.value);

				// functions and mixins can have side-effects (e.g. global variable definitions)
				if (!config.isRelatedType && checkRelatedTypes){

					//console.log('We recurse', value.value, $.extend(true, {}, checkRelatedTypes.node))
					var related_types = TvrUi.get_scss_types({
						isRelatedType: 1,
						parseTree: checkRelatedTypes.node, // .first('block')
						types: ['property', 'variable', 'extend', 'include', 'function'],
						//onlyGlobalVars: 1,
						localDecs: {},
						insideFM: 1
					});

					if(related_types){
						//TvrUi.maybe_merge_related_types(value, related_types);
						store[type][name].related_types = related_types;
						//console.log('we got related_types', name, value.value, checkRelatedTypes.node, $.extend(true, {}, related_types));
					}
				}

				// add if instance not already added, or it's a declaration, of which there can be many
				var isDeclaration = value.value !== 1;

				// store the latest dec as the final value for e.g. color picker
				if (isDeclaration){

					//console.log('isDeclaration', value.value, 1, value.value !== 1, value);

					store[type][name].value = value.value;
					store[type][name].hasDeclaration = 1;
					// note value will be indefined if only instances exist - I think that is OK
				}

				anythingFound = true;

				//console.log('the node is relevant', node, index, parent);
			});

			//console.log('the store', $.extend(true, {}, store));

			return anythingFound ? store : false;

		},

		maybe_merge_related_types: function(obj, related_types){
			if (related_types){

				if (!obj.related_types){
					obj.related_types = {};
				}

				obj.related_types = $.extend(true, obj.related_types, related_types);
			}
		},

		// set side-effect relationship on vars inside function/mixin too
		cross_update_related_types: function(scss_usage, FMType, related_types){

			var curTypes = Object.keys(related_types);

			for (var i = 0; i < curTypes.length; i++) {

				var type = curTypes[i],
					curNames = Object.keys(related_types[type]);

				for (var j = 0; j < curNames.length; j++) {

					var name = curNames[j];

					if (!TvrCom.checkObject(scss_usage, [type, name])){
						TvrCom.updateObject(scss_usage, [type, name], {})
					}

					//console.log('cross_update_related_types', type, name, FMType)

					TvrUi.maybe_merge_related_types(
						scss_usage[type][name], FMType
					);
				}
			}
		},

		// function that combines all scss_usage during global scans
		log_all_scss_usage: function(isSelector, scss_usage, scss_types, c, codeEditorTrail){

			var types = Object.keys(scss_types);

			for (var i = 0; i < types.length; i++) {

				var type = types[i],
					namesObj = scss_types[type],
					names = Object.keys(namesObj);

				for (var j = 0; j < names.length; j++) {

					var name = names[j],
						nameObj = $.extend(true, {}, scss_types[type][name]),
						values = nameObj.values,
						finalDecVal = nameObj.value, // does the selector contain a declaration
						related_types = nameObj.related_types;

                    //console.log('the selector item stuff', c.trail.item, type, name, $.extend(true, {}, nameObj), $.extend(true, {}, scss_types[type]));

					// ensure arrays for storing deps and values exist (this will create name object too)
					if (!TvrCom.checkObject(scss_usage, [type, name, 'deps'])){
						TvrCom.updateObject(scss_usage, [type, name, 'deps'], []);
					} if (!TvrCom.checkObject(scss_usage, [type, name, 'values'])){
						TvrCom.updateObject(scss_usage, [type, name, 'values'], []);
					}

					var usage_name = scss_usage[type][name];

					// concat values
					if (values){
						usage_name.values = usage_name.values.concat(values)
					}

					// related_types are two-way dependent so should be added to other vars
					if(related_types){

						TvrUi.maybe_merge_related_types(usage_name, related_types);

						var FMType = {};
						TvrCom.updateObject(FMType, [type, name], {}); // nameObj
						TvrUi.cross_update_related_types(scss_usage, FMType, related_types);
					}


					// add finalDecVal for easy lookup of var value (subsequent decs overwrite) - bit of a guess
					if (finalDecVal){
						usage_name.finalDecVal = finalDecVal;
                        usage_name.type = finalDecVal ? MTdd.checkStringValue(finalDecVal) : 'unknown';
					}

					var meta = {};

					// flag declarations in co-dependent selector sets
					if (finalDecVal){
						meta.hasDeclaration = 1;


					}

					// if selectr add path and other meta info to deps array
					if (isSelector){

						// add selector path to scss entity
						$.extend(true, meta, {
							trail: c.trail.selector,
							mq_key: c.recurse.mq_key,
							sectionSlug: c.section_key,
							selectorSlug: c.selector_key
						});

						/*var meta = {
							trail: c.trail.selector,
							mq_key: c.recurse.mq_key,
							sectionSlug: c.section_key,
							selectorSlug: c.selector_key
						};*/

						// add meta
						usage_name.deps.push(meta);
					}

					else if (codeEditorTrail){
						// todo when we support custom code editors, variables, functions, mixins
						//console.log('Add code editor as a dep', codeEditorTrail, nameObj);
					}

					// maybe add meta for extended selector
					var locMetaObj = nameObj.locMeta;
					if (locMetaObj){

                        //console.log('locMetaObj', $.extend(true, {}, locMetaObj), $.extend(true, {}, c));

						var locMetaKeys = Object.keys(locMetaObj);

						for (k = 0; k < locMetaKeys.length; k++) {

							var locMetaKey = locMetaKeys[k],
								locMeta = $.extend(true, {}, locMetaObj[locMetaKey]),
								selIdentifier = locMeta.trail.join('.');

							if (!TvrCom.checkObject(usage_name, ['locDone', selIdentifier])){
								usage_name.deps.push(locMeta);
								TvrCom.updateObject(usage_name, ['locDone', selIdentifier], 1);

								// if removed, we can delete from selector as it only needs to be used once
								//console.log('c before update save package', c);
								if (locMeta.action === 'removed'){
									MTloop.updateObjectAndSavePackage(c.settings.savePackage, [{
										action: 'delete',
										trail: c.trail.item.concat(['scss_types', 'extend', name, 'locMeta']),
										key: locMetaKey
									}]);
									//console.log('cleaned locMetaObj', selIdentifier, locMetaKey);
								}
							}
						}
					}

				}
			}
		},

		// get the raw scss or fall back to the empty selector code
		get_raw_scss_or_selector: function(selector, rootSelector){
			var selectorWithLabel = rootSelector ? rootSelector : selector;
			return selector.raw_scss
				? selector.raw_scss
				: selectorWithLabel.label.split('|')[1]+" {\n\n}\n";
		},

		tag_extended: function(c, selector, mq_key){

			if (!c.settings.extend){
				return false;
			}

			var settings = c.settings,
				extend = settings.extend,
				names = Object.keys(extend),
				rootSelector = TvrUi.uiData[c.section_key][c.selector_key];

			var	raw_scss = TvrUi.get_raw_scss_or_selector(selector, rootSelector);

			//console.log('Checking item', name, c.trail.selector);

			for (var i = 0; i < names.length; i++) {

				var name = names[i],
					changeConfig = extend[name],
					action = changeConfig.action;

				if (TvrUi.extender_match(name, raw_scss)){

					// when a value changed, we need to loop the added/removed actions
					if (changeConfig.actions){

						for (var j = 0; j < changeConfig.actions.length; j++) {

							action = changeConfig.actions[j].action;

							if (!c.settings.active_scss_types){
								c.settings.active_scss_types = {};
							}

							//if (action === 'added'){
							if (!TvrCom.checkObject(c.settings.active_scss_types, ['extend', name, 'locMeta'])){
								TvrCom.updateObject(c.settings.active_scss_types, ['extend', name, 'locMeta'], {})
							}

							var locMetaKey = c.trail.selector.join('.'); // c.section_key+'-'+c.section_key+'-'+mq_key;

							c.settings.active_scss_types.extend[name].locMeta[locMetaKey] = {
								action: action,
								trail: c.trail.selector,
								mq_key: mq_key,
								sectionSlug: c.section_key,
								selectorSlug: c.selector_key
							};

							//console.log('add the extend item', name, c.settings.active_scss_types.extend[name].locMeta)

						}
					}
				}
			}
		},


		// function that combines all scss_usage during global scans
		log_all_scss_selectors: function(c, selector, mq_key){

			var deps = c.settings.deps,
				code = selector.raw_scss;

			// selectors that have no code might be disabled but we still need to set the node to blank
			if (!code){
				code = '';
			}

			var	trail = c.trail.selector,
				sectionSlug = c.section_key,
				selectorIndex = TvrUi.get_selector_index_from_trail(sectionSlug, trail);

			deps[mq_key][selectorIndex] = {
				code: code,
				mq_key: mq_key,
				sectionSlug: sectionSlug,
				selectorSlug: c.selector_key,
				trail: trail
			};
		},

		scss_types: ['variable', 'function', 'mixin', 'include', 'extend', 'property', 'atkeyword'],

		// store previous state of vfms
		prev_full_code_scss_types: {},

		// store previous state of vfms
		compare_scss_types: function(prev, cur){

			prev = prev ? prev : {};
			cur = cur ? cur : {};

			var changed = $.extend(true, {}, prev),
				curTypes = Object.keys(cur);

			/*console.log('the prev arrangement', $.extend(true, {}, prev))
			console.log('the cur arrangement', $.extend(true, {}, cur))*/

			for (var i = 0; i < curTypes.length; i++) {

				var type = curTypes[i],
					curNames = Object.keys(cur[type]);

				// if type didn't exist before - add whole type (all names)
				if (!prev[type]){
					changed[type] = {};
				}

				// loop names
				for (var j = 0; j < curNames.length; j++) {

					var name = curNames[j],
						prevVal = TvrUi.get_value_from_possible_object(TvrCom.checkObject(prev, [type, name])),
						curVal = TvrUi.get_value_from_possible_object(cur[type][name]);

					//console.log('prevVal, curVal', prevVal, curVal);

					// if newly added name - add
					if (prevVal === false){
						changed[type][name] = {
							action: 'added',
							actions: TvrUi.compare_add_remove_values(
								TvrCom.checkObject(prev, [type, name, 'values']),
								TvrCom.checkObject(cur, [type, name, 'values'])
							),
							value: curVal,
							form: TvrCom.checkObject(nameObj, [type, name, 'hasDeclaration'])
								? 'declaration'
								: 'instance'
						};

						//console.log('Action is added', type, name, curVal, $.extend(true, {}, changed));
					}

					// if the values are the same, remove from changed object
					else if (prevVal === curVal){
						delete changed[type][name];
					}
				}
			}

			// did anything change?
			var somethingChanged = false,
				changedTypes = Object.keys(changed);

			// determine if anything changed and set added/removed on remaining items
			for (var k = 0; k < changedTypes.length; k++) {

				type = changedTypes[k];
				curNames = Object.keys(changed[type]);

				for (var n = 0; n < curNames.length; n++) {

					somethingChanged = true;
					name = curNames[n];

					if (changed[type][name].action !== 'added'){

						var curValue = TvrUi.get_value_from_possible_object(TvrCom.checkObject(cur, [type, name])),
							prevValue = TvrUi.get_value_from_possible_object(TvrCom.checkObject(prev, [type, name])),
							action = curValue ? 'changed' : 'removed',
							nameObj =  curValue ? cur : prev,
							value = curValue ? curValue : prevValue,
							form =  TvrCom.checkObject(nameObj, [type, name, 'hasDeclaration'])
								? 'declaration'
								: 'instance',
							config = {
								action: action,
								actions: TvrUi.compare_add_remove_values(
									TvrCom.checkObject(prev, [type, name, 'values']),
									TvrCom.checkObject(cur, [type, name, 'values'])
								),
								value: value,
								form: form
							};

						/*if (action === 'changed'){
							var actions = TvrUi.compare_array_values(prev[type][name].values, prev[type][name].values);
						}*/

						//console.log('add/change', nameObj, prev, cur, TvrCom.checkObject(nameObj, [type, name], 'hasDeclaration'));

						if (action === 'changed'){
							config.oldValue = prevValue;
							//config.actions = TvrUi.compare_add_remove_values(prev[type][name].values, cur[type][name].values);
						}

						changed[type][name] = config;
					}

				}
			}

			//console.log('the change analysis', somethingChanged, changed);

			// return change result or false
			return somethingChanged ? changed : false;

		},

		compare_add_remove_values: function(prevValues, curValues){

			var actions = [];

			// loop current
			TvrCom.compare_array_values(curValues, prevValues, 'added', actions);

			// loop previous
			TvrCom.compare_array_values(prevValues, curValues, 'removed', actions);

			//console.log('the values to compare', prevValues, curValues, actions);

			return actions.length ? actions : false;

		},

		get_value_from_possible_object: function(thing){
			//console.log('it is an object', thing === Object(thing), thing, thing.value)
			return thing === Object(thing)
				? TvrCom.combine_array_values(thing.values)
				: thing;
		},


		get_co_dependent_types: function(scss_types, codeEditorEdited, selIdentifier){

			var co_types = {},
				coTypesExist = false,
				types = ['extend'];

			// code editor only needs to pull in selectors if var changed, not on each go
			if (!codeEditorEdited){
				types.push('variable');
			}

			//types.push('variable');

			// check if types have been used
			if (scss_types){
				for (var i = 0; i < types.length; i++) {

					var type = types[i],
						names = TvrCom.checkObject(scss_types, [type]);

					if (names){
						co_types[type] = names;
						coTypesExist = true;
					}

				}
			}


			// check if the current selector has been extended anywhere
			// console.log('selIdentifier', selIdentifier);
			if (selIdentifier) {

				var extenders = TvrUi.get_extenders(selIdentifier);

				if (extenders) {
					$.extend(true, co_types, extenders);
					coTypesExist = true;
				}
				//console.log('extenders, co_types', extenders, co_types);
				//cons.ls;
			}

			return coTypesExist ? co_types : false;
		},

		// get scss types that make selectors fully co-dependent (not just when the type changes)
		get_changed_and_co_dependents_types: function(changed, scss_types, codeEditorEdited, selIdentifier){

			var co_types = TvrUi.get_co_dependent_types(scss_types, codeEditorEdited, selIdentifier);

			return changed || co_types ? {
				changed: changed,
				co_types: TvrUi.get_co_dependent_types(scss_types, codeEditorEdited, selIdentifier)
			} : false;

		},

		extender_match: function(name, raw_scss){

			var extendCode = TvrCom.escapeRegExp(name),
				extendPattern = new RegExp('(?<!@extend\\s)'+extendCode+'(?:[\\s{,]+)');

			/*
			console.log('extend match', name, raw_scss);
			console.log('extend match 2', extendPattern, raw_scss.match(extendPattern));
			*/

			return raw_scss.match(extendPattern);
		},

		// loop through sels that have been extended to see if they match the current selector
		get_extenders: function(selIdentifier){

			// bail if selector reference is old
			var selector = TvrCom.checkObject(TvrUi.uiData, selIdentifier.split('.'));
			if (!selector){
				return false;
			}

			// bail if nothing has been extended
			var	extend = TvrCom.checkObject(TvrUi.uiData, ['non_section', 'scss_usage', 'extend']);
			if (!extend){
				return false;
			}

			var	raw_scss = TvrUi.get_raw_scss_or_selector(selector),
				matchFound = false,
				names = Object.keys(extend),
				co_types = {
					extend: {}
				};

			for (var i = 0; i < names.length; i++) {
				var name = names[i];
				if (TvrUi.extender_match(name, raw_scss)){
					co_types.extend[name] = {};
					matchFound = true;
				}
			}

			return matchFound ? co_types : false;
		},

		cachedDeps: false,

		// prepare the object for storing dependant selectors in order of MQ and UI folders/selectors
		prepare_scss_sources_obj: function(){

			/*if (TvrUi.cachedDeps){
				console.log('recycling previous deps', $.extend(true, {}, TvrUi.cachedDeps));
			}*/

			// sometimes we recycle dep sels if nodes haven't updated yet
			var initialDeps = TvrUi.cachedDeps ? TvrUi.cachedDeps : TvrUi.prepare_dependent_sels_obj();

			return {

				// for storing unique MQ-section ui nodes that should be updated
				sectionNodes: {},

				// for storing dependant selectors in order that matches the UI
				// when there is a SASS error, we don't update nodes, so dep sels need to be included in subsequent compiles
				deps: initialDeps,

				// for whole SCSS string to be compiled (has flags for splitting up after)
				fullstring: '',

				// array of meta info with indexes that will match split fullString.
				parts: []

			};
		},

		// prepare the object for storing dependant selectors in order of MQ and UI folders/selectors
		add_selective_sources: function(sources, pp, fullCode){

			var changedCo = TvrUi.get_changed_and_co_dependents_types(
				pp.scss_types_changed, pp.scss_types, pp.codeEditorEdited, pp.selIdentifier
			);

			// if full code editor
			if (fullCode){

				// add the edited item to the sources - might be full code (all browsers/custom/IE)
				sources.fullstring+= pp.code+TvrUi.scss_div;
				sources.parts.push(pp);
			}

			// if selector
			else {

				// add to deps - don't add to sources yet as order of dependents matters
				var selectorIndex = pp.sectionIndex + pp.index;
				sources.deps[pp.mq_key][selectorIndex] = pp;
			}

			// process current input and any deps into fullString and parts
			var scss_usage = TvrCom.checkObject(TvrUi.uiData, ['non_section', 'scss_usage']),

				// make copy so done metas can be removed
				//scss_usage_copy = $.extend(true, {}, scss_usage),

				config = {
					selsAdded: {},
					relatedTypesChecked: {}
				},

				all_mq_keys = Object.keys(TvrMQsCombined);


			// if scss types changed and there are dependent selectors, gather
			if (changedCo && scss_usage){
				sources.deps = TvrUi.gather_dependent_selectors(
					sources, changedCo, scss_usage, config
				);
			}

			//TvrUi.resolve_dependent_selectors(scss_usage, scss_usage_copy, config, sources, changedCo, pp, Object.keys(TvrMQsCombined));

			// ensure full code is included in the compilation if it wasn't the thing being edited
			// - IF THE SELECTOR USED SCSS TYPES, or more than one selector was included,
			// which can happen if a plain selector gets extended, or when scss_types are removed and related sels get called
			if (pp.editor_slug !== 'hand_coded_css' && (pp.scss_types || sources.numSels > 1)){

				// first gather any co-dependent selectors e.g. GUI selectors that have been @extended in full code editor
				// todo this will be redundant when customisable code editors, functions, etc. 'Resources' terminology used instead.
				var editor_scss_types = TvrCom.checkObject(
					TvrUi.uiData, ['non_section', 'code_editors', 'hand_coded_css', 'scss_types']
				);

				if (editor_scss_types){
					var co_types = TvrUi.get_co_dependent_types(editor_scss_types, false, false);
					if (co_types){
						//console.log('Check full code dependencies', co_types);
						sources.deps = TvrUi.gather_dependent_selectors(
							sources, { co_types: co_types }, scss_usage, config
						);
					}
				}

				// update sources with dependent selectors
				TvrUi.scss_deps_to_string_parts(sources, sources.deps, all_mq_keys);

				// add full code
				TvrUi.add_full_code_scss_part(sources);
			}

			else {
				// update sources with dependent selectors
				TvrUi.scss_deps_to_string_parts(sources, sources.deps, all_mq_keys);
			}

		},

		// prepare the object for storing dependant selectors in order of MQ and UI folders/selectors
		prepare_dependent_sels_obj: function(deps, all_mq_keys){

			deps = deps ? deps : {};
			all_mq_keys = all_mq_keys ? all_mq_keys : Object.keys(TvrMQsCombined);

			for (var j = 0; j < all_mq_keys.length; j++) {
				var tab = all_mq_keys[j];
				deps[tab] = [];
			}

			return deps;
		},

		// gather dependent selectors recursively
		gather_dependent_selectors: function(sources, changedCo, scss_usage, config){

			var deps = sources.deps,
				reasons = Object.keys(changedCo),
				meta;

			//console.log('changedCo', $.extend(true, {}, changedCo), config);


			for (var a = 0; a < reasons.length; a++) {

				// reason = changed / co_deps
				var reason = reasons[a];
				if (changedCo[reason]){

					var curTypes = Object.keys(changedCo[reason]);

					for (var i = 0; i < curTypes.length; i++) {

						var type = curTypes[i],
							curNames = Object.keys(changedCo[reason][type]);

						// loop names
						for (var j = 0; j < curNames.length; j++) {

							var name = curNames[j],
								nameObj = changedCo[reason][type][name],
								changeConfig = reason === 'changed' ? nameObj : {};

							// functions can have side-effects (e.g. update a global var) so recurse side-effects
							if (!TvrCom.checkObject(config.relatedTypesChecked, [type, name])){
								TvrCom.updateObject(config.relatedTypesChecked, [type, name], 1);
								var related_types = TvrCom.checkObject(scss_usage, [type, name, 'related_types']);

								if (related_types){
									//console.log('recurse the related_types', type, name, related_types);
									deps = TvrUi.gather_dependent_selectors(
										sources, { related_types: related_types }, scss_usage, config
									);
								}
							}

							// check if there are dependent selectors
							var depSels = TvrCom.checkObject(scss_usage, [type, name, 'deps']);

							//console.log('depSels', depSels, depSels.length);

							// add any sels to deps object
							if (depSels && depSels.length > 0){

								var arrLastIndex = (depSels.length -1);

								// loop backwards so we can splice out deps that have served their purpose e.g. removed selectors that @extend
								for (var k = arrLastIndex; k >= 0; k--) {

									// we splice out selectors that have already been added, so meta may be undefined
									if (!depSels[k]){
										continue;
									}

									meta = $.extend(true, {}, depSels[k]);

									//console.log('before trying', k, depSels.length, meta, $.extend(true, {}, depSels));

									var action = meta.action,
										hasDeclaration = meta.hasDeclaration,
										instanceChanged = (reason === 'changed' && changeConfig.form === 'instance'),
										anotherVariableInstance = reason === 'co_types' && type === 'variable'
											&& !hasDeclaration;

									//console.log('instanceChanged, anotherVariableInstance', type, name, instanceChanged, anotherVariableInstance, reason, changeConfig);

									// we don't need to pull in instances that change
									if (anotherVariableInstance){
										continue;
									}

									//console.log('meta for sel we may add', reason, type, name, $.extend(true, {}, meta), depSels);

									var trail = meta.trail,
										selIdentifier = trail.join('.');

									if (!config.selsAdded[selIdentifier]){

										// if we have a valid selector
										var selector = TvrCom.checkObject(TvrUi.uiData, trail);
										if (selector){

											var selectorIndex = TvrUi.get_selector_index_from_trail(meta.sectionSlug, trail);
											// and raw SCSS
											meta.code = TvrUi.get_raw_scss_or_selector(selector);
											deps[meta.mq_key][selectorIndex] = meta;
											config.selsAdded[selIdentifier] = 1;
											sources.numSels++;

											//console.log('we add a selector', selector);

											// clean up selector locMeta for removed extend items
											// this happens when building scss_usage
											/*if (type === 'extend'){
												var locMetaObj = TvrCom.checkObject(
													selector, ['scss_types', 'extend', name, 'locMeta']
												);
												console.log('locMeta check', selIdentifier, locMeta, name, selector);
												if (locMetaObj){
													var locMetaKeys = Object.keys(locMetaObj);
													for (k = 0; k < locMetaKeys.length; k++) {
														var objKey = locMetaKeys[k],
															locMeta = locMetaObj[objKey];
														if (locMeta.action === 'removed'){
															delete locMetaObj[objKey];
															console.log('cleaned locMetaObj', selIdentifier, locMetaObj);
														}
													}
												}
											}*/

											// if selector is co-dependent, pull in others
											// todo see if this can be optimised so recursion used on co-deps set just once
											var co_types = TvrUi.get_co_dependent_types(selector.scss_types, false, selIdentifier);
											if (co_types){
												//console.log('recurse to get co_types', selIdentifier, co_types)
												deps = TvrUi.gather_dependent_selectors(
													sources, { co_types: co_types }, scss_usage, config
												);
											}

										}

										// todo selector doesn't exist anymore, delete it from scss_usage
										// we need settings for save
										else {

										}
									}

									// remove sels that are only needed once (e.g. when @extend .selector is first removed)
									if (action){
										if (action === 'removed'){
											depSels.splice(k, 1);
											//console.log('removed one time dep', reason, type, name, $.extend(true, {}, meta));


										}
										else if (action === 'added'){
											delete meta['action'];
											//console.log('Deleted add action', reason, type, name, $.extend(true, {}, meta));
										}
									}
								}
							}
						}
					}
				}
			}

			return deps;
		},

		toggle_scss_import_compile_note: function(action){
			if (action === 'show'){
				TvrUi.stat.scss_compile_notes.show();
			} else {
				TvrUi.stat.scss_compile_notes.hide();
			}
		},

		toggle_view_draft_published_files: function(action){
			let $container = $('#view-file');
			if (action === 'show'){
				$container.show();
			} else {
				$container.hide();
			}
		},

		// log client SCSS error
		log_client_scss_error: function(getContent, result, content, divPattern){

			// pattern for removing all MT markers
			var importFile = result.file && result.file !== 'stdin';

			// getting content will sometimes be asynchronous so two-part function
			if (getContent){

				if (importFile){

					var filePathWithExtension = TvrUi.check_file_exists(
						result.file.replace('/sass/', ''),
						true
					);

					TvrUi.sass.readFile(filePathWithExtension, function callback(content) {
						//console.log('Error content from the import', content);
						TvrUi.log_client_scss_error(false, result, content, divPattern)
					});

					// ensure correct note is showing
					TvrUi.toggle_scss_import_compile_note('show');

					TvrUi.stat.scss_error_file.text(filePathWithExtension);
				}

				else {

					TvrUi.log_client_scss_error(false, result, TvrUi.previousSCSSCompile, divPattern);

					// ensure correct note is showing
					TvrUi.toggle_scss_import_compile_note('hide');
				}

				return false;
			}

			// we have content, format error stuff
			var viewLine = TvrLang.scss_error_line,
				//$error_field = TvrUi.stat.view.find('.tab-field-scss_compile'),
				//tabKey = $error_field.attr('rel'),
				fileMessage = importFile ? TvrUi.stat.scss_import_compile_notes.html() : '',
				message = result.message.replace(divPattern, '');

			// for some reason this is always one off...
			//--result.line; // this was due to beautification

			// Error object
			TvrUi.scss_error = {

				log: {
					//type: 'warning',
					short: TvrLang.scss_error,
					long: '<p>' + TvrLang.scss_error_long + '.</p>' +
					'<p style="font-weight: bold">' + message + '.</p>'+
					fileMessage+
					'<p><span id="scss-line-error" class="link show-dialog" rel="display-css-code" ' +
					' data-line="'+result.line+'" title="'+viewLine+'">'+viewLine+'</span></p>'
				},

				//tabKey:tabKey,
				line: result.line,
				fullString: content
			};

			// display error
			MTsave.update_full_logs(TvrUi.scss_error.log);

			// add result stuff
			$.extend(true, TvrUi.scss_error, result);

			// update class to signal error
			TvrUi.stat.tvr.addClass('cur_scss_error');

		},

		clear_client_scss_error: function(){

			MTsave.clear_messages();
			TvrUi.stat.tvr.removeClass('cur_scss_error');
			TvrUi.scss_error = false;

			// ensure correct note is showing
			//TvrUi.toggle_scss_import_compile_note('hide');

			// default back to non previous compile tab
			//TvrUi.default_to_tab('view-code');

			/*TvrUi.dialog_tab_pressed(
				TvrUi.stat.view.find('span.dialog-tab-'+TvrUi.pref.generated_css_focus)
			);*/

		},

		scssCompileNext: {},

		// queue asynchronous compiles so change analysis information isn't lost
		compileQueue: [],
		enqeueCompile: function(args){
			TvrUi.compileQueue.push(args);
		},
		deqeueCompile: function(){
			TvrUi.compileQueue.shift();
		},
		pendingCompile: function(){
			return TvrUi.compileQueue[0] ? TvrUi.compileQueue[0] : false;
		},

		// Compile scss code in the browser
		// Don't start or queue a new compile until the current compile has finished
		// Otherwise they can build up in queue and run more than needed - only the most recent needs to run onComplete
		mt_compile_scss: function(config, deferSave, propOrEditor, fullCode, $editObject){

			//console.log('mt_compile_scss', config, deferSave, propOrEditor, fullCode, $editObject);

			// queue system - not 100% sure if brings stability benefits, but trialling for while
			if (TvrUi.compilingSCSS){
				TvrUi.enqeueCompile([config, deferSave, propOrEditor, fullCode, $editObject]);
				//console.log('already compiling, added args to compileQueue', $.extend(true, [], TvrUi.compileQueue));
				return false;
			}

			TvrCom.startT('prep_and_compile_scss')
			TvrCom.startT('prep_scss')

			TvrUi.compilingSCSS = true;

			var settings = config.settings,

				// currently edited item vars
				pp = settings.preprocessor,

				// object for managing what sources go into the compile operation
				sources = TvrUi.prepare_scss_sources_obj(),

				fullSCSSCompile = settings.fullSCSSCompile || pp.importChanged || TvrUi.fullCompileNeeded;

			TvrUi.fullCompileNeeded = fullSCSSCompile;


			// keep track of how many selectors are being included in the compile
			sources.numSels = 0;

			// Sometimes we have no choice but to compile everything
			// But don't do this if another compile is lined up as that one will do the full compile
			if ((fullSCSSCompile && !TvrUi.scssCompileNext.run)){ // extendChanged is temp - we will do this selectively
				//console.log('run full compile')
				MTsave.update_prog_indicator('plus', TvrLang.compile_scss);
				TvrUi.scss_compile_everything(sources);

				// log that a full compile is needed so that recompile will include everything and update all nodes
				//TvrUi.fullCompileNeeded = true;
			}

			// else we can selectively compile only dependent selectors
			else {
				//console.log('run selective compile')
				TvrUi.add_selective_sources(sources, pp, fullCode);
			}

			// cache deps sels so they can accumulate even if compile doesn't run because new compile waiting
			TvrUi.cachedDeps = $.extend(true, {}, sources.deps);

			/*console.log('Caching the deps', $.extend(true, {}, TvrUi.cachedDeps));
			console.log('the settings', $.extend(true, {}, settings));
			console.log('the resolved sources', $.extend(true, {}, sources), pp);
			console.log('TvrUi.uiData', $.extend(true, {}, TvrUi.uiData.non_section))*/

			// compile
			TvrCom.endT('prep_scss');

			//console.log('TvrUi.sass', TvrUi.sass);

			TvrCom.startT('compile_scss')
			TvrUi.sass.compile(sources.fullstring, function(result) {

				if (fullSCSSCompile){
					MTsave.update_prog_indicator('minus', false, TvrLang.compile_scss);
				}

				//console.log('the live sass result', result);
				TvrCom.endT('compile_scss');
				TvrCom.endT('prep_and_compile_scss');
				TvrUi.compilingSCSS = false;

				/*if (TvrUi.scssCompileNext.run){
					//console.log('Re-running compile');
					TvrUi.scssCompileNext.run = false; // to prevent infinite loop
					TvrUi.scssCompileNext.item.apply(this, TvrUi.scssCompileNext.args);
					return false;
				}*/

				TvrCom.startT('post_scss_node_update_or_error')

				var divPattern = new RegExp(TvrCom.escapeRegExp(TvrUi.scss_div), 'g');

				// always save the last compile for me and users to check
				TvrUi.previousSCSSCompile = sources.fullstring.replace(divPattern, '');

				// if error in compilation (that isn't empty string, which we allow) do not update style node
				// otherwise interim typing / mistake will remove all full code/selector css
				if (result.status && result.status !== 3){

					TvrUi.log_client_scss_error(true, result, false, divPattern);

					config.sassCompileError = 1;

					//console.log('Compile error do not clear', result, $.extend(true, {}, TvrUi.cachedDeps));
					//console.log('sources.fullstring', sources.fullstring)
					//console.log('TvrUi.previousSCSSCompile', TvrUi.previousSCSSCompile);
				}

				// else all good
				else {

					// only remove signal for full compile if no error
					TvrUi.fullCompileNeeded = false;

					// clear any previous error messages
					if (TvrUi.scss_error){
						TvrUi.clear_client_scss_error();
					}

					// update <head> nodes with compiled CSS and savePackage with save data
					settings = TvrUi.update_nodes_with_compiled_css(settings, sources, result);

					// style nodes will be updated now, so no need to accumulate deps from
					// previous or unsuccessful compiles
					TvrUi.cachedDeps = false;
					//console.log('cachedDeps cleared');
				}

				TvrCom.endT('post_scss_node_update_or_error')
				//TvrCom.endT('user_input_to_style_render');
				//console.log('TvrUi.uiData', TvrUi.uiData);

				// run any queued compiles
				var pendingCompile = TvrUi.pendingCompile();
				if (pendingCompile){
					//console.log('Compile waiting, so running before saving', $.extend(true, [], TvrUi.compileQueue));
					TvrUi.deqeueCompile();
					TvrUi.mt_compile_scss.apply(this, pendingCompile);
					return false;
				}

				// go ahead and save
				//console.log('We are good to save', $.extend(true, {}, TvrUi.uiData));
				if (!config.isSassVendorPrefixPatch && !config.keepSelectorAsUnsavedDraft){
					MTsave.save_or_start_timer(config, deferSave, propOrEditor, $editObject);
				}


			});

		},

		update_nodes_with_compiled_css: function(settings, sources, result){

			var allCompiledCSS = result.text ? result.text.trim() : '', // reset everything will result in empty source string
				compiled_parts = TvrUi.extract_compiled_parts(allCompiledCSS),
				compiled_css = '';

			// Not sure why, but sometimes sass compiler adds trailing semicolon ';'
			// This part has no meta counter-part so remove
			if (compiled_parts[compiled_parts.length-1] === ';'){
				compiled_parts.pop();
			}

			// this mistmatch is OK if @extend usage means there are less compiled sels than source parts
			if (sources.parts.length !== compiled_parts.length){
				//alert('Error - array mismatch');
			}

			/*console.log('allCompiledCSS', allCompiledCSS)
			console.log('sources', $.extend(true, {}, sources))
			console.log('compiled_parts', compiled_parts)
			console.log('settings', settings)
			console.log('TvrUi.uiData', TvrUi.uiData)*/

			// update object and save packages with compiled CSS
			for (var i = 0; i < compiled_parts.length; i++) {

				var meta = sources.parts[i];

				// /console.log('the meta', $.extend(true, {}, meta))

				// skip part if comment or selector reference is invalid
				if (meta.isJunk || (meta.trail && !TvrCom.checkObject(TvrUi.uiData, meta.trail))){
					continue;
				}

				var compiled_css_trail = meta.compiled_css_trail
					? meta.compiled_css_trail
					: meta.trail.concat(['compiled_css']);

				// not sure where extra line breaks are coming from, but trim
				compiled_css = compiled_parts[i].trim()+"\n";

                // remove full code editor comment that simply ensures it has some CSS output
                if (meta.node_trail){
                    compiled_css = compiled_css.replace(MTsave.full_editor_placeholder_comment, '');
                }

                // add vendor prefixes / important
                compiled_css = TvrUi.apply_sass_post_css(compiled_css);

				// update object and save package
				var updateCOnfig = {
					action: 'replace',
					trail: compiled_css_trail,
					data: compiled_css
				};

				// and save package (if not full save)
				if (settings.savePackage){
					MTloop.updateObjectAndSavePackage(settings.savePackage, updateCOnfig);
					//console.log('data and save was updated', updateCOnfig)
				} else {
					TvrCom.updateObject(TvrUi.uiData, compiled_css_trail, compiled_css, updateCOnfig);
					//console.log('data only was updated', compiled_css_trail, compiled_css, updateCOnfig);
				}

				// update the node if a node trail was supplied
				// It isn't for selectors because section nodes are updated
				if (meta.node_trail && TvrUi.iframeEditing()){
					MTF.update_preview_style_node(meta.node_trail, compiled_css);
				}
			}

			// now to update the section nodes for selectors
			var nodeKeys = Object.keys(sources.sectionNodes);

			for (var j = 0; j < nodeKeys.length; j++) {

				var info = nodeKeys[j].split('.'),
					mq_key = info[0],
					sectionSlug = info[1],
					node_trail = [mq_key, sectionSlug];

				compiled_css =  TvrCom.get_section_css(
					false, false, TvrCom.get_js_object_data([sectionSlug], mq_key).data, sectionSlug
				);

				//console.log('section compiled_css', compiled_css);

				// update style node
				if (TvrUi.iframeEditing()){
					MTF.update_preview_style_node(node_trail, compiled_css, MTloop.get_media_query(mq_key));
				}

			}

			return settings;

		},

        // add vendor prefixes (and !important) to compiled css
        apply_sass_post_css: function(code){

            var ast = MTdd.parse_css(code, true);

            ast.stylesheet.rules = MTdd.add_final_compile_data(ast.stylesheet.rules);

            return MTdd.stringify_css(ast, {
                opts: {},
                tabDepth: 0,
                tab: ''
            });

        },

		get_selector_index_from_trail: function(sectionSlug, trail){

			var sectionIndex = TvrUi.get_section_index(sectionSlug),
				rootSelTrail = trail.length > 2 ? trail.slice(Math.max(trail.length - 2, 1)) : trail;

			return sectionIndex + TvrUi.get_selector_index(rootSelTrail);
		},

		// update sources with dependent selectors
		scss_deps_to_string_parts: function(sources, deps, all_mq_keys){

			// now we have all selectors (dependent and edited), add to string and parts in correct linear order
			for (var n = 0; n < all_mq_keys.length; n++) {

				var mq_key = all_mq_keys[n],
					metas = deps[mq_key].filter(Boolean),
					isMQ = mq_key !== 'all-devices' && metas.length,
					indent = isMQ ? "\t" : '';

				if (isMQ){

					var MQ = TvrUi.pref.m_queries[mq_key],
						MQcomment = "\n\n/*( "+MQ.label+" )*/\n";

					sources.fullstring+= MQcomment+MQ.query+' {'+"\n"+TvrUi.scss_div;
					sources.parts.push({
						isJunk: true
					});
				}

				for (var m in metas) {

					if ( !metas.hasOwnProperty(m) ) continue; // for compat

					//console.log('the meta', metas[m]);

					var meta = metas[m];

					// ensure selector reference is still valid
					// moving an element between folders could make reference stale as Sass compile is async
					var selector =  TvrCom.checkObject(TvrUi.uiData, [meta.sectionSlug, meta.selectorSlug]);
					if (!selector){
						continue;
					}

					var	sectionH = TvrUi.get_section_name(meta.sectionSlug),
						selectorH = TvrUi.get_selector_name([meta.sectionSlug, meta.selectorSlug]),
						selectorComment = "\n"+indent+"/** "+sectionH+" >> "+selectorH+" **/\n"+indent+TvrUi.scss_div;

					// add comment part
					sources.fullstring+= selectorComment;
					sources.parts.push({
						isJunk: true
					});

					if (meta.mq_key !== 'all-devices'){
						meta.code = meta.code.replace(/\n/g, "\n\t");
					}

					// add code part
					sources.fullstring+= meta.code+TvrUi.scss_div;
					sources.parts.push({
						trail: meta.trail,
						mq_key: meta.mq_key
					});

					// log unique section node
					sources.sectionNodes[meta.mq_key+'.'+meta.sectionSlug] = 1;
				}

				if (isMQ){
					sources.fullstring+= "\n}\n"+TvrUi.scss_div;
					sources.parts.push({
						isJunk: true
					});
				}
			}
		},

		add_full_code_scss_part: function(sources){

			if (!TvrUi.uiData.non_section.hand_coded_css){
				return false;
			}

			var hc_trail = MTdd.get_trail_from_name('tvr_mcth[non_section][hand_coded_css_compiled]'),
				hc_node_trail = $.extend([], hc_trail),
				comment = "/*= Full Code Editor CSS ============ */\n\n"+TvrUi.scss_div;

			// note we prepend, so unshift and string before instead of +=

			// add code part
			//var code = TvrUi.uiData.non_section.hand_coded_css ? TvrUi.uiData.non_section.hand_coded_css : '';
			sources.fullstring = TvrUi.uiData.non_section.hand_coded_css+TvrUi.scss_div + sources.fullstring;
			sources.parts.unshift({
				compiled_css_trail: hc_trail,
				node_trail: hc_node_trail
			});

			// add comment part
			sources.fullstring = comment + sources.fullstring;
			sources.parts.unshift({
				isJunk: true
			});

		},

		scss_error: false,

		// todo recompile everything following an @import change or keyboard shortcut
		scss_compile_everything: function(sources){

			TvrUi.add_full_code_scss_part(sources);

			sources.deps = MTloop.run_global_scans({}, ['get_all_scss']).deps;

			// update sources with dependent selectors
			TvrUi.scss_deps_to_string_parts(sources, sources.deps, Object.keys(TvrMQsCombined));

		},

		get_section_name: function(sectionSlug){
			return TvrCom.checkObject(TvrUi.uiData, [sectionSlug, 'this', 'label']);
		},

		get_selector_name: function(sectionSelectorSlugs){
			var label = TvrCom.checkObject(TvrUi.uiData, sectionSelectorSlugs.concat(['label']));
			return label.split('|')[0];
		},

		get_section_index: function(sectionSlug){
			return TvrCom.checkObject(TvrUi.uiData, [sectionSlug, 'this', 'index']);
		},

		get_selector_index: function(sectionSelectorSlugs){
			return TvrCom.checkObject(TvrUi.uiData, sectionSelectorSlugs.concat(['index']));
		},

		// check if values for variables, functions, mixins changed
		check_update_scss_changes: function(settings, config){

			// parse scss if possible
			var	active_scss_types = this.get_scss_types(config);
			if (active_scss_types === 'parseFail'){
				//console.log('the parser failed');
				return false;
			}

			// this path will be used for future custom editor system
			//console.log('the config.scss_types_trail', config.scss_types_trail, $.extend(true, {}, TvrCom.checkObject(TvrUi.uiData, config.scss_types_trail)))
			var prev_scss_types = TvrCom.checkObject(TvrUi.uiData, config.scss_types_trail),
				changed = TvrUi.compare_scss_types(prev_scss_types, active_scss_types);

			// update previous for next comparison
			if (changed){

				// if extend changed, search for co-dependents
				if (TvrCom.obj_length(changed.extend) > 0){
					//console.log('changed.extend', changed.extend, TvrCom.obj_length(changed.extend), settings, config);
					//console.log('active_scss_types before', $.extend(true, {}, active_scss_types));
					TvrUi.search_scss_extendable_selectors(settings, config, changed.extend, active_scss_types);
					active_scss_types = settings.active_scss_types;
					//console.log('active_scss_types after', $.extend(true, {}, active_scss_types), $.extend(true, {}, changed));
				}

				// ensure we keep locMeta from previous extend scan if a Sass entity other than @extend changed
				if (active_scss_types.extend){

                    var extendedSels = Object.keys(active_scss_types.extend);
                    for (var i = 0; i < extendedSels.length; i++) {
                    	var name = extendedSels[i];
                    	if (!TvrCom.checkObject(changed, ['extend', name])){
                            active_scss_types.extend[name] = prev_scss_types.extend[name];
						}
                    }
                }

				MTloop.updateObjectAndSavePackage(settings.savePackage, {
					action: 'replace',
					trail: config.scss_types_trail,
					data: active_scss_types
				});

				//console.log('saving the new scss_types', config.scss_types_trail, active_scss_types, changed, $.extend(true, {}, settings))
			}

			//console.log('the active scss types', config, active_scss_types, active_scss_types)

			return changed;

		},

		// search for selectors that can be extended with @extend rules (so co-dependent)
		search_scss_extendable_selectors: function(settings, config, extend, active_scss_types){

			settings.extend = extend; //$.extend(true, {}, extend); we want copy actuall
			settings.active_scss_types = active_scss_types;

			// GUI selectors can be specific about the media query
			if (config.mq_key){
				settings.mq_key = config.mq_key;
			}

			// certainly when @extend is removed, we need to do a full compile
			// to avoid doing a specific check (as wanting to launch beta) always do full recompile
			//settings.fullSCSSCompile = 1;

			// loop all selectors using global scans with check if extendable
			var extendedSettings = MTloop.run_global_scans(settings, ['tag_extended']);

			settings.active_scss_types = extendedSettings.active_scss_types;
			//console.log('extendedSettings', extendedSettings, settings);


			//return settings;

		},

		// get only the CSS bit we need
		extract_compiled_parts: function(css){
			return css.split(TvrUi.scss_div).filter(Boolean);
		},

		// check if a file exists in /micro-themes dir exists
		check_file_exists: function(path, sassFormat){

			var files = TvrMT.data.dyn.micro_files,
				parts = path.split('/'),
				partsFinalIndex = parts.length-1,
				name = parts[partsFinalIndex],
				variations = [parts];

			// check various permutations as SASS allow for imprecise naming
			if (sassFormat){

				// check for user specified file extension
				var definedExt = TvrCom.file_extension(name);
				if (definedExt){
					definedExt = definedExt[1];
				}

				// variation dimensions
				var noExt = TvrCom.strip_extension(name).replace('_', ''),
					extensions = definedExt ? [definedExt] : ['scss', 'sass', 'css'],
					names = [noExt, '_'+noExt];

				// create variations
				variations = [];
				for (var j = 0; j < extensions.length; j++) {
					for (var i = 0; i < names.length; i++) {
						var n = names[i],
							e = extensions[j],
							partsClone = $.extend([], parts);

						partsClone[partsFinalIndex] = n+'.'+e;
						variations.push(partsClone);

					}
				}

			}

			//console.log('variations', parts, variations);
			//console.log('TvrMT.data.dyn.micro_files', path, TvrMT.data.dyn.micro_files);

			// loop through variations (which may just be one file name)
			for (var k = 0; k < variations.length; k++) {
				var variation = variations[k],
					file_exists = TvrCom.checkObject(files, variation);
				if (file_exists){
					return variation.join('/');
				}
			}

			return false;
		},

		// END SCSS


		/*** enable or disable buttons ***/
		toggle_enabled_buttons: function(){ TvrCom.startT(arguments);

			// no sels
			if (TvrUi.totalSels < 1 ) {
				TvrUi.reset_global_vars();
				$('#starter-message').removeClass('hidden');
				$('#quick-nav').addClass('hidden');
				TvrUi.stat.tvr.removeClass('tvr-sels-exist').addClass('tvr-no-sels');

				// Remove blue dots from the tabs
				TvrUi.stat.res.find('.mq-tab').removeClass('hasValues');

			}
			// 1 or more sels
			if (TvrUi.totalSels > 0) {
				$('#starter-message').addClass('hidden');
				$('#quick-nav').removeClass('hidden');
				TvrUi.stat.tvr.addClass('tvr-sels-exist').removeClass('tvr-no-sels');
			}
			TvrCom.endT(arguments)
		},

		// we may need enable/disable_elementor() functions but it *seems* to be fine to just hide UI elements with CSS

		maybeFilterNewPreviewUrl: function(url){

			// Ensure amendments are set dynamically if content editing is enabled
			if (TvrMT.data.dyn.ui_config.supportContent){
				url = TvrCom.append_url_param(url, 'dyn_amends');
				//console.log('Added dyn_amends param', url);
			} else {
				//console.log('Did NOT add dyn_amends param', url);
			}

			TvrUi.stat.iframeDoc.location = url;
		},

		// remember last page viewed (initially triggered from overlay.js)
		remember_page_viewed: function(suppliedURL){ TvrCom.startT(arguments);

			if (!MTF){
				return false;
			}

			// get url from meta tag or use url passed into function
			var url = suppliedURL ? suppliedURL : MTF.get_current_url();

			//console.log('the page url', url, suppliedURL)

			// preview=true causes issues inside MT possible due to permissions, so strip
			if (url){

			    url = TvrCom.strip_page_builder_and_other_params(url);

			} else {
			    return false;
            }

			// extract only the path
			var path = TvrCom.extract_url_path(url, TvrUi.blog_details);

			//console.log('url and path to save', path, url, 'path encoded', encodeURIComponent(path));
			//console.trace();

			// only save if it's local, it has changed, and it isn't nothing or the place-holder page
			/*var $changeUrlInput = $('#previewPath'),
				previewPath = $changeUrlInput.val();*/

			if (TvrCom.hasValue(url)
					// && url.indexOf(thisDomain) === 0 // so this works with browser sync
				//&& path != previewPath (otherwise user manually specified url isn't saved)
				&& !TvrUi.placeholderFrame) {

                // update the current page title
				var pageTitle = MTF.get_current_page_title(path);

				// lost password will say 'Untitled' - this will only work for English users unfortunately
				if (pageTitle === 'Untitled'){
					pageTitle = path;
				}


				// save previewUrl in preferences table
				MTsave.simple_ajax_request({
					type: 'GET',
					url: TvrUi.ajaxUrl+
						'&mt_preview_url='+ encodeURIComponent(url)+
						'&mt_preview_path='+encodeURIComponent(path)+
						'&mt_path_label='+encodeURIComponent(pageTitle)+ // label might actually be an URL with e.g. action=edit
						'&mt_item_id='+TvrUi.pageOrPostID
				});



				// Also update the "edit page directly if we're pn an admin page
				let $editPageDirectly = $('#edit-page-directly'),
					MTDynFrontData = MTF.getMTDynFrontData() || {},

					// try to use the permalink if set
					frontendUrl = MTDynFrontData.permalink || url;

				// update URL and hide/show status of the new edit page directly option
				$editPageDirectly.attr('href', url);
				if (MTDynFrontData.isAdminArea){
					$editPageDirectly.removeClass('hidden')
				} else {
					$editPageDirectly.addClass('hidden');
				}

				// update the preview input field, exit link to the frontend, and JS pref
				TvrUi.stat.changeUrlInputWrap.find('input').val('');
				$('#back-to-frontend').attr('href', frontendUrl);

				TvrUi.pref.preview_url = url;
				$('#pref-preview-url-input').val(url);

				// update custom paths
                var custom_paths = TvrMT.data.prog.combo.custom_paths,
					existingKey = TvrCom.in_array(path, custom_paths, false, 'value');

                if (existingKey){
					custom_paths.splice(existingKey, 1);
				}

				// sometimes the page title might have a different URL e.g. /?p=1, /, /home-page/
				// so we should remove any with the same name,
				// as the user probably just wants to most recent URL e.g. /home-page/ for the title
				for (var i = (custom_paths.length-1); i >= 0; i--) {
					if (custom_paths[i].label === pageTitle){
						//console.log('remove the same page title', custom_paths[i].label, custom_paths[i].value);
						custom_paths.splice(i, 1);
					}
				}

				// prepend to beginning of array
                custom_paths.unshift({
					value: path,
					label: pageTitle,
					item_id: TvrUi.pageOrPostID
				});

				// limit to 8
				TvrMT.data.prog.combo.custom_paths = custom_paths.slice(0, 8);

			}

			// ensure BB switch is off if the user exists BB via the done option rather than the MT toggle
			/*if (url.indexOf('fl_builder') < 0){
                MTint.manually_turn_toggle('off', 'enable_beaver_builder');
				//TvrUi.turn_bb_toggle('off');
			}*/

			TvrCom.endT(arguments)

		},

		// manually adjust BB toggle
		/*turn_bb_toggle: function(action, uiCorrection){

			var $toggle = TvrUi.stat.tools.find('li.enable_beaver_builder').find('div.mtonoffswitch'),
				on = $toggle.hasClass('on'),
				config = {
					uiCorrection: uiCorrection
				};

			// ensure off
			if ( action == 'off' && on ){
				TvrUi.feature_off($toggle, 'enable_beaver_builder', config);
			}

			// ensure on
			else if ( action == 'on' && !on ){
				TvrUi.feature_on($toggle, 'enable_beaver_builder', config);
			}
		},*/

		// remember entered css import file
		remember_css_import_file: function(){ TvrCom.startT(arguments);

			var url = $('#stylesheet_to_import').val();

			// bail if none specified
			if (!TvrCom.hasValue(url)) {
				return false;
			}

			// save stylesheet and update combo data
			MTsave.simple_ajax_request({
				type: 'GET',
				url: TvrUi.ajaxUrl + '&import_css_url='+encodeURI(url)
			});

			//$.get(TvrUi.ajaxUrl + '&import_css_url='+encodeURI(url));

			// if it's already in the list, ensure it's at the top
			var curKey = TvrCom.in_array(url, TvrMT.data.prog.combo.viewed_import_stylesheets);
			if (curKey !== false){
				TvrMT.data.prog.combo.viewed_import_stylesheets.splice(curKey, 1);
			}
			TvrMT.data.prog.combo.viewed_import_stylesheets.unshift(url);
			TvrCom.endT(arguments)
		},

		// object map for stylesheets to ignore
		exclStylesheetSubStrings: {
			always: [
				{
					str: 'wp-includes/css',
					unless: null // exception e.g. ['css-file-we-want.css'], this should be an array
				},
				{ str: 'wp-includes/js' },
				{ str: 'admin-bar' },
				{ str: 'dashicons' },
				{ str: 'font-awesome' },
				{ str: 'genericons' },
				{ str: 'microthemer/css/frontend' }, // temp remove to test var sampling which can happen when concat in use
				{ str: 'animate.min.css' },
                { str: 'fonts.googleapis.com' },

                // elementor-icons, frontend.css, animations.min.css are all in assets folder
                // and should be ignored always
                {
                    str: 'elementor/assets',
                    unless: 'frontend.min.css' // not sure if this is just admin stuff
                }
			],
			// if an Beaver Builder is active
			FLBuilder: [
				{ str: 'bb-plugin/css' }, // maybe add unless: ['magnificpopup.css']
				{ str: 'foundation-icons' }
			],
            oxygen: [
                { str: 'component-framework/vendor' },
                { str: 'component-framework/toolbar' },
                { str: 'wp-includes/js/tinymce' },

                // maybe
                { str: 'jquery-ui.css' },
                { str: 'buttons.min.css' },
                { str: 'mediaelementplayer-legacy.min.css' },
                { str: 'wp-mediaelement.min.css' },
                { str: 'imgareaselect.css' },
                { str: 'wp-includes/css/editor.min.css' },

            ]
		},

		// evaluate if a stylesheet should be ignored
		ignore_stylesheet: function(stylesheet, stylesheetObj){

			// always accept null stylesheets, as this relates to inline styles
			if (!stylesheet){

				// return true; // test

				// oxygen has font-awesome CSS as inline <style> tag when active
				if (stylesheetObj.ownerNode && stylesheetObj.ownerNode.className === 'ct_svg_sets'){
                    //console.log('stylesheetObj', stylesheetObj.ownerNode.id , stylesheetObj.ownerNode.className, stylesheetObj)
					return true;
				}

				return false;
			}

			var excl = TvrUi.exclStylesheetSubStrings;
			for (var con in excl){

				if ( ! excl.hasOwnProperty(con) ) continue; // for compat

				// if it's integration specific, bail if irrelevant
				if (con !== 'always' && !TvrMT.integrate[con]){
					continue;
				}

				// it's relevant, check if sub-string is in stylesheet
				for (var index in excl[con]){
					if ( ! excl[con].hasOwnProperty(index) ) continue; // for compat
					var obj = excl[con][index];
					// todo unless should support an array
					if (stylesheet.indexOf(obj.str) > -1 && (!obj.unless || stylesheet.indexOf(obj.unless) < 0)){
                        //console.log('ignore', stylesheet);
						return true;
					}
				}
			}
			//console.log('stylesheet is good: ', stylesheet);
			return false;
		},

		// return a filtered list of stylesheets, excluding certain stylesheets
		filter_excluded_stylesheets: function(stylesheets){
			for (var i = stylesheets.length -1; i >= 0; i--) {

				if (TvrUi.ignore_stylesheet( stylesheets[i].href, stylesheets[i] )){
					//console.log('exclude: ', stylesheets[i].href);
					stylesheets.splice(i, 1);
				} else {
					//console.log('keep: ', stylesheets[i].href, stylesheets[i]);
				}

			}

            //console.log('The final stylesheets: ', stylesheets);

			return stylesheets;
		},

		// populate combobox with a list of stylesheets affecting the current site preview (doesn't save list)
		refresh_stylesheet_list: function($clicked){

			var $input = $clicked.siblings('input');

			// check stylesheets
			var stylesheets = MTF.stat.doc.styleSheets,
				exclude = ['admin-bar', 'dashicons', 'genericons', 'microthemer/css/frontend'],
				finalList = [];

			// populate array
			for (var i in stylesheets){
				if ( ! stylesheets.hasOwnProperty(i) ) continue; // for compat
				var href = stylesheets[i].href,
					skip = false;
				if (!href) continue;
				for (var j in exclude){
					if ( ! exclude.hasOwnProperty(j) ) continue; // for compat
					if (href.indexOf(exclude[j]) > -1) {
						skip = true;
						break;
					};
				}
				if (!skip){
					finalList.push(href);
				}
			}

			// copy array to combobox store
			TvrMT.data.prog.combo.viewed_import_stylesheets = $.extend(true, [], finalList);

			// display updated list
			$input.focus().MTautocomplete().MTautocomplete( "search", "" );
		},

		/*** update visual controls given the current selector ***/
        update_prev_next_sel_buttons: function(SelID){ TvrCom.startT(arguments);

            // no selectors left, disable quick nav buttons
            if (!SelID){
                $('#vb-focus-prev, #vb-focus-next').addClass('disabled');
                return false;
            }

            var M = TvrUi.slugs_from_id(SelID),
                $prevButton = $('#vb-focus-prev'),
                $nextButton = $('#vb-focus-next'),
                prev = TvrUi.itemScan('selector', 'prev', 'getID', M.sectionSlug, M.selectorSlug, {
                    incCurrentSection: true
                }),
                next = TvrUi.itemScan('selector', 'next', 'getID', M.sectionSlug, M.selectorSlug, {
                    incCurrentSection: true
                });

			//console.log('prev, next', prev, next);

            // set prev button controls
            if (prev){
                $prevButton.removeClass('disabled');
            } else {
                $prevButton.addClass('disabled');
            }

            // set next button controls
            if (next){
                $nextButton.removeClass('disabled');
            } else {
                $nextButton.addClass('disabled');
            }

            TvrCom.endT(arguments);

        },


        // get item prev keys
        itemScan: function(type, dir, action, curSectionSlug, curSelectorSlug, config){

            config = config ? config : {};

            // previous/next sections (including/not including current)
            var incCurrentSection = config.incCurrentSection ? 'IncCurrent' : '',
                section_keys = TvrCom.editArray(Object.keys(TvrUi.uiData), 'non_section', 'remove');
                section_keys = TvrCom.editArray(section_keys, curSectionSlug, dir+'Items'+incCurrentSection);

            // put sections in reverse order if checking prev
            if (dir === 'prev'){
                section_keys.reverse();
            }

            for (var i = 0; i < section_keys.length; i++) {

                var sectionSlug = section_keys[i];

                // we found a section and are acting on a section
                if (type === 'section'){

                    switch(action) {

                        // does it have a style node in the dom?
                        case 'getPreviousNode':

                            var secNodeID = MTloop.format_css_node_id([config.mq_key, sectionSlug]),
                                $secNode = MTF.frontend_jquery_select('#'+secNodeID);

                            // if we found the node it should go after, return
                            if (TvrCom.isDomEl($secNode)){
                                return $secNode;
                            }
                            break;
						case 'getSlugIfHasLogic':
							if (TvrCom.checkObject(TvrUi.uiData, [sectionSlug, 'this', 'logic', 'expr'])){
								return sectionSlug;
							}
							break;
                        case 'getID':
                            return 'strk-'+sectionSlug;
                    }
                }


                // loop selectors if we'r elooking for a selector
                if (type === 'selector'){

                    var selector_keys = TvrCom.editArray(Object.keys(TvrUi.uiData[sectionSlug]), 'this', 'remove');
                    selector_keys = (curSectionSlug === sectionSlug)
                        ? TvrCom.editArray(selector_keys, curSelectorSlug, dir+'Items')
                        : selector_keys;

                    // put selectors in reverse order if checking prev
                    if (dir === 'prev'){
                        selector_keys.reverse();
                    }

                    // loop the selectors looking for nodes
                    for (var j = 0; j < selector_keys.length; j++) {

                        var selectorSlug = selector_keys[j];

                        // we found a selector
                        switch(action) {

                            // does it have a style node in the dom?
                            case 'getPreviousNode':
                                var selNodeID = MTloop.format_css_node_id([config.mq_key, sectionSlug, selectorSlug]),

                                    // todo test this works
                                    $selNode = MTF.frontend_jquery_select('#'+selNodeID);

                                // if we found the node it should go after, return
                                if (TvrCom.isDomEl($selNode)){
                                    return $selNode;
                                }
                                break;

                            case 'getID':
                                return 'strk-'+sectionSlug+'-'+selectorSlug;
                                break;
                        }
                    }

                }




            }

            // no selector found
            switch(action) {

                // we failed to find a previous selector node for the MQ type, so return the MQ flag
                case 'getPreviousNode':
                    return MTF.frontend_jquery_select('#'+MTloop.format_css_node_id([config.mq_key]));
                    break;
                case 'getID':
                    return false;
                    break;
            }

            return false;

        },


        // get item prev keys
        itemScanOld: function(dir, action, curSectionSlug, curSelectorSlug, config){

            config = config ? config : {};

            // previous/next sections (including/not including current)
            var incCurrentSection = config.incCurrentSection ? 'IncCurrent' : '',
                section_keys = TvrCom.editArray(Object.keys(TvrUi.uiData), 'non_section', 'remove');
                section_keys = TvrCom.editArray(section_keys, curSectionSlug, dir+'Items'+incCurrentSection);

            // put sections in reverse order if checking prev
            if (dir === 'prev'){
                section_keys.reverse();
            }

            for (var i = 0; i < section_keys.length; i++) {

                var sectionSlug = section_keys[i],
                    selector_keys = TvrCom.editArray(Object.keys(TvrUi.uiData[sectionSlug]), 'this', 'remove');
                    selector_keys = (curSectionSlug === sectionSlug)
                        ? TvrCom.editArray(selector_keys, curSelectorSlug, dir+'Items')
                        : selector_keys;

                // put selectors in reverse order if checking prev
                if (dir === 'prev'){
                    selector_keys.reverse();
                }

                // loop the selectors looking for nodes
                for (var j = 0; j < selector_keys.length; j++) {

                    var selectorSlug = selector_keys[j];

                    // we found a selector
                    switch(action) {

                        // does it have a style node in the dom?
                        case 'getPreviousNode':
                            var selNodeID = MTloop.format_css_node_id([config.mq_key, sectionSlug, selectorSlug]),

                                // todo test this works
                                $selNode = MTF.frontend_jquery_select('#'+selNodeID);

                            // if we found the node it should go after, return
                            if (TvrCom.isDomEl($selNode)){
                                return $selNode;
                            }
                            break;

                        case 'getID':
                            return 'strk-'+sectionSlug+'-'+selectorSlug;
                            break;
                    }
                }
            }

            // no selector found
            switch(action) {

                // we failed to find a previous selector node for the MQ type, so return the MQ flag
                case 'getPreviousNode':
                    return MTF.frontend_jquery_select('#'+MTloop.format_css_node_id([config.mq_key]));
                    break;

                case 'getID':
                    return false;
                    break;
            }

            return false;

        },

		/*** traverse section trackers, looking for selector trackers ***/
		/*selectorTrackerScan: function($sec, dir, con, $sel){ TvrCom.startT(arguments);
			if (dir == 'prev') {
				// first look for previous selectors in same section
				if (con == 'selector') {
					var $prevSel = $sel.prev('li.strk-sel');
					// if it's a valid selector, return
					if ( TvrCom.hasValue($prevSel.attr('id')) ) {
						TvrCom.endT(arguments)
						return $prevSel;
					} else {
						// if no selector is found, resort to previous sections scan
						TvrCom.endT(arguments)
						return TvrUi.selectorTrackerScan($sec, dir);
					}
				}
				// if it's a valid section, look for selectors
				var $prevSec = $sec.prev('li.strk-sec');
				if ( TvrCom.hasValue($prevSec.attr('id')) ) {
					var $prevSecLastSel = $prevSec.find('.strk-sel').last();
					// if we find a selector tracker, return input object
					if (TvrCom.hasValue($prevSecLastSel.attr('id'))) {
						TvrCom.endT(arguments)
						return $prevSecLastSel;
					} else {
						// if no selectors found in this section, keep looking (call this recursive function again)
						TvrCom.endT(arguments)
						return TvrUi.selectorTrackerScan($prevSec, dir);
					}
				} else {
					// return false as there are no more sections to search
					TvrCom.endT(arguments)
					return false;
				}
			} else if (dir == 'next') {
				// first look for next selectors in same section
				if (con == 'selector') {
					var $nextSel = $sel.next('li.strk-sel');
					// if it's a valid selector, return
					if ( TvrCom.hasValue($nextSel.attr('id')) ) {
						TvrCom.endT(arguments)
						return $nextSel;
					} else {
						// if no selector is found, resort to next section scan
						TvrCom.endT(arguments)
						return TvrUi.selectorTrackerScan($sec, dir);
					}
				}
				// if it's a valid section, look for selectors
				var $nextSec = $sec.next('li.strk-sec');
				if ( TvrCom.hasValue($nextSec.attr('id')) ) {
					var $nextSecFirstSel = $nextSec.find('.strk-sel').first();
					// if we find a selector tracker, return input object
					if (TvrCom.hasValue($nextSecFirstSel.attr('id'))) {
						TvrCom.endT(arguments)
						return $nextSecFirstSel;
					} else {
						// if no selectors found in this section, keep looking (call this recursive function again)
						TvrCom.endT(arguments)
						return TvrUi.selectorTrackerScan($nextSec, dir);
					}
				} else {
					// return false as there are no more sections to search
					TvrCom.endT(arguments)
					return false;
				}
			}
		},*/

		/*** toggle highlighting on or off
		 toggle_highlighting: function(){ TvrCom.startT(arguments);

		},***/

		/* temp highlighting for view menu option and keyboard shortcut
		 tmp_highlighting: function(){ TvrCom.startT(arguments);

		 // highlight if the sel exists
		 if (TvrCom.hasValue(TvrUi.selInFocusID)){
		 var M = TvrUi.get_meta($('#'+TvrUi.selInFocusID), 'selector');

		 // get css for current sel into global var
		 TvrUi.intelli_css = M.selectorM.find('span.selector-name').attr('title');

		 // enable highlighting if not already
		 if (!TvrUi.highlightEnabled) {
		 TvrUi.tmpHighlighting = true;
		 TvrUi.toggle_highlighting();
		 }

		 // switch highlight
		 if (TvrUi.iframeEditing()){
		 MTF.reposition_overlays('reg', 1);
		 }
		 }
		 },*/
		/*** set highlighting back to normal mode
		 return_normal_highlighting: function(){ TvrCom.startT(arguments);
			// turn off if it was only on temporarily
			if (TvrUi.highlightEnabled && TvrUi.tmpHighlighting) {
				TvrUi.tmpHighlighting = false;
				TvrUi.toggle_highlighting();
			}
			if (TvrUi.iframeEditing()){
				var con = 'reg';
				if (TvrUi.intelli) {
					var con = 'intelli';
				}
				MTF.reposition_overlays(con);
			}
		},
		 ***/
		/*** if next, prev or either vmenu is changed go to new selector ***/
		tvr_iterate_selectors_v: function($selectorM, id, config){ TvrCom.startT(arguments);

			config = config || {};

			// cancel any draft selector that might be in progress
			if (config.action !== 'add_draft_selector' && !config.draftSelectorFolderCreated){
				TvrUi.cancel_draft_selector_edit();
				//console.log('Cancel the draft selector here', config, $selectorM);
			}

            // get passed id or extract from (possibly stale) dom reference
		    id = id || $selectorM.attr('id');

		    // get dom ref or use id (one or the other will always be defined)
			$selectorM = $selectorM || $('#'+id);

		    //console.log('the initial id', id, !TvrCom.isDomEl($selectorM, true))

			// we now load the whole folder if the selector is not loaded
			// that way, the iteration thing works fine
			if (!TvrCom.isDomEl($selectorM, true)){

				var slugs = TvrUi.slugs_from_id(id),
					itemID = 'strk-'+slugs.sectionSlug+'-'+slugs.selectorSlug,
					$sectionM = $('#strk-'+slugs.sectionSlug),
					folderM = {
						sectionSlug: slugs.sectionSlug,
						sectionM: $sectionM
					};

				//console.log('folderM', folderM, '#strk-'+slugs.sectionSlug, $sectionM);

				var	allFolderItems = TvrUi.load_folder_menu_selectors(folderM);

				//console.log('allFolderItems', folderM, allFolderItems)

				// we then extract the individual item from the array
				for (var i = 0; i < allFolderItems.length; i++) {

					// JS el must item must be made into jQuery object (not sure why it isn't already sometimes)
					var $item = $(allFolderItems[i]);

					//console.log('itemID', i, itemID, $item);
					if ($item.attr('id') === itemID){
						$selectorM = $item;
					}
				}

				// close all other folders to prevent accumulative HTML when switching between selectors
				// or maybe it's more convenient to have then open, wait and see (has some glitches to work out if using)
				//TvrUi.open_close_all_folders('close', false, slugs.sectionSlug)
				//console.log('the individual and set', $selectorM, allFolderItems)
			}


			/*$selectorM = TvrCom.isDomEl($selectorM, true)
				? $selectorM
				: TvrUi.load_selector(TvrUi.slugs_from_id(id), {
					items:['selectorM']
				});*/

            // give the relevant selector (options & menu) a class of in-focus (remove any others first)
            TvrUi.stat.opts.add(TvrUi.stat.mainMenu).find('li.in-focus').removeClass('in-focus');

			// on to the next selector
			var M = TvrUi.get_meta($selectorM, 'selector');

			// ensure the folder is open
			if (!M.sectionM.hasClass('is-open')){
				//console.log('Open folder as not already open', M.sectionM.hasClass('is-open'), M.sectionM[0].outerHTML)
				TvrUi.open_folder(M, true); // no need to load as will be done above if necessary
			}

			//
			//console.log('Do pre-flight check here instead?', M)
			// Do a preflight check on which multiTab we should load
			// As Amender switches tab sometimes and it's efficient to update the
			// index before loading anything
			if (TvrUi.pref.pg_focus === 'html'){

				//console.log('Do pre-flight check', M);
				//console.trace();

				let groupSlug = 'html',
					groupData = TvrCom.get_js_object_data(
					[M.sectionSlug, M.selectorSlug, 'styles', groupSlug], M.tabSlug
				).data;

				TvrUi.resolveMultiTab(
					M.sectionSlug,
					M.selectorSlug,
					groupSlug,
					groupData
				)
			}

            // maybe load the options selector

			// Clean up any lingering Snippet Editor references to free up memory
			//TvrUi.beforeDOMViewChange();

            var $template = TvrUi.load_selector(M, {
                items:['selector']
            });

            // redo M in case new dom item loaded
            M = TvrUi.get_meta($template, 'selector');

            // give the relevant selector (options & menu) a class of in-focus
            M.selector
				.add(M.selectorM)
				.add(M.section)
				.add(M.sectionM)
				.addClass('in-focus');

            // before updating global vars, remove previous selector (if not navigating to current sel again)
            //console.log('TvrUi.menuSelInFocusID', TvrUi.menuSelInFocusID, M.selectorMID);
            /*if (TvrUi.menuSelInFocusID && TvrUi.menuSelInFocusID !== M.selectorMID && action !== 'copy'){
                $('#'+TvrUi.menuSelInFocusID).remove();
            }*/

            // update the global vars
            TvrUi.update_global_vars(M, config);

            //console.log('TvrUi.selInFocusID', TvrUi.selInFocusID)

            // unload non-current selectors in options
            TvrUi.unload_all_option_selectors();

            // update the controls
            TvrUi.update_prev_next_sel_buttons(M.selectorID);

            // we can skip property group selection as that happens after adding base styles when creating a pseudo el
            if (config.addPseudoBaseStyles){
            	return;
			}

            // default to last edited property group if possible
			//TvrUi.beforeDOMViewChange();
            TvrUi.maybe_default_to_pg(config);

            // update all tab feathers and pg icon backgrounds
            TvrUi.js_check_values({}, M);

            // set/remove disabled class (active)
            TvrUi.selector_check_disabled(M);

            // adjust the iframe to the right height
            MTlayout.toolbar_adjusted();

            // select the element if the selector targets something on the current page
			if (TvrUi.iframeEditing() && !config.elementAlreadySelected ){
				//console.log('select_current_selector_elements config', $.extend(true, {}, config), M.sectionM[0].outerHTML)
				config.existingSelCSS = TvrCom.custom_escape_quotes(TvrUi.curSelCSS); // TvrUi.curSelCSS;
				config.selMID = M.selectorMID;
				//config.selectCurrentSelector = 1;
				MTF.select_current_selector_elements(config);
			}

			return M;

			//console.log('End of iterate', M.sectionM[0].outerHTML)


			TvrCom.endT(arguments)
		},
		// when navigating onto a selector, it's nice to highlight what it targets for a second or so
		/*briefly_highlight_selector: function(){ TvrCom.startT(arguments);

            //console.log('enable brief highlight', TvrUi.curSelCSS)

			// don't change focus when working on global variables
			if (TvrUi.curSelCSS === ':root'){
            	return false;
			}

			// highlight current selector
			TvrUi.feature_on(0, 'mt_highlight', {
				// turn off any wizard highlighting first
				offFirst: {fHTML:1, noSave:1},
				fHTML:1,
				noSave:1,
				con: 'reg'
			});

			// turn off again after a short delay
			setTimeout(function() {
				TvrUi.feature_off(0, 'mt_highlight', {fHTML:1, noSave:1});
			}, 1000);

            TvrCom.endT(arguments);
		},*/


		iframeEditing: function(withInteractions){

			return MTF && (!withInteractions || (MTF.getMTDynFrontData() && MTF.getMTDynFrontData().interactions));
			// && MTF.getMTDynFrontData().assetEditing;
		},

		// default to last viewed property group (this is saved via simple ajax)
		maybe_default_to_pg: function(config, doNotLoad = true){

			//var M = TvrUi.get_meta($sel, 'selector');

			// get ajax passed value or global JS value
			var pgFocus = TvrUi.pref.pg_focus;

			// default to pg group if one is found, otherwise default to font
			var pgSelStr = pgFocus ? '.pg-icon-'+pgFocus : '.pg-icon-font',
				$pgIcon = TvrUi.stat.css_icons.find(pgSelStr);

			// the saved group may not exist in this build (e.g. a pro-only group after switching to the free build)
			if (!$pgIcon.length){
				TvrUi.pref.pg_focus = 'font';
				$pgIcon = TvrUi.stat.css_icons.find('.pg-icon-font');
			}

			//console.log('maybe_default_to_pg', pgFocus, pgSelStr, $pgIcon, true, config)

			TvrUi.pg_icon_pressed($pgIcon, doNotLoad, config);

		},

		// go to next or previous selector
		quick_nav: function($clicked){ TvrCom.startT(arguments);

		    // abort if button is disabled
			if ($clicked.hasClass('disabled') || !TvrUi.selInFocusID){
				return false;
			}

			var M = TvrUi.get_meta($('#'+TvrUi.selInFocusID), 'selector'),
                dir = $clicked.attr('id') === 'vb-focus-prev' ? 'prev' : 'next';

			TvrUi.tvr_iterate_selectors_v(false, TvrUi.itemScan('selector', dir, 'getID', M.sectionSlug, M.selectorSlug, {
                incCurrentSection: true,
            }), {
				doNotBringStylesTop: 1 // this will happen when clicking arrows anyway, but won't when using shortcut
			});
		},

		// use the toggle class state as a most up to date indicator of Gutenberg status
		gutenbergIsActive: function(){
			//console.log('gutenbergIsActive', TvrUi.stat.settingsMenu.find('.activate_gutenberg .uit-par'))
			return TvrUi.stat.settingsMenu.find('.activate_gutenberg .mt-ui-toggle').hasClass('on');
		},

		// we just need this right now for updating the MTdetached references
		set_vars: function(){
			MTF = TvrMT.MTF;
			MTdetached = window.TvrMT.MTdetached;
			detachedWin = window.TvrMT.detachedWin;
		},

		/*contextMenu: {
			dragStart: function(){

			},
		}*/

	};

	// make shorthand object reference available to this function
	var TvrUi = TvrMT.TvrUi;

	// ensure object have reference to TvrUi
	MTlocal.set_vars();
	TvrCom.set_vars();
	MTace.set_vars();
    MTint.set_vars();
    MTloop.set_vars();
    MTdd.set_vars();
    MTsave.set_vars();
    MTsass.set_vars();
    MTgrid.set_vars();
	MTfolder.set_vars();
	MThtml.set_vars();
	MTai.set_vars();
	MTwidget.set_vars();
	MTlayout.set_vars();
	TvrMT.hooks.doAction('setVars');

	//MTtransform.set_vars();

	// initialise the TvrUi object
	TvrUi.init();

	//console.log(TvrCom.print_r(TvrUi.uiData));



});

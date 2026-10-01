/*
Code for managing detached site preview
*/
function valid_mt_opener(currentWin, opener){
	try {
		//console.error('valid_mt_opener', currentWin);
		return opener && opener.TvrMT && !opener.closed
			&& opener.document.domain.indexOf(currentWin.document.domain) > -1;
	}
	catch(error) {
		//console.error(error);
		return false;
	}
}

// get Reference to main MT window
var MTdetached,
	MTWindow = valid_mt_opener(window, window.opener) //window.opener && !window.opener.closed && window.opener.TvrMT
                ? window.opener
                : false;

//console.log('the Detached thing', MTWindow);

var MTDetachedWindow = true;

// store reference to detached window
if (MTWindow && MTWindow.TvrMT){

	// JavaScript Document
	jQuery(document).ready(function($){

		// copy object references so we can use same syntax as elsewhere
		var TvrMT,
			TvrUi,
			MTF,
			TvrCom,
			MTint,
			MTloop,
			MTdd,
			MTsass,
			MTace,
			MTgrid,
			tvrsprintf,
			TvrLang,
			MTsave,
			MTlayout,
			MTfolder,
			MThtml,
			MTai;

		// preview management object
		MTdetached = {

			stat: {
				tvr: $('#tvr'),
				front:$('#v-frontend-wrap'),
				frontInner:$('#v-frontend'),
				win: window,
				html: $('html'),
				iframe: $('#viframe')
			},

			set_vars: function(){

				// Ensure we have latest reference to MT window (this is triggered from main sometimes)
				MTWindow = window.opener;

				TvrMT = MTWindow.TvrMT;
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
				MTfolder = TvrMT.mod.MTfolder;
				MThtml = TvrMT.mod.MThtml;
				MTai = TvrMT.mod.MThtml;
				tvrsprintf =  TvrMT.tvrsprintf;
				TvrLang = MTWindow.TvrLang;

				// make object available to other windows
				TvrMT.MTdetached = MTdetached;

				// store window reference
				TvrMT.detachedWin = window;

				// Ensure MTF available to main window
				if (TvrUi.iframeEditing()){
					TvrMT.MTF = MTF;
				} else {
					MTF = TvrMT.MTF;
				}

				// update reference to iframe doc
				//TvrUi.stat.iframeDoc = window.frames['viframe'];
				//console.log('iframeDoc updated to local')

				//console.log('the set_vars ran again')

			},

			iframe_loaded: function(){
				MTF = MTWindow.TvrMT.MTF;
				//TvrUi.stat.iframeDoc = window.frames['viframe'];
				//console.log('iframeDoc updated to local again')
			},

			// load url
			init:function(){

				// set window and object vars on super global object
				this.set_vars();

				// ensure local script has defined objects
				MTlocal.set_vars();
				MTlayout.set_vars();
				MTfolder.set_vars();

				// deactivate window if detached mode not active
				if (!MTlayout.preview_is_detached || !MTlayout.preview_is_detached()){
					MTdetached.deactivate_window();
					return false;
				}

				TvrUi.placeholderFrame = true;
				MTlocal.maybe_load_site_preview();

				// apply rulers
				MTlocal.apply_rulers();

				// update the selector suggestions menu reference to point to the detached window
				MTlocal.updateSuggestionsMenuReference();

				// enable slider functionality
				TvrUi.default_to_tab('mq');

				// setup event listeners
				MTlocal.setup_event_listeners(true);

			},


			/*setup_event_listeners: function(){

				// redo rulers on window resize
				MTlocal.add_window_resize_listener(true);

			},*/

			deactivate_window: function(){
				//console.log('Set the inactive window')
				this.stat.front.addClass('window-inactive');

				// remove the iframe as this causes issue with browserify
				this.stat.frontInner.remove();

				//console.log('Set the inactive window', this.stat.frontInner)

				// kill the object MT checks to see if window is active
				MTdetached = false;
				window = false;
			},

			remove_window_inactive_notice: function(){
				//console.log('UnSet the inactive window')
				this.stat.front.removeClass('window-inactive');
			},

			add_html_class: function(clazz){
				this.stat.tvr.addClass(clazz);
			},

			remove_html_class: function(clazz){
				this.stat.tvr.removeClass(clazz);
			},

			// functions for targeting elements

			getLocalSuggestionsMenuEl: function(){
				return MTlocal.getSuggestionsMenuEl();
			},

			getLocalContextMenuEl: function(){
				return MTlocal.getContextMenuEl();
			},

			toggle_context_menu: function(data){
				if (data.$clicked.hasClass('on')){
					MTdetached.close_context_menu();
				} else {
					MTdetached.show_context_menu(data);
				}
			},

			show_context_menu: function(data){
				MTlocal.show_context_menu(data);
			},

			close_context_menu: function(config){
				MTlocal.close_context_menu(config);
			},




		};

		// initialize controls and fonts
		MTdetached.init();

	});
}

else {

	jQuery(document).ready(function($){
		document.getElementById("v-frontend-wrap").classList.add("window-inactive");
	});

}




// JavaScript Document
jQuery(document).ready(function($){

	/***
	MANAGE MICRO THEMES PAGE
	***/

	// copy object reference so we can use same syntax on front/ui
	var TvrMT = window.parent.TvrMT, // give iframe same global TvrMT name space reference
		TvrUi = TvrMT.TvrUi,
		TvrCom = TvrMT.TvrCom,
		tvrsprintf =  TvrMT.tvrsprintf,
		TvrLang = window.parent.TvrLang;

	// make templates available to standalone preferences page.
    TvrUi.templates = TvrMT.data.templates;

	var TvrMan = {
			init:function() {

				// data for combo box
				TvrMT.data.prog.combo.packTypes = [
					TvrLang.theme_skin,
					TvrLang.plugin_skin,
					TvrLang.theme_scaffold,
					TvrLang.plugin_scaffold
				];

				// duplication of code in mt-init.js (fix when refactoring)
				this.jQueryVersion = TvrCom.getJQueryVersion($.fn.jquery);
				this.jQueryUIVersion = TvrCom.getJQueryVersion($.ui.version, true);
				this.autocompleteUsesDivs = (this.jQueryUIVersion >= '01.12.01');
				if (this.autocompleteUsesDivs){
					$('#tvr').addClass('autocompleteUsesDivs');
				} else {
					$('#tvr').addClass('autocompleteNoDivs');
				}

				// if a pack has been installed the main UI pack list needs to be updated
				if (TvrMT && TvrCom.isDomEl($('#update-packs-list'))){
					TvrUi.update_packs_obj($('#update-packs-list').attr('rel'));
				}

				// combobox general settings
				$('input.combobox').on("focus", function() {
					var $this = $(this);
					$this.autocomplete({
						source: TvrMT.data.prog.combo[$this.attr('rel')],
						delay: 0,
						minLength: 0,
						appendTo: $this.parent('.tvr-input-wrap'),
						// the menu is opened
						open: function( event, ui ) {
							$this.next('.combo-arrow').addClass('on');
						},
						// adjust the classes appropriates
						select: function( event, ui ) {

                            $this.val(ui.item.value);

							$this.closest('.tvr-input-wrap').addClass('manual-val')
								.find('.comp-style').addClass('hidden')
								.end().find('.combo-arrow').removeClass('on');

							// css unit set switcher
							if ($this.attr('id') === 'css_unit_set'){
								var val = $this.val();
								$this.closest('ul')
									.find('input.custom_css_unit')
									.val(val);
							}

						},
						// adjust the corner radius of the input for neatness
						search: function( event, ui ) {
							$this.addClass('adjusted-corner-radius');
						},
						close: function( event, ui ) {
							$this.removeClass('adjusted-corner-radius')
								.next('.combo-arrow').removeClass('on');
							//$this.siblings('.ui-menu').mCustomScrollbar("destroy");

						}
					})
				});
				$('span.combo-arrow').on("mousedown", function() {
					if ( $(this).siblings( ".ui-menu" ).is( ":visible" )){
						TvrMan.wasOpen = true;
					}
				});
				$('span.combo-arrow').on("click", function() {
					var $clicked = $(this);
					var $input = $clicked.prev();
					// Close if already visible
					if ( TvrMan.wasOpen ) {
						$clicked.removeClass('on');
						TvrMan.wasOpen = false;
						return;
					} else {
						$clicked.addClass('on');
						// Pass empty string as value to search for, displaying all results
						$input.focus().autocomplete( "search", "" );
					}
				});

				var $manCon = $('#tvr');
				// all encompassing click event
				$manCon.on('click', function(e) {
					var $clicked = $(e.target);
					try {
						cClasses = $clicked.attr('class');
						if (!cClasses) {
							var cClasses = 'tvr-undefined'; // so rogue clicks don't trigger 'undefined' errors
						}
					} catch(err) {}
					// trigger appropriate function
					if (cClasses.indexOf('pack-action') >= 0 ||
						cClasses.indexOf('pack-icon') >= 0 ||
						cClasses.indexOf('action-text') >= 0) {
						var $button = $clicked.closest('.pack-action');
						TvrMan.pack_button_action($button);
					} else if (cClasses.indexOf('delete-pack-multi') >= 0) {
						TvrMan.delete_pack($clicked, 'multi');
					} else if (cClasses.indexOf('download-pack-multi') >= 0) {
						TvrMan.download_pack($clicked, 'multi');
					} else if (cClasses.indexOf('combobox') >= 0) {
						TvrMan.combobox_clicked($clicked);
					} else if (cClasses.indexOf('delete-file') >= 0) {
						TvrMan.delete_file($clicked, e);
					}
					/*else if (cClasses.indexOf('show-dialog') >= 0) {
						TvrMan.show_dialog($clicked);
					} */
					else if (cClasses.indexOf('show-parent-dialog') >= 0) {
						TvrUi.show_dialog($clicked);
						if ($clicked.attr('rel') == 'import-from-pack'){
							TvrUi.set_import_field($clicked.data('pack-name'));
						}
					} else if (cClasses.indexOf('close-dialog') >= 0 || cClasses.indexOf('tvr-dialog') >= 0) {
						TvrMan.close_dialog($clicked);
					} /*else if (cClasses.indexOf('color-img') >= 0) {
						TvrMan.color_img($clicked);
					} */else if (cClasses.indexOf('fake-checkbox') >= 0 || cClasses.indexOf('fake-radio') >= 0) {
						TvrMan.toggle_radio_checkbox($clicked);
					} else if (cClasses.indexOf('upload-pack') >= 0) {
						if (!$('#upload_pack_input').val()) {
							alert(TvrLang.select_zip);
							e.preventDefault();
						}
					} else if (
						cClasses.indexOf('dialog-tab') >= 0
						&& cClasses.indexOf('dialog-tabs') < 0
						&& cClasses.indexOf('dialog-tab-field') < 0
					) {
						TvrMan.dialog_tab_pressed($clicked);
					} else if (cClasses.indexOf('reveal-hidden-form-opts') >= 0) {
						TvrMan.reveal_form_opts($clicked);
					} else if (cClasses.indexOf('save-preferences') >= 0) {
						TvrMan.save_preferences($clicked);
					}
				});

				// colorbox display image file
				//$("a[rel='bg-image']", $manCon).colorbox();
			},
			escape_backslashes: function(raw, serialised){
				if (serialised){
					return raw.replace(/%5C/g, '%26%2392%3B')
				} else {
					return raw.replace(/\\/g, '&#92;')
				}
			},
			// Preferences are saved. Needs to be submitted via ajax because backslashes can't be escaped without
			// modifying them before posting the data. WP Bug as far as I can tell.
			save_preferences: function($clicked) {

                var action = 'Preferences save',
                    ajaxUrl = $("#ajaxUrl").attr('rel'),
                    returnUrl = $("#returnUrl").attr('rel'),
					inProg = TvrLang.saving_preferences,
					sendType = 'POST',
					sendData = TvrMan.escape_backslashes($('#tvr-preferences').serialize(), true);

                //console.log('ajax sending', action, ajaxUrl, returnUrl, inProg, sendType, sendData, $clicked);
                //return false;
				TvrMan.general_ajax_submission(action, ajaxUrl, returnUrl, inProg, sendType, sendData, $clicked);
			},
			// general ajax submission (e.g. import, reset, clear, restore)
			general_ajax_submission: function(action, ajaxUrl, returnUrl, inProg, sendType, sendData, $clicked){

				// show loader
				/*$clicked.after($(TvrUi.templates.loaders.default))
					.clone()
					.removeAttr('id')
					.attr('title', TvrLang.saving_preferences);*/

				// ajax post
				$.ajax({
					type: sendType,
					url: ajaxUrl,
					data: sendData,
					timeout: TvrUi.tOut, // 20 seconds
					error: function (x, e) {
						$('img.ajax-loader').remove();
						alert(TvrMan.handle_ajax_error(x,e));
					},
					success: function (data) {
						window.location = returnUrl; // cached error/success msg will be displayed on page reload
					}
				});
			},

			reveal_form_opts: function($clicked) {
				var relClass = $clicked.attr('rel');
				$clicked.closest('li').siblings('.hidden.'+relClass).addClass('show');
			},
			// dialog tab pressed
			dialog_tab_pressed: function($clicked) {
				var $fields = $clicked.closest('.dialog-main');
				var field = '.dialog-tab-field';
				var $tabs = $fields.find('.dialog-tabs');
				var tabKey = $clicked.attr('rel');
				var tab = '.dialog-tab';
				var input = '.dummy-for-now';

				//console.log('tab clicked', $fields, field, $tabs, tabKey, tab, input);

				TvrMan.update_tab($fields, field, $tabs, tabKey, tab, input); // skip the fields
			},

			/*** css tab/mq tab/property group icon is clicked ***/
			update_tab: function($fields, field, $tabs, tabKey, tab, input, skipFields) {
				// update tab classes and focus input
				$tabs.find(tab).removeClass('active')
					.end().find(tab+'-'+tabKey).addClass('active')

					// this is just for dialog tabs currently (e.g. CSS import)
					.end().find(input).val(tabKey);

				// update which fields should show
				if ( !skipFields ){
					$fields.find(field+'.show').removeClass('show')
						.end().find(field+'-'+tabKey).addClass('show');
				}
			},
			/*color_img: function($clicked){
				$.colorbox({
					maxWidth:'97%',
					maxHeight:'90%',
					href: $clicked.attr('src'),
					open:true
				});
			},*/
			combobox_clicked: function($clicked) {
				$clicked.autocomplete( "search", "" ).next('.combo-arrow').addClass('on')
			},
			/*** an action button has been clicked ***/
			pack_button_action: function($button) {
				var rel = $button.attr('rel');
				if (rel == 'info' || rel == 'attachments' || rel == 'instructions'){
					var $buttons = $('#main-theme-actions').find('.pack-action').removeClass('on');
					var $areas = $('#single-content-areas').find('.manage-content-wrap').removeClass('show');
					$('#main-theme-actions').find('li.pack-action-'+rel).addClass('on');
					$('#edit-'+rel).addClass('show');
				} else if (rel == 'download') {
					TvrMan.download_pack($button, 'single');
				} else if (rel == 'delete') {
					TvrMan.delete_pack($button, 'single');
				}
			},
			/*** download pack ***/
			download_pack: function($button, con) {
				var zipFolder = $('#zip-folder').attr('rel');
				var dirName = $button.attr('data-dir-name');
				var downloadUrl = zipFolder+dirName+'.zip';
				/*if (con == 'single'){
					$button.after( $(TvrUi.templates.loaders.wbg).attr('id', 'loading-gif-active') );
				} else {
					$button.before( $(TvrUi.templates.loaders.wbg).attr('id', 'loading-gif-active') );
				}*/

				var url = $('#ajaxUrl').attr('rel') + '&mt_action=tvr_download_pack&dir_name='+dirName;
				// ajax send request
				$.ajax({
					type: "GET",
					url: url,
					async: true,
					timeout:20000, // 20 seconds
					error:function(x,e){
						var $logItem = $(TvrUi.templates.log_item).removeAttr('id');
						$logItem
							.find('.short').text('Download failed')
							.end()
							.find('.long').html('<p>'+TvrUi.appName+' '+TvrLang.download_failed+'</p>'
								+'<p>'+TvrMan.handle_ajax_error(x,e)+'</p>');
						$('#full-logs').html('<ul class="logs"></ul>').find('ul').append($logItem).focus();
					},
					success: function(data){
						var $notice = $(data).find('#microthemer-notice');
						//console.log($notice.html())
						var downloadStatus = $(data).find('#download-status').attr('rel');
						// if successful zip creation, download file
						// http://stackoverflow.com/questions/1066452/easiest-way-to-open-a-download-window-without-navigating-away-from-the-page
						if (downloadStatus === '1'){
							location.href = downloadUrl;
						}
						// else show problem
						else {
							$('#full-logs').html($notice.html()).focus();
						}
					},
					complete: function() {
						$('#loading-gif-active').remove();
					}
				});

			},
			/*** delete pack ***/
			delete_pack: function($button, con) {
				var r=confirm(TvrLang.delete_pack_confirm);
				if (!r) {
					return false;
				} else {
					/*if (con == 'single'){
						$button.after( $(TvrUi.templates.loaders.wbg)
							.attr('id', 'loading-gif-active') );
					} else {
						$button.before( $(TvrUi.templates.loaders.wbg)
							.attr('id', 'loading-gif-active') );
					}*/
					var dirName = $button.attr('data-dir-name');
					var dirLabel = $button.attr('data-dir-label');
					var url = $('#ajaxUrl').attr('rel') + '&mt_action=tvr_delete_micro_theme&dir_name='+dirName;
					var successUrl = $('#delete-ok').attr('rel');
					// ajax send request
					$.ajax({
						type: "GET",
						url: url,
						async: true,
						timeout:20000, // 20 seconds
						error:function(x,e){
							var $logItem = $(TvrUi.templates.log_item).removeAttr('id');
							$logItem
								.find('.short').text('Delete failed')
								.end()
								.find('.long').html('<p>'+TvrUi.appName+' '+TvrLang.delete_pack_failed+'</p>'
									+'<p>'+TvrMan.handle_ajax_error(x,e)+'</p>');
							$('#full-logs').html('<ul class="logs"></ul>').find('ul').append($logItem).focus();
							$('#loading-gif-active').remove();
						},
						success: function(data){
							var $notice = $(data).find('#microthemer-notice');
							var deleteStatus = $(data).find('#delete-status').attr('rel');
							// if successful delete, go to main manage page with message
							if (deleteStatus === '1'){

								// remove it from the directory array
								var index = TvrMT.data.prog.combo.directories.indexOf(dirLabel);
								//console.log('index, lavel', index, dirLabel)
								if (index !== -1) {
									TvrMT.data.prog.combo.directories.splice(index, 1);
								}

								if (con == 'single'){
									window.location = successUrl;
								}
								// multiple view
								else {
									$('#loading-gif-active').remove();
									$button.closest('li').fadeOut('slow');
									// remove the last modified link if the pack in focus was deleted
									var $lastM = $('li.last-modified');
									if ( $lastM.attr('rel') == dirName){
										$lastM.remove();
									}
								}
							}
							// else show problem
							else {
								$('#full-logs').html($notice.html()).focus();
							}
						},
						complete: function() {

						}
					});
				}
			},
			handle_ajax_error: function(x,e) {
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
					return TvrLang.error_unknown+'\n'+x.responseText;
				}
			},

			/*** warn exporting a zip if external images are referenced ***/
			export_zip_button: function($clicked, e) {
				// check if the name is different from before
				if ($('span#external-notice').text() == 'warn') {
					var r=confirm(TvrLang.external_notice);
					if (!r) { e.preventDefault(); }
				}
			},
			/*** warn against deleting a file ***/
			delete_file: function($clicked, e) {
				var r=confirm(TvrLang.delete_file_confirm);
				if (r) {
					window.location = $clicked.attr('data-href');
				}
			},
			show_dialog: function($clicked){
				// close any previously open dialogs (sometimes users may navigate from one dialog to the next)
				TvrMan.close_dialog();
				/*var dialog = $clicked.attr('rel');
				if (dialog == 'not-yet'){
					return false;
				}
				var ext = $clicked.attr('data-ext');
				var url = $clicked.attr('data-href') + '?nomtcache='+new Date().getTime();
				// if pack file
				if (dialog == 'view-pack-file'){
					if (ext == 'image'){
						$.colorbox({
							maxWidth:'97%',
							maxHeight:'90%',
							href: url,
							open:true
						});
					} else {
						var canOpen = ['txt', 'json', 'css', 'html'];
						if (jQuery.inArray(ext, canOpen) < 0){
							alert(TvrLang.view_pack_failed)
						} else {
							TvrMan.ajax_load_pack_file($clicked, url);
						}

					}
				}*/
			},
			// close any dialog
			close_dialog: function(){
				$( '#tvr').find('div.tvr-dialog').removeClass('show'); // this closes them all
			},
			/*** toggle radio/checkbox ***/
			toggle_radio_checkbox: function($c) {
				// if it's a multi check/uncheck
				// regular checkbox/radio
				var $i = $c.prev();
				// uncheck if already checked
				if ($i.is(':checked')){
					// regular radios don't get unchecked when clicked
					if ($c.hasClass('fake-radio')){
						return false;
					}
					$i.prop('checked', false);
					$c.removeClass('on')
				} else {
					// if it's a radio, other radios in group need to be unchecked
					if ($c.hasClass('fake-radio')){
						$c.closest('.fake-radio-parent').find('input[type="radio"]').prop('checked', false)
							.end().find('.fake-radio').removeClass('on');
					}
					// check the current radio
					$i.prop('checked', true);
					$c.addClass('on');
				}
			},
			// load pack file
			/*ajax_load_pack_file: function($clicked, url) {
				var baseName = $clicked.attr('data-base-name');
				$clicked.after( $(TvrUi.templates.loaders.mgbg)
					.attr('id', 'loading-gif-active') );
				// ajax get data
				$.ajax({
					type: "GET",
					url: url,
					async: false,
					dataType: "text",
					timeout:20000, // 20 seconds
					error:function(x,e){
						var $logItem = $(TvrUi.templates.log_item).removeAttr('id');
						$logItem
							.find('.short').text(TvrLang.delete_failed)
							.end()
							.find('.long').html('<p>'+ TvrLang.unable_load +url+'</p>'
								+'<p>'+TvrMan.handle_ajax_error(x,e)+'</p>');
						$('#full-logs').html('<ul class="logs"></ul>').find('ul').append($logItem).focus();

					},
					success: function(data){
						var el = '#pack-file-content';
						$(el).html(data);
						$.colorbox({

							width:'80%',
							height:'80%',
							html: $(el).clone().attr('id', 'pack-file-content-active'),
							//href: el,
							//inline:true,
							onClosed: function() {
								// $.colorbox.remove();
							},
							open:true
						});
					},
					complete: function() {
						$('#loading-gif-active').remove();
					}
				});
			}*/
		};

	// initialise the TvrMan object
	TvrMan.init();


	/***
	PREFERENCES PAGE
	***/

	var TvrPref = {
			init:function() {
				var $prefCon = $('#tvr-preferences');

				// all encompassing click event
				$prefCon.on('click', function(e) {
					var $clicked = $(e.target);
					try {
						cClasses = $clicked.attr('class');
						if (!cClasses) {
							var cClasses = 'tvr-undefined'; // so rougue clicks don't trigger 'undefined' errors
						}
					} catch(err) {}
					// trigger appropriate function

				});

			}

		};

	// initialise the TvrMan object
	TvrPref.init();


	/***
	 DOCS PAGE
	 ***/

	var TvrDocs = {
		init:function() {
			var $docsCon = $('#tvr-docs');

			// all encompassing click event
			$docsCon.on('click', function(e) {
				var $clicked = $(e.target);
				try {
					cClasses = $clicked.attr('class');
					if (!cClasses) {
						var cClasses = 'tvr-undefined'; // so rougue clicks don't trigger 'undefined' errors
					}
				} catch(err) {}
				// trigger appropriate function
				if (cClasses.indexOf('css-group-heading') >= 0 ||
					cClasses.indexOf('accordion-menu-arrow') >= 0 ||
					cClasses.indexOf('pg-icon') >= 0 ||
					cClasses.indexOf('text-for-group') >= 0) {
					$clicked = $clicked.closest('.css-group-heading');
					TvrDocs.update_accordion($clicked, $('#tvr-docs'));
				}

			});

		},
		// update accordion
		update_accordion: function($clicked, $acc_wrapper) {
			var $allPanels = $acc_wrapper.find('li.accordion-item');
			var $parent = $clicked.parent();
			// if they click the currently open content, do nothing after sliding all up
			if ( $parent.hasClass('show-content') ) {
				var keepShut = true;
			}
			$acc_wrapper.find('.accordion-menu-arrow.on').removeClass('on');
			$acc_wrapper.find('.show-content').removeClass('show-content')
			/*$allPanels.slideUp(function() {


			});*/
			if (keepShut) {
				return false;
			}
			else {
				$parent.find('.accordion-menu-arrow').addClass('on');
				$parent.addClass('show-content')
				/*$clicked.siblings('li.accordion-item').slideDown(function() {


				});*/
				return false;
			}
		}

	};

	// initialise the TvrMan object
	TvrDocs.init();

});


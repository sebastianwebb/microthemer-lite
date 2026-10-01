/*!
	autosize 4.0.1
	license: MIT
	http://www.jacklmoore.com/autosize

	Basty note:
	Fonts with subsets e.g. Alef with Hebrew don't display correctly on div with contenteditable=true.
	A textarea must be used instead, which needs auto-sizing (for font-size increase)
*/
!function(e,t){if("function"==typeof define&&define.amd)define(["module","exports"],t);else if("undefined"!=typeof exports)t(module,exports);else{var n={exports:{}};t(n,n.exports),e.MTautosize=n.exports}}(this,function(e,t){"use strict";var n,o,p="function"==typeof Map?new Map:(n=[],o=[],{has:function(e){return-1<n.indexOf(e)},get:function(e){return o[n.indexOf(e)]},set:function(e,t){-1===n.indexOf(e)&&(n.push(e),o.push(t))},delete:function(e){var t=n.indexOf(e);-1<t&&(n.splice(t,1),o.splice(t,1))}}),c=function(e){return new Event(e,{bubbles:!0})};try{new Event("test")}catch(e){c=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}function r(r){if(r&&r.nodeName&&"TEXTAREA"===r.nodeName&&!p.has(r)){var e,n=null,o=null,i=null,d=function(){r.clientWidth!==o&&a()},l=function(t){window.removeEventListener("resize",d,!1),r.removeEventListener("input",a,!1),r.removeEventListener("keyup",a,!1),r.removeEventListener("autosize:destroy",l,!1),r.removeEventListener("autosize:update",a,!1),Object.keys(t).forEach(function(e){r.style[e]=t[e]}),p.delete(r)}.bind(r,{height:r.style.height,resize:r.style.resize,overflowY:r.style.overflowY,overflowX:r.style.overflowX,wordWrap:r.style.wordWrap});r.addEventListener("autosize:destroy",l,!1),"onpropertychange"in r&&"oninput"in r&&r.addEventListener("keyup",a,!1),window.addEventListener("resize",d,!1),r.addEventListener("input",a,!1),r.addEventListener("autosize:update",a,!1),r.style.overflowX="hidden",r.style.wordWrap="break-word",p.set(r,{destroy:l,update:a}),"vertical"===(e=window.getComputedStyle(r,null)).resize?r.style.resize="none":"both"===e.resize&&(r.style.resize="horizontal"),n="content-box"===e.boxSizing?-(parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)):parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth),isNaN(n)&&(n=0),a()}function s(e){var t=r.style.width;r.style.width="0px",r.offsetWidth,r.style.width=t,r.style.overflowY=e}function u(){if(0!==r.scrollHeight){var e=function(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}(r),t=document.documentElement&&document.documentElement.scrollTop;r.style.height="",r.style.height=r.scrollHeight+n+"px",o=r.clientWidth,e.forEach(function(e){e.node.scrollTop=e.scrollTop}),t&&(document.documentElement.scrollTop=t)}}function a(){u();var e=Math.round(parseFloat(r.style.height)),t=window.getComputedStyle(r,null),n="content-box"===t.boxSizing?Math.round(parseFloat(t.height)):r.offsetHeight;if(n!==e?"hidden"===t.overflowY&&(s("scroll"),u(),n="content-box"===t.boxSizing?Math.round(parseFloat(window.getComputedStyle(r,null).height)):r.offsetHeight):"hidden"!==t.overflowY&&(s("hidden"),u(),n="content-box"===t.boxSizing?Math.round(parseFloat(window.getComputedStyle(r,null).height)):r.offsetHeight),i!==n){i=n;var o=c("autosize:resized");try{r.dispatchEvent(o)}catch(e){}}}}function i(e){var t=p.get(e);t&&t.destroy()}function d(e){var t=p.get(e);t&&t.update()}var l=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?((l=function(e){return e}).destroy=function(e){return e},l.update=function(e){return e}):((l=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return r(e)}),e}).destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],i),e},l.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],d),e}),t.default=l,e.exports=t.default});

var MTWindow = false;
if (window.top.TvrMT){
    MTWindow = window.top;
} else if (window.parent.TvrMT){
    MTWindow = window.parent;
} else if (window.parent.parent && window.parent.parent.TvrMT){
    MTWindow = window.parent.parent
}

// JavaScript Document
jQuery(document).ready(function($){

    // copy object references so we can use same syntax as elsewhere
    var TvrMT = MTWindow.TvrMT,
        TvrUi = TvrMT.TvrUi,
        TvrCom = TvrMT.TvrCom,
        tvrsprintf =  TvrMT.tvrsprintf,
        TvrLang = MTWindow.TvrLang,
        MTsave = TvrMT.mod.MTsave;

    var defaultFilters = {
        query: '',
        category: {
            serif: 1,
            'sans-serif': 1,
            display: 1,
            handwriting: 1,
            monospace: 1
        },
        sort: 'popularity',
        subset: ''
    },

    defaultAdjustments = {
        preview_text: 'sentence',
        custom_text: '',
        font_size: '',
        variant: 'regular'
    };

    // font management object
	var TvrFonts = {

            // store all fonts returned by last API call
	        allFonts: {},

            // filtered fonts is a subset of all fonts based on user filter settings
            filteredFonts: [],

            // default Google fonts config
            google: {

	            // base URL for connecting to Google
                url: 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBY_w3-Yj6T54CQP5RNZrruBHEvwenEOmU',

                filters: $.extend(true, {}, defaultFilters),

                adjustments: $.extend(true, {}, defaultAdjustments),

                pagination:{
                    results_per_page: 6,
                    current_page: 1,
                    index: 0,
                    total_pages: 0,
                    total_fonts: 0
                }
            },

            // default typekit config (for future)
            typekit: {

            },

            preview_text: {
                sentence: {
                    text: 'Grumpy wizards make toxic brew for the evil Queen and Jack.',
                    font_size: 32,
                    line_height: 1.1
                },
                paragraph: {
                    text: 'As the minuteness of the parts formed a great hindrance to my speed, I resolved, contrary to my first intention, to make the being of a gigantic stature; that is to say, about eight feet in height, and proportionably large. ',
                    font_size: 18,
                    line_height: 1.44
                },
                alphabet: {
                    text: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz ‘?’“!”(%)[#]{@}/&\\<-+÷×=>®©$€£¥¢:;,.*',
                    font_size: 24,
                    line_height: 1.33
                },
                numerals: {
                    text: '1234567890',
                    font_size: 58,
                    line_height: 1.1
                },
                custom: {
                    text: '',
                    font_size: 24,
                    line_height: 1.33
                }
            },

            // get settings and update controls / fonts
            init:function(){

                this.get_font_settings();

	            this.bind_events();

                this.update_filters();

                this.fetch_fonts();
            },

            // Events
            bind_events: function(){

                $("#tvr-fonts").on("change", "select", function(e) {
                    TvrFonts.route_event(e, $(this));
                })
                .on("input propertychange", "input, textarea", function(e) {
                    TvrFonts.route_event(e, $(this));
                })
                .on("blur", "textarea", function(e) {
                    TvrFonts.route_event(e, $(this));
                })
                .on("click", function(e) {
                    TvrFonts.route_event(e, $(this));
                });
            },

            // route user event to appropriate function
            route_event:function(e, $el){

                switch(e.type) {

                    // click event
                    case 'click':

                        var $clicked = $(e.target),
                            action = $clicked.data('action');

                        switch(action) {
                            case 'pagination':
                                TvrFonts.change_pagination($clicked);
                                break;
                            case 'toggle-category':
                                TvrCom.toggle_radio_checkbox($clicked);
                                TvrFonts.filter_changed($clicked.prev(), 'category');
                                break;
                            case 'clear_filters':
                                this.clear_filters($clicked);
                                break;
                            case 'apply_to_all':
                                this.apply_to_all($clicked);
                                break;
                            case 'insert-font':
                                this.insert_font($clicked);
                                break;
                            case 'show-textarea':
                                this.show_textarea($clicked);
                                break;
                        }

                        break;

                    // form field events
                    case 'blur':
                    case 'focusout':
                    case 'change':
                    case 'input':
                    case 'propertychange':

                        var $formField = $el,
                            name = $formField.attr('name');

                        switch(name) {
                            case 'preview_text':
                            case 'variant':
                            case 'font_size':
                                TvrFonts.font_adjusted($formField, name);
                                break;
                            case 'current_page':
                                TvrFonts.change_pagination($formField);
                                break;
                            case 'query':
                            case 'sort':
                            case 'subset':
                                TvrFonts.filter_changed($formField, name);
                                break;
                            case 'font_textarea':
                                if (e.type === 'blur' || e.type === 'focusout'){
                                    this.hide_textarea($formField);
                                } else {
                                    TvrFonts.font_adjusted($formField, name);
                                }
                                break;
                        }

                        break;

                }
            },

            // Get fonts api filters and pagination info from user preferences
            get_font_settings:function(){
                if (TvrUi.pref && TvrUi.pref.font_config.google){
                    this.google = TvrUi.pref.font_config.google;
                }
            },

            // Save current filters / adjustments / page to MT preferences
            save_font_settings:function(){

                if (TvrUi.pref){

                    // url has correct extension, try to download, success will call next part of function
                    MTsave.simple_ajax_request({
                        url: TvrUi.ajaxUrl+'&save_font_config=google',
                        type: 'POST',
                        sendData: MTsave.serialized_data_with_single_key(JSON.stringify(this.google)),
                        plus: '',
                        minus: ''
                    });
                }
            },

            // filter controls to match settings
            update_filters: function(){

                var filters = TvrFonts.google.filters;

                // set search
                $('#query-filter').find('input').val(filters.query);

                // set categories
                $('#category-filter').find('.fake-checkbox').each(function(index){

                    var $display_checkbox = $(this),
                        $actual_checkbox = $display_checkbox.prev(),
                        category = $actual_checkbox.data('category');

                    if (filters.category[category]){
                        TvrCom.check_fake($display_checkbox);
                    } else {
                        TvrCom.uncheck_fake($display_checkbox);
                    }

                });

                // set sorting / language preference
                var dropdowns = ['sort', 'subset'];

                for (var i = 0; i < dropdowns.length; i++) {
                    var name = dropdowns[i];
                    this.set_select_element($('#'+name+'-filter'), filters[name]);
                }

            },

            // set a select element to a given value
            set_select_element: function($parent, value){

                var $select = $parent.find('select');
                $select = TvrCom.isDomEl($select) ? $select : $parent;

                $select.find('option')
                    .filter(':selected').prop('selected', false)
                    .end()
                    .filter('[value="'+value+'"]')
                        .prop('selected', true)
                        .attr('selected', 'selected'); // needed for cloning plain HTML

                return $select;
            },

            // connect to Google fonts API and update displaying fonts / link href
            fetch_fonts: function(){

                // get fonts
                $.ajax({
                    type: "GET",
                    url: TvrFonts.google.url,
                    data: TvrFonts.resolve_api_data(TvrFonts.google.filters),
                    dataType: 'jsonp',
                    async: true,
                    timeout: TvrUi.tOut,
                    error:function(x,e){
                        TvrFonts.handle_ajax_error(x,e);
                    },
                    success: function(allFonts){

                        TvrFonts.allFonts = allFonts;

                        // filter based on user preferences
                        TvrFonts.filter_fonts();

                        TvrFonts.load_first_page();

                    }
                });
            },

            show_clear_filters: function(){
                $('#clear-filters').addClass('show');
            },

            hide_clear_filters: function(){
                $('#clear-filters').removeClass('show');
            },

            // clear all filters
            clear_filters: function(){

                // if the sort order isn't already 'popularity', we need a new api request
                var fetch = this.google.filters.sort !== 'popularity';

                // reset to default
                this.google.filters = $.extend(true, {}, defaultFilters);

                // fetch fonts again with default popularity sort order
                if (fetch){
                    this.fetch_fonts();
                }

                // not sure if this should also clear adjustments like switching to numbers
                // this.google.adjustments = $.extend(true, {}, defaultAdjustments );

                // update the form controls
                this.update_filters();

                // update filteredFonts
                this.filter_fonts();

                // load fonts, starting from first page
                this.load_first_page();
            },

            show_apply_to_all: function($fontEntry){
                $fontEntry.find('.apply-to-all').addClass('show');
            },

            apply_to_all: function($clicked){

                var adjustments = this.google.adjustments,
                    $fontEntry = $clicked.closest('li'),
                    variant = $fontEntry.find('select[name=variant]').val(),
                    itemNumber = $fontEntry.data('item-number');

                adjustments.preview_text = $fontEntry.find('select[name=preview_text]').val();
                adjustments.font_size = $fontEntry.find('input[name=font_size]').val();
                adjustments.custom_text = adjustments.preview_text === 'custom'
                    ? $fontEntry.find('textarea.font').val()
                    : '';

                this.update_display_fonts();

                // ensure current variant isn't wiped out by 'apply to all' action
                $fontEntry = $('#gf-output').find('li[data-item-number='+itemNumber+']');
                var $variantSelect = $fontEntry.find('select[name=variant]');
                this.set_select_element($variantSelect, variant);
                TvrFonts.font_adjusted($variantSelect, 'variant');

                /*// alternative way to update all the fonts - maybe implement later
                $('#gf-output').find('li').each(function(i){
                    var $fontEntry = $(this);
                });*/

            },

            // get the caret position of a div with contenteditable
            getCaretPosition: function(editableDiv) {
                var caretPos = 0,
                    sel, range;
                if (window.getSelection) {
                    sel = window.getSelection();
                    if (sel.rangeCount) {
                        range = sel.getRangeAt(0);
                        if (range.commonAncestorContainer.parentNode == editableDiv) {
                            caretPos = range.endOffset;
                        }
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                    if (range.parentElement() == editableDiv) {
                        var tempEl = document.createElement("span");
                        editableDiv.insertBefore(tempEl, editableDiv.firstChild);
                        var tempRange = range.duplicate();
                        tempRange.moveToElementText(tempEl);
                        tempRange.setEndPoint("EndToEnd", range);
                        caretPos = tempRange.text.length;
                    }
                }
                return caretPos;
            },

            setSelectionRange: function(input, selectionStart, selectionEnd) {
                if (input.setSelectionRange) {
                    input.focus();
                    input.setSelectionRange(selectionStart, selectionEnd);
                }
                else if (input.createTextRange) {
                    var range = input.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', selectionEnd);
                    range.moveStart('character', selectionStart);
                    range.select();
                }
            },

            setCaretToPos:function (input, pos) {
                this.setSelectionRange(input, pos, pos);
            },

            // switch from div to textarea
            show_textarea: function($font){

                var $fontEntry = $font.closest('li'),
                    caretPos = this.getCaretPosition($font[0]),
                    $textarea = $fontEntry.find('textarea');

                // textarea must be visible before sizing
                $fontEntry.addClass('show-textarea');
                MTautosize.update($textarea);

                // match carent position where user clicked div text
                this.setCaretToPos($textarea[0], caretPos);
            },

            // return to div
            hide_textarea: function($formField){
                $formField.closest('li').removeClass('show-textarea');
            },

            // general function for handling 3 font adjustment controls (text, variant, size) and user text edit
            font_adjusted: function($input, name){

                var adjustments = this.google.adjustments,
                    filters = this.google.filters,
                    value = $input.val(),
                    $fontEntry = $input.closest('li'),
                    $font = $fontEntry.find('.font');

                switch(name) {

                    // Preview text dropdown - update font text and set appropriate font-size
                    case 'preview_text':

                        var preview = this.preview_text[value],
                            preview_text = this.get_preview_text(preview, adjustments, value);

                        $font
                            .text(preview_text)
                            .val(preview_text)
                            .css({
                                'font-size': preview.font_size+'px',
                                'line-height': preview.line_height
                            });

                        // update input to reflect new font-size
                        $fontEntry.find('.font_size-adjustment').find('input').val(preview.font_size);

                        break;

                    // Custom edit in font preview textarea
                    case 'font_textarea':

                        // set select menu to custom
                        this.set_select_element($fontEntry.find('.preview_text-adjustment').find('select'), 'custom');

                        // sync with div
                        $font.filter('div').text(value);

                        break;

                    // apply variant
                    case 'variant':

                        var pattern = /^(\d+)?\s?([a-z]+)?$/,
                            matches = value.match(pattern),
                            weight = matches && matches[1] ? matches[1] : 'normal',
                            style =  matches && matches[2] ? matches[2] : 'normal';

                        $font.css({
                            'font-weight': weight,
                            'font-style': style
                        });

                        return true;
                        break;

                    // update font-size
                    case 'font_size':
                        $font.css('font-size', value+'px');
                        break;
                }

                // resize textarea after font/text preview input updated
                if (name !== 'font_textarea'){
                    MTautosize.update($font.filter('textarea'));
                }

                this.show_apply_to_all($fontEntry);
            },

            // update the filteredFonts JS object following filter change
            filter_fonts: function(){

                var filters = this.google.filters,
                    allFonts = this.allFonts.items,
                    filteredFonts = [],
                    catObj = filters.category,
                    catArr = [],
                    search = filters.query.trim().toLowerCase();

                //console.log('All the fonts', allFonts);

                // convert categories object to array for comparisons
                for (var cat in catObj){
                    if ( !catObj.hasOwnProperty(cat) ) continue;
                    if (catObj[cat]){
                        catArr.push(cat);
                    }
                }

                // loop full list of fonts, copying references to fonts that match filter criteria
                for (var i = 0; i < allFonts.length; i++) {

                    var font = allFonts[i],
                        family = font.family.toLowerCase();

                    if (
                        (filters.query && family.indexOf(search) < 0) ||
                        (catArr.length < 5 && !TvrCom.in_array(font.category, catArr)) ||
                        (filters.subset && !TvrCom.in_array(filters.subset, font.subsets))
                    ){
                        continue;
                    }

                    filteredFonts.push(font);
                }

                // show/hide clear filters option
                if (allFonts.length === filteredFonts.length && filters.sort === 'popularity'){
                    this.hide_clear_filters();
                } else {
                    this.show_clear_filters();
                }

                this.filteredFonts = filteredFonts;
            },

            // general function for handling filter controls
            filter_changed: function($input, name){

                var filters = this.google.filters,
                    value = $input.val(),
                    $filter = $input.closest('.font-filter');

                // simple value update for most filters
                if (name !== 'category'){
                    filters[name] = value;
                }

                switch(name) {

                    // sort requires new API request
                    case 'sort':
                        this.fetch_fonts();
                        return true;
                        break;

                    // category - get checkbox config
                    case 'category':
                        var categories = filters[name];
                        $filter.find('input[type=checkbox]').each(function(i){
                            var $checkbox = $(this),
                                cat = $checkbox.attr('name').match(/\[(.+)\]/)[1];
                            categories[cat] = $checkbox.is(':checked');
                        });
                        break;
                }

                // run filter against new settings
                this.filter_fonts();

                // load new fonts, starting from first page
                this.load_first_page();
            },
        

            // pagination arrow clicked or input field changed
            change_pagination: function($el){

                //console.log('start change_pagination');

                var pagination = TvrFonts.google.pagination,
                    value = $el.data('value'),
                    curPage = $('#current-font-page').val(),
                    newPage;

                // if curPage is empty, default to 1
                curPage = curPage ? parseInt(curPage) : 1;

                switch(value) {
                    case 'first':
                        newPage = 1;
                        break;
                    case 'prev':
                        newPage = curPage - 1;
                        break;
                    case 'manual':
                        newPage = curPage;
                        break;
                    case 'next':
                        newPage = curPage + 1;
                        break;
                    case 'last':
                        newPage = pagination.total_pages;
                        break;
                }

                // ensure page number is within valid range
                if (!newPage || newPage < 1){
                    newPage = 1;
                } else if (newPage > pagination.total_pages && pagination.total_pages > 0){
                    newPage = pagination.total_pages;
                }

                // set new page
                pagination.current_page = newPage;
                pagination.index = (newPage - 1) * pagination.results_per_page;

                //console.log('change_pagination', newPage, $.extend(true, {}, pagination));


                // update the pagination
                TvrFonts.update_pagination();

                // update the fonts displaying
                TvrFonts.update_display_fonts();
            },

            // update pagination info and controls
            update_pagination: function(){

                //console.log('start update_pagination');

                var $filters = $('#controls'),
                    $pag = $('#pagination'),
                    pagination = TvrFonts.google.pagination;

                    pagination.total_fonts = this.filteredFonts.length;
                    pagination.total_pages = Math.ceil(pagination.total_fonts/pagination.results_per_page);

                $filters.find('.font-count').text(pagination.total_fonts);

                $pag.find('.page-total').text(pagination.total_pages);

                // update editable current page field, if not in focus (set by user)
                var $current_page = $('#current-font-page');
                if (!$current_page.is(':focus')){
                    $current_page.val(pagination.current_page);
                }

                // disable arrows that won't have an effect
                $pag.find('.control-disabled').removeClass('control-disabled');
                if (pagination.current_page <= 1){
                    $pag.find('.first-page, .prev-page').addClass('control-disabled');
                } else if (pagination.current_page >= pagination.total_pages){
                    $pag.find('.gf-next-page, .gf-last-page').addClass('control-disabled');
                }

                //console.log('updated pagination', $pag.find('.gf-next-page, .gf-last-page'))

            },
        
            // load first page of results e.g. after filter change
            load_first_page: function(){

                var $manualPageInput = $('#current-font-page');

                $manualPageInput.val(1);

                this.change_pagination($manualPageInput);
            },

            // get preview text
            get_preview_text: function(preview, adjustments, value){
                return value === 'custom'
                    ? adjustments.custom_text
                    : preview.text;
            },

            // clear all filters
            update_display_fonts: function(){

                var $styleNode = $('#google-fonts'),
                    api_url = '//fonts.googleapis.com/css?family=',
                    api_family_param = [],

                    pagination = TvrFonts.google.pagination,
                    adjustments = TvrFonts.google.adjustments,
                    filters = TvrFonts.google.filters,

                    start = pagination.index,
                    end = pagination.index + pagination.results_per_page,

                    preview = this.preview_text[adjustments.preview_text],
                    preview_text = this.get_preview_text(preview, adjustments, adjustments.preview_text),
                    preview_font_size = adjustments.font_size ? adjustments.font_size : preview.font_size,
                    displayFonts = this.filteredFonts.slice(start, end),
                    $list = $('<ul>'),
                    $liTemplate = $('#font-entry-template').find('li').clone();

                //console.log('display', displayFonts, start, end, this.filteredFonts);

                // common for all fonts - preview text & font size
                $liTemplate.find('.font').text(preview_text).val(preview_text).css({
                        'font-size':preview_font_size+'px',
                        'line-height': preview.line_height
                    })
                    .end()
                    .find('.font_size-adjustment').find('input').val(preview_font_size);

                // set default preview text
                this.set_select_element($liTemplate.find('.preview_text-adjustment'), adjustments.preview_text);

                // todo get subset with API call

                // loop fonts
                for (var i = 0; i < displayFonts.length; i++) {

                    var font = displayFonts[i],
                        $li = $liTemplate.clone(true, true),
                        $variantSelect = $li.find('.variant-adjustment').find('select'),
                        variants = font.variants,
                        variantOptions = '';

                    // format variants
                    for (var j = 0; j < variants.length; j++) {

                        var value = variants[j].replace(/italic/g, ' italic'),
                            displayValue = value,
                            selected = value === 'regular' ? 'selected="selected"' : '';

                        value = value.replace('regular', '400');

                        variantOptions+= '<option value="'+value+'"' +selected+'>'+displayValue+'</option>';
                    }
                    $variantSelect.html(variantOptions);

                    // disable variant dropdown if only regular
                    if (variants.length <= 1){
                        $variantSelect.prop('disabled', true);
                    }

                    $li.attr('data-item-number', i).find('.font-name').text(font.family)
                        .end()
                        .find('.font').css('font-family', font.family)
                        .end()
                        .find('.use-font').data('use-font', font.family);

                    // add list item
                    $list.append($li);

                    // update font list for <link> element href
                    var fontIncVariants = font.variants.length
                        ? font.family+':'+font.variants.join(',')
                        : font.family;

                    api_family_param.push(fontIncVariants);
                }


                // load new fonts
                var url = api_url + api_family_param.join('|').replace(/ /g, '+');
                url+= filters.subset ? '&subset='+filters.subset : '';

                if (!TvrCom.isDomEl($styleNode)){
                    $('head').append('<link id="google-fonts" rel="stylesheet" type="text/css" href="'+url+'" />');
                } else {
                    $styleNode.attr('href', url);
                }

                //console.log('we should update output', $list[0].outerHTML);
                // there is a browser sync crash bug when the last page >> option is used
                $('#gf-output').html($list[0].outerHTML);


                // hack, this should run after Google fonts URL has finished loading,
                // but still considering textarea benefits over div (which has subset preview drawback)
                setTimeout(function(){
                    // bind autosize functionality to textareas
                    MTautosize(document.querySelectorAll('textarea'));
                }, 100);

                // save config
                this.save_font_settings();
            },

            // construct GF api data string from filters
            resolve_api_data: function(filters){

                var data = [],
                    eligable = ['sort']; // only the sort filter requires a different API request

                for (var key in filters){
                    if ( !filters.hasOwnProperty(key) || !TvrCom.in_array(key, eligable) ) continue;
                    var value = filters[key];
                    if (TvrCom.isDefined(value)){

                        // if object, concat enabled properties into a comma sep string
                        if (value === Object(value)){

                            var obj = value,
                                enabled = [];

                            for (var subKey in obj){
                                if ( !obj.hasOwnProperty(subKey) ) continue;
                                if (obj[subKey]){
                                    enabled.push(subKey);
                                }
                            }

                            // if none are enabled, do not add key to param array
                            if (!enabled.length){
                                continue;
                            }

                            value = enabled.join(',');
                        }

                        data.push(key+'='+value);

                    }
                }

                //console.log('filters', data.join('&'));

                return data.join('&');
            },


			// insert font into Microthemer UI
            insert_font: function($clicked) {

			    // configure possible variant or subset
                var extensions = [],
                    $fontEntry = $clicked.closest('li'),
                    fontFamily = $fontEntry.find('.font-name').text(),
                    variant = $fontEntry.find('select[name=variant]').val().trim(),
                    subset = $('#controls').find('select[name=subset]').val(),
                    variantUsed = false;

                if (variant && variant !== '400'){
                    extensions.push(variant);
                    variantUsed = true;
                } if (subset){
                    // variant must be passed with subset, even if 400. Otherwise subset is used as variant
                    if (!variantUsed){
                        extensions.push(variant);
                    }
                    extensions.push(subset);
                }

                if (extensions.length){
                    fontFamily = fontFamily+' ('+extensions.join(', ')+')';
                }

                // if parent window exists (always will unless accessing page directly for development)
                if (TvrUi.insert_google_font){
                    TvrUi.insert_google_font(fontFamily);
                }

			},

			handle_ajax_error: function(x,e) {
				if(x.status==0){
					alert('Connection Error. Request Failed. Please Try again.');
				}
				else if(x.status==404){
					alert('Requested URL not found.');
				}
				else if(x.status==500){
					alert('Internel Server Error.');
				}
				else if(e=='parsererror'){
					alert('Error.\nParsing JSON Request failed.');
				}
				else if(e=='timeout'){
					alert('Request Timed out.');
				}
				else {
					alert('Unknow Error.\n'+x.responseText);
				}
			}
	};


	// initialize controls and fonts
	TvrFonts.init();

});


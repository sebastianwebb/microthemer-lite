// This script is loaded by the main MT interface and on the frontend (if not inside MT)
// send and receive broadcast channel messages
// so we can update the CSS across tabs and reload MT iframe content after publish
if (BroadcastChannel){

   var thisTarget = window.TvrMT ? 'MTinterface' : 'outsideTab',
       isMTinterface = thisTarget === 'MTinterface';

   MTBroadCast = {
        BroadcastChannel: false,
        observer: false,
        thisTarget: thisTarget,
        isMTinterface: isMTinterface,
        isOutsideTab: !isMTinterface,
        actionWhenVisible: false,
        MTDynFrontData: false,
        stat: {

        },
        init: function(MTDynFrontData){

             MTBroadCast.log('This window', window);

            // save the front data for comparing content update
            if (MTBroadCast.isOutsideTab && MTDynFrontData){
                this.MTDynFrontData = MTDynFrontData;
                this.listenForBuilderPublish();
            }

            // subscribe to channel
            this.createBroadcastChannel();

            // listen for tab visibility change
            document.addEventListener("visibilitychange", MTBroadCast.visibilityChanged);

            // listen for messages
            this.BroadcastChannel.onmessage = function(msg){

                if (msg){

                    var data = msg.data;

                    if (data && data.update && data.updateTarget === MTBroadCast.thisTarget){

                        MTBroadCast.log('Message received in valid context', data);

                        // flag that asset loading change has happened even if we delay processing
                        if (data.asset_loading_change || data.adjusted_logic){
                            MTBroadCast.asset_loading_change = true;
                        }

                        // cache action and run when tab becomes active
                        if (MTBroadCast.tabIsHidden()){
                            MTBroadCast.log('Cache action for later', data);
                            MTBroadCast.actionWhenVisible = data;
                        }

                        // run action right away
                        else {
                            MTBroadCast.log('Run action right away', data);
                            MTBroadCast.runAction(data);
                        }

                    }

                }

            }

        },
        log: function(){
            var debug = false;
            if (debug){
                 console.log.apply(null, arguments);
            }
        },
        runAction: function (data){
            MTBroadCast.update[data.update](data);
            MTBroadCast.actionWhenVisible = false;
        },
        tabIsHidden: function(){
            return document.visibilityState === 'hidden';
        },
        visibilityChanged: function(){

            if (document.visibilityState === 'visible') {

                // use a timeout to prevent Chrome 38 from firing this twice
                setTimeout(function(){

                    MTBroadCast.log('This tab became visible');

                    if (MTBroadCast.actionWhenVisible){
                        MTBroadCast.runAction(MTBroadCast.actionWhenVisible);
                    }
                }, 20);

            }

            else {
               MTBroadCast.log('This tab became hidden');
            }
        },
        createBroadcastChannel: function(){
            this.BroadcastChannel = new BroadcastChannel("microthemer");

            MTBroadCast.log('createBroadcastChannel', this.BroadcastChannel);
        },
        broadcastChange: function(msg){

            // create the channel if not yet created
            if (!this.BroadcastChannel){
                this.createBroadcastChannel();
            }

            // send the message
            MTBroadCast.log('postMessage', msg);
            this.BroadcastChannel.postMessage(msg);
        },

        closeBroadcast: function(){

            this.BroadcastChannel.close();

            this.BroadcastChannel = false;

            // remove page visibility event listener
            document.removeEventListener("visibilitychange", MTBroadCast.visibilityChanged);
        },

        // this only runs on the main interface
        toggleSyncBrowserTabs: function(turnOn){

            // initialise channel on the main interface
            if (turnOn){
                MTBroadCast.init();
            }

            // stop broadcasting and listening
            else {
                MTBroadCast.closeBroadcast();
            }
        },

        // a supported page builder has made style changes and Styles tab should update CSS rules.
        observeTarget: function(el, config){

           config.observerConfig = config.observerConfig || {};

           // set up observer and callback
           var observer = new MutationObserver(function(mutations) {
                   mutations.forEach(function(mutationRecord) {
                       // MTBroadCast.log('mutationRecord changed', mutationRecord);
                       config.item.apply(this, [el, mutationRecord].concat(config.args || []));
                   });
               });

           // watch for style attribute change
           observer.observe(el, config.observerConfig);

           // cache for later
           MTBroadCast.observer = observer;

           // MTBroadCast.log('we created observer', observer, config);

       },

       disconnectObserver: function(){
           MTBroadCast.observer.disconnect();
           //MTBroadCast.log('we disconnected the observer', MTBroadCast.observer);
       },

       docReady: function(fn) {
           // see if DOM is already available
           if (document.readyState === "complete" || document.readyState === "interactive") {
               // call on next available tick
               setTimeout(fn, 1);
           } else {
               document.addEventListener("DOMContentLoaded", fn);
           }
       },


       observeDomChange: function(selector, triggerValue, doc, attr, config){

           doc = doc || document;
           attr = attr || 'class';
           config = config || {};
           var el = config.el || doc.querySelector(selector);

           MTBroadCast.log('We have observeDomChange', selector, triggerValue, doc, el, config)

           if (el){

               MTBroadCast.log('We have an el', el, el.dataset);

               MTBroadCast.observeTarget(el, {
                   observerConfig: {
                       attributeFilter: [attr],
                       attributeOldValue: config.attributeOldValue,
                       subtree: config.subtree,
                       childList: config.childList
                   },
                   item: function(el, mutationRecord){

                       MTBroadCast.log('The mutation', mutationRecord);

                       // MTBroadCast.log('The mutation', mutationRecord);

                       var updateContent = attr === 'class' &&
                           (!config.attributeOldValue && el.classList.contains(triggerValue)
                               || config.attributeOldValue && mutationRecord.oldValue.match(config.attributeOldValue))
                        ||  attr === 'style' && el[attr][triggerValue.property] === triggerValue.value
                        || config.change === 'dataset'
                           && el[config.change][triggerValue.key] === triggerValue.value
                           && !config.attributeOldValue || mutationRecord.oldValue === config.attributeOldValue
                        ||  attr === 'disabled' && el.disabled === triggerValue
                        || (attr === 'addedNodes' || attr === 'removedNodes') && mutationRecord[attr].length &&
                           mutationRecord[attr][0].classList &&
                           mutationRecord[attr][0].classList.contains(triggerValue);

                       // MTBroadCast.log('the node', el.disabled, mutationRecord.addedNodes[0]);

                       if (updateContent){

                            MTBroadCast.log('Some kind of update happened in a Builder', config)

                           // for Gutenberg, we may need to update the folder logic
                           // instead of doing the usual broadcast. customCallback will only be set when integration is active, so no need for broadcasting to other tabs
                           if (config.isGutenberg && config.customCallback){
                               config.customCallback.item.apply(this, (config.customCallback.args || []));
                               return;
                           }

                           // delete any dom references that cannot be passed between browsers
                           delete config['el'];

                           MTBroadCast.BroadcastChannel.postMessage({
                               update: 'sitePreview',
                               updateTarget: 'MTinterface',
                               MTDynFrontData: MTBroadCast.MTDynFrontData,
                               config: config
                           });

                           // run any callbacks
                           if (config.cb){
                               config.cb.item.apply(this, (config.args || []));
                           }

                       }
                   }
               })
           }
       },

       listenForBuilderPublish: function(){

           MTBroadCast.docReady(function(){

               // Divi, Bricks, Kadence, Brizy, (Gutenberg later)
               MTBroadCast.stat.body = document.body;

               var bodyData = document.body.dataset,
                   B = false,
                   clickCallback = false,
                   observe = false,
                   bodyClassList = document.body.classList;

               MTBroadCast.log('The bodyData', bodyData);

               // Detect if frontend is loaded inside builder - et-fb-app-frame
               if (document.documentElement.classList.contains('et-fb-app-frame')) {
                   B = 'divi'; // Divi
               } if (bodyData.hasOwnProperty('builderMode')) {
                   B = 'bricks'; // Bricks
               } else if (bodyClassList.contains('brz-ed')) {
                   B = 'brizy'; // Brizy
               } else if (bodyClassList.contains('znpb-editor-preview')) {
                   B = 'zion'; // Zion
               } else if (document.body.id === 'wppb-page-builder') {
                   B = 'wppb'; // WP Page Builder
               } else if (document.getElementById('breakdance_canvas')) {
                   B = 'breakdance'; // Breakdance
               } else if (document.documentElement.dataset.op3Layer) {
                   B = 'optimizePress';
               } else if (bodyClassList.contains('tve_editor_page')) {
                   B = 'thrive'; // Thrive architect
               } else if (bodyClassList.contains('site-editor-php') || bodyClassList.contains('block-editor-page')) {
                   B = 'gutenberg'; // FSE editor or Gutenberg Post/Page site-editor-php
                   //console.log('We have gutenberg syncing')
               }


               else if (bodyData.hasOwnProperty('elementorDeviceMode')) {
                   B = 'elementor'; // Elementor
               } else if (document.documentElement.classList.contains('fl-builder-is-showing-toolbar')) {
                   B = 'FLBuilder'; // Beaver Builder
               } else if (document.documentElement.getAttribute('ng-app') === 'CTFrontendBuilder') {
                   B = 'oxygen'; // Oxygen
               }

               // MTBroadCast.log('document.documentElement.id', document.documentElement.getAttribute('id'))

               // we are inside a builder
               if (B){

                    MTBroadCast.log('We have a builder', B);

                   clickCallback = MTBroadCast[B].click;
                   observe = MTBroadCast[B].observe;

                   // attach click event
                   if (clickCallback){
                       document.addEventListener('click', clickCallback);
                   }

                   // observe changes
                   if (observe){
                       observe();
                   }

               }

           });
       },

       // Builder publish / save draft integrations
       divi: {
           /*
           // Abort this method - click/mousedown is suppressed on button by divi

           selectors: ['button.et-fb-button--save-draft', 'button.et-fb-button--publish'],
           click: function(){

               var D = MTBroadCast.divi;

               document.addEventListener('mousedown', function(e){

                   var el = e.target.closest(D.selectors.join(','));
                    MTBroadCast.log('We have the el', el)

                   if (el) {
                        D.observeElement(el);
                        MTBroadCast.log('We are observing it')
                   }
               });
           },
           observeElement: function(el){
               MTBroadCast.observeDomChange(
                   false,
                   false,
                   window.parent.document,
                   'disabled',
                   {
                       el: el,
                       cb: {
                           item: function(){
                               MTBroadCast.disconnectObserver();
                           }
                       }
                   }
               );
           },*/
           observe: function(){
               setTimeout(function(){

                   // observe the save draft button
                   MTBroadCast.observeDomChange(
                       'button.et-fb-button--save-draft',
                       false, // when button becomes un-disabled again, we know it's finished saving
                       window.parent.document,
                       'disabled'
                   );

                   // and the publish button
                   MTBroadCast.observeDomChange(
                       'button.et-fb-button--publish',
                       false,
                       window.parent.document,
                       'disabled'
                   );

               }, 4000); // 4 seconds - Brizy loads all HTML dynamically
           }
       },
       bricks: {
           observe: function(){
               MTBroadCast.observeDomChange(
                   '#bricks-preview-message',
                   'show',
               );
           }
       },
       brizy: {
           observe: function(){
               setTimeout(function(){
                   MTBroadCast.observeDomChange(
                       'div.brz-ed-fixed-bottom-panel__btn svg.brz-icon-svg',
                       'brz-d-none', //'brz-ed-fixed-bottom-panel__btn-disabled',
                       window.parent.document,
                   );
               }, 2000); // 2 seconds - Brizy loads all HTML dynamically
           }
       },
       zion: {
           observe: function(){
               MTBroadCast.observeDomChange(
                   '.znpb-editor-header__page-save-wrapper--save',
                   'znpb-editor-icon-wrapper', //'znpb-loader-wrapper',
                   window.parent.document,
                   'addedNodes',
                   {
                       subtree: true,
                       childList: true
                   }

               );
           }
       },
       wppb: {
           observe: function(){
               setTimeout(function(){
                   MTBroadCast.observeDomChange(
                       '#wppb-builder-page-tools', //'.wppb-builder-device-option-ui i.wppb-font-save',
                       'wppb-toastr-success',
                       window.parent.document,
                       'addedNodes',
                       {
                           subtree: true,
                           childList: true
                       }
                   );
               }, 2000); // 2 seconds - loads all HTML dynamically
           }
       },
       breakdance: {
           observe: function(){
               setTimeout(function(){
                   // v-btn--loading
                   MTBroadCast.observeDomChange(
                       'button[data-test-id="main-save-button"]',
                       'v-btn__loader',
                       window.parent.document,
                       'removedNodes',
                       {
                           subtree: true,
                           childList: true
                       }
                   );

               }, 2000); // 2 seconds - loads all HTML dynamically
           }
       },
       optimizePress: {
           observe: function(){
               setTimeout(function(){

                   var doc = window.parent.document;

                   // v-btn--loading
                   MTBroadCast.observeDomChange(
                       false,
                       {
                           key: 'op3ButtonStatus',
                           value: 'success'
                       },
                       doc,
                       'data-op3-button-status',
                       {
                           el: doc.getElementById('header').querySelector('a.save'),
                           attributeOldValue: 'pending',
                          /* subtree: true,
                           childList: true,*/
                           change: 'dataset'
                       }
                   );

               }, 2000); // 2 seconds - loads all HTML dynamically
           }
       },
       thrive: {
           observe: function(){

               var doc = window.parent.document;

               MTBroadCast.observeDomChange(
                   false,
                   false,
                   doc,
                   'class',
                   {
                       el: doc.getElementById('tcb-editor-settings').querySelector('a.save'),
                       attributeOldValue: 'tve-disabled'
                   }
               );
           }
       },
       elementor: {
           observe: function(){
               MTBroadCast.observeDomChange(
                   '#elementor-panel-saver-button-publish',
                   'elementor-disabled', // when button becomes un-disabled again, we know it's finished saving
                   window.parent.document
               );
           }
       },
       FLBuilder: {
           observe: function(){
               MTBroadCast.observeDomChange(
                   'div.fl-builder-bar',
                   'is-hidden', // BB hides the top toolbar after saving as draft
                   window.parent.document
               );
           }
       },
       oxygen: {
           observe: function(){
               MTBroadCast.observeDomChange(
                   '#ct-page-overlay',
                   {
                       property: 'display',
                       value: 'none' // after save has completed, it is hidden again
                   },
                   window.parent.document,
                   'style'
               );
           }
       },
       gutenberg: {
           isObserving: false,

           // This function is also used by mt-integrate.js, for updating logic on post / page save
           observeSaveOrPublish: function(doc, customCallback){

               doc = doc || document;

               // observe the initial save draft button
               MTBroadCast.observeDomChange(
                   false,
                   false,
                   doc,
                   false,
                   {
                       // 3 states save button can be in:
                       // before content added, after content added, and save again
                       el: doc.querySelectorAll(
                           'div.edit-post-header__settings button:first-of-type, ' +
                           'button.editor-post-save-draft, ' +
                           'button.editor-post-saved-state'
                       )[0],
                       attributeOldValue: 'is-saving',
                       isGutenberg: 1,
                       customCallback: customCallback
                   }
               );

               // observe the publish button
               MTBroadCast.observeDomChange(
                   'button.editor-post-publish-button__button',
                   false,
                   doc,
                   false,
                   {
                       // 2 states publish button can be in:
                       // Initial publish button, and then update button
                       el: doc.querySelectorAll(
                           'button.edit-site-save-button__button, ' +
                           'button.editor-post-publish-button__button'
                       )[0],
                       attributeOldValue: 'is-busy',
                       isGutenberg: 1,
                       customCallback: customCallback
                   }
               );
           },
           observe: function(){
               setTimeout(function(){
                   MTBroadCast.gutenberg.observeSaveOrPublish();
               }, 3000); // Gutenberg load save draft / publish button dynamically
           }
       },

       // simple get request that returns json and optionally runs a callback - can be adapted if we need post etc
       fetch: function(url, config){
           fetch(url)
               .then((response) => response.json())
               .then((data) => {

                   MTBroadCast.log('We fetched some data', data, config);

                   if (config.cb){
                       let args = config.cb.args || [];
                       args.unshift(data);

                       MTBroadCast.log('Running fetch callback', config.cb);

                       config.cb.item.apply(this, args);
                   }
               })
               .catch((error) => {
                   console.error('Error:', error);
               });
       },

       // add a param to an existing url if it doesn't exist, using the correct joining char
       append_url_param: function(url, param, val, replaceExisting){

           // bail if already present
           if (url.indexOf(param) > -1){

               if (val !== undefined && replaceExisting){

                   /*console.log('We should replace', url, RegExp(param+"=[^&]+"), param+"="+val, 'replacement', url.replace(RegExp(param+"=[^&]+"), param+"="+val));*/

                   return url.replace(RegExp(param+"=[^&]+"), param+"="+val);
               }

               else {
                   return url;
               }
           }

           // we do need to add param, so determine joiner
           var joiner = url.indexOf('?') > -1 ? '&': '?';

           // is there param val?
           param = val ? param+'='+val : param;

           // return new url
           return url + joiner + param;

       },

       // the other tab is the same page as the current iframe preview
       isSamePage: function(iframeFrontData, otherTabFrontData){

           var iframeFrontendURL = decodeURIComponent(iframeFrontData['iframe-url']),
               otherTabFrontURL = decodeURIComponent(otherTabFrontData['iframe-url']);

           /*console.log(
               iframeFrontData['page-id'] === otherTabFrontData['page-id'],
                   iframeFrontData.isAdminArea === otherTabFrontData.isAdminArea,
                iframeFrontendURL === otherTabFrontURL
           )*/

           return (
               (iframeFrontData['post_id'] === otherTabFrontData['post_id'] &&
               iframeFrontData.isAdminArea === otherTabFrontData.isAdminArea)
               || iframeFrontendURL === otherTabFrontURL
           );

       },

       assetLoadingChanged: function(origFolderLoading, newFolderLoading, asset_loading){

            let conditionalFolderChange = JSON.stringify(origFolderLoading) !== JSON.stringify(newFolderLoading),
                existingGlobalGFont = document.getElementById('microthemer_g_font-css') ? 1 : 0,
                existingGlobalCSS = document.getElementById('microthemer-css') ? 1 : 0,
                gFontChange = existingGlobalGFont !== parseInt(asset_loading.global_g_fonts),
                globalCSSChange = existingGlobalCSS !== parseInt(asset_loading.global_css);

            MTBroadCast.log('assetLoadingChanged', conditionalFolderChange,  globalCSSChange, gFontChange);

            return  conditionalFolderChange || globalCSSChange || gFontChange;
       },

       // merge the asset_loading conditional logic with the folderLoading map
       assetLoadingConfig: function(newFolderLoading, data, time, isBlockEditorWin){

           let config = {},
               asset_loading = data.asset_loading,
               logicArray = asset_loading.logic,
               id,
               globalMediaAtt = isBlockEditorWin ? 'not all' : 'all';

           // Global Google fonts
           if (asset_loading.global_g_fonts){
              id = 'microthemer_g_font-css';
              config[id] = {
                  assetHtml: MTBroadCast.generateAssetHTML(id, {
                      media: globalMediaAtt,
                      css_external: 1,
                      url: data.gfURL,
                  }, data, time)
              }
           }

           // Global CSS
           if (asset_loading.global_css){
               id = 'microthemer-css';
               config[id] = {
                   assetHtml: MTBroadCast.generateAssetHTML(id, {
                       media: globalMediaAtt,
                       css_external: 1,
                       url: data.mtURL,
                   }, data, time)
               }
           }

           // conditional CSS
           for (let i = 0; i < logicArray.length; i++) {

              let logic = logicArray[i],
                  slug = logic.slug;

              id = 'microthemer-'+slug+'-css';

              if (newFolderLoading[slug]){
                  config[id] = logic;
                  logic.media = isBlockEditorWin && newFolderLoading[slug] === 'blocksOnly' ? 'not all' : 'all';
                  config[id].assetHtml = MTBroadCast.generateAssetHTML(id, logic, data, time);
              }
          }

           MTBroadCast.log('The asset loading config', config);

           return config;

       },

       // generate a link element
       generateAssetHTML: function(id, config, data, time){

            let media = config.media || 'all',
                baseHtml = '<link rel="stylesheet" id="'+id+'" media="'+media+'"',
                asyncHtml = config.css_async
                    ? 'as="style" onload="this.onload=null;this.rel=\'stylesheet\'"'
                    : '',
                conversionNotice = !config.css_external
                    ? ' data-mt-notice="To support browser tab syncing, we converted a style element to this link element (for admin users only)"'
                    : '',
                href = config.url || data.microUrl+'mt/conditional/draft/'+config.slug+'.css?nomtcache='+time;

            return baseHtml+' href="'+href+'" '+asyncHtml+conversionNotice+'>';

       },

       allCSSAssetHTML: function(assetLoadingConfig){

           let html = '',
               ids = Object.keys(assetLoadingConfig);

           for (let i = 0; i < ids.length; i++) {
               html+= assetLoadingConfig[ids[i]].assetHtml;
           }

           return html;

       },

       update: {

           // message to other frontend tabs to reload MT CSS
           css: function(data){

               let checkAssetLoadingChange = MTBroadCast.asset_loading_change || data.asset_loading_change;

               MTBroadCast.log('checkAssetLoadingChange',checkAssetLoadingChange);

               // There was an asset loading change, and the other tab is not the same page as the iframe preview
               if (checkAssetLoadingChange && !MTBroadCast.isSamePage(data.MTDynFrontData, window.MTDynFrontData)){

                   let url = MTBroadCast.append_url_param(
                       decodeURIComponent(window.MTDynFrontData['iframe-url']), 'test_logic', 1
                   ) + '&test_all=1';

                   MTBroadCast.log('We need to fetch the logic for alt page', url);

                   // we need the folderLoading config from this specific page
                   MTBroadCast.fetch(url, {
                       cb: {
                           item: MTBroadCast.update.action_css,
                           args: [checkAssetLoadingChange, data]
                       }
                   });

               }

               // There was no asset loading change.
               // Or we have an up to date folderLoading value from MT
               else {

                   MTBroadCast.log('There was no asset loading change, or we have an up to date folderLoading value from MT');

                   MTBroadCast.update.action_css(data.MTDynFrontData.folderLoading, checkAssetLoadingChange, data);
               }

           },

           // run the CSS update
           action_css: function(newFolderLoading, checkAssetLoadingChange, data){

               MTBroadCast.log('Data passed to action_css', window, newFolderLoading, checkAssetLoadingChange, data);

               let time = new Date().getTime(),
                   origFolderLoading = window.MTDynFrontData && window.MTDynFrontData.folderLoading
                       ? window.MTDynFrontData.folderLoading
                       : false,
                   isBlockEditorWin = window.MTblock && window.MTblock.context === 'editor',
                   assetLoadingChanged = checkAssetLoadingChange
                       ? MTBroadCast.assetLoadingChanged(origFolderLoading, newFolderLoading, data.asset_loading)
                       : false,
                   styleEls = document.querySelectorAll(
                       'link[href*="\\/micro-themes\\/"], link[id^="microthemer"], style[id^="microthemer"]'
                   ),
                   placeholderEl =  document.getElementById('mt-placeholder-inline-css'),
                   assetLoadingConfig = MTBroadCast.assetLoadingConfig(newFolderLoading, data, time, isBlockEditorWin);

               //console.log('assetLoadingConfig', assetLoadingConfig)

               // if the conditional asset folder loading changed, simpy replace all current assets
               if (assetLoadingChanged){

                   MTBroadCast.log('There has been an asset loading change for the current page', ismaryBlockEditorWin,assetLoadingConfig);

                   // remove the previous assets
                   for (let i = 0; i < styleEls.length; i++) {
                       styleEls[i].remove();
                   }

                   // insert the new assets
                   placeholderEl.insertAdjacentHTML(
                       'afterend',
                       MTBroadCast.allCSSAssetHTML(assetLoadingConfig)
                   );

                   // Update the folder loading state for next comparison
                   if (window.MTDynFrontData){
                       window.MTDynFrontData.folderLoading = newFolderLoading;
                   }
               }

               // just update the URL or replace inline styles with external link elements
               else {

                   MTBroadCast.log('No asset loading change, just update cache param / change to link');

                   for (let i = 0; i < styleEls.length; i++) {

                       let styleEl = styleEls[i];

                       // replace css with link element
                       if (styleEl.tagName === 'STYLE'){

                           let id = styleEl.id.replace('inline-', '');

                           if (assetLoadingConfig[id]){

                               MTBroadCast.log('Change to style', id, assetLoadingConfig[id]);

                               //styleEl.replaceWith(assetLoadingConfig[id].assetHtml);

                               // insert the new link element after the styleEl
                               styleEl.insertAdjacentHTML('afterend', assetLoadingConfig[id].assetHtml);

                               // remove the style element
                               styleEl.remove();
                           }



                       }

                       // adjust the URL parameter
                       else {

                           styleEl.href = MTBroadCast.append_url_param(
                               styleEl.href, 'nomtcache', time, true
                           );

                           MTBroadCast.log('Refreshed param', styleEl.href);
                       }
                   }

               }

               // cached asset loading change flag can be reset now
               MTBroadCast.asset_loading_change = false;

           },

           // message to main MT interface to reload the frontend iframe
           sitePreview: function(data){

                MTBroadCast.log('Received message to reload the site preview', data);

                var TvrMT = window.TvrMT,
                    MTF = TvrMT.MTF,
                    TvrUi = TvrMT.TvrUi,
                    TvrCom = TvrMT.TvrCom,
                    config = data.config || {};

                if (MTF && MTBroadCast.isSamePage(MTF.getMTDynFrontData(), data.MTDynFrontData) || config.isGutenberg){

                    MTBroadCast.log('Conditions valid to reload the site preview', data);

                    TvrCom.reload_current_frontend_page(MTF);
                }
           }

       }

   }

   // initialise
   /* MTBroadCast.log('window.TvrMT', window.TvrMT.data.dyn)
   if (!isMTinterface || parseInt(window.TvrMT.data.dyn.pref.sync_browser_tabs)){
       MTBroadCast.init();
   }*/



}
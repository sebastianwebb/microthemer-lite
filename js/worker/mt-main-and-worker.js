// move functions here that need to be used by the main thread and a worker
// these functions get added to the TvrCom object on the main thread when mt-utilities.js loads
// this way we don't need to duplicate any code

// important note - data stores are not synced - they must be added to set_worker_and_main_common_reference()

MTMainAndWorker = (function(){

	var TvrCom  = {
		TVR_TIMERS: 0,
		setWorkerObjectRefs: function(TvrMT){
			this.MTloop = TvrMT.mod.MTloop;
		},
		set_worker_and_main_common_reference: function(TvrComCombined){

			TvrCom = TvrComCombined;

			//TvrCom.profiler = TvrMT.TvrCom.profiler;

			//console.log('Set data in comomon',  TvrComCombined, TvrCom.profiler, TvrCom)


		},
		// allows 0 as a valid value (hasValue could prob be ditched for this)
		isDefined: function(data){
			return (data !== '' && data !== 'undefined' && data !== undefined && data !== null);
		},
		checkObject: function(obj, levels, returnFalsy) {
			if (!obj) return false;
			for (var i = 0; i < levels.length; i++) {
				//console.log('the obj', i, levels[i], obj, levels)
				if (obj === undefined || obj === null || !obj.hasOwnProperty(levels[i])) {
					return returnFalsy ? undefined : false; // support discerning undefined from false (newish)
				}
				obj = obj[levels[i]];
			}
			return obj; // could be falsey e.g. 0 or ''
		},

		/*** start manual timer ***/
		// see also Firebug profiler
		// enable both Console and Javascript. Click Profile. Reload. Click Profile again. View the report.
		profiler: {},
		log_concurrent: 0,
		startT: function(fName, usedInApp){

			//console.log('startT', TVR_DEV_MODE, TvrCom.TVR_TIMERS)

			if (!usedInApp && (!TVR_DEV_MODE || !TvrCom.TVR_TIMERS)) return;
			// if arguments object is passed in, get name of function from that
			if (fName === Object(fName)){
				fName = fName.callee.name;
			}

			// set up function profiler if not defined
			if (!TvrCom.isDefined(TvrCom.profiler[fName])){
				TvrCom.profiler[fName] = {
					'fName': fName,
					'sT': [],
					'eT': [],
					'elT': [],
					'calls': 0,
					'avg_time': 0,
					'total_time': 0
				};
			}
			TvrCom.profiler[fName]['sT'][++TvrCom.profiler[fName]['calls']] = new Date().getTime();

			//console.log('Set up profiler', fName, TvrCom.profiler[fName], TvrCom.profiler);
		},
		// stop timer
		endT: function(fName, show, usedInApp){
			if (!usedInApp && (!TVR_DEV_MODE || !TvrCom.TVR_TIMERS)) return;

			// if arguments object is passed in, get name of function from that
			if (fName === Object(fName)){
				fName = fName.callee.name;
			}

			if (!TvrCom.profiler[fName]){
				console.log('function timer was not started: ', fName);
			}
			var callIndex = TvrCom.profiler[fName]['calls'];
			TvrCom.profiler[fName]['eT'][callIndex] = new Date().getTime();
			var timeElapsed = TvrCom.profiler[fName]['eT'][callIndex] - TvrCom.profiler[fName]['sT'][callIndex];
			TvrCom.profiler[fName]['elT'][callIndex] = timeElapsed;
			TvrCom.profiler[fName]['total_time'] = TvrCom.profiler[fName]['total_time'] + timeElapsed;
			TvrCom.profiler[fName]['avg_time'] = (TvrCom.profiler[fName]['total_time'] / callIndex);
			//TvrCom.log_concurrent = 1;
			if (show || TvrCom.log_concurrent // uncomment this when testing
			){
				TvrCom.showT(fName);
			}
		},
		// display elapsed time(s)
		showT: function(fName, orderBy){
			if (!TVR_DEV_MODE || !TvrCom.TVR_TIMERS) return;
			// if I specify a function name, just show that
			var str = '';
			if (fName !== 'all'){
				str = TvrCom.msgT(TvrCom.profiler[fName], TvrCom.profiler[fName]['calls']);
			}

			// otherwise show time for all functions
			else {

				// show full object for debugging any anomalies
				//console.log('TvrCom.profiler', TvrCom.profiler)

				var all = [];
				// get into an array that can be ordered
				for (var fName in TvrCom.profiler){
					if ( ! TvrCom.profiler.hasOwnProperty(fName) ) continue; // for compat
					all.push(TvrCom.profiler[fName])
				}

				// order by avg time/total time
				orderBy = orderBy ? orderBy : 'avg_time';
				all.sort( TvrCom.firstBy(orderBy, -1) ); //.thenBy('ui_order', -1)); why isn't this fully working?
				for (var i in all){
					if ( ! all.hasOwnProperty(i) ) continue; // for compat
					//console.log(all[i])
					str+= TvrCom.msgT(all[i]);
				}
			}
			if ( console && console.log ) {
				console.log(str);
			}
		},
		// format message
		msgT: function(profObj, callIndex){

			// allow for showT function to be called without endT first
			if (!TvrCom.isDefined(profObj['eT'][profObj['calls']])){

				// keep this console warning on so I can fix unended timers
				console.log(profObj['fName']+' was not endT() finished', profObj)

				TvrCom.endT(profObj['fName']);
			}

			var str = '',
				fName = profObj['fName'],
				total = profObj['total_time'].toFixed(2),
				avg = profObj['avg_time'] ? profObj['avg_time'].toFixed(2) : total,
				single = callIndex ? profObj['elT'][callIndex] : TvrCom.isDefined(profObj['elT'][1])
					? profObj['elT'][1] : '[error]',
				callIndex = callIndex ? callIndex : profObj['calls'];

			// always show avg and total
			str+= callIndex+ ' calls'+ "\t\t"
				+ single+'ms'+ "\t\t"
				+"avg: "+avg+ "ms\t\t"
				+ 'tot: '+total+'ms'+ "\t\t"
				+ fName+ "\n";

			return str;
		},

		// clear the browser console
		clear_console: function(){
			//console.API;
			if (typeof console._commandLineAPI !== 'undefined') {
				console.API = console._commandLineAPI; //chrome
			} else if (typeof console._inspectorCommandLineAPI !== 'undefined') {
				console.API = console._inspectorCommandLineAPI; //Safari
			} else if (typeof console.clear !== 'undefined') {
				console.API = console;
			}
			console.API.clear();
		},

		// JS array of objects sorting utility: https://github.com/Teun/thenBy.js
		firstBy: function(){function n(n){return n}function t(n){return"string"==typeof n?n.toLowerCase():n}function r(r,e){if(e="number"==typeof e?{direction:e}:e||{},"function"!=typeof r){var u=r;r=function(n){return n[u]?n[u]:""}}if(1===r.length){var i=r,o=e.ignoreCase?t:n;r=function(n,t){return o(i(n))<o(i(t))?-1:o(i(n))>o(i(t))?1:0}}return-1===e.direction?function(n,t){return-r(n,t)}:r}function e(n,t){return n=r(n,t),n.thenBy=u,n}function u(n,t){var u=this;return n=r(n,t),e(function(t,r){return u(t,r)||n(t,r)})}return e}(),
		
		unique_key: function(){

			var randomNumer = Math.random().toString(16).slice(2),
				curTime = (new Date()).getTime();

			return randomNumer+curTime;
		},
		// some regular expressions need to be shared too (that is on MTdd)
		reg: {
			'html_tag': function(config){
				var tag = config.tag,
					captStart = config.capParts ? '(' : '',
					captEnd = config.capParts ? ')' : '';
				//return '<\\s*('+tag+')[^>]*>(?:[\\s\\S]*?)<\\s*\\/\\s*(?:'+tag+')>';
				// the above regex failed if e.g. '</style>' was used inside a <script> tag
				// The \\1 backreference at the end fixes this.
				return captStart+'<\\s*('+tag+')[^>]*>'+captEnd
					+captStart+'(?:[\\s\\S]*?)'+captEnd
					+captStart+'<\\s*\\/\\s*(?:\\'+config.closeTagCap+')>'+captEnd;
			},
			'html_att': function(config){
				var att = config.att;
				return '('+att+')=([\'"]+)(?:[\\s\\S]*?)(?:[\'"]+)';
			},
			'builder_html_atts': function(config){
				var att = config.att;
				return '('+att+')=([\'"]+)(?:[\\s\\S]*?)(?:[\'"]+)';
			},
		},

		// HTML formatting functions //

		// To speed up Microthemer's HTML pane, remove content that doesn't affect the index
		// noscript requires this to match up with dom indexes, some elements can be slimmer for speed
		truncate_html_string: function(html, tags, atts, custom, customReplace, filterClasses){

			// strip HTML comments
			//console.log('matches', html.match(/(?=<!--)([\s\S]*?)-->/gm))
			var commentPattern = /(?=<!--)([\s\S]*?)-->/gm;
			html = html.replace(commentPattern, '');

			if (tags){
				html = html.replace(
					new RegExp(TvrCom.reg.html_tag({tag: tags.join('|'), closeTagCap: '1'}), 'gm'),
					'<$1>(MT truncated)</$1>'
				);
				//console.log('The HTML replace regex', new RegExp(TvrCom.reg.html_tag({tag: tags.join('|'), closeTagCap: '1'}), 'gm'))
			} if (atts){
				/* console.log('working pattern', /ng-init="(?:[\s\S]*?)"/)
				 console.log('not working pattern - crashes browser', new RegExp(TvrCom.reg.html_att({att: ['ng-init'].join('|')}), 'g'))*/
				html = html.replace(
					new RegExp(TvrCom.reg.html_att({att: atts.join('|')}), 'gm'),
					'$1="(MT truncated)"'
				);
			} if (custom){
				customReplace = customReplace || '';
				html = html.replace(custom, customReplace)
			} if (filterClasses){
				// todo refactor filter_mt_ignore_atts so classes are on static property
			}

			//console.log('It was replaced');

			return html;


		},

		// add pseudo tags to already beautified (and predictable) HTML doc string
		// hopefully this is faster than using browser parse method
		add_pseudo_placeholders_to_html_string: function(html, hasPseudo, overlayParentIsAlt){ TvrCom.startT(arguments)

			var ast = TvrCom.parse(html, {}, {
				tagIndex: -1,
				data: {}
			});

			//console.log('The ast', ast);

			//TvrCom.add_pseudos(ast);
			var config = {
				// so we can remove mt-ignore-stuff without messing up array indexes in the loop
				traverseBackwards: 1,
				data: {
					pseudoCount: 0,
					pseudoCheckCount: 0,
					hasPseudo: hasPseudo // for comparing if an element has pseudo
				},
				cb: {
					tag: [
						{
							f: TvrCom.remove_mt_ignore_and_subsequent,
							a: [overlayParentIsAlt]
						},
						{
							f: TvrCom.add_pseudos
						}
					]
				}
			};

			TvrCom.traverse(0, ast, config);

			//console.log('The config after travers', ast, config);

			html = TvrCom.stringify(ast);

			TvrCom.endT(arguments)

			return html;

		},

		// get all matches from a regex into a usable array: http://stackoverflow.com/questions/432493/how-do-you-access-the-matched-groups-in-a-javascript-regular-expression
		get_all_matches: function(string, regex, index, config){

			config = config || {};
			index = index || 0; // default to the first capturing group
			//index || (index = 0);

			var matches = [],
				autoIncrement = config.autoIncrement,
				match;

			// Note: if regex doesn't have /g this will cause an infinite loop
			while (match = regex.exec(string)) {

				// with incRoot the second capturing group might have the value
				var val = match[index] ? match[index] : match[(index+1)];

				//console.log('val / match', val, index, match)

				// support [name][] syntax
				if (val === undefined && autoIncrement !== undefined && match[0] === '[]'){
					val = autoIncrement;
				}

				// save
				var store = config.itemObj ? {
					value: val,
					start: match.index,
					end: match.index+val.length,
					match: match
				} : val;

				matches.push(store);

				//console.log('all matches', TvrCom.print_r(match))
			}

			return matches;
		},

		beautifyHTMLOpts: {
			"html": {
				no_preserve_newlines: true,
				"max_preserve_newlines": 0,
				"indent_inner_html": true,
				"indent_handlebars": true,
				"indent_size": 2,
				wrap_line_length: 0,

				// below needed, otherwise it doesn't indent loads of elements!
				inline:[],
				extra_liners: [],
				unformatted: [],
				content_unformatted: []
			}
		},

		/*mtArtificalClassRegex: function(){
			let MTclasses = '(?:(?:tvr-hover-element)?\\s?(?:tvr-trigger-el)?(?: tvr-element-overlay)?)|(?:tvr-element-overlay)',
				pattern = '\\s?class="(?:'+MTclasses+')?"|'+MTclasses.replace('(?:tvr-trigger-el)?', 'tvr-trigger-el');

			console.log('mtArtificalClassRegex pattern', pattern)

			return new RegExp(pattern, 'g');
		},*/

		mtArtificalClassRegex: function() {

			let artificialClasses = '(?:tvr-hover-element|tvr-trigger-el|tvr-element-overlay)',
				// (the HTML pane was stripping space between real classes when the regex had a trailing \s* - may be needed sometimes though)
				MTclasses = '(?:\\s*' + artificialClasses + '){0,3}', // \s*
				pattern = '\\s*class="' + MTclasses + '"|'+MTclasses.replace('{0,3}', '{1,3}');

			//console.log('mtArtificalClassRegex pattern', pattern);

			return new RegExp(pattern, 'g');
		},

		formatHTMLString: function(html, custom, hasPseudo, beautifier, overlayParentIsAlt){ TvrCom.startT(arguments);

			// remove dynamic MT classes
			/*var MTclasses = '(?:(?:tvr-hover-element)?\\s?tvr-trigger-el(?: tvr-element-overlay)?)|(?:tvr-element-overlay)',
				classRegExp =  new RegExp('\\s?class="(?:'+MTclasses+')?"|'+MTclasses, 'g');*/
			html = html.replace(TvrCom.mtArtificalClassRegex(), '');

			//console.log('classRegExp', classRegExp)


			// we may want to strip other things too like builder angular attributres with Oxygen

			// new system for truncating junk HTML that slows the inspector
			// or messes up the indexes (noscript)
			html = TvrCom.truncate_html_string(
				html,
				['noscript', 'script', 'style'], // , 'path' - this can have children - could exclude if .org/en-US/docs/Web/SVG/Element#animation_elements
				false, //['ng-init'] - causes browser to crash, maybe html_att regex needs work
				custom.pattern, // /ng-init="(?:[\s\S]*?)"/
				custom.repl //  'mg-init="(MT truncated)"'
			);

			// beautify config
			var opts = {
				"html": {
					//"preserve_newlines": true,
					no_preserve_newlines: true,
					"max_preserve_newlines": 0,
					"indent_inner_html": true,
					"indent_handlebars": true,
					"indent_size": 2,
					wrap_line_length: 0,
					//indent_empty_lines: 1,
					//unformatted_content_delimiter: '',

					// below needed, otherwise it doesn't indent loads of elements!
					inline:[],
					extra_liners: [],
					unformatted: [],
					content_unformatted: []
				}
			};

			//console.log('passed HTML before', html)

			// add <mtbefore/> and <mtafter/> placeholder els to the string so the
			// beautifier formats them neatly, on their own line
			html = TvrCom.add_pseudo_placeholders_to_html_string(html, hasPseudo, overlayParentIsAlt);

			//console.log('passed HTML after', overlayParentIsAlt, html)

			//console.log('the HTML beautify ooptions', opts);

			// beautify the html: https://github.com/beautify-web/js-beautify#css--html
			/*
			* Note, I tried upgrading to 1.11 but it doesn't handle the following
			* <div>Some text <small>blah blah</small>
			* It should put <small> on new line but doesn't - check this again if we upgrade
			* there may be ways to fix with certain config
			* */
			html = beautifier(html, TvrCom.beautifyHTMLOpts);

			var textEncasedPattern = /<mtphtagtext>([\s\S]+?)<\/mtphtagtext>/g;

			/* // debug
			var textEncasedPattern = /<mtphtagtext>([\s\S]+?)<\/mtphtagtext>/g,
				matches =  TvrCom.get_all_matches(html, textEncasedPattern, 1, {
				itemObj: 1
			})
			console.log('all matches', matches);*/

			// replace the encased text with just text
			html = html.replace(textEncasedPattern, "$1");

			// now replace the placeholder tags with correct ::before and ::after strings
			html = html.replace(/<mtphtag(::)?(.+?)\/>/g, "$1$2");

			TvrCom.endT(arguments);

			return html;

		},

		beautifyHTMLString: function(html){
			return self.html_beautify(html, TvrCom.beautifyHTMLOpts);
		},


		// elements that can't have children
		voidElements: {
			area: 1, base: 1, br: 1, col: 1, embed: 1, hr: 1, img: 1, input: 1,
			link: 1, meta: 1, source: 1, track: 1, wbr: 1
		},
		noPseudo: {
			mtbefore: 1,
			mtafter: 1,

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
			feColorMatrix: 1,
			feComponentTransfer: 1,
			feFuncR: 1,
			feFuncG: 1,
			feFuncB: 1,
			feFuncA: 1,
			feComposite: 1
		},
		parseTag: function(tag, config){

			++config.tagIndex;

			//import lookup from 'void-elements'
			var lookup = TvrCom.voidElements;
			var attrRE = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g

			function stringify(tag) {
				var res = {
					type: 'tag',
					name: '',
					voidElement: false,
					attrs: {},
					children: []
				}

				var tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/)
				if (tagMatch) {

					res.name = tagMatch[1]
					res.i = config.tagIndex // sebcus

					if (
						lookup[tagMatch[1]] ||
						tag.charAt(tag.length - 2) === '/'
					) {
						res.voidElement = true
					}

					// handle comment tag
					// MT strips comments first (but we may want to use this in other contexts)
					if (res.name.startsWith('!--')) {
						var endIndex = tag.indexOf('-->')
						return {
							type: 'comment',
							comment: endIndex !== -1 ? tag.slice(4, endIndex) : '',
						}
					}
				}

				var reg = new RegExp(attrRE)
				var result = null
				for (;;) {
					result = reg.exec(tag)

					if (result === null) {
						break
					}

					if (!result[0].trim()) {
						continue
					}

					if (result[1]) {
						var attr = result[1].trim()
						var arr = [attr, '']

						if (attr.indexOf('=') > -1) {
							arr = attr.split('=')
						}

						res.attrs[arr[0]] = arr[1]
						reg.lastIndex--
					} else if (result[2]) {
						res.attrs[result[2]] = result[3].trim().substring(1, result[3].length - 1)
					}
				}

				//console.log('The parsed tag', res);

				return res
			}

			return stringify(tag);
		},
		parse: function(html, options, config){

			var tagRE = /<[a-zA-Z0-9\-\!\/](?:"[^"]*"|'[^']*'|[^'">])*>/g
			var whitespaceRE = /^\s*$/

			// re-used obj for quick lookups of components
			var empty = Object.create(null)

			// custom callbacks to run during parsing (so can be done is a single loop)
			/*cb = $.extend(true, {
				tag: false,
				att: false
			}, cb);*/

			function parse(html, options, config) {
				options || (options = {})
				options.components || (options.components = empty)
				var result = []
				var arr = []
				var current
				var level = -1
				var inComponent = false

				// handle text at top level
				if (html.indexOf('<') !== 0) {
					var end = html.indexOf('<')
					result.push({
						type: 'text',
						content: end === -1 ? html : html.substring(0, end),
					})
				}

				html.replace(tagRE, function (tag, index) {
					if (inComponent) {
						if (tag !== '</' + current.name + '>') {
							return
						} else {
							inComponent = false
						}
					}
					var isOpen = tag.charAt(1) !== '/'
					// MT already strips comments (but we may want to use this in other contexts)
					var isComment = tag.startsWith('<!--')
					var start = index + tag.length
					var nextChar = html.charAt(start)
					var parent

					if (isComment) {
						var comment = TvrCom.parseTag(tag, options, config)

						// if we're at root, push new base node
						if (level < 0) {
							result.push(comment)
							return result
						}
						parent = arr[level]
						parent.children.push(comment)
						return result
					}

					if (isOpen) {
						level++

						current = TvrCom.parseTag(tag, config)
						if (current.type === 'tag' && options.components[current.name]) {
							current.type = 'component'
							inComponent = true
						}

						if (
							!current.voidElement &&
							!inComponent &&
							nextChar &&
							nextChar !== '<'
						) {
							current.children.push({
								type: 'text',
								content: html.slice(start, html.indexOf('<', start)),
							})
						}

						// if we're at root, push new base node
						if (level === 0) {
							result.push(current)
						}

						parent = arr[level - 1]

						if (parent) {
							parent.children.push(current)
						}

						arr[level] = current
					}

					if (!isOpen || current.voidElement) {
						if (
							level > -1 &&
							(current.voidElement || current.name === tag.slice(2, -1))
						) {
							level--
							// move current up a level to match the end tag
							current = level === -1 ? result : arr[level]
						}
						if (!inComponent && nextChar !== '<' && nextChar) {
							// trailing text node
							// if we're at the root, push a base text node. otherwise add as
							// a child to the current node.
							parent = level === -1 ? result : arr[level].children

							// calculate correct end of the content slice in case there's
							// no tag after the text node.
							var end = html.indexOf('<', start)
							var content = html.slice(start, end === -1 ? undefined : end)
							// if a node is nothing but whitespace, collapse it as the spec states:
							// https://www.w3.org/TR/html4/struct/text.html#h-9.1
							if (whitespaceRE.test(content)) {
								content = ' '
							}
							// don't add whitespace-only text nodes if they would be trailing text nodes
							// or if they would be leading whitespace-only text nodes:
							//  * end > -1 indicates this is not a trailing text node
							//  * leading node is when level is -1 and parent has length 0
							if ((end > -1 && level + parent.length >= 0) || content !== ' ') {
								parent.push({
									type: 'text',
									content: content,
								})
							}
						}
					}
				})

				return result
			}

			return parse(html, options, config);

		},
		stringify: function(doc){

			function attrString(attrs) {
				var buff = []
				for (var key in attrs) {
					buff.push(key + '="' + attrs[key] + '"')
				}
				if (!buff.length) {
					return ''
				}
				return ' ' + buff.join(' ')
			}

			function stringify(buff, doc) {
				switch (doc.type) {
					case 'text':
						return buff + doc.content
					case 'tag':
						buff +=
							'<' +
							doc.name +
							(doc.attrs ? attrString(doc.attrs) : '') +
							(doc.voidElement ? '/>' : '>')
						if (doc.voidElement) {
							return buff
						}
						return buff + doc.children.reduce(stringify, '') + '</' + doc.name + '>'
					case 'comment':
						buff += '<!--' + doc.comment + '-->'
						return buff
				}
			}

			return doc.reduce(function (token, rootEl) {
				return token + stringify('', rootEl)
			}, '');

		},

		// can add custom functions for working on array here
		traverse: function(level, nodes, config, parent){

			var i,
				len = nodes.length;

			// we loop backwards if we are removing any array items
			if (config.traverseBackwards){
				for (i = len-1; i >= 0; i--) {
					processItem(i, level, nodes, config, parent);
				}
			}

			// otherwise we can loop forwards
			else {
				for (i = 0; i < len; i++) {
					processItem(i, level, nodes, config, parent);
				}
			}

			// process the node
			function processItem(i, level, nodes, config, parent){

				var node = nodes[i],
					cbResult = {};

				config.arrKey = i;

				//console.log('item', node.name, node.type, level, node);

				switch(node.type) {
					case 'tag':
						cbResult = TvrCom.maybe_run_callbacks('tag', node, config, parent);

						if (cbResult.continue){
							return true;
						}

						if (node.children && !cbResult.skipChildren){
							++level;
							TvrCom.traverse(level, node.children, config, node);
							--level;
						}
						break;
					case 'text':

						break;

				}
			}



		},
		maybe_run_callbacks: function(event, node, config, parent){

			var cbs = TvrCom.checkObject(config, ['cb', event]),
				result = {};

			if (cbs){

				for (var i = 0; i < cbs.length; i++) {

					var item = cbs[i],
						args = [node, config, parent];

					args = item.a ? args.concat(item.a) : args;

					result = item.f.apply(this, (args || []));

					if (result && result.continue){
						return result;
					}
				}
			}

			return result || {};
		},
		pseudos: ['after', 'before'],

		remove_mt_ignore_and_subsequent: function(node, config, parent, overlayParentIsAlt){

			var cont = false;

			if (!config.mtStuffRemoved){

				//console.log('check remove', node.name, TvrCom.checkObject(node, ['attrs', 'id']))

				// remove the mt-ignore-stuff and mark this check as done so previous elements do not need to be checked
				// and will not be removed
				if (TvrCom.checkObject(node, ['attrs', 'id']) === 'mt-stuff-ignore'){
					//console.log('we remove the mt-ignore-stuff', parent)
					parent.children.splice(config.arrKey, 1);
					config.mtStuffRemoved = 1;
					cont = true;
				}

				// remove any other element that comes after the MT ignore stuff,
				// as clicking that line will highlight the wrong element - this will be dynamic content only
				// remember we are looping backwards
				else if (!overlayParentIsAlt && node.name !== 'html' && node.name !== 'body'){
					//console.log('remove el after mt-ignore-stuff', node.name);
					parent.children.splice(config.arrKey, 1);
					cont = true;
				}
			}

			return {
				continue: cont
			};

		},

		add_pseudos: function(node, config, parent){

			var	that = TvrCom,
				pseudos = that.pseudos,
				tagName = node.name;

			if (!node.isPH && !that.voidElements[tagName] && !that.noPseudo[tagName]){
				//console.log('Add pseudo to', node.name, node, parent, config.arrKey)
				config.data.pseudoCheckCount++;

				//console.log('Check pseudo', node.i, node, config)

				for (var j = 0; j < pseudos.length; j++) {

					var pseudoEl = pseudos[j],
						elHasPseudo = TvrCom.checkObject(config, ['data', 'hasPseudo', node.i, pseudoEl]);

					if (elHasPseudo){

						config.data.pseudoCount++;


						//var placeholderEl = document.createElement("<mt"+pseudoEl+"></mt"+pseudoEl+">");
						var children = node.children,
							placeholderTag = {
								name: 'mtphtag::'+pseudoEl,
								type: 'tag',
								voidElement: 1,
								isPH: 1
							};

						// we don't want text nodes to be on same line as ::before so
						// wrap in placeholdher tag too (not we may need to do this for more that [0]...
						TvrCom.convert_text_node_to_placeholder_tag(node, pseudoEl);

						//console.log('We updated the text nodes', node.attrs, node, config.data.hasPseudo, node.i)

						/*if (children.length
							&& children[0].type === 'text'
							&& !children[0].content.match(/^\s*$/) // not just whitespace
						){
							children[0] = {
								name: 'mtphtag'+children[0].content,
								type: 'tag',
								voidElement: 1,
								isPH: 1
							}
							//children[0].content = "\n"+children[0].content;
						}*/

						//"<MT"+pseudoEl+"/>";
						//console.log('Add pseudo', node.name, node.attrs, pseudoEl, $.extend(true, {}, node))
						if (pseudoEl === 'before'){
							children.unshift(placeholderTag);
						} else {
							children.push(placeholderTag);
						}

						//console.log('it has pseudo', pseudoEl, el.tagName, el.outerHTML)
					}

					else {
						//console.log('Does not have pseudo');
					}

				}

			}

		},

		convert_text_node_to_placeholder_tag: function(node, pseudoEl){

			var children = node.children,
				len = children.length;

			for (var i = len-1; i >= 0; i--) {

				var item = children[i];

				// if not already/converted to a tag, and is not just whitespace
				if (item.type === 'text' && !item.content.match(/^\s*$/)){

					children[i] = {
						name: 'mtphtagtext',
						type: 'tag',
						children: [item],
						voidElement: false
						//isPH: 1
					}

					/*console.log('Converted the test to an element', node, children, item, {
						name: 'mtphtagtext',
						type: 'tag',
						content: item.content,
						//voidElement: 1,
						//isPH: 1
					})*/
					//children[0].content = "\n"+children[0].content;
				}
			}


		},



		/****
		 * Functions need for AI integration
		 */


		// Format folder comments - port of PHP system
		eq_str: function($name){

			let eq_signs = 25 - name.length,
				eq_str = '';

			eq_signs = eq_signs > 0 ? eq_signs : 1;

			for (let x = eq_signs; x >= 0; x--) {
				eq_str+= '=';
			}

			return eq_str;
		},

		getCallbacks: function(c, level){
			return c.cbs[level] || [];
		},

		maybeLoopSelectors: function(c, section, sectionSlug, mq_key){
			if (c.cbs['selector']){
				Object.entries(section).forEach(([selectorSlug, selector]) => {

					if (selectorSlug !== 'this') {

						c.trail = TvrCom.get_js_object_data(
							[sectionSlug, selectorSlug], mq_key, false, true
						).levels;
						c.selector = selector;
						c.selector_key = selectorSlug;

						let isTargetSelector = c.targetSelector === selectorSlug;

						if (c.allSelectors || isTargetSelector ){
							c.cbs['selector'].forEach((cb => {
								cb.item.apply(this, ([
									c, section, sectionSlug, mq_key, selectorSlug, selector
								]))
							}));
						}
					}
				})
			}
		},

		// it's tricky to get MTloop working without other deps, so create a fresh loop function
		loopUiData: function(c, uiData, cur_mq_key){

			uiData = uiData || TvrUi.uiData;

			//console.log('loopUiData', uiData)
			
			let m_query = uiData.non_section.m_query,
				mq_keys = m_query ? Object.keys(m_query) : [];

			if (!c.existingCSS){
				c.existingCSS = '';
			} if (!c.recurse){
				c.recurse = {
					mq_key: 'all-devices',
				}
			}

			// loop the regular sections
			Object.entries(uiData).forEach(([sectionSlug, section]) => {

				if (sectionSlug !== 'non_section') {

					c.trail = [sectionSlug];
					c.section = section;
					c.section_key = sectionSlug;
					c.recurse.mq_key = 'all-devices';
					
					let isTargetSection = c.targetSection === sectionSlug;
					
					// Include folder if target folder, or we're including everything
					if (c.allSections || isTargetSection || (c.loadingSections && c.loadingSections[sectionSlug])){

						if (!cur_mq_key || cur_mq_key === 'all-devices'){

							TvrCom.getCallbacks(c, 'section').forEach((cb => {
								cb.item.apply(this, ([
									c, section, sectionSlug, 'all-devices'
								]))
							}));

							// loop selectors too if required
							TvrCom.maybeLoopSelectors(c, section, sectionSlug, 'all-devices');
						}

						// Also check for media query code - unless skipped
						if (!c.skipMediaQueries){

							mq_keys.forEach((mq_key) => {

								let mq_section = TvrCom.checkObject(m_query, [mq_key, sectionSlug]);

								c.trail = TvrCom.get_js_object_data([sectionSlug], mq_key, false, true).levels;

								if (mq_section && !cur_mq_key || cur_mq_key === mq_key){

									c.recurse.mq_key = mq_key;

									TvrCom.getCallbacks(c, 'mq').forEach((cb => {
										cb.item.apply(this, ([c, mq_section, sectionSlug, mq_key]))
									}));

									// loop selectors too if required
									TvrCom.maybeLoopSelectors(c, mq_section, sectionSlug, mq_key);

								}

							})
						}

					}
				}
				
			});

			return c;
		},

		// For storing data by the worker
		db: {
			dbInstance: null,
			isInitialized: false,

			/**
			 * Initialize the IndexedDB database if not already initialized.
			 * @param {string} dbName - The name of the database.
			 * @param {string} storeName - The name of the object store.
			 */
			async init(dbName = 'settingsDB', requiredStore = 'settings') {
				if (this.isInitialized && this.dbInstance?.objectStoreNames.contains(requiredStore)) {
					return;
				}

				return new Promise((resolve, reject) => {
					const checkAndOpen = (version) => {
						const request = indexedDB.open(dbName, version);

						request.onupgradeneeded = (event) => {
							const db = event.target.result;

							// Create store only if missing
							if (!db.objectStoreNames.contains(requiredStore)) {
								db.createObjectStore(requiredStore, { keyPath: 'id' });
							}
						};

						request.onsuccess = (event) => {
							this.dbInstance = event.target.result;
							this.isInitialized = true;
							resolve();
						};

						request.onerror = (event) => {
							console.error('IndexedDB initialization error:', event.target.error);
							reject(event.target.error);
						};
					};

					// First open with default version just to check current object stores
					const checkRequest = indexedDB.open(dbName);
					checkRequest.onsuccess = (event) => {
						const db = event.target.result;

						if (!db.objectStoreNames.contains(requiredStore)) {
							// Need to upgrade — bump version
							const newVersion = db.version + 1;
							db.close();
							checkAndOpen(newVersion);
						} else {
							this.dbInstance = db;
							this.isInitialized = true;
							resolve();
						}
					};

					checkRequest.onerror = (event) => {
						console.error('Error checking IndexedDB version:', event.target.error);
						reject(event.target.error);
					};
				});
			},
			/*async init(dbName = 'settingsDB', storeName = 'settings') {
				if (this.isInitialized) return;

				return new Promise((resolve, reject) => {
					const request = indexedDB.open(dbName, 1);

					request.onupgradeneeded = (event) => {
						const db = event.target.result;
						if (!db.objectStoreNames.contains(storeName)) {
							db.createObjectStore(storeName, { keyPath: 'id' });
						}
					};

					request.onsuccess = (event) => {
						this.dbInstance = event.target.result;
						this.isInitialized = true;
						resolve();
					};

					request.onerror = (event) => {
						console.error('IndexedDB initialization error:', event.target.error);
						reject(event.target.error);
					};
				});
			},*/

			/**
			 * Ensure the database is initialized before performing any operation.
			 */
			async ensureInitialized() {
				if (!this.isInitialized) {
					await this.init();
				}
			},

			/**
			 * Save or update data in the object store.
			 * @param {string} storeName - The name of the object store.
			 * @param {Object} data - The data to save (must include an `id` property).
			 */
			async save(storeName, data) {
				await this.ensureInitialized();

				return new Promise((resolve, reject) => {
					const transaction = this.dbInstance.transaction([storeName], 'readwrite');
					const store = transaction.objectStore(storeName);
					const request = store.put(data);

					request.onsuccess = () => resolve(data);
					request.onerror = (event) => {
						console.error('Error saving data:', event.target.error);
						reject(event.target.error);
					};
				});
			},

			/**
			 * Retrieve data by key from the object store.
			 * @param {string} storeName - The name of the object store.
			 * @param {string|number} key - The key of the data to retrieve.
			 */
			async get(storeName, key) {
				await this.ensureInitialized();

				return new Promise((resolve, reject) => {
					const transaction = this.dbInstance.transaction([storeName], 'readonly');
					const store = transaction.objectStore(storeName);
					const request = store.get(key);

					request.onsuccess = (event) => resolve(event.target.result);
					request.onerror = (event) => {
						console.error('Error retrieving data:', event.target.error);
						reject(event.target.error);
					};
				});
			},

			/**
			 * Delete data by key from the object store.
			 * @param {string} storeName - The name of the object store.
			 * @param {string|number} key - The key of the data to delete.
			 */
			async delete(storeName, key) {
				await this.ensureInitialized();

				return new Promise((resolve, reject) => {
					const transaction = this.dbInstance.transaction([storeName], 'readwrite');
					const store = transaction.objectStore(storeName);
					const request = store.delete(key);

					request.onsuccess = () => resolve(key);
					request.onerror = (event) => {
						console.error('Error deleting data:', event.target.error);
						reject(event.target.error);
					};
				});
			},

			/**
			 * Clear all data from the object store.
			 * @param {string} storeName - The name of the object store.
			 */
			async clear(storeName) {
				await this.ensureInitialized();

				return new Promise((resolve, reject) => {
					const transaction = this.dbInstance.transaction([storeName], 'readwrite');
					const store = transaction.objectStore(storeName);
					const request = store.clear();

					request.onsuccess = () => resolve();
					request.onerror = (event) => {
						console.error('Error clearing data:', event.target.error);
						reject(event.target.error);
					};
				});
			}
		},



	};

	return TvrCom;

})();



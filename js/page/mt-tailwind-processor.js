class TailwindManager {
	constructor(userConfig) {
		this.userConfig = userConfig;
		this.frontData = window.MTDynFrontData;
		this.data = this.frontData.tailwind;

		// Element and state properties
		this.staticStylesheet = document.getElementById('mt-tailwind-css') || document.getElementById('mt-tailwind-inline-css');
		this.siteWideElement = null; // We will create this in init()

		this.pageClassArray = this.data.classCache ? JSON.parse(this.data.classCache) : [];

		// State flags
		this.state = 'IDLE'; // Replaces multiple boolean flags with a single state machine
		this.cache = {}; // Overall cache reference from the JIT compiler

		// Debounce timer for AJAX calls
		this.updateQueueTimer = null;
	}

	/**
	 * Initializes the manager, loads the compiler, and sets up the environment.
	 */
	async init() {
		this.createDummyElement();
		await this.loadCompiler();
		this.setupTailwindConfig();
	}

	/**
	 * Creates a hidden span to which site-wide classes can be applied.
	 */
	createDummyElement() {
		this.siteWideElement = document.createElement('span');
		this.siteWideElement.id = 'mt-site-wide-tailwind';
		this.siteWideElement.style.display = 'none !important';
		document.body.appendChild(this.siteWideElement);
	}

	/**
	 * Loads the JIT compiler script dynamically.
	 * @returns {Promise<void>}
	 */
	loadCompiler() {
		return new Promise((resolve, reject) => {
			const processorScriptEl = document.getElementById('amender-script-tailwind-js');
			if (!processorScriptEl) {
				console.error('Tailwind Manager: Processor script element not found.');
				return reject(new Error('Processor script element not found.'));
			}

			const thisScriptSrc = processorScriptEl.getAttribute('src').split('?')[0];
			const compilerUrl = thisScriptSrc.replace('main', 'compiler');

			const script = document.createElement('script');
			script.src = `${compilerUrl}?v=3.3.3`;
			script.onload = () => {
				//console.log('Tailwind JIT compiler loaded.');
				resolve();
			};
			script.onerror = () => {
				//console.error('Tailwind Manager: Failed to load compiler script.');
				reject(new Error('Failed to load compiler script.'));
			};
			document.head.appendChild(script);
		});
	}

	/**
	 * Merges the user-provided config with the defaults and applies it.
	 */
	setupTailwindConfig() {
		// This check ensures we don't run before the compiler is ready.
		if (window.tailwind && window.tailwind.resolveConfig) {

			// STEP 1: Set the final configuration.
			//console.log('Setting up Tailwind configuration...');
			window.tailwind.config = window.tailwind.resolveConfig(this.userConfig);

			// STEP 2: Manually start the compiler's main loop and observer.
			if (typeof window.startTailwindJIT === 'function') {
				//console.log('Configuration is set. Starting Tailwind JIT process...');
				window.startTailwindJIT(); // <--- THIS IS THE CALL
			} else {
				//console.error('Tailwind JIT start function (window.startTailwindJIT) not found.');
			}

		} else {
			// If the compiler isn't ready, try again shortly. This is a failsafe.
			//console.log('Tailwind JIT not ready, retrying config setup...');
			setTimeout(() => this.setupTailwindConfig(), 50);
		}
	}

	/**
	 * Utility to escape HTML strings.
	 * @param {string} str The string to escape.
	 * @returns {string}
	 */
	escapeHTML(str) {
		if (!str) return str;
		return str
			.replace(/&[^(#\d+;|a-z+;)]/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	/**
	 * Checks if the set of classes on the page has changed.
	 * @returns {boolean}
	 */
	classesChanged() {
		const classArray = [];
		let i = 0;
		for (const key of this.cache.classCache.keys()) {
			if (i > 0) { // Skip the first key which is often a placeholder
				classArray.push(key);
			}
			i++;
		}
		const classString = JSON.stringify(classArray);

		if (this.data.classCache !== classString) {
			this.data.classCache = classString;
			this.pageClassArray = classArray;
			return true;
		}
		return false;
	}

	/**
	 * A callback function triggered by the JIT compiler when CSS is updated.
	 * This is the main entry point for your logic after a change.
	 * @param {string} cssStyles The newly generated CSS.
	 */
	cssStylesUpdated(cssStyles) {

		//console.log('Styles changed')

		// The JIT compiler gives us a reference to its internal caches.
		if (!this.cache.classCache) {
			this.cache = window.TvrMTTailwind.cache || {};
		}

		if (this.staticStylesheet) {
			this.staticStylesheet.remove();
			this.staticStylesheet = null;
		}

		switch (this.state) {
			case 'APPLYING_SITEWIDE':
				this.handleSitewideStylesUpdate(cssStyles);
				break;
			case 'RESETTING':
				this.state = 'IDLE'; // Reset state after action
				break;
			default:
				this.handlePageStylesUpdate(cssStyles);
				break;
		}


	}

	/**
	 * Handles the logic for saving new site-wide styles.
	 * @param {string} cssStyles
	 */
	async handleSitewideStylesUpdate(cssStyles) {

		const data = {
			tailwind_actions: '1',
			update_site_wide_styles: '1',
			site_wide_slug: 'site-wide',
			site_wide_styles: cssStyles
		};

		try {
			await this.postRequest(data);
			// console.log("Site-wide styles updated successfully.");
		} catch (error) {
			console.error('Failed to update site-wide styles:', error);
		}

		// clean
		let i = 0;
		for (const key of this.cache.classCache.keys()) {
			if (i > 0 && !this.pageClassArray.includes(key)) {
				this.cache.candidateRuleCache.delete(key);
				this.cache.classCache.delete(key);
			}
			i++;
		}

		this.state = 'RESETTING';
		this.siteWideElement.removeAttribute('class');
	}

	/**
	 * Sends a form-encoded POST request to the WordPress AJAX endpoint.
	 * @param {object} data The data object to send.
	 * @returns {Promise<Response>}
	 */
	postRequest(data) {

		// The 'action' key must be present for admin-ajax.php to work.
		data.action = 'mtui';

		//console.log('frontData', this.frontData, this.frontData.wp_ajax_url)

		// A nonce is critical for security.
		if (this.frontData.nonce) {
			data._wpnonce = this.frontData.nonce;
		}

		return fetch(this.frontData.wp_ajax_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams(data),
		});
	}

	/**
	 * Handles updates to page-specific styles and checks if site-wide styles need regeneration.
	 * @param {string} cssStyles
	 */
	handlePageStylesUpdate(cssStyles) {
		if (this.classesChanged()) {
			clearTimeout(this.updateQueueTimer);
			this.updateQueueTimer = setTimeout(async () => {
				const data = {
					tailwind_actions: '1',
					get_site_wide_classes: '1',
					update_single_page_styles: '1',
					single_page_slug: `${this.frontData.type}-${this.frontData.id}`,
					single_page_classes: this.data.classCache,
					single_page_styles: cssStyles,
					site_wide_slug: 'site-wide',
				};

				try {
					const response = await this.postRequest(data);
					const siteWideString = await response.text();

					//console.log('siteWideString', siteWideString)

					if (siteWideString !== this.data.siteWideCache) {
						this.data.siteWideCache = siteWideString;
						const siteWideObject = JSON.parse(siteWideString);
						const classString = this.escapeHTML(Object.keys(siteWideObject).join(' '));

						this.state = 'APPLYING_SITEWIDE';
						this.siteWideElement.setAttribute('class', classString);
					}
				} catch (error) {
					console.error('Failed to update page styles:', error);
				}
			}, 250);
		}
	}
}

export default TailwindManager;
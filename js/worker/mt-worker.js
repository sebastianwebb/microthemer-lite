// A generic worker that handles different tasks assigned to it

// dependencies
importScripts('./mt-main-and-worker.js?v=5', './beautify-html.min.js');

TVR_DEV_MODE = self.name && self.name.indexOf('TVR_DEV_MODE') === 0;
//console.log('New worker setup', self.name, TVR_DEV_MODE);

// wrap in self calling function just for syntax highlighting
(function(){

	// make syntax the same as mt-utilities so functions can be copied over more easily
	var TvrCom = MTMainAndWorker

	//console.log('we got TvrCom in the worker', TvrCom)

	// receive message from main thread
	onmessage = function(e) {

		var data = e.data,
			taskName = data.taskName;

		// bail if no task created yet
		if (!workerTasks[taskName]){

			postMessage({
				log: 'Task does not exist: '+taskName,
				success: false
			});

			return false;
		}

		// we're good, run task which will post message when complete
		TvrCom.startT('worker_task_'+taskName)

		// we might introduce delays for testing build up of tasks
		if (data.delay){
			setTimeout(function(){
				workerTasks[taskName](data, e);
				TvrCom.endT('worker_task_'+taskName, 1)
			}, data.delay);
		} else {
			workerTasks[taskName](data, e);
			TvrCom.endT('worker_task_'+taskName, 1)
		}

	}

	// make shorthand object references available to this function
	var workerTasks = {

		// we always pass back certain values so use a wrapper function
		postMessage: function(result, data){

			result.channel = data.channel;
			result.taskName = data.taskName;
			result.workerID = data.workerID;
			result.cb = data.cb;
			result.cb_failure = data.cb_failure;
			result.cb_complete = data.cb_complete;
			result.mainThreadData = data.mainThreadData;
			result.terminateOnCompletion = data.terminateOnCompletion;

			// Put arbitrary data that should come back and forth on passBack
			// - we don't send whole data back as it might be large sometimes
			result.passBack = data.passBack;

			postMessage(result);
		},

		// Simple callback to trigger worker scripts so it is cached in browser for faster subsequent spawning
		initWorkers: function(data, e){
			workerTasks.postMessage({
				log: 'Workers initiated',
			}, data);
		},

		// format the HTML pane content, stripping things and inserting pseudo elements
		formatHTML: function(data, e){

			//console.log('Message received from main script', data);

			workerTasks.postMessage({
				log: 'We will process the HTML',
				html: TvrCom.formatHTMLString(
					data.html, data.custom, data.hasPseudo, self.html_beautify, data.overlayParentIsAlt
				)
			}, data);
		},

		// Just beautify the HTML - for loading a snippet or following a copy and paste
		beautifyHTMLTask: function(data, e){

			//console.log('Message received from main script', data);

			workerTasks.postMessage({
				log: 'We will beautify the HTML',
				code: TvrCom.beautifyHTMLString(data.code),
				mode: data.mode,
				aspect: data.aspect,
				presentChoice: data.presentChoice,
				selectText: data.selectText,
				justReturn: data.justReturn
			}, data);
		},

		// handle AI tasks
		/*backupSettings: async function(data, key = 'pre_ai_backup'){

			let db = TvrCom.db,
				settings = data.settings;

			try {
				await db.init('themeover_db', 'ai_table');
				await db.save('ai_table', {
						id: 'pre_ai_backup',
						uiData: settings.uiData,
						snippets: settings.snippets,
						preferences: settings.preferences,
						//MTDynFrontData: settings.MTDynFrontData // I'm not sure what this does
					}
				);

				workerTasks.postMessage({
					log: 'We have backed up the user settings',
				}, data);

				//console.log('Database initialized');
			} catch (error) {
				//console.error('Failed to initialize database:', error);
			}
		},*/

		flattenToUrlParams: function(obj, prefix) {
			const str = [];

			for (const p in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, p)) {
					const k = prefix ? `${prefix}[${p}]` : p;
					const v = obj[p];

					if (typeof v === "object" && v !== null && !(v instanceof File) && !(v instanceof Blob)) {
						str.push(workerTasks.flattenToUrlParams(v, k));
					} else {
						str.push(encodeURIComponent(k) + "=" + encodeURIComponent(v == null ? '' : v));
					}
				}
			}

			return str.join("&");
		},

		ajaxFetch: async function(data, e) {

			let postBack = {};

			try {
				const options = {
					method: data.type || 'GET',
					headers: data.headers || {}
				};

				const method = options.method.toUpperCase();

				// Handle body for POST
				if (method === 'POST') {
					if (data.data instanceof FormData) {
						options.body = data.data;
					} else if (typeof data.data === 'string') {
						options.body = data.data;
						options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
					} else if (typeof data.data === 'object') {
						options.body = workerTasks.flattenToUrlParams(data.data);
						options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
					}
				}
					// Append GET params to URL
				// Append GET params to URL
				else if (method === 'GET' && data.data) {
					let queryString = '';

					if (typeof data.data === 'string') {
						queryString = data.data;
					} else if (typeof data.data === 'object') {
						queryString = workerTasks.flattenToUrlParams(data.data);
					}

					if (queryString) {
						const connector = data.url.includes('?') ? '&' : '?';
						data.url += connector + queryString;
					}
				}

				// AbortController for timeout
				const controller = new AbortController();
				options.signal = controller.signal;

				const timeout = data.timeout || 30000; // default 30s
				const timeoutId = setTimeout(() => controller.abort(), timeout);

				const response = await fetch(data.url, options);
				clearTimeout(timeoutId);

				let responseData;
				if (data.dataType === 'json') {
					responseData = await response.json();
				} else {
					responseData = await response.text();
				}

				/*if (data.cb) {


				}*/

				postBack = {
					success: true,
					responseData: responseData,
					status: response.status,
					statusText: response.statusText
				};

				// E.g. save the revision in indexedDB
				if (data.cb_ww){
					let method = data.cb_ww.funcName;
					if (workerTasks[method]){
						await workerTasks[method](data, responseData, postBack);
					}
				}

			} catch (err) {

				const isTimeout = err.name === 'AbortError';
				postBack = {
					failure: true,
					error: err.message,
					xhrSim: {
						status: 0,
						responseText: '',
						statusText: isTimeout ? 'timeout' : 'Network Error',
						errorThrown: err.message
					},
					textStatus: isTimeout ? 'timeout' : 'error'
				};
			}

			return postBack;
		},
		ajaxFetchTask: async function(data, e) {

			let postBack = await workerTasks.ajaxFetch(data, e);

			//console.log('ajaxFetchTask postBack', postBack)

			// We always trigger taskComplete, even if there is no callback to run
			workerTasks.postMessage(postBack, data);

		},

		// GeoLocation for faster AI responses
		getNearestAIRegionTask: async function(data, e) {
			const result = await workerTasks.ajaxFetch({
				url: 'https://ipinfo.io/json',
				dataType: 'json',
				headers: {
					'Accept': 'application/json'
				}
			}, e);

			if (!result.success || !result.responseData?.loc) {
				workerTasks.postMessage({
					log: 'Could not get location, default to US',
					region: 'us-central1',
					label: 'United States (Iowa)',
				}, data);
				return;
			}

			const [userLat, userLon] = result.responseData.loc.split(',').map(parseFloat);

			// bastyGeoTag (search project for this to find places to update)
			const regions = [
				{ region: "europe-north1", label: "Finland", lat: 60.1695, lng: 24.9354 },
				{ region: "europe-southwest1", label: "Spain (Madrid)", lat: 40.4168, lng: -3.7038 },
				{ region: "europe-west1", label: "Belgium", lat: 50.8503, lng: 4.3517 },
				{ region: "europe-west4", label: "Netherlands", lat: 52.3676, lng: 4.9041 },
				{ region: "europe-west8", label: "Italy (Milan)", lat: 45.4642, lng: 9.19 },
				{ region: "europe-west9", label: "France (Paris)", lat: 48.8566, lng: 2.3522 },
				{ region: "us-central1", label: "United States (Iowa)", lat: 41.2565, lng: -95.9345 },
				{ region: "us-east1", label: "United States (South Carolina)", lat: 33.8361, lng: -81.1637 },
				{ region: "us-east4", label: "United States (Virginia)", lat: 37.4316, lng: -78.6569 },
				{ region: "us-east5", label: "United States (Columbus)", lat: 39.9612, lng: -82.9988 },
				{ region: "us-south1", label: "United States (Dallas)", lat: 32.7767, lng: -96.797 },
				{ region: "us-west1", label: "United States (Oregon)", lat: 45.5231, lng: -122.6765 }
			];

			function haversine(lat1, lon1, lat2, lon2) {
				const R = 6371;
				const dLat = (lat2 - lat1) * Math.PI / 180;
				const dLon = (lon2 - lon1) * Math.PI / 180;
				const a = Math.sin(dLat / 2) ** 2 +
					Math.cos(lat1 * Math.PI / 180) *
					Math.cos(lat2 * Math.PI / 180) *
					Math.sin(dLon / 2) ** 2;
				return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			}

			let closest = null;
			let shortest = Infinity;
			for (const entry of regions) {
				const distance = haversine(userLat, userLon, entry.lat, entry.lng);
				if (distance < shortest) {
					shortest = distance;
					closest = entry;
				}
			}

			//console.log('country: ', result.responseData.country);

			workerTasks.postMessage({
				log: 'Found closest Gemini region',
				region: closest.region,
				label: closest.label,
				country: result.responseData.country
			}, data);
		},




		/*
		* Revision methods
		 */
		maxRevisions: 15,
		getRevisionIds: async function({ sortDesc = true } = {}) {
			try {
				let db = TvrCom.db;
				await db.init('themeover_db', 'revision_table');

				const tx = db.dbInstance.transaction('revision_table', 'readonly');
				const store = tx.objectStore('revision_table');
				const request = store.getAll();

				const revisions = await new Promise((resolve, reject) => {
					request.onsuccess = e => resolve(e.target.result);
					request.onerror = reject;
				});

				let result = revisions
					.filter(r => r.id)
					.map(r => ({ id: r.id }));

				if (sortDesc) {
					result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
				} else {
					result.sort((a, b) => parseInt(a.id) - parseInt(b.id));
				}

				return result;

			} catch (err) {
				console.error('getRevisionIds failed:', err);
				return [];
			}
		},
		pullRevisionsFromServer: async (data, e) => {
			try {
				const postBack = await workerTasks.ajaxFetch({
					url: data.ajaxUrl + '&copy_revision_locally&recent_revisions=' + (data.recent || 5),
					dataType: 'json',
				}, e);

				//console.log('pullRevisionsFromServer response', postBack)

				const revisions = postBack.responseData;
				if (revisions) {
					await workerTasks.saveRemoteRevisionsToIndexedDB(revisions);
				}
			} catch (err) {
				//console.error('pullRevisionsFromServer failed:', err);
			}
		},

		saveRemoteRevisionsToIndexedDB: async function(revisions) {

			if (!revisions || (Array.isArray(revisions) && revisions.length === 0)) {
				//console.log('revisions not in saveable format', revisions);
				return;
			}

			let db = TvrCom.db;
			await db.init('themeover_db', 'revision_table');

			if (!Array.isArray(revisions)) {
				revisions = [revisions];
			}

			// Reverse so oldest gets saved first (smallest timestamp first)
			revisions = revisions.slice().reverse();

			for (const revision of revisions) {
				if (revision.revision_id) {
					await db.save('revision_table', {
						id: `${revision.revision_id}`,
						revisionId: revision.revision_id,
						timestamp: Date.now(),
						user_action: revision.user_action,
						settings: revision.settings,
						snippets: revision.snippets,
						preferences: revision.preferences,
					});

					//console.log('Saved revision to indexedDB', revision.revision_id)
				}
			}

			// Cleanup old if needed
			//await workerTasks.cleanupOldRevisions(workerTasks.maxRevisions);
		},


		initRevisionStackTask: async (data, e) => {

			// If no revisions exist, pull 5 from the DB so undo is upportted on the first action
			const allRevisions = await workerTasks.getRevisionIds({ sortDesc: true });
			if (!allRevisions.length) {

				//console.log('no revisions in local DB, pull from server', allRevisions)

				// Pull and save revisions from server
				await workerTasks.pullRevisionsFromServer({
					ajaxUrl: data.ajaxUrl,
					recent: data.recent || 5
				}, e);
			} else {
				//console.log('We have local revisions', allRevisions)
			}

			const stack = await workerTasks.initRevisionStack(data);

			workerTasks.postMessage({
				log: 'Revision stack initialized from IndexedDB',
				stack
			}, data);
		},

		initRevisionStack: async (data) => {

			const stack = workerTasks.revision.stack;
			const allRevisions = await workerTasks.getRevisionIds({ sortDesc: true });

			if (!allRevisions.length) {
				stack.current = null;
				stack.undo = [];
				stack.redo = [];
				return;
			}

			// If a current_revision was passed, use that
			const current_id = String(data.current_revision || allRevisions[0].id);
			const currentIndex = allRevisions.findIndex(r => r.id == current_id);

			// Default to index 0 if not found
			stack.current = currentIndex >= 0 ? allRevisions[currentIndex].id : allRevisions[0].id;

			// ✅ Undo = revisions *after* current (older → newer), needs reverse
			stack.undo = allRevisions
				.slice(currentIndex + 1)
				.map(r => r.id)
				.reverse();

			// ✅ Redo = revisions *before* current (newer → older), leave as-is
			stack.redo = allRevisions
				.slice(0, currentIndex)
				.map(r => r.id);

			//console.log('data.current_revision passed to init', data.current_revision, 'current', current_id, 'index', currentIndex, allRevisions, stack)

			return stack;

			/*if (postBack) {
				workerTasks.postMessage({
					log: 'Revision stack initialized from IndexedDB',
					stack
				}, data);
			}*/
		},
		saveRevision: async function(data, responseData, postBack){

			const revision_id = responseData.revision_id,
				revision = responseData.revision;

			//console.log('saveRevision ran', data, responseData)

			if (revision_id && revision){

				try {

					let db = TvrCom.db;
					await db.init('themeover_db', 'revision_table');

					const revisionKey = `${revision_id}`; // revision_
					await db.save('revision_table', {
						id: revisionKey,
						revisionId: revision_id,
						timestamp: Date.now(),
						user_action: revision.user_action,
						settings: revision.settings,
						snippets: revision.snippets,
					});

					//console.log(`Revision ${revision_id} copied to IndexedDB successfully.`);

					// 💥 Delete revisions that were in the redo stack
					await workerTasks.deleteRevisionsByIds(workerTasks.revision.stack.redo);

					// Cleanup
					await workerTasks.cleanupOldRevisions(workerTasks.maxRevisions);

					// ✅ Rebuild the undo/redo stack from what's left
					await workerTasks.initRevisionStack({ current_revision: revision_id });

					// Add updated stack to return data for updating the UI
					postBack.stack = workerTasks.revision.stack;

					// Avoid passing large revision data back to the main thread,
					// it is not needed now that it has been saved in indexedDB
					delete responseData.revision;

				} catch (error) {
					console.error(`Error copying revision ${revision_id} to IndexedDB:`, error);
				}
			}
		},
		cleanupOldRevisions: async function(limit) {
			try {
				const allRevisions = await workerTasks.getRevisionIds({ sortDesc: true });
				const excess = allRevisions.slice(limit);

				for (const rev of excess) {
					await TvrCom.db.delete('revision_table', rev.id);
					//console.log(`Deleted old revision: ${rev.id}`);
				}
			} catch (err) {
				//console.error('Failed to clean up old revisions:', err);
			}
		},
		getRevisionStack: (data, e) => {
			workerTasks.postMessage({
				log: 'Returning current revision stack',
				stack: workerTasks.revision.stack
			}, data);
		},
		switchToRevisionFromStack: async function({ sourceStack, targetStack, actionLabel }, data) {

			const stack = workerTasks.revision.stack;

			if (stack[sourceStack].length === 0) {
				workerTasks.postMessage({
					log: `Nothing to ${actionLabel.toLowerCase()}`,
					failure: true
				}, data);
				return;
			}

			// Save the current before switching
			stack[targetStack].push(stack.current);
			stack.current = stack[sourceStack].pop();

			const db = TvrCom.db;
			await db.init('themeover_db', 'revision_table');
			const revision = await db.get('revision_table', stack.current);

			workerTasks.postMessage({
				log: `${actionLabel} to revision ${stack.current}`,
				revision,
				stack
			}, data);
		},
		undoRevision: async function(data, e) {
			await workerTasks.switchToRevisionFromStack({
				sourceStack: 'undo',
				targetStack: 'redo',
				actionLabel: 'Undo'
			}, data);
		},
		redoRevision: async function(data, e) {
			await workerTasks.switchToRevisionFromStack({
				sourceStack: 'redo',
				targetStack: 'undo',
				actionLabel: 'Redo'
			}, data);
		},

		// Restore a specific revision
		restoreRevisionById: async function(data, e) {

			const revision_id = data.revision_id;

			if (!revision_id) {
				workerTasks.postMessage({
					log: 'No revision_id provided for restore',
					failure: true
				}, data);
				return;
			}

			let revision = null;
			try {
				let db = TvrCom.db;
				await db.init('themeover_db', 'revision_table');
				revision = await db.get('revision_table', String(revision_id));
			} catch (err) {
				console.error('Error checking IndexedDB for revision:', err);
			}

			if (!revision) {
				// Not found locally -> Fetch from server
				//console.log(`Revision ${revision_id} not found locally, fetching from server...`);

				const postBack = await workerTasks.ajaxFetch({
					url: data.ajaxUrl + '&copy_revision_locally&revision_id=' + revision_id,
					dataType: 'json',
				}, e);

				const fetched = postBack.responseData;

				//console.log(`postBack from server`, postBack);

				if (fetched && fetched.revision_id) {

					await workerTasks.saveRemoteRevisionsToIndexedDB(fetched);

					// Fetch again
					let db = TvrCom.db;
					await db.init('themeover_db', 'revision_table');
					revision = await db.get('revision_table', String(fetched.revision_id));
				}
			}

			if (!revision) {
				workerTasks.postMessage({
					log: `Failed to restore revision ${revision_id}`,
					failure: true
				}, data);
				return;
			}

			// ✅ Recalculate stack using restored revision as current
			await workerTasks.initRevisionStack({ current_revision: revision_id });

			workerTasks.postMessage({
				log: `Restored revision ${revision_id}`,
				revision,
				stack: workerTasks.revision.stack
			}, data);
		},

		deleteRevisionsByIds: async function(ids = []) {
			if (!ids.length) return;

			try {
				let db = TvrCom.db;
				await db.init('themeover_db', 'revision_table');

				for (const id of ids) {
					await db.delete('revision_table', id);
					//console.log(`Deleted revision from redo stack: ${id}`);
				}
			} catch (err) {
				//console.error('Failed to delete revisions by ids:', err);
			}
		},


		// Revision management - state maintained by worker and posted to main thread when requested
		revision: {
			stack: {
				current: null,
				undo: [],
				redo: []
			}
		}



	};

})();
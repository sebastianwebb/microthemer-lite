// main.js

import TailwindManager from './mt-tailwind-processor.js';
import baseUserConfig from './mt-tailwind-default-config.js';

// --- DEEP MERGE UTILITY ---
// A robust function to merge configurations without destroying functions (unlike JSON.stringify)
const isObject = (item) => (item && typeof item === 'object' && !Array.isArray(item));

function deepMerge(target, ...sources) {
	const output = { ...target };
	for (const source of sources) {
		if (isObject(target) && isObject(source)) {
			for (const key in source) {
				if (isObject(source[key])) {
					if (!(key in target)) {
						Object.assign(output, { [key]: source[key] });
					} else {
						output[key] = deepMerge(target[key], source[key]);
					}
				} else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
					output[key] = [...target[key], ...source[key]];
				} else {
					Object.assign(output, { [key]: source[key] });
				}
			}
		}
	}
	return output;
}


// --- DYNAMIC MAPPING LOGIC ---

/**
 * Defines the mapping between the keys in `amenderThemeVars` and the keys
 * in Tailwind's `theme.extend` object.
 */
const WP_VARS_TO_TAILWIND_MAPPINGS = [
	{ sourceKey: 'colors',     targetKey: 'colors'     },
	{ sourceKey: 'fontFamily', targetKey: 'fontFamily' },
	{ sourceKey: 'fontSize',   targetKey: 'fontSize'   },
	{ sourceKey: 'spacing',    targetKey: 'spacing'    },
];

/**
 * Takes the global WordPress theme variables and maps them into a
 * configuration fragment suitable for merging with the main Tailwind config.
 *
 * @returns {object} A Tailwind config fragment with theme.extend populated.
 */
function createConfigFragmentFromWpVars() {
	const dynamicConfig = {
		theme: {
			extend: {},
		},
	};

	// Check if the global variable from PHP exists
	if (!window.amenderThemeVars) {
		return {}; // Return empty object if no vars are present
	}

	// Loop through our defined mappings
	for (const { sourceKey, targetKey } of WP_VARS_TO_TAILWIND_MAPPINGS) {
		const sourceData = window.amenderThemeVars[sourceKey];

		// If there's data for this category (e.g., colors exist)
		if (sourceData && Object.keys(sourceData).length > 0) {
			dynamicConfig.theme.extend[targetKey] = sourceData;
		}
	}

	return dynamicConfig;
}


// --- INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
	if (!window.MTDynFrontData) {
		console.error('Tailwind Manager: MTDynFrontData is not available. Aborting initialization.');
		return;
	}

	// 1. Create a config fragment from the dynamic WordPress variables.
	const dynamicConfig = createConfigFragmentFromWpVars();

	// 2. Create the final config by deep merging the base config with the dynamic fragment.
	const finalConfig = deepMerge(baseUserConfig, dynamicConfig);

	// 3. Instantiate the manager with the final, merged config.
	const manager = new TailwindManager(finalConfig);

	// 4. Attach the manager instance to the window for the JIT compiler callback.
	window.TvrMTTailwind = manager;

	// 5. Start the process.
	manager.init();
});
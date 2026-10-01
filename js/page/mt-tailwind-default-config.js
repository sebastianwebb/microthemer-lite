/**
 * User-editable Tailwind CSS Configuration.
 *
 * This file is imported by the main Tailwind manager.
 * You can edit the theme, add plugins, and customize Tailwind just like
 * you would in a standard `tailwind.config.js` file.
 */
const tailwindConfig = {
	content: [
		'./**/*.php',
	],
	corePlugins: {
		// Disable the default Preflight which includes opinionated element styles.
		preflight: false,
	},
	theme: {
		extend: {},
	},
	plugins: [
		// THIS IS THE FIX:
		// Directly use a plain function. The JIT compiler will correctly
		// execute this and pass in the necessary helpers like `addBase`.
		// No need for `plugin()` or `plugin.withOptions()`.
		function({ addBase }) {
			addBase({
				// The universal selector applies these variables everywhere.
				// Using `:where` keeps specificity at zero, so it never
				// accidentally overrides anything.
				':where(*, ::before, ::after)': {
					// Spacing
					'--tw-border-spacing-x': '0',
					'--tw-border-spacing-y': '0',
					// Transforms
					'--tw-translate-x': '0',
					'--tw-translate-y': '0',
					'--tw-rotate': '0',
					'--tw-skew-x': '0',
					'--tw-skew-y': '0',
					'--tw-scale-x': '1',
					'--tw-scale-y': '1',
					// Pan, Pinch, Scroll
					'--tw-pan-x': ' ',
					'--tw-pan-y': ' ',
					'--tw-pinch-zoom': ' ',
					'--tw-scroll-snap-strictness': 'proximity',
					// Gradients
					'--tw-gradient-from-position': ' ',
					'--tw-gradient-via-position': ' ',
					'--tw-gradient-to-position': ' ',
					// Font Variant Numerics
					'--tw-ordinal': ' ',
					'--tw-slashed-zero': ' ',
					'--tw-numeric-figure': ' ',
					'--tw-numeric-spacing': ' ',
					'--tw-numeric-fraction': ' ',
					// Rings
					'--tw-ring-inset': ' ',
					'--tw-ring-offset-width': '0px',
					'--tw-ring-offset-color': '#fff',
					'--tw-ring-color': 'rgb(59 130 246 / 0.5)',
					'--tw-ring-offset-shadow': '0 0 #0000',
					'--tw-ring-shadow': '0 0 #0000',
					// Shadows
					'--tw-shadow': '0 0 #0000',
					'--tw-shadow-colored': '0 0 #0000',
					// Filters
					'--tw-blur': ' ',
					'--tw-brightness': ' ',
					'--tw-contrast': ' ',
					'--tw-grayscale': ' ',
					'--tw-hue-rotate': ' ',
					'--tw-invert': ' ',
					'--tw-saturate': ' ',
					'--tw-sepia': ' ',
					'--tw-drop-shadow': ' ',
					// Backdrop Filters
					'--tw-backdrop-blur': ' ',
					'--tw-backdrop-brightness': ' ',
					'--tw-backdrop-contrast': ' ',
					'--tw-backdrop-grayscale': ' ',
					'--tw-backdrop-hue-rotate': ' ',
					'--tw-backdrop-invert': ' ',
					'--tw-backdrop-opacity': ' ',
					'--tw-backdrop-saturate': ' ',
					'--tw-backdrop-sepia': ' ',
				},
				// The ::before and ::after pseudo-elements need the --tw-content variable.
				':where(::before, ::after)': {
					'--tw-content': "''",
				},
			});
		},
	],
};

export default tailwindConfig;
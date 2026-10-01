// Script to trigger JS animation events defined by the user.
// Only loads if the user makes use of JS event triggers.
// Currently requires jQuery, see if that can be avoided later

/*!
MTWaypoints (no framework) - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
(function() {
	'use strict'

	var keyCounter = 0
	var allMTWaypoints = {}

	/* http://imakewebthings.com/waypoints/api/waypoint */
	function MTWaypoint(options) {
		if (!options) {
			throw new Error('No options passed to MTWaypoint constructor')
		}
		if (!options.element) {
			throw new Error('No element option passed to MTWaypoint constructor')
		}
		if (!options.handler) {
			throw new Error('No handler option passed to MTWaypoint constructor')
		}

		this.key = 'waypoint-' + keyCounter
		this.options = MTWaypoint.Adapter.extend({}, MTWaypoint.defaults, options)
		this.element = this.options.element
		this.adapter = new MTWaypoint.Adapter(this.element)
		this.callback = options.handler
		this.axis = this.options.horizontal ? 'horizontal' : 'vertical'
		this.enabled = this.options.enabled
		this.triggerPoint = null
		this.group = MTWaypoint.Group.findOrCreate({
			name: this.options.group,
			axis: this.axis
		})
		this.context = MTWaypoint.Context.findOrCreateByElement(this.options.context)

		if (MTWaypoint.offsetAliases[this.options.offset]) {
			this.options.offset = MTWaypoint.offsetAliases[this.options.offset]
		}
		this.group.add(this)
		this.context.add(this)
		allMTWaypoints[this.key] = this
		keyCounter += 1
	}

	/* Private */
	MTWaypoint.prototype.queueTrigger = function(direction) {
		this.group.queueTrigger(this, direction)
	}

	/* Private */
	MTWaypoint.prototype.trigger = function(args) {
		if (!this.enabled) {
			return
		}
		if (this.callback) {
			this.callback.apply(this, args)
		}
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/destroy */
	MTWaypoint.prototype.destroy = function() {
		this.context.remove(this)
		this.group.remove(this)
		delete allMTWaypoints[this.key]
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/disable */
	MTWaypoint.prototype.disable = function() {
		this.enabled = false
		return this
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/enable */
	MTWaypoint.prototype.enable = function() {
		this.context.refresh()
		this.enabled = true
		return this
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/next */
	MTWaypoint.prototype.next = function() {
		return this.group.next(this)
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/previous */
	MTWaypoint.prototype.previous = function() {
		return this.group.previous(this)
	}

	/* Private */
	MTWaypoint.invokeAll = function(method) {
		var allMTWaypointsArray = []
		for (var waypointKey in allMTWaypoints) {
			allMTWaypointsArray.push(allMTWaypoints[waypointKey])
		}
		for (var i = 0, end = allMTWaypointsArray.length; i < end; i++) {
			allMTWaypointsArray[i][method]()
		}
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/destroy-all */
	MTWaypoint.destroyAll = function() {
		MTWaypoint.invokeAll('destroy')
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/disable-all */
	MTWaypoint.disableAll = function() {
		MTWaypoint.invokeAll('disable')
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/enable-all */
	MTWaypoint.enableAll = function() {
		MTWaypoint.Context.refreshAll()
		for (var waypointKey in allMTWaypoints) {
			allMTWaypoints[waypointKey].enabled = true
		}
		return this
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/refresh-all */
	MTWaypoint.refreshAll = function() {
		MTWaypoint.Context.refreshAll()
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/viewport-height */
	MTWaypoint.viewportHeight = function() {
		return window.innerHeight || document.documentElement.clientHeight
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/viewport-width */
	MTWaypoint.viewportWidth = function() {
		return document.documentElement.clientWidth
	}

	MTWaypoint.adapters = []

	MTWaypoint.defaults = {
		context: window,
		continuous: true,
		enabled: true,
		group: 'default',
		horizontal: false,
		offset: 0
	}

	MTWaypoint.offsetAliases = {
		'bottom-in-view': function() {
			return this.context.innerHeight() - this.adapter.outerHeight()
		},
		'right-in-view': function() {
			return this.context.innerWidth() - this.adapter.outerWidth()
		}
	}

	window.MTWaypoint = MTWaypoint
}())
;(function() {
	'use strict'

	function requestAnimationFrameShim(callback) {
		window.setTimeout(callback, 1000 / 60)
	}

	var keyCounter = 0
	var contexts = {}
	var MTWaypoint = window.MTWaypoint
	var oldWindowLoad = window.onload

	/* http://imakewebthings.com/waypoints/api/context */
	function Context(element) {
		this.element = element
		this.Adapter = MTWaypoint.Adapter
		this.adapter = new this.Adapter(element)
		this.key = 'waypoint-context-' + keyCounter
		this.didScroll = false
		this.didResize = false
		this.oldScroll = {
			x: this.adapter.scrollLeft(),
			y: this.adapter.scrollTop()
		}
		this.waypoints = {
			vertical: {},
			horizontal: {}
		}

		element.waypointContextKey = this.key
		contexts[element.waypointContextKey] = this
		keyCounter += 1
		if (!MTWaypoint.windowContext) {
			MTWaypoint.windowContext = true
			MTWaypoint.windowContext = new Context(window)
		}

		this.createThrottledScrollHandler()
		this.createThrottledResizeHandler()
	}

	/* Private */
	Context.prototype.add = function(waypoint) {
		var axis = waypoint.options.horizontal ? 'horizontal' : 'vertical'
		this.waypoints[axis][waypoint.key] = waypoint
		this.refresh()
	}

	/* Private */
	Context.prototype.checkEmpty = function() {
		var horizontalEmpty = this.Adapter.isEmptyObject(this.waypoints.horizontal)
		var verticalEmpty = this.Adapter.isEmptyObject(this.waypoints.vertical)
		var isWindow = this.element == this.element.window
		if (horizontalEmpty && verticalEmpty && !isWindow) {
			this.adapter.off('.waypoints')
			delete contexts[this.key]
		}
	}

	/* Private */
	Context.prototype.createThrottledResizeHandler = function() {
		var self = this

		function resizeHandler() {
			self.handleResize()
			self.didResize = false
		}

		this.adapter.on('resize.waypoints', function() {
			if (!self.didResize) {
				self.didResize = true
				MTWaypoint.requestAnimationFrame(resizeHandler)
			}
		})
	}

	/* Private */
	Context.prototype.createThrottledScrollHandler = function() {
		var self = this
		function scrollHandler() {
			self.handleScroll()
			self.didScroll = false
		}

		this.adapter.on('scroll.waypoints', function() {
			if (!self.didScroll || MTWaypoint.isTouch) {
				self.didScroll = true
				MTWaypoint.requestAnimationFrame(scrollHandler)
			}
		})
	}

	/* Private */
	Context.prototype.handleResize = function() {
		MTWaypoint.Context.refreshAll()
	}

	/* Private */
	Context.prototype.handleScroll = function() {
		var triggeredGroups = {}
		var axes = {
			horizontal: {
				newScroll: this.adapter.scrollLeft(),
				oldScroll: this.oldScroll.x,
				forward: 'right',
				backward: 'left'
			},
			vertical: {
				newScroll: this.adapter.scrollTop(),
				oldScroll: this.oldScroll.y,
				forward: 'down',
				backward: 'up'
			}
		}

		for (var axisKey in axes) {
			var axis = axes[axisKey]
			var isForward = axis.newScroll > axis.oldScroll
			var direction = isForward ? axis.forward : axis.backward

			for (var waypointKey in this.waypoints[axisKey]) {
				var waypoint = this.waypoints[axisKey][waypointKey]
				if (waypoint.triggerPoint === null) {
					continue
				}
				var wasBeforeTriggerPoint = axis.oldScroll < waypoint.triggerPoint
				var nowAfterTriggerPoint = axis.newScroll >= waypoint.triggerPoint
				var crossedForward = wasBeforeTriggerPoint && nowAfterTriggerPoint
				var crossedBackward = !wasBeforeTriggerPoint && !nowAfterTriggerPoint
				if (crossedForward || crossedBackward) {
					waypoint.queueTrigger(direction)
					triggeredGroups[waypoint.group.id] = waypoint.group
				}
			}
		}

		for (var groupKey in triggeredGroups) {
			triggeredGroups[groupKey].flushTriggers()
		}

		this.oldScroll = {
			x: axes.horizontal.newScroll,
			y: axes.vertical.newScroll
		}
	}

	/* Private */
	Context.prototype.innerHeight = function() {
		/*eslint-disable eqeqeq */
		if (this.element == this.element.window) {
			return MTWaypoint.viewportHeight()
		}
		/*eslint-enable eqeqeq */
		return this.adapter.innerHeight()
	}

	/* Private */
	Context.prototype.remove = function(waypoint) {
		delete this.waypoints[waypoint.axis][waypoint.key]
		this.checkEmpty()
	}

	/* Private */
	Context.prototype.innerWidth = function() {
		/*eslint-disable eqeqeq */
		if (this.element == this.element.window) {
			return MTWaypoint.viewportWidth()
		}
		/*eslint-enable eqeqeq */
		return this.adapter.innerWidth()
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/context-destroy */
	Context.prototype.destroy = function() {
		var allMTWaypoints = []
		for (var axis in this.waypoints) {
			for (var waypointKey in this.waypoints[axis]) {
				allMTWaypoints.push(this.waypoints[axis][waypointKey])
			}
		}
		for (var i = 0, end = allMTWaypoints.length; i < end; i++) {
			allMTWaypoints[i].destroy()
		}
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/context-refresh */
	Context.prototype.refresh = function() {
		/*eslint-disable eqeqeq */
		var isWindow = this.element == this.element.window
		/*eslint-enable eqeqeq */
		var contextOffset = isWindow ? undefined : this.adapter.offset()
		var triggeredGroups = {}
		var axes

		this.handleScroll()
		axes = {
			horizontal: {
				contextOffset: isWindow ? 0 : contextOffset.left,
				contextScroll: isWindow ? 0 : this.oldScroll.x,
				contextDimension: this.innerWidth(),
				oldScroll: this.oldScroll.x,
				forward: 'right',
				backward: 'left',
				offsetProp: 'left'
			},
			vertical: {
				contextOffset: isWindow ? 0 : contextOffset.top,
				contextScroll: isWindow ? 0 : this.oldScroll.y,
				contextDimension: this.innerHeight(),
				oldScroll: this.oldScroll.y,
				forward: 'down',
				backward: 'up',
				offsetProp: 'top'
			}
		}

		for (var axisKey in axes) {
			var axis = axes[axisKey]
			for (var waypointKey in this.waypoints[axisKey]) {
				var waypoint = this.waypoints[axisKey][waypointKey]
				var adjustment = waypoint.options.offset
				var oldTriggerPoint = waypoint.triggerPoint
				var elementOffset = 0
				var freshMTWaypoint = oldTriggerPoint == null
				var contextModifier, wasBeforeScroll, nowAfterScroll
				var triggeredBackward, triggeredForward

				if (waypoint.element !== waypoint.element.window) {
					elementOffset = waypoint.adapter.offset()[axis.offsetProp]
				}

				if (typeof adjustment === 'function') {
					adjustment = adjustment.apply(waypoint)
				}
				else if (typeof adjustment === 'string') {
					adjustment = parseFloat(adjustment)
					if (waypoint.options.offset.indexOf('%') > - 1) {
						adjustment = Math.ceil(axis.contextDimension * adjustment / 100)
					}
				}

				contextModifier = axis.contextScroll - axis.contextOffset
				waypoint.triggerPoint = Math.floor(elementOffset + contextModifier - adjustment)
				wasBeforeScroll = oldTriggerPoint < axis.oldScroll
				nowAfterScroll = waypoint.triggerPoint >= axis.oldScroll
				triggeredBackward = wasBeforeScroll && nowAfterScroll
				triggeredForward = !wasBeforeScroll && !nowAfterScroll

				if (!freshMTWaypoint && triggeredBackward) {
					waypoint.queueTrigger(axis.backward)
					triggeredGroups[waypoint.group.id] = waypoint.group
				}
				else if (!freshMTWaypoint && triggeredForward) {
					waypoint.queueTrigger(axis.forward)
					triggeredGroups[waypoint.group.id] = waypoint.group
				}
				else if (freshMTWaypoint && axis.oldScroll >= waypoint.triggerPoint) {
					waypoint.queueTrigger(axis.forward)
					triggeredGroups[waypoint.group.id] = waypoint.group
				}
			}
		}

		MTWaypoint.requestAnimationFrame(function() {
			for (var groupKey in triggeredGroups) {
				triggeredGroups[groupKey].flushTriggers()
			}
		})

		return this
	}

	/* Private */
	Context.findOrCreateByElement = function(element) {
		return Context.findByElement(element) || new Context(element)
	}

	/* Private */
	Context.refreshAll = function() {
		for (var contextId in contexts) {
			contexts[contextId].refresh()
		}
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/context-find-by-element */
	Context.findByElement = function(element) {
		return contexts[element.waypointContextKey]
	}

	window.onload = function() {
		if (oldWindowLoad) {
			oldWindowLoad()
		}
		Context.refreshAll()
	}


	MTWaypoint.requestAnimationFrame = function(callback) {
		var requestFn = window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			requestAnimationFrameShim
		requestFn.call(window, callback)
	}
	MTWaypoint.Context = Context
}())
;(function() {
	'use strict'

	function byTriggerPoint(a, b) {
		return a.triggerPoint - b.triggerPoint
	}

	function byReverseTriggerPoint(a, b) {
		return b.triggerPoint - a.triggerPoint
	}

	var groups = {
		vertical: {},
		horizontal: {}
	}
	var MTWaypoint = window.MTWaypoint

	/* http://imakewebthings.com/waypoints/api/group */
	function Group(options) {
		this.name = options.name
		this.axis = options.axis
		this.id = this.name + '-' + this.axis
		this.waypoints = []
		this.clearTriggerQueues()
		groups[this.axis][this.name] = this
	}

	/* Private */
	Group.prototype.add = function(waypoint) {
		this.waypoints.push(waypoint)
	}

	/* Private */
	Group.prototype.clearTriggerQueues = function() {
		this.triggerQueues = {
			up: [],
			down: [],
			left: [],
			right: []
		}
	}

	/* Private */
	Group.prototype.flushTriggers = function() {
		for (var direction in this.triggerQueues) {
			var waypoints = this.triggerQueues[direction]
			var reverse = direction === 'up' || direction === 'left'
			waypoints.sort(reverse ? byReverseTriggerPoint : byTriggerPoint)
			for (var i = 0, end = waypoints.length; i < end; i += 1) {
				var waypoint = waypoints[i]
				if (waypoint.options.continuous || i === waypoints.length - 1) {
					waypoint.trigger([direction])
				}
			}
		}
		this.clearTriggerQueues()
	}

	/* Private */
	Group.prototype.next = function(waypoint) {
		this.waypoints.sort(byTriggerPoint)
		var index = MTWaypoint.Adapter.inArray(waypoint, this.waypoints)
		var isLast = index === this.waypoints.length - 1
		return isLast ? null : this.waypoints[index + 1]
	}

	/* Private */
	Group.prototype.previous = function(waypoint) {
		this.waypoints.sort(byTriggerPoint)
		var index = MTWaypoint.Adapter.inArray(waypoint, this.waypoints)
		return index ? this.waypoints[index - 1] : null
	}

	/* Private */
	Group.prototype.queueTrigger = function(waypoint, direction) {
		this.triggerQueues[direction].push(waypoint)
	}

	/* Private */
	Group.prototype.remove = function(waypoint) {
		var index = MTWaypoint.Adapter.inArray(waypoint, this.waypoints)
		if (index > -1) {
			this.waypoints.splice(index, 1)
		}
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/first */
	Group.prototype.first = function() {
		return this.waypoints[0]
	}

	/* Public */
	/* http://imakewebthings.com/waypoints/api/last */
	Group.prototype.last = function() {
		return this.waypoints[this.waypoints.length - 1]
	}

	/* Private */
	Group.findOrCreate = function(options) {
		return groups[options.axis][options.name] || new Group(options)
	}

	MTWaypoint.Group = Group
}())
;(function() {
	'use strict'

	var MTWaypoint = window.MTWaypoint

	function isWindow(element) {
		return element === element.window
	}

	function getWindow(element) {
		if (isWindow(element)) {
			return element
		}
		return element.defaultView
	}

	function NoFrameworkAdapter(element) {
		this.element = element
		this.handlers = {}
	}

	NoFrameworkAdapter.prototype.innerHeight = function() {
		var isWin = isWindow(this.element)
		return isWin ? this.element.innerHeight : this.element.clientHeight
	}

	NoFrameworkAdapter.prototype.innerWidth = function() {
		var isWin = isWindow(this.element)
		return isWin ? this.element.innerWidth : this.element.clientWidth
	}

	NoFrameworkAdapter.prototype.off = function(event, handler) {
		function removeListeners(element, listeners, handler) {
			for (var i = 0, end = listeners.length - 1; i < end; i++) {
				var listener = listeners[i]
				if (!handler || handler === listener) {
					element.removeEventListener(listener)
				}
			}
		}

		var eventParts = event.split('.')
		var eventType = eventParts[0]
		var namespace = eventParts[1]
		var element = this.element

		if (namespace && this.handlers[namespace] && eventType) {
			removeListeners(element, this.handlers[namespace][eventType], handler)
			this.handlers[namespace][eventType] = []
		}
		else if (eventType) {
			for (var ns in this.handlers) {
				removeListeners(element, this.handlers[ns][eventType] || [], handler)
				this.handlers[ns][eventType] = []
			}
		}
		else if (namespace && this.handlers[namespace]) {
			for (var type in this.handlers[namespace]) {
				removeListeners(element, this.handlers[namespace][type], handler)
			}
			this.handlers[namespace] = {}
		}
	}

	/* Adapted from jQuery 1.x offset() */
	NoFrameworkAdapter.prototype.offset = function() {
		if (!this.element.ownerDocument) {
			return null
		}

		var documentElement = this.element.ownerDocument.documentElement
		var win = getWindow(this.element.ownerDocument)
		var rect = {
			top: 0,
			left: 0
		}

		if (this.element.getBoundingClientRect) {
			rect = this.element.getBoundingClientRect()
		}

        //=sebcuss Fix for error when deactivating elementor that I don't fully understand
		if (win === null){
            win = window;
        }

		return {
			top: rect.top + win.pageYOffset - documentElement.clientTop,
			left: rect.left + win.pageXOffset - documentElement.clientLeft
		}
	}

	NoFrameworkAdapter.prototype.on = function(event, handler) {
		var eventParts = event.split('.')
		var eventType = eventParts[0]
		var namespace = eventParts[1] || '__default'
		var nsHandlers = this.handlers[namespace] = this.handlers[namespace] || {}
		var nsTypeList = nsHandlers[eventType] = nsHandlers[eventType] || []

		nsTypeList.push(handler)
		this.element.addEventListener(eventType, handler)
	}

	NoFrameworkAdapter.prototype.outerHeight = function(includeMargin) {
		var height = this.innerHeight()
		var computedStyle

		if (includeMargin && !isWindow(this.element)) {
			computedStyle = window.getComputedStyle(this.element)
			height += parseInt(computedStyle.marginTop, 10)
			height += parseInt(computedStyle.marginBottom, 10)
		}

		return height
	}

	NoFrameworkAdapter.prototype.outerWidth = function(includeMargin) {
		var width = this.innerWidth()
		var computedStyle

		if (includeMargin && !isWindow(this.element)) {
			computedStyle = window.getComputedStyle(this.element)
			width += parseInt(computedStyle.marginLeft, 10)
			width += parseInt(computedStyle.marginRight, 10)
		}

		return width
	}

	NoFrameworkAdapter.prototype.scrollLeft = function() {
		var win = getWindow(this.element)
		return win ? win.pageXOffset : this.element.scrollLeft
	}

	NoFrameworkAdapter.prototype.scrollTop = function() {
		var win = getWindow(this.element)
		return win ? win.pageYOffset : this.element.scrollTop
	}

	NoFrameworkAdapter.extend = function() {
		var args = Array.prototype.slice.call(arguments)

		function merge(target, obj) {
			if (typeof target === 'object' && typeof obj === 'object') {
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						target[key] = obj[key]
					}
				}
			}

			return target
		}

		for (var i = 1, end = args.length; i < end; i++) {
			merge(args[0], args[i])
		}
		return args[0]
	}

	NoFrameworkAdapter.inArray = function(element, array, i) {
		return array == null ? -1 : array.indexOf(element, i)
	}

	NoFrameworkAdapter.isEmptyObject = function(obj) {
		/* eslint no-unused-vars: 0 */
		for (var name in obj) {
			return false
		}
		return true
	}

	MTWaypoint.adapters.push({
		name: 'noframework',
		Adapter: NoFrameworkAdapter
	})
	MTWaypoint.Adapter = NoFrameworkAdapter
}())
;(function() {
	'use strict'

	function noop() {}

	var MTWaypoint = window.MTWaypoint

	/* http://imakewebthings.com/waypoints/shortcuts/inview */
	function Inview(options) {
		this.options = MTWaypoint.Adapter.extend({}, Inview.defaults, options)
		this.axis = this.options.horizontal ? 'horizontal' : 'vertical'
		this.waypoints = []
		this.element = this.options.element
		this.createMTWaypoints()
	}

	/* Private */
	Inview.prototype.createMTWaypoints = function() {
		var configs = {
			vertical: [{
				down: 'enter',
				up: 'exited',
				offset: '100%'
			}, {
				down: 'entered',
				up: 'exit',
				offset: 'bottom-in-view'
			}, {
				down: 'exit',
				up: 'entered',
				offset: 0
			}, {
				down: 'exited',
				up: 'enter',
				offset: function() {
					return -this.adapter.outerHeight()
				}
			}],
			horizontal: [{
				right: 'enter',
				left: 'exited',
				offset: '100%'
			}, {
				right: 'entered',
				left: 'exit',
				offset: 'right-in-view'
			}, {
				right: 'exit',
				left: 'entered',
				offset: 0
			}, {
				right: 'exited',
				left: 'enter',
				offset: function() {
					return -this.adapter.outerWidth()
				}
			}]
		}

		for (var i = 0, end = configs[this.axis].length; i < end; i++) {
			var config = configs[this.axis][i]
			this.createMTWaypoint(config)
		}
	}

	/* Private */
	Inview.prototype.createMTWaypoint = function(config) {
		var self = this
		this.waypoints.push(new MTWaypoint({
			context: this.options.context,
			element: this.options.element,
			enabled: this.options.enabled,
			handler: (function(config) {
				return function(direction) {
					self.options[config[direction]].call(self, direction)
				}
			}(config)),
			offset: config.offset,
			horizontal: this.options.horizontal
		}))
	}

	/* Public */
	Inview.prototype.destroy = function() {
		for (var i = 0, end = this.waypoints.length; i < end; i++) {
			this.waypoints[i].destroy()
		}
		this.waypoints = []
	}

	Inview.prototype.disable = function() {
		for (var i = 0, end = this.waypoints.length; i < end; i++) {
			this.waypoints[i].disable()
		}
	}

	Inview.prototype.enable = function() {
		for (var i = 0, end = this.waypoints.length; i < end; i++) {
			this.waypoints[i].enable()
		}
	}

	Inview.defaults = {
		context: window,
		enabled: true,
		enter: noop,
		entered: noop,
		exit: noop,
		exited: noop
	}

	MTWaypoint.Inview = Inview
}());


// MT code
jQuery(document).ready(function($){

	// main object
	var MT_Events_Manager = (function(){

        // Check for MT parent window
		var MTWindow = false;
        if (window.top.TvrMT){
            MTWindow = window.top;
        } else if (window.parent.TvrMT){
            MTWindow = window.parent;
        } else if (window.parent.parent && window.parent.parent.TvrMT){
            MTWindow = window.parent.parent
        }
		var TvrMT = MTWindow ? MTWindow.TvrMT : {};

		// private vars and methods
        var defaultEventObj = {
                click: false,
                inview: false,
                inview_once: false,
                mouseenter: false,
                focus: false
            };

		// public vars and methods
		var MT_Events_Manager = {

			isInsideMT: MTWindow,
			data: {},
			boundEls: $.extend({}, true, defaultEventObj),
			targetEls: $.extend({}, true, defaultEventObj),

			customEvents:[], // keep track of custom (media query specific) click events
			eventClasses: [], // keep track of event classes

            // check if a media query applies to the page
            isTargetingMode: function(){
                return MT_Events_Manager.isInsideMT;
            },
			// check if a media query applies to the page
			mediaMatches: function(query){
				return window.matchMedia(query).matches;
			},
            isDomEl: function($obj){
                return $obj && $obj.prop && $obj.prop('tagName');
            },
			// todo run filter on :in-range, :out-of-range, :invalid, :valid fo better pseudo support
			jquery_compat: function(code){
				try {
					var $elements = $(code);
					// selector was successful
					return $elements;
				} catch(err) {
					// we have a jQuery selector error
					return false;
				}
			},

			// resolve active target e.g. triggering el / all event target els / dom relative target els
			resolve_active_target: function(eventObj, $el, $target_els){

				// if no target specified, triggering el is also target el
                if (!eventObj.target){
					return $el;
				}

				// if no dom relative syntax specified, return all targets els
                else if (!eventObj.relative_dom){
				    return $target_els;
                }

                // traverse dom using dom relative info
                else {

                    for (var i = 0; i < eventObj.relative_dom.length; i++) {
                        var traverse = eventObj.relative_dom[i];
                        switch(traverse.directive) {
                            case 'parent':
                                $el = $el.parent(traverse.selector);
                                break;
                            case 'parents':
                                $el = $el.parents(traverse.selector);
                                break;
                            case 'closest':
                                $el = $el.closest(traverse.selector);
                                break;
                            case 'children':
                                $el = $el.children(traverse.selector);
                                break;
                            case 'find':
                                $el = $el.find(traverse.selector);
                                break;
                            case 'next':
                                $el = $el.next(traverse.selector);
                                break;
                            case 'prev':
                                $el = $el.prev(traverse.selector);
                                break;
                            case 'siblings':
                                $el = $el.siblings(traverse.selector);
                                break;
                        }
                    }



                    // MT_Events_Manager.update_cached_els('targetEls', event, $target_els);

                    if (!MT_Events_Manager.isDomEl($el)){
                        return $target_els;
                    } else {
                        // add to target els for cleaning
                        MT_Events_Manager.update_cached_els('targetEls', eventObj.event, $el);
                        return $el;
                    }

                    // default to $target_els if no valid el(s) found
                    //return MT_Events_Manager.isDomEl($el) ? $el : $target_els;
                }
			},

            // update bound or targets els for a given event - appending if els already set
            update_cached_els: function(cache, event, $el_or_els){

			    // if no els added yet, add
			    if (!MT_Events_Manager[cache][event]){
                    MT_Events_Manager[cache][event] = $el_or_els;
                }

                // else some els added, append additional els
                else {
                    MT_Events_Manager[cache][event] = $(MT_Events_Manager[cache][event]).add($el_or_els);
                }
            },

			// apply animation or transition
			apply_effect: function(event_config){
            	
            	//console.log('do we apply effect?', event_config);

                // if media query conditions met
				if (!event_config.eventObj.mq || window.matchMedia(event_config.eventObj.mq).matches){

                    var $active_target = MT_Events_Manager.resolve_active_target(
                        event_config.eventObj,
                        event_config.$el,
                        event_config.$target_els
                    );

                     //   event_config.active_target;

                    // temp remove class before adding if already present
                    if ($active_target.hasClass(event_config.evt_class)){
                        $active_target.removeClass(event_config.evt_class);

                        // if transition, bail after removing class following 2nd click
                        if (event_config.eventObj.type === 'transition'){
                            return false;
                        }

                    }

                    // add class after triggering animation frame
                    window.requestAnimationFrame(function(time) {
                        window.requestAnimationFrame(function (time) {
                            $active_target.addClass(event_config.evt_class);
                        });
                    });

                    //if (event_config.eventObj.type != 'transition'){
                    MT_Events_Manager.after_animation($active_target, {
                        type: event_config.eventObj.type,
                        args: [event_config],
                        cb: function(event_config){

                            // unbind event if should only happen once
                            if (event_config.event == 'inview_once'){
                                event_config.waypoint.destroy();
                            }
                        }
                    });

                    // for transition, the class should be removed on opposite event e.g. mouseleave, blur
                    if (event_config.eventObj.type === 'transition'){
                        var oppositeEvent = false;
                        switch(event_config.event) {
                            case 'mouseenter':
                                oppositeEvent = 'mouseleave';
                                break;
                            case 'focus':
                                oppositeEvent = 'blur';
                                break;
                        }
                        
                        if (oppositeEvent){
                            event_config.$el.on(oppositeEvent, null, event_config, function(e){
                                $active_target.removeClass(event_config.evt_class);
                            });
						}
                        
                    }


                }




			},
			// run JS function after CSS3 animation or transition finishes
			after_animation: function($el, config){

				var events = config.type === 'transition'
					? 'transitionend.tvr webkitTransitionEnd.tvr oTransitionEnd.tvr otransitionend.tvr MSTransitionEnd.tvr'
					: 'oanimationend.tvr animationend.tvr webkitAnimationEnd.tvr';

				$el.on(events, function() {

					config.cb.apply(this, config.args);

					// unbind
					$el.off(events);

					/*
					Note: we don't remove the event class after animation so animation-fill-mode: forwards works.
					The downside is that when changing screen width, if media query event-specific animations override
					the name, the animation will be triggered even though the event (e.g. click) doesn't happen.
					I've decided this is better than preventing animation-fill-mode: forwards from working because it's
					an MT usability issue rather than an obstruction to the desired outcome for site visitors
					 */

				});
			},
			refresh_event_binding: function(){

				//console.log('event bindings refreshed', MT_Events_Manager);

				// if we have animation events
				if (window.MT_Events_Data && MT_Events_Data === Object(MT_Events_Data)){

					//console.log(console.log('window.MT_Events_Data', window.MT_Events_Data));

				    // destroy all waypoint instances that may exist
					MTWaypoint.destroyAll();

					// remove any left over classes and bound events
					var $all_target_els = $(),
						all_custom_events = MT_Events_Manager.customEvents.join(' ');

					for (var evt in MT_Events_Manager.boundEls){
						if ( ! MT_Events_Manager.boundEls.hasOwnProperty(evt) ) continue; // for compat
						var $evt_els = MT_Events_Manager.boundEls[evt],
							$target_els = MT_Events_Manager.targetEls[evt];

						// if we have bound els
						if ($evt_els){

							// unbind any custom events
							if (evt !== 'inview' && evt !== 'inview_once'){
								$evt_els.off( all_custom_events );
							}
						}

						// append target els to full collection
						if ($target_els){
							$all_target_els = $all_target_els.add($target_els);
						}
					}

					// remove any dynamic event classes
					$all_target_els.removeClass(MT_Events_Manager.eventClasses.join(' '));

                    // reset bound and target els
                    MT_Events_Manager.boundEls = $.extend({}, true, defaultEventObj);
                    MT_Events_Manager.targetEls = $.extend({}, true, defaultEventObj);

					//console.log('latest anim data', data)

					// loop though event types
					var data = MT_Events_Data;
					for (var event in data){
						if ( ! data.hasOwnProperty(event) ) continue; // for compat

						// loop through selectors for event
						var eventSelectors = data[event];
						for (var i = 0; i < eventSelectors.length; i++) {

							var eventObj = eventSelectors[i];

							//eventObj.event = event; // added in c.active_events now

							// loop through each element in the selection
							var $elements = MT_Events_Manager.jquery_compat(eventObj.code),
								$target_els = eventObj.target
									? MT_Events_Manager.jquery_compat(eventObj.target) : $elements,
								evt_class = event === 'focus' ? 'mt-js_'+event : 'mt-'+event,
								custom_event = event+'.tvr-'+eventObj.mqKey;

							// cache elements for unbinding
                            MT_Events_Manager.update_cached_els('boundEls', event, $elements);

                            // cache target elements for  removing classes
                            if (!eventObj.relative_dom){
                                MT_Events_Manager.update_cached_els('targetEls', event, $target_els);
                            }

							// cache custom classes used
							if ($.inArray(evt_class, MT_Events_Manager.eventClasses) < 0){
								MT_Events_Manager.eventClasses.push(evt_class);
							}

							// cache media query-specific js events for unbinding
							if (event !== 'inview' && event !== 'inview_once' &&
								$.inArray(custom_event, MT_Events_Manager.customEvents) < 0){
								MT_Events_Manager.customEvents.push(custom_event);
							}

							if ($elements){
								$elements.each(function(index){

									var $el = $(this),
										el = $el[0],
										event_config = {
											$el: $el,
                                            $target_els:$target_els,
											event: event,
											evt_class: evt_class,
											custom_event: custom_event,
											eventObj: eventObj
										};

									//console.log('each el', event_config, event, $el, $target_els, eventObj);

									// bind relevant events to elements
									switch(event) {
										case 'click':
										case 'mouseenter':
										case 'focus':
											$el.on(custom_event, null, event_config, function(e){

											    // prevent event from bubbling up (if not click in targeting mode)
												if (event_config.event !== 'click' ||
                                                    !MT_Events_Manager.isTargetingMode()){
                                                    e.stopPropagation();

                                                    /*
                                                    * Note, an alternative could be checking e.target == this
                                                    * but child els triggering parent events feels useful more often
                                                    * than not, so keeping this as the default behaviour (tentatively)
                                                    * */
												}

												MT_Events_Manager.apply_effect(event_config);
											});
											break;

										case 'inview':
										case 'inview_once':
										var waypoint = new MTWaypoint.Inview({
											element: el,
											group:event,

                                            // so off-page waypoint doesn't fire handler
											enabled: false,

											// mt custom options
											mt: event_config,
											enter: function(direction) {
												this.options.mt.waypoint = this;
												MT_Events_Manager.apply_effect(this.options.mt);
                                                //console.log('Enter triggered with direction ' + direction)
											},
											exit: function(direction) {

											    var mt = this.options.mt;

												// for playing again if once not specified
												if (mt.eventObj.type === 'transition' && mt.event !== 'inview_once'){

                                                    var $active_target = MT_Events_Manager.resolve_active_target(
                                                        mt.eventObj,
                                                        mt.$el,
                                                        mt.$target_els
                                                    );

                                                    $active_target.removeClass(mt.evt_class);
												}
											}
										});

										// re-enable after a little delay so off-page els don't fire handle
										// the need for a timer isn't documented, but the issue is discussed here:
										// https://github.com/imakewebthings/waypoints/issues/355
										// todo review follow up suggestion to set overflow:auto in waypoints
										/*setTimeout(function(){
											waypoint.enable();
										}, 250);*/

                                        // BUG: above timer mehtod meant in-view didn't trigger on body load
										waypoint.enable();

										break;
									}


								});
							}




						}
					}

				}

			}

		};

		return MT_Events_Manager;

	})();

	MT_Events_Manager.refresh_event_binding();

	window.MT_Events_Manager = MT_Events_Manager;

});
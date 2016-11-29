(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var selectbox_1 = require("./selectbox");
var AudioQualitySelectBox = (function (_super) {
    __extends(AudioQualitySelectBox, _super);
    function AudioQualitySelectBox(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
    }
    AudioQualitySelectBox.prototype.configure = function (player, uimanager) {
        var self = this;
        var updateAudioQualities = function () {
            var audioQualities = player.getAvailableAudioQualities();
            self.clearItems();
            // Add entry for automatic quality switching (default setting)
            self.addItem("auto", "auto");
            // Add audio qualities
            for (var _i = 0, audioQualities_1 = audioQualities; _i < audioQualities_1.length; _i++) {
                var audioQuality = audioQualities_1[_i];
                self.addItem(audioQuality.id, audioQuality.label);
            }
        };
        self.onItemSelected.subscribe(function (sender, value) {
            player.setAudioQuality(value);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, updateAudioQualities); // Update qualities when audio track has changed
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateAudioQualities); // Update qualities when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateAudioQualities); // Update qualities when a new source is loaded
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_DOWNLOAD_QUALITY_CHANGE, function () {
            var data = player.getDownloadedAudioData();
            self.selectItem(data.isAuto ? "auto" : data.id);
        }); // Update quality selection when quality is changed (from outside)
        // Populate qualities at startup
        updateAudioQualities();
    };
    return AudioQualitySelectBox;
}(selectbox_1.SelectBox));
exports.AudioQualitySelectBox = AudioQualitySelectBox;
},{"./selectbox":19}],2:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var selectbox_1 = require("./selectbox");
var AudioTrackSelectBox = (function (_super) {
    __extends(AudioTrackSelectBox, _super);
    function AudioTrackSelectBox(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
    }
    AudioTrackSelectBox.prototype.configure = function (player, uimanager) {
        var self = this;
        var updateAudioTracks = function () {
            var audioTracks = player.getAvailableAudio();
            self.clearItems();
            // Add audio tracks
            for (var _i = 0, audioTracks_1 = audioTracks; _i < audioTracks_1.length; _i++) {
                var audioTrack = audioTracks_1[_i];
                self.addItem(audioTrack.id, audioTrack.label);
            }
        };
        self.onItemSelected.subscribe(function (sender, value) {
            player.setAudio(value);
        });
        var audioTrackHandler = function () {
            var currentAudioTrack = player.getAudio();
            self.selectItem(currentAudioTrack.id);
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, audioTrackHandler); // Update selection when selected track has changed
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateAudioTracks); // Update tracks when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateAudioTracks); // Update tracks when a new source is loaded
        // Populate tracks at startup
        updateAudioTracks();
    };
    return AudioTrackSelectBox;
}(selectbox_1.SelectBox));
exports.AudioTrackSelectBox = AudioTrackSelectBox;
},{"./selectbox":19}],3:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("./component");
var dom_1 = require("../dom");
var eventdispatcher_1 = require("../eventdispatcher");
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(config) {
        _super.call(this, config);
        this.buttonEvents = {
            onClick: new eventdispatcher_1.EventDispatcher()
        };
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-button'
        }, this.config);
    }
    Button.prototype.toDomElement = function () {
        var buttonElement = new dom_1.DOM('button', {
            'type': 'button',
            'id': this.config.id,
            'class': this.getCssClasses()
        }).append(new dom_1.DOM('span', {
            'class': 'label'
        }).html(this.config.text));
        var self = this;
        buttonElement.on('click', function () {
            self.onClickEvent();
        });
        return buttonElement;
    };
    Button.prototype.onClickEvent = function () {
        this.buttonEvents.onClick.dispatch(this);
    };
    Object.defineProperty(Button.prototype, "onClick", {
        get: function () {
            return this.buttonEvents.onClick;
        },
        enumerable: true,
        configurable: true
    });
    return Button;
}(component_1.Component));
exports.Button = Button;
},{"../dom":33,"../eventdispatcher":34,"./component":6}],4:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var label_1 = require("./label");
var CastStatusOverlay = (function (_super) {
    __extends(CastStatusOverlay, _super);
    function CastStatusOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.statusLabel = new label_1.Label({ cssClass: 'ui-cast-status-label' });
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-cast-status-overlay',
            components: [this.statusLabel],
            hidden: true
        }, this.config);
    }
    CastStatusOverlay.prototype.configure = function (player, uimanager) {
        var self = this;
        var castDeviceName = "unknown";
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_START, function (event) {
            // Show Cast status when a session is being started
            self.show();
            self.statusLabel.setText("Select a Cast device");
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_WAITING_FOR_DEVICE, function (event) {
            // Get device name and update status text while connecting
            castDeviceName = event.castPayload.deviceName;
            self.statusLabel.setText("Connecting to <strong>" + castDeviceName + "</strong>...");
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_LAUNCHED, function (event) {
            // Session is started or resumed
            // For cases when a session is resumed, we do not receive the previous events and therefore show the status panel here too
            self.show();
            self.statusLabel.setText("Playing on <strong>" + castDeviceName + "</strong>");
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOP, function (event) {
            // Cast session gone, hide the status panel
            self.hide();
        });
    };
    return CastStatusOverlay;
}(container_1.Container));
exports.CastStatusOverlay = CastStatusOverlay;
},{"./container":7,"./label":12}],5:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var togglebutton_1 = require("./togglebutton");
var CastToggleButton = (function (_super) {
    __extends(CastToggleButton, _super);
    function CastToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-casttogglebutton',
            text: 'Google Cast'
        }, this.config);
    }
    CastToggleButton.prototype.configure = function (player, uimanager) {
        var self = this;
        self.onClick.subscribe(function () {
            if (player.isCastAvailable()) {
                if (player.isCasting()) {
                    player.castStop();
                }
                else {
                    player.castVideo();
                }
            }
            else {
                console.log("Cast unavailable");
            }
        });
        var castAvailableHander = function () {
            if (player.isCastAvailable()) {
                self.show();
            }
            else {
                self.hide();
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_AVAILABLE, castAvailableHander);
        // Hide button if Cast not available
        castAvailableHander();
    };
    return CastToggleButton;
}(togglebutton_1.ToggleButton));
exports.CastToggleButton = CastToggleButton;
},{"./togglebutton":25}],6:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var guid_1 = require("../guid");
var dom_1 = require("../dom");
var eventdispatcher_1 = require("../eventdispatcher");
/**
 * The base class of the UI framework.
 * Each component must extend this class and optionally the config interface.
 */
var Component = (function () {
    /**
     * Constructs a component with an optionally supplied config. All subclasses must call the constructor of their
     * superclass and then merge their configuration into the component's configuration.
     * @param config the configuration for the component
     */
    function Component(config) {
        if (config === void 0) { config = {}; }
        /**
         * The list of events that this component offers. These events should always be private and only directly
         * accessed from within the implementing component.
         *
         * Because TypeScript does not support private properties with the same name on different class hierarchy levels
         * (i.e. superclass and subclass cannot contain a private property with the same name), the default naming
         * convention for the event list of a component that should be followed by subclasses is the concatenation of the
         * camel-cased class name + "Events" (e.g. SubClass extends Component => subClassEvents).
         * See {@link #componentEvents} for an example.
         *
         * Event properties should be named in camel case with an "on" prefix and in the present tense. Async events may
         * have a start event (when the operation starts) in the present tense, and must have an end event (when the
         * operation ends) in the past tense (or present tense in special cases (e.g. onStart/onStarted or onPlay/onPlaying).
         * See {@link #componentEvents#onShow} for an example.
         *
         * Each event should be accompanied with a protected method named by the convention eventName + "Event"
         * (e.g. onStartEvent), that actually triggers the event by calling {@link EventDispatcher#dispatch dispatch} and
         * passing a reference to the component as first parameter. Components should always trigger their events with these
         * methods. Implementing this pattern gives subclasses means to directly listen to the events by overriding the
         * method (and saving the overhead of passing a handler to the event dispatcher) and more importantly to trigger
         * these events without having access to the private event list.
         * See {@link #onShow} for an example.
         *
         * To provide external code the possibility to listen to this component's events (subscribe, unsubscribe, etc.),
         * each event should also be accompanied by a public getter function with the same name as the event's property,
         * that returns the {@link Event} obtained from the event dispatcher by calling {@link EventDispatcher#getEvent}.
         * See {@link #onShow} for an example.
         *
         * Full example for an event representing an example action in a example component:
         *
         * <code>
         * // Define an example component class with an example event
         * class ExampleComponent extends Component<ComponentConfig> {
         *
         *     private exampleComponentEvents = {
         *         onExampleAction: new EventDispatcher<ExampleComponent, NoArgs>()
         *     }
         *
         *     // constructor and other stuff...
         *
         *     protected onExampleActionEvent() {
         *        this.exampleComponentEvents.onExampleAction.dispatch(this);
         *    }
         *
         *    get onExampleAction(): Event<ExampleComponent, NoArgs> {
         *        return this.exampleComponentEvents.onExampleAction.getEvent();
         *    }
         * }
         *
         * // Create an instance of the component somewhere
         * var exampleComponentInstance = new ExampleComponent();
         *
         * // Subscribe to the example event on the component
         * exampleComponentInstance.onExampleAction.subscribe(function (sender: ExampleComponent) {
         *     console.log("onExampleAction of " + sender + " has fired!");
         * });
         * </code>
         */
        this.componentEvents = {
            onShow: new eventdispatcher_1.EventDispatcher(),
            onHide: new eventdispatcher_1.EventDispatcher()
        };
        console.log(this);
        console.log(config);
        // Create the configuration for this component
        this.config = this.mergeConfig(config, {
            tag: 'div',
            id: 'ui-id-' + guid_1.Guid.next(),
            cssClass: 'ui-component',
            cssClasses: [],
            hidden: false
        }, {});
    }
    /**
     * Initializes the component, e.g. by applying config settings.
     * This method must not be called from outside the UI framework.
     *
     * This method is automatically called by the {@link UIManager}. If the component is an inner component of
     * some component, and thus encapsulated abd managed internally and never directly exposed to the UIManager,
     * this method must be called from the managing component's {@link #initialize} method.
     */
    Component.prototype.initialize = function () {
        this.hidden = this.config.hidden;
        // Hide the component at initialization if it is configured to be hidden
        if (this.isHidden()) {
            this.hide();
        }
    };
    /**
     * Configures the component for the supplied Player and UIManager. This is the place where all the magic happens,
     * where components typically subscribe and react to events (on their DOM element, the Player, or the UIManager),
     * and basically everything that makes them interactive.
     * This method is called only once, when the UIManager initializes the UI.
     *
     * Subclasses usually overwrite this method to add their own functionality.
     *
     * @param player the player which this component controls
     * @param uimanager the UIManager that manages this component
     */
    Component.prototype.configure = function (player, uimanager) {
        // nothing to do here; overwrite in subclasses
    };
    /**
     * Generate the DOM element for this component.
     *
     * Subclasses usually overwrite this method to extend or replace the DOM element with their own design.
     */
    Component.prototype.toDomElement = function () {
        var element = new dom_1.DOM(this.config.tag, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });
        return element;
    };
    /**
     * Returns the DOM element of this component. Creates the DOM element if it does not yet exist.
     *
     * Should not be overwritten by subclasses.
     *
     * @returns {DOM}
     */
    Component.prototype.getDomElement = function () {
        if (!this.element) {
            this.element = this.toDomElement();
        }
        return this.element;
    };
    /**
     * Merges a configuration with a default configuration and a base configuration from the superclass.
     *
     * @param config the configuration settings for the components, as usually passed to the constructor
     * @param defaults a default configuration for settings that are not passed with the configuration
     * @param base configuration inherited from a superclass
     * @returns {Config}
     */
    Component.prototype.mergeConfig = function (config, defaults, base) {
        // Extend default config with supplied config
        var merged = Object.assign({}, base, defaults, config);
        // Return the extended config
        return merged;
    };
    /**
     * Helper method that returns a string of all CSS classes of the component.
     *
     * @returns {string}
     */
    Component.prototype.getCssClasses = function () {
        // Merge all CSS classes into single array
        var flattenedArray = [this.config.cssClass].concat(this.config.cssClasses);
        // Join array values into a string
        var flattenedString = flattenedArray.join(' ');
        // Return trimmed string to prevent whitespace at the end from the join operation
        return flattenedString.trim();
    };
    /**
     * Returns the configuration object of the component.
     * @returns {Config}
     */
    Component.prototype.getConfig = function () {
        return this.config;
    };
    /**
     * Hides the component.
     * This method basically transfers the component into the hidden state. Actual hiding is done via CSS.
     */
    Component.prototype.hide = function () {
        this.hidden = true;
        this.getDomElement().addClass(Component.CLASS_HIDDEN);
        this.onHideEvent();
    };
    /**
     * Shows the component.
     */
    Component.prototype.show = function () {
        this.getDomElement().removeClass(Component.CLASS_HIDDEN);
        this.hidden = false;
        this.onShowEvent();
    };
    /**
     * Determines if the component is hidden.
     * @returns {boolean} true if the component is hidden, else false
     */
    Component.prototype.isHidden = function () {
        return this.hidden;
    };
    /**
     * Determines if the component is shown.
     * @returns {boolean} true if the component is visible, else false
     */
    Component.prototype.isShown = function () {
        return !this.isHidden();
    };
    /**
     * Toggles the hidden state by hiding the component if it is shown, or showing it if hidden.
     */
    Component.prototype.toggleHidden = function () {
        if (this.isHidden()) {
            this.show();
        }
        else {
            this.hide();
        }
    };
    /**
     * Fires the onShow event.
     * See the detailed explanation on event architecture onj the {@link #componentEvents events list}.
     */
    Component.prototype.onShowEvent = function () {
        this.componentEvents.onShow.dispatch(this);
    };
    /**
     * Fires the onHide event.
     * See the detailed explanation on event architecture onj the {@link #componentEvents events list}.
     */
    Component.prototype.onHideEvent = function () {
        this.componentEvents.onHide.dispatch(this);
    };
    Object.defineProperty(Component.prototype, "onShow", {
        /**
         * Gets the event that is fired when the component is showing.
         * See the detailed explanation on event architecture onj the {@link #componentEvents events list}.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.componentEvents.onShow.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Component.prototype, "onHide", {
        /**
         * Gets the event that is fired when the component is hiding.
         * See the detailed explanation on event architecture onj the {@link #componentEvents events list}.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.componentEvents.onHide.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The classname that is attached to the element when it is in the hidden state.
     * @type {string}
     */
    Component.CLASS_HIDDEN = "hidden";
    return Component;
}());
exports.Component = Component;
},{"../dom":33,"../eventdispatcher":34,"../guid":35}],7:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("./component");
var dom_1 = require("../dom");
var utils_1 = require("../utils");
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-container',
            components: []
        }, this.config);
    }
    /**
     * Adds a child component to the container.
     * @param component
     */
    Container.prototype.addComponent = function (component) {
        this.config.components.push(component);
    };
    /**
     * Removes a child component from the container.
     * @param component
     */
    Container.prototype.removeComponent = function (component) {
        utils_1.ArrayUtils.remove(this.config.components, component);
    };
    /**
     * Gets an array of all child components in this container.
     * @returns {Component<ComponentConfig>[]}
     */
    Container.prototype.getComponents = function () {
        return this.config.components;
    };
    Container.prototype.updateComponents = function () {
        this.innerContainerElement.empty();
        for (var _i = 0, _a = this.config.components; _i < _a.length; _i++) {
            var component = _a[_i];
            this.innerContainerElement.append(component.getDomElement());
        }
    };
    Container.prototype.toDomElement = function () {
        var containerElement = new dom_1.DOM(this.config.tag, {
            'id': this.config.id,
            'class': this.getCssClasses()
        });
        var innerContainer = new dom_1.DOM(this.config.tag, {
            'class': 'container-wrapper'
        });
        this.innerContainerElement = innerContainer;
        this.updateComponents();
        containerElement.append(innerContainer);
        return containerElement;
    };
    return Container;
}(component_1.Component));
exports.Container = Container;
},{"../dom":33,"../utils":39,"./component":6}],8:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var timeout_1 = require("../timeout");
var ControlBar = (function (_super) {
    __extends(ControlBar, _super);
    function ControlBar(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-controlbar',
            hidden: true,
            hideDelay: 5000
        }, this.config);
    }
    ControlBar.prototype.configure = function (player, uimanager) {
        var self = this;
        var isSeeking = false;
        var timeout = new timeout_1.Timeout(self.getConfig().hideDelay, function () {
            self.hide();
        });
        uimanager.onMouseEnter.subscribe(function (sender, args) {
            self.show(); // show control bar when the mouse enters the UI
            timeout.clear(); // Clear timeout to avoid hiding the control bar if the mouse moves back into the UI during the timeout period
        });
        uimanager.onMouseMove.subscribe(function (sender, args) {
            if (self.isHidden()) {
                self.show();
            }
            if (isSeeking) {
                // Don't create/update timeout while seeking
                return;
            }
            timeout.reset(); // hide the control bar if mouse does not move during the timeout time
        });
        uimanager.onMouseLeave.subscribe(function (sender, args) {
            if (isSeeking) {
                // Don't create/update timeout while seeking
                return;
            }
            timeout.reset(); // hide control bar some time after the mouse left the UI
        });
        uimanager.onSeek.subscribe(function () {
            timeout.clear(); // Don't hide control bar while a seek is in progress
            isSeeking = true;
        });
        uimanager.onSeeked.subscribe(function () {
            isSeeking = false;
            timeout.start(); // hide control bar some time after a seek has finished
        });
    };
    return ControlBar;
}(container_1.Container));
exports.ControlBar = ControlBar;
},{"../timeout":37,"./container":7}],9:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var label_1 = require("./label");
var ErrorMessageOverlay = (function (_super) {
    __extends(ErrorMessageOverlay, _super);
    function ErrorMessageOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.errorLabel = new label_1.Label({ cssClass: 'ui-errormessage-label' });
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-errormessage-overlay',
            components: [this.errorLabel],
            hidden: true
        }, this.config);
    }
    ErrorMessageOverlay.prototype.configure = function (player, uimanager) {
        var self = this;
        player.addEventHandler(bitmovin.player.EVENT.ON_ERROR, function (event) {
            self.errorLabel.setText(event.message);
            self.show();
        });
    };
    return ErrorMessageOverlay;
}(container_1.Container));
exports.ErrorMessageOverlay = ErrorMessageOverlay;
},{"./container":7,"./label":12}],10:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var togglebutton_1 = require("./togglebutton");
var FullscreenToggleButton = (function (_super) {
    __extends(FullscreenToggleButton, _super);
    function FullscreenToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-fullscreentogglebutton',
            text: 'Fullscreen'
        }, this.config);
    }
    FullscreenToggleButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var fullscreenStateHandler = function () {
            if (player.isFullscreen()) {
                self.on();
            }
            else {
                self.off();
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_ENTER, fullscreenStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_EXIT, fullscreenStateHandler);
        self.onClick.subscribe(function () {
            if (player.isFullscreen()) {
                player.exitFullscreen();
            }
            else {
                player.enterFullscreen();
            }
        });
    };
    return FullscreenToggleButton;
}(togglebutton_1.ToggleButton));
exports.FullscreenToggleButton = FullscreenToggleButton;
},{"./togglebutton":25}],11:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var playbacktogglebutton_1 = require("./playbacktogglebutton");
var dom_1 = require("../dom");
var HugePlaybackToggleButton = (function (_super) {
    __extends(HugePlaybackToggleButton, _super);
    function HugePlaybackToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-hugeplaybacktogglebutton',
            text: 'Play/Pause'
        }, this.config);
    }
    HugePlaybackToggleButton.prototype.configure = function (player, uimanager) {
        // Update button state through API events
        _super.prototype.configure.call(this, player, uimanager, false);
        var self = this;
        var togglePlayback = function () {
            if (player.isPlaying()) {
                player.pause();
            }
            else {
                player.play();
            }
        };
        var toggleFullscreen = function () {
            if (player.isFullscreen()) {
                player.exitFullscreen();
            }
            else {
                player.enterFullscreen();
            }
        };
        var clickTime = 0;
        var doubleClickTime = 0;
        /*
         * YouTube-style toggle button handling
         *
         * The goal is to prevent a short pause or playback interval between a click, that toggles playback, and a
         * double click, that toggles fullscreen. In this naive approach, the first click would e.g. start playback,
         * the second click would be detected as double click and toggle to fullscreen, and as second normal click stop
         * playback, which results is a short playback interval with max length of the double click detection
         * period (usually 500ms).
         *
         * To solve this issue, we defer handling of the first click for 200ms, which is almost unnoticeable to the user,
         * and just toggle playback if no second click (double click) has been registered during this period. If a double
         * click is registered, we just toggle the fullscreen. In the first 200ms, undesired playback changes thus cannot
         * happen. If a double click is registered within 500ms, we undo the playback change and switch fullscreen mode.
         * In the end, this method basically introduces a 200ms observing interval in which playback changes are prevented
         * if a double click happens.
         */
        self.onClick.subscribe(function () {
            var now = Date.now();
            if (now - clickTime < 200) {
                // We have a double click inside the 200ms interval, just toggle fullscreen mode
                toggleFullscreen();
                doubleClickTime = now;
                return;
            }
            else if (now - clickTime < 500) {
                // We have a double click inside the 500ms interval, undo playback toggle and toggle fullscreen mode
                toggleFullscreen();
                togglePlayback();
                doubleClickTime = now;
                return;
            }
            clickTime = now;
            setTimeout(function () {
                if (Date.now() - doubleClickTime > 200) {
                    // No double click detected, so we toggle playback and wait what happens next
                    togglePlayback();
                }
            }, 200);
        });
        // Hide the huge playback button during VR playback to let mouse events pass through and navigate the VR viewport
        self.onToggle.subscribe(function () {
            if (player.getVRStatus().contentType != 'none') {
                if (player.isPlaying()) {
                    self.hide();
                }
                else {
                    self.show();
                }
            }
        });
        // Hide button while initializing a Cast session
        var castInitializationHandler = function (event) {
            if (event.type == bitmovin.player.EVENT.ON_CAST_START) {
                // Hide button when session is being initialized
                self.hide();
            }
            else {
                // Show button when session is established or initialization was aborted
                self.show();
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_START, castInitializationHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_LAUNCHED, castInitializationHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOP, castInitializationHandler);
    };
    HugePlaybackToggleButton.prototype.toDomElement = function () {
        var buttonElement = _super.prototype.toDomElement.call(this);
        // Add child that contains the play button image
        // Setting the image directly on the button does not work together with scaling animations, because the button
        // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
        // to the size if the image, it can scale inside the player without overshooting.
        buttonElement.append(new dom_1.DOM('div', {
            'class': 'image'
        }));
        return buttonElement;
    };
    return HugePlaybackToggleButton;
}(playbacktogglebutton_1.PlaybackToggleButton));
exports.HugePlaybackToggleButton = HugePlaybackToggleButton;
},{"../dom":33,"./playbacktogglebutton":15}],12:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("./component");
var dom_1 = require("../dom");
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-label'
        }, this.config);
    }
    Label.prototype.toDomElement = function () {
        var labelElement = new dom_1.DOM('span', {
            'id': this.config.id,
            'class': this.getCssClasses()
        }).html(this.config.text);
        return labelElement;
    };
    Label.prototype.setText = function (text) {
        this.getDomElement().html(text);
    };
    return Label;
}(component_1.Component));
exports.Label = Label;
},{"../dom":33,"./component":6}],13:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("./component");
var eventdispatcher_1 = require("../eventdispatcher");
var ListSelector = (function (_super) {
    __extends(ListSelector, _super);
    function ListSelector(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.listSelectorEvents = {
            onItemAdded: new eventdispatcher_1.EventDispatcher(),
            onItemRemoved: new eventdispatcher_1.EventDispatcher(),
            onItemSelected: new eventdispatcher_1.EventDispatcher()
        };
        this.config = this.mergeConfig(config, {
            items: {},
            cssClass: 'ui-listselector'
        }, this.config);
        this.items = this.config.items;
    }
    ListSelector.prototype.hasItem = function (value) {
        return this.items[value] != null;
    };
    ListSelector.prototype.addItem = function (value, label) {
        this.items[value] = label;
        this.onItemAddedEvent(value);
    };
    ListSelector.prototype.removeItem = function (value) {
        if (this.hasItem(value)) {
            delete this.items[value];
            this.onItemRemovedEvent(value);
            return true;
        }
        return false;
    };
    ListSelector.prototype.selectItem = function (value) {
        if (value == this.selectedItem) {
            // itemConfig is already selected, suppress any further action
            return true;
        }
        if (this.items[value] != null) {
            this.selectedItem = value;
            this.onItemSelectedEvent(value);
            return true;
        }
        return false;
    };
    ListSelector.prototype.getSelectedItem = function () {
        return this.selectedItem;
    };
    ListSelector.prototype.clearItems = function () {
        var items = this.items; // local copy for iteration after clear
        this.items = {}; // clear items
        // fire events
        for (var value in items) {
            this.onItemRemovedEvent(value);
        }
    };
    ListSelector.prototype.itemCount = function () {
        return Object.keys(this.items).length;
    };
    ListSelector.prototype.onItemAddedEvent = function (value) {
        this.listSelectorEvents.onItemAdded.dispatch(this, value);
    };
    ListSelector.prototype.onItemRemovedEvent = function (value) {
        this.listSelectorEvents.onItemRemoved.dispatch(this, value);
    };
    ListSelector.prototype.onItemSelectedEvent = function (value) {
        this.listSelectorEvents.onItemSelected.dispatch(this, value);
    };
    Object.defineProperty(ListSelector.prototype, "onItemAdded", {
        get: function () {
            return this.listSelectorEvents.onItemAdded.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListSelector.prototype, "onItemRemoved", {
        get: function () {
            return this.listSelectorEvents.onItemRemoved.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListSelector.prototype, "onItemSelected", {
        get: function () {
            return this.listSelectorEvents.onItemSelected.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    return ListSelector;
}(component_1.Component));
exports.ListSelector = ListSelector;
},{"../eventdispatcher":34,"./component":6}],14:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var label_1 = require("./label");
var utils_1 = require("../utils");
/**
 * A label that display the current playback time and the total time through {@link PlaybackTimeLabel#setTime setTime}
 * or any string through {@link PlaybackTimeLabel#setText setText}.
 */
var PlaybackTimeLabel = (function (_super) {
    __extends(PlaybackTimeLabel, _super);
    function PlaybackTimeLabel(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
    }
    PlaybackTimeLabel.prototype.configure = function (player, uimanager) {
        var self = this;
        var playbackTimeHandler = function () {
            if (player.getDuration() == Infinity) {
                self.setText('Live');
            }
            else {
                self.setTime(player.getCurrentTime(), player.getDuration());
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, playbackTimeHandler);
        // Init time display (when the UI is initialized, it's too late for the ON_READY event)
        playbackTimeHandler();
    };
    PlaybackTimeLabel.prototype.setTime = function (playbackSeconds, durationSeconds) {
        this.setText(utils_1.StringUtils.secondsToTime(playbackSeconds) + " / " + utils_1.StringUtils.secondsToTime(durationSeconds));
    };
    return PlaybackTimeLabel;
}(label_1.Label));
exports.PlaybackTimeLabel = PlaybackTimeLabel;
},{"../utils":39,"./label":12}],15:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var togglebutton_1 = require("./togglebutton");
var PlaybackToggleButton = (function (_super) {
    __extends(PlaybackToggleButton, _super);
    function PlaybackToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-playbacktogglebutton',
            text: 'Play/Pause'
        }, this.config);
    }
    PlaybackToggleButton.prototype.configure = function (player, uimanager, handleClickEvent) {
        if (handleClickEvent === void 0) { handleClickEvent = true; }
        var self = this;
        var isSeeking = false;
        // Handler to update button state based on player state
        var playbackStateHandler = function (event) {
            // If the UI is currently seeking, playback is temporarily stopped but the buttons should
            // not reflect that and stay as-is (e.g indicate playback while seeking).
            if (isSeeking) {
                return;
            }
            // TODO replace this hack with a sole player.isPlaying() call once issue #1203 is fixed
            var isPlaying = player.isPlaying();
            if (player.isCasting() &&
                (event.type == bitmovin.player.EVENT.ON_PLAY || event.type == bitmovin.player.EVENT.ON_PLAY
                    || event.type == bitmovin.player.EVENT.ON_CAST_PLAYING || event.type == bitmovin.player.EVENT.ON_CAST_PAUSE)) {
                isPlaying = !isPlaying;
            }
            if (isPlaying) {
                self.on();
            }
            else {
                self.off();
            }
        };
        // Call handler upon these events
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_PAUSE, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, playbackStateHandler); // when playback finishes, player turns to paused mode
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_LAUNCHED, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PLAYING, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PAUSE, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PLAYBACK_FINISHED, playbackStateHandler);
        if (handleClickEvent) {
            // Control player by button events
            // When a button event triggers a player API call, events are fired which in turn call the event handler
            // above that updated the button state.
            self.onClick.subscribe(function () {
                if (player.isPlaying()) {
                    player.pause();
                }
                else {
                    player.play();
                }
            });
        }
        // Track UI seeking status
        uimanager.onSeek.subscribe(function () {
            isSeeking = true;
        });
        uimanager.onSeeked.subscribe(function () {
            isSeeking = false;
        });
    };
    return PlaybackToggleButton;
}(togglebutton_1.ToggleButton));
exports.PlaybackToggleButton = PlaybackToggleButton;
},{"./togglebutton":25}],16:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var component_1 = require("./component");
var dom_1 = require("../dom");
var utils_1 = require("../utils");
var RecommendationOverlay = (function (_super) {
    __extends(RecommendationOverlay, _super);
    function RecommendationOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-recommendation-overlay',
            hidden: true
        }, this.config);
    }
    RecommendationOverlay.prototype.configure = function (player, uimanager) {
        var self = this;
        if (!uimanager.getConfig() || !uimanager.getConfig().recommendations || uimanager.getConfig().recommendations.length == 0) {
            // There are no recommendation items, so don't need to configure anything
            return;
        }
        for (var _i = 0, _a = uimanager.getConfig().recommendations; _i < _a.length; _i++) {
            var item = _a[_i];
            this.addComponent(new RecommendationItem({ itemConfig: item }));
        }
        this.updateComponents(); // create container DOM elements
        // Display recommendations when playback has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, function () {
            self.show();
        });
        // Hide recommendations when playback starts, e.g. a restart
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, function () {
            self.hide();
        });
    };
    return RecommendationOverlay;
}(container_1.Container));
exports.RecommendationOverlay = RecommendationOverlay;
var RecommendationItem = (function (_super) {
    __extends(RecommendationItem, _super);
    function RecommendationItem(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-recommendation-item',
            itemConfig: null // this must be passed in from outside
        }, this.config);
    }
    RecommendationItem.prototype.toDomElement = function () {
        var config = this.config.itemConfig; // TODO fix generics and get rid of cast
        var itemElement = new dom_1.DOM('a', {
            'id': this.config.id,
            'class': this.getCssClasses(),
            'href': config.url
        });
        var bgElement = new dom_1.DOM('div', {
            'class': 'thumbnail'
        }).css({ "background-image": "url(" + config.thumbnail + ")" });
        itemElement.append(bgElement);
        var titleElement = new dom_1.DOM('span', {
            'class': 'title'
        }).html(config.title);
        itemElement.append(titleElement);
        var timeElement = new dom_1.DOM('span', {
            'class': 'duration'
        }).html(utils_1.StringUtils.secondsToTime(config.duration));
        itemElement.append(timeElement);
        return itemElement;
    };
    return RecommendationItem;
}(component_1.Component));
},{"../dom":33,"../utils":39,"./component":6,"./container":7}],17:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("./component");
var dom_1 = require("../dom");
var eventdispatcher_1 = require("../eventdispatcher");
/**
 * SeekBar component that can be used to seek the stream and
 * that displays the current playback position and buffer fill level.
 */
var SeekBar = (function (_super) {
    __extends(SeekBar, _super);
    function SeekBar(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.seekBarEvents = {
            /**
             * Fired when a scrubbing seek operation is started.
             */
            onSeek: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fired during a scrubbing seek to indicate that the seek preview (i.e. the video frame) should be updated.
             */
            onSeekPreview: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fired when a scrubbing seek has finished or when a direct seek is issued.
             */
            onSeeked: new eventdispatcher_1.EventDispatcher()
        };
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-seekbar'
        }, this.config);
        this.label = this.config.label;
    }
    SeekBar.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        if (this.hasLabel()) {
            this.getLabel().initialize();
        }
    };
    SeekBar.prototype.configure = function (player, uimanager) {
        var self = this;
        var playbackNotInitialized = true;
        var isPlaying = false;
        var isSeeking = false;
        // Update playback and buffer positions
        var playbackPositionHandler = function () {
            // Once this handler os called, playback has been started and we set the flag to false
            playbackNotInitialized = false;
            if (isSeeking) {
                // We caught a seek preview seek, do not update the seekbar
                return;
            }
            if (player.isLive()) {
                if (player.getMaxTimeShift() == 0) {
                    // This case must be explicitly handled to avoid division by zero
                    self.setPlaybackPosition(100);
                }
                else {
                    var playbackPositionPercentage = 100 - (100 / player.getMaxTimeShift() * player.getTimeShift());
                    self.setPlaybackPosition(playbackPositionPercentage);
                }
                // Always show full buffer for live streams
                self.setBufferPosition(100);
            }
            else {
                var playbackPositionPercentage = 100 / player.getDuration() * player.getCurrentTime();
                self.setPlaybackPosition(playbackPositionPercentage);
                var bufferPercentage = 100 / player.getDuration() * player.getVideoBufferLength();
                self.setBufferPosition(playbackPositionPercentage + bufferPercentage);
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, function () {
            // Reset flag when a new source is loaded
            playbackNotInitialized = true;
        });
        // Update seekbar upon these events
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackPositionHandler); // update playback position when it changes
        player.addEventHandler(bitmovin.player.EVENT.ON_STOP_BUFFERING, playbackPositionHandler); // update bufferlevel when buffering is complete
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackPositionHandler); // update playback position when a seek has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFTED, playbackPositionHandler); // update playback position when a timeshift has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_SEGMENT_REQUEST_FINISHED, playbackPositionHandler); // update bufferlevel when a segment has been downloaded
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, playbackPositionHandler); // update playback position of Cast playback
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, function () {
            self.setSeeking(true);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, function () {
            self.setSeeking(false);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, function () {
            self.setSeeking(true);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFTED, function () {
            self.setSeeking(false);
        });
        var seek = function (percentage) {
            if (player.isLive()) {
                player.timeShift(player.getMaxTimeShift() - (player.getMaxTimeShift() * (percentage / 100)));
            }
            else {
                player.seek(player.getDuration() * (percentage / 100));
            }
        };
        self.onSeek.subscribe(function (sender) {
            isSeeking = true; // track seeking status so we can catch events from seek preview seeks
            // Notify UI manager of started seek
            uimanager.onSeek.dispatch(sender);
            // Save current playback state
            isPlaying = player.isPlaying();
            // Pause playback while seeking
            if (isPlaying) {
                player.pause();
            }
        });
        self.onSeekPreview.subscribe(function (sender, args) {
            // Notify UI manager of seek preview
            uimanager.onSeekPreview.dispatch(sender, args.position);
        });
        self.onSeekPreview.subscribeRateLimited(function (sender, args) {
            // Rate-limited scrubbing seek
            if (args.scrubbing) {
                seek(args.position);
            }
        }, 200);
        self.onSeeked.subscribe(function (sender, percentage) {
            isSeeking = false;
            // If playback has not been started before, we need to call play to in it the playback engine for the
            // seek to work. We call pause() immediately afterwards because we actually do not want to play back anything.
            // The flag serves to call play/pause only on the first seek before playback has started, instead of every
            // time a seek is issued.
            if (playbackNotInitialized) {
                playbackNotInitialized = false;
                player.play();
                player.pause();
            }
            // Do the seek
            seek(percentage);
            // Continue playback after seek if player was playing when seek started
            if (isPlaying) {
                player.play();
            }
            // Notify UI manager of finished seek
            uimanager.onSeeked.dispatch(sender);
        });
        if (self.hasLabel()) {
            // Configure a seekbar label that is internal to the seekbar)
            self.getLabel().configure(player, uimanager);
        }
    };
    SeekBar.prototype.toDomElement = function () {
        if (this.config.vertical) {
            this.config.cssClasses.push('vertical');
        }
        var seekBarContainer = new dom_1.DOM('div', {
            'id': this.config.id,
            'class': this.getCssClasses()
        });
        var seekBar = new dom_1.DOM('div', {
            'class': 'seekbar'
        });
        this.seekBar = seekBar;
        // Indicator that shows the buffer fill level
        var seekBarBufferLevel = new dom_1.DOM('div', {
            'class': 'seekbar-bufferlevel'
        });
        this.seekBarBufferPosition = seekBarBufferLevel;
        // Indicator that shows the current playback position
        var seekBarPlaybackPosition = new dom_1.DOM('div', {
            'class': 'seekbar-playbackposition'
        });
        this.seekBarPlaybackPosition = seekBarPlaybackPosition;
        // Indicator that show where a seek will go to
        var seekBarSeekPosition = new dom_1.DOM('div', {
            'class': 'seekbar-seekposition'
        });
        this.seekBarSeekPosition = seekBarSeekPosition;
        // Indicator that shows the full seekbar
        var seekBarBackdrop = new dom_1.DOM('div', {
            'class': 'seekbar-backdrop'
        });
        this.seekBarBackdrop = seekBarBackdrop;
        seekBar.append(seekBarBackdrop, seekBarBufferLevel, seekBarSeekPosition, seekBarPlaybackPosition);
        var self = this;
        // Define handler functions so we can attach/remove them later
        var mouseMoveHandler = function (e) {
            var targetPercentage = 100 * self.getMouseOffset(e);
            self.setSeekPosition(targetPercentage);
            self.setPlaybackPosition(targetPercentage);
            self.onSeekPreviewEvent(targetPercentage, true);
        };
        var mouseUpHandler = function (e) {
            e.preventDefault();
            // Remove handlers, seek operation is finished
            new dom_1.DOM(document).off('mousemove', mouseMoveHandler);
            new dom_1.DOM(document).off('mouseup', mouseUpHandler);
            var targetPercentage = 100 * self.getMouseOffset(e);
            self.setSeeking(false);
            // Fire seeked event
            self.onSeekedEvent(targetPercentage);
        };
        // A seek always start with a mousedown directly on the seekbar. To track a seek also outside the seekbar
        // (so the user does not need to take care that the mouse always stays on the seekbar), we attach the mousemove
        // and mouseup handlers to the whole document. A seek is triggered when the user lifts the mouse key.
        // A seek mouse gesture is thus basically a click with a long time frame between down and up events.
        seekBar.on('mousedown', function (e) {
            // Prevent selection of DOM elements
            e.preventDefault();
            self.setSeeking(true);
            // Fire seeked event
            self.onSeekEvent();
            // Add handler to track the seek operation over the whole document
            new dom_1.DOM(document).on('mousemove', mouseMoveHandler);
            new dom_1.DOM(document).on('mouseup', mouseUpHandler);
        });
        // Display seek target indicator when mouse hovers over seekbar
        seekBar.on('mousemove', function (e) {
            var position = 100 * self.getMouseOffset(e);
            self.setSeekPosition(position);
            self.onSeekPreviewEvent(position, false);
            if (self.hasLabel() && self.getLabel().isHidden()) {
                self.getLabel().show();
            }
        });
        // Hide seek target indicator when mouse leaves seekbar
        seekBar.on('mouseleave', function (e) {
            self.setSeekPosition(0);
            if (self.hasLabel()) {
                self.getLabel().hide();
            }
        });
        seekBarContainer.append(seekBar);
        if (this.label) {
            seekBarContainer.append(this.label.getDomElement());
        }
        return seekBarContainer;
    };
    SeekBar.prototype.getHorizontalMouseOffset = function (e) {
        var elementOffsetPx = this.seekBar.offset().left;
        var widthPx = this.seekBar.width();
        var offsetPx = e.pageX - elementOffsetPx;
        var offset = 1 / widthPx * offsetPx;
        return this.sanitizeOffset(offset);
    };
    SeekBar.prototype.getVerticalMouseOffset = function (e) {
        var elementOffsetPx = this.seekBar.offset().top;
        var widthPx = this.seekBar.height();
        var offsetPx = e.pageY - elementOffsetPx;
        var offset = 1 / widthPx * offsetPx;
        return 1 - this.sanitizeOffset(offset);
    };
    SeekBar.prototype.getMouseOffset = function (e) {
        if (this.config.vertical) {
            return this.getVerticalMouseOffset(e);
        }
        else {
            return this.getHorizontalMouseOffset(e);
        }
    };
    SeekBar.prototype.sanitizeOffset = function (offset) {
        // Since we track mouse moves over the whole document, the target can be outside the seek range,
        // and we need to limit it to the [0, 1] range.
        if (offset < 0) {
            offset = 0;
        }
        else if (offset > 1) {
            offset = 1;
        }
        return offset;
    };
    SeekBar.prototype.setPlaybackPosition = function (percent) {
        this.setPosition(this.seekBarPlaybackPosition, percent);
    };
    SeekBar.prototype.setBufferPosition = function (percent) {
        this.setPosition(this.seekBarBufferPosition, percent);
    };
    SeekBar.prototype.setSeekPosition = function (percent) {
        this.setPosition(this.seekBarSeekPosition, percent);
    };
    SeekBar.prototype.setPosition = function (element, percent) {
        var style = this.config.vertical ? { 'height': percent + '%' } : { 'width': percent + '%' };
        element.css(style);
    };
    /**
     * Puts the seekbar into or out of seeking mode by adding/removing a class to the DOM element. This can be used
     * to adjust the styling while seeking.
     * @param seeking set to true if entering seek mode, false if exiting seek mode
     */
    SeekBar.prototype.setSeeking = function (seeking) {
        if (seeking) {
            this.getDomElement().addClass(SeekBar.CLASS_SEEKING);
        }
        else {
            this.getDomElement().removeClass(SeekBar.CLASS_SEEKING);
        }
    };
    SeekBar.prototype.isSeeking = function () {
        return this.getDomElement().hasClass(SeekBar.CLASS_SEEKING);
    };
    SeekBar.prototype.hasLabel = function () {
        return this.label != null;
    };
    SeekBar.prototype.getLabel = function () {
        return this.label;
    };
    SeekBar.prototype.onSeekEvent = function () {
        this.seekBarEvents.onSeek.dispatch(this);
    };
    SeekBar.prototype.onSeekPreviewEvent = function (percentage, scrubbing) {
        if (this.label) {
            this.label.setText(percentage + "");
            this.label.getDomElement().css({
                "left": percentage + "%"
            });
        }
        this.seekBarEvents.onSeekPreview.dispatch(this, { scrubbing: scrubbing, position: percentage });
    };
    SeekBar.prototype.onSeekedEvent = function (percentage) {
        this.seekBarEvents.onSeeked.dispatch(this, percentage);
    };
    Object.defineProperty(SeekBar.prototype, "onSeek", {
        get: function () {
            return this.seekBarEvents.onSeek.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeekBar.prototype, "onSeekPreview", {
        get: function () {
            return this.seekBarEvents.onSeekPreview.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeekBar.prototype, "onSeeked", {
        get: function () {
            return this.seekBarEvents.onSeeked.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    SeekBar.CLASS_SEEKING = "seeking";
    return SeekBar;
}(component_1.Component));
exports.SeekBar = SeekBar;
},{"../dom":33,"../eventdispatcher":34,"./component":6}],18:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var label_1 = require("./label");
var component_1 = require("./component");
var utils_1 = require("../utils");
var SeekBarLabel = (function (_super) {
    __extends(SeekBarLabel, _super);
    function SeekBarLabel(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.label = new label_1.Label({ cssClasses: ['seekbar-label'] });
        this.thumbnail = new component_1.Component({ cssClasses: ['seekbar-thumbnail'] });
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-seekbar-label',
            components: [this.thumbnail, this.label],
            hidden: true
        }, this.config);
    }
    SeekBarLabel.prototype.configure = function (player, uimanager) {
        var self = this;
        uimanager.onSeekPreview.subscribe(function (sender, percentage) {
            if (player.isLive()) {
                var time = player.getMaxTimeShift() - player.getMaxTimeShift() * (percentage / 100);
                self.setTime(time);
            }
            else {
                var time = player.getDuration() * (percentage / 100);
                self.setTime(time);
                self.setThumbnail(player.getThumb(time));
            }
        });
    };
    SeekBarLabel.prototype.setText = function (text) {
        this.label.setText(text);
    };
    SeekBarLabel.prototype.setTime = function (seconds) {
        this.setText(utils_1.StringUtils.secondsToTime(seconds));
    };
    SeekBarLabel.prototype.setThumbnail = function (thumbnail) {
        if (thumbnail === void 0) { thumbnail = null; }
        var thumbnailElement = this.thumbnail.getDomElement();
        if (thumbnail == null) {
            thumbnailElement.css({
                "background-image": "none",
                "display": "none"
            });
        }
        else {
            thumbnailElement.css({
                "display": "inherit",
                "background-image": "url(" + thumbnail.url + ")",
                "width": thumbnail.w + "px",
                "height": thumbnail.h + "px",
                "background-position": "-" + thumbnail.x + "px -" + thumbnail.y + "px"
            });
        }
    };
    return SeekBarLabel;
}(container_1.Container));
exports.SeekBarLabel = SeekBarLabel;
},{"../utils":39,"./component":6,"./container":7,"./label":12}],19:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var listselector_1 = require("./listselector");
var dom_1 = require("../dom");
var SelectBox = (function (_super) {
    __extends(SelectBox, _super);
    function SelectBox(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-selectbox'
        }, this.config);
    }
    SelectBox.prototype.toDomElement = function () {
        var selectElement = new dom_1.DOM('select', {
            'id': this.config.id,
            'class': this.getCssClasses()
        });
        this.selectElement = selectElement;
        this.updateDomItems();
        var self = this;
        selectElement.on('change', function () {
            var value = new dom_1.DOM(this).val();
            self.onItemSelectedEvent(value, false);
        });
        return selectElement;
    };
    SelectBox.prototype.updateDomItems = function (selectedValue) {
        if (selectedValue === void 0) { selectedValue = null; }
        // Delete all children
        this.selectElement.empty();
        // Add updated children
        for (var value in this.items) {
            var label = this.items[value];
            var optionElement = new dom_1.DOM('option', {
                'value': value
            }).html(label);
            if (value == selectedValue + "") {
                optionElement.attr('selected', 'selected');
            }
            this.selectElement.append(optionElement);
        }
    };
    SelectBox.prototype.onItemAddedEvent = function (value) {
        _super.prototype.onItemAddedEvent.call(this, value);
        this.updateDomItems(this.selectedItem);
    };
    SelectBox.prototype.onItemRemovedEvent = function (value) {
        _super.prototype.onItemRemovedEvent.call(this, value);
        this.updateDomItems(this.selectedItem);
    };
    SelectBox.prototype.onItemSelectedEvent = function (value, updateDomItems) {
        if (updateDomItems === void 0) { updateDomItems = true; }
        _super.prototype.onItemSelectedEvent.call(this, value);
        if (updateDomItems) {
            this.updateDomItems(value);
        }
    };
    return SelectBox;
}(listselector_1.ListSelector));
exports.SelectBox = SelectBox;
},{"../dom":33,"./listselector":13}],20:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var label_1 = require("./label");
var videoqualityselectbox_1 = require("./videoqualityselectbox");
var audioqualityselectbox_1 = require("./audioqualityselectbox");
var timeout_1 = require("../timeout");
var SettingsPanel = (function (_super) {
    __extends(SettingsPanel, _super);
    function SettingsPanel(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settings-panel',
            hideDelay: 3000
        }, this.config);
    }
    SettingsPanel.prototype.configure = function (player, uimanager) {
        var self = this;
        if (self.config.hideDelay > -1) {
            var timeout_2 = new timeout_1.Timeout(this.config.hideDelay, function () {
                self.hide();
            });
            self.onShow.subscribe(function () {
                // Activate timeout when shown
                timeout_2.start();
            });
            self.getDomElement().on('mousemove', function () {
                // Reset timeout on interaction
                timeout_2.reset();
            });
            self.onHide.subscribe(function () {
                // Clear timeout when hidden from outside
                timeout_2.clear();
            });
        }
    };
    return SettingsPanel;
}(container_1.Container));
exports.SettingsPanel = SettingsPanel;
var SettingsPanelItem = (function (_super) {
    __extends(SettingsPanelItem, _super);
    function SettingsPanelItem(label, selectBox, config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.label = new label_1.Label({ text: label });
        this.setting = selectBox;
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settings-panel-entry',
            components: [this.label, this.setting]
        }, this.config);
    }
    SettingsPanelItem.prototype.configure = function (player, uimanager) {
        var self = this;
        var handleConfigItemChanged = function () {
            // The minimum number of items that must be available for the setting to be displayed
            // By default, at least two items must be available, else a selection is not possible
            var minItemsToDisplay = 2;
            // Audio/video quality select boxes contain an additional "auto" mode, which in combination with a single available quality also does not make sense
            if (self.setting instanceof videoqualityselectbox_1.VideoQualitySelectBox || self.setting instanceof audioqualityselectbox_1.AudioQualitySelectBox) {
                minItemsToDisplay = 3;
            }
            // Hide the setting if no meaningful choice is available
            if (self.setting.itemCount() < minItemsToDisplay) {
                self.hide();
            }
            else {
                self.show();
            }
        };
        self.setting.onItemAdded.subscribe(handleConfigItemChanged);
        self.setting.onItemRemoved.subscribe(handleConfigItemChanged);
        // Initialize hidden state
        handleConfigItemChanged();
    };
    return SettingsPanelItem;
}(container_1.Container));
exports.SettingsPanelItem = SettingsPanelItem;
},{"../timeout":37,"./audioqualityselectbox":1,"./container":7,"./label":12,"./videoqualityselectbox":27}],21:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var togglebutton_1 = require("./togglebutton");
var SettingsToggleButton = (function (_super) {
    __extends(SettingsToggleButton, _super);
    function SettingsToggleButton(config) {
        _super.call(this, config);
        if (!config.settingsPanel) {
            throw new Error("Required SettingsPanel is missing");
        }
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-settingstogglebutton',
            text: 'Settings',
            settingsPanel: null
        }, this.config);
    }
    SettingsToggleButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var settingsPanel = this.getConfig().settingsPanel;
        this.onClick.subscribe(function () {
            settingsPanel.toggleHidden();
        });
        settingsPanel.onHide.subscribe(function () {
            // Set toggle status to off when the settings panel hides
            self.off();
        });
    };
    return SettingsToggleButton;
}(togglebutton_1.ToggleButton));
exports.SettingsToggleButton = SettingsToggleButton;
},{"./togglebutton":25}],22:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var label_1 = require("./label");
var SubtitleOverlay = (function (_super) {
    __extends(SubtitleOverlay, _super);
    function SubtitleOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.subtitleLabel = new label_1.Label({ cssClass: 'ui-subtitle-label' });
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-subtitle-overlay',
            components: [this.subtitleLabel]
        }, this.config);
    }
    SubtitleOverlay.prototype.configure = function (player, uimanager) {
        var self = this;
        player.addEventHandler(bitmovin.player.EVENT.ON_CUE_ENTER, function (event) {
            self.subtitleLabel.setText(event.text);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CUE_EXIT, function (event) {
            self.subtitleLabel.setText("");
        });
        var subtitleClearHandler = function () {
            self.subtitleLabel.setText("");
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGE, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGE, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, subtitleClearHandler);
    };
    return SubtitleOverlay;
}(container_1.Container));
exports.SubtitleOverlay = SubtitleOverlay;
},{"./container":7,"./label":12}],23:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var selectbox_1 = require("./selectbox");
var SubtitleSelectBox = (function (_super) {
    __extends(SubtitleSelectBox, _super);
    function SubtitleSelectBox(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
    }
    SubtitleSelectBox.prototype.configure = function (player, uimanager) {
        var self = this;
        var updateSubtitles = function () {
            self.clearItems();
            for (var _i = 0, _a = player.getAvailableSubtitles(); _i < _a.length; _i++) {
                var subtitle = _a[_i];
                self.addItem(subtitle.id, subtitle.label);
            }
        };
        self.onItemSelected.subscribe(function (sender, value) {
            player.setSubtitle(value == "null" ? null : value);
        });
        // React to API events
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_ADDED, function (event) {
            self.addItem(event.subtitle.id, event.subtitle.label);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGE, function (event) {
            self.selectItem(event.targetSubtitle.id);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_REMOVED, function (event) {
            self.removeItem(event.subtitleId);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateSubtitles); // Update subtitles when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateSubtitles); // Update subtitles when a new source is loaded
        // Populate subtitles at startup
        updateSubtitles();
    };
    return SubtitleSelectBox;
}(selectbox_1.SelectBox));
exports.SubtitleSelectBox = SubtitleSelectBox;
},{"./selectbox":19}],24:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var label_1 = require("./label");
var timeout_1 = require("../timeout");
var TitleBar = (function (_super) {
    __extends(TitleBar, _super);
    function TitleBar(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.label = new label_1.Label({ cssClass: 'ui-titlebar-label' });
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-titlebar',
            hidden: true,
            hideDelay: 5000,
            components: [this.label]
        }, this.config);
    }
    TitleBar.prototype.configure = function (player, uimanager) {
        var self = this;
        if (uimanager.getConfig() && uimanager.getConfig().metadata) {
            self.label.setText(uimanager.getConfig().metadata.title);
        }
        else {
            // Cancel configuration if there is no metadata to display
            // TODO this probably won't work if we put the share buttons into the title bar
            return;
        }
        var timeout = new timeout_1.Timeout(self.getConfig().hideDelay, function () {
            self.hide();
        });
        uimanager.onMouseEnter.subscribe(function (sender, args) {
            self.show(); // show control bar when the mouse enters the UI
            // Clear timeout to avoid hiding the bar if the mouse moves back into the UI during the timeout period
            timeout.clear();
        });
        uimanager.onMouseMove.subscribe(function (sender, args) {
            if (self.isHidden()) {
                self.show();
            }
            timeout.reset(); // hide the bar if mouse does not move during the timeout time
        });
        uimanager.onMouseLeave.subscribe(function (sender, args) {
            timeout.reset(); // hide bar some time after the mouse left the UI
        });
    };
    return TitleBar;
}(container_1.Container));
exports.TitleBar = TitleBar;
},{"../timeout":37,"./container":7,"./label":12}],25:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var button_1 = require("./button");
var eventdispatcher_1 = require("../eventdispatcher");
var ToggleButton = (function (_super) {
    __extends(ToggleButton, _super);
    function ToggleButton(config) {
        _super.call(this, config);
        this.toggleButtonEvents = {
            onToggle: new eventdispatcher_1.EventDispatcher(),
            onToggleOn: new eventdispatcher_1.EventDispatcher(),
            onToggleOff: new eventdispatcher_1.EventDispatcher()
        };
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-togglebutton'
        }, this.config);
    }
    ToggleButton.prototype.toDomElement = function () {
        var buttonElement = _super.prototype.toDomElement.call(this);
        return buttonElement;
    };
    ToggleButton.prototype.onClickEvent = function () {
        this.buttonEvents.onClick.dispatch(this);
    };
    ToggleButton.prototype.on = function () {
        this.onState = true;
        this.getDomElement().removeClass(ToggleButton.CLASS_OFF);
        this.getDomElement().addClass(ToggleButton.CLASS_ON);
        this.onToggleEvent();
        this.onToggleOnEvent();
    };
    ToggleButton.prototype.off = function () {
        this.onState = false;
        this.getDomElement().removeClass(ToggleButton.CLASS_ON);
        this.getDomElement().addClass(ToggleButton.CLASS_OFF);
        this.onToggleEvent();
        this.onToggleOffEvent();
    };
    ToggleButton.prototype.toggle = function () {
        if (this.isOn()) {
            this.off();
        }
        else {
            this.on();
        }
        this.onToggleEvent();
    };
    ToggleButton.prototype.isOn = function () {
        return this.onState;
    };
    ToggleButton.prototype.isOff = function () {
        return !this.isOn();
    };
    ToggleButton.prototype.onToggleEvent = function () {
        this.toggleButtonEvents.onToggle.dispatch(this);
    };
    ToggleButton.prototype.onToggleOnEvent = function () {
        this.toggleButtonEvents.onToggleOn.dispatch(this);
    };
    ToggleButton.prototype.onToggleOffEvent = function () {
        this.toggleButtonEvents.onToggleOff.dispatch(this);
    };
    Object.defineProperty(ToggleButton.prototype, "onToggle", {
        get: function () {
            return this.toggleButtonEvents.onToggle.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToggleButton.prototype, "onToggleOn", {
        get: function () {
            return this.toggleButtonEvents.onToggleOn.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToggleButton.prototype, "onToggleOff", {
        get: function () {
            return this.toggleButtonEvents.onToggleOff.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    ToggleButton.CLASS_ON = "on";
    ToggleButton.CLASS_OFF = "off";
    return ToggleButton;
}(button_1.Button));
exports.ToggleButton = ToggleButton;
},{"../eventdispatcher":34,"./button":3}],26:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var eventdispatcher_1 = require("../eventdispatcher");
var UIContainer = (function (_super) {
    __extends(UIContainer, _super);
    function UIContainer(config) {
        _super.call(this, config);
        this.uiContainerEvents = {
            onMouseEnter: new eventdispatcher_1.EventDispatcher(),
            onMouseMove: new eventdispatcher_1.EventDispatcher(),
            onMouseLeave: new eventdispatcher_1.EventDispatcher()
        };
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-uicontainer'
        }, this.config);
    }
    UIContainer.prototype.configure = function (player, uimanager) {
        var self = this;
        self.onMouseEnter.subscribe(function (sender) {
            uimanager.onMouseEnter.dispatch(sender);
        });
        self.onMouseMove.subscribe(function (sender) {
            uimanager.onMouseMove.dispatch(sender);
        });
        self.onMouseLeave.subscribe(function (sender) {
            uimanager.onMouseLeave.dispatch(sender);
        });
    };
    UIContainer.prototype.toDomElement = function () {
        var self = this;
        var container = _super.prototype.toDomElement.call(this);
        container.on('mouseenter', function () {
            self.onMouseEnterEvent();
        });
        container.on('mousemove', function () {
            self.onMouseMoveEvent();
        });
        container.on('mouseleave', function () {
            self.onMouseLeaveEvent();
        });
        // Detect flexbox support (not supported in IE9)
        console.log(document);
        if (document && typeof document.createElement("p").style.flex !== "undefined") {
            container.addClass("flexbox");
        }
        else {
            container.addClass("no-flexbox");
        }
        return container;
    };
    UIContainer.prototype.onMouseEnterEvent = function () {
        this.uiContainerEvents.onMouseEnter.dispatch(this);
    };
    UIContainer.prototype.onMouseMoveEvent = function () {
        this.uiContainerEvents.onMouseMove.dispatch(this);
    };
    UIContainer.prototype.onMouseLeaveEvent = function () {
        this.uiContainerEvents.onMouseLeave.dispatch(this);
    };
    Object.defineProperty(UIContainer.prototype, "onMouseEnter", {
        get: function () {
            return this.uiContainerEvents.onMouseEnter.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIContainer.prototype, "onMouseMove", {
        get: function () {
            return this.uiContainerEvents.onMouseMove.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIContainer.prototype, "onMouseLeave", {
        get: function () {
            return this.uiContainerEvents.onMouseLeave.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    return UIContainer;
}(container_1.Container));
exports.UIContainer = UIContainer;
},{"../eventdispatcher":34,"./container":7}],27:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var selectbox_1 = require("./selectbox");
var VideoQualitySelectBox = (function (_super) {
    __extends(VideoQualitySelectBox, _super);
    function VideoQualitySelectBox(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
    }
    VideoQualitySelectBox.prototype.configure = function (player, uimanager) {
        var self = this;
        var updateVideoQualities = function () {
            var videoQualities = player.getAvailableVideoQualities();
            self.clearItems();
            // Add entry for automatic quality switching (default setting)
            self.addItem("auto", "auto");
            // Add video qualities
            for (var _i = 0, videoQualities_1 = videoQualities; _i < videoQualities_1.length; _i++) {
                var videoQuality = videoQualities_1[_i];
                self.addItem(videoQuality.id, videoQuality.label);
            }
        };
        self.onItemSelected.subscribe(function (sender, value) {
            player.setVideoQuality(value);
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateVideoQualities); // Update qualities when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateVideoQualities); // Update qualities when a new source is loaded
        player.addEventHandler(bitmovin.player.EVENT.ON_VIDEO_DOWNLOAD_QUALITY_CHANGE, function () {
            var data = player.getDownloadedVideoData();
            self.selectItem(data.isAuto ? "auto" : data.id);
        }); // Update quality selection when quality is changed (from outside)
        // Populate qualities at startup
        updateVideoQualities();
    };
    return VideoQualitySelectBox;
}(selectbox_1.SelectBox));
exports.VideoQualitySelectBox = VideoQualitySelectBox;
},{"./selectbox":19}],28:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var container_1 = require("./container");
var volumeslider_1 = require("./volumeslider");
var volumetogglebutton_1 = require("./volumetogglebutton");
var timeout_1 = require("../timeout");
var VolumeControlButton = (function (_super) {
    __extends(VolumeControlButton, _super);
    function VolumeControlButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.volumeToggleButton = new volumetogglebutton_1.VolumeToggleButton();
        this.volumeSlider = new volumeslider_1.VolumeSlider({
            vertical: config.vertical != null ? config.vertical : true,
            hidden: true
        });
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-volumecontrolbutton',
            components: [this.volumeToggleButton, this.volumeSlider],
            hideDelay: 500
        }, this.config);
    }
    VolumeControlButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var volumeToggleButton = this.getVolumeToggleButton();
        var volumeSlider = this.getVolumeSlider();
        var volumeSliderHideDelayTimeoutHandle = 0;
        var timeout = new timeout_1.Timeout(self.getConfig().hideDelay, function () {
            volumeSlider.hide();
        });
        /*
         * Volume Slider visibility handling
         *
         * The volume slider shall be visible while the user hovers the mute toggle button, while the user hovers the
         * volume slider, and while the user slides the volume slider. If none of these situations are true, the slider
         * shall disappear.
         */
        var volumeSliderHovered = false;
        volumeToggleButton.getDomElement().on('mouseenter', function () {
            // Show volume slider when mouse enters the button area
            if (volumeSlider.isHidden()) {
                volumeSlider.show();
            }
            // Avoid hiding of the slider when button is hovered
            timeout.clear();
        });
        volumeToggleButton.getDomElement().on('mouseleave', function () {
            // Hide slider delayed when button is left
            timeout.reset();
        });
        volumeSlider.getDomElement().on('mouseenter', function () {
            // When the slider is entered, cancel the hide timeout activated by leaving the button
            timeout.clear();
            volumeSliderHovered = true;
        });
        volumeSlider.getDomElement().on('mouseleave', function () {
            // When mouse leaves the slider, only hide it if there is no slide operation in progress
            if (volumeSlider.isSeeking()) {
                timeout.clear();
            }
            else {
                timeout.reset();
            }
            volumeSliderHovered = false;
        });
        volumeSlider.onSeeked.subscribe(function () {
            // When a slide operation is done and the slider not hovered (mouse outside slider), hide slider delayed
            if (!volumeSliderHovered) {
                timeout.reset();
            }
        });
    };
    VolumeControlButton.prototype.getVolumeToggleButton = function () {
        return this.volumeToggleButton;
    };
    VolumeControlButton.prototype.getVolumeSlider = function () {
        return this.volumeSlider;
    };
    return VolumeControlButton;
}(container_1.Container));
exports.VolumeControlButton = VolumeControlButton;
},{"../timeout":37,"./container":7,"./volumeslider":29,"./volumetogglebutton":30}],29:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var seekbar_1 = require("./seekbar");
var VolumeSlider = (function (_super) {
    __extends(VolumeSlider, _super);
    function VolumeSlider(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-volumeslider'
        }, this.config);
    }
    VolumeSlider.prototype.configure = function (player, uimanager) {
        var self = this;
        var volumeChangeHandler = function () {
            if (player.isMuted()) {
                self.setPlaybackPosition(0);
                self.setBufferPosition(0);
            }
            else {
                self.setPlaybackPosition(player.getVolume());
                self.setBufferPosition(player.getVolume());
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGE, volumeChangeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_MUTE, volumeChangeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTE, volumeChangeHandler);
        this.onSeekPreview.subscribe(function (sender, args) {
            if (args.scrubbing) {
                player.setVolume(args.position);
            }
        });
        this.onSeeked.subscribe(function (sender, percentage) {
            player.setVolume(percentage);
        });
        // Init volume bar
        volumeChangeHandler();
    };
    return VolumeSlider;
}(seekbar_1.SeekBar));
exports.VolumeSlider = VolumeSlider;
},{"./seekbar":17}],30:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var togglebutton_1 = require("./togglebutton");
var VolumeToggleButton = (function (_super) {
    __extends(VolumeToggleButton, _super);
    function VolumeToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-volumetogglebutton',
            text: 'Volume/Mute'
        }, this.config);
    }
    VolumeToggleButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var muteStateHandler = function () {
            if (player.isMuted()) {
                self.on();
            }
            else {
                self.off();
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_MUTE, muteStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTE, muteStateHandler);
        self.onClick.subscribe(function () {
            if (player.isMuted()) {
                player.unmute();
            }
            else {
                player.mute();
            }
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGE, function (event) {
            // Toggle low class to display low volume icon below 50% volume
            if (event.targetVolume < 50) {
                self.getDomElement().addClass("low");
            }
            else {
                self.getDomElement().removeClass("low");
            }
        });
    };
    return VolumeToggleButton;
}(togglebutton_1.ToggleButton));
exports.VolumeToggleButton = VolumeToggleButton;
},{"./togglebutton":25}],31:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var togglebutton_1 = require("./togglebutton");
var VRToggleButton = (function (_super) {
    __extends(VRToggleButton, _super);
    function VRToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-vrtogglebutton',
            text: 'VR'
        }, this.config);
    }
    VRToggleButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var isVRConfigured = function () {
            // VR availability cannot be checked through getVRStatus() because it is asynchronously populated and not
            // available at UI initialization. As an alternative, we check the VR settings in the config.
            // TODO use getVRStatus() through isVRStereoAvailable() once the player has been rewritten and the status is available in ON_READY
            var config = player.getConfig();
            return config.source && config.source.vr && config.source.vr.contentType != 'none';
        };
        var isVRStereoAvailable = function () {
            return player.getVRStatus().contentType != 'none';
        };
        var vrStateHandler = function () {
            if (isVRConfigured() && isVRStereoAvailable()) {
                self.show(); // show button in case it is hidden
                if (player.getVRStatus().isStereo) {
                    self.on();
                }
                else {
                    self.off();
                }
            }
            else {
                self.hide(); // hide button if no stereo mode available
            }
        };
        var vrButtonVisibilityHandler = function () {
            if (isVRConfigured()) {
                self.show();
            }
            else {
                self.hide();
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_VR_MODE_CHANGED, vrStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_VR_STEREO_CHANGED, vrStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_VR_ERROR, vrStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, vrButtonVisibilityHandler); // Hide button when VR source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, vrButtonVisibilityHandler); // Show button when a new source is loaded and it's VR
        self.onClick.subscribe(function () {
            if (!isVRStereoAvailable()) {
                if (console)
                    console.log('No VR content');
            }
            else {
                if (player.getVRStatus().isStereo) {
                    player.setVRStereo(false);
                }
                else {
                    player.setVRStereo(true);
                }
            }
        });
        // Set startup visibility
        vrButtonVisibilityHandler();
    };
    return VRToggleButton;
}(togglebutton_1.ToggleButton));
exports.VRToggleButton = VRToggleButton;
},{"./togglebutton":25}],32:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var button_1 = require("./button");
var Watermark = (function (_super) {
    __extends(Watermark, _super);
    function Watermark(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: 'ui-watermark',
            url: 'http://bitmovin.com'
        }, this.config);
    }
    Watermark.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        if (this.getUrl()) {
            var element_1 = this.getDomElement();
            element_1.data('url', this.getUrl());
            element_1.on('click', function () {
                window.open(element_1.data('url'), '_blank');
            });
        }
    };
    Watermark.prototype.getUrl = function () {
        return this.config.url;
    };
    return Watermark;
}(button_1.Button));
exports.Watermark = Watermark;
},{"./button":3}],33:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
/**
 * Simple DOM manipulation and DOM element event handling modeled after jQuery (as replacement for jQuery).
 *
 * Like jQuery, DOM operates on single elements and lists of elements. For example: creating an element returns a DOM
 * instance with a single element, selecting elements returns a DOM instance with zero, one, or many elements. Similar
 * to jQuery, setters usually affect all elements, while getters operate on only the first element.
 * Also similar to jQuery, most methods (except getters) return the DOM instance facilitating easy chaining of method calls.
 *
 * Built with the help of: http://youmightnotneedjquery.com/
 */
var DOM = (function () {
    function DOM(something, attributes) {
        this.document = document; // Set the global document to the local document field
        if (something instanceof HTMLElement) {
            var element = something;
            this.elements = [element];
        }
        else if (something instanceof Document) {
            // When a document is passed in, we do not do anything with it, but by setting this.elements to null
            // we give the event handling method a means to detect if the events should be registered on the document
            // instead of elements.
            this.elements = null;
        }
        else if (attributes) {
            var tagName = something;
            var element_1 = document.createElement(tagName);
            for (var attributeName in attributes) {
                var attributeValue = attributes[attributeName];
                element_1.setAttribute(attributeName, attributeValue);
            }
            this.elements = [element_1];
        }
        else {
            var selector = something;
            var elements = document.querySelectorAll(selector);
            // Convert NodeList to Array
            // https://toddmotto.com/a-comprehensive-dive-into-nodelists-arrays-converting-nodelists-and-understanding-the-dom/
            this.elements = [].slice.call(elements);
        }
    }
    /**
     * A shortcut method for iterating all elements. Shorts this.elements.forEach(...) to this.forEach(...).
     * @param handler the handler to execute an operation on an element
     */
    DOM.prototype.forEach = function (handler) {
        this.elements.forEach(function (element) {
            handler(element);
        });
    };
    DOM.prototype.html = function (content) {
        if (arguments.length > 0) {
            return this.setHtml(content);
        }
        else {
            return this.getHtml();
        }
    };
    DOM.prototype.getHtml = function () {
        return this.elements[0].innerHTML;
    };
    DOM.prototype.setHtml = function (content) {
        if (content == undefined || content == null) {
            // Set to empty string to avoid innerHTML getting set to "undefined" (all browsers) or "null" (IE9)
            content = "";
        }
        this.forEach(function (element) {
            element.innerHTML = content;
        });
        return this;
    };
    /**
     * Clears the inner HTML of all elements (deletes all children).
     * @returns {DOM}
     */
    DOM.prototype.empty = function () {
        this.forEach(function (element) {
            element.innerHTML = '';
        });
        return this;
    };
    /**
     * Returns the current value of the first form element, e.g. the selected value of a select box or the text if an input field.
     * @returns {string} the value of a form element
     */
    DOM.prototype.val = function () {
        var element = this.elements[0];
        if (element instanceof HTMLSelectElement || element instanceof HTMLInputElement) {
            return element.value;
        }
        else {
            // TODO add support for missing form elements
            throw new Error("val() not supported for " + typeof element);
        }
    };
    DOM.prototype.attr = function (attribute, value) {
        if (arguments.length > 1) {
            return this.setAttr(attribute, value);
        }
        else {
            return this.getAttr(attribute);
        }
    };
    DOM.prototype.getAttr = function (attribute) {
        return this.elements[0].getAttribute(attribute);
    };
    DOM.prototype.setAttr = function (attribute, value) {
        this.forEach(function (element) {
            element.setAttribute(attribute, value);
        });
        return this;
    };
    DOM.prototype.data = function (dataAttribute, value) {
        if (arguments.length > 1) {
            return this.setData(dataAttribute, value);
        }
        else {
            return this.getData(dataAttribute);
        }
    };
    DOM.prototype.getData = function (dataAttribute) {
        return this.elements[0].getAttribute("data-" + dataAttribute);
    };
    DOM.prototype.setData = function (dataAttribute, value) {
        this.forEach(function (element) {
            element.setAttribute("data-" + dataAttribute, value);
        });
        return this;
    };
    /**
     * Appends one or more DOM elements as children to all elements.
     * @param childElements the chrild elements to append
     * @returns {DOM}
     */
    DOM.prototype.append = function () {
        var childElements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            childElements[_i - 0] = arguments[_i];
        }
        this.forEach(function (element) {
            childElements.forEach(function (childElement) {
                childElement.elements.forEach(function (_, index) {
                    element.appendChild(childElement.elements[index]);
                });
            });
        });
        return this;
    };
    /**
     * Returns the offset of the first element from the document's top left corner.
     * @returns {Offset}
     */
    DOM.prototype.offset = function () {
        var element = this.elements[0];
        var rect = element.getBoundingClientRect();
        // Workaround for document.body.scrollTop always 0 in IE9, IE11, Firefox
        // http://stackoverflow.com/a/11102215/370252
        var scrollTop = typeof window.pageYOffset != 'undefined' ?
            window.pageYOffset : document.documentElement.scrollTop ?
            document.documentElement.scrollTop : document.body.scrollTop ?
            document.body.scrollTop : 0;
        // Workaround for document.body.scrollLeft always 0 in IE9, IE11, Firefox
        var scrollLeft = typeof window.pageXOffset != 'undefined' ?
            window.pageXOffset : document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft : document.body.scrollLeft ?
            document.body.scrollLeft : 0;
        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
        };
    };
    /**
     * Returns the width of the first element.
     * @returns {number} the width of the first element
     */
    DOM.prototype.width = function () {
        // TODO check if this is the same as jQuery's width() (probably not)
        return this.elements[0].offsetWidth;
    };
    /**
     * Returns the height of the first element.
     * @returns {number} the height of the first element
     */
    DOM.prototype.height = function () {
        // TODO check if this is the same as jQuery's height() (probably not)
        return this.elements[0].offsetHeight;
    };
    /**
     * Attaches an event handler to one or more events on all elements.
     * @param eventName the event name (or multiple names separated by space) to listen to
     * @param eventHandler the event handler to call when the event fires
     * @returns {DOM}
     */
    DOM.prototype.on = function (eventName, eventHandler) {
        var events = eventName.split(" ");
        var self = this;
        events.forEach(function (event) {
            if (self.elements == null) {
                self.document.addEventListener(event, eventHandler);
            }
            else {
                self.forEach(function (element) {
                    element.addEventListener(event, eventHandler);
                });
            }
        });
        return this;
    };
    /**
     * Removes an event handler from one or more events on all elements.
     * @param eventName the event name (or multiple names separated by space) to remove the handler from
     * @param eventHandler the event handler to remove
     * @returns {DOM}
     */
    DOM.prototype.off = function (eventName, eventHandler) {
        var events = eventName.split(" ");
        var self = this;
        events.forEach(function (event) {
            if (self.elements == null) {
                self.document.removeEventListener(event, eventHandler);
            }
            else {
                self.forEach(function (element) {
                    element.removeEventListener(event, eventHandler);
                });
            }
        });
        return this;
    };
    /**
     * Adds the specified class(es) to all elements.
     * @param className the class(es) to add, multiple classes separated by space
     * @returns {DOM}
     */
    DOM.prototype.addClass = function (className) {
        this.forEach(function (element) {
            if (element.classList) {
                element.classList.add(className);
            }
            else {
                element.className += ' ' + className;
            }
        });
        return this;
    };
    /**
     * Removed the specified class(es) from all elements.
     * @param className the class(es) to remove, multiple classes separated by space
     * @returns {DOM}
     */
    DOM.prototype.removeClass = function (className) {
        this.forEach(function (element) {
            if (element.classList) {
                element.classList.remove(className);
            }
            else {
                element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        });
        return this;
    };
    /**
     * Checks if any of the elements has the specified class.
     * @param className the class name to check
     * @returns {boolean} true if one of the elements has the class attached, else if no element has it attached
     */
    DOM.prototype.hasClass = function (className) {
        this.forEach(function (element) {
            if (element.classList) {
                if (element.classList.contains(className)) {
                    return true;
                }
            }
            else {
                if (new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className)) {
                    return true;
                }
            }
        });
        return false;
    };
    DOM.prototype.css = function (propertyNameOrCollection, value) {
        if (typeof propertyNameOrCollection === "string") {
            var propertyName = propertyNameOrCollection;
            if (arguments.length == 2) {
                return this.setCss(propertyName, value);
            }
            else {
                return this.getCss(propertyName);
            }
        }
        else {
            var propertyValueCollection = propertyNameOrCollection;
            return this.setCssCollection(propertyValueCollection);
        }
    };
    DOM.prototype.getCss = function (propertyName) {
        return getComputedStyle(this.elements[0])[propertyName];
    };
    DOM.prototype.setCss = function (propertyName, value) {
        this.forEach(function (element) {
            // <any> cast to resolve TS7015: http://stackoverflow.com/a/36627114/370252
            element.style[propertyName] = value;
        });
        return this;
    };
    DOM.prototype.setCssCollection = function (ruleValueCollection) {
        this.forEach(function (element) {
            // http://stackoverflow.com/a/34490573/370252
            Object.assign(element.style, ruleValueCollection);
        });
        return this;
    };
    return DOM;
}());
exports.DOM = DOM;
},{}],34:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("./utils");
/**
 * Event dispatcher to subscribe and trigger events. Each event should have its own dispatcher.
 */
var EventDispatcher = (function () {
    function EventDispatcher() {
        this.listeners = [];
    }
    /**
     * {@inheritDoc}
     */
    EventDispatcher.prototype.subscribe = function (listener) {
        this.listeners.push(new EventListenerWrapper(listener));
    };
    /**
     * {@inheritDoc}
     */
    EventDispatcher.prototype.subscribeRateLimited = function (listener, rateMs) {
        this.listeners.push(new RateLimitedEventListenerWrapper(listener, rateMs));
    };
    /**
     * {@inheritDoc}
     */
    EventDispatcher.prototype.unsubscribe = function (listener) {
        // Iterate through listeners, compare with parameter, and remove if found
        for (var i = 0; i < this.listeners.length; i++) {
            var subscribedListener = this.listeners[i];
            if (subscribedListener.listener == listener) {
                utils_1.ArrayUtils.remove(this.listeners, subscribedListener);
                return true;
            }
        }
        return false;
    };
    /**
     * Dispatches an event to all subscribed listeners.
     * @param sender the source of the event
     * @param args the arguments for the event
     */
    EventDispatcher.prototype.dispatch = function (sender, args) {
        if (args === void 0) { args = null; }
        // Call every listener
        for (var _i = 0, _a = this.listeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener.fire(sender, args);
        }
    };
    /**
     * Returns the event that this dispatcher manages and on which listeners can subscribe and unsubscribe event handlers.
     * @returns {Event}
     */
    EventDispatcher.prototype.getEvent = function () {
        // For now, just case the event dispatcher to the event interface. At some point in the future when the
        // codebase grows, it might make sense to split the dispatcher into separate dispatcher and event classes.
        return this;
    };
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;
/**
 * A basic event listener wrapper to manage listeners within the {@link EventDispatcher}. This is a "private" class
 * for internal dispatcher use and it is therefore not exported.
 */
var EventListenerWrapper = (function () {
    function EventListenerWrapper(listener) {
        this.eventListener = listener;
    }
    Object.defineProperty(EventListenerWrapper.prototype, "listener", {
        /**
         * Returns the wrapped event listener.
         * @returns {EventListener<Sender, Args>}
         */
        get: function () {
            return this.eventListener;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Fires the wrapped event listener with the given arguments.
     * @param sender
     * @param args
     */
    EventListenerWrapper.prototype.fire = function (sender, args) {
        this.eventListener(sender, args);
    };
    return EventListenerWrapper;
}());
/**
 * Extends the basic {@link EventListenerWrapper} with rate-limiting functionality.
 */
var RateLimitedEventListenerWrapper = (function (_super) {
    __extends(RateLimitedEventListenerWrapper, _super);
    function RateLimitedEventListenerWrapper(listener, rateMs) {
        _super.call(this, listener); // sets the event listener sink
        this.rateMs = rateMs;
        this.lastFireTime = 0;
        // Wrap the event listener with an event listener that does the rate-limiting
        this.rateLimitingEventListener = function (sender, args) {
            if (Date.now() - this.lastFireTime > this.rateMs) {
                // Only if enough time since the previous call has passed, call the
                // actual event listener and record the current time
                this.fireSuper(sender, args);
                this.lastFireTime = Date.now();
            }
        };
    }
    RateLimitedEventListenerWrapper.prototype.fireSuper = function (sender, args) {
        // Fire the actual external event listener
        _super.prototype.fire.call(this, sender, args);
    };
    RateLimitedEventListenerWrapper.prototype.fire = function (sender, args) {
        // Fire the internal rate-limiting listener instead of the external event listener
        this.rateLimitingEventListener(sender, args);
    };
    return RateLimitedEventListenerWrapper;
}(EventListenerWrapper));
},{"./utils":39}],35:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var Guid;
(function (Guid) {
    var guid = 1;
    function next() {
        return guid++;
    }
    Guid.next = next;
})(Guid = exports.Guid || (exports.Guid = {}));
},{}],36:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
/// <reference path="player.d.ts" />
/// <reference path="../../node_modules/@types/core-js/index.d.ts" />
var uimanager_1 = require("./uimanager");
var button_1 = require("./components/button");
var controlbar_1 = require("./components/controlbar");
var fullscreentogglebutton_1 = require("./components/fullscreentogglebutton");
var hugeplaybacktogglebutton_1 = require("./components/hugeplaybacktogglebutton");
var playbacktimelabel_1 = require("./components/playbacktimelabel");
var playbacktogglebutton_1 = require("./components/playbacktogglebutton");
var seekbar_1 = require("./components/seekbar");
var selectbox_1 = require("./components/selectbox");
var settingspanel_1 = require("./components/settingspanel");
var settingstogglebutton_1 = require("./components/settingstogglebutton");
var togglebutton_1 = require("./components/togglebutton");
var videoqualityselectbox_1 = require("./components/videoqualityselectbox");
var volumetogglebutton_1 = require("./components/volumetogglebutton");
var vrtogglebutton_1 = require("./components/vrtogglebutton");
var watermark_1 = require("./components/watermark");
var uicontainer_1 = require("./components/uicontainer");
var container_1 = require("./components/container");
var label_1 = require("./components/label");
var audioqualityselectbox_1 = require("./components/audioqualityselectbox");
var audiotrackselectbox_1 = require("./components/audiotrackselectbox");
var caststatusoverlay_1 = require("./components/caststatusoverlay");
var casttogglebutton_1 = require("./components/casttogglebutton");
var component_1 = require("./components/component");
var errormessageoverlay_1 = require("./components/errormessageoverlay");
var recommendationoverlay_1 = require("./components/recommendationoverlay");
var seekbarlabel_1 = require("./components/seekbarlabel");
var subtitleoverlay_1 = require("./components/subtitleoverlay");
var subtitleselectbox_1 = require("./components/subtitleselectbox");
var titlebar_1 = require("./components/titlebar");
var volumecontrolbutton_1 = require("./components/volumecontrolbutton");
// Object.assign polyfill for ES5/IE9
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (typeof Object.assign != 'function') {
    Object.assign = function (target) {
        'use strict';
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        target = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}
// Expose classes to window
// Inspired by https://keestalkstech.com/2016/08/support-both-node-js-and-browser-js-in-one-typescript-file/
// TODO find out how TS/Browserify can compile the classes to plain JS without the module wrapper we don't need to expose classes to the window scope manually here
(function () {
    var exportables = [
        // Management
        uimanager_1.UIManager,
        // Components
        audioqualityselectbox_1.AudioQualitySelectBox,
        audiotrackselectbox_1.AudioTrackSelectBox,
        button_1.Button,
        caststatusoverlay_1.CastStatusOverlay,
        casttogglebutton_1.CastToggleButton,
        component_1.Component,
        container_1.Container,
        controlbar_1.ControlBar,
        errormessageoverlay_1.ErrorMessageOverlay,
        fullscreentogglebutton_1.FullscreenToggleButton,
        hugeplaybacktogglebutton_1.HugePlaybackToggleButton,
        label_1.Label,
        playbacktimelabel_1.PlaybackTimeLabel,
        playbacktogglebutton_1.PlaybackToggleButton,
        recommendationoverlay_1.RecommendationOverlay,
        seekbar_1.SeekBar,
        seekbarlabel_1.SeekBarLabel,
        selectbox_1.SelectBox,
        settingspanel_1.SettingsPanel,
        settingstogglebutton_1.SettingsToggleButton,
        subtitleoverlay_1.SubtitleOverlay,
        subtitleselectbox_1.SubtitleSelectBox,
        titlebar_1.TitleBar,
        togglebutton_1.ToggleButton,
        uicontainer_1.UIContainer,
        videoqualityselectbox_1.VideoQualitySelectBox,
        volumecontrolbutton_1.VolumeControlButton,
        volumetogglebutton_1.VolumeToggleButton,
        vrtogglebutton_1.VRToggleButton,
        watermark_1.Watermark,
    ];
    window['bitmovin']['playerui'] = {};
    var uiscope = window['bitmovin']['playerui'];
    if (window) {
        exportables.forEach(function (exp) { return uiscope[nameof(exp)] = exp; });
    }
    function nameof(fn) {
        return typeof fn === 'undefined' ? '' : fn.name ? fn.name : (function () {
            var result = /^function\s+([\w\$]+)\s*\(/.exec(fn.toString());
            return !result ? '' : result[1];
        })();
    }
}());
},{"./components/audioqualityselectbox":1,"./components/audiotrackselectbox":2,"./components/button":3,"./components/caststatusoverlay":4,"./components/casttogglebutton":5,"./components/component":6,"./components/container":7,"./components/controlbar":8,"./components/errormessageoverlay":9,"./components/fullscreentogglebutton":10,"./components/hugeplaybacktogglebutton":11,"./components/label":12,"./components/playbacktimelabel":14,"./components/playbacktogglebutton":15,"./components/recommendationoverlay":16,"./components/seekbar":17,"./components/seekbarlabel":18,"./components/selectbox":19,"./components/settingspanel":20,"./components/settingstogglebutton":21,"./components/subtitleoverlay":22,"./components/subtitleselectbox":23,"./components/titlebar":24,"./components/togglebutton":25,"./components/uicontainer":26,"./components/videoqualityselectbox":27,"./components/volumecontrolbutton":28,"./components/volumetogglebutton":30,"./components/vrtogglebutton":31,"./components/watermark":32,"./uimanager":38}],37:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
// TODO change to internal (not exported) class, how to use in other files?
var Timeout = (function () {
    function Timeout(delay, callback) {
        this.delay = delay;
        this.callback = callback;
        this.timeoutHandle = 0;
    }
    /**
     * Starts the timeout and calls the callback when the timeout delay has passed.
     */
    Timeout.prototype.start = function () {
        this.reset();
    };
    /**
     * Clears the timeout. The callback will not be called if clear is called during the timeout.
     */
    Timeout.prototype.clear = function () {
        clearTimeout(this.timeoutHandle);
    };
    /**
     * Resets the passed timeout delay to zero. Can be used to defer the calling of the callback.
     */
    Timeout.prototype.reset = function () {
        this.clear();
        this.timeoutHandle = setTimeout(this.callback, this.delay);
    };
    return Timeout;
}());
exports.Timeout = Timeout;
},{}],38:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var uicontainer_1 = require("./components/uicontainer");
var dom_1 = require("./dom");
var container_1 = require("./components/container");
var playbacktogglebutton_1 = require("./components/playbacktogglebutton");
var fullscreentogglebutton_1 = require("./components/fullscreentogglebutton");
var vrtogglebutton_1 = require("./components/vrtogglebutton");
var volumetogglebutton_1 = require("./components/volumetogglebutton");
var seekbar_1 = require("./components/seekbar");
var playbacktimelabel_1 = require("./components/playbacktimelabel");
var hugeplaybacktogglebutton_1 = require("./components/hugeplaybacktogglebutton");
var controlbar_1 = require("./components/controlbar");
var eventdispatcher_1 = require("./eventdispatcher");
var settingstogglebutton_1 = require("./components/settingstogglebutton");
var settingspanel_1 = require("./components/settingspanel");
var videoqualityselectbox_1 = require("./components/videoqualityselectbox");
var watermark_1 = require("./components/watermark");
var audioqualityselectbox_1 = require("./components/audioqualityselectbox");
var audiotrackselectbox_1 = require("./components/audiotrackselectbox");
var seekbarlabel_1 = require("./components/seekbarlabel");
var volumeslider_1 = require("./components/volumeslider");
var subtitleselectbox_1 = require("./components/subtitleselectbox");
var subtitleoverlay_1 = require("./components/subtitleoverlay");
var volumecontrolbutton_1 = require("./components/volumecontrolbutton");
var casttogglebutton_1 = require("./components/casttogglebutton");
var caststatusoverlay_1 = require("./components/caststatusoverlay");
var errormessageoverlay_1 = require("./components/errormessageoverlay");
var titlebar_1 = require("./components/titlebar");
var recommendationoverlay_1 = require("./components/recommendationoverlay");
var UIManager = (function () {
    function UIManager(player, ui, config) {
        if (config === void 0) { config = {}; }
        this.events = {
            /**
             * Fires when the mouse enters the UI area.
             */
            onMouseEnter: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fires when the mouse moves inside the UI area.
             */
            onMouseMove: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fires when the mouse leaves the UI area.
             */
            onMouseLeave: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fires when a seek starts.
             */
            onSeek: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fires when the seek timeline is scrubbed.
             */
            onSeekPreview: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fires when a seek is finished.
             */
            onSeeked: new eventdispatcher_1.EventDispatcher()
        };
        this.player = player;
        this.ui = ui;
        this.config = config;
        var playerId = player.getFigure().parentElement.id;
        // Add UI elements to player
        new dom_1.DOM("#" + playerId).append(ui.getDomElement());
        this.configureControls(ui);
    }
    UIManager.prototype.getConfig = function () {
        return this.config;
    };
    UIManager.prototype.configureControls = function (component) {
        component.initialize();
        component.configure(this.player, this);
        if (component instanceof container_1.Container) {
            for (var _i = 0, _a = component.getComponents(); _i < _a.length; _i++) {
                var childComponent = _a[_i];
                this.configureControls(childComponent);
            }
        }
    };
    Object.defineProperty(UIManager.prototype, "onMouseEnter", {
        get: function () {
            return this.events.onMouseEnter;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager.prototype, "onMouseMove", {
        get: function () {
            return this.events.onMouseMove;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager.prototype, "onMouseLeave", {
        get: function () {
            return this.events.onMouseLeave;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager.prototype, "onSeek", {
        get: function () {
            return this.events.onSeek;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager.prototype, "onSeekPreview", {
        get: function () {
            return this.events.onSeekPreview;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager.prototype, "onSeeked", {
        get: function () {
            return this.events.onSeeked;
        },
        enumerable: true,
        configurable: true
    });
    UIManager.Factory = (function () {
        function class_1() {
        }
        class_1.buildDefaultUI = function (player, config) {
            if (config === void 0) { config = {}; }
            var ui = UIManager.Factory.assembleDefaultUI();
            var manager = new UIManager(player, ui, config);
            return manager;
        };
        class_1.assembleDefaultUI = function () {
            var settingsPanel = new settingspanel_1.SettingsPanel({
                components: [
                    new settingspanel_1.SettingsPanelItem('Video Quality', new videoqualityselectbox_1.VideoQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem('Audio Track', new audiotrackselectbox_1.AudioTrackSelectBox()),
                    new settingspanel_1.SettingsPanelItem('Audio Quality', new audioqualityselectbox_1.AudioQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem('Subtitles', new subtitleselectbox_1.SubtitleSelectBox())
                ],
                hidden: true
            });
            var controlBar = new controlbar_1.ControlBar({
                components: [
                    settingsPanel,
                    new playbacktogglebutton_1.PlaybackToggleButton(),
                    new seekbar_1.SeekBar({ label: new seekbarlabel_1.SeekBarLabel() }),
                    new playbacktimelabel_1.PlaybackTimeLabel(),
                    new vrtogglebutton_1.VRToggleButton(),
                    new volumecontrolbutton_1.VolumeControlButton(),
                    new settingstogglebutton_1.SettingsToggleButton({ settingsPanel: settingsPanel }),
                    new casttogglebutton_1.CastToggleButton(),
                    new fullscreentogglebutton_1.FullscreenToggleButton()
                ]
            });
            var ui = new uicontainer_1.UIContainer({
                components: [
                    new subtitleoverlay_1.SubtitleOverlay(),
                    new caststatusoverlay_1.CastStatusOverlay(),
                    new hugeplaybacktogglebutton_1.HugePlaybackToggleButton(),
                    new watermark_1.Watermark(),
                    new recommendationoverlay_1.RecommendationOverlay(),
                    controlBar,
                    new titlebar_1.TitleBar(),
                    new errormessageoverlay_1.ErrorMessageOverlay()
                ], cssClasses: ['ui-skin-default']
            });
            console.log(ui);
            return ui;
        };
        class_1.assembleTestUI = function () {
            var settingsPanel = new settingspanel_1.SettingsPanel({
                components: [
                    new settingspanel_1.SettingsPanelItem('Video Quality', new videoqualityselectbox_1.VideoQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem('Audio Track', new audiotrackselectbox_1.AudioTrackSelectBox()),
                    new settingspanel_1.SettingsPanelItem('Audio Quality', new audioqualityselectbox_1.AudioQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem('Subtitles', new subtitleselectbox_1.SubtitleSelectBox())
                ],
                hidden: true
            });
            var controlBar = new controlbar_1.ControlBar({
                components: [settingsPanel,
                    new playbacktogglebutton_1.PlaybackToggleButton(),
                    new seekbar_1.SeekBar({ label: new seekbarlabel_1.SeekBarLabel() }),
                    new playbacktimelabel_1.PlaybackTimeLabel(),
                    new vrtogglebutton_1.VRToggleButton(),
                    new volumetogglebutton_1.VolumeToggleButton(),
                    new volumeslider_1.VolumeSlider(),
                    new volumecontrolbutton_1.VolumeControlButton(),
                    new volumecontrolbutton_1.VolumeControlButton({ vertical: false }),
                    new settingstogglebutton_1.SettingsToggleButton({ settingsPanel: settingsPanel }),
                    new casttogglebutton_1.CastToggleButton(),
                    new fullscreentogglebutton_1.FullscreenToggleButton()
                ]
            });
            var ui = new uicontainer_1.UIContainer({
                components: [
                    new subtitleoverlay_1.SubtitleOverlay(),
                    new caststatusoverlay_1.CastStatusOverlay(),
                    new hugeplaybacktogglebutton_1.HugePlaybackToggleButton(),
                    new watermark_1.Watermark(),
                    new recommendationoverlay_1.RecommendationOverlay(),
                    controlBar,
                    new titlebar_1.TitleBar(),
                    new errormessageoverlay_1.ErrorMessageOverlay()
                ], cssClasses: ['ui-skin-default']
            });
            console.log(ui);
            return ui;
        };
        return class_1;
    }());
    return UIManager;
}());
exports.UIManager = UIManager;
},{"./components/audioqualityselectbox":1,"./components/audiotrackselectbox":2,"./components/caststatusoverlay":4,"./components/casttogglebutton":5,"./components/container":7,"./components/controlbar":8,"./components/errormessageoverlay":9,"./components/fullscreentogglebutton":10,"./components/hugeplaybacktogglebutton":11,"./components/playbacktimelabel":14,"./components/playbacktogglebutton":15,"./components/recommendationoverlay":16,"./components/seekbar":17,"./components/seekbarlabel":18,"./components/settingspanel":20,"./components/settingstogglebutton":21,"./components/subtitleoverlay":22,"./components/subtitleselectbox":23,"./components/titlebar":24,"./components/uicontainer":26,"./components/videoqualityselectbox":27,"./components/volumecontrolbutton":28,"./components/volumeslider":29,"./components/volumetogglebutton":30,"./components/vrtogglebutton":31,"./components/watermark":32,"./dom":33,"./eventdispatcher":34}],39:[function(require,module,exports){
/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */
"use strict";
var ArrayUtils;
(function (ArrayUtils) {
    /**
     * Removes an item from an array.
     * @param array the array that may contain the item to remove
     * @param item the item to remove from the array
     * @returns {any} the removed item or null if it wasn't part of the array
     */
    function remove(array, item) {
        var index = array.indexOf(item);
        if (index > -1) {
            return array.splice(index, 1)[0];
        }
        else {
            return null;
        }
    }
    ArrayUtils.remove = remove;
})(ArrayUtils = exports.ArrayUtils || (exports.ArrayUtils = {}));
var StringUtils;
(function (StringUtils) {
    /**
     * Formats a number of seconds into a time string with the pattern hh:mm:ss.
     *
     * @param totalSeconds the total number of seconds to format to string
     * @returns {string} the formatted time string
     */
    function secondsToTime(totalSeconds) {
        var isNegative = totalSeconds < 0;
        if (isNegative) {
            // If the time is negative, we make it positive for the calculation below
            // (else we'd get all negative numbers) and reattach the negative sign later.
            totalSeconds = -totalSeconds;
        }
        // Split into separate time parts
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor(totalSeconds / 60) - hours * 60;
        var seconds = Math.floor(totalSeconds) % 60;
        return (isNegative ? "-" : "") + leftPadWithZeros(hours, 2) + ":" + leftPadWithZeros(minutes, 2) + ":" + leftPadWithZeros(seconds, 2);
    }
    StringUtils.secondsToTime = secondsToTime;
    /**
     * Converts a number to a string and left-pads it with zeros to the specified length.
     * Example: leftPadWithZeros(123, 5) => "00123"
     *
     * @param number the number to convert to string and pad with zeros
     * @param length the desired length of the padded string
     * @returns {string} the padded number as string
     */
    function leftPadWithZeros(number, length) {
        var text = number + "";
        var padding = "0000000000".substr(0, length - text.length);
        return padding + text;
    }
})(StringUtils = exports.StringUtils || (exports.StringUtils = {}));
},{}]},{},[36])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvY29tcG9uZW50cy9hdWRpb3F1YWxpdHlzZWxlY3Rib3gudHMiLCJzcmMvdHMvY29tcG9uZW50cy9hdWRpb3RyYWNrc2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY2FzdHN0YXR1c292ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9jYXN0dG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY29tcG9uZW50LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY29udGFpbmVyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY29udHJvbGJhci50cyIsInNyYy90cy9jb21wb25lbnRzL2Vycm9ybWVzc2FnZW92ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9mdWxsc2NyZWVudG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvaHVnZXBsYXliYWNrdG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvbGFiZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9saXN0c2VsZWN0b3IudHMiLCJzcmMvdHMvY29tcG9uZW50cy9wbGF5YmFja3RpbWVsYWJlbC50cyIsInNyYy90cy9jb21wb25lbnRzL3BsYXliYWNrdG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvcmVjb21tZW5kYXRpb25vdmVybGF5LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc2Vla2Jhci50cyIsInNyYy90cy9jb21wb25lbnRzL3NlZWtiYXJsYWJlbC50cyIsInNyYy90cy9jb21wb25lbnRzL3NlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3NldHRpbmdzcGFuZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZXR0aW5nc3RvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3N1YnRpdGxlb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL3N1YnRpdGxlc2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdGl0bGViYXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy90b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy91aWNvbnRhaW5lci50cyIsInNyYy90cy9jb21wb25lbnRzL3ZpZGVvcXVhbGl0eXNlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3ZvbHVtZWNvbnRyb2xidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy92b2x1bWVzbGlkZXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy92b2x1bWV0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy92cnRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3dhdGVybWFyay50cyIsInNyYy90cy9kb20udHMiLCJzcmMvdHMvZXZlbnRkaXNwYXRjaGVyLnRzIiwic3JjL3RzL2d1aWQudHMiLCJzcmMvdHMvbWFpbi50cyIsInNyYy90cy90aW1lb3V0LnRzIiwic3JjL3RzL3VpbWFuYWdlci50cyIsInNyYy90cy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7O0dBT0c7Ozs7Ozs7QUFFSCwwQkFBd0IsYUFBYSxDQUFDLENBQUE7QUFJdEM7SUFBMkMseUNBQVM7SUFFaEQsK0JBQVksTUFBK0I7UUFBL0Isc0JBQStCLEdBQS9CLFdBQStCO1FBQ3ZDLGtCQUFNLE1BQU0sQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFFRCx5Q0FBUyxHQUFULFVBQVUsTUFBOEIsRUFBRSxTQUFvQjtRQUMxRCxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEIsSUFBSSxvQkFBb0IsR0FBRztZQUN2QixJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztZQUV6RCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFbEIsOERBQThEO1lBQzlE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Q0FBQyxDQUFDLENBQUM7WUFDWix5RUFBeUU7WUFDekUsNkVBQTZFO1lBQzdFLFlBQVksR0FBRyxDQUFDLFlBQVksQ0FBQztRQUNqQyxDQUFDO1FBRUQsaUNBQWlDO1FBQ2pDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDekQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFNUMsTUFBTSxDQUFDLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFJLENBQUM7SUFmZSx5QkFBYSxnQkFlNUIsQ0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSCwwQkFBMEIsTUFBYyxFQUFFLE1BQWM7UUFDcEQsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7QUFDTCxDQUFDLEVBdENhLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBc0N4QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9zZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtMaXN0U2VsZWN0b3JDb25maWd9IGZyb20gXCIuL2xpc3RzZWxlY3RvclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIEF1ZGlvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVBdWRpb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF1ZGlvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZUF1ZGlvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGF1ZGlvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdWRpb1F1YWxpdHkgb2YgYXVkaW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbShhdWRpb1F1YWxpdHkuaWQsIGF1ZGlvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBBdWRpb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldEF1ZGlvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgdXBkYXRlQXVkaW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gYXVkaW8gdHJhY2sgaGFzIGNoYW5nZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZUF1ZGlvUXVhbGl0aWVzKTsgLy8gVXBkYXRlIHF1YWxpdGllcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlQXVkaW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0RPV05MT0FEX1FVQUxJVFlfQ0hBTkdFLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gcGxheWVyLmdldERvd25sb2FkZWRBdWRpb0RhdGEoKTtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RJdGVtKGRhdGEuaXNBdXRvID8gXCJhdXRvXCIgOiBkYXRhLmlkKTtcclxuICAgICAgICB9KTsgLy8gVXBkYXRlIHF1YWxpdHkgc2VsZWN0aW9uIHdoZW4gcXVhbGl0eSBpcyBjaGFuZ2VkIChmcm9tIG91dHNpZGUpXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHF1YWxpdGllcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlQXVkaW9RdWFsaXRpZXMoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQXVkaW9UcmFja1NlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVBdWRpb1RyYWNrcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF1ZGlvVHJhY2tzID0gcGxheWVyLmdldEF2YWlsYWJsZUF1ZGlvKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBhdWRpbyB0cmFja3NcclxuICAgICAgICAgICAgZm9yIChsZXQgYXVkaW9UcmFjayBvZiBhdWRpb1RyYWNrcykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRJdGVtKGF1ZGlvVHJhY2suaWQsIGF1ZGlvVHJhY2subGFiZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogQXVkaW9UcmFja1NlbGVjdEJveCwgdmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0QXVkaW8odmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgYXVkaW9UcmFja0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50QXVkaW9UcmFjayA9IHBsYXllci5nZXRBdWRpbygpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oY3VycmVudEF1ZGlvVHJhY2suaWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgYXVkaW9UcmFja0hhbmRsZXIpOyAvLyBVcGRhdGUgc2VsZWN0aW9uIHdoZW4gc2VsZWN0ZWQgdHJhY2sgaGFzIGNoYW5nZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZUF1ZGlvVHJhY2tzKTsgLy8gVXBkYXRlIHRyYWNrcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlQXVkaW9UcmFja3MpOyAvLyBVcGRhdGUgdHJhY2tzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG5cclxuICAgICAgICAvLyBQb3B1bGF0ZSB0cmFja3MgYXQgc3RhcnR1cFxyXG4gICAgICAgIHVwZGF0ZUF1ZGlvVHJhY2tzKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgTm9BcmdzLCBFdmVudH0gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIGJ1dHRvbiBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEJ1dHRvbkNvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0IG9uIHRoZSBidXR0b24uXHJcbiAgICAgKi9cclxuICAgIHRleHQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCdXR0b248Q29uZmlnIGV4dGVuZHMgQnV0dG9uQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgYnV0dG9uRXZlbnRzID0ge1xyXG4gICAgICAgIG9uQ2xpY2s6IG5ldyBFdmVudERpc3BhdGNoZXI8QnV0dG9uPENvbmZpZz4sIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IEJ1dHRvbkNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1idXR0b24nXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgYnV0dG9uRWxlbWVudCA9IG5ldyBET00oJ2J1dHRvbicsIHtcclxuICAgICAgICAgICAgJ3R5cGUnOiAnYnV0dG9uJyxcclxuICAgICAgICAgICAgJ2lkJzogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgICdjbGFzcyc6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSkuYXBwZW5kKG5ldyBET00oJ3NwYW4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdsYWJlbCdcclxuICAgICAgICB9KS5odG1sKHRoaXMuY29uZmlnLnRleHQpKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uQ2xpY2tFdmVudCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gYnV0dG9uRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25DbGlja0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRXZlbnRzLm9uQ2xpY2suZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uQ2xpY2soKTogRXZlbnQ8QnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJ1dHRvbkV2ZW50cy5vbkNsaWNrO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBDYXN0V2FpdGluZ0ZvckRldmljZUV2ZW50ID0gYml0bW92aW4ucGxheWVyLkNhc3RXYWl0aW5nRm9yRGV2aWNlRXZlbnQ7XHJcbmltcG9ydCBDYXN0TGF1bmNoZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5DYXN0TGF1bmNoZWRFdmVudDtcclxuaW1wb3J0IENhc3RTdG9wcGVkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuQ2FzdFN0b3BwZWRFdmVudDtcclxuXHJcbmV4cG9ydCBjbGFzcyBDYXN0U3RhdHVzT3ZlcmxheSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHN0YXR1c0xhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzTGFiZWwgPSBuZXcgTGFiZWw8TGFiZWxDb25maWc+KHtjc3NDbGFzczogJ3VpLWNhc3Qtc3RhdHVzLWxhYmVsJ30pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktY2FzdC1zdGF0dXMtb3ZlcmxheScsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnN0YXR1c0xhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjYXN0RGV2aWNlTmFtZSA9IFwidW5rbm93blwiO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJULCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gU2hvdyBDYXN0IHN0YXR1cyB3aGVuIGEgc2Vzc2lvbiBpcyBiZWluZyBzdGFydGVkXHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICBzZWxmLnN0YXR1c0xhYmVsLnNldFRleHQoXCJTZWxlY3QgYSBDYXN0IGRldmljZVwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1dBSVRJTkdfRk9SX0RFVklDRSwgZnVuY3Rpb24gKGV2ZW50OiBDYXN0V2FpdGluZ0ZvckRldmljZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIEdldCBkZXZpY2UgbmFtZSBhbmQgdXBkYXRlIHN0YXR1cyB0ZXh0IHdoaWxlIGNvbm5lY3RpbmdcclxuICAgICAgICAgICAgY2FzdERldmljZU5hbWUgPSBldmVudC5jYXN0UGF5bG9hZC5kZXZpY2VOYW1lO1xyXG4gICAgICAgICAgICBzZWxmLnN0YXR1c0xhYmVsLnNldFRleHQoYENvbm5lY3RpbmcgdG8gPHN0cm9uZz4ke2Nhc3REZXZpY2VOYW1lfTwvc3Ryb25nPi4uLmApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfTEFVTkNIRUQsIGZ1bmN0aW9uIChldmVudDogQ2FzdExhdW5jaGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gU2Vzc2lvbiBpcyBzdGFydGVkIG9yIHJlc3VtZWRcclxuICAgICAgICAgICAgLy8gRm9yIGNhc2VzIHdoZW4gYSBzZXNzaW9uIGlzIHJlc3VtZWQsIHdlIGRvIG5vdCByZWNlaXZlIHRoZSBwcmV2aW91cyBldmVudHMgYW5kIHRoZXJlZm9yZSBzaG93IHRoZSBzdGF0dXMgcGFuZWwgaGVyZSB0b29cclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhdHVzTGFiZWwuc2V0VGV4dChgUGxheWluZyBvbiA8c3Ryb25nPiR7Y2FzdERldmljZU5hbWV9PC9zdHJvbmc+YCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVE9QLCBmdW5jdGlvbiAoZXZlbnQ6IENhc3RTdG9wcGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gQ2FzdCBzZXNzaW9uIGdvbmUsIGhpZGUgdGhlIHN0YXR1cyBwYW5lbFxyXG4gICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgQ2FzdFRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLWNhc3R0b2dnbGVidXR0b24nLFxyXG4gICAgICAgICAgICB0ZXh0OiAnR29vZ2xlIENhc3QnXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Nhc3RBdmFpbGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5pc0Nhc3RpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5jYXN0U3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuY2FzdFZpZGVvKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhc3QgdW5hdmFpbGFibGVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGNhc3RBdmFpbGFibGVIYW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0QXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0FWQUlMQUJMRSwgY2FzdEF2YWlsYWJsZUhhbmRlcik7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgYnV0dG9uIGlmIENhc3Qgbm90IGF2YWlsYWJsZVxyXG4gICAgICAgIGNhc3RBdmFpbGFibGVIYW5kZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtHdWlkfSBmcm9tIFwiLi4vZ3VpZFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgTm9BcmdzLCBFdmVudH0gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgY29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEgY29tcG9uZW50LlxyXG4gKiBTaG91bGQgYmUgZXh0ZW5kZWQgYnkgY29tcG9uZW50cyB0aGF0IHdhbnQgdG8gYWRkIGFkZGl0aW9uYWwgY29uZmlndXJhdGlvbiBvcHRpb25zLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSFRNTCB0YWcgbmFtZSBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICogRGVmYXVsdDogJ2RpdidcclxuICAgICAqL1xyXG4gICAgdGFnPzogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSFRNTCBJRCBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICogRGVmYXVsdDogYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgd2l0aCBwYXR0ZXJuIFwidWktaWQte2d1aWR9XCIuXHJcbiAgICAgKi9cclxuICAgIGlkPzogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuIFRoaXMgaXMgdXN1YWxseSB0aGUgY2xhc3MgZnJvbSB3aGVyZSB0aGUgY29tcG9uZW50IHRha2VzIGl0cyBzdHlsaW5nLlxyXG4gICAgICovXHJcbiAgICBjc3NDbGFzcz86IHN0cmluZzsgLy8gXCJjbGFzc1wiIGlzIGEgcmVzZXJ2ZWQga2V5d29yZCwgc28gd2UgbmVlZCB0byBtYWtlIHRoZSBuYW1lIG1vcmUgY29tcGxpY2F0ZWRcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZGl0aW9uYWwgQ1NTIGNsYXNzZXMgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgY3NzQ2xhc3Nlcz86IHN0cmluZ1tdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3BlY2lmaWVzIGlmIHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIGhpZGRlbiBhdCBzdGFydHVwLlxyXG4gICAgICogRGVmYXVsdDogZmFsc2VcclxuICAgICAqL1xyXG4gICAgaGlkZGVuPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBiYXNlIGNsYXNzIG9mIHRoZSBVSSBmcmFtZXdvcmsuXHJcbiAqIEVhY2ggY29tcG9uZW50IG11c3QgZXh0ZW5kIHRoaXMgY2xhc3MgYW5kIG9wdGlvbmFsbHkgdGhlIGNvbmZpZyBpbnRlcmZhY2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50PENvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZz4ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNsYXNzbmFtZSB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoZSBlbGVtZW50IHdoZW4gaXQgaXMgaW4gdGhlIGhpZGRlbiBzdGF0ZS5cclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX0hJRERFTiA9IFwiaGlkZGVuXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25maWd1cmF0aW9uIG9iamVjdCBvZiB0aGlzIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNvbmZpZzogQ29uZmlnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNvbXBvbmVudCdzIERPTSBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGVsZW1lbnQ6IERPTTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZsYWcgdGhhdCBrZWVwcyB0cmFjayBvZiB0aGUgaGlkZGVuIHN0YXRlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhpZGRlbjogYm9vbGVhbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsaXN0IG9mIGV2ZW50cyB0aGF0IHRoaXMgY29tcG9uZW50IG9mZmVycy4gVGhlc2UgZXZlbnRzIHNob3VsZCBhbHdheXMgYmUgcHJpdmF0ZSBhbmQgb25seSBkaXJlY3RseVxyXG4gICAgICogYWNjZXNzZWQgZnJvbSB3aXRoaW4gdGhlIGltcGxlbWVudGluZyBjb21wb25lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQmVjYXVzZSBUeXBlU2NyaXB0IGRvZXMgbm90IHN1cHBvcnQgcHJpdmF0ZSBwcm9wZXJ0aWVzIHdpdGggdGhlIHNhbWUgbmFtZSBvbiBkaWZmZXJlbnQgY2xhc3MgaGllcmFyY2h5IGxldmVsc1xyXG4gICAgICogKGkuZS4gc3VwZXJjbGFzcyBhbmQgc3ViY2xhc3MgY2Fubm90IGNvbnRhaW4gYSBwcml2YXRlIHByb3BlcnR5IHdpdGggdGhlIHNhbWUgbmFtZSksIHRoZSBkZWZhdWx0IG5hbWluZ1xyXG4gICAgICogY29udmVudGlvbiBmb3IgdGhlIGV2ZW50IGxpc3Qgb2YgYSBjb21wb25lbnQgdGhhdCBzaG91bGQgYmUgZm9sbG93ZWQgYnkgc3ViY2xhc3NlcyBpcyB0aGUgY29uY2F0ZW5hdGlvbiBvZiB0aGVcclxuICAgICAqIGNhbWVsLWNhc2VkIGNsYXNzIG5hbWUgKyBcIkV2ZW50c1wiIChlLmcuIFN1YkNsYXNzIGV4dGVuZHMgQ29tcG9uZW50ID0+IHN1YkNsYXNzRXZlbnRzKS5cclxuICAgICAqIFNlZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50c30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogRXZlbnQgcHJvcGVydGllcyBzaG91bGQgYmUgbmFtZWQgaW4gY2FtZWwgY2FzZSB3aXRoIGFuIFwib25cIiBwcmVmaXggYW5kIGluIHRoZSBwcmVzZW50IHRlbnNlLiBBc3luYyBldmVudHMgbWF5XHJcbiAgICAgKiBoYXZlIGEgc3RhcnQgZXZlbnQgKHdoZW4gdGhlIG9wZXJhdGlvbiBzdGFydHMpIGluIHRoZSBwcmVzZW50IHRlbnNlLCBhbmQgbXVzdCBoYXZlIGFuIGVuZCBldmVudCAod2hlbiB0aGVcclxuICAgICAqIG9wZXJhdGlvbiBlbmRzKSBpbiB0aGUgcGFzdCB0ZW5zZSAob3IgcHJlc2VudCB0ZW5zZSBpbiBzcGVjaWFsIGNhc2VzIChlLmcuIG9uU3RhcnQvb25TdGFydGVkIG9yIG9uUGxheS9vblBsYXlpbmcpLlxyXG4gICAgICogU2VlIHtAbGluayAjY29tcG9uZW50RXZlbnRzI29uU2hvd30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogRWFjaCBldmVudCBzaG91bGQgYmUgYWNjb21wYW5pZWQgd2l0aCBhIHByb3RlY3RlZCBtZXRob2QgbmFtZWQgYnkgdGhlIGNvbnZlbnRpb24gZXZlbnROYW1lICsgXCJFdmVudFwiXHJcbiAgICAgKiAoZS5nLiBvblN0YXJ0RXZlbnQpLCB0aGF0IGFjdHVhbGx5IHRyaWdnZXJzIHRoZSBldmVudCBieSBjYWxsaW5nIHtAbGluayBFdmVudERpc3BhdGNoZXIjZGlzcGF0Y2ggZGlzcGF0Y2h9IGFuZFxyXG4gICAgICogcGFzc2luZyBhIHJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50IGFzIGZpcnN0IHBhcmFtZXRlci4gQ29tcG9uZW50cyBzaG91bGQgYWx3YXlzIHRyaWdnZXIgdGhlaXIgZXZlbnRzIHdpdGggdGhlc2VcclxuICAgICAqIG1ldGhvZHMuIEltcGxlbWVudGluZyB0aGlzIHBhdHRlcm4gZ2l2ZXMgc3ViY2xhc3NlcyBtZWFucyB0byBkaXJlY3RseSBsaXN0ZW4gdG8gdGhlIGV2ZW50cyBieSBvdmVycmlkaW5nIHRoZVxyXG4gICAgICogbWV0aG9kIChhbmQgc2F2aW5nIHRoZSBvdmVyaGVhZCBvZiBwYXNzaW5nIGEgaGFuZGxlciB0byB0aGUgZXZlbnQgZGlzcGF0Y2hlcikgYW5kIG1vcmUgaW1wb3J0YW50bHkgdG8gdHJpZ2dlclxyXG4gICAgICogdGhlc2UgZXZlbnRzIHdpdGhvdXQgaGF2aW5nIGFjY2VzcyB0byB0aGUgcHJpdmF0ZSBldmVudCBsaXN0LlxyXG4gICAgICogU2VlIHtAbGluayAjb25TaG93fSBmb3IgYW4gZXhhbXBsZS5cclxuICAgICAqXHJcbiAgICAgKiBUbyBwcm92aWRlIGV4dGVybmFsIGNvZGUgdGhlIHBvc3NpYmlsaXR5IHRvIGxpc3RlbiB0byB0aGlzIGNvbXBvbmVudCdzIGV2ZW50cyAoc3Vic2NyaWJlLCB1bnN1YnNjcmliZSwgZXRjLiksXHJcbiAgICAgKiBlYWNoIGV2ZW50IHNob3VsZCBhbHNvIGJlIGFjY29tcGFuaWVkIGJ5IGEgcHVibGljIGdldHRlciBmdW5jdGlvbiB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgdGhlIGV2ZW50J3MgcHJvcGVydHksXHJcbiAgICAgKiB0aGF0IHJldHVybnMgdGhlIHtAbGluayBFdmVudH0gb2J0YWluZWQgZnJvbSB0aGUgZXZlbnQgZGlzcGF0Y2hlciBieSBjYWxsaW5nIHtAbGluayBFdmVudERpc3BhdGNoZXIjZ2V0RXZlbnR9LlxyXG4gICAgICogU2VlIHtAbGluayAjb25TaG93fSBmb3IgYW4gZXhhbXBsZS5cclxuICAgICAqXHJcbiAgICAgKiBGdWxsIGV4YW1wbGUgZm9yIGFuIGV2ZW50IHJlcHJlc2VudGluZyBhbiBleGFtcGxlIGFjdGlvbiBpbiBhIGV4YW1wbGUgY29tcG9uZW50OlxyXG4gICAgICpcclxuICAgICAqIDxjb2RlPlxyXG4gICAgICogLy8gRGVmaW5lIGFuIGV4YW1wbGUgY29tcG9uZW50IGNsYXNzIHdpdGggYW4gZXhhbXBsZSBldmVudFxyXG4gICAgICogY2xhc3MgRXhhbXBsZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudDxDb21wb25lbnRDb25maWc+IHtcclxuICAgICAqXHJcbiAgICAgKiAgICAgcHJpdmF0ZSBleGFtcGxlQ29tcG9uZW50RXZlbnRzID0ge1xyXG4gICAgICogICAgICAgICBvbkV4YW1wbGVBY3Rpb246IG5ldyBFdmVudERpc3BhdGNoZXI8RXhhbXBsZUNvbXBvbmVudCwgTm9BcmdzPigpXHJcbiAgICAgKiAgICAgfVxyXG4gICAgICpcclxuICAgICAqICAgICAvLyBjb25zdHJ1Y3RvciBhbmQgb3RoZXIgc3R1ZmYuLi5cclxuICAgICAqXHJcbiAgICAgKiAgICAgcHJvdGVjdGVkIG9uRXhhbXBsZUFjdGlvbkV2ZW50KCkge1xyXG4gICAgICogICAgICAgIHRoaXMuZXhhbXBsZUNvbXBvbmVudEV2ZW50cy5vbkV4YW1wbGVBY3Rpb24uZGlzcGF0Y2godGhpcyk7XHJcbiAgICAgKiAgICB9XHJcbiAgICAgKlxyXG4gICAgICogICAgZ2V0IG9uRXhhbXBsZUFjdGlvbigpOiBFdmVudDxFeGFtcGxlQ29tcG9uZW50LCBOb0FyZ3M+IHtcclxuICAgICAqICAgICAgICByZXR1cm4gdGhpcy5leGFtcGxlQ29tcG9uZW50RXZlbnRzLm9uRXhhbXBsZUFjdGlvbi5nZXRFdmVudCgpO1xyXG4gICAgICogICAgfVxyXG4gICAgICogfVxyXG4gICAgICpcclxuICAgICAqIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IHNvbWV3aGVyZVxyXG4gICAgICogdmFyIGV4YW1wbGVDb21wb25lbnRJbnN0YW5jZSA9IG5ldyBFeGFtcGxlQ29tcG9uZW50KCk7XHJcbiAgICAgKlxyXG4gICAgICogLy8gU3Vic2NyaWJlIHRvIHRoZSBleGFtcGxlIGV2ZW50IG9uIHRoZSBjb21wb25lbnRcclxuICAgICAqIGV4YW1wbGVDb21wb25lbnRJbnN0YW5jZS5vbkV4YW1wbGVBY3Rpb24uc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IEV4YW1wbGVDb21wb25lbnQpIHtcclxuICAgICAqICAgICBjb25zb2xlLmxvZyhcIm9uRXhhbXBsZUFjdGlvbiBvZiBcIiArIHNlbmRlciArIFwiIGhhcyBmaXJlZCFcIik7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIDwvY29kZT5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb21wb25lbnRFdmVudHMgPSB7XHJcbiAgICAgICAgb25TaG93OiBuZXcgRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25IaWRlOiBuZXcgRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIGEgY29tcG9uZW50IHdpdGggYW4gb3B0aW9uYWxseSBzdXBwbGllZCBjb25maWcuIEFsbCBzdWJjbGFzc2VzIG11c3QgY2FsbCB0aGUgY29uc3RydWN0b3Igb2YgdGhlaXJcclxuICAgICAqIHN1cGVyY2xhc3MgYW5kIHRoZW4gbWVyZ2UgdGhlaXIgY29uZmlndXJhdGlvbiBpbnRvIHRoZSBjb21wb25lbnQncyBjb25maWd1cmF0aW9uLlxyXG4gICAgICogQHBhcmFtIGNvbmZpZyB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbXBvbmVudENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY29uZmlnKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGlzIGNvbXBvbmVudFxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gPENvbmZpZz50aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICB0YWc6ICdkaXYnLFxyXG4gICAgICAgICAgICBpZDogJ3VpLWlkLScgKyBHdWlkLm5leHQoKSxcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1jb21wb25lbnQnLFxyXG4gICAgICAgICAgICBjc3NDbGFzc2VzOiBbXSxcclxuICAgICAgICAgICAgaGlkZGVuOiBmYWxzZVxyXG4gICAgICAgIH0sIHt9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemVzIHRoZSBjb21wb25lbnQsIGUuZy4gYnkgYXBwbHlpbmcgY29uZmlnIHNldHRpbmdzLlxyXG4gICAgICogVGhpcyBtZXRob2QgbXVzdCBub3QgYmUgY2FsbGVkIGZyb20gb3V0c2lkZSB0aGUgVUkgZnJhbWV3b3JrLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGF1dG9tYXRpY2FsbHkgY2FsbGVkIGJ5IHRoZSB7QGxpbmsgVUlNYW5hZ2VyfS4gSWYgdGhlIGNvbXBvbmVudCBpcyBhbiBpbm5lciBjb21wb25lbnQgb2ZcclxuICAgICAqIHNvbWUgY29tcG9uZW50LCBhbmQgdGh1cyBlbmNhcHN1bGF0ZWQgYWJkIG1hbmFnZWQgaW50ZXJuYWxseSBhbmQgbmV2ZXIgZGlyZWN0bHkgZXhwb3NlZCB0byB0aGUgVUlNYW5hZ2VyLFxyXG4gICAgICogdGhpcyBtZXRob2QgbXVzdCBiZSBjYWxsZWQgZnJvbSB0aGUgbWFuYWdpbmcgY29tcG9uZW50J3Mge0BsaW5rICNpbml0aWFsaXplfSBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGluaXRpYWxpemUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0aGlzLmNvbmZpZy5oaWRkZW47XHJcblxyXG4gICAgICAgIC8vIEhpZGUgdGhlIGNvbXBvbmVudCBhdCBpbml0aWFsaXphdGlvbiBpZiBpdCBpcyBjb25maWd1cmVkIHRvIGJlIGhpZGRlblxyXG4gICAgICAgIGlmICh0aGlzLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uZmlndXJlcyB0aGUgY29tcG9uZW50IGZvciB0aGUgc3VwcGxpZWQgUGxheWVyIGFuZCBVSU1hbmFnZXIuIFRoaXMgaXMgdGhlIHBsYWNlIHdoZXJlIGFsbCB0aGUgbWFnaWMgaGFwcGVucyxcclxuICAgICAqIHdoZXJlIGNvbXBvbmVudHMgdHlwaWNhbGx5IHN1YnNjcmliZSBhbmQgcmVhY3QgdG8gZXZlbnRzIChvbiB0aGVpciBET00gZWxlbWVudCwgdGhlIFBsYXllciwgb3IgdGhlIFVJTWFuYWdlciksXHJcbiAgICAgKiBhbmQgYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgdGhhdCBtYWtlcyB0aGVtIGludGVyYWN0aXZlLlxyXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIG9ubHkgb25jZSwgd2hlbiB0aGUgVUlNYW5hZ2VyIGluaXRpYWxpemVzIHRoZSBVSS5cclxuICAgICAqXHJcbiAgICAgKiBTdWJjbGFzc2VzIHVzdWFsbHkgb3ZlcndyaXRlIHRoaXMgbWV0aG9kIHRvIGFkZCB0aGVpciBvd24gZnVuY3Rpb25hbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcGxheWVyIHRoZSBwbGF5ZXIgd2hpY2ggdGhpcyBjb21wb25lbnQgY29udHJvbHNcclxuICAgICAqIEBwYXJhbSB1aW1hbmFnZXIgdGhlIFVJTWFuYWdlciB0aGF0IG1hbmFnZXMgdGhpcyBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBub3RoaW5nIHRvIGRvIGhlcmU7IG92ZXJ3cml0ZSBpbiBzdWJjbGFzc2VzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSB0aGUgRE9NIGVsZW1lbnQgZm9yIHRoaXMgY29tcG9uZW50LlxyXG4gICAgICpcclxuICAgICAqIFN1YmNsYXNzZXMgdXN1YWxseSBvdmVyd3JpdGUgdGhpcyBtZXRob2QgdG8gZXh0ZW5kIG9yIHJlcGxhY2UgdGhlIERPTSBlbGVtZW50IHdpdGggdGhlaXIgb3duIGRlc2lnbi5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gbmV3IERPTSh0aGlzLmNvbmZpZy50YWcsIHtcclxuICAgICAgICAgICAgJ2lkJzogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgICdjbGFzcyc6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBET00gZWxlbWVudCBvZiB0aGlzIGNvbXBvbmVudC4gQ3JlYXRlcyB0aGUgRE9NIGVsZW1lbnQgaWYgaXQgZG9lcyBub3QgeWV0IGV4aXN0LlxyXG4gICAgICpcclxuICAgICAqIFNob3VsZCBub3QgYmUgb3ZlcndyaXR0ZW4gYnkgc3ViY2xhc3Nlcy5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBnZXREb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50ID0gdGhpcy50b0RvbUVsZW1lbnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBNZXJnZXMgYSBjb25maWd1cmF0aW9uIHdpdGggYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gYW5kIGEgYmFzZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIHN1cGVyY2xhc3MuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGNvbmZpZyB0aGUgY29uZmlndXJhdGlvbiBzZXR0aW5ncyBmb3IgdGhlIGNvbXBvbmVudHMsIGFzIHVzdWFsbHkgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3RvclxyXG4gICAgICogQHBhcmFtIGRlZmF1bHRzIGEgZGVmYXVsdCBjb25maWd1cmF0aW9uIGZvciBzZXR0aW5ncyB0aGF0IGFyZSBub3QgcGFzc2VkIHdpdGggdGhlIGNvbmZpZ3VyYXRpb25cclxuICAgICAqIEBwYXJhbSBiYXNlIGNvbmZpZ3VyYXRpb24gaW5oZXJpdGVkIGZyb20gYSBzdXBlcmNsYXNzXHJcbiAgICAgKiBAcmV0dXJucyB7Q29uZmlnfVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgbWVyZ2VDb25maWc8Q29uZmlnPihjb25maWc6IENvbmZpZywgZGVmYXVsdHM6IENvbmZpZywgYmFzZTogQ29uZmlnKTogQ29uZmlnIHtcclxuICAgICAgICAvLyBFeHRlbmQgZGVmYXVsdCBjb25maWcgd2l0aCBzdXBwbGllZCBjb25maWdcclxuICAgICAgICBsZXQgbWVyZ2VkID0gT2JqZWN0LmFzc2lnbih7fSwgYmFzZSwgZGVmYXVsdHMsIGNvbmZpZyk7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiB0aGUgZXh0ZW5kZWQgY29uZmlnXHJcbiAgICAgICAgcmV0dXJuIG1lcmdlZDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCByZXR1cm5zIGEgc3RyaW5nIG9mIGFsbCBDU1MgY2xhc3NlcyBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBnZXRDc3NDbGFzc2VzKCk6IHN0cmluZyB7XHJcbiAgICAgICAgLy8gTWVyZ2UgYWxsIENTUyBjbGFzc2VzIGludG8gc2luZ2xlIGFycmF5XHJcbiAgICAgICAgbGV0IGZsYXR0ZW5lZEFycmF5ID0gW3RoaXMuY29uZmlnLmNzc0NsYXNzXS5jb25jYXQodGhpcy5jb25maWcuY3NzQ2xhc3Nlcyk7XHJcbiAgICAgICAgLy8gSm9pbiBhcnJheSB2YWx1ZXMgaW50byBhIHN0cmluZ1xyXG4gICAgICAgIGxldCBmbGF0dGVuZWRTdHJpbmcgPSBmbGF0dGVuZWRBcnJheS5qb2luKCcgJyk7XHJcbiAgICAgICAgLy8gUmV0dXJuIHRyaW1tZWQgc3RyaW5nIHRvIHByZXZlbnQgd2hpdGVzcGFjZSBhdCB0aGUgZW5kIGZyb20gdGhlIGpvaW4gb3BlcmF0aW9uXHJcbiAgICAgICAgcmV0dXJuIGZsYXR0ZW5lZFN0cmluZy50cmltKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICogQHJldHVybnMge0NvbmZpZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENvbmZpZygpOiBDb25maWcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGVzIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBiYXNpY2FsbHkgdHJhbnNmZXJzIHRoZSBjb21wb25lbnQgaW50byB0aGUgaGlkZGVuIHN0YXRlLiBBY3R1YWwgaGlkaW5nIGlzIGRvbmUgdmlhIENTUy5cclxuICAgICAqL1xyXG4gICAgaGlkZSgpIHtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3MoQ29tcG9uZW50LkNMQVNTX0hJRERFTik7XHJcbiAgICAgICAgdGhpcy5vbkhpZGVFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvd3MgdGhlIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhDb21wb25lbnQuQ0xBU1NfSElEREVOKTtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub25TaG93RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVybWluZXMgaWYgdGhlIGNvbXBvbmVudCBpcyBoaWRkZW4uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGlzIGhpZGRlbiwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBpc0hpZGRlbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oaWRkZW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBjb21wb25lbnQgaXMgc2hvd24uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGlzIHZpc2libGUsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNTaG93bigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaXNIaWRkZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIGhpZGRlbiBzdGF0ZSBieSBoaWRpbmcgdGhlIGNvbXBvbmVudCBpZiBpdCBpcyBzaG93biwgb3Igc2hvd2luZyBpdCBpZiBoaWRkZW4uXHJcbiAgICAgKi9cclxuICAgIHRvZ2dsZUhpZGRlbigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSBvblNob3cgZXZlbnQuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIG9uU2hvd0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uU2hvdy5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSBvbkhpZGUgZXZlbnQuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIG9uSGlkZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uSGlkZS5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIHNob3dpbmcuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TaG93KCk6IEV2ZW50PENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRFdmVudHMub25TaG93LmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBoaWRpbmcuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25IaWRlKCk6IEV2ZW50PENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRFdmVudHMub25IaWRlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0FycmF5VXRpbHN9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb250YWluZXJDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGlsZCBjb21wb25lbnRzIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICAgKi9cclxuICAgIGNvbXBvbmVudHM/OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPltdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyPENvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBpbm5lckNvbnRhaW5lckVsZW1lbnQ6IERPTTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1jb250YWluZXInLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbXVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBjaGlsZCBjb21wb25lbnQgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAqIEBwYXJhbSBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pIHtcclxuICAgICAgICB0aGlzLmNvbmZpZy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYSBjaGlsZCBjb21wb25lbnQgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICByZW1vdmVDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPikge1xyXG4gICAgICAgIEFycmF5VXRpbHMucmVtb3ZlKHRoaXMuY29uZmlnLmNvbXBvbmVudHMsIGNvbXBvbmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIGFuIGFycmF5IG9mIGFsbCBjaGlsZCBjb21wb25lbnRzIGluIHRoaXMgY29udGFpbmVyLlxyXG4gICAgICogQHJldHVybnMge0NvbXBvbmVudDxDb21wb25lbnRDb25maWc+W119XHJcbiAgICAgKi9cclxuICAgIGdldENvbXBvbmVudHMoKTogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz5bXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmNvbXBvbmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUNvbXBvbmVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pbm5lckNvbnRhaW5lckVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29tcG9uZW50IG9mIHRoaXMuY29uZmlnLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5pbm5lckNvbnRhaW5lckVsZW1lbnQuYXBwZW5kKGNvbXBvbmVudC5nZXREb21FbGVtZW50KCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgbGV0IGNvbnRhaW5lckVsZW1lbnQgPSBuZXcgRE9NKHRoaXMuY29uZmlnLnRhZywge1xyXG4gICAgICAgICAgICAnaWQnOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgJ2NsYXNzJzogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGlubmVyQ29udGFpbmVyID0gbmV3IERPTSh0aGlzLmNvbmZpZy50YWcsIHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ2NvbnRhaW5lci13cmFwcGVyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaW5uZXJDb250YWluZXJFbGVtZW50ID0gaW5uZXJDb250YWluZXI7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlQ29tcG9uZW50cygpO1xyXG5cclxuICAgICAgICBjb250YWluZXJFbGVtZW50LmFwcGVuZChpbm5lckNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgIHJldHVybiBjb250YWluZXJFbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtUaW1lb3V0fSBmcm9tIFwiLi4vdGltZW91dFwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb250cm9sQmFyQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGFmdGVyIHdoaWNoIHRoZSBjb250cm9sIGJhciB3aWxsIGJlIGhpZGRlbiB3aGVuIHRoZXJlIGlzIG5vIHVzZXIgaW50ZXJhY3Rpb24uXHJcbiAgICAgKiBEZWZhdWx0OiA1IHNlY29uZHNcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ29udHJvbEJhciBleHRlbmRzIENvbnRhaW5lcjxDb250cm9sQmFyQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250cm9sQmFyQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLWNvbnRyb2xiYXInLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIGhpZGVEZWxheTogNTAwMFxyXG4gICAgICAgIH0sIDxDb250cm9sQmFyQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgaXNTZWVraW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxDb250cm9sQmFyQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkgeyAvLyBUT0RPIGZpeCBnZW5lcmljcyB0byBzcGFyZSB0aGVzZSBkYW1uIGNhc3RzLi4uIGlzIHRoYXQgZXZlbiBwb3NzaWJsZSBpbiBUUz9cclxuICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlRW50ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7IC8vIHNob3cgY29udHJvbCBiYXIgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSVxyXG5cclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpOyAvLyBDbGVhciB0aW1lb3V0IHRvIGF2b2lkIGhpZGluZyB0aGUgY29udHJvbCBiYXIgaWYgdGhlIG1vdXNlIG1vdmVzIGJhY2sgaW50byB0aGUgVUkgZHVyaW5nIHRoZSB0aW1lb3V0IHBlcmlvZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEb24ndCBjcmVhdGUvdXBkYXRlIHRpbWVvdXQgd2hpbGUgc2Vla2luZ1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgdGhlIGNvbnRyb2wgYmFyIGlmIG1vdXNlIGRvZXMgbm90IG1vdmUgZHVyaW5nIHRoZSB0aW1lb3V0IHRpbWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvbid0IGNyZWF0ZS91cGRhdGUgdGltZW91dCB3aGlsZSBzZWVraW5nXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSBjb250cm9sIGJhciBzb21lIHRpbWUgYWZ0ZXIgdGhlIG1vdXNlIGxlZnQgdGhlIFVJXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7IC8vIERvbid0IGhpZGUgY29udHJvbCBiYXIgd2hpbGUgYSBzZWVrIGlzIGluIHByb2dyZXNzXHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aW1lb3V0LnN0YXJ0KCk7IC8vIGhpZGUgY29udHJvbCBiYXIgc29tZSB0aW1lIGFmdGVyIGEgc2VlayBoYXMgZmluaXNoZWRcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgRXJyb3JFdmVudCA9IGJpdG1vdmluLnBsYXllci5FcnJvckV2ZW50O1xyXG5cclxuZXhwb3J0IGNsYXNzIEVycm9yTWVzc2FnZU92ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBlcnJvckxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuZXJyb3JMYWJlbCA9IG5ldyBMYWJlbDxMYWJlbENvbmZpZz4oe2Nzc0NsYXNzOiAndWktZXJyb3JtZXNzYWdlLWxhYmVsJ30pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktZXJyb3JtZXNzYWdlLW92ZXJsYXknLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy5lcnJvckxhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9FUlJPUiwgZnVuY3Rpb24gKGV2ZW50OiBFcnJvckV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXJyb3JMYWJlbC5zZXRUZXh0KGV2ZW50Lm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLWZ1bGxzY3JlZW50b2dnbGVidXR0b24nLFxyXG4gICAgICAgICAgICB0ZXh0OiAnRnVsbHNjcmVlbidcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBmdWxsc2NyZWVuU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzRnVsbHNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fRlVMTFNDUkVFTl9FTlRFUiwgZnVsbHNjcmVlblN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fRlVMTFNDUkVFTl9FWElULCBmdWxsc2NyZWVuU3RhdGVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNGdWxsc2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5leGl0RnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmVudGVyRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFBsYXllckV2ZW50ID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50O1xyXG5cclxuZXhwb3J0IGNsYXNzIEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbiBleHRlbmRzIFBsYXliYWNrVG9nZ2xlQnV0dG9uIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLWh1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvbicsXHJcbiAgICAgICAgICAgIHRleHQ6ICdQbGF5L1BhdXNlJ1xyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIC8vIFVwZGF0ZSBidXR0b24gc3RhdGUgdGhyb3VnaCBBUEkgZXZlbnRzXHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHRvZ2dsZVBsYXliYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzUGxheWluZygpKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgdG9nZ2xlRnVsbHNjcmVlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Z1bGxzY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmV4aXRGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZW50ZXJGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgY2xpY2tUaW1lID0gMDtcclxuICAgICAgICBsZXQgZG91YmxlQ2xpY2tUaW1lID0gMDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBZb3VUdWJlLXN0eWxlIHRvZ2dsZSBidXR0b24gaGFuZGxpbmdcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFRoZSBnb2FsIGlzIHRvIHByZXZlbnQgYSBzaG9ydCBwYXVzZSBvciBwbGF5YmFjayBpbnRlcnZhbCBiZXR3ZWVuIGEgY2xpY2ssIHRoYXQgdG9nZ2xlcyBwbGF5YmFjaywgYW5kIGFcclxuICAgICAgICAgKiBkb3VibGUgY2xpY2ssIHRoYXQgdG9nZ2xlcyBmdWxsc2NyZWVuLiBJbiB0aGlzIG5haXZlIGFwcHJvYWNoLCB0aGUgZmlyc3QgY2xpY2sgd291bGQgZS5nLiBzdGFydCBwbGF5YmFjayxcclxuICAgICAgICAgKiB0aGUgc2Vjb25kIGNsaWNrIHdvdWxkIGJlIGRldGVjdGVkIGFzIGRvdWJsZSBjbGljayBhbmQgdG9nZ2xlIHRvIGZ1bGxzY3JlZW4sIGFuZCBhcyBzZWNvbmQgbm9ybWFsIGNsaWNrIHN0b3BcclxuICAgICAgICAgKiBwbGF5YmFjaywgd2hpY2ggcmVzdWx0cyBpcyBhIHNob3J0IHBsYXliYWNrIGludGVydmFsIHdpdGggbWF4IGxlbmd0aCBvZiB0aGUgZG91YmxlIGNsaWNrIGRldGVjdGlvblxyXG4gICAgICAgICAqIHBlcmlvZCAodXN1YWxseSA1MDBtcykuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUbyBzb2x2ZSB0aGlzIGlzc3VlLCB3ZSBkZWZlciBoYW5kbGluZyBvZiB0aGUgZmlyc3QgY2xpY2sgZm9yIDIwMG1zLCB3aGljaCBpcyBhbG1vc3QgdW5ub3RpY2VhYmxlIHRvIHRoZSB1c2VyLFxyXG4gICAgICAgICAqIGFuZCBqdXN0IHRvZ2dsZSBwbGF5YmFjayBpZiBubyBzZWNvbmQgY2xpY2sgKGRvdWJsZSBjbGljaykgaGFzIGJlZW4gcmVnaXN0ZXJlZCBkdXJpbmcgdGhpcyBwZXJpb2QuIElmIGEgZG91YmxlXHJcbiAgICAgICAgICogY2xpY2sgaXMgcmVnaXN0ZXJlZCwgd2UganVzdCB0b2dnbGUgdGhlIGZ1bGxzY3JlZW4uIEluIHRoZSBmaXJzdCAyMDBtcywgdW5kZXNpcmVkIHBsYXliYWNrIGNoYW5nZXMgdGh1cyBjYW5ub3RcclxuICAgICAgICAgKiBoYXBwZW4uIElmIGEgZG91YmxlIGNsaWNrIGlzIHJlZ2lzdGVyZWQgd2l0aGluIDUwMG1zLCB3ZSB1bmRvIHRoZSBwbGF5YmFjayBjaGFuZ2UgYW5kIHN3aXRjaCBmdWxsc2NyZWVuIG1vZGUuXHJcbiAgICAgICAgICogSW4gdGhlIGVuZCwgdGhpcyBtZXRob2QgYmFzaWNhbGx5IGludHJvZHVjZXMgYSAyMDBtcyBvYnNlcnZpbmcgaW50ZXJ2YWwgaW4gd2hpY2ggcGxheWJhY2sgY2hhbmdlcyBhcmUgcHJldmVudGVkXHJcbiAgICAgICAgICogaWYgYSBkb3VibGUgY2xpY2sgaGFwcGVucy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm93IC0gY2xpY2tUaW1lIDwgMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgZG91YmxlIGNsaWNrIGluc2lkZSB0aGUgMjAwbXMgaW50ZXJ2YWwsIGp1c3QgdG9nZ2xlIGZ1bGxzY3JlZW4gbW9kZVxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICAgICAgZG91YmxlQ2xpY2tUaW1lID0gbm93O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vdyAtIGNsaWNrVGltZSA8IDUwMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIGRvdWJsZSBjbGljayBpbnNpZGUgdGhlIDUwMG1zIGludGVydmFsLCB1bmRvIHBsYXliYWNrIHRvZ2dsZSBhbmQgdG9nZ2xlIGZ1bGxzY3JlZW4gbW9kZVxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICAgICAgdG9nZ2xlUGxheWJhY2soKTtcclxuICAgICAgICAgICAgICAgIGRvdWJsZUNsaWNrVGltZSA9IG5vdztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xpY2tUaW1lID0gbm93O1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGRvdWJsZUNsaWNrVGltZSA+IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGRvdWJsZSBjbGljayBkZXRlY3RlZCwgc28gd2UgdG9nZ2xlIHBsYXliYWNrIGFuZCB3YWl0IHdoYXQgaGFwcGVucyBuZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlUGxheWJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSGlkZSB0aGUgaHVnZSBwbGF5YmFjayBidXR0b24gZHVyaW5nIFZSIHBsYXliYWNrIHRvIGxldCBtb3VzZSBldmVudHMgcGFzcyB0aHJvdWdoIGFuZCBuYXZpZ2F0ZSB0aGUgVlIgdmlld3BvcnRcclxuICAgICAgICBzZWxmLm9uVG9nZ2xlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5jb250ZW50VHlwZSAhPSAnbm9uZScpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNQbGF5aW5nKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSGlkZSBidXR0b24gd2hpbGUgaW5pdGlhbGl6aW5nIGEgQ2FzdCBzZXNzaW9uXHJcbiAgICAgICAgbGV0IGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IFBsYXllckV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09IGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJUKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBIaWRlIGJ1dHRvbiB3aGVuIHNlc3Npb24gaXMgYmVpbmcgaW5pdGlhbGl6ZWRcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gU2hvdyBidXR0b24gd2hlbiBzZXNzaW9uIGlzIGVzdGFibGlzaGVkIG9yIGluaXRpYWxpemF0aW9uIHdhcyBhYm9ydGVkXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVEFSVCwgY2FzdEluaXRpYWxpemF0aW9uSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9MQVVOQ0hFRCwgY2FzdEluaXRpYWxpemF0aW9uSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVE9QLCBjYXN0SW5pdGlhbGl6YXRpb25IYW5kbGVyKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBzdXBlci50b0RvbUVsZW1lbnQoKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGNoaWxkIHRoYXQgY29udGFpbnMgdGhlIHBsYXkgYnV0dG9uIGltYWdlXHJcbiAgICAgICAgLy8gU2V0dGluZyB0aGUgaW1hZ2UgZGlyZWN0bHkgb24gdGhlIGJ1dHRvbiBkb2VzIG5vdCB3b3JrIHRvZ2V0aGVyIHdpdGggc2NhbGluZyBhbmltYXRpb25zLCBiZWNhdXNlIHRoZSBidXR0b25cclxuICAgICAgICAvLyBjYW4gY292ZXIgdGhlIHdob2xlIHZpZGVvIHBsYXllciBhcmUgYW5kIHNjYWxpbmcgd291bGQgZXh0ZW5kIGl0IGJleW9uZC4gQnkgYWRkaW5nIGFuIGlubmVyIGVsZW1lbnQsIGNvbmZpbmVkXHJcbiAgICAgICAgLy8gdG8gdGhlIHNpemUgaWYgdGhlIGltYWdlLCBpdCBjYW4gc2NhbGUgaW5zaWRlIHRoZSBwbGF5ZXIgd2l0aG91dCBvdmVyc2hvb3RpbmcuXHJcbiAgICAgICAgYnV0dG9uRWxlbWVudC5hcHBlbmQobmV3IERPTSgnZGl2Jywge1xyXG4gICAgICAgICAgICAnY2xhc3MnOiAnaW1hZ2UnXHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgICAgICByZXR1cm4gYnV0dG9uRWxlbWVudDtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb21wb25lbnRDb25maWcsIENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEgbGFiZWwgY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMYWJlbENvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0IG9uIHRoZSBsYWJlbC5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExhYmVsPENvbmZpZyBleHRlbmRzIExhYmVsQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxMYWJlbENvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGFiZWxDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1sYWJlbCdcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIHZhciBsYWJlbEVsZW1lbnQgPSBuZXcgRE9NKCdzcGFuJywge1xyXG4gICAgICAgICAgICAnaWQnOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgJ2NsYXNzJzogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KS5odG1sKHRoaXMuY29uZmlnLnRleHQpO1xyXG5cclxuICAgICAgICByZXR1cm4gbGFiZWxFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuaHRtbCh0ZXh0KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb21wb25lbnQsIENvbXBvbmVudENvbmZpZ30gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RXZlbnREaXNwYXRjaGVyLCBFdmVudH0gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBMaXN0SXRlbUNvbGxlY3Rpb24ge1xyXG4gICAgLy8gdmFsdWUgLT4gbGFiZWwgbWFwcGluZ1xyXG4gICAgW3ZhbHVlOiBzdHJpbmddOiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlzdFNlbGVjdG9yQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIGl0ZW1zPzogTGlzdEl0ZW1Db2xsZWN0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTGlzdFNlbGVjdG9yPENvbmZpZyBleHRlbmRzIExpc3RTZWxlY3RvckNvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8TGlzdFNlbGVjdG9yQ29uZmlnPiB7XHJcblxyXG4gICAgcHJvdGVjdGVkIGl0ZW1zOiBMaXN0SXRlbUNvbGxlY3Rpb247XHJcbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWRJdGVtOiBzdHJpbmc7XHJcblxyXG4gICAgcHJpdmF0ZSBsaXN0U2VsZWN0b3JFdmVudHMgPSB7XHJcbiAgICAgICAgb25JdGVtQWRkZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKSxcclxuICAgICAgICBvbkl0ZW1SZW1vdmVkOiBuZXcgRXZlbnREaXNwYXRjaGVyPExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+KCksXHJcbiAgICAgICAgb25JdGVtU2VsZWN0ZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBpdGVtczoge30sXHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktbGlzdHNlbGVjdG9yJ1xyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IHRoaXMuY29uZmlnLml0ZW1zO1xyXG4gICAgfVxyXG5cclxuICAgIGhhc0l0ZW0odmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW3ZhbHVlXSAhPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZEl0ZW0odmFsdWU6IHN0cmluZywgbGFiZWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuaXRlbXNbdmFsdWVdID0gbGFiZWw7XHJcbiAgICAgICAgdGhpcy5vbkl0ZW1BZGRlZEV2ZW50KHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVJdGVtKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNJdGVtKHZhbHVlKSkge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5pdGVtc1t2YWx1ZV07XHJcbiAgICAgICAgICAgIHRoaXMub25JdGVtUmVtb3ZlZEV2ZW50KHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0SXRlbSh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHZhbHVlID09IHRoaXMuc2VsZWN0ZWRJdGVtKSB7XHJcbiAgICAgICAgICAgIC8vIGl0ZW1Db25maWcgaXMgYWxyZWFkeSBzZWxlY3RlZCwgc3VwcHJlc3MgYW55IGZ1cnRoZXIgYWN0aW9uXHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaXRlbXNbdmFsdWVdICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgdGhpcy5vbkl0ZW1TZWxlY3RlZEV2ZW50KHZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U2VsZWN0ZWRJdGVtKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFySXRlbXMoKSB7XHJcbiAgICAgICAgbGV0IGl0ZW1zID0gdGhpcy5pdGVtczsgLy8gbG9jYWwgY29weSBmb3IgaXRlcmF0aW9uIGFmdGVyIGNsZWFyXHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IHt9OyAvLyBjbGVhciBpdGVtc1xyXG5cclxuICAgICAgICAvLyBmaXJlIGV2ZW50c1xyXG4gICAgICAgIGZvciAobGV0IHZhbHVlIGluIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25JdGVtUmVtb3ZlZEV2ZW50KHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXRlbUNvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuaXRlbXMpLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25JdGVtQWRkZWRFdmVudCh2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtQWRkZWQuZGlzcGF0Y2godGhpcywgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1SZW1vdmVkRXZlbnQodmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbVJlbW92ZWQuZGlzcGF0Y2godGhpcywgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1TZWxlY3RlZEV2ZW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1TZWxlY3RlZC5kaXNwYXRjaCh0aGlzLCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uSXRlbUFkZGVkKCk6IEV2ZW50PExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtQWRkZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25JdGVtUmVtb3ZlZCgpOiBFdmVudDxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbVJlbW92ZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25JdGVtU2VsZWN0ZWQoKTogRXZlbnQ8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1TZWxlY3RlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0xhYmVsQ29uZmlnLCBMYWJlbH0gZnJvbSBcIi4vbGFiZWxcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG4vKipcclxuICogQSBsYWJlbCB0aGF0IGRpc3BsYXkgdGhlIGN1cnJlbnQgcGxheWJhY2sgdGltZSBhbmQgdGhlIHRvdGFsIHRpbWUgdGhyb3VnaCB7QGxpbmsgUGxheWJhY2tUaW1lTGFiZWwjc2V0VGltZSBzZXRUaW1lfVxyXG4gKiBvciBhbnkgc3RyaW5nIHRocm91Z2gge0BsaW5rIFBsYXliYWNrVGltZUxhYmVsI3NldFRleHQgc2V0VGV4dH0uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGxheWJhY2tUaW1lTGFiZWwgZXh0ZW5kcyBMYWJlbDxMYWJlbENvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGFiZWxDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBwbGF5YmFja1RpbWVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmdldER1cmF0aW9uKCkgPT0gSW5maW5pdHkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGV4dCgnTGl2ZScpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lKHBsYXllci5nZXRDdXJyZW50VGltZSgpLCBwbGF5ZXIuZ2V0RHVyYXRpb24oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHBsYXliYWNrVGltZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFRUtFRCwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURSwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIEluaXQgdGltZSBkaXNwbGF5ICh3aGVuIHRoZSBVSSBpcyBpbml0aWFsaXplZCwgaXQncyB0b28gbGF0ZSBmb3IgdGhlIE9OX1JFQURZIGV2ZW50KVxyXG4gICAgICAgIHBsYXliYWNrVGltZUhhbmRsZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRUaW1lKHBsYXliYWNrU2Vjb25kczogbnVtYmVyLCBkdXJhdGlvblNlY29uZHM6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0VGV4dChgJHtTdHJpbmdVdGlscy5zZWNvbmRzVG9UaW1lKHBsYXliYWNrU2Vjb25kcyl9IC8gJHtTdHJpbmdVdGlscy5zZWNvbmRzVG9UaW1lKGR1cmF0aW9uU2Vjb25kcyl9YCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uLCBUb2dnbGVCdXR0b25Db25maWd9IGZyb20gXCIuL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgUGxheWVyRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyRXZlbnQ7XHJcblxyXG5leHBvcnQgY2xhc3MgUGxheWJhY2tUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1wbGF5YmFja3RvZ2dsZWJ1dHRvbicsXHJcbiAgICAgICAgICAgIHRleHQ6ICdQbGF5L1BhdXNlJ1xyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlciwgaGFuZGxlQ2xpY2tFdmVudDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGlzU2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGVyIHRvIHVwZGF0ZSBidXR0b24gc3RhdGUgYmFzZWQgb24gcGxheWVyIHN0YXRlXHJcbiAgICAgICAgbGV0IHBsYXliYWNrU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50OiBQbGF5ZXJFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgVUkgaXMgY3VycmVudGx5IHNlZWtpbmcsIHBsYXliYWNrIGlzIHRlbXBvcmFyaWx5IHN0b3BwZWQgYnV0IHRoZSBidXR0b25zIHNob3VsZFxyXG4gICAgICAgICAgICAvLyBub3QgcmVmbGVjdCB0aGF0IGFuZCBzdGF5IGFzLWlzIChlLmcgaW5kaWNhdGUgcGxheWJhY2sgd2hpbGUgc2Vla2luZykuXHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyByZXBsYWNlIHRoaXMgaGFjayB3aXRoIGEgc29sZSBwbGF5ZXIuaXNQbGF5aW5nKCkgY2FsbCBvbmNlIGlzc3VlICMxMjAzIGlzIGZpeGVkXHJcbiAgICAgICAgICAgIGxldCBpc1BsYXlpbmcgPSBwbGF5ZXIuaXNQbGF5aW5nKCk7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0aW5nKCkgJiZcclxuICAgICAgICAgICAgICAgIChldmVudC50eXBlID09IGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZIHx8IGV2ZW50LnR5cGUgPT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVlcclxuICAgICAgICAgICAgICAgIHx8IGV2ZW50LnR5cGUgPT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUExBWUlORyB8fCBldmVudC50eXBlID09IGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1BBVVNFKSkge1xyXG4gICAgICAgICAgICAgICAgaXNQbGF5aW5nID0gIWlzUGxheWluZztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENhbGwgaGFuZGxlciB1cG9uIHRoZXNlIGV2ZW50c1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVksIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QQVVTRSwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVlCQUNLX0ZJTklTSEVELCBwbGF5YmFja1N0YXRlSGFuZGxlcik7IC8vIHdoZW4gcGxheWJhY2sgZmluaXNoZXMsIHBsYXllciB0dXJucyB0byBwYXVzZWQgbW9kZVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfTEFVTkNIRUQsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1BMQVlJTkcsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1BBVVNFLCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QTEFZQkFDS19GSU5JU0hFRCwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICBpZiAoaGFuZGxlQ2xpY2tFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBDb250cm9sIHBsYXllciBieSBidXR0b24gZXZlbnRzXHJcbiAgICAgICAgICAgIC8vIFdoZW4gYSBidXR0b24gZXZlbnQgdHJpZ2dlcnMgYSBwbGF5ZXIgQVBJIGNhbGwsIGV2ZW50cyBhcmUgZmlyZWQgd2hpY2ggaW4gdHVybiBjYWxsIHRoZSBldmVudCBoYW5kbGVyXHJcbiAgICAgICAgICAgIC8vIGFib3ZlIHRoYXQgdXBkYXRlZCB0aGUgYnV0dG9uIHN0YXRlLlxyXG4gICAgICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNQbGF5aW5nKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnBsYXkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBUcmFjayBVSSBzZWVraW5nIHN0YXR1c1xyXG4gICAgICAgIHVpbWFuYWdlci5vblNlZWsuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaXNTZWVraW5nID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrZWQuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaXNTZWVraW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyQ29uZmlnLCBDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXIsIFVJUmVjb21tZW5kYXRpb25Db25maWd9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgUmVjb21tZW5kYXRpb25PdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29udGFpbmVyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktcmVjb21tZW5kYXRpb24tb3ZlcmxheScsXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCF1aW1hbmFnZXIuZ2V0Q29uZmlnKCkgfHwgIXVpbWFuYWdlci5nZXRDb25maWcoKS5yZWNvbW1lbmRhdGlvbnMgfHwgdWltYW5hZ2VyLmdldENvbmZpZygpLnJlY29tbWVuZGF0aW9ucy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgbm8gcmVjb21tZW5kYXRpb24gaXRlbXMsIHNvIGRvbid0IG5lZWQgdG8gY29uZmlndXJlIGFueXRoaW5nXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdWltYW5hZ2VyLmdldENvbmZpZygpLnJlY29tbWVuZGF0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudChuZXcgUmVjb21tZW5kYXRpb25JdGVtKHtpdGVtQ29uZmlnOiBpdGVtfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudHMoKTsgLy8gY3JlYXRlIGNvbnRhaW5lciBET00gZWxlbWVudHNcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSByZWNvbW1lbmRhdGlvbnMgd2hlbiBwbGF5YmFjayBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZQkFDS19GSU5JU0hFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBIaWRlIHJlY29tbWVuZGF0aW9ucyB3aGVuIHBsYXliYWNrIHN0YXJ0cywgZS5nLiBhIHJlc3RhcnRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgUmVjb21tZW5kYXRpb25JdGVtQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIGl0ZW1Db25maWc6IFVJUmVjb21tZW5kYXRpb25Db25maWc7XHJcbn1cclxuXHJcbmNsYXNzIFJlY29tbWVuZGF0aW9uSXRlbSBleHRlbmRzIENvbXBvbmVudDxSZWNvbW1lbmRhdGlvbkl0ZW1Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1yZWNvbW1lbmRhdGlvbi1pdGVtJyxcclxuICAgICAgICAgICAgaXRlbUNvbmZpZzogbnVsbCAvLyB0aGlzIG11c3QgYmUgcGFzc2VkIGluIGZyb20gb3V0c2lkZVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9ICg8UmVjb21tZW5kYXRpb25JdGVtQ29uZmlnPnRoaXMuY29uZmlnKS5pdGVtQ29uZmlnOyAvLyBUT0RPIGZpeCBnZW5lcmljcyBhbmQgZ2V0IHJpZCBvZiBjYXN0XHJcblxyXG4gICAgICAgIGxldCBpdGVtRWxlbWVudCA9IG5ldyBET00oJ2EnLCB7XHJcbiAgICAgICAgICAgICdpZCc6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICAnY2xhc3MnOiB0aGlzLmdldENzc0NsYXNzZXMoKSxcclxuICAgICAgICAgICAgJ2hyZWYnOiBjb25maWcudXJsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBiZ0VsZW1lbnQgPSBuZXcgRE9NKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICd0aHVtYm5haWwnXHJcbiAgICAgICAgfSkuY3NzKHtcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke2NvbmZpZy50aHVtYm5haWx9KWB9KTtcclxuICAgICAgICBpdGVtRWxlbWVudC5hcHBlbmQoYmdFbGVtZW50KTtcclxuXHJcbiAgICAgICAgbGV0IHRpdGxlRWxlbWVudCA9IG5ldyBET00oJ3NwYW4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICd0aXRsZSdcclxuICAgICAgICB9KS5odG1sKGNvbmZpZy50aXRsZSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKHRpdGxlRWxlbWVudCk7XHJcblxyXG4gICAgICAgIGxldCB0aW1lRWxlbWVudCA9IG5ldyBET00oJ3NwYW4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdkdXJhdGlvbidcclxuICAgICAgICB9KS5odG1sKFN0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUoY29uZmlnLmR1cmF0aW9uKSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKHRpbWVFbGVtZW50KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGl0ZW1FbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtFdmVudCwgRXZlbnREaXNwYXRjaGVyLCBOb0FyZ3N9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtTZWVrQmFyTGFiZWx9IGZyb20gXCIuL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUgU2Vla0JhciBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFNlZWtCYXJDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGFiZWwgYWJvdmUgdGhlIHNlZWsgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIGxhYmVsPzogU2Vla0JhckxhYmVsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXIgd2lsbCBiZSB2ZXJ0aWNhbCBpbnN0ZWFkIG9mIGhvcml6b250YWwgaWYgc2V0IHRvIHRydWUuXHJcbiAgICAgKi9cclxuICAgIHZlcnRpY2FsPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTZWVrUHJldmlld0V2ZW50QXJncyBleHRlbmRzIE5vQXJncyB7XHJcbiAgICAvKipcclxuICAgICAqIFRlbGxzIGlmIHRoZSBzZWVrIHByZXZpZXcgZXZlbnQgY29tZXMgZnJvbSBhIHNjcnViYmluZyBzZWVrLlxyXG4gICAgICovXHJcbiAgICBzY3J1YmJpbmc6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lbGluZSBwb3NpdGlvbiBpbiBwZXJjZW50IHdoZXJlIHRoZSBldmVudCBvcmlnaW5hdGVzLlxyXG4gICAgICovXHJcbiAgICBwb3NpdGlvbjogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogU2Vla0JhciBjb21wb25lbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBzZWVrIHRoZSBzdHJlYW0gYW5kXHJcbiAqIHRoYXQgZGlzcGxheXMgdGhlIGN1cnJlbnQgcGxheWJhY2sgcG9zaXRpb24gYW5kIGJ1ZmZlciBmaWxsIGxldmVsLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNlZWtCYXIgZXh0ZW5kcyBDb21wb25lbnQ8U2Vla0JhckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX1NFRUtJTkcgPSBcInNlZWtpbmdcIjtcclxuXHJcbiAgICBwcml2YXRlIHNlZWtCYXI6IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhclBsYXliYWNrUG9zaXRpb246IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhckJ1ZmZlclBvc2l0aW9uOiBET007XHJcbiAgICBwcml2YXRlIHNlZWtCYXJTZWVrUG9zaXRpb246IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhckJhY2tkcm9wOiBET007XHJcblxyXG4gICAgcHJpdmF0ZSBsYWJlbDogU2Vla0JhckxhYmVsO1xyXG5cclxuICAgIHByaXZhdGUgc2Vla0JhckV2ZW50cyA9IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlZCB3aGVuIGEgc2NydWJiaW5nIHNlZWsgb3BlcmF0aW9uIGlzIHN0YXJ0ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25TZWVrOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlZCBkdXJpbmcgYSBzY3J1YmJpbmcgc2VlayB0byBpbmRpY2F0ZSB0aGF0IHRoZSBzZWVrIHByZXZpZXcgKGkuZS4gdGhlIHZpZGVvIGZyYW1lKSBzaG91bGQgYmUgdXBkYXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtQcmV2aWV3OiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIFNlZWtQcmV2aWV3RXZlbnRBcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBoYXMgZmluaXNoZWQgb3Igd2hlbiBhIGRpcmVjdCBzZWVrIGlzIGlzc3VlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBudW1iZXI+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTZWVrQmFyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktc2Vla2JhcidcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMubGFiZWwgPSB0aGlzLmNvbmZpZy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaGFzTGFiZWwoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmdldExhYmVsKCkuaW5pdGlhbGl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgcGxheWJhY2tOb3RJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGlzUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc1NlZWtpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBsYXliYWNrIGFuZCBidWZmZXIgcG9zaXRpb25zXHJcbiAgICAgICAgbGV0IHBsYXliYWNrUG9zaXRpb25IYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBPbmNlIHRoaXMgaGFuZGxlciBvcyBjYWxsZWQsIHBsYXliYWNrIGhhcyBiZWVuIHN0YXJ0ZWQgYW5kIHdlIHNldCB0aGUgZmxhZyB0byBmYWxzZVxyXG4gICAgICAgICAgICBwbGF5YmFja05vdEluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBjYXVnaHQgYSBzZWVrIHByZXZpZXcgc2VlaywgZG8gbm90IHVwZGF0ZSB0aGUgc2Vla2JhclxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdldE1heFRpbWVTaGlmdCgpID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNhc2UgbXVzdCBiZSBleHBsaWNpdGx5IGhhbmRsZWQgdG8gYXZvaWQgZGl2aXNpb24gYnkgemVyb1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbigxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlID0gMTAwIC0gKDEwMCAvIHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIHBsYXllci5nZXRUaW1lU2hpZnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgc2hvdyBmdWxsIGJ1ZmZlciBmb3IgbGl2ZSBzdHJlYW1zXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldEJ1ZmZlclBvc2l0aW9uKDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UgPSAxMDAgLyBwbGF5ZXIuZ2V0RHVyYXRpb24oKSAqIHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYnVmZmVyUGVyY2VudGFnZSA9IDEwMCAvIHBsYXllci5nZXREdXJhdGlvbigpICogcGxheWVyLmdldFZpZGVvQnVmZmVyTGVuZ3RoKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldEJ1ZmZlclBvc2l0aW9uKHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlICsgYnVmZmVyUGVyY2VudGFnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBSZXNldCBmbGFnIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG4gICAgICAgICAgICBwbGF5YmFja05vdEluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHNlZWtiYXIgdXBvbiB0aGVzZSBldmVudHNcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIHBsYXliYWNrIHBvc2l0aW9uIHdoZW4gaXQgY2hhbmdlc1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NUT1BfQlVGRkVSSU5HLCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBidWZmZXJsZXZlbCB3aGVuIGJ1ZmZlcmluZyBpcyBjb21wbGV0ZVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFRUtFRCwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgcGxheWJhY2sgcG9zaXRpb24gd2hlbiBhIHNlZWsgaGFzIGZpbmlzaGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9TSElGVEVELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBwbGF5YmFjayBwb3NpdGlvbiB3aGVuIGEgdGltZXNoaWZ0IGhhcyBmaW5pc2hlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFR01FTlRfUkVRVUVTVF9GSU5JU0hFRCwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgYnVmZmVybGV2ZWwgd2hlbiBhIHNlZ21lbnQgaGFzIGJlZW4gZG93bmxvYWRlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfVElNRV9VUERBVEUsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIHBsYXliYWNrIHBvc2l0aW9uIG9mIENhc3QgcGxheWJhY2tcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFSywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcodHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFS0VELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyhmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9TSElGVCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcodHJ1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9TSElGVEVELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyhmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBzZWVrID0gZnVuY3Rpb24gKHBlcmNlbnRhZ2U6IG51bWJlcikge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIudGltZVNoaWZ0KHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAtIChwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgKiAocGVyY2VudGFnZSAvIDEwMCkpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5zZWVrKHBsYXllci5nZXREdXJhdGlvbigpICogKHBlcmNlbnRhZ2UgLyAxMDApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2VsZi5vblNlZWsuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIpIHtcclxuICAgICAgICAgICAgaXNTZWVraW5nID0gdHJ1ZTsgLy8gdHJhY2sgc2Vla2luZyBzdGF0dXMgc28gd2UgY2FuIGNhdGNoIGV2ZW50cyBmcm9tIHNlZWsgcHJldmlldyBzZWVrc1xyXG5cclxuICAgICAgICAgICAgLy8gTm90aWZ5IFVJIG1hbmFnZXIgb2Ygc3RhcnRlZCBzZWVrXHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vblNlZWsuZGlzcGF0Y2goc2VuZGVyKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNhdmUgY3VycmVudCBwbGF5YmFjayBzdGF0ZVxyXG4gICAgICAgICAgICBpc1BsYXlpbmcgPSBwbGF5ZXIuaXNQbGF5aW5nKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBQYXVzZSBwbGF5YmFjayB3aGlsZSBzZWVraW5nXHJcbiAgICAgICAgICAgIGlmIChpc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5vblNlZWtQcmV2aWV3LnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBTZWVrQmFyLCBhcmdzOiBTZWVrUHJldmlld0V2ZW50QXJncykge1xyXG4gICAgICAgICAgICAvLyBOb3RpZnkgVUkgbWFuYWdlciBvZiBzZWVrIHByZXZpZXdcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uU2Vla1ByZXZpZXcuZGlzcGF0Y2goc2VuZGVyLCBhcmdzLnBvc2l0aW9uKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlUmF0ZUxpbWl0ZWQoZnVuY3Rpb24gKHNlbmRlcjogU2Vla0JhciwgYXJnczogU2Vla1ByZXZpZXdFdmVudEFyZ3MpIHtcclxuICAgICAgICAgICAgLy8gUmF0ZS1saW1pdGVkIHNjcnViYmluZyBzZWVrXHJcbiAgICAgICAgICAgIGlmIChhcmdzLnNjcnViYmluZykge1xyXG4gICAgICAgICAgICAgICAgc2VlayhhcmdzLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgc2VsZi5vblNlZWtlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIHBsYXliYWNrIGhhcyBub3QgYmVlbiBzdGFydGVkIGJlZm9yZSwgd2UgbmVlZCB0byBjYWxsIHBsYXkgdG8gaW4gaXQgdGhlIHBsYXliYWNrIGVuZ2luZSBmb3IgdGhlXHJcbiAgICAgICAgICAgIC8vIHNlZWsgdG8gd29yay4gV2UgY2FsbCBwYXVzZSgpIGltbWVkaWF0ZWx5IGFmdGVyd2FyZHMgYmVjYXVzZSB3ZSBhY3R1YWxseSBkbyBub3Qgd2FudCB0byBwbGF5IGJhY2sgYW55dGhpbmcuXHJcbiAgICAgICAgICAgIC8vIFRoZSBmbGFnIHNlcnZlcyB0byBjYWxsIHBsYXkvcGF1c2Ugb25seSBvbiB0aGUgZmlyc3Qgc2VlayBiZWZvcmUgcGxheWJhY2sgaGFzIHN0YXJ0ZWQsIGluc3RlYWQgb2YgZXZlcnlcclxuICAgICAgICAgICAgLy8gdGltZSBhIHNlZWsgaXMgaXNzdWVkLlxyXG4gICAgICAgICAgICBpZiAocGxheWJhY2tOb3RJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICAgICAgcGxheWJhY2tOb3RJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBsYXkoKTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5wYXVzZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEbyB0aGUgc2Vla1xyXG4gICAgICAgICAgICBzZWVrKHBlcmNlbnRhZ2UpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udGludWUgcGxheWJhY2sgYWZ0ZXIgc2VlayBpZiBwbGF5ZXIgd2FzIHBsYXlpbmcgd2hlbiBzZWVrIHN0YXJ0ZWRcclxuICAgICAgICAgICAgaWYgKGlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBsYXkoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gTm90aWZ5IFVJIG1hbmFnZXIgb2YgZmluaXNoZWQgc2Vla1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25TZWVrZWQuZGlzcGF0Y2goc2VuZGVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHNlbGYuaGFzTGFiZWwoKSkge1xyXG4gICAgICAgICAgICAvLyBDb25maWd1cmUgYSBzZWVrYmFyIGxhYmVsIHRoYXQgaXMgaW50ZXJuYWwgdG8gdGhlIHNlZWtiYXIpXHJcbiAgICAgICAgICAgIHNlbGYuZ2V0TGFiZWwoKS5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlnLmNzc0NsYXNzZXMucHVzaCgndmVydGljYWwnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzZWVrQmFyQ29udGFpbmVyID0gbmV3IERPTSgnZGl2Jywge1xyXG4gICAgICAgICAgICAnaWQnOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgJ2NsYXNzJzogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHNlZWtCYXIgPSBuZXcgRE9NKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdzZWVrYmFyJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhciA9IHNlZWtCYXI7XHJcblxyXG4gICAgICAgIC8vIEluZGljYXRvciB0aGF0IHNob3dzIHRoZSBidWZmZXIgZmlsbCBsZXZlbFxyXG4gICAgICAgIHZhciBzZWVrQmFyQnVmZmVyTGV2ZWwgPSBuZXcgRE9NKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdzZWVrYmFyLWJ1ZmZlcmxldmVsJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhckJ1ZmZlclBvc2l0aW9uID0gc2Vla0JhckJ1ZmZlckxldmVsO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93cyB0aGUgY3VycmVudCBwbGF5YmFjayBwb3NpdGlvblxyXG4gICAgICAgIHZhciBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbiA9IG5ldyBET00oJ2RpdicsIHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ3NlZWtiYXItcGxheWJhY2twb3NpdGlvbidcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXJQbGF5YmFja1Bvc2l0aW9uID0gc2Vla0JhclBsYXliYWNrUG9zaXRpb247XHJcblxyXG4gICAgICAgIC8vIEluZGljYXRvciB0aGF0IHNob3cgd2hlcmUgYSBzZWVrIHdpbGwgZ28gdG9cclxuICAgICAgICB2YXIgc2Vla0JhclNlZWtQb3NpdGlvbiA9IG5ldyBET00oJ2RpdicsIHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ3NlZWtiYXItc2Vla3Bvc2l0aW9uJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhclNlZWtQb3NpdGlvbiA9IHNlZWtCYXJTZWVrUG9zaXRpb247XHJcblxyXG4gICAgICAgIC8vIEluZGljYXRvciB0aGF0IHNob3dzIHRoZSBmdWxsIHNlZWtiYXJcclxuICAgICAgICB2YXIgc2Vla0JhckJhY2tkcm9wID0gbmV3IERPTSgnZGl2Jywge1xyXG4gICAgICAgICAgICAnY2xhc3MnOiAnc2Vla2Jhci1iYWNrZHJvcCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXJCYWNrZHJvcCA9IHNlZWtCYXJCYWNrZHJvcDtcclxuXHJcbiAgICAgICAgc2Vla0Jhci5hcHBlbmQoc2Vla0JhckJhY2tkcm9wLCBzZWVrQmFyQnVmZmVyTGV2ZWwsIHNlZWtCYXJTZWVrUG9zaXRpb24sIHNlZWtCYXJQbGF5YmFja1Bvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBEZWZpbmUgaGFuZGxlciBmdW5jdGlvbnMgc28gd2UgY2FuIGF0dGFjaC9yZW1vdmUgdGhlbSBsYXRlclxyXG4gICAgICAgIGxldCBtb3VzZU1vdmVIYW5kbGVyID0gZnVuY3Rpb24gKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldFBlcmNlbnRhZ2UgPSAxMDAgKiBzZWxmLmdldE1vdXNlT2Zmc2V0KGUpO1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtQb3NpdGlvbih0YXJnZXRQZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKHRhcmdldFBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICBzZWxmLm9uU2Vla1ByZXZpZXdFdmVudCh0YXJnZXRQZXJjZW50YWdlLCB0cnVlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBtb3VzZVVwSGFuZGxlciA9IGZ1bmN0aW9uIChlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBoYW5kbGVycywgc2VlayBvcGVyYXRpb24gaXMgZmluaXNoZWRcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub2ZmKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub2ZmKCdtb3VzZXVwJywgbW91c2VVcEhhbmRsZXIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldFBlcmNlbnRhZ2UgPSAxMDAgKiBzZWxmLmdldE1vdXNlT2Zmc2V0KGUpO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpcmUgc2Vla2VkIGV2ZW50XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrZWRFdmVudCh0YXJnZXRQZXJjZW50YWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBBIHNlZWsgYWx3YXlzIHN0YXJ0IHdpdGggYSBtb3VzZWRvd24gZGlyZWN0bHkgb24gdGhlIHNlZWtiYXIuIFRvIHRyYWNrIGEgc2VlayBhbHNvIG91dHNpZGUgdGhlIHNlZWtiYXJcclxuICAgICAgICAvLyAoc28gdGhlIHVzZXIgZG9lcyBub3QgbmVlZCB0byB0YWtlIGNhcmUgdGhhdCB0aGUgbW91c2UgYWx3YXlzIHN0YXlzIG9uIHRoZSBzZWVrYmFyKSwgd2UgYXR0YWNoIHRoZSBtb3VzZW1vdmVcclxuICAgICAgICAvLyBhbmQgbW91c2V1cCBoYW5kbGVycyB0byB0aGUgd2hvbGUgZG9jdW1lbnQuIEEgc2VlayBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgdXNlciBsaWZ0cyB0aGUgbW91c2Uga2V5LlxyXG4gICAgICAgIC8vIEEgc2VlayBtb3VzZSBnZXN0dXJlIGlzIHRodXMgYmFzaWNhbGx5IGEgY2xpY2sgd2l0aCBhIGxvbmcgdGltZSBmcmFtZSBiZXR3ZWVuIGRvd24gYW5kIHVwIGV2ZW50cy5cclxuICAgICAgICBzZWVrQmFyLm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IHNlbGVjdGlvbiBvZiBET00gZWxlbWVudHNcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKHRydWUpO1xyXG5cclxuICAgICAgICAgICAgLy8gRmlyZSBzZWVrZWQgZXZlbnRcclxuICAgICAgICAgICAgc2VsZi5vblNlZWtFdmVudCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGhhbmRsZXIgdG8gdHJhY2sgdGhlIHNlZWsgb3BlcmF0aW9uIG92ZXIgdGhlIHdob2xlIGRvY3VtZW50XHJcbiAgICAgICAgICAgIG5ldyBET00oZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub24oJ21vdXNldXAnLCBtb3VzZVVwSGFuZGxlcik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgc2VlayB0YXJnZXQgaW5kaWNhdG9yIHdoZW4gbW91c2UgaG92ZXJzIG92ZXIgc2Vla2JhclxyXG4gICAgICAgIHNlZWtCYXIub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IDEwMCAqIHNlbGYuZ2V0TW91c2VPZmZzZXQoZSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla1Bvc2l0aW9uKHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgc2VsZi5vblNlZWtQcmV2aWV3RXZlbnQocG9zaXRpb24sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmhhc0xhYmVsKCkgJiYgc2VsZi5nZXRMYWJlbCgpLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0TGFiZWwoKS5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSGlkZSBzZWVrIHRhcmdldCBpbmRpY2F0b3Igd2hlbiBtb3VzZSBsZWF2ZXMgc2Vla2JhclxyXG4gICAgICAgIHNlZWtCYXIub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtQb3NpdGlvbigwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmhhc0xhYmVsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0TGFiZWwoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2Vla0JhckNvbnRhaW5lci5hcHBlbmQoc2Vla0Jhcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIHNlZWtCYXJDb250YWluZXIuYXBwZW5kKHRoaXMubGFiZWwuZ2V0RG9tRWxlbWVudCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWVrQmFyQ29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0SG9yaXpvbnRhbE1vdXNlT2Zmc2V0KGU6IE1vdXNlRXZlbnQpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBlbGVtZW50T2Zmc2V0UHggPSB0aGlzLnNlZWtCYXIub2Zmc2V0KCkubGVmdDtcclxuICAgICAgICBsZXQgd2lkdGhQeCA9IHRoaXMuc2Vla0Jhci53aWR0aCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRQeCA9IGUucGFnZVggLSBlbGVtZW50T2Zmc2V0UHg7XHJcbiAgICAgICAgbGV0IG9mZnNldCA9IDEgLyB3aWR0aFB4ICogb2Zmc2V0UHg7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnNhbml0aXplT2Zmc2V0KG9mZnNldCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRWZXJ0aWNhbE1vdXNlT2Zmc2V0KGU6IE1vdXNlRXZlbnQpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBlbGVtZW50T2Zmc2V0UHggPSB0aGlzLnNlZWtCYXIub2Zmc2V0KCkudG9wO1xyXG4gICAgICAgIGxldCB3aWR0aFB4ID0gdGhpcy5zZWVrQmFyLmhlaWdodCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRQeCA9IGUucGFnZVkgLSBlbGVtZW50T2Zmc2V0UHg7XHJcbiAgICAgICAgbGV0IG9mZnNldCA9IDEgLyB3aWR0aFB4ICogb2Zmc2V0UHg7XHJcblxyXG4gICAgICAgIHJldHVybiAxIC0gdGhpcy5zYW5pdGl6ZU9mZnNldChvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0TW91c2VPZmZzZXQoZTogTW91c2VFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFZlcnRpY2FsTW91c2VPZmZzZXQoZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SG9yaXpvbnRhbE1vdXNlT2Zmc2V0KGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNhbml0aXplT2Zmc2V0KG9mZnNldDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gU2luY2Ugd2UgdHJhY2sgbW91c2UgbW92ZXMgb3ZlciB0aGUgd2hvbGUgZG9jdW1lbnQsIHRoZSB0YXJnZXQgY2FuIGJlIG91dHNpZGUgdGhlIHNlZWsgcmFuZ2UsXHJcbiAgICAgICAgLy8gYW5kIHdlIG5lZWQgdG8gbGltaXQgaXQgdG8gdGhlIFswLCAxXSByYW5nZS5cclxuICAgICAgICBpZiAob2Zmc2V0IDwgMCkge1xyXG4gICAgICAgICAgICBvZmZzZXQgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0ID4gMSkge1xyXG4gICAgICAgICAgICBvZmZzZXQgPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIG9mZnNldDtcclxuICAgIH1cclxuXHJcbiAgICBzZXRQbGF5YmFja1Bvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyUGxheWJhY2tQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0QnVmZmVyUG9zaXRpb24ocGVyY2VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbih0aGlzLnNlZWtCYXJCdWZmZXJQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0U2Vla1Bvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyU2Vla1Bvc2l0aW9uLCBwZXJjZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldFBvc2l0aW9uKGVsZW1lbnQ6IERPTSwgcGVyY2VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gdGhpcy5jb25maWcudmVydGljYWwgPyB7J2hlaWdodCc6IHBlcmNlbnQgKyAnJSd9IDogeyd3aWR0aCc6IHBlcmNlbnQgKyAnJSd9O1xyXG4gICAgICAgIGVsZW1lbnQuY3NzKHN0eWxlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1dHMgdGhlIHNlZWtiYXIgaW50byBvciBvdXQgb2Ygc2Vla2luZyBtb2RlIGJ5IGFkZGluZy9yZW1vdmluZyBhIGNsYXNzIHRvIHRoZSBET00gZWxlbWVudC4gVGhpcyBjYW4gYmUgdXNlZFxyXG4gICAgICogdG8gYWRqdXN0IHRoZSBzdHlsaW5nIHdoaWxlIHNlZWtpbmcuXHJcbiAgICAgKiBAcGFyYW0gc2Vla2luZyBzZXQgdG8gdHJ1ZSBpZiBlbnRlcmluZyBzZWVrIG1vZGUsIGZhbHNlIGlmIGV4aXRpbmcgc2VlayBtb2RlXHJcbiAgICAgKi9cclxuICAgIHNldFNlZWtpbmcoc2Vla2luZzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChzZWVraW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKFNlZWtCYXIuQ0xBU1NfU0VFS0lORyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoU2Vla0Jhci5DTEFTU19TRUVLSU5HKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNTZWVraW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldERvbUVsZW1lbnQoKS5oYXNDbGFzcyhTZWVrQmFyLkNMQVNTX1NFRUtJTkcpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhc0xhYmVsKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsICE9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TGFiZWwoKTogU2Vla0JhckxhYmVsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25TZWVrRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vlay5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25TZWVrUHJldmlld0V2ZW50KHBlcmNlbnRhZ2U6IG51bWJlciwgc2NydWJiaW5nOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGFiZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5sYWJlbC5zZXRUZXh0KHBlcmNlbnRhZ2UgKyBcIlwiKTtcclxuICAgICAgICAgICAgdGhpcy5sYWJlbC5nZXREb21FbGVtZW50KCkuY3NzKHtcclxuICAgICAgICAgICAgICAgIFwibGVmdFwiOiBwZXJjZW50YWdlICsgXCIlXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtQcmV2aWV3LmRpc3BhdGNoKHRoaXMsIHtzY3J1YmJpbmc6IHNjcnViYmluZywgcG9zaXRpb246IHBlcmNlbnRhZ2V9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25TZWVrZWRFdmVudChwZXJjZW50YWdlOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrZWQuZGlzcGF0Y2godGhpcywgcGVyY2VudGFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2VlaygpOiBFdmVudDxTZWVrQmFyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vlay5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvblNlZWtQcmV2aWV3KCk6IEV2ZW50PFNlZWtCYXIsIFNlZWtQcmV2aWV3RXZlbnRBcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtQcmV2aWV3LmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2Vla2VkKCk6IEV2ZW50PFNlZWtCYXIsIG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXIsIENvbnRhaW5lckNvbmZpZ30gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNlZWtCYXJMYWJlbENvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcblxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2Vla0JhckxhYmVsIGV4dGVuZHMgQ29udGFpbmVyPFNlZWtCYXJMYWJlbENvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuICAgIHByaXZhdGUgdGh1bWJuYWlsOiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh7Y3NzQ2xhc3NlczogWydzZWVrYmFyLWxhYmVsJ119KTtcclxuICAgICAgICB0aGlzLnRodW1ibmFpbCA9IG5ldyBDb21wb25lbnQoe2Nzc0NsYXNzZXM6IFsnc2Vla2Jhci10aHVtYm5haWwnXX0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktc2Vla2Jhci1sYWJlbCcsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnRodW1ibmFpbCwgdGhpcy5sYWJlbF0sXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0xpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWUgPSBwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgLSBwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgKiAocGVyY2VudGFnZSAvIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWUodGltZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZSA9IHBsYXllci5nZXREdXJhdGlvbigpICogKHBlcmNlbnRhZ2UgLyAxMDApO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lKHRpbWUpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUaHVtYm5haWwocGxheWVyLmdldFRodW1iKHRpbWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRleHQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbC5zZXRUZXh0KHRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRpbWUoc2Vjb25kczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KFN0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUoc2Vjb25kcykpO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRodW1ibmFpbCh0aHVtYm5haWw6IGJpdG1vdmluLnBsYXllci5UaHVtYm5haWwgPSBudWxsKSB7XHJcbiAgICAgICAgbGV0IHRodW1ibmFpbEVsZW1lbnQgPSB0aGlzLnRodW1ibmFpbC5nZXREb21FbGVtZW50KCk7XHJcblxyXG4gICAgICAgIGlmICh0aHVtYm5haWwgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHVtYm5haWxFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2VcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogXCJub25lXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHVtYm5haWxFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogXCJpbmhlcml0XCIsXHJcbiAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke3RodW1ibmFpbC51cmx9KWAsXHJcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHRodW1ibmFpbC53ICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogdGh1bWJuYWlsLmggKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb25cIjogYC0ke3RodW1ibmFpbC54fXB4IC0ke3RodW1ibmFpbC55fXB4YFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yLCBMaXN0U2VsZWN0b3JDb25maWd9IGZyb20gXCIuL2xpc3RzZWxlY3RvclwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFNlbGVjdEJveCBleHRlbmRzIExpc3RTZWxlY3RvcjxMaXN0U2VsZWN0b3JDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdEVsZW1lbnQ6IERPTTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLXNlbGVjdGJveCdcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBzZWxlY3RFbGVtZW50ID0gbmV3IERPTSgnc2VsZWN0Jywge1xyXG4gICAgICAgICAgICAnaWQnOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgJ2NsYXNzJzogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RFbGVtZW50ID0gc2VsZWN0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKCk7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBzZWxlY3RFbGVtZW50Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG5ldyBET00odGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgIHNlbGYub25JdGVtU2VsZWN0ZWRFdmVudCh2YWx1ZSwgZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZWN0RWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlRG9tSXRlbXMoc2VsZWN0ZWRWYWx1ZTogc3RyaW5nID0gbnVsbCkge1xyXG4gICAgICAgIC8vIERlbGV0ZSBhbGwgY2hpbGRyZW5cclxuICAgICAgICB0aGlzLnNlbGVjdEVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHVwZGF0ZWQgY2hpbGRyZW5cclxuICAgICAgICBmb3IgKGxldCB2YWx1ZSBpbiB0aGlzLml0ZW1zKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IHRoaXMuaXRlbXNbdmFsdWVdO1xyXG4gICAgICAgICAgICBsZXQgb3B0aW9uRWxlbWVudCA9IG5ldyBET00oJ29wdGlvbicsIHtcclxuICAgICAgICAgICAgICAgICd2YWx1ZSc6IHZhbHVlXHJcbiAgICAgICAgICAgIH0pLmh0bWwobGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHZhbHVlID09IHNlbGVjdGVkVmFsdWUgKyBcIlwiKSB7IC8vIGNvbnZlcnQgc2VsZWN0ZWRWYWx1ZSB0byBzdHJpbmcgdG8gY2F0Y2ggXCJudWxsXCIvbnVsbCBjYXNlXHJcbiAgICAgICAgICAgICAgICBvcHRpb25FbGVtZW50LmF0dHIoJ3NlbGVjdGVkJywgJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RWxlbWVudC5hcHBlbmQob3B0aW9uRWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1BZGRlZEV2ZW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlci5vbkl0ZW1BZGRlZEV2ZW50KHZhbHVlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKHRoaXMuc2VsZWN0ZWRJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25JdGVtUmVtb3ZlZEV2ZW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlci5vbkl0ZW1SZW1vdmVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRG9tSXRlbXModGhpcy5zZWxlY3RlZEl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1TZWxlY3RlZEV2ZW50KHZhbHVlOiBzdHJpbmcsIHVwZGF0ZURvbUl0ZW1zOiBib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIHN1cGVyLm9uSXRlbVNlbGVjdGVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIGlmICh1cGRhdGVEb21JdGVtcykge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyQ29uZmlnLCBDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1ZpZGVvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vdmlkZW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7QXVkaW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9hdWRpb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtUaW1lb3V0fSBmcm9tIFwiLi4vdGltZW91dFwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc1BhbmVsQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgc2V0dGluZ3MgcGFuZWwgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogU2V0IHRvIC0xIHRvIGRpc2FibGUgYXV0b21hdGljIGhpZGluZy5cclxuICAgICAqIERlZmF1bHQ6IDMgc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBoaWRlRGVsYXk/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nc1BhbmVsIGV4dGVuZHMgQ29udGFpbmVyPFNldHRpbmdzUGFuZWxDb25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNldHRpbmdzUGFuZWxDb25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWc8U2V0dGluZ3NQYW5lbENvbmZpZz4oY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktc2V0dGluZ3MtcGFuZWwnLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDMwMDBcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICgoPFNldHRpbmdzUGFuZWxDb25maWc+c2VsZi5jb25maWcpLmhpZGVEZWxheSA+IC0xKSB7XHJcbiAgICAgICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxTZXR0aW5nc1BhbmVsQ29uZmlnPnRoaXMuY29uZmlnKS5oaWRlRGVsYXksIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYub25TaG93LnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBY3RpdmF0ZSB0aW1lb3V0IHdoZW4gc2hvd25cclxuICAgICAgICAgICAgICAgIHRpbWVvdXQuc3RhcnQoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZXNldCB0aW1lb3V0IG9uIGludGVyYWN0aW9uXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KClcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHNlbGYub25IaWRlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBDbGVhciB0aW1lb3V0IHdoZW4gaGlkZGVuIGZyb20gb3V0c2lkZVxyXG4gICAgICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNldHRpbmdzUGFuZWxJdGVtIGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuICAgIHByaXZhdGUgc2V0dGluZzogU2VsZWN0Qm94O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxhYmVsOiBzdHJpbmcsIHNlbGVjdEJveDogU2VsZWN0Qm94LCBjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh7dGV4dDogbGFiZWx9KTtcclxuICAgICAgICB0aGlzLnNldHRpbmcgPSBzZWxlY3RCb3g7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1zZXR0aW5ncy1wYW5lbC1lbnRyeScsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLmxhYmVsLCB0aGlzLnNldHRpbmddXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgaGFuZGxlQ29uZmlnSXRlbUNoYW5nZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBtaW5pbXVtIG51bWJlciBvZiBpdGVtcyB0aGF0IG11c3QgYmUgYXZhaWxhYmxlIGZvciB0aGUgc2V0dGluZyB0byBiZSBkaXNwbGF5ZWRcclxuICAgICAgICAgICAgLy8gQnkgZGVmYXVsdCwgYXQgbGVhc3QgdHdvIGl0ZW1zIG11c3QgYmUgYXZhaWxhYmxlLCBlbHNlIGEgc2VsZWN0aW9uIGlzIG5vdCBwb3NzaWJsZVxyXG4gICAgICAgICAgICBsZXQgbWluSXRlbXNUb0Rpc3BsYXkgPSAyO1xyXG4gICAgICAgICAgICAvLyBBdWRpby92aWRlbyBxdWFsaXR5IHNlbGVjdCBib3hlcyBjb250YWluIGFuIGFkZGl0aW9uYWwgXCJhdXRvXCIgbW9kZSwgd2hpY2ggaW4gY29tYmluYXRpb24gd2l0aCBhIHNpbmdsZSBhdmFpbGFibGUgcXVhbGl0eSBhbHNvIGRvZXMgbm90IG1ha2Ugc2Vuc2VcclxuICAgICAgICAgICAgaWYgKHNlbGYuc2V0dGluZyBpbnN0YW5jZW9mIFZpZGVvUXVhbGl0eVNlbGVjdEJveCB8fCBzZWxmLnNldHRpbmcgaW5zdGFuY2VvZiBBdWRpb1F1YWxpdHlTZWxlY3RCb3gpIHtcclxuICAgICAgICAgICAgICAgIG1pbkl0ZW1zVG9EaXNwbGF5ID0gMztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSGlkZSB0aGUgc2V0dGluZyBpZiBubyBtZWFuaW5nZnVsIGNob2ljZSBpcyBhdmFpbGFibGVcclxuICAgICAgICAgICAgaWYgKHNlbGYuc2V0dGluZy5pdGVtQ291bnQoKSA8IG1pbkl0ZW1zVG9EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5zZXR0aW5nLm9uSXRlbUFkZGVkLnN1YnNjcmliZShoYW5kbGVDb25maWdJdGVtQ2hhbmdlZCk7XHJcbiAgICAgICAgc2VsZi5zZXR0aW5nLm9uSXRlbVJlbW92ZWQuc3Vic2NyaWJlKGhhbmRsZUNvbmZpZ0l0ZW1DaGFuZ2VkKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBoaWRkZW4gc3RhdGVcclxuICAgICAgICBoYW5kbGVDb25maWdJdGVtQ2hhbmdlZCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZXR0aW5nc1BhbmVsfSBmcm9tIFwiLi9zZXR0aW5nc3BhbmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFNldHRpbmdzVG9nZ2xlQnV0dG9uQ29uZmlnIGV4dGVuZHMgVG9nZ2xlQnV0dG9uQ29uZmlnIHtcclxuICAgIHNldHRpbmdzUGFuZWw6IFNldHRpbmdzUGFuZWw7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nc1RvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogU2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICBpZighY29uZmlnLnNldHRpbmdzUGFuZWwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVxdWlyZWQgU2V0dGluZ3NQYW5lbCBpcyBtaXNzaW5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLXNldHRpbmdzdG9nZ2xlYnV0dG9uJyxcclxuICAgICAgICAgICAgdGV4dDogJ1NldHRpbmdzJyxcclxuICAgICAgICAgICAgc2V0dGluZ3NQYW5lbDogbnVsbFxyXG4gICAgICAgIH0sIDxTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHNldHRpbmdzUGFuZWwgPSAoPFNldHRpbmdzVG9nZ2xlQnV0dG9uQ29uZmlnPnRoaXMuZ2V0Q29uZmlnKCkpLnNldHRpbmdzUGFuZWw7XHJcblxyXG4gICAgICAgIHRoaXMub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZXR0aW5nc1BhbmVsLnRvZ2dsZUhpZGRlbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNldHRpbmdzUGFuZWwub25IaWRlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFNldCB0b2dnbGUgc3RhdHVzIHRvIG9mZiB3aGVuIHRoZSBzZXR0aW5ncyBwYW5lbCBoaWRlc1xyXG4gICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyLCBDb250YWluZXJDb25maWd9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgU3VidGl0bGVDdWVFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZUN1ZUV2ZW50O1xyXG5pbXBvcnQge0xhYmVsLCBMYWJlbENvbmZpZ30gZnJvbSBcIi4vbGFiZWxcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBTdWJ0aXRsZU92ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbm5lciBsYWJlbCB0aGF0IHJlbmRlcnMgdGhlIHN1YnRpdGxlIHRleHRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdWJ0aXRsZUxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuc3VidGl0bGVMYWJlbCA9IG5ldyBMYWJlbDxMYWJlbENvbmZpZz4oe2Nzc0NsYXNzOiAndWktc3VidGl0bGUtbGFiZWwnfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS1zdWJ0aXRsZS1vdmVybGF5JyxcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMuc3VidGl0bGVMYWJlbF1cclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NVRV9FTlRFUiwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUN1ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3VidGl0bGVMYWJlbC5zZXRUZXh0KGV2ZW50LnRleHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NVRV9FWElULCBmdW5jdGlvbiAoZXZlbnQ6IFN1YnRpdGxlQ3VlRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5zdWJ0aXRsZUxhYmVsLnNldFRleHQoXCJcIik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBzdWJ0aXRsZUNsZWFySGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zdWJ0aXRsZUxhYmVsLnNldFRleHQoXCJcIik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQVVESU9fQ0hBTkdFLCBzdWJ0aXRsZUNsZWFySGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfQ0hBTkdFLCBzdWJ0aXRsZUNsZWFySGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFSywgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfU0hJRlQsIHN1YnRpdGxlQ2xlYXJIYW5kbGVyKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBTdWJ0aXRsZUFkZGVkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuU3VidGl0bGVBZGRlZEV2ZW50O1xyXG5pbXBvcnQgU3VidGl0bGVDaGFuZ2VkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuU3VidGl0bGVDaGFuZ2VkRXZlbnQ7XHJcbmltcG9ydCBTdWJ0aXRsZVJlbW92ZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZVJlbW92ZWRFdmVudDtcclxuXHJcbmV4cG9ydCBjbGFzcyBTdWJ0aXRsZVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVTdWJ0aXRsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuY2xlYXJJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgc3VidGl0bGUgb2YgcGxheWVyLmdldEF2YWlsYWJsZVN1YnRpdGxlcygpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZEl0ZW0oc3VidGl0bGUuaWQsIHN1YnRpdGxlLmxhYmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlbGYub25JdGVtU2VsZWN0ZWQuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IFN1YnRpdGxlU2VsZWN0Qm94LCB2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRTdWJ0aXRsZSh2YWx1ZSA9PSBcIm51bGxcIiA/IG51bGwgOiB2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlYWN0IHRvIEFQSSBldmVudHNcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVUJUSVRMRV9BRERFRCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUFkZGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5hZGRJdGVtKGV2ZW50LnN1YnRpdGxlLmlkLCBldmVudC5zdWJ0aXRsZS5sYWJlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfQ0hBTkdFLCBmdW5jdGlvbiAoZXZlbnQ6IFN1YnRpdGxlQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0SXRlbShldmVudC50YXJnZXRTdWJ0aXRsZS5pZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfUkVNT1ZFRCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZVJlbW92ZWRFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnJlbW92ZUl0ZW0oZXZlbnQuc3VidGl0bGVJZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlU3VidGl0bGVzKTsgLy8gVXBkYXRlIHN1YnRpdGxlcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlU3VidGl0bGVzKTsgLy8gVXBkYXRlIHN1YnRpdGxlcyB3aGVuIGEgbmV3IHNvdXJjZSBpcyBsb2FkZWRcclxuXHJcbiAgICAgICAgLy8gUG9wdWxhdGUgc3VidGl0bGVzIGF0IHN0YXJ0dXBcclxuICAgICAgICB1cGRhdGVTdWJ0aXRsZXMoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXIsIENvbnRhaW5lckNvbmZpZ30gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7TGFiZWxDb25maWcsIExhYmVsfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1RpbWVvdXR9IGZyb20gXCIuLi90aW1lb3V0XCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRpdGxlQmFyQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGFmdGVyIHdoaWNoIHRoZSB0aXRsZSBiYXIgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogRGVmYXVsdDogNSBzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIGhpZGVEZWxheT86IG51bWJlcjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFRpdGxlQmFyIGV4dGVuZHMgQ29udGFpbmVyPFRpdGxlQmFyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBsYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVGl0bGVCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMubGFiZWwgPSBuZXcgTGFiZWwoe2Nzc0NsYXNzOiAndWktdGl0bGViYXItbGFiZWwnfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS10aXRsZWJhcicsXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcclxuICAgICAgICAgICAgaGlkZURlbGF5OiA1MDAwLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy5sYWJlbF1cclxuICAgICAgICB9LCA8VGl0bGVCYXJDb25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodWltYW5hZ2VyLmdldENvbmZpZygpICYmIHVpbWFuYWdlci5nZXRDb25maWcoKS5tZXRhZGF0YSkge1xyXG4gICAgICAgICAgICBzZWxmLmxhYmVsLnNldFRleHQodWltYW5hZ2VyLmdldENvbmZpZygpLm1ldGFkYXRhLnRpdGxlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBDYW5jZWwgY29uZmlndXJhdGlvbiBpZiB0aGVyZSBpcyBubyBtZXRhZGF0YSB0byBkaXNwbGF5XHJcbiAgICAgICAgICAgIC8vIFRPRE8gdGhpcyBwcm9iYWJseSB3b24ndCB3b3JrIGlmIHdlIHB1dCB0aGUgc2hhcmUgYnV0dG9ucyBpbnRvIHRoZSB0aXRsZSBiYXJcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dCgoPFRpdGxlQmFyQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VFbnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTsgLy8gc2hvdyBjb250cm9sIGJhciB3aGVuIHRoZSBtb3VzZSBlbnRlcnMgdGhlIFVJXHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhciB0aW1lb3V0IHRvIGF2b2lkIGhpZGluZyB0aGUgYmFyIGlmIHRoZSBtb3VzZSBtb3ZlcyBiYWNrIGludG8gdGhlIFVJIGR1cmluZyB0aGUgdGltZW91dCBwZXJpb2RcclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgdGhlIGJhciBpZiBtb3VzZSBkb2VzIG5vdCBtb3ZlIGR1cmluZyB0aGUgdGltZW91dCB0aW1lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VMZWF2ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgYmFyIHNvbWUgdGltZSBhZnRlciB0aGUgbW91c2UgbGVmdCB0aGUgVUlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCdXR0b24sIEJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vYnV0dG9uXCI7XHJcbmltcG9ydCB7Tm9BcmdzLCBFdmVudERpc3BhdGNoZXIsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEgdG9nZ2xlIGJ1dHRvbiBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRvZ2dsZUJ1dHRvbkNvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0IG9uIHRoZSBidXR0b24uXHJcbiAgICAgKi9cclxuICAgIHRleHQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBUb2dnbGVCdXR0b248Q29uZmlnIGV4dGVuZHMgVG9nZ2xlQnV0dG9uQ29uZmlnPiBleHRlbmRzIEJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDTEFTU19PTiA9IFwib25cIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX09GRiA9IFwib2ZmXCI7XHJcblxyXG4gICAgcHJpdmF0ZSBvblN0YXRlOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgdG9nZ2xlQnV0dG9uRXZlbnRzID0ge1xyXG4gICAgICAgIG9uVG9nZ2xlOiBuZXcgRXZlbnREaXNwYXRjaGVyPFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Ub2dnbGVPbjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIG9uVG9nZ2xlT2ZmOiBuZXcgRXZlbnREaXNwYXRjaGVyPFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktdG9nZ2xlYnV0dG9uJ1xyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgdmFyIGJ1dHRvbkVsZW1lbnQgPSBzdXBlci50b0RvbUVsZW1lbnQoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uQ2xpY2tFdmVudCgpIHtcclxuICAgICAgICB0aGlzLmJ1dHRvbkV2ZW50cy5vbkNsaWNrLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uKCkge1xyXG4gICAgICAgIHRoaXMub25TdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09GRik7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09OKTtcclxuXHJcbiAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5vblRvZ2dsZU9uRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvZmYoKSB7XHJcbiAgICAgICAgdGhpcy5vblN0YXRlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09OKTtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhUb2dnbGVCdXR0b24uQ0xBU1NfT0ZGKTtcclxuXHJcbiAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICAgICAgdGhpcy5vblRvZ2dsZU9mZkV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgdG9nZ2xlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT24oKSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMub24oKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNPbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vblN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIGlzT2ZmKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pc09uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uVG9nZ2xlRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uVG9nZ2xlT25FdmVudCgpIHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9uLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblRvZ2dsZU9mZkV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlT2ZmLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvblRvZ2dsZSgpOiBFdmVudDxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uVG9nZ2xlT24oKTogRXZlbnQ8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9uLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uVG9nZ2xlT2ZmKCk6IEV2ZW50PFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGVPZmYuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Tm9BcmdzLCBFdmVudERpc3BhdGNoZXIsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVJQ29udGFpbmVyQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8vIG5vdGhpbmcgdG8gYWRkXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSUNvbnRhaW5lciBleHRlbmRzIENvbnRhaW5lcjxVSUNvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgdWlDb250YWluZXJFdmVudHMgPSB7XHJcbiAgICAgICAgb25Nb3VzZUVudGVyOiBuZXcgRXZlbnREaXNwYXRjaGVyPFVJQ29udGFpbmVyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Nb3VzZU1vdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8VUlDb250YWluZXIsIE5vQXJncz4oKSxcclxuICAgICAgICBvbk1vdXNlTGVhdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8VUlDb250YWluZXIsIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFVJQ29udGFpbmVyQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLXVpY29udGFpbmVyJ1xyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5vbk1vdXNlRW50ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VFbnRlci5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYub25Nb3VzZU1vdmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VNb3ZlLmRpc3BhdGNoKHNlbmRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5vbk1vdXNlTGVhdmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VMZWF2ZS5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHN1cGVyLnRvRG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICBjb250YWluZXIub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZUVudGVyRXZlbnQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjb250YWluZXIub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vbk1vdXNlTW92ZUV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZWxlYXZlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uTW91c2VMZWF2ZUV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERldGVjdCBmbGV4Ym94IHN1cHBvcnQgKG5vdCBzdXBwb3J0ZWQgaW4gSUU5KVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50KTtcclxuICAgICAgICBpZihkb2N1bWVudCAmJiB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIikuc3R5bGUuZmxleCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBjb250YWluZXIuYWRkQ2xhc3MoXCJmbGV4Ym94XCIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcyhcIm5vLWZsZXhib3hcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbk1vdXNlRW50ZXJFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VFbnRlci5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Nb3VzZU1vdmVFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VNb3ZlLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbk1vdXNlTGVhdmVFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VMZWF2ZS5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Nb3VzZUVudGVyKCk6IEV2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy51aUNvbnRhaW5lckV2ZW50cy5vbk1vdXNlRW50ZXIuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Nb3VzZU1vdmUoKTogRXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VNb3ZlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uTW91c2VMZWF2ZSgpOiBFdmVudDxVSUNvbnRhaW5lciwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZUxlYXZlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9zZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtMaXN0U2VsZWN0b3JDb25maWd9IGZyb20gXCIuL2xpc3RzZWxlY3RvclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuZXhwb3J0IGNsYXNzIFZpZGVvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVWaWRlb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHZpZGVvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZVZpZGVvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHZpZGVvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCB2aWRlb1F1YWxpdHkgb2YgdmlkZW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbSh2aWRlb1F1YWxpdHkuaWQsIHZpZGVvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBWaWRlb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldFZpZGVvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlVmlkZW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB1cGRhdGVWaWRlb1F1YWxpdGllcyk7IC8vIFVwZGF0ZSBxdWFsaXRpZXMgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVklERU9fRE9XTkxPQURfUVVBTElUWV9DSEFOR0UsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBwbGF5ZXIuZ2V0RG93bmxvYWRlZFZpZGVvRGF0YSgpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oZGF0YS5pc0F1dG8gPyBcImF1dG9cIiA6IGRhdGEuaWQpO1xyXG4gICAgICAgIH0pOyAvLyBVcGRhdGUgcXVhbGl0eSBzZWxlY3Rpb24gd2hlbiBxdWFsaXR5IGlzIGNoYW5nZWQgKGZyb20gb3V0c2lkZSlcclxuXHJcbiAgICAgICAgLy8gUG9wdWxhdGUgcXVhbGl0aWVzIGF0IHN0YXJ0dXBcclxuICAgICAgICB1cGRhdGVWaWRlb1F1YWxpdGllcygpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtWb2x1bWVTbGlkZXJ9IGZyb20gXCIuL3ZvbHVtZXNsaWRlclwiO1xyXG5pbXBvcnQge1ZvbHVtZVRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vdm9sdW1ldG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VGltZW91dH0gZnJvbSBcIi4uL3RpbWVvdXRcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWxheSBhZnRlciB3aGljaCB0aGUgdm9sdW1lIHNsaWRlciB3aWxsIGJlIGhpZGRlbiB3aGVuIHRoZXJlIGlzIG5vIHVzZXIgaW50ZXJhY3Rpb24uXHJcbiAgICAgKiBDYXJlIG11c3QgYmUgdGFrZW4gdGhhdCB0aGUgZGVsYXkgaXMgbG9uZyBlbm91Z2ggc28gdXNlcnMgY2FuIHJlYWNoIHRoZSBzbGlkZXIgZnJvbSB0aGUgdG9nZ2xlIGJ1dHRvbiwgZS5nLiBieVxyXG4gICAgICogbW91c2UgbW92ZW1lbnQuIElmIHRoZSBkZWxheSBpcyB0b28gc2hvcnQsIHRoZSBzbGlkZXJzIGRpc2FwcGVhcnMgYmVmb3JlIHRoZSBtb3VzZSBwb2ludGVyIGhhcyByZWFjaGVkIGl0IGFuZFxyXG4gICAgICogdGhlIHVzZXIgaXMgbm90IGFibGUgdG8gdXNlIGl0LlxyXG4gICAgICogRGVmYXVsdDogNTAwbXNcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZpZXMgaWYgdGhlIHZvbHVtZSBzbGlkZXIgc2hvdWxkIGJlIHZlcnRpY2FsbHkgb3IgaG9yaXpvbnRhbGx5IGFsaWduZWQuXHJcbiAgICAgKiBEZWZhdWx0OiB0cnVlXHJcbiAgICAgKi9cclxuICAgIHZlcnRpY2FsPzogYm9vbGVhbjtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFZvbHVtZUNvbnRyb2xCdXR0b24gZXh0ZW5kcyBDb250YWluZXI8Vm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgdm9sdW1lVG9nZ2xlQnV0dG9uOiBWb2x1bWVUb2dnbGVCdXR0b247XHJcbiAgICBwcml2YXRlIHZvbHVtZVNsaWRlcjogVm9sdW1lU2xpZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy52b2x1bWVUb2dnbGVCdXR0b24gPSBuZXcgVm9sdW1lVG9nZ2xlQnV0dG9uKCk7XHJcbiAgICAgICAgdGhpcy52b2x1bWVTbGlkZXIgPSBuZXcgVm9sdW1lU2xpZGVyKHtcclxuICAgICAgICAgICAgdmVydGljYWw6IGNvbmZpZy52ZXJ0aWNhbCAhPSBudWxsID8gY29uZmlnLnZlcnRpY2FsIDogdHJ1ZSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS12b2x1bWVjb250cm9sYnV0dG9uJyxcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMudm9sdW1lVG9nZ2xlQnV0dG9uLCB0aGlzLnZvbHVtZVNsaWRlcl0sXHJcbiAgICAgICAgICAgIGhpZGVEZWxheTogNTAwXHJcbiAgICAgICAgfSwgPFZvbHVtZUNvbnRyb2xCdXR0b25Db25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCB2b2x1bWVUb2dnbGVCdXR0b24gPSB0aGlzLmdldFZvbHVtZVRvZ2dsZUJ1dHRvbigpO1xyXG4gICAgICAgIGxldCB2b2x1bWVTbGlkZXIgPSB0aGlzLmdldFZvbHVtZVNsaWRlcigpO1xyXG4gICAgICAgIGxldCB2b2x1bWVTbGlkZXJIaWRlRGVsYXlUaW1lb3V0SGFuZGxlID0gMDtcclxuXHJcbiAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dCgoPFZvbHVtZUNvbnRyb2xCdXR0b25Db25maWc+c2VsZi5nZXRDb25maWcoKSkuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlci5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVm9sdW1lIFNsaWRlciB2aXNpYmlsaXR5IGhhbmRsaW5nXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUaGUgdm9sdW1lIHNsaWRlciBzaGFsbCBiZSB2aXNpYmxlIHdoaWxlIHRoZSB1c2VyIGhvdmVycyB0aGUgbXV0ZSB0b2dnbGUgYnV0dG9uLCB3aGlsZSB0aGUgdXNlciBob3ZlcnMgdGhlXHJcbiAgICAgICAgICogdm9sdW1lIHNsaWRlciwgYW5kIHdoaWxlIHRoZSB1c2VyIHNsaWRlcyB0aGUgdm9sdW1lIHNsaWRlci4gSWYgbm9uZSBvZiB0aGVzZSBzaXR1YXRpb25zIGFyZSB0cnVlLCB0aGUgc2xpZGVyXHJcbiAgICAgICAgICogc2hhbGwgZGlzYXBwZWFyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCB2b2x1bWVTbGlkZXJIb3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgdm9sdW1lVG9nZ2xlQnV0dG9uLmdldERvbUVsZW1lbnQoKS5vbignbW91c2VlbnRlcicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gU2hvdyB2b2x1bWUgc2xpZGVyIHdoZW4gbW91c2UgZW50ZXJzIHRoZSBidXR0b24gYXJlYVxyXG4gICAgICAgICAgICBpZiAodm9sdW1lU2xpZGVyLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHZvbHVtZVNsaWRlci5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQXZvaWQgaGlkaW5nIG9mIHRoZSBzbGlkZXIgd2hlbiBidXR0b24gaXMgaG92ZXJlZFxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdm9sdW1lVG9nZ2xlQnV0dG9uLmdldERvbUVsZW1lbnQoKS5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gSGlkZSBzbGlkZXIgZGVsYXllZCB3aGVuIGJ1dHRvbiBpcyBsZWZ0XHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVTbGlkZXIuZ2V0RG9tRWxlbWVudCgpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBzbGlkZXIgaXMgZW50ZXJlZCwgY2FuY2VsIHRoZSBoaWRlIHRpbWVvdXQgYWN0aXZhdGVkIGJ5IGxlYXZpbmcgdGhlIGJ1dHRvblxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlckhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZvbHVtZVNsaWRlci5nZXREb21FbGVtZW50KCkub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gbW91c2UgbGVhdmVzIHRoZSBzbGlkZXIsIG9ubHkgaGlkZSBpdCBpZiB0aGVyZSBpcyBubyBzbGlkZSBvcGVyYXRpb24gaW4gcHJvZ3Jlc3NcclxuICAgICAgICAgICAgaWYgKHZvbHVtZVNsaWRlci5pc1NlZWtpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGltZW91dC5yZXNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlckhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVTbGlkZXIub25TZWVrZWQuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gV2hlbiBhIHNsaWRlIG9wZXJhdGlvbiBpcyBkb25lIGFuZCB0aGUgc2xpZGVyIG5vdCBob3ZlcmVkIChtb3VzZSBvdXRzaWRlIHNsaWRlciksIGhpZGUgc2xpZGVyIGRlbGF5ZWRcclxuICAgICAgICAgICAgaWYgKCF2b2x1bWVTbGlkZXJIb3ZlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRWb2x1bWVUb2dnbGVCdXR0b24oKTogVm9sdW1lVG9nZ2xlQnV0dG9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52b2x1bWVUb2dnbGVCdXR0b247XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0Vm9sdW1lU2xpZGVyKCk6IFZvbHVtZVNsaWRlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sdW1lU2xpZGVyO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlZWtCYXIsIFNlZWtCYXJDb25maWd9IGZyb20gXCIuL3NlZWtiYXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBWb2x1bWVTbGlkZXIgZXh0ZW5kcyBTZWVrQmFyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6ICd1aS12b2x1bWVzbGlkZXInXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgdm9sdW1lQ2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbigwKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24oMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24ocGxheWVyLmdldFZvbHVtZSgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldEJ1ZmZlclBvc2l0aW9uKHBsYXllci5nZXRWb2x1bWUoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9WT0xVTUVfQ0hBTkdFLCB2b2x1bWVDaGFuZ2VIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9NVVRFLCB2b2x1bWVDaGFuZ2VIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9VTk1VVEUsIHZvbHVtZUNoYW5nZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICB0aGlzLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3Muc2NydWJiaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0Vm9sdW1lKGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vblNlZWtlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0Vm9sdW1lKHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBJbml0IHZvbHVtZSBiYXJcclxuICAgICAgICB2b2x1bWVDaGFuZ2VIYW5kbGVyKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uLCBUb2dnbGVCdXR0b25Db25maWd9IGZyb20gXCIuL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgVm9sdW1lQ2hhbmdlRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuVm9sdW1lQ2hhbmdlRXZlbnQ7XHJcblxyXG5leHBvcnQgY2xhc3MgVm9sdW1lVG9nZ2xlQnV0dG9uIGV4dGVuZHMgVG9nZ2xlQnV0dG9uPFRvZ2dsZUJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVG9nZ2xlQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktdm9sdW1ldG9nZ2xlYnV0dG9uJyxcclxuICAgICAgICAgICAgdGV4dDogJ1ZvbHVtZS9NdXRlJ1xyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IG11dGVTdGF0ZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNNdXRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fTVVURSwgbXV0ZVN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVU5NVVRFLCBtdXRlU3RhdGVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNNdXRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIudW5tdXRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIubXV0ZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZPTFVNRV9DSEFOR0UsIGZ1bmN0aW9uIChldmVudDogVm9sdW1lQ2hhbmdlRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gVG9nZ2xlIGxvdyBjbGFzcyB0byBkaXNwbGF5IGxvdyB2b2x1bWUgaWNvbiBiZWxvdyA1MCUgdm9sdW1lXHJcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXRWb2x1bWUgPCA1MCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3MoXCJsb3dcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhcImxvd1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBWUlRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogJ3VpLXZydG9nZ2xlYnV0dG9uJyxcclxuICAgICAgICAgICAgdGV4dDogJ1ZSJ1xyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IGlzVlJDb25maWd1cmVkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBWUiBhdmFpbGFiaWxpdHkgY2Fubm90IGJlIGNoZWNrZWQgdGhyb3VnaCBnZXRWUlN0YXR1cygpIGJlY2F1c2UgaXQgaXMgYXN5bmNocm9ub3VzbHkgcG9wdWxhdGVkIGFuZCBub3RcclxuICAgICAgICAgICAgLy8gYXZhaWxhYmxlIGF0IFVJIGluaXRpYWxpemF0aW9uLiBBcyBhbiBhbHRlcm5hdGl2ZSwgd2UgY2hlY2sgdGhlIFZSIHNldHRpbmdzIGluIHRoZSBjb25maWcuXHJcbiAgICAgICAgICAgIC8vIFRPRE8gdXNlIGdldFZSU3RhdHVzKCkgdGhyb3VnaCBpc1ZSU3RlcmVvQXZhaWxhYmxlKCkgb25jZSB0aGUgcGxheWVyIGhhcyBiZWVuIHJld3JpdHRlbiBhbmQgdGhlIHN0YXR1cyBpcyBhdmFpbGFibGUgaW4gT05fUkVBRFlcclxuICAgICAgICAgICAgbGV0IGNvbmZpZyA9IHBsYXllci5nZXRDb25maWcoKTtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZy5zb3VyY2UgJiYgY29uZmlnLnNvdXJjZS52ciAmJiBjb25maWcuc291cmNlLnZyLmNvbnRlbnRUeXBlICE9ICdub25lJztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgaXNWUlN0ZXJlb0F2YWlsYWJsZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBsYXllci5nZXRWUlN0YXR1cygpLmNvbnRlbnRUeXBlICE9ICdub25lJztcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgdnJTdGF0ZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1ZSQ29uZmlndXJlZCgpICYmIGlzVlJTdGVyZW9BdmFpbGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7IC8vIHNob3cgYnV0dG9uIGluIGNhc2UgaXQgaXMgaGlkZGVuXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5nZXRWUlN0YXR1cygpLmlzU3RlcmVvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7IC8vIGhpZGUgYnV0dG9uIGlmIG5vIHN0ZXJlbyBtb2RlIGF2YWlsYWJsZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1ZSQ29uZmlndXJlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVlJfTU9ERV9DSEFOR0VELCB2clN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVlJfU1RFUkVPX0NIQU5HRUQsIHZyU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9WUl9FUlJPUiwgdnJTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdnJCdXR0b25WaXNpYmlsaXR5SGFuZGxlcik7IC8vIEhpZGUgYnV0dG9uIHdoZW4gVlIgc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB2ckJ1dHRvblZpc2liaWxpdHlIYW5kbGVyKTsgLy8gU2hvdyBidXR0b24gd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkIGFuZCBpdCdzIFZSXHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoIWlzVlJTdGVyZW9BdmFpbGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUpIGNvbnNvbGUubG9nKCdObyBWUiBjb250ZW50Jyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdldFZSU3RhdHVzKCkuaXNTdGVyZW8pIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8odHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHN0YXJ0dXAgdmlzaWJpbGl0eVxyXG4gICAgICAgIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCdXR0b24sIEJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vYnV0dG9uXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFdhdGVybWFya0NvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1cmwgdG8gb3BlbiB3aGVuIHRoZSB3YXRlcm1hcmsgaXMgY2xpY2tlZC4gU2V0IHRvIG51bGwgdG8gZGlzYWJsZSB0aGUgY2xpY2sgaGFuZGxlci5cclxuICAgICAqL1xyXG4gICAgdXJsPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgV2F0ZXJtYXJrIGV4dGVuZHMgQnV0dG9uPFdhdGVybWFya0NvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogV2F0ZXJtYXJrQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiAndWktd2F0ZXJtYXJrJyxcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL2JpdG1vdmluLmNvbSdcclxuICAgICAgICB9LCA8V2F0ZXJtYXJrQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0VXJsKCkpIHtcclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmdldERvbUVsZW1lbnQoKTtcclxuICAgICAgICAgICAgZWxlbWVudC5kYXRhKCd1cmwnLCB0aGlzLmdldFVybCgpKTtcclxuICAgICAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihlbGVtZW50LmRhdGEoJ3VybCcpLCAnX2JsYW5rJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRVcmwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKDxXYXRlcm1hcmtDb25maWc+dGhpcy5jb25maWcpLnVybDtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPZmZzZXQge1xyXG4gICAgbGVmdDogbnVtYmVyO1xyXG4gICAgdG9wOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaW1wbGUgRE9NIG1hbmlwdWxhdGlvbiBhbmQgRE9NIGVsZW1lbnQgZXZlbnQgaGFuZGxpbmcgbW9kZWxlZCBhZnRlciBqUXVlcnkgKGFzIHJlcGxhY2VtZW50IGZvciBqUXVlcnkpLlxyXG4gKlxyXG4gKiBMaWtlIGpRdWVyeSwgRE9NIG9wZXJhdGVzIG9uIHNpbmdsZSBlbGVtZW50cyBhbmQgbGlzdHMgb2YgZWxlbWVudHMuIEZvciBleGFtcGxlOiBjcmVhdGluZyBhbiBlbGVtZW50IHJldHVybnMgYSBET01cclxuICogaW5zdGFuY2Ugd2l0aCBhIHNpbmdsZSBlbGVtZW50LCBzZWxlY3RpbmcgZWxlbWVudHMgcmV0dXJucyBhIERPTSBpbnN0YW5jZSB3aXRoIHplcm8sIG9uZSwgb3IgbWFueSBlbGVtZW50cy4gU2ltaWxhclxyXG4gKiB0byBqUXVlcnksIHNldHRlcnMgdXN1YWxseSBhZmZlY3QgYWxsIGVsZW1lbnRzLCB3aGlsZSBnZXR0ZXJzIG9wZXJhdGUgb24gb25seSB0aGUgZmlyc3QgZWxlbWVudC5cclxuICogQWxzbyBzaW1pbGFyIHRvIGpRdWVyeSwgbW9zdCBtZXRob2RzIChleGNlcHQgZ2V0dGVycykgcmV0dXJuIHRoZSBET00gaW5zdGFuY2UgZmFjaWxpdGF0aW5nIGVhc3kgY2hhaW5pbmcgb2YgbWV0aG9kIGNhbGxzLlxyXG4gKlxyXG4gKiBCdWlsdCB3aXRoIHRoZSBoZWxwIG9mOiBodHRwOi8veW91bWlnaHRub3RuZWVkanF1ZXJ5LmNvbS9cclxuICovXHJcbmV4cG9ydCBjbGFzcyBET00ge1xyXG5cclxuICAgIHByaXZhdGUgZG9jdW1lbnQ6IERvY3VtZW50O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxpc3Qgb2YgZWxlbWVudHMgdGhhdCB0aGUgaW5zdGFuY2Ugd3JhcHMuIFRha2UgY2FyZSB0aGF0IG5vdCBhbGwgbWV0aG9kcyBjYW4gb3BlcmF0ZSBvbiB0aGUgd2hvbGUgbGlzdCxcclxuICAgICAqIGdldHRlcnMgdXN1YWxseSBqdXN0IHdvcmsgb24gdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZWxlbWVudHM6IEhUTUxFbGVtZW50W107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgRE9NIGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gdGFnTmFtZSB0aGUgdGFnIG5hbWUgb2YgdGhlIERPTSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlcyBhIGxpc3Qgb2YgYXR0cmlidXRlcyBvZiB0aGUgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcih0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZXM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9KTtcclxuICAgIC8qKlxyXG4gICAgICogU2VsZWN0cyBhbGwgZWxlbWVudHMgZnJvbSB0aGUgRE9NIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBzZWxlY3Rvci5cclxuICAgICAqIEBwYXJhbSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdG8gbWF0Y2ggRE9NIGVsZW1lbnRzIHdpdGhcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk7XHJcbiAgICAvKipcclxuICAgICAqIFdyYXBzIGEgcGxhaW4gSFRNTEVsZW1lbnQgd2l0aCBhIERPTSBpbnN0YW5jZS5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IHRoZSBIVE1MRWxlbWVudCB0byB3cmFwIHdpdGggRE9NXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTtcclxuICAgIC8qKlxyXG4gICAgICogV3JhcHMgdGhlIGRvY3VtZW50IHdpdGggYSBET00gaW5zdGFuY2UuIFVzZWZ1bCB0byBhdHRhY2ggZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBkb2N1bWVudC5cclxuICAgICAqIEBwYXJhbSBkb2N1bWVudCB0aGUgZG9jdW1lbnQgdG8gd3JhcFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudDogRG9jdW1lbnQpO1xyXG4gICAgY29uc3RydWN0b3Ioc29tZXRoaW5nOiBzdHJpbmcgfCBIVE1MRWxlbWVudCB8IERvY3VtZW50LCBhdHRyaWJ1dGVzPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7IC8vIFNldCB0aGUgZ2xvYmFsIGRvY3VtZW50IHRvIHRoZSBsb2NhbCBkb2N1bWVudCBmaWVsZFxyXG5cclxuICAgICAgICBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHNvbWV0aGluZyBpbnN0YW5jZW9mIERvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gYSBkb2N1bWVudCBpcyBwYXNzZWQgaW4sIHdlIGRvIG5vdCBkbyBhbnl0aGluZyB3aXRoIGl0LCBidXQgYnkgc2V0dGluZyB0aGlzLmVsZW1lbnRzIHRvIG51bGxcclxuICAgICAgICAgICAgLy8gd2UgZ2l2ZSB0aGUgZXZlbnQgaGFuZGxpbmcgbWV0aG9kIGEgbWVhbnMgdG8gZGV0ZWN0IGlmIHRoZSBldmVudHMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgb24gdGhlIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2YgZWxlbWVudHMuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWdOYW1lID0gc29tZXRoaW5nO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVWYWx1ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBOb2RlTGlzdCB0byBBcnJheVxyXG4gICAgICAgICAgICAvLyBodHRwczovL3RvZGRtb3R0by5jb20vYS1jb21wcmVoZW5zaXZlLWRpdmUtaW50by1ub2RlbGlzdHMtYXJyYXlzLWNvbnZlcnRpbmctbm9kZWxpc3RzLWFuZC11bmRlcnN0YW5kaW5nLXRoZS1kb20vXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXS5zbGljZS5jYWxsKGVsZW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHNob3J0Y3V0IG1ldGhvZCBmb3IgaXRlcmF0aW5nIGFsbCBlbGVtZW50cy4gU2hvcnRzIHRoaXMuZWxlbWVudHMuZm9yRWFjaCguLi4pIHRvIHRoaXMuZm9yRWFjaCguLi4pLlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgdGhlIGhhbmRsZXIgdG8gZXhlY3V0ZSBhbiBvcGVyYXRpb24gb24gYW4gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGZvckVhY2goaGFuZGxlcjogKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG9mIHRoZSBpbm5lciBIVE1MIGNvbnRlbnQgb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGh0bWwoKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBpbm5lciBIVE1MIGNvbnRlbnQgb2YgYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgYSBzdHJpbmcgb2YgcGxhaW4gdGV4dCBvciBIVE1MIG1hcmt1cFxyXG4gICAgICovXHJcbiAgICBodG1sKGNvbnRlbnQ6IHN0cmluZyk6IERPTTtcclxuICAgIGh0bWwoY29udGVudD86IHN0cmluZyk6IHN0cmluZyB8IERPTSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEh0bWwoY29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRIdG1sKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0SHRtbCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5pbm5lckhUTUw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRIdG1sKGNvbnRlbnQ6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgaWYgKGNvbnRlbnQgPT0gdW5kZWZpbmVkIHx8IGNvbnRlbnQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBTZXQgdG8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIGlubmVySFRNTCBnZXR0aW5nIHNldCB0byBcInVuZGVmaW5lZFwiIChhbGwgYnJvd3NlcnMpIG9yIFwibnVsbFwiIChJRTkpXHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gY29udGVudDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIGlubmVyIEhUTUwgb2YgYWxsIGVsZW1lbnRzIChkZWxldGVzIGFsbCBjaGlsZHJlbikuXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBlbXB0eSgpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgZmlyc3QgZm9ybSBlbGVtZW50LCBlLmcuIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiBhIHNlbGVjdCBib3ggb3IgdGhlIHRleHQgaWYgYW4gaW5wdXQgZmllbGQuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgdmFsdWUgb2YgYSBmb3JtIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgdmFsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzWzBdO1xyXG5cclxuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50IHx8IGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gVE9ETyBhZGQgc3VwcG9ydCBmb3IgbWlzc2luZyBmb3JtIGVsZW1lbnRzXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdmFsKCkgbm90IHN1cHBvcnRlZCBmb3IgJHt0eXBlb2YgZWxlbWVudH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgb24gdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIGF0dHIoYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxyXG4gICAgICovXHJcbiAgICBhdHRyKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NO1xyXG4gICAgYXR0cihhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHwgRE9NIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cihhdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEF0dHIoYXR0cmlidXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBdHRyKGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0uZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRBdHRyKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIGRhdGEgZWxlbWVudCBvbiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBkYXRhQXR0cmlidXRlIHRoZSBuYW1lIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZSB3aXRob3V0IHRoZSBcImRhdGEtXCIgcHJlZml4XHJcbiAgICAgKi9cclxuICAgIGRhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIGRhdGEgYXR0cmlidXRlIG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBkYXRhQXR0cmlidXRlIHRoZSBuYW1lIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZSB3aXRob3V0IHRoZSBcImRhdGEtXCIgcHJlZml4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZVxyXG4gICAgICovXHJcbiAgICBkYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTTtcclxuICAgIGRhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZyk6IHN0cmluZyB8IG51bGwgfCBET00ge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXRhKGRhdGFBdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGEoZGF0YUF0dHJpYnV0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5nZXRBdHRyaWJ1dGUoXCJkYXRhLVwiICsgZGF0YUF0dHJpYnV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXREYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1cIiArIGRhdGFBdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFwcGVuZHMgb25lIG9yIG1vcmUgRE9NIGVsZW1lbnRzIGFzIGNoaWxkcmVuIHRvIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBjaGlsZEVsZW1lbnRzIHRoZSBjaHJpbGQgZWxlbWVudHMgdG8gYXBwZW5kXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBhcHBlbmQoLi4uY2hpbGRFbGVtZW50czogRE9NW10pOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBjaGlsZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRFbGVtZW50LmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKF8sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZEVsZW1lbnQuZWxlbWVudHNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG9mZnNldCBvZiB0aGUgZmlyc3QgZWxlbWVudCBmcm9tIHRoZSBkb2N1bWVudCdzIHRvcCBsZWZ0IGNvcm5lci5cclxuICAgICAqIEByZXR1cm5zIHtPZmZzZXR9XHJcbiAgICAgKi9cclxuICAgIG9mZnNldCgpOiBPZmZzZXQge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50c1swXTtcclxuICAgICAgICBsZXQgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIGFsd2F5cyAwIGluIElFOSwgSUUxMSwgRmlyZWZveFxyXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzExMTAyMjE1LzM3MDI1MlxyXG4gICAgICAgIGxldCBzY3JvbGxUb3AgPSB0eXBlb2Ygd2luZG93LnBhZ2VZT2Zmc2V0ICE9ICd1bmRlZmluZWQnID9cclxuICAgICAgICAgICAgd2luZG93LnBhZ2VZT2Zmc2V0IDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA/XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgOiBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA/XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIDogMDtcclxuXHJcbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0IGFsd2F5cyAwIGluIElFOSwgSUUxMSwgRmlyZWZveFxyXG4gICAgICAgIGxldCBzY3JvbGxMZWZ0ID0gdHlwZW9mIHdpbmRvdy5wYWdlWE9mZnNldCAhPSAndW5kZWZpbmVkJyA/XHJcbiAgICAgICAgICAgIHdpbmRvdy5wYWdlWE9mZnNldCA6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0ID9cclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgOiBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgP1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgOiAwO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0b3A6IHJlY3QudG9wICsgc2Nyb2xsVG9wLFxyXG4gICAgICAgICAgICBsZWZ0OiByZWN0LmxlZnQgKyBzY3JvbGxMZWZ0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIHdpZHRoIG9mIHRoZSBmaXJzdCBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHdpZHRoKCk6IG51bWJlciB7XHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpZiB0aGlzIGlzIHRoZSBzYW1lIGFzIGpRdWVyeSdzIHdpZHRoKCkgKHByb2JhYmx5IG5vdClcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5vZmZzZXRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBoZWlnaHQgb2YgdGhlIGZpcnN0IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpZiB0aGlzIGlzIHRoZSBzYW1lIGFzIGpRdWVyeSdzIGhlaWdodCgpIChwcm9iYWJseSBub3QpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYW4gZXZlbnQgaGFuZGxlciB0byBvbmUgb3IgbW9yZSBldmVudHMgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSB0aGUgZXZlbnQgbmFtZSAob3IgbXVsdGlwbGUgbmFtZXMgc2VwYXJhdGVkIGJ5IHNwYWNlKSB0byBsaXN0ZW4gdG9cclxuICAgICAqIEBwYXJhbSBldmVudEhhbmRsZXIgdGhlIGV2ZW50IGhhbmRsZXIgdG8gY2FsbCB3aGVuIHRoZSBldmVudCBmaXJlc1xyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgb24oZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50SGFuZGxlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCk6IERPTSB7XHJcbiAgICAgICAgbGV0IGV2ZW50cyA9IGV2ZW50TmFtZS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuZWxlbWVudHMgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudEhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudEhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGV2ZW50IGhhbmRsZXIgZnJvbSBvbmUgb3IgbW9yZSBldmVudHMgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSB0aGUgZXZlbnQgbmFtZSAob3IgbXVsdGlwbGUgbmFtZXMgc2VwYXJhdGVkIGJ5IHNwYWNlKSB0byByZW1vdmUgdGhlIGhhbmRsZXIgZnJvbVxyXG4gICAgICogQHBhcmFtIGV2ZW50SGFuZGxlciB0aGUgZXZlbnQgaGFuZGxlciB0byByZW1vdmVcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIG9mZihldmVudE5hbWU6IHN0cmluZywgZXZlbnRIYW5kbGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0KTogRE9NIHtcclxuICAgICAgICBsZXQgZXZlbnRzID0gZXZlbnROYW1lLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5lbGVtZW50cyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgdG8gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNsYXNzTmFtZSB0aGUgY2xhc3MoZXMpIHRvIGFkZCwgbXVsdGlwbGUgY2xhc3NlcyBzZXBhcmF0ZWQgYnkgc3BhY2VcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGFkZENsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgJyArIGNsYXNzTmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZWQgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgZnJvbSBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lIHRoZSBjbGFzcyhlcykgdG8gcmVtb3ZlLCBtdWx0aXBsZSBjbGFzc2VzIHNlcGFyYXRlZCBieSBzcGFjZVxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCd8JykgKyAnKFxcXFxifCQpJywgJ2dpJyksICcgJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgYW55IG9mIHRoZSBlbGVtZW50cyBoYXMgdGhlIHNwZWNpZmllZCBjbGFzcy5cclxuICAgICAqIEBwYXJhbSBjbGFzc05hbWUgdGhlIGNsYXNzIG5hbWUgdG8gY2hlY2tcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIG9uZSBvZiB0aGUgZWxlbWVudHMgaGFzIHRoZSBjbGFzcyBhdHRhY2hlZCwgZWxzZSBpZiBubyBlbGVtZW50IGhhcyBpdCBhdHRhY2hlZFxyXG4gICAgICovXHJcbiAgICBoYXNDbGFzcyhjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgICAgIGlmKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKCcoXnwgKScgKyBjbGFzc05hbWUgKyAnKCB8JCknLCAnZ2knKS50ZXN0KGVsZW1lbnQuY2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgQ1NTIHByb3BlcnR5IG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHBhcmFtIHByb3BlcnR5TmFtZSB0aGUgbmFtZSBvZiB0aGUgQ1NTIHByb3BlcnR5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBvZlxyXG4gICAgICovXHJcbiAgICBjc3MocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIENTUyBwcm9wZXJ0eSBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlOYW1lIHRoZSBuYW1lIG9mIHRoZSBDU1MgcHJvcGVydHkgdG8gc2V0IHRoZSB2YWx1ZSBmb3JcclxuICAgICAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gc2V0IGZvciB0aGUgZ2l2ZW4gQ1NTIHByb3BlcnR5XHJcbiAgICAgKi9cclxuICAgIGNzcyhwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTTtcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIGNvbGxlY3Rpb24gb2YgQ1NTIHByb3BlcnRpZXMgYW5kIHRoZWlyIHZhbHVlcyBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlWYWx1ZUNvbGxlY3Rpb24gYW4gb2JqZWN0IGNvbnRhaW5pbmcgcGFpcnMgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHRoZWlyIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBjc3MocHJvcGVydHlWYWx1ZUNvbGxlY3Rpb246IHtbcHJvcGVydHlOYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogRE9NO1xyXG4gICAgY3NzKHByb3BlcnR5TmFtZU9yQ29sbGVjdGlvbjogc3RyaW5nIHwge1twcm9wZXJ0eU5hbWU6IHN0cmluZ106IHN0cmluZ30sIHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB8IERPTSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb24gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgbGV0IHByb3BlcnR5TmFtZSA9IHByb3BlcnR5TmFtZU9yQ29sbGVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldENzcyhwcm9wZXJ0eU5hbWUsIHZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENzcyhwcm9wZXJ0eU5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgcHJvcGVydHlWYWx1ZUNvbGxlY3Rpb24gPSBwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb247XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldENzc0NvbGxlY3Rpb24ocHJvcGVydHlWYWx1ZUNvbGxlY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENzcyhwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudHNbMF0pWzxhbnk+cHJvcGVydHlOYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldENzcyhwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIDxhbnk+IGNhc3QgdG8gcmVzb2x2ZSBUUzcwMTU6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM2NjI3MTE0LzM3MDI1MlxyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlWzxhbnk+cHJvcGVydHlOYW1lXSA9IHZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Q3NzQ29sbGVjdGlvbihydWxlVmFsdWVDb2xsZWN0aW9uOiB7W3J1bGVOYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzQ0OTA1NzMvMzcwMjUyXHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwgcnVsZVZhbHVlQ29sbGVjdGlvbik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtBcnJheVV0aWxzfSBmcm9tIFwiLi91dGlsc1wiO1xyXG4vKipcclxuICogRnVuY3Rpb24gaW50ZXJmYWNlIGZvciBldmVudCBsaXN0ZW5lcnMgb24gdGhlIHtAbGluayBFdmVudERpc3BhdGNoZXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4ge1xyXG4gICAgKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKTogdm9pZFxyXG59XHJcblxyXG4vKipcclxuICogRW1wdHkgdHlwZSBmb3IgY3JlYXRpbmcge0BsaW5rIEV2ZW50RGlzcGF0Y2hlciBldmVudCBkaXNwYXRjaGVyc30gdGhhdCBkbyBub3QgY2FycnkgYW55IGFyZ3VtZW50cy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm9BcmdzIHtcclxufVxyXG5cclxuLyoqXHJcbiAqIFB1YmxpYyBpbnRlcmZhY2UgdGhhdCByZXByZXNlbnRzIGFuIGV2ZW50LiBDYW4gYmUgdXNlZCB0byBzdWJzY3JpYmUgdG8gYW5kIHVuc3Vic2NyaWJlIGZyb20gZXZlbnRzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBFdmVudDxTZW5kZXIsIEFyZ3M+IHtcclxuICAgIC8qKlxyXG4gICAgICogU3Vic2NyaWJlcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGlzIGV2ZW50IGRpc3BhdGNoZXIuXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgdGhlIGxpc3RlbmVyIHRvIGFkZFxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmUobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPik6IHZvaWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJzY3JpYmVzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoaXMgZXZlbnQgZGlzcGF0Y2hlciB0aGF0IHdpbGwgYmUgY2FsbGVkIGF0IGEgbGltaXRlZCByYXRlIHdpdGggYSBtaW5pbXVtXHJcbiAgICAgKiBpbnRlcnZhbCBvZiB0aGUgc3BlY2lmaWVkIG1pbGxpc2Vjb25kcy5cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gcmF0ZU1zIHRoZSByYXRlIGluIG1pbGxpc2Vjb25kcyB0byB3aGljaCBjYWxsaW5nIG9mIHRoZSBsaXN0ZW5lcnMgc2hvdWxkIGJlIGxpbWl0ZWRcclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlUmF0ZUxpbWl0ZWQobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiwgcmF0ZU1zOiBudW1iZXIpOiB2b2lkO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5zdWJzY3JpYmVzIGEgc3Vic2NyaWJlZCBldmVudCBsaXN0ZW5lciBmcm9tIHRoaXMgZGlzcGF0Y2hlci5cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbGlzdGVuZXIgd2FzIHN1Y2Nlc3NmdWxseSB1bnN1YnNjcmliZWQsIGZhbHNlIGlmIGl0IGlzbid0IHN1YnNjcmliZWQgb24gdGhpcyBkaXNwYXRjaGVyXHJcbiAgICAgKi9cclxuICAgIHVuc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pOiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRXZlbnQgZGlzcGF0Y2hlciB0byBzdWJzY3JpYmUgYW5kIHRyaWdnZXIgZXZlbnRzLiBFYWNoIGV2ZW50IHNob3VsZCBoYXZlIGl0cyBvd24gZGlzcGF0Y2hlci5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXI8U2VuZGVyLCBBcmdzPiBpbXBsZW1lbnRzIEV2ZW50PFNlbmRlciwgQXJncz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGlzdGVuZXJzOiBFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+W10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHtAaW5oZXJpdERvY31cclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG5ldyBFdmVudExpc3RlbmVyV3JhcHBlcihsaXN0ZW5lcikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICoge0Bpbmhlcml0RG9jfVxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmVSYXRlTGltaXRlZChsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+LCByYXRlTXM6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobmV3IFJhdGVMaW1pdGVkRXZlbnRMaXN0ZW5lcldyYXBwZXIobGlzdGVuZXIsIHJhdGVNcykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICoge0Bpbmhlcml0RG9jfVxyXG4gICAgICovXHJcbiAgICB1bnN1YnNjcmliZShsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGxpc3RlbmVycywgY29tcGFyZSB3aXRoIHBhcmFtZXRlciwgYW5kIHJlbW92ZSBpZiBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN1YnNjcmliZWRMaXN0ZW5lciA9IHRoaXMubGlzdGVuZXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlZExpc3RlbmVyLmxpc3RlbmVyID09IGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICBBcnJheVV0aWxzLnJlbW92ZSh0aGlzLmxpc3RlbmVycywgc3Vic2NyaWJlZExpc3RlbmVyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNwYXRjaGVzIGFuIGV2ZW50IHRvIGFsbCBzdWJzY3JpYmVkIGxpc3RlbmVycy5cclxuICAgICAqIEBwYXJhbSBzZW5kZXIgdGhlIHNvdXJjZSBvZiB0aGUgZXZlbnRcclxuICAgICAqIEBwYXJhbSBhcmdzIHRoZSBhcmd1bWVudHMgZm9yIHRoZSBldmVudFxyXG4gICAgICovXHJcbiAgICBkaXNwYXRjaChzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncyA9IG51bGwpIHtcclxuICAgICAgICAvLyBDYWxsIGV2ZXJ5IGxpc3RlbmVyXHJcbiAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5saXN0ZW5lcnMpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXIuZmlyZShzZW5kZXIsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGV2ZW50IHRoYXQgdGhpcyBkaXNwYXRjaGVyIG1hbmFnZXMgYW5kIG9uIHdoaWNoIGxpc3RlbmVycyBjYW4gc3Vic2NyaWJlIGFuZCB1bnN1YnNjcmliZSBldmVudCBoYW5kbGVycy5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudH1cclxuICAgICAqL1xyXG4gICAgZ2V0RXZlbnQoKTogRXZlbnQ8U2VuZGVyLCBBcmdzPiB7XHJcbiAgICAgICAgLy8gRm9yIG5vdywganVzdCBjYXNlIHRoZSBldmVudCBkaXNwYXRjaGVyIHRvIHRoZSBldmVudCBpbnRlcmZhY2UuIEF0IHNvbWUgcG9pbnQgaW4gdGhlIGZ1dHVyZSB3aGVuIHRoZVxyXG4gICAgICAgIC8vIGNvZGViYXNlIGdyb3dzLCBpdCBtaWdodCBtYWtlIHNlbnNlIHRvIHNwbGl0IHRoZSBkaXNwYXRjaGVyIGludG8gc2VwYXJhdGUgZGlzcGF0Y2hlciBhbmQgZXZlbnQgY2xhc3Nlcy5cclxuICAgICAgICByZXR1cm4gPEV2ZW50PFNlbmRlciwgQXJncz4+dGhpcztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEEgYmFzaWMgZXZlbnQgbGlzdGVuZXIgd3JhcHBlciB0byBtYW5hZ2UgbGlzdGVuZXJzIHdpdGhpbiB0aGUge0BsaW5rIEV2ZW50RGlzcGF0Y2hlcn0uIFRoaXMgaXMgYSBcInByaXZhdGVcIiBjbGFzc1xyXG4gKiBmb3IgaW50ZXJuYWwgZGlzcGF0Y2hlciB1c2UgYW5kIGl0IGlzIHRoZXJlZm9yZSBub3QgZXhwb3J0ZWQuXHJcbiAqL1xyXG5jbGFzcyBFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+IHtcclxuXHJcbiAgICBwcml2YXRlIGV2ZW50TGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KSB7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbmVyID0gbGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB3cmFwcGVkIGV2ZW50IGxpc3RlbmVyLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGxpc3RlbmVyKCk6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRMaXN0ZW5lcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSB3cmFwcGVkIGV2ZW50IGxpc3RlbmVyIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50cy5cclxuICAgICAqIEBwYXJhbSBzZW5kZXJcclxuICAgICAqIEBwYXJhbSBhcmdzXHJcbiAgICAgKi9cclxuICAgIGZpcmUoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpIHtcclxuICAgICAgICB0aGlzLmV2ZW50TGlzdGVuZXIoc2VuZGVyLCBhcmdzKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4dGVuZHMgdGhlIGJhc2ljIHtAbGluayBFdmVudExpc3RlbmVyV3JhcHBlcn0gd2l0aCByYXRlLWxpbWl0aW5nIGZ1bmN0aW9uYWxpdHkuXHJcbiAqL1xyXG5jbGFzcyBSYXRlTGltaXRlZEV2ZW50TGlzdGVuZXJXcmFwcGVyPFNlbmRlciwgQXJncz4gZXh0ZW5kcyBFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+IHtcclxuXHJcbiAgICBwcml2YXRlIHJhdGVNczogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByYXRlTGltaXRpbmdFdmVudExpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz47XHJcblxyXG4gICAgcHJpdmF0ZSBsYXN0RmlyZVRpbWU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+LCByYXRlTXM6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKGxpc3RlbmVyKTsgLy8gc2V0cyB0aGUgZXZlbnQgbGlzdGVuZXIgc2lua1xyXG5cclxuICAgICAgICB0aGlzLnJhdGVNcyA9IHJhdGVNcztcclxuICAgICAgICB0aGlzLmxhc3RGaXJlVGltZSA9IDA7XHJcblxyXG4gICAgICAgIC8vIFdyYXAgdGhlIGV2ZW50IGxpc3RlbmVyIHdpdGggYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBkb2VzIHRoZSByYXRlLWxpbWl0aW5nXHJcbiAgICAgICAgdGhpcy5yYXRlTGltaXRpbmdFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gdGhpcy5sYXN0RmlyZVRpbWUgPiB0aGlzLnJhdGVNcykge1xyXG4gICAgICAgICAgICAgICAgLy8gT25seSBpZiBlbm91Z2ggdGltZSBzaW5jZSB0aGUgcHJldmlvdXMgY2FsbCBoYXMgcGFzc2VkLCBjYWxsIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gYWN0dWFsIGV2ZW50IGxpc3RlbmVyIGFuZCByZWNvcmQgdGhlIGN1cnJlbnQgdGltZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlU3VwZXIoc2VuZGVyLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEZpcmVUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlU3VwZXIoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpIHtcclxuICAgICAgICAvLyBGaXJlIHRoZSBhY3R1YWwgZXh0ZXJuYWwgZXZlbnQgbGlzdGVuZXJcclxuICAgICAgICBzdXBlci5maXJlKHNlbmRlciwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgZmlyZShzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncykge1xyXG4gICAgICAgIC8vIEZpcmUgdGhlIGludGVybmFsIHJhdGUtbGltaXRpbmcgbGlzdGVuZXIgaW5zdGVhZCBvZiB0aGUgZXh0ZXJuYWwgZXZlbnQgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLnJhdGVMaW1pdGluZ0V2ZW50TGlzdGVuZXIoc2VuZGVyLCBhcmdzKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuZXhwb3J0IG1vZHVsZSBHdWlkIHtcclxuXHJcbiAgICBsZXQgZ3VpZCA9IDE7XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIGd1aWQrKztcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbGF5ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ub2RlX21vZHVsZXMvQHR5cGVzL2NvcmUtanMvaW5kZXguZC50c1wiIC8+XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvYnV0dG9uXCI7XHJcbmltcG9ydCB7Q29udHJvbEJhcn0gZnJvbSBcIi4vY29tcG9uZW50cy9jb250cm9sYmFyXCI7XHJcbmltcG9ydCB7RnVsbHNjcmVlblRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9mdWxsc2NyZWVudG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7SHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2h1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1BsYXliYWNrVGltZUxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrdGltZWxhYmVsXCI7XHJcbmltcG9ydCB7UGxheWJhY2tUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZWVrQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJcIjtcclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7U2V0dGluZ3NQYW5lbH0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3BhbmVsXCI7XHJcbmltcG9ydCB7U2V0dGluZ3NUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvc2V0dGluZ3N0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VmlkZW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZGVvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1ZvbHVtZVRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWV0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtWUlRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92cnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1dhdGVybWFya30gZnJvbSBcIi4vY29tcG9uZW50cy93YXRlcm1hcmtcIjtcclxuaW1wb3J0IHtVSUNvbnRhaW5lcn0gZnJvbSBcIi4vY29tcG9uZW50cy91aWNvbnRhaW5lclwiO1xyXG5pbXBvcnQge0NvbnRhaW5lcn0gZnJvbSBcIi4vY29tcG9uZW50cy9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9sYWJlbFwiO1xyXG5pbXBvcnQge0F1ZGlvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9hdWRpb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtBdWRpb1RyYWNrU2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL2F1ZGlvdHJhY2tzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtDYXN0U3RhdHVzT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9jYXN0c3RhdHVzb3ZlcmxheVwiO1xyXG5pbXBvcnQge0Nhc3RUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvY2FzdHRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50cy9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtFcnJvck1lc3NhZ2VPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL2Vycm9ybWVzc2FnZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtSZWNvbW1lbmRhdGlvbk92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvcmVjb21tZW5kYXRpb25vdmVybGF5XCI7XHJcbmltcG9ydCB7U2Vla0JhckxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1N1YnRpdGxlT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1RpdGxlQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3RpdGxlYmFyXCI7XHJcbmltcG9ydCB7Vm9sdW1lQ29udHJvbEJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWVjb250cm9sYnV0dG9uXCI7XHJcblxyXG4vLyBPYmplY3QuYXNzaWduIHBvbHlmaWxsIGZvciBFUzUvSUU5XHJcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RlL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ25cclxuaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduICE9ICdmdW5jdGlvbicpIHtcclxuICAgIE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbih0YXJnZXQ6IGFueSkge1xyXG4gICAgICAgICd1c2Ugc3RyaWN0JztcclxuICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0YXJnZXQgPSBPYmplY3QodGFyZ2V0KTtcclxuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XTtcclxuICAgICAgICAgICAgaWYgKHNvdXJjZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vIEV4cG9zZSBjbGFzc2VzIHRvIHdpbmRvd1xyXG4vLyBJbnNwaXJlZCBieSBodHRwczovL2tlZXN0YWxrc3RlY2guY29tLzIwMTYvMDgvc3VwcG9ydC1ib3RoLW5vZGUtanMtYW5kLWJyb3dzZXItanMtaW4tb25lLXR5cGVzY3JpcHQtZmlsZS9cclxuLy8gVE9ETyBmaW5kIG91dCBob3cgVFMvQnJvd3NlcmlmeSBjYW4gY29tcGlsZSB0aGUgY2xhc3NlcyB0byBwbGFpbiBKUyB3aXRob3V0IHRoZSBtb2R1bGUgd3JhcHBlciB3ZSBkb24ndCBuZWVkIHRvIGV4cG9zZSBjbGFzc2VzIHRvIHRoZSB3aW5kb3cgc2NvcGUgbWFudWFsbHkgaGVyZVxyXG4oZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGxldCBleHBvcnRhYmxlcyA9IFtcclxuICAgICAgICAvLyBNYW5hZ2VtZW50XHJcbiAgICAgICAgVUlNYW5hZ2VyLFxyXG4gICAgICAgIC8vIENvbXBvbmVudHNcclxuICAgICAgICBBdWRpb1F1YWxpdHlTZWxlY3RCb3gsXHJcbiAgICAgICAgQXVkaW9UcmFja1NlbGVjdEJveCxcclxuICAgICAgICBCdXR0b24sXHJcbiAgICAgICAgQ2FzdFN0YXR1c092ZXJsYXksXHJcbiAgICAgICAgQ2FzdFRvZ2dsZUJ1dHRvbixcclxuICAgICAgICBDb21wb25lbnQsXHJcbiAgICAgICAgQ29udGFpbmVyLFxyXG4gICAgICAgIENvbnRyb2xCYXIsXHJcbiAgICAgICAgRXJyb3JNZXNzYWdlT3ZlcmxheSxcclxuICAgICAgICBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbixcclxuICAgICAgICBMYWJlbCxcclxuICAgICAgICBQbGF5YmFja1RpbWVMYWJlbCxcclxuICAgICAgICBQbGF5YmFja1RvZ2dsZUJ1dHRvbixcclxuICAgICAgICBSZWNvbW1lbmRhdGlvbk92ZXJsYXksXHJcbiAgICAgICAgU2Vla0JhcixcclxuICAgICAgICBTZWVrQmFyTGFiZWwsXHJcbiAgICAgICAgU2VsZWN0Qm94LFxyXG4gICAgICAgIFNldHRpbmdzUGFuZWwsXHJcbiAgICAgICAgU2V0dGluZ3NUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgU3VidGl0bGVPdmVybGF5LFxyXG4gICAgICAgIFN1YnRpdGxlU2VsZWN0Qm94LFxyXG4gICAgICAgIFRpdGxlQmFyLFxyXG4gICAgICAgIFRvZ2dsZUJ1dHRvbixcclxuICAgICAgICBVSUNvbnRhaW5lcixcclxuICAgICAgICBWaWRlb1F1YWxpdHlTZWxlY3RCb3gsXHJcbiAgICAgICAgVm9sdW1lQ29udHJvbEJ1dHRvbixcclxuICAgICAgICBWb2x1bWVUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgVlJUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgV2F0ZXJtYXJrLFxyXG4gICAgXTtcclxuXHJcbiAgICAod2luZG93IGFzIGFueSlbJ2JpdG1vdmluJ11bJ3BsYXllcnVpJ10gPSB7fTtcclxuICAgIGxldCB1aXNjb3BlID0gKHdpbmRvdyBhcyBhbnkpWydiaXRtb3ZpbiddWydwbGF5ZXJ1aSddO1xyXG5cclxuICAgIGlmICh3aW5kb3cpIHtcclxuICAgICAgICBleHBvcnRhYmxlcy5mb3JFYWNoKGV4cCA9PiB1aXNjb3BlW25hbWVvZihleHApXSA9IGV4cCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbmFtZW9mKGZuOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgZm4gPT09ICd1bmRlZmluZWQnID8gJycgOiBmbi5uYW1lID8gZm4ubmFtZSA6ICgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSAvXmZ1bmN0aW9uXFxzKyhbXFx3XFwkXSspXFxzKlxcKC8uZXhlYyhmbi50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgcmV0dXJuICFyZXN1bHQgPyAnJyA6IHJlc3VsdFsxXTtcclxuICAgICAgICB9KSgpO1xyXG4gICAgfVxyXG5cclxufSgpKTsiLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbi8vIFRPRE8gY2hhbmdlIHRvIGludGVybmFsIChub3QgZXhwb3J0ZWQpIGNsYXNzLCBob3cgdG8gdXNlIGluIG90aGVyIGZpbGVzP1xyXG5leHBvcnQgY2xhc3MgVGltZW91dCB7XHJcblxyXG4gICAgcHJpdmF0ZSBkZWxheTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjYWxsYmFjazogKCkgPT4gdm9pZDtcclxuICAgIHByaXZhdGUgdGltZW91dEhhbmRsZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRlbGF5OiBudW1iZXIsIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5kZWxheSA9IGRlbGF5O1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB0aGlzLnRpbWVvdXRIYW5kbGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnRzIHRoZSB0aW1lb3V0IGFuZCBjYWxscyB0aGUgY2FsbGJhY2sgd2hlbiB0aGUgdGltZW91dCBkZWxheSBoYXMgcGFzc2VkLlxyXG4gICAgICovXHJcbiAgICBzdGFydCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIHRpbWVvdXQuIFRoZSBjYWxsYmFjayB3aWxsIG5vdCBiZSBjYWxsZWQgaWYgY2xlYXIgaXMgY2FsbGVkIGR1cmluZyB0aGUgdGltZW91dC5cclxuICAgICAqL1xyXG4gICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dEhhbmRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNldHMgdGhlIHBhc3NlZCB0aW1lb3V0IGRlbGF5IHRvIHplcm8uIENhbiBiZSB1c2VkIHRvIGRlZmVyIHRoZSBjYWxsaW5nIG9mIHRoZSBjYWxsYmFjay5cclxuICAgICAqL1xyXG4gICAgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgdGhpcy5kZWxheSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VUlDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdWljb250YWluZXJcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuL2RvbVwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0NvbnRhaW5lcn0gZnJvbSBcIi4vY29tcG9uZW50cy9jb250YWluZXJcIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0Z1bGxzY3JlZW5Ub2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZSVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZydG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7Vm9sdW1lVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZXRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1NlZWtCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvc2Vla2JhclwiO1xyXG5pbXBvcnQge1BsYXliYWNrVGltZUxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrdGltZWxhYmVsXCI7XHJcbmltcG9ydCB7SHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2h1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0NvbnRyb2xCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udHJvbGJhclwiO1xyXG5pbXBvcnQge05vQXJncywgRXZlbnREaXNwYXRjaGVyfSBmcm9tIFwiLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtTZXR0aW5nc1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1NldHRpbmdzUGFuZWwsIFNldHRpbmdzUGFuZWxJdGVtfSBmcm9tIFwiLi9jb21wb25lbnRzL3NldHRpbmdzcGFuZWxcIjtcclxuaW1wb3J0IHtWaWRlb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvdmlkZW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7V2F0ZXJtYXJrfSBmcm9tIFwiLi9jb21wb25lbnRzL3dhdGVybWFya1wiO1xyXG5pbXBvcnQge0xhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL2xhYmVsXCI7XHJcbmltcG9ydCB7QXVkaW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL2F1ZGlvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge0F1ZGlvVHJhY2tTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW90cmFja3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge1NlZWtCYXJMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9zZWVrYmFybGFiZWxcIjtcclxuaW1wb3J0IHtWb2x1bWVTbGlkZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdm9sdW1lc2xpZGVyXCI7XHJcbmltcG9ydCB7U3VidGl0bGVTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZU92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVvdmVybGF5XCI7XHJcbmltcG9ydCB7Vm9sdW1lQ29udHJvbEJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWVjb250cm9sYnV0dG9uXCI7XHJcbmltcG9ydCB7Q2FzdFRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9jYXN0dG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7Q2FzdFN0YXR1c092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvY2FzdHN0YXR1c292ZXJsYXlcIjtcclxuaW1wb3J0IHtFcnJvck1lc3NhZ2VPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL2Vycm9ybWVzc2FnZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtUaXRsZUJhcn0gZnJvbSBcIi4vY29tcG9uZW50cy90aXRsZWJhclwiO1xyXG5pbXBvcnQgUGxheWVyID0gYml0bW92aW4ucGxheWVyLlBsYXllcjtcclxuaW1wb3J0IHtSZWNvbW1lbmRhdGlvbk92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvcmVjb21tZW5kYXRpb25vdmVybGF5XCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVJUmVjb21tZW5kYXRpb25Db25maWcge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIHVybDogc3RyaW5nO1xyXG4gICAgdGh1bWJuYWlsPzogc3RyaW5nO1xyXG4gICAgZHVyYXRpb24/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlDb25maWcge1xyXG4gICAgbWV0YWRhdGE/OiB7XHJcbiAgICAgICAgdGl0bGU/OiBzdHJpbmdcclxuICAgIH07XHJcbiAgICByZWNvbW1lbmRhdGlvbnM/OiBVSVJlY29tbWVuZGF0aW9uQ29uZmlnW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSU1hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgcGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyO1xyXG4gICAgcHJpdmF0ZSB1aTogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz47XHJcbiAgICBwcml2YXRlIGNvbmZpZzogVUlDb25maWc7XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudHMgPSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSSBhcmVhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uTW91c2VFbnRlcjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIG1vdmVzIGluc2lkZSB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlTW92ZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIGxlYXZlcyB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlTGVhdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIGEgc2VlayBzdGFydHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25TZWVrOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBzZWVrIHRpbWVsaW5lIGlzIHNjcnViYmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla1ByZXZpZXc6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgbnVtYmVyPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gYSBzZWVrIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla2VkOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgdWk6IFVJQ29udGFpbmVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pIHtcclxuICAgICAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICAgICAgICB0aGlzLnVpID0gdWk7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIGxldCBwbGF5ZXJJZCA9IHBsYXllci5nZXRGaWd1cmUoKS5wYXJlbnRFbGVtZW50LmlkO1xyXG5cclxuICAgICAgICAvLyBBZGQgVUkgZWxlbWVudHMgdG8gcGxheWVyXHJcbiAgICAgICAgbmV3IERPTShgIyR7cGxheWVySWR9YCkuYXBwZW5kKHVpLmdldERvbUVsZW1lbnQoKSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlndXJlQ29udHJvbHModWkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbmZpZygpOiBVSUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29uZmlndXJlQ29udHJvbHMoY29tcG9uZW50OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPikge1xyXG4gICAgICAgIGNvbXBvbmVudC5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgY29tcG9uZW50LmNvbmZpZ3VyZSh0aGlzLnBsYXllciwgdGhpcyk7XHJcblxyXG4gICAgICAgIGlmIChjb21wb25lbnQgaW5zdGFuY2VvZiBDb250YWluZXIpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGRDb21wb25lbnQgb2YgY29tcG9uZW50LmdldENvbXBvbmVudHMoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVDb250cm9scyhjaGlsZENvbXBvbmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uTW91c2VFbnRlcigpOiBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vbk1vdXNlRW50ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uTW91c2VNb3ZlKCk6IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uTW91c2VNb3ZlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvbk1vdXNlTGVhdmUoKTogRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb21wb25lbnRDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25Nb3VzZUxlYXZlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvblNlZWsoKTogRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vblNlZWs7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2Vla1ByZXZpZXcoKTogRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vblNlZWtQcmV2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvblNlZWtlZCgpOiBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uU2Vla2VkO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5ID0gY2xhc3Mge1xyXG4gICAgICAgIHN0YXRpYyBidWlsZERlZmF1bHRVSShwbGF5ZXI6IFBsYXllciwgY29uZmlnOiBVSUNvbmZpZyA9IHt9KTogVUlNYW5hZ2VyIHtcclxuICAgICAgICAgICAgbGV0IHVpID0gVUlNYW5hZ2VyLkZhY3RvcnkuYXNzZW1ibGVEZWZhdWx0VUkoKTtcclxuICAgICAgICAgICAgbGV0IG1hbmFnZXIgPSBuZXcgVUlNYW5hZ2VyKHBsYXllciwgdWksIGNvbmZpZyk7XHJcbiAgICAgICAgICAgIHJldHVybiBtYW5hZ2VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYXNzZW1ibGVEZWZhdWx0VUkoKTogVUlDb250YWluZXIge1xyXG4gICAgICAgICAgICB2YXIgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oJ1ZpZGVvIFF1YWxpdHknLCBuZXcgVmlkZW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbSgnQXVkaW8gVHJhY2snLCBuZXcgQXVkaW9UcmFja1NlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oJ0F1ZGlvIFF1YWxpdHknLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbSgnU3VidGl0bGVzJywgbmV3IFN1YnRpdGxlU2VsZWN0Qm94KCkpXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRyb2xCYXIgPSBuZXcgQ29udHJvbEJhcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3NQYW5lbCxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2Vla0Jhcih7bGFiZWw6IG5ldyBTZWVrQmFyTGFiZWwoKX0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RpbWVMYWJlbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWUlRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVDb250cm9sQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzVG9nZ2xlQnV0dG9uKHtzZXR0aW5nc1BhbmVsOiBzZXR0aW5nc1BhbmVsfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbigpXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHVpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU3VidGl0bGVPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RTdGF0dXNPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBXYXRlcm1hcmsoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVjb21tZW5kYXRpb25PdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbEJhcixcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVGl0bGVCYXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3JNZXNzYWdlT3ZlcmxheSgpXHJcbiAgICAgICAgICAgICAgICBdLCBjc3NDbGFzc2VzOiBbJ3VpLXNraW4tZGVmYXVsdCddXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codWkpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHVpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgYXNzZW1ibGVUZXN0VUkoKTogVUlDb250YWluZXIge1xyXG4gICAgICAgICAgICB2YXIgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oJ1ZpZGVvIFF1YWxpdHknLCBuZXcgVmlkZW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbSgnQXVkaW8gVHJhY2snLCBuZXcgQXVkaW9UcmFja1NlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oJ0F1ZGlvIFF1YWxpdHknLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbSgnU3VidGl0bGVzJywgbmV3IFN1YnRpdGxlU2VsZWN0Qm94KCkpXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRyb2xCYXIgPSBuZXcgQ29udHJvbEJhcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbc2V0dGluZ3NQYW5lbCxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2Vla0Jhcih7bGFiZWw6IG5ldyBTZWVrQmFyTGFiZWwoKX0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RpbWVMYWJlbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWUlRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lU2xpZGVyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZUNvbnRyb2xCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbih7dmVydGljYWw6IGZhbHNlfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzVG9nZ2xlQnV0dG9uKHtzZXR0aW5nc1BhbmVsOiBzZXR0aW5nc1BhbmVsfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbigpXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHVpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU3VidGl0bGVPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RTdGF0dXNPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBXYXRlcm1hcmsoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVjb21tZW5kYXRpb25PdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbEJhcixcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVGl0bGVCYXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3JNZXNzYWdlT3ZlcmxheSgpXHJcbiAgICAgICAgICAgICAgICBdLCBjc3NDbGFzc2VzOiBbJ3VpLXNraW4tZGVmYXVsdCddXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgY29uc29sZS5sb2codWkpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHVpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmV4cG9ydCBtb2R1bGUgQXJyYXlVdGlscyB7XHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYW4gaXRlbSBmcm9tIGFuIGFycmF5LlxyXG4gICAgICogQHBhcmFtIGFycmF5IHRoZSBhcnJheSB0aGF0IG1heSBjb250YWluIHRoZSBpdGVtIHRvIHJlbW92ZVxyXG4gICAgICogQHBhcmFtIGl0ZW0gdGhlIGl0ZW0gdG8gcmVtb3ZlIGZyb20gdGhlIGFycmF5XHJcbiAgICAgKiBAcmV0dXJucyB7YW55fSB0aGUgcmVtb3ZlZCBpdGVtIG9yIG51bGwgaWYgaXQgd2Fzbid0IHBhcnQgb2YgdGhlIGFycmF5XHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiByZW1vdmU8VD4oYXJyYXk6IFRbXSwgaXRlbTogVCk6IFQgfCBudWxsIHtcclxuICAgICAgICBsZXQgaW5kZXggPSBhcnJheS5pbmRleE9mKGl0ZW0pO1xyXG5cclxuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyYXkuc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBtb2R1bGUgU3RyaW5nVXRpbHMge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRm9ybWF0cyBhIG51bWJlciBvZiBzZWNvbmRzIGludG8gYSB0aW1lIHN0cmluZyB3aXRoIHRoZSBwYXR0ZXJuIGhoOm1tOnNzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB0b3RhbFNlY29uZHMgdGhlIHRvdGFsIG51bWJlciBvZiBzZWNvbmRzIHRvIGZvcm1hdCB0byBzdHJpbmdcclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBmb3JtYXR0ZWQgdGltZSBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHNlY29uZHNUb1RpbWUodG90YWxTZWNvbmRzOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBpc05lZ2F0aXZlID0gdG90YWxTZWNvbmRzIDwgMDtcclxuXHJcbiAgICAgICAgaWYoaXNOZWdhdGl2ZSkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgdGltZSBpcyBuZWdhdGl2ZSwgd2UgbWFrZSBpdCBwb3NpdGl2ZSBmb3IgdGhlIGNhbGN1bGF0aW9uIGJlbG93XHJcbiAgICAgICAgICAgIC8vIChlbHNlIHdlJ2QgZ2V0IGFsbCBuZWdhdGl2ZSBudW1iZXJzKSBhbmQgcmVhdHRhY2ggdGhlIG5lZ2F0aXZlIHNpZ24gbGF0ZXIuXHJcbiAgICAgICAgICAgIHRvdGFsU2Vjb25kcyA9IC10b3RhbFNlY29uZHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTcGxpdCBpbnRvIHNlcGFyYXRlIHRpbWUgcGFydHNcclxuICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcyAvIDM2MDApO1xyXG4gICAgICAgIGxldCBtaW51dGVzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMgLyA2MCkgLSBob3VycyAqIDYwO1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMpICUgNjA7XHJcblxyXG4gICAgICAgIHJldHVybiAoaXNOZWdhdGl2ZSA/IFwiLVwiIDogXCJcIikgKyBsZWZ0UGFkV2l0aFplcm9zKGhvdXJzLCAyKSArIFwiOlwiICsgbGVmdFBhZFdpdGhaZXJvcyhtaW51dGVzLCAyKSArIFwiOlwiICsgbGVmdFBhZFdpdGhaZXJvcyhzZWNvbmRzLCAyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGEgbnVtYmVyIHRvIGEgc3RyaW5nIGFuZCBsZWZ0LXBhZHMgaXQgd2l0aCB6ZXJvcyB0byB0aGUgc3BlY2lmaWVkIGxlbmd0aC5cclxuICAgICAqIEV4YW1wbGU6IGxlZnRQYWRXaXRoWmVyb3MoMTIzLCA1KSA9PiBcIjAwMTIzXCJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbnVtYmVyIHRoZSBudW1iZXIgdG8gY29udmVydCB0byBzdHJpbmcgYW5kIHBhZCB3aXRoIHplcm9zXHJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIHRoZSBkZXNpcmVkIGxlbmd0aCBvZiB0aGUgcGFkZGVkIHN0cmluZ1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHBhZGRlZCBudW1iZXIgYXMgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGxlZnRQYWRXaXRoWmVyb3MobnVtYmVyOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgdGV4dCA9IG51bWJlciArIFwiXCI7XHJcbiAgICAgICAgbGV0IHBhZGRpbmcgPSBcIjAwMDAwMDAwMDBcIi5zdWJzdHIoMCwgbGVuZ3RoIC0gdGV4dC5sZW5ndGgpO1xyXG4gICAgICAgIHJldHVybiBwYWRkaW5nICsgdGV4dDtcclxuICAgIH1cclxufSJdfQ==

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
/**
 * A select box providing a selection between "auto" and the available audio qualities.
 */
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
/**
 * A select box providing a selection between available audio tracks (e.g. different languages).
 */
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
/**
 * A simple clickable button.
 */
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(config) {
        _super.call(this, config);
        this.buttonEvents = {
            onClick: new eventdispatcher_1.EventDispatcher()
        };
        this.config = this.mergeConfig(config, {
            cssClass: "ui-button"
        }, this.config);
    }
    Button.prototype.toDomElement = function () {
        var self = this;
        // Create the button element with the text label
        var buttonElement = new dom_1.DOM("button", {
            "type": "button",
            "id": this.config.id,
            "class": this.getCssClasses()
        }).append(new dom_1.DOM("span", {
            "class": "label"
        }).html(this.config.text));
        // Listen for the click event on the button element and trigger the corresponding event on the button component
        buttonElement.on("click", function () {
            self.onClickEvent();
        });
        return buttonElement;
    };
    Button.prototype.onClickEvent = function () {
        this.buttonEvents.onClick.dispatch(this);
    };
    Object.defineProperty(Button.prototype, "onClick", {
        /**
         * Gets the event that is fired when the button is clicked.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.buttonEvents.onClick.getEvent();
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
/**
 * Overlays the player and displays the status of a Cast session.
 */
var CastStatusOverlay = (function (_super) {
    __extends(CastStatusOverlay, _super);
    function CastStatusOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.statusLabel = new label_1.Label({ cssClass: "ui-cast-status-label" });
        this.config = this.mergeConfig(config, {
            cssClass: "ui-cast-status-overlay",
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
/**
 * A button that toggles casting to a Cast receiver.
 */
var CastToggleButton = (function (_super) {
    __extends(CastToggleButton, _super);
    function CastToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-casttogglebutton",
            text: "Google Cast"
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
            tag: "div",
            id: "ui-id-" + guid_1.Guid.next(),
            cssClass: "ui-component",
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
            "id": this.config.id,
            "class": this.getCssClasses()
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
        var flattenedString = flattenedArray.join(" ");
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
/**
 * A container component that can contain a collection of child components.
 * Components can be added at construction time through the {@link ContainerConfig#components} setting, or later
 * through the {@link Container#addComponent} method. The UIManager automatically takes care of all components, i.e. it
 * initializes and configures them automatically.
 *
 * In the DOM, the container consists of an outer <div> (that can be configured by the config) and an inner wrapper
 * <div> that contains the components. This double-<div>-structure is often required to achieve many advanced effects
 * in CSS and/or JS, e.g. animations and certain formatting with absolute positioning.
 *
 * DOM example:
 * <code>
 *     <div class="ui-container">
 *         <div class="container-wrapper">
 *             ... child components ...
 *         </div>
 *     </div>
 * </code>
 */
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-container",
            components: []
        }, this.config);
    }
    /**
     * Adds a child component to the container.
     * @param component the component to add
     */
    Container.prototype.addComponent = function (component) {
        this.config.components.push(component);
    };
    /**
     * Removes a child component from the container.
     * @param component the component to remove
     * @returns {boolean} true if the component has been removed, false if it is not contained in this container
     */
    Container.prototype.removeComponent = function (component) {
        return utils_1.ArrayUtils.remove(this.config.components, component) != null;
    };
    /**
     * Gets an array of all child components in this container.
     * @returns {Component<ComponentConfig>[]}
     */
    Container.prototype.getComponents = function () {
        return this.config.components;
    };
    /**
     * Updates the DOM of the container with the current components.
     */
    Container.prototype.updateComponents = function () {
        this.innerContainerElement.empty();
        for (var _i = 0, _a = this.config.components; _i < _a.length; _i++) {
            var component = _a[_i];
            this.innerContainerElement.append(component.getDomElement());
        }
    };
    Container.prototype.toDomElement = function () {
        // Create the container element (the outer <div>)
        var containerElement = new dom_1.DOM(this.config.tag, {
            "id": this.config.id,
            "class": this.getCssClasses()
        });
        // Create the inner container element (the inner <div>) that will contain the components
        var innerContainer = new dom_1.DOM(this.config.tag, {
            "class": "container-wrapper"
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
/**
 * A container for main player control components, e.g. play toggle button, seek bar, volume control, fullscreen toggle button.
 */
var ControlBar = (function (_super) {
    __extends(ControlBar, _super);
    function ControlBar(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-controlbar",
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
/**
 * Overlays the player and displays error messages.
 */
var ErrorMessageOverlay = (function (_super) {
    __extends(ErrorMessageOverlay, _super);
    function ErrorMessageOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.errorLabel = new label_1.Label({ cssClass: "ui-errormessage-label" });
        this.config = this.mergeConfig(config, {
            cssClass: "ui-errormessage-overlay",
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
/**
 * A button that toggles the player between windowed and fullscreen view.
 */
var FullscreenToggleButton = (function (_super) {
    __extends(FullscreenToggleButton, _super);
    function FullscreenToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-fullscreentogglebutton",
            text: "Fullscreen"
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
/**
 * A button that overlays the video and toggles between playback and pause.
 */
var HugePlaybackToggleButton = (function (_super) {
    __extends(HugePlaybackToggleButton, _super);
    function HugePlaybackToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-hugeplaybacktogglebutton",
            text: "Play/Pause"
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
            if (player.getVRStatus().contentType !== "none") {
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
            if (event.type === bitmovin.player.EVENT.ON_CAST_START) {
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
        buttonElement.append(new dom_1.DOM("div", {
            "class": "image"
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
/**
 * A simple text label.
 *
 * DOM example:
 * <code>
 *     <span class="ui-label">...some text...</span>
 * </code>
 */
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-label"
        }, this.config);
    }
    Label.prototype.toDomElement = function () {
        var labelElement = new dom_1.DOM("span", {
            "id": this.config.id,
            "class": this.getCssClasses()
        }).html(this.config.text);
        return labelElement;
    };
    /**
     * Set the text on this label.
     * @param text
     */
    Label.prototype.setText = function (text) {
        this.getDomElement().html(text);
    };
    /**
     * Clears the text on this label.
     */
    Label.prototype.clearText = function () {
        this.getDomElement().html("");
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
            cssClass: "ui-listselector"
        }, this.config);
        this.items = this.config.items;
    }
    /**
     * Checks if the specified item is part of this selector.
     * @param key the key of the item to check
     * @returns {boolean} true if the item is part of this selector, else false
     */
    ListSelector.prototype.hasItem = function (key) {
        return this.items[key] != null;
    };
    /**
     * Adds an item to this selector by appending it to the end of the list of items.
     * @param key the key  of the item to add
     * @param label the (human-readable) label of the item to add
     */
    ListSelector.prototype.addItem = function (key, label) {
        this.items[key] = label;
        this.onItemAddedEvent(key);
    };
    /**
     * Removes an item from this selector.
     * @param key the key of the item to remove
     * @returns {boolean} true if removal was successful, false if the item is not part of this selector
     */
    ListSelector.prototype.removeItem = function (key) {
        if (this.hasItem(key)) {
            delete this.items[key];
            this.onItemRemovedEvent(key);
            return true;
        }
        return false;
    };
    /**
     * Selects an item from the items in this selector.
     * @param key the key of the item to select
     * @returns {boolean} true is the selection was successful, false if the selected item is not part of the selector
     */
    ListSelector.prototype.selectItem = function (key) {
        if (key === this.selectedItem) {
            // itemConfig is already selected, suppress any further action
            return true;
        }
        if (this.items[key] != null) {
            this.selectedItem = key;
            this.onItemSelectedEvent(key);
            return true;
        }
        return false;
    };
    /**
     * Returns the key of the selected item.
     * @returns {string} the key of the selected item or null if no item is selected
     */
    ListSelector.prototype.getSelectedItem = function () {
        return this.selectedItem;
    };
    /**
     * Removes all items from this selector.
     */
    ListSelector.prototype.clearItems = function () {
        var items = this.items; // local copy for iteration after clear
        this.items = {}; // clear items
        // fire events
        for (var key in items) {
            this.onItemRemovedEvent(key);
        }
    };
    /**
     * Returns the number of items in this selector.
     * @returns {number}
     */
    ListSelector.prototype.itemCount = function () {
        return Object.keys(this.items).length;
    };
    ListSelector.prototype.onItemAddedEvent = function (key) {
        this.listSelectorEvents.onItemAdded.dispatch(this, key);
    };
    ListSelector.prototype.onItemRemovedEvent = function (key) {
        this.listSelectorEvents.onItemRemoved.dispatch(this, key);
    };
    ListSelector.prototype.onItemSelectedEvent = function (key) {
        this.listSelectorEvents.onItemSelected.dispatch(this, key);
    };
    Object.defineProperty(ListSelector.prototype, "onItemAdded", {
        /**
         * Gets the event that is fired when an item is added to the list of items.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.listSelectorEvents.onItemAdded.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListSelector.prototype, "onItemRemoved", {
        /**
         * Gets the event that is fired when an item is removed from the list of items.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.listSelectorEvents.onItemRemoved.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListSelector.prototype, "onItemSelected", {
        /**
         * Gets the event that is fired when an item is selected from the list of items.
         * @returns {Event<Sender, Args>}
         */
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
            if (player.getDuration() === Infinity) {
                self.setText("Live");
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
    /**
     * Sets the current playback time and total duration.
     * @param playbackSeconds the current playback time in seconds
     * @param durationSeconds the total duration in seconds
     */
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
/**
 * A button that toggles between playback and pause.
 */
var PlaybackToggleButton = (function (_super) {
    __extends(PlaybackToggleButton, _super);
    function PlaybackToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-playbacktogglebutton",
            text: "Play/Pause"
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
                (event.type === bitmovin.player.EVENT.ON_PLAY || event.type === bitmovin.player.EVENT.ON_PLAY
                    || event.type === bitmovin.player.EVENT.ON_CAST_PLAYING || event.type === bitmovin.player.EVENT.ON_CAST_PAUSE)) {
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
/**
 * Overlays the player and displays recommended videos.
 */
var RecommendationOverlay = (function (_super) {
    __extends(RecommendationOverlay, _super);
    function RecommendationOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-recommendation-overlay",
            hidden: true
        }, this.config);
    }
    RecommendationOverlay.prototype.configure = function (player, uimanager) {
        var self = this;
        if (!uimanager.getConfig() || !uimanager.getConfig().recommendations || uimanager.getConfig().recommendations.length === 0) {
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
/**
 * An item of the {@link RecommendationOverlay}. Used only internally in {@link RecommendationOverlay}.
 */
var RecommendationItem = (function (_super) {
    __extends(RecommendationItem, _super);
    function RecommendationItem(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-recommendation-item",
            itemConfig: null // this must be passed in from outside
        }, this.config);
    }
    RecommendationItem.prototype.toDomElement = function () {
        var config = this.config.itemConfig; // TODO fix generics and get rid of cast
        var itemElement = new dom_1.DOM("a", {
            "id": this.config.id,
            "class": this.getCssClasses(),
            "href": config.url
        });
        var bgElement = new dom_1.DOM("div", {
            "class": "thumbnail"
        }).css({ "background-image": "url(" + config.thumbnail + ")" });
        itemElement.append(bgElement);
        var titleElement = new dom_1.DOM("span", {
            "class": "title"
        }).html(config.title);
        itemElement.append(titleElement);
        var timeElement = new dom_1.DOM("span", {
            "class": "duration"
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
 * A seek bar to seek within the player's media. It displays the purrent playback position, amount of buffed data, seek
 * target, and keeps status about an ongoing seek.
 *
 * The seek bar displays different "bars":
 *  - the playback position, i.e. the position in the media at which the player current playback pointer is positioned
 *  - the buffer position, which usually is the playback position plus the time span that is already buffered ahead
 *  - the seek position, used to preview to where in the timeline a seek will jump to
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
            cssClass: "ui-seekbar"
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
                if (player.getMaxTimeShift() === 0) {
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
            this.config.cssClasses.push("vertical");
        }
        var seekBarContainer = new dom_1.DOM("div", {
            "id": this.config.id,
            "class": this.getCssClasses()
        });
        var seekBar = new dom_1.DOM("div", {
            "class": "seekbar"
        });
        this.seekBar = seekBar;
        // Indicator that shows the buffer fill level
        var seekBarBufferLevel = new dom_1.DOM("div", {
            "class": "seekbar-bufferlevel"
        });
        this.seekBarBufferPosition = seekBarBufferLevel;
        // Indicator that shows the current playback position
        var seekBarPlaybackPosition = new dom_1.DOM("div", {
            "class": "seekbar-playbackposition"
        });
        this.seekBarPlaybackPosition = seekBarPlaybackPosition;
        // Indicator that show where a seek will go to
        var seekBarSeekPosition = new dom_1.DOM("div", {
            "class": "seekbar-seekposition"
        });
        this.seekBarSeekPosition = seekBarSeekPosition;
        // Indicator that shows the full seekbar
        var seekBarBackdrop = new dom_1.DOM("div", {
            "class": "seekbar-backdrop"
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
            new dom_1.DOM(document).off("mousemove", mouseMoveHandler);
            new dom_1.DOM(document).off("mouseup", mouseUpHandler);
            var targetPercentage = 100 * self.getMouseOffset(e);
            self.setSeeking(false);
            // Fire seeked event
            self.onSeekedEvent(targetPercentage);
        };
        // A seek always start with a mousedown directly on the seekbar. To track a seek also outside the seekbar
        // (so the user does not need to take care that the mouse always stays on the seekbar), we attach the mousemove
        // and mouseup handlers to the whole document. A seek is triggered when the user lifts the mouse key.
        // A seek mouse gesture is thus basically a click with a long time frame between down and up events.
        seekBar.on("mousedown", function (e) {
            // Prevent selection of DOM elements
            e.preventDefault();
            self.setSeeking(true);
            // Fire seeked event
            self.onSeekEvent();
            // Add handler to track the seek operation over the whole document
            new dom_1.DOM(document).on("mousemove", mouseMoveHandler);
            new dom_1.DOM(document).on("mouseup", mouseUpHandler);
        });
        // Display seek target indicator when mouse hovers over seekbar
        seekBar.on("mousemove", function (e) {
            var position = 100 * self.getMouseOffset(e);
            self.setSeekPosition(position);
            self.onSeekPreviewEvent(position, false);
            if (self.hasLabel() && self.getLabel().isHidden()) {
                self.getLabel().show();
            }
        });
        // Hide seek target indicator when mouse leaves seekbar
        seekBar.on("mouseleave", function (e) {
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
    /**
     * Gets the horizontal mouse offset from the left edge of the seek bar.
     * @param e the event to calculate the offset from
     * @returns {number} a number in the range of [0, 1], where 0 is the left edge and 1 is the right edge
     */
    SeekBar.prototype.getHorizontalMouseOffset = function (e) {
        var elementOffsetPx = this.seekBar.offset().left;
        var widthPx = this.seekBar.width();
        var offsetPx = e.pageX - elementOffsetPx;
        var offset = 1 / widthPx * offsetPx;
        return this.sanitizeOffset(offset);
    };
    /**
     * Gets the vertical mouse offset from the bottom edge of the seek bar.
     * @param e the event to calculate the offset from
     * @returns {number} a number in the range of [0, 1], where 0 is the bottom edge and 1 is the top edge
     */
    SeekBar.prototype.getVerticalMouseOffset = function (e) {
        var elementOffsetPx = this.seekBar.offset().top;
        var widthPx = this.seekBar.height();
        var offsetPx = e.pageY - elementOffsetPx;
        var offset = 1 / widthPx * offsetPx;
        return 1 - this.sanitizeOffset(offset);
    };
    /**
     * Gets the mouse offset for the current configuration (horizontal or vertical).
     * @param e the event to calculate the offset from
     * @returns {number} a number in the range of [0, 1]
     * @see #getHorizontalMouseOffset
     * @see #getVerticalMouseOffset
     */
    SeekBar.prototype.getMouseOffset = function (e) {
        if (this.config.vertical) {
            return this.getVerticalMouseOffset(e);
        }
        else {
            return this.getHorizontalMouseOffset(e);
        }
    };
    /**
     * Sanitizes the mouse offset to the range of [0, 1].
     *
     * When tracking the mouse outside the seek bar, the offset can be outside the desired range and this method
     * limits it to the desired range. E.g. a mouse event left of the left edge of a seek bar yields an offset below
     * zero, but to display the seek target on the seek bar, we need to limit it to zero.
     *
     * @param offset the offset to sanitize
     * @returns {number} the sanitized offset.
     */
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
    /**
     * Sets the position of the playback position indicator.
     * @param percent a number between 0 and 100 as returned by the player
     */
    SeekBar.prototype.setPlaybackPosition = function (percent) {
        this.setPosition(this.seekBarPlaybackPosition, percent);
    };
    /**
     * Sets the position until which media is buffered.
     * @param percent a number between 0 and 100
     */
    SeekBar.prototype.setBufferPosition = function (percent) {
        this.setPosition(this.seekBarBufferPosition, percent);
    };
    /**
     * Sets the position where a seek, if executed, would jump to.
     * @param percent a number between 0 and 100
     */
    SeekBar.prototype.setSeekPosition = function (percent) {
        this.setPosition(this.seekBarSeekPosition, percent);
    };
    /**
     * Set the actual position (width or height) of a DOM element that represent a bar in the seek bar.
     * @param element the element to set the position for
     * @param percent a number between 0 and 100
     */
    SeekBar.prototype.setPosition = function (element, percent) {
        var style = this.config.vertical ? { "height": percent + "%" } : { "width": percent + "%" };
        element.css(style);
    };
    /**
     * Puts the seek bar into or out of seeking state by adding/removing a class to the DOM element. This can be used
     * to adjust the styling while seeking.
     *
     * @param seeking should be true when entering seek state, false when exiting the seek state
     */
    SeekBar.prototype.setSeeking = function (seeking) {
        if (seeking) {
            this.getDomElement().addClass(SeekBar.CLASS_SEEKING);
        }
        else {
            this.getDomElement().removeClass(SeekBar.CLASS_SEEKING);
        }
    };
    /**
     * Checks if the seek bar is currently in the seek state.
     * @returns {boolean} true if in seek state, else false
     */
    SeekBar.prototype.isSeeking = function () {
        return this.getDomElement().hasClass(SeekBar.CLASS_SEEKING);
    };
    /**
     * Checks if the seek bar has a {@link SeekBarLabel}.
     * @returns {boolean} true if the seek bar has a label, else false
     */
    SeekBar.prototype.hasLabel = function () {
        return this.label != null;
    };
    /**
     * Gets the label of this seek bar.
     * @returns {SeekBarLabel} the label if this seek bar has a label, else null
     */
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
        /**
         * Gets the event that is fired when a scrubbing seek operation is started.
         * @returns {Event<SeekBar, NoArgs>}
         */
        get: function () {
            return this.seekBarEvents.onSeek.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeekBar.prototype, "onSeekPreview", {
        /**
         * Gets the event that is fired during a scrubbing seek (to indicate that the seek preview, i.e. the video frame,
         * should be updated), or during a normal seek preview when the seek bar is hovered (and the seek target,
         * i.e. the seek bar label, should be updated).
         * @returns {Event<SeekBar, SeekPreviewEventArgs>}
         */
        get: function () {
            return this.seekBarEvents.onSeekPreview.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SeekBar.prototype, "onSeeked", {
        /**
         * Gets the event that is fired when a scrubbing seek has finished or when a direct seek is issued.
         * @returns {Event<SeekBar, number>}
         */
        get: function () {
            return this.seekBarEvents.onSeeked.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * The CSS class that is added to the DOM element while the seek bar is in "seeking" state.
     */
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
/**
 * A label for a {@link SeekBar} that can display the seek target time and a thumbnail.
 */
var SeekBarLabel = (function (_super) {
    __extends(SeekBarLabel, _super);
    function SeekBarLabel(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.label = new label_1.Label({ cssClasses: ["seekbar-label"] });
        this.thumbnail = new component_1.Component({ cssClasses: ["seekbar-thumbnail"] });
        this.config = this.mergeConfig(config, {
            cssClass: "ui-seekbar-label",
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
    /**
     * Sets arbitrary text on the label.
     * @param text the text to show on the label
     */
    SeekBarLabel.prototype.setText = function (text) {
        this.label.setText(text);
    };
    /**
     * Sets a time to be displayed on the label.
     * @param seconds the time in seconds to display on the label
     */
    SeekBarLabel.prototype.setTime = function (seconds) {
        this.setText(utils_1.StringUtils.secondsToTime(seconds));
    };
    /**
     * Sets or removes a thumbnail on the label.
     * @param thumbnail the thumbnail to display on the label or null to remove a displayed thumbnail
     */
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
/**
 * A simple select box providing the possibility to select a single item out of a list of available items.
 *
 * DOM example:
 * <code>
 *     <select class="ui-selectbox">
 *         <option value="key">label</option>
 *         ...
 *     </select>
 * </code>
 */
var SelectBox = (function (_super) {
    __extends(SelectBox, _super);
    function SelectBox(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-selectbox"
        }, this.config);
    }
    SelectBox.prototype.toDomElement = function () {
        var selectElement = new dom_1.DOM("select", {
            "id": this.config.id,
            "class": this.getCssClasses()
        });
        this.selectElement = selectElement;
        this.updateDomItems();
        var self = this;
        selectElement.on("change", function () {
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
            var optionElement = new dom_1.DOM("option", {
                "value": value
            }).html(label);
            if (value === selectedValue + "") {
                optionElement.attr("selected", "selected");
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
/**
 * A panel containing a list of {@link SettingsPanelItem items} that represent labelled settings.
 */
var SettingsPanel = (function (_super) {
    __extends(SettingsPanel, _super);
    function SettingsPanel(config) {
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-settings-panel",
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
            self.getDomElement().on("mousemove", function () {
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
/**
 * An item for a {@link SettingsPanel}, containing a {@link Label} and a component that configures a setting.
 * Supported setting components: {@link SelectBox}
 */
var SettingsPanelItem = (function (_super) {
    __extends(SettingsPanelItem, _super);
    function SettingsPanelItem(label, selectBox, config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.label = new label_1.Label({ text: label });
        this.setting = selectBox;
        this.config = this.mergeConfig(config, {
            cssClass: "ui-settings-panel-entry",
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
/**
 * A button that toggles visibility of a settings panel.
 */
var SettingsToggleButton = (function (_super) {
    __extends(SettingsToggleButton, _super);
    function SettingsToggleButton(config) {
        _super.call(this, config);
        if (!config.settingsPanel) {
            throw new Error("Required SettingsPanel is missing");
        }
        this.config = this.mergeConfig(config, {
            cssClass: "ui-settingstogglebutton",
            text: "Settings",
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
/**
 * Overlays the player to display subtitles.
 */
var SubtitleOverlay = (function (_super) {
    __extends(SubtitleOverlay, _super);
    function SubtitleOverlay(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.subtitleLabel = new label_1.Label({ cssClass: "ui-subtitle-label" });
        this.config = this.mergeConfig(config, {
            cssClass: "ui-subtitle-overlay",
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
/**
 * A select box providing a selection between available subtitle and caption tracks.
 */
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
            player.setSubtitle(value === "null" ? null : value);
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
/**
 * Displays a title bar containing a label with the title of the video.
 */
var TitleBar = (function (_super) {
    __extends(TitleBar, _super);
    function TitleBar(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.label = new label_1.Label({ cssClass: "ui-titlebar-label" });
        this.config = this.mergeConfig(config, {
            cssClass: "ui-titlebar",
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
/**
 * A button that can be toggled between "on" and "off" states.
 */
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
            cssClass: "ui-togglebutton"
        }, this.config);
    }
    /**
     * Toggles the button to the "on" state.
     */
    ToggleButton.prototype.on = function () {
        if (this.isOff()) {
            this.onState = true;
            this.getDomElement().removeClass(ToggleButton.CLASS_OFF);
            this.getDomElement().addClass(ToggleButton.CLASS_ON);
            this.onToggleEvent();
            this.onToggleOnEvent();
        }
    };
    /**
     * Toggles the button to the "off" state.
     */
    ToggleButton.prototype.off = function () {
        if (this.isOn()) {
            this.onState = false;
            this.getDomElement().removeClass(ToggleButton.CLASS_ON);
            this.getDomElement().addClass(ToggleButton.CLASS_OFF);
            this.onToggleEvent();
            this.onToggleOffEvent();
        }
    };
    /**
     * Toggle the button "on" if it is "off", or "off" if it is "on".
     */
    ToggleButton.prototype.toggle = function () {
        if (this.isOn()) {
            this.off();
        }
        else {
            this.on();
        }
    };
    /**
     * Checks if the toggle button is in the "on" state.
     * @returns {boolean} true if button is "on", false if "off"
     */
    ToggleButton.prototype.isOn = function () {
        return this.onState;
    };
    /**
     * Checks if the toggle button is in the "off" state.
     * @returns {boolean} true if button is "off", false if "on"
     */
    ToggleButton.prototype.isOff = function () {
        return !this.isOn();
    };
    ToggleButton.prototype.onClickEvent = function () {
        _super.prototype.onClickEvent.call(this);
        // Fire the toggle event together with the click event
        // (they are technically the same, only the semantics are different)
        this.onToggleEvent();
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
        /**
         * Gets the event that is fired when the button is toggled.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.toggleButtonEvents.onToggle.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToggleButton.prototype, "onToggleOn", {
        /**
         * Gets the event that is fired when the button is toggled "on".
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.toggleButtonEvents.onToggleOn.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ToggleButton.prototype, "onToggleOff", {
        /**
         * Gets the event that is fired when the button is toggled "off".
         * @returns {Event<Sender, Args>}
         */
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
/**
 * The base container that contains all of the UI. The UIContainer is passed to the {@link UIManager} to build and setup the UI.
 */
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
            cssClass: "ui-uicontainer"
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
        container.on("mouseenter", function () {
            self.onMouseEnterEvent();
        });
        container.on("mousemove", function () {
            self.onMouseMoveEvent();
        });
        container.on("mouseleave", function () {
            self.onMouseLeaveEvent();
        });
        // Detect flexbox support (not supported in IE9)
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
        /**
         * Gets the event that is fired when the mouse enters the UI.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.uiContainerEvents.onMouseEnter.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIContainer.prototype, "onMouseMove", {
        /**
         * Gets the event that is fired when the mouse moves within UI.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.uiContainerEvents.onMouseMove.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIContainer.prototype, "onMouseLeave", {
        /**
         * Gets the event that is fired when the mouse leaves the UI.
         * @returns {Event<Sender, Args>}
         */
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
/**
 * A select box providing a selection between "auto" and the available video qualities.
 */
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
/**
 * A composite volume control that consists of and internally manages a volume control button that can be used
 * for muting, and a (depending on the CSS style, e.g. slide-out) volume control bar.
 */
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
            cssClass: "ui-volumecontrolbutton",
            components: [this.volumeToggleButton, this.volumeSlider],
            hideDelay: 500
        }, this.config);
    }
    VolumeControlButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var volumeToggleButton = this.getVolumeToggleButton();
        var volumeSlider = this.getVolumeSlider();
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
        volumeToggleButton.getDomElement().on("mouseenter", function () {
            // Show volume slider when mouse enters the button area
            if (volumeSlider.isHidden()) {
                volumeSlider.show();
            }
            // Avoid hiding of the slider when button is hovered
            timeout.clear();
        });
        volumeToggleButton.getDomElement().on("mouseleave", function () {
            // Hide slider delayed when button is left
            timeout.reset();
        });
        volumeSlider.getDomElement().on("mouseenter", function () {
            // When the slider is entered, cancel the hide timeout activated by leaving the button
            timeout.clear();
            volumeSliderHovered = true;
        });
        volumeSlider.getDomElement().on("mouseleave", function () {
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
    /**
     * Provides access to the internally managed volume toggle button.
     * @returns {VolumeToggleButton}
     */
    VolumeControlButton.prototype.getVolumeToggleButton = function () {
        return this.volumeToggleButton;
    };
    /**
     * Provides access to the internally managed volume silder.
     * @returns {VolumeSlider}
     */
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
/**
 * A simple volume slider component to adjust the player's volume setting.
 */
var VolumeSlider = (function (_super) {
    __extends(VolumeSlider, _super);
    function VolumeSlider(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-volumeslider"
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
/**
 * A button that toggles audio muting.
 */
var VolumeToggleButton = (function (_super) {
    __extends(VolumeToggleButton, _super);
    function VolumeToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-volumetogglebutton",
            text: "Volume/Mute"
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
/**
 * A button that toggles the video view between normal/mono and VR/stereo.
 */
var VRToggleButton = (function (_super) {
    __extends(VRToggleButton, _super);
    function VRToggleButton(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-vrtogglebutton",
            text: "VR"
        }, this.config);
    }
    VRToggleButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var isVRConfigured = function () {
            // VR availability cannot be checked through getVRStatus() because it is asynchronously populated and not
            // available at UI initialization. As an alternative, we check the VR settings in the config.
            // TODO use getVRStatus() through isVRStereoAvailable() once the player has been rewritten and the status is available in ON_READY
            var config = player.getConfig();
            return config.source && config.source.vr && config.source.vr.contentType !== "none";
        };
        var isVRStereoAvailable = function () {
            return player.getVRStatus().contentType !== "none";
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
                    console.log("No VR content");
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
/**
 * A watermark overlay with a clickable logo.
 */
var Watermark = (function (_super) {
    __extends(Watermark, _super);
    function Watermark(config) {
        if (config === void 0) { config = {}; }
        _super.call(this, config);
        this.config = this.mergeConfig(config, {
            cssClass: "ui-watermark",
            url: "http://bitmovin.com"
        }, this.config);
    }
    Watermark.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        if (this.getUrl()) {
            var element_1 = this.getDomElement();
            element_1.data("url", this.getUrl());
            element_1.on("click", function () {
                window.open(element_1.data("url"), "_blank");
            });
        }
    };
    /**
     * Gets the URL that should be followed when the watermark is clicked.
     * @returns {string} the watermark URL
     */
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
            var element = document.createElement(tagName);
            for (var attributeName in attributes) {
                var attributeValue = attributes[attributeName];
                element.setAttribute(attributeName, attributeValue);
            }
            this.elements = [element];
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
        if (content === undefined || content == null) {
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
            element.innerHTML = "";
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
        var scrollTop = typeof window.pageYOffset !== "undefined" ?
            window.pageYOffset : document.documentElement.scrollTop ?
            document.documentElement.scrollTop : document.body.scrollTop ?
            document.body.scrollTop : 0;
        // Workaround for document.body.scrollLeft always 0 in IE9, IE11, Firefox
        var scrollLeft = typeof window.pageXOffset !== "undefined" ?
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
                element.className += " " + className;
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
                element.className = element.className.replace(new RegExp("(^|\\b)" + className.split(" ").join("|") + "(\\b|$)", "gi"), " ");
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
                if (new RegExp("(^| )" + className + "( |$)", "gi").test(element.className)) {
                    return true;
                }
            }
        });
        return false;
    };
    DOM.prototype.css = function (propertyNameOrCollection, value) {
        if (typeof propertyNameOrCollection === "string") {
            var propertyName = propertyNameOrCollection;
            if (arguments.length === 2) {
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
            if (subscribedListener.listener === listener) {
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
if (typeof Object.assign !== "function") {
    Object.assign = function (target) {
        "use strict";
        if (target == null) {
            throw new TypeError("Cannot convert undefined or null to object");
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
    window["bitmovin"]["playerui"] = {};
    var uiscope = window["bitmovin"]["playerui"];
    if (window) {
        exportables.forEach(function (exp) { return uiscope[nameof(exp)] = exp; });
    }
    function nameof(fn) {
        return typeof fn === "undefined" ? "" : fn.name ? fn.name : (function () {
            var result = /^function\s+([\w\$]+)\s*\(/.exec(fn.toString());
            return !result ? "" : result[1];
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
            return UIManager.Factory.buildLegacyUI(player, config);
        };
        class_1.buildModernUI = function (player, config) {
            if (config === void 0) { config = {}; }
            var settingsPanel = new settingspanel_1.SettingsPanel({
                components: [
                    new settingspanel_1.SettingsPanelItem("Video Quality", new videoqualityselectbox_1.VideoQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem("Audio Track", new audiotrackselectbox_1.AudioTrackSelectBox()),
                    new settingspanel_1.SettingsPanelItem("Audio Quality", new audioqualityselectbox_1.AudioQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem("Subtitles", new subtitleselectbox_1.SubtitleSelectBox())
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
                ], cssClasses: ["ui-skin-modern"]
            });
            return new UIManager(player, ui, config);
        };
        class_1.buildLegacyUI = function (player, config) {
            if (config === void 0) { config = {}; }
            var settingsPanel = new settingspanel_1.SettingsPanel({
                components: [
                    new settingspanel_1.SettingsPanelItem("Video Quality", new videoqualityselectbox_1.VideoQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem("Audio Track", new audiotrackselectbox_1.AudioTrackSelectBox()),
                    new settingspanel_1.SettingsPanelItem("Audio Quality", new audioqualityselectbox_1.AudioQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem("Subtitles", new subtitleselectbox_1.SubtitleSelectBox())
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
                ], cssClasses: ["ui-skin-legacy"]
            });
            return new UIManager(player, ui, config);
        };
        class_1.buildLegacyCastReceiverUI = function (player, config) {
            if (config === void 0) { config = {}; }
            var controlBar = new controlbar_1.ControlBar({
                components: [
                    new seekbar_1.SeekBar(),
                    new playbacktimelabel_1.PlaybackTimeLabel(),
                ]
            });
            var ui = new uicontainer_1.UIContainer({
                components: [
                    new subtitleoverlay_1.SubtitleOverlay(),
                    new hugeplaybacktogglebutton_1.HugePlaybackToggleButton(),
                    new watermark_1.Watermark(),
                    controlBar,
                    new titlebar_1.TitleBar(),
                    new errormessageoverlay_1.ErrorMessageOverlay()
                ], cssClasses: ["ui-skin-legacy ui-skin-legacy-cast-receiver"]
            });
            return new UIManager(player, ui, config);
        };
        class_1.buildLegacyTestUI = function (player, config) {
            if (config === void 0) { config = {}; }
            var settingsPanel = new settingspanel_1.SettingsPanel({
                components: [
                    new settingspanel_1.SettingsPanelItem("Video Quality", new videoqualityselectbox_1.VideoQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem("Audio Track", new audiotrackselectbox_1.AudioTrackSelectBox()),
                    new settingspanel_1.SettingsPanelItem("Audio Quality", new audioqualityselectbox_1.AudioQualitySelectBox()),
                    new settingspanel_1.SettingsPanelItem("Subtitles", new subtitleselectbox_1.SubtitleSelectBox())
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
                ], cssClasses: ["ui-skin-legacy"]
            });
            return new UIManager(player, ui, config);
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
     * @param num the number to convert to string and pad with zeros
     * @param length the desired length of the padded string
     * @returns {string} the padded number as string
     */
    function leftPadWithZeros(num, length) {
        var text = num + "";
        var padding = "0000000000".substr(0, length - text.length);
        return padding + text;
    }
})(StringUtils = exports.StringUtils || (exports.StringUtils = {}));
},{}]},{},[36])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvY29tcG9uZW50cy9hdWRpb3F1YWxpdHlzZWxlY3Rib3gudHMiLCJzcmMvdHMvY29tcG9uZW50cy9hdWRpb3RyYWNrc2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY2FzdHN0YXR1c292ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9jYXN0dG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY29tcG9uZW50LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY29udGFpbmVyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY29udHJvbGJhci50cyIsInNyYy90cy9jb21wb25lbnRzL2Vycm9ybWVzc2FnZW92ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9mdWxsc2NyZWVudG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvaHVnZXBsYXliYWNrdG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvbGFiZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9saXN0c2VsZWN0b3IudHMiLCJzcmMvdHMvY29tcG9uZW50cy9wbGF5YmFja3RpbWVsYWJlbC50cyIsInNyYy90cy9jb21wb25lbnRzL3BsYXliYWNrdG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvcmVjb21tZW5kYXRpb25vdmVybGF5LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc2Vla2Jhci50cyIsInNyYy90cy9jb21wb25lbnRzL3NlZWtiYXJsYWJlbC50cyIsInNyYy90cy9jb21wb25lbnRzL3NlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3NldHRpbmdzcGFuZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZXR0aW5nc3RvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3N1YnRpdGxlb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL3N1YnRpdGxlc2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdGl0bGViYXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy90b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy91aWNvbnRhaW5lci50cyIsInNyYy90cy9jb21wb25lbnRzL3ZpZGVvcXVhbGl0eXNlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3ZvbHVtZWNvbnRyb2xidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy92b2x1bWVzbGlkZXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy92b2x1bWV0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy92cnRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3dhdGVybWFyay50cyIsInNyYy90cy9kb20udHMiLCJzcmMvdHMvZXZlbnRkaXNwYXRjaGVyLnRzIiwic3JjL3RzL2d1aWQudHMiLCJzcmMvdHMvbWFpbi50cyIsInNyYy90cy90aW1lb3V0LnRzIiwic3JjL3RzL3VpbWFuYWdlci50cyIsInNyYy90cy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7O0dBT0c7Ozs7Ozs7QUFFSCwwQkFBd0IsYUFBYSxDQUFDLENBQUE7QUFJdEM7O0dBRUc7QUFDSDtJQUEyQyx5Q0FBUztJQUVoRCwrQkFBWSxNQUErQjtRQUEvQixzQkFBK0IsR0FBL0IsV0FBK0I7UUFDdkMsa0JBQU0sTUFBTSxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQUVELHlDQUFTLEdBQVQsVUFBVSxNQUE4QixFQUFFLFNBQW9CO1FBQzFELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUVoQixJQUFJLG9CQUFvQixHQUFHO1lBQ3ZCLElBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBRXpELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUVsQiw4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ekUsNkVBQTZFO1lBQzdFLFlBQVksR0FBRyxDQUFDLFlBQVksQ0FBQztRQUNqQyxDQUFDO1FBRUQsaUNBQWlDO1FBQ2pDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzVDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDekQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFNUMsTUFBTSxDQUFDLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFJLENBQUM7SUFmZSx5QkFBYSxnQkFlNUIsQ0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSCwwQkFBMEIsR0FBVyxFQUFFLE1BQWM7UUFDakQsSUFBSSxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7QUFDTCxDQUFDLEVBdENnQixXQUFXLEdBQVgsbUJBQVcsS0FBWCxtQkFBVyxRQXNDM0IiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gXCJhdXRvXCIgYW5kIHRoZSBhdmFpbGFibGUgYXVkaW8gcXVhbGl0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEF1ZGlvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVBdWRpb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF1ZGlvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZUF1ZGlvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGF1ZGlvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdWRpb1F1YWxpdHkgb2YgYXVkaW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbShhdWRpb1F1YWxpdHkuaWQsIGF1ZGlvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBBdWRpb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldEF1ZGlvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgdXBkYXRlQXVkaW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gYXVkaW8gdHJhY2sgaGFzIGNoYW5nZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZUF1ZGlvUXVhbGl0aWVzKTsgLy8gVXBkYXRlIHF1YWxpdGllcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlQXVkaW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0RPV05MT0FEX1FVQUxJVFlfQ0hBTkdFLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gcGxheWVyLmdldERvd25sb2FkZWRBdWRpb0RhdGEoKTtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RJdGVtKGRhdGEuaXNBdXRvID8gXCJhdXRvXCIgOiBkYXRhLmlkKTtcclxuICAgICAgICB9KTsgLy8gVXBkYXRlIHF1YWxpdHkgc2VsZWN0aW9uIHdoZW4gcXVhbGl0eSBpcyBjaGFuZ2VkIChmcm9tIG91dHNpZGUpXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHF1YWxpdGllcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlQXVkaW9RdWFsaXRpZXMoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzZWxlY3QgYm94IHByb3ZpZGluZyBhIHNlbGVjdGlvbiBiZXR3ZWVuIGF2YWlsYWJsZSBhdWRpbyB0cmFja3MgKGUuZy4gZGlmZmVyZW50IGxhbmd1YWdlcykuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQXVkaW9UcmFja1NlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVBdWRpb1RyYWNrcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF1ZGlvVHJhY2tzID0gcGxheWVyLmdldEF2YWlsYWJsZUF1ZGlvKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBhdWRpbyB0cmFja3NcclxuICAgICAgICAgICAgZm9yIChsZXQgYXVkaW9UcmFjayBvZiBhdWRpb1RyYWNrcykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRJdGVtKGF1ZGlvVHJhY2suaWQsIGF1ZGlvVHJhY2subGFiZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogQXVkaW9UcmFja1NlbGVjdEJveCwgdmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0QXVkaW8odmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgYXVkaW9UcmFja0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50QXVkaW9UcmFjayA9IHBsYXllci5nZXRBdWRpbygpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oY3VycmVudEF1ZGlvVHJhY2suaWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgYXVkaW9UcmFja0hhbmRsZXIpOyAvLyBVcGRhdGUgc2VsZWN0aW9uIHdoZW4gc2VsZWN0ZWQgdHJhY2sgaGFzIGNoYW5nZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZUF1ZGlvVHJhY2tzKTsgLy8gVXBkYXRlIHRyYWNrcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlQXVkaW9UcmFja3MpOyAvLyBVcGRhdGUgdHJhY2tzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG5cclxuICAgICAgICAvLyBQb3B1bGF0ZSB0cmFja3MgYXQgc3RhcnR1cFxyXG4gICAgICAgIHVwZGF0ZUF1ZGlvVHJhY2tzKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgTm9BcmdzLCBFdmVudH0gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBCdXR0b259IGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRleHQgb24gdGhlIGJ1dHRvbi5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc2ltcGxlIGNsaWNrYWJsZSBidXR0b24uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQnV0dG9uPENvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8QnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBidXR0b25FdmVudHMgPSB7XHJcbiAgICAgICAgb25DbGljazogbmV3IEV2ZW50RGlzcGF0Y2hlcjxCdXR0b248Q29uZmlnPiwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQnV0dG9uQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1idXR0b25cIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGJ1dHRvbiBlbGVtZW50IHdpdGggdGhlIHRleHQgbGFiZWxcclxuICAgICAgICBsZXQgYnV0dG9uRWxlbWVudCA9IG5ldyBET00oXCJidXR0b25cIiwge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJidXR0b25cIixcclxuICAgICAgICAgICAgXCJpZFwiOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiB0aGlzLmdldENzc0NsYXNzZXMoKVxyXG4gICAgICAgIH0pLmFwcGVuZChuZXcgRE9NKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJsYWJlbFwiXHJcbiAgICAgICAgfSkuaHRtbCh0aGlzLmNvbmZpZy50ZXh0KSk7XHJcblxyXG4gICAgICAgIC8vIExpc3RlbiBmb3IgdGhlIGNsaWNrIGV2ZW50IG9uIHRoZSBidXR0b24gZWxlbWVudCBhbmQgdHJpZ2dlciB0aGUgY29ycmVzcG9uZGluZyBldmVudCBvbiB0aGUgYnV0dG9uIGNvbXBvbmVudFxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25DbGlja0V2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBidXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkNsaWNrRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy5idXR0b25FdmVudHMub25DbGljay5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uQ2xpY2soKTogRXZlbnQ8QnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmJ1dHRvbkV2ZW50cy5vbkNsaWNrLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyQ29uZmlnLCBDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge0xhYmVsLCBMYWJlbENvbmZpZ30gZnJvbSBcIi4vbGFiZWxcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IENhc3RXYWl0aW5nRm9yRGV2aWNlRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuQ2FzdFdhaXRpbmdGb3JEZXZpY2VFdmVudDtcclxuaW1wb3J0IENhc3RMYXVuY2hlZEV2ZW50ID0gYml0bW92aW4ucGxheWVyLkNhc3RMYXVuY2hlZEV2ZW50O1xyXG5pbXBvcnQgQ2FzdFN0b3BwZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5DYXN0U3RvcHBlZEV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIE92ZXJsYXlzIHRoZSBwbGF5ZXIgYW5kIGRpc3BsYXlzIHRoZSBzdGF0dXMgb2YgYSBDYXN0IHNlc3Npb24uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2FzdFN0YXR1c092ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0dXNMYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29udGFpbmVyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXR1c0xhYmVsID0gbmV3IExhYmVsPExhYmVsQ29uZmlnPih7Y3NzQ2xhc3M6IFwidWktY2FzdC1zdGF0dXMtbGFiZWxcIn0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWNhc3Qtc3RhdHVzLW92ZXJsYXlcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMuc3RhdHVzTGFiZWxdLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNhc3REZXZpY2VOYW1lID0gXCJ1bmtub3duXCI7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RBUlQsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAvLyBTaG93IENhc3Qgc3RhdHVzIHdoZW4gYSBzZXNzaW9uIGlzIGJlaW5nIHN0YXJ0ZWRcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhdHVzTGFiZWwuc2V0VGV4dChcIlNlbGVjdCBhIENhc3QgZGV2aWNlXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfV0FJVElOR19GT1JfREVWSUNFLCBmdW5jdGlvbiAoZXZlbnQ6IENhc3RXYWl0aW5nRm9yRGV2aWNlRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gR2V0IGRldmljZSBuYW1lIGFuZCB1cGRhdGUgc3RhdHVzIHRleHQgd2hpbGUgY29ubmVjdGluZ1xyXG4gICAgICAgICAgICBjYXN0RGV2aWNlTmFtZSA9IGV2ZW50LmNhc3RQYXlsb2FkLmRldmljZU5hbWU7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhdHVzTGFiZWwuc2V0VGV4dChgQ29ubmVjdGluZyB0byA8c3Ryb25nPiR7Y2FzdERldmljZU5hbWV9PC9zdHJvbmc+Li4uYCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9MQVVOQ0hFRCwgZnVuY3Rpb24gKGV2ZW50OiBDYXN0TGF1bmNoZWRFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBTZXNzaW9uIGlzIHN0YXJ0ZWQgb3IgcmVzdW1lZFxyXG4gICAgICAgICAgICAvLyBGb3IgY2FzZXMgd2hlbiBhIHNlc3Npb24gaXMgcmVzdW1lZCwgd2UgZG8gbm90IHJlY2VpdmUgdGhlIHByZXZpb3VzIGV2ZW50cyBhbmQgdGhlcmVmb3JlIHNob3cgdGhlIHN0YXR1cyBwYW5lbCBoZXJlIHRvb1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgc2VsZi5zdGF0dXNMYWJlbC5zZXRUZXh0KGBQbGF5aW5nIG9uIDxzdHJvbmc+JHtjYXN0RGV2aWNlTmFtZX08L3N0cm9uZz5gKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUT1AsIGZ1bmN0aW9uIChldmVudDogQ2FzdFN0b3BwZWRFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBDYXN0IHNlc3Npb24gZ29uZSwgaGlkZSB0aGUgc3RhdHVzIHBhbmVsXHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgY2FzdGluZyB0byBhIENhc3QgcmVjZWl2ZXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2FzdFRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1jYXN0dG9nZ2xlYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiR29vZ2xlIENhc3RcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0QXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0aW5nKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuY2FzdFN0b3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmNhc3RWaWRlbygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDYXN0IHVuYXZhaWxhYmxlXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBjYXN0QXZhaWxhYmxlSGFuZGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzQ2FzdEF2YWlsYWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9BVkFJTEFCTEUsIGNhc3RBdmFpbGFibGVIYW5kZXIpO1xyXG5cclxuICAgICAgICAvLyBIaWRlIGJ1dHRvbiBpZiBDYXN0IG5vdCBhdmFpbGFibGVcclxuICAgICAgICBjYXN0QXZhaWxhYmxlSGFuZGVyKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7R3VpZH0gZnJvbSBcIi4uL2d1aWRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtFdmVudERpc3BhdGNoZXIsIE5vQXJncywgRXZlbnR9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGNvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIGNvbXBvbmVudC5cclxuICogU2hvdWxkIGJlIGV4dGVuZGVkIGJ5IGNvbXBvbmVudHMgdGhhdCB3YW50IHRvIGFkZCBhZGRpdGlvbmFsIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIEhUTUwgdGFnIG5hbWUgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqIERlZmF1bHQ6IFwiZGl2XCJcclxuICAgICAqL1xyXG4gICAgdGFnPzogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSFRNTCBJRCBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICogRGVmYXVsdDogYXV0b21hdGljYWxseSBnZW5lcmF0ZWQgd2l0aCBwYXR0ZXJuIFwidWktaWQte2d1aWR9XCIuXHJcbiAgICAgKi9cclxuICAgIGlkPzogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuIFRoaXMgaXMgdXN1YWxseSB0aGUgY2xhc3MgZnJvbSB3aGVyZSB0aGUgY29tcG9uZW50IHRha2VzIGl0cyBzdHlsaW5nLlxyXG4gICAgICovXHJcbiAgICBjc3NDbGFzcz86IHN0cmluZzsgLy8gXCJjbGFzc1wiIGlzIGEgcmVzZXJ2ZWQga2V5d29yZCwgc28gd2UgbmVlZCB0byBtYWtlIHRoZSBuYW1lIG1vcmUgY29tcGxpY2F0ZWRcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZGl0aW9uYWwgQ1NTIGNsYXNzZXMgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgY3NzQ2xhc3Nlcz86IHN0cmluZ1tdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3BlY2lmaWVzIGlmIHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIGhpZGRlbiBhdCBzdGFydHVwLlxyXG4gICAgICogRGVmYXVsdDogZmFsc2VcclxuICAgICAqL1xyXG4gICAgaGlkZGVuPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBiYXNlIGNsYXNzIG9mIHRoZSBVSSBmcmFtZXdvcmsuXHJcbiAqIEVhY2ggY29tcG9uZW50IG11c3QgZXh0ZW5kIHRoaXMgY2xhc3MgYW5kIG9wdGlvbmFsbHkgdGhlIGNvbmZpZyBpbnRlcmZhY2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50PENvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZz4ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNsYXNzbmFtZSB0aGF0IGlzIGF0dGFjaGVkIHRvIHRoZSBlbGVtZW50IHdoZW4gaXQgaXMgaW4gdGhlIGhpZGRlbiBzdGF0ZS5cclxuICAgICAqIEB0eXBlIHtzdHJpbmd9XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX0hJRERFTiA9IFwiaGlkZGVuXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25maWd1cmF0aW9uIG9iamVjdCBvZiB0aGlzIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGNvbmZpZzogQ29uZmlnO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGNvbXBvbmVudCdzIERPTSBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGVsZW1lbnQ6IERPTTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZsYWcgdGhhdCBrZWVwcyB0cmFjayBvZiB0aGUgaGlkZGVuIHN0YXRlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGhpZGRlbjogYm9vbGVhbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsaXN0IG9mIGV2ZW50cyB0aGF0IHRoaXMgY29tcG9uZW50IG9mZmVycy4gVGhlc2UgZXZlbnRzIHNob3VsZCBhbHdheXMgYmUgcHJpdmF0ZSBhbmQgb25seSBkaXJlY3RseVxyXG4gICAgICogYWNjZXNzZWQgZnJvbSB3aXRoaW4gdGhlIGltcGxlbWVudGluZyBjb21wb25lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQmVjYXVzZSBUeXBlU2NyaXB0IGRvZXMgbm90IHN1cHBvcnQgcHJpdmF0ZSBwcm9wZXJ0aWVzIHdpdGggdGhlIHNhbWUgbmFtZSBvbiBkaWZmZXJlbnQgY2xhc3MgaGllcmFyY2h5IGxldmVsc1xyXG4gICAgICogKGkuZS4gc3VwZXJjbGFzcyBhbmQgc3ViY2xhc3MgY2Fubm90IGNvbnRhaW4gYSBwcml2YXRlIHByb3BlcnR5IHdpdGggdGhlIHNhbWUgbmFtZSksIHRoZSBkZWZhdWx0IG5hbWluZ1xyXG4gICAgICogY29udmVudGlvbiBmb3IgdGhlIGV2ZW50IGxpc3Qgb2YgYSBjb21wb25lbnQgdGhhdCBzaG91bGQgYmUgZm9sbG93ZWQgYnkgc3ViY2xhc3NlcyBpcyB0aGUgY29uY2F0ZW5hdGlvbiBvZiB0aGVcclxuICAgICAqIGNhbWVsLWNhc2VkIGNsYXNzIG5hbWUgKyBcIkV2ZW50c1wiIChlLmcuIFN1YkNsYXNzIGV4dGVuZHMgQ29tcG9uZW50ID0+IHN1YkNsYXNzRXZlbnRzKS5cclxuICAgICAqIFNlZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50c30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogRXZlbnQgcHJvcGVydGllcyBzaG91bGQgYmUgbmFtZWQgaW4gY2FtZWwgY2FzZSB3aXRoIGFuIFwib25cIiBwcmVmaXggYW5kIGluIHRoZSBwcmVzZW50IHRlbnNlLiBBc3luYyBldmVudHMgbWF5XHJcbiAgICAgKiBoYXZlIGEgc3RhcnQgZXZlbnQgKHdoZW4gdGhlIG9wZXJhdGlvbiBzdGFydHMpIGluIHRoZSBwcmVzZW50IHRlbnNlLCBhbmQgbXVzdCBoYXZlIGFuIGVuZCBldmVudCAod2hlbiB0aGVcclxuICAgICAqIG9wZXJhdGlvbiBlbmRzKSBpbiB0aGUgcGFzdCB0ZW5zZSAob3IgcHJlc2VudCB0ZW5zZSBpbiBzcGVjaWFsIGNhc2VzIChlLmcuIG9uU3RhcnQvb25TdGFydGVkIG9yIG9uUGxheS9vblBsYXlpbmcpLlxyXG4gICAgICogU2VlIHtAbGluayAjY29tcG9uZW50RXZlbnRzI29uU2hvd30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogRWFjaCBldmVudCBzaG91bGQgYmUgYWNjb21wYW5pZWQgd2l0aCBhIHByb3RlY3RlZCBtZXRob2QgbmFtZWQgYnkgdGhlIGNvbnZlbnRpb24gZXZlbnROYW1lICsgXCJFdmVudFwiXHJcbiAgICAgKiAoZS5nLiBvblN0YXJ0RXZlbnQpLCB0aGF0IGFjdHVhbGx5IHRyaWdnZXJzIHRoZSBldmVudCBieSBjYWxsaW5nIHtAbGluayBFdmVudERpc3BhdGNoZXIjZGlzcGF0Y2ggZGlzcGF0Y2h9IGFuZFxyXG4gICAgICogcGFzc2luZyBhIHJlZmVyZW5jZSB0byB0aGUgY29tcG9uZW50IGFzIGZpcnN0IHBhcmFtZXRlci4gQ29tcG9uZW50cyBzaG91bGQgYWx3YXlzIHRyaWdnZXIgdGhlaXIgZXZlbnRzIHdpdGggdGhlc2VcclxuICAgICAqIG1ldGhvZHMuIEltcGxlbWVudGluZyB0aGlzIHBhdHRlcm4gZ2l2ZXMgc3ViY2xhc3NlcyBtZWFucyB0byBkaXJlY3RseSBsaXN0ZW4gdG8gdGhlIGV2ZW50cyBieSBvdmVycmlkaW5nIHRoZVxyXG4gICAgICogbWV0aG9kIChhbmQgc2F2aW5nIHRoZSBvdmVyaGVhZCBvZiBwYXNzaW5nIGEgaGFuZGxlciB0byB0aGUgZXZlbnQgZGlzcGF0Y2hlcikgYW5kIG1vcmUgaW1wb3J0YW50bHkgdG8gdHJpZ2dlclxyXG4gICAgICogdGhlc2UgZXZlbnRzIHdpdGhvdXQgaGF2aW5nIGFjY2VzcyB0byB0aGUgcHJpdmF0ZSBldmVudCBsaXN0LlxyXG4gICAgICogU2VlIHtAbGluayAjb25TaG93fSBmb3IgYW4gZXhhbXBsZS5cclxuICAgICAqXHJcbiAgICAgKiBUbyBwcm92aWRlIGV4dGVybmFsIGNvZGUgdGhlIHBvc3NpYmlsaXR5IHRvIGxpc3RlbiB0byB0aGlzIGNvbXBvbmVudCdzIGV2ZW50cyAoc3Vic2NyaWJlLCB1bnN1YnNjcmliZSwgZXRjLiksXHJcbiAgICAgKiBlYWNoIGV2ZW50IHNob3VsZCBhbHNvIGJlIGFjY29tcGFuaWVkIGJ5IGEgcHVibGljIGdldHRlciBmdW5jdGlvbiB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgdGhlIGV2ZW50J3MgcHJvcGVydHksXHJcbiAgICAgKiB0aGF0IHJldHVybnMgdGhlIHtAbGluayBFdmVudH0gb2J0YWluZWQgZnJvbSB0aGUgZXZlbnQgZGlzcGF0Y2hlciBieSBjYWxsaW5nIHtAbGluayBFdmVudERpc3BhdGNoZXIjZ2V0RXZlbnR9LlxyXG4gICAgICogU2VlIHtAbGluayAjb25TaG93fSBmb3IgYW4gZXhhbXBsZS5cclxuICAgICAqXHJcbiAgICAgKiBGdWxsIGV4YW1wbGUgZm9yIGFuIGV2ZW50IHJlcHJlc2VudGluZyBhbiBleGFtcGxlIGFjdGlvbiBpbiBhIGV4YW1wbGUgY29tcG9uZW50OlxyXG4gICAgICpcclxuICAgICAqIDxjb2RlPlxyXG4gICAgICogLy8gRGVmaW5lIGFuIGV4YW1wbGUgY29tcG9uZW50IGNsYXNzIHdpdGggYW4gZXhhbXBsZSBldmVudFxyXG4gICAgICogY2xhc3MgRXhhbXBsZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudDxDb21wb25lbnRDb25maWc+IHtcclxuICAgICAqXHJcbiAgICAgKiAgICAgcHJpdmF0ZSBleGFtcGxlQ29tcG9uZW50RXZlbnRzID0ge1xyXG4gICAgICogICAgICAgICBvbkV4YW1wbGVBY3Rpb246IG5ldyBFdmVudERpc3BhdGNoZXI8RXhhbXBsZUNvbXBvbmVudCwgTm9BcmdzPigpXHJcbiAgICAgKiAgICAgfVxyXG4gICAgICpcclxuICAgICAqICAgICAvLyBjb25zdHJ1Y3RvciBhbmQgb3RoZXIgc3R1ZmYuLi5cclxuICAgICAqXHJcbiAgICAgKiAgICAgcHJvdGVjdGVkIG9uRXhhbXBsZUFjdGlvbkV2ZW50KCkge1xyXG4gICAgICogICAgICAgIHRoaXMuZXhhbXBsZUNvbXBvbmVudEV2ZW50cy5vbkV4YW1wbGVBY3Rpb24uZGlzcGF0Y2godGhpcyk7XHJcbiAgICAgKiAgICB9XHJcbiAgICAgKlxyXG4gICAgICogICAgZ2V0IG9uRXhhbXBsZUFjdGlvbigpOiBFdmVudDxFeGFtcGxlQ29tcG9uZW50LCBOb0FyZ3M+IHtcclxuICAgICAqICAgICAgICByZXR1cm4gdGhpcy5leGFtcGxlQ29tcG9uZW50RXZlbnRzLm9uRXhhbXBsZUFjdGlvbi5nZXRFdmVudCgpO1xyXG4gICAgICogICAgfVxyXG4gICAgICogfVxyXG4gICAgICpcclxuICAgICAqIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgY29tcG9uZW50IHNvbWV3aGVyZVxyXG4gICAgICogdmFyIGV4YW1wbGVDb21wb25lbnRJbnN0YW5jZSA9IG5ldyBFeGFtcGxlQ29tcG9uZW50KCk7XHJcbiAgICAgKlxyXG4gICAgICogLy8gU3Vic2NyaWJlIHRvIHRoZSBleGFtcGxlIGV2ZW50IG9uIHRoZSBjb21wb25lbnRcclxuICAgICAqIGV4YW1wbGVDb21wb25lbnRJbnN0YW5jZS5vbkV4YW1wbGVBY3Rpb24uc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IEV4YW1wbGVDb21wb25lbnQpIHtcclxuICAgICAqICAgICBjb25zb2xlLmxvZyhcIm9uRXhhbXBsZUFjdGlvbiBvZiBcIiArIHNlbmRlciArIFwiIGhhcyBmaXJlZCFcIik7XHJcbiAgICAgKiB9KTtcclxuICAgICAqIDwvY29kZT5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBjb21wb25lbnRFdmVudHMgPSB7XHJcbiAgICAgICAgb25TaG93OiBuZXcgRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25IaWRlOiBuZXcgRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25zdHJ1Y3RzIGEgY29tcG9uZW50IHdpdGggYW4gb3B0aW9uYWxseSBzdXBwbGllZCBjb25maWcuIEFsbCBzdWJjbGFzc2VzIG11c3QgY2FsbCB0aGUgY29uc3RydWN0b3Igb2YgdGhlaXJcclxuICAgICAqIHN1cGVyY2xhc3MgYW5kIHRoZW4gbWVyZ2UgdGhlaXIgY29uZmlndXJhdGlvbiBpbnRvIHRoZSBjb21wb25lbnQncyBjb25maWd1cmF0aW9uLlxyXG4gICAgICogQHBhcmFtIGNvbmZpZyB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbXBvbmVudENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY29uZmlnKTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGlzIGNvbXBvbmVudFxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gPENvbmZpZz50aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICB0YWc6IFwiZGl2XCIsXHJcbiAgICAgICAgICAgIGlkOiBcInVpLWlkLVwiICsgR3VpZC5uZXh0KCksXHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWNvbXBvbmVudFwiLFxyXG4gICAgICAgICAgICBjc3NDbGFzc2VzOiBbXSxcclxuICAgICAgICAgICAgaGlkZGVuOiBmYWxzZVxyXG4gICAgICAgIH0sIHt9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEluaXRpYWxpemVzIHRoZSBjb21wb25lbnQsIGUuZy4gYnkgYXBwbHlpbmcgY29uZmlnIHNldHRpbmdzLlxyXG4gICAgICogVGhpcyBtZXRob2QgbXVzdCBub3QgYmUgY2FsbGVkIGZyb20gb3V0c2lkZSB0aGUgVUkgZnJhbWV3b3JrLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGF1dG9tYXRpY2FsbHkgY2FsbGVkIGJ5IHRoZSB7QGxpbmsgVUlNYW5hZ2VyfS4gSWYgdGhlIGNvbXBvbmVudCBpcyBhbiBpbm5lciBjb21wb25lbnQgb2ZcclxuICAgICAqIHNvbWUgY29tcG9uZW50LCBhbmQgdGh1cyBlbmNhcHN1bGF0ZWQgYWJkIG1hbmFnZWQgaW50ZXJuYWxseSBhbmQgbmV2ZXIgZGlyZWN0bHkgZXhwb3NlZCB0byB0aGUgVUlNYW5hZ2VyLFxyXG4gICAgICogdGhpcyBtZXRob2QgbXVzdCBiZSBjYWxsZWQgZnJvbSB0aGUgbWFuYWdpbmcgY29tcG9uZW50J3Mge0BsaW5rICNpbml0aWFsaXplfSBtZXRob2QuXHJcbiAgICAgKi9cclxuICAgIGluaXRpYWxpemUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0aGlzLmNvbmZpZy5oaWRkZW47XHJcblxyXG4gICAgICAgIC8vIEhpZGUgdGhlIGNvbXBvbmVudCBhdCBpbml0aWFsaXphdGlvbiBpZiBpdCBpcyBjb25maWd1cmVkIHRvIGJlIGhpZGRlblxyXG4gICAgICAgIGlmICh0aGlzLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uZmlndXJlcyB0aGUgY29tcG9uZW50IGZvciB0aGUgc3VwcGxpZWQgUGxheWVyIGFuZCBVSU1hbmFnZXIuIFRoaXMgaXMgdGhlIHBsYWNlIHdoZXJlIGFsbCB0aGUgbWFnaWMgaGFwcGVucyxcclxuICAgICAqIHdoZXJlIGNvbXBvbmVudHMgdHlwaWNhbGx5IHN1YnNjcmliZSBhbmQgcmVhY3QgdG8gZXZlbnRzIChvbiB0aGVpciBET00gZWxlbWVudCwgdGhlIFBsYXllciwgb3IgdGhlIFVJTWFuYWdlciksXHJcbiAgICAgKiBhbmQgYmFzaWNhbGx5IGV2ZXJ5dGhpbmcgdGhhdCBtYWtlcyB0aGVtIGludGVyYWN0aXZlLlxyXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIG9ubHkgb25jZSwgd2hlbiB0aGUgVUlNYW5hZ2VyIGluaXRpYWxpemVzIHRoZSBVSS5cclxuICAgICAqXHJcbiAgICAgKiBTdWJjbGFzc2VzIHVzdWFsbHkgb3ZlcndyaXRlIHRoaXMgbWV0aG9kIHRvIGFkZCB0aGVpciBvd24gZnVuY3Rpb25hbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gcGxheWVyIHRoZSBwbGF5ZXIgd2hpY2ggdGhpcyBjb21wb25lbnQgY29udHJvbHNcclxuICAgICAqIEBwYXJhbSB1aW1hbmFnZXIgdGhlIFVJTWFuYWdlciB0aGF0IG1hbmFnZXMgdGhpcyBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBub3RoaW5nIHRvIGRvIGhlcmU7IG92ZXJ3cml0ZSBpbiBzdWJjbGFzc2VzXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZW5lcmF0ZSB0aGUgRE9NIGVsZW1lbnQgZm9yIHRoaXMgY29tcG9uZW50LlxyXG4gICAgICpcclxuICAgICAqIFN1YmNsYXNzZXMgdXN1YWxseSBvdmVyd3JpdGUgdGhpcyBtZXRob2QgdG8gZXh0ZW5kIG9yIHJlcGxhY2UgdGhlIERPTSBlbGVtZW50IHdpdGggdGhlaXIgb3duIGRlc2lnbi5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gbmV3IERPTSh0aGlzLmNvbmZpZy50YWcsIHtcclxuICAgICAgICAgICAgXCJpZFwiOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiB0aGlzLmdldENzc0NsYXNzZXMoKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgRE9NIGVsZW1lbnQgb2YgdGhpcyBjb21wb25lbnQuIENyZWF0ZXMgdGhlIERPTSBlbGVtZW50IGlmIGl0IGRvZXMgbm90IHlldCBleGlzdC5cclxuICAgICAqXHJcbiAgICAgKiBTaG91bGQgbm90IGJlIG92ZXJ3cml0dGVuIGJ5IHN1YmNsYXNzZXMuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgZ2V0RG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGlmICghdGhpcy5lbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudCA9IHRoaXMudG9Eb21FbGVtZW50KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogTWVyZ2VzIGEgY29uZmlndXJhdGlvbiB3aXRoIGEgZGVmYXVsdCBjb25maWd1cmF0aW9uIGFuZCBhIGJhc2UgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBzdXBlcmNsYXNzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBjb25maWcgdGhlIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgZm9yIHRoZSBjb21wb25lbnRzLCBhcyB1c3VhbGx5IHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3JcclxuICAgICAqIEBwYXJhbSBkZWZhdWx0cyBhIGRlZmF1bHQgY29uZmlndXJhdGlvbiBmb3Igc2V0dGluZ3MgdGhhdCBhcmUgbm90IHBhc3NlZCB3aXRoIHRoZSBjb25maWd1cmF0aW9uXHJcbiAgICAgKiBAcGFyYW0gYmFzZSBjb25maWd1cmF0aW9uIGluaGVyaXRlZCBmcm9tIGEgc3VwZXJjbGFzc1xyXG4gICAgICogQHJldHVybnMge0NvbmZpZ31cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIG1lcmdlQ29uZmlnPENvbmZpZz4oY29uZmlnOiBDb25maWcsIGRlZmF1bHRzOiBDb25maWcsIGJhc2U6IENvbmZpZyk6IENvbmZpZyB7XHJcbiAgICAgICAgLy8gRXh0ZW5kIGRlZmF1bHQgY29uZmlnIHdpdGggc3VwcGxpZWQgY29uZmlnXHJcbiAgICAgICAgbGV0IG1lcmdlZCA9IE9iamVjdC5hc3NpZ24oe30sIGJhc2UsIGRlZmF1bHRzLCBjb25maWcpO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gdGhlIGV4dGVuZGVkIGNvbmZpZ1xyXG4gICAgICAgIHJldHVybiBtZXJnZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmV0dXJucyBhIHN0cmluZyBvZiBhbGwgQ1NTIGNsYXNzZXMgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgZ2V0Q3NzQ2xhc3NlcygpOiBzdHJpbmcge1xyXG4gICAgICAgIC8vIE1lcmdlIGFsbCBDU1MgY2xhc3NlcyBpbnRvIHNpbmdsZSBhcnJheVxyXG4gICAgICAgIGxldCBmbGF0dGVuZWRBcnJheSA9IFt0aGlzLmNvbmZpZy5jc3NDbGFzc10uY29uY2F0KHRoaXMuY29uZmlnLmNzc0NsYXNzZXMpO1xyXG4gICAgICAgIC8vIEpvaW4gYXJyYXkgdmFsdWVzIGludG8gYSBzdHJpbmdcclxuICAgICAgICBsZXQgZmxhdHRlbmVkU3RyaW5nID0gZmxhdHRlbmVkQXJyYXkuam9pbihcIiBcIik7XHJcbiAgICAgICAgLy8gUmV0dXJuIHRyaW1tZWQgc3RyaW5nIHRvIHByZXZlbnQgd2hpdGVzcGFjZSBhdCB0aGUgZW5kIGZyb20gdGhlIGpvaW4gb3BlcmF0aW9uXHJcbiAgICAgICAgcmV0dXJuIGZsYXR0ZW5lZFN0cmluZy50cmltKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjb25maWd1cmF0aW9uIG9iamVjdCBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICogQHJldHVybnMge0NvbmZpZ31cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdldENvbmZpZygpOiBDb25maWcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEhpZGVzIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBiYXNpY2FsbHkgdHJhbnNmZXJzIHRoZSBjb21wb25lbnQgaW50byB0aGUgaGlkZGVuIHN0YXRlLiBBY3R1YWwgaGlkaW5nIGlzIGRvbmUgdmlhIENTUy5cclxuICAgICAqL1xyXG4gICAgaGlkZSgpIHtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3MoQ29tcG9uZW50LkNMQVNTX0hJRERFTik7XHJcbiAgICAgICAgdGhpcy5vbkhpZGVFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvd3MgdGhlIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhDb21wb25lbnQuQ0xBU1NfSElEREVOKTtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub25TaG93RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVybWluZXMgaWYgdGhlIGNvbXBvbmVudCBpcyBoaWRkZW4uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGlzIGhpZGRlbiwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBpc0hpZGRlbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oaWRkZW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBjb21wb25lbnQgaXMgc2hvd24uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGlzIHZpc2libGUsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNTaG93bigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaXNIaWRkZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIGhpZGRlbiBzdGF0ZSBieSBoaWRpbmcgdGhlIGNvbXBvbmVudCBpZiBpdCBpcyBzaG93biwgb3Igc2hvd2luZyBpdCBpZiBoaWRkZW4uXHJcbiAgICAgKi9cclxuICAgIHRvZ2dsZUhpZGRlbigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSBvblNob3cgZXZlbnQuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIG9uU2hvd0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uU2hvdy5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSBvbkhpZGUgZXZlbnQuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIG9uSGlkZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uSGlkZS5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIHNob3dpbmcuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TaG93KCk6IEV2ZW50PENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRFdmVudHMub25TaG93LmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBoaWRpbmcuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25IaWRlKCk6IEV2ZW50PENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRFdmVudHMub25IaWRlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0FycmF5VXRpbHN9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBDb250YWluZXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDb250YWluZXJDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGlsZCBjb21wb25lbnRzIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICAgKi9cclxuICAgIGNvbXBvbmVudHM/OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPltdO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjb250YWluZXIgY29tcG9uZW50IHRoYXQgY2FuIGNvbnRhaW4gYSBjb2xsZWN0aW9uIG9mIGNoaWxkIGNvbXBvbmVudHMuXHJcbiAqIENvbXBvbmVudHMgY2FuIGJlIGFkZGVkIGF0IGNvbnN0cnVjdGlvbiB0aW1lIHRocm91Z2ggdGhlIHtAbGluayBDb250YWluZXJDb25maWcjY29tcG9uZW50c30gc2V0dGluZywgb3IgbGF0ZXJcclxuICogdGhyb3VnaCB0aGUge0BsaW5rIENvbnRhaW5lciNhZGRDb21wb25lbnR9IG1ldGhvZC4gVGhlIFVJTWFuYWdlciBhdXRvbWF0aWNhbGx5IHRha2VzIGNhcmUgb2YgYWxsIGNvbXBvbmVudHMsIGkuZS4gaXRcclxuICogaW5pdGlhbGl6ZXMgYW5kIGNvbmZpZ3VyZXMgdGhlbSBhdXRvbWF0aWNhbGx5LlxyXG4gKlxyXG4gKiBJbiB0aGUgRE9NLCB0aGUgY29udGFpbmVyIGNvbnNpc3RzIG9mIGFuIG91dGVyIDxkaXY+ICh0aGF0IGNhbiBiZSBjb25maWd1cmVkIGJ5IHRoZSBjb25maWcpIGFuZCBhbiBpbm5lciB3cmFwcGVyXHJcbiAqIDxkaXY+IHRoYXQgY29udGFpbnMgdGhlIGNvbXBvbmVudHMuIFRoaXMgZG91YmxlLTxkaXY+LXN0cnVjdHVyZSBpcyBvZnRlbiByZXF1aXJlZCB0byBhY2hpZXZlIG1hbnkgYWR2YW5jZWQgZWZmZWN0c1xyXG4gKiBpbiBDU1MgYW5kL29yIEpTLCBlLmcuIGFuaW1hdGlvbnMgYW5kIGNlcnRhaW4gZm9ybWF0dGluZyB3aXRoIGFic29sdXRlIHBvc2l0aW9uaW5nLlxyXG4gKlxyXG4gKiBET00gZXhhbXBsZTpcclxuICogPGNvZGU+XHJcbiAqICAgICA8ZGl2IGNsYXNzPVwidWktY29udGFpbmVyXCI+XHJcbiAqICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lci13cmFwcGVyXCI+XHJcbiAqICAgICAgICAgICAgIC4uLiBjaGlsZCBjb21wb25lbnRzIC4uLlxyXG4gKiAgICAgICAgIDwvZGl2PlxyXG4gKiAgICAgPC9kaXY+XHJcbiAqIDwvY29kZT5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb250YWluZXI8Q29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBpbm5lciBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGNvbXBvbmVudHMgb2YgdGhlIGNvbnRhaW5lci5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpbm5lckNvbnRhaW5lckVsZW1lbnQ6IERPTTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY29udGFpbmVyXCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFtdXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGNoaWxkIGNvbXBvbmVudCB0byB0aGUgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIGNvbXBvbmVudCB0aGUgY29tcG9uZW50IHRvIGFkZFxyXG4gICAgICovXHJcbiAgICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPikge1xyXG4gICAgICAgIHRoaXMuY29uZmlnLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhIGNoaWxkIGNvbXBvbmVudCBmcm9tIHRoZSBjb250YWluZXIuXHJcbiAgICAgKiBAcGFyYW0gY29tcG9uZW50IHRoZSBjb21wb25lbnQgdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIHJlbW92ZWQsIGZhbHNlIGlmIGl0IGlzIG5vdCBjb250YWluZWQgaW4gdGhpcyBjb250YWluZXJcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gQXJyYXlVdGlscy5yZW1vdmUodGhpcy5jb25maWcuY29tcG9uZW50cywgY29tcG9uZW50KSAhPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBhbiBhcnJheSBvZiBhbGwgY2hpbGQgY29tcG9uZW50cyBpbiB0aGlzIGNvbnRhaW5lci5cclxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPltdfVxyXG4gICAgICovXHJcbiAgICBnZXRDb21wb25lbnRzKCk6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5jb21wb25lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgRE9NIG9mIHRoZSBjb250YWluZXIgd2l0aCB0aGUgY3VycmVudCBjb21wb25lbnRzLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlQ29tcG9uZW50cygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5jb25maWcuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxlbWVudC5hcHBlbmQoY29tcG9uZW50LmdldERvbUVsZW1lbnQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNvbnRhaW5lciBlbGVtZW50ICh0aGUgb3V0ZXIgPGRpdj4pXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lckVsZW1lbnQgPSBuZXcgRE9NKHRoaXMuY29uZmlnLnRhZywge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgaW5uZXIgY29udGFpbmVyIGVsZW1lbnQgKHRoZSBpbm5lciA8ZGl2PikgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIGNvbXBvbmVudHNcclxuICAgICAgICBsZXQgaW5uZXJDb250YWluZXIgPSBuZXcgRE9NKHRoaXMuY29uZmlnLnRhZywge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IFwiY29udGFpbmVyLXdyYXBwZXJcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuaW5uZXJDb250YWluZXJFbGVtZW50ID0gaW5uZXJDb250YWluZXI7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlQ29tcG9uZW50cygpO1xyXG5cclxuICAgICAgICBjb250YWluZXJFbGVtZW50LmFwcGVuZChpbm5lckNvbnRhaW5lcik7XHJcblxyXG4gICAgICAgIHJldHVybiBjb250YWluZXJFbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtUaW1lb3V0fSBmcm9tIFwiLi4vdGltZW91dFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIENvbnRyb2xCYXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDb250cm9sQmFyQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgY29udHJvbCBiYXIgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogRGVmYXVsdDogNSBzZWNvbmRzICg1MDAwKVxyXG4gICAgICovXHJcbiAgICBoaWRlRGVsYXk/OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGNvbnRhaW5lciBmb3IgbWFpbiBwbGF5ZXIgY29udHJvbCBjb21wb25lbnRzLCBlLmcuIHBsYXkgdG9nZ2xlIGJ1dHRvbiwgc2VlayBiYXIsIHZvbHVtZSBjb250cm9sLCBmdWxsc2NyZWVuIHRvZ2dsZSBidXR0b24uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29udHJvbEJhciBleHRlbmRzIENvbnRhaW5lcjxDb250cm9sQmFyQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250cm9sQmFyQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1jb250cm9sYmFyXCIsXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcclxuICAgICAgICAgICAgaGlkZURlbGF5OiA1MDAwXHJcbiAgICAgICAgfSwgPENvbnRyb2xCYXJDb25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBpc1NlZWtpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dCgoPENvbnRyb2xCYXJDb25maWc+c2VsZi5nZXRDb25maWcoKSkuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7IC8vIFRPRE8gZml4IGdlbmVyaWNzIHRvIHNwYXJlIHRoZXNlIGRhbW4gY2FzdHMuLi4gaXMgdGhhdCBldmVuIHBvc3NpYmxlIGluIFRTP1xyXG4gICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VFbnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTsgLy8gc2hvdyBjb250cm9sIGJhciB3aGVuIHRoZSBtb3VzZSBlbnRlcnMgdGhlIFVJXHJcblxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7IC8vIENsZWFyIHRpbWVvdXQgdG8gYXZvaWQgaGlkaW5nIHRoZSBjb250cm9sIGJhciBpZiB0aGUgbW91c2UgbW92ZXMgYmFjayBpbnRvIHRoZSBVSSBkdXJpbmcgdGhlIHRpbWVvdXQgcGVyaW9kXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VNb3ZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvbid0IGNyZWF0ZS91cGRhdGUgdGltZW91dCB3aGlsZSBzZWVraW5nXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSB0aGUgY29udHJvbCBiYXIgaWYgbW91c2UgZG9lcyBub3QgbW92ZSBkdXJpbmcgdGhlIHRpbWVvdXQgdGltZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTGVhdmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKGlzU2Vla2luZykge1xyXG4gICAgICAgICAgICAgICAgLy8gRG9uJ3QgY3JlYXRlL3VwZGF0ZSB0aW1lb3V0IHdoaWxlIHNlZWtpbmdcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGltZW91dC5yZXNldCgpOyAvLyBoaWRlIGNvbnRyb2wgYmFyIHNvbWUgdGltZSBhZnRlciB0aGUgbW91c2UgbGVmdCB0aGUgVUlcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRpbWVvdXQuY2xlYXIoKTsgLy8gRG9uJ3QgaGlkZSBjb250cm9sIGJhciB3aGlsZSBhIHNlZWsgaXMgaW4gcHJvZ3Jlc3NcclxuICAgICAgICAgICAgaXNTZWVraW5nID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrZWQuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaXNTZWVraW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRpbWVvdXQuc3RhcnQoKTsgLy8gaGlkZSBjb250cm9sIGJhciBzb21lIHRpbWUgYWZ0ZXIgYSBzZWVrIGhhcyBmaW5pc2hlZFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBFcnJvckV2ZW50ID0gYml0bW92aW4ucGxheWVyLkVycm9yRXZlbnQ7XHJcblxyXG4vKipcclxuICogT3ZlcmxheXMgdGhlIHBsYXllciBhbmQgZGlzcGxheXMgZXJyb3IgbWVzc2FnZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRXJyb3JNZXNzYWdlT3ZlcmxheSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGVycm9yTGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5lcnJvckxhYmVsID0gbmV3IExhYmVsPExhYmVsQ29uZmlnPih7Y3NzQ2xhc3M6IFwidWktZXJyb3JtZXNzYWdlLWxhYmVsXCJ9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1lcnJvcm1lc3NhZ2Utb3ZlcmxheVwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy5lcnJvckxhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9FUlJPUiwgZnVuY3Rpb24gKGV2ZW50OiBFcnJvckV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXJyb3JMYWJlbC5zZXRUZXh0KGV2ZW50Lm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCB0b2dnbGVzIHRoZSBwbGF5ZXIgYmV0d2VlbiB3aW5kb3dlZCBhbmQgZnVsbHNjcmVlbiB2aWV3LlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIkZ1bGxzY3JlZW5cIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IGZ1bGxzY3JlZW5TdGF0ZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNGdWxsc2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9GVUxMU0NSRUVOX0VOVEVSLCBmdWxsc2NyZWVuU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9GVUxMU0NSRUVOX0VYSVQsIGZ1bGxzY3JlZW5TdGF0ZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Z1bGxzY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmV4aXRGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZW50ZXJGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b25Db25maWd9IGZyb20gXCIuL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1BsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9wbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgUGxheWVyRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyRXZlbnQ7XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCBvdmVybGF5cyB0aGUgdmlkZW8gYW5kIHRvZ2dsZXMgYmV0d2VlbiBwbGF5YmFjayBhbmQgcGF1c2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uIGV4dGVuZHMgUGxheWJhY2tUb2dnbGVCdXR0b24ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVG9nZ2xlQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWh1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlBsYXkvUGF1c2VcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIC8vIFVwZGF0ZSBidXR0b24gc3RhdGUgdGhyb3VnaCBBUEkgZXZlbnRzXHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHRvZ2dsZVBsYXliYWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzUGxheWluZygpKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgdG9nZ2xlRnVsbHNjcmVlbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Z1bGxzY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmV4aXRGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZW50ZXJGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgY2xpY2tUaW1lID0gMDtcclxuICAgICAgICBsZXQgZG91YmxlQ2xpY2tUaW1lID0gMDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBZb3VUdWJlLXN0eWxlIHRvZ2dsZSBidXR0b24gaGFuZGxpbmdcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFRoZSBnb2FsIGlzIHRvIHByZXZlbnQgYSBzaG9ydCBwYXVzZSBvciBwbGF5YmFjayBpbnRlcnZhbCBiZXR3ZWVuIGEgY2xpY2ssIHRoYXQgdG9nZ2xlcyBwbGF5YmFjaywgYW5kIGFcclxuICAgICAgICAgKiBkb3VibGUgY2xpY2ssIHRoYXQgdG9nZ2xlcyBmdWxsc2NyZWVuLiBJbiB0aGlzIG5haXZlIGFwcHJvYWNoLCB0aGUgZmlyc3QgY2xpY2sgd291bGQgZS5nLiBzdGFydCBwbGF5YmFjayxcclxuICAgICAgICAgKiB0aGUgc2Vjb25kIGNsaWNrIHdvdWxkIGJlIGRldGVjdGVkIGFzIGRvdWJsZSBjbGljayBhbmQgdG9nZ2xlIHRvIGZ1bGxzY3JlZW4sIGFuZCBhcyBzZWNvbmQgbm9ybWFsIGNsaWNrIHN0b3BcclxuICAgICAgICAgKiBwbGF5YmFjaywgd2hpY2ggcmVzdWx0cyBpcyBhIHNob3J0IHBsYXliYWNrIGludGVydmFsIHdpdGggbWF4IGxlbmd0aCBvZiB0aGUgZG91YmxlIGNsaWNrIGRldGVjdGlvblxyXG4gICAgICAgICAqIHBlcmlvZCAodXN1YWxseSA1MDBtcykuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUbyBzb2x2ZSB0aGlzIGlzc3VlLCB3ZSBkZWZlciBoYW5kbGluZyBvZiB0aGUgZmlyc3QgY2xpY2sgZm9yIDIwMG1zLCB3aGljaCBpcyBhbG1vc3QgdW5ub3RpY2VhYmxlIHRvIHRoZSB1c2VyLFxyXG4gICAgICAgICAqIGFuZCBqdXN0IHRvZ2dsZSBwbGF5YmFjayBpZiBubyBzZWNvbmQgY2xpY2sgKGRvdWJsZSBjbGljaykgaGFzIGJlZW4gcmVnaXN0ZXJlZCBkdXJpbmcgdGhpcyBwZXJpb2QuIElmIGEgZG91YmxlXHJcbiAgICAgICAgICogY2xpY2sgaXMgcmVnaXN0ZXJlZCwgd2UganVzdCB0b2dnbGUgdGhlIGZ1bGxzY3JlZW4uIEluIHRoZSBmaXJzdCAyMDBtcywgdW5kZXNpcmVkIHBsYXliYWNrIGNoYW5nZXMgdGh1cyBjYW5ub3RcclxuICAgICAgICAgKiBoYXBwZW4uIElmIGEgZG91YmxlIGNsaWNrIGlzIHJlZ2lzdGVyZWQgd2l0aGluIDUwMG1zLCB3ZSB1bmRvIHRoZSBwbGF5YmFjayBjaGFuZ2UgYW5kIHN3aXRjaCBmdWxsc2NyZWVuIG1vZGUuXHJcbiAgICAgICAgICogSW4gdGhlIGVuZCwgdGhpcyBtZXRob2QgYmFzaWNhbGx5IGludHJvZHVjZXMgYSAyMDBtcyBvYnNlcnZpbmcgaW50ZXJ2YWwgaW4gd2hpY2ggcGxheWJhY2sgY2hhbmdlcyBhcmUgcHJldmVudGVkXHJcbiAgICAgICAgICogaWYgYSBkb3VibGUgY2xpY2sgaGFwcGVucy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobm93IC0gY2xpY2tUaW1lIDwgMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgZG91YmxlIGNsaWNrIGluc2lkZSB0aGUgMjAwbXMgaW50ZXJ2YWwsIGp1c3QgdG9nZ2xlIGZ1bGxzY3JlZW4gbW9kZVxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICAgICAgZG91YmxlQ2xpY2tUaW1lID0gbm93O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vdyAtIGNsaWNrVGltZSA8IDUwMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIGRvdWJsZSBjbGljayBpbnNpZGUgdGhlIDUwMG1zIGludGVydmFsLCB1bmRvIHBsYXliYWNrIHRvZ2dsZSBhbmQgdG9nZ2xlIGZ1bGxzY3JlZW4gbW9kZVxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICAgICAgdG9nZ2xlUGxheWJhY2soKTtcclxuICAgICAgICAgICAgICAgIGRvdWJsZUNsaWNrVGltZSA9IG5vdztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY2xpY2tUaW1lID0gbm93O1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIGRvdWJsZUNsaWNrVGltZSA+IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIGRvdWJsZSBjbGljayBkZXRlY3RlZCwgc28gd2UgdG9nZ2xlIHBsYXliYWNrIGFuZCB3YWl0IHdoYXQgaGFwcGVucyBuZXh0XHJcbiAgICAgICAgICAgICAgICAgICAgdG9nZ2xlUGxheWJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSGlkZSB0aGUgaHVnZSBwbGF5YmFjayBidXR0b24gZHVyaW5nIFZSIHBsYXliYWNrIHRvIGxldCBtb3VzZSBldmVudHMgcGFzcyB0aHJvdWdoIGFuZCBuYXZpZ2F0ZSB0aGUgVlIgdmlld3BvcnRcclxuICAgICAgICBzZWxmLm9uVG9nZ2xlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5jb250ZW50VHlwZSAhPT0gXCJub25lXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNQbGF5aW5nKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSGlkZSBidXR0b24gd2hpbGUgaW5pdGlhbGl6aW5nIGEgQ2FzdCBzZXNzaW9uXHJcbiAgICAgICAgbGV0IGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IFBsYXllckV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudC50eXBlID09PSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgLy8gSGlkZSBidXR0b24gd2hlbiBzZXNzaW9uIGlzIGJlaW5nIGluaXRpYWxpemVkXHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIFNob3cgYnV0dG9uIHdoZW4gc2Vzc2lvbiBpcyBlc3RhYmxpc2hlZCBvciBpbml0aWFsaXphdGlvbiB3YXMgYWJvcnRlZFxyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RBUlQsIGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfTEFVTkNIRUQsIGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RPUCwgY2FzdEluaXRpYWxpemF0aW9uSGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBidXR0b25FbGVtZW50ID0gc3VwZXIudG9Eb21FbGVtZW50KCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBjaGlsZCB0aGF0IGNvbnRhaW5zIHRoZSBwbGF5IGJ1dHRvbiBpbWFnZVxyXG4gICAgICAgIC8vIFNldHRpbmcgdGhlIGltYWdlIGRpcmVjdGx5IG9uIHRoZSBidXR0b24gZG9lcyBub3Qgd29yayB0b2dldGhlciB3aXRoIHNjYWxpbmcgYW5pbWF0aW9ucywgYmVjYXVzZSB0aGUgYnV0dG9uXHJcbiAgICAgICAgLy8gY2FuIGNvdmVyIHRoZSB3aG9sZSB2aWRlbyBwbGF5ZXIgYXJlIGFuZCBzY2FsaW5nIHdvdWxkIGV4dGVuZCBpdCBiZXlvbmQuIEJ5IGFkZGluZyBhbiBpbm5lciBlbGVtZW50LCBjb25maW5lZFxyXG4gICAgICAgIC8vIHRvIHRoZSBzaXplIGlmIHRoZSBpbWFnZSwgaXQgY2FuIHNjYWxlIGluc2lkZSB0aGUgcGxheWVyIHdpdGhvdXQgb3ZlcnNob290aW5nLlxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQuYXBwZW5kKG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IFwiaW1hZ2VcIlxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBMYWJlbH0gY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMYWJlbENvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0IG9uIHRoZSBsYWJlbC5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc2ltcGxlIHRleHQgbGFiZWwuXHJcbiAqXHJcbiAqIERPTSBleGFtcGxlOlxyXG4gKiA8Y29kZT5cclxuICogICAgIDxzcGFuIGNsYXNzPVwidWktbGFiZWxcIj4uLi5zb21lIHRleHQuLi48L3NwYW4+XHJcbiAqIDwvY29kZT5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBMYWJlbDxDb25maWcgZXh0ZW5kcyBMYWJlbENvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8TGFiZWxDb25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExhYmVsQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWxhYmVsXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBsYWJlbEVsZW1lbnQgPSBuZXcgRE9NKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KS5odG1sKHRoaXMuY29uZmlnLnRleHQpO1xyXG5cclxuICAgICAgICByZXR1cm4gbGFiZWxFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB0ZXh0IG9uIHRoaXMgbGFiZWwuXHJcbiAgICAgKiBAcGFyYW0gdGV4dFxyXG4gICAgICovXHJcbiAgICBzZXRUZXh0KHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmh0bWwodGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIHRleHQgb24gdGhpcyBsYWJlbC5cclxuICAgICAqL1xyXG4gICAgY2xlYXJUZXh0KCkge1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmh0bWwoXCJcIik7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgRXZlbnR9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIG1hcCBvZiBpdGVtcyAoa2V5L3ZhbHVlIC0+IGxhYmVsfSBmb3IgYSB7QGxpbmsgTGlzdFNlbGVjdG9yfSBpbiBhIHtAbGluayBMaXN0U2VsZWN0b3JDb25maWd9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMaXN0SXRlbUNvbGxlY3Rpb24ge1xyXG4gICAgLy8ga2V5IC0+IGxhYmVsIG1hcHBpbmdcclxuICAgIFtrZXk6IHN0cmluZ106IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBMaXN0U2VsZWN0b3J9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMaXN0U2VsZWN0b3JDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgaXRlbXM/OiBMaXN0SXRlbUNvbGxlY3Rpb247XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMaXN0U2VsZWN0b3I8Q29uZmlnIGV4dGVuZHMgTGlzdFNlbGVjdG9yQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxMaXN0U2VsZWN0b3JDb25maWc+IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgaXRlbXM6IExpc3RJdGVtQ29sbGVjdGlvbjtcclxuICAgIHByb3RlY3RlZCBzZWxlY3RlZEl0ZW06IHN0cmluZztcclxuXHJcbiAgICBwcml2YXRlIGxpc3RTZWxlY3RvckV2ZW50cyA9IHtcclxuICAgICAgICBvbkl0ZW1BZGRlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPigpLFxyXG4gICAgICAgIG9uSXRlbVJlbW92ZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKSxcclxuICAgICAgICBvbkl0ZW1TZWxlY3RlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiB7fSxcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktbGlzdHNlbGVjdG9yXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLmNvbmZpZy5pdGVtcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIGl0ZW0gaXMgcGFydCBvZiB0aGlzIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIGtleSB0aGUga2V5IG9mIHRoZSBpdGVtIHRvIGNoZWNrXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgaXRlbSBpcyBwYXJ0IG9mIHRoaXMgc2VsZWN0b3IsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaGFzSXRlbShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLml0ZW1zW2tleV0gIT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gaXRlbSB0byB0aGlzIHNlbGVjdG9yIGJ5IGFwcGVuZGluZyBpdCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0IG9mIGl0ZW1zLlxyXG4gICAgICogQHBhcmFtIGtleSB0aGUga2V5ICBvZiB0aGUgaXRlbSB0byBhZGRcclxuICAgICAqIEBwYXJhbSBsYWJlbCB0aGUgKGh1bWFuLXJlYWRhYmxlKSBsYWJlbCBvZiB0aGUgaXRlbSB0byBhZGRcclxuICAgICAqL1xyXG4gICAgYWRkSXRlbShrZXk6IHN0cmluZywgbGFiZWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuaXRlbXNba2V5XSA9IGxhYmVsO1xyXG4gICAgICAgIHRoaXMub25JdGVtQWRkZWRFdmVudChrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBpdGVtIGZyb20gdGhpcyBzZWxlY3Rvci5cclxuICAgICAqIEBwYXJhbSBrZXkgdGhlIGtleSBvZiB0aGUgaXRlbSB0byByZW1vdmVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHJlbW92YWwgd2FzIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIHRoZSBpdGVtIGlzIG5vdCBwYXJ0IG9mIHRoaXMgc2VsZWN0b3JcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlSXRlbShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLmhhc0l0ZW0oa2V5KSkge1xyXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5pdGVtc1trZXldO1xyXG4gICAgICAgICAgICB0aGlzLm9uSXRlbVJlbW92ZWRFdmVudChrZXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbGVjdHMgYW4gaXRlbSBmcm9tIHRoZSBpdGVtcyBpbiB0aGlzIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIGtleSB0aGUga2V5IG9mIHRoZSBpdGVtIHRvIHNlbGVjdFxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaXMgdGhlIHNlbGVjdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IHBhcnQgb2YgdGhlIHNlbGVjdG9yXHJcbiAgICAgKi9cclxuICAgIHNlbGVjdEl0ZW0oa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoa2V5ID09PSB0aGlzLnNlbGVjdGVkSXRlbSkge1xyXG4gICAgICAgICAgICAvLyBpdGVtQ29uZmlnIGlzIGFscmVhZHkgc2VsZWN0ZWQsIHN1cHByZXNzIGFueSBmdXJ0aGVyIGFjdGlvblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLml0ZW1zW2tleV0gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbSA9IGtleTtcclxuICAgICAgICAgICAgdGhpcy5vbkl0ZW1TZWxlY3RlZEV2ZW50KGtleSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUga2V5IG9mIHRoZSBzZWxlY3RlZCBpdGVtLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIGtleSBvZiB0aGUgc2VsZWN0ZWQgaXRlbSBvciBudWxsIGlmIG5vIGl0ZW0gaXMgc2VsZWN0ZWRcclxuICAgICAqL1xyXG4gICAgZ2V0U2VsZWN0ZWRJdGVtKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGVkSXRlbTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYWxsIGl0ZW1zIGZyb20gdGhpcyBzZWxlY3Rvci5cclxuICAgICAqL1xyXG4gICAgY2xlYXJJdGVtcygpIHtcclxuICAgICAgICBsZXQgaXRlbXMgPSB0aGlzLml0ZW1zOyAvLyBsb2NhbCBjb3B5IGZvciBpdGVyYXRpb24gYWZ0ZXIgY2xlYXJcclxuICAgICAgICB0aGlzLml0ZW1zID0ge307IC8vIGNsZWFyIGl0ZW1zXHJcblxyXG4gICAgICAgIC8vIGZpcmUgZXZlbnRzXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25JdGVtUmVtb3ZlZEV2ZW50KGtleSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGl0ZW1zIGluIHRoaXMgc2VsZWN0b3IuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBpdGVtQ291bnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5pdGVtcykubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1BZGRlZEV2ZW50KGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtQWRkZWQuZGlzcGF0Y2godGhpcywga2V5KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25JdGVtUmVtb3ZlZEV2ZW50KGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtUmVtb3ZlZC5kaXNwYXRjaCh0aGlzLCBrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1TZWxlY3RlZEV2ZW50KGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtU2VsZWN0ZWQuZGlzcGF0Y2godGhpcywga2V5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBhbiBpdGVtIGlzIGFkZGVkIHRvIHRoZSBsaXN0IG9mIGl0ZW1zLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbkl0ZW1BZGRlZCgpOiBFdmVudDxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbUFkZGVkLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gYW4gaXRlbSBpcyByZW1vdmVkIGZyb20gdGhlIGxpc3Qgb2YgaXRlbXMuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uSXRlbVJlbW92ZWQoKTogRXZlbnQ8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1SZW1vdmVkLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gYW4gaXRlbSBpcyBzZWxlY3RlZCBmcm9tIHRoZSBsaXN0IG9mIGl0ZW1zLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbkl0ZW1TZWxlY3RlZCgpOiBFdmVudDxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbVNlbGVjdGVkLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7TGFiZWxDb25maWcsIExhYmVsfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBBIGxhYmVsIHRoYXQgZGlzcGxheSB0aGUgY3VycmVudCBwbGF5YmFjayB0aW1lIGFuZCB0aGUgdG90YWwgdGltZSB0aHJvdWdoIHtAbGluayBQbGF5YmFja1RpbWVMYWJlbCNzZXRUaW1lIHNldFRpbWV9XHJcbiAqIG9yIGFueSBzdHJpbmcgdGhyb3VnaCB7QGxpbmsgUGxheWJhY2tUaW1lTGFiZWwjc2V0VGV4dCBzZXRUZXh0fS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQbGF5YmFja1RpbWVMYWJlbCBleHRlbmRzIExhYmVsPExhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHBsYXliYWNrVGltZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0RHVyYXRpb24oKSA9PT0gSW5maW5pdHkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGV4dChcIkxpdmVcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWUocGxheWVyLmdldEN1cnJlbnRUaW1lKCksIHBsYXllci5nZXREdXJhdGlvbigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFS0VELCBwbGF5YmFja1RpbWVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1RJTUVfVVBEQVRFLCBwbGF5YmFja1RpbWVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCB0aW1lIGRpc3BsYXkgKHdoZW4gdGhlIFVJIGlzIGluaXRpYWxpemVkLCBpdCdzIHRvbyBsYXRlIGZvciB0aGUgT05fUkVBRFkgZXZlbnQpXHJcbiAgICAgICAgcGxheWJhY2tUaW1lSGFuZGxlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgY3VycmVudCBwbGF5YmFjayB0aW1lIGFuZCB0b3RhbCBkdXJhdGlvbi5cclxuICAgICAqIEBwYXJhbSBwbGF5YmFja1NlY29uZHMgdGhlIGN1cnJlbnQgcGxheWJhY2sgdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgKiBAcGFyYW0gZHVyYXRpb25TZWNvbmRzIHRoZSB0b3RhbCBkdXJhdGlvbiBpbiBzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIHNldFRpbWUocGxheWJhY2tTZWNvbmRzOiBudW1iZXIsIGR1cmF0aW9uU2Vjb25kczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KGAke1N0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUocGxheWJhY2tTZWNvbmRzKX0gLyAke1N0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUoZHVyYXRpb25TZWNvbmRzKX1gKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBQbGF5ZXJFdmVudCA9IGJpdG1vdmluLnBsYXllci5QbGF5ZXJFdmVudDtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgYmV0d2VlbiBwbGF5YmFjayBhbmQgcGF1c2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGxheWJhY2tUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktcGxheWJhY2t0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJQbGF5L1BhdXNlXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIsIGhhbmRsZUNsaWNrRXZlbnQ6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBpc1NlZWtpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gSGFuZGxlciB0byB1cGRhdGUgYnV0dG9uIHN0YXRlIGJhc2VkIG9uIHBsYXllciBzdGF0ZVxyXG4gICAgICAgIGxldCBwbGF5YmFja1N0YXRlSGFuZGxlciA9IGZ1bmN0aW9uIChldmVudDogUGxheWVyRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIFVJIGlzIGN1cnJlbnRseSBzZWVraW5nLCBwbGF5YmFjayBpcyB0ZW1wb3JhcmlseSBzdG9wcGVkIGJ1dCB0aGUgYnV0dG9ucyBzaG91bGRcclxuICAgICAgICAgICAgLy8gbm90IHJlZmxlY3QgdGhhdCBhbmQgc3RheSBhcy1pcyAoZS5nIGluZGljYXRlIHBsYXliYWNrIHdoaWxlIHNlZWtpbmcpLlxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE8gcmVwbGFjZSB0aGlzIGhhY2sgd2l0aCBhIHNvbGUgcGxheWVyLmlzUGxheWluZygpIGNhbGwgb25jZSBpc3N1ZSAjMTIwMyBpcyBmaXhlZFxyXG4gICAgICAgICAgICBsZXQgaXNQbGF5aW5nID0gcGxheWVyLmlzUGxheWluZygpO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzQ2FzdGluZygpICYmXHJcbiAgICAgICAgICAgICAgICAoZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVkgfHwgZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVlcclxuICAgICAgICAgICAgICAgIHx8IGV2ZW50LnR5cGUgPT09IGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1BMQVlJTkcgfHwgZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUEFVU0UpKSB7XHJcbiAgICAgICAgICAgICAgICBpc1BsYXlpbmcgPSAhaXNQbGF5aW5nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gQ2FsbCBoYW5kbGVyIHVwb24gdGhlc2UgZXZlbnRzXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWSwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BBVVNFLCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWUJBQ0tfRklOSVNIRUQsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTsgLy8gd2hlbiBwbGF5YmFjayBmaW5pc2hlcywgcGxheWVyIHR1cm5zIHRvIHBhdXNlZCBtb2RlXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9MQVVOQ0hFRCwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUExBWUlORywgcGxheWJhY2tTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUEFVU0UsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1BMQVlCQUNLX0ZJTklTSEVELCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcblxyXG4gICAgICAgIGlmIChoYW5kbGVDbGlja0V2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIENvbnRyb2wgcGxheWVyIGJ5IGJ1dHRvbiBldmVudHNcclxuICAgICAgICAgICAgLy8gV2hlbiBhIGJ1dHRvbiBldmVudCB0cmlnZ2VycyBhIHBsYXllciBBUEkgY2FsbCwgZXZlbnRzIGFyZSBmaXJlZCB3aGljaCBpbiB0dXJuIGNhbGwgdGhlIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgICAgLy8gYWJvdmUgdGhhdCB1cGRhdGVkIHRoZSBidXR0b24gc3RhdGUuXHJcbiAgICAgICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5pc1BsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5wYXVzZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyYWNrIFVJIHNlZWtpbmcgc3RhdHVzXHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vblNlZWtlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge1VJTWFuYWdlciwgVUlSZWNvbW1lbmRhdGlvbkNvbmZpZ30gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIGFuZCBkaXNwbGF5cyByZWNvbW1lbmRlZCB2aWRlb3MuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmVjb21tZW5kYXRpb25PdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29udGFpbmVyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXJlY29tbWVuZGF0aW9uLW92ZXJsYXlcIixcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoIXVpbWFuYWdlci5nZXRDb25maWcoKSB8fCAhdWltYW5hZ2VyLmdldENvbmZpZygpLnJlY29tbWVuZGF0aW9ucyB8fCB1aW1hbmFnZXIuZ2V0Q29uZmlnKCkucmVjb21tZW5kYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgbm8gcmVjb21tZW5kYXRpb24gaXRlbXMsIHNvIGRvbid0IG5lZWQgdG8gY29uZmlndXJlIGFueXRoaW5nXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdWltYW5hZ2VyLmdldENvbmZpZygpLnJlY29tbWVuZGF0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudChuZXcgUmVjb21tZW5kYXRpb25JdGVtKHtpdGVtQ29uZmlnOiBpdGVtfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudHMoKTsgLy8gY3JlYXRlIGNvbnRhaW5lciBET00gZWxlbWVudHNcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSByZWNvbW1lbmRhdGlvbnMgd2hlbiBwbGF5YmFjayBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZQkFDS19GSU5JU0hFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBIaWRlIHJlY29tbWVuZGF0aW9ucyB3aGVuIHBsYXliYWNrIHN0YXJ0cywgZS5nLiBhIHJlc3RhcnRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgUmVjb21tZW5kYXRpb25JdGVtfVxyXG4gKi9cclxuaW50ZXJmYWNlIFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICBpdGVtQ29uZmlnOiBVSVJlY29tbWVuZGF0aW9uQ29uZmlnO1xyXG59XHJcblxyXG4vKipcclxuICogQW4gaXRlbSBvZiB0aGUge0BsaW5rIFJlY29tbWVuZGF0aW9uT3ZlcmxheX0uIFVzZWQgb25seSBpbnRlcm5hbGx5IGluIHtAbGluayBSZWNvbW1lbmRhdGlvbk92ZXJsYXl9LlxyXG4gKi9cclxuY2xhc3MgUmVjb21tZW5kYXRpb25JdGVtIGV4dGVuZHMgQ29tcG9uZW50PFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUmVjb21tZW5kYXRpb25JdGVtQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1yZWNvbW1lbmRhdGlvbi1pdGVtXCIsXHJcbiAgICAgICAgICAgIGl0ZW1Db25maWc6IG51bGwgLy8gdGhpcyBtdXN0IGJlIHBhc3NlZCBpbiBmcm9tIG91dHNpZGVcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBjb25maWcgPSAoPFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZz50aGlzLmNvbmZpZykuaXRlbUNvbmZpZzsgLy8gVE9ETyBmaXggZ2VuZXJpY3MgYW5kIGdldCByaWQgb2YgY2FzdFxyXG5cclxuICAgICAgICBsZXQgaXRlbUVsZW1lbnQgPSBuZXcgRE9NKFwiYVwiLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKCksXHJcbiAgICAgICAgICAgIFwiaHJlZlwiOiBjb25maWcudXJsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBiZ0VsZW1lbnQgPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInRodW1ibmFpbFwiXHJcbiAgICAgICAgfSkuY3NzKHtcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke2NvbmZpZy50aHVtYm5haWx9KWB9KTtcclxuICAgICAgICBpdGVtRWxlbWVudC5hcHBlbmQoYmdFbGVtZW50KTtcclxuXHJcbiAgICAgICAgbGV0IHRpdGxlRWxlbWVudCA9IG5ldyBET00oXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInRpdGxlXCJcclxuICAgICAgICB9KS5odG1sKGNvbmZpZy50aXRsZSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKHRpdGxlRWxlbWVudCk7XHJcblxyXG4gICAgICAgIGxldCB0aW1lRWxlbWVudCA9IG5ldyBET00oXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImR1cmF0aW9uXCJcclxuICAgICAgICB9KS5odG1sKFN0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUoY29uZmlnLmR1cmF0aW9uKSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKHRpbWVFbGVtZW50KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGl0ZW1FbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtFdmVudCwgRXZlbnREaXNwYXRjaGVyLCBOb0FyZ3N9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtTZWVrQmFyTGFiZWx9IGZyb20gXCIuL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFNlZWtCYXJ9IGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vla0JhckNvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsYWJlbCBhYm92ZSB0aGUgc2VlayBwb3NpdGlvbi5cclxuICAgICAqL1xyXG4gICAgbGFiZWw/OiBTZWVrQmFyTGFiZWw7XHJcbiAgICAvKipcclxuICAgICAqIEJhciB3aWxsIGJlIHZlcnRpY2FsIGluc3RlYWQgb2YgaG9yaXpvbnRhbCBpZiBzZXQgdG8gdHJ1ZS5cclxuICAgICAqL1xyXG4gICAgdmVydGljYWw/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRXZlbnQgYXJndW1lbnQgaW50ZXJmYWNlIGZvciBhIHNlZWsgcHJldmlldyBldmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vla1ByZXZpZXdFdmVudEFyZ3MgZXh0ZW5kcyBOb0FyZ3Mge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxscyBpZiB0aGUgc2VlayBwcmV2aWV3IGV2ZW50IGNvbWVzIGZyb20gYSBzY3J1YmJpbmcuXHJcbiAgICAgKi9cclxuICAgIHNjcnViYmluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbWVsaW5lIHBvc2l0aW9uIGluIHBlcmNlbnQgd2hlcmUgdGhlIGV2ZW50IG9yaWdpbmF0ZXMgZnJvbS5cclxuICAgICAqL1xyXG4gICAgcG9zaXRpb246IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc2VlayBiYXIgdG8gc2VlayB3aXRoaW4gdGhlIHBsYXllcidzIG1lZGlhLiBJdCBkaXNwbGF5cyB0aGUgcHVycmVudCBwbGF5YmFjayBwb3NpdGlvbiwgYW1vdW50IG9mIGJ1ZmZlZCBkYXRhLCBzZWVrXHJcbiAqIHRhcmdldCwgYW5kIGtlZXBzIHN0YXR1cyBhYm91dCBhbiBvbmdvaW5nIHNlZWsuXHJcbiAqXHJcbiAqIFRoZSBzZWVrIGJhciBkaXNwbGF5cyBkaWZmZXJlbnQgXCJiYXJzXCI6XHJcbiAqICAtIHRoZSBwbGF5YmFjayBwb3NpdGlvbiwgaS5lLiB0aGUgcG9zaXRpb24gaW4gdGhlIG1lZGlhIGF0IHdoaWNoIHRoZSBwbGF5ZXIgY3VycmVudCBwbGF5YmFjayBwb2ludGVyIGlzIHBvc2l0aW9uZWRcclxuICogIC0gdGhlIGJ1ZmZlciBwb3NpdGlvbiwgd2hpY2ggdXN1YWxseSBpcyB0aGUgcGxheWJhY2sgcG9zaXRpb24gcGx1cyB0aGUgdGltZSBzcGFuIHRoYXQgaXMgYWxyZWFkeSBidWZmZXJlZCBhaGVhZFxyXG4gKiAgLSB0aGUgc2VlayBwb3NpdGlvbiwgdXNlZCB0byBwcmV2aWV3IHRvIHdoZXJlIGluIHRoZSB0aW1lbGluZSBhIHNlZWsgd2lsbCBqdW1wIHRvXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2Vla0JhciBleHRlbmRzIENvbXBvbmVudDxTZWVrQmFyQ29uZmlnPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgQ1NTIGNsYXNzIHRoYXQgaXMgYWRkZWQgdG8gdGhlIERPTSBlbGVtZW50IHdoaWxlIHRoZSBzZWVrIGJhciBpcyBpbiBcInNlZWtpbmdcIiBzdGF0ZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ0xBU1NfU0VFS0lORyA9IFwic2Vla2luZ1wiO1xyXG5cclxuICAgIHByaXZhdGUgc2Vla0JhcjogRE9NO1xyXG4gICAgcHJpdmF0ZSBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbjogRE9NO1xyXG4gICAgcHJpdmF0ZSBzZWVrQmFyQnVmZmVyUG9zaXRpb246IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhclNlZWtQb3NpdGlvbjogRE9NO1xyXG4gICAgcHJpdmF0ZSBzZWVrQmFyQmFja2Ryb3A6IERPTTtcclxuXHJcbiAgICBwcml2YXRlIGxhYmVsOiBTZWVrQmFyTGFiZWw7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWVrQmFyRXZlbnRzID0ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBvcGVyYXRpb24gaXMgc3RhcnRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWs6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIGR1cmluZyBhIHNjcnViYmluZyBzZWVrIHRvIGluZGljYXRlIHRoYXQgdGhlIHNlZWsgcHJldmlldyAoaS5lLiB0aGUgdmlkZW8gZnJhbWUpIHNob3VsZCBiZSB1cGRhdGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla1ByZXZpZXc6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgU2Vla1ByZXZpZXdFdmVudEFyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZWQgd2hlbiBhIHNjcnViYmluZyBzZWVrIGhhcyBmaW5pc2hlZCBvciB3aGVuIGEgZGlyZWN0IHNlZWsgaXMgaXNzdWVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla2VkOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIG51bWJlcj4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktc2Vla2JhclwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gdGhpcy5jb25maWcubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0xhYmVsKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRMYWJlbCgpLmluaXRpYWxpemUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHBsYXliYWNrTm90SW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIGxldCBpc1BsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICBsZXQgaXNTZWVraW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5YmFjayBhbmQgYnVmZmVyIHBvc2l0aW9uc1xyXG4gICAgICAgIGxldCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gT25jZSB0aGlzIGhhbmRsZXIgb3MgY2FsbGVkLCBwbGF5YmFjayBoYXMgYmVlbiBzdGFydGVkIGFuZCB3ZSBzZXQgdGhlIGZsYWcgdG8gZmFsc2VcclxuICAgICAgICAgICAgcGxheWJhY2tOb3RJbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzU2Vla2luZykge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgY2F1Z2h0IGEgc2VlayBwcmV2aWV3IHNlZWssIGRvIG5vdCB1cGRhdGUgdGhlIHNlZWtiYXJcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0xpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2FzZSBtdXN0IGJlIGV4cGxpY2l0bHkgaGFuZGxlZCB0byBhdm9pZCBkaXZpc2lvbiBieSB6ZXJvXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKDEwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UgPSAxMDAgLSAoMTAwIC8gcGxheWVyLmdldE1heFRpbWVTaGlmdCgpICogcGxheWVyLmdldFRpbWVTaGlmdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFsd2F5cyBzaG93IGZ1bGwgYnVmZmVyIGZvciBsaXZlIHN0cmVhbXNcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24oMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5YmFja1Bvc2l0aW9uUGVyY2VudGFnZSA9IDEwMCAvIHBsYXllci5nZXREdXJhdGlvbigpICogcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWZmZXJQZXJjZW50YWdlID0gMTAwIC8gcGxheWVyLmdldER1cmF0aW9uKCkgKiBwbGF5ZXIuZ2V0VmlkZW9CdWZmZXJMZW5ndGgoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UgKyBidWZmZXJQZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IGZsYWcgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgICAgIHBsYXliYWNrTm90SW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc2Vla2JhciB1cG9uIHRoZXNlIGV2ZW50c1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgcGxheWJhY2sgcG9zaXRpb24gd2hlbiBpdCBjaGFuZ2VzXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1RPUF9CVUZGRVJJTkcsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIGJ1ZmZlcmxldmVsIHdoZW4gYnVmZmVyaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFS0VELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBwbGF5YmFjayBwb3NpdGlvbiB3aGVuIGEgc2VlayBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZURUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIHBsYXliYWNrIHBvc2l0aW9uIHdoZW4gYSB0aW1lc2hpZnQgaGFzIGZpbmlzaGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VHTUVOVF9SRVFVRVNUX0ZJTklTSEVELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBidWZmZXJsZXZlbCB3aGVuIGEgc2VnbWVudCBoYXMgYmVlbiBkb3dubG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURSwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgcGxheWJhY2sgcG9zaXRpb24gb2YgQ2FzdCBwbGF5YmFja1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLRUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZULCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZURUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHNlZWsgPSBmdW5jdGlvbiAocGVyY2VudGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNMaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci50aW1lU2hpZnQocGxheWVyLmdldE1heFRpbWVTaGlmdCgpIC0gKHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIChwZXJjZW50YWdlIC8gMTAwKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnNlZWsocGxheWVyLmdldER1cmF0aW9uKCkgKiAocGVyY2VudGFnZSAvIDEwMCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSB0cnVlOyAvLyB0cmFjayBzZWVraW5nIHN0YXR1cyBzbyB3ZSBjYW4gY2F0Y2ggZXZlbnRzIGZyb20gc2VlayBwcmV2aWV3IHNlZWtzXHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZnkgVUkgbWFuYWdlciBvZiBzdGFydGVkIHNlZWtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5kaXNwYXRjaChzZW5kZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2F2ZSBjdXJyZW50IHBsYXliYWNrIHN0YXRlXHJcbiAgICAgICAgICAgIGlzUGxheWluZyA9IHBsYXllci5pc1BsYXlpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFBhdXNlIHBsYXliYWNrIHdoaWxlIHNlZWtpbmdcclxuICAgICAgICAgICAgaWYgKGlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IFNlZWtCYXIsIGFyZ3M6IFNlZWtQcmV2aWV3RXZlbnRBcmdzKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGlmeSBVSSBtYW5hZ2VyIG9mIHNlZWsgcHJldmlld1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25TZWVrUHJldmlldy5kaXNwYXRjaChzZW5kZXIsIGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYub25TZWVrUHJldmlldy5zdWJzY3JpYmVSYXRlTGltaXRlZChmdW5jdGlvbiAoc2VuZGVyOiBTZWVrQmFyLCBhcmdzOiBTZWVrUHJldmlld0V2ZW50QXJncykge1xyXG4gICAgICAgICAgICAvLyBSYXRlLWxpbWl0ZWQgc2NydWJiaW5nIHNlZWtcclxuICAgICAgICAgICAgaWYgKGFyZ3Muc2NydWJiaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBzZWVrKGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICBzZWxmLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBwZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgcGxheWJhY2sgaGFzIG5vdCBiZWVuIHN0YXJ0ZWQgYmVmb3JlLCB3ZSBuZWVkIHRvIGNhbGwgcGxheSB0byBpbiBpdCB0aGUgcGxheWJhY2sgZW5naW5lIGZvciB0aGVcclxuICAgICAgICAgICAgLy8gc2VlayB0byB3b3JrLiBXZSBjYWxsIHBhdXNlKCkgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkcyBiZWNhdXNlIHdlIGFjdHVhbGx5IGRvIG5vdCB3YW50IHRvIHBsYXkgYmFjayBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZsYWcgc2VydmVzIHRvIGNhbGwgcGxheS9wYXVzZSBvbmx5IG9uIHRoZSBmaXJzdCBzZWVrIGJlZm9yZSBwbGF5YmFjayBoYXMgc3RhcnRlZCwgaW5zdGVhZCBvZiBldmVyeVxyXG4gICAgICAgICAgICAvLyB0aW1lIGEgc2VlayBpcyBpc3N1ZWQuXHJcbiAgICAgICAgICAgIGlmIChwbGF5YmFja05vdEluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5YmFja05vdEluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERvIHRoZSBzZWVrXHJcbiAgICAgICAgICAgIHNlZWsocGVyY2VudGFnZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDb250aW51ZSBwbGF5YmFjayBhZnRlciBzZWVrIGlmIHBsYXllciB3YXMgcGxheWluZyB3aGVuIHNlZWsgc3RhcnRlZFxyXG4gICAgICAgICAgICBpZiAoaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZnkgVUkgbWFuYWdlciBvZiBmaW5pc2hlZCBzZWVrXHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vblNlZWtlZC5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoc2VsZi5oYXNMYWJlbCgpKSB7XHJcbiAgICAgICAgICAgIC8vIENvbmZpZ3VyZSBhIHNlZWtiYXIgbGFiZWwgdGhhdCBpcyBpbnRlcm5hbCB0byB0aGUgc2Vla2JhcilcclxuICAgICAgICAgICAgc2VsZi5nZXRMYWJlbCgpLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maWcudmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcuY3NzQ2xhc3Nlcy5wdXNoKFwidmVydGljYWxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2Vla0JhckNvbnRhaW5lciA9IG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBzZWVrQmFyID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJzZWVrYmFyXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXIgPSBzZWVrQmFyO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93cyB0aGUgYnVmZmVyIGZpbGwgbGV2ZWxcclxuICAgICAgICBsZXQgc2Vla0JhckJ1ZmZlckxldmVsID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJzZWVrYmFyLWJ1ZmZlcmxldmVsXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXJCdWZmZXJQb3NpdGlvbiA9IHNlZWtCYXJCdWZmZXJMZXZlbDtcclxuXHJcbiAgICAgICAgLy8gSW5kaWNhdG9yIHRoYXQgc2hvd3MgdGhlIGN1cnJlbnQgcGxheWJhY2sgcG9zaXRpb25cclxuICAgICAgICBsZXQgc2Vla0JhclBsYXliYWNrUG9zaXRpb24gPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInNlZWtiYXItcGxheWJhY2twb3NpdGlvblwiXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyUGxheWJhY2tQb3NpdGlvbiA9IHNlZWtCYXJQbGF5YmFja1Bvc2l0aW9uO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93IHdoZXJlIGEgc2VlayB3aWxsIGdvIHRvXHJcbiAgICAgICAgbGV0IHNlZWtCYXJTZWVrUG9zaXRpb24gPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInNlZWtiYXItc2Vla3Bvc2l0aW9uXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXJTZWVrUG9zaXRpb24gPSBzZWVrQmFyU2Vla1Bvc2l0aW9uO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93cyB0aGUgZnVsbCBzZWVrYmFyXHJcbiAgICAgICAgbGV0IHNlZWtCYXJCYWNrZHJvcCA9IG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IFwic2Vla2Jhci1iYWNrZHJvcFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyQmFja2Ryb3AgPSBzZWVrQmFyQmFja2Ryb3A7XHJcblxyXG4gICAgICAgIHNlZWtCYXIuYXBwZW5kKHNlZWtCYXJCYWNrZHJvcCwgc2Vla0JhckJ1ZmZlckxldmVsLCBzZWVrQmFyU2Vla1Bvc2l0aW9uLCBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgLy8gRGVmaW5lIGhhbmRsZXIgZnVuY3Rpb25zIHNvIHdlIGNhbiBhdHRhY2gvcmVtb3ZlIHRoZW0gbGF0ZXJcclxuICAgICAgICBsZXQgbW91c2VNb3ZlSGFuZGxlciA9IGZ1bmN0aW9uIChlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXRQZXJjZW50YWdlID0gMTAwICogc2VsZi5nZXRNb3VzZU9mZnNldChlKTtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVrUG9zaXRpb24odGFyZ2V0UGVyY2VudGFnZSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbih0YXJnZXRQZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgc2VsZi5vblNlZWtQcmV2aWV3RXZlbnQodGFyZ2V0UGVyY2VudGFnZSwgdHJ1ZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgbW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgaGFuZGxlcnMsIHNlZWsgb3BlcmF0aW9uIGlzIGZpbmlzaGVkXHJcbiAgICAgICAgICAgIG5ldyBET00oZG9jdW1lbnQpLm9mZihcIm1vdXNlbW92ZVwiLCBtb3VzZU1vdmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub2ZmKFwibW91c2V1cFwiLCBtb3VzZVVwSGFuZGxlcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0UGVyY2VudGFnZSA9IDEwMCAqIHNlbGYuZ2V0TW91c2VPZmZzZXQoZSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgLy8gRmlyZSBzZWVrZWQgZXZlbnRcclxuICAgICAgICAgICAgc2VsZi5vblNlZWtlZEV2ZW50KHRhcmdldFBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEEgc2VlayBhbHdheXMgc3RhcnQgd2l0aCBhIG1vdXNlZG93biBkaXJlY3RseSBvbiB0aGUgc2Vla2Jhci4gVG8gdHJhY2sgYSBzZWVrIGFsc28gb3V0c2lkZSB0aGUgc2Vla2JhclxyXG4gICAgICAgIC8vIChzbyB0aGUgdXNlciBkb2VzIG5vdCBuZWVkIHRvIHRha2UgY2FyZSB0aGF0IHRoZSBtb3VzZSBhbHdheXMgc3RheXMgb24gdGhlIHNlZWtiYXIpLCB3ZSBhdHRhY2ggdGhlIG1vdXNlbW92ZVxyXG4gICAgICAgIC8vIGFuZCBtb3VzZXVwIGhhbmRsZXJzIHRvIHRoZSB3aG9sZSBkb2N1bWVudC4gQSBzZWVrIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSB1c2VyIGxpZnRzIHRoZSBtb3VzZSBrZXkuXHJcbiAgICAgICAgLy8gQSBzZWVrIG1vdXNlIGdlc3R1cmUgaXMgdGh1cyBiYXNpY2FsbHkgYSBjbGljayB3aXRoIGEgbG9uZyB0aW1lIGZyYW1lIGJldHdlZW4gZG93biBhbmQgdXAgZXZlbnRzLlxyXG4gICAgICAgIHNlZWtCYXIub24oXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24gKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gUHJldmVudCBzZWxlY3Rpb24gb2YgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpcmUgc2Vla2VkIGV2ZW50XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrRXZlbnQoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBoYW5kbGVyIHRvIHRyYWNrIHRoZSBzZWVrIG9wZXJhdGlvbiBvdmVyIHRoZSB3aG9sZSBkb2N1bWVudFxyXG4gICAgICAgICAgICBuZXcgRE9NKGRvY3VtZW50KS5vbihcIm1vdXNlbW92ZVwiLCBtb3VzZU1vdmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub24oXCJtb3VzZXVwXCIsIG1vdXNlVXBIYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSBzZWVrIHRhcmdldCBpbmRpY2F0b3Igd2hlbiBtb3VzZSBob3ZlcnMgb3ZlciBzZWVrYmFyXHJcbiAgICAgICAgc2Vla0Jhci5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBsZXQgcG9zaXRpb24gPSAxMDAgKiBzZWxmLmdldE1vdXNlT2Zmc2V0KGUpO1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtQb3NpdGlvbihwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrUHJldmlld0V2ZW50KHBvc2l0aW9uLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5oYXNMYWJlbCgpICYmIHNlbGYuZ2V0TGFiZWwoKS5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldExhYmVsKCkuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgc2VlayB0YXJnZXQgaW5kaWNhdG9yIHdoZW4gbW91c2UgbGVhdmVzIHNlZWtiYXJcclxuICAgICAgICBzZWVrQmFyLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtQb3NpdGlvbigwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmhhc0xhYmVsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0TGFiZWwoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2Vla0JhckNvbnRhaW5lci5hcHBlbmQoc2Vla0Jhcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIHNlZWtCYXJDb250YWluZXIuYXBwZW5kKHRoaXMubGFiZWwuZ2V0RG9tRWxlbWVudCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWVrQmFyQ29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgaG9yaXpvbnRhbCBtb3VzZSBvZmZzZXQgZnJvbSB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzZWVrIGJhci5cclxuICAgICAqIEBwYXJhbSBlIHRoZSBldmVudCB0byBjYWxjdWxhdGUgdGhlIG9mZnNldCBmcm9tXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBhIG51bWJlciBpbiB0aGUgcmFuZ2Ugb2YgWzAsIDFdLCB3aGVyZSAwIGlzIHRoZSBsZWZ0IGVkZ2UgYW5kIDEgaXMgdGhlIHJpZ2h0IGVkZ2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRIb3Jpem9udGFsTW91c2VPZmZzZXQoZTogTW91c2VFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRPZmZzZXRQeCA9IHRoaXMuc2Vla0Jhci5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgIGxldCB3aWR0aFB4ID0gdGhpcy5zZWVrQmFyLndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG9mZnNldFB4ID0gZS5wYWdlWCAtIGVsZW1lbnRPZmZzZXRQeDtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gMSAvIHdpZHRoUHggKiBvZmZzZXRQeDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVPZmZzZXQob2Zmc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIHZlcnRpY2FsIG1vdXNlIG9mZnNldCBmcm9tIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgc2VlayBiYXIuXHJcbiAgICAgKiBAcGFyYW0gZSB0aGUgZXZlbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgZnJvbVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gYSBudW1iZXIgaW4gdGhlIHJhbmdlIG9mIFswLCAxXSwgd2hlcmUgMCBpcyB0aGUgYm90dG9tIGVkZ2UgYW5kIDEgaXMgdGhlIHRvcCBlZGdlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0VmVydGljYWxNb3VzZU9mZnNldChlOiBNb3VzZUV2ZW50KTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgZWxlbWVudE9mZnNldFB4ID0gdGhpcy5zZWVrQmFyLm9mZnNldCgpLnRvcDtcclxuICAgICAgICBsZXQgd2lkdGhQeCA9IHRoaXMuc2Vla0Jhci5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0UHggPSBlLnBhZ2VZIC0gZWxlbWVudE9mZnNldFB4O1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAxIC8gd2lkdGhQeCAqIG9mZnNldFB4O1xyXG5cclxuICAgICAgICByZXR1cm4gMSAtIHRoaXMuc2FuaXRpemVPZmZzZXQob2Zmc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIG1vdXNlIG9mZnNldCBmb3IgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiAoaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCkuXHJcbiAgICAgKiBAcGFyYW0gZSB0aGUgZXZlbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgZnJvbVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gYSBudW1iZXIgaW4gdGhlIHJhbmdlIG9mIFswLCAxXVxyXG4gICAgICogQHNlZSAjZ2V0SG9yaXpvbnRhbE1vdXNlT2Zmc2V0XHJcbiAgICAgKiBAc2VlICNnZXRWZXJ0aWNhbE1vdXNlT2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0TW91c2VPZmZzZXQoZTogTW91c2VFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFZlcnRpY2FsTW91c2VPZmZzZXQoZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SG9yaXpvbnRhbE1vdXNlT2Zmc2V0KGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNhbml0aXplcyB0aGUgbW91c2Ugb2Zmc2V0IHRvIHRoZSByYW5nZSBvZiBbMCwgMV0uXHJcbiAgICAgKlxyXG4gICAgICogV2hlbiB0cmFja2luZyB0aGUgbW91c2Ugb3V0c2lkZSB0aGUgc2VlayBiYXIsIHRoZSBvZmZzZXQgY2FuIGJlIG91dHNpZGUgdGhlIGRlc2lyZWQgcmFuZ2UgYW5kIHRoaXMgbWV0aG9kXHJcbiAgICAgKiBsaW1pdHMgaXQgdG8gdGhlIGRlc2lyZWQgcmFuZ2UuIEUuZy4gYSBtb3VzZSBldmVudCBsZWZ0IG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgYSBzZWVrIGJhciB5aWVsZHMgYW4gb2Zmc2V0IGJlbG93XHJcbiAgICAgKiB6ZXJvLCBidXQgdG8gZGlzcGxheSB0aGUgc2VlayB0YXJnZXQgb24gdGhlIHNlZWsgYmFyLCB3ZSBuZWVkIHRvIGxpbWl0IGl0IHRvIHplcm8uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG9mZnNldCB0aGUgb2Zmc2V0IHRvIHNhbml0aXplXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgc2FuaXRpemVkIG9mZnNldC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZU9mZnNldChvZmZzZXQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIFNpbmNlIHdlIHRyYWNrIG1vdXNlIG1vdmVzIG92ZXIgdGhlIHdob2xlIGRvY3VtZW50LCB0aGUgdGFyZ2V0IGNhbiBiZSBvdXRzaWRlIHRoZSBzZWVrIHJhbmdlLFxyXG4gICAgICAgIC8vIGFuZCB3ZSBuZWVkIHRvIGxpbWl0IGl0IHRvIHRoZSBbMCwgMV0gcmFuZ2UuXHJcbiAgICAgICAgaWYgKG9mZnNldCA8IDApIHtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCA+IDEpIHtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWJhY2sgcG9zaXRpb24gaW5kaWNhdG9yLlxyXG4gICAgICogQHBhcmFtIHBlcmNlbnQgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMDAgYXMgcmV0dXJuZWQgYnkgdGhlIHBsYXllclxyXG4gICAgICovXHJcbiAgICBzZXRQbGF5YmFja1Bvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyUGxheWJhY2tQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiB1bnRpbCB3aGljaCBtZWRpYSBpcyBidWZmZXJlZC5cclxuICAgICAqIEBwYXJhbSBwZXJjZW50IGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTAwXHJcbiAgICAgKi9cclxuICAgIHNldEJ1ZmZlclBvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyQnVmZmVyUG9zaXRpb24sIHBlcmNlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9zaXRpb24gd2hlcmUgYSBzZWVrLCBpZiBleGVjdXRlZCwgd291bGQganVtcCB0by5cclxuICAgICAqIEBwYXJhbSBwZXJjZW50IGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTAwXHJcbiAgICAgKi9cclxuICAgIHNldFNlZWtQb3NpdGlvbihwZXJjZW50OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMuc2Vla0JhclNlZWtQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGFjdHVhbCBwb3NpdGlvbiAod2lkdGggb3IgaGVpZ2h0KSBvZiBhIERPTSBlbGVtZW50IHRoYXQgcmVwcmVzZW50IGEgYmFyIGluIHRoZSBzZWVrIGJhci5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIHNldCB0aGUgcG9zaXRpb24gZm9yXHJcbiAgICAgKiBAcGFyYW0gcGVyY2VudCBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEwMFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNldFBvc2l0aW9uKGVsZW1lbnQ6IERPTSwgcGVyY2VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gdGhpcy5jb25maWcudmVydGljYWwgPyB7XCJoZWlnaHRcIjogcGVyY2VudCArIFwiJVwifSA6IHtcIndpZHRoXCI6IHBlcmNlbnQgKyBcIiVcIn07XHJcbiAgICAgICAgZWxlbWVudC5jc3Moc3R5bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHV0cyB0aGUgc2VlayBiYXIgaW50byBvciBvdXQgb2Ygc2Vla2luZyBzdGF0ZSBieSBhZGRpbmcvcmVtb3ZpbmcgYSBjbGFzcyB0byB0aGUgRE9NIGVsZW1lbnQuIFRoaXMgY2FuIGJlIHVzZWRcclxuICAgICAqIHRvIGFkanVzdCB0aGUgc3R5bGluZyB3aGlsZSBzZWVraW5nLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBzZWVraW5nIHNob3VsZCBiZSB0cnVlIHdoZW4gZW50ZXJpbmcgc2VlayBzdGF0ZSwgZmFsc2Ugd2hlbiBleGl0aW5nIHRoZSBzZWVrIHN0YXRlXHJcbiAgICAgKi9cclxuICAgIHNldFNlZWtpbmcoc2Vla2luZzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChzZWVraW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKFNlZWtCYXIuQ0xBU1NfU0VFS0lORyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoU2Vla0Jhci5DTEFTU19TRUVLSU5HKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHNlZWsgYmFyIGlzIGN1cnJlbnRseSBpbiB0aGUgc2VlayBzdGF0ZS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGluIHNlZWsgc3RhdGUsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNTZWVraW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldERvbUVsZW1lbnQoKS5oYXNDbGFzcyhTZWVrQmFyLkNMQVNTX1NFRUtJTkcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzZWVrIGJhciBoYXMgYSB7QGxpbmsgU2Vla0JhckxhYmVsfS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBzZWVrIGJhciBoYXMgYSBsYWJlbCwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBoYXNMYWJlbCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbCAhPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgbGFiZWwgb2YgdGhpcyBzZWVrIGJhci5cclxuICAgICAqIEByZXR1cm5zIHtTZWVrQmFyTGFiZWx9IHRoZSBsYWJlbCBpZiB0aGlzIHNlZWsgYmFyIGhhcyBhIGxhYmVsLCBlbHNlIG51bGxcclxuICAgICAqL1xyXG4gICAgZ2V0TGFiZWwoKTogU2Vla0JhckxhYmVsIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWsuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla1ByZXZpZXdFdmVudChwZXJjZW50YWdlOiBudW1iZXIsIHNjcnViYmluZzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwuc2V0VGV4dChwZXJjZW50YWdlICsgXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwuZ2V0RG9tRWxlbWVudCgpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcImxlZnRcIjogcGVyY2VudGFnZSArIFwiJVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrUHJldmlldy5kaXNwYXRjaCh0aGlzLCB7c2NydWJiaW5nOiBzY3J1YmJpbmcsIHBvc2l0aW9uOiBwZXJjZW50YWdlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla2VkRXZlbnQocGVyY2VudGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vla2VkLmRpc3BhdGNoKHRoaXMsIHBlcmNlbnRhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGEgc2NydWJiaW5nIHNlZWsgb3BlcmF0aW9uIGlzIHN0YXJ0ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2Vla0JhciwgTm9BcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uU2VlaygpOiBFdmVudDxTZWVrQmFyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vlay5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCBkdXJpbmcgYSBzY3J1YmJpbmcgc2VlayAodG8gaW5kaWNhdGUgdGhhdCB0aGUgc2VlayBwcmV2aWV3LCBpLmUuIHRoZSB2aWRlbyBmcmFtZSxcclxuICAgICAqIHNob3VsZCBiZSB1cGRhdGVkKSwgb3IgZHVyaW5nIGEgbm9ybWFsIHNlZWsgcHJldmlldyB3aGVuIHRoZSBzZWVrIGJhciBpcyBob3ZlcmVkIChhbmQgdGhlIHNlZWsgdGFyZ2V0LFxyXG4gICAgICogaS5lLiB0aGUgc2VlayBiYXIgbGFiZWwsIHNob3VsZCBiZSB1cGRhdGVkKS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZWVrQmFyLCBTZWVrUHJldmlld0V2ZW50QXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblNlZWtQcmV2aWV3KCk6IEV2ZW50PFNlZWtCYXIsIFNlZWtQcmV2aWV3RXZlbnRBcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtQcmV2aWV3LmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBoYXMgZmluaXNoZWQgb3Igd2hlbiBhIGRpcmVjdCBzZWVrIGlzIGlzc3VlZC5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZWVrQmFyLCBudW1iZXI+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TZWVrZWQoKTogRXZlbnQ8U2Vla0JhciwgbnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgU2Vla0JhckxhYmVsfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vla0JhckxhYmVsQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8vIG5vdGhpbmcgeWV0XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGxhYmVsIGZvciBhIHtAbGluayBTZWVrQmFyfSB0aGF0IGNhbiBkaXNwbGF5IHRoZSBzZWVrIHRhcmdldCB0aW1lIGFuZCBhIHRodW1ibmFpbC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZWVrQmFyTGFiZWwgZXh0ZW5kcyBDb250YWluZXI8U2Vla0JhckxhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBsYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG4gICAgcHJpdmF0ZSB0aHVtYm5haWw6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogU2Vla0JhckxhYmVsQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gbmV3IExhYmVsKHtjc3NDbGFzc2VzOiBbXCJzZWVrYmFyLWxhYmVsXCJdfSk7XHJcbiAgICAgICAgdGhpcy50aHVtYm5haWwgPSBuZXcgQ29tcG9uZW50KHtjc3NDbGFzc2VzOiBbXCJzZWVrYmFyLXRodW1ibmFpbFwiXX0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNlZWtiYXItbGFiZWxcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMudGh1bWJuYWlsLCB0aGlzLmxhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrUHJldmlldy5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZSA9IHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAtIHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIChwZXJjZW50YWdlIC8gMTAwKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGltZSh0aW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lID0gcGxheWVyLmdldER1cmF0aW9uKCkgKiAocGVyY2VudGFnZSAvIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWUodGltZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRodW1ibmFpbChwbGF5ZXIuZ2V0VGh1bWIodGltZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGFyYml0cmFyeSB0ZXh0IG9uIHRoZSBsYWJlbC5cclxuICAgICAqIEBwYXJhbSB0ZXh0IHRoZSB0ZXh0IHRvIHNob3cgb24gdGhlIGxhYmVsXHJcbiAgICAgKi9cclxuICAgIHNldFRleHQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbC5zZXRUZXh0KHRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIHRpbWUgdG8gYmUgZGlzcGxheWVkIG9uIHRoZSBsYWJlbC5cclxuICAgICAqIEBwYXJhbSBzZWNvbmRzIHRoZSB0aW1lIGluIHNlY29uZHMgdG8gZGlzcGxheSBvbiB0aGUgbGFiZWxcclxuICAgICAqL1xyXG4gICAgc2V0VGltZShzZWNvbmRzOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFRleHQoU3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShzZWNvbmRzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIG9yIHJlbW92ZXMgYSB0aHVtYm5haWwgb24gdGhlIGxhYmVsLlxyXG4gICAgICogQHBhcmFtIHRodW1ibmFpbCB0aGUgdGh1bWJuYWlsIHRvIGRpc3BsYXkgb24gdGhlIGxhYmVsIG9yIG51bGwgdG8gcmVtb3ZlIGEgZGlzcGxheWVkIHRodW1ibmFpbFxyXG4gICAgICovXHJcbiAgICBzZXRUaHVtYm5haWwodGh1bWJuYWlsOiBiaXRtb3Zpbi5wbGF5ZXIuVGh1bWJuYWlsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCB0aHVtYm5haWxFbGVtZW50ID0gdGhpcy50aHVtYm5haWwuZ2V0RG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICBpZiAodGh1bWJuYWlsID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGh1bWJuYWlsRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlXCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwibm9uZVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGh1bWJuYWlsRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiaW5oZXJpdFwiLFxyXG4gICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlXCI6IGB1cmwoJHt0aHVtYm5haWwudXJsfSlgLFxyXG4gICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiB0aHVtYm5haWwudyArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHRodW1ibmFpbC5oICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uXCI6IGAtJHt0aHVtYm5haWwueH1weCAtJHt0aHVtYm5haWwueX1weGBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0xpc3RTZWxlY3RvciwgTGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSBzZWxlY3QgYm94IHByb3ZpZGluZyB0aGUgcG9zc2liaWxpdHkgdG8gc2VsZWN0IGEgc2luZ2xlIGl0ZW0gb3V0IG9mIGEgbGlzdCBvZiBhdmFpbGFibGUgaXRlbXMuXHJcbiAqXHJcbiAqIERPTSBleGFtcGxlOlxyXG4gKiA8Y29kZT5cclxuICogICAgIDxzZWxlY3QgY2xhc3M9XCJ1aS1zZWxlY3Rib3hcIj5cclxuICogICAgICAgICA8b3B0aW9uIHZhbHVlPVwia2V5XCI+bGFiZWw8L29wdGlvbj5cclxuICogICAgICAgICAuLi5cclxuICogICAgIDwvc2VsZWN0PlxyXG4gKiA8L2NvZGU+XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2VsZWN0Qm94IGV4dGVuZHMgTGlzdFNlbGVjdG9yPExpc3RTZWxlY3RvckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0RWxlbWVudDogRE9NO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNlbGVjdGJveFwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgc2VsZWN0RWxlbWVudCA9IG5ldyBET00oXCJzZWxlY3RcIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0RWxlbWVudCA9IHNlbGVjdEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy51cGRhdGVEb21JdGVtcygpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZWN0RWxlbWVudC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG5ldyBET00odGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgIHNlbGYub25JdGVtU2VsZWN0ZWRFdmVudCh2YWx1ZSwgZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZWN0RWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlRG9tSXRlbXMoc2VsZWN0ZWRWYWx1ZTogc3RyaW5nID0gbnVsbCkge1xyXG4gICAgICAgIC8vIERlbGV0ZSBhbGwgY2hpbGRyZW5cclxuICAgICAgICB0aGlzLnNlbGVjdEVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHVwZGF0ZWQgY2hpbGRyZW5cclxuICAgICAgICBmb3IgKGxldCB2YWx1ZSBpbiB0aGlzLml0ZW1zKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IHRoaXMuaXRlbXNbdmFsdWVdO1xyXG4gICAgICAgICAgICBsZXQgb3B0aW9uRWxlbWVudCA9IG5ldyBET00oXCJvcHRpb25cIiwge1xyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiB2YWx1ZVxyXG4gICAgICAgICAgICB9KS5odG1sKGxhYmVsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gc2VsZWN0ZWRWYWx1ZSArIFwiXCIpIHsgLy8gY29udmVydCBzZWxlY3RlZFZhbHVlIHRvIHN0cmluZyB0byBjYXRjaCBcIm51bGxcIi9udWxsIGNhc2VcclxuICAgICAgICAgICAgICAgIG9wdGlvbkVsZW1lbnQuYXR0cihcInNlbGVjdGVkXCIsIFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RWxlbWVudC5hcHBlbmQob3B0aW9uRWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1BZGRlZEV2ZW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlci5vbkl0ZW1BZGRlZEV2ZW50KHZhbHVlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKHRoaXMuc2VsZWN0ZWRJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25JdGVtUmVtb3ZlZEV2ZW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlci5vbkl0ZW1SZW1vdmVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRG9tSXRlbXModGhpcy5zZWxlY3RlZEl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1TZWxlY3RlZEV2ZW50KHZhbHVlOiBzdHJpbmcsIHVwZGF0ZURvbUl0ZW1zOiBib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIHN1cGVyLm9uSXRlbVNlbGVjdGVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIGlmICh1cGRhdGVEb21JdGVtcykge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyQ29uZmlnLCBDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1ZpZGVvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vdmlkZW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7QXVkaW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9hdWRpb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtUaW1lb3V0fSBmcm9tIFwiLi4vdGltZW91dFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBTZXR0aW5nc1BhbmVsfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NQYW5lbENvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIHNldHRpbmdzIHBhbmVsIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIFNldCB0byAtMSB0byBkaXNhYmxlIGF1dG9tYXRpYyBoaWRpbmcuXHJcbiAgICAgKiBEZWZhdWx0OiAzIHNlY29uZHMgKDMwMDApXHJcbiAgICAgKi9cclxuICAgIGhpZGVEZWxheT86IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgcGFuZWwgY29udGFpbmluZyBhIGxpc3Qgb2Yge0BsaW5rIFNldHRpbmdzUGFuZWxJdGVtIGl0ZW1zfSB0aGF0IHJlcHJlc2VudCBsYWJlbGxlZCBzZXR0aW5ncy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nc1BhbmVsIGV4dGVuZHMgQ29udGFpbmVyPFNldHRpbmdzUGFuZWxDb25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNldHRpbmdzUGFuZWxDb25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWc8U2V0dGluZ3NQYW5lbENvbmZpZz4oY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNldHRpbmdzLXBhbmVsXCIsXHJcbiAgICAgICAgICAgIGhpZGVEZWxheTogMzAwMFxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCg8U2V0dGluZ3NQYW5lbENvbmZpZz5zZWxmLmNvbmZpZykuaGlkZURlbGF5ID4gLTEpIHtcclxuICAgICAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dCgoPFNldHRpbmdzUGFuZWxDb25maWc+dGhpcy5jb25maWcpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5vblNob3cuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIEFjdGl2YXRlIHRpbWVvdXQgd2hlbiBzaG93blxyXG4gICAgICAgICAgICAgICAgdGltZW91dC5zdGFydCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkub24oXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gUmVzZXQgdGltZW91dCBvbiBpbnRlcmFjdGlvblxyXG4gICAgICAgICAgICAgICAgdGltZW91dC5yZXNldCgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgc2VsZi5vbkhpZGUuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIENsZWFyIHRpbWVvdXQgd2hlbiBoaWRkZW4gZnJvbSBvdXRzaWRlXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFuIGl0ZW0gZm9yIGEge0BsaW5rIFNldHRpbmdzUGFuZWx9LCBjb250YWluaW5nIGEge0BsaW5rIExhYmVsfSBhbmQgYSBjb21wb25lbnQgdGhhdCBjb25maWd1cmVzIGEgc2V0dGluZy5cclxuICogU3VwcG9ydGVkIHNldHRpbmcgY29tcG9uZW50czoge0BsaW5rIFNlbGVjdEJveH1cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nc1BhbmVsSXRlbSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcbiAgICBwcml2YXRlIHNldHRpbmc6IFNlbGVjdEJveDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsYWJlbDogc3RyaW5nLCBzZWxlY3RCb3g6IFNlbGVjdEJveCwgY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMubGFiZWwgPSBuZXcgTGFiZWwoe3RleHQ6IGxhYmVsfSk7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nID0gc2VsZWN0Qm94O1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNldHRpbmdzLXBhbmVsLWVudHJ5XCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLmxhYmVsLCB0aGlzLnNldHRpbmddXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgaGFuZGxlQ29uZmlnSXRlbUNoYW5nZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBtaW5pbXVtIG51bWJlciBvZiBpdGVtcyB0aGF0IG11c3QgYmUgYXZhaWxhYmxlIGZvciB0aGUgc2V0dGluZyB0byBiZSBkaXNwbGF5ZWRcclxuICAgICAgICAgICAgLy8gQnkgZGVmYXVsdCwgYXQgbGVhc3QgdHdvIGl0ZW1zIG11c3QgYmUgYXZhaWxhYmxlLCBlbHNlIGEgc2VsZWN0aW9uIGlzIG5vdCBwb3NzaWJsZVxyXG4gICAgICAgICAgICBsZXQgbWluSXRlbXNUb0Rpc3BsYXkgPSAyO1xyXG4gICAgICAgICAgICAvLyBBdWRpby92aWRlbyBxdWFsaXR5IHNlbGVjdCBib3hlcyBjb250YWluIGFuIGFkZGl0aW9uYWwgXCJhdXRvXCIgbW9kZSwgd2hpY2ggaW4gY29tYmluYXRpb24gd2l0aCBhIHNpbmdsZSBhdmFpbGFibGUgcXVhbGl0eSBhbHNvIGRvZXMgbm90IG1ha2Ugc2Vuc2VcclxuICAgICAgICAgICAgaWYgKHNlbGYuc2V0dGluZyBpbnN0YW5jZW9mIFZpZGVvUXVhbGl0eVNlbGVjdEJveCB8fCBzZWxmLnNldHRpbmcgaW5zdGFuY2VvZiBBdWRpb1F1YWxpdHlTZWxlY3RCb3gpIHtcclxuICAgICAgICAgICAgICAgIG1pbkl0ZW1zVG9EaXNwbGF5ID0gMztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSGlkZSB0aGUgc2V0dGluZyBpZiBubyBtZWFuaW5nZnVsIGNob2ljZSBpcyBhdmFpbGFibGVcclxuICAgICAgICAgICAgaWYgKHNlbGYuc2V0dGluZy5pdGVtQ291bnQoKSA8IG1pbkl0ZW1zVG9EaXNwbGF5KSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5zZXR0aW5nLm9uSXRlbUFkZGVkLnN1YnNjcmliZShoYW5kbGVDb25maWdJdGVtQ2hhbmdlZCk7XHJcbiAgICAgICAgc2VsZi5zZXR0aW5nLm9uSXRlbVJlbW92ZWQuc3Vic2NyaWJlKGhhbmRsZUNvbmZpZ0l0ZW1DaGFuZ2VkKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBoaWRkZW4gc3RhdGVcclxuICAgICAgICBoYW5kbGVDb25maWdJdGVtQ2hhbmdlZCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZXR0aW5nc1BhbmVsfSBmcm9tIFwiLi9zZXR0aW5nc3BhbmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgU2V0dGluZ3NUb2dnbGVCdXR0b259LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZyBleHRlbmRzIFRvZ2dsZUJ1dHRvbkNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzZXR0aW5ncyBwYW5lbCB3aG9zZSB2aXNpYmlsaXR5IHRoZSBidXR0b24gc2hvdWxkIHRvZ2dsZS5cclxuICAgICAqL1xyXG4gICAgc2V0dGluZ3NQYW5lbDogU2V0dGluZ3NQYW5lbDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyB2aXNpYmlsaXR5IG9mIGEgc2V0dGluZ3MgcGFuZWwuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2V0dGluZ3NUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248U2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNldHRpbmdzVG9nZ2xlQnV0dG9uQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgaWYgKCFjb25maWcuc2V0dGluZ3NQYW5lbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXF1aXJlZCBTZXR0aW5nc1BhbmVsIGlzIG1pc3NpbmdcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNldHRpbmdzdG9nZ2xlYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiU2V0dGluZ3NcIixcclxuICAgICAgICAgICAgc2V0dGluZ3NQYW5lbDogbnVsbFxyXG4gICAgICAgIH0sIDxTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHNldHRpbmdzUGFuZWwgPSAoPFNldHRpbmdzVG9nZ2xlQnV0dG9uQ29uZmlnPnRoaXMuZ2V0Q29uZmlnKCkpLnNldHRpbmdzUGFuZWw7XHJcblxyXG4gICAgICAgIHRoaXMub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZXR0aW5nc1BhbmVsLnRvZ2dsZUhpZGRlbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNldHRpbmdzUGFuZWwub25IaWRlLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFNldCB0b2dnbGUgc3RhdHVzIHRvIG9mZiB3aGVuIHRoZSBzZXR0aW5ncyBwYW5lbCBoaWRlc1xyXG4gICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFN1YnRpdGxlQ3VlRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuU3VidGl0bGVDdWVFdmVudDtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcblxyXG4vKipcclxuICogT3ZlcmxheXMgdGhlIHBsYXllciB0byBkaXNwbGF5IHN1YnRpdGxlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTdWJ0aXRsZU92ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbm5lciBsYWJlbCB0aGF0IHJlbmRlcnMgdGhlIHN1YnRpdGxlIHRleHRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdWJ0aXRsZUxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuc3VidGl0bGVMYWJlbCA9IG5ldyBMYWJlbDxMYWJlbENvbmZpZz4oe2Nzc0NsYXNzOiBcInVpLXN1YnRpdGxlLWxhYmVsXCJ9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zdWJ0aXRsZS1vdmVybGF5XCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnN1YnRpdGxlTGFiZWxdXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DVUVfRU5URVIsIGZ1bmN0aW9uIChldmVudDogU3VidGl0bGVDdWVFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnN1YnRpdGxlTGFiZWwuc2V0VGV4dChldmVudC50ZXh0KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DVUVfRVhJVCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUN1ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3VidGl0bGVMYWJlbC5zZXRUZXh0KFwiXCIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgc3VidGl0bGVDbGVhckhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3VidGl0bGVMYWJlbC5zZXRUZXh0KFwiXCIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NVQlRJVExFX0NIQU5HRSwgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFRUssIHN1YnRpdGxlQ2xlYXJIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZULCBzdWJ0aXRsZUNsZWFySGFuZGxlcik7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9zZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtMaXN0U2VsZWN0b3JDb25maWd9IGZyb20gXCIuL2xpc3RzZWxlY3RvclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgU3VidGl0bGVBZGRlZEV2ZW50ID0gYml0bW92aW4ucGxheWVyLlN1YnRpdGxlQWRkZWRFdmVudDtcclxuaW1wb3J0IFN1YnRpdGxlQ2hhbmdlZEV2ZW50ID0gYml0bW92aW4ucGxheWVyLlN1YnRpdGxlQ2hhbmdlZEV2ZW50O1xyXG5pbXBvcnQgU3VidGl0bGVSZW1vdmVkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuU3VidGl0bGVSZW1vdmVkRXZlbnQ7XHJcblxyXG4vKipcclxuICogQSBzZWxlY3QgYm94IHByb3ZpZGluZyBhIHNlbGVjdGlvbiBiZXR3ZWVuIGF2YWlsYWJsZSBzdWJ0aXRsZSBhbmQgY2FwdGlvbiB0cmFja3MuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3VidGl0bGVTZWxlY3RCb3ggZXh0ZW5kcyBTZWxlY3RCb3gge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgdXBkYXRlU3VidGl0bGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAobGV0IHN1YnRpdGxlIG9mIHBsYXllci5nZXRBdmFpbGFibGVTdWJ0aXRsZXMoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRJdGVtKHN1YnRpdGxlLmlkLCBzdWJ0aXRsZS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBTdWJ0aXRsZVNlbGVjdEJveCwgdmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0U3VidGl0bGUodmFsdWUgPT09IFwibnVsbFwiID8gbnVsbCA6IHZhbHVlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVhY3QgdG8gQVBJIGV2ZW50c1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NVQlRJVExFX0FEREVELCBmdW5jdGlvbiAoZXZlbnQ6IFN1YnRpdGxlQWRkZWRFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLmFkZEl0ZW0oZXZlbnQuc3VidGl0bGUuaWQsIGV2ZW50LnN1YnRpdGxlLmxhYmVsKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVUJUSVRMRV9DSEFOR0UsIGZ1bmN0aW9uIChldmVudDogU3VidGl0bGVDaGFuZ2VkRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RJdGVtKGV2ZW50LnRhcmdldFN1YnRpdGxlLmlkKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVUJUSVRMRV9SRU1PVkVELCBmdW5jdGlvbiAoZXZlbnQ6IFN1YnRpdGxlUmVtb3ZlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYucmVtb3ZlSXRlbShldmVudC5zdWJ0aXRsZUlkKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU09VUkNFX1VOTE9BREVELCB1cGRhdGVTdWJ0aXRsZXMpOyAvLyBVcGRhdGUgc3VidGl0bGVzIHdoZW4gc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB1cGRhdGVTdWJ0aXRsZXMpOyAvLyBVcGRhdGUgc3VidGl0bGVzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG5cclxuICAgICAgICAvLyBQb3B1bGF0ZSBzdWJ0aXRsZXMgYXQgc3RhcnR1cFxyXG4gICAgICAgIHVwZGF0ZVN1YnRpdGxlcygpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtMYWJlbENvbmZpZywgTGFiZWx9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VGltZW91dH0gZnJvbSBcIi4uL3RpbWVvdXRcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgVGl0bGVCYXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUaXRsZUJhckNvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIHRpdGxlIGJhciB3aWxsIGJlIGhpZGRlbiB3aGVuIHRoZXJlIGlzIG5vIHVzZXIgaW50ZXJhY3Rpb24uXHJcbiAgICAgKiBEZWZhdWx0OiA1IHNlY29uZHMgKDUwMDApXHJcbiAgICAgKi9cclxuICAgIGhpZGVEZWxheT86IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIERpc3BsYXlzIGEgdGl0bGUgYmFyIGNvbnRhaW5pbmcgYSBsYWJlbCB3aXRoIHRoZSB0aXRsZSBvZiB0aGUgdmlkZW8uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVGl0bGVCYXIgZXh0ZW5kcyBDb250YWluZXI8VGl0bGVCYXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUaXRsZUJhckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh7Y3NzQ2xhc3M6IFwidWktdGl0bGViYXItbGFiZWxcIn0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXRpdGxlYmFyXCIsXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcclxuICAgICAgICAgICAgaGlkZURlbGF5OiA1MDAwLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy5sYWJlbF1cclxuICAgICAgICB9LCA8VGl0bGVCYXJDb25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAodWltYW5hZ2VyLmdldENvbmZpZygpICYmIHVpbWFuYWdlci5nZXRDb25maWcoKS5tZXRhZGF0YSkge1xyXG4gICAgICAgICAgICBzZWxmLmxhYmVsLnNldFRleHQodWltYW5hZ2VyLmdldENvbmZpZygpLm1ldGFkYXRhLnRpdGxlKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBDYW5jZWwgY29uZmlndXJhdGlvbiBpZiB0aGVyZSBpcyBubyBtZXRhZGF0YSB0byBkaXNwbGF5XHJcbiAgICAgICAgICAgIC8vIFRPRE8gdGhpcyBwcm9iYWJseSB3b24ndCB3b3JrIGlmIHdlIHB1dCB0aGUgc2hhcmUgYnV0dG9ucyBpbnRvIHRoZSB0aXRsZSBiYXJcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dCgoPFRpdGxlQmFyQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VFbnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTsgLy8gc2hvdyBjb250cm9sIGJhciB3aGVuIHRoZSBtb3VzZSBlbnRlcnMgdGhlIFVJXHJcblxyXG4gICAgICAgICAgICAvLyBDbGVhciB0aW1lb3V0IHRvIGF2b2lkIGhpZGluZyB0aGUgYmFyIGlmIHRoZSBtb3VzZSBtb3ZlcyBiYWNrIGludG8gdGhlIFVJIGR1cmluZyB0aGUgdGltZW91dCBwZXJpb2RcclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgdGhlIGJhciBpZiBtb3VzZSBkb2VzIG5vdCBtb3ZlIGR1cmluZyB0aGUgdGltZW91dCB0aW1lXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VMZWF2ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgYmFyIHNvbWUgdGltZSBhZnRlciB0aGUgbW91c2UgbGVmdCB0aGUgVUlcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCdXR0b24sIEJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vYnV0dG9uXCI7XHJcbmltcG9ydCB7Tm9BcmdzLCBFdmVudERpc3BhdGNoZXIsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEgdG9nZ2xlIGJ1dHRvbiBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRvZ2dsZUJ1dHRvbkNvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0IG9uIHRoZSBidXR0b24uXHJcbiAgICAgKi9cclxuICAgIHRleHQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IGNhbiBiZSB0b2dnbGVkIGJldHdlZW4gXCJvblwiIGFuZCBcIm9mZlwiIHN0YXRlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUb2dnbGVCdXR0b248Q29uZmlnIGV4dGVuZHMgVG9nZ2xlQnV0dG9uQ29uZmlnPiBleHRlbmRzIEJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDTEFTU19PTiA9IFwib25cIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX09GRiA9IFwib2ZmXCI7XHJcblxyXG4gICAgcHJpdmF0ZSBvblN0YXRlOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgdG9nZ2xlQnV0dG9uRXZlbnRzID0ge1xyXG4gICAgICAgIG9uVG9nZ2xlOiBuZXcgRXZlbnREaXNwYXRjaGVyPFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Ub2dnbGVPbjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIG9uVG9nZ2xlT2ZmOiBuZXcgRXZlbnREaXNwYXRjaGVyPFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXRvZ2dsZWJ1dHRvblwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlcyB0aGUgYnV0dG9uIHRvIHRoZSBcIm9uXCIgc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIG9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT2ZmKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5vblN0YXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09GRik7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKFRvZ2dsZUJ1dHRvbi5DTEFTU19PTik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9uVG9nZ2xlRXZlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5vblRvZ2dsZU9uRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSBidXR0b24gdG8gdGhlIFwib2ZmXCIgc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIG9mZigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc09uKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5vblN0YXRlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKFRvZ2dsZUJ1dHRvbi5DTEFTU19PTik7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKFRvZ2dsZUJ1dHRvbi5DTEFTU19PRkYpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25Ub2dnbGVPZmZFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZSB0aGUgYnV0dG9uIFwib25cIiBpZiBpdCBpcyBcIm9mZlwiLCBvciBcIm9mZlwiIGlmIGl0IGlzIFwib25cIi5cclxuICAgICAqL1xyXG4gICAgdG9nZ2xlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT24oKSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMub24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHRvZ2dsZSBidXR0b24gaXMgaW4gdGhlIFwib25cIiBzdGF0ZS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGJ1dHRvbiBpcyBcIm9uXCIsIGZhbHNlIGlmIFwib2ZmXCJcclxuICAgICAqL1xyXG4gICAgaXNPbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vblN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSB0b2dnbGUgYnV0dG9uIGlzIGluIHRoZSBcIm9mZlwiIHN0YXRlLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYnV0dG9uIGlzIFwib2ZmXCIsIGZhbHNlIGlmIFwib25cIlxyXG4gICAgICovXHJcbiAgICBpc09mZigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaXNPbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkNsaWNrRXZlbnQoKSB7XHJcbiAgICAgICAgc3VwZXIub25DbGlja0V2ZW50KCk7XHJcblxyXG4gICAgICAgIC8vIEZpcmUgdGhlIHRvZ2dsZSBldmVudCB0b2dldGhlciB3aXRoIHRoZSBjbGljayBldmVudFxyXG4gICAgICAgIC8vICh0aGV5IGFyZSB0ZWNobmljYWxseSB0aGUgc2FtZSwgb25seSB0aGUgc2VtYW50aWNzIGFyZSBkaWZmZXJlbnQpXHJcbiAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uVG9nZ2xlRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uVG9nZ2xlT25FdmVudCgpIHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9uLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblRvZ2dsZU9mZkV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlT2ZmLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBidXR0b24gaXMgdG9nZ2xlZC5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Ub2dnbGUoKTogRXZlbnQ8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZS5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBidXR0b24gaXMgdG9nZ2xlZCBcIm9uXCIuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uVG9nZ2xlT24oKTogRXZlbnQ8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9uLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGJ1dHRvbiBpcyB0b2dnbGVkIFwib2ZmXCIuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uVG9nZ2xlT2ZmKCk6IEV2ZW50PFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGVPZmYuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Tm9BcmdzLCBFdmVudERpc3BhdGNoZXIsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFVJQ29udGFpbmVyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlDb250YWluZXJDb25maWcgZXh0ZW5kcyBDb250YWluZXJDb25maWcge1xyXG4gICAgLy8gbm90aGluZyB0byBhZGRcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBiYXNlIGNvbnRhaW5lciB0aGF0IGNvbnRhaW5zIGFsbCBvZiB0aGUgVUkuIFRoZSBVSUNvbnRhaW5lciBpcyBwYXNzZWQgdG8gdGhlIHtAbGluayBVSU1hbmFnZXJ9IHRvIGJ1aWxkIGFuZCBzZXR1cCB0aGUgVUkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVUlDb250YWluZXIgZXh0ZW5kcyBDb250YWluZXI8VUlDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHVpQ29udGFpbmVyRXZlbnRzID0ge1xyXG4gICAgICAgIG9uTW91c2VFbnRlcjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxVSUNvbnRhaW5lciwgTm9BcmdzPigpLFxyXG4gICAgICAgIG9uTW91c2VNb3ZlOiBuZXcgRXZlbnREaXNwYXRjaGVyPFVJQ29udGFpbmVyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Nb3VzZUxlYXZlOiBuZXcgRXZlbnREaXNwYXRjaGVyPFVJQ29udGFpbmVyLCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBVSUNvbnRhaW5lckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdWljb250YWluZXJcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5vbk1vdXNlRW50ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VFbnRlci5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYub25Nb3VzZU1vdmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VNb3ZlLmRpc3BhdGNoKHNlbmRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5vbk1vdXNlTGVhdmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VMZWF2ZS5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHN1cGVyLnRvRG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICBjb250YWluZXIub24oXCJtb3VzZWVudGVyXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRW50ZXJFdmVudCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnRhaW5lci5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZU1vdmVFdmVudCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnRhaW5lci5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uTW91c2VMZWF2ZUV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERldGVjdCBmbGV4Ym94IHN1cHBvcnQgKG5vdCBzdXBwb3J0ZWQgaW4gSUU5KVxyXG4gICAgICAgIGlmIChkb2N1bWVudCAmJiB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIikuc3R5bGUuZmxleCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBjb250YWluZXIuYWRkQ2xhc3MoXCJmbGV4Ym94XCIpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcyhcIm5vLWZsZXhib3hcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbk1vdXNlRW50ZXJFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VFbnRlci5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Nb3VzZU1vdmVFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VNb3ZlLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbk1vdXNlTGVhdmVFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VMZWF2ZS5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZUVudGVyKCk6IEV2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy51aUNvbnRhaW5lckV2ZW50cy5vbk1vdXNlRW50ZXIuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgbW91c2UgbW92ZXMgd2l0aGluIFVJLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbk1vdXNlTW92ZSgpOiBFdmVudDxVSUNvbnRhaW5lciwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZU1vdmUuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgbW91c2UgbGVhdmVzIHRoZSBVSS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZUxlYXZlKCk6IEV2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy51aUNvbnRhaW5lckV2ZW50cy5vbk1vdXNlTGVhdmUuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzZWxlY3QgYm94IHByb3ZpZGluZyBhIHNlbGVjdGlvbiBiZXR3ZWVuIFwiYXV0b1wiIGFuZCB0aGUgYXZhaWxhYmxlIHZpZGVvIHF1YWxpdGllcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBWaWRlb1F1YWxpdHlTZWxlY3RCb3ggZXh0ZW5kcyBTZWxlY3RCb3gge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgdXBkYXRlVmlkZW9RdWFsaXRpZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCB2aWRlb1F1YWxpdGllcyA9IHBsYXllci5nZXRBdmFpbGFibGVWaWRlb1F1YWxpdGllcygpO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5jbGVhckl0ZW1zKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgZW50cnkgZm9yIGF1dG9tYXRpYyBxdWFsaXR5IHN3aXRjaGluZyAoZGVmYXVsdCBzZXR0aW5nKVxyXG4gICAgICAgICAgICBzZWxmLmFkZEl0ZW0oXCJhdXRvXCIsIFwiYXV0b1wiKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB2aWRlbyBxdWFsaXRpZXNcclxuICAgICAgICAgICAgZm9yIChsZXQgdmlkZW9RdWFsaXR5IG9mIHZpZGVvUXVhbGl0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZEl0ZW0odmlkZW9RdWFsaXR5LmlkLCB2aWRlb1F1YWxpdHkubGFiZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogVmlkZW9RdWFsaXR5U2VsZWN0Qm94LCB2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRWaWRlb1F1YWxpdHkodmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZVZpZGVvUXVhbGl0aWVzKTsgLy8gVXBkYXRlIHF1YWxpdGllcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlVmlkZW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZJREVPX0RPV05MT0FEX1FVQUxJVFlfQ0hBTkdFLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gcGxheWVyLmdldERvd25sb2FkZWRWaWRlb0RhdGEoKTtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RJdGVtKGRhdGEuaXNBdXRvID8gXCJhdXRvXCIgOiBkYXRhLmlkKTtcclxuICAgICAgICB9KTsgLy8gVXBkYXRlIHF1YWxpdHkgc2VsZWN0aW9uIHdoZW4gcXVhbGl0eSBpcyBjaGFuZ2VkIChmcm9tIG91dHNpZGUpXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHF1YWxpdGllcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlVmlkZW9RdWFsaXRpZXMoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXIsIENvbnRhaW5lckNvbmZpZ30gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Vm9sdW1lU2xpZGVyfSBmcm9tIFwiLi92b2x1bWVzbGlkZXJcIjtcclxuaW1wb3J0IHtWb2x1bWVUb2dnbGVCdXR0b259IGZyb20gXCIuL3ZvbHVtZXRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1RpbWVvdXR9IGZyb20gXCIuLi90aW1lb3V0XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFZvbHVtZUNvbnRyb2xCdXR0b259LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGFmdGVyIHdoaWNoIHRoZSB2b2x1bWUgc2xpZGVyIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIENhcmUgbXVzdCBiZSB0YWtlbiB0aGF0IHRoZSBkZWxheSBpcyBsb25nIGVub3VnaCBzbyB1c2VycyBjYW4gcmVhY2ggdGhlIHNsaWRlciBmcm9tIHRoZSB0b2dnbGUgYnV0dG9uLCBlLmcuIGJ5XHJcbiAgICAgKiBtb3VzZSBtb3ZlbWVudC4gSWYgdGhlIGRlbGF5IGlzIHRvbyBzaG9ydCwgdGhlIHNsaWRlcnMgZGlzYXBwZWFycyBiZWZvcmUgdGhlIG1vdXNlIHBvaW50ZXIgaGFzIHJlYWNoZWQgaXQgYW5kXHJcbiAgICAgKiB0aGUgdXNlciBpcyBub3QgYWJsZSB0byB1c2UgaXQuXHJcbiAgICAgKiBEZWZhdWx0OiA1MDBtc1xyXG4gICAgICovXHJcbiAgICBoaWRlRGVsYXk/OiBudW1iZXI7XHJcbiAgICAvKipcclxuICAgICAqIFNwZWNpZmllcyBpZiB0aGUgdm9sdW1lIHNsaWRlciBzaG91bGQgYmUgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgYWxpZ25lZC5cclxuICAgICAqIERlZmF1bHQ6IHRydWVcclxuICAgICAqL1xyXG4gICAgdmVydGljYWw/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjb21wb3NpdGUgdm9sdW1lIGNvbnRyb2wgdGhhdCBjb25zaXN0cyBvZiBhbmQgaW50ZXJuYWxseSBtYW5hZ2VzIGEgdm9sdW1lIGNvbnRyb2wgYnV0dG9uIHRoYXQgY2FuIGJlIHVzZWRcclxuICogZm9yIG11dGluZywgYW5kIGEgKGRlcGVuZGluZyBvbiB0aGUgQ1NTIHN0eWxlLCBlLmcuIHNsaWRlLW91dCkgdm9sdW1lIGNvbnRyb2wgYmFyLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZvbHVtZUNvbnRyb2xCdXR0b24gZXh0ZW5kcyBDb250YWluZXI8Vm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgdm9sdW1lVG9nZ2xlQnV0dG9uOiBWb2x1bWVUb2dnbGVCdXR0b247XHJcbiAgICBwcml2YXRlIHZvbHVtZVNsaWRlcjogVm9sdW1lU2xpZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy52b2x1bWVUb2dnbGVCdXR0b24gPSBuZXcgVm9sdW1lVG9nZ2xlQnV0dG9uKCk7XHJcbiAgICAgICAgdGhpcy52b2x1bWVTbGlkZXIgPSBuZXcgVm9sdW1lU2xpZGVyKHtcclxuICAgICAgICAgICAgdmVydGljYWw6IGNvbmZpZy52ZXJ0aWNhbCAhPSBudWxsID8gY29uZmlnLnZlcnRpY2FsIDogdHJ1ZSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdm9sdW1lY29udHJvbGJ1dHRvblwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy52b2x1bWVUb2dnbGVCdXR0b24sIHRoaXMudm9sdW1lU2xpZGVyXSxcclxuICAgICAgICAgICAgaGlkZURlbGF5OiA1MDBcclxuICAgICAgICB9LCA8Vm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHZvbHVtZVRvZ2dsZUJ1dHRvbiA9IHRoaXMuZ2V0Vm9sdW1lVG9nZ2xlQnV0dG9uKCk7XHJcbiAgICAgICAgbGV0IHZvbHVtZVNsaWRlciA9IHRoaXMuZ2V0Vm9sdW1lU2xpZGVyKCk7XHJcblxyXG4gICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2b2x1bWVTbGlkZXIuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFZvbHVtZSBTbGlkZXIgdmlzaWJpbGl0eSBoYW5kbGluZ1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogVGhlIHZvbHVtZSBzbGlkZXIgc2hhbGwgYmUgdmlzaWJsZSB3aGlsZSB0aGUgdXNlciBob3ZlcnMgdGhlIG11dGUgdG9nZ2xlIGJ1dHRvbiwgd2hpbGUgdGhlIHVzZXIgaG92ZXJzIHRoZVxyXG4gICAgICAgICAqIHZvbHVtZSBzbGlkZXIsIGFuZCB3aGlsZSB0aGUgdXNlciBzbGlkZXMgdGhlIHZvbHVtZSBzbGlkZXIuIElmIG5vbmUgb2YgdGhlc2Ugc2l0dWF0aW9ucyBhcmUgdHJ1ZSwgdGhlIHNsaWRlclxyXG4gICAgICAgICAqIHNoYWxsIGRpc2FwcGVhci5cclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgdm9sdW1lU2xpZGVySG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZvbHVtZVRvZ2dsZUJ1dHRvbi5nZXREb21FbGVtZW50KCkub24oXCJtb3VzZWVudGVyXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gU2hvdyB2b2x1bWUgc2xpZGVyIHdoZW4gbW91c2UgZW50ZXJzIHRoZSBidXR0b24gYXJlYVxyXG4gICAgICAgICAgICBpZiAodm9sdW1lU2xpZGVyLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHZvbHVtZVNsaWRlci5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQXZvaWQgaGlkaW5nIG9mIHRoZSBzbGlkZXIgd2hlbiBidXR0b24gaXMgaG92ZXJlZFxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdm9sdW1lVG9nZ2xlQnV0dG9uLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBIaWRlIHNsaWRlciBkZWxheWVkIHdoZW4gYnV0dG9uIGlzIGxlZnRcclxuICAgICAgICAgICAgdGltZW91dC5yZXNldCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZvbHVtZVNsaWRlci5nZXREb21FbGVtZW50KCkub24oXCJtb3VzZWVudGVyXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2xpZGVyIGlzIGVudGVyZWQsIGNhbmNlbCB0aGUgaGlkZSB0aW1lb3V0IGFjdGl2YXRlZCBieSBsZWF2aW5nIHRoZSBidXR0b25cclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgICAgICB2b2x1bWVTbGlkZXJIb3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVTbGlkZXIuZ2V0RG9tRWxlbWVudCgpLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gbW91c2UgbGVhdmVzIHRoZSBzbGlkZXIsIG9ubHkgaGlkZSBpdCBpZiB0aGVyZSBpcyBubyBzbGlkZSBvcGVyYXRpb24gaW4gcHJvZ3Jlc3NcclxuICAgICAgICAgICAgaWYgKHZvbHVtZVNsaWRlci5pc1NlZWtpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGltZW91dC5yZXNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlckhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVTbGlkZXIub25TZWVrZWQuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gV2hlbiBhIHNsaWRlIG9wZXJhdGlvbiBpcyBkb25lIGFuZCB0aGUgc2xpZGVyIG5vdCBob3ZlcmVkIChtb3VzZSBvdXRzaWRlIHNsaWRlciksIGhpZGUgc2xpZGVyIGRlbGF5ZWRcclxuICAgICAgICAgICAgaWYgKCF2b2x1bWVTbGlkZXJIb3ZlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFByb3ZpZGVzIGFjY2VzcyB0byB0aGUgaW50ZXJuYWxseSBtYW5hZ2VkIHZvbHVtZSB0b2dnbGUgYnV0dG9uLlxyXG4gICAgICogQHJldHVybnMge1ZvbHVtZVRvZ2dsZUJ1dHRvbn1cclxuICAgICAqL1xyXG4gICAgZ2V0Vm9sdW1lVG9nZ2xlQnV0dG9uKCk6IFZvbHVtZVRvZ2dsZUJ1dHRvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sdW1lVG9nZ2xlQnV0dG9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBpbnRlcm5hbGx5IG1hbmFnZWQgdm9sdW1lIHNpbGRlci5cclxuICAgICAqIEByZXR1cm5zIHtWb2x1bWVTbGlkZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldFZvbHVtZVNsaWRlcigpOiBWb2x1bWVTbGlkZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZvbHVtZVNsaWRlcjtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWVrQmFyLCBTZWVrQmFyQ29uZmlnfSBmcm9tIFwiLi9zZWVrYmFyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzaW1wbGUgdm9sdW1lIHNsaWRlciBjb21wb25lbnQgdG8gYWRqdXN0IHRoZSBwbGF5ZXIncyB2b2x1bWUgc2V0dGluZy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBWb2x1bWVTbGlkZXIgZXh0ZW5kcyBTZWVrQmFyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdm9sdW1lc2xpZGVyXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB2b2x1bWVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKDApO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRCdWZmZXJQb3NpdGlvbigwKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbihwbGF5ZXIuZ2V0Vm9sdW1lKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24ocGxheWVyLmdldFZvbHVtZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZPTFVNRV9DSEFOR0UsIHZvbHVtZUNoYW5nZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX01VVEUsIHZvbHVtZUNoYW5nZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1VOTVVURSwgdm9sdW1lQ2hhbmdlSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHRoaXMub25TZWVrUHJldmlldy5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoYXJncy5zY3J1YmJpbmcpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5zZXRWb2x1bWUoYXJncy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBwZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRWb2x1bWUocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgdm9sdW1lIGJhclxyXG4gICAgICAgIHZvbHVtZUNoYW5nZUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBWb2x1bWVDaGFuZ2VFdmVudCA9IGJpdG1vdmluLnBsYXllci5Wb2x1bWVDaGFuZ2VFdmVudDtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgYXVkaW8gbXV0aW5nLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZvbHVtZVRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12b2x1bWV0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJWb2x1bWUvTXV0ZVwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgbXV0ZVN0YXRlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9NVVRFLCBtdXRlU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9VTk1VVEUsIG11dGVTdGF0ZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci51bm11dGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5tdXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVk9MVU1FX0NIQU5HRSwgZnVuY3Rpb24gKGV2ZW50OiBWb2x1bWVDaGFuZ2VFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBUb2dnbGUgbG93IGNsYXNzIHRvIGRpc3BsYXkgbG93IHZvbHVtZSBpY29uIGJlbG93IDUwJSB2b2x1bWVcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldFZvbHVtZSA8IDUwKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhcImxvd1wiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKFwibG93XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uLCBUb2dnbGVCdXR0b25Db25maWd9IGZyb20gXCIuL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyB0aGUgdmlkZW8gdmlldyBiZXR3ZWVuIG5vcm1hbC9tb25vIGFuZCBWUi9zdGVyZW8uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVlJUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdnJ0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJWUlwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgaXNWUkNvbmZpZ3VyZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFZSIGF2YWlsYWJpbGl0eSBjYW5ub3QgYmUgY2hlY2tlZCB0aHJvdWdoIGdldFZSU3RhdHVzKCkgYmVjYXVzZSBpdCBpcyBhc3luY2hyb25vdXNseSBwb3B1bGF0ZWQgYW5kIG5vdFxyXG4gICAgICAgICAgICAvLyBhdmFpbGFibGUgYXQgVUkgaW5pdGlhbGl6YXRpb24uIEFzIGFuIGFsdGVybmF0aXZlLCB3ZSBjaGVjayB0aGUgVlIgc2V0dGluZ3MgaW4gdGhlIGNvbmZpZy5cclxuICAgICAgICAgICAgLy8gVE9ETyB1c2UgZ2V0VlJTdGF0dXMoKSB0aHJvdWdoIGlzVlJTdGVyZW9BdmFpbGFibGUoKSBvbmNlIHRoZSBwbGF5ZXIgaGFzIGJlZW4gcmV3cml0dGVuIGFuZCB0aGUgc3RhdHVzIGlzIGF2YWlsYWJsZSBpbiBPTl9SRUFEWVxyXG4gICAgICAgICAgICBsZXQgY29uZmlnID0gcGxheWVyLmdldENvbmZpZygpO1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnLnNvdXJjZSAmJiBjb25maWcuc291cmNlLnZyICYmIGNvbmZpZy5zb3VyY2UudnIuY29udGVudFR5cGUgIT09IFwibm9uZVwiO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBpc1ZSU3RlcmVvQXZhaWxhYmxlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGxheWVyLmdldFZSU3RhdHVzKCkuY29udGVudFR5cGUgIT09IFwibm9uZVwiO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCB2clN0YXRlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGlzVlJDb25maWd1cmVkKCkgJiYgaXNWUlN0ZXJlb0F2YWlsYWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTsgLy8gc2hvdyBidXR0b24gaW4gY2FzZSBpdCBpcyBoaWRkZW5cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdldFZSU3RhdHVzKCkuaXNTdGVyZW8pIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTsgLy8gaGlkZSBidXR0b24gaWYgbm8gc3RlcmVvIG1vZGUgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgdnJCdXR0b25WaXNpYmlsaXR5SGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGlzVlJDb25maWd1cmVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9WUl9NT0RFX0NIQU5HRUQsIHZyU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9WUl9TVEVSRU9fQ0hBTkdFRCwgdnJTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZSX0VSUk9SLCB2clN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU09VUkNFX1VOTE9BREVELCB2ckJ1dHRvblZpc2liaWxpdHlIYW5kbGVyKTsgLy8gSGlkZSBidXR0b24gd2hlbiBWUiBzb3VyY2UgZ29lcyBhd2F5XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUkVBRFksIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIpOyAvLyBTaG93IGJ1dHRvbiB3aGVuIGEgbmV3IHNvdXJjZSBpcyBsb2FkZWQgYW5kIGl0J3MgVlJcclxuXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghaXNWUlN0ZXJlb0F2YWlsYWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29uc29sZSkgY29uc29sZS5sb2coXCJObyBWUiBjb250ZW50XCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5nZXRWUlN0YXR1cygpLmlzU3RlcmVvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnNldFZSU3RlcmVvKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnNldFZSU3RlcmVvKHRydWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFNldCBzdGFydHVwIHZpc2liaWxpdHlcclxuICAgICAgICB2ckJ1dHRvblZpc2liaWxpdHlIYW5kbGVyKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7QnV0dG9uLCBCdXR0b25Db25maWd9IGZyb20gXCIuL2J1dHRvblwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBXYXRlcm1hcmt9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBXYXRlcm1hcmtDb25maWcgZXh0ZW5kcyBCdXR0b25Db25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdXJsIHRvIG9wZW4gd2hlbiB0aGUgd2F0ZXJtYXJrIGlzIGNsaWNrZWQuIFNldCB0byBudWxsIHRvIGRpc2FibGUgdGhlIGNsaWNrIGhhbmRsZXIuXHJcbiAgICAgKi9cclxuICAgIHVybD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgd2F0ZXJtYXJrIG92ZXJsYXkgd2l0aCBhIGNsaWNrYWJsZSBsb2dvLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFdhdGVybWFyayBleHRlbmRzIEJ1dHRvbjxXYXRlcm1hcmtDb25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFdhdGVybWFya0NvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS13YXRlcm1hcmtcIixcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9iaXRtb3Zpbi5jb21cIlxyXG4gICAgICAgIH0sIDxXYXRlcm1hcmtDb25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRpYWxpemUoKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5nZXRVcmwoKSkge1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZ2V0RG9tRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBlbGVtZW50LmRhdGEoXCJ1cmxcIiwgdGhpcy5nZXRVcmwoKSk7XHJcbiAgICAgICAgICAgIGVsZW1lbnQub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihlbGVtZW50LmRhdGEoXCJ1cmxcIiksIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBVUkwgdGhhdCBzaG91bGQgYmUgZm9sbG93ZWQgd2hlbiB0aGUgd2F0ZXJtYXJrIGlzIGNsaWNrZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgd2F0ZXJtYXJrIFVSTFxyXG4gICAgICovXHJcbiAgICBnZXRVcmwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKDxXYXRlcm1hcmtDb25maWc+dGhpcy5jb25maWcpLnVybDtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPZmZzZXQge1xyXG4gICAgbGVmdDogbnVtYmVyO1xyXG4gICAgdG9wOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBTaW1wbGUgRE9NIG1hbmlwdWxhdGlvbiBhbmQgRE9NIGVsZW1lbnQgZXZlbnQgaGFuZGxpbmcgbW9kZWxlZCBhZnRlciBqUXVlcnkgKGFzIHJlcGxhY2VtZW50IGZvciBqUXVlcnkpLlxyXG4gKlxyXG4gKiBMaWtlIGpRdWVyeSwgRE9NIG9wZXJhdGVzIG9uIHNpbmdsZSBlbGVtZW50cyBhbmQgbGlzdHMgb2YgZWxlbWVudHMuIEZvciBleGFtcGxlOiBjcmVhdGluZyBhbiBlbGVtZW50IHJldHVybnMgYSBET01cclxuICogaW5zdGFuY2Ugd2l0aCBhIHNpbmdsZSBlbGVtZW50LCBzZWxlY3RpbmcgZWxlbWVudHMgcmV0dXJucyBhIERPTSBpbnN0YW5jZSB3aXRoIHplcm8sIG9uZSwgb3IgbWFueSBlbGVtZW50cy4gU2ltaWxhclxyXG4gKiB0byBqUXVlcnksIHNldHRlcnMgdXN1YWxseSBhZmZlY3QgYWxsIGVsZW1lbnRzLCB3aGlsZSBnZXR0ZXJzIG9wZXJhdGUgb24gb25seSB0aGUgZmlyc3QgZWxlbWVudC5cclxuICogQWxzbyBzaW1pbGFyIHRvIGpRdWVyeSwgbW9zdCBtZXRob2RzIChleGNlcHQgZ2V0dGVycykgcmV0dXJuIHRoZSBET00gaW5zdGFuY2UgZmFjaWxpdGF0aW5nIGVhc3kgY2hhaW5pbmcgb2YgbWV0aG9kIGNhbGxzLlxyXG4gKlxyXG4gKiBCdWlsdCB3aXRoIHRoZSBoZWxwIG9mOiBodHRwOi8veW91bWlnaHRub3RuZWVkanF1ZXJ5LmNvbS9cclxuICovXHJcbmV4cG9ydCBjbGFzcyBET00ge1xyXG5cclxuICAgIHByaXZhdGUgZG9jdW1lbnQ6IERvY3VtZW50O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxpc3Qgb2YgZWxlbWVudHMgdGhhdCB0aGUgaW5zdGFuY2Ugd3JhcHMuIFRha2UgY2FyZSB0aGF0IG5vdCBhbGwgbWV0aG9kcyBjYW4gb3BlcmF0ZSBvbiB0aGUgd2hvbGUgbGlzdCxcclxuICAgICAqIGdldHRlcnMgdXN1YWxseSBqdXN0IHdvcmsgb24gdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZWxlbWVudHM6IEhUTUxFbGVtZW50W107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGEgRE9NIGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gdGFnTmFtZSB0aGUgdGFnIG5hbWUgb2YgdGhlIERPTSBlbGVtZW50XHJcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlcyBhIGxpc3Qgb2YgYXR0cmlidXRlcyBvZiB0aGUgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcih0YWdOYW1lOiBzdHJpbmcsIGF0dHJpYnV0ZXM6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9KTtcclxuICAgIC8qKlxyXG4gICAgICogU2VsZWN0cyBhbGwgZWxlbWVudHMgZnJvbSB0aGUgRE9NIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBzZWxlY3Rvci5cclxuICAgICAqIEBwYXJhbSBzZWxlY3RvciB0aGUgc2VsZWN0b3IgdG8gbWF0Y2ggRE9NIGVsZW1lbnRzIHdpdGhcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3Ioc2VsZWN0b3I6IHN0cmluZyk7XHJcbiAgICAvKipcclxuICAgICAqIFdyYXBzIGEgcGxhaW4gSFRNTEVsZW1lbnQgd2l0aCBhIERPTSBpbnN0YW5jZS5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IHRoZSBIVE1MRWxlbWVudCB0byB3cmFwIHdpdGggRE9NXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTtcclxuICAgIC8qKlxyXG4gICAgICogV3JhcHMgdGhlIGRvY3VtZW50IHdpdGggYSBET00gaW5zdGFuY2UuIFVzZWZ1bCB0byBhdHRhY2ggZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBkb2N1bWVudC5cclxuICAgICAqIEBwYXJhbSBkb2N1bWVudCB0aGUgZG9jdW1lbnQgdG8gd3JhcFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudDogRG9jdW1lbnQpO1xyXG4gICAgY29uc3RydWN0b3Ioc29tZXRoaW5nOiBzdHJpbmcgfCBIVE1MRWxlbWVudCB8IERvY3VtZW50LCBhdHRyaWJ1dGVzPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7IC8vIFNldCB0aGUgZ2xvYmFsIGRvY3VtZW50IHRvIHRoZSBsb2NhbCBkb2N1bWVudCBmaWVsZFxyXG5cclxuICAgICAgICBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHNvbWV0aGluZyBpbnN0YW5jZW9mIERvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gYSBkb2N1bWVudCBpcyBwYXNzZWQgaW4sIHdlIGRvIG5vdCBkbyBhbnl0aGluZyB3aXRoIGl0LCBidXQgYnkgc2V0dGluZyB0aGlzLmVsZW1lbnRzIHRvIG51bGxcclxuICAgICAgICAgICAgLy8gd2UgZ2l2ZSB0aGUgZXZlbnQgaGFuZGxpbmcgbWV0aG9kIGEgbWVhbnMgdG8gZGV0ZWN0IGlmIHRoZSBldmVudHMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgb24gdGhlIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2YgZWxlbWVudHMuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWdOYW1lID0gc29tZXRoaW5nO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVWYWx1ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIGxldCBlbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBOb2RlTGlzdCB0byBBcnJheVxyXG4gICAgICAgICAgICAvLyBodHRwczovL3RvZGRtb3R0by5jb20vYS1jb21wcmVoZW5zaXZlLWRpdmUtaW50by1ub2RlbGlzdHMtYXJyYXlzLWNvbnZlcnRpbmctbm9kZWxpc3RzLWFuZC11bmRlcnN0YW5kaW5nLXRoZS1kb20vXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbXS5zbGljZS5jYWxsKGVsZW1lbnRzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHNob3J0Y3V0IG1ldGhvZCBmb3IgaXRlcmF0aW5nIGFsbCBlbGVtZW50cy4gU2hvcnRzIHRoaXMuZWxlbWVudHMuZm9yRWFjaCguLi4pIHRvIHRoaXMuZm9yRWFjaCguLi4pLlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgdGhlIGhhbmRsZXIgdG8gZXhlY3V0ZSBhbiBvcGVyYXRpb24gb24gYW4gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGZvckVhY2goaGFuZGxlcjogKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIG9mIHRoZSBpbm5lciBIVE1MIGNvbnRlbnQgb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIGh0bWwoKTogc3RyaW5nO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBpbm5lciBIVE1MIGNvbnRlbnQgb2YgYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNvbnRlbnQgYSBzdHJpbmcgb2YgcGxhaW4gdGV4dCBvciBIVE1MIG1hcmt1cFxyXG4gICAgICovXHJcbiAgICBodG1sKGNvbnRlbnQ6IHN0cmluZyk6IERPTTtcclxuICAgIGh0bWwoY29udGVudD86IHN0cmluZyk6IHN0cmluZyB8IERPTSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEh0bWwoY29udGVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRIdG1sKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0SHRtbCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5pbm5lckhUTUw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRIdG1sKGNvbnRlbnQ6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgaWYgKGNvbnRlbnQgPT09IHVuZGVmaW5lZCB8fCBjb250ZW50ID09IG51bGwpIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRvIGVtcHR5IHN0cmluZyB0byBhdm9pZCBpbm5lckhUTUwgZ2V0dGluZyBzZXQgdG8gXCJ1bmRlZmluZWRcIiAoYWxsIGJyb3dzZXJzKSBvciBcIm51bGxcIiAoSUU5KVxyXG4gICAgICAgICAgICBjb250ZW50ID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbnRlbnQ7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSBpbm5lciBIVE1MIG9mIGFsbCBlbGVtZW50cyAoZGVsZXRlcyBhbGwgY2hpbGRyZW4pLlxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgZW1wdHkoKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgZmlyc3QgZm9ybSBlbGVtZW50LCBlLmcuIHRoZSBzZWxlY3RlZCB2YWx1ZSBvZiBhIHNlbGVjdCBib3ggb3IgdGhlIHRleHQgaWYgYW4gaW5wdXQgZmllbGQuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgdmFsdWUgb2YgYSBmb3JtIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgdmFsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzWzBdO1xyXG5cclxuICAgICAgICBpZiAoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxTZWxlY3RFbGVtZW50IHx8IGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MSW5wdXRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtZW50LnZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gVE9ETyBhZGQgc3VwcG9ydCBmb3IgbWlzc2luZyBmb3JtIGVsZW1lbnRzXHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgdmFsKCkgbm90IHN1cHBvcnRlZCBmb3IgJHt0eXBlb2YgZWxlbWVudH1gKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhbiBhdHRyaWJ1dGUgb24gdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIGF0dHIoYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGFuIGF0dHJpYnV0ZSBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gYXR0cmlidXRlIHRoZSBuYW1lIG9mIHRoZSBhdHRyaWJ1dGVcclxuICAgICAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhlIGF0dHJpYnV0ZVxyXG4gICAgICovXHJcbiAgICBhdHRyKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NO1xyXG4gICAgYXR0cihhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHwgRE9NIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0QXR0cihhdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEF0dHIoYXR0cmlidXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBdHRyKGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0uZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRBdHRyKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIGRhdGEgZWxlbWVudCBvbiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBkYXRhQXR0cmlidXRlIHRoZSBuYW1lIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZSB3aXRob3V0IHRoZSBcImRhdGEtXCIgcHJlZml4XHJcbiAgICAgKi9cclxuICAgIGRhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIGRhdGEgYXR0cmlidXRlIG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBkYXRhQXR0cmlidXRlIHRoZSBuYW1lIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZSB3aXRob3V0IHRoZSBcImRhdGEtXCIgcHJlZml4XHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoZSBkYXRhIGF0dHJpYnV0ZVxyXG4gICAgICovXHJcbiAgICBkYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTTtcclxuICAgIGRhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZyk6IHN0cmluZyB8IG51bGwgfCBET00ge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXREYXRhKGRhdGFBdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldERhdGEoZGF0YUF0dHJpYnV0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0RGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5nZXRBdHRyaWJ1dGUoXCJkYXRhLVwiICsgZGF0YUF0dHJpYnV0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXREYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZGF0YS1cIiArIGRhdGFBdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFwcGVuZHMgb25lIG9yIG1vcmUgRE9NIGVsZW1lbnRzIGFzIGNoaWxkcmVuIHRvIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBjaGlsZEVsZW1lbnRzIHRoZSBjaHJpbGQgZWxlbWVudHMgdG8gYXBwZW5kXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBhcHBlbmQoLi4uY2hpbGRFbGVtZW50czogRE9NW10pOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBjaGlsZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRFbGVtZW50LmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKF8sIGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChjaGlsZEVsZW1lbnQuZWxlbWVudHNbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG9mZnNldCBvZiB0aGUgZmlyc3QgZWxlbWVudCBmcm9tIHRoZSBkb2N1bWVudCdzIHRvcCBsZWZ0IGNvcm5lci5cclxuICAgICAqIEByZXR1cm5zIHtPZmZzZXR9XHJcbiAgICAgKi9cclxuICAgIG9mZnNldCgpOiBPZmZzZXQge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50c1swXTtcclxuICAgICAgICBsZXQgcmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIGFsd2F5cyAwIGluIElFOSwgSUUxMSwgRmlyZWZveFxyXG4gICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzExMTAyMjE1LzM3MDI1MlxyXG4gICAgICAgIGxldCBzY3JvbGxUb3AgPSB0eXBlb2Ygd2luZG93LnBhZ2VZT2Zmc2V0ICE9PSBcInVuZGVmaW5lZFwiID9cclxuICAgICAgICAgICAgd2luZG93LnBhZ2VZT2Zmc2V0IDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA/XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgOiBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA/XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wIDogMDtcclxuXHJcbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0IGFsd2F5cyAwIGluIElFOSwgSUUxMSwgRmlyZWZveFxyXG4gICAgICAgIGxldCBzY3JvbGxMZWZ0ID0gdHlwZW9mIHdpbmRvdy5wYWdlWE9mZnNldCAhPT0gXCJ1bmRlZmluZWRcIiA/XHJcbiAgICAgICAgICAgIHdpbmRvdy5wYWdlWE9mZnNldCA6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0ID9cclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgOiBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgP1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgOiAwO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0b3A6IHJlY3QudG9wICsgc2Nyb2xsVG9wLFxyXG4gICAgICAgICAgICBsZWZ0OiByZWN0LmxlZnQgKyBzY3JvbGxMZWZ0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHdpZHRoIG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIHdpZHRoIG9mIHRoZSBmaXJzdCBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHdpZHRoKCk6IG51bWJlciB7XHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpZiB0aGlzIGlzIHRoZSBzYW1lIGFzIGpRdWVyeSdzIHdpZHRoKCkgKHByb2JhYmx5IG5vdClcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5vZmZzZXRXaWR0aDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGhlaWdodCBvZiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSBoZWlnaHQgb2YgdGhlIGZpcnN0IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgaGVpZ2h0KCk6IG51bWJlciB7XHJcbiAgICAgICAgLy8gVE9ETyBjaGVjayBpZiB0aGlzIGlzIHRoZSBzYW1lIGFzIGpRdWVyeSdzIGhlaWdodCgpIChwcm9iYWJseSBub3QpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXR0YWNoZXMgYW4gZXZlbnQgaGFuZGxlciB0byBvbmUgb3IgbW9yZSBldmVudHMgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSB0aGUgZXZlbnQgbmFtZSAob3IgbXVsdGlwbGUgbmFtZXMgc2VwYXJhdGVkIGJ5IHNwYWNlKSB0byBsaXN0ZW4gdG9cclxuICAgICAqIEBwYXJhbSBldmVudEhhbmRsZXIgdGhlIGV2ZW50IGhhbmRsZXIgdG8gY2FsbCB3aGVuIHRoZSBldmVudCBmaXJlc1xyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgb24oZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50SGFuZGxlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCk6IERPTSB7XHJcbiAgICAgICAgbGV0IGV2ZW50cyA9IGV2ZW50TmFtZS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuZWxlbWVudHMgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudEhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudEhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGV2ZW50IGhhbmRsZXIgZnJvbSBvbmUgb3IgbW9yZSBldmVudHMgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGV2ZW50TmFtZSB0aGUgZXZlbnQgbmFtZSAob3IgbXVsdGlwbGUgbmFtZXMgc2VwYXJhdGVkIGJ5IHNwYWNlKSB0byByZW1vdmUgdGhlIGhhbmRsZXIgZnJvbVxyXG4gICAgICogQHBhcmFtIGV2ZW50SGFuZGxlciB0aGUgZXZlbnQgaGFuZGxlciB0byByZW1vdmVcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIG9mZihldmVudE5hbWU6IHN0cmluZywgZXZlbnRIYW5kbGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0KTogRE9NIHtcclxuICAgICAgICBsZXQgZXZlbnRzID0gZXZlbnROYW1lLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5lbGVtZW50cyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgdG8gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNsYXNzTmFtZSB0aGUgY2xhc3MoZXMpIHRvIGFkZCwgbXVsdGlwbGUgY2xhc3NlcyBzZXBhcmF0ZWQgYnkgc3BhY2VcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGFkZENsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIFwiICsgY2xhc3NOYW1lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlZCB0aGUgc3BlY2lmaWVkIGNsYXNzKGVzKSBmcm9tIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBjbGFzc05hbWUgdGhlIGNsYXNzKGVzKSB0byByZW1vdmUsIG11bHRpcGxlIGNsYXNzZXMgc2VwYXJhdGVkIGJ5IHNwYWNlXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICByZW1vdmVDbGFzcyhjbGFzc05hbWU6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9IGVsZW1lbnQuY2xhc3NOYW1lLnJlcGxhY2UobmV3IFJlZ0V4cChcIihefFxcXFxiKVwiICsgY2xhc3NOYW1lLnNwbGl0KFwiIFwiKS5qb2luKFwifFwiKSArIFwiKFxcXFxifCQpXCIsIFwiZ2lcIiksIFwiIFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiBhbnkgb2YgdGhlIGVsZW1lbnRzIGhhcyB0aGUgc3BlY2lmaWVkIGNsYXNzLlxyXG4gICAgICogQHBhcmFtIGNsYXNzTmFtZSB0aGUgY2xhc3MgbmFtZSB0byBjaGVja1xyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgb25lIG9mIHRoZSBlbGVtZW50cyBoYXMgdGhlIGNsYXNzIGF0dGFjaGVkLCBlbHNlIGlmIG5vIGVsZW1lbnQgaGFzIGl0IGF0dGFjaGVkXHJcbiAgICAgKi9cclxuICAgIGhhc0NsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChuZXcgUmVnRXhwKFwiKF58IClcIiArIGNsYXNzTmFtZSArIFwiKCB8JClcIiwgXCJnaVwiKS50ZXN0KGVsZW1lbnQuY2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgQ1NTIHByb3BlcnR5IG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHBhcmFtIHByb3BlcnR5TmFtZSB0aGUgbmFtZSBvZiB0aGUgQ1NTIHByb3BlcnR5IHRvIHJldHJpZXZlIHRoZSB2YWx1ZSBvZlxyXG4gICAgICovXHJcbiAgICBjc3MocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSB2YWx1ZSBvZiBhIENTUyBwcm9wZXJ0eSBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlOYW1lIHRoZSBuYW1lIG9mIHRoZSBDU1MgcHJvcGVydHkgdG8gc2V0IHRoZSB2YWx1ZSBmb3JcclxuICAgICAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gc2V0IGZvciB0aGUgZ2l2ZW4gQ1NTIHByb3BlcnR5XHJcbiAgICAgKi9cclxuICAgIGNzcyhwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTTtcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIGNvbGxlY3Rpb24gb2YgQ1NTIHByb3BlcnRpZXMgYW5kIHRoZWlyIHZhbHVlcyBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlWYWx1ZUNvbGxlY3Rpb24gYW4gb2JqZWN0IGNvbnRhaW5pbmcgcGFpcnMgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHRoZWlyIHZhbHVlc1xyXG4gICAgICovXHJcbiAgICBjc3MocHJvcGVydHlWYWx1ZUNvbGxlY3Rpb246IHtbcHJvcGVydHlOYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogRE9NO1xyXG4gICAgY3NzKHByb3BlcnR5TmFtZU9yQ29sbGVjdGlvbjogc3RyaW5nIHwge1twcm9wZXJ0eU5hbWU6IHN0cmluZ106IHN0cmluZ30sIHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB8IERPTSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb24gPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgbGV0IHByb3BlcnR5TmFtZSA9IHByb3BlcnR5TmFtZU9yQ29sbGVjdGlvbjtcclxuXHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRDc3MocHJvcGVydHlOYW1lLCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRDc3MocHJvcGVydHlOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHByb3BlcnR5VmFsdWVDb2xsZWN0aW9uID0gcHJvcGVydHlOYW1lT3JDb2xsZWN0aW9uO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRDc3NDb2xsZWN0aW9uKHByb3BlcnR5VmFsdWVDb2xsZWN0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRDc3MocHJvcGVydHlOYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gZ2V0Q29tcHV0ZWRTdHlsZSh0aGlzLmVsZW1lbnRzWzBdKVs8YW55PnByb3BlcnR5TmFtZV07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRDc3MocHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAvLyA8YW55PiBjYXN0IHRvIHJlc29sdmUgVFM3MDE1OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNjYyNzExNC8zNzAyNTJcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZVs8YW55PnByb3BlcnR5TmFtZV0gPSB2YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldENzc0NvbGxlY3Rpb24ocnVsZVZhbHVlQ29sbGVjdGlvbjoge1tydWxlTmFtZTogc3RyaW5nXTogc3RyaW5nfSk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM0NDkwNTczLzM3MDI1MlxyXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKGVsZW1lbnQuc3R5bGUsIHJ1bGVWYWx1ZUNvbGxlY3Rpb24pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7QXJyYXlVdGlsc30gZnJvbSBcIi4vdXRpbHNcIjtcclxuLyoqXHJcbiAqIEZ1bmN0aW9uIGludGVyZmFjZSBmb3IgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSB7QGxpbmsgRXZlbnREaXNwYXRjaGVyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+IHtcclxuICAgIChzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncyk6IHZvaWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFbXB0eSB0eXBlIGZvciBjcmVhdGluZyB7QGxpbmsgRXZlbnREaXNwYXRjaGVyIGV2ZW50IGRpc3BhdGNoZXJzfSB0aGF0IGRvIG5vdCBjYXJyeSBhbnkgYXJndW1lbnRzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBOb0FyZ3Mge1xyXG59XHJcblxyXG4vKipcclxuICogUHVibGljIGludGVyZmFjZSB0aGF0IHJlcHJlc2VudHMgYW4gZXZlbnQuIENhbiBiZSB1c2VkIHRvIHN1YnNjcmliZSB0byBhbmQgdW5zdWJzY3JpYmUgZnJvbSBldmVudHMuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50PFNlbmRlciwgQXJncz4ge1xyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJzY3JpYmVzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoaXMgZXZlbnQgZGlzcGF0Y2hlci5cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgdG8gYWRkXHJcbiAgICAgKi9cclxuICAgIHN1YnNjcmliZShsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KTogdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN1YnNjcmliZXMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhpcyBldmVudCBkaXNwYXRjaGVyIHRoYXQgd2lsbCBiZSBjYWxsZWQgYXQgYSBsaW1pdGVkIHJhdGUgd2l0aCBhIG1pbmltdW1cclxuICAgICAqIGludGVydmFsIG9mIHRoZSBzcGVjaWZpZWQgbWlsbGlzZWNvbmRzLlxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIHRoZSBsaXN0ZW5lciB0byBhZGRcclxuICAgICAqIEBwYXJhbSByYXRlTXMgdGhlIHJhdGUgaW4gbWlsbGlzZWNvbmRzIHRvIHdoaWNoIGNhbGxpbmcgb2YgdGhlIGxpc3RlbmVycyBzaG91bGQgYmUgbGltaXRlZFxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmVSYXRlTGltaXRlZChsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+LCByYXRlTXM6IG51bWJlcik6IHZvaWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBVbnN1YnNjcmliZXMgYSBzdWJzY3JpYmVkIGV2ZW50IGxpc3RlbmVyIGZyb20gdGhpcyBkaXNwYXRjaGVyLlxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIHRoZSBsaXN0ZW5lciB0byByZW1vdmVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBsaXN0ZW5lciB3YXMgc3VjY2Vzc2Z1bGx5IHVuc3Vic2NyaWJlZCwgZmFsc2UgaWYgaXQgaXNuJ3Qgc3Vic2NyaWJlZCBvbiB0aGlzIGRpc3BhdGNoZXJcclxuICAgICAqL1xyXG4gICAgdW5zdWJzY3JpYmUobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPik6IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFdmVudCBkaXNwYXRjaGVyIHRvIHN1YnNjcmliZSBhbmQgdHJpZ2dlciBldmVudHMuIEVhY2ggZXZlbnQgc2hvdWxkIGhhdmUgaXRzIG93biBkaXNwYXRjaGVyLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEV2ZW50RGlzcGF0Y2hlcjxTZW5kZXIsIEFyZ3M+IGltcGxlbWVudHMgRXZlbnQ8U2VuZGVyLCBBcmdzPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBsaXN0ZW5lcnM6IEV2ZW50TGlzdGVuZXJXcmFwcGVyPFNlbmRlciwgQXJncz5bXSA9IFtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICoge0Bpbmhlcml0RG9jfVxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmUobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPikge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobmV3IEV2ZW50TGlzdGVuZXJXcmFwcGVyKGxpc3RlbmVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB7QGluaGVyaXREb2N9XHJcbiAgICAgKi9cclxuICAgIHN1YnNjcmliZVJhdGVMaW1pdGVkKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4sIHJhdGVNczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaChuZXcgUmF0ZUxpbWl0ZWRFdmVudExpc3RlbmVyV3JhcHBlcihsaXN0ZW5lciwgcmF0ZU1zKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB7QGluaGVyaXREb2N9XHJcbiAgICAgKi9cclxuICAgIHVuc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pOiBib29sZWFuIHtcclxuICAgICAgICAvLyBJdGVyYXRlIHRocm91Z2ggbGlzdGVuZXJzLCBjb21wYXJlIHdpdGggcGFyYW1ldGVyLCBhbmQgcmVtb3ZlIGlmIGZvdW5kXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgc3Vic2NyaWJlZExpc3RlbmVyID0gdGhpcy5saXN0ZW5lcnNbaV07XHJcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVkTGlzdGVuZXIubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICBBcnJheVV0aWxzLnJlbW92ZSh0aGlzLmxpc3RlbmVycywgc3Vic2NyaWJlZExpc3RlbmVyKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEaXNwYXRjaGVzIGFuIGV2ZW50IHRvIGFsbCBzdWJzY3JpYmVkIGxpc3RlbmVycy5cclxuICAgICAqIEBwYXJhbSBzZW5kZXIgdGhlIHNvdXJjZSBvZiB0aGUgZXZlbnRcclxuICAgICAqIEBwYXJhbSBhcmdzIHRoZSBhcmd1bWVudHMgZm9yIHRoZSBldmVudFxyXG4gICAgICovXHJcbiAgICBkaXNwYXRjaChzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncyA9IG51bGwpIHtcclxuICAgICAgICAvLyBDYWxsIGV2ZXJ5IGxpc3RlbmVyXHJcbiAgICAgICAgZm9yIChsZXQgbGlzdGVuZXIgb2YgdGhpcy5saXN0ZW5lcnMpIHtcclxuICAgICAgICAgICAgbGlzdGVuZXIuZmlyZShzZW5kZXIsIGFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGV2ZW50IHRoYXQgdGhpcyBkaXNwYXRjaGVyIG1hbmFnZXMgYW5kIG9uIHdoaWNoIGxpc3RlbmVycyBjYW4gc3Vic2NyaWJlIGFuZCB1bnN1YnNjcmliZSBldmVudCBoYW5kbGVycy5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudH1cclxuICAgICAqL1xyXG4gICAgZ2V0RXZlbnQoKTogRXZlbnQ8U2VuZGVyLCBBcmdzPiB7XHJcbiAgICAgICAgLy8gRm9yIG5vdywganVzdCBjYXNlIHRoZSBldmVudCBkaXNwYXRjaGVyIHRvIHRoZSBldmVudCBpbnRlcmZhY2UuIEF0IHNvbWUgcG9pbnQgaW4gdGhlIGZ1dHVyZSB3aGVuIHRoZVxyXG4gICAgICAgIC8vIGNvZGViYXNlIGdyb3dzLCBpdCBtaWdodCBtYWtlIHNlbnNlIHRvIHNwbGl0IHRoZSBkaXNwYXRjaGVyIGludG8gc2VwYXJhdGUgZGlzcGF0Y2hlciBhbmQgZXZlbnQgY2xhc3Nlcy5cclxuICAgICAgICByZXR1cm4gPEV2ZW50PFNlbmRlciwgQXJncz4+dGhpcztcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEEgYmFzaWMgZXZlbnQgbGlzdGVuZXIgd3JhcHBlciB0byBtYW5hZ2UgbGlzdGVuZXJzIHdpdGhpbiB0aGUge0BsaW5rIEV2ZW50RGlzcGF0Y2hlcn0uIFRoaXMgaXMgYSBcInByaXZhdGVcIiBjbGFzc1xyXG4gKiBmb3IgaW50ZXJuYWwgZGlzcGF0Y2hlciB1c2UgYW5kIGl0IGlzIHRoZXJlZm9yZSBub3QgZXhwb3J0ZWQuXHJcbiAqL1xyXG5jbGFzcyBFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+IHtcclxuXHJcbiAgICBwcml2YXRlIGV2ZW50TGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KSB7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbmVyID0gbGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB3cmFwcGVkIGV2ZW50IGxpc3RlbmVyLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IGxpc3RlbmVyKCk6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRMaXN0ZW5lcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSB3cmFwcGVkIGV2ZW50IGxpc3RlbmVyIHdpdGggdGhlIGdpdmVuIGFyZ3VtZW50cy5cclxuICAgICAqIEBwYXJhbSBzZW5kZXJcclxuICAgICAqIEBwYXJhbSBhcmdzXHJcbiAgICAgKi9cclxuICAgIGZpcmUoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpIHtcclxuICAgICAgICB0aGlzLmV2ZW50TGlzdGVuZXIoc2VuZGVyLCBhcmdzKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEV4dGVuZHMgdGhlIGJhc2ljIHtAbGluayBFdmVudExpc3RlbmVyV3JhcHBlcn0gd2l0aCByYXRlLWxpbWl0aW5nIGZ1bmN0aW9uYWxpdHkuXHJcbiAqL1xyXG5jbGFzcyBSYXRlTGltaXRlZEV2ZW50TGlzdGVuZXJXcmFwcGVyPFNlbmRlciwgQXJncz4gZXh0ZW5kcyBFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+IHtcclxuXHJcbiAgICBwcml2YXRlIHJhdGVNczogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSByYXRlTGltaXRpbmdFdmVudExpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz47XHJcblxyXG4gICAgcHJpdmF0ZSBsYXN0RmlyZVRpbWU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+LCByYXRlTXM6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKGxpc3RlbmVyKTsgLy8gc2V0cyB0aGUgZXZlbnQgbGlzdGVuZXIgc2lua1xyXG5cclxuICAgICAgICB0aGlzLnJhdGVNcyA9IHJhdGVNcztcclxuICAgICAgICB0aGlzLmxhc3RGaXJlVGltZSA9IDA7XHJcblxyXG4gICAgICAgIC8vIFdyYXAgdGhlIGV2ZW50IGxpc3RlbmVyIHdpdGggYW4gZXZlbnQgbGlzdGVuZXIgdGhhdCBkb2VzIHRoZSByYXRlLWxpbWl0aW5nXHJcbiAgICAgICAgdGhpcy5yYXRlTGltaXRpbmdFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gdGhpcy5sYXN0RmlyZVRpbWUgPiB0aGlzLnJhdGVNcykge1xyXG4gICAgICAgICAgICAgICAgLy8gT25seSBpZiBlbm91Z2ggdGltZSBzaW5jZSB0aGUgcHJldmlvdXMgY2FsbCBoYXMgcGFzc2VkLCBjYWxsIHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gYWN0dWFsIGV2ZW50IGxpc3RlbmVyIGFuZCByZWNvcmQgdGhlIGN1cnJlbnQgdGltZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5maXJlU3VwZXIoc2VuZGVyLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEZpcmVUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaXJlU3VwZXIoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpIHtcclxuICAgICAgICAvLyBGaXJlIHRoZSBhY3R1YWwgZXh0ZXJuYWwgZXZlbnQgbGlzdGVuZXJcclxuICAgICAgICBzdXBlci5maXJlKHNlbmRlciwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgZmlyZShzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncykge1xyXG4gICAgICAgIC8vIEZpcmUgdGhlIGludGVybmFsIHJhdGUtbGltaXRpbmcgbGlzdGVuZXIgaW5zdGVhZCBvZiB0aGUgZXh0ZXJuYWwgZXZlbnQgbGlzdGVuZXJcclxuICAgICAgICB0aGlzLnJhdGVMaW1pdGluZ0V2ZW50TGlzdGVuZXIoc2VuZGVyLCBhcmdzKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBHdWlkIHtcclxuXHJcbiAgICBsZXQgZ3VpZCA9IDE7XHJcblxyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgcmV0dXJuIGd1aWQrKztcclxuICAgIH1cclxufVxyXG4iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbGF5ZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi9ub2RlX21vZHVsZXMvQHR5cGVzL2NvcmUtanMvaW5kZXguZC50c1wiIC8+XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvYnV0dG9uXCI7XHJcbmltcG9ydCB7Q29udHJvbEJhcn0gZnJvbSBcIi4vY29tcG9uZW50cy9jb250cm9sYmFyXCI7XHJcbmltcG9ydCB7RnVsbHNjcmVlblRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9mdWxsc2NyZWVudG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7SHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2h1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1BsYXliYWNrVGltZUxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrdGltZWxhYmVsXCI7XHJcbmltcG9ydCB7UGxheWJhY2tUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZWVrQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJcIjtcclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7U2V0dGluZ3NQYW5lbH0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3BhbmVsXCI7XHJcbmltcG9ydCB7U2V0dGluZ3NUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvc2V0dGluZ3N0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VmlkZW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZGVvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1ZvbHVtZVRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWV0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtWUlRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92cnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1dhdGVybWFya30gZnJvbSBcIi4vY29tcG9uZW50cy93YXRlcm1hcmtcIjtcclxuaW1wb3J0IHtVSUNvbnRhaW5lcn0gZnJvbSBcIi4vY29tcG9uZW50cy91aWNvbnRhaW5lclwiO1xyXG5pbXBvcnQge0NvbnRhaW5lcn0gZnJvbSBcIi4vY29tcG9uZW50cy9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9sYWJlbFwiO1xyXG5pbXBvcnQge0F1ZGlvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9hdWRpb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtBdWRpb1RyYWNrU2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL2F1ZGlvdHJhY2tzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtDYXN0U3RhdHVzT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9jYXN0c3RhdHVzb3ZlcmxheVwiO1xyXG5pbXBvcnQge0Nhc3RUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvY2FzdHRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50cy9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtFcnJvck1lc3NhZ2VPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL2Vycm9ybWVzc2FnZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtSZWNvbW1lbmRhdGlvbk92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvcmVjb21tZW5kYXRpb25vdmVybGF5XCI7XHJcbmltcG9ydCB7U2Vla0JhckxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1N1YnRpdGxlT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1RpdGxlQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3RpdGxlYmFyXCI7XHJcbmltcG9ydCB7Vm9sdW1lQ29udHJvbEJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWVjb250cm9sYnV0dG9uXCI7XHJcblxyXG4vLyBPYmplY3QuYXNzaWduIHBvbHlmaWxsIGZvciBFUzUvSUU5XHJcbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RlL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ25cclxuaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduICE9PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgIE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbih0YXJnZXQ6IGFueSkge1xyXG4gICAgICAgIFwidXNlIHN0cmljdFwiO1xyXG4gICAgICAgIGlmICh0YXJnZXQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0XCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGFyZ2V0ID0gT2JqZWN0KHRhcmdldCk7XHJcbiAgICAgICAgZm9yIChsZXQgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgbGV0IHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XHJcbiAgICAgICAgICAgIGlmIChzb3VyY2UgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQga2V5IGluIHNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0YXJnZXQ7XHJcbiAgICB9O1xyXG59XHJcblxyXG4vLyBFeHBvc2UgY2xhc3NlcyB0byB3aW5kb3dcclxuLy8gSW5zcGlyZWQgYnkgaHR0cHM6Ly9rZWVzdGFsa3N0ZWNoLmNvbS8yMDE2LzA4L3N1cHBvcnQtYm90aC1ub2RlLWpzLWFuZC1icm93c2VyLWpzLWluLW9uZS10eXBlc2NyaXB0LWZpbGUvXHJcbi8vIFRPRE8gZmluZCBvdXQgaG93IFRTL0Jyb3dzZXJpZnkgY2FuIGNvbXBpbGUgdGhlIGNsYXNzZXMgdG8gcGxhaW4gSlMgd2l0aG91dCB0aGUgbW9kdWxlIHdyYXBwZXIgd2UgZG9uJ3QgbmVlZCB0byBleHBvc2UgY2xhc3NlcyB0byB0aGUgd2luZG93IHNjb3BlIG1hbnVhbGx5IGhlcmVcclxuKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICBsZXQgZXhwb3J0YWJsZXMgPSBbXHJcbiAgICAgICAgLy8gTWFuYWdlbWVudFxyXG4gICAgICAgIFVJTWFuYWdlcixcclxuICAgICAgICAvLyBDb21wb25lbnRzXHJcbiAgICAgICAgQXVkaW9RdWFsaXR5U2VsZWN0Qm94LFxyXG4gICAgICAgIEF1ZGlvVHJhY2tTZWxlY3RCb3gsXHJcbiAgICAgICAgQnV0dG9uLFxyXG4gICAgICAgIENhc3RTdGF0dXNPdmVybGF5LFxyXG4gICAgICAgIENhc3RUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgQ29tcG9uZW50LFxyXG4gICAgICAgIENvbnRhaW5lcixcclxuICAgICAgICBDb250cm9sQmFyLFxyXG4gICAgICAgIEVycm9yTWVzc2FnZU92ZXJsYXksXHJcbiAgICAgICAgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbixcclxuICAgICAgICBIdWdlUGxheWJhY2tUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgTGFiZWwsXHJcbiAgICAgICAgUGxheWJhY2tUaW1lTGFiZWwsXHJcbiAgICAgICAgUGxheWJhY2tUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgUmVjb21tZW5kYXRpb25PdmVybGF5LFxyXG4gICAgICAgIFNlZWtCYXIsXHJcbiAgICAgICAgU2Vla0JhckxhYmVsLFxyXG4gICAgICAgIFNlbGVjdEJveCxcclxuICAgICAgICBTZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgIFNldHRpbmdzVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFN1YnRpdGxlT3ZlcmxheSxcclxuICAgICAgICBTdWJ0aXRsZVNlbGVjdEJveCxcclxuICAgICAgICBUaXRsZUJhcixcclxuICAgICAgICBUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgVUlDb250YWluZXIsXHJcbiAgICAgICAgVmlkZW9RdWFsaXR5U2VsZWN0Qm94LFxyXG4gICAgICAgIFZvbHVtZUNvbnRyb2xCdXR0b24sXHJcbiAgICAgICAgVm9sdW1lVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFZSVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFdhdGVybWFyayxcclxuICAgIF07XHJcblxyXG4gICAgKHdpbmRvdyBhcyBhbnkpW1wiYml0bW92aW5cIl1bXCJwbGF5ZXJ1aVwiXSA9IHt9O1xyXG4gICAgbGV0IHVpc2NvcGUgPSAod2luZG93IGFzIGFueSlbXCJiaXRtb3ZpblwiXVtcInBsYXllcnVpXCJdO1xyXG5cclxuICAgIGlmICh3aW5kb3cpIHtcclxuICAgICAgICBleHBvcnRhYmxlcy5mb3JFYWNoKGV4cCA9PiB1aXNjb3BlW25hbWVvZihleHApXSA9IGV4cCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbmFtZW9mKGZuOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgZm4gPT09IFwidW5kZWZpbmVkXCIgPyBcIlwiIDogZm4ubmFtZSA/IGZuLm5hbWUgOiAoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gL15mdW5jdGlvblxccysoW1xcd1xcJF0rKVxccypcXCgvLmV4ZWMoZm4udG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiAhcmVzdWx0ID8gXCJcIiA6IHJlc3VsdFsxXTtcclxuICAgICAgICB9KSgpO1xyXG4gICAgfVxyXG5cclxufSgpKTsiLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbi8vIFRPRE8gY2hhbmdlIHRvIGludGVybmFsIChub3QgZXhwb3J0ZWQpIGNsYXNzLCBob3cgdG8gdXNlIGluIG90aGVyIGZpbGVzP1xyXG5leHBvcnQgY2xhc3MgVGltZW91dCB7XHJcblxyXG4gICAgcHJpdmF0ZSBkZWxheTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjYWxsYmFjazogKCkgPT4gdm9pZDtcclxuICAgIHByaXZhdGUgdGltZW91dEhhbmRsZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRlbGF5OiBudW1iZXIsIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5kZWxheSA9IGRlbGF5O1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB0aGlzLnRpbWVvdXRIYW5kbGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnRzIHRoZSB0aW1lb3V0IGFuZCBjYWxscyB0aGUgY2FsbGJhY2sgd2hlbiB0aGUgdGltZW91dCBkZWxheSBoYXMgcGFzc2VkLlxyXG4gICAgICovXHJcbiAgICBzdGFydCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIHRpbWVvdXQuIFRoZSBjYWxsYmFjayB3aWxsIG5vdCBiZSBjYWxsZWQgaWYgY2xlYXIgaXMgY2FsbGVkIGR1cmluZyB0aGUgdGltZW91dC5cclxuICAgICAqL1xyXG4gICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dEhhbmRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNldHMgdGhlIHBhc3NlZCB0aW1lb3V0IGRlbGF5IHRvIHplcm8uIENhbiBiZSB1c2VkIHRvIGRlZmVyIHRoZSBjYWxsaW5nIG9mIHRoZSBjYWxsYmFjay5cclxuICAgICAqL1xyXG4gICAgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgdGhpcy5kZWxheSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VUlDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdWljb250YWluZXJcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuL2RvbVwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0NvbnRhaW5lcn0gZnJvbSBcIi4vY29tcG9uZW50cy9jb250YWluZXJcIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0Z1bGxzY3JlZW5Ub2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZSVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZydG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7Vm9sdW1lVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZXRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1NlZWtCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvc2Vla2JhclwiO1xyXG5pbXBvcnQge1BsYXliYWNrVGltZUxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrdGltZWxhYmVsXCI7XHJcbmltcG9ydCB7SHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2h1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0NvbnRyb2xCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udHJvbGJhclwiO1xyXG5pbXBvcnQge05vQXJncywgRXZlbnREaXNwYXRjaGVyfSBmcm9tIFwiLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtTZXR0aW5nc1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1NldHRpbmdzUGFuZWwsIFNldHRpbmdzUGFuZWxJdGVtfSBmcm9tIFwiLi9jb21wb25lbnRzL3NldHRpbmdzcGFuZWxcIjtcclxuaW1wb3J0IHtWaWRlb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvdmlkZW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7V2F0ZXJtYXJrfSBmcm9tIFwiLi9jb21wb25lbnRzL3dhdGVybWFya1wiO1xyXG5pbXBvcnQge0xhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL2xhYmVsXCI7XHJcbmltcG9ydCB7QXVkaW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL2F1ZGlvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge0F1ZGlvVHJhY2tTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW90cmFja3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge1NlZWtCYXJMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9zZWVrYmFybGFiZWxcIjtcclxuaW1wb3J0IHtWb2x1bWVTbGlkZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdm9sdW1lc2xpZGVyXCI7XHJcbmltcG9ydCB7U3VidGl0bGVTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZU92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVvdmVybGF5XCI7XHJcbmltcG9ydCB7Vm9sdW1lQ29udHJvbEJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWVjb250cm9sYnV0dG9uXCI7XHJcbmltcG9ydCB7Q2FzdFRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9jYXN0dG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7Q2FzdFN0YXR1c092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvY2FzdHN0YXR1c292ZXJsYXlcIjtcclxuaW1wb3J0IHtFcnJvck1lc3NhZ2VPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL2Vycm9ybWVzc2FnZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtUaXRsZUJhcn0gZnJvbSBcIi4vY29tcG9uZW50cy90aXRsZWJhclwiO1xyXG5pbXBvcnQgUGxheWVyID0gYml0bW92aW4ucGxheWVyLlBsYXllcjtcclxuaW1wb3J0IHtSZWNvbW1lbmRhdGlvbk92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvcmVjb21tZW5kYXRpb25vdmVybGF5XCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVJUmVjb21tZW5kYXRpb25Db25maWcge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIHVybDogc3RyaW5nO1xyXG4gICAgdGh1bWJuYWlsPzogc3RyaW5nO1xyXG4gICAgZHVyYXRpb24/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlDb25maWcge1xyXG4gICAgbWV0YWRhdGE/OiB7XHJcbiAgICAgICAgdGl0bGU/OiBzdHJpbmdcclxuICAgIH07XHJcbiAgICByZWNvbW1lbmRhdGlvbnM/OiBVSVJlY29tbWVuZGF0aW9uQ29uZmlnW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSU1hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgcGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyO1xyXG4gICAgcHJpdmF0ZSB1aTogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz47XHJcbiAgICBwcml2YXRlIGNvbmZpZzogVUlDb25maWc7XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudHMgPSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSSBhcmVhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uTW91c2VFbnRlcjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIG1vdmVzIGluc2lkZSB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlTW92ZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIGxlYXZlcyB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlTGVhdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIGEgc2VlayBzdGFydHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25TZWVrOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBzZWVrIHRpbWVsaW5lIGlzIHNjcnViYmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla1ByZXZpZXc6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgbnVtYmVyPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gYSBzZWVrIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla2VkOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgdWk6IFVJQ29udGFpbmVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pIHtcclxuICAgICAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuICAgICAgICB0aGlzLnVpID0gdWk7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIGxldCBwbGF5ZXJJZCA9IHBsYXllci5nZXRGaWd1cmUoKS5wYXJlbnRFbGVtZW50LmlkO1xyXG5cclxuICAgICAgICAvLyBBZGQgVUkgZWxlbWVudHMgdG8gcGxheWVyXHJcbiAgICAgICAgbmV3IERPTShgIyR7cGxheWVySWR9YCkuYXBwZW5kKHVpLmdldERvbUVsZW1lbnQoKSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlndXJlQ29udHJvbHModWkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENvbmZpZygpOiBVSUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29uZmlndXJlQ29udHJvbHMoY29tcG9uZW50OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPikge1xyXG4gICAgICAgIGNvbXBvbmVudC5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgY29tcG9uZW50LmNvbmZpZ3VyZSh0aGlzLnBsYXllciwgdGhpcyk7XHJcblxyXG4gICAgICAgIGlmIChjb21wb25lbnQgaW5zdGFuY2VvZiBDb250YWluZXIpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2hpbGRDb21wb25lbnQgb2YgY29tcG9uZW50LmdldENvbXBvbmVudHMoKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb25maWd1cmVDb250cm9scyhjaGlsZENvbXBvbmVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uTW91c2VFbnRlcigpOiBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vbk1vdXNlRW50ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uTW91c2VNb3ZlKCk6IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uTW91c2VNb3ZlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvbk1vdXNlTGVhdmUoKTogRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb21wb25lbnRDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25Nb3VzZUxlYXZlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvblNlZWsoKTogRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vblNlZWs7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2Vla1ByZXZpZXcoKTogRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vblNlZWtQcmV2aWV3O1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvblNlZWtlZCgpOiBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uU2Vla2VkO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5ID0gY2xhc3Mge1xyXG4gICAgICAgIHN0YXRpYyBidWlsZERlZmF1bHRVSShwbGF5ZXI6IFBsYXllciwgY29uZmlnOiBVSUNvbmZpZyA9IHt9KTogVUlNYW5hZ2VyIHtcclxuICAgICAgICAgICAgcmV0dXJuIFVJTWFuYWdlci5GYWN0b3J5LmJ1aWxkTGVnYWN5VUkocGxheWVyLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTW9kZXJuVUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBzZXR0aW5nc1BhbmVsID0gbmV3IFNldHRpbmdzUGFuZWwoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlZpZGVvIFF1YWxpdHlcIiwgbmV3IFZpZGVvUXVhbGl0eVNlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBUcmFja1wiLCBuZXcgQXVkaW9UcmFja1NlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBRdWFsaXR5XCIsIG5ldyBBdWRpb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiU3VidGl0bGVzXCIsIG5ldyBTdWJ0aXRsZVNlbGVjdEJveCgpKVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzUGFuZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNlZWtCYXIoe2xhYmVsOiBuZXcgU2Vla0JhckxhYmVsKCl9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVlJUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1RvZ2dsZUJ1dHRvbih7c2V0dGluZ3NQYW5lbDogc2V0dGluZ3NQYW5lbH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0VG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24oKVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCB1aSA9IG5ldyBVSUNvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN1YnRpdGxlT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0U3RhdHVzT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBIdWdlUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgV2F0ZXJtYXJrKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlY29tbWVuZGF0aW9uT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xCYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFRpdGxlQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yTWVzc2FnZU92ZXJsYXkoKVxyXG4gICAgICAgICAgICAgICAgXSwgY3NzQ2xhc3NlczogW1widWktc2tpbi1tb2Rlcm5cIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVJTWFuYWdlcihwbGF5ZXIsIHVpLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5VUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBzZXR0aW5nc1BhbmVsID0gbmV3IFNldHRpbmdzUGFuZWwoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlZpZGVvIFF1YWxpdHlcIiwgbmV3IFZpZGVvUXVhbGl0eVNlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBUcmFja1wiLCBuZXcgQXVkaW9UcmFja1NlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBRdWFsaXR5XCIsIG5ldyBBdWRpb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiU3VidGl0bGVzXCIsIG5ldyBTdWJ0aXRsZVNlbGVjdEJveCgpKVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzUGFuZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNlZWtCYXIoe2xhYmVsOiBuZXcgU2Vla0JhckxhYmVsKCl9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVlJUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1RvZ2dsZUJ1dHRvbih7c2V0dGluZ3NQYW5lbDogc2V0dGluZ3NQYW5lbH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0VG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24oKVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCB1aSA9IG5ldyBVSUNvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN1YnRpdGxlT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0U3RhdHVzT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBIdWdlUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgV2F0ZXJtYXJrKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlY29tbWVuZGF0aW9uT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xCYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFRpdGxlQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yTWVzc2FnZU92ZXJsYXkoKVxyXG4gICAgICAgICAgICAgICAgXSwgY3NzQ2xhc3NlczogW1widWktc2tpbi1sZWdhY3lcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVJTWFuYWdlcihwbGF5ZXIsIHVpLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5Q2FzdFJlY2VpdmVyVUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU3VidGl0bGVPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBXYXRlcm1hcmsoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5IHVpLXNraW4tbGVnYWN5LWNhc3QtcmVjZWl2ZXJcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVJTWFuYWdlcihwbGF5ZXIsIHVpLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5VGVzdFVJKHBsYXllcjogUGxheWVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pOiBVSU1hbmFnZXIge1xyXG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJWaWRlbyBRdWFsaXR5XCIsIG5ldyBWaWRlb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gVHJhY2tcIiwgbmV3IEF1ZGlvVHJhY2tTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gUXVhbGl0eVwiLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlN1YnRpdGxlc1wiLCBuZXcgU3VidGl0bGVTZWxlY3RCb3goKSlcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udHJvbEJhciA9IG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtzZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKHtsYWJlbDogbmV3IFNlZWtCYXJMYWJlbCgpfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZSVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZVRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVTbGlkZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVDb250cm9sQnV0dG9uKHt2ZXJ0aWNhbDogZmFsc2V9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NUb2dnbGVCdXR0b24oe3NldHRpbmdzUGFuZWw6IHNldHRpbmdzUGFuZWx9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uKClcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTdWJ0aXRsZU92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFN0YXR1c092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFdhdGVybWFyaygpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWNvbW1lbmRhdGlvbk92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5XCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVSU1hbmFnZXIocGxheWVyLCB1aSwgY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBBcnJheVV0aWxzIHtcclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBpdGVtIGZyb20gYW4gYXJyYXkuXHJcbiAgICAgKiBAcGFyYW0gYXJyYXkgdGhlIGFycmF5IHRoYXQgbWF5IGNvbnRhaW4gdGhlIGl0ZW0gdG8gcmVtb3ZlXHJcbiAgICAgKiBAcGFyYW0gaXRlbSB0aGUgaXRlbSB0byByZW1vdmUgZnJvbSB0aGUgYXJyYXlcclxuICAgICAqIEByZXR1cm5zIHthbnl9IHRoZSByZW1vdmVkIGl0ZW0gb3IgbnVsbCBpZiBpdCB3YXNuJ3QgcGFydCBvZiB0aGUgYXJyYXlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZTxUPihhcnJheTogVFtdLCBpdGVtOiBUKTogVCB8IG51bGwge1xyXG4gICAgICAgIGxldCBpbmRleCA9IGFycmF5LmluZGV4T2YoaXRlbSk7XHJcblxyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5zcGxpY2UoaW5kZXgsIDEpWzBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBTdHJpbmdVdGlscyB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3JtYXRzIGEgbnVtYmVyIG9mIHNlY29uZHMgaW50byBhIHRpbWUgc3RyaW5nIHdpdGggdGhlIHBhdHRlcm4gaGg6bW06c3MuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHRvdGFsU2Vjb25kcyB0aGUgdG90YWwgbnVtYmVyIG9mIHNlY29uZHMgdG8gZm9ybWF0IHRvIHN0cmluZ1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIGZvcm1hdHRlZCB0aW1lIHN0cmluZ1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gc2Vjb25kc1RvVGltZSh0b3RhbFNlY29uZHM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGlzTmVnYXRpdmUgPSB0b3RhbFNlY29uZHMgPCAwO1xyXG5cclxuICAgICAgICBpZiAoaXNOZWdhdGl2ZSkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgdGltZSBpcyBuZWdhdGl2ZSwgd2UgbWFrZSBpdCBwb3NpdGl2ZSBmb3IgdGhlIGNhbGN1bGF0aW9uIGJlbG93XHJcbiAgICAgICAgICAgIC8vIChlbHNlIHdlJ2QgZ2V0IGFsbCBuZWdhdGl2ZSBudW1iZXJzKSBhbmQgcmVhdHRhY2ggdGhlIG5lZ2F0aXZlIHNpZ24gbGF0ZXIuXHJcbiAgICAgICAgICAgIHRvdGFsU2Vjb25kcyA9IC10b3RhbFNlY29uZHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTcGxpdCBpbnRvIHNlcGFyYXRlIHRpbWUgcGFydHNcclxuICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcyAvIDM2MDApO1xyXG4gICAgICAgIGxldCBtaW51dGVzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMgLyA2MCkgLSBob3VycyAqIDYwO1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMpICUgNjA7XHJcblxyXG4gICAgICAgIHJldHVybiAoaXNOZWdhdGl2ZSA/IFwiLVwiIDogXCJcIikgKyBsZWZ0UGFkV2l0aFplcm9zKGhvdXJzLCAyKSArIFwiOlwiICsgbGVmdFBhZFdpdGhaZXJvcyhtaW51dGVzLCAyKSArIFwiOlwiICsgbGVmdFBhZFdpdGhaZXJvcyhzZWNvbmRzLCAyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGEgbnVtYmVyIHRvIGEgc3RyaW5nIGFuZCBsZWZ0LXBhZHMgaXQgd2l0aCB6ZXJvcyB0byB0aGUgc3BlY2lmaWVkIGxlbmd0aC5cclxuICAgICAqIEV4YW1wbGU6IGxlZnRQYWRXaXRoWmVyb3MoMTIzLCA1KSA9PiBcIjAwMTIzXCJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbnVtIHRoZSBudW1iZXIgdG8gY29udmVydCB0byBzdHJpbmcgYW5kIHBhZCB3aXRoIHplcm9zXHJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIHRoZSBkZXNpcmVkIGxlbmd0aCBvZiB0aGUgcGFkZGVkIHN0cmluZ1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHBhZGRlZCBudW1iZXIgYXMgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGxlZnRQYWRXaXRoWmVyb3MobnVtOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgdGV4dCA9IG51bSArIFwiXCI7XHJcbiAgICAgICAgbGV0IHBhZGRpbmcgPSBcIjAwMDAwMDAwMDBcIi5zdWJzdHIoMCwgbGVuZ3RoIC0gdGV4dC5sZW5ndGgpO1xyXG4gICAgICAgIHJldHVybiBwYWRkaW5nICsgdGV4dDtcclxuICAgIH1cclxufSJdfQ==

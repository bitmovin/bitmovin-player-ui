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
var clickoverlay_1 = require("./clickoverlay");
/**
 * A simple click capture overlay for clickThroughUrls of ads.
 */
var AdClickOverlay = (function (_super) {
    __extends(AdClickOverlay, _super);
    function AdClickOverlay() {
        return _super.apply(this, arguments) || this;
    }
    AdClickOverlay.prototype.configure = function (player, uimanager) {
        var self = this;
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_STARTED, function (event) {
            self.setUrl(event.clickThroughUrl);
        });
        // Clear click-through URL when ad has finished
        var adFinishedHandler = function () {
            self.setUrl(null);
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_FINISHED, adFinishedHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_SKIPPED, adFinishedHandler);
        self.onClick.subscribe(function () {
            player.pause();
        });
    };
    return AdClickOverlay;
}(clickoverlay_1.ClickOverlay));
exports.AdClickOverlay = AdClickOverlay;
},{"./clickoverlay":9}],2:[function(require,module,exports){
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
/**
 * A label that displays a message about a running ad, optionally with a countdown.
 */
var AdMessageLabel = (function (_super) {
    __extends(AdMessageLabel, _super);
    function AdMessageLabel(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-label-ad-message",
            text: "This ad will end in {remainingTime} seconds."
        }, _this.config);
        return _this;
    }
    AdMessageLabel.prototype.configure = function (player, uimanager) {
        var self = this;
        var text = this.getConfig().text;
        var updateMessageHandler = function () {
            var remainingTime = Math.ceil(player.getDuration() - player.getCurrentTime());
            self.setText(text.replace("{remainingTime}", String(remainingTime)));
        };
        var adStartHandler = function () {
            player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateMessageHandler);
            player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, updateMessageHandler);
        };
        var adEndHandler = function () {
            player.removeEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateMessageHandler);
            player.removeEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, updateMessageHandler);
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_STARTED, adStartHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_SKIPPED, adEndHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_FINISHED, adEndHandler);
    };
    return AdMessageLabel;
}(label_1.Label));
exports.AdMessageLabel = AdMessageLabel;
},{"./label":16}],3:[function(require,module,exports){
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
 * A button that is displayed during ads and can be used to skip the ad.
 */
var AdSkipButton = (function (_super) {
    __extends(AdSkipButton, _super);
    function AdSkipButton(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-button-ad-skip",
            skipMessage: {
                countdown: "Skip ad in {remainingSkipWaitTime}",
                skip: "Skip ad"
            }
        }, _this.config);
        return _this;
    }
    AdSkipButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var config = this.getConfig(); // TODO get rid of generic cast
        var adEvent = null;
        var updateSkipMessageHandler = function () {
            // Display this button only if ad is skippable
            if (adEvent.skipOffset) {
                self.show();
            }
            else {
                self.hide();
            }
            // Update the skip message on the button
            if (player.getCurrentTime() < adEvent.skipOffset) {
                var remainingSkipWaitTime = Math.ceil(adEvent.skipOffset - player.getCurrentTime());
                self.setText(config.skipMessage.countdown.replace("{remainingSkipWaitTime}", String(remainingSkipWaitTime)));
            }
            else {
                self.setText(config.skipMessage.skip);
            }
        };
        var adStartHandler = function (event) {
            adEvent = event;
            updateSkipMessageHandler();
            player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateSkipMessageHandler);
            player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, updateSkipMessageHandler);
        };
        var adEndHandler = function () {
            player.removeEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateSkipMessageHandler);
            player.removeEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATE, updateSkipMessageHandler);
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_STARTED, adStartHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_SKIPPED, adEndHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_FINISHED, adEndHandler);
        self.onClick.subscribe(function () {
            // Try to skip the ad (this only works if it is skippable so we don't need to take extra care of that here)
            player.skipAd();
        });
    };
    return AdSkipButton;
}(button_1.Button));
exports.AdSkipButton = AdSkipButton;
},{"./button":6}],4:[function(require,module,exports){
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
        return _super.call(this, config) || this;
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
},{"./selectbox":23}],5:[function(require,module,exports){
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
        return _super.call(this, config) || this;
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
},{"./selectbox":23}],6:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.buttonEvents = {
            onClick: new eventdispatcher_1.EventDispatcher()
        };
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-button"
        }, _this.config);
        return _this;
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
    /**
     * Sets text on the label of the button.
     * @param text the text to put into the label of the button
     */
    Button.prototype.setText = function (text) {
        this.getDomElement().find(".label").html(text);
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
},{"../dom":37,"../eventdispatcher":38,"./component":10}],7:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.statusLabel = new label_1.Label({ cssClass: "ui-cast-status-label" });
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-cast-status-overlay",
            components: [_this.statusLabel],
            hidden: true
        }, _this.config);
        return _this;
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
},{"./container":11,"./label":16}],8:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-casttogglebutton",
            text: "Google Cast"
        }, _this.config);
        return _this;
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
        // Toggle button "on" state
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_START, function () {
            self.on();
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOP, function () {
            self.off();
        });
        // Hide button if Cast not available
        castAvailableHander();
    };
    return CastToggleButton;
}(togglebutton_1.ToggleButton));
exports.CastToggleButton = CastToggleButton;
},{"./togglebutton":29}],9:[function(require,module,exports){
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
 * A click overlay that opens an url in a new tab if clicked.
 */
var ClickOverlay = (function (_super) {
    __extends(ClickOverlay, _super);
    function ClickOverlay(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-clickoverlay"
        }, _this.config);
        return _this;
    }
    ClickOverlay.prototype.initialize = function () {
        _super.prototype.initialize.call(this);
        this.setUrl(this.config.url);
        var element = this.getDomElement();
        element.on("click", function () {
            if (element.data("url")) {
                window.open(element.data("url"), "_blank");
            }
        });
    };
    /**
     * Gets the URL that should be followed when the watermark is clicked.
     * @returns {string} the watermark URL
     */
    ClickOverlay.prototype.getUrl = function () {
        return this.getDomElement().data("url");
    };
    ClickOverlay.prototype.setUrl = function (url) {
        if (url === undefined || url == null) {
            url = "";
        }
        this.getDomElement().data("url", url);
    };
    return ClickOverlay;
}(button_1.Button));
exports.ClickOverlay = ClickOverlay;
},{"./button":6}],10:[function(require,module,exports){
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
    return Component;
}());
/**
 * The classname that is attached to the element when it is in the hidden state.
 * @type {string}
 */
Component.CLASS_HIDDEN = "hidden";
exports.Component = Component;
},{"../dom":37,"../eventdispatcher":38,"../guid":39}],11:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-container",
            components: []
        }, _this.config);
        return _this;
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
},{"../dom":37,"../utils":43,"./component":10}],12:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-controlbar",
            hidden: true,
            hideDelay: 5000
        }, _this.config);
        return _this;
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
},{"../timeout":41,"./container":11}],13:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.errorLabel = new label_1.Label({ cssClass: "ui-errormessage-label" });
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-errormessage-overlay",
            components: [_this.errorLabel],
            hidden: true
        }, _this.config);
        return _this;
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
},{"./container":11,"./label":16}],14:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-fullscreentogglebutton",
            text: "Fullscreen"
        }, _this.config);
        return _this;
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
},{"./togglebutton":29}],15:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-hugeplaybacktogglebutton",
            text: "Play/Pause"
        }, _this.config);
        return _this;
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
},{"../dom":37,"./playbacktogglebutton":19}],16:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-label"
        }, _this.config);
        return _this;
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
},{"../dom":37,"./component":10}],17:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.listSelectorEvents = {
            onItemAdded: new eventdispatcher_1.EventDispatcher(),
            onItemRemoved: new eventdispatcher_1.EventDispatcher(),
            onItemSelected: new eventdispatcher_1.EventDispatcher()
        };
        _this.config = _this.mergeConfig(config, {
            items: {},
            cssClass: "ui-listselector"
        }, _this.config);
        _this.items = _this.config.items;
        return _this;
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
},{"../eventdispatcher":38,"./component":10}],18:[function(require,module,exports){
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
var TimeLabelMode;
(function (TimeLabelMode) {
    TimeLabelMode[TimeLabelMode["CurrentTime"] = 0] = "CurrentTime";
    TimeLabelMode[TimeLabelMode["TotalTime"] = 1] = "TotalTime";
    TimeLabelMode[TimeLabelMode["CurrentAndTotalTime"] = 2] = "CurrentAndTotalTime";
})(TimeLabelMode = exports.TimeLabelMode || (exports.TimeLabelMode = {}));
/**
 * A label that display the current playback time and the total time through {@link PlaybackTimeLabel#setTime setTime}
 * or any string through {@link PlaybackTimeLabel#setText setText}.
 */
var PlaybackTimeLabel = (function (_super) {
    __extends(PlaybackTimeLabel, _super);
    function PlaybackTimeLabel(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-label",
            timeLabelMode: TimeLabelMode.CurrentAndTotalTime,
        }, _this.config);
        return _this;
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
        switch (this.config.timeLabelMode) {
            case TimeLabelMode.CurrentTime:
                this.setText("" + utils_1.StringUtils.secondsToTime(playbackSeconds));
                break;
            case TimeLabelMode.TotalTime:
                this.setText("" + utils_1.StringUtils.secondsToTime(durationSeconds));
                break;
            case TimeLabelMode.CurrentAndTotalTime:
                this.setText(utils_1.StringUtils.secondsToTime(playbackSeconds) + " / " + utils_1.StringUtils.secondsToTime(durationSeconds));
                break;
        }
    };
    return PlaybackTimeLabel;
}(label_1.Label));
exports.PlaybackTimeLabel = PlaybackTimeLabel;
},{"../utils":43,"./label":16}],19:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-playbacktogglebutton",
            text: "Play/Pause"
        }, _this.config);
        return _this;
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
},{"./togglebutton":29}],20:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-recommendation-overlay",
            hidden: true
        }, _this.config);
        return _this;
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
            // Dismiss ON_PLAYBACK_FINISHED events at the end of ads
            // TODO remove this workaround once issue #1278 is solved
            if (player.isAd()) {
                return;
            }
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-recommendation-item",
            itemConfig: null // this must be passed in from outside
        }, _this.config);
        return _this;
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
},{"../dom":37,"../utils":43,"./component":10,"./container":11}],21:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.seekBarEvents = {
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
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-seekbar"
        }, _this.config);
        _this.label = _this.config.label;
        return _this;
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
        }).append(new dom_1.DOM("div", {
            "class": "seekbar-playbackposition-marker"
        }));
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
    return SeekBar;
}(component_1.Component));
/**
 * The CSS class that is added to the DOM element while the seek bar is in "seeking" state.
 */
SeekBar.CLASS_SEEKING = "seeking";
exports.SeekBar = SeekBar;
},{"../dom":37,"../eventdispatcher":38,"./component":10}],22:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.label = new label_1.Label({ cssClasses: ["seekbar-label"] });
        _this.thumbnail = new component_1.Component({ cssClasses: ["seekbar-thumbnail"] });
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-seekbar-label",
            components: [new container_1.Container({ components: [_this.thumbnail, _this.label], cssClass: "seekbar-label-inner" })],
            hidden: true
        }, _this.config);
        return _this;
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
                "background-image": null,
                "display": null,
                "width": null,
                "height": null
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
},{"../utils":43,"./component":10,"./container":11,"./label":16}],23:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-selectbox"
        }, _this.config);
        return _this;
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
},{"../dom":37,"./listselector":17}],24:[function(require,module,exports){
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
var eventdispatcher_1 = require("../eventdispatcher");
/**
 * A panel containing a list of {@link SettingsPanelItem items} that represent labelled settings.
 */
var SettingsPanel = (function (_super) {
    __extends(SettingsPanel, _super);
    function SettingsPanel(config) {
        var _this = _super.call(this, config) || this;
        _this.settingsPanelEvents = {
            onSettingsStateChanged: new eventdispatcher_1.EventDispatcher()
        };
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-settings-panel",
            hideDelay: 3000
        }, _this.config);
        return _this;
    }
    SettingsPanel.prototype.configure = function (player, uimanager) {
        var self = this;
        var config = this.getConfig(); // TODO fix generics type inference
        if (config.hideDelay > -1) {
            var timeout_2 = new timeout_1.Timeout(config.hideDelay, function () {
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
        // Fire event when the state of a settings-item has changed
        var settingsStateChangedHandler = function () {
            self.onSettingsStateChangedEvent();
        };
        for (var _i = 0, _a = this.getItems(); _i < _a.length; _i++) {
            var component = _a[_i];
            component.onActiveChanged.subscribe(settingsStateChangedHandler);
        }
    };
    /**
     * Checks if there are active settings within this settings panel. An active setting is a setting that is visible
     * and enabled, which the user can interact with.
     * @returns {boolean} true if there are active settings, false if the panel is functionally empty to a user
     */
    SettingsPanel.prototype.hasActiveSettings = function () {
        for (var _i = 0, _a = this.getItems(); _i < _a.length; _i++) {
            var component = _a[_i];
            if (component.isActive()) {
                return true;
            }
        }
        return false;
    };
    SettingsPanel.prototype.getItems = function () {
        return this.config.components;
    };
    SettingsPanel.prototype.onSettingsStateChangedEvent = function () {
        this.settingsPanelEvents.onSettingsStateChanged.dispatch(this);
    };
    Object.defineProperty(SettingsPanel.prototype, "onSettingsStateChanged", {
        /**
         * Gets the event that is fired when one or more {@link SettingsPanelItem items} have changed state.
         * @returns {Event<SettingsPanel, NoArgs>}
         */
        get: function () {
            return this.settingsPanelEvents.onSettingsStateChanged.getEvent();
        },
        enumerable: true,
        configurable: true
    });
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
        var _this = _super.call(this, config) || this;
        _this.settingsPanelItemEvents = {
            onActiveChanged: new eventdispatcher_1.EventDispatcher()
        };
        _this.label = new label_1.Label({ text: label });
        _this.setting = selectBox;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-settings-panel-entry",
            components: [_this.label, _this.setting]
        }, _this.config);
        return _this;
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
            // Visibility might have changed and therefore the active state might have changed so we fire the event
            // TODO fire only when state has really changed (e.g. check if visibility has really changed)
            self.onActiveChangedEvent();
        };
        self.setting.onItemAdded.subscribe(handleConfigItemChanged);
        self.setting.onItemRemoved.subscribe(handleConfigItemChanged);
        // Initialize hidden state
        handleConfigItemChanged();
    };
    /**
     * Checks if this settings panel item is active, i.e. visible and enabled and a user can interact with it.
     * @returns {boolean} true if the panel is active, else false
     */
    SettingsPanelItem.prototype.isActive = function () {
        return this.isShown();
    };
    SettingsPanelItem.prototype.onActiveChangedEvent = function () {
        this.settingsPanelItemEvents.onActiveChanged.dispatch(this);
    };
    Object.defineProperty(SettingsPanelItem.prototype, "onActiveChanged", {
        /**
         * Gets the event that is fired when the "active" state of this item changes.
         * @see #isActive
         * @returns {Event<SettingsPanelItem, NoArgs>}
         */
        get: function () {
            return this.settingsPanelItemEvents.onActiveChanged.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    return SettingsPanelItem;
}(container_1.Container));
exports.SettingsPanelItem = SettingsPanelItem;
},{"../eventdispatcher":38,"../timeout":41,"./audioqualityselectbox":4,"./container":11,"./label":16,"./videoqualityselectbox":31}],25:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        if (!config.settingsPanel) {
            throw new Error("Required SettingsPanel is missing");
        }
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-settingstogglebutton",
            text: "Settings",
            settingsPanel: null,
            autoHideWhenNoActiveSettings: true
        }, _this.config);
        return _this;
    }
    SettingsToggleButton.prototype.configure = function (player, uimanager) {
        var self = this;
        var config = this.getConfig(); // TODO fix generics type inference
        var settingsPanel = config.settingsPanel;
        this.onClick.subscribe(function () {
            settingsPanel.toggleHidden();
        });
        settingsPanel.onShow.subscribe(function () {
            // Set toggle status to on when the settings panel shows
            self.on();
        });
        settingsPanel.onHide.subscribe(function () {
            // Set toggle status to off when the settings panel hides
            self.off();
        });
        // Handle automatic hiding of the button if there are no settings for the user to interact with
        if (config.autoHideWhenNoActiveSettings) {
            // Setup handler to show/hide button when the settings change
            var settingsPanelItemsChangedHandler = function () {
                if (settingsPanel.hasActiveSettings()) {
                    if (self.isHidden())
                        self.show();
                }
                else {
                    if (self.isShown())
                        self.hide();
                }
            };
            // Wire the handler to the event
            settingsPanel.onSettingsStateChanged.subscribe(settingsPanelItemsChangedHandler);
            // Call handler for first init at startup
            settingsPanelItemsChangedHandler();
        }
    };
    return SettingsToggleButton;
}(togglebutton_1.ToggleButton));
exports.SettingsToggleButton = SettingsToggleButton;
},{"./togglebutton":29}],26:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.subtitleLabel = new label_1.Label({ cssClass: "ui-subtitle-label" });
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-subtitle-overlay",
            components: [_this.subtitleLabel]
        }, _this.config);
        return _this;
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
},{"./container":11,"./label":16}],27:[function(require,module,exports){
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
        return _super.call(this, config) || this;
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
},{"./selectbox":23}],28:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.label = new label_1.Label({ cssClass: "ui-titlebar-label" });
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-titlebar",
            hidden: true,
            hideDelay: 5000,
            components: [_this.label]
        }, _this.config);
        return _this;
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
},{"../timeout":41,"./container":11,"./label":16}],29:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.toggleButtonEvents = {
            onToggle: new eventdispatcher_1.EventDispatcher(),
            onToggleOn: new eventdispatcher_1.EventDispatcher(),
            onToggleOff: new eventdispatcher_1.EventDispatcher()
        };
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-togglebutton"
        }, _this.config);
        return _this;
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
    return ToggleButton;
}(button_1.Button));
ToggleButton.CLASS_ON = "on";
ToggleButton.CLASS_OFF = "off";
exports.ToggleButton = ToggleButton;
},{"../eventdispatcher":38,"./button":6}],30:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.uiContainerEvents = {
            onMouseEnter: new eventdispatcher_1.EventDispatcher(),
            onMouseMove: new eventdispatcher_1.EventDispatcher(),
            onMouseLeave: new eventdispatcher_1.EventDispatcher()
        };
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-uicontainer"
        }, _this.config);
        return _this;
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
         * @returns {Event<UIContainer, NoArgs>}
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
         * @returns {Event<UIContainer, NoArgs>}
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
         * @returns {Event<UIContainer, NoArgs>}
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
},{"../eventdispatcher":38,"./container":11}],31:[function(require,module,exports){
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
        return _super.call(this, config) || this;
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
},{"./selectbox":23}],32:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.volumeToggleButton = new volumetogglebutton_1.VolumeToggleButton();
        _this.volumeSlider = new volumeslider_1.VolumeSlider({
            vertical: config.vertical != null ? config.vertical : true,
            hidden: true
        });
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-volumecontrolbutton",
            components: [_this.volumeToggleButton, _this.volumeSlider],
            hideDelay: 500
        }, _this.config);
        return _this;
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
},{"../timeout":41,"./container":11,"./volumeslider":33,"./volumetogglebutton":34}],33:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-volumeslider"
        }, _this.config);
        return _this;
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
},{"./seekbar":21}],34:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-volumetogglebutton",
            text: "Volume/Mute"
        }, _this.config);
        return _this;
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
},{"./togglebutton":29}],35:[function(require,module,exports){
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
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-vrtogglebutton",
            text: "VR"
        }, _this.config);
        return _this;
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
},{"./togglebutton":29}],36:[function(require,module,exports){
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
var clickoverlay_1 = require("./clickoverlay");
/**
 * A watermark overlay with a clickable logo.
 */
var Watermark = (function (_super) {
    __extends(Watermark, _super);
    function Watermark(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-watermark",
            url: "http://bitmovin.com"
        }, _this.config);
        return _this;
    }
    return Watermark;
}(clickoverlay_1.ClickOverlay));
exports.Watermark = Watermark;
},{"./clickoverlay":9}],37:[function(require,module,exports){
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
        if (something instanceof Array) {
            if (something.length > 0 && something[0] instanceof HTMLElement) {
                var elements = something;
                this.elements = elements;
            }
        }
        else if (something instanceof HTMLElement) {
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
            this.elements = this.findChildElements(selector);
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
    DOM.prototype.findChildElementsOfElement = function (element, selector) {
        var childElements = element.querySelectorAll(selector);
        // Convert NodeList to Array
        // https://toddmotto.com/a-comprehensive-dive-into-nodelists-arrays-converting-nodelists-and-understanding-the-dom/
        return [].slice.call(childElements);
    };
    DOM.prototype.findChildElements = function (selector) {
        var self = this;
        var allChildElements = [];
        if (this.elements) {
            this.forEach(function (element) {
                allChildElements = allChildElements.concat(self.findChildElementsOfElement(element, selector));
            });
        }
        else {
            return this.findChildElementsOfElement(document, selector);
        }
        return allChildElements;
    };
    /**
     * Finds all child elements of all elements matching the supplied selector.
     * @param selector the selector to match with child elements
     * @returns {DOM} a new DOM instance representing all matched children
     */
    DOM.prototype.find = function (selector) {
        var allChildElements = this.findChildElements(selector);
        return new DOM(allChildElements);
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
            childElements[_i] = arguments[_i];
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
     * Removes all elements from the DOM.
     */
    DOM.prototype.remove = function () {
        this.forEach(function (element) {
            var parent = element.parentNode;
            if (parent) {
                parent.removeChild(element);
            }
        });
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
        var _this = _super.call(this, listener) || this;
        _this.rateMs = rateMs;
        _this.lastFireTime = 0;
        // Wrap the event listener with an event listener that does the rate-limiting
        _this.rateLimitingEventListener = function (sender, args) {
            if (Date.now() - this.lastFireTime > this.rateMs) {
                // Only if enough time since the previous call has passed, call the
                // actual event listener and record the current time
                this.fireSuper(sender, args);
                this.lastFireTime = Date.now();
            }
        };
        return _this;
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
},{"./utils":43}],39:[function(require,module,exports){
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
},{}],40:[function(require,module,exports){
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
var clickoverlay_1 = require("./components/clickoverlay");
var adskipbutton_1 = require("./components/adskipbutton");
var admessagelabel_1 = require("./components/admessagelabel");
var adclickoverlay_1 = require("./components/adclickoverlay");
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
        adclickoverlay_1.AdClickOverlay,
        admessagelabel_1.AdMessageLabel,
        adskipbutton_1.AdSkipButton,
        audioqualityselectbox_1.AudioQualitySelectBox,
        audiotrackselectbox_1.AudioTrackSelectBox,
        button_1.Button,
        caststatusoverlay_1.CastStatusOverlay,
        casttogglebutton_1.CastToggleButton,
        clickoverlay_1.ClickOverlay,
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
},{"./components/adclickoverlay":1,"./components/admessagelabel":2,"./components/adskipbutton":3,"./components/audioqualityselectbox":4,"./components/audiotrackselectbox":5,"./components/button":6,"./components/caststatusoverlay":7,"./components/casttogglebutton":8,"./components/clickoverlay":9,"./components/component":10,"./components/container":11,"./components/controlbar":12,"./components/errormessageoverlay":13,"./components/fullscreentogglebutton":14,"./components/hugeplaybacktogglebutton":15,"./components/label":16,"./components/playbacktimelabel":18,"./components/playbacktogglebutton":19,"./components/recommendationoverlay":20,"./components/seekbar":21,"./components/seekbarlabel":22,"./components/selectbox":23,"./components/settingspanel":24,"./components/settingstogglebutton":25,"./components/subtitleoverlay":26,"./components/subtitleselectbox":27,"./components/titlebar":28,"./components/togglebutton":29,"./components/uicontainer":30,"./components/videoqualityselectbox":31,"./components/volumecontrolbutton":32,"./components/volumetogglebutton":34,"./components/vrtogglebutton":35,"./components/watermark":36,"./uimanager":42}],41:[function(require,module,exports){
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
},{}],42:[function(require,module,exports){
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
var component_1 = require("./components/component");
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
var admessagelabel_1 = require("./components/admessagelabel");
var adskipbutton_1 = require("./components/adskipbutton");
var adclickoverlay_1 = require("./components/adclickoverlay");
var EVENT = bitmovin.player.EVENT;
var utils_1 = require("./utils");
var UIManager = (function () {
    function UIManager(player, playerUi, adsUi, config) {
        if (config === void 0) { config = {}; }
        this.uiPlayerWrappers = [];
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
        this.playerUi = playerUi;
        this.adsUi = adsUi;
        this.config = config;
        this.managerPlayerWrapper = new PlayerWrapper(player);
        var playerId = player.getFigure().parentElement.id;
        this.playerElement = new dom_1.DOM("#" + playerId);
        // Add UI elements to player
        this.addUi(playerUi);
        // Ads UI
        if (adsUi) {
            this.addUi(adsUi);
            adsUi.hide();
            var enterAdsUi = function (event) {
                console.log(event);
                playerUi.hide();
                // Display the ads UI (only for VAST ads, other clients bring their own UI)
                if (event.clientType === "vast") {
                    adsUi.show();
                }
            };
            var exitAdsUi = function () {
                adsUi.hide();
                playerUi.show();
            };
            // React to ad events from the player
            this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_STARTED, enterAdsUi);
            this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_FINISHED, exitAdsUi);
            this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_SKIPPED, exitAdsUi);
        }
    }
    UIManager.prototype.getConfig = function () {
        return this.config;
    };
    UIManager.prototype.configureControls = function (component) {
        var playerWrapper = this.uiPlayerWrappers[component];
        component.initialize();
        component.configure(playerWrapper.getPlayer(), this);
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
    UIManager.prototype.addUi = function (ui) {
        this.playerElement.append(ui.getDomElement());
        this.uiPlayerWrappers[ui] = new PlayerWrapper(this.player);
        this.configureControls(ui);
    };
    UIManager.prototype.releaseUi = function (ui) {
        ui.getDomElement().remove();
        this.uiPlayerWrappers[ui].clearEventHandlers();
    };
    UIManager.prototype.release = function () {
        this.releaseUi(this.playerUi);
        if (this.adsUi) {
            this.releaseUi(this.adsUi);
        }
        this.managerPlayerWrapper.clearEventHandlers();
    };
    return UIManager;
}());
UIManager.Factory = (function () {
    function class_1() {
    }
    class_1.buildDefaultUI = function (player, config) {
        if (config === void 0) { config = {}; }
        return UIManager.Factory.buildModernUI(player, config);
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
                new container_1.Container({
                    components: [
                        new playbacktimelabel_1.PlaybackTimeLabel({ timeLabelMode: playbacktimelabel_1.TimeLabelMode.CurrentTime }),
                        new seekbar_1.SeekBar({ label: new seekbarlabel_1.SeekBarLabel() }),
                        new playbacktimelabel_1.PlaybackTimeLabel({ timeLabelMode: playbacktimelabel_1.TimeLabelMode.TotalTime }),
                    ],
                    cssClasses: ['controlbar-top']
                }),
                new container_1.Container({
                    components: [
                        new playbacktogglebutton_1.PlaybackToggleButton(),
                        new volumetogglebutton_1.VolumeToggleButton(),
                        new volumeslider_1.VolumeSlider(),
                        new component_1.Component({ cssClass: 'spacer' }),
                        new casttogglebutton_1.CastToggleButton(),
                        new vrtogglebutton_1.VRToggleButton(),
                        new settingstogglebutton_1.SettingsToggleButton({ settingsPanel: settingsPanel }),
                        new fullscreentogglebutton_1.FullscreenToggleButton(),
                    ],
                    cssClasses: ['controlbar-bottom']
                }),
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
        return new UIManager(player, ui, null, config);
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
        var adsUi = new uicontainer_1.UIContainer({
            components: [
                new adclickoverlay_1.AdClickOverlay(),
                new controlbar_1.ControlBar({
                    components: [
                        new playbacktogglebutton_1.PlaybackToggleButton(),
                        new admessagelabel_1.AdMessageLabel(),
                        new volumecontrolbutton_1.VolumeControlButton(),
                        new fullscreentogglebutton_1.FullscreenToggleButton()
                    ]
                }),
                new adskipbutton_1.AdSkipButton()
            ], cssClasses: ["ui-skin-legacy ads"]
        });
        return new UIManager(player, ui, adsUi, config);
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
        return new UIManager(player, ui, null, config);
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
        return new UIManager(player, ui, null, config);
    };
    return class_1;
}());
exports.UIManager = UIManager;
/**
 * Wraps the player to track event handlers and provide a simple method to remove all registered event
 * handlers from the player.
 */
var PlayerWrapper = (function () {
    function PlayerWrapper(player) {
        this.eventHandlers = {};
        this.player = player;
        var self = this;
        // Collect all public API methods of the player
        var methods = [];
        for (var member in player) {
            if (typeof player[member] === "function") {
                methods.push(member);
            }
        }
        // Create wrapper object and add function wrappers for all API methods that do nothing but calling the base method on the player
        var wrapper = {};
        var _loop_1 = function (member) {
            wrapper[member] = function () {
                // console.log("called " + member); // track method calls on the player
                return player[member].apply(player, arguments);
            };
        };
        for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
            var member = methods_1[_i];
            _loop_1(member);
        }
        // Explicitly add a wrapper method for "addEventHandler" that adds added event handlers to the event list
        wrapper.addEventHandler = function (eventType, callback) {
            player.addEventHandler(eventType, callback);
            if (!self.eventHandlers[eventType]) {
                self.eventHandlers[eventType] = [];
            }
            self.eventHandlers[eventType].push(callback);
            return wrapper;
        };
        // Explicitly add a wrapper method for "removeEventHandler" that removes removed event handlers from the event list
        wrapper.removeEventHandler = function (eventType, callback) {
            player.removeEventHandler(eventType, callback);
            if (self.eventHandlers[eventType]) {
                utils_1.ArrayUtils.remove(self.eventHandlers[eventType], callback);
            }
            return wrapper;
        };
        this.wrapper = wrapper;
    }
    /**
     * Returns a wrapped player object that can be used on place of the normal player object.
     * @returns {Player} a wrapped player
     */
    PlayerWrapper.prototype.getPlayer = function () {
        return this.wrapper;
    };
    /**
     * Clears all registered event handlers from the player that were added through the wrapped player.
     */
    PlayerWrapper.prototype.clearEventHandlers = function () {
        for (var eventType in this.eventHandlers) {
            for (var _i = 0, _a = this.eventHandlers[eventType]; _i < _a.length; _i++) {
                var callback = _a[_i];
                this.player.removeEventHandler(eventType, callback);
            }
        }
    };
    return PlayerWrapper;
}());
},{"./components/adclickoverlay":1,"./components/admessagelabel":2,"./components/adskipbutton":3,"./components/audioqualityselectbox":4,"./components/audiotrackselectbox":5,"./components/caststatusoverlay":7,"./components/casttogglebutton":8,"./components/component":10,"./components/container":11,"./components/controlbar":12,"./components/errormessageoverlay":13,"./components/fullscreentogglebutton":14,"./components/hugeplaybacktogglebutton":15,"./components/playbacktimelabel":18,"./components/playbacktogglebutton":19,"./components/recommendationoverlay":20,"./components/seekbar":21,"./components/seekbarlabel":22,"./components/settingspanel":24,"./components/settingstogglebutton":25,"./components/subtitleoverlay":26,"./components/subtitleselectbox":27,"./components/titlebar":28,"./components/uicontainer":30,"./components/videoqualityselectbox":31,"./components/volumecontrolbutton":32,"./components/volumeslider":33,"./components/volumetogglebutton":34,"./components/vrtogglebutton":35,"./components/watermark":36,"./dom":37,"./eventdispatcher":38,"./utils":43}],43:[function(require,module,exports){
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
},{}]},{},[40])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvY29tcG9uZW50cy9hZGNsaWNrb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL2FkbWVzc2FnZWxhYmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYWRza2lwYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYXVkaW9xdWFsaXR5c2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYXVkaW90cmFja3NlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL2J1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2Nhc3RzdGF0dXNvdmVybGF5LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY2FzdHRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2NsaWNrb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL2NvbXBvbmVudC50cyIsInNyYy90cy9jb21wb25lbnRzL2NvbnRhaW5lci50cyIsInNyYy90cy9jb21wb25lbnRzL2NvbnRyb2xiYXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy9lcnJvcm1lc3NhZ2VvdmVybGF5LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2h1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2xhYmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvbGlzdHNlbGVjdG9yLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvcGxheWJhY2t0aW1lbGFiZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9wbGF5YmFja3RvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3JlY29tbWVuZGF0aW9ub3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL3NlZWtiYXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZWVrYmFybGFiZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZWxlY3Rib3gudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZXR0aW5nc3BhbmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc2V0dGluZ3N0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy9zdWJ0aXRsZW92ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zdWJ0aXRsZXNlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3RpdGxlYmFyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdWljb250YWluZXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy92aWRlb3F1YWxpdHlzZWxlY3Rib3gudHMiLCJzcmMvdHMvY29tcG9uZW50cy92b2x1bWVjb250cm9sYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdm9sdW1lc2xpZGVyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdm9sdW1ldG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdnJ0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy93YXRlcm1hcmsudHMiLCJzcmMvdHMvZG9tLnRzIiwic3JjL3RzL2V2ZW50ZGlzcGF0Y2hlci50cyIsInNyYy90cy9ndWlkLnRzIiwic3JjL3RzL21haW4udHMiLCJzcmMvdHMvdGltZW91dC50cyIsInNyYy90cy91aW1hbmFnZXIudHMiLCJzcmMvdHMvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7OztHQU9HOzs7Ozs7O0FBRUgsK0NBQTRDO0FBRzVDOztHQUVHO0FBQ0g7SUFBb0Msa0NBQVk7SUFBaEQ7O0lBb0JBLENBQUM7SUFsQkcsa0NBQVMsR0FBVCxVQUFVLE1BQThCLEVBQUUsU0FBb0I7UUFDMUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBRWhCLE1BQU0sQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLE1B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IihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NsaWNrT3ZlcmxheX0gZnJvbSBcIi4vY2xpY2tvdmVybGF5XCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzaW1wbGUgY2xpY2sgY2FwdHVyZSBvdmVybGF5IGZvciBjbGlja1Rocm91Z2hVcmxzIG9mIGFkcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBZENsaWNrT3ZlcmxheSBleHRlbmRzIENsaWNrT3ZlcmxheSB7XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX1NUQVJURUQsIGZ1bmN0aW9uIChldmVudDogYml0bW92aW4ucGxheWVyLkFkU3RhcnRlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0VXJsKGV2ZW50LmNsaWNrVGhyb3VnaFVybCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENsZWFyIGNsaWNrLXRocm91Z2ggVVJMIHdoZW4gYWQgaGFzIGZpbmlzaGVkXHJcbiAgICAgICAgbGV0IGFkRmluaXNoZWRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFVybChudWxsKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX0ZJTklTSEVELCBhZEZpbmlzaGVkSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfU0tJUFBFRCwgYWRGaW5pc2hlZEhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEEgbGFiZWwgdGhhdCBkaXNwbGF5cyBhIG1lc3NhZ2UgYWJvdXQgYSBydW5uaW5nIGFkLCBvcHRpb25hbGx5IHdpdGggYSBjb3VudGRvd24uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQWRNZXNzYWdlTGFiZWwgZXh0ZW5kcyBMYWJlbDxMYWJlbENvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGFiZWxDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktbGFiZWwtYWQtbWVzc2FnZVwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlRoaXMgYWQgd2lsbCBlbmQgaW4ge3JlbWFpbmluZ1RpbWV9IHNlY29uZHMuXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHRleHQgPSB0aGlzLmdldENvbmZpZygpLnRleHQ7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVNZXNzYWdlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHJlbWFpbmluZ1RpbWUgPSBNYXRoLmNlaWwocGxheWVyLmdldER1cmF0aW9uKCkgLSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0VGV4dCh0ZXh0LnJlcGxhY2UoXCJ7cmVtYWluaW5nVGltZX1cIiwgU3RyaW5nKHJlbWFpbmluZ1RpbWUpKSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGFkU3RhcnRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURSwgdXBkYXRlTWVzc2FnZUhhbmRsZXIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBhZEVuZEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5yZW1vdmVFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgdXBkYXRlTWVzc2FnZUhhbmRsZXIpO1xyXG4gICAgICAgICAgICBwbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1RJTUVfVVBEQVRFLCB1cGRhdGVNZXNzYWdlSGFuZGxlcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfU1RBUlRFRCwgYWRTdGFydEhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX1NLSVBQRUQsIGFkRW5kSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfRklOSVNIRUQsIGFkRW5kSGFuZGxlcik7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7QnV0dG9uQ29uZmlnLCBCdXR0b259IGZyb20gXCIuL2J1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgU2tpcE1lc3NhZ2UgPSBiaXRtb3Zpbi5wbGF5ZXIuU2tpcE1lc3NhZ2U7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgQWRTa2lwQnV0dG9ufS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQWRTa2lwQnV0dG9uQ29uZmlnIGV4dGVuZHMgQnV0dG9uQ29uZmlnIHtcclxuICAgIHNraXBNZXNzYWdlPzoge1xyXG4gICAgICAgIGNvdW50ZG93bjogc3RyaW5nO1xyXG4gICAgICAgIHNraXA6IHN0cmluZztcclxuICAgIH07XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IGlzIGRpc3BsYXllZCBkdXJpbmcgYWRzIGFuZCBjYW4gYmUgdXNlZCB0byBza2lwIHRoZSBhZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBZFNraXBCdXR0b24gZXh0ZW5kcyBCdXR0b248QWRTa2lwQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBBZFNraXBCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIDxBZFNraXBCdXR0b25Db25maWc+e1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1idXR0b24tYWQtc2tpcFwiLFxyXG4gICAgICAgICAgICBza2lwTWVzc2FnZToge1xyXG4gICAgICAgICAgICAgICAgY291bnRkb3duOiBcIlNraXAgYWQgaW4ge3JlbWFpbmluZ1NraXBXYWl0VGltZX1cIixcclxuICAgICAgICAgICAgICAgIHNraXA6IFwiU2tpcCBhZFwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IDxBZFNraXBCdXR0b25Db25maWc+dGhpcy5nZXRDb25maWcoKTsgLy8gVE9ETyBnZXQgcmlkIG9mIGdlbmVyaWMgY2FzdFxyXG4gICAgICAgIGxldCBhZEV2ZW50ID0gPGJpdG1vdmluLnBsYXllci5BZFN0YXJ0ZWRFdmVudD5udWxsO1xyXG5cclxuICAgICAgICBsZXQgdXBkYXRlU2tpcE1lc3NhZ2VIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBEaXNwbGF5IHRoaXMgYnV0dG9uIG9ubHkgaWYgYWQgaXMgc2tpcHBhYmxlXHJcbiAgICAgICAgICAgIGlmIChhZEV2ZW50LnNraXBPZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgc2tpcCBtZXNzYWdlIG9uIHRoZSBidXR0b25cclxuICAgICAgICAgICAgaWYgKHBsYXllci5nZXRDdXJyZW50VGltZSgpIDwgYWRFdmVudC5za2lwT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVtYWluaW5nU2tpcFdhaXRUaW1lID0gTWF0aC5jZWlsKGFkRXZlbnQuc2tpcE9mZnNldCAtIHBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGV4dChjb25maWcuc2tpcE1lc3NhZ2UuY291bnRkb3duLnJlcGxhY2UoXCJ7cmVtYWluaW5nU2tpcFdhaXRUaW1lfVwiLCBTdHJpbmcocmVtYWluaW5nU2tpcFdhaXRUaW1lKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUZXh0KGNvbmZpZy5za2lwTWVzc2FnZS5za2lwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCBhZFN0YXJ0SGFuZGxlciA9IGZ1bmN0aW9uIChldmVudDogYml0bW92aW4ucGxheWVyLkFkU3RhcnRlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIGFkRXZlbnQgPSBldmVudDtcclxuICAgICAgICAgICAgdXBkYXRlU2tpcE1lc3NhZ2VIYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHVwZGF0ZVNraXBNZXNzYWdlSGFuZGxlcik7XHJcbiAgICAgICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfVElNRV9VUERBVEUsIHVwZGF0ZVNraXBNZXNzYWdlSGFuZGxlcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGFkRW5kSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcGxheWVyLnJlbW92ZUV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9DSEFOR0VELCB1cGRhdGVTa2lwTWVzc2FnZUhhbmRsZXIpO1xyXG4gICAgICAgICAgICBwbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1RJTUVfVVBEQVRFLCB1cGRhdGVTa2lwTWVzc2FnZUhhbmRsZXIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX1NUQVJURUQsIGFkU3RhcnRIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9TS0lQUEVELCBhZEVuZEhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX0ZJTklTSEVELCBhZEVuZEhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVHJ5IHRvIHNraXAgdGhlIGFkICh0aGlzIG9ubHkgd29ya3MgaWYgaXQgaXMgc2tpcHBhYmxlIHNvIHdlIGRvbid0IG5lZWQgdG8gdGFrZSBleHRyYSBjYXJlIG9mIHRoYXQgaGVyZSlcclxuICAgICAgICAgICAgcGxheWVyLnNraXBBZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gXCJhdXRvXCIgYW5kIHRoZSBhdmFpbGFibGUgYXVkaW8gcXVhbGl0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEF1ZGlvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVBdWRpb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF1ZGlvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZUF1ZGlvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGF1ZGlvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdWRpb1F1YWxpdHkgb2YgYXVkaW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbShhdWRpb1F1YWxpdHkuaWQsIGF1ZGlvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBBdWRpb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldEF1ZGlvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgdXBkYXRlQXVkaW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gYXVkaW8gdHJhY2sgaGFzIGNoYW5nZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZUF1ZGlvUXVhbGl0aWVzKTsgLy8gVXBkYXRlIHF1YWxpdGllcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlQXVkaW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0RPV05MT0FEX1FVQUxJVFlfQ0hBTkdFLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gcGxheWVyLmdldERvd25sb2FkZWRBdWRpb0RhdGEoKTtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RJdGVtKGRhdGEuaXNBdXRvID8gXCJhdXRvXCIgOiBkYXRhLmlkKTtcclxuICAgICAgICB9KTsgLy8gVXBkYXRlIHF1YWxpdHkgc2VsZWN0aW9uIHdoZW4gcXVhbGl0eSBpcyBjaGFuZ2VkIChmcm9tIG91dHNpZGUpXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHF1YWxpdGllcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlQXVkaW9RdWFsaXRpZXMoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzZWxlY3QgYm94IHByb3ZpZGluZyBhIHNlbGVjdGlvbiBiZXR3ZWVuIGF2YWlsYWJsZSBhdWRpbyB0cmFja3MgKGUuZy4gZGlmZmVyZW50IGxhbmd1YWdlcykuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQXVkaW9UcmFja1NlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVBdWRpb1RyYWNrcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF1ZGlvVHJhY2tzID0gcGxheWVyLmdldEF2YWlsYWJsZUF1ZGlvKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBhdWRpbyB0cmFja3NcclxuICAgICAgICAgICAgZm9yIChsZXQgYXVkaW9UcmFjayBvZiBhdWRpb1RyYWNrcykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRJdGVtKGF1ZGlvVHJhY2suaWQsIGF1ZGlvVHJhY2subGFiZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogQXVkaW9UcmFja1NlbGVjdEJveCwgdmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0QXVkaW8odmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgYXVkaW9UcmFja0hhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50QXVkaW9UcmFjayA9IHBsYXllci5nZXRBdWRpbygpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oY3VycmVudEF1ZGlvVHJhY2suaWQpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgYXVkaW9UcmFja0hhbmRsZXIpOyAvLyBVcGRhdGUgc2VsZWN0aW9uIHdoZW4gc2VsZWN0ZWQgdHJhY2sgaGFzIGNoYW5nZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZUF1ZGlvVHJhY2tzKTsgLy8gVXBkYXRlIHRyYWNrcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlQXVkaW9UcmFja3MpOyAvLyBVcGRhdGUgdHJhY2tzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG5cclxuICAgICAgICAvLyBQb3B1bGF0ZSB0cmFja3MgYXQgc3RhcnR1cFxyXG4gICAgICAgIHVwZGF0ZUF1ZGlvVHJhY2tzKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgTm9BcmdzLCBFdmVudH0gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBCdXR0b259IGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRleHQgb24gdGhlIGJ1dHRvbi5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc2ltcGxlIGNsaWNrYWJsZSBidXR0b24uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQnV0dG9uPENvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8QnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBidXR0b25FdmVudHMgPSB7XHJcbiAgICAgICAgb25DbGljazogbmV3IEV2ZW50RGlzcGF0Y2hlcjxCdXR0b248Q29uZmlnPiwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQnV0dG9uQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1idXR0b25cIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGJ1dHRvbiBlbGVtZW50IHdpdGggdGhlIHRleHQgbGFiZWxcclxuICAgICAgICBsZXQgYnV0dG9uRWxlbWVudCA9IG5ldyBET00oXCJidXR0b25cIiwge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJidXR0b25cIixcclxuICAgICAgICAgICAgXCJpZFwiOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiB0aGlzLmdldENzc0NsYXNzZXMoKVxyXG4gICAgICAgIH0pLmFwcGVuZChuZXcgRE9NKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJsYWJlbFwiXHJcbiAgICAgICAgfSkuaHRtbCh0aGlzLmNvbmZpZy50ZXh0KSk7XHJcblxyXG4gICAgICAgIC8vIExpc3RlbiBmb3IgdGhlIGNsaWNrIGV2ZW50IG9uIHRoZSBidXR0b24gZWxlbWVudCBhbmQgdHJpZ2dlciB0aGUgY29ycmVzcG9uZGluZyBldmVudCBvbiB0aGUgYnV0dG9uIGNvbXBvbmVudFxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25DbGlja0V2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBidXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0ZXh0IG9uIHRoZSBsYWJlbCBvZiB0aGUgYnV0dG9uLlxyXG4gICAgICogQHBhcmFtIHRleHQgdGhlIHRleHQgdG8gcHV0IGludG8gdGhlIGxhYmVsIG9mIHRoZSBidXR0b25cclxuICAgICAqL1xyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5maW5kKFwiLmxhYmVsXCIpLmh0bWwodGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uQ2xpY2tFdmVudCgpIHtcclxuICAgICAgICB0aGlzLmJ1dHRvbkV2ZW50cy5vbkNsaWNrLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBidXR0b24gaXMgY2xpY2tlZC5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25DbGljaygpOiBFdmVudDxCdXR0b248Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnV0dG9uRXZlbnRzLm9uQ2xpY2suZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgQ2FzdFdhaXRpbmdGb3JEZXZpY2VFdmVudCA9IGJpdG1vdmluLnBsYXllci5DYXN0V2FpdGluZ0ZvckRldmljZUV2ZW50O1xyXG5pbXBvcnQgQ2FzdExhdW5jaGVkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuQ2FzdExhdW5jaGVkRXZlbnQ7XHJcbmltcG9ydCBDYXN0U3RvcHBlZEV2ZW50ID0gYml0bW92aW4ucGxheWVyLkNhc3RTdG9wcGVkRXZlbnQ7XHJcblxyXG4vKipcclxuICogT3ZlcmxheXMgdGhlIHBsYXllciBhbmQgZGlzcGxheXMgdGhlIHN0YXR1cyBvZiBhIENhc3Qgc2Vzc2lvbi5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDYXN0U3RhdHVzT3ZlcmxheSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHN0YXR1c0xhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzTGFiZWwgPSBuZXcgTGFiZWw8TGFiZWxDb25maWc+KHtjc3NDbGFzczogXCJ1aS1jYXN0LXN0YXR1cy1sYWJlbFwifSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY2FzdC1zdGF0dXMtb3ZlcmxheVwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy5zdGF0dXNMYWJlbF0sXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgY2FzdERldmljZU5hbWUgPSBcInVua25vd25cIjtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVEFSVCwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFNob3cgQ2FzdCBzdGF0dXMgd2hlbiBhIHNlc3Npb24gaXMgYmVpbmcgc3RhcnRlZFxyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgc2VsZi5zdGF0dXNMYWJlbC5zZXRUZXh0KFwiU2VsZWN0IGEgQ2FzdCBkZXZpY2VcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9XQUlUSU5HX0ZPUl9ERVZJQ0UsIGZ1bmN0aW9uIChldmVudDogQ2FzdFdhaXRpbmdGb3JEZXZpY2VFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBHZXQgZGV2aWNlIG5hbWUgYW5kIHVwZGF0ZSBzdGF0dXMgdGV4dCB3aGlsZSBjb25uZWN0aW5nXHJcbiAgICAgICAgICAgIGNhc3REZXZpY2VOYW1lID0gZXZlbnQuY2FzdFBheWxvYWQuZGV2aWNlTmFtZTtcclxuICAgICAgICAgICAgc2VsZi5zdGF0dXNMYWJlbC5zZXRUZXh0KGBDb25uZWN0aW5nIHRvIDxzdHJvbmc+JHtjYXN0RGV2aWNlTmFtZX08L3N0cm9uZz4uLi5gKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0xBVU5DSEVELCBmdW5jdGlvbiAoZXZlbnQ6IENhc3RMYXVuY2hlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFNlc3Npb24gaXMgc3RhcnRlZCBvciByZXN1bWVkXHJcbiAgICAgICAgICAgIC8vIEZvciBjYXNlcyB3aGVuIGEgc2Vzc2lvbiBpcyByZXN1bWVkLCB3ZSBkbyBub3QgcmVjZWl2ZSB0aGUgcHJldmlvdXMgZXZlbnRzIGFuZCB0aGVyZWZvcmUgc2hvdyB0aGUgc3RhdHVzIHBhbmVsIGhlcmUgdG9vXHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICBzZWxmLnN0YXR1c0xhYmVsLnNldFRleHQoYFBsYXlpbmcgb24gPHN0cm9uZz4ke2Nhc3REZXZpY2VOYW1lfTwvc3Ryb25nPmApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RPUCwgZnVuY3Rpb24gKGV2ZW50OiBDYXN0U3RvcHBlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIENhc3Qgc2Vzc2lvbiBnb25lLCBoaWRlIHRoZSBzdGF0dXMgcGFuZWxcclxuICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uLCBUb2dnbGVCdXR0b25Db25maWd9IGZyb20gXCIuL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyBjYXN0aW5nIHRvIGEgQ2FzdCByZWNlaXZlci5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDYXN0VG9nZ2xlQnV0dG9uIGV4dGVuZHMgVG9nZ2xlQnV0dG9uPFRvZ2dsZUJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVG9nZ2xlQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWNhc3R0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJHb29nbGUgQ2FzdFwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Nhc3RBdmFpbGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5pc0Nhc3RpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5jYXN0U3RvcCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuY2FzdFZpZGVvKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNhc3QgdW5hdmFpbGFibGVcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IGNhc3RBdmFpbGFibGVIYW5kZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0QXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0FWQUlMQUJMRSwgY2FzdEF2YWlsYWJsZUhhbmRlcik7XHJcblxyXG4gICAgICAgIC8vIFRvZ2dsZSBidXR0b24gXCJvblwiIHN0YXRlXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVEFSVCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVE9QLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgYnV0dG9uIGlmIENhc3Qgbm90IGF2YWlsYWJsZVxyXG4gICAgICAgIGNhc3RBdmFpbGFibGVIYW5kZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCdXR0b24sIEJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vYnV0dG9uXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIENsaWNrT3ZlcmxheX0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENsaWNrT3ZlcmxheUNvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1cmwgdG8gb3BlbiB3aGVuIHRoZSBvdmVybGF5IGlzIGNsaWNrZWQuIFNldCB0byBudWxsIHRvIGRpc2FibGUgdGhlIGNsaWNrIGhhbmRsZXIuXHJcbiAgICAgKi9cclxuICAgIHVybD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgY2xpY2sgb3ZlcmxheSB0aGF0IG9wZW5zIGFuIHVybCBpbiBhIG5ldyB0YWIgaWYgY2xpY2tlZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDbGlja092ZXJsYXkgZXh0ZW5kcyBCdXR0b248Q2xpY2tPdmVybGF5Q29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDbGlja092ZXJsYXlDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY2xpY2tvdmVybGF5XCJcclxuICAgICAgICB9LCA8Q2xpY2tPdmVybGF5Q29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRVcmwoKDxDbGlja092ZXJsYXlDb25maWc+dGhpcy5jb25maWcpLnVybCk7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmdldERvbUVsZW1lbnQoKTtcclxuICAgICAgICBlbGVtZW50Lm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5kYXRhKFwidXJsXCIpKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihlbGVtZW50LmRhdGEoXCJ1cmxcIiksIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBVUkwgdGhhdCBzaG91bGQgYmUgZm9sbG93ZWQgd2hlbiB0aGUgd2F0ZXJtYXJrIGlzIGNsaWNrZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgd2F0ZXJtYXJrIFVSTFxyXG4gICAgICovXHJcbiAgICBnZXRVcmwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXREb21FbGVtZW50KCkuZGF0YShcInVybFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRVcmwodXJsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAodXJsID09PSB1bmRlZmluZWQgfHwgdXJsID09IG51bGwpIHtcclxuICAgICAgICAgICAgdXJsID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuZGF0YShcInVybFwiLCB1cmwpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0d1aWR9IGZyb20gXCIuLi9ndWlkXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcbmltcG9ydCB7RXZlbnREaXNwYXRjaGVyLCBOb0FyZ3MsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQmFzZSBjb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSBjb21wb25lbnQuXHJcbiAqIFNob3VsZCBiZSBleHRlbmRlZCBieSBjb21wb25lbnRzIHRoYXQgd2FudCB0byBhZGQgYWRkaXRpb25hbCBjb25maWd1cmF0aW9uIG9wdGlvbnMuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBIVE1MIHRhZyBuYW1lIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKiBEZWZhdWx0OiBcImRpdlwiXHJcbiAgICAgKi9cclxuICAgIHRhZz86IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICogVGhlIEhUTUwgSUQgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqIERlZmF1bHQ6IGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIHdpdGggcGF0dGVybiBcInVpLWlkLXtndWlkfVwiLlxyXG4gICAgICovXHJcbiAgICBpZD86IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBDU1MgY2xhc3NlcyBvZiB0aGUgY29tcG9uZW50LiBUaGlzIGlzIHVzdWFsbHkgdGhlIGNsYXNzIGZyb20gd2hlcmUgdGhlIGNvbXBvbmVudCB0YWtlcyBpdHMgc3R5bGluZy5cclxuICAgICAqL1xyXG4gICAgY3NzQ2xhc3M/OiBzdHJpbmc7IC8vIFwiY2xhc3NcIiBpcyBhIHJlc2VydmVkIGtleXdvcmQsIHNvIHdlIG5lZWQgdG8gbWFrZSB0aGUgbmFtZSBtb3JlIGNvbXBsaWNhdGVkXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRpdGlvbmFsIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIGNzc0NsYXNzZXM/OiBzdHJpbmdbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNwZWNpZmllcyBpZiB0aGUgY29tcG9uZW50IHNob3VsZCBiZSBoaWRkZW4gYXQgc3RhcnR1cC5cclxuICAgICAqIERlZmF1bHQ6IGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGhpZGRlbj86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgYmFzZSBjbGFzcyBvZiB0aGUgVUkgZnJhbWV3b3JrLlxyXG4gKiBFYWNoIGNvbXBvbmVudCBtdXN0IGV4dGVuZCB0aGlzIGNsYXNzIGFuZCBvcHRpb25hbGx5IHRoZSBjb25maWcgaW50ZXJmYWNlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudDxDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWc+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjbGFzc25hbWUgdGhhdCBpcyBhdHRhY2hlZCB0byB0aGUgZWxlbWVudCB3aGVuIGl0IGlzIGluIHRoZSBoaWRkZW4gc3RhdGUuXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDTEFTU19ISURERU4gPSBcImhpZGRlblwiO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uZmlndXJhdGlvbiBvYmplY3Qgb2YgdGhpcyBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjb25maWc6IENvbmZpZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb21wb25lbnQncyBET00gZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBET007XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGbGFnIHRoYXQga2VlcHMgdHJhY2sgb2YgdGhlIGhpZGRlbiBzdGF0ZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoaWRkZW46IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGlzdCBvZiBldmVudHMgdGhhdCB0aGlzIGNvbXBvbmVudCBvZmZlcnMuIFRoZXNlIGV2ZW50cyBzaG91bGQgYWx3YXlzIGJlIHByaXZhdGUgYW5kIG9ubHkgZGlyZWN0bHlcclxuICAgICAqIGFjY2Vzc2VkIGZyb20gd2l0aGluIHRoZSBpbXBsZW1lbnRpbmcgY29tcG9uZW50LlxyXG4gICAgICpcclxuICAgICAqIEJlY2F1c2UgVHlwZVNjcmlwdCBkb2VzIG5vdCBzdXBwb3J0IHByaXZhdGUgcHJvcGVydGllcyB3aXRoIHRoZSBzYW1lIG5hbWUgb24gZGlmZmVyZW50IGNsYXNzIGhpZXJhcmNoeSBsZXZlbHNcclxuICAgICAqIChpLmUuIHN1cGVyY2xhc3MgYW5kIHN1YmNsYXNzIGNhbm5vdCBjb250YWluIGEgcHJpdmF0ZSBwcm9wZXJ0eSB3aXRoIHRoZSBzYW1lIG5hbWUpLCB0aGUgZGVmYXVsdCBuYW1pbmdcclxuICAgICAqIGNvbnZlbnRpb24gZm9yIHRoZSBldmVudCBsaXN0IG9mIGEgY29tcG9uZW50IHRoYXQgc2hvdWxkIGJlIGZvbGxvd2VkIGJ5IHN1YmNsYXNzZXMgaXMgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlXHJcbiAgICAgKiBjYW1lbC1jYXNlZCBjbGFzcyBuYW1lICsgXCJFdmVudHNcIiAoZS5nLiBTdWJDbGFzcyBleHRlbmRzIENvbXBvbmVudCA9PiBzdWJDbGFzc0V2ZW50cykuXHJcbiAgICAgKiBTZWUge0BsaW5rICNjb21wb25lbnRFdmVudHN9IGZvciBhbiBleGFtcGxlLlxyXG4gICAgICpcclxuICAgICAqIEV2ZW50IHByb3BlcnRpZXMgc2hvdWxkIGJlIG5hbWVkIGluIGNhbWVsIGNhc2Ugd2l0aCBhbiBcIm9uXCIgcHJlZml4IGFuZCBpbiB0aGUgcHJlc2VudCB0ZW5zZS4gQXN5bmMgZXZlbnRzIG1heVxyXG4gICAgICogaGF2ZSBhIHN0YXJ0IGV2ZW50ICh3aGVuIHRoZSBvcGVyYXRpb24gc3RhcnRzKSBpbiB0aGUgcHJlc2VudCB0ZW5zZSwgYW5kIG11c3QgaGF2ZSBhbiBlbmQgZXZlbnQgKHdoZW4gdGhlXHJcbiAgICAgKiBvcGVyYXRpb24gZW5kcykgaW4gdGhlIHBhc3QgdGVuc2UgKG9yIHByZXNlbnQgdGVuc2UgaW4gc3BlY2lhbCBjYXNlcyAoZS5nLiBvblN0YXJ0L29uU3RhcnRlZCBvciBvblBsYXkvb25QbGF5aW5nKS5cclxuICAgICAqIFNlZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyNvblNob3d9IGZvciBhbiBleGFtcGxlLlxyXG4gICAgICpcclxuICAgICAqIEVhY2ggZXZlbnQgc2hvdWxkIGJlIGFjY29tcGFuaWVkIHdpdGggYSBwcm90ZWN0ZWQgbWV0aG9kIG5hbWVkIGJ5IHRoZSBjb252ZW50aW9uIGV2ZW50TmFtZSArIFwiRXZlbnRcIlxyXG4gICAgICogKGUuZy4gb25TdGFydEV2ZW50KSwgdGhhdCBhY3R1YWxseSB0cmlnZ2VycyB0aGUgZXZlbnQgYnkgY2FsbGluZyB7QGxpbmsgRXZlbnREaXNwYXRjaGVyI2Rpc3BhdGNoIGRpc3BhdGNofSBhbmRcclxuICAgICAqIHBhc3NpbmcgYSByZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudCBhcyBmaXJzdCBwYXJhbWV0ZXIuIENvbXBvbmVudHMgc2hvdWxkIGFsd2F5cyB0cmlnZ2VyIHRoZWlyIGV2ZW50cyB3aXRoIHRoZXNlXHJcbiAgICAgKiBtZXRob2RzLiBJbXBsZW1lbnRpbmcgdGhpcyBwYXR0ZXJuIGdpdmVzIHN1YmNsYXNzZXMgbWVhbnMgdG8gZGlyZWN0bHkgbGlzdGVuIHRvIHRoZSBldmVudHMgYnkgb3ZlcnJpZGluZyB0aGVcclxuICAgICAqIG1ldGhvZCAoYW5kIHNhdmluZyB0aGUgb3ZlcmhlYWQgb2YgcGFzc2luZyBhIGhhbmRsZXIgdG8gdGhlIGV2ZW50IGRpc3BhdGNoZXIpIGFuZCBtb3JlIGltcG9ydGFudGx5IHRvIHRyaWdnZXJcclxuICAgICAqIHRoZXNlIGV2ZW50cyB3aXRob3V0IGhhdmluZyBhY2Nlc3MgdG8gdGhlIHByaXZhdGUgZXZlbnQgbGlzdC5cclxuICAgICAqIFNlZSB7QGxpbmsgI29uU2hvd30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogVG8gcHJvdmlkZSBleHRlcm5hbCBjb2RlIHRoZSBwb3NzaWJpbGl0eSB0byBsaXN0ZW4gdG8gdGhpcyBjb21wb25lbnQncyBldmVudHMgKHN1YnNjcmliZSwgdW5zdWJzY3JpYmUsIGV0Yy4pLFxyXG4gICAgICogZWFjaCBldmVudCBzaG91bGQgYWxzbyBiZSBhY2NvbXBhbmllZCBieSBhIHB1YmxpYyBnZXR0ZXIgZnVuY3Rpb24gd2l0aCB0aGUgc2FtZSBuYW1lIGFzIHRoZSBldmVudCdzIHByb3BlcnR5LFxyXG4gICAgICogdGhhdCByZXR1cm5zIHRoZSB7QGxpbmsgRXZlbnR9IG9idGFpbmVkIGZyb20gdGhlIGV2ZW50IGRpc3BhdGNoZXIgYnkgY2FsbGluZyB7QGxpbmsgRXZlbnREaXNwYXRjaGVyI2dldEV2ZW50fS5cclxuICAgICAqIFNlZSB7QGxpbmsgI29uU2hvd30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogRnVsbCBleGFtcGxlIGZvciBhbiBldmVudCByZXByZXNlbnRpbmcgYW4gZXhhbXBsZSBhY3Rpb24gaW4gYSBleGFtcGxlIGNvbXBvbmVudDpcclxuICAgICAqXHJcbiAgICAgKiA8Y29kZT5cclxuICAgICAqIC8vIERlZmluZSBhbiBleGFtcGxlIGNvbXBvbmVudCBjbGFzcyB3aXRoIGFuIGV4YW1wbGUgZXZlbnRcclxuICAgICAqIGNsYXNzIEV4YW1wbGVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiB7XHJcbiAgICAgKlxyXG4gICAgICogICAgIHByaXZhdGUgZXhhbXBsZUNvbXBvbmVudEV2ZW50cyA9IHtcclxuICAgICAqICAgICAgICAgb25FeGFtcGxlQWN0aW9uOiBuZXcgRXZlbnREaXNwYXRjaGVyPEV4YW1wbGVDb21wb25lbnQsIE5vQXJncz4oKVxyXG4gICAgICogICAgIH1cclxuICAgICAqXHJcbiAgICAgKiAgICAgLy8gY29uc3RydWN0b3IgYW5kIG90aGVyIHN0dWZmLi4uXHJcbiAgICAgKlxyXG4gICAgICogICAgIHByb3RlY3RlZCBvbkV4YW1wbGVBY3Rpb25FdmVudCgpIHtcclxuICAgICAqICAgICAgICB0aGlzLmV4YW1wbGVDb21wb25lbnRFdmVudHMub25FeGFtcGxlQWN0aW9uLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgICogICAgfVxyXG4gICAgICpcclxuICAgICAqICAgIGdldCBvbkV4YW1wbGVBY3Rpb24oKTogRXZlbnQ8RXhhbXBsZUNvbXBvbmVudCwgTm9BcmdzPiB7XHJcbiAgICAgKiAgICAgICAgcmV0dXJuIHRoaXMuZXhhbXBsZUNvbXBvbmVudEV2ZW50cy5vbkV4YW1wbGVBY3Rpb24uZ2V0RXZlbnQoKTtcclxuICAgICAqICAgIH1cclxuICAgICAqIH1cclxuICAgICAqXHJcbiAgICAgKiAvLyBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudCBzb21ld2hlcmVcclxuICAgICAqIHZhciBleGFtcGxlQ29tcG9uZW50SW5zdGFuY2UgPSBuZXcgRXhhbXBsZUNvbXBvbmVudCgpO1xyXG4gICAgICpcclxuICAgICAqIC8vIFN1YnNjcmliZSB0byB0aGUgZXhhbXBsZSBldmVudCBvbiB0aGUgY29tcG9uZW50XHJcbiAgICAgKiBleGFtcGxlQ29tcG9uZW50SW5zdGFuY2Uub25FeGFtcGxlQWN0aW9uLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBFeGFtcGxlQ29tcG9uZW50KSB7XHJcbiAgICAgKiAgICAgY29uc29sZS5sb2coXCJvbkV4YW1wbGVBY3Rpb24gb2YgXCIgKyBzZW5kZXIgKyBcIiBoYXMgZmlyZWQhXCIpO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiA8L2NvZGU+XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29tcG9uZW50RXZlbnRzID0ge1xyXG4gICAgICAgIG9uU2hvdzogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIG9uSGlkZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0cyBhIGNvbXBvbmVudCB3aXRoIGFuIG9wdGlvbmFsbHkgc3VwcGxpZWQgY29uZmlnLiBBbGwgc3ViY2xhc3NlcyBtdXN0IGNhbGwgdGhlIGNvbnN0cnVjdG9yIG9mIHRoZWlyXHJcbiAgICAgKiBzdXBlcmNsYXNzIGFuZCB0aGVuIG1lcmdlIHRoZWlyIGNvbmZpZ3VyYXRpb24gaW50byB0aGUgY29tcG9uZW50J3MgY29uZmlndXJhdGlvbi5cclxuICAgICAqIEBwYXJhbSBjb25maWcgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb21wb25lbnRDb25maWcgPSB7fSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhpcyBjb21wb25lbnRcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IDxDb25maWc+dGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgdGFnOiBcImRpdlwiLFxyXG4gICAgICAgICAgICBpZDogXCJ1aS1pZC1cIiArIEd1aWQubmV4dCgpLFxyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1jb21wb25lbnRcIixcclxuICAgICAgICAgICAgY3NzQ2xhc3NlczogW10sXHJcbiAgICAgICAgICAgIGhpZGRlbjogZmFsc2VcclxuICAgICAgICB9LCB7fSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgY29tcG9uZW50LCBlLmcuIGJ5IGFwcGx5aW5nIGNvbmZpZyBzZXR0aW5ncy5cclxuICAgICAqIFRoaXMgbWV0aG9kIG11c3Qgbm90IGJlIGNhbGxlZCBmcm9tIG91dHNpZGUgdGhlIFVJIGZyYW1ld29yay5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBhdXRvbWF0aWNhbGx5IGNhbGxlZCBieSB0aGUge0BsaW5rIFVJTWFuYWdlcn0uIElmIHRoZSBjb21wb25lbnQgaXMgYW4gaW5uZXIgY29tcG9uZW50IG9mXHJcbiAgICAgKiBzb21lIGNvbXBvbmVudCwgYW5kIHRodXMgZW5jYXBzdWxhdGVkIGFiZCBtYW5hZ2VkIGludGVybmFsbHkgYW5kIG5ldmVyIGRpcmVjdGx5IGV4cG9zZWQgdG8gdGhlIFVJTWFuYWdlcixcclxuICAgICAqIHRoaXMgbWV0aG9kIG11c3QgYmUgY2FsbGVkIGZyb20gdGhlIG1hbmFnaW5nIGNvbXBvbmVudCdzIHtAbGluayAjaW5pdGlhbGl6ZX0gbWV0aG9kLlxyXG4gICAgICovXHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuaGlkZGVuID0gdGhpcy5jb25maWcuaGlkZGVuO1xyXG5cclxuICAgICAgICAvLyBIaWRlIHRoZSBjb21wb25lbnQgYXQgaW5pdGlhbGl6YXRpb24gaWYgaXQgaXMgY29uZmlndXJlZCB0byBiZSBoaWRkZW5cclxuICAgICAgICBpZiAodGhpcy5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbmZpZ3VyZXMgdGhlIGNvbXBvbmVudCBmb3IgdGhlIHN1cHBsaWVkIFBsYXllciBhbmQgVUlNYW5hZ2VyLiBUaGlzIGlzIHRoZSBwbGFjZSB3aGVyZSBhbGwgdGhlIG1hZ2ljIGhhcHBlbnMsXHJcbiAgICAgKiB3aGVyZSBjb21wb25lbnRzIHR5cGljYWxseSBzdWJzY3JpYmUgYW5kIHJlYWN0IHRvIGV2ZW50cyAob24gdGhlaXIgRE9NIGVsZW1lbnQsIHRoZSBQbGF5ZXIsIG9yIHRoZSBVSU1hbmFnZXIpLFxyXG4gICAgICogYW5kIGJhc2ljYWxseSBldmVyeXRoaW5nIHRoYXQgbWFrZXMgdGhlbSBpbnRlcmFjdGl2ZS5cclxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBvbmx5IG9uY2UsIHdoZW4gdGhlIFVJTWFuYWdlciBpbml0aWFsaXplcyB0aGUgVUkuXHJcbiAgICAgKlxyXG4gICAgICogU3ViY2xhc3NlcyB1c3VhbGx5IG92ZXJ3cml0ZSB0aGlzIG1ldGhvZCB0byBhZGQgdGhlaXIgb3duIGZ1bmN0aW9uYWxpdHkuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHBsYXllciB0aGUgcGxheWVyIHdoaWNoIHRoaXMgY29tcG9uZW50IGNvbnRyb2xzXHJcbiAgICAgKiBAcGFyYW0gdWltYW5hZ2VyIHRoZSBVSU1hbmFnZXIgdGhhdCBtYW5hZ2VzIHRoaXMgY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgLy8gbm90aGluZyB0byBkbyBoZXJlOyBvdmVyd3JpdGUgaW4gc3ViY2xhc3Nlc1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgdGhlIERPTSBlbGVtZW50IGZvciB0aGlzIGNvbXBvbmVudC5cclxuICAgICAqXHJcbiAgICAgKiBTdWJjbGFzc2VzIHVzdWFsbHkgb3ZlcndyaXRlIHRoaXMgbWV0aG9kIHRvIGV4dGVuZCBvciByZXBsYWNlIHRoZSBET00gZWxlbWVudCB3aXRoIHRoZWlyIG93biBkZXNpZ24uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IG5ldyBET00odGhpcy5jb25maWcudGFnLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIERPTSBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LiBDcmVhdGVzIHRoZSBET00gZWxlbWVudCBpZiBpdCBkb2VzIG5vdCB5ZXQgZXhpc3QuXHJcbiAgICAgKlxyXG4gICAgICogU2hvdWxkIG5vdCBiZSBvdmVyd3JpdHRlbiBieSBzdWJjbGFzc2VzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGdldERvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLnRvRG9tRWxlbWVudCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lcmdlcyBhIGNvbmZpZ3VyYXRpb24gd2l0aCBhIGRlZmF1bHQgY29uZmlndXJhdGlvbiBhbmQgYSBiYXNlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgc3VwZXJjbGFzcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIHRoZSBjb25maWd1cmF0aW9uIHNldHRpbmdzIGZvciB0aGUgY29tcG9uZW50cywgYXMgdXN1YWxseSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gZGVmYXVsdHMgYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHNldHRpbmdzIHRoYXQgYXJlIG5vdCBwYXNzZWQgd2l0aCB0aGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHBhcmFtIGJhc2UgY29uZmlndXJhdGlvbiBpbmhlcml0ZWQgZnJvbSBhIHN1cGVyY2xhc3NcclxuICAgICAqIEByZXR1cm5zIHtDb25maWd9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtZXJnZUNvbmZpZzxDb25maWc+KGNvbmZpZzogQ29uZmlnLCBkZWZhdWx0czogQ29uZmlnLCBiYXNlOiBDb25maWcpOiBDb25maWcge1xyXG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IGNvbmZpZyB3aXRoIHN1cHBsaWVkIGNvbmZpZ1xyXG4gICAgICAgIGxldCBtZXJnZWQgPSBPYmplY3QuYXNzaWduKHt9LCBiYXNlLCBkZWZhdWx0cywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBleHRlbmRlZCBjb25maWdcclxuICAgICAgICByZXR1cm4gbWVyZ2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGVscGVyIG1ldGhvZCB0aGF0IHJldHVybnMgYSBzdHJpbmcgb2YgYWxsIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldENzc0NsYXNzZXMoKTogc3RyaW5nIHtcclxuICAgICAgICAvLyBNZXJnZSBhbGwgQ1NTIGNsYXNzZXMgaW50byBzaW5nbGUgYXJyYXlcclxuICAgICAgICBsZXQgZmxhdHRlbmVkQXJyYXkgPSBbdGhpcy5jb25maWcuY3NzQ2xhc3NdLmNvbmNhdCh0aGlzLmNvbmZpZy5jc3NDbGFzc2VzKTtcclxuICAgICAgICAvLyBKb2luIGFycmF5IHZhbHVlcyBpbnRvIGEgc3RyaW5nXHJcbiAgICAgICAgbGV0IGZsYXR0ZW5lZFN0cmluZyA9IGZsYXR0ZW5lZEFycmF5LmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIC8vIFJldHVybiB0cmltbWVkIHN0cmluZyB0byBwcmV2ZW50IHdoaXRlc3BhY2UgYXQgdGhlIGVuZCBmcm9tIHRoZSBqb2luIG9wZXJhdGlvblxyXG4gICAgICAgIHJldHVybiBmbGF0dGVuZWRTdHJpbmcudHJpbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY29uZmlndXJhdGlvbiBvYmplY3Qgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqIEByZXR1cm5zIHtDb25maWd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDb25maWcoKTogQ29uZmlnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlcyB0aGUgY29tcG9uZW50LlxyXG4gICAgICogVGhpcyBtZXRob2QgYmFzaWNhbGx5IHRyYW5zZmVycyB0aGUgY29tcG9uZW50IGludG8gdGhlIGhpZGRlbiBzdGF0ZS4gQWN0dWFsIGhpZGluZyBpcyBkb25lIHZpYSBDU1MuXHJcbiAgICAgKi9cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKENvbXBvbmVudC5DTEFTU19ISURERU4pO1xyXG4gICAgICAgIHRoaXMub25IaWRlRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3dzIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoQ29tcG9uZW50LkNMQVNTX0hJRERFTik7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9uU2hvd0V2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBjb21wb25lbnQgaXMgaGlkZGVuLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNvbXBvbmVudCBpcyBoaWRkZW4sIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNIaWRkZW4oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZGVuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZXJtaW5lcyBpZiB0aGUgY29tcG9uZW50IGlzIHNob3duLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNvbXBvbmVudCBpcyB2aXNpYmxlLCBlbHNlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGlzU2hvd24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzSGlkZGVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSBoaWRkZW4gc3RhdGUgYnkgaGlkaW5nIHRoZSBjb21wb25lbnQgaWYgaXQgaXMgc2hvd24sIG9yIHNob3dpbmcgaXQgaWYgaGlkZGVuLlxyXG4gICAgICovXHJcbiAgICB0b2dnbGVIaWRkZW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB0aGUgb25TaG93IGV2ZW50LlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBvblNob3dFdmVudCgpIHtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudEV2ZW50cy5vblNob3cuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB0aGUgb25IaWRlIGV2ZW50LlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBvbkhpZGVFdmVudCgpIHtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudEV2ZW50cy5vbkhpZGUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBzaG93aW5nLlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uU2hvdygpOiBFdmVudDxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uU2hvdy5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBjb21wb25lbnQgaXMgaGlkaW5nLlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uSGlkZSgpOiBFdmVudDxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uSGlkZS5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudENvbmZpZywgQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtBcnJheVV0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgQ29udGFpbmVyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udGFpbmVyQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogQ2hpbGQgY29tcG9uZW50cyBvZiB0aGUgY29udGFpbmVyLlxyXG4gICAgICovXHJcbiAgICBjb21wb25lbnRzPzogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz5bXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgY29udGFpbmVyIGNvbXBvbmVudCB0aGF0IGNhbiBjb250YWluIGEgY29sbGVjdGlvbiBvZiBjaGlsZCBjb21wb25lbnRzLlxyXG4gKiBDb21wb25lbnRzIGNhbiBiZSBhZGRlZCBhdCBjb25zdHJ1Y3Rpb24gdGltZSB0aHJvdWdoIHRoZSB7QGxpbmsgQ29udGFpbmVyQ29uZmlnI2NvbXBvbmVudHN9IHNldHRpbmcsIG9yIGxhdGVyXHJcbiAqIHRocm91Z2ggdGhlIHtAbGluayBDb250YWluZXIjYWRkQ29tcG9uZW50fSBtZXRob2QuIFRoZSBVSU1hbmFnZXIgYXV0b21hdGljYWxseSB0YWtlcyBjYXJlIG9mIGFsbCBjb21wb25lbnRzLCBpLmUuIGl0XHJcbiAqIGluaXRpYWxpemVzIGFuZCBjb25maWd1cmVzIHRoZW0gYXV0b21hdGljYWxseS5cclxuICpcclxuICogSW4gdGhlIERPTSwgdGhlIGNvbnRhaW5lciBjb25zaXN0cyBvZiBhbiBvdXRlciA8ZGl2PiAodGhhdCBjYW4gYmUgY29uZmlndXJlZCBieSB0aGUgY29uZmlnKSBhbmQgYW4gaW5uZXIgd3JhcHBlclxyXG4gKiA8ZGl2PiB0aGF0IGNvbnRhaW5zIHRoZSBjb21wb25lbnRzLiBUaGlzIGRvdWJsZS08ZGl2Pi1zdHJ1Y3R1cmUgaXMgb2Z0ZW4gcmVxdWlyZWQgdG8gYWNoaWV2ZSBtYW55IGFkdmFuY2VkIGVmZmVjdHNcclxuICogaW4gQ1NTIGFuZC9vciBKUywgZS5nLiBhbmltYXRpb25zIGFuZCBjZXJ0YWluIGZvcm1hdHRpbmcgd2l0aCBhYnNvbHV0ZSBwb3NpdGlvbmluZy5cclxuICpcclxuICogRE9NIGV4YW1wbGU6XHJcbiAqIDxjb2RlPlxyXG4gKiAgICAgPGRpdiBjbGFzcz1cInVpLWNvbnRhaW5lclwiPlxyXG4gKiAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXItd3JhcHBlclwiPlxyXG4gKiAgICAgICAgICAgICAuLi4gY2hpbGQgY29tcG9uZW50cyAuLi5cclxuICogICAgICAgICA8L2Rpdj5cclxuICogICAgIDwvZGl2PlxyXG4gKiA8L2NvZGU+XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyPENvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgaW5uZXIgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBjb21wb25lbnRzIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaW5uZXJDb250YWluZXJFbGVtZW50OiBET007XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWNvbnRhaW5lclwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbXVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBjaGlsZCBjb21wb25lbnQgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAqIEBwYXJhbSBjb21wb25lbnQgdGhlIGNvbXBvbmVudCB0byBhZGRcclxuICAgICAqL1xyXG4gICAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pIHtcclxuICAgICAgICB0aGlzLmNvbmZpZy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYSBjaGlsZCBjb21wb25lbnQgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIGNvbXBvbmVudCB0aGUgY29tcG9uZW50IHRvIHJlbW92ZVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiByZW1vdmVkLCBmYWxzZSBpZiBpdCBpcyBub3QgY29udGFpbmVkIGluIHRoaXMgY29udGFpbmVyXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUNvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5VXRpbHMucmVtb3ZlKHRoaXMuY29uZmlnLmNvbXBvbmVudHMsIGNvbXBvbmVudCkgIT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYW4gYXJyYXkgb2YgYWxsIGNoaWxkIGNvbXBvbmVudHMgaW4gdGhpcyBjb250YWluZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz5bXX1cclxuICAgICAqL1xyXG4gICAgZ2V0Q29tcG9uZW50cygpOiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPltdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuY29tcG9uZW50cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgdGhlIERPTSBvZiB0aGUgY29udGFpbmVyIHdpdGggdGhlIGN1cnJlbnQgY29tcG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUNvbXBvbmVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pbm5lckNvbnRhaW5lckVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29tcG9uZW50IG9mIHRoaXMuY29uZmlnLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5pbm5lckNvbnRhaW5lckVsZW1lbnQuYXBwZW5kKGNvbXBvbmVudC5nZXREb21FbGVtZW50KCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb250YWluZXIgZWxlbWVudCAodGhlIG91dGVyIDxkaXY+KVxyXG4gICAgICAgIGxldCBjb250YWluZXJFbGVtZW50ID0gbmV3IERPTSh0aGlzLmNvbmZpZy50YWcsIHtcclxuICAgICAgICAgICAgXCJpZFwiOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiB0aGlzLmdldENzc0NsYXNzZXMoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGlubmVyIGNvbnRhaW5lciBlbGVtZW50ICh0aGUgaW5uZXIgPGRpdj4pIHRoYXQgd2lsbCBjb250YWluIHRoZSBjb21wb25lbnRzXHJcbiAgICAgICAgbGV0IGlubmVyQ29udGFpbmVyID0gbmV3IERPTSh0aGlzLmNvbmZpZy50YWcsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImNvbnRhaW5lci13cmFwcGVyXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxlbWVudCA9IGlubmVyQ29udGFpbmVyO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudHMoKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWxlbWVudC5hcHBlbmQoaW5uZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyRWxlbWVudDtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VGltZW91dH0gZnJvbSBcIi4uL3RpbWVvdXRcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgdGhlIHtAbGluayBDb250cm9sQmFyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udHJvbEJhckNvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIGNvbnRyb2wgYmFyIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIERlZmF1bHQ6IDUgc2Vjb25kcyAoNTAwMClcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjb250YWluZXIgZm9yIG1haW4gcGxheWVyIGNvbnRyb2wgY29tcG9uZW50cywgZS5nLiBwbGF5IHRvZ2dsZSBidXR0b24sIHNlZWsgYmFyLCB2b2x1bWUgY29udHJvbCwgZnVsbHNjcmVlbiB0b2dnbGUgYnV0dG9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbnRyb2xCYXIgZXh0ZW5kcyBDb250YWluZXI8Q29udHJvbEJhckNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29udHJvbEJhckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY29udHJvbGJhclwiLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIGhpZGVEZWxheTogNTAwMFxyXG4gICAgICAgIH0sIDxDb250cm9sQmFyQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgaXNTZWVraW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxDb250cm9sQmFyQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkgeyAvLyBUT0RPIGZpeCBnZW5lcmljcyB0byBzcGFyZSB0aGVzZSBkYW1uIGNhc3RzLi4uIGlzIHRoYXQgZXZlbiBwb3NzaWJsZSBpbiBUUz9cclxuICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlRW50ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7IC8vIHNob3cgY29udHJvbCBiYXIgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSVxyXG5cclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpOyAvLyBDbGVhciB0aW1lb3V0IHRvIGF2b2lkIGhpZGluZyB0aGUgY29udHJvbCBiYXIgaWYgdGhlIG1vdXNlIG1vdmVzIGJhY2sgaW50byB0aGUgVUkgZHVyaW5nIHRoZSB0aW1lb3V0IHBlcmlvZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEb24ndCBjcmVhdGUvdXBkYXRlIHRpbWVvdXQgd2hpbGUgc2Vla2luZ1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgdGhlIGNvbnRyb2wgYmFyIGlmIG1vdXNlIGRvZXMgbm90IG1vdmUgZHVyaW5nIHRoZSB0aW1lb3V0IHRpbWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvbid0IGNyZWF0ZS91cGRhdGUgdGltZW91dCB3aGlsZSBzZWVraW5nXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSBjb250cm9sIGJhciBzb21lIHRpbWUgYWZ0ZXIgdGhlIG1vdXNlIGxlZnQgdGhlIFVJXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7IC8vIERvbid0IGhpZGUgY29udHJvbCBiYXIgd2hpbGUgYSBzZWVrIGlzIGluIHByb2dyZXNzXHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aW1lb3V0LnN0YXJ0KCk7IC8vIGhpZGUgY29udHJvbCBiYXIgc29tZSB0aW1lIGFmdGVyIGEgc2VlayBoYXMgZmluaXNoZWRcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgRXJyb3JFdmVudCA9IGJpdG1vdmluLnBsYXllci5FcnJvckV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIE92ZXJsYXlzIHRoZSBwbGF5ZXIgYW5kIGRpc3BsYXlzIGVycm9yIG1lc3NhZ2VzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEVycm9yTWVzc2FnZU92ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBlcnJvckxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuZXJyb3JMYWJlbCA9IG5ldyBMYWJlbDxMYWJlbENvbmZpZz4oe2Nzc0NsYXNzOiBcInVpLWVycm9ybWVzc2FnZS1sYWJlbFwifSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktZXJyb3JtZXNzYWdlLW92ZXJsYXlcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMuZXJyb3JMYWJlbF0sXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fRVJST1IsIGZ1bmN0aW9uIChldmVudDogRXJyb3JFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLmVycm9yTGFiZWwuc2V0VGV4dChldmVudC5tZXNzYWdlKTtcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uLCBUb2dnbGVCdXR0b25Db25maWd9IGZyb20gXCIuL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyB0aGUgcGxheWVyIGJldHdlZW4gd2luZG93ZWQgYW5kIGZ1bGxzY3JlZW4gdmlldy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uIGV4dGVuZHMgVG9nZ2xlQnV0dG9uPFRvZ2dsZUJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVG9nZ2xlQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWZ1bGxzY3JlZW50b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJGdWxsc2NyZWVuXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBmdWxsc2NyZWVuU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzRnVsbHNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fRlVMTFNDUkVFTl9FTlRFUiwgZnVsbHNjcmVlblN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fRlVMTFNDUkVFTl9FWElULCBmdWxsc2NyZWVuU3RhdGVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNGdWxsc2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5leGl0RnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmVudGVyRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFBsYXllckV2ZW50ID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgb3ZlcmxheXMgdGhlIHZpZGVvIGFuZCB0b2dnbGVzIGJldHdlZW4gcGxheWJhY2sgYW5kIHBhdXNlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbiBleHRlbmRzIFBsYXliYWNrVG9nZ2xlQnV0dG9uIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1odWdlcGxheWJhY2t0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJQbGF5L1BhdXNlXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBVcGRhdGUgYnV0dG9uIHN0YXRlIHRocm91Z2ggQVBJIGV2ZW50c1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlciwgZmFsc2UpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB0b2dnbGVQbGF5YmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc1BsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHRvZ2dsZUZ1bGxzY3JlZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNGdWxsc2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5leGl0RnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmVudGVyRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNsaWNrVGltZSA9IDA7XHJcbiAgICAgICAgbGV0IGRvdWJsZUNsaWNrVGltZSA9IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogWW91VHViZS1zdHlsZSB0b2dnbGUgYnV0dG9uIGhhbmRsaW5nXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUaGUgZ29hbCBpcyB0byBwcmV2ZW50IGEgc2hvcnQgcGF1c2Ugb3IgcGxheWJhY2sgaW50ZXJ2YWwgYmV0d2VlbiBhIGNsaWNrLCB0aGF0IHRvZ2dsZXMgcGxheWJhY2ssIGFuZCBhXHJcbiAgICAgICAgICogZG91YmxlIGNsaWNrLCB0aGF0IHRvZ2dsZXMgZnVsbHNjcmVlbi4gSW4gdGhpcyBuYWl2ZSBhcHByb2FjaCwgdGhlIGZpcnN0IGNsaWNrIHdvdWxkIGUuZy4gc3RhcnQgcGxheWJhY2ssXHJcbiAgICAgICAgICogdGhlIHNlY29uZCBjbGljayB3b3VsZCBiZSBkZXRlY3RlZCBhcyBkb3VibGUgY2xpY2sgYW5kIHRvZ2dsZSB0byBmdWxsc2NyZWVuLCBhbmQgYXMgc2Vjb25kIG5vcm1hbCBjbGljayBzdG9wXHJcbiAgICAgICAgICogcGxheWJhY2ssIHdoaWNoIHJlc3VsdHMgaXMgYSBzaG9ydCBwbGF5YmFjayBpbnRlcnZhbCB3aXRoIG1heCBsZW5ndGggb2YgdGhlIGRvdWJsZSBjbGljayBkZXRlY3Rpb25cclxuICAgICAgICAgKiBwZXJpb2QgKHVzdWFsbHkgNTAwbXMpLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogVG8gc29sdmUgdGhpcyBpc3N1ZSwgd2UgZGVmZXIgaGFuZGxpbmcgb2YgdGhlIGZpcnN0IGNsaWNrIGZvciAyMDBtcywgd2hpY2ggaXMgYWxtb3N0IHVubm90aWNlYWJsZSB0byB0aGUgdXNlcixcclxuICAgICAgICAgKiBhbmQganVzdCB0b2dnbGUgcGxheWJhY2sgaWYgbm8gc2Vjb25kIGNsaWNrIChkb3VibGUgY2xpY2spIGhhcyBiZWVuIHJlZ2lzdGVyZWQgZHVyaW5nIHRoaXMgcGVyaW9kLiBJZiBhIGRvdWJsZVxyXG4gICAgICAgICAqIGNsaWNrIGlzIHJlZ2lzdGVyZWQsIHdlIGp1c3QgdG9nZ2xlIHRoZSBmdWxsc2NyZWVuLiBJbiB0aGUgZmlyc3QgMjAwbXMsIHVuZGVzaXJlZCBwbGF5YmFjayBjaGFuZ2VzIHRodXMgY2Fubm90XHJcbiAgICAgICAgICogaGFwcGVuLiBJZiBhIGRvdWJsZSBjbGljayBpcyByZWdpc3RlcmVkIHdpdGhpbiA1MDBtcywgd2UgdW5kbyB0aGUgcGxheWJhY2sgY2hhbmdlIGFuZCBzd2l0Y2ggZnVsbHNjcmVlbiBtb2RlLlxyXG4gICAgICAgICAqIEluIHRoZSBlbmQsIHRoaXMgbWV0aG9kIGJhc2ljYWxseSBpbnRyb2R1Y2VzIGEgMjAwbXMgb2JzZXJ2aW5nIGludGVydmFsIGluIHdoaWNoIHBsYXliYWNrIGNoYW5nZXMgYXJlIHByZXZlbnRlZFxyXG4gICAgICAgICAqIGlmIGEgZG91YmxlIGNsaWNrIGhhcHBlbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5vdyAtIGNsaWNrVGltZSA8IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIGRvdWJsZSBjbGljayBpbnNpZGUgdGhlIDIwMG1zIGludGVydmFsLCBqdXN0IHRvZ2dsZSBmdWxsc2NyZWVuIG1vZGVcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgICAgIGRvdWJsZUNsaWNrVGltZSA9IG5vdztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub3cgLSBjbGlja1RpbWUgPCA1MDApIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBkb3VibGUgY2xpY2sgaW5zaWRlIHRoZSA1MDBtcyBpbnRlcnZhbCwgdW5kbyBwbGF5YmFjayB0b2dnbGUgYW5kIHRvZ2dsZSBmdWxsc2NyZWVuIG1vZGVcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVBsYXliYWNrKCk7XHJcbiAgICAgICAgICAgICAgICBkb3VibGVDbGlja1RpbWUgPSBub3c7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNsaWNrVGltZSA9IG5vdztcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSBkb3VibGVDbGlja1RpbWUgPiAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBObyBkb3VibGUgY2xpY2sgZGV0ZWN0ZWQsIHNvIHdlIHRvZ2dsZSBwbGF5YmFjayBhbmQgd2FpdCB3aGF0IGhhcHBlbnMgbmV4dFxyXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZVBsYXliYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgdGhlIGh1Z2UgcGxheWJhY2sgYnV0dG9uIGR1cmluZyBWUiBwbGF5YmFjayB0byBsZXQgbW91c2UgZXZlbnRzIHBhc3MgdGhyb3VnaCBhbmQgbmF2aWdhdGUgdGhlIFZSIHZpZXdwb3J0XHJcbiAgICAgICAgc2VsZi5vblRvZ2dsZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmdldFZSU3RhdHVzKCkuY29udGVudFR5cGUgIT09IFwibm9uZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlzUGxheWluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgYnV0dG9uIHdoaWxlIGluaXRpYWxpemluZyBhIENhc3Qgc2Vzc2lvblxyXG4gICAgICAgIGxldCBjYXN0SW5pdGlhbGl6YXRpb25IYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50OiBQbGF5ZXJFdmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIC8vIEhpZGUgYnV0dG9uIHdoZW4gc2Vzc2lvbiBpcyBiZWluZyBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTaG93IGJ1dHRvbiB3aGVuIHNlc3Npb24gaXMgZXN0YWJsaXNoZWQgb3IgaW5pdGlhbGl6YXRpb24gd2FzIGFib3J0ZWRcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJULCBjYXN0SW5pdGlhbGl6YXRpb25IYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0xBVU5DSEVELCBjYXN0SW5pdGlhbGl6YXRpb25IYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUT1AsIGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgYnV0dG9uRWxlbWVudCA9IHN1cGVyLnRvRG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICAvLyBBZGQgY2hpbGQgdGhhdCBjb250YWlucyB0aGUgcGxheSBidXR0b24gaW1hZ2VcclxuICAgICAgICAvLyBTZXR0aW5nIHRoZSBpbWFnZSBkaXJlY3RseSBvbiB0aGUgYnV0dG9uIGRvZXMgbm90IHdvcmsgdG9nZXRoZXIgd2l0aCBzY2FsaW5nIGFuaW1hdGlvbnMsIGJlY2F1c2UgdGhlIGJ1dHRvblxyXG4gICAgICAgIC8vIGNhbiBjb3ZlciB0aGUgd2hvbGUgdmlkZW8gcGxheWVyIGFyZSBhbmQgc2NhbGluZyB3b3VsZCBleHRlbmQgaXQgYmV5b25kLiBCeSBhZGRpbmcgYW4gaW5uZXIgZWxlbWVudCwgY29uZmluZWRcclxuICAgICAgICAvLyB0byB0aGUgc2l6ZSBpZiB0aGUgaW1hZ2UsIGl0IGNhbiBzY2FsZSBpbnNpZGUgdGhlIHBsYXllciB3aXRob3V0IG92ZXJzaG9vdGluZy5cclxuICAgICAgICBidXR0b25FbGVtZW50LmFwcGVuZChuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImltYWdlXCJcclxuICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIHJldHVybiBidXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudENvbmZpZywgQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgTGFiZWx9IGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGFiZWxDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGV4dCBvbiB0aGUgbGFiZWwuXHJcbiAgICAgKi9cclxuICAgIHRleHQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSB0ZXh0IGxhYmVsLlxyXG4gKlxyXG4gKiBET00gZXhhbXBsZTpcclxuICogPGNvZGU+XHJcbiAqICAgICA8c3BhbiBjbGFzcz1cInVpLWxhYmVsXCI+Li4uc29tZSB0ZXh0Li4uPC9zcGFuPlxyXG4gKiA8L2NvZGU+XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTGFiZWw8Q29uZmlnIGV4dGVuZHMgTGFiZWxDb25maWc+IGV4dGVuZHMgQ29tcG9uZW50PExhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1sYWJlbFwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgbGFiZWxFbGVtZW50ID0gbmV3IERPTShcInNwYW5cIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSkuaHRtbCh0aGlzLmNvbmZpZy50ZXh0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxhYmVsRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdGV4dCBvbiB0aGlzIGxhYmVsLlxyXG4gICAgICogQHBhcmFtIHRleHRcclxuICAgICAqL1xyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5odG1sKHRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSB0ZXh0IG9uIHRoaXMgbGFiZWwuXHJcbiAgICAgKi9cclxuICAgIGNsZWFyVGV4dCgpIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5odG1sKFwiXCIpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtFdmVudERpc3BhdGNoZXIsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcblxyXG4vKipcclxuICogQSBtYXAgb2YgaXRlbXMgKGtleS92YWx1ZSAtPiBsYWJlbH0gZm9yIGEge0BsaW5rIExpc3RTZWxlY3Rvcn0gaW4gYSB7QGxpbmsgTGlzdFNlbGVjdG9yQ29uZmlnfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW1Db2xsZWN0aW9uIHtcclxuICAgIC8vIGtleSAtPiBsYWJlbCBtYXBwaW5nXHJcbiAgICBba2V5OiBzdHJpbmddOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgTGlzdFNlbGVjdG9yfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlzdFNlbGVjdG9yQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIGl0ZW1zPzogTGlzdEl0ZW1Db2xsZWN0aW9uO1xyXG59XHJcblxyXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTGlzdFNlbGVjdG9yPENvbmZpZyBleHRlbmRzIExpc3RTZWxlY3RvckNvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8TGlzdFNlbGVjdG9yQ29uZmlnPiB7XHJcblxyXG4gICAgcHJvdGVjdGVkIGl0ZW1zOiBMaXN0SXRlbUNvbGxlY3Rpb247XHJcbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWRJdGVtOiBzdHJpbmc7XHJcblxyXG4gICAgcHJpdmF0ZSBsaXN0U2VsZWN0b3JFdmVudHMgPSB7XHJcbiAgICAgICAgb25JdGVtQWRkZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKSxcclxuICAgICAgICBvbkl0ZW1SZW1vdmVkOiBuZXcgRXZlbnREaXNwYXRjaGVyPExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+KCksXHJcbiAgICAgICAgb25JdGVtU2VsZWN0ZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBpdGVtczoge30sXHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWxpc3RzZWxlY3RvclwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5jb25maWcuaXRlbXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHNwZWNpZmllZCBpdGVtIGlzIHBhcnQgb2YgdGhpcyBzZWxlY3Rvci5cclxuICAgICAqIEBwYXJhbSBrZXkgdGhlIGtleSBvZiB0aGUgaXRlbSB0byBjaGVja1xyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGl0ZW0gaXMgcGFydCBvZiB0aGlzIHNlbGVjdG9yLCBlbHNlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGhhc0l0ZW0oa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pdGVtc1trZXldICE9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIGFuIGl0ZW0gdG8gdGhpcyBzZWxlY3RvciBieSBhcHBlbmRpbmcgaXQgdG8gdGhlIGVuZCBvZiB0aGUgbGlzdCBvZiBpdGVtcy5cclxuICAgICAqIEBwYXJhbSBrZXkgdGhlIGtleSAgb2YgdGhlIGl0ZW0gdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gbGFiZWwgdGhlIChodW1hbi1yZWFkYWJsZSkgbGFiZWwgb2YgdGhlIGl0ZW0gdG8gYWRkXHJcbiAgICAgKi9cclxuICAgIGFkZEl0ZW0oa2V5OiBzdHJpbmcsIGxhYmVsOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLml0ZW1zW2tleV0gPSBsYWJlbDtcclxuICAgICAgICB0aGlzLm9uSXRlbUFkZGVkRXZlbnQoa2V5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYW4gaXRlbSBmcm9tIHRoaXMgc2VsZWN0b3IuXHJcbiAgICAgKiBAcGFyYW0ga2V5IHRoZSBrZXkgb2YgdGhlIGl0ZW0gdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiByZW1vdmFsIHdhcyBzdWNjZXNzZnVsLCBmYWxzZSBpZiB0aGUgaXRlbSBpcyBub3QgcGFydCBvZiB0aGlzIHNlbGVjdG9yXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUl0ZW0oa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5oYXNJdGVtKGtleSkpIHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuaXRlbXNba2V5XTtcclxuICAgICAgICAgICAgdGhpcy5vbkl0ZW1SZW1vdmVkRXZlbnQoa2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZWxlY3RzIGFuIGl0ZW0gZnJvbSB0aGUgaXRlbXMgaW4gdGhpcyBzZWxlY3Rvci5cclxuICAgICAqIEBwYXJhbSBrZXkgdGhlIGtleSBvZiB0aGUgaXRlbSB0byBzZWxlY3RcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlzIHRoZSBzZWxlY3Rpb24gd2FzIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIHRoZSBzZWxlY3RlZCBpdGVtIGlzIG5vdCBwYXJ0IG9mIHRoZSBzZWxlY3RvclxyXG4gICAgICovXHJcbiAgICBzZWxlY3RJdGVtKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gdGhpcy5zZWxlY3RlZEl0ZW0pIHtcclxuICAgICAgICAgICAgLy8gaXRlbUNvbmZpZyBpcyBhbHJlYWR5IHNlbGVjdGVkLCBzdXBwcmVzcyBhbnkgZnVydGhlciBhY3Rpb25cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pdGVtc1trZXldICE9IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW0gPSBrZXk7XHJcbiAgICAgICAgICAgIHRoaXMub25JdGVtU2VsZWN0ZWRFdmVudChrZXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGtleSBvZiB0aGUgc2VsZWN0ZWQgaXRlbS5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSBrZXkgb2YgdGhlIHNlbGVjdGVkIGl0ZW0gb3IgbnVsbCBpZiBubyBpdGVtIGlzIHNlbGVjdGVkXHJcbiAgICAgKi9cclxuICAgIGdldFNlbGVjdGVkSXRlbSgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZEl0ZW07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFsbCBpdGVtcyBmcm9tIHRoaXMgc2VsZWN0b3IuXHJcbiAgICAgKi9cclxuICAgIGNsZWFySXRlbXMoKSB7XHJcbiAgICAgICAgbGV0IGl0ZW1zID0gdGhpcy5pdGVtczsgLy8gbG9jYWwgY29weSBmb3IgaXRlcmF0aW9uIGFmdGVyIGNsZWFyXHJcbiAgICAgICAgdGhpcy5pdGVtcyA9IHt9OyAvLyBjbGVhciBpdGVtc1xyXG5cclxuICAgICAgICAvLyBmaXJlIGV2ZW50c1xyXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBpdGVtcykge1xyXG4gICAgICAgICAgICB0aGlzLm9uSXRlbVJlbW92ZWRFdmVudChrZXkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBpdGVtcyBpbiB0aGlzIHNlbGVjdG9yLlxyXG4gICAgICogQHJldHVybnMge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgaXRlbUNvdW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuaXRlbXMpLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25JdGVtQWRkZWRFdmVudChrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbUFkZGVkLmRpc3BhdGNoKHRoaXMsIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbVJlbW92ZWRFdmVudChrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbVJlbW92ZWQuZGlzcGF0Y2godGhpcywga2V5KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25JdGVtU2VsZWN0ZWRFdmVudChrZXk6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbVNlbGVjdGVkLmRpc3BhdGNoKHRoaXMsIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gYW4gaXRlbSBpcyBhZGRlZCB0byB0aGUgbGlzdCBvZiBpdGVtcy5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25JdGVtQWRkZWQoKTogRXZlbnQ8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1BZGRlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGFuIGl0ZW0gaXMgcmVtb3ZlZCBmcm9tIHRoZSBsaXN0IG9mIGl0ZW1zLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbkl0ZW1SZW1vdmVkKCk6IEV2ZW50PExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtUmVtb3ZlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGFuIGl0ZW0gaXMgc2VsZWN0ZWQgZnJvbSB0aGUgbGlzdCBvZiBpdGVtcy5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25JdGVtU2VsZWN0ZWQoKTogRXZlbnQ8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1TZWxlY3RlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0xhYmVsQ29uZmlnLCBMYWJlbH0gZnJvbSBcIi4vbGFiZWxcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgZW51bSBUaW1lTGFiZWxNb2RlIHtcclxuICAgIEN1cnJlbnRUaW1lLFxyXG4gICAgVG90YWxUaW1lLFxyXG4gICAgQ3VycmVudEFuZFRvdGFsVGltZSxcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBQbGF5YmFja1RpbWVMYWJlbENvbmZpZyBleHRlbmRzIExhYmVsQ29uZmlnIHtcclxuICAgIHRpbWVMYWJlbE1vZGU/OiBUaW1lTGFiZWxNb2RlO1xyXG59XHJcblxyXG4vKipcclxuICogQSBsYWJlbCB0aGF0IGRpc3BsYXkgdGhlIGN1cnJlbnQgcGxheWJhY2sgdGltZSBhbmQgdGhlIHRvdGFsIHRpbWUgdGhyb3VnaCB7QGxpbmsgUGxheWJhY2tUaW1lTGFiZWwjc2V0VGltZSBzZXRUaW1lfVxyXG4gKiBvciBhbnkgc3RyaW5nIHRocm91Z2gge0BsaW5rIFBsYXliYWNrVGltZUxhYmVsI3NldFRleHQgc2V0VGV4dH0uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGxheWJhY2tUaW1lTGFiZWwgZXh0ZW5kcyBMYWJlbDxQbGF5YmFja1RpbWVMYWJlbENvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUGxheWJhY2tUaW1lTGFiZWxDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIDxQbGF5YmFja1RpbWVMYWJlbENvbmZpZz57XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWxhYmVsXCIsXHJcbiAgICAgICAgICAgIHRpbWVMYWJlbE1vZGU6IFRpbWVMYWJlbE1vZGUuQ3VycmVudEFuZFRvdGFsVGltZSxcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBwbGF5YmFja1RpbWVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmdldER1cmF0aW9uKCkgPT09IEluZmluaXR5KSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRleHQoXCJMaXZlXCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lKHBsYXllci5nZXRDdXJyZW50VGltZSgpLCBwbGF5ZXIuZ2V0RHVyYXRpb24oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHBsYXliYWNrVGltZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFRUtFRCwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURSwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcblxyXG4gICAgICAgIC8vIEluaXQgdGltZSBkaXNwbGF5ICh3aGVuIHRoZSBVSSBpcyBpbml0aWFsaXplZCwgaXQncyB0b28gbGF0ZSBmb3IgdGhlIE9OX1JFQURZIGV2ZW50KVxyXG4gICAgICAgIHBsYXliYWNrVGltZUhhbmRsZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGN1cnJlbnQgcGxheWJhY2sgdGltZSBhbmQgdG90YWwgZHVyYXRpb24uXHJcbiAgICAgKiBAcGFyYW0gcGxheWJhY2tTZWNvbmRzIHRoZSBjdXJyZW50IHBsYXliYWNrIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIGR1cmF0aW9uU2Vjb25kcyB0aGUgdG90YWwgZHVyYXRpb24gaW4gc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBzZXRUaW1lKHBsYXliYWNrU2Vjb25kczogbnVtYmVyLCBkdXJhdGlvblNlY29uZHM6IG51bWJlcikge1xyXG4gICAgICAgIHN3aXRjaCgoPFBsYXliYWNrVGltZUxhYmVsQ29uZmlnPnRoaXMuY29uZmlnKS50aW1lTGFiZWxNb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZUxhYmVsTW9kZS5DdXJyZW50VGltZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGV4dChgJHtTdHJpbmdVdGlscy5zZWNvbmRzVG9UaW1lKHBsYXliYWNrU2Vjb25kcyl9YCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBUaW1lTGFiZWxNb2RlLlRvdGFsVGltZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGV4dChgJHtTdHJpbmdVdGlscy5zZWNvbmRzVG9UaW1lKGR1cmF0aW9uU2Vjb25kcyl9YCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBUaW1lTGFiZWxNb2RlLkN1cnJlbnRBbmRUb3RhbFRpbWU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRleHQoYCR7U3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShwbGF5YmFja1NlY29uZHMpfSAvICR7U3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShkdXJhdGlvblNlY29uZHMpfWApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFBsYXllckV2ZW50ID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyBiZXR3ZWVuIHBsYXliYWNrIGFuZCBwYXVzZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQbGF5YmFja1RvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1wbGF5YmFja3RvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlBsYXkvUGF1c2VcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlciwgaGFuZGxlQ2xpY2tFdmVudDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGlzU2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGVyIHRvIHVwZGF0ZSBidXR0b24gc3RhdGUgYmFzZWQgb24gcGxheWVyIHN0YXRlXHJcbiAgICAgICAgbGV0IHBsYXliYWNrU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50OiBQbGF5ZXJFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgVUkgaXMgY3VycmVudGx5IHNlZWtpbmcsIHBsYXliYWNrIGlzIHRlbXBvcmFyaWx5IHN0b3BwZWQgYnV0IHRoZSBidXR0b25zIHNob3VsZFxyXG4gICAgICAgICAgICAvLyBub3QgcmVmbGVjdCB0aGF0IGFuZCBzdGF5IGFzLWlzIChlLmcgaW5kaWNhdGUgcGxheWJhY2sgd2hpbGUgc2Vla2luZykuXHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyByZXBsYWNlIHRoaXMgaGFjayB3aXRoIGEgc29sZSBwbGF5ZXIuaXNQbGF5aW5nKCkgY2FsbCBvbmNlIGlzc3VlICMxMjAzIGlzIGZpeGVkXHJcbiAgICAgICAgICAgIGxldCBpc1BsYXlpbmcgPSBwbGF5ZXIuaXNQbGF5aW5nKCk7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0aW5nKCkgJiZcclxuICAgICAgICAgICAgICAgIChldmVudC50eXBlID09PSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWSB8fCBldmVudC50eXBlID09PSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWVxyXG4gICAgICAgICAgICAgICAgfHwgZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUExBWUlORyB8fCBldmVudC50eXBlID09PSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QQVVTRSkpIHtcclxuICAgICAgICAgICAgICAgIGlzUGxheWluZyA9ICFpc1BsYXlpbmc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDYWxsIGhhbmRsZXIgdXBvbiB0aGVzZSBldmVudHNcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZLCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUEFVU0UsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZQkFDS19GSU5JU0hFRCwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpOyAvLyB3aGVuIHBsYXliYWNrIGZpbmlzaGVzLCBwbGF5ZXIgdHVybnMgdG8gcGF1c2VkIG1vZGVcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0xBVU5DSEVELCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QTEFZSU5HLCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QQVVTRSwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUExBWUJBQ0tfRklOSVNIRUQsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgaWYgKGhhbmRsZUNsaWNrRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gQ29udHJvbCBwbGF5ZXIgYnkgYnV0dG9uIGV2ZW50c1xyXG4gICAgICAgICAgICAvLyBXaGVuIGEgYnV0dG9uIGV2ZW50IHRyaWdnZXJzIGEgcGxheWVyIEFQSSBjYWxsLCBldmVudHMgYXJlIGZpcmVkIHdoaWNoIGluIHR1cm4gY2FsbCB0aGUgZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICAvLyBhYm92ZSB0aGF0IHVwZGF0ZWQgdGhlIGJ1dHRvbiBzdGF0ZS5cclxuICAgICAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlzUGxheWluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJhY2sgVUkgc2Vla2luZyBzdGF0dXNcclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtDb21wb25lbnQsIENvbXBvbmVudENvbmZpZ30gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyLCBVSVJlY29tbWVuZGF0aW9uQ29uZmlnfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7U3RyaW5nVXRpbHN9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5cclxuLyoqXHJcbiAqIE92ZXJsYXlzIHRoZSBwbGF5ZXIgYW5kIGRpc3BsYXlzIHJlY29tbWVuZGVkIHZpZGVvcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBSZWNvbW1lbmRhdGlvbk92ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktcmVjb21tZW5kYXRpb24tb3ZlcmxheVwiLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICghdWltYW5hZ2VyLmdldENvbmZpZygpIHx8ICF1aW1hbmFnZXIuZ2V0Q29uZmlnKCkucmVjb21tZW5kYXRpb25zIHx8IHVpbWFuYWdlci5nZXRDb25maWcoKS5yZWNvbW1lbmRhdGlvbnMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZXJlIGFyZSBubyByZWNvbW1lbmRhdGlvbiBpdGVtcywgc28gZG9uJ3QgbmVlZCB0byBjb25maWd1cmUgYW55dGhpbmdcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgaXRlbSBvZiB1aW1hbmFnZXIuZ2V0Q29uZmlnKCkucmVjb21tZW5kYXRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkQ29tcG9uZW50KG5ldyBSZWNvbW1lbmRhdGlvbkl0ZW0oe2l0ZW1Db25maWc6IGl0ZW19KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlQ29tcG9uZW50cygpOyAvLyBjcmVhdGUgY29udGFpbmVyIERPTSBlbGVtZW50c1xyXG5cclxuICAgICAgICAvLyBEaXNwbGF5IHJlY29tbWVuZGF0aW9ucyB3aGVuIHBsYXliYWNrIGhhcyBmaW5pc2hlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVlCQUNLX0ZJTklTSEVELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIERpc21pc3MgT05fUExBWUJBQ0tfRklOSVNIRUQgZXZlbnRzIGF0IHRoZSBlbmQgb2YgYWRzXHJcbiAgICAgICAgICAgIC8vIFRPRE8gcmVtb3ZlIHRoaXMgd29ya2Fyb3VuZCBvbmNlIGlzc3VlICMxMjc4IGlzIHNvbHZlZFxyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzQWQoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBIaWRlIHJlY29tbWVuZGF0aW9ucyB3aGVuIHBsYXliYWNrIHN0YXJ0cywgZS5nLiBhIHJlc3RhcnRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgUmVjb21tZW5kYXRpb25JdGVtfVxyXG4gKi9cclxuaW50ZXJmYWNlIFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICBpdGVtQ29uZmlnOiBVSVJlY29tbWVuZGF0aW9uQ29uZmlnO1xyXG59XHJcblxyXG4vKipcclxuICogQW4gaXRlbSBvZiB0aGUge0BsaW5rIFJlY29tbWVuZGF0aW9uT3ZlcmxheX0uIFVzZWQgb25seSBpbnRlcm5hbGx5IGluIHtAbGluayBSZWNvbW1lbmRhdGlvbk92ZXJsYXl9LlxyXG4gKi9cclxuY2xhc3MgUmVjb21tZW5kYXRpb25JdGVtIGV4dGVuZHMgQ29tcG9uZW50PFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUmVjb21tZW5kYXRpb25JdGVtQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1yZWNvbW1lbmRhdGlvbi1pdGVtXCIsXHJcbiAgICAgICAgICAgIGl0ZW1Db25maWc6IG51bGwgLy8gdGhpcyBtdXN0IGJlIHBhc3NlZCBpbiBmcm9tIG91dHNpZGVcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBjb25maWcgPSAoPFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZz50aGlzLmNvbmZpZykuaXRlbUNvbmZpZzsgLy8gVE9ETyBmaXggZ2VuZXJpY3MgYW5kIGdldCByaWQgb2YgY2FzdFxyXG5cclxuICAgICAgICBsZXQgaXRlbUVsZW1lbnQgPSBuZXcgRE9NKFwiYVwiLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKCksXHJcbiAgICAgICAgICAgIFwiaHJlZlwiOiBjb25maWcudXJsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBiZ0VsZW1lbnQgPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInRodW1ibmFpbFwiXHJcbiAgICAgICAgfSkuY3NzKHtcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke2NvbmZpZy50aHVtYm5haWx9KWB9KTtcclxuICAgICAgICBpdGVtRWxlbWVudC5hcHBlbmQoYmdFbGVtZW50KTtcclxuXHJcbiAgICAgICAgbGV0IHRpdGxlRWxlbWVudCA9IG5ldyBET00oXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInRpdGxlXCJcclxuICAgICAgICB9KS5odG1sKGNvbmZpZy50aXRsZSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKHRpdGxlRWxlbWVudCk7XHJcblxyXG4gICAgICAgIGxldCB0aW1lRWxlbWVudCA9IG5ldyBET00oXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImR1cmF0aW9uXCJcclxuICAgICAgICB9KS5odG1sKFN0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUoY29uZmlnLmR1cmF0aW9uKSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKHRpbWVFbGVtZW50KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGl0ZW1FbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtFdmVudCwgRXZlbnREaXNwYXRjaGVyLCBOb0FyZ3N9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtTZWVrQmFyTGFiZWx9IGZyb20gXCIuL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFNlZWtCYXJ9IGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vla0JhckNvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBsYWJlbCBhYm92ZSB0aGUgc2VlayBwb3NpdGlvbi5cclxuICAgICAqL1xyXG4gICAgbGFiZWw/OiBTZWVrQmFyTGFiZWw7XHJcbiAgICAvKipcclxuICAgICAqIEJhciB3aWxsIGJlIHZlcnRpY2FsIGluc3RlYWQgb2YgaG9yaXpvbnRhbCBpZiBzZXQgdG8gdHJ1ZS5cclxuICAgICAqL1xyXG4gICAgdmVydGljYWw/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRXZlbnQgYXJndW1lbnQgaW50ZXJmYWNlIGZvciBhIHNlZWsgcHJldmlldyBldmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vla1ByZXZpZXdFdmVudEFyZ3MgZXh0ZW5kcyBOb0FyZ3Mge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUZWxscyBpZiB0aGUgc2VlayBwcmV2aWV3IGV2ZW50IGNvbWVzIGZyb20gYSBzY3J1YmJpbmcuXHJcbiAgICAgKi9cclxuICAgIHNjcnViYmluZzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRpbWVsaW5lIHBvc2l0aW9uIGluIHBlcmNlbnQgd2hlcmUgdGhlIGV2ZW50IG9yaWdpbmF0ZXMgZnJvbS5cclxuICAgICAqL1xyXG4gICAgcG9zaXRpb246IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc2VlayBiYXIgdG8gc2VlayB3aXRoaW4gdGhlIHBsYXllcidzIG1lZGlhLiBJdCBkaXNwbGF5cyB0aGUgcHVycmVudCBwbGF5YmFjayBwb3NpdGlvbiwgYW1vdW50IG9mIGJ1ZmZlZCBkYXRhLCBzZWVrXHJcbiAqIHRhcmdldCwgYW5kIGtlZXBzIHN0YXR1cyBhYm91dCBhbiBvbmdvaW5nIHNlZWsuXHJcbiAqXHJcbiAqIFRoZSBzZWVrIGJhciBkaXNwbGF5cyBkaWZmZXJlbnQgXCJiYXJzXCI6XHJcbiAqICAtIHRoZSBwbGF5YmFjayBwb3NpdGlvbiwgaS5lLiB0aGUgcG9zaXRpb24gaW4gdGhlIG1lZGlhIGF0IHdoaWNoIHRoZSBwbGF5ZXIgY3VycmVudCBwbGF5YmFjayBwb2ludGVyIGlzIHBvc2l0aW9uZWRcclxuICogIC0gdGhlIGJ1ZmZlciBwb3NpdGlvbiwgd2hpY2ggdXN1YWxseSBpcyB0aGUgcGxheWJhY2sgcG9zaXRpb24gcGx1cyB0aGUgdGltZSBzcGFuIHRoYXQgaXMgYWxyZWFkeSBidWZmZXJlZCBhaGVhZFxyXG4gKiAgLSB0aGUgc2VlayBwb3NpdGlvbiwgdXNlZCB0byBwcmV2aWV3IHRvIHdoZXJlIGluIHRoZSB0aW1lbGluZSBhIHNlZWsgd2lsbCBqdW1wIHRvXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2Vla0JhciBleHRlbmRzIENvbXBvbmVudDxTZWVrQmFyQ29uZmlnPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgQ1NTIGNsYXNzIHRoYXQgaXMgYWRkZWQgdG8gdGhlIERPTSBlbGVtZW50IHdoaWxlIHRoZSBzZWVrIGJhciBpcyBpbiBcInNlZWtpbmdcIiBzdGF0ZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ0xBU1NfU0VFS0lORyA9IFwic2Vla2luZ1wiO1xyXG5cclxuICAgIHByaXZhdGUgc2Vla0JhcjogRE9NO1xyXG4gICAgcHJpdmF0ZSBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbjogRE9NO1xyXG4gICAgcHJpdmF0ZSBzZWVrQmFyQnVmZmVyUG9zaXRpb246IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhclNlZWtQb3NpdGlvbjogRE9NO1xyXG4gICAgcHJpdmF0ZSBzZWVrQmFyQmFja2Ryb3A6IERPTTtcclxuXHJcbiAgICBwcml2YXRlIGxhYmVsOiBTZWVrQmFyTGFiZWw7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWVrQmFyRXZlbnRzID0ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBvcGVyYXRpb24gaXMgc3RhcnRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWs6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIGR1cmluZyBhIHNjcnViYmluZyBzZWVrIHRvIGluZGljYXRlIHRoYXQgdGhlIHNlZWsgcHJldmlldyAoaS5lLiB0aGUgdmlkZW8gZnJhbWUpIHNob3VsZCBiZSB1cGRhdGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla1ByZXZpZXc6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgU2Vla1ByZXZpZXdFdmVudEFyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZWQgd2hlbiBhIHNjcnViYmluZyBzZWVrIGhhcyBmaW5pc2hlZCBvciB3aGVuIGEgZGlyZWN0IHNlZWsgaXMgaXNzdWVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla2VkOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIG51bWJlcj4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktc2Vla2JhclwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gdGhpcy5jb25maWcubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0xhYmVsKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRMYWJlbCgpLmluaXRpYWxpemUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHBsYXliYWNrTm90SW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIGxldCBpc1BsYXlpbmcgPSBmYWxzZTtcclxuICAgICAgICBsZXQgaXNTZWVraW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBwbGF5YmFjayBhbmQgYnVmZmVyIHBvc2l0aW9uc1xyXG4gICAgICAgIGxldCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gT25jZSB0aGlzIGhhbmRsZXIgb3MgY2FsbGVkLCBwbGF5YmFjayBoYXMgYmVlbiBzdGFydGVkIGFuZCB3ZSBzZXQgdGhlIGZsYWcgdG8gZmFsc2VcclxuICAgICAgICAgICAgcGxheWJhY2tOb3RJbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKGlzU2Vla2luZykge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgY2F1Z2h0IGEgc2VlayBwcmV2aWV3IHNlZWssIGRvIG5vdCB1cGRhdGUgdGhlIHNlZWtiYXJcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0xpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2FzZSBtdXN0IGJlIGV4cGxpY2l0bHkgaGFuZGxlZCB0byBhdm9pZCBkaXZpc2lvbiBieSB6ZXJvXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKDEwMCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UgPSAxMDAgLSAoMTAwIC8gcGxheWVyLmdldE1heFRpbWVTaGlmdCgpICogcGxheWVyLmdldFRpbWVTaGlmdCgpKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFsd2F5cyBzaG93IGZ1bGwgYnVmZmVyIGZvciBsaXZlIHN0cmVhbXNcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24oMTAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5YmFja1Bvc2l0aW9uUGVyY2VudGFnZSA9IDEwMCAvIHBsYXllci5nZXREdXJhdGlvbigpICogcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBidWZmZXJQZXJjZW50YWdlID0gMTAwIC8gcGxheWVyLmdldER1cmF0aW9uKCkgKiBwbGF5ZXIuZ2V0VmlkZW9CdWZmZXJMZW5ndGgoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UgKyBidWZmZXJQZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IGZsYWcgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgICAgIHBsYXliYWNrTm90SW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc2Vla2JhciB1cG9uIHRoZXNlIGV2ZW50c1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgcGxheWJhY2sgcG9zaXRpb24gd2hlbiBpdCBjaGFuZ2VzXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1RPUF9CVUZGRVJJTkcsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIGJ1ZmZlcmxldmVsIHdoZW4gYnVmZmVyaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFS0VELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBwbGF5YmFjayBwb3NpdGlvbiB3aGVuIGEgc2VlayBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZURUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIHBsYXliYWNrIHBvc2l0aW9uIHdoZW4gYSB0aW1lc2hpZnQgaGFzIGZpbmlzaGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VHTUVOVF9SRVFVRVNUX0ZJTklTSEVELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBidWZmZXJsZXZlbCB3aGVuIGEgc2VnbWVudCBoYXMgYmVlbiBkb3dubG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURSwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgcGxheWJhY2sgcG9zaXRpb24gb2YgQ2FzdCBwbGF5YmFja1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLRUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZULCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZURUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHNlZWsgPSBmdW5jdGlvbiAocGVyY2VudGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNMaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci50aW1lU2hpZnQocGxheWVyLmdldE1heFRpbWVTaGlmdCgpIC0gKHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIChwZXJjZW50YWdlIC8gMTAwKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnNlZWsocGxheWVyLmdldER1cmF0aW9uKCkgKiAocGVyY2VudGFnZSAvIDEwMCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSB0cnVlOyAvLyB0cmFjayBzZWVraW5nIHN0YXR1cyBzbyB3ZSBjYW4gY2F0Y2ggZXZlbnRzIGZyb20gc2VlayBwcmV2aWV3IHNlZWtzXHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZnkgVUkgbWFuYWdlciBvZiBzdGFydGVkIHNlZWtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5kaXNwYXRjaChzZW5kZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2F2ZSBjdXJyZW50IHBsYXliYWNrIHN0YXRlXHJcbiAgICAgICAgICAgIGlzUGxheWluZyA9IHBsYXllci5pc1BsYXlpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFBhdXNlIHBsYXliYWNrIHdoaWxlIHNlZWtpbmdcclxuICAgICAgICAgICAgaWYgKGlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IFNlZWtCYXIsIGFyZ3M6IFNlZWtQcmV2aWV3RXZlbnRBcmdzKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGlmeSBVSSBtYW5hZ2VyIG9mIHNlZWsgcHJldmlld1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25TZWVrUHJldmlldy5kaXNwYXRjaChzZW5kZXIsIGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYub25TZWVrUHJldmlldy5zdWJzY3JpYmVSYXRlTGltaXRlZChmdW5jdGlvbiAoc2VuZGVyOiBTZWVrQmFyLCBhcmdzOiBTZWVrUHJldmlld0V2ZW50QXJncykge1xyXG4gICAgICAgICAgICAvLyBSYXRlLWxpbWl0ZWQgc2NydWJiaW5nIHNlZWtcclxuICAgICAgICAgICAgaWYgKGFyZ3Muc2NydWJiaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBzZWVrKGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICBzZWxmLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBwZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgcGxheWJhY2sgaGFzIG5vdCBiZWVuIHN0YXJ0ZWQgYmVmb3JlLCB3ZSBuZWVkIHRvIGNhbGwgcGxheSB0byBpbiBpdCB0aGUgcGxheWJhY2sgZW5naW5lIGZvciB0aGVcclxuICAgICAgICAgICAgLy8gc2VlayB0byB3b3JrLiBXZSBjYWxsIHBhdXNlKCkgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkcyBiZWNhdXNlIHdlIGFjdHVhbGx5IGRvIG5vdCB3YW50IHRvIHBsYXkgYmFjayBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZsYWcgc2VydmVzIHRvIGNhbGwgcGxheS9wYXVzZSBvbmx5IG9uIHRoZSBmaXJzdCBzZWVrIGJlZm9yZSBwbGF5YmFjayBoYXMgc3RhcnRlZCwgaW5zdGVhZCBvZiBldmVyeVxyXG4gICAgICAgICAgICAvLyB0aW1lIGEgc2VlayBpcyBpc3N1ZWQuXHJcbiAgICAgICAgICAgIGlmIChwbGF5YmFja05vdEluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5YmFja05vdEluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERvIHRoZSBzZWVrXHJcbiAgICAgICAgICAgIHNlZWsocGVyY2VudGFnZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDb250aW51ZSBwbGF5YmFjayBhZnRlciBzZWVrIGlmIHBsYXllciB3YXMgcGxheWluZyB3aGVuIHNlZWsgc3RhcnRlZFxyXG4gICAgICAgICAgICBpZiAoaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZnkgVUkgbWFuYWdlciBvZiBmaW5pc2hlZCBzZWVrXHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vblNlZWtlZC5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoc2VsZi5oYXNMYWJlbCgpKSB7XHJcbiAgICAgICAgICAgIC8vIENvbmZpZ3VyZSBhIHNlZWtiYXIgbGFiZWwgdGhhdCBpcyBpbnRlcm5hbCB0byB0aGUgc2Vla2JhcilcclxuICAgICAgICAgICAgc2VsZi5nZXRMYWJlbCgpLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maWcudmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maWcuY3NzQ2xhc3Nlcy5wdXNoKFwidmVydGljYWxcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2Vla0JhckNvbnRhaW5lciA9IG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBzZWVrQmFyID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJzZWVrYmFyXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXIgPSBzZWVrQmFyO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93cyB0aGUgYnVmZmVyIGZpbGwgbGV2ZWxcclxuICAgICAgICBsZXQgc2Vla0JhckJ1ZmZlckxldmVsID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJzZWVrYmFyLWJ1ZmZlcmxldmVsXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXJCdWZmZXJQb3NpdGlvbiA9IHNlZWtCYXJCdWZmZXJMZXZlbDtcclxuXHJcbiAgICAgICAgLy8gSW5kaWNhdG9yIHRoYXQgc2hvd3MgdGhlIGN1cnJlbnQgcGxheWJhY2sgcG9zaXRpb25cclxuICAgICAgICBsZXQgc2Vla0JhclBsYXliYWNrUG9zaXRpb24gPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInNlZWtiYXItcGxheWJhY2twb3NpdGlvblwiXHJcbiAgICAgICAgfSkuYXBwZW5kKG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IFwic2Vla2Jhci1wbGF5YmFja3Bvc2l0aW9uLW1hcmtlclwiXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhclBsYXliYWNrUG9zaXRpb24gPSBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgLy8gSW5kaWNhdG9yIHRoYXQgc2hvdyB3aGVyZSBhIHNlZWsgd2lsbCBnbyB0b1xyXG4gICAgICAgIGxldCBzZWVrQmFyU2Vla1Bvc2l0aW9uID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJzZWVrYmFyLXNlZWtwb3NpdGlvblwiXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyU2Vla1Bvc2l0aW9uID0gc2Vla0JhclNlZWtQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgLy8gSW5kaWNhdG9yIHRoYXQgc2hvd3MgdGhlIGZ1bGwgc2Vla2JhclxyXG4gICAgICAgIGxldCBzZWVrQmFyQmFja2Ryb3AgPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInNlZWtiYXItYmFja2Ryb3BcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhckJhY2tkcm9wID0gc2Vla0JhckJhY2tkcm9wO1xyXG5cclxuICAgICAgICBzZWVrQmFyLmFwcGVuZChzZWVrQmFyQmFja2Ryb3AsIHNlZWtCYXJCdWZmZXJMZXZlbCwgc2Vla0JhclNlZWtQb3NpdGlvbiwgc2Vla0JhclBsYXliYWNrUG9zaXRpb24pO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIERlZmluZSBoYW5kbGVyIGZ1bmN0aW9ucyBzbyB3ZSBjYW4gYXR0YWNoL3JlbW92ZSB0aGVtIGxhdGVyXHJcbiAgICAgICAgbGV0IG1vdXNlTW92ZUhhbmRsZXIgPSBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0UGVyY2VudGFnZSA9IDEwMCAqIHNlbGYuZ2V0TW91c2VPZmZzZXQoZSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla1Bvc2l0aW9uKHRhcmdldFBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24odGFyZ2V0UGVyY2VudGFnZSk7XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrUHJldmlld0V2ZW50KHRhcmdldFBlcmNlbnRhZ2UsIHRydWUpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgbGV0IG1vdXNlVXBIYW5kbGVyID0gZnVuY3Rpb24gKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGhhbmRsZXJzLCBzZWVrIG9wZXJhdGlvbiBpcyBmaW5pc2hlZFxyXG4gICAgICAgICAgICBuZXcgRE9NKGRvY3VtZW50KS5vZmYoXCJtb3VzZW1vdmVcIiwgbW91c2VNb3ZlSGFuZGxlcik7XHJcbiAgICAgICAgICAgIG5ldyBET00oZG9jdW1lbnQpLm9mZihcIm1vdXNldXBcIiwgbW91c2VVcEhhbmRsZXIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldFBlcmNlbnRhZ2UgPSAxMDAgKiBzZWxmLmdldE1vdXNlT2Zmc2V0KGUpO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpcmUgc2Vla2VkIGV2ZW50XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrZWRFdmVudCh0YXJnZXRQZXJjZW50YWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBBIHNlZWsgYWx3YXlzIHN0YXJ0IHdpdGggYSBtb3VzZWRvd24gZGlyZWN0bHkgb24gdGhlIHNlZWtiYXIuIFRvIHRyYWNrIGEgc2VlayBhbHNvIG91dHNpZGUgdGhlIHNlZWtiYXJcclxuICAgICAgICAvLyAoc28gdGhlIHVzZXIgZG9lcyBub3QgbmVlZCB0byB0YWtlIGNhcmUgdGhhdCB0aGUgbW91c2UgYWx3YXlzIHN0YXlzIG9uIHRoZSBzZWVrYmFyKSwgd2UgYXR0YWNoIHRoZSBtb3VzZW1vdmVcclxuICAgICAgICAvLyBhbmQgbW91c2V1cCBoYW5kbGVycyB0byB0aGUgd2hvbGUgZG9jdW1lbnQuIEEgc2VlayBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgdXNlciBsaWZ0cyB0aGUgbW91c2Uga2V5LlxyXG4gICAgICAgIC8vIEEgc2VlayBtb3VzZSBnZXN0dXJlIGlzIHRodXMgYmFzaWNhbGx5IGEgY2xpY2sgd2l0aCBhIGxvbmcgdGltZSBmcmFtZSBiZXR3ZWVuIGRvd24gYW5kIHVwIGV2ZW50cy5cclxuICAgICAgICBzZWVrQmFyLm9uKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uIChlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFByZXZlbnQgc2VsZWN0aW9uIG9mIERPTSBlbGVtZW50c1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcodHJ1ZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBGaXJlIHNlZWtlZCBldmVudFxyXG4gICAgICAgICAgICBzZWxmLm9uU2Vla0V2ZW50KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgaGFuZGxlciB0byB0cmFjayB0aGUgc2VlayBvcGVyYXRpb24gb3ZlciB0aGUgd2hvbGUgZG9jdW1lbnRcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub24oXCJtb3VzZW1vdmVcIiwgbW91c2VNb3ZlSGFuZGxlcik7XHJcbiAgICAgICAgICAgIG5ldyBET00oZG9jdW1lbnQpLm9uKFwibW91c2V1cFwiLCBtb3VzZVVwSGFuZGxlcik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERpc3BsYXkgc2VlayB0YXJnZXQgaW5kaWNhdG9yIHdoZW4gbW91c2UgaG92ZXJzIG92ZXIgc2Vla2JhclxyXG4gICAgICAgIHNlZWtCYXIub24oXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24gKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gMTAwICogc2VsZi5nZXRNb3VzZU9mZnNldChlKTtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVrUG9zaXRpb24ocG9zaXRpb24pO1xyXG4gICAgICAgICAgICBzZWxmLm9uU2Vla1ByZXZpZXdFdmVudChwb3NpdGlvbiwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYuaGFzTGFiZWwoKSAmJiBzZWxmLmdldExhYmVsKCkuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXRMYWJlbCgpLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBIaWRlIHNlZWsgdGFyZ2V0IGluZGljYXRvciB3aGVuIG1vdXNlIGxlYXZlcyBzZWVrYmFyXHJcbiAgICAgICAgc2Vla0Jhci5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24gKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVrUG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5oYXNMYWJlbCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldExhYmVsKCkuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNlZWtCYXJDb250YWluZXIuYXBwZW5kKHNlZWtCYXIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xyXG4gICAgICAgICAgICBzZWVrQmFyQ29udGFpbmVyLmFwcGVuZCh0aGlzLmxhYmVsLmdldERvbUVsZW1lbnQoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Vla0JhckNvbnRhaW5lcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGhvcml6b250YWwgbW91c2Ugb2Zmc2V0IGZyb20gdGhlIGxlZnQgZWRnZSBvZiB0aGUgc2VlayBiYXIuXHJcbiAgICAgKiBAcGFyYW0gZSB0aGUgZXZlbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgZnJvbVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gYSBudW1iZXIgaW4gdGhlIHJhbmdlIG9mIFswLCAxXSwgd2hlcmUgMCBpcyB0aGUgbGVmdCBlZGdlIGFuZCAxIGlzIHRoZSByaWdodCBlZGdlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0SG9yaXpvbnRhbE1vdXNlT2Zmc2V0KGU6IE1vdXNlRXZlbnQpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBlbGVtZW50T2Zmc2V0UHggPSB0aGlzLnNlZWtCYXIub2Zmc2V0KCkubGVmdDtcclxuICAgICAgICBsZXQgd2lkdGhQeCA9IHRoaXMuc2Vla0Jhci53aWR0aCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRQeCA9IGUucGFnZVggLSBlbGVtZW50T2Zmc2V0UHg7XHJcbiAgICAgICAgbGV0IG9mZnNldCA9IDEgLyB3aWR0aFB4ICogb2Zmc2V0UHg7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLnNhbml0aXplT2Zmc2V0KG9mZnNldCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSB2ZXJ0aWNhbCBtb3VzZSBvZmZzZXQgZnJvbSB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHNlZWsgYmFyLlxyXG4gICAgICogQHBhcmFtIGUgdGhlIGV2ZW50IHRvIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0IGZyb21cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGEgbnVtYmVyIGluIHRoZSByYW5nZSBvZiBbMCwgMV0sIHdoZXJlIDAgaXMgdGhlIGJvdHRvbSBlZGdlIGFuZCAxIGlzIHRoZSB0b3AgZWRnZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldFZlcnRpY2FsTW91c2VPZmZzZXQoZTogTW91c2VFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRPZmZzZXRQeCA9IHRoaXMuc2Vla0Jhci5vZmZzZXQoKS50b3A7XHJcbiAgICAgICAgbGV0IHdpZHRoUHggPSB0aGlzLnNlZWtCYXIuaGVpZ2h0KCk7XHJcbiAgICAgICAgbGV0IG9mZnNldFB4ID0gZS5wYWdlWSAtIGVsZW1lbnRPZmZzZXRQeDtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gMSAvIHdpZHRoUHggKiBvZmZzZXRQeDtcclxuXHJcbiAgICAgICAgcmV0dXJuIDEgLSB0aGlzLnNhbml0aXplT2Zmc2V0KG9mZnNldCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBtb3VzZSBvZmZzZXQgZm9yIHRoZSBjdXJyZW50IGNvbmZpZ3VyYXRpb24gKGhvcml6b250YWwgb3IgdmVydGljYWwpLlxyXG4gICAgICogQHBhcmFtIGUgdGhlIGV2ZW50IHRvIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0IGZyb21cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGEgbnVtYmVyIGluIHRoZSByYW5nZSBvZiBbMCwgMV1cclxuICAgICAqIEBzZWUgI2dldEhvcml6b250YWxNb3VzZU9mZnNldFxyXG4gICAgICogQHNlZSAjZ2V0VmVydGljYWxNb3VzZU9mZnNldFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldE1vdXNlT2Zmc2V0KGU6IE1vdXNlRXZlbnQpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRWZXJ0aWNhbE1vdXNlT2Zmc2V0KGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEhvcml6b250YWxNb3VzZU9mZnNldChlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTYW5pdGl6ZXMgdGhlIG1vdXNlIG9mZnNldCB0byB0aGUgcmFuZ2Ugb2YgWzAsIDFdLlxyXG4gICAgICpcclxuICAgICAqIFdoZW4gdHJhY2tpbmcgdGhlIG1vdXNlIG91dHNpZGUgdGhlIHNlZWsgYmFyLCB0aGUgb2Zmc2V0IGNhbiBiZSBvdXRzaWRlIHRoZSBkZXNpcmVkIHJhbmdlIGFuZCB0aGlzIG1ldGhvZFxyXG4gICAgICogbGltaXRzIGl0IHRvIHRoZSBkZXNpcmVkIHJhbmdlLiBFLmcuIGEgbW91c2UgZXZlbnQgbGVmdCBvZiB0aGUgbGVmdCBlZGdlIG9mIGEgc2VlayBiYXIgeWllbGRzIGFuIG9mZnNldCBiZWxvd1xyXG4gICAgICogemVybywgYnV0IHRvIGRpc3BsYXkgdGhlIHNlZWsgdGFyZ2V0IG9uIHRoZSBzZWVrIGJhciwgd2UgbmVlZCB0byBsaW1pdCBpdCB0byB6ZXJvLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBvZmZzZXQgdGhlIG9mZnNldCB0byBzYW5pdGl6ZVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIHNhbml0aXplZCBvZmZzZXQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc2FuaXRpemVPZmZzZXQob2Zmc2V0OiBudW1iZXIpIHtcclxuICAgICAgICAvLyBTaW5jZSB3ZSB0cmFjayBtb3VzZSBtb3ZlcyBvdmVyIHRoZSB3aG9sZSBkb2N1bWVudCwgdGhlIHRhcmdldCBjYW4gYmUgb3V0c2lkZSB0aGUgc2VlayByYW5nZSxcclxuICAgICAgICAvLyBhbmQgd2UgbmVlZCB0byBsaW1pdCBpdCB0byB0aGUgWzAsIDFdIHJhbmdlLlxyXG4gICAgICAgIGlmIChvZmZzZXQgPCAwKSB7XHJcbiAgICAgICAgICAgIG9mZnNldCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChvZmZzZXQgPiAxKSB7XHJcbiAgICAgICAgICAgIG9mZnNldCA9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9zaXRpb24gb2YgdGhlIHBsYXliYWNrIHBvc2l0aW9uIGluZGljYXRvci5cclxuICAgICAqIEBwYXJhbSBwZXJjZW50IGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTAwIGFzIHJldHVybmVkIGJ5IHRoZSBwbGF5ZXJcclxuICAgICAqL1xyXG4gICAgc2V0UGxheWJhY2tQb3NpdGlvbihwZXJjZW50OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMuc2Vla0JhclBsYXliYWNrUG9zaXRpb24sIHBlcmNlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9zaXRpb24gdW50aWwgd2hpY2ggbWVkaWEgaXMgYnVmZmVyZWQuXHJcbiAgICAgKiBAcGFyYW0gcGVyY2VudCBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEwMFxyXG4gICAgICovXHJcbiAgICBzZXRCdWZmZXJQb3NpdGlvbihwZXJjZW50OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMuc2Vla0JhckJ1ZmZlclBvc2l0aW9uLCBwZXJjZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHBvc2l0aW9uIHdoZXJlIGEgc2VlaywgaWYgZXhlY3V0ZWQsIHdvdWxkIGp1bXAgdG8uXHJcbiAgICAgKiBAcGFyYW0gcGVyY2VudCBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEwMFxyXG4gICAgICovXHJcbiAgICBzZXRTZWVrUG9zaXRpb24ocGVyY2VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZXRQb3NpdGlvbih0aGlzLnNlZWtCYXJTZWVrUG9zaXRpb24sIHBlcmNlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSBhY3R1YWwgcG9zaXRpb24gKHdpZHRoIG9yIGhlaWdodCkgb2YgYSBET00gZWxlbWVudCB0aGF0IHJlcHJlc2VudCBhIGJhciBpbiB0aGUgc2VlayBiYXIuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCB0byBzZXQgdGhlIHBvc2l0aW9uIGZvclxyXG4gICAgICogQHBhcmFtIHBlcmNlbnQgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMDBcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzZXRQb3NpdGlvbihlbGVtZW50OiBET00sIHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBzdHlsZSA9IHRoaXMuY29uZmlnLnZlcnRpY2FsID8ge1wiaGVpZ2h0XCI6IHBlcmNlbnQgKyBcIiVcIn0gOiB7XCJ3aWR0aFwiOiBwZXJjZW50ICsgXCIlXCJ9O1xyXG4gICAgICAgIGVsZW1lbnQuY3NzKHN0eWxlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFB1dHMgdGhlIHNlZWsgYmFyIGludG8gb3Igb3V0IG9mIHNlZWtpbmcgc3RhdGUgYnkgYWRkaW5nL3JlbW92aW5nIGEgY2xhc3MgdG8gdGhlIERPTSBlbGVtZW50LiBUaGlzIGNhbiBiZSB1c2VkXHJcbiAgICAgKiB0byBhZGp1c3QgdGhlIHN0eWxpbmcgd2hpbGUgc2Vla2luZy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gc2Vla2luZyBzaG91bGQgYmUgdHJ1ZSB3aGVuIGVudGVyaW5nIHNlZWsgc3RhdGUsIGZhbHNlIHdoZW4gZXhpdGluZyB0aGUgc2VlayBzdGF0ZVxyXG4gICAgICovXHJcbiAgICBzZXRTZWVraW5nKHNlZWtpbmc6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAoc2Vla2luZykge1xyXG4gICAgICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhTZWVrQmFyLkNMQVNTX1NFRUtJTkcpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKFNlZWtCYXIuQ0xBU1NfU0VFS0lORyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzZWVrIGJhciBpcyBjdXJyZW50bHkgaW4gdGhlIHNlZWsgc3RhdGUuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBpbiBzZWVrIHN0YXRlLCBlbHNlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGlzU2Vla2luZygpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXREb21FbGVtZW50KCkuaGFzQ2xhc3MoU2Vla0Jhci5DTEFTU19TRUVLSU5HKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgc2VlayBiYXIgaGFzIGEge0BsaW5rIFNlZWtCYXJMYWJlbH0uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgc2VlayBiYXIgaGFzIGEgbGFiZWwsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaGFzTGFiZWwoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWwgIT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGxhYmVsIG9mIHRoaXMgc2VlayBiYXIuXHJcbiAgICAgKiBAcmV0dXJucyB7U2Vla0JhckxhYmVsfSB0aGUgbGFiZWwgaWYgdGhpcyBzZWVrIGJhciBoYXMgYSBsYWJlbCwgZWxzZSBudWxsXHJcbiAgICAgKi9cclxuICAgIGdldExhYmVsKCk6IFNlZWtCYXJMYWJlbCB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblNlZWtFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblNlZWtQcmV2aWV3RXZlbnQocGVyY2VudGFnZTogbnVtYmVyLCBzY3J1YmJpbmc6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xyXG4gICAgICAgICAgICB0aGlzLmxhYmVsLnNldFRleHQocGVyY2VudGFnZSArIFwiXCIpO1xyXG4gICAgICAgICAgICB0aGlzLmxhYmVsLmdldERvbUVsZW1lbnQoKS5jc3Moe1xyXG4gICAgICAgICAgICAgICAgXCJsZWZ0XCI6IHBlcmNlbnRhZ2UgKyBcIiVcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vla1ByZXZpZXcuZGlzcGF0Y2godGhpcywge3NjcnViYmluZzogc2NydWJiaW5nLCBwb3NpdGlvbjogcGVyY2VudGFnZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblNlZWtlZEV2ZW50KHBlcmNlbnRhZ2U6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtlZC5kaXNwYXRjaCh0aGlzLCBwZXJjZW50YWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBhIHNjcnViYmluZyBzZWVrIG9wZXJhdGlvbiBpcyBzdGFydGVkLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlZWtCYXIsIE5vQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblNlZWsoKTogRXZlbnQ8U2Vla0JhciwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWsuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgZHVyaW5nIGEgc2NydWJiaW5nIHNlZWsgKHRvIGluZGljYXRlIHRoYXQgdGhlIHNlZWsgcHJldmlldywgaS5lLiB0aGUgdmlkZW8gZnJhbWUsXHJcbiAgICAgKiBzaG91bGQgYmUgdXBkYXRlZCksIG9yIGR1cmluZyBhIG5vcm1hbCBzZWVrIHByZXZpZXcgd2hlbiB0aGUgc2VlayBiYXIgaXMgaG92ZXJlZCAoYW5kIHRoZSBzZWVrIHRhcmdldCxcclxuICAgICAqIGkuZS4gdGhlIHNlZWsgYmFyIGxhYmVsLCBzaG91bGQgYmUgdXBkYXRlZCkuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2Vla0JhciwgU2Vla1ByZXZpZXdFdmVudEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TZWVrUHJldmlldygpOiBFdmVudDxTZWVrQmFyLCBTZWVrUHJldmlld0V2ZW50QXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrUHJldmlldy5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGEgc2NydWJiaW5nIHNlZWsgaGFzIGZpbmlzaGVkIG9yIHdoZW4gYSBkaXJlY3Qgc2VlayBpcyBpc3N1ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2Vla0JhciwgbnVtYmVyPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uU2Vla2VkKCk6IEV2ZW50PFNlZWtCYXIsIG51bWJlcj4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXIsIENvbnRhaW5lckNvbmZpZ30gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFNlZWtCYXJMYWJlbH0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFNlZWtCYXJMYWJlbENvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvLyBub3RoaW5nIHlldFxyXG59XHJcblxyXG4vKipcclxuICogQSBsYWJlbCBmb3IgYSB7QGxpbmsgU2Vla0Jhcn0gdGhhdCBjYW4gZGlzcGxheSB0aGUgc2VlayB0YXJnZXQgdGltZSBhbmQgYSB0aHVtYm5haWwuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2Vla0JhckxhYmVsIGV4dGVuZHMgQ29udGFpbmVyPFNlZWtCYXJMYWJlbENvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuICAgIHByaXZhdGUgdGh1bWJuYWlsOiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh7Y3NzQ2xhc3NlczogW1wic2Vla2Jhci1sYWJlbFwiXX0pO1xyXG4gICAgICAgIHRoaXMudGh1bWJuYWlsID0gbmV3IENvbXBvbmVudCh7Y3NzQ2xhc3NlczogW1wic2Vla2Jhci10aHVtYm5haWxcIl19KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zZWVrYmFyLWxhYmVsXCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFtuZXcgQ29udGFpbmVyKHtjb21wb25lbnRzOiBbdGhpcy50aHVtYm5haWwsIHRoaXMubGFiZWxdLCBjc3NDbGFzczogXCJzZWVrYmFyLWxhYmVsLWlubmVyXCJ9KV0sXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0xpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbWUgPSBwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgLSBwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgKiAocGVyY2VudGFnZSAvIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWUodGltZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZSA9IHBsYXllci5nZXREdXJhdGlvbigpICogKHBlcmNlbnRhZ2UgLyAxMDApO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lKHRpbWUpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUaHVtYm5haWwocGxheWVyLmdldFRodW1iKHRpbWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhcmJpdHJhcnkgdGV4dCBvbiB0aGUgbGFiZWwuXHJcbiAgICAgKiBAcGFyYW0gdGV4dCB0aGUgdGV4dCB0byBzaG93IG9uIHRoZSBsYWJlbFxyXG4gICAgICovXHJcbiAgICBzZXRUZXh0KHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubGFiZWwuc2V0VGV4dCh0ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSB0aW1lIHRvIGJlIGRpc3BsYXllZCBvbiB0aGUgbGFiZWwuXHJcbiAgICAgKiBAcGFyYW0gc2Vjb25kcyB0aGUgdGltZSBpbiBzZWNvbmRzIHRvIGRpc3BsYXkgb24gdGhlIGxhYmVsXHJcbiAgICAgKi9cclxuICAgIHNldFRpbWUoc2Vjb25kczogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KFN0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUoc2Vjb25kcykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBvciByZW1vdmVzIGEgdGh1bWJuYWlsIG9uIHRoZSBsYWJlbC5cclxuICAgICAqIEBwYXJhbSB0aHVtYm5haWwgdGhlIHRodW1ibmFpbCB0byBkaXNwbGF5IG9uIHRoZSBsYWJlbCBvciBudWxsIHRvIHJlbW92ZSBhIGRpc3BsYXllZCB0aHVtYm5haWxcclxuICAgICAqL1xyXG4gICAgc2V0VGh1bWJuYWlsKHRodW1ibmFpbDogYml0bW92aW4ucGxheWVyLlRodW1ibmFpbCA9IG51bGwpIHtcclxuICAgICAgICBsZXQgdGh1bWJuYWlsRWxlbWVudCA9IHRoaXMudGh1bWJuYWlsLmdldERvbUVsZW1lbnQoKTtcclxuXHJcbiAgICAgICAgaWYgKHRodW1ibmFpbCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRodW1ibmFpbEVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgICAgICAgIFwiYmFja2dyb3VuZC1pbWFnZVwiOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgXCJkaXNwbGF5XCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBcImhlaWdodFwiOiBudWxsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGh1bWJuYWlsRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiaW5oZXJpdFwiLFxyXG4gICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlXCI6IGB1cmwoJHt0aHVtYm5haWwudXJsfSlgLFxyXG4gICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiB0aHVtYm5haWwudyArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHRodW1ibmFpbC5oICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLXBvc2l0aW9uXCI6IGAtJHt0aHVtYm5haWwueH1weCAtJHt0aHVtYm5haWwueX1weGBcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0xpc3RTZWxlY3RvciwgTGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSBzZWxlY3QgYm94IHByb3ZpZGluZyB0aGUgcG9zc2liaWxpdHkgdG8gc2VsZWN0IGEgc2luZ2xlIGl0ZW0gb3V0IG9mIGEgbGlzdCBvZiBhdmFpbGFibGUgaXRlbXMuXHJcbiAqXHJcbiAqIERPTSBleGFtcGxlOlxyXG4gKiA8Y29kZT5cclxuICogICAgIDxzZWxlY3QgY2xhc3M9XCJ1aS1zZWxlY3Rib3hcIj5cclxuICogICAgICAgICA8b3B0aW9uIHZhbHVlPVwia2V5XCI+bGFiZWw8L29wdGlvbj5cclxuICogICAgICAgICAuLi5cclxuICogICAgIDwvc2VsZWN0PlxyXG4gKiA8L2NvZGU+XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2VsZWN0Qm94IGV4dGVuZHMgTGlzdFNlbGVjdG9yPExpc3RTZWxlY3RvckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0RWxlbWVudDogRE9NO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNlbGVjdGJveFwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgc2VsZWN0RWxlbWVudCA9IG5ldyBET00oXCJzZWxlY3RcIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0RWxlbWVudCA9IHNlbGVjdEVsZW1lbnQ7XHJcbiAgICAgICAgdGhpcy51cGRhdGVEb21JdGVtcygpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZWN0RWxlbWVudC5vbihcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IG5ldyBET00odGhpcykudmFsKCk7XHJcbiAgICAgICAgICAgIHNlbGYub25JdGVtU2VsZWN0ZWRFdmVudCh2YWx1ZSwgZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VsZWN0RWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlRG9tSXRlbXMoc2VsZWN0ZWRWYWx1ZTogc3RyaW5nID0gbnVsbCkge1xyXG4gICAgICAgIC8vIERlbGV0ZSBhbGwgY2hpbGRyZW5cclxuICAgICAgICB0aGlzLnNlbGVjdEVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHVwZGF0ZWQgY2hpbGRyZW5cclxuICAgICAgICBmb3IgKGxldCB2YWx1ZSBpbiB0aGlzLml0ZW1zKSB7XHJcbiAgICAgICAgICAgIGxldCBsYWJlbCA9IHRoaXMuaXRlbXNbdmFsdWVdO1xyXG4gICAgICAgICAgICBsZXQgb3B0aW9uRWxlbWVudCA9IG5ldyBET00oXCJvcHRpb25cIiwge1xyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiB2YWx1ZVxyXG4gICAgICAgICAgICB9KS5odG1sKGxhYmVsKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gc2VsZWN0ZWRWYWx1ZSArIFwiXCIpIHsgLy8gY29udmVydCBzZWxlY3RlZFZhbHVlIHRvIHN0cmluZyB0byBjYXRjaCBcIm51bGxcIi9udWxsIGNhc2VcclxuICAgICAgICAgICAgICAgIG9wdGlvbkVsZW1lbnQuYXR0cihcInNlbGVjdGVkXCIsIFwic2VsZWN0ZWRcIik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RWxlbWVudC5hcHBlbmQob3B0aW9uRWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1BZGRlZEV2ZW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlci5vbkl0ZW1BZGRlZEV2ZW50KHZhbHVlKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKHRoaXMuc2VsZWN0ZWRJdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25JdGVtUmVtb3ZlZEV2ZW50KHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBzdXBlci5vbkl0ZW1SZW1vdmVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRG9tSXRlbXModGhpcy5zZWxlY3RlZEl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1TZWxlY3RlZEV2ZW50KHZhbHVlOiBzdHJpbmcsIHVwZGF0ZURvbUl0ZW1zOiBib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIHN1cGVyLm9uSXRlbVNlbGVjdGVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIGlmICh1cGRhdGVEb21JdGVtcykge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKHZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyQ29uZmlnLCBDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1ZpZGVvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vdmlkZW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7QXVkaW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9hdWRpb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtUaW1lb3V0fSBmcm9tIFwiLi4vdGltZW91dFwiO1xyXG5pbXBvcnQge0V2ZW50LCBFdmVudERpc3BhdGNoZXIsIE5vQXJnc30gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBTZXR0aW5nc1BhbmVsfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NQYW5lbENvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIHNldHRpbmdzIHBhbmVsIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIFNldCB0byAtMSB0byBkaXNhYmxlIGF1dG9tYXRpYyBoaWRpbmcuXHJcbiAgICAgKiBEZWZhdWx0OiAzIHNlY29uZHMgKDMwMDApXHJcbiAgICAgKi9cclxuICAgIGhpZGVEZWxheT86IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgcGFuZWwgY29udGFpbmluZyBhIGxpc3Qgb2Yge0BsaW5rIFNldHRpbmdzUGFuZWxJdGVtIGl0ZW1zfSB0aGF0IHJlcHJlc2VudCBsYWJlbGxlZCBzZXR0aW5ncy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nc1BhbmVsIGV4dGVuZHMgQ29udGFpbmVyPFNldHRpbmdzUGFuZWxDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHNldHRpbmdzUGFuZWxFdmVudHMgPSB7XHJcbiAgICAgICAgb25TZXR0aW5nc1N0YXRlQ2hhbmdlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZXR0aW5nc1BhbmVsLCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTZXR0aW5nc1BhbmVsQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnPFNldHRpbmdzUGFuZWxDb25maWc+KGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zZXR0aW5ncy1wYW5lbFwiLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDMwMDBcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IDxTZXR0aW5nc1BhbmVsQ29uZmlnPnRoaXMuZ2V0Q29uZmlnKCk7IC8vIFRPRE8gZml4IGdlbmVyaWNzIHR5cGUgaW5mZXJlbmNlXHJcblxyXG4gICAgICAgIGlmIChjb25maWcuaGlkZURlbGF5ID4gLTEpIHtcclxuICAgICAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dChjb25maWcuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLm9uU2hvdy5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQWN0aXZhdGUgdGltZW91dCB3aGVuIHNob3duXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZXNldCB0aW1lb3V0IG9uIGludGVyYWN0aW9uXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxmLm9uSGlkZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgdGltZW91dCB3aGVuIGhpZGRlbiBmcm9tIG91dHNpZGVcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQuY2xlYXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGaXJlIGV2ZW50IHdoZW4gdGhlIHN0YXRlIG9mIGEgc2V0dGluZ3MtaXRlbSBoYXMgY2hhbmdlZFxyXG4gICAgICAgIGxldCBzZXR0aW5nc1N0YXRlQ2hhbmdlZEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25TZXR0aW5nc1N0YXRlQ2hhbmdlZEV2ZW50KCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5nZXRJdGVtcygpKSB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudC5vbkFjdGl2ZUNoYW5nZWQuc3Vic2NyaWJlKHNldHRpbmdzU3RhdGVDaGFuZ2VkSGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZXJlIGFyZSBhY3RpdmUgc2V0dGluZ3Mgd2l0aGluIHRoaXMgc2V0dGluZ3MgcGFuZWwuIEFuIGFjdGl2ZSBzZXR0aW5nIGlzIGEgc2V0dGluZyB0aGF0IGlzIHZpc2libGVcclxuICAgICAqIGFuZCBlbmFibGVkLCB3aGljaCB0aGUgdXNlciBjYW4gaW50ZXJhY3Qgd2l0aC5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZXJlIGFyZSBhY3RpdmUgc2V0dGluZ3MsIGZhbHNlIGlmIHRoZSBwYW5lbCBpcyBmdW5jdGlvbmFsbHkgZW1wdHkgdG8gYSB1c2VyXHJcbiAgICAgKi9cclxuICAgIGhhc0FjdGl2ZVNldHRpbmdzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiB0aGlzLmdldEl0ZW1zKCkpIHtcclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5pc0FjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0SXRlbXMoKTogU2V0dGluZ3NQYW5lbEl0ZW1bXSB7XHJcbiAgICAgICAgcmV0dXJuIDxTZXR0aW5nc1BhbmVsSXRlbVtdPnRoaXMuY29uZmlnLmNvbXBvbmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2V0dGluZ3NTdGF0ZUNoYW5nZWRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzUGFuZWxFdmVudHMub25TZXR0aW5nc1N0YXRlQ2hhbmdlZC5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBvbmUgb3IgbW9yZSB7QGxpbmsgU2V0dGluZ3NQYW5lbEl0ZW0gaXRlbXN9IGhhdmUgY2hhbmdlZCBzdGF0ZS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZXR0aW5nc1BhbmVsLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TZXR0aW5nc1N0YXRlQ2hhbmdlZCgpOiBFdmVudDxTZXR0aW5nc1BhbmVsLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nc1BhbmVsRXZlbnRzLm9uU2V0dGluZ3NTdGF0ZUNoYW5nZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFuIGl0ZW0gZm9yIGEge0BsaW5rIFNldHRpbmdzUGFuZWx9LCBjb250YWluaW5nIGEge0BsaW5rIExhYmVsfSBhbmQgYSBjb21wb25lbnQgdGhhdCBjb25maWd1cmVzIGEgc2V0dGluZy5cclxuICogU3VwcG9ydGVkIHNldHRpbmcgY29tcG9uZW50czoge0BsaW5rIFNlbGVjdEJveH1cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nc1BhbmVsSXRlbSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcbiAgICBwcml2YXRlIHNldHRpbmc6IFNlbGVjdEJveDtcclxuXHJcbiAgICBwcml2YXRlIHNldHRpbmdzUGFuZWxJdGVtRXZlbnRzID0ge1xyXG4gICAgICAgIG9uQWN0aXZlQ2hhbmdlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZXR0aW5nc1BhbmVsSXRlbSwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxhYmVsOiBzdHJpbmcsIHNlbGVjdEJveDogU2VsZWN0Qm94LCBjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh7dGV4dDogbGFiZWx9KTtcclxuICAgICAgICB0aGlzLnNldHRpbmcgPSBzZWxlY3RCb3g7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktc2V0dGluZ3MtcGFuZWwtZW50cnlcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMubGFiZWwsIHRoaXMuc2V0dGluZ11cclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBoYW5kbGVDb25maWdJdGVtQ2hhbmdlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVGhlIG1pbmltdW0gbnVtYmVyIG9mIGl0ZW1zIHRoYXQgbXVzdCBiZSBhdmFpbGFibGUgZm9yIHRoZSBzZXR0aW5nIHRvIGJlIGRpc3BsYXllZFxyXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBhdCBsZWFzdCB0d28gaXRlbXMgbXVzdCBiZSBhdmFpbGFibGUsIGVsc2UgYSBzZWxlY3Rpb24gaXMgbm90IHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCBtaW5JdGVtc1RvRGlzcGxheSA9IDI7XHJcbiAgICAgICAgICAgIC8vIEF1ZGlvL3ZpZGVvIHF1YWxpdHkgc2VsZWN0IGJveGVzIGNvbnRhaW4gYW4gYWRkaXRpb25hbCBcImF1dG9cIiBtb2RlLCB3aGljaCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgc2luZ2xlIGF2YWlsYWJsZSBxdWFsaXR5IGFsc28gZG9lcyBub3QgbWFrZSBzZW5zZVxyXG4gICAgICAgICAgICBpZiAoc2VsZi5zZXR0aW5nIGluc3RhbmNlb2YgVmlkZW9RdWFsaXR5U2VsZWN0Qm94IHx8IHNlbGYuc2V0dGluZyBpbnN0YW5jZW9mIEF1ZGlvUXVhbGl0eVNlbGVjdEJveCkge1xyXG4gICAgICAgICAgICAgICAgbWluSXRlbXNUb0Rpc3BsYXkgPSAzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBIaWRlIHRoZSBzZXR0aW5nIGlmIG5vIG1lYW5pbmdmdWwgY2hvaWNlIGlzIGF2YWlsYWJsZVxyXG4gICAgICAgICAgICBpZiAoc2VsZi5zZXR0aW5nLml0ZW1Db3VudCgpIDwgbWluSXRlbXNUb0Rpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFZpc2liaWxpdHkgbWlnaHQgaGF2ZSBjaGFuZ2VkIGFuZCB0aGVyZWZvcmUgdGhlIGFjdGl2ZSBzdGF0ZSBtaWdodCBoYXZlIGNoYW5nZWQgc28gd2UgZmlyZSB0aGUgZXZlbnRcclxuICAgICAgICAgICAgLy8gVE9ETyBmaXJlIG9ubHkgd2hlbiBzdGF0ZSBoYXMgcmVhbGx5IGNoYW5nZWQgKGUuZy4gY2hlY2sgaWYgdmlzaWJpbGl0eSBoYXMgcmVhbGx5IGNoYW5nZWQpXHJcbiAgICAgICAgICAgIHNlbGYub25BY3RpdmVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLnNldHRpbmcub25JdGVtQWRkZWQuc3Vic2NyaWJlKGhhbmRsZUNvbmZpZ0l0ZW1DaGFuZ2VkKTtcclxuICAgICAgICBzZWxmLnNldHRpbmcub25JdGVtUmVtb3ZlZC5zdWJzY3JpYmUoaGFuZGxlQ29uZmlnSXRlbUNoYW5nZWQpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGhpZGRlbiBzdGF0ZVxyXG4gICAgICAgIGhhbmRsZUNvbmZpZ0l0ZW1DaGFuZ2VkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhpcyBzZXR0aW5ncyBwYW5lbCBpdGVtIGlzIGFjdGl2ZSwgaS5lLiB2aXNpYmxlIGFuZCBlbmFibGVkIGFuZCBhIHVzZXIgY2FuIGludGVyYWN0IHdpdGggaXQuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFuZWwgaXMgYWN0aXZlLCBlbHNlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGlzQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzU2hvd24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25BY3RpdmVDaGFuZ2VkRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc1BhbmVsSXRlbUV2ZW50cy5vbkFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIFwiYWN0aXZlXCIgc3RhdGUgb2YgdGhpcyBpdGVtIGNoYW5nZXMuXHJcbiAgICAgKiBAc2VlICNpc0FjdGl2ZVxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNldHRpbmdzUGFuZWxJdGVtLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25BY3RpdmVDaGFuZ2VkKCk6IEV2ZW50PFNldHRpbmdzUGFuZWxJdGVtLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nc1BhbmVsSXRlbUV2ZW50cy5vbkFjdGl2ZUNoYW5nZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7U2V0dGluZ3NQYW5lbH0gZnJvbSBcIi4vc2V0dGluZ3NwYW5lbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFNldHRpbmdzVG9nZ2xlQnV0dG9ufS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWcgZXh0ZW5kcyBUb2dnbGVCdXR0b25Db25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2V0dGluZ3MgcGFuZWwgd2hvc2UgdmlzaWJpbGl0eSB0aGUgYnV0dG9uIHNob3VsZCB0b2dnbGUuXHJcbiAgICAgKi9cclxuICAgIHNldHRpbmdzUGFuZWw6IFNldHRpbmdzUGFuZWw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWNpZGVzIGlmIHRoZSBidXR0b24gc2hvdWxkIGJlIGF1dG9tYXRpY2FsbHkgaGlkZGVuIHdoZW4gdGhlIHNldHRpbmdzIHBhbmVsIGRvZXMgbm90IGNvbnRhaW4gYW55IGFjdGl2ZSBzZXR0aW5ncy5cclxuICAgICAqIERlZmF1bHQ6IHRydWVcclxuICAgICAqL1xyXG4gICAgYXV0b0hpZGVXaGVuTm9BY3RpdmVTZXR0aW5ncz86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgdmlzaWJpbGl0eSBvZiBhIHNldHRpbmdzIHBhbmVsLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNldHRpbmdzVG9nZ2xlQnV0dG9uIGV4dGVuZHMgVG9nZ2xlQnV0dG9uPFNldHRpbmdzVG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmICghY29uZmlnLnNldHRpbmdzUGFuZWwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVxdWlyZWQgU2V0dGluZ3NQYW5lbCBpcyBtaXNzaW5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zZXR0aW5nc3RvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlNldHRpbmdzXCIsXHJcbiAgICAgICAgICAgIHNldHRpbmdzUGFuZWw6IG51bGwsXHJcbiAgICAgICAgICAgIGF1dG9IaWRlV2hlbk5vQWN0aXZlU2V0dGluZ3M6IHRydWVcclxuICAgICAgICB9LCA8U2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjb25maWcgPSA8U2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWc+dGhpcy5nZXRDb25maWcoKTsgLy8gVE9ETyBmaXggZ2VuZXJpY3MgdHlwZSBpbmZlcmVuY2VcclxuICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IGNvbmZpZy5zZXR0aW5nc1BhbmVsO1xyXG5cclxuICAgICAgICB0aGlzLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2V0dGluZ3NQYW5lbC50b2dnbGVIaWRkZW4oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZXR0aW5nc1BhbmVsLm9uU2hvdy5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBTZXQgdG9nZ2xlIHN0YXR1cyB0byBvbiB3aGVuIHRoZSBzZXR0aW5ncyBwYW5lbCBzaG93c1xyXG4gICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2V0dGluZ3NQYW5lbC5vbkhpZGUuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRvZ2dsZSBzdGF0dXMgdG8gb2ZmIHdoZW4gdGhlIHNldHRpbmdzIHBhbmVsIGhpZGVzXHJcbiAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBhdXRvbWF0aWMgaGlkaW5nIG9mIHRoZSBidXR0b24gaWYgdGhlcmUgYXJlIG5vIHNldHRpbmdzIGZvciB0aGUgdXNlciB0byBpbnRlcmFjdCB3aXRoXHJcbiAgICAgICAgaWYgKGNvbmZpZy5hdXRvSGlkZVdoZW5Ob0FjdGl2ZVNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIC8vIFNldHVwIGhhbmRsZXIgdG8gc2hvdy9oaWRlIGJ1dHRvbiB3aGVuIHRoZSBzZXR0aW5ncyBjaGFuZ2VcclxuICAgICAgICAgICAgbGV0IHNldHRpbmdzUGFuZWxJdGVtc0NoYW5nZWRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzUGFuZWwuaGFzQWN0aXZlU2V0dGluZ3MoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmlzSGlkZGVuKCkpIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5pc1Nob3duKCkpIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAvLyBXaXJlIHRoZSBoYW5kbGVyIHRvIHRoZSBldmVudFxyXG4gICAgICAgICAgICBzZXR0aW5nc1BhbmVsLm9uU2V0dGluZ3NTdGF0ZUNoYW5nZWQuc3Vic2NyaWJlKHNldHRpbmdzUGFuZWxJdGVtc0NoYW5nZWRIYW5kbGVyKTtcclxuICAgICAgICAgICAgLy8gQ2FsbCBoYW5kbGVyIGZvciBmaXJzdCBpbml0IGF0IHN0YXJ0dXBcclxuICAgICAgICAgICAgc2V0dGluZ3NQYW5lbEl0ZW1zQ2hhbmdlZEhhbmRsZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyLCBDb250YWluZXJDb25maWd9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgU3VidGl0bGVDdWVFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZUN1ZUV2ZW50O1xyXG5pbXBvcnQge0xhYmVsLCBMYWJlbENvbmZpZ30gZnJvbSBcIi4vbGFiZWxcIjtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIHRvIGRpc3BsYXkgc3VidGl0bGVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN1YnRpdGxlT3ZlcmxheSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElubmVyIGxhYmVsIHRoYXQgcmVuZGVycyB0aGUgc3VidGl0bGUgdGV4dFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN1YnRpdGxlTGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdWJ0aXRsZUxhYmVsID0gbmV3IExhYmVsPExhYmVsQ29uZmlnPih7Y3NzQ2xhc3M6IFwidWktc3VidGl0bGUtbGFiZWxcIn0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXN1YnRpdGxlLW92ZXJsYXlcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMuc3VidGl0bGVMYWJlbF1cclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NVRV9FTlRFUiwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUN1ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3VidGl0bGVMYWJlbC5zZXRUZXh0KGV2ZW50LnRleHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NVRV9FWElULCBmdW5jdGlvbiAoZXZlbnQ6IFN1YnRpdGxlQ3VlRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5zdWJ0aXRsZUxhYmVsLnNldFRleHQoXCJcIik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBzdWJ0aXRsZUNsZWFySGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zdWJ0aXRsZUxhYmVsLnNldFRleHQoXCJcIik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQVVESU9fQ0hBTkdFLCBzdWJ0aXRsZUNsZWFySGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfQ0hBTkdFLCBzdWJ0aXRsZUNsZWFySGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFSywgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfU0hJRlQsIHN1YnRpdGxlQ2xlYXJIYW5kbGVyKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBTdWJ0aXRsZUFkZGVkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuU3VidGl0bGVBZGRlZEV2ZW50O1xyXG5pbXBvcnQgU3VidGl0bGVDaGFuZ2VkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuU3VidGl0bGVDaGFuZ2VkRXZlbnQ7XHJcbmltcG9ydCBTdWJ0aXRsZVJlbW92ZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZVJlbW92ZWRFdmVudDtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gYXZhaWxhYmxlIHN1YnRpdGxlIGFuZCBjYXB0aW9uIHRyYWNrcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTdWJ0aXRsZVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVTdWJ0aXRsZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuY2xlYXJJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgc3VidGl0bGUgb2YgcGxheWVyLmdldEF2YWlsYWJsZVN1YnRpdGxlcygpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZEl0ZW0oc3VidGl0bGUuaWQsIHN1YnRpdGxlLmxhYmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlbGYub25JdGVtU2VsZWN0ZWQuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IFN1YnRpdGxlU2VsZWN0Qm94LCB2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRTdWJ0aXRsZSh2YWx1ZSA9PT0gXCJudWxsXCIgPyBudWxsIDogdmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBSZWFjdCB0byBBUEkgZXZlbnRzXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfQURERUQsIGZ1bmN0aW9uIChldmVudDogU3VidGl0bGVBZGRlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShldmVudC5zdWJ0aXRsZS5pZCwgZXZlbnQuc3VidGl0bGUubGFiZWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NVQlRJVExFX0NIQU5HRSwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUNoYW5nZWRFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oZXZlbnQudGFyZ2V0U3VidGl0bGUuaWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NVQlRJVExFX1JFTU9WRUQsIGZ1bmN0aW9uIChldmVudDogU3VidGl0bGVSZW1vdmVkRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVJdGVtKGV2ZW50LnN1YnRpdGxlSWQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZVN1YnRpdGxlcyk7IC8vIFVwZGF0ZSBzdWJ0aXRsZXMgd2hlbiBzb3VyY2UgZ29lcyBhd2F5XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUkVBRFksIHVwZGF0ZVN1YnRpdGxlcyk7IC8vIFVwZGF0ZSBzdWJ0aXRsZXMgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHN1YnRpdGxlcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlU3VidGl0bGVzKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyLCBDb250YWluZXJDb25maWd9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge0xhYmVsQ29uZmlnLCBMYWJlbH0gZnJvbSBcIi4vbGFiZWxcIjtcclxuaW1wb3J0IHtUaW1lb3V0fSBmcm9tIFwiLi4vdGltZW91dFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBUaXRsZUJhcn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRpdGxlQmFyQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgdGl0bGUgYmFyIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIERlZmF1bHQ6IDUgc2Vjb25kcyAoNTAwMClcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogRGlzcGxheXMgYSB0aXRsZSBiYXIgY29udGFpbmluZyBhIGxhYmVsIHdpdGggdGhlIHRpdGxlIG9mIHRoZSB2aWRlby5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUaXRsZUJhciBleHRlbmRzIENvbnRhaW5lcjxUaXRsZUJhckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRpdGxlQmFyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gbmV3IExhYmVsKHtjc3NDbGFzczogXCJ1aS10aXRsZWJhci1sYWJlbFwifSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdGl0bGViYXJcIixcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDUwMDAsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLmxhYmVsXVxyXG4gICAgICAgIH0sIDxUaXRsZUJhckNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICh1aW1hbmFnZXIuZ2V0Q29uZmlnKCkgJiYgdWltYW5hZ2VyLmdldENvbmZpZygpLm1ldGFkYXRhKSB7XHJcbiAgICAgICAgICAgIHNlbGYubGFiZWwuc2V0VGV4dCh1aW1hbmFnZXIuZ2V0Q29uZmlnKCkubWV0YWRhdGEudGl0bGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIENhbmNlbCBjb25maWd1cmF0aW9uIGlmIHRoZXJlIGlzIG5vIG1ldGFkYXRhIHRvIGRpc3BsYXlcclxuICAgICAgICAgICAgLy8gVE9ETyB0aGlzIHByb2JhYmx5IHdvbid0IHdvcmsgaWYgd2UgcHV0IHRoZSBzaGFyZSBidXR0b25zIGludG8gdGhlIHRpdGxlIGJhclxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdGltZW91dCA9IG5ldyBUaW1lb3V0KCg8VGl0bGVCYXJDb25maWc+c2VsZi5nZXRDb25maWcoKSkuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUVudGVyLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpOyAvLyBzaG93IGNvbnRyb2wgYmFyIHdoZW4gdGhlIG1vdXNlIGVudGVycyB0aGUgVUlcclxuXHJcbiAgICAgICAgICAgIC8vIENsZWFyIHRpbWVvdXQgdG8gYXZvaWQgaGlkaW5nIHRoZSBiYXIgaWYgdGhlIG1vdXNlIG1vdmVzIGJhY2sgaW50byB0aGUgVUkgZHVyaW5nIHRoZSB0aW1lb3V0IHBlcmlvZFxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VNb3ZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSB0aGUgYmFyIGlmIG1vdXNlIGRvZXMgbm90IG1vdmUgZHVyaW5nIHRoZSB0aW1lb3V0IHRpbWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSBiYXIgc29tZSB0aW1lIGFmdGVyIHRoZSBtb3VzZSBsZWZ0IHRoZSBVSVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0J1dHRvbiwgQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi9idXR0b25cIjtcclxuaW1wb3J0IHtOb0FyZ3MsIEV2ZW50RGlzcGF0Y2hlciwgRXZlbnR9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB0b2dnbGUgYnV0dG9uIGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVG9nZ2xlQnV0dG9uQ29uZmlnIGV4dGVuZHMgQnV0dG9uQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRleHQgb24gdGhlIGJ1dHRvbi5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgY2FuIGJlIHRvZ2dsZWQgYmV0d2VlbiBcIm9uXCIgYW5kIFwib2ZmXCIgc3RhdGVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRvZ2dsZUJ1dHRvbjxDb25maWcgZXh0ZW5kcyBUb2dnbGVCdXR0b25Db25maWc+IGV4dGVuZHMgQnV0dG9uPFRvZ2dsZUJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX09OID0gXCJvblwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ0xBU1NfT0ZGID0gXCJvZmZcIjtcclxuXHJcbiAgICBwcml2YXRlIG9uU3RhdGU6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSB0b2dnbGVCdXR0b25FdmVudHMgPSB7XHJcbiAgICAgICAgb25Ub2dnbGU6IG5ldyBFdmVudERpc3BhdGNoZXI8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICBvblRvZ2dsZU9uOiBuZXcgRXZlbnREaXNwYXRjaGVyPFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Ub2dnbGVPZmY6IG5ldyBFdmVudERpc3BhdGNoZXI8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdG9nZ2xlYnV0dG9uXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSBidXR0b24gdG8gdGhlIFwib25cIiBzdGF0ZS5cclxuICAgICAqL1xyXG4gICAgb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPZmYoKSkge1xyXG4gICAgICAgICAgICB0aGlzLm9uU3RhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhUb2dnbGVCdXR0b24uQ0xBU1NfT0ZGKTtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09OKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub25Ub2dnbGVFdmVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uVG9nZ2xlT25FdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIGJ1dHRvbiB0byB0aGUgXCJvZmZcIiBzdGF0ZS5cclxuICAgICAqL1xyXG4gICAgb2ZmKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT24oKSkge1xyXG4gICAgICAgICAgICB0aGlzLm9uU3RhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09OKTtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09GRik7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9uVG9nZ2xlRXZlbnQoKTtcclxuICAgICAgICAgICAgdGhpcy5vblRvZ2dsZU9mZkV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlIHRoZSBidXR0b24gXCJvblwiIGlmIGl0IGlzIFwib2ZmXCIsIG9yIFwib2ZmXCIgaWYgaXQgaXMgXCJvblwiLlxyXG4gICAgICovXHJcbiAgICB0b2dnbGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub2ZmKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5vbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgdG9nZ2xlIGJ1dHRvbiBpcyBpbiB0aGUgXCJvblwiIHN0YXRlLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYnV0dG9uIGlzIFwib25cIiwgZmFsc2UgaWYgXCJvZmZcIlxyXG4gICAgICovXHJcbiAgICBpc09uKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9uU3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHRvZ2dsZSBidXR0b24gaXMgaW4gdGhlIFwib2ZmXCIgc3RhdGUuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBidXR0b24gaXMgXCJvZmZcIiwgZmFsc2UgaWYgXCJvblwiXHJcbiAgICAgKi9cclxuICAgIGlzT2ZmKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5pc09uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uQ2xpY2tFdmVudCgpIHtcclxuICAgICAgICBzdXBlci5vbkNsaWNrRXZlbnQoKTtcclxuXHJcbiAgICAgICAgLy8gRmlyZSB0aGUgdG9nZ2xlIGV2ZW50IHRvZ2V0aGVyIHdpdGggdGhlIGNsaWNrIGV2ZW50XHJcbiAgICAgICAgLy8gKHRoZXkgYXJlIHRlY2huaWNhbGx5IHRoZSBzYW1lLCBvbmx5IHRoZSBzZW1hbnRpY3MgYXJlIGRpZmZlcmVudClcclxuICAgICAgICB0aGlzLm9uVG9nZ2xlRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Ub2dnbGVFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZS5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Ub2dnbGVPbkV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlT24uZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uVG9nZ2xlT2ZmRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGVPZmYuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGJ1dHRvbiBpcyB0b2dnbGVkLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblRvZ2dsZSgpOiBFdmVudDxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGJ1dHRvbiBpcyB0b2dnbGVkIFwib25cIi5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Ub2dnbGVPbigpOiBFdmVudDxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlT24uZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgYnV0dG9uIGlzIHRvZ2dsZWQgXCJvZmZcIi5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Ub2dnbGVPZmYoKTogRXZlbnQ8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9mZi5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtOb0FyZ3MsIEV2ZW50RGlzcGF0Y2hlciwgRXZlbnR9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgVUlDb250YWluZXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBVSUNvbnRhaW5lckNvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvLyBub3RoaW5nIHRvIGFkZFxyXG59XHJcblxyXG4vKipcclxuICogVGhlIGJhc2UgY29udGFpbmVyIHRoYXQgY29udGFpbnMgYWxsIG9mIHRoZSBVSS4gVGhlIFVJQ29udGFpbmVyIGlzIHBhc3NlZCB0byB0aGUge0BsaW5rIFVJTWFuYWdlcn0gdG8gYnVpbGQgYW5kIHNldHVwIHRoZSBVSS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBVSUNvbnRhaW5lciBleHRlbmRzIENvbnRhaW5lcjxVSUNvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgdWlDb250YWluZXJFdmVudHMgPSB7XHJcbiAgICAgICAgb25Nb3VzZUVudGVyOiBuZXcgRXZlbnREaXNwYXRjaGVyPFVJQ29udGFpbmVyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Nb3VzZU1vdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8VUlDb250YWluZXIsIE5vQXJncz4oKSxcclxuICAgICAgICBvbk1vdXNlTGVhdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8VUlDb250YWluZXIsIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFVJQ29udGFpbmVyQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS11aWNvbnRhaW5lclwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBzZWxmLm9uTW91c2VFbnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUVudGVyLmRpc3BhdGNoKHNlbmRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Nb3VzZU1vdmUuZGlzcGF0Y2goc2VuZGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uTW91c2VMZWF2ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLmRpc3BhdGNoKHNlbmRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgY29udGFpbmVyID0gc3VwZXIudG9Eb21FbGVtZW50KCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5vbihcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uTW91c2VFbnRlckV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29udGFpbmVyLm9uKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vbk1vdXNlTW92ZUV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29udGFpbmVyLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZUxlYXZlRXZlbnQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZWN0IGZsZXhib3ggc3VwcG9ydCAobm90IHN1cHBvcnRlZCBpbiBJRTkpXHJcbiAgICAgICAgaWYgKGRvY3VtZW50ICYmIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKS5zdHlsZS5mbGV4ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcyhcImZsZXhib3hcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFkZENsYXNzKFwibm8tZmxleGJveFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb250YWluZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uTW91c2VFbnRlckV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZUVudGVyLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbk1vdXNlTW92ZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZU1vdmUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uTW91c2VMZWF2ZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZUxlYXZlLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBtb3VzZSBlbnRlcnMgdGhlIFVJLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZUVudGVyKCk6IEV2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy51aUNvbnRhaW5lckV2ZW50cy5vbk1vdXNlRW50ZXIuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgbW91c2UgbW92ZXMgd2l0aGluIFVJLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZU1vdmUoKTogRXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VNb3ZlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIG1vdXNlIGxlYXZlcyB0aGUgVUkuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbk1vdXNlTGVhdmUoKTogRXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VMZWF2ZS5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gXCJhdXRvXCIgYW5kIHRoZSBhdmFpbGFibGUgdmlkZW8gcXVhbGl0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZpZGVvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVWaWRlb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHZpZGVvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZVZpZGVvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHZpZGVvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCB2aWRlb1F1YWxpdHkgb2YgdmlkZW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbSh2aWRlb1F1YWxpdHkuaWQsIHZpZGVvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBWaWRlb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldFZpZGVvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlVmlkZW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB1cGRhdGVWaWRlb1F1YWxpdGllcyk7IC8vIFVwZGF0ZSBxdWFsaXRpZXMgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVklERU9fRE9XTkxPQURfUVVBTElUWV9DSEFOR0UsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBwbGF5ZXIuZ2V0RG93bmxvYWRlZFZpZGVvRGF0YSgpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oZGF0YS5pc0F1dG8gPyBcImF1dG9cIiA6IGRhdGEuaWQpO1xyXG4gICAgICAgIH0pOyAvLyBVcGRhdGUgcXVhbGl0eSBzZWxlY3Rpb24gd2hlbiBxdWFsaXR5IGlzIGNoYW5nZWQgKGZyb20gb3V0c2lkZSlcclxuXHJcbiAgICAgICAgLy8gUG9wdWxhdGUgcXVhbGl0aWVzIGF0IHN0YXJ0dXBcclxuICAgICAgICB1cGRhdGVWaWRlb1F1YWxpdGllcygpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtWb2x1bWVTbGlkZXJ9IGZyb20gXCIuL3ZvbHVtZXNsaWRlclwiO1xyXG5pbXBvcnQge1ZvbHVtZVRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vdm9sdW1ldG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VGltZW91dH0gZnJvbSBcIi4uL3RpbWVvdXRcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgVm9sdW1lQ29udHJvbEJ1dHRvbn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFZvbHVtZUNvbnRyb2xCdXR0b25Db25maWcgZXh0ZW5kcyBDb250YWluZXJDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVsYXkgYWZ0ZXIgd2hpY2ggdGhlIHZvbHVtZSBzbGlkZXIgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogQ2FyZSBtdXN0IGJlIHRha2VuIHRoYXQgdGhlIGRlbGF5IGlzIGxvbmcgZW5vdWdoIHNvIHVzZXJzIGNhbiByZWFjaCB0aGUgc2xpZGVyIGZyb20gdGhlIHRvZ2dsZSBidXR0b24sIGUuZy4gYnlcclxuICAgICAqIG1vdXNlIG1vdmVtZW50LiBJZiB0aGUgZGVsYXkgaXMgdG9vIHNob3J0LCB0aGUgc2xpZGVycyBkaXNhcHBlYXJzIGJlZm9yZSB0aGUgbW91c2UgcG9pbnRlciBoYXMgcmVhY2hlZCBpdCBhbmRcclxuICAgICAqIHRoZSB1c2VyIGlzIG5vdCBhYmxlIHRvIHVzZSBpdC5cclxuICAgICAqIERlZmF1bHQ6IDUwMG1zXHJcbiAgICAgKi9cclxuICAgIGhpZGVEZWxheT86IG51bWJlcjtcclxuICAgIC8qKlxyXG4gICAgICogU3BlY2lmaWVzIGlmIHRoZSB2b2x1bWUgc2xpZGVyIHNob3VsZCBiZSB2ZXJ0aWNhbGx5IG9yIGhvcml6b250YWxseSBhbGlnbmVkLlxyXG4gICAgICogRGVmYXVsdDogdHJ1ZVxyXG4gICAgICovXHJcbiAgICB2ZXJ0aWNhbD86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGNvbXBvc2l0ZSB2b2x1bWUgY29udHJvbCB0aGF0IGNvbnNpc3RzIG9mIGFuZCBpbnRlcm5hbGx5IG1hbmFnZXMgYSB2b2x1bWUgY29udHJvbCBidXR0b24gdGhhdCBjYW4gYmUgdXNlZFxyXG4gKiBmb3IgbXV0aW5nLCBhbmQgYSAoZGVwZW5kaW5nIG9uIHRoZSBDU1Mgc3R5bGUsIGUuZy4gc2xpZGUtb3V0KSB2b2x1bWUgY29udHJvbCBiYXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVm9sdW1lQ29udHJvbEJ1dHRvbiBleHRlbmRzIENvbnRhaW5lcjxWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSB2b2x1bWVUb2dnbGVCdXR0b246IFZvbHVtZVRvZ2dsZUJ1dHRvbjtcclxuICAgIHByaXZhdGUgdm9sdW1lU2xpZGVyOiBWb2x1bWVTbGlkZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLnZvbHVtZVRvZ2dsZUJ1dHRvbiA9IG5ldyBWb2x1bWVUb2dnbGVCdXR0b24oKTtcclxuICAgICAgICB0aGlzLnZvbHVtZVNsaWRlciA9IG5ldyBWb2x1bWVTbGlkZXIoe1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbDogY29uZmlnLnZlcnRpY2FsICE9IG51bGwgPyBjb25maWcudmVydGljYWwgOiB0cnVlLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12b2x1bWVjb250cm9sYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnZvbHVtZVRvZ2dsZUJ1dHRvbiwgdGhpcy52b2x1bWVTbGlkZXJdLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDUwMFxyXG4gICAgICAgIH0sIDxWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgdm9sdW1lVG9nZ2xlQnV0dG9uID0gdGhpcy5nZXRWb2x1bWVUb2dnbGVCdXR0b24oKTtcclxuICAgICAgICBsZXQgdm9sdW1lU2xpZGVyID0gdGhpcy5nZXRWb2x1bWVTbGlkZXIoKTtcclxuXHJcbiAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dCgoPFZvbHVtZUNvbnRyb2xCdXR0b25Db25maWc+c2VsZi5nZXRDb25maWcoKSkuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlci5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVm9sdW1lIFNsaWRlciB2aXNpYmlsaXR5IGhhbmRsaW5nXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUaGUgdm9sdW1lIHNsaWRlciBzaGFsbCBiZSB2aXNpYmxlIHdoaWxlIHRoZSB1c2VyIGhvdmVycyB0aGUgbXV0ZSB0b2dnbGUgYnV0dG9uLCB3aGlsZSB0aGUgdXNlciBob3ZlcnMgdGhlXHJcbiAgICAgICAgICogdm9sdW1lIHNsaWRlciwgYW5kIHdoaWxlIHRoZSB1c2VyIHNsaWRlcyB0aGUgdm9sdW1lIHNsaWRlci4gSWYgbm9uZSBvZiB0aGVzZSBzaXR1YXRpb25zIGFyZSB0cnVlLCB0aGUgc2xpZGVyXHJcbiAgICAgICAgICogc2hhbGwgZGlzYXBwZWFyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCB2b2x1bWVTbGlkZXJIb3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgdm9sdW1lVG9nZ2xlQnV0dG9uLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBTaG93IHZvbHVtZSBzbGlkZXIgd2hlbiBtb3VzZSBlbnRlcnMgdGhlIGJ1dHRvbiBhcmVhXHJcbiAgICAgICAgICAgIGlmICh2b2x1bWVTbGlkZXIuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdm9sdW1lU2xpZGVyLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBBdm9pZCBoaWRpbmcgb2YgdGhlIHNsaWRlciB3aGVuIGJ1dHRvbiBpcyBob3ZlcmVkXHJcbiAgICAgICAgICAgIHRpbWVvdXQuY2xlYXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVUb2dnbGVCdXR0b24uZ2V0RG9tRWxlbWVudCgpLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIEhpZGUgc2xpZGVyIGRlbGF5ZWQgd2hlbiBidXR0b24gaXMgbGVmdFxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdm9sdW1lU2xpZGVyLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBzbGlkZXIgaXMgZW50ZXJlZCwgY2FuY2VsIHRoZSBoaWRlIHRpbWVvdXQgYWN0aXZhdGVkIGJ5IGxlYXZpbmcgdGhlIGJ1dHRvblxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlckhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZvbHVtZVNsaWRlci5nZXREb21FbGVtZW50KCkub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gV2hlbiBtb3VzZSBsZWF2ZXMgdGhlIHNsaWRlciwgb25seSBoaWRlIGl0IGlmIHRoZXJlIGlzIG5vIHNsaWRlIG9wZXJhdGlvbiBpbiBwcm9ncmVzc1xyXG4gICAgICAgICAgICBpZiAodm9sdW1lU2xpZGVyLmlzU2Vla2luZygpKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdm9sdW1lU2xpZGVySG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZvbHVtZVNsaWRlci5vblNlZWtlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBXaGVuIGEgc2xpZGUgb3BlcmF0aW9uIGlzIGRvbmUgYW5kIHRoZSBzbGlkZXIgbm90IGhvdmVyZWQgKG1vdXNlIG91dHNpZGUgc2xpZGVyKSwgaGlkZSBzbGlkZXIgZGVsYXllZFxyXG4gICAgICAgICAgICBpZiAoIXZvbHVtZVNsaWRlckhvdmVyZWQpIHtcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBpbnRlcm5hbGx5IG1hbmFnZWQgdm9sdW1lIHRvZ2dsZSBidXR0b24uXHJcbiAgICAgKiBAcmV0dXJucyB7Vm9sdW1lVG9nZ2xlQnV0dG9ufVxyXG4gICAgICovXHJcbiAgICBnZXRWb2x1bWVUb2dnbGVCdXR0b24oKTogVm9sdW1lVG9nZ2xlQnV0dG9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52b2x1bWVUb2dnbGVCdXR0b247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm92aWRlcyBhY2Nlc3MgdG8gdGhlIGludGVybmFsbHkgbWFuYWdlZCB2b2x1bWUgc2lsZGVyLlxyXG4gICAgICogQHJldHVybnMge1ZvbHVtZVNsaWRlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0Vm9sdW1lU2xpZGVyKCk6IFZvbHVtZVNsaWRlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sdW1lU2xpZGVyO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlZWtCYXIsIFNlZWtCYXJDb25maWd9IGZyb20gXCIuL3NlZWtiYXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSB2b2x1bWUgc2xpZGVyIGNvbXBvbmVudCB0byBhZGp1c3QgdGhlIHBsYXllcidzIHZvbHVtZSBzZXR0aW5nLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZvbHVtZVNsaWRlciBleHRlbmRzIFNlZWtCYXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogU2Vla0JhckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12b2x1bWVzbGlkZXJcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHZvbHVtZUNoYW5nZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNNdXRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24oMCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldEJ1ZmZlclBvc2l0aW9uKDApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKHBsYXllci5nZXRWb2x1bWUoKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRCdWZmZXJQb3NpdGlvbihwbGF5ZXIuZ2V0Vm9sdW1lKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVk9MVU1FX0NIQU5HRSwgdm9sdW1lQ2hhbmdlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fTVVURSwgdm9sdW1lQ2hhbmdlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVU5NVVRFLCB2b2x1bWVDaGFuZ2VIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgdGhpcy5vblNlZWtQcmV2aWV3LnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChhcmdzLnNjcnViYmluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnNldFZvbHVtZShhcmdzLnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMub25TZWVrZWQuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldFZvbHVtZShwZXJjZW50YWdlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCB2b2x1bWUgYmFyXHJcbiAgICAgICAgdm9sdW1lQ2hhbmdlSGFuZGxlcigpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFZvbHVtZUNoYW5nZUV2ZW50ID0gYml0bW92aW4ucGxheWVyLlZvbHVtZUNoYW5nZUV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyBhdWRpbyBtdXRpbmcuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVm9sdW1lVG9nZ2xlQnV0dG9uIGV4dGVuZHMgVG9nZ2xlQnV0dG9uPFRvZ2dsZUJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVG9nZ2xlQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXZvbHVtZXRvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlZvbHVtZS9NdXRlXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBtdXRlU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX01VVEUsIG11dGVTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1VOTVVURSwgbXV0ZVN0YXRlSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnVubXV0ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLm11dGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9WT0xVTUVfQ0hBTkdFLCBmdW5jdGlvbiAoZXZlbnQ6IFZvbHVtZUNoYW5nZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFRvZ2dsZSBsb3cgY2xhc3MgdG8gZGlzcGxheSBsb3cgdm9sdW1lIGljb24gYmVsb3cgNTAlIHZvbHVtZVxyXG4gICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0Vm9sdW1lIDwgNTApIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKFwibG93XCIpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoXCJsb3dcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCB0b2dnbGVzIHRoZSB2aWRlbyB2aWV3IGJldHdlZW4gbm9ybWFsL21vbm8gYW5kIFZSL3N0ZXJlby5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBWUlRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12cnRvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlZSXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBpc1ZSQ29uZmlndXJlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVlIgYXZhaWxhYmlsaXR5IGNhbm5vdCBiZSBjaGVja2VkIHRocm91Z2ggZ2V0VlJTdGF0dXMoKSBiZWNhdXNlIGl0IGlzIGFzeW5jaHJvbm91c2x5IHBvcHVsYXRlZCBhbmQgbm90XHJcbiAgICAgICAgICAgIC8vIGF2YWlsYWJsZSBhdCBVSSBpbml0aWFsaXphdGlvbi4gQXMgYW4gYWx0ZXJuYXRpdmUsIHdlIGNoZWNrIHRoZSBWUiBzZXR0aW5ncyBpbiB0aGUgY29uZmlnLlxyXG4gICAgICAgICAgICAvLyBUT0RPIHVzZSBnZXRWUlN0YXR1cygpIHRocm91Z2ggaXNWUlN0ZXJlb0F2YWlsYWJsZSgpIG9uY2UgdGhlIHBsYXllciBoYXMgYmVlbiByZXdyaXR0ZW4gYW5kIHRoZSBzdGF0dXMgaXMgYXZhaWxhYmxlIGluIE9OX1JFQURZXHJcbiAgICAgICAgICAgIGxldCBjb25maWcgPSBwbGF5ZXIuZ2V0Q29uZmlnKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWcuc291cmNlICYmIGNvbmZpZy5zb3VyY2UudnIgJiYgY29uZmlnLnNvdXJjZS52ci5jb250ZW50VHlwZSAhPT0gXCJub25lXCI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGlzVlJTdGVyZW9BdmFpbGFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5jb250ZW50VHlwZSAhPT0gXCJub25lXCI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHZyU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNWUkNvbmZpZ3VyZWQoKSAmJiBpc1ZSU3RlcmVvQXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpOyAvLyBzaG93IGJ1dHRvbiBpbiBjYXNlIGl0IGlzIGhpZGRlblxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5pc1N0ZXJlbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpOyAvLyBoaWRlIGJ1dHRvbiBpZiBubyBzdGVyZW8gbW9kZSBhdmFpbGFibGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCB2ckJ1dHRvblZpc2liaWxpdHlIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNWUkNvbmZpZ3VyZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZSX01PREVfQ0hBTkdFRCwgdnJTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZSX1NURVJFT19DSEFOR0VELCB2clN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVlJfRVJST1IsIHZyU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIpOyAvLyBIaWRlIGJ1dHRvbiB3aGVuIFZSIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdnJCdXR0b25WaXNpYmlsaXR5SGFuZGxlcik7IC8vIFNob3cgYnV0dG9uIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZCBhbmQgaXQncyBWUlxyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFpc1ZSU3RlcmVvQXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb25zb2xlKSBjb25zb2xlLmxvZyhcIk5vIFZSIGNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdldFZSU3RhdHVzKCkuaXNTdGVyZW8pIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8odHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHN0YXJ0dXAgdmlzaWJpbGl0eVxyXG4gICAgICAgIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDbGlja092ZXJsYXksIENsaWNrT3ZlcmxheUNvbmZpZ30gZnJvbSBcIi4vY2xpY2tvdmVybGF5XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIENsaWNrT3ZlcmxheX0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFdhdGVybWFya0NvbmZpZyBleHRlbmRzIENsaWNrT3ZlcmxheUNvbmZpZyB7XHJcbiAgICAvLyBub3RoaW5nIHlldFxyXG59XHJcblxyXG4vKipcclxuICogQSB3YXRlcm1hcmsgb3ZlcmxheSB3aXRoIGEgY2xpY2thYmxlIGxvZ28uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgV2F0ZXJtYXJrIGV4dGVuZHMgQ2xpY2tPdmVybGF5IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFdhdGVybWFya0NvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS13YXRlcm1hcmtcIixcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9iaXRtb3Zpbi5jb21cIlxyXG4gICAgICAgIH0sIDxXYXRlcm1hcmtDb25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9mZnNldCB7XHJcbiAgICBsZWZ0OiBudW1iZXI7XHJcbiAgICB0b3A6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNpbXBsZSBET00gbWFuaXB1bGF0aW9uIGFuZCBET00gZWxlbWVudCBldmVudCBoYW5kbGluZyBtb2RlbGVkIGFmdGVyIGpRdWVyeSAoYXMgcmVwbGFjZW1lbnQgZm9yIGpRdWVyeSkuXHJcbiAqXHJcbiAqIExpa2UgalF1ZXJ5LCBET00gb3BlcmF0ZXMgb24gc2luZ2xlIGVsZW1lbnRzIGFuZCBsaXN0cyBvZiBlbGVtZW50cy4gRm9yIGV4YW1wbGU6IGNyZWF0aW5nIGFuIGVsZW1lbnQgcmV0dXJucyBhIERPTVxyXG4gKiBpbnN0YW5jZSB3aXRoIGEgc2luZ2xlIGVsZW1lbnQsIHNlbGVjdGluZyBlbGVtZW50cyByZXR1cm5zIGEgRE9NIGluc3RhbmNlIHdpdGggemVybywgb25lLCBvciBtYW55IGVsZW1lbnRzLiBTaW1pbGFyXHJcbiAqIHRvIGpRdWVyeSwgc2V0dGVycyB1c3VhbGx5IGFmZmVjdCBhbGwgZWxlbWVudHMsIHdoaWxlIGdldHRlcnMgb3BlcmF0ZSBvbiBvbmx5IHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gKiBBbHNvIHNpbWlsYXIgdG8galF1ZXJ5LCBtb3N0IG1ldGhvZHMgKGV4Y2VwdCBnZXR0ZXJzKSByZXR1cm4gdGhlIERPTSBpbnN0YW5jZSBmYWNpbGl0YXRpbmcgZWFzeSBjaGFpbmluZyBvZiBtZXRob2QgY2FsbHMuXHJcbiAqXHJcbiAqIEJ1aWx0IHdpdGggdGhlIGhlbHAgb2Y6IGh0dHA6Ly95b3VtaWdodG5vdG5lZWRqcXVlcnkuY29tL1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERPTSB7XHJcblxyXG4gICAgcHJpdmF0ZSBkb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGlzdCBvZiBlbGVtZW50cyB0aGF0IHRoZSBpbnN0YW5jZSB3cmFwcy4gVGFrZSBjYXJlIHRoYXQgbm90IGFsbCBtZXRob2RzIGNhbiBvcGVyYXRlIG9uIHRoZSB3aG9sZSBsaXN0LFxyXG4gICAgICogZ2V0dGVycyB1c3VhbGx5IGp1c3Qgd29yayBvbiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBlbGVtZW50czogSFRNTEVsZW1lbnRbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBET00gZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSB0YWdOYW1lIHRoZSB0YWcgbmFtZSBvZiB0aGUgRE9NIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVzIGEgbGlzdCBvZiBhdHRyaWJ1dGVzIG9mIHRoZSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHRhZ05hbWU6IHN0cmluZywgYXR0cmlidXRlczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZWxlY3RzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBET00gdGhhdCBtYXRjaCB0aGUgc3BlY2lmaWVkIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBtYXRjaCBET00gZWxlbWVudHMgd2l0aFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzZWxlY3Rvcjogc3RyaW5nKTtcclxuICAgIC8qKlxyXG4gICAgICogV3JhcHMgYSBwbGFpbiBIVE1MRWxlbWVudCB3aXRoIGEgRE9NIGluc3RhbmNlLlxyXG4gICAgICogQHBhcmFtIGVsZW1lbnQgdGhlIEhUTUxFbGVtZW50IHRvIHdyYXAgd2l0aCBET01cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXcmFwcyBhIGxpc3Qgb2YgcGxhaW4gSFRNTEVsZW1lbnRzIHdpdGggYSBET00gaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgSFRNTEVsZW1lbnRzIHRvIHdyYXAgd2l0aCBET01cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudHM6IEhUTUxFbGVtZW50W10pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXcmFwcyB0aGUgZG9jdW1lbnQgd2l0aCBhIERPTSBpbnN0YW5jZS4gVXNlZnVsIHRvIGF0dGFjaCBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGRvY3VtZW50LlxyXG4gICAgICogQHBhcmFtIGRvY3VtZW50IHRoZSBkb2N1bWVudCB0byB3cmFwXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50OiBEb2N1bWVudCk7XHJcbiAgICBjb25zdHJ1Y3Rvcihzb21ldGhpbmc6IHN0cmluZyB8IEhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnRbXSB8IERvY3VtZW50LCBhdHRyaWJ1dGVzPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7IC8vIFNldCB0aGUgZ2xvYmFsIGRvY3VtZW50IHRvIHRoZSBsb2NhbCBkb2N1bWVudCBmaWVsZFxyXG5cclxuICAgICAgICBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgaWYgKHNvbWV0aGluZy5sZW5ndGggPiAwICYmIHNvbWV0aGluZ1swXSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHNvbWV0aGluZyBpbnN0YW5jZW9mIERvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gYSBkb2N1bWVudCBpcyBwYXNzZWQgaW4sIHdlIGRvIG5vdCBkbyBhbnl0aGluZyB3aXRoIGl0LCBidXQgYnkgc2V0dGluZyB0aGlzLmVsZW1lbnRzIHRvIG51bGxcclxuICAgICAgICAgICAgLy8gd2UgZ2l2ZSB0aGUgZXZlbnQgaGFuZGxpbmcgbWV0aG9kIGEgbWVhbnMgdG8gZGV0ZWN0IGlmIHRoZSBldmVudHMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgb24gdGhlIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2YgZWxlbWVudHMuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWdOYW1lID0gc29tZXRoaW5nO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVWYWx1ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSB0aGlzLmZpbmRDaGlsZEVsZW1lbnRzKHNlbGVjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHNob3J0Y3V0IG1ldGhvZCBmb3IgaXRlcmF0aW5nIGFsbCBlbGVtZW50cy4gU2hvcnRzIHRoaXMuZWxlbWVudHMuZm9yRWFjaCguLi4pIHRvIHRoaXMuZm9yRWFjaCguLi4pLlxyXG4gICAgICogQHBhcmFtIGhhbmRsZXIgdGhlIGhhbmRsZXIgdG8gZXhlY3V0ZSBhbiBvcGVyYXRpb24gb24gYW4gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGZvckVhY2goaGFuZGxlcjogKGVsZW1lbnQ6IEhUTUxFbGVtZW50KSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIoZWxlbWVudCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBmaW5kQ2hpbGRFbGVtZW50c09mRWxlbWVudChlbGVtZW50OiBIVE1MRWxlbWVudCB8IERvY3VtZW50LCBzZWxlY3Rvcjogc3RyaW5nKTogSFRNTEVsZW1lbnRbXSB7XHJcbiAgICAgICAgbGV0IGNoaWxkRWxlbWVudHMgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IE5vZGVMaXN0IHRvIEFycmF5XHJcbiAgICAgICAgLy8gaHR0cHM6Ly90b2RkbW90dG8uY29tL2EtY29tcHJlaGVuc2l2ZS1kaXZlLWludG8tbm9kZWxpc3RzLWFycmF5cy1jb252ZXJ0aW5nLW5vZGVsaXN0cy1hbmQtdW5kZXJzdGFuZGluZy10aGUtZG9tL1xyXG4gICAgICAgIHJldHVybiBbXS5zbGljZS5jYWxsKGNoaWxkRWxlbWVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmluZENoaWxkRWxlbWVudHMoc2VsZWN0b3I6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgYWxsQ2hpbGRFbGVtZW50cyA9IDxIVE1MRWxlbWVudFtdPltdO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5lbGVtZW50cykge1xyXG4gICAgICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGFsbENoaWxkRWxlbWVudHMgPSBhbGxDaGlsZEVsZW1lbnRzLmNvbmNhdChzZWxmLmZpbmRDaGlsZEVsZW1lbnRzT2ZFbGVtZW50KGVsZW1lbnQsIHNlbGVjdG9yKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmluZENoaWxkRWxlbWVudHNPZkVsZW1lbnQoZG9jdW1lbnQsIHNlbGVjdG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhbGxDaGlsZEVsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZHMgYWxsIGNoaWxkIGVsZW1lbnRzIG9mIGFsbCBlbGVtZW50cyBtYXRjaGluZyB0aGUgc3VwcGxpZWQgc2VsZWN0b3IuXHJcbiAgICAgKiBAcGFyYW0gc2VsZWN0b3IgdGhlIHNlbGVjdG9yIHRvIG1hdGNoIHdpdGggY2hpbGQgZWxlbWVudHNcclxuICAgICAqIEByZXR1cm5zIHtET019IGEgbmV3IERPTSBpbnN0YW5jZSByZXByZXNlbnRpbmcgYWxsIG1hdGNoZWQgY2hpbGRyZW5cclxuICAgICAqL1xyXG4gICAgZmluZChzZWxlY3Rvcjogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICBsZXQgYWxsQ2hpbGRFbGVtZW50cyA9IHRoaXMuZmluZENoaWxkRWxlbWVudHMoc2VsZWN0b3IpO1xyXG4gICAgICAgIHJldHVybiBuZXcgRE9NKGFsbENoaWxkRWxlbWVudHMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHN0cmluZyBvZiB0aGUgaW5uZXIgSFRNTCBjb250ZW50IG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICovXHJcbiAgICBodG1sKCk6IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgaW5uZXIgSFRNTCBjb250ZW50IG9mIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBjb250ZW50IGEgc3RyaW5nIG9mIHBsYWluIHRleHQgb3IgSFRNTCBtYXJrdXBcclxuICAgICAqL1xyXG4gICAgaHRtbChjb250ZW50OiBzdHJpbmcpOiBET007XHJcbiAgICBodG1sKGNvbnRlbnQ/OiBzdHJpbmcpOiBzdHJpbmcgfCBET00ge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRIdG1sKGNvbnRlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SHRtbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEh0bWwoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0uaW5uZXJIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0SHRtbChjb250ZW50OiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIGlmIChjb250ZW50ID09PSB1bmRlZmluZWQgfHwgY29udGVudCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIC8vIFNldCB0byBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgaW5uZXJIVE1MIGdldHRpbmcgc2V0IHRvIFwidW5kZWZpbmVkXCIgKGFsbCBicm93c2Vycykgb3IgXCJudWxsXCIgKElFOSlcclxuICAgICAgICAgICAgY29udGVudCA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb250ZW50O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFycyB0aGUgaW5uZXIgSFRNTCBvZiBhbGwgZWxlbWVudHMgKGRlbGV0ZXMgYWxsIGNoaWxkcmVuKS5cclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGVtcHR5KCk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGZpcnN0IGZvcm0gZWxlbWVudCwgZS5nLiB0aGUgc2VsZWN0ZWQgdmFsdWUgb2YgYSBzZWxlY3QgYm94IG9yIHRoZSB0ZXh0IGlmIGFuIGlucHV0IGZpZWxkLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHZhbHVlIG9mIGEgZm9ybSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIHZhbCgpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50c1swXTtcclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MU2VsZWN0RWxlbWVudCB8fCBlbGVtZW50IGluc3RhbmNlb2YgSFRNTElucHV0RWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC52YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8gYWRkIHN1cHBvcnQgZm9yIG1pc3NpbmcgZm9ybSBlbGVtZW50c1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHZhbCgpIG5vdCBzdXBwb3J0ZWQgZm9yICR7dHlwZW9mIGVsZW1lbnR9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYW4gYXR0cmlidXRlIG9uIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZVxyXG4gICAgICovXHJcbiAgICBhdHRyKGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhbiBhdHRyaWJ1dGUgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGF0dHJpYnV0ZSB0aGUgbmFtZSBvZiB0aGUgYXR0cmlidXRlXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIG9mIHRoZSBhdHRyaWJ1dGVcclxuICAgICAqL1xyXG4gICAgYXR0cihhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTTtcclxuICAgIGF0dHIoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB8IERPTSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEF0dHIoYXR0cmlidXRlLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyKGF0dHJpYnV0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QXR0cihhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0QXR0cihhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBkYXRhIGVsZW1lbnQgb24gdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gZGF0YUF0dHJpYnV0ZSB0aGUgbmFtZSBvZiB0aGUgZGF0YSBhdHRyaWJ1dGUgd2l0aG91dCB0aGUgXCJkYXRhLVwiIHByZWZpeFxyXG4gICAgICovXHJcbiAgICBkYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBkYXRhIGF0dHJpYnV0ZSBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gZGF0YUF0dHJpYnV0ZSB0aGUgbmFtZSBvZiB0aGUgZGF0YSBhdHRyaWJ1dGUgd2l0aG91dCB0aGUgXCJkYXRhLVwiIHByZWZpeFxyXG4gICAgICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSBvZiB0aGUgZGF0YSBhdHRyaWJ1dGVcclxuICAgICAqL1xyXG4gICAgZGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET007XHJcbiAgICBkYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHwgRE9NIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0RGF0YShkYXRhQXR0cmlidXRlLCB2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXREYXRhKGRhdGFBdHRyaWJ1dGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldERhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0uZ2V0QXR0cmlidXRlKFwiZGF0YS1cIiArIGRhdGFBdHRyaWJ1dGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0RGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImRhdGEtXCIgKyBkYXRhQXR0cmlidXRlLCB2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcHBlbmRzIG9uZSBvciBtb3JlIERPTSBlbGVtZW50cyBhcyBjaGlsZHJlbiB0byBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gY2hpbGRFbGVtZW50cyB0aGUgY2hyaWxkIGVsZW1lbnRzIHRvIGFwcGVuZFxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgYXBwZW5kKC4uLmNoaWxkRWxlbWVudHM6IERPTVtdKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgY2hpbGRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkRWxlbWVudC5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChfLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoY2hpbGRFbGVtZW50LmVsZW1lbnRzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBET00uXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHBhcmVudCA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICAgICAgaWYgKHBhcmVudCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBvZmZzZXQgb2YgdGhlIGZpcnN0IGVsZW1lbnQgZnJvbSB0aGUgZG9jdW1lbnQncyB0b3AgbGVmdCBjb3JuZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7T2Zmc2V0fVxyXG4gICAgICovXHJcbiAgICBvZmZzZXQoKTogT2Zmc2V0IHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbMF07XHJcbiAgICAgICAgbGV0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCBhbHdheXMgMCBpbiBJRTksIElFMTEsIEZpcmVmb3hcclxuICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMTEwMjIxNS8zNzAyNTJcclxuICAgICAgICBsZXQgc2Nyb2xsVG9wID0gdHlwZW9mIHdpbmRvdy5wYWdlWU9mZnNldCAhPT0gXCJ1bmRlZmluZWRcIiA/XHJcbiAgICAgICAgICAgIHdpbmRvdy5wYWdlWU9mZnNldCA6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgP1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIDogZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgP1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCA6IDA7XHJcblxyXG4gICAgICAgIC8vIFdvcmthcm91bmQgZm9yIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCBhbHdheXMgMCBpbiBJRTksIElFMTEsIEZpcmVmb3hcclxuICAgICAgICBsZXQgc2Nyb2xsTGVmdCA9IHR5cGVvZiB3aW5kb3cucGFnZVhPZmZzZXQgIT09IFwidW5kZWZpbmVkXCIgP1xyXG4gICAgICAgICAgICB3aW5kb3cucGFnZVhPZmZzZXQgOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCA/XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxMZWZ0IDogZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0ID9cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxMZWZ0IDogMDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdG9wOiByZWN0LnRvcCArIHNjcm9sbFRvcCxcclxuICAgICAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgc2Nyb2xsTGVmdFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB3aWR0aCBvZiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IHRoZSB3aWR0aCBvZiB0aGUgZmlyc3QgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICB3aWR0aCgpOiBudW1iZXIge1xyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaWYgdGhpcyBpcyB0aGUgc2FtZSBhcyBqUXVlcnkncyB3aWR0aCgpIChwcm9iYWJseSBub3QpXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudHNbMF0ub2Zmc2V0V2lkdGg7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBoZWlnaHQgb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgaGVpZ2h0IG9mIHRoZSBmaXJzdCBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGhlaWdodCgpOiBudW1iZXIge1xyXG4gICAgICAgIC8vIFRPRE8gY2hlY2sgaWYgdGhpcyBpcyB0aGUgc2FtZSBhcyBqUXVlcnkncyBoZWlnaHQoKSAocHJvYmFibHkgbm90KVxyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLm9mZnNldEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEF0dGFjaGVzIGFuIGV2ZW50IGhhbmRsZXIgdG8gb25lIG9yIG1vcmUgZXZlbnRzIG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBldmVudE5hbWUgdGhlIGV2ZW50IG5hbWUgKG9yIG11bHRpcGxlIG5hbWVzIHNlcGFyYXRlZCBieSBzcGFjZSkgdG8gbGlzdGVuIHRvXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRIYW5kbGVyIHRoZSBldmVudCBoYW5kbGVyIHRvIGNhbGwgd2hlbiB0aGUgZXZlbnQgZmlyZXNcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIG9uKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudEhhbmRsZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QpOiBET00ge1xyXG4gICAgICAgIGxldCBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmVsZW1lbnRzID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnRIYW5kbGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnRIYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBldmVudCBoYW5kbGVyIGZyb20gb25lIG9yIG1vcmUgZXZlbnRzIG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBldmVudE5hbWUgdGhlIGV2ZW50IG5hbWUgKG9yIG11bHRpcGxlIG5hbWVzIHNlcGFyYXRlZCBieSBzcGFjZSkgdG8gcmVtb3ZlIHRoZSBoYW5kbGVyIGZyb21cclxuICAgICAqIEBwYXJhbSBldmVudEhhbmRsZXIgdGhlIGV2ZW50IGhhbmRsZXIgdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBvZmYoZXZlbnROYW1lOiBzdHJpbmcsIGV2ZW50SGFuZGxlcjogRXZlbnRMaXN0ZW5lck9yRXZlbnRMaXN0ZW5lck9iamVjdCk6IERPTSB7XHJcbiAgICAgICAgbGV0IGV2ZW50cyA9IGV2ZW50TmFtZS5zcGxpdChcIiBcIik7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuZWxlbWVudHMgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudEhhbmRsZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBldmVudEhhbmRsZXIpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRzIHRoZSBzcGVjaWZpZWQgY2xhc3MoZXMpIHRvIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBjbGFzc05hbWUgdGhlIGNsYXNzKGVzKSB0byBhZGQsIG11bHRpcGxlIGNsYXNzZXMgc2VwYXJhdGVkIGJ5IHNwYWNlXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBhZGRDbGFzcyhjbGFzc05hbWU6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSArPSBcIiBcIiArIGNsYXNzTmFtZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZWQgdGhlIHNwZWNpZmllZCBjbGFzcyhlcykgZnJvbSBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lIHRoZSBjbGFzcyhlcykgdG8gcmVtb3ZlLCBtdWx0aXBsZSBjbGFzc2VzIHNlcGFyYXRlZCBieSBzcGFjZVxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoXCIoXnxcXFxcYilcIiArIGNsYXNzTmFtZS5zcGxpdChcIiBcIikuam9pbihcInxcIikgKyBcIihcXFxcYnwkKVwiLCBcImdpXCIpLCBcIiBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgYW55IG9mIHRoZSBlbGVtZW50cyBoYXMgdGhlIHNwZWNpZmllZCBjbGFzcy5cclxuICAgICAqIEBwYXJhbSBjbGFzc05hbWUgdGhlIGNsYXNzIG5hbWUgdG8gY2hlY2tcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIG9uZSBvZiB0aGUgZWxlbWVudHMgaGFzIHRoZSBjbGFzcyBhdHRhY2hlZCwgZWxzZSBpZiBubyBlbGVtZW50IGhhcyBpdCBhdHRhY2hlZFxyXG4gICAgICovXHJcbiAgICBoYXNDbGFzcyhjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3IFJlZ0V4cChcIihefCApXCIgKyBjbGFzc05hbWUgKyBcIiggfCQpXCIsIFwiZ2lcIikudGVzdChlbGVtZW50LmNsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIENTUyBwcm9wZXJ0eSBvZiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgdGhlIG5hbWUgb2YgdGhlIENTUyBwcm9wZXJ0eSB0byByZXRyaWV2ZSB0aGUgdmFsdWUgb2ZcclxuICAgICAqL1xyXG4gICAgY3NzKHByb3BlcnR5TmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBDU1MgcHJvcGVydHkgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIHByb3BlcnR5TmFtZSB0aGUgbmFtZSBvZiB0aGUgQ1NTIHByb3BlcnR5IHRvIHNldCB0aGUgdmFsdWUgZm9yXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHRvIHNldCBmb3IgdGhlIGdpdmVuIENTUyBwcm9wZXJ0eVxyXG4gICAgICovXHJcbiAgICBjc3MocHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET007XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBjb2xsZWN0aW9uIG9mIENTUyBwcm9wZXJ0aWVzIGFuZCB0aGVpciB2YWx1ZXMgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIHByb3BlcnR5VmFsdWVDb2xsZWN0aW9uIGFuIG9iamVjdCBjb250YWluaW5nIHBhaXJzIG9mIHByb3BlcnR5IG5hbWVzIGFuZCB0aGVpciB2YWx1ZXNcclxuICAgICAqL1xyXG4gICAgY3NzKHByb3BlcnR5VmFsdWVDb2xsZWN0aW9uOiB7W3Byb3BlcnR5TmFtZTogc3RyaW5nXTogc3RyaW5nfSk6IERPTTtcclxuICAgIGNzcyhwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb246IHN0cmluZyB8IHtbcHJvcGVydHlOYW1lOiBzdHJpbmddOiBzdHJpbmd9LCB2YWx1ZT86IHN0cmluZyk6IHN0cmluZyB8IG51bGwgfCBET00ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHlOYW1lT3JDb2xsZWN0aW9uID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb247XHJcblxyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0Q3NzKHByb3BlcnR5TmFtZSwgdmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3NzKHByb3BlcnR5TmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0eVZhbHVlQ29sbGVjdGlvbiA9IHByb3BlcnR5TmFtZU9yQ29sbGVjdGlvbjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0Q3NzQ29sbGVjdGlvbihwcm9wZXJ0eVZhbHVlQ29sbGVjdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q3NzKHByb3BlcnR5TmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50c1swXSlbPGFueT5wcm9wZXJ0eU5hbWVdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Q3NzKHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgLy8gPGFueT4gY2FzdCB0byByZXNvbHZlIFRTNzAxNTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzY2MjcxMTQvMzcwMjUyXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbPGFueT5wcm9wZXJ0eU5hbWVdID0gdmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRDc3NDb2xsZWN0aW9uKHJ1bGVWYWx1ZUNvbGxlY3Rpb246IHtbcnVsZU5hbWU6IHN0cmluZ106IHN0cmluZ30pOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNDQ5MDU3My8zNzAyNTJcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihlbGVtZW50LnN0eWxlLCBydWxlVmFsdWVDb2xsZWN0aW9uKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0FycmF5VXRpbHN9IGZyb20gXCIuL3V0aWxzXCI7XHJcbi8qKlxyXG4gKiBGdW5jdGlvbiBpbnRlcmZhY2UgZm9yIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUge0BsaW5rIEV2ZW50RGlzcGF0Y2hlcn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiB7XHJcbiAgICAoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpOiB2b2lkO1xyXG59XHJcblxyXG4vKipcclxuICogRW1wdHkgdHlwZSBmb3IgY3JlYXRpbmcge0BsaW5rIEV2ZW50RGlzcGF0Y2hlciBldmVudCBkaXNwYXRjaGVyc30gdGhhdCBkbyBub3QgY2FycnkgYW55IGFyZ3VtZW50cy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm9BcmdzIHtcclxufVxyXG5cclxuLyoqXHJcbiAqIFB1YmxpYyBpbnRlcmZhY2UgdGhhdCByZXByZXNlbnRzIGFuIGV2ZW50LiBDYW4gYmUgdXNlZCB0byBzdWJzY3JpYmUgdG8gYW5kIHVuc3Vic2NyaWJlIGZyb20gZXZlbnRzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBFdmVudDxTZW5kZXIsIEFyZ3M+IHtcclxuICAgIC8qKlxyXG4gICAgICogU3Vic2NyaWJlcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGlzIGV2ZW50IGRpc3BhdGNoZXIuXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgdGhlIGxpc3RlbmVyIHRvIGFkZFxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmUobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPik6IHZvaWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJzY3JpYmVzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoaXMgZXZlbnQgZGlzcGF0Y2hlciB0aGF0IHdpbGwgYmUgY2FsbGVkIGF0IGEgbGltaXRlZCByYXRlIHdpdGggYSBtaW5pbXVtXHJcbiAgICAgKiBpbnRlcnZhbCBvZiB0aGUgc3BlY2lmaWVkIG1pbGxpc2Vjb25kcy5cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gcmF0ZU1zIHRoZSByYXRlIGluIG1pbGxpc2Vjb25kcyB0byB3aGljaCBjYWxsaW5nIG9mIHRoZSBsaXN0ZW5lcnMgc2hvdWxkIGJlIGxpbWl0ZWRcclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlUmF0ZUxpbWl0ZWQobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiwgcmF0ZU1zOiBudW1iZXIpOiB2b2lkO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5zdWJzY3JpYmVzIGEgc3Vic2NyaWJlZCBldmVudCBsaXN0ZW5lciBmcm9tIHRoaXMgZGlzcGF0Y2hlci5cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbGlzdGVuZXIgd2FzIHN1Y2Nlc3NmdWxseSB1bnN1YnNjcmliZWQsIGZhbHNlIGlmIGl0IGlzbid0IHN1YnNjcmliZWQgb24gdGhpcyBkaXNwYXRjaGVyXHJcbiAgICAgKi9cclxuICAgIHVuc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pOiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRXZlbnQgZGlzcGF0Y2hlciB0byBzdWJzY3JpYmUgYW5kIHRyaWdnZXIgZXZlbnRzLiBFYWNoIGV2ZW50IHNob3VsZCBoYXZlIGl0cyBvd24gZGlzcGF0Y2hlci5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXI8U2VuZGVyLCBBcmdzPiBpbXBsZW1lbnRzIEV2ZW50PFNlbmRlciwgQXJncz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGlzdGVuZXJzOiBFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+W10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHtAaW5oZXJpdERvY31cclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG5ldyBFdmVudExpc3RlbmVyV3JhcHBlcihsaXN0ZW5lcikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICoge0Bpbmhlcml0RG9jfVxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmVSYXRlTGltaXRlZChsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+LCByYXRlTXM6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobmV3IFJhdGVMaW1pdGVkRXZlbnRMaXN0ZW5lcldyYXBwZXIobGlzdGVuZXIsIHJhdGVNcykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICoge0Bpbmhlcml0RG9jfVxyXG4gICAgICovXHJcbiAgICB1bnN1YnNjcmliZShsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGxpc3RlbmVycywgY29tcGFyZSB3aXRoIHBhcmFtZXRlciwgYW5kIHJlbW92ZSBpZiBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN1YnNjcmliZWRMaXN0ZW5lciA9IHRoaXMubGlzdGVuZXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlZExpc3RlbmVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgQXJyYXlVdGlscy5yZW1vdmUodGhpcy5saXN0ZW5lcnMsIHN1YnNjcmliZWRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGlzcGF0Y2hlcyBhbiBldmVudCB0byBhbGwgc3Vic2NyaWJlZCBsaXN0ZW5lcnMuXHJcbiAgICAgKiBAcGFyYW0gc2VuZGVyIHRoZSBzb3VyY2Ugb2YgdGhlIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0gYXJncyB0aGUgYXJndW1lbnRzIGZvciB0aGUgZXZlbnRcclxuICAgICAqL1xyXG4gICAgZGlzcGF0Y2goc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MgPSBudWxsKSB7XHJcbiAgICAgICAgLy8gQ2FsbCBldmVyeSBsaXN0ZW5lclxyXG4gICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMubGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyLmZpcmUoc2VuZGVyLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBldmVudCB0aGF0IHRoaXMgZGlzcGF0Y2hlciBtYW5hZ2VzIGFuZCBvbiB3aGljaCBsaXN0ZW5lcnMgY2FuIHN1YnNjcmliZSBhbmQgdW5zdWJzY3JpYmUgZXZlbnQgaGFuZGxlcnMuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnR9XHJcbiAgICAgKi9cclxuICAgIGdldEV2ZW50KCk6IEV2ZW50PFNlbmRlciwgQXJncz4ge1xyXG4gICAgICAgIC8vIEZvciBub3csIGp1c3QgY2FzZSB0aGUgZXZlbnQgZGlzcGF0Y2hlciB0byB0aGUgZXZlbnQgaW50ZXJmYWNlLiBBdCBzb21lIHBvaW50IGluIHRoZSBmdXR1cmUgd2hlbiB0aGVcclxuICAgICAgICAvLyBjb2RlYmFzZSBncm93cywgaXQgbWlnaHQgbWFrZSBzZW5zZSB0byBzcGxpdCB0aGUgZGlzcGF0Y2hlciBpbnRvIHNlcGFyYXRlIGRpc3BhdGNoZXIgYW5kIGV2ZW50IGNsYXNzZXMuXHJcbiAgICAgICAgcmV0dXJuIDxFdmVudDxTZW5kZXIsIEFyZ3M+PnRoaXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGJhc2ljIGV2ZW50IGxpc3RlbmVyIHdyYXBwZXIgdG8gbWFuYWdlIGxpc3RlbmVycyB3aXRoaW4gdGhlIHtAbGluayBFdmVudERpc3BhdGNoZXJ9LiBUaGlzIGlzIGEgXCJwcml2YXRlXCIgY2xhc3NcclxuICogZm9yIGludGVybmFsIGRpc3BhdGNoZXIgdXNlIGFuZCBpdCBpcyB0aGVyZWZvcmUgbm90IGV4cG9ydGVkLlxyXG4gKi9cclxuY2xhc3MgRXZlbnRMaXN0ZW5lcldyYXBwZXI8U2VuZGVyLCBBcmdzPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudExpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz47XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPikge1xyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lciA9IGxpc3RlbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgd3JhcHBlZCBldmVudCBsaXN0ZW5lci5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBsaXN0ZW5lcigpOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB0aGUgd3JhcHBlZCBldmVudCBsaXN0ZW5lciB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMuXHJcbiAgICAgKiBAcGFyYW0gc2VuZGVyXHJcbiAgICAgKiBAcGFyYW0gYXJnc1xyXG4gICAgICovXHJcbiAgICBmaXJlKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbmVyKHNlbmRlciwgYXJncyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHRlbmRzIHRoZSBiYXNpYyB7QGxpbmsgRXZlbnRMaXN0ZW5lcldyYXBwZXJ9IHdpdGggcmF0ZS1saW1pdGluZyBmdW5jdGlvbmFsaXR5LlxyXG4gKi9cclxuY2xhc3MgUmF0ZUxpbWl0ZWRFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+IGV4dGVuZHMgRXZlbnRMaXN0ZW5lcldyYXBwZXI8U2VuZGVyLCBBcmdzPiB7XHJcblxyXG4gICAgcHJpdmF0ZSByYXRlTXM6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmF0ZUxpbWl0aW5nRXZlbnRMaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+O1xyXG5cclxuICAgIHByaXZhdGUgbGFzdEZpcmVUaW1lOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiwgcmF0ZU1zOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihsaXN0ZW5lcik7IC8vIHNldHMgdGhlIGV2ZW50IGxpc3RlbmVyIHNpbmtcclxuXHJcbiAgICAgICAgdGhpcy5yYXRlTXMgPSByYXRlTXM7XHJcbiAgICAgICAgdGhpcy5sYXN0RmlyZVRpbWUgPSAwO1xyXG5cclxuICAgICAgICAvLyBXcmFwIHRoZSBldmVudCBsaXN0ZW5lciB3aXRoIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgZG9lcyB0aGUgcmF0ZS1saW1pdGluZ1xyXG4gICAgICAgIHRoaXMucmF0ZUxpbWl0aW5nRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncykge1xyXG4gICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHRoaXMubGFzdEZpcmVUaW1lID4gdGhpcy5yYXRlTXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIE9ubHkgaWYgZW5vdWdoIHRpbWUgc2luY2UgdGhlIHByZXZpb3VzIGNhbGwgaGFzIHBhc3NlZCwgY2FsbCB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGFjdHVhbCBldmVudCBsaXN0ZW5lciBhbmQgcmVjb3JkIHRoZSBjdXJyZW50IHRpbWVcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZVN1cGVyKHNlbmRlciwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RGaXJlVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmlyZVN1cGVyKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKSB7XHJcbiAgICAgICAgLy8gRmlyZSB0aGUgYWN0dWFsIGV4dGVybmFsIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAgICAgc3VwZXIuZmlyZShzZW5kZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpIHtcclxuICAgICAgICAvLyBGaXJlIHRoZSBpbnRlcm5hbCByYXRlLWxpbWl0aW5nIGxpc3RlbmVyIGluc3RlYWQgb2YgdGhlIGV4dGVybmFsIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAgICAgdGhpcy5yYXRlTGltaXRpbmdFdmVudExpc3RlbmVyKHNlbmRlciwgYXJncyk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgR3VpZCB7XHJcblxyXG4gICAgbGV0IGd1aWQgPSAxO1xyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAgIHJldHVybiBndWlkKys7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGxheWVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbm9kZV9tb2R1bGVzL0B0eXBlcy9jb3JlLWpzL2luZGV4LmQudHNcIiAvPlxyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7QnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2J1dHRvblwiO1xyXG5pbXBvcnQge0NvbnRyb2xCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udHJvbGJhclwiO1xyXG5pbXBvcnQge0Z1bGxzY3JlZW5Ub2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0h1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9odWdlcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtQbGF5YmFja1RpbWVMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RpbWVsYWJlbFwiO1xyXG5pbXBvcnQge1BsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7U2Vla0Jhcn0gZnJvbSBcIi4vY29tcG9uZW50cy9zZWVrYmFyXCI7XHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge1NldHRpbmdzUGFuZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvc2V0dGluZ3NwYW5lbFwiO1xyXG5pbXBvcnQge1NldHRpbmdzVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3NldHRpbmdzdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZpZGVvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy92aWRlb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtWb2x1bWVUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdm9sdW1ldG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VlJUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdnJ0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtXYXRlcm1hcmt9IGZyb20gXCIuL2NvbXBvbmVudHMvd2F0ZXJtYXJrXCI7XHJcbmltcG9ydCB7VUlDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdWljb250YWluZXJcIjtcclxuaW1wb3J0IHtDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvbGFiZWxcIjtcclxuaW1wb3J0IHtBdWRpb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7QXVkaW9UcmFja1NlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9hdWRpb3RyYWNrc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7Q2FzdFN0YXR1c092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvY2FzdHN0YXR1c292ZXJsYXlcIjtcclxuaW1wb3J0IHtDYXN0VG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Nhc3R0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudHMvY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RXJyb3JNZXNzYWdlT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9lcnJvcm1lc3NhZ2VvdmVybGF5XCI7XHJcbmltcG9ydCB7UmVjb21tZW5kYXRpb25PdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL3JlY29tbWVuZGF0aW9ub3ZlcmxheVwiO1xyXG5pbXBvcnQge1NlZWtCYXJMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9zZWVrYmFybGFiZWxcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZU92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVvdmVybGF5XCI7XHJcbmltcG9ydCB7U3VidGl0bGVTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtUaXRsZUJhcn0gZnJvbSBcIi4vY29tcG9uZW50cy90aXRsZWJhclwiO1xyXG5pbXBvcnQge1ZvbHVtZUNvbnRyb2xCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdm9sdW1lY29udHJvbGJ1dHRvblwiO1xyXG5pbXBvcnQge0NsaWNrT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9jbGlja292ZXJsYXlcIjtcclxuaW1wb3J0IHtBZFNraXBCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvYWRza2lwYnV0dG9uXCI7XHJcbmltcG9ydCB7QWRNZXNzYWdlTGFiZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvYWRtZXNzYWdlbGFiZWxcIjtcclxuaW1wb3J0IHtBZENsaWNrT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9hZGNsaWNrb3ZlcmxheVwiO1xyXG5cclxuLy8gT2JqZWN0LmFzc2lnbiBwb2x5ZmlsbCBmb3IgRVM1L0lFOVxyXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kZS9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduXHJcbmlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24odGFyZ2V0OiBhbnkpIHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRhcmdldCA9IE9iamVjdCh0YXJnZXQpO1xyXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAoc291cmNlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfTtcclxufVxyXG5cclxuLy8gRXhwb3NlIGNsYXNzZXMgdG8gd2luZG93XHJcbi8vIEluc3BpcmVkIGJ5IGh0dHBzOi8va2Vlc3RhbGtzdGVjaC5jb20vMjAxNi8wOC9zdXBwb3J0LWJvdGgtbm9kZS1qcy1hbmQtYnJvd3Nlci1qcy1pbi1vbmUtdHlwZXNjcmlwdC1maWxlL1xyXG4vLyBUT0RPIGZpbmQgb3V0IGhvdyBUUy9Ccm93c2VyaWZ5IGNhbiBjb21waWxlIHRoZSBjbGFzc2VzIHRvIHBsYWluIEpTIHdpdGhvdXQgdGhlIG1vZHVsZSB3cmFwcGVyIHdlIGRvbid0IG5lZWQgdG8gZXhwb3NlIGNsYXNzZXMgdG8gdGhlIHdpbmRvdyBzY29wZSBtYW51YWxseSBoZXJlXHJcbihmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgbGV0IGV4cG9ydGFibGVzID0gW1xyXG4gICAgICAgIC8vIE1hbmFnZW1lbnRcclxuICAgICAgICBVSU1hbmFnZXIsXHJcbiAgICAgICAgLy8gQ29tcG9uZW50c1xyXG4gICAgICAgIEFkQ2xpY2tPdmVybGF5LFxyXG4gICAgICAgIEFkTWVzc2FnZUxhYmVsLFxyXG4gICAgICAgIEFkU2tpcEJ1dHRvbixcclxuICAgICAgICBBdWRpb1F1YWxpdHlTZWxlY3RCb3gsXHJcbiAgICAgICAgQXVkaW9UcmFja1NlbGVjdEJveCxcclxuICAgICAgICBCdXR0b24sXHJcbiAgICAgICAgQ2FzdFN0YXR1c092ZXJsYXksXHJcbiAgICAgICAgQ2FzdFRvZ2dsZUJ1dHRvbixcclxuICAgICAgICBDbGlja092ZXJsYXksXHJcbiAgICAgICAgQ29tcG9uZW50LFxyXG4gICAgICAgIENvbnRhaW5lcixcclxuICAgICAgICBDb250cm9sQmFyLFxyXG4gICAgICAgIEVycm9yTWVzc2FnZU92ZXJsYXksXHJcbiAgICAgICAgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbixcclxuICAgICAgICBIdWdlUGxheWJhY2tUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgTGFiZWwsXHJcbiAgICAgICAgUGxheWJhY2tUaW1lTGFiZWwsXHJcbiAgICAgICAgUGxheWJhY2tUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgUmVjb21tZW5kYXRpb25PdmVybGF5LFxyXG4gICAgICAgIFNlZWtCYXIsXHJcbiAgICAgICAgU2Vla0JhckxhYmVsLFxyXG4gICAgICAgIFNlbGVjdEJveCxcclxuICAgICAgICBTZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgIFNldHRpbmdzVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFN1YnRpdGxlT3ZlcmxheSxcclxuICAgICAgICBTdWJ0aXRsZVNlbGVjdEJveCxcclxuICAgICAgICBUaXRsZUJhcixcclxuICAgICAgICBUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgVUlDb250YWluZXIsXHJcbiAgICAgICAgVmlkZW9RdWFsaXR5U2VsZWN0Qm94LFxyXG4gICAgICAgIFZvbHVtZUNvbnRyb2xCdXR0b24sXHJcbiAgICAgICAgVm9sdW1lVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFZSVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFdhdGVybWFyayxcclxuICAgIF07XHJcblxyXG4gICAgKHdpbmRvdyBhcyBhbnkpW1wiYml0bW92aW5cIl1bXCJwbGF5ZXJ1aVwiXSA9IHt9O1xyXG4gICAgbGV0IHVpc2NvcGUgPSAod2luZG93IGFzIGFueSlbXCJiaXRtb3ZpblwiXVtcInBsYXllcnVpXCJdO1xyXG5cclxuICAgIGlmICh3aW5kb3cpIHtcclxuICAgICAgICBleHBvcnRhYmxlcy5mb3JFYWNoKGV4cCA9PiB1aXNjb3BlW25hbWVvZihleHApXSA9IGV4cCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbmFtZW9mKGZuOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0eXBlb2YgZm4gPT09IFwidW5kZWZpbmVkXCIgPyBcIlwiIDogZm4ubmFtZSA/IGZuLm5hbWUgOiAoKCkgPT4ge1xyXG4gICAgICAgICAgICBsZXQgcmVzdWx0ID0gL15mdW5jdGlvblxccysoW1xcd1xcJF0rKVxccypcXCgvLmV4ZWMoZm4udG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICAgIHJldHVybiAhcmVzdWx0ID8gXCJcIiA6IHJlc3VsdFsxXTtcclxuICAgICAgICB9KSgpO1xyXG4gICAgfVxyXG5cclxufSgpKTsiLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbi8vIFRPRE8gY2hhbmdlIHRvIGludGVybmFsIChub3QgZXhwb3J0ZWQpIGNsYXNzLCBob3cgdG8gdXNlIGluIG90aGVyIGZpbGVzP1xyXG5leHBvcnQgY2xhc3MgVGltZW91dCB7XHJcblxyXG4gICAgcHJpdmF0ZSBkZWxheTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBjYWxsYmFjazogKCkgPT4gdm9pZDtcclxuICAgIHByaXZhdGUgdGltZW91dEhhbmRsZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRlbGF5OiBudW1iZXIsIGNhbGxiYWNrOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5kZWxheSA9IGRlbGF5O1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB0aGlzLnRpbWVvdXRIYW5kbGUgPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RhcnRzIHRoZSB0aW1lb3V0IGFuZCBjYWxscyB0aGUgY2FsbGJhY2sgd2hlbiB0aGUgdGltZW91dCBkZWxheSBoYXMgcGFzc2VkLlxyXG4gICAgICovXHJcbiAgICBzdGFydCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIHRpbWVvdXQuIFRoZSBjYWxsYmFjayB3aWxsIG5vdCBiZSBjYWxsZWQgaWYgY2xlYXIgaXMgY2FsbGVkIGR1cmluZyB0aGUgdGltZW91dC5cclxuICAgICAqL1xyXG4gICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dEhhbmRsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXNldHMgdGhlIHBhc3NlZCB0aW1lb3V0IGRlbGF5IHRvIHplcm8uIENhbiBiZSB1c2VkIHRvIGRlZmVyIHRoZSBjYWxsaW5nIG9mIHRoZSBjYWxsYmFjay5cclxuICAgICAqL1xyXG4gICAgcmVzZXQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudGltZW91dEhhbmRsZSA9IHNldFRpbWVvdXQodGhpcy5jYWxsYmFjaywgdGhpcy5kZWxheSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VUlDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdWljb250YWluZXJcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuL2RvbVwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0NvbnRhaW5lcn0gZnJvbSBcIi4vY29tcG9uZW50cy9jb250YWluZXJcIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0Z1bGxzY3JlZW5Ub2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZSVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZydG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7Vm9sdW1lVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZXRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1NlZWtCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvc2Vla2JhclwiO1xyXG5pbXBvcnQge1BsYXliYWNrVGltZUxhYmVsLCBUaW1lTGFiZWxNb2RlfSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrdGltZWxhYmVsXCI7XHJcbmltcG9ydCB7SHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2h1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0NvbnRyb2xCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udHJvbGJhclwiO1xyXG5pbXBvcnQge05vQXJncywgRXZlbnREaXNwYXRjaGVyfSBmcm9tIFwiLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtTZXR0aW5nc1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1NldHRpbmdzUGFuZWwsIFNldHRpbmdzUGFuZWxJdGVtfSBmcm9tIFwiLi9jb21wb25lbnRzL3NldHRpbmdzcGFuZWxcIjtcclxuaW1wb3J0IHtWaWRlb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvdmlkZW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7V2F0ZXJtYXJrfSBmcm9tIFwiLi9jb21wb25lbnRzL3dhdGVybWFya1wiO1xyXG5pbXBvcnQge0F1ZGlvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9hdWRpb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtBdWRpb1RyYWNrU2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL2F1ZGlvdHJhY2tzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtTZWVrQmFyTGFiZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvc2Vla2JhcmxhYmVsXCI7XHJcbmltcG9ydCB7Vm9sdW1lU2xpZGVyfSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZXNsaWRlclwiO1xyXG5pbXBvcnQge1N1YnRpdGxlU2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3N1YnRpdGxlc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7U3VidGl0bGVPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL3N1YnRpdGxlb3ZlcmxheVwiO1xyXG5pbXBvcnQge1ZvbHVtZUNvbnRyb2xCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdm9sdW1lY29udHJvbGJ1dHRvblwiO1xyXG5pbXBvcnQge0Nhc3RUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvY2FzdHRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0Nhc3RTdGF0dXNPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL2Nhc3RzdGF0dXNvdmVybGF5XCI7XHJcbmltcG9ydCB7RXJyb3JNZXNzYWdlT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9lcnJvcm1lc3NhZ2VvdmVybGF5XCI7XHJcbmltcG9ydCB7VGl0bGVCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdGl0bGViYXJcIjtcclxuaW1wb3J0IFBsYXllciA9IGJpdG1vdmluLnBsYXllci5QbGF5ZXI7XHJcbmltcG9ydCB7UmVjb21tZW5kYXRpb25PdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL3JlY29tbWVuZGF0aW9ub3ZlcmxheVwiO1xyXG5pbXBvcnQge0FkTWVzc2FnZUxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL2FkbWVzc2FnZWxhYmVsXCI7XHJcbmltcG9ydCB7QWRTa2lwQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Fkc2tpcGJ1dHRvblwiO1xyXG5pbXBvcnQge0FkQ2xpY2tPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL2FkY2xpY2tvdmVybGF5XCI7XHJcbmltcG9ydCBFVkVOVCA9IGJpdG1vdmluLnBsYXllci5FVkVOVDtcclxuaW1wb3J0IFBsYXllckV2ZW50Q2FsbGJhY2sgPSBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyRXZlbnRDYWxsYmFjaztcclxuaW1wb3J0IEFkU3RhcnRlZEV2ZW50ID0gYml0bW92aW4ucGxheWVyLkFkU3RhcnRlZEV2ZW50O1xyXG5pbXBvcnQge0FycmF5VXRpbHN9IGZyb20gXCIuL3V0aWxzXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVJUmVjb21tZW5kYXRpb25Db25maWcge1xyXG4gICAgdGl0bGU6IHN0cmluZztcclxuICAgIHVybDogc3RyaW5nO1xyXG4gICAgdGh1bWJuYWlsPzogc3RyaW5nO1xyXG4gICAgZHVyYXRpb24/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlDb25maWcge1xyXG4gICAgbWV0YWRhdGE/OiB7XHJcbiAgICAgICAgdGl0bGU/OiBzdHJpbmdcclxuICAgIH07XHJcbiAgICByZWNvbW1lbmRhdGlvbnM/OiBVSVJlY29tbWVuZGF0aW9uQ29uZmlnW107XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBVSU1hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgcGxheWVyOiBQbGF5ZXI7XHJcbiAgICBwcml2YXRlIHBsYXllckVsZW1lbnQ6IERPTTtcclxuICAgIHByaXZhdGUgcGxheWVyVWk6IFVJQ29udGFpbmVyO1xyXG4gICAgcHJpdmF0ZSBhZHNVaTogVUlDb250YWluZXI7XHJcbiAgICBwcml2YXRlIGNvbmZpZzogVUlDb25maWc7XHJcblxyXG4gICAgcHJpdmF0ZSBtYW5hZ2VyUGxheWVyV3JhcHBlcjogUGxheWVyV3JhcHBlcjtcclxuICAgIHByaXZhdGUgdWlQbGF5ZXJXcmFwcGVyczogUGxheWVyV3JhcHBlcltdID0gW107XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudHMgPSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSSBhcmVhLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uTW91c2VFbnRlcjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIG1vdmVzIGluc2lkZSB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlTW92ZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIGxlYXZlcyB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlTGVhdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIGEgc2VlayBzdGFydHMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25TZWVrOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBzZWVrIHRpbWVsaW5lIGlzIHNjcnViYmVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla1ByZXZpZXc6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgbnVtYmVyPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gYSBzZWVrIGlzIGZpbmlzaGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla2VkOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgcGxheWVyVWk6IFVJQ29udGFpbmVyLCBhZHNVaTogVUlDb250YWluZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgIHRoaXMucGxheWVyVWkgPSBwbGF5ZXJVaTtcclxuICAgICAgICB0aGlzLmFkc1VpID0gYWRzVWk7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIHRoaXMubWFuYWdlclBsYXllcldyYXBwZXIgPSBuZXcgUGxheWVyV3JhcHBlcihwbGF5ZXIpO1xyXG5cclxuICAgICAgICBsZXQgcGxheWVySWQgPSBwbGF5ZXIuZ2V0RmlndXJlKCkucGFyZW50RWxlbWVudC5pZDtcclxuICAgICAgICB0aGlzLnBsYXllckVsZW1lbnQgPSBuZXcgRE9NKGAjJHtwbGF5ZXJJZH1gKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIFVJIGVsZW1lbnRzIHRvIHBsYXllclxyXG4gICAgICAgIHRoaXMuYWRkVWkocGxheWVyVWkpO1xyXG5cclxuICAgICAgICAvLyBBZHMgVUlcclxuICAgICAgICBpZiAoYWRzVWkpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRVaShhZHNVaSk7XHJcbiAgICAgICAgICAgIGFkc1VpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBlbnRlckFkc1VpID0gZnVuY3Rpb24gKGV2ZW50OiBBZFN0YXJ0ZWRFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyVWkuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGFkcyBVSSAob25seSBmb3IgVkFTVCBhZHMsIG90aGVyIGNsaWVudHMgYnJpbmcgdGhlaXIgb3duIFVJKVxyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNsaWVudFR5cGUgPT09IFwidmFzdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRzVWkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGV4aXRBZHNVaSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGFkc1VpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHBsYXllclVpLnNob3coKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlYWN0IHRvIGFkIGV2ZW50cyBmcm9tIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyUGxheWVyV3JhcHBlci5nZXRQbGF5ZXIoKS5hZGRFdmVudEhhbmRsZXIoRVZFTlQuT05fQURfU1RBUlRFRCwgZW50ZXJBZHNVaSk7XHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlclBsYXllcldyYXBwZXIuZ2V0UGxheWVyKCkuYWRkRXZlbnRIYW5kbGVyKEVWRU5ULk9OX0FEX0ZJTklTSEVELCBleGl0QWRzVWkpO1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZXJQbGF5ZXJXcmFwcGVyLmdldFBsYXllcigpLmFkZEV2ZW50SGFuZGxlcihFVkVOVC5PTl9BRF9TS0lQUEVELCBleGl0QWRzVWkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRDb25maWcoKTogVUlDb25maWcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyZUNvbnRyb2xzKGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pIHtcclxuICAgICAgICBsZXQgcGxheWVyV3JhcHBlciA9IHRoaXMudWlQbGF5ZXJXcmFwcGVyc1s8YW55PmNvbXBvbmVudF07XHJcblxyXG4gICAgICAgIGNvbXBvbmVudC5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgY29tcG9uZW50LmNvbmZpZ3VyZShwbGF5ZXJXcmFwcGVyLmdldFBsYXllcigpLCB0aGlzKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBvbmVudCBpbnN0YW5jZW9mIENvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZENvbXBvbmVudCBvZiBjb21wb25lbnQuZ2V0Q29tcG9uZW50cygpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUNvbnRyb2xzKGNoaWxkQ29tcG9uZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Nb3VzZUVudGVyKCk6IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uTW91c2VFbnRlcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Nb3VzZU1vdmUoKTogRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb21wb25lbnRDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25Nb3VzZU1vdmU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uTW91c2VMZWF2ZSgpOiBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vbk1vdXNlTGVhdmU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2VlaygpOiBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uU2VlaztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25TZWVrUHJldmlldygpOiBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgbnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uU2Vla1ByZXZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2Vla2VkKCk6IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25TZWVrZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRVaSh1aTogVUlDb250YWluZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnBsYXllckVsZW1lbnQuYXBwZW5kKHVpLmdldERvbUVsZW1lbnQoKSk7XHJcbiAgICAgICAgdGhpcy51aVBsYXllcldyYXBwZXJzWzxhbnk+dWldID0gbmV3IFBsYXllcldyYXBwZXIodGhpcy5wbGF5ZXIpO1xyXG4gICAgICAgIHRoaXMuY29uZmlndXJlQ29udHJvbHModWkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVsZWFzZVVpKHVpOiBVSUNvbnRhaW5lcik6IHZvaWQge1xyXG4gICAgICAgIHVpLmdldERvbUVsZW1lbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLnVpUGxheWVyV3JhcHBlcnNbPGFueT51aV0uY2xlYXJFdmVudEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVsZWFzZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbGVhc2VVaSh0aGlzLnBsYXllclVpKTtcclxuICAgICAgICBpZiAodGhpcy5hZHNVaSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbGVhc2VVaSh0aGlzLmFkc1VpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tYW5hZ2VyUGxheWVyV3JhcHBlci5jbGVhckV2ZW50SGFuZGxlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSA9IGNsYXNzIHtcclxuICAgICAgICBzdGF0aWMgYnVpbGREZWZhdWx0VUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIHJldHVybiBVSU1hbmFnZXIuRmFjdG9yeS5idWlsZE1vZGVyblVJKHBsYXllciwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBidWlsZE1vZGVyblVJKHBsYXllcjogUGxheWVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pOiBVSU1hbmFnZXIge1xyXG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJWaWRlbyBRdWFsaXR5XCIsIG5ldyBWaWRlb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gVHJhY2tcIiwgbmV3IEF1ZGlvVHJhY2tTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gUXVhbGl0eVwiLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlN1YnRpdGxlc1wiLCBuZXcgU3VidGl0bGVTZWxlY3RCb3goKSlcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udHJvbEJhciA9IG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoe3RpbWVMYWJlbE1vZGU6IFRpbWVMYWJlbE1vZGUuQ3VycmVudFRpbWV9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKHtsYWJlbDogbmV3IFNlZWtCYXJMYWJlbCgpfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoe3RpbWVMYWJlbE1vZGU6IFRpbWVMYWJlbE1vZGUuVG90YWxUaW1lfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzZXM6IFsnY29udHJvbGJhci10b3AnXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVTbGlkZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb21wb25lbnQoe2Nzc0NsYXNzOiAnc3BhY2VyJ30pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWUlRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzVG9nZ2xlQnV0dG9uKHtzZXR0aW5nc1BhbmVsOiBzZXR0aW5nc1BhbmVsfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzc2VzOiBbJ2NvbnRyb2xiYXItYm90dG9tJ11cclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTdWJ0aXRsZU92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFN0YXR1c092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFdhdGVybWFyaygpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWNvbW1lbmRhdGlvbk92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbW9kZXJuXCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVSU1hbmFnZXIocGxheWVyLCB1aSwgbnVsbCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBidWlsZExlZ2FjeVVJKHBsYXllcjogUGxheWVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pOiBVSU1hbmFnZXIge1xyXG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJWaWRlbyBRdWFsaXR5XCIsIG5ldyBWaWRlb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gVHJhY2tcIiwgbmV3IEF1ZGlvVHJhY2tTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gUXVhbGl0eVwiLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlN1YnRpdGxlc1wiLCBuZXcgU3VidGl0bGVTZWxlY3RCb3goKSlcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udHJvbEJhciA9IG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKHtsYWJlbDogbmV3IFNlZWtCYXJMYWJlbCgpfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZSVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZUNvbnRyb2xCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NUb2dnbGVCdXR0b24oe3NldHRpbmdzUGFuZWw6IHNldHRpbmdzUGFuZWx9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uKClcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTdWJ0aXRsZU92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFN0YXR1c092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFdhdGVybWFyaygpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWNvbW1lbmRhdGlvbk92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5XCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGFkc1VpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQWRDbGlja092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ29udHJvbEJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFkTWVzc2FnZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEFkU2tpcEJ1dHRvbigpXHJcbiAgICAgICAgICAgICAgICBdLCBjc3NDbGFzc2VzOiBbXCJ1aS1za2luLWxlZ2FjeSBhZHNcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVJTWFuYWdlcihwbGF5ZXIsIHVpLCBhZHNVaSwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBidWlsZExlZ2FjeUNhc3RSZWNlaXZlclVJKHBsYXllcjogUGxheWVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pOiBVSU1hbmFnZXIge1xyXG4gICAgICAgICAgICBsZXQgY29udHJvbEJhciA9IG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2Vla0JhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RpbWVMYWJlbCgpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCB1aSA9IG5ldyBVSUNvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN1YnRpdGxlT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBIdWdlUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgV2F0ZXJtYXJrKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbEJhcixcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVGl0bGVCYXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3JNZXNzYWdlT3ZlcmxheSgpXHJcbiAgICAgICAgICAgICAgICBdLCBjc3NDbGFzc2VzOiBbXCJ1aS1za2luLWxlZ2FjeSB1aS1za2luLWxlZ2FjeS1jYXN0LXJlY2VpdmVyXCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVSU1hbmFnZXIocGxheWVyLCB1aSwgbnVsbCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBidWlsZExlZ2FjeVRlc3RVSShwbGF5ZXI6IFBsYXllciwgY29uZmlnOiBVSUNvbmZpZyA9IHt9KTogVUlNYW5hZ2VyIHtcclxuICAgICAgICAgICAgbGV0IHNldHRpbmdzUGFuZWwgPSBuZXcgU2V0dGluZ3NQYW5lbCh7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiVmlkZW8gUXVhbGl0eVwiLCBuZXcgVmlkZW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIkF1ZGlvIFRyYWNrXCIsIG5ldyBBdWRpb1RyYWNrU2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIkF1ZGlvIFF1YWxpdHlcIiwgbmV3IEF1ZGlvUXVhbGl0eVNlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJTdWJ0aXRsZXNcIiwgbmV3IFN1YnRpdGxlU2VsZWN0Qm94KCkpXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGNvbnRyb2xCYXIgPSBuZXcgQ29udHJvbEJhcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbc2V0dGluZ3NQYW5lbCxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2Vla0Jhcih7bGFiZWw6IG5ldyBTZWVrQmFyTGFiZWwoKX0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RpbWVMYWJlbCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWUlRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lU2xpZGVyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZUNvbnRyb2xCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbih7dmVydGljYWw6IGZhbHNlfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzVG9nZ2xlQnV0dG9uKHtzZXR0aW5nc1BhbmVsOiBzZXR0aW5nc1BhbmVsfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbigpXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU3VidGl0bGVPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RTdGF0dXNPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBXYXRlcm1hcmsoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVjb21tZW5kYXRpb25PdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbEJhcixcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVGl0bGVCYXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgRXJyb3JNZXNzYWdlT3ZlcmxheSgpXHJcbiAgICAgICAgICAgICAgICBdLCBjc3NDbGFzc2VzOiBbXCJ1aS1za2luLWxlZ2FjeVwiXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVUlNYW5hZ2VyKHBsYXllciwgdWksIG51bGwsIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFdyYXBzIHRoZSBwbGF5ZXIgdG8gdHJhY2sgZXZlbnQgaGFuZGxlcnMgYW5kIHByb3ZpZGUgYSBzaW1wbGUgbWV0aG9kIHRvIHJlbW92ZSBhbGwgcmVnaXN0ZXJlZCBldmVudFxyXG4gKiBoYW5kbGVycyBmcm9tIHRoZSBwbGF5ZXIuXHJcbiAqL1xyXG5jbGFzcyBQbGF5ZXJXcmFwcGVyIHtcclxuXHJcbiAgICBwcml2YXRlIHBsYXllcjogUGxheWVyO1xyXG4gICAgcHJpdmF0ZSB3cmFwcGVyOiBQbGF5ZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudEhhbmRsZXJzOiB7IFtldmVudFR5cGU6IHN0cmluZ106IFBsYXllckV2ZW50Q2FsbGJhY2tbXTsgfSA9IHt9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBsYXllcjogUGxheWVyKSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgLy8gQ29sbGVjdCBhbGwgcHVibGljIEFQSSBtZXRob2RzIG9mIHRoZSBwbGF5ZXJcclxuICAgICAgICBsZXQgbWV0aG9kcyA9IDxhbnlbXT5bXTtcclxuICAgICAgICBmb3IgKGxldCBtZW1iZXIgaW4gcGxheWVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgKDxhbnk+cGxheWVyKVttZW1iZXJdID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZHMucHVzaChtZW1iZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDcmVhdGUgd3JhcHBlciBvYmplY3QgYW5kIGFkZCBmdW5jdGlvbiB3cmFwcGVycyBmb3IgYWxsIEFQSSBtZXRob2RzIHRoYXQgZG8gbm90aGluZyBidXQgY2FsbGluZyB0aGUgYmFzZSBtZXRob2Qgb24gdGhlIHBsYXllclxyXG4gICAgICAgIGxldCB3cmFwcGVyID0gPGFueT57fTtcclxuICAgICAgICBmb3IgKGxldCBtZW1iZXIgb2YgbWV0aG9kcykge1xyXG4gICAgICAgICAgICB3cmFwcGVyW21lbWJlcl0gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcImNhbGxlZCBcIiArIG1lbWJlcik7IC8vIHRyYWNrIG1ldGhvZCBjYWxscyBvbiB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKDxhbnk+cGxheWVyKVttZW1iZXJdLmFwcGx5KHBsYXllciwgYXJndW1lbnRzKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cGxpY2l0bHkgYWRkIGEgd3JhcHBlciBtZXRob2QgZm9yIFwiYWRkRXZlbnRIYW5kbGVyXCIgdGhhdCBhZGRzIGFkZGVkIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBldmVudCBsaXN0XHJcbiAgICAgICAgd3JhcHBlci5hZGRFdmVudEhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnRUeXBlOiBFVkVOVCwgY2FsbGJhY2s6IFBsYXllckV2ZW50Q2FsbGJhY2spOiBQbGF5ZXIge1xyXG4gICAgICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGV2ZW50VHlwZSwgY2FsbGJhY2spO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFzZWxmLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5ldmVudEhhbmRsZXJzW2V2ZW50VHlwZV0gPSBbXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZi5ldmVudEhhbmRsZXJzW2V2ZW50VHlwZV0ucHVzaChjYWxsYmFjayk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gd3JhcHBlcjtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBFeHBsaWNpdGx5IGFkZCBhIHdyYXBwZXIgbWV0aG9kIGZvciBcInJlbW92ZUV2ZW50SGFuZGxlclwiIHRoYXQgcmVtb3ZlcyByZW1vdmVkIGV2ZW50IGhhbmRsZXJzIGZyb20gdGhlIGV2ZW50IGxpc3RcclxuICAgICAgICB3cmFwcGVyLnJlbW92ZUV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChldmVudFR5cGU6IEVWRU5ULCBjYWxsYmFjazogUGxheWVyRXZlbnRDYWxsYmFjayk6IFBsYXllciB7XHJcbiAgICAgICAgICAgIHBsYXllci5yZW1vdmVFdmVudEhhbmRsZXIoZXZlbnRUeXBlLCBjYWxsYmFjayk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5ldmVudEhhbmRsZXJzW2V2ZW50VHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIEFycmF5VXRpbHMucmVtb3ZlKHNlbGYuZXZlbnRIYW5kbGVyc1tldmVudFR5cGVdLCBjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMud3JhcHBlciA9IDxQbGF5ZXI+d3JhcHBlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSB3cmFwcGVkIHBsYXllciBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCBvbiBwbGFjZSBvZiB0aGUgbm9ybWFsIHBsYXllciBvYmplY3QuXHJcbiAgICAgKiBAcmV0dXJucyB7UGxheWVyfSBhIHdyYXBwZWQgcGxheWVyXHJcbiAgICAgKi9cclxuICAgIGdldFBsYXllcigpOiBQbGF5ZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLndyYXBwZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgYWxsIHJlZ2lzdGVyZWQgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGUgcGxheWVyIHRoYXQgd2VyZSBhZGRlZCB0aHJvdWdoIHRoZSB3cmFwcGVkIHBsYXllci5cclxuICAgICAqL1xyXG4gICAgY2xlYXJFdmVudEhhbmRsZXJzKCk6IHZvaWQge1xyXG4gICAgICAgIGZvciAobGV0IGV2ZW50VHlwZSBpbiB0aGlzLmV2ZW50SGFuZGxlcnMpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgY2FsbGJhY2sgb2YgdGhpcy5ldmVudEhhbmRsZXJzW2V2ZW50VHlwZV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVyLnJlbW92ZUV2ZW50SGFuZGxlcihldmVudFR5cGUsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBBcnJheVV0aWxzIHtcclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBpdGVtIGZyb20gYW4gYXJyYXkuXHJcbiAgICAgKiBAcGFyYW0gYXJyYXkgdGhlIGFycmF5IHRoYXQgbWF5IGNvbnRhaW4gdGhlIGl0ZW0gdG8gcmVtb3ZlXHJcbiAgICAgKiBAcGFyYW0gaXRlbSB0aGUgaXRlbSB0byByZW1vdmUgZnJvbSB0aGUgYXJyYXlcclxuICAgICAqIEByZXR1cm5zIHthbnl9IHRoZSByZW1vdmVkIGl0ZW0gb3IgbnVsbCBpZiBpdCB3YXNuJ3QgcGFydCBvZiB0aGUgYXJyYXlcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZTxUPihhcnJheTogVFtdLCBpdGVtOiBUKTogVCB8IG51bGwge1xyXG4gICAgICAgIGxldCBpbmRleCA9IGFycmF5LmluZGV4T2YoaXRlbSk7XHJcblxyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhcnJheS5zcGxpY2UoaW5kZXgsIDEpWzBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IG5hbWVzcGFjZSBTdHJpbmdVdGlscyB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3JtYXRzIGEgbnVtYmVyIG9mIHNlY29uZHMgaW50byBhIHRpbWUgc3RyaW5nIHdpdGggdGhlIHBhdHRlcm4gaGg6bW06c3MuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHRvdGFsU2Vjb25kcyB0aGUgdG90YWwgbnVtYmVyIG9mIHNlY29uZHMgdG8gZm9ybWF0IHRvIHN0cmluZ1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIGZvcm1hdHRlZCB0aW1lIHN0cmluZ1xyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gc2Vjb25kc1RvVGltZSh0b3RhbFNlY29uZHM6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICAgICAgbGV0IGlzTmVnYXRpdmUgPSB0b3RhbFNlY29uZHMgPCAwO1xyXG5cclxuICAgICAgICBpZiAoaXNOZWdhdGl2ZSkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgdGltZSBpcyBuZWdhdGl2ZSwgd2UgbWFrZSBpdCBwb3NpdGl2ZSBmb3IgdGhlIGNhbGN1bGF0aW9uIGJlbG93XHJcbiAgICAgICAgICAgIC8vIChlbHNlIHdlJ2QgZ2V0IGFsbCBuZWdhdGl2ZSBudW1iZXJzKSBhbmQgcmVhdHRhY2ggdGhlIG5lZ2F0aXZlIHNpZ24gbGF0ZXIuXHJcbiAgICAgICAgICAgIHRvdGFsU2Vjb25kcyA9IC10b3RhbFNlY29uZHM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTcGxpdCBpbnRvIHNlcGFyYXRlIHRpbWUgcGFydHNcclxuICAgICAgICBsZXQgaG91cnMgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcyAvIDM2MDApO1xyXG4gICAgICAgIGxldCBtaW51dGVzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMgLyA2MCkgLSBob3VycyAqIDYwO1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gTWF0aC5mbG9vcih0b3RhbFNlY29uZHMpICUgNjA7XHJcblxyXG4gICAgICAgIHJldHVybiAoaXNOZWdhdGl2ZSA/IFwiLVwiIDogXCJcIikgKyBsZWZ0UGFkV2l0aFplcm9zKGhvdXJzLCAyKSArIFwiOlwiICsgbGVmdFBhZFdpdGhaZXJvcyhtaW51dGVzLCAyKSArIFwiOlwiICsgbGVmdFBhZFdpdGhaZXJvcyhzZWNvbmRzLCAyKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnZlcnRzIGEgbnVtYmVyIHRvIGEgc3RyaW5nIGFuZCBsZWZ0LXBhZHMgaXQgd2l0aCB6ZXJvcyB0byB0aGUgc3BlY2lmaWVkIGxlbmd0aC5cclxuICAgICAqIEV4YW1wbGU6IGxlZnRQYWRXaXRoWmVyb3MoMTIzLCA1KSA9PiBcIjAwMTIzXCJcclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbnVtIHRoZSBudW1iZXIgdG8gY29udmVydCB0byBzdHJpbmcgYW5kIHBhZCB3aXRoIHplcm9zXHJcbiAgICAgKiBAcGFyYW0gbGVuZ3RoIHRoZSBkZXNpcmVkIGxlbmd0aCBvZiB0aGUgcGFkZGVkIHN0cmluZ1xyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHBhZGRlZCBudW1iZXIgYXMgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGxlZnRQYWRXaXRoWmVyb3MobnVtOiBudW1iZXIsIGxlbmd0aDogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgdGV4dCA9IG51bSArIFwiXCI7XHJcbiAgICAgICAgbGV0IHBhZGRpbmcgPSBcIjAwMDAwMDAwMDBcIi5zdWJzdHIoMCwgbGVuZ3RoIC0gdGV4dC5sZW5ndGgpO1xyXG4gICAgICAgIHJldHVybiBwYWRkaW5nICsgdGV4dDtcclxuICAgIH1cclxufSJdfQ==

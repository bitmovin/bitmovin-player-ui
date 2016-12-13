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
        _super.prototype.configure.call(this, player, uimanager);
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
        _super.prototype.configure.call(this, player, uimanager);
        var self = this;
        var text = this.getConfig().text;
        var updateMessageHandler = function () {
            var remainingTime = Math.ceil(player.getDuration() - player.getCurrentTime());
            self.setText(text.replace("{remainingTime}", String(remainingTime)));
        };
        var adStartHandler = function () {
            self.setText("");
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
        _super.prototype.configure.call(this, player, uimanager);
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
            self.setText("");
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"./selectbox":24}],5:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"./selectbox":24}],6:[function(require,module,exports){
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
},{"../dom":39,"../eventdispatcher":40,"./component":10}],7:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
        _super.prototype.configure.call(this, player, uimanager);
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
        // Startup init
        castAvailableHander(); // Hide button if Cast not available
        if (player.isCasting()) {
            self.on();
        }
    };
    return CastToggleButton;
}(togglebutton_1.ToggleButton));
exports.CastToggleButton = CastToggleButton;
},{"./togglebutton":30}],9:[function(require,module,exports){
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
        var self = this;
        self.onShow.subscribe(function () {
            uimanager.onComponentShow.dispatch(self);
        });
        self.onHide.subscribe(function () {
            uimanager.onComponentHide.dispatch(self);
        });
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
},{"../dom":39,"../eventdispatcher":40,"../guid":41}],11:[function(require,module,exports){
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
},{"../dom":39,"../utils":45,"./component":10}],12:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"../timeout":43,"./container":11}],13:[function(require,module,exports){
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
var tvnoisecanvas_1 = require("./tvnoisecanvas");
/**
 * Overlays the player and displays error messages.
 */
var ErrorMessageOverlay = (function (_super) {
    __extends(ErrorMessageOverlay, _super);
    function ErrorMessageOverlay(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.errorLabel = new label_1.Label({ cssClass: "ui-errormessage-label" });
        _this.tvNoiseBackground = new tvnoisecanvas_1.TvNoiseCanvas();
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-errormessage-overlay",
            components: [_this.tvNoiseBackground, _this.errorLabel],
            hidden: true
        }, _this.config);
        return _this;
    }
    ErrorMessageOverlay.prototype.configure = function (player, uimanager) {
        _super.prototype.configure.call(this, player, uimanager);
        var self = this;
        player.addEventHandler(bitmovin.player.EVENT.ON_ERROR, function (event) {
            self.errorLabel.setText(event.message);
            self.tvNoiseBackground.start();
            self.show();
        });
    };
    return ErrorMessageOverlay;
}(container_1.Container));
exports.ErrorMessageOverlay = ErrorMessageOverlay;
},{"./container":11,"./label":16,"./tvnoisecanvas":31}],14:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
        // Startup init
        fullscreenStateHandler();
    };
    return FullscreenToggleButton;
}(togglebutton_1.ToggleButton));
exports.FullscreenToggleButton = FullscreenToggleButton;
},{"./togglebutton":30}],15:[function(require,module,exports){
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
},{"../dom":39,"./playbacktogglebutton":20}],16:[function(require,module,exports){
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
},{"../dom":39,"./component":10}],17:[function(require,module,exports){
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
            items: [],
            cssClass: "ui-listselector"
        }, _this.config);
        _this.items = _this.config.items;
        return _this;
    }
    ListSelector.prototype.getItemIndex = function (key) {
        for (var index in this.items) {
            if (key == this.items[index].key) {
                return parseInt(index);
            }
        }
        return -1;
    };
    /**
     * Checks if the specified item is part of this selector.
     * @param key the key of the item to check
     * @returns {boolean} true if the item is part of this selector, else false
     */
    ListSelector.prototype.hasItem = function (key) {
        return this.getItemIndex(key) > -1;
    };
    /**
     * Adds an item to this selector by appending it to the end of the list of items.
     * @param key the key  of the item to add
     * @param label the (human-readable) label of the item to add
     */
    ListSelector.prototype.addItem = function (key, label) {
        this.items.push({ key: key, label: label });
        this.onItemAddedEvent(key);
    };
    /**
     * Removes an item from this selector.
     * @param key the key of the item to remove
     * @returns {boolean} true if removal was successful, false if the item is not part of this selector
     */
    ListSelector.prototype.removeItem = function (key) {
        var index = this.getItemIndex(key);
        if (index > -1) {
            delete this.items[index];
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
        var index = this.getItemIndex(key);
        if (index > -1) {
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
        this.items = []; // clear items
        // fire events
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            this.onItemRemovedEvent(item.key);
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
},{"../eventdispatcher":40,"./component":10}],18:[function(require,module,exports){
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
 * A select box providing a selection of different playback speeds.
 */
var PlaybackSpeedSelectBox = (function (_super) {
    __extends(PlaybackSpeedSelectBox, _super);
    function PlaybackSpeedSelectBox(config) {
        if (config === void 0) { config = {}; }
        return _super.call(this, config) || this;
    }
    PlaybackSpeedSelectBox.prototype.configure = function (player, uimanager) {
        _super.prototype.configure.call(this, player, uimanager);
        var self = this;
        self.addItem("0.25", "0.25x");
        self.addItem("0.5", "0.5x");
        self.addItem("1", "Normal");
        self.addItem("1.5", "1.5x");
        self.addItem("2", "2x");
        self.selectItem("1");
        self.onItemSelected.subscribe(function (sender, value) {
            player.setPlaybackSpeed(parseFloat(value));
        });
    };
    return PlaybackSpeedSelectBox;
}(selectbox_1.SelectBox));
exports.PlaybackSpeedSelectBox = PlaybackSpeedSelectBox;
},{"./selectbox":24}],19:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"../utils":45,"./label":16}],20:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
            if (player.isCasting() && event &&
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
        // Startup init
        playbackStateHandler(null);
    };
    return PlaybackToggleButton;
}(togglebutton_1.ToggleButton));
exports.PlaybackToggleButton = PlaybackToggleButton;
},{"./togglebutton":30}],21:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"../dom":39,"../utils":45,"./component":10,"./container":11}],22:[function(require,module,exports){
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
    SeekBar.prototype.configure = function (player, uimanager, configureSeek) {
        if (configureSeek === void 0) { configureSeek = true; }
        _super.prototype.configure.call(this, player, uimanager);
        if (!configureSeek) {
            // The configureSeek flag can be used by subclasses to disable configuration as seek bar. E.g. the volume
            // slider is reusing this component but adds its own functionality, and does not need the seek functionality.
            // This is actually a hack, the proper solution would be for both seek bar and volume sliders to extend
            // a common base slider component and implement their functionality there.
            return;
        }
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
},{"../dom":39,"../eventdispatcher":40,"./component":10}],23:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"../utils":45,"./component":10,"./container":11,"./label":16}],24:[function(require,module,exports){
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
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            var optionElement = new dom_1.DOM("option", {
                "value": item.key
            }).html(item.label);
            if (item.key === selectedValue + "") {
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
},{"../dom":39,"./listselector":17}],25:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
            // Attach marker class to last visible item
            var lastShownItem = null;
            for (var _i = 0, _a = self.getItems(); _i < _a.length; _i++) {
                var component = _a[_i];
                component.getDomElement().removeClass(SettingsPanel.CLASS_LAST);
                if (component.isShown()) {
                    lastShownItem = component;
                }
            }
            if (lastShownItem) {
                lastShownItem.getDomElement().addClass(SettingsPanel.CLASS_LAST);
            }
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
SettingsPanel.CLASS_LAST = "last";
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
},{"../eventdispatcher":40,"../timeout":43,"./audioqualityselectbox":4,"./container":11,"./label":16,"./videoqualityselectbox":33}],26:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"./togglebutton":30}],27:[function(require,module,exports){
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
var controlbar_1 = require("./controlbar");
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
        _super.prototype.configure.call(this, player, uimanager);
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
        uimanager.onComponentShow.subscribe(function (component) {
            if (component instanceof controlbar_1.ControlBar) {
                self.getDomElement().addClass(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE);
            }
        });
        uimanager.onComponentHide.subscribe(function (component) {
            if (component instanceof controlbar_1.ControlBar) {
                self.getDomElement().removeClass(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE);
            }
        });
    };
    return SubtitleOverlay;
}(container_1.Container));
SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE = "controlbar-visible";
exports.SubtitleOverlay = SubtitleOverlay;
},{"./container":11,"./controlbar":12,"./label":16}],28:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"./selectbox":24}],29:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"../timeout":43,"./container":11,"./label":16}],30:[function(require,module,exports){
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
},{"../eventdispatcher":40,"./button":6}],31:[function(require,module,exports){
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
 * Animated analog TV static noise.
 */
var TvNoiseCanvas = (function (_super) {
    __extends(TvNoiseCanvas, _super);
    function TvNoiseCanvas(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.canvasWidth = 500;
        _this.canvasHeight = 280;
        _this.interferenceHeight = 100;
        _this.lastFrameUpdate = 0;
        _this.frameInterval = 60;
        _this.useAnimationFrame = !!window.requestAnimationFrame;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-tvnoisecanvas"
        }, _this.config);
        return _this;
    }
    TvNoiseCanvas.prototype.toDomElement = function () {
        return this.canvas = new dom_1.DOM("canvas", { "class": this.config.cssClass });
    };
    TvNoiseCanvas.prototype.start = function () {
        this.canvasElement = this.canvas.getElements()[0];
        this.canvasContext = this.canvasElement.getContext("2d");
        this.noiseAnimationWindowPos = -this.canvasHeight;
        this.lastFrameUpdate = 0;
        this.renderFrame();
    };
    TvNoiseCanvas.prototype.stop = function () {
        if (this.useAnimationFrame) {
            cancelAnimationFrame(this.frameUpdateHandlerId);
        }
        else {
            clearTimeout(this.frameUpdateHandlerId);
        }
    };
    TvNoiseCanvas.prototype.renderFrame = function () {
        // This code has been copied from the player controls.js and simplified
        if (this.lastFrameUpdate + this.frameInterval > new Date().getTime()) {
            // It's too early to render the next frame
            this.scheduleNextRender();
            return;
        }
        var currentPixelOffset;
        var canvasWidth = this.canvasWidth;
        var canvasHeight = this.canvasHeight;
        // Create texture
        var noiseImage = this.canvasContext.createImageData(canvasWidth, canvasHeight);
        // Fill texture with noise
        for (var y = 0; y < canvasHeight; y++) {
            for (var x = 0; x < canvasWidth; x++) {
                currentPixelOffset = (canvasWidth * y * 4) + x * 4;
                noiseImage.data[currentPixelOffset] = Math.random() * 255;
                if (y < this.noiseAnimationWindowPos || y > this.noiseAnimationWindowPos + this.interferenceHeight) {
                    noiseImage.data[currentPixelOffset] *= 0.85;
                }
                noiseImage.data[currentPixelOffset + 1] = noiseImage.data[currentPixelOffset];
                noiseImage.data[currentPixelOffset + 2] = noiseImage.data[currentPixelOffset];
                noiseImage.data[currentPixelOffset + 3] = 50;
            }
        }
        // Put texture onto canvas
        this.canvasContext.putImageData(noiseImage, 0, 0);
        this.lastFrameUpdate = new Date().getTime();
        this.noiseAnimationWindowPos += 7;
        if (this.noiseAnimationWindowPos > canvasHeight) {
            this.noiseAnimationWindowPos = -canvasHeight;
        }
        this.scheduleNextRender();
    };
    TvNoiseCanvas.prototype.scheduleNextRender = function () {
        if (this.useAnimationFrame) {
            this.frameUpdateHandlerId = window.requestAnimationFrame(this.renderFrame.bind(this));
        }
        else {
            this.frameUpdateHandlerId = setTimeout(this.renderFrame.bind(this), this.frameInterval);
        }
    };
    return TvNoiseCanvas;
}(component_1.Component));
exports.TvNoiseCanvas = TvNoiseCanvas;
},{"../dom":39,"./component":10}],32:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"../eventdispatcher":40,"./container":11}],33:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"./selectbox":24}],34:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"../timeout":43,"./container":11,"./volumeslider":35,"./volumetogglebutton":36}],35:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager, false);
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
},{"./seekbar":22}],36:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
        // Startup init
        muteStateHandler();
    };
    return VolumeToggleButton;
}(togglebutton_1.ToggleButton));
exports.VolumeToggleButton = VolumeToggleButton;
},{"./togglebutton":30}],37:[function(require,module,exports){
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
        _super.prototype.configure.call(this, player, uimanager);
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
},{"./togglebutton":30}],38:[function(require,module,exports){
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
},{"./clickoverlay":9}],39:[function(require,module,exports){
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
    Object.defineProperty(DOM.prototype, "length", {
        /**
         * Gets the number of elements that this DOM instance currently holds.
         * @returns {number} the number of elements
         */
        get: function () {
            return this.elements ? this.elements.length : 0;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets the HTML elements that this DOM instance currently holds.
     * @returns {HTMLElement[]} the raw HTML elements
     */
    DOM.prototype.getElements = function () {
        return this.elements;
    };
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
},{"./utils":45}],41:[function(require,module,exports){
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
var playbackspeedselectbox_1 = require("./components/playbackspeedselectbox");
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
        errormessageoverlay_1.ErrorMessageOverlay,
        playbackspeedselectbox_1.PlaybackSpeedSelectBox
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
},{"./components/adclickoverlay":1,"./components/admessagelabel":2,"./components/adskipbutton":3,"./components/audioqualityselectbox":4,"./components/audiotrackselectbox":5,"./components/button":6,"./components/caststatusoverlay":7,"./components/casttogglebutton":8,"./components/clickoverlay":9,"./components/component":10,"./components/container":11,"./components/controlbar":12,"./components/errormessageoverlay":13,"./components/fullscreentogglebutton":14,"./components/hugeplaybacktogglebutton":15,"./components/label":16,"./components/playbackspeedselectbox":18,"./components/playbacktimelabel":19,"./components/playbacktogglebutton":20,"./components/recommendationoverlay":21,"./components/seekbar":22,"./components/seekbarlabel":23,"./components/selectbox":24,"./components/settingspanel":25,"./components/settingstogglebutton":26,"./components/subtitleoverlay":27,"./components/subtitleselectbox":28,"./components/titlebar":29,"./components/togglebutton":30,"./components/uicontainer":32,"./components/videoqualityselectbox":33,"./components/volumecontrolbutton":34,"./components/volumetogglebutton":36,"./components/vrtogglebutton":37,"./components/watermark":38,"./uimanager":44}],43:[function(require,module,exports){
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
},{}],44:[function(require,module,exports){
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
var playbackspeedselectbox_1 = require("./components/playbackspeedselectbox");
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
            onSeeked: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fires when a component is showing.
             */
            onComponentShow: new eventdispatcher_1.EventDispatcher(),
            /**
             * Fires when a component is hiding.
             */
            onComponentHide: new eventdispatcher_1.EventDispatcher(),
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
    Object.defineProperty(UIManager.prototype, "onComponentShow", {
        get: function () {
            return this.events.onComponentShow;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UIManager.prototype, "onComponentHide", {
        get: function () {
            return this.events.onComponentHide;
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
                new settingspanel_1.SettingsPanelItem("Speed", new playbackspeedselectbox_1.PlaybackSpeedSelectBox()),
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
                    cssClasses: ["controlbar-top"]
                }),
                new container_1.Container({
                    components: [
                        new playbacktogglebutton_1.PlaybackToggleButton(),
                        new volumetogglebutton_1.VolumeToggleButton(),
                        new volumeslider_1.VolumeSlider(),
                        new component_1.Component({ cssClass: "spacer" }),
                        new casttogglebutton_1.CastToggleButton(),
                        new vrtogglebutton_1.VRToggleButton(),
                        new settingstogglebutton_1.SettingsToggleButton({ settingsPanel: settingsPanel }),
                        new fullscreentogglebutton_1.FullscreenToggleButton(),
                    ],
                    cssClasses: ["controlbar-bottom"]
                }),
            ]
        });
        var ui = new uicontainer_1.UIContainer({
            components: [
                new subtitleoverlay_1.SubtitleOverlay(),
                new caststatusoverlay_1.CastStatusOverlay(),
                new hugeplaybacktogglebutton_1.HugePlaybackToggleButton(),
                new recommendationoverlay_1.RecommendationOverlay(),
                controlBar,
                new titlebar_1.TitleBar(),
                new errormessageoverlay_1.ErrorMessageOverlay(),
                new watermark_1.Watermark()
            ], cssClasses: ["ui-skin-modern"]
        });
        var adsUi = new uicontainer_1.UIContainer({
            components: [
                new adclickoverlay_1.AdClickOverlay(),
                new container_1.Container({
                    components: [
                        new admessagelabel_1.AdMessageLabel({ text: "Ad: {remainingTime} secs" }),
                        new adskipbutton_1.AdSkipButton()
                    ],
                    cssClass: "ui-ads-status"
                }),
                new controlbar_1.ControlBar({
                    components: [
                        new container_1.Container({
                            components: [
                                new playbacktogglebutton_1.PlaybackToggleButton(),
                                new volumetogglebutton_1.VolumeToggleButton(),
                                new volumeslider_1.VolumeSlider(),
                                new component_1.Component({ cssClass: "spacer" }),
                                new fullscreentogglebutton_1.FullscreenToggleButton(),
                            ],
                            cssClasses: ["controlbar-bottom"]
                        }),
                    ]
                })
            ], cssClasses: ["ui-skin-modern ads"]
        });
        return new UIManager(player, ui, adsUi, config);
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
},{"./components/adclickoverlay":1,"./components/admessagelabel":2,"./components/adskipbutton":3,"./components/audioqualityselectbox":4,"./components/audiotrackselectbox":5,"./components/caststatusoverlay":7,"./components/casttogglebutton":8,"./components/component":10,"./components/container":11,"./components/controlbar":12,"./components/errormessageoverlay":13,"./components/fullscreentogglebutton":14,"./components/hugeplaybacktogglebutton":15,"./components/playbackspeedselectbox":18,"./components/playbacktimelabel":19,"./components/playbacktogglebutton":20,"./components/recommendationoverlay":21,"./components/seekbar":22,"./components/seekbarlabel":23,"./components/settingspanel":25,"./components/settingstogglebutton":26,"./components/subtitleoverlay":27,"./components/subtitleselectbox":28,"./components/titlebar":29,"./components/uicontainer":32,"./components/videoqualityselectbox":33,"./components/volumecontrolbutton":34,"./components/volumeslider":35,"./components/volumetogglebutton":36,"./components/vrtogglebutton":37,"./components/watermark":38,"./dom":39,"./eventdispatcher":40,"./utils":45}],45:[function(require,module,exports){
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
},{}]},{},[42])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvY29tcG9uZW50cy9hZGNsaWNrb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL2FkbWVzc2FnZWxhYmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYWRza2lwYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYXVkaW9xdWFsaXR5c2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYXVkaW90cmFja3NlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL2J1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2Nhc3RzdGF0dXNvdmVybGF5LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvY2FzdHRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2NsaWNrb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL2NvbXBvbmVudC50cyIsInNyYy90cy9jb21wb25lbnRzL2NvbnRhaW5lci50cyIsInNyYy90cy9jb21wb25lbnRzL2NvbnRyb2xiYXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy9lcnJvcm1lc3NhZ2VvdmVybGF5LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2h1Z2VwbGF5YmFja3RvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL2xhYmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvbGlzdHNlbGVjdG9yLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvcGxheWJhY2tzcGVlZHNlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3BsYXliYWNrdGltZWxhYmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvcGxheWJhY2t0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy9yZWNvbW1lbmRhdGlvbm92ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZWVrYmFyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc2Vla2JhcmxhYmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc2V0dGluZ3NwYW5lbC50cyIsInNyYy90cy9jb21wb25lbnRzL3NldHRpbmdzdG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc3VidGl0bGVvdmVybGF5LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc3VidGl0bGVzZWxlY3Rib3gudHMiLCJzcmMvdHMvY29tcG9uZW50cy90aXRsZWJhci50cyIsInNyYy90cy9jb21wb25lbnRzL3RvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3R2bm9pc2VjYW52YXMudHMiLCJzcmMvdHMvY29tcG9uZW50cy91aWNvbnRhaW5lci50cyIsInNyYy90cy9jb21wb25lbnRzL3ZpZGVvcXVhbGl0eXNlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3ZvbHVtZWNvbnRyb2xidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy92b2x1bWVzbGlkZXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy92b2x1bWV0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy92cnRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3dhdGVybWFyay50cyIsInNyYy90cy9kb20udHMiLCJzcmMvdHMvZXZlbnRkaXNwYXRjaGVyLnRzIiwic3JjL3RzL2d1aWQudHMiLCJzcmMvdHMvbWFpbi50cyIsInNyYy90cy90aW1lb3V0LnRzIiwic3JjL3RzL3VpbWFuYWdlci50cyIsInNyYy90cy91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7Ozs7O0dBT0c7Ozs7Ozs7QUFFSCwrQ0FBNEM7QUFHNUM7O0dBRUc7QUFDSDtJQUFvQyxrQ0FBWTtJQUFoRDs7SUFzQkEsQ0FBQztJQXBCRyxrQ0FBUyxHQUFULFVBQVUsTUFB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QVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0QsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDMUIsQ0FBQztBQUNMLENBQUMsRUF0Q2dCLFdBQVcsR0FBWCxtQkFBVyxLQUFYLG1CQUFXLFFBc0MzQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q2xpY2tPdmVybGF5fSBmcm9tIFwiLi9jbGlja292ZXJsYXlcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSBjbGljayBjYXB0dXJlIG92ZXJsYXkgZm9yIGNsaWNrVGhyb3VnaFVybHMgb2YgYWRzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEFkQ2xpY2tPdmVybGF5IGV4dGVuZHMgQ2xpY2tPdmVybGF5IHtcclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfU1RBUlRFRCwgZnVuY3Rpb24gKGV2ZW50OiBiaXRtb3Zpbi5wbGF5ZXIuQWRTdGFydGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRVcmwoZXZlbnQuY2xpY2tUaHJvdWdoVXJsKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYXIgY2xpY2stdGhyb3VnaCBVUkwgd2hlbiBhZCBoYXMgZmluaXNoZWRcclxuICAgICAgICBsZXQgYWRGaW5pc2hlZEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0VXJsKG51bGwpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfRklOSVNIRUQsIGFkRmluaXNoZWRIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9TS0lQUEVELCBhZEZpbmlzaGVkSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBsYWJlbCB0aGF0IGRpc3BsYXlzIGEgbWVzc2FnZSBhYm91dCBhIHJ1bm5pbmcgYWQsIG9wdGlvbmFsbHkgd2l0aCBhIGNvdW50ZG93bi5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBZE1lc3NhZ2VMYWJlbCBleHRlbmRzIExhYmVsPExhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1sYWJlbC1hZC1tZXNzYWdlXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiVGhpcyBhZCB3aWxsIGVuZCBpbiB7cmVtYWluaW5nVGltZX0gc2Vjb25kcy5cIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0Q29uZmlnKCkudGV4dDtcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZU1lc3NhZ2VIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgcmVtYWluaW5nVGltZSA9IE1hdGguY2VpbChwbGF5ZXIuZ2V0RHVyYXRpb24oKSAtIHBsYXllci5nZXRDdXJyZW50VGltZSgpKTtcclxuICAgICAgICAgICAgc2VsZi5zZXRUZXh0KHRleHQucmVwbGFjZShcIntyZW1haW5pbmdUaW1lfVwiLCBTdHJpbmcocmVtYWluaW5nVGltZSkpKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYWRTdGFydEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0VGV4dChcIlwiKTtcclxuICAgICAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9DSEFOR0VELCB1cGRhdGVNZXNzYWdlSGFuZGxlcik7XHJcbiAgICAgICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfVElNRV9VUERBVEUsIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYWRFbmRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICAgICAgcGxheWVyLnJlbW92ZUV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURSwgdXBkYXRlTWVzc2FnZUhhbmRsZXIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX1NUQVJURUQsIGFkU3RhcnRIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9TS0lQUEVELCBhZEVuZEhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX0ZJTklTSEVELCBhZEVuZEhhbmRsZXIpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0J1dHRvbkNvbmZpZywgQnV0dG9ufSBmcm9tIFwiLi9idXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFNraXBNZXNzYWdlID0gYml0bW92aW4ucGxheWVyLlNraXBNZXNzYWdlO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIEFkU2tpcEJ1dHRvbn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEFkU2tpcEJ1dHRvbkNvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZyB7XHJcbiAgICBza2lwTWVzc2FnZT86IHtcclxuICAgICAgICBjb3VudGRvd246IHN0cmluZztcclxuICAgICAgICBza2lwOiBzdHJpbmc7XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCBpcyBkaXNwbGF5ZWQgZHVyaW5nIGFkcyBhbmQgY2FuIGJlIHVzZWQgdG8gc2tpcCB0aGUgYWQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQWRTa2lwQnV0dG9uIGV4dGVuZHMgQnV0dG9uPEFkU2tpcEJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQWRTa2lwQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCA8QWRTa2lwQnV0dG9uQ29uZmlnPntcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktYnV0dG9uLWFkLXNraXBcIixcclxuICAgICAgICAgICAgc2tpcE1lc3NhZ2U6IHtcclxuICAgICAgICAgICAgICAgIGNvdW50ZG93bjogXCJTa2lwIGFkIGluIHtyZW1haW5pbmdTa2lwV2FpdFRpbWV9XCIsXHJcbiAgICAgICAgICAgICAgICBza2lwOiBcIlNraXAgYWRcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjb25maWcgPSA8QWRTa2lwQnV0dG9uQ29uZmlnPnRoaXMuZ2V0Q29uZmlnKCk7IC8vIFRPRE8gZ2V0IHJpZCBvZiBnZW5lcmljIGNhc3RcclxuICAgICAgICBsZXQgYWRFdmVudCA9IDxiaXRtb3Zpbi5wbGF5ZXIuQWRTdGFydGVkRXZlbnQ+bnVsbDtcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZVNraXBNZXNzYWdlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gRGlzcGxheSB0aGlzIGJ1dHRvbiBvbmx5IGlmIGFkIGlzIHNraXBwYWJsZVxyXG4gICAgICAgICAgICBpZiAoYWRFdmVudC5za2lwT2Zmc2V0KSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHNraXAgbWVzc2FnZSBvbiB0aGUgYnV0dG9uXHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSA8IGFkRXZlbnQuc2tpcE9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlbWFpbmluZ1NraXBXYWl0VGltZSA9IE1hdGguY2VpbChhZEV2ZW50LnNraXBPZmZzZXQgLSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRleHQoY29uZmlnLnNraXBNZXNzYWdlLmNvdW50ZG93bi5yZXBsYWNlKFwie3JlbWFpbmluZ1NraXBXYWl0VGltZX1cIiwgU3RyaW5nKHJlbWFpbmluZ1NraXBXYWl0VGltZSkpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGV4dChjb25maWcuc2tpcE1lc3NhZ2Uuc2tpcCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYWRTdGFydEhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGJpdG1vdmluLnBsYXllci5BZFN0YXJ0ZWRFdmVudCkge1xyXG4gICAgICAgICAgICBhZEV2ZW50ID0gZXZlbnQ7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0VGV4dChcIlwiKTtcclxuXHJcbiAgICAgICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgdXBkYXRlU2tpcE1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURSwgdXBkYXRlU2tpcE1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYWRFbmRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHVwZGF0ZVNraXBNZXNzYWdlSGFuZGxlcik7XHJcbiAgICAgICAgICAgIHBsYXllci5yZW1vdmVFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfVElNRV9VUERBVEUsIHVwZGF0ZVNraXBNZXNzYWdlSGFuZGxlcik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfU1RBUlRFRCwgYWRTdGFydEhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX1NLSVBQRUQsIGFkRW5kSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfRklOSVNIRUQsIGFkRW5kSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBUcnkgdG8gc2tpcCB0aGUgYWQgKHRoaXMgb25seSB3b3JrcyBpZiBpdCBpcyBza2lwcGFibGUgc28gd2UgZG9uJ3QgbmVlZCB0byB0YWtlIGV4dHJhIGNhcmUgb2YgdGhhdCBoZXJlKVxyXG4gICAgICAgICAgICBwbGF5ZXIuc2tpcEFkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9zZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtMaXN0U2VsZWN0b3JDb25maWd9IGZyb20gXCIuL2xpc3RzZWxlY3RvclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEEgc2VsZWN0IGJveCBwcm92aWRpbmcgYSBzZWxlY3Rpb24gYmV0d2VlbiBcImF1dG9cIiBhbmQgdGhlIGF2YWlsYWJsZSBhdWRpbyBxdWFsaXRpZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQXVkaW9RdWFsaXR5U2VsZWN0Qm94IGV4dGVuZHMgU2VsZWN0Qm94IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZUF1ZGlvUXVhbGl0aWVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgYXVkaW9RdWFsaXRpZXMgPSBwbGF5ZXIuZ2V0QXZhaWxhYmxlQXVkaW9RdWFsaXRpZXMoKTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuY2xlYXJJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGVudHJ5IGZvciBhdXRvbWF0aWMgcXVhbGl0eSBzd2l0Y2hpbmcgKGRlZmF1bHQgc2V0dGluZylcclxuICAgICAgICAgICAgc2VsZi5hZGRJdGVtKFwiYXV0b1wiLCBcImF1dG9cIik7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgYXVkaW8gcXVhbGl0aWVzXHJcbiAgICAgICAgICAgIGZvciAobGV0IGF1ZGlvUXVhbGl0eSBvZiBhdWRpb1F1YWxpdGllcykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5hZGRJdGVtKGF1ZGlvUXVhbGl0eS5pZCwgYXVkaW9RdWFsaXR5LmxhYmVsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlbGYub25JdGVtU2VsZWN0ZWQuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IEF1ZGlvUXVhbGl0eVNlbGVjdEJveCwgdmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0QXVkaW9RdWFsaXR5KHZhbHVlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQVVESU9fQ0hBTkdFLCB1cGRhdGVBdWRpb1F1YWxpdGllcyk7IC8vIFVwZGF0ZSBxdWFsaXRpZXMgd2hlbiBhdWRpbyB0cmFjayBoYXMgY2hhbmdlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlQXVkaW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB1cGRhdGVBdWRpb1F1YWxpdGllcyk7IC8vIFVwZGF0ZSBxdWFsaXRpZXMgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQVVESU9fRE9XTkxPQURfUVVBTElUWV9DSEFOR0UsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBwbGF5ZXIuZ2V0RG93bmxvYWRlZEF1ZGlvRGF0YSgpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oZGF0YS5pc0F1dG8gPyBcImF1dG9cIiA6IGRhdGEuaWQpO1xyXG4gICAgICAgIH0pOyAvLyBVcGRhdGUgcXVhbGl0eSBzZWxlY3Rpb24gd2hlbiBxdWFsaXR5IGlzIGNoYW5nZWQgKGZyb20gb3V0c2lkZSlcclxuXHJcbiAgICAgICAgLy8gUG9wdWxhdGUgcXVhbGl0aWVzIGF0IHN0YXJ0dXBcclxuICAgICAgICB1cGRhdGVBdWRpb1F1YWxpdGllcygpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gYXZhaWxhYmxlIGF1ZGlvIHRyYWNrcyAoZS5nLiBkaWZmZXJlbnQgbGFuZ3VhZ2VzKS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBdWRpb1RyYWNrU2VsZWN0Qm94IGV4dGVuZHMgU2VsZWN0Qm94IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZUF1ZGlvVHJhY2tzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgYXVkaW9UcmFja3MgPSBwbGF5ZXIuZ2V0QXZhaWxhYmxlQXVkaW8oKTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuY2xlYXJJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGF1ZGlvIHRyYWNrc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdWRpb1RyYWNrIG9mIGF1ZGlvVHJhY2tzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZEl0ZW0oYXVkaW9UcmFjay5pZCwgYXVkaW9UcmFjay5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBBdWRpb1RyYWNrU2VsZWN0Qm94LCB2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRBdWRpbyh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBhdWRpb1RyYWNrSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRBdWRpb1RyYWNrID0gcGxheWVyLmdldEF1ZGlvKCk7XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0SXRlbShjdXJyZW50QXVkaW9UcmFjay5pZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQVVESU9fQ0hBTkdFLCBhdWRpb1RyYWNrSGFuZGxlcik7IC8vIFVwZGF0ZSBzZWxlY3Rpb24gd2hlbiBzZWxlY3RlZCB0cmFjayBoYXMgY2hhbmdlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlQXVkaW9UcmFja3MpOyAvLyBVcGRhdGUgdHJhY2tzIHdoZW4gc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB1cGRhdGVBdWRpb1RyYWNrcyk7IC8vIFVwZGF0ZSB0cmFja3Mgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHRyYWNrcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlQXVkaW9UcmFja3MoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb21wb25lbnRDb25maWcsIENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcbmltcG9ydCB7RXZlbnREaXNwYXRjaGVyLCBOb0FyZ3MsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIEJ1dHRvbn0gY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBCdXR0b25Db25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGV4dCBvbiB0aGUgYnV0dG9uLlxyXG4gICAgICovXHJcbiAgICB0ZXh0Pzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogQSBzaW1wbGUgY2xpY2thYmxlIGJ1dHRvbi5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBCdXR0b248Q29uZmlnIGV4dGVuZHMgQnV0dG9uQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGJ1dHRvbkV2ZW50cyA9IHtcclxuICAgICAgICBvbkNsaWNrOiBuZXcgRXZlbnREaXNwYXRjaGVyPEJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBCdXR0b25Db25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWJ1dHRvblwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgd2l0aCB0aGUgdGV4dCBsYWJlbFxyXG4gICAgICAgIGxldCBidXR0b25FbGVtZW50ID0gbmV3IERPTShcImJ1dHRvblwiLCB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImJ1dHRvblwiLFxyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSkuYXBwZW5kKG5ldyBET00oXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImxhYmVsXCJcclxuICAgICAgICB9KS5odG1sKHRoaXMuY29uZmlnLnRleHQpKTtcclxuXHJcbiAgICAgICAgLy8gTGlzdGVuIGZvciB0aGUgY2xpY2sgZXZlbnQgb24gdGhlIGJ1dHRvbiBlbGVtZW50IGFuZCB0cmlnZ2VyIHRoZSBjb3JyZXNwb25kaW5nIGV2ZW50IG9uIHRoZSBidXR0b24gY29tcG9uZW50XHJcbiAgICAgICAgYnV0dG9uRWxlbWVudC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vbkNsaWNrRXZlbnQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRleHQgb24gdGhlIGxhYmVsIG9mIHRoZSBidXR0b24uXHJcbiAgICAgKiBAcGFyYW0gdGV4dCB0aGUgdGV4dCB0byBwdXQgaW50byB0aGUgbGFiZWwgb2YgdGhlIGJ1dHRvblxyXG4gICAgICovXHJcbiAgICBzZXRUZXh0KHRleHQ6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmZpbmQoXCIubGFiZWxcIikuaHRtbCh0ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25DbGlja0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRXZlbnRzLm9uQ2xpY2suZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbkNsaWNrKCk6IEV2ZW50PEJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5idXR0b25FdmVudHMub25DbGljay5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBDYXN0V2FpdGluZ0ZvckRldmljZUV2ZW50ID0gYml0bW92aW4ucGxheWVyLkNhc3RXYWl0aW5nRm9yRGV2aWNlRXZlbnQ7XHJcbmltcG9ydCBDYXN0TGF1bmNoZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5DYXN0TGF1bmNoZWRFdmVudDtcclxuaW1wb3J0IENhc3RTdG9wcGVkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuQ2FzdFN0b3BwZWRFdmVudDtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIGFuZCBkaXNwbGF5cyB0aGUgc3RhdHVzIG9mIGEgQ2FzdCBzZXNzaW9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENhc3RTdGF0dXNPdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdHVzTGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXNMYWJlbCA9IG5ldyBMYWJlbDxMYWJlbENvbmZpZz4oe2Nzc0NsYXNzOiBcInVpLWNhc3Qtc3RhdHVzLWxhYmVsXCJ9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1jYXN0LXN0YXR1cy1vdmVybGF5XCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnN0YXR1c0xhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjYXN0RGV2aWNlTmFtZSA9IFwidW5rbm93blwiO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJULCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gU2hvdyBDYXN0IHN0YXR1cyB3aGVuIGEgc2Vzc2lvbiBpcyBiZWluZyBzdGFydGVkXHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICBzZWxmLnN0YXR1c0xhYmVsLnNldFRleHQoXCJTZWxlY3QgYSBDYXN0IGRldmljZVwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1dBSVRJTkdfRk9SX0RFVklDRSwgZnVuY3Rpb24gKGV2ZW50OiBDYXN0V2FpdGluZ0ZvckRldmljZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIEdldCBkZXZpY2UgbmFtZSBhbmQgdXBkYXRlIHN0YXR1cyB0ZXh0IHdoaWxlIGNvbm5lY3RpbmdcclxuICAgICAgICAgICAgY2FzdERldmljZU5hbWUgPSBldmVudC5jYXN0UGF5bG9hZC5kZXZpY2VOYW1lO1xyXG4gICAgICAgICAgICBzZWxmLnN0YXR1c0xhYmVsLnNldFRleHQoYENvbm5lY3RpbmcgdG8gPHN0cm9uZz4ke2Nhc3REZXZpY2VOYW1lfTwvc3Ryb25nPi4uLmApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfTEFVTkNIRUQsIGZ1bmN0aW9uIChldmVudDogQ2FzdExhdW5jaGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gU2Vzc2lvbiBpcyBzdGFydGVkIG9yIHJlc3VtZWRcclxuICAgICAgICAgICAgLy8gRm9yIGNhc2VzIHdoZW4gYSBzZXNzaW9uIGlzIHJlc3VtZWQsIHdlIGRvIG5vdCByZWNlaXZlIHRoZSBwcmV2aW91cyBldmVudHMgYW5kIHRoZXJlZm9yZSBzaG93IHRoZSBzdGF0dXMgcGFuZWwgaGVyZSB0b29cclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhdHVzTGFiZWwuc2V0VGV4dChgUGxheWluZyBvbiA8c3Ryb25nPiR7Y2FzdERldmljZU5hbWV9PC9zdHJvbmc+YCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9TVE9QLCBmdW5jdGlvbiAoZXZlbnQ6IENhc3RTdG9wcGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gQ2FzdCBzZXNzaW9uIGdvbmUsIGhpZGUgdGhlIHN0YXR1cyBwYW5lbFxyXG4gICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCB0b2dnbGVzIGNhc3RpbmcgdG8gYSBDYXN0IHJlY2VpdmVyLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENhc3RUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY2FzdHRvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIkdvb2dsZSBDYXN0XCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzQ2FzdEF2YWlsYWJsZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlzQ2FzdGluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmNhc3RTdG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5jYXN0VmlkZW8oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ2FzdCB1bmF2YWlsYWJsZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgY2FzdEF2YWlsYWJsZUhhbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Nhc3RBdmFpbGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfQVZBSUxBQkxFLCBjYXN0QXZhaWxhYmxlSGFuZGVyKTtcclxuXHJcbiAgICAgICAgLy8gVG9nZ2xlIGJ1dHRvbiBcIm9uXCIgc3RhdGVcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJULCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUT1AsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU3RhcnR1cCBpbml0XHJcbiAgICAgICAgY2FzdEF2YWlsYWJsZUhhbmRlcigpOyAvLyBIaWRlIGJ1dHRvbiBpZiBDYXN0IG5vdCBhdmFpbGFibGVcclxuICAgICAgICBpZiAocGxheWVyLmlzQ2FzdGluZygpKSB7XHJcbiAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7QnV0dG9uLCBCdXR0b25Db25maWd9IGZyb20gXCIuL2J1dHRvblwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBDbGlja092ZXJsYXl9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDbGlja092ZXJsYXlDb25maWcgZXh0ZW5kcyBCdXR0b25Db25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdXJsIHRvIG9wZW4gd2hlbiB0aGUgb3ZlcmxheSBpcyBjbGlja2VkLiBTZXQgdG8gbnVsbCB0byBkaXNhYmxlIHRoZSBjbGljayBoYW5kbGVyLlxyXG4gICAgICovXHJcbiAgICB1cmw/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGNsaWNrIG92ZXJsYXkgdGhhdCBvcGVucyBhbiB1cmwgaW4gYSBuZXcgdGFiIGlmIGNsaWNrZWQuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2xpY2tPdmVybGF5IGV4dGVuZHMgQnV0dG9uPENsaWNrT3ZlcmxheUNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ2xpY2tPdmVybGF5Q29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWNsaWNrb3ZlcmxheVwiXHJcbiAgICAgICAgfSwgPENsaWNrT3ZlcmxheUNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VXJsKCg8Q2xpY2tPdmVybGF5Q29uZmlnPnRoaXMuY29uZmlnKS51cmwpO1xyXG4gICAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5nZXREb21FbGVtZW50KCk7XHJcbiAgICAgICAgZWxlbWVudC5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuZGF0YShcInVybFwiKSkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93Lm9wZW4oZWxlbWVudC5kYXRhKFwidXJsXCIpLCBcIl9ibGFua1wiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgVVJMIHRoYXQgc2hvdWxkIGJlIGZvbGxvd2VkIHdoZW4gdGhlIHdhdGVybWFyayBpcyBjbGlja2VkLlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ30gdGhlIHdhdGVybWFyayBVUkxcclxuICAgICAqL1xyXG4gICAgZ2V0VXJsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmRhdGEoXCJ1cmxcIik7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0VXJsKHVybDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHVybCA9PT0gdW5kZWZpbmVkIHx8IHVybCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHVybCA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmRhdGEoXCJ1cmxcIiwgdXJsKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtHdWlkfSBmcm9tIFwiLi4vZ3VpZFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgTm9BcmdzLCBFdmVudH0gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgY29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEgY29tcG9uZW50LlxyXG4gKiBTaG91bGQgYmUgZXh0ZW5kZWQgYnkgY29tcG9uZW50cyB0aGF0IHdhbnQgdG8gYWRkIGFkZGl0aW9uYWwgY29uZmlndXJhdGlvbiBvcHRpb25zLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSFRNTCB0YWcgbmFtZSBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICogRGVmYXVsdDogXCJkaXZcIlxyXG4gICAgICovXHJcbiAgICB0YWc/OiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBIVE1MIElEIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKiBEZWZhdWx0OiBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCB3aXRoIHBhdHRlcm4gXCJ1aS1pZC17Z3VpZH1cIi5cclxuICAgICAqL1xyXG4gICAgaWQ/OiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgQ1NTIGNsYXNzZXMgb2YgdGhlIGNvbXBvbmVudC4gVGhpcyBpcyB1c3VhbGx5IHRoZSBjbGFzcyBmcm9tIHdoZXJlIHRoZSBjb21wb25lbnQgdGFrZXMgaXRzIHN0eWxpbmcuXHJcbiAgICAgKi9cclxuICAgIGNzc0NsYXNzPzogc3RyaW5nOyAvLyBcImNsYXNzXCIgaXMgYSByZXNlcnZlZCBrZXl3b3JkLCBzbyB3ZSBuZWVkIHRvIG1ha2UgdGhlIG5hbWUgbW9yZSBjb21wbGljYXRlZFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkaXRpb25hbCBDU1MgY2xhc3NlcyBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBjc3NDbGFzc2VzPzogc3RyaW5nW107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZpZXMgaWYgdGhlIGNvbXBvbmVudCBzaG91bGQgYmUgaGlkZGVuIGF0IHN0YXJ0dXAuXHJcbiAgICAgKiBEZWZhdWx0OiBmYWxzZVxyXG4gICAgICovXHJcbiAgICBoaWRkZW4/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogVGhlIGJhc2UgY2xhc3Mgb2YgdGhlIFVJIGZyYW1ld29yay5cclxuICogRWFjaCBjb21wb25lbnQgbXVzdCBleHRlbmQgdGhpcyBjbGFzcyBhbmQgb3B0aW9uYWxseSB0aGUgY29uZmlnIGludGVyZmFjZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb21wb25lbnQ8Q29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY2xhc3NuYW1lIHRoYXQgaXMgYXR0YWNoZWQgdG8gdGhlIGVsZW1lbnQgd2hlbiBpdCBpcyBpbiB0aGUgaGlkZGVuIHN0YXRlLlxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ0xBU1NfSElEREVOID0gXCJoaWRkZW5cIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbmZpZ3VyYXRpb24gb2JqZWN0IG9mIHRoaXMgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgY29uZmlnOiBDb25maWc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgY29tcG9uZW50J3MgRE9NIGVsZW1lbnQuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZWxlbWVudDogRE9NO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmxhZyB0aGF0IGtlZXBzIHRyYWNrIG9mIHRoZSBoaWRkZW4gc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaGlkZGVuOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxpc3Qgb2YgZXZlbnRzIHRoYXQgdGhpcyBjb21wb25lbnQgb2ZmZXJzLiBUaGVzZSBldmVudHMgc2hvdWxkIGFsd2F5cyBiZSBwcml2YXRlIGFuZCBvbmx5IGRpcmVjdGx5XHJcbiAgICAgKiBhY2Nlc3NlZCBmcm9tIHdpdGhpbiB0aGUgaW1wbGVtZW50aW5nIGNvbXBvbmVudC5cclxuICAgICAqXHJcbiAgICAgKiBCZWNhdXNlIFR5cGVTY3JpcHQgZG9lcyBub3Qgc3VwcG9ydCBwcml2YXRlIHByb3BlcnRpZXMgd2l0aCB0aGUgc2FtZSBuYW1lIG9uIGRpZmZlcmVudCBjbGFzcyBoaWVyYXJjaHkgbGV2ZWxzXHJcbiAgICAgKiAoaS5lLiBzdXBlcmNsYXNzIGFuZCBzdWJjbGFzcyBjYW5ub3QgY29udGFpbiBhIHByaXZhdGUgcHJvcGVydHkgd2l0aCB0aGUgc2FtZSBuYW1lKSwgdGhlIGRlZmF1bHQgbmFtaW5nXHJcbiAgICAgKiBjb252ZW50aW9uIGZvciB0aGUgZXZlbnQgbGlzdCBvZiBhIGNvbXBvbmVudCB0aGF0IHNob3VsZCBiZSBmb2xsb3dlZCBieSBzdWJjbGFzc2VzIGlzIHRoZSBjb25jYXRlbmF0aW9uIG9mIHRoZVxyXG4gICAgICogY2FtZWwtY2FzZWQgY2xhc3MgbmFtZSArIFwiRXZlbnRzXCIgKGUuZy4gU3ViQ2xhc3MgZXh0ZW5kcyBDb21wb25lbnQgPT4gc3ViQ2xhc3NFdmVudHMpLlxyXG4gICAgICogU2VlIHtAbGluayAjY29tcG9uZW50RXZlbnRzfSBmb3IgYW4gZXhhbXBsZS5cclxuICAgICAqXHJcbiAgICAgKiBFdmVudCBwcm9wZXJ0aWVzIHNob3VsZCBiZSBuYW1lZCBpbiBjYW1lbCBjYXNlIHdpdGggYW4gXCJvblwiIHByZWZpeCBhbmQgaW4gdGhlIHByZXNlbnQgdGVuc2UuIEFzeW5jIGV2ZW50cyBtYXlcclxuICAgICAqIGhhdmUgYSBzdGFydCBldmVudCAod2hlbiB0aGUgb3BlcmF0aW9uIHN0YXJ0cykgaW4gdGhlIHByZXNlbnQgdGVuc2UsIGFuZCBtdXN0IGhhdmUgYW4gZW5kIGV2ZW50ICh3aGVuIHRoZVxyXG4gICAgICogb3BlcmF0aW9uIGVuZHMpIGluIHRoZSBwYXN0IHRlbnNlIChvciBwcmVzZW50IHRlbnNlIGluIHNwZWNpYWwgY2FzZXMgKGUuZy4gb25TdGFydC9vblN0YXJ0ZWQgb3Igb25QbGF5L29uUGxheWluZykuXHJcbiAgICAgKiBTZWUge0BsaW5rICNjb21wb25lbnRFdmVudHMjb25TaG93fSBmb3IgYW4gZXhhbXBsZS5cclxuICAgICAqXHJcbiAgICAgKiBFYWNoIGV2ZW50IHNob3VsZCBiZSBhY2NvbXBhbmllZCB3aXRoIGEgcHJvdGVjdGVkIG1ldGhvZCBuYW1lZCBieSB0aGUgY29udmVudGlvbiBldmVudE5hbWUgKyBcIkV2ZW50XCJcclxuICAgICAqIChlLmcuIG9uU3RhcnRFdmVudCksIHRoYXQgYWN0dWFsbHkgdHJpZ2dlcnMgdGhlIGV2ZW50IGJ5IGNhbGxpbmcge0BsaW5rIEV2ZW50RGlzcGF0Y2hlciNkaXNwYXRjaCBkaXNwYXRjaH0gYW5kXHJcbiAgICAgKiBwYXNzaW5nIGEgcmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQgYXMgZmlyc3QgcGFyYW1ldGVyLiBDb21wb25lbnRzIHNob3VsZCBhbHdheXMgdHJpZ2dlciB0aGVpciBldmVudHMgd2l0aCB0aGVzZVxyXG4gICAgICogbWV0aG9kcy4gSW1wbGVtZW50aW5nIHRoaXMgcGF0dGVybiBnaXZlcyBzdWJjbGFzc2VzIG1lYW5zIHRvIGRpcmVjdGx5IGxpc3RlbiB0byB0aGUgZXZlbnRzIGJ5IG92ZXJyaWRpbmcgdGhlXHJcbiAgICAgKiBtZXRob2QgKGFuZCBzYXZpbmcgdGhlIG92ZXJoZWFkIG9mIHBhc3NpbmcgYSBoYW5kbGVyIHRvIHRoZSBldmVudCBkaXNwYXRjaGVyKSBhbmQgbW9yZSBpbXBvcnRhbnRseSB0byB0cmlnZ2VyXHJcbiAgICAgKiB0aGVzZSBldmVudHMgd2l0aG91dCBoYXZpbmcgYWNjZXNzIHRvIHRoZSBwcml2YXRlIGV2ZW50IGxpc3QuXHJcbiAgICAgKiBTZWUge0BsaW5rICNvblNob3d9IGZvciBhbiBleGFtcGxlLlxyXG4gICAgICpcclxuICAgICAqIFRvIHByb3ZpZGUgZXh0ZXJuYWwgY29kZSB0aGUgcG9zc2liaWxpdHkgdG8gbGlzdGVuIHRvIHRoaXMgY29tcG9uZW50J3MgZXZlbnRzIChzdWJzY3JpYmUsIHVuc3Vic2NyaWJlLCBldGMuKSxcclxuICAgICAqIGVhY2ggZXZlbnQgc2hvdWxkIGFsc28gYmUgYWNjb21wYW5pZWQgYnkgYSBwdWJsaWMgZ2V0dGVyIGZ1bmN0aW9uIHdpdGggdGhlIHNhbWUgbmFtZSBhcyB0aGUgZXZlbnQncyBwcm9wZXJ0eSxcclxuICAgICAqIHRoYXQgcmV0dXJucyB0aGUge0BsaW5rIEV2ZW50fSBvYnRhaW5lZCBmcm9tIHRoZSBldmVudCBkaXNwYXRjaGVyIGJ5IGNhbGxpbmcge0BsaW5rIEV2ZW50RGlzcGF0Y2hlciNnZXRFdmVudH0uXHJcbiAgICAgKiBTZWUge0BsaW5rICNvblNob3d9IGZvciBhbiBleGFtcGxlLlxyXG4gICAgICpcclxuICAgICAqIEZ1bGwgZXhhbXBsZSBmb3IgYW4gZXZlbnQgcmVwcmVzZW50aW5nIGFuIGV4YW1wbGUgYWN0aW9uIGluIGEgZXhhbXBsZSBjb21wb25lbnQ6XHJcbiAgICAgKlxyXG4gICAgICogPGNvZGU+XHJcbiAgICAgKiAvLyBEZWZpbmUgYW4gZXhhbXBsZSBjb21wb25lbnQgY2xhc3Mgd2l0aCBhbiBleGFtcGxlIGV2ZW50XHJcbiAgICAgKiBjbGFzcyBFeGFtcGxlQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4ge1xyXG4gICAgICpcclxuICAgICAqICAgICBwcml2YXRlIGV4YW1wbGVDb21wb25lbnRFdmVudHMgPSB7XHJcbiAgICAgKiAgICAgICAgIG9uRXhhbXBsZUFjdGlvbjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxFeGFtcGxlQ29tcG9uZW50LCBOb0FyZ3M+KClcclxuICAgICAqICAgICB9XHJcbiAgICAgKlxyXG4gICAgICogICAgIC8vIGNvbnN0cnVjdG9yIGFuZCBvdGhlciBzdHVmZi4uLlxyXG4gICAgICpcclxuICAgICAqICAgICBwcm90ZWN0ZWQgb25FeGFtcGxlQWN0aW9uRXZlbnQoKSB7XHJcbiAgICAgKiAgICAgICAgdGhpcy5leGFtcGxlQ29tcG9uZW50RXZlbnRzLm9uRXhhbXBsZUFjdGlvbi5kaXNwYXRjaCh0aGlzKTtcclxuICAgICAqICAgIH1cclxuICAgICAqXHJcbiAgICAgKiAgICBnZXQgb25FeGFtcGxlQWN0aW9uKCk6IEV2ZW50PEV4YW1wbGVDb21wb25lbnQsIE5vQXJncz4ge1xyXG4gICAgICogICAgICAgIHJldHVybiB0aGlzLmV4YW1wbGVDb21wb25lbnRFdmVudHMub25FeGFtcGxlQWN0aW9uLmdldEV2ZW50KCk7XHJcbiAgICAgKiAgICB9XHJcbiAgICAgKiB9XHJcbiAgICAgKlxyXG4gICAgICogLy8gQ3JlYXRlIGFuIGluc3RhbmNlIG9mIHRoZSBjb21wb25lbnQgc29tZXdoZXJlXHJcbiAgICAgKiB2YXIgZXhhbXBsZUNvbXBvbmVudEluc3RhbmNlID0gbmV3IEV4YW1wbGVDb21wb25lbnQoKTtcclxuICAgICAqXHJcbiAgICAgKiAvLyBTdWJzY3JpYmUgdG8gdGhlIGV4YW1wbGUgZXZlbnQgb24gdGhlIGNvbXBvbmVudFxyXG4gICAgICogZXhhbXBsZUNvbXBvbmVudEluc3RhbmNlLm9uRXhhbXBsZUFjdGlvbi5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogRXhhbXBsZUNvbXBvbmVudCkge1xyXG4gICAgICogICAgIGNvbnNvbGUubG9nKFwib25FeGFtcGxlQWN0aW9uIG9mIFwiICsgc2VuZGVyICsgXCIgaGFzIGZpcmVkIVwiKTtcclxuICAgICAqIH0pO1xyXG4gICAgICogPC9jb2RlPlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGNvbXBvbmVudEV2ZW50cyA9IHtcclxuICAgICAgICBvblNob3c6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICBvbkhpZGU6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbmZpZz4sIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbnN0cnVjdHMgYSBjb21wb25lbnQgd2l0aCBhbiBvcHRpb25hbGx5IHN1cHBsaWVkIGNvbmZpZy4gQWxsIHN1YmNsYXNzZXMgbXVzdCBjYWxsIHRoZSBjb25zdHJ1Y3RvciBvZiB0aGVpclxyXG4gICAgICogc3VwZXJjbGFzcyBhbmQgdGhlbiBtZXJnZSB0aGVpciBjb25maWd1cmF0aW9uIGludG8gdGhlIGNvbXBvbmVudCdzIGNvbmZpZ3VyYXRpb24uXHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgY29tcG9uZW50XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29tcG9uZW50Q29uZmlnID0ge30pIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjb25maWcpO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoaXMgY29tcG9uZW50XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSA8Q29uZmlnPnRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIHRhZzogXCJkaXZcIixcclxuICAgICAgICAgICAgaWQ6IFwidWktaWQtXCIgKyBHdWlkLm5leHQoKSxcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY29tcG9uZW50XCIsXHJcbiAgICAgICAgICAgIGNzc0NsYXNzZXM6IFtdLFxyXG4gICAgICAgICAgICBoaWRkZW46IGZhbHNlXHJcbiAgICAgICAgfSwge30pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIGNvbXBvbmVudCwgZS5nLiBieSBhcHBseWluZyBjb25maWcgc2V0dGluZ3MuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBtdXN0IG5vdCBiZSBjYWxsZWQgZnJvbSBvdXRzaWRlIHRoZSBVSSBmcmFtZXdvcmsuXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBtZXRob2QgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgYnkgdGhlIHtAbGluayBVSU1hbmFnZXJ9LiBJZiB0aGUgY29tcG9uZW50IGlzIGFuIGlubmVyIGNvbXBvbmVudCBvZlxyXG4gICAgICogc29tZSBjb21wb25lbnQsIGFuZCB0aHVzIGVuY2Fwc3VsYXRlZCBhYmQgbWFuYWdlZCBpbnRlcm5hbGx5IGFuZCBuZXZlciBkaXJlY3RseSBleHBvc2VkIHRvIHRoZSBVSU1hbmFnZXIsXHJcbiAgICAgKiB0aGlzIG1ldGhvZCBtdXN0IGJlIGNhbGxlZCBmcm9tIHRoZSBtYW5hZ2luZyBjb21wb25lbnQncyB7QGxpbmsgI2luaXRpYWxpemV9IG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IHRoaXMuY29uZmlnLmhpZGRlbjtcclxuXHJcbiAgICAgICAgLy8gSGlkZSB0aGUgY29tcG9uZW50IGF0IGluaXRpYWxpemF0aW9uIGlmIGl0IGlzIGNvbmZpZ3VyZWQgdG8gYmUgaGlkZGVuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25maWd1cmVzIHRoZSBjb21wb25lbnQgZm9yIHRoZSBzdXBwbGllZCBQbGF5ZXIgYW5kIFVJTWFuYWdlci4gVGhpcyBpcyB0aGUgcGxhY2Ugd2hlcmUgYWxsIHRoZSBtYWdpYyBoYXBwZW5zLFxyXG4gICAgICogd2hlcmUgY29tcG9uZW50cyB0eXBpY2FsbHkgc3Vic2NyaWJlIGFuZCByZWFjdCB0byBldmVudHMgKG9uIHRoZWlyIERPTSBlbGVtZW50LCB0aGUgUGxheWVyLCBvciB0aGUgVUlNYW5hZ2VyKSxcclxuICAgICAqIGFuZCBiYXNpY2FsbHkgZXZlcnl0aGluZyB0aGF0IG1ha2VzIHRoZW0gaW50ZXJhY3RpdmUuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgb25seSBvbmNlLCB3aGVuIHRoZSBVSU1hbmFnZXIgaW5pdGlhbGl6ZXMgdGhlIFVJLlxyXG4gICAgICpcclxuICAgICAqIFN1YmNsYXNzZXMgdXN1YWxseSBvdmVyd3JpdGUgdGhpcyBtZXRob2QgdG8gYWRkIHRoZWlyIG93biBmdW5jdGlvbmFsaXR5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwbGF5ZXIgdGhlIHBsYXllciB3aGljaCB0aGlzIGNvbXBvbmVudCBjb250cm9sc1xyXG4gICAgICogQHBhcmFtIHVpbWFuYWdlciB0aGUgVUlNYW5hZ2VyIHRoYXQgbWFuYWdlcyB0aGlzIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5vblNob3cuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uQ29tcG9uZW50U2hvdy5kaXNwYXRjaChzZWxmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uSGlkZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Db21wb25lbnRIaWRlLmRpc3BhdGNoKHNlbGYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgdGhlIERPTSBlbGVtZW50IGZvciB0aGlzIGNvbXBvbmVudC5cclxuICAgICAqXHJcbiAgICAgKiBTdWJjbGFzc2VzIHVzdWFsbHkgb3ZlcndyaXRlIHRoaXMgbWV0aG9kIHRvIGV4dGVuZCBvciByZXBsYWNlIHRoZSBET00gZWxlbWVudCB3aXRoIHRoZWlyIG93biBkZXNpZ24uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IG5ldyBET00odGhpcy5jb25maWcudGFnLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIERPTSBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LiBDcmVhdGVzIHRoZSBET00gZWxlbWVudCBpZiBpdCBkb2VzIG5vdCB5ZXQgZXhpc3QuXHJcbiAgICAgKlxyXG4gICAgICogU2hvdWxkIG5vdCBiZSBvdmVyd3JpdHRlbiBieSBzdWJjbGFzc2VzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGdldERvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLnRvRG9tRWxlbWVudCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lcmdlcyBhIGNvbmZpZ3VyYXRpb24gd2l0aCBhIGRlZmF1bHQgY29uZmlndXJhdGlvbiBhbmQgYSBiYXNlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgc3VwZXJjbGFzcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIHRoZSBjb25maWd1cmF0aW9uIHNldHRpbmdzIGZvciB0aGUgY29tcG9uZW50cywgYXMgdXN1YWxseSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gZGVmYXVsdHMgYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHNldHRpbmdzIHRoYXQgYXJlIG5vdCBwYXNzZWQgd2l0aCB0aGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHBhcmFtIGJhc2UgY29uZmlndXJhdGlvbiBpbmhlcml0ZWQgZnJvbSBhIHN1cGVyY2xhc3NcclxuICAgICAqIEByZXR1cm5zIHtDb25maWd9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtZXJnZUNvbmZpZzxDb25maWc+KGNvbmZpZzogQ29uZmlnLCBkZWZhdWx0czogQ29uZmlnLCBiYXNlOiBDb25maWcpOiBDb25maWcge1xyXG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IGNvbmZpZyB3aXRoIHN1cHBsaWVkIGNvbmZpZ1xyXG4gICAgICAgIGxldCBtZXJnZWQgPSBPYmplY3QuYXNzaWduKHt9LCBiYXNlLCBkZWZhdWx0cywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBleHRlbmRlZCBjb25maWdcclxuICAgICAgICByZXR1cm4gbWVyZ2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGVscGVyIG1ldGhvZCB0aGF0IHJldHVybnMgYSBzdHJpbmcgb2YgYWxsIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldENzc0NsYXNzZXMoKTogc3RyaW5nIHtcclxuICAgICAgICAvLyBNZXJnZSBhbGwgQ1NTIGNsYXNzZXMgaW50byBzaW5nbGUgYXJyYXlcclxuICAgICAgICBsZXQgZmxhdHRlbmVkQXJyYXkgPSBbdGhpcy5jb25maWcuY3NzQ2xhc3NdLmNvbmNhdCh0aGlzLmNvbmZpZy5jc3NDbGFzc2VzKTtcclxuICAgICAgICAvLyBKb2luIGFycmF5IHZhbHVlcyBpbnRvIGEgc3RyaW5nXHJcbiAgICAgICAgbGV0IGZsYXR0ZW5lZFN0cmluZyA9IGZsYXR0ZW5lZEFycmF5LmpvaW4oXCIgXCIpO1xyXG4gICAgICAgIC8vIFJldHVybiB0cmltbWVkIHN0cmluZyB0byBwcmV2ZW50IHdoaXRlc3BhY2UgYXQgdGhlIGVuZCBmcm9tIHRoZSBqb2luIG9wZXJhdGlvblxyXG4gICAgICAgIHJldHVybiBmbGF0dGVuZWRTdHJpbmcudHJpbSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY29uZmlndXJhdGlvbiBvYmplY3Qgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqIEByZXR1cm5zIHtDb25maWd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDb25maWcoKTogQ29uZmlnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlcyB0aGUgY29tcG9uZW50LlxyXG4gICAgICogVGhpcyBtZXRob2QgYmFzaWNhbGx5IHRyYW5zZmVycyB0aGUgY29tcG9uZW50IGludG8gdGhlIGhpZGRlbiBzdGF0ZS4gQWN0dWFsIGhpZGluZyBpcyBkb25lIHZpYSBDU1MuXHJcbiAgICAgKi9cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKENvbXBvbmVudC5DTEFTU19ISURERU4pO1xyXG4gICAgICAgIHRoaXMub25IaWRlRXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3dzIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoQ29tcG9uZW50LkNMQVNTX0hJRERFTik7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9uU2hvd0V2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBjb21wb25lbnQgaXMgaGlkZGVuLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNvbXBvbmVudCBpcyBoaWRkZW4sIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNIaWRkZW4oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGlkZGVuO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGV0ZXJtaW5lcyBpZiB0aGUgY29tcG9uZW50IGlzIHNob3duLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNvbXBvbmVudCBpcyB2aXNpYmxlLCBlbHNlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGlzU2hvd24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzSGlkZGVuKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSBoaWRkZW4gc3RhdGUgYnkgaGlkaW5nIHRoZSBjb21wb25lbnQgaWYgaXQgaXMgc2hvd24sIG9yIHNob3dpbmcgaXQgaWYgaGlkZGVuLlxyXG4gICAgICovXHJcbiAgICB0b2dnbGVIaWRkZW4oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB0aGUgb25TaG93IGV2ZW50LlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBvblNob3dFdmVudCgpIHtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudEV2ZW50cy5vblNob3cuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB0aGUgb25IaWRlIGV2ZW50LlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBvbkhpZGVFdmVudCgpIHtcclxuICAgICAgICB0aGlzLmNvbXBvbmVudEV2ZW50cy5vbkhpZGUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBzaG93aW5nLlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uU2hvdygpOiBFdmVudDxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uU2hvdy5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBjb21wb25lbnQgaXMgaGlkaW5nLlxyXG4gICAgICogU2VlIHRoZSBkZXRhaWxlZCBleHBsYW5hdGlvbiBvbiBldmVudCBhcmNoaXRlY3R1cmUgb25qIHRoZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyBldmVudHMgbGlzdH0uXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uSGlkZSgpOiBFdmVudDxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uSGlkZS5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudENvbmZpZywgQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtBcnJheVV0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgQ29udGFpbmVyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udGFpbmVyQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogQ2hpbGQgY29tcG9uZW50cyBvZiB0aGUgY29udGFpbmVyLlxyXG4gICAgICovXHJcbiAgICBjb21wb25lbnRzPzogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz5bXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgY29udGFpbmVyIGNvbXBvbmVudCB0aGF0IGNhbiBjb250YWluIGEgY29sbGVjdGlvbiBvZiBjaGlsZCBjb21wb25lbnRzLlxyXG4gKiBDb21wb25lbnRzIGNhbiBiZSBhZGRlZCBhdCBjb25zdHJ1Y3Rpb24gdGltZSB0aHJvdWdoIHRoZSB7QGxpbmsgQ29udGFpbmVyQ29uZmlnI2NvbXBvbmVudHN9IHNldHRpbmcsIG9yIGxhdGVyXHJcbiAqIHRocm91Z2ggdGhlIHtAbGluayBDb250YWluZXIjYWRkQ29tcG9uZW50fSBtZXRob2QuIFRoZSBVSU1hbmFnZXIgYXV0b21hdGljYWxseSB0YWtlcyBjYXJlIG9mIGFsbCBjb21wb25lbnRzLCBpLmUuIGl0XHJcbiAqIGluaXRpYWxpemVzIGFuZCBjb25maWd1cmVzIHRoZW0gYXV0b21hdGljYWxseS5cclxuICpcclxuICogSW4gdGhlIERPTSwgdGhlIGNvbnRhaW5lciBjb25zaXN0cyBvZiBhbiBvdXRlciA8ZGl2PiAodGhhdCBjYW4gYmUgY29uZmlndXJlZCBieSB0aGUgY29uZmlnKSBhbmQgYW4gaW5uZXIgd3JhcHBlclxyXG4gKiA8ZGl2PiB0aGF0IGNvbnRhaW5zIHRoZSBjb21wb25lbnRzLiBUaGlzIGRvdWJsZS08ZGl2Pi1zdHJ1Y3R1cmUgaXMgb2Z0ZW4gcmVxdWlyZWQgdG8gYWNoaWV2ZSBtYW55IGFkdmFuY2VkIGVmZmVjdHNcclxuICogaW4gQ1NTIGFuZC9vciBKUywgZS5nLiBhbmltYXRpb25zIGFuZCBjZXJ0YWluIGZvcm1hdHRpbmcgd2l0aCBhYnNvbHV0ZSBwb3NpdGlvbmluZy5cclxuICpcclxuICogRE9NIGV4YW1wbGU6XHJcbiAqIDxjb2RlPlxyXG4gKiAgICAgPGRpdiBjbGFzcz1cInVpLWNvbnRhaW5lclwiPlxyXG4gKiAgICAgICAgIDxkaXYgY2xhc3M9XCJjb250YWluZXItd3JhcHBlclwiPlxyXG4gKiAgICAgICAgICAgICAuLi4gY2hpbGQgY29tcG9uZW50cyAuLi5cclxuICogICAgICAgICA8L2Rpdj5cclxuICogICAgIDwvZGl2PlxyXG4gKiA8L2NvZGU+XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29udGFpbmVyPENvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBIHJlZmVyZW5jZSB0byB0aGUgaW5uZXIgZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBjb21wb25lbnRzIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgaW5uZXJDb250YWluZXJFbGVtZW50OiBET007XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWNvbnRhaW5lclwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbXVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYSBjaGlsZCBjb21wb25lbnQgdG8gdGhlIGNvbnRhaW5lci5cclxuICAgICAqIEBwYXJhbSBjb21wb25lbnQgdGhlIGNvbXBvbmVudCB0byBhZGRcclxuICAgICAqL1xyXG4gICAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pIHtcclxuICAgICAgICB0aGlzLmNvbmZpZy5jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYSBjaGlsZCBjb21wb25lbnQgZnJvbSB0aGUgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIGNvbXBvbmVudCB0aGUgY29tcG9uZW50IHRvIHJlbW92ZVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiByZW1vdmVkLCBmYWxzZSBpZiBpdCBpcyBub3QgY29udGFpbmVkIGluIHRoaXMgY29udGFpbmVyXHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUNvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5VXRpbHMucmVtb3ZlKHRoaXMuY29uZmlnLmNvbXBvbmVudHMsIGNvbXBvbmVudCkgIT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgYW4gYXJyYXkgb2YgYWxsIGNoaWxkIGNvbXBvbmVudHMgaW4gdGhpcyBjb250YWluZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz5bXX1cclxuICAgICAqL1xyXG4gICAgZ2V0Q29tcG9uZW50cygpOiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPltdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWcuY29tcG9uZW50cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFVwZGF0ZXMgdGhlIERPTSBvZiB0aGUgY29udGFpbmVyIHdpdGggdGhlIGN1cnJlbnQgY29tcG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIHVwZGF0ZUNvbXBvbmVudHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5pbm5lckNvbnRhaW5lckVsZW1lbnQuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgY29tcG9uZW50IG9mIHRoaXMuY29uZmlnLmNvbXBvbmVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5pbm5lckNvbnRhaW5lckVsZW1lbnQuYXBwZW5kKGNvbXBvbmVudC5nZXREb21FbGVtZW50KCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBjb250YWluZXIgZWxlbWVudCAodGhlIG91dGVyIDxkaXY+KVxyXG4gICAgICAgIGxldCBjb250YWluZXJFbGVtZW50ID0gbmV3IERPTSh0aGlzLmNvbmZpZy50YWcsIHtcclxuICAgICAgICAgICAgXCJpZFwiOiB0aGlzLmNvbmZpZy5pZCxcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiB0aGlzLmdldENzc0NsYXNzZXMoKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGlubmVyIGNvbnRhaW5lciBlbGVtZW50ICh0aGUgaW5uZXIgPGRpdj4pIHRoYXQgd2lsbCBjb250YWluIHRoZSBjb21wb25lbnRzXHJcbiAgICAgICAgbGV0IGlubmVyQ29udGFpbmVyID0gbmV3IERPTSh0aGlzLmNvbmZpZy50YWcsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImNvbnRhaW5lci13cmFwcGVyXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxlbWVudCA9IGlubmVyQ29udGFpbmVyO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudHMoKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWxlbWVudC5hcHBlbmQoaW5uZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyRWxlbWVudDtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VGltZW91dH0gZnJvbSBcIi4uL3RpbWVvdXRcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgdGhlIHtAbGluayBDb250cm9sQmFyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udHJvbEJhckNvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIGNvbnRyb2wgYmFyIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIERlZmF1bHQ6IDUgc2Vjb25kcyAoNTAwMClcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjb250YWluZXIgZm9yIG1haW4gcGxheWVyIGNvbnRyb2wgY29tcG9uZW50cywgZS5nLiBwbGF5IHRvZ2dsZSBidXR0b24sIHNlZWsgYmFyLCB2b2x1bWUgY29udHJvbCwgZnVsbHNjcmVlbiB0b2dnbGUgYnV0dG9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbnRyb2xCYXIgZXh0ZW5kcyBDb250YWluZXI8Q29udHJvbEJhckNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29udHJvbEJhckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY29udHJvbGJhclwiLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIGhpZGVEZWxheTogNTAwMFxyXG4gICAgICAgIH0sIDxDb250cm9sQmFyQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgaXNTZWVraW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxDb250cm9sQmFyQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkgeyAvLyBUT0RPIGZpeCBnZW5lcmljcyB0byBzcGFyZSB0aGVzZSBkYW1uIGNhc3RzLi4uIGlzIHRoYXQgZXZlbiBwb3NzaWJsZSBpbiBUUz9cclxuICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlRW50ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7IC8vIHNob3cgY29udHJvbCBiYXIgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSVxyXG5cclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpOyAvLyBDbGVhciB0aW1lb3V0IHRvIGF2b2lkIGhpZGluZyB0aGUgY29udHJvbCBiYXIgaWYgdGhlIG1vdXNlIG1vdmVzIGJhY2sgaW50byB0aGUgVUkgZHVyaW5nIHRoZSB0aW1lb3V0IHBlcmlvZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEb24ndCBjcmVhdGUvdXBkYXRlIHRpbWVvdXQgd2hpbGUgc2Vla2luZ1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgdGhlIGNvbnRyb2wgYmFyIGlmIG1vdXNlIGRvZXMgbm90IG1vdmUgZHVyaW5nIHRoZSB0aW1lb3V0IHRpbWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvbid0IGNyZWF0ZS91cGRhdGUgdGltZW91dCB3aGlsZSBzZWVraW5nXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSBjb250cm9sIGJhciBzb21lIHRpbWUgYWZ0ZXIgdGhlIG1vdXNlIGxlZnQgdGhlIFVJXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7IC8vIERvbid0IGhpZGUgY29udHJvbCBiYXIgd2hpbGUgYSBzZWVrIGlzIGluIHByb2dyZXNzXHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aW1lb3V0LnN0YXJ0KCk7IC8vIGhpZGUgY29udHJvbCBiYXIgc29tZSB0aW1lIGFmdGVyIGEgc2VlayBoYXMgZmluaXNoZWRcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgRXJyb3JFdmVudCA9IGJpdG1vdmluLnBsYXllci5FcnJvckV2ZW50O1xyXG5pbXBvcnQge1R2Tm9pc2VDYW52YXN9IGZyb20gXCIuL3R2bm9pc2VjYW52YXNcIjtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIGFuZCBkaXNwbGF5cyBlcnJvciBtZXNzYWdlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFcnJvck1lc3NhZ2VPdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgZXJyb3JMYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG4gICAgcHJpdmF0ZSB0dk5vaXNlQmFja2dyb3VuZDogVHZOb2lzZUNhbnZhcztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5lcnJvckxhYmVsID0gbmV3IExhYmVsPExhYmVsQ29uZmlnPih7Y3NzQ2xhc3M6IFwidWktZXJyb3JtZXNzYWdlLWxhYmVsXCJ9KTtcclxuICAgICAgICB0aGlzLnR2Tm9pc2VCYWNrZ3JvdW5kID0gbmV3IFR2Tm9pc2VDYW52YXMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1lcnJvcm1lc3NhZ2Utb3ZlcmxheVwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy50dk5vaXNlQmFja2dyb3VuZCwgdGhpcy5lcnJvckxhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9FUlJPUiwgZnVuY3Rpb24gKGV2ZW50OiBFcnJvckV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXJyb3JMYWJlbC5zZXRUZXh0KGV2ZW50Lm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBzZWxmLnR2Tm9pc2VCYWNrZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgdGhlIHBsYXllciBiZXR3ZWVuIHdpbmRvd2VkIGFuZCBmdWxsc2NyZWVuIHZpZXcuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1mdWxsc2NyZWVudG9nZ2xlYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiRnVsbHNjcmVlblwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgZnVsbHNjcmVlblN0YXRlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Z1bGxzY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0ZVTExTQ1JFRU5fRU5URVIsIGZ1bGxzY3JlZW5TdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0ZVTExTQ1JFRU5fRVhJVCwgZnVsbHNjcmVlblN0YXRlSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzRnVsbHNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZXhpdEZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5lbnRlckZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTdGFydHVwIGluaXRcclxuICAgICAgICBmdWxsc2NyZWVuU3RhdGVIYW5kbGVyKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFBsYXllckV2ZW50ID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgb3ZlcmxheXMgdGhlIHZpZGVvIGFuZCB0b2dnbGVzIGJldHdlZW4gcGxheWJhY2sgYW5kIHBhdXNlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbiBleHRlbmRzIFBsYXliYWNrVG9nZ2xlQnV0dG9uIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1odWdlcGxheWJhY2t0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJQbGF5L1BhdXNlXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBVcGRhdGUgYnV0dG9uIHN0YXRlIHRocm91Z2ggQVBJIGV2ZW50c1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlciwgZmFsc2UpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB0b2dnbGVQbGF5YmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc1BsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHRvZ2dsZUZ1bGxzY3JlZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNGdWxsc2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5leGl0RnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmVudGVyRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGNsaWNrVGltZSA9IDA7XHJcbiAgICAgICAgbGV0IGRvdWJsZUNsaWNrVGltZSA9IDA7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogWW91VHViZS1zdHlsZSB0b2dnbGUgYnV0dG9uIGhhbmRsaW5nXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUaGUgZ29hbCBpcyB0byBwcmV2ZW50IGEgc2hvcnQgcGF1c2Ugb3IgcGxheWJhY2sgaW50ZXJ2YWwgYmV0d2VlbiBhIGNsaWNrLCB0aGF0IHRvZ2dsZXMgcGxheWJhY2ssIGFuZCBhXHJcbiAgICAgICAgICogZG91YmxlIGNsaWNrLCB0aGF0IHRvZ2dsZXMgZnVsbHNjcmVlbi4gSW4gdGhpcyBuYWl2ZSBhcHByb2FjaCwgdGhlIGZpcnN0IGNsaWNrIHdvdWxkIGUuZy4gc3RhcnQgcGxheWJhY2ssXHJcbiAgICAgICAgICogdGhlIHNlY29uZCBjbGljayB3b3VsZCBiZSBkZXRlY3RlZCBhcyBkb3VibGUgY2xpY2sgYW5kIHRvZ2dsZSB0byBmdWxsc2NyZWVuLCBhbmQgYXMgc2Vjb25kIG5vcm1hbCBjbGljayBzdG9wXHJcbiAgICAgICAgICogcGxheWJhY2ssIHdoaWNoIHJlc3VsdHMgaXMgYSBzaG9ydCBwbGF5YmFjayBpbnRlcnZhbCB3aXRoIG1heCBsZW5ndGggb2YgdGhlIGRvdWJsZSBjbGljayBkZXRlY3Rpb25cclxuICAgICAgICAgKiBwZXJpb2QgKHVzdWFsbHkgNTAwbXMpLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogVG8gc29sdmUgdGhpcyBpc3N1ZSwgd2UgZGVmZXIgaGFuZGxpbmcgb2YgdGhlIGZpcnN0IGNsaWNrIGZvciAyMDBtcywgd2hpY2ggaXMgYWxtb3N0IHVubm90aWNlYWJsZSB0byB0aGUgdXNlcixcclxuICAgICAgICAgKiBhbmQganVzdCB0b2dnbGUgcGxheWJhY2sgaWYgbm8gc2Vjb25kIGNsaWNrIChkb3VibGUgY2xpY2spIGhhcyBiZWVuIHJlZ2lzdGVyZWQgZHVyaW5nIHRoaXMgcGVyaW9kLiBJZiBhIGRvdWJsZVxyXG4gICAgICAgICAqIGNsaWNrIGlzIHJlZ2lzdGVyZWQsIHdlIGp1c3QgdG9nZ2xlIHRoZSBmdWxsc2NyZWVuLiBJbiB0aGUgZmlyc3QgMjAwbXMsIHVuZGVzaXJlZCBwbGF5YmFjayBjaGFuZ2VzIHRodXMgY2Fubm90XHJcbiAgICAgICAgICogaGFwcGVuLiBJZiBhIGRvdWJsZSBjbGljayBpcyByZWdpc3RlcmVkIHdpdGhpbiA1MDBtcywgd2UgdW5kbyB0aGUgcGxheWJhY2sgY2hhbmdlIGFuZCBzd2l0Y2ggZnVsbHNjcmVlbiBtb2RlLlxyXG4gICAgICAgICAqIEluIHRoZSBlbmQsIHRoaXMgbWV0aG9kIGJhc2ljYWxseSBpbnRyb2R1Y2VzIGEgMjAwbXMgb2JzZXJ2aW5nIGludGVydmFsIGluIHdoaWNoIHBsYXliYWNrIGNoYW5nZXMgYXJlIHByZXZlbnRlZFxyXG4gICAgICAgICAqIGlmIGEgZG91YmxlIGNsaWNrIGhhcHBlbnMuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBub3cgPSBEYXRlLm5vdygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKG5vdyAtIGNsaWNrVGltZSA8IDIwMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gV2UgaGF2ZSBhIGRvdWJsZSBjbGljayBpbnNpZGUgdGhlIDIwMG1zIGludGVydmFsLCBqdXN0IHRvZ2dsZSBmdWxsc2NyZWVuIG1vZGVcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgICAgIGRvdWJsZUNsaWNrVGltZSA9IG5vdztcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChub3cgLSBjbGlja1RpbWUgPCA1MDApIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBkb3VibGUgY2xpY2sgaW5zaWRlIHRoZSA1MDBtcyBpbnRlcnZhbCwgdW5kbyBwbGF5YmFjayB0b2dnbGUgYW5kIHRvZ2dsZSBmdWxsc2NyZWVuIG1vZGVcclxuICAgICAgICAgICAgICAgIHRvZ2dsZUZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgICAgIHRvZ2dsZVBsYXliYWNrKCk7XHJcbiAgICAgICAgICAgICAgICBkb3VibGVDbGlja1RpbWUgPSBub3c7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNsaWNrVGltZSA9IG5vdztcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSBkb3VibGVDbGlja1RpbWUgPiAyMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBObyBkb3VibGUgY2xpY2sgZGV0ZWN0ZWQsIHNvIHdlIHRvZ2dsZSBwbGF5YmFjayBhbmQgd2FpdCB3aGF0IGhhcHBlbnMgbmV4dFxyXG4gICAgICAgICAgICAgICAgICAgIHRvZ2dsZVBsYXliYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDIwMCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgdGhlIGh1Z2UgcGxheWJhY2sgYnV0dG9uIGR1cmluZyBWUiBwbGF5YmFjayB0byBsZXQgbW91c2UgZXZlbnRzIHBhc3MgdGhyb3VnaCBhbmQgbmF2aWdhdGUgdGhlIFZSIHZpZXdwb3J0XHJcbiAgICAgICAgc2VsZi5vblRvZ2dsZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmdldFZSU3RhdHVzKCkuY29udGVudFR5cGUgIT09IFwibm9uZVwiKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlzUGxheWluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgYnV0dG9uIHdoaWxlIGluaXRpYWxpemluZyBhIENhc3Qgc2Vzc2lvblxyXG4gICAgICAgIGxldCBjYXN0SW5pdGlhbGl6YXRpb25IYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50OiBQbGF5ZXJFdmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RBUlQpIHtcclxuICAgICAgICAgICAgICAgIC8vIEhpZGUgYnV0dG9uIHdoZW4gc2Vzc2lvbiBpcyBiZWluZyBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTaG93IGJ1dHRvbiB3aGVuIHNlc3Npb24gaXMgZXN0YWJsaXNoZWQgb3IgaW5pdGlhbGl6YXRpb24gd2FzIGFib3J0ZWRcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJULCBjYXN0SW5pdGlhbGl6YXRpb25IYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0xBVU5DSEVELCBjYXN0SW5pdGlhbGl6YXRpb25IYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUT1AsIGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgYnV0dG9uRWxlbWVudCA9IHN1cGVyLnRvRG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICAvLyBBZGQgY2hpbGQgdGhhdCBjb250YWlucyB0aGUgcGxheSBidXR0b24gaW1hZ2VcclxuICAgICAgICAvLyBTZXR0aW5nIHRoZSBpbWFnZSBkaXJlY3RseSBvbiB0aGUgYnV0dG9uIGRvZXMgbm90IHdvcmsgdG9nZXRoZXIgd2l0aCBzY2FsaW5nIGFuaW1hdGlvbnMsIGJlY2F1c2UgdGhlIGJ1dHRvblxyXG4gICAgICAgIC8vIGNhbiBjb3ZlciB0aGUgd2hvbGUgdmlkZW8gcGxheWVyIGFyZSBhbmQgc2NhbGluZyB3b3VsZCBleHRlbmQgaXQgYmV5b25kLiBCeSBhZGRpbmcgYW4gaW5uZXIgZWxlbWVudCwgY29uZmluZWRcclxuICAgICAgICAvLyB0byB0aGUgc2l6ZSBpZiB0aGUgaW1hZ2UsIGl0IGNhbiBzY2FsZSBpbnNpZGUgdGhlIHBsYXllciB3aXRob3V0IG92ZXJzaG9vdGluZy5cclxuICAgICAgICBidXR0b25FbGVtZW50LmFwcGVuZChuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImltYWdlXCJcclxuICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIHJldHVybiBidXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudENvbmZpZywgQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgTGFiZWx9IGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGFiZWxDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGV4dCBvbiB0aGUgbGFiZWwuXHJcbiAgICAgKi9cclxuICAgIHRleHQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSB0ZXh0IGxhYmVsLlxyXG4gKlxyXG4gKiBET00gZXhhbXBsZTpcclxuICogPGNvZGU+XHJcbiAqICAgICA8c3BhbiBjbGFzcz1cInVpLWxhYmVsXCI+Li4uc29tZSB0ZXh0Li4uPC9zcGFuPlxyXG4gKiA8L2NvZGU+XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTGFiZWw8Q29uZmlnIGV4dGVuZHMgTGFiZWxDb25maWc+IGV4dGVuZHMgQ29tcG9uZW50PExhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1sYWJlbFwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgbGFiZWxFbGVtZW50ID0gbmV3IERPTShcInNwYW5cIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSkuaHRtbCh0aGlzLmNvbmZpZy50ZXh0KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGxhYmVsRWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0aGUgdGV4dCBvbiB0aGlzIGxhYmVsLlxyXG4gICAgICogQHBhcmFtIHRleHRcclxuICAgICAqL1xyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5odG1sKHRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSB0ZXh0IG9uIHRoaXMgbGFiZWwuXHJcbiAgICAgKi9cclxuICAgIGNsZWFyVGV4dCgpIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5odG1sKFwiXCIpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtFdmVudERpc3BhdGNoZXIsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcblxyXG4vKipcclxuICogQSBtYXAgb2YgaXRlbXMgKGtleS92YWx1ZSAtPiBsYWJlbH0gZm9yIGEge0BsaW5rIExpc3RTZWxlY3Rvcn0gaW4gYSB7QGxpbmsgTGlzdFNlbGVjdG9yQ29uZmlnfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlzdEl0ZW0ge1xyXG4gICAga2V5OiBzdHJpbmc7XHJcbiAgICBsYWJlbDogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIExpc3RTZWxlY3Rvcn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExpc3RTZWxlY3RvckNvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICBpdGVtcz86IExpc3RJdGVtW107XHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMaXN0U2VsZWN0b3I8Q29uZmlnIGV4dGVuZHMgTGlzdFNlbGVjdG9yQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxMaXN0U2VsZWN0b3JDb25maWc+IHtcclxuXHJcbiAgICBwcm90ZWN0ZWQgaXRlbXM6IExpc3RJdGVtW107XHJcbiAgICBwcm90ZWN0ZWQgc2VsZWN0ZWRJdGVtOiBzdHJpbmc7XHJcblxyXG4gICAgcHJpdmF0ZSBsaXN0U2VsZWN0b3JFdmVudHMgPSB7XHJcbiAgICAgICAgb25JdGVtQWRkZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKSxcclxuICAgICAgICBvbkl0ZW1SZW1vdmVkOiBuZXcgRXZlbnREaXNwYXRjaGVyPExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+KCksXHJcbiAgICAgICAgb25JdGVtU2VsZWN0ZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBpdGVtczogW10sXHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWxpc3RzZWxlY3RvclwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLml0ZW1zID0gdGhpcy5jb25maWcuaXRlbXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRJdGVtSW5kZXgoa2V5OiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgICAgIGZvciAobGV0IGluZGV4IGluIHRoaXMuaXRlbXMpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PSB0aGlzLml0ZW1zW2luZGV4XS5rZXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChpbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzcGVjaWZpZWQgaXRlbSBpcyBwYXJ0IG9mIHRoaXMgc2VsZWN0b3IuXHJcbiAgICAgKiBAcGFyYW0ga2V5IHRoZSBrZXkgb2YgdGhlIGl0ZW0gdG8gY2hlY2tcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBpdGVtIGlzIHBhcnQgb2YgdGhpcyBzZWxlY3RvciwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBoYXNJdGVtKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SXRlbUluZGV4KGtleSkgPiAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gaXRlbSB0byB0aGlzIHNlbGVjdG9yIGJ5IGFwcGVuZGluZyBpdCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0IG9mIGl0ZW1zLlxyXG4gICAgICogQHBhcmFtIGtleSB0aGUga2V5ICBvZiB0aGUgaXRlbSB0byBhZGRcclxuICAgICAqIEBwYXJhbSBsYWJlbCB0aGUgKGh1bWFuLXJlYWRhYmxlKSBsYWJlbCBvZiB0aGUgaXRlbSB0byBhZGRcclxuICAgICAqL1xyXG4gICAgYWRkSXRlbShrZXk6IHN0cmluZywgbGFiZWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCh7a2V5OiBrZXksIGxhYmVsOiBsYWJlbH0pO1xyXG4gICAgICAgIHRoaXMub25JdGVtQWRkZWRFdmVudChrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBpdGVtIGZyb20gdGhpcyBzZWxlY3Rvci5cclxuICAgICAqIEBwYXJhbSBrZXkgdGhlIGtleSBvZiB0aGUgaXRlbSB0byByZW1vdmVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHJlbW92YWwgd2FzIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIHRoZSBpdGVtIGlzIG5vdCBwYXJ0IG9mIHRoaXMgc2VsZWN0b3JcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlSXRlbShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KGtleSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuaXRlbXNbaW5kZXhdO1xyXG4gICAgICAgICAgICB0aGlzLm9uSXRlbVJlbW92ZWRFdmVudChrZXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbGVjdHMgYW4gaXRlbSBmcm9tIHRoZSBpdGVtcyBpbiB0aGlzIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIGtleSB0aGUga2V5IG9mIHRoZSBpdGVtIHRvIHNlbGVjdFxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaXMgdGhlIHNlbGVjdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IHBhcnQgb2YgdGhlIHNlbGVjdG9yXHJcbiAgICAgKi9cclxuICAgIHNlbGVjdEl0ZW0oa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoa2V5ID09PSB0aGlzLnNlbGVjdGVkSXRlbSkge1xyXG4gICAgICAgICAgICAvLyBpdGVtQ29uZmlnIGlzIGFscmVhZHkgc2VsZWN0ZWQsIHN1cHByZXNzIGFueSBmdXJ0aGVyIGFjdGlvblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KGtleSk7XHJcblxyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0ga2V5O1xyXG4gICAgICAgICAgICB0aGlzLm9uSXRlbVNlbGVjdGVkRXZlbnQoa2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBrZXkgb2YgdGhlIHNlbGVjdGVkIGl0ZW0uXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUga2V5IG9mIHRoZSBzZWxlY3RlZCBpdGVtIG9yIG51bGwgaWYgbm8gaXRlbSBpcyBzZWxlY3RlZFxyXG4gICAgICovXHJcbiAgICBnZXRTZWxlY3RlZEl0ZW0oKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgaXRlbXMgZnJvbSB0aGlzIHNlbGVjdG9yLlxyXG4gICAgICovXHJcbiAgICBjbGVhckl0ZW1zKCkge1xyXG4gICAgICAgIGxldCBpdGVtcyA9IHRoaXMuaXRlbXM7IC8vIGxvY2FsIGNvcHkgZm9yIGl0ZXJhdGlvbiBhZnRlciBjbGVhclxyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTsgLy8gY2xlYXIgaXRlbXNcclxuXHJcbiAgICAgICAgLy8gZmlyZSBldmVudHNcclxuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25JdGVtUmVtb3ZlZEV2ZW50KGl0ZW0ua2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgaXRlbXMgaW4gdGhpcyBzZWxlY3Rvci5cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGl0ZW1Db3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLml0ZW1zKS5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbUFkZGVkRXZlbnQoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1BZGRlZC5kaXNwYXRjaCh0aGlzLCBrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1SZW1vdmVkRXZlbnQoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1SZW1vdmVkLmRpc3BhdGNoKHRoaXMsIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbVNlbGVjdGVkRXZlbnQoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1TZWxlY3RlZC5kaXNwYXRjaCh0aGlzLCBrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGFuIGl0ZW0gaXMgYWRkZWQgdG8gdGhlIGxpc3Qgb2YgaXRlbXMuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uSXRlbUFkZGVkKCk6IEV2ZW50PExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtQWRkZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQgZnJvbSB0aGUgbGlzdCBvZiBpdGVtcy5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25JdGVtUmVtb3ZlZCgpOiBFdmVudDxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbVJlbW92ZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBhbiBpdGVtIGlzIHNlbGVjdGVkIGZyb20gdGhlIGxpc3Qgb2YgaXRlbXMuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uSXRlbVNlbGVjdGVkKCk6IEV2ZW50PExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtU2VsZWN0ZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzZWxlY3QgYm94IHByb3ZpZGluZyBhIHNlbGVjdGlvbiBvZiBkaWZmZXJlbnQgcGxheWJhY2sgc3BlZWRzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFBsYXliYWNrU3BlZWRTZWxlY3RCb3ggZXh0ZW5kcyBTZWxlY3RCb3gge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBzZWxmLmFkZEl0ZW0oXCIwLjI1XCIsIFwiMC4yNXhcIik7XHJcbiAgICAgICAgc2VsZi5hZGRJdGVtKFwiMC41XCIsIFwiMC41eFwiKTtcclxuICAgICAgICBzZWxmLmFkZEl0ZW0oXCIxXCIsIFwiTm9ybWFsXCIpO1xyXG4gICAgICAgIHNlbGYuYWRkSXRlbShcIjEuNVwiLCBcIjEuNXhcIik7XHJcbiAgICAgICAgc2VsZi5hZGRJdGVtKFwiMlwiLCBcIjJ4XCIpO1xyXG5cclxuICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oXCIxXCIpO1xyXG5cclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogUGxheWJhY2tTcGVlZFNlbGVjdEJveCwgdmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0UGxheWJhY2tTcGVlZChwYXJzZUZsb2F0KHZhbHVlKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7TGFiZWxDb25maWcsIExhYmVsfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbmV4cG9ydCBlbnVtIFRpbWVMYWJlbE1vZGUge1xyXG4gICAgQ3VycmVudFRpbWUsXHJcbiAgICBUb3RhbFRpbWUsXHJcbiAgICBDdXJyZW50QW5kVG90YWxUaW1lLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBsYXliYWNrVGltZUxhYmVsQ29uZmlnIGV4dGVuZHMgTGFiZWxDb25maWcge1xyXG4gICAgdGltZUxhYmVsTW9kZT86IFRpbWVMYWJlbE1vZGU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGxhYmVsIHRoYXQgZGlzcGxheSB0aGUgY3VycmVudCBwbGF5YmFjayB0aW1lIGFuZCB0aGUgdG90YWwgdGltZSB0aHJvdWdoIHtAbGluayBQbGF5YmFja1RpbWVMYWJlbCNzZXRUaW1lIHNldFRpbWV9XHJcbiAqIG9yIGFueSBzdHJpbmcgdGhyb3VnaCB7QGxpbmsgUGxheWJhY2tUaW1lTGFiZWwjc2V0VGV4dCBzZXRUZXh0fS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQbGF5YmFja1RpbWVMYWJlbCBleHRlbmRzIExhYmVsPFBsYXliYWNrVGltZUxhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBQbGF5YmFja1RpbWVMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywgPFBsYXliYWNrVGltZUxhYmVsQ29uZmlnPntcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktbGFiZWxcIixcclxuICAgICAgICAgICAgdGltZUxhYmVsTW9kZTogVGltZUxhYmVsTW9kZS5DdXJyZW50QW5kVG90YWxUaW1lLFxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHBsYXliYWNrVGltZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0RHVyYXRpb24oKSA9PT0gSW5maW5pdHkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGV4dChcIkxpdmVcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWUocGxheWVyLmdldEN1cnJlbnRUaW1lKCksIHBsYXllci5nZXREdXJhdGlvbigpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFS0VELCBwbGF5YmFja1RpbWVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1RJTUVfVVBEQVRFLCBwbGF5YmFja1RpbWVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgLy8gSW5pdCB0aW1lIGRpc3BsYXkgKHdoZW4gdGhlIFVJIGlzIGluaXRpYWxpemVkLCBpdCdzIHRvbyBsYXRlIGZvciB0aGUgT05fUkVBRFkgZXZlbnQpXHJcbiAgICAgICAgcGxheWJhY2tUaW1lSGFuZGxlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgY3VycmVudCBwbGF5YmFjayB0aW1lIGFuZCB0b3RhbCBkdXJhdGlvbi5cclxuICAgICAqIEBwYXJhbSBwbGF5YmFja1NlY29uZHMgdGhlIGN1cnJlbnQgcGxheWJhY2sgdGltZSBpbiBzZWNvbmRzXHJcbiAgICAgKiBAcGFyYW0gZHVyYXRpb25TZWNvbmRzIHRoZSB0b3RhbCBkdXJhdGlvbiBpbiBzZWNvbmRzXHJcbiAgICAgKi9cclxuICAgIHNldFRpbWUocGxheWJhY2tTZWNvbmRzOiBudW1iZXIsIGR1cmF0aW9uU2Vjb25kczogbnVtYmVyKSB7XHJcbiAgICAgICAgc3dpdGNoICgoPFBsYXliYWNrVGltZUxhYmVsQ29uZmlnPnRoaXMuY29uZmlnKS50aW1lTGFiZWxNb2RlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZUxhYmVsTW9kZS5DdXJyZW50VGltZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGV4dChgJHtTdHJpbmdVdGlscy5zZWNvbmRzVG9UaW1lKHBsYXliYWNrU2Vjb25kcyl9YCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBUaW1lTGFiZWxNb2RlLlRvdGFsVGltZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0VGV4dChgJHtTdHJpbmdVdGlscy5zZWNvbmRzVG9UaW1lKGR1cmF0aW9uU2Vjb25kcyl9YCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBUaW1lTGFiZWxNb2RlLkN1cnJlbnRBbmRUb3RhbFRpbWU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRleHQoYCR7U3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShwbGF5YmFja1NlY29uZHMpfSAvICR7U3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShkdXJhdGlvblNlY29uZHMpfWApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFBsYXllckV2ZW50ID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyBiZXR3ZWVuIHBsYXliYWNrIGFuZCBwYXVzZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBQbGF5YmFja1RvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1wbGF5YmFja3RvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlBsYXkvUGF1c2VcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlciwgaGFuZGxlQ2xpY2tFdmVudDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGlzU2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGVyIHRvIHVwZGF0ZSBidXR0b24gc3RhdGUgYmFzZWQgb24gcGxheWVyIHN0YXRlXHJcbiAgICAgICAgbGV0IHBsYXliYWNrU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50OiBQbGF5ZXJFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBJZiB0aGUgVUkgaXMgY3VycmVudGx5IHNlZWtpbmcsIHBsYXliYWNrIGlzIHRlbXBvcmFyaWx5IHN0b3BwZWQgYnV0IHRoZSBidXR0b25zIHNob3VsZFxyXG4gICAgICAgICAgICAvLyBub3QgcmVmbGVjdCB0aGF0IGFuZCBzdGF5IGFzLWlzIChlLmcgaW5kaWNhdGUgcGxheWJhY2sgd2hpbGUgc2Vla2luZykuXHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVE9ETyByZXBsYWNlIHRoaXMgaGFjayB3aXRoIGEgc29sZSBwbGF5ZXIuaXNQbGF5aW5nKCkgY2FsbCBvbmNlIGlzc3VlICMxMjAzIGlzIGZpeGVkXHJcbiAgICAgICAgICAgIGxldCBpc1BsYXlpbmcgPSBwbGF5ZXIuaXNQbGF5aW5nKCk7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0aW5nKCkgJiYgZXZlbnQgJiZcclxuICAgICAgICAgICAgICAgIChldmVudC50eXBlID09PSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWSB8fCBldmVudC50eXBlID09PSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWVxyXG4gICAgICAgICAgICAgICAgfHwgZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUExBWUlORyB8fCBldmVudC50eXBlID09PSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QQVVTRSkpIHtcclxuICAgICAgICAgICAgICAgIGlzUGxheWluZyA9ICFpc1BsYXlpbmc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChpc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBDYWxsIGhhbmRsZXIgdXBvbiB0aGVzZSBldmVudHNcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZLCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUEFVU0UsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZQkFDS19GSU5JU0hFRCwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpOyAvLyB3aGVuIHBsYXliYWNrIGZpbmlzaGVzLCBwbGF5ZXIgdHVybnMgdG8gcGF1c2VkIG1vZGVcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0xBVU5DSEVELCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QTEFZSU5HLCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QQVVTRSwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUExBWUJBQ0tfRklOSVNIRUQsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuXHJcbiAgICAgICAgaWYgKGhhbmRsZUNsaWNrRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gQ29udHJvbCBwbGF5ZXIgYnkgYnV0dG9uIGV2ZW50c1xyXG4gICAgICAgICAgICAvLyBXaGVuIGEgYnV0dG9uIGV2ZW50IHRyaWdnZXJzIGEgcGxheWVyIEFQSSBjYWxsLCBldmVudHMgYXJlIGZpcmVkIHdoaWNoIGluIHR1cm4gY2FsbCB0aGUgZXZlbnQgaGFuZGxlclxyXG4gICAgICAgICAgICAvLyBhYm92ZSB0aGF0IHVwZGF0ZWQgdGhlIGJ1dHRvbiBzdGF0ZS5cclxuICAgICAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmlzUGxheWluZygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVHJhY2sgVUkgc2Vla2luZyBzdGF0dXNcclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTdGFydHVwIGluaXRcclxuICAgICAgICBwbGF5YmFja1N0YXRlSGFuZGxlcihudWxsKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge1VJTWFuYWdlciwgVUlSZWNvbW1lbmRhdGlvbkNvbmZpZ30gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIGFuZCBkaXNwbGF5cyByZWNvbW1lbmRlZCB2aWRlb3MuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUmVjb21tZW5kYXRpb25PdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29udGFpbmVyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXJlY29tbWVuZGF0aW9uLW92ZXJsYXlcIixcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBpZiAoIXVpbWFuYWdlci5nZXRDb25maWcoKSB8fCAhdWltYW5hZ2VyLmdldENvbmZpZygpLnJlY29tbWVuZGF0aW9ucyB8fCB1aW1hbmFnZXIuZ2V0Q29uZmlnKCkucmVjb21tZW5kYXRpb25zLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgbm8gcmVjb21tZW5kYXRpb24gaXRlbXMsIHNvIGRvbid0IG5lZWQgdG8gY29uZmlndXJlIGFueXRoaW5nXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdWltYW5hZ2VyLmdldENvbmZpZygpLnJlY29tbWVuZGF0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLmFkZENvbXBvbmVudChuZXcgUmVjb21tZW5kYXRpb25JdGVtKHtpdGVtQ29uZmlnOiBpdGVtfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudHMoKTsgLy8gY3JlYXRlIGNvbnRhaW5lciBET00gZWxlbWVudHNcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSByZWNvbW1lbmRhdGlvbnMgd2hlbiBwbGF5YmFjayBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZQkFDS19GSU5JU0hFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBEaXNtaXNzIE9OX1BMQVlCQUNLX0ZJTklTSEVEIGV2ZW50cyBhdCB0aGUgZW5kIG9mIGFkc1xyXG4gICAgICAgICAgICAvLyBUT0RPIHJlbW92ZSB0aGlzIHdvcmthcm91bmQgb25jZSBpc3N1ZSAjMTI3OCBpcyBzb2x2ZWRcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0FkKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gSGlkZSByZWNvbW1lbmRhdGlvbnMgd2hlbiBwbGF5YmFjayBzdGFydHMsIGUuZy4gYSByZXN0YXJ0XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFJlY29tbWVuZGF0aW9uSXRlbX1cclxuICovXHJcbmludGVyZmFjZSBSZWNvbW1lbmRhdGlvbkl0ZW1Db25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgaXRlbUNvbmZpZzogVUlSZWNvbW1lbmRhdGlvbkNvbmZpZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEFuIGl0ZW0gb2YgdGhlIHtAbGluayBSZWNvbW1lbmRhdGlvbk92ZXJsYXl9LiBVc2VkIG9ubHkgaW50ZXJuYWxseSBpbiB7QGxpbmsgUmVjb21tZW5kYXRpb25PdmVybGF5fS5cclxuICovXHJcbmNsYXNzIFJlY29tbWVuZGF0aW9uSXRlbSBleHRlbmRzIENvbXBvbmVudDxSZWNvbW1lbmRhdGlvbkl0ZW1Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktcmVjb21tZW5kYXRpb24taXRlbVwiLFxyXG4gICAgICAgICAgICBpdGVtQ29uZmlnOiBudWxsIC8vIHRoaXMgbXVzdCBiZSBwYXNzZWQgaW4gZnJvbSBvdXRzaWRlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgY29uZmlnID0gKDxSZWNvbW1lbmRhdGlvbkl0ZW1Db25maWc+dGhpcy5jb25maWcpLml0ZW1Db25maWc7IC8vIFRPRE8gZml4IGdlbmVyaWNzIGFuZCBnZXQgcmlkIG9mIGNhc3RcclxuXHJcbiAgICAgICAgbGV0IGl0ZW1FbGVtZW50ID0gbmV3IERPTShcImFcIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpLFxyXG4gICAgICAgICAgICBcImhyZWZcIjogY29uZmlnLnVybFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgYmdFbGVtZW50ID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJ0aHVtYm5haWxcIlxyXG4gICAgICAgIH0pLmNzcyh7XCJiYWNrZ3JvdW5kLWltYWdlXCI6IGB1cmwoJHtjb25maWcudGh1bWJuYWlsfSlgfSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKGJnRWxlbWVudCk7XHJcblxyXG4gICAgICAgIGxldCB0aXRsZUVsZW1lbnQgPSBuZXcgRE9NKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJ0aXRsZVwiXHJcbiAgICAgICAgfSkuaHRtbChjb25maWcudGl0bGUpO1xyXG4gICAgICAgIGl0ZW1FbGVtZW50LmFwcGVuZCh0aXRsZUVsZW1lbnQpO1xyXG5cclxuICAgICAgICBsZXQgdGltZUVsZW1lbnQgPSBuZXcgRE9NKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJkdXJhdGlvblwiXHJcbiAgICAgICAgfSkuaHRtbChTdHJpbmdVdGlscy5zZWNvbmRzVG9UaW1lKGNvbmZpZy5kdXJhdGlvbikpO1xyXG4gICAgICAgIGl0ZW1FbGVtZW50LmFwcGVuZCh0aW1lRWxlbWVudCk7XHJcblxyXG4gICAgICAgIHJldHVybiBpdGVtRWxlbWVudDtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb21wb25lbnQsIENvbXBvbmVudENvbmZpZ30gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcbmltcG9ydCB7RXZlbnQsIEV2ZW50RGlzcGF0Y2hlciwgTm9BcmdzfSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7U2Vla0JhckxhYmVsfSBmcm9tIFwiLi9zZWVrYmFybGFiZWxcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgdGhlIHtAbGluayBTZWVrQmFyfSBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFNlZWtCYXJDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGFiZWwgYWJvdmUgdGhlIHNlZWsgcG9zaXRpb24uXHJcbiAgICAgKi9cclxuICAgIGxhYmVsPzogU2Vla0JhckxhYmVsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBCYXIgd2lsbCBiZSB2ZXJ0aWNhbCBpbnN0ZWFkIG9mIGhvcml6b250YWwgaWYgc2V0IHRvIHRydWUuXHJcbiAgICAgKi9cclxuICAgIHZlcnRpY2FsPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEV2ZW50IGFyZ3VtZW50IGludGVyZmFjZSBmb3IgYSBzZWVrIHByZXZpZXcgZXZlbnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFNlZWtQcmV2aWV3RXZlbnRBcmdzIGV4dGVuZHMgTm9BcmdzIHtcclxuICAgIC8qKlxyXG4gICAgICogVGVsbHMgaWYgdGhlIHNlZWsgcHJldmlldyBldmVudCBjb21lcyBmcm9tIGEgc2NydWJiaW5nLlxyXG4gICAgICovXHJcbiAgICBzY3J1YmJpbmc6IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0aW1lbGluZSBwb3NpdGlvbiBpbiBwZXJjZW50IHdoZXJlIHRoZSBldmVudCBvcmlnaW5hdGVzIGZyb20uXHJcbiAgICAgKi9cclxuICAgIHBvc2l0aW9uOiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIHNlZWsgYmFyIHRvIHNlZWsgd2l0aGluIHRoZSBwbGF5ZXIncyBtZWRpYS4gSXQgZGlzcGxheXMgdGhlIHB1cnJlbnQgcGxheWJhY2sgcG9zaXRpb24sIGFtb3VudCBvZiBidWZmZWQgZGF0YSwgc2Vla1xyXG4gKiB0YXJnZXQsIGFuZCBrZWVwcyBzdGF0dXMgYWJvdXQgYW4gb25nb2luZyBzZWVrLlxyXG4gKlxyXG4gKiBUaGUgc2VlayBiYXIgZGlzcGxheXMgZGlmZmVyZW50IFwiYmFyc1wiOlxyXG4gKiAgLSB0aGUgcGxheWJhY2sgcG9zaXRpb24sIGkuZS4gdGhlIHBvc2l0aW9uIGluIHRoZSBtZWRpYSBhdCB3aGljaCB0aGUgcGxheWVyIGN1cnJlbnQgcGxheWJhY2sgcG9pbnRlciBpcyBwb3NpdGlvbmVkXHJcbiAqICAtIHRoZSBidWZmZXIgcG9zaXRpb24sIHdoaWNoIHVzdWFsbHkgaXMgdGhlIHBsYXliYWNrIHBvc2l0aW9uIHBsdXMgdGhlIHRpbWUgc3BhbiB0aGF0IGlzIGFscmVhZHkgYnVmZmVyZWQgYWhlYWRcclxuICogIC0gdGhlIHNlZWsgcG9zaXRpb24sIHVzZWQgdG8gcHJldmlldyB0byB3aGVyZSBpbiB0aGUgdGltZWxpbmUgYSBzZWVrIHdpbGwganVtcCB0b1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNlZWtCYXIgZXh0ZW5kcyBDb21wb25lbnQ8U2Vla0JhckNvbmZpZz4ge1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIENTUyBjbGFzcyB0aGF0IGlzIGFkZGVkIHRvIHRoZSBET00gZWxlbWVudCB3aGlsZSB0aGUgc2VlayBiYXIgaXMgaW4gXCJzZWVraW5nXCIgc3RhdGUuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX1NFRUtJTkcgPSBcInNlZWtpbmdcIjtcclxuXHJcbiAgICBwcml2YXRlIHNlZWtCYXI6IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhclBsYXliYWNrUG9zaXRpb246IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhckJ1ZmZlclBvc2l0aW9uOiBET007XHJcbiAgICBwcml2YXRlIHNlZWtCYXJTZWVrUG9zaXRpb246IERPTTtcclxuICAgIHByaXZhdGUgc2Vla0JhckJhY2tkcm9wOiBET007XHJcblxyXG4gICAgcHJpdmF0ZSBsYWJlbDogU2Vla0JhckxhYmVsO1xyXG5cclxuICAgIHByaXZhdGUgc2Vla0JhckV2ZW50cyA9IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlZCB3aGVuIGEgc2NydWJiaW5nIHNlZWsgb3BlcmF0aW9uIGlzIHN0YXJ0ZWQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25TZWVrOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlZCBkdXJpbmcgYSBzY3J1YmJpbmcgc2VlayB0byBpbmRpY2F0ZSB0aGF0IHRoZSBzZWVrIHByZXZpZXcgKGkuZS4gdGhlIHZpZGVvIGZyYW1lKSBzaG91bGQgYmUgdXBkYXRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtQcmV2aWV3OiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIFNlZWtQcmV2aWV3RXZlbnRBcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBoYXMgZmluaXNoZWQgb3Igd2hlbiBhIGRpcmVjdCBzZWVrIGlzIGlzc3VlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBudW1iZXI+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTZWVrQmFyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNlZWtiYXJcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IHRoaXMuY29uZmlnLmxhYmVsO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRpYWxpemUoKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuaW5pdGlhbGl6ZSgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNMYWJlbCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0TGFiZWwoKS5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyLCBjb25maWd1cmVTZWVrOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGlmICghY29uZmlndXJlU2Vlaykge1xyXG4gICAgICAgICAgICAvLyBUaGUgY29uZmlndXJlU2VlayBmbGFnIGNhbiBiZSB1c2VkIGJ5IHN1YmNsYXNzZXMgdG8gZGlzYWJsZSBjb25maWd1cmF0aW9uIGFzIHNlZWsgYmFyLiBFLmcuIHRoZSB2b2x1bWVcclxuICAgICAgICAgICAgLy8gc2xpZGVyIGlzIHJldXNpbmcgdGhpcyBjb21wb25lbnQgYnV0IGFkZHMgaXRzIG93biBmdW5jdGlvbmFsaXR5LCBhbmQgZG9lcyBub3QgbmVlZCB0aGUgc2VlayBmdW5jdGlvbmFsaXR5LlxyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGFjdHVhbGx5IGEgaGFjaywgdGhlIHByb3BlciBzb2x1dGlvbiB3b3VsZCBiZSBmb3IgYm90aCBzZWVrIGJhciBhbmQgdm9sdW1lIHNsaWRlcnMgdG8gZXh0ZW5kXHJcbiAgICAgICAgICAgIC8vIGEgY29tbW9uIGJhc2Ugc2xpZGVyIGNvbXBvbmVudCBhbmQgaW1wbGVtZW50IHRoZWlyIGZ1bmN0aW9uYWxpdHkgdGhlcmUuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgcGxheWJhY2tOb3RJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGlzUGxheWluZyA9IGZhbHNlO1xyXG4gICAgICAgIGxldCBpc1NlZWtpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIHBsYXliYWNrIGFuZCBidWZmZXIgcG9zaXRpb25zXHJcbiAgICAgICAgbGV0IHBsYXliYWNrUG9zaXRpb25IYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBPbmNlIHRoaXMgaGFuZGxlciBvcyBjYWxsZWQsIHBsYXliYWNrIGhhcyBiZWVuIHN0YXJ0ZWQgYW5kIHdlIHNldCB0aGUgZmxhZyB0byBmYWxzZVxyXG4gICAgICAgICAgICBwbGF5YmFja05vdEluaXRpYWxpemVkID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBjYXVnaHQgYSBzZWVrIHByZXZpZXcgc2VlaywgZG8gbm90IHVwZGF0ZSB0aGUgc2Vla2JhclxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdldE1heFRpbWVTaGlmdCgpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjYXNlIG11c3QgYmUgZXhwbGljaXRseSBoYW5kbGVkIHRvIGF2b2lkIGRpdmlzaW9uIGJ5IHplcm9cclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24oMTAwKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwbGF5YmFja1Bvc2l0aW9uUGVyY2VudGFnZSA9IDEwMCAtICgxMDAgLyBwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgKiBwbGF5ZXIuZ2V0VGltZVNoaWZ0KCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbihwbGF5YmFja1Bvc2l0aW9uUGVyY2VudGFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIHNob3cgZnVsbCBidWZmZXIgZm9yIGxpdmUgc3RyZWFtc1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRCdWZmZXJQb3NpdGlvbigxMDApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlID0gMTAwIC8gcGxheWVyLmdldER1cmF0aW9uKCkgKiBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbihwbGF5YmFja1Bvc2l0aW9uUGVyY2VudGFnZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGJ1ZmZlclBlcmNlbnRhZ2UgPSAxMDAgLyBwbGF5ZXIuZ2V0RHVyYXRpb24oKSAqIHBsYXllci5nZXRWaWRlb0J1ZmZlckxlbmd0aCgpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRCdWZmZXJQb3NpdGlvbihwbGF5YmFja1Bvc2l0aW9uUGVyY2VudGFnZSArIGJ1ZmZlclBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUkVBRFksIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gUmVzZXQgZmxhZyB3aGVuIGEgbmV3IHNvdXJjZSBpcyBsb2FkZWRcclxuICAgICAgICAgICAgcGxheWJhY2tOb3RJbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBzZWVrYmFyIHVwb24gdGhlc2UgZXZlbnRzXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9DSEFOR0VELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBwbGF5YmFjayBwb3NpdGlvbiB3aGVuIGl0IGNoYW5nZXNcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVE9QX0JVRkZFUklORywgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgYnVmZmVybGV2ZWwgd2hlbiBidWZmZXJpbmcgaXMgY29tcGxldGVcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLRUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIHBsYXliYWNrIHBvc2l0aW9uIHdoZW4gYSBzZWVrIGhhcyBmaW5pc2hlZFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfU0hJRlRFRCwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgcGxheWJhY2sgcG9zaXRpb24gd2hlbiBhIHRpbWVzaGlmdCBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUdNRU5UX1JFUVVFU1RfRklOSVNIRUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIGJ1ZmZlcmxldmVsIHdoZW4gYSBzZWdtZW50IGhhcyBiZWVuIGRvd25sb2FkZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1RJTUVfVVBEQVRFLCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBwbGF5YmFjayBwb3NpdGlvbiBvZiBDYXN0IHBsYXliYWNrXHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFRUssIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFRUtFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcoZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfU0hJRlQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKHRydWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfU0hJRlRFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcoZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgc2VlayA9IGZ1bmN0aW9uIChwZXJjZW50YWdlOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0xpdmUoKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnRpbWVTaGlmdChwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgLSAocGxheWVyLmdldE1heFRpbWVTaGlmdCgpICogKHBlcmNlbnRhZ2UgLyAxMDApKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuc2VlayhwbGF5ZXIuZ2V0RHVyYXRpb24oKSAqIChwZXJjZW50YWdlIC8gMTAwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHNlbGYub25TZWVrLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IHRydWU7IC8vIHRyYWNrIHNlZWtpbmcgc3RhdHVzIHNvIHdlIGNhbiBjYXRjaCBldmVudHMgZnJvbSBzZWVrIHByZXZpZXcgc2Vla3NcclxuXHJcbiAgICAgICAgICAgIC8vIE5vdGlmeSBVSSBtYW5hZ2VyIG9mIHN0YXJ0ZWQgc2Vla1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25TZWVrLmRpc3BhdGNoKHNlbmRlcik7XHJcblxyXG4gICAgICAgICAgICAvLyBTYXZlIGN1cnJlbnQgcGxheWJhY2sgc3RhdGVcclxuICAgICAgICAgICAgaXNQbGF5aW5nID0gcGxheWVyLmlzUGxheWluZygpO1xyXG5cclxuICAgICAgICAgICAgLy8gUGF1c2UgcGxheWJhY2sgd2hpbGUgc2Vla2luZ1xyXG4gICAgICAgICAgICBpZiAoaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYub25TZWVrUHJldmlldy5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogU2Vla0JhciwgYXJnczogU2Vla1ByZXZpZXdFdmVudEFyZ3MpIHtcclxuICAgICAgICAgICAgLy8gTm90aWZ5IFVJIG1hbmFnZXIgb2Ygc2VlayBwcmV2aWV3XHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vblNlZWtQcmV2aWV3LmRpc3BhdGNoKHNlbmRlciwgYXJncy5wb3NpdGlvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5vblNlZWtQcmV2aWV3LnN1YnNjcmliZVJhdGVMaW1pdGVkKGZ1bmN0aW9uIChzZW5kZXI6IFNlZWtCYXIsIGFyZ3M6IFNlZWtQcmV2aWV3RXZlbnRBcmdzKSB7XHJcbiAgICAgICAgICAgIC8vIFJhdGUtbGltaXRlZCBzY3J1YmJpbmcgc2Vla1xyXG4gICAgICAgICAgICBpZiAoYXJncy5zY3J1YmJpbmcpIHtcclxuICAgICAgICAgICAgICAgIHNlZWsoYXJncy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgIHNlbGYub25TZWVrZWQuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIHBlcmNlbnRhZ2UpIHtcclxuICAgICAgICAgICAgaXNTZWVraW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBwbGF5YmFjayBoYXMgbm90IGJlZW4gc3RhcnRlZCBiZWZvcmUsIHdlIG5lZWQgdG8gY2FsbCBwbGF5IHRvIGluIGl0IHRoZSBwbGF5YmFjayBlbmdpbmUgZm9yIHRoZVxyXG4gICAgICAgICAgICAvLyBzZWVrIHRvIHdvcmsuIFdlIGNhbGwgcGF1c2UoKSBpbW1lZGlhdGVseSBhZnRlcndhcmRzIGJlY2F1c2Ugd2UgYWN0dWFsbHkgZG8gbm90IHdhbnQgdG8gcGxheSBiYWNrIGFueXRoaW5nLlxyXG4gICAgICAgICAgICAvLyBUaGUgZmxhZyBzZXJ2ZXMgdG8gY2FsbCBwbGF5L3BhdXNlIG9ubHkgb24gdGhlIGZpcnN0IHNlZWsgYmVmb3JlIHBsYXliYWNrIGhhcyBzdGFydGVkLCBpbnN0ZWFkIG9mIGV2ZXJ5XHJcbiAgICAgICAgICAgIC8vIHRpbWUgYSBzZWVrIGlzIGlzc3VlZC5cclxuICAgICAgICAgICAgaWYgKHBsYXliYWNrTm90SW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgICAgIHBsYXliYWNrTm90SW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRG8gdGhlIHNlZWtcclxuICAgICAgICAgICAgc2VlayhwZXJjZW50YWdlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvbnRpbnVlIHBsYXliYWNrIGFmdGVyIHNlZWsgaWYgcGxheWVyIHdhcyBwbGF5aW5nIHdoZW4gc2VlayBzdGFydGVkXHJcbiAgICAgICAgICAgIGlmIChpc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vdGlmeSBVSSBtYW5hZ2VyIG9mIGZpbmlzaGVkIHNlZWtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uU2Vla2VkLmRpc3BhdGNoKHNlbmRlcik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChzZWxmLmhhc0xhYmVsKCkpIHtcclxuICAgICAgICAgICAgLy8gQ29uZmlndXJlIGEgc2Vla2JhciBsYWJlbCB0aGF0IGlzIGludGVybmFsIHRvIHRoZSBzZWVrYmFyKVxyXG4gICAgICAgICAgICBzZWxmLmdldExhYmVsKCkuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jc3NDbGFzc2VzLnB1c2goXCJ2ZXJ0aWNhbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZWVrQmFyQ29udGFpbmVyID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHNlZWtCYXIgPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInNlZWtiYXJcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhciA9IHNlZWtCYXI7XHJcblxyXG4gICAgICAgIC8vIEluZGljYXRvciB0aGF0IHNob3dzIHRoZSBidWZmZXIgZmlsbCBsZXZlbFxyXG4gICAgICAgIGxldCBzZWVrQmFyQnVmZmVyTGV2ZWwgPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInNlZWtiYXItYnVmZmVybGV2ZWxcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhckJ1ZmZlclBvc2l0aW9uID0gc2Vla0JhckJ1ZmZlckxldmVsO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93cyB0aGUgY3VycmVudCBwbGF5YmFjayBwb3NpdGlvblxyXG4gICAgICAgIGxldCBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbiA9IG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IFwic2Vla2Jhci1wbGF5YmFja3Bvc2l0aW9uXCJcclxuICAgICAgICB9KS5hcHBlbmQobmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJzZWVrYmFyLXBsYXliYWNrcG9zaXRpb24tbWFya2VyXCJcclxuICAgICAgICB9KSk7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyUGxheWJhY2tQb3NpdGlvbiA9IHNlZWtCYXJQbGF5YmFja1Bvc2l0aW9uO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93IHdoZXJlIGEgc2VlayB3aWxsIGdvIHRvXHJcbiAgICAgICAgbGV0IHNlZWtCYXJTZWVrUG9zaXRpb24gPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcInNlZWtiYXItc2Vla3Bvc2l0aW9uXCJcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXJTZWVrUG9zaXRpb24gPSBzZWVrQmFyU2Vla1Bvc2l0aW9uO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93cyB0aGUgZnVsbCBzZWVrYmFyXHJcbiAgICAgICAgbGV0IHNlZWtCYXJCYWNrZHJvcCA9IG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IFwic2Vla2Jhci1iYWNrZHJvcFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyQmFja2Ryb3AgPSBzZWVrQmFyQmFja2Ryb3A7XHJcblxyXG4gICAgICAgIHNlZWtCYXIuYXBwZW5kKHNlZWtCYXJCYWNrZHJvcCwgc2Vla0JhckJ1ZmZlckxldmVsLCBzZWVrQmFyU2Vla1Bvc2l0aW9uLCBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgLy8gRGVmaW5lIGhhbmRsZXIgZnVuY3Rpb25zIHNvIHdlIGNhbiBhdHRhY2gvcmVtb3ZlIHRoZW0gbGF0ZXJcclxuICAgICAgICBsZXQgbW91c2VNb3ZlSGFuZGxlciA9IGZ1bmN0aW9uIChlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXRQZXJjZW50YWdlID0gMTAwICogc2VsZi5nZXRNb3VzZU9mZnNldChlKTtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVrUG9zaXRpb24odGFyZ2V0UGVyY2VudGFnZSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbih0YXJnZXRQZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgc2VsZi5vblNlZWtQcmV2aWV3RXZlbnQodGFyZ2V0UGVyY2VudGFnZSwgdHJ1ZSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgbW91c2VVcEhhbmRsZXIgPSBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgaGFuZGxlcnMsIHNlZWsgb3BlcmF0aW9uIGlzIGZpbmlzaGVkXHJcbiAgICAgICAgICAgIG5ldyBET00oZG9jdW1lbnQpLm9mZihcIm1vdXNlbW92ZVwiLCBtb3VzZU1vdmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub2ZmKFwibW91c2V1cFwiLCBtb3VzZVVwSGFuZGxlcik7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0UGVyY2VudGFnZSA9IDEwMCAqIHNlbGYuZ2V0TW91c2VPZmZzZXQoZSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcoZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgLy8gRmlyZSBzZWVrZWQgZXZlbnRcclxuICAgICAgICAgICAgc2VsZi5vblNlZWtlZEV2ZW50KHRhcmdldFBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEEgc2VlayBhbHdheXMgc3RhcnQgd2l0aCBhIG1vdXNlZG93biBkaXJlY3RseSBvbiB0aGUgc2Vla2Jhci4gVG8gdHJhY2sgYSBzZWVrIGFsc28gb3V0c2lkZSB0aGUgc2Vla2JhclxyXG4gICAgICAgIC8vIChzbyB0aGUgdXNlciBkb2VzIG5vdCBuZWVkIHRvIHRha2UgY2FyZSB0aGF0IHRoZSBtb3VzZSBhbHdheXMgc3RheXMgb24gdGhlIHNlZWtiYXIpLCB3ZSBhdHRhY2ggdGhlIG1vdXNlbW92ZVxyXG4gICAgICAgIC8vIGFuZCBtb3VzZXVwIGhhbmRsZXJzIHRvIHRoZSB3aG9sZSBkb2N1bWVudC4gQSBzZWVrIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSB1c2VyIGxpZnRzIHRoZSBtb3VzZSBrZXkuXHJcbiAgICAgICAgLy8gQSBzZWVrIG1vdXNlIGdlc3R1cmUgaXMgdGh1cyBiYXNpY2FsbHkgYSBjbGljayB3aXRoIGEgbG9uZyB0aW1lIGZyYW1lIGJldHdlZW4gZG93biBhbmQgdXAgZXZlbnRzLlxyXG4gICAgICAgIHNlZWtCYXIub24oXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24gKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gUHJldmVudCBzZWxlY3Rpb24gb2YgRE9NIGVsZW1lbnRzXHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpcmUgc2Vla2VkIGV2ZW50XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrRXZlbnQoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBoYW5kbGVyIHRvIHRyYWNrIHRoZSBzZWVrIG9wZXJhdGlvbiBvdmVyIHRoZSB3aG9sZSBkb2N1bWVudFxyXG4gICAgICAgICAgICBuZXcgRE9NKGRvY3VtZW50KS5vbihcIm1vdXNlbW92ZVwiLCBtb3VzZU1vdmVIYW5kbGVyKTtcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub24oXCJtb3VzZXVwXCIsIG1vdXNlVXBIYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSBzZWVrIHRhcmdldCBpbmRpY2F0b3Igd2hlbiBtb3VzZSBob3ZlcnMgb3ZlciBzZWVrYmFyXHJcbiAgICAgICAgc2Vla0Jhci5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBsZXQgcG9zaXRpb24gPSAxMDAgKiBzZWxmLmdldE1vdXNlT2Zmc2V0KGUpO1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtQb3NpdGlvbihwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrUHJldmlld0V2ZW50KHBvc2l0aW9uLCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5oYXNMYWJlbCgpICYmIHNlbGYuZ2V0TGFiZWwoKS5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldExhYmVsKCkuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhpZGUgc2VlayB0YXJnZXQgaW5kaWNhdG9yIHdoZW4gbW91c2UgbGVhdmVzIHNlZWtiYXJcclxuICAgICAgICBzZWVrQmFyLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtQb3NpdGlvbigwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmhhc0xhYmVsKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0TGFiZWwoKS5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgc2Vla0JhckNvbnRhaW5lci5hcHBlbmQoc2Vla0Jhcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIHNlZWtCYXJDb250YWluZXIuYXBwZW5kKHRoaXMubGFiZWwuZ2V0RG9tRWxlbWVudCgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzZWVrQmFyQ29udGFpbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgaG9yaXpvbnRhbCBtb3VzZSBvZmZzZXQgZnJvbSB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzZWVrIGJhci5cclxuICAgICAqIEBwYXJhbSBlIHRoZSBldmVudCB0byBjYWxjdWxhdGUgdGhlIG9mZnNldCBmcm9tXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBhIG51bWJlciBpbiB0aGUgcmFuZ2Ugb2YgWzAsIDFdLCB3aGVyZSAwIGlzIHRoZSBsZWZ0IGVkZ2UgYW5kIDEgaXMgdGhlIHJpZ2h0IGVkZ2VcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRIb3Jpem9udGFsTW91c2VPZmZzZXQoZTogTW91c2VFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRPZmZzZXRQeCA9IHRoaXMuc2Vla0Jhci5vZmZzZXQoKS5sZWZ0O1xyXG4gICAgICAgIGxldCB3aWR0aFB4ID0gdGhpcy5zZWVrQmFyLndpZHRoKCk7XHJcbiAgICAgICAgbGV0IG9mZnNldFB4ID0gZS5wYWdlWCAtIGVsZW1lbnRPZmZzZXRQeDtcclxuICAgICAgICBsZXQgb2Zmc2V0ID0gMSAvIHdpZHRoUHggKiBvZmZzZXRQeDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2FuaXRpemVPZmZzZXQob2Zmc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIHZlcnRpY2FsIG1vdXNlIG9mZnNldCBmcm9tIHRoZSBib3R0b20gZWRnZSBvZiB0aGUgc2VlayBiYXIuXHJcbiAgICAgKiBAcGFyYW0gZSB0aGUgZXZlbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgZnJvbVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gYSBudW1iZXIgaW4gdGhlIHJhbmdlIG9mIFswLCAxXSwgd2hlcmUgMCBpcyB0aGUgYm90dG9tIGVkZ2UgYW5kIDEgaXMgdGhlIHRvcCBlZGdlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0VmVydGljYWxNb3VzZU9mZnNldChlOiBNb3VzZUV2ZW50KTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgZWxlbWVudE9mZnNldFB4ID0gdGhpcy5zZWVrQmFyLm9mZnNldCgpLnRvcDtcclxuICAgICAgICBsZXQgd2lkdGhQeCA9IHRoaXMuc2Vla0Jhci5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0UHggPSBlLnBhZ2VZIC0gZWxlbWVudE9mZnNldFB4O1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAxIC8gd2lkdGhQeCAqIG9mZnNldFB4O1xyXG5cclxuICAgICAgICByZXR1cm4gMSAtIHRoaXMuc2FuaXRpemVPZmZzZXQob2Zmc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIG1vdXNlIG9mZnNldCBmb3IgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiAoaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCkuXHJcbiAgICAgKiBAcGFyYW0gZSB0aGUgZXZlbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgZnJvbVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gYSBudW1iZXIgaW4gdGhlIHJhbmdlIG9mIFswLCAxXVxyXG4gICAgICogQHNlZSAjZ2V0SG9yaXpvbnRhbE1vdXNlT2Zmc2V0XHJcbiAgICAgKiBAc2VlICNnZXRWZXJ0aWNhbE1vdXNlT2Zmc2V0XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0TW91c2VPZmZzZXQoZTogTW91c2VFdmVudCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFZlcnRpY2FsTW91c2VPZmZzZXQoZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SG9yaXpvbnRhbE1vdXNlT2Zmc2V0KGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNhbml0aXplcyB0aGUgbW91c2Ugb2Zmc2V0IHRvIHRoZSByYW5nZSBvZiBbMCwgMV0uXHJcbiAgICAgKlxyXG4gICAgICogV2hlbiB0cmFja2luZyB0aGUgbW91c2Ugb3V0c2lkZSB0aGUgc2VlayBiYXIsIHRoZSBvZmZzZXQgY2FuIGJlIG91dHNpZGUgdGhlIGRlc2lyZWQgcmFuZ2UgYW5kIHRoaXMgbWV0aG9kXHJcbiAgICAgKiBsaW1pdHMgaXQgdG8gdGhlIGRlc2lyZWQgcmFuZ2UuIEUuZy4gYSBtb3VzZSBldmVudCBsZWZ0IG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgYSBzZWVrIGJhciB5aWVsZHMgYW4gb2Zmc2V0IGJlbG93XHJcbiAgICAgKiB6ZXJvLCBidXQgdG8gZGlzcGxheSB0aGUgc2VlayB0YXJnZXQgb24gdGhlIHNlZWsgYmFyLCB3ZSBuZWVkIHRvIGxpbWl0IGl0IHRvIHplcm8uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG9mZnNldCB0aGUgb2Zmc2V0IHRvIHNhbml0aXplXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgc2FuaXRpemVkIG9mZnNldC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZU9mZnNldChvZmZzZXQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIFNpbmNlIHdlIHRyYWNrIG1vdXNlIG1vdmVzIG92ZXIgdGhlIHdob2xlIGRvY3VtZW50LCB0aGUgdGFyZ2V0IGNhbiBiZSBvdXRzaWRlIHRoZSBzZWVrIHJhbmdlLFxyXG4gICAgICAgIC8vIGFuZCB3ZSBuZWVkIHRvIGxpbWl0IGl0IHRvIHRoZSBbMCwgMV0gcmFuZ2UuXHJcbiAgICAgICAgaWYgKG9mZnNldCA8IDApIHtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCA+IDEpIHtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWJhY2sgcG9zaXRpb24gaW5kaWNhdG9yLlxyXG4gICAgICogQHBhcmFtIHBlcmNlbnQgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMDAgYXMgcmV0dXJuZWQgYnkgdGhlIHBsYXllclxyXG4gICAgICovXHJcbiAgICBzZXRQbGF5YmFja1Bvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyUGxheWJhY2tQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiB1bnRpbCB3aGljaCBtZWRpYSBpcyBidWZmZXJlZC5cclxuICAgICAqIEBwYXJhbSBwZXJjZW50IGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTAwXHJcbiAgICAgKi9cclxuICAgIHNldEJ1ZmZlclBvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyQnVmZmVyUG9zaXRpb24sIHBlcmNlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9zaXRpb24gd2hlcmUgYSBzZWVrLCBpZiBleGVjdXRlZCwgd291bGQganVtcCB0by5cclxuICAgICAqIEBwYXJhbSBwZXJjZW50IGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTAwXHJcbiAgICAgKi9cclxuICAgIHNldFNlZWtQb3NpdGlvbihwZXJjZW50OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMuc2Vla0JhclNlZWtQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGFjdHVhbCBwb3NpdGlvbiAod2lkdGggb3IgaGVpZ2h0KSBvZiBhIERPTSBlbGVtZW50IHRoYXQgcmVwcmVzZW50IGEgYmFyIGluIHRoZSBzZWVrIGJhci5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIHNldCB0aGUgcG9zaXRpb24gZm9yXHJcbiAgICAgKiBAcGFyYW0gcGVyY2VudCBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEwMFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNldFBvc2l0aW9uKGVsZW1lbnQ6IERPTSwgcGVyY2VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gdGhpcy5jb25maWcudmVydGljYWwgPyB7XCJoZWlnaHRcIjogcGVyY2VudCArIFwiJVwifSA6IHtcIndpZHRoXCI6IHBlcmNlbnQgKyBcIiVcIn07XHJcbiAgICAgICAgZWxlbWVudC5jc3Moc3R5bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHV0cyB0aGUgc2VlayBiYXIgaW50byBvciBvdXQgb2Ygc2Vla2luZyBzdGF0ZSBieSBhZGRpbmcvcmVtb3ZpbmcgYSBjbGFzcyB0byB0aGUgRE9NIGVsZW1lbnQuIFRoaXMgY2FuIGJlIHVzZWRcclxuICAgICAqIHRvIGFkanVzdCB0aGUgc3R5bGluZyB3aGlsZSBzZWVraW5nLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBzZWVraW5nIHNob3VsZCBiZSB0cnVlIHdoZW4gZW50ZXJpbmcgc2VlayBzdGF0ZSwgZmFsc2Ugd2hlbiBleGl0aW5nIHRoZSBzZWVrIHN0YXRlXHJcbiAgICAgKi9cclxuICAgIHNldFNlZWtpbmcoc2Vla2luZzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChzZWVraW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKFNlZWtCYXIuQ0xBU1NfU0VFS0lORyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MoU2Vla0Jhci5DTEFTU19TRUVLSU5HKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHNlZWsgYmFyIGlzIGN1cnJlbnRseSBpbiB0aGUgc2VlayBzdGF0ZS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGluIHNlZWsgc3RhdGUsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNTZWVraW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldERvbUVsZW1lbnQoKS5oYXNDbGFzcyhTZWVrQmFyLkNMQVNTX1NFRUtJTkcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzZWVrIGJhciBoYXMgYSB7QGxpbmsgU2Vla0JhckxhYmVsfS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBzZWVrIGJhciBoYXMgYSBsYWJlbCwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBoYXNMYWJlbCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbCAhPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgbGFiZWwgb2YgdGhpcyBzZWVrIGJhci5cclxuICAgICAqIEByZXR1cm5zIHtTZWVrQmFyTGFiZWx9IHRoZSBsYWJlbCBpZiB0aGlzIHNlZWsgYmFyIGhhcyBhIGxhYmVsLCBlbHNlIG51bGxcclxuICAgICAqL1xyXG4gICAgZ2V0TGFiZWwoKTogU2Vla0JhckxhYmVsIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWsuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla1ByZXZpZXdFdmVudChwZXJjZW50YWdlOiBudW1iZXIsIHNjcnViYmluZzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwuc2V0VGV4dChwZXJjZW50YWdlICsgXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwuZ2V0RG9tRWxlbWVudCgpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcImxlZnRcIjogcGVyY2VudGFnZSArIFwiJVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrUHJldmlldy5kaXNwYXRjaCh0aGlzLCB7c2NydWJiaW5nOiBzY3J1YmJpbmcsIHBvc2l0aW9uOiBwZXJjZW50YWdlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla2VkRXZlbnQocGVyY2VudGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vla2VkLmRpc3BhdGNoKHRoaXMsIHBlcmNlbnRhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGEgc2NydWJiaW5nIHNlZWsgb3BlcmF0aW9uIGlzIHN0YXJ0ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2Vla0JhciwgTm9BcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uU2VlaygpOiBFdmVudDxTZWVrQmFyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vlay5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCBkdXJpbmcgYSBzY3J1YmJpbmcgc2VlayAodG8gaW5kaWNhdGUgdGhhdCB0aGUgc2VlayBwcmV2aWV3LCBpLmUuIHRoZSB2aWRlbyBmcmFtZSxcclxuICAgICAqIHNob3VsZCBiZSB1cGRhdGVkKSwgb3IgZHVyaW5nIGEgbm9ybWFsIHNlZWsgcHJldmlldyB3aGVuIHRoZSBzZWVrIGJhciBpcyBob3ZlcmVkIChhbmQgdGhlIHNlZWsgdGFyZ2V0LFxyXG4gICAgICogaS5lLiB0aGUgc2VlayBiYXIgbGFiZWwsIHNob3VsZCBiZSB1cGRhdGVkKS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZWVrQmFyLCBTZWVrUHJldmlld0V2ZW50QXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblNlZWtQcmV2aWV3KCk6IEV2ZW50PFNlZWtCYXIsIFNlZWtQcmV2aWV3RXZlbnRBcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtQcmV2aWV3LmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBoYXMgZmluaXNoZWQgb3Igd2hlbiBhIGRpcmVjdCBzZWVrIGlzIGlzc3VlZC5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZWVrQmFyLCBudW1iZXI+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TZWVrZWQoKTogRXZlbnQ8U2Vla0JhciwgbnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgU2Vla0JhckxhYmVsfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vla0JhckxhYmVsQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8vIG5vdGhpbmcgeWV0XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGxhYmVsIGZvciBhIHtAbGluayBTZWVrQmFyfSB0aGF0IGNhbiBkaXNwbGF5IHRoZSBzZWVrIHRhcmdldCB0aW1lIGFuZCBhIHRodW1ibmFpbC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZWVrQmFyTGFiZWwgZXh0ZW5kcyBDb250YWluZXI8U2Vla0JhckxhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBsYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG4gICAgcHJpdmF0ZSB0aHVtYm5haWw6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogU2Vla0JhckxhYmVsQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gbmV3IExhYmVsKHtjc3NDbGFzc2VzOiBbXCJzZWVrYmFyLWxhYmVsXCJdfSk7XHJcbiAgICAgICAgdGhpcy50aHVtYm5haWwgPSBuZXcgQ29tcG9uZW50KHtjc3NDbGFzc2VzOiBbXCJzZWVrYmFyLXRodW1ibmFpbFwiXX0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNlZWtiYXItbGFiZWxcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW25ldyBDb250YWluZXIoe2NvbXBvbmVudHM6IFt0aGlzLnRodW1ibmFpbCwgdGhpcy5sYWJlbF0sIGNzc0NsYXNzOiBcInNlZWtiYXItbGFiZWwtaW5uZXJcIn0pXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrUHJldmlldy5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZSA9IHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAtIHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIChwZXJjZW50YWdlIC8gMTAwKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGltZSh0aW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lID0gcGxheWVyLmdldER1cmF0aW9uKCkgKiAocGVyY2VudGFnZSAvIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWUodGltZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRodW1ibmFpbChwbGF5ZXIuZ2V0VGh1bWIodGltZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGFyYml0cmFyeSB0ZXh0IG9uIHRoZSBsYWJlbC5cclxuICAgICAqIEBwYXJhbSB0ZXh0IHRoZSB0ZXh0IHRvIHNob3cgb24gdGhlIGxhYmVsXHJcbiAgICAgKi9cclxuICAgIHNldFRleHQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbC5zZXRUZXh0KHRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIHRpbWUgdG8gYmUgZGlzcGxheWVkIG9uIHRoZSBsYWJlbC5cclxuICAgICAqIEBwYXJhbSBzZWNvbmRzIHRoZSB0aW1lIGluIHNlY29uZHMgdG8gZGlzcGxheSBvbiB0aGUgbGFiZWxcclxuICAgICAqL1xyXG4gICAgc2V0VGltZShzZWNvbmRzOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFRleHQoU3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShzZWNvbmRzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIG9yIHJlbW92ZXMgYSB0aHVtYm5haWwgb24gdGhlIGxhYmVsLlxyXG4gICAgICogQHBhcmFtIHRodW1ibmFpbCB0aGUgdGh1bWJuYWlsIHRvIGRpc3BsYXkgb24gdGhlIGxhYmVsIG9yIG51bGwgdG8gcmVtb3ZlIGEgZGlzcGxheWVkIHRodW1ibmFpbFxyXG4gICAgICovXHJcbiAgICBzZXRUaHVtYm5haWwodGh1bWJuYWlsOiBiaXRtb3Zpbi5wbGF5ZXIuVGh1bWJuYWlsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCB0aHVtYm5haWxFbGVtZW50ID0gdGhpcy50aHVtYm5haWwuZ2V0RG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICBpZiAodGh1bWJuYWlsID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGh1bWJuYWlsRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlXCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgIFwid2lkdGhcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IG51bGxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHVtYm5haWxFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogXCJpbmhlcml0XCIsXHJcbiAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke3RodW1ibmFpbC51cmx9KWAsXHJcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHRodW1ibmFpbC53ICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogdGh1bWJuYWlsLmggKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb25cIjogYC0ke3RodW1ibmFpbC54fXB4IC0ke3RodW1ibmFpbC55fXB4YFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yLCBMaXN0U2VsZWN0b3JDb25maWd9IGZyb20gXCIuL2xpc3RzZWxlY3RvclwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5cclxuLyoqXHJcbiAqIEEgc2ltcGxlIHNlbGVjdCBib3ggcHJvdmlkaW5nIHRoZSBwb3NzaWJpbGl0eSB0byBzZWxlY3QgYSBzaW5nbGUgaXRlbSBvdXQgb2YgYSBsaXN0IG9mIGF2YWlsYWJsZSBpdGVtcy5cclxuICpcclxuICogRE9NIGV4YW1wbGU6XHJcbiAqIDxjb2RlPlxyXG4gKiAgICAgPHNlbGVjdCBjbGFzcz1cInVpLXNlbGVjdGJveFwiPlxyXG4gKiAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJrZXlcIj5sYWJlbDwvb3B0aW9uPlxyXG4gKiAgICAgICAgIC4uLlxyXG4gKiAgICAgPC9zZWxlY3Q+XHJcbiAqIDwvY29kZT5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZWxlY3RCb3ggZXh0ZW5kcyBMaXN0U2VsZWN0b3I8TGlzdFNlbGVjdG9yQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3RFbGVtZW50OiBET007XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktc2VsZWN0Ym94XCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBzZWxlY3RFbGVtZW50ID0gbmV3IERPTShcInNlbGVjdFwiLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RFbGVtZW50ID0gc2VsZWN0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKCk7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBzZWxlY3RFbGVtZW50Lm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3IERPTSh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZEV2ZW50KHZhbHVlLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxlY3RFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB1cGRhdGVEb21JdGVtcyhzZWxlY3RlZFZhbHVlOiBzdHJpbmcgPSBudWxsKSB7XHJcbiAgICAgICAgLy8gRGVsZXRlIGFsbCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMuc2VsZWN0RWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvLyBBZGQgdXBkYXRlZCBjaGlsZHJlblxyXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdGhpcy5pdGVtcykge1xyXG4gICAgICAgICAgICBsZXQgb3B0aW9uRWxlbWVudCA9IG5ldyBET00oXCJvcHRpb25cIiwge1xyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBpdGVtLmtleVxyXG4gICAgICAgICAgICB9KS5odG1sKGl0ZW0ubGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGl0ZW0ua2V5ID09PSBzZWxlY3RlZFZhbHVlICsgXCJcIikgeyAvLyBjb252ZXJ0IHNlbGVjdGVkVmFsdWUgdG8gc3RyaW5nIHRvIGNhdGNoIFwibnVsbFwiL251bGwgY2FzZVxyXG4gICAgICAgICAgICAgICAgb3B0aW9uRWxlbWVudC5hdHRyKFwic2VsZWN0ZWRcIiwgXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RFbGVtZW50LmFwcGVuZChvcHRpb25FbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbUFkZGVkRXZlbnQodmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyLm9uSXRlbUFkZGVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRG9tSXRlbXModGhpcy5zZWxlY3RlZEl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1SZW1vdmVkRXZlbnQodmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyLm9uSXRlbVJlbW92ZWRFdmVudCh2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVEb21JdGVtcyh0aGlzLnNlbGVjdGVkSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbVNlbGVjdGVkRXZlbnQodmFsdWU6IHN0cmluZywgdXBkYXRlRG9tSXRlbXM6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgc3VwZXIub25JdGVtU2VsZWN0ZWRFdmVudCh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHVwZGF0ZURvbUl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRG9tSXRlbXModmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9zZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VmlkZW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi92aWRlb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtBdWRpb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2F1ZGlvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1RpbWVvdXR9IGZyb20gXCIuLi90aW1lb3V0XCI7XHJcbmltcG9ydCB7RXZlbnQsIEV2ZW50RGlzcGF0Y2hlciwgTm9BcmdzfSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFNldHRpbmdzUGFuZWx9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc1BhbmVsQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgc2V0dGluZ3MgcGFuZWwgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogU2V0IHRvIC0xIHRvIGRpc2FibGUgYXV0b21hdGljIGhpZGluZy5cclxuICAgICAqIERlZmF1bHQ6IDMgc2Vjb25kcyAoMzAwMClcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQSBwYW5lbCBjb250YWluaW5nIGEgbGlzdCBvZiB7QGxpbmsgU2V0dGluZ3NQYW5lbEl0ZW0gaXRlbXN9IHRoYXQgcmVwcmVzZW50IGxhYmVsbGVkIHNldHRpbmdzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNldHRpbmdzUGFuZWwgZXh0ZW5kcyBDb250YWluZXI8U2V0dGluZ3NQYW5lbENvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX0xBU1QgPSBcImxhc3RcIjtcclxuXHJcbiAgICBwcml2YXRlIHNldHRpbmdzUGFuZWxFdmVudHMgPSB7XHJcbiAgICAgICAgb25TZXR0aW5nc1N0YXRlQ2hhbmdlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZXR0aW5nc1BhbmVsLCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTZXR0aW5nc1BhbmVsQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnPFNldHRpbmdzUGFuZWxDb25maWc+KGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zZXR0aW5ncy1wYW5lbFwiLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDMwMDBcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IDxTZXR0aW5nc1BhbmVsQ29uZmlnPnRoaXMuZ2V0Q29uZmlnKCk7IC8vIFRPRE8gZml4IGdlbmVyaWNzIHR5cGUgaW5mZXJlbmNlXHJcblxyXG4gICAgICAgIGlmIChjb25maWcuaGlkZURlbGF5ID4gLTEpIHtcclxuICAgICAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dChjb25maWcuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLm9uU2hvdy5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQWN0aXZhdGUgdGltZW91dCB3aGVuIHNob3duXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZXNldCB0aW1lb3V0IG9uIGludGVyYWN0aW9uXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxmLm9uSGlkZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgdGltZW91dCB3aGVuIGhpZGRlbiBmcm9tIG91dHNpZGVcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQuY2xlYXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGaXJlIGV2ZW50IHdoZW4gdGhlIHN0YXRlIG9mIGEgc2V0dGluZ3MtaXRlbSBoYXMgY2hhbmdlZFxyXG4gICAgICAgIGxldCBzZXR0aW5nc1N0YXRlQ2hhbmdlZEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25TZXR0aW5nc1N0YXRlQ2hhbmdlZEV2ZW50KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBdHRhY2ggbWFya2VyIGNsYXNzIHRvIGxhc3QgdmlzaWJsZSBpdGVtXHJcbiAgICAgICAgICAgIGxldCBsYXN0U2hvd25JdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29tcG9uZW50IG9mIHNlbGYuZ2V0SXRlbXMoKSkge1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhTZXR0aW5nc1BhbmVsLkNMQVNTX0xBU1QpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5pc1Nob3duKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsYXN0U2hvd25JdGVtID0gY29tcG9uZW50O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChsYXN0U2hvd25JdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBsYXN0U2hvd25JdGVtLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhTZXR0aW5nc1BhbmVsLkNMQVNTX0xBU1QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5nZXRJdGVtcygpKSB7XHJcbiAgICAgICAgICAgIGNvbXBvbmVudC5vbkFjdGl2ZUNoYW5nZWQuc3Vic2NyaWJlKHNldHRpbmdzU3RhdGVDaGFuZ2VkSGFuZGxlcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZXJlIGFyZSBhY3RpdmUgc2V0dGluZ3Mgd2l0aGluIHRoaXMgc2V0dGluZ3MgcGFuZWwuIEFuIGFjdGl2ZSBzZXR0aW5nIGlzIGEgc2V0dGluZyB0aGF0IGlzIHZpc2libGVcclxuICAgICAqIGFuZCBlbmFibGVkLCB3aGljaCB0aGUgdXNlciBjYW4gaW50ZXJhY3Qgd2l0aC5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZXJlIGFyZSBhY3RpdmUgc2V0dGluZ3MsIGZhbHNlIGlmIHRoZSBwYW5lbCBpcyBmdW5jdGlvbmFsbHkgZW1wdHkgdG8gYSB1c2VyXHJcbiAgICAgKi9cclxuICAgIGhhc0FjdGl2ZVNldHRpbmdzKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiB0aGlzLmdldEl0ZW1zKCkpIHtcclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC5pc0FjdGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0SXRlbXMoKTogU2V0dGluZ3NQYW5lbEl0ZW1bXSB7XHJcbiAgICAgICAgcmV0dXJuIDxTZXR0aW5nc1BhbmVsSXRlbVtdPnRoaXMuY29uZmlnLmNvbXBvbmVudHM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2V0dGluZ3NTdGF0ZUNoYW5nZWRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzUGFuZWxFdmVudHMub25TZXR0aW5nc1N0YXRlQ2hhbmdlZC5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBvbmUgb3IgbW9yZSB7QGxpbmsgU2V0dGluZ3NQYW5lbEl0ZW0gaXRlbXN9IGhhdmUgY2hhbmdlZCBzdGF0ZS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZXR0aW5nc1BhbmVsLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TZXR0aW5nc1N0YXRlQ2hhbmdlZCgpOiBFdmVudDxTZXR0aW5nc1BhbmVsLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nc1BhbmVsRXZlbnRzLm9uU2V0dGluZ3NTdGF0ZUNoYW5nZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEFuIGl0ZW0gZm9yIGEge0BsaW5rIFNldHRpbmdzUGFuZWx9LCBjb250YWluaW5nIGEge0BsaW5rIExhYmVsfSBhbmQgYSBjb21wb25lbnQgdGhhdCBjb25maWd1cmVzIGEgc2V0dGluZy5cclxuICogU3VwcG9ydGVkIHNldHRpbmcgY29tcG9uZW50czoge0BsaW5rIFNlbGVjdEJveH1cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZXR0aW5nc1BhbmVsSXRlbSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcbiAgICBwcml2YXRlIHNldHRpbmc6IFNlbGVjdEJveDtcclxuXHJcbiAgICBwcml2YXRlIHNldHRpbmdzUGFuZWxJdGVtRXZlbnRzID0ge1xyXG4gICAgICAgIG9uQWN0aXZlQ2hhbmdlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZXR0aW5nc1BhbmVsSXRlbSwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxhYmVsOiBzdHJpbmcsIHNlbGVjdEJveDogU2VsZWN0Qm94LCBjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYWJlbCA9IG5ldyBMYWJlbCh7dGV4dDogbGFiZWx9KTtcclxuICAgICAgICB0aGlzLnNldHRpbmcgPSBzZWxlY3RCb3g7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktc2V0dGluZ3MtcGFuZWwtZW50cnlcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMubGFiZWwsIHRoaXMuc2V0dGluZ11cclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBoYW5kbGVDb25maWdJdGVtQ2hhbmdlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVGhlIG1pbmltdW0gbnVtYmVyIG9mIGl0ZW1zIHRoYXQgbXVzdCBiZSBhdmFpbGFibGUgZm9yIHRoZSBzZXR0aW5nIHRvIGJlIGRpc3BsYXllZFxyXG4gICAgICAgICAgICAvLyBCeSBkZWZhdWx0LCBhdCBsZWFzdCB0d28gaXRlbXMgbXVzdCBiZSBhdmFpbGFibGUsIGVsc2UgYSBzZWxlY3Rpb24gaXMgbm90IHBvc3NpYmxlXHJcbiAgICAgICAgICAgIGxldCBtaW5JdGVtc1RvRGlzcGxheSA9IDI7XHJcbiAgICAgICAgICAgIC8vIEF1ZGlvL3ZpZGVvIHF1YWxpdHkgc2VsZWN0IGJveGVzIGNvbnRhaW4gYW4gYWRkaXRpb25hbCBcImF1dG9cIiBtb2RlLCB3aGljaCBpbiBjb21iaW5hdGlvbiB3aXRoIGEgc2luZ2xlIGF2YWlsYWJsZSBxdWFsaXR5IGFsc28gZG9lcyBub3QgbWFrZSBzZW5zZVxyXG4gICAgICAgICAgICBpZiAoc2VsZi5zZXR0aW5nIGluc3RhbmNlb2YgVmlkZW9RdWFsaXR5U2VsZWN0Qm94IHx8IHNlbGYuc2V0dGluZyBpbnN0YW5jZW9mIEF1ZGlvUXVhbGl0eVNlbGVjdEJveCkge1xyXG4gICAgICAgICAgICAgICAgbWluSXRlbXNUb0Rpc3BsYXkgPSAzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBIaWRlIHRoZSBzZXR0aW5nIGlmIG5vIG1lYW5pbmdmdWwgY2hvaWNlIGlzIGF2YWlsYWJsZVxyXG4gICAgICAgICAgICBpZiAoc2VsZi5zZXR0aW5nLml0ZW1Db3VudCgpIDwgbWluSXRlbXNUb0Rpc3BsYXkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFZpc2liaWxpdHkgbWlnaHQgaGF2ZSBjaGFuZ2VkIGFuZCB0aGVyZWZvcmUgdGhlIGFjdGl2ZSBzdGF0ZSBtaWdodCBoYXZlIGNoYW5nZWQgc28gd2UgZmlyZSB0aGUgZXZlbnRcclxuICAgICAgICAgICAgLy8gVE9ETyBmaXJlIG9ubHkgd2hlbiBzdGF0ZSBoYXMgcmVhbGx5IGNoYW5nZWQgKGUuZy4gY2hlY2sgaWYgdmlzaWJpbGl0eSBoYXMgcmVhbGx5IGNoYW5nZWQpXHJcbiAgICAgICAgICAgIHNlbGYub25BY3RpdmVDaGFuZ2VkRXZlbnQoKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLnNldHRpbmcub25JdGVtQWRkZWQuc3Vic2NyaWJlKGhhbmRsZUNvbmZpZ0l0ZW1DaGFuZ2VkKTtcclxuICAgICAgICBzZWxmLnNldHRpbmcub25JdGVtUmVtb3ZlZC5zdWJzY3JpYmUoaGFuZGxlQ29uZmlnSXRlbUNoYW5nZWQpO1xyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXplIGhpZGRlbiBzdGF0ZVxyXG4gICAgICAgIGhhbmRsZUNvbmZpZ0l0ZW1DaGFuZ2VkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhpcyBzZXR0aW5ncyBwYW5lbCBpdGVtIGlzIGFjdGl2ZSwgaS5lLiB2aXNpYmxlIGFuZCBlbmFibGVkIGFuZCBhIHVzZXIgY2FuIGludGVyYWN0IHdpdGggaXQuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgcGFuZWwgaXMgYWN0aXZlLCBlbHNlIGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGlzQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzU2hvd24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25BY3RpdmVDaGFuZ2VkRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR0aW5nc1BhbmVsSXRlbUV2ZW50cy5vbkFjdGl2ZUNoYW5nZWQuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIFwiYWN0aXZlXCIgc3RhdGUgb2YgdGhpcyBpdGVtIGNoYW5nZXMuXHJcbiAgICAgKiBAc2VlICNpc0FjdGl2ZVxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNldHRpbmdzUGFuZWxJdGVtLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25BY3RpdmVDaGFuZ2VkKCk6IEV2ZW50PFNldHRpbmdzUGFuZWxJdGVtLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZXR0aW5nc1BhbmVsSXRlbUV2ZW50cy5vbkFjdGl2ZUNoYW5nZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7U2V0dGluZ3NQYW5lbH0gZnJvbSBcIi4vc2V0dGluZ3NwYW5lbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFNldHRpbmdzVG9nZ2xlQnV0dG9ufS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWcgZXh0ZW5kcyBUb2dnbGVCdXR0b25Db25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgc2V0dGluZ3MgcGFuZWwgd2hvc2UgdmlzaWJpbGl0eSB0aGUgYnV0dG9uIHNob3VsZCB0b2dnbGUuXHJcbiAgICAgKi9cclxuICAgIHNldHRpbmdzUGFuZWw6IFNldHRpbmdzUGFuZWw7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZWNpZGVzIGlmIHRoZSBidXR0b24gc2hvdWxkIGJlIGF1dG9tYXRpY2FsbHkgaGlkZGVuIHdoZW4gdGhlIHNldHRpbmdzIHBhbmVsIGRvZXMgbm90IGNvbnRhaW4gYW55IGFjdGl2ZSBzZXR0aW5ncy5cclxuICAgICAqIERlZmF1bHQ6IHRydWVcclxuICAgICAqL1xyXG4gICAgYXV0b0hpZGVXaGVuTm9BY3RpdmVTZXR0aW5ncz86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgdmlzaWJpbGl0eSBvZiBhIHNldHRpbmdzIHBhbmVsLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNldHRpbmdzVG9nZ2xlQnV0dG9uIGV4dGVuZHMgVG9nZ2xlQnV0dG9uPFNldHRpbmdzVG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIGlmICghY29uZmlnLnNldHRpbmdzUGFuZWwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUmVxdWlyZWQgU2V0dGluZ3NQYW5lbCBpcyBtaXNzaW5nXCIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zZXR0aW5nc3RvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlNldHRpbmdzXCIsXHJcbiAgICAgICAgICAgIHNldHRpbmdzUGFuZWw6IG51bGwsXHJcbiAgICAgICAgICAgIGF1dG9IaWRlV2hlbk5vQWN0aXZlU2V0dGluZ3M6IHRydWVcclxuICAgICAgICB9LCA8U2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjb25maWcgPSA8U2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWc+dGhpcy5nZXRDb25maWcoKTsgLy8gVE9ETyBmaXggZ2VuZXJpY3MgdHlwZSBpbmZlcmVuY2VcclxuICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IGNvbmZpZy5zZXR0aW5nc1BhbmVsO1xyXG5cclxuICAgICAgICB0aGlzLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2V0dGluZ3NQYW5lbC50b2dnbGVIaWRkZW4oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZXR0aW5nc1BhbmVsLm9uU2hvdy5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBTZXQgdG9nZ2xlIHN0YXR1cyB0byBvbiB3aGVuIHRoZSBzZXR0aW5ncyBwYW5lbCBzaG93c1xyXG4gICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2V0dGluZ3NQYW5lbC5vbkhpZGUuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gU2V0IHRvZ2dsZSBzdGF0dXMgdG8gb2ZmIHdoZW4gdGhlIHNldHRpbmdzIHBhbmVsIGhpZGVzXHJcbiAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEhhbmRsZSBhdXRvbWF0aWMgaGlkaW5nIG9mIHRoZSBidXR0b24gaWYgdGhlcmUgYXJlIG5vIHNldHRpbmdzIGZvciB0aGUgdXNlciB0byBpbnRlcmFjdCB3aXRoXHJcbiAgICAgICAgaWYgKGNvbmZpZy5hdXRvSGlkZVdoZW5Ob0FjdGl2ZVNldHRpbmdzKSB7XHJcbiAgICAgICAgICAgIC8vIFNldHVwIGhhbmRsZXIgdG8gc2hvdy9oaWRlIGJ1dHRvbiB3aGVuIHRoZSBzZXR0aW5ncyBjaGFuZ2VcclxuICAgICAgICAgICAgbGV0IHNldHRpbmdzUGFuZWxJdGVtc0NoYW5nZWRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNldHRpbmdzUGFuZWwuaGFzQWN0aXZlU2V0dGluZ3MoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmlzSGlkZGVuKCkpIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5pc1Nob3duKCkpIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAvLyBXaXJlIHRoZSBoYW5kbGVyIHRvIHRoZSBldmVudFxyXG4gICAgICAgICAgICBzZXR0aW5nc1BhbmVsLm9uU2V0dGluZ3NTdGF0ZUNoYW5nZWQuc3Vic2NyaWJlKHNldHRpbmdzUGFuZWxJdGVtc0NoYW5nZWRIYW5kbGVyKTtcclxuICAgICAgICAgICAgLy8gQ2FsbCBoYW5kbGVyIGZvciBmaXJzdCBpbml0IGF0IHN0YXJ0dXBcclxuICAgICAgICAgICAgc2V0dGluZ3NQYW5lbEl0ZW1zQ2hhbmdlZEhhbmRsZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyLCBDb250YWluZXJDb25maWd9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgU3VidGl0bGVDdWVFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZUN1ZUV2ZW50O1xyXG5pbXBvcnQge0xhYmVsLCBMYWJlbENvbmZpZ30gZnJvbSBcIi4vbGFiZWxcIjtcclxuaW1wb3J0IHtDb21wb25lbnRDb25maWcsIENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7Q29udHJvbEJhcn0gZnJvbSBcIi4vY29udHJvbGJhclwiO1xyXG5cclxuLyoqXHJcbiAqIE92ZXJsYXlzIHRoZSBwbGF5ZXIgdG8gZGlzcGxheSBzdWJ0aXRsZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3VidGl0bGVPdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX0NPTlRST0xCQVJfVklTSUJMRSA9IFwiY29udHJvbGJhci12aXNpYmxlXCI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbm5lciBsYWJlbCB0aGF0IHJlbmRlcnMgdGhlIHN1YnRpdGxlIHRleHRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzdWJ0aXRsZUxhYmVsOiBMYWJlbDxMYWJlbENvbmZpZz47XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuc3VidGl0bGVMYWJlbCA9IG5ldyBMYWJlbDxMYWJlbENvbmZpZz4oe2Nzc0NsYXNzOiBcInVpLXN1YnRpdGxlLWxhYmVsXCJ9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zdWJ0aXRsZS1vdmVybGF5XCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnN1YnRpdGxlTGFiZWxdXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DVUVfRU5URVIsIGZ1bmN0aW9uIChldmVudDogU3VidGl0bGVDdWVFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnN1YnRpdGxlTGFiZWwuc2V0VGV4dChldmVudC50ZXh0KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DVUVfRVhJVCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUN1ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3VidGl0bGVMYWJlbC5zZXRUZXh0KFwiXCIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgc3VidGl0bGVDbGVhckhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3VidGl0bGVMYWJlbC5zZXRUZXh0KFwiXCIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRSwgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NVQlRJVExFX0NIQU5HRSwgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NFRUssIHN1YnRpdGxlQ2xlYXJIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZULCBzdWJ0aXRsZUNsZWFySGFuZGxlcik7XHJcblxyXG4gICAgICAgIHVpbWFuYWdlci5vbkNvbXBvbmVudFNob3cuc3Vic2NyaWJlKGZ1bmN0aW9uIChjb21wb25lbnQ6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+KSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQgaW5zdGFuY2VvZiBDb250cm9sQmFyKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhTdWJ0aXRsZU92ZXJsYXkuQ0xBU1NfQ09OVFJPTEJBUl9WSVNJQkxFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbkNvbXBvbmVudEhpZGUuc3Vic2NyaWJlKGZ1bmN0aW9uIChjb21wb25lbnQ6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+KSB7XHJcbiAgICAgICAgICAgIGlmIChjb21wb25lbnQgaW5zdGFuY2VvZiBDb250cm9sQmFyKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhTdWJ0aXRsZU92ZXJsYXkuQ0xBU1NfQ09OVFJPTEJBUl9WSVNJQkxFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFN1YnRpdGxlQWRkZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZUFkZGVkRXZlbnQ7XHJcbmltcG9ydCBTdWJ0aXRsZUNoYW5nZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZUNoYW5nZWRFdmVudDtcclxuaW1wb3J0IFN1YnRpdGxlUmVtb3ZlZEV2ZW50ID0gYml0bW92aW4ucGxheWVyLlN1YnRpdGxlUmVtb3ZlZEV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgc2VsZWN0IGJveCBwcm92aWRpbmcgYSBzZWxlY3Rpb24gYmV0d2VlbiBhdmFpbGFibGUgc3VidGl0bGUgYW5kIGNhcHRpb24gdHJhY2tzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN1YnRpdGxlU2VsZWN0Qm94IGV4dGVuZHMgU2VsZWN0Qm94IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZVN1YnRpdGxlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5jbGVhckl0ZW1zKCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBzdWJ0aXRsZSBvZiBwbGF5ZXIuZ2V0QXZhaWxhYmxlU3VidGl0bGVzKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbShzdWJ0aXRsZS5pZCwgc3VidGl0bGUubGFiZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogU3VidGl0bGVTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldFN1YnRpdGxlKHZhbHVlID09PSBcIm51bGxcIiA/IG51bGwgOiB2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlYWN0IHRvIEFQSSBldmVudHNcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVUJUSVRMRV9BRERFRCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUFkZGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5hZGRJdGVtKGV2ZW50LnN1YnRpdGxlLmlkLCBldmVudC5zdWJ0aXRsZS5sYWJlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfQ0hBTkdFLCBmdW5jdGlvbiAoZXZlbnQ6IFN1YnRpdGxlQ2hhbmdlZEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0SXRlbShldmVudC50YXJnZXRTdWJ0aXRsZS5pZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfUkVNT1ZFRCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZVJlbW92ZWRFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnJlbW92ZUl0ZW0oZXZlbnQuc3VidGl0bGVJZCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlU3VidGl0bGVzKTsgLy8gVXBkYXRlIHN1YnRpdGxlcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlU3VidGl0bGVzKTsgLy8gVXBkYXRlIHN1YnRpdGxlcyB3aGVuIGEgbmV3IHNvdXJjZSBpcyBsb2FkZWRcclxuXHJcbiAgICAgICAgLy8gUG9wdWxhdGUgc3VidGl0bGVzIGF0IHN0YXJ0dXBcclxuICAgICAgICB1cGRhdGVTdWJ0aXRsZXMoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXIsIENvbnRhaW5lckNvbmZpZ30gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7TGFiZWxDb25maWcsIExhYmVsfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1RpbWVvdXR9IGZyb20gXCIuLi90aW1lb3V0XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFRpdGxlQmFyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGl0bGVCYXJDb25maWcgZXh0ZW5kcyBDb250YWluZXJDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVsYXkgaW4gbWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSB0aXRsZSBiYXIgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogRGVmYXVsdDogNSBzZWNvbmRzICg1MDAwKVxyXG4gICAgICovXHJcbiAgICBoaWRlRGVsYXk/OiBudW1iZXI7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBEaXNwbGF5cyBhIHRpdGxlIGJhciBjb250YWluaW5nIGEgbGFiZWwgd2l0aCB0aGUgdGl0bGUgb2YgdGhlIHZpZGVvLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRpdGxlQmFyIGV4dGVuZHMgQ29udGFpbmVyPFRpdGxlQmFyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBsYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVGl0bGVCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMubGFiZWwgPSBuZXcgTGFiZWwoe2Nzc0NsYXNzOiBcInVpLXRpdGxlYmFyLWxhYmVsXCJ9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS10aXRsZWJhclwiLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIGhpZGVEZWxheTogNTAwMCxcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMubGFiZWxdXHJcbiAgICAgICAgfSwgPFRpdGxlQmFyQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKHVpbWFuYWdlci5nZXRDb25maWcoKSAmJiB1aW1hbmFnZXIuZ2V0Q29uZmlnKCkubWV0YWRhdGEpIHtcclxuICAgICAgICAgICAgc2VsZi5sYWJlbC5zZXRUZXh0KHVpbWFuYWdlci5nZXRDb25maWcoKS5tZXRhZGF0YS50aXRsZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gQ2FuY2VsIGNvbmZpZ3VyYXRpb24gaWYgdGhlcmUgaXMgbm8gbWV0YWRhdGEgdG8gZGlzcGxheVxyXG4gICAgICAgICAgICAvLyBUT0RPIHRoaXMgcHJvYmFibHkgd29uJ3Qgd29yayBpZiB3ZSBwdXQgdGhlIHNoYXJlIGJ1dHRvbnMgaW50byB0aGUgdGl0bGUgYmFyXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxUaXRsZUJhckNvbmZpZz5zZWxmLmdldENvbmZpZygpKS5oaWRlRGVsYXksIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlRW50ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7IC8vIHNob3cgY29udHJvbCBiYXIgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSVxyXG5cclxuICAgICAgICAgICAgLy8gQ2xlYXIgdGltZW91dCB0byBhdm9pZCBoaWRpbmcgdGhlIGJhciBpZiB0aGUgbW91c2UgbW92ZXMgYmFjayBpbnRvIHRoZSBVSSBkdXJpbmcgdGhlIHRpbWVvdXQgcGVyaW9kXHJcbiAgICAgICAgICAgIHRpbWVvdXQuY2xlYXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZU1vdmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGltZW91dC5yZXNldCgpOyAvLyBoaWRlIHRoZSBiYXIgaWYgbW91c2UgZG9lcyBub3QgbW92ZSBkdXJpbmcgdGhlIHRpbWVvdXQgdGltZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTGVhdmUuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgdGltZW91dC5yZXNldCgpOyAvLyBoaWRlIGJhciBzb21lIHRpbWUgYWZ0ZXIgdGhlIG1vdXNlIGxlZnQgdGhlIFVJXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7QnV0dG9uLCBCdXR0b25Db25maWd9IGZyb20gXCIuL2J1dHRvblwiO1xyXG5pbXBvcnQge05vQXJncywgRXZlbnREaXNwYXRjaGVyLCBFdmVudH0gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHRvZ2dsZSBidXR0b24gY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUb2dnbGVCdXR0b25Db25maWcgZXh0ZW5kcyBCdXR0b25Db25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGV4dCBvbiB0aGUgYnV0dG9uLlxyXG4gICAgICovXHJcbiAgICB0ZXh0Pzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCBjYW4gYmUgdG9nZ2xlZCBiZXR3ZWVuIFwib25cIiBhbmQgXCJvZmZcIiBzdGF0ZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVG9nZ2xlQnV0dG9uPENvbmZpZyBleHRlbmRzIFRvZ2dsZUJ1dHRvbkNvbmZpZz4gZXh0ZW5kcyBCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ0xBU1NfT04gPSBcIm9uXCI7XHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDTEFTU19PRkYgPSBcIm9mZlwiO1xyXG5cclxuICAgIHByaXZhdGUgb25TdGF0ZTogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIHRvZ2dsZUJ1dHRvbkV2ZW50cyA9IHtcclxuICAgICAgICBvblRvZ2dsZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIG9uVG9nZ2xlT246IG5ldyBFdmVudERpc3BhdGNoZXI8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICBvblRvZ2dsZU9mZjogbmV3IEV2ZW50RGlzcGF0Y2hlcjxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVG9nZ2xlQnV0dG9uQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS10b2dnbGVidXR0b25cIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIGJ1dHRvbiB0byB0aGUgXCJvblwiIHN0YXRlLlxyXG4gICAgICovXHJcbiAgICBvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc09mZigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25TdGF0ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKFRvZ2dsZUJ1dHRvbi5DTEFTU19PRkYpO1xyXG4gICAgICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhUb2dnbGVCdXR0b24uQ0xBU1NfT04pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25Ub2dnbGVPbkV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlcyB0aGUgYnV0dG9uIHRvIHRoZSBcIm9mZlwiIHN0YXRlLlxyXG4gICAgICovXHJcbiAgICBvZmYoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25TdGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhUb2dnbGVCdXR0b24uQ0xBU1NfT04pO1xyXG4gICAgICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhUb2dnbGVCdXR0b24uQ0xBU1NfT0ZGKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub25Ub2dnbGVFdmVudCgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uVG9nZ2xlT2ZmRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGUgdGhlIGJ1dHRvbiBcIm9uXCIgaWYgaXQgaXMgXCJvZmZcIiwgb3IgXCJvZmZcIiBpZiBpdCBpcyBcIm9uXCIuXHJcbiAgICAgKi9cclxuICAgIHRvZ2dsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5pc09uKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5vZmYoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSB0b2dnbGUgYnV0dG9uIGlzIGluIHRoZSBcIm9uXCIgc3RhdGUuXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBidXR0b24gaXMgXCJvblwiLCBmYWxzZSBpZiBcIm9mZlwiXHJcbiAgICAgKi9cclxuICAgIGlzT24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub25TdGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgdG9nZ2xlIGJ1dHRvbiBpcyBpbiB0aGUgXCJvZmZcIiBzdGF0ZS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGJ1dHRvbiBpcyBcIm9mZlwiLCBmYWxzZSBpZiBcIm9uXCJcclxuICAgICAqL1xyXG4gICAgaXNPZmYoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzT24oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25DbGlja0V2ZW50KCkge1xyXG4gICAgICAgIHN1cGVyLm9uQ2xpY2tFdmVudCgpO1xyXG5cclxuICAgICAgICAvLyBGaXJlIHRoZSB0b2dnbGUgZXZlbnQgdG9nZXRoZXIgd2l0aCB0aGUgY2xpY2sgZXZlbnRcclxuICAgICAgICAvLyAodGhleSBhcmUgdGVjaG5pY2FsbHkgdGhlIHNhbWUsIG9ubHkgdGhlIHNlbWFudGljcyBhcmUgZGlmZmVyZW50KVxyXG4gICAgICAgIHRoaXMub25Ub2dnbGVFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblRvZ2dsZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblRvZ2dsZU9uRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGVPbi5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25Ub2dnbGVPZmZFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9mZi5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgYnV0dG9uIGlzIHRvZ2dsZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uVG9nZ2xlKCk6IEV2ZW50PFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGUuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgYnV0dG9uIGlzIHRvZ2dsZWQgXCJvblwiLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblRvZ2dsZU9uKCk6IEV2ZW50PFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGVPbi5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBidXR0b24gaXMgdG9nZ2xlZCBcIm9mZlwiLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblRvZ2dsZU9mZigpOiBFdmVudDxUb2dnbGVCdXR0b248Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlT2ZmLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5cclxuLyoqXHJcbiAqIEFuaW1hdGVkIGFuYWxvZyBUViBzdGF0aWMgbm9pc2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHZOb2lzZUNhbnZhcyBleHRlbmRzIENvbXBvbmVudDxDb21wb25lbnRDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGNhbnZhczogRE9NO1xyXG5cclxuICAgIHByaXZhdGUgY2FudmFzRWxlbWVudDogSFRNTENhbnZhc0VsZW1lbnQ7XHJcbiAgICBwcml2YXRlIGNhbnZhc0NvbnRleHQ6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICAgIHByaXZhdGUgY2FudmFzV2lkdGggPSA1MDA7XHJcbiAgICBwcml2YXRlIGNhbnZhc0hlaWdodCA9IDI4MDtcclxuICAgIHByaXZhdGUgaW50ZXJmZXJlbmNlSGVpZ2h0ID0gMTAwO1xyXG4gICAgcHJpdmF0ZSBsYXN0RnJhbWVVcGRhdGU6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGZyYW1lSW50ZXJ2YWw6IG51bWJlciA9IDYwO1xyXG4gICAgcHJpdmF0ZSB1c2VBbmltYXRpb25GcmFtZTogYm9vbGVhbiA9ICEhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcclxuICAgIHByaXZhdGUgbm9pc2VBbmltYXRpb25XaW5kb3dQb3M6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZnJhbWVVcGRhdGVIYW5kbGVySWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbXBvbmVudENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS10dm5vaXNlY2FudmFzXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcyA9IG5ldyBET00oXCJjYW52YXNcIiwge1wiY2xhc3NcIjogdGhpcy5jb25maWcuY3NzQ2xhc3N9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+dGhpcy5jYW52YXMuZ2V0RWxlbWVudHMoKVswXTtcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRleHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIHRoaXMubm9pc2VBbmltYXRpb25XaW5kb3dQb3MgPSAtdGhpcy5jYW52YXNIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5sYXN0RnJhbWVVcGRhdGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnJlbmRlckZyYW1lKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RvcCgpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy51c2VBbmltYXRpb25GcmFtZSkge1xyXG4gICAgICAgICAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmZyYW1lVXBkYXRlSGFuZGxlcklkKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5mcmFtZVVwZGF0ZUhhbmRsZXJJZCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVuZGVyRnJhbWUoKTogdm9pZCB7XHJcbiAgICAgICAgLy8gVGhpcyBjb2RlIGhhcyBiZWVuIGNvcGllZCBmcm9tIHRoZSBwbGF5ZXIgY29udHJvbHMuanMgYW5kIHNpbXBsaWZpZWRcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubGFzdEZyYW1lVXBkYXRlICsgdGhpcy5mcmFtZUludGVydmFsID4gbmV3IERhdGUoKS5nZXRUaW1lKCkpIHtcclxuICAgICAgICAgICAgLy8gSXQncyB0b28gZWFybHkgdG8gcmVuZGVyIHRoZSBuZXh0IGZyYW1lXHJcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVOZXh0UmVuZGVyKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjdXJyZW50UGl4ZWxPZmZzZXQ7XHJcbiAgICAgICAgbGV0IGNhbnZhc1dpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcclxuICAgICAgICBsZXQgY2FudmFzSGVpZ2h0ID0gdGhpcy5jYW52YXNIZWlnaHQ7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0ZXh0dXJlXHJcbiAgICAgICAgbGV0IG5vaXNlSW1hZ2UgPSB0aGlzLmNhbnZhc0NvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKGNhbnZhc1dpZHRoLCBjYW52YXNIZWlnaHQpO1xyXG5cclxuICAgICAgICAvLyBGaWxsIHRleHR1cmUgd2l0aCBub2lzZVxyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgY2FudmFzSGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBjYW52YXNXaWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50UGl4ZWxPZmZzZXQgPSAoY2FudmFzV2lkdGggKiB5ICogNCkgKyB4ICogNDtcclxuICAgICAgICAgICAgICAgIG5vaXNlSW1hZ2UuZGF0YVtjdXJyZW50UGl4ZWxPZmZzZXRdID0gTWF0aC5yYW5kb20oKSAqIDI1NTtcclxuICAgICAgICAgICAgICAgIGlmICh5IDwgdGhpcy5ub2lzZUFuaW1hdGlvbldpbmRvd1BvcyB8fCB5ID4gdGhpcy5ub2lzZUFuaW1hdGlvbldpbmRvd1BvcyArIHRoaXMuaW50ZXJmZXJlbmNlSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9pc2VJbWFnZS5kYXRhW2N1cnJlbnRQaXhlbE9mZnNldF0gKj0gMC44NTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5vaXNlSW1hZ2UuZGF0YVtjdXJyZW50UGl4ZWxPZmZzZXQgKyAxXSA9IG5vaXNlSW1hZ2UuZGF0YVtjdXJyZW50UGl4ZWxPZmZzZXRdO1xyXG4gICAgICAgICAgICAgICAgbm9pc2VJbWFnZS5kYXRhW2N1cnJlbnRQaXhlbE9mZnNldCArIDJdID0gbm9pc2VJbWFnZS5kYXRhW2N1cnJlbnRQaXhlbE9mZnNldF07XHJcbiAgICAgICAgICAgICAgICBub2lzZUltYWdlLmRhdGFbY3VycmVudFBpeGVsT2Zmc2V0ICsgM10gPSA1MDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUHV0IHRleHR1cmUgb250byBjYW52YXNcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRleHQucHV0SW1hZ2VEYXRhKG5vaXNlSW1hZ2UsIDAsIDApO1xyXG5cclxuICAgICAgICB0aGlzLmxhc3RGcmFtZVVwZGF0ZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xyXG4gICAgICAgIHRoaXMubm9pc2VBbmltYXRpb25XaW5kb3dQb3MgKz0gNztcclxuICAgICAgICBpZiAodGhpcy5ub2lzZUFuaW1hdGlvbldpbmRvd1BvcyA+IGNhbnZhc0hlaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLm5vaXNlQW5pbWF0aW9uV2luZG93UG9zID0gLWNhbnZhc0hlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2NoZWR1bGVOZXh0UmVuZGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzY2hlZHVsZU5leHRSZW5kZXIoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlQW5pbWF0aW9uRnJhbWUpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZVVwZGF0ZUhhbmRsZXJJZCA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yZW5kZXJGcmFtZS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lVXBkYXRlSGFuZGxlcklkID0gc2V0VGltZW91dCh0aGlzLnJlbmRlckZyYW1lLmJpbmQodGhpcyksIHRoaXMuZnJhbWVJbnRlcnZhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtOb0FyZ3MsIEV2ZW50RGlzcGF0Y2hlciwgRXZlbnR9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgVUlDb250YWluZXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBVSUNvbnRhaW5lckNvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvLyBub3RoaW5nIHRvIGFkZFxyXG59XHJcblxyXG4vKipcclxuICogVGhlIGJhc2UgY29udGFpbmVyIHRoYXQgY29udGFpbnMgYWxsIG9mIHRoZSBVSS4gVGhlIFVJQ29udGFpbmVyIGlzIHBhc3NlZCB0byB0aGUge0BsaW5rIFVJTWFuYWdlcn0gdG8gYnVpbGQgYW5kIHNldHVwIHRoZSBVSS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBVSUNvbnRhaW5lciBleHRlbmRzIENvbnRhaW5lcjxVSUNvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgdWlDb250YWluZXJFdmVudHMgPSB7XHJcbiAgICAgICAgb25Nb3VzZUVudGVyOiBuZXcgRXZlbnREaXNwYXRjaGVyPFVJQ29udGFpbmVyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Nb3VzZU1vdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8VUlDb250YWluZXIsIE5vQXJncz4oKSxcclxuICAgICAgICBvbk1vdXNlTGVhdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8VUlDb250YWluZXIsIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFVJQ29udGFpbmVyQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS11aWNvbnRhaW5lclwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBzZWxmLm9uTW91c2VFbnRlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUVudGVyLmRpc3BhdGNoKHNlbmRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VsZi5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Nb3VzZU1vdmUuZGlzcGF0Y2goc2VuZGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uTW91c2VMZWF2ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLmRpc3BhdGNoKHNlbmRlcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgY29udGFpbmVyID0gc3VwZXIudG9Eb21FbGVtZW50KCk7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5vbihcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uTW91c2VFbnRlckV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29udGFpbmVyLm9uKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vbk1vdXNlTW92ZUV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgY29udGFpbmVyLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZUxlYXZlRXZlbnQoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZWN0IGZsZXhib3ggc3VwcG9ydCAobm90IHN1cHBvcnRlZCBpbiBJRTkpXHJcbiAgICAgICAgaWYgKGRvY3VtZW50ICYmIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKS5zdHlsZS5mbGV4ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5hZGRDbGFzcyhcImZsZXhib3hcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29udGFpbmVyLmFkZENsYXNzKFwibm8tZmxleGJveFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb250YWluZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uTW91c2VFbnRlckV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZUVudGVyLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbk1vdXNlTW92ZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZU1vdmUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uTW91c2VMZWF2ZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZUxlYXZlLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBtb3VzZSBlbnRlcnMgdGhlIFVJLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZUVudGVyKCk6IEV2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy51aUNvbnRhaW5lckV2ZW50cy5vbk1vdXNlRW50ZXIuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgbW91c2UgbW92ZXMgd2l0aGluIFVJLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZU1vdmUoKTogRXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VNb3ZlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIG1vdXNlIGxlYXZlcyB0aGUgVUkuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbk1vdXNlTGVhdmUoKTogRXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VMZWF2ZS5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gXCJhdXRvXCIgYW5kIHRoZSBhdmFpbGFibGUgdmlkZW8gcXVhbGl0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZpZGVvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVWaWRlb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHZpZGVvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZVZpZGVvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHZpZGVvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCB2aWRlb1F1YWxpdHkgb2YgdmlkZW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbSh2aWRlb1F1YWxpdHkuaWQsIHZpZGVvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBWaWRlb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldFZpZGVvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlVmlkZW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB1cGRhdGVWaWRlb1F1YWxpdGllcyk7IC8vIFVwZGF0ZSBxdWFsaXRpZXMgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVklERU9fRE9XTkxPQURfUVVBTElUWV9DSEFOR0UsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBwbGF5ZXIuZ2V0RG93bmxvYWRlZFZpZGVvRGF0YSgpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oZGF0YS5pc0F1dG8gPyBcImF1dG9cIiA6IGRhdGEuaWQpO1xyXG4gICAgICAgIH0pOyAvLyBVcGRhdGUgcXVhbGl0eSBzZWxlY3Rpb24gd2hlbiBxdWFsaXR5IGlzIGNoYW5nZWQgKGZyb20gb3V0c2lkZSlcclxuXHJcbiAgICAgICAgLy8gUG9wdWxhdGUgcXVhbGl0aWVzIGF0IHN0YXJ0dXBcclxuICAgICAgICB1cGRhdGVWaWRlb1F1YWxpdGllcygpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtWb2x1bWVTbGlkZXJ9IGZyb20gXCIuL3ZvbHVtZXNsaWRlclwiO1xyXG5pbXBvcnQge1ZvbHVtZVRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vdm9sdW1ldG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VGltZW91dH0gZnJvbSBcIi4uL3RpbWVvdXRcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgVm9sdW1lQ29udHJvbEJ1dHRvbn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFZvbHVtZUNvbnRyb2xCdXR0b25Db25maWcgZXh0ZW5kcyBDb250YWluZXJDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZGVsYXkgYWZ0ZXIgd2hpY2ggdGhlIHZvbHVtZSBzbGlkZXIgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogQ2FyZSBtdXN0IGJlIHRha2VuIHRoYXQgdGhlIGRlbGF5IGlzIGxvbmcgZW5vdWdoIHNvIHVzZXJzIGNhbiByZWFjaCB0aGUgc2xpZGVyIGZyb20gdGhlIHRvZ2dsZSBidXR0b24sIGUuZy4gYnlcclxuICAgICAqIG1vdXNlIG1vdmVtZW50LiBJZiB0aGUgZGVsYXkgaXMgdG9vIHNob3J0LCB0aGUgc2xpZGVycyBkaXNhcHBlYXJzIGJlZm9yZSB0aGUgbW91c2UgcG9pbnRlciBoYXMgcmVhY2hlZCBpdCBhbmRcclxuICAgICAqIHRoZSB1c2VyIGlzIG5vdCBhYmxlIHRvIHVzZSBpdC5cclxuICAgICAqIERlZmF1bHQ6IDUwMG1zXHJcbiAgICAgKi9cclxuICAgIGhpZGVEZWxheT86IG51bWJlcjtcclxuICAgIC8qKlxyXG4gICAgICogU3BlY2lmaWVzIGlmIHRoZSB2b2x1bWUgc2xpZGVyIHNob3VsZCBiZSB2ZXJ0aWNhbGx5IG9yIGhvcml6b250YWxseSBhbGlnbmVkLlxyXG4gICAgICogRGVmYXVsdDogdHJ1ZVxyXG4gICAgICovXHJcbiAgICB2ZXJ0aWNhbD86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGNvbXBvc2l0ZSB2b2x1bWUgY29udHJvbCB0aGF0IGNvbnNpc3RzIG9mIGFuZCBpbnRlcm5hbGx5IG1hbmFnZXMgYSB2b2x1bWUgY29udHJvbCBidXR0b24gdGhhdCBjYW4gYmUgdXNlZFxyXG4gKiBmb3IgbXV0aW5nLCBhbmQgYSAoZGVwZW5kaW5nIG9uIHRoZSBDU1Mgc3R5bGUsIGUuZy4gc2xpZGUtb3V0KSB2b2x1bWUgY29udHJvbCBiYXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVm9sdW1lQ29udHJvbEJ1dHRvbiBleHRlbmRzIENvbnRhaW5lcjxWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSB2b2x1bWVUb2dnbGVCdXR0b246IFZvbHVtZVRvZ2dsZUJ1dHRvbjtcclxuICAgIHByaXZhdGUgdm9sdW1lU2xpZGVyOiBWb2x1bWVTbGlkZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLnZvbHVtZVRvZ2dsZUJ1dHRvbiA9IG5ldyBWb2x1bWVUb2dnbGVCdXR0b24oKTtcclxuICAgICAgICB0aGlzLnZvbHVtZVNsaWRlciA9IG5ldyBWb2x1bWVTbGlkZXIoe1xyXG4gICAgICAgICAgICB2ZXJ0aWNhbDogY29uZmlnLnZlcnRpY2FsICE9IG51bGwgPyBjb25maWcudmVydGljYWwgOiB0cnVlLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12b2x1bWVjb250cm9sYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnZvbHVtZVRvZ2dsZUJ1dHRvbiwgdGhpcy52b2x1bWVTbGlkZXJdLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDUwMFxyXG4gICAgICAgIH0sIDxWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgdm9sdW1lVG9nZ2xlQnV0dG9uID0gdGhpcy5nZXRWb2x1bWVUb2dnbGVCdXR0b24oKTtcclxuICAgICAgICBsZXQgdm9sdW1lU2xpZGVyID0gdGhpcy5nZXRWb2x1bWVTbGlkZXIoKTtcclxuXHJcbiAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dCgoPFZvbHVtZUNvbnRyb2xCdXR0b25Db25maWc+c2VsZi5nZXRDb25maWcoKSkuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlci5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVm9sdW1lIFNsaWRlciB2aXNpYmlsaXR5IGhhbmRsaW5nXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBUaGUgdm9sdW1lIHNsaWRlciBzaGFsbCBiZSB2aXNpYmxlIHdoaWxlIHRoZSB1c2VyIGhvdmVycyB0aGUgbXV0ZSB0b2dnbGUgYnV0dG9uLCB3aGlsZSB0aGUgdXNlciBob3ZlcnMgdGhlXHJcbiAgICAgICAgICogdm9sdW1lIHNsaWRlciwgYW5kIHdoaWxlIHRoZSB1c2VyIHNsaWRlcyB0aGUgdm9sdW1lIHNsaWRlci4gSWYgbm9uZSBvZiB0aGVzZSBzaXR1YXRpb25zIGFyZSB0cnVlLCB0aGUgc2xpZGVyXHJcbiAgICAgICAgICogc2hhbGwgZGlzYXBwZWFyLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGxldCB2b2x1bWVTbGlkZXJIb3ZlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgdm9sdW1lVG9nZ2xlQnV0dG9uLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBTaG93IHZvbHVtZSBzbGlkZXIgd2hlbiBtb3VzZSBlbnRlcnMgdGhlIGJ1dHRvbiBhcmVhXHJcbiAgICAgICAgICAgIGlmICh2b2x1bWVTbGlkZXIuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgdm9sdW1lU2xpZGVyLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBBdm9pZCBoaWRpbmcgb2YgdGhlIHNsaWRlciB3aGVuIGJ1dHRvbiBpcyBob3ZlcmVkXHJcbiAgICAgICAgICAgIHRpbWVvdXQuY2xlYXIoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVUb2dnbGVCdXR0b24uZ2V0RG9tRWxlbWVudCgpLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIEhpZGUgc2xpZGVyIGRlbGF5ZWQgd2hlbiBidXR0b24gaXMgbGVmdFxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdm9sdW1lU2xpZGVyLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlZW50ZXJcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBzbGlkZXIgaXMgZW50ZXJlZCwgY2FuY2VsIHRoZSBoaWRlIHRpbWVvdXQgYWN0aXZhdGVkIGJ5IGxlYXZpbmcgdGhlIGJ1dHRvblxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlckhvdmVyZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZvbHVtZVNsaWRlci5nZXREb21FbGVtZW50KCkub24oXCJtb3VzZWxlYXZlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gV2hlbiBtb3VzZSBsZWF2ZXMgdGhlIHNsaWRlciwgb25seSBoaWRlIGl0IGlmIHRoZXJlIGlzIG5vIHNsaWRlIG9wZXJhdGlvbiBpbiBwcm9ncmVzc1xyXG4gICAgICAgICAgICBpZiAodm9sdW1lU2xpZGVyLmlzU2Vla2luZygpKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdm9sdW1lU2xpZGVySG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZvbHVtZVNsaWRlci5vblNlZWtlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBXaGVuIGEgc2xpZGUgb3BlcmF0aW9uIGlzIGRvbmUgYW5kIHRoZSBzbGlkZXIgbm90IGhvdmVyZWQgKG1vdXNlIG91dHNpZGUgc2xpZGVyKSwgaGlkZSBzbGlkZXIgZGVsYXllZFxyXG4gICAgICAgICAgICBpZiAoIXZvbHVtZVNsaWRlckhvdmVyZWQpIHtcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBpbnRlcm5hbGx5IG1hbmFnZWQgdm9sdW1lIHRvZ2dsZSBidXR0b24uXHJcbiAgICAgKiBAcmV0dXJucyB7Vm9sdW1lVG9nZ2xlQnV0dG9ufVxyXG4gICAgICovXHJcbiAgICBnZXRWb2x1bWVUb2dnbGVCdXR0b24oKTogVm9sdW1lVG9nZ2xlQnV0dG9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52b2x1bWVUb2dnbGVCdXR0b247XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBQcm92aWRlcyBhY2Nlc3MgdG8gdGhlIGludGVybmFsbHkgbWFuYWdlZCB2b2x1bWUgc2lsZGVyLlxyXG4gICAgICogQHJldHVybnMge1ZvbHVtZVNsaWRlcn1cclxuICAgICAqL1xyXG4gICAgZ2V0Vm9sdW1lU2xpZGVyKCk6IFZvbHVtZVNsaWRlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sdW1lU2xpZGVyO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlZWtCYXIsIFNlZWtCYXJDb25maWd9IGZyb20gXCIuL3NlZWtiYXJcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNpbXBsZSB2b2x1bWUgc2xpZGVyIGNvbXBvbmVudCB0byBhZGp1c3QgdGhlIHBsYXllcidzIHZvbHVtZSBzZXR0aW5nLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZvbHVtZVNsaWRlciBleHRlbmRzIFNlZWtCYXIge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogU2Vla0JhckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12b2x1bWVzbGlkZXJcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlciwgZmFsc2UpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB2b2x1bWVDaGFuZ2VIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTXV0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKDApO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRCdWZmZXJQb3NpdGlvbigwKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbihwbGF5ZXIuZ2V0Vm9sdW1lKCkpO1xyXG5cclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24ocGxheWVyLmdldFZvbHVtZSgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZPTFVNRV9DSEFOR0UsIHZvbHVtZUNoYW5nZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX01VVEUsIHZvbHVtZUNoYW5nZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1VOTVVURSwgdm9sdW1lQ2hhbmdlSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHRoaXMub25TZWVrUHJldmlldy5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoYXJncy5zY3J1YmJpbmcpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5zZXRWb2x1bWUoYXJncy5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBwZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRWb2x1bWUocGVyY2VudGFnZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgdm9sdW1lIGJhclxyXG4gICAgICAgIHZvbHVtZUNoYW5nZUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBWb2x1bWVDaGFuZ2VFdmVudCA9IGJpdG1vdmluLnBsYXllci5Wb2x1bWVDaGFuZ2VFdmVudDtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgYXVkaW8gbXV0aW5nLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZvbHVtZVRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12b2x1bWV0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJWb2x1bWUvTXV0ZVwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgbXV0ZVN0YXRlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYub2ZmKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9NVVRFLCBtdXRlU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9VTk1VVEUsIG11dGVTdGF0ZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci51bm11dGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5tdXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVk9MVU1FX0NIQU5HRSwgZnVuY3Rpb24gKGV2ZW50OiBWb2x1bWVDaGFuZ2VFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBUb2dnbGUgbG93IGNsYXNzIHRvIGRpc3BsYXkgbG93IHZvbHVtZSBpY29uIGJlbG93IDUwJSB2b2x1bWVcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldFZvbHVtZSA8IDUwKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhcImxvd1wiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKFwibG93XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0dXAgaW5pdFxyXG4gICAgICAgIG11dGVTdGF0ZUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCB0b2dnbGVzIHRoZSB2aWRlbyB2aWV3IGJldHdlZW4gbm9ybWFsL21vbm8gYW5kIFZSL3N0ZXJlby5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBWUlRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12cnRvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlZSXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBpc1ZSQ29uZmlndXJlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVlIgYXZhaWxhYmlsaXR5IGNhbm5vdCBiZSBjaGVja2VkIHRocm91Z2ggZ2V0VlJTdGF0dXMoKSBiZWNhdXNlIGl0IGlzIGFzeW5jaHJvbm91c2x5IHBvcHVsYXRlZCBhbmQgbm90XHJcbiAgICAgICAgICAgIC8vIGF2YWlsYWJsZSBhdCBVSSBpbml0aWFsaXphdGlvbi4gQXMgYW4gYWx0ZXJuYXRpdmUsIHdlIGNoZWNrIHRoZSBWUiBzZXR0aW5ncyBpbiB0aGUgY29uZmlnLlxyXG4gICAgICAgICAgICAvLyBUT0RPIHVzZSBnZXRWUlN0YXR1cygpIHRocm91Z2ggaXNWUlN0ZXJlb0F2YWlsYWJsZSgpIG9uY2UgdGhlIHBsYXllciBoYXMgYmVlbiByZXdyaXR0ZW4gYW5kIHRoZSBzdGF0dXMgaXMgYXZhaWxhYmxlIGluIE9OX1JFQURZXHJcbiAgICAgICAgICAgIGxldCBjb25maWcgPSBwbGF5ZXIuZ2V0Q29uZmlnKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWcuc291cmNlICYmIGNvbmZpZy5zb3VyY2UudnIgJiYgY29uZmlnLnNvdXJjZS52ci5jb250ZW50VHlwZSAhPT0gXCJub25lXCI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGlzVlJTdGVyZW9BdmFpbGFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5jb250ZW50VHlwZSAhPT0gXCJub25lXCI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHZyU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNWUkNvbmZpZ3VyZWQoKSAmJiBpc1ZSU3RlcmVvQXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpOyAvLyBzaG93IGJ1dHRvbiBpbiBjYXNlIGl0IGlzIGhpZGRlblxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5pc1N0ZXJlbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpOyAvLyBoaWRlIGJ1dHRvbiBpZiBubyBzdGVyZW8gbW9kZSBhdmFpbGFibGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCB2ckJ1dHRvblZpc2liaWxpdHlIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNWUkNvbmZpZ3VyZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZSX01PREVfQ0hBTkdFRCwgdnJTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZSX1NURVJFT19DSEFOR0VELCB2clN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVlJfRVJST1IsIHZyU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIpOyAvLyBIaWRlIGJ1dHRvbiB3aGVuIFZSIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdnJCdXR0b25WaXNpYmlsaXR5SGFuZGxlcik7IC8vIFNob3cgYnV0dG9uIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZCBhbmQgaXQncyBWUlxyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFpc1ZSU3RlcmVvQXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb25zb2xlKSBjb25zb2xlLmxvZyhcIk5vIFZSIGNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdldFZSU3RhdHVzKCkuaXNTdGVyZW8pIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8odHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHN0YXJ0dXAgdmlzaWJpbGl0eVxyXG4gICAgICAgIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDbGlja092ZXJsYXksIENsaWNrT3ZlcmxheUNvbmZpZ30gZnJvbSBcIi4vY2xpY2tvdmVybGF5XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIENsaWNrT3ZlcmxheX0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFdhdGVybWFya0NvbmZpZyBleHRlbmRzIENsaWNrT3ZlcmxheUNvbmZpZyB7XHJcbiAgICAvLyBub3RoaW5nIHlldFxyXG59XHJcblxyXG4vKipcclxuICogQSB3YXRlcm1hcmsgb3ZlcmxheSB3aXRoIGEgY2xpY2thYmxlIGxvZ28uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgV2F0ZXJtYXJrIGV4dGVuZHMgQ2xpY2tPdmVybGF5IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFdhdGVybWFya0NvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS13YXRlcm1hcmtcIixcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9iaXRtb3Zpbi5jb21cIlxyXG4gICAgICAgIH0sIDxXYXRlcm1hcmtDb25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9mZnNldCB7XHJcbiAgICBsZWZ0OiBudW1iZXI7XHJcbiAgICB0b3A6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNpbXBsZSBET00gbWFuaXB1bGF0aW9uIGFuZCBET00gZWxlbWVudCBldmVudCBoYW5kbGluZyBtb2RlbGVkIGFmdGVyIGpRdWVyeSAoYXMgcmVwbGFjZW1lbnQgZm9yIGpRdWVyeSkuXHJcbiAqXHJcbiAqIExpa2UgalF1ZXJ5LCBET00gb3BlcmF0ZXMgb24gc2luZ2xlIGVsZW1lbnRzIGFuZCBsaXN0cyBvZiBlbGVtZW50cy4gRm9yIGV4YW1wbGU6IGNyZWF0aW5nIGFuIGVsZW1lbnQgcmV0dXJucyBhIERPTVxyXG4gKiBpbnN0YW5jZSB3aXRoIGEgc2luZ2xlIGVsZW1lbnQsIHNlbGVjdGluZyBlbGVtZW50cyByZXR1cm5zIGEgRE9NIGluc3RhbmNlIHdpdGggemVybywgb25lLCBvciBtYW55IGVsZW1lbnRzLiBTaW1pbGFyXHJcbiAqIHRvIGpRdWVyeSwgc2V0dGVycyB1c3VhbGx5IGFmZmVjdCBhbGwgZWxlbWVudHMsIHdoaWxlIGdldHRlcnMgb3BlcmF0ZSBvbiBvbmx5IHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gKiBBbHNvIHNpbWlsYXIgdG8galF1ZXJ5LCBtb3N0IG1ldGhvZHMgKGV4Y2VwdCBnZXR0ZXJzKSByZXR1cm4gdGhlIERPTSBpbnN0YW5jZSBmYWNpbGl0YXRpbmcgZWFzeSBjaGFpbmluZyBvZiBtZXRob2QgY2FsbHMuXHJcbiAqXHJcbiAqIEJ1aWx0IHdpdGggdGhlIGhlbHAgb2Y6IGh0dHA6Ly95b3VtaWdodG5vdG5lZWRqcXVlcnkuY29tL1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERPTSB7XHJcblxyXG4gICAgcHJpdmF0ZSBkb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGlzdCBvZiBlbGVtZW50cyB0aGF0IHRoZSBpbnN0YW5jZSB3cmFwcy4gVGFrZSBjYXJlIHRoYXQgbm90IGFsbCBtZXRob2RzIGNhbiBvcGVyYXRlIG9uIHRoZSB3aG9sZSBsaXN0LFxyXG4gICAgICogZ2V0dGVycyB1c3VhbGx5IGp1c3Qgd29yayBvbiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBlbGVtZW50czogSFRNTEVsZW1lbnRbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBET00gZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSB0YWdOYW1lIHRoZSB0YWcgbmFtZSBvZiB0aGUgRE9NIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVzIGEgbGlzdCBvZiBhdHRyaWJ1dGVzIG9mIHRoZSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHRhZ05hbWU6IHN0cmluZywgYXR0cmlidXRlczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZWxlY3RzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBET00gdGhhdCBtYXRjaCB0aGUgc3BlY2lmaWVkIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBtYXRjaCBET00gZWxlbWVudHMgd2l0aFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzZWxlY3Rvcjogc3RyaW5nKTtcclxuICAgIC8qKlxyXG4gICAgICogV3JhcHMgYSBwbGFpbiBIVE1MRWxlbWVudCB3aXRoIGEgRE9NIGluc3RhbmNlLlxyXG4gICAgICogQHBhcmFtIGVsZW1lbnQgdGhlIEhUTUxFbGVtZW50IHRvIHdyYXAgd2l0aCBET01cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXcmFwcyBhIGxpc3Qgb2YgcGxhaW4gSFRNTEVsZW1lbnRzIHdpdGggYSBET00gaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgSFRNTEVsZW1lbnRzIHRvIHdyYXAgd2l0aCBET01cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudHM6IEhUTUxFbGVtZW50W10pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXcmFwcyB0aGUgZG9jdW1lbnQgd2l0aCBhIERPTSBpbnN0YW5jZS4gVXNlZnVsIHRvIGF0dGFjaCBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGRvY3VtZW50LlxyXG4gICAgICogQHBhcmFtIGRvY3VtZW50IHRoZSBkb2N1bWVudCB0byB3cmFwXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50OiBEb2N1bWVudCk7XHJcbiAgICBjb25zdHJ1Y3Rvcihzb21ldGhpbmc6IHN0cmluZyB8IEhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnRbXSB8IERvY3VtZW50LCBhdHRyaWJ1dGVzPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7IC8vIFNldCB0aGUgZ2xvYmFsIGRvY3VtZW50IHRvIHRoZSBsb2NhbCBkb2N1bWVudCBmaWVsZFxyXG5cclxuICAgICAgICBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgaWYgKHNvbWV0aGluZy5sZW5ndGggPiAwICYmIHNvbWV0aGluZ1swXSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHNvbWV0aGluZyBpbnN0YW5jZW9mIERvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gYSBkb2N1bWVudCBpcyBwYXNzZWQgaW4sIHdlIGRvIG5vdCBkbyBhbnl0aGluZyB3aXRoIGl0LCBidXQgYnkgc2V0dGluZyB0aGlzLmVsZW1lbnRzIHRvIG51bGxcclxuICAgICAgICAgICAgLy8gd2UgZ2l2ZSB0aGUgZXZlbnQgaGFuZGxpbmcgbWV0aG9kIGEgbWVhbnMgdG8gZGV0ZWN0IGlmIHRoZSBldmVudHMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgb24gdGhlIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2YgZWxlbWVudHMuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWdOYW1lID0gc29tZXRoaW5nO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVWYWx1ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSB0aGlzLmZpbmRDaGlsZEVsZW1lbnRzKHNlbGVjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgdGhhdCB0aGlzIERPTSBpbnN0YW5jZSBjdXJyZW50bHkgaG9sZHMuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50cyA/IHRoaXMuZWxlbWVudHMubGVuZ3RoIDogMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIEhUTUwgZWxlbWVudHMgdGhhdCB0aGlzIERPTSBpbnN0YW5jZSBjdXJyZW50bHkgaG9sZHMuXHJcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRbXX0gdGhlIHJhdyBIVE1MIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGdldEVsZW1lbnRzKCk6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBzaG9ydGN1dCBtZXRob2QgZm9yIGl0ZXJhdGluZyBhbGwgZWxlbWVudHMuIFNob3J0cyB0aGlzLmVsZW1lbnRzLmZvckVhY2goLi4uKSB0byB0aGlzLmZvckVhY2goLi4uKS5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIHRoZSBoYW5kbGVyIHRvIGV4ZWN1dGUgYW4gb3BlcmF0aW9uIG9uIGFuIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBmb3JFYWNoKGhhbmRsZXI6IChlbGVtZW50OiBIVE1MRWxlbWVudCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBoYW5kbGVyKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmluZENoaWxkRWxlbWVudHNPZkVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBEb2N1bWVudCwgc2VsZWN0b3I6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIGxldCBjaGlsZEVsZW1lbnRzID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBOb2RlTGlzdCB0byBBcnJheVxyXG4gICAgICAgIC8vIGh0dHBzOi8vdG9kZG1vdHRvLmNvbS9hLWNvbXByZWhlbnNpdmUtZGl2ZS1pbnRvLW5vZGVsaXN0cy1hcnJheXMtY29udmVydGluZy1ub2RlbGlzdHMtYW5kLXVuZGVyc3RhbmRpbmctdGhlLWRvbS9cclxuICAgICAgICByZXR1cm4gW10uc2xpY2UuY2FsbChjaGlsZEVsZW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpbmRDaGlsZEVsZW1lbnRzKHNlbGVjdG9yOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGFsbENoaWxkRWxlbWVudHMgPSA8SFRNTEVsZW1lbnRbXT5bXTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBhbGxDaGlsZEVsZW1lbnRzID0gYWxsQ2hpbGRFbGVtZW50cy5jb25jYXQoc2VsZi5maW5kQ2hpbGRFbGVtZW50c09mRWxlbWVudChlbGVtZW50LCBzZWxlY3RvcikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRDaGlsZEVsZW1lbnRzT2ZFbGVtZW50KGRvY3VtZW50LCBzZWxlY3Rvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYWxsQ2hpbGRFbGVtZW50cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmRzIGFsbCBjaGlsZCBlbGVtZW50cyBvZiBhbGwgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIHN1cHBsaWVkIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBtYXRjaCB3aXRoIGNoaWxkIGVsZW1lbnRzXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfSBhIG5ldyBET00gaW5zdGFuY2UgcmVwcmVzZW50aW5nIGFsbCBtYXRjaGVkIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIGZpbmQoc2VsZWN0b3I6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgbGV0IGFsbENoaWxkRWxlbWVudHMgPSB0aGlzLmZpbmRDaGlsZEVsZW1lbnRzKHNlbGVjdG9yKTtcclxuICAgICAgICByZXR1cm4gbmV3IERPTShhbGxDaGlsZEVsZW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgdGhlIGlubmVyIEhUTUwgY29udGVudCBvZiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgaHRtbCgpOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGlubmVyIEhUTUwgY29udGVudCBvZiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBhIHN0cmluZyBvZiBwbGFpbiB0ZXh0IG9yIEhUTUwgbWFya3VwXHJcbiAgICAgKi9cclxuICAgIGh0bWwoY29udGVudDogc3RyaW5nKTogRE9NO1xyXG4gICAgaHRtbChjb250ZW50Pzogc3RyaW5nKTogc3RyaW5nIHwgRE9NIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SHRtbChjb250ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEh0bWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRIdG1sKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLmlubmVySFRNTDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEh0bWwoY29udGVudDogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkIHx8IGNvbnRlbnQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBTZXQgdG8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIGlubmVySFRNTCBnZXR0aW5nIHNldCB0byBcInVuZGVmaW5lZFwiIChhbGwgYnJvd3NlcnMpIG9yIFwibnVsbFwiIChJRTkpXHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gY29udGVudDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIGlubmVyIEhUTUwgb2YgYWxsIGVsZW1lbnRzIChkZWxldGVzIGFsbCBjaGlsZHJlbikuXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBlbXB0eSgpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBmaXJzdCBmb3JtIGVsZW1lbnQsIGUuZy4gdGhlIHNlbGVjdGVkIHZhbHVlIG9mIGEgc2VsZWN0IGJveCBvciB0aGUgdGV4dCBpZiBhbiBpbnB1dCBmaWVsZC5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB2YWx1ZSBvZiBhIGZvcm0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICB2YWwoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbMF07XHJcblxyXG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFNlbGVjdEVsZW1lbnQgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBUT0RPIGFkZCBzdXBwb3J0IGZvciBtaXNzaW5nIGZvcm0gZWxlbWVudHNcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB2YWwoKSBub3Qgc3VwcG9ydGVkIGZvciAke3R5cGVvZiBlbGVtZW50fWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVcclxuICAgICAqL1xyXG4gICAgYXR0cihhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYW4gYXR0cmlidXRlIG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGUgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIGF0dHIoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET007XHJcbiAgICBhdHRyKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZyk6IHN0cmluZyB8IG51bGwgfCBET00ge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyKGF0dHJpYnV0ZSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cihhdHRyaWJ1dGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEF0dHIoYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEF0dHIoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZGF0YSBlbGVtZW50IG9uIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHBhcmFtIGRhdGFBdHRyaWJ1dGUgdGhlIG5hbWUgb2YgdGhlIGRhdGEgYXR0cmlidXRlIHdpdGhvdXQgdGhlIFwiZGF0YS1cIiBwcmVmaXhcclxuICAgICAqL1xyXG4gICAgZGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGEgZGF0YSBhdHRyaWJ1dGUgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGRhdGFBdHRyaWJ1dGUgdGhlIG5hbWUgb2YgdGhlIGRhdGEgYXR0cmlidXRlIHdpdGhvdXQgdGhlIFwiZGF0YS1cIiBwcmVmaXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhlIGRhdGEgYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIGRhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NO1xyXG4gICAgZGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB8IERPTSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERhdGEoZGF0YUF0dHJpYnV0ZSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YShkYXRhQXR0cmlidXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXREYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLmdldEF0dHJpYnV0ZShcImRhdGEtXCIgKyBkYXRhQXR0cmlidXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldERhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLVwiICsgZGF0YUF0dHJpYnV0ZSwgdmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXBwZW5kcyBvbmUgb3IgbW9yZSBET00gZWxlbWVudHMgYXMgY2hpbGRyZW4gdG8gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNoaWxkRWxlbWVudHMgdGhlIGNocmlsZCBlbGVtZW50cyB0byBhcHBlbmRcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGFwcGVuZCguLi5jaGlsZEVsZW1lbnRzOiBET01bXSk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGNoaWxkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZEVsZW1lbnQuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoXywgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkRWxlbWVudC5lbGVtZW50c1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgZnJvbSB0aGUgRE9NLlxyXG4gICAgICovXHJcbiAgICByZW1vdmUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgb2Zmc2V0IG9mIHRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIGRvY3VtZW50J3MgdG9wIGxlZnQgY29ybmVyLlxyXG4gICAgICogQHJldHVybnMge09mZnNldH1cclxuICAgICAqL1xyXG4gICAgb2Zmc2V0KCk6IE9mZnNldCB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzWzBdO1xyXG4gICAgICAgIGxldCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3IgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgYWx3YXlzIDAgaW4gSUU5LCBJRTExLCBGaXJlZm94XHJcbiAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTExMDIyMTUvMzcwMjUyXHJcbiAgICAgICAgbGV0IHNjcm9sbFRvcCA9IHR5cGVvZiB3aW5kb3cucGFnZVlPZmZzZXQgIT09IFwidW5kZWZpbmVkXCIgP1xyXG4gICAgICAgICAgICB3aW5kb3cucGFnZVlPZmZzZXQgOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID9cclxuICAgICAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wID9cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgOiAwO1xyXG5cclxuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvciBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgYWx3YXlzIDAgaW4gSUU5LCBJRTExLCBGaXJlZm94XHJcbiAgICAgICAgbGV0IHNjcm9sbExlZnQgPSB0eXBlb2Ygd2luZG93LnBhZ2VYT2Zmc2V0ICE9PSBcInVuZGVmaW5lZFwiID9cclxuICAgICAgICAgICAgd2luZG93LnBhZ2VYT2Zmc2V0IDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQgP1xyXG4gICAgICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCA6IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCA/XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCA6IDA7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHRvcDogcmVjdC50b3AgKyBzY3JvbGxUb3AsXHJcbiAgICAgICAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHNjcm9sbExlZnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgd2lkdGggb2YgdGhlIGZpcnN0IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgd2lkdGgoKTogbnVtYmVyIHtcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlmIHRoaXMgaXMgdGhlIHNhbWUgYXMgalF1ZXJ5J3Mgd2lkdGgoKSAocHJvYmFibHkgbm90KVxyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIGhlaWdodCBvZiB0aGUgZmlyc3QgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlmIHRoaXMgaXMgdGhlIHNhbWUgYXMgalF1ZXJ5J3MgaGVpZ2h0KCkgKHByb2JhYmx5IG5vdClcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhbiBldmVudCBoYW5kbGVyIHRvIG9uZSBvciBtb3JlIGV2ZW50cyBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIHRoZSBldmVudCBuYW1lIChvciBtdWx0aXBsZSBuYW1lcyBzZXBhcmF0ZWQgYnkgc3BhY2UpIHRvIGxpc3RlbiB0b1xyXG4gICAgICogQHBhcmFtIGV2ZW50SGFuZGxlciB0aGUgZXZlbnQgaGFuZGxlciB0byBjYWxsIHdoZW4gdGhlIGV2ZW50IGZpcmVzXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBvbihldmVudE5hbWU6IHN0cmluZywgZXZlbnRIYW5kbGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0KTogRE9NIHtcclxuICAgICAgICBsZXQgZXZlbnRzID0gZXZlbnROYW1lLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5lbGVtZW50cyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYW4gZXZlbnQgaGFuZGxlciBmcm9tIG9uZSBvciBtb3JlIGV2ZW50cyBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIHRoZSBldmVudCBuYW1lIChvciBtdWx0aXBsZSBuYW1lcyBzZXBhcmF0ZWQgYnkgc3BhY2UpIHRvIHJlbW92ZSB0aGUgaGFuZGxlciBmcm9tXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRIYW5kbGVyIHRoZSBldmVudCBoYW5kbGVyIHRvIHJlbW92ZVxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgb2ZmKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudEhhbmRsZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QpOiBET00ge1xyXG4gICAgICAgIGxldCBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmVsZW1lbnRzID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnRIYW5kbGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnRIYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgc3BlY2lmaWVkIGNsYXNzKGVzKSB0byBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lIHRoZSBjbGFzcyhlcykgdG8gYWRkLCBtdWx0aXBsZSBjbGFzc2VzIHNlcGFyYXRlZCBieSBzcGFjZVxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgYWRkQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgKz0gXCIgXCIgKyBjbGFzc05hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVkIHRoZSBzcGVjaWZpZWQgY2xhc3MoZXMpIGZyb20gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNsYXNzTmFtZSB0aGUgY2xhc3MoZXMpIHRvIHJlbW92ZSwgbXVsdGlwbGUgY2xhc3NlcyBzZXBhcmF0ZWQgYnkgc3BhY2VcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUNsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKFwiKF58XFxcXGIpXCIgKyBjbGFzc05hbWUuc3BsaXQoXCIgXCIpLmpvaW4oXCJ8XCIpICsgXCIoXFxcXGJ8JClcIiwgXCJnaVwiKSwgXCIgXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIGFueSBvZiB0aGUgZWxlbWVudHMgaGFzIHRoZSBzcGVjaWZpZWQgY2xhc3MuXHJcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lIHRoZSBjbGFzcyBuYW1lIHRvIGNoZWNrXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBvbmUgb2YgdGhlIGVsZW1lbnRzIGhhcyB0aGUgY2xhc3MgYXR0YWNoZWQsIGVsc2UgaWYgbm8gZWxlbWVudCBoYXMgaXQgYXR0YWNoZWRcclxuICAgICAqL1xyXG4gICAgaGFzQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5ldyBSZWdFeHAoXCIoXnwgKVwiICsgY2xhc3NOYW1lICsgXCIoIHwkKVwiLCBcImdpXCIpLnRlc3QoZWxlbWVudC5jbGFzc05hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgdmFsdWUgb2YgYSBDU1MgcHJvcGVydHkgb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKiBAcGFyYW0gcHJvcGVydHlOYW1lIHRoZSBuYW1lIG9mIHRoZSBDU1MgcHJvcGVydHkgdG8gcmV0cmlldmUgdGhlIHZhbHVlIG9mXHJcbiAgICAgKi9cclxuICAgIGNzcyhwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIHZhbHVlIG9mIGEgQ1NTIHByb3BlcnR5IG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgdGhlIG5hbWUgb2YgdGhlIENTUyBwcm9wZXJ0eSB0byBzZXQgdGhlIHZhbHVlIGZvclxyXG4gICAgICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSB0byBzZXQgZm9yIHRoZSBnaXZlbiBDU1MgcHJvcGVydHlcclxuICAgICAqL1xyXG4gICAgY3NzKHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGEgY29sbGVjdGlvbiBvZiBDU1MgcHJvcGVydGllcyBhbmQgdGhlaXIgdmFsdWVzIG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eVZhbHVlQ29sbGVjdGlvbiBhbiBvYmplY3QgY29udGFpbmluZyBwYWlycyBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgdGhlaXIgdmFsdWVzXHJcbiAgICAgKi9cclxuICAgIGNzcyhwcm9wZXJ0eVZhbHVlQ29sbGVjdGlvbjoge1twcm9wZXJ0eU5hbWU6IHN0cmluZ106IHN0cmluZ30pOiBET007XHJcbiAgICBjc3MocHJvcGVydHlOYW1lT3JDb2xsZWN0aW9uOiBzdHJpbmcgfCB7W3Byb3BlcnR5TmFtZTogc3RyaW5nXTogc3RyaW5nfSwgdmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHwgRE9NIHtcclxuICAgICAgICBpZiAodHlwZW9mIHByb3BlcnR5TmFtZU9yQ29sbGVjdGlvbiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBsZXQgcHJvcGVydHlOYW1lID0gcHJvcGVydHlOYW1lT3JDb2xsZWN0aW9uO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldENzcyhwcm9wZXJ0eU5hbWUsIHZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldENzcyhwcm9wZXJ0eU5hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgcHJvcGVydHlWYWx1ZUNvbGxlY3Rpb24gPSBwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb247XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldENzc0NvbGxlY3Rpb24ocHJvcGVydHlWYWx1ZUNvbGxlY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldENzcyhwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudHNbMF0pWzxhbnk+cHJvcGVydHlOYW1lXTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldENzcyhwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIDxhbnk+IGNhc3QgdG8gcmVzb2x2ZSBUUzcwMTU6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM2NjI3MTE0LzM3MDI1MlxyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlWzxhbnk+cHJvcGVydHlOYW1lXSA9IHZhbHVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Q3NzQ29sbGVjdGlvbihydWxlVmFsdWVDb2xsZWN0aW9uOiB7W3J1bGVOYW1lOiBzdHJpbmddOiBzdHJpbmd9KTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzQ0OTA1NzMvMzcwMjUyXHJcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oZWxlbWVudC5zdHlsZSwgcnVsZVZhbHVlQ29sbGVjdGlvbik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtBcnJheVV0aWxzfSBmcm9tIFwiLi91dGlsc1wiO1xyXG4vKipcclxuICogRnVuY3Rpb24gaW50ZXJmYWNlIGZvciBldmVudCBsaXN0ZW5lcnMgb24gdGhlIHtAbGluayBFdmVudERpc3BhdGNoZXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4ge1xyXG4gICAgKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKTogdm9pZDtcclxufVxyXG5cclxuLyoqXHJcbiAqIEVtcHR5IHR5cGUgZm9yIGNyZWF0aW5nIHtAbGluayBFdmVudERpc3BhdGNoZXIgZXZlbnQgZGlzcGF0Y2hlcnN9IHRoYXQgZG8gbm90IGNhcnJ5IGFueSBhcmd1bWVudHMuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIE5vQXJncyB7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBQdWJsaWMgaW50ZXJmYWNlIHRoYXQgcmVwcmVzZW50cyBhbiBldmVudC4gQ2FuIGJlIHVzZWQgdG8gc3Vic2NyaWJlIHRvIGFuZCB1bnN1YnNjcmliZSBmcm9tIGV2ZW50cy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgRXZlbnQ8U2VuZGVyLCBBcmdzPiB7XHJcbiAgICAvKipcclxuICAgICAqIFN1YnNjcmliZXMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gdGhpcyBldmVudCBkaXNwYXRjaGVyLlxyXG4gICAgICogQHBhcmFtIGxpc3RlbmVyIHRoZSBsaXN0ZW5lciB0byBhZGRcclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pOiB2b2lkO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3Vic2NyaWJlcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGlzIGV2ZW50IGRpc3BhdGNoZXIgdGhhdCB3aWxsIGJlIGNhbGxlZCBhdCBhIGxpbWl0ZWQgcmF0ZSB3aXRoIGEgbWluaW11bVxyXG4gICAgICogaW50ZXJ2YWwgb2YgdGhlIHNwZWNpZmllZCBtaWxsaXNlY29uZHMuXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgdGhlIGxpc3RlbmVyIHRvIGFkZFxyXG4gICAgICogQHBhcmFtIHJhdGVNcyB0aGUgcmF0ZSBpbiBtaWxsaXNlY29uZHMgdG8gd2hpY2ggY2FsbGluZyBvZiB0aGUgbGlzdGVuZXJzIHNob3VsZCBiZSBsaW1pdGVkXHJcbiAgICAgKi9cclxuICAgIHN1YnNjcmliZVJhdGVMaW1pdGVkKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4sIHJhdGVNczogbnVtYmVyKTogdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFVuc3Vic2NyaWJlcyBhIHN1YnNjcmliZWQgZXZlbnQgbGlzdGVuZXIgZnJvbSB0aGlzIGRpc3BhdGNoZXIuXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgdGhlIGxpc3RlbmVyIHRvIHJlbW92ZVxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlIGxpc3RlbmVyIHdhcyBzdWNjZXNzZnVsbHkgdW5zdWJzY3JpYmVkLCBmYWxzZSBpZiBpdCBpc24ndCBzdWJzY3JpYmVkIG9uIHRoaXMgZGlzcGF0Y2hlclxyXG4gICAgICovXHJcbiAgICB1bnN1YnNjcmliZShsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KTogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEV2ZW50IGRpc3BhdGNoZXIgdG8gc3Vic2NyaWJlIGFuZCB0cmlnZ2VyIGV2ZW50cy4gRWFjaCBldmVudCBzaG91bGQgaGF2ZSBpdHMgb3duIGRpc3BhdGNoZXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRXZlbnREaXNwYXRjaGVyPFNlbmRlciwgQXJncz4gaW1wbGVtZW50cyBFdmVudDxTZW5kZXIsIEFyZ3M+IHtcclxuXHJcbiAgICBwcml2YXRlIGxpc3RlbmVyczogRXZlbnRMaXN0ZW5lcldyYXBwZXI8U2VuZGVyLCBBcmdzPltdID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB7QGluaGVyaXREb2N9XHJcbiAgICAgKi9cclxuICAgIHN1YnNjcmliZShsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KSB7XHJcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMucHVzaChuZXcgRXZlbnRMaXN0ZW5lcldyYXBwZXIobGlzdGVuZXIpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHtAaW5oZXJpdERvY31cclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlUmF0ZUxpbWl0ZWQobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiwgcmF0ZU1zOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG5ldyBSYXRlTGltaXRlZEV2ZW50TGlzdGVuZXJXcmFwcGVyKGxpc3RlbmVyLCByYXRlTXMpKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHtAaW5oZXJpdERvY31cclxuICAgICAqL1xyXG4gICAgdW5zdWJzY3JpYmUobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPik6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBsaXN0ZW5lcnMsIGNvbXBhcmUgd2l0aCBwYXJhbWV0ZXIsIGFuZCByZW1vdmUgaWYgZm91bmRcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzdWJzY3JpYmVkTGlzdGVuZXIgPSB0aGlzLmxpc3RlbmVyc1tpXTtcclxuICAgICAgICAgICAgaWYgKHN1YnNjcmliZWRMaXN0ZW5lci5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgIEFycmF5VXRpbHMucmVtb3ZlKHRoaXMubGlzdGVuZXJzLCBzdWJzY3JpYmVkTGlzdGVuZXIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERpc3BhdGNoZXMgYW4gZXZlbnQgdG8gYWxsIHN1YnNjcmliZWQgbGlzdGVuZXJzLlxyXG4gICAgICogQHBhcmFtIHNlbmRlciB0aGUgc291cmNlIG9mIHRoZSBldmVudFxyXG4gICAgICogQHBhcmFtIGFyZ3MgdGhlIGFyZ3VtZW50cyBmb3IgdGhlIGV2ZW50XHJcbiAgICAgKi9cclxuICAgIGRpc3BhdGNoKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzID0gbnVsbCkge1xyXG4gICAgICAgIC8vIENhbGwgZXZlcnkgbGlzdGVuZXJcclxuICAgICAgICBmb3IgKGxldCBsaXN0ZW5lciBvZiB0aGlzLmxpc3RlbmVycykge1xyXG4gICAgICAgICAgICBsaXN0ZW5lci5maXJlKHNlbmRlciwgYXJncyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgZXZlbnQgdGhhdCB0aGlzIGRpc3BhdGNoZXIgbWFuYWdlcyBhbmQgb24gd2hpY2ggbGlzdGVuZXJzIGNhbiBzdWJzY3JpYmUgYW5kIHVuc3Vic2NyaWJlIGV2ZW50IGhhbmRsZXJzLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50fVxyXG4gICAgICovXHJcbiAgICBnZXRFdmVudCgpOiBFdmVudDxTZW5kZXIsIEFyZ3M+IHtcclxuICAgICAgICAvLyBGb3Igbm93LCBqdXN0IGNhc2UgdGhlIGV2ZW50IGRpc3BhdGNoZXIgdG8gdGhlIGV2ZW50IGludGVyZmFjZS4gQXQgc29tZSBwb2ludCBpbiB0aGUgZnV0dXJlIHdoZW4gdGhlXHJcbiAgICAgICAgLy8gY29kZWJhc2UgZ3Jvd3MsIGl0IG1pZ2h0IG1ha2Ugc2Vuc2UgdG8gc3BsaXQgdGhlIGRpc3BhdGNoZXIgaW50byBzZXBhcmF0ZSBkaXNwYXRjaGVyIGFuZCBldmVudCBjbGFzc2VzLlxyXG4gICAgICAgIHJldHVybiA8RXZlbnQ8U2VuZGVyLCBBcmdzPj50aGlzO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQSBiYXNpYyBldmVudCBsaXN0ZW5lciB3cmFwcGVyIHRvIG1hbmFnZSBsaXN0ZW5lcnMgd2l0aGluIHRoZSB7QGxpbmsgRXZlbnREaXNwYXRjaGVyfS4gVGhpcyBpcyBhIFwicHJpdmF0ZVwiIGNsYXNzXHJcbiAqIGZvciBpbnRlcm5hbCBkaXNwYXRjaGVyIHVzZSBhbmQgaXQgaXMgdGhlcmVmb3JlIG5vdCBleHBvcnRlZC5cclxuICovXHJcbmNsYXNzIEV2ZW50TGlzdGVuZXJXcmFwcGVyPFNlbmRlciwgQXJncz4ge1xyXG5cclxuICAgIHByaXZhdGUgZXZlbnRMaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pIHtcclxuICAgICAgICB0aGlzLmV2ZW50TGlzdGVuZXIgPSBsaXN0ZW5lcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHdyYXBwZWQgZXZlbnQgbGlzdGVuZXIuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgbGlzdGVuZXIoKTogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudExpc3RlbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlyZXMgdGhlIHdyYXBwZWQgZXZlbnQgbGlzdGVuZXIgd2l0aCB0aGUgZ2l2ZW4gYXJndW1lbnRzLlxyXG4gICAgICogQHBhcmFtIHNlbmRlclxyXG4gICAgICogQHBhcmFtIGFyZ3NcclxuICAgICAqL1xyXG4gICAgZmlyZShzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncykge1xyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lcihzZW5kZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogRXh0ZW5kcyB0aGUgYmFzaWMge0BsaW5rIEV2ZW50TGlzdGVuZXJXcmFwcGVyfSB3aXRoIHJhdGUtbGltaXRpbmcgZnVuY3Rpb25hbGl0eS5cclxuICovXHJcbmNsYXNzIFJhdGVMaW1pdGVkRXZlbnRMaXN0ZW5lcldyYXBwZXI8U2VuZGVyLCBBcmdzPiBleHRlbmRzIEV2ZW50TGlzdGVuZXJXcmFwcGVyPFNlbmRlciwgQXJncz4ge1xyXG5cclxuICAgIHByaXZhdGUgcmF0ZU1zOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHJhdGVMaW1pdGluZ0V2ZW50TGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPjtcclxuXHJcbiAgICBwcml2YXRlIGxhc3RGaXJlVGltZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4sIHJhdGVNczogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIobGlzdGVuZXIpOyAvLyBzZXRzIHRoZSBldmVudCBsaXN0ZW5lciBzaW5rXHJcblxyXG4gICAgICAgIHRoaXMucmF0ZU1zID0gcmF0ZU1zO1xyXG4gICAgICAgIHRoaXMubGFzdEZpcmVUaW1lID0gMDtcclxuXHJcbiAgICAgICAgLy8gV3JhcCB0aGUgZXZlbnQgbGlzdGVuZXIgd2l0aCBhbiBldmVudCBsaXN0ZW5lciB0aGF0IGRvZXMgdGhlIHJhdGUtbGltaXRpbmdcclxuICAgICAgICB0aGlzLnJhdGVMaW1pdGluZ0V2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbiAoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKERhdGUubm93KCkgLSB0aGlzLmxhc3RGaXJlVGltZSA+IHRoaXMucmF0ZU1zKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBPbmx5IGlmIGVub3VnaCB0aW1lIHNpbmNlIHRoZSBwcmV2aW91cyBjYWxsIGhhcyBwYXNzZWQsIGNhbGwgdGhlXHJcbiAgICAgICAgICAgICAgICAvLyBhY3R1YWwgZXZlbnQgbGlzdGVuZXIgYW5kIHJlY29yZCB0aGUgY3VycmVudCB0aW1lXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmVTdXBlcihzZW5kZXIsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0RmlyZVRpbWUgPSBEYXRlLm5vdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpcmVTdXBlcihzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncykge1xyXG4gICAgICAgIC8vIEZpcmUgdGhlIGFjdHVhbCBleHRlcm5hbCBldmVudCBsaXN0ZW5lclxyXG4gICAgICAgIHN1cGVyLmZpcmUoc2VuZGVyLCBhcmdzKTtcclxuICAgIH1cclxuXHJcbiAgICBmaXJlKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKSB7XHJcbiAgICAgICAgLy8gRmlyZSB0aGUgaW50ZXJuYWwgcmF0ZS1saW1pdGluZyBsaXN0ZW5lciBpbnN0ZWFkIG9mIHRoZSBleHRlcm5hbCBldmVudCBsaXN0ZW5lclxyXG4gICAgICAgIHRoaXMucmF0ZUxpbWl0aW5nRXZlbnRMaXN0ZW5lcihzZW5kZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIEd1aWQge1xyXG5cclxuICAgIGxldCBndWlkID0gMTtcclxuXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gbmV4dCgpIHtcclxuICAgICAgICByZXR1cm4gZ3VpZCsrO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsYXllci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL25vZGVfbW9kdWxlcy9AdHlwZXMvY29yZS1qcy9pbmRleC5kLnRzXCIgLz5cclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge0J1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9idXR0b25cIjtcclxuaW1wb3J0IHtDb250cm9sQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbnRyb2xiYXJcIjtcclxuaW1wb3J0IHtGdWxsc2NyZWVuVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Z1bGxzY3JlZW50b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtIdWdlUGxheWJhY2tUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvaHVnZXBsYXliYWNrdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7UGxheWJhY2tUaW1lTGFiZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2t0aW1lbGFiZWxcIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1NlZWtCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvc2Vla2JhclwiO1xyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9zZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtTZXR0aW5nc1BhbmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3NldHRpbmdzcGFuZWxcIjtcclxuaW1wb3J0IHtTZXR0aW5nc1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtWaWRlb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvdmlkZW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7Vm9sdW1lVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZXRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZSVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZydG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7V2F0ZXJtYXJrfSBmcm9tIFwiLi9jb21wb25lbnRzL3dhdGVybWFya1wiO1xyXG5pbXBvcnQge1VJQ29udGFpbmVyfSBmcm9tIFwiLi9jb21wb25lbnRzL3VpY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Q29udGFpbmVyfSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge0xhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL2xhYmVsXCI7XHJcbmltcG9ydCB7QXVkaW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL2F1ZGlvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge0F1ZGlvVHJhY2tTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW90cmFja3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0Nhc3RTdGF0dXNPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL2Nhc3RzdGF0dXNvdmVybGF5XCI7XHJcbmltcG9ydCB7Q2FzdFRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9jYXN0dG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0Vycm9yTWVzc2FnZU92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvZXJyb3JtZXNzYWdlb3ZlcmxheVwiO1xyXG5pbXBvcnQge1JlY29tbWVuZGF0aW9uT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9yZWNvbW1lbmRhdGlvbm92ZXJsYXlcIjtcclxuaW1wb3J0IHtTZWVrQmFyTGFiZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvc2Vla2JhcmxhYmVsXCI7XHJcbmltcG9ydCB7U3VidGl0bGVPdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL3N1YnRpdGxlb3ZlcmxheVwiO1xyXG5pbXBvcnQge1N1YnRpdGxlU2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3N1YnRpdGxlc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7VGl0bGVCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdGl0bGViYXJcIjtcclxuaW1wb3J0IHtWb2x1bWVDb250cm9sQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZWNvbnRyb2xidXR0b25cIjtcclxuaW1wb3J0IHtDbGlja092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvY2xpY2tvdmVybGF5XCI7XHJcbmltcG9ydCB7QWRTa2lwQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Fkc2tpcGJ1dHRvblwiO1xyXG5pbXBvcnQge0FkTWVzc2FnZUxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL2FkbWVzc2FnZWxhYmVsXCI7XHJcbmltcG9ydCB7QWRDbGlja092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvYWRjbGlja292ZXJsYXlcIjtcclxuaW1wb3J0IHtQbGF5YmFja1NwZWVkU2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrc3BlZWRzZWxlY3Rib3hcIjtcclxuXHJcbi8vIE9iamVjdC5hc3NpZ24gcG9seWZpbGwgZm9yIEVTNS9JRTlcclxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZGUvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnblxyXG5pZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgT2JqZWN0LmFzc2lnbiA9IGZ1bmN0aW9uKHRhcmdldDogYW55KSB7XHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcbiAgICAgICAgaWYgKHRhcmdldCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3RcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0YXJnZXQgPSBPYmplY3QodGFyZ2V0KTtcclxuICAgICAgICBmb3IgKGxldCBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBsZXQgc291cmNlID0gYXJndW1lbnRzW2luZGV4XTtcclxuICAgICAgICAgICAgaWYgKHNvdXJjZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBrZXkgaW4gc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcclxuICAgIH07XHJcbn1cclxuXHJcbi8vIEV4cG9zZSBjbGFzc2VzIHRvIHdpbmRvd1xyXG4vLyBJbnNwaXJlZCBieSBodHRwczovL2tlZXN0YWxrc3RlY2guY29tLzIwMTYvMDgvc3VwcG9ydC1ib3RoLW5vZGUtanMtYW5kLWJyb3dzZXItanMtaW4tb25lLXR5cGVzY3JpcHQtZmlsZS9cclxuLy8gVE9ETyBmaW5kIG91dCBob3cgVFMvQnJvd3NlcmlmeSBjYW4gY29tcGlsZSB0aGUgY2xhc3NlcyB0byBwbGFpbiBKUyB3aXRob3V0IHRoZSBtb2R1bGUgd3JhcHBlciB3ZSBkb24ndCBuZWVkIHRvIGV4cG9zZSBjbGFzc2VzIHRvIHRoZSB3aW5kb3cgc2NvcGUgbWFudWFsbHkgaGVyZVxyXG4oZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIGxldCBleHBvcnRhYmxlcyA9IFtcclxuICAgICAgICAvLyBNYW5hZ2VtZW50XHJcbiAgICAgICAgVUlNYW5hZ2VyLFxyXG4gICAgICAgIC8vIENvbXBvbmVudHNcclxuICAgICAgICBBZENsaWNrT3ZlcmxheSxcclxuICAgICAgICBBZE1lc3NhZ2VMYWJlbCxcclxuICAgICAgICBBZFNraXBCdXR0b24sXHJcbiAgICAgICAgQXVkaW9RdWFsaXR5U2VsZWN0Qm94LFxyXG4gICAgICAgIEF1ZGlvVHJhY2tTZWxlY3RCb3gsXHJcbiAgICAgICAgQnV0dG9uLFxyXG4gICAgICAgIENhc3RTdGF0dXNPdmVybGF5LFxyXG4gICAgICAgIENhc3RUb2dnbGVCdXR0b24sXHJcbiAgICAgICAgQ2xpY2tPdmVybGF5LFxyXG4gICAgICAgIENvbXBvbmVudCxcclxuICAgICAgICBDb250YWluZXIsXHJcbiAgICAgICAgQ29udHJvbEJhcixcclxuICAgICAgICBFcnJvck1lc3NhZ2VPdmVybGF5LFxyXG4gICAgICAgIEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24sXHJcbiAgICAgICAgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIExhYmVsLFxyXG4gICAgICAgIFBsYXliYWNrVGltZUxhYmVsLFxyXG4gICAgICAgIFBsYXliYWNrVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFJlY29tbWVuZGF0aW9uT3ZlcmxheSxcclxuICAgICAgICBTZWVrQmFyLFxyXG4gICAgICAgIFNlZWtCYXJMYWJlbCxcclxuICAgICAgICBTZWxlY3RCb3gsXHJcbiAgICAgICAgU2V0dGluZ3NQYW5lbCxcclxuICAgICAgICBTZXR0aW5nc1RvZ2dsZUJ1dHRvbixcclxuICAgICAgICBTdWJ0aXRsZU92ZXJsYXksXHJcbiAgICAgICAgU3VidGl0bGVTZWxlY3RCb3gsXHJcbiAgICAgICAgVGl0bGVCYXIsXHJcbiAgICAgICAgVG9nZ2xlQnV0dG9uLFxyXG4gICAgICAgIFVJQ29udGFpbmVyLFxyXG4gICAgICAgIFZpZGVvUXVhbGl0eVNlbGVjdEJveCxcclxuICAgICAgICBWb2x1bWVDb250cm9sQnV0dG9uLFxyXG4gICAgICAgIFZvbHVtZVRvZ2dsZUJ1dHRvbixcclxuICAgICAgICBWUlRvZ2dsZUJ1dHRvbixcclxuICAgICAgICBXYXRlcm1hcmssXHJcbiAgICAgICAgRXJyb3JNZXNzYWdlT3ZlcmxheSxcclxuICAgICAgICBQbGF5YmFja1NwZWVkU2VsZWN0Qm94XHJcbiAgICBdO1xyXG5cclxuICAgICh3aW5kb3cgYXMgYW55KVtcImJpdG1vdmluXCJdW1wicGxheWVydWlcIl0gPSB7fTtcclxuICAgIGxldCB1aXNjb3BlID0gKHdpbmRvdyBhcyBhbnkpW1wiYml0bW92aW5cIl1bXCJwbGF5ZXJ1aVwiXTtcclxuXHJcbiAgICBpZiAod2luZG93KSB7XHJcbiAgICAgICAgZXhwb3J0YWJsZXMuZm9yRWFjaChleHAgPT4gdWlzY29wZVtuYW1lb2YoZXhwKV0gPSBleHApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIG5hbWVvZihmbjogYW55KTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIGZuID09PSBcInVuZGVmaW5lZFwiID8gXCJcIiA6IGZuLm5hbWUgPyBmbi5uYW1lIDogKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IC9eZnVuY3Rpb25cXHMrKFtcXHdcXCRdKylcXHMqXFwoLy5leGVjKGZuLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gIXJlc3VsdCA/IFwiXCIgOiByZXN1bHRbMV07XHJcbiAgICAgICAgfSkoKTtcclxuICAgIH1cclxuXHJcbn0oKSk7IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG4vLyBUT0RPIGNoYW5nZSB0byBpbnRlcm5hbCAobm90IGV4cG9ydGVkKSBjbGFzcywgaG93IHRvIHVzZSBpbiBvdGhlciBmaWxlcz9cclxuZXhwb3J0IGNsYXNzIFRpbWVvdXQge1xyXG5cclxuICAgIHByaXZhdGUgZGVsYXk6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY2FsbGJhY2s6ICgpID0+IHZvaWQ7XHJcbiAgICBwcml2YXRlIHRpbWVvdXRIYW5kbGU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkZWxheTogbnVtYmVyLCBjYWxsYmFjazogKCkgPT4gdm9pZCkge1xyXG4gICAgICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy50aW1lb3V0SGFuZGxlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyB0aGUgdGltZW91dCBhbmQgY2FsbHMgdGhlIGNhbGxiYWNrIHdoZW4gdGhlIHRpbWVvdXQgZGVsYXkgaGFzIHBhc3NlZC5cclxuICAgICAqL1xyXG4gICAgc3RhcnQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSB0aW1lb3V0LiBUaGUgY2FsbGJhY2sgd2lsbCBub3QgYmUgY2FsbGVkIGlmIGNsZWFyIGlzIGNhbGxlZCBkdXJpbmcgdGhlIHRpbWVvdXQuXHJcbiAgICAgKi9cclxuICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRIYW5kbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzZXRzIHRoZSBwYXNzZWQgdGltZW91dCBkZWxheSB0byB6ZXJvLiBDYW4gYmUgdXNlZCB0byBkZWZlciB0aGUgY2FsbGluZyBvZiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKi9cclxuICAgIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KHRoaXMuY2FsbGJhY2ssIHRoaXMuZGVsYXkpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1VJQ29udGFpbmVyfSBmcm9tIFwiLi9jb21wb25lbnRzL3VpY29udGFpbmVyXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi9kb21cIjtcclxuaW1wb3J0IHtDb21wb25lbnQsIENvbXBvbmVudENvbmZpZ30gZnJvbSBcIi4vY29tcG9uZW50cy9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udGFpbmVyXCI7XHJcbmltcG9ydCB7UGxheWJhY2tUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtGdWxsc2NyZWVuVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Z1bGxzY3JlZW50b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtWUlRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92cnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZvbHVtZVRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWV0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZWVrQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJcIjtcclxuaW1wb3J0IHtQbGF5YmFja1RpbWVMYWJlbCwgVGltZUxhYmVsTW9kZX0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RpbWVsYWJlbFwiO1xyXG5pbXBvcnQge0h1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9odWdlcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtDb250cm9sQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbnRyb2xiYXJcIjtcclxuaW1wb3J0IHtOb0FyZ3MsIEV2ZW50RGlzcGF0Y2hlcn0gZnJvbSBcIi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7U2V0dGluZ3NUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvc2V0dGluZ3N0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZXR0aW5nc1BhbmVsLCBTZXR0aW5nc1BhbmVsSXRlbX0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3BhbmVsXCI7XHJcbmltcG9ydCB7VmlkZW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZGVvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1dhdGVybWFya30gZnJvbSBcIi4vY29tcG9uZW50cy93YXRlcm1hcmtcIjtcclxuaW1wb3J0IHtBdWRpb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7QXVkaW9UcmFja1NlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9hdWRpb3RyYWNrc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7U2Vla0JhckxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1ZvbHVtZVNsaWRlcn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWVzbGlkZXJcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1N1YnRpdGxlT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtWb2x1bWVDb250cm9sQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZWNvbnRyb2xidXR0b25cIjtcclxuaW1wb3J0IHtDYXN0VG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Nhc3R0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtDYXN0U3RhdHVzT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9jYXN0c3RhdHVzb3ZlcmxheVwiO1xyXG5pbXBvcnQge0Vycm9yTWVzc2FnZU92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvZXJyb3JtZXNzYWdlb3ZlcmxheVwiO1xyXG5pbXBvcnQge1RpdGxlQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3RpdGxlYmFyXCI7XHJcbmltcG9ydCBQbGF5ZXIgPSBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyO1xyXG5pbXBvcnQge1JlY29tbWVuZGF0aW9uT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9yZWNvbW1lbmRhdGlvbm92ZXJsYXlcIjtcclxuaW1wb3J0IHtBZE1lc3NhZ2VMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9hZG1lc3NhZ2VsYWJlbFwiO1xyXG5pbXBvcnQge0FkU2tpcEJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9hZHNraXBidXR0b25cIjtcclxuaW1wb3J0IHtBZENsaWNrT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9hZGNsaWNrb3ZlcmxheVwiO1xyXG5pbXBvcnQgRVZFTlQgPSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQ7XHJcbmltcG9ydCBQbGF5ZXJFdmVudENhbGxiYWNrID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50Q2FsbGJhY2s7XHJcbmltcG9ydCBBZFN0YXJ0ZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5BZFN0YXJ0ZWRFdmVudDtcclxuaW1wb3J0IHtBcnJheVV0aWxzfSBmcm9tIFwiLi91dGlsc1wiO1xyXG5pbXBvcnQge1BsYXliYWNrU3BlZWRTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2tzcGVlZHNlbGVjdGJveFwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVSVJlY29tbWVuZGF0aW9uQ29uZmlnIHtcclxuICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICB1cmw6IHN0cmluZztcclxuICAgIHRodW1ibmFpbD86IHN0cmluZztcclxuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVJQ29uZmlnIHtcclxuICAgIG1ldGFkYXRhPzoge1xyXG4gICAgICAgIHRpdGxlPzogc3RyaW5nXHJcbiAgICB9O1xyXG4gICAgcmVjb21tZW5kYXRpb25zPzogVUlSZWNvbW1lbmRhdGlvbkNvbmZpZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVUlNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIHBsYXllcjogUGxheWVyO1xyXG4gICAgcHJpdmF0ZSBwbGF5ZXJFbGVtZW50OiBET007XHJcbiAgICBwcml2YXRlIHBsYXllclVpOiBVSUNvbnRhaW5lcjtcclxuICAgIHByaXZhdGUgYWRzVWk6IFVJQ29udGFpbmVyO1xyXG4gICAgcHJpdmF0ZSBjb25maWc6IFVJQ29uZmlnO1xyXG5cclxuICAgIHByaXZhdGUgbWFuYWdlclBsYXllcldyYXBwZXI6IFBsYXllcldyYXBwZXI7XHJcbiAgICBwcml2YXRlIHVpUGxheWVyV3JhcHBlcnM6IFBsYXllcldyYXBwZXJbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgZXZlbnRzID0ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIGVudGVycyB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlRW50ZXI6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBpbnNpZGUgdGhlIFVJIGFyZWEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25Nb3VzZU1vdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBtb3VzZSBsZWF2ZXMgdGhlIFVJIGFyZWEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25Nb3VzZUxlYXZlOiBuZXcgRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb21wb25lbnRDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiBhIHNlZWsgc3RhcnRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2VlazogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgc2VlayB0aW1lbGluZSBpcyBzY3J1YmJlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtQcmV2aWV3OiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIG51bWJlcj4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIGEgc2VlayBpcyBmaW5pc2hlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiBhIGNvbXBvbmVudCBpcyBzaG93aW5nLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uQ29tcG9uZW50U2hvdzogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gYSBjb21wb25lbnQgaXMgaGlkaW5nLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uQ29tcG9uZW50SGlkZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgcGxheWVyVWk6IFVJQ29udGFpbmVyLCBhZHNVaTogVUlDb250YWluZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgIHRoaXMucGxheWVyVWkgPSBwbGF5ZXJVaTtcclxuICAgICAgICB0aGlzLmFkc1VpID0gYWRzVWk7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIHRoaXMubWFuYWdlclBsYXllcldyYXBwZXIgPSBuZXcgUGxheWVyV3JhcHBlcihwbGF5ZXIpO1xyXG5cclxuICAgICAgICBsZXQgcGxheWVySWQgPSBwbGF5ZXIuZ2V0RmlndXJlKCkucGFyZW50RWxlbWVudC5pZDtcclxuICAgICAgICB0aGlzLnBsYXllckVsZW1lbnQgPSBuZXcgRE9NKGAjJHtwbGF5ZXJJZH1gKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIFVJIGVsZW1lbnRzIHRvIHBsYXllclxyXG4gICAgICAgIHRoaXMuYWRkVWkocGxheWVyVWkpO1xyXG5cclxuICAgICAgICAvLyBBZHMgVUlcclxuICAgICAgICBpZiAoYWRzVWkpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRVaShhZHNVaSk7XHJcbiAgICAgICAgICAgIGFkc1VpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBlbnRlckFkc1VpID0gZnVuY3Rpb24gKGV2ZW50OiBBZFN0YXJ0ZWRFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyVWkuaGlkZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIERpc3BsYXkgdGhlIGFkcyBVSSAob25seSBmb3IgVkFTVCBhZHMsIG90aGVyIGNsaWVudHMgYnJpbmcgdGhlaXIgb3duIFVJKVxyXG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmNsaWVudFR5cGUgPT09IFwidmFzdFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWRzVWkuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgbGV0IGV4aXRBZHNVaSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGFkc1VpLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHBsYXllclVpLnNob3coKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlYWN0IHRvIGFkIGV2ZW50cyBmcm9tIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyUGxheWVyV3JhcHBlci5nZXRQbGF5ZXIoKS5hZGRFdmVudEhhbmRsZXIoRVZFTlQuT05fQURfU1RBUlRFRCwgZW50ZXJBZHNVaSk7XHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlclBsYXllcldyYXBwZXIuZ2V0UGxheWVyKCkuYWRkRXZlbnRIYW5kbGVyKEVWRU5ULk9OX0FEX0ZJTklTSEVELCBleGl0QWRzVWkpO1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZXJQbGF5ZXJXcmFwcGVyLmdldFBsYXllcigpLmFkZEV2ZW50SGFuZGxlcihFVkVOVC5PTl9BRF9TS0lQUEVELCBleGl0QWRzVWkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRDb25maWcoKTogVUlDb25maWcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyZUNvbnRyb2xzKGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pIHtcclxuICAgICAgICBsZXQgcGxheWVyV3JhcHBlciA9IHRoaXMudWlQbGF5ZXJXcmFwcGVyc1s8YW55PmNvbXBvbmVudF07XHJcblxyXG4gICAgICAgIGNvbXBvbmVudC5pbml0aWFsaXplKCk7XHJcbiAgICAgICAgY29tcG9uZW50LmNvbmZpZ3VyZShwbGF5ZXJXcmFwcGVyLmdldFBsYXllcigpLCB0aGlzKTtcclxuXHJcbiAgICAgICAgaWYgKGNvbXBvbmVudCBpbnN0YW5jZW9mIENvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjaGlsZENvbXBvbmVudCBvZiBjb21wb25lbnQuZ2V0Q29tcG9uZW50cygpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpZ3VyZUNvbnRyb2xzKGNoaWxkQ29tcG9uZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Nb3VzZUVudGVyKCk6IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uTW91c2VFbnRlcjtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Nb3VzZU1vdmUoKTogRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb21wb25lbnRDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25Nb3VzZU1vdmU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uTW91c2VMZWF2ZSgpOiBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vbk1vdXNlTGVhdmU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2VlaygpOiBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uU2VlaztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25TZWVrUHJldmlldygpOiBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgbnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uU2Vla1ByZXZpZXc7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uU2Vla2VkKCk6IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25TZWVrZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uQ29tcG9uZW50U2hvdygpOiBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vbkNvbXBvbmVudFNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IG9uQ29tcG9uZW50SGlkZSgpOiBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vbkNvbXBvbmVudEhpZGU7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhZGRVaSh1aTogVUlDb250YWluZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnBsYXllckVsZW1lbnQuYXBwZW5kKHVpLmdldERvbUVsZW1lbnQoKSk7XHJcbiAgICAgICAgdGhpcy51aVBsYXllcldyYXBwZXJzWzxhbnk+dWldID0gbmV3IFBsYXllcldyYXBwZXIodGhpcy5wbGF5ZXIpO1xyXG4gICAgICAgIHRoaXMuY29uZmlndXJlQ29udHJvbHModWkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcmVsZWFzZVVpKHVpOiBVSUNvbnRhaW5lcik6IHZvaWQge1xyXG4gICAgICAgIHVpLmdldERvbUVsZW1lbnQoKS5yZW1vdmUoKTtcclxuICAgICAgICB0aGlzLnVpUGxheWVyV3JhcHBlcnNbPGFueT51aV0uY2xlYXJFdmVudEhhbmRsZXJzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVsZWFzZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnJlbGVhc2VVaSh0aGlzLnBsYXllclVpKTtcclxuICAgICAgICBpZiAodGhpcy5hZHNVaSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlbGVhc2VVaSh0aGlzLmFkc1VpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5tYW5hZ2VyUGxheWVyV3JhcHBlci5jbGVhckV2ZW50SGFuZGxlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgRmFjdG9yeSA9IGNsYXNzIHtcclxuICAgICAgICBzdGF0aWMgYnVpbGREZWZhdWx0VUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIHJldHVybiBVSU1hbmFnZXIuRmFjdG9yeS5idWlsZE1vZGVyblVJKHBsYXllciwgY29uZmlnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHN0YXRpYyBidWlsZE1vZGVyblVJKHBsYXllcjogUGxheWVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pOiBVSU1hbmFnZXIge1xyXG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJWaWRlbyBRdWFsaXR5XCIsIG5ldyBWaWRlb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiU3BlZWRcIiwgbmV3IFBsYXliYWNrU3BlZWRTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gVHJhY2tcIiwgbmV3IEF1ZGlvVHJhY2tTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gUXVhbGl0eVwiLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlN1YnRpdGxlc1wiLCBuZXcgU3VidGl0bGVTZWxlY3RCb3goKSlcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udHJvbEJhciA9IG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBzZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoe3RpbWVMYWJlbE1vZGU6IFRpbWVMYWJlbE1vZGUuQ3VycmVudFRpbWV9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKHtsYWJlbDogbmV3IFNlZWtCYXJMYWJlbCgpfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoe3RpbWVMYWJlbE1vZGU6IFRpbWVMYWJlbE1vZGUuVG90YWxUaW1lfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzZXM6IFtcImNvbnRyb2xiYXItdG9wXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZVRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZVNsaWRlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbXBvbmVudCh7Y3NzQ2xhc3M6IFwic3BhY2VyXCJ9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0VG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVlJUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1RvZ2dsZUJ1dHRvbih7c2V0dGluZ3NQYW5lbDogc2V0dGluZ3NQYW5lbH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3NlczogW1wiY29udHJvbGJhci1ib3R0b21cIl1cclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTdWJ0aXRsZU92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFN0YXR1c092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlY29tbWVuZGF0aW9uT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xCYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFRpdGxlQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yTWVzc2FnZU92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgV2F0ZXJtYXJrKClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbW9kZXJuXCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGFkc1VpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQWRDbGlja092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFkTWVzc2FnZUxhYmVsKHsgdGV4dDogXCJBZDoge3JlbWFpbmluZ1RpbWV9IHNlY3NcIiB9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBZFNraXBCdXR0b24oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1hZHMtc3RhdHVzXCJcclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ29udHJvbEJhcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZVNsaWRlcigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ29tcG9uZW50KHtjc3NDbGFzczogXCJzcGFjZXJcIn0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3NzQ2xhc3NlczogW1wiY29udHJvbGJhci1ib3R0b21cIl1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbW9kZXJuIGFkc1wiXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVUlNYW5hZ2VyKHBsYXllciwgdWksIGFkc1VpLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5VUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBzZXR0aW5nc1BhbmVsID0gbmV3IFNldHRpbmdzUGFuZWwoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlZpZGVvIFF1YWxpdHlcIiwgbmV3IFZpZGVvUXVhbGl0eVNlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBUcmFja1wiLCBuZXcgQXVkaW9UcmFja1NlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBRdWFsaXR5XCIsIG5ldyBBdWRpb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiU3VidGl0bGVzXCIsIG5ldyBTdWJ0aXRsZVNlbGVjdEJveCgpKVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzUGFuZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNlZWtCYXIoe2xhYmVsOiBuZXcgU2Vla0JhckxhYmVsKCl9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVlJUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1RvZ2dsZUJ1dHRvbih7c2V0dGluZ3NQYW5lbDogc2V0dGluZ3NQYW5lbH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0VG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24oKVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCB1aSA9IG5ldyBVSUNvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN1YnRpdGxlT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0U3RhdHVzT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBIdWdlUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgV2F0ZXJtYXJrKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlY29tbWVuZGF0aW9uT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xCYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFRpdGxlQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yTWVzc2FnZU92ZXJsYXkoKVxyXG4gICAgICAgICAgICAgICAgXSwgY3NzQ2xhc3NlczogW1widWktc2tpbi1sZWdhY3lcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgYWRzVWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBBZENsaWNrT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQWRNZXNzYWdlTGFiZWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVDb250cm9sQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQWRTa2lwQnV0dG9uKClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5IGFkc1wiXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVUlNYW5hZ2VyKHBsYXllciwgdWksIGFkc1VpLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5Q2FzdFJlY2VpdmVyVUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU3VidGl0bGVPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBXYXRlcm1hcmsoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5IHVpLXNraW4tbGVnYWN5LWNhc3QtcmVjZWl2ZXJcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVJTWFuYWdlcihwbGF5ZXIsIHVpLCBudWxsLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5VGVzdFVJKHBsYXllcjogUGxheWVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pOiBVSU1hbmFnZXIge1xyXG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJWaWRlbyBRdWFsaXR5XCIsIG5ldyBWaWRlb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gVHJhY2tcIiwgbmV3IEF1ZGlvVHJhY2tTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gUXVhbGl0eVwiLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlN1YnRpdGxlc1wiLCBuZXcgU3VidGl0bGVTZWxlY3RCb3goKSlcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udHJvbEJhciA9IG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtzZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKHtsYWJlbDogbmV3IFNlZWtCYXJMYWJlbCgpfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZSVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZVRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVTbGlkZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVDb250cm9sQnV0dG9uKHt2ZXJ0aWNhbDogZmFsc2V9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NUb2dnbGVCdXR0b24oe3NldHRpbmdzUGFuZWw6IHNldHRpbmdzUGFuZWx9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uKClcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTdWJ0aXRsZU92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFN0YXR1c092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFdhdGVybWFyaygpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWNvbW1lbmRhdGlvbk92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5XCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVSU1hbmFnZXIocGxheWVyLCB1aSwgbnVsbCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogV3JhcHMgdGhlIHBsYXllciB0byB0cmFjayBldmVudCBoYW5kbGVycyBhbmQgcHJvdmlkZSBhIHNpbXBsZSBtZXRob2QgdG8gcmVtb3ZlIGFsbCByZWdpc3RlcmVkIGV2ZW50XHJcbiAqIGhhbmRsZXJzIGZyb20gdGhlIHBsYXllci5cclxuICovXHJcbmNsYXNzIFBsYXllcldyYXBwZXIge1xyXG5cclxuICAgIHByaXZhdGUgcGxheWVyOiBQbGF5ZXI7XHJcbiAgICBwcml2YXRlIHdyYXBwZXI6IFBsYXllcjtcclxuXHJcbiAgICBwcml2YXRlIGV2ZW50SGFuZGxlcnM6IHsgW2V2ZW50VHlwZTogc3RyaW5nXTogUGxheWVyRXZlbnRDYWxsYmFja1tdOyB9ID0ge307XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIpIHtcclxuICAgICAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBDb2xsZWN0IGFsbCBwdWJsaWMgQVBJIG1ldGhvZHMgb2YgdGhlIHBsYXllclxyXG4gICAgICAgIGxldCBtZXRob2RzID0gPGFueVtdPltdO1xyXG4gICAgICAgIGZvciAobGV0IG1lbWJlciBpbiBwbGF5ZXIpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoPGFueT5wbGF5ZXIpW21lbWJlcl0gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kcy5wdXNoKG1lbWJlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB3cmFwcGVyIG9iamVjdCBhbmQgYWRkIGZ1bmN0aW9uIHdyYXBwZXJzIGZvciBhbGwgQVBJIG1ldGhvZHMgdGhhdCBkbyBub3RoaW5nIGJ1dCBjYWxsaW5nIHRoZSBiYXNlIG1ldGhvZCBvbiB0aGUgcGxheWVyXHJcbiAgICAgICAgbGV0IHdyYXBwZXIgPSA8YW55Pnt9O1xyXG4gICAgICAgIGZvciAobGV0IG1lbWJlciBvZiBtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIHdyYXBwZXJbbWVtYmVyXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2FsbGVkIFwiICsgbWVtYmVyKTsgLy8gdHJhY2sgbWV0aG9kIGNhbGxzIG9uIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgICAgIHJldHVybiAoPGFueT5wbGF5ZXIpW21lbWJlcl0uYXBwbHkocGxheWVyLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwbGljaXRseSBhZGQgYSB3cmFwcGVyIG1ldGhvZCBmb3IgXCJhZGRFdmVudEhhbmRsZXJcIiB0aGF0IGFkZHMgYWRkZWQgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGV2ZW50IGxpc3RcclxuICAgICAgICB3cmFwcGVyLmFkZEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChldmVudFR5cGU6IEVWRU5ULCBjYWxsYmFjazogUGxheWVyRXZlbnRDYWxsYmFjayk6IFBsYXllciB7XHJcbiAgICAgICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoZXZlbnRUeXBlLCBjYWxsYmFjayk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNlbGYuZXZlbnRIYW5kbGVyc1tldmVudFR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXS5wdXNoKGNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEV4cGxpY2l0bHkgYWRkIGEgd3JhcHBlciBtZXRob2QgZm9yIFwicmVtb3ZlRXZlbnRIYW5kbGVyXCIgdGhhdCByZW1vdmVzIHJlbW92ZWQgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGUgZXZlbnQgbGlzdFxyXG4gICAgICAgIHdyYXBwZXIucmVtb3ZlRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50VHlwZTogRVZFTlQsIGNhbGxiYWNrOiBQbGF5ZXJFdmVudENhbGxiYWNrKTogUGxheWVyIHtcclxuICAgICAgICAgICAgcGxheWVyLnJlbW92ZUV2ZW50SGFuZGxlcihldmVudFR5cGUsIGNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSkge1xyXG4gICAgICAgICAgICAgICAgQXJyYXlVdGlscy5yZW1vdmUoc2VsZi5ldmVudEhhbmRsZXJzW2V2ZW50VHlwZV0sIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy53cmFwcGVyID0gPFBsYXllcj53cmFwcGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHdyYXBwZWQgcGxheWVyIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIG9uIHBsYWNlIG9mIHRoZSBub3JtYWwgcGxheWVyIG9iamVjdC5cclxuICAgICAqIEByZXR1cm5zIHtQbGF5ZXJ9IGEgd3JhcHBlZCBwbGF5ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0UGxheWVyKCk6IFBsYXllciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMud3JhcHBlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFycyBhbGwgcmVnaXN0ZXJlZCBldmVudCBoYW5kbGVycyBmcm9tIHRoZSBwbGF5ZXIgdGhhdCB3ZXJlIGFkZGVkIHRocm91Z2ggdGhlIHdyYXBwZWQgcGxheWVyLlxyXG4gICAgICovXHJcbiAgICBjbGVhckV2ZW50SGFuZGxlcnMoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgZXZlbnRUeXBlIGluIHRoaXMuZXZlbnRIYW5kbGVycykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50VHlwZSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIEFycmF5VXRpbHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGl0ZW0gZnJvbSBhbiBhcnJheS5cclxuICAgICAqIEBwYXJhbSBhcnJheSB0aGUgYXJyYXkgdGhhdCBtYXkgY29udGFpbiB0aGUgaXRlbSB0byByZW1vdmVcclxuICAgICAqIEBwYXJhbSBpdGVtIHRoZSBpdGVtIHRvIHJlbW92ZSBmcm9tIHRoZSBhcnJheVxyXG4gICAgICogQHJldHVybnMge2FueX0gdGhlIHJlbW92ZWQgaXRlbSBvciBudWxsIGlmIGl0IHdhc24ndCBwYXJ0IG9mIHRoZSBhcnJheVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlPFQ+KGFycmF5OiBUW10sIGl0ZW06IFQpOiBUIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gYXJyYXkuaW5kZXhPZihpdGVtKTtcclxuXHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5LnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIFN0cmluZ1V0aWxzIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcm1hdHMgYSBudW1iZXIgb2Ygc2Vjb25kcyBpbnRvIGEgdGltZSBzdHJpbmcgd2l0aCB0aGUgcGF0dGVybiBoaDptbTpzcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdG90YWxTZWNvbmRzIHRoZSB0b3RhbCBudW1iZXIgb2Ygc2Vjb25kcyB0byBmb3JtYXQgdG8gc3RyaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgZm9ybWF0dGVkIHRpbWUgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBzZWNvbmRzVG9UaW1lKHRvdGFsU2Vjb25kczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgaXNOZWdhdGl2ZSA9IHRvdGFsU2Vjb25kcyA8IDA7XHJcblxyXG4gICAgICAgIGlmIChpc05lZ2F0aXZlKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSB0aW1lIGlzIG5lZ2F0aXZlLCB3ZSBtYWtlIGl0IHBvc2l0aXZlIGZvciB0aGUgY2FsY3VsYXRpb24gYmVsb3dcclxuICAgICAgICAgICAgLy8gKGVsc2Ugd2UnZCBnZXQgYWxsIG5lZ2F0aXZlIG51bWJlcnMpIGFuZCByZWF0dGFjaCB0aGUgbmVnYXRpdmUgc2lnbiBsYXRlci5cclxuICAgICAgICAgICAgdG90YWxTZWNvbmRzID0gLXRvdGFsU2Vjb25kcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNwbGl0IGludG8gc2VwYXJhdGUgdGltZSBwYXJ0c1xyXG4gICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IodG90YWxTZWNvbmRzIC8gMzYwMCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcyAvIDYwKSAtIGhvdXJzICogNjA7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcykgJSA2MDtcclxuXHJcbiAgICAgICAgcmV0dXJuIChpc05lZ2F0aXZlID8gXCItXCIgOiBcIlwiKSArIGxlZnRQYWRXaXRoWmVyb3MoaG91cnMsIDIpICsgXCI6XCIgKyBsZWZ0UGFkV2l0aFplcm9zKG1pbnV0ZXMsIDIpICsgXCI6XCIgKyBsZWZ0UGFkV2l0aFplcm9zKHNlY29uZHMsIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBudW1iZXIgdG8gYSBzdHJpbmcgYW5kIGxlZnQtcGFkcyBpdCB3aXRoIHplcm9zIHRvIHRoZSBzcGVjaWZpZWQgbGVuZ3RoLlxyXG4gICAgICogRXhhbXBsZTogbGVmdFBhZFdpdGhaZXJvcygxMjMsIDUpID0+IFwiMDAxMjNcIlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBudW0gdGhlIG51bWJlciB0byBjb252ZXJ0IHRvIHN0cmluZyBhbmQgcGFkIHdpdGggemVyb3NcclxuICAgICAqIEBwYXJhbSBsZW5ndGggdGhlIGRlc2lyZWQgbGVuZ3RoIG9mIHRoZSBwYWRkZWQgc3RyaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgcGFkZGVkIG51bWJlciBhcyBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gbGVmdFBhZFdpdGhaZXJvcyhudW06IG51bWJlciwgbGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCB0ZXh0ID0gbnVtICsgXCJcIjtcclxuICAgICAgICBsZXQgcGFkZGluZyA9IFwiMDAwMDAwMDAwMFwiLnN1YnN0cigwLCBsZW5ndGggLSB0ZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgcmV0dXJuIHBhZGRpbmcgKyB0ZXh0O1xyXG4gICAgfVxyXG59Il19

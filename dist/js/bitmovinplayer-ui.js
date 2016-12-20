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
        var clickThroughUrl = null;
        var clickThroughEnabled = !player.getConfig().advertising
            || !player.getConfig().advertising.hasOwnProperty("clickThroughEnabled")
            || player.getConfig().advertising.clickThroughEnabled;
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_STARTED, function (event) {
            clickThroughUrl = event.clickThroughUrl;
            if (clickThroughEnabled) {
                self.setUrl(clickThroughUrl);
            }
            else {
                // If click-through is disabled, we set the url to null to avoid it open
                self.setUrl(null);
            }
        });
        // Clear click-through URL when ad has finished
        var adFinishedHandler = function () {
            self.setUrl(null);
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_FINISHED, adFinishedHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_SKIPPED, adFinishedHandler);
        self.onClick.subscribe(function () {
            // Pause the ad when click-through URL opens
            if (clickThroughEnabled) {
                player.pause();
            }
            // Notify the player of the clicked ad
            player.fireEvent(bitmovin.player.EVENT.ON_AD_CLICKED, {
                clickThroughUrl: clickThroughUrl
            });
        });
    };
    return AdClickOverlay;
}(clickoverlay_1.ClickOverlay));
exports.AdClickOverlay = AdClickOverlay;
},{"./clickoverlay":10}],2:[function(require,module,exports){
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
            self.setText(utils_1.StringUtils.replaceAdMessagePlaceholders(text, null, player));
        };
        var adStartHandler = function (event) {
            text = event.adMessage || text;
            updateMessageHandler();
            player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateMessageHandler);
            player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, updateMessageHandler);
        };
        var adEndHandler = function () {
            player.removeEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateMessageHandler);
            player.removeEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, updateMessageHandler);
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_STARTED, adStartHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_SKIPPED, adEndHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_AD_FINISHED, adEndHandler);
    };
    return AdMessageLabel;
}(label_1.Label));
exports.AdMessageLabel = AdMessageLabel;
},{"../utils":47,"./label":18}],3:[function(require,module,exports){
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
var utils_1 = require("../utils");
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
                countdown: "Skip ad in {remainingTime}",
                skip: "Skip ad"
            }
        }, _this.config);
        return _this;
    }
    AdSkipButton.prototype.configure = function (player, uimanager) {
        _super.prototype.configure.call(this, player, uimanager);
        var self = this;
        var config = this.getConfig(); // TODO get rid of generic cast
        var skipMessage = config.skipMessage;
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
                self.setText(utils_1.StringUtils.replaceAdMessagePlaceholders(config.skipMessage.countdown, adEvent.skipOffset, player));
            }
            else {
                self.setText(config.skipMessage.skip);
            }
        };
        var adStartHandler = function (event) {
            adEvent = event;
            skipMessage = adEvent.skipMessage || skipMessage;
            updateSkipMessageHandler();
            player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateSkipMessageHandler);
            player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, updateSkipMessageHandler);
        };
        var adEndHandler = function () {
            player.removeEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, updateSkipMessageHandler);
            player.removeEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, updateSkipMessageHandler);
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
},{"../utils":47,"./button":7}],4:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGED, updateAudioQualities); // Update qualities when audio track has changed
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateAudioQualities); // Update qualities when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateAudioQualities); // Update qualities when a new source is loaded
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_DOWNLOAD_QUALITY_CHANGED, function () {
            var data = player.getDownloadedAudioData();
            self.selectItem(data.isAuto ? "auto" : data.id);
        }); // Update quality selection when quality is changed (from outside)
        // Populate qualities at startup
        updateAudioQualities();
    };
    return AudioQualitySelectBox;
}(selectbox_1.SelectBox));
exports.AudioQualitySelectBox = AudioQualitySelectBox;
},{"./selectbox":26}],5:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGED, audioTrackHandler); // Update selection when selected track has changed
        player.addEventHandler(bitmovin.player.EVENT.ON_SOURCE_UNLOADED, updateAudioTracks); // Update tracks when source goes away
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, updateAudioTracks); // Update tracks when a new source is loaded
        // Populate tracks at startup
        updateAudioTracks();
    };
    return AudioTrackSelectBox;
}(selectbox_1.SelectBox));
exports.AudioTrackSelectBox = AudioTrackSelectBox;
},{"./selectbox":26}],6:[function(require,module,exports){
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
/**
 * Overlays the player and displays a buffering indicator.
 */
var BufferingOverlay = (function (_super) {
    __extends(BufferingOverlay, _super);
    function BufferingOverlay(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.indicators = [
            new component_1.Component({ tag: "div", cssClass: "ui-buffering-overlay-indicator" }),
            new component_1.Component({ tag: "div", cssClass: "ui-buffering-overlay-indicator" }),
            new component_1.Component({ tag: "div", cssClass: "ui-buffering-overlay-indicator" }),
        ];
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-buffering-overlay",
            hidden: true,
            components: _this.indicators
        }, _this.config);
        return _this;
    }
    BufferingOverlay.prototype.configure = function (player, uimanager) {
        _super.prototype.configure.call(this, player, uimanager);
        var self = this;
        player.addEventHandler(bitmovin.player.EVENT.ON_STALL_STARTED, function () {
            self.show();
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_STALL_ENDED, function () {
            self.hide();
        });
    };
    return BufferingOverlay;
}(container_1.Container));
exports.BufferingOverlay = BufferingOverlay;
},{"./component":11,"./container":12}],7:[function(require,module,exports){
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
            "class": this.prefixCss("label")
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
        this.getDomElement().find("." + this.prefixCss("label")).html(text);
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
},{"../dom":41,"../eventdispatcher":42,"./component":11}],8:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STARTED, function (event) {
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
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOPPED, function (event) {
            // Cast session gone, hide the status panel
            self.hide();
        });
    };
    return CastStatusOverlay;
}(container_1.Container));
exports.CastStatusOverlay = CastStatusOverlay;
},{"./container":12,"./label":18}],9:[function(require,module,exports){
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
                if (console)
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
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STARTED, function () {
            self.on();
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOPPED, function () {
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
},{"./togglebutton":32}],10:[function(require,module,exports){
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
},{"./button":7}],11:[function(require,module,exports){
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
        // Create the configuration for this component
        this.config = this.mergeConfig(config, {
            tag: "div",
            id: "bmpui-id-" + guid_1.Guid.next(),
            cssPrefix: "bmpui",
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
        var self = this;
        // Merge all CSS classes into single array
        var flattenedArray = [this.config.cssClass].concat(this.config.cssClasses);
        // Prefix classes
        flattenedArray = flattenedArray.map(function (css) {
            return self.prefixCss(css);
        });
        // Join array values into a string
        var flattenedString = flattenedArray.join(" ");
        // Return trimmed string to prevent whitespace at the end from the join operation
        return flattenedString.trim();
    };
    Component.prototype.prefixCss = function (cssClassOrId) {
        return this.config.cssPrefix + "-" + cssClassOrId;
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
        this.getDomElement().addClass(this.prefixCss(Component.CLASS_HIDDEN));
        this.onHideEvent();
    };
    /**
     * Shows the component.
     */
    Component.prototype.show = function () {
        this.getDomElement().removeClass(this.prefixCss(Component.CLASS_HIDDEN));
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
},{"../dom":41,"../eventdispatcher":42,"../guid":43}],12:[function(require,module,exports){
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
            "class": this.prefixCss("container-wrapper")
        });
        this.innerContainerElement = innerContainer;
        this.updateComponents();
        containerElement.append(innerContainer);
        return containerElement;
    };
    return Container;
}(component_1.Component));
exports.Container = Container;
},{"../dom":41,"../utils":47,"./component":11}],13:[function(require,module,exports){
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
},{"../timeout":45,"./container":12}],14:[function(require,module,exports){
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
},{"./container":12,"./label":18,"./tvnoisecanvas":33}],15:[function(require,module,exports){
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
},{"./togglebutton":32}],16:[function(require,module,exports){
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
        var firstClick = true;
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
            // Directly start playback on first click of the button.
            // This is a required workaround for mobile browsers where video playback needs to be triggered directly
            // by the user. A deferred playback start through the timeout below is not considered as user action and
            // therefore ignored by mobile browsers.
            if (firstClick) {
                togglePlayback();
                firstClick = false;
                return;
            }
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
        // Hide button while initializing a Cast session
        var castInitializationHandler = function (event) {
            if (event.type === bitmovin.player.EVENT.ON_CAST_STARTED) {
                // Hide button when session is being initialized
                self.hide();
            }
            else {
                // Show button when session is established or initialization was aborted
                self.show();
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STARTED, castInitializationHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_LAUNCHED, castInitializationHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_STOPPED, castInitializationHandler);
    };
    HugePlaybackToggleButton.prototype.toDomElement = function () {
        var buttonElement = _super.prototype.toDomElement.call(this);
        // Add child that contains the play button image
        // Setting the image directly on the button does not work together with scaling animations, because the button
        // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
        // to the size if the image, it can scale inside the player without overshooting.
        buttonElement.append(new dom_1.DOM("div", {
            "class": this.prefixCss("image")
        }));
        return buttonElement;
    };
    return HugePlaybackToggleButton;
}(playbacktogglebutton_1.PlaybackToggleButton));
exports.HugePlaybackToggleButton = HugePlaybackToggleButton;
},{"../dom":41,"./playbacktogglebutton":22}],17:[function(require,module,exports){
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
var dom_1 = require("../dom");
/**
 * A button to play/replay a video.
 */
var HugeReplayButton = (function (_super) {
    __extends(HugeReplayButton, _super);
    function HugeReplayButton(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-hugereplaybutton",
            text: "Replay"
        }, _this.config);
        return _this;
    }
    HugeReplayButton.prototype.configure = function (player, uimanager) {
        _super.prototype.configure.call(this, player, uimanager);
        this.onClick.subscribe(function () {
            player.play();
        });
    };
    HugeReplayButton.prototype.toDomElement = function () {
        var buttonElement = _super.prototype.toDomElement.call(this);
        // Add child that contains the play button image
        // Setting the image directly on the button does not work together with scaling animations, because the button
        // can cover the whole video player are and scaling would extend it beyond. By adding an inner element, confined
        // to the size if the image, it can scale inside the player without overshooting.
        buttonElement.append(new dom_1.DOM("div", {
            "class": this.prefixCss("image")
        }));
        return buttonElement;
    };
    return HugeReplayButton;
}(button_1.Button));
exports.HugeReplayButton = HugeReplayButton;
},{"../dom":41,"./button":7}],18:[function(require,module,exports){
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
        _this.labelEvents = {
            onClick: new eventdispatcher_1.EventDispatcher()
        };
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-label"
        }, _this.config);
        return _this;
    }
    Label.prototype.toDomElement = function () {
        var self = this;
        var labelElement = new dom_1.DOM("span", {
            "id": this.config.id,
            "class": this.getCssClasses()
        }).html(this.config.text);
        labelElement.on("click", function () {
            self.onClickEvent();
        });
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
    Label.prototype.onClickEvent = function () {
        this.labelEvents.onClick.dispatch(this);
    };
    Object.defineProperty(Label.prototype, "onClick", {
        /**
         * Gets the event that is fired when the label is clicked.
         * @returns {Event<Sender, Args>}
         */
        get: function () {
            return this.labelEvents.onClick.getEvent();
        },
        enumerable: true,
        configurable: true
    });
    return Label;
}(component_1.Component));
exports.Label = Label;
},{"../dom":41,"../eventdispatcher":42,"./component":11}],19:[function(require,module,exports){
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
var utils_1 = require("../utils");
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
            if (key === this.items[index].key) {
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
            utils_1.ArrayUtils.remove(this.items, this.items[index]);
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
},{"../eventdispatcher":42,"../utils":47,"./component":11}],20:[function(require,module,exports){
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
},{"./selectbox":26}],21:[function(require,module,exports){
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
            cssClass: "ui-playbacktimelabel",
            timeLabelMode: TimeLabelMode.CurrentAndTotalTime,
            hideInLivePlayback: false,
        }, _this.config);
        return _this;
    }
    PlaybackTimeLabel.prototype.configure = function (player, uimanager) {
        _super.prototype.configure.call(this, player, uimanager);
        var self = this;
        var config = self.getConfig();
        var live = false;
        var liveCssClass = self.prefixCss("ui-playbacktimelabel-live");
        var liveEdgeCssClass = self.prefixCss("ui-playbacktimelabel-live-edge");
        var minWidth = 0;
        var liveClickHandler = function () {
            player.timeShift(0);
        };
        var updateLiveState = function () {
            // Player is playing a live stream when the duration is infinite
            live = (player.getDuration() === Infinity);
            // Attach/detach live marker class
            if (live) {
                self.getDomElement().addClass(liveCssClass);
                self.setText("Live");
                if (config.hideInLivePlayback) {
                    self.hide();
                }
                self.onClick.subscribe(liveClickHandler);
                updateLiveTimeshiftState();
            }
            else {
                self.getDomElement().removeClass(liveCssClass);
                self.getDomElement().removeClass(liveEdgeCssClass);
                self.show();
                self.onClick.unsubscribe(liveClickHandler);
            }
        };
        var updateLiveTimeshiftState = function () {
            if (player.getTimeShift() === 0) {
                self.getDomElement().addClass(liveEdgeCssClass);
            }
            else {
                self.getDomElement().removeClass(liveEdgeCssClass);
            }
        };
        var playbackTimeHandler = function () {
            if ((player.getDuration() === Infinity) !== live) {
                updateLiveState();
            }
            if (!live) {
                self.setTime(player.getCurrentTime(), player.getDuration());
            }
            // To avoid "jumping" in the UI by varying label sizes due to non-monospaced fonts,
            // we gradually increase the min-width with the content to reach a stable size.
            var width = self.getDomElement().width();
            if (width > minWidth) {
                minWidth = width;
                self.getDomElement().css({
                    "min-width": minWidth + "px"
                });
            }
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_CHANGED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, playbackTimeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, updateLiveTimeshiftState);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFTED, updateLiveTimeshiftState);
        // Reset min-width when a new source is ready (especially for switching VOD/Live modes where the label content changes)
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, function () {
            minWidth = 0;
            self.getDomElement().css({
                "min-width": null
            });
        });
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
},{"../utils":47,"./label":18}],22:[function(require,module,exports){
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
                    || event.type === bitmovin.player.EVENT.ON_CAST_PLAYING || event.type === bitmovin.player.EVENT.ON_CAST_PAUSED)) {
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
        player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, playbackStateHandler); // when playback finishes, player turns to paused mode
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_LAUNCHED, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PLAYING, playbackStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_PAUSED, playbackStateHandler);
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
},{"./togglebutton":32}],23:[function(require,module,exports){
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
var hugereplaybutton_1 = require("./hugereplaybutton");
/**
 * Overlays the player and displays recommended videos.
 */
var RecommendationOverlay = (function (_super) {
    __extends(RecommendationOverlay, _super);
    function RecommendationOverlay(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this, config) || this;
        _this.replayButton = new hugereplaybutton_1.HugeReplayButton();
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-recommendation-overlay",
            hidden: true,
            components: [_this.replayButton]
        }, _this.config);
        return _this;
    }
    RecommendationOverlay.prototype.configure = function (player, uimanager) {
        _super.prototype.configure.call(this, player, uimanager);
        var self = this;
        var index = 1;
        for (var _i = 0, _a = uimanager.getConfig().recommendations; _i < _a.length; _i++) {
            var item = _a[_i];
            this.addComponent(new RecommendationItem({
                itemConfig: item,
                cssClasses: ["recommendation-item-" + (index++)]
            }));
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
        }).css({ "background-image": "url(" + config.thumbnail + ")" });
        var bgElement = new dom_1.DOM("div", {
            "class": "background"
        });
        itemElement.append(bgElement);
        var titleElement = new dom_1.DOM("span", {
            "class": "title"
        }).append(new dom_1.DOM("span", {
            "class": "innertitle"
        }).html(config.title));
        itemElement.append(titleElement);
        var timeElement = new dom_1.DOM("span", {
            "class": "duration"
        }).append(new dom_1.DOM("span", {
            "class": "innerduration"
        }).html(utils_1.StringUtils.secondsToTime(config.duration)));
        itemElement.append(timeElement);
        return itemElement;
    };
    return RecommendationItem;
}(component_1.Component));
},{"../dom":41,"../utils":47,"./component":11,"./container":12,"./hugereplaybutton":17}],24:[function(require,module,exports){
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
var timeout_1 = require("../timeout");
/**
 * A seek bar to seek within the player's media. It displays the current playback position, amount of buffed data, seek
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
        // https://hacks.mozilla.org/2013/04/detecting-touch-its-the-why-not-the-how/
        _this.touchSupported = ("ontouchstart" in window);
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
                // NOTE: We do not update the playback position here because we maintain our own local
                // playback position update handling in the Timeout below
                var playbackPositionPercentage = 100 / player.getDuration() * player.getCurrentTime();
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
        player.addEventHandler(bitmovin.player.EVENT.ON_STALL_ENDED, playbackPositionHandler); // update bufferlevel when buffering is complete
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEKED, playbackPositionHandler); // update playback position when a seek has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFTED, playbackPositionHandler); // update playback position when a timeshift has finished
        player.addEventHandler(bitmovin.player.EVENT.ON_SEGMENT_REQUEST_FINISHED, playbackPositionHandler); // update bufferlevel when a segment has been downloaded
        player.addEventHandler(bitmovin.player.EVENT.ON_CAST_TIME_UPDATED, playbackPositionHandler); // update playback position of Cast playback
        // Playback position update
        // We do not update the position directly from the ON_TIME_CHANGED event, because it arrives very jittery and
        // results in a jittery position indicator since the CSS transition time is statically set.
        // To work around this issue, we maintain a local playback position that is updated in a stable regular interval
        // and kept in sync with the player.
        var currentTimeSeekBar = 0;
        var currentTimePlayer = 0;
        var updateIntervalMs = 100;
        var currentTimeUpdateDeltaSecs = updateIntervalMs / 1000;
        var smoothPlaybackPositionUpdater = new timeout_1.Timeout(updateIntervalMs, function () {
            currentTimeSeekBar += currentTimeUpdateDeltaSecs;
            currentTimePlayer = player.getCurrentTime();
            // Sync currentTime of seekbar to player
            var currentTimeDelta = currentTimeSeekBar - currentTimePlayer;
            // If currentTimeDelta is negative and below the adjustment threshold,
            // the player is ahead of the seekbar and we "fast forward" the seekbar
            if (currentTimeDelta <= -currentTimeUpdateDeltaSecs) {
                currentTimeSeekBar += currentTimeUpdateDeltaSecs;
            }
            else if (currentTimeDelta >= currentTimeUpdateDeltaSecs) {
                currentTimeSeekBar -= currentTimeUpdateDeltaSecs;
            }
            var playbackPositionPercentage = 100 / player.getDuration() * currentTimeSeekBar;
            self.setPlaybackPosition(playbackPositionPercentage);
        }, true);
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, function () {
            if (!player.isLive()) {
                currentTimeSeekBar = player.getCurrentTime();
                smoothPlaybackPositionUpdater.start();
            }
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, function () {
            smoothPlaybackPositionUpdater.clear();
        });
        // Seek handling
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
        // Hide seekbar for live sources without timeshift
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, function () {
            if (player.isLive() && player.getMaxTimeShift() === 0) {
                self.hide();
            }
            else {
                self.show();
            }
        });
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
            "class": this.prefixCss("seekbar")
        });
        this.seekBar = seekBar;
        // Indicator that shows the buffer fill level
        var seekBarBufferLevel = new dom_1.DOM("div", {
            "class": this.prefixCss("seekbar-bufferlevel")
        });
        this.seekBarBufferPosition = seekBarBufferLevel;
        // Indicator that shows the current playback position
        var seekBarPlaybackPosition = new dom_1.DOM("div", {
            "class": this.prefixCss("seekbar-playbackposition")
        }).append(new dom_1.DOM("div", {
            "class": this.prefixCss("seekbar-playbackposition-marker")
        }));
        this.seekBarPlaybackPosition = seekBarPlaybackPosition;
        // Indicator that show where a seek will go to
        var seekBarSeekPosition = new dom_1.DOM("div", {
            "class": this.prefixCss("seekbar-seekposition")
        });
        this.seekBarSeekPosition = seekBarSeekPosition;
        // Indicator that shows the full seekbar
        var seekBarBackdrop = new dom_1.DOM("div", {
            "class": this.prefixCss("seekbar-backdrop")
        });
        this.seekBarBackdrop = seekBarBackdrop;
        seekBar.append(seekBarBackdrop, seekBarBufferLevel, seekBarSeekPosition, seekBarPlaybackPosition);
        var self = this;
        var seeking = false;
        // Define handler functions so we can attach/remove them later
        var mouseTouchMoveHandler = function (e) {
            e.preventDefault();
            // Avoid propagation to VR handler
            e.stopPropagation();
            var targetPercentage = 100 * self.getOffset(e);
            self.setSeekPosition(targetPercentage);
            self.setPlaybackPosition(targetPercentage);
            self.onSeekPreviewEvent(targetPercentage, true);
        };
        var mouseTouchUpHandler = function (e) {
            e.preventDefault();
            // Remove handlers, seek operation is finished
            new dom_1.DOM(document).off("touchmove mousemove", mouseTouchMoveHandler);
            new dom_1.DOM(document).off("touchend mouseup", mouseTouchUpHandler);
            var targetPercentage = 100 * self.getOffset(e);
            self.setSeeking(false);
            seeking = false;
            // Fire seeked event
            self.onSeekedEvent(targetPercentage);
        };
        // A seek always start with a touchstart or mousedown directly on the seekbar.
        // To track a mouse seek also outside the seekbar (for touch events this works automatically),
        // so the user does not need to take care that the mouse always stays on the seekbar, we attach the mousemove
        // and mouseup handlers to the whole document. A seek is triggered when the user lifts the mouse key.
        // A seek mouse gesture is thus basically a click with a long time frame between down and up events.
        seekBar.on("touchstart mousedown", function (e) {
            var isTouchEvent = self.touchSupported && e instanceof TouchEvent;
            // Prevent selection of DOM elements (also prevents mousedown if current event is touchstart)
            e.preventDefault();
            // Avoid propagation to VR handler
            e.stopPropagation();
            self.setSeeking(true); // Set seeking class on DOM element
            seeking = true; // Set seek tracking flag
            // Fire seeked event
            self.onSeekEvent();
            // Add handler to track the seek operation over the whole document
            new dom_1.DOM(document).on(isTouchEvent ? "touchmove" : "mousemove", mouseTouchMoveHandler);
            new dom_1.DOM(document).on(isTouchEvent ? "touchend" : "mouseup", mouseTouchUpHandler);
        });
        // Display seek target indicator when mouse hovers or finger slides over seekbar
        seekBar.on("touchmove mousemove", function (e) {
            e.preventDefault();
            if (seeking) {
                // During a seek (when mouse is down or touch move active), we need to stop propagation to avoid
                // the VR viewport reacting to the moves.
                e.stopPropagation();
                // Because the stopped propagation inhibits the event on the document, we need to call it from here
                mouseTouchMoveHandler(e);
            }
            var position = 100 * self.getOffset(e);
            self.setSeekPosition(position);
            self.onSeekPreviewEvent(position, false);
            if (self.hasLabel() && self.getLabel().isHidden()) {
                self.getLabel().show();
            }
        });
        // Hide seek target indicator when mouse or finger leaves seekbar
        seekBar.on("touchend mouseleave", function (e) {
            e.preventDefault();
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
     * Gets the horizontal offset of a mouse/touch event point from the left edge of the seek bar.
     * @param eventPageX the pageX coordinate of an event to calculate the offset from
     * @returns {number} a number in the range of [0, 1], where 0 is the left edge and 1 is the right edge
     */
    SeekBar.prototype.getHorizontalOffset = function (eventPageX) {
        var elementOffsetPx = this.seekBar.offset().left;
        var widthPx = this.seekBar.width();
        var offsetPx = eventPageX - elementOffsetPx;
        var offset = 1 / widthPx * offsetPx;
        return this.sanitizeOffset(offset);
    };
    /**
     * Gets the vertical offset of a mouse/touch event point from the bottom edge of the seek bar.
     * @param eventPageY the pageX coordinate of an event to calculate the offset from
     * @returns {number} a number in the range of [0, 1], where 0 is the bottom edge and 1 is the top edge
     */
    SeekBar.prototype.getVerticalOffset = function (eventPageY) {
        var elementOffsetPx = this.seekBar.offset().top;
        var widthPx = this.seekBar.height();
        var offsetPx = eventPageY - elementOffsetPx;
        var offset = 1 / widthPx * offsetPx;
        return 1 - this.sanitizeOffset(offset);
    };
    /**
     * Gets the mouse or touch event offset for the current configuration (horizontal or vertical).
     * @param e the event to calculate the offset from
     * @returns {number} a number in the range of [0, 1]
     * @see #getHorizontalOffset
     * @see #getVerticalOffset
     */
    SeekBar.prototype.getOffset = function (e) {
        if (this.touchSupported && e instanceof TouchEvent) {
            if (this.config.vertical) {
                return this.getVerticalOffset(e.type === "touchend" ? e.changedTouches[0].pageY : e.touches[0].pageY);
            }
            else {
                return this.getHorizontalOffset(e.type === "touchend" ? e.changedTouches[0].pageX : e.touches[0].pageX);
            }
        }
        else if (e instanceof MouseEvent) {
            if (this.config.vertical) {
                return this.getVerticalOffset(e.pageY);
            }
            else {
                return this.getHorizontalOffset(e.pageX);
            }
        }
        else {
            if (console)
                console.warn("invalid event");
            return 0;
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
            this.getDomElement().addClass(this.prefixCss(SeekBar.CLASS_SEEKING));
        }
        else {
            this.getDomElement().removeClass(this.prefixCss(SeekBar.CLASS_SEEKING));
        }
    };
    /**
     * Checks if the seek bar is currently in the seek state.
     * @returns {boolean} true if in seek state, else false
     */
    SeekBar.prototype.isSeeking = function () {
        return this.getDomElement().hasClass(this.prefixCss(SeekBar.CLASS_SEEKING));
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
},{"../dom":41,"../eventdispatcher":42,"../timeout":45,"./component":11}],25:[function(require,module,exports){
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
},{"../utils":47,"./component":11,"./container":12,"./label":18}],26:[function(require,module,exports){
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
},{"../dom":41,"./listselector":19}],27:[function(require,module,exports){
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
                component.getDomElement().removeClass(self.prefixCss(SettingsPanel.CLASS_LAST));
                if (component.isShown()) {
                    lastShownItem = component;
                }
            }
            if (lastShownItem) {
                lastShownItem.getDomElement().addClass(self.prefixCss(SettingsPanel.CLASS_LAST));
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
},{"../eventdispatcher":42,"../timeout":45,"./audioqualityselectbox":4,"./container":12,"./label":18,"./videoqualityselectbox":35}],28:[function(require,module,exports){
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
},{"./togglebutton":32}],29:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_AUDIO_CHANGED, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGED, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_SEEK, subtitleClearHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_TIME_SHIFT, subtitleClearHandler);
        uimanager.onComponentShow.subscribe(function (component) {
            if (component instanceof controlbar_1.ControlBar) {
                self.getDomElement().addClass(self.prefixCss(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE));
            }
        });
        uimanager.onComponentHide.subscribe(function (component) {
            if (component instanceof controlbar_1.ControlBar) {
                self.getDomElement().removeClass(self.prefixCss(SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE));
            }
        });
    };
    return SubtitleOverlay;
}(container_1.Container));
SubtitleOverlay.CLASS_CONTROLBAR_VISIBLE = "controlbar-visible";
exports.SubtitleOverlay = SubtitleOverlay;
},{"./container":12,"./controlbar":13,"./label":18}],30:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_SUBTITLE_CHANGED, function (event) {
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
},{"./selectbox":26}],31:[function(require,module,exports){
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
},{"../timeout":45,"./container":12,"./label":18}],32:[function(require,module,exports){
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
            this.getDomElement().removeClass(this.prefixCss(ToggleButton.CLASS_OFF));
            this.getDomElement().addClass(this.prefixCss(ToggleButton.CLASS_ON));
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
            this.getDomElement().removeClass(this.prefixCss(ToggleButton.CLASS_ON));
            this.getDomElement().addClass(this.prefixCss(ToggleButton.CLASS_OFF));
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
},{"../eventdispatcher":42,"./button":7}],33:[function(require,module,exports){
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
        _this.canvasWidth = 160;
        _this.canvasHeight = 90;
        _this.interferenceHeight = 50;
        _this.lastFrameUpdate = 0;
        _this.frameInterval = 60;
        _this.useAnimationFrame = !!window.requestAnimationFrame;
        _this.config = _this.mergeConfig(config, {
            cssClass: "ui-tvnoisecanvas"
        }, _this.config);
        return _this;
    }
    TvNoiseCanvas.prototype.toDomElement = function () {
        return this.canvas = new dom_1.DOM("canvas", { "class": this.getCssClasses() });
    };
    TvNoiseCanvas.prototype.start = function () {
        this.canvasElement = this.canvas.getElements()[0];
        this.canvasContext = this.canvasElement.getContext("2d");
        this.noiseAnimationWindowPos = -this.canvasHeight;
        this.lastFrameUpdate = 0;
        this.canvasElement.width = this.canvasWidth;
        this.canvasElement.height = this.canvasHeight;
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
},{"../dom":41,"./component":11}],34:[function(require,module,exports){
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
        // Player states
        var removeStates = function () {
            self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_IDLE));
            self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_PLAYING));
            self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_PAUSED));
            self.getDomElement().removeClass(self.prefixCss(UIContainer.STATE_FINISHED));
        };
        player.addEventHandler(bitmovin.player.EVENT.ON_READY, function () {
            removeStates();
            self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_IDLE));
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAY, function () {
            removeStates();
            self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_PLAYING));
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_PAUSED, function () {
            removeStates();
            self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_PAUSED));
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_PLAYBACK_FINISHED, function () {
            removeStates();
            self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_FINISHED));
        });
        // Init in idle state
        self.getDomElement().addClass(self.prefixCss(UIContainer.STATE_IDLE));
        // Fullscreen marker class
        player.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_ENTER, function () {
            self.getDomElement().addClass(self.prefixCss(UIContainer.FULLSCREEN));
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_FULLSCREEN_EXIT, function () {
            self.getDomElement().removeClass(self.prefixCss(UIContainer.FULLSCREEN));
        });
        // Buffering marker class
        player.addEventHandler(bitmovin.player.EVENT.ON_STALL_STARTED, function () {
            self.getDomElement().addClass(self.prefixCss(UIContainer.BUFFERING));
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_STALL_ENDED, function () {
            self.getDomElement().removeClass(self.prefixCss(UIContainer.BUFFERING));
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
            container.addClass(self.prefixCss("flexbox"));
        }
        else {
            container.addClass(self.prefixCss("no-flexbox"));
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
UIContainer.STATE_IDLE = "player-state-idle";
UIContainer.STATE_PLAYING = "player-state-playing";
UIContainer.STATE_PAUSED = "player-state-paused";
UIContainer.STATE_FINISHED = "player-state-finished";
UIContainer.FULLSCREEN = "fullscreen";
UIContainer.BUFFERING = "buffering";
exports.UIContainer = UIContainer;
},{"../eventdispatcher":42,"./container":12}],35:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_VIDEO_DOWNLOAD_QUALITY_CHANGED, function () {
            var data = player.getDownloadedVideoData();
            self.selectItem(data.isAuto ? "auto" : data.id);
        }); // Update quality selection when quality is changed (from outside)
        // Populate qualities at startup
        updateVideoQualities();
    };
    return VideoQualitySelectBox;
}(selectbox_1.SelectBox));
exports.VideoQualitySelectBox = VideoQualitySelectBox;
},{"./selectbox":26}],36:[function(require,module,exports){
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
},{"../timeout":45,"./container":12,"./volumeslider":37,"./volumetogglebutton":38}],37:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGED, volumeChangeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_MUTED, volumeChangeHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTED, volumeChangeHandler);
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
},{"./seekbar":24}],38:[function(require,module,exports){
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
        player.addEventHandler(bitmovin.player.EVENT.ON_MUTED, muteStateHandler);
        player.addEventHandler(bitmovin.player.EVENT.ON_UNMUTED, muteStateHandler);
        self.onClick.subscribe(function () {
            if (player.isMuted()) {
                player.unmute();
            }
            else {
                player.mute();
            }
        });
        player.addEventHandler(bitmovin.player.EVENT.ON_VOLUME_CHANGED, function (event) {
            // Toggle low class to display low volume icon below 50% volume
            if (event.targetVolume < 50) {
                self.getDomElement().addClass(self.prefixCss("low"));
            }
            else {
                self.getDomElement().removeClass(self.prefixCss("low"));
            }
        });
        // Startup init
        muteStateHandler();
    };
    return VolumeToggleButton;
}(togglebutton_1.ToggleButton));
exports.VolumeToggleButton = VolumeToggleButton;
},{"./togglebutton":32}],39:[function(require,module,exports){
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
},{"./togglebutton":32}],40:[function(require,module,exports){
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
},{"./clickoverlay":10}],41:[function(require,module,exports){
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
        var elementRect = element.getBoundingClientRect();
        var htmlRect = document.body.parentElement.getBoundingClientRect();
        // Virtual viewport scroll handling (e.g. pinch zoomed viewports in mobile browsers or desktop Chrome/Edge)
        // "normal" zooms and virtual viewport zooms (aka layout viewport) result in different
        // element.getBoundingClientRect() results:
        //  - with normal scrolls, the clientRect decreases with an increase in scroll(Top|Left)/page(X|Y)Offset
        //  - with pinch zoom scrolls, the clientRect stays the same while scroll/pageOffset changes
        // This means, that the combination of clientRect + scroll/pageOffset does not work to calculate the offset
        // from the document's upper left origin when pinch zoom is used.
        // To work around this issue, we do not use scroll/pageOffset but get the clientRect of the html element and
        // subtract it from the element's rect, which always results in the offset from the document origin.
        // NOTE: the current way of offset calculation was implemented specifically to track event positions on the
        // seek bar, and it might break compatibility with jQuery's offset() method. If this ever turns out to be a
        // problem, this method should be reverted to the old version and the offset calculation moved to the seek bar.
        return {
            top: elementRect.top - htmlRect.top,
            left: elementRect.left - htmlRect.left
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
        var hasClass = false;
        this.forEach(function (element) {
            if (element.classList) {
                if (element.classList.contains(className)) {
                    // Since we are inside a handler, we can't just "return true". Instead, we save it to a variable
                    // and return it at the end of the function body.
                    hasClass = true;
                }
            }
            else {
                if (new RegExp("(^| )" + className + "( |$)", "gi").test(element.className)) {
                    // See comment above
                    hasClass = true;
                }
            }
        });
        return hasClass;
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
},{"./utils":47}],43:[function(require,module,exports){
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
var hugereplaybutton_1 = require("./components/hugereplaybutton");
var bufferingoverlay_1 = require("./components/bufferingoverlay");
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
window.bitmovin.playerui = {
    // Management
    UIManager: uimanager_1.UIManager,
    // Components
    AdClickOverlay: adclickoverlay_1.AdClickOverlay,
    AdMessageLabel: admessagelabel_1.AdMessageLabel,
    AdSkipButton: adskipbutton_1.AdSkipButton,
    AudioQualitySelectBox: audioqualityselectbox_1.AudioQualitySelectBox,
    AudioTrackSelectBox: audiotrackselectbox_1.AudioTrackSelectBox,
    Button: button_1.Button,
    CastStatusOverlay: caststatusoverlay_1.CastStatusOverlay,
    CastToggleButton: casttogglebutton_1.CastToggleButton,
    ClickOverlay: clickoverlay_1.ClickOverlay,
    Component: component_1.Component,
    Container: container_1.Container,
    ControlBar: controlbar_1.ControlBar,
    ErrorMessageOverlay: errormessageoverlay_1.ErrorMessageOverlay,
    FullscreenToggleButton: fullscreentogglebutton_1.FullscreenToggleButton,
    HugePlaybackToggleButton: hugeplaybacktogglebutton_1.HugePlaybackToggleButton,
    Label: label_1.Label,
    PlaybackTimeLabel: playbacktimelabel_1.PlaybackTimeLabel,
    PlaybackToggleButton: playbacktogglebutton_1.PlaybackToggleButton,
    RecommendationOverlay: recommendationoverlay_1.RecommendationOverlay,
    SeekBar: seekbar_1.SeekBar,
    SeekBarLabel: seekbarlabel_1.SeekBarLabel,
    SelectBox: selectbox_1.SelectBox,
    SettingsPanel: settingspanel_1.SettingsPanel,
    SettingsToggleButton: settingstogglebutton_1.SettingsToggleButton,
    SubtitleOverlay: subtitleoverlay_1.SubtitleOverlay,
    SubtitleSelectBox: subtitleselectbox_1.SubtitleSelectBox,
    TitleBar: titlebar_1.TitleBar,
    ToggleButton: togglebutton_1.ToggleButton,
    UIContainer: uicontainer_1.UIContainer,
    VideoQualitySelectBox: videoqualityselectbox_1.VideoQualitySelectBox,
    VolumeControlButton: volumecontrolbutton_1.VolumeControlButton,
    VolumeToggleButton: volumetogglebutton_1.VolumeToggleButton,
    VRToggleButton: vrtogglebutton_1.VRToggleButton,
    Watermark: watermark_1.Watermark,
    PlaybackSpeedSelectBox: playbackspeedselectbox_1.PlaybackSpeedSelectBox,
    HugeReplayButton: hugereplaybutton_1.HugeReplayButton,
    BufferingOverlay: bufferingoverlay_1.BufferingOverlay
};
},{"./components/adclickoverlay":1,"./components/admessagelabel":2,"./components/adskipbutton":3,"./components/audioqualityselectbox":4,"./components/audiotrackselectbox":5,"./components/bufferingoverlay":6,"./components/button":7,"./components/caststatusoverlay":8,"./components/casttogglebutton":9,"./components/clickoverlay":10,"./components/component":11,"./components/container":12,"./components/controlbar":13,"./components/errormessageoverlay":14,"./components/fullscreentogglebutton":15,"./components/hugeplaybacktogglebutton":16,"./components/hugereplaybutton":17,"./components/label":18,"./components/playbackspeedselectbox":20,"./components/playbacktimelabel":21,"./components/playbacktogglebutton":22,"./components/recommendationoverlay":23,"./components/seekbar":24,"./components/seekbarlabel":25,"./components/selectbox":26,"./components/settingspanel":27,"./components/settingstogglebutton":28,"./components/subtitleoverlay":29,"./components/subtitleselectbox":30,"./components/titlebar":31,"./components/togglebutton":32,"./components/uicontainer":34,"./components/videoqualityselectbox":35,"./components/volumecontrolbutton":36,"./components/volumetogglebutton":38,"./components/vrtogglebutton":39,"./components/watermark":40,"./uimanager":46}],45:[function(require,module,exports){
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
/**
 * Executes a callback after a specified amount of time, optionally repeatedly until stopped.
 */
var Timeout = (function () {
    /**
     * Creates a new timeout callback handler.
     * @param delay the delay in milliseconds after which the callback should be executed
     * @param callback the callback to execute after the delay time
     * @param repeat if true, call the callback repeatedly in delay intervals
     */
    function Timeout(delay, callback, repeat) {
        if (repeat === void 0) { repeat = false; }
        this.delay = delay;
        this.callback = callback;
        this.repeat = repeat;
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
        var self = this;
        var lastScheduleTime = 0;
        var delayAdjust = 0;
        this.clear();
        var internalCallback = function () {
            self.callback();
            if (self.repeat) {
                var now = Date.now();
                // The time of one iteration from scheduling to executing the callback (usually a bit longer than the delay time)
                var delta = now - lastScheduleTime;
                // Calculate the delay adjustment for the next schedule to keep a steady delay interval over time
                delayAdjust = self.delay - delta + delayAdjust;
                lastScheduleTime = now;
                // Schedule next execution by the adjusted delay
                self.timeoutHandle = setTimeout(internalCallback, self.delay + delayAdjust);
            }
        };
        lastScheduleTime = Date.now();
        this.timeoutHandle = setTimeout(internalCallback, this.delay);
    };
    return Timeout;
}());
exports.Timeout = Timeout;
},{}],46:[function(require,module,exports){
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
var bufferingoverlay_1 = require("./components/bufferingoverlay");
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
        if (!config.metadata) {
            config.metadata = {
                title: player.getConfig().source ? player.getConfig().source.title : null
            };
        }
        this.managerPlayerWrapper = new PlayerWrapper(player);
        this.playerElement = new dom_1.DOM(player.getFigure());
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
            this.managerPlayerWrapper.getPlayer().addEventHandler(EVENT.ON_AD_ERROR, exitAdsUi);
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
                        new playbacktimelabel_1.PlaybackTimeLabel({ timeLabelMode: playbacktimelabel_1.TimeLabelMode.CurrentTime, hideInLivePlayback: true }),
                        new seekbar_1.SeekBar({ label: new seekbarlabel_1.SeekBarLabel() }),
                        new playbacktimelabel_1.PlaybackTimeLabel({ timeLabelMode: playbacktimelabel_1.TimeLabelMode.TotalTime, cssClasses: ["text-right"] }),
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
                new bufferingoverlay_1.BufferingOverlay(),
                new hugeplaybacktogglebutton_1.HugePlaybackToggleButton(),
                controlBar,
                new titlebar_1.TitleBar(),
                new recommendationoverlay_1.RecommendationOverlay(),
                new watermark_1.Watermark(),
                new errormessageoverlay_1.ErrorMessageOverlay()
            ], cssClasses: ["ui-skin-modern"]
        });
        var adsUi = new uicontainer_1.UIContainer({
            components: [
                new bufferingoverlay_1.BufferingOverlay(),
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
    class_1.buildModernCastReceiverUI = function (player, config) {
        if (config === void 0) { config = {}; }
        var controlBar = new controlbar_1.ControlBar({
            components: [
                new container_1.Container({
                    components: [
                        new playbacktimelabel_1.PlaybackTimeLabel({ timeLabelMode: playbacktimelabel_1.TimeLabelMode.CurrentTime, hideInLivePlayback: true }),
                        new seekbar_1.SeekBar({ label: new seekbarlabel_1.SeekBarLabel() }),
                        new playbacktimelabel_1.PlaybackTimeLabel({ timeLabelMode: playbacktimelabel_1.TimeLabelMode.TotalTime, cssClasses: ["text-right"] }),
                    ],
                    cssClasses: ["controlbar-top"]
                }),
            ]
        });
        var ui = new uicontainer_1.UIContainer({
            components: [
                new subtitleoverlay_1.SubtitleOverlay(),
                new bufferingoverlay_1.BufferingOverlay(),
                new hugeplaybacktogglebutton_1.HugePlaybackToggleButton(),
                new watermark_1.Watermark(),
                controlBar,
                new titlebar_1.TitleBar(),
                new errormessageoverlay_1.ErrorMessageOverlay()
            ], cssClasses: ["ui-skin-modern ui-skin-modern-cast-receiver"]
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
},{"./components/adclickoverlay":1,"./components/admessagelabel":2,"./components/adskipbutton":3,"./components/audioqualityselectbox":4,"./components/audiotrackselectbox":5,"./components/bufferingoverlay":6,"./components/caststatusoverlay":8,"./components/casttogglebutton":9,"./components/component":11,"./components/container":12,"./components/controlbar":13,"./components/errormessageoverlay":14,"./components/fullscreentogglebutton":15,"./components/hugeplaybacktogglebutton":16,"./components/playbackspeedselectbox":20,"./components/playbacktimelabel":21,"./components/playbacktogglebutton":22,"./components/recommendationoverlay":23,"./components/seekbar":24,"./components/seekbarlabel":25,"./components/settingspanel":27,"./components/settingstogglebutton":28,"./components/subtitleoverlay":29,"./components/subtitleselectbox":30,"./components/titlebar":31,"./components/uicontainer":34,"./components/videoqualityselectbox":35,"./components/volumecontrolbutton":36,"./components/volumeslider":37,"./components/volumetogglebutton":38,"./components/vrtogglebutton":39,"./components/watermark":40,"./dom":41,"./eventdispatcher":42,"./utils":47}],47:[function(require,module,exports){
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
    /**
     * Fills out placeholders in an ad message.
     *
     * Has the placeholders '{remainingTime[formatString]}', '{playedTime[formatString]}' and '{adDuration[formatString]}',
     * which are replaced by the remaining time until the ad can be skipped, the current time or the ad duration.
     * The format string is optional. If not specified, the placeholder is replaced by the time in seconds.
     * If specified, it must be of the following format:
     * - %d - Inserts the time as an integer.
     * - %0Nd - Inserts the time as an integer with leading zeroes, if the length of the time string is smaller than N.
     * - %f - Inserts the time as a float.
     * - %0Nf - Inserts the time as a float with leading zeroes.
     * - %.Mf - Inserts the time as a float with M decimal places. Can be combined with %0Nf, e.g. %04.2f (the time 10.123
     * would be printed as 0010.12).
     * - %hh:mm:ss
     * - %mm:ss
     *
     * @param adMessage an ad message with optional placeholders to fill
     * @param skipOffset if specified, {remainingTime} will be filled with the remaining time until the ad can be skipped
     * @param player the player to get the time data from
     * @returns {string} the ad message with filled placeholders
     */
    function replaceAdMessagePlaceholders(adMessage, skipOffset, player) {
        var adMessagePlaceholderRegex = new RegExp("\\{(remainingTime|playedTime|adDuration)(}|%((0[1-9]\\d*(\\.\\d+(d|f)|d|f)|\\.\\d+f|d|f)|hh:mm:ss|mm:ss)})", "g");
        return adMessage.replace(adMessagePlaceholderRegex, function (formatString) {
            var time = 0;
            if (formatString.indexOf("remainingTime") > -1) {
                if (skipOffset) {
                    time = Math.ceil(skipOffset - player.getCurrentTime());
                }
                else {
                    time = player.getDuration() - player.getCurrentTime();
                }
            }
            else if (formatString.indexOf("playedTime") > -1) {
                time = player.getCurrentTime();
            }
            else if (formatString.indexOf("adDuration") > -1) {
                time = player.getDuration();
            }
            return formatNumber(time, formatString);
        });
    }
    StringUtils.replaceAdMessagePlaceholders = replaceAdMessagePlaceholders;
    function formatNumber(time, format) {
        var formatStringValidationRegex = /%((0[1-9]\d*(\.\d+(d|f)|d|f)|\.\d+f|d|f)|hh:mm:ss|mm:ss)/;
        var leadingZeroesRegex = /(%0[1-9]\d*)(?=(\.\d+f|f|d))/;
        var decimalPlacesRegex = /\.\d*(?=f)/;
        if (!formatStringValidationRegex.test(format)) {
            // If the format is invalid, we set a default fallback format
            format = "%d";
        }
        // Determine the number of leading zeros
        var leadingZeroes = 0;
        var leadingZeroesMatches = format.match(leadingZeroesRegex);
        if (leadingZeroesMatches) {
            leadingZeroes = parseInt(leadingZeroesMatches[0].substring(2));
        }
        // Determine the number of decimal places
        var numDecimalPlaces = null;
        var decimalPlacesMatches = format.match(decimalPlacesRegex);
        if (decimalPlacesMatches && !isNaN(parseInt(decimalPlacesMatches[0].substring(1)))) {
            numDecimalPlaces = parseInt(decimalPlacesMatches[0].substring(1));
            if (numDecimalPlaces > 20) {
                numDecimalPlaces = 20;
            }
        }
        // Float format
        if (format.indexOf("f") > -1) {
            var timeString = "";
            if (numDecimalPlaces !== null) {
                // Apply fixed number of decimal places
                timeString = time.toFixed(numDecimalPlaces);
            }
            else {
                timeString = "" + time;
            }
            // Apply leading zeros
            if (timeString.indexOf(".") > -1) {
                return leftPadWithZeros(timeString, timeString.length + (leadingZeroes - timeString.indexOf(".")));
            }
            else {
                return leftPadWithZeros(timeString, leadingZeroes);
            }
        }
        else if (format.indexOf(":") > -1) {
            var totalSeconds = Math.ceil(time);
            // hh:mm:ss format
            if (format.indexOf("hh") > -1) {
                return secondsToTime(totalSeconds);
            }
            else {
                var minutes = Math.floor(totalSeconds / 60);
                var seconds = totalSeconds % 60;
                return leftPadWithZeros(minutes, 2) + ":" + leftPadWithZeros(seconds, 2);
            }
        }
        else {
            return leftPadWithZeros(Math.ceil(time), leadingZeroes);
        }
    }
})(StringUtils = exports.StringUtils || (exports.StringUtils = {}));
},{}]},{},[44])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvY29tcG9uZW50cy9hZGNsaWNrb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL2FkbWVzc2FnZWxhYmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYWRza2lwYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYXVkaW9xdWFsaXR5c2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvYXVkaW90cmFja3NlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL2J1ZmZlcmluZ292ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9idXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy9jYXN0c3RhdHVzb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL2Nhc3R0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy9jbGlja292ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9jb21wb25lbnQudHMiLCJzcmMvdHMvY29tcG9uZW50cy9jb250YWluZXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy9jb250cm9sYmFyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvZXJyb3JtZXNzYWdlb3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL2Z1bGxzY3JlZW50b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy9odWdlcGxheWJhY2t0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy9odWdlcmVwbGF5YnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvbGFiZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9saXN0c2VsZWN0b3IudHMiLCJzcmMvdHMvY29tcG9uZW50cy9wbGF5YmFja3NwZWVkc2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvcGxheWJhY2t0aW1lbGFiZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9wbGF5YmFja3RvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3JlY29tbWVuZGF0aW9ub3ZlcmxheS50cyIsInNyYy90cy9jb21wb25lbnRzL3NlZWtiYXIudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZWVrYmFybGFiZWwudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZWxlY3Rib3gudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zZXR0aW5nc3BhbmVsLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvc2V0dGluZ3N0b2dnbGVidXR0b24udHMiLCJzcmMvdHMvY29tcG9uZW50cy9zdWJ0aXRsZW92ZXJsYXkudHMiLCJzcmMvdHMvY29tcG9uZW50cy9zdWJ0aXRsZXNlbGVjdGJveC50cyIsInNyYy90cy9jb21wb25lbnRzL3RpdGxlYmFyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdHZub2lzZWNhbnZhcy50cyIsInNyYy90cy9jb21wb25lbnRzL3VpY29udGFpbmVyLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdmlkZW9xdWFsaXR5c2VsZWN0Ym94LnRzIiwic3JjL3RzL2NvbXBvbmVudHMvdm9sdW1lY29udHJvbGJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3ZvbHVtZXNsaWRlci50cyIsInNyYy90cy9jb21wb25lbnRzL3ZvbHVtZXRvZ2dsZWJ1dHRvbi50cyIsInNyYy90cy9jb21wb25lbnRzL3ZydG9nZ2xlYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudHMvd2F0ZXJtYXJrLnRzIiwic3JjL3RzL2RvbS50cyIsInNyYy90cy9ldmVudGRpc3BhdGNoZXIudHMiLCJzcmMvdHMvZ3VpZC50cyIsInNyYy90cy9tYWluLnRzIiwic3JjL3RzL3RpbWVvdXQudHMiLCJzcmMvdHMvdWltYW5hZ2VyLnRzIiwic3JjL3RzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7Ozs7R0FPRzs7Ozs7OztBQUVI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Q0FBQyxHQUFHLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0UsQ0FBQztRQUNMLENBQUM7UUFFRCxJQUFJLENBQUMsQ0FBQztZQUNGLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzVELENBQUM7SUFDTCxDQUFDO0FBQ0wsQ0FBQyxFQXRKZ0IsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFzSjNCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDbGlja092ZXJsYXl9IGZyb20gXCIuL2NsaWNrb3ZlcmxheVwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5cclxuLyoqXHJcbiAqIEEgc2ltcGxlIGNsaWNrIGNhcHR1cmUgb3ZlcmxheSBmb3IgY2xpY2tUaHJvdWdoVXJscyBvZiBhZHMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQWRDbGlja092ZXJsYXkgZXh0ZW5kcyBDbGlja092ZXJsYXkge1xyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjbGlja1Rocm91Z2hVcmwgPSA8c3RyaW5nPm51bGw7XHJcbiAgICAgICAgbGV0IGNsaWNrVGhyb3VnaEVuYWJsZWQgPSAhcGxheWVyLmdldENvbmZpZygpLmFkdmVydGlzaW5nXHJcbiAgICAgICAgICAgIHx8ICFwbGF5ZXIuZ2V0Q29uZmlnKCkuYWR2ZXJ0aXNpbmcuaGFzT3duUHJvcGVydHkoXCJjbGlja1Rocm91Z2hFbmFibGVkXCIpXHJcbiAgICAgICAgICAgIHx8IHBsYXllci5nZXRDb25maWcoKS5hZHZlcnRpc2luZy5jbGlja1Rocm91Z2hFbmFibGVkO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9TVEFSVEVELCBmdW5jdGlvbiAoZXZlbnQ6IGJpdG1vdmluLnBsYXllci5BZFN0YXJ0ZWRFdmVudCkge1xyXG4gICAgICAgICAgICBjbGlja1Rocm91Z2hVcmwgPSBldmVudC5jbGlja1Rocm91Z2hVcmw7XHJcblxyXG4gICAgICAgICAgICBpZiAoY2xpY2tUaHJvdWdoRW5hYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRVcmwoY2xpY2tUaHJvdWdoVXJsKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIElmIGNsaWNrLXRocm91Z2ggaXMgZGlzYWJsZWQsIHdlIHNldCB0aGUgdXJsIHRvIG51bGwgdG8gYXZvaWQgaXQgb3BlblxyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRVcmwobnVsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQ2xlYXIgY2xpY2stdGhyb3VnaCBVUkwgd2hlbiBhZCBoYXMgZmluaXNoZWRcclxuICAgICAgICBsZXQgYWRGaW5pc2hlZEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0VXJsKG51bGwpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfRklOSVNIRUQsIGFkRmluaXNoZWRIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9TS0lQUEVELCBhZEZpbmlzaGVkSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBQYXVzZSB0aGUgYWQgd2hlbiBjbGljay10aHJvdWdoIFVSTCBvcGVuc1xyXG4gICAgICAgICAgICBpZiAoY2xpY2tUaHJvdWdoRW5hYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vdGlmeSB0aGUgcGxheWVyIG9mIHRoZSBjbGlja2VkIGFkXHJcbiAgICAgICAgICAgIHBsYXllci5maXJlRXZlbnQoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX0NMSUNLRUQsIHtcclxuICAgICAgICAgICAgICAgIGNsaWNrVGhyb3VnaFVybDogY2xpY2tUaHJvdWdoVXJsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0xhYmVsLCBMYWJlbENvbmZpZ30gZnJvbSBcIi4vbGFiZWxcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG4vKipcclxuICogQSBsYWJlbCB0aGF0IGRpc3BsYXlzIGEgbWVzc2FnZSBhYm91dCBhIHJ1bm5pbmcgYWQsIG9wdGlvbmFsbHkgd2l0aCBhIGNvdW50ZG93bi5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBZE1lc3NhZ2VMYWJlbCBleHRlbmRzIExhYmVsPExhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMYWJlbENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1sYWJlbC1hZC1tZXNzYWdlXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiVGhpcyBhZCB3aWxsIGVuZCBpbiB7cmVtYWluaW5nVGltZX0gc2Vjb25kcy5cIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgdGV4dCA9IHRoaXMuZ2V0Q29uZmlnKCkudGV4dDtcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZU1lc3NhZ2VIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNldFRleHQoU3RyaW5nVXRpbHMucmVwbGFjZUFkTWVzc2FnZVBsYWNlaG9sZGVycyh0ZXh0LCBudWxsLCBwbGF5ZXIpKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYWRTdGFydEhhbmRsZXIgPSBmdW5jdGlvbiAoZXZlbnQ6IGJpdG1vdmluLnBsYXllci5BZFN0YXJ0ZWRFdmVudCkge1xyXG4gICAgICAgICAgICB0ZXh0ID0gZXZlbnQuYWRNZXNzYWdlIHx8IHRleHQ7XHJcbiAgICAgICAgICAgIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURUQsIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYWRFbmRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICAgICAgcGxheWVyLnJlbW92ZUV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURUQsIHVwZGF0ZU1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9TVEFSVEVELCBhZFN0YXJ0SGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQURfU0tJUFBFRCwgYWRFbmRIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9GSU5JU0hFRCwgYWRFbmRIYW5kbGVyKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCdXR0b25Db25maWcsIEJ1dHRvbn0gZnJvbSBcIi4vYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBTa2lwTWVzc2FnZSA9IGJpdG1vdmluLnBsYXllci5Ta2lwTWVzc2FnZTtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgQWRTa2lwQnV0dG9ufS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQWRTa2lwQnV0dG9uQ29uZmlnIGV4dGVuZHMgQnV0dG9uQ29uZmlnIHtcclxuICAgIHNraXBNZXNzYWdlPzogU2tpcE1lc3NhZ2U7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IGlzIGRpc3BsYXllZCBkdXJpbmcgYWRzIGFuZCBjYW4gYmUgdXNlZCB0byBza2lwIHRoZSBhZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBZFNraXBCdXR0b24gZXh0ZW5kcyBCdXR0b248QWRTa2lwQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBBZFNraXBCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIDxBZFNraXBCdXR0b25Db25maWc+e1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1idXR0b24tYWQtc2tpcFwiLFxyXG4gICAgICAgICAgICBza2lwTWVzc2FnZToge1xyXG4gICAgICAgICAgICAgICAgY291bnRkb3duOiBcIlNraXAgYWQgaW4ge3JlbWFpbmluZ1RpbWV9XCIsXHJcbiAgICAgICAgICAgICAgICBza2lwOiBcIlNraXAgYWRcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjb25maWcgPSA8QWRTa2lwQnV0dG9uQ29uZmlnPnRoaXMuZ2V0Q29uZmlnKCk7IC8vIFRPRE8gZ2V0IHJpZCBvZiBnZW5lcmljIGNhc3RcclxuICAgICAgICBsZXQgc2tpcE1lc3NhZ2UgPSBjb25maWcuc2tpcE1lc3NhZ2U7XHJcbiAgICAgICAgbGV0IGFkRXZlbnQgPSA8Yml0bW92aW4ucGxheWVyLkFkU3RhcnRlZEV2ZW50Pm51bGw7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVTa2lwTWVzc2FnZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIERpc3BsYXkgdGhpcyBidXR0b24gb25seSBpZiBhZCBpcyBza2lwcGFibGVcclxuICAgICAgICAgICAgaWYgKGFkRXZlbnQuc2tpcE9mZnNldCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBza2lwIG1lc3NhZ2Ugb24gdGhlIGJ1dHRvblxyXG4gICAgICAgICAgICBpZiAocGxheWVyLmdldEN1cnJlbnRUaW1lKCkgPCBhZEV2ZW50LnNraXBPZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGV4dChTdHJpbmdVdGlscy5yZXBsYWNlQWRNZXNzYWdlUGxhY2Vob2xkZXJzKGNvbmZpZy5za2lwTWVzc2FnZS5jb3VudGRvd24sIGFkRXZlbnQuc2tpcE9mZnNldCwgcGxheWVyKSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRleHQoY29uZmlnLnNraXBNZXNzYWdlLnNraXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGFkU3RhcnRIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50OiBiaXRtb3Zpbi5wbGF5ZXIuQWRTdGFydGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgYWRFdmVudCA9IGV2ZW50O1xyXG4gICAgICAgICAgICBza2lwTWVzc2FnZSA9IGFkRXZlbnQuc2tpcE1lc3NhZ2UgfHwgc2tpcE1lc3NhZ2U7XHJcbiAgICAgICAgICAgIHVwZGF0ZVNraXBNZXNzYWdlSGFuZGxlcigpO1xyXG5cclxuICAgICAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9DSEFOR0VELCB1cGRhdGVTa2lwTWVzc2FnZUhhbmRsZXIpO1xyXG4gICAgICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1RJTUVfVVBEQVRFRCwgdXBkYXRlU2tpcE1lc3NhZ2VIYW5kbGVyKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgYWRFbmRIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX0NIQU5HRUQsIHVwZGF0ZVNraXBNZXNzYWdlSGFuZGxlcik7XHJcbiAgICAgICAgICAgIHBsYXllci5yZW1vdmVFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfVElNRV9VUERBVEVELCB1cGRhdGVTa2lwTWVzc2FnZUhhbmRsZXIpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX1NUQVJURUQsIGFkU3RhcnRIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BRF9TS0lQUEVELCBhZEVuZEhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FEX0ZJTklTSEVELCBhZEVuZEhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVHJ5IHRvIHNraXAgdGhlIGFkICh0aGlzIG9ubHkgd29ya3MgaWYgaXQgaXMgc2tpcHBhYmxlIHNvIHdlIGRvbid0IG5lZWQgdG8gdGFrZSBleHRyYSBjYXJlIG9mIHRoYXQgaGVyZSlcclxuICAgICAgICAgICAgcGxheWVyLnNraXBBZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gXCJhdXRvXCIgYW5kIHRoZSBhdmFpbGFibGUgYXVkaW8gcXVhbGl0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEF1ZGlvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVBdWRpb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGF1ZGlvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZUF1ZGlvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGF1ZGlvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdWRpb1F1YWxpdHkgb2YgYXVkaW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbShhdWRpb1F1YWxpdHkuaWQsIGF1ZGlvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBBdWRpb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldEF1ZGlvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0FVRElPX0NIQU5HRUQsIHVwZGF0ZUF1ZGlvUXVhbGl0aWVzKTsgLy8gVXBkYXRlIHF1YWxpdGllcyB3aGVuIGF1ZGlvIHRyYWNrIGhhcyBjaGFuZ2VkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU09VUkNFX1VOTE9BREVELCB1cGRhdGVBdWRpb1F1YWxpdGllcyk7IC8vIFVwZGF0ZSBxdWFsaXRpZXMgd2hlbiBzb3VyY2UgZ29lcyBhd2F5XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUkVBRFksIHVwZGF0ZUF1ZGlvUXVhbGl0aWVzKTsgLy8gVXBkYXRlIHF1YWxpdGllcyB3aGVuIGEgbmV3IHNvdXJjZSBpcyBsb2FkZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9BVURJT19ET1dOTE9BRF9RVUFMSVRZX0NIQU5HRUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBwbGF5ZXIuZ2V0RG93bmxvYWRlZEF1ZGlvRGF0YSgpO1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oZGF0YS5pc0F1dG8gPyBcImF1dG9cIiA6IGRhdGEuaWQpO1xyXG4gICAgICAgIH0pOyAvLyBVcGRhdGUgcXVhbGl0eSBzZWxlY3Rpb24gd2hlbiBxdWFsaXR5IGlzIGNoYW5nZWQgKGZyb20gb3V0c2lkZSlcclxuXHJcbiAgICAgICAgLy8gUG9wdWxhdGUgcXVhbGl0aWVzIGF0IHN0YXJ0dXBcclxuICAgICAgICB1cGRhdGVBdWRpb1F1YWxpdGllcygpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gYXZhaWxhYmxlIGF1ZGlvIHRyYWNrcyAoZS5nLiBkaWZmZXJlbnQgbGFuZ3VhZ2VzKS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBBdWRpb1RyYWNrU2VsZWN0Qm94IGV4dGVuZHMgU2VsZWN0Qm94IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZUF1ZGlvVHJhY2tzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgYXVkaW9UcmFja3MgPSBwbGF5ZXIuZ2V0QXZhaWxhYmxlQXVkaW8oKTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuY2xlYXJJdGVtcygpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIGF1ZGlvIHRyYWNrc1xyXG4gICAgICAgICAgICBmb3IgKGxldCBhdWRpb1RyYWNrIG9mIGF1ZGlvVHJhY2tzKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmFkZEl0ZW0oYXVkaW9UcmFjay5pZCwgYXVkaW9UcmFjay5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBBdWRpb1RyYWNrU2VsZWN0Qm94LCB2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5zZXRBdWRpbyh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBhdWRpb1RyYWNrSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnRBdWRpb1RyYWNrID0gcGxheWVyLmdldEF1ZGlvKCk7XHJcbiAgICAgICAgICAgIHNlbGYuc2VsZWN0SXRlbShjdXJyZW50QXVkaW9UcmFjay5pZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQVVESU9fQ0hBTkdFRCwgYXVkaW9UcmFja0hhbmRsZXIpOyAvLyBVcGRhdGUgc2VsZWN0aW9uIHdoZW4gc2VsZWN0ZWQgdHJhY2sgaGFzIGNoYW5nZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZUF1ZGlvVHJhY2tzKTsgLy8gVXBkYXRlIHRyYWNrcyB3aGVuIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdXBkYXRlQXVkaW9UcmFja3MpOyAvLyBVcGRhdGUgdHJhY2tzIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZFxyXG5cclxuICAgICAgICAvLyBQb3B1bGF0ZSB0cmFja3MgYXQgc3RhcnR1cFxyXG4gICAgICAgIHVwZGF0ZUF1ZGlvVHJhY2tzKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyQ29uZmlnLCBDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIGFuZCBkaXNwbGF5cyBhIGJ1ZmZlcmluZyBpbmRpY2F0b3IuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQnVmZmVyaW5nT3ZlcmxheSBleHRlbmRzIENvbnRhaW5lcjxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGluZGljYXRvcnM6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+W107XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5kaWNhdG9ycyA9IFtcclxuICAgICAgICAgICAgbmV3IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+KHsgdGFnOiBcImRpdlwiLCBjc3NDbGFzczogXCJ1aS1idWZmZXJpbmctb3ZlcmxheS1pbmRpY2F0b3JcIn0pLFxyXG4gICAgICAgICAgICBuZXcgQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4oeyB0YWc6IFwiZGl2XCIsIGNzc0NsYXNzOiBcInVpLWJ1ZmZlcmluZy1vdmVybGF5LWluZGljYXRvclwifSksXHJcbiAgICAgICAgICAgIG5ldyBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPih7IHRhZzogXCJkaXZcIiwgY3NzQ2xhc3M6IFwidWktYnVmZmVyaW5nLW92ZXJsYXktaW5kaWNhdG9yXCJ9KSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWJ1ZmZlcmluZy1vdmVybGF5XCIsXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcclxuICAgICAgICAgICAgY29tcG9uZW50czogdGhpcy5pbmRpY2F0b3JzXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVEFMTF9TVEFSVEVELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NUQUxMX0VOREVELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcbiIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb21wb25lbnRDb25maWcsIENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcbmltcG9ydCB7RXZlbnREaXNwYXRjaGVyLCBOb0FyZ3MsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIEJ1dHRvbn0gY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBCdXR0b25Db25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGV4dCBvbiB0aGUgYnV0dG9uLlxyXG4gICAgICovXHJcbiAgICB0ZXh0Pzogc3RyaW5nO1xyXG59XHJcblxyXG4vKipcclxuICogQSBzaW1wbGUgY2xpY2thYmxlIGJ1dHRvbi5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBCdXR0b248Q29uZmlnIGV4dGVuZHMgQnV0dG9uQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGJ1dHRvbkV2ZW50cyA9IHtcclxuICAgICAgICBvbkNsaWNrOiBuZXcgRXZlbnREaXNwYXRjaGVyPEJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBCdXR0b25Db25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWJ1dHRvblwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgYnV0dG9uIGVsZW1lbnQgd2l0aCB0aGUgdGV4dCBsYWJlbFxyXG4gICAgICAgIGxldCBidXR0b25FbGVtZW50ID0gbmV3IERPTShcImJ1dHRvblwiLCB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImJ1dHRvblwiLFxyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSkuYXBwZW5kKG5ldyBET00oXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiB0aGlzLnByZWZpeENzcyhcImxhYmVsXCIpXHJcbiAgICAgICAgfSkuaHRtbCh0aGlzLmNvbmZpZy50ZXh0KSk7XHJcblxyXG4gICAgICAgIC8vIExpc3RlbiBmb3IgdGhlIGNsaWNrIGV2ZW50IG9uIHRoZSBidXR0b24gZWxlbWVudCBhbmQgdHJpZ2dlciB0aGUgY29ycmVzcG9uZGluZyBldmVudCBvbiB0aGUgYnV0dG9uIGNvbXBvbmVudFxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQub24oXCJjbGlja1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25DbGlja0V2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBidXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0ZXh0IG9uIHRoZSBsYWJlbCBvZiB0aGUgYnV0dG9uLlxyXG4gICAgICogQHBhcmFtIHRleHQgdGhlIHRleHQgdG8gcHV0IGludG8gdGhlIGxhYmVsIG9mIHRoZSBidXR0b25cclxuICAgICAqL1xyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5maW5kKFwiLlwiICsgdGhpcy5wcmVmaXhDc3MoXCJsYWJlbFwiKSkuaHRtbCh0ZXh0KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25DbGlja0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuYnV0dG9uRXZlbnRzLm9uQ2xpY2suZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbkNsaWNrKCk6IEV2ZW50PEJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5idXR0b25FdmVudHMub25DbGljay5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lckNvbmZpZywgQ29udGFpbmVyfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBDYXN0V2FpdGluZ0ZvckRldmljZUV2ZW50ID0gYml0bW92aW4ucGxheWVyLkNhc3RXYWl0aW5nRm9yRGV2aWNlRXZlbnQ7XHJcbmltcG9ydCBDYXN0TGF1bmNoZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5DYXN0TGF1bmNoZWRFdmVudDtcclxuaW1wb3J0IENhc3RTdG9wcGVkRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuQ2FzdFN0b3BwZWRFdmVudDtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIGFuZCBkaXNwbGF5cyB0aGUgc3RhdHVzIG9mIGEgQ2FzdCBzZXNzaW9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENhc3RTdGF0dXNPdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdHVzTGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXNMYWJlbCA9IG5ldyBMYWJlbDxMYWJlbENvbmZpZz4oe2Nzc0NsYXNzOiBcInVpLWNhc3Qtc3RhdHVzLWxhYmVsXCJ9KTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1jYXN0LXN0YXR1cy1vdmVybGF5XCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLnN0YXR1c0xhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBjYXN0RGV2aWNlTmFtZSA9IFwidW5rbm93blwiO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJURUQsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAvLyBTaG93IENhc3Qgc3RhdHVzIHdoZW4gYSBzZXNzaW9uIGlzIGJlaW5nIHN0YXJ0ZWRcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhdHVzTGFiZWwuc2V0VGV4dChcIlNlbGVjdCBhIENhc3QgZGV2aWNlXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfV0FJVElOR19GT1JfREVWSUNFLCBmdW5jdGlvbiAoZXZlbnQ6IENhc3RXYWl0aW5nRm9yRGV2aWNlRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gR2V0IGRldmljZSBuYW1lIGFuZCB1cGRhdGUgc3RhdHVzIHRleHQgd2hpbGUgY29ubmVjdGluZ1xyXG4gICAgICAgICAgICBjYXN0RGV2aWNlTmFtZSA9IGV2ZW50LmNhc3RQYXlsb2FkLmRldmljZU5hbWU7XHJcbiAgICAgICAgICAgIHNlbGYuc3RhdHVzTGFiZWwuc2V0VGV4dChgQ29ubmVjdGluZyB0byA8c3Ryb25nPiR7Y2FzdERldmljZU5hbWV9PC9zdHJvbmc+Li4uYCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9MQVVOQ0hFRCwgZnVuY3Rpb24gKGV2ZW50OiBDYXN0TGF1bmNoZWRFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBTZXNzaW9uIGlzIHN0YXJ0ZWQgb3IgcmVzdW1lZFxyXG4gICAgICAgICAgICAvLyBGb3IgY2FzZXMgd2hlbiBhIHNlc3Npb24gaXMgcmVzdW1lZCwgd2UgZG8gbm90IHJlY2VpdmUgdGhlIHByZXZpb3VzIGV2ZW50cyBhbmQgdGhlcmVmb3JlIHNob3cgdGhlIHN0YXR1cyBwYW5lbCBoZXJlIHRvb1xyXG4gICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgc2VsZi5zdGF0dXNMYWJlbC5zZXRUZXh0KGBQbGF5aW5nIG9uIDxzdHJvbmc+JHtjYXN0RGV2aWNlTmFtZX08L3N0cm9uZz5gKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUT1BQRUQsIGZ1bmN0aW9uIChldmVudDogQ2FzdFN0b3BwZWRFdmVudCkge1xyXG4gICAgICAgICAgICAvLyBDYXN0IHNlc3Npb24gZ29uZSwgaGlkZSB0aGUgc3RhdHVzIHBhbmVsXHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgY2FzdGluZyB0byBhIENhc3QgcmVjZWl2ZXIuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ2FzdFRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1jYXN0dG9nZ2xlYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiR29vZ2xlIENhc3RcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0QXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0aW5nKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuY2FzdFN0b3AoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLmNhc3RWaWRlbygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUpIGNvbnNvbGUubG9nKFwiQ2FzdCB1bmF2YWlsYWJsZVwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBsZXQgY2FzdEF2YWlsYWJsZUhhbmRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Nhc3RBdmFpbGFibGUoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfQVZBSUxBQkxFLCBjYXN0QXZhaWxhYmxlSGFuZGVyKTtcclxuXHJcbiAgICAgICAgLy8gVG9nZ2xlIGJ1dHRvbiBcIm9uXCIgc3RhdGVcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJURUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RPUFBFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTdGFydHVwIGluaXRcclxuICAgICAgICBjYXN0QXZhaWxhYmxlSGFuZGVyKCk7IC8vIEhpZGUgYnV0dG9uIGlmIENhc3Qgbm90IGF2YWlsYWJsZVxyXG4gICAgICAgIGlmIChwbGF5ZXIuaXNDYXN0aW5nKCkpIHtcclxuICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtCdXR0b24sIEJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vYnV0dG9uXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIENsaWNrT3ZlcmxheX0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENsaWNrT3ZlcmxheUNvbmZpZyBleHRlbmRzIEJ1dHRvbkNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB1cmwgdG8gb3BlbiB3aGVuIHRoZSBvdmVybGF5IGlzIGNsaWNrZWQuIFNldCB0byBudWxsIHRvIGRpc2FibGUgdGhlIGNsaWNrIGhhbmRsZXIuXHJcbiAgICAgKi9cclxuICAgIHVybD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgY2xpY2sgb3ZlcmxheSB0aGF0IG9wZW5zIGFuIHVybCBpbiBhIG5ldyB0YWIgaWYgY2xpY2tlZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDbGlja092ZXJsYXkgZXh0ZW5kcyBCdXR0b248Q2xpY2tPdmVybGF5Q29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDbGlja092ZXJsYXlDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY2xpY2tvdmVybGF5XCJcclxuICAgICAgICB9LCA8Q2xpY2tPdmVybGF5Q29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0aWFsaXplKCk6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmluaXRpYWxpemUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZXRVcmwoKDxDbGlja092ZXJsYXlDb25maWc+dGhpcy5jb25maWcpLnVybCk7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmdldERvbUVsZW1lbnQoKTtcclxuICAgICAgICBlbGVtZW50Lm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5kYXRhKFwidXJsXCIpKSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cub3BlbihlbGVtZW50LmRhdGEoXCJ1cmxcIiksIFwiX2JsYW5rXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBVUkwgdGhhdCBzaG91bGQgYmUgZm9sbG93ZWQgd2hlbiB0aGUgd2F0ZXJtYXJrIGlzIGNsaWNrZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgd2F0ZXJtYXJrIFVSTFxyXG4gICAgICovXHJcbiAgICBnZXRVcmwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXREb21FbGVtZW50KCkuZGF0YShcInVybFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBzZXRVcmwodXJsOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAodXJsID09PSB1bmRlZmluZWQgfHwgdXJsID09IG51bGwpIHtcclxuICAgICAgICAgICAgdXJsID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuZGF0YShcInVybFwiLCB1cmwpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0d1aWR9IGZyb20gXCIuLi9ndWlkXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcbmltcG9ydCB7RXZlbnREaXNwYXRjaGVyLCBOb0FyZ3MsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQmFzZSBjb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSBjb21wb25lbnQuXHJcbiAqIFNob3VsZCBiZSBleHRlbmRlZCBieSBjb21wb25lbnRzIHRoYXQgd2FudCB0byBhZGQgYWRkaXRpb25hbCBjb25maWd1cmF0aW9uIG9wdGlvbnMuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBIVE1MIHRhZyBuYW1lIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKiBEZWZhdWx0OiBcImRpdlwiXHJcbiAgICAgKi9cclxuICAgIHRhZz86IHN0cmluZztcclxuICAgIC8qKlxyXG4gICAgICogVGhlIEhUTUwgSUQgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqIERlZmF1bHQ6IGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGVkIHdpdGggcGF0dGVybiBcInVpLWlkLXtndWlkfVwiLlxyXG4gICAgICovXHJcbiAgICBpZD86IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcHJlZml4IHRvIHByZXBlbmQgYWxsIENTUyBjbGFzc2VzIHdpdGguXHJcbiAgICAgKi9cclxuICAgIGNzc1ByZWZpeD86IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBDU1MgY2xhc3NlcyBvZiB0aGUgY29tcG9uZW50LiBUaGlzIGlzIHVzdWFsbHkgdGhlIGNsYXNzIGZyb20gd2hlcmUgdGhlIGNvbXBvbmVudCB0YWtlcyBpdHMgc3R5bGluZy5cclxuICAgICAqL1xyXG4gICAgY3NzQ2xhc3M/OiBzdHJpbmc7IC8vIFwiY2xhc3NcIiBpcyBhIHJlc2VydmVkIGtleXdvcmQsIHNvIHdlIG5lZWQgdG8gbWFrZSB0aGUgbmFtZSBtb3JlIGNvbXBsaWNhdGVkXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGRpdGlvbmFsIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIGNzc0NsYXNzZXM/OiBzdHJpbmdbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNwZWNpZmllcyBpZiB0aGUgY29tcG9uZW50IHNob3VsZCBiZSBoaWRkZW4gYXQgc3RhcnR1cC5cclxuICAgICAqIERlZmF1bHQ6IGZhbHNlXHJcbiAgICAgKi9cclxuICAgIGhpZGRlbj86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgYmFzZSBjbGFzcyBvZiB0aGUgVUkgZnJhbWV3b3JrLlxyXG4gKiBFYWNoIGNvbXBvbmVudCBtdXN0IGV4dGVuZCB0aGlzIGNsYXNzIGFuZCBvcHRpb25hbGx5IHRoZSBjb25maWcgaW50ZXJmYWNlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudDxDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWc+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjbGFzc25hbWUgdGhhdCBpcyBhdHRhY2hlZCB0byB0aGUgZWxlbWVudCB3aGVuIGl0IGlzIGluIHRoZSBoaWRkZW4gc3RhdGUuXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDTEFTU19ISURERU4gPSBcImhpZGRlblwiO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uZmlndXJhdGlvbiBvYmplY3Qgb2YgdGhpcyBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBjb25maWc6IENvbmZpZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBjb21wb25lbnQncyBET00gZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBlbGVtZW50OiBET007XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGbGFnIHRoYXQga2VlcHMgdHJhY2sgb2YgdGhlIGhpZGRlbiBzdGF0ZS5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBoaWRkZW46IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGlzdCBvZiBldmVudHMgdGhhdCB0aGlzIGNvbXBvbmVudCBvZmZlcnMuIFRoZXNlIGV2ZW50cyBzaG91bGQgYWx3YXlzIGJlIHByaXZhdGUgYW5kIG9ubHkgZGlyZWN0bHlcclxuICAgICAqIGFjY2Vzc2VkIGZyb20gd2l0aGluIHRoZSBpbXBsZW1lbnRpbmcgY29tcG9uZW50LlxyXG4gICAgICpcclxuICAgICAqIEJlY2F1c2UgVHlwZVNjcmlwdCBkb2VzIG5vdCBzdXBwb3J0IHByaXZhdGUgcHJvcGVydGllcyB3aXRoIHRoZSBzYW1lIG5hbWUgb24gZGlmZmVyZW50IGNsYXNzIGhpZXJhcmNoeSBsZXZlbHNcclxuICAgICAqIChpLmUuIHN1cGVyY2xhc3MgYW5kIHN1YmNsYXNzIGNhbm5vdCBjb250YWluIGEgcHJpdmF0ZSBwcm9wZXJ0eSB3aXRoIHRoZSBzYW1lIG5hbWUpLCB0aGUgZGVmYXVsdCBuYW1pbmdcclxuICAgICAqIGNvbnZlbnRpb24gZm9yIHRoZSBldmVudCBsaXN0IG9mIGEgY29tcG9uZW50IHRoYXQgc2hvdWxkIGJlIGZvbGxvd2VkIGJ5IHN1YmNsYXNzZXMgaXMgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlXHJcbiAgICAgKiBjYW1lbC1jYXNlZCBjbGFzcyBuYW1lICsgXCJFdmVudHNcIiAoZS5nLiBTdWJDbGFzcyBleHRlbmRzIENvbXBvbmVudCA9PiBzdWJDbGFzc0V2ZW50cykuXHJcbiAgICAgKiBTZWUge0BsaW5rICNjb21wb25lbnRFdmVudHN9IGZvciBhbiBleGFtcGxlLlxyXG4gICAgICpcclxuICAgICAqIEV2ZW50IHByb3BlcnRpZXMgc2hvdWxkIGJlIG5hbWVkIGluIGNhbWVsIGNhc2Ugd2l0aCBhbiBcIm9uXCIgcHJlZml4IGFuZCBpbiB0aGUgcHJlc2VudCB0ZW5zZS4gQXN5bmMgZXZlbnRzIG1heVxyXG4gICAgICogaGF2ZSBhIHN0YXJ0IGV2ZW50ICh3aGVuIHRoZSBvcGVyYXRpb24gc3RhcnRzKSBpbiB0aGUgcHJlc2VudCB0ZW5zZSwgYW5kIG11c3QgaGF2ZSBhbiBlbmQgZXZlbnQgKHdoZW4gdGhlXHJcbiAgICAgKiBvcGVyYXRpb24gZW5kcykgaW4gdGhlIHBhc3QgdGVuc2UgKG9yIHByZXNlbnQgdGVuc2UgaW4gc3BlY2lhbCBjYXNlcyAoZS5nLiBvblN0YXJ0L29uU3RhcnRlZCBvciBvblBsYXkvb25QbGF5aW5nKS5cclxuICAgICAqIFNlZSB7QGxpbmsgI2NvbXBvbmVudEV2ZW50cyNvblNob3d9IGZvciBhbiBleGFtcGxlLlxyXG4gICAgICpcclxuICAgICAqIEVhY2ggZXZlbnQgc2hvdWxkIGJlIGFjY29tcGFuaWVkIHdpdGggYSBwcm90ZWN0ZWQgbWV0aG9kIG5hbWVkIGJ5IHRoZSBjb252ZW50aW9uIGV2ZW50TmFtZSArIFwiRXZlbnRcIlxyXG4gICAgICogKGUuZy4gb25TdGFydEV2ZW50KSwgdGhhdCBhY3R1YWxseSB0cmlnZ2VycyB0aGUgZXZlbnQgYnkgY2FsbGluZyB7QGxpbmsgRXZlbnREaXNwYXRjaGVyI2Rpc3BhdGNoIGRpc3BhdGNofSBhbmRcclxuICAgICAqIHBhc3NpbmcgYSByZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudCBhcyBmaXJzdCBwYXJhbWV0ZXIuIENvbXBvbmVudHMgc2hvdWxkIGFsd2F5cyB0cmlnZ2VyIHRoZWlyIGV2ZW50cyB3aXRoIHRoZXNlXHJcbiAgICAgKiBtZXRob2RzLiBJbXBsZW1lbnRpbmcgdGhpcyBwYXR0ZXJuIGdpdmVzIHN1YmNsYXNzZXMgbWVhbnMgdG8gZGlyZWN0bHkgbGlzdGVuIHRvIHRoZSBldmVudHMgYnkgb3ZlcnJpZGluZyB0aGVcclxuICAgICAqIG1ldGhvZCAoYW5kIHNhdmluZyB0aGUgb3ZlcmhlYWQgb2YgcGFzc2luZyBhIGhhbmRsZXIgdG8gdGhlIGV2ZW50IGRpc3BhdGNoZXIpIGFuZCBtb3JlIGltcG9ydGFudGx5IHRvIHRyaWdnZXJcclxuICAgICAqIHRoZXNlIGV2ZW50cyB3aXRob3V0IGhhdmluZyBhY2Nlc3MgdG8gdGhlIHByaXZhdGUgZXZlbnQgbGlzdC5cclxuICAgICAqIFNlZSB7QGxpbmsgI29uU2hvd30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogVG8gcHJvdmlkZSBleHRlcm5hbCBjb2RlIHRoZSBwb3NzaWJpbGl0eSB0byBsaXN0ZW4gdG8gdGhpcyBjb21wb25lbnQncyBldmVudHMgKHN1YnNjcmliZSwgdW5zdWJzY3JpYmUsIGV0Yy4pLFxyXG4gICAgICogZWFjaCBldmVudCBzaG91bGQgYWxzbyBiZSBhY2NvbXBhbmllZCBieSBhIHB1YmxpYyBnZXR0ZXIgZnVuY3Rpb24gd2l0aCB0aGUgc2FtZSBuYW1lIGFzIHRoZSBldmVudCdzIHByb3BlcnR5LFxyXG4gICAgICogdGhhdCByZXR1cm5zIHRoZSB7QGxpbmsgRXZlbnR9IG9idGFpbmVkIGZyb20gdGhlIGV2ZW50IGRpc3BhdGNoZXIgYnkgY2FsbGluZyB7QGxpbmsgRXZlbnREaXNwYXRjaGVyI2dldEV2ZW50fS5cclxuICAgICAqIFNlZSB7QGxpbmsgI29uU2hvd30gZm9yIGFuIGV4YW1wbGUuXHJcbiAgICAgKlxyXG4gICAgICogRnVsbCBleGFtcGxlIGZvciBhbiBldmVudCByZXByZXNlbnRpbmcgYW4gZXhhbXBsZSBhY3Rpb24gaW4gYSBleGFtcGxlIGNvbXBvbmVudDpcclxuICAgICAqXHJcbiAgICAgKiA8Y29kZT5cclxuICAgICAqIC8vIERlZmluZSBhbiBleGFtcGxlIGNvbXBvbmVudCBjbGFzcyB3aXRoIGFuIGV4YW1wbGUgZXZlbnRcclxuICAgICAqIGNsYXNzIEV4YW1wbGVDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiB7XHJcbiAgICAgKlxyXG4gICAgICogICAgIHByaXZhdGUgZXhhbXBsZUNvbXBvbmVudEV2ZW50cyA9IHtcclxuICAgICAqICAgICAgICAgb25FeGFtcGxlQWN0aW9uOiBuZXcgRXZlbnREaXNwYXRjaGVyPEV4YW1wbGVDb21wb25lbnQsIE5vQXJncz4oKVxyXG4gICAgICogICAgIH1cclxuICAgICAqXHJcbiAgICAgKiAgICAgLy8gY29uc3RydWN0b3IgYW5kIG90aGVyIHN0dWZmLi4uXHJcbiAgICAgKlxyXG4gICAgICogICAgIHByb3RlY3RlZCBvbkV4YW1wbGVBY3Rpb25FdmVudCgpIHtcclxuICAgICAqICAgICAgICB0aGlzLmV4YW1wbGVDb21wb25lbnRFdmVudHMub25FeGFtcGxlQWN0aW9uLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgICogICAgfVxyXG4gICAgICpcclxuICAgICAqICAgIGdldCBvbkV4YW1wbGVBY3Rpb24oKTogRXZlbnQ8RXhhbXBsZUNvbXBvbmVudCwgTm9BcmdzPiB7XHJcbiAgICAgKiAgICAgICAgcmV0dXJuIHRoaXMuZXhhbXBsZUNvbXBvbmVudEV2ZW50cy5vbkV4YW1wbGVBY3Rpb24uZ2V0RXZlbnQoKTtcclxuICAgICAqICAgIH1cclxuICAgICAqIH1cclxuICAgICAqXHJcbiAgICAgKiAvLyBDcmVhdGUgYW4gaW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudCBzb21ld2hlcmVcclxuICAgICAqIHZhciBleGFtcGxlQ29tcG9uZW50SW5zdGFuY2UgPSBuZXcgRXhhbXBsZUNvbXBvbmVudCgpO1xyXG4gICAgICpcclxuICAgICAqIC8vIFN1YnNjcmliZSB0byB0aGUgZXhhbXBsZSBldmVudCBvbiB0aGUgY29tcG9uZW50XHJcbiAgICAgKiBleGFtcGxlQ29tcG9uZW50SW5zdGFuY2Uub25FeGFtcGxlQWN0aW9uLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBFeGFtcGxlQ29tcG9uZW50KSB7XHJcbiAgICAgKiAgICAgY29uc29sZS5sb2coXCJvbkV4YW1wbGVBY3Rpb24gb2YgXCIgKyBzZW5kZXIgKyBcIiBoYXMgZmlyZWQhXCIpO1xyXG4gICAgICogfSk7XHJcbiAgICAgKiA8L2NvZGU+XHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgY29tcG9uZW50RXZlbnRzID0ge1xyXG4gICAgICAgIG9uU2hvdzogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIG9uSGlkZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29uZmlnPiwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29uc3RydWN0cyBhIGNvbXBvbmVudCB3aXRoIGFuIG9wdGlvbmFsbHkgc3VwcGxpZWQgY29uZmlnLiBBbGwgc3ViY2xhc3NlcyBtdXN0IGNhbGwgdGhlIGNvbnN0cnVjdG9yIG9mIHRoZWlyXHJcbiAgICAgKiBzdXBlcmNsYXNzIGFuZCB0aGVuIG1lcmdlIHRoZWlyIGNvbmZpZ3VyYXRpb24gaW50byB0aGUgY29tcG9uZW50J3MgY29uZmlndXJhdGlvbi5cclxuICAgICAqIEBwYXJhbSBjb25maWcgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjb21wb25lbnRcclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb21wb25lbnRDb25maWcgPSB7fSkge1xyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhpcyBjb21wb25lbnRcclxuICAgICAgICB0aGlzLmNvbmZpZyA9IDxDb25maWc+dGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgdGFnOiBcImRpdlwiLFxyXG4gICAgICAgICAgICBpZDogXCJibXB1aS1pZC1cIiArIEd1aWQubmV4dCgpLFxyXG4gICAgICAgICAgICBjc3NQcmVmaXg6IFwiYm1wdWlcIixcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY29tcG9uZW50XCIsXHJcbiAgICAgICAgICAgIGNzc0NsYXNzZXM6IFtdLFxyXG4gICAgICAgICAgICBoaWRkZW46IGZhbHNlXHJcbiAgICAgICAgfSwge30pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIGNvbXBvbmVudCwgZS5nLiBieSBhcHBseWluZyBjb25maWcgc2V0dGluZ3MuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBtdXN0IG5vdCBiZSBjYWxsZWQgZnJvbSBvdXRzaWRlIHRoZSBVSSBmcmFtZXdvcmsuXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBtZXRob2QgaXMgYXV0b21hdGljYWxseSBjYWxsZWQgYnkgdGhlIHtAbGluayBVSU1hbmFnZXJ9LiBJZiB0aGUgY29tcG9uZW50IGlzIGFuIGlubmVyIGNvbXBvbmVudCBvZlxyXG4gICAgICogc29tZSBjb21wb25lbnQsIGFuZCB0aHVzIGVuY2Fwc3VsYXRlZCBhYmQgbWFuYWdlZCBpbnRlcm5hbGx5IGFuZCBuZXZlciBkaXJlY3RseSBleHBvc2VkIHRvIHRoZSBVSU1hbmFnZXIsXHJcbiAgICAgKiB0aGlzIG1ldGhvZCBtdXN0IGJlIGNhbGxlZCBmcm9tIHRoZSBtYW5hZ2luZyBjb21wb25lbnQncyB7QGxpbmsgI2luaXRpYWxpemV9IG1ldGhvZC5cclxuICAgICAqL1xyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IHRoaXMuY29uZmlnLmhpZGRlbjtcclxuXHJcbiAgICAgICAgLy8gSGlkZSB0aGUgY29tcG9uZW50IGF0IGluaXRpYWxpemF0aW9uIGlmIGl0IGlzIGNvbmZpZ3VyZWQgdG8gYmUgaGlkZGVuXHJcbiAgICAgICAgaWYgKHRoaXMuaXNIaWRkZW4oKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDb25maWd1cmVzIHRoZSBjb21wb25lbnQgZm9yIHRoZSBzdXBwbGllZCBQbGF5ZXIgYW5kIFVJTWFuYWdlci4gVGhpcyBpcyB0aGUgcGxhY2Ugd2hlcmUgYWxsIHRoZSBtYWdpYyBoYXBwZW5zLFxyXG4gICAgICogd2hlcmUgY29tcG9uZW50cyB0eXBpY2FsbHkgc3Vic2NyaWJlIGFuZCByZWFjdCB0byBldmVudHMgKG9uIHRoZWlyIERPTSBlbGVtZW50LCB0aGUgUGxheWVyLCBvciB0aGUgVUlNYW5hZ2VyKSxcclxuICAgICAqIGFuZCBiYXNpY2FsbHkgZXZlcnl0aGluZyB0aGF0IG1ha2VzIHRoZW0gaW50ZXJhY3RpdmUuXHJcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgb25seSBvbmNlLCB3aGVuIHRoZSBVSU1hbmFnZXIgaW5pdGlhbGl6ZXMgdGhlIFVJLlxyXG4gICAgICpcclxuICAgICAqIFN1YmNsYXNzZXMgdXN1YWxseSBvdmVyd3JpdGUgdGhpcyBtZXRob2QgdG8gYWRkIHRoZWlyIG93biBmdW5jdGlvbmFsaXR5LlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBwbGF5ZXIgdGhlIHBsYXllciB3aGljaCB0aGlzIGNvbXBvbmVudCBjb250cm9sc1xyXG4gICAgICogQHBhcmFtIHVpbWFuYWdlciB0aGUgVUlNYW5hZ2VyIHRoYXQgbWFuYWdlcyB0aGlzIGNvbXBvbmVudFxyXG4gICAgICovXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgc2VsZi5vblNob3cuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uQ29tcG9uZW50U2hvdy5kaXNwYXRjaChzZWxmKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uSGlkZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25Db21wb25lbnRIaWRlLmRpc3BhdGNoKHNlbGYpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2VuZXJhdGUgdGhlIERPTSBlbGVtZW50IGZvciB0aGlzIGNvbXBvbmVudC5cclxuICAgICAqXHJcbiAgICAgKiBTdWJjbGFzc2VzIHVzdWFsbHkgb3ZlcndyaXRlIHRoaXMgbWV0aG9kIHRvIGV4dGVuZCBvciByZXBsYWNlIHRoZSBET00gZWxlbWVudCB3aXRoIHRoZWlyIG93biBkZXNpZ24uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IG5ldyBET00odGhpcy5jb25maWcudGFnLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIERPTSBlbGVtZW50IG9mIHRoaXMgY29tcG9uZW50LiBDcmVhdGVzIHRoZSBET00gZWxlbWVudCBpZiBpdCBkb2VzIG5vdCB5ZXQgZXhpc3QuXHJcbiAgICAgKlxyXG4gICAgICogU2hvdWxkIG5vdCBiZSBvdmVyd3JpdHRlbiBieSBzdWJjbGFzc2VzLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGdldERvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQgPSB0aGlzLnRvRG9tRWxlbWVudCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIE1lcmdlcyBhIGNvbmZpZ3VyYXRpb24gd2l0aCBhIGRlZmF1bHQgY29uZmlndXJhdGlvbiBhbmQgYSBiYXNlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgc3VwZXJjbGFzcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gY29uZmlnIHRoZSBjb25maWd1cmF0aW9uIHNldHRpbmdzIGZvciB0aGUgY29tcG9uZW50cywgYXMgdXN1YWxseSBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yXHJcbiAgICAgKiBAcGFyYW0gZGVmYXVsdHMgYSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZm9yIHNldHRpbmdzIHRoYXQgYXJlIG5vdCBwYXNzZWQgd2l0aCB0aGUgY29uZmlndXJhdGlvblxyXG4gICAgICogQHBhcmFtIGJhc2UgY29uZmlndXJhdGlvbiBpbmhlcml0ZWQgZnJvbSBhIHN1cGVyY2xhc3NcclxuICAgICAqIEByZXR1cm5zIHtDb25maWd9XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBtZXJnZUNvbmZpZzxDb25maWc+KGNvbmZpZzogQ29uZmlnLCBkZWZhdWx0czogQ29uZmlnLCBiYXNlOiBDb25maWcpOiBDb25maWcge1xyXG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IGNvbmZpZyB3aXRoIHN1cHBsaWVkIGNvbmZpZ1xyXG4gICAgICAgIGxldCBtZXJnZWQgPSBPYmplY3QuYXNzaWduKHt9LCBiYXNlLCBkZWZhdWx0cywgY29uZmlnKTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHRoZSBleHRlbmRlZCBjb25maWdcclxuICAgICAgICByZXR1cm4gbWVyZ2VkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSGVscGVyIG1ldGhvZCB0aGF0IHJldHVybnMgYSBzdHJpbmcgb2YgYWxsIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIGdldENzc0NsYXNzZXMoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgLy8gTWVyZ2UgYWxsIENTUyBjbGFzc2VzIGludG8gc2luZ2xlIGFycmF5XHJcbiAgICAgICAgbGV0IGZsYXR0ZW5lZEFycmF5ID0gW3RoaXMuY29uZmlnLmNzc0NsYXNzXS5jb25jYXQodGhpcy5jb25maWcuY3NzQ2xhc3Nlcyk7XHJcbiAgICAgICAgLy8gUHJlZml4IGNsYXNzZXNcclxuICAgICAgICBmbGF0dGVuZWRBcnJheSA9IGZsYXR0ZW5lZEFycmF5Lm1hcChmdW5jdGlvbiAoY3NzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnByZWZpeENzcyhjc3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIEpvaW4gYXJyYXkgdmFsdWVzIGludG8gYSBzdHJpbmdcclxuICAgICAgICBsZXQgZmxhdHRlbmVkU3RyaW5nID0gZmxhdHRlbmVkQXJyYXkuam9pbihcIiBcIik7XHJcbiAgICAgICAgLy8gUmV0dXJuIHRyaW1tZWQgc3RyaW5nIHRvIHByZXZlbnQgd2hpdGVzcGFjZSBhdCB0aGUgZW5kIGZyb20gdGhlIGpvaW4gb3BlcmF0aW9uXHJcbiAgICAgICAgcmV0dXJuIGZsYXR0ZW5lZFN0cmluZy50cmltKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHByZWZpeENzcyhjc3NDbGFzc09ySWQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnLmNzc1ByZWZpeCArIFwiLVwiICsgY3NzQ2xhc3NPcklkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgY29uZmlndXJhdGlvbiBvYmplY3Qgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqIEByZXR1cm5zIHtDb25maWd9XHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZXRDb25maWcoKTogQ29uZmlnIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb25maWc7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlcyB0aGUgY29tcG9uZW50LlxyXG4gICAgICogVGhpcyBtZXRob2QgYmFzaWNhbGx5IHRyYW5zZmVycyB0aGUgY29tcG9uZW50IGludG8gdGhlIGhpZGRlbiBzdGF0ZS4gQWN0dWFsIGhpZGluZyBpcyBkb25lIHZpYSBDU1MuXHJcbiAgICAgKi9cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5oaWRkZW4gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKHRoaXMucHJlZml4Q3NzKENvbXBvbmVudC5DTEFTU19ISURERU4pKTtcclxuICAgICAgICB0aGlzLm9uSGlkZUV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTaG93cyB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKHRoaXMucHJlZml4Q3NzKENvbXBvbmVudC5DTEFTU19ISURERU4pKTtcclxuICAgICAgICB0aGlzLmhpZGRlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub25TaG93RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIERldGVybWluZXMgaWYgdGhlIGNvbXBvbmVudCBpcyBoaWRkZW4uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGlzIGhpZGRlbiwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBpc0hpZGRlbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oaWRkZW47XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBEZXRlcm1pbmVzIGlmIHRoZSBjb21wb25lbnQgaXMgc2hvd24uXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGlzIHZpc2libGUsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNTaG93bigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaXNIaWRkZW4oKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZXMgdGhlIGhpZGRlbiBzdGF0ZSBieSBoaWRpbmcgdGhlIGNvbXBvbmVudCBpZiBpdCBpcyBzaG93biwgb3Igc2hvd2luZyBpdCBpZiBoaWRkZW4uXHJcbiAgICAgKi9cclxuICAgIHRvZ2dsZUhpZGRlbigpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSBvblNob3cgZXZlbnQuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIG9uU2hvd0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uU2hvdy5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpcmVzIHRoZSBvbkhpZGUgZXZlbnQuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIG9uSGlkZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuY29tcG9uZW50RXZlbnRzLm9uSGlkZS5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIHNob3dpbmcuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TaG93KCk6IEV2ZW50PENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRFdmVudHMub25TaG93LmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBoaWRpbmcuXHJcbiAgICAgKiBTZWUgdGhlIGRldGFpbGVkIGV4cGxhbmF0aW9uIG9uIGV2ZW50IGFyY2hpdGVjdHVyZSBvbmogdGhlIHtAbGluayAjY29tcG9uZW50RXZlbnRzIGV2ZW50cyBsaXN0fS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25IaWRlKCk6IEV2ZW50PENvbXBvbmVudDxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRFdmVudHMub25IaWRlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0FycmF5VXRpbHN9IGZyb20gXCIuLi91dGlsc1wiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBDb250YWluZXJ9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDb250YWluZXJDb25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDaGlsZCBjb21wb25lbnRzIG9mIHRoZSBjb250YWluZXIuXHJcbiAgICAgKi9cclxuICAgIGNvbXBvbmVudHM/OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPltdO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjb250YWluZXIgY29tcG9uZW50IHRoYXQgY2FuIGNvbnRhaW4gYSBjb2xsZWN0aW9uIG9mIGNoaWxkIGNvbXBvbmVudHMuXHJcbiAqIENvbXBvbmVudHMgY2FuIGJlIGFkZGVkIGF0IGNvbnN0cnVjdGlvbiB0aW1lIHRocm91Z2ggdGhlIHtAbGluayBDb250YWluZXJDb25maWcjY29tcG9uZW50c30gc2V0dGluZywgb3IgbGF0ZXJcclxuICogdGhyb3VnaCB0aGUge0BsaW5rIENvbnRhaW5lciNhZGRDb21wb25lbnR9IG1ldGhvZC4gVGhlIFVJTWFuYWdlciBhdXRvbWF0aWNhbGx5IHRha2VzIGNhcmUgb2YgYWxsIGNvbXBvbmVudHMsIGkuZS4gaXRcclxuICogaW5pdGlhbGl6ZXMgYW5kIGNvbmZpZ3VyZXMgdGhlbSBhdXRvbWF0aWNhbGx5LlxyXG4gKlxyXG4gKiBJbiB0aGUgRE9NLCB0aGUgY29udGFpbmVyIGNvbnNpc3RzIG9mIGFuIG91dGVyIDxkaXY+ICh0aGF0IGNhbiBiZSBjb25maWd1cmVkIGJ5IHRoZSBjb25maWcpIGFuZCBhbiBpbm5lciB3cmFwcGVyXHJcbiAqIDxkaXY+IHRoYXQgY29udGFpbnMgdGhlIGNvbXBvbmVudHMuIFRoaXMgZG91YmxlLTxkaXY+LXN0cnVjdHVyZSBpcyBvZnRlbiByZXF1aXJlZCB0byBhY2hpZXZlIG1hbnkgYWR2YW5jZWQgZWZmZWN0c1xyXG4gKiBpbiBDU1MgYW5kL29yIEpTLCBlLmcuIGFuaW1hdGlvbnMgYW5kIGNlcnRhaW4gZm9ybWF0dGluZyB3aXRoIGFic29sdXRlIHBvc2l0aW9uaW5nLlxyXG4gKlxyXG4gKiBET00gZXhhbXBsZTpcclxuICogPGNvZGU+XHJcbiAqICAgICA8ZGl2IGNsYXNzPVwidWktY29udGFpbmVyXCI+XHJcbiAqICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lci13cmFwcGVyXCI+XHJcbiAqICAgICAgICAgICAgIC4uLiBjaGlsZCBjb21wb25lbnRzIC4uLlxyXG4gKiAgICAgICAgIDwvZGl2PlxyXG4gKiAgICAgPC9kaXY+XHJcbiAqIDwvY29kZT5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb250YWluZXI8Q29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnPiBleHRlbmRzIENvbXBvbmVudDxDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgcmVmZXJlbmNlIHRvIHRoZSBpbm5lciBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGNvbXBvbmVudHMgb2YgdGhlIGNvbnRhaW5lci5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBpbm5lckNvbnRhaW5lckVsZW1lbnQ6IERPTTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY29udGFpbmVyXCIsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFtdXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyBhIGNoaWxkIGNvbXBvbmVudCB0byB0aGUgY29udGFpbmVyLlxyXG4gICAgICogQHBhcmFtIGNvbXBvbmVudCB0aGUgY29tcG9uZW50IHRvIGFkZFxyXG4gICAgICovXHJcbiAgICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPikge1xyXG4gICAgICAgIHRoaXMuY29uZmlnLmNvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhIGNoaWxkIGNvbXBvbmVudCBmcm9tIHRoZSBjb250YWluZXIuXHJcbiAgICAgKiBAcGFyYW0gY29tcG9uZW50IHRoZSBjb21wb25lbnQgdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29tcG9uZW50IGhhcyBiZWVuIHJlbW92ZWQsIGZhbHNlIGlmIGl0IGlzIG5vdCBjb250YWluZWQgaW4gdGhpcyBjb250YWluZXJcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gQXJyYXlVdGlscy5yZW1vdmUodGhpcy5jb25maWcuY29tcG9uZW50cywgY29tcG9uZW50KSAhPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyBhbiBhcnJheSBvZiBhbGwgY2hpbGQgY29tcG9uZW50cyBpbiB0aGlzIGNvbnRhaW5lci5cclxuICAgICAqIEByZXR1cm5zIHtDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPltdfVxyXG4gICAgICovXHJcbiAgICBnZXRDb21wb25lbnRzKCk6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5jb21wb25lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVXBkYXRlcyB0aGUgRE9NIG9mIHRoZSBjb250YWluZXIgd2l0aCB0aGUgY3VycmVudCBjb21wb25lbnRzLlxyXG4gICAgICovXHJcbiAgICBwcm90ZWN0ZWQgdXBkYXRlQ29tcG9uZW50cygpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBjb21wb25lbnQgb2YgdGhpcy5jb25maWcuY29tcG9uZW50cykge1xyXG4gICAgICAgICAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxlbWVudC5hcHBlbmQoY29tcG9uZW50LmdldERvbUVsZW1lbnQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICAvLyBDcmVhdGUgdGhlIGNvbnRhaW5lciBlbGVtZW50ICh0aGUgb3V0ZXIgPGRpdj4pXHJcbiAgICAgICAgbGV0IGNvbnRhaW5lckVsZW1lbnQgPSBuZXcgRE9NKHRoaXMuY29uZmlnLnRhZywge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgaW5uZXIgY29udGFpbmVyIGVsZW1lbnQgKHRoZSBpbm5lciA8ZGl2PikgdGhhdCB3aWxsIGNvbnRhaW4gdGhlIGNvbXBvbmVudHNcclxuICAgICAgICBsZXQgaW5uZXJDb250YWluZXIgPSBuZXcgRE9NKHRoaXMuY29uZmlnLnRhZywge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMucHJlZml4Q3NzKFwiY29udGFpbmVyLXdyYXBwZXJcIilcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmlubmVyQ29udGFpbmVyRWxlbWVudCA9IGlubmVyQ29udGFpbmVyO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudHMoKTtcclxuXHJcbiAgICAgICAgY29udGFpbmVyRWxlbWVudC5hcHBlbmQoaW5uZXJDb250YWluZXIpO1xyXG5cclxuICAgICAgICByZXR1cm4gY29udGFpbmVyRWxlbWVudDtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VGltZW91dH0gZnJvbSBcIi4uL3RpbWVvdXRcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgdGhlIHtAbGluayBDb250cm9sQmFyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udHJvbEJhckNvbmZpZyBleHRlbmRzIENvbnRhaW5lckNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIGNvbnRyb2wgYmFyIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIERlZmF1bHQ6IDUgc2Vjb25kcyAoNTAwMClcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjb250YWluZXIgZm9yIG1haW4gcGxheWVyIGNvbnRyb2wgY29tcG9uZW50cywgZS5nLiBwbGF5IHRvZ2dsZSBidXR0b24sIHNlZWsgYmFyLCB2b2x1bWUgY29udHJvbCwgZnVsbHNjcmVlbiB0b2dnbGUgYnV0dG9uLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIENvbnRyb2xCYXIgZXh0ZW5kcyBDb250YWluZXI8Q29udHJvbEJhckNvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29udHJvbEJhckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktY29udHJvbGJhclwiLFxyXG4gICAgICAgICAgICBoaWRkZW46IHRydWUsXHJcbiAgICAgICAgICAgIGhpZGVEZWxheTogNTAwMFxyXG4gICAgICAgIH0sIDxDb250cm9sQmFyQ29uZmlnPnRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgaXNTZWVraW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxDb250cm9sQmFyQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkgeyAvLyBUT0RPIGZpeCBnZW5lcmljcyB0byBzcGFyZSB0aGVzZSBkYW1uIGNhc3RzLi4uIGlzIHRoYXQgZXZlbiBwb3NzaWJsZSBpbiBUUz9cclxuICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlRW50ZXIuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7IC8vIHNob3cgY29udHJvbCBiYXIgd2hlbiB0aGUgbW91c2UgZW50ZXJzIHRoZSBVSVxyXG5cclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpOyAvLyBDbGVhciB0aW1lb3V0IHRvIGF2b2lkIGhpZGluZyB0aGUgY29udHJvbCBiYXIgaWYgdGhlIG1vdXNlIG1vdmVzIGJhY2sgaW50byB0aGUgVUkgZHVyaW5nIHRoZSB0aW1lb3V0IHBlcmlvZFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTW92ZS5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgYXJncykge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5pc0hpZGRlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBEb24ndCBjcmVhdGUvdXBkYXRlIHRpbWVvdXQgd2hpbGUgc2Vla2luZ1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7IC8vIGhpZGUgdGhlIGNvbnRyb2wgYmFyIGlmIG1vdXNlIGRvZXMgbm90IG1vdmUgZHVyaW5nIHRoZSB0aW1lb3V0IHRpbWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIERvbid0IGNyZWF0ZS91cGRhdGUgdGltZW91dCB3aGlsZSBzZWVraW5nXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSBjb250cm9sIGJhciBzb21lIHRpbWUgYWZ0ZXIgdGhlIG1vdXNlIGxlZnQgdGhlIFVJXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7IC8vIERvbid0IGhpZGUgY29udHJvbCBiYXIgd2hpbGUgYSBzZWVrIGlzIGluIHByb2dyZXNzXHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aW1lb3V0LnN0YXJ0KCk7IC8vIGhpZGUgY29udHJvbCBiYXIgc29tZSB0aW1lIGFmdGVyIGEgc2VlayBoYXMgZmluaXNoZWRcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgRXJyb3JFdmVudCA9IGJpdG1vdmluLnBsYXllci5FcnJvckV2ZW50O1xyXG5pbXBvcnQge1R2Tm9pc2VDYW52YXN9IGZyb20gXCIuL3R2bm9pc2VjYW52YXNcIjtcclxuXHJcbi8qKlxyXG4gKiBPdmVybGF5cyB0aGUgcGxheWVyIGFuZCBkaXNwbGF5cyBlcnJvciBtZXNzYWdlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFcnJvck1lc3NhZ2VPdmVybGF5IGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgZXJyb3JMYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG4gICAgcHJpdmF0ZSB0dk5vaXNlQmFja2dyb3VuZDogVHZOb2lzZUNhbnZhcztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5lcnJvckxhYmVsID0gbmV3IExhYmVsPExhYmVsQ29uZmlnPih7Y3NzQ2xhc3M6IFwidWktZXJyb3JtZXNzYWdlLWxhYmVsXCJ9KTtcclxuICAgICAgICB0aGlzLnR2Tm9pc2VCYWNrZ3JvdW5kID0gbmV3IFR2Tm9pc2VDYW52YXMoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1lcnJvcm1lc3NhZ2Utb3ZlcmxheVwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy50dk5vaXNlQmFja2dyb3VuZCwgdGhpcy5lcnJvckxhYmVsXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9FUlJPUiwgZnVuY3Rpb24gKGV2ZW50OiBFcnJvckV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuZXJyb3JMYWJlbC5zZXRUZXh0KGV2ZW50Lm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICBzZWxmLnR2Tm9pc2VCYWNrZ3JvdW5kLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgdGhlIHBsYXllciBiZXR3ZWVuIHdpbmRvd2VkIGFuZCBmdWxsc2NyZWVuIHZpZXcuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1mdWxsc2NyZWVudG9nZ2xlYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiRnVsbHNjcmVlblwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgZnVsbHNjcmVlblN0YXRlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0Z1bGxzY3JlZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0ZVTExTQ1JFRU5fRU5URVIsIGZ1bGxzY3JlZW5TdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0ZVTExTQ1JFRU5fRVhJVCwgZnVsbHNjcmVlblN0YXRlSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzRnVsbHNjcmVlbigpKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuZXhpdEZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5lbnRlckZ1bGxzY3JlZW4oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTdGFydHVwIGluaXRcclxuICAgICAgICBmdWxsc2NyZWVuU3RhdGVIYW5kbGVyKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFBsYXllckV2ZW50ID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgb3ZlcmxheXMgdGhlIHZpZGVvIGFuZCB0b2dnbGVzIGJldHdlZW4gcGxheWJhY2sgYW5kIHBhdXNlLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbiBleHRlbmRzIFBsYXliYWNrVG9nZ2xlQnV0dG9uIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1odWdlcGxheWJhY2t0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJQbGF5L1BhdXNlXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICAvLyBVcGRhdGUgYnV0dG9uIHN0YXRlIHRocm91Z2ggQVBJIGV2ZW50c1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlciwgZmFsc2UpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB0b2dnbGVQbGF5YmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc1BsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHRvZ2dsZUZ1bGxzY3JlZW4gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNGdWxsc2NyZWVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5leGl0RnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLmVudGVyRnVsbHNjcmVlbigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGZpcnN0Q2xpY2sgPSB0cnVlO1xyXG4gICAgICAgIGxldCBjbGlja1RpbWUgPSAwO1xyXG4gICAgICAgIGxldCBkb3VibGVDbGlja1RpbWUgPSAwO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFlvdVR1YmUtc3R5bGUgdG9nZ2xlIGJ1dHRvbiBoYW5kbGluZ1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogVGhlIGdvYWwgaXMgdG8gcHJldmVudCBhIHNob3J0IHBhdXNlIG9yIHBsYXliYWNrIGludGVydmFsIGJldHdlZW4gYSBjbGljaywgdGhhdCB0b2dnbGVzIHBsYXliYWNrLCBhbmQgYVxyXG4gICAgICAgICAqIGRvdWJsZSBjbGljaywgdGhhdCB0b2dnbGVzIGZ1bGxzY3JlZW4uIEluIHRoaXMgbmFpdmUgYXBwcm9hY2gsIHRoZSBmaXJzdCBjbGljayB3b3VsZCBlLmcuIHN0YXJ0IHBsYXliYWNrLFxyXG4gICAgICAgICAqIHRoZSBzZWNvbmQgY2xpY2sgd291bGQgYmUgZGV0ZWN0ZWQgYXMgZG91YmxlIGNsaWNrIGFuZCB0b2dnbGUgdG8gZnVsbHNjcmVlbiwgYW5kIGFzIHNlY29uZCBub3JtYWwgY2xpY2sgc3RvcFxyXG4gICAgICAgICAqIHBsYXliYWNrLCB3aGljaCByZXN1bHRzIGlzIGEgc2hvcnQgcGxheWJhY2sgaW50ZXJ2YWwgd2l0aCBtYXggbGVuZ3RoIG9mIHRoZSBkb3VibGUgY2xpY2sgZGV0ZWN0aW9uXHJcbiAgICAgICAgICogcGVyaW9kICh1c3VhbGx5IDUwMG1zKS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFRvIHNvbHZlIHRoaXMgaXNzdWUsIHdlIGRlZmVyIGhhbmRsaW5nIG9mIHRoZSBmaXJzdCBjbGljayBmb3IgMjAwbXMsIHdoaWNoIGlzIGFsbW9zdCB1bm5vdGljZWFibGUgdG8gdGhlIHVzZXIsXHJcbiAgICAgICAgICogYW5kIGp1c3QgdG9nZ2xlIHBsYXliYWNrIGlmIG5vIHNlY29uZCBjbGljayAoZG91YmxlIGNsaWNrKSBoYXMgYmVlbiByZWdpc3RlcmVkIGR1cmluZyB0aGlzIHBlcmlvZC4gSWYgYSBkb3VibGVcclxuICAgICAgICAgKiBjbGljayBpcyByZWdpc3RlcmVkLCB3ZSBqdXN0IHRvZ2dsZSB0aGUgZnVsbHNjcmVlbi4gSW4gdGhlIGZpcnN0IDIwMG1zLCB1bmRlc2lyZWQgcGxheWJhY2sgY2hhbmdlcyB0aHVzIGNhbm5vdFxyXG4gICAgICAgICAqIGhhcHBlbi4gSWYgYSBkb3VibGUgY2xpY2sgaXMgcmVnaXN0ZXJlZCB3aXRoaW4gNTAwbXMsIHdlIHVuZG8gdGhlIHBsYXliYWNrIGNoYW5nZSBhbmQgc3dpdGNoIGZ1bGxzY3JlZW4gbW9kZS5cclxuICAgICAgICAgKiBJbiB0aGUgZW5kLCB0aGlzIG1ldGhvZCBiYXNpY2FsbHkgaW50cm9kdWNlcyBhIDIwMG1zIG9ic2VydmluZyBpbnRlcnZhbCBpbiB3aGljaCBwbGF5YmFjayBjaGFuZ2VzIGFyZSBwcmV2ZW50ZWRcclxuICAgICAgICAgKiBpZiBhIGRvdWJsZSBjbGljayBoYXBwZW5zLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBEaXJlY3RseSBzdGFydCBwbGF5YmFjayBvbiBmaXJzdCBjbGljayBvZiB0aGUgYnV0dG9uLlxyXG4gICAgICAgICAgICAvLyBUaGlzIGlzIGEgcmVxdWlyZWQgd29ya2Fyb3VuZCBmb3IgbW9iaWxlIGJyb3dzZXJzIHdoZXJlIHZpZGVvIHBsYXliYWNrIG5lZWRzIHRvIGJlIHRyaWdnZXJlZCBkaXJlY3RseVxyXG4gICAgICAgICAgICAvLyBieSB0aGUgdXNlci4gQSBkZWZlcnJlZCBwbGF5YmFjayBzdGFydCB0aHJvdWdoIHRoZSB0aW1lb3V0IGJlbG93IGlzIG5vdCBjb25zaWRlcmVkIGFzIHVzZXIgYWN0aW9uIGFuZFxyXG4gICAgICAgICAgICAvLyB0aGVyZWZvcmUgaWdub3JlZCBieSBtb2JpbGUgYnJvd3NlcnMuXHJcbiAgICAgICAgICAgIGlmIChmaXJzdENsaWNrKSB7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVQbGF5YmFjaygpO1xyXG4gICAgICAgICAgICAgICAgZmlyc3RDbGljayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChub3cgLSBjbGlja1RpbWUgPCAyMDApIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgYSBkb3VibGUgY2xpY2sgaW5zaWRlIHRoZSAyMDBtcyBpbnRlcnZhbCwganVzdCB0b2dnbGUgZnVsbHNjcmVlbiBtb2RlXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgICAgICBkb3VibGVDbGlja1RpbWUgPSBub3c7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobm93IC0gY2xpY2tUaW1lIDwgNTAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgZG91YmxlIGNsaWNrIGluc2lkZSB0aGUgNTAwbXMgaW50ZXJ2YWwsIHVuZG8gcGxheWJhY2sgdG9nZ2xlIGFuZCB0b2dnbGUgZnVsbHNjcmVlbiBtb2RlXHJcbiAgICAgICAgICAgICAgICB0b2dnbGVGdWxsc2NyZWVuKCk7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVQbGF5YmFjaygpO1xyXG4gICAgICAgICAgICAgICAgZG91YmxlQ2xpY2tUaW1lID0gbm93O1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjbGlja1RpbWUgPSBub3c7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChEYXRlLm5vdygpIC0gZG91YmxlQ2xpY2tUaW1lID4gMjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm8gZG91YmxlIGNsaWNrIGRldGVjdGVkLCBzbyB3ZSB0b2dnbGUgcGxheWJhY2sgYW5kIHdhaXQgd2hhdCBoYXBwZW5zIG5leHRcclxuICAgICAgICAgICAgICAgICAgICB0b2dnbGVQbGF5YmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAyMDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBIaWRlIGJ1dHRvbiB3aGlsZSBpbml0aWFsaXppbmcgYSBDYXN0IHNlc3Npb25cclxuICAgICAgICBsZXQgY2FzdEluaXRpYWxpemF0aW9uSGFuZGxlciA9IGZ1bmN0aW9uIChldmVudDogUGxheWVyRXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LnR5cGUgPT09IGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJURUQpIHtcclxuICAgICAgICAgICAgICAgIC8vIEhpZGUgYnV0dG9uIHdoZW4gc2Vzc2lvbiBpcyBiZWluZyBpbml0aWFsaXplZFxyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTaG93IGJ1dHRvbiB3aGVuIHNlc3Npb24gaXMgZXN0YWJsaXNoZWQgb3IgaW5pdGlhbGl6YXRpb24gd2FzIGFib3J0ZWRcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1NUQVJURUQsIGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfTEFVTkNIRUQsIGNhc3RJbml0aWFsaXphdGlvbkhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfU1RPUFBFRCwgY2FzdEluaXRpYWxpemF0aW9uSGFuZGxlcik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBidXR0b25FbGVtZW50ID0gc3VwZXIudG9Eb21FbGVtZW50KCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBjaGlsZCB0aGF0IGNvbnRhaW5zIHRoZSBwbGF5IGJ1dHRvbiBpbWFnZVxyXG4gICAgICAgIC8vIFNldHRpbmcgdGhlIGltYWdlIGRpcmVjdGx5IG9uIHRoZSBidXR0b24gZG9lcyBub3Qgd29yayB0b2dldGhlciB3aXRoIHNjYWxpbmcgYW5pbWF0aW9ucywgYmVjYXVzZSB0aGUgYnV0dG9uXHJcbiAgICAgICAgLy8gY2FuIGNvdmVyIHRoZSB3aG9sZSB2aWRlbyBwbGF5ZXIgYXJlIGFuZCBzY2FsaW5nIHdvdWxkIGV4dGVuZCBpdCBiZXlvbmQuIEJ5IGFkZGluZyBhbiBpbm5lciBlbGVtZW50LCBjb25maW5lZFxyXG4gICAgICAgIC8vIHRvIHRoZSBzaXplIGlmIHRoZSBpbWFnZSwgaXQgY2FuIHNjYWxlIGluc2lkZSB0aGUgcGxheWVyIHdpdGhvdXQgb3ZlcnNob290aW5nLlxyXG4gICAgICAgIGJ1dHRvbkVsZW1lbnQuYXBwZW5kKG5ldyBET00oXCJkaXZcIiwge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMucHJlZml4Q3NzKFwiaW1hZ2VcIilcclxuICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIHJldHVybiBidXR0b25FbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0J1dHRvbkNvbmZpZywgQnV0dG9ufSBmcm9tIFwiLi9idXR0b25cIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFBsYXllckV2ZW50ID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRvIHBsYXkvcmVwbGF5IGEgdmlkZW8uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgSHVnZVJlcGxheUJ1dHRvbiBleHRlbmRzIEJ1dHRvbjxCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IEJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1odWdlcmVwbGF5YnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiUmVwbGF5XCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICB0aGlzLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcGxheWVyLnBsYXkoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgbGV0IGJ1dHRvbkVsZW1lbnQgPSBzdXBlci50b0RvbUVsZW1lbnQoKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIGNoaWxkIHRoYXQgY29udGFpbnMgdGhlIHBsYXkgYnV0dG9uIGltYWdlXHJcbiAgICAgICAgLy8gU2V0dGluZyB0aGUgaW1hZ2UgZGlyZWN0bHkgb24gdGhlIGJ1dHRvbiBkb2VzIG5vdCB3b3JrIHRvZ2V0aGVyIHdpdGggc2NhbGluZyBhbmltYXRpb25zLCBiZWNhdXNlIHRoZSBidXR0b25cclxuICAgICAgICAvLyBjYW4gY292ZXIgdGhlIHdob2xlIHZpZGVvIHBsYXllciBhcmUgYW5kIHNjYWxpbmcgd291bGQgZXh0ZW5kIGl0IGJleW9uZC4gQnkgYWRkaW5nIGFuIGlubmVyIGVsZW1lbnQsIGNvbmZpbmVkXHJcbiAgICAgICAgLy8gdG8gdGhlIHNpemUgaWYgdGhlIGltYWdlLCBpdCBjYW4gc2NhbGUgaW5zaWRlIHRoZSBwbGF5ZXIgd2l0aG91dCBvdmVyc2hvb3RpbmcuXHJcbiAgICAgICAgYnV0dG9uRWxlbWVudC5hcHBlbmQobmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5wcmVmaXhDc3MoXCJpbWFnZVwiKVxyXG4gICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1dHRvbkVsZW1lbnQ7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgRXZlbnQsIE5vQXJnc30gZnJvbSBcIi4uL2V2ZW50ZGlzcGF0Y2hlclwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBMYWJlbH0gY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMYWJlbENvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0IG9uIHRoZSBsYWJlbC5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgc2ltcGxlIHRleHQgbGFiZWwuXHJcbiAqXHJcbiAqIERPTSBleGFtcGxlOlxyXG4gKiA8Y29kZT5cclxuICogICAgIDxzcGFuIGNsYXNzPVwidWktbGFiZWxcIj4uLi5zb21lIHRleHQuLi48L3NwYW4+XHJcbiAqIDwvY29kZT5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBMYWJlbDxDb25maWcgZXh0ZW5kcyBMYWJlbENvbmZpZz4gZXh0ZW5kcyBDb21wb25lbnQ8TGFiZWxDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIGxhYmVsRXZlbnRzID0ge1xyXG4gICAgICAgIG9uQ2xpY2s6IG5ldyBFdmVudERpc3BhdGNoZXI8TGFiZWw8Q29uZmlnPiwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGFiZWxDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktbGFiZWxcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgdG9Eb21FbGVtZW50KCk6IERPTSB7XHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgbGFiZWxFbGVtZW50ID0gbmV3IERPTShcInNwYW5cIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpXHJcbiAgICAgICAgfSkuaHRtbCh0aGlzLmNvbmZpZy50ZXh0KTtcclxuXHJcbiAgICAgICAgbGFiZWxFbGVtZW50Lm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uQ2xpY2tFdmVudCgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gbGFiZWxFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRoZSB0ZXh0IG9uIHRoaXMgbGFiZWwuXHJcbiAgICAgKiBAcGFyYW0gdGV4dFxyXG4gICAgICovXHJcbiAgICBzZXRUZXh0KHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmh0bWwodGV4dCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIHRleHQgb24gdGhpcyBsYWJlbC5cclxuICAgICAqL1xyXG4gICAgY2xlYXJUZXh0KCkge1xyXG4gICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmh0bWwoXCJcIik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uQ2xpY2tFdmVudCgpIHtcclxuICAgICAgICB0aGlzLmxhYmVsRXZlbnRzLm9uQ2xpY2suZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGxhYmVsIGlzIGNsaWNrZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uQ2xpY2soKTogRXZlbnQ8TGFiZWw8TGFiZWxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbEV2ZW50cy5vbkNsaWNrLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge0V2ZW50RGlzcGF0Y2hlciwgRXZlbnR9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtBcnJheVV0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBBIG1hcCBvZiBpdGVtcyAoa2V5L3ZhbHVlIC0+IGxhYmVsfSBmb3IgYSB7QGxpbmsgTGlzdFNlbGVjdG9yfSBpbiBhIHtAbGluayBMaXN0U2VsZWN0b3JDb25maWd9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBMaXN0SXRlbSB7XHJcbiAgICBrZXk6IHN0cmluZztcclxuICAgIGxhYmVsOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgTGlzdFNlbGVjdG9yfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTGlzdFNlbGVjdG9yQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIGl0ZW1zPzogTGlzdEl0ZW1bXTtcclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpc3RTZWxlY3RvcjxDb25maWcgZXh0ZW5kcyBMaXN0U2VsZWN0b3JDb25maWc+IGV4dGVuZHMgQ29tcG9uZW50PExpc3RTZWxlY3RvckNvbmZpZz4ge1xyXG5cclxuICAgIHByb3RlY3RlZCBpdGVtczogTGlzdEl0ZW1bXTtcclxuICAgIHByb3RlY3RlZCBzZWxlY3RlZEl0ZW06IHN0cmluZztcclxuXHJcbiAgICBwcml2YXRlIGxpc3RTZWxlY3RvckV2ZW50cyA9IHtcclxuICAgICAgICBvbkl0ZW1BZGRlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPigpLFxyXG4gICAgICAgIG9uSXRlbVJlbW92ZWQ6IG5ldyBFdmVudERpc3BhdGNoZXI8TGlzdFNlbGVjdG9yPENvbmZpZz4sIHN0cmluZz4oKSxcclxuICAgICAgICBvbkl0ZW1TZWxlY3RlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGl0ZW1zOiBbXSxcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktbGlzdHNlbGVjdG9yXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuaXRlbXMgPSB0aGlzLmNvbmZpZy5pdGVtcztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEl0ZW1JbmRleChrZXk6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgZm9yIChsZXQgaW5kZXggaW4gdGhpcy5pdGVtcykge1xyXG4gICAgICAgICAgICBpZiAoa2V5ID09PSB0aGlzLml0ZW1zW2luZGV4XS5rZXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZUludChpbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzcGVjaWZpZWQgaXRlbSBpcyBwYXJ0IG9mIHRoaXMgc2VsZWN0b3IuXHJcbiAgICAgKiBAcGFyYW0ga2V5IHRoZSBrZXkgb2YgdGhlIGl0ZW0gdG8gY2hlY2tcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBpdGVtIGlzIHBhcnQgb2YgdGhpcyBzZWxlY3RvciwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBoYXNJdGVtKGtleTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SXRlbUluZGV4KGtleSkgPiAtMTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZHMgYW4gaXRlbSB0byB0aGlzIHNlbGVjdG9yIGJ5IGFwcGVuZGluZyBpdCB0byB0aGUgZW5kIG9mIHRoZSBsaXN0IG9mIGl0ZW1zLlxyXG4gICAgICogQHBhcmFtIGtleSB0aGUga2V5ICBvZiB0aGUgaXRlbSB0byBhZGRcclxuICAgICAqIEBwYXJhbSBsYWJlbCB0aGUgKGh1bWFuLXJlYWRhYmxlKSBsYWJlbCBvZiB0aGUgaXRlbSB0byBhZGRcclxuICAgICAqL1xyXG4gICAgYWRkSXRlbShrZXk6IHN0cmluZywgbGFiZWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuaXRlbXMucHVzaCh7a2V5OiBrZXksIGxhYmVsOiBsYWJlbH0pO1xyXG4gICAgICAgIHRoaXMub25JdGVtQWRkZWRFdmVudChrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbiBpdGVtIGZyb20gdGhpcyBzZWxlY3Rvci5cclxuICAgICAqIEBwYXJhbSBrZXkgdGhlIGtleSBvZiB0aGUgaXRlbSB0byByZW1vdmVcclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHJlbW92YWwgd2FzIHN1Y2Nlc3NmdWwsIGZhbHNlIGlmIHRoZSBpdGVtIGlzIG5vdCBwYXJ0IG9mIHRoaXMgc2VsZWN0b3JcclxuICAgICAqL1xyXG4gICAgcmVtb3ZlSXRlbShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KGtleSk7XHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgQXJyYXlVdGlscy5yZW1vdmUodGhpcy5pdGVtcywgdGhpcy5pdGVtc1tpbmRleF0pO1xyXG4gICAgICAgICAgICB0aGlzLm9uSXRlbVJlbW92ZWRFdmVudChrZXkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNlbGVjdHMgYW4gaXRlbSBmcm9tIHRoZSBpdGVtcyBpbiB0aGlzIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIGtleSB0aGUga2V5IG9mIHRoZSBpdGVtIHRvIHNlbGVjdFxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaXMgdGhlIHNlbGVjdGlvbiB3YXMgc3VjY2Vzc2Z1bCwgZmFsc2UgaWYgdGhlIHNlbGVjdGVkIGl0ZW0gaXMgbm90IHBhcnQgb2YgdGhlIHNlbGVjdG9yXHJcbiAgICAgKi9cclxuICAgIHNlbGVjdEl0ZW0oa2V5OiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoa2V5ID09PSB0aGlzLnNlbGVjdGVkSXRlbSkge1xyXG4gICAgICAgICAgICAvLyBpdGVtQ29uZmlnIGlzIGFscmVhZHkgc2VsZWN0ZWQsIHN1cHByZXNzIGFueSBmdXJ0aGVyIGFjdGlvblxyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuZ2V0SXRlbUluZGV4KGtleSk7XHJcblxyXG4gICAgICAgIGlmIChpbmRleCA+IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtID0ga2V5O1xyXG4gICAgICAgICAgICB0aGlzLm9uSXRlbVNlbGVjdGVkRXZlbnQoa2V5KTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBrZXkgb2YgdGhlIHNlbGVjdGVkIGl0ZW0uXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUga2V5IG9mIHRoZSBzZWxlY3RlZCBpdGVtIG9yIG51bGwgaWYgbm8gaXRlbSBpcyBzZWxlY3RlZFxyXG4gICAgICovXHJcbiAgICBnZXRTZWxlY3RlZEl0ZW0oKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRJdGVtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgaXRlbXMgZnJvbSB0aGlzIHNlbGVjdG9yLlxyXG4gICAgICovXHJcbiAgICBjbGVhckl0ZW1zKCkge1xyXG4gICAgICAgIGxldCBpdGVtcyA9IHRoaXMuaXRlbXM7IC8vIGxvY2FsIGNvcHkgZm9yIGl0ZXJhdGlvbiBhZnRlciBjbGVhclxyXG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTsgLy8gY2xlYXIgaXRlbXNcclxuXHJcbiAgICAgICAgLy8gZmlyZSBldmVudHNcclxuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIGl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25JdGVtUmVtb3ZlZEV2ZW50KGl0ZW0ua2V5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBudW1iZXIgb2YgaXRlbXMgaW4gdGhpcyBzZWxlY3Rvci5cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIGl0ZW1Db3VudCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLml0ZW1zKS5sZW5ndGg7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbUFkZGVkRXZlbnQoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1BZGRlZC5kaXNwYXRjaCh0aGlzLCBrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1SZW1vdmVkRXZlbnQoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1SZW1vdmVkLmRpc3BhdGNoKHRoaXMsIGtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbVNlbGVjdGVkRXZlbnQoa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmxpc3RTZWxlY3RvckV2ZW50cy5vbkl0ZW1TZWxlY3RlZC5kaXNwYXRjaCh0aGlzLCBrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGFuIGl0ZW0gaXMgYWRkZWQgdG8gdGhlIGxpc3Qgb2YgaXRlbXMuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uSXRlbUFkZGVkKCk6IEV2ZW50PExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtQWRkZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBhbiBpdGVtIGlzIHJlbW92ZWQgZnJvbSB0aGUgbGlzdCBvZiBpdGVtcy5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25JdGVtUmVtb3ZlZCgpOiBFdmVudDxMaXN0U2VsZWN0b3I8Q29uZmlnPiwgc3RyaW5nPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdFNlbGVjdG9yRXZlbnRzLm9uSXRlbVJlbW92ZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiBhbiBpdGVtIGlzIHNlbGVjdGVkIGZyb20gdGhlIGxpc3Qgb2YgaXRlbXMuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uSXRlbVNlbGVjdGVkKCk6IEV2ZW50PExpc3RTZWxlY3RvcjxDb25maWc+LCBzdHJpbmc+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5saXN0U2VsZWN0b3JFdmVudHMub25JdGVtU2VsZWN0ZWQuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWxlY3RCb3h9IGZyb20gXCIuL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge0xpc3RTZWxlY3RvckNvbmZpZ30gZnJvbSBcIi4vbGlzdHNlbGVjdG9yXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzZWxlY3QgYm94IHByb3ZpZGluZyBhIHNlbGVjdGlvbiBvZiBkaWZmZXJlbnQgcGxheWJhY2sgc3BlZWRzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFBsYXliYWNrU3BlZWRTZWxlY3RCb3ggZXh0ZW5kcyBTZWxlY3RCb3gge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogTGlzdFNlbGVjdG9yQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBzZWxmLmFkZEl0ZW0oXCIwLjI1XCIsIFwiMC4yNXhcIik7XHJcbiAgICAgICAgc2VsZi5hZGRJdGVtKFwiMC41XCIsIFwiMC41eFwiKTtcclxuICAgICAgICBzZWxmLmFkZEl0ZW0oXCIxXCIsIFwiTm9ybWFsXCIpO1xyXG4gICAgICAgIHNlbGYuYWRkSXRlbShcIjEuNVwiLCBcIjEuNXhcIik7XHJcbiAgICAgICAgc2VsZi5hZGRJdGVtKFwiMlwiLCBcIjJ4XCIpO1xyXG5cclxuICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oXCIxXCIpO1xyXG5cclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogUGxheWJhY2tTcGVlZFNlbGVjdEJveCwgdmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0UGxheWJhY2tTcGVlZChwYXJzZUZsb2F0KHZhbHVlKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7TGFiZWxDb25maWcsIExhYmVsfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbmV4cG9ydCBlbnVtIFRpbWVMYWJlbE1vZGUge1xyXG4gICAgQ3VycmVudFRpbWUsXHJcbiAgICBUb3RhbFRpbWUsXHJcbiAgICBDdXJyZW50QW5kVG90YWxUaW1lLFxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFBsYXliYWNrVGltZUxhYmVsQ29uZmlnIGV4dGVuZHMgTGFiZWxDb25maWcge1xyXG4gICAgdGltZUxhYmVsTW9kZT86IFRpbWVMYWJlbE1vZGU7XHJcbiAgICBoaWRlSW5MaXZlUGxheWJhY2s/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogQSBsYWJlbCB0aGF0IGRpc3BsYXkgdGhlIGN1cnJlbnQgcGxheWJhY2sgdGltZSBhbmQgdGhlIHRvdGFsIHRpbWUgdGhyb3VnaCB7QGxpbmsgUGxheWJhY2tUaW1lTGFiZWwjc2V0VGltZSBzZXRUaW1lfVxyXG4gKiBvciBhbnkgc3RyaW5nIHRocm91Z2gge0BsaW5rIFBsYXliYWNrVGltZUxhYmVsI3NldFRleHQgc2V0VGV4dH0uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGxheWJhY2tUaW1lTGFiZWwgZXh0ZW5kcyBMYWJlbDxQbGF5YmFja1RpbWVMYWJlbENvbmZpZz4ge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogUGxheWJhY2tUaW1lTGFiZWxDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIDxQbGF5YmFja1RpbWVMYWJlbENvbmZpZz57XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXBsYXliYWNrdGltZWxhYmVsXCIsXHJcbiAgICAgICAgICAgIHRpbWVMYWJlbE1vZGU6IFRpbWVMYWJlbE1vZGUuQ3VycmVudEFuZFRvdGFsVGltZSxcclxuICAgICAgICAgICAgaGlkZUluTGl2ZVBsYXliYWNrOiBmYWxzZSxcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IDxQbGF5YmFja1RpbWVMYWJlbENvbmZpZz5zZWxmLmdldENvbmZpZygpO1xyXG4gICAgICAgIGxldCBsaXZlID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGxpdmVDc3NDbGFzcyA9IHNlbGYucHJlZml4Q3NzKFwidWktcGxheWJhY2t0aW1lbGFiZWwtbGl2ZVwiKTtcclxuICAgICAgICBsZXQgbGl2ZUVkZ2VDc3NDbGFzcyA9IHNlbGYucHJlZml4Q3NzKFwidWktcGxheWJhY2t0aW1lbGFiZWwtbGl2ZS1lZGdlXCIpO1xyXG4gICAgICAgIGxldCBtaW5XaWR0aCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBsaXZlQ2xpY2tIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBwbGF5ZXIudGltZVNoaWZ0KDApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVMaXZlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFBsYXllciBpcyBwbGF5aW5nIGEgbGl2ZSBzdHJlYW0gd2hlbiB0aGUgZHVyYXRpb24gaXMgaW5maW5pdGVcclxuICAgICAgICAgICAgbGl2ZSA9IChwbGF5ZXIuZ2V0RHVyYXRpb24oKSA9PT0gSW5maW5pdHkpO1xyXG5cclxuICAgICAgICAgICAgLy8gQXR0YWNoL2RldGFjaCBsaXZlIG1hcmtlciBjbGFzc1xyXG4gICAgICAgICAgICBpZiAobGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3MobGl2ZUNzc0NsYXNzKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGV4dChcIkxpdmVcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlnLmhpZGVJbkxpdmVQbGF5YmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VsZi5vbkNsaWNrLnN1YnNjcmliZShsaXZlQ2xpY2tIYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUxpdmVUaW1lc2hpZnRTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3MobGl2ZUNzc0NsYXNzKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKGxpdmVFZGdlQ3NzQ2xhc3MpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uQ2xpY2sudW5zdWJzY3JpYmUobGl2ZUNsaWNrSGFuZGxlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsZXQgdXBkYXRlTGl2ZVRpbWVzaGlmdFN0YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmdldFRpbWVTaGlmdCgpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhsaXZlRWRnZUNzc0NsYXNzKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKGxpdmVFZGdlQ3NzQ2xhc3MpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHBsYXliYWNrVGltZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICgocGxheWVyLmdldER1cmF0aW9uKCkgPT09IEluZmluaXR5KSAhPT0gbGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlTGl2ZVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghbGl2ZSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZXRUaW1lKHBsYXllci5nZXRDdXJyZW50VGltZSgpLCBwbGF5ZXIuZ2V0RHVyYXRpb24oKSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRvIGF2b2lkIFwianVtcGluZ1wiIGluIHRoZSBVSSBieSB2YXJ5aW5nIGxhYmVsIHNpemVzIGR1ZSB0byBub24tbW9ub3NwYWNlZCBmb250cyxcclxuICAgICAgICAgICAgLy8gd2UgZ3JhZHVhbGx5IGluY3JlYXNlIHRoZSBtaW4td2lkdGggd2l0aCB0aGUgY29udGVudCB0byByZWFjaCBhIHN0YWJsZSBzaXplLlxyXG4gICAgICAgICAgICBsZXQgd2lkdGggPSBzZWxmLmdldERvbUVsZW1lbnQoKS53aWR0aCgpO1xyXG4gICAgICAgICAgICBpZiAod2lkdGggPiBtaW5XaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgbWluV2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJtaW4td2lkdGhcIjogbWluV2lkdGggKyBcInB4XCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUkVBRFksIHBsYXliYWNrVGltZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFS0VELCBwbGF5YmFja1RpbWVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1RJTUVfVVBEQVRFRCwgcGxheWJhY2tUaW1lSGFuZGxlcik7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfU0hJRlQsIHVwZGF0ZUxpdmVUaW1lc2hpZnRTdGF0ZSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9TSElGVEVELCB1cGRhdGVMaXZlVGltZXNoaWZ0U3RhdGUpO1xyXG5cclxuICAgICAgICAvLyBSZXNldCBtaW4td2lkdGggd2hlbiBhIG5ldyBzb3VyY2UgaXMgcmVhZHkgKGVzcGVjaWFsbHkgZm9yIHN3aXRjaGluZyBWT0QvTGl2ZSBtb2RlcyB3aGVyZSB0aGUgbGFiZWwgY29udGVudCBjaGFuZ2VzKVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIG1pbldpZHRoID0gMDtcclxuICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuY3NzKHtcclxuICAgICAgICAgICAgICAgIFwibWluLXdpZHRoXCI6IG51bGxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEluaXQgdGltZSBkaXNwbGF5ICh3aGVuIHRoZSBVSSBpcyBpbml0aWFsaXplZCwgaXQncyB0b28gbGF0ZSBmb3IgdGhlIE9OX1JFQURZIGV2ZW50KVxyXG4gICAgICAgIHBsYXliYWNrVGltZUhhbmRsZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGN1cnJlbnQgcGxheWJhY2sgdGltZSBhbmQgdG90YWwgZHVyYXRpb24uXHJcbiAgICAgKiBAcGFyYW0gcGxheWJhY2tTZWNvbmRzIHRoZSBjdXJyZW50IHBsYXliYWNrIHRpbWUgaW4gc2Vjb25kc1xyXG4gICAgICogQHBhcmFtIGR1cmF0aW9uU2Vjb25kcyB0aGUgdG90YWwgZHVyYXRpb24gaW4gc2Vjb25kc1xyXG4gICAgICovXHJcbiAgICBzZXRUaW1lKHBsYXliYWNrU2Vjb25kczogbnVtYmVyLCBkdXJhdGlvblNlY29uZHM6IG51bWJlcikge1xyXG4gICAgICAgIHN3aXRjaCAoKDxQbGF5YmFja1RpbWVMYWJlbENvbmZpZz50aGlzLmNvbmZpZykudGltZUxhYmVsTW9kZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbWVMYWJlbE1vZGUuQ3VycmVudFRpbWU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRleHQoYCR7U3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShwbGF5YmFja1NlY29uZHMpfWApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZUxhYmVsTW9kZS5Ub3RhbFRpbWU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRleHQoYCR7U3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShkdXJhdGlvblNlY29uZHMpfWApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgVGltZUxhYmVsTW9kZS5DdXJyZW50QW5kVG90YWxUaW1lOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRUZXh0KGAke1N0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUocGxheWJhY2tTZWNvbmRzKX0gLyAke1N0cmluZ1V0aWxzLnNlY29uZHNUb1RpbWUoZHVyYXRpb25TZWNvbmRzKX1gKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBQbGF5ZXJFdmVudCA9IGJpdG1vdmluLnBsYXllci5QbGF5ZXJFdmVudDtcclxuXHJcbi8qKlxyXG4gKiBBIGJ1dHRvbiB0aGF0IHRvZ2dsZXMgYmV0d2VlbiBwbGF5YmFjayBhbmQgcGF1c2UuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgUGxheWJhY2tUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktcGxheWJhY2t0b2dnbGVidXR0b25cIixcclxuICAgICAgICAgICAgdGV4dDogXCJQbGF5L1BhdXNlXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIsIGhhbmRsZUNsaWNrRXZlbnQ6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBpc1NlZWtpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgLy8gSGFuZGxlciB0byB1cGRhdGUgYnV0dG9uIHN0YXRlIGJhc2VkIG9uIHBsYXllciBzdGF0ZVxyXG4gICAgICAgIGxldCBwbGF5YmFja1N0YXRlSGFuZGxlciA9IGZ1bmN0aW9uIChldmVudDogUGxheWVyRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIFVJIGlzIGN1cnJlbnRseSBzZWVraW5nLCBwbGF5YmFjayBpcyB0ZW1wb3JhcmlseSBzdG9wcGVkIGJ1dCB0aGUgYnV0dG9ucyBzaG91bGRcclxuICAgICAgICAgICAgLy8gbm90IHJlZmxlY3QgdGhhdCBhbmQgc3RheSBhcy1pcyAoZS5nIGluZGljYXRlIHBsYXliYWNrIHdoaWxlIHNlZWtpbmcpLlxyXG4gICAgICAgICAgICBpZiAoaXNTZWVraW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE8gcmVwbGFjZSB0aGlzIGhhY2sgd2l0aCBhIHNvbGUgcGxheWVyLmlzUGxheWluZygpIGNhbGwgb25jZSBpc3N1ZSAjMTIwMyBpcyBmaXhlZFxyXG4gICAgICAgICAgICBsZXQgaXNQbGF5aW5nID0gcGxheWVyLmlzUGxheWluZygpO1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzQ2FzdGluZygpICYmIGV2ZW50ICYmXHJcbiAgICAgICAgICAgICAgICAoZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVkgfHwgZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVlcclxuICAgICAgICAgICAgICAgIHx8IGV2ZW50LnR5cGUgPT09IGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1BMQVlJTkcgfHwgZXZlbnQudHlwZSA9PT0gYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NBU1RfUEFVU0VEKSkge1xyXG4gICAgICAgICAgICAgICAgaXNQbGF5aW5nID0gIWlzUGxheWluZztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vbigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIENhbGwgaGFuZGxlciB1cG9uIHRoZXNlIGV2ZW50c1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BMQVksIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QQVVTRUQsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZQkFDS19GSU5JU0hFRCwgcGxheWJhY2tTdGF0ZUhhbmRsZXIpOyAvLyB3aGVuIHBsYXliYWNrIGZpbmlzaGVzLCBwbGF5ZXIgdHVybnMgdG8gcGF1c2VkIG1vZGVcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX0xBVU5DSEVELCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QTEFZSU5HLCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9QQVVTRUQsIHBsYXliYWNrU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9DQVNUX1BMQVlCQUNLX0ZJTklTSEVELCBwbGF5YmFja1N0YXRlSGFuZGxlcik7XHJcblxyXG4gICAgICAgIGlmIChoYW5kbGVDbGlja0V2ZW50KSB7XHJcbiAgICAgICAgICAgIC8vIENvbnRyb2wgcGxheWVyIGJ5IGJ1dHRvbiBldmVudHNcclxuICAgICAgICAgICAgLy8gV2hlbiBhIGJ1dHRvbiBldmVudCB0cmlnZ2VycyBhIHBsYXllciBBUEkgY2FsbCwgZXZlbnRzIGFyZSBmaXJlZCB3aGljaCBpbiB0dXJuIGNhbGwgdGhlIGV2ZW50IGhhbmRsZXJcclxuICAgICAgICAgICAgLy8gYWJvdmUgdGhhdCB1cGRhdGVkIHRoZSBidXR0b24gc3RhdGUuXHJcbiAgICAgICAgICAgIHNlbGYub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5pc1BsYXlpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5wYXVzZSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFRyYWNrIFVJIHNlZWtpbmcgc3RhdHVzXHJcbiAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHVpbWFuYWdlci5vblNlZWtlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU3RhcnR1cCBpbml0XHJcbiAgICAgICAgcGxheWJhY2tTdGF0ZUhhbmRsZXIobnVsbCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyQ29uZmlnLCBDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtVSU1hbmFnZXIsIFVJUmVjb21tZW5kYXRpb25Db25maWd9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IHtTdHJpbmdVdGlsc30gZnJvbSBcIi4uL3V0aWxzXCI7XHJcbmltcG9ydCB7SHVnZVJlcGxheUJ1dHRvbn0gZnJvbSBcIi4vaHVnZXJlcGxheWJ1dHRvblwiO1xyXG5cclxuLyoqXHJcbiAqIE92ZXJsYXlzIHRoZSBwbGF5ZXIgYW5kIGRpc3BsYXlzIHJlY29tbWVuZGVkIHZpZGVvcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBSZWNvbW1lbmRhdGlvbk92ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSByZXBsYXlCdXR0b246IEh1Z2VSZXBsYXlCdXR0b247XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb250YWluZXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMucmVwbGF5QnV0dG9uID0gbmV3IEh1Z2VSZXBsYXlCdXR0b24oKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1yZWNvbW1lbmRhdGlvbi1vdmVybGF5XCIsXHJcbiAgICAgICAgICAgIGhpZGRlbjogdHJ1ZSxcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMucmVwbGF5QnV0dG9uXVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMTtcclxuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIHVpbWFuYWdlci5nZXRDb25maWcoKS5yZWNvbW1lbmRhdGlvbnMpIHtcclxuICAgICAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmV3IFJlY29tbWVuZGF0aW9uSXRlbSh7XHJcbiAgICAgICAgICAgICAgICBpdGVtQ29uZmlnOiBpdGVtLFxyXG4gICAgICAgICAgICAgICAgY3NzQ2xhc3NlczogW1wicmVjb21tZW5kYXRpb24taXRlbS1cIiArIChpbmRleCsrKV1cclxuICAgICAgICAgICAgfSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZUNvbXBvbmVudHMoKTsgLy8gY3JlYXRlIGNvbnRhaW5lciBET00gZWxlbWVudHNcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSByZWNvbW1lbmRhdGlvbnMgd2hlbiBwbGF5YmFjayBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZQkFDS19GSU5JU0hFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBEaXNtaXNzIE9OX1BMQVlCQUNLX0ZJTklTSEVEIGV2ZW50cyBhdCB0aGUgZW5kIG9mIGFkc1xyXG4gICAgICAgICAgICAvLyBUT0RPIHJlbW92ZSB0aGlzIHdvcmthcm91bmQgb25jZSBpc3N1ZSAjMTI3OCBpcyBzb2x2ZWRcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc0FkKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gSGlkZSByZWNvbW1lbmRhdGlvbnMgd2hlbiBwbGF5YmFjayBzdGFydHMsIGUuZy4gYSByZXN0YXJ0XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFJlY29tbWVuZGF0aW9uSXRlbX1cclxuICovXHJcbmludGVyZmFjZSBSZWNvbW1lbmRhdGlvbkl0ZW1Db25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgaXRlbUNvbmZpZzogVUlSZWNvbW1lbmRhdGlvbkNvbmZpZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEFuIGl0ZW0gb2YgdGhlIHtAbGluayBSZWNvbW1lbmRhdGlvbk92ZXJsYXl9LiBVc2VkIG9ubHkgaW50ZXJuYWxseSBpbiB7QGxpbmsgUmVjb21tZW5kYXRpb25PdmVybGF5fS5cclxuICovXHJcbmNsYXNzIFJlY29tbWVuZGF0aW9uSXRlbSBleHRlbmRzIENvbXBvbmVudDxSZWNvbW1lbmRhdGlvbkl0ZW1Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFJlY29tbWVuZGF0aW9uSXRlbUNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktcmVjb21tZW5kYXRpb24taXRlbVwiLFxyXG4gICAgICAgICAgICBpdGVtQ29uZmlnOiBudWxsIC8vIHRoaXMgbXVzdCBiZSBwYXNzZWQgaW4gZnJvbSBvdXRzaWRlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgY29uZmlnID0gKDxSZWNvbW1lbmRhdGlvbkl0ZW1Db25maWc+dGhpcy5jb25maWcpLml0ZW1Db25maWc7IC8vIFRPRE8gZml4IGdlbmVyaWNzIGFuZCBnZXQgcmlkIG9mIGNhc3RcclxuXHJcbiAgICAgICAgbGV0IGl0ZW1FbGVtZW50ID0gbmV3IERPTShcImFcIiwge1xyXG4gICAgICAgICAgICBcImlkXCI6IHRoaXMuY29uZmlnLmlkLFxyXG4gICAgICAgICAgICBcImNsYXNzXCI6IHRoaXMuZ2V0Q3NzQ2xhc3NlcygpLFxyXG4gICAgICAgICAgICBcImhyZWZcIjogY29uZmlnLnVybFxyXG4gICAgICAgIH0pLmNzcyh7XCJiYWNrZ3JvdW5kLWltYWdlXCI6IGB1cmwoJHtjb25maWcudGh1bWJuYWlsfSlgfSk7XHJcblxyXG4gICAgICAgIGxldCBiZ0VsZW1lbnQgPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImJhY2tncm91bmRcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGl0ZW1FbGVtZW50LmFwcGVuZChiZ0VsZW1lbnQpO1xyXG5cclxuICAgICAgICBsZXQgdGl0bGVFbGVtZW50ID0gbmV3IERPTShcInNwYW5cIiwge1xyXG4gICAgICAgICAgICBcImNsYXNzXCI6IFwidGl0bGVcIlxyXG4gICAgICAgIH0pLmFwcGVuZChuZXcgRE9NKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJpbm5lcnRpdGxlXCJcclxuICAgICAgICB9KS5odG1sKGNvbmZpZy50aXRsZSkpO1xyXG4gICAgICAgIGl0ZW1FbGVtZW50LmFwcGVuZCh0aXRsZUVsZW1lbnQpO1xyXG5cclxuICAgICAgICBsZXQgdGltZUVsZW1lbnQgPSBuZXcgRE9NKFwic3BhblwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogXCJkdXJhdGlvblwiXHJcbiAgICAgICAgfSkuYXBwZW5kKG5ldyBET00oXCJzcGFuXCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiBcImlubmVyZHVyYXRpb25cIlxyXG4gICAgICAgIH0pLmh0bWwoU3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShjb25maWcuZHVyYXRpb24pKSk7XHJcbiAgICAgICAgaXRlbUVsZW1lbnQuYXBwZW5kKHRpbWVFbGVtZW50KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGl0ZW1FbGVtZW50O1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbXBvbmVudCwgQ29tcG9uZW50Q29uZmlnfSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuaW1wb3J0IHtFdmVudCwgRXZlbnREaXNwYXRjaGVyLCBOb0FyZ3N9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtTZWVrQmFyTGFiZWx9IGZyb20gXCIuL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1RpbWVvdXR9IGZyb20gXCIuLi90aW1lb3V0XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgU2Vla0Jhcn0gY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBTZWVrQmFyQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxhYmVsIGFib3ZlIHRoZSBzZWVrIHBvc2l0aW9uLlxyXG4gICAgICovXHJcbiAgICBsYWJlbD86IFNlZWtCYXJMYWJlbDtcclxuICAgIC8qKlxyXG4gICAgICogQmFyIHdpbGwgYmUgdmVydGljYWwgaW5zdGVhZCBvZiBob3Jpem9udGFsIGlmIHNldCB0byB0cnVlLlxyXG4gICAgICovXHJcbiAgICB2ZXJ0aWNhbD86IGJvb2xlYW47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFdmVudCBhcmd1bWVudCBpbnRlcmZhY2UgZm9yIGEgc2VlayBwcmV2aWV3IGV2ZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBTZWVrUHJldmlld0V2ZW50QXJncyBleHRlbmRzIE5vQXJncyB7XHJcbiAgICAvKipcclxuICAgICAqIFRlbGxzIGlmIHRoZSBzZWVrIHByZXZpZXcgZXZlbnQgY29tZXMgZnJvbSBhIHNjcnViYmluZy5cclxuICAgICAqL1xyXG4gICAgc2NydWJiaW5nOiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGltZWxpbmUgcG9zaXRpb24gaW4gcGVyY2VudCB3aGVyZSB0aGUgZXZlbnQgb3JpZ2luYXRlcyBmcm9tLlxyXG4gICAgICovXHJcbiAgICBwb3NpdGlvbjogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQSBzZWVrIGJhciB0byBzZWVrIHdpdGhpbiB0aGUgcGxheWVyJ3MgbWVkaWEuIEl0IGRpc3BsYXlzIHRoZSBjdXJyZW50IHBsYXliYWNrIHBvc2l0aW9uLCBhbW91bnQgb2YgYnVmZmVkIGRhdGEsIHNlZWtcclxuICogdGFyZ2V0LCBhbmQga2VlcHMgc3RhdHVzIGFib3V0IGFuIG9uZ29pbmcgc2Vlay5cclxuICpcclxuICogVGhlIHNlZWsgYmFyIGRpc3BsYXlzIGRpZmZlcmVudCBcImJhcnNcIjpcclxuICogIC0gdGhlIHBsYXliYWNrIHBvc2l0aW9uLCBpLmUuIHRoZSBwb3NpdGlvbiBpbiB0aGUgbWVkaWEgYXQgd2hpY2ggdGhlIHBsYXllciBjdXJyZW50IHBsYXliYWNrIHBvaW50ZXIgaXMgcG9zaXRpb25lZFxyXG4gKiAgLSB0aGUgYnVmZmVyIHBvc2l0aW9uLCB3aGljaCB1c3VhbGx5IGlzIHRoZSBwbGF5YmFjayBwb3NpdGlvbiBwbHVzIHRoZSB0aW1lIHNwYW4gdGhhdCBpcyBhbHJlYWR5IGJ1ZmZlcmVkIGFoZWFkXHJcbiAqICAtIHRoZSBzZWVrIHBvc2l0aW9uLCB1c2VkIHRvIHByZXZpZXcgdG8gd2hlcmUgaW4gdGhlIHRpbWVsaW5lIGEgc2VlayB3aWxsIGp1bXAgdG9cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZWVrQmFyIGV4dGVuZHMgQ29tcG9uZW50PFNlZWtCYXJDb25maWc+IHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBDU1MgY2xhc3MgdGhhdCBpcyBhZGRlZCB0byB0aGUgRE9NIGVsZW1lbnQgd2hpbGUgdGhlIHNlZWsgYmFyIGlzIGluIFwic2Vla2luZ1wiIHN0YXRlLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBDTEFTU19TRUVLSU5HID0gXCJzZWVraW5nXCI7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWVrQmFyOiBET007XHJcbiAgICBwcml2YXRlIHNlZWtCYXJQbGF5YmFja1Bvc2l0aW9uOiBET007XHJcbiAgICBwcml2YXRlIHNlZWtCYXJCdWZmZXJQb3NpdGlvbjogRE9NO1xyXG4gICAgcHJpdmF0ZSBzZWVrQmFyU2Vla1Bvc2l0aW9uOiBET007XHJcbiAgICBwcml2YXRlIHNlZWtCYXJCYWNrZHJvcDogRE9NO1xyXG5cclxuICAgIHByaXZhdGUgbGFiZWw6IFNlZWtCYXJMYWJlbDtcclxuXHJcbiAgICAvLyBodHRwczovL2hhY2tzLm1vemlsbGEub3JnLzIwMTMvMDQvZGV0ZWN0aW5nLXRvdWNoLWl0cy10aGUtd2h5LW5vdC10aGUtaG93L1xyXG4gICAgcHJpdmF0ZSB0b3VjaFN1cHBvcnRlZCA9IChcIm9udG91Y2hzdGFydFwiIGluIHdpbmRvdyk7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWVrQmFyRXZlbnRzID0ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBvcGVyYXRpb24gaXMgc3RhcnRlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWs6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVkIGR1cmluZyBhIHNjcnViYmluZyBzZWVrIHRvIGluZGljYXRlIHRoYXQgdGhlIHNlZWsgcHJldmlldyAoaS5lLiB0aGUgdmlkZW8gZnJhbWUpIHNob3VsZCBiZSB1cGRhdGVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla1ByZXZpZXc6IG5ldyBFdmVudERpc3BhdGNoZXI8U2Vla0JhciwgU2Vla1ByZXZpZXdFdmVudEFyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZWQgd2hlbiBhIHNjcnViYmluZyBzZWVrIGhhcyBmaW5pc2hlZCBvciB3aGVuIGEgZGlyZWN0IHNlZWsgaXMgaXNzdWVkLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2Vla2VkOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIG51bWJlcj4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktc2Vla2JhclwiXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gdGhpcy5jb25maWcubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZSgpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5pbml0aWFsaXplKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhhc0xhYmVsKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5nZXRMYWJlbCgpLmluaXRpYWxpemUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIsIGNvbmZpZ3VyZVNlZWs6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgaWYgKCFjb25maWd1cmVTZWVrKSB7XHJcbiAgICAgICAgICAgIC8vIFRoZSBjb25maWd1cmVTZWVrIGZsYWcgY2FuIGJlIHVzZWQgYnkgc3ViY2xhc3NlcyB0byBkaXNhYmxlIGNvbmZpZ3VyYXRpb24gYXMgc2VlayBiYXIuIEUuZy4gdGhlIHZvbHVtZVxyXG4gICAgICAgICAgICAvLyBzbGlkZXIgaXMgcmV1c2luZyB0aGlzIGNvbXBvbmVudCBidXQgYWRkcyBpdHMgb3duIGZ1bmN0aW9uYWxpdHksIGFuZCBkb2VzIG5vdCBuZWVkIHRoZSBzZWVrIGZ1bmN0aW9uYWxpdHkuXHJcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYWN0dWFsbHkgYSBoYWNrLCB0aGUgcHJvcGVyIHNvbHV0aW9uIHdvdWxkIGJlIGZvciBib3RoIHNlZWsgYmFyIGFuZCB2b2x1bWUgc2xpZGVycyB0byBleHRlbmRcclxuICAgICAgICAgICAgLy8gYSBjb21tb24gYmFzZSBzbGlkZXIgY29tcG9uZW50IGFuZCBpbXBsZW1lbnQgdGhlaXIgZnVuY3Rpb25hbGl0eSB0aGVyZS5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGxldCBwbGF5YmFja05vdEluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICBsZXQgaXNQbGF5aW5nID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IGlzU2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgcGxheWJhY2sgYW5kIGJ1ZmZlciBwb3NpdGlvbnNcclxuICAgICAgICBsZXQgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIE9uY2UgdGhpcyBoYW5kbGVyIG9zIGNhbGxlZCwgcGxheWJhY2sgaGFzIGJlZW4gc3RhcnRlZCBhbmQgd2Ugc2V0IHRoZSBmbGFnIHRvIGZhbHNlXHJcbiAgICAgICAgICAgIHBsYXliYWNrTm90SW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpc1NlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGNhdWdodCBhIHNlZWsgcHJldmlldyBzZWVrLCBkbyBub3QgdXBkYXRlIHRoZSBzZWVrYmFyXHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNMaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0TWF4VGltZVNoaWZ0KCkgPT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGNhc2UgbXVzdCBiZSBleHBsaWNpdGx5IGhhbmRsZWQgdG8gYXZvaWQgZGl2aXNpb24gYnkgemVyb1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbigxMDApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlID0gMTAwIC0gKDEwMCAvIHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIHBsYXllci5nZXRUaW1lU2hpZnQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBbHdheXMgc2hvdyBmdWxsIGJ1ZmZlciBmb3IgbGl2ZSBzdHJlYW1zXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldEJ1ZmZlclBvc2l0aW9uKDEwMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBXZSBkbyBub3QgdXBkYXRlIHRoZSBwbGF5YmFjayBwb3NpdGlvbiBoZXJlIGJlY2F1c2Ugd2UgbWFpbnRhaW4gb3VyIG93biBsb2NhbFxyXG4gICAgICAgICAgICAgICAgLy8gcGxheWJhY2sgcG9zaXRpb24gdXBkYXRlIGhhbmRsaW5nIGluIHRoZSBUaW1lb3V0IGJlbG93XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXliYWNrUG9zaXRpb25QZXJjZW50YWdlID0gMTAwIC8gcGxheWVyLmdldER1cmF0aW9uKCkgKiBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgICAgICAgICAgICAgIGxldCBidWZmZXJQZXJjZW50YWdlID0gMTAwIC8gcGxheWVyLmdldER1cmF0aW9uKCkgKiBwbGF5ZXIuZ2V0VmlkZW9CdWZmZXJMZW5ndGgoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UgKyBidWZmZXJQZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFJlc2V0IGZsYWcgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgICAgIHBsYXliYWNrTm90SW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgc2Vla2JhciB1cG9uIHRoZXNlIGV2ZW50c1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1RJTUVfQ0hBTkdFRCwgcGxheWJhY2tQb3NpdGlvbkhhbmRsZXIpOyAvLyB1cGRhdGUgcGxheWJhY2sgcG9zaXRpb24gd2hlbiBpdCBjaGFuZ2VzXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1RBTExfRU5ERUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIGJ1ZmZlcmxldmVsIHdoZW4gYnVmZmVyaW5nIGlzIGNvbXBsZXRlXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VFS0VELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBwbGF5YmFjayBwb3NpdGlvbiB3aGVuIGEgc2VlayBoYXMgZmluaXNoZWRcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZURUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIHBsYXliYWNrIHBvc2l0aW9uIHdoZW4gYSB0aW1lc2hpZnQgaGFzIGZpbmlzaGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU0VHTUVOVF9SRVFVRVNUX0ZJTklTSEVELCBwbGF5YmFja1Bvc2l0aW9uSGFuZGxlcik7IC8vIHVwZGF0ZSBidWZmZXJsZXZlbCB3aGVuIGEgc2VnbWVudCBoYXMgYmVlbiBkb3dubG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQ0FTVF9USU1FX1VQREFURUQsIHBsYXliYWNrUG9zaXRpb25IYW5kbGVyKTsgLy8gdXBkYXRlIHBsYXliYWNrIHBvc2l0aW9uIG9mIENhc3QgcGxheWJhY2tcclxuXHJcblxyXG4gICAgICAgIC8vIFBsYXliYWNrIHBvc2l0aW9uIHVwZGF0ZVxyXG4gICAgICAgIC8vIFdlIGRvIG5vdCB1cGRhdGUgdGhlIHBvc2l0aW9uIGRpcmVjdGx5IGZyb20gdGhlIE9OX1RJTUVfQ0hBTkdFRCBldmVudCwgYmVjYXVzZSBpdCBhcnJpdmVzIHZlcnkgaml0dGVyeSBhbmRcclxuICAgICAgICAvLyByZXN1bHRzIGluIGEgaml0dGVyeSBwb3NpdGlvbiBpbmRpY2F0b3Igc2luY2UgdGhlIENTUyB0cmFuc2l0aW9uIHRpbWUgaXMgc3RhdGljYWxseSBzZXQuXHJcbiAgICAgICAgLy8gVG8gd29yayBhcm91bmQgdGhpcyBpc3N1ZSwgd2UgbWFpbnRhaW4gYSBsb2NhbCBwbGF5YmFjayBwb3NpdGlvbiB0aGF0IGlzIHVwZGF0ZWQgaW4gYSBzdGFibGUgcmVndWxhciBpbnRlcnZhbFxyXG4gICAgICAgIC8vIGFuZCBrZXB0IGluIHN5bmMgd2l0aCB0aGUgcGxheWVyLlxyXG4gICAgICAgIGxldCBjdXJyZW50VGltZVNlZWtCYXIgPSAwO1xyXG4gICAgICAgIGxldCBjdXJyZW50VGltZVBsYXllciA9IDA7XHJcbiAgICAgICAgbGV0IHVwZGF0ZUludGVydmFsTXMgPSAxMDA7XHJcbiAgICAgICAgbGV0IGN1cnJlbnRUaW1lVXBkYXRlRGVsdGFTZWNzID0gdXBkYXRlSW50ZXJ2YWxNcyAvIDEwMDA7XHJcblxyXG4gICAgICAgIGxldCBzbW9vdGhQbGF5YmFja1Bvc2l0aW9uVXBkYXRlciA9IG5ldyBUaW1lb3V0KHVwZGF0ZUludGVydmFsTXMsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgY3VycmVudFRpbWVTZWVrQmFyICs9IGN1cnJlbnRUaW1lVXBkYXRlRGVsdGFTZWNzO1xyXG4gICAgICAgICAgICBjdXJyZW50VGltZVBsYXllciA9IHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gU3luYyBjdXJyZW50VGltZSBvZiBzZWVrYmFyIHRvIHBsYXllclxyXG4gICAgICAgICAgICBsZXQgY3VycmVudFRpbWVEZWx0YSA9IGN1cnJlbnRUaW1lU2Vla0JhciAtIGN1cnJlbnRUaW1lUGxheWVyO1xyXG4gICAgICAgICAgICAvLyBJZiBjdXJyZW50VGltZURlbHRhIGlzIG5lZ2F0aXZlIGFuZCBiZWxvdyB0aGUgYWRqdXN0bWVudCB0aHJlc2hvbGQsXHJcbiAgICAgICAgICAgIC8vIHRoZSBwbGF5ZXIgaXMgYWhlYWQgb2YgdGhlIHNlZWtiYXIgYW5kIHdlIFwiZmFzdCBmb3J3YXJkXCIgdGhlIHNlZWtiYXJcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnRUaW1lRGVsdGEgPD0gLWN1cnJlbnRUaW1lVXBkYXRlRGVsdGFTZWNzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VGltZVNlZWtCYXIgKz0gY3VycmVudFRpbWVVcGRhdGVEZWx0YVNlY3M7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSWYgY3VycmVudFRpbWVEZWx0YSBpcyBwb3NpdGl2ZSBhbmQgYWJvdmUgdGhlIGFkanVzdG1lbnQgdGhyZXNob2xkLFxyXG4gICAgICAgICAgICAvLyB0aGUgcGxheWVyIGlzIGJlaGluZCB0aGUgc2Vla2JhciBhbmQgd2UgXCJyZXdpbmRcIiB0aGUgc2Vla2JhclxyXG4gICAgICAgICAgICBlbHNlIGlmIChjdXJyZW50VGltZURlbHRhID49IGN1cnJlbnRUaW1lVXBkYXRlRGVsdGFTZWNzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VGltZVNlZWtCYXIgLT0gY3VycmVudFRpbWVVcGRhdGVEZWx0YVNlY3M7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBwbGF5YmFja1Bvc2l0aW9uUGVyY2VudGFnZSA9IDEwMCAvIHBsYXllci5nZXREdXJhdGlvbigpICogY3VycmVudFRpbWVTZWVrQmFyO1xyXG4gICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24ocGxheWJhY2tQb3NpdGlvblBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0sIHRydWUpO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QTEFZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmICghcGxheWVyLmlzTGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50VGltZVNlZWtCYXIgPSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKTtcclxuICAgICAgICAgICAgICAgIHNtb290aFBsYXliYWNrUG9zaXRpb25VcGRhdGVyLnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9QQVVTRUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc21vb3RoUGxheWJhY2tQb3NpdGlvblVwZGF0ZXIuY2xlYXIoKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIFNlZWsgaGFuZGxpbmdcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLRUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZULCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyh0cnVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9USU1FX1NISUZURUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVraW5nKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHNlZWsgPSBmdW5jdGlvbiAocGVyY2VudGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNMaXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci50aW1lU2hpZnQocGxheWVyLmdldE1heFRpbWVTaGlmdCgpIC0gKHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIChwZXJjZW50YWdlIC8gMTAwKSkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnNlZWsocGxheWVyLmdldER1cmF0aW9uKCkgKiAocGVyY2VudGFnZSAvIDEwMCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLm9uU2Vlay5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcikge1xyXG4gICAgICAgICAgICBpc1NlZWtpbmcgPSB0cnVlOyAvLyB0cmFjayBzZWVraW5nIHN0YXR1cyBzbyB3ZSBjYW4gY2F0Y2ggZXZlbnRzIGZyb20gc2VlayBwcmV2aWV3IHNlZWtzXHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZnkgVUkgbWFuYWdlciBvZiBzdGFydGVkIHNlZWtcclxuICAgICAgICAgICAgdWltYW5hZ2VyLm9uU2Vlay5kaXNwYXRjaChzZW5kZXIpO1xyXG5cclxuICAgICAgICAgICAgLy8gU2F2ZSBjdXJyZW50IHBsYXliYWNrIHN0YXRlXHJcbiAgICAgICAgICAgIGlzUGxheWluZyA9IHBsYXllci5pc1BsYXlpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFBhdXNlIHBsYXliYWNrIHdoaWxlIHNlZWtpbmdcclxuICAgICAgICAgICAgaWYgKGlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXI6IFNlZWtCYXIsIGFyZ3M6IFNlZWtQcmV2aWV3RXZlbnRBcmdzKSB7XHJcbiAgICAgICAgICAgIC8vIE5vdGlmeSBVSSBtYW5hZ2VyIG9mIHNlZWsgcHJldmlld1xyXG4gICAgICAgICAgICB1aW1hbmFnZXIub25TZWVrUHJldmlldy5kaXNwYXRjaChzZW5kZXIsIGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYub25TZWVrUHJldmlldy5zdWJzY3JpYmVSYXRlTGltaXRlZChmdW5jdGlvbiAoc2VuZGVyOiBTZWVrQmFyLCBhcmdzOiBTZWVrUHJldmlld0V2ZW50QXJncykge1xyXG4gICAgICAgICAgICAvLyBSYXRlLWxpbWl0ZWQgc2NydWJiaW5nIHNlZWtcclxuICAgICAgICAgICAgaWYgKGFyZ3Muc2NydWJiaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBzZWVrKGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgICAgICBzZWxmLm9uU2Vla2VkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBwZXJjZW50YWdlKSB7XHJcbiAgICAgICAgICAgIGlzU2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgcGxheWJhY2sgaGFzIG5vdCBiZWVuIHN0YXJ0ZWQgYmVmb3JlLCB3ZSBuZWVkIHRvIGNhbGwgcGxheSB0byBpbiBpdCB0aGUgcGxheWJhY2sgZW5naW5lIGZvciB0aGVcclxuICAgICAgICAgICAgLy8gc2VlayB0byB3b3JrLiBXZSBjYWxsIHBhdXNlKCkgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkcyBiZWNhdXNlIHdlIGFjdHVhbGx5IGRvIG5vdCB3YW50IHRvIHBsYXkgYmFjayBhbnl0aGluZy5cclxuICAgICAgICAgICAgLy8gVGhlIGZsYWcgc2VydmVzIHRvIGNhbGwgcGxheS9wYXVzZSBvbmx5IG9uIHRoZSBmaXJzdCBzZWVrIGJlZm9yZSBwbGF5YmFjayBoYXMgc3RhcnRlZCwgaW5zdGVhZCBvZiBldmVyeVxyXG4gICAgICAgICAgICAvLyB0aW1lIGEgc2VlayBpcyBpc3N1ZWQuXHJcbiAgICAgICAgICAgIGlmIChwbGF5YmFja05vdEluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5YmFja05vdEluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICAgICAgcGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIERvIHRoZSBzZWVrXHJcbiAgICAgICAgICAgIHNlZWsocGVyY2VudGFnZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBDb250aW51ZSBwbGF5YmFjayBhZnRlciBzZWVrIGlmIHBsYXllciB3YXMgcGxheWluZyB3aGVuIHNlZWsgc3RhcnRlZFxyXG4gICAgICAgICAgICBpZiAoaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIucGxheSgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBOb3RpZnkgVUkgbWFuYWdlciBvZiBmaW5pc2hlZCBzZWVrXHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vblNlZWtlZC5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAoc2VsZi5oYXNMYWJlbCgpKSB7XHJcbiAgICAgICAgICAgIC8vIENvbmZpZ3VyZSBhIHNlZWtiYXIgbGFiZWwgdGhhdCBpcyBpbnRlcm5hbCB0byB0aGUgc2Vla2JhcilcclxuICAgICAgICAgICAgc2VsZi5nZXRMYWJlbCgpLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBIaWRlIHNlZWtiYXIgZm9yIGxpdmUgc291cmNlcyB3aXRob3V0IHRpbWVzaGlmdFxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNMaXZlKCkgJiYgcGxheWVyLmdldE1heFRpbWVTaGlmdCgpID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpZy5jc3NDbGFzc2VzLnB1c2goXCJ2ZXJ0aWNhbFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzZWVrQmFyQ29udGFpbmVyID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgbGV0IHNlZWtCYXIgPSBuZXcgRE9NKFwiZGl2XCIsIHtcclxuICAgICAgICAgICAgXCJjbGFzc1wiOiB0aGlzLnByZWZpeENzcyhcInNlZWtiYXJcIilcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnNlZWtCYXIgPSBzZWVrQmFyO1xyXG5cclxuICAgICAgICAvLyBJbmRpY2F0b3IgdGhhdCBzaG93cyB0aGUgYnVmZmVyIGZpbGwgbGV2ZWxcclxuICAgICAgICBsZXQgc2Vla0JhckJ1ZmZlckxldmVsID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5wcmVmaXhDc3MoXCJzZWVrYmFyLWJ1ZmZlcmxldmVsXCIpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyQnVmZmVyUG9zaXRpb24gPSBzZWVrQmFyQnVmZmVyTGV2ZWw7XHJcblxyXG4gICAgICAgIC8vIEluZGljYXRvciB0aGF0IHNob3dzIHRoZSBjdXJyZW50IHBsYXliYWNrIHBvc2l0aW9uXHJcbiAgICAgICAgbGV0IHNlZWtCYXJQbGF5YmFja1Bvc2l0aW9uID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5wcmVmaXhDc3MoXCJzZWVrYmFyLXBsYXliYWNrcG9zaXRpb25cIilcclxuICAgICAgICB9KS5hcHBlbmQobmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5wcmVmaXhDc3MoXCJzZWVrYmFyLXBsYXliYWNrcG9zaXRpb24tbWFya2VyXCIpXHJcbiAgICAgICAgfSkpO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhclBsYXliYWNrUG9zaXRpb24gPSBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbjtcclxuXHJcbiAgICAgICAgLy8gSW5kaWNhdG9yIHRoYXQgc2hvdyB3aGVyZSBhIHNlZWsgd2lsbCBnbyB0b1xyXG4gICAgICAgIGxldCBzZWVrQmFyU2Vla1Bvc2l0aW9uID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5wcmVmaXhDc3MoXCJzZWVrYmFyLXNlZWtwb3NpdGlvblwiKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuc2Vla0JhclNlZWtQb3NpdGlvbiA9IHNlZWtCYXJTZWVrUG9zaXRpb247XHJcblxyXG4gICAgICAgIC8vIEluZGljYXRvciB0aGF0IHNob3dzIHRoZSBmdWxsIHNlZWtiYXJcclxuICAgICAgICBsZXQgc2Vla0JhckJhY2tkcm9wID0gbmV3IERPTShcImRpdlwiLCB7XHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5wcmVmaXhDc3MoXCJzZWVrYmFyLWJhY2tkcm9wXCIpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyQmFja2Ryb3AgPSBzZWVrQmFyQmFja2Ryb3A7XHJcblxyXG4gICAgICAgIHNlZWtCYXIuYXBwZW5kKHNlZWtCYXJCYWNrZHJvcCwgc2Vla0JhckJ1ZmZlckxldmVsLCBzZWVrQmFyU2Vla1Bvc2l0aW9uLCBzZWVrQmFyUGxheWJhY2tQb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgc2Vla2luZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAvLyBEZWZpbmUgaGFuZGxlciBmdW5jdGlvbnMgc28gd2UgY2FuIGF0dGFjaC9yZW1vdmUgdGhlbSBsYXRlclxyXG4gICAgICAgIGxldCBtb3VzZVRvdWNoTW92ZUhhbmRsZXIgPSBmdW5jdGlvbiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGlvbiB0byBWUiBoYW5kbGVyXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGFyZ2V0UGVyY2VudGFnZSA9IDEwMCAqIHNlbGYuZ2V0T2Zmc2V0KGUpO1xyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtQb3NpdGlvbih0YXJnZXRQZXJjZW50YWdlKTtcclxuICAgICAgICAgICAgc2VsZi5zZXRQbGF5YmFja1Bvc2l0aW9uKHRhcmdldFBlcmNlbnRhZ2UpO1xyXG4gICAgICAgICAgICBzZWxmLm9uU2Vla1ByZXZpZXdFdmVudCh0YXJnZXRQZXJjZW50YWdlLCB0cnVlKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGxldCBtb3VzZVRvdWNoVXBIYW5kbGVyID0gZnVuY3Rpb24gKGU6IE1vdXNlRXZlbnQgfCBUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBoYW5kbGVycywgc2VlayBvcGVyYXRpb24gaXMgZmluaXNoZWRcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub2ZmKFwidG91Y2htb3ZlIG1vdXNlbW92ZVwiLCBtb3VzZVRvdWNoTW92ZUhhbmRsZXIpO1xyXG4gICAgICAgICAgICBuZXcgRE9NKGRvY3VtZW50KS5vZmYoXCJ0b3VjaGVuZCBtb3VzZXVwXCIsIG1vdXNlVG91Y2hVcEhhbmRsZXIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHRhcmdldFBlcmNlbnRhZ2UgPSAxMDAgKiBzZWxmLmdldE9mZnNldChlKTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla2luZyhmYWxzZSk7XHJcbiAgICAgICAgICAgIHNlZWtpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vIEZpcmUgc2Vla2VkIGV2ZW50XHJcbiAgICAgICAgICAgIHNlbGYub25TZWVrZWRFdmVudCh0YXJnZXRQZXJjZW50YWdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvLyBBIHNlZWsgYWx3YXlzIHN0YXJ0IHdpdGggYSB0b3VjaHN0YXJ0IG9yIG1vdXNlZG93biBkaXJlY3RseSBvbiB0aGUgc2Vla2Jhci5cclxuICAgICAgICAvLyBUbyB0cmFjayBhIG1vdXNlIHNlZWsgYWxzbyBvdXRzaWRlIHRoZSBzZWVrYmFyIChmb3IgdG91Y2ggZXZlbnRzIHRoaXMgd29ya3MgYXV0b21hdGljYWxseSksXHJcbiAgICAgICAgLy8gc28gdGhlIHVzZXIgZG9lcyBub3QgbmVlZCB0byB0YWtlIGNhcmUgdGhhdCB0aGUgbW91c2UgYWx3YXlzIHN0YXlzIG9uIHRoZSBzZWVrYmFyLCB3ZSBhdHRhY2ggdGhlIG1vdXNlbW92ZVxyXG4gICAgICAgIC8vIGFuZCBtb3VzZXVwIGhhbmRsZXJzIHRvIHRoZSB3aG9sZSBkb2N1bWVudC4gQSBzZWVrIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSB1c2VyIGxpZnRzIHRoZSBtb3VzZSBrZXkuXHJcbiAgICAgICAgLy8gQSBzZWVrIG1vdXNlIGdlc3R1cmUgaXMgdGh1cyBiYXNpY2FsbHkgYSBjbGljayB3aXRoIGEgbG9uZyB0aW1lIGZyYW1lIGJldHdlZW4gZG93biBhbmQgdXAgZXZlbnRzLlxyXG4gICAgICAgIHNlZWtCYXIub24oXCJ0b3VjaHN0YXJ0IG1vdXNlZG93blwiLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcclxuICAgICAgICAgICAgbGV0IGlzVG91Y2hFdmVudCA9IHNlbGYudG91Y2hTdXBwb3J0ZWQgJiYgZSBpbnN0YW5jZW9mIFRvdWNoRXZlbnQ7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IHNlbGVjdGlvbiBvZiBET00gZWxlbWVudHMgKGFsc28gcHJldmVudHMgbW91c2Vkb3duIGlmIGN1cnJlbnQgZXZlbnQgaXMgdG91Y2hzdGFydClcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAvLyBBdm9pZCBwcm9wYWdhdGlvbiB0byBWUiBoYW5kbGVyXHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLnNldFNlZWtpbmcodHJ1ZSk7IC8vIFNldCBzZWVraW5nIGNsYXNzIG9uIERPTSBlbGVtZW50XHJcbiAgICAgICAgICAgIHNlZWtpbmcgPSB0cnVlOyAvLyBTZXQgc2VlayB0cmFja2luZyBmbGFnXHJcblxyXG4gICAgICAgICAgICAvLyBGaXJlIHNlZWtlZCBldmVudFxyXG4gICAgICAgICAgICBzZWxmLm9uU2Vla0V2ZW50KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgaGFuZGxlciB0byB0cmFjayB0aGUgc2VlayBvcGVyYXRpb24gb3ZlciB0aGUgd2hvbGUgZG9jdW1lbnRcclxuICAgICAgICAgICAgbmV3IERPTShkb2N1bWVudCkub24oaXNUb3VjaEV2ZW50ID8gXCJ0b3VjaG1vdmVcIiA6IFwibW91c2Vtb3ZlXCIsIG1vdXNlVG91Y2hNb3ZlSGFuZGxlcik7XHJcbiAgICAgICAgICAgIG5ldyBET00oZG9jdW1lbnQpLm9uKGlzVG91Y2hFdmVudCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLCBtb3VzZVRvdWNoVXBIYW5kbGVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRGlzcGxheSBzZWVrIHRhcmdldCBpbmRpY2F0b3Igd2hlbiBtb3VzZSBob3ZlcnMgb3IgZmluZ2VyIHNsaWRlcyBvdmVyIHNlZWtiYXJcclxuICAgICAgICBzZWVrQmFyLm9uKFwidG91Y2htb3ZlIG1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlZWtpbmcpIHtcclxuICAgICAgICAgICAgICAgIC8vIER1cmluZyBhIHNlZWsgKHdoZW4gbW91c2UgaXMgZG93biBvciB0b3VjaCBtb3ZlIGFjdGl2ZSksIHdlIG5lZWQgdG8gc3RvcCBwcm9wYWdhdGlvbiB0byBhdm9pZFxyXG4gICAgICAgICAgICAgICAgLy8gdGhlIFZSIHZpZXdwb3J0IHJlYWN0aW5nIHRvIHRoZSBtb3Zlcy5cclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICAvLyBCZWNhdXNlIHRoZSBzdG9wcGVkIHByb3BhZ2F0aW9uIGluaGliaXRzIHRoZSBldmVudCBvbiB0aGUgZG9jdW1lbnQsIHdlIG5lZWQgdG8gY2FsbCBpdCBmcm9tIGhlcmVcclxuICAgICAgICAgICAgICAgIG1vdXNlVG91Y2hNb3ZlSGFuZGxlcihlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gMTAwICogc2VsZi5nZXRPZmZzZXQoZSk7XHJcbiAgICAgICAgICAgIHNlbGYuc2V0U2Vla1Bvc2l0aW9uKHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgc2VsZi5vblNlZWtQcmV2aWV3RXZlbnQocG9zaXRpb24sIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmhhc0xhYmVsKCkgJiYgc2VsZi5nZXRMYWJlbCgpLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0TGFiZWwoKS5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSGlkZSBzZWVrIHRhcmdldCBpbmRpY2F0b3Igd2hlbiBtb3VzZSBvciBmaW5nZXIgbGVhdmVzIHNlZWtiYXJcclxuICAgICAgICBzZWVrQmFyLm9uKFwidG91Y2hlbmQgbW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5zZXRTZWVrUG9zaXRpb24oMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZi5oYXNMYWJlbCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmdldExhYmVsKCkuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNlZWtCYXJDb250YWluZXIuYXBwZW5kKHNlZWtCYXIpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5sYWJlbCkge1xyXG4gICAgICAgICAgICBzZWVrQmFyQ29udGFpbmVyLmFwcGVuZCh0aGlzLmxhYmVsLmdldERvbUVsZW1lbnQoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc2Vla0JhckNvbnRhaW5lcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGhvcml6b250YWwgb2Zmc2V0IG9mIGEgbW91c2UvdG91Y2ggZXZlbnQgcG9pbnQgZnJvbSB0aGUgbGVmdCBlZGdlIG9mIHRoZSBzZWVrIGJhci5cclxuICAgICAqIEBwYXJhbSBldmVudFBhZ2VYIHRoZSBwYWdlWCBjb29yZGluYXRlIG9mIGFuIGV2ZW50IHRvIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0IGZyb21cclxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9IGEgbnVtYmVyIGluIHRoZSByYW5nZSBvZiBbMCwgMV0sIHdoZXJlIDAgaXMgdGhlIGxlZnQgZWRnZSBhbmQgMSBpcyB0aGUgcmlnaHQgZWRnZVxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGdldEhvcml6b250YWxPZmZzZXQoZXZlbnRQYWdlWDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgZWxlbWVudE9mZnNldFB4ID0gdGhpcy5zZWVrQmFyLm9mZnNldCgpLmxlZnQ7XHJcbiAgICAgICAgbGV0IHdpZHRoUHggPSB0aGlzLnNlZWtCYXIud2lkdGgoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0UHggPSBldmVudFBhZ2VYIC0gZWxlbWVudE9mZnNldFB4O1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAxIC8gd2lkdGhQeCAqIG9mZnNldFB4O1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZU9mZnNldChvZmZzZXQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgdmVydGljYWwgb2Zmc2V0IG9mIGEgbW91c2UvdG91Y2ggZXZlbnQgcG9pbnQgZnJvbSB0aGUgYm90dG9tIGVkZ2Ugb2YgdGhlIHNlZWsgYmFyLlxyXG4gICAgICogQHBhcmFtIGV2ZW50UGFnZVkgdGhlIHBhZ2VYIGNvb3JkaW5hdGUgb2YgYW4gZXZlbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgZnJvbVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gYSBudW1iZXIgaW4gdGhlIHJhbmdlIG9mIFswLCAxXSwgd2hlcmUgMCBpcyB0aGUgYm90dG9tIGVkZ2UgYW5kIDEgaXMgdGhlIHRvcCBlZGdlXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZ2V0VmVydGljYWxPZmZzZXQoZXZlbnRQYWdlWTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgZWxlbWVudE9mZnNldFB4ID0gdGhpcy5zZWVrQmFyLm9mZnNldCgpLnRvcDtcclxuICAgICAgICBsZXQgd2lkdGhQeCA9IHRoaXMuc2Vla0Jhci5oZWlnaHQoKTtcclxuICAgICAgICBsZXQgb2Zmc2V0UHggPSBldmVudFBhZ2VZIC0gZWxlbWVudE9mZnNldFB4O1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAxIC8gd2lkdGhQeCAqIG9mZnNldFB4O1xyXG5cclxuICAgICAgICByZXR1cm4gMSAtIHRoaXMuc2FuaXRpemVPZmZzZXQob2Zmc2V0KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIG1vdXNlIG9yIHRvdWNoIGV2ZW50IG9mZnNldCBmb3IgdGhlIGN1cnJlbnQgY29uZmlndXJhdGlvbiAoaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbCkuXHJcbiAgICAgKiBAcGFyYW0gZSB0aGUgZXZlbnQgdG8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgZnJvbVxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gYSBudW1iZXIgaW4gdGhlIHJhbmdlIG9mIFswLCAxXVxyXG4gICAgICogQHNlZSAjZ2V0SG9yaXpvbnRhbE9mZnNldFxyXG4gICAgICogQHNlZSAjZ2V0VmVydGljYWxPZmZzZXRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBnZXRPZmZzZXQoZTogTW91c2VFdmVudCB8IFRvdWNoRXZlbnQpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLnRvdWNoU3VwcG9ydGVkICYmIGUgaW5zdGFuY2VvZiBUb3VjaEV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy52ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VmVydGljYWxPZmZzZXQoZS50eXBlID09PSBcInRvdWNoZW5kXCIgPyBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VZIDogZS50b3VjaGVzWzBdLnBhZ2VZKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEhvcml6b250YWxPZmZzZXQoZS50eXBlID09PSBcInRvdWNoZW5kXCIgPyBlLmNoYW5nZWRUb3VjaGVzWzBdLnBhZ2VYIDogZS50b3VjaGVzWzBdLnBhZ2VYKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChlIGluc3RhbmNlb2YgTW91c2VFdmVudCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcudmVydGljYWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFZlcnRpY2FsT2Zmc2V0KGUucGFnZVkpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SG9yaXpvbnRhbE9mZnNldChlLnBhZ2VYKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGNvbnNvbGUpIGNvbnNvbGUud2FybihcImludmFsaWQgZXZlbnRcIik7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNhbml0aXplcyB0aGUgbW91c2Ugb2Zmc2V0IHRvIHRoZSByYW5nZSBvZiBbMCwgMV0uXHJcbiAgICAgKlxyXG4gICAgICogV2hlbiB0cmFja2luZyB0aGUgbW91c2Ugb3V0c2lkZSB0aGUgc2VlayBiYXIsIHRoZSBvZmZzZXQgY2FuIGJlIG91dHNpZGUgdGhlIGRlc2lyZWQgcmFuZ2UgYW5kIHRoaXMgbWV0aG9kXHJcbiAgICAgKiBsaW1pdHMgaXQgdG8gdGhlIGRlc2lyZWQgcmFuZ2UuIEUuZy4gYSBtb3VzZSBldmVudCBsZWZ0IG9mIHRoZSBsZWZ0IGVkZ2Ugb2YgYSBzZWVrIGJhciB5aWVsZHMgYW4gb2Zmc2V0IGJlbG93XHJcbiAgICAgKiB6ZXJvLCBidXQgdG8gZGlzcGxheSB0aGUgc2VlayB0YXJnZXQgb24gdGhlIHNlZWsgYmFyLCB3ZSBuZWVkIHRvIGxpbWl0IGl0IHRvIHplcm8uXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG9mZnNldCB0aGUgb2Zmc2V0IHRvIHNhbml0aXplXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgc2FuaXRpemVkIG9mZnNldC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBzYW5pdGl6ZU9mZnNldChvZmZzZXQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIFNpbmNlIHdlIHRyYWNrIG1vdXNlIG1vdmVzIG92ZXIgdGhlIHdob2xlIGRvY3VtZW50LCB0aGUgdGFyZ2V0IGNhbiBiZSBvdXRzaWRlIHRoZSBzZWVrIHJhbmdlLFxyXG4gICAgICAgIC8vIGFuZCB3ZSBuZWVkIHRvIGxpbWl0IGl0IHRvIHRoZSBbMCwgMV0gcmFuZ2UuXHJcbiAgICAgICAgaWYgKG9mZnNldCA8IDApIHtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKG9mZnNldCA+IDEpIHtcclxuICAgICAgICAgICAgb2Zmc2V0ID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBvZmZzZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWJhY2sgcG9zaXRpb24gaW5kaWNhdG9yLlxyXG4gICAgICogQHBhcmFtIHBlcmNlbnQgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMDAgYXMgcmV0dXJuZWQgYnkgdGhlIHBsYXllclxyXG4gICAgICovXHJcbiAgICBzZXRQbGF5YmFja1Bvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyUGxheWJhY2tQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBwb3NpdGlvbiB1bnRpbCB3aGljaCBtZWRpYSBpcyBidWZmZXJlZC5cclxuICAgICAqIEBwYXJhbSBwZXJjZW50IGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTAwXHJcbiAgICAgKi9cclxuICAgIHNldEJ1ZmZlclBvc2l0aW9uKHBlcmNlbnQ6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24odGhpcy5zZWVrQmFyQnVmZmVyUG9zaXRpb24sIHBlcmNlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgcG9zaXRpb24gd2hlcmUgYSBzZWVrLCBpZiBleGVjdXRlZCwgd291bGQganVtcCB0by5cclxuICAgICAqIEBwYXJhbSBwZXJjZW50IGEgbnVtYmVyIGJldHdlZW4gMCBhbmQgMTAwXHJcbiAgICAgKi9cclxuICAgIHNldFNlZWtQb3NpdGlvbihwZXJjZW50OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKHRoaXMuc2Vla0JhclNlZWtQb3NpdGlvbiwgcGVyY2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgdGhlIGFjdHVhbCBwb3NpdGlvbiAod2lkdGggb3IgaGVpZ2h0KSBvZiBhIERPTSBlbGVtZW50IHRoYXQgcmVwcmVzZW50IGEgYmFyIGluIHRoZSBzZWVrIGJhci5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IHRoZSBlbGVtZW50IHRvIHNldCB0aGUgcG9zaXRpb24gZm9yXHJcbiAgICAgKiBAcGFyYW0gcGVyY2VudCBhIG51bWJlciBiZXR3ZWVuIDAgYW5kIDEwMFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHNldFBvc2l0aW9uKGVsZW1lbnQ6IERPTSwgcGVyY2VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gdGhpcy5jb25maWcudmVydGljYWwgPyB7XCJoZWlnaHRcIjogcGVyY2VudCArIFwiJVwifSA6IHtcIndpZHRoXCI6IHBlcmNlbnQgKyBcIiVcIn07XHJcbiAgICAgICAgZWxlbWVudC5jc3Moc3R5bGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHV0cyB0aGUgc2VlayBiYXIgaW50byBvciBvdXQgb2Ygc2Vla2luZyBzdGF0ZSBieSBhZGRpbmcvcmVtb3ZpbmcgYSBjbGFzcyB0byB0aGUgRE9NIGVsZW1lbnQuIFRoaXMgY2FuIGJlIHVzZWRcclxuICAgICAqIHRvIGFkanVzdCB0aGUgc3R5bGluZyB3aGlsZSBzZWVraW5nLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBzZWVraW5nIHNob3VsZCBiZSB0cnVlIHdoZW4gZW50ZXJpbmcgc2VlayBzdGF0ZSwgZmFsc2Ugd2hlbiBleGl0aW5nIHRoZSBzZWVrIHN0YXRlXHJcbiAgICAgKi9cclxuICAgIHNldFNlZWtpbmcoc2Vla2luZzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmIChzZWVraW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKHRoaXMucHJlZml4Q3NzKFNlZWtCYXIuQ0xBU1NfU0VFS0lORykpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKHRoaXMucHJlZml4Q3NzKFNlZWtCYXIuQ0xBU1NfU0VFS0lORykpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGUgc2VlayBiYXIgaXMgY3VycmVudGx5IGluIHRoZSBzZWVrIHN0YXRlLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgaW4gc2VlayBzdGF0ZSwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBpc1NlZWtpbmcoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmhhc0NsYXNzKHRoaXMucHJlZml4Q3NzKFNlZWtCYXIuQ0xBU1NfU0VFS0lORykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSBzZWVrIGJhciBoYXMgYSB7QGxpbmsgU2Vla0JhckxhYmVsfS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBzZWVrIGJhciBoYXMgYSBsYWJlbCwgZWxzZSBmYWxzZVxyXG4gICAgICovXHJcbiAgICBoYXNMYWJlbCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5sYWJlbCAhPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgbGFiZWwgb2YgdGhpcyBzZWVrIGJhci5cclxuICAgICAqIEByZXR1cm5zIHtTZWVrQmFyTGFiZWx9IHRoZSBsYWJlbCBpZiB0aGlzIHNlZWsgYmFyIGhhcyBhIGxhYmVsLCBlbHNlIG51bGxcclxuICAgICAqL1xyXG4gICAgZ2V0TGFiZWwoKTogU2Vla0JhckxhYmVsIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla0V2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWsuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla1ByZXZpZXdFdmVudChwZXJjZW50YWdlOiBudW1iZXIsIHNjcnViYmluZzogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwuc2V0VGV4dChwZXJjZW50YWdlICsgXCJcIik7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWwuZ2V0RG9tRWxlbWVudCgpLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcImxlZnRcIjogcGVyY2VudGFnZSArIFwiJVwiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlZWtCYXJFdmVudHMub25TZWVrUHJldmlldy5kaXNwYXRjaCh0aGlzLCB7c2NydWJiaW5nOiBzY3J1YmJpbmcsIHBvc2l0aW9uOiBwZXJjZW50YWdlfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uU2Vla2VkRXZlbnQocGVyY2VudGFnZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vla2VkLmRpc3BhdGNoKHRoaXMsIHBlcmNlbnRhZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIGEgc2NydWJiaW5nIHNlZWsgb3BlcmF0aW9uIGlzIHN0YXJ0ZWQuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2Vla0JhciwgTm9BcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uU2VlaygpOiBFdmVudDxTZWVrQmFyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zZWVrQmFyRXZlbnRzLm9uU2Vlay5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCBkdXJpbmcgYSBzY3J1YmJpbmcgc2VlayAodG8gaW5kaWNhdGUgdGhhdCB0aGUgc2VlayBwcmV2aWV3LCBpLmUuIHRoZSB2aWRlbyBmcmFtZSxcclxuICAgICAqIHNob3VsZCBiZSB1cGRhdGVkKSwgb3IgZHVyaW5nIGEgbm9ybWFsIHNlZWsgcHJldmlldyB3aGVuIHRoZSBzZWVrIGJhciBpcyBob3ZlcmVkIChhbmQgdGhlIHNlZWsgdGFyZ2V0LFxyXG4gICAgICogaS5lLiB0aGUgc2VlayBiYXIgbGFiZWwsIHNob3VsZCBiZSB1cGRhdGVkKS5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZWVrQmFyLCBTZWVrUHJldmlld0V2ZW50QXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblNlZWtQcmV2aWV3KCk6IEV2ZW50PFNlZWtCYXIsIFNlZWtQcmV2aWV3RXZlbnRBcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtQcmV2aWV3LmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gYSBzY3J1YmJpbmcgc2VlayBoYXMgZmluaXNoZWQgb3Igd2hlbiBhIGRpcmVjdCBzZWVrIGlzIGlzc3VlZC5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZWVrQmFyLCBudW1iZXI+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25TZWVrZWQoKTogRXZlbnQ8U2Vla0JhciwgbnVtYmVyPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2Vla0JhckV2ZW50cy5vblNlZWtlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0NvbnRhaW5lciwgQ29udGFpbmVyQ29uZmlnfSBmcm9tIFwiLi9jb250YWluZXJcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7Q29tcG9uZW50LCBDb21wb25lbnRDb25maWd9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1N0cmluZ1V0aWxzfSBmcm9tIFwiLi4vdXRpbHNcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB7QGxpbmsgU2Vla0JhckxhYmVsfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgU2Vla0JhckxhYmVsQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8vIG5vdGhpbmcgeWV0XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGxhYmVsIGZvciBhIHtAbGluayBTZWVrQmFyfSB0aGF0IGNhbiBkaXNwbGF5IHRoZSBzZWVrIHRhcmdldCB0aW1lIGFuZCBhIHRodW1ibmFpbC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZWVrQmFyTGFiZWwgZXh0ZW5kcyBDb250YWluZXI8U2Vla0JhckxhYmVsQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBsYWJlbDogTGFiZWw8TGFiZWxDb25maWc+O1xyXG4gICAgcHJpdmF0ZSB0aHVtYm5haWw6IENvbXBvbmVudDxDb21wb25lbnRDb25maWc+O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogU2Vla0JhckxhYmVsQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gbmV3IExhYmVsKHtjc3NDbGFzc2VzOiBbXCJzZWVrYmFyLWxhYmVsXCJdfSk7XHJcbiAgICAgICAgdGhpcy50aHVtYm5haWwgPSBuZXcgQ29tcG9uZW50KHtjc3NDbGFzc2VzOiBbXCJzZWVrYmFyLXRodW1ibmFpbFwiXX0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNlZWtiYXItbGFiZWxcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW25ldyBDb250YWluZXIoe2NvbXBvbmVudHM6IFt0aGlzLnRodW1ibmFpbCwgdGhpcy5sYWJlbF0sIGNzc0NsYXNzOiBcInNlZWtiYXItbGFiZWwtaW5uZXJcIn0pXSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSwgdGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbmZpZ3VyZShwbGF5ZXI6IGJpdG1vdmluLnBsYXllci5QbGF5ZXIsIHVpbWFuYWdlcjogVUlNYW5hZ2VyKTogdm9pZCB7XHJcbiAgICAgICAgc3VwZXIuY29uZmlndXJlKHBsYXllciwgdWltYW5hZ2VyKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICB1aW1hbmFnZXIub25TZWVrUHJldmlldy5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICBpZiAocGxheWVyLmlzTGl2ZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZSA9IHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAtIHBsYXllci5nZXRNYXhUaW1lU2hpZnQoKSAqIChwZXJjZW50YWdlIC8gMTAwKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0VGltZSh0aW1lKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lID0gcGxheWVyLmdldER1cmF0aW9uKCkgKiAocGVyY2VudGFnZSAvIDEwMCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRpbWUodGltZSk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFRodW1ibmFpbChwbGF5ZXIuZ2V0VGh1bWIodGltZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGFyYml0cmFyeSB0ZXh0IG9uIHRoZSBsYWJlbC5cclxuICAgICAqIEBwYXJhbSB0ZXh0IHRoZSB0ZXh0IHRvIHNob3cgb24gdGhlIGxhYmVsXHJcbiAgICAgKi9cclxuICAgIHNldFRleHQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5sYWJlbC5zZXRUZXh0KHRleHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0cyBhIHRpbWUgdG8gYmUgZGlzcGxheWVkIG9uIHRoZSBsYWJlbC5cclxuICAgICAqIEBwYXJhbSBzZWNvbmRzIHRoZSB0aW1lIGluIHNlY29uZHMgdG8gZGlzcGxheSBvbiB0aGUgbGFiZWxcclxuICAgICAqL1xyXG4gICAgc2V0VGltZShzZWNvbmRzOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnNldFRleHQoU3RyaW5nVXRpbHMuc2Vjb25kc1RvVGltZShzZWNvbmRzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIG9yIHJlbW92ZXMgYSB0aHVtYm5haWwgb24gdGhlIGxhYmVsLlxyXG4gICAgICogQHBhcmFtIHRodW1ibmFpbCB0aGUgdGh1bWJuYWlsIHRvIGRpc3BsYXkgb24gdGhlIGxhYmVsIG9yIG51bGwgdG8gcmVtb3ZlIGEgZGlzcGxheWVkIHRodW1ibmFpbFxyXG4gICAgICovXHJcbiAgICBzZXRUaHVtYm5haWwodGh1bWJuYWlsOiBiaXRtb3Zpbi5wbGF5ZXIuVGh1bWJuYWlsID0gbnVsbCkge1xyXG4gICAgICAgIGxldCB0aHVtYm5haWxFbGVtZW50ID0gdGhpcy50aHVtYm5haWwuZ2V0RG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICBpZiAodGh1bWJuYWlsID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGh1bWJuYWlsRWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgXCJiYWNrZ3JvdW5kLWltYWdlXCI6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgIFwid2lkdGhcIjogbnVsbCxcclxuICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IG51bGxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aHVtYm5haWxFbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICAgICAgICBcImRpc3BsYXlcIjogXCJpbmhlcml0XCIsXHJcbiAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtaW1hZ2VcIjogYHVybCgke3RodW1ibmFpbC51cmx9KWAsXHJcbiAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHRodW1ibmFpbC53ICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogdGh1bWJuYWlsLmggKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICBcImJhY2tncm91bmQtcG9zaXRpb25cIjogYC0ke3RodW1ibmFpbC54fXB4IC0ke3RodW1ibmFpbC55fXB4YFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yLCBMaXN0U2VsZWN0b3JDb25maWd9IGZyb20gXCIuL2xpc3RzZWxlY3RvclwiO1xyXG5pbXBvcnQge0RPTX0gZnJvbSBcIi4uL2RvbVwiO1xyXG5cclxuLyoqXHJcbiAqIEEgc2ltcGxlIHNlbGVjdCBib3ggcHJvdmlkaW5nIHRoZSBwb3NzaWJpbGl0eSB0byBzZWxlY3QgYSBzaW5nbGUgaXRlbSBvdXQgb2YgYSBsaXN0IG9mIGF2YWlsYWJsZSBpdGVtcy5cclxuICpcclxuICogRE9NIGV4YW1wbGU6XHJcbiAqIDxjb2RlPlxyXG4gKiAgICAgPHNlbGVjdCBjbGFzcz1cInVpLXNlbGVjdGJveFwiPlxyXG4gKiAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJrZXlcIj5sYWJlbDwvb3B0aW9uPlxyXG4gKiAgICAgICAgIC4uLlxyXG4gKiAgICAgPC9zZWxlY3Q+XHJcbiAqIDwvY29kZT5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTZWxlY3RCb3ggZXh0ZW5kcyBMaXN0U2VsZWN0b3I8TGlzdFNlbGVjdG9yQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3RFbGVtZW50OiBET007XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktc2VsZWN0Ym94XCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIGxldCBzZWxlY3RFbGVtZW50ID0gbmV3IERPTShcInNlbGVjdFwiLCB7XHJcbiAgICAgICAgICAgIFwiaWRcIjogdGhpcy5jb25maWcuaWQsXHJcbiAgICAgICAgICAgIFwiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKClcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RFbGVtZW50ID0gc2VsZWN0RWxlbWVudDtcclxuICAgICAgICB0aGlzLnVwZGF0ZURvbUl0ZW1zKCk7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBzZWxlY3RFbGVtZW50Lm9uKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gbmV3IERPTSh0aGlzKS52YWwoKTtcclxuICAgICAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZEV2ZW50KHZhbHVlLCBmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBzZWxlY3RFbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB1cGRhdGVEb21JdGVtcyhzZWxlY3RlZFZhbHVlOiBzdHJpbmcgPSBudWxsKSB7XHJcbiAgICAgICAgLy8gRGVsZXRlIGFsbCBjaGlsZHJlblxyXG4gICAgICAgIHRoaXMuc2VsZWN0RWxlbWVudC5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvLyBBZGQgdXBkYXRlZCBjaGlsZHJlblxyXG4gICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdGhpcy5pdGVtcykge1xyXG4gICAgICAgICAgICBsZXQgb3B0aW9uRWxlbWVudCA9IG5ldyBET00oXCJvcHRpb25cIiwge1xyXG4gICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBpdGVtLmtleVxyXG4gICAgICAgICAgICB9KS5odG1sKGl0ZW0ubGFiZWwpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGl0ZW0ua2V5ID09PSBzZWxlY3RlZFZhbHVlICsgXCJcIikgeyAvLyBjb252ZXJ0IHNlbGVjdGVkVmFsdWUgdG8gc3RyaW5nIHRvIGNhdGNoIFwibnVsbFwiL251bGwgY2FzZVxyXG4gICAgICAgICAgICAgICAgb3B0aW9uRWxlbWVudC5hdHRyKFwic2VsZWN0ZWRcIiwgXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RFbGVtZW50LmFwcGVuZChvcHRpb25FbGVtZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbUFkZGVkRXZlbnQodmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyLm9uSXRlbUFkZGVkRXZlbnQodmFsdWUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRG9tSXRlbXModGhpcy5zZWxlY3RlZEl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkl0ZW1SZW1vdmVkRXZlbnQodmFsdWU6IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyLm9uSXRlbVJlbW92ZWRFdmVudCh2YWx1ZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVEb21JdGVtcyh0aGlzLnNlbGVjdGVkSXRlbSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uSXRlbVNlbGVjdGVkRXZlbnQodmFsdWU6IHN0cmluZywgdXBkYXRlRG9tSXRlbXM6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgc3VwZXIub25JdGVtU2VsZWN0ZWRFdmVudCh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKHVwZGF0ZURvbUl0ZW1zKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRG9tSXRlbXModmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9zZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtMYWJlbCwgTGFiZWxDb25maWd9IGZyb20gXCIuL2xhYmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7VmlkZW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi92aWRlb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtBdWRpb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2F1ZGlvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1RpbWVvdXR9IGZyb20gXCIuLi90aW1lb3V0XCI7XHJcbmltcG9ydCB7RXZlbnQsIEV2ZW50RGlzcGF0Y2hlciwgTm9BcmdzfSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFNldHRpbmdzUGFuZWx9LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc1BhbmVsQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgc2V0dGluZ3MgcGFuZWwgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGVyZSBpcyBubyB1c2VyIGludGVyYWN0aW9uLlxyXG4gICAgICogU2V0IHRvIC0xIHRvIGRpc2FibGUgYXV0b21hdGljIGhpZGluZy5cclxuICAgICAqIERlZmF1bHQ6IDMgc2Vjb25kcyAoMzAwMClcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogQSBwYW5lbCBjb250YWluaW5nIGEgbGlzdCBvZiB7QGxpbmsgU2V0dGluZ3NQYW5lbEl0ZW0gaXRlbXN9IHRoYXQgcmVwcmVzZW50IGxhYmVsbGVkIHNldHRpbmdzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNldHRpbmdzUGFuZWwgZXh0ZW5kcyBDb250YWluZXI8U2V0dGluZ3NQYW5lbENvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX0xBU1QgPSBcImxhc3RcIjtcclxuXHJcbiAgICBwcml2YXRlIHNldHRpbmdzUGFuZWxFdmVudHMgPSB7XHJcbiAgICAgICAgb25TZXR0aW5nc1N0YXRlQ2hhbmdlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZXR0aW5nc1BhbmVsLCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBTZXR0aW5nc1BhbmVsQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnPFNldHRpbmdzUGFuZWxDb25maWc+KGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zZXR0aW5ncy1wYW5lbFwiLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDMwMDBcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IDxTZXR0aW5nc1BhbmVsQ29uZmlnPnRoaXMuZ2V0Q29uZmlnKCk7IC8vIFRPRE8gZml4IGdlbmVyaWNzIHR5cGUgaW5mZXJlbmNlXHJcblxyXG4gICAgICAgIGlmIChjb25maWcuaGlkZURlbGF5ID4gLTEpIHtcclxuICAgICAgICAgICAgbGV0IHRpbWVvdXQgPSBuZXcgVGltZW91dChjb25maWcuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLm9uU2hvdy5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQWN0aXZhdGUgdGltZW91dCB3aGVuIHNob3duXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnN0YXJ0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZXNldCB0aW1lb3V0IG9uIGludGVyYWN0aW9uXHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBzZWxmLm9uSGlkZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2xlYXIgdGltZW91dCB3aGVuIGhpZGRlbiBmcm9tIG91dHNpZGVcclxuICAgICAgICAgICAgICAgIHRpbWVvdXQuY2xlYXIoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBGaXJlIGV2ZW50IHdoZW4gdGhlIHN0YXRlIG9mIGEgc2V0dGluZ3MtaXRlbSBoYXMgY2hhbmdlZFxyXG4gICAgICAgIGxldCBzZXR0aW5nc1N0YXRlQ2hhbmdlZEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25TZXR0aW5nc1N0YXRlQ2hhbmdlZEV2ZW50KCk7XHJcblxyXG4gICAgICAgICAgICAvLyBBdHRhY2ggbWFya2VyIGNsYXNzIHRvIGxhc3QgdmlzaWJsZSBpdGVtXHJcbiAgICAgICAgICAgIGxldCBsYXN0U2hvd25JdGVtID0gbnVsbDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29tcG9uZW50IG9mIHNlbGYuZ2V0SXRlbXMoKSkge1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50LmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhzZWxmLnByZWZpeENzcyhTZXR0aW5nc1BhbmVsLkNMQVNTX0xBU1QpKTtcclxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuaXNTaG93bigpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNob3duSXRlbSA9IGNvbXBvbmVudDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGFzdFNob3duSXRlbSkge1xyXG4gICAgICAgICAgICAgICAgbGFzdFNob3duSXRlbS5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoU2V0dGluZ3NQYW5lbC5DTEFTU19MQVNUKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvciAobGV0IGNvbXBvbmVudCBvZiB0aGlzLmdldEl0ZW1zKCkpIHtcclxuICAgICAgICAgICAgY29tcG9uZW50Lm9uQWN0aXZlQ2hhbmdlZC5zdWJzY3JpYmUoc2V0dGluZ3NTdGF0ZUNoYW5nZWRIYW5kbGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlcmUgYXJlIGFjdGl2ZSBzZXR0aW5ncyB3aXRoaW4gdGhpcyBzZXR0aW5ncyBwYW5lbC4gQW4gYWN0aXZlIHNldHRpbmcgaXMgYSBzZXR0aW5nIHRoYXQgaXMgdmlzaWJsZVxyXG4gICAgICogYW5kIGVuYWJsZWQsIHdoaWNoIHRoZSB1c2VyIGNhbiBpbnRlcmFjdCB3aXRoLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgdGhlcmUgYXJlIGFjdGl2ZSBzZXR0aW5ncywgZmFsc2UgaWYgdGhlIHBhbmVsIGlzIGZ1bmN0aW9uYWxseSBlbXB0eSB0byBhIHVzZXJcclxuICAgICAqL1xyXG4gICAgaGFzQWN0aXZlU2V0dGluZ3MoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgY29tcG9uZW50IG9mIHRoaXMuZ2V0SXRlbXMoKSkge1xyXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50LmlzQWN0aXZlKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRJdGVtcygpOiBTZXR0aW5nc1BhbmVsSXRlbVtdIHtcclxuICAgICAgICByZXR1cm4gPFNldHRpbmdzUGFuZWxJdGVtW10+dGhpcy5jb25maWcuY29tcG9uZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgb25TZXR0aW5nc1N0YXRlQ2hhbmdlZEV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMuc2V0dGluZ3NQYW5lbEV2ZW50cy5vblNldHRpbmdzU3RhdGVDaGFuZ2VkLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIG9uZSBvciBtb3JlIHtAbGluayBTZXR0aW5nc1BhbmVsSXRlbSBpdGVtc30gaGF2ZSBjaGFuZ2VkIHN0YXRlLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFNldHRpbmdzUGFuZWwsIE5vQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvblNldHRpbmdzU3RhdGVDaGFuZ2VkKCk6IEV2ZW50PFNldHRpbmdzUGFuZWwsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzUGFuZWxFdmVudHMub25TZXR0aW5nc1N0YXRlQ2hhbmdlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQW4gaXRlbSBmb3IgYSB7QGxpbmsgU2V0dGluZ3NQYW5lbH0sIGNvbnRhaW5pbmcgYSB7QGxpbmsgTGFiZWx9IGFuZCBhIGNvbXBvbmVudCB0aGF0IGNvbmZpZ3VyZXMgYSBzZXR0aW5nLlxyXG4gKiBTdXBwb3J0ZWQgc2V0dGluZyBjb21wb25lbnRzOiB7QGxpbmsgU2VsZWN0Qm94fVxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFNldHRpbmdzUGFuZWxJdGVtIGV4dGVuZHMgQ29udGFpbmVyPENvbnRhaW5lckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuICAgIHByaXZhdGUgc2V0dGluZzogU2VsZWN0Qm94O1xyXG5cclxuICAgIHByaXZhdGUgc2V0dGluZ3NQYW5lbEl0ZW1FdmVudHMgPSB7XHJcbiAgICAgICAgb25BY3RpdmVDaGFuZ2VkOiBuZXcgRXZlbnREaXNwYXRjaGVyPFNldHRpbmdzUGFuZWxJdGVtLCBOb0FyZ3M+KClcclxuICAgIH07XHJcblxyXG4gICAgY29uc3RydWN0b3IobGFiZWw6IHN0cmluZywgc2VsZWN0Qm94OiBTZWxlY3RCb3gsIGNvbmZpZzogQ29udGFpbmVyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gbmV3IExhYmVsKHt0ZXh0OiBsYWJlbH0pO1xyXG4gICAgICAgIHRoaXMuc2V0dGluZyA9IHNlbGVjdEJveDtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS1zZXR0aW5ncy1wYW5lbC1lbnRyeVwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy5sYWJlbCwgdGhpcy5zZXR0aW5nXVxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IGhhbmRsZUNvbmZpZ0l0ZW1DaGFuZ2VkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBUaGUgbWluaW11bSBudW1iZXIgb2YgaXRlbXMgdGhhdCBtdXN0IGJlIGF2YWlsYWJsZSBmb3IgdGhlIHNldHRpbmcgdG8gYmUgZGlzcGxheWVkXHJcbiAgICAgICAgICAgIC8vIEJ5IGRlZmF1bHQsIGF0IGxlYXN0IHR3byBpdGVtcyBtdXN0IGJlIGF2YWlsYWJsZSwgZWxzZSBhIHNlbGVjdGlvbiBpcyBub3QgcG9zc2libGVcclxuICAgICAgICAgICAgbGV0IG1pbkl0ZW1zVG9EaXNwbGF5ID0gMjtcclxuICAgICAgICAgICAgLy8gQXVkaW8vdmlkZW8gcXVhbGl0eSBzZWxlY3QgYm94ZXMgY29udGFpbiBhbiBhZGRpdGlvbmFsIFwiYXV0b1wiIG1vZGUsIHdoaWNoIGluIGNvbWJpbmF0aW9uIHdpdGggYSBzaW5nbGUgYXZhaWxhYmxlIHF1YWxpdHkgYWxzbyBkb2VzIG5vdCBtYWtlIHNlbnNlXHJcbiAgICAgICAgICAgIGlmIChzZWxmLnNldHRpbmcgaW5zdGFuY2VvZiBWaWRlb1F1YWxpdHlTZWxlY3RCb3ggfHwgc2VsZi5zZXR0aW5nIGluc3RhbmNlb2YgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KSB7XHJcbiAgICAgICAgICAgICAgICBtaW5JdGVtc1RvRGlzcGxheSA9IDM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEhpZGUgdGhlIHNldHRpbmcgaWYgbm8gbWVhbmluZ2Z1bCBjaG9pY2UgaXMgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgIGlmIChzZWxmLnNldHRpbmcuaXRlbUNvdW50KCkgPCBtaW5JdGVtc1RvRGlzcGxheSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNob3coKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gVmlzaWJpbGl0eSBtaWdodCBoYXZlIGNoYW5nZWQgYW5kIHRoZXJlZm9yZSB0aGUgYWN0aXZlIHN0YXRlIG1pZ2h0IGhhdmUgY2hhbmdlZCBzbyB3ZSBmaXJlIHRoZSBldmVudFxyXG4gICAgICAgICAgICAvLyBUT0RPIGZpcmUgb25seSB3aGVuIHN0YXRlIGhhcyByZWFsbHkgY2hhbmdlZCAoZS5nLiBjaGVjayBpZiB2aXNpYmlsaXR5IGhhcyByZWFsbHkgY2hhbmdlZClcclxuICAgICAgICAgICAgc2VsZi5vbkFjdGl2ZUNoYW5nZWRFdmVudCgpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlbGYuc2V0dGluZy5vbkl0ZW1BZGRlZC5zdWJzY3JpYmUoaGFuZGxlQ29uZmlnSXRlbUNoYW5nZWQpO1xyXG4gICAgICAgIHNlbGYuc2V0dGluZy5vbkl0ZW1SZW1vdmVkLnN1YnNjcmliZShoYW5kbGVDb25maWdJdGVtQ2hhbmdlZCk7XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpemUgaGlkZGVuIHN0YXRlXHJcbiAgICAgICAgaGFuZGxlQ29uZmlnSXRlbUNoYW5nZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENoZWNrcyBpZiB0aGlzIHNldHRpbmdzIHBhbmVsIGl0ZW0gaXMgYWN0aXZlLCBpLmUuIHZpc2libGUgYW5kIGVuYWJsZWQgYW5kIGEgdXNlciBjYW4gaW50ZXJhY3Qgd2l0aCBpdC5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIHRoZSBwYW5lbCBpcyBhY3RpdmUsIGVsc2UgZmFsc2VcclxuICAgICAqL1xyXG4gICAgaXNBY3RpdmUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNTaG93bigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkFjdGl2ZUNoYW5nZWRFdmVudCgpIHtcclxuICAgICAgICB0aGlzLnNldHRpbmdzUGFuZWxJdGVtRXZlbnRzLm9uQWN0aXZlQ2hhbmdlZC5kaXNwYXRjaCh0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgXCJhY3RpdmVcIiBzdGF0ZSBvZiB0aGlzIGl0ZW0gY2hhbmdlcy5cclxuICAgICAqIEBzZWUgI2lzQWN0aXZlXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2V0dGluZ3NQYW5lbEl0ZW0sIE5vQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbkFjdGl2ZUNoYW5nZWQoKTogRXZlbnQ8U2V0dGluZ3NQYW5lbEl0ZW0sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzUGFuZWxJdGVtRXZlbnRzLm9uQWN0aXZlQ2hhbmdlZC5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1RvZ2dsZUJ1dHRvbiwgVG9nZ2xlQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi90b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZXR0aW5nc1BhbmVsfSBmcm9tIFwiLi9zZXR0aW5nc3BhbmVsXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIHRoZSB7QGxpbmsgU2V0dGluZ3NUb2dnbGVCdXR0b259LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZyBleHRlbmRzIFRvZ2dsZUJ1dHRvbkNvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzZXR0aW5ncyBwYW5lbCB3aG9zZSB2aXNpYmlsaXR5IHRoZSBidXR0b24gc2hvdWxkIHRvZ2dsZS5cclxuICAgICAqL1xyXG4gICAgc2V0dGluZ3NQYW5lbDogU2V0dGluZ3NQYW5lbDtcclxuXHJcbiAgICAvKipcclxuICAgICAqIERlY2lkZXMgaWYgdGhlIGJ1dHRvbiBzaG91bGQgYmUgYXV0b21hdGljYWxseSBoaWRkZW4gd2hlbiB0aGUgc2V0dGluZ3MgcGFuZWwgZG9lcyBub3QgY29udGFpbiBhbnkgYWN0aXZlIHNldHRpbmdzLlxyXG4gICAgICogRGVmYXVsdDogdHJ1ZVxyXG4gICAgICovXHJcbiAgICBhdXRvSGlkZVdoZW5Ob0FjdGl2ZVNldHRpbmdzPzogYm9vbGVhbjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgdG9nZ2xlcyB2aXNpYmlsaXR5IG9mIGEgc2V0dGluZ3MgcGFuZWwuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU2V0dGluZ3NUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248U2V0dGluZ3NUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNldHRpbmdzVG9nZ2xlQnV0dG9uQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgaWYgKCFjb25maWcuc2V0dGluZ3NQYW5lbCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXF1aXJlZCBTZXR0aW5nc1BhbmVsIGlzIG1pc3NpbmdcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXNldHRpbmdzdG9nZ2xlYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiU2V0dGluZ3NcIixcclxuICAgICAgICAgICAgc2V0dGluZ3NQYW5lbDogbnVsbCxcclxuICAgICAgICAgICAgYXV0b0hpZGVXaGVuTm9BY3RpdmVTZXR0aW5nczogdHJ1ZVxyXG4gICAgICAgIH0sIDxTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbmZpZyA9IDxTZXR0aW5nc1RvZ2dsZUJ1dHRvbkNvbmZpZz50aGlzLmdldENvbmZpZygpOyAvLyBUT0RPIGZpeCBnZW5lcmljcyB0eXBlIGluZmVyZW5jZVxyXG4gICAgICAgIGxldCBzZXR0aW5nc1BhbmVsID0gY29uZmlnLnNldHRpbmdzUGFuZWw7XHJcblxyXG4gICAgICAgIHRoaXMub25DbGljay5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZXR0aW5nc1BhbmVsLnRvZ2dsZUhpZGRlbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNldHRpbmdzUGFuZWwub25TaG93LnN1YnNjcmliZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFNldCB0b2dnbGUgc3RhdHVzIHRvIG9uIHdoZW4gdGhlIHNldHRpbmdzIHBhbmVsIHNob3dzXHJcbiAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZXR0aW5nc1BhbmVsLm9uSGlkZS5zdWJzY3JpYmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBTZXQgdG9nZ2xlIHN0YXR1cyB0byBvZmYgd2hlbiB0aGUgc2V0dGluZ3MgcGFuZWwgaGlkZXNcclxuICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gSGFuZGxlIGF1dG9tYXRpYyBoaWRpbmcgb2YgdGhlIGJ1dHRvbiBpZiB0aGVyZSBhcmUgbm8gc2V0dGluZ3MgZm9yIHRoZSB1c2VyIHRvIGludGVyYWN0IHdpdGhcclxuICAgICAgICBpZiAoY29uZmlnLmF1dG9IaWRlV2hlbk5vQWN0aXZlU2V0dGluZ3MpIHtcclxuICAgICAgICAgICAgLy8gU2V0dXAgaGFuZGxlciB0byBzaG93L2hpZGUgYnV0dG9uIHdoZW4gdGhlIHNldHRpbmdzIGNoYW5nZVxyXG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbEl0ZW1zQ2hhbmdlZEhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3NQYW5lbC5oYXNBY3RpdmVTZXR0aW5ncygpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGYuaXNIaWRkZW4oKSkgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLmlzU2hvd24oKSkgc2VsZi5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIC8vIFdpcmUgdGhlIGhhbmRsZXIgdG8gdGhlIGV2ZW50XHJcbiAgICAgICAgICAgIHNldHRpbmdzUGFuZWwub25TZXR0aW5nc1N0YXRlQ2hhbmdlZC5zdWJzY3JpYmUoc2V0dGluZ3NQYW5lbEl0ZW1zQ2hhbmdlZEhhbmRsZXIpO1xyXG4gICAgICAgICAgICAvLyBDYWxsIGhhbmRsZXIgZm9yIGZpcnN0IGluaXQgYXQgc3RhcnR1cFxyXG4gICAgICAgICAgICBzZXR0aW5nc1BhbmVsSXRlbXNDaGFuZ2VkSGFuZGxlcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXIsIENvbnRhaW5lckNvbmZpZ30gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCBTdWJ0aXRsZUN1ZUV2ZW50ID0gYml0bW92aW4ucGxheWVyLlN1YnRpdGxlQ3VlRXZlbnQ7XHJcbmltcG9ydCB7TGFiZWwsIExhYmVsQ29uZmlnfSBmcm9tIFwiLi9sYWJlbFwiO1xyXG5pbXBvcnQge0NvbXBvbmVudENvbmZpZywgQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtDb250cm9sQmFyfSBmcm9tIFwiLi9jb250cm9sYmFyXCI7XHJcblxyXG4vKipcclxuICogT3ZlcmxheXMgdGhlIHBsYXllciB0byBkaXNwbGF5IHN1YnRpdGxlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBTdWJ0aXRsZU92ZXJsYXkgZXh0ZW5kcyBDb250YWluZXI8Q29udGFpbmVyQ29uZmlnPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ0xBU1NfQ09OVFJPTEJBUl9WSVNJQkxFID0gXCJjb250cm9sYmFyLXZpc2libGVcIjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIElubmVyIGxhYmVsIHRoYXQgcmVuZGVycyB0aGUgc3VidGl0bGUgdGV4dFxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIHN1YnRpdGxlTGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdWJ0aXRsZUxhYmVsID0gbmV3IExhYmVsPExhYmVsQ29uZmlnPih7Y3NzQ2xhc3M6IFwidWktc3VidGl0bGUtbGFiZWxcIn0pO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXN1YnRpdGxlLW92ZXJsYXlcIixcclxuICAgICAgICAgICAgY29tcG9uZW50czogW3RoaXMuc3VidGl0bGVMYWJlbF1cclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NVRV9FTlRFUiwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUN1ZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHNlbGYuc3VidGl0bGVMYWJlbC5zZXRUZXh0KGV2ZW50LnRleHQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0NVRV9FWElULCBmdW5jdGlvbiAoZXZlbnQ6IFN1YnRpdGxlQ3VlRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5zdWJ0aXRsZUxhYmVsLnNldFRleHQoXCJcIik7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGxldCBzdWJ0aXRsZUNsZWFySGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zdWJ0aXRsZUxhYmVsLnNldFRleHQoXCJcIik7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fQVVESU9fQ0hBTkdFRCwgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NVQlRJVExFX0NIQU5HRUQsIHN1YnRpdGxlQ2xlYXJIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TRUVLLCBzdWJ0aXRsZUNsZWFySGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVElNRV9TSElGVCwgc3VidGl0bGVDbGVhckhhbmRsZXIpO1xyXG5cclxuICAgICAgICB1aW1hbmFnZXIub25Db21wb25lbnRTaG93LnN1YnNjcmliZShmdW5jdGlvbiAoY29tcG9uZW50OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPikge1xyXG4gICAgICAgICAgICBpZiAoY29tcG9uZW50IGluc3RhbmNlb2YgQ29udHJvbEJhcikge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoU3VidGl0bGVPdmVybGF5LkNMQVNTX0NPTlRST0xCQVJfVklTSUJMRSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uQ29tcG9uZW50SGlkZS5zdWJzY3JpYmUoZnVuY3Rpb24gKGNvbXBvbmVudDogQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4pIHtcclxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudCBpbnN0YW5jZW9mIENvbnRyb2xCYXIpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKHNlbGYucHJlZml4Q3NzKFN1YnRpdGxlT3ZlcmxheS5DTEFTU19DT05UUk9MQkFSX1ZJU0lCTEUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuaW1wb3J0IFN1YnRpdGxlQWRkZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZUFkZGVkRXZlbnQ7XHJcbmltcG9ydCBTdWJ0aXRsZUNoYW5nZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5TdWJ0aXRsZUNoYW5nZWRFdmVudDtcclxuaW1wb3J0IFN1YnRpdGxlUmVtb3ZlZEV2ZW50ID0gYml0bW92aW4ucGxheWVyLlN1YnRpdGxlUmVtb3ZlZEV2ZW50O1xyXG5cclxuLyoqXHJcbiAqIEEgc2VsZWN0IGJveCBwcm92aWRpbmcgYSBzZWxlY3Rpb24gYmV0d2VlbiBhdmFpbGFibGUgc3VidGl0bGUgYW5kIGNhcHRpb24gdHJhY2tzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFN1YnRpdGxlU2VsZWN0Qm94IGV4dGVuZHMgU2VsZWN0Qm94IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IExpc3RTZWxlY3RvckNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IHVwZGF0ZVN1YnRpdGxlcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5jbGVhckl0ZW1zKCk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBzdWJ0aXRsZSBvZiBwbGF5ZXIuZ2V0QXZhaWxhYmxlU3VidGl0bGVzKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbShzdWJ0aXRsZS5pZCwgc3VidGl0bGUubGFiZWwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VsZi5vbkl0ZW1TZWxlY3RlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlcjogU3VidGl0bGVTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldFN1YnRpdGxlKHZhbHVlID09PSBcIm51bGxcIiA/IG51bGwgOiB2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFJlYWN0IHRvIEFQSSBldmVudHNcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVUJUSVRMRV9BRERFRCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUFkZGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5hZGRJdGVtKGV2ZW50LnN1YnRpdGxlLmlkLCBldmVudC5zdWJ0aXRsZS5sYWJlbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fU1VCVElUTEVfQ0hBTkdFRCwgZnVuY3Rpb24gKGV2ZW50OiBTdWJ0aXRsZUNoYW5nZWRFdmVudCkge1xyXG4gICAgICAgICAgICBzZWxmLnNlbGVjdEl0ZW0oZXZlbnQudGFyZ2V0U3VidGl0bGUuaWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NVQlRJVExFX1JFTU9WRUQsIGZ1bmN0aW9uIChldmVudDogU3VidGl0bGVSZW1vdmVkRXZlbnQpIHtcclxuICAgICAgICAgICAgc2VsZi5yZW1vdmVJdGVtKGV2ZW50LnN1YnRpdGxlSWQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHVwZGF0ZVN1YnRpdGxlcyk7IC8vIFVwZGF0ZSBzdWJ0aXRsZXMgd2hlbiBzb3VyY2UgZ29lcyBhd2F5XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUkVBRFksIHVwZGF0ZVN1YnRpdGxlcyk7IC8vIFVwZGF0ZSBzdWJ0aXRsZXMgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHN1YnRpdGxlcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlU3VidGl0bGVzKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7Q29udGFpbmVyLCBDb250YWluZXJDb25maWd9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge0xhYmVsQ29uZmlnLCBMYWJlbH0gZnJvbSBcIi4vbGFiZWxcIjtcclxuaW1wb3J0IHtUaW1lb3V0fSBmcm9tIFwiLi4vdGltZW91dFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIHtAbGluayBUaXRsZUJhcn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRpdGxlQmFyQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGluIG1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgdGl0bGUgYmFyIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIERlZmF1bHQ6IDUgc2Vjb25kcyAoNTAwMClcclxuICAgICAqL1xyXG4gICAgaGlkZURlbGF5PzogbnVtYmVyO1xyXG59XHJcblxyXG4vKipcclxuICogRGlzcGxheXMgYSB0aXRsZSBiYXIgY29udGFpbmluZyBhIGxhYmVsIHdpdGggdGhlIHRpdGxlIG9mIHRoZSB2aWRlby5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUaXRsZUJhciBleHRlbmRzIENvbnRhaW5lcjxUaXRsZUJhckNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGFiZWw6IExhYmVsPExhYmVsQ29uZmlnPjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRpdGxlQmFyQ29uZmlnID0ge30pIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmxhYmVsID0gbmV3IExhYmVsKHtjc3NDbGFzczogXCJ1aS10aXRsZWJhci1sYWJlbFwifSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdGl0bGViYXJcIixcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlLFxyXG4gICAgICAgICAgICBoaWRlRGVsYXk6IDUwMDAsXHJcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IFt0aGlzLmxhYmVsXVxyXG4gICAgICAgIH0sIDxUaXRsZUJhckNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGlmICh1aW1hbmFnZXIuZ2V0Q29uZmlnKCkgJiYgdWltYW5hZ2VyLmdldENvbmZpZygpLm1ldGFkYXRhKSB7XHJcbiAgICAgICAgICAgIHNlbGYubGFiZWwuc2V0VGV4dCh1aW1hbmFnZXIuZ2V0Q29uZmlnKCkubWV0YWRhdGEudGl0bGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIENhbmNlbCBjb25maWd1cmF0aW9uIGlmIHRoZXJlIGlzIG5vIG1ldGFkYXRhIHRvIGRpc3BsYXlcclxuICAgICAgICAgICAgLy8gVE9ETyB0aGlzIHByb2JhYmx5IHdvbid0IHdvcmsgaWYgd2UgcHV0IHRoZSBzaGFyZSBidXR0b25zIGludG8gdGhlIHRpdGxlIGJhclxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdGltZW91dCA9IG5ldyBUaW1lb3V0KCg8VGl0bGVCYXJDb25maWc+c2VsZi5nZXRDb25maWcoKSkuaGlkZURlbGF5LCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUVudGVyLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2hvdygpOyAvLyBzaG93IGNvbnRyb2wgYmFyIHdoZW4gdGhlIG1vdXNlIGVudGVycyB0aGUgVUlcclxuXHJcbiAgICAgICAgICAgIC8vIENsZWFyIHRpbWVvdXQgdG8gYXZvaWQgaGlkaW5nIHRoZSBiYXIgaWYgdGhlIG1vdXNlIG1vdmVzIGJhY2sgaW50byB0aGUgVUkgZHVyaW5nIHRoZSB0aW1lb3V0IHBlcmlvZFxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdWltYW5hZ2VyLm9uTW91c2VNb3ZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSB0aGUgYmFyIGlmIG1vdXNlIGRvZXMgbm90IG1vdmUgZHVyaW5nIHRoZSB0aW1lb3V0IHRpbWVcclxuICAgICAgICB9KTtcclxuICAgICAgICB1aW1hbmFnZXIub25Nb3VzZUxlYXZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyLCBhcmdzKSB7XHJcbiAgICAgICAgICAgIHRpbWVvdXQucmVzZXQoKTsgLy8gaGlkZSBiYXIgc29tZSB0aW1lIGFmdGVyIHRoZSBtb3VzZSBsZWZ0IHRoZSBVSVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0J1dHRvbiwgQnV0dG9uQ29uZmlnfSBmcm9tIFwiLi9idXR0b25cIjtcclxuaW1wb3J0IHtOb0FyZ3MsIEV2ZW50RGlzcGF0Y2hlciwgRXZlbnR9IGZyb20gXCIuLi9ldmVudGRpc3BhdGNoZXJcIjtcclxuaW1wb3J0IHtET019IGZyb20gXCIuLi9kb21cIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSB0b2dnbGUgYnV0dG9uIGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVG9nZ2xlQnV0dG9uQ29uZmlnIGV4dGVuZHMgQnV0dG9uQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRleHQgb24gdGhlIGJ1dHRvbi5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuLyoqXHJcbiAqIEEgYnV0dG9uIHRoYXQgY2FuIGJlIHRvZ2dsZWQgYmV0d2VlbiBcIm9uXCIgYW5kIFwib2ZmXCIgc3RhdGVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFRvZ2dsZUJ1dHRvbjxDb25maWcgZXh0ZW5kcyBUb2dnbGVCdXR0b25Db25maWc+IGV4dGVuZHMgQnV0dG9uPFRvZ2dsZUJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IENMQVNTX09OID0gXCJvblwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgQ0xBU1NfT0ZGID0gXCJvZmZcIjtcclxuXHJcbiAgICBwcml2YXRlIG9uU3RhdGU6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSB0b2dnbGVCdXR0b25FdmVudHMgPSB7XHJcbiAgICAgICAgb25Ub2dnbGU6IG5ldyBFdmVudERpc3BhdGNoZXI8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICBvblRvZ2dsZU9uOiBuZXcgRXZlbnREaXNwYXRjaGVyPFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgb25Ub2dnbGVPZmY6IG5ldyBFdmVudERpc3BhdGNoZXI8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4oKVxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdG9nZ2xlYnV0dG9uXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUb2dnbGVzIHRoZSBidXR0b24gdG8gdGhlIFwib25cIiBzdGF0ZS5cclxuICAgICAqL1xyXG4gICAgb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPZmYoKSkge1xyXG4gICAgICAgICAgICB0aGlzLm9uU3RhdGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyh0aGlzLnByZWZpeENzcyhUb2dnbGVCdXR0b24uQ0xBU1NfT0ZGKSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKHRoaXMucHJlZml4Q3NzKFRvZ2dsZUJ1dHRvbi5DTEFTU19PTikpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25Ub2dnbGVPbkV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogVG9nZ2xlcyB0aGUgYnV0dG9uIHRvIHRoZSBcIm9mZlwiIHN0YXRlLlxyXG4gICAgICovXHJcbiAgICBvZmYoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNPbigpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25TdGF0ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyh0aGlzLnByZWZpeENzcyhUb2dnbGVCdXR0b24uQ0xBU1NfT04pKTtcclxuICAgICAgICAgICAgdGhpcy5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3ModGhpcy5wcmVmaXhDc3MoVG9nZ2xlQnV0dG9uLkNMQVNTX09GRikpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMub25Ub2dnbGVPZmZFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRvZ2dsZSB0aGUgYnV0dG9uIFwib25cIiBpZiBpdCBpcyBcIm9mZlwiLCBvciBcIm9mZlwiIGlmIGl0IGlzIFwib25cIi5cclxuICAgICAqL1xyXG4gICAgdG9nZ2xlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzT24oKSkge1xyXG4gICAgICAgICAgICB0aGlzLm9mZigpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMub24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDaGVja3MgaWYgdGhlIHRvZ2dsZSBidXR0b24gaXMgaW4gdGhlIFwib25cIiBzdGF0ZS5cclxuICAgICAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIGJ1dHRvbiBpcyBcIm9uXCIsIGZhbHNlIGlmIFwib2ZmXCJcclxuICAgICAqL1xyXG4gICAgaXNPbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vblN0YXRlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIHRoZSB0b2dnbGUgYnV0dG9uIGlzIGluIHRoZSBcIm9mZlwiIHN0YXRlLlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgYnV0dG9uIGlzIFwib2ZmXCIsIGZhbHNlIGlmIFwib25cIlxyXG4gICAgICovXHJcbiAgICBpc09mZigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuaXNPbigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbkNsaWNrRXZlbnQoKSB7XHJcbiAgICAgICAgc3VwZXIub25DbGlja0V2ZW50KCk7XHJcblxyXG4gICAgICAgIC8vIEZpcmUgdGhlIHRvZ2dsZSBldmVudCB0b2dldGhlciB3aXRoIHRoZSBjbGljayBldmVudFxyXG4gICAgICAgIC8vICh0aGV5IGFyZSB0ZWNobmljYWxseSB0aGUgc2FtZSwgb25seSB0aGUgc2VtYW50aWNzIGFyZSBkaWZmZXJlbnQpXHJcbiAgICAgICAgdGhpcy5vblRvZ2dsZUV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uVG9nZ2xlRXZlbnQoKSB7XHJcbiAgICAgICAgdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uVG9nZ2xlT25FdmVudCgpIHtcclxuICAgICAgICB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9uLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvblRvZ2dsZU9mZkV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudG9nZ2xlQnV0dG9uRXZlbnRzLm9uVG9nZ2xlT2ZmLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBidXR0b24gaXMgdG9nZ2xlZC5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudDxTZW5kZXIsIEFyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Ub2dnbGUoKTogRXZlbnQ8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZS5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBidXR0b24gaXMgdG9nZ2xlZCBcIm9uXCIuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uVG9nZ2xlT24oKTogRXZlbnQ8VG9nZ2xlQnV0dG9uPENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZUJ1dHRvbkV2ZW50cy5vblRvZ2dsZU9uLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIGJ1dHRvbiBpcyB0b2dnbGVkIFwib2ZmXCIuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8U2VuZGVyLCBBcmdzPn1cclxuICAgICAqL1xyXG4gICAgZ2V0IG9uVG9nZ2xlT2ZmKCk6IEV2ZW50PFRvZ2dsZUJ1dHRvbjxDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy50b2dnbGVCdXR0b25FdmVudHMub25Ub2dnbGVPZmYuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb21wb25lbnQsIENvbXBvbmVudENvbmZpZ30gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcblxyXG4vKipcclxuICogQW5pbWF0ZWQgYW5hbG9nIFRWIHN0YXRpYyBub2lzZS5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUdk5vaXNlQ2FudmFzIGV4dGVuZHMgQ29tcG9uZW50PENvbXBvbmVudENvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgY2FudmFzOiBET007XHJcblxyXG4gICAgcHJpdmF0ZSBjYW52YXNFbGVtZW50OiBIVE1MQ2FudmFzRWxlbWVudDtcclxuICAgIHByaXZhdGUgY2FudmFzQ29udGV4dDogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEO1xyXG4gICAgcHJpdmF0ZSBjYW52YXNXaWR0aCA9IDE2MDtcclxuICAgIHByaXZhdGUgY2FudmFzSGVpZ2h0ID0gOTA7XHJcbiAgICBwcml2YXRlIGludGVyZmVyZW5jZUhlaWdodCA9IDUwO1xyXG4gICAgcHJpdmF0ZSBsYXN0RnJhbWVVcGRhdGU6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGZyYW1lSW50ZXJ2YWw6IG51bWJlciA9IDYwO1xyXG4gICAgcHJpdmF0ZSB1c2VBbmltYXRpb25GcmFtZTogYm9vbGVhbiA9ICEhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcclxuICAgIHByaXZhdGUgbm9pc2VBbmltYXRpb25XaW5kb3dQb3M6IG51bWJlcjtcclxuICAgIHByaXZhdGUgZnJhbWVVcGRhdGVIYW5kbGVySWQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbXBvbmVudENvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS10dm5vaXNlY2FudmFzXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHRvRG9tRWxlbWVudCgpOiBET00ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNhbnZhcyA9IG5ldyBET00oXCJjYW52YXNcIiwge1wiY2xhc3NcIjogdGhpcy5nZXRDc3NDbGFzc2VzKCl9KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGFydCgpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+dGhpcy5jYW52YXMuZ2V0RWxlbWVudHMoKVswXTtcclxuICAgICAgICB0aGlzLmNhbnZhc0NvbnRleHQgPSB0aGlzLmNhbnZhc0VsZW1lbnQuZ2V0Q29udGV4dChcIjJkXCIpO1xyXG4gICAgICAgIHRoaXMubm9pc2VBbmltYXRpb25XaW5kb3dQb3MgPSAtdGhpcy5jYW52YXNIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5sYXN0RnJhbWVVcGRhdGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmNhbnZhc0VsZW1lbnQud2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xyXG4gICAgICAgIHRoaXMuY2FudmFzRWxlbWVudC5oZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcclxuXHJcbiAgICAgICAgdGhpcy5yZW5kZXJGcmFtZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0b3AoKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMudXNlQW5pbWF0aW9uRnJhbWUpIHtcclxuICAgICAgICAgICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5mcmFtZVVwZGF0ZUhhbmRsZXJJZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuZnJhbWVVcGRhdGVIYW5kbGVySWQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHJlbmRlckZyYW1lKCk6IHZvaWQge1xyXG4gICAgICAgIC8vIFRoaXMgY29kZSBoYXMgYmVlbiBjb3BpZWQgZnJvbSB0aGUgcGxheWVyIGNvbnRyb2xzLmpzIGFuZCBzaW1wbGlmaWVkXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmxhc3RGcmFtZVVwZGF0ZSArIHRoaXMuZnJhbWVJbnRlcnZhbCA+IG5ldyBEYXRlKCkuZ2V0VGltZSgpKSB7XHJcbiAgICAgICAgICAgIC8vIEl0J3MgdG9vIGVhcmx5IHRvIHJlbmRlciB0aGUgbmV4dCBmcmFtZVxyXG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlTmV4dFJlbmRlcigpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY3VycmVudFBpeGVsT2Zmc2V0O1xyXG4gICAgICAgIGxldCBjYW52YXNXaWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XHJcbiAgICAgICAgbGV0IGNhbnZhc0hlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdGV4dHVyZVxyXG4gICAgICAgIGxldCBub2lzZUltYWdlID0gdGhpcy5jYW52YXNDb250ZXh0LmNyZWF0ZUltYWdlRGF0YShjYW52YXNXaWR0aCwgY2FudmFzSGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8gRmlsbCB0ZXh0dXJlIHdpdGggbm9pc2VcclxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGNhbnZhc0hlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgY2FudmFzV2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFBpeGVsT2Zmc2V0ID0gKGNhbnZhc1dpZHRoICogeSAqIDQpICsgeCAqIDQ7XHJcbiAgICAgICAgICAgICAgICBub2lzZUltYWdlLmRhdGFbY3VycmVudFBpeGVsT2Zmc2V0XSA9IE1hdGgucmFuZG9tKCkgKiAyNTU7XHJcbiAgICAgICAgICAgICAgICBpZiAoeSA8IHRoaXMubm9pc2VBbmltYXRpb25XaW5kb3dQb3MgfHwgeSA+IHRoaXMubm9pc2VBbmltYXRpb25XaW5kb3dQb3MgKyB0aGlzLmludGVyZmVyZW5jZUhlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vaXNlSW1hZ2UuZGF0YVtjdXJyZW50UGl4ZWxPZmZzZXRdICo9IDAuODU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2lzZUltYWdlLmRhdGFbY3VycmVudFBpeGVsT2Zmc2V0ICsgMV0gPSBub2lzZUltYWdlLmRhdGFbY3VycmVudFBpeGVsT2Zmc2V0XTtcclxuICAgICAgICAgICAgICAgIG5vaXNlSW1hZ2UuZGF0YVtjdXJyZW50UGl4ZWxPZmZzZXQgKyAyXSA9IG5vaXNlSW1hZ2UuZGF0YVtjdXJyZW50UGl4ZWxPZmZzZXRdO1xyXG4gICAgICAgICAgICAgICAgbm9pc2VJbWFnZS5kYXRhW2N1cnJlbnRQaXhlbE9mZnNldCArIDNdID0gNTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFB1dCB0ZXh0dXJlIG9udG8gY2FudmFzXHJcbiAgICAgICAgdGhpcy5jYW52YXNDb250ZXh0LnB1dEltYWdlRGF0YShub2lzZUltYWdlLCAwLCAwKTtcclxuXHJcbiAgICAgICAgdGhpcy5sYXN0RnJhbWVVcGRhdGUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgICAgICB0aGlzLm5vaXNlQW5pbWF0aW9uV2luZG93UG9zICs9IDc7XHJcbiAgICAgICAgaWYgKHRoaXMubm9pc2VBbmltYXRpb25XaW5kb3dQb3MgPiBjYW52YXNIZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5ub2lzZUFuaW1hdGlvbldpbmRvd1BvcyA9IC1jYW52YXNIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNjaGVkdWxlTmV4dFJlbmRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2NoZWR1bGVOZXh0UmVuZGVyKCk6IHZvaWQge1xyXG4gICAgICAgIGlmICh0aGlzLnVzZUFuaW1hdGlvbkZyYW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVVcGRhdGVIYW5kbGVySWQgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucmVuZGVyRnJhbWUuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZVVwZGF0ZUhhbmRsZXJJZCA9IHNldFRpbWVvdXQodGhpcy5yZW5kZXJGcmFtZS5iaW5kKHRoaXMpLCB0aGlzLmZyYW1lSW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXJDb25maWcsIENvbnRhaW5lcn0gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Tm9BcmdzLCBFdmVudERpc3BhdGNoZXIsIEV2ZW50fSBmcm9tIFwiLi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi4vZG9tXCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFVJQ29udGFpbmVyfS5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVUlDb250YWluZXJDb25maWcgZXh0ZW5kcyBDb250YWluZXJDb25maWcge1xyXG4gICAgLy8gbm90aGluZyB0byBhZGRcclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBiYXNlIGNvbnRhaW5lciB0aGF0IGNvbnRhaW5zIGFsbCBvZiB0aGUgVUkuIFRoZSBVSUNvbnRhaW5lciBpcyBwYXNzZWQgdG8gdGhlIHtAbGluayBVSU1hbmFnZXJ9IHRvIGJ1aWxkIGFuZCBzZXR1cCB0aGUgVUkuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVUlDb250YWluZXIgZXh0ZW5kcyBDb250YWluZXI8VUlDb250YWluZXJDb25maWc+IHtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBTVEFURV9JRExFID0gXCJwbGF5ZXItc3RhdGUtaWRsZVwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgU1RBVEVfUExBWUlORyA9IFwicGxheWVyLXN0YXRlLXBsYXlpbmdcIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IFNUQVRFX1BBVVNFRCA9IFwicGxheWVyLXN0YXRlLXBhdXNlZFwiO1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgcmVhZG9ubHkgU1RBVEVfRklOSVNIRUQgPSBcInBsYXllci1zdGF0ZS1maW5pc2hlZFwiO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEZVTExTQ1JFRU4gPSBcImZ1bGxzY3JlZW5cIjtcclxuICAgIHByaXZhdGUgc3RhdGljIHJlYWRvbmx5IEJVRkZFUklORyA9IFwiYnVmZmVyaW5nXCI7XHJcblxyXG4gICAgcHJpdmF0ZSB1aUNvbnRhaW5lckV2ZW50cyA9IHtcclxuICAgICAgICBvbk1vdXNlRW50ZXI6IG5ldyBFdmVudERpc3BhdGNoZXI8VUlDb250YWluZXIsIE5vQXJncz4oKSxcclxuICAgICAgICBvbk1vdXNlTW92ZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxVSUNvbnRhaW5lciwgTm9BcmdzPigpLFxyXG4gICAgICAgIG9uTW91c2VMZWF2ZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxVSUNvbnRhaW5lciwgTm9BcmdzPigpXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVUlDb250YWluZXJDb25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbmZpZyA9IHRoaXMubWVyZ2VDb25maWcoY29uZmlnLCB7XHJcbiAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLXVpY29udGFpbmVyXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIHNlbGYub25Nb3VzZUVudGVyLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyKSB7XHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vbk1vdXNlRW50ZXIuZGlzcGF0Y2goc2VuZGVyKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZWxmLm9uTW91c2VNb3ZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyKSB7XHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTW92ZS5kaXNwYXRjaChzZW5kZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNlbGYub25Nb3VzZUxlYXZlLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyKSB7XHJcbiAgICAgICAgICAgIHVpbWFuYWdlci5vbk1vdXNlTGVhdmUuZGlzcGF0Y2goc2VuZGVyKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUGxheWVyIHN0YXRlc1xyXG4gICAgICAgIGxldCByZW1vdmVTdGF0ZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKHNlbGYucHJlZml4Q3NzKFVJQ29udGFpbmVyLlNUQVRFX0lETEUpKTtcclxuICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3Moc2VsZi5wcmVmaXhDc3MoVUlDb250YWluZXIuU1RBVEVfUExBWUlORykpO1xyXG4gICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhzZWxmLnByZWZpeENzcyhVSUNvbnRhaW5lci5TVEFURV9QQVVTRUQpKTtcclxuICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3Moc2VsZi5wcmVmaXhDc3MoVUlDb250YWluZXIuU1RBVEVfRklOSVNIRUQpKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJlbW92ZVN0YXRlcygpO1xyXG4gICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5hZGRDbGFzcyhzZWxmLnByZWZpeENzcyhVSUNvbnRhaW5lci5TVEFURV9JRExFKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZW1vdmVTdGF0ZXMoKTtcclxuICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoVUlDb250YWluZXIuU1RBVEVfUExBWUlORykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1BBVVNFRCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZW1vdmVTdGF0ZXMoKTtcclxuICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoVUlDb250YWluZXIuU1RBVEVfUEFVU0VEKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fUExBWUJBQ0tfRklOSVNIRUQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmVtb3ZlU3RhdGVzKCk7XHJcbiAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKHNlbGYucHJlZml4Q3NzKFVJQ29udGFpbmVyLlNUQVRFX0ZJTklTSEVEKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy8gSW5pdCBpbiBpZGxlIHN0YXRlXHJcbiAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoVUlDb250YWluZXIuU1RBVEVfSURMRSkpO1xyXG5cclxuICAgICAgICAvLyBGdWxsc2NyZWVuIG1hcmtlciBjbGFzc1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0ZVTExTQ1JFRU5fRU5URVIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoVUlDb250YWluZXIuRlVMTFNDUkVFTikpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX0ZVTExTQ1JFRU5fRVhJVCwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmdldERvbUVsZW1lbnQoKS5yZW1vdmVDbGFzcyhzZWxmLnByZWZpeENzcyhVSUNvbnRhaW5lci5GVUxMU0NSRUVOKSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEJ1ZmZlcmluZyBtYXJrZXIgY2xhc3NcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TVEFMTF9TVEFSVEVELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLmFkZENsYXNzKHNlbGYucHJlZml4Q3NzKFVJQ29udGFpbmVyLkJVRkZFUklORykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NUQUxMX0VOREVELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZUNsYXNzKHNlbGYucHJlZml4Q3NzKFVJQ29udGFpbmVyLkJVRkZFUklORykpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCB0b0RvbUVsZW1lbnQoKTogRE9NIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHN1cGVyLnRvRG9tRWxlbWVudCgpO1xyXG5cclxuICAgICAgICBjb250YWluZXIub24oXCJtb3VzZWVudGVyXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5vbk1vdXNlRW50ZXJFdmVudCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnRhaW5lci5vbihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYub25Nb3VzZU1vdmVFdmVudCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnRhaW5lci5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLm9uTW91c2VMZWF2ZUV2ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIERldGVjdCBmbGV4Ym94IHN1cHBvcnQgKG5vdCBzdXBwb3J0ZWQgaW4gSUU5KVxyXG4gICAgICAgIGlmIChkb2N1bWVudCAmJiB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIikuc3R5bGUuZmxleCAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBjb250YWluZXIuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoXCJmbGV4Ym94XCIpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb250YWluZXIuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoXCJuby1mbGV4Ym94XCIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb250YWluZXI7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uTW91c2VFbnRlckV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZUVudGVyLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBvbk1vdXNlTW92ZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZU1vdmUuZGlzcGF0Y2godGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIG9uTW91c2VMZWF2ZUV2ZW50KCkge1xyXG4gICAgICAgIHRoaXMudWlDb250YWluZXJFdmVudHMub25Nb3VzZUxlYXZlLmRpc3BhdGNoKHRoaXMpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0cyB0aGUgZXZlbnQgdGhhdCBpcyBmaXJlZCB3aGVuIHRoZSBtb3VzZSBlbnRlcnMgdGhlIFVJLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZUVudGVyKCk6IEV2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy51aUNvbnRhaW5lckV2ZW50cy5vbk1vdXNlRW50ZXIuZ2V0RXZlbnQoKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIGV2ZW50IHRoYXQgaXMgZmlyZWQgd2hlbiB0aGUgbW91c2UgbW92ZXMgd2l0aGluIFVJLlxyXG4gICAgICogQHJldHVybnMge0V2ZW50PFVJQ29udGFpbmVyLCBOb0FyZ3M+fVxyXG4gICAgICovXHJcbiAgICBnZXQgb25Nb3VzZU1vdmUoKTogRXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VNb3ZlLmdldEV2ZW50KCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBldmVudCB0aGF0IGlzIGZpcmVkIHdoZW4gdGhlIG1vdXNlIGxlYXZlcyB0aGUgVUkuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBvbk1vdXNlTGVhdmUoKTogRXZlbnQ8VUlDb250YWluZXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnVpQ29udGFpbmVyRXZlbnRzLm9uTW91c2VMZWF2ZS5nZXRFdmVudCgpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1NlbGVjdEJveH0gZnJvbSBcIi4vc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7TGlzdFNlbGVjdG9yQ29uZmlnfSBmcm9tIFwiLi9saXN0c2VsZWN0b3JcIjtcclxuaW1wb3J0IHtVSU1hbmFnZXJ9IGZyb20gXCIuLi91aW1hbmFnZXJcIjtcclxuXHJcbi8qKlxyXG4gKiBBIHNlbGVjdCBib3ggcHJvdmlkaW5nIGEgc2VsZWN0aW9uIGJldHdlZW4gXCJhdXRvXCIgYW5kIHRoZSBhdmFpbGFibGUgdmlkZW8gcXVhbGl0aWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZpZGVvUXVhbGl0eVNlbGVjdEJveCBleHRlbmRzIFNlbGVjdEJveCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBMaXN0U2VsZWN0b3JDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCB1cGRhdGVWaWRlb1F1YWxpdGllcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHZpZGVvUXVhbGl0aWVzID0gcGxheWVyLmdldEF2YWlsYWJsZVZpZGVvUXVhbGl0aWVzKCk7XHJcblxyXG4gICAgICAgICAgICBzZWxmLmNsZWFySXRlbXMoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCBlbnRyeSBmb3IgYXV0b21hdGljIHF1YWxpdHkgc3dpdGNoaW5nIChkZWZhdWx0IHNldHRpbmcpXHJcbiAgICAgICAgICAgIHNlbGYuYWRkSXRlbShcImF1dG9cIiwgXCJhdXRvXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHZpZGVvIHF1YWxpdGllc1xyXG4gICAgICAgICAgICBmb3IgKGxldCB2aWRlb1F1YWxpdHkgb2YgdmlkZW9RdWFsaXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuYWRkSXRlbSh2aWRlb1F1YWxpdHkuaWQsIHZpZGVvUXVhbGl0eS5sYWJlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZWxmLm9uSXRlbVNlbGVjdGVkLnN1YnNjcmliZShmdW5jdGlvbiAoc2VuZGVyOiBWaWRlb1F1YWxpdHlTZWxlY3RCb3gsIHZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICAgICAgcGxheWVyLnNldFZpZGVvUXVhbGl0eSh2YWx1ZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1NPVVJDRV9VTkxPQURFRCwgdXBkYXRlVmlkZW9RdWFsaXRpZXMpOyAvLyBVcGRhdGUgcXVhbGl0aWVzIHdoZW4gc291cmNlIGdvZXMgYXdheVxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1JFQURZLCB1cGRhdGVWaWRlb1F1YWxpdGllcyk7IC8vIFVwZGF0ZSBxdWFsaXRpZXMgd2hlbiBhIG5ldyBzb3VyY2UgaXMgbG9hZGVkXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVklERU9fRE9XTkxPQURfUVVBTElUWV9DSEFOR0VELCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gcGxheWVyLmdldERvd25sb2FkZWRWaWRlb0RhdGEoKTtcclxuICAgICAgICAgICAgc2VsZi5zZWxlY3RJdGVtKGRhdGEuaXNBdXRvID8gXCJhdXRvXCIgOiBkYXRhLmlkKTtcclxuICAgICAgICB9KTsgLy8gVXBkYXRlIHF1YWxpdHkgc2VsZWN0aW9uIHdoZW4gcXVhbGl0eSBpcyBjaGFuZ2VkIChmcm9tIG91dHNpZGUpXHJcblxyXG4gICAgICAgIC8vIFBvcHVsYXRlIHF1YWxpdGllcyBhdCBzdGFydHVwXHJcbiAgICAgICAgdXBkYXRlVmlkZW9RdWFsaXRpZXMoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDb250YWluZXIsIENvbnRhaW5lckNvbmZpZ30gZnJvbSBcIi4vY29udGFpbmVyXCI7XHJcbmltcG9ydCB7Vm9sdW1lU2xpZGVyfSBmcm9tIFwiLi92b2x1bWVzbGlkZXJcIjtcclxuaW1wb3J0IHtWb2x1bWVUb2dnbGVCdXR0b259IGZyb20gXCIuL3ZvbHVtZXRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQge1RpbWVvdXR9IGZyb20gXCIuLi90aW1lb3V0XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIFZvbHVtZUNvbnRyb2xCdXR0b259LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnIGV4dGVuZHMgQ29udGFpbmVyQ29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGRlbGF5IGFmdGVyIHdoaWNoIHRoZSB2b2x1bWUgc2xpZGVyIHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlcmUgaXMgbm8gdXNlciBpbnRlcmFjdGlvbi5cclxuICAgICAqIENhcmUgbXVzdCBiZSB0YWtlbiB0aGF0IHRoZSBkZWxheSBpcyBsb25nIGVub3VnaCBzbyB1c2VycyBjYW4gcmVhY2ggdGhlIHNsaWRlciBmcm9tIHRoZSB0b2dnbGUgYnV0dG9uLCBlLmcuIGJ5XHJcbiAgICAgKiBtb3VzZSBtb3ZlbWVudC4gSWYgdGhlIGRlbGF5IGlzIHRvbyBzaG9ydCwgdGhlIHNsaWRlcnMgZGlzYXBwZWFycyBiZWZvcmUgdGhlIG1vdXNlIHBvaW50ZXIgaGFzIHJlYWNoZWQgaXQgYW5kXHJcbiAgICAgKiB0aGUgdXNlciBpcyBub3QgYWJsZSB0byB1c2UgaXQuXHJcbiAgICAgKiBEZWZhdWx0OiA1MDBtc1xyXG4gICAgICovXHJcbiAgICBoaWRlRGVsYXk/OiBudW1iZXI7XHJcbiAgICAvKipcclxuICAgICAqIFNwZWNpZmllcyBpZiB0aGUgdm9sdW1lIHNsaWRlciBzaG91bGQgYmUgdmVydGljYWxseSBvciBob3Jpem9udGFsbHkgYWxpZ25lZC5cclxuICAgICAqIERlZmF1bHQ6IHRydWVcclxuICAgICAqL1xyXG4gICAgdmVydGljYWw/OiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogQSBjb21wb3NpdGUgdm9sdW1lIGNvbnRyb2wgdGhhdCBjb25zaXN0cyBvZiBhbmQgaW50ZXJuYWxseSBtYW5hZ2VzIGEgdm9sdW1lIGNvbnRyb2wgYnV0dG9uIHRoYXQgY2FuIGJlIHVzZWRcclxuICogZm9yIG11dGluZywgYW5kIGEgKGRlcGVuZGluZyBvbiB0aGUgQ1NTIHN0eWxlLCBlLmcuIHNsaWRlLW91dCkgdm9sdW1lIGNvbnRyb2wgYmFyLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIFZvbHVtZUNvbnRyb2xCdXR0b24gZXh0ZW5kcyBDb250YWluZXI8Vm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZz4ge1xyXG5cclxuICAgIHByaXZhdGUgdm9sdW1lVG9nZ2xlQnV0dG9uOiBWb2x1bWVUb2dnbGVCdXR0b247XHJcbiAgICBwcml2YXRlIHZvbHVtZVNsaWRlcjogVm9sdW1lU2xpZGVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogVm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy52b2x1bWVUb2dnbGVCdXR0b24gPSBuZXcgVm9sdW1lVG9nZ2xlQnV0dG9uKCk7XHJcbiAgICAgICAgdGhpcy52b2x1bWVTbGlkZXIgPSBuZXcgVm9sdW1lU2xpZGVyKHtcclxuICAgICAgICAgICAgdmVydGljYWw6IGNvbmZpZy52ZXJ0aWNhbCAhPSBudWxsID8gY29uZmlnLnZlcnRpY2FsIDogdHJ1ZSxcclxuICAgICAgICAgICAgaGlkZGVuOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdm9sdW1lY29udHJvbGJ1dHRvblwiLFxyXG4gICAgICAgICAgICBjb21wb25lbnRzOiBbdGhpcy52b2x1bWVUb2dnbGVCdXR0b24sIHRoaXMudm9sdW1lU2xpZGVyXSxcclxuICAgICAgICAgICAgaGlkZURlbGF5OiA1MDBcclxuICAgICAgICB9LCA8Vm9sdW1lQ29udHJvbEJ1dHRvbkNvbmZpZz50aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHZvbHVtZVRvZ2dsZUJ1dHRvbiA9IHRoaXMuZ2V0Vm9sdW1lVG9nZ2xlQnV0dG9uKCk7XHJcbiAgICAgICAgbGV0IHZvbHVtZVNsaWRlciA9IHRoaXMuZ2V0Vm9sdW1lU2xpZGVyKCk7XHJcblxyXG4gICAgICAgIGxldCB0aW1lb3V0ID0gbmV3IFRpbWVvdXQoKDxWb2x1bWVDb250cm9sQnV0dG9uQ29uZmlnPnNlbGYuZ2V0Q29uZmlnKCkpLmhpZGVEZWxheSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2b2x1bWVTbGlkZXIuaGlkZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFZvbHVtZSBTbGlkZXIgdmlzaWJpbGl0eSBoYW5kbGluZ1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogVGhlIHZvbHVtZSBzbGlkZXIgc2hhbGwgYmUgdmlzaWJsZSB3aGlsZSB0aGUgdXNlciBob3ZlcnMgdGhlIG11dGUgdG9nZ2xlIGJ1dHRvbiwgd2hpbGUgdGhlIHVzZXIgaG92ZXJzIHRoZVxyXG4gICAgICAgICAqIHZvbHVtZSBzbGlkZXIsIGFuZCB3aGlsZSB0aGUgdXNlciBzbGlkZXMgdGhlIHZvbHVtZSBzbGlkZXIuIElmIG5vbmUgb2YgdGhlc2Ugc2l0dWF0aW9ucyBhcmUgdHJ1ZSwgdGhlIHNsaWRlclxyXG4gICAgICAgICAqIHNoYWxsIGRpc2FwcGVhci5cclxuICAgICAgICAgKi9cclxuICAgICAgICBsZXQgdm9sdW1lU2xpZGVySG92ZXJlZCA9IGZhbHNlO1xyXG4gICAgICAgIHZvbHVtZVRvZ2dsZUJ1dHRvbi5nZXREb21FbGVtZW50KCkub24oXCJtb3VzZWVudGVyXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gU2hvdyB2b2x1bWUgc2xpZGVyIHdoZW4gbW91c2UgZW50ZXJzIHRoZSBidXR0b24gYXJlYVxyXG4gICAgICAgICAgICBpZiAodm9sdW1lU2xpZGVyLmlzSGlkZGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIHZvbHVtZVNsaWRlci5zaG93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gQXZvaWQgaGlkaW5nIG9mIHRoZSBzbGlkZXIgd2hlbiBidXR0b24gaXMgaG92ZXJlZFxyXG4gICAgICAgICAgICB0aW1lb3V0LmNsZWFyKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdm9sdW1lVG9nZ2xlQnV0dG9uLmdldERvbUVsZW1lbnQoKS5vbihcIm1vdXNlbGVhdmVcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAvLyBIaWRlIHNsaWRlciBkZWxheWVkIHdoZW4gYnV0dG9uIGlzIGxlZnRcclxuICAgICAgICAgICAgdGltZW91dC5yZXNldCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHZvbHVtZVNsaWRlci5nZXREb21FbGVtZW50KCkub24oXCJtb3VzZWVudGVyXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgc2xpZGVyIGlzIGVudGVyZWQsIGNhbmNlbCB0aGUgaGlkZSB0aW1lb3V0IGFjdGl2YXRlZCBieSBsZWF2aW5nIHRoZSBidXR0b25cclxuICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgICAgICB2b2x1bWVTbGlkZXJIb3ZlcmVkID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVTbGlkZXIuZ2V0RG9tRWxlbWVudCgpLm9uKFwibW91c2VsZWF2ZVwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gbW91c2UgbGVhdmVzIHRoZSBzbGlkZXIsIG9ubHkgaGlkZSBpdCBpZiB0aGVyZSBpcyBubyBzbGlkZSBvcGVyYXRpb24gaW4gcHJvZ3Jlc3NcclxuICAgICAgICAgICAgaWYgKHZvbHVtZVNsaWRlci5pc1NlZWtpbmcoKSkge1xyXG4gICAgICAgICAgICAgICAgdGltZW91dC5jbGVhcigpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGltZW91dC5yZXNldCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZvbHVtZVNsaWRlckhvdmVyZWQgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2b2x1bWVTbGlkZXIub25TZWVrZWQuc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gV2hlbiBhIHNsaWRlIG9wZXJhdGlvbiBpcyBkb25lIGFuZCB0aGUgc2xpZGVyIG5vdCBob3ZlcmVkIChtb3VzZSBvdXRzaWRlIHNsaWRlciksIGhpZGUgc2xpZGVyIGRlbGF5ZWRcclxuICAgICAgICAgICAgaWYgKCF2b2x1bWVTbGlkZXJIb3ZlcmVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lb3V0LnJlc2V0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFByb3ZpZGVzIGFjY2VzcyB0byB0aGUgaW50ZXJuYWxseSBtYW5hZ2VkIHZvbHVtZSB0b2dnbGUgYnV0dG9uLlxyXG4gICAgICogQHJldHVybnMge1ZvbHVtZVRvZ2dsZUJ1dHRvbn1cclxuICAgICAqL1xyXG4gICAgZ2V0Vm9sdW1lVG9nZ2xlQnV0dG9uKCk6IFZvbHVtZVRvZ2dsZUJ1dHRvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudm9sdW1lVG9nZ2xlQnV0dG9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUHJvdmlkZXMgYWNjZXNzIHRvIHRoZSBpbnRlcm5hbGx5IG1hbmFnZWQgdm9sdW1lIHNpbGRlci5cclxuICAgICAqIEByZXR1cm5zIHtWb2x1bWVTbGlkZXJ9XHJcbiAgICAgKi9cclxuICAgIGdldFZvbHVtZVNsaWRlcigpOiBWb2x1bWVTbGlkZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnZvbHVtZVNsaWRlcjtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtTZWVrQmFyLCBTZWVrQmFyQ29uZmlnfSBmcm9tIFwiLi9zZWVrYmFyXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBzaW1wbGUgdm9sdW1lIHNsaWRlciBjb21wb25lbnQgdG8gYWRqdXN0IHRoZSBwbGF5ZXIncyB2b2x1bWUgc2V0dGluZy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBWb2x1bWVTbGlkZXIgZXh0ZW5kcyBTZWVrQmFyIHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFNlZWtCYXJDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdm9sdW1lc2xpZGVyXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICBsZXQgdm9sdW1lQ2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0UGxheWJhY2tQb3NpdGlvbigwKTtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2V0QnVmZmVyUG9zaXRpb24oMCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldFBsYXliYWNrUG9zaXRpb24ocGxheWVyLmdldFZvbHVtZSgpKTtcclxuXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNldEJ1ZmZlclBvc2l0aW9uKHBsYXllci5nZXRWb2x1bWUoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9WT0xVTUVfQ0hBTkdFRCwgdm9sdW1lQ2hhbmdlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fTVVURUQsIHZvbHVtZUNoYW5nZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1VOTVVURUQsIHZvbHVtZUNoYW5nZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICB0aGlzLm9uU2Vla1ByZXZpZXcuc3Vic2NyaWJlKGZ1bmN0aW9uIChzZW5kZXIsIGFyZ3MpIHtcclxuICAgICAgICAgICAgaWYgKGFyZ3Muc2NydWJiaW5nKSB7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0Vm9sdW1lKGFyZ3MucG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5vblNlZWtlZC5zdWJzY3JpYmUoZnVuY3Rpb24gKHNlbmRlciwgcGVyY2VudGFnZSkge1xyXG4gICAgICAgICAgICBwbGF5ZXIuc2V0Vm9sdW1lKHBlcmNlbnRhZ2UpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBJbml0IHZvbHVtZSBiYXJcclxuICAgICAgICB2b2x1bWVDaGFuZ2VIYW5kbGVyKCk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9uLCBUb2dnbGVCdXR0b25Db25maWd9IGZyb20gXCIuL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4uL3VpbWFuYWdlclwiO1xyXG5pbXBvcnQgVm9sdW1lQ2hhbmdlRXZlbnQgPSBiaXRtb3Zpbi5wbGF5ZXIuVm9sdW1lQ2hhbmdlRXZlbnQ7XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCB0b2dnbGVzIGF1ZGlvIG11dGluZy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBWb2x1bWVUb2dnbGVCdXR0b24gZXh0ZW5kcyBUb2dnbGVCdXR0b248VG9nZ2xlQnV0dG9uQ29uZmlnPiB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBUb2dnbGVCdXR0b25Db25maWcgPSB7fSkge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcblxyXG4gICAgICAgIHRoaXMuY29uZmlnID0gdGhpcy5tZXJnZUNvbmZpZyhjb25maWcsIHtcclxuICAgICAgICAgICAgY3NzQ2xhc3M6IFwidWktdm9sdW1ldG9nZ2xlYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiVm9sdW1lL011dGVcIlxyXG4gICAgICAgIH0sIHRoaXMuY29uZmlnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25maWd1cmUocGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyLCB1aW1hbmFnZXI6IFVJTWFuYWdlcik6IHZvaWQge1xyXG4gICAgICAgIHN1cGVyLmNvbmZpZ3VyZShwbGF5ZXIsIHVpbWFuYWdlcik7XHJcblxyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgbGV0IG11dGVTdGF0ZUhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChwbGF5ZXIuaXNNdXRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9uKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm9mZigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fTVVURUQsIG11dGVTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1VOTVVURUQsIG11dGVTdGF0ZUhhbmRsZXIpO1xyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKHBsYXllci5pc011dGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci51bm11dGUoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBsYXllci5tdXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVk9MVU1FX0NIQU5HRUQsIGZ1bmN0aW9uIChldmVudDogVm9sdW1lQ2hhbmdlRXZlbnQpIHtcclxuICAgICAgICAgICAgLy8gVG9nZ2xlIGxvdyBjbGFzcyB0byBkaXNwbGF5IGxvdyB2b2x1bWUgaWNvbiBiZWxvdyA1MCUgdm9sdW1lXHJcbiAgICAgICAgICAgIGlmIChldmVudC50YXJnZXRWb2x1bWUgPCA1MCkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkuYWRkQ2xhc3Moc2VsZi5wcmVmaXhDc3MoXCJsb3dcIikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5nZXREb21FbGVtZW50KCkucmVtb3ZlQ2xhc3Moc2VsZi5wcmVmaXhDc3MoXCJsb3dcIikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFN0YXJ0dXAgaW5pdFxyXG4gICAgICAgIG11dGVTdGF0ZUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtUb2dnbGVCdXR0b24sIFRvZ2dsZUJ1dHRvbkNvbmZpZ30gZnJvbSBcIi4vdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VUlNYW5hZ2VyfSBmcm9tIFwiLi4vdWltYW5hZ2VyXCI7XHJcblxyXG4vKipcclxuICogQSBidXR0b24gdGhhdCB0b2dnbGVzIHRoZSB2aWRlbyB2aWV3IGJldHdlZW4gbm9ybWFsL21vbm8gYW5kIFZSL3N0ZXJlby5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBWUlRvZ2dsZUJ1dHRvbiBleHRlbmRzIFRvZ2dsZUJ1dHRvbjxUb2dnbGVCdXR0b25Db25maWc+IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFRvZ2dsZUJ1dHRvbkNvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS12cnRvZ2dsZWJ1dHRvblwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIlZSXCJcclxuICAgICAgICB9LCB0aGlzLmNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uZmlndXJlKHBsYXllcjogYml0bW92aW4ucGxheWVyLlBsYXllciwgdWltYW5hZ2VyOiBVSU1hbmFnZXIpOiB2b2lkIHtcclxuICAgICAgICBzdXBlci5jb25maWd1cmUocGxheWVyLCB1aW1hbmFnZXIpO1xyXG5cclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGxldCBpc1ZSQ29uZmlndXJlZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgLy8gVlIgYXZhaWxhYmlsaXR5IGNhbm5vdCBiZSBjaGVja2VkIHRocm91Z2ggZ2V0VlJTdGF0dXMoKSBiZWNhdXNlIGl0IGlzIGFzeW5jaHJvbm91c2x5IHBvcHVsYXRlZCBhbmQgbm90XHJcbiAgICAgICAgICAgIC8vIGF2YWlsYWJsZSBhdCBVSSBpbml0aWFsaXphdGlvbi4gQXMgYW4gYWx0ZXJuYXRpdmUsIHdlIGNoZWNrIHRoZSBWUiBzZXR0aW5ncyBpbiB0aGUgY29uZmlnLlxyXG4gICAgICAgICAgICAvLyBUT0RPIHVzZSBnZXRWUlN0YXR1cygpIHRocm91Z2ggaXNWUlN0ZXJlb0F2YWlsYWJsZSgpIG9uY2UgdGhlIHBsYXllciBoYXMgYmVlbiByZXdyaXR0ZW4gYW5kIHRoZSBzdGF0dXMgaXMgYXZhaWxhYmxlIGluIE9OX1JFQURZXHJcbiAgICAgICAgICAgIGxldCBjb25maWcgPSBwbGF5ZXIuZ2V0Q29uZmlnKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWcuc291cmNlICYmIGNvbmZpZy5zb3VyY2UudnIgJiYgY29uZmlnLnNvdXJjZS52ci5jb250ZW50VHlwZSAhPT0gXCJub25lXCI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IGlzVlJTdGVyZW9BdmFpbGFibGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5jb250ZW50VHlwZSAhPT0gXCJub25lXCI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgbGV0IHZyU3RhdGVIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNWUkNvbmZpZ3VyZWQoKSAmJiBpc1ZSU3RlcmVvQXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuc2hvdygpOyAvLyBzaG93IGJ1dHRvbiBpbiBjYXNlIGl0IGlzIGhpZGRlblxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZ2V0VlJTdGF0dXMoKS5pc1N0ZXJlbykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYub24oKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5vZmYoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuaGlkZSgpOyAvLyBoaWRlIGJ1dHRvbiBpZiBubyBzdGVyZW8gbW9kZSBhdmFpbGFibGVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxldCB2ckJ1dHRvblZpc2liaWxpdHlIYW5kbGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBpZiAoaXNWUkNvbmZpZ3VyZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zaG93KCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZSX01PREVfQ0hBTkdFRCwgdnJTdGF0ZUhhbmRsZXIpO1xyXG4gICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoYml0bW92aW4ucGxheWVyLkVWRU5ULk9OX1ZSX1NURVJFT19DSEFOR0VELCB2clN0YXRlSGFuZGxlcik7XHJcbiAgICAgICAgcGxheWVyLmFkZEV2ZW50SGFuZGxlcihiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQuT05fVlJfRVJST1IsIHZyU3RhdGVIYW5kbGVyKTtcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9TT1VSQ0VfVU5MT0FERUQsIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIpOyAvLyBIaWRlIGJ1dHRvbiB3aGVuIFZSIHNvdXJjZSBnb2VzIGF3YXlcclxuICAgICAgICBwbGF5ZXIuYWRkRXZlbnRIYW5kbGVyKGJpdG1vdmluLnBsYXllci5FVkVOVC5PTl9SRUFEWSwgdnJCdXR0b25WaXNpYmlsaXR5SGFuZGxlcik7IC8vIFNob3cgYnV0dG9uIHdoZW4gYSBuZXcgc291cmNlIGlzIGxvYWRlZCBhbmQgaXQncyBWUlxyXG5cclxuICAgICAgICBzZWxmLm9uQ2xpY2suc3Vic2NyaWJlKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKCFpc1ZSU3RlcmVvQXZhaWxhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb25zb2xlKSBjb25zb2xlLmxvZyhcIk5vIFZSIGNvbnRlbnRcIik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmdldFZSU3RhdHVzKCkuaXNTdGVyZW8pIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIuc2V0VlJTdGVyZW8odHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHN0YXJ0dXAgdmlzaWJpbGl0eVxyXG4gICAgICAgIHZyQnV0dG9uVmlzaWJpbGl0eUhhbmRsZXIoKTtcclxuICAgIH1cclxufSIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHtDbGlja092ZXJsYXksIENsaWNrT3ZlcmxheUNvbmZpZ30gZnJvbSBcIi4vY2xpY2tvdmVybGF5XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEge0BsaW5rIENsaWNrT3ZlcmxheX0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFdhdGVybWFya0NvbmZpZyBleHRlbmRzIENsaWNrT3ZlcmxheUNvbmZpZyB7XHJcbiAgICAvLyBub3RoaW5nIHlldFxyXG59XHJcblxyXG4vKipcclxuICogQSB3YXRlcm1hcmsgb3ZlcmxheSB3aXRoIGEgY2xpY2thYmxlIGxvZ28uXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgV2F0ZXJtYXJrIGV4dGVuZHMgQ2xpY2tPdmVybGF5IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IFdhdGVybWFya0NvbmZpZyA9IHt9KSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb25maWcgPSB0aGlzLm1lcmdlQ29uZmlnKGNvbmZpZywge1xyXG4gICAgICAgICAgICBjc3NDbGFzczogXCJ1aS13YXRlcm1hcmtcIixcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9iaXRtb3Zpbi5jb21cIlxyXG4gICAgICAgIH0sIDxXYXRlcm1hcmtDb25maWc+dGhpcy5jb25maWcpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9mZnNldCB7XHJcbiAgICBsZWZ0OiBudW1iZXI7XHJcbiAgICB0b3A6IG51bWJlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNpbXBsZSBET00gbWFuaXB1bGF0aW9uIGFuZCBET00gZWxlbWVudCBldmVudCBoYW5kbGluZyBtb2RlbGVkIGFmdGVyIGpRdWVyeSAoYXMgcmVwbGFjZW1lbnQgZm9yIGpRdWVyeSkuXHJcbiAqXHJcbiAqIExpa2UgalF1ZXJ5LCBET00gb3BlcmF0ZXMgb24gc2luZ2xlIGVsZW1lbnRzIGFuZCBsaXN0cyBvZiBlbGVtZW50cy4gRm9yIGV4YW1wbGU6IGNyZWF0aW5nIGFuIGVsZW1lbnQgcmV0dXJucyBhIERPTVxyXG4gKiBpbnN0YW5jZSB3aXRoIGEgc2luZ2xlIGVsZW1lbnQsIHNlbGVjdGluZyBlbGVtZW50cyByZXR1cm5zIGEgRE9NIGluc3RhbmNlIHdpdGggemVybywgb25lLCBvciBtYW55IGVsZW1lbnRzLiBTaW1pbGFyXHJcbiAqIHRvIGpRdWVyeSwgc2V0dGVycyB1c3VhbGx5IGFmZmVjdCBhbGwgZWxlbWVudHMsIHdoaWxlIGdldHRlcnMgb3BlcmF0ZSBvbiBvbmx5IHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gKiBBbHNvIHNpbWlsYXIgdG8galF1ZXJ5LCBtb3N0IG1ldGhvZHMgKGV4Y2VwdCBnZXR0ZXJzKSByZXR1cm4gdGhlIERPTSBpbnN0YW5jZSBmYWNpbGl0YXRpbmcgZWFzeSBjaGFpbmluZyBvZiBtZXRob2QgY2FsbHMuXHJcbiAqXHJcbiAqIEJ1aWx0IHdpdGggdGhlIGhlbHAgb2Y6IGh0dHA6Ly95b3VtaWdodG5vdG5lZWRqcXVlcnkuY29tL1xyXG4gKi9cclxuZXhwb3J0IGNsYXNzIERPTSB7XHJcblxyXG4gICAgcHJpdmF0ZSBkb2N1bWVudDogRG9jdW1lbnQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGlzdCBvZiBlbGVtZW50cyB0aGF0IHRoZSBpbnN0YW5jZSB3cmFwcy4gVGFrZSBjYXJlIHRoYXQgbm90IGFsbCBtZXRob2RzIGNhbiBvcGVyYXRlIG9uIHRoZSB3aG9sZSBsaXN0LFxyXG4gICAgICogZ2V0dGVycyB1c3VhbGx5IGp1c3Qgd29yayBvbiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBlbGVtZW50czogSFRNTEVsZW1lbnRbXTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBET00gZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSB0YWdOYW1lIHRoZSB0YWcgbmFtZSBvZiB0aGUgRE9NIGVsZW1lbnRcclxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVzIGEgbGlzdCBvZiBhdHRyaWJ1dGVzIG9mIHRoZSBlbGVtZW50XHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKHRhZ05hbWU6IHN0cmluZywgYXR0cmlidXRlczogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZWxlY3RzIGFsbCBlbGVtZW50cyBmcm9tIHRoZSBET00gdGhhdCBtYXRjaCB0aGUgc3BlY2lmaWVkIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBtYXRjaCBET00gZWxlbWVudHMgd2l0aFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvcihzZWxlY3Rvcjogc3RyaW5nKTtcclxuICAgIC8qKlxyXG4gICAgICogV3JhcHMgYSBwbGFpbiBIVE1MRWxlbWVudCB3aXRoIGEgRE9NIGluc3RhbmNlLlxyXG4gICAgICogQHBhcmFtIGVsZW1lbnQgdGhlIEhUTUxFbGVtZW50IHRvIHdyYXAgd2l0aCBET01cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXcmFwcyBhIGxpc3Qgb2YgcGxhaW4gSFRNTEVsZW1lbnRzIHdpdGggYSBET00gaW5zdGFuY2UuXHJcbiAgICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgSFRNTEVsZW1lbnRzIHRvIHdyYXAgd2l0aCBET01cclxuICAgICAqL1xyXG4gICAgY29uc3RydWN0b3IoZWxlbWVudHM6IEhUTUxFbGVtZW50W10pO1xyXG4gICAgLyoqXHJcbiAgICAgKiBXcmFwcyB0aGUgZG9jdW1lbnQgd2l0aCBhIERPTSBpbnN0YW5jZS4gVXNlZnVsIHRvIGF0dGFjaCBldmVudCBsaXN0ZW5lcnMgdG8gdGhlIGRvY3VtZW50LlxyXG4gICAgICogQHBhcmFtIGRvY3VtZW50IHRoZSBkb2N1bWVudCB0byB3cmFwXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50OiBEb2N1bWVudCk7XHJcbiAgICBjb25zdHJ1Y3Rvcihzb21ldGhpbmc6IHN0cmluZyB8IEhUTUxFbGVtZW50IHwgSFRNTEVsZW1lbnRbXSB8IERvY3VtZW50LCBhdHRyaWJ1dGVzPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0pIHtcclxuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7IC8vIFNldCB0aGUgZ2xvYmFsIGRvY3VtZW50IHRvIHRoZSBsb2NhbCBkb2N1bWVudCBmaWVsZFxyXG5cclxuICAgICAgICBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgaWYgKHNvbWV0aGluZy5sZW5ndGggPiAwICYmIHNvbWV0aGluZ1swXSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZWxlbWVudHMgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnRzID0gZWxlbWVudHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoc29tZXRoaW5nIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IGVsZW1lbnQgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHNvbWV0aGluZyBpbnN0YW5jZW9mIERvY3VtZW50KSB7XHJcbiAgICAgICAgICAgIC8vIFdoZW4gYSBkb2N1bWVudCBpcyBwYXNzZWQgaW4sIHdlIGRvIG5vdCBkbyBhbnl0aGluZyB3aXRoIGl0LCBidXQgYnkgc2V0dGluZyB0aGlzLmVsZW1lbnRzIHRvIG51bGxcclxuICAgICAgICAgICAgLy8gd2UgZ2l2ZSB0aGUgZXZlbnQgaGFuZGxpbmcgbWV0aG9kIGEgbWVhbnMgdG8gZGV0ZWN0IGlmIHRoZSBldmVudHMgc2hvdWxkIGJlIHJlZ2lzdGVyZWQgb24gdGhlIGRvY3VtZW50XHJcbiAgICAgICAgICAgIC8vIGluc3RlYWQgb2YgZWxlbWVudHMuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWdOYW1lID0gc29tZXRoaW5nO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBhdHRyaWJ1dGVOYW1lIGluIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhdHRyaWJ1dGVWYWx1ZSA9IGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lLCBhdHRyaWJ1dGVWYWx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBbZWxlbWVudF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBzb21ldGhpbmc7XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSB0aGlzLmZpbmRDaGlsZEVsZW1lbnRzKHNlbGVjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgdGhhdCB0aGlzIERPTSBpbnN0YW5jZSBjdXJyZW50bHkgaG9sZHMuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGdldCBsZW5ndGgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50cyA/IHRoaXMuZWxlbWVudHMubGVuZ3RoIDogMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEdldHMgdGhlIEhUTUwgZWxlbWVudHMgdGhhdCB0aGlzIERPTSBpbnN0YW5jZSBjdXJyZW50bHkgaG9sZHMuXHJcbiAgICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRbXX0gdGhlIHJhdyBIVE1MIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuICAgIGdldEVsZW1lbnRzKCk6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQSBzaG9ydGN1dCBtZXRob2QgZm9yIGl0ZXJhdGluZyBhbGwgZWxlbWVudHMuIFNob3J0cyB0aGlzLmVsZW1lbnRzLmZvckVhY2goLi4uKSB0byB0aGlzLmZvckVhY2goLi4uKS5cclxuICAgICAqIEBwYXJhbSBoYW5kbGVyIHRoZSBoYW5kbGVyIHRvIGV4ZWN1dGUgYW4gb3BlcmF0aW9uIG9uIGFuIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgcHJpdmF0ZSBmb3JFYWNoKGhhbmRsZXI6IChlbGVtZW50OiBIVE1MRWxlbWVudCkgPT4gdm9pZCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBoYW5kbGVyKGVsZW1lbnQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmluZENoaWxkRWxlbWVudHNPZkVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQgfCBEb2N1bWVudCwgc2VsZWN0b3I6IHN0cmluZyk6IEhUTUxFbGVtZW50W10ge1xyXG4gICAgICAgIGxldCBjaGlsZEVsZW1lbnRzID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCBOb2RlTGlzdCB0byBBcnJheVxyXG4gICAgICAgIC8vIGh0dHBzOi8vdG9kZG1vdHRvLmNvbS9hLWNvbXByZWhlbnNpdmUtZGl2ZS1pbnRvLW5vZGVsaXN0cy1hcnJheXMtY29udmVydGluZy1ub2RlbGlzdHMtYW5kLXVuZGVyc3RhbmRpbmctdGhlLWRvbS9cclxuICAgICAgICByZXR1cm4gW10uc2xpY2UuY2FsbChjaGlsZEVsZW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGZpbmRDaGlsZEVsZW1lbnRzKHNlbGVjdG9yOiBzdHJpbmcpOiBIVE1MRWxlbWVudFtdIHtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgbGV0IGFsbENoaWxkRWxlbWVudHMgPSA8SFRNTEVsZW1lbnRbXT5bXTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZWxlbWVudHMpIHtcclxuICAgICAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBhbGxDaGlsZEVsZW1lbnRzID0gYWxsQ2hpbGRFbGVtZW50cy5jb25jYXQoc2VsZi5maW5kQ2hpbGRFbGVtZW50c09mRWxlbWVudChlbGVtZW50LCBzZWxlY3RvcikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbmRDaGlsZEVsZW1lbnRzT2ZFbGVtZW50KGRvY3VtZW50LCBzZWxlY3Rvcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYWxsQ2hpbGRFbGVtZW50cztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmRzIGFsbCBjaGlsZCBlbGVtZW50cyBvZiBhbGwgZWxlbWVudHMgbWF0Y2hpbmcgdGhlIHN1cHBsaWVkIHNlbGVjdG9yLlxyXG4gICAgICogQHBhcmFtIHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBtYXRjaCB3aXRoIGNoaWxkIGVsZW1lbnRzXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfSBhIG5ldyBET00gaW5zdGFuY2UgcmVwcmVzZW50aW5nIGFsbCBtYXRjaGVkIGNoaWxkcmVuXHJcbiAgICAgKi9cclxuICAgIGZpbmQoc2VsZWN0b3I6IHN0cmluZyk6IERPTSB7XHJcbiAgICAgICAgbGV0IGFsbENoaWxkRWxlbWVudHMgPSB0aGlzLmZpbmRDaGlsZEVsZW1lbnRzKHNlbGVjdG9yKTtcclxuICAgICAgICByZXR1cm4gbmV3IERPTShhbGxDaGlsZEVsZW1lbnRzKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgb2YgdGhlIGlubmVyIEhUTUwgY29udGVudCBvZiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqL1xyXG4gICAgaHRtbCgpOiBzdHJpbmc7XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgdGhlIGlubmVyIEhUTUwgY29udGVudCBvZiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gY29udGVudCBhIHN0cmluZyBvZiBwbGFpbiB0ZXh0IG9yIEhUTUwgbWFya3VwXHJcbiAgICAgKi9cclxuICAgIGh0bWwoY29udGVudDogc3RyaW5nKTogRE9NO1xyXG4gICAgaHRtbChjb250ZW50Pzogc3RyaW5nKTogc3RyaW5nIHwgRE9NIHtcclxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0SHRtbChjb250ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEh0bWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRIdG1sKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLmlubmVySFRNTDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEh0bWwoY29udGVudDogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkIHx8IGNvbnRlbnQgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAvLyBTZXQgdG8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIGlubmVySFRNTCBnZXR0aW5nIHNldCB0byBcInVuZGVmaW5lZFwiIChhbGwgYnJvd3NlcnMpIG9yIFwibnVsbFwiIChJRTkpXHJcbiAgICAgICAgICAgIGNvbnRlbnQgPSBcIlwiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gY29udGVudDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDbGVhcnMgdGhlIGlubmVyIEhUTUwgb2YgYWxsIGVsZW1lbnRzIChkZWxldGVzIGFsbCBjaGlsZHJlbikuXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBlbXB0eSgpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBmaXJzdCBmb3JtIGVsZW1lbnQsIGUuZy4gdGhlIHNlbGVjdGVkIHZhbHVlIG9mIGEgc2VsZWN0IGJveCBvciB0aGUgdGV4dCBpZiBhbiBpbnB1dCBmaWVsZC5cclxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSB2YWx1ZSBvZiBhIGZvcm0gZWxlbWVudFxyXG4gICAgICovXHJcbiAgICB2YWwoKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudHNbMF07XHJcblxyXG4gICAgICAgIGlmIChlbGVtZW50IGluc3RhbmNlb2YgSFRNTFNlbGVjdEVsZW1lbnQgfHwgZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxJbnB1dEVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBUT0RPIGFkZCBzdXBwb3J0IGZvciBtaXNzaW5nIGZvcm0gZWxlbWVudHNcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGB2YWwoKSBub3Qgc3VwcG9ydGVkIGZvciAke3R5cGVvZiBlbGVtZW50fWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGFuIGF0dHJpYnV0ZSBvbiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGVcclxuICAgICAqL1xyXG4gICAgYXR0cihhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGw7XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYW4gYXR0cmlidXRlIG9uIGFsbCBlbGVtZW50cy5cclxuICAgICAqIEBwYXJhbSBhdHRyaWJ1dGUgdGhlIG5hbWUgb2YgdGhlIGF0dHJpYnV0ZVxyXG4gICAgICogQHBhcmFtIHZhbHVlIHRoZSB2YWx1ZSBvZiB0aGUgYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIGF0dHIoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET007XHJcbiAgICBhdHRyKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZyk6IHN0cmluZyB8IG51bGwgfCBET00ge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRBdHRyKGF0dHJpYnV0ZSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cihhdHRyaWJ1dGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEF0dHIoYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldEF0dHIoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJldHVybnMgdGhlIHZhbHVlIG9mIGEgZGF0YSBlbGVtZW50IG9uIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHBhcmFtIGRhdGFBdHRyaWJ1dGUgdGhlIG5hbWUgb2YgdGhlIGRhdGEgYXR0cmlidXRlIHdpdGhvdXQgdGhlIFwiZGF0YS1cIiBwcmVmaXhcclxuICAgICAqL1xyXG4gICAgZGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIGEgZGF0YSBhdHRyaWJ1dGUgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGRhdGFBdHRyaWJ1dGUgdGhlIG5hbWUgb2YgdGhlIGRhdGEgYXR0cmlidXRlIHdpdGhvdXQgdGhlIFwiZGF0YS1cIiBwcmVmaXhcclxuICAgICAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgb2YgdGhlIGRhdGEgYXR0cmlidXRlXHJcbiAgICAgKi9cclxuICAgIGRhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NO1xyXG4gICAgZGF0YShkYXRhQXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlPzogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB8IERPTSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnNldERhdGEoZGF0YUF0dHJpYnV0ZSwgdmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RGF0YShkYXRhQXR0cmlidXRlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXREYXRhKGRhdGFBdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLmdldEF0dHJpYnV0ZShcImRhdGEtXCIgKyBkYXRhQXR0cmlidXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNldERhdGEoZGF0YUF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJkYXRhLVwiICsgZGF0YUF0dHJpYnV0ZSwgdmFsdWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQXBwZW5kcyBvbmUgb3IgbW9yZSBET00gZWxlbWVudHMgYXMgY2hpbGRyZW4gdG8gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNoaWxkRWxlbWVudHMgdGhlIGNocmlsZCBlbGVtZW50cyB0byBhcHBlbmRcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIGFwcGVuZCguLi5jaGlsZEVsZW1lbnRzOiBET01bXSk6IERPTSB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGNoaWxkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoY2hpbGRFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZEVsZW1lbnQuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoXywgaW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGNoaWxkRWxlbWVudC5lbGVtZW50c1tpbmRleF0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVtb3ZlcyBhbGwgZWxlbWVudHMgZnJvbSB0aGUgRE9NLlxyXG4gICAgICovXHJcbiAgICByZW1vdmUoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnQgPSBlbGVtZW50LnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHBhcmVudC5yZW1vdmVDaGlsZChlbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgb2Zmc2V0IG9mIHRoZSBmaXJzdCBlbGVtZW50IGZyb20gdGhlIGRvY3VtZW50J3MgdG9wIGxlZnQgY29ybmVyLlxyXG4gICAgICogQHJldHVybnMge09mZnNldH1cclxuICAgICAqL1xyXG4gICAgb2Zmc2V0KCk6IE9mZnNldCB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRzWzBdO1xyXG4gICAgICAgIGxldCBlbGVtZW50UmVjdCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgbGV0IGh0bWxSZWN0ID0gZG9jdW1lbnQuYm9keS5wYXJlbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuICAgICAgICAvLyBWaXJ0dWFsIHZpZXdwb3J0IHNjcm9sbCBoYW5kbGluZyAoZS5nLiBwaW5jaCB6b29tZWQgdmlld3BvcnRzIGluIG1vYmlsZSBicm93c2VycyBvciBkZXNrdG9wIENocm9tZS9FZGdlKVxyXG4gICAgICAgIC8vIFwibm9ybWFsXCIgem9vbXMgYW5kIHZpcnR1YWwgdmlld3BvcnQgem9vbXMgKGFrYSBsYXlvdXQgdmlld3BvcnQpIHJlc3VsdCBpbiBkaWZmZXJlbnRcclxuICAgICAgICAvLyBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpIHJlc3VsdHM6XHJcbiAgICAgICAgLy8gIC0gd2l0aCBub3JtYWwgc2Nyb2xscywgdGhlIGNsaWVudFJlY3QgZGVjcmVhc2VzIHdpdGggYW4gaW5jcmVhc2UgaW4gc2Nyb2xsKFRvcHxMZWZ0KS9wYWdlKFh8WSlPZmZzZXRcclxuICAgICAgICAvLyAgLSB3aXRoIHBpbmNoIHpvb20gc2Nyb2xscywgdGhlIGNsaWVudFJlY3Qgc3RheXMgdGhlIHNhbWUgd2hpbGUgc2Nyb2xsL3BhZ2VPZmZzZXQgY2hhbmdlc1xyXG4gICAgICAgIC8vIFRoaXMgbWVhbnMsIHRoYXQgdGhlIGNvbWJpbmF0aW9uIG9mIGNsaWVudFJlY3QgKyBzY3JvbGwvcGFnZU9mZnNldCBkb2VzIG5vdCB3b3JrIHRvIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0XHJcbiAgICAgICAgLy8gZnJvbSB0aGUgZG9jdW1lbnQncyB1cHBlciBsZWZ0IG9yaWdpbiB3aGVuIHBpbmNoIHpvb20gaXMgdXNlZC5cclxuICAgICAgICAvLyBUbyB3b3JrIGFyb3VuZCB0aGlzIGlzc3VlLCB3ZSBkbyBub3QgdXNlIHNjcm9sbC9wYWdlT2Zmc2V0IGJ1dCBnZXQgdGhlIGNsaWVudFJlY3Qgb2YgdGhlIGh0bWwgZWxlbWVudCBhbmRcclxuICAgICAgICAvLyBzdWJ0cmFjdCBpdCBmcm9tIHRoZSBlbGVtZW50J3MgcmVjdCwgd2hpY2ggYWx3YXlzIHJlc3VsdHMgaW4gdGhlIG9mZnNldCBmcm9tIHRoZSBkb2N1bWVudCBvcmlnaW4uXHJcbiAgICAgICAgLy8gTk9URTogdGhlIGN1cnJlbnQgd2F5IG9mIG9mZnNldCBjYWxjdWxhdGlvbiB3YXMgaW1wbGVtZW50ZWQgc3BlY2lmaWNhbGx5IHRvIHRyYWNrIGV2ZW50IHBvc2l0aW9ucyBvbiB0aGVcclxuICAgICAgICAvLyBzZWVrIGJhciwgYW5kIGl0IG1pZ2h0IGJyZWFrIGNvbXBhdGliaWxpdHkgd2l0aCBqUXVlcnkncyBvZmZzZXQoKSBtZXRob2QuIElmIHRoaXMgZXZlciB0dXJucyBvdXQgdG8gYmUgYVxyXG4gICAgICAgIC8vIHByb2JsZW0sIHRoaXMgbWV0aG9kIHNob3VsZCBiZSByZXZlcnRlZCB0byB0aGUgb2xkIHZlcnNpb24gYW5kIHRoZSBvZmZzZXQgY2FsY3VsYXRpb24gbW92ZWQgdG8gdGhlIHNlZWsgYmFyLlxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0b3A6IGVsZW1lbnRSZWN0LnRvcCAtIGh0bWxSZWN0LnRvcCxcclxuICAgICAgICAgICAgbGVmdDogZWxlbWVudFJlY3QubGVmdCAtIGh0bWxSZWN0LmxlZnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgd2lkdGggb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSB0aGUgd2lkdGggb2YgdGhlIGZpcnN0IGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgd2lkdGgoKTogbnVtYmVyIHtcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlmIHRoaXMgaXMgdGhlIHNhbWUgYXMgalF1ZXJ5J3Mgd2lkdGgoKSAocHJvYmFibHkgbm90KVxyXG4gICAgICAgIHJldHVybiB0aGlzLmVsZW1lbnRzWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICogQHJldHVybnMge251bWJlcn0gdGhlIGhlaWdodCBvZiB0aGUgZmlyc3QgZWxlbWVudFxyXG4gICAgICovXHJcbiAgICBoZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICAvLyBUT0RPIGNoZWNrIGlmIHRoaXMgaXMgdGhlIHNhbWUgYXMgalF1ZXJ5J3MgaGVpZ2h0KCkgKHByb2JhYmx5IG5vdClcclxuICAgICAgICByZXR1cm4gdGhpcy5lbGVtZW50c1swXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBdHRhY2hlcyBhbiBldmVudCBoYW5kbGVyIHRvIG9uZSBvciBtb3JlIGV2ZW50cyBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIHRoZSBldmVudCBuYW1lIChvciBtdWx0aXBsZSBuYW1lcyBzZXBhcmF0ZWQgYnkgc3BhY2UpIHRvIGxpc3RlbiB0b1xyXG4gICAgICogQHBhcmFtIGV2ZW50SGFuZGxlciB0aGUgZXZlbnQgaGFuZGxlciB0byBjYWxsIHdoZW4gdGhlIGV2ZW50IGZpcmVzXHJcbiAgICAgKiBAcmV0dXJucyB7RE9NfVxyXG4gICAgICovXHJcbiAgICBvbihldmVudE5hbWU6IHN0cmluZywgZXZlbnRIYW5kbGVyOiBFdmVudExpc3RlbmVyT3JFdmVudExpc3RlbmVyT2JqZWN0KTogRE9NIHtcclxuICAgICAgICBsZXQgZXZlbnRzID0gZXZlbnROYW1lLnNwbGl0KFwiIFwiKTtcclxuICAgICAgICBsZXQgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5lbGVtZW50cyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGV2ZW50SGFuZGxlcik7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlbW92ZXMgYW4gZXZlbnQgaGFuZGxlciBmcm9tIG9uZSBvciBtb3JlIGV2ZW50cyBvbiBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gZXZlbnROYW1lIHRoZSBldmVudCBuYW1lIChvciBtdWx0aXBsZSBuYW1lcyBzZXBhcmF0ZWQgYnkgc3BhY2UpIHRvIHJlbW92ZSB0aGUgaGFuZGxlciBmcm9tXHJcbiAgICAgKiBAcGFyYW0gZXZlbnRIYW5kbGVyIHRoZSBldmVudCBoYW5kbGVyIHRvIHJlbW92ZVxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgb2ZmKGV2ZW50TmFtZTogc3RyaW5nLCBldmVudEhhbmRsZXI6IEV2ZW50TGlzdGVuZXJPckV2ZW50TGlzdGVuZXJPYmplY3QpOiBET00ge1xyXG4gICAgICAgIGxldCBldmVudHMgPSBldmVudE5hbWUuc3BsaXQoXCIgXCIpO1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLmVsZW1lbnRzID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnRIYW5kbGVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZXZlbnRIYW5kbGVyKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkcyB0aGUgc3BlY2lmaWVkIGNsYXNzKGVzKSB0byBhbGwgZWxlbWVudHMuXHJcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lIHRoZSBjbGFzcyhlcykgdG8gYWRkLCBtdWx0aXBsZSBjbGFzc2VzIHNlcGFyYXRlZCBieSBzcGFjZVxyXG4gICAgICogQHJldHVybnMge0RPTX1cclxuICAgICAqL1xyXG4gICAgYWRkQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgKz0gXCIgXCIgKyBjbGFzc05hbWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVkIHRoZSBzcGVjaWZpZWQgY2xhc3MoZXMpIGZyb20gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIGNsYXNzTmFtZSB0aGUgY2xhc3MoZXMpIHRvIHJlbW92ZSwgbXVsdGlwbGUgY2xhc3NlcyBzZXBhcmF0ZWQgYnkgc3BhY2VcclxuICAgICAqIEByZXR1cm5zIHtET019XHJcbiAgICAgKi9cclxuICAgIHJlbW92ZUNsYXNzKGNsYXNzTmFtZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoY2xhc3NOYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lID0gZWxlbWVudC5jbGFzc05hbWUucmVwbGFjZShuZXcgUmVnRXhwKFwiKF58XFxcXGIpXCIgKyBjbGFzc05hbWUuc3BsaXQoXCIgXCIpLmpvaW4oXCJ8XCIpICsgXCIoXFxcXGJ8JClcIiwgXCJnaVwiKSwgXCIgXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2hlY2tzIGlmIGFueSBvZiB0aGUgZWxlbWVudHMgaGFzIHRoZSBzcGVjaWZpZWQgY2xhc3MuXHJcbiAgICAgKiBAcGFyYW0gY2xhc3NOYW1lIHRoZSBjbGFzcyBuYW1lIHRvIGNoZWNrXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiBvbmUgb2YgdGhlIGVsZW1lbnRzIGhhcyB0aGUgY2xhc3MgYXR0YWNoZWQsIGVsc2UgaWYgbm8gZWxlbWVudCBoYXMgaXQgYXR0YWNoZWRcclxuICAgICAqL1xyXG4gICAgaGFzQ2xhc3MoY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgaGFzQ2xhc3MgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uIChlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3ZSBhcmUgaW5zaWRlIGEgaGFuZGxlciwgd2UgY2FuJ3QganVzdCBcInJldHVybiB0cnVlXCIuIEluc3RlYWQsIHdlIHNhdmUgaXQgdG8gYSB2YXJpYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGFuZCByZXR1cm4gaXQgYXQgdGhlIGVuZCBvZiB0aGUgZnVuY3Rpb24gYm9keS5cclxuICAgICAgICAgICAgICAgICAgICBoYXNDbGFzcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV3IFJlZ0V4cChcIihefCApXCIgKyBjbGFzc05hbWUgKyBcIiggfCQpXCIsIFwiZ2lcIikudGVzdChlbGVtZW50LmNsYXNzTmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBTZWUgY29tbWVudCBhYm92ZVxyXG4gICAgICAgICAgICAgICAgICAgIGhhc0NsYXNzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gaGFzQ2xhc3M7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBhIENTUyBwcm9wZXJ0eSBvZiB0aGUgZmlyc3QgZWxlbWVudC5cclxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgdGhlIG5hbWUgb2YgdGhlIENTUyBwcm9wZXJ0eSB0byByZXRyaWV2ZSB0aGUgdmFsdWUgb2ZcclxuICAgICAqL1xyXG4gICAgY3NzKHByb3BlcnR5TmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbDtcclxuICAgIC8qKlxyXG4gICAgICogU2V0cyB0aGUgdmFsdWUgb2YgYSBDU1MgcHJvcGVydHkgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIHByb3BlcnR5TmFtZSB0aGUgbmFtZSBvZiB0aGUgQ1NTIHByb3BlcnR5IHRvIHNldCB0aGUgdmFsdWUgZm9yXHJcbiAgICAgKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHRvIHNldCBmb3IgdGhlIGdpdmVuIENTUyBwcm9wZXJ0eVxyXG4gICAgICovXHJcbiAgICBjc3MocHJvcGVydHlOYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBET007XHJcbiAgICAvKipcclxuICAgICAqIFNldHMgYSBjb2xsZWN0aW9uIG9mIENTUyBwcm9wZXJ0aWVzIGFuZCB0aGVpciB2YWx1ZXMgb24gYWxsIGVsZW1lbnRzLlxyXG4gICAgICogQHBhcmFtIHByb3BlcnR5VmFsdWVDb2xsZWN0aW9uIGFuIG9iamVjdCBjb250YWluaW5nIHBhaXJzIG9mIHByb3BlcnR5IG5hbWVzIGFuZCB0aGVpciB2YWx1ZXNcclxuICAgICAqL1xyXG4gICAgY3NzKHByb3BlcnR5VmFsdWVDb2xsZWN0aW9uOiB7W3Byb3BlcnR5TmFtZTogc3RyaW5nXTogc3RyaW5nfSk6IERPTTtcclxuICAgIGNzcyhwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb246IHN0cmluZyB8IHtbcHJvcGVydHlOYW1lOiBzdHJpbmddOiBzdHJpbmd9LCB2YWx1ZT86IHN0cmluZyk6IHN0cmluZyB8IG51bGwgfCBET00ge1xyXG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHlOYW1lT3JDb2xsZWN0aW9uID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0eU5hbWUgPSBwcm9wZXJ0eU5hbWVPckNvbGxlY3Rpb247XHJcblxyXG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0Q3NzKHByb3BlcnR5TmFtZSwgdmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3NzKHByb3BlcnR5TmFtZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBwcm9wZXJ0eVZhbHVlQ29sbGVjdGlvbiA9IHByb3BlcnR5TmFtZU9yQ29sbGVjdGlvbjtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2V0Q3NzQ29sbGVjdGlvbihwcm9wZXJ0eVZhbHVlQ29sbGVjdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0Q3NzKHByb3BlcnR5TmFtZTogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgcmV0dXJuIGdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50c1swXSlbPGFueT5wcm9wZXJ0eU5hbWVdO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2V0Q3NzKHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogRE9NIHtcclxuICAgICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgLy8gPGFueT4gY2FzdCB0byByZXNvbHZlIFRTNzAxNTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzY2MjcxMTQvMzcwMjUyXHJcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbPGFueT5wcm9wZXJ0eU5hbWVdID0gdmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZXRDc3NDb2xsZWN0aW9uKHJ1bGVWYWx1ZUNvbGxlY3Rpb246IHtbcnVsZU5hbWU6IHN0cmluZ106IHN0cmluZ30pOiBET00ge1xyXG4gICAgICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zNDQ5MDU3My8zNzAyNTJcclxuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbihlbGVtZW50LnN0eWxlLCBydWxlVmFsdWVDb2xsZWN0aW9uKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge0FycmF5VXRpbHN9IGZyb20gXCIuL3V0aWxzXCI7XHJcbi8qKlxyXG4gKiBGdW5jdGlvbiBpbnRlcmZhY2UgZm9yIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUge0BsaW5rIEV2ZW50RGlzcGF0Y2hlcn0uXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiB7XHJcbiAgICAoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpOiB2b2lkO1xyXG59XHJcblxyXG4vKipcclxuICogRW1wdHkgdHlwZSBmb3IgY3JlYXRpbmcge0BsaW5rIEV2ZW50RGlzcGF0Y2hlciBldmVudCBkaXNwYXRjaGVyc30gdGhhdCBkbyBub3QgY2FycnkgYW55IGFyZ3VtZW50cy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTm9BcmdzIHtcclxufVxyXG5cclxuLyoqXHJcbiAqIFB1YmxpYyBpbnRlcmZhY2UgdGhhdCByZXByZXNlbnRzIGFuIGV2ZW50LiBDYW4gYmUgdXNlZCB0byBzdWJzY3JpYmUgdG8gYW5kIHVuc3Vic2NyaWJlIGZyb20gZXZlbnRzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBFdmVudDxTZW5kZXIsIEFyZ3M+IHtcclxuICAgIC8qKlxyXG4gICAgICogU3Vic2NyaWJlcyBhbiBldmVudCBsaXN0ZW5lciB0byB0aGlzIGV2ZW50IGRpc3BhdGNoZXIuXHJcbiAgICAgKiBAcGFyYW0gbGlzdGVuZXIgdGhlIGxpc3RlbmVyIHRvIGFkZFxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmUobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPik6IHZvaWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdWJzY3JpYmVzIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHRoaXMgZXZlbnQgZGlzcGF0Y2hlciB0aGF0IHdpbGwgYmUgY2FsbGVkIGF0IGEgbGltaXRlZCByYXRlIHdpdGggYSBtaW5pbXVtXHJcbiAgICAgKiBpbnRlcnZhbCBvZiB0aGUgc3BlY2lmaWVkIG1pbGxpc2Vjb25kcy5cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgdG8gYWRkXHJcbiAgICAgKiBAcGFyYW0gcmF0ZU1zIHRoZSByYXRlIGluIG1pbGxpc2Vjb25kcyB0byB3aGljaCBjYWxsaW5nIG9mIHRoZSBsaXN0ZW5lcnMgc2hvdWxkIGJlIGxpbWl0ZWRcclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlUmF0ZUxpbWl0ZWQobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiwgcmF0ZU1zOiBudW1iZXIpOiB2b2lkO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVW5zdWJzY3JpYmVzIGEgc3Vic2NyaWJlZCBldmVudCBsaXN0ZW5lciBmcm9tIHRoaXMgZGlzcGF0Y2hlci5cclxuICAgICAqIEBwYXJhbSBsaXN0ZW5lciB0aGUgbGlzdGVuZXIgdG8gcmVtb3ZlXHJcbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgbGlzdGVuZXIgd2FzIHN1Y2Nlc3NmdWxseSB1bnN1YnNjcmliZWQsIGZhbHNlIGlmIGl0IGlzbid0IHN1YnNjcmliZWQgb24gdGhpcyBkaXNwYXRjaGVyXHJcbiAgICAgKi9cclxuICAgIHVuc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pOiBib29sZWFuO1xyXG59XHJcblxyXG4vKipcclxuICogRXZlbnQgZGlzcGF0Y2hlciB0byBzdWJzY3JpYmUgYW5kIHRyaWdnZXIgZXZlbnRzLiBFYWNoIGV2ZW50IHNob3VsZCBoYXZlIGl0cyBvd24gZGlzcGF0Y2hlci5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBFdmVudERpc3BhdGNoZXI8U2VuZGVyLCBBcmdzPiBpbXBsZW1lbnRzIEV2ZW50PFNlbmRlciwgQXJncz4ge1xyXG5cclxuICAgIHByaXZhdGUgbGlzdGVuZXJzOiBFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+W10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIHtAaW5oZXJpdERvY31cclxuICAgICAqL1xyXG4gICAgc3Vic2NyaWJlKGxpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4pIHtcclxuICAgICAgICB0aGlzLmxpc3RlbmVycy5wdXNoKG5ldyBFdmVudExpc3RlbmVyV3JhcHBlcihsaXN0ZW5lcikpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICoge0Bpbmhlcml0RG9jfVxyXG4gICAgICovXHJcbiAgICBzdWJzY3JpYmVSYXRlTGltaXRlZChsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+LCByYXRlTXM6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubGlzdGVuZXJzLnB1c2gobmV3IFJhdGVMaW1pdGVkRXZlbnRMaXN0ZW5lcldyYXBwZXIobGlzdGVuZXIsIHJhdGVNcykpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICoge0Bpbmhlcml0RG9jfVxyXG4gICAgICovXHJcbiAgICB1bnN1YnNjcmliZShsaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+KTogYm9vbGVhbiB7XHJcbiAgICAgICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGxpc3RlbmVycywgY29tcGFyZSB3aXRoIHBhcmFtZXRlciwgYW5kIHJlbW92ZSBpZiBmb3VuZFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5saXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN1YnNjcmliZWRMaXN0ZW5lciA9IHRoaXMubGlzdGVuZXJzW2ldO1xyXG4gICAgICAgICAgICBpZiAoc3Vic2NyaWJlZExpc3RlbmVyLmxpc3RlbmVyID09PSBsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgQXJyYXlVdGlscy5yZW1vdmUodGhpcy5saXN0ZW5lcnMsIHN1YnNjcmliZWRMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGlzcGF0Y2hlcyBhbiBldmVudCB0byBhbGwgc3Vic2NyaWJlZCBsaXN0ZW5lcnMuXHJcbiAgICAgKiBAcGFyYW0gc2VuZGVyIHRoZSBzb3VyY2Ugb2YgdGhlIGV2ZW50XHJcbiAgICAgKiBAcGFyYW0gYXJncyB0aGUgYXJndW1lbnRzIGZvciB0aGUgZXZlbnRcclxuICAgICAqL1xyXG4gICAgZGlzcGF0Y2goc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MgPSBudWxsKSB7XHJcbiAgICAgICAgLy8gQ2FsbCBldmVyeSBsaXN0ZW5lclxyXG4gICAgICAgIGZvciAobGV0IGxpc3RlbmVyIG9mIHRoaXMubGlzdGVuZXJzKSB7XHJcbiAgICAgICAgICAgIGxpc3RlbmVyLmZpcmUoc2VuZGVyLCBhcmdzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBldmVudCB0aGF0IHRoaXMgZGlzcGF0Y2hlciBtYW5hZ2VzIGFuZCBvbiB3aGljaCBsaXN0ZW5lcnMgY2FuIHN1YnNjcmliZSBhbmQgdW5zdWJzY3JpYmUgZXZlbnQgaGFuZGxlcnMuXHJcbiAgICAgKiBAcmV0dXJucyB7RXZlbnR9XHJcbiAgICAgKi9cclxuICAgIGdldEV2ZW50KCk6IEV2ZW50PFNlbmRlciwgQXJncz4ge1xyXG4gICAgICAgIC8vIEZvciBub3csIGp1c3QgY2FzZSB0aGUgZXZlbnQgZGlzcGF0Y2hlciB0byB0aGUgZXZlbnQgaW50ZXJmYWNlLiBBdCBzb21lIHBvaW50IGluIHRoZSBmdXR1cmUgd2hlbiB0aGVcclxuICAgICAgICAvLyBjb2RlYmFzZSBncm93cywgaXQgbWlnaHQgbWFrZSBzZW5zZSB0byBzcGxpdCB0aGUgZGlzcGF0Y2hlciBpbnRvIHNlcGFyYXRlIGRpc3BhdGNoZXIgYW5kIGV2ZW50IGNsYXNzZXMuXHJcbiAgICAgICAgcmV0dXJuIDxFdmVudDxTZW5kZXIsIEFyZ3M+PnRoaXM7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBBIGJhc2ljIGV2ZW50IGxpc3RlbmVyIHdyYXBwZXIgdG8gbWFuYWdlIGxpc3RlbmVycyB3aXRoaW4gdGhlIHtAbGluayBFdmVudERpc3BhdGNoZXJ9LiBUaGlzIGlzIGEgXCJwcml2YXRlXCIgY2xhc3NcclxuICogZm9yIGludGVybmFsIGRpc3BhdGNoZXIgdXNlIGFuZCBpdCBpcyB0aGVyZWZvcmUgbm90IGV4cG9ydGVkLlxyXG4gKi9cclxuY2xhc3MgRXZlbnRMaXN0ZW5lcldyYXBwZXI8U2VuZGVyLCBBcmdzPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBldmVudExpc3RlbmVyOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz47XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPikge1xyXG4gICAgICAgIHRoaXMuZXZlbnRMaXN0ZW5lciA9IGxpc3RlbmVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyB0aGUgd3JhcHBlZCBldmVudCBsaXN0ZW5lci5cclxuICAgICAqIEByZXR1cm5zIHtFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz59XHJcbiAgICAgKi9cclxuICAgIGdldCBsaXN0ZW5lcigpOiBFdmVudExpc3RlbmVyPFNlbmRlciwgQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50TGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaXJlcyB0aGUgd3JhcHBlZCBldmVudCBsaXN0ZW5lciB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMuXHJcbiAgICAgKiBAcGFyYW0gc2VuZGVyXHJcbiAgICAgKiBAcGFyYW0gYXJnc1xyXG4gICAgICovXHJcbiAgICBmaXJlKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKSB7XHJcbiAgICAgICAgdGhpcy5ldmVudExpc3RlbmVyKHNlbmRlciwgYXJncyk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBFeHRlbmRzIHRoZSBiYXNpYyB7QGxpbmsgRXZlbnRMaXN0ZW5lcldyYXBwZXJ9IHdpdGggcmF0ZS1saW1pdGluZyBmdW5jdGlvbmFsaXR5LlxyXG4gKi9cclxuY2xhc3MgUmF0ZUxpbWl0ZWRFdmVudExpc3RlbmVyV3JhcHBlcjxTZW5kZXIsIEFyZ3M+IGV4dGVuZHMgRXZlbnRMaXN0ZW5lcldyYXBwZXI8U2VuZGVyLCBBcmdzPiB7XHJcblxyXG4gICAgcHJpdmF0ZSByYXRlTXM6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcmF0ZUxpbWl0aW5nRXZlbnRMaXN0ZW5lcjogRXZlbnRMaXN0ZW5lcjxTZW5kZXIsIEFyZ3M+O1xyXG5cclxuICAgIHByaXZhdGUgbGFzdEZpcmVUaW1lOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobGlzdGVuZXI6IEV2ZW50TGlzdGVuZXI8U2VuZGVyLCBBcmdzPiwgcmF0ZU1zOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihsaXN0ZW5lcik7IC8vIHNldHMgdGhlIGV2ZW50IGxpc3RlbmVyIHNpbmtcclxuXHJcbiAgICAgICAgdGhpcy5yYXRlTXMgPSByYXRlTXM7XHJcbiAgICAgICAgdGhpcy5sYXN0RmlyZVRpbWUgPSAwO1xyXG5cclxuICAgICAgICAvLyBXcmFwIHRoZSBldmVudCBsaXN0ZW5lciB3aXRoIGFuIGV2ZW50IGxpc3RlbmVyIHRoYXQgZG9lcyB0aGUgcmF0ZS1saW1pdGluZ1xyXG4gICAgICAgIHRoaXMucmF0ZUxpbWl0aW5nRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uIChzZW5kZXI6IFNlbmRlciwgYXJnczogQXJncykge1xyXG4gICAgICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHRoaXMubGFzdEZpcmVUaW1lID4gdGhpcy5yYXRlTXMpIHtcclxuICAgICAgICAgICAgICAgIC8vIE9ubHkgaWYgZW5vdWdoIHRpbWUgc2luY2UgdGhlIHByZXZpb3VzIGNhbGwgaGFzIHBhc3NlZCwgY2FsbCB0aGVcclxuICAgICAgICAgICAgICAgIC8vIGFjdHVhbCBldmVudCBsaXN0ZW5lciBhbmQgcmVjb3JkIHRoZSBjdXJyZW50IHRpbWVcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlyZVN1cGVyKHNlbmRlciwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RGaXJlVGltZSA9IERhdGUubm93KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmlyZVN1cGVyKHNlbmRlcjogU2VuZGVyLCBhcmdzOiBBcmdzKSB7XHJcbiAgICAgICAgLy8gRmlyZSB0aGUgYWN0dWFsIGV4dGVybmFsIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAgICAgc3VwZXIuZmlyZShzZW5kZXIsIGFyZ3MpO1xyXG4gICAgfVxyXG5cclxuICAgIGZpcmUoc2VuZGVyOiBTZW5kZXIsIGFyZ3M6IEFyZ3MpIHtcclxuICAgICAgICAvLyBGaXJlIHRoZSBpbnRlcm5hbCByYXRlLWxpbWl0aW5nIGxpc3RlbmVyIGluc3RlYWQgb2YgdGhlIGV4dGVybmFsIGV2ZW50IGxpc3RlbmVyXHJcbiAgICAgICAgdGhpcy5yYXRlTGltaXRpbmdFdmVudExpc3RlbmVyKHNlbmRlciwgYXJncyk7XHJcbiAgICB9XHJcbn0iLCIvKlxyXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTYsIGJpdG1vdmluIEdtYkgsIEFsbCBSaWdodHMgUmVzZXJ2ZWRcclxuICpcclxuICogQXV0aG9yczogTWFyaW8gR3VnZ2VuYmVyZ2VyIDxtYXJpby5ndWdnZW5iZXJnZXJAYml0bW92aW4uY29tPlxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGFuZCBpdHMgdXNlIGFuZCBkaXN0cmlidXRpb24sIGlzIHN1YmplY3QgdG8gdGhlIHRlcm1zXHJcbiAqIGFuZCBjb25kaXRpb25zIG9mIHRoZSBhcHBsaWNhYmxlIGxpY2Vuc2UgYWdyZWVtZW50LlxyXG4gKi9cclxuXHJcbmV4cG9ydCBuYW1lc3BhY2UgR3VpZCB7XHJcblxyXG4gICAgbGV0IGd1aWQgPSAxO1xyXG5cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAgIHJldHVybiBndWlkKys7XHJcbiAgICB9XHJcbn1cclxuIiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGxheWVyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vbm9kZV9tb2R1bGVzL0B0eXBlcy9jb3JlLWpzL2luZGV4LmQudHNcIiAvPlxyXG5pbXBvcnQge1VJTWFuYWdlcn0gZnJvbSBcIi4vdWltYW5hZ2VyXCI7XHJcbmltcG9ydCB7QnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2J1dHRvblwiO1xyXG5pbXBvcnQge0NvbnRyb2xCYXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udHJvbGJhclwiO1xyXG5pbXBvcnQge0Z1bGxzY3JlZW5Ub2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvZnVsbHNjcmVlbnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge0h1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9odWdlcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtQbGF5YmFja1RpbWVMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RpbWVsYWJlbFwiO1xyXG5pbXBvcnQge1BsYXliYWNrVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3BsYXliYWNrdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7U2Vla0Jhcn0gZnJvbSBcIi4vY29tcG9uZW50cy9zZWVrYmFyXCI7XHJcbmltcG9ydCB7U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3NlbGVjdGJveFwiO1xyXG5pbXBvcnQge1NldHRpbmdzUGFuZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvc2V0dGluZ3NwYW5lbFwiO1xyXG5pbXBvcnQge1NldHRpbmdzVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3NldHRpbmdzdG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3RvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZpZGVvUXVhbGl0eVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy92aWRlb3F1YWxpdHlzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtWb2x1bWVUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdm9sdW1ldG9nZ2xlYnV0dG9uXCI7XHJcbmltcG9ydCB7VlJUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdnJ0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtXYXRlcm1hcmt9IGZyb20gXCIuL2NvbXBvbmVudHMvd2F0ZXJtYXJrXCI7XHJcbmltcG9ydCB7VUlDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvdWljb250YWluZXJcIjtcclxuaW1wb3J0IHtDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udGFpbmVyXCI7XHJcbmltcG9ydCB7TGFiZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvbGFiZWxcIjtcclxuaW1wb3J0IHtBdWRpb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7QXVkaW9UcmFja1NlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9hdWRpb3RyYWNrc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7Q2FzdFN0YXR1c092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvY2FzdHN0YXR1c292ZXJsYXlcIjtcclxuaW1wb3J0IHtDYXN0VG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Nhc3R0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudHMvY29tcG9uZW50XCI7XHJcbmltcG9ydCB7RXJyb3JNZXNzYWdlT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9lcnJvcm1lc3NhZ2VvdmVybGF5XCI7XHJcbmltcG9ydCB7UmVjb21tZW5kYXRpb25PdmVybGF5fSBmcm9tIFwiLi9jb21wb25lbnRzL3JlY29tbWVuZGF0aW9ub3ZlcmxheVwiO1xyXG5pbXBvcnQge1NlZWtCYXJMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9zZWVrYmFybGFiZWxcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZU92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVvdmVybGF5XCI7XHJcbmltcG9ydCB7U3VidGl0bGVTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvc3VidGl0bGVzZWxlY3Rib3hcIjtcclxuaW1wb3J0IHtUaXRsZUJhcn0gZnJvbSBcIi4vY29tcG9uZW50cy90aXRsZWJhclwiO1xyXG5pbXBvcnQge1ZvbHVtZUNvbnRyb2xCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvdm9sdW1lY29udHJvbGJ1dHRvblwiO1xyXG5pbXBvcnQge0NsaWNrT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9jbGlja292ZXJsYXlcIjtcclxuaW1wb3J0IHtBZFNraXBCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvYWRza2lwYnV0dG9uXCI7XHJcbmltcG9ydCB7QWRNZXNzYWdlTGFiZWx9IGZyb20gXCIuL2NvbXBvbmVudHMvYWRtZXNzYWdlbGFiZWxcIjtcclxuaW1wb3J0IHtBZENsaWNrT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9hZGNsaWNrb3ZlcmxheVwiO1xyXG5pbXBvcnQge1BsYXliYWNrU3BlZWRTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2tzcGVlZHNlbGVjdGJveFwiO1xyXG5pbXBvcnQge0h1Z2VSZXBsYXlCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvaHVnZXJlcGxheWJ1dHRvblwiO1xyXG5pbXBvcnQge0J1ZmZlcmluZ092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvYnVmZmVyaW5nb3ZlcmxheVwiO1xyXG5cclxuLy8gT2JqZWN0LmFzc2lnbiBwb2x5ZmlsbCBmb3IgRVM1L0lFOVxyXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kZS9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduXHJcbmlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiAhPT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24odGFyZ2V0OiBhbnkpIHtcclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuICAgICAgICBpZiAodGFyZ2V0ID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdFwiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRhcmdldCA9IE9iamVjdCh0YXJnZXQpO1xyXG4gICAgICAgIGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAoc291cmNlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGtleSBpbiBzb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfTtcclxufVxyXG5cclxuLy8gRXhwb3NlIGNsYXNzZXMgdG8gd2luZG93XHJcbih3aW5kb3cgYXMgYW55KS5iaXRtb3Zpbi5wbGF5ZXJ1aSA9IHtcclxuICAgIC8vIE1hbmFnZW1lbnRcclxuICAgIFVJTWFuYWdlcixcclxuICAgIC8vIENvbXBvbmVudHNcclxuICAgIEFkQ2xpY2tPdmVybGF5LFxyXG4gICAgQWRNZXNzYWdlTGFiZWwsXHJcbiAgICBBZFNraXBCdXR0b24sXHJcbiAgICBBdWRpb1F1YWxpdHlTZWxlY3RCb3gsXHJcbiAgICBBdWRpb1RyYWNrU2VsZWN0Qm94LFxyXG4gICAgQnV0dG9uLFxyXG4gICAgQ2FzdFN0YXR1c092ZXJsYXksXHJcbiAgICBDYXN0VG9nZ2xlQnV0dG9uLFxyXG4gICAgQ2xpY2tPdmVybGF5LFxyXG4gICAgQ29tcG9uZW50LFxyXG4gICAgQ29udGFpbmVyLFxyXG4gICAgQ29udHJvbEJhcixcclxuICAgIEVycm9yTWVzc2FnZU92ZXJsYXksXHJcbiAgICBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uLFxyXG4gICAgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uLFxyXG4gICAgTGFiZWwsXHJcbiAgICBQbGF5YmFja1RpbWVMYWJlbCxcclxuICAgIFBsYXliYWNrVG9nZ2xlQnV0dG9uLFxyXG4gICAgUmVjb21tZW5kYXRpb25PdmVybGF5LFxyXG4gICAgU2Vla0JhcixcclxuICAgIFNlZWtCYXJMYWJlbCxcclxuICAgIFNlbGVjdEJveCxcclxuICAgIFNldHRpbmdzUGFuZWwsXHJcbiAgICBTZXR0aW5nc1RvZ2dsZUJ1dHRvbixcclxuICAgIFN1YnRpdGxlT3ZlcmxheSxcclxuICAgIFN1YnRpdGxlU2VsZWN0Qm94LFxyXG4gICAgVGl0bGVCYXIsXHJcbiAgICBUb2dnbGVCdXR0b24sXHJcbiAgICBVSUNvbnRhaW5lcixcclxuICAgIFZpZGVvUXVhbGl0eVNlbGVjdEJveCxcclxuICAgIFZvbHVtZUNvbnRyb2xCdXR0b24sXHJcbiAgICBWb2x1bWVUb2dnbGVCdXR0b24sXHJcbiAgICBWUlRvZ2dsZUJ1dHRvbixcclxuICAgIFdhdGVybWFyayxcclxuICAgIFBsYXliYWNrU3BlZWRTZWxlY3RCb3gsXHJcbiAgICBIdWdlUmVwbGF5QnV0dG9uLFxyXG4gICAgQnVmZmVyaW5nT3ZlcmxheVxyXG59OyIsIi8qXHJcbiAqIENvcHlyaWdodCAoQykgMjAxNiwgYml0bW92aW4gR21iSCwgQWxsIFJpZ2h0cyBSZXNlcnZlZFxyXG4gKlxyXG4gKiBBdXRob3JzOiBNYXJpbyBHdWdnZW5iZXJnZXIgPG1hcmlvLmd1Z2dlbmJlcmdlckBiaXRtb3Zpbi5jb20+XHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgYW5kIGl0cyB1c2UgYW5kIGRpc3RyaWJ1dGlvbiwgaXMgc3ViamVjdCB0byB0aGUgdGVybXNcclxuICogYW5kIGNvbmRpdGlvbnMgb2YgdGhlIGFwcGxpY2FibGUgbGljZW5zZSBhZ3JlZW1lbnQuXHJcbiAqL1xyXG5cclxuLy8gVE9ETyBjaGFuZ2UgdG8gaW50ZXJuYWwgKG5vdCBleHBvcnRlZCkgY2xhc3MsIGhvdyB0byB1c2UgaW4gb3RoZXIgZmlsZXM/XHJcbi8qKlxyXG4gKiBFeGVjdXRlcyBhIGNhbGxiYWNrIGFmdGVyIGEgc3BlY2lmaWVkIGFtb3VudCBvZiB0aW1lLCBvcHRpb25hbGx5IHJlcGVhdGVkbHkgdW50aWwgc3RvcHBlZC5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBUaW1lb3V0IHtcclxuXHJcbiAgICBwcml2YXRlIGRlbGF5OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGNhbGxiYWNrOiAoKSA9PiB2b2lkO1xyXG4gICAgcHJpdmF0ZSByZXBlYXQ6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIHRpbWVvdXRIYW5kbGU6IG51bWJlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIENyZWF0ZXMgYSBuZXcgdGltZW91dCBjYWxsYmFjayBoYW5kbGVyLlxyXG4gICAgICogQHBhcmFtIGRlbGF5IHRoZSBkZWxheSBpbiBtaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIGNhbGxiYWNrIHNob3VsZCBiZSBleGVjdXRlZFxyXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHRoZSBjYWxsYmFjayB0byBleGVjdXRlIGFmdGVyIHRoZSBkZWxheSB0aW1lXHJcbiAgICAgKiBAcGFyYW0gcmVwZWF0IGlmIHRydWUsIGNhbGwgdGhlIGNhbGxiYWNrIHJlcGVhdGVkbHkgaW4gZGVsYXkgaW50ZXJ2YWxzXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yKGRlbGF5OiBudW1iZXIsIGNhbGxiYWNrOiAoKSA9PiB2b2lkLCByZXBlYXQ6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuZGVsYXkgPSBkZWxheTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgdGhpcy5yZXBlYXQgPSByZXBlYXQ7XHJcbiAgICAgICAgdGhpcy50aW1lb3V0SGFuZGxlID0gMDtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0YXJ0cyB0aGUgdGltZW91dCBhbmQgY2FsbHMgdGhlIGNhbGxiYWNrIHdoZW4gdGhlIHRpbWVvdXQgZGVsYXkgaGFzIHBhc3NlZC5cclxuICAgICAqL1xyXG4gICAgc3RhcnQoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5yZXNldCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2xlYXJzIHRoZSB0aW1lb3V0LiBUaGUgY2FsbGJhY2sgd2lsbCBub3QgYmUgY2FsbGVkIGlmIGNsZWFyIGlzIGNhbGxlZCBkdXJpbmcgdGhlIHRpbWVvdXQuXHJcbiAgICAgKi9cclxuICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXRIYW5kbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVzZXRzIHRoZSBwYXNzZWQgdGltZW91dCBkZWxheSB0byB6ZXJvLiBDYW4gYmUgdXNlZCB0byBkZWZlciB0aGUgY2FsbGluZyBvZiB0aGUgY2FsbGJhY2suXHJcbiAgICAgKi9cclxuICAgIHJlc2V0KCk6IHZvaWQge1xyXG4gICAgICAgIGxldCBzZWxmID0gdGhpcztcclxuICAgICAgICBsZXQgbGFzdFNjaGVkdWxlVGltZSA9IDA7XHJcbiAgICAgICAgbGV0IGRlbGF5QWRqdXN0ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jbGVhcigpO1xyXG5cclxuICAgICAgICBsZXQgaW50ZXJuYWxDYWxsYmFjayA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5jYWxsYmFjaygpO1xyXG5cclxuICAgICAgICAgICAgaWYgKHNlbGYucmVwZWF0KSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm93ID0gRGF0ZS5ub3coKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBUaGUgdGltZSBvZiBvbmUgaXRlcmF0aW9uIGZyb20gc2NoZWR1bGluZyB0byBleGVjdXRpbmcgdGhlIGNhbGxiYWNrICh1c3VhbGx5IGEgYml0IGxvbmdlciB0aGFuIHRoZSBkZWxheSB0aW1lKVxyXG4gICAgICAgICAgICAgICAgbGV0IGRlbHRhID0gbm93IC0gbGFzdFNjaGVkdWxlVGltZTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGRlbGF5IGFkanVzdG1lbnQgZm9yIHRoZSBuZXh0IHNjaGVkdWxlIHRvIGtlZXAgYSBzdGVhZHkgZGVsYXkgaW50ZXJ2YWwgb3ZlciB0aW1lXHJcbiAgICAgICAgICAgICAgICBkZWxheUFkanVzdCA9IHNlbGYuZGVsYXkgLSBkZWx0YSArIGRlbGF5QWRqdXN0O1xyXG5cclxuICAgICAgICAgICAgICAgIGxhc3RTY2hlZHVsZVRpbWUgPSBub3c7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU2NoZWR1bGUgbmV4dCBleGVjdXRpb24gYnkgdGhlIGFkanVzdGVkIGRlbGF5XHJcbiAgICAgICAgICAgICAgICBzZWxmLnRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KGludGVybmFsQ2FsbGJhY2ssIHNlbGYuZGVsYXkgKyBkZWxheUFkanVzdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsYXN0U2NoZWR1bGVUaW1lID0gRGF0ZS5ub3coKTtcclxuICAgICAgICB0aGlzLnRpbWVvdXRIYW5kbGUgPSBzZXRUaW1lb3V0KGludGVybmFsQ2FsbGJhY2ssIHRoaXMuZGVsYXkpO1xyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5pbXBvcnQge1VJQ29udGFpbmVyfSBmcm9tIFwiLi9jb21wb25lbnRzL3VpY29udGFpbmVyXCI7XHJcbmltcG9ydCB7RE9NfSBmcm9tIFwiLi9kb21cIjtcclxuaW1wb3J0IHtDb21wb25lbnQsIENvbXBvbmVudENvbmZpZ30gZnJvbSBcIi4vY29tcG9uZW50cy9jb21wb25lbnRcIjtcclxuaW1wb3J0IHtDb250YWluZXJ9IGZyb20gXCIuL2NvbXBvbmVudHMvY29udGFpbmVyXCI7XHJcbmltcG9ydCB7UGxheWJhY2tUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtGdWxsc2NyZWVuVG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Z1bGxzY3JlZW50b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtWUlRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92cnRvZ2dsZWJ1dHRvblwiO1xyXG5pbXBvcnQge1ZvbHVtZVRvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWV0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZWVrQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJcIjtcclxuaW1wb3J0IHtQbGF5YmFja1RpbWVMYWJlbCwgVGltZUxhYmVsTW9kZX0gZnJvbSBcIi4vY29tcG9uZW50cy9wbGF5YmFja3RpbWVsYWJlbFwiO1xyXG5pbXBvcnQge0h1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9odWdlcGxheWJhY2t0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtDb250cm9sQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL2NvbnRyb2xiYXJcIjtcclxuaW1wb3J0IHtOb0FyZ3MsIEV2ZW50RGlzcGF0Y2hlcn0gZnJvbSBcIi4vZXZlbnRkaXNwYXRjaGVyXCI7XHJcbmltcG9ydCB7U2V0dGluZ3NUb2dnbGVCdXR0b259IGZyb20gXCIuL2NvbXBvbmVudHMvc2V0dGluZ3N0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtTZXR0aW5nc1BhbmVsLCBTZXR0aW5nc1BhbmVsSXRlbX0gZnJvbSBcIi4vY29tcG9uZW50cy9zZXR0aW5nc3BhbmVsXCI7XHJcbmltcG9ydCB7VmlkZW9RdWFsaXR5U2VsZWN0Qm94fSBmcm9tIFwiLi9jb21wb25lbnRzL3ZpZGVvcXVhbGl0eXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1dhdGVybWFya30gZnJvbSBcIi4vY29tcG9uZW50cy93YXRlcm1hcmtcIjtcclxuaW1wb3J0IHtBdWRpb1F1YWxpdHlTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvYXVkaW9xdWFsaXR5c2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7QXVkaW9UcmFja1NlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9hdWRpb3RyYWNrc2VsZWN0Ym94XCI7XHJcbmltcG9ydCB7U2Vla0JhckxhYmVsfSBmcm9tIFwiLi9jb21wb25lbnRzL3NlZWtiYXJsYWJlbFwiO1xyXG5pbXBvcnQge1ZvbHVtZVNsaWRlcn0gZnJvbSBcIi4vY29tcG9uZW50cy92b2x1bWVzbGlkZXJcIjtcclxuaW1wb3J0IHtTdWJ0aXRsZVNlbGVjdEJveH0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZXNlbGVjdGJveFwiO1xyXG5pbXBvcnQge1N1YnRpdGxlT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9zdWJ0aXRsZW92ZXJsYXlcIjtcclxuaW1wb3J0IHtWb2x1bWVDb250cm9sQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL3ZvbHVtZWNvbnRyb2xidXR0b25cIjtcclxuaW1wb3J0IHtDYXN0VG9nZ2xlQnV0dG9ufSBmcm9tIFwiLi9jb21wb25lbnRzL2Nhc3R0b2dnbGVidXR0b25cIjtcclxuaW1wb3J0IHtDYXN0U3RhdHVzT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9jYXN0c3RhdHVzb3ZlcmxheVwiO1xyXG5pbXBvcnQge0Vycm9yTWVzc2FnZU92ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvZXJyb3JtZXNzYWdlb3ZlcmxheVwiO1xyXG5pbXBvcnQge1RpdGxlQmFyfSBmcm9tIFwiLi9jb21wb25lbnRzL3RpdGxlYmFyXCI7XHJcbmltcG9ydCBQbGF5ZXIgPSBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyO1xyXG5pbXBvcnQge1JlY29tbWVuZGF0aW9uT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9yZWNvbW1lbmRhdGlvbm92ZXJsYXlcIjtcclxuaW1wb3J0IHtBZE1lc3NhZ2VMYWJlbH0gZnJvbSBcIi4vY29tcG9uZW50cy9hZG1lc3NhZ2VsYWJlbFwiO1xyXG5pbXBvcnQge0FkU2tpcEJ1dHRvbn0gZnJvbSBcIi4vY29tcG9uZW50cy9hZHNraXBidXR0b25cIjtcclxuaW1wb3J0IHtBZENsaWNrT3ZlcmxheX0gZnJvbSBcIi4vY29tcG9uZW50cy9hZGNsaWNrb3ZlcmxheVwiO1xyXG5pbXBvcnQgRVZFTlQgPSBiaXRtb3Zpbi5wbGF5ZXIuRVZFTlQ7XHJcbmltcG9ydCBQbGF5ZXJFdmVudENhbGxiYWNrID0gYml0bW92aW4ucGxheWVyLlBsYXllckV2ZW50Q2FsbGJhY2s7XHJcbmltcG9ydCBBZFN0YXJ0ZWRFdmVudCA9IGJpdG1vdmluLnBsYXllci5BZFN0YXJ0ZWRFdmVudDtcclxuaW1wb3J0IHtBcnJheVV0aWxzfSBmcm9tIFwiLi91dGlsc1wiO1xyXG5pbXBvcnQge1BsYXliYWNrU3BlZWRTZWxlY3RCb3h9IGZyb20gXCIuL2NvbXBvbmVudHMvcGxheWJhY2tzcGVlZHNlbGVjdGJveFwiO1xyXG5pbXBvcnQge0J1ZmZlcmluZ092ZXJsYXl9IGZyb20gXCIuL2NvbXBvbmVudHMvYnVmZmVyaW5nb3ZlcmxheVwiO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBVSVJlY29tbWVuZGF0aW9uQ29uZmlnIHtcclxuICAgIHRpdGxlOiBzdHJpbmc7XHJcbiAgICB1cmw6IHN0cmluZztcclxuICAgIHRodW1ibmFpbD86IHN0cmluZztcclxuICAgIGR1cmF0aW9uPzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVJQ29uZmlnIHtcclxuICAgIG1ldGFkYXRhPzoge1xyXG4gICAgICAgIHRpdGxlPzogc3RyaW5nXHJcbiAgICB9O1xyXG4gICAgcmVjb21tZW5kYXRpb25zPzogVUlSZWNvbW1lbmRhdGlvbkNvbmZpZ1tdO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgVUlNYW5hZ2VyIHtcclxuXHJcbiAgICBwcml2YXRlIHBsYXllcjogUGxheWVyO1xyXG4gICAgcHJpdmF0ZSBwbGF5ZXJFbGVtZW50OiBET007XHJcbiAgICBwcml2YXRlIHBsYXllclVpOiBVSUNvbnRhaW5lcjtcclxuICAgIHByaXZhdGUgYWRzVWk6IFVJQ29udGFpbmVyO1xyXG4gICAgcHJpdmF0ZSBjb25maWc6IFVJQ29uZmlnO1xyXG5cclxuICAgIHByaXZhdGUgbWFuYWdlclBsYXllcldyYXBwZXI6IFBsYXllcldyYXBwZXI7XHJcbiAgICBwcml2YXRlIHVpUGxheWVyV3JhcHBlcnM6IFBsYXllcldyYXBwZXJbXSA9IFtdO1xyXG5cclxuICAgIHByaXZhdGUgZXZlbnRzID0ge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIG1vdXNlIGVudGVycyB0aGUgVUkgYXJlYS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvbk1vdXNlRW50ZXI6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBpbnNpZGUgdGhlIFVJIGFyZWEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25Nb3VzZU1vdmU6IG5ldyBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBtb3VzZSBsZWF2ZXMgdGhlIFVJIGFyZWEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgb25Nb3VzZUxlYXZlOiBuZXcgRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb21wb25lbnRDb25maWc+LCBOb0FyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiBhIHNlZWsgc3RhcnRzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uU2VlazogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgc2VlayB0aW1lbGluZSBpcyBzY3J1YmJlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtQcmV2aWV3OiBuZXcgRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIG51bWJlcj4oKSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBGaXJlcyB3aGVuIGEgc2VlayBpcyBmaW5pc2hlZC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBvblNlZWtlZDogbmV3IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBOb0FyZ3M+KCksXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRmlyZXMgd2hlbiBhIGNvbXBvbmVudCBpcyBzaG93aW5nLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uQ29tcG9uZW50U2hvdzogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpcmVzIHdoZW4gYSBjb21wb25lbnQgaXMgaGlkaW5nLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG9uQ29tcG9uZW50SGlkZTogbmV3IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPigpLFxyXG4gICAgfTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwbGF5ZXI6IFBsYXllciwgcGxheWVyVWk6IFVJQ29udGFpbmVyLCBhZHNVaTogVUlDb250YWluZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSkge1xyXG4gICAgICAgIHRoaXMucGxheWVyID0gcGxheWVyO1xyXG4gICAgICAgIHRoaXMucGxheWVyVWkgPSBwbGF5ZXJVaTtcclxuICAgICAgICB0aGlzLmFkc1VpID0gYWRzVWk7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcblxyXG4gICAgICAgIGlmICghY29uZmlnLm1ldGFkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZy5tZXRhZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBwbGF5ZXIuZ2V0Q29uZmlnKCkuc291cmNlID8gcGxheWVyLmdldENvbmZpZygpLnNvdXJjZS50aXRsZSA6IG51bGxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMubWFuYWdlclBsYXllcldyYXBwZXIgPSBuZXcgUGxheWVyV3JhcHBlcihwbGF5ZXIpO1xyXG5cclxuICAgICAgICB0aGlzLnBsYXllckVsZW1lbnQgPSBuZXcgRE9NKHBsYXllci5nZXRGaWd1cmUoKSk7XHJcblxyXG4gICAgICAgIC8vIEFkZCBVSSBlbGVtZW50cyB0byBwbGF5ZXJcclxuICAgICAgICB0aGlzLmFkZFVpKHBsYXllclVpKTtcclxuXHJcbiAgICAgICAgLy8gQWRzIFVJXHJcbiAgICAgICAgaWYgKGFkc1VpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkVWkoYWRzVWkpO1xyXG4gICAgICAgICAgICBhZHNVaS5oaWRlKCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZW50ZXJBZHNVaSA9IGZ1bmN0aW9uIChldmVudDogQWRTdGFydGVkRXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHBsYXllclVpLmhpZGUoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEaXNwbGF5IHRoZSBhZHMgVUkgKG9ubHkgZm9yIFZBU1QgYWRzLCBvdGhlciBjbGllbnRzIGJyaW5nIHRoZWlyIG93biBVSSlcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC5jbGllbnRUeXBlID09PSBcInZhc3RcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGFkc1VpLnNob3coKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIGxldCBleGl0QWRzVWkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBhZHNVaS5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBwbGF5ZXJVaS5zaG93KCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAvLyBSZWFjdCB0byBhZCBldmVudHMgZnJvbSB0aGUgcGxheWVyXHJcbiAgICAgICAgICAgIHRoaXMubWFuYWdlclBsYXllcldyYXBwZXIuZ2V0UGxheWVyKCkuYWRkRXZlbnRIYW5kbGVyKEVWRU5ULk9OX0FEX1NUQVJURUQsIGVudGVyQWRzVWkpO1xyXG4gICAgICAgICAgICB0aGlzLm1hbmFnZXJQbGF5ZXJXcmFwcGVyLmdldFBsYXllcigpLmFkZEV2ZW50SGFuZGxlcihFVkVOVC5PTl9BRF9GSU5JU0hFRCwgZXhpdEFkc1VpKTtcclxuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyUGxheWVyV3JhcHBlci5nZXRQbGF5ZXIoKS5hZGRFdmVudEhhbmRsZXIoRVZFTlQuT05fQURfU0tJUFBFRCwgZXhpdEFkc1VpKTtcclxuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyUGxheWVyV3JhcHBlci5nZXRQbGF5ZXIoKS5hZGRFdmVudEhhbmRsZXIoRVZFTlQuT05fQURfRVJST1IsIGV4aXRBZHNVaSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldENvbmZpZygpOiBVSUNvbmZpZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uZmlnO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY29uZmlndXJlQ29udHJvbHMoY29tcG9uZW50OiBDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPikge1xyXG4gICAgICAgIGxldCBwbGF5ZXJXcmFwcGVyID0gdGhpcy51aVBsYXllcldyYXBwZXJzWzxhbnk+Y29tcG9uZW50XTtcclxuXHJcbiAgICAgICAgY29tcG9uZW50LmluaXRpYWxpemUoKTtcclxuICAgICAgICBjb21wb25lbnQuY29uZmlndXJlKHBsYXllcldyYXBwZXIuZ2V0UGxheWVyKCksIHRoaXMpO1xyXG5cclxuICAgICAgICBpZiAoY29tcG9uZW50IGluc3RhbmNlb2YgQ29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoaWxkQ29tcG9uZW50IG9mIGNvbXBvbmVudC5nZXRDb21wb25lbnRzKCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlndXJlQ29udHJvbHMoY2hpbGRDb21wb25lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldCBvbk1vdXNlRW50ZXIoKTogRXZlbnREaXNwYXRjaGVyPENvbXBvbmVudDxDb21wb25lbnRDb25maWc+LCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25Nb3VzZUVudGVyO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvbk1vdXNlTW92ZSgpOiBFdmVudERpc3BhdGNoZXI8Q29tcG9uZW50PENvbXBvbmVudENvbmZpZz4sIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vbk1vdXNlTW92ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Nb3VzZUxlYXZlKCk6IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uTW91c2VMZWF2ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25TZWVrKCk6IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBOb0FyZ3M+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25TZWVrO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBvblNlZWtQcmV2aWV3KCk6IEV2ZW50RGlzcGF0Y2hlcjxTZWVrQmFyLCBudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ldmVudHMub25TZWVrUHJldmlldztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25TZWVrZWQoKTogRXZlbnREaXNwYXRjaGVyPFNlZWtCYXIsIE5vQXJncz4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50cy5vblNlZWtlZDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Db21wb25lbnRTaG93KCk6IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uQ29tcG9uZW50U2hvdztcclxuICAgIH1cclxuXHJcbiAgICBnZXQgb25Db21wb25lbnRIaWRlKCk6IEV2ZW50RGlzcGF0Y2hlcjxDb21wb25lbnQ8Q29tcG9uZW50Q29uZmlnPiwgTm9BcmdzPiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRzLm9uQ29tcG9uZW50SGlkZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFkZFVpKHVpOiBVSUNvbnRhaW5lcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucGxheWVyRWxlbWVudC5hcHBlbmQodWkuZ2V0RG9tRWxlbWVudCgpKTtcclxuICAgICAgICB0aGlzLnVpUGxheWVyV3JhcHBlcnNbPGFueT51aV0gPSBuZXcgUGxheWVyV3JhcHBlcih0aGlzLnBsYXllcik7XHJcbiAgICAgICAgdGhpcy5jb25maWd1cmVDb250cm9scyh1aSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSByZWxlYXNlVWkodWk6IFVJQ29udGFpbmVyKTogdm9pZCB7XHJcbiAgICAgICAgdWkuZ2V0RG9tRWxlbWVudCgpLnJlbW92ZSgpO1xyXG4gICAgICAgIHRoaXMudWlQbGF5ZXJXcmFwcGVyc1s8YW55PnVpXS5jbGVhckV2ZW50SGFuZGxlcnMoKTtcclxuICAgIH1cclxuXHJcbiAgICByZWxlYXNlKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMucmVsZWFzZVVpKHRoaXMucGxheWVyVWkpO1xyXG4gICAgICAgIGlmICh0aGlzLmFkc1VpKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVsZWFzZVVpKHRoaXMuYWRzVWkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1hbmFnZXJQbGF5ZXJXcmFwcGVyLmNsZWFyRXZlbnRIYW5kbGVycygpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBGYWN0b3J5ID0gY2xhc3Mge1xyXG4gICAgICAgIHN0YXRpYyBidWlsZERlZmF1bHRVSShwbGF5ZXI6IFBsYXllciwgY29uZmlnOiBVSUNvbmZpZyA9IHt9KTogVUlNYW5hZ2VyIHtcclxuICAgICAgICAgICAgcmV0dXJuIFVJTWFuYWdlci5GYWN0b3J5LmJ1aWxkTW9kZXJuVUkocGxheWVyLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTW9kZXJuVUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBzZXR0aW5nc1BhbmVsID0gbmV3IFNldHRpbmdzUGFuZWwoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlZpZGVvIFF1YWxpdHlcIiwgbmV3IFZpZGVvUXVhbGl0eVNlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJTcGVlZFwiLCBuZXcgUGxheWJhY2tTcGVlZFNlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBUcmFja1wiLCBuZXcgQXVkaW9UcmFja1NlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBRdWFsaXR5XCIsIG5ldyBBdWRpb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiU3VidGl0bGVzXCIsIG5ldyBTdWJ0aXRsZVNlbGVjdEJveCgpKVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzUGFuZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RpbWVMYWJlbCh7dGltZUxhYmVsTW9kZTogVGltZUxhYmVsTW9kZS5DdXJyZW50VGltZSwgaGlkZUluTGl2ZVBsYXliYWNrOiB0cnVlfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2Vla0Jhcih7bGFiZWw6IG5ldyBTZWVrQmFyTGFiZWwoKX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKHt0aW1lTGFiZWxNb2RlOiBUaW1lTGFiZWxNb2RlLlRvdGFsVGltZSwgY3NzQ2xhc3NlczogW1widGV4dC1yaWdodFwiXX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzc2VzOiBbXCJjb250cm9sYmFyLXRvcFwiXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVTbGlkZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb21wb25lbnQoe2Nzc0NsYXNzOiBcInNwYWNlclwifSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZSVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NUb2dnbGVCdXR0b24oe3NldHRpbmdzUGFuZWw6IHNldHRpbmdzUGFuZWx9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzZXM6IFtcImNvbnRyb2xiYXItYm90dG9tXCJdXHJcbiAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU3VidGl0bGVPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENhc3RTdGF0dXNPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEJ1ZmZlcmluZ092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgY29udHJvbEJhcixcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVGl0bGVCYXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUmVjb21tZW5kYXRpb25PdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFdhdGVybWFyaygpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbW9kZXJuXCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IGFkc1VpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQnVmZmVyaW5nT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBBZENsaWNrT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQWRNZXNzYWdlTGFiZWwoeyB0ZXh0OiBcIkFkOiB7cmVtYWluaW5nVGltZX0gc2Vjc1wiIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFkU2tpcEJ1dHRvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNzc0NsYXNzOiBcInVpLWFkcy1zdGF0dXNcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IENvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZVRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lU2xpZGVyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBDb21wb25lbnQoe2Nzc0NsYXNzOiBcInNwYWNlclwifSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzc2VzOiBbXCJjb250cm9sYmFyLWJvdHRvbVwiXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgXSwgY3NzQ2xhc3NlczogW1widWktc2tpbi1tb2Rlcm4gYWRzXCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVSU1hbmFnZXIocGxheWVyLCB1aSwgYWRzVWksIGNvbmZpZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdGF0aWMgYnVpbGRNb2Rlcm5DYXN0UmVjZWl2ZXJVSShwbGF5ZXI6IFBsYXllciwgY29uZmlnOiBVSUNvbmZpZyA9IHt9KTogVUlNYW5hZ2VyIHtcclxuICAgICAgICAgICAgbGV0IGNvbnRyb2xCYXIgPSBuZXcgQ29udHJvbEJhcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IENvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RpbWVMYWJlbCh7dGltZUxhYmVsTW9kZTogVGltZUxhYmVsTW9kZS5DdXJyZW50VGltZSwgaGlkZUluTGl2ZVBsYXliYWNrOiB0cnVlfSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgU2Vla0Jhcih7bGFiZWw6IG5ldyBTZWVrQmFyTGFiZWwoKX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKHt0aW1lTGFiZWxNb2RlOiBUaW1lTGFiZWxNb2RlLlRvdGFsVGltZSwgY3NzQ2xhc3NlczogW1widGV4dC1yaWdodFwiXX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjc3NDbGFzc2VzOiBbXCJjb250cm9sYmFyLXRvcFwiXVxyXG4gICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCB1aSA9IG5ldyBVSUNvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN1YnRpdGxlT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBCdWZmZXJpbmdPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBXYXRlcm1hcmsoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbW9kZXJuIHVpLXNraW4tbW9kZXJuLWNhc3QtcmVjZWl2ZXJcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVJTWFuYWdlcihwbGF5ZXIsIHVpLCBudWxsLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5VUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBzZXR0aW5nc1BhbmVsID0gbmV3IFNldHRpbmdzUGFuZWwoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlZpZGVvIFF1YWxpdHlcIiwgbmV3IFZpZGVvUXVhbGl0eVNlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBUcmFja1wiLCBuZXcgQXVkaW9UcmFja1NlbGVjdEJveCgpKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJBdWRpbyBRdWFsaXR5XCIsIG5ldyBBdWRpb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiU3VidGl0bGVzXCIsIG5ldyBTdWJ0aXRsZVNlbGVjdEJveCgpKVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGhpZGRlbjogdHJ1ZVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHNldHRpbmdzUGFuZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNlZWtCYXIoe2xhYmVsOiBuZXcgU2Vla0JhckxhYmVsKCl9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGxheWJhY2tUaW1lTGFiZWwoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVlJUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1RvZ2dsZUJ1dHRvbih7c2V0dGluZ3NQYW5lbDogc2V0dGluZ3NQYW5lbH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0VG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEZ1bGxzY3JlZW5Ub2dnbGVCdXR0b24oKVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGxldCB1aSA9IG5ldyBVSUNvbnRhaW5lcih7XHJcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFN1YnRpdGxlT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDYXN0U3RhdHVzT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBIdWdlUGxheWJhY2tUb2dnbGVCdXR0b24oKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgV2F0ZXJtYXJrKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFJlY29tbWVuZGF0aW9uT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xCYXIsXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFRpdGxlQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEVycm9yTWVzc2FnZU92ZXJsYXkoKVxyXG4gICAgICAgICAgICAgICAgXSwgY3NzQ2xhc3NlczogW1widWktc2tpbi1sZWdhY3lcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgYWRzVWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBBZENsaWNrT3ZlcmxheSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQWRNZXNzYWdlTGFiZWwoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVDb250cm9sQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRnVsbHNjcmVlblRvZ2dsZUJ1dHRvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQWRTa2lwQnV0dG9uKClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5IGFkc1wiXVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVUlNYW5hZ2VyKHBsYXllciwgdWksIGFkc1VpLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5Q2FzdFJlY2VpdmVyVUkocGxheWVyOiBQbGF5ZXIsIGNvbmZpZzogVUlDb25maWcgPSB7fSk6IFVJTWFuYWdlciB7XHJcbiAgICAgICAgICAgIGxldCBjb250cm9sQmFyID0gbmV3IENvbnRyb2xCYXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVpID0gbmV3IFVJQ29udGFpbmVyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU3VidGl0bGVPdmVybGF5KCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IEh1Z2VQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBXYXRlcm1hcmsoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5IHVpLXNraW4tbGVnYWN5LWNhc3QtcmVjZWl2ZXJcIl1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IFVJTWFuYWdlcihwbGF5ZXIsIHVpLCBudWxsLCBjb25maWcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RhdGljIGJ1aWxkTGVnYWN5VGVzdFVJKHBsYXllcjogUGxheWVyLCBjb25maWc6IFVJQ29uZmlnID0ge30pOiBVSU1hbmFnZXIge1xyXG4gICAgICAgICAgICBsZXQgc2V0dGluZ3NQYW5lbCA9IG5ldyBTZXR0aW5nc1BhbmVsKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NQYW5lbEl0ZW0oXCJWaWRlbyBRdWFsaXR5XCIsIG5ldyBWaWRlb1F1YWxpdHlTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gVHJhY2tcIiwgbmV3IEF1ZGlvVHJhY2tTZWxlY3RCb3goKSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFNldHRpbmdzUGFuZWxJdGVtKFwiQXVkaW8gUXVhbGl0eVwiLCBuZXcgQXVkaW9RdWFsaXR5U2VsZWN0Qm94KCkpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZXR0aW5nc1BhbmVsSXRlbShcIlN1YnRpdGxlc1wiLCBuZXcgU3VidGl0bGVTZWxlY3RCb3goKSlcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBoaWRkZW46IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgY29udHJvbEJhciA9IG5ldyBDb250cm9sQmFyKHtcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudHM6IFtzZXR0aW5nc1BhbmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQbGF5YmFja1RvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTZWVrQmFyKHtsYWJlbDogbmV3IFNlZWtCYXJMYWJlbCgpfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBsYXliYWNrVGltZUxhYmVsKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZSVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFZvbHVtZVRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVTbGlkZXIoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgVm9sdW1lQ29udHJvbEJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBWb2x1bWVDb250cm9sQnV0dG9uKHt2ZXJ0aWNhbDogZmFsc2V9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgU2V0dGluZ3NUb2dnbGVCdXR0b24oe3NldHRpbmdzUGFuZWw6IHNldHRpbmdzUGFuZWx9KSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFRvZ2dsZUJ1dHRvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBGdWxsc2NyZWVuVG9nZ2xlQnV0dG9uKClcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgdWkgPSBuZXcgVUlDb250YWluZXIoe1xyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50czogW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBTdWJ0aXRsZU92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgQ2FzdFN0YXR1c092ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBuZXcgSHVnZVBsYXliYWNrVG9nZ2xlQnV0dG9uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFdhdGVybWFyaygpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBSZWNvbW1lbmRhdGlvbk92ZXJsYXkoKSxcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sQmFyLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBUaXRsZUJhcigpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBFcnJvck1lc3NhZ2VPdmVybGF5KClcclxuICAgICAgICAgICAgICAgIF0sIGNzc0NsYXNzZXM6IFtcInVpLXNraW4tbGVnYWN5XCJdXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVSU1hbmFnZXIocGxheWVyLCB1aSwgbnVsbCwgY29uZmlnKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG59XHJcblxyXG4vKipcclxuICogV3JhcHMgdGhlIHBsYXllciB0byB0cmFjayBldmVudCBoYW5kbGVycyBhbmQgcHJvdmlkZSBhIHNpbXBsZSBtZXRob2QgdG8gcmVtb3ZlIGFsbCByZWdpc3RlcmVkIGV2ZW50XHJcbiAqIGhhbmRsZXJzIGZyb20gdGhlIHBsYXllci5cclxuICovXHJcbmNsYXNzIFBsYXllcldyYXBwZXIge1xyXG5cclxuICAgIHByaXZhdGUgcGxheWVyOiBQbGF5ZXI7XHJcbiAgICBwcml2YXRlIHdyYXBwZXI6IFBsYXllcjtcclxuXHJcbiAgICBwcml2YXRlIGV2ZW50SGFuZGxlcnM6IHsgW2V2ZW50VHlwZTogc3RyaW5nXTogUGxheWVyRXZlbnRDYWxsYmFja1tdOyB9ID0ge307XHJcblxyXG4gICAgY29uc3RydWN0b3IocGxheWVyOiBQbGF5ZXIpIHtcclxuICAgICAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcclxuXHJcbiAgICAgICAgbGV0IHNlbGYgPSB0aGlzO1xyXG5cclxuICAgICAgICAvLyBDb2xsZWN0IGFsbCBwdWJsaWMgQVBJIG1ldGhvZHMgb2YgdGhlIHBsYXllclxyXG4gICAgICAgIGxldCBtZXRob2RzID0gPGFueVtdPltdO1xyXG4gICAgICAgIGZvciAobGV0IG1lbWJlciBpbiBwbGF5ZXIpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiAoPGFueT5wbGF5ZXIpW21lbWJlcl0gPT09IFwiZnVuY3Rpb25cIikge1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kcy5wdXNoKG1lbWJlcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB3cmFwcGVyIG9iamVjdCBhbmQgYWRkIGZ1bmN0aW9uIHdyYXBwZXJzIGZvciBhbGwgQVBJIG1ldGhvZHMgdGhhdCBkbyBub3RoaW5nIGJ1dCBjYWxsaW5nIHRoZSBiYXNlIG1ldGhvZCBvbiB0aGUgcGxheWVyXHJcbiAgICAgICAgbGV0IHdyYXBwZXIgPSA8YW55Pnt9O1xyXG4gICAgICAgIGZvciAobGV0IG1lbWJlciBvZiBtZXRob2RzKSB7XHJcbiAgICAgICAgICAgIHdyYXBwZXJbbWVtYmVyXSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiY2FsbGVkIFwiICsgbWVtYmVyKTsgLy8gdHJhY2sgbWV0aG9kIGNhbGxzIG9uIHRoZSBwbGF5ZXJcclxuICAgICAgICAgICAgICAgIHJldHVybiAoPGFueT5wbGF5ZXIpW21lbWJlcl0uYXBwbHkocGxheWVyLCBhcmd1bWVudHMpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwbGljaXRseSBhZGQgYSB3cmFwcGVyIG1ldGhvZCBmb3IgXCJhZGRFdmVudEhhbmRsZXJcIiB0aGF0IGFkZHMgYWRkZWQgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGV2ZW50IGxpc3RcclxuICAgICAgICB3cmFwcGVyLmFkZEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uIChldmVudFR5cGU6IEVWRU5ULCBjYWxsYmFjazogUGxheWVyRXZlbnRDYWxsYmFjayk6IFBsYXllciB7XHJcbiAgICAgICAgICAgIHBsYXllci5hZGRFdmVudEhhbmRsZXIoZXZlbnRUeXBlLCBjYWxsYmFjayk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXNlbGYuZXZlbnRIYW5kbGVyc1tldmVudFR5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSA9IFtdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzZWxmLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXS5wdXNoKGNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB3cmFwcGVyO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIEV4cGxpY2l0bHkgYWRkIGEgd3JhcHBlciBtZXRob2QgZm9yIFwicmVtb3ZlRXZlbnRIYW5kbGVyXCIgdGhhdCByZW1vdmVzIHJlbW92ZWQgZXZlbnQgaGFuZGxlcnMgZnJvbSB0aGUgZXZlbnQgbGlzdFxyXG4gICAgICAgIHdyYXBwZXIucmVtb3ZlRXZlbnRIYW5kbGVyID0gZnVuY3Rpb24gKGV2ZW50VHlwZTogRVZFTlQsIGNhbGxiYWNrOiBQbGF5ZXJFdmVudENhbGxiYWNrKTogUGxheWVyIHtcclxuICAgICAgICAgICAgcGxheWVyLnJlbW92ZUV2ZW50SGFuZGxlcihldmVudFR5cGUsIGNhbGxiYWNrKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzZWxmLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSkge1xyXG4gICAgICAgICAgICAgICAgQXJyYXlVdGlscy5yZW1vdmUoc2VsZi5ldmVudEhhbmRsZXJzW2V2ZW50VHlwZV0sIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHdyYXBwZXI7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy53cmFwcGVyID0gPFBsYXllcj53cmFwcGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmV0dXJucyBhIHdyYXBwZWQgcGxheWVyIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIG9uIHBsYWNlIG9mIHRoZSBub3JtYWwgcGxheWVyIG9iamVjdC5cclxuICAgICAqIEByZXR1cm5zIHtQbGF5ZXJ9IGEgd3JhcHBlZCBwbGF5ZXJcclxuICAgICAqL1xyXG4gICAgZ2V0UGxheWVyKCk6IFBsYXllciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMud3JhcHBlcjtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIENsZWFycyBhbGwgcmVnaXN0ZXJlZCBldmVudCBoYW5kbGVycyBmcm9tIHRoZSBwbGF5ZXIgdGhhdCB3ZXJlIGFkZGVkIHRocm91Z2ggdGhlIHdyYXBwZWQgcGxheWVyLlxyXG4gICAgICovXHJcbiAgICBjbGVhckV2ZW50SGFuZGxlcnMoKTogdm9pZCB7XHJcbiAgICAgICAgZm9yIChsZXQgZXZlbnRUeXBlIGluIHRoaXMuZXZlbnRIYW5kbGVycykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBjYWxsYmFjayBvZiB0aGlzLmV2ZW50SGFuZGxlcnNbZXZlbnRUeXBlXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXIucmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50VHlwZSwgY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLypcclxuICogQ29weXJpZ2h0IChDKSAyMDE2LCBiaXRtb3ZpbiBHbWJILCBBbGwgUmlnaHRzIFJlc2VydmVkXHJcbiAqXHJcbiAqIEF1dGhvcnM6IE1hcmlvIEd1Z2dlbmJlcmdlciA8bWFyaW8uZ3VnZ2VuYmVyZ2VyQGJpdG1vdmluLmNvbT5cclxuICpcclxuICogVGhpcyBzb3VyY2UgY29kZSBhbmQgaXRzIHVzZSBhbmQgZGlzdHJpYnV0aW9uLCBpcyBzdWJqZWN0IHRvIHRoZSB0ZXJtc1xyXG4gKiBhbmQgY29uZGl0aW9ucyBvZiB0aGUgYXBwbGljYWJsZSBsaWNlbnNlIGFncmVlbWVudC5cclxuICovXHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIEFycmF5VXRpbHMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBSZW1vdmVzIGFuIGl0ZW0gZnJvbSBhbiBhcnJheS5cclxuICAgICAqIEBwYXJhbSBhcnJheSB0aGUgYXJyYXkgdGhhdCBtYXkgY29udGFpbiB0aGUgaXRlbSB0byByZW1vdmVcclxuICAgICAqIEBwYXJhbSBpdGVtIHRoZSBpdGVtIHRvIHJlbW92ZSBmcm9tIHRoZSBhcnJheVxyXG4gICAgICogQHJldHVybnMge2FueX0gdGhlIHJlbW92ZWQgaXRlbSBvciBudWxsIGlmIGl0IHdhc24ndCBwYXJ0IG9mIHRoZSBhcnJheVxyXG4gICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gcmVtb3ZlPFQ+KGFycmF5OiBUW10sIGl0ZW06IFQpOiBUIHwgbnVsbCB7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gYXJyYXkuaW5kZXhPZihpdGVtKTtcclxuXHJcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFycmF5LnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgbmFtZXNwYWNlIFN0cmluZ1V0aWxzIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZvcm1hdHMgYSBudW1iZXIgb2Ygc2Vjb25kcyBpbnRvIGEgdGltZSBzdHJpbmcgd2l0aCB0aGUgcGF0dGVybiBoaDptbTpzcy5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gdG90YWxTZWNvbmRzIHRoZSB0b3RhbCBudW1iZXIgb2Ygc2Vjb25kcyB0byBmb3JtYXQgdG8gc3RyaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgZm9ybWF0dGVkIHRpbWUgc3RyaW5nXHJcbiAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBzZWNvbmRzVG9UaW1lKHRvdGFsU2Vjb25kczogbnVtYmVyKTogc3RyaW5nIHtcclxuICAgICAgICBsZXQgaXNOZWdhdGl2ZSA9IHRvdGFsU2Vjb25kcyA8IDA7XHJcblxyXG4gICAgICAgIGlmIChpc05lZ2F0aXZlKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSB0aW1lIGlzIG5lZ2F0aXZlLCB3ZSBtYWtlIGl0IHBvc2l0aXZlIGZvciB0aGUgY2FsY3VsYXRpb24gYmVsb3dcclxuICAgICAgICAgICAgLy8gKGVsc2Ugd2UnZCBnZXQgYWxsIG5lZ2F0aXZlIG51bWJlcnMpIGFuZCByZWF0dGFjaCB0aGUgbmVnYXRpdmUgc2lnbiBsYXRlci5cclxuICAgICAgICAgICAgdG90YWxTZWNvbmRzID0gLXRvdGFsU2Vjb25kcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNwbGl0IGludG8gc2VwYXJhdGUgdGltZSBwYXJ0c1xyXG4gICAgICAgIGxldCBob3VycyA9IE1hdGguZmxvb3IodG90YWxTZWNvbmRzIC8gMzYwMCk7XHJcbiAgICAgICAgbGV0IG1pbnV0ZXMgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcyAvIDYwKSAtIGhvdXJzICogNjA7XHJcbiAgICAgICAgbGV0IHNlY29uZHMgPSBNYXRoLmZsb29yKHRvdGFsU2Vjb25kcykgJSA2MDtcclxuXHJcbiAgICAgICAgcmV0dXJuIChpc05lZ2F0aXZlID8gXCItXCIgOiBcIlwiKSArIGxlZnRQYWRXaXRoWmVyb3MoaG91cnMsIDIpICsgXCI6XCIgKyBsZWZ0UGFkV2l0aFplcm9zKG1pbnV0ZXMsIDIpICsgXCI6XCIgKyBsZWZ0UGFkV2l0aFplcm9zKHNlY29uZHMsIDIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29udmVydHMgYSBudW1iZXIgdG8gYSBzdHJpbmcgYW5kIGxlZnQtcGFkcyBpdCB3aXRoIHplcm9zIHRvIHRoZSBzcGVjaWZpZWQgbGVuZ3RoLlxyXG4gICAgICogRXhhbXBsZTogbGVmdFBhZFdpdGhaZXJvcygxMjMsIDUpID0+IFwiMDAxMjNcIlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBudW0gdGhlIG51bWJlciB0byBjb252ZXJ0IHRvIHN0cmluZyBhbmQgcGFkIHdpdGggemVyb3NcclxuICAgICAqIEBwYXJhbSBsZW5ndGggdGhlIGRlc2lyZWQgbGVuZ3RoIG9mIHRoZSBwYWRkZWQgc3RyaW5nXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgcGFkZGVkIG51bWJlciBhcyBzdHJpbmdcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gbGVmdFBhZFdpdGhaZXJvcyhudW06IG51bWJlciB8IHN0cmluZywgbGVuZ3RoOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCB0ZXh0ID0gbnVtICsgXCJcIjtcclxuICAgICAgICBsZXQgcGFkZGluZyA9IFwiMDAwMDAwMDAwMFwiLnN1YnN0cigwLCBsZW5ndGggLSB0ZXh0Lmxlbmd0aCk7XHJcbiAgICAgICAgcmV0dXJuIHBhZGRpbmcgKyB0ZXh0O1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmlsbHMgb3V0IHBsYWNlaG9sZGVycyBpbiBhbiBhZCBtZXNzYWdlLlxyXG4gICAgICpcclxuICAgICAqIEhhcyB0aGUgcGxhY2Vob2xkZXJzICd7cmVtYWluaW5nVGltZVtmb3JtYXRTdHJpbmddfScsICd7cGxheWVkVGltZVtmb3JtYXRTdHJpbmddfScgYW5kICd7YWREdXJhdGlvbltmb3JtYXRTdHJpbmddfScsXHJcbiAgICAgKiB3aGljaCBhcmUgcmVwbGFjZWQgYnkgdGhlIHJlbWFpbmluZyB0aW1lIHVudGlsIHRoZSBhZCBjYW4gYmUgc2tpcHBlZCwgdGhlIGN1cnJlbnQgdGltZSBvciB0aGUgYWQgZHVyYXRpb24uXHJcbiAgICAgKiBUaGUgZm9ybWF0IHN0cmluZyBpcyBvcHRpb25hbC4gSWYgbm90IHNwZWNpZmllZCwgdGhlIHBsYWNlaG9sZGVyIGlzIHJlcGxhY2VkIGJ5IHRoZSB0aW1lIGluIHNlY29uZHMuXHJcbiAgICAgKiBJZiBzcGVjaWZpZWQsIGl0IG11c3QgYmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXQ6XHJcbiAgICAgKiAtICVkIC0gSW5zZXJ0cyB0aGUgdGltZSBhcyBhbiBpbnRlZ2VyLlxyXG4gICAgICogLSAlME5kIC0gSW5zZXJ0cyB0aGUgdGltZSBhcyBhbiBpbnRlZ2VyIHdpdGggbGVhZGluZyB6ZXJvZXMsIGlmIHRoZSBsZW5ndGggb2YgdGhlIHRpbWUgc3RyaW5nIGlzIHNtYWxsZXIgdGhhbiBOLlxyXG4gICAgICogLSAlZiAtIEluc2VydHMgdGhlIHRpbWUgYXMgYSBmbG9hdC5cclxuICAgICAqIC0gJTBOZiAtIEluc2VydHMgdGhlIHRpbWUgYXMgYSBmbG9hdCB3aXRoIGxlYWRpbmcgemVyb2VzLlxyXG4gICAgICogLSAlLk1mIC0gSW5zZXJ0cyB0aGUgdGltZSBhcyBhIGZsb2F0IHdpdGggTSBkZWNpbWFsIHBsYWNlcy4gQ2FuIGJlIGNvbWJpbmVkIHdpdGggJTBOZiwgZS5nLiAlMDQuMmYgKHRoZSB0aW1lIDEwLjEyM1xyXG4gICAgICogd291bGQgYmUgcHJpbnRlZCBhcyAwMDEwLjEyKS5cclxuICAgICAqIC0gJWhoOm1tOnNzXHJcbiAgICAgKiAtICVtbTpzc1xyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBhZE1lc3NhZ2UgYW4gYWQgbWVzc2FnZSB3aXRoIG9wdGlvbmFsIHBsYWNlaG9sZGVycyB0byBmaWxsXHJcbiAgICAgKiBAcGFyYW0gc2tpcE9mZnNldCBpZiBzcGVjaWZpZWQsIHtyZW1haW5pbmdUaW1lfSB3aWxsIGJlIGZpbGxlZCB3aXRoIHRoZSByZW1haW5pbmcgdGltZSB1bnRpbCB0aGUgYWQgY2FuIGJlIHNraXBwZWRcclxuICAgICAqIEBwYXJhbSBwbGF5ZXIgdGhlIHBsYXllciB0byBnZXQgdGhlIHRpbWUgZGF0YSBmcm9tXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgYWQgbWVzc2FnZSB3aXRoIGZpbGxlZCBwbGFjZWhvbGRlcnNcclxuICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2VBZE1lc3NhZ2VQbGFjZWhvbGRlcnMoYWRNZXNzYWdlOiBzdHJpbmcsIHNraXBPZmZzZXQ6IG51bWJlciwgcGxheWVyOiBiaXRtb3Zpbi5wbGF5ZXIuUGxheWVyKSB7XHJcbiAgICAgICAgbGV0IGFkTWVzc2FnZVBsYWNlaG9sZGVyUmVnZXggPSBuZXcgUmVnRXhwKFxyXG4gICAgICAgICAgICBcIlxcXFx7KHJlbWFpbmluZ1RpbWV8cGxheWVkVGltZXxhZER1cmF0aW9uKSh9fCUoKDBbMS05XVxcXFxkKihcXFxcLlxcXFxkKyhkfGYpfGR8Zil8XFxcXC5cXFxcZCtmfGR8Zil8aGg6bW06c3N8bW06c3MpfSlcIixcclxuICAgICAgICAgICAgXCJnXCJcclxuICAgICAgICApO1xyXG5cclxuICAgICAgICByZXR1cm4gYWRNZXNzYWdlLnJlcGxhY2UoYWRNZXNzYWdlUGxhY2Vob2xkZXJSZWdleCwgZnVuY3Rpb24gKGZvcm1hdFN0cmluZykge1xyXG4gICAgICAgICAgICBsZXQgdGltZSA9IDA7XHJcbiAgICAgICAgICAgIGlmIChmb3JtYXRTdHJpbmcuaW5kZXhPZihcInJlbWFpbmluZ1RpbWVcIikgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHNraXBPZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lID0gTWF0aC5jZWlsKHNraXBPZmZzZXQgLSBwbGF5ZXIuZ2V0Q3VycmVudFRpbWUoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWUgPSBwbGF5ZXIuZ2V0RHVyYXRpb24oKSAtIHBsYXllci5nZXRDdXJyZW50VGltZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGZvcm1hdFN0cmluZy5pbmRleE9mKFwicGxheWVkVGltZVwiKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lID0gcGxheWVyLmdldEN1cnJlbnRUaW1lKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZm9ybWF0U3RyaW5nLmluZGV4T2YoXCJhZER1cmF0aW9uXCIpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRpbWUgPSBwbGF5ZXIuZ2V0RHVyYXRpb24oKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0TnVtYmVyKHRpbWUsIGZvcm1hdFN0cmluZyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZm9ybWF0TnVtYmVyKHRpbWU6IG51bWJlciwgZm9ybWF0OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZm9ybWF0U3RyaW5nVmFsaWRhdGlvblJlZ2V4ID0gLyUoKDBbMS05XVxcZCooXFwuXFxkKyhkfGYpfGR8Zil8XFwuXFxkK2Z8ZHxmKXxoaDptbTpzc3xtbTpzcykvO1xyXG4gICAgICAgIGxldCBsZWFkaW5nWmVyb2VzUmVnZXggPSAvKCUwWzEtOV1cXGQqKSg/PShcXC5cXGQrZnxmfGQpKS87XHJcbiAgICAgICAgbGV0IGRlY2ltYWxQbGFjZXNSZWdleCA9IC9cXC5cXGQqKD89ZikvO1xyXG5cclxuICAgICAgICBpZiAoIWZvcm1hdFN0cmluZ1ZhbGlkYXRpb25SZWdleC50ZXN0KGZvcm1hdCkpIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIGZvcm1hdCBpcyBpbnZhbGlkLCB3ZSBzZXQgYSBkZWZhdWx0IGZhbGxiYWNrIGZvcm1hdFxyXG4gICAgICAgICAgICBmb3JtYXQgPSBcIiVkXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgdGhlIG51bWJlciBvZiBsZWFkaW5nIHplcm9zXHJcbiAgICAgICAgbGV0IGxlYWRpbmdaZXJvZXMgPSAwO1xyXG4gICAgICAgIGxldCBsZWFkaW5nWmVyb2VzTWF0Y2hlcyA9IGZvcm1hdC5tYXRjaChsZWFkaW5nWmVyb2VzUmVnZXgpO1xyXG4gICAgICAgIGlmIChsZWFkaW5nWmVyb2VzTWF0Y2hlcykge1xyXG4gICAgICAgICAgICBsZWFkaW5nWmVyb2VzID0gcGFyc2VJbnQobGVhZGluZ1plcm9lc01hdGNoZXNbMF0uc3Vic3RyaW5nKDIpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB0aGUgbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzXHJcbiAgICAgICAgbGV0IG51bURlY2ltYWxQbGFjZXMgPSBudWxsO1xyXG4gICAgICAgIGxldCBkZWNpbWFsUGxhY2VzTWF0Y2hlcyA9IGZvcm1hdC5tYXRjaChkZWNpbWFsUGxhY2VzUmVnZXgpO1xyXG4gICAgICAgIGlmIChkZWNpbWFsUGxhY2VzTWF0Y2hlcyAmJiAhaXNOYU4ocGFyc2VJbnQoZGVjaW1hbFBsYWNlc01hdGNoZXNbMF0uc3Vic3RyaW5nKDEpKSkpIHtcclxuICAgICAgICAgICAgbnVtRGVjaW1hbFBsYWNlcyA9IHBhcnNlSW50KGRlY2ltYWxQbGFjZXNNYXRjaGVzWzBdLnN1YnN0cmluZygxKSk7XHJcbiAgICAgICAgICAgIGlmIChudW1EZWNpbWFsUGxhY2VzID4gMjApIHtcclxuICAgICAgICAgICAgICAgIG51bURlY2ltYWxQbGFjZXMgPSAyMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRmxvYXQgZm9ybWF0XHJcbiAgICAgICAgaWYgKGZvcm1hdC5pbmRleE9mKFwiZlwiKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIjtcclxuXHJcbiAgICAgICAgICAgIGlmIChudW1EZWNpbWFsUGxhY2VzICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBBcHBseSBmaXhlZCBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXNcclxuICAgICAgICAgICAgICAgIHRpbWVTdHJpbmcgPSB0aW1lLnRvRml4ZWQobnVtRGVjaW1hbFBsYWNlcyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aW1lU3RyaW5nID0gXCJcIiArIHRpbWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFwcGx5IGxlYWRpbmcgemVyb3NcclxuICAgICAgICAgICAgaWYgKHRpbWVTdHJpbmcuaW5kZXhPZihcIi5cIikgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxlZnRQYWRXaXRoWmVyb3ModGltZVN0cmluZywgdGltZVN0cmluZy5sZW5ndGggKyAobGVhZGluZ1plcm9lcyAtIHRpbWVTdHJpbmcuaW5kZXhPZihcIi5cIikpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBsZWZ0UGFkV2l0aFplcm9zKHRpbWVTdHJpbmcsIGxlYWRpbmdaZXJvZXMpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBUaW1lIGZvcm1hdFxyXG4gICAgICAgIGVsc2UgaWYgKGZvcm1hdC5pbmRleE9mKFwiOlwiKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIGxldCB0b3RhbFNlY29uZHMgPSBNYXRoLmNlaWwodGltZSk7XHJcblxyXG4gICAgICAgICAgICAvLyBoaDptbTpzcyBmb3JtYXRcclxuICAgICAgICAgICAgaWYgKGZvcm1hdC5pbmRleE9mKFwiaGhcIikgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlY29uZHNUb1RpbWUodG90YWxTZWNvbmRzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBtbTpzcyBmb3JtYXRcclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbWludXRlcyA9IE1hdGguZmxvb3IodG90YWxTZWNvbmRzIC8gNjApO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlY29uZHMgPSB0b3RhbFNlY29uZHMgJSA2MDtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbGVmdFBhZFdpdGhaZXJvcyhtaW51dGVzLCAyKSArIFwiOlwiICsgbGVmdFBhZFdpdGhaZXJvcyhzZWNvbmRzLCAyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJbnRlZ2VyIGZvcm1hdFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gbGVmdFBhZFdpdGhaZXJvcyhNYXRoLmNlaWwodGltZSksIGxlYWRpbmdaZXJvZXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==

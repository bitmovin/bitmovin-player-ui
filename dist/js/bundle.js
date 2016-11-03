(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("./component");
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(config) {
        _super.call(this, config);
        console.log(this);
        console.log(config);
    }
    return Button;
}(component_1.Component));
exports.Button = Button;
},{"./component":2}],2:[function(require,module,exports){
"use strict";
var Component = (function () {
    function Component(config) {
        console.log(this);
        console.log(config);
    }
    return Component;
}());
exports.Component = Component;
},{}],3:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var component_1 = require("./component");
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(config) {
        _super.call(this, config);
        this.config = config;
    }
    Container.prototype.addComponent = function (component) {
        this.config.components.push(component);
    };
    Container.prototype.removeComponent = function (component) {
        ArrayUtils.remove(this.config.components, component);
    };
    return Container;
}(component_1.Component));
exports.Container = Container;
},{"./component":2}],4:[function(require,module,exports){
"use strict";
var button_1 = require("./button");
var container_1 = require("./container");
var button1 = new button_1.Button({ id: 'b1', text: 'blubb' });
var button2 = new button_1.Button({ id: 'b2', text: 'bla' });
var container = new container_1.Container({ components: [button1, button2] });
console.log(container);
},{"./button":1,"./container":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudC50cyIsInNyYy90cy9jb250YWluZXIudHMiLCJzcmMvdHMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztBQ0FBLDBCQUF5QyxhQUFhLENBQUMsQ0FBQTtBQVl2RDtJQUE0QiwwQkFBUztJQUVqQyxnQkFBWSxNQUFvQjtRQUM1QixrQkFBTSxNQUFNLENBQUMsQ0FBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUwsYUFBQztBQUFELENBUkEsQUFRQyxDQVIyQixxQkFBUyxHQVFwQztBQVJZLGNBQU0sU0FRbEIsQ0FBQTs7O0FDTEQ7SUFFSSxtQkFBWSxNQUF1QjtRQUMvQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUVMLGdCQUFDO0FBQUQsQ0FQQSxBQU9DLElBQUE7QUFQcUIsaUJBQVMsWUFPOUIsQ0FBQTs7Ozs7Ozs7QUN0QkQsMEJBQXlDLGFBQWEsQ0FBQyxDQUFBO0FBTXZEO0lBQStCLDZCQUFTO0lBSXBDLG1CQUFZLE1BQXVCO1FBQy9CLGtCQUFNLE1BQU0sQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVELGdDQUFZLEdBQVosVUFBYSxTQUFvQjtRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELG1DQUFlLEdBQWYsVUFBZ0IsU0FBb0I7UUFDaEMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQWhCQSxBQWdCQyxDQWhCOEIscUJBQVMsR0FnQnZDO0FBaEJZLGlCQUFTLFlBZ0JyQixDQUFBOzs7QUN0QkQsdUJBQXFCLFVBQVUsQ0FBQyxDQUFBO0FBQ2hDLDBCQUF3QixhQUFhLENBQUMsQ0FBQTtBQUV0QyxJQUFJLE9BQU8sR0FBRyxJQUFJLGVBQU0sQ0FBQyxFQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7QUFDcEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxlQUFNLENBQUMsRUFBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO0FBRWxELElBQUksU0FBUyxHQUFHLElBQUkscUJBQVMsQ0FBQyxFQUFDLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBQyxDQUFDLENBQUM7QUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge0NvbXBvbmVudENvbmZpZywgQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmF0aW9uIGludGVyZmFjZSBmb3IgYSBidXR0b24gY29tcG9uZW50LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBCdXR0b25Db25maWcgZXh0ZW5kcyBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdGV4dCBvbiB0aGUgYnV0dG9uLlxyXG4gICAgICovXHJcbiAgICB0ZXh0Pzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQnV0dG9uIGV4dGVuZHMgQ29tcG9uZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IEJ1dHRvbkNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY29uZmlnKTtcclxuICAgIH1cclxuXHJcbn0iLCIvKipcclxuICogQmFzZSBjb25maWd1cmF0aW9uIGludGVyZmFjZSB3aXRoIGNvbW1vbiBvcHRpb25zIGZvciBhbGwga2luZHMgb2YgY29tcG9uZW50cy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIEhUTUwgSUQgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgaWQ/OiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgQ1NTIGNsYXNzZXMgb2YgdGhlIGNvbXBvbmVudC5cclxuICAgICAqL1xyXG4gICAgY3NzQ2xhc3M/OiBzdHJpbmc7IC8vIFwiY2xhc3NcIiBpcyBhIHJlc2VydmVkIGtleXdvcmQsIHNvIHdlIG5lZWQgdG8gbWFrZSB0aGUgbmFtZSBtb3JlIGNvbXBsaWNhdGVkXHJcbn1cclxuXHJcbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDb21wb25lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29tcG9uZW50Q29uZmlnKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY29uZmlnKTtcclxuICAgIH1cclxuXHJcbn0iLCJpbXBvcnQge0NvbXBvbmVudENvbmZpZywgQ29tcG9uZW50fSBmcm9tIFwiLi9jb21wb25lbnRcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udGFpbmVyQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIGNvbXBvbmVudHM/OiBDb21wb25lbnRbXTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENvbnRhaW5lciBleHRlbmRzIENvbXBvbmVudCB7XHJcblxyXG4gICAgcHJpdmF0ZSBjb25maWc6IENvbnRhaW5lckNvbmZpZztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbnRhaW5lckNvbmZpZykge1xyXG4gICAgICAgIHN1cGVyKGNvbmZpZyk7XHJcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XHJcbiAgICB9XHJcblxyXG4gICAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50KSB7XHJcbiAgICAgICAgdGhpcy5jb25maWcuY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50KSB7XHJcbiAgICAgICAgQXJyYXlVdGlscy5yZW1vdmUodGhpcy5jb25maWcuY29tcG9uZW50cywgY29tcG9uZW50KTtcclxuICAgIH1cclxufSIsImltcG9ydCB7QnV0dG9ufSBmcm9tIFwiLi9idXR0b25cIjtcclxuaW1wb3J0IHtDb250YWluZXJ9IGZyb20gXCIuL2NvbnRhaW5lclwiO1xyXG5cclxudmFyIGJ1dHRvbjEgPSBuZXcgQnV0dG9uKHtpZDogJ2IxJywgdGV4dDogJ2JsdWJiJ30pO1xyXG52YXIgYnV0dG9uMiA9IG5ldyBCdXR0b24oe2lkOiAnYjInLCB0ZXh0OiAnYmxhJ30pO1xyXG5cclxudmFyIGNvbnRhaW5lciA9IG5ldyBDb250YWluZXIoe2NvbXBvbmVudHM6IFtidXR0b24xLCBidXR0b24yXX0pO1xyXG5jb25zb2xlLmxvZyhjb250YWluZXIpOyJdfQ==

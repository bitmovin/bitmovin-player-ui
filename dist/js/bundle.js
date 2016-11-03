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
var button_1 = require("./button");
var test2 = new button_1.Button({ id: 'testid', text: 'blubb' });
},{"./button":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudC50cyIsInNyYy90cy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsMEJBQXlDLGFBQWEsQ0FBQyxDQUFBO0FBWXZEO0lBQTRCLDBCQUFTO0lBRWpDLGdCQUFZLE1BQW9CO1FBQzVCLGtCQUFNLE1BQU0sQ0FBQyxDQUFDO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTCxhQUFDO0FBQUQsQ0FSQSxBQVFDLENBUjJCLHFCQUFTLEdBUXBDO0FBUlksY0FBTSxTQVFsQixDQUFBOzs7QUNMRDtJQUVJLG1CQUFZLE1BQXVCO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUwsZ0JBQUM7QUFBRCxDQVBBLEFBT0MsSUFBQTtBQVBZLGlCQUFTLFlBT3JCLENBQUE7OztBQ3RCRCx1QkFBcUIsVUFBVSxDQUFDLENBQUE7QUFFaEMsSUFBSSxLQUFLLEdBQUcsSUFBSSxlQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7Q29tcG9uZW50Q29uZmlnLCBDb21wb25lbnR9IGZyb20gXCIuL2NvbXBvbmVudFwiO1xyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIGZvciBhIGJ1dHRvbiBjb21wb25lbnQuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEJ1dHRvbkNvbmZpZyBleHRlbmRzIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0ZXh0IG9uIHRoZSBidXR0b24uXHJcbiAgICAgKi9cclxuICAgIHRleHQ/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBCdXR0b24gZXh0ZW5kcyBDb21wb25lbnQge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNvbmZpZzogQnV0dG9uQ29uZmlnKSB7XHJcbiAgICAgICAgc3VwZXIoY29uZmlnKTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjb25maWcpO1xyXG4gICAgfVxyXG5cclxufSIsIi8qKlxyXG4gKiBCYXNlIGNvbmZpZ3VyYXRpb24gaW50ZXJmYWNlIHdpdGggY29tbW9uIG9wdGlvbnMgZm9yIGFsbCBraW5kcyBvZiBjb21wb25lbnRzLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnRDb25maWcge1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgSFRNTCBJRCBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBpZD86IHN0cmluZztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBDU1MgY2xhc3NlcyBvZiB0aGUgY29tcG9uZW50LlxyXG4gICAgICovXHJcbiAgICBjc3NDbGFzcz86IHN0cmluZzsgLy8gXCJjbGFzc1wiIGlzIGEgcmVzZXJ2ZWQga2V5d29yZCwgc28gd2UgbmVlZCB0byBtYWtlIHRoZSBuYW1lIG1vcmUgY29tcGxpY2F0ZWRcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBDb21wb25lbnRDb25maWcpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhjb25maWcpO1xyXG4gICAgfVxyXG5cclxufSIsImltcG9ydCB7QnV0dG9ufSBmcm9tIFwiLi9idXR0b25cIjtcclxuXHJcbnZhciB0ZXN0MiA9IG5ldyBCdXR0b24oeyBpZDogJ3Rlc3RpZCcsIHRleHQ6ICdibHViYicgfSk7Il19

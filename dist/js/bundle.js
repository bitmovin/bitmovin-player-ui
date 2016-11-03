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
function sayHello(name) {
    return "Hello from " + name;
}
exports.sayHello = sayHello;
},{}],4:[function(require,module,exports){
"use strict";
var greet_1 = require("./greet");
var button_1 = require("./button");
function showHello(divName, name) {
    var elt = document.getElementById(divName);
    elt.innerText = greet_1.sayHello(name);
}
showHello("greeting", "TypeScript");
var test2 = new button_1.Button({ id: 'testid', text: 'blubb' });
},{"./button":1,"./greet":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvdHMvYnV0dG9uLnRzIiwic3JjL3RzL2NvbXBvbmVudC50cyIsInNyYy90cy9ncmVldC50cyIsInNyYy90cy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0FDQUEsMEJBQXlDLGFBQWEsQ0FBQyxDQUFBO0FBWXZEO0lBQTRCLDBCQUFTO0lBRWpDLGdCQUFZLE1BQW9CO1FBQzVCLGtCQUFNLE1BQU0sQ0FBQyxDQUFDO1FBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFTCxhQUFDO0FBQUQsQ0FSQSxBQVFDLENBUjJCLHFCQUFTLEdBUXBDO0FBUlksY0FBTSxTQVFsQixDQUFBOzs7QUNMRDtJQUVJLG1CQUFZLE1BQXVCO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBRUwsZ0JBQUM7QUFBRCxDQVBBLEFBT0MsSUFBQTtBQVBZLGlCQUFTLFlBT3JCLENBQUE7OztBQ3RCRCxrQkFBeUIsSUFBWTtJQUNqQyxNQUFNLENBQUMsZ0JBQWMsSUFBTSxDQUFDO0FBQ2hDLENBQUM7QUFGZSxnQkFBUSxXQUV2QixDQUFBOzs7QUNGRCxzQkFBdUIsU0FBUyxDQUFDLENBQUE7QUFDakMsdUJBQXFCLFVBQVUsQ0FBQyxDQUFBO0FBRWhDLG1CQUFtQixPQUFlLEVBQUUsSUFBWTtJQUM1QyxJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsZ0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuQyxDQUFDO0FBRUQsU0FBUyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztBQUVwQyxJQUFJLEtBQUssR0FBRyxJQUFJLGVBQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtDb21wb25lbnRDb25maWcsIENvbXBvbmVudH0gZnJvbSBcIi4vY29tcG9uZW50XCI7XHJcblxyXG4vKipcclxuICogQ29uZmlndXJhdGlvbiBpbnRlcmZhY2UgZm9yIGEgYnV0dG9uIGNvbXBvbmVudC5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnV0dG9uQ29uZmlnIGV4dGVuZHMgQ29tcG9uZW50Q29uZmlnIHtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHRleHQgb24gdGhlIGJ1dHRvbi5cclxuICAgICAqL1xyXG4gICAgdGV4dD86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEJ1dHRvbiBleHRlbmRzIENvbXBvbmVudCB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoY29uZmlnOiBCdXR0b25Db25maWcpIHtcclxuICAgICAgICBzdXBlcihjb25maWcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG59IiwiLyoqXHJcbiAqIEJhc2UgY29uZmlndXJhdGlvbiBpbnRlcmZhY2Ugd2l0aCBjb21tb24gb3B0aW9ucyBmb3IgYWxsIGtpbmRzIG9mIGNvbXBvbmVudHMuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudENvbmZpZyB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBIVE1MIElEIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIGlkPzogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIENTUyBjbGFzc2VzIG9mIHRoZSBjb21wb25lbnQuXHJcbiAgICAgKi9cclxuICAgIGNzc0NsYXNzPzogc3RyaW5nOyAvLyBcImNsYXNzXCIgaXMgYSByZXNlcnZlZCBrZXl3b3JkLCBzbyB3ZSBuZWVkIHRvIG1ha2UgdGhlIG5hbWUgbW9yZSBjb21wbGljYXRlZFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihjb25maWc6IENvbXBvbmVudENvbmZpZykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGNvbmZpZyk7XHJcbiAgICB9XHJcblxyXG59IiwiZXhwb3J0IGZ1bmN0aW9uIHNheUhlbGxvKG5hbWU6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIGBIZWxsbyBmcm9tICR7bmFtZX1gO1xyXG59IiwiaW1wb3J0IHtzYXlIZWxsb30gZnJvbSBcIi4vZ3JlZXRcIjtcclxuaW1wb3J0IHtCdXR0b259IGZyb20gXCIuL2J1dHRvblwiO1xyXG5cclxuZnVuY3Rpb24gc2hvd0hlbGxvKGRpdk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBlbHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChkaXZOYW1lKTtcclxuICAgIGVsdC5pbm5lclRleHQgPSBzYXlIZWxsbyhuYW1lKTtcclxufVxyXG5cclxuc2hvd0hlbGxvKFwiZ3JlZXRpbmdcIiwgXCJUeXBlU2NyaXB0XCIpO1xyXG5cclxudmFyIHRlc3QyID0gbmV3IEJ1dHRvbih7IGlkOiAndGVzdGlkJywgdGV4dDogJ2JsdWJiJyB9KTsiXX0=

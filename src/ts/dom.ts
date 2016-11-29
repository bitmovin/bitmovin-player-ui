/*
 * Copyright (C) 2016, bitmovin GmbH, All Rights Reserved
 *
 * Authors: Mario Guggenberger <mario.guggenberger@bitmovin.com>
 *
 * This source code and its use and distribution, is subject to the terms
 * and conditions of the applicable license agreement.
 */

export interface Offset {
    left: number;
    top: number;
}

/**
 * Simple DOM manipulation and DOM element event handling modeled after jQuery (as replacement for jQuery).
 *
 * Built with the help of: http://youmightnotneedjquery.com/
 */
export class DOM {

    private document: Document;
    private elements: HTMLElement[];

    constructor(tagName: string, attributes: { [name: string]: string });
    constructor(selector: string);
    constructor(element: HTMLElement);
    constructor(document: Document);
    constructor(something: string | HTMLElement | Document, attributes?: { [name: string]: string }) {
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
            let tagName = something;
            let element = document.createElement(tagName);

            for (let attributeName in attributes) {
                let attributeValue = attributes[attributeName];
                element.setAttribute(attributeName, attributeValue);
            }

            this.elements = [element];
        }
        else {
            let selector = something;
            let elements = document.querySelectorAll(selector);

            // Convert NodeList to Array
            // https://toddmotto.com/a-comprehensive-dive-into-nodelists-arrays-converting-nodelists-and-understanding-the-dom/
            this.elements = [].slice.call(elements);
        }
    }

    /**
     * A shortcut method for iterating all elements. Shorts this.elements.forEach(...) to this.forEach(...).
     * @param handler the handler to execute an operation on an element
     */
    private forEach(handler: (element: HTMLElement) => void): void {
        this.elements.forEach(function (element) {
            handler(element);
        });
    }

    html(): string;
    html(content: string): DOM;
    html(content?: string): string | DOM {
        if (arguments.length > 0) {
            return this.setHtml(content);
        }
        else {
            return this.getHtml();
        }
    }

    private getHtml(): string | null {
        return this.elements[0].innerHTML;
    }

    private setHtml(content: string): DOM {
        if (content == undefined || content == null) {
            // Set to empty string to avoid innerHTML getting set to "undefined" (all browsers) or "null" (IE9)
            content = "";
        }

        this.forEach(function (element) {
            element.innerHTML = content;
        });

        return this;
    }

    empty(): DOM {
        this.forEach(function (element) {
            element.innerHTML = '';
        });
        return this;
    }

    val(): string {
        let element = this.elements[0];

        if (element instanceof HTMLSelectElement || element instanceof HTMLInputElement) {
            return element.value;
        }
        else {
            // TODO add support for missing form elements
            throw new Error(`val() not supported for ${typeof element}`);
        }
    }

    attr(attribute: string): string | null;
    attr(attribute: string, value: string): DOM;
    attr(attribute: string, value?: string): string | null | DOM {
        if (arguments.length > 1) {
            return this.setAttr(attribute, value);
        }
        else {
            return this.getAttr(attribute);
        }
    }

    private getAttr(attribute: string): string | null {
        return this.elements[0].getAttribute(attribute);
    }

    private setAttr(attribute: string, value: string): DOM {
        this.forEach(function (element) {
            element.setAttribute(attribute, value);
        });
        return this;
    }

    data(dataAttribute: string): string | null;
    data(dataAttribute: string, value: string): DOM;
    data(dataAttribute: string, value?: string): string | null | DOM {
        if (arguments.length > 1) {
            return this.setData(dataAttribute, value);
        }
        else {
            return this.getData(dataAttribute);
        }
    }

    private getData(dataAttribute: string): string | null {
        // TODO port to dataset API: https://www.w3.org/TR/html5/dom.html#dom-dataset
        return this.elements[0].getAttribute("data-" + dataAttribute);
    }

    private setData(dataAttribute: string, value: string): DOM {
        // TODO port to dataset API: https://www.w3.org/TR/html5/dom.html#dom-dataset
        this.forEach(function (element) {
            element.setAttribute("data-" + dataAttribute, value);
        });
        return this;
    }

    append(...childElements: DOM[]): DOM {
        this.forEach(function (element) {
            childElements.forEach(function (childElement) {
                childElement.elements.forEach(function (_, index) {
                    element.appendChild(childElement.elements[index]);
                });
            });
        });
        return this;
    }

    offset(): Offset {
        let element = this.elements[0];
        let rect = element.getBoundingClientRect();

        // Workaround for document.body.scrollTop always 0 in IE9, IE11, Firefox
        // http://stackoverflow.com/a/11102215/370252
        let scrollTop = typeof window.pageYOffset != 'undefined' ?
            window.pageYOffset : document.documentElement.scrollTop ?
            document.documentElement.scrollTop : document.body.scrollTop ?
            document.body.scrollTop : 0;

        // Workaround for document.body.scrollLeft always 0 in IE9, IE11, Firefox
        let scrollLeft = typeof window.pageXOffset != 'undefined' ?
            window.pageXOffset : document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft : document.body.scrollLeft ?
            document.body.scrollLeft : 0;

        return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
        };
    }

    width(): number {
        // TODO check if this is the same as jQuery's width() (probably not)
        return this.elements[0].offsetWidth;
    }

    height(): number {
        // TODO check if this is the same as jQuery's height() (probably not)
        return this.elements[0].offsetHeight;
    }

    on(eventName: string, eventHandler: EventListenerOrEventListenerObject): DOM {
        let events = eventName.split(" ");
        let self = this;

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
    }

    off(eventName: string, eventHandler: EventListenerOrEventListenerObject): DOM {
        let events = eventName.split(" ");
        let self = this;

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
    }

    addClass(className: string): DOM {
        this.forEach(function (element) {
            if (element.classList) {
                element.classList.add(className);
            }
            else {
                element.className += ' ' + className;
            }
        });

        return this;
    }

    removeClass(className: string): DOM {
        this.forEach(function (element) {
            if (element.classList) {
                element.classList.remove(className);
            }
            else {
                element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        });

        return this;
    }

    hasClass(className: string): boolean {
        let element = this.elements[0];

        if (element.classList) {
            return element.classList.contains(className);
        }
        else {
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        }
    }

    css(ruleName: string): string | null;
    css(ruleName: string, value: string): DOM;
    css(ruleValueCollection: {[ruleName: string]: string}): DOM;
    css(ruleNameOrCollection: string | {[ruleName: string]: string}, value?: string): string | null | DOM {
        if (typeof ruleNameOrCollection === "string") {
            let ruleName = ruleNameOrCollection;

            if (arguments.length == 2) {
                return this.setCss(ruleName, value);
            }
            else {
                return this.getCss(ruleName);
            }
        }
        else {
            let ruleValueCollection = ruleNameOrCollection;
            return this.setCssCollection(ruleValueCollection);
        }
    }

    private getCss(ruleName: string): string | null {
        return getComputedStyle(this.elements[0])[<any>ruleName];
    }

    private setCss(ruleName: string, value: string): DOM {
        this.forEach(function (element) {
            // <any> cast to resolve TS7015: http://stackoverflow.com/a/36627114/370252
            element.style[<any>ruleName] = value;
        });
        return this;
    }

    private setCssCollection(ruleValueCollection: {[ruleName: string]: string}): DOM {
        this.forEach(function (element) {
            // http://stackoverflow.com/a/34490573/370252
            Object.assign(element.style, ruleValueCollection);
        });

        return this;
    }
}

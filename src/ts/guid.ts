export module Guid {

    let _guid = 1;

    export function next() {
        return _guid++;
    }
}

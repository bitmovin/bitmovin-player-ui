export module Guid {

    let guid = 1;

    export function next() {
        return guid++;
    }
}

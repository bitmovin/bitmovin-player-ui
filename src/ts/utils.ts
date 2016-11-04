export module ArrayUtils {
    /**
     * Removes an item from an array.
     * @param array
     * @param item
     * @returns {any}
     */
    export function remove<T>(array: T[], item: T) : T {
        var index = array.indexOf(item);

        if(index > -1) {
            return array.splice(index, 1)[0];
        } else {
            return null;
        }
    }
}
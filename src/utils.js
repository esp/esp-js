export function removeAll(arr, item) {
    for(var i = arr.length; i--;) {
        if(arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}

export function isString(value) {
    return typeof value == 'string' || value instanceof String;
}

export function format(formatString) {
    //Guard.isString(format, "First argument to a log function should be a string, but got [" + format + "]");
    var args = Array.prototype.slice.call(arguments, 1);
    var message = formatString.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
    return message;
}
export function sprintf(format, etc) {
    var arg = arguments;
    var i = 1;
    return format.replace(/%((%)|s)/g, function (m) { return m[2] || arg[i++]; });
}

export function isString(value) {
    return Object.prototype.toString.call(value) === '[object String]';
}

export function isNumber(value) {
    return Object.prototype.toString.call(value) === '[object Number]';
}

export function indexOf(array, item) {
    var iOf;
    if(typeof Array.prototype.indexOf === 'function') {
        iOf = Array.prototype.indexOf;
    } else {
        iOf = function(item) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                if(this[i] === item) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    var index = iOf.call(array, item);
    return index;
}
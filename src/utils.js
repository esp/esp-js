exports.sprintf = function sprintf(format, etc) {
    var arg = arguments;
    var i = 1;
    return format.replace(/%((%)|s)/g, function (m) { return m[2] || arg[i++]; });
};

exports.isString =function(value) {
    return typeof value == 'string' || value instanceof String;
};

var indexOf = function(array, item) {
    if(typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(item) {
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

    var index = indexOf.call(array, item);
    return index;
};

exports.indexOf = indexOf;
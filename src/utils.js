exports.sprintf = function sprintf(format, etc) {
    var arg = arguments;
    var i = 1;
    return format.replace(/%((%)|s)/g, function (m) { return m[2] || arg[i++]; });
};

exports.isString =function(value) {
    return typeof value == 'string' || value instanceof String;
};
String.prototype.reverse = function () {
    return this.split('').reverse().join('');
};
    var index= 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var encode= function (_number) {
        if ('undefined' == typeof _number) {
            return null;
        }
        else if ('number' != typeof (_number)) {
            throw new Error('Wrong parameter type');
        }

        var ret = '';

        for (var i = Math.floor(Math.log(parseInt(_number)) / Math.log(index.length)); i >= 0; i--) {
            ret = ret + index.substr((Math.floor(parseInt(_number) / bcpow(index.length, i)) % index.length), 1);
        }

        return ret.reverse();
    }

    var decode= function (_string) {
        if ('undefined' == typeof _string) {
            return null;
        }
        else if ('string' != typeof _string) {
            throw new Error('Wrong parameter type');
        }

        var str = _string.reverse();
        var ret = 0;

        for (var i = 0; i <= (str.length - 1); i++) {
            ret = ret + index.indexOf(str.substr(i, 1)) * (bcpow(index.length, (str.length - 1) - i));
        }

        return ret;
    }

    var bcpow= function (_a, _b) {
        return Math.floor(Math.pow(parseFloat(_a), parseInt(_b)));
    }

module.exports = {
    encode,
    decode
}
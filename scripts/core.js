module.exports = (function(){


Date.prototype.yyyymmdd = function() {
let mm = this.getMonth() + 1; // getMonth() is zero-based
let dd = this.getDate();

return [this.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd,
        ].join('-');
};

let date = new Date();
date.yyyymmdd();

Date.prototype.getUnixTime = function() { return this.getTime()/1000|0 };
global.timestampToDate = function timestampToDate(unix_timestamp) { return new Date(unix_timestamp*1000) }

global.isUser = function (req){
    if (!req.session || !req.session.user) return false;
    else return true;
}

})


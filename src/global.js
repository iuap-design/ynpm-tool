'use strict';

var Global = function() {
    console.log(" Global ");
};

Global.prototype = {
    registry : '',
    /**
     * 存储活动信息
     */
    actInfo: {}, 


    getPing: function() {
        
        this.registry = "www";
    },
    /**
     * 获取当前用户信息
     */
    getUserInfo: function() {
        var promise = http.fetch({
            url: api.getUserInfo(),
            data: {
                activityId: this.getAcid(),
                userToken: this.getUserToken()
            }
        });

        promise.done((res) => {
            if (res.errcode == 0) {
                if (res.data.host == 1) {
                    this.userInfo = res.data;
                } else {
                    this.hostUserInfo = res.data;
                }
            }

        });
        return promise;
    }
}

module.exports = new Global();

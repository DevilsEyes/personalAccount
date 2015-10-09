(function (a) {
    var u = navigator.userAgent;

    //a.connectWebViewJavascriptBridge = function (callback) {
    //    if (window.WebViewJavascriptBridge) {
    //        callback(WebViewJavascriptBridge);
    //    } else {
    //        document.addEventListener('WebViewJavascriptBridgeReady', function() {callback(WebViewJavascriptBridge);}, false);
    //    }
    //};
    //a.connectWebViewJavascriptBridge(function(bridge) {
    //    bridge.init(function(message, responseCallback) {});
    //
    //    bridge.registerHandler('iosCallback', function(data, responseCallback) {
    //        $('#loading').hide();
    //        template.render('test',{content:al$print(data)});
    //    })
    //});

    //暴露接口
    var tatoo = {
        data: {},//用于存放从客户端获得的数据

        get: function (target, next) {//用户从客户端获取数据
            //------------------------------------------
            //
            //   target为获取内容
            //   格式：<字符串> target
            //   例如:
            //       userInfo
            //
            //-------------------------------------------

            if ($tatoo.isAndroid) {
                var method = 'get' + target.substr(0, 1).toUpperCase() + target.substr(1);
                //实际调用Android的 getXXXX方法得到一个JSON字符串
                tatoo.data[target] = $.parseJSON(window['tattoo_Android'][method]());

                return setTimeout(function () {
                    next(tatoo.data[target]);
                }, 0);//执行回调
            } else if ($tatoo.isIOS) {
                $tatoo.callbackFunction[target] = next;//注册回调事件
                //$('head').append('<script src="wsdk://' + target +'"></script>');
                return location.href = 'wsdk://' + target;
                //  wsdk://SessionId
                //  wsdk://getStack(a,b)
            }

        },

        callback: function (target,dataJson) {//用于给客户端回调
            //------------------------------------------
            //   window.tatoo.callback(target,dataJson)
            //
            //   str为返回值
            //   格式：<字符串> target|dataJson
            //   例如:
            //       userInfo|"{'nickname':'呵呵哒'}"
            //
            //-------------------------------------------
            //template.render('test',{content:target+':'+dataJson});


            if ($tatoo.isIOS) {
                tatoo.data[target] = $.parseJSON(dataJson);//存放数据
                $tatoo.callbackFunction[target](tatoo.data[target]);//执行回调
                $tatoo.callbackFunction[target] = null;//解除回调事件的注册
            }
        },

        pushStack: function (url) {
            console.log(url);
            if (typeof url == 'undefined') {
                url = 'h5://' + location.host + location.pathname + location.search + location.hash
            }
            if ($tatoo.isAndroid)$tatoo.AndroidPushStack(url);
        },

        popStack: function (isRefresh, url) {
            if ($tatoo.isAndroid)$tatoo.AndroidPopStack(isRefresh,url);
        },

        getStack:function(){
            if ($tatoo.isAndroid){
                var stack = window['tattoo_Android'].getStack();
                return $.parseJSON(stack);
            }
        }

        //Webview堆栈操作
        //-----------------------------------------------------
        //压栈
        // push(pageKey)
        //
        //清除栈底以上所有
        // popUntilBottom()
        //
        //栈顶弹栈
        // popTop()
        // popTopAndRefresh()
        //
        //pageKey以上清空
        // popUntil(pageKey)
        // popUntilAndRefresh(pageKey)

    };

    //私有
    var $tatoo = (function () {
        return {
            callbackFunction: {},//异步时注册的回调列表

            AndroidPushStack: function (url) {
                window['tattoo_Android'].push(url)
            },
            AndroidPopStack: function (isRefresh,url) {
                if (url === 0) {
                    window['tattoo_Android'].popUntilBottom();
                }

                if (isRefresh) {
                    if (!url) {
                        window['tattoo_Android'].popTopAndRefresh();
                    }else{
                        window['tattoo_Android'].popUntilAndRefresh(url);
                    }
                } else {
                    if (!url) {
                        window['tattoo_Android'].popTop();
                    }else{
                        window['tattoo_Android'].popUntil(url);
                    }
                }
            },

            //isAndroid:true,
            isAndroid: u.indexOf('Android') > -1, //android终端
            isIOS: true
            //isIOS: u.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) != null//ios终端
        };
    })();

    console.log('isIOS:'+$tatoo.isIOS);

    return a.tatoo = tatoo;
})(window);

//web端JS调用方式
// tatoo.get('userInfo',function(obj){
//     console.dir(obj);
// })
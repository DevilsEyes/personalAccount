(function (a) {
    var u = navigator.userAgent;

    //暴露接口
    var tatoo = {

        navBarClick:null,//用于给客户端存放navbar点击事件
        client: function (method, params, next) {
            if (next) {
                var stamp = '' + $tatoo.count;
                $tatoo.callbackFunction[stamp] = next;
                params['stamp'] = stamp;
                $tatoo.count++;
            }

            var i,paramsArray=[];
            for (i in params){
                paramsArray.push(i + '=' + params[i]);
            }

            var url = 'wsdk://' + method;
            if(paramsArray.length)url+='?' + paramsArray.join('&');

            //console.log('hehe');
            console.log(url);
            $tatoo.post(url);
        },
        callback: function (stamp, dataJson) {//用于给客户端回调

            var data = $.parseJSON(dataJson);

            $tatoo.callbackFunction[stamp](data);//执行回调
            $tatoo.callbackFunction[stamp] = null;//解除回调事件的注册

        },



        get: function (target, next) {//用户从客户端获取数据

            var method = 'get' + target.substr(0, 1).toUpperCase() + target.substr(1);
            this.client(method,{},next);

        },
        pushStack: function (url) {
            console.log(url);
            if (typeof url == 'undefined') {
                url = 'h5://' + location.host + location.pathname + location.search + location.hash
            }
            this.client('push',{url:url});
        },

        popStack: function (isRefresh, url) {
            if(url === 0)return this.client('popUntilBottom');
            if(isRefresh){
                if(url)this.client('popUntil',{url:url});
                else this.client('popTop');
            }else{
                if(url)this.client('popUntilAndRefresh',{url:url});
                else this.client('popTopAndRefresh');
            }
        },

        getStack: function (next) {
            this.client('getStack',{},next);
        },

        setTitle: function (str) {
            document.title = str;
            if ($tatoo.isIOS) {
                return location.href = 'wsdk://';
            }
        }
    };

    //私有
    var $tatoo = {
        count: 1,
        callbackFunction: {},//异步时注册的回调列表
        navBarButton:{
            text:'',
            textColor:'',
            imgSrc:''
        },

        post:function(url){

            if($tatoo.isAndroid){
                var node = '<img src="'+url+'" type="hidden" id="wsdk">';
                $('head').append(node).find('#wsdk').remove();
            }
            if($tatoo.isIOS){
                location.href = url;
            }
        },

        //isAndroid:true,
        isAndroid: u.indexOf('Android') > -1, //android终端
        //isIOS: true
        isIOS: u.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) != null//ios终端
    };

    return a.tatoo = tatoo;
})(window);

//web端JS调用方式
// tatoo.get('userInfo',function(obj){
//     console.dir(obj);
// })
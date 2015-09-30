//var g$url = 'http://api.meizhanggui.cc/Wenshen/V3.0.0/';
var g$url = 'http://123.57.42.13/Wenshen/V3.0.0/';

var g$sid = '这是一个获取SessionId';//获取SessionId
var UserInfo = {};
//var g$sid = location.search.substr(1).match(/_id=([^\b&]*)/)[1];//获取店铺id

window.addEventListener('load', function () {
    FastClick.attach(document.body);
}, false);

var ex = {
    jsonp: function (obj) {
        $.jsonp({
            url: obj.url,
            callbackParameter: obj.callbackParameter ? obj.callbackParameter : "callback",
            data: obj.data ? obj.data : null,
            success: obj.success,
            error: obj.error ? obj.error : function () {
                layer.msg('您的网络连接不太顺畅哦!');
            },
            beforeSend: obj.beforeSend ? obj.beforeSend : function () {
            },
            complete: obj.complete ? obj.complete : function () {
            }
        })
    }
};

juicer.register('formatTime', function (str) {
    var DATE = new Date(str);
    return DATE.getFullYear() + '年' + DATE.getMonth() + '月' + DATE.getDate() + '日， ' + DATE.getHours() + ':' + DATE.getMinutes();
});

juicer.register('formatAmount', function (str, type) {
    var color = type ? 'red' : 'green';
    return '<p style="color:' + color + '">str</p>';
});

juicer.register('formatBank', function (str) {
    return bank.bankList[str];
});

var bank = {
    bankList: {
        'CMBCCNBS': '招商银行',
        'ICBKCNBJ': '工商银行',
        'PCBCCNBJ': '建设银行',
        'SPDBCNSH': '上海浦东发展银行',
        'ABOCCNBJ': '农业银行',

        'FJIBCNBA': '兴业银行',
        'BJCNCNBJ': '北京银行',
        'EVERCNBJ': '光大银行',
        'MSBCCNBJ': '民生银行',
        'SZCBCNBS': '平安银行',

        'COMMCNSH': '深圳银行',
        'SZDBCNBS': '交通银行',
        'CIBKCNBJ': '中信银行',
        'GDBKCN22': '广发银行'
    }
};
xxx

var template = {
    render: function (page, data) {
        if (page != 'detailsRow') {
            $('#main').html('<div id="' + page + '">' + template[page].render(data) + '</div>');
        } else {
            $('#details #list').append(template[page].render(data));
        }
    }
};

$(document).ready(function () {

    $('script.template').each(function () {
        var $this = $(this);
        template[$this.attr('id')] = juicer($this.html());
        $this.remove();
    });
    console.dir(template);

    ex.jsonp({
        url: g$url + 'User/login?_method=POST',
        data: {
            phonenum: '13261712253',
            password: '123456'
        },
        success: function (obj) {
            obj = $.parseJSON(obj);
            console.dir(obj);
            if (!obj.code) {
                UserInfo = obj.data.userInfo;
//------------------------------------------------------------------------
                routie({
                    "info": page.info.init,
                    "details": page.details.init,
                    "mycard": page.mycard.init,
                    "binding": function () {
                        console.log('binding')
                    },
                    "*": function () {
                        location.hash = '#info'
                    }
                });
//------------------------------------------------------------------------
            } else {
                layer.msg(obj.msg);
            }
        }
    });
});

var page = {
    info: {
        init: function () {
            document.title = '账户';

            ex.jsonp({
                url: g$url + 'User/income?_method=GET',
                data: {
                    _sid: g$sid
                },
                success: function (obj) {
                    obj = $.parseJSON(obj);
                    console.dir(obj);

                    if (!obj.code) {
                        var data = obj.data;
                        template.render('info', {
                            accountAmount: data.waitDrawAmount + data.drawingAmount
                        });

                        $('#info .row').each(function (index) {
                            if (index == 0)$(this).click(page.info.toMycard);
                            if (index == 1)$(this).click(page.info.toDetails);
                        });

                        $('#loading').hide();
                    }
                    else {
                        layer.msg(obj.msg);
                    }
                }
            })
        },
        toMycard: function () {
            if (UserInfo.bankcard) {
                routie('mycard');
            } else {
                routie('binding');
            }
        },
        toDetails: function () {
            routie('details');
        }
    },

    details: {
        timer: null,
        isLoading: false,
        index: 0,

        init: function () {
            document.title = '账户明细';
            $('#loading').hide();
            template.render('details', {});
            page.details.load();

            page.details.timer = setInterval(function () {
                if (page.details.isLoading)return;
                var sh = $(window).scrollTop(),
                    wh = $(window).height(),
                    dh = $(document).height();
                if (sh + wh > dh - 100) {
                    $('#details .tip').fadeIn(100);
                    page.details.load();
                }
            }, 50)
        },
        load: function () {
            ex.jsonp({
                url: g$url + 'BillAccount/list?_method=GET',
                data: {
                    _sid: g$sid,
                    index: page.details.index,
                    limit: 6
                },
                success: function (obj) {
                    obj = $.parseJSON(obj);
                    console.dir(obj);

                    if (!obj.code) {
                        var data = obj.data;
                        if ((!data.length) && page.details.index == 0) {
                            $('#details .tip').text('一条记录也没有呢');
                            clearInterval(page.details.timer);
                        } else {
                            $('#details .tip').fadeOut(100);
                            if (data.length < 6)clearInterval(page.details.timer);
                            for (var i = 0; i < data.length; i++) {
                                template.render('detailsRow', data[i]);
                            }
                        }
                    } else {
                        layer.msg(obj.msg);
                    }
                },
                beforeSend: function () {
                    page.details.isLoading = true;
                },
                complete: function () {
                    page.details.isLoading = false;
                }
            })
        }

    },

    mycard: {
        init: function () {
            document.title = '我的银行卡';
            $('#loading').hide();
            template.render('mycard', UserInfo.bankcard);
        }
    }
};


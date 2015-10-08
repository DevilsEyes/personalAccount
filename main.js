//var g$url = 'http://api.meizhanggui.cc/Wenshen/V3.0.0/';
var g$url = 'http://123.57.42.13/Wenshen/V3.0.0/';

var g$sid = '这是一个获取SessionId';//获取SessionId
var UserInfo = {};
//var g$sid = location.search.substr(1).match(/_id=([^\b&]*)/)[1];//获取店铺id

tatoo.get('SessionId', function (obj) {
    console.dir(obj);
    g$sid = obj;
});

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

        //'FJIBCNBA': '兴业银行',
        //'BJCNCNBJ': '北京银行',
        //'EVERCNBJ': '光大银行',
        'MSBCCNBJ': '民生银行',
        'SZCBCNBS': '平安银行',

        'COMMCNSH': '深圳银行',
        'SZDBCNBS': '交通银行',
        'CIBKCNBJ': '中信银行'
        //'GDBKCN22': '广发银行'
    },
    getlist: function () {
        var array = [];
        for (var i in bank.bankList) {
            array.push({
                code: i,
                name: bank.bankList[i]
            })
        }
        return array;
    }
};

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
                    "binding": page.binding.init,
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
    isLoading: false,
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
                    //console.dir(obj);

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
            if (UserInfo.bankcard) {
                $('#loading').hide();
                template.render('mycard', UserInfo.bankcard);
                $('#mycard .row').click(page.mycard.binding);
            }
            else {
                return routie('binding');
            }
        },
        binding: function () {
            return routie('binding');
        }
    },

    binding: {
        $selector: null,
        bank: '',
        init: function () {
            document.title = '绑定银行卡';
            $('#loading').hide();
            template.render('binding', {
                bankList: bank.getlist()
            });

            page.binding.$selector = $('#binding div:eq(0)');
            page.binding.$selector.click(function () {
                $('#binding ul').toggleClass('hide');
            });

            $('#binding div').click(function () {
                $(this).find('input').focus();
            });

            $('#binding li').click(page.binding.chooseBank);
            $('#binding button').click(page.binding.finish);
        },
        chooseBank: function () {
            var code = $(this).find('i').attr("class").substr(10);
            page.binding.$selector.find('i').attr("class", 'icon bank-' + code);
            page.binding.$selector.find('span').text(bank.bankList[code]);
            page.binding.bank = code;
            $('#binding ul').toggleClass('hide');
        },
        finish: function () {
            if (page.isLoading)return;

            var cardNum, name, bank;

            bank = page.binding.bank;
            cardNum = $('input.cardNum').val();
            name = $('input.name').val();

            if (bank == '')return layer.msg('请选择银行');
            if (cardNum.length < 10)return layer.msg('请填写正确的银行卡号');
            if (name.length < 2)return layer.msg('请填写姓名');

            ex.jsonp({
                url: g$url + 'User/userInfo?_method=POST',
                data: {
                    bankcard: {
                        cardNum: cardNum,
                        name: name,
                        bank: bank
                    }
                },
                success: function (obj) {
                    obj = $.parseJSON(obj);
                    if (!obj.code) {
                        layer.msg('绑定银行卡成功！');
                        UserInfo.bankcard = {
                            cardNum: cardNum,
                            name: name,
                            bank: bank
                        };
                        return routie('mycard');
                    }
                    else {
                        return layer.msg(obj.msg);
                    }
                },
                beforeSend: function () {
                    $('#loading').show();
                    page.isLoading = true;
                },
                complete: function () {
                    $('#loading').hide();
                    page.isLoading = false;
                }
            })
        }
    }
};
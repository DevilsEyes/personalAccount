//打印3层以内的Object,给alert用！
window.al$print = function(obj){
    var str='';
    if(typeof obj[i] != 'object')return obj;
    for (var i in obj) {

        if(typeof obj[i] == 'function'){
            str += '  ' + i + ':isFunction;';
        }
        else{
            str += '  ' + i + ': ' + obj[i] + '; ';
        }

        if (typeof obj[i] == 'object') {

            str += '{';
            for (var j in obj[i]) {

                if(typeof obj[i][j] == 'function'){
                    str += '  ' + j + ':isFunction;';
                }
                else{
                    str += '  ' + j + ': ' + obj[i][j] + '; ';
                }

                if (typeof obj[i][j] == 'object') {
                    str += '{';

                    for (var k in obj[i][j]) {
                        if(typeof obj[i][j][k] == 'function'){
                            str += '  ' + k + ':isFunction;';
                        }
                        else{
                            str += '  ' + k + ': ' + obj[i][j][k] + '; ';
                        }
                    }
                    str += '}';
                }
            }
            str += '}';
        }
    }

    return str;
};
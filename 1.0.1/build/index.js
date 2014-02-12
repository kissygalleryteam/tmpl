/*
combined files : 

gallery/tmpl/1.0.1/index

*/
 /*
 ** @prop: Dynamic Reverse Template Engine for KISSY
 ** @author: yujiang<zhihao.gzh@alibaba-inc.com>
 ** @data: 2013 09 22
 ** @quote: Simple JavaScript Templating John Resig - http://ejohn.org/ - MIT Licensed
 ** @module tmpl
 */
KISSY.add('gallery/tmpl/1.0.1/index',function(S, Node) {

    //缓存，用来缓存编译过的模板，因为使用的new Function的内置js解析器
    var cache = {};

    //like jquery
    var $ = Node.all;

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 数据转换函数 - 将a.b.c的类似字符串转换成data[a][b][c]
    //+ 如果数据为空，那么将返回-1表示数据没找到
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function translateData(arg, data) {
        var arr = arg.split('.');
        var count = -1;

        //递归实现a.b.c=>data[a][b][c]
        function t(arr, data) {

            count++;

            if (arr[count]) {
                //处理数组
                var key = arr[count].replace(/\[[^\]]*\]/g, '');
                var index = /\[([\d\w]*)\]/g.exec(arr[count]);

                if (index && (index[1] != undefined) && data[key] && (data[key][index[1]] != undefined)) {
                    return t(arr, data[key][index[1]]);
                } else {
                    if ((data[arr[count]] != undefined)) {
                        return t(arr, data[arr[count]]);
                    } else {
                        //如果没有此变量就返回字符串
                        return -1;
                    }
                } //end of if

            } else {
                //如果没有此变量就返回字符串
                return (data != undefined) ? data : -1;

            } //end of if

        } //end of t

        return t(arr, data);

    } //end of translateData

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 动态更新视图 - 查找.node-watch节点，分析data-watch属性
    //+ 根据其type来实现相应的更新
    //+ class如果有第三个参数且不是'rm'，那么将进入状态模式（不重复添加class）
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function update(nodes, data) {

        nodes.each(function(item, index) {

            var watchNum = item.attr('data-watch').split(',');

            for (var i = 0, len = watchNum.length; i < len; i++) {

                //args[0]:type, args[1]:key, args[2]:value
                var args = watchNum[i].split(':');

                //根据类型更新
                switch (args[0]) {
                    case 'text':
                        var txt = translateData(args[1], data);
                        if (txt != -1) {
                            item.html(txt);
                        }
                        break;

                    case 'value':
                        var val = translateData(args[1], data);
                        if (val != -1) {
                            item.html(val);
                        }
                        break;

                    case 'attr':
                        var val = translateData(args[2], data);
                        if (val != -1) {
                            item.attr(args[1], val);
                        }
                        break;

                    case 'style':
                        var val = translateData(args[2], data);
                        if (val != -1) {
                            switch (args[1]) {
                                case 'left':
                                case 'right':
                                case 'top':
                                case 'bottom':
                                case 'width':
                                case 'height':
                                case 'paddingLeft':
                                case 'paddingRight':
                                case 'paddingTop':
                                case 'paddingBottom':
                                case 'marginLeft':
                                case 'marginRight':
                                case 'marginTop':
                                case 'marginBottom':
                                    item.css(args[1], val + 'px');
                                    break;
                                default:
                                    item.css(args[1], val);
                                    break;
                            }
                        }
                        break;

                    case 'class':
                        var clazz = translateData(args[1], data);
                        if (clazz != -1) {
                            if (args[2]) {
                                if (args[2] == 'rm') {
                                    item.removeClass(clazz);
                                } else {
                                    item[0].className = item[0].className.
                                    replace(/state-[^\s]*[\s]?/ig, '').
                                    replace(/(\s)+/ig, '$1');
                                    if (!item.hasClass(clazz)) {
                                        item.addClass(clazz);
                                    }
                                }
                            } else {
                                item.addClass(clazz);
                            }
                        }
                        break;

                        //局部全体更新，需要重新编译
                    case 'part':
                        var target = args[1],
                            to = args[2];

                        var result = compileTpl($(target).html());
                        cache[target] = result;
                        $(to).html(data ? result(data) : result);
                        break;

                    default:
                        break;
                } //end of switch

            } //end of for

        }); //end of each

    } //end of update

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 编译函数 - 返回的是个function
    //+ 段代码基于John Resig 的 Simple JavaScript Templating
    //+ 可在 http://ejohn.org/ 看到
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function compileTpl(str) {

        //子模板引入
        var tmp,
            subs = [];
        subs = str.match(/<%=include\(([^)]*)\)=%>/ig) || [];

        for (var i = 0, len = subs.length; i < len; i++) {
            subs[i] = subs[i].replace('<%=include(', '').replace(')=%>', '');
            //如果有子模板替换，没有就为空
            if ($('#' + subs[i])[0]) {
                str = str.replace(/<%=include\(([^)]*)\)=%>/i, $('#' + subs[i]).html());
            } else {
                str = str.replace(/<%=include\(([^)]*)\)=%>/i, '');
            }
        }

        //利用Function构造函数创建js解析器，动态解析js
        var fn = new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" +

            "with(obj){p.push('" +

            str.replace(/[\r\t\n]/g, "").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") +
            "');}return p.join('');");

        return fn;

    } //end of comileTpl

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 渲染函数 - 编译模板并添加到dom
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function render(tpl, target, data, callback) {

        var html = tpl.html().replace(/>\s+</ig, "><");

        //编译
        var result = compileTpl(html);

        //添加到模板
        target.html(data ? result(data) : result);

        //回调传出fn
        if (callback) {
            callback(result);
        }

    } //end of render


    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+
    //+ 入口函数 - 对外接口
    //+ 第一次调用会全部渲染，第二次开始会去缓存，如果有动态视图更新，那
    //+ 么将进行动态视图渲染
    //+
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    function Tmpl(tpl, target, data, watch) {

        //str表示缓存key，一般用id，如果没有id，则不保留缓存
        var str = tpl.attr('id') || 'nocache';
        var isNeedWatch = (watch === undefined) ? true : watch;

        //局部更新数据，说明已经生成节点
        if (cache[str]) {

            var nodes = {};
            if (isNeedWatch) {
                //遍历寻找需要动态修改的节点
                nodes = target.all('.node-watch');
            } else {
                nodes = [];
            }

            //如果没有动态更新的节点，就用缓存重绘视图
            if (nodes.length < 1) {

                target.html(data ? cache[str](data) : cache[str]);

            } else {

                //局部更新
                update(nodes, data);
            }

        } else {

            //渲染
            render(tpl, target, data, function(fn) {
                //生成cache
                cache[str] = fn;
            });

        } //end of if

    } //end of Tmpl

    //静态编译方法
    Tmpl.compile = function(tpl, data) {
        //str表示缓存key，一般用id，如果没有id，则不保留缓存
        var str = tpl.attr('id') || 'nocache';

        if (!data) {
            return '';
        }

        if (cache[str]) {

            return cache[str](data);

        } else {
            
            var html = tpl.html().replace(/>\s+</ig, "><");

            //编译
            var result = compileTpl(html);
            //生成cache
            cache[str] = result;

            return result(data);
        }
    }

    //暴露入口接口
    return Tmpl;

}, {
    requires: ['node']
});





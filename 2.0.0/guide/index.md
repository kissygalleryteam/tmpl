## 综述

Tmpl是一个前端模板引擎，但不仅仅如此。

* 版本：2.0.0
* 作者：yujiang（禺疆）
* demo：[http://kg.kissyui.com/tmpl/2.0.0/demo/index.html](http://kg.kissyui.com/tmpl/2.0.0/demo/index.html)

## 概要简介
Tmpl是一个前端模板引擎，但不仅仅如此，它是一个动态反转模板引擎。

* 动态：如果你在模板节点上添加了class为node-watch的标识并且开启了watch标识那么在每次重复调用同一个Tmpl编译模板时会根据指定的属性、value等来更新数据（类MVVC）

* 反转：之所以不把模板写在js里作为字符串是因为模板占小部分，逻辑代码占大部分，但是在模板中这样的情况往往相反，大部分都是模板，少部分是逻辑，所以如果把逻辑代码作为字符串，作为一个反转就更加方便。
听了概要以后，肯定更加迷糊了，完全不知所云有木有，不过没关系，我们来看下模板的编写规则你就知道了。

### 优势
* 小巧 : 不足2k
* 强大 : 基本上满足业务
* 方便 : 用过xtemplate的人都知道，要根据一些情况来动态设置值多蛋疼（command ^*^(%#%@^$）
* 上手快，无成本 : 就是写js...还支持function
* 性能稳定性都不错

## 模板编写规则
	<script id="test-tpl" type="text/template">
		<!-- 简单的逻辑使用，就像写原生js一样，只不过是像在js里用’引起来，这里是在模板里引js，通过<%%> -->
		<ul class="list">
			<% for (var i=0; i<data.length; i++) { %>
				<% if ( i == data.length) { %>
				<li>这是第最后一行，并且它值<%=data[i].price.toFixed(2)%></li>	
				<% } else { %>
				<li>这是第<%=i%>行，并且它值<%=data[i].price.toFixed(2)%></li>	
				<% } %>
			<% } %>
		</ul>
	</script>
	<script id="test2-tpl" type="text/javascript">
		<!-- 添加了node-watch的节点会去识别data-watch属性，从而动态更新值而不需要append整段html -->
		<ul class="list">
		<% for (var i=0; i<data.length; i++) { %>
			<li class="item">
				<img src="<%=data[i].pic%>">
				<p class="title"><a href="<%=data[i].href%>"><%=data[i].title%></a></p>
				<p class="price node-watch" data-watch="text:data[<%=i%>].price"><%=data[i].price%></p>
				<p class="status <%=data[i].class%>" data-watch="class:data[<%=i%>].class">购买</p>
			</li>
		<% } %>
		</ul>
	</script>

### 语法说明
* <%  : 表达式前缀
* %>  : 表达式后缀
* <%= : 表示直接输出
* <%=include(id) : 引入子模板

### watch type说明
* class : 修改class
* attr: 修改属性
* text: 修改文本(html)
* style: 修改样式
* value: 修改value

## 引入组件

	//引入kg packages
	KISSY.config({
		packages: [{
			name: 'kg',
			path: 'http://a.tbcdn.cn/s/kissy/',
			ignorePackageNameInUri: false
		}]
	});
	
	//使用
    S.use('kg/tmpl/1.0/index', function (S, Tmpl) {
    	var $ = Node.all;

    	//模板必须要有id（用于缓存以及标识）
    	var tpl = $('#test-tpl'),
    		tplTo = $('#content'),
    		data = getData();

    	//1.直接编译
    	Tmpl(tpl, tplTo, data);

    	//2.编译返回
    	var result = Tmpl.compile(tpl, data);
    });

## API说明
### 直接使用 Tmpl(tpl, target, data [,watch])
* tpl: 模板
* target: 模板编译后添加进入的容器
* data: 数据
* watch: 是否启用动态更新（可选，默认开启，稍后有说明）

### 使用静态方法 Tmpl.compile(tpl, data)
* tpl: 模板
* data: 数据
* return: 编译好的字符串

## 原理说明

### 引擎核心
引擎核心原理其实是源于jquery作者John Resig的一篇文章[JavaScript Micro-Templating](http://ejohn.org/blog/javascript-micro-templating/ "JavaScript Micro-Templating")
进过我的一些处理变成了现在的Tmpl组件，其很巧妙的掌握了‘相对’的概念，并且对同一模板有缓存（id识别），所以在性能上和稳定性上都不错。

### 动态更新
通过class标识以及data-watch指定，对指定的type进行查找处理，从而避免每次都重刷页面。

## 使用场景
目前已经经过了双十二的检验，值得信赖（不过也有可能有bug...）
一般使用场景都可满足，对于富交互应用，我更推荐预编译+动态前端编译的方式。
并且适用于一部分MVVC场景

## 缺点
* 动态更新还是有很多局限，比如不能动态增加或删除数据（根据数据）
* 对于错误检测还是有很多欠缺，不方便调试，但是你可以目测，锻炼眼力！

### 一般的错误
* 忘了写%>
* 忘了写<%=的=号
* 读取了undefined的错误（这个应该会有编译报错）
* 多写了;号
* 写了中文字符

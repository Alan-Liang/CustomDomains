var debug=function(str){
	console.log("[CUSTOMDOMAINS] "+str);
};
var scr;
if(document.currentScript){
	//use current script
	scr=document.currentScript;
}else{
	var scripts=document.querySelector("script");
	scr=scripts[scripts.length];
}
setTimeout(function(){
	if(scr.getAttribute("data-instant")!==undefined){
		document.title=scr.getAttribute("data-title");
		var hint="data:text/html;charset=utf-8,"+(scr.getAttribute("data-hint")||"<h1>Page is still loading...</h1>");
		document.body.innerHTML="<iframe id=\"page\" src=\""+hint+"\"></iframe><style>html,body,#page{width:100%;height:100%;border:0;margin:0;overflow:hidden;}</style>";
	}
	var page=document.getElementById("page");
	var host=scr.getAttribute("data-proxy-to");
	if(!host){
		page.src="data:text/html,<h1>ProxyTo not found. Contact site admin for details.</h1>";
	}
	var path=location.pathname.substr(1)+location.search+location.hash;
	debug("Found ProxyTo: "+host);
	debug("Path is: "+path);
	var now=host+path;
	debug("Navigating to: "+now);
	page.src=now;
	var addMeta=function(obj){
		var __meta={
			version:3,
			name:"CustomDomains"
		};
		obj.__meta=__meta;
		return obj;
	};
	var isSameVersion=function(obj){
		if(!obj)return false;
		obj=obj.__meta;
		if(!obj) return false;
		var ideal=addMeta({}).__meta;
		if(obj.version==ideal.version&&obj.name==ideal.name)
			return true;
		else return false;
	};
	window.pageLoaded=false;
	var sendMsg=function(msg){
		return page.contentWindow.postMessage(addMeta(msg),"*");
	};
	window.addEventListener("message",function(e){
		if(!isSameVersion(e.data)){
			//stop immediately
			page.src="data:text/html,<h1>Sorry, but the version of the framework does not match. Contact site admin for details.</h1>";
			return;
		}
		console.log(e.data);
		var id=e.data.id;
		switch(e.data.type){
			case "pageload":
			document.title=e.data.title||document.title;
			if(!pageLoaded){
				pageLoaded=true;
				history.replaceState({isReload:true,src:e.data.location},"",e.data.location.replace(host,"/"));
			}else{
				history.pushState({isReload:true,src:e.data.location},"",e.data.location.replace(host,"/"));
			}
			sendMsg({id:id,type:"hello"});
			window.lastId=id;
			break;
			
			case "pushState":
			try{
				history.pushState(e.data.state,e.data.title,e.data.url);
				sendMsg({id:id,type:"success"});
			}catch(e){
				sendMsg({id:id,type:"error",error:e.toString()}); //Error cannot be transferred
			}
			break;
			
			case "replaceState":
			try{
				history.replaceState(e.data.state,e.data.title,e.data.url);
				sendMsg({id:id,type:"success"});
			}catch(e){
				sendMsg({id:id,type:"error",error:e.toString()}); //Error cannot be transferred
			}
			break;
			
			case "popState":
			try{
				//FIXME replace to real popstate
				history.replaceState({},"",e.data.url);
				sendMsg({id:id,type:"success"});
			}catch(e){
				sendMsg({id:id,type:"error",error:e.toString()}); //Error cannot be transferred
			}
			break;
			
			case "console.log":
			console.log.apply(console,e.data.args);
			break;
			
			case "console.error":
			console.error.apply(console,e.data.args);
			break;
			
			case "console.info":
			console.info.apply(console,e.data.args);
			break;
			
			case "console.debug":
			console.debug.apply(console,e.data.args);
			break;
			
			case "console.dir":
			console.dir.apply(console,e.data.args);
			break;
			
			case "console.warn":
			console.warn.apply(console,e.data.args);
			break;
			
			case "viewport":
			var vp=document.createElement("meta");
			vp.setAttribute("name","viewport");
			vp.setAttribute("content",e.data.viewport);
			document.head.appendChild(vp);
			break;
		}
	},false);

	window.onpopstate=function(e){
		if(e.state&&e.state.isReload&&e.page.src!=page.src){
			page.src=e.state.src;
			return;
		}
		sendMsg({id:(window.id?++id:0),type:"popState",state:e.state,location:location.href});
	};
},10);
var debug=function(str){
	console.log("[CUSTOMDOMAINS] "+str);
};
var addMeta=function(obj){
	var __meta={
		version:1,
		name:"CustomDomains"
	};
	obj.__meta=__meta;
	return obj;
};
var isSameVersion=function(obj){
	if(!obj)return false;
	obj=obj.__meta;
	if(!obj) return false;
	var ideal=getBasicObject().__meta;
	if(obj.version==ideal.version&&obj.name==ideal.name)
		return true;
	else return false;
};
var sendMsg=function(msg){
	return parent.postMessage(addMeta(msg),"*");
};
window.addEventListener("message",function(e){
	if(!isSameVersion(e.data)){
		//stop immediately
		//page.src="data:text/html,<h1>Sorry, but the version of the framework does not match. Contact site admin for details.</h1>";
		//return;
	}
	var id=e.data.id;
	switch(e.data.type){		
		case "popState":
		try{
			if(window.onpopstate) var res=window.onpopstate({state:e.data.state});
			sendMsg({id:id,type:"success",result:res});
		}catch(e){
			sendMsg({id:id,type:"error",error:e.toString()}); //Error cannot be transferred
		}
		break;
	}
},false);
sendMsg({id:0,type:"pageload",title:document.title,location:location.href});
var realConsole={};
var consoles="log|info|dir|warn|error|debug".split("|");
var arrify=function(args){
	var arr=[];
	for(var i=0;i<args.length;i++){
		arr.push(args[i]);
	}
	return arr;
};
var log=function(){
	realConsole[this.type].apply(console,arguments);
	sendMsg({type:"console."+this.type,args:arrify(arguments)});
};
for(var i=0;i<consoles.length;i++){
	realConsole[consoles[i]]=console[consoles[i]];
	console[consoles[i]]=log.bind({type:consoles[i]});
}
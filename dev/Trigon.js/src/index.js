import demo1 from './songs/demo1';
import clannad from './songs/clannad';
import performance_test from './songs/performance_test';
import resserections from './songs/resserections';
import LiYue from './songs/liyue';
import LiYue2 from './songs/liyue2';
import XiaoYeZi from './songs/xiaoyezi';
import Starcrossed from './songs/starcrossed';
import BreakDown from "./songs/breakdown";
var trigon=null;
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

document.getElementById("bt").onclick = function () {
    if(trigon==null){
        alert("Please select songs");
        return;
    }
    trigon.play();
}
document.getElementById("btStop").onclick = function () {
    if(trigon==null){
        alert("Please select songs");
        return;
    }
    trigon.stop();
}
document.getElementById("btPause").onclick = function () {
    if(trigon==null){
        alert("Please select songs");
        return;
    }
    trigon.pause();
}

var list=[
    // {name:"demo1",song:demo1},
    {name:"潮鸣り - 折戸伸治",song:clannad},
    {name:"Resserections - Lena Raine",song:resserections},
    {name:"黎月BGM - HoyoMix",song:LiYue},
    {name:"黎月BGM2 - HoyoMix",song:LiYue2},
    {name:"小夜子 - みきとP",song:XiaoYeZi},
    {name:"Starcrossed(TsuBaKi) - 连殇 ft. 贼恩",song:Starcrossed},
    {name:"BreakDown",song:BreakDown}
]


var dom_list=document.querySelector("#list")

dom_list.innerHTML="";

for(let index=0;index<list.length;index++){
    let new_dom=document.createElement('a');
    new_dom.setAttribute("name","song");
    new_dom.setAttribute("href","javascript:void(0);");
    let _index=index;
    new_dom.onclick=()=>{
        document.querySelector("#control").innerHTML="";
        document.querySelector("h3").innerText=list[_index].name;
        var song=new list[_index].song();
        song.create();
        trigon=song.trigon;
        if(song.customDom){
            song.customDom(document.querySelector("#control"));
        }
    }
    new_dom.innerHTML=list[index].name;
    let new_li=document.createElement('li');
    new_li.appendChild(new_dom);
    dom_list.appendChild(new_li);
}


let urlparam=getQueryVariable("id");
if(urlparam){
    document.querySelectorAll("a[name='song']")[parseInt(urlparam)-1].click();
}

//document.querySelectorAll("a[name='song']")[2].click();
//document.querySelector("#bt").click()
// document.querySelector("h3").innerText=list[1].name;
// trigon=list[1].song;
//import Wad from 'web-audio-daw';
import Wad from './wad/main';
import {notePitchShift} from './utils';
export default class{
    constructor(name=null,defaultNoteLength=4,pitchShift=0){
        this.data=[];
        this._name="trigon_pattern";
        this._lastSynth=null;
        this.name=name;
        this.stopOnNext=false;
        this.defaultNoteLength=defaultNoteLength;
        this.pitchShift=pitchShift;

        this.onplay=null;
    }
    addPattern(pattern,notes=null,offset=0){
        if(offset>0){
            for(var i=0;i<offset;i++){
                this.addNote(null,"0")
            }
        }
        if(!pattern){
            return;
        }
        if(pattern._name=="trigon_pattern"){
            if(pattern.stopOnNext==true){
                this.data=this.data.concat(pattern.data.map(item=>{
                    if(item.args==null){
                        item.args={}
                    }
                    item.args["_stop"]=true
                    return item;
                }));
            }
            else{
                this.data=this.data.concat(pattern.data);
            }
        }
        else{
            notes.forEach(note=>{
                this.addNote(pattern,note)
            })
        }
    }
    
    addNote(synth,note,hold,offset,args=null){
        if(offset>0){
            for(var i=0;i<offset;i++){
                this._addNote(null,"0")
            }
        }
        this._addNote(synth,note,args);
        if(hold>0){
            for(var i=0;i<hold;i++){
                this._addNote(null,"0")
            }
        }
    }
    addEvent(event){
        this.data.push({
            note:"_e",
            event:event
        })
    }
    _addNote(synth,note,args=null){
        let _t=note.split("/");
        var note_t=this.defaultNoteLength;
        if(_t.length>1){
            note=_t[0];
            note_t=parseInt(_t[1]);
        }

        if(this.data.length>0&&this.data[this.data.length-1].note=="_e"){
            let _data=this.data[this.data.length-1];
            _data.note=note;
            _data.synth=synth;
            _data.args=args;
        }
        else{
            this.data.push({
                synth:synth,
                note:note,
                args:args
            })
        }

        for(let i=1;i<note_t;i++){
            this.data.push({
                synth:null,
                note:"-",
                args:null
            })
        }
    }

    play(step){
        var _data=this.data[step];
        if(!_data){
            return false;
        }
        let synth=_data.synth;
        let note=_data.note;
        let args=_data.args;
        if(_data.event){
            _data.event(_data);
        }

        if(note!="0"&&note!="-"){
            if(this._lastSynth&&this._lastSynth.length>0){
                // if(this._lastSynth.length==2){
                //     if(this._lastSynth[0].note=="A#3"&&this._lastSynth[1].note=="F#2"){
                //         debugger
                //     }
                // }
                this._lastSynth.forEach(syn=>{
                    if(this.stopOnNext||syn.stop){
                        syn.synth.stop();
                    }
                })
                //this._lastSynth.synth.stop();
            }
            if(note=="m"||note=="M"){
                return true;
            }
            let notes=note.split("+");
            this._lastSynth=[];
            if(notes.length>1){
                notes.forEach(_n=>{
                    this._play(_n,synth,args);
                });
            }
            else{
                this._play(note,synth,args);
            }
            

            //this._lastSynth=synth;
            //console.log("track:"+this.name+" play:"+note);
            if(this.onplay){
                this.onplay(this.name,note);
            }
        }
        return true;
    }

    _play(note,synth,args=null){
        [note,args]=this._parseNoteArg(note,args);

        if(this.pitchShift!=0){
            note=notePitchShift(note,this.pitchShift)
        }

        if(args){
            synth.play({pitch : note, label : note,...args})
        }
        else{
            synth.play({pitch : note, label : note})
        }
        if(args&&args["_stop"]){
            this._lastSynth.push({synth:synth,stop:true,note:note})
            //this._lastSynth={synth:synth,stop:true};
        }
        else{
            this._lastSynth.push({synth:synth,stop:false,note:note});
            //this._lastSynth={synth:synth,stop:false};
        }
    }

    _parseNoteArg(note,args){
        if(note.indexOf("[")<=0||note.indexOf("]")<=0){
            return [note,args];
        }

        if(!args){
            args={}
        }

        note.match(/\[.*?\]/g).forEach(attr=>{
            attr=attr.substr(1,attr.length-2)
            let k=attr.split("=")[0];
            let v=attr.split("=")[1];
            if(k=="stop"){
                args["_stop"]=true;
            }
            else if(k&&v){
                args[k]=parseFloat(v);
            }
        });

        note=note.split("[")[0];
        return [note,args];
    }
}
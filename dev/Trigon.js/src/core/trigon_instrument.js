//import Wad from 'web-audio-daw';
import Wad from './wad/main';
export default class{
    constructor(){
        this._name="";
        this._type="trigon_instrument";
        this.map={};
    }
    setMap(_map){
        this.map=_map;
    }
    _play(note,args){
        var synth=this.map[note];
        if(synth){
            if(synth.onTrigger){
                synth.onTrigger(args);
            }
            else{
                synth.play(args);
            }
        }
    }
    play(args){
        var note=args["pitch"];
        var label=args["label"];
        if(note){
            if(this.onTrigger){
                this.onTrigger(args);
            }
            else{
                this._play(note,args);
            }
        }
    }
    stop(args){
        for(let syn in this.map){
            this.map[syn].stop();
        }
    }
}
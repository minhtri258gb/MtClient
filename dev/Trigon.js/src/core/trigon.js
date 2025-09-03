//import Wad from 'web-audio-daw';
import Wad from './wad/main';
import Instrument from './trigon_instrument';
var STATE={
    INIT:0,
    RUNNING:1,
    PAUSE:2,
    STOP:3
}
export default class{
    constructor(){
        this.tracks=[]
        this.interval=null;
        this.step=0;
        this.bpm=60;
        this.state=STATE.INIT;
        this._frameCount=0;
        this._skipFrame=60;
        this._stopMark=false;
        this._name="trigon";
        this._create=null;
        this.speed=1;
        this.pitchShift=0;
    }

    sine(args){
        return new Wad({ source : 'sine',...args});
    }
    sawtooth(args){
        return new Wad({ source : 'sawtooth',...args});
    }
    square(args){
        return new Wad({ source : 'square',...args});
    }
    triangle(args){
        return new Wad({ source : 'triangle',...args});
    }
    baseDrum(args){
        var inst=new Instrument();
        var map={
            "kick":new Wad({source : './samples/drum/kick.wav',...args}),
            "snare":new Wad({source : './samples/drum/snare.wav',...args}),
            "ohh":new Wad({source : './samples/drum/openhh.wav',...args}),
            "ohh3":new Wad({source : './samples/drum/openhh3.wav',...args}),
            "chh":new Wad({source : './samples/drum/closehh.wav',...args}),
            "chh2":new Wad({source : './samples/drum/closehh2.wav',...args}),
            "chh3":new Wad({source : './samples/drum/closehh3.wav',...args}),
        }
        inst.setMap(map);
        inst.onTrigger=args=>{
            var notes=args["pitch"].split("+");
            notes.forEach(note=>{
                inst._play(note,args);
            });
        }
        return inst;
    }
    metalCoreDrum(args){
        var inst=new Instrument();
        var map={
            "kick":new Wad({source : './samples/metalcoredrum/kick.wav',...args}),
            "snare":new Wad({source : './samples/metalcoredrum/snare.wav',...args}),
            "snare2":new Wad({source : './samples/metalcoredrum/snare2.wav',...args}),
            "crash":new Wad({source : './samples/metalcoredrum/crash.wav',...args}),
            "crash2":new Wad({source : './samples/metalcoredrum/crash2.wav',...args}),
            "hihat":new Wad({source : './samples/metalcoredrum/hihat.wav',...args}),
        }
        inst.setMap(map);
        inst.onTrigger=args=>{
            var notes=args["pitch"].split("+");
            notes.forEach(note=>{
                inst._play(note,args);
            });
        }
        return inst;
    }
    groupSource(sounds,args){
        let group = new Wad.Poly(args)
        sounds.forEach(sound=>{
            group.add(sound);
        });
        return group;
    }

    addTrack(pattern){
        if(this.pitchShift!=0){
            pattern.pitchShift=this.pitchShift;
        }
        this.tracks.push(pattern)
    }

    setPitchShift(p){
        this.tracks.forEach(t=>{
            t.pitchShift=p;
        });
        this.pitchShift=p;
    }

    setBpm(bpm){
        this.bpm=bpm;
        this._skipFrame=Math.round(60*60/bpm/10*2/this.speed)
        console.log("skipFrame:"+this._skipFrame)
    }
    setCreate(func){
        this._create=func;
    }
    play(){
        if(this.state==STATE.INIT){
            this.stop();
        }
        if(this.state!=STATE.RUNNING){
            this.tracks=[];
            if(this._create){
                this._create();
            }
            console.log("track-count:"+this.tracks.length);
            this._stopMark=false;
            this.state=STATE.RUNNING;
            requestAnimationFrame(()=>{
                this._onFrame();
            })
        }
    }
    setOnPlay(func){
        this.tracks.forEach(track=>{
            track.onplay=func;
        });
    }
    _onFrame(){
        if(!this._stopMark){
            requestAnimationFrame(()=>{
                this._onFrame();
            })
        }
        else{
            return;
        }
        this._frameCount+=1;
        if (this._frameCount % (1 + this._skipFrame) != 0) {
            return;
        }
        let isStop=true;
        this.tracks.forEach(track=>{
            //console.log("play:"+track.name)
            if(track.play(this.step)){
                isStop=false;
            }
        });
        this.step+=1;
        if(isStop){
            this.stop();
        }
        
    }
    pause(){
        this._stopMark=true;
        this.state=STATE.PAUSE;
    }
    stop(){
        this._frameCount=0;
        this.step=0;
        this._stopMark=true;
        this.state=STATE.STOP;
    }

}
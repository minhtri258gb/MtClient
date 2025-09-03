`
Resserections-Lena Raine
code:Lenshang
2020-09-21
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';


export default class{
    constructor(){
        this.trigon = new Trigon();
        this.trigon.speed=2;
        this.trigon.setBpm(145);
    }

    create(){
        var track1=new Pattern();
        var track2=new Pattern();
        var track2_2=new Pattern();
        var track3=new Pattern();
        var track3_2=new Pattern();
        var track4=new Pattern();
        //#region Track1(rynthm)
        var setTrack1=()=>{
            let env = { attack: 0.01, decay: 0, hold: 0.2, release: 0.1 }
            let delay = { delayTime: 0.8, wet: 0.25, feedback: 0.25 }
            let reverb={wet:0.7,impulse:"./samples/ir/Conic Long Echo Hall.wav"}
            let piano = this.trigon.square({ filter: { type: 'lowpass', frequency: 800, q: 1 }, env: env, delay: delay, volume: 0.15 })
            let piano2 = this.trigon.square({ filter: { type: 'lowpass', frequency: 2000, q: 1 },env: { attack: 0.001, decay: 0, hold: 0.2, release: 0.15 }, delay: { delayTime: 0.8, wet: 0.5, feedback: 0.5 }, volume: 0.2 })
            let chord1=new Pattern();
            chord1.addPattern(piano,["A2","C3","E3","G#3","C4","E4","G#4","C5","E5"]);
            chord1.addPattern(piano,["0","0","0","0","0","0","0"]);
            chord1.addPattern(piano,["A2","C3","E3","G#3","C4","E4","G#4","C5","E5"]);
            chord1.addPattern(piano,["0","0","0","0","0","0","0"]);
        
            let chord2=new Pattern();
            chord2.addPattern(piano,["G2","C3","E3","G3","C4","E4","G4","C5","E5"]);
            chord2.addPattern(piano,["0","0","0","0","0","0","0"]);
            chord2.addPattern(piano,["G2","C3","E3","G3","C4","E4","G4","C5","E5"]);
            chord2.addPattern(piano,["0","0","0","0","0","0","0"]);
        
            let chord3=new Pattern();
            chord3.addPattern(piano,["F2","A2","C3","F3","A3","C4","E4","A4","C5"]);
            chord3.addPattern(piano,["0","0","0","0","0","0","0"]);
            chord3.addPattern(piano,["F2","A2","C3","F3","A3","C4","E4","A4","C5"]);
            chord3.addPattern(piano,["0","0","0","0","0","0","0"]);
        
            let chord4=new Pattern();
            chord4.addPattern(piano,["E2","G#2","B2","E3","G#3","B3","E4","G#4","B4"]);
            chord4.addPattern(piano,["0","0","0","0","0","0","0"]);
            chord4.addPattern(piano,["E2","G#2","B2","E3","G#3","B3","E4","G#4","B4"]);
            chord4.addPattern(piano,["0","0","0","0","0","0","0"]);
            let section1=new Pattern();
            section1.addPattern(chord1);
            section1.addPattern(chord2);
            section1.addPattern(chord3);
            section1.addPattern(chord4);
        
            let chord1_2=new Pattern();
            chord1_2.addPattern(piano2,["A2","C3","E3","G#3","C4","E4","G#4","C5","E5"]);
            chord1_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
            chord1_2.addPattern(piano2,["A2","C3","E3","G#3","C4","E4","G#4","C5","E5"]);
            chord1_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
        
            let chord2_2=new Pattern();
            chord2_2.addPattern(piano2,["G2","C3","E3","G3","C4","E4","G4","C5","E5"]);
            chord2_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
            chord2_2.addPattern(piano2,["G2","C3","E3","G3","C4","E4","G4","C5","E5"]);
            chord2_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
        
            let chord3_2=new Pattern();
            chord3_2.addPattern(piano2,["F2","A2","C3","F3","A3","C4","E4","A4","C5"]);
            chord3_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
            chord3_2.addPattern(piano2,["F2","A2","C3","F3","A3","C4","E4","A4","C5"]);
            chord3_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
        
            let chord4_2=new Pattern();
            chord4_2.addPattern(piano2,["E2","G#2","B2","E3","G#3","B3","E4","G#4","B4"]);
            chord4_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
            chord4_2.addPattern(piano2,["E2","G#2","B2","E3","G#3","B3","E4","G#4","B4"]);
            chord4_2.addPattern(piano2,["0","0","0","0","0","0","0"]);
            let section2=new Pattern();
            section2.addPattern(chord1_2);
            section2.addPattern(chord2_2);
            section2.addPattern(chord3_2);
            section2.addPattern(chord4_2);
        
        
            track1.addPattern(section1);
            track1.addPattern(section1);
            track1.addPattern(section1);
            track1.addPattern(section1);
            track1.addPattern(section1);
        
            track1.addPattern(section2);
            track1.addPattern(section2);
            track1.addPattern(section2);
            track1.addPattern(section2);
            track1.addPattern(section2);
        }
        setTrack1();
        //#endregion
        
        //#region track2(main1)
        var setTrack2=()=>{
            let env2 = { attack: 0.01, decay: 0.005, hold: 0.1, release: 0.3 }
            let delay2 = { delayTime: 0.4, wet: 0.4, feedback: 0.5 }
            let piano2 = this.trigon.triangle({ env: env2, delay: delay2, volume: 0.4 })
        
            let piano3 = this.trigon.triangle({ 
                env: {attack: 0.01, decay: 0.005, hold: 0.1, release: 0.5}, 
                delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 }, 
                volume: 0.2 })
            var section1=new Pattern();
            section1.addPattern(piano2,["0/16","0/16","0/16","A4","B4","C5","D5"]);
            section1.addNote(piano2,"E5",14)
            section1.addNote(piano2,"D5");
            section1.addNote(piano2,"C5",14);
            section1.addNote(piano2,"B4");
            section1.addNote(piano2,"A4",15);
        
            section1.addPattern(piano2,["0/16","0/16","0/16","A4","B4","C5","D5"]);
            section1.addNote(piano2,"E5",14)
            section1.addNote(piano2,"D5");
            section1.addNote(piano2,"C5",14);
            section1.addNote(piano2,"A4");
            section1.addNote(piano2,"G#4",15);
        
            let section2=new Pattern();
            let chord1=new Pattern();
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"G#4+E4",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"G#4+E4",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"A4+E4",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"A4+E4",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"B4+E4",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"B4+E4",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"C5+E4",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"C5+E4",1)
        
            let chord2=new Pattern();
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"G#4+E4",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"G#4+E4",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"A4+E4",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"A4+E4",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"B4+E4",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"B4+E4",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"C5+E4",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"C5+E4",1)
        
            let chord2_2=new Pattern();
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"G4+E4",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"G4+E4",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"A4+E4",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"A4+E4",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"B4+E4",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"B4+E4",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"C5+E4",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"C5+E4",1)
        
            let chord3=new Pattern();
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"G#4+E4",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"G#4+E4",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"A4+E4",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"A4+E4",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"B4+E4",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"B4+E4",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"C5+E4",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"C5+E4",1)
        
            let chord4=new Pattern();
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"G#4+E4",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"G#4+E4",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"A4+E4",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"A4+E4",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"B4+E4",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"B4+E4",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"C5+E4",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"C5+E4",1)
        
            section2.addPattern(chord1);
            section2.addPattern(chord2);
            section2.addPattern(chord3);
            section2.addPattern(chord4);
            section2.addPattern(chord1);
            section2.addPattern(chord2_2);
            section2.addPattern(chord3);
            section2.addPattern(chord4);
        
            track2.addPattern(null,[],64);
            track2.addPattern(null,[],32);
            track2.addPattern(null,[],16);
            track2.addPattern(section1);
            track2.addPattern(section1);
            track2.addPattern(null,[],16);
            track2.addPattern(section2);
        }
        setTrack2();
        //#endregion
        
        //#region track2-2(main2)
        var setTrack2_2=()=>{
            let _tr=this.trigon.triangle({ 
                env: {attack: 0.01, decay: 0.005, hold: 0.1, release: 0.5}, 
                volume: 0.5 })
            let _saw=this.trigon.sawtooth({ 
                filter: { type: 'lowpass', frequency: 9500, q: 1 },
                env: {attack: 0.01, decay: 0.005, hold: 0.1, release: 0.5}, 
                volume: 0.2 })
            let piano = this.trigon.groupSource([_tr,_saw],{delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 }})
            track2_2.addPattern(null,[],128);
            track2_2.addPattern(null,[],128);
            track2_2.addPattern(null,[],128);
            track2_2.addPattern(null,[],128);
            track2_2.addPattern(null,[],126);
            track2_2.addPattern(piano,["A4/8"])
            track2_2.addPattern(piano,[
                "E5/8","0/8","0/8","0/8","0/8","0/8","0/8","0/4","D5/2","C5/2",
                "B4/8","0/8","0/8","0/8","0/8","A4/8","B4/8","0/4","C5",
                "E4/8","0/8","0/8","0/8","0/8","0/8","0/8","0/8",
                "0/8","0/8","0/8","0/8","0/8","0/8","0/8","A4/8",
                
                "E5/8","0/8","0/8","0/8","0/8","0/8","0/8","0/4","D5/2","C5/2",
                "B4/8","0/8","0/8","0/8","0/8","A4/8","B4/8","0/4","C5",
                "E4/8","0/8","0/8","0/8","0/8","0/8","0/8","0/8",
                "0/8","0/8","0/8","0/8","0/8","0/8","0/8","A4/8",
        
                "E5/8","0/8","0/8","0/8","0/8","0/8","0/8","0/4","D5/2","C5/2",
                "B4/8","0/8","0/8","0/8","0/8","A4/8","B4/8","0/4","C5",
                "E4/8","0/8","0/8","0/8","0/8","0/8","0/8","0/8",
                "0/8","0/8","0/8","0/8","0/8","0/8","0/8","A4/8",
        
                "E5/8","0/8","0/8","0/8","0/8","0/8","0/8","0/4","D5/2","C5/2",
                "B4/8","0/8","0/8","0/8","0/8","A4/8","B4/8","0/4","C5",
                "E4/8","0/8","0/8","0/8","0/8","0/8","0/8","0/8",
                "0/8","0/8","0/8","0/8","0/8","0/8","0/8","0/8"
            ]);
        
            let piano3=piano;
            let section2=new Pattern();
            let chord1=new Pattern();
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
            chord1.addNote(piano3,"A3",1)
            chord1.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
        
            let chord2=new Pattern();
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
            chord2.addNote(piano3,"G3",1)
            chord2.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
        
            let chord2_2=new Pattern();
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"G4[panning=.5]+E4[panning=-.5]",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"G4[panning=.5]+E4[panning=-.5]",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
            chord2_2.addNote(piano3,"G3",1)
            chord2_2.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
        
            let chord3=new Pattern();
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
            chord3.addNote(piano3,"F3",1)
            chord3.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
        
            let chord4=new Pattern();
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"G#4[panning=.5]+E4[panning=-.5]",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"A4[panning=.5]+E4[panning=-.5]",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"B4[panning=.5]+E4[panning=-.5]",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
            chord4.addNote(piano3,"E3",1)
            chord4.addNote(piano3,"C5[panning=.5]+E4[panning=-.5]",1)
        
            section2.addPattern(chord1);
            section2.addPattern(chord2);
            section2.addPattern(chord3);
            section2.addPattern(chord4);
            section2.addPattern(chord1);
            section2.addPattern(chord2_2);
            section2.addPattern(chord3);
            section2.addPattern(chord4);
            track2_2.addPattern(section2);
            track2_2.addPattern(chord1);
            track2_2.addPattern(chord2_2);
            track2_2.addPattern(chord3);
            track2_2.addPattern(chord4);
        }
        setTrack2_2();
        //#endregion
        
        //#region track3(bass)
        var setTrack3=()=>{
            track3.stopOnNext=true;
            let env = { attack: 0.01, decay: 0.03, hold: 2, release: 0.01 }
            let bass = this.trigon.triangle({ env: env, volume: 0.3 })
            let section1=new Pattern();
            section1.addNote(bass,"A1",7);
            section1.addNote(bass,"A1",7);
            section1.addNote(bass,"A1",7);
            section1.addNote(bass,"A1",7);
            section1.addNote(bass,"G1",7);
            section1.addNote(bass,"G1",7);
            section1.addNote(bass,"G1",7);
            section1.addNote(bass,"G1",7);
            section1.addNote(bass,"F1",7);
            section1.addNote(bass,"F1",7);
            section1.addNote(bass,"F1",7);
            section1.addNote(bass,"F1",7);
            section1.addNote(bass,"E1",7);
            section1.addNote(bass,"E1",7);
            section1.addNote(bass,"E1",7);
            section1.addNote(bass,"E1",7);
            track3.addPattern(null,[],128);
            track3.addPattern(null,[],128);
            track3.addPattern(section1);
            track3.addPattern(section1);
            track3.addPattern(null,[],128);
            track3.addPattern(null,[],128);
            track3.addPattern(section1);
            track3.addPattern(section1);
            track3.addPattern(section1);
        }
        setTrack3();
        //#endregion
        
        //#region track3_2(bass2)
        var setTrack3_2=()=>{
            track3_2.stopOnNext=true;
            let env = { attack: 0.01, decay: 0.03, hold: 2, release: 0 }
            let bass1 = this.trigon.sawtooth({ env: env, volume: 0.1,panning:0.5 })
            let bass2 = this.trigon.sawtooth({ env: env, volume: 0.1,detune:30,panning:-0.5 })
            let bass = this.trigon.groupSource([bass1,bass2],{volume:1,filter: { type: 'lowpass', frequency: 2000, q: 1 }})
            let section1=new Pattern();
            section1.addNote(bass,"A2",7);
            section1.addNote(bass,"A2",7);
            section1.addNote(bass,"A2",7);
            section1.addNote(bass,"A2",7);
            section1.addNote(bass,"G2",7);
            section1.addNote(bass,"G2",7);
            section1.addNote(bass,"G2",7);
            section1.addNote(bass,"G2",7);
            section1.addNote(bass,"F2",7);
            section1.addNote(bass,"F2",7);
            section1.addNote(bass,"F2",7);
            section1.addNote(bass,"F2",7);
            section1.addNote(bass,"E2",7);
            section1.addNote(bass,"E2",7);
            section1.addNote(bass,"E2",7);
            section1.addNote(bass,"E2",7);
            track3_2.addPattern(null,[],128*6);
            track3_2.addPattern(section1);
            track3_2.addPattern(section1);
            track3_2.addPattern(section1);
        }
        setTrack3_2();
        //#endregion
        
        //#region track4(drum)
        var setTrack4=()=>{
            let drum = this.trigon.baseDrum({volume:0.8});
            let pt1=new Pattern();
            pt1.addNote(drum,"kick+ohh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"snare+chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"kick+chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"kick+chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"snare+chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"chh3");
            pt1.addNote(drum,"chh3");
        
            let pt2=new Pattern();
            pt2.addNote(drum,"kick+chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"snare+chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"kick");
            pt2.addNote(drum,"snare+chh3");
            pt2.addNote(drum,"chh3");
            pt2.addNote(drum,"kick+chh3");
            pt2.addNote(drum,"chh3");
        
            let pt3=new Pattern();
            pt3.addNote(drum,"kick+ohh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"snare+chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"kick+chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"snare+chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
            pt3.addNote(drum,"chh3");
        
            let section1=new Pattern();
            section1.addPattern(pt1);
            section1.addPattern(pt2);
            section1.addPattern(pt3);
            section1.addPattern(pt1);
            track4.addPattern(null,[],128);
            track4.addPattern(null,[],128);
            track4.addPattern(null,[],128);
            track4.addPattern(null,[],128);
            track4.addPattern(null,[],128);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
            track4.addPattern(section1);
        }
        setTrack4();
        // this.trigon.setPitchShift(-999)
        //#endregion
        this.trigon.setCreate(()=>{
            this.trigon.addTrack(track1);
            this.trigon.addTrack(track2);
            this.trigon.addTrack(track2_2);
            this.trigon.addTrack(track3);
            this.trigon.addTrack(track3_2);
            this.trigon.addTrack(track4);
        });
    }
    customDom(dom){
        var img=document.createElement('img');
        img.setAttribute("src","./images/resserections.jpg");
        img.setAttribute("width","350px");
        dom.appendChild(img);
    }
}
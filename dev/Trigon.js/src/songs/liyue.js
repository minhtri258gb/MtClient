`
liyue - HoyoMix
code:Lenshang
2020-09-25
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';

export default class{
    constructor(){
        this.trigon = new Trigon();
        this.trigon.speed=1;
        this.trigon.setBpm(100);
        this.track1=new Pattern("track1",4);
        this.track2=new Pattern("track2",4);
        this.track3=new Pattern("track3",4);

    }
    setTrack1(){
        let env = { attack: 0, decay: 0.01, hold: 0.2, release: 0.3 }
        let delay = { delayTime: 0.8, wet: 0.25, feedback: 0.2 }
        let piano = this.trigon.triangle({env: env, delay: delay, volume: 0.5 })
        let piano2 = this.trigon.triangle({env: { attack: .1, decay: 0.01, hold: 0.5, release: 0.5 }, delay: { delayTime: 0.8, wet: 0.15, feedback: 0.05 }, volume: 0.4 })
        let section1=new Pattern();
        
        section1.addPattern(piano,["F5","G5","A5","C6"])
        section1.addEvent(e=>{
            this.trigon.setBpm(98);
        })
        section1.addPattern(piano,["F5[volume=.25]/1","A5[volume=.3]/1","D6[volume=.4]/6","D6/8","D6/8","D6","E6","D6"]);
        section1.addPattern(null,[],2);
        section1.addNote(piano,"0/2");
        section1.addPattern(piano,[
            "D6/1[volume=.25]","E6/1[volume=.25]","D6[volume=.25]",
            "C6","C6","A5","C6/8","C6/8","C6/8",
            "C6","D6","A5","0","0","0/2",
            "A5/1","G5/1","F5","G5","A5","C6","A5","G5","G5","0",
            "F5","G5","A5","C6","A5","G5","0","0",
            "F5","C#5","F5","A5","A5","0","0","0","0","0","0","0",
            "0","0","0","0"
        ]);
        this.track1.addPattern(section1);

        let section2=new Pattern();
        section2.stopOnNext=true;
        section2.addPattern(piano2,["F5","G5","A5","C6"])
        section2.addPattern(piano2,["F5[volume=.25]/1","A5[volume=.3]/1","D6[volume=.4]/6","D6/8","D6/8","D6","E6","D6"]);
        section2.addPattern(null,[],2);
        section2.addNote(piano2,"0/2");
        section2.addPattern(piano2,[
            "D6/1[volume=.25]","E6/1[volume=.25]","D6[volume=.25]",
            "C6","C6","A5","C6/8","C6/8","C6/8",
            "C6","D6","A5","0","0","0/2",
            "A5/1","G5/1","F5","G5","A5","C6","A5","G5","G5","0",
            "F5","G5","A5","C6","A5","G5","0","0",
            "F5","C#5","F5","G5","F5","0","0","0","0","0","0","0",
            "0","0","0","0"
        ]);
        this.track1.addPattern(section2);
        
    }

    setTrack2(){
        let env = { attack: 0, decay: 0.01, hold: .5, release: 1 }
        let delay = { delayTime: 0.8, wet: 0.25, feedback: 0.2 }
        let piano = this.trigon.triangle({env: env, delay: delay, volume: 0.5 })
        let piano2 = this.trigon.triangle({env: { attack: 0, decay: 0.01, hold: .3, release: .8 }, delay: delay, volume: 0.3 })
        let section1=new Pattern();
        section1.addPattern(piano,["0","0","0","0"]);
        section1.addPattern(piano,["A#3/32","A#3/32","A3/32","D4/16","C4/16","B3/32","B3/32"])
        section1.addPattern(piano2,["F3","C4","F4+D4","0","0","0","0","0"])
        section1.addPattern(piano2,["C3","G3","G4+D4","0","0","0","0","0"])
        section1.addPattern(piano,["A#3/32","A#3/32","A3/32","D4/16","C4/16","B3/32","B3/32"])
        section1.addPattern(piano2,["F3","C4","F4+D4","0","0","0","0","0"])
        section1.addPattern(piano2,["F3","C4","F4+D4","0","0","0","0","0"])
        // section1.addPattern(piano2,["C3","G3","G4+D4","0","0","0","0","0"])
        this.track2.addPattern(section1);
    }

    setTrack3(){
        let env = { attack: 0, decay: 0.01, hold: 0.2, release: 0.3 }
        let delay = { delayTime: 0.8, wet: 0.15, feedback: 0.2 }
        let piano = this.trigon.square({filter: { type: 'lowpass', frequency: 9500, q: 1 },env: env, delay: delay, volume: 0.1 })
        let section1=new Pattern();

        let chord1=new Pattern();
        chord1.addPattern(piano,["D5[panning]/2","A4/2","G4/2","F4/2","D4/2","F4/2","G4/2","A4/2"])
        chord1.addPattern(piano,["D5/2","A4/2","G4/2","F4/2","D4/2","F4/2","G4/2","A4/2"])
        chord1.addPattern(piano,["D5/2","A4/2","G4/2","F4/2","D4/2","E4/2","G4/2","A4/2"])
        chord1.addPattern(piano,["D5/2","A4/2","G4/2","E4/2","C5/2","A4/2","G4/2","E4/2"])
        chord1.addPattern(piano,["C5/2","A4/2","G4/2","E4/2","C4/2","E4/2","G4/2","A4/2"])
        chord1.addPattern(piano,["C5/2","A4/2","G4/2","E4/2","C4/2","E4/2","G4/2","A4/2"])
        chord1.addPattern(piano,["C4/2","E4/2","G4/2","F5/2","A5/2","D6/2","F6/2","A6/2","D7","0","0","0"])
        section1.addPattern(chord1);


        this.track3.addPattern(section1,null,68);
    }
    create(){
        this.setTrack1();
        this.setTrack2();
        this.setTrack3();
        // this.track1.pitchShift=-12;
        // this.track2.pitchShift=-12;
        // this.track3.pitchShift=-12;
        this.trigon.setCreate(()=>{
            this.trigon.addTrack(this.track1);
            this.trigon.addTrack(this.track2);
            this.trigon.addTrack(this.track3);
        });
    }
}
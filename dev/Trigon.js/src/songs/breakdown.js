`
MetalCore BreakDown
code:连殇
2020-12-02
`

import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';
export default class {
    constructor() {
        this.trigon = new Trigon();
        this.trigon.speed = 1;
        this.trigon.setBpm(120);
        this.track1 = new Pattern("track1", 4);
        this.track2 = new Pattern("track2", 4);
        this.track3 = new Pattern("track3", 4);
        this.track4 = new Pattern("track4", 4);

        this.track_drum=new Pattern("track_drum",4);
        this.track_bass=new Pattern("track_bass",4);
        this.track_vocal = new Pattern("track_vocal", 4);

        this.track_debug = new Pattern("debug", 4);
        this.track_debug.stopOnNext = true;
        this.track_debug2 = new Pattern("debug2", 4);
        this.track_debug2.stopOnNext = true;
    }
    set_track1(){
        this.track1.stopOnNext=true;
        let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.4 }
        let delay = { delayTime: 0.5, wet: 0.25, feedback: 0.25 }
        let piano = this.trigon.square({ filter: { type: 'lowpass', frequency: 1500, q: 1 }, env: env, delay: delay, volume: 0.5 })
        let pre=new Pattern("",2);
        pre.addPattern(piano,[
            "-","-","-","-","-","-","-","-",
        ])
        let section1=new Pattern("",2);
        section1.addPattern(piano,[
            "B4","-","-","-","C5","-","-","-",
            "F#4","-","-","-","G4","-","-","-",
            "B4","-","-","-","C5","-","-","-",
            "F#4","-","-","-","G4","-","-","-",
        ])

        let section2=new Pattern("",2);
        section2.addPattern(piano,[
            "G#4","-","-","-","A#4","-","-","-",
            "F4","-","-","-","G4","-","-","-",
            "G#4","-","-","-","A#4","-","-","-",
            "F4","-","-","-","G4","-","-","-",
        ])

        let section3=new Pattern("",2);
        section3.addPattern(piano,[
            "C6","-","-","-","C6","-","-","-",
            "B5","-","-","-","B5","-","-","-",
            "G#5","-","-","-","G#5","-","-","-",
            "G5","-","-","-","G5","-","-","-",
        ])
        this.track1.addPattern(pre);
        this.track1.addPattern(section1);
        this.track1.addPattern(section1);
        this.track1.addPattern(section2);
        this.track1.addPattern(section1);
        this.track1.addPattern(section3);
        this.track1.addPattern(section3);
        this.track1.addPattern(section1,null,16);
    }
    set_track_drum(){
        this.track_drum.stopOnNext=true;
        let pre=new Pattern("",2);
        let section1=new Pattern("",2);
        let drum=this.trigon.metalCoreDrum({ volume: 0.8 });
        pre.addPattern(drum,[
            "crash","-","crash","-","crash","-","crash","-",
        ])
        section1.addPattern(drum,[
            "crash2+kick","kick","-","-","crash+snare","kick","-","kick",
            "crash","kick","kick","-","crash+snare","-","-","kick",
            "crash+kick","kick","-","-","crash+snare","kick","-","kick",
            "crash","kick","kick","-","crash+snare","-","-","kick",
        ])

        let section2=new Pattern("",2);
        section2.addPattern(drum,[
            "crash2+kick","-","kick","-","crash+snare","kick","kick","-",
            "crash","kick","kick","kick","crash+snare","-","kick","-",
            "crash","-","-","kick","crash+snare","-","kick","kick",
            "crash+kick","kick","-","-","crash+snare/1","snare/1","-","kick","snare/1","snare/1",
        ])

        let section3=new Pattern("",1);
        section3.addPattern(drum,[
            "kick","kick","kick","-","kick+hihat","kick","-","kick",
            "kick+hihat+snare","kick","-","kick","kick+hihat","-","kick","-",

            "kick+crash2","kick","kick","-","kick+hihat","kick","-","kick",
            "kick+hihat+snare","kick","-","kick","kick+hihat","-","kick","-",

            "kick+crash2","kick","kick","-","kick+hihat","kick","-","kick",
            "kick+hihat+snare","kick","-","kick","kick+hihat","-","kick","-",

            "kick+crash2","kick","kick","-","kick+hihat","kick","-","kick",
            "kick+hihat+snare","kick","-","kick","kick+hihat","-","kick","-",
        ]);
        this.track_drum.addPattern(pre);
        this.track_drum.addPattern(section1);
        this.track_drum.addPattern(section1);
        this.track_drum.addPattern(section2);
        this.track_drum.addPattern(section1);
        this.track_drum.addPattern(section3);
        this.track_drum.addPattern(section3);
        this.track_drum.addPattern(section3);
        this.track_drum.addPattern(section1);
        //this.track_debug.addPattern(section3)
    }
    create(){
        this.set_track1();
        this.set_track_drum();
        this.trigon.setCreate(()=>{
            if (this.track_debug.data.length > 0) {
                this.trigon.addTrack(this.track_debug);
                this.trigon.addTrack(this.track_debug2);
            }
            else {
                this.trigon.addTrack(this.track1);
                this.trigon.addTrack(this.track2);
                this.trigon.addTrack(this.track3);
                this.trigon.addTrack(this.track4);
                this.trigon.addTrack(this.track_vocal);
                this.trigon.addTrack(this.track_drum);
                this.trigon.addTrack(this.track_bass);
            }
        });
    }
}
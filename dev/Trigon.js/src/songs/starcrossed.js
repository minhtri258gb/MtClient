`
Starcrossed(8BIT)(TsuBaKi) - 连殇 ft. 贼恩
code:连殇
2020-11-23
`

import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';
export default class {
    constructor() {
        this.trigon = new Trigon();
        this.trigon.speed = 1;
        this.trigon.setBpm(140);
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
    setTrack1(){
        this.track1.stopOnNext=true;
        let env = { attack: 0.01, decay: 0.03, hold: 0.1, release: 0.2 }
        let delay = { delayTime: 0.5, wet: 0.25, feedback: 0.25 }
        let piano = this.trigon.square({ filter: { type: 'lowpass', frequency: 1500, q: 1 }, env: env, delay: delay, volume: 0.15 })
        let piano_no_delay = this.trigon.square({ filter: { type: 'lowpass', frequency: 1500, q: 1 }, env: env, volume: 0.15 })
        let piano2 = this.trigon.square({ env: { attack: 0.01, decay: 0.05, hold: 0.2, release: 0.01 }, delay: delay, volume: 0.15 })
        let section_pre=new Pattern("",2);
        section_pre.addPattern(piano,[
            "G#4+G#6[panning=-.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+F#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+C#6[panning=-.5]","C#5","D#5","F#5",
            "G#4+D#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4+G#5","D#5","C#5","B4",

            "G#4+G#6[panning=-.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+F#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+A#6[panning=-.5]","C#5","D#5","F#5",
            "G#4+B6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+D#6[panning=-.5]","C#5","D#5+A#6[panning=.5]","F#5","D#5","C#5",
            "G#4+F#6[panning=-.5]","D#5","C#5","B4",

            "G#4+G#6[panning=-.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+F#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+C#6[panning=-.5]","C#5","D#5","F#5",
            "G#4+D#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4+G#5","D#5","C#5","B4",

            "G#4+G#6[panning=-.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+F#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+A#6[panning=-.5]","C#5","D#5","F#5",
            "G#4+B6[panning=.5]","C#5","D#5","F#5","D#5+C#7[panning=-.5]","C#5",
            "G#4+B6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
        ]);
        section_pre.addPattern(piano_no_delay,["G#4","D#5","C#5","B4"]);
        this.track1.addPattern(section_pre);

        let section1=new Pattern("",2);
        section1.addPattern(piano2,[
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","D#5","C#5","B4",

            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","D#5","C#5","B4",

            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","D#5","C#5","B4",

            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","D#5","C#5","B4",
        ])
        //this.track_debug.addPattern(section2);
        this.track1.addPattern(section1);

        let section1t2=new Pattern("",2);
        section1t2.addPattern(piano,[
            "G#4+G#6[panning=-.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+F#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4+C#6[panning=-.5]","C#5","D#5","F#5",
            "G#4+D#6[panning=.5]","C#5","D#5","F#5","D#5","C#5",
            "G#4","C#5","D#5","F#5","D#5","C#5",
            "G#4","D#5","C#5","B4",
        ]);
        this.track1.addPattern(section1t2);

        this.track1.addPattern(null,[],32*4);

        //this.track1.addPattern(section1);
    }
    setTrack2(){
        this.track2.stopOnNext=true;
        let viola_filter = this.trigon.groupSource([
            this.trigon.sawtooth({
                env: { attack: 0.1, decay: 0.005, hold: 3, release: 0.2 },
                volume: 0.1,
                panning: 0.8
            }),
            this.trigon.sawtooth({
                //filter: { type: 'lowpass', frequency: 9500, q: 1 },
                env: { attack: 0.1, decay: 0.005, hold: 3, release: 0.2 },
                volume: 0.1,
                detune: 20,
                panning: -0.8
            })
        ], {filter: { type: 'lowpass', frequency: 1500, q: 1 }, delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 } })
        
        let viola = this.trigon.groupSource([
            this.trigon.sawtooth({
                env: { attack: 0.01, decay: 0.005, hold: 3, release: 0.2 },
                volume: 0.1,
                panning: 0.8
            }),
            this.trigon.sawtooth({
                //filter: { type: 'lowpass', frequency: 9500, q: 1 },
                env: { attack: 0.01, decay: 0.005, hold: 3, release: 0.2 },
                volume: 0.1,
                detune: 20,
                panning: -0.8
            })
        ], { delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 } })

        let viola2 = this.trigon.sine({ env: { attack: 0.01, decay: 0.05, hold: 3, release: 0.01 },panning:-.3, delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 }, volume: 0.2 })
        let section_pre=new Pattern("",4);
        section_pre.addPattern(viola_filter,[
            "B3+G#2","-","-","-","-","-","-","-",
            "A#3+F#2","-","-","-","-","-","-","-",
            "G#3+E2","-","-","-","-","-","-","-",
            "A#3+F#2","-","-","-","-","-","M","M",
        ],32)
        
        let section1=new Pattern("",4);
        section1.addPattern(viola,[
            "D#5","-","-","-","-","-","B4","-",
            "A#4","-","-","-","-","-","G#4","-",
            "D#5","-","-","-","-","-","B4","-",
            "A#4","-","-","-","-","-","G#4","-",

            "D#5","-","-","-","-","-","B4","-",
            "A#4","-","-","-","-","-","G#4","-",
            "D#5","-","-","-","-","-","B4","-",
            "A#4","-","-","-","-","-","G#4","-",
        ]);
        //this.track_debug.addPattern(section2);
        this.track2.addPattern(section_pre);
        this.track2.addPattern(section1);

        let section1t2=new Pattern("",4);
        section1t2.addPattern(viola,[
            "M","M","M","M",
            "M","M","M","M",
            "M","M","M","M",
            "M","M","M","M"
        ]);
        this.track2.addPattern(section1t2);

        let section2=new Pattern("",4);
        section2.addPattern(viola2,[
            "G#5","-","-","F#5","-","-","C#5","-",
            "D#5","-","-","-","-","-","G#4","-",

            "G#5","-","-","F#5","-","-","A#5","-",
            "B5","-","-","D#5","A#5","-","F#5","-",

            "G#5","-","-","F#5","-","-","C#5","-",
            "D#5","-","-","-","-","-","G#4","-",

            "G#5","-","-","F#5","-","-","A#5","-",
            "B5","-","C#6","B5","-","A#5","-","M",

            "G#5","-","-","F#5","-","-","C#5","-",
            "D#5","-","-","-","-","-","G#4","-",

            "G#5","-","-","F#5","-","-","A#5","-",
            "B5","-","-","D#5","A#5","-","F#5","-",

            "G#5","-","-","F#5","-","-","C#5","-",
            "D#5","-","-","-","-","-","G#4","-",

            "G#5","-","-","F#5","-","-","A#5","-",
            "B5","-","C#6","B5","-","A#5","-","M"
        ])
        this.track2.addPattern(section2);

        this.track2.addPattern(section1);
    }
    setTrack3(){
        let env = { attack: 0, decay: 0.01, hold: 0.1, release: 0.3 }
        let delay = { delayTime: 0.4, wet: 0.1, feedback: 0.2 }
        let piano_1 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, panning: 0.8 });
        let piano_2 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, detune: 20, panning: -0.8 })
        let piano = this.trigon.groupSource([piano_1, piano_2], { volume: .5 })
        let section1=new Pattern("",2);
        section1.addPattern(piano,[
            "B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3",
            "-","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3",

            "A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3",
            "-","A#3+F#3","-","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3",

            "G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3",
            "-","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3",

            "G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3",
            "A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3",

            //=====
            "B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3",
            "-","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3","B3+G#3",

            "A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3",
            "-","A#3+F#3","-","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3",

            "G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3",
            "-","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3","G#3+E3",

            "G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3","G#3+F#3",
            "A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3","A#3+F#3",
        ]);
        this.track3.addPattern(null,[],32*2);
        this.track3.addPattern(section1);

        let section1t2=new Pattern("",4);
        section1t2.addPattern(piano,[
            "M","M","M","M",
            "M","M","M","M",
            "M","M","M","M",
            "M","M","M","M"
        ]);
        this.track3.addPattern(section1t2);

        let section2=new Pattern("",2);
        section2.addPattern(piano,[
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4","B4",

            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4","-",

            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4","A#4",

            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4","-",

            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4","B4",

            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4","-",

            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4","A#4",

            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4","-",
        ])
        section2.addPattern(piano,[
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4","B4",

            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4","B4",

            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4","A#4",

            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4","A#4",

            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4",
            "D#5","B4","G#4","B4",

            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4",
            "F#5","B4","G#4","B4",

            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4",
            "C#5","A#4","F#4","A#4",

            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4",
            "D#5","A#4","F#4","A#4",
        ])
        this.track3.addPattern(section2);
        this.track3.addPattern(section1);
    }
    setTrack4(){

    }
    set_track_drum(){
        //===============================================
        let drum = this.trigon.baseDrum({ volume: 0.8 });
        let section1 = new Pattern("", 2);
        let pt1 = new Pattern("dr", 2);
        pt1.addPattern(drum, [
            "kick+ohh3", "kick", "kick+ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick",
            "ohh", "kick", "kick+ohh", "kick/1","kick/1", "kick+ohh+snare", "kick", "kick+ohh", "kick",

            "kick+ohh3", "kick", "ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick",
            "ohh", "kick", "ohh", "kick", "kick+ohh+snare", "kick", "kick+ohh", "kick",

            "kick+ohh3", "kick", "kick+ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick",
            "ohh", "kick", "kick+ohh", "kick/1","kick/1", "kick+ohh+snare", "kick", "kick+ohh", "kick",

            "kick+ohh3", "kick", "ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick",
            "ohh", "kick", "ohh", "kick", "kick+ohh+snare", "kick", "kick+ohh+snare", "kick+snare/1","snare/1"
        ]);
        let pt2 = new Pattern("dr", 2);
        pt2.addPattern(drum, [
            "kick+ohh3", "kick", "kick+ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh+snare", "kick",
            "ohh", "kick", "kick+ohh", "kick/1","kick/1", "kick+ohh+snare", "kick", "kick+ohh", "kick",

            "kick+ohh3", "kick", "ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick+snare",
            "ohh", "kick", "ohh", "kick", "kick+ohh+snare", "kick", "kick+ohh+snare", "kick+snare",

            "kick+ohh3", "kick", "kick+ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick+snare",
            "ohh", "kick", "kick+ohh", "kick/1","kick/1", "kick+ohh+snare", "kick", "kick+ohh", "kick",

            "kick+ohh3", "kick+snare", "ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick+snare",
            "ohh", "kick+snare", "ohh", "kick", "kick+ohh+snare", "kick", "kick+ohh+snare", "kick+snare"
        ]);

        // let pt3 = new Pattern("dr", 2);
        // pt3.addPattern(drum, [
        //     "kick+ohh3", "kick", "kick+ohh", "kick", "kick+ohh+snare", "kick+", "kick+ohh", "kick",
        //     "ohh", "kick", "kick+ohh", "kick/1","kick/1", "kick+ohh+snare", "kick", "kick+ohh", "kick",
        // ]);

        section1.addPattern(pt1);
        section1.addPattern(pt2);

        this.track_drum.addPattern(null,[],32*2);
        this.track_drum.addPattern(section1);
        //===============================================
        let section1t2=new Pattern("",2);
        section1t2.addPattern(drum,[
            "ohh3","-","-","-","-","-","-","-",
            "-","-","-","-","-","-","-","-",

            "-","-","-","-","-","-","-","-",
            "-","-","-","kick/1","kick/1","snare","kick/1","kick/1","snare","kick/1","snare/1"
        ]);
        this.track_drum.addPattern(section1t2);

        let section2=new Pattern("",2);
        section2.addPattern(drum,[
            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","kick","chh","","chh+snare","","chh","",

            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","snare","chh","kick","chh+snare","","chh+snare","snare",

            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","kick","chh","","chh+snare","","chh","",

            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","snare","chh","kick","chh+snare","","chh+snare","snare",
            //==========
            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","kick","chh","","chh+snare","","chh","",

            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","snare","chh","kick","chh+snare","","chh+snare","snare",

            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","kick","chh","","chh+snare","","chh","",

            "ohh+kick","kick","chh","","chh+snare","","chh+kick","kick",
            "chh","","chh","","chh+snare","kick","chh","kick",
            "ohh+kick","kick","chh","","chh+snare","","chh","kick",
            "chh+kick","snare","chh","kick","chh+snare","","chh+snare","snare",
        ]);
        this.track_drum.addPattern(section2);
        this.track_drum.addPattern(section1);
        //this.track_debug2.addPattern(section1);
    }
    set_track_bass(){
        this.track_bass.stopOnNext = true;
        let env = { attack: 0.01, decay: 0.03, hold: 2, release: 0.01 }
        let bass = this.trigon.triangle({ env: env, volume: 0.4 })
        let section1=new Pattern("",2)
        section1.addPattern(bass,[
            "G#2","G#2","G#2","G#2","G#2","G#2","G#2","G#2",
            "M","G#2","G#2","G#2","G#2","G#2","G#2","G#2",
            "F#2","F#2","-","F#2","F#2","F#2","F#2","F#2",
            "-","F#2","-","F#2","F#2","F#2","F#2","F#2",
            "E2","E2","E2","E2","E2","E2","E2","E2",
            "M","E2","E2","E2","E2","E2","E2","E2",
            "F#2","F#2","-","F#2","F#2","F#2","F#2","F#2",
            "-","F#2","-","F#2","F#2","F#2","F#2","F#2",

            "G#2","G#2","G#2","G#2","G#2","G#2","G#2","G#2",
            "M","G#2","G#2","G#2","G#2","G#2","G#2","G#2",
            "F#2","F#2","-","F#2","F#2","F#2","F#2","F#2",
            "-","F#2","-","F#2","F#2","F#2","F#2","F#2",
            "E2","E2","E2","E2","E2","E2","E2","E2",
            "M","E2","E2","E2","E2","E2","E2","E2",
            "F#2","F#2","-","F#2","F#2","F#2","F#2","F#2",
            "-","F#2","-","F#2","F#2","F#2","F#2","F#2",
        ])
        this.track_bass.addPattern(null,[],32*2);
        this.track_bass.addPattern(section1);
        let section1t2=new Pattern("",4);
        section1t2.addPattern(bass,[
            "M","M","M","M",
            "M","M","M","M",
            "M","M","M","M",
            "M","M","M","M"
        ]);
        this.track_bass.addPattern(section1t2);

        let section2=new Pattern("",2);
        section2.addPattern(bass,[
            "G#2","G#2","-","-","M","-","-","G#2",
            "-","-","-","-","M","-","-","G#2",
            "G#2","G#2","-","-","M","-","-","G#2",
            "G#2","G#2","-","-","M","-","-","-",

            "F#2","F#2","-","-","M","-","-","F#2",
            "-","-","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","-",

            "E2","E2","-","-","M","-","-","E2",
            "-","-","-","-","M","-","-","E2",
            "E2","E2","-","-","M","-","-","E2",
            "E2","E2","-","-","M","-","-","-",

            "F#2","F#2","-","-","M","-","-","F#2",
            "-","-","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","-",

            //======
            "G#2","G#2","-","-","M","-","-","G#2",
            "-","-","-","-","M","-","-","G#2",
            "G#2","G#2","-","-","M","-","-","G#2",
            "G#2","G#2","-","-","M","-","-","-",

            "F#2","F#2","-","-","M","-","-","F#2",
            "-","-","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","-",

            "E2","E2","-","-","M","-","-","E2",
            "-","-","-","-","M","-","-","E2",
            "E2","E2","-","-","M","-","-","E2",
            "E2","E2","-","-","M","-","-","-",

            "F#2","F#2","-","-","M","-","-","F#2",
            "-","-","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","F#2",
            "F#2","F#2","-","-","M","-","-","-",
        ]);
        this.track_bass.addPattern(section2);
        this.track_bass.addPattern(section1);
    }
    set_track_vocal(){
        this.track_vocal.stopOnNext = true;
        let piano_1 = this.trigon.triangle({ env: { attack: .01, decay: 0.01, hold: 1.5, release: 0.1 }, delay: { delayTime: 0.8, wet: 0.15, feedback: 0.05 }, volume: 0.4 })
        let piano_2 = this.trigon.square({ env: { attack: .01, decay: 0.01, hold: 1.5, release: 0.1 }, delay: { delayTime: 0.8, wet: 0.15, feedback: 0.05 }, volume: 0.2 })
        let piano = this.trigon.groupSource([piano_1, piano_2], { volume: .8 })

        let pre_section=new Pattern("",2);
        pre_section.addPattern(piano,[
            "-","-","-","-","-","-","-","-",
            "-","-","-","-","-","-","-","-",
            "-","-","-","-","-","-","-","-",
            "-","-","-","-","-","-","G#3","-",
        ]);
        let section1 = new Pattern("s1", 2);

        section1.addPattern(piano,[
            "B3","-","-","C#4","-","-","D#4","-",
            "-","G#3","-","-","-","-","G#3","-",
            "G#4","-","-","F#4","-","-","D#4","-","-","C#4","-","-","D#4","-","F#4","-",

            "B3","-","-","C#4","-","-","D#4","-",
            "-","G#3","-","-","-","-","D#4","-",
            "B4","-","B4","-","A#4","-","A#4","-","G#4","-","G#4",,"-","F#4","-","F#4","-",

            "B3","-","-","C#4","-","-","D#4","-",
            "-","G#3","-","-","-","-","G#3","-",
            "G#4","-","-","F#4","-","-","D#4","-","C#4","-","-","B3","-","-","A#3","-",

            "G#3","-","-","C#4","-","-","D#4","-",
            "-","F#4","-","-","G#4","-","-","-",

            "-","-","G#3","-","G#3","-","F#3","-","G#3","-","-","B3","-","-","D#4","-"
        ]);
        let pt2 = new Pattern("s1", 2);
        pt2.addPattern(piano,[
            "G#4","-","-","B3","-","-","G#3","-",
            "G#4","-","-","-","G#3","-","B4","-",
            "-","-","C#4","-","A#4","-","D#4","-",
            "G#4","-","B3","-","A#3","-","F#4","-",

            "G#4","-","-","B3","-","-","A#3","-",
            "G#4","-","-","-","G#3","-","B4","-",
            "-","-","D#4","-","C#5","-","A#4","-",
            "B4","-","G#4","-","A#4","-","F#4","-",

            "G#4","-","-","B3","-","-","G#3","-",
            "G#4","-","-","-","G#3","-","B4","-",
            "-","-","C#4","-","A#4","-","D#4","-",
            "G#4","-","B3","-","A#3","-","F#4","-",

            "G#4","-","-","B3","-","-","A#3","-",
            "G#4","-","-","-","G#3","-","B4","-",
            "-","-","D#4","-","C#5","-","A#4","-",
            "B4","-","G#4","-","A#4","-","F#4","-",
        ]);
        section1.addPattern(pt2);
        this.track_vocal.addPattern(null,[],32*2);
        this.track_vocal.addPattern(null,[],32*2);
        this.track_vocal.addPattern(pre_section);
        this.track_vocal.addPattern(section1);

        let section2=new Pattern("",2);
        section2.addPattern(piano,[
            "B4","-","-","G#4","-","-","D#5","-",
            "-","-","G#4","-","D#4","-","G#4","-",
            "A#4","-","-","B4","-","-","D#5","-",
            "F#5","-","-","-","A#4","-","-","-",

            "B4","-","-","G#4","-","-","D#5","-",
            "-","-","G#4","-","D#4","-","G#4","-",
            "A#4","-","-","-","C#5","-","-","-",
            "B4","-","-","-","A#4","-","F#4","-",

            "D#4","-","-","-","G#4","-","-","-",
            "A#4","-","G#4","-","D#4","-","G#4","-",
            "A#4","-","-","-","-","-","B4","-",
            "B4","-","-","-","G#4","-","-","-",

            "D#5","-","-","-","-","-","-","-",
            "-","-","-","-","G#4","-","-","-",
            "D#5","-","-","-","-","-","F#5","-",
            "-","-","-","-","-","-","-","M",
        ]);
        this.track_vocal.addPattern(section2);
        //this.track_debug.addPattern(section2)
    }
    create() {
        this.setTrack1();
        this.setTrack2();
        this.setTrack3();
        this.setTrack4();
        this.set_track_vocal();
        this.set_track_drum();
        this.set_track_bass();
        this.trigon.setCreate(() => {
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
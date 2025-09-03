`
XiaoYeZi - みきとP
code:Lenshang
2020-11-03
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';

export default class {
    constructor() {
        this.trigon = new Trigon();
        this.trigon.speed = 1;
        this.trigon.setBpm(130);
        this.track1 = new Pattern("track1", 4);
        this.track2 = new Pattern("track2", 4);
        this.track3 = new Pattern("track3", 4);
        this.track4 = new Pattern("track4", 4);
        this.track_vocal = new Pattern("track_vocal", 4);

        this.track_debug = new Pattern("debug", 4);
        this.track_debug.stopOnNext = true;
    }
    setTrack1() {
        let env = { attack: 0, decay: 0.01, hold: 0.1, release: 0.2 }
        let delay = { delayTime: 0.4, wet: 0.1, feedback: 0.2 }
        let piano_1 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, panning: 0.8 });
        let piano_2 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, detune: 20, panning: -0.8 })
        let piano = this.trigon.groupSource([piano_1, piano_2], { volume: .5 })
        let pre = new Pattern("s1", 2);
        pre.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);
        pre.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);

        let section1 = new Pattern("s1", 2);
        section1.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);
        section1.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);
        section1.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);
        section1.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);

        let section2=new Pattern("s1", 2);
        section2.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);
        section2.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);
        section2.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);
        section2.addPattern(piano, ["G#3+G4", "G#3", "G#3+G4", "G#3+G4", "A#3+F4", "A#3+F4", "A#3+F4", "C4+G4", "C4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4", "C4+G4"]);

        section2.addPattern(piano, ["G#3", "G#3", "G#3", "G#3", "A#3", "A#3", "A#3", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]);
        section2.addPattern(piano, ["G#3", "G#3", "G#3", "G#3", "A#3", "A#3", "A#3", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]);
        section2.addPattern(piano, ["G#3", "G#3", "G#3", "G#3", "A#3", "A#3", "A#3", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]);
        section2.addPattern(piano, ["G#3", "G#3", "G#3", "G#3", "A#3", "A#3", "A#3", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]);

        let section3 = new Pattern("s2", 2);
        section3.addPattern(piano, ["G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3"]);
        section3.addPattern(piano, ["C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]);
        section3.addPattern(piano, ["F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3"]);
        section3.addPattern(piano, ["C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]);

        section3.addPattern(piano, ["G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3"]);
        section3.addPattern(piano, ["C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4", "C4"]);
        section3.addPattern(piano, ["F3", "F3", "F3", "F3", "F3", "F3", "F3", "F3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3", "G#3"]);
        //this.track_debug.addPattern(section2);

        this.track1.addPattern(pre);
        this.track1.addPattern(section1);
        this.track1.addPattern(section2);
        this.track1.addPattern(section3);
        this.track1.addPattern(section1);
    }
    setTrack2() {
        this.track2.stopOnNext = true;

        let _tr = this.trigon.square({
            env: { attack: 0.01, decay: 0.005, hold: 0.4, release: 0.2 },
            volume: 0.2
        })
        let _saw = this.trigon.triangle({
            //filter: { type: 'lowpass', frequency: 9500, q: 1 },
            env: { attack: 0.01, decay: 0.005, hold: 0.4, release: 0.2 },
            volume: 0.2,
            detune: 1200
        })
        let piano = this.trigon.groupSource([_tr, _saw], { delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 } })
        let piano2 = this.trigon.groupSource([
            this.trigon.sawtooth({
                env: { attack: 0.01, decay: 0.005, hold: 3, release: 0.2 },
                volume: 0.15,
                panning: 0.8
            }),
            this.trigon.sawtooth({
                //filter: { type: 'lowpass', frequency: 9500, q: 1 },
                env: { attack: 0.01, decay: 0.005, hold: 3, release: 0.2 },
                volume: 0.15,
                detune: 20,
                panning: -0.8
            })
        ], { delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 } })
        
        let section1 = new Pattern("s1", 2);
        section1.addPattern(piano, [
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-"
        ]);
        section1.addPattern(piano, [
            "G5", "-", "G5", "-", "G5", "-", "G5", "-",
            "G5", "-", "G5", "-", "G5", "-", "G5", "-"
        ]);

        let section2 = new Pattern("s1", 2);
        section2.addPattern(piano, [
            "A#4", "C5", "C5", "A#4", "C5", "D#5", "A#4", "C5",
            "-", "A#4", "C5", "D#5", "-", "C5", "-", "A#4",
            "A#4", "C5", "C5", "A#4", "C5", "D#5", "A#4", "C5",
            "-", "A#4", "C5", "D#5", "-", "C5", "-", "A#4",
            "A#4", "C5", "C5", "A#4", "C5", "D#5", "A#4", "C5",
            "-", "A#4", "C5", "D#5", "-", "C5", "-", "A#4",
            "A#4", "C5", "C5", "A#4", "C5", "D#5", "A#4", "C5",
            "-", "C5", "C5", "C5", "C5", "C5", "C5", "C5",
        ]);

        let empty = new Pattern("", 2);
        empty.addPattern(piano, [
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-"
        ]);

        let section3 = new Pattern("", 2);
        section3.addPattern(piano2, [
            "G4", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "A#4", "-", "-", "-",
            "G4", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "A#4", "-", "-", "-",
            "C5", "-", "-", "-", "-", "-", "-", "-",
            "D#5", "-", "-", "-", "D5", "-", "-", "-",
            "A#4", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "M",

            "G4", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "A#4", "-", "-", "-",
            "G4", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "A#4", "-", "-", "-",
            "C5", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "M",
        ]);
        //this.track_debug.addPattern(section3);

        this.track2.addPattern(section1);
        this.track2.addPattern(section2);
        this.track2.addPattern(empty);
        this.track2.addPattern(empty);
        this.track2.addPattern(section3);
        this.track2.addPattern(section2);
    }
    setTrack3() {
        this.track3.stopOnNext = true;
        let env = { attack: 0.01, decay: 0.03, hold: 2, release: 0.01 }
        let bass = this.trigon.triangle({ env: env, volume: 0.4 })
        let pre = new Pattern("bass_1", 2);
        pre.addPattern(bass, [
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-"
        ]);
        pre.addPattern(bass, [
            "-", "-", "-", "-", "-", "-", "-", "C2",
            "-", "C2", "C2", "C2", "C2", "C2", "C2", "C2"
        ]);

        let section1 = new Pattern("bass_2", 2);
        section1.addPattern(bass, [
            "G#1", "G#1", "G#1", "G#1", "A#1", "A#1", "A#1", "C2",
            "-", "C2", "C2", "A#1", "C2", "D#2", "C2", "A#1",
            "G#1", "G#1", "G#1", "G#1", "A#1", "A#1", "A#1", "C2",
            "-", "C2", "C2", "A#1", "C2", "G2", "F2", "D#2",
            "G#1", "G#1", "G#1", "G#1", "A#1", "A#1", "A#1", "C2",
            "-", "C2", "C2", "E2", "-", "E2", "E2", "E2",
            "F2", "-", "G#1", "-", "A#1", "-", "-", "C2",
            "-", "C2", "C2", "C2", "C2", "C2", "C2", "C2",
        ]);

        let section2 = new Pattern("bass_2", 2);
        section2.addPattern(bass, [
            "G#1", "G#1", "G#1", "G#1", "A#1", "A#1", "A#1", "C2",
            "-", "C2", "C2", "A#1", "C2", "D#2", "C2", "A#1",
            "G#1", "G#1", "G#1", "G#1", "A#1", "A#1", "A#1", "C2",
            "-", "C2", "C2", "A#1", "C2", "G2", "F2", "D#2",
            "G#1", "G#1", "G#1", "G#1", "A#1", "A#1", "A#1", "C2",
            "-", "C2", "C2", "E2", "-", "E2", "E2", "E2",
            "F2", "-", "F2", "-", "G2", "-", "-", "C2",
            "-", "C2", "C2", "C2", "M", "M", "M", "M",
        ]);

        let section3 = new Pattern("bass", 2);
        section3.addPattern(bass, [
            "G#1", "G#1", "G#1", "G#1", "-", "G#1", "G#1", "G#1",
            "G#1", "G#1", "G#1", "G#1", "A#1", "G#1", "A#1", "B1",
            "C2", "C2", "C2", "C2", "-", "C2", "C2", "C2",
            "C2", "C2", "C2", "E1", "-", "E2", "E2", "E2",
            "F1", "F1", "F1", "F1", "F1", "F1", "F1", "F2",
            "-", "F2", "F2", "F2", "F2", "C2", "D#2", "D2",
            "C2", "C2", "C2", "C2", "C2", "C2", "C2", "C2",
            "C2", "D2", "D#2", "E2", "-", "E2", "E2", "E2",

            "G#1", "G#1", "G#1", "G#1", "-", "G#1", "G#1", "G#1",
            "G#1", "G#1", "G#1", "G#1", "A#1", "G#1", "A#1", "B1",
            "C2", "C2", "C2", "C2", "-", "C2", "C2", "C2",
            "C2", "C2", "C2", "E1", "-", "E2", "E2", "E2",
            "F1", "F1", "F1", "F1", "F1", "F1", "F1", "F2",
            "-", "F2", "F2", "F2", "F2", "G#1", "G#1", "G#1",
        ]);
        this.track3.addPattern(pre);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
        this.track3.addPattern(section2);
        this.track3.addPattern(section3);
        this.track3.addPattern(section1);
        //this.track3.addPattern(section1);
        // this.track_debug.pitchShift = 12;
        // this.track_debug.addPattern(section3);
        this.track3.pitchShift = 12;
    }
    setTrack4() {
        let drum = this.trigon.baseDrum({ volume: 0.8 });
        let pre = new Pattern("dr", 2);
        pre.addPattern(drum, [
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "kick+ohh3",
            "-", "-", "snare", "kick+ohh", "snare", "kick+ohh3", "snare", "snare/1", "snare/1",
        ]);

        let section1 = new Pattern("", 2);
        let pt1 = new Pattern("dr", 2);
        pt1.addPattern(drum, [
            "kick+ohh", "-", "snare+ohh3", "-", "kick+ohh3", "-", "snare+ohh3", "kick",
            "ohh3", "kick", "snare+ohh3", "-", "kick+ohh3", "kick", "snare+ohh3", "-",
        ]);
        let pt2 = new Pattern("dr", 2);
        pt2.addPattern(drum, [
            "kick+ohh", "-", "snare+ohh3", "-", "kick+ohh3", "-", "snare+ohh3", "kick",
            "ohh3", "kick", "snare+ohh3", "-", "kick+ohh3", "kick", "snare+ohh3", "snare/1", "snare/1"
        ]);
        let pt3 = new Pattern("dr", 2);
        pt3.addPattern(drum, [
            "kick+ohh", "-", "snare+ohh3", "-", "kick+ohh3", "-", "snare+ohh3", "kick",
            "ohh3", "kick", "snare+ohh3", "-", "kick+ohh3", "kick", "snare+ohh3/1", "snare/1", "snare/1", "snare/1"
        ]);
        section1.addPattern(pt1);
        section1.addPattern(pt2);
        section1.addPattern(pt1);
        section1.addPattern(pt3);

        let section2 = new Pattern("", 2);
        (() => {
            let pt1 = [
                "kick+ohh", "chh", "snare+chh", "chh", "kick+chh", "kick+chh", "snare+chh", "kick",
                "chh", "kick+chh", "snare+chh", "snare+chh", "kick+chh", "kick+chh", "snare+chh", "-",
            ]
            let pt2 = [
                "kick+ohh", "chh", "snare+chh", "chh", "kick+chh", "kick+chh", "snare+chh", "kick",
                "chh", "kick+chh", "snare+chh", "snare+chh", "kick+chh", "kick+chh", "snare+chh", "snare+chh/1", "snare/1"
            ]
            let pt3 = [
                "kick+ohh", "chh", "snare+chh", "chh", "kick+chh", "kick+chh", "snare+chh", "kick+ohh",
                "-", "kick+chh", "snare+chh", "snare+chh", "kick+chh", "kick+chh", "snare+chh", "snare+chh/1", "snare/1"
            ]
            let pt4 = [
                "kick+ohh", "chh", "snare+chh", "chh", "kick+chh", "kick+chh", "snare+chh", "kick+ohh",
                "-", "-", "-", "-", "-", "-", "-", "snare+chh"
            ]
            section2.addPattern(drum, pt1);
            section2.addPattern(drum, pt2);
            section2.addPattern(drum, pt1);
            section2.addPattern(drum, pt3);

            section2.addPattern(drum, pt1);
            section2.addPattern(drum, pt2);
            section2.addPattern(drum, pt1);
            section2.addPattern(drum, pt4);
        })()

        let section3 = new Pattern("", 2);
        (() => {
            let pt1 = new Pattern("dr", 2);
            pt1.addPattern(drum, [
                "kick+ohh", "-", "snare+ohh3", "-", "kick+ohh3", "-", "snare+ohh3", "kick",
                "ohh3", "kick", "snare+ohh3", "-", "kick+ohh3", "kick", "snare+ohh3", "-",
            ]);
            let pt2 = new Pattern("dr", 2);
            pt2.addPattern(drum, [
                "kick+ohh", "-", "snare+ohh3", "-", "kick+ohh3", "-", "snare+ohh3", "kick",
                "ohh3", "kick", "snare+ohh3", "-", "kick+ohh3", "kick", "snare+ohh3", "snare/1", "snare/1"
            ]);
            let pt3 = new Pattern("dr", 2);
            pt3.addPattern(drum, [
                "kick+ohh", "-", "snare+ohh3", "-", "kick+ohh3", "-", "snare+ohh3", "kick",
                "ohh3", "kick", "snare+ohh3", "-", "kick+ohh3", "kick", "snare+ohh3/1", "snare/1", "snare/1", "snare/1"
            ]);
            section3.addPattern(pt1);
            section3.addPattern(pt2);
            section3.addPattern(pt1);
            section3.addPattern(pt3);

            section3.addPattern(pt1);
            section3.addPattern(pt2);
            section3.addPattern(pt3);
        })()
        this.track4.addPattern(pre);
        this.track4.addPattern(section1);
        this.track4.addPattern(section2);
        this.track4.addPattern(section3);
        this.track4.addPattern(section1);
    }
    set_track_vocal() {
        this.track_vocal.stopOnNext = true;
        let piano_1 = this.trigon.triangle({ env: { attack: .01, decay: 0.01, hold: 0.3, release: 0.1 }, delay: { delayTime: 0.8, wet: 0.15, feedback: 0.05 }, volume: 0.4 })
        let piano_2 = this.trigon.square({ env: { attack: .01, decay: 0.01, hold: 0.3, release: 0.1 }, delay: { delayTime: 0.8, wet: 0.15, feedback: 0.05 }, volume: 0.2 })
        let piano = this.trigon.groupSource([piano_1, piano_2], { volume: .8 })
        let section1 = new Pattern("s1", 2);
        section1.addPattern(piano, [
            "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-",

            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "A#3", "C4", "G4",
            "-", "G4", "G4", "G4", "F4", "G4", "F4", "D#4",
            "-", "D4", "C4", "D#4", "-", "A#3", "C4", "G4",
            "-", "G4", "G4", "G4", "A#4", "G4", "F4", "D#4",
            "-", "F4", "F#4", "G4", "-", "A#3", "C4", "G4",
            "-", "G4", "G4", "G4", "F4", "G4", "F4", "D#4",
            "-", "D4", "C4", "D#4", "-", "A#3", "A#3", "A#3",
            "C4", "-", "G4", "-", "C4", "A#3", "-", "C4",

            "-", "-", "-", "-", "-", "A#3", "C4", "G4",
            "-", "G4", "G4", "G4", "F4", "G4", "F4", "D#4",
            "-", "D4", "C4", "D#4", "-", "A#3", "C4", "G4",
            "-", "G4", "G4", "G4", "A#4", "G4", "F4", "D#4",
            "-", "F4", "F#4", "G4", "-", "A#3", "C4", "G4",
            "-", "G4", "G4", "G4", "F4", "G4", "F4", "D#4",
            "-", "D4", "C4", "D#4", "-", "A#3", "A#3", "A#3",
            "C4", "-", "G4", "-", "C4", "A#3", "-", "C4",
            "-", "-", "-", "-", "-", "-", "-", "-",
        ]);

        let section2 = new Pattern("v2", 2);

        section2.addPattern(piano, [
            "F4", "G4", "G4", "-", "F4", "-", "F4", "G4",
            "G4", "-", "F4", "-", "D#4", "-", "F4", "-",
            "F4", "G4", "G4", "-", "F4", "-", "F4", "A#4",
            "A#4", "-", "G#4", "-", "G4", "G#4", "A#4", "-",

            "G4", "-", "-", "D#4", "D#4", "-", "-", "C4",
            "G4", "-", "-", "D#4", "D#4", "-", "-", "-",
            "C4", "-", "D4", "-", "D#4", "-", "F4", "-",
            "G4", "-", "C5", "G4", "G4", "-", "-", "-",

            "F4", "G4", "G4", "-", "F4", "-", "F4", "G4",
            "G4", "-", "F4", "-", "D#4", "-", "F4", "-",
            "F4", "G4", "G4", "-", "F4", "-", "F4", "A#4",
            "A#4", "-", "G#4", "-", "G4", "G#4", "A#4", "-",

            "G4", "-", "-", "D#4", "D#4", "-", "-", "C4",
            "G4", "-", "G#4", "A#4", "-", "D#4", "G#4", "G4",
        ]);
        //this.track_debug.addPattern(section2);
        this.track_vocal.addPattern(section1);
        this.track_vocal.addPattern(section2);
    }
    create() {
        this.setTrack1();
        this.setTrack2();
        this.setTrack3();
        this.setTrack4();
        this.set_track_vocal();
        this.trigon.setCreate(() => {
            if (this.track_debug.data.length > 0) {
                this.trigon.addTrack(this.track_debug);
            }
            else {
                this.trigon.addTrack(this.track1);
                this.trigon.addTrack(this.track2);
                this.trigon.addTrack(this.track3);
                this.trigon.addTrack(this.track4);
                this.trigon.addTrack(this.track_vocal);
            }
        });
    }
}
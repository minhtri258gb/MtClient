`
liyue2 - HoyoMix
code:Lenshang
2020-09-25
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';

export default class {
    constructor() {
        this.trigon = new Trigon();
        this.trigon.speed = 1;
        this.trigon.setBpm(165);
        this.track1 = new Pattern("track1", 4);
        this.track2 = new Pattern("track2", 4);
        this.track3 = new Pattern("track3", 4);
        this.track4 = new Pattern("track4", 4);
        this.track_drum = new Pattern("track_drum", 4);
    }
    setTrack1() {
        let env = { attack: 0, decay: 0.01, hold: 0.1, release: 0.2 }
        let delay = { delayTime: 0.4, wet: 0.1, feedback: 0.2 }
        let piano_1 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, panning: 0.8 });
        let piano_2 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, detune: 20, panning: -0.8 })
        let piano = this.trigon.groupSource([piano_1, piano_2], { volume: .5 })
        let section1 = new Pattern("s1", 2);
        section1.addPattern(piano, ["G3", "0", "A3", "G4", "0", "E4", "D4", "0", "C4", "0", "0", "A3", "G3", "0", "A3", "G4", "0", "E4", "0", "0", "0", "0", "0", "0"]);

        let chord1 = new Pattern("c1", 2)
        chord1.addPattern(piano, ["G3", "0", "A3", "G4", "0", "E4", "D4", "0", "C4", "0", "0", "A3", "G3", "0", "A3", "G4", "0", "E4", "D4", "0", "0", "C4", "0", "0"]);
        section1.addPattern(chord1);
        section1.addPattern(chord1);
        section1.addPattern(chord1);
        section1.addPattern(chord1);
        this.track1.addPattern(section1);

        let chord2 = new Pattern("c1", 2)
        chord2.addPattern(piano, [
            "A3", "0", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",
            "A3", "0", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",

            "G#3", "C4", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",
            "G#3", "C4", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",

            "G3", "C4", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",
            "G3", "C4", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",

            "F#3", "A3", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",
            "F#3", "A3", "D4", "E4", "0", "G4", "E4", "0", "D4", "0", "0", "0",
        ]);
        let section2 = new Pattern("s1", 2);
        section2.addPattern(chord2);

        let chord3 = new Pattern("c3", 2)
        chord3.addPattern(piano, [
            "E4", "0", "F#4", "G#4", "0", "B4", "G#4", "0", "F#4", "0", "0", "0",
            "E4", "0", "F#4", "G#4", "0", "C#5", "G#4", "0", "F#4", "0", "0", "0",

            "E4", "0", "F#4", "G#4", "0", "C#5", "G#4", "0", "F#4", "0", "0", "0",
            "E4", "0", "F#4", "G#4", "0", "B4", "G#4", "0", "F#4", "0", "0", "0",

            "E4", "0", "F#4", "G#4", "0", "B4", "G#4", "0", "F#4", "0", "0", "0",
            "E4", "0", "F#4", "G#4", "0", "C#5", "G#4", "0", "F#4", "0", "0", "0",

            "E4", "0", "F#4", "G#4", "0", "C#5", "G#4", "0", "F#4", "0", "0", "0",
            "E4", "0", "F#4", "G#4", "0", "D#5", "G#4", "0", "F#4", "0", "0", "0",

            "E4", "0", "F#4", "G#4", "0", "C#5", "G#4", "0", "F#4", "0", "0", "0",
            "E4", "0", "F#4", "G#4", "0", "D#5", "G#4", "0", "F#4", "0", "0", "0",

            "E4", "0", "F#4", "G#4", "0", "C#5", "G#4", "0", "F#4", "0", "0", "0",
            "E4", "0", "F#4", "G#4", "0", "D#5", "G#4", "0", "F#4", "0", "0", "0",
        ]);
        section2.addPattern(chord3);
        this.track1.addPattern(section2);
    }
    setTrack2() {
        this.track2.stopOnNext = true;
        let env = { attack: 0.01, decay: 0.03, hold: 2, release: 0.01 }
        let bass = this.trigon.triangle({ env: env, volume: 0.2 })
        let section1 = new Pattern("bass_1", 2);
        section1.addNote(bass, "0", 8 * 3 - 1);
        section1.addPattern(bass, ["C2", "0", "C2", "0", "C2", "0", "C2", "0", "0", "C2", "0", "0", "C2", "0", "C2", "0", "C2", "0", "C2", "0", "0", "C2", "0", "0"])
        section1.addPattern(bass, ["D2", "0", "D2", "0", "D2", "0", "D2", "0", "0", "D2", "0", "0", "D2", "0", "D2", "0", "D2", "0", "D2", "0", "0", "D2", "0", "0"])
        section1.addPattern(bass, ["E2", "0", "E2", "0", "E2", "0", "E2", "0", "0", "E2", "0", "0", "E2", "0", "E2", "0", "E2", "0", "E2", "0", "0", "E2", "0", "0"])
        section1.addPattern(bass, ["F2", "0", "F2", "0", "F2", "0", "F2", "0", "0", "F2", "0", "0", "F2", "0", "F2", "0", "F2", "0", "F2", "0", "0", "F2", "0", "0"])

        let section2 = new Pattern("bass_1", 2);
        section2.addPattern(bass, [
            "A2", "0", "M", "A2", "0", "M",
            "A2", "0", "M", "A2", "0", "M",
            "A2", "0", "M", "A2", "0", "M",
            "A2", "0", "M", "A2", "0", "M"])
        section2.addPattern(bass, [
            "G#2", "0", "M", "G#2", "0", "M",
            "G#2", "0", "M", "G#2", "0", "M",
            "G#2", "0", "M", "G#2", "0", "M",
            "G#2", "0", "M", "G#2", "0", "M"])
        section2.addPattern(bass, [
            "G2", "0", "M", "G2", "0", "M",
            "G2", "0", "M", "G2", "0", "M",
            "G2", "0", "M", "G2", "0", "M",
            "G2", "0", "M", "G2", "0", "M"])
        section2.addPattern(bass, [
            "F#2", "0", "M", "F#2", "0", "M",
            "F#2", "0", "M", "F#2", "0", "M",
            "F#2", "0", "M", "F#2", "0", "M",
            "F#2", "0", "M", "F#2", "0", "M"])

        section2.addPattern(bass, [
            "E2", "0", "0", "0", "0", "0",
            "E2", "0", "0", "0", "0", "0",
            "E2", "0", "0", "0", "0", "0",
            "B2", "0", "0", "0", "0", "0",
            "G#2", "0", "0", "0", "0", "0",
            "G#2", "0", "0", "0", "0", "0",
            "G#2", "0", "0", "0", "0", "0",
            "C#3", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "B2", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "B2", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "E3", "0", "0", "0", "0", "0",
            "B2", "0", "0", "0", "0", "0",
        ])
        this.track2.addPattern(section1)
        this.track2.addPattern(section2)
    }
    setTrack3() {
        this.track3.stopOnNext = true;
        let env = { attack: 0, decay: 0.01, hold: 0.1, release: 0.2 }
        let delay = { delayTime: 0.4, wet: 0.1, feedback: 0.2 }
        let piano = this.trigon.triangle({ env: env, delay: delay, volume: 0.2 });
        let section1 = new Pattern("s1", 2);
        section1.addNote(piano, "0", 8 * 3 - 1);
        section1.addPattern(piano, this.getRythm1("C4"))
        section1.addPattern(piano, this.getRythm1("D4"))
        section1.addPattern(piano, this.getRythm1("E4"))
        section1.addPattern(piano, this.getRythm1("F4"))

        section1.addPattern(piano, this.getRythm1("-"))
        section1.addPattern(piano, this.getRythm1("-"))
        section1.addPattern(piano, this.getRythm1("-"))
        section1.addPattern(piano, this.getRythm1("-"))

        let section2 = new Pattern("s2", 2);
        section2.addPattern(piano, [
            "E3", "0", "0", "0", "0", "0",
            "F#3", "0", "0", "0", "0", "0",
            "G#3", "0", "0", "0", "0", "0",
            "B3", "0", "0", "0", "0", "0",]);
        section2.addPattern(piano, [
            "E3", "0", "0", "0", "0", "0",
            "F#3", "0", "0", "0", "0", "0",
            "G#3", "0", "0", "0", "0", "0",
            "B3", "0", "0", "0", "0", "0",]);
        section2.addPattern(piano, [
            "E3", "0", "0", "0", "0", "0",
            "F#3", "0", "0", "0", "0", "0",
            "G#3", "0", "0", "0", "0", "0",
            "B3", "0", "0", "0", "0", "0",]);
        section2.addPattern(piano, [
            "E3", "0", "0", "0", "0", "0",
            "F#3", "0", "0", "0", "0", "0",
            "G#3", "0", "0", "0", "0", "0",
            "B3", "0", "0", "0", "0", "0",]);
        section2.addPattern(piano, [
            "E4", "0", "0", "0", "0", "0",
            "F#4", "0", "0", "0", "0", "0",
            "G#4", "0", "0", "0", "0", "0",
            "B4", "0", "0", "0", "0", "0",]);
        section2.addPattern(piano, [
            "E4", "0", "0", "0", "0", "0",
            "F#4", "0", "0", "0", "0", "0",
            "G#4", "0", "0", "0", "0", "0",
            "B4", "0", "0", "0", "0", "0",]);
        this.track3.addPattern(section1)
        this.track3.addPattern(section2)
    }
    setTrack4() {
        this.track4.stopOnNext = true;
        let piano_1 = this.trigon.triangle({ env: { attack: .01, decay: 0.01, hold: 0.5, release: 0.2 }, delay: { delayTime: 0.8, wet: 0.15, feedback: 0.05 }, volume: 0.4 })
        let piano_2 = this.trigon.square({ env: { attack: .01, decay: 0.01, hold: 0.5, release: 0.2 }, delay: { delayTime: 0.8, wet: 0.15, feedback: 0.05 }, volume: 0.2 })
        let piano = this.trigon.groupSource([piano_1, piano_2], { volume: .5 })
        let section1 = new Pattern("s1", 2);
        section1.addNote(piano, "0", 8 * 3 - 1);
        section1.addPattern(piano, [
            "0", "0", "0", "0", "0", "0",
            "0", "0", "E5", "G5", "0", "M",
            "0", "0", "0", "0", "0", "0",
            "0", "0", "D5", "E5", "0", "0"
        ]);
        section1.addPattern(piano, [
            "0", "0", "0", "0", "0", "0",
            "0", "0", "E5", "G5", "0", "M",
            "0", "0", "0", "0", "0", "0",
            "0", "0", "D5", "E5", "C5", "A5"
        ]);
        section1.addPattern(piano, [
            "G5", "0", "0", "0", "0", "0",
            "0", "0", "G4/1", "E5/1", "G5", "0", "M",
            "0", "0", "0", "0", "0", "0",
            "D6", "B5", "A5", "G5", "E5", "A5"
        ]);
        section1.addPattern(piano, [
            "G5", "0", "0", "G5", "0", "0",
            "0", "0", "0", "0", "0", "0",
            "0", "0", "0", "0", "0", "0",
            "0", "0", "0", "0", "0", "0"
        ]);

        let section2 = new Pattern("s1", 2);
        section2.addPattern(piano, [
            "E6", "0", "0", "0", "0", "0",
            "E6", "0", "0", "0", "D6", "C6",
            "B5", "C6", "E5", "A5", "C5", "E5",
            "B4", "C5", "E4", "0", "0", "A5",
            "G5", "0", "0", "G5", "0", "0",
            "G#4", "0", "0", "G#4", "0", "0",
            "G#4", "0", "0", "G#4", "0", "0",
            "0", "0", "0", "0", "0", "0",
            "0", "0", "0", "B6", "0", "0",
            "C7", "0", "0", "E7", "0", "0",
            "B7", "0", "A7", "0", "C7", "0",
            "E7", "0", "0", "E4", "D4", "C4",
            "A3", "0", "0", "E4", "D5", "E5",
            "A5", "0", "0", "0", "0", "E4",
            "A4", "0", "0", "A4", "0", "0",
            "-", "-", "-", "-", "-", "-",

            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",

            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",

            "E5", "0", "0", "0", "0", "0",
            "F#5", "0", "0", "0", "0", "0",
            "G#5", "0", "0", "0", "0", "0",
            "B5", "0", "0", "0", "0", "0",

            "E5", "0", "0", "0", "0", "0",
            "F#5", "0", "0", "0", "0", "0",
            "G#5", "0", "0", "0", "0", "0",
            "B5", "0", "0", "0", "0", "0",

            "E5", "0", "0", "0", "0", "0",
            "F#5", "0", "0", "0", "0", "0",
            "G#5", "0", "0", "0", "0", "0",
            "B5", "0", "0", "0", "0", "0",

            "E5", "0", "0", "0", "0", "0",
            "F#5", "0", "0", "0", "0", "0",
            "G#5", "0", "0", "0", "0", "0",
            "B5", "0", "0", "0", "0", "0",
        ]);
        this.track4.addPattern(section1);
        this.track4.addPattern(section2);
    }
    set_track_drum() {
        let drum = this.trigon.baseDrum({ volume: 0.8 });
        let pre = new Pattern("dr", 2);
        pre.addPattern(drum, [
            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",
            "-", "-", "-", "-", "-", "-",
            "-", "-", "kick", "kick", "-", "-"
        ]);
        let pt1 = new Pattern("dr", 2);
        pt1.addPattern(drum, [
            "kick+ohh3", "chh3", "chh3", "chh3", "chh3", "kick+chh3",
            "snare+chh3", "chh3", "chh3", "snare+chh3", "chh3", "chh3",
            "kick+chh3", "chh3", "chh3", "chh3", "chh3", "kick+chh3",
            "snare+chh3", "chh3", "chh3", "chh3", "chh3", "snare+chh3",
        ]);

        let pt2 = new Pattern("dr", 2);
        pt2.addPattern(drum, [
            "kick+ohh3", "chh3", "chh3", "chh3", "chh3", "kick+chh3",
            "snare+chh3", "chh3", "chh3", "snare+chh3", "chh3", "chh3",
            "kick+chh3", "chh3", "chh3", "chh3", "chh3", "kick+chh3",
            "snare+chh3", "chh3", "chh3", "snare+chh3", "snare+chh3", "snare+chh3",
        ]);
        let section1 = new Pattern();
        section1.addPattern(pre);
        section1.addPattern(pt1);
        section1.addPattern(pt1);
        section1.addPattern(pt1);
        section1.addPattern(pt2);

        let section2 = new Pattern("dr", 2);
        let pt3 = new Pattern("dr", 2);
        pt3.addPattern(drum, [
            "kick+chh3", "chh3", "chh3", "kick+chh3", "chh3", "chh3",
            "kick+chh3", "chh3", "chh3", "kick+chh3", "chh3", "chh3",
            "kick+chh3", "chh3", "chh3", "kick+chh3", "chh3", "chh3",
            "kick+chh3", "chh3", "chh3", "kick+chh3", "chh3", "ohh3",
        ]);
        section2.addPattern(pt3);
        section2.addPattern(pt3);
        section2.addPattern(pt3);
        section2.addPattern(pt3);
        this.track_drum.addPattern(section1);
        this.track_drum.addPattern(section2);
    }
    getRythm1(key) {
        return [key, "0", key, key, "0", key, key, "0", key, key, "0", key, key, "0", key, key, "0", key, key, "0", "0", key, "0", "0"]
    }
    create() {
        this.setTrack1();
        this.setTrack2();
        this.setTrack3();
        this.setTrack4();
        this.set_track_drum();
        this.trigon.setCreate(() => {
            this.trigon.addTrack(this.track1);
            this.trigon.addTrack(this.track2);
            this.trigon.addTrack(this.track3);
            this.trigon.addTrack(this.track4);
            this.trigon.addTrack(this.track_drum);
        });
    }
}

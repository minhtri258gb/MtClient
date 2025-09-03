`
潮鸣り-折戸伸治
code:Lenshang
2020-09-21
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';

export default class {
    constructor() {
        this.trigon = new Trigon();
        this.trigon.speed = 2;
        this.trigon.setBpm(76);
        this.track1 = new Pattern("tr1");
        this.track2 = new Pattern("tr2");
        this.track3 = new Pattern("tr_drum");
        this.track4 = new Pattern("tr_bass");
        this.track5 = new Pattern("tr_synth");
    }
    setTrack1() {
        let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.3 }
        let delay = { delayTime: 0.5, wet: 0.25, feedback: 0.25 }
        let piano = this.trigon.square({ filter: { type: 'lowpass', frequency: 1500, q: 1 }, env: env, delay: delay, volume: 0.15 })
        let chord1 = new Pattern();
        chord1.addPattern(piano, ["F3", "C4", "E4", "C4", "F3", "C4", "E4", "C4"]);
        let chord2 = new Pattern();
        chord2.addPattern(piano, ["G3", "B3", "D4", "B3", "G3", "B3", "D4", "B3"]);
        let chord3 = new Pattern();
        chord3.addPattern(piano, ["A3", "C4", "E4", "C4", "A3", "C4", "E4", "C4"]);

        let rythm1 = new Pattern();

        rythm1.addPattern(chord1);
        rythm1.addPattern(chord2);
        rythm1.addPattern(chord3);
        rythm1.addPattern(chord3);

        this.track1.addPattern(rythm1, null, 2);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
        this.track1.addPattern(rythm1);
    }
    setTrack2() {
        let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.3 }
        let delay = { delayTime: 0.5, wet: 0.25, feedback: 0.25 }
        let piano2 = this.trigon.square({ filter: { type: 'lowpass', frequency: 1500, q: 1 }, env: env, delay: delay, volume: 0.3 })
        var preSection = new Pattern();
        preSection.addNote(piano2, "G4", 1);
        var section1 = new Pattern();
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "E5")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "G4")
        section1.addNote(piano2, "A4", 6)

        section1.addNote(piano2, "G4")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "E5")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "G4")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "E5")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "G4")
        section1.addNote(piano2, "A4", 2)

        section1.addNote(piano2, "E4")
        section1.addNote(piano2, "G4", 2)

        section1.addNote(piano2, "D4")
        section1.addNote(piano2, "E4")
        section1.addNote(piano2, "G4")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "B4")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "E5")
        section1.addNote(piano2, "A4")
        section1.addNote(piano2, "G4")
        section1.addNote(piano2, "A4", 6)

        var section2 = new Pattern();
        section2.addNote(piano2, "G4")
        section2.addNote(piano2, "A4")
        section2.addNote(piano2, "E5")
        section2.addNote(piano2, "B4")
        section2.addNote(piano2, "C5")
        section2.addNote(piano2, "B4")
        section2.addNote(piano2, "C5")
        section2.addNote(piano2, "D5")
        section2.addNote(piano2, "E5")
        section2.addNote(piano2, "A4", 7)

        section2.addNote(piano2, "A4", 1)
        section2.addNote(piano2, "G4", 1)

        var section3 = new Pattern();
        section3.addNote(piano2, "G4")
        section3.addNote(piano2, "A4")
        section3.addNote(piano2, "E5")
        section3.addNote(piano2, "B4")
        section3.addNote(piano2, "C5")
        section3.addNote(piano2, "B4")
        section3.addNote(piano2, "C5")
        section3.addNote(piano2, "B4")
        section3.addNote(piano2, "A4")
        section3.addNote(piano2, "E4", 6)

        section3.addNote(piano2, "D4")
        section3.addNote(piano2, "E4")
        section3.addNote(piano2, "G4")
        section3.addNote(piano2, "A4")
        section3.addNote(piano2, "B4")

        var section4 = new Pattern()
        section4.addNote(piano2, "G4")
        section4.addNote(piano2, "A4")
        section4.addNote(piano2, "E5")
        section4.addNote(piano2, "B4")
        section4.addNote(piano2, "C5")
        section4.addNote(piano2, "B4")
        section4.addNote(piano2, "C5")
        section4.addNote(piano2, "D5")
        section4.addNote(piano2, "E5")
        section4.addNote(piano2, "A4", 5)

        section4.addNote(piano2, "A4", 1)
        section4.addNote(piano2, "B4", 1)
        section4.addNote(piano2, "G5", 1)

        var section5 = new Pattern();
        section5.addPattern(piano2, [
            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "B5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "B5", "E5",
            "D5", "E5", "C6", "E5",
            "B5", "E5", "A5", "E5",

            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "B5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "B5", "E5",
            "D5", "E5", "C6", "E5",
            "B5", "E5", "A5", "E5",

            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "B5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "B5", "E5",
            "D5", "E5", "C6", "E5",
            "B5", "E5", "A5", "E5",

            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "B5", "E5",
            "D5", "E5", "A5", "E5",
            "D5", "E5", "C6", "B5",
            "A5"
        ])
        let main = new Pattern();
        main.addPattern(section1);
        main.addPattern(section2);

        main.addPattern(section1);
        main.addPattern(section3);
        main.addPattern(section1);
        main.addPattern(section4);
        main.addPattern(section5);

        this.track2.addPattern(preSection);
        this.track2.addPattern(main);
    }
    setDrum() {
        let drum = this.trigon.baseDrum({ volume: 0.8 });
        let pt1 = new Pattern();
        pt1.addNote(drum, "kick+ohh");
        pt1.addNote(drum, "chh");
        pt1.addNote(drum, "snare+chh");
        pt1.addNote(drum, "chh");
        pt1.addNote(drum, "kick+chh");
        pt1.addNote(drum, "kick+chh");
        pt1.addNote(drum, "snare+chh");
        pt1.addNote(drum, "chh");

        let pt2 = new Pattern();
        pt2.addNote(drum, "kick+chh");
        pt2.addNote(drum, "chh");
        pt2.addNote(drum, "snare+chh");
        pt2.addNote(drum, "chh");
        pt2.addNote(drum, "chh");
        pt2.addNote(drum, "chh/2");
        pt2.addNote(drum, "kick/2");
        pt2.addNote(drum, "snare+chh");
        pt2.addNote(drum, "kick+chh");

        let pt3 = new Pattern();
        pt3.addNote(drum, "kick+ohh");
        pt3.addNote(drum, "chh");
        pt3.addNote(drum, "snare+chh");
        pt3.addNote(drum, "chh");
        pt3.addNote(drum, "chh");
        pt3.addNote(drum, "kick+chh");
        pt3.addNote(drum, "snare+chh");
        pt3.addNote(drum, "chh");

        let section1 = new Pattern();
        section1.addPattern(pt1);
        section1.addPattern(pt2);
        section1.addPattern(pt3);
        section1.addPattern(pt1);

        let preSection = new Pattern();
        preSection.addNote(drum, "snare", 1);

        this.track3.addPattern(preSection, null, 64);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
        this.track3.addPattern(section1);
    }
    setTrackBass() {
        let env = { attack: 0.01, decay: 0.03, hold: 2, release: 0.5 }
        let bass = this.trigon.triangle({ env: env, volume: 0.3 })
        var section = new Pattern();
        section.addNote(bass, "F2", 6);
        section.addNote(bass, "F2");
        section.addNote(bass, "G2", 6);
        section.addNote(bass, "G2");
        section.addNote(bass, "A2", 6);
        section.addNote(bass, "A2");
        section.addNote(bass, "A2", 7);
        this.track4.stopOnNext = true;
        this.track4.addPattern(section, null, 66);
        this.track4.addPattern(section);
        this.track4.addPattern(section);
        this.track4.addPattern(section);
        this.track4.addPattern(section);
        this.track4.addPattern(section);
        this.track4.addPattern(section);
        this.track4.addPattern(section);
    }
    setTrackSynth() {
        //let _delay = { delayTime: 0.4, wet: 0.5, feedback: 0.5 }
        let _env = { attack: 0.01, decay: 0.03, hold: 0.05, release: 0.5 }
        let panning = {}
        let synth = this.trigon.sawtooth({ env: _env, volume: 0.05, panning: 0 })

        let pt = new Pattern();
        pt.addNote(synth, "A6", null, null, { panning: -.5 });
        pt.addNote(synth, "A6", null, null, { panning: .5, volume: 0.03 });
        pt.addNote(synth, "E6", null, null, { panning: -.5 });
        pt.addNote(synth, "E6", null, null, { panning: .5, volume: 0.03 });

        let section = new Pattern();
        section.addPattern(pt);
        section.addPattern(pt);
        section.addPattern(pt);
        section.addPattern(pt);
        section.addPattern(pt);
        section.addPattern(pt);
        section.addPattern(pt);
        section.addPattern(pt);

        this.track5.addPattern(section, null, 2);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
        this.track5.addPattern(section);
    }
    create() {
        this.setTrack1();
        this.setTrack2();
        this.setDrum();
        this.setTrackSynth();
        this.setTrackBass();

        this.trigon.setCreate(() => {
            this.trigon.addTrack(this.track1);
            this.trigon.addTrack(this.track2);
            this.trigon.addTrack(this.track3);
            this.trigon.addTrack(this.track4);
            this.trigon.addTrack(this.track5);
        });
    }
    customDom(dom){
        dom.innerHTML = "";
        var label = document.createElement('span');
        label.id = "lbsp"
        label.innerHTML = "Speed(76):";
        dom.appendChild(label);
        var slider = document.createElement('input');
        slider.setAttribute("min", "30");
        slider.setAttribute("max", "120");
        slider.setAttribute("type", "range")
        slider.setAttribute("value", "76");
        slider.onchange = ev => {
            this.trigon.setBpm(ev.target.value);
            label.innerHTML = "Speed(" + ev.target.value + "):";
        };
        dom.appendChild(slider);
    }
}
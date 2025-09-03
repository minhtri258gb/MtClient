`
DemoSong-Lenshang
code:Lenshang
2020-09-21
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';
var trigon = new Trigon();
trigon.setBpm(120)
var track1 = null;
var track2 = null;
var track3=null;
var track4=null;
//#region Track_synth1
var setTrack1=function () {
    let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.3 }
    let delay = { delayTime: 0.5, wet: 0.25, feedback: 0.25 }
    let synth = trigon.square({ filter: { type: 'lowpass', frequency: 1500, q: 1 }, env: env, delay: delay, volume: 0.3 })

    let note = ["A3", "C4", "E4", "A3", "C4", "E4", "A3", "C4", "E4", "0", "0", "0", "0", "0", "0", "0"];
    let chord = new Pattern();
    chord.addPattern(synth, note);

    note = ["G3", "C4", "E4", "G3", "C4", "E4", "G3", "C4", "E4", "0", "0", "0", "0", "0", "0", "0"];
    let chord2 = new Pattern();
    chord2.addPattern(synth, note);

    note = ["F3", "C4", "E4", "F3", "C4", "E4", "F3", "C4", "E4", "0", "0", "0", "0", "0", "0", "0"];
    let chord3 = new Pattern();
    chord3.addPattern(synth, note);

    note = ["G#3", "C4", "E4", "G#3", "C4", "E4", "G#3", "C4", "E4", "0", "0", "0", "0", "0", "0", "0"];
    let chord4 = new Pattern();
    chord4.addPattern(synth, note);

    let synth1_pattern = new Pattern();
    synth1_pattern.addPattern(chord);
    synth1_pattern.addPattern(chord);
    synth1_pattern.addPattern(chord2);
    synth1_pattern.addPattern(chord2);
    synth1_pattern.addPattern(chord3);
    synth1_pattern.addPattern(chord3);
    synth1_pattern.addPattern(chord2);
    synth1_pattern.addPattern(chord4);

    track1 = new Pattern("tr1")
    track1.addPattern(synth1_pattern)
    track1.addPattern(synth1_pattern)
    track1.addPattern(synth1_pattern)
    track1.addPattern(synth1_pattern)
    trigon.addTrack(track1);
};


//#endregion

//#region Track_synth2
var setTrack2 = function () {
    let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.3 }
    let delay = { delayTime: 0.5, wet: 0.25, feedback: 0.25 }
    let synth = trigon.sawtooth({ env: env, delay: delay, volume: 0.3 })
    //let note = ["A4", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"];
    let chord = new Pattern();
    chord.addNote(synth, "A4", 7);
    chord.addNote(synth, "E4", 7);
    chord.addNote(synth, "A3", 7 + 8);
    chord.addNote(synth, "G4", 7);
    chord.addNote(synth, "D4", 7);
    chord.addNote(synth, "B3", 7 + 8);
    chord.addNote(synth, "F4", 7);
    chord.addNote(synth, "C4", 7);
    chord.addNote(synth, "A3", 7 + 8);
    chord.addNote(synth, "F#4", 7);
    chord.addNote(synth, "C4", 7);
    chord.addNote(synth, "E4", 7 + 8);
    track2 = new Pattern("tr2")
    track2.addPattern(chord, null, 128);
    track2.addPattern(chord);
    track2.addPattern(chord);
    track2.addPattern(chord);
    track2.addPattern(chord);
    trigon.addTrack(track2);
}

//#endregion

//#region Track_synth3
var setTrack3 = function () {
    let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.3 }
    let delay = { delayTime: 0.25, wet: 0.7, feedback: 0.8 }
    let synth = trigon.triangle({ env: env, delay: delay, volume: 0.4 })
    let chord = new Pattern();
    chord.addNote(synth,"C4",7);
    chord.addNote(synth,"A3",7);
    chord.addNote(synth,"E3",7+8);
    chord.addNote(synth,"B3",7);
    chord.addNote(synth,"C4",7);
    chord.addNote(synth,"E4",7+8);
    chord.addNote(synth,"C4",7);
    chord.addNote(synth,"A3",7);
    chord.addNote(synth,"E3",7+8);
    chord.addNote(synth,"B3",7);
    chord.addNote(synth,"C4",7);
    chord.addNote(synth,"E4",7+8);
    track3 = new Pattern("tr3");
    track3.addPattern(chord, null, 256);
    track3.addPattern(chord);
    trigon.addTrack(track3);
}

//#endregion

//#region Track4_drum
var setTrack4=function(){
    let delay = { delayTime: 0.3, wet: 0.25, feedback: 0.25 }
    let synth = trigon.baseDrum({volume:0.8,delay:delay});
    let note = ["kick", "0", "0", "0", "0", "0", "0", "0", "snare", "0", "0", "0", "0", "0", "0", "0","kick", "0", "0", "0", "0", "kick", "0", "0", "snare", "0", "0", "0", "0", "0", "0", "0"];
    let chord = new Pattern();
    chord.addPattern(synth, note);
    chord.addPattern(synth, note);
    chord.addPattern(synth, note);
    chord.addPattern(synth, note);
    track4 = new Pattern("tr4");
    track4.addPattern(chord, null, 256);
    track4.addPattern(chord);
    track4.addPattern(chord);
    trigon.addTrack(track4);
}

//#endregion
trigon.setCreate(()=>{
    setTrack1();
    setTrack2();
    setTrack3();
    setTrack4();
});
export default trigon;
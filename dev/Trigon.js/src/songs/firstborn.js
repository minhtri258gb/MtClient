`
FirstBorn - Silent Planet
code:连殇
2021-01-21
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';
class FirstBorn{
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

        this.track_debug2 = new Pattern("debug", 4);
        this.track_debug2.stopOnNext = true;
    }
    setTrack1(){
        this.track1.stopOnNext=true;
        let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.05 }
        let delay = { delayTime: 0.5, wet: 0.15, feedback: 0.25 }
        let piano = this.trigon.sawtooth({ filter: { type: 'lowpass', frequency: 1000, q: 1 }, env: env, delay: delay, volume: 0.2 })
        let section_pre=new Pattern("",2);

        section_pre.addPattern(piano,[
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5",

            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","A#5","C6","C#5",

            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5",

            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","A#5","C6","C#5",
        ]);

        let section1=new Pattern("",2);
        section1.addPattern(piano,[
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5","G5","G#5",
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5","G5","G#5",

            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","C6","C#6","A#5","C#6","C6",
            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","C6","C#6","A#5","C#6","C6",

            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5","G5","G#5",
            "F6","F5","C6","C5","G#5","G5","C#5",
            "F6","F5","C6","C5","G#5","G5","C#5","G5","G#5",

            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","C6","C#6","A#5","C#6","C6",
            "G6","G5","C#6","C#5","A#5","C6","C#5",
            "G6","G5","C#6","C#5","C6","C#6","A#5","C#6","C6",
        ]);
        this.track1.addPattern(section_pre);
        this.track1.addPattern(section1);
    }

    setTrack2(){
        let env = { attack: 0, decay: 0.01, hold: 0.1, release: 0.3 }
        let delay = { delayTime: 0.4, wet: 0.1, feedback: 0.2 }
        let piano_1 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, panning: 0.8 });
        let piano_2 = this.trigon.square({ filter: { type: 'lowpass', frequency: 5000, q: 1 }, env: env, delay: delay, volume: 0.2, detune: 20, panning: -0.8 })
        let piano = this.trigon.groupSource([piano_1, piano_2], { volume: .5 })
        let section1=new Pattern("",2);

        section1.addPattern(piano,[
            "F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4",
            "F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4",
            "F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4",
            "F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4","F3+C4",

            "G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4",
            "G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4",
            "G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4",
            "G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4","G3+C4",

            "G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4",
            "G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4",
            "G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4",
            "G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4","G#3+C4",

            "C4+C3","C4+C3","C4+C3","C4+C3","C4+C3","C4+C3","C4+C3","C4+C3",
            "C4+C3","C4+C3","C4+C3","C4+C3","C4+C3","C4+C3","C4+C3","C4+C3",
            "E4+E3","E4+E3","E4+E3","E4+E3","E4+E3","E4+E3","E4+E3","E4+E3",
            "E4+E3","E4+E3","E4+E3","E4+E3","E4+E3","E4+E3","E4+E3","E4+E3",
        ]);

        //this.track_debug.addPattern(section1);
        this.track2.addPattern(section1,null,2*4*7);
    }
    setTrack3(){
        this.track3.stopOnNext=true;
        let viola = this.trigon.groupSource([
            this.trigon.sawtooth({
                env: { attack: 0.01, decay: 0.005, hold: 7.5, release: 0.2 },
                volume: 0.2,
                //panning: 0.8
            }),
            this.trigon.triangle({
                //filter: { type: 'lowpass', frequency: 9500, q: 1 },
                env: { attack: 0.01, decay: 0.005, hold: 7.5, release: 0.2 },
                volume: 0.1,
                detune: 10,
                //panning: -0.8
            })
        ], { delay: { delayTime: 0.4, wet: 0.25, feedback: 0.25 } });

        let section1=new Pattern("",4);
        section1.addPattern(viola,[
            "C5","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-",
            "G4","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-",
            "G#4","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-",
            "A#4","-","-","-","-","-","-","-","C#5","-","-","-","-","-","-","-","M"
        ]);

        this.track3.addPattern(section1,null,2*4*7);
    }
    set_track_bass(){
        this.track_bass.stopOnNext = true;
        let env = { attack: 0.01, decay: 0.03, hold: 2, release: 0.01 }
        let bass = this.trigon.triangle({ env: env, volume: 0.4 })
        let section1=new Pattern("",2)
        section1.addPattern(bass,[
            "F1","F1","F1","F1","F1","F1","F1","F1",
            "F1","F1","F1","F1","F1","F1","F1","F1",
            "F1","F1","F1","F1","F1","F1","F1","F1",
            "F1","F1","F1","F1","F1","F1","F1","F1",

            "G1","G1","G1","G1","G1","G1","G1","G1",
            "G1","G1","G1","G1","G1","G1","G1","G1",
            "G1","G1","G1","G1","G1","G1","G1","G1",
            "G1","G1","G1","G1","G1","G1","G1","G1",

            "G#1","G#1","G#1","G#1","G#1","G#1","G#1","G#1",
            "G#1","G#1","G#1","G#1","G#1","G#1","G#1","G#1",
            "G#1","G#1","G#1","G#1","G#1","G#1","G#1","G#1",
            "G#1","G#1","G#1","G#1","G#1","G#1","G#1","G#1",

            "C2","C2","C2","C2","C2","C2","C2","C2",
            "C2","C2","C2","C2","C2","C2","C2","C2",
            "E2","E2","E2","E2","E2","E2","E2","E2",
            "E2","E2","E2","E2","E2","E2","E2","E2","M"
        ]);
        this.track_bass.addPattern(section1,null,2*4*7);
    }

    set_track_drum(){
        let drum = this.trigon.baseDrum({ volume: 0.8 });
        let section1 = new Pattern("", 2);
        let pt1 = new Pattern("dr", 2);
        pt1.addPattern(drum,[
            "kick+ohh3","-","kick+ohh","-","snare+ohh","-","ohh","kick","ohh","kick","ohh","kick","snare+ohh","kick","kick+ohh","-",
            "kick+ohh","-","kick+ohh","-","snare+ohh","-","ohh","kick","ohh","kick","ohh","kick","snare+ohh","kick","snare+ohh","snare",

            "kick+ohh3","-","kick+ohh","-","snare+ohh","-","ohh","kick","ohh","kick","ohh","kick","snare+ohh","kick","kick+ohh","-",
            "kick+ohh","-","kick+ohh","-","snare+ohh","kick","kick+ohh","snare","ohh","kick","ohh","kick","snare+ohh","kick","ohh","kick",

            "kick+ohh3","-","kick+ohh","-","snare+ohh","-","ohh","kick","ohh","kick","ohh","kick","snare+ohh","kick","kick+ohh","-",
            "kick+ohh","-","kick+ohh","-","snare+ohh","-","ohh","kick","ohh","kick","ohh","kick","snare+ohh","kick","snare+ohh","snare",

            "kick+ohh3","-","kick+ohh","-","snare+ohh","-","ohh","kick","ohh","kick","ohh","kick","snare+ohh","kick","kick+ohh","-",
            "kick+ohh","-","kick+ohh","-","snare+ohh","kick","kick+ohh","snare","ohh","kick","ohh","kick","snare+ohh","kick","ohh","kick"
        ]);

        section1.addPattern(pt1);
        this.track_drum.addPattern(section1,null,2*4*7);
    }
    create(){
        this.setTrack1();
        this.setTrack2();
        this.setTrack3();
        // this.setTrack4();
        // this.set_track_vocal();
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

            this.track1.onplay=(name,note)=>{
                var rTop = Math.ceil(Math.random() * $(document).height()),
                rLeft = Math.ceil(Math.random() * ($(document).width() - 50)),
                rSize = Math.ceil(Math.random() * (37 - 14) + 14);
                $("<span class='temp'></span>").html(note).hide().css({
                    "top": rTop,
                    "left": rLeft,
                    "color": "rgba(0,0,0,." + Math.random() + ")",
                    "fontSize": rSize + "px"
                }).appendTo("body").fadeIn("slow", function () {
                    $(this).fadeOut("slow", function () {
                        $(this).remove();
                    });
                });
                console.log("track:"+name+" play:"+note);
            };
        });

        
    }
}

var _song=new FirstBorn();
_song.create();
document.getElementById("bt").onclick = ()=>{
    _song.trigon.play();
};
document.getElementById("btStop").onclick = ()=>{
    _song.trigon.stop();
}
document.getElementById("btPause").onclick = ()=>{
    _song.trigon.pause();
}


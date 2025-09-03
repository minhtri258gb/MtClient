`
Performance-test
code:lenshang
2020-09-22
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';
var trigon = new Trigon();
trigon.setBpm(180)
let env = { attack: 0.01, decay: 0.03, hold: 0.2, release: 0.3 }
let delay = { delayTime: 0.5, wet: 0.25, feedback: 0.25 }
let piano = trigon.square({ filter: { type: 'lowpass', frequency: 1500, q: 1 }, env: env, delay: delay, volume: 0.15 })

trigon.setCreate(()=>{
    let section = new Pattern();
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    section.addPattern(piano,["A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4","A4"])
    
    
    var tr=new Pattern();
    tr.addPattern(section);
    tr.addPattern(section);
    tr.addPattern(section);
    tr.addPattern(section);
    tr.addPattern(section);
    tr.addPattern(section);
    tr.addPattern(section);
    tr.addPattern(section);
    tr.addPattern(section);
    trigon.addTrack(tr);

    
});
export default trigon
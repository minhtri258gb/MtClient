`
Untitled world - ReoNa
Code:LenShang
2020-09-27
`
import Trigon from '../core/trigon.js';
import Pattern from '../core/trigon_pattern.js';

export default class{
    constructor(){
        this.trigon = new Trigon();
        this.trigon.speed=1;
        this.trigon.setBpm(185);
        this.track1=new Pattern("track1",4);
        this.track2=new Pattern("track2",4);
        this.track3=new Pattern("track3",4);
        this.trigon.setCreate(()=>{
            this.trigon.addTrack(this.track1);
            this.trigon.addTrack(this.track2);
            this.trigon.addTrack(this.track3);
        });
    }
}
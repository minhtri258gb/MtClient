import Wad from './wad/main';
function findIndexFromPitchArray(note){
    return Wad.pitchesArray.indexOf(note)
}

function notePitchShift(note,pitchshift){
    let p=findIndexFromPitchArray(note);
    if(p<0){
        return note;
    }
    p+=pitchshift;
    while(p<0){
        p+=12;
    }
    while(p>=Wad.pitchesArray.length){
        p-=12;
    }
    // if(p<0){
    //     p+=12;
    // }
    // if(p>=Wad.pitchesArray.length){
        
    // }
    return Wad.pitchesArray[p]
}
export {findIndexFromPitchArray,notePitchShift}
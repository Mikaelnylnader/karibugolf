export type GolfProduct = {
 name:string; brand:string; price:string; set:string; shafts:string; flexes:string[];
 gallery:{src:string;alt:string;label:string}[];
 features:{title:string;text:string}[];
 source:string; specs:string[][]; lifestyle:string;
};
export const p790:GolfProduct={
 name:"P790 Irons",brand:"TaylorMade",price:"KSh 130,000",set:"4–PW",shafts:"Steel",flexes:["Stiff (S)","Regular (R)"],
 gallery:[
 {src:"/images/p790-back.jpg",alt:"P790 iron back with brushed metal finish",label:"Back"},
 {src:"/images/p790-face.jpg",alt:"P790 iron viewed at address",label:"Address"},
 {src:"/images/p790-address.jpg",alt:"P790 grooved clubface",label:"Face"},
 {src:"/images/p790-sole.jpg",alt:"P790 sole and speed pocket",label:"Sole"},
 {src:"/images/p790-course.webp",alt:"P790 iron beside a golf ball on the course",label:"On course"}
 ],
 lifestyle:"/images/p790-course.webp",
 features:[
 {title:"Speed where it matters",text:"A forged 4340M face is designed for ball speed and a generous hitting area."},
 {title:"Feel, from the inside out",text:"SpeedFoam™ Air and individually tuned heads support a responsive, forged feel."},
 {title:"A flight for every iron",text:"FLTD CG™ varies the centre of gravity through the set to balance launch and distance gaps."},
 {title:"A clean look at address",text:"A slim top line and refined sole geometry combine a compact appearance with smooth turf interaction."}
 ],
 source:"https://www.taylormadegolf.eu/P%E2%88%99790-Irons/DW-TC635.html?lang=en_DE",
 specs:[["4","20°","61°","38.50\""],["5","23°","61.5°","38.00\""],["6","26.5°","62°","37.50\""],["7","30°","62.5°","37.00\""],["8","34°","63°","36.50\""],["9","39°","63.5°","36.00\""],["PW","44°","64°","35.75\""]]
};

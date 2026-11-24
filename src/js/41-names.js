/* ================= NAMES ================= */
const ANIMALS=[['Otter','🦦'],['Fox','🦊'],['Panda','🐼'],['Frog','🐸'],['Lion','🦁'],['Octopus','🐙'],['Owl','🦉'],['Koala','🐨'],['Tiger','🐯'],['Dolphin','🐬'],['Penguin','🐧'],['Rabbit','🐰'],['Turtle','🐢'],['Whale','🐳'],['Bee','🐝'],['Unicorn','🦄']];
const ADJ=['Brave','Clever','Curious','Happy','Mighty','Speedy','Sunny','Swift','Bright','Kind','Lucky','Cosmic','Zesty','Bold','Gentle','Super'];
const nameOpts=()=>shuffle(ANIMALS).slice(0,6).map(a=>({nick:`${pick(ADJ)} ${a[0]} ${10+Math.floor(Math.random()*90)}`,avatar:a[1]}));

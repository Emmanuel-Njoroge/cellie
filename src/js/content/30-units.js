/* ================= CONTENT ================= */
const C=(q,opts,a,why)=>({t:'choice',q,opts,a,why});
const T=(q,a,why)=>({t:'tf',q,a,why});
const M=(q,pairs,why)=>({t:'match',q,pairs,why});
const O=(q,items,why)=>({t:'order',q,items,why});
const S_=(q,zones,items,why)=>({t:'sort',q,zones,items,why});
const F=(q,bank,a,why)=>({t:'fill',q,bank,a,why});
const LS=(id,title,learn,fact,qs)=>({id,title,learn,fact,qs});
const CMP=(h,r)=>({h,r});
const FLOW=a=>a;

const UNITS=[
{id:'cells',title:'Cells and DNA',desc:'The tiny building blocks of life',color:'#8b5cf6',dark:'#6d3fd1',icon:'🔬',sticker:'🧫',stickerName:'Cell Scout',lv:{
 b:[
  LS('cells-b-1','What is a cell?',{def:"A cell is a tiny part that living things are made of. You are made of cells!",pts:["Cells are too tiny to see with your eyes.","A microscope makes tiny things look big."],vis:'cell'},"Your body has trillions of cells!",[
   C("What are you made of?",["Cells","Bricks","Paper"],0,"Your whole body is made of tiny cells."),
   T("Cells are very, very tiny.",true,"You need a microscope to see most cells."),
   C("Which tool shows tiny cells?",["Microscope 🔬","Ruler 📏","Spoon 🥄"],0,"A microscope makes tiny things look bigger."),
   S_("Sort: tiny or big?",["Tiny","Big"],[["Cell 🔬",0],["Elephant 🐘",1],["Germ 🦠",0],["Tree 🌳",1]],"Cells and germs are tiny. Elephants and trees are big!")]),
  LS('cells-b-2','Inside a cell',{def:"A cell has a control center called the nucleus. It tells the cell what to do.",pts:["The nucleus is like the cell's brain.","A thin skin called the membrane wraps the cell."],vis:'cell'},"Cells come in many shapes and jobs.",[
   F("The ___ is the cell's control center.",["nucleus","wheel","sock"],0,"The nucleus gives the cell its instructions."),
   M("Match the cell part",[["Nucleus","Control center"],["Membrane","Cell skin"]],"The nucleus is the boss and the membrane is the skin."),
   T("A cell has a control center.",true,"It is called the nucleus."),
   C("The nucleus is like the cell's...",["Brain","Foot","Hat"],0,"It tells the cell what to do.")])],
 i:[
  LS('cells-i-1','Cells, tissues, organs',{def:"All living things are made of cells. Similar cells group into tissues, tissues form organs, and organs work together in organ systems.",pts:["Human cells come in many types: muscle, nerve, skin, and red blood cells.","Scientists estimate roughly 30 to 37 trillion cells in a human body."],flow:[['🔬','Cell'],['🧵','Tissue'],['🫀','Organ'],['🩺','Organ system'],['🧍','Body']]},"Estimates of your cell count are still being improved by scientists.",[
   O("Order from smallest to largest",["Cell","Tissue","Organ","Organ system"],"Cells make tissues, tissues make organs, organs make systems."),
   C("Roughly how many cells are in a human body?",["About 30 trillion","About 3 thousand","About 300 million","About 5"],0,"Estimates range from about 30 to 37 trillion."),
   T("All cells in your body are exactly alike.",false,"Different cell types have different shapes and jobs."),
   M("Match the level to an example",[["Cell","One red blood cell"],["Tissue","Muscle tissue"],["Organ","Heart"],["Organ system","Circulatory system"]],"Each level is built from the one before it."),
   S_("Sort each example",["Organ","Organ system"],[["Stomach",0],["Respiratory system",1],["Brain",0],["Nervous system",1]],"Organs work together inside organ systems.")]),
  LS('cells-i-2','Inside the cell',{def:"Organelles are tiny structures with special jobs. The nucleus holds DNA, mitochondria release energy the cell can use, and the cell membrane controls what goes in and out.",pts:["Mature human red blood cells have no nucleus, which leaves room for oxygen."],vis:'cell',cmp:CMP(['Part','Job','Think of it as...'],[['Nucleus','Holds DNA','Control center'],['Mitochondria','Release energy','Power plant'],['Cell membrane','Controls entry and exit','Gate and wall']])},"One cell's DNA is about 2 meters long if stretched out.",[
   M("Match each part to its job",[["Nucleus","Holds DNA"],["Mitochondria","Releases energy"],["Cell membrane","Controls what enters and leaves"]],"Each organelle has a special job."),
   F("Most of a cell's DNA is stored in the ___.",["nucleus","membrane","skeleton"],0,"DNA is packaged in the nucleus."),
   T("Mature human red blood cells do not have a nucleus.",true,"Losing the nucleus leaves more room to carry oxygen."),
   C("Which organelle is called the cell's power plant?",["Mitochondria","Nucleus","Membrane","Cytoplasm"],0,"Mitochondria release the energy cells use."),
   S_("Sort the cell part",["Control center","Power plant"],[["Nucleus",0],["Holds DNA",0],["Mitochondria",1],["Releases energy",1]],"The nucleus controls and mitochondria power.")])],
 x:[
  LS('cells-x-1','DNA, genes, proteins',{def:"DNA stores instructions as a sequence of bases (A, T, C, G). A gene is a stretch of DNA that codes for a protein. Humans have about 3 billion base pairs, packaged into 46 chromosomes in most body cells.",pts:["Base pairing: A with T, and C with G.","Proteins such as enzymes and antibodies do much of the cell's work."],vis:'dna',cmp:CMP(['Term','Meaning'],[['DNA','Molecule that stores genetic information'],['Gene','Segment of DNA coding for a protein'],['Chromosome','Tightly packaged piece of DNA']])},"Almost every cell in your body has the same DNA.",[
   M("Match the term",[["DNA","Stores genetic information"],["Gene","Segment that codes for a protein"],["Chromosome","Packaged piece of DNA"],["Base pair","A-T or C-G pairing"]],"These four terms describe how information is stored."),
   C("How many chromosomes are in most human body cells?",["46","23","92","10"],0,"23 pairs gives 46."),
   T("In DNA, A pairs with T and C pairs with G.",true,"Base pairing is the rule that lets DNA be copied."),
   F("A gene carries instructions for building a ___.",["protein","bone only","vitamin"],0,"Genes code for proteins."),
   S_("DNA or protein?",["DNA","Protein"],[["Stores genetic instructions",0],["Built from amino acids",1],["Double helix shape",0],["Enzymes and antibodies",1]],"DNA holds the plan and proteins carry out the work.")]),
  LS('cells-x-2','Cells at work',{def:"Mitochondria make ATP, the energy molecule cells use, through cellular respiration. The membrane is selectively permeable. Homeostasis means keeping internal conditions stable.",pts:["Breathing, gas exchange, and cellular respiration are three different things."],cmp:CMP(['Process','What it does'],[['Breathing','Moves air in and out of the lungs'],['Gas exchange','Moves gases between air and blood'],['Cellular respiration','Releases energy inside cells']]),flow:[['🔬','Cell'],['🧵','Tissue'],['🫀','Organ'],['🩺','Organ system'],['🧍','Organism']]},"Human mitochondria even have their own small circular DNA.",[
   C("Which molecule do mitochondria make for cell energy?",["ATP","DNA","Hemoglobin","Plasma"],0,"ATP is the energy currency of the cell."),
   T("Breathing and cellular respiration are the same process.",false,"Breathing moves air. Cellular respiration releases energy inside cells."),
   M("Match the process",[["Breathing","Moves air in and out"],["Gas exchange","Moves gases between air and blood"],["Cellular respiration","Releases energy in cells"]],"Three steps, three different places."),
   O("Order the levels of organization",["Cell","Tissue","Organ","Organ system","Organism"],"Each level builds on the one below."),
   S_("Which process?",["Breathing","Cellular respiration"],[["Diaphragm moves",0],["Happens in mitochondria",1],["Air flows down the trachea",0],["Makes ATP",1]],"One moves air. The other makes energy.")])]
}},
{id:'heart',title:'Heart and Blood',desc:'Your amazing body pump',color:'#ef4444',dark:'#c52b2b',icon:'❤️',sticker:'🫀',stickerName:'Heart Hero',lv:{
 b:[
  LS('heart-b-1','Your heart',{def:"Your heart is a muscle that pumps blood around your body.",pts:["Put your hand on your chest. Feel it go thump-thump!","Your heart is about as big as your fist."],vis:'heart'},"Your heart beats about 100,000 times every day.",[
   C("What does your heart do?",["Pumps blood","Eats food","Sees things"],0,"The heart pushes blood to every part of you."),
   T("Your heart is about as big as your fist.",true,"A heart is roughly the size of its owner's fist."),
   T("Your heart stops when you sleep.",false,"It keeps beating all night."),
   F("Your ___ pumps blood.",["heart","knee","ear"],0,"The heart is the pump.")]),
  LS('heart-b-2','Blood',{def:"Blood is a red liquid that moves around your body. It carries oxygen from the air.",pts:["Red blood cells carry oxygen.","White blood cells help keep you well.","Platelets help close cuts."],vis:'blood'},"Your bone marrow makes new blood cells all the time.",[
   M("Match the blood part",[["Red cells","Carry oxygen"],["White cells","Fight germs"],["Platelets","Close cuts"]],"Blood is a team."),
   C("What color is blood?",["Red","Green","Blue"],0,"Red blood cells make blood look red."),
   T("Platelets help a cut stop bleeding.",true,"They stick together and help make a scab."),
   S_("Sort: part of blood or not?",["Part of blood","Not blood"],[["Red blood cell",0],["Platelet",0],["Shoe 👟",1],["Banana 🍌",1]],"Blood has red cells, white cells, platelets, and liquid.")])],
 i:[
  LS('heart-i-1','The circulatory loop',{def:"The heart has four chambers. The two upper chambers (atria) receive blood. The two lower chambers (ventricles) pump it out. Valves keep blood flowing one way.",pts:["A heart beats about 100,000 times a day.","Blood travels through arteries, capillaries, and veins."],vis:'heart',cmp:CMP(['','Arteries','Veins'],[['Blood moves','Away from the heart','Back to the heart'],['Walls','Thick and stretchy','Thinner'],['Valves','Not usually','Yes, to stop backflow']])},"Your heart pumps about 2,000 gallons of blood every day.",[
   C("Which chambers pump blood out of the heart?",["Ventricles","Atria","Valves","Veins"],0,"Ventricles are the strong pumping chambers."),
   M("Match the vessel to its job",[["Arteries","Carry blood away from the heart"],["Veins","Carry blood toward the heart"],["Capillaries","Tiny vessels where oxygen is exchanged"]],"Capillaries connect arteries and veins."),
   T("Valves make sure blood flows in one direction.",true,"Valves act like one-way doors."),
   O("Order the blood's trip",["Heart pumps blood out","Arteries carry it","Capillaries deliver oxygen","Veins bring it back"],"The trip repeats with every heartbeat."),
   S_("Artery or vein?",["Artery","Vein"],[["Carries blood away from heart",0],["Has valves to stop backflow",1],["Thick, stretchy walls",0],["Carries blood back to heart",1]],"Arteries leave the heart and veins return to it.")]),
  LS('heart-i-2','Your blood',{def:"Blood is plasma (the liquid part) plus cells. Red cells carry oxygen using hemoglobin, white cells defend the body, and platelets help blood clot.",pts:["Plasma is about 55% of your blood.","Red blood cells live about 120 days."],vis:'blood',cmp:CMP(['','Red cells','White cells','Platelets'],[['Main job','Carry oxygen','Fight germs','Form clots'],['Helper','Hemoglobin','Antibodies','Clotting proteins']])},"Your bone marrow makes about two million red blood cells every second.",[
   C("About how much of your blood is liquid plasma?",["About 55%","About 5%","About 99%","About 0%"],0,"The rest of blood is cells."),
   T("Red blood cells live about 120 days.",true,"Your body keeps making new ones."),
   M("Match each blood part to its job",[["Red blood cells","Carry oxygen"],["White blood cells","Fight infection"],["Platelets","Help blood clot"],["Plasma","Carries cells and nutrients"]],"Each part has a different job."),
   F("Hemoglobin is a protein in red blood cells that carries ___.",["oxygen","sugar","calcium"],0,"Hemoglobin binds oxygen in the lungs."),
   S_("Which cell?",["Red blood cell","White blood cell"],[["Carries oxygen",0],["Fights infections",1],["Has hemoglobin",0],["Part of the immune system",1]],"Red cells transport and white cells defend.")])],
 x:[
  LS('heart-x-1','Double circulation',{def:"Blood flows in two loops. The pulmonary loop sends blood from the right side of the heart to the lungs. The systemic loop sends oxygen-rich blood from the left side to the body.",pts:["Right side pumps to the lungs. Left side pumps to the body.","The aorta is the largest artery."],vis:'heart',cmp:CMP(['','Pulmonary loop','Systemic loop'],[['From','Right ventricle','Left ventricle'],['To','Lungs','Body tissues'],['Purpose','Pick up oxygen','Deliver oxygen']])},"Blood can travel through the whole system in about a minute.",[
   O("Order one full circuit (start at the right ventricle)",["Right ventricle","Lungs","Left atrium","Left ventricle","Body tissues"],"Right side to lungs, left side to body."),
   C("Which chamber pumps oxygen-rich blood to the body?",["Left ventricle","Right atrium","Left atrium","Right ventricle"],0,"The left ventricle has the thickest wall."),
   T("The pulmonary loop carries blood to the lungs.",true,"There it picks up oxygen and releases carbon dioxide."),
   S_("Pulmonary or systemic?",["Pulmonary loop","Systemic loop"],[["Heart to lungs",0],["Heart to body",1],["Picks up oxygen",0],["Delivers oxygen to tissues",1]],"Two loops, two jobs."),
   M("Match the term",[["Atria","Receiving chambers"],["Ventricles","Pumping chambers"],["Aorta","Largest artery"],["Valves","One-way doors"]],"These parts move blood in one direction.")]),
  LS('heart-x-2','Blood and homeostasis',{def:"Hemoglobin binds oxygen. Platelets and clotting proteins seal wounds. Bone marrow makes blood cells. Heart rate rises with exercise so the oxygen supply matches demand.",pts:["Plasma is about 55% of blood volume.","Red blood cells have lost their nucleus when mature."],cmp:CMP(['','Red cell','White cell','Platelet'],[['Nucleus','No (mature)','Yes','No (cell fragment)'],['Role','Oxygen transport','Immune defense','Clotting'],['Lifespan','About 120 days','Hours to years','About 8 to 12 days']])},"Bone marrow is the main factory for blood cells in adults.",[
   C("Where are most blood cells made?",["Bone marrow","Liver only","Skin","Lungs"],0,"Red bone marrow produces blood cells."),
   T("Mature red blood cells lack a nucleus.",true,"That leaves more room for hemoglobin."),
   F("During exercise, heart rate rises to meet higher ___ demand.",["oxygen","vitamin","sleep"],0,"Working muscles need more oxygen."),
   M("Match",[["Hemoglobin","Binds oxygen"],["Platelets","Form plugs and clots"],["Plasma","Liquid portion"],["Bone marrow","Makes blood cells"]],"Together these keep the body supplied."),
   S_("Which cell?",["Red blood cell","White blood cell"],[["No nucleus when mature",0],["Part of immune defense",1],["Contains hemoglobin",0],["Includes B and T cells",1]],"Red cells transport and white cells defend.")])]
}},
{id:'lungs',title:'Lungs and Breathing',desc:'How air gives you power',color:'#0ea5e9',dark:'#0b82b8',icon:'🫁',sticker:'🌬️',stickerName:'Breath Boss',lv:{
 b:[
  LS('lungs-b-1','Breathing',{def:"Your lungs help you breathe. You breathe in air with oxygen. You breathe out carbon dioxide.",pts:["You have two lungs.","Your lungs are in your chest.","A muscle called the diaphragm helps you breathe."],vis:'lungs'},"You breathe about 20,000 times a day.",[
   C("What do your lungs help you do?",["Breathe","Jump","Hear"],0,"Lungs move air in and out."),
   T("You have two lungs.",true,"One on each side of your chest."),
   F("You breathe in ___ from the air.",["oxygen","pizza","sand"],0,"Oxygen is the part of air your body uses."),
   O("Tap in order: the air's trip",["Nose","Windpipe","Lungs"],"Air goes in your nose, down the windpipe, and into your lungs.")]),
  LS('lungs-b-2','Healthy lungs',{def:"We keep our lungs healthy with clean air and playing outside.",pts:["Cover your cough with your elbow.","Running makes you breathe fast."]},"A doctor can listen to your lungs with a stethoscope.",[
   T("Running makes you breathe faster.",true,"Your body needs more oxygen when you move."),
   S_("Good or not for lungs?",["Good 👍","Not good 👎"],[["Fresh air 🌳",0],["Playing outside ⚽",0],["Smoke 🚬",1],["Dusty air 🌫️",1]],"Clean air is best for lungs."),
   C("When you cough, cover with your...",["Elbow","Hair","Shoe"],0,"This stops germs from spreading."),
   C("A doctor listens to lungs with a...",["Stethoscope","Spoon","Brush"],0,"A stethoscope carries sounds to the doctor's ears.")])],
 i:[
  LS('lungs-i-1','Gas exchange',{def:"Air travels down the trachea into the bronchi, then into tiny air sacs called alveoli. In the alveoli, oxygen moves into the blood and carbon dioxide moves out.",pts:["The diaphragm contracts and flattens to pull air in.","Each lung has hundreds of millions of alveoli."],vis:'lungs'},"If spread flat, all your alveoli would cover a huge area.",[
   O("Order the air's path",["Nose or mouth","Trachea","Bronchi","Alveoli"],"Tubes branch into smaller and smaller paths."),
   C("Where does oxygen move into the blood?",["Alveoli","Trachea","Diaphragm","Ribs"],0,"Alveoli are the exchange surface."),
   T("When you breathe in, your diaphragm contracts and flattens.",true,"This makes the chest bigger so air flows in."),
   M("Match the part",[["Trachea","Windpipe"],["Alveoli","Tiny air sacs"],["Diaphragm","Muscle that helps you inhale"],["Bronchi","Two tubes into the lungs"]],"Each part has its job."),
   S_("Which way does the gas move?",["Into the blood","Out of the blood"],[["Oxygen from the alveoli",0],["Carbon dioxide from cells",1],["Oxygen for hemoglobin",0],["Waste gas to breathe out",1]],"Oxygen goes in and carbon dioxide leaves.")]),
  LS('lungs-i-2','Breathing in action',{def:"Breathing rate changes with activity. Exercise makes cells use more oxygen, so you breathe faster and your heart beats faster. Mucus and tiny hairs called cilia trap dust.",pts:["Gas exchange happens by diffusion: gases move from high to low concentration."],cmp:CMP(['','Inhale','Exhale'],[['Diaphragm','Contracts and flattens','Relaxes and rises'],['Ribs','Move up and out','Move down and in'],['Chest volume','Gets bigger','Gets smaller']])},"Hiccups happen when your diaphragm twitches suddenly.",[
   C("During exercise, why do you breathe faster?",["Cells need more oxygen","Lungs are shrinking","Blood stops moving","The diaphragm is tired"],0,"Working muscles use more oxygen."),
   T("Breathing out happens when the diaphragm relaxes.",true,"The chest gets smaller and air flows out."),
   S_("Inhale or exhale?",["Inhale","Exhale"],[["Diaphragm contracts",0],["Diaphragm relaxes",1],["Chest volume increases",0],["Chest volume decreases",1]],"Both steps are controlled by pressure changes."),
   C("What do cilia and mucus in your airways do?",["Trap dust and germs","Make oxygen","Pump blood","Store carbon dioxide"],0,"They keep the lungs cleaner."),
   F("Gas exchange happens by ___.",["diffusion","digestion","vibration"],0,"Gases move from high to low concentration.")])],
 x:[
  LS('lungs-x-1','Ventilation mechanics',{def:"On inhale, the diaphragm and external intercostal muscles contract, the chest volume increases, pressure drops, and air flows in. Exhale reverses the steps.",pts:["Air always flows from high pressure to low pressure.","Ventilation (moving air) is not the same as gas exchange."],vis:'lungs',cmp:CMP(['','Inhale','Exhale'],[['Diaphragm','Contracts, flattens','Relaxes, rises'],['Intercostals','Contract: ribs up and out','Relax: ribs down and in'],['Lung pressure','Falls below outside air','Rises above outside air']])},"The diaphragm and rib muscles do the work. The lungs have no muscle of their own.",[
   O("Order the steps of inhalation",["Diaphragm contracts","Chest volume increases","Pressure falls","Air flows in"],"Volume up means pressure down."),
   T("Air flows from areas of high pressure to low pressure.",true,"That is why a pressure drop pulls air in."),
   S_("Inhale or exhale?",["Inhale","Exhale"],[["Pressure in lungs falls",0],["Diaphragm relaxes and rises",1],["Ribs move up and out",0],["Lungs recoil elastically",1]],"The two phases are opposites."),
   C("Which structure is the site of gas exchange?",["Alveoli","Trachea","Bronchi","Larynx"],0,"Only the alveoli are thin enough."),
   M("Match the term",[["Ventilation","Moving air in and out"],["Diffusion","Gases move high to low"],["Alveolus","Thin-walled air sac"],["Capillary","Tiny vessel next to alveoli"]],"These terms describe how exchange works.")]),
  LS('lungs-x-2','Efficient gas exchange',{def:"Alveoli have a large combined surface area, very thin walls, and a rich blood supply. Each lung has roughly 250 to 300 million alveoli (estimates vary). Breathing keeps the oxygen gradient steep.",pts:["A steep concentration gradient makes diffusion faster."],vis:'lungs'},"A large surface area helps gases cross faster.",[
   C("Which feature makes alveoli good for gas exchange?",["Very thin walls","Thick walls","Few blood vessels","Small surface area"],0,"Thin walls mean a short diffusion distance."),
   T("Having many alveoli gives a large surface area.",true,"More area means faster exchange."),
   F("Gases cross the alveolar wall by ___.",["diffusion","pumping","digesting"],0,"Diffusion needs no energy."),
   M("Match the adaptation to its benefit",[["Large surface area","Faster exchange"],["Thin walls","Short diffusion distance"],["Many capillaries","Keeps the gradient steep"],["Ventilation","Brings fresh air"]],"Every adaptation speeds exchange."),
   S_("Helps or hurts exchange?",["Helps","Hurts"],[["Many alveoli",0],["Thin alveolar walls",0],["Damaged alveoli",1],["Fluid in the alveoli",1]],"Less surface area or a longer distance slows exchange.")])]
}},
{id:'brain',title:'Brain and Nerves',desc:'Your body\'s control center',color:'#f59e0b',dark:'#c97d00',icon:'🧠',sticker:'💡',stickerName:'Brain Boss',lv:{
 b:[
  LS('brain-b-1','Your brain',{def:"Your brain is the boss of your body. It helps you think, feel, and move.",pts:["Your skull protects your brain.","Your brain works even while you sleep."],vis:'brain'},"Your brain has billions of tiny nerve cells.",[
   C("What is the boss of your body?",["Brain","Elbow","Toe"],0,"The brain tells your body what to do."),
   T("Your brain works while you sleep.",true,"It keeps your heart and breathing going."),
   C("What protects your brain?",["Skull","Sock","Cup"],0,"Your skull is like a helmet."),
   S_("Does it help keep your brain safe?",["Yes","No"],[["Helmet ⛑️",0],["Good sleep 😴",0],["Bumping your head 💥",1],["Staying up all night 🦉",1]],"Helmets and sleep help your brain.")]),
  LS('brain-b-2','Five senses',{def:"Your senses tell your brain about the world. You have five: sight, hearing, smell, taste, and touch.",pts:["Eyes see. Ears hear. Noses smell.","Tongues taste. Skin feels touch."]},"Your skin is your biggest sense organ.",[
   M("Match the body part",[["Eyes 👀","See"],["Ears 👂","Hear"],["Nose 👃","Smell"]],"Each part is for one sense."),
   C("Which body part helps you taste?",["Tongue","Knee","Ear"],0,"Your tongue has taste buds."),
   T("Your skin helps you feel touch.",true,"Skin has nerves that feel."),
   S_("Which sense?",["Hear","See"],[["Music 🎵",0],["Rainbow 🌈",1],["Bell 🔔",0],["Balloon 🎈",1]],"Ears hear sounds. Eyes see things.")])],
 i:[
  LS('brain-i-1','Brain regions',{def:"The brain has parts with different jobs. The cerebrum handles thinking, memory, and senses. The cerebellum helps with balance. The brain stem controls breathing and heartbeat.",pts:["The brain and spinal cord make the central nervous system.","Nerves carry messages to and from the body."],vis:'brain'},"Your skull and spinal column protect your central nervous system.",[
   M("Match each brain part",[["Cerebrum","Thinking and memory"],["Cerebellum","Balance"],["Brain stem","Breathing and heartbeat"]],"Each region has special jobs."),
   T("The central nervous system includes the brain and spinal cord.",true,"Nerves outside it form the peripheral system."),
   C("Which part helps you keep your balance on a bike?",["Cerebellum","Cerebrum","Skull","Heart"],0,"The cerebellum coordinates balance."),
   O("Order a message when you catch a ball",["Eyes sense the ball","Nerves send signals","Brain decides","Muscles move"],"Senses, nerves, brain, and muscles work as a team."),
   S_("Which brain part?",["Cerebrum","Brain stem"],[["Memory",0],["Heartbeat",1],["Problem solving",0],["Breathing",1]],"The stem keeps life-support jobs running.")]),
  LS('brain-i-2','Neurons',{def:"Neurons are nerve cells. Dendrites receive messages, the axon carries them away, and the synapse is the gap where chemicals called neurotransmitters pass the message on.",pts:["Scientists estimate about 86 billion neurons in a human brain."],vis:'neuron'},"Some axons are wrapped in myelin, which speeds up signals.",[
   M("Match the neuron part",[["Dendrites","Receive signals"],["Axon","Carries signals away"],["Synapse","Gap between neurons"],["Neurotransmitter","Chemical messenger"]],"A signal passes through all four."),
   C("About how many neurons are in the human brain?",["About 86 billion","About 86 thousand","About 86 million","About 86"],0,"Scientists estimate about 86 billion."),
   T("A synapse is a tiny gap where one neuron signals the next.",true,"Chemicals cross the gap."),
   O("Order the signal",["Dendrites receive","Signal travels the axon","Neurotransmitters released","Next neuron receives"],"This happens in a flash."),
   F("The long part of a neuron that carries signals away is the ___.",["axon","dendrite","nucleus"],0,"Axons can be very long.")])],
 x:[
  LS('brain-x-1','Neural signaling',{def:"A neuron receives input at its dendrites. If the signal reaches a threshold, an action potential travels down the axon. At the synapse, neurotransmitters cross the gap and bind to receptors on the next cell.",pts:["Many axons are insulated by a myelin sheath that speeds signals."],vis:'neuron',cmp:CMP(['Part','Role'],[['Dendrites','Main input'],['Axon','Carries the action potential'],['Axon terminals','Release neurotransmitters'],['Receptors','Bind neurotransmitters']])},"Most of a neuron's synapses are on its dendrites.",[
   O("Order the signal",["Dendrites receive input","Action potential travels the axon","Neurotransmitters released","Receptors on next neuron bind"],"Electrical, then chemical, then electrical again."),
   C("What insulates many axons and speeds signals?",["Myelin sheath","Plasma","Cartilage","Keratin"],0,"Myelin lets signals travel faster."),
   T("Neurotransmitters are chemical messengers.",true,"They cross the synaptic gap."),
   M("Match",[["Soma","Cell body"],["Axon terminal","Releases neurotransmitters"],["Receptor","Binds neurotransmitters"],["Action potential","Electrical signal along the axon"]],"Each term names a step."),
   S_("Input or output side?",["Input","Output"],[["Dendrites",0],["Axon",1],["Receptors on dendrites",0],["Axon terminals",1]],"Dendrites receive and axons send.")]),
  LS('brain-x-2','Nervous system and homeostasis',{def:"The central nervous system (brain and spinal cord) processes information. The peripheral nervous system carries signals. Sensory neurons carry information in and motor neurons carry commands out. Reflexes are quick because they use short spinal pathways.",pts:["Homeostasis means keeping internal conditions stable."],cmp:CMP(['','Sensory neuron','Motor neuron'],[['Carries','Information toward the CNS','Commands away from the CNS'],['Example','Detects heat on skin','Tells a muscle to contract']])},"A reflex can start moving your hand before you feel pain.",[
   M("Match",[["CNS","Brain and spinal cord"],["PNS","Nerves throughout the body"],["Sensory neuron","Carries information inward"],["Motor neuron","Carries commands to muscles"]],"Two systems and two neuron types."),
   T("A reflex can happen before the brain is aware of the stimulus.",true,"The spinal cord can process it first."),
   S_("Sensory or motor?",["Sensory neuron","Motor neuron"],[["Detects heat on skin",0],["Tells a muscle to contract",1],["Carries information inward",0],["Carries commands outward",1]],"Sense in, act out."),
   O("Order a reflex arc",["Receptor detects stimulus","Sensory neuron signals","Spinal cord processes","Motor neuron triggers muscle"],"A short path gives a quick response."),
   C("Which process keeps internal conditions such as temperature stable?",["Homeostasis","Mutation","Fossilization","Erosion"],0,"The nervous system helps maintain it.")])]
}},
{id:'germs',title:'Germs and Defenders',desc:'How your body stays well',color:'#22a06b',dark:'#177a50',icon:'🛡️',sticker:'🦠',stickerName:'Germ Fighter',lv:{
 b:[
  LS('germs-b-1','Germs',{def:"Germs are tiny living things. Some can make us sick, but washing hands helps!",pts:["Germs are too tiny to see.","Soap and water wash germs away."],vis:'germs'},"Not all germs are bad. Some help your tummy.",[
   T("We can see most germs with our eyes.",false,"Germs are too tiny to see."),
   O("Wash your hands in order",["Wet","Soap and scrub","Rinse","Dry"],"Wet, lather, scrub, rinse, dry."),
   C("How long should you scrub?",["20 seconds","1 second","1 hour"],0,"That is about two Happy Birthday songs."),
   S_("Wash your hands?",["Yes, wash!","No need"],[["Before eating 🍎",0],["After the bathroom 🚽",0],["After sneezing 🤧",0],["Looking at clouds ☁️",1]],"Wash before eating and after the bathroom or sneezing.")]),
  LS('germs-b-2','Body defenders',{def:"Your body has defenders called white blood cells. Vaccines help your body practice for fighting germs.",pts:["Vaccines are like practice for your body.","Sleep, food, and clean hands help you stay well."],flow:[['💉','A vaccine'],['🧠','Body learns'],['🛡️','Ready to fight']]},"Your immune system has cells that remember germs.",[
   C("Who defends your body from germs?",["White blood cells","Shoes","Hair"],0,"White blood cells are defenders."),
   T("A vaccine helps your body practice.",true,"It teaches your body to spot a germ."),
   M("Match",[["Soap","Washes germs"],["Rest","Helps you heal"],["Vaccine","Practice for your body"]],"Many things help you stay well."),
   C("If you feel sick, what should you do?",["Tell a grown-up","Hide it","Run away"],0,"A grown-up can get you help.")])],
 i:[
  LS('germs-i-1','Germs and body defenses',{def:"Pathogens are germs that cause disease. Bacteria are single-celled living things. Viruses are much smaller and must use a living cell to make copies.",pts:["Antibiotics work on bacteria, not viruses.","CDC handwashing: wet, lather, scrub for 20 seconds, rinse, dry."],vis:'germs',cmp:CMP(['','Bacteria','Viruses'],[['Living cell?','Yes, single cell','No, need a host cell'],['Size','Bigger','Much smaller'],['Antibiotics','Can work','Do not work']])},"Some bacteria are helpful, like those that help digest food.",[
   M("Match the word",[["Pathogen","Germ that causes disease"],["Bacteria","Single-celled organisms"],["Virus","Needs a host cell to copy itself"],["Antibody","Protein that targets germs"]],"These four words come up in every sick day."),
   T("Antibiotics kill bacteria but do not work on viruses.",true,"Doctors choose a medicine that fits the germ."),
   S_("Bacteria or virus?",["Bacteria","Virus"],[["Single-celled living thing",0],["Needs a host cell to multiply",1],["Antibiotics can treat many infections",0],["Much smaller than bacteria",1]],"They are different kinds of germs."),
   C("What best prevents the spread of germs?",["Washing hands with soap for 20 seconds","Sharing cups","Skipping sleep","Wiping hands on clothes"],0,"Soap and scrubbing lift germs away."),
   O("Order the CDC handwashing steps",["Wet","Lather","Scrub 20 seconds","Rinse","Dry"],"Drying matters too: germs spread more easily from wet hands.")]),
  LS('germs-i-2','The immune response',{def:"White blood cells, antibodies, and memory cells make up your immune response. A vaccine shows your immune system a harmless piece or weak form of a germ so it can build memory.",pts:["Antibodies are proteins made by B cells.","Memory cells let the body respond faster next time."],flow:[['💉','Vaccine shows a harmless antigen'],['🧬','B cells make antibodies'],['🧠','Memory cells remember'],['🛡️','Faster defense next time']]},"The first vaccine was made in 1796 by Edward Jenner.",[
   O("Order how a vaccine builds protection",["Vaccine shows a harmless antigen","Body makes antibodies","Memory cells form","Faster defense later"],"Vaccines train the immune system."),
   C("What are antibodies?",["Proteins that help target germs","Tiny bones","Red blood cells","Bacteria"],0,"Each antibody matches a specific antigen."),
   T("Vaccines train the immune system without causing the full disease.",true,"They use a weak or harmless part of a germ."),
   M("Match",[["Antigen","Part of a germ the body detects"],["B cell","Makes antibodies"],["Memory cell","Remembers a germ"],["Fever","Response that may help fight infection"]],"Each piece plays a role."),
   S_("Vaccine or antibiotic?",["Vaccine","Antibiotic"],[["Prevents future illness",0],["Treats bacterial infection",1],["Builds memory cells",0],["Does not work on viruses",1]],"One prevents and one treats.")])],
 x:[
  LS('germs-x-1','Pathogens and defenses',{def:"Innate defenses (skin, mucus, inflammation, fever) respond quickly to anything harmful. Adaptive defenses (B and T cells) target specific antigens and build memory.",pts:["B cells produce antibodies. T cells help coordinate or destroy infected cells."],vis:'germs',cmp:CMP(['','Innate','Adaptive'],[['Speed','Fast','Slower the first time'],['Target','General','Specific antigen'],['Memory','No','Yes']])},"Skin is one of your best innate defenses.",[
   M("Match",[["Innate immunity","Fast, general defense"],["Adaptive immunity","Specific and builds memory"],["B cells","Produce antibodies"],["T cells","Coordinate or destroy infected cells"]],"Two layers of defense."),
   T("Antibiotics are effective against viral infections like the flu.",false,"Antibiotics target bacteria."),
   S_("Innate or adaptive?",["Innate","Adaptive"],[["Skin barrier",0],["Memory cells",1],["Mucus trapping germs",0],["Specific antibodies",1]],"Innate is general and adaptive is specific."),
   C("Which cells produce antibodies?",["B cells (as plasma cells)","Red blood cells","Platelets","Neurons"],0,"B cells develop into antibody-producing cells."),
   O("Order an adaptive response",["Antigen detected","B and T cells activate","Antibodies and killer cells act","Memory cells remain"],"Memory cells make the next response faster.")]),
  LS('germs-x-2','Vaccines and public health',{def:"Vaccines use weakened or inactivated germs, or parts of them, to create immune memory without causing the disease. When many people are immune, germs spread less, which also protects people who cannot be vaccinated.",pts:["Overusing antibiotics can contribute to resistant bacteria."],cmp:CMP(['Vaccine type','Contains'],[['Live-attenuated','Weakened live germ'],['Inactivated','Killed germ'],['Toxoid','Inactivated toxin']])},"Some vaccines need boosters because the germ changes or protection fades.",[
   M("Match the vaccine type",[["Live-attenuated","Weakened live germ"],["Inactivated","Killed germ"],["Toxoid","Inactivated toxin"]],"Each type triggers memory in a different way."),
   T("Widespread immunity can protect people who cannot be vaccinated.",true,"Germs have fewer people to spread to."),
   C("What does immunological memory allow?",["A faster response on re-exposure","No need for white blood cells","Permanent fever","Resistance to antibiotics"],0,"Memory cells launch a quicker defense."),
   F("Vaccines train the immune system without causing the full ___.",["disease","growth","sleep"],0,"They give memory without the illness."),
   S_("Vaccine or antibiotic?",["Vaccine","Antibiotic"],[["Stimulates antibody production",0],["Stops or kills bacteria",1],["Given to prevent disease",0],["Overuse can cause resistance",1]],"Different tools for different jobs.")])]
}},
{id:'bones',title:'Bones and Muscles',desc:'What holds you up and moves you',color:'#ec4899',dark:'#c02a79',icon:'🦴',sticker:'💪',stickerName:'Strong Mover',lv:{
 b:[
  LS('bones-b-1','Bones',{def:"Bones make a frame called a skeleton. Your skeleton holds you up and protects your insides.",pts:["Your skull protects your brain.","Your ribs protect your heart and lungs.","Milk helps bones grow strong."],vis:'arm'},"Babies are born with about 300 soft bones.",[
   C("What holds your body up?",["Skeleton","Pillow","Sock"],0,"Your skeleton is your body's frame."),
   M("Match the bones",[["Skull","Protects brain"],["Ribs","Protect heart and lungs"],["Spine","Helps you stand tall"]],"Bones protect important parts."),
   T("Bones can heal if they break.",true,"Bones are alive and can grow back together."),
   S_("Good for strong bones?",["Yes","No"],[["Milk 🥛",0],["Playing 🏃",0],["Too much candy 🍬",1],["Never moving 🛋️",1]],"Calcium and play help bones.")]),
  LS('bones-b-2','Muscles',{def:"Muscles help you move. They squeeze and relax to pull your bones.",pts:["Your heart is a muscle.","Playing and stretching keep muscles strong."],vis:'arm'},"You have more than 600 muscles.",[
   T("Muscles help you move.",true,"They pull on your bones."),
   C("Which muscle never gets a long rest?",["Heart","Ear","Hair"],0,"The heart beats all day and night."),
   F("Muscles ___ to pull your bones.",["squeeze","sing","melt"],0,"A muscle that squeezes pulls."),
   S_("Does it help muscles?",["Yes","No"],[["Running 🏃",0],["Stretching 🤸",0],["Lying still all day 🛌",1],["Never playing 🚫",1]],"Moving keeps muscles strong.")])],
 i:[
  LS('bones-i-1','Your skeleton',{def:"An adult has 206 bones. Babies are born with about 300 that fuse as they grow. Bones support and protect the body, store calcium, and bone marrow makes blood cells.",pts:["Tendons connect muscle to bone. Ligaments connect bone to bone."],vis:'arm',cmp:CMP(['','Tendon','Ligament'],[['Connects','Muscle to bone','Bone to bone'],['Helps','Muscles pull bones','Joints stay stable']])},"Bones are living tissue that keeps renewing itself.",[
   C("About how many bones does an adult have?",["206","106","306","56"],0,"Adults have 206 bones."),
   T("Babies have fewer bones than adults.",false,"Babies have about 300, and many fuse together."),
   M("Match",[["Skull","Protects the brain"],["Rib cage","Protects heart and lungs"],["Bone marrow","Makes blood cells"],["Calcium","Mineral that strengthens bones"]],"Bones do many jobs."),
   S_("Tendon or ligament?",["Tendon","Ligament"],[["Connects muscle to bone",0],["Connects bone to bone",1],["Helps muscles pull bones",0],["Stabilizes a joint",1]],"Tendons pull and ligaments steady."),
   C("Where are blood cells made?",["Bone marrow","Stomach","Skin","Hair"],0,"Red bone marrow makes blood cells.")]),
  LS('bones-i-2','Your muscles',{def:"Skeletal muscles move bones and you control them. Smooth muscles work organs like the stomach and you do not control them. Cardiac muscle is only in the heart.",pts:["Muscles work in pairs. When one contracts, the other relaxes."],cmp:CMP(['Type','Where','Control'],[['Skeletal','Attached to bones','Voluntary'],['Smooth','Organs like the stomach','Involuntary'],['Cardiac','Heart only','Involuntary']])},"Muscles need energy from nutrients to contract.",[
   M("Match the muscle type",[["Skeletal","Attached to bones, voluntary"],["Smooth","In organs, involuntary"],["Cardiac","Only in the heart"]],"Three muscle types."),
   T("Skeletal muscles pull on bones through tendons.",true,"Tendons transfer the pull."),
   S_("Voluntary or involuntary?",["Voluntary","Involuntary"],[["Lifting your arm",0],["Heartbeat",1],["Kicking a ball",0],["Stomach squeezing food",1]],"You choose voluntary movements."),
   C("When your biceps contracts, your elbow...",["Bends","Straightens","Disappears","Breaks"],0,"The biceps flexes the elbow."),
   F("Muscles need ___ from food to contract.",["energy","paint","glue"],0,"Energy comes from nutrients.")])],
 x:[
  LS('bones-x-1','Bone tissue',{def:"Bone is living tissue that remodels throughout life. Osteoblasts build bone and osteoclasts break it down. Bone marrow produces blood cells and bone stores calcium.",pts:["Fusion reduces the bone count from about 300 at birth to 206 in adults."],vis:'arm',cmp:CMP(['Cell or tissue','Job'],[['Osteoblast','Builds new bone'],['Osteoclast','Breaks down old bone'],['Bone marrow','Makes blood cells'],['Cartilage','Flexible tissue at joints']])},"Your skeleton is about 20% of your body weight.",[
   C("Why do babies have more bones than adults?",["Some bones fuse as they grow","Bones disappear","Babies grow extra arms","Bones turn into muscle"],0,"Many small bones join together."),
   T("Bone is living tissue that can remodel and heal.",true,"Cells keep building and removing bone."),
   M("Match",[["Osteoblasts","Build new bone"],["Osteoclasts","Break down old bone"],["Bone marrow","Makes blood cells"],["Cartilage","Flexible tissue at joints"]],"Bone constantly renews."),
   S_("Bone-to-bone or muscle-to-bone?",["Bone-to-bone","Muscle-to-bone"],[["Ligament",0],["Tendon",1],["Joint stability",0],["Pulling force",1]],"Ligaments steady joints and tendons transfer pull."),
   F("The skeleton stores the mineral ___.",["calcium","helium","neon"],0,"Calcium also helps nerves and muscles.")]),
  LS('bones-x-2','Muscle systems',{def:"Skeletal muscle contracts to pull on bones. Muscles often work in antagonistic pairs, like biceps and triceps. Muscle contraction requires ATP. Cardiac muscle contracts without conscious control.",pts:["Smooth muscle lines organs such as the intestines."],vis:'arm',cmp:CMP(['Muscle','Action at the elbow'],[['Biceps','Flexes (bends)'],['Triceps','Extends (straightens)']])},"Muscle needs lots of mitochondria because contraction uses ATP.",[
   O("Order how a muscle moves a bone",["Brain sends a signal","Motor neuron activates muscle","Muscle contracts using ATP","Bone moves at the joint"],"Nerves, muscles, and bones work together."),
   M("Match",[["Biceps","Flexes the elbow"],["Triceps","Extends the elbow"],["Tendon","Attaches muscle to bone"],["ATP","Energy for contraction"]],"Opposite muscles work as a pair."),
   T("Antagonistic muscle pairs work in opposite directions.",true,"One contracts while the other relaxes."),
   S_("Voluntary or involuntary?",["Voluntary","Involuntary"],[["Skeletal muscle",0],["Cardiac muscle",1],["Smooth muscle in the intestine",1],["Lifting a book",0]],"Cardiac and smooth muscle work automatically."),
   C("What supplies energy for muscle contraction?",["ATP from mitochondria","Calcium only","Plasma only","Cartilage"],0,"Cells make ATP from nutrients and oxygen.")])]
}}
];

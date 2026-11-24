/* ================= CURRICULUM: textbook chapters, short videos, challenge rounds ================= */
const CHL=(id,title,fact,qs)=>LS(id,title,{def:"Boss round! This mixes everything from the chapter and lessons. Tap the 💡 button any time to open the guide.",pts:[]},fact,qs);
const BK=(title,short,pages,vocab)=>({title,short,pages,vocab});
const EX={
cells:{
 book:{
  b:BK("Chapter 1: Meet the Cell","Meet the Cell",[["Tiny, tiny cells","You are made of cells. They are so small that you cannot see them with your eyes. A microscope helps us look.",'cell'],["The boss of the cell","Inside a cell is a nucleus. The nucleus is the boss. It tells the cell what to do."],["Cells have jobs","Some cells carry oxygen. Some help you move. Some send messages to your brain."]],[["cell","A tiny part of living things"],["nucleus","The cell's boss"],["microscope","A tool to see tiny things"]]),
  i:BK("Chapter 1: Cells and Organization","Cells and Organization",[["Cell theory","Scientists agree that all living things are made of cells, and that cells come from other cells. Most cells are far too small to see without a microscope."],["Organelles","Inside each cell are organelles. The nucleus stores DNA. Mitochondria release energy. The membrane controls what enters and leaves.",'cell'],["Levels of organization","Similar cells form tissues, tissues form organs, and organs form organ systems. Your body has trillions of cells working together."]],[["organelle","A tiny structure with a job inside a cell"],["tissue","A group of similar cells"],["organ system","Organs that work together"],["mitochondria","Organelles that release energy"]]),
  x:BK("Chapter 1: From DNA to Cell Function","From DNA to Function",[["The genetic code","DNA is a double helix built from four bases: A, T, C, and G. A pairs with T and C pairs with G. A gene is a stretch of DNA that carries the instructions for one protein.",'dna'],["Proteins do the work","Cells read genes to build proteins such as enzymes, antibodies, and hemoglobin. Most human body cells hold 46 chromosomes in the nucleus."],["Energy and homeostasis","Mitochondria make ATP through cellular respiration. Cells keep conditions inside them steady, which is called homeostasis.",'cell']],[["gene","DNA segment that codes for a protein"],["protein","Molecule that does most of the cell's work"],["ATP","Energy molecule made by mitochondria"],["homeostasis","Keeping internal conditions stable"]])},
 vid:{
  b:[['cell','🔬',"Welcome! Let's shrink down and meet a cell."],['cell','🧫',"A cell is a tiny part that living things are made of."],['cell','🧠',"The nucleus is the cell's boss. It gives the cell its instructions."],[null,'🧍',"You are made of trillions of cells working together. Great job!"]],
  i:[['cell','🔬',"Every living thing is made of cells."],['cell','⚡',"Mitochondria release energy the cell can use."],['cell','🧬',"The nucleus holds the DNA, the cell's instructions."],[null,'🫀',"Cells form tissues, tissues form organs, and organs form systems."]],
  x:[['dna','🧬',"DNA stores information in a sequence of four bases: A, T, C, and G."],['dna','🔗',"A pairs with T and C pairs with G, so DNA can be copied accurately."],['cell','🏭',"Genes are read to make proteins, the workers of the cell."],['cell','⚡',"Mitochondria make ATP, the energy that powers the whole cell."]]},
 ch:{
  b:CHL('cells-b-3','Cell challenge',"Mitochondria are called power plants because they make most of a cell's energy.",[
   T("Cells make up plants and animals.",true,"All living things are made of cells."),
   C("A cell's control center is the...",["Nucleus","Knee","Nose"],0,"The nucleus is the cell's boss."),
   S_("Do you need a microscope?",["Yes 🔬","No 👀"],[["See a cell",0],["See a dog 🐕",1],["See a germ",0],["See a tree 🌳",1]],"Cells and germs are too small to see."),
   F("Cells are the building ___ of your body.",["blocks","clouds","shoes"],0,"Cells put together make you!"),
   C("What tool makes tiny things look big?",["Microscope","Spoon","Pillow"],0,"A microscope magnifies."),
   M("Match the part",[["Nucleus","Boss"],["Membrane","Skin"],["Cell","Tiny building block"]],"Every part has a job.")]),
  i:CHL('cells-i-3','Cell challenge',"A red blood cell is about ten times thinner than a human hair.",[
   C("Which is the smallest level of organization?",["Cell","Organ","Tissue","Organ system"],0,"Cells are the basic units of life."),
   T("The cell membrane controls what enters and leaves the cell.",true,"It acts like a gate."),
   S_("Which level of organization?",["Tissue","Organ"],[["Muscle tissue",0],["Heart",1],["Nerve tissue",0],["Kidney",1]],"Tissues are groups of cells. Organs combine tissues."),
   F("The ___ releases energy for the cell.",["mitochondria","membrane","nucleus"],0,"Mitochondria power the cell."),
   O("Order from smallest to largest",["Organelle","Cell","Tissue","Organ"],"Organelles are inside cells."),
   M("Match the level",[["Organelle","Tiny part inside a cell"],["Tissue","Group of similar cells"],["Organ","Tissues working together"],["Organ system","Organs working together"]],"Each level builds on the last.")]),
  x:CHL('cells-x-3','Cell challenge',"Mitochondria make most of a cell's ATP, which is why they are called the power plants.",[
   C("What is the role of a gene?",["Codes for a protein","Stores oxygen","Pumps blood","Digests food"],0,"Genes carry instructions for proteins."),
   T("Humans have about 3 billion DNA base pairs in one set of chromosomes.",true,"That is a very long instruction manual."),
   S_("Where does it happen?",["Nucleus","Mitochondria"],[["DNA is stored",0],["ATP is made",1],["Chromosomes are found",0],["Cellular respiration",1]],"The nucleus stores and mitochondria power."),
   F("Cells keep stable internal conditions through ___.",["homeostasis","evaporation","erosion"],0,"Homeostasis keeps conditions steady."),
   O("Order from gene to function",["Gene in DNA","Protein is built","Protein does a job","Cell function changes"],"Genes lead to proteins, and proteins do the work."),
   M("Match",[["ATP","Cell energy molecule"],["Chromosome","Packaged DNA"],["Enzyme","Protein that speeds reactions"],["Mitochondrion","Makes ATP"]],"Each term links DNA to energy and work.")])}
},
heart:{
 book:{
  b:BK("Chapter 2: Your Heart","Your Heart",[["A strong pump","Your heart is a muscle about the size of your fist. It pumps blood all around your body.",'heart'],["Blood to the rescue","Blood carries oxygen to every part of you. Red cells carry oxygen. White cells fight germs. Platelets close cuts.",'blood'],["Keep it healthy","Playing, running, and eating good food help your heart stay strong."]],[["heart","The muscle that pumps blood"],["blood","Red liquid that carries oxygen"],["oxygen","Air your body needs"]]),
  i:BK("Chapter 2: The Circulatory System","The Circulatory System",[["Four chambers","The heart has four chambers. The two atria receive blood and the two ventricles pump it out. Valves keep blood moving one way.",'heart'],["Vessels","Arteries carry blood away from the heart, veins carry it back, and tiny capillaries exchange oxygen and nutrients with cells."],["Blood","Blood is plasma plus red cells, white cells, and platelets. Red cells carry oxygen using hemoglobin.",'blood']],[["atrium","Upper chamber that receives blood"],["ventricle","Lower chamber that pumps blood out"],["artery","Vessel carrying blood away from the heart"],["vein","Vessel carrying blood to the heart"]]),
  x:BK("Chapter 2: Circulation and Homeostasis","Circulation and Homeostasis",[["Two loops","The right side of the heart pumps blood to the lungs (pulmonary loop). The left side pumps oxygen-rich blood to the body (systemic loop).",'heart'],["Blood composition","Plasma makes up about 55% of blood. Mature red blood cells lack a nucleus and live about 120 days. Platelets help form clots.",'blood'],["Matching supply and demand","During exercise, heart rate and breathing rate rise so that oxygen delivery matches the muscles' demand."]],[["pulmonary","Relating to the lungs"],["systemic","Relating to the whole body"],["hemoglobin","Protein that binds oxygen"],["plasma","Liquid part of blood"]])},
 vid:{
  b:[['heart','❤️',"Thump-thump! That is your heart."],['heart','💪',"It is a muscle that pumps blood around your body."],['blood','🩸',"Blood carries oxygen. Red cells carry it, and white cells fight germs."],[null,'🏃',"Playing and moving keeps your heart strong!"]],
  i:[['heart','❤️',"The heart has four chambers: two atria on top and two ventricles below."],['heart','🚪',"Valves are one-way doors that keep blood moving forward."],['blood','🩸',"Arteries carry blood away, veins carry it back, and capillaries swap oxygen."],['blood','🔴',"Red cells carry oxygen, white cells defend, and platelets clot."]],
  x:[['heart','🫀',"The right side pumps blood to the lungs to pick up oxygen."],['heart','🔁',"The left side pumps oxygen-rich blood to the body's tissues."],['blood','🩸',"Hemoglobin in red blood cells binds oxygen for transport."],['blood','📈',"Exercise raises heart rate so oxygen supply matches demand."]]},
 ch:{
  b:CHL('heart-b-3','Heart challenge',"A baby's heart beats faster than a grown-up's heart.",[
   C("What carries oxygen in blood?",["Red blood cells","Platelets","Plasma only"],0,"Red cells deliver oxygen."),
   T("Your heart is a muscle.",true,"It squeezes to pump blood."),
   F("The heart ___ blood around your body.",["pumps","paints","eats"],0,"The heart is the pump."),
   S_("Good for your heart?",["Helps 💖","Not good"],[["Running 🏃",0],["Good food 🥦",0],["Too much sitting 🛋️",1],["Too much junk food 🍟",1]],"Movement and healthy food help your heart."),
   M("Match",[["White cells","Fight germs"],["Red cells","Carry oxygen"],["Heart","Pumps blood"]],"Each part has a job."),
   O("Follow the blood",["Heart pumps","Blood travels","Body gets oxygen"],"The heart starts the trip.")]),
  i:CHL('heart-i-3','Heart challenge',"At rest, your heart moves about 5 liters of blood around your body every minute.",[
   C("Which vessels carry blood away from the heart?",["Arteries","Veins","Capillaries","Valves"],0,"Arteries leave the heart."),
   T("Capillaries are where oxygen and nutrients move into cells.",true,"Their walls are very thin."),
   F("Platelets help blood ___.",["clot","freeze","glow"],0,"Clots plug a wound."),
   S_("Which chamber?",["Atrium","Ventricle"],[["Receives blood",0],["Pumps blood out",1],["Upper chamber",0],["Lower chamber",1]],"Atria receive and ventricles pump."),
   M("Match",[["Plasma","Liquid part of blood"],["Hemoglobin","Carries oxygen"],["Valve","One-way door"],["Capillary","Tiny exchange vessel"]],"These parts keep blood moving and working."),
   O("Order the heart's job",["Atria receive blood","Ventricles squeeze","Blood leaves through arteries","Veins return blood"],"The cycle repeats with every beat.")]),
  x:CHL('heart-x-3','Heart challenge',"Most adults have a resting heart rate between 60 and 100 beats per minute.",[
   C("Which loop carries blood to the lungs?",["Pulmonary","Systemic","Digestive","Lymphatic"],0,"The pulmonary loop goes to the lungs."),
   T("The left ventricle has a thicker wall than the right ventricle.",true,"It pumps blood to the whole body."),
   F("Mature red blood cells have no ___.",["nucleus","oxygen","membrane"],0,"No nucleus leaves more room for hemoglobin."),
   S_("Artery or vein?",["Artery","Vein"],[["High pressure",0],["Contains valves",1],["Thick muscular wall",0],["Returns blood to the heart",1]],"Arteries handle pressure and veins use valves."),
   O("Order the systemic loop",["Left ventricle","Aorta","Capillaries in tissues","Veins","Right atrium"],"Blood returns to the right side of the heart."),
   M("Match",[["Aorta","Largest artery"],["Vena cava","Large vein to the heart"],["Pulmonary artery","Carries blood to the lungs"],["Bone marrow","Blood cell factory"]],"Large vessels connect the loops.")])}
},
lungs:{
 book:{
  b:BK("Chapter 3: Breathing","Breathing",[["Breathe in, breathe out","You breathe in oxygen from the air. You breathe out carbon dioxide. Your lungs do this all day and night.",'lungs'],["Two lungs","You have two lungs in your chest. A muscle called the diaphragm helps them move."],["Healthy lungs","Fresh air and playing outside are good for your lungs. Cover your cough with your elbow."]],[["lungs","Organs that help you breathe"],["oxygen","Air your body uses"],["diaphragm","Muscle that helps you breathe"]]),
  i:BK("Chapter 3: The Respiratory System","The Respiratory System",[["The path of air","Air enters the nose or mouth, then travels down the trachea, through the bronchi, and into tiny air sacs called alveoli.",'lungs'],["Gas exchange","In the alveoli, oxygen moves into the blood and carbon dioxide moves out. This happens by diffusion."],["Breathing mechanics","When you inhale, your diaphragm contracts and flattens, making the chest bigger so air flows in. Exhaling reverses the process."]],[["trachea","The windpipe"],["bronchi","Tubes that lead into each lung"],["alveoli","Tiny air sacs for gas exchange"],["diffusion","Movement from high to low concentration"]]),
  x:BK("Chapter 3: Ventilation and Gas Exchange","Ventilation and Gas Exchange",[["Pressure drives airflow","When you inhale, the diaphragm and intercostal muscles contract, chest volume rises, pressure falls, and air flows in. Air always flows from high to low pressure.",'lungs'],["Built for exchange","Each lung has roughly 250 to 300 million alveoli (estimates vary). Thin walls, a huge surface area, and many capillaries make diffusion fast."],["Breathing is not respiration","Breathing moves air, gas exchange moves gases between air and blood, and cellular respiration releases energy in cells."]],[["ventilation","Moving air in and out"],["surface area","Total area available for exchange"],["concentration gradient","Difference that drives diffusion"],["cellular respiration","Releasing energy inside cells"]])},
 vid:{
  b:[['lungs','🫁',"Take a big breath in. Now breathe out!"],['lungs','🌬️',"Your lungs take in oxygen from the air."],['lungs','💨',"They send out carbon dioxide when you breathe out."],[null,'🌳',"Fresh air and play keep lungs healthy."]],
  i:[['lungs','👃',"Air enters your nose, then flows down the trachea."],['lungs','🌳',"The trachea splits into bronchi that lead into each lung."],['lungs','🎈',"In tiny air sacs called alveoli, oxygen moves into your blood."],['lungs','💨',"Carbon dioxide moves out and you breathe it away."]],
  x:[['lungs','⬇️',"The diaphragm contracts, chest volume rises, and pressure falls."],['lungs','🌬️',"Air flows in from high pressure to low pressure."],['lungs','🫧',"Alveoli have thin walls and a huge surface area for diffusion."],['lungs','🩸',"Capillaries keep the gradient steep by carrying oxygen away."]]},
 ch:{
  b:CHL('lungs-b-3','Lung challenge',"You can hold your breath for a little while, but your brain makes you breathe again.",[
   C("What do you breathe out?",["Carbon dioxide","Pizza","Rain"],0,"You breathe out carbon dioxide."),
   T("Your lungs are in your chest.",true,"They sit inside your rib cage."),
   F("Your ___ helps you breathe by moving up and down.",["diaphragm","sock","tooth"],0,"The diaphragm is a breathing muscle."),
   O("The air's path",["Nose","Windpipe","Lungs","Blood gets oxygen"],"Air ends up giving oxygen to your blood."),
   S_("Good air or not?",["Good 😊","Not good 😷"],[["Clean air 🌳",0],["Open windows 🪟",0],["Smoke 🚬",1],["Heavy dust 🌫️",1]],"Clean air keeps lungs healthy."),
   M("Match",[["Lungs","Breathe"],["Nose","Air goes in"],["Diaphragm","Helps lungs move"]],"Each part helps you breathe.")]),
  i:CHL('lungs-i-3','Lung challenge',"Your right lung is a little bigger than your left to make room for your heart.",[
   C("What is the scientific name for the windpipe?",["Trachea","Alveolus","Bronchus","Capillary"],0,"The trachea carries air to the bronchi."),
   T("Alveoli have very thin walls.",true,"Thin walls let gases cross quickly."),
   F("Oxygen enters the blood in the ___.",["alveoli","stomach","skull"],0,"Alveoli are the exchange surface."),
   S_("Inhale or exhale?",["Inhale","Exhale"],[["Air flows in",0],["Air flows out",1],["Diaphragm flattens",0],["Diaphragm rises",1]],"Opposite steps."),
   M("Match",[["Bronchi","Branches into the lungs"],["Cilia","Tiny hairs that sweep dust"],["Mucus","Traps germs and dust"],["Diffusion","Movement from high to low concentration"]],"Airways have cleaning tools."),
   O("Order the air's journey",["Air enters nose","Trachea","Bronchi","Alveoli","Oxygen enters blood"],"Each step leads deeper into the lungs.")]),
  x:CHL('lungs-x-3','Lung challenge',"The left lung has two lobes and the right lung has three.",[
   C("Which process releases energy inside cells?",["Cellular respiration","Ventilation","Gas exchange","Digestion"],0,"It happens in mitochondria."),
   T("A larger surface area makes gas exchange faster.",true,"More area means more diffusion at once."),
   F("Air flows from high pressure to ___ pressure.",["low","same","green"],0,"Pressure differences move air."),
   S_("Ventilation or gas exchange?",["Ventilation","Gas exchange"],[["Diaphragm contracts",0],["Oxygen crosses the alveolar wall",1],["Air moves down the trachea",0],["Carbon dioxide diffuses into alveoli",1]],"One moves air and one moves gases."),
   O("Order the exchange",["Air reaches alveoli","Oxygen diffuses into capillary","Hemoglobin binds oxygen","Blood carries oxygen to tissues"],"Oxygen travels from air to cells."),
   M("Match",[["Intercostal muscles","Move the ribs"],["Concentration gradient","Drives diffusion"],["Alveolar capillary","Carries oxygen away"],["Trachea","Main airway"]],"Each term explains part of breathing.")])}
},
brain:{
 book:{
  b:BK("Chapter 4: Your Brain","Your Brain",[["The boss","Your brain is the boss of your body. It helps you think, feel, and move.",'brain'],["Five senses","Eyes see, ears hear, noses smell, tongues taste, and skin feels touch. Your senses send messages to your brain."],["Keep it safe","Your skull protects your brain. Wear a helmet and get lots of sleep."]],[["brain","The boss of your body"],["senses","How you notice the world"],["skull","Bone that protects the brain"]]),
  i:BK("Chapter 4: The Nervous System","The Nervous System",[["Brain regions","The cerebrum handles thinking and memory, the cerebellum helps with balance, and the brain stem controls breathing and heartbeat.",'brain'],["Neurons","Neurons are nerve cells. Dendrites receive signals, the axon carries them, and chemicals called neurotransmitters cross the synapse.",'neuron'],["A message's trip","When you catch a ball, your eyes sense it, nerves send signals to the brain, the brain decides, and muscles move."]],[["neuron","Nerve cell"],["synapse","Gap between neurons"],["cerebrum","Thinking part of the brain"],["cerebellum","Balance part of the brain"]]),
  x:BK("Chapter 4: Neural Signaling","Neural Signaling",[["Action potentials","If input at the dendrites reaches a threshold, an action potential travels down the axon. Myelin insulates many axons and speeds the signal.",'neuron'],["Synapses","At the axon terminal, neurotransmitters cross the synaptic gap and bind to receptors on the next cell."],["Organizing the nervous system","The CNS (brain and spinal cord) processes information. Sensory neurons carry information in and motor neurons carry commands out. Reflexes use short spinal pathways.",'brain']],[["action potential","Electrical signal along an axon"],["myelin","Insulation that speeds signals"],["receptor","Protein that binds a neurotransmitter"],["reflex arc","Fast pathway through the spinal cord"]])},
 vid:{
  b:[['brain','🧠',"Meet your brain, the boss of your body!"],['brain','👀',"Your senses tell your brain what is happening."],['brain','🏃',"Your brain tells your muscles to move."],[null,'⛑️',"Protect your brain with a helmet and sleep."]],
  i:[['brain','🧠',"The cerebrum handles thinking and memory."],['brain','🚲',"The cerebellum keeps your balance."],['neuron','⚡',"Neurons pass messages using electrical and chemical signals."],['neuron','🔗',"The gap between neurons is called a synapse."]],
  x:[['neuron','⚡',"Dendrites receive input. At threshold, an action potential fires."],['neuron','💨',"Myelin insulates the axon so signals travel faster."],['neuron','🧪',"Neurotransmitters cross the synapse and bind to receptors."],['brain','🔁',"Reflex arcs use short spinal pathways for quick responses."]]},
 ch:{
  b:CHL('brain-b-3','Brain challenge',"Your brain keeps learning new things every day, even when you are grown up.",[
   C("Which sense uses your ears?",["Hearing","Smell","Taste"],0,"Ears let you hear."),
   T("Your brain helps you think and feel.",true,"The brain is the control center."),
   F("A ___ protects your brain when you ride a bike.",["helmet","glove","shoe"],0,"Helmets cushion a fall."),
   S_("Which sense?",["Smell 👃","Touch ✋"],[["Flowers 🌸",0],["Soft blanket 🧸",1],["Fresh bread 🍞",0],["Warm water 🛁",1]],"Noses smell and skin feels."),
   M("Match",[["Eyes","See"],["Skin","Feel"],["Tongue","Taste"]],"Each part has a sense."),
   O("A message's trip",["You see a ball","Your brain thinks","You catch it"],"Senses, brain, then muscles.")]),
  i:CHL('brain-i-3','Brain challenge',"The brain uses about one fifth of the body's energy.",[
   C("Which part controls breathing and heartbeat?",["Brain stem","Cerebrum","Cerebellum","Skull"],0,"The brain stem keeps life-support jobs running."),
   T("Neurons pass messages using electrical and chemical signals.",true,"Electrical along the axon, chemical across the synapse."),
   F("A tiny gap between neurons is called a ___.",["synapse","skull","tendon"],0,"Neurotransmitters cross the synapse."),
   S_("Which brain part?",["Cerebrum","Cerebellum"],[["Thinking",0],["Balance",1],["Memory",0],["Coordination",1]],"Cerebrum thinks and cerebellum coordinates."),
   M("Match",[["Dendrite","Receives signals"],["Axon","Sends signals"],["Neurotransmitter","Chemical messenger"],["Spinal cord","Carries signals to the brain"]],"A signal uses all four."),
   O("Order",["Sense organ detects","Nerves carry signal","Brain interprets","Response is sent"],"Detect, carry, think, respond.")]),
  x:CHL('brain-x-3','Brain challenge',"Fast myelinated axons can carry signals at over 100 meters per second.",[
   C("What is the gap between two neurons called?",["Synapse","Soma","Myelin","Tendon"],0,"Signals cross the synapse chemically."),
   T("Myelin makes nerve signals travel faster.",true,"It insulates the axon."),
   F("Motor neurons carry commands to ___.",["muscles","paper","sound"],0,"Motor neurons activate muscles and glands."),
   S_("Sensory or motor?",["Sensory","Motor"],[["Detects stretch in a muscle",0],["Triggers a gland to release",1],["Carries touch information",0],["Activates a muscle",1]],"Sense in, act out."),
   O("Order a neuron signal",["Dendrite input","Threshold reached","Action potential","Neurotransmitter release"],"Input, fire, send."),
   M("Match",[["Receptor","Binds neurotransmitter"],["Reflex arc","Fast spinal pathway"],["CNS","Brain and spinal cord"],["Action potential","Electrical signal"]],"These terms describe nerve signals.")])}
},
germs:{
 book:{
  b:BK("Chapter 5: Germs and Defenders","Germs and Defenders",[["What are germs?","Germs are tiny living things. Some can make us sick. Most are too small to see.",'germs'],["Wash, wash, wash","Wet your hands, add soap, scrub for 20 seconds, rinse, and dry. This washes germs away."],["Body defenders","White blood cells defend your body. Vaccines help your body practice for fighting germs."]],[["germ","A tiny living thing that can make you sick"],["vaccine","Practice for your body"],["white blood cell","A body defender"]]),
  i:BK("Chapter 5: Germs and the Immune System","Germs and Immunity",[["Bacteria and viruses","Bacteria are single-celled living things. Viruses are much smaller and need a host cell to copy themselves. Antibiotics work on bacteria, not viruses.",'germs'],["Immune response","White blood cells and antibodies defend the body. Memory cells remember a germ so the body can respond faster next time."],["Vaccines","A vaccine shows the immune system a harmless piece or weak form of a germ. This builds memory without causing the full disease."]],[["pathogen","Germ that causes disease"],["antibody","Protein that targets a germ"],["antigen","Marker on a germ"],["vaccine","Trains the immune system"]]),
  x:BK("Chapter 5: Immunity and Public Health","Immunity and Public Health",[["Innate and adaptive","Innate defenses such as skin, mucus, and fever act fast and are general. Adaptive defenses use B and T cells to target specific antigens and form memory."],["Vaccine types","Live-attenuated vaccines use a weakened germ, inactivated vaccines use a killed germ, and toxoid vaccines use an inactivated toxin."],["Protecting communities","When many people are immune, germs spread less, which also protects people who cannot be vaccinated. Overusing antibiotics can contribute to resistant bacteria.",'germs']],[["antigen","Molecule the immune system detects"],["antibody","Protein made by plasma cells"],["memory cell","Long-lived cell that remembers an antigen"],["attenuated","Weakened"]])},
 vid:{
  b:[['germs','🦠',"Germs are tiny. You cannot see them."],[null,'🧼',"Soap and water for 20 seconds washes germs away."],[null,'🛡️',"White blood cells defend your body."],[null,'💉',"Vaccines help your body practice. Stay healthy!"]],
  i:[['germs','🦠',"Bacteria are living cells. Viruses need a host cell."],['germs','🧬',"Antibodies are proteins that target germs."],[null,'🧠',"Memory cells remember a germ for next time."],[null,'💉',"Vaccines build memory without causing the full disease."]],
  x:[[null,'🧱',"Innate defenses like skin and mucus respond fast."],['germs','🎯',"Adaptive immunity targets specific antigens."],[null,'💉',"Vaccines train memory cells using weakened, killed, or partial germs."],[null,'🌍',"When many are immune, the whole community is safer."]]},
 ch:{
  b:CHL('germs-b-3','Germ challenge',"Washing your hands is one of the best ways to stop germs.",[
   C("What should you do after sneezing?",["Wash your hands","Nothing","Hide"],0,"Washing removes germs."),
   T("Soap helps wash germs away.",true,"Soap lifts germs off your skin."),
   F("White blood cells ___ your body from germs.",["defend","paint","freeze"],0,"They are your body's defenders."),
   O("Wash your hands",["Wet","Soap","Scrub","Rinse","Dry"],"Dry hands last."),
   S_("Stay healthy?",["Yes 👍","No 👎"],[["Sleep 😴",0],["Wash hands 🧼",0],["Share cups 🥤",1],["Skip washing 🙈",1]],"Sleep and washing help."),
   M("Match",[["Vaccine","Practice for your body"],["Soap","Washes away germs"],["Sleep","Helps you heal"]],"Many things keep you well.")]),
  i:CHL('germs-i-3','Germ challenge',"Most of the bacteria on and in your body are harmless or even helpful.",[
   C("Which germ needs a host cell to multiply?",["Virus","Bacteria","Both","Neither"],0,"Viruses cannot reproduce on their own."),
   T("Memory cells help your body respond faster to a germ it has met before.",true,"That is how immunity lasts."),
   F("An ___ is a protein that targets a germ.",["antibody","antenna","antler"],0,"Antibodies match antigens."),
   S_("Bacteria or virus?",["Bacteria","Virus"],[["Can be treated with antibiotics",0],["Smaller than a bacterium",1],["Single-celled organism",0],["Cannot reproduce alone",1]],"Different germs need different medicines."),
   M("Match",[["Antigen","Marker on a germ"],["Antibody","Targets an antigen"],["White blood cell","Defends the body"],["Fever","Raised body temperature"]],"These are parts of the immune response."),
   O("Order",["Germ enters body","Immune cells detect it","Antibodies are made","Memory cells remain"],"Memory makes the next response faster.")]),
  x:CHL('germs-x-3','Germ challenge',"Smallpox was declared eradicated in 1980 thanks to vaccination.",[
   C("Which vaccine type uses a weakened live germ?",["Live-attenuated","Inactivated","Toxoid","None"],0,"Attenuated means weakened."),
   T("Overusing antibiotics can contribute to resistant bacteria.",true,"Bacteria that survive can pass on resistance."),
   F("B cells develop into plasma cells that make ___.",["antibodies","hormones","bones"],0,"Plasma cells produce antibodies."),
   S_("Innate or adaptive?",["Innate","Adaptive"],[["Fever",0],["T cell response",1],["Stomach acid",0],["Antibody memory",1]],"Innate is general and adaptive is specific."),
   M("Match",[["Community immunity","Fewer people can spread a germ"],["Attenuated","Weakened"],["Toxoid","Inactivated toxin"],["Booster","Extra dose to renew protection"]],"Public health uses all four ideas."),
   O("Order",["Antigen presented","Helper T cells activate B cells","B cells make antibodies","Memory cells form"],"Memory cells give faster protection later.")])}
},
bones:{
 book:{
  b:BK("Chapter 6: Bones and Muscles","Bones and Muscles",[["Your skeleton","Bones make a frame called a skeleton. Your skeleton holds you up and protects your insides.",'arm'],["Muscles move you","Muscles squeeze and relax to pull your bones. Your heart is a muscle too."],["Strong and healthy","Milk, play, and stretching help bones and muscles stay strong."]],[["skeleton","The frame of bones in your body"],["muscle","Tissue that squeezes to move you"],["bone","Hard part of your skeleton"]]),
  i:BK("Chapter 6: The Musculoskeletal System","Bones and Muscles",[["206 bones","Adults have 206 bones. Babies are born with about 300 that fuse as they grow. Bones support, protect, and store calcium. Bone marrow makes blood cells.",'arm'],["Three muscle types","Skeletal muscle moves bones and is voluntary. Smooth muscle works organs and is involuntary. Cardiac muscle is only in the heart."],["Connections","Tendons connect muscle to bone. Ligaments connect bone to bone. Muscles work in pairs."]],[["tendon","Connects muscle to bone"],["ligament","Connects bone to bone"],["marrow","Makes blood cells inside bone"],["voluntary","Under your control"]]),
  x:BK("Chapter 6: Bone and Muscle Physiology","Bone and Muscle Physiology",[["Living bone","Bone remodels all life long: osteoblasts build bone and osteoclasts break it down. Calcium stored in bone supports strength and also nerve and muscle function."],["Muscle contraction","Skeletal muscle contracts when stimulated by a motor neuron, using ATP. Antagonistic pairs like biceps and triceps move a joint in opposite directions.",'arm'],["Control","Skeletal muscle is voluntary. Cardiac and smooth muscle contract without conscious control."]],[["osteoblast","Cell that builds bone"],["osteoclast","Cell that breaks down bone"],["antagonistic pair","Muscles with opposite actions"],["ATP","Energy for contraction"]])},
 vid:{
  b:[['arm','🦴',"Bones make your skeleton."],['arm','💪',"Muscles squeeze to pull your bones."],[null,'🥛',"Milk and play help bones grow strong."],[null,'🏃',"Move every day and keep strong!"]],
  i:[['arm','🦴',"Adults have 206 bones that support and protect."],['arm','🧵',"Tendons connect muscle to bone."],['arm','🔗',"Ligaments connect bone to bone at joints."],[null,'🫀',"Skeletal, smooth, and cardiac are the three muscle types."]],
  x:[[null,'🏗️',"Osteoblasts build bone. Osteoclasts break it down."],['arm','⚡',"A motor neuron signal makes a muscle contract using ATP."],['arm','↔️',"Biceps and triceps work as an antagonistic pair."],[null,'🫀',"Cardiac and smooth muscle work without conscious control."]]},
 ch:{
  b:CHL('bones-b-3','Bone challenge',"Your thighbone is the longest bone in your body.",[
   C("What helps bones grow strong?",["Calcium","Candy only","Sand"],0,"Calcium builds strong bones."),
   T("Your skull protects your brain.",true,"The skull is like a helmet."),
   F("Muscles help you ___.",["move","glow","melt"],0,"Muscles pull on bones."),
   S_("Bone or muscle job?",["Bones","Muscles"],[["Hold you up",0],["Pull to move you",1],["Protect your brain",0],["Squeeze and relax",1]],"Bones support and muscles move."),
   M("Match",[["Ribs","Protect heart and lungs"],["Spine","Helps you stand tall"],["Skull","Protects brain"]],"Bones protect and support."),
   O("Make a move",["Brain sends a message","Muscle squeezes","Bone moves"],"Brain, muscle, bone.")]),
  i:CHL('bones-i-3','Bone challenge',"The smallest bones in your body are in your ears.",[
   C("Which type of muscle is only in the heart?",["Cardiac","Skeletal","Smooth","Bone"],0,"Cardiac muscle forms the heart."),
   T("Ligaments connect bone to bone.",true,"They steady joints."),
   F("Bone ___ makes blood cells.",["marrow","paint","milk"],0,"Red marrow makes blood cells."),
   S_("Voluntary or involuntary?",["Voluntary","Involuntary"],[["Waving hello",0],["Digesting food",1],["Typing",0],["Heartbeat",1]],"You control voluntary actions."),
   M("Match",[["Joint","Where bones meet"],["Tendon","Muscle to bone"],["Ligament","Bone to bone"],["Calcium","Strengthens bone"]],"These parts work together."),
   O("Order",["Signal from brain","Muscle contracts","Tendon pulls bone","Joint moves"],"The signal ends in movement.")]),
  x:CHL('bones-x-3','Bone challenge',"Adult bone is gradually remodeled, so much of your skeleton is replaced over about a decade.",[
   C("Which cells break down old bone?",["Osteoclasts","Osteoblasts","Neurons","Platelets"],0,"Osteoclasts resorb bone."),
   T("Smooth muscle is involuntary.",true,"You do not control it consciously."),
   F("Muscle contraction requires ___.",["ATP","helium","glue"],0,"ATP powers contraction."),
   S_("Which muscle acts?",["Elbow flexion","Elbow extension"],[["Biceps contracts",0],["Triceps contracts",1],["Bends the arm",0],["Straightens the arm",1]],"Antagonistic pairs oppose each other."),
   M("Match",[["Osteoblast","Builds bone"],["Tendon","Muscle to bone"],["Cartilage","Cushions joints"],["Motor neuron","Activates muscle"]],"Bone, muscle, and nerve cooperate."),
   O("Order",["Motor neuron fires","Calcium released in muscle","Muscle contracts","Joint moves"],"Nerve signal to joint movement.")])}
}
};
UNITS.forEach(u=>{const e=EX[u.id];u.book=e.book;u.vid=e.vid;LVK.forEach(k=>u.lv[k].push(e.ch[k]))});

const SOURCES=[
 ['National Geographic: how many cells are in your body','https://www.nationalgeographic.com/science/article/how-many-cells-are-in-your-body'],
 ['Iowa Heart Foundation: human heart facts','https://www.iowaheartfoundation.org/upl/downloads/library/activity-sheet-human-heart-facts.pdf'],
 ['Hackensack Meridian Health: heart anatomy 101','https://www.hackensackmeridianhealth.org/HealthU/2019/02/04/know-your-heart-anatomy-101'],
 ['Save My Exams: the lungs and gas exchange','https://www.savemyexams.com/gcse/biology/aqa/18/revision-notes/2-organisation/2-2-organisation-the-cardiovascular-and-respiratory-system/2-2-1-the-lungs/'],
 ['Biological Psychology (pressbooks): structure of the neuron','https://rotel.pressbooks.pub/biologicalpsychology/chapter/the-structure-of-the-neuron/'],
 ['Yale Medicine: vaccine basics','https://www.yalemedicine.org/news/vaccine-basics'],
 ['Live Science: how do vaccines work?','https://www.livescience.com/32617-how-do-vaccines-work.html'],
 ['Minnesota Dept. of Health: how vaccines work','https://www.health.mn.gov/communities/rih/ell/lesson3.pdf'],
 ['American Lung Association: handwashing (CDC steps)','https://www.lung.org/about-us/blog/2018/12/clean-hands-healthy-lungs.html'],
 ['Next Generation Science Standards (California)','https://www2.cde.ca.gov/cacs/science?c0=16&c1=4'],
 ['Wikipedia: human musculoskeletal system','https://en.wikipedia.org/wiki/Human_musculoskeletal_system']
];
const lessonsFor=(u,lv)=>u.lv[lv];
const allFor=lv=>{const a=[];UNITS.forEach((u,ui)=>lessonsFor(u,lv).forEach((l,li)=>a.push({u,l,ui,li})));return a};

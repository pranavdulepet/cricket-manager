(() => {
  const SETTINGS = {
    // IPL 2024 rules: 25-player squad cap, 8 overseas in squad, 4 overseas playing
    // This simulation uses 16-player squads (162 players ÷ 10 teams ≈ 16)
    version: 4,
    storageKey: "cricket-manager-autosave-v4",
    initialPurse: 120,
    minimumBid: 0.20,    // ₹20 lakh — IPL minimum base price
    squadSize: 16,       // Target squad size per team
    minSquadSize: 14,    // Minimum before auction can end
    maxOverseas: 8,      // IPL rule: max 8 overseas players in squad
    maxPlayingOverseas: 4, // IPL rule: max 4 overseas in playing XI
    roleTargets: {
      WK: 2,   // 1 first-choice + 1 backup gloveman
      BAT: 5,  // top-order + middle-order core
      AR: 3,   // all-rounders
      BWL: 6,  // pace and spin depth
    },
  };

  const DIFFICULTIES = {
    owner: {
      id: "owner",
      label: "Owner Box",
      description: "Rivals overreact more often and leave extra value in the room.",
      aiDiscipline: 0.92,
      aiBoost: -0.35,
      bluffFactor: 0.86,
      seasonVariance: 1.08,
    },
    warRoom: {
      id: "warRoom",
      label: "War Room",
      description: "Balanced live auction with disciplined but readable rival behavior.",
      aiDiscipline: 1,
      aiBoost: 0,
      bluffFactor: 1,
      seasonVariance: 1,
    },
    shark: {
      id: "shark",
      label: "Shark Tank",
      description: "Rivals read scarcity correctly and punish loose budget control.",
      aiDiscipline: 1.08,
      aiBoost: 0.35,
      bluffFactor: 1.14,
      seasonVariance: 0.92,
    },
  };

  const SPEEDS = {
    broadcast: {
      id: "broadcast",
      label: "Broadcast",
      openingClock: 8.2,
      resetClock: 4.9,
    },
    rapid: {
      id: "rapid",
      label: "Rapid",
      openingClock: 6,
      resetClock: 3.7,
    },
    lightning: {
      id: "lightning",
      label: "Lightning",
      openingClock: 4.6,
      resetClock: 2.8,
    },
  };

  const FRANCHISES = [
    {
      id: "csk",
      name: "Chennai Super Kings",
      short: "CSK",
      colors: { primary: "#f4bf27", secondary: "#073763" },
      strategyLabel: "Dynasty Control",
      aggression: 0.58,
      bargainBias: 0.55,
      bluffBias: 0.24,
      youthBias: 0.25,
      indianBias: 0.74,
      starBias: 0.44,
      patience: 0.72,
      focusTags: ["anchor", "spin", "captain", "glovework"],
    },
    {
      id: "mi",
      name: "Mumbai Indians",
      short: "MI",
      colors: { primary: "#2b7fff", secondary: "#d5a63f" },
      strategyLabel: "Star Stockpiler",
      aggression: 0.76,
      bargainBias: 0.34,
      bluffBias: 0.38,
      youthBias: 0.5,
      indianBias: 0.55,
      starBias: 0.82,
      patience: 0.48,
      focusTags: ["marquee", "finisher", "death", "ceiling"],
    },
    {
      id: "kkr",
      name: "Kolkata Knight Riders",
      short: "KKR",
      colors: { primary: "#5d2a86", secondary: "#d8b448" },
      strategyLabel: "Spin Grid",
      aggression: 0.64,
      bargainBias: 0.49,
      bluffBias: 0.32,
      youthBias: 0.38,
      indianBias: 0.52,
      starBias: 0.5,
      patience: 0.58,
      focusTags: ["spin", "mystery", "middle-order", "finisher"],
    },
    {
      id: "rcb",
      name: "Royal Challengers Bengaluru",
      short: "RCB",
      colors: { primary: "#ff554b", secondary: "#101827" },
      strategyLabel: "Top-Order Fire",
      aggression: 0.8,
      bargainBias: 0.28,
      bluffBias: 0.4,
      youthBias: 0.33,
      indianBias: 0.48,
      starBias: 0.88,
      patience: 0.35,
      focusTags: ["powerplay", "marquee", "finisher", "wk"],
    },
    {
      id: "rr",
      name: "Rajasthan Royals",
      short: "RR",
      colors: { primary: "#ff68a7", secondary: "#0d3b77" },
      strategyLabel: "Youth Lab",
      aggression: 0.61,
      bargainBias: 0.62,
      bluffBias: 0.19,
      youthBias: 0.86,
      indianBias: 0.62,
      starBias: 0.4,
      patience: 0.71,
      focusTags: ["youth", "spin", "pace", "upside"],
    },
    {
      id: "srh",
      name: "Sunrisers Hyderabad",
      short: "SRH",
      colors: { primary: "#ff8c1e", secondary: "#090f19" },
      strategyLabel: "Pace Surge",
      aggression: 0.73,
      bargainBias: 0.31,
      bluffBias: 0.29,
      youthBias: 0.44,
      indianBias: 0.51,
      starBias: 0.68,
      patience: 0.43,
      focusTags: ["pace", "powerplay", "death", "ceiling"],
    },
    {
      id: "dc",
      name: "Delhi Capitals",
      short: "DC",
      colors: { primary: "#2146a8", secondary: "#ef3e42" },
      strategyLabel: "Data Lab",
      aggression: 0.52,
      bargainBias: 0.78,
      bluffBias: 0.15,
      youthBias: 0.58,
      indianBias: 0.57,
      starBias: 0.3,
      patience: 0.83,
      focusTags: ["value", "versatility", "glovework", "pace"],
    },
    {
      id: "lsg",
      name: "Lucknow Super Giants",
      short: "LSG",
      colors: { primary: "#41c4d9", secondary: "#ff8d2e" },
      strategyLabel: "Length Merchants",
      aggression: 0.57,
      bargainBias: 0.57,
      bluffBias: 0.22,
      youthBias: 0.34,
      indianBias: 0.59,
      starBias: 0.46,
      patience: 0.67,
      focusTags: ["anchor", "pace", "control", "all-rounder"],
    },
    {
      id: "gt",
      name: "Gujarat Titans",
      short: "GT",
      colors: { primary: "#22314c", secondary: "#d8b248" },
      strategyLabel: "Control Cricket",
      aggression: 0.59,
      bargainBias: 0.61,
      bluffBias: 0.2,
      youthBias: 0.39,
      indianBias: 0.6,
      starBias: 0.47,
      patience: 0.74,
      focusTags: ["death", "control", "all-rounder", "anchor"],
    },
    {
      id: "pbks",
      name: "Punjab Kings",
      short: "PBKS",
      colors: { primary: "#d91e36", secondary: "#d8d8d8" },
      strategyLabel: "Chaos Market",
      aggression: 0.83,
      bargainBias: 0.24,
      bluffBias: 0.49,
      youthBias: 0.52,
      indianBias: 0.54,
      starBias: 0.66,
      patience: 0.29,
      focusTags: ["powerplay", "finisher", "pace", "marquee"],
    },
  ];

  const REAL_PLAYER_ROWS = [
    ["MS Dhoni", "WK", "CSK", false, 44, 69, 4, 84, 93, 1, ["wk", "finisher", "captain", "glovework"], "Finisher wicketkeeper"],
    ["Ruturaj Gaikwad", "BAT", "CSK", false, 28, 87, 12, 74, 84, 2, ["anchor", "powerplay", "captain", "top-order"], "Classical opener"],
    ["Devon Conway", "BAT", "CSK", true, 34, 84, 6, 70, 81, 1.75, ["anchor", "powerplay", "top-order"], "Left-handed opener"],
    ["Rachin Ravindra", "AR", "CSK", true, 26, 82, 72, 76, 74, 1.75, ["all-rounder", "spin", "powerplay", "youth"], "Spin-bowling top-order all-rounder"],
    ["Shivam Dube", "AR", "CSK", false, 31, 84, 58, 68, 72, 1.5, ["all-rounder", "finisher", "middle-order"], "Power-hitting all-rounder"],
    ["Ravindra Jadeja", "AR", "CSK", false, 37, 79, 86, 87, 88, 2, ["all-rounder", "spin", "finisher", "captain"], "Elite spin all-rounder"],
    ["Noor Ahmad", "BWL", "CSK", true, 21, 20, 87, 74, 71, 1.5, ["spin", "mystery", "youth"], "Attacking left-arm wrist spinner"],
    ["Matheesha Pathirana", "BWL", "CSK", true, 23, 12, 89, 70, 69, 1.75, ["pace", "death", "youth"], "Death overs sling quick"],
    ["Khaleel Ahmed", "BWL", "CSK", false, 28, 16, 80, 68, 70, 1, ["pace", "powerplay", "left-arm"], "Left-arm new-ball quick"],
    ["Ravichandran Ashwin", "AR", "CSK", false, 39, 68, 82, 72, 89, 1.25, ["all-rounder", "spin", "control", "captain"], "Control spin all-rounder"],
    ["Sam Curran", "AR", "CSK", true, 27, 78, 80, 76, 79, 1.75, ["all-rounder", "pace", "finisher"], "Seam-bowling finisher"],
    ["Rahul Tripathi", "BAT", "CSK", false, 34, 78, 9, 72, 71, 1, ["middle-order", "powerplay"], "Tempo attacker"],
    ["Deepak Hooda", "BAT", "CSK", false, 30, 72, 44, 70, 68, 0.75, ["middle-order", "value"], "Utility batter"],

    ["Rohit Sharma", "BAT", "MI", false, 38, 86, 8, 70, 88, 1.75, ["powerplay", "captain", "marquee", "top-order"], "Senior opener"],
    ["Hardik Pandya", "AR", "MI", false, 32, 84, 82, 78, 77, 2, ["all-rounder", "pace", "finisher", "captain", "marquee"], "Seam-bowling captain"],
    ["Suryakumar Yadav", "BAT", "MI", false, 35, 92, 10, 76, 86, 2, ["marquee", "middle-order", "finisher", "ceiling"], "360 middle-order hitter"],
    ["Tilak Varma", "BAT", "MI", false, 23, 84, 8, 73, 79, 1.5, ["middle-order", "youth", "anchor"], "Left-handed middle-order anchor"],
    ["Ryan Rickelton", "WK", "MI", true, 29, 82, 5, 76, 73, 1.25, ["wk", "powerplay"], "Left-handed wicketkeeper opener"],
    ["Will Jacks", "AR", "MI", true, 27, 83, 64, 74, 72, 1.5, ["all-rounder", "powerplay", "spin"], "Powerplay spin all-rounder"],
    ["Naman Dhir", "AR", "MI", false, 25, 74, 56, 71, 67, 0.75, ["all-rounder", "finisher", "youth"], "Young power finisher"],
    ["Jasprit Bumrah", "BWL", "MI", false, 32, 14, 94, 77, 90, 2, ["pace", "death", "powerplay", "marquee"], "Elite pace spearhead"],
    ["Trent Boult", "BWL", "MI", true, 37, 13, 85, 73, 82, 1.5, ["pace", "powerplay", "left-arm"], "Left-arm swing quick"],
    ["Deepak Chahar", "AR", "MI", false, 33, 30, 79, 71, 75, 1, ["pace", "powerplay", "control"], "Swing-bowling seam all-rounder"],
    ["Mitchell Santner", "AR", "MI", true, 34, 65, 80, 82, 81, 1, ["all-rounder", "spin", "control"], "Control spin all-rounder"],
    ["Robin Minz", "WK", "MI", false, 23, 76, 2, 72, 62, 0.75, ["wk", "finisher", "youth"], "Young wicketkeeper hitter"],
    ["Allah Ghazanfar", "BWL", "MI", true, 19, 8, 78, 66, 60, 0.75, ["spin", "mystery", "youth"], "Young mystery spinner"],

    ["Ajinkya Rahane", "BAT", "KKR", false, 38, 80, 8, 72, 88, 1, ["anchor", "captain", "top-order"], "Senior top-order anchor"],
    ["Rinku Singh", "BAT", "KKR", false, 28, 84, 8, 74, 82, 1.5, ["finisher", "middle-order"], "Left-handed finisher"],
    ["Venkatesh Iyer", "AR", "KKR", false, 31, 81, 62, 74, 74, 1.25, ["all-rounder", "powerplay", "middle-order"], "Tall seam all-rounder"],
    ["Andre Russell", "AR", "KKR", true, 37, 90, 78, 80, 76, 2, ["all-rounder", "finisher", "pace", "marquee", "ceiling"], "Power-finishing seam all-rounder"],
    ["Sunil Narine", "AR", "KKR", true, 38, 73, 88, 79, 85, 1.75, ["all-rounder", "spin", "mystery", "powerplay"], "Mystery spin match-winner"],
    ["Varun Chakravarthy", "BWL", "KKR", false, 35, 12, 88, 70, 81, 1.5, ["spin", "mystery", "middle-overs"], "Mystery middle-overs spinner"],
    ["Harshit Rana", "BWL", "KKR", false, 24, 16, 84, 72, 73, 1.25, ["pace", "death", "youth"], "Hit-the-deck death bowler"],
    ["Vaibhav Arora", "BWL", "KKR", false, 28, 12, 76, 68, 68, 0.75, ["pace", "powerplay"], "Powerplay swing quick"],
    ["Ramandeep Singh", "AR", "KKR", false, 28, 72, 52, 75, 69, 0.75, ["all-rounder", "finisher"], "Utility seam finisher"],
    ["Angkrish Raghuvanshi", "BAT", "KKR", false, 21, 78, 6, 74, 70, 0.75, ["top-order", "youth"], "Young top-order stroke-maker"],
    ["Rahmanullah Gurbaz", "WK", "KKR", true, 24, 83, 4, 71, 67, 1, ["wk", "powerplay", "youth"], "Explosive wicketkeeper opener"],
    ["Anrich Nortje", "BWL", "KKR", true, 32, 10, 82, 67, 69, 1, ["pace", "death"], "Express quick"],
    ["Quinton de Kock", "WK", "KKR", true, 33, 82, 3, 76, 78, 1.25, ["wk", "powerplay", "anchor"], "Left-handed wicketkeeper opener"],

    ["Virat Kohli", "BAT", "RCB", false, 37, 91, 8, 79, 93, 2, ["marquee", "anchor", "powerplay", "captain", "top-order"], "Elite top-order anchor"],
    ["Phil Salt", "WK", "RCB", true, 29, 86, 2, 74, 73, 1.5, ["wk", "powerplay", "finisher"], "Explosive wicketkeeper opener"],
    ["Rajat Patidar", "BAT", "RCB", false, 32, 82, 8, 72, 78, 1.25, ["middle-order", "captain"], "Strong middle-order batter"],
    ["Devdutt Padikkal", "BAT", "RCB", false, 26, 77, 7, 69, 72, 0.75, ["top-order", "anchor"], "Left-handed top-order batter"],
    ["Jitesh Sharma", "WK", "RCB", false, 32, 79, 2, 75, 69, 0.75, ["wk", "finisher"], "Counterpunch wicketkeeper"],
    ["Liam Livingstone", "AR", "RCB", true, 32, 85, 70, 74, 72, 1.5, ["all-rounder", "powerplay", "spin", "finisher"], "Power-hitting spin all-rounder"],
    ["Krunal Pandya", "AR", "RCB", false, 35, 74, 79, 76, 82, 1, ["all-rounder", "spin", "control"], "Control spin all-rounder"],
    ["Tim David", "BAT", "RCB", true, 30, 83, 4, 72, 70, 1, ["finisher", "ceiling"], "Late-innings power hitter"],
    ["Romario Shepherd", "AR", "RCB", true, 31, 78, 76, 74, 68, 1, ["all-rounder", "pace", "finisher"], "Seam-bowling finisher"],
    ["Bhuvneshwar Kumar", "BWL", "RCB", false, 36, 18, 80, 72, 86, 1, ["pace", "powerplay", "control"], "Swing-and-control seamer"],
    ["Josh Hazlewood", "BWL", "RCB", true, 35, 12, 88, 74, 84, 1.5, ["pace", "powerplay", "control", "marquee"], "Hard lengths enforcer"],
    ["Yash Dayal", "BWL", "RCB", false, 28, 12, 78, 70, 72, 0.75, ["pace", "powerplay", "left-arm"], "Left-arm powerplay seamer"],
    ["Suyash Sharma", "BWL", "RCB", false, 22, 10, 79, 68, 63, 0.75, ["spin", "mystery", "youth"], "Young mystery spinner"],

    ["Sanju Samson", "WK", "RR", false, 31, 86, 2, 80, 82, 1.75, ["wk", "anchor", "captain", "middle-order"], "Top-order wicketkeeper anchor"],
    ["Yashasvi Jaiswal", "BAT", "RR", false, 24, 89, 5, 74, 81, 1.75, ["marquee", "powerplay", "youth", "ceiling", "top-order"], "High-tempo opener"],
    ["Riyan Parag", "AR", "RR", false, 25, 82, 68, 76, 76, 1.25, ["all-rounder", "middle-order", "spin", "youth"], "Middle-order spin all-rounder"],
    ["Dhruv Jurel", "WK", "RR", false, 25, 79, 2, 76, 75, 1, ["wk", "finisher", "youth"], "Young finishing wicketkeeper"],
    ["Shimron Hetmyer", "BAT", "RR", true, 29, 84, 2, 72, 72, 1.25, ["finisher", "middle-order"], "Left-handed finisher"],
    ["Nitish Rana", "BAT", "RR", false, 32, 80, 22, 73, 77, 1, ["anchor", "middle-order", "spin"], "Flexible left-handed batter"],
    ["Wanindu Hasaranga", "AR", "RR", true, 29, 68, 86, 79, 75, 1.25, ["all-rounder", "spin", "mystery"], "Leg-spin all-rounder"],
    ["Jofra Archer", "BWL", "RR", true, 31, 18, 88, 74, 75, 1.5, ["pace", "death", "powerplay", "marquee"], "Express strike bowler"],
    ["Tushar Deshpande", "BWL", "RR", false, 31, 16, 76, 67, 68, 0.75, ["pace", "death"], "Hit-the-deck seamer"],
    ["Sandeep Sharma", "BWL", "RR", false, 33, 12, 78, 70, 80, 0.75, ["pace", "powerplay", "control"], "Skilled new-ball seamer"],
    ["Maheesh Theekshana", "BWL", "RR", true, 25, 10, 82, 71, 73, 1, ["spin", "mystery", "control"], "Carrom-ball spinner"],
    ["Kumar Kartikeya", "BWL", "RR", false, 28, 9, 74, 69, 66, 0.5, ["spin", "control"], "Left-arm spinner"],
    ["Vaibhav Suryavanshi", "BAT", "RR", false, 15, 74, 5, 68, 55, 0.5, ["youth", "powerplay", "upside"], "Teenage powerplay prospect"],

    ["Travis Head", "BAT", "SRH", true, 32, 89, 20, 76, 78, 1.75, ["marquee", "powerplay", "ceiling", "top-order"], "Explosive left-handed opener"],
    ["Abhishek Sharma", "AR", "SRH", false, 26, 86, 58, 74, 77, 1.5, ["all-rounder", "powerplay", "spin", "youth"], "Powerplay spin all-rounder"],
    ["Ishan Kishan", "WK", "SRH", false, 28, 84, 2, 76, 72, 1.5, ["wk", "powerplay", "finisher"], "Explosive wicketkeeper batter"],
    ["Heinrich Klaasen", "WK", "SRH", true, 35, 90, 0, 77, 80, 1.75, ["wk", "finisher", "marquee", "middle-order"], "Elite spin-hitting wicketkeeper"],
    ["Nitish Kumar Reddy", "AR", "SRH", false, 23, 81, 67, 75, 74, 1.25, ["all-rounder", "youth", "finisher"], "Young seam all-rounder"],
    ["Pat Cummins", "AR", "SRH", true, 33, 63, 86, 79, 89, 1.75, ["pace", "captain", "death", "all-rounder"], "Captain fast-bowling all-rounder"],
    ["Harshal Patel", "BWL", "SRH", false, 35, 34, 79, 71, 76, 1, ["pace", "death"], "Death-overs specialist"],
    ["Kamindu Mendis", "AR", "SRH", true, 27, 77, 72, 75, 73, 1, ["all-rounder", "spin", "anchor"], "Ambidextrous spin all-rounder"],
    ["Jaydev Unadkat", "BWL", "SRH", false, 35, 14, 74, 70, 77, 0.5, ["pace", "left-arm", "control"], "Left-arm control seamer"],
    ["Adam Zampa", "BWL", "SRH", true, 34, 8, 84, 70, 77, 1, ["spin", "mystery"], "Attacking leg-spinner"],
    ["Rahul Chahar", "BWL", "SRH", false, 26, 10, 78, 70, 72, 0.75, ["spin", "middle-overs"], "Middle-overs leg-spinner"],
    ["Simarjeet Singh", "BWL", "SRH", false, 27, 10, 75, 68, 65, 0.5, ["pace", "death"], "Hit-the-deck seamer"],
    ["Aniket Verma", "BAT", "SRH", false, 24, 74, 8, 70, 64, 0.5, ["finisher", "youth"], "Young lower-middle hitter"],

    ["KL Rahul", "WK", "DC", false, 34, 87, 0, 78, 86, 1.75, ["wk", "anchor", "captain", "top-order", "marquee"], "Top-order wicketkeeper anchor"],
    ["Tristan Stubbs", "WK", "DC", true, 25, 84, 6, 76, 75, 1.5, ["wk", "finisher", "youth", "middle-order"], "Dynamic finishing wicketkeeper"],
    ["Abishek Porel", "WK", "DC", false, 24, 76, 0, 73, 69, 0.75, ["wk", "powerplay", "youth"], "Young wicketkeeper opener"],
    ["Karun Nair", "BAT", "DC", false, 34, 78, 5, 70, 76, 0.75, ["anchor", "top-order"], "Top-order stabilizer"],
    ["Ashutosh Sharma", "BAT", "DC", false, 27, 78, 4, 71, 67, 0.75, ["finisher", "middle-order"], "Counterpunch finisher"],
    ["Axar Patel", "AR", "DC", false, 32, 76, 83, 80, 83, 1.5, ["all-rounder", "spin", "captain"], "Reliable spin all-rounder"],
    ["Vipraj Nigam", "AR", "DC", false, 21, 70, 72, 71, 61, 0.5, ["all-rounder", "youth", "spin"], "Young utility all-rounder"],
    ["Mitchell Starc", "BWL", "DC", true, 36, 15, 88, 73, 83, 1.5, ["pace", "powerplay", "left-arm", "marquee"], "Left-arm strike quick"],
    ["Kuldeep Yadav", "BWL", "DC", false, 31, 12, 86, 74, 80, 1.25, ["spin", "mystery"], "Wrist-spin wicket taker"],
    ["T Natarajan", "BWL", "DC", false, 35, 10, 81, 70, 76, 1, ["pace", "death", "left-arm"], "Death-overs left-armer"],
    ["Mukesh Kumar", "BWL", "DC", false, 32, 11, 76, 68, 72, 0.75, ["pace", "powerplay", "control"], "Control seamer"],
    ["Dushmantha Chameera", "BWL", "DC", true, 34, 10, 79, 70, 69, 0.75, ["pace", "death"], "High-pace seamer"],
    ["Sameer Rizvi", "BAT", "DC", false, 22, 74, 5, 68, 63, 0.5, ["middle-order", "youth", "upside"], "Young middle-order hitter"],

    ["Rishabh Pant", "WK", "LSG", false, 28, 88, 0, 81, 82, 2, ["wk", "finisher", "captain", "marquee"], "Counterattacking wicketkeeper captain"],
    ["Nicholas Pooran", "WK", "LSG", true, 31, 89, 0, 76, 76, 1.75, ["wk", "finisher", "marquee", "middle-order"], "Explosive finishing wicketkeeper"],
    ["Aiden Markram", "BAT", "LSG", true, 31, 82, 38, 75, 82, 1.25, ["anchor", "top-order", "captain"], "Flexible top-order anchor"],
    ["Mitchell Marsh", "AR", "LSG", true, 34, 84, 74, 73, 74, 1.5, ["all-rounder", "powerplay", "pace"], "Powerplay seam all-rounder"],
    ["Ayush Badoni", "BAT", "LSG", false, 26, 77, 4, 72, 72, 0.75, ["middle-order", "finisher", "youth"], "Young middle-order finisher"],
    ["David Miller", "BAT", "LSG", true, 37, 82, 2, 73, 82, 1, ["finisher", "anchor"], "Senior finishing left-hander"],
    ["Abdul Samad", "BAT", "LSG", false, 24, 76, 6, 70, 63, 0.5, ["finisher", "youth", "ceiling"], "High-upside finisher"],
    ["Shardul Thakur", "AR", "LSG", false, 35, 56, 76, 72, 73, 0.75, ["all-rounder", "pace"], "Seam-bowling utility all-rounder"],
    ["Avesh Khan", "BWL", "LSG", false, 29, 12, 80, 69, 71, 1, ["pace", "death"], "Death-overs seamer"],
    ["Mayank Yadav", "BWL", "LSG", false, 23, 10, 86, 70, 64, 1.25, ["pace", "ceiling", "youth"], "High-pace upside quick"],
    ["Mohsin Khan", "BWL", "LSG", false, 27, 10, 77, 69, 70, 0.75, ["pace", "left-arm", "powerplay"], "Left-arm powerplay seamer"],
    ["Ravi Bishnoi", "BWL", "LSG", false, 25, 9, 84, 72, 74, 1, ["spin", "mystery", "youth"], "Aggressive leg-spinner"],
    ["Digvesh Singh", "BWL", "LSG", false, 25, 8, 74, 69, 62, 0.5, ["spin", "youth", "control"], "Young control spinner"],

    ["Jos Buttler", "WK", "GT", true, 35, 89, 0, 78, 82, 1.75, ["wk", "powerplay", "finisher", "marquee"], "Elite wicketkeeper opener"],
    ["Shubman Gill", "BAT", "GT", false, 26, 90, 5, 76, 86, 2, ["marquee", "anchor", "powerplay", "captain", "top-order"], "Top-order run machine"],
    ["Sai Sudharsan", "BAT", "GT", false, 24, 86, 4, 74, 81, 1.5, ["anchor", "top-order", "youth"], "Left-handed top-order anchor"],
    ["Sherfane Rutherford", "BAT", "GT", true, 27, 79, 8, 71, 69, 0.75, ["finisher", "middle-order"], "Left-handed finisher"],
    ["Rahul Tewatia", "AR", "GT", false, 33, 74, 48, 73, 74, 0.75, ["finisher", "all-rounder"], "Late-innings matchup hitter"],
    ["Washington Sundar", "AR", "GT", false, 27, 72, 79, 75, 76, 1, ["all-rounder", "spin", "control"], "Control spin all-rounder"],
    ["Rashid Khan", "BWL", "GT", true, 27, 42, 91, 80, 85, 2, ["spin", "mystery", "all-rounder", "marquee"], "Elite mystery spinner"],
    ["Kagiso Rabada", "BWL", "GT", true, 31, 16, 87, 72, 78, 1.5, ["pace", "death", "powerplay"], "Strike fast bowler"],
    ["Mohammed Siraj", "BWL", "GT", false, 32, 14, 83, 70, 79, 1.25, ["pace", "powerplay", "control"], "New-ball seamer"],
    ["Prasidh Krishna", "BWL", "GT", false, 30, 10, 81, 69, 74, 1, ["pace", "death"], "Hard lengths quick"],
    ["Sai Kishore", "BWL", "GT", false, 29, 11, 79, 71, 76, 0.75, ["spin", "control"], "Left-arm control spinner"],
    ["Gerald Coetzee", "BWL", "GT", true, 26, 12, 82, 70, 69, 1, ["pace", "death", "ceiling"], "High-pace wicket taker"],
    ["Shahrukh Khan", "BAT", "GT", false, 31, 75, 4, 72, 68, 0.75, ["finisher", "middle-order"], "Muscular middle-order finisher"],

    ["Prabhsimran Singh", "WK", "PBKS", false, 25, 80, 0, 72, 68, 1, ["wk", "powerplay", "youth"], "Attacking wicketkeeper opener"],
    ["Shreyas Iyer", "BAT", "PBKS", false, 31, 84, 6, 74, 83, 1.5, ["anchor", "captain", "middle-order", "marquee"], "Middle-order anchor"],
    ["Nehal Wadhera", "BAT", "PBKS", false, 25, 79, 5, 72, 72, 0.75, ["middle-order", "youth"], "Young left-handed batter"],
    ["Shashank Singh", "BAT", "PBKS", false, 34, 80, 6, 73, 76, 1, ["finisher", "middle-order"], "Clutch finisher"],
    ["Marcus Stoinis", "AR", "PBKS", true, 37, 82, 70, 75, 79, 1.25, ["all-rounder", "pace", "finisher"], "Power seam all-rounder"],
    ["Marco Jansen", "AR", "PBKS", true, 26, 70, 82, 76, 74, 1.25, ["all-rounder", "pace", "left-arm"], "Left-arm seam all-rounder"],
    ["Azmatullah Omarzai", "AR", "PBKS", true, 26, 76, 76, 74, 72, 1, ["all-rounder", "pace", "finisher"], "Seam-bowling finisher"],
    ["Glenn Maxwell", "AR", "PBKS", true, 37, 82, 68, 78, 74, 1.25, ["all-rounder", "spin", "ceiling", "marquee"], "High-variance spin all-rounder"],
    ["Arshdeep Singh", "BWL", "PBKS", false, 27, 12, 84, 72, 78, 1.5, ["pace", "death", "left-arm", "marquee"], "Left-arm death specialist"],
    ["Yuzvendra Chahal", "BWL", "PBKS", false, 35, 8, 86, 70, 80, 1.25, ["spin", "mystery"], "Wicket-taking leg-spinner"],
    ["Lockie Ferguson", "BWL", "PBKS", true, 35, 10, 82, 69, 68, 1, ["pace", "death"], "High-pace strike bowler"],
    ["Harpreet Brar", "AR", "PBKS", false, 30, 62, 75, 73, 71, 0.75, ["all-rounder", "spin", "control"], "Spin-bowling utility all-rounder"],
    ["Vijaykumar Vyshak", "BWL", "PBKS", false, 29, 11, 75, 68, 67, 0.5, ["pace", "death"], "Late-overs seamer"],

    // CSK additional squad
    ["Anshul Kamboj", "BWL", "CSK", false, 24, 14, 76, 68, 65, 0.3, ["pace", "death"], "Right-arm seam specialist"],
    ["Gurjapneet Singh", "BWL", "CSK", false, 21, 10, 73, 66, 60, 0.2, ["pace", "left-arm", "youth"], "Young left-arm quick"],
    ["Vijay Shankar", "AR", "CSK", false, 35, 71, 62, 70, 72, 0.5, ["all-rounder", "pace", "versatility"], "Utility seam all-rounder"],
    ["Shreyas Gopal", "BWL", "CSK", false, 32, 11, 74, 69, 71, 0.2, ["spin", "mystery"], "Leg-spin wicket-taker"],
    ["Jamie Overton", "AR", "CSK", true, 28, 56, 72, 70, 67, 0.75, ["all-rounder", "pace", "death"], "Hard-hitting seam all-rounder"],
    ["Shaik Rasheed", "BAT", "CSK", false, 22, 73, 6, 68, 63, 0.2, ["top-order", "youth", "upside"], "Young domestic top-order talent"],
    ["Kamlesh Nagarkoti", "BWL", "CSK", false, 28, 13, 74, 67, 66, 0.2, ["pace", "death"], "Express right-arm quick"],

    // MI additional squad
    ["Raj Bawa", "AR", "MI", false, 23, 72, 66, 70, 65, 0.2, ["all-rounder", "pace", "youth"], "Young seam all-rounder"],
    ["Karn Sharma", "BWL", "MI", false, 35, 18, 74, 71, 76, 0.5, ["spin", "mystery", "control"], "Experienced mystery spinner"],
    ["Reece Topley", "BWL", "MI", true, 31, 10, 74, 68, 68, 0.75, ["pace", "left-arm", "powerplay"], "Left-arm swing specialist"],
    ["Krishnan Shrijith", "WK", "MI", false, 24, 70, 0, 70, 61, 0.2, ["wk", "glovework", "youth"], "Young backup wicketkeeper"],
    ["Arjun Tendulkar", "BWL", "MI", false, 25, 14, 70, 66, 61, 0.2, ["pace", "left-arm", "youth"], "Young left-arm pacer"],
    ["Lizaad Williams", "BWL", "MI", true, 30, 10, 73, 67, 65, 0.3, ["pace", "death"], "South African death bowler"],

    // KKR additional squad
    ["Spencer Johnson", "BWL", "KKR", true, 27, 10, 77, 68, 67, 0.75, ["pace", "left-arm", "death"], "Left-arm express quick"],
    ["Luvnith Sisodia", "WK", "KKR", false, 22, 70, 0, 70, 60, 0.2, ["wk", "youth", "glovework"], "Young backup wicketkeeper"],
    ["Rovman Powell", "BAT", "KKR", true, 31, 79, 4, 72, 68, 0.75, ["finisher", "middle-order", "ceiling"], "Caribbean power hitter"],
    ["Moeen Ali", "AR", "KKR", true, 38, 72, 76, 74, 78, 0.75, ["all-rounder", "spin", "control"], "Experienced spin all-rounder"],
    ["Mayank Markande", "BWL", "KKR", false, 29, 10, 74, 69, 68, 0.2, ["spin", "mystery"], "Leg-spin mystery bowler"],
    ["Anukul Roy", "AR", "KKR", false, 26, 58, 73, 70, 65, 0.2, ["all-rounder", "spin", "control"], "Slow left-arm all-rounder"],

    // RCB additional squad
    ["Lungi Ngidi", "BWL", "RCB", true, 31, 11, 79, 69, 70, 0.75, ["pace", "death", "control"], "Tall right-arm quick"],
    ["Jacob Bethell", "AR", "RCB", true, 22, 77, 66, 72, 68, 0.75, ["all-rounder", "spin", "youth", "upside"], "Young English spin all-rounder"],
    ["Nuwan Thushara", "BWL", "RCB", true, 30, 10, 76, 68, 67, 0.5, ["pace", "powerplay", "control"], "Sri Lankan swing seamer"],
    ["Swastik Chikara", "BWL", "RCB", false, 20, 8, 71, 66, 60, 0.2, ["spin", "youth", "control"], "Young off-spinner"],
    ["Manoj Bhandage", "AR", "RCB", false, 26, 65, 68, 70, 64, 0.2, ["all-rounder", "spin", "youth"], "Domestic spin all-rounder"],
    ["Abhinandan Singh", "BWL", "RCB", false, 24, 9, 71, 67, 62, 0.2, ["pace", "youth"], "Young right-arm quick"],

    // RR additional squad
    ["Kwena Maphaka", "BWL", "RR", true, 21, 9, 74, 67, 63, 0.3, ["pace", "death", "youth"], "Young South African quick"],
    ["Fazalhaq Farooqi", "BWL", "RR", true, 25, 10, 78, 68, 67, 0.75, ["pace", "powerplay", "left-arm"], "Afghan left-arm new-ball bowler"],
    ["Shubham Dubey", "AR", "RR", false, 27, 70, 66, 70, 67, 0.2, ["all-rounder", "control"], "Domestic utility all-rounder"],
    ["Yudhvir Singh Charak", "BWL", "RR", false, 23, 9, 72, 67, 62, 0.2, ["pace", "death", "youth"], "Young death bowler"],
    ["Ashok Sharma", "BWL", "RR", false, 31, 10, 72, 68, 67, 0.2, ["pace", "powerplay"], "Right-arm new-ball bowler"],

    // SRH additional squad
    ["Mohammed Shami", "BWL", "SRH", false, 35, 14, 86, 71, 83, 1.5, ["pace", "powerplay", "control", "marquee"], "Elite new-ball seamer"],
    ["Brydon Carse", "AR", "SRH", true, 29, 62, 76, 70, 70, 0.75, ["all-rounder", "pace", "death"], "Hard-hitting death all-rounder"],
    ["Zeeshan Ansari", "BWL", "SRH", false, 22, 8, 73, 67, 62, 0.2, ["spin", "left-arm", "youth"], "Young left-arm spinner"],
    ["Atharva Taide", "BAT", "SRH", false, 24, 72, 6, 68, 63, 0.2, ["middle-order", "youth"], "Young domestic batter"],
    ["Smaran Baburaj", "WK", "SRH", false, 23, 68, 0, 68, 60, 0.2, ["wk", "youth", "glovework"], "Young backup wicketkeeper"],

    // DC additional squad
    ["Jake Fraser-McGurk", "BAT", "DC", true, 23, 82, 4, 72, 70, 1, ["powerplay", "top-order", "youth", "ceiling"], "Explosive young opener"],
    ["Faf du Plessis", "BAT", "DC", true, 41, 80, 4, 78, 84, 0.75, ["anchor", "top-order", "captain"], "Senior top-order batter"],
    ["Donovan Ferreira", "AR", "DC", true, 26, 74, 58, 70, 66, 0.5, ["all-rounder", "pace", "youth"], "Young South African all-rounder"],
    ["Darshan Nalkande", "BWL", "DC", false, 30, 11, 73, 68, 66, 0.2, ["pace", "death"], "Right-arm seamer"],
    ["Madhav Tiwari", "BWL", "DC", false, 22, 8, 71, 66, 61, 0.2, ["pace", "youth", "upside"], "Young right-arm quick"],

    // LSG additional squad
    ["Akash Deep", "BWL", "LSG", false, 29, 13, 80, 69, 73, 0.75, ["pace", "powerplay", "control"], "Right-arm new-ball bowler"],
    ["Himmat Singh", "BAT", "LSG", false, 26, 72, 4, 68, 64, 0.2, ["middle-order", "youth", "finisher"], "Young middle-order batter"],
    ["Manimaran Siddharth", "BWL", "LSG", false, 26, 8, 73, 68, 64, 0.2, ["spin", "left-arm", "control"], "Left-arm spinner"],
    ["Aryan Juyal", "WK", "LSG", false, 22, 68, 0, 68, 60, 0.2, ["wk", "youth", "glovework"], "Young backup wicketkeeper"],
    ["Matthew Breetzke", "BAT", "LSG", true, 26, 74, 4, 70, 66, 0.3, ["top-order", "youth", "value"], "Young South African opener"],

    // GT additional squad
    ["Anuj Rawat", "WK", "GT", false, 26, 72, 0, 70, 65, 0.2, ["wk", "youth", "top-order"], "Backup wicketkeeper batter"],
    ["Ishant Sharma", "BWL", "GT", false, 38, 12, 74, 69, 79, 0.5, ["pace", "powerplay", "control"], "Experienced new-ball seamer"],
    ["Kumar Kushagra", "WK", "GT", false, 23, 72, 0, 70, 63, 0.2, ["wk", "youth", "glovework"], "Young wicketkeeper"],
    ["Manav Suthar", "BWL", "GT", false, 24, 9, 73, 68, 63, 0.2, ["spin", "left-arm", "youth"], "Young left-arm spinner"],
    ["Nishant Sindhu", "AR", "GT", false, 23, 70, 66, 69, 62, 0.2, ["all-rounder", "spin", "youth"], "Young spin all-rounder"],
    ["Kulwant Khejroliya", "BWL", "GT", false, 29, 9, 71, 67, 64, 0.2, ["pace", "left-arm", "death"], "Left-arm death bowler"],

    // PBKS additional squad
    ["Musheer Khan", "BAT", "PBKS", false, 20, 76, 14, 70, 68, 0.5, ["top-order", "youth", "anchor", "upside"], "Young talented batter"],
    ["Xavier Bartlett", "BWL", "PBKS", true, 26, 10, 74, 68, 66, 0.5, ["pace", "powerplay", "control"], "Australian right-arm seamer"],
    ["Kuldeep Sen", "BWL", "PBKS", false, 29, 10, 72, 68, 66, 0.2, ["pace", "death"], "Right-arm quick"],
    ["Harnoor Singh", "BAT", "PBKS", false, 21, 70, 4, 67, 62, 0.2, ["top-order", "youth", "upside"], "Young left-handed opener"],
    ["Suryansh Shedge", "BAT", "PBKS", false, 21, 70, 6, 68, 63, 0.2, ["middle-order", "youth", "finisher"], "Young middle-order hitter"],
    ["Pravin Dubey", "BWL", "PBKS", false, 24, 8, 72, 67, 63, 0.2, ["spin", "youth", "control"], "Young leg-spinner"],
  ];

  // IPL bids are quoted in multiples of ₹5 lakh (0.05 crore) at the low end.
  // Rounding all prices to the nearest 0.05 cr keeps the simulation consistent.
  function roundPrice(value) {
    return Math.round(value * 20) / 20;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function computeMarketValue(player) {
    const battingWeight =
      player.role === "WK" || player.role === "BAT"
        ? 0.084
        : player.role === "AR"
          ? 0.054
          : 0.018;
    const bowlingWeight =
      player.role === "BWL"
        ? 0.086
        : player.role === "AR"
          ? 0.057
          : 0.012;
    const fieldingWeight = 0.02;
    const temperamentWeight = 0.022;
    const rolePremium =
      player.role === "AR" ? 1.38 : player.role === "WK" ? 1.2 : player.role === "BWL" ? 1.24 : 1.12;
    const tagsPremium =
      player.tags.length * 0.14 +
      (player.tags.includes("marquee") ? 1.25 : 0) +
      (player.tags.includes("death") ? 0.55 : 0) +
      (player.tags.includes("powerplay") ? 0.35 : 0) +
      (player.tags.includes("all-rounder") ? 0.6 : 0) +
      (player.tags.includes("captain") ? 0.22 : 0) +
      (player.tags.includes("youth") ? 0.2 : 0) +
      (player.overseas ? 0.2 : 0);

    const raw =
      (player.batting * battingWeight +
        player.bowling * bowlingWeight +
        player.fielding * fieldingWeight +
        player.temperament * temperamentWeight) *
        rolePremium +
      tagsPremium;

    return roundPrice(clamp(raw, player.basePrice + 0.5, 12.5));
  }

  function normalizePlayer(row, index) {
    const [
      name,
      role,
      originTeam,
      overseas,
      age,
      batting,
      bowling,
      fielding,
      temperament,
      basePrice,
      tags,
      style,
    ] = row;

    const player = {
      id: `real-${index + 1}`,
      name,
      role,
      originTeam,
      overseas,
      age,
      batting,
      bowling,
      fielding,
      temperament,
      basePrice,
      style,
      tags: [...tags, role === "AR" ? "all-rounder" : undefined].filter(Boolean),
      experience: clamp(58 + Math.round(age * 0.7), 60, 96),
    };

    player.marketValue = computeMarketValue(player);
    return player;
  }

  function generatePlayers() {
    return REAL_PLAYER_ROWS.map(normalizePlayer).map((player) => ({
      ...player,
      tags: Array.from(new Set(player.tags)),
    }));
  }

  // Pitch types with per-phase modifiers. Higher values = larger score swing.
  const PITCH_TYPES = [
    {
      id: "flat",
      label: "Flat Road",
      emoji: "🏏",
      description: "Paradise for batters. True bounce, low seam movement.",
      battingBonus: 14,
      paceBonus: -5,
      spinBonus: 3,
      favors: "bat",
      powerplayRR: 0.6,  // extra runs per over in powerplay
      middleRR: 0.4,
      deathRR: 0.8,
      tacticsHint: "Bat aggressively. Pace bowling will be expensive — use spin to dry up runs.",
    },
    {
      id: "green",
      label: "Green Top",
      emoji: "🟢",
      description: "Juice for the seamers. Early wickets expected.",
      battingBonus: -10,
      paceBonus: 16,
      spinBonus: -8,
      favors: "pace",
      powerplayRR: -0.8,
      middleRR: -0.3,
      deathRR: 0.2,
      tacticsHint: "Open with pace. Aggressive batting is risky early — build a platform first.",
    },
    {
      id: "dusty",
      label: "Dusty Turner",
      emoji: "🟤",
      description: "Grips and turns sharply from ball one. Spinners dominate.",
      battingBonus: -5,
      paceBonus: -7,
      spinBonus: 18,
      favors: "spin",
      powerplayRR: -0.4,
      middleRR: -0.5,
      deathRR: 0.3,
      tacticsHint: "Spin ambush in powerplay is a masterstroke here. Conservative batting builds pressure.",
    },
    {
      id: "slow",
      label: "Slow & Low",
      emoji: "⚫",
      description: "Cutters and variations thrive. Power hits die in the surface.",
      battingBonus: -7,
      paceBonus: 5,
      spinBonus: 9,
      favors: "mixed",
      powerplayRR: -0.5,
      middleRR: -0.4,
      deathRR: -0.6,
      tacticsHint: "Death specialist bowlers will strangle runs. Rotate pace and spin — don't over-rely on either.",
    },
  ];

  // Batting tactic options shown in the pre-match panel
  const BATTING_TACTICS = [
    { id: "aggressive", label: "Aggressive", desc: "Go for the throat. Higher ceiling, higher collapse risk.", pitchFit: { flat: 1, green: -1, dusty: -0.5, slow: -0.5 } },
    { id: "balanced",   label: "Balanced",   desc: "Read conditions. Solid accumulation with calculated risk.", pitchFit: { flat: 0, green: 0.5, dusty: 0.5, slow: 0.5 } },
    { id: "defensive",  label: "Conservative", desc: "Protect wickets. Build a platform before accelerating.", pitchFit: { flat: -0.5, green: 1, dusty: 1, slow: 1 } },
  ];

  // Powerplay bowling tactic options
  const POWERPLAY_TACTICS = [
    { id: "pace",  label: "Pace Attack",   desc: "Open with your quickest seamers. Exploit new ball movement.", pitchFit: { flat: 0, green: 1, dusty: -1, slow: 0.5 } },
    { id: "spin",  label: "Spin Ambush",   desc: "Surprise openers with early spin. Restricts run flow.", pitchFit: { flat: -0.5, green: -1, dusty: 1, slow: 0.5 } },
    { id: "auto",  label: "Auto",          desc: "Trust your XI to adapt. Balanced but no upside.", pitchFit: { flat: 0, green: 0, dusty: 0, slow: 0 } },
  ];

  // Death overs bowling tactic options
  const DEATH_TACTICS = [
    { id: "specialist", label: "Specialist", desc: "Back your death-over expert for the final 4.", pitchFit: { flat: 0.5, green: 0.5, dusty: 0, slow: 1 } },
    { id: "rotate",     label: "Rotate",     desc: "Keep batters guessing with variety. Higher variance.", pitchFit: { flat: 0, green: 0, dusty: 0.5, slow: 0 } },
  ];

  // Field placement setting — affects both batting and bowling run rates
  const FIELD_SETTINGS = [
    { id: "attacking", label: "Attacking Field", desc: "Slips, gully, close catchers. High risk/reward — creates chances but leaks runs.", pitchFit: { flat: -0.5, green: 1, dusty: 0.5, slow: -0.5 }, battingEffect: 0.06, bowlingEffect: 0.08 },
    { id: "standard", label: "Standard Field", desc: "Balanced ring field. Safe option with no modifier.", pitchFit: { flat: 0, green: 0, dusty: 0, slow: 0 }, battingEffect: 0, bowlingEffect: 0 },
    { id: "defensive", label: "Defensive Spread", desc: "Deep boundary riders. Cuts boundaries but allows easy singles.", pitchFit: { flat: 0.5, green: -0.5, dusty: -0.5, slow: 1 }, battingEffect: -0.04, bowlingEffect: -0.06 },
  ];

  // Middle overs bowling plan — new tactic dimension
  const MIDDLE_TACTICS = [
    { id: "contain", label: "Contain & Build", desc: "Dry up runs through the middle. Build dot-ball pressure.", pitchFit: { flat: -0.5, green: 0.5, dusty: 1, slow: 1 } },
    { id: "wickets", label: "Hunt Wickets", desc: "Attack the stumps, vary pace. Risk giving runs for breakthroughs.", pitchFit: { flat: 0.5, green: 1, dusty: 0, slow: -0.5 } },
    { id: "spin_web", label: "Spin Web", desc: "Deploy spinners in tandem. Lethal on turners, risky on flat tracks.", pitchFit: { flat: -1, green: -1, dusty: 1, slow: 0.5 } },
  ];

// Captaincy intent — impacts risk profile, chase composure, and death-over decisions
const CAPTAINCY_TACTICS = [
  { id: "calm", label: "Calm Controller", desc: "Absorb pressure and avoid collapses. Best for tense chases.", pitchFit: { flat: 0, green: 0.5, dusty: 0.5, slow: 1 }, battingEffect: -0.02, bowlingEffect: 0.03, chaseBonus: 0.08 },
  { id: "balanced", label: "Balanced Captaincy", desc: "Mix attack and control. Reliable all-conditions option.", pitchFit: { flat: 0.2, green: 0.2, dusty: 0.2, slow: 0.2 }, battingEffect: 0, bowlingEffect: 0, chaseBonus: 0.03 },
  { id: "aggressive", label: "Aggressive Calls", desc: "Attack for breakthroughs and momentum swings. High variance.", pitchFit: { flat: 0.8, green: 0.8, dusty: -0.2, slow: -0.4 }, battingEffect: 0.06, bowlingEffect: 0.04, chaseBonus: -0.02 },
];

  window.CricketManagerData = {
    SETTINGS,
    DIFFICULTIES,
    SPEEDS,
    FRANCHISES,
    PITCH_TYPES,
    BATTING_TACTICS,
    POWERPLAY_TACTICS,
    DEATH_TACTICS,
    FIELD_SETTINGS,
    MIDDLE_TACTICS,
    CAPTAINCY_TACTICS,
    generatePlayers,
    roundPrice,
  };
})();

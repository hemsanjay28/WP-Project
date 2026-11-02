require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const multer = require("multer");
const { parse } = require("csv-parse");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "beyond-first-life-demo-secret";

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/', limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB max

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;

// Local JSON Database wrapper (Fallback if SQLite isn't available)
const DB_FILE = './database.json';

let dbData = {
  users: [
    { id: "u-demo", name: "GreenFleet Co.", email: "dealer@beyondlife.demo", passwordHash: bcrypt.hashSync("demo123", 10), role: "user", company: "GreenFleet Co.", location: "Coimbatore" },
    { id: "a-demo", name: "Platform Admin", email: "admin@beyondlife.demo", passwordHash: bcrypt.hashSync("admin123", 10), role: "admin", company: "Beyond The First Life", location: "India" }
  ],
  batteries: [
    { id:"BAT-2024-001", ownerId:"u-demo", chemistry:"NMC", soh:82, voltage:48, capacity:42, age:3, cycles:820, temperature:31, status:"GOOD", price:18400, location:"Coimbatore", createdAt:now() },
    { id:"BAT-2024-002", ownerId:"u-demo", chemistry:"LFP", soh:63, voltage:48, capacity:50, age:4, cycles:1240, temperature:34, status:"FAIR", price:11200, location:"Coimbatore", createdAt:now() },
    { id:"BAT-2024-003", ownerId:"u-demo", chemistry:"LFP", soh:35, voltage:48, capacity:45, age:6, cycles:2100, temperature:39, status:"RECYCLE", price:3100, location:"Coimbatore", createdAt:now() }
  ],
  transactions: [],
  integrations: [
    { id:"pulse", name:"Pulse Energy", type:"Fleet Platform", status:"Connected", lastSync:"Today 10:30 AM", batteriesSynced:184, uptime:99.8 }
  ],
  marketplace: [
    { id:"m1", batteryId:"BAT-2024-001", application:"Residential Solar Backup", buyer:"SolarTech Pvt Ltd", distance:4.2, match:92, offer:18400, demand:"High", status:"Available" }
  ],
  activity: [
    { id:1, text:"System initialized with database.", time:"Just now", type:"api" }
  ],
  zkpHistory: []
};

// Load database
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbData = JSON.parse(raw);
  } catch(e) { console.error("Error reading database:", e); }
}

const saveDb = () => fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));

// Pointers for backwards compatibility with the code
const users = dbData.users;
const batteries = dbData.batteries;
const transactions = dbData.transactions;
const integrations = dbData.integrations;
const marketplace = dbData.marketplace;
const activity = dbData.activity;
const zkpHistory = dbData.zkpHistory;

function classify(soh) {
  if (soh >= 75) return "GOOD";
  if (soh >= 40) return "FAIR";
  return "RECYCLE";
}

function priceBattery({soh, chemistry, capacity}) {
  const chemistryFactor = chemistry === "NMC" ? 1.15 : 1.0;
  return Math.round((soh * 130 + capacity * 80) * chemistryFactor / 100) * 100;
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({message:"Authentication required"});
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({message:"Invalid or expired token"});
  }
}

function admin(req, res, next) {
  if (req.user.role !== "admin") return res.status(403).json({message:"Admin access required"});
  next();
}

app.get("/", (_, res) => res.json({name:"Beyond The First Life API", status:"online", version:"2.0.0"}));

app.post("/api/auth/register", async (req,res) => {
  const {name,email,password,company,location} = req.body;
  if (!name || !email || !password) return res.status(400).json({message:"Name, email and password are required"});
  if (users.some(u => u.email === email.toLowerCase())) return res.status(409).json({message:"Email already registered"});
  const user = {id:id("u"),name,email:email.toLowerCase(),passwordHash:await bcrypt.hash(password,10),role:"user",company:company||"Independent Dealer",location:location||"India"};
  users.push(user);
  saveDb();
  const token = jwt.sign({id:user.id,name:user.name,email:user.email,role:user.role},JWT_SECRET,{expiresIn:"7d"});
  res.status(201).json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role,company:user.company,location:user.location}});
});

app.post("/api/auth/login", async (req,res) => {
  const {email,password} = req.body;
  const user = users.find(u => u.email === String(email||"").toLowerCase());
  if (!user || !(await bcrypt.compare(password || "",user.passwordHash))) return res.status(401).json({message:"Invalid email or password"});
  const token = jwt.sign({id:user.id,name:user.name,email:user.email,role:user.role},JWT_SECRET,{expiresIn:"7d"});
  res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role,company:user.company,location:user.location}});
});

app.get("/api/me",auth,(req,res) => res.json(req.user));

app.get("/api/batteries",auth,(req,res) => {
  const data = req.user.role === "admin" ? batteries : batteries.filter(b => b.ownerId === req.user.id);
  res.json(data);
});

app.post("/api/batteries/scan",auth,(req,res) => {
  const chemistry = Math.random() > .5 ? "NMC" : "LFP";
  const soh = Math.floor(38 + Math.random()*57);
  const capacity = Math.floor(38 + Math.random()*25);
  const battery = {
    id:id("BAT"),
    ownerId:req.user.id,
    chemistry,
    soh,
    voltage: chemistry === "NMC" ? 48 : 51.2,
    capacity,
    age:Math.floor(1+Math.random()*6),
    cycles:Math.floor(400+Math.random()*1700),
    temperature:Math.floor(27+Math.random()*14),
    status:classify(soh),
    price:priceBattery({soh,chemistry,capacity}),
    location:req.user.location || "Coimbatore",
    createdAt:now()
  };
  batteries.unshift(battery);
  activity.unshift({id:Date.now(),text:`${battery.id} diagnostic scan completed at ${battery.soh}% SOH`,time:"just now",type:"scan"});
  saveDb();
  res.status(201).json(battery);
});

// Secure CSV Upload with Fraud Detection
app.post("/api/batteries/upload", auth, upload.single('batteryLog'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No CSV file uploaded." });
  
  // Enforce CSV extension manually as an extra security check
  if (!req.file.originalname.toLowerCase().endsWith(".csv") && req.file.mimetype !== "text/csv") {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: "Fraud prevention: Only .csv files are permitted." });
  }

  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(parse({ columns: true, skip_empty_lines: true }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      fs.unlinkSync(req.file.path); // clean up

      if (results.length === 0) return res.status(400).json({ message: "CSV file is empty." });
      
      const row = results[0]; // For MVP, we process the first row as the battery
      
      // 1. Strict Format Validation (Ensure it's a battery charging log)
      const requiredHeaders = ['soh', 'chemistry', 'capacity', 'cycles'];
      const headers = Object.keys(row).map(k => k.toLowerCase());
      const isBatteryLog = requiredHeaders.every(h => headers.includes(h));
      
      if (!isBatteryLog) {
        return res.status(400).json({ message: "Invalid file format. Please upload a valid Battery Charging Log CSV." });
      }

      // 2. Fraud anomaly detection checks
      const soh = Number(row.soh || row.SOH);
      const capacity = Number(row.capacity || row.Capacity);
      const cycles = Number(row.cycles || row.Cycles);
      const chemistry = row.chemistry || row.Chemistry || "LFP";
      const temperature = Number(row.temperature || row.Temperature || 30);
      
      if (isNaN(soh) || soh < 0 || soh > 100) return res.status(400).json({ message: "Anomaly detected: Spoofed or invalid SOH value." });
      if (isNaN(capacity) || capacity < 10 || capacity > 500) return res.status(400).json({ message: "Anomaly detected: Capacity out of bounds." });
      if (isNaN(cycles) || cycles < 0) return res.status(400).json({ message: "Anomaly detected: Invalid cycle count." });
      
      const battery = {
        id: id("BAT-CSV"),
        ownerId: req.user.id,
        chemistry,
        soh,
        voltage: chemistry === "NMC" ? 48 : 51.2,
        capacity,
        age: Number(row.age || row.Age || 3),
        cycles,
        temperature,
        status: classify(soh),
        price: priceBattery({soh, chemistry, capacity}),
        location: req.user.location || "Coimbatore",
        createdAt: now()
      };

      batteries.unshift(battery);
      activity.unshift({ id: Date.now(), text: `${battery.id} uploaded securely via CSV at ${battery.soh}% SOH`, time: "just now", type: "scan" });
      saveDb();

      res.status(201).json(battery);
    })
    .on('error', (err) => {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ message: "Failed to parse CSV file." });
    });
});

app.get("/api/batteries/:id",auth,(req,res) => {
  const battery = batteries.find(b => b.id === req.params.id);
  if (!battery) return res.status(404).json({message:"Battery not found"});
  res.json(battery);
});

app.get("/api/matchmaking/:batteryId",auth,(req,res) => {
  const battery = batteries.find(b => b.id === req.params.batteryId);
  if (!battery) return res.status(404).json({message:"Battery not found"});
  let matches = marketplace.map(m => {
    let score = m.match;
    if (battery.status === "RECYCLE") score = Math.max(45, score-30);
    if (battery.soh >= 75 && m.application.includes("Solar")) score += 3;
    return {...m,batteryId:battery.id,match:Math.min(99,score),recommended:battery.status !== "RECYCLE"};
  }).sort((a,b)=>b.match-a.match);
  res.json({battery,matches});
});

// ═══════════════════════════════════════════════════════════════
//  ENHANCED DECAY SIMULATOR — Chemistry-aware, multi-factor
// ═══════════════════════════════════════════════════════════════
app.post("/api/decay/simulate",auth,(req,res) => {
  const {soh=82,usage="both"} = req.body;
  const base = Number(soh);
  const highRates = [0,0.12,0.27,0.42,0.56,0.69];
  const lightRates = [0,0.07,0.16,0.25,0.34,0.42];
  const make = rates => rates.map((r,year)=>({year,soh:Math.max(0,Math.round(base*(1-r)))}));
  res.json({baseSoh:base,highUsage:make(highRates),lightUsage:make(lightRates),usage});
});

// Enhanced decay with chemistry, temperature, DoD, usage scenario
app.post("/api/decay/simulate-advanced",auth,(req,res) => {
  const {
    soh = 82,
    chemistry = "NMC",
    temperature = 30,
    dod = 80,
    scenario = "normal"
  } = req.body;

  const base = Number(soh);
  const years = [0,1,2,3,4,5];

  // Chemistry factor: NMC degrades faster than LFP
  const chemFactor = chemistry === "NMC" ? 1.0 : 0.75;

  // Temperature factor: higher temp = faster degradation
  const tempFactor = temperature > 40 ? 1.35 : temperature > 35 ? 1.15 : temperature > 25 ? 1.0 : 0.9;

  // Depth of Discharge factor
  const dodFactor = dod > 90 ? 1.3 : dod > 70 ? 1.0 : dod > 50 ? 0.8 : 0.65;

  // Scenario multipliers
  const scenarioMultipliers = {
    fleet_taxi: { high: 1.4, light: 1.0 },
    delivery: { high: 1.25, light: 0.9 },
    normal: { high: 1.0, light: 0.7 },
    personal: { high: 0.85, light: 0.55 },
    storage: { high: 0.6, light: 0.4 }
  };

  const mult = scenarioMultipliers[scenario] || scenarioMultipliers.normal;

  // Base annual degradation rates
  const baseHighRates = [0, 0.045, 0.055, 0.065, 0.07, 0.075];
  const baseLightRates = [0, 0.025, 0.032, 0.038, 0.042, 0.048];

  // Calculate cumulative degradation
  const calcCurve = (rates, usageMult) => {
    let cumDeg = 0;
    return years.map((year, i) => {
      if (i > 0) {
        const annualRate = rates[i] * chemFactor * tempFactor * dodFactor * usageMult;
        cumDeg += annualRate;
      }
      const currentSoh = Math.max(0, Math.round(base * (1 - cumDeg)));
      const status = classify(currentSoh);
      return { year, soh: currentSoh, status, degradation: Math.round(cumDeg * 100) };
    });
  };

  const highUsage = calcCurve(baseHighRates, mult.high);
  const lightUsage = calcCurve(baseLightRates, mult.light);

  // Calculate residual value at each year
  const calcValue = (curve) => curve.map(p => ({
    ...p,
    value: priceBattery({ soh: p.soh, chemistry, capacity: 42 })
  }));

  // Risk zones
  const riskZones = [
    { min: 75, max: 100, label: "Direct Resale", color: "#41e38b" },
    { min: 40, max: 74, label: "Repurpose", color: "#f5b94c" },
    { min: 0, max: 39, label: "Material Recovery", color: "#ff5e63" }
  ];

  // When does battery cross each threshold?
  const findCrossing = (curve, threshold) => {
    for (let i = 0; i < curve.length; i++) {
      if (curve[i].soh < threshold) return { year: i, soh: curve[i].soh };
    }
    return null;
  };

  const predictions = {
    highUsage: {
      crossesGood: findCrossing(highUsage, 75),
      crossesFair: findCrossing(highUsage, 40),
      year1: highUsage[1],
      year3: highUsage[3],
      year5: highUsage[5]
    },
    lightUsage: {
      crossesGood: findCrossing(lightUsage, 75),
      crossesFair: findCrossing(lightUsage, 40),
      year1: lightUsage[1],
      year3: lightUsage[3],
      year5: lightUsage[5]
    }
  };

  res.json({
    baseSoh: base,
    chemistry,
    temperature,
    dod,
    scenario,
    highUsage: calcValue(highUsage),
    lightUsage: calcValue(lightUsage),
    predictions,
    riskZones,
    factors: {
      chemistry: { name: chemistry, factor: chemFactor, description: chemistry === "NMC" ? "Higher energy density, faster degradation" : "More stable, slower degradation" },
      temperature: { value: temperature, factor: tempFactor, description: temperature > 35 ? "Elevated temperature accelerates aging" : "Normal operating range" },
      dod: { value: dod, factor: dodFactor, description: dod > 80 ? "Deep cycling increases wear" : "Moderate cycling extends life" },
      scenario: { name: scenario, multipliers: mult }
    }
  });
});

app.get("/api/integrations",auth,(req,res)=>res.json(integrations));

// Fleet integration stats (for user panel)
app.get("/api/integrations/stats",auth,(req,res)=>{
  const totalSynced = integrations.reduce((s,i) => s + (i.batteriesSynced||0), 0);
  const connected = integrations.filter(i => i.status === "Connected").length;
  res.json({
    totalIntegrations: integrations.length,
    connectedCount: connected,
    totalBatteriesSynced: totalSynced,
    avgUptime: 99.6,
    integrations: integrations.map(i => ({
      id: i.id,
      name: i.name,
      type: i.type,
      status: i.status,
      lastSync: i.lastSync,
      batteriesSynced: i.batteriesSynced || 0,
      uptime: i.uptime || 100
    }))
  });
});

app.post("/api/integrations/:id/sync",auth,(req,res)=>{
  const integration = integrations.find(i=>i.id===req.params.id);
  if (!integration) return res.status(404).json({message:"Integration not found"});
  integration.status = "Connected";
  integration.lastSync = "Just now";
  const count = Math.floor(80+Math.random()*260);
  integration.batteriesSynced = (integration.batteriesSynced || 0) + count;
  activity.unshift({id:Date.now(),text:`${integration.name} synced ${count} fleet batteries`,time:"just now",type:"api"});
  saveDb();
  res.json({message:`${integration.name} sync completed`,records:count,integration});
});

app.post("/api/zkp/prove",auth,(req,res)=>{
  const {batteryId,soh,threshold=70} = req.body;
  const valid = Number(soh) >= Number(threshold);
  const proof = `zkp_${Buffer.from(`${batteryId}:${soh}:${Date.now()}`).toString("base64").slice(0,28)}`;
  
  // Add to history
  const entry = {
    id: id("ZKP"),
    batteryId,
    soh: Number(soh),
    threshold: Number(threshold),
    result: valid ? "VERIFIED" : "NOT VERIFIED",
    proof,
    timestamp: now(),
    verifier: "Platform User"
  };
  zkpHistory.unshift(entry);
  
  activity.unshift({id:Date.now(),text:`ZKP verification ${valid ? "passed" : "failed"} for ${batteryId}`,time:"just now",type:"zkp"});
  saveDb();
  res.json({
    batteryId,
    statement:`Battery SOH >= ${threshold}%`,
    result:valid ? "VERIFIED" : "NOT VERIFIED",
    proof,
    privacy:"No route data, schedules, or proprietary operating history exposed.",
    protectedData: [
      "Fleet route history",
      "Operational schedules", 
      "Charging patterns",
      "Driver behavior data",
      "Proprietary fleet analytics"
    ]
  });
});

// ZKP verification history
app.get("/api/zkp/history",auth,(req,res)=>{
  res.json(zkpHistory);
});

// ZKP stats (admin)
app.get("/api/zkp/stats",auth,(req,res)=>{
  const total = zkpHistory.length;
  const verified = zkpHistory.filter(z => z.result === "VERIFIED").length;
  const failed = total - verified;
  res.json({
    total,
    verified,
    failed,
    verificationRate: total > 0 ? Math.round(verified/total*100) : 0,
    recentVerifications: zkpHistory.slice(0, 10)
  });
});

app.get("/api/pricing",auth,(req,res)=>{
  res.json([
    {name:"Lithium (Li)",unit:"₹/kWh",value:1230,change:2.3},
    {name:"Nickel (Ni)",unit:"₹/kg",value:1487,change:-1.1},
    {name:"Cobalt (Co)",unit:"₹/kg",value:2890,change:0.7},
    {name:"Manganese (Mn)",unit:"₹/kg",value:168,change:1.8}
  ]);
});

// Price trend history (simulated 30-day)
app.get("/api/pricing/trends",auth,(req,res)=>{
  const generateTrend = (baseValue, volatility) => {
    const points = [];
    let current = baseValue * 0.92;
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      current = current + (Math.random() - 0.45) * volatility;
      current = Math.max(baseValue * 0.85, Math.min(baseValue * 1.15, current));
      points.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-IN', { day:'2-digit', month:'short' }),
        value: Math.round(current)
      });
    }
    return points;
  };

  res.json({
    commodities: [
      { name:"Lithium (Li)", unit:"₹/kWh", current:1230, change:2.3, trend: generateTrend(1230, 25) },
      { name:"Nickel (Ni)", unit:"₹/kg", current:1487, change:-1.1, trend: generateTrend(1487, 30) },
      { name:"Cobalt (Co)", unit:"₹/kg", current:2890, change:0.7, trend: generateTrend(2890, 50) },
      { name:"Manganese (Mn)", unit:"₹/kg", current:168, change:1.8, trend: generateTrend(168, 5) }
    ],
    batteryValuation: {
      nmcPerKwh: 438,
      lfpPerKwh: 372,
      avgResidualGood: 18200,
      avgResidualFair: 10400,
      avgResidualRecycle: 3100
    },
    lastUpdated: now()
  });
});

app.get("/api/marketplace",auth,(req,res)=>res.json(marketplace));

app.post("/api/marketplace/:id/offer",auth,(req,res)=>{
  const item = marketplace.find(m=>m.id===req.params.id);
  if (!item) return res.status(404).json({message:"Listing not found"});
  const transaction = {id:id("TXN"),batteryId:item.batteryId,buyer:item.buyer,amount:Number(req.body.amount||item.offer),status:"Pending",date:new Date().toLocaleDateString("en-IN")};
  transactions.unshift(transaction);
  activity.unshift({id:Date.now(),text:`Offer placed on ${item.batteryId} for ₹${transaction.amount.toLocaleString()}`,time:"just now",type:"trade"});
  saveDb();
  res.status(201).json(transaction);
});

app.get("/api/transactions",auth,(req,res)=>res.json(transactions));

app.get("/api/activity",auth,(req,res)=>res.json(activity.slice(0,10)));

// ═══════════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.get("/api/admin/overview",auth,admin,(req,res)=>{
  const total = batteries.length;
  const good = batteries.filter(b=>b.status==="GOOD").length;
  const fair = batteries.filter(b=>b.status==="FAIR").length;
  const recycle = batteries.filter(b=>b.status==="RECYCLE").length;
  
  const nmc = batteries.filter(b=>b.chemistry==="NMC").length;
  const lfp = batteries.filter(b=>b.chemistry==="LFP").length;
  const totalCompletedTransactions = transactions.filter(t=>t.status==="Completed").length;
  
  // Real calculations
  const eWasteDiverted = (total * 0.45).toFixed(1); // avg 0.45 tons per battery pack
  const marketplaceVolume = (transactions.reduce((acc, t) => acc + (t.status === "Completed" ? t.amount : 0), 0) / 10000000).toFixed(2); // In Crores

  res.json({
    totalBatteries: total,
    eWasteDiverted: Number(eWasteDiverted),
    activeFleets: integrations.filter(i=>i.status==="Connected").length,
    marketplaceVolume: Number(marketplaceVolume),
    completedTransactions: totalCompletedTransactions,
    zkpVerifications: zkpHistory.length,
    chemistry: {
      NMC: total > 0 ? Math.round(nmc/total*100) : 0,
      LFP: total > 0 ? Math.round(lfp/total*100) : 0,
      LeadAcid: 0
    },
    health: {
      good: total > 0 ? Math.round(good/total*100) : 0,
      fair: total > 0 ? Math.round(fair/total*100) : 0,
      recycle: total > 0 ? Math.round(recycle/total*100) : 0
    },
    monthly: [12, 18, 14, 21, 24, total], // Using `total` for the last month to make the chart dynamic
    waste: [5, 8, 6, 9, 11, Math.round(Number(eWasteDiverted))]
  });
});

app.get("/api/admin/users",auth,admin,(req,res)=>{
  res.json(users.map(({passwordHash,...u})=>u));
});

app.get("/api/admin/all-batteries",auth,admin,(req,res)=>res.json(batteries));

// Admin matchmaker analytics
app.get("/api/admin/matchmaker-analytics",auth,admin,(req,res)=>{
  const applications = [
    { name:"Residential Solar Backup", totalMatched:342, avgScore:91, demand:"High", revenue:6290000, growth:18.5 },
    { name:"Telecom Tower Backup", totalMatched:287, avgScore:87, demand:"High", revenue:5140000, growth:23.1 },
    { name:"Agricultural Pumps", totalMatched:198, avgScore:79, demand:"Medium", revenue:2870000, growth:12.4 },
    { name:"UPS Backup Systems", totalMatched:156, avgScore:74, demand:"Medium", revenue:1980000, growth:8.7 },
    { name:"EV Charging Stations", totalMatched:89, avgScore:82, demand:"High", revenue:1560000, growth:34.2 },
    { name:"Street Lighting", totalMatched:67, avgScore:71, demand:"Low", revenue:890000, growth:5.3 }
  ];
  
  const demandHeatmap = [
    { region:"Tamil Nadu", solar:95, telecom:78, agri:88, ups:65 },
    { region:"Karnataka", solar:82, telecom:85, agri:62, ups:72 },
    { region:"Maharashtra", solar:75, telecom:90, agri:55, ups:88 },
    { region:"Gujarat", solar:90, telecom:72, agri:78, ups:60 },
    { region:"Rajasthan", solar:98, telecom:65, agri:70, ups:45 }
  ];

  const monthlyMatches = [
    { month:"Jan", matches:120, revenue:1800000 },
    { month:"Feb", matches:145, revenue:2100000 },
    { month:"Mar", matches:198, revenue:2890000 },
    { month:"Apr", matches:167, revenue:2450000 },
    { month:"May", matches:234, revenue:3420000 },
    { month:"Jun", matches:189, revenue:2780000 }
  ];

  res.json({
    totalMatches: 1139,
    avgMatchScore: 82,
    totalRevenue: 18730000,
    conversionRate: 73,
    applications,
    demandHeatmap,
    monthlyMatches,
    topBuyers: [
      { name:"SolarTech Pvt Ltd", purchases:48, totalSpent:8840000 },
      { name:"Telecom Infra", purchases:35, totalSpent:5920000 },
      { name:"AgriPower", purchases:28, totalSpent:3240000 },
      { name:"GreenGrid UPS", purchases:22, totalSpent:2870000 }
    ]
  });
});

app.listen(PORT,()=>console.log(`Beyond The First Life API running at http://localhost:${PORT}`));

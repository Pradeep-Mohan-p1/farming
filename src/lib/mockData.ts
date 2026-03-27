export const diseases = [
  { name: "Leaf Blight", crop: "Rice", confidence: 87, remedy: "Apply fungicide and remove infected leaves." },
  { name: "Powdery Mildew", crop: "Wheat", confidence: 92, remedy: "Use sulfur-based spray and ensure air circulation." },
  { name: "Tomato Mosaic Virus", crop: "Tomato", confidence: 78, remedy: "Remove infected plants, disinfect tools." },
  { name: "Bacterial Wilt", crop: "Potato", confidence: 85, remedy: "Rotate crops and use resistant varieties." },
  { name: "Anthracnose", crop: "Mango", confidence: 90, remedy: "Prune infected branches, apply copper fungicide." },
  { name: "Late Blight", crop: "Potato", confidence: 94, remedy: "Apply metalaxyl-based fungicide immediately." },
  { name: "Downy Mildew", crop: "Grapes", confidence: 81, remedy: "Apply Bordeaux mixture before rainy season." },
  { name: "Rust", crop: "Wheat", confidence: 88, remedy: "Use resistant varieties and apply triazole fungicide." },
];

export const weatherData = {
  current: { temp: 28, humidity: 72, wind: 12, condition: "Partly Cloudy", rainfall: 5 },
  forecast: [
    { day: "Mon", temp: 29, condition: "sunny", rainfall: 0 },
    { day: "Tue", temp: 27, condition: "cloudy", rainfall: 2 },
    { day: "Wed", temp: 25, condition: "rainy", rainfall: 18 },
    { day: "Thu", temp: 26, condition: "rainy", rainfall: 12 },
    { day: "Fri", temp: 28, condition: "sunny", rainfall: 0 },
  ],
};

export const cropRecommendations = [
  { name: "Rice", score: 92, reason: "High rainfall and warm temperatures are ideal for paddy cultivation.", icon: "🌾", season: "Kharif" },
  { name: "Wheat", score: 78, reason: "Cool temperatures and moderate humidity suit wheat growth.", icon: "🌿", season: "Rabi" },
  { name: "Tomato", score: 85, reason: "Warm climate with good drainage supports tomato farming.", icon: "🍅", season: "Year-round" },
  { name: "Sugarcane", score: 70, reason: "Tropical climate with adequate water supply.", icon: "🎋", season: "Kharif" },
  { name: "Cotton", score: 65, reason: "Semi-arid conditions with moderate rainfall.", icon: "☁️", season: "Kharif" },
  { name: "Maize", score: 88, reason: "Warm season crop that thrives in well-drained loamy soil.", icon: "🌽", season: "Kharif" },
];

export const alerts = [
  { type: "warning", title: "Heavy Rainfall Expected", message: "Rainfall of 50mm+ expected in next 48 hours. Secure crops.", time: "2 hours ago" },
  { type: "danger", title: "Pest Alert: Aphids Detected", message: "Aphid infestation reported in nearby farms. Inspect crops.", time: "5 hours ago" },
  { type: "info", title: "Best Time to Fertilize", message: "Soil moisture levels are optimal for fertilizer application.", time: "1 day ago" },
  { type: "success", title: "Harvest Ready", message: "Your wheat crop has reached maturity. Plan harvest within 5 days.", time: "1 day ago" },
];

export const farmingTips = [
  { title: "Soil Testing", tip: "Test soil pH and nutrients every season for optimal yield.", category: "Preparation" },
  { title: "Crop Rotation", tip: "Rotate crops to prevent soil depletion and reduce pest buildup.", category: "Best Practice" },
  { title: "Water Management", tip: "Use drip irrigation to save 40-60% water compared to flood irrigation.", category: "Irrigation" },
  { title: "Organic Composting", tip: "Create compost from crop residue to enrich soil naturally.", category: "Organic" },
  { title: "Integrated Pest Management", tip: "Combine biological, cultural, and chemical methods for pest control.", category: "Pest Control" },
  { title: "Mulching", tip: "Apply mulch to retain soil moisture and suppress weeds.", category: "Soil Health" },
];

export const growthStages = ["Seed", "Germination", "Vegetative", "Flowering", "Fruiting", "Harvest"] as const;

export type GrowthStage = typeof growthStages[number];

export interface Crop {
  id: string;
  name: string;
  plantingDate: string;
  stage: GrowthStage;
  status: "healthy" | "attention";
  daysToHarvest: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: "seeds" | "fertilizers" | "tools";
  quantity: number;
  unit: string;
  lowStockThreshold: number;
}

export const defaultCrops: Crop[] = [
  { id: "1", name: "Rice", plantingDate: "2026-02-15", stage: "Flowering", status: "healthy", daysToHarvest: 30 },
  { id: "2", name: "Wheat", plantingDate: "2026-01-10", stage: "Vegetative", status: "attention", daysToHarvest: 60 },
  { id: "3", name: "Tomato", plantingDate: "2026-03-01", stage: "Germination", status: "healthy", daysToHarvest: 75 },
];

export const defaultInventory: InventoryItem[] = [
  { id: "1", name: "Rice Seeds", category: "seeds", quantity: 50, unit: "kg", lowStockThreshold: 10 },
  { id: "2", name: "Urea Fertilizer", category: "fertilizers", quantity: 5, unit: "bags", lowStockThreshold: 3 },
  { id: "3", name: "Spade", category: "tools", quantity: 3, unit: "pcs", lowStockThreshold: 1 },
  { id: "4", name: "DAP Fertilizer", category: "fertilizers", quantity: 2, unit: "bags", lowStockThreshold: 3 },
  { id: "5", name: "Wheat Seeds", category: "seeds", quantity: 30, unit: "kg", lowStockThreshold: 10 },
];

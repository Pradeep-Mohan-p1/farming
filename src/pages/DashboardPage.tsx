import { motion } from "framer-motion";
import { Sprout, CloudSun, Bell, TrendingUp, Droplets, Thermometer } from "lucide-react";
import { defaultCrops, weatherData } from "@/lib/mockData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Crop } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";

const growthChartData = [
  { week: "W1", growth: 10 }, { week: "W2", growth: 25 }, { week: "W3", growth: 42 },
  { week: "W4", growth: 58 }, { week: "W5", growth: 70 }, { week: "W6", growth: 85 },
];

const yieldData = [
  { crop: "Rice", yield: 4200 }, { crop: "Wheat", yield: 3100 },
  { crop: "Tomato", yield: 5600 }, { crop: "Maize", yield: 3800 },
];

const DashboardPage = () => {
  const [crops] = useLocalStorage<Crop[]>("smartfarm-crops", defaultCrops);

  const stats = [
    { label: "Total Crops", value: crops.length, icon: Sprout, color: "text-primary" },
    { label: "Healthy", value: crops.filter(c => c.status === "healthy").length, icon: TrendingUp, color: "text-success" },
    { label: "Temperature", value: `${weatherData.current.temp}°C`, icon: Thermometer, color: "text-secondary" },
    { label: "Humidity", value: `${weatherData.current.humidity}%`, icon: Droplets, color: "text-info" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="page-subtitle">Overview of your farm</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="stat-card">
          <h3 className="font-semibold mb-4">Crop Growth Progress</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={growthChartData}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 50%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 50%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="growth" stroke="hsl(142, 50%, 36%)" fill="url(#growthGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="font-semibold mb-4">Yield Prediction (kg/acre)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={yieldData}>
              <XAxis dataKey="crop" axisLine={false} tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="yield" fill="hsl(142, 50%, 36%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stat-card">
        <h3 className="font-semibold mb-4">Crop Status</h3>
        <div className="space-y-4">
          {crops.map((crop) => {
            const stageIndex = ["Seed", "Germination", "Vegetative", "Flowering", "Fruiting", "Harvest"].indexOf(crop.stage);
            const progress = ((stageIndex + 1) / 6) * 100;
            return (
              <div key={crop.id} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{crop.name}</div>
                <div className="flex-1">
                  <Progress value={progress} className="h-2" />
                </div>
                <span className="text-xs text-muted-foreground w-20 text-right">{crop.stage}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  crop.status === "healthy" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                }`}>
                  {crop.status === "healthy" ? "Healthy" : "Attention"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Cloud, CloudRain, Droplets, Wind, Thermometer, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { weatherData } from "@/lib/mockData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const conditionIcons: Record<string, React.ReactNode> = {
  sunny: <Sun className="w-8 h-8 text-secondary" />,
  cloudy: <Cloud className="w-8 h-8 text-muted-foreground" />,
  rainy: <CloudRain className="w-8 h-8 text-info" />,
};

const WeatherPage = () => {
  const [location, setLocation] = useState("Coimbatore, Tamil Nadu");
  const { current, forecast } = weatherData;

  const tempData = forecast.map(d => ({ day: d.day, temp: d.temp, rainfall: d.rainfall }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">🌦️ Weather Prediction</h1>
        <p className="page-subtitle">Simulated weather data for your area</p>
      </div>

      <div className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={location} onChange={e => setLocation(e.target.value)} className="pl-9" placeholder="Enter location" />
        </div>
        <Button>Update</Button>
      </div>

      {/* Current weather */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Sun className="w-16 h-16 text-secondary" />
            <div>
              <p className="text-4xl font-bold">{current.temp}°C</p>
              <p className="text-muted-foreground">{current.condition}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 md:ml-auto">
            <div className="text-center">
              <Droplets className="w-5 h-5 text-info mx-auto mb-1" />
              <p className="text-lg font-bold">{current.humidity}%</p>
              <p className="text-xs text-muted-foreground">Humidity</p>
            </div>
            <div className="text-center">
              <Wind className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{current.wind} km/h</p>
              <p className="text-xs text-muted-foreground">Wind</p>
            </div>
            <div className="text-center">
              <CloudRain className="w-5 h-5 text-info mx-auto mb-1" />
              <p className="text-lg font-bold">{current.rainfall} mm</p>
              <p className="text-xs text-muted-foreground">Rainfall</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5-day forecast */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {forecast.map((day, i) => (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card text-center"
          >
            <p className="text-sm font-medium text-muted-foreground mb-2">{day.day}</p>
            <div className="flex justify-center mb-2">{conditionIcons[day.condition]}</div>
            <p className="text-xl font-bold">{day.temp}°C</p>
            <p className="text-xs text-muted-foreground mt-1">{day.rainfall}mm rain</p>
          </motion.div>
        ))}
      </div>

      {/* Temperature chart */}
      <div className="stat-card">
        <h3 className="font-semibold mb-4">Temperature & Rainfall Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={tempData}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} />
            <YAxis axisLine={false} tickLine={false} fontSize={12} />
            <Tooltip />
            <Line type="monotone" dataKey="temp" stroke="hsl(38, 70%, 55%)" strokeWidth={2} dot={{ r: 4 }} name="Temp (°C)" />
            <Line type="monotone" dataKey="rainfall" stroke="hsl(200, 80%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Rain (mm)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeatherPage;

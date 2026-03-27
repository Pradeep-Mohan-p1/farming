import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cropRecommendations } from "@/lib/mockData";

const CropRecommendationPage = () => {
  const [location, setLocation] = useState("");
  const [shown, setShown] = useState(false);

  const handleRecommend = () => setShown(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">🌾 Crop Recommendations</h1>
        <p className="page-subtitle">Get smart crop suggestions based on your conditions</p>
      </div>

      <div className="stat-card max-w-lg">
        <h3 className="font-semibold mb-3">Enter Your Location</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={location} onChange={e => setLocation(e.target.value)} className="pl-9" placeholder="e.g., Coimbatore" />
          </div>
          <Button onClick={handleRecommend} className="gap-2">
            <Lightbulb className="w-4 h-4" /> Recommend
          </Button>
        </div>
      </div>

      {shown && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {cropRecommendations.map((crop, i) => (
            <motion.div
              key={crop.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="stat-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{crop.icon}</span>
                <div>
                  <h3 className="font-semibold">{crop.name}</h3>
                  <p className="text-xs text-muted-foreground">{crop.season} season</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Suitability</span>
                  <span className="font-medium">{crop.score}%</span>
                </div>
                <Progress value={crop.score} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{crop.reason}</p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CropRecommendationPage;

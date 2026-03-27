import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle2, CloudRain, Lightbulb, Shield } from "lucide-react";
import { alerts, farmingTips } from "@/lib/mockData";

const alertStyles: Record<string, { icon: React.ReactNode; border: string; bg: string }> = {
  warning: { icon: <AlertTriangle className="w-5 h-5 text-warning" />, border: "border-warning/30", bg: "bg-warning/5" },
  danger: { icon: <AlertTriangle className="w-5 h-5 text-destructive" />, border: "border-destructive/30", bg: "bg-destructive/5" },
  info: { icon: <Info className="w-5 h-5 text-info" />, border: "border-info/30", bg: "bg-info/5" },
  success: { icon: <CheckCircle2 className="w-5 h-5 text-success" />, border: "border-success/30", bg: "bg-success/5" },
};

const tipIcons: Record<string, React.ReactNode> = {
  Preparation: <Lightbulb className="w-4 h-4" />,
  "Best Practice": <Shield className="w-4 h-4" />,
  Irrigation: <CloudRain className="w-4 h-4" />,
  Organic: <CheckCircle2 className="w-4 h-4" />,
  "Pest Control": <AlertTriangle className="w-4 h-4" />,
  "Soil Health": <Info className="w-4 h-4" />,
};

const AlertsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">🚨 Alerts & Tips</h1>
        <p className="page-subtitle">Stay informed with weather alerts and farming best practices</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Active Alerts</h2>
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const style = alertStyles[alert.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex gap-3 p-4 rounded-xl border ${style.border} ${style.bg}`}
              >
                <div className="mt-0.5">{style.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{alert.title}</h3>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Farming Tips</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmingTips.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="stat-card"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center text-primary">
                  {tipIcons[tip.category] || <Info className="w-4 h-4" />}
                </div>
                <span className="text-xs font-medium text-muted-foreground">{tip.category}</span>
              </div>
              <h3 className="font-semibold text-sm">{tip.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{tip.tip}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;

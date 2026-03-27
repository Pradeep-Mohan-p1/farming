import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Sprout, Camera, Package, CloudSun, Lightbulb, ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Sprout, title: "Crop Tracking", desc: "Monitor growth stages, timelines, and health status of all your crops." },
  { icon: Camera, title: "Disease Detection", desc: "Upload crop photos and get instant AI-powered disease analysis." },
  { icon: Package, title: "Inventory Management", desc: "Track seeds, fertilizers, and tools with low-stock alerts." },
  { icon: CloudSun, title: "Weather Forecast", desc: "Get 5-day weather predictions and rainfall alerts for your area." },
  { icon: Lightbulb, title: "Crop Recommendations", desc: "Smart suggestions based on weather, soil, and seasonal conditions." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Visual insights into yield predictions and growth progress." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">SmartFarm</span>
        </div>
        <Link to="/dashboard">
          <Button size="sm">Get Started</Button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-6">
            <Sprout className="w-4 h-4" />
            Smart Farming Assistant
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight max-w-3xl mx-auto">
            Grow Smarter,{" "}
            <span className="text-primary">Harvest Better</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Your complete digital farming companion. Track crops, detect diseases,
            manage inventory, and get weather-smart recommendations — all in one place.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 text-base px-6">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/disease">
              <Button variant="outline" size="lg" className="text-base px-6">
                Try Disease Detection
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold">Everything You Need</h2>
          <p className="text-muted-foreground mt-2">Powerful tools designed for modern farmers</p>
        </div>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="stat-card group cursor-default"
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 SmartFarm. Built for modern agriculture.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

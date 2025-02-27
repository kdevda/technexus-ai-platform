import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart2, Bot, Cloud, Shield, Users, Workflow } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  const solutions = [
    {
      title: "Intelligent CRM",
      description: "AI-powered customer relationship management with predictive insights",
      icon: Users,
      features: ["Lead Scoring", "360° Customer View", "Automated Workflows"],
    },
    {
      title: "Smart Originations",
      description: "Streamlined loan origination with automated decisioning",
      icon: Workflow,
      features: ["Digital Applications", "Automated Underwriting", "Risk Assessment"],
    },
    {
      title: "AI Servicing",
      description: "Efficient loan servicing with intelligent automation",
      icon: Bot,
      features: ["Payment Processing", "Account Management", "Collections Strategy"],
    },
  ];

  const modules = [
    {
      icon: "📄",
      title: "AI-Powered Loan Origination",
      badge: "OriginateAI",
      description: "Smart application process with AI-driven workflows & instant decisioning.",
      features: ["Intelligent Form Completion", "Smart Document Processing", "Real-time Risk Assessment", "Automated Decisioning"],
    },
    {
      icon: "👥",
      title: "Intelligent Lending CRM",
      badge: "RelationAI",
      description: "AI-enhanced borrower management with predictive insights.",
      features: ["Smart Lead Scoring", "Behavior Analytics", "Automated Communication", "Next-Best-Action"],
    },
    {
      icon: "📊",
      title: "Advanced Credit Analysis",
      badge: "RiskAI",
      description: "AI-powered underwriting with adaptive risk models.",
      features: ["Pattern Recognition", "Alternative Data Analysis", "Fraud Detection", "Risk Forecasting"],
    },
    {
      icon: "💳",
      title: "Smart Loan Servicing",
      badge: "ServiceAI",
      description: "Intelligent loan management with predictive servicing.",
      features: ["Payment Optimization", "Default Prediction", "Smart Notifications", "Portfolio Insights"],
    },
    {
      icon: "📈",
      title: "AI Analytics Suite",
      badge: "AnalyticsAI",
      description: "Real-time insights with predictive portfolio analytics.",
      features: ["Performance Prediction", "Risk Forecasting", "Market Analysis", "Custom Reports"],
    },
    {
      icon: "📑",
      title: "Intelligent Document Management",
      badge: "DocAI",
      description: "AI-powered document processing and compliance.",
      features: ["Smart Classification", "Data Extraction", "Compliance Check", "Auto-Verification"],
    },
  ];

  const handleSignUp = () => {
    navigate('/auth/register');
  };

  const handleLogin = () => {
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">TECHNEXUS</h1>
          <Button
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white transition-colors duration-300 ml-auto"
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 bg-white">
          <div className="container mx-auto">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight">
                We are Lending AI
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                Revolutionizing financial services with intelligent automation and human-centered design
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 px-8"
                  onClick={handleSignUp}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white px-8"
                  onClick={handleLogin}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Solutions */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-16">Enterprise Solutions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <solution.icon className="h-12 w-12 text-black mb-6" />
                  <h4 className="text-xl font-semibold mb-4">{solution.title}</h4>
                  <p className="text-gray-600 mb-6">{solution.description}</p>
                  <ul className="space-y-3">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI-Powered Lending Modules */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-16">AI-Powered Lending Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {modules.map((module, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-3xl">{module.icon}</span>
                    <Badge variant="secondary" className="text-sm">
                      {module.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                  <p className="text-gray-600 mb-4">{module.description}</p>
                  <ul className="space-y-2">
                    {module.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">⚡</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-black text-white">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Lending Operations?</h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join leading financial institutions leveraging our AI-powered platform
            </p>
            <Button size="lg" className="bg-white text-black hover:bg-gray-100" onClick={() => navigate("/auth/Login")}>
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;

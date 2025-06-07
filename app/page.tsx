"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  FileText, 
  Users, 
  Building2, 
  ChevronRight, 
  Check, 
  Star,
  Globe,
  Shield,
  TrendingUp,
  Award,
  Zap,
  Search,
  Bell,
  BarChart3,
  Menu,
  X,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" }
};

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 animated-blue-gradient shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white drop-shadow-lg">
                Bidding Insights
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#about" className="text-white/80 hover:text-white transition-colors">
                About
              </Link>
              {session ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white">
                      Dashboard
                    </Button>
                  </Link>
                  <span className="text-white/80 text-sm">
                    Welcome, {session.user?.name || session.user?.email}
                  </span>
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 hover:text-white">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 hover:text-white">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/20 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden py-4 border-t border-white/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex flex-col space-y-4">
                <Link href="#features" className="text-white/80 hover:text-white transition-colors">
                  Features
                </Link>
                <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="#about" className="text-white/80 hover:text-white transition-colors">
                  About
                </Link>
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/20">
                  {session ? (
                    <>
                      <Link href="/dashboard">
                        <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                          Dashboard
                        </Button>
                      </Link>
                      <span className="text-white/80 text-sm text-center py-2">
                        Welcome, {session.user?.name || session.user?.email}
                      </span>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-in">
                        <Button variant="outline" className="w-full bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/sign-up">
                        <Button className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden animated-blue-gradient py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <motion.div {...fadeInUp}>
              <Badge className="mb-8 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/30">
                🇳🇦 Namibia's Premier Tender Platform
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg"
              {...fadeInUp}
            >
              Streamline Your{" "}
              <span className="text-blue-100 drop-shadow-lg">
                Tender Process
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
              {...fadeInUp}
            >
              Connect tender providers with qualified bidders across Namibia. 
              Simplify procurement, enhance transparency, and drive economic growth.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              {...fadeInUp}
            >
              {session ? (
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white hover:text-white px-8 py-4 text-lg shadow-lg transition-all duration-300"
                  >
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button 
                    size="lg" 
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white hover:text-white px-8 py-4 text-lg shadow-lg transition-all duration-300"
                  >
                    Start Free Trial
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:text-white px-8 py-4 text-lg"
              >
                Watch Demo
              </Button>
            </motion.div>

            <motion.div 
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-blue-100"
              {...fadeInUp}
            >
              <span className="text-sm">Trusted by leading organizations:</span>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">Government of Namibia</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">NamPower</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                <span className="text-sm font-medium">TransNamib</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Built for Two Types of Users
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Whether you're posting tenders or bidding on opportunities, 
              Bidding Insights has the perfect solution for you.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Tender Providers */}
            <motion.div variants={scaleIn}>
              <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl w-fit">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">Tender Providers</CardTitle>
                  <CardDescription className="text-slate-600 text-lg">
                    Government departments, SOEs, and private businesses
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Post unlimited tenders with premium plan</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Manage up to 5 tenders on free tier</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Advanced applicant screening tools</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Real-time bid tracking and analytics</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Compliance and transparency features</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link href="/sign-up">
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        Start Posting Tenders
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tender Bidders */}
            <motion.div variants={scaleIn}>
              <Card className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl w-fit">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">Tender Bidders</CardTitle>
                  <CardDescription className="text-slate-600 text-lg">
                    Contractors, suppliers, and service providers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">View all tenders on free account</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">AI-powered bid assistance (Premium)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Advanced tender analytics & insights</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Smart tracking and notifications</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Application management tools</span>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Link href="/sign-up">
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                        Start Bidding Today
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powerful Features for Modern Procurement
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to streamline your tender process and drive business growth.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Search,
                title: "Smart Search",
                description: "AI-powered search and filtering to find relevant opportunities quickly.",
                color: "blue"
              },
              {
                icon: Bell,
                title: "Real-time Notifications",
                description: "Never miss a deadline with instant alerts and reminders.",
                color: "emerald"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Comprehensive insights and reporting for data-driven decisions.",
                color: "purple"
              },
              {
                icon: Shield,
                title: "Security & Compliance",
                description: "Bank-level security with full regulatory compliance.",
                color: "red"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Optimized performance for seamless user experience.",
                color: "yellow"
              },
              {
                icon: Globe,
                title: "Namibian Focus",
                description: "Built specifically for the Namibian market and regulations.",
                color: "indigo"
              }
            ].map((feature, index) => (
              <motion.div key={index} variants={scaleIn}>
                <Card className="h-full bg-white hover:shadow-xl transition-all duration-300 border-slate-200">
                  <CardHeader>
                    <div className={`p-3 bg-${feature.color}-100 rounded-xl w-fit`}>
                      <feature.icon className={`h-6 w-6 text-${feature.color}-600`} />
                    </div>
                    <CardTitle className="text-xl text-slate-900">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid md:grid-cols-4 gap-8 text-center text-white"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { number: "1,500+", label: "Active Tenders" },
              { number: "850+", label: "Registered Companies" },
              { number: "N$2.3B", label: "Total Contract Value" },
              { number: "98%", label: "Success Rate" }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that works best for your organization.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* Free Tender Provider */}
            <motion.div variants={scaleIn}>
              <Card className="h-full bg-white border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Free Provider</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">Free</div>
                  <CardDescription>Perfect for small organizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Up to 5 tender postings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Basic analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Email support</span>
                    </div>
                  </div>
                  <Link href="/sign-up">
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Tender Provider */}
            <motion.div variants={scaleIn}>
              <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-xl transition-all duration-300 relative">
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                  Most Popular
                </Badge>
                <CardHeader>
                  <CardTitle className="text-lg">Premium Provider</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">N$2,500<span className="text-lg font-normal text-slate-600">/mo</span></div>
                  <CardDescription>For growing organizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Unlimited tender postings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Priority support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Custom branding</span>
                    </div>
                  </div>
                  <Link href="/sign-up">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">Start Trial</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Free Bidder */}
            <motion.div variants={scaleIn}>
              <Card className="h-full bg-white border-slate-200 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Free Bidder</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">Free</div>
                  <CardDescription>Browse all opportunities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">View all tenders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Basic search filters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Email notifications</span>
                    </div>
                  </div>
                  <Link href="/sign-up">
                    <Button variant="outline" className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium Bidder */}
            <motion.div variants={scaleIn}>
              <Card className="h-full bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">Premium Bidder</CardTitle>
                  <div className="text-3xl font-bold text-slate-900">N$1,200<span className="text-lg font-normal text-slate-600">/mo</span></div>
                  <CardDescription>Advanced bidding tools</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">AI bid assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Advanced analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Smart tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm">Application management</span>
                    </div>
                  </div>
                  <Link href="/sign-up">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600">Start Trial</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Tender Process?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of organizations already using Bidding Insights to streamline their procurement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {session ? (
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg"
                  >
                    Start Your Free Trial
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-400 text-slate-300 hover:bg-slate-700 px-8 py-4 text-lg"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Bidding Insights
                </span>
              </div>
              <p className="text-slate-600 mb-4 max-w-md">
                Namibia's leading tender platform connecting government, SOEs, 
                and private businesses with qualified service providers.
              </p>
              <div className="flex items-center gap-2 text-slate-500">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Made in Namibia 🇳🇦</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
              <ul className="space-y-2 text-slate-600">
                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
              <ul className="space-y-2 text-slate-600">
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 text-sm">
              © 2025 Bidding Insights. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <span className="text-slate-500 text-sm">Powered by innovation</span>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-slate-600 ml-2">4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

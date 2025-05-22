"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowDownIcon, 
  ArrowRightIcon, 
  ArrowUpIcon,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign, 
  FileText, 
  MoreHorizontal,
  Search,
  Eye,
  Download,
  Calendar,
  Clock,
  Award,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  RefreshCw,
  X,
  ExternalLink,
  Building2,
  MapPin,
  Users,
} from "lucide-react";
import { format, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip,
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProcurementSelect } from "@/database/schema";
import { TenderDetailCard } from "@/components/tender-detail-card";
import { Toaster } from "sonner";

// Fetch procurement data from API
const fetchProcurements = async (): Promise<ProcurementSelect[]> => {
  const response = await fetch("/api/procurement");
  if (!response.ok) {
    throw new Error("Failed to fetch procurement data");
  }
  return response.json();
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

// Helper for getting status badge style
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: "default" | "outline" | "secondary" | "destructive"; className: string }> = {
    "open": { variant: "default", className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" },
    "closed": { variant: "secondary", className: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100" },
    "pending": { variant: "outline", className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100" },
    "awarded": { variant: "default", className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" },
  };
  
  const statusLower = status.toLowerCase();
  return statusMap[statusLower] || { variant: "outline", className: "bg-gray-50 text-gray-700 border-gray-200" };
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTender, setSelectedTender] = useState<ProcurementSelect | null>(null);
  const [showTenderDetail, setShowTenderDetail] = useState(false);
  
  const itemsPerPage = 10;
  
  // Fetch procurement data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["procurements"],
    queryFn: fetchProcurements,
  });

  // Calculate metrics
  const calculateMetrics = (data: ProcurementSelect[] | undefined) => {
    if (!data) return { 
      total: 0, 
      open: 0, 
      closed: 0, 
      awarded: 0, 
      totalValue: 0, 
      openToday: 0,
      avgProcessingTime: 0,
      successRate: 0
    };
    
    const today = new Date();
    
    return {
      total: data.length,
      open: data.filter(item => item.status.toLowerCase() === "open").length,
      closed: data.filter(item => item.status.toLowerCase() === "closed").length,
      awarded: data.filter(item => item.status.toLowerCase() === "awarded").length,
      totalValue: data.length * 450000, // Mock value
      openToday: data.filter(item => {
        if (!item.opening_date) return false;
        const openingDate = new Date(item.opening_date);
        return openingDate.toDateString() === today.toDateString();
      }).length,
      avgProcessingTime: 18, // Mock average days
      successRate: 84.2 // Mock success rate
    };
  };

  const metrics = calculateMetrics(data);

  // Filter data based on search and filters
  const filteredData = data?.filter(item => {
    const matchesSearch = 
      searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ref_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      item.status.toLowerCase() === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateFilter === "last7days" && item.created_at) {
      const creationDate = new Date(item.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      matchesDate = isAfter(creationDate, sevenDaysAgo);
    } else if (dateFilter === "last30days" && item.created_at) {
      const creationDate = new Date(item.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      matchesDate = isAfter(creationDate, thirtyDaysAgo);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }) || [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter]);

  const handleTenderClick = (tender: ProcurementSelect) => {
    setSelectedTender(tender);
    setShowTenderDetail(true);
  };

  const handleCloseTenderDetail = () => {
    setShowTenderDetail(false);
    setSelectedTender(null);
  };

  // Enhanced chart data
  const monthlyTrendData = [
    { name: 'Jan', tenders: 45, value: 12.5, awards: 38 },
    { name: 'Feb', tenders: 52, value: 15.2, awards: 41 },
    { name: 'Mar', tenders: 48, value: 13.8, awards: 39 },
    { name: 'Apr', tenders: 61, value: 18.4, awards: 48 },
    { name: 'May', tenders: 55, value: 16.7, awards: 44 },
    { name: 'Jun', tenders: 67, value: 21.3, awards: 52 },
    { name: 'Jul', tenders: 59, value: 19.1, awards: 47 },
  ];

  const statusDistribution = [
    { name: 'Open', value: metrics.open, color: '#10b981' },
    { name: 'Awarded', value: metrics.awarded, color: '#3b82f6' },
    { name: 'Closed', value: metrics.closed, color: '#6b7280' },
    { name: 'Pending', value: metrics.total - metrics.open - metrics.awarded - metrics.closed, color: '#f59e0b' },
  ];

  const performanceData = [
    { name: 'Q1', efficiency: 78, satisfaction: 85, completion: 92 },
    { name: 'Q2', efficiency: 82, satisfaction: 88, completion: 94 },
    { name: 'Q3', efficiency: 85, satisfaction: 91, completion: 96 },
    { name: 'Q4', efficiency: 88, satisfaction: 93, completion: 98 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'white',
            border: '1px solid #e2e8f0',
            color: '#0f172a',
          },
        }}
      />
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Procurement Intelligence
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Real-time insights and analytics for procurement excellence
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="bg-white/80 backdrop-blur-sm hover:bg-white border-slate-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex items-center text-emerald-600 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12.5%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Tenders</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : metrics.total.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">vs last month</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/50 border-0 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <Activity className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex items-center text-emerald-600 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +8.2%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Active Opportunities</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : metrics.open.toLocaleString()}
                  </p>
                  <Progress value={(metrics.open / metrics.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-xl shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex items-center text-emerald-600 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +15.3%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Success Rate</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : `${metrics.successRate}%`}
                  </p>
                  <p className="text-xs text-slate-500">above industry avg</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="relative overflow-hidden bg-gradient-to-br from-white to-amber-50/50 border-0 shadow-xl shadow-amber-500/10 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <DollarSign className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex items-center text-emerald-600 text-sm font-medium">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +22.1%
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Value</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-20" /> : `N$${(metrics.totalValue / 1000000).toFixed(1)}M`}
                  </p>
                  <p className="text-xs text-slate-500">portfolio value</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Analytics Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList className="grid w-full lg:w-fit grid-cols-3 bg-white/60 backdrop-blur-sm border border-slate-200 shadow-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                <BarChart3 className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                <PieChartIcon className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Target className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              {selectedTab === "overview" && (
                <TabsContent value="overview" className="space-y-6">
                  <motion.div
                    key="overview-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-6 grid-cols-1 lg:grid-cols-3"
                  >
                    {/* Tender Activity Chart */}
                    <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl text-slate-900">Tender Activity</CardTitle>
                            <CardDescription className="text-slate-600">Monthly tender volume and values</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-slate-600">Tenders</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              <span className="text-slate-600">Awards</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-[300px] w-full" />
                        ) : (
                          <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={monthlyTrendData}>
                                <defs>
                                  <linearGradient id="tenderGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="awardGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <RechartsTooltip 
                                  contentStyle={{ 
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                                  }}
                                />
                                <Area type="monotone" dataKey="tenders" stroke="#3b82f6" fillOpacity={1} fill="url(#tenderGradient)" strokeWidth={2} />
                                <Area type="monotone" dataKey="awards" stroke="#10b981" fillOpacity={1} fill="url(#awardGradient)" strokeWidth={2} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Status Distribution */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl text-slate-900">Status Distribution</CardTitle>
                        <CardDescription className="text-slate-600">Current tender statuses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-[250px] w-full" />
                        ) : (
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={statusDistribution}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <RechartsTooltip 
                                  formatter={(value, name) => [`${value} tenders`, name]}
                                  contentStyle={{ 
                                    backgroundColor: "white",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "12px",
                                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                                  }}
                                />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}

              {selectedTab === "analytics" && (
                <TabsContent value="analytics" className="space-y-6">
                  <motion.div
                    key="analytics-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-6 grid-cols-1 lg:grid-cols-2"
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl text-slate-900">Value Trends</CardTitle>
                        <CardDescription className="text-slate-600">Monthly tender values (N$ millions)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyTrendData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="name" stroke="#64748b" />
                              <YAxis stroke="#64748b" />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: "white",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "12px",
                                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                                }}
                              />
                              <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl text-slate-900">Processing Metrics</CardTitle>
                        <CardDescription className="text-slate-600">Average processing times</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Avg. Processing Time</span>
                            <span className="text-2xl font-bold text-slate-900">{metrics.avgProcessingTime} days</span>
                          </div>
                          <Progress value={75} className="h-3" />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Response Rate</span>
                            <span className="text-2xl font-bold text-slate-900">92%</span>
                          </div>  
                          <Progress value={92} className="h-3" />
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Compliance Score</span>
                            <span className="text-2xl font-bold text-slate-900">96%</span>
                          </div>
                          <Progress value={96} className="h-3" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}

              {selectedTab === "performance" && (
                <TabsContent value="performance" className="space-y-6">
                  <motion.div
                    key="performance-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-xl text-slate-900">Quarterly Performance</CardTitle>
                        <CardDescription className="text-slate-600">Key performance indicators across quarters</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="name" stroke="#64748b" />
                              <YAxis stroke="#64748b" />
                              <RechartsTooltip 
                                contentStyle={{ 
                                  backgroundColor: "white",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "12px",
                                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                                }}
                              />
                              <Bar dataKey="efficiency" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="satisfaction" fill="#10b981" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="completion" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Enhanced Tender Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-900">Latest Opportunities</CardTitle>
                  <CardDescription className="text-slate-600">
                    Real-time procurement opportunities and updates ({filteredData.length} total)
                  </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                      type="search" 
                      placeholder="Search opportunities..."
                      className="pl-10 w-full sm:w-[280px] bg-white/80 backdrop-blur-sm border-slate-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="awarded">Awarded</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-[140px] bg-white/80 backdrop-blur-sm border-slate-200">
                        <SelectValue placeholder="Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>       
                        </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead className="font-semibold text-slate-700">Opportunity</TableHead>
                      <TableHead className="font-semibold text-slate-700">Reference</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 hidden md:table-cell">Opening</TableHead>
                      <TableHead className="font-semibold text-slate-700 hidden lg:table-cell">Closing</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array(itemsPerPage).fill(0).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-[280px]" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-[90px] rounded-full" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[100px]" /></TableCell>
                          <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-[100px]" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : currentPageData.length > 0 ? (
                      currentPageData.map((tender) => {
                        const statusBadge = getStatusBadge(tender.status);
                        
                        return (
                          <TableRow 
                            key={tender.id} 
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                            onClick={() => handleTenderClick(tender)}
                          >
                            <TableCell className="font-medium text-slate-900 max-w-[300px] truncate">
                              {tender.title}
                            </TableCell>
                            <TableCell className="text-slate-600 font-mono text-sm">
                              {tender.ref_number || "—"}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${statusBadge.className} font-medium`}>
                                {tender.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-slate-600">
                              {tender.opening_date 
                                ? format(new Date(tender.opening_date), "MMM d, yyyy")
                                : "—"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-slate-600">
                              {tender.closing_date 
                                ? format(new Date(tender.closing_date), "MMM d, yyyy")
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm">
                                  <DropdownMenuItem 
                                    className="hover:bg-slate-50"
                                    onClick={() => handleTenderClick(tender)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="hover:bg-slate-50">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Documents
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="hover:bg-slate-50">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Set Reminder
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                              <Search className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-slate-500 font-medium">No opportunities found</p>
                            <p className="text-slate-400 text-sm">Try adjusting your search criteria</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredData.length > itemsPerPage && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} opportunities
                  </p>
                  
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Tender Detail Modal */}
        <AnimatePresence>
          {showTenderDetail && selectedTender && (
            <TenderDetailCard
              tender={selectedTender}
              isOpen={showTenderDetail}
              onClose={handleCloseTenderDetail}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

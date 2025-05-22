"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowDownIcon, 
  ArrowRightIcon, 
  ArrowUpIcon,
  CalendarIcon, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Filter, 
  FileText, 
  MoreHorizontal,
  Search,
  XCircle,
} from "lucide-react";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ProcurementSelect } from "@/database/schema";

// Fetch procurement data from API
const fetchProcurements = async (): Promise<ProcurementSelect[]> => {
  const response = await fetch("/api/procurement");
  if (!response.ok) {
    throw new Error("Failed to fetch procurement data");
  }
  return response.json();
};

// Helper for getting status badge style
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: "default" | "outline" | "secondary" | "destructive"; icon: any }> = {
    "open": { variant: "default", icon: CheckCircle2 },
    "closed": { variant: "secondary", icon: XCircle },
    "pending": { variant: "outline", icon: Clock },
    "awarded": { variant: "default", icon: CheckCircle2 },
  };
  
  const statusLower = status.toLowerCase();
  return statusMap[statusLower] || { variant: "outline", icon: Clock };
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Fetch procurement data
  const { data, isLoading, error } = useQuery({
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
      openToday: 0 
    };
    
    const today = new Date();
    
    return {
      total: data.length,
      open: data.filter(item => item.status.toLowerCase() === "open").length,
      closed: data.filter(item => item.status.toLowerCase() === "closed").length,
      awarded: data.filter(item => item.status.toLowerCase() === "awarded").length,
      totalValue: data.length * 250000, // Mock value - would be calculated from real data
      openToday: data.filter(item => {
        if (!item.opening_date) return false;
        const openingDate = new Date(item.opening_date);
        return openingDate.toDateString() === today.toDateString();
      }).length
    };
  };

  const metrics = calculateMetrics(data);

  // Filter data based on search and filters
  const filteredData = data?.filter(item => {
    // Search filter
    const matchesSearch = 
      searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ref_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === "all" || 
      item.status.toLowerCase() === statusFilter.toLowerCase();
    
    // Date filter
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

  // Prepare data for charts
  const prepareStatusChartData = (data: ProcurementSelect[] | undefined) => {
    if (!data) return [];
    
    const statusCounts: Record<string, number> = {};
    data.forEach(item => {
      const status = item.status.toLowerCase();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  };
  
  const statusChartData = prepareStatusChartData(data);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Monthly trend mock data
  const monthlyTrendData = [
    { name: 'Jan', tenders: 12 },
    { name: 'Feb', tenders: 19 },
    { name: 'Mar', tenders: 15 },
    { name: 'Apr', tenders: 22 },
    { name: 'May', tenders: 28 },
    { name: 'Jun', tenders: 32 },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Procurement Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze procurement activities across Namibia
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Total Tenders
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.total}</div>
                  <p className="text-xs text-muted-foreground">
                    +{(metrics.openToday / (metrics.total || 1) * 100).toFixed(1)}% from yesterday
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Active Tenders
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.open}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(metrics.open / (metrics.total || 1) * 100)}% of total tenders
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Awarded Tenders
              </CardTitle>
              <ArrowUpIcon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{metrics.awarded}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(metrics.awarded / (metrics.total || 1) * 100)}% award rate
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                Estimated Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    N${(metrics.totalValue / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +2.1% from last month
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Charts Section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Monthly Tender Activity</CardTitle>
              <CardDescription>Number of tenders published monthly</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[230px] flex items-center justify-center">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px"
                        }}
                        labelStyle={{ color: "var(--color-popover-foreground)" }}
                      />
                      <Bar 
                        dataKey="tenders" 
                        fill="var(--color-primary)" 
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-[350px]">
            <CardHeader>
              <CardTitle>Tender Status Distribution</CardTitle>
              <CardDescription>Breakdown of tenders by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[230px] flex items-center justify-center">
                  <Skeleton className="h-[200px] w-full" />
                </div>
              ) : (
                <div className="h-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip 
                        formatter={(value, name) => [`${value} tenders`, name]}
                        contentStyle={{ 
                          backgroundColor: "var(--color-popover)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px"
                        }}
                        labelStyle={{ color: "var(--color-popover-foreground)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Tender Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Latest Tenders</CardTitle>
                <CardDescription>
                  Browse and manage all procurement opportunities
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search tenders..."
                    className="pl-8 w-full sm:w-[200px] md:w-[260px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
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
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Date range" />
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
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Opening Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Closing Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-[250px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-[100px]" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-[100px]" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-[50px] ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((tender) => {
                      const statusBadge = getStatusBadge(tender.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <TableRow key={tender.id}>
                          <TableCell className="font-medium">{tender.title}</TableCell>
                          <TableCell>{tender.ref_number || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={statusBadge.variant} className="flex w-fit gap-1 items-center">
                              <StatusIcon className="h-3 w-3" />
                              {tender.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {tender.opening_date 
                              ? format(new Date(tender.opening_date), "MMM d, yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {tender.closing_date 
                              ? format(new Date(tender.closing_date), "MMM d, yyyy")
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <DropdownMenu>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Actions</p>
                                </TooltipContent>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View details</DropdownMenuItem>
                                  <DropdownMenuItem>Download documents</DropdownMenuItem>
                                  <DropdownMenuItem>Track updates</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No tenders match your filters
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t p-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredData.length}</span> of{" "}
              <span className="font-medium">{data?.length || 0}</span> tenders
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={filteredData.length < 10}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

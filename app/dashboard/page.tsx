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
  Check,
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
import ExcelJS from 'exceljs';
import { toast } from "sonner";

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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

  const handleApplicationSubmit = () => {
    // This callback will be called when a user successfully applies to a tender
    // You can add any additional logic here like showing a success message
    // or updating application counts
    toast.success("Application submitted successfully! You can view it in your applications page.");
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    
    try {
      await refetch();
      setRefreshSuccess(true);
      toast.success("Data refreshed successfully");
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setRefreshSuccess(false);
      }, 2000);
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportToExcel = async () => {
    if (!data || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    setIsExporting(true);

    try {
      // Create a new workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Bidding Insights';
      workbook.lastModifiedBy = 'Bidding Insights';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Add a worksheet
      const worksheet = workbook.addWorksheet('Bidding Insights Procurement Data', {
        properties: { tabColor: { argb: 'FF3B82F6' } }
      });

      // Add branded header section
      const headerStartRow = 1;
      
      // Company name row
      worksheet.mergeCells(`A${headerStartRow}:J${headerStartRow}`);
      const companyNameCell = worksheet.getCell(`A${headerStartRow}`);
      companyNameCell.value = 'BIDDING INSIGHTS';
      companyNameCell.font = { 
        bold: true, 
        size: 28, 
        color: { argb: 'FFFFFFFF' },
        name: 'Arial Black'
      };
      companyNameCell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      companyNameCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' } // Rich blue background
      };
      const companyNameRow = worksheet.getRow(headerStartRow);
      companyNameRow.height = 50;

      // Slogan row
      const sloganRow = headerStartRow + 1;
      worksheet.mergeCells(`A${sloganRow}:J${sloganRow}`);
      const sloganCell = worksheet.getCell(`A${sloganRow}`);
      sloganCell.value = "Namibia's Most Advanced Procurement Platform";
      sloganCell.font = { 
        italic: true, 
        bold: true,
        size: 16, 
        color: { argb: 'FFFFFFFF' },
        name: 'Arial'
      };
      sloganCell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      sloganCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3B82F6' } // Lighter blue gradient
      };
      const sloganRowObj = worksheet.getRow(sloganRow);
      sloganRowObj.height = 35;

      // Export metadata row
      const metadataRow = headerStartRow + 2;
      worksheet.mergeCells(`A${metadataRow}:J${metadataRow}`);
      const metadataCell = worksheet.getCell(`A${metadataRow}`);
      metadataCell.value = `Procurement Data Export | Generated: ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")} | Total Records: ${data.length}`;
      metadataCell.font = { 
        size: 12, 
        bold: true,
        color: { argb: 'FF1E293B' },
        name: 'Arial'
      };
      metadataCell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      metadataCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEFF6FF' } // Light blue background
      };
      const metadataRowObj = worksheet.getRow(metadataRow);
      metadataRowObj.height = 30;

      // Add decorative border to header section with vibrant colors
      for (let row = headerStartRow; row <= metadataRow; row++) {
        for (let col = 1; col <= 10; col++) {
          const cell = worksheet.getCell(row, col);
          cell.border = {
            top: row === headerStartRow ? { style: 'thick', color: { argb: 'FF7C3AED' } } : { style: 'medium', color: { argb: 'FF3B82F6' } },
            left: col === 1 ? { style: 'thick', color: { argb: 'FF7C3AED' } } : { style: 'medium', color: { argb: 'FF3B82F6' } },
            bottom: row === metadataRow ? { style: 'thick', color: { argb: 'FF7C3AED' } } : { style: 'medium', color: { argb: 'FF3B82F6' } },
            right: col === 10 ? { style: 'thick', color: { argb: 'FF7C3AED' } } : { style: 'medium', color: { argb: 'FF3B82F6' } }
          };
        }
      }

      // Add spacing row with color
      const spacingRow = metadataRow + 1;
      const spacingRowObj = worksheet.getRow(spacingRow);
      spacingRowObj.height = 20;
      for (let col = 1; col <= 10; col++) {
        const cell = worksheet.getCell(spacingRow, col);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' }
        };
      }

      // Define columns with styling - start after header section
      const dataStartRow = spacingRow + 1;
      worksheet.columns = [
        { header: 'Reference Number', key: 'refNumber', width: 22 },
        { header: 'Title', key: 'title', width: 55 },
        { header: 'Status', key: 'status', width: 18 },
        { header: 'Opening Date', key: 'openingDate', width: 18 },
        { header: 'Closing Date', key: 'closingDate', width: 22 },
        { header: 'Created Date', key: 'createdDate', width: 22 },
        { header: 'Updated Date', key: 'updatedDate', width: 22 },
        { header: 'Bid Document URL', key: 'bidDocument', width: 35 },
        { header: 'Bid Report URL', key: 'bidReport', width: 35 },
        { header: 'Bidding Insights', key: 'amendments', width: 35 },
      ];

      // Move headers to correct position and style them with vibrant colors
      const headerRow = worksheet.getRow(dataStartRow);
      headerRow.height = 40;
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 13, name: 'Arial' };
        
        // Gradient colors for different columns
        const headerColors = [
          'FF10B981', // Emerald
          'FF3B82F6', // Blue
          'FF8B5CF6', // Purple
          'FFF59E0B', // Amber
          'FFEF4444', // Red
          'FF06B6D4', // Cyan
          'FF84CC16', // Lime
          'FFF97316', // Orange
          'FFEC4899', // Pink
          'FF6366F1'  // Indigo
        ];
        
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: headerColors[(colNumber - 1) % headerColors.length] }
        };
        
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FFFFFFFF' } },
          left: { style: 'medium', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
          right: { style: 'medium', color: { argb: 'FFFFFFFF' } }
        };
      });

      // Add data rows with colorful styling
      data.forEach((tender, index) => {
        const rowNumber = dataStartRow + 1 + index;
        const row = worksheet.addRow({
          refNumber: tender.ref_number || '',
          title: tender.title,
          status: tender.status,
          openingDate: tender.opening_date 
            ? format(new Date(tender.opening_date), "yyyy-MM-dd")
            : '',
          closingDate: tender.closing_date 
            ? format(new Date(tender.closing_date), "yyyy-MM-dd HH:mm:ss")
            : '',
          createdDate: tender.created_at 
            ? format(new Date(tender.created_at), "yyyy-MM-dd HH:mm:ss")
            : '',
          updatedDate: tender.updated_at 
            ? format(new Date(tender.updated_at), "yyyy-MM-dd HH:mm:ss")
            : '',
          bidDocument: tender.bid_document_cdn_url || '',
          bidReport: tender.bid_report_cdn_url || '',
          amendments: tender.amendments || '',
        });

        // Set increased row height for better readability
        row.height = 35;

        // Style data rows with vibrant alternating colors and padding
        row.eachCell((cell, colNumber) => {
          cell.alignment = { 
            vertical: 'middle', 
            wrapText: true,
            indent: 1
          };
          cell.font = { size: 11, name: 'Arial' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };
          
          // Enhanced alternating row colors with subtle tints
          if (index % 2 === 0) {
            const evenRowColors = [
              'FFECFDF5', // Light emerald
              'FFEFF6FF', // Light blue
              'FFF3F4F6', // Light gray
              'FFFFFBEB', // Light amber
              'FFFEF2F2', // Light red
              'FFECFEFF', // Light cyan
              'FFF7FEE7', // Light lime
              'FFFFF7ED', // Light orange
              'FFFDF2F8', // Light pink
              'FFEEF2FF'  // Light indigo
            ];
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: evenRowColors[(colNumber - 1) % evenRowColors.length] }
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' }
            };
          }
        });

        // Enhanced status cell styling with vibrant colors
        const statusCell = row.getCell('status');
        const status = tender.status.toLowerCase();
        
        if (status === 'open') {
          statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF10B981' } // Vibrant emerald
          };
        } else if (status === 'closed') {
          statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF6B7280' } // Vibrant gray
          };
        } else if (status === 'awarded') {
          statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' } // Vibrant blue
          };
        } else if (status === 'pending') {
          statusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
          statusCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF59E0B' } // Vibrant amber
          };
        }

        statusCell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle' 
        };
        statusCell.border = {
          top: { style: 'medium', color: { argb: 'FFFFFFFF' } },
          left: { style: 'medium', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'medium', color: { argb: 'FFFFFFFF' } },
          right: { style: 'medium', color: { argb: 'FFFFFFFF' } }
        };
      });

      // Add extra spacing before footer with colorful styling
      const footerStartRow = dataStartRow + data.length + 4;
      
      // Add colorful spacer rows
      for (let i = 1; i <= 2; i++) {
        const spacerRowNum = dataStartRow + data.length + i;
        const spacerRow = worksheet.getRow(spacerRowNum);
        spacerRow.height = 10;
        for (let col = 1; col <= 10; col++) {
          const cell = worksheet.getCell(spacerRowNum, col);
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: i === 1 ? 'FFEDE9FE' : 'FFDDD6FE' } // Purple gradient
          };
        }
      }

      // Enhanced footer section with vibrant styling
      worksheet.mergeCells(`A${footerStartRow}:J${footerStartRow}`);
      const footerCell = worksheet.getCell(`A${footerStartRow}`);
      footerCell.value = `© ${new Date().getFullYear()} Bidding Insights | Procurement Intelligence Platform | Contact: info@biddinginsights.na`;
      footerCell.font = { 
        italic: true, 
        bold: true,
        color: { argb: 'FFFFFFFF' }, 
        size: 11,
        name: 'Arial'
      };
      footerCell.alignment = { 
        horizontal: 'center', 
        vertical: 'middle' 
      };
      footerCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF7C3AED' } // Vibrant purple
      };
      
      // Enhanced footer styling
      const footerRow = worksheet.getRow(footerStartRow);
      footerRow.height = 35;
      
      // Add colorful border to footer
      for (let col = 1; col <= 10; col++) {
        const cell = worksheet.getCell(footerStartRow, col);
        cell.border = {
          top: { style: 'thick', color: { argb: 'FF8B5CF6' } },
          left: col === 1 ? { style: 'thick', color: { argb: 'FF8B5CF6' } } : { style: 'medium', color: { argb: 'FF8B5CF6' } },
          bottom: { style: 'thick', color: { argb: 'FF8B5CF6' } },
          right: col === 10 ? { style: 'thick', color: { argb: 'FF8B5CF6' } } : { style: 'medium', color: { argb: 'FF8B5CF6' } }
        };
      }

      // Add freeze panes to keep headers visible when scrolling - adjust for new header
      worksheet.views = [
        { 
          state: 'frozen', 
          xSplit: 0, 
          ySplit: dataStartRow, // Freeze at data start row instead of row 1
          topLeftCell: `A${dataStartRow + 1}`,
          activeCell: `A${dataStartRow + 1}`
        }
      ];

      // Generate filename with current date
      const currentDate = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
      const filename = `Bidding Insights Procurement Data.xlsx`;

      // Generate buffer and create download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Excel file exported successfully: ${filename}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export data to Excel");
    } finally {
      setIsExporting(false);
    }
  };

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
          className="relative overflow-hidden rounded-2xl animated-blue-gradient p-8 shadow-2xl"
        >
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                Procurement Intelligence
              </h1>
              <p className="text-blue-100 mt-2 text-lg drop-shadow-md">
                Real-time insights and analytics for procurement excellence
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30 text-white hover:text-white transition-all duration-200"
              >
                {refreshSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-emerald-300" />
                    <span className="text-emerald-300">Refreshed</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className={`h-4 w-4 mr-2 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </>
                )}
              </Button>
              <Button 
                onClick={handleExportToExcel}
                disabled={isExporting || !data || data.length === 0}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white hover:text-white shadow-lg transition-all duration-200"
              >
                <Download className={`h-4 w-4 mr-2 ${isExporting ? 'animate-bounce' : ''}`} />
                {isExporting ? 'Exporting...' : 'Export All'}
              </Button>
            </div>
          </div>
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
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
              <CardContent>                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Tenders</p>
                  <div className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : metrics.total.toLocaleString()}
                  </div>
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
              <CardContent>                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Active Opportunities</p>
                  <div className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : metrics.open.toLocaleString()}
                  </div>
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
              <CardContent>                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Success Rate</p>
                  <div className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : `${metrics.successRate}%`}
                  </div>
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
              <CardContent>                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Value</p>
                  <div className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-20" /> : `N$${(metrics.totalValue / 1000000).toFixed(1)}M`}
                  </div>
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
        <AnimatePresence>          {showTenderDetail && selectedTender && (
            <TenderDetailCard
              tender={selectedTender}
              isOpen={showTenderDetail}
              onClose={handleCloseTenderDetail}
              onApplicationSubmit={handleApplicationSubmit}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

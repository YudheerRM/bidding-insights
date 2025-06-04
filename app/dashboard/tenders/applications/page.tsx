"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface TenderApplication {
  id: string;
  tender_id: string;
  application_status: 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  application_date: string;
  notes?: string;
  tender: {
    id: string;
    title: string;
    ref_number: string;
    status: string;
    opening_date: string;
    closing_date: string;
  };
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function TenderApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
  // Fetch tender applications from API
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["tender-applications", searchTerm, statusFilter, applicationStatusFilter],
    queryFn: async () => {
      try {
        const response = await fetch('/api/tender-applications');
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
          // Apply filters
        return data.filter((app: TenderApplication) => {
          const matchesSearch = app.tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              app.tender.ref_number.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus = statusFilter === "all" || app.tender.status === statusFilter;
          const matchesAppStatus = applicationStatusFilter === "all" || app.application_status === applicationStatusFilter;
          
          return matchesSearch && matchesStatus && matchesAppStatus;
        });
      } catch (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }
    },
    enabled: !!session,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return { className: "bg-green-100 text-green-800 border-green-200", label: "Open" };
      case 'closed':
        return { className: "bg-red-100 text-red-800 border-red-200", label: "Closed" };
      case 'awarded':
        return { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Awarded" };
      case 'evaluation':
        return { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Under Evaluation" };
      default:
        return { className: "bg-gray-100 text-gray-800 border-gray-200", label: status };
    }
  };

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { className: "bg-gray-100 text-gray-800 border-gray-200", icon: Clock, label: "Pending" };
      case 'submitted':
        return { className: "bg-blue-100 text-blue-800 border-blue-200", icon: CheckCircle, label: "Submitted" };
      case 'under_review':
        return { className: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: AlertCircle, label: "Under Review" };
      case 'approved':
        return { className: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle, label: "Approved" };
      case 'rejected':
        return { className: "bg-red-100 text-red-800 border-red-200", icon: XCircle, label: "Rejected" };
      default:
        return { className: "bg-gray-100 text-gray-800 border-gray-200", icon: AlertCircle, label: status };
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/sign-in');
    }
  }, [status, router]);

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 p-8 shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Tender Applications</h1>
                <p className="text-purple-100 mt-1">
                  Track and manage your tender applications
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {applications?.length || 0} Applications
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-4 grid-cols-1 md:grid-cols-4"
        >
          <motion.div variants={fadeInUp} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tender status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tender Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="awarded">Awarded</SelectItem>
                <SelectItem value="evaluation">Under Evaluation</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Select value={applicationStatusFilter} onValueChange={setApplicationStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by application status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Application Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setApplicationStatusFilter("all");
              }}
              className="w-full flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Clear Filters
            </Button>
          </motion.div>
        </motion.div>

        {/* Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Tender Applications
                  </CardTitle>
                  <CardDescription>
                    View and manage your submitted tender applications
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Browse Tenders
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600">Failed to load applications</p>
                </div>
              ) : !applications?.length ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Applications Found</h3>
                  <p className="text-gray-500 mb-6">
                    You haven't submitted any tender applications yet.
                  </p>
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Available Tenders
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tender Title</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Tender Status</TableHead>
                        <TableHead>Application Status</TableHead>
                        <TableHead>Application Date</TableHead>
                        <TableHead>Closing Date</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>                    </TableHeader>
                    <TableBody>
                      {applications?.map((application: TenderApplication) => {
                        const statusBadge = getStatusBadge(application.tender.status);
                        const appStatusBadge = getApplicationStatusBadge(application.application_status);
                        const StatusIcon = appStatusBadge.icon;

                        return (
                          <TableRow key={application.id} className="hover:bg-slate-50/50">
                            <TableCell className="font-medium max-w-[300px] truncate">
                              {application.tender.title}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {application.tender.ref_number}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusBadge.className}>
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={appStatusBadge.className}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {appStatusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {format(new Date(application.application_date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {format(new Date(application.tender.closing_date), "MMM d, yyyy")}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Application
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Documents
                                  </DropdownMenuItem>
                                  {application.application_status === 'pending' && (
                                    <DropdownMenuItem>
                                      <FileText className="h-4 w-4 mr-2" />
                                      Edit Application
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

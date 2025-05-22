"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  X,
  Calendar,
  Clock,
  FileText,
  Download,
  ExternalLink,
  Building2,
  AlertCircle,
  CheckCircle,
  Share2,
  Copy,
  ChevronRight,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ProcurementSelect } from "@/database/schema";

interface TenderDetailCardProps {
  tender: ProcurementSelect;
  isOpen: boolean;
  onClose: () => void;
}

export function TenderDetailCard({ tender, isOpen, onClose }: TenderDetailCardProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string; icon: React.ReactNode }> = {
      "open": { 
        className: "bg-gradient-to-r from-emerald-500 to-green-600 text-white border-0",
        icon: <CheckCircle className="h-3 w-3" />
      },
      "closed": { 
        className: "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0",
        icon: <X className="h-3 w-3" />
      },
      "pending": { 
        className: "bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0",
        icon: <Clock className="h-3 w-3" />
      },
      "awarded": { 
        className: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0",
        icon: <CheckCircle className="h-3 w-3" />
      },
    };
    
    const statusLower = status.toLowerCase();
    return statusMap[statusLower] || { 
      className: "bg-gradient-to-r from-gray-500 to-gray-600 text-white border-0",
      icon: <AlertCircle className="h-3 w-3" />
    };
  };

  const statusBadge = getStatusBadge(tender.status);

  const getDaysRemaining = () => {
    if (!tender.closing_date) return null;
    
    const closingDate = new Date(tender.closing_date);
    const today = new Date();
    const diffTime = closingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: "overdue" };
    if (diffDays === 0) return { days: 0, status: "today" };
    if (diffDays <= 7) return { days: diffDays, status: "urgent" };
    return { days: diffDays, status: "normal" };
  };

  const daysRemaining = getDaysRemaining();

  const handleDownloadBidDocument = () => {
    if (tender.bid_document_cdn_url) {
      window.open(tender.bid_document_cdn_url, '_blank');
      toast.success("Opening bid document...");
    } else if (tender.bid_document) {
      // Handle direct download
      const link = document.createElement('a');
      link.href = tender.bid_document;
      link.download = `bid-document-${tender.ref_number || tender.id}.pdf`;
      link.click();
      toast.success("Downloading bid document...");
    } else {
      toast.error("No bid document available");
    }
  };

  const handleDownloadBidReport = () => {
    if (tender.bid_report_cdn_url) {
      window.open(tender.bid_report_cdn_url, '_blank');
      toast.success("Opening bid report...");
    } else if (tender.bid_report) {
      // Handle direct download
      const link = document.createElement('a');
      link.href = tender.bid_report;
      link.download = `bid-report-${tender.ref_number || tender.id}.pdf`;
      link.click();
      toast.success("Downloading bid report...");
    } else {
      toast.error("No bid report available");
    }
  };

  const handleShareOpportunity = async () => {
    const shareData = {
      title: tender.title,
      text: `Check out this procurement opportunity: ${tender.title}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      const shareText = `${tender.title}\nRef: ${tender.ref_number || 'N/A'}\n${window.location.href}`;
      await navigator.clipboard.writeText(shareText);
      toast.success("Copied to clipboard!");
    }
  };

  const handleCopyReference = async () => {
    if (tender.ref_number) {
      await navigator.clipboard.writeText(tender.ref_number);
      toast.success("Reference number copied!");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-6 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${statusBadge.className} font-medium flex items-center gap-1 px-3 py-1`}>
                      {statusBadge.icon}
                      {tender.status.toUpperCase()}
                    </Badge>
                    {daysRemaining && (
                      <Badge 
                        variant={daysRemaining.status === "urgent" || daysRemaining.status === "today" ? "destructive" : "outline"}
                        className="font-medium bg-white/10 text-white border-white/20"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {daysRemaining.status === "overdue" 
                          ? `${daysRemaining.days} days overdue`
                          : daysRemaining.status === "today"
                          ? "Closes today"
                          : `${daysRemaining.days} days left`
                        }
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-2 pr-4 leading-tight">
                    {tender.title}
                  </h2>
                  {tender.ref_number && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-100 font-mono bg-white/10 px-3 py-1 rounded-full">
                        Ref: {tender.ref_number}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={handleCopyReference}
                        className="h-6 w-6 p-0 text-blue-100 hover:text-white hover:bg-white/10"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 rounded-full text-white hover:bg-white/10 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={handleDownloadBidDocument}
                    disabled={!tender.bid_document && !tender.bid_document_cdn_url}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 h-12"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Bid Document
                  </Button>
                  
                  <Button 
                    onClick={handleDownloadBidReport}
                    disabled={!tender.bid_report && !tender.bid_report_cdn_url}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 h-12"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Download Bid Report
                  </Button>
                  
                  <Button 
                    onClick={handleShareOpportunity}
                    variant="outline"
                    className="border-2 border-slate-200 hover:bg-slate-50 h-12"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Opportunity
                  </Button>
                </div>

                {/* Timeline Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      Timeline & Dates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600">Created</span>
                            <span className="text-sm text-slate-900 font-mono">
                              {tender.created_at 
                                ? format(new Date(tender.created_at), "MMM d, yyyy")
                                : "—"}
                            </span>
                          </div>
                          
                          {tender.opening_date && (
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                              <span className="text-sm font-medium text-green-700">Opening Date</span>
                              <span className="text-sm text-green-900 font-mono">
                                {format(new Date(tender.opening_date), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {tender.closing_date && (
                            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                              <span className="text-sm font-medium text-red-700">Closing Date</span>
                              <span className="text-sm text-red-900 font-mono">
                                {format(new Date(tender.closing_date), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-600">Last Updated</span>
                            <span className="text-sm text-slate-900 font-mono">
                              {tender.updated_at 
                                ? format(new Date(tender.updated_at), "MMM d, yyyy")
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Section */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      Available Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Download className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Bid Document</p>
                            <p className="text-sm text-slate-500">
                              {tender.bid_document || tender.bid_document_cdn_url ? "Available for download" : "Not available"}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handleDownloadBidDocument}
                          disabled={!tender.bid_document && !tender.bid_document_cdn_url}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Bid Report</p>
                            <p className="text-sm text-slate-500">
                              {tender.bid_report || tender.bid_report_cdn_url ? "Available for download" : "Not available"}
                            </p>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={handleDownloadBidReport}
                          disabled={!tender.bid_report && !tender.bid_report_cdn_url}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amendments Section - Only show if amendments exist */}
                {tender.amendments && (
                  <Card className="border-0 shadow-lg bg-amber-50 border-amber-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        Amendments & Updates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-amber-900 whitespace-pre-wrap leading-relaxed">
                          {tender.amendments}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Procuring Entity */}
                <Card className="border-0 shadow-lg bg-blue-50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      Procuring Entity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900 text-lg">Office of the Prime Minister</p>
                        <p className="text-blue-700">Government of Namibia</p>
                        <p className="text-sm text-blue-600 mt-1">Official procurement portal</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional spacing for scroll */}
                <div className="h-4"></div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between gap-4">
                <Button variant="outline" onClick={onClose} className="border-slate-300">
                  Close
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="hover:bg-green-50 hover:border-green-200 hover:text-green-700"
                    onClick={() => window.open('https://procurement.gov.na', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Portal
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => {
                      handleDownloadBidDocument();
                      if (tender.bid_report || tender.bid_report_cdn_url) {
                        setTimeout(() => handleDownloadBidReport(), 1000);
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

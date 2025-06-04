"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FileText,
  Plus,
  Calendar,
  Upload,
  Check,
  AlertCircle,
  Save,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";
import { ProcurementInsert } from "@/database/schema";

// Form validation schema
const tenderFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  refNumber: z.string().min(3, "Reference number is required"),
  status: z.enum(["open", "closed", "draft", "evaluation", "awarded"]),
  openingDate: z.string().min(1, "Opening date is required"),
  closingDate: z.string().min(1, "Closing date is required"),
  amendments: z.string().optional(),
});

type TenderFormData = z.infer<typeof tenderFormSchema>;

// File upload state
interface FileUploadState {
  bidDocument?: {
    s3Key: string;
    cdnUrl: string;
    fileName?: string;
  } | null;
  bidReport?: {
    s3Key: string;
    cdnUrl: string;
    fileName?: string;
  } | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function AddTenderPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadState>({});

  const form = useForm<TenderFormData>({
    resolver: zodResolver(tenderFormSchema),
    defaultValues: {
      title: "",
      refNumber: "",
      status: "draft",
      openingDate: "",
      closingDate: "",
      amendments: "",
    },
  });
  const onSubmit = async (data: TenderFormData) => {
    setIsSubmitting(true);
    try {
      // Convert the form data to match the database schema
      const tenderData: Omit<ProcurementInsert, 'id' | 'created_at' | 'updated_at'> = {
        title: data.title,
        ref_number: data.refNumber,
        status: data.status,
        opening_date: data.openingDate,
        closing_date: new Date(data.closingDate),
        bid_document: null, // We no longer store text content
        bid_document_s3_key: uploadedFiles.bidDocument?.s3Key || null,
        bid_document_cdn_url: uploadedFiles.bidDocument?.cdnUrl || null,
        bid_report: null, // We no longer store text content
        bid_report_s3_key: uploadedFiles.bidReport?.s3Key || null,
        bid_report_cdn_url: uploadedFiles.bidReport?.cdnUrl || null,
        amendments: data.amendments || null,
      };

      const response = await fetch("/api/procurement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tenderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tender");
      }

      toast.success("Tender created successfully!");
      router.push("/dashboard/tenders");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create tender");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push('/sign-in');
    return null;
  }

  // Check permissions (only admin and government officials can add tenders)
  if (!session?.user || !['admin', 'government_official'].includes(session.user.userType)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="p-6 flex items-center justify-center min-h-screen">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You don't have permission to add tenders. Only administrators and government officials can create tenders.
              </p>
              <Button 
                onClick={() => router.push('/dashboard')} 
                className="mt-4 w-full"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Add New Tender</h1>
                <p className="text-blue-100 mt-1">
                  Create a new procurement opportunity for the Office of the Prime Minister
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              Government Procurement
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        </motion.div>

        {/* Form */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tender Details
              </CardTitle>
              <CardDescription>
                Fill in the details for the new tender. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Tender Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter tender title..."
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a clear and descriptive title for the tender
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Reference Number */}
                    <FormField
                      control={form.control}
                      name="refNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Number *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., OPM-2025-001"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                              <SelectItem value="evaluation">Under Evaluation</SelectItem>
                              <SelectItem value="awarded">Awarded</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Opening Date */}
                    <FormField
                      control={form.control}
                      name="openingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opening Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Closing Date */}
                    <FormField
                      control={form.control}
                      name="closingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Closing Date *</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Optional Fields */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Optional Information</h3>
                      {/* Bid Document Upload */}
                    <div>
                      <Label className="text-sm font-medium">Bid Document</Label>
                      <div className="mt-2">
                        <FileUpload
                          fileType="document"
                          onFileUpload={(result) => {
                            setUploadedFiles(prev => ({
                              ...prev,
                              bidDocument: result
                            }));
                          }}
                          currentFile={uploadedFiles.bidDocument ? {
                            name: uploadedFiles.bidDocument.fileName || 'Bid Document',
                            url: uploadedFiles.bidDocument.cdnUrl
                          } : null}
                          onFileRemove={() => {
                            setUploadedFiles(prev => ({
                              ...prev,
                              bidDocument: null
                            }));
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload the official bid document (PDF, DOC, DOCX)
                      </p>
                    </div>

                    {/* Bid Report Upload */}
                    <div>
                      <Label className="text-sm font-medium">Bid Report</Label>
                      <div className="mt-2">
                        <FileUpload
                          fileType="report"
                          onFileUpload={(result) => {
                            setUploadedFiles(prev => ({
                              ...prev,
                              bidReport: result
                            }));
                          }}
                          currentFile={uploadedFiles.bidReport ? {
                            name: uploadedFiles.bidReport.fileName || 'Bid Report',
                            url: uploadedFiles.bidReport.cdnUrl
                          } : null}
                          onFileRemove={() => {
                            setUploadedFiles(prev => ({
                              ...prev,
                              bidReport: null
                            }));
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload the bid evaluation report (PDF, DOC, DOCX)
                      </p>
                    </div>

                    {/* Amendments */}
                    <FormField
                      control={form.control}
                      name="amendments"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amendments</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any amendments or additional notes..."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Tender...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Tender
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

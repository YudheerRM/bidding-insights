"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Shield,
  Activity,
  Database,
  TrendingUp,
  UserCheck,
  UserX,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

// Animation variants
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

// Fetch admin stats
const fetchAdminStats = async () => {
  const response = await fetch("/api/admin/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch admin stats");
  }
  return response.json();
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.userType !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
    enabled: !!session && session.user?.userType === "admin",
  });

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user?.userType !== "admin") {
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
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
                <p className="text-purple-100 text-lg">System administration and user management</p>
              </div>
            </div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
              Administrator Access
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        >
          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-slate-500">+12% from last month</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <UserCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Active Users</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.activeUsers || 0}
                  </p>
                  <p className="text-xs text-slate-500">+8% from last month</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <UserX className="h-6 w-6 text-amber-600" />
                  </div>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Inactive Users</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.inactiveUsers || 0}
                  </p>
                  <p className="text-xs text-slate-500">-3% from last month</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">New Signups</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {isLoading ? <Skeleton className="h-8 w-16" /> : stats?.newSignups || 0}
                  </p>
                  <p className="text-xs text-slate-500">Last 30 days</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* User Type Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">User Type Distribution</CardTitle>
              <CardDescription className="text-slate-600">
                Breakdown of users by account type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {stats?.userTypes?.map((type: any) => (
                    <div key={type.type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          type.type === 'admin' ? 'bg-purple-500' :
                          type.type === 'government_official' ? 'bg-blue-500' :
                          type.type === 'bidder' ? 'bg-emerald-500' :
                          'bg-slate-500'
                        }`} />
                        <span className="font-medium text-slate-700 capitalize">
                          {type.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-slate-900">{type.count}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round((type.count / (stats?.totalUsers || 1)) * 100)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid gap-6 grid-cols-1 md:grid-cols-2"
        >
          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            onClick={() => router.push("/dashboard/admin/users")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">User Management</CardTitle>
                  <CardDescription className="text-slate-600">
                    Manage all user accounts and permissions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
            onClick={() => router.push("/dashboard/admin/system")}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Database className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">System Settings</CardTitle>
                  <CardDescription className="text-slate-600">
                    Configure system parameters and settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

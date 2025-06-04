"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Database,
  Server,
  Shield,
  Settings as SettingsIcon,
  Activity,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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

export default function SystemSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // System settings state
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    userRegistration: true,
    emailNotifications: true,
    auditLogging: true,
    dataBackup: true,
    autoApproval: false,
  });

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.userType !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    // Here you would typically save to the backend
    console.log(`Setting ${key} changed to ${value}`);
  };

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
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-2xl"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <SettingsIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">System Settings</h1>
                <p className="text-indigo-100 text-lg">Configure system parameters and monitoring</p>
              </div>
            </div>
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
              Administrator Access
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        </motion.div>

        {/* System Status Overview */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
        >
          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                    Online
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">System Status</p>
                  <p className="text-2xl font-bold text-slate-900">Operational</p>
                  <p className="text-xs text-slate-500">All services running</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Database</p>
                  <p className="text-2xl font-bold text-slate-900">Active</p>
                  <p className="text-xs text-slate-500">50ms response time</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <HardDrive className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    Good
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Storage</p>
                  <p className="text-2xl font-bold text-slate-900">78%</p>
                  <p className="text-xs text-slate-500">Used of available space</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Activity className="h-6 w-6 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                    Normal
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Server Load</p>
                  <p className="text-2xl font-bold text-slate-900">45%</p>
                  <p className="text-xs text-slate-500">Average CPU usage</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Basic system configuration and user registration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="maintenance">Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable maintenance mode to restrict access during updates
                      </p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="registration">User Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <Switch
                      id="registration"
                      checked={settings.userRegistration}
                      onCheckedChange={(checked) => handleSettingChange('userRegistration', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Send email notifications for important events
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Configure security policies and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="audit">Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable comprehensive audit logging for all user actions
                      </p>
                    </div>
                    <Switch
                      id="audit"
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) => handleSettingChange('auditLogging', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoapproval">Auto Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve new user registrations
                      </p>
                    </div>
                    <Switch
                      id="autoapproval"
                      checked={settings.autoApproval}
                      onCheckedChange={(checked) => handleSettingChange('autoApproval', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Security Actions</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Force Password Reset
                      </Button>
                      <Button variant="outline" size="sm">
                        Clear All Sessions
                      </Button>
                      <Button variant="destructive" size="sm">
                        Emergency Lockdown
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backup" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Backup & Recovery
                  </CardTitle>
                  <CardDescription>
                    Manage data backup and recovery settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="backup">Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic daily database backups
                      </p>
                    </div>
                    <Switch
                      id="backup"
                      checked={settings.dataBackup}
                      onCheckedChange={(checked) => handleSettingChange('dataBackup', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Backup Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium">Last Backup</span>
                        </div>
                        <span className="text-sm text-muted-foreground">2 hours ago</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">Next Backup</span>
                        </div>
                        <span className="text-sm text-muted-foreground">in 22 hours</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Manual Actions</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Create Backup Now
                      </Button>
                      <Button variant="outline" size="sm">
                        Download Backup
                      </Button>
                      <Button variant="outline" size="sm">
                        Restore from Backup
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Monitoring
                  </CardTitle>
                  <CardDescription>
                    Monitor system performance and health metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>System Uptime</Label>
                      <div className="text-2xl font-bold text-emerald-600">99.9%</div>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Average Response Time</Label>
                      <div className="text-2xl font-bold text-blue-600">145ms</div>
                      <p className="text-sm text-muted-foreground">Last 24 hours</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Database backup completed</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">High memory usage detected</p>
                          <p className="text-xs text-muted-foreground">6 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Wifi className="h-4 w-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">System restart completed</p>
                          <p className="text-xs text-muted-foreground">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

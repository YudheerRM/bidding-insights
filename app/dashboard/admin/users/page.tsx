"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Shield,
  Building2,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserFormDialog } from "@/components/admin/user-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";

interface User {
  id: string;
  email: string;
  name: string;
  userType: string;
  isActive: boolean;
  subscriptionTier?: string;
  companyName?: string;
  phoneNumber?: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function UserManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [limit] = useState(10);

  // State for dialogs
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session || session.user?.userType !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, status, router]);

  // Fetch users with filters
  const { data: usersData, isLoading, error } = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, search, userTypeFilter, isActiveFilter, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(userTypeFilter && { userType: userTypeFilter }),
        ...(isActiveFilter && { isActive: isActiveFilter }),
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    enabled: !!session && session.user?.userType === "admin",
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast.success("User deleted successfully");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'government_official':
        return <Shield className="h-4 w-4 text-blue-600" />;
      case 'bidder':
        return <Building2 className="h-4 w-4 text-emerald-600" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const configs = {
      admin: { className: "bg-purple-100 text-purple-800 border-purple-200", label: "Admin" },
      government_official: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Gov Official" },
      bidder: { className: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Bidder" },
      viewer: { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Viewer" },
    };
    const config = configs[userType as keyof typeof configs] || configs.viewer;
    
    return (
      <Badge variant="outline" className={config.className}>
        {getUserTypeIcon(userType)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteUserMutation.mutate(userToDelete.id);
    }
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
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            <p className="text-slate-600 mt-1">Manage all user accounts and permissions</p>
          </div>
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New User
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="grid gap-4 grid-cols-1 md:grid-cols-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="government_official">Government Official</SelectItem>
              <SelectItem value="bidder">Bidder</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setUserTypeFilter("");
              setIsActiveFilter("");
              setPage(1);
            }}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Users ({usersData?.pagination.total || 0})
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Failed to load users</p>
                </div>
              ) : !usersData?.users?.length ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Company/Department</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                  {user.name?.charAt(0) || "U"}
                                </div>
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{user.name}</div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {user.email}
                                </div>
                                {user.phoneNumber && (
                                  <div className="text-sm text-slate-500 flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {user.phoneNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getUserTypeBadge(user.userType)}
                            {user.subscriptionTier && user.userType === 'bidder' && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {user.subscriptionTier.toUpperCase()}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                              className={user.isActive ? 
                                "bg-emerald-100 text-emerald-800 border-emerald-200" : 
                                "bg-red-100 text-red-800 border-red-200"
                              }
                            >
                              {user.isActive ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.companyName && (
                                <div className="font-medium">{user.companyName}</div>
                              )}
                              {user.department && (
                                <div className="text-slate-600">{user.department}</div>
                              )}
                              {user.position && (
                                <div className="text-slate-500 text-xs">{user.position}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                {user.userType !== 'admin' && (
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {usersData && usersData.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-600">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, usersData.pagination.total)} of {usersData.pagination.total} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600">
                      Page {page} of {usersData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(usersData.pagination.totalPages, page + 1))}
                      disabled={page === usersData.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* User Form Dialog */}
      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={editingUser}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["admin-users"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
          setUserFormOpen(false);
          setEditingUser(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}

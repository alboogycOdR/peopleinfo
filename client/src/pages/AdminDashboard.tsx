import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { LogOut, Search, ChevronUp, ChevronDown } from "lucide-react";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import type { PersonRecord } from "@/types";

type SortableField = "name" | "surname" | "cellNumber" | "employed" | "hasBusiness";

type SortField = SortableField | null;
type SortOrder = "asc" | "desc";

function AdminDashboardContent() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const recordsQuery = trpc.person.getAll.useQuery();
  const logoutMutation = trpc.admin.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      setLocation("/admin");
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  const handleSort = (field: SortableField | null) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedRecords = (recordsQuery.data || [])
    .filter(record => {
      const searchLower = searchTerm.toLowerCase();
      return (
        record.name.toLowerCase().includes(searchLower) ||
        record.surname.toLowerCase().includes(searchLower) ||
        record.address.toLowerCase().includes(searchLower) ||
        record.cellNumber.toLowerCase().includes(searchLower) ||
        record.skills.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortOrder === "asc"
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }

      return 0;
    });

  const SortIcon = ({ field }: { field: SortableField | null }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 relative overflow-hidden p-4">
      {/* Blueprint grid background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Decorative technical elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/10 opacity-50 pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-40 h-40 border-2 border-white/10 opacity-50 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-10 bg-white" />
            <div>
              <h1 className="text-white text-3xl font-bold tracking-tight">
                ADMIN DASHBOARD
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Person Records Management System
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            {logoutMutation.isPending ? "Logging out..." : "LOGOUT"}
          </Button>
        </div>

        {/* Search and Info */}
        <Card className="bg-slate-950/80 border-white/20 backdrop-blur-sm mb-6">
          <CardHeader className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Search Records</CardTitle>
                <CardDescription className="text-white/60">
                  Search by name, address, phone, or skills
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold text-lg">
                  {filteredAndSortedRecords.length}
                </p>
                <p className="text-white/60 text-sm">Total Records</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-white/40" />
              <Input
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10 focus:border-white/40"
              />
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card className="bg-slate-950/80 border-white/20 backdrop-blur-sm overflow-hidden">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Person Records</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recordsQuery.isLoading ? (
              <div className="py-12 text-center text-white/60">
                Loading records...
              </div>
            ) : recordsQuery.isError ? (
              <div className="py-12 text-center text-red-400">
                Error loading records. Please try again.
              </div>
            ) : filteredAndSortedRecords.length === 0 ? (
              <div className="py-12 text-center text-white/60">
                {searchTerm ? "No records match your search" : "No records found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead
                        className="text-white font-bold cursor-pointer hover:bg-white/10 select-none"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white font-bold cursor-pointer hover:bg-white/10 select-none"
                        onClick={() => handleSort("surname")}
                      >
                        <div className="flex items-center gap-2">
                          Surname
                          <SortIcon field="surname" />
                        </div>
                      </TableHead>
                      <TableHead className="text-white font-bold">Address</TableHead>
                      <TableHead
                        className="text-white font-bold cursor-pointer hover:bg-white/10 select-none"
                        onClick={() => handleSort("cellNumber")}
                      >
                        <div className="flex items-center gap-2">
                          Cell Number
                          <SortIcon field="cellNumber" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white font-bold cursor-pointer hover:bg-white/10 select-none"
                        onClick={() => handleSort("employed")}
                      >
                        <div className="flex items-center gap-2">
                          Employed
                          <SortIcon field="employed" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white font-bold cursor-pointer hover:bg-white/10 select-none"
                        onClick={() => handleSort("hasBusiness")}
                      >
                        <div className="flex items-center gap-2">
                          Business
                          <SortIcon field="hasBusiness" />
                        </div>
                      </TableHead>
                      <TableHead className="text-white font-bold">Skills</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedRecords.map((record) => (
                      <TableRow
                        key={record.id}
                        className="border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <TableCell className="text-white font-semibold">
                          {record.name}
                        </TableCell>
                        <TableCell className="text-white font-semibold">
                          {record.surname}
                        </TableCell>
                        <TableCell className="text-white/80 text-sm max-w-xs truncate">
                          {record.address}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {record.cellNumber}
                        </TableCell>
                        <TableCell className="text-white">
                          <span
                            className={record.employed
                              ? "px-2 py-1 rounded text-xs font-semibold bg-green-900/30 text-green-300 border border-green-500/30"
                              : "px-2 py-1 rounded text-xs font-semibold bg-gray-900/30 text-gray-300 border border-gray-500/30"}
                          >
                            {record.employed ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell className="text-white">
                          <span
                            className={record.hasBusiness
                              ? "px-2 py-1 rounded text-xs font-semibold bg-blue-900/30 text-blue-300 border border-blue-500/30"
                              : "px-2 py-1 rounded text-xs font-semibold bg-gray-900/30 text-gray-300 border border-gray-500/30"}
                          >
                            {record.hasBusiness ? "Yes" : "No"}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80 text-sm max-w-xs truncate">
                          {record.skills}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-xs">
          <div className="w-12 h-px bg-white/30" />
          <span>SECURE ADMIN PORTAL v1.0</span>
          <div className="w-12 h-px bg-white/30" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedAdminRoute>
      <AdminDashboardContent />
    </ProtectedAdminRoute>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Ban,
  PauseCircle,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  adminRole: string;
  tierCode: string;
  accountStatus: string;
  submissionsCount: number;
  createdAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (json.success) {
        setUsers(json.users);
      }
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, accountStatus: status } : u)));
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_STATUS", userId, status }),
      });
    } catch (e) {
      console.error("Status update failed", e);
    }
  };

  const handleTierChange = async (userId: string, tierCode: string) => {
    try {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, tierCode } : u)));
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_TIER", userId, tierCode }),
      });
    } catch (e) {
      console.error("Tier update failed", e);
    }
  };

  const handleAdminRoleChange = async (userId: string, adminRole: string | null) => {
    try {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, adminRole: adminRole || "User" } : u)));
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_ADMIN_ROLE", userId, adminRole }),
      });
    } catch (e) {
      console.error("Role update failed", e);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || u.accountStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            User Registry & Granular Access Control (RBAC)
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
              Enterprise RBAC
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit user accounts, assign SuperAdmin/BillingAdmin roles, adjust tier quotas, and apply account suspensions.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Reload Registry</span>
        </button>
      </div>

      {/* RBAC Role Matrix Explanation Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 text-xs space-y-1">
          <strong className="text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SuperAdmin
          </strong>
          <p className="text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            Full platform configuration, AI provider vaults, dynamic scoring calibrators, and database administrative capabilities.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/60 text-xs space-y-1">
          <strong className="text-sky-900 dark:text-sky-200 flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> BillingAdmin
          </strong>
          <p className="text-sky-800/80 dark:text-sky-300/80 leading-relaxed">
            Access to Stripe/merchant gateways, subscription tier pricing, invoices, and payment refunds. Read-only on AI vault.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1">
          <strong className="text-slate-900 dark:text-slate-200 flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> SupportAdmin
          </strong>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Account status assistance, quota reset, and customer password links. Zero-knowledge isolation guarantees no scan content inspection.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden"
        >
          <option value="ALL">All Account Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="FROZEN">Frozen</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-mono text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">User & Email</th>
                <th className="py-2.5 px-3">Plan Tier</th>
                <th className="py-2.5 px-3">Admin RBAC Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Registered</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{u.email}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <select
                        value={u.tierCode}
                        onChange={(e) => handleTierChange(u.id, e.target.value)}
                        className="text-xs font-mono py-1 px-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="FREE">FREE</option>
                        <option value="PRO">PRO</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                        <option value="ACADEMIC">ACADEMIC</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-3">
                      <select
                        value={u.adminRole === "User" ? "" : u.adminRole}
                        onChange={(e) => handleAdminRoleChange(u.id, e.target.value || null)}
                        className="text-xs font-medium py-1 px-2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        <option value="">Standard User</option>
                        <option value="SuperAdmin">SuperAdmin</option>
                        <option value="BillingAdmin">BillingAdmin</option>
                        <option value="SupportAdmin">SupportAdmin</option>
                      </select>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.accountStatus === "ACTIVE"
                          ? "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                          : u.accountStatus === "FROZEN"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                      }`}>
                        {u.accountStatus}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.accountStatus === "ACTIVE" ? (
                          <button
                            onClick={() => handleStatusChange(u.id, "FROZEN")}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600"
                            title="Freeze Account"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(u.id, "ACTIVE")}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-600"
                            title="Unfreeze Account"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(u.id, "SUSPENDED")}
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600"
                          title="Ban / Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

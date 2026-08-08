"use client";

import React, { useState, useEffect, useCallback } from "react";
import keycloak from "../../../lib/keycloak";
import configUrls from "../../../../configUrls";
import { useKeycloak } from "@/providers/KeycloakProvider";

export default function usePortalPaymentAccountPage() {
  const { profile } = useKeycloak();

  const [getRoles, setRoles] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    setToast({ message, type });
  };

  const tokenParsed: any = keycloak?.tokenParsed;
  let rolesList =
    tokenParsed?.realm_access?.roles?.filter(
      (role: string) => role === "manager_g" || role === "customer_g",
    ) || [];
  const currentRole = rolesList.length > 0 ? rolesList[0] : "no_roles";
  const isManager =
    currentRole.includes("manager") || profile?.role === "manager_g";

  const loadPaymentAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const token = keycloak?.token;
      const endpoint = keycloak?.authenticated
        ? "/api/payment_account_list"
        : "/api/public/payment_account_list";

      const headers: any = {
        "Content-Type": "application/json",
      };
      if (token && keycloak.authenticated) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(configUrls?.apiUrl + endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          skip,
          limit,
          filters,
          sort: sortField,
          order: sortOrder,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to load payment accounts (${res.status})`);
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      const totalCount = data?.total !== undefined ? data.total : list.length;

      setRows(list);
      setTotal(totalCount);
    } catch (err: any) {
      console.error("loadPaymentAccounts error:", err);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [skip, limit, filters, sortField, sortOrder]);

  useEffect(() => {
    loadPaymentAccounts();
  }, [loadPaymentAccounts]);

  const handleFilterChange = (key: string, value: string) => {
    setSkip(0);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSortChange = (field: string, order: "asc" | "desc") => {
    setSortField(field);
    setSortOrder(order);
  };

  const onHandleCreateAccount = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const onHandleEditAccount = (account: any) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const onPreviewAccount = (account: any) => {
    setSelectedAccount(account);
    setIsPreviewModalOpen(true);
  };

  const onSaveAccount = async (formData: any) => {
    try {
      const isEdit = !!formData.id;
      const endpoint = isEdit
        ? keycloak?.authenticated
          ? "/api/payment_account/edit"
          : "/api/public/payment_account_edit"
        : keycloak?.authenticated
          ? "/api/payment_account/create"
          : "/api/public/payment_account_create";

      const token = keycloak?.token;
      const headers: any = {
        "Content-Type": "application/json",
      };
      if (token && keycloak.authenticated) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Optimistically set active status if creating/editing as active
      if (formData.is_active) {
        const targetId = formData.id || formData._id;
        setRows((prevRows) =>
          prevRows.map((r) => {
            const currentId = r._id || r.id;
            if (targetId && currentId === targetId) {
              return { ...r, is_active: true };
            }
            return { ...r, is_active: false };
          }),
        );
      }

      const res = await fetch(configUrls?.apiUrl + endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();

      if (!res.ok || responseData.error) {
        throw new Error(responseData.error || "Failed to save payment account");
      }

      showToast(
        isEdit
          ? "Payment account updated successfully"
          : "Payment account created successfully",
        "success",
      );

      loadPaymentAccounts();
    } catch (err: any) {
      showToast(err.message || "Error saving payment account", "error");
      loadPaymentAccounts();
      throw err;
    }
  };

  const onToggleStatus = async (account: any) => {
    try {
      const targetId = account._id || account.id;
      const updatedStatus = !account.is_active;

      // INSTANT OPTIMISTIC UPDATE: If activating this account, set all other accounts to inactive immediately
      setRows((prevRows) =>
        prevRows.map((r) => {
          const currentId = r._id || r.id;
          if (currentId === targetId) {
            return { ...r, is_active: updatedStatus };
          } else if (updatedStatus) {
            return { ...r, is_active: false };
          }
          return r;
        }),
      );

      await onSaveAccount({
        id: targetId,
        account_name: account.account_name,
        provider: account.provider,
        is_active: updatedStatus,
        config: account.config,
      });

      if (updatedStatus) {
        showToast(
          `'${account.account_name}' activated! All other accounts are now deactivated.`,
          "success",
        );
      } else {
        showToast(`'${account.account_name}' deactivated.`, "info");
      }
    } catch (err: any) {
      console.error("onToggleStatus error:", err);
      loadPaymentAccounts();
    }
  };

  return {
    isManager,
    currentRole,
    loading,
    rows,
    skip,
    setSkip,
    limit,
    setLimit,
    total,
    filters,
    handleFilterChange,
    sortField,
    sortOrder,
    handleSortChange,
    isModalOpen,
    setIsModalOpen,
    editingAccount,
    onHandleCreateAccount,
    onHandleEditAccount,
    onSaveAccount,
    onToggleStatus,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    selectedAccount,
    onPreviewAccount,
    toast,
    setToast,
    loadPaymentAccounts,
  };
}

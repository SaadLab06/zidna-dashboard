import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PageRole {
  pageId: string;
  pageName: string;
  roles: string[];
  isOwner: boolean;
  relationStatus: 'active' | 'pending' | 'banished';
  approvalStatus: 'accepted' | 'pending' | 'rejected';
}

export const usePageRole = (pageId?: string) => {
  const [pageRoles, setPageRoles] = useState<PageRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPageRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        let query = supabase
          .from('user_pages_relations')
          .select(`
            page_id,
            user_roles,
            owner_id,
            relation_status,
            approval_status,
            facebook_pages!inner(page_name)
          `)
          .eq('user_id', user.id);

        if (pageId) {
          query = query.eq('page_id', pageId);
        }

        const { data, error } = await query;

        if (error) throw error;

        const roles = (data || []).map((item: any) => ({
          pageId: item.page_id,
          pageName: item.facebook_pages?.page_name || 'Unknown Page',
          roles: item.user_roles || [],
          isOwner: item.owner_id === user.id,
          relationStatus: item.relation_status,
          approvalStatus: item.approval_status
        }));

        setPageRoles(roles);
      } catch (error) {
        console.error('Error loading page roles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPageRoles();
  }, [pageId]);

  const hasPageRole = (targetPageId: string, role: string) => {
    const page = pageRoles.find(p => p.pageId === targetPageId);
    return page?.roles.includes(role) || false;
  };

  const isPageOwner = (targetPageId: string) => {
    const page = pageRoles.find(p => p.pageId === targetPageId);
    return page?.isOwner || false;
  };

  const canManagePage = (targetPageId: string) => {
    return hasPageRole(targetPageId, 'admin') || isPageOwner(targetPageId);
  };

  return {
    pageRoles,
    loading,
    hasPageRole,
    isPageOwner,
    canManagePage
  };
};

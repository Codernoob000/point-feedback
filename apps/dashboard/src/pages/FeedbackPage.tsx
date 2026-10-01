import React, { useState, useEffect } from 'react';
import { FeedbackItem } from '../types';
import { api } from '../api/client';
import { Header } from '../components/Header';
import { FeedbackFeed } from '../components/FeedbackFeed';
import { InspectionPanel } from '../components/InspectionPanel';
import { useDebounce } from '../hooks/useDebounce';

export const FeedbackPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pagination state (Fix 13)
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300); // Fix 12: 300ms debounce
  const [statusFilter, setStatusFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Reset page to 1 when filters or debounced search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, sentimentFilter, priorityFilter]);

  const loadFeedbacks = async () => {
    try {
      const res = await api.getFeedbacks({
        status: statusFilter,
        sentiment: sentimentFilter,
        priority: priorityFilter,
        search: debouncedSearch,
        page: page,
        limit: limit
      });
      setFeedbacks(res.items);
      setTotalPages(res.total_pages || 1);
      setTotalCount(res.total || 0);

      // Select first item by default if none selected
      if (!selectedItem && res.items.length > 0) {
        setSelectedItem(res.items[0]);
      } else if (selectedItem) {
        // Keep selected item refreshed
        const found = res.items.find((i) => i.id === selectedItem.id);
        if (found) setSelectedItem(found);
      }
    } catch (err) {
      console.error('Failed to load feedbacks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, [page, debouncedSearch, statusFilter, sentimentFilter, priorityFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeedbacks();
  };

  const handleUpdate = (updated: FeedbackItem) => {
    setSelectedItem(updated);
    setFeedbacks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((item) => item.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (selectedItem?.id === id) {
        const remaining = feedbacks.filter((i) => i.id !== id);
        setSelectedItem(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
      <Header
        title="Live Feedback Ingestion"
        subtitle="Developer-grade visual bug reports & DOM telemetry"
        searchQuery={search}
        onSearchChange={setSearch}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Feed List (Middle column) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-border">
          <FeedbackFeed
            items={feedbacks}
            selectedId={selectedItem?.id || null}
            onSelect={setSelectedItem}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sentimentFilter={sentimentFilter}
            onSentimentFilterChange={setSentimentFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={setPage}
          />
        </div>

        {/* Inspection Panel (Right column - 480px width) */}
        <div className="w-[480px] shrink-0 h-full">
          <InspectionPanel
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};


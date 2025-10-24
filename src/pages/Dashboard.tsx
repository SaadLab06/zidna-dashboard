import { useEffect, useState } from "react";
import { MessageSquare, MessageCircle, Clock, TrendingUp } from "lucide-react";
import StatCard from "@/components/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalComments: 0,
    totalMessages: 0,
    pendingReplies: 0,
    avgResponseTime: "2.5h"
  });

  const [activityData, setActivityData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time listeners
    const commentsChannel = supabase
      .channel('comments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    // Refresh charts every 60 seconds
    const chartInterval = setInterval(() => {
      fetchChartData();
    }, 60000);

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(messagesChannel);
      clearInterval(chartInterval);
    };
  }, []);

  const fetchDashboardData = async () => {
    // Fetch stats
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });
    
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });
    
    const { count: pendingCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    setStats({
      totalComments: commentsCount || 0,
      totalMessages: messagesCount || 0,
      pendingReplies: pendingCount || 0,
      avgResponseTime: "2.5h"
    });

    fetchChartData();
    fetchRecentActivity();
  };

  const fetchChartData = async () => {
    // Fetch activity data for line chart
    const { data: commentsData } = await supabase
      .from('comments')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const { data: messagesData } = await supabase
      .from('messages')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Process data for charts (simplified for demo)
    const activityByDay = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: Math.floor(Math.random() * 50) + 10,
        messages: Math.floor(Math.random() * 30) + 5
      };
    });

    setActivityData(activityByDay);

    // Engagement data for pie chart
    const { count: igComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('platform', 'instagram');

    const { count: fbComments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('platform', 'facebook');

    const { count: igMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('platform', 'instagram');

    const { count: fbMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('platform', 'facebook');

    setEngagementData([
      { name: 'Instagram Comments', value: igComments || 0, color: '#E1306C' },
      { name: 'Instagram Messages', value: igMessages || 0, color: '#FD1D1D' },
      { name: 'Facebook Comments', value: fbComments || 0, color: '#1877F2' },
      { name: 'Facebook Messages', value: fbMessages || 0, color: '#42A5F5' }
    ]);
  };

  const fetchRecentActivity = async () => {
    const { data: comments } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const combined = [
      ...(comments || []).map(c => ({ ...c, type: 'comment' })),
      ...(messages || []).map(m => ({ ...m, type: 'message' }))
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    setRecentActivity(combined);
  };

  const COLORS = ['#E1306C', '#FD1D1D', '#1877F2', '#42A5F5'];

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's your social media overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Comments"
          value={stats.totalComments}
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Direct Messages"
          value={stats.totalMessages}
          icon={MessageCircle}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Replies"
          value={stats.pendingReplies}
          icon={Clock}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Trend */}
        <Card className="lg:col-span-2 p-6 border-0 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Activity Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={activityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                className="text-xs" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                formatter={(value: any, name: string) => [`${value} ${name.toLowerCase()}`, name]}
                labelFormatter={(label) => label}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  padding: '12px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="comments" 
                stroke="#3B82F6" 
                strokeWidth={1}
                name="Comments"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="messages" 
                stroke="#10B981" 
                strokeWidth={1}
                name="Messages"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Engagement Breakdown */}
        <Card className="p-6 border-0 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Engagement Breakdown</h3>
          <ResponsiveContainer width="100%" height={500}>
            <PieChart>
              <Pie
                data={engagementData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => {
                  const parts = name.split(' ');
                  const platform = parts[0];
                  const type = parts[1];
                  return `${platform} ${type} ${(percent * 100).toFixed(0)}%`;
                }}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {engagementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: string) => [`${value}`, name]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {activity.type === 'comment' ? (
                  <MessageSquare className="h-5 w-5 text-primary" />
                ) : (
                  <MessageCircle className="h-5 w-5 text-success" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">
                    {activity.user_name || activity.sender_name || 'Unknown User'}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {activity.platform}
                  </Badge>
                  {activity.status && (
                    <Badge 
                      variant={activity.status === 'pending' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {activity.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {activity.message}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

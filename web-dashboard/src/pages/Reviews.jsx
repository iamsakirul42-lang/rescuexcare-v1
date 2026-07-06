import React, { useState, useEffect } from 'react';
import { Star, Flag, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    avgRating: '0.0',
    totalReviews: 0,
    flaggedReviews: 0
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch all ratings for stats
      const { data: allRatings, count } = await supabase
        .from('bookings')
        .select('rating', { count: 'exact' })
        .not('rating', 'is', null);

      let avgRating = '0.0';
      let totalReviews = count || 0;
      let flaggedReviews = 0; // We don't have flagged functionality yet, mock to 0

      if (allRatings && allRatings.length > 0) {
        const sum = allRatings.reduce((acc, curr) => acc + Number(curr.rating), 0);
        avgRating = (sum / allRatings.length).toFixed(1);
      }
      
      setStats({
        avgRating,
        totalReviews,
        flaggedReviews
      });

      // Fetch reviews for table (latest 30)
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .not('rating', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30);

      if (bookingsError) throw bookingsError;

      if (bookingsData && bookingsData.length > 0) {
        // Fetch users
        const userIds = [...new Set(bookingsData.map(b => b.user_id).filter(Boolean))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        // Fetch mechanics
        const expertIds = [...new Set(bookingsData.map(b => b.expert_id).filter(Boolean))];
        const { data: mechanicsData } = await supabase
          .from('mechanics')
          .select('id, name')
          .in('id', expertIds);

        const mappedReviews = bookingsData.map(booking => {
          const user = profilesData?.find(p => p.id === booking.user_id);
          const mechanic = mechanicsData?.find(m => m.id === booking.expert_id);
          
          return {
            id: booking.id,
            rating: booking.rating,
            comment: booking.review || booking.review_text || '',
            created_at: booking.created_at,
            users: { name: user?.full_name || 'Unknown User' },
            mechanics: { name: mechanic?.name || 'Unknown Mechanic' }
          };
        });

        setReviews(mappedReviews);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Ratings & Reviews</h1>
        <p className="text-gray-400 text-sm">Monitor customer satisfaction and flagged comments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-5xl font-extrabold text-primary mb-2">{stats.avgRating}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform Avg Rating</span>
        </div>
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-5xl font-extrabold text-white mb-2">{stats.totalReviews.toLocaleString()}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reviews</span>
        </div>
        <div className="bg-sidebar rounded-xl border border-gray-800 p-6 flex flex-col items-center justify-center shadow-sm">
          <span className="text-5xl font-extrabold text-red-500 mb-2">{stats.flaggedReviews}</span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Flagged Reviews</span>
        </div>
      </div>

      <div className="bg-sidebar rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1020] border-b border-gray-800">
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reviewer</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mechanic</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Comment</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading reviews...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No reviews found.</td></tr>
              ) : (
                reviews.map(review => (
                  <tr key={review.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="p-4 text-sm font-medium text-white">{review.users?.name || 'Unknown'}</td>
                    <td className="p-4 text-sm text-gray-400">{review.mechanics?.name || '—'}</td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300 max-w-xs truncate">{review.comment}</td>
                    <td className="p-4 text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-1.5 text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors">
                          <Flag size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

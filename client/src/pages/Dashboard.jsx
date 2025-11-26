import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [stats, setStats] = useState({
    userReports: { total_reports: 0, pending_reports: 0, in_progress_reports: 0, resolved_reports: 0 },
    nearbyIssues: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [actionLoading, setActionLoading] = useState({});
  const [reportVotes, setReportVotes] = useState({}); // Store votes for each report
  const [reportComments, setReportComments] = useState({}); // Store comments for each report
  const [commentInputs, setCommentInputs] = useState({}); // Store comment input values
  const [showComments, setShowComments] = useState({}); // Toggle comment visibility

  useEffect(() => {
    fetchUserData();
    fetchUserReports();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    // Fetch votes and comments for all reports
    userReports.forEach(report => {
      fetchReportVotes(report.id);
      fetchReportComments(report.id);
    });
  }, [userReports]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserReports = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const reports = await response.json();
        setUserReports(reports);
      }
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportVotes = async (reportId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/reports/${reportId}/votes`);
      if (response.ok) {
        const votes = await response.json();
        const upvotes = votes.filter(v => v.vote_type === 'upvote').length;
        const downvotes = votes.filter(v => v.vote_type === 'downvote').length;
        setReportVotes(prev => ({
          ...prev,
          [reportId]: { upvotes, downvotes, total: upvotes - downvotes }
        }));
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
    }
  };

  const fetchReportComments = async (reportId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/reports/${reportId}/comments`);
      if (response.ok) {
        const comments = await response.json();
        setReportComments(prev => ({
          ...prev,
          [reportId]: comments
        }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleVote = async (reportId, voteType) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/reports/${reportId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote_type: voteType }),
      });

      if (response.ok) {
        // Refresh votes for this report
        fetchReportVotes(reportId);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleAddComment = async (reportId) => {
    const comment = commentInputs[reportId]?.trim();
    if (!comment) return;

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/reports/${reportId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      if (response.ok) {
        // Clear the input and refresh comments
        setCommentInputs(prev => ({ ...prev, [reportId]: '' }));
        fetchReportComments(reportId);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [`delete-${reportId}`]: true }));

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove report from local state
        setUserReports(prev => prev.filter(report => report.id !== reportId));
        
        // Update stats
        const deletedReport = userReports.find(r => r.id === reportId);
        if (deletedReport) {
          setStats(prev => ({
            ...prev,
            userReports: {
              ...prev.userReports,
              total_reports: prev.userReports.total_reports - 1,
              pending_reports: deletedReport.status === 'pending' ? prev.userReports.pending_reports - 1 : prev.userReports.pending_reports,
              in_progress_reports: deletedReport.status === 'in progress' ? prev.userReports.in_progress_reports - 1 : prev.userReports.in_progress_reports,
              resolved_reports: deletedReport.status === 'resolved' ? prev.userReports.resolved_reports - 1 : prev.userReports.resolved_reports
            }
          }));
        }

        alert('Report deleted successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete report'}`);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${reportId}`]: false }));
    }
  };

  const handleMarkAsCompleted = async (reportId) => {
    if (!window.confirm('Are you sure you want to mark this report as resolved?')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [`complete-${reportId}`]: true }));

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'resolved' }),
      });

      if (response.ok) {
        // Update report status in local state
        setUserReports(prev => prev.map(report => 
          report.id === reportId 
            ? { ...report, status: 'resolved' }
            : report
        ));

        // Update stats
        const currentReport = userReports.find(r => r.id === reportId);
        if (currentReport) {
          setStats(prev => ({
            ...prev,
            userReports: {
              ...prev.userReports,
              pending_reports: currentReport.status === 'pending' ? prev.userReports.pending_reports - 1 : prev.userReports.pending_reports,
              in_progress_reports: currentReport.status === 'in progress' ? prev.userReports.in_progress_reports - 1 : prev.userReports.in_progress_reports,
              resolved_reports: prev.userReports.resolved_reports + 1
            }
          }));
        }

        alert('Report marked as resolved successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update report status'}`);
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Network error. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`complete-${reportId}`]: false }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const formatUserDate = (dateString) => {
    return new Date(dateString).getFullYear();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-red-100 text-red-600';
      case 'in progress': return 'bg-yellow-100 text-yellow-600';
      case 'resolved': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-red-100 text-red-600';
      case 'moderate': return 'bg-yellow-100 text-yellow-600';
      case 'minor': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredReports = filter === 'All' 
    ? userReports 
    : userReports.filter(report => {
        if (filter === 'Pending') return report.status === 'pending';
        if (filter === 'In Progress') return report.status === 'in progress';
        if (filter === 'Resolved') return report.status === 'resolved';
        return true;
      });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-green mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/" className="px-4 py-2 text-eco-green border border-eco-green rounded-lg hover:bg-eco-green hover:text-white transition-colors">
              Home
            </Link>
            <div className="flex items-center text-2xl font-bold text-gray-800">
              <div className="w-8 h-8 bg-eco-green rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-sm">🌱</span>
              </div>
              EcoMap
            </div>
            <nav className="flex space-x-6 ml-8">
              <Link to="/map" className="px-4 py-2 bg-eco-green text-white rounded-lg text-sm font-medium">Map View</Link>
              <Link to="/report" className="px-4 py-2 bg-eco-green text-white rounded-lg text-sm font-medium">Report Issue</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="text-sm font-medium">{user?.name || 'Loading...'}</span>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-eco-green to-green-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-green-100">
                {user?.role || 'Member'} • Member since {user?.created_at ? formatUserDate(user.created_at) : '2024'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.nearbyIssues}</p>
                <p className="text-sm text-gray-600">Issues Nearby</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.userReports.in_progress_reports}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.userReports.resolved_reports}</p>
                <p className="text-sm text-gray-600">Resolved</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm hidden lg:block">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.userReports.total_reports}</p>
                <p className="text-sm text-gray-600">Total Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex space-x-4 mb-6">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((status) => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status 
                  ? 'bg-eco-green text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status} ({
                status === 'All' ? userReports.length :
                status === 'Pending' ? stats.userReports.pending_reports :
                status === 'In Progress' ? stats.userReports.in_progress_reports :
                stats.userReports.resolved_reports
              })
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">No reports found for the selected filter.</p>
              <Link 
                to="/report" 
                className="inline-block mt-4 px-6 py-2 bg-eco-green text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Create Your First Report
              </Link>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-sm text-gray-500">{formatDate(report.created_at)}</span>
                      <span className="text-sm text-gray-500">📍 {report.location}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{report.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                    <div className="flex space-x-2 mb-4">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(report.status)}`}>
                        {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                        {report.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getSeverityColor(report.severity)}`}>
                        {report.severity?.charAt(0).toUpperCase() + report.severity?.slice(1)}
                      </span>
                    </div>
                    {report.image_url && (
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={`${import.meta.env.VITE_SERVER_URL}  /uploads/${report.image_url}`} 
                          alt="Report"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Voting and Comments Section */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          {/* Voting */}
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleVote(report.id, 'upvote')}
                              className="flex items-center space-x-1 hover:text-green-600 transition-colors"
                            >
                              <span>👍</span>
                              <span>{reportVotes[report.id]?.upvotes || 0}</span>
                            </button>
                            <button 
                              onClick={() => handleVote(report.id, 'downvote')}
                              className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                            >
                              <span>👎</span>
                              <span>{reportVotes[report.id]?.downvotes || 0}</span>
                            </button>
                          </div>
                          
                          {/* Comments Toggle */}
                          <button 
                            onClick={() => setShowComments(prev => ({...prev, [report.id]: !prev[report.id]}))}
                            className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                          >
                            <span>💬</span>
                            <span>{reportComments[report.id]?.length || 0}</span>
                          </button>
                          
                          <span>📤 Share</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Mark as Completed Button - only show if not resolved */}
                          {report.status !== 'resolved' && (
                            <button 
                              onClick={() => handleMarkAsCompleted(report.id)}
                              disabled={actionLoading[`complete-${report.id}`]}
                              className="px-3 py-1.5 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading[`complete-${report.id}`] ? 'Updating...' : '✓ Mark Complete'}
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteReport(report.id)}
                            disabled={actionLoading[`delete-${report.id}`]}
                            className="px-3 py-1.5 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[`delete-${report.id}`] ? 'Deleting...' : '🗑️ Delete'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Comments Section */}
                      {showComments[report.id] && (
                        <div className="mt-4 space-y-3">
                          {/* Add Comment */}
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={commentInputs[report.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({...prev, [report.id]: e.target.value}))}
                              placeholder="Add a comment..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-eco-green"
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(report.id)}
                            />
                            <button
                              onClick={() => handleAddComment(report.id)}
                              className="px-4 py-2 bg-eco-green text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                            >
                              Post
                            </button>
                          </div>
                          
                          {/* Comments List */}
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {reportComments[report.id]?.map((comment, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-700">User {comment.user_id}</span>
                                  <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                                </div>
                                <p className="text-sm text-gray-600">{comment.comment}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
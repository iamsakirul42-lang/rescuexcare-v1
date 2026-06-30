import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Search, Filter, MoreVertical, CheckCircle, XCircle } from 'lucide-react';

// Mock Data
const mockDeletions = [
  {
    id: 'REQ-8302',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    mobile: '+91 9876543210',
    role: 'User',
    reason: 'I no longer use RescueX.',
    comments: '',
    requestDate: '2026-06-30T10:15:00Z',
    status: 'Pending Deletion',
  },
  {
    id: 'REQ-8295',
    userName: 'Rajesh Kumar',
    email: 'rajesh.mech@example.com',
    mobile: '+91 8765432109',
    role: 'Expert',
    reason: 'I found another service.',
    comments: 'Using a local garage aggregator instead.',
    requestDate: '2026-06-29T14:20:00Z',
    status: 'Completed',
  },
  {
    id: 'REQ-8288',
    userName: 'Priya Singh',
    email: 'priya.s@example.com',
    mobile: '+91 7654321098',
    role: 'User',
    reason: 'Other',
    comments: 'Moving out of the country next month.',
    requestDate: '2026-06-28T09:05:00Z',
    status: 'Cancelled',
  },
  {
    id: 'REQ-8270',
    userName: 'Amit Sharma',
    email: 'amit.sharma@example.com',
    mobile: '+91 9988776655',
    role: 'User',
    reason: 'Poor customer experience.',
    comments: 'Mechanic arrived very late.',
    requestDate: '2026-06-25T16:45:00Z',
    status: 'Pending Deletion',
  }
];

export const AccountDeletions = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending Deletion':
        return <Badge variant="warning">Pending</Badge>;
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRoleBadge = (role) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        role === 'Expert' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
      }`}>
        {role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Deletions</h1>
          <p className="text-gray-500 mt-1">Review and manage user account deletion requests.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Deletion Requests</CardTitle>
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason & Comments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockDeletions.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                      <div className="text-sm text-gray-500">{request.mobile}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(request.role)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{request.reason}</div>
                      {request.comments && (
                        <div className="text-sm text-gray-500 mt-1 italic">"{request.comments}"</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

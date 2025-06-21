'use client'

import { useEffect, useState } from 'react'
import { dashboardAPI, legacyAPI } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/loading-spinner'
import Progress from '@/components/ui/progress'
import Badge from '@/components/ui/badge'
import { formatCurrency, formatRelativeTime, getStatusColor, getPriorityColor } from '@/lib/utils'
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Clock,
  FolderOpen,
  Activity as ActivityIcon
} from 'lucide-react'

interface DashboardOverview {
  projectStats: Record<string, number>
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  tasksPercentage: number
  pendingRequests: number
  recentActivities: Array<{
    id: string
    type: string
    title: string
    description: string
    createdAt: string
    project?: { name: string }
  }>
}

interface LegacyMetrics {
  earningsMonthly: number
  earningsAnnual: number
  tasksPercentage: number
  pendingRequests: number
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [legacyMetrics, setLegacyMetrics] = useState<LegacyMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [overviewResponse, legacyResponse] = await Promise.all([
        dashboardAPI.getOverview(),
        legacyAPI.getMetrics()
      ])
      
      setOverview(overviewResponse.data)
      setLegacyMetrics(legacyResponse.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Monthly Earnings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {legacyMetrics ? formatCurrency(Number(legacyMetrics.earningsMonthly)) : '--'}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Annual Earnings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {legacyMetrics ? formatCurrency(Number(legacyMetrics.earningsAnnual)) : '--'}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tasks Completed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview ? `${overview.tasksPercentage}%` : '--'}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Requests
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {overview?.pendingRequests || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="h-5 w-5 mr-2" />
              Project Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Projects</span>
                  <span className="font-semibold">{overview.totalProjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <span className="font-semibold">{overview.activeProjects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tasks</span>
                  <span className="font-semibold">{overview.totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Tasks</span>
                  <span className="font-semibold">{overview.completedTasks}</span>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overall Progress</span>
                    <span className="text-sm font-medium">{overview.tasksPercentage}%</span>
                  </div>
                  <Progress value={overview.tasksPercentage} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ActivityIcon className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overview?.recentActivities ? (
              <div className="space-y-4">
                {overview.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.description}
                      </p>
                      {activity.project && (
                        <p className="text-xs text-gray-400">
                          in {activity.project.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {overview.recentActivities.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
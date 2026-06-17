import React, { useState, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Calendar } from 'lucide-react'
import { 
  getRevenueChartOptions, 
  getCategoryChartOptions, 
  getOrderStatusChartOptions 
} from '../utils/chartOptions'

// Interfaces
interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product?: {
    name: string
  }
}

interface Order {
  id: string
  user_id: string
  total_amount: number
  status: string
  created_at: string
  items: OrderItem[]
  user?: {
    email: string
  }
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  image_url: string
  category: string
}

interface AdminAnalyticsProps {
  orders: Order[]
  products: Product[]
}

const PIE_COLORS = [
  '#0F6FFF', // brand blue
  '#14B8A6', // yellow
  '#14B8A6', // orange
  '#10b981', // emerald green
  '#a855f7', // purple
  '#64748b'  // slate
]

// Shimmer Loader for ECharts Loading State
const ChartSkeleton: React.FC<{ type: 'line' | 'pie' | 'bar' }> = ({ type }) => {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 animate-pulse">
      {type === 'line' && (
        <div className="space-y-4 w-full h-full flex flex-col justify-end">
          <div className="flex items-end space-x-2 h-44 w-full">
            <div className="bg-slate-100 rounded-t h-1/4 w-full"></div>
            <div className="bg-slate-100 rounded-t h-1/2 w-full"></div>
            <div className="bg-slate-100 rounded-t h-3/4 w-full"></div>
            <div className="bg-slate-100 rounded-t h-2/3 w-full"></div>
            <div className="bg-slate-100 rounded-t h-full w-full"></div>
          </div>
        </div>
      )}
      {type === 'pie' && (
        <div className="flex flex-col items-center justify-center space-y-4 h-full w-full">
          <div className="w-28 h-28 rounded-full border-[6px] border-slate-100 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-slate-50"></div>
          </div>
        </div>
      )}
      {type === 'bar' && (
        <div className="space-y-4 w-full h-full flex flex-col justify-end">
          <div className="flex items-end space-x-4 h-28 w-full px-4">
            <div className="bg-slate-100 rounded-t h-1/3 w-full"></div>
            <div className="bg-slate-100 rounded-t h-2/3 w-full"></div>
            <div className="bg-slate-100 rounded-t h-1/2 w-full"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// Fallback Empty State
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="w-full h-full flex flex-col items-center justify-center space-y-2 py-8 animate-in fade-in duration-300">
    <div className="p-3 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
      <AlertTriangle size={20} />
    </div>
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{message}</span>
  </div>
)

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ orders, products }) => {
  // --- FILTERS STATE ---
  const [timeframe, setTimeframe] = useState<string>('30days')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false)

  // Trigger brief shimmer loading on filter switches
  useEffect(() => {
    setIsChartLoading(true)
    const timer = setTimeout(() => {
      setIsChartLoading(false)
    }, 350)
    return () => clearTimeout(timer)
  }, [timeframe, customStartDate, customEndDate])

  // --- FILTER ORDERS BY TIMEFRAME ---
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at)
    const now = new Date()

    switch (timeframe) {
      case 'today': {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        return orderDate >= todayStart
      }
      case '7days': {
        const limit = new Date()
        limit.setDate(now.getDate() - 7)
        limit.setHours(0, 0, 0, 0)
        return orderDate >= limit
      }
      case '30days': {
        const limit = new Date()
        limit.setDate(now.getDate() - 30)
        limit.setHours(0, 0, 0, 0)
        return orderDate >= limit
      }
      case '90days': {
        const limit = new Date()
        limit.setDate(now.getDate() - 90)
        limit.setHours(0, 0, 0, 0)
        return orderDate >= limit
      }
      case '12months': {
        const limit = new Date()
        limit.setMonth(now.getMonth() - 12)
        limit.setHours(0, 0, 0, 0)
        return orderDate >= limit
      }
      case 'custom': {
        if (!customStartDate) return true
        const start = new Date(customStartDate)
        start.setHours(0, 0, 0, 0)
        const end = customEndDate ? new Date(customEndDate) : new Date()
        end.setHours(23, 59, 59, 999)
        return orderDate >= start && orderDate <= end
      }
      default:
        return true
    }
  })

  // --- METRIC CALCULATIONS ---
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0)
  const totalSales = filteredOrders.length
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
  const lowStockCount = products.filter(p => Number(p.stock) < 10).length

  // --- REVENUE OVER TIME GROUPING ---
  const now = new Date()
  let revenueChartData: { date: string; Revenue: number }[] = []

  if (timeframe === 'today') {
    const hourlyMap: { [label: string]: number } = {}
    const hoursArray: string[] = []
    for (let i = 0; i < 24; i++) {
      const ampm = i >= 12 ? 'PM' : 'AM'
      const hour12 = i % 12 === 0 ? 12 : i % 12
      const label = `${hour12} ${ampm}`
      hoursArray.push(label)
      hourlyMap[label] = 0
    }

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at)
      const hour = orderDate.getHours()
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const hour12 = hour % 12 === 0 ? 12 : hour % 12
      const label = `${hour12} ${ampm}`
      if (hourlyMap[label] !== undefined) {
        hourlyMap[label] += Number(order.total_amount)
      }
    })

    revenueChartData = hoursArray.map(label => ({
      date: label,
      Revenue: hourlyMap[label]
    }))
  } else if (timeframe === '12months') {
    const monthlyMap: { [label: string]: number } = {}
    const monthLabels: string[] = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(now.getMonth() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      monthLabels.push(label)
      monthlyMap[label] = 0
    }

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at)
      const label = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (monthlyMap[label] !== undefined) {
        monthlyMap[label] += Number(order.total_amount)
      }
    })

    revenueChartData = monthLabels.map(label => ({
      date: label,
      Revenue: monthlyMap[label]
    }))
  } else if (timeframe === 'custom') {
    const start = customStartDate ? new Date(customStartDate) : new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
    const end = customEndDate ? new Date(customEndDate) : new Date()
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff <= 90) {
      const dailyMap: { [label: string]: number } = {}
      const dateLabels: string[] = []
      let current = new Date(start)
      while (current <= end) {
        const label = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (!dateLabels.includes(label)) {
          dateLabels.push(label)
        }
        dailyMap[label] = 0
        current.setDate(current.getDate() + 1)
      }

      filteredOrders.forEach(order => {
        const orderDate = new Date(order.created_at)
        const label = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        if (dailyMap[label] !== undefined) {
          dailyMap[label] += Number(order.total_amount)
        }
      })

      revenueChartData = dateLabels.map(label => ({
        date: label,
        Revenue: dailyMap[label]
      }))
    } else {
      const monthlyMap: { [label: string]: number } = {}
      const monthLabels: string[] = []
      let current = new Date(start)
      while (current <= end) {
        const label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        if (!monthLabels.includes(label)) {
          monthLabels.push(label)
        }
        monthlyMap[label] = 0
        current.setMonth(current.getMonth() + 1)
      }

      filteredOrders.forEach(order => {
        const orderDate = new Date(order.created_at)
        const label = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        if (monthlyMap[label] !== undefined) {
          monthlyMap[label] += Number(order.total_amount)
        }
      })

      revenueChartData = monthLabels.map(label => ({
        date: label,
        Revenue: monthlyMap[label]
      }))
    }
  } else {
    // 7days, 30days, 90days
    const daysCount = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90
    const dailyMap: { [label: string]: number } = {}
    const dateLabels: string[] = []

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      dateLabels.push(label)
      dailyMap[label] = 0
    }

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.created_at)
      const label = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (dailyMap[label] !== undefined) {
        dailyMap[label] += Number(order.total_amount)
      }
    })

    revenueChartData = dateLabels.map(label => ({
      date: label,
      Revenue: dailyMap[label]
    }))
  }

  // --- REVENUE BY CATEGORY ---
  const categoryMap: { [cat: string]: number } = {}
  const productCategoryMap: { [id: string]: string } = {}
  products.forEach(p => {
    productCategoryMap[p.id] = p.category
  })

  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      const cat = productCategoryMap[item.product_id] || 'Other'
      const itemRevenue = Number(item.price) * Number(item.quantity)
      categoryMap[cat] = (categoryMap[cat] || 0) + itemRevenue
    })
  })

  const pieChartData = Object.keys(categoryMap).map(category => ({
    name: category,
    value: categoryMap[category]
  }))

  // --- ORDER STATUS DISTRIBUTION ---
  const statusMap: { [status: string]: number } = {
    Pending: 0,
    Processing: 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0
  }

  filteredOrders.forEach(order => {
    if (statusMap[order.status] !== undefined) {
      statusMap[order.status] += 1
    }
  })

  const barChartData = Object.keys(statusMap).map(status => ({
    status,
    Orders: statusMap[status]
  }))

  const isRevenueEmpty = revenueChartData.every(d => d.Revenue === 0)
  const isPieEmpty = pieChartData.length === 0
  const isStatusEmpty = filteredOrders.length === 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 📅 FILTER CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 text-[#0F6FFF] rounded-sm">
            <Calendar size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Analysis Timeframe</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Configure metrics date ranges</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-white text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-[#0F6FFF] appearance-none cursor-pointer pr-8 w-full sm:w-48 shadow-xs"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="12months">Last 12 Months</option>
              <option value="custom">Custom Date Range</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              ▼
            </div>
          </div>

          {timeframe === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto animate-in fade-in duration-200">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white text-xs font-bold border border-slate-200 rounded-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-[#0F6FFF] w-full sm:w-auto shadow-xs"
              />
              <span className="text-xs font-bold text-slate-400 uppercase">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white text-xs font-bold border border-slate-200 rounded-sm py-2 px-3 text-slate-700 focus:outline-none focus:border-[#0F6FFF] w-full sm:w-auto shadow-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* 🚀 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Revenue */}
        <div data-testid="analytics-card-revenue" className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Revenue</span>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp size={12} />
                +14.5% from last month
              </p>
            </div>
            <div className="p-3.5 rounded-sm bg-blue-50 text-[#0F6FFF] group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div data-testid="analytics-card-sales" className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sales</span>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight">{totalSales}</h3>
              <p className="text-[10px] text-[#14B8A6] font-bold uppercase tracking-wider">Volume processed</p>
            </div>
            <div className="p-3.5 rounded-sm bg-orange-50 text-[#14B8A6] group-hover:scale-110 transition-transform shadow-xs">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div data-testid="analytics-card-avg-value" className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Order Value</span>
              <h3 className="text-2xl font-bold text-slate-800 leading-tight">₹{averageOrderValue.toFixed(2)}</h3>
              <p className="text-[10px] text-[#0F6FFF] font-bold uppercase tracking-wider">Average cart value</p>
            </div>
            <div className="p-3.5 rounded-sm bg-blue-50 text-[#0F6FFF] group-hover:scale-110 transition-transform shadow-xs">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Warnings */}
        <div data-testid="analytics-card-low-stock" className="bg-white border border-slate-200 rounded-sm p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Low Stock Alerts</span>
              <h3 className={`text-2xl font-bold leading-tight ${lowStockCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>{lowStockCount}</h3>
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Under 10 units</p>
            </div>
            <div className={`p-3.5 rounded-sm shadow-xs transition-transform group-hover:scale-110 ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

      </div>

      {/* 📊 GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Area Chart: Revenue Trend (Span 2 cols) */}
        <div data-testid="analytics-chart-trajectory" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col justify-between min-h-[380px] lg:col-span-2">
          <div className="mb-4">
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Revenue Trajectory</h4>
            <p className="text-xs font-bold text-slate-450 uppercase tracking-wider">Total transaction amounts logged over the selected timeframe.</p>
          </div>
          
          <div className="w-full h-[280px]">
            {isChartLoading ? (
              <ChartSkeleton type="line" />
            ) : isRevenueEmpty ? (
              <EmptyState message="No revenue recorded for this period" />
            ) : (
              <ReactECharts
                option={getRevenueChartOptions(revenueChartData)}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </div>
        </div>

        {/* 2. Donut Chart: Sales Share by Category */}
        <div data-testid="analytics-chart-category" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Sales Share by Category</h4>
            <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">Distribution of revenue generated by product categories.</p>
          </div>

          <div className="w-full h-[220px] flex items-center justify-center relative">
            {isChartLoading ? (
              <ChartSkeleton type="pie" />
            ) : isPieEmpty ? (
              <EmptyState message="No category share data" />
            ) : (
              <ReactECharts
                option={getCategoryChartOptions(pieChartData)}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </div>

          {/* Custom Labels List */}
          <div className="grid grid-cols-2 gap-2 text-left min-h-[36px]">
            {!isChartLoading && !isPieEmpty && pieChartData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider animate-in fade-in duration-200">
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 border border-slate-200" 
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                />
                <span className="truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📊 LOWER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Bar Chart: Fulfillment Statuses (Spans 2 columns) */}
        <div data-testid="analytics-chart-fulfillment" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs min-h-[300px] flex flex-col justify-between lg:col-span-2">
          <div>
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Fulfillment Performance</h4>
            <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">Total volume of orders processed grouped by status.</p>
          </div>

          <div className="w-full h-[180px]">
            {isChartLoading ? (
              <ChartSkeleton type="bar" />
            ) : isStatusEmpty ? (
              <EmptyState message="No fulfillment status data" />
            ) : (
              <ReactECharts
                option={getOrderStatusChartOptions(barChartData)}
                style={{ height: '100%', width: '100%' }}
                notMerge={true}
                lazyUpdate={true}
              />
            )}
          </div>
        </div>

        {/* 2. Simple Performance KPI Stat */}
        <div data-testid="analytics-sla-kpi" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Delivery Efficiency</h4>
            <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">Proportion of orders successfully dispatched and delivered.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <span className="text-5xl font-extrabold text-[#0F6FFF] leading-none">
              {filteredOrders.length > 0 
                ? `${Math.round((filteredOrders.filter(o => o.status === 'Delivered').length / filteredOrders.length) * 100)}%` 
                : '100%'}
            </span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1.5">Dispatched Success Rate</span>
            <p className="text-[10px] text-slate-400 font-semibold text-center px-4 leading-relaxed mt-2">
              Measures customer orders that have reached their destination out of all platform transactions.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3.5 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Standard SLA</span>
            <span className="text-emerald-600">98% Target</span>
          </div>
        </div>

      </div>

    </div>
  )
}

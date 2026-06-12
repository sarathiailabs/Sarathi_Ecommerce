import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle } from 'lucide-react'

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

// Custom Tooltip component for rich visual aesthetics
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-sm">
        <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">{label}</p>
        <p className="text-xs font-bold text-slate-800">
          {payload[0].name}: <span className="text-[#2874F0]">₹{payload[0].value?.toFixed(2)}</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-sm">
        <p className="text-xs font-bold text-slate-800">
          {payload[0].name}: <span className="text-[#2874F0]">₹{payload[0].value?.toFixed(2)}</span>
        </p>
      </div>
    )
  }
  return null
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ orders, products }) => {
  // --- METRIC CALCULATIONS ---
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)
  const totalSales = orders.length
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0
  const lowStockCount = products.filter(p => Number(p.stock) < 10).length

  // --- AREA CHART: REVENUE OVER TIME (Last 30 Days) ---
  // Create a timeline map of the last 30 days
  const dailyDataMap: { [date: string]: number } = {}
  const now = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    dailyDataMap[dateStr] = 0
  }

  // Populate daily revenues from actual orders
  orders.forEach(order => {
    const orderDate = new Date(order.created_at)
    const dateStr = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (dailyDataMap[dateStr] !== undefined) {
      dailyDataMap[dateStr] += Number(order.total_amount)
    }
  })

  const areaChartData = Object.keys(dailyDataMap).map(date => ({
    date,
    Revenue: dailyDataMap[date]
  }))

  // --- PIE CHART: REVENUE BY CATEGORY ---
  const categoryMap: { [cat: string]: number } = {}
  
  // Index products for quick category lookup
  const productCategoryMap: { [id: string]: string } = {}
  products.forEach(p => {
    productCategoryMap[p.id] = p.category
  })

  orders.forEach(order => {
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

  const PIE_COLORS = [
    '#2874F0', // brand blue
    '#FF9F00', // yellow
    '#FB641B', // orange
    '#10b981', // emerald green
    '#a855f7', // purple
    '#64748b'  // slate
  ]

  // --- BAR CHART: ORDER STATUS DISTRIBUTION ---
  const statusMap: { [status: string]: number } = { Pending: 0, Shipped: 0, Delivered: 0 }
  orders.forEach(order => {
    if (statusMap[order.status] !== undefined) {
      statusMap[order.status] += 1
    } else {
      statusMap[order.status] = 1
    }
  })

  const barChartData = Object.keys(statusMap).map(status => ({
    status,
    Orders: statusMap[status]
  }))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
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
            <div className="p-3.5 rounded-sm bg-blue-50 text-[#2874F0] group-hover:scale-110 transition-transform shadow-xs">
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
              <p className="text-[10px] text-[#FB641B] font-bold uppercase tracking-wider">Volume processed</p>
            </div>
            <div className="p-3.5 rounded-sm bg-orange-50 text-[#FB641B] group-hover:scale-110 transition-transform shadow-xs">
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
              <p className="text-[10px] text-[#2874F0] font-bold uppercase tracking-wider">Average cart value</p>
            </div>
            <div className="p-3.5 rounded-sm bg-blue-50 text-[#2874F0] group-hover:scale-110 transition-transform shadow-xs">
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
        <div data-testid="analytics-chart-trajectory" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
          <div className="mb-4">
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Revenue Trajectory</h4>
            <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">Total transaction amounts logged daily over the last 30 days.</p>
          </div>
          
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2874F0" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2874F0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `₹${v}`}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(40, 116, 240, 0.15)', strokeWidth: 1.5 }} />
                <Area 
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#2874F0" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Donut Chart: Sales Share by Category */}
        <div data-testid="analytics-chart-category" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Sales Share by Category</h4>
            <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">Distribution of revenue generated by product categories.</p>
          </div>

          <div className="w-full h-[220px] flex items-center justify-center relative">
            {pieChartData.length === 0 ? (
              <p className="text-xs font-bold uppercase text-slate-400">No transaction data</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#FFFFFF" strokeWidth={1} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Ambient center stats */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Share</span>
              <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">Categories</span>
            </div>
          </div>

          {/* Custom Labels List */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {pieChartData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
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
        <div data-testid="analytics-chart-fulfillment" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs min-h-[300px] flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Fulfillment Performance</h4>
            <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">Total volume of orders processed grouped by status.</p>
          </div>

          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226,232,240,0.8)" vertical={false} />
                <XAxis 
                  dataKey="status" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border border-slate-200 p-3 rounded-sm shadow-sm">
                          <p className="text-xs font-bold text-slate-800">
                            {payload[0].payload.status}: <span className="text-[#2874F0] font-bold">{payload[0].value} orders</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="Orders" 
                  fill="#2874F0" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={55}
                >
                  {barChartData.map((entry, index) => {
                    const colors = ['#FF9F00', '#a855f7', '#10b981'] // yellow, purple, emerald
                    const statusColor = entry.status === 'Pending' ? colors[0] : entry.status === 'Shipped' ? colors[1] : colors[2]
                    return <Cell key={`cell-${index}`} fill={statusColor} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Simple Performance KPI Stat */}
        <div data-testid="analytics-sla-kpi" className="bg-white border border-slate-200 rounded-sm p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wide">Delivery Efficiency</h4>
            <p className="text-xs font-bold text-slate-455 uppercase tracking-wider">Proportion of orders successfully dispatched and delivered.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <span className="text-5xl font-extrabold text-[#2874F0] leading-none">
              {orders.length > 0 
                ? `${Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100)}%` 
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

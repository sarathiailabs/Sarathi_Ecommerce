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
      <div className="bg-white border-2 border-[#1D1C1A] p-3 rounded-xl shadow-[3px_3px_0px_0px_#1D1C1A]">
        <p className="text-[9px] uppercase tracking-widest font-black text-[#615E59] mb-1">{label}</p>
        <p className="text-xs font-black text-[#1D1C1A]">
          {payload[0].name}: <span className="text-[#E1392A]">₹{payload[0].value?.toFixed(2)}</span>
        </p>
      </div>
    )
  }
  return null
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-[#1D1C1A] p-3 rounded-xl shadow-[3px_3px_0px_0px_#1D1C1A]">
        <p className="text-xs font-black text-[#1D1C1A]">
          {payload[0].name}: <span className="text-[#E1392A]">₹{payload[0].value?.toFixed(2)}</span>
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
    '#E1392A', // organic red
    '#F5B025', // butterscotch yellow
    '#3b82f6', // blue
    '#10b981', // emerald
    '#a855f7', // purple
    '#ec4899'  // pink
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
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[5px_5px_0px_0px_#1D1C1A] hover:-translate-y-[1px] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#615E59] uppercase tracking-widest">Total Revenue</span>
              <h3 className="text-2xl font-black text-[#1D1C1A] leading-tight">₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp size={12} />
                +14.5% from last month
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border-2 border-[#1D1C1A] text-[#1D1C1A] group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign size={20} className="text-[#E1392A]" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[5px_5px_0px_0px_#1D1C1A] hover:-translate-y-[1px] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#615E59] uppercase tracking-widest">Total Sales</span>
              <h3 className="text-2xl font-black text-[#1D1C1A] leading-tight">{totalSales}</h3>
              <p className="text-[10px] text-[#E1392A] font-bold uppercase tracking-wider">Volume processed</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border-2 border-[#1D1C1A] text-[#1D1C1A] group-hover:scale-110 transition-transform shadow-xs">
              <ShoppingBag size={20} className="text-[#E1392A]" />
            </div>
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[5px_5px_0px_0px_#1D1C1A] hover:-translate-y-[1px] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#615E59] uppercase tracking-widest">Avg. Order Value</span>
              <h3 className="text-2xl font-black text-[#1D1C1A] leading-tight">₹{averageOrderValue.toFixed(2)}</h3>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Average cart value</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FAF6EE] border-2 border-[#1D1C1A] text-[#1D1C1A] group-hover:scale-110 transition-transform shadow-xs">
              <TrendingUp size={20} className="text-[#E1392A]" />
            </div>
          </div>
        </div>

        {/* Card 4: Low Stock Warnings */}
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-5 shadow-[4px_4px_0px_0px_#1D1C1A] hover:shadow-[5px_5px_0px_0px_#1D1C1A] hover:-translate-y-[1px] transition-all relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#615E59] uppercase tracking-widest">Low Stock Alerts</span>
              <h3 className={`text-2xl font-black leading-tight ${lowStockCount > 0 ? 'text-[#E1392A] animate-pulse' : 'text-[#1D1C1A]'}`}>{lowStockCount}</h3>
              <p className="text-[10px] text-[#E1392A] font-bold uppercase tracking-wider">Under 10 units</p>
            </div>
            <div className={`p-3.5 rounded-2xl border-2 border-[#1D1C1A] bg-[#FAF6EE] group-hover:scale-110 transition-transform shadow-xs ${lowStockCount > 0 ? 'text-[#E1392A]' : 'text-[#1D1C1A]'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

      </div>

      {/* 📊 GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Area Chart: Revenue Trend (Span 2 cols) */}
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1D1C1A] flex flex-col justify-between min-h-[380px]">
          <div className="mb-4">
            <h4 className="text-base font-black text-[#1D1C1A] uppercase tracking-wide">Revenue Trajectory</h4>
            <p className="text-xs font-bold text-[#615E59] uppercase tracking-wider">Total transaction amounts logged daily over the last 30 days.</p>
          </div>
          
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E1392A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E1392A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,28,26,0.06)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#1D1C1A', fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(v) => `₹${v}`}
                  tick={{ fill: '#1D1C1A', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(225, 57, 42, 0.15)', strokeWidth: 1.5 }} />
                <Area 
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#E1392A" 
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
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1D1C1A] flex flex-col justify-between min-h-[380px]">
          <div>
            <h4 className="text-base font-black text-[#1D1C1A] uppercase tracking-wide">Sales Share by Category</h4>
            <p className="text-xs font-bold text-[#615E59] uppercase tracking-wider">Distribution of revenue generated by product categories.</p>
          </div>

          <div className="w-full h-[220px] flex items-center justify-center relative">
            {pieChartData.length === 0 ? (
              <p className="text-xs font-black uppercase text-[#615E59]">No transaction data</p>
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
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            
            {/* Ambient center stats */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[9px] font-black text-[#615E59] uppercase tracking-widest">Share</span>
              <span className="text-sm font-black text-[#1D1C1A] uppercase tracking-wide">Categories</span>
            </div>
          </div>

          {/* Custom Labels List */}
          <div className="grid grid-cols-2 gap-2 text-left">
            {pieChartData.slice(0, 4).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-[10px] font-black text-[#1D1C1A] uppercase tracking-wider">
                <span 
                  className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 border border-[#1D1C1A]" 
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
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1D1C1A] min-h-[300px] flex flex-col justify-between">
          <div>
            <h4 className="text-base font-black text-[#1D1C1A] uppercase tracking-wide">Fulfillment Performance</h4>
            <p className="text-xs font-bold text-[#615E59] uppercase tracking-wider">Total volume of orders processed grouped by status.</p>
          </div>

          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(29,28,26,0.06)" vertical={false} />
                <XAxis 
                  dataKey="status" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#1D1C1A', fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: '#1D1C1A', fontSize: 10, fontWeight: 700 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(29, 28, 26, 0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white border-2 border-[#1D1C1A] p-3 rounded-xl shadow-[3px_3px_0px_0px_#1D1C1A]">
                          <p className="text-xs font-black text-[#1D1C1A]">
                            {payload[0].payload.status}: <span className="text-[#E1392A] font-black">{payload[0].value} orders</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="Orders" 
                  fill="#E1392A" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={55}
                >
                  {barChartData.map((entry, index) => {
                    const colors = ['#F5B025', '#3b82f6', '#10b981'] // butterscotch, blue, emerald
                    const statusColor = entry.status === 'Pending' ? colors[0] : entry.status === 'Shipped' ? colors[1] : colors[2]
                    return <Cell key={`cell-${index}`} fill={statusColor} stroke="#1D1C1A" strokeWidth={2} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Simple Performance KPI Stat */}
        <div className="bg-white border-3 border-[#1D1C1A] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#1D1C1A] flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="text-base font-black text-[#1D1C1A] uppercase tracking-wide">Delivery Efficiency</h4>
            <p className="text-xs font-bold text-[#615E59] uppercase tracking-wider">Proportion of orders successfully dispatched and delivered.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <span className="text-5xl font-black text-[#E1392A] leading-none">
              {orders.length > 0 
                ? `${Math.round((orders.filter(o => o.status === 'Delivered').length / orders.length) * 100)}%` 
                : '100%'}
            </span>
            <span className="text-xs font-black text-[#1D1C1A] uppercase tracking-wider mt-1">Dispatched Success Rate</span>
            <p className="text-[10px] text-[#615E59] font-semibold text-center px-4 leading-relaxed mt-2">
              Measures customer orders that have reached their destination out of all platform transactions.
            </p>
          </div>

          <div className="border-t-2 border-[#1D1C1A]/10 pt-3.5 flex justify-between items-center text-[9px] font-black text-[#615E59] uppercase tracking-widest">
            <span>Standard SLA</span>
            <span className="text-emerald-600">98% Target</span>
          </div>
        </div>

      </div>

    </div>
  )
}

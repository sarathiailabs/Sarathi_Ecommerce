import type { EChartsOption } from 'echarts'

export interface RevenueDataPoint {
  date: string
  Revenue: number
}

export interface CategoryDataPoint {
  name: string
  value: number
}

export interface OrderStatusDataPoint {
  status: string
  Orders: number
}

export const formatCurrency = (value: number): string => {
  return '₹' + Math.round(value).toLocaleString('en-IN')
}

export const getRevenueChartOptions = (data: RevenueDataPoint[]): EChartsOption => {
  const dates = data.map(d => d.date)
  const revenues = data.map(d => d.Revenue)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b',
        fontSize: 11
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(40, 116, 240, 0.15)',
          width: 1.5
        }
      },
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''
        const param = params[0]
        return `
          <div style="font-family: sans-serif; padding: 2px;">
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">${param.name}</div>
            <div style="font-size: 12px; color: #1e293b; font-weight: 700;">
              Revenue: <span style="color: #2874F0;">${formatCurrency(Number(param.value))}</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      top: 35,
      left: 10,
      right: 15,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 600,
        margin: 10
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: 'rgba(226, 232, 240, 0.8)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 600,
        formatter: (value: number) => {
          if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr'
          if (value >= 100000) return '₹' + (value / 100000).toFixed(1) + 'L'
          if (value >= 1000) return '₹' + (value / 1000).toFixed(1) + 'k'
          return '₹' + value
        }
      }
    },
    toolbox: {
      feature: {
        saveAsImage: {
          title: 'Save Image',
          pixelRatio: 2
        }
      },
      right: 10,
      top: 0
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        show: dates.length > 15,
        bottom: 5,
        start: Math.max(0, 100 - (15 / dates.length) * 100),
        end: 100,
        height: 16,
        handleSize: '80%',
        textStyle: {
          color: '#64748b',
          fontSize: 10
        }
      }
    ],
    series: [
      {
        name: 'Revenue',
        type: 'line',
        data: revenues,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          color: '#2874F0',
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(40, 116, 240, 0.25)' },
              { offset: 1, color: 'rgba(40, 116, 240, 0)' }
            ]
          }
        }
      }
    ]
  }
}

export const getCategoryChartOptions = (data: CategoryDataPoint[]): EChartsOption => {
  const PIE_COLORS = [
    '#2874F0', // brand blue
    '#FF9F00', // yellow
    '#FB641B', // orange
    '#10b981', // emerald green
    '#a855f7', // purple
    '#64748b'  // slate
  ]

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      formatter: (params: any) => {
        return `
          <div style="font-family: sans-serif; padding: 4px;">
            <div style="font-size: 12px; color: #1e293b; font-weight: 700;">
              ${params.marker} ${params.name}: <span style="color: #2874F0;">${formatCurrency(Number(params.value))}</span> (${params.percent}%)
            </div>
          </div>
        `
      }
    },
    legend: {
      show: false
    },
    title: {
      text: 'SHARE',
      subtext: 'Categories',
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#94a3b8',
        align: 'center'
      },
      subtextStyle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1e293b',
        align: 'center'
      }
    },
    series: [
      {
        name: 'Category Revenue',
        type: 'pie',
        radius: ['52%', '72%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 9,
          color: '#64748b',
          fontWeight: 'bold'
        },
        labelLine: {
          show: true,
          length: 6,
          length2: 6,
          smooth: true
        },
        data: data.map((d, index) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: PIE_COLORS[index % PIE_COLORS.length]
          }
        }))
      }
    ]
  }
}

export const getOrderStatusChartOptions = (data: OrderStatusDataPoint[]): EChartsOption => {
  const statuses = data.map(d => d.status)
  const orders = data.map(d => d.Orders)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''
        const param = params[0]
        return `
          <div style="font-family: sans-serif; padding: 2px;">
            <div style="font-size: 12px; color: #1e293b; font-weight: 700;">
              ${param.name}: <span style="color: #2874F0;">${param.value} orders</span>
            </div>
          </div>
        `
      }
    },
    grid: {
      top: 25,
      left: 10,
      right: 10,
      bottom: 5,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: statuses,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 600
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: 'rgba(226, 232, 240, 0.8)',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: 600
      }
    },
    series: [
      {
        name: 'Orders',
        type: 'bar',
        barMaxWidth: 50,
        data: data.map(item => {
          let color = '#2874F0'
          if (item.status === 'Pending') color = '#FF9F00'
          else if (item.status === 'Shipped') color = '#a855f7'
          else if (item.status === 'Delivered') color = '#10b981'
          else if (item.status === 'Processing') color = '#3b82f6'
          else if (item.status === 'Cancelled') color = '#ef4444'

          return {
            value: item.Orders,
            itemStyle: {
              color: color,
              borderRadius: [4, 4, 0, 0]
            }
          }
        })
      }
    ]
  }
}

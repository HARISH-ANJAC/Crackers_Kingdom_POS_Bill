import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  Platform,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  AlertTriangle,
  CreditCard,
  User,
  Filter,
  BarChart3,
  Activity,
  ChevronRight,
  PieChart as PieChartIcon,
  DownloadCloud
} from 'lucide-react-native';
import Header from '../components/Header';
import { LineChart, PieChart } from "react-native-chart-kit";
import { useAppDispatch, useAppSelector } from '../redux/Store';
import { fetchDashboardData } from '../redux/Slice/DashboardSlice';
import CustomModal from '../components/common/CustomModal';

/** 
 * PROFESSIONAL PREMIUM UI COMPONENTS 
 * Incorporates minimalist spacing, subtle borders, high contrast typography, 
 * and elegant shadow treatments to replicate a top-tier SaaS dashboard. 
 */

const StatCard = ({ title, value, change, isPositive, icon: Icon, colorTheme, isWeb }: any) => (
  <View
    className={`bg-white rounded-[24px] p-6 border border-slate-100 ${isWeb ? 'flex-1 mx-2' : 'mb-4'}`}
    style={Platform.OS !== 'web' ? { 
      elevation: 4, 
      shadowColor: '#94A3B8', 
      shadowRadius: 16, 
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 6 }
    } : { boxShadow: '0 10px 30px -10px rgba(148, 163, 184, 0.15)' }}
  >
    <View className="flex-row justify-between items-start mb-5">
      <View 
        className="w-12 h-12 rounded-[14px] items-center justify-center" 
        style={{ backgroundColor: colorTheme.bg }}
      >
        <Icon size={22} color={colorTheme.icon} strokeWidth={2.5} />
      </View>
      <View className={`flex-row items-center px-2.5 py-1 rounded-full ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
        {isPositive ? <ArrowUpRight size={14} color="#059669" /> : <ArrowDownRight size={14} color="#E11D48" />}
        <Text className={`text-[11px] font-bold ml-1 ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>{change}</Text>
      </View>
    </View>
    <View>
      <Text className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase mb-1.5">{title}</Text>
      <Text className="text-3xl font-black text-slate-800 tracking-tighter" numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
    </View>
  </View>
);

const ProductRow = ({ name, price, sales, isLowStock, stock }: any) => (
  <View className="flex-row items-center justify-between py-4 border-b border-slate-50/80">
    <View className="flex-row items-center flex-1">
      <View className="w-11 h-11 rounded-[12px] bg-slate-50 items-center justify-center mr-4 border border-slate-100">
        <Package size={18} color="#64748B" />
      </View>
      <View className="flex-1 pr-4 justify-center">
        <Text className="text-[14px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{name}</Text>
        <Text className="text-[11px] font-bold text-slate-400 tracking-wide">
          ₹{price} <Text className="text-slate-300 mx-1">•</Text> <Text className="text-indigo-500">{sales} Sold</Text>
        </Text>
      </View>
    </View>
    {isLowStock ? (
      <View className="bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100/50 items-end">
        <Text className="text-rose-600 text-[11px] font-bold tracking-wide">{stock} Left</Text>
      </View>
    ) : (
      <View className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
        <Text className="text-emerald-600 text-[11px] font-bold tracking-wide">In Stock</Text>
      </View>
    )}
  </View>
);

const TransactionRow = ({ name, id, date, amount, status }: any) => (
  <View className="flex-row items-center justify-between py-4 border-b border-slate-50/80">
    <View className="flex-row items-center flex-1">
      <View className="w-11 h-11 rounded-[12px] bg-indigo-50 items-center justify-center mr-4 border border-indigo-100">
        <User size={18} color="#4F46E5" />
      </View>
      <View className="flex-1 pr-4 justify-center">
        <Text className="text-[14px] font-bold text-slate-800 mb-0.5" numberOfLines={1}>{name}</Text>
        <Text className="text-[11px] font-bold text-slate-400 tracking-wide">
          #{id.slice(-6)} <Text className="text-slate-300 mx-1">•</Text> {new Date(date).toLocaleDateString()}
        </Text>
      </View>
    </View>
    <View className="items-end justify-center">
      <Text className="text-[15px] font-black text-slate-800 mb-1 tracking-tight">₹{amount}</Text>
      <View className={`px-2.5 py-1 rounded-md ${status === 'Completed' || status === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
        <Text 
          className={`text-[9px] font-black uppercase tracking-widest ${status === 'Completed' || status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}
        >
          {status}
        </Text>
      </View>
    </View>
  </View>
);

const DashboardScreen = ({ navigation }: { navigation?: any }) => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useAppSelector((state) => state.dashboard);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isWeb = Platform.OS === "web" && width >= 980;
  
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchDashboardData({ startDate, endDate }));
  };

  const handleDateFilter = () => {
    dispatch(fetchDashboardData({ startDate, endDate }));
    setIsDatePickerVisible(false);
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  // Data processing
  const stats = data?.stats || { totalSales: "0", ordersToday: 0, totalProducts: 0, lowStockCount: 0, customerCount: 0 };
  const topProductsRaw = data?.topProducts || [];
  const recentSalesRaw = data?.recentSales || [];
  const monthlySales = data?.monthlySales || [];
  const categoryStats = data?.categoryStats || [];

  if (isLoading && !data) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-6 text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Loading Workspace</Text>
      </View>
    );
  }

  if (error && !data) {
    return (
      <View className="flex-1 bg-[#F8FAFC] items-center justify-center p-6">
        <View className="bg-rose-50 w-20 h-20 rounded-full items-center justify-center mb-6 border border-rose-100">
          <AlertTriangle size={32} color="#E11D48" />
        </View>
        <Text className="text-slate-900 font-black text-2xl tracking-tight mb-2">Metrics Unavailable</Text>
        <Text className="text-slate-500 text-center mb-8 font-medium px-8 leading-6 text-sm">{error}</Text>
        <TouchableOpacity 
          onPress={onRefresh} 
          className="bg-slate-900 px-8 py-3.5 rounded-full shadow-lg"
        >
          <Text className="text-white font-bold tracking-wide">Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Header title="Overview" icon={LayoutDashboard} navigation={navigation} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor="#4F46E5" />}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: isWeb ? 48 : 20,
          paddingTop: isWeb ? 48 : 28
        }}
      >
        {/* Superior Header Block */}
        <View className={`mb-10 flex-row justify-between items-end ${isWeb ? '' : 'flex-col items-start gap-6'}`}>
          <View>
            <View className="flex-row items-center gap-3 mb-2">
              <View className="bg-indigo-600/10 px-2.5 py-1 rounded-md border border-indigo-600/20">
                <Text className="text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em]">Live Data</Text>
              </View>
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              </Text>
            </View>
            <Text className={`font-black text-slate-900 tracking-[-0.03em] ${isWeb ? "text-5xl" : "text-3xl"}`}>
              {greeting}, Admin.
            </Text>
            <Text className="text-slate-500 text-[15px] mt-1.5 font-medium tracking-tight">
              Here is your professional performance summary.
            </Text>
          </View>

          {isWeb && (
            <View className="flex-row gap-4 items-center">
              <TouchableOpacity
                onPress={() => setIsDatePickerVisible(true)}
                className="bg-white px-5 py-3 rounded-xl shadow-sm border border-slate-200 flex-row items-center gap-4 hover:border-slate-300 transition-colors"
                style={{ boxShadow: '0 2px 10px rgba(148, 163, 184, 0.05)' }}
              >
                <Calendar size={18} color="#64748B" />
                <Text className="text-slate-700 font-bold text-[14px]">
                  {startDate} — {endDate}
                 </Text>
                <ChevronRight size={16} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-slate-900 px-6 py-3 rounded-xl shadow-md flex-row items-center gap-3 hover:bg-slate-800 transition-colors">
                <DownloadCloud size={18} color="white" />
                <Text className="text-white font-bold text-[14px]">Export</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* High-Contrast Priority Alert */}
        {stats.lowStockCount > 0 && (
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('Product')}
            className="bg-rose-600/5 rounded-[24px] p-1.5 border border-rose-600/10 mb-8 overflow-hidden"
          >
            <View className="bg-white p-5 md:p-6 rounded-[20px] shadow-sm flex-row items-center justify-between flex-wrap gap-4 border border-rose-100">
              <View className="flex-row items-center flex-1 min-w-[280px]">
                <View className="w-12 h-12 bg-rose-50 rounded-[14px] items-center justify-center mr-4 border border-rose-100">
                  <AlertTriangle size={22} color="#E11D48" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-black text-[17px] mb-0.5 tracking-tight">Stock Advisory</Text>
                  <Text className="text-slate-500 font-medium text-[13px] leading-5">
                    <Text className="text-rose-600 font-bold">{stats.lowStockCount} items</Text> are critically low.
                  </Text>
                </View>
              </View>
              <View className="bg-slate-900 px-6 py-2.5 rounded-xl shadow-sm">
                <Text className="text-white font-bold text-[13px] tracking-wide">Review</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Mobile Date Filter */}
        {!isWeb && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsDatePickerVisible(true)}
            className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-100 flex-row items-center justify-between mb-8"
            style={{ elevation: 2, shadowColor: '#94A3B8', shadowOpacity: 0.05 }}
          >
            <View className="flex-row items-center gap-3.5">
              <View className="bg-slate-50 p-2.5 rounded-[12px] border border-slate-100">
                <Calendar size={18} color="#64748B" />
              </View>
              <View>
                <Text className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em] mb-0.5">Timeframe</Text>
                <Text className="text-slate-800 font-bold text-[13px] tracking-tight">{startDate} to {endDate}</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#CBD5E1" />
          </TouchableOpacity>
        )}

        {/* Premium KPI Cards */}
        <View className={`${isWeb ? 'flex-row gap-6 mb-10' : 'flex-col gap-0'}`}>
          <StatCard
            title="Revenue"
            value={`₹${parseFloat(stats.totalSales).toLocaleString()}`}
            change="14.5%"
            isPositive={true}
            icon={DollarSign}
            colorTheme={{ bg: '#EEF2FF', icon: '#4F46E5' }}
            isWeb={isWeb}
          />
          <StatCard
            title="Orders"
            value={stats.ordersToday.toString()}
            change="8.2%"
            isPositive={true}
            icon={ShoppingBag}
            colorTheme={{ bg: '#F0FDF4', icon: '#10B981' }}
            isWeb={isWeb}
          />
          <StatCard
            title="Customers"
            value={stats.customerCount.toString()}
            change="3.1%"
            isPositive={false}
            icon={Users}
            colorTheme={{ bg: '#F8FAFC', icon: '#64748B' }}
            isWeb={isWeb}
          />
          <StatCard
            title="Products"
            value={stats.totalProducts.toString()}
            change="0.0%"
            isPositive={true}
            icon={Package}
            colorTheme={{ bg: '#FFF7ED', icon: '#EA580C' }}
            isWeb={isWeb}
          />
        </View>

        {/* Visualization Tier */}
        <View className={`mb-10 ${isWeb ? 'flex-row gap-8' : 'flex-col gap-8'}`}>
          
          {/* Revenue Chart Window */}
          <View 
            className={`bg-white rounded-[32px] p-7 border border-slate-100 ${isWeb ? 'flex-[2]' : 'w-full'}`}
            style={Platform.OS !== 'web' ? { elevation: 3, shadowColor: '#94A3B8', shadowOpacity: 0.08 } : { boxShadow: '0 10px 40px -10px rgba(148, 163, 184, 0.1)' }}
          >
            <View className="flex-row justify-between items-start mb-8">
              <View>
                <Text className="text-slate-900 text-[22px] font-black tracking-tight mb-1">Financial Trajectory</Text>
                <Text className="text-slate-400 text-[13px] font-medium tracking-wide">6-month revenue progression</Text>
              </View>
              <View className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex-row items-center gap-2">
                <Activity size={12} color="#4F46E5" />
                <Text className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">Active</Text>
              </View>
            </View>
            
            <View className="items-center -ml-2">
              {monthlySales.length > 0 ? (
                <LineChart
                  data={{
                    labels: monthlySales.map((item: any) => item.month?.substring(0, 3) || ""),
                    datasets: [{ data: monthlySales.map((item: any) => parseFloat(item.amount) || 0) }]
                  }}
                  width={isWeb ? (width - 320) * 0.6 : width - 64}
                  height={240}
                  yAxisLabel="₹"
                  yAxisInterval={1}
                  withInnerLines={true}
                  withOuterLines={false}
                  withVerticalLines={false}
                  yAxisSuffix=""
                  chartConfig={{
                    backgroundColor: "#ffffff",
                    backgroundGradientFrom: "#ffffff",
                    backgroundGradientTo: "#ffffff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
                    propsForDots: { r: "4", strokeWidth: "3", stroke: "#4F46E5", fill: "#ffffff" },
                    propsForBackgroundLines: { strokeDasharray: "4", stroke: "#F1F5F9" },
                    propsForLabels: { fontSize: 11, fontWeight: "600" }
                  }}
                  bezier
                  style={{ borderRadius: 16 }}
                />
              ) : (
                <View className="h-[240px] w-full items-center justify-center bg-slate-50/80 rounded-2xl border border-slate-100 border-dashed">
                  <BarChart3 size={32} color="#CBD5E1" />
                  <Text className="text-slate-400 font-bold mt-3 uppercase tracking-widest text-[10px]">Data Processing</Text>
                </View>
              )}
            </View>
          </View>

          {/* Allocation Matrix */}
          <View 
            className={`bg-white rounded-[32px] p-7 border border-slate-100 ${isWeb ? 'flex-1' : 'w-full'}`}
            style={Platform.OS !== 'web' ? { elevation: 3, shadowColor: '#94A3B8', shadowOpacity: 0.08 } : { boxShadow: '0 10px 40px -10px rgba(148, 163, 184, 0.1)' }}
          >
            <View className="mb-6">
              <Text className="text-slate-900 text-[22px] font-black tracking-tight mb-1">Categories</Text>
              <Text className="text-slate-400 text-[13px] font-medium tracking-wide">Product share</Text>
            </View>

            <View className="items-center justify-center flex-1">
              {categoryStats.length > 0 ? (
                <PieChart
                  data={categoryStats.map((cat: any, i: number) => ({
                    name: cat.name,
                    population: parseInt(cat.count),
                    color: ['#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'][i % 6],
                    legendFontColor: "#475569",
                    legendFontSize: 12
                  }))}
                  width={isWeb ? (width - 160) * 0.28 : width - 64}
                  height={190}
                  chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  paddingLeft={Platform.OS === 'web' ? "0" : "15"}
                  center={[0, 0]}
                  hasLegend={true}
                  absolute
                />
              ) : (
                <View className="h-[190px] w-full items-center justify-center bg-slate-50/80 rounded-2xl border border-slate-100 border-dashed">
                  <PieChartIcon size={32} color="#CBD5E1" />
                  <Text className="text-slate-400 font-bold mt-3 uppercase tracking-widest text-[10px]">Unavailable</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Dense Data Lists (Ledger & Products) */}
        <View className={`${isWeb ? 'flex-row gap-8' : 'flex-col gap-8'}`}>
          <View 
            className={`bg-white rounded-[32px] p-7 border border-slate-100 ${isWeb ? 'flex-1' : 'w-full'}`}
            style={Platform.OS !== 'web' ? { elevation: 3, shadowColor: '#94A3B8', shadowOpacity: 0.08 } : { boxShadow: '0 10px 40px -10px rgba(148, 163, 184, 0.1)' }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 text-[20px] font-black tracking-tight">Recent Activity</Text>
              <TouchableOpacity className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <ArrowUpRight size={16} color="#475569" />
              </TouchableOpacity>
            </View>
            <View className="overflow-hidden">
              {recentSalesRaw.length > 0 ? (
                recentSalesRaw.map((sale: any, i: number) => (
                  <TransactionRow
                    key={i}
                    name={sale.customer?.name || "Anonymous Consumer"}
                    id={sale.invoiceNumber || 'N/A'}
                    date={sale.createdAt}
                    amount={sale.totalAmount}
                    status={sale.paymentMethod || 'Completed'}
                  />
                ))
              ) : (
                <View className="py-14 items-center justify-center bg-slate-50/50 rounded-2xl">
                  <CreditCard size={28} color="#CBD5E1" />
                  <Text className="text-slate-400 text-[10px] mt-3 font-bold uppercase tracking-widest">No Transactions</Text>
                </View>
              )}
            </View>
          </View>

          <View 
            className={`bg-white rounded-[32px] p-7 border border-slate-100 ${isWeb ? 'flex-1' : 'w-full'}`}
             style={Platform.OS !== 'web' ? { elevation: 3, shadowColor: '#94A3B8', shadowOpacity: 0.08 } : { boxShadow: '0 10px 40px -10px rgba(148, 163, 184, 0.1)' }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 text-[20px] font-black tracking-tight">Top Movers</Text>
              <TouchableOpacity className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <ArrowUpRight size={16} color="#475569" />
              </TouchableOpacity>
            </View>
            <View className="overflow-hidden">
              {topProductsRaw.length > 0 ? (
                topProductsRaw.map((prod: any, i: number) => (
                  <ProductRow
                    key={i}
                    name={prod.name}
                    price={prod.sellingPrice}
                    sales={Math.floor(Math.random() * 50) + 10}
                    isLowStock={(prod.stock?.quantity || 0) <= 10}
                    stock={prod.stock?.quantity || 0}
                  />
                ))
              ) : (
                <View className="py-14 items-center justify-center bg-slate-50/50 rounded-2xl">
                  <Package size={28} color="#CBD5E1" />
                  <Text className="text-slate-400 text-[10px] mt-3 font-bold uppercase tracking-widest">Awaiting Stock</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Exquisite Date Modal */}
      <CustomModal
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        title="Timeframe Matrix"
        subtitle="Establish your reporting boundaries"
        icon={Calendar}
        footer={
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setIsDatePickerVisible(false)} 
              className="flex-1 bg-slate-50 py-3.5 rounded-xl border border-slate-200 items-center justify-center"
            >
              <Text className="text-slate-600 font-bold text-[14px]">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleDateFilter} 
              className="flex-[2] bg-slate-900 py-3.5 rounded-xl items-center justify-center shadow-md shadow-slate-300"
            >
              <Text className="text-white font-black tracking-wide text-[14px]">Update Dashboard</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View className="gap-5 pt-3">
          <View>
            <Text className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2 ml-1">Range Start</Text>
            <View className="bg-white border hover:border-indigo-400 border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between shadow-sm transition-colors">
              <TextInput 
                value={startDate} 
                onChangeText={setStartDate} 
                placeholder="YYYY-MM-DD" 
                className="flex-1 font-bold text-slate-800 text-[14px] outline-none" 
                {...(Platform.OS === 'web' ? { type: 'date' } : {})} 
              />
              <Calendar size={18} color="#4F46E5" />
            </View>
          </View>
          <View>
            <Text className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2 ml-1">Range End</Text>
            <View className="bg-white border hover:border-indigo-400 border-slate-200 rounded-xl px-4 py-3 flex-row items-center justify-between shadow-sm transition-colors">
              <TextInput 
                value={endDate} 
                onChangeText={setEndDate} 
                placeholder="YYYY-MM-DD" 
                className="flex-1 font-bold text-slate-800 text-[14px] outline-none" 
                {...(Platform.OS === 'web' ? { type: 'date' } : {})} 
              />
              <Calendar size={18} color="#4F46E5" />
            </View>
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default DashboardScreen;

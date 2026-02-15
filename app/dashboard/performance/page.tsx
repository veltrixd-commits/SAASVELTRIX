// Performance & Money Motivation - Personal OS Feature
'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Target, Award, Zap, PiggyBank, Flame, Trophy, Plus, X, CheckCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  organizationalGoal?: string;
  completedAt?: string;
}

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState<'performance' | 'financial' | 'goals'>('performance');
  const [showMetricDetail, setShowMetricDetail] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // Load tasks from productivity localStorage
    const savedTasks = localStorage.getItem('productivityTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Calculate goal progress
  const getGoalProgress = (goalId: string) => {
    const goalTasks = tasks.filter(t => t.organizationalGoal === goalId);
    const completedTasks = goalTasks.filter(t => t.status === 'completed');
    return {
      total: goalTasks.length,
      completed: completedTasks.length,
      percentage: goalTasks.length > 0 ? Math.round((completedTasks.length / goalTasks.length) * 100) : 0
    };
  };

  const organizationalGoals = [
    { id: 'revenue-growth', name: '💰 Increase Revenue by 20%', target: 20, current: 15 },
    { id: 'customer-acquisition', name: '👥 Acquire 1000 New Customers', target: 1000, current: 650 },
    { id: 'product-launch', name: '🚀 Launch New Product Line', target: 100, current: getGoalProgress('product-launch').percentage },
    { id: 'market-expansion', name: '🌍 Expand to New Markets', target: 100, current: getGoalProgress('market-expansion').percentage },
    { id: 'team-growth', name: '👨‍💼 Grow Team by 50%', target: 100, current: getGoalProgress('team-growth').percentage },
    { id: 'efficiency', name: '⚡ Improve Operational Efficiency', target: 100, current: getGoalProgress('efficiency').percentage },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Performance & Money Command
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Audit execution, cash, and goals—then decide the next hit list.
        </p>
      </div>

      {/* Motivation Score */}
      <div className="glass-card rounded-xl p-6 mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-500" />
              Motivation Level
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Hold the streak—slip and the funnel slows.</p>
          </div>
          <div className="text-5xl font-bold text-orange-600">92%</div>
        </div>
        <div className="mt-4 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '92%' }}></div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>5-day streak. Hit 7 or start back at zero.</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={Trophy}
          label="Goals Completed"
          value="12/15"
          color="text-blue-600"
          onClick={() => setShowMetricDetail('goals')}
        />
        <MetricCard
          icon={DollarSign}
          label="Monthly Earnings"
          value="R 24,680"
          color="text-green-600"
          onClick={() => setShowMetricDetail('earnings')}
        />
        <MetricCard
          icon={TrendingUp}
          label="Productivity"
          value="87%"
          color="text-purple-600"
          onClick={() => setShowMetricDetail('productivity')}
        />
        <MetricCard
          icon={Award}
          label="Achievements"
          value="38"
          color="text-yellow-600"
          onClick={() => setShowMetricDetail('achievements')}
        />
      </div>

      {/* Floating Tabs */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-2 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          <TabButton
            active={activeTab === 'performance'}
            onClick={() => setActiveTab('performance')}
            icon={TrendingUp}
            label="Performance"
          />
          <TabButton
            active={activeTab === 'financial'}
            onClick={() => setActiveTab('financial')}
            icon={DollarSign}
            label="Financial Goals"
          />
          <TabButton
            active={activeTab === 'goals'}
            onClick={() => setActiveTab('goals')}
            icon={Target}
            label="Goals & Milestones"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'performance' && <Performance />}
        {activeTab === 'financial' && <Financial />}
        {activeTab === 'goals' && <Goals />}
      </div>

      {/* Metric Detail Modal */}
      {showMetricDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowMetricDetail(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {showMetricDetail === 'goals' && '🏆 Goal Details'}
                {showMetricDetail === 'earnings' && '💰 Earnings Breakdown'}
                {showMetricDetail === 'productivity' && '📈 Productivity Analysis'}
                {showMetricDetail === 'achievements' && '🎯 Achievement Gallery'}
              </h3>
              <button onClick={() => setShowMetricDetail(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
            </div>
            <div className="space-y-4">
              {showMetricDetail === 'goals' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-blue-600 mb-2">12/15</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Goals Completed This Month</div>
                  </div>
                  <div className="grid gap-3">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2"><span className="text-green-600 text-xl">✅</span><span className="font-semibold">Launch New Product</span></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed on Feb 10, 2026</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2"><span className="text-green-600 text-xl">✅</span><span className="font-semibold">Reach 50K Followers</span></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed on Feb 12, 2026</p>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2"><span className="text-yellow-600 text-xl">🕒</span><span className="font-semibold">Increase Revenue by 20%</span></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">In progress - 65% complete</p>
                    </div>
                  </div>
                </>
              )}
              {showMetricDetail === 'earnings' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-green-600 mb-2">R 24,680</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total This Month</div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium">Primary Business</span>
                      <span className="text-green-600 font-bold">R 18,400</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium">Side Projects</span>
                      <span className="text-green-600 font-bold">R 4,200</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium">Investments</span>
                      <span className="text-green-600 font-bold">R 1,580</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="font-medium">Other Income</span>
                      <span className="text-green-600 font-bold">R 500</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">📈 <strong>+18%</strong> compared to last month</p>
                  </div>
                </>
              )}
              {showMetricDetail === 'productivity' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-purple-600 mb-2">87%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average This Month</div>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Tasks Completed</span>
                        <span className="text-sm font-bold">142/160</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-600" style={{width: '88.75%'}}></div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">On-Time Delivery</span>
                        <span className="text-sm font-bold">94%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-green-600" style={{width: '94%'}}></div>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Focus Time</span>
                        <span className="text-sm font-bold">6.2 hrs/day</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{width: '77.5%'}}></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {showMetricDetail === 'achievements' && (
                <>
                  <div className="text-center py-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl">
                    <div className="text-5xl font-bold text-yellow-600 mb-2">38</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Achievements Unlocked</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">🏆</div>
                      <div className="font-semibold text-sm">Week Warrior</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">7-day streak</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">⚡</div>
                      <div className="font-semibold text-sm">Speed Demon</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">18 tasks in one day</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">🎯</div>
                      <div className="font-semibold text-sm">Goal Crusher</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">3 major milestones</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg text-center">
                      <div className="text-4xl mb-2">💰</div>
                      <div className="font-semibold text-sm">Money Maker</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">R10K in a week</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="glass-card rounded-xl p-4 hover:scale-105 transition-all text-left w-full"
    >
      <Icon className={`w-6 h-6 mb-2 ${color}`} />
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-xs text-gray-600 dark:text-gray-400">{label}</div>
    </button>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
        active
          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function Performance() {
  return (
    <div className="space-y-6">
      {/* Weekly Performance Chart */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">This Week's Performance</h3>
        <div className="grid grid-cols-7 gap-3">
          {[
            { day: 'Mon', score: 85, tasks: 12 },
            { day: 'Tue', score: 92, tasks: 15 },
            { day: 'Wed', score: 78, tasks: 10 },
            { day: 'Thu', score: 95, tasks: 18 },
            { day: 'Fri', score: 88, tasks: 14 },
            { day: 'Sat', score: 70, tasks: 8 },
            { day: 'Sun', score: 65, tasks: 6 },
          ].map((item) => (
            <div key={item.day} className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{item.day}</div>
              <div
                className={`rounded-lg mb-2 ${
                  item.score >= 90 ? 'bg-green-500' :
                  item.score >= 75 ? 'bg-blue-500' :
                  item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ height: `${item.score}px` }}
              ></div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">{item.score}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{item.tasks} tasks</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Peak Performance Times
          </h4>
          <div className="space-y-3">
            <TimeSlot time="9:00 AM - 11:00 AM" productivity="95%" label="Morning Power Hour" />
            <TimeSlot time="2:00 PM - 4:00 PM" productivity="82%" label="Afternoon Focus" />
            <TimeSlot time="8:00 PM - 10:00 PM" productivity="68%" label="Evening Work" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-green-600" />
            Recent Achievements
          </h4>
          <div className="space-y-3">
            <Achievement icon="🏆" title="Week Warrior" description="Completed 7 days in a row" />
            <Achievement icon="⚡" title="Speed Demon" description="18 tasks in one day" />
            <Achievement icon="🎯" title="Goal Crusher" description="Hit 3 major milestones" />
          </div>
        </div>
      </div>

      {/* Productivity Tips */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">💡 Productivity Tips</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <TipCard
            title="Schedule deep work"
            description="Your peak performance is 9-11 AM. Block this time for important tasks."
          />
          <TipCard
            title="Take breaks"
            description="You're 23% more productive after a 10-minute break every 90 minutes."
          />
        </div>
      </div>
    </div>
  );
}

function Financial() {
  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <PiggyBank className="w-8 h-8 text-green-600 mb-3" />
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">R 45,200</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Savings</div>
          <div className="mt-2 text-xs text-green-600 font-semibold">+R 12,400 this month</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <DollarSign className="w-8 h-8 text-blue-600 mb-3" />
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">R 24,680</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</div>
          <div className="mt-2 text-xs text-blue-600 font-semibold">+18% vs last month</div>
        </div>

        <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <Target className="w-8 h-8 text-purple-600 mb-3" />
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">R 150,000</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Goal: New Business</div>
          <div className="mt-2 text-xs text-purple-600 font-semibold">30% achieved</div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Financial Goals</h3>
        <div className="space-y-4">
          <FinancialGoal
            title="Emergency Fund"
            current={45200}
            target={100000}
            icon="🏦"
            color="green"
          />
          <FinancialGoal
            title="New Business Launch"
            current={45200}
            target={150000}
            icon="🚀"
            color="blue"
          />
          <FinancialGoal
            title="Investment Portfolio"
            current={28000}
            target={50000}
            icon="📈"
            color="purple"
          />
          <FinancialGoal
            title="Vacation Fund"
            current={12500}
            target={25000}
            icon="✈️"
            color="orange"
          />
        </div>
      </div>

      {/* Income Streams */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Income Streams</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <IncomeStream source="Primary Business" amount="R 18,400" percentage="75%" />
          <IncomeStream source="Side Projects" amount="R 4,200" percentage="17%" />
          <IncomeStream source="Investments" amount="R 1,580" percentage="6%" />
          <IncomeStream source="Other" amount="R 500" percentage="2%" />
        </div>
      </div>

      {/* Money Motivation */}
      <div className="glass-card rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">💰 Money Motivation</h3>
        <div className="space-y-3">
          <MotivationItem
            text="You earned R 2,400 more than last month. Keep it up!"
            positive={true}
          />
          <MotivationItem
            text="You're R 54,800 away from your business goal. At this rate, you'll reach it in 4 months."
            positive={true}
          />
          <MotivationItem
            text="Your savings rate increased by 15% this quarter. Excellent discipline!"
            positive={true}
          />
        </div>
      </div>
    </div>
  );
}

function Goals() {
  const [showModal, setShowModal] = useState(false);
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Launch New Business',
      category: 'Business',
      progress: 65,
      deadline: '2026-06-30',
      milestones: [
        { name: 'Research Complete', completed: true, tasks: ['Market analysis', 'Competitor review'] },
        { name: 'Business Plan', completed: true, tasks: ['Write business plan', 'Get feedback'] },
        { name: 'Funding Secured', completed: false, tasks: ['Apply for loan', 'Find investors'] },
        { name: 'Launch', completed: false, tasks: ['Set up operations', 'Marketing campaign'] }
      ],
      color: 'blue'
    },
    {
      id: 2,
      title: 'Grow to 100K Followers',
      category: 'Content',
      progress: 45,
      deadline: '2026-12-31',
      milestones: [
        { name: '50K Followers', completed: true, tasks: ['Consistent posting', 'Engage with audience'] },
        { name: '75K Followers', completed: false, tasks: ['Collaborate with others', 'Run giveaways'] },
        { name: '100K Followers', completed: false, tasks: ['Scale content', 'Premium offerings'] }
      ],
      color: 'pink'
    },
    {
      id: 3,
      title: 'Build Emergency Fund',
      category: 'Financial',
      progress: 45,
      deadline: '2026-09-30',
      milestones: [
        { name: 'R 25K', completed: true, tasks: ['Save R5K monthly', 'Cut expenses'] },
        { name: 'R 50K', completed: false, tasks: ['Increase income', 'Invest surplus'] },
        { name: 'R 75K', completed: false, tasks: ['Continue saving', 'Review budget'] },
        { name: 'R 100K', completed: false, tasks: ['Maintain momentum', 'Celebrate achievement'] }
      ],
      color: 'green'
    },
  ]);

  const [newGoal, setNewGoal] = useState({
    title: '',
    category: '',
    deadline: '',
    milestones: [{ name: '', tasks: [''] }]
  });

  const addMilestone = () => {
    setNewGoal({
      ...newGoal,
      milestones: [...newGoal.milestones, { name: '', tasks: [''] }]
    });
  };

  const removeMilestone = (index: number) => {
    if (newGoal.milestones.length > 1) {
      setNewGoal({
        ...newGoal,
        milestones: newGoal.milestones.filter((_, i) => i !== index)
      });
    }
  };

  const updateMilestone = (index: number, field: string, value: any) => {
    const updated = [...newGoal.milestones];
    updated[index] = { ...updated[index], [field]: value };
    setNewGoal({ ...newGoal, milestones: updated });
  };

  const addTask = (milestoneIndex: number) => {
    const updated = [...newGoal.milestones];
    updated[milestoneIndex].tasks.push('');
    setNewGoal({ ...newGoal, milestones: updated });
  };

  const updateTask = (milestoneIndex: number, taskIndex: number, value: string) => {
    const updated = [...newGoal.milestones];
    updated[milestoneIndex].tasks[taskIndex] = value;
    setNewGoal({ ...newGoal, milestones: updated });
  };

  const removeTask = (milestoneIndex: number, taskIndex: number) => {
    const updated = [...newGoal.milestones];
    if (updated[milestoneIndex].tasks.length > 1) {
      updated[milestoneIndex].tasks = updated[milestoneIndex].tasks.filter((_, i) => i !== taskIndex);
      setNewGoal({ ...newGoal, milestones: updated });
    }
  };

  const saveGoal = () => {
    if (!newGoal.title || !newGoal.category || !newGoal.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    const goal = {
      id: Date.now(),
      title: newGoal.title,
      category: newGoal.category,
      progress: 0,
      deadline: newGoal.deadline,
      milestones: newGoal.milestones.map(m => ({
        name: m.name,
        completed: false,
        tasks: m.tasks.filter(t => t.trim() !== '')
      })).filter(m => m.name.trim() !== ''),
      color: newGoal.category === 'Business' ? 'blue' : 
             newGoal.category === 'Content' ? 'pink' : 
             newGoal.category === 'Financial' ? 'green' : 'purple'
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', category: '', deadline: '', milestones: [{ name: '', tasks: [''] }] });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Major Goals</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg text-sm font-medium hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {goals.map((goal) => (
        <div key={goal.id} className="glass-card rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{goal.title}</h4>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-${goal.color}-100 text-${goal.color}-700 dark:bg-${goal.color}-900 dark:text-${goal.color}-300`}>
                {goal.category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{goal.progress}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Complete</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-${goal.color}-500 to-${goal.color}-600`}
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              📅 Deadline: {goal.deadline}
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">🎯 Milestones & Tasks:</div>
            <div className="space-y-3">
              {goal.milestones.map((milestone, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className={`w-5 h-5 ${milestone.completed ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${milestone.completed ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {milestone.name}
                    </span>
                  </div>
                  <div className="ml-7 space-y-1">
                    {milestone.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} className="text-xs text-gray-600 dark:text-gray-400">
                        • {task}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Goal</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Goal Title *
                </label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="e.g., Launch My Online Business"
                  className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                    className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  >
                    <option value="">Select category...</option>
                    <option value="Business">Business</option>
                    <option value="Content">Content</option>
                    <option value="Financial">Financial</option>
                    <option value="Personal">Personal</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="w-full px-4 py-3 glass-input rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Milestones & Action Items
                  </label>
                  <button
                    onClick={addMilestone}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Milestone
                  </button>
                </div>

                <div className="space-y-4">
                  {newGoal.milestones.map((milestone, mIdx) => (
                    <div key={mIdx} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <input
                          type="text"
                          value={milestone.name}
                          onChange={(e) => updateMilestone(mIdx, 'name', e.target.value)}
                          placeholder={`Milestone ${mIdx + 1} name...`}
                          className="flex-1 px-3 py-2 glass-input rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm"
                        />
                        {newGoal.milestones.length > 1 && (
                          <button
                            onClick={() => removeMilestone(mIdx)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="ml-4 space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tasks to complete:</span>
                          <button
                            onClick={() => addTask(mIdx)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Add Task
                          </button>
                        </div>
                        {milestone.tasks.map((task, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <span className="text-gray-400">•</span>
                            <input
                              type="text"
                              value={task}
                              onChange={(e) => updateTask(mIdx, tIdx, e.target.value)}
                              placeholder="Task description..."
                              className="flex-1 px-3 py-1.5 glass-input rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-xs"
                            />
                            {milestone.tasks.length > 1 && (
                              <button
                                onClick={() => removeTask(mIdx, tIdx)}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={saveGoal}
                className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeSlot({ time, productivity, label }: any) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{time}</div>
      </div>
      <div className="text-lg font-bold text-purple-600">{productivity}</div>
    </div>
  );
}

function Achievement({ icon, title, description }: any) {
  return (
    <div className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-lg p-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="font-medium text-gray-900 dark:text-white">{title}</div>
        <div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
      </div>
    </div>
  );
}

function TipCard({ title, description }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
      <h5 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h5>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

function FinancialGoal({ title, current, target, icon, color }: any) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          R {current.toLocaleString()} / R {target.toLocaleString()}
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-600`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{percentage.toFixed(0)}% complete</div>
    </div>
  );
}

function IncomeStream({ source, amount, percentage }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{source}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{amount}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{percentage} of total</div>
    </div>
  );
}

function MotivationItem({ text, positive }: any) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${
      positive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
    }`}>
      <span className="text-2xl">{positive ? '✨' : '⚠️'}</span>
      <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{text}</p>
    </div>
  );
}

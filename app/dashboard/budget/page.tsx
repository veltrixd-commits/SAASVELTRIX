'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart, Calendar, Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  icon: string;
}

interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export default function PersonalBudgetPage() {
  const [categories, setCategories] = useState<BudgetCategory[]>([
    { id: '1', name: 'Groceries', budgeted: 3000, spent: 2150, color: 'bg-green-500', icon: '🛒' },
    { id: '2', name: 'Transport', budgeted: 1500, spent: 1200, color: 'bg-blue-500', icon: '🚗' },
    { id: '3', name: 'Entertainment', budgeted: 1000, spent: 850, color: 'bg-purple-500', icon: '🎬' },
    { id: '4', name: 'Utilities', budgeted: 2000, spent: 1950, color: 'bg-yellow-500', icon: '💡' },
    { id: '5', name: 'Healthcare', budgeted: 1500, spent: 500, color: 'bg-red-500', icon: '⚕️' },
    { id: '6', name: 'Personal Care', budgeted: 800, spent: 450, color: 'bg-pink-500', icon: '💅' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', date: '2026-02-14', category: 'Groceries', description: 'Woolworths shopping', amount: -350, type: 'expense' },
    { id: '2', date: '2026-02-13', category: 'Transport', description: 'Uber to work', amount: -85, type: 'expense' },
    { id: '3', date: '2026-02-12', category: 'Entertainment', description: 'Movie tickets', amount: -180, type: 'expense' },
    { id: '4', date: '2026-02-10', category: 'Income', description: 'Salary', amount: 15000, type: 'income' },
  ]);

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(15000);

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = monthlyIncome - totalSpent;
  const savingsRate = ((remaining / monthlyIncome) * 100).toFixed(1);

  useEffect(() => {
    // Load from localStorage
    const savedCategories = localStorage.getItem('personalBudgetCategories');
    const savedTransactions = localStorage.getItem('personalBudgetTransactions');
    const savedIncome = localStorage.getItem('personalMonthlyIncome');

    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedIncome) setMonthlyIncome(JSON.parse(savedIncome));
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('personalBudgetCategories', JSON.stringify(categories));
    localStorage.setItem('personalBudgetTransactions', JSON.stringify(transactions));
    localStorage.setItem('personalMonthlyIncome', JSON.stringify(monthlyIncome));
  }, [categories, transactions, monthlyIncome]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            Personal Budget
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your personal spending and savings</p>
        </div>
        <button
          onClick={() => setShowAddTransaction(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">R{monthlyIncome.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">R{totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{((totalSpent / monthlyIncome) * 100).toFixed(1)}% of income</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">R{remaining.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{savingsRate}% savings rate</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Budgeted</p>
            <PieChart className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">R{totalBudgeted.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">{categories.length} categories</p>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Categories</h2>
          <button
            onClick={() => setShowAddCategory(true)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        <div className="space-y-4">
          {categories.map(category => {
            const percentage = (category.spent / category.budgeted) * 100;
            const isOverBudget = percentage > 100;

            return (
              <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        R{category.spent.toLocaleString()} of R{category.budgeted.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {percentage.toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      R{(category.budgeted - category.spent).toLocaleString()} left
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-600' : category.color}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {isOverBudget && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Over budget by R{(category.spent - category.budgeted).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {transactions.slice(0, 10).map(transaction => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{transaction.description}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                </p>
              </div>
              <p
                className={`text-lg font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {transaction.type === 'income' ? '+' : ''}R{Math.abs(transaction.amount).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

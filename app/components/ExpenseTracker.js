"use client";

import { useState, useEffect } from "react";

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    monthlyPrice: "",
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem("expenses");
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save to localStorage whenever expenses change
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem("expenses", JSON.stringify(expenses));
    }
  }, [expenses]);

  const calculateDailyCost = (monthlyPrice) => {
    return (monthlyPrice / 30).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.monthlyPrice) {
      const newExpense = {
        id: Date.now(),
        name: formData.name,
        monthlyPrice: parseFloat(formData.monthlyPrice),
        createdAt: new Date().toISOString(),
      };
      setExpenses([...expenses, newExpense]);
      setFormData({
        name: "",
        monthlyPrice: "",
      });
    }
  };

  const deleteExpense = (id) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
  };

  const totalMonthly = expenses.reduce(
    (sum, expense) => sum + expense.monthlyPrice,
    0
  );
  const totalDaily = totalMonthly / 30;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        💰 支出追踪
      </h2>

      {/* Add Expense Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              支出名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="例如：房租、健身房会员"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              每月价格 (¥)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.monthlyPrice}
              onChange={(e) =>
                setFormData({ ...formData, monthlyPrice: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          添加支出
        </button>
      </form>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">还没有添加任何支出</p>
          <p className="text-sm mt-2">添加你的第一笔月支出来开始追踪</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => {
            const dailyCost = calculateDailyCost(expense.monthlyPrice);

            return (
              <div
                key={expense.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      {expense.name}
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          每月支出
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-white text-lg">
                          ¥{expense.monthlyPrice.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">
                          每日消耗
                        </p>
                        <p className="font-bold text-red-600 dark:text-red-400 text-lg">
                          ¥{dailyCost}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                    title="删除"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {expenses.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>月度总支出：</strong>¥{totalMonthly.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>每日总消耗：</strong>¥{totalDaily.toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>年度预估支出：</strong>¥{(totalMonthly * 12).toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

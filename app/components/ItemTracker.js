"use client";

import { useState, useEffect } from "react";

export default function ItemTracker() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    purchaseDate: new Date().toISOString().split("T")[0],
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem("items");
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("items", JSON.stringify(items));
    }
  }, [items]);

  const calculateDaysOwned = (purchaseDate) => {
    const purchase = new Date(purchaseDate);
    const today = new Date();
    const diffTime = Math.abs(today - purchase);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays; // At least 1 day
  };

  const calculateDailyCost = (price, days) => {
    return (price / days).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.price && formData.purchaseDate) {
      const newItem = {
        id: Date.now(),
        name: formData.name,
        price: parseFloat(formData.price),
        purchaseDate: formData.purchaseDate,
      };
      setItems([...items, newItem]);
      setFormData({
        name: "",
        price: "",
        purchaseDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  const deleteItem = (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    localStorage.setItem("items", JSON.stringify(updatedItems));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        📦 物品价值追踪
      </h2>

      {/* Add Item Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              物品名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="例如：MacBook Pro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              价格 (¥)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              购买日期
            </label>
            <input
              type="date"
              value={formData.purchaseDate}
              onChange={(e) =>
                setFormData({ ...formData, purchaseDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          添加物品
        </button>
      </form>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">还没有添加任何物品</p>
          <p className="text-sm mt-2">添加你的第一个物品来开始追踪价值</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items
            .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
            .map((item) => {
              const daysOwned = calculateDaysOwned(item.purchaseDate);
              const dailyCost = calculateDailyCost(item.price, daysOwned);

              return (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-5 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                        {item.name}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            购买价格
                          </p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            ¥{item.price.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            购买日期
                          </p>
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {item.purchaseDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            已使用天数
                          </p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {daysOwned} 天
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">
                            每天成本
                          </p>
                          <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                            ¥{dailyCost}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteItem(item.id)}
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
      {items.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>总计：</strong>
            {items.length} 件物品 | 总投资：¥
            {items.reduce((sum, item) => sum + item.price, 0).toFixed(2)} | 当前每日总成本：¥
            {items
              .reduce((sum, item) => {
                const days = calculateDaysOwned(item.purchaseDate);
                return sum + item.price / days;
              }, 0)
              .toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}

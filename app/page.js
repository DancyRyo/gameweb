"use client";

import { useState } from "react";
import ItemTracker from "./components/ItemTracker";
import ExpenseTracker from "./components/ExpenseTracker";
import ImportantNotes from "./components/ImportantNotes";

export default function Home() {
  const [activeTab, setActiveTab] = useState("items");

  const tabs = [
    { id: "items", name: "物品价值", icon: "📦" },
    { id: "expenses", name: "支出追踪", icon: "💰" },
    { id: "notes", name: "重要事项", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            我的日常助手
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            物品价值追踪 · 支出管理 · 重要事项
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 inline-flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          {activeTab === "items" && <ItemTracker />}
          {activeTab === "expenses" && <ExpenseTracker />}
          {activeTab === "notes" && <ImportantNotes />}
        </div>
      </div>
    </div>
  );
}

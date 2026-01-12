"use client";

import { useState } from "react";
import ItemTracker from "./components/ItemTracker";
import ExpenseTracker from "./components/ExpenseTracker";
import ImportantNotes from "./components/ImportantNotes";

export default function Home() {
  const [activeTab, setActiveTab] = useState("items");


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">

    </div>
  );
}

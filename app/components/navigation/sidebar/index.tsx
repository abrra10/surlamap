import React from "react";

type SidebarProps = {
  isOpen: boolean;
  toggle: () => void;
};

export default function Sidebar({ isOpen, toggle }: SidebarProps) {
  if (!isOpen) return null; // hides sidebar if not open

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="w-64 h-full bg-white shadow-md p-4">
        <button onClick={toggle}>Close Sidebar</button>
        {/* Sidebar content goes here */}
      </div>
    </div>
  );
}

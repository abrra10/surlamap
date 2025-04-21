"use client";

import DashboardLayout from "@/app/components/dashboard/Layout";

export default function AttendeeTickets() {
  return (
    <DashboardLayout role="attendee">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">My Tickets</h2>

        <div className="border-b pb-4 mb-4">
          <p className="text-gray-600">
            You don't have any tickets yet. Browse events to purchase tickets.
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Browse Events
          </button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Past Tickets</h3>
          <p className="text-gray-600">No past tickets found.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

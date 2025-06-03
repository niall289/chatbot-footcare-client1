
import React from 'react';

export function CalendarEmbed() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          📅 Book Your Appointment
        </h3>
        <p className="text-blue-700 mb-4">
          Click the button below to access our online booking system:
        </p>
        <a
          href="https://calendly.com/footcareclinic"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
        >
          🗓️ Book Appointment Online
        </a>
        <p className="text-sm text-blue-600 mt-3">
          Or call us at: <strong>089 9678596</strong>
        </p>
      </div>
    </div>
  );
}

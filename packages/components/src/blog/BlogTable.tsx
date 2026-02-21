import React from 'react';

interface BlogTableProps {
  headers: string[];
  rows: string[][];
}

export function BlogTable({ headers, rows }: BlogTableProps) {
  return (
    <div className="my-8 overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => <th key={i} className="text-left py-3 px-4 font-semibold text-[var(--ss-text)]">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-100">
              {row.map((cell, j) => <td key={j} className="py-3 px-4 text-[var(--ss-text)]/70">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

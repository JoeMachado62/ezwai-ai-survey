'use client';

export default function ReportViewerPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-width-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Report Viewer</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">View Report for The Digital Marketing Media Company</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <p className="font-semibold">Report ID:</p>
              <code className="text-sm">dfc2f3e7-e270-4c5f-bf48-855ebd95f088</code>
            </div>
            
            <div className="flex gap-4">
              <a 
                href="/api/reports/dfc2f3e7-e270-4c5f-bf48-855ebd95f088"
                target="_blank"
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View HTML Report (Direct API)
              </a>
              
              <button
                onClick={() => {
                  fetch('/api/reports/dfc2f3e7-e270-4c5f-bf48-855ebd95f088')
                    .then(res => res.text())
                    .then(html => {
                      const win = window.open('', '_blank');
                      if (win) {
                        win.document.write(html);
                        win.document.close();
                      }
                    })
                    .catch(err => alert('Error loading report: ' + err.message));
                }}
                className="px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Open Report in New Window
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 rounded">
              <h3 className="font-semibold mb-2">Alternative Access Methods:</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  1. Direct API URL: 
                  <a href="/api/reports/dfc2f3e7-e270-4c5f-bf48-855ebd95f088" className="text-blue-600 hover:underline">
                    /api/reports/dfc2f3e7-e270-4c5f-bf48-855ebd95f088
                  </a>
                </li>
                <li>
                  2. Reports List API: 
                  <a href="/api/reports/list" className="text-blue-600 hover:underline">
                    /api/reports/list
                  </a>
                </li>
                <li>
                  3. If the above don't work, check that Supabase environment variables are set in Railway
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
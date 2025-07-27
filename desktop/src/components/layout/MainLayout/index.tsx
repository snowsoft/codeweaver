import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import { StatusBar } from '../StatusBar';
import { Dashboard } from '../../../views/Dashboard';
import { Generate } from '../../../views/Generate';
import { Refactor } from '../../../views/Refactor';
import { Document } from '../../../views/Document';
import { Test } from '../../../views/Test';
import { Review } from '../../../views/Review';
import { History } from '../../../views/History';
import { Settings } from '../../../views/Settings';

export function MainLayout() {
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/generate" element={<Generate />} />
                        <Route path="/refactor" element={<Refactor />} />
                        <Route path="/document" element={<Document />} />
                        <Route path="/test" element={<Test />} />
                        <Route path="/review" element={<Review />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </main>
                <StatusBar />
            </div>
        </div>
    );
}
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import AdminLayout from './components/Layout/AdminLayout';

// Pages - Lazy loaded for code splitting
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const BlogList = lazy(() => import('./pages/Blogs/BlogList'));
const BlogForm = lazy(() => import('./pages/Blogs/BlogForm'));
const MeetingList = lazy(() => import('./pages/Meetings/MeetingList'));
const MeetingForm = lazy(() => import('./pages/Meetings/MeetingForm'));
const SeminarList = lazy(() => import('./pages/Seminars/SeminarList'));
const SeminarEventList = lazy(() => import('./pages/SeminarEvents/SeminarEventList'));
const SeminarEventForm = lazy(() => import('./pages/SeminarEvents/SeminarEventForm'));
const SyllabusList = lazy(() => import('./pages/Syllabus/SyllabusList'));
const SyllabusForm = lazy(() => import('./pages/Syllabus/SyllabusForm'));
const ContactList = lazy(() => import('./pages/Contacts/ContactList'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/blogs" element={<BlogList />} />
                <Route path="/blogs/create" element={<BlogForm />} />
                <Route path="/blogs/edit/:id" element={<BlogForm />} />
                <Route path="/syllabus" element={<SyllabusList />} />
                <Route path="/syllabus/create" element={<SyllabusForm />} />
                <Route path="/syllabus/edit/:id" element={<SyllabusForm />} />
                <Route path="/meetings" element={<MeetingList />} />
                <Route path="/meetings/create" element={<MeetingForm />} />
                <Route path="/meetings/edit/:id" element={<MeetingForm />} />
                <Route path="/seminars" element={<SeminarList />} />
                <Route path="/seminar-events" element={<SeminarEventList />} />
                <Route path="/seminar-events/create" element={<SeminarEventForm />} />
                <Route path="/seminar-events/edit/:id" element={<SeminarEventForm />} />
                <Route path="/contacts" element={<ContactList />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;

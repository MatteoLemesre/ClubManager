import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout          from './components/layout/AppLayout'
import EventsPage         from './pages/app/EventsPage'
import TeamPage           from './pages/app/TeamPage'
import MembersPage        from './pages/app/MembersPage'
import CalendarPage       from './pages/app/CalendarPage'
import MessagesPage       from './pages/app/MessagesPage'
import MatchPage          from './pages/app/MatchPage'
import ProfilePage        from './pages/app/ProfilePage'
import ExploreClubsPage  from './pages/app/ExploreClubsPage'
import HomePage           from './pages/public/HomePage'
import LoginPage          from './pages/auth/LoginPage'
import RegisterClubPage   from './pages/auth/RegisterClubPage'
import RegisterMemberPage from './pages/auth/RegisterMemberPage'
import PendingPage        from './pages/auth/PendingPage'

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"                  element={<HomePage />} />
      <Route path="/login"             element={<LoginPage />} />
      <Route path="/register/club"     element={<RegisterClubPage />} />
      <Route path="/register/member"   element={<RegisterMemberPage />} />
      <Route path="/register/pending"  element={<PendingPage />} />
      <Route path="/app" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index              element={<Navigate to="/app/events" replace />} />
        <Route path="events"      element={<EventsPage />} />
        <Route path="team"        element={<TeamPage />} />
        <Route path="members"     element={<MembersPage />} />
        <Route path="calendar"    element={<CalendarPage />} />
        <Route path="messages"    element={<MessagesPage />} />
        <Route path="matches/:id" element={<MatchPage />} />
        <Route path="profile"     element={<ProfilePage />} />
        <Route path="profile/:id" element={<ProfilePage />} />
        <Route path="explore"     element={<ExploreClubsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

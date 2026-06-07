import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout          from './components/layout/AppLayout'
import EventsPage         from './pages/app/EventsPage'
import TeamPage           from './pages/app/TeamPage'
import MembersPage        from './pages/app/MembersPage'
import CalendarPage       from './pages/app/CalendarPage'
import MessagesPage       from './pages/app/MessagesPage'
import MatchPage          from './pages/app/MatchPage'
import ProfilePage        from './pages/app/ProfilePage'
import ExploreClubsPage  from './pages/app/ExploreClubsPage'
import AdminPage         from './pages/app/AdminPage'
import ResultsPage       from './pages/app/ResultsPage'
import TeamHistoryPage   from './pages/app/TeamHistoryPage'
import FeedPage          from './pages/app/FeedPage'
import ClubProfilePage   from './pages/app/ClubProfilePage'
import TeamDetailPage      from './pages/app/TeamDetailPage'
import TeamDocumentsPage   from './pages/app/TeamDocumentsPage'
import ClubDocumentsPage   from './pages/app/ClubDocumentsPage'
import PresidentPage             from './pages/app/PresidentPage'
import ImprovementLauncherPage  from './pages/app/ImprovementLauncherPage'
import HomePage             from './pages/public/HomePage'
import LoginPage          from './pages/auth/LoginPage'
import RegisterPage       from './pages/auth/RegisterPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"        element={<Navigate to="/app/feed" replace />} />
      <Route path="/login"   element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/app" element={<AppLayout />}>
        <Route index              element={<Navigate to="/app/feed" replace />} />
        <Route path="events"      element={<EventsPage />} />
        <Route path="team"        element={<TeamPage />} />
        <Route path="members"     element={<MembersPage />} />
        <Route path="calendar"    element={<CalendarPage />} />
        <Route path="messages"    element={<MessagesPage />} />
        <Route path="matches/:id" element={<MatchPage />} />
        <Route path="profile"     element={<ProfilePage />} />
        <Route path="profile/:id" element={<ProfilePage />} />
        <Route path="explore"                   element={<ExploreClubsPage />} />
        <Route path="admin"                     element={<AdminPage />} />
        <Route path="results"                   element={<ResultsPage />} />
        <Route path="history/:teamId/:season"   element={<TeamHistoryPage />} />
        <Route path="feed"                      element={<FeedPage />} />
        <Route path="clubs/:clubId"             element={<ClubProfilePage />} />
        <Route path="teams/:teamId"             element={<TeamDetailPage />} />
        <Route path="team-documents"            element={<TeamDocumentsPage />} />
        <Route path="club-documents"            element={<ClubDocumentsPage />} />
        <Route path="president"                 element={<PresidentPage />} />
        <Route path="launcher"                  element={<ImprovementLauncherPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/feed" replace />} />
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

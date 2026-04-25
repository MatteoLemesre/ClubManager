import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import EventsPage   from './pages/app/EventsPage'
import TeamPage     from './pages/app/TeamPage'
import MembersPage  from './pages/app/MembersPage'
import CalendarPage from './pages/app/CalendarPage'
import MessagesPage from './pages/app/MessagesPage'
import MatchPage    from './pages/app/MatchPage'
import LoginPage    from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/app"      element={<AppLayout />}>
            <Route index          element={<Navigate to="/app/events" replace />} />
            <Route path="events"  element={<EventsPage />} />
            <Route path="team"    element={<TeamPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="calendar"element={<CalendarPage />} />
            <Route path="messages"element={<MessagesPage />} />
            <Route path="matches/:id" element={<MatchPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/app/events" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameMonth, isSameDay, isToday, parseISO, format, addMonths, subMonths,
  getDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '../../context/AuthContext'
import { EVENTS, TRAININGS, MATCHES, getTeamById } from '../../data/mock'
import { Card, Badge, SectionHeader } from '../../components/ui'
import { ChevronLeft, ChevronRight, Clock, MapPin, Trophy, Calendar, Users } from 'lucide-react'

const EVENT_COLORS = {
  training: 'bg-emerald-400',
  match_home: 'bg-brand-500',
  match_away: 'bg-orange-400',
  event: 'bg-violet-400',
}

function buildDayEvents(date) {
  const dateStr = format(date, 'yyyy-MM-dd')
  const items = []

  TRAININGS.forEach(t => {
    if (format(parseISO(t.date), 'yyyy-MM-dd') === dateStr) {
      items.push({ type: 'training', color: EVENT_COLORS.training, data: t, label: `Entraînement — ${getTeamById(t.teamId)?.name}` })
    }
  })
  MATCHES.forEach(m => {
    if (format(parseISO(m.date), 'yyyy-MM-dd') === dateStr) {
      const color = m.location === 'home' ? EVENT_COLORS.match_home : EVENT_COLORS.match_away
      items.push({ type: 'match', color, data: m, label: `${m.location === 'home' ? 'vs' : '@'} ${m.opponent}` })
    }
  })
  EVENTS.forEach(e => {
    if (format(parseISO(e.date), 'yyyy-MM-dd') === dateStr) {
      items.push({ type: 'event', color: EVENT_COLORS.event, data: e, label: e.title })
    }
  })
  return items
}

export default function CalendarPage() {
  const { currentUser } = useAuth()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [filters, setFilters] = useState({ training: true, match: true, event: true })

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const selectedDayEvents = buildDayEvents(selectedDay).filter(e => filters[e.type])

  const WEEK_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  function toggleFilter(key) {
    setFilters(f => ({ ...f, [key]: !f[key] }))
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-surface-900">Calendrier</h1>
          <p className="text-surface-500 mt-1">Entraînements, matchs et événements</p>
        </div>
        {/* Filtres */}
        <div className="flex items-center gap-2">
          {[
            { key: 'training', label: 'Entraînements', color: 'bg-emerald-400' },
            { key: 'match',    label: 'Matchs',         color: 'bg-brand-500' },
            { key: 'event',    label: 'Événements',     color: 'bg-violet-400' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => toggleFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                filters[f.key]
                  ? 'bg-white border-surface-200 text-surface-800'
                  : 'bg-surface-50 border-surface-200 text-surface-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${filters[f.key] ? f.color : 'bg-surface-300'}`} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendrier */}
        <div className="col-span-2">
          <Card className="overflow-hidden">
            {/* Navigation mois */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <button
                onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ChevronLeft size={18} className="text-surface-600" />
              </button>
              <h2 className="font-display font-semibold text-surface-900 capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: fr })}
              </h2>
              <button
                onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                className="p-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ChevronRight size={18} className="text-surface-600" />
              </button>
            </div>

            {/* Jours semaine */}
            <div className="grid grid-cols-7 border-b border-surface-100">
              {WEEK_DAYS.map(d => (
                <div key={d} className="py-2 text-center text-xs font-semibold text-surface-400">
                  {d}
                </div>
              ))}
            </div>

            {/* Grille */}
            <div className="grid grid-cols-7">
              {days.map((day, idx) => {
                const dayEvents = buildDayEvents(day).filter(e => filters[e.type])
                const isCurrentMonth = isSameMonth(day, currentMonth)
                const isSelected = isSameDay(day, selectedDay)
                const isTodayDay = isToday(day)

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[80px] p-2 border-b border-r border-surface-100 text-left transition-colors ${
                      isSelected ? 'bg-brand-50' : 'hover:bg-surface-50'
                    } ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <span
                      className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1 ${
                        isTodayDay
                          ? 'bg-brand-600 text-white'
                          : isSelected
                          ? 'text-brand-700 font-bold'
                          : 'text-surface-700'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map((e, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${e.color}`} />
                          <span className="text-xs text-surface-600 truncate leading-tight">{e.label}</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-xs text-surface-400">+{dayEvents.length - 2}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Panel jour sélectionné */}
        <div>
          <SectionHeader
            title={format(selectedDay, "EEE d MMMM", { locale: fr })}
          />
          {selectedDayEvents.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar size={28} className="text-surface-300 mx-auto mb-2" />
              <p className="text-sm text-surface-500">Aucun événement ce jour</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map((item, idx) => {
                const { type, data } = item

                if (type === 'training') {
                  const team = getTeamById(data.teamId)
                  return (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <Badge variant="green">Entraînement</Badge>
                        {team && <Badge variant="gray">{team.name}</Badge>}
                      </div>
                      <p className="font-semibold text-surface-900 text-sm">{data.theme}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <Clock size={11} />
                          {format(parseISO(data.date), "HH'h'mm")} · {data.duration} min
                        </p>
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <MapPin size={11} /> {data.location}
                        </p>
                      </div>
                      {['coach', 'player'].includes(currentUser.role) && (
                        <div className="mt-3 pt-3 border-t border-surface-100 flex gap-2">
                          <button className="flex-1 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
                            Présent
                          </button>
                          <button className="flex-1 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            Absent
                          </button>
                        </div>
                      )}
                    </Card>
                  )
                }

                if (type === 'match') {
                  const team = getTeamById(data.teamId)
                  return (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-2 h-2 rounded-full ${data.location === 'home' ? 'bg-brand-500' : 'bg-orange-400'}`} />
                        <Badge variant={data.location === 'home' ? 'brand' : 'orange'}>
                          {data.location === 'home' ? 'Domicile' : 'Extérieur'}
                        </Badge>
                        {team && <Badge variant="gray">{team.name}</Badge>}
                      </div>
                      <p className="font-semibold text-surface-900 text-sm">
                        {data.location === 'home' ? 'vs' : '@'} {data.opponent}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">{data.competition}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <Clock size={11} />
                          {format(parseISO(data.date), "HH'h'mm")}
                        </p>
                        <p className="text-xs text-surface-500 flex items-center gap-1">
                          <MapPin size={11} /> {data.ground}
                        </p>
                      </div>
                      {data.status === 'played' && data.score && (
                        <div className="mt-2 pt-2 border-t border-surface-100">
                          <p className="text-sm font-bold text-surface-900 text-center">
                            {data.score.home} – {data.score.away}
                          </p>
                        </div>
                      )}
                    </Card>
                  )
                }

                // event
                return (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-violet-400" />
                      <Badge variant="purple">Événement</Badge>
                    </div>
                    <p className="font-semibold text-surface-900 text-sm">{data.title}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-surface-500 flex items-center gap-1">
                        <Clock size={11} />
                        {format(parseISO(data.date), "HH'h'mm")}
                      </p>
                      <p className="text-xs text-surface-500 flex items-center gap-1">
                        <MapPin size={11} /> {data.location}
                      </p>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  Zap, Star, Trophy, BarChart3, CreditCard, ClipboardList,
  CalendarDays, Image, User, Moon, Award, TrendingUp,
  Copy, Check, ChevronDown, ChevronUp, Rocket, Lock,
  Filter, Search, X, Eye, Code2, Play
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// Données : liste complète des améliorations avec code embarqué
// ─────────────────────────────────────────────────────────────
const IMPROVEMENTS = [
  // ══════ P1 - CRITIQUE ══════
  {
    id: 'p1-stats-dashboard',
    priority: 'P1',
    title: 'Dashboard KPIs temps réel',
    subtitle: 'Métriques clés du club en un coup d\'œil',
    icon: BarChart3,
    tags: ['analytics', 'dashboard', 'KPI'],
    prompt: `Crée un composant React StatsKPIDashboard pour une app de gestion de club sportif.
Il doit afficher 4 KPI cards : membres actifs, taux de victoires, présence moyenne aux entraînements, cotisations perçues.
Chaque card a une icône, valeur principale, évolution vs mois précédent (avec flèche verte/rouge), et sparkline simplifiée.
Utilise Tailwind CSS, données mock intégrées, localStorage pour cache. Prêt à intégrer.`,
    code: `import { useState, useEffect } from 'react'
import { Users, Trophy, Calendar, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'

// Données mock réalistes
const MOCK_STATS = {
  members: { value: 47, prev: 42, unit: 'membres', label: 'Membres actifs' },
  winRate: { value: 68, prev: 61, unit: '%', label: 'Taux de victoires' },
  attendance: { value: 82, prev: 79, unit: '%', label: 'Présence moy.' },
  payments: { value: 3840, prev: 3200, unit: '€', label: 'Cotisations' },
}

const SPARKLINES = {
  members: [38, 40, 39, 42, 41, 43, 47],
  winRate:  [55, 60, 58, 63, 65, 61, 68],
  attendance:[75, 78, 80, 77, 81, 79, 82],
  payments: [2800, 3000, 3100, 3200, 3500, 3600, 3840],
}

function Sparkline({ data, color = '#3b82f6' }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 80, h = 32, pad = 2
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / range) * (h - pad * 2)
    return \`\${x},\${y}\`
  }).join(' ')
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function KPICard({ icon: Icon, data, sparkKey, color, bgColor, borderColor }) {
  const delta = data.value - data.prev
  const pct = ((delta / data.prev) * 100).toFixed(1)
  const up = delta >= 0
  return (
    <div className={\`rounded-2xl border \${borderColor} \${bgColor} p-5 flex flex-col gap-3 shadow-sm\`}>
      <div className="flex items-center justify-between">
        <div className={\`p-2 rounded-xl \${bgColor}\`}>
          <Icon size={20} className={color} />
        </div>
        <Sparkline data={SPARKLINES[sparkKey]} color={color.replace('text-', '').includes('blue') ? '#3b82f6' : color.includes('green') ? '#22c55e' : color.includes('purple') ? '#a855f7' : '#f59e0b'} />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">
          {data.unit === '€' ? \`\${data.value.toLocaleString()}€\` : \`\${data.value}\${data.unit === '%' ? '%' : ''}\`}
          {data.unit !== '€' && data.unit !== '%' && <span className="text-sm font-normal text-gray-500 ml-1">{data.unit}</span>}
        </div>
        <div className="text-sm text-gray-500 mt-0.5">{data.label}</div>
      </div>
      <div className={\`flex items-center gap-1 text-xs font-medium \${up ? 'text-green-600' : 'text-red-500'}\`}>
        {up ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
        {up ? '+' : ''}{pct}% vs mois dernier
      </div>
    </div>
  )
}

export default function StatsKPIDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    // Vérifie le cache localStorage (5 min)
    const cached = localStorage.getItem('club_kpi_stats')
    if (cached) {
      const { data, ts } = JSON.parse(cached)
      if (Date.now() - ts < 5 * 60 * 1000) { setStats(data); return }
    }
    // Simule un fetch API
    setTimeout(() => {
      setStats(MOCK_STATS)
      localStorage.setItem('club_kpi_stats', JSON.stringify({ data: MOCK_STATS, ts: Date.now() }))
    }, 300)
  }, [])

  if (!stats) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {[...Array(4)].map((_, i) => <div key={i} className="rounded-2xl bg-gray-100 h-36"/>)}
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Vue d'ensemble</h2>
        <span className="text-xs text-gray-400">Mis à jour à l'instant</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={Users}    data={stats.members}    sparkKey="members"    color="text-blue-500"   bgColor="bg-blue-50"   borderColor="border-blue-100"/>
        <KPICard icon={Trophy}   data={stats.winRate}    sparkKey="winRate"    color="text-green-500"  bgColor="bg-green-50"  borderColor="border-green-100"/>
        <KPICard icon={Calendar} data={stats.attendance} sparkKey="attendance" color="text-purple-500" bgColor="bg-purple-50" borderColor="border-purple-100"/>
        <KPICard icon={CreditCard} data={stats.payments} sparkKey="payments"  color="text-amber-500"  bgColor="bg-amber-50"  borderColor="border-amber-100"/>
      </div>
    </div>
  )
}`,
  },
  {
    id: 'p1-payment-tracker',
    priority: 'P1',
    title: 'Suivi cotisations membres',
    subtitle: 'Statuts de paiement + relances automatiques',
    icon: CreditCard,
    tags: ['paiement', 'finances', 'membres'],
    prompt: `Crée un composant React PaymentTracker pour une app club sportif.
Liste de membres avec statut cotisation (Payé ✅, En attente ⏳, En retard ❌).
Filtres par statut, barre de recherche, bouton "Envoyer relance" (simule envoi email).
Résumé financier en haut (total perçu / attendu). Tri par nom / montant / statut.
Tailwind CSS, données mock, localStorage pour persister les mises à jour de statut.`,
    code: `import { useState, useEffect, useMemo } from 'react'
import { Search, CheckCircle, Clock, AlertCircle, Send, Filter, ChevronUp, ChevronDown } from 'lucide-react'

const MOCK_MEMBERS = [
  { id: 1, name: 'Lucas Martin',    amount: 180, status: 'paid',    dueDate: '2025-09-01', email: 'lucas@example.com' },
  { id: 2, name: 'Emma Dupont',     amount: 180, status: 'paid',    dueDate: '2025-09-01', email: 'emma@example.com' },
  { id: 3, name: 'Noah Leroy',      amount: 180, status: 'pending', dueDate: '2025-09-15', email: 'noah@example.com' },
  { id: 4, name: 'Chloé Bernard',   amount: 180, status: 'late',    dueDate: '2025-08-01', email: 'chloe@example.com' },
  { id: 5, name: 'Arthur Moreau',   amount: 180, status: 'paid',    dueDate: '2025-09-01', email: 'arthur@example.com' },
  { id: 6, name: 'Jade Simon',      amount: 180, status: 'late',    dueDate: '2025-08-01', email: 'jade@example.com' },
  { id: 7, name: 'Ethan Laurent',   amount: 180, status: 'pending', dueDate: '2025-09-15', email: 'ethan@example.com' },
  { id: 8, name: 'Léa Thomas',      amount: 180, status: 'paid',    dueDate: '2025-09-01', email: 'lea@example.com' },
]

const STATUS_CONFIG = {
  paid:    { label: 'Payé',       icon: CheckCircle,  bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200' },
  pending: { label: 'En attente', icon: Clock,        bg: 'bg-amber-100',  text: 'text-amber-700',  border: 'border-amber-200' },
  late:    { label: 'En retard',  icon: AlertCircle,  bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={\`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border \${cfg.bg} \${cfg.text} \${cfg.border}\`}>
      <Icon size={11}/>{cfg.label}
    </span>
  )
}

export default function PaymentTracker() {
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('payment_tracker_members')
    return saved ? JSON.parse(saved) : MOCK_MEMBERS
  })
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' })
  const [sentRelances, setSentRelances] = useState(new Set())

  useEffect(() => {
    localStorage.setItem('payment_tracker_members', JSON.stringify(members))
  }, [members])

  const summary = useMemo(() => ({
    total: members.length * 180,
    collected: members.filter(m => m.status === 'paid').length * 180,
    pending: members.filter(m => m.status !== 'paid').length,
  }), [members])

  const filtered = useMemo(() => {
    let list = members
    if (search) list = list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
    if (filter !== 'all') list = list.filter(m => m.status === filter)
    list = [...list].sort((a, b) => {
      const v = sort.key === 'name' ? a.name.localeCompare(b.name) : a.amount - b.amount
      return sort.dir === 'asc' ? v : -v
    })
    return list
  }, [members, search, filter, sort])

  function markPaid(id) {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'paid' } : m))
  }

  function sendRelance(id) {
    setSentRelances(prev => new Set([...prev, id]))
    setTimeout(() => setSentRelances(prev => { const s = new Set(prev); s.delete(id); return s }), 3000)
  }

  function toggleSort(key) {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })
  }

  const SortIcon = ({ k }) => sort.key === k
    ? (sort.dir === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)
    : <ChevronUp size={14} className="opacity-20"/>

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{summary.collected}€</div>
          <div className="text-xs text-blue-500 mt-0.5">Perçus / {summary.total}€</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{members.filter(m=>m.status==='paid').length}</div>
          <div className="text-xs text-green-500 mt-0.5">Payés</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{summary.pending}</div>
          <div className="text-xs text-red-500 mt-0.5">En attente / retard</div>
        </div>
      </div>
      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>
        {['all','paid','pending','late'].map(f => (
          <button key={f} onClick={()=>setFilter(f)}
            className={\`px-3 py-2 rounded-xl text-xs font-medium border transition \${filter===f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}\`}>
            {f==='all'?'Tous':STATUS_CONFIG[f]?.label}
          </button>
        ))}
      </div>
      {/* Table */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer" onClick={()=>toggleSort('name')}>
                <span className="flex items-center gap-1">Membre <SortIcon k="name"/></span>
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(m => (
              <tr key={m.id} className="bg-white hover:bg-gray-50/50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3"><StatusBadge status={m.status}/></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    {m.status !== 'paid' && (
                      <>
                        <button onClick={()=>markPaid(m.id)} className="text-xs px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Marquer payé</button>
                        <button onClick={()=>sendRelance(m.id)}
                          className={\`text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1 transition \${sentRelances.has(m.id) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}\`}>
                          <Send size={11}/>{sentRelances.has(m.id) ? 'Envoyé !' : 'Relance'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">Aucun résultat</div>}
      </div>
    </div>
  )
}`,
  },
  {
    id: 'p1-attendance-module',
    priority: 'P1',
    title: 'Suivi présence entraînements',
    subtitle: 'Check-in rapide + statistiques par joueur',
    icon: ClipboardList,
    tags: ['présence', 'entraînement', 'statistiques'],
    prompt: `Crée un composant React AttendanceModule pour app club sportif.
Liste des membres avec check-in rapide (présent/absent/excusé) pour l'entraînement du jour.
Barre de progression visuelle du taux de présence global.
Historique 4 dernières séances par joueur (pastilles colorées).
Vue stats : top présences, absences fréquentes. Tailwind CSS, mock data, localStorage.`,
    code: `import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Users, TrendingUp } from 'lucide-react'

const PLAYERS = [
  { id:1, name:'Lucas Martin',  number: 10, position:'Attaquant' },
  { id:2, name:'Emma Dupont',   number:  7, position:'Milieu' },
  { id:3, name:'Noah Leroy',    number:  4, position:'Défenseur' },
  { id:4, name:'Chloé Bernard', number:  1, position:'Gardien' },
  { id:5, name:'Arthur Moreau', number:  9, position:'Attaquant' },
  { id:6, name:'Jade Simon',    number:  6, position:'Milieu' },
  { id:7, name:'Ethan Laurent', number:  5, position:'Défenseur' },
  { id:8, name:'Léa Thomas',    number:  3, position:'Défenseur' },
]

// Historique simulé (4 dernières séances)
const HISTORY = {
  1: ['present','present','present','absent'],
  2: ['present','excused','present','present'],
  3: ['absent','present','present','present'],
  4: ['present','present','absent','excused'],
  5: ['present','present','present','present'],
  6: ['excused','absent','present','present'],
  7: ['present','present','present','absent'],
  8: ['absent','present','present','present'],
}

const STATUS = {
  present: { label:'Présent',  icon: CheckCircle, bg:'bg-green-100', text:'text-green-700', dot:'bg-green-400' },
  absent:  { label:'Absent',   icon: XCircle,     bg:'bg-red-100',   text:'text-red-700',   dot:'bg-red-400' },
  excused: { label:'Excusé',   icon: Clock,       bg:'bg-amber-100', text:'text-amber-700', dot:'bg-amber-400' },
  none:    { label:'—',        icon: null,        bg:'bg-gray-100',  text:'text-gray-400',  dot:'bg-gray-200' },
}

function HistoryDot({ status }) {
  return <div className={\`w-3 h-3 rounded-full \${STATUS[status]?.dot || STATUS.none.dot}\`} title={STATUS[status]?.label}/>
}

export default function AttendanceModule() {
  const today = new Date().toISOString().split('T')[0]
  const storageKey = \`attendance_\${today}\`

  const [attendance, setAttendance] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : {}
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(attendance))
  }, [attendance])

  function mark(id, status) {
    setAttendance(prev => ({ ...prev, [id]: status }))
  }

  const counts = {
    present: Object.values(attendance).filter(v=>v==='present').length,
    absent:  Object.values(attendance).filter(v=>v==='absent').length,
    excused: Object.values(attendance).filter(v=>v==='excused').length,
    total:   PLAYERS.length,
  }
  const pct = counts.total ? Math.round((counts.present / counts.total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Présences — Entraînement</h2>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR', {weekday:'long',day:'numeric',month:'long'})}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{pct}%</div>
          <div className="text-xs text-gray-400">{counts.present}/{counts.total} présents</div>
        </div>
      </div>

      {/* Barre progression */}
      <div className="space-y-1.5">
        <div className="flex gap-1 text-xs text-gray-500 justify-end">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>Présent</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Excusé</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>Absent</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 flex overflow-hidden">
          <div className="bg-green-400 transition-all duration-500" style={{width:\`\${(counts.present/counts.total)*100}%\`}}/>
          <div className="bg-amber-400 transition-all duration-500" style={{width:\`\${(counts.excused/counts.total)*100}%\`}}/>
          <div className="bg-red-400 transition-all duration-500" style={{width:\`\${(counts.absent/counts.total)*100}%\`}}/>
        </div>
      </div>

      {/* Liste joueurs */}
      <div className="space-y-2">
        {PLAYERS.map(player => {
          const current = attendance[player.id] || null
          return (
            <div key={player.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                #{player.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{player.name}</div>
                <div className="text-xs text-gray-400">{player.position}</div>
              </div>
              {/* Historique */}
              <div className="flex items-center gap-1 mr-2">
                {(HISTORY[player.id] || []).map((s,i) => <HistoryDot key={i} status={s}/>)}
              </div>
              {/* Boutons check-in */}
              <div className="flex gap-1">
                {['present','excused','absent'].map(s => {
                  const cfg = STATUS[s]
                  const Icon = cfg.icon
                  return (
                    <button key={s} onClick={()=>mark(player.id, current === s ? null : s)}
                      className={\`w-8 h-8 rounded-lg flex items-center justify-center transition \${current===s ? \`\${cfg.bg} \${cfg.text}\` : 'bg-gray-50 text-gray-300 hover:bg-gray-100'}\`}
                      title={cfg.label}>
                      <Icon size={16}/>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats rapides */}
      {Object.keys(attendance).length > 0 && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[{k:'present',label:'Présents',color:'text-green-600',bg:'bg-green-50'},{k:'excused',label:'Excusés',color:'text-amber-600',bg:'bg-amber-50'},{k:'absent',label:'Absents',color:'text-red-600',bg:'bg-red-50'}].map(({k,label,color,bg}) => (
            <div key={k} className={\`\${bg} rounded-xl p-3 text-center\`}>
              <div className={\`text-xl font-bold \${color}\`}>{counts[k]}</div>
              <div className={\`text-xs \${color} opacity-80\`}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}`,
  },

  // ══════ P2 - IMPORTANT ══════
  {
    id: 'p2-enhanced-calendar',
    priority: 'P2',
    title: 'Calendrier amélioré vue semaine',
    subtitle: 'Navigation fluide + catégories colorées',
    icon: CalendarDays,
    tags: ['calendrier', 'planning', 'événements'],
    prompt: `Crée un composant React WeeklyCalendar pour app club sportif.
Vue semaine (lun-dim) avec créneaux horaires. Événements colorés par type (match=bleu, entraînement=vert, réunion=violet, autre=gris).
Navigation prev/next semaine avec bouton "Aujourd'hui". Click sur événement = détail popup.
Bouton "+" pour ajouter événement. Tailwind CSS, données mock, localStorage pour nouveaux events.`,
    code: `import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { startOfWeek, addDays, addWeeks, subWeeks, format, isSameDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

const EVENT_TYPES = {
  match:        { label:'Match',        color:'bg-blue-500',   light:'bg-blue-50 border-blue-200 text-blue-700' },
  training:     { label:'Entraînement', color:'bg-green-500',  light:'bg-green-50 border-green-200 text-green-700' },
  meeting:      { label:'Réunion',      color:'bg-purple-500', light:'bg-purple-50 border-purple-200 text-purple-700' },
  other:        { label:'Autre',        color:'bg-gray-400',   light:'bg-gray-50 border-gray-200 text-gray-700' },
}

const HOURS = Array.from({length: 14}, (_, i) => i + 8) // 8h → 21h

const MOCK_EVENTS = [
  { id:1, title:'Entraînement U18',    type:'training', date: new Date().toISOString().split('T')[0], start:'09:00', end:'11:00' },
  { id:2, title:'Match vs FC Lyon',    type:'match',    date: addDays(new Date(), 2).toISOString().split('T')[0], start:'15:00', end:'17:00' },
  { id:3, title:'Réunion CA',          type:'meeting',  date: addDays(new Date(), 1).toISOString().split('T')[0], start:'18:00', end:'19:30' },
  { id:4, title:'Entraînement U15',    type:'training', date: addDays(new Date(), -1).toISOString().split('T')[0], start:'14:00', end:'16:00' },
]

function eventTop(start) {
  const [h,m] = start.split(':').map(Number)
  return ((h - 8) + m/60) * 64
}
function eventHeight(start, end) {
  const [hs,ms] = start.split(':').map(Number)
  const [he,me] = end.split(':').map(Number)
  return ((he + me/60) - (hs + ms/60)) * 64
}

export default function WeeklyCalendar() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('weekly_calendar_events')
    return saved ? JSON.parse(saved) : MOCK_EVENTS
  })
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newEvent, setNewEvent] = useState({ title:'', type:'training', date:'', start:'10:00', end:'12:00' })

  const days = Array.from({length:7}, (_,i) => addDays(weekStart, i))

  useEffect(() => { localStorage.setItem('weekly_calendar_events', JSON.stringify(events)) }, [events])

  function addEvent() {
    if (!newEvent.title || !newEvent.date) return
    setEvents(prev => [...prev, { ...newEvent, id: Date.now() }])
    setShowAdd(false)
    setNewEvent({ title:'', type:'training', date:'', start:'10:00', end:'12:00' })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      {/* Header nav */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
        <button onClick={()=>setWeekStart(subWeeks(weekStart,1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition"><ChevronLeft size={18}/></button>
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800 text-sm">
            {format(weekStart,'d MMM',{locale:fr})} – {format(addDays(weekStart,6),'d MMM yyyy',{locale:fr})}
          </span>
          <button onClick={()=>setWeekStart(startOfWeek(new Date(),{weekStartsOn:1}))} className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Aujourd'hui</button>
        </div>
        <button onClick={()=>setWeekStart(addWeeks(weekStart,1))} className="p-1.5 rounded-lg hover:bg-gray-200 transition"><ChevronRight size={18}/></button>
      </div>

      {/* Grid */}
      <div className="flex overflow-x-auto">
        {/* Heures */}
        <div className="w-14 shrink-0 border-r border-gray-100">
          <div className="h-12 border-b border-gray-100"/>
          {HOURS.map(h => <div key={h} className="h-16 border-b border-gray-50 flex items-start justify-end pr-2 pt-1"><span className="text-xs text-gray-300">{h}h</span></div>)}
        </div>
        {/* Jours */}
        {days.map(day => {
          const dateStr = format(day,'yyyy-MM-dd')
          const dayEvents = events.filter(e => e.date === dateStr)
          return (
            <div key={dateStr} className="flex-1 min-w-20 border-r border-gray-100 last:border-r-0">
              {/* En-tête jour */}
              <div className={\`h-12 border-b border-gray-100 flex flex-col items-center justify-center \${isToday(day) ? 'bg-blue-50' : ''}\`}>
                <span className="text-xs text-gray-400 uppercase">{format(day,'EEE',{locale:fr})}</span>
                <span className={\`text-sm font-bold \${isToday(day) ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center' : 'text-gray-700'}\`}>
                  {format(day,'d')}
                </span>
              </div>
              {/* Créneaux */}
              <div className="relative" style={{height: HOURS.length * 64}}>
                {HOURS.map(h => <div key={h} className="absolute w-full border-b border-gray-50" style={{top:(h-8)*64, height:64}}/>)}
                {dayEvents.map(ev => {
                  const cfg = EVENT_TYPES[ev.type]
                  return (
                    <div key={ev.id} onClick={()=>setSelected(ev)}
                      className={\`absolute left-1 right-1 rounded-lg border px-1.5 py-1 cursor-pointer hover:opacity-80 transition text-xs \${cfg.light}\`}
                      style={{top: eventTop(ev.start), height: Math.max(eventHeight(ev.start,ev.end),24)}}>
                      <div className="font-medium leading-tight truncate">{ev.title}</div>
                      <div className="opacity-70">{ev.start}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bouton ajouter */}
      <div className="p-3 border-t border-gray-100">
        <button onClick={()=>setShowAdd(true)} className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition flex items-center justify-center gap-1">
          <Plus size={15}/> Ajouter un événement
        </button>
      </div>

      {/* Modal détail */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={()=>setSelected(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <span className={\`text-xs px-2 py-0.5 rounded-full font-medium border \${EVENT_TYPES[selected.type]?.light}\`}>{EVENT_TYPES[selected.type]?.label}</span>
              <button onClick={()=>setSelected(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16}/></button>
            </div>
            <h3 className="font-bold text-gray-900 text-lg">{selected.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{selected.date} · {selected.start} – {selected.end}</p>
          </div>
        </div>
      )}

      {/* Modal ajout */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={()=>setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-3" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Nouvel événement</h3>
              <button onClick={()=>setShowAdd(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16}/></button>
            </div>
            <input placeholder="Titre" value={newEvent.title} onChange={e=>setNewEvent(p=>({...p,title:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <select value={newEvent.type} onChange={e=>setNewEvent(p=>({...p,type:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.entries(EVENT_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <input type="date" value={newEvent.date} onChange={e=>setNewEvent(p=>({...p,date:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <div className="flex gap-2">
              <input type="time" value={newEvent.start} onChange={e=>setNewEvent(p=>({...p,start:e.target.value}))} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              <input type="time" value={newEvent.end} onChange={e=>setNewEvent(p=>({...p,end:e.target.value}))} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <button onClick={addEvent} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">Ajouter</button>
          </div>
        </div>
      )}
    </div>
  )
}`,
  },
  {
    id: 'p2-photo-gallery',
    priority: 'P2',
    title: 'Galerie photos matchs & événements',
    subtitle: 'Upload, organisation et lightbox',
    icon: Image,
    tags: ['médias', 'photos', 'galerie'],
    prompt: `Crée un composant React PhotoGallery pour app club sportif.
Grille masonry de photos avec filtres par album (Matchs, Entraînements, Événements).
Upload drag-and-drop simulé (preview base64 avec FileReader). Lightbox au clic sur photo.
Compteur photos par album. Navigation prev/next dans lightbox. Tailwind CSS, mock photos (placeholders), localStorage.`,
    code: `import { useState, useRef, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Upload, Image as ImageIcon, FolderOpen } from 'lucide-react'

const ALBUMS = ['Tous', 'Matchs', 'Entraînements', 'Événements']
const COLORS = ['bg-blue-200','bg-green-200','bg-purple-200','bg-amber-200','bg-pink-200','bg-indigo-200','bg-teal-200','bg-orange-200']

const MOCK_PHOTOS = Array.from({length:12}, (_,i) => ({
  id: i+1,
  album: ['Matchs','Entraînements','Événements'][i%3],
  title: \`Photo \${i+1}\`,
  color: COLORS[i%COLORS.length],
  aspect: [4/3, 3/4, 1, 16/9][i%4],
}))

function PhotoPlaceholder({ photo, onClick }) {
  return (
    <div onClick={onClick} className={\`\${photo.color} rounded-xl cursor-pointer hover:opacity-80 hover:scale-[1.02] transition-all duration-200 overflow-hidden flex items-center justify-center relative group\`}
      style={{aspectRatio: photo.aspect || 1}}>
      {photo.src
        ? <img src={photo.src} alt={photo.title} className="w-full h-full object-cover"/>
        : <ImageIcon size={32} className="text-white/60"/>
      }
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-end p-2">
        <span className="text-xs text-white/0 group-hover:text-white/90 font-medium transition">{photo.album}</span>
      </div>
    </div>
  )
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('club_gallery_photos')
    return saved ? JSON.parse(saved) : MOCK_PHOTOS
  })
  const [filter, setFilter] = useState('Tous')
  const [lightbox, setLightbox] = useState(null) // index
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  useEffect(() => { localStorage.setItem('club_gallery_photos', JSON.stringify(photos)) }, [photos])

  const filtered = filter === 'Tous' ? photos : photos.filter(p => p.album === filter)
  const counts = ALBUMS.slice(1).reduce((acc,a) => ({ ...acc, [a]: photos.filter(p=>p.album===a).length }), {})

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => {
        setPhotos(prev => [...prev, {
          id: Date.now() + Math.random(),
          album: filter === 'Tous' ? 'Événements' : filter,
          title: file.name,
          src: e.target.result,
          color: COLORS[prev.length % COLORS.length],
          aspect: 4/3,
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [filter])

  function nav(dir) {
    setLightbox(prev => {
      const next = prev + dir
      return next < 0 ? filtered.length - 1 : next >= filtered.length ? 0 : next
    })
  }

  useEffect(() => {
    function onKey(e) {
      if (lightbox === null) return
      if (e.key === 'ArrowLeft') nav(-1)
      if (e.key === 'ArrowRight') nav(1)
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, filtered.length])

  return (
    <div className="space-y-4">
      {/* Filtres + upload */}
      <div className="flex items-center gap-2 flex-wrap">
        {ALBUMS.map(a => (
          <button key={a} onClick={()=>setFilter(a)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-medium border transition \${filter===a ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}\`}>
            {a}{a !== 'Tous' && counts[a] ? \` (\${counts[a]})\` : ''}
          </button>
        ))}
        <button onClick={()=>fileRef.current?.click()} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-xl hover:bg-blue-700 transition">
          <Upload size={13}/> Ajouter
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e=>handleFiles(e.target.files)}/>
      </div>

      {/* Zone drag & drop */}
      <div onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={onDrop}
        className={\`border-2 border-dashed rounded-2xl p-4 text-center transition \${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}\`}>
        <p className="text-sm text-gray-400">Glisser-déposer des photos ici</p>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-300">
          <FolderOpen size={40} className="mx-auto mb-2"/>
          <p className="text-sm">Aucune photo</p>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((photo, idx) => (
            <div key={photo.id} className="break-inside-avoid">
              <PhotoPlaceholder photo={photo} onClick={()=>setLightbox(idx)}/>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={()=>setLightbox(null)}>
          <button onClick={e=>{e.stopPropagation();nav(-1)}} className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition"><ChevronLeft size={28}/></button>
          <button onClick={e=>{e.stopPropagation();nav(1)}}  className="absolute right-4 p-2 text-white hover:bg-white/10 rounded-full transition"><ChevronRight size={28}/></button>
          <button onClick={()=>setLightbox(null)} className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition"><X size={22}/></button>
          <div className="max-w-2xl w-full mx-8" onClick={e=>e.stopPropagation()}>
            <div className={\`\${filtered[lightbox].color} rounded-2xl flex items-center justify-center\`} style={{aspectRatio: filtered[lightbox].aspect || 1}}>
              {filtered[lightbox].src
                ? <img src={filtered[lightbox].src} alt="" className="w-full h-full object-cover rounded-2xl"/>
                : <ImageIcon size={64} className="text-white/50"/>
              }
            </div>
            <div className="text-center mt-3">
              <p className="text-white font-medium">{filtered[lightbox].title}</p>
              <p className="text-white/50 text-sm">{filtered[lightbox].album} · {lightbox+1}/{filtered.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}`,
  },
  {
    id: 'p2-player-stats-card',
    priority: 'P2',
    title: 'Carte statistiques joueur',
    subtitle: 'Radar, buts, passes, note de forme',
    icon: User,
    tags: ['joueur', 'statistiques', 'performance'],
    prompt: `Crée un composant React PlayerStatsCard pour app club sportif.
Card profil joueur avec photo (initiales), nom, poste, numéro.
Stats visuelles : buts, passes décisives, matchs joués, minutes, cartons, note globale /10.
Radar chart SVG (6 axes : vitesse, technique, physique, mental, défense, attaque).
Badge "Forme" (flamme si 3 buts récents). Tailwind CSS, données mock, propre API.`,
    code: `import { useState } from 'react'
import { Flame, Shield, Star } from 'lucide-react'

// ─── Données mock joueur ───
const DEFAULT_PLAYER = {
  name: 'Lucas Martin',
  number: 10,
  position: 'Attaquant',
  age: 22,
  stats: { goals: 14, assists: 7, matches: 21, minutes: 1742, yellowCards: 3, redCards: 0, rating: 7.8 },
  radar: { vitesse: 85, technique: 78, physique: 70, mental: 82, défense: 45, attaque: 90 },
  hotStreak: true, // 3+ buts récents
  recentForm: [8.5, 7.0, 8.8, 6.5, 9.0], // notes 5 derniers matchs
}

// ─── Radar SVG ───
function RadarChart({ axes, size = 180 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 24
  const keys = Object.keys(axes)
  const n = keys.length
  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2
  const pt = (i, val) => {
    const a = angle(i), v = (val / 100) * r
    return [cx + v * Math.cos(a), cy + v * Math.sin(a)]
  }
  const gridLevels = [0.25, 0.5, 0.75, 1]
  return (
    <svg width={size} height={size}>
      {/* Grilles */}
      {gridLevels.map(lvl =>
        <polygon key={lvl} points={keys.map((_,i)=>pt(i,lvl*100).join(',')).join(' ')}
          fill="none" stroke="#e5e7eb" strokeWidth="1"/>
      )}
      {/* Axes */}
      {keys.map((_,i) => {
        const [x,y] = pt(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1"/>
      })}
      {/* Données */}
      <polygon points={keys.map((_,i)=>pt(i,axes[keys[i]]).join(',')).join(' ')}
        fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="2"/>
      {/* Labels */}
      {keys.map((k,i) => {
        const [x,y] = pt(i, 118)
        return <text key={k} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#6b7280" fontFamily="sans-serif">{k.charAt(0).toUpperCase()+k.slice(1)}</text>
      })}
      {/* Points */}
      {keys.map((_,i) => {
        const [x,y] = pt(i, axes[keys[i]])
        return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6"/>
      })}
    </svg>
  )
}

// ─── Barre de forme ───
function FormBar({ notes }) {
  const colors = { ok: 'bg-green-400', mid: 'bg-amber-400', bad: 'bg-red-400' }
  return (
    <div className="flex items-center gap-1">
      {notes.map((n,i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className={\`h-8 w-full rounded \${n>=8?colors.ok:n>=6.5?colors.mid:colors.bad} flex items-end justify-center pb-0.5\`}
            style={{height: \`\${(n/10)*32}px\`}}/>
          <span className="text-[10px] text-gray-400">{n.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PlayerStatsCard({ player = DEFAULT_PLAYER }) {
  const [tab, setTab] = useState('stats')
  const s = player.stats
  const ratingColor = s.rating >= 8 ? 'text-green-600' : s.rating >= 6.5 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm max-w-sm w-full">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white relative">
        {player.hotStreak && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-orange-500 rounded-full px-2 py-0.5 text-xs font-bold">
            <Flame size={11}/> En forme
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
            {player.name.split(' ').map(n=>n[0]).join('')}
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">{player.name}</div>
            <div className="text-blue-200 text-sm">{player.position} · #{player.number}</div>
            <div className="text-blue-200 text-xs mt-0.5">{player.age} ans</div>
          </div>
        </div>
        {/* Note globale */}
        <div className="absolute bottom-4 right-5 text-right">
          <div className="text-3xl font-black">{s.rating}</div>
          <div className="text-blue-200 text-xs">Note</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {[{k:'stats',l:'Statistiques'},{k:'radar',l:'Radar'},{k:'forme',l:'Forme'}].map(({k,l}) => (
          <button key={k} onClick={()=>setTab(k)}
            className={\`flex-1 py-2.5 text-xs font-medium transition \${tab===k ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'}\`}>{l}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {tab === 'stats' && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {v:s.goals,    l:'Buts',     c:'text-blue-600'},
              {v:s.assists,  l:'Passes',   c:'text-purple-600'},
              {v:s.matches,  l:'Matchs',   c:'text-gray-700'},
              {v:s.minutes,  l:'Minutes',  c:'text-gray-700'},
              {v:s.yellowCards, l:'Jaunes', c:'text-amber-500'},
              {v:s.redCards, l:'Rouges',   c:'text-red-500'},
            ].map(({v,l,c}) => (
              <div key={l} className="text-center bg-gray-50 rounded-xl py-3">
                <div className={\`text-xl font-bold \${c}\`}>{v}</div>
                <div className="text-xs text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        )}
        {tab === 'radar' && (
          <div className="flex justify-center py-2">
            <RadarChart axes={player.radar}/>
          </div>
        )}
        {tab === 'forme' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 text-center">5 derniers matchs</p>
            <FormBar notes={player.recentForm}/>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mt-2">
              <Star size={12} className="text-amber-400 fill-amber-400"/>
              Moyenne : {(player.recentForm.reduce((a,b)=>a+b,0)/player.recentForm.length).toFixed(2)}/10
            </div>
          </div>
        )}
      </div>
    </div>
  )
}`,
  },

  // ══════ P3 - BONUS ══════
  {
    id: 'p3-dark-mode',
    priority: 'P3',
    title: 'Mode sombre global',
    subtitle: 'Toggle dark/light avec persistance',
    icon: Moon,
    tags: ['UX', 'accessibilité', 'thème'],
    prompt: `Crée un composant React DarkModeProvider + useDarkMode hook pour app React/Tailwind.
Context qui applique la classe "dark" sur <html> et persiste le choix dans localStorage.
Composant DarkModeToggle (switch animé soleil/lune).
S'intègre dans un layout via wrapping Context. Compatible Tailwind dark: prefix.
Inclure exemple d'utilisation avec quelques éléments dark-styled.`,
    code: `import { createContext, useContext, useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

// ─── Context ───
const DarkModeContext = createContext({ dark: false, toggle: () => {} })

export function DarkModeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('club_dark_mode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('club_dark_mode', String(dark))
  }, [dark])

  return (
    <DarkModeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export const useDarkMode = () => useContext(DarkModeContext)

// ─── Toggle animé ───
export function DarkModeToggle() {
  const { dark, toggle } = useDarkMode()
  return (
    <button onClick={toggle} aria-label="Toggle dark mode"
      className={\`relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 \${dark ? 'bg-blue-600' : 'bg-gray-200'}\`}>
      <span className={\`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300 \${dark ? 'translate-x-7' : 'translate-x-0'}\`}>
        {dark ? <Moon size={11} className="text-blue-600"/> : <Sun size={11} className="text-amber-500"/>}
      </span>
    </button>
  )
}

// ─── Démo standalone (sans context externe) ───
function DemoCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm transition-colors duration-300">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">ClubManager</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Gestion de votre club sportif</p>
      <div className="grid grid-cols-2 gap-3">
        {['Membres','Matchs','Documents','Finances'].map(item => (
          <div key={item} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DarkModeDemo() {
  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 p-6">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Mode sombre</span>
            <DarkModeToggle/>
          </div>
          <DemoCard/>
        </div>
      </div>
    </DarkModeProvider>
  )
}

/*
 * INTÉGRATION dans App.jsx :
 *
 * import { DarkModeProvider } from './components/DarkModeProvider'
 * import { DarkModeToggle }   from './components/DarkModeProvider'
 *
 * export default function App() {
 *   return (
 *     <DarkModeProvider>
 *       <AuthProvider>
 *         <BrowserRouter>
 *           <AppRoutes />
 *         </BrowserRouter>
 *       </AuthProvider>
 *     </DarkModeProvider>
 *   )
 * }
 *
 * // Dans AppLayout.jsx, ajouter dans la navbar :
 * <DarkModeToggle />
 */`,
  },
  {
    id: 'p3-club-rankings',
    priority: 'P3',
    title: 'Classement du club',
    subtitle: 'Table de ligue interactive avec historique',
    icon: TrendingUp,
    tags: ['classement', 'ligue', 'résultats'],
    prompt: `Crée un composant React ClubRankings pour app club sportif.
Tableau de classement de championnat : rang, club, J/G/N/P/BP/BC/Pts.
Surligner la ligne de l'équipe active. Flèches de progression (rang vs semaine dernière).
Filtre par catégorie (U18, Seniors...). Clic sur équipe = mini-popup historique 5 matchs (V/N/D pastilles).
Données mock réalistes. Tailwind CSS, localStorage pour sauvegarder équipe préférée.`,
    code: `import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react'

const CATEGORIES = ['Seniors', 'U18', 'U15']

const MOCK_RANKINGS = {
  Seniors: [
    { id:1,  name:'FC Montpellier',  rank:1,  prevRank:2,  j:20, g:14, n:4, p:2,  bp:42, bc:15, pts:46, form:['W','W','D','W','W'] },
    { id:2,  name:'AS Monaco FC',    rank:2,  prevRank:1,  j:20, g:13, n:4, p:3,  bp:38, bc:18, pts:43, form:['W','L','W','W','D'] },
    { id:3,  name:'Olympique Sud',   rank:3,  prevRank:3,  j:20, g:12, n:5, p:3,  bp:35, bc:20, pts:41, form:['D','W','W','D','W'] },
    { id:4,  name:'SC Vivarais',     rank:4,  prevRank:6,  j:20, g:11, n:4, p:5,  bp:30, bc:22, pts:37, form:['W','W','L','W','D'] },
    { id:5,  name:'FC Garonne ★',    rank:5,  prevRank:4,  j:20, g:10, n:5, p:5,  bp:28, bc:24, pts:35, form:['D','W','D','L','W'], isOurs:true },
    { id:6,  name:'Union Cévenole',  rank:6,  prevRank:5,  j:20, g:9,  n:6, p:5,  bp:27, bc:23, pts:33, form:['L','D','W','W','D'] },
    { id:7,  name:'Stade Languedoc', rank:7,  prevRank:7,  j:20, g:8,  n:5, p:7,  bp:25, bc:28, pts:29, form:['W','L','L','D','W'] },
    { id:8,  name:'AS Ventoux',      rank:8,  prevRank:9,  j:20, g:7,  n:5, p:8,  bp:22, bc:30, pts:26, form:['D','W','L','L','D'] },
    { id:9,  name:'FC Ardèche',      rank:9,  prevRank:8,  j:20, g:6,  n:6, p:8,  bp:20, bc:32, pts:24, form:['L','D','L','W','L'] },
    { id:10, name:'SC Gévaudan',     rank:10, prevRank:10, j:20, g:2,  n:3, p:15, bp:12, bc:48, pts:9,  form:['L','L','L','L','D'] },
  ],
  U18: [
    { id:11, name:'FC Garonne U18 ★', rank:1, prevRank:1, j:18, g:13, n:3, p:2, bp:40, bc:14, pts:42, form:['W','W','W','D','W'], isOurs:true },
    { id:12, name:'AS Montagne U18',  rank:2, prevRank:2, j:18, g:11, n:4, p:3, bp:33, bc:17, pts:37, form:['W','D','W','W','L'] },
    { id:13, name:'FC Delta U18',     rank:3, prevRank:4, j:18, g:10, n:3, p:5, bp:28, bc:20, pts:33, form:['W','W','L','W','D'] },
    { id:14, name:'SC Plaine U18',    rank:4, prevRank:3, j:18, g:8,  n:5, p:5, bp:24, bc:22, pts:29, form:['D','L','W','D','W'] },
    { id:15, name:'US Rivière U18',   rank:5, prevRank:5, j:18, g:4,  n:4, p:10,bp:18, bc:35, pts:16, form:['L','L','D','L','W'] },
  ],
  U15: [
    { id:21, name:'FC Garonne U15 ★', rank:1, prevRank:2, j:16, g:12, n:2, p:2, bp:38, bc:10, pts:38, form:['W','W','W','W','D'], isOurs:true },
    { id:22, name:'AS Soleil U15',    rank:2, prevRank:1, j:16, g:11, n:3, p:2, bp:34, bc:12, pts:36, form:['W','D','W','L','W'] },
    { id:23, name:'FC Nord U15',      rank:3, prevRank:3, j:16, g:8,  n:4, p:4, bp:25, bc:18, pts:28, form:['D','W','L','W','D'] },
  ],
}

const FORM_CONFIG = { W:{label:'V',bg:'bg-green-500'}, D:{label:'N',bg:'bg-gray-400'}, L:{label:'D',bg:'bg-red-500'} }

function FormPill({ result }) {
  const cfg = FORM_CONFIG[result]
  return <span className={\`w-5 h-5 rounded-full \${cfg.bg} text-white text-[9px] font-bold flex items-center justify-center\`}>{cfg.label}</span>
}

function RankDelta({ rank, prevRank }) {
  const d = prevRank - rank
  if (d > 0) return <span className="flex items-center text-green-500 text-xs"><TrendingUp size={11}/>{d}</span>
  if (d < 0) return <span className="flex items-center text-red-500 text-xs"><TrendingDown size={11}/>{Math.abs(d)}</span>
  return <Minus size={11} className="text-gray-300"/>
}

export default function ClubRankings() {
  const [category, setCategory] = useState('Seniors')
  const [popup, setPopup] = useState(null)
  const teams = MOCK_RANKINGS[category]

  return (
    <div className="space-y-4 relative">
      {/* Filtres */}
      <div className="flex gap-2">
        {CATEGORIES.map(c => (
          <button key={c} onClick={()=>setCategory(c)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-medium border transition \${category===c ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}\`}>{c}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="w-8 px-3 py-2.5 text-left text-xs font-medium text-gray-400">#</th>
              <th className="px-3 py-2.5 text-left text-xs font-medium text-gray-400">Club</th>
              <th className="px-2 py-2.5 text-center text-xs font-medium text-gray-400 hidden sm:table-cell">J</th>
              <th className="px-2 py-2.5 text-center text-xs font-medium text-gray-400 hidden sm:table-cell">G</th>
              <th className="px-2 py-2.5 text-center text-xs font-medium text-gray-400 hidden sm:table-cell">N</th>
              <th className="px-2 py-2.5 text-center text-xs font-medium text-gray-400 hidden sm:table-cell">P</th>
              <th className="px-2 py-2.5 text-center text-xs font-medium text-gray-400 hidden md:table-cell">BP</th>
              <th className="px-2 py-2.5 text-center text-xs font-medium text-gray-400 hidden md:table-cell">BC</th>
              <th className="px-3 py-2.5 text-center text-xs font-bold text-gray-600">Pts</th>
              <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-400">Forme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {teams.map(team => (
              <tr key={team.id} onClick={()=>setPopup(popup?.id===team.id?null:team)}
                className={\`cursor-pointer transition \${team.isOurs ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'}\`}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-700 w-4 text-center">{team.rank}</span>
                    <RankDelta rank={team.rank} prevRank={team.prevRank}/>
                  </div>
                </td>
                <td className={\`px-3 py-2.5 font-medium \${team.isOurs ? 'text-blue-700' : 'text-gray-800'}\`}>{team.name}</td>
                <td className="px-2 py-2.5 text-center text-gray-500 hidden sm:table-cell">{team.j}</td>
                <td className="px-2 py-2.5 text-center text-green-600 hidden sm:table-cell">{team.g}</td>
                <td className="px-2 py-2.5 text-center text-gray-500 hidden sm:table-cell">{team.n}</td>
                <td className="px-2 py-2.5 text-center text-red-500 hidden sm:table-cell">{team.p}</td>
                <td className="px-2 py-2.5 text-center text-gray-500 hidden md:table-cell">{team.bp}</td>
                <td className="px-2 py-2.5 text-center text-gray-500 hidden md:table-cell">{team.bc}</td>
                <td className="px-3 py-2.5 text-center font-bold text-gray-900">{team.pts}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-0.5 justify-center">
                    {team.form.map((r,i) => <FormPill key={i} result={r}/>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup équipe */}
      {popup && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 z-10" style={{top:'100%'}}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-gray-900 text-sm">{popup.name}</h4>
            <button onClick={()=>setPopup(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={14}/></button>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between"><span>Victoires</span><span className="font-medium text-green-600">{popup.g}</span></div>
            <div className="flex justify-between"><span>Nuls</span><span className="font-medium">{popup.n}</span></div>
            <div className="flex justify-between"><span>Défaites</span><span className="font-medium text-red-500">{popup.p}</span></div>
            <div className="flex justify-between"><span>Diff. buts</span><span className="font-medium">{popup.bp-popup.bc>0?'+':''}{popup.bp-popup.bc}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">5 derniers matchs</p>
            <div className="flex gap-1">{popup.form.map((r,i)=><FormPill key={i} result={r}/>)}</div>
          </div>
        </div>
      )}
    </div>
  )
}`,
  },
  {
    id: 'p3-trophy-system',
    priority: 'P3',
    title: 'Système de trophées joueurs',
    subtitle: 'Achievements débloqués automatiquement',
    icon: Award,
    tags: ['gamification', 'trophées', 'motivation'],
    prompt: `Crée un composant React TrophySystem pour app club sportif.
Grille de trophées (achievements) pour un joueur : verrouillés/débloqués.
Catégories : Buts, Présence, Équipe, Saison. Chaque trophée a nom, description, icône émoji, condition.
Animation confetti ou glow au déblocage. Barre progression globale.
Calcul automatique depuis stats joueur. Tailwind CSS, mock data, localStorage pour état déblocage.`,
    code: `import { useState, useEffect } from 'react'
import { Lock, Star, Zap, Users, Calendar } from 'lucide-react'

// ─── Définition des trophées ───
const TROPHIES = [
  // Buts
  { id:'first_goal',   cat:'Buts',     emoji:'⚽', name:'Premier but',        desc:'Marquer son premier but',         condition: s => s.goals >= 1 },
  { id:'hat_trick',    cat:'Buts',     emoji:'🎩', name:'Hat-trick',           desc:'3 buts en un seul match',         condition: s => s.bestMatch >= 3 },
  { id:'top_scorer',   cat:'Buts',     emoji:'🥇', name:'Meilleur buteur',     desc:'10 buts sur la saison',           condition: s => s.goals >= 10 },
  { id:'sniper',       cat:'Buts',     emoji:'🎯', name:'Sniper',              desc:'15 buts sur la saison',           condition: s => s.goals >= 15 },
  // Présence
  { id:'faithful',     cat:'Présence', emoji:'📅', name:'Fidèle',              desc:'Présent à 10 entraînements',      condition: s => s.trainings >= 10 },
  { id:'ironman',      cat:'Présence', emoji:'🦾', name:'Iron Man',            desc:'Présent à 20 entraînements',      condition: s => s.trainings >= 20 },
  { id:'no_absence',   cat:'Présence', emoji:'💯', name:'Zéro absence',        desc:'Aucune absence sur 1 mois',       condition: s => s.consecutiveTrainings >= 8 },
  // Équipe
  { id:'team_player',  cat:'Équipe',   emoji:'🤝', name:'Joueur d\'équipe',    desc:'5 passes décisives',              condition: s => s.assists >= 5 },
  { id:'leader',       cat:'Équipe',   emoji:'🏆', name:'Leader',              desc:'Capitaine sur 3 matchs',          condition: s => s.captainGames >= 3 },
  { id:'veteran',      cat:'Équipe',   emoji:'🎖️', name:'Vétéran',            desc:'20 matchs joués',                 condition: s => s.matches >= 20 },
  // Saison
  { id:'season_start', cat:'Saison',   emoji:'🌟', name:'Début de saison',     desc:'Premier match de la saison',      condition: s => s.matches >= 1 },
  { id:'mvp',          cat:'Saison',   emoji:'👑', name:'MVP',                 desc:'Note moyenne ≥ 8/10',             condition: s => s.avgRating >= 8 },
]

// ─── Stats joueur mock ───
const PLAYER_STATS = {
  goals: 14, assists: 7, matches: 21, trainings: 22,
  bestMatch: 3, captainGames: 4, consecutiveTrainings: 10, avgRating: 7.8,
}

const CAT_ICONS = { Buts: '⚽', Présence: '📅', Équipe: '🤝', Saison: '🌟' }
const CATS = ['Tous', 'Buts', 'Présence', 'Équipe', 'Saison']

function TrophyCard({ trophy, unlocked, isNew }) {
  return (
    <div className={\`relative rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all duration-500 \${
      unlocked
        ? \`bg-gradient-to-b from-amber-50 to-yellow-50 border-amber-200 \${isNew ? 'shadow-lg shadow-amber-200 scale-105' : 'shadow-sm'}\`
        : 'bg-gray-50 border-gray-100 opacity-50 grayscale'
    }\`}>
      {isNew && <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping"/>}
      <div className={\`text-3xl \${unlocked ? '' : 'opacity-30'}\`}>{trophy.emoji}</div>
      {!unlocked && <Lock size={14} className="absolute top-2 right-2 text-gray-400"/>}
      {unlocked && <Star size={10} className="absolute top-2 right-2 text-amber-400 fill-amber-400"/>}
      <div>
        <div className={\`text-xs font-bold \${unlocked ? 'text-gray-800' : 'text-gray-400'}\`}>{trophy.name}</div>
        <div className="text-[10px] text-gray-400 mt-0.5 leading-tight">{trophy.desc}</div>
      </div>
    </div>
  )
}

export default function TrophySystem({ stats = PLAYER_STATS }) {
  const [filter, setFilter] = useState('Tous')
  const [newlyUnlocked, setNewlyUnlocked] = useState(new Set())

  // Calculer les trophées débloqués
  const unlocked = new Set(TROPHIES.filter(t => t.condition(stats)).map(t => t.id))

  useEffect(() => {
    // Détecter les nouveaux déblocages
    const prev = JSON.parse(localStorage.getItem('club_trophies_unlocked') || '[]')
    const prevSet = new Set(prev)
    const newOnes = [...unlocked].filter(id => !prevSet.has(id))
    if (newOnes.length > 0) {
      setNewlyUnlocked(new Set(newOnes))
      localStorage.setItem('club_trophies_unlocked', JSON.stringify([...unlocked]))
      setTimeout(() => setNewlyUnlocked(new Set()), 3000)
    } else {
      localStorage.setItem('club_trophies_unlocked', JSON.stringify([...unlocked]))
    }
  }, [])

  const filtered = filter === 'Tous' ? TROPHIES : TROPHIES.filter(t => t.cat === filter)
  const total = TROPHIES.length
  const count = unlocked.size
  const pct = Math.round((count / total) * 100)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Trophées</h2>
          <p className="text-sm text-gray-500">{count}/{total} débloqués</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-amber-500">{pct}%</div>
          <div className="text-xs text-gray-400">complété</div>
        </div>
      </div>

      {/* Barre progression */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-700" style={{width:\`\${pct}%\`}}/>
      </div>

      {/* Filtres catégories */}
      <div className="flex gap-2 flex-wrap">
        {CATS.map(c => (
          <button key={c} onClick={()=>setFilter(c)}
            className={\`px-3 py-1.5 rounded-xl text-xs font-medium border transition \${filter===c ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}\`}>
            {c !== 'Tous' && CAT_ICONS[c]}{' '}{c}
            {c !== 'Tous' && <span className="ml-1 opacity-60">({TROPHIES.filter(t=>t.cat===c&&unlocked.has(t.id)).length}/{TROPHIES.filter(t=>t.cat===c).length})</span>}
          </button>
        ))}
      </div>

      {/* Grille trophées */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map(trophy => (
          <TrophyCard key={trophy.id} trophy={trophy} unlocked={unlocked.has(trophy.id)} isNew={newlyUnlocked.has(trophy.id)}/>
        ))}
      </div>

      {/* Badge récapitulatif */}
      {count === total && (
        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-4 text-center text-white">
          <div className="text-2xl mb-1">👑</div>
          <div className="font-bold">Collection complète !</div>
          <div className="text-sm opacity-80">Tous les trophées débloqués</div>
        </div>
      )}
    </div>
  )
}`,
  },
]

// ─────────────────────────────────────────────────────────────
// Composant principal : ImprovementLauncher
// ─────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  P1: { label: 'Critique', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200' },
  P2: { label: 'Important', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
  P3: { label: 'Bonus', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
}

function CopyButton({ text, label = 'Copier' }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${copied ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}>
      {copied ? <><Check size={12}/> Copié !</> : <><Copy size={12}/> {label}</>}
    </button>
  )
}

function ImprovementCard({ imp, isLaunched, onLaunch }) {
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState('code') // 'prompt' | 'code'
  const cfg = PRIORITY_CONFIG[imp.priority]
  const Icon = imp.icon

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${expanded ? cfg.border + ' shadow-md' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'} bg-white`}>
      {/* En-tête card */}
      <div className="p-4 cursor-pointer" onClick={() => { setExpanded(e => !e); if (!expanded) onLaunch(imp.id) }}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${cfg.bg} shrink-0`}>
            <Icon size={18} className={cfg.color}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${cfg.badge}`}>{imp.priority}</span>
              {isLaunched && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1"><Check size={9}/> Lancé</span>}
            </div>
            <h3 className="font-bold text-gray-900 text-sm mt-1">{imp.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{imp.subtitle}</p>
            <div className="flex gap-1 mt-2 flex-wrap">
              {imp.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md">{t}</span>)}
            </div>
          </div>
          <div className="shrink-0 text-gray-400">
            {expanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </div>
        </div>
      </div>

      {/* Contenu expandé */}
      {expanded && (
        <div className="border-t border-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            <button onClick={() => setTab('prompt')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition ${tab === 'prompt' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Play size={12}/> Prompt
            </button>
            <button onClick={() => setTab('code')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition ${tab === 'code' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Code2 size={12}/> Code complet
            </button>
          </div>

          {/* Contenu tab */}
          <div className="p-4">
            {tab === 'prompt' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Prompt Claude</span>
                  <CopyButton text={imp.prompt} label="Copier le prompt"/>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs text-green-400 leading-relaxed whitespace-pre-wrap">
                  {imp.prompt}
                </div>
                <p className="text-xs text-gray-400 italic">Colle ce prompt dans Claude pour régénérer ou adapter le composant.</p>
              </div>
            )}
            {tab === 'code' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Composant React prêt</span>
                  <div className="flex gap-2">
                    <CopyButton text={imp.code} label="Copier le code"/>
                  </div>
                </div>
                <div className="bg-gray-950 rounded-xl p-4 overflow-x-auto max-h-[480px] overflow-y-auto">
                  <pre className="font-mono text-[11px] text-gray-300 leading-relaxed">{imp.code}</pre>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <Rocket size={13} className="text-blue-500 shrink-0"/>
                  <span>Copie dans <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">src/components/</code> et importe dans la page de ton choix.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────
export default function ImprovementLauncherPage() {
  const [launched, setLaunched] = useState(() => {
    const saved = localStorage.getItem('improvement_launcher_launched')
    return new Set(saved ? JSON.parse(saved) : [])
  })
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('Tous')

  function onLaunch(id) {
    setLaunched(prev => {
      const next = new Set([...prev, id])
      localStorage.setItem('improvement_launcher_launched', JSON.stringify([...next]))
      return next
    })
  }

  const filtered = IMPROVEMENTS.filter(imp => {
    const matchPriority = priorityFilter === 'Tous' || imp.priority === priorityFilter
    const matchSearch = !search || imp.title.toLowerCase().includes(search.toLowerCase()) || imp.tags.some(t => t.includes(search.toLowerCase()))
    return matchPriority && matchSearch
  })

  const counts = { P1: 0, P2: 0, P3: 0 }
  IMPROVEMENTS.forEach(i => counts[i.priority]++)
  const launchedCount = launched.size

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/10 rounded-2xl"><Rocket size={22}/></div>
            <div>
              <h1 className="text-xl font-black">Improvement Launcher</h1>
              <p className="text-gray-400 text-sm">ClubManager · Améliorations prêtes à intégrer</p>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-xl font-bold">{IMPROVEMENTS.length}</div>
              <div className="text-xs text-gray-400">Total</div>
            </div>
            {['P1','P2','P3'].map(p => (
              <div key={p} className={`rounded-xl p-3 text-center bg-white/5`}>
                <div className={`text-xl font-bold ${PRIORITY_CONFIG[p].color}`}>{counts[p]}</div>
                <div className="text-xs text-gray-400">{p} · {PRIORITY_CONFIG[p].label}</div>
              </div>
            ))}
          </div>
          {/* Progression */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{launchedCount}/{IMPROVEMENTS.length} lancés</span>
              <span>{Math.round((launchedCount/IMPROVEMENTS.length)*100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-700"
                style={{width:`${(launchedCount/IMPROVEMENTS.length)*100}%`}}/>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une amélioration..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14}/></button>}
          </div>
          <div className="flex gap-2">
            {['Tous','P1','P2','P3'].map(p => (
              <button key={p} onClick={() => setPriorityFilter(p)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition ${priorityFilter === p
                  ? p === 'Tous' ? 'bg-gray-900 text-white border-gray-900' : `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} ${PRIORITY_CONFIG[p].border}`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Groupes par priorité */}
        {['P1','P2','P3'].map(priority => {
          const group = filtered.filter(i => i.priority === priority)
          if (group.length === 0) return null
          const cfg = PRIORITY_CONFIG[priority]
          return (
            <div key={priority} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`}/>
                <h2 className={`text-sm font-bold ${cfg.color}`}>{priority} — {cfg.label}</h2>
                <div className="flex-1 h-px bg-gray-100"/>
                <span className="text-xs text-gray-400">{group.filter(i => launched.has(i.id)).length}/{group.length}</span>
              </div>
              <div className="space-y-3">
                {group.map(imp => (
                  <ImprovementCard key={imp.id} imp={imp} isLaunched={launched.has(imp.id)} onLaunch={onLaunch}/>
                ))}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-300">
            <Search size={40} className="mx-auto mb-3 opacity-50"/>
            <p className="text-sm">Aucune amélioration trouvée</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-4 text-xs text-gray-300">
          <Zap size={12} className="inline mr-1"/>
          Clic sur une card → code prêt à copier-coller
        </div>
      </div>
    </div>
  )
}

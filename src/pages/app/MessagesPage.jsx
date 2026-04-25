import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CONVERSATIONS, getUserById, getFullName, getTeamById } from '../../data/mock'
import { Avatar, Badge } from '../../components/ui'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Send, Pin, Lock, MessageSquare, Search } from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────

const TYPE_CFG = {
  team_chat:     { label: 'Équipe',  variant: 'blue'   },
  coach_channel: { label: 'Coach',   variant: 'purple' },
  parent_chat:   { label: 'Parent',  variant: 'green'  },
}

const GROUPS = [
  { key: 'team',   label: 'Équipes', types: ['team_chat', 'coach_channel'] },
  { key: 'parent', label: 'Parents', types: ['parent_chat'] },
]

function ConvBadge({ type }) {
  const { label, variant } = TYPE_CFG[type] ?? { label: type, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

function formatTime(iso) {
  return format(parseISO(iso), 'HH:mm', { locale: fr })
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { currentUser } = useAuth()
  const isPlayer = currentUser.role === 'player'

  // Conversations accessibles (président voit tout, sinon participant)
  const accessible = CONVERSATIONS.filter(c =>
    currentUser.role === 'president' || c.participants.includes(currentUser.id)
  )

  const [activeId,    setActiveId]    = useState(accessible[0]?.id ?? null)
  const [search,      setSearch]      = useState('')
  // localMessages : messages envoyés dans la session courante, par convId
  const [localMsgs,   setLocalMsgs]   = useState({})
  const [inputs,      setInputs]      = useState({})
  const bottomRef = useRef(null)

  const conv = CONVERSATIONS.find(c => c.id === activeId)
  const isReadOnly = conv?.type === 'coach_channel' && isPlayer

  // Messages affichés = mock + locaux
  const messages = conv
    ? [...conv.messages, ...(localMsgs[conv.id] ?? [])]
    : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeId, localMsgs])

  function sendMessage() {
    const text = (inputs[activeId] ?? '').trim()
    if (!text || isReadOnly || !activeId) return
    setLocalMsgs(prev => ({
      ...prev,
      [activeId]: [
        ...(prev[activeId] ?? []),
        {
          id: `local-${Date.now()}`,
          senderId: currentUser.id,
          content: text,
          timestamp: new Date().toISOString(),
          readBy: [currentUser.id],
        },
      ],
    }))
    setInputs(prev => ({ ...prev, [activeId]: '' }))
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Filtrage sidebar par recherche
  const filtered = accessible.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-56px)] bg-surface-50 overflow-hidden">

      {/* ── Sidebar conversations ─────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-surface-200 flex flex-col flex-shrink-0">

        {/* Header sidebar */}
        <div className="px-4 py-4 border-b border-surface-200">
          <h1 className="font-display font-bold text-lg text-surface-900 mb-3">Messagerie</h1>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface-50 border border-surface-200 rounded-xl
                         text-sm placeholder-surface-400 focus:outline-none focus:ring-2
                         focus:ring-brand-300 focus:border-brand-400"
            />
          </div>
        </div>

        {/* Liste groupée */}
        <div className="flex-1 overflow-y-auto">
          {GROUPS.map(group => {
            const groupConvs = filtered.filter(c => group.types.includes(c.type))
            if (groupConvs.length === 0) return null
            return (
              <div key={group.key}>
                <div className="px-4 pt-4 pb-1">
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                </div>
                {groupConvs.map(c => {
                  const allMsgs  = [...c.messages, ...(localMsgs[c.id] ?? [])]
                  const lastMsg  = allMsgs.at(-1)
                  const sender   = lastMsg ? getUserById(lastMsg.senderId) : null
                  const unread   = c.messages.filter(m => !m.readBy.includes(currentUser.id)).length
                  const isActive = c.id === activeId

                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveId(c.id)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                                  border-l-2 ${
                        isActive
                          ? 'bg-brand-50 border-brand-600'
                          : 'border-transparent hover:bg-surface-50'
                      }`}
                    >
                      {/* Icône */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                                       ${isActive ? 'bg-brand-100' : 'bg-surface-100'}`}>
                        <MessageSquare size={16} className={isActive ? 'text-brand-600' : 'text-surface-500'} />
                      </div>

                      {/* Texte */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm font-semibold truncate ${
                            isActive ? 'text-brand-700' : 'text-surface-900'
                          }`}>
                            {c.name}
                          </p>
                          {lastMsg && (
                            <span className="text-xs text-surface-400 flex-shrink-0">
                              {formatTime(lastMsg.timestamp)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-0.5 gap-1">
                          <p className="text-xs text-surface-500 truncate flex-1">
                            {lastMsg
                              ? `${sender?.firstName ?? '?'} : ${lastMsg.content}`
                              : 'Aucun message'}
                          </p>
                          {unread > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white
                                             text-xs flex items-center justify-center font-medium">
                              {unread}
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <ConvBadge type={c.type} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <p className="text-sm text-surface-400 text-center py-10">Aucune conversation</p>
          )}
        </div>
      </aside>

      {/* ── Zone de chat ─────────────────────────────────────────────────── */}
      {conv ? (
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Header chat */}
          <div className="bg-white border-b border-surface-200 px-6 py-4 flex items-center
                          justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-semibold text-surface-900">{conv.name}</h2>
                <ConvBadge type={conv.type} />
                {isReadOnly && (
                  <Badge variant="gray">
                    <span className="flex items-center gap-1"><Lock size={10} /> Lecture seule</span>
                  </Badge>
                )}
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                {conv.participants.length} participant{conv.participants.length > 1 ? 's' : ''}
                {conv.teamId && ` · ${getTeamById(conv.teamId)?.name}`}
              </p>
            </div>

            {/* Avatars participants */}
            <div className="flex -space-x-1.5">
              {conv.participants.slice(0, 5).map(uid => {
                const u = getUserById(uid)
                return u ? (
                  <Avatar key={uid} user={u} size="sm" className="ring-2 ring-white" />
                ) : null
              })}
              {conv.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-surface-100 ring-2 ring-white
                                flex items-center justify-center text-xs text-surface-600 font-medium">
                  +{conv.participants.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Message épinglé */}
          {conv.pinnedMessage && (
            <div className="bg-violet-50 border-b border-violet-100 px-6 py-2.5
                            flex items-start gap-2 flex-shrink-0">
              <Pin size={13} className="text-violet-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-violet-700 mb-0.5">Message épinglé</p>
                <p className="text-xs text-violet-600 truncate">{conv.pinnedMessage.content}</p>
              </div>
              <span className="text-xs text-violet-400 flex-shrink-0">
                {format(parseISO(conv.pinnedMessage.timestamp), "d MMM · HH:mm", { locale: fr })}
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {messages.map(msg => {
              const sender = getUserById(msg.senderId)
              const isMe   = msg.senderId === currentUser.id
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar user={sender} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className={`max-w-sm flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2">
                      {!isMe && (
                        <span className="text-xs font-semibold text-surface-700">
                          {getFullName(sender)}
                        </span>
                      )}
                      <span className="text-xs text-surface-400">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-brand-600 text-white rounded-tr-sm'
                        : 'bg-white border border-surface-200 text-surface-800 rounded-tl-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Zone saisie */}
          <div className="bg-white border-t border-surface-200 px-6 py-4 flex-shrink-0">
            {isReadOnly ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-surface-400
                              bg-surface-50 border border-surface-200 rounded-xl">
                <Lock size={14} /> Canal coach — lecture seule
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <Avatar user={currentUser} size="sm" className="flex-shrink-0 mb-1" />
                <div className="flex-1 bg-surface-50 border border-surface-200 rounded-2xl px-4 py-2.5
                                focus-within:ring-2 focus-within:ring-brand-300
                                focus-within:border-brand-400 transition-all">
                  <textarea
                    rows={1}
                    value={inputs[activeId] ?? ''}
                    onChange={e => setInputs(prev => ({ ...prev, [activeId]: e.target.value }))}
                    onKeyDown={onKeyDown}
                    placeholder="Écrire un message… (Entrée pour envoyer)"
                    className="w-full bg-transparent text-sm text-surface-900 placeholder-surface-400
                               focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!(inputs[activeId] ?? '').trim()}
                  className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center
                             hover:bg-brand-700 transition-colors disabled:opacity-40
                             disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare size={40} className="mx-auto mb-3 text-surface-300" />
            <p className="text-sm text-surface-500">Sélectionnez une conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}

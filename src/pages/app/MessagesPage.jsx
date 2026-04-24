import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { CONVERSATIONS, getUserById, getFullName, getTeamById } from '../../data/mock'
import { Avatar, Badge } from '../../components/ui'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Send, Pin, Lock, MessageSquare } from 'lucide-react'

function ConvTypeLabel({ type }) {
  const cfg = {
    team_chat:    { label: 'Équipe',   variant: 'blue' },
    coach_channel:{ label: 'Coach',    variant: 'purple' },
    parent_chat:  { label: 'Parent',   variant: 'green' },
  }
  const { label, variant } = cfg[type] ?? { label: type, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}

export default function MessagesPage() {
  const { currentUser } = useAuth()
  const [selectedConvId, setSelectedConvId] = useState(CONVERSATIONS[0].id)
  const [draftMessages, setDraftMessages] = useState({})
  const [localMessages, setLocalMessages] = useState({})
  const bottomRef = useRef(null)

  const accessibleConvs = CONVERSATIONS.filter(c =>
    c.participants.includes(currentUser.id) ||
    ['president'].includes(currentUser.role)
  )

  const conv = CONVERSATIONS.find(c => c.id === selectedConvId)

  const isReadOnly =
    conv?.type === 'coach_channel' && currentUser.role === 'player'

  const allMessages = conv
    ? [...(conv.messages), ...(localMessages[conv.id] ?? [])]
    : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConvId, localMessages])

  function sendMessage() {
    const text = (draftMessages[selectedConvId] ?? '').trim()
    if (!text || isReadOnly) return

    setLocalMessages(prev => ({
      ...prev,
      [selectedConvId]: [
        ...(prev[selectedConvId] ?? []),
        {
          id: `local-${Date.now()}`,
          senderId: currentUser.id,
          content: text,
          timestamp: new Date().toISOString(),
          readBy: [currentUser.id],
        },
      ],
    }))
    setDraftMessages(prev => ({ ...prev, [selectedConvId]: '' }))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-surface-50">
      {/* Liste conversations */}
      <div className="w-72 bg-white border-r border-surface-200 flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-surface-200">
          <h1 className="font-display font-bold text-xl text-surface-900">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {accessibleConvs.length === 0 && (
            <p className="text-sm text-surface-400 text-center py-10">Aucune conversation</p>
          )}
          {accessibleConvs.map(c => {
            const lastMsg = [...c.messages, ...(localMessages[c.id] ?? [])].at(-1)
            const sender = lastMsg ? getUserById(lastMsg.senderId) : null
            const unread = c.messages.filter(m => !m.readBy.includes(currentUser.id)).length
            const isSelected = c.id === selectedConvId

            return (
              <button
                key={c.id}
                onClick={() => setSelectedConvId(c.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-surface-100 ${
                  isSelected ? 'bg-brand-50' : 'hover:bg-surface-50'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className={isSelected ? 'text-brand-600' : 'text-surface-500'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-700' : 'text-surface-900'}`}>
                      {c.name}
                    </p>
                    {lastMsg && (
                      <span className="text-xs text-surface-400 flex-shrink-0">
                        {format(parseISO(lastMsg.timestamp), 'HH:mm')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-surface-500 truncate flex-1">
                      {lastMsg ? `${getFullName(sender)?.split(' ')[0] ?? 'Inconnu'} : ${lastMsg.content}` : 'Aucun message'}
                    </p>
                    {unread > 0 && (
                      <span className="ml-1 flex-shrink-0 w-5 h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <ConvTypeLabel type={c.type} />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Zone de chat */}
      {conv ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-semibold text-surface-900">{conv.name}</h2>
                <ConvTypeLabel type={conv.type} />
                {isReadOnly && (
                  <Badge variant="gray" className="flex items-center gap-1">
                    <Lock size={10} /> Lecture seule
                  </Badge>
                )}
              </div>
              <p className="text-xs text-surface-500 mt-0.5">
                {conv.participants.length} participant{conv.participants.length > 1 ? 's' : ''}
                {conv.teamId && ` · ${getTeamById(conv.teamId)?.name}`}
              </p>
            </div>
            {/* Participants */}
            <div className="flex -space-x-1.5">
              {conv.participants.slice(0, 5).map(uid => {
                const u = getUserById(uid)
                return u ? <Avatar key={uid} user={u} size="sm" className="ring-2 ring-white" /> : null
              })}
              {conv.participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-surface-100 ring-2 ring-white flex items-center justify-center text-xs text-surface-600 font-medium">
                  +{conv.participants.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Message épinglé */}
          {conv.pinnedMessage && (
            <div className="bg-brand-50 border-b border-brand-100 px-6 py-2 flex items-start gap-2">
              <Pin size={13} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brand-700 mb-0.5">Message épinglé</p>
                <p className="text-xs text-brand-600 truncate">{conv.pinnedMessage.content}</p>
              </div>
              <span className="text-xs text-brand-400 flex-shrink-0">
                {format(parseISO(conv.pinnedMessage.timestamp), "d MMM · HH:mm", { locale: fr })}
              </span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-6 space-y-4">
            {allMessages.map(msg => {
              const sender = getUserById(msg.senderId)
              const isMe = msg.senderId === currentUser.id
              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar user={sender} size="sm" className="flex-shrink-0 mt-0.5" />
                  <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2">
                      {!isMe && (
                        <span className="text-xs font-semibold text-surface-700">{getFullName(sender)}</span>
                      )}
                      <span className="text-xs text-surface-400">
                        {format(parseISO(msg.timestamp), "HH:mm", { locale: fr })}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-brand-600 text-white rounded-tr-sm'
                          : 'bg-white border border-surface-200 text-surface-800 rounded-tl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Zone saisie */}
          <div className="bg-white border-t border-surface-200 px-6 py-4">
            {isReadOnly ? (
              <div className="flex items-center justify-center gap-2 py-2 text-sm text-surface-400">
                <Lock size={14} />
                Vous êtes en lecture seule dans ce canal
              </div>
            ) : (
              <div className="flex items-end gap-3">
                <Avatar user={currentUser} size="sm" className="flex-shrink-0 mb-1" />
                <div className="flex-1 bg-surface-50 border border-surface-200 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-300 focus-within:border-brand-400 transition-all">
                  <textarea
                    rows={1}
                    value={draftMessages[selectedConvId] ?? ''}
                    onChange={e => setDraftMessages(prev => ({ ...prev, [selectedConvId]: e.target.value }))}
                    onKeyDown={handleKeyDown}
                    placeholder="Écrire un message… (Entrée pour envoyer)"
                    className="w-full bg-transparent text-sm text-surface-900 placeholder-surface-400 focus:outline-none resize-none"
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!(draftMessages[selectedConvId] ?? '').trim()}
                  className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-surface-400">
          <div className="text-center">
            <MessageSquare size={40} className="mx-auto mb-2 text-surface-300" />
            <p className="text-sm">Sélectionnez une conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}

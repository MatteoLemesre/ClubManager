import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Send, Plus, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'

// ─── MessageBubble ─────────────────────────────────────────────────────────

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

function MessageBubble({ msg, isMe }) {
  const [showPicker,       setShowPicker]       = useState(false)
  const [selectedReaction, setSelectedReaction] = useState(null)

  const handleReaction = useCallback((emoji) => {
    setSelectedReaction(prev => prev === emoji ? null : emoji)
    setShowPicker(false)
  }, [])

  return (
    <div className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className="relative group">
        {/* Bulle */}
        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
          isMe
            ? 'bg-brand-600 text-white rounded-br-sm'
            : 'bg-surface-100 text-gray-800 rounded-bl-sm'
        }`}>
          {msg.content}
          <div className={`text-[10px] mt-1 ${isMe ? 'text-brand-200' : 'text-gray-400'}`}>
            {msg.sent_at ? format(new Date(msg.sent_at), "HH'h'mm", { locale: fr }) : ''}
          </div>
        </div>

        {/* Bouton réaction (hover) */}
        <button
          onClick={() => setShowPicker(p => !p)}
          className={`absolute -bottom-5 ${isMe ? 'right-1' : 'left-1'}
                      opacity-0 group-hover:opacity-100 transition-opacity
                      text-base hover:scale-125`}
          title="Réagir">
          😊
        </button>

        {/* Picker réactions */}
        {showPicker && (
          <div className={`absolute bottom-7 ${isMe ? 'right-0' : 'left-0'}
                           bg-white rounded-2xl shadow-lg px-2 py-1.5 flex gap-1
                           border border-surface-200 z-10`}>
            {REACTION_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`text-xl hover:scale-125 transition-transform rounded-lg p-1
                            ${selectedReaction === emoji ? 'bg-brand-50' : 'hover:bg-surface-50'}`}>
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Réaction choisie */}
        {selectedReaction && (
          <button
            onClick={() => setShowPicker(p => !p)}
            className={`absolute -bottom-2 ${isMe ? '-right-2' : '-left-2'}
                        text-base bg-white rounded-full w-6 h-6 flex items-center justify-center
                        border-2 border-brand-600 shadow-sm hover:scale-110 transition-transform`}>
            {selectedReaction}
          </button>
        )}
      </div>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [conversations,  setConversations]  = useState([])
  const [activeConvId,   setActiveConvId]   = useState(null)
  const [activeMessages, setActiveMessages] = useState([])
  const [newMessage,     setNewMessage]     = useState('')
  const [loading,        setLoading]        = useState(true)

  const [showSearch,    setShowSearch]    = useState(false)
  const [searchMembers, setSearchMembers] = useState('')
  const [members,       setMembers]       = useState([])
  const [mobileView,    setMobileView]    = useState('list') // 'list' | 'chat'

  const bottomRef = useRef(null)

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversation_members')
      .select(`
        conversation_id,
        can_write,
        conversations (
          id, type, name, created_at,
          messages (id, content, sent_at, sender_id)
        )
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { foreignTable: 'conversations', ascending: false })

    const convs = data?.map(d => ({
      ...d.conversations,
      can_write: d.can_write,
    })) ?? []
    setConversations(convs)
  }

  useEffect(() => {
    const init = async () => {
      await loadConversations()
      setLoading(false)
    }
    init()
  }, [])

  // Charger les membres du club
  useEffect(() => {
    if (!currentUser.current_club_id) return
    supabase
      .from('users')
      .select('id, first_name, last_name, role')
      .eq('current_club_id', currentUser.current_club_id)
      .neq('id', currentUser.id)
      .then(({ data }) => setMembers(data ?? []))
  }, [currentUser.current_club_id])

  const getRoleLabel = (user) => {
    const labels = {
      president: 'Président',
      coach:     'Coach',
      player:    'Joueur',
      community: 'Communauté',
      supporter: 'Communauté',
      parent:    'Parent',
    }
    return labels[user.role] || ''
  }

  // Démarrer une conversation depuis la navigation (ex: bouton Message sur fiche joueur)
  useEffect(() => {
    const { startConversationWith } = location.state || {}
    if (startConversationWith && members.length > 0) {
      const member = members.find(u => u.id === startConversationWith)
      if (member) {
        handleStartConversation(member)
        navigate(location.pathname, { replace: true, state: {} })
      }
    }
  }, [location.state, members])

  // Mettre à jour les messages affichés quand la conv active change
  useEffect(() => {
    if (!activeConvId) return
    const conv = conversations.find(c => c.id === activeConvId)
    setActiveMessages(conv?.messages ?? [])
  }, [activeConvId, conversations])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages])

  const filteredMembers = members.filter(m =>
    `${m.first_name} ${m.last_name}`
      .toLowerCase()
      .includes(searchMembers.toLowerCase())
  )

  const handleStartConversation = async (member) => {
    const { data: existing } = await supabase
      .from('conversation_members')
      .select('conversation_id, conversations(id, type)')
      .eq('user_id', currentUser.id)

    let convId = null
    for (const row of existing ?? []) {
      if (row.conversations?.type !== 'direct') continue
      const { data: mems } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', row.conversation_id)
      if (mems?.some(m => m.user_id === member.id)) {
        convId = row.conversation_id
        break
      }
    }

    if (!convId) {
      const { data: conv } = await supabase
        .from('conversations')
        .insert({
          club_id:    currentUser.current_club_id,
          type:       'direct',
          name:       `${member.first_name} ${member.last_name}`,
          created_by: currentUser.id,
        })
        .select().single()

      await supabase.from('conversation_members').insert([
        { conversation_id: conv.id, user_id: currentUser.id, can_write: true },
        { conversation_id: conv.id, user_id: member.id,      can_write: true },
      ])

      convId = conv.id
      await loadConversations()
    }

    setActiveConvId(convId)
    setMobileView('chat')
    setShowSearch(false)
    setSearchMembers('')
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConvId) return
    const content = newMessage.trim()
    setNewMessage('')

    const { data: msg } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConvId,
        sender_id:       currentUser.id,
        content:         content,
      })
      .select().single()

    if (msg) setActiveMessages(prev => [...prev, msg])
  }

  const activeConv = conversations.find(c => c.id === activeConvId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-56px-4rem)] md:h-[calc(100vh-56px)]">
        <div className="w-8 h-8 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-56px-4rem)] md:h-[calc(100vh-56px)] bg-surface-50 overflow-hidden">

      {/* ── Sidebar conversations ──────────────────────────────────────────── */}
      <aside className={`${mobileView === 'chat' ? 'hidden' : 'flex'} md:flex w-full md:w-72 bg-white border-r border-surface-200 flex-col flex-shrink-0`}>
        <div className="px-4 py-4 border-b border-surface-200 flex items-center justify-between">
          <h1 className="font-display font-bold text-lg text-gray-900">Messagerie</h1>
          <button
            onClick={() => setShowSearch(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700
                       text-white rounded-xl text-xs font-medium transition-colors"
          >
            <Plus size={13} /> Nouveau
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-4 gap-3">
              <div className="text-4xl">💬</div>
              <div className="font-semibold text-gray-700 text-sm text-center">
                Aucune conversation
              </div>
              <p className="text-xs text-gray-400 text-center">
                Recherchez un membre de votre club pour démarrer une discussion.
              </p>
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => { setActiveConvId(conv.id); setMobileView('chat') }}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                            border-l-2 ${
                  activeConvId === conv.id
                    ? 'bg-brand-50 border-brand-600'
                    : 'border-transparent hover:bg-surface-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                 flex-shrink-0 font-bold text-sm ${
                  activeConvId === conv.id ? 'bg-brand-100 text-brand-700' : 'bg-surface-100 text-surface-500'
                }`}>
                  {conv.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    activeConvId === conv.id ? 'text-brand-700' : 'text-gray-900'
                  }`}>
                    {conv.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {conv.messages?.at(-1)?.content ?? 'Aucun message'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Zone de chat ───────────────────────────────────────────────────── */}
      {activeConv ? (
        <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 flex-col overflow-hidden`}>
          <div className="bg-white border-b border-surface-200 px-4 md:px-6 py-3 md:py-4 flex-shrink-0 flex items-center gap-3">
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-1.5 rounded-xl hover:bg-surface-100 text-gray-500 flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="font-display font-semibold text-gray-900">{activeConv.name}</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
            {activeMessages.length === 0 && (
              <div className="text-center py-12 text-sm text-gray-400">
                Aucun message — soyez le premier !
              </div>
            )}
            {activeMessages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMe={msg.sender_id === currentUser.id}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="bg-white border-t border-surface-200 px-3 md:px-6 py-3 md:py-4 flex-shrink-0">
            <div className="flex items-end gap-3">
              <div className="flex-1 bg-surface-50 border border-surface-200 rounded-2xl
                              px-4 py-2.5 focus-within:ring-2 focus-within:ring-brand-300
                              focus-within:border-brand-400 transition-all">
                <textarea
                  rows={1}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Écrire un message… (Entrée pour envoyer)"
                  className="w-full bg-transparent text-sm text-gray-900
                             placeholder-gray-400 focus:outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!newMessage.trim()}
                className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center
                           justify-center hover:bg-brand-700 transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${mobileView === 'list' ? 'hidden' : 'flex'} md:flex flex-1 flex-col items-center justify-center gap-4`}>
          <div className="text-5xl">💬</div>
          <div className="font-semibold text-gray-700">Vos messages</div>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Sélectionnez une conversation ou recherchez un membre pour commencer.
          </p>
          <button
            onClick={() => setShowSearch(true)}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2
                       text-sm font-medium transition-colors"
          >
            Rechercher un membre
          </button>
        </div>
      )}

      {/* ── Modal recherche membre ─────────────────────────────────────────── */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col md:items-center md:justify-center md:p-4">
          <div className="bg-white w-full md:max-w-sm md:rounded-2xl shadow-xl flex-1 md:flex-none overflow-y-auto p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Nouvelle conversation</h3>
              <button
                onClick={() => { setShowSearch(false); setSearchMembers('') }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <input
              placeholder="Rechercher un membre..."
              value={searchMembers}
              onChange={e => setSearchMembers(e.target.value)}
              autoFocus
              className="w-full mb-3 bg-surface-50 border border-surface-200 rounded-xl
                         px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-4">
                  Aucun membre trouvé
                </div>
              ) : (
                filteredMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleStartConversation(m)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl
                               hover:bg-surface-50 text-left transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center
                                    justify-center text-brand-700 font-semibold text-sm flex-shrink-0">
                      {m.first_name[0]}{m.last_name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {m.first_name} {m.last_name}
                      </div>
                      {getRoleLabel(m) && (
                        <div className="text-xs text-gray-400">{getRoleLabel(m)}</div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

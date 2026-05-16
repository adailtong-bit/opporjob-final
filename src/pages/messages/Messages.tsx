import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Send,
  MessageSquare,
  Lock,
  Unlock,
  Star,
  ChevronLeft,
  Paperclip,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMessageStore } from '@/stores/useMessageStore'
import { useToast } from '@/hooks/use-toast'

const MOCK_PLATFORM_USERS = [
  {
    id: 'owner-1',
    name: 'Admin Tech Corp',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=owner-1',
    openChat: true,
  },
  {
    id: 'exec-1',
    name: 'João Freelancer',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-1',
    openChat: false,
  },
  {
    id: 'exec-pj-1',
    name: 'Soluções Rápidas Ltda',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=exec-pj-1',
    openChat: true,
  },
  {
    id: 'u-4',
    name: 'Maria Silva',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=maria',
    openChat: false,
  },
  {
    id: 'u-5',
    name: 'Carlos Santos',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=carlos',
    openChat: true,
  },
  {
    id: 'admin-1',
    name: 'Administrador do Sistema',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=admin',
    openChat: true,
  },
]

const MOCK_SUGGESTIONS = [
  {
    id: 'sug-1',
    name: 'Ana Engenheira',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=ana',
    skills: ['AutoCAD', 'Gestão de Projetos', 'BIM'],
    openChat: true,
  },
  {
    id: 'sug-2',
    name: 'Roberto Construtor',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=roberto',
    skills: ['Fundações', 'Alvenaria', 'Acabamento'],
    openChat: false,
  },
  {
    id: 'sug-3',
    name: 'Tech Solutions',
    avatar: 'https://img.usecurling.com/i?q=tech&shape=outline',
    skills: ['Automação', 'Elétrica', 'Segurança'],
    openChat: true,
  },
]

const StatusBadge = ({
  status,
  size = 'default',
}: {
  status?: 'analysis' | 'proposal' | 'contracted'
  size?: 'sm' | 'default'
}) => {
  const baseClasses = `pointer-events-none whitespace-nowrap ${size === 'sm' ? 'px-1.5 py-0 text-[10px] h-4 leading-4' : 'text-xs'}`
  switch (status) {
    case 'analysis':
      return (
        <Badge
          variant="secondary"
          className={`bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 ${baseClasses}`}
        >
          Em análise
        </Badge>
      )
    case 'proposal':
      return (
        <Badge
          variant="default"
          className={`bg-primary text-primary-foreground ${baseClasses}`}
        >
          Proposta enviada
        </Badge>
      )
    case 'contracted':
      return (
        <Badge
          variant="default"
          className={`bg-green-500 text-white hover:bg-green-600 ${baseClasses}`}
        >
          Contratado
        </Badge>
      )
    default:
      return null
  }
}

export default function Messages() {
  const { t, getDateLocale } = useLanguageStore()
  const { user } = useAuthStore()
  const { conversations, sendMessage, getOrCreateConversation } =
    useMessageStore()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const convParam = searchParams.get('conv')
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(convParam)
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'interests' | 'ongoing'>('ongoing')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (convParam) setSelectedConversationId(convParam)
  }, [convParam])

  if (!user) return null

  const myConversations = conversations.filter((c) =>
    c.participants.some((p) => p.id === user.id),
  )

  const filteredConversations = myConversations.filter((conv) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    const partner =
      conv.participants.find((p) => p.id !== user.id) || conv.participants[0]
    const matchName = partner.name.toLowerCase().includes(q)
    const matchContext = conv.context?.title.toLowerCase().includes(q)
    const matchMessage = conv.messages.some((m) =>
      m.content.toLowerCase().includes(q),
    )
    return matchName || matchMessage || matchContext
  })

  const interestsChats = filteredConversations.filter(
    (c) => c.negotiationStatus === 'analysis',
  )
  const ongoingChats = filteredConversations.filter(
    (c) =>
      c.negotiationStatus === 'proposal' ||
      c.negotiationStatus === 'contracted' ||
      !c.negotiationStatus,
  )

  const searchedUsers = searchQuery.trim()
    ? MOCK_PLATFORM_USERS.filter((u) => {
        if (u.id === user.id) return false
        const inConv = myConversations.some((c) =>
          c.participants.some((p) => p.id === u.id),
        )
        if (inConv) return false
        return u.name.toLowerCase().includes(searchQuery.toLowerCase())
      })
    : []

  const selectedConversation = myConversations.find(
    (c) => c.id === selectedConversationId,
  )

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return
    sendMessage(selectedConversationId, user.id, messageInput)
    setMessageInput('')
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0 && selectedConversationId) {
      toast({
        title: 'Arquivo Anexado',
        description: `O arquivo "${files[0].name}" foi enviado com sucesso.`,
      })
      // Simulate sending file message
      sendMessage(
        selectedConversationId,
        user.id,
        `📎 Arquivo anexo: ${files[0].name}`,
      )
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleStartSuggestionChat = (sug: (typeof MOCK_SUGGESTIONS)[0]) => {
    const canMessage = user.isPremium || sug.openChat
    if (!canMessage) {
      toast({
        title: 'Acesso Restrito',
        description: 'Assine o Premium para conectar com este profissional.',
      })
      return
    }
    const convId = getOrCreateConversation(
      { id: user.id, name: user.name, avatar: user.avatar || '' },
      { id: sug.id, name: sug.name, avatar: sug.avatar },
      undefined,
      'analysis',
    )
    setSelectedConversationId(convId)
    setActiveTab('interests')
  }

  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return ''
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: getDateLocale(),
      })
    } catch {
      return ''
    }
  }

  const renderConversationList = (chats: typeof myConversations) => {
    if (chats.length === 0 && !searchQuery.trim()) {
      return (
        <div className="text-center py-10 text-muted-foreground text-sm">
          {activeTab === 'interests'
            ? 'Nenhum interesse recebido.'
            : 'Nenhuma conversa em andamento.'}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {chats
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
          )
          .map((conv) => {
            const partner =
              conv.participants.find((p) => p.id !== user.id) ||
              conv.participants[0]
            const lastMessage = conv.messages[conv.messages.length - 1]
            const lastMessageText = lastMessage
              ? lastMessage.content
              : 'Nova conversa iniciada'
            const lastMessageTime = lastMessage
              ? lastMessage.timestamp
              : conv.updatedAt

            return (
              <Card
                key={conv.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedConversationId === conv.id
                    ? 'bg-muted border-primary'
                    : ''
                }`}
                onClick={() => setSelectedConversationId(conv.id)}
              >
                <CardContent className="p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={partner.avatar} />
                        <AvatarFallback>
                          {partner.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <span className="font-semibold text-sm truncate">
                          {partner.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {formatTimeAgo(lastMessageTime)}
                        </span>
                      </div>
                      {conv.negotiationStatus && (
                        <div className="mb-1">
                          <StatusBadge
                            status={conv.negotiationStatus}
                            size="sm"
                          />
                        </div>
                      )}
                      {conv.context && (
                        <p className="text-[10px] text-primary/80 truncate font-medium mb-0.5">
                          Ref: {conv.context.title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {lastMessageText}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    )
  }

  const renderSearchResults = () => {
    if (!searchQuery.trim()) return null

    if (searchedUsers.length === 0) {
      return (
        <div className="text-center py-10 px-4 text-muted-foreground border border-dashed rounded-lg mt-4">
          <Search className="h-8 w-8 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Nenhum resultado encontrado.</p>
          {!user.isPremium && (
            <div className="mt-3">
              <p className="text-xs mb-3">
                Usuários com perfil privado podem não aparecer. O plano Premium
                oferece prospecção ativa e visão expandida.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/subscription')}
              >
                <Star className="h-3 w-3 mr-2 text-amber-500 fill-amber-500" />
                Ver Planos
              </Button>
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2 mt-4 border-t pt-4">
        <h3 className="text-[10px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">
          Pessoas (Diretório)
        </h3>
        {searchedUsers.map((u) => {
          const canMessage = user.isPremium || u.openChat
          return (
            <Card
              key={u.id}
              className={`cursor-pointer transition-all ${
                canMessage
                  ? 'hover:bg-muted/50 border-border'
                  : 'opacity-75 bg-muted/20 border-dashed'
              }`}
              onClick={() => {
                if (!canMessage) {
                  toast({
                    title: 'Acesso Restrito',
                    description:
                      'Assine o Premium para enviar mensagens a usuários com chat fechado.',
                  })
                  return
                }
                const convId = getOrCreateConversation(
                  { id: user.id, name: user.name, avatar: user.avatar || '' },
                  { id: u.id, name: u.name, avatar: u.avatar },
                )
                setSelectedConversationId(convId)
                setSearchQuery('')
              }}
            >
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm truncate">
                      {u.name}
                    </span>
                    {canMessage ? (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {u.openChat ? (
                          <Unlock className="h-3 w-3" />
                        ) : (
                          <Star className="h-3 w-3" />
                        )}
                        {u.openChat ? 'Chat Aberto' : 'Acesso Premium'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-destructive flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Chat Fechado
                      </span>
                    )}
                  </div>
                </div>
                {!canMessage && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    asChild
                  >
                    <Link to="/subscription">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4 pb-20 md:pb-0 pt-4">
      {/* Conversation List Sidebar */}
      <div
        className={`${selectedConversationId ? 'hidden lg:flex' : 'flex'} w-full lg:w-[320px] flex-col gap-4 h-full`}
      >
        <div className="flex flex-col gap-2 shrink-0">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('messages.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('messages.desc')}</p>
        </div>

        <div className="relative shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar mensagens ou pessoas"
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4 flex flex-col space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="flex flex-col"
          >
            <TabsList className="grid grid-cols-2 mb-4 shrink-0 h-9">
              <TabsTrigger value="interests" className="text-[11px] px-1">
                Interesses
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="text-[11px] px-1">
                Conversas Ativas
              </TabsTrigger>
            </TabsList>
            <TabsContent value="interests" className="m-0 flex flex-col gap-2">
              {renderConversationList(interestsChats)}
              {renderSearchResults()}
            </TabsContent>
            <TabsContent value="ongoing" className="m-0 flex flex-col gap-2">
              {renderConversationList(ongoingChats)}
              {renderSearchResults()}
            </TabsContent>
          </Tabs>

          {/* Mobile/Tablet Suggestions (Visible only if no active search) */}
          {!searchQuery.trim() && (
            <div className="xl:hidden border-t pt-4 shrink-0">
              <h3 className="font-semibold text-sm mb-3">
                Sugestões de Conexão
              </h3>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {MOCK_SUGGESTIONS.map((sug) => (
                  <Card key={sug.id} className="min-w-[240px] shrink-0">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage src={sug.avatar} />
                          <AvatarFallback>{sug.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-sm truncate">
                            {sug.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                            {sug.skills.join(', ')}
                          </span>
                          {sug.openChat ? (
                            <span className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
                              <Unlock className="h-3 w-3" /> Chat Aberto
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-500 flex items-center gap-1 font-medium">
                              <Star className="h-3 w-3 fill-amber-500" />{' '}
                              Premium
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full mt-3 text-xs h-7"
                        onClick={() => handleStartSuggestionChat(sug)}
                      >
                        Conectar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div
        className={`${!selectedConversationId ? 'hidden lg:flex' : 'flex'} flex-1 flex-col bg-card rounded-lg border shadow-sm h-full overflow-hidden`}
      >
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex items-center gap-3 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0 -ml-2"
                onClick={() => setSelectedConversationId(null)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={
                    selectedConversation.participants.find(
                      (p) => p.id !== user.id,
                    )?.avatar
                  }
                />
                <AvatarFallback>
                  {selectedConversation.participants
                    .find((p) => p.id !== user.id)
                    ?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm md:text-base truncate">
                  {
                    selectedConversation.participants.find(
                      (p) => p.id !== user.id,
                    )?.name
                  }
                </h3>
                <div className="flex items-center gap-2 text-xs flex-wrap mt-0.5">
                  {selectedConversation.negotiationStatus && (
                    <StatusBadge
                      status={selectedConversation.negotiationStatus}
                      size="sm"
                    />
                  )}
                  {selectedConversation.context && (
                    <span className="text-primary font-medium truncate max-w-[150px] md:max-w-[300px]">
                      Ref: {selectedConversation.context.title}
                    </span>
                  )}
                  <span className="text-muted-foreground flex items-center gap-1 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.senderId === user.id
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-card border shadow-sm text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-[10px] opacity-70 block mt-1 text-right">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              {selectedConversation.messages.length === 0 && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Envie a primeira mensagem para iniciar a conversa.
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-muted/30 border-t flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                Respostas Rápidas:
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full bg-background whitespace-nowrap"
                onClick={() => {
                  sendMessage(
                    selectedConversationId,
                    user.id,
                    'Olá! O serviço ainda está disponível?',
                  )
                }}
              >
                Disponível?
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full bg-background whitespace-nowrap"
                onClick={() => {
                  sendMessage(
                    selectedConversationId,
                    user.id,
                    'Qual é o preço mínimo ou valor negociável?',
                  )
                }}
              >
                Negociar Valor
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs rounded-full border-primary/50 text-primary bg-primary/5 whitespace-nowrap"
                onClick={() => {
                  const targetId = selectedConversation.participants.find(
                    (p) => p.id !== user.id,
                  )?.id
                  navigate(
                    `/payment/service/${targetId}?service=Oferta%20Personalizada&price=0`,
                  )
                }}
              >
                Fazer Oferta Direta
              </Button>
            </div>
            <div className="p-4 border-t bg-background shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
                className="flex gap-2 items-center"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => fileInputRef.current?.click()}
                  title="Anexar arquivo"
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('messages.type_placeholder')}
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-muted/10">
            <div className="bg-background shadow-sm p-6 rounded-full mb-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              {t('messages.title')}
            </h3>
            <p className="max-w-xs">{t('messages.empty')}</p>
          </div>
        )}
      </div>

      {/* Connection Suggestions Sidebar (Desktop right panel) */}
      <div className="hidden xl:flex w-[260px] 2xl:w-[300px] flex-col gap-4 bg-card rounded-lg border shadow-sm p-4 h-full overflow-hidden shrink-0">
        <div className="flex flex-col gap-1 shrink-0">
          <h3 className="font-semibold text-base tracking-tight">
            Sugestões de Conexão
          </h3>
          <p className="text-xs text-muted-foreground">
            Profissionais recomendados baseados no seu perfil
          </p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 pb-4">
          {MOCK_SUGGESTIONS.map((sug) => (
            <Card key={sug.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={sug.avatar} />
                    <AvatarFallback>{sug.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-sm truncate">
                      {sug.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 mb-1">
                      {sug.skills.join(', ')}
                    </span>
                    {sug.openChat ? (
                      <span className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
                        <Unlock className="h-3 w-3" /> Chat Aberto
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-500 flex items-center gap-1 font-medium">
                        <Star className="h-3 w-3 fill-amber-500" /> Premium
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full mt-3 text-xs h-7"
                  onClick={() => handleStartSuggestionChat(sug)}
                >
                  Conectar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export type SupportClientRole = 'owner' | 'petsitter'

export type SupportConversation = {
  id: string
  clientId: string
  clientRole: SupportClientRole
  clientName: string
  clientEmail: string
  subject: string
  lastMessageAt: string
  lastMessagePreview: string
  clientUnread: number
  adminUnread: number
  createdAt: string
}

export type SupportMessage = {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
}

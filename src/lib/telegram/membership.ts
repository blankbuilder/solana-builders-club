export type TelegramChatMemberStatus =
  | 'creator'
  | 'administrator'
  | 'member'
  | 'restricted'
  | 'left'
  | 'kicked'
  | 'unknown'

export interface TelegramMembership {
  isMember: boolean
  status: TelegramChatMemberStatus
  reason?: string
}

type GetChatMemberResponse = {
  ok: boolean
  description?: string
  result?: {
    status?: TelegramChatMemberStatus
    is_member?: boolean
  }
}

export async function checkTelegramMembership({
  botToken,
  chatId,
  userId,
}: {
  botToken: string
  chatId: string
  userId: string
}): Promise<TelegramMembership> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      user_id: userId,
    }),
    cache: 'no-store',
  })
  const data = (await response.json().catch(() => ({}))) as GetChatMemberResponse

  if (!response.ok || !data.ok || !data.result?.status) {
    return {
      isMember: false,
      status: 'unknown',
      reason: data.description ?? 'Telegram membership check failed',
    }
  }

  const status = data.result.status
  const isMember =
    status === 'creator' ||
    status === 'administrator' ||
    status === 'member' ||
    (status === 'restricted' && data.result.is_member === true)

  return { isMember, status }
}

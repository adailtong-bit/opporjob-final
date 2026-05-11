import { supabase } from '@/lib/supabase/client'

export const sendPushNotification = async (payload: {
  userId?: string
  title: string
  body: string
  url?: string
}) => {
  const { data, error } = await supabase.functions.invoke('send-push', {
    body: payload,
  })
  return { data, error }
}

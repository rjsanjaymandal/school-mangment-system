"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  is_read: boolean
}

/**
 * useNeuralMessages Hook
 * Real-time synchronization for the Institutional Messaging Hub.
 */
export function useNeuralMessages(userId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // 1. Initial Fetch
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true })

      if (!error) setMessages(data || [])
      setIsLoading(false)
    }

    fetchMessages()

    // 2. Real-time Subscription (Supabase Channel)
    const channel = supabase
      .channel(`room:neural-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          // Filter if the message belongs to this conversation context
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const sendMessage = async (receiverId: string, content: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { sender_id: userId, receiver_id: receiverId, content }
      ])
    
    return { data, error }
  }

  return { messages, isLoading, sendMessage }
}

import { useEffect, useState, useRef } from 'react'
import type { AI } from '@/app/action'
import { useUIState, useActions, useAIState } from 'ai/rsc'
import { cn } from '@/lib/utils'
import { UserMessage } from './user-message'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ArrowRight, Plus, Square } from 'lucide-react'
import { EmptyScreen } from './empty-screen'

export function ChatPanel() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useUIState<typeof AI>()
  const [aiMessages, setAiMessages] = useAIState<typeof AI>()
  const { submit } = useActions<typeof AI>()
  const [isButtonPressed, setIsButtonPressed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const [chatHistory, setChatHistory] = useState<typeof messages>([])

  // Update chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setChatHistory(prev => [...prev, ...messages])
      setMessages([]) // Clear the temporary messages
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Add user message to chat history
    const userMessage = {
      id: Date.now(),
      isGenerating: false,
      component: <UserMessage message={input} />
    }
    setChatHistory(prev => [...prev, userMessage])

    // Submit and get response message
    const formData = new FormData(e.currentTarget)
    const responseMessage = await submit(formData)
    setChatHistory(prev => [...prev, responseMessage as any])

    setInput('')
  }

  // Modified to only clear current input
  const handleClear = () => {
    setIsButtonPressed(true)
    setChatHistory([])
    setAiMessages([])
  }

  // Focus on input when button is pressed
  useEffect(() => {
    if (isButtonPressed) {
      inputRef.current?.focus()
      setIsButtonPressed(false)
    }
  }, [isButtonPressed])

  useEffect(() => {
    // focus on input when the page loads
    inputRef.current?.focus()
  }, [])

  // If there are messages and the new button has not been pressed, display the new Button
  if (messages.length > 0 && !isButtonPressed) {
    return (
      <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-center items-center mx-auto">
        <Button
          type="button"
          variant={'secondary'}
          className="rounded-full bg-secondary/80 group transition-all hover:scale-105"
          onClick={() => handleClear()}
        >
          <span className="text-sm mr-2 group-hover:block hidden animate-in fade-in duration-300">
            New
          </span>
          <Plus size={18} className="group-hover:rotate-90 transition-all" />
        </Button>
      </div>
    )
  }

  // Modified render condition for the New Chat button
  if (chatHistory.length > 0) {
    return (
      <>
        <div className="mb-20 space-y-4 px-4">
          {chatHistory.map((message) => (
            <div 
              key={message.id} 
              className="p-4 rounded-lg border border-border/50 bg-background/80 backdrop-blur-sm"
            >
              {message.component}
            </div>
          ))}
        </div>
        <div className="fixed bottom-2 md:bottom-8 left-0 right-0 flex justify-between items-center mx-auto px-4 max-w-2xl">
          <form onSubmit={handleSubmit} className="flex-1 mr-4">
            <div className="relative flex items-center w-full">
              <Input
                ref={inputRef}
                type="text"
                name="input"
                placeholder="Ask a question..."
                value={input}
                className="pl-4 pr-10 h-12 rounded-full bg-muted"
                onChange={e => {
                  setInput(e.target.value)
                  setShowEmptyScreen(e.target.value.length === 0)
                }}
              />
              <Button
                type="submit"
                size={'icon'}
                variant={'ghost'}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                disabled={input.length === 0}
              >
                <ArrowRight size={20} />
              </Button>
            </div>
          </form>
          <Button
            type="button"
            variant={'secondary'}
            className="rounded-full bg-secondary/80 group transition-all hover:scale-105"
            onClick={handleClear}
          >
            <Plus size={18} className="group-hover:rotate-90 transition-all" />
          </Button>
        </div>
      </>
    )
  }

  // Initial empty state remains mostly unchanged
  return (
    <div className="fixed bottom-8 left-0 right-0 top-10 mx-auto h-screen flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-2xl w-full px-6">
        <div className="relative flex items-center w-full">
          <Input
            ref={inputRef}
            type="text"
            name="input"
            placeholder="Ask a question..."
            value={input}
            className="pl-4 pr-10 h-12 rounded-full bg-muted"
            onChange={e => {
              setInput(e.target.value)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onFocus={() => setShowEmptyScreen(true)}
            onBlur={() => setShowEmptyScreen(false)}
          />
          <Button
            type="submit"
            size={'icon'}
            variant={'ghost'}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={input.length === 0}
          >
            <ArrowRight size={20} />
          </Button>
        </div>
        <EmptyScreen
          submitMessage={message => {
            setInput(message)
          }}
          className={cn(showEmptyScreen ? 'visible' : 'invisible')}
        />
      </form>
    </div>
  )
}

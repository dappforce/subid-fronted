import React, { useState, useEffect, useRef } from 'react'
import styles from './ChatFloatingModal.module.sass'
import { Button } from 'antd'
import { HiChevronDown } from 'react-icons/hi2'
import ChatIframe from './ChatIframe'
import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { useResponsiveSize } from '../responsive'
import { useSendEvent } from '../providers/AnalyticContext'
import { isCreatorStakingPage } from '../utils'
import { useChatContext } from '../providers/ChatContext'

type ChatFloatingModalProps = {
  position?: 'right' | 'bottom'
}

export default function ChatFloatingModal ({
  position = 'bottom',
}: ChatFloatingModalProps) {
  const { isLargeDesktop } = useResponsiveSize()
  const sendEvent = useSendEvent()
  const { open, setOpen, setSpaceId, setMetadata } = useChatContext()

  const [ unreadCount, setUnreadCount ] = useState(0)

  useEffect(() => {
    const unreadCountFromStorage = parseInt(
      localStorage.getItem('unreadCount') ?? ''
    )
    if (unreadCountFromStorage && !isNaN(unreadCountFromStorage)) {
      setUnreadCount(unreadCountFromStorage)
    }
  }, [])

  const hasOpened = useRef(false)
  const toggleChat = () => {
    let event
    if (open) event = 'close_grill_iframe'
    else {
      event = 'open_grill_iframe'
      setUnreadCount(0)
      localStorage.setItem('unreadCount', '0')
    }
    sendEvent(event)

    setOpen((prev) => !prev)

    if (!open) {
      setSpaceId(undefined)
      setMetadata(undefined)
    }
    hasOpened.current = true
  }

  if (isLargeDesktop && !isCreatorStakingPage()) {
    return null
  }

  const onUnreadCountChange = (count: number) => {
    if (count > 0) {
      setUnreadCount(count)
      localStorage.setItem('unreadCount', count.toString())
    }
  }

  return (
    <>
      {createPortal(
        <div className={clsx(styles[`Position--${position}`])}>
          <div
            className={clsx(
              styles.ChatContainer,
              !open && styles.ChatContainerHidden
            )}
          >
            <div
              className={clsx(styles.ChatOverlay)}
              onClick={() => {
                setOpen(false)
                setSpaceId(undefined)
                setMetadata(undefined)
              }}
            />
            <div className={clsx(styles.ChatContent)}>
              <div className={clsx(styles.ChatControl)}>
                <Button onClick={toggleChat}>
                  <HiChevronDown />
                </Button>
              </div>
              <ChatIframe
                onUnreadCountChange={onUnreadCountChange}
                className={styles.ChatIframe}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
      {createPortal(
        <div className={styles.ChatFloatingWrapper}>
          <Button className={styles.ChatFloatingButton} onClick={toggleChat}>
            <img src='/images/grillchat-white.svg' alt='GrillChat' />
            <span>Polkadot Chat</span>
          </Button>
          {!!unreadCount && (
            <span className={styles.ChatUnreadCount}>{unreadCount}</span>
          )}
        </div>,
        document.body
      )}
    </>
  )
}

import { useState, useEffect, useRef } from 'react'

interface Options {
  enterDelay?: number
  exitDelay?: number
  onUnmount?: () => void
}

const useDelayedRender = (
  active: boolean = false,
  options: Options = { enterDelay: 0, exitDelay: 0 }
) => {
  const [mounted, setMounted] = useState(active)
  const [rendered, setRendered] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const mountStart = useRef<number | null>(null)
  const optionsRef = useRef<Options>(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    clearTimeout(timer.current)
    const { enterDelay, exitDelay, onUnmount } = optionsRef.current

    if (active) {
      mountStart.current = Date.now()

      // Mount immediately
      setMounted(true)

      if (enterDelay === -1) {
        // Delay for a bit so that rendered is not immediately true
        if ('requestIdleCallback' in window) {
          // requestIdleCallback not supported in Safari
          ;(window as any).requestIdleCallback(() => {
            setRendered(true)
          }, { timeout: 100 })
        } else {
          setTimeout(() => {
            setRendered(true)
          }, 1)
        }
      } else if (enterDelay === 0) {
        // Render immediately
        setRendered(true)
      } else {
        // Render after a delay
        timer.current = setTimeout(() => {
          setRendered(true)
        }, enterDelay)
      }
    } else {
      // Immediately set to unrendered
      setRendered(false)

      // This is an optimization so that we unmount as soon as possible
      // instead of always delaying for the time specified in exitDelay
      // i.e. if the `active` value becomes true and then false in quick succession
      let delayExitTime = exitDelay

      if (mountStart.current) {
        const timeSinceMount = Date.now() - mountStart.current

        if (enterDelay && timeSinceMount < enterDelay) {
          // Unmount immediately, the content had not yet been rendered
          delayExitTime = 0
        } else if (exitDelay && timeSinceMount < exitDelay) {
          delayExitTime = timeSinceMount
        }
      }

      if (delayExitTime === 0) {
        setMounted(false)

        // If mountStart is assigned, we've mounted at least once
        if (mountStart.current) {
          onUnmount?.()
        }
      } else {
        // Unmount after a delay
        timer.current = setTimeout(() => {
          setMounted(false)
          if (mountStart.current) {
            onUnmount?.()
          }
        }, delayExitTime)
      }
    }
  }, [active])

  return {
    mounted,
    rendered
  }
}

export default useDelayedRender

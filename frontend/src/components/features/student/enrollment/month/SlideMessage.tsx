import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SlideMessageProps {
  message: string
  iconSrc: string
  isVisible: boolean
}

export const SlideMessage: React.FC<SlideMessageProps> = ({
  message,
  iconSrc,
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-[120px] left-0 right-0 z-50 flex justify-center"
        >
          <div className="flex gap-1 justify-center items-center py-2.5 px-3 text-sm font-semibold tracking-normal leading-snug text-center bg-white rounded-full shadow-lg border border-solid border-zinc-300 text-zinc-600">
            <div className="self-stretch my-auto">{message}</div>
            <img
              loading="lazy"
              src={iconSrc}
              alt=""
              className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SlideMessage

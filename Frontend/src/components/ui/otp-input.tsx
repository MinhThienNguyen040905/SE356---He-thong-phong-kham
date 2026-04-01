import { useRef, useState, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react'
import { cn } from '../../lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  
  useEffect(() => {
    if (value !== otp.join('')) {
      setOtp(value.split('').concat(Array(length).fill('')).slice(0, length))
    }
  }, [value, length])

  const handleChange = (index: number, digit: string) => {
    if (disabled) return

    
    if (digit && !/^\d$/.test(digit)) return

    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)
    onChange(newOtp.join(''))

    
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return

    if (e.key === 'Backspace') {
      e.preventDefault()
      
      if (otp[index]) {
        
        const newOtp = [...otp]
        newOtp[index] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
      } else if (index > 0) {
        
        const newOtp = [...otp]
        newOtp[index - 1] = ''
        setOtp(newOtp)
        onChange(newOtp.join(''))
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return

    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').trim()
    
    
    const digits = pastedData.replace(/\D/g, '').slice(0, length)
    
    if (digits) {
      const newOtp = digits.split('').concat(Array(length).fill('')).slice(0, length)
      setOtp(newOtp)
      onChange(newOtp.join(''))
      
      
      const lastFilledIndex = Math.min(digits.length, length - 1)
      inputRefs.current[lastFilledIndex]?.focus()
    }
  }

  return (
    <div className="flex gap-3 justify-center">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            'w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all',
            'focus:outline-none focus:ring-4',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            !disabled && !error && !digit && 'border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500/20',
            !disabled && !error && digit && 'border-blue-600 bg-blue-50/50 focus:border-blue-600 focus:ring-blue-500/20',
            error && 'border-red-500 bg-red-50/50 focus:border-red-500 focus:ring-red-500/20'
          )}
          autoComplete="off"
        />
      ))}
    </div>
  )
}

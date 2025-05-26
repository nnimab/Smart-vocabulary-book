"use client"

import React from 'react'
import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
}

interface PasswordCriteria {
  label: string
  test: (password: string) => boolean
}

const criteria: PasswordCriteria[] = [
  {
    label: '至少 8 個字符',
    test: (password) => password.length >= 8
  },
  {
    label: '包含小寫字母 (a-z)',
    test: (password) => /[a-z]/.test(password)
  },
  {
    label: '包含大寫字母 (A-Z)',
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: '包含數字 (0-9)',
    test: (password) => /\d/.test(password)
  },
  {
    label: '包含特殊字符 (!@#$%^&*)',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
]

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const passedCriteria = criteria.filter(criterion => criterion.test(password))
  const strength = passedCriteria.length
  
  const getStrengthText = () => {
    if (strength === 0) return '密碼強度：未輸入'
    if (strength <= 2) return '密碼強度：弱'
    if (strength <= 3) return '密碼強度：中等'
    if (strength <= 4) return '密碼強度：強'
    return '密碼強度：非常強'
  }

  const getStrengthColor = () => {
    if (strength === 0) return 'text-gray-500'
    if (strength <= 2) return 'text-red-500'
    if (strength <= 3) return 'text-yellow-500'
    if (strength <= 4) return 'text-orange-500'
    return 'text-green-500'
  }

  return (
    <div className="space-y-2">
      <div className={`text-sm font-medium ${getStrengthColor()}`}>
        {getStrengthText()}
      </div>
      
      {/* 強度條 */}
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-2 flex-1 rounded ${
              level <= strength
                ? strength <= 2
                  ? 'bg-red-500'
                  : strength <= 3
                  ? 'bg-yellow-500'
                  : strength <= 4
                  ? 'bg-orange-500'
                  : 'bg-green-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* 條件列表 */}
      {password && (
        <div className="space-y-1">
          {criteria.map((criterion, index) => {
            const isPassed = criterion.test(password)
            return (
              <div key={index} className="flex items-center space-x-2 text-sm">
                {isPassed ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
                <span className={isPassed ? 'text-green-700' : 'text-gray-600'}>
                  {criterion.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 
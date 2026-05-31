import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import ErrorBanner from '../ErrorBanner'

describe('ErrorBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该默认不显示', () => {
    const { queryByText } = render(<ErrorBanner />)
    expect(queryByText(/本地存储异常/)).not.toBeInTheDocument()
  })

  it('应该在收到存储错误事件时显示', () => {
    const { unmount, getByText } = render(<ErrorBanner />)

    act(() => {
      window.dispatchEvent(
        new CustomEvent('storage-error', {
          detail: {
            message: '本地存储异常，建议导出备份',
            details: '错误: IndexedDB 不可用',
            status: 'degraded',
          },
        })
      )
    })

    expect(getByText('本地存储异常，建议导出备份')).toBeInTheDocument()
    unmount()
  })

  it('应该能够关闭错误提示', () => {
    const { getAllByRole, queryByText } = render(<ErrorBanner />)

    // 触发错误
    act(() => {
      window.dispatchEvent(
        new CustomEvent('storage-error', {
          detail: {
            message: '本地存储异常，建议导出备份',
            status: 'error',
          },
        })
      )
    })

    // 点击关闭按钮（最后一个按钮）
    const buttons = getAllByRole('button')
    const closeButton = buttons[buttons.length - 1]
    act(() => {
      closeButton.click()
    })

    expect(queryByText(/本地存储异常/)).not.toBeInTheDocument()
  })

  it('应该在15秒后自动隐藏', () => {
    const { getByText, queryByText } = render(<ErrorBanner />)

    // 触发错误
    act(() => {
      window.dispatchEvent(
        new CustomEvent('storage-error', {
          detail: {
            message: '本地存储异常，建议导出备份',
            status: 'error',
          },
        })
      )
    })

    expect(getByText('本地存储异常，建议导出备份')).toBeInTheDocument()

    // 快进15秒
    act(() => {
      vi.advanceTimersByTime(15000)
    })

    expect(queryByText(/本地存储异常/)).not.toBeInTheDocument()
  })
})

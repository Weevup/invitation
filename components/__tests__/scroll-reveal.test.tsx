import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollReveal } from '../scroll-reveal'

describe('ScrollReveal', () => {
  beforeAll(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      readonly root: Element | null = null
      readonly rootMargin: string = ''
      readonly thresholds: ReadonlyArray<number> = []
    } as any
  })

  it('should render children', () => {
    render(
      <ScrollReveal>
        <div>Test content</div>
      </ScrollReveal>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <ScrollReveal className="custom-class">
        <div>Test content</div>
      </ScrollReveal>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('custom-class')
  })

  it('should initialize with opacity-0 and translate-y-8', () => {
    const { container } = render(
      <ScrollReveal>
        <div>Test content</div>
      </ScrollReveal>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('opacity-0')
    expect(wrapper.className).toContain('translate-y-8')
  })

  it('should have transition classes', () => {
    const { container } = render(
      <ScrollReveal>
        <div>Test content</div>
      </ScrollReveal>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('transition-all')
    expect(wrapper.className).toContain('duration-700')
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

describe('App', () => {
  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    // Check that the landing page renders with its main heading
    expect(screen.getByRole('heading', { name: /learn smarter/i })).toBeDefined()
  })

  it('should render the landing page on root route', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    // The landing page should have the main heading and CTA buttons
    expect(screen.getByRole('heading', { name: /learn smarter/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /get started/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeDefined()
  })

  it('should render feature cards on landing page', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    )
    // Check feature cards are present
    expect(screen.getByRole('heading', { name: /ai-powered plans/i })).toBeDefined()
    expect(screen.getByRole('heading', { name: /gamification/i })).toBeDefined()
    expect(screen.getByRole('heading', { name: /track progress/i })).toBeDefined()
  })
})

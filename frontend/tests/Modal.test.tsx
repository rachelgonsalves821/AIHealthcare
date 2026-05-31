import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../src/components/ui/Modal'
import Button from '../src/components/ui/Button'

describe('Modal', () => {
  it('renders when open is true', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when open is false', () => {
    render(
      <Modal open={false} onOpenChange={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <Modal open={true} onOpenChange={() => {}} title="Test Modal" description="This is a description">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('This is a description')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(
      <Modal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        footer={<Button>Submit</Button>}
      >
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('calls onOpenChange when close button is clicked', async () => {
    const onOpenChange = vi.fn()
    render(
      <Modal open={true} onOpenChange={onOpenChange} title="Test Modal">
        <p>Content</p>
      </Modal>
    )
    await userEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})

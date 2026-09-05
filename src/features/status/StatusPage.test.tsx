import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, it, vi } from 'vitest'
import { StatusPage } from './StatusPage'

afterEach(() => vi.unstubAllGlobals())
function show() { render(<MemoryRouter><StatusPage /></MemoryRouter>) }
it('shows real health success after loading', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok', database: 'up' })))); show()
  expect(screen.getByText('Bağlantı kontrol ediliyor…')).toBeInTheDocument()
  expect(await screen.findByRole('heading', { name: 'Bağlantı hazır' })).toBeInTheDocument()
})
it('offers retry after a connection failure', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('network')).mockResolvedValueOnce(new Response(JSON.stringify({ status: 'ok', database: 'up' })))
  vi.stubGlobal('fetch', fetchMock); show()
  expect(await screen.findByRole('heading', { name: 'Şu anda bağlantı kurulamıyor' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Tekrar kontrol et' }))
  expect(await screen.findByRole('heading', { name: 'Bağlantı hazır' })).toBeInTheDocument()
})
it('does not report success for an invalid health contract', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok' })))); show()
  expect(await screen.findByRole('heading', { name: 'Şu anda bağlantı kurulamıyor' })).toBeInTheDocument()
})

import { apiGet, apiMutation, ApiError, isRecord } from '../../api/apiClient'
export type Kind = 'UNIVERSITY' | 'DEPARTMENT' | 'TAG'
export interface CatalogEntry { id: string; name: string; deletedAt: string | null; version: number }
export interface Education { id: string; universityId: string; universityName: string; departmentId: string; departmentName: string; deletedAt: string | null; available: boolean; version: number }
export interface Page<T> { items: T[]; page: number; size: number; totalElements: number }
export interface Choice { id: string; label: string }
export function catalogEntry(value: unknown): CatalogEntry {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string' || typeof value.version !== 'number'
    || !(value.deletedAt === null || typeof value.deletedAt === 'string')) throw invalid()
  return { id:value.id, name:value.name, version:value.version, deletedAt:value.deletedAt }
}
export function education(value: unknown): Education {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.universityId !== 'string' || typeof value.universityName !== 'string'
    || typeof value.departmentId !== 'string' || typeof value.departmentName !== 'string' || typeof value.available !== 'boolean'
    || typeof value.version !== 'number' || !(value.deletedAt === null || typeof value.deletedAt === 'string')) throw invalid()
  return { id:value.id, universityId:value.universityId, universityName:value.universityName, departmentId:value.departmentId,
    departmentName:value.departmentName, available:value.available, version:value.version, deletedAt:value.deletedAt }
}
export function pageOf<T>(value: unknown, parse: (value: unknown) => T): Page<T> {
  if (!isRecord(value) || !Array.isArray(value.items) || typeof value.page !== 'number' || typeof value.size !== 'number' || typeof value.totalElements !== 'number') throw invalid()
  return { items:value.items.map(parse), page:value.page, size:value.size, totalElements:value.totalElements }
}
function invalid() { return new ApiError(200,'INVALID_RESPONSE','Liste bilgileri alınamadı.') }
export async function getCatalog(path: string, signal?: AbortSignal) { return pageOf(await apiGet(path,signal),catalogEntry) }
export async function getEducation(path: string, signal?: AbortSignal) { return pageOf(await apiGet(path,signal),education) }
export async function createEntry(kind: Kind, name: string, admin = false) {
  return catalogEntry(await apiMutation(admin ? '/api/tags' : `/api/manager/catalog/${kind}`,'POST',{name}))
}
export async function renameEntry(kind: Kind, entry: CatalogEntry, name: string) {
  return catalogEntry(await apiMutation(`/api/manager/catalog/${kind}/${entry.id}`,'PUT',{name,version:entry.version}))
}
export async function setEntryStatus(kind: Kind, entry: CatalogEntry) {
  return catalogEntry(await apiMutation(`/api/manager/catalog/${kind}/${entry.id}/status`,'PUT',{deleted:!entry.deletedAt,version:entry.version}))
}
export async function createEducation(universityId: string, departmentId: string) {
  return education(await apiMutation('/api/manager/university-departments','POST',{universityId,departmentId}))
}
export async function setEducationStatus(entry: Education) {
  return education(await apiMutation(`/api/manager/university-departments/${entry.id}/status`,'PUT',{deleted:!entry.deletedAt,version:entry.version}))
}

import { supabase } from './supabaseClient'

export const DEFAULT_SITE_SETTINGS = {
  is_recruitment_open: true,
  community_member_count: 77,
  live_sheet_url: '',
  footer_settings: {
    phone: '+20 11 58913093',
    email: 'ieee.eru.sb@gmail.com',
    facebook: 'https://facebook.com/IEEE.ERU.SB',
    instagram: 'https://instagram.com/ieee_erusb/',
    linkedin: 'https://linkedin.com/company/ieee-eru-sb/',
  },
}

const serializeSettingValue = (value) => {
  if (typeof value === 'string') return value
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  return JSON.stringify(value)
}

export const ensureSettingsDefaults = async (fallbackSettings = DEFAULT_SITE_SETTINGS) => {
  const { data, error } = await supabase.from('settings').select('key')
  if (error) throw error

  const existingKeys = new Set((data || []).map((row) => row.key))
  const missingRows = Object.entries(fallbackSettings)
    .filter(([key]) => !existingKeys.has(key))
    .map(([key, value]) => ({ key, value: serializeSettingValue(value) }))

  if (missingRows.length > 0) {
    const { error: insertError } = await supabase.from('settings').insert(missingRows)
    if (insertError) throw insertError
  }

  return fallbackSettings
}

export const getSettingValue = (settingsRows, key, fallbackValue) => {
  const settingRow = (settingsRows || []).find((row) => row.key === key)
  if (!settingRow) return fallbackValue

  const rawValue = settingRow.value
  if (rawValue === null || rawValue === undefined) return fallbackValue
  if (typeof rawValue === 'boolean' || typeof rawValue === 'number') return rawValue

  if (typeof rawValue === 'string') {
    if (rawValue === 'true') return true
    if (rawValue === 'false') return false

    try {
      return JSON.parse(rawValue)
    } catch {
      return rawValue
    }
  }

  return rawValue
}

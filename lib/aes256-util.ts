/**
 * 使用浏览器内置的 SubtleCrypto API 进行加密
 * @param text 要加密的文本
 * @param password 加密密码
 * @returns 加密后的 base64 字符串
 */
export async function encrypt(text: string, password: string): Promise<string> {
  // 生成随机盐
  const salt = crypto.getRandomValues(new Uint8Array(16))
  // 生成密钥
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  // 生成随机 IV
  const iv = crypto.getRandomValues(new Uint8Array(12))
  
  // 加密数据
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    new TextEncoder().encode(text)
  )
  
  // 转换为 base64 字符串
  const saltB64 = btoa(String.fromCharCode(...salt))
  const ivB64 = btoa(String.fromCharCode(...iv))
  const encryptedB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  
  return `${saltB64}:${ivB64}:${encryptedB64}`
}

/**
 * 使用浏览器内置的 SubtleCrypto API 进行解密
 * @param encryptedText 加密的 base64 字符串
 * @param password 解密密码
 * @returns 解密后的文本
 */
export async function decrypt(encryptedText: string, password: string): Promise<string> {
  // 分割盐、IV 和加密数据
  const [saltB64, ivB64, encryptedB64] = encryptedText.split(':')
  if (!saltB64 || !ivB64 || !encryptedB64) {
    throw new Error('Invalid encrypted text format')
  }
  
  // 转换为 Uint8Array
  const salt = new Uint8Array(Array.from(atob(saltB64), c => c.charCodeAt(0)))
  const iv = new Uint8Array(Array.from(atob(ivB64), c => c.charCodeAt(0)))
  const encrypted = new Uint8Array(Array.from(atob(encryptedB64), c => c.charCodeAt(0)))
  
  // 生成密钥
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  
  // 解密数据
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encrypted
  )
  
  // 转换为文本
  return new TextDecoder().decode(decrypted)
}

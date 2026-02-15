// Device Fingerprinting - Prevent Multiple Trial Accounts
export function generateDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  let fingerprint = '';

  // Screen resolution
  fingerprint += `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}|`;

  // Timezone
  fingerprint += `${new Date().getTimezoneOffset()}|`;

  // Language
  fingerprint += `${navigator.language}|`;

  // Platform
  fingerprint += `${navigator.platform}|`;

  // User Agent
  fingerprint += `${navigator.userAgent}|`;

  // Canvas fingerprint
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Veltrix', 2, 15);
    fingerprint += canvas.toDataURL();
  }

  // Hardware concurrency
  fingerprint += `${navigator.hardwareConcurrency || 'unknown'}|`;

  // Device memory (if available)
  fingerprint += `${(navigator as any).deviceMemory || 'unknown'}|`;

  // Generate hash
  return hashString(fingerprint);
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function checkDeviceRegistered(deviceId: string): boolean {
  const registeredDevices = JSON.parse(localStorage.getItem('registeredDevices') || '[]');
  return registeredDevices.includes(deviceId);
}

export function registerDevice(deviceId: string): void {
  const registeredDevices = JSON.parse(localStorage.getItem('registeredDevices') || '[]');
  if (!registeredDevices.includes(deviceId)) {
    registeredDevices.push(deviceId);
    localStorage.setItem('registeredDevices', JSON.stringify(registeredDevices));
  }
}

export function checkEmailRegistered(email: string): boolean {
  const registeredEmails = JSON.parse(localStorage.getItem('registeredEmails') || '[]');
  return registeredEmails.includes(email.toLowerCase());
}

export function registerEmail(email: string): void {
  const registeredEmails = JSON.parse(localStorage.getItem('registeredEmails') || '[]');
  const normalizedEmail = email.toLowerCase();
  if (!registeredEmails.includes(normalizedEmail)) {
    registeredEmails.push(normalizedEmail);
    localStorage.setItem('registeredEmails', JSON.stringify(registeredEmails));
  }
}

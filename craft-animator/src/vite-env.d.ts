/// <reference types="vite/client" />

interface CraftAnimatorDesktop {
  platform: string
  isDesktop: boolean
  openRigDialog: () => Promise<{ name: string; data: ArrayBuffer } | null>
  onOpenPath: (cb: (path: string) => void) => void
}

interface Window {
  craftAnimator?: CraftAnimatorDesktop
}

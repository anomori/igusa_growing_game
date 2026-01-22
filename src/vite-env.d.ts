/// <reference types="vite/client" />

// Google Analytics の dataLayer 型宣言
declare global {
    interface Window {
        dataLayer: unknown[]
    }
}

export {}

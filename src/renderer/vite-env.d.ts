/// <reference types="vite/client" />

// Extend ImportMeta interface
interface ImportMetaEnv {

}

interface ImportMeta {
    readonly env: ImportMetaEnv
    glob: (pattern: string, options?: {
        eager?: boolean
        import?: string
        query?: string
    }) => Record<string, any>
}
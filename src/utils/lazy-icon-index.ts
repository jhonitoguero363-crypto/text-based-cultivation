/** 将 import.meta.glob（非 eager）建成按文件名懒加载的图标索引 */

type IconLoader = () => Promise<string>

export function buildLazyIconIndex(modules: Record<string, IconLoader>) {
  const loaders: Record<string, IconLoader> = {}
  const cache: Record<string, string> = {}
  const inflight: Record<string, Promise<string>> = {}

  for (const [modPath, load] of Object.entries(modules)) {
    const file = modPath.split('/').pop() || ''
    if (file) loaders[file] = load
  }

  return {
    has(file: string) {
      return Boolean(file && loaders[file])
    },
    getCached(file: string) {
      return (file && cache[file]) || ''
    },
    load(file: string): Promise<string> {
      if (!file) return Promise.resolve('')
      if (cache[file]) return Promise.resolve(cache[file])
      if (inflight[file]) return inflight[file]
      const loader = loaders[file]
      if (!loader) return Promise.resolve('')
      inflight[file] = loader()
        .then((url) => {
          cache[file] = url
          delete inflight[file]
          return url
        })
        .catch(() => {
          delete inflight[file]
          return ''
        })
      return inflight[file]
    }
  }
}

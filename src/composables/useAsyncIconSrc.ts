import { ref, watch, type MaybeRefOrGetter, toValue } from 'vue'

/**
 * 按需解析图标 URL。首帧可先显示 fallback，图标就绪后替换。
 */
export function useAsyncIconSrc(
  key: MaybeRefOrGetter<string>,
  loader: (key: string) => Promise<string>
) {
  const src = ref('')
  let seq = 0

  watch(
    () => toValue(key),
    async (next) => {
      const token = ++seq
      if (!next) {
        src.value = ''
        return
      }
      const url = await loader(next)
      if (token === seq) src.value = url
    },
    { immediate: true }
  )

  return src
}

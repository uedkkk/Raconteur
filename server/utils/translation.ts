type TranslateFn = (key: string, ...args: any[]) => string

export async function useTranslation(_event: any): Promise<TranslateFn> {
  return (key: string, ..._args: any[]) => key
}

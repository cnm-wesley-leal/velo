import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      `Variáveis de ambiente faltando:\n` +
      `  VITE_SUPABASE_URL: ${url ? '✓' : '✗ AUSENTE'}\n` +
      `  SUPABASE_SERVICE_ROLE_KEY: ${key ? '✓' : '✗ AUSENTE'}`
    )
  }

  return createClient(url, key)
}

export async function deleteOrderByNumber(orderNumber: string): Promise<void> {
  const supabase = getSupabase()
  const cleanedOrderNumber = orderNumber.trim()

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('order_number', cleanedOrderNumber)

  if (error) {
    throw new Error(`Erro ao deletar pedido ${cleanedOrderNumber}: ${error.message}`)
  }

  console.log(`[Cleanup] Pedido ${cleanedOrderNumber} deletado.`)
}

export async function deleteOrderByEmail(email: string): Promise<void> {
  const supabase = getSupabase()

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('customer_email', email)

  if (error) {
    throw new Error(`Erro ao deletar pedidos do email ${email}: ${error.message}`)
  }

  console.log(`[Cleanup] Pedidos com email ${email} deletados.`)
}
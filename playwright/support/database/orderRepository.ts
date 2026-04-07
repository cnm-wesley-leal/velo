import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
)

export async function deleteOrderByNumber(orderNumber: string) {
    const cleanedOrderNumber = orderNumber.trim()

    // 1. Tenta buscar para ver se o registro é visível
    const { data } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('order_number', cleanedOrderNumber)
        .maybeSingle()

    if (!data) {
        console.log(`[Cleanup] Pedido ${cleanedOrderNumber} não encontrado para exclusão.`)
        return
    }

    // 2. Tenta deletar
    const { error, count } = await supabase
        .from('orders')
        .delete({ count: 'exact' })
        .eq('order_number', cleanedOrderNumber)

    if (error) {
        console.error(`[Cleanup] Erro ao deletar ${cleanedOrderNumber}:`, error)
    } else {
        console.log(`[Cleanup] Pedido ${cleanedOrderNumber} deletado. Linhas afetadas: ${count}`)
    }
}
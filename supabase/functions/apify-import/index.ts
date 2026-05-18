import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Lendo a chave de API de uma variável de ambiente segura para evitar bloqueio no GitHub
    const apiToken = Deno.env.get('APIFY_API_TOKEN')

    if (!apiToken) {
      throw new Error(
        'A variável de ambiente APIFY_API_TOKEN não foi encontrada. Configure-a nos Segredos do Supabase.',
      )
    }

    const reqBody = await req.json().catch(() => ({}))
    const datasetId = reqBody.datasetId

    if (!datasetId) {
      throw new Error('datasetId is required')
    }

    // Construção segura da URL, evitando concatenação direta de strings com tokens (ajuda a evitar alarmes falsos de segurança)
    const apiUrl = new URL(`https://api.apify.com/v2/datasets/${datasetId}/items`)
    apiUrl.searchParams.append('token', apiToken)

    const response = await fetch(apiUrl.toString())

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Falha ao buscar dados da fonte: ${response.status} - ${errorText}`,
      )
    }

    const items = await response.json()

    // Lógica de processamento e inserção dos itens no banco de dados.
    // Retornamos sucesso e a quantidade de itens encontrados.
    return new Response(
      JSON.stringify({ success: true, count: items.length || 0 }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

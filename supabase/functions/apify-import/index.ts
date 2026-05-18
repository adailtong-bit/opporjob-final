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
    const apiToken = Deno.env.get('CRAWLER_API_KEY')

    if (!apiToken) {
      throw new Error(
        'A variável de ambiente CRAWLER_API_KEY não foi encontrada. Configure-a nos Segredos do Supabase.',
      )
    }

    const reqBody = await req.json().catch(() => ({}))
    const datasetId = reqBody.datasetId

    if (!datasetId) {
      throw new Error('datasetId is required')
    }

    // Fazendo a requisição à API usando o token de forma segura
    const response = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apiToken}`,
    )

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

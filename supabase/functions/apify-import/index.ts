import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json().catch(() => ({}))

    // Agora utilizamos a chave segura armazenada nas variáveis de ambiente do Supabase
    const APIFY_KEY = Deno.env.get('APIFY_KEY')
    if (!APIFY_KEY) {
      throw new Error(
        'Chave APIFY_KEY não configurada nas variáveis de ambiente.',
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    let items: any[] = []

    // Se houver um datasetId no payload, buscamos os dados na Apify
    if (payload.datasetId) {
      const apifyUrl = `https://api.apify.com/v2/datasets/${payload.datasetId}/items?token=${APIFY_KEY}`
      const apifyRes = await fetch(apifyUrl)
      if (apifyRes.ok) {
        items = await apifyRes.json()
      } else {
        console.error('Falha ao buscar dados no Apify', await apifyRes.text())
        throw new Error(
          'Erro na integração com Apify. Verifique se o Dataset ID é válido.',
        )
      }
    }

    // Se for apenas um teste da função, inserimos um dado mock para validar o fluxo
    if (items.length === 0 && payload.testMode) {
      items = [
        {
          id: crypto.randomUUID(),
          title: 'Especialista em Importação de Dados',
          description: 'Teste de integração Apify via Edge Function.',
          price: 500,
          location: 'Remoto',
          category: 'Technology',
          photos: ['https://img.usecurling.com/p/600/600?q=data'],
        },
      ]
    }

    if (items.length > 0) {
      const jobsToInsert = items.map((item: any) => ({
        title: item.title || item.name || 'Vaga Importada Apify',
        description: item.description || item.text || 'Detalhes da vaga...',
        budget: item.price || item.budget || item.salary || 0,
        location: item.location || 'Remoto',
        category: item.category || 'Technology',
        photos: item.photos || [],
        source: 'apify',
        external_id: item.id || item.url || crypto.randomUUID(),
        status: 'pending_approval',
        owner_name: 'Apify System',
        type: 'fixed',
      }))

      const BATCH_SIZE = 200
      let totalInserted = 0

      for (let i = 0; i < jobsToInsert.length; i += BATCH_SIZE) {
        try {
          const batch = jobsToInsert.slice(i, i + BATCH_SIZE)
          const { error } = await supabaseClient.from('jobs').upsert(batch, {
            onConflict: 'external_id',
            ignoreDuplicates: true,
          })

          if (error) {
            console.error('Batch insert error:', error)
          } else {
            totalInserted += batch.length
          }
        } catch (batchErr) {
          console.error('Batch processing exception:', batchErr)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          count: totalInserted,
          message:
            'Integração Apify executada com sucesso usando variáveis de ambiente seguras.',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: 0,
        message: 'Nenhum dado retornado da Apify para importar.',
      }),
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

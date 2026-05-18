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

    const token = Deno.env.get('APIFY_API_TOKEN')

    if (!token) {
      throw new Error(
        'A variável APIFY_API_TOKEN não foi encontrada nos Segredos do Supabase.',
      )
    }

    const reqBody = await req.json().catch(() => ({}))
    const datasetId = reqBody.datasetId

    if (!datasetId) {
      throw new Error('datasetId is required')
    }

    const apiUrl = new URL(`https://api.apify.com/v2/datasets/${datasetId}/items`)
    apiUrl.searchParams.append('token', token)

    const response = await fetch(apiUrl.toString())

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Falha ao buscar dados da fonte: ${response.status} - ${errorText}`,
      )
    }

    const items = await response.json()

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ success: true, count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: existingCats } = await supabaseClient
      .from('categories')
      .select('name')

    const existingNames = new Set(
      (existingCats || []).map((c: any) => c.name.toLowerCase()),
    )

    const jobsToInsert = items.map((item: any) => {
      let finalCategory = item.category || 'Pending'

      if (!existingNames.has(finalCategory.toLowerCase())) {
        finalCategory = 'Pending'
      }

      return {
        title: item.title || 'Untitled Job',
        description: item.description || '',
        budget: typeof item.price === 'number' ? item.price : (parseFloat(item.price) || 0),
        location: item.location || 'Remote',
        category: finalCategory,
        photos: Array.isArray(item.photos) ? item.photos : [],
        source: 'apify',
        external_id: item.id || item.url || crypto.randomUUID(),
        status: 'pending_approval',
        owner_name: 'Apify System',
        type: 'fixed',
      }
    })

    const BATCH_SIZE = 200
    let totalInserted = 0

    for (let i = 0; i < jobsToInsert.length; i += BATCH_SIZE) {
      const batch = jobsToInsert.slice(i, i + BATCH_SIZE)
      const { error } = await supabaseClient
        .from('jobs')
        .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: true })

      if (error) {
        console.error('Batch insert error:', error)
      } else {
        totalInserted += batch.length
      }
    }

    return new Response(
      JSON.stringify({ success: true, count: totalInserted }),
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

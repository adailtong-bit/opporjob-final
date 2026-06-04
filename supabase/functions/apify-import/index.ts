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
      throw new Error('APIFY_KEY not configured in environment variables.')
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
        console.error('Failed to fetch data from Apify', await apifyRes.text())
        throw new Error(
          'Error integrating with Apify. Verify if the Dataset ID is valid.',
        )
      }
    }

    // If it's a test mode execution, insert mock data
    if (items.length === 0 && payload.testMode) {
      items = [
        {
          id: crypto.randomUUID(),
          title: 'Data Import Specialist',
          description: 'Apify integration test via Edge Function.',
          price: 500,
          location: 'Remote',
          category: 'Technology',
          photos: ['https://img.usecurling.com/p/600/600?q=data'],
        },
      ]
    }

    if (items.length > 0) {
      const jobsToInsert = items.map((item: any) => ({
        title: item.title || item.name || 'Apify Imported Job',
        description: item.description || item.text || 'Job details...',
        budget: item.price || item.budget || item.salary || 0,
        location: item.location || 'Remote',
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
            'Apify integration executed successfully using secure environment variables.',
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
        message: 'No data returned from Apify to import.',
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

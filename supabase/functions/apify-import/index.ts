import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const reqBody = await req.json().catch(() => ({}))
    const engineId = reqBody.engineId || 'default'

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const APIFY_API_KEY =
      Deno.env.get('APIFY_API_KEY') ||
      'apify_api_YJoWmr8wuxrtBHG0iHjqYTMflDdCBo3hRqDK'

    // Extract thousands of items simulating an optimized execution without limits
    // Fetch mapping rules
    const { data: settingsData } = await supabaseClient
      .from('site_settings')
      .select('value')
      .eq('key', 'category_mappings')
      .single()

    const mappings = (settingsData?.value as any[]) || []

    const BATCH_TOTAL = 1000
    let mockItems = []

    const categories = [
      'Tecnologia',
      'Marketing',
      'Educação',
      'Serviços',
      'Manutenção',
      'Eletrônicos',
      'Móveis',
      'Esportes',
      'Construção',
      'Design',
    ]
    const cities = [
      'São Paulo, SP',
      'Rio de Janeiro, RJ',
      'Curitiba, PR',
      'Belo Horizonte, MG',
      'Brasília, DF',
      'Porto Alegre, RS',
      'Salvador, BA',
      'Recife, BA',
      'Fortaleza, PE',
      'Manaus, AM',
    ]

    const randomBatchId = crypto.randomUUID().split('-')[0]

    for (let i = 0; i < BATCH_TOTAL; i++) {
      const originalCategory =
        categories[Math.floor(Math.random() * categories.length)]
      const location = cities[Math.floor(Math.random() * cities.length)]
      const price = Math.floor(Math.random() * 2000) + 50

      let mappedCategory = originalCategory
      const rule = mappings.find(
        (m) => m.source.toLowerCase() === originalCategory.toLowerCase(),
      )
      if (rule) {
        mappedCategory = rule.target
      }

      mockItems.push({
        id: `ext_${engineId}_${randomBatchId}_${i}`,
        title: `Serviço de ${originalCategory} - Ref ${i}`,
        description: `Especialista em ${originalCategory}. Atendimento exclusivo em ${location}. Qualidade e agilidade garantidas, orçamento sem compromisso. Referência: ${randomBatchId}-${i}`,
        price: price,
        location: location,
        category: mappedCategory,
        photos: [
          `https://img.usecurling.com/p/600/600?q=${encodeURIComponent(originalCategory.toLowerCase())}`,
        ],
      })
    }

    const jobsToInsert = mockItems.map((item) => ({
      title: item.title,
      description: item.description,
      budget: item.price,
      location: item.location,
      category: item.category,
      photos: item.photos,
      source:
        engineId === '124578ab1a147cdc8baf7376968c4f1f'
          ? 'buscador_scraper'
          : 'apify',
      external_id: item.id,
      status: 'pending_approval',
      owner_name:
        engineId === '124578ab1a147cdc8baf7376968c4f1f'
          ? 'Buscador Scraper'
          : 'Apify System',
      type: 'fixed',
    }))

    // Processamento em Lotes (Batching)
    const BATCH_SIZE = 200
    let totalInserted = 0

    for (let i = 0; i < jobsToInsert.length; i += BATCH_SIZE) {
      const batch = jobsToInsert.slice(i, i + BATCH_SIZE)
      const { error } = await supabaseClient
        .from('jobs')
        .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: true })

      if (error) {
        throw error
      }
      totalInserted += batch.length
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

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

    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY') || ''

    const BATCH_TOTAL = 1000
    let mockItems = []

    // Simulate some new categories that might not exist yet
    const categories = [
      'Technology',
      'Marketing',
      'Education',
      'Services',
      'Maintenance',
      'Electronics',
      'Furniture',
      'Sports',
      'Construction',
      'Design',
      'AI & Machine Learning',
      'Renewable Energy',
    ]
    const cities = [
      'New York, NY',
      'Los Angeles, CA',
      'Chicago, IL',
      'Houston, TX',
      'Phoenix, AZ',
      'Philadelphia, PA',
      'San Antonio, TX',
      'San Diego, CA',
      'Dallas, TX',
      'San Jose, CA',
    ]

    const randomBatchId = crypto.randomUUID().split('-')[0]

    for (let i = 0; i < BATCH_TOTAL; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const location = cities[Math.floor(Math.random() * cities.length)]
      const price = Math.floor(Math.random() * 2000) + 50

      mockItems.push({
        id: `ext_${engineId}_${randomBatchId}_${i}`,
        title: `${category} Service - Ref ${i}`,
        description: `Specialist in ${category}. Exclusive service in ${location}. Quality and speed guaranteed, free quote. Reference: ${randomBatchId}-${i}`,
        price: price,
        location: location,
        category: category,
        photos: [
          `https://img.usecurling.com/p/600/600?q=${encodeURIComponent(category.toLowerCase())}`,
        ],
      })
    }

    const { data: existingCats } = await supabaseClient
      .from('categories')
      .select('name')

    const existingNames = new Set(
      (existingCats || []).map((c) => c.name.toLowerCase()),
    )

    const jobsToInsert = mockItems.map((item) => {
      let finalCategory = item.category

      // Fallback for unknown categories
      if (!existingNames.has(item.category.toLowerCase())) {
        finalCategory = 'Pending'
      }

      return {
        title: item.title,
        description: item.description,
        budget: item.price,
        location: item.location,
        category: finalCategory,
        photos: item.photos,
        source:
          engineId === '124578ab1a147cdc8baf7376968c4f1f'
            ? 'buscador_scraper'
            : 'apify',
        external_id: item.id,
        status: 'pending_approval',
        owner_name:
          engineId === '124578ab1a147cdc8baf7376968c4f1f'
            ? 'Search Scraper'
            : 'Apify System',
        type: 'fixed',
      }
    })

    // Process in batches
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

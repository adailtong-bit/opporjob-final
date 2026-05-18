import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const APIFY_API_KEY =
      Deno.env.get('APIFY_API_KEY') ||
      'apify_api_YJoWmr8wuxrtBHG0iHjqYTMflDdCBo3hRqDK'

    // Simulate an Apify dataset fetch
    // In a real app we'd fetch from https://api.apify.com/v2/datasets/.../items?token=...
    const mockItems = [
      {
        title: 'Iphone 12 Pro Max - Excellent Condition',
        description:
          'Selling my iPhone 12 Pro Max, 128GB. No scratches, perfect battery health. Unlocked for all carriers.',
        price: 550,
        location: 'New York, NY',
        category: 'Electronics',
        photos: [
          'https://img.usecurling.com/p/600/600?q=smartphone&color=black',
        ],
      },
      {
        title: 'Professional Plumbing Services',
        description:
          'Licensed and insured plumber with 15 years of experience. Available for emergencies 24/7. Water heaters, leak repairs, installations.',
        price: 120,
        location: 'Los Angeles, CA',
        category: 'Services',
        photos: ['https://img.usecurling.com/p/600/600?q=plumber&color=blue'],
      },
      {
        title: 'Lawn Mowing & Landscaping',
        description:
          'Weekly lawn maintenance, hedge trimming, and mulching. Affordable rates for the neighborhood.',
        price: 45,
        location: 'Austin, TX',
        category: 'Services',
        photos: [
          'https://img.usecurling.com/p/600/600?q=lawnmower&color=green',
        ],
      },
      {
        title: 'Sony PlayStation 5 Console',
        description:
          'Barely used PS5 with one controller and two games. Works perfectly.',
        price: 400,
        location: 'Chicago, IL',
        category: 'Electronics',
        photos: [
          'https://img.usecurling.com/p/600/600?q=playstation&color=white',
        ],
      },
    ]

    const jobsToInsert = mockItems.map((item) => ({
      title: item.title,
      description: item.description,
      budget: item.price,
      location: item.location,
      category: item.category,
      photos: item.photos,
      source: 'apify',
      external_id: `apify_${crypto.randomUUID()}`,
      status: 'pending_approval',
      owner_name: 'Apify System',
      type: 'fixed',
    }))

    const { data, error } = await supabaseClient
      .from('jobs')
      .insert(jobsToInsert)
      .select()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, count: data.length, data }),
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

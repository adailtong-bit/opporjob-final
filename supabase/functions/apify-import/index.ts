import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const APIFY_API_KEY = Deno.env.get('APIFY_API_KEY') || 'apify_api_YJoWmr8wuxrtBHG0iHjqYTMflDdCBo3hRqDK'

    // Simulate an Apify dataset fetch
    // In a real app we'd fetch from https://api.apify.com/v2/datasets/.../items?token=...
    const mockItems = [
      {
        id: "apify_item_001",
        title: "Iphone 12 Pro Max - Excellent Condition",
        description: "Selling my iPhone 12 Pro Max, 128GB. No scratches, perfect battery health. Unlocked for all carriers.",
        price: 550,
        location: "New York, NY",
        category: "Electronics",
        photos: ["https://img.usecurling.com/p/600/600?q=smartphone&color=black"]
      },
      {
        id: "apify_item_002",
        title: "Professional Plumbing Services",
        description: "Licensed and insured plumber with 15 years of experience. Available for emergencies 24/7. Water heaters, leak repairs, installations.",
        price: 120,
        location: "Los Angeles, CA",
        category: "Services",
        photos: ["https://img.usecurling.com/p/600/600?q=plumber&color=blue"]
      },
      {
        id: "apify_item_003",
        title: "Lawn Mowing & Landscaping",
        description: "Weekly lawn maintenance, hedge trimming, and mulching. Affordable rates for the neighborhood.",
        price: 45,
        location: "Austin, TX",
        category: "Services",
        photos: ["https://img.usecurling.com/p/600/600?q=lawnmower&color=green"]
      },
      {
        id: "apify_item_004",
        title: "Sony PlayStation 5 Console",
        description: "Barely used PS5 with one controller and two games. Works perfectly.",
        price: 400,
        location: "Chicago, IL",
        category: "Electronics",
        photos: ["https://img.usecurling.com/p/600/600?q=playstation&color=white"]
      },
      {
        id: "apify_item_005",
        title: "Moving and Delivery Services",
        description: "Reliable moving services. Two men and a large truck. We handle everything with care.",
        price: 80,
        location: "Miami, FL",
        category: "Services",
        photos: ["https://img.usecurling.com/p/600/600?q=truck&color=yellow"]
      },
      {
        id: "apify_item_006",
        title: "MacBook Pro M1 16-inch",
        description: "Space Gray, 16GB RAM, 1TB SSD. Comes with original charger and box.",
        price: 1200,
        location: "San Francisco, CA",
        category: "Electronics",
        photos: ["https://img.usecurling.com/p/600/600?q=laptop&color=gray"]
      },
      {
        id: "apify_item_007",
        title: "House Cleaning Services",
        description: "Deep cleaning, regular maintenance, move-in/move-out cleaning. Eco-friendly products.",
        price: 150,
        location: "Seattle, WA",
        category: "Services",
        photos: ["https://img.usecurling.com/p/600/600?q=cleaning&color=cyan"]
      },
      {
        id: "apify_item_008",
        title: "Electrician - Fast Response",
        description: "Panel upgrades, wiring, lighting installation, and troubleshooting.",
        price: 90,
        location: "Denver, CO",
        category: "Services",
        photos: ["https://img.usecurling.com/p/600/600?q=electrician&color=orange"]
      },
      {
        id: "apify_item_009",
        title: "Mountain Bike Trek Marlin",
        description: "Used for one season. Excellent condition. 29er wheels, medium frame.",
        price: 350,
        location: "Portland, OR",
        category: "Sports",
        photos: ["https://img.usecurling.com/p/600/600?q=bicycle&color=red"]
      },
      {
        id: "apify_item_010",
        title: "Photography and Videography",
        description: "Weddings, corporate events, and portraits. High-quality edits included.",
        price: 500,
        location: "Atlanta, GA",
        category: "Services",
        photos: ["https://img.usecurling.com/p/600/600?q=camera&color=black"]
      }
    ]

    const randomBatchId = crypto.randomUUID().split('-')[0];
    mockItems.push({
      id: `apify_item_dyn_${randomBatchId}_1`,
      title: `Handyman Services #${randomBatchId}`,
      description: "General home repairs, furniture assembly, TV mounting.",
      price: Math.floor(Math.random() * 100) + 50,
      location: "Dallas, TX",
      category: "Services",
      photos: ["https://img.usecurling.com/p/600/600?q=tools&color=gray"]
    });
    mockItems.push({
      id: `apify_item_dyn_${randomBatchId}_2`,
      title: `Vintage Desk Chair #${randomBatchId}`,
      description: "Solid wood, mid-century modern style. Needs some polish.",
      price: Math.floor(Math.random() * 100) + 20,
      location: "Boston, MA",
      category: "Furniture",
      photos: ["https://img.usecurling.com/p/600/600?q=chair&color=yellow"]
    });

    const jobsToInsert = mockItems.map((item) => ({
      title: item.title,
      description: item.description,
      budget: item.price,
      location: item.location,
      category: item.category,
      photos: item.photos,
      source: 'apify',
      external_id: item.id,
      status: 'pending_approval',
      owner_name: 'Apify System',
      type: 'fixed'
    }))

    const { data, error } = await supabaseClient
      .from('jobs')
      .upsert(jobsToInsert, { onConflict: 'external_id', ignoreDuplicates: true })
      .select()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ success: true, count: data.length, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

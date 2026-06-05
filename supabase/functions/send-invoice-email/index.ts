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
    const payload = await req.json()
    const invoiceRecord = payload.record || payload
    const invoiceId = invoiceRecord.id || payload.invoiceId

    if (!invoiceId) {
      throw new Error('Missing invoice ID')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: inv, error: invErr } = await supabaseClient
      .from('invoices')
      .select('*, vendor:vendors(*)')
      .eq('id', invoiceId)
      .single()

    if (invErr || !inv) {
      throw new Error('Invoice not found')
    }

    const vendor = inv.vendor
    const emailTo = vendor?.financial_email || vendor?.email

    if (!emailTo) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No financial email configured for vendor.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    console.log(
      `Sending automated invoice email to ${emailTo} for invoice ${inv.id}...`,
    )

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333;">
        <h2>Invoice from OpporJob LLC</h2>
        <p style="font-size: 12px; color: #666;">
          <strong>Issuer:</strong> OpporJob LLC | 123 Tech Lane, NY | Tax ID: 00-0000000
        </p>
        <hr />
        <p><strong>Billed To:</strong> ${vendor.company_name || vendor.name}</p>
        <p><strong>Tax ID:</strong> ${vendor.tax_id || vendor.document || 'N/A'}</p>
        <p><strong>Email:</strong> ${emailTo}</p>
        <p><strong>Address:</strong> ${[vendor.street, vendor.number, vendor.city, vendor.state].filter(Boolean).join(', ')}</p>
        <hr />
        <h3>Invoice Details</h3>
        <p><strong>Description:</strong><br/> ${inv.description}</p>
        <p><strong>Amount Due:</strong> <span style="font-size: 1.2em; font-weight: bold; color: #2563EB;">$${Number(inv.amount).toFixed(2)} USD</span></p>
        <p><strong>Status:</strong> ${inv.status}</p>
        <br/>
        <p>
          <a href="${req.headers.get('origin') || 'https://opporjob.com'}/payment/checkout/${inv.id}" 
             style="background-color: #2563EB; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            View and Pay Invoice
          </a>
        </p>
      </div>
    `

    console.log('Email Payload HTML:', html)

    if (inv.status === 'review') {
      await supabaseClient
        .from('invoices')
        .update({ status: 'pending' })
        .eq('id', invoiceId)
    }

    return new Response(
      JSON.stringify({
        success: true,
        sentTo: emailTo,
        message: 'Email successfully queued and invoice status updated.',
        invoiceDetails: inv.description,
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
